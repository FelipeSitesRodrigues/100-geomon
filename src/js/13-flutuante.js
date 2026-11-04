// WhatsApp flutuante: aparece depois que o hero sai da tela e some com o CTA final na tela
// (lá já tem o botão grande).
;(() => {
  const botao = document.querySelector('[data-flutuante]')
  const hero = document.querySelector('.hero')
  const cta = document.querySelector('.cta')
  if (!botao || !hero || !('IntersectionObserver' in window)) return
  const visto = { hero: true, cta: false }
  const atualizar = () => botao.classList.toggle('ativo', !visto.hero && !visto.cta)
  new IntersectionObserver(([e]) => { visto.hero = e.isIntersecting; atualizar() }).observe(hero)
  if (cta) new IntersectionObserver(([e]) => { visto.cta = e.isIntersecting; atualizar() }, { threshold: 0.35 }).observe(cta)
})()
