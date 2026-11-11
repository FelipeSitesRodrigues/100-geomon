// Logo da ProRec pro crédito do rodapé (fundo verde-escuro): o fundo branco vira transparente
// (alfa pela distância até o branco, cor desmisturada) e o cinza escuro do "PRO" e do
// "PRODUTORA" vira branco; o laranja e o vermelho ficam. Uso: node scripts/logo-prorec.mjs
import sharp from 'sharp'
const { data, info } = await sharp('insumos/logo-prorec.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true })
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
  const a = 1 - Math.min(r, g, b) / 255
  if (a < 0.04) { data[i + 3] = 0; continue }
  let c = [r, g, b].map((v) => Math.max(0, Math.min(255, (v - 255 * (1 - a)) / a)))
  let alfa = a
  if (Math.max(...c) - Math.min(...c) < 60) {
    alfa = Math.min(1, a / 0.78) // o cinza era #333: sem isso o branco sai a 80%
    // a sombra escura onde os dois triângulos se cruzam (perto de 560,570) vira o vermelho do traço
    const x = (i / 4) % info.width, y = Math.floor(i / 4 / info.width)
    c = x > 520 && x < 610 && y > 545 && y < 600 ? [236, 66, 52] : [255, 255, 255]
  }
  data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = Math.round(alfa * 255)
}
const buf = await sharp(data, { raw: info }).png().toBuffer()
const recortado = await sharp(buf).trim({ threshold: 1 }).toBuffer()
await sharp(recortado).png().toFile('insumos/logo-prorec-branco.png')
console.log('insumos/logo-prorec-branco.png (o processar-imagens.mjs faz a webp)')
