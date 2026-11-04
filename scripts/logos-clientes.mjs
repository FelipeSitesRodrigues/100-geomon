// Logos dos clientes em cor (página 7 do PDF da Geomon, renderizada a 300 dpi em
// insumos/clientes-300.png). O fundo branco vira alfa, tirando o branco de cada pixel: sobre a
// placa branca do carrossel o logo sai idêntico ao do PDF, sem halo na borda.
// Uso: node scripts/logos-clientes.mjs  → insumos/logos/<nome>.png
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
const K = 300 / 110 // as caixas foram medidas na página a 110 dpi
const CAIXAS = {
  inpasa: [140, 315, 280, 85],
  slc: [508, 285, 162, 150],
  franciosi: [760, 325, 425, 72],
  gees: [155, 510, 185, 185],
  horizonte: [475, 550, 225, 140],
  hs: [828, 580, 305, 85],
}
mkdirSync('insumos/logos', { recursive: true })
for (const [nome, [x, y, w, h]] of Object.entries(CAIXAS)) {
  const { data, info } = await sharp('insumos/clientes-300.png')
    .extract({ left: Math.round(x * K), top: Math.round(y * K), width: Math.round(w * K), height: Math.round(h * K) })
    .removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const out = Buffer.alloc(info.width * info.height * 4)
  let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0
  for (let i = 0, o = 0, p = 0; i < data.length; i += 3, o += 4, p++) {
    const a = 1 - Math.min(data[i], data[i + 1], data[i + 2]) / 255
    if (a < 0.03) continue // ruído do branco do PDF: fica transparente, com RGB zerado
    for (let c = 0; c < 3; c++) out[o + c] = Math.round((data[i + c] - 255 * (1 - a)) / a)
    out[o + 3] = Math.round(a * 255)
    if (a > 0.08) {
      const px = p % info.width, py = Math.floor(p / info.width)
      x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py)
    }
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 })
    .png().toFile(`insumos/logos/${nome}.png`)
  console.log('ok', nome, x1 - x0 + 1, y1 - y0 + 1)
}
