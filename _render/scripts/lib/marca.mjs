/**
 * Leitor das MARCAS DE DADO de um `preview.svg`: que cor cada marca recebe, com que opacidade, e
 * qual token do Farol é essa cor. Existe para a guarda CONTRASTE-MARCA de `guardas.mjs` e não
 * decide nada.
 *
 * POR QUE ELE EXISTE. A CONTRASTE-TEXTO mede TINTA DE TEXTO contra o que está pintado atrás. Nada
 * media a MARCA contra o cartão, e é ali que vivem duas armadilhas medidas do acervo:
 *
 *   TOK-1, em 18 modelos: `--surface-overlay` como trilho de barra, moldura de selo ou faixa de
 *   período mede 1,00:1 no tema CLARO, porque no claro ele é exatamente o mesmo branco de
 *   `--surface-raised`, e 1,10:1 no escuro. A estrutura simplesmente não existe na tela. E a origem
 *   não foi desatenção: a tabela de tokens do CONTRATO.md listava "trilho de barra" como uso
 *   legítimo do token até 2026-09-25.
 *
 *   TOK-7: degrau do meio da rampa sequencial usado como cor CATEGÓRICA. `--seq-3` mede 2,29:1 no
 *   escuro e 1,92:1 no claro contra `--surface-raised`, enquanto `--positive`, `--warning` e
 *   `--negative` ficam entre 5,3:1 e 8,4:1 nos dois temas. Os degraus `--seq-*` são feitos para
 *   receber texto por cima DENTRO de uma célula, não para contrastar com a superfície do cartão.
 *
 * OS DOIS TEMAS, SEMPRE. A TOK-1 reprova nos dois e o acervo inteiro só registrou o claro: quem
 * conferiu um tema achou que tinha escapado. Por isso o leitor roda em `preview.svg` e em
 * `preview-claro.svg`, e o piso vale tema por tema.
 *
 * A OPACIDADE É O QUE DERRUBA A MARCA, e por isso ela entra na conta. `--line-strong` opaco mede
 * 1,79:1 no escuro e 1,83:1 no claro, já abaixo do piso; com a opacidade que a especificação costuma
 * pedir ele cai para algo entre 1,07:1 e 1,25:1. O leitor compõe `fill-opacity`, `stroke-opacity` e
 * todo `opacity` da cadeia sobre o fundo do cartão antes de medir.
 *
 * O QUE CONTA COMO MARCA, e por que cada recorte existe:
 *
 *   NO SVG, forma com `style="fill:…"`. O discriminador é o mesmo que `espessura.mjs` mediu no
 *   acervo: o que o COMPONENTE desenha carrega estilo computado em `style`, e a moldura da
 *   ferramenta sai com `fill=` em atributo. Área acima de um quarto DA TELA DA PEÇA também sai: ali é
 *   fundo de painel ou faixa, não marca. Traço entra só a partir de 2 px, porque 1 px é grade e eixo,
 *   que o contrato QUER discretos.
 *
 *   NO HTML de `foreignObject`, elemento com `background-color` E SEM TEXTO PRÓPRIO NEM DESCENDENTE
 *   COM TEXTO. Este recorte não é conveniência: é a letra da TOK-1, que diz
 *   "`--surface-overlay` só como fundo atrás de texto". Fundo de dica, de selo e de destaque de linha
 *   carregam texto e ficam legitimamente de fora; trilho de barra, poço e amostra de legenda não
 *   carregam texto e entram. De graça, o recorte também resolve o falso positivo que apareceria
 *   primeiro: o próprio cartão, que é um `<section>` com `background-color` igual a
 *   `--surface-raised` e contraste 1,00:1 contra si mesmo.
 *
 * A ISENÇÃO "TEM TEXTO POR CIMA" VALE NOS DOIS RAMOS, e até 2026-09-28 valia só no HTML. No HTML o
 * texto é DESCENDENTE do elemento pintado, então o parentesco resolve. No SVG o `<text>` é IRMÃO do
 * `<rect>` e do `<circle>`, nunca filho, e a isenção simplesmente não existia: plaquinha de nome em
 * treemap e bolinha de operador em árvore de indicadores eram contadas como marca de dado e acusadas.
 * Por isso no SVG o critério é GEOMÉTRICO e é CONTENÇÃO: a caixa de tinta de uma linha de texto tem de
 * cair inteira dentro da caixa da forma, com um pixel de folga. Interseção não serve, porque o rótulo
 * de valor de uma barra encosta na barra e a barra É marca de dado. O critério vive em
 * `contencao.mjs`, e não aqui, desde 2026-09-29: a guarda TEXTO-NA-MARCA faz a mesma pergunta pelo
 * lado do TEXTO, e duas cópias do critério divergiriam na primeira emenda.
 *
 * NÃO ALCANÇA, declarado: gradiente e padrão (`url(#…)`), que saem contados como não medidos; forma
 * dentro de `<svg>` girado ou escalado, porque a cadeia não é composta aqui; a marca que se sobrepõe a
 * OUTRA marca em vez do cartão, porque o fundo usado é sempre o do cartão, como manda a régua da TOK-1
 * e da TOK-7; e, na isenção geométrica, `path`, `polygon`, `polyline` e `line`, que não declaram caixa
 * em atributo, mais o texto que vive dentro de um `foreignObject` por cima de uma forma SVG, porque o
 * leitor de linhas não sai do SVG. Nesses casos a forma continua julgada, o que é o erro certo a
 * cometer: falso positivo aparece no relatório, falso negativo não aparece em lugar nenhum.
 *
 * O PONTO CEGO IRÔNICO DO TEMA CLARO, e por que ele não deixa nada passar. No claro
 * `--surface-overlay` e `--surface-raised` são o MESMO `#ffffff`, então uma marca pintada com o
 * primeiro é indistinguível, na cor já resolvida, do revestimento legítimo da TOK-4, que usa a cor do
 * cartão de propósito. A guarda não tem como separar os dois ali, e por isso conta a marca como não
 * julgada no claro. Nada escapa por causa disso: no ESCURO os dois tokens são cores diferentes, a
 * marca é identificada e a versão é acusada. O tema em que o defeito é PIOR é justamente o tema em que
 * a cor não o denuncia, e é o outro tema que o prova.
 */
