// Logo da ProRec pro crédito do rodapé: a versão branca oficial que a ProRec mandou (2026-11-10,
// já transparente), sem a sobra em volta. A sombra cinza onde os triângulos se cruzam virava
// mancha no verde-escuro do rodapé: todo pixel vira branco e só o alfa desenha a logo.
// Uso: node scripts/logo-prorec.mjs  (nome do arquivo com versão, pro navegador não usar o antigo)
import sharp from 'sharp'
const { data, info } = await sharp('insumos/logo-prorec-oficial-branca.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true })
for (let i = 0; i < data.length; i += 4) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255 }
const buf = await sharp(data, { raw: info }).png().toBuffer()
await sharp(buf).trim({ threshold: 1 }).png().toFile('insumos/logo-prorec-branco.png')
console.log(await sharp('insumos/logo-prorec-branco.png').metadata().then((m) => [m.width, m.height]))
