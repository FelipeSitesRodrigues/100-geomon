/**
 * Build da landing page da Geomon. HTML, CSS e JS estático em dist/ (base do 000, portfólio).
 *
 *   node build.mjs                          página inteira em dist/index.html
 *   node build.mjs --preview 01-hero        só aquela seção, em dist/preview/01-hero.html
 *   node build.mjs --publicar               página inteira do zero, sem os previews (antes de subir)
 *
 * Como funciona:
 * - src/index.html é o molde. <!-- @parcial NOME --> puxa src/partials/NOME.html.
 * - CSS: src/css/_*.css primeiro, depois o arquivo de cada seção (mesmo nome do parcial) e
 *   99-*.css por último, minificado num <style>.
 * - Medidas em px no CSS viram rem (1 rem = 16 px). Acima de 1200 px o rem acompanha a largura
 *   (_base.css): a composição é a de 1440 em qualquer tela larga (memória tela-larga-zoom-out).
 *   Fica em px: 1 e 2 px (fio), o que estiver dentro de @media e o que for escrito em
 *   maiúsculas (14PX = px de verdade, de propósito).
 * - JS: mesma regra, em src/js, num <script> no fim do <body>. Cada arquivo é um IIFE.
 * - {{cfg.caminho}} puxa do site.config.json; {{ano}} é o ano atual.
 * - {{wa:texto}} vira o link do WhatsApp com a mensagem pronta (URL-encoded).
 * - <!-- @gerar nome --> chama GERADORES[nome] (os logos dos clientes).
 * - <i data-i="nome" data-w="light" class="..."></i> vira <svg><use> do sprite (Phosphor); o
 *   peso "marca" pega src/svg/<nome>.svg.
 * - <img data-img="nome" sizes="..." alt="..."> vira <picture> com AVIF e WebP em srcset, a
 *   partir de src/assets/img/manifesto.json (npm run imagens). data-preload gera o preload.
 *   data-img-max limita o src de reserva; data-picture põe classe no <picture>.
 * - <!-- @schema --> recebe o JSON-LD (GeneralContractor com área atendida e FAQPage).
 * - Avisa: travessão no texto, img sem alt/width/height, id repetido, âncora sem destino,
 *   marcador que sobrou, CSS com chave desbalanceada e mais de um h1.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync, copyFileSync, renameSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const RAIZ = path.dirname(fileURLToPath(import.meta.url))
const P = (...a) => path.join(RAIZ, ...a)
const DIST = P('dist')
const cfg = JSON.parse(readFileSync(P('site.config.json'), 'utf8'))
const manifesto = existsSync(P('src/assets/img/manifesto.json')) ? JSON.parse(readFileSync(P('src/assets/img/manifesto.json'), 'utf8')) : {}
const dados = (nome) => (existsSync(P('src/dados', `${nome}.json`)) ? JSON.parse(readFileSync(P('src/dados', `${nome}.json`), 'utf8')) : [])
const avisos = []
const PRIMEIRO = '00-header'
const ULTIMO = '12-rodape'

const argPreview = (() => {
  const i = process.argv.indexOf('--preview')
  return i > -1 ? process.argv[i + 1].split(',').map((s) => s.trim()) : null
})()

// ---------------------------------------------------------------- utilidades
function gravar(arq, conteudo) {
  mkdirSync(path.dirname(arq), { recursive: true })
  const tmp = `${arq}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`
  writeFileSync(tmp, conteudo)
  for (let t = 0; t < 20; t++) {
    try {
      renameSync(tmp, arq)
      return
    } catch (e) {
      if (t === 19) throw e
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50)
    }
  }
}

function copiarPasta(de, para) {
  if (!existsSync(de)) return
  mkdirSync(para, { recursive: true })
  for (const nome of readdirSync(de)) {
    if (nome.startsWith('.') || nome === 'manifesto.json') continue
    const a = path.join(de, nome)
    const b = path.join(para, nome)
    const st = statSync(a)
    if (st.isDirectory()) copiarPasta(a, b)
    else if (!existsSync(b) || statSync(b).size !== st.size || statSync(b).mtimeMs < st.mtimeMs) {
      try {
        copyFileSync(a, b)
      } catch {
        /* outro processo copiando o mesmo arquivo */
      }
    }
  }
}

function lerParcial(nome) {
  const arq = P('src/partials', `${nome}.html`)
  if (!existsSync(arq)) {
    avisos.push(`parcial ausente: ${nome}`)
    return `<!-- parcial ${nome} ainda não existe -->`
  }
  return readFileSync(arq, 'utf8')
}