import fs from 'node:fs';
import path from 'node:path';

import { lerLinhasDeTexto, translacao } from './colisao.mjs';
// O critério de contenção mora em `contencao.mjs` porque a guarda TEXTO-NA-MARCA faz a MESMA pergunta
// virada do avesso (o texto contra a forma de baixo, em vez da forma contra o texto de cima). Duas
// cópias divergiriam, e uma forma isentada aqui com um critério e um texto não acusado lá com outro
// deixariam o defeito sem nenhuma guarda.
import { temTextoDentro } from './contencao.mjs';
import { lerCor, luminancia, razaoDeContraste, sobrepor } from './contraste.mjs';
import { APP_SRC } from './paths.mjs';

const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
const ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
/** Subárvores que definem, não desenham. Mesma lista de `espessura.mjs` e de `contraste.mjs`. */
const NAO_DESENHA = new Set(['defs', 'clipPath', 'pattern', 'mask', 'marker', 'symbol']);
/** Formas que preenchem área. */
const FORMAS = new Set(['rect', 'path', 'polygon', 'polyline', 'circle', 'ellipse', 'line']);
/**
 * Acima desta fração DA TELA DA PEÇA a forma é fundo de painel ou faixa, não marca.
 *
 * Emenda de 2026-09-28. A fração era medida contra o `<svg>` ANCESTRAL mais próximo, e ali ela
 * mentia: em `01_cards-e-kpis/03_kpi-com-regua-de-meta/v3` cada régua sai num `<svg>` aninhado de
 * 238,3 x 22 px, ou 5.243 px², o que punha o limiar em 1.311 px²; o degrau `--seq-1` da faixa de
 * conforto ocupa 2.492 px², passava do limiar e era descartado como fundo. Sobravam 2 degraus, e a
 * outra régua desta guarda (menos de três degraus é uso categórico) reprovava uma rampa sequencial
 * legítima. O denominador certo é a tela da peça, porque é ela que define o que é "grande na tela".
 */
