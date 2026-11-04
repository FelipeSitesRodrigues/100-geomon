// Cena do "Desde 2019": a foto assenta, o ano sobe por trás das cabeças da equipe e o fio desce.
// Solta quando o ano já está bem dentro da tela; o IO geral do kit (5% da seção) soltaria a
// animação com o ano ainda fora da vista. Sem IO, a cena aparece pronta.
;(() => {
  const secao = document.querySelector('.sobre')
  const ano = secao && secao.querySelector('.sobre__ano')
  if (!ano) return
  if (!('IntersectionObserver' in window)) return secao.classList.add('sobre--viva')
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return
    io.disconnect()
    secao.classList.add('sobre--viva')
  }, { threshold: 0.6 })
  io.observe(ano)
})()
