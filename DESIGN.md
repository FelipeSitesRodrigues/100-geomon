---
name: Geomon
description: Landing page de instalação de geomembrana para o agro no MATOPIBA. Entardecer no cerrado, a solda como assinatura.
colors:
  claro: "#F2F5F0"
  branco: "#FFFFFF"
  petroleo: "#032429"
  petroleo-2: "#06323A"
  petroleo-rodape: "#003430"
  floresta: "#00291D"
  preto: "#050707"
  verde: "#4ADE6E"
  verde-forte: "#1E9E45"
  verde-escuro: "#0E4A2C"
  azul: "#1B2A8C"
  tinta: "#0A1F1C"
  tinta-2: "#4B5A56"
  linha-clara: "#DCE3DD"
typography:
  display:
    fontFamily: "Jakarta (Plus Jakarta Sans), Arial, sans-serif"
    fontSize: "72px"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.028em"
  headline:
    fontFamily: "Jakarta (Plus Jakarta Sans), Arial, sans-serif"
    fontSize: "54px"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.028em"
  title:
    fontFamily: "Jakarta (Plus Jakarta Sans), Arial, sans-serif"
    fontSize: "21px"
    fontWeight: 800
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Jakarta (Plus Jakarta Sans), Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: "Jakarta (Plus Jakarta Sans), Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 700
  visor:
    fontFamily: "DSEG7 Classic Italic"
    fontWeight: 400
rounded:
  card: "24px"
  thumb: "16px"
  secao: "40px"
  pilula: "99px"
spacing:
  secao: "96px"
  largura: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.verde}"
    textColor: "#04241A"
    rounded: "{rounded.pilula}"
    height: "56px"
    padding: "0 28px"
  button-primary-hover:
    backgroundColor: "#6BEA89"
  button-dark:
    backgroundColor: "{colors.verde-escuro}"
    textColor: "{colors.branco}"
    rounded: "{rounded.pilula}"
    height: "56px"
  button-outline:
    textColor: "currentColor"
    rounded: "{rounded.pilula}"
    height: "56px"
  card-solucao:
    backgroundColor: "#0A3036"
    textColor: "{colors.branco}"
    rounded: "{rounded.card}"
    padding: "30px"
---

# Design System: Geomon

## Overview

**Norte criativo: entardecer no cerrado.** Fotografia real de obra (drone, campo, solda) com tom de fim de tarde dourado, títulos pesados e apertados, e uma assinatura tirada do próprio serviço: a **solda dupla** (duas linhas finas paralelas com um ponto verde de teste) e os **arcos concêntricos** do reservatório redondo visto de cima. O site prova a solda em vez de vender "lona". Só fotos reais da Geomon; nunca pessoas ou obras geradas.

A página alterna fundos como seções de site, não como slides: vídeo no hero, foto no sobre, vídeo no CTA, e no meio branco, claro, petróleo, floresta e preto. Ordem: hero (escuro), soluções (branca), sobre (foto), qualidade (claro). Duas fotos escuras seguidas ficavam estranhas, por isso a soluções branca fica entre o hero e o sobre (pedido do Felipe).

## Colors

- **Petróleo** `#032429` e **Floresta** `#00291D`: os escuros de marca. **Preto** `#050707` só nas seções de escala, clientes e perguntas, com um brilho verde difuso no canto de cima.
- **Claro** `#F2F5F0` (off-white esverdeado) e **Branco** puro (só no processo).
- **Verde** `#4ADE6E`: ação e destaque em fundo escuro (botão principal, palavra do título, ícones, pontos). Texto sobre ele é `#04241A`, nunca branco.
- **Verde forte** `#1E9E45`: a palavra em verde do título e os pontos em fundo claro (contraste de título grande).
- **Verde escuro** `#0E4A2C`: botão escuro em fundo claro e o trecho aceso da linha do processo.
- **Azul** `#1B2A8C`: o azul-marinho da logo, só na faixa de destaques entre a lâmina e a CWT (meio-tom entre o claro e a foto escura).
- Texto secundário: `tinta-2` no claro, branco a 74% no escuro. Fios: `linha-clara` no claro, branco a 14% no escuro.

## Typography

Plus Jakarta Sans self-hosted (500, 600, 700, 800). Títulos em 800 com espaçamento de letra -0,028em e `text-wrap: balance`; a última palavra ou expressão do título vai em verde, em `<em>` sem itálico. Corpo em 500. Números do medidor em DSEG7 (7 segmentos), só no visor.

