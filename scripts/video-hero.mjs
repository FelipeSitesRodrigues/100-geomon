// Vídeo do hero (gerado no Google Flow a partir da foto real do reservatório, 1280x720, 8 s).
// O Flow não fecha o loop: o vídeo vai e volta (ida + volta de trás pra frente), então o último
// quadro é o primeiro e o loop não tem corte. Sem áudio. Cor etiquetada em BT.709 no arquivo,
// e a capa sai do próprio vídeo codificado, pelo mesmo caminho de cor que o Chrome usa, pra a
// troca capa → vídeo não mudar de tom (memória cor-video-bt601-chrome).
// Uso: node scripts/video-hero.mjs → src/assets/video/hero-{1280,854}.mp4 e insumos/quadros/hero-capa.png
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
const ORIGEM = '../0100 - Geomon/video-hero/VIDEO HERO.mp4'
mkdirSync('src/assets/video', { recursive: true })
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' })
const cor = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv']
for (const [w, crf] of [[1280, 28], [854, 29]]) {
  ff('-i', ORIGEM, '-filter_complex',
    `[0:v]trim=start=0.04,setpts=PTS-STARTPTS,scale=${w}:-2:flags=lanczos:out_color_matrix=bt709,format=yuv420p,split[a][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1:a=0[v]`,
    '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'veryslow', '-crf', String(crf), '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    ...cor, '-movflags', '+faststart', `src/assets/video/hero-${w}.mp4`)
}
ff('-i', 'src/assets/video/hero-1280.mp4', '-frames:v', '1', '-vf', 'scale=in_color_matrix=bt709:flags=accurate_rnd+full_chroma_int', 'insumos/quadros/hero-capa.png')
console.log('ok')
