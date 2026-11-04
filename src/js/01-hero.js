// Vídeo do hero: a capa (1º quadro do vídeo) é o LCP; o vídeo só começa a baixar depois que a
// página carrega, na versão leve no celular. Como o 1º quadro é igual à capa, o vídeo entra
// sem salto quando começa a tocar (memória video-aparece-parado). Movimento reduzido ou
// economia de dados: fica a capa parada.
;(() => {
  const video = document.querySelector('.hero__video')
  if (!video) return
  const conexao = navigator.connection || {}
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || conexao.saveData || /2g/.test(conexao.effectiveType || '')) return
  const iniciar = () => {
    video.src = matchMedia('(max-width: 900px)').matches ? video.dataset.srcPequeno : video.dataset.srcGrande
    video.addEventListener('playing', () => video.classList.add('tocando'), { once: true })
    const tentar = () => video.play().catch(() => {})
    video.addEventListener('canplay', tentar, { once: true })
    tentar()
  }
  const depois = () => ('requestIdleCallback' in window ? requestIdleCallback(iniciar, { timeout: 1500 }) : setTimeout(iniciar, 400))
  if (document.readyState === 'complete') depois()
  else addEventListener('load', depois, { once: true })
  // o vídeo para quando sai da tela (não gasta bateria tocando atrás das outras seções)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (!video.src) return
      if (e.isIntersecting) video.play().catch(() => {})
      else video.pause()
    }).observe(video)
  }
})()