function arquivos(pasta, ext, so = null) {
  if (!existsSync(P(pasta))) return []
  const todos = readdirSync(P(pasta)).filter((f) => f.endsWith(ext))
  const base = todos.filter((f) => f.startsWith('_')).sort()
  const resto = todos.filter((f) => !f.startsWith('_')).sort().filter((f) => !so || so.includes(f.replace(ext, '')) || f.startsWith('99-'))
  return [...base, ...resto]
}

function juntar(pasta, ext, so) {
  return arquivos(pasta, ext, so)
    .map((f) => {
      const c = readFileSync(P(pasta, f), 'utf8')
      if (ext === '.css') {
        const abre = (c.match(/{/g) || []).length
        const fecha = (c.match(/}/g) || []).length
        if (abre !== fecha) avisos.push(`CSS com chaves desbalanceadas: ${f} (${abre} abre, ${fecha} fecha)`)
      }
      return c
    })
    .join(ext === '.js' ? '\n;\n' : '\n')
}

// px do mockup em rem. Não mexe: dentro da condição de @media/@container, 0 a 2 px e PX maiúsculo.
function pxParaRem(css) {
  const guardadas = []
  const semMedia = css.replace(/@(media|container)[^{]+/g, (m) => {
    guardadas.push(m)
    return `@@${guardadas.length - 1}@@`
  })
  const convertido = semMedia.replace(/(-?\d*\.?\d+)px\b/g, (m, n) => {
    const v = Math.abs(Number(n))
    if (v <= 2) return m
    return `${+(Number(n) / 16).toFixed(4)}rem`
  })
  return convertido.replace(/@@(\d+)@@/g, (_, i) => guardadas[i])
}

function minCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};])\s*/g, '$1')
    .replace(/,\s+/g, ',')
    .replace(/;}/g, '}')
    .trim()
}

