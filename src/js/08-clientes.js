// Carrossel de logos: o lazy do navegador conta o corte da faixa e só pediria o logo quando ele
// entrasse pela lateral, chegando em branco. Perto da seção, todos passam a carregar.
;(() => {
  const marcas = document.querySelector('[data-marcas]')
  if (!marcas) return
  const carregar = () => marcas.querySelectorAll('img').forEach((img) => { img.loading = 'eager' })
  if (!('IntersectionObserver' in window)) return carregar()
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return
    io.disconnect()
    carregar()
  }, { rootMargin: '800px' })
  io.observe(marcas)
})()
