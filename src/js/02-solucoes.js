// Cartões de soluções: as fotos de cada cartão trocam sozinhas, uma por vez (pedido do Wilton,
// 2026-11-10). Só com a seção na tela e a aba aberta; cada cartão defasado do outro, pra nunca
// trocarem juntos. A próxima foto só entra depois de carregada. Movimento reduzido: fica na 1ª.
;(() => {
  const grupos = [...document.querySelectorAll('[data-troca]')]
  if (!grupos.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const PASSO = 5200
  let relogios = []
  const pronta = (pic) => { const img = pic.querySelector('img'); return img && img.complete && img.naturalWidth > 0 }
  const iniciar = () => {
    if (relogios.length) return
    grupos.forEach((g, n) => {
      const fotos = [...g.querySelectorAll('picture')]
      fotos.forEach((p) => { const img = p.querySelector('img'); if (img) img.loading = 'eager' })
      let i = Math.max(0, fotos.findIndex((p) => p.classList.contains('ativa')))
      fotos[i].classList.add('ativa')
      const trocar = () => {
        const prox = (i + 1) % fotos.length
        if (!pronta(fotos[prox])) return
        fotos[i].classList.remove('ativa')
        fotos[prox].classList.add('ativa')
        i = prox
      }
      const t = setTimeout(() => { trocar(); relogios.push(setInterval(trocar, PASSO)) }, PASSO * 0.6 + n * 1700)
      relogios.push(t)
    })
  }
  const parar = () => { relogios.forEach((r) => { clearTimeout(r); clearInterval(r) }); relogios = [] }
  const secao = grupos[0].closest('section')
  let visivel = false
  const avaliar = () => (visivel && !document.hidden ? iniciar() : parar())
  document.addEventListener('visibilitychange', avaliar)
  if (!('IntersectionObserver' in window)) { visivel = true; return avaliar() }
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; avaliar() }, { rootMargin: '200px' }).observe(secao)
})()
