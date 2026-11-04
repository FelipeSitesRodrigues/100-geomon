// Visor do medidor: conta de 0.00 até a espessura medida (0.97 mm) quando o medidor aparece,
// como um micrômetro de verdade fechando na manta (pedido do Wilton). O HTML já traz 0.97:
// sem JS ou com movimento reduzido o número está lá.
;(() => {
  const valor = document.querySelector('.visor__valor')
  const medidor = document.querySelector('[data-medidor]')
  if (!valor || !medidor || !('IntersectionObserver' in window)) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const alvo = Number(valor.dataset.alvo)
  valor.textContent = '0.00'
  const contar = () => {
    const inicio = performance.now()
    const quadro = (agora) => {
      const t = Math.min(1, (agora - inicio) / 1800)
      valor.textContent = (alvo * (1 - Math.pow(1 - t, 4))).toFixed(2)
      if (t < 1) requestAnimationFrame(quadro)
    }
    requestAnimationFrame(quadro)
  }
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return
    io.disconnect()
    setTimeout(contar, 450)
  }, { threshold: 0.55 })
  io.observe(medidor)
})()