const FRACAO_MAXIMA_DA_TELA = 0.25;
/** Traço abaixo disto é grade, eixo ou contorno de glifo, que o contrato quer discretos. */
const TRACO_MINIMO = 2;
/** Escala de `<svg>` aninhado acima disto cega a comparação de caixas (igual a `colisao.mjs`). */
const ESCALA_TOLERANCIA = 0.001;
/** Elementos HTML sem texto próprio por natureza. */
const VAZIOS = new Set(['br', 'hr', 'img', 'input', 'source', 'wbr', 'svg', 'path', 'circle', 'line']);

function lerAtributos(raw) {
  const out = {};
  for (const m of raw.matchAll(ATTR)) out[m[1]] = m[2];
  return out;
}

/** `&quot;` termina em ponto e vírgula e partiria a declaração no meio (igual a `tamanho.mjs`). */
function lerEstilo(valor) {
  const out = {};
  for (const par of (valor ?? '').replace(/&quot;/g, '"').split(';')) {
    const i = par.indexOf(':');
    if (i > 0) out[par.slice(0, i).trim()] = par.slice(i + 1).trim();
  }
  return out;
}

function numero(valor) {
  if (valor === undefined || valor === null) return null;
  const n = Number.parseFloat(String(valor));
  return Number.isFinite(n) ? n : null;
}

function medida(valor, base) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  if (texto.endsWith('%')) {
    const pct = Number.parseFloat(texto);
    return Number.isFinite(pct) && Number.isFinite(base) ? (pct / 100) * base : null;
  }
  const n = Number.parseFloat(texto);
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------------------------------------------
// Tokens do Farol
// ---------------------------------------------------------------------------------------------

/**
 * Lê `tokens.css` e devolve `{ dark: Map, light: Map }` de nome de token para `{ r, g, b, a }`.
 * Só as declarações diretas em hexadecimal ou `rgb()`: `var(--outro)` fica fora de propósito, que é
 * o que faz a tabela ter só cor de verdade e nenhum apelido.
 */
export function lerTokensDoFarol() {
  const file = path.join(APP_SRC, 'styles', 'tokens.css');
  const temas = { dark: new Map(), light: new Map() };
  if (!fs.existsSync(file)) return temas;
  const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const tema of ['dark', 'light']) {
    const bloco = new RegExp(`\\[data-theme=['"]${tema}['"]\\]\\s*\\{([\\s\\S]*?)\\n\\}`).exec(css);
    if (!bloco) continue;
    for (const m of bloco[1].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
      const cor = lerCor(m[2].trim());
      if (cor && cor !== 'incerto') temas[tema].set(m[1], cor);
    }
  }
  return temas;
}

/**
 * Folga por canal ao casar uma cor do preview com um token, em unidades de 0 a 255.
 * Não é frouxidão: o navegador devolve `rgb(44, 211, 233)` onde o token diz `#2dd4e8`, que é
 * `rgb(45, 212, 232)`, porque a cor passa por espaço de cor no caminho. Sem a folga, cor de token
 * aparecia no relatório como cor solta e a guarda perdia o nome que faz a mensagem ser útil. Três
 * unidades ficam muito abaixo da distância entre dois tokens vizinhos quaisquer do Farol.
 */
const TOLERANCIA_DE_TOKEN = 3;

