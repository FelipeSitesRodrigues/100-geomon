// Apaga os dígitos do visor do medidor de espessura (foto do PDF da Geomon): cada linha da área
// vira uma reta de cor entre a borda esquerda e a direita do LCD, com a cor de cada borda tirada
// da média de 8 px e suavizada em 15 linhas (sem isso o ruído vira listra). O número entra no
// HTML, na fonte de 7 segmentos, e conta de 0,00 até 0,97 (pedido do Wilton).
// Uso: node scripts/apagar-visor.mjs → insumos/medidor-limpo.jpg
import sharp from 'sharp'
const ORIGEM = '../0100 - Geomon/anexo ChatGPT/17 - foto medidor de espessura.jpg'
const AREA = { x0: 0.535, x1: 0.67, y0: 0.318, y1: 0.395 }
const { data, info } = await sharp(ORIGEM).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const W = info.width, H = info.height
const x0 = Math.round(W * AREA.x0), x1 = Math.round(W * AREA.x1), y0 = Math.round(H * AREA.y0), y1 = Math.round(H * AREA.y1)
const px = (x, y, c) => data[(y * W + x) * 3 + c]
const faixa = (xIni, y, c) => { let s = 0; for (let k = 0; k < 8; k++) s += px(xIni + k, y, c); return s / 8 }
const borda = (xIni) => {
  const bruta = []
  for (let y = y0; y <= y1; y++) bruta.push([0, 1, 2].map((c) => faixa(xIni, y, c)))
  return bruta.map((_, i) => [0, 1, 2].map((c) => {
    let s = 0, n = 0
    for (let j = Math.max(0, i - 7); j <= Math.min(bruta.length - 1, i + 7); j++) { s += bruta[j][c]; n++ }
    return s / n
  }))
}
const esq = borda(x0 - 10), dir = borda(x1 + 2)
for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
  const t = (x - x0) / (x1 - x0)
  for (let c = 0; c < 3; c++) data[(y * W + x) * 3 + c] = Math.round(esq[y - y0][c] * (1 - t) + dir[y - y0][c] * t)
}
await sharp(data, { raw: { width: W, height: H, channels: 3 } }).blur(0.6).jpeg({ quality: 95 }).toFile('insumos/medidor-limpo.jpg')
console.log('ok insumos/medidor-limpo.jpg', W, H)
