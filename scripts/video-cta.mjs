// Vídeo do CTA: filmagem real de drone do Wilton (DJI_0447, canal entre os círculos de algodão,
// fim de tarde), espelhada pra o algodão na sombra ficar embaixo do texto, com o mesmo tom dourado
// das fotos (OURO do processar-imagens.mjs) e um pouco de vermelho nas altas luzes, senão o céu
// claro fica esverdeado. Sai uma versão larga e uma em pé pro celular, recortada
// da filmagem original pra não perder nitidez. Vai e volta pra fechar o loop, como o do hero, e a
// capa é o 1º quadro do arquivo codificado, pra a troca capa → vídeo não mudar de tom.
// Uso: node scripts/video-cta.mjs → src/assets/video/cta-{1600,540}.mp4 e insumos/quadros/cta-capa{,-celular}.png
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
const ORIGEM = '../0100 - Geomon/MATERIAL/DJI_0447.MP4'
mkdirSync('src/assets/video', { recursive: true })
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' })
const cor = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv']
const OURO = 'format=gbrp,colorchannelmixer=rr=1.09:rg=0.06:gr=0.02:gg=1:bg=0.02:bb=0.85,colorbalance=rh=0.07:gh=-0.025,scale=out_color_matrix=bt709:flags=accurate_rnd+full_chroma_int,format=yuv444p,eq=saturation=1.1:contrast=1.05:brightness=-0.02,format=yuv420p'
const VERSOES = [
  { w: 1600, crf: 30, corte: '', capa: 'cta-capa' },
  { w: 540, crf: 29, corte: 'crop=850:1512:880:0,', capa: 'cta-capa-celular' },
]
for (const { w, crf, corte, capa } of VERSOES) {
  const saida = `src/assets/video/cta-${w}.mp4`
  ff('-i', ORIGEM, '-filter_complex',
    `[0:v]trim=start=0.5:end=11.5,setpts=PTS-STARTPTS,fps=30,hflip,${corte}scale=${w}:-2:flags=lanczos:in_color_matrix=bt709,${OURO},split[a][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1:a=0[v]`,
    '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'veryslow', '-crf', String(crf), '-aq-mode', '3', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    ...cor, '-movflags', '+faststart', saida)
  ff('-i', saida, '-frames:v', '1', '-vf', 'scale=in_color_matrix=bt709:flags=accurate_rnd+full_chroma_int', `insumos/quadros/${capa}.png`)
  console.log('ok', saida)
}