function minJs(js) {
  return js
    .split('\n')
    .filter((l) => !/^\s*\/\//.test(l))
    .map((l) => l.trim())
    .filter((l) => l !== '')
    .join('\n')
}

function valor(caminho, avisar = true) {
  const v = caminho.split('.').reduce((o, k) => (o == null ? undefined : o[k]), cfg)
  if (v === undefined && avisar) avisos.push(`config sem o caminho: ${caminho}`)
  return v ?? ''
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const wa = (texto) => `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(texto)}`

// ---------------------------------------------------------------- ícones (sprite com <use>)
const usados = new Map()
function icone(nome, peso = 'light', classe = '') {
  const id = `i-${nome}-${peso}`
  if (!usados.has(id)) {
    const marca = peso === 'marca'
    const arq = marca ? P('src/svg', `${nome}.svg`) : P('node_modules/@phosphor-icons/core/assets', peso, `${nome}${peso === 'regular' ? '' : '-' + peso}.svg`)
    if (!existsSync(arq)) {
      avisos.push(`ícone não existe: ${nome} (${peso})`)
      return ''
    }
    const svg = readFileSync(arq, 'utf8')
    const caixa = marca ? (svg.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 256 256' : '0 0 256 256'
    const miolo = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\s+/g, ' ').trim()
    usados.set(id, `<symbol id="${id}" viewBox="${caixa}">${miolo}</symbol>`)
  }
  const cls = ['i', classe].filter(Boolean).join(' ')
  return `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`
}

// ---------------------------------------------------------------- imagens (<picture> com AVIF e WebP)
function versoes(nome, ext) {
  return Object.entries(manifesto)
    .map(([arq, m]) => ({ arq, m, w: Number((arq.match(new RegExp(`^${nome}-(\\d+)\\.${ext}$`)) || [])[1]) }))
    .filter((v) => v.w)
    .sort((a, b) => a.w - b.w)
}
const srcset = (vs) => vs.map((v) => `/assets/img/${v.arq} ${v.m.w}w`).join(', ')
const attr = (s, nome) => (s.match(new RegExp(`\\s${nome}="([^"]*)"`)) || [])[1]
const temAttr = (s, nome) => new RegExp(`\\s${nome}(\\s|=|$)`).test(s)
const semAttr = (s, ...nomes) => nomes.reduce((t, n) => t.replace(new RegExp(`\\s${n}(="[^"]*")?(?=[\\s>/]|$)`, 'g'), ''), s)
const preloads = []

function imagens(html) {
  return html.replace(/<img\b([^>]*?)\sdata-img="([\w-]+)"([^>]*)>/g, (tag, antes, nome, depois) => {
    let attrs = antes + depois
    const sizes = attr(attrs, 'sizes') || '100vw'
    const max = Number(attr(attrs, 'data-img-max') || Infinity)
    const classePicture = attr(attrs, 'data-picture')
    const preload = temAttr(attrs, 'data-preload')
    attrs = semAttr(attrs, 'data-img-max', 'data-picture', 'data-preload', 'sizes')
    const vw = versoes(nome, 'webp')
    const va = versoes(nome, 'avif')
    if (!vw.length) {
      avisos.push(`data-img sem arquivo no manifesto: ${nome}`)
      return tag.replace(/\sdata-img="[\w-]+"/, ' src="data:," width="16" height="9"')
    }
    const fontes = []
    if (va.length) fontes.push(`<source type="image/avif" srcset="${srcset(va)}" sizes="${sizes}">`)
    const principal = [...vw].reverse().find((v) => v.w <= max) || vw[0]
    const img = `<img src="/assets/img/${principal.arq}" srcset="${srcset(vw)}" sizes="${sizes}" width="${principal.m.w}" height="${principal.m.h}"${attrs}>`
    if (preload) {
      const lista = va.length ? va : vw
      preloads.push(`<link rel="preload" as="image" type="image/${va.length ? 'avif' : 'webp'}" imagesrcset="${srcset(lista)}" imagesizes="${sizes}" fetchpriority="high">`)
    }
    return `<picture${classePicture ? ` class="${classePicture}"` : ''}>${fontes.join('')}${img}</picture>`
  })
}

// ---------------------------------------------------------------- geradores
const CLIENTES = [
  ['inpasa', 'INPASA'], ['slc', 'SLC Agrícola'], ['franciosi', 'Franciosi'],
  ['gees', 'GEES S/A'], ['horizonte', 'Horizonte Agrícola'], ['hs', 'HS Construções e Terraplenagem'],
]
// logos em cor (scripts/logos-clientes.mjs), um por placa; a altura de cada um é acertada no CSS.
// A cópia que fecha o laço do carrossel leva alt vazio
function placasClientes(copia) {
  return CLIENTES.map(([slug, nome]) => {
    const arq = Object.keys(manifesto).find((a) => a.startsWith(`logo-${slug}-`))
    if (!arq) return (avisos.push(`logo ausente: ${slug}`), '')
    const m = manifesto[arq]
    return `<li class="marca marca--${slug}"><img src="/assets/img/${arq}" alt="${copia ? '' : esc(nome)}" width="${m.w}" height="${m.h}" loading="lazy" decoding="async"></li>`
  }).join('\n')
}
const GERADORES = {
  clientes: () => placasClientes(false),
  'clientes-copia': () => placasClientes(true),
}

// ---------------------------------------------------------------- palavras e letras
// Elemento com data-palavras (efeito Split Text do React Bits): cada palavra vira
// <span class="pw"><span class="pw__i"> e cada letra dela um <span class="pc"> com --c em
// sequência no título inteiro; a palavra não quebra no meio. Tag dentro (br, strong) passa
// direto; <span class="tarja"> conta como uma letra só e entra inteira. Como o leitor de tela
// soletraria as letras soltas, o texto inteiro vai no aria-label.
function palavras(html) {
  return html.replace(/<(h1|h2|h3|p)(\s[^>]*?\bdata-palavras\b[^>]*)>([\s\S]*?)<\/\1>/g, (_, nome, attrs, miolo) => {
    const blocos = []
    const rotulo = miolo.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    miolo = miolo.replace(/<span class="tarja">[\s\S]*?<\/span>/g, (b) => `\u0001${blocos.push(b) - 1}\u0001`)
    let c = 0
    // <p> não aceita aria-label: ali a palavra entra inteira, sem soltar as letras. A pontuação
    // vai junto da letra de antes, num span .pt: a vírgula e o ponto da Plus Jakarta Sans têm
    // recuo esquerdo largo (0,36 em de avanço) e o título ficava "obra ." (o CSS puxa o .pt)
    const letras = (w) => (nome === 'p' ? [w] : w.match(/&[^;\s]+;|\u0001\d+\u0001|.[.,!?:;]?/gsu)).map((l) => {
      const bloco = l.match(/^\u0001(\d+)\u0001$/)
      if (bloco) return `<span class="pc pc--bloco" style="--c:${c++}">${blocos[bloco[1]]}</span>`
      const pont = l.match(/^(.)([.,])$/su)
      return `<span class="pc" style="--c:${c++}">${pont ? `${pont[1]}<span class="pt">${pont[2]}</span>` : l}</span>`
    }).join('')
    const out = miolo
      .split(/(<[^>]+>)/)
      .map((parte) => (parte.startsWith('<') ? parte : parte.replace(/\S+/g, (w) => `<span class="pw"><span class="pw__i">${letras(w)}</span></span>`)))
      .join('')
    const aria = nome === 'p' || /\baria-label=/.test(attrs) ? '' : ` aria-label="${rotulo}"`
    return `<${nome}${attrs}${aria}>${out}</${nome}>`
  })
}

// ---------------------------------------------------------------- dados estruturados
function schema(html) {
  const base = (cfg.dominio || '').replace(/\/$/, '')
  const negocio = {
    '@type': 'GeneralContractor',
    '@id': `${base}/#geomon`,
    name: 'Geomon Revestimento de Solo',
    alternateName: 'GEOmon',
    description: cfg.descricao,
    foundingDate: '2019',
    telephone: `+${cfg.whatsapp}`,
    image: `${base}/assets/img/og.jpg`,
    address: { '@type': 'PostalAddress', streetAddress: 'Rua Clara Akama, 621, Jardim Imperial', addressLocality: 'Luís Eduardo Magalhães', addressRegion: 'BA', postalCode: '47864-120', addressCountry: 'BR' },
    areaServed: ['Bahia', 'Maranhão', 'Tocantins', 'Piauí'].map((n) => ({ '@type': 'State', name: n })),
    sameAs: [cfg.instagram],
    knowsAbout: ['Geomembrana', 'Geomembrana PEAD', 'Impermeabilização de reservatórios', 'Solda de geomembrana', 'Reservatório de irrigação', 'Canal de irrigação', 'Tanque para piscicultura'],
    hasCredential: [{ '@type': 'EducationalOccupationalCredential', name: 'Certified Welding Technician (CWT)', recognizedBy: { '@type': 'Organization', name: 'International Association of Geosynthetic Installers (IAGI)' } }],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Instalação de geomembrana',
      itemListElement: ['Reservatórios para irrigação', 'Canais de água', 'Tanques para criação de peixe', 'Caixas de decantação e rejeitos', 'Revestimento de armazéns graneleiros', 'Lagos ornamentais e caixas de concreto'].map((n) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n } })),
    },
  }
  if (base) negocio.url = `${base}/`
  const $ = cheerio.load(html)
  const perguntas = $('#perguntas .pergunta')
    .map((_, d) => ({
      '@type': 'Question',
      name: $(d).find('.pergunta__q').text().replace(/\s+/g, ' ').trim(),
      acceptedAnswer: { '@type': 'Answer', text: $(d).find('.pergunta__r').text().replace(/\s+/g, ' ').trim() },
    }))
    .get()
    .filter((q) => q.name && q.acceptedAnswer.text)
  const grafo = [negocio]
  if (perguntas.length) grafo.push({ '@type': 'FAQPage', '@id': `${base}/#perguntas`, mainEntity: perguntas })
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo })}</script>`
}

// ---------------------------------------------------------------- montagem
function montar(parciais) {
  let html = readFileSync(P('src/index.html'), 'utf8')
  if (parciais) {
    const header = parciais.includes(PRIMEIRO) ? `<!-- @parcial ${PRIMEIRO} -->` : ''
    const rodape = parciais.includes(ULTIMO) ? `<!-- @parcial ${ULTIMO} -->` : ''
    const meio = parciais
      .filter((n) => n !== PRIMEIRO && n !== ULTIMO)
      .map((n) => `<!-- @parcial ${n} -->`)
      .join('\n')
    html = html.replace(new RegExp(`<!--\\s*@parcial ${PRIMEIRO}\\s*-->[\\s\\S]*<!--\\s*@parcial ${ULTIMO}\\s*-->`), `${header}\n  <main id="conteudo">\n${meio}\n  </main>\n${rodape}`)
  }
  for (let n = 0; n < 4 && /<!--\s*@parcial\s/.test(html); n++) html = html.replace(/<!--\s*@parcial\s+([\w-]+)\s*-->/g, (_, nome) => lerParcial(nome))
  html = html.replace(/<!--\s*@gerar\s+([\w-]+)\s*-->/g, (_, nome) => (GERADORES[nome] ? GERADORES[nome]() : (avisos.push(`gerador ausente: ${nome}`), '')))
  html = palavras(html)
  html = html.replace('<!-- @js -->', () => `<script>${minJs(juntar('src/js', '.js', parciais))}</script>`)
  html = html.replace('<!-- @css -->', () => `<style>${minCss(pxParaRem(juntar('src/css', '.css', parciais)))}</style>`)
  html = html.replace(/<i data-i="([\w-]+)"(?: data-w="(\w+)")?(?: class="([^"]*)")?><\/i>/g, (_, nome, peso, classe) => icone(nome, peso || 'light', classe || ''))
  html = html.replace(/\{\{wa:([^}]+)\}\}/g, (_, t) => esc(wa(t.trim())))
  html = html.replace(/\{\{cfg\.([\w.]+)\}\}/g, (_, c) => esc(valor(c)))
  html = html.replace(/\{\{ano\}\}/g, String(new Date().getFullYear()))
  html = html.replace('<!-- @schema -->', () => schema(html))
  html = imagens(html)
  html = html.replace('<!-- @preload -->', () => preloads.join('\n  '))
  html = html.replace('<!-- @sprite -->', () => `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" width="0" height="0" style="position:absolute;overflow:hidden">${[...usados.values()].join('')}</svg>`)
  html = html.replace('<!-- @robots -->', cfg.indexar ? '<meta name="robots" content="index, follow, max-image-preview:large">' : '<meta name="robots" content="noindex, nofollow">')
  const base = (cfg.dominio || '').replace(/\/$/, '')
  html = html.replace(
    '<!-- @meta-dominio -->',
    base ? `<link rel="canonical" href="${base}/">\n  <meta property="og:url" content="${base}/">\n  <meta property="og:image" content="${base}/assets/img/og.jpg">` : '<meta property="og:image" content="/assets/img/og.jpg">',
  )
  return html
}

