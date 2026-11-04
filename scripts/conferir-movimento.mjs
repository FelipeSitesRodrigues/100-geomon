// Confere o que o print com movimento reduzido não mostra: o vídeo do hero tocando (e a capa
// trocando por ele), o visor do medidor contando até 0.97 e a linha do processo acendendo os 5
// passos. Também mede estouro de largura no celular. Precisa do servidor (npm run serve).
// Uso: node scripts/conferir-movimento.mjs [largura]
import puppeteer from 'puppeteer-core'
const largura = Number(process.argv[2] || 1440)
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new', args: ['--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage()
await p.setViewport({ width: largura, height: largura < 600 ? 844 : 900, deviceScaleFactor: 1, isMobile: largura < 600, hasTouch: largura < 600 })
await p.goto('http://localhost:3410/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3500))
const video = await p.evaluate(() => {
  const v = document.querySelector('.hero__video')
  return { src: v.currentSrc.split('/').pop(), tocando: v.classList.contains('tocando'), tempo: +v.currentTime.toFixed(2), largura: v.videoWidth }
})
const rolarAte = async (sel, fracao = 0.4) => {
  await p.evaluate((s, f) => {
    const el = document.querySelector(s)
    scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * f)
  }, sel, fracao)
}
await rolarAte('[data-medidor]', 0.15)
const visor = []
for (let i = 0; i < 6; i++) {
  visor.push(await p.evaluate(() => document.querySelector('.visor__valor').textContent))
  await new Promise((r) => setTimeout(r, 450))
}
const processo = []
const alturaTrilha = await p.evaluate(() => document.querySelector('.trilha').getBoundingClientRect().height)
for (let f = 0; f <= 1.0001; f += 0.25) {
  await p.evaluate((f, h) => {
    const t = document.querySelector('.trilha')
    scrollTo(0, t.getBoundingClientRect().top + scrollY - innerHeight * 0.62 + h * f)
  }, f, alturaTrilha)
  await new Promise((r) => setTimeout(r, 400))
  processo.push(await p.evaluate(() => ({ l: getComputedStyle(document.querySelector('[data-processo]')).getPropertyValue('--l'), acesos: document.querySelectorAll('.passo--aceso').length })))
}
const estouro = await p.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth }))
console.log(JSON.stringify({ largura, video, visor, processo, estouro }, null, 1))
await b.close()
