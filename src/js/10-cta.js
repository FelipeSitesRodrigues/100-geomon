// Vídeo do CTA: a capa é o 1º quadro, então o vídeo entra sem salto quando começa a tocar. Só
// baixa perto da seção (na versão em pé no celular) e para fora da tela. Movimento reduzido ou
// economia de dados: fica a capa parada.
;(() => {
  const video = document.querySelector('.cta__video')
  if (!video || !('IntersectionObserver' in window)) return
  const conexao = navigator.connection || {}
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || conexao.saveData || /2g/.test(conexao.effectiveType || '')) return
  const tocar = () => video.play().catch(() => {})
  let naTela = false
  const perto = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return
    perto.disconnect()
    video.preload = 'auto'
    video.src = matchMedia('(max-width: 47.99em)').matches ? video.dataset.srcCelular : video.dataset.srcGrande
    video.addEventListener('playing', () => video.classList.add('tocando'), { once: true })
    video.addEventListener('canplay', () => { if (naTela) tocar() }, { once: true })
  }, { rootMargin: '800px' })
  perto.observe(video)
  new IntersectionObserver(([e]) => {
    naTela = e.isIntersecting
    if (!video.src) return
    if (naTela) tocar()
    else video.pause()
  }).observe(video)
})()