function verificar(html, rotulo) {
  const $ = cheerio.load(html)
  $('script, style').remove()
  const texto = $('body').text()
  const tracos = texto.match(/.{0,30}[—–].{0,30}/g)
  if (tracos) avisos.push(`[${rotulo}] travessão no texto (regra da casa): ${tracos.slice(0, 4).map((s) => JSON.stringify(s.trim())).join(' | ')}`)
  if (/credialta/i.test(texto)) avisos.push(`[${rotulo}] "Credialta" no texto do site (proibido)`)
  const sobrou = html.match(/\{\{[^}]+\}\}/g)
  if (sobrou) avisos.push(`[${rotulo}] marcadores sem valor: ${[...new Set(sobrou)].join(', ')}`)
  $('img').each((_, el) => {
    const src = ($(el).attr('src') || '?').slice(0, 60)
    if ($(el).attr('alt') === undefined) avisos.push(`[${rotulo}] img sem alt: ${src}`)
    if (!$(el).attr('width') || !$(el).attr('height')) avisos.push(`[${rotulo}] img sem width/height (salto de layout): ${src}`)
  })
  const ids = {}
  $('[id]').each((_, el) => {
    const id = $(el).attr('id')
    ids[id] = (ids[id] || 0) + 1
  })
  for (const [id, n] of Object.entries(ids)) if (n > 1) avisos.push(`[${rotulo}] id repetido: #${id} (${n}x)`)
  if (!argPreview)
    $('a[href^="#"]').each((_, el) => {
      const alvo = $(el).attr('href').slice(1)
      if (alvo && !ids[alvo]) avisos.push(`[${rotulo}] âncora sem destino: #${alvo}`)
    })
  if (!argPreview && $('h1').length !== 1) avisos.push(`[${rotulo}] ${$('h1').length} h1 na página (precisa ser 1)`)
}