A vírgula e o ponto da Jakarta têm recuo esquerdo largo: nos títulos o build envolve a pontuação em `.pt` com `margin-left: -.11em`.

Escala: acima de 1200 px o rem acompanha a largura e a altura da janela, o que for menor (16 px em 1440x900, mínimo 14,5). A composição de 1440x900 vale em qualquer tela; só pela largura, numa 1920x1080 tudo saía 33% maior e a página ficava com 17 telas de altura.

## Layout

Conteúdo em 1240 px (`.caixa`), seções com 96 px de respiro vertical (80 no tablet, 64 no celular). Seção de conteúdo fica perto de 1 tela em 1440x900; as de foto grande (empresa, obras, processo) até 1,4. Cabeça de seção em duas colunas: título à esquerda, texto curto à direita com fio vertical. Pontos de quebra: 75em (tablet), 64em (processo vira lista vertical), 48em (celular).

Hero no celular segue a regra da casa: título, vídeo, texto, botões, provas.

## Elevation & Depth

Profundidade vem da foto e do degradê, não de sombra. Sombras só em fotos e cartões, sempre com deslocamento vertical e desfoque longo (`0 40px 80px -40px`). Vidro escuro (`backdrop-filter: blur(10px)`) só nas pílulas de legenda sobre foto.

## Shapes

Pílula (99 px) em botões, etiquetas e legendas. Cartões e fotos com 24 px; miniaturas 14 a 16 px. Transição entre seções: **claro com escuro = a seção de baixo sobe com cantos de cima arredondados (40 px); escuro com escuro = degradê no fundo**, sem curva.

## Components

- **Botões**: verde cheio (principal, com seta), verde escuro (em fundo claro), contornado. Altura 56 px. A seta anda 4 px no hover. No celular, botões que quebram de linha ocupam a largura toda. Luz correndo na borda (Border Glow do kit /animacoes-site) em no máximo 3 botões: hero, perguntas e CTA.
- **Cartão de solução**: cartão claro sobre a seção branca, foto de ponta a ponta no alto com corte reto (degradê da foto pro claro fica leitoso), ícone fino verde, título, texto e seta num círculo. O cartão inteiro é o link do WhatsApp do serviço.
- **Cena do ano** (sobre): foto inteira da equipe de fundo, "Desde 2019" no céu com as cabeças na frente (recorte das pessoas por cima do ano), etiqueta de vidro centrada, fio duplo descendo pela direita e a foto escurecendo até o texto, abaixo das botas. Tudo da cena em cqw, preso à altura dos chapéus na foto. Entrada: a foto assenta, as letras sobem do desfoque por trás das cabeças, o fio desce e o ponto acende; na rolagem o ano anda mais devagar que a foto.
- **Composição do CWT**: no lugar de cartão, o técnico num círculo (eco do reservatório redondo e do selo), arcos em volta com o anel de dentro em fio duplo e um ponto verde de teste girando nele (28 s por volta, só transform), o selo preso no anel como medalha e uma lupa com a soldadora 124 de perto, legenda "Solda dupla". Foto em retângulo genérico foi recusada pelo Felipe.
- **Fio da solda** (`.solda-fio`): duas linhas verticais finas com um ponto verde por item; usado nos pilares, nos testes e, em forma de "S", no processo.
- **Carrossel de clientes**: logos na cor original, cada um numa placa branca de 360x208 (no preto, azul-marinho e preto sumiriam), correndo em laço de ponta a ponta da tela. Só transform, para com o mouse em cima; com movimento reduzido vira grade parada.
- **Arcos**: 3 círculos finos (branco a 12% no escuro, tinta a 7% no claro) saindo pelo canto da seção.
- **Animação**: kit /animacoes-site (Split Text nos títulos, Blur Fade no texto, Stagger nos cartões, contador). Só transform, opacity e desfoque em texto; respeita movimento reduzido.

## Do's and Don'ts

- Faça: foto real da Geomon com o tom dourado (`processar-imagens.mjs`); WhatsApp com a mensagem do serviço em todo botão de serviço.
- Faça: uma palavra em verde por título, no fim.
- Não faça: pessoas, obras ou fotos geradas por IA no lugar das reais.
- Não faça: verde vivo como fundo de seção ou texto branco sobre o verde vivo.
- Não faça: cartão dentro de cartão, grade de ícones genéricos, foto encaixada pequena num cartão branco (reprovado pelo Felipe nos mockups).
