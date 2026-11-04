/**
 * Imagens do site em src/assets/img, em AVIF e WebP e em várias larguras pra srcset, com o
 * manifesto.json (largura, altura e peso de cada arquivo, pro width/height do <img>). Base do 000.
 *
 * Só fotos reais da Geomon (decisão do Felipe em 2026-11-01: as pessoas e obras dos mockups do
 * ChatGPT são inventadas). Origens:
 * - ../0100 - Geomon/MATERIAL: fotos do portfólio, PDF e vídeos do Wilton
 * - insumos/quadros: quadros tirados dos vídeos com ffmpeg e a capa do vídeo do hero (video-hero.mjs)
 * - insumos/: recorte da equipe e dos selos (recortar.mjs), logos (logos-clientes.mjs), medidor
 *   sem os dígitos (apagar-visor.mjs), logo branca (do PDF a 600 dpi)
 *
 * Tom de fim de tarde (dourado) nas fotos de dia, pra casar com o vídeo do hero e com os mockups.
 * Uso: node scripts/processar-imagens.mjs   (depois: node build.mjs)
 */
import sharp from 'sharp'
import { mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import path from 'node:path'

const M = '../0100 - Geomon/MATERIAL'
const PF = `${M}/Portifólio Geomon`
const A = '../0100 - Geomon/anexo ChatGPT'
const Q = 'insumos/quadros'
const OUT = 'src/assets/img'
mkdirSync(OUT, { recursive: true })
for (const f of readdirSync(OUT)) rmSync(path.join(OUT, f), { recursive: true, force: true })
const manifesto = {}

async function gravar(pipeline, nome) {
  const info = await pipeline.toFile(path.join(OUT, nome))
  manifesto[nome] = { w: info.width, h: info.height, kb: Math.round(info.size / 1024) }
}

// tom de fim de tarde: puxa o vermelho, tira um pouco do azul, satura e dá contraste
const OURO = [[1.09, 0.06, 0], [0.02, 1.0, 0], [0, 0.02, 0.85]]
async function preparar(origem, { corte, dourado = true, alfa = false } = {}) {
  let buf = await sharp(origem).rotate().toBuffer()
  if (corte) {
    const meta = await sharp(buf).metadata()
    buf = await sharp(buf).extract({
      left: Math.round(meta.width * corte[0]), top: Math.round(meta.height * corte[1]),
      width: Math.round(meta.width * corte[2]), height: Math.round(meta.height * corte[3]),
    }).toBuffer()
  }
  if (!dourado) return buf
  // o sharp não segue a ordem das chamadas (memória sharp-removealpha-ordem): cada passo num buffer
  const m = alfa ? OURO.map((l) => [...l, 0]).concat([[0, 0, 0, 1]]) : OURO
  buf = await sharp(buf).recomb(m).toBuffer()
  return sharp(buf).modulate({ saturation: 1.1 }).linear(1.05, -5).toBuffer()
}

// uma imagem em várias larguras, AVIF e WebP
async function variantes(nome, origem, larguras, op = {}) {
  const buf = await preparar(origem, op)
  const { width } = await sharp(buf).metadata()
  for (const w of larguras) {
    if (w > width * 1.02) continue
    for (const f of ['avif', 'webp']) {
      let p = sharp(buf).resize({ width: w, kernel: 'lanczos3' })
      p = f === 'avif'
        ? p.avif({ quality: op.alfa ? 62 : 50, effort: 7, chromaSubsampling: op.alfa ? '4:4:4' : '4:2:0' })
        : p.webp({ quality: op.alfa ? 86 : 74, alphaQuality: 90, effort: 6, smartSubsample: true })
      await gravar(p, `${nome}-${w}.${f}`)
    }
  }
  console.log(nome.padEnd(22), larguras.join(', '))
}

// ---------------------------------------------------------------- hero
// capas dos vídeos do hero e do CTA (1º quadro de cada um, já no tom do vídeo; video-cta.mjs)
await variantes('hero-capa', `${Q}/hero-capa.png`, [854, 1280], { dourado: false })
await variantes('cta', `${Q}/cta-capa.png`, [854, 1280, 1600], { dourado: false })
await variantes('cta-celular', `${Q}/cta-capa-celular.png`, [540], { dourado: false })

// ---------------------------------------------------------------- sobre: equipe e o recorte das pessoas
// Foto inteira, de fundo da seção, sem o tom dourado (o mockup tem o céu azul). O recorte vai
// por cima do "Desde 2019" e só a metade de cima dele importa (as cabeças): o resto vira
// transparente e quase não pesa. Mesmo tamanho da foto, pra cair em cima dela.
{
  const { data, info } = await sharp('insumos/equipe-recorte.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  data.fill(0, Math.round(info.height * 0.52) * info.width * 4)
  await sharp(data, { raw: info }).png().toFile('insumos/equipe-recorte-topo.png')
}
await variantes('equipe', 'insumos/equipe.jpg', [800, 1200, 1600], { dourado: false })
await variantes('equipe-recorte', 'insumos/equipe-recorte-topo.png', [800, 1200, 1600], { dourado: false, alfa: true })

// ---------------------------------------------------------------- soluções
// cartões em pé (4:5): a foto ocupa o cartão inteiro e o texto fica no vidro escuro de baixo
await variantes('solucao-reservatorio', `${Q}/solucao-reservatorio.jpg`, [480, 640, 880], { corte: [0.27, 0, 0.45, 1] })
await variantes('solucao-canal', `${M}/DJI_0434.JPG`, [480, 640, 880], { corte: [0.3, 0, 0.45, 1] })
await variantes('solucao-tanque', `${PF}/Tanque de Peixe.png`, [480, 640, 880], { corte: [0.32, 0, 0.6, 1] })

// ---------------------------------------------------------------- a prova está na solda
// a foto da lâmina do PDF era mole e com véu branco: a mesma foto foi restaurada no ChatGPT
// (2026-11-01) e depois estendida pros lados (2026-11-02, os braços vinham cortados pela borda),
// sempre conferida lado a lado com a original: a lâmina não mudou. Recorte sem o fundo:
// node scripts/recortar.mjs ".../4 - resultado ChatGPT lamina estendida.png" insumos/lamina-recorte-estendida.png
// node scripts/limpar-recorte.mjs insumos/lamina-recorte-estendida.png insumos/lamina-recorte-limpo.png 548,70,155,70
await variantes('lamina-recorte', 'insumos/lamina-recorte-limpo.png', [640, 900, 1120], { dourado: false, alfa: true, corte: [0.09, 0, 0.894, 1] })
await variantes('passo-solda', `${A}/11 - quadro soldadora de cunha.jpg`, [320, 560])
await variantes('passo-ar', `${A}/12 - quadro teste de ar.jpg`, [320, 560])
await variantes('passo-tensiometro', `${A}/13 - quadro tensiometro.jpg`, [320, 560], { corte: [0, 0.22, 1, 0.56] })

// ---------------------------------------------------------------- certificação e diferenciais
// CWT: o quadro real do técnico soldando (vídeo em pé, 15 no anexo) estendido pros lados no
// ChatGPT, com a luz de fim de tarde e o lado esquerdo escuro pro texto (2026-11-02, conferido
// com o quadro: mesmo técnico, mesma pose, mesma soldadora 124). Fundo da seção inteira.
await variantes('cwt-fundo', `${A}/18 - resultado ChatGPT fundo CWT.png`, [768, 1152, 1536], { dourado: false })
// selo CWT em 3D: o selo real (4 no anexo) refeito como medalha no ChatGPT, textos conferidos letra
// por letra (19 no anexo, já veio transparente; insumos/selo-cwt-3d.png é ele sem a sobra)
await variantes('selo-cwt', 'insumos/selo-cwt-3d.png', [240, 480], { dourado: false, alfa: true })
await variantes('selo-nortene', 'insumos/selo-nortene.png', [160, 320], { dourado: false, alfa: true })
// diferenciais: o fundo é a maleta verde do medidor desfocada, sem a mão e sem o aparelho, em
// 16:9 (ChatGPT a partir da foto real, 21 no anexo), escura à direita, onde fica o texto. O medidor
// vem recortado por cima pra entrar animado: refeito no ChatGPT com a mão pela esquerda e o visor
// vazio (22 no anexo, já transparente; conferido com a foto real: mostrador, botões, escalas e a
// tira iguais). O número do visor é texto.
await variantes('dif-fundo', `${A}/21 - resultado ChatGPT fundo diferenciais 16x9.png`, [836, 1254, 1672], { dourado: false })
await variantes('medidor-recorte', `${A}/22 - resultado ChatGPT medidor mao esquerda.png`, [560, 900, 1200], { dourado: false, alfa: true, corte: [0, 50 / 1254, 1200 / 1254, 1204 / 1254] })

// ---------------------------------------------------------------- alojamento
await variantes('alojamento', `${Q}/alojamento.jpg`, [960, 1600, 2240], { corte: [0.02, 0.12, 0.96, 0.78] })
await variantes('alojamento-cima', `${Q}/alojamento-cima.jpg`, [400, 640], { corte: [0.2, 0.22, 0.6, 0.62] })

// ---------------------------------------------------------------- escala (galeria) e clientes
await variantes('obra-redondo', `${PF}/DJI_20260812113223_0061_D.png`, [900, 1400], { corte: [0.08, 0, 0.9, 1] })
await variantes('obra-pivos', `${Q}/obra-pivos.jpg`, [600, 900], { corte: [0, 0.1, 1, 0.9] })
await variantes('obra-canal', `${Q}/obra-canal.jpg`, [600, 900])
for (const n of ['inpasa', 'slc', 'franciosi', 'gees', 'horizonte', 'hs']) {
  const buf = await sharp(`insumos/logos/${n}.png`).resize({ width: 560, height: 300, fit: 'inside', withoutEnlargement: true }).png().toBuffer()
  const { width } = await sharp(buf).metadata()
  await gravar(sharp(buf).webp({ quality: 82, alphaQuality: 90 }), `logo-${n}-${width}.webp`)
}

// ---------------------------------------------------------------- como funciona
await variantes('proc-visita', `${PF}/WhatsApp Image 2026-09-28 at 19.56.00 (2).jpeg`, [360, 640], { corte: [0.16, 0.06, 0.74, 0.94] })
await variantes('proc-carreta', `${Q}/processo-carreta.jpg`, [360, 640], { corte: [0.1, 0.22, 0.62, 0.6] })
await variantes('proc-instalacao', `${PF}/WhatsApp Image 2026-09-28 at 19.55.59 (1).jpeg`, [360, 640])
await variantes('proc-entrega', `${PF}/DJI_20260812113223_0061_D.png`, [360, 640], { corte: [0.3, 0.1, 0.62, 0.74] })

// ---------------------------------------------------------------- marca
await gravar(sharp('insumos/logo-branco.png').resize({ width: 480 }).webp({ quality: 92, alphaQuality: 95 }), 'logo-480.webp')
await gravar(sharp(`${Q}/hero-capa.png`).resize(1200, 630, { fit: 'cover', position: 'right' }).jpeg({ quality: 82, mozjpeg: true }), 'og.jpg')

writeFileSync(path.join(OUT, 'manifesto.json'), JSON.stringify(manifesto, null, 1))
const total = Object.values(manifesto).reduce((a, m) => a + m.kb, 0)
console.log(`ok ${Object.keys(manifesto).length} arquivos, ${total} KB`)
