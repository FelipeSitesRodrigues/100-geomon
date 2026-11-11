// Logo da ProRec pro crédito do rodapé: a versão branca oficial que a ProRec mandou (2026-11-10,
// já transparente), só sem a sobra em volta. Uso: node scripts/logo-prorec.mjs
import sharp from 'sharp'
await sharp('insumos/logo-prorec-oficial-branca.png').trim({ threshold: 1 }).png().toFile('insumos/logo-prorec-branco.png')
console.log(await sharp('insumos/logo-prorec-branco.png').metadata().then((m) => [m.width, m.height]))