/** `rgb(24, 36, 58)` para o nome do token daquele tema, ou `null` quando a cor não é de token. */
function nomeDoToken(cor, tabela) {
  for (const [nome, valor] of tabela) {
    if (Math.abs(valor.r - cor.r) <= TOLERANCIA_DE_TOKEN && Math.abs(valor.g - cor.g) <= TOLERANCIA_DE_TOKEN && Math.abs(valor.b - cor.b) <= TOLERANCIA_DE_TOKEN) return nome;
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// Inventário de marcas
// ---------------------------------------------------------------------------------------------

/**
 * O elemento que vai de `inicio` a `fim` carrega texto, próprio ou de qualquer descendente?
 * Tira as marcações e pergunta se sobrou letra ou dígito. É a linha que separa fundo de texto,
 * legítimo pela TOK-1, de marca de dado, que é o que esta guarda mede.
 */
function temTextoDescendente(html, inicio, fim) {
  return /[\p{L}\p{N}]/u.test(html.slice(inicio, fim).replace(/<[^>]*>/g, ''));
}

/**
 * Caixa da forma na coordenada do cartão, ou `null` quando o leitor não sabe medir.
 *
 * Só `rect`, `circle` e `ellipse` entram, porque só eles declaram a caixa em atributo. `path`,
 * `polygon`, `polyline` e `line` ficam de fora de propósito: sem interpretar o traçado, qualquer
 * caixa que eu inventasse para eles isentaria forma por acidente, e falso negativo silencioso é o
 * único desfecho pior que o falso positivo que esta emenda conserta.
 */
function caixaDaForma(nome, attrs, tela, dx, dy) {
  const em = (valor, base, padrao = null) => medida(valor, base) ?? padrao;
  if (nome === 'rect') {
    const x = em(attrs.x, tela.w, 0);
    const y = em(attrs.y, tela.h, 0);
    const w = em(attrs.width, tela.w);
    const h = em(attrs.height, tela.h);
    if (w === null || h === null) return null;
    return { x0: dx + Math.min(x, x + w), x1: dx + Math.max(x, x + w), y0: dy + Math.min(y, y + h), y1: dy + Math.max(y, y + h) };
  }
  const cx = em(attrs.cx, tela.w, 0);
  const cy = em(attrs.cy, tela.h, 0);
  if (nome === 'circle') {
    const r = em(attrs.r, tela.w);
    if (r === null) return null;
    return { x0: dx + cx - r, x1: dx + cx + r, y0: dy + cy - r, y1: dy + cy + r };
  }
  if (nome === 'ellipse') {
    const rx = em(attrs.rx, tela.w);
    const ry = em(attrs.ry, tela.h);
    if (rx === null || ry === null) return null;
    return { x0: dx + cx - rx, x1: dx + cx + rx, y0: dy + cy - ry, y1: dy + cy + ry };
  }
  return null;
}

/**
 * Devolve `{ marcas, foraPorMotivo, temTransform }` de um preview.
 *
 * `marcas`: `{ origem, tipo, pintura, cor, alfa, area, isenta }`, com `cor` já em `{ r, g, b, a }` e
 * `alfa` composto de toda a cadeia. `foraPorMotivo` conta o que o leitor viu e não soube resolver.
 *
 * `isenta` é a forma que tem texto escrito por cima. Ela vem na lista em vez de sair dela porque a
 * guarda tem DUAS réguas sobre o mesmo conjunto: o contraste de cada marca, que precisa ignorar a
 * forma isenta, e a CONTAGEM de degraus `--seq-*` desenhados, que precisa continuar vendo a célula de
 * heatmap com número dentro. Tirar a marca da lista consertaria uma régua quebrando a outra, que é
 * exatamente o defeito que esta mesma emenda conserta na peneira de área.
 */
export function lerMarcas(conteudo) {
  const svg = conteudo.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const marcas = [];
  const foraPorMotivo = new Map();
  const fora = (motivo) => foraPorMotivo.set(motivo, (foraPorMotivo.get(motivo) ?? 0) + 1);
  let temTransform = false;
  // As linhas de texto saem do leitor da COLISAO-TEXTO, já na coordenada do cartão e com a caixa de
  // tinta pronta. Reler o texto aqui com outro código daria duas respostas para a mesma pergunta.
  const { linhas } = lerLinhasDeTexto(conteudo);

  // --- SVG: forma com estilo computado.
  const pilha = [];
  const escopos = [];
  TAG.lastIndex = 0;
  let m;
  while ((m = TAG.exec(svg))) {
    const [, fecha, nome, raw, autoFecha] = m;
    if (fecha) {
      for (let i = pilha.length - 1; i >= 0; i -= 1) {
        if (pilha[i].nome === nome) {
          pilha.length = i;
          break;
        }
      }
      continue;
    }
    const attrs = lerAtributos(raw);
    const style = lerEstilo(attrs.style);
    const pai = pilha[pilha.length - 1] ?? null;
    const mover = translacao(attrs.transform ?? style.transform);
    const no = {
      nome,
      escopo: pai?.escopo ?? -1,
      html: (pai?.html ?? false) || nome === 'foreignObject',
      oculto: (pai?.oculto ?? false) || NAO_DESENHA.has(nome),
      alfa: (pai?.alfa ?? 1) * (numero(style.opacity ?? attrs.opacity) ?? 1),
      dx: (pai?.dx ?? 0) + (mover?.dx ?? 0),
      dy: (pai?.dy ?? 0) + (mover?.dy ?? 0),
      // Giro, escala ou inclinação na cadeia: a caixa desta forma não fica comparável com a do texto,
      // então ela perde o direito à isenção em vez de ganhar uma isenção medida errado.
      cego: (pai?.cego ?? false) || !mover,
    };
    if (nome === 'svg') {
      const telaDoPai = escopos[no.escopo] ?? { w: NaN, h: NaN };
      no.dx += medida(attrs.x, telaDoPai.w) ?? 0;
      no.dy += medida(attrs.y, telaDoPai.h) ?? 0;
      const vb = (attrs.viewBox ?? '').split(/[\s,]+/).map(Number);
      const ok = vb.length === 4 && vb.every(Number.isFinite);
      const largura = numero(attrs.width);
      if (ok && largura && Math.abs(largura / vb[2] - 1) > ESCALA_TOLERANCIA) no.cego = true;
      escopos.push({ w: ok ? vb[2] : Number(attrs.width), h: ok ? vb[3] : Number(attrs.height) });
      no.escopo = escopos.length - 1;
    }
    if (!no.html && !no.oculto && (attrs.transform ?? style.transform) && FORMAS.has(nome)) temTransform = true;
    if (!no.html && !no.oculto && FORMAS.has(nome)) {
      const tela = escopos[no.escopo] ?? { w: NaN, h: NaN };
      // A porcentagem continua resolvendo contra o `<svg>` ancestral, que é o que o navegador faz; o
      // que mudou é o DENOMINADOR da peneira, que agora é a tela da peça.
      const telaDaPeca = escopos[0] ?? { w: NaN, h: NaN };
      const w = medida(attrs.width, tela.w);
      const h = medida(attrs.height, tela.h);
      const area = w !== null && h !== null ? Math.abs(w) * Math.abs(h) : null;
      const grande = area !== null && Number.isFinite(telaDaPeca.w) && area >= FRACAO_MAXIMA_DA_TELA * telaDaPeca.w * telaDaPeca.h;
      const isenta = !no.cego && temTextoDentro(caixaDaForma(nome, attrs, tela, no.dx, no.dy), linhas);
      if (!grande) {
        for (const [tipo, pintura, alfaProprio, espessura] of [
          ['fill', style.fill, numero(style['fill-opacity']) ?? 1, null],
          ['stroke', style.stroke, numero(style['stroke-opacity']) ?? 1, numero(style['stroke-width'] ?? attrs['stroke-width'])],
        ]) {
          if (pintura === undefined || pintura === 'none') continue;
          if (tipo === 'stroke' && (espessura === null || espessura < TRACO_MINIMO)) continue;
          const cor = lerCor(pintura);
          if (cor === null) continue;
          if (cor === 'incerto') {
            fora('marca_com_pintura_incerta');
            continue;
          }
          const alfa = (cor.a ?? 1) * alfaProprio * no.alfa;
          if (alfa <= 0.001) continue;
          // A isenção vale só para o PREENCHIMENTO, como no HTML, onde ela nasceu do
          // `background-color`. O traço fica de fora porque a TOK-1 proíbe --surface-overlay como
          // MOLDURA de selo, que é justamente o contorno de uma forma com texto dentro.
          marcas.push({ origem: 'svg', tipo, pintura, cor: { r: cor.r, g: cor.g, b: cor.b, a: alfa }, area, isenta: isenta && tipo === 'fill' });
        }
      }
    }
    if (!autoFecha) pilha.push(no);
  }

  // --- HTML: elemento com `background-color` e sem nenhum texto dentro.
  for (const bloco of svg.matchAll(/<foreignObject\b[^>]*>([\s\S]*?)<\/foreignObject>/g)) {
    const html = bloco[1];
    const abertos = [];
    TAG.lastIndex = 0;
    let t;
    while ((t = TAG.exec(html))) {
      const [, fecha, nome, raw, autoFecha] = t;
      if (fecha) {
        for (let i = abertos.length - 1; i >= 0; i -= 1) {
          if (abertos[i].nome !== nome) continue;
          const alvo = abertos[i];
          if (alvo.fundo && !temTextoDescendente(html, alvo.fim, t.index)) {
            marcas.push({ origem: 'html', tipo: 'fill', pintura: alvo.fundo.pintura, cor: alvo.fundo.cor, area: alvo.area, isenta: false });
          }
          abertos.length = i;
          break;
        }
        continue;
      }
      const style = lerEstilo(lerAtributos(raw).style);
      const pai = abertos[abertos.length - 1] ?? null;
      const alfaCadeia = (pai?.alfa ?? 1) * (numero(style.opacity) ?? 1);
      let fundo = null;
      const pintura = style['background-color'];
      if (pintura !== undefined && pintura !== 'none') {
        const cor = lerCor(pintura);
        if (cor === 'incerto') fora('marca_com_pintura_incerta');
        else if (cor !== null && (cor.a ?? 1) * alfaCadeia > 0.001) {
          fundo = { pintura, cor: { r: cor.r, g: cor.g, b: cor.b, a: (cor.a ?? 1) * alfaCadeia } };
        }
      }
      const w = medida(style.width, NaN);
      const h = medida(style.height, NaN);
      const no = { nome, fim: TAG.lastIndex, alfa: alfaCadeia, fundo, area: w !== null && h !== null ? w * h : null };
      if (autoFecha || VAZIOS.has(nome)) {
        if (fundo) marcas.push({ origem: 'html', tipo: 'fill', pintura, cor: fundo.cor, area: no.area, isenta: false });
        continue;
      }
      abertos.push(no);
    }
  }
  return { marcas, foraPorMotivo, temTransform };
}

/**
 * Compõe a marca sobre o fundo do cartão e mede o contraste da WCAG 2.1.
 * Devolve `{ razao, corEfetiva, luminancia }`.
 */
export function medirMarca(cor, fundoDoCartao) {
  const corEfetiva = sobrepor(fundoDoCartao, cor);
  return { razao: razaoDeContraste(corEfetiva, fundoDoCartao), corEfetiva, luminancia: luminancia(corEfetiva) };
}

export { nomeDoToken };