// ---------------------------------------------------------------- execução
if (process.argv.includes('--publicar')) rmSync(DIST, { recursive: true, force: true })
copiarPasta(P('src/assets'), path.join(DIST, 'assets'))
copiarPasta(P('src/raiz'), DIST)

const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} KB`
if (!argPreview) {
  const html = montar(null)
  verificar(html, 'página')
  gravar(path.join(DIST, 'index.html'), html)
  const base = (cfg.dominio || '').replace(/\/$/, '')
  gravar(path.join(DIST, 'robots.txt'), cfg.indexar ? `User-agent: *\nAllow: /\nDisallow: /preview/\n${base ? `Sitemap: ${base}/sitemap.xml\n` : ''}` : 'User-agent: *\nDisallow: /\n')
  if (base && cfg.indexar) gravar(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`)
  if (!base) avisos.push('dominio vazio no site.config.json: sem canonical e og:image relativo')
  if (process.argv.includes('--publicar')) rmSync(path.join(DIST, 'preview'), { recursive: true, force: true })
  console.log(`ok dist/index.html ${kb(html)} (${usados.size} ícones no sprite)`)
} else {
  const nome = argPreview.join('+')
  const html = montar(argPreview)
  verificar(html, `preview ${nome}`)
  gravar(path.join(DIST, `preview/${nome}.html`), html)
  console.log(`ok /preview/${nome}.html ${kb(html)}`)
}
if (avisos.length) console.log(`AVISOS:\n  ${[...new Set(avisos)].join('\n  ')}`)
