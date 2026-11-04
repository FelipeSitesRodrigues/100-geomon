// Como funciona: a linha dupla em "S" é montada a partir da posição das bolas (se adapta a
// qualquer largura) e se desenha conforme a página rola: --l vai de 0 a 1 enquanto a trilha
// passa pela linha de 62% da tela. Cada passo acende quando a linha chega na bola dele.
// No celular a linha é vertical (CSS) e o mesmo --l faz ela crescer.
;(() => {
  const sec = document.querySelector('[data-processo]')
  if (!sec) return
  const trilha = sec.querySelector('.trilha')
  const svg = sec.querySelector('.trilha__linha')
  const caminhos = [...svg.querySelectorAll('path')]
  const passos = [...sec.querySelectorAll('.passo')]
  const mesa = matchMedia('(min-width: 64em)')
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)')
  let marcos = passos.map(() => 0)
  let ultimo = -1
  let raf = 0

  const centro = (el, base) => {
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top }
  }
  const montar = () => {
    const base = trilha.getBoundingClientRect()
    const c = passos.map((p) => centro(p.querySelector('.passo__num'), base))
    if (!mesa.matches) {
      // celular: a fração de cada passo é a altura da bola dentro da lista
      const lista = sec.querySelector('.trilha__passos').getBoundingClientRect()
      marcos = c.map((p) => Math.max(0, (p.y + base.top - lista.top) / lista.height))
      return
    }
    const R = 34
    const folgaD = Math.max(8, Math.min(34, innerWidth - base.right - 10))
    const folgaE = Math.max(8, Math.min(34, base.left - 10))
    const xR = base.width + folgaD
    const xL = -folgaE
    const [p1, p2, p3, p4, p5] = c
    const y1 = p1.y, y2 = p3.y, y3 = p5.y
    const ate = [
      `M${p1.x} ${y1} H${p2.x}`,
      `H${xR - R} Q${xR} ${y1} ${xR} ${y1 + R} V${y2 - R} Q${xR} ${y2} ${xR - R} ${y2} H${p3.x}`,
      `H${p4.x}`,
      `H${xL + R} Q${xL} ${y2} ${xL} ${y2 + R} V${y3 - R} Q${xL} ${y3} ${xL + R} ${y3} H${p5.x}`,
    ]
    const medir = caminhos[0]
    const tamanhos = ate.map((_, i) => {
      medir.setAttribute('d', ate.slice(0, i + 1).join(' '))
      return medir.getTotalLength()
    })
    const total = tamanhos[tamanhos.length - 1]
    marcos = [0, ...tamanhos.map((t) => t / total)]
    const d = ate.join(' ')
    caminhos.forEach((p) => p.setAttribute('d', d))
  }

  const aplicar = (l) => {
    if (Math.abs(l - ultimo) < 0.002) return
    ultimo = l
    sec.style.setProperty('--l', l.toFixed(4))
    let atual = -1
    passos.forEach((p, i) => {
      const aceso = l >= marcos[i] - 0.01
      p.classList.toggle('passo--aceso', aceso)
      if (aceso) atual = i
    })
    passos.forEach((p, i) => p.classList.toggle('passo--atual', i === atual))
  }
  const medirRolagem = () => {
    raf = 0
    if (reduzir.matches) return aplicar(1)
    const r = trilha.getBoundingClientRect()
    aplicar(Math.min(1, Math.max(0, (innerHeight * 0.62 - r.top) / r.height)))
  }
  const pedir = () => raf || (raf = requestAnimationFrame(medirRolagem))
  const refazer = () => {
    montar()
    ultimo = -1
    pedir()
  }

  let ouvindo = false
  const ouvir = (sim) => {
    if (sim === ouvindo) return
    ouvindo = sim
    if (sim) addEventListener('scroll', pedir, { passive: true })
    else removeEventListener('scroll', pedir)
    if (sim) pedir()
  }
  let espera = 0
  addEventListener('resize', () => {
    clearTimeout(espera)
    espera = setTimeout(refazer, 120)
  }, { passive: true })
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refazer)
  addEventListener('load', refazer, { once: true })
  montar()
  aplicar(0)
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => ouvir(e.isIntersecting), { rootMargin: '200px 0px' }).observe(sec)
  else aplicar(1)
})()
