/**
 * Leitor do que está PINTADO ATRÁS de cada texto do `preview.svg`, mais a aritmética de cor da
 * WCAG. Existe para a guarda CONTRASTE-TEXTO de `guardas.mjs` e não decide nada, do mesmo jeito que
 * `espessura.mjs` e `colisao.mjs` não decidem.
 *
 * POR QUE DÁ PARA MEDIR SEM NAVEGADOR. O `preview.svg` é autossuficiente por construção: o render
 * serializa o estilo COMPUTADO de cada nó, então `var(--chart-1)` já chegou aqui como
 * `fill:rgb(45, 212, 232)`. Medido no acervo em 2026-09-18, em 213 versões: 6.529 preenchimentos em
 * `rgb()`, 15 em `rgba()`, 15 em `url()` (gradiente, o único caso que não dá para resolver) e 1.317
 * `none`. A cor do texto sai igual, sempre em `rgb()`, no `<text>` ou no `<tspan>`.
 *
 * AS TRÊS DECISÕES DESTE LEITOR, que são as que o pedido manda explicar.
 *
 * 1. O QUE ESTÁ ATRÁS é resolvido pela GEOMETRIA, e não pela vizinhança no documento. O leitor junta
 *    toda forma preenchida em ORDEM DE PINTURA (ordem do documento: quem vem depois cobre quem veio
 *    antes), transforma tudo para a coordenada do cartão, e para cada ponto amostrado sob a tinta do
 *    texto compõe de baixo para cima as formas que contêm aquele ponto. O resultado é a cor que o
 *    olho vê ali. É o mesmo caminho da ESPESSURA-MARCA (retângulo da marca contra âncora do rótulo) e
 *    da COLISAO-TEXTO (caixa de tinta contra caixa de tinta), levado um passo adiante porque cunha,
 *    fatia e pétala não são retângulos:
 *      - `rect` (com `rx` inclusive), `circle` e `ellipse` têm teste exato;
 *      - `polygon`, `polyline` e `path` são ACHATADOS em polígono (arco e Bézier amostrados) e
 *        testados por número de voltas, que é a regra `fill-rule: nonzero` do SVG. Foi o que o funil
 *        exigiu: a cunha de `10/01 v2` é um `<polygon>` e a rosa de `07/07` são `<path>` com arco.
 *      - `clip-path` que aponta para um `<clipPath>` de um retângulo só entra como recorte; o grupo
 *        do Recharts sempre tem um, e sem ele uma marca recortada valeria como fundo onde ela não
 *        pinta.
 *      - o HALO da ROT-7 (`paint-order:stroke` com `stroke` opaco no texto) é tinta da superfície
 *        pintada POR BAIXO do glifo, então, quando existe, é ELE o fundo, composto sobre o que havia
 *        embaixo. No acervo o halo é sempre `stroke-width:4px` com a cor de `--surface-raised`, os
 *        292 que existem; abaixo de 2 px o leitor não o conta como fundo, porque 1 px de cada lado do
 *        glifo não é superfície, é contorno.
 *      - o que NÃO entra: `stroke` de forma (linha de grade, contorno de marca) e `filter`. Uma linha
 *        de 2 px atrás de um rótulo não muda a cor da maioria da tinta, e é para ela que a ROT-7 pede
 *        halo. Fica declarado como ponto cego.
 *
 * 2. A PARCELA DA TINTA que cada fundo cobre é medida, não suposta. A caixa de tinta de cada trecho
 *    de texto é amostrada numa grade (colunas de 2 px, 3 linhas), e cada fundo sai com a fração de
 *    amostras que ele pega. Isso existe porque o defeito que motivou a guarda é exatamente PARCIAL:
 *    em `10/01 v2` a caixa de superfície cobria duas das três linhas do rótulo e a terceira caía
 *    sobre a cunha. Quem decide o que fazer com a fração é a guarda, não este leitor.
 *
 * 3. TRANSPARÊNCIA é composta, não ignorada. `fill-opacity` e `opacity` aparecem em 56 e 63 versões,
 *    e a cunha do funil é `fill-opacity:0.38`: ler a cor pura daria um contraste que não existe na
 *    tela. A composição é a do SVG, canal por canal, sobre o que já estava pintado.
 *
 * O QUE VIRA INCERTO, e por isso sai como NÃO MEDIDO em vez de sair como aprovado:
 *   - preenchimento em `url(#...)` (gradiente ou padrão): 2 versões do acervo têm `linearGradient`.
 *   - forma sem cor resolvível na cadeia de herança.
 *   - `transform` com giro, escala ou inclinação em volta de forma ou de texto: como em
 *     `espessura.mjs` e em `colisao.mjs`, compor a matriz cheia não é coisa que este leitor faça.
 *     `<svg>` aninhado com escala uniforme, esse sim, é resolvido, porque é como o ícone da lucide
 *     entra e ele acabaria pintando fundo em lugar errado.
 *   - `clip-path` que não seja um retângulo só.
 *
 * FÓRMULA DA COR: WCAG 2.1, definições de luminância relativa e de razão de contraste
 * (https://www.w3.org/TR/WCAG21/#dfn-relative-luminance e #dfn-contrast-ratio). É a mesma conta com
 * que o CONTRATO.md mediu a tabela da 17.10 sobre `app/src/styles/tokens.css`, então os números
 * desta guarda são comparáveis, um a um, com os pares já aprovados lá.
 */

/** Espaço entre colunas de amostra na caixa de tinta, em px. */
export const AMOSTRA_PASSO = 2;
/** Colunas mínima e máxima por trecho de texto, para a conta não explodir em rótulo largo. */
export const AMOSTRA_COLUNAS_MIN = 5;
export const AMOSTRA_COLUNAS_MAX = 41;
/** Linhas de amostra na altura da tinta, em fração da caixa (nem na borda de cima nem na de baixo). */
export const AMOSTRA_LINHAS = [0.25, 0.5, 0.75];
/** Halo abaixo desta espessura não conta como fundo: é contorno de glifo, não superfície. */
export const HALO_MINIMO = 2;

const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
const ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
/** Subárvores que definem, não desenham (mesma lista de `espessura.mjs` e de `colisao.mjs`). */
const NAO_DESENHA = new Set(['defs', 'clipPath', 'pattern', 'mask', 'marker', 'symbol']);
/** Formas que preenchem área. `line` fica fora de propósito: ela só tem traço. */
const FORMAS = new Set(['rect', 'path', 'polygon', 'polyline', 'circle', 'ellipse']);
/** Tolerância da escala de um `<svg>` aninhado antes de valer a pena escalar (igual a colisao.mjs). */
const ESCALA_TOLERANCIA = 0.001;
/** Segmentos por quadrante de arco e por Bézier no achatamento: 0,1 px de erro em raio de 100 px. */
const PASSOS_POR_CURVA = 24;

// ---------------------------------------------------------------------------------------------
// Cor
// ---------------------------------------------------------------------------------------------

/** As poucas cores nomeadas que um SVG do catálogo poderia trazer; o resto nunca apareceu. */
const NOMEADAS = {
  black: [0, 0, 0], white: [255, 255, 255], transparent: [0, 0, 0, 0], none: null,
};

/**
 * Cor de uma declaração de pintura. Devolve `{ r, g, b, a }`, `null` quando não pinta (`none`) ou
 * `'incerto'` quando pinta com algo que este leitor não sabe resolver (gradiente, padrão, variável).
 */
export function lerCor(valor) {
  const texto = String(valor ?? '').trim().toLowerCase();
  if (!texto) return null;
  if (texto === 'none' || texto === 'transparent') return null;
  if (texto.startsWith('url(') || texto.startsWith('var(')) return 'incerto';
  const rgb = /^rgba?\(\s*([-\d.]+)[\s,]+([-\d.]+)[\s,]+([-\d.]+)(?:[\s,/]+([\d.%]+))?\s*\)$/.exec(texto);
  if (rgb) {
    const alfa = rgb[4] === undefined ? 1 : rgb[4].endsWith('%') ? Number.parseFloat(rgb[4]) / 100 : Number.parseFloat(rgb[4]);
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]), a: Number.isFinite(alfa) ? alfa : 1 };
  }
  const hex = /^#([0-9a-f]{3,8})$/.exec(texto);
  if (hex) {
    const d = hex[1];
    const par = (i) => Number.parseInt(d.length <= 4 ? d[i] + d[i] : d.slice(i * 2, i * 2 + 2), 16);
    const alfaHex = d.length === 4 ? par(3) / 255 : d.length === 8 ? par(3) / 255 : 1;
    return { r: par(0), g: par(1), b: par(2), a: alfaHex };
  }
  if (texto in NOMEADAS) {
    const n = NOMEADAS[texto];
    return n ? { r: n[0], g: n[1], b: n[2], a: n[3] ?? 1 } : null;
  }
  return 'incerto';
}

/** Compõe `alto` (com alfa) sobre `baixo` (opaco), canal por canal. */
export function sobrepor(baixo, alto) {
  const a = Math.max(0, Math.min(1, alto.a ?? 1));
  if (a >= 1) return { r: alto.r, g: alto.g, b: alto.b, a: 1 };
  return {
    r: alto.r * a + baixo.r * (1 - a),
    g: alto.g * a + baixo.g * (1 - a),
    b: alto.b * a + baixo.b * (1 - a),
    a: 1,
  };
}

/** Luminância relativa da WCAG 2.1. */
export function luminancia({ r, g, b }) {
  const canal = (v) => {
    const c = Math.max(0, Math.min(1, v / 255));
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Razão de contraste da WCAG 2.1, de 1 a 21. */
export function razaoDeContraste(corA, corB) {
  const a = luminancia(corA);
  const b = luminancia(corB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** `rgb(1, 2, 3)` para o texto da mensagem, já arredondado. */
export function corEmTexto({ r, g, b }) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// ---------------------------------------------------------------------------------------------
// Geometria: achatar a forma em polígono
// ---------------------------------------------------------------------------------------------

function numeros(texto) {
  return [...String(texto ?? '').matchAll(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g)].map((m) => Number(m[0]));
}

/** Arco elíptico do SVG, da forma de ponto final para a de centro, e daí para pontos. */
function pontosDoArco(x0, y0, rx, ry, giroGraus, arcoGrande, sentido, x1, y1) {
  if (!rx || !ry) return [{ x: x1, y: y1 }];
  const fi = (giroGraus * Math.PI) / 180;
  const cosF = Math.cos(fi);
  const senF = Math.sin(fi);
  const dx = (x0 - x1) / 2;
  const dy = (y0 - y1) / 2;
  const x1l = cosF * dx + senF * dy;
  const y1l = -senF * dx + cosF * dy;
  let rax = Math.abs(rx);
  let ray = Math.abs(ry);
  const lambda = (x1l * x1l) / (rax * rax) + (y1l * y1l) / (ray * ray);
  if (lambda > 1) {
    const k = Math.sqrt(lambda);
    rax *= k;
    ray *= k;
  }
  const num = rax * rax * ray * ray - rax * rax * y1l * y1l - ray * ray * x1l * x1l;
  const den = rax * rax * y1l * y1l + ray * ray * x1l * x1l;
  const coef = (arcoGrande === sentido ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxl = (coef * rax * y1l) / ray;
  const cyl = (-coef * ray * x1l) / rax;
  const cx = cosF * cxl - senF * cyl + (x0 + x1) / 2;
  const cy = senF * cxl + cosF * cyl + (y0 + y1) / 2;
  const angulo = (ux, uy, vx, vy) => {
    const sinal = ux * vy - uy * vx < 0 ? -1 : 1;
    const cos = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
    return sinal * Math.acos(Math.max(-1, Math.min(1, cos)));
  };
  const teta1 = angulo(1, 0, (x1l - cxl) / rax, (y1l - cyl) / ray);
  let deltaTeta = angulo((x1l - cxl) / rax, (y1l - cyl) / ray, (-x1l - cxl) / rax, (-y1l - cyl) / ray);
  if (!sentido && deltaTeta > 0) deltaTeta -= 2 * Math.PI;
  if (sentido && deltaTeta < 0) deltaTeta += 2 * Math.PI;
  const passos = Math.max(2, Math.ceil((Math.abs(deltaTeta) / (Math.PI / 2)) * PASSOS_POR_CURVA));
  const saida = [];
  for (let i = 1; i <= passos; i += 1) {
    const t = teta1 + (deltaTeta * i) / passos;
    saida.push({
      x: cosF * rax * Math.cos(t) - senF * ray * Math.sin(t) + cx,
      y: senF * rax * Math.cos(t) + cosF * ray * Math.sin(t) + cy,
    });
  }
  return saida;
}

function pontosDaBezier(p0, p1, p2, p3) {
  const saida = [];
  for (let i = 1; i <= PASSOS_POR_CURVA; i += 1) {
    const t = i / PASSOS_POR_CURVA;
    const u = 1 - t;
    saida.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    });
  }
  return saida;
}

/**
 * Achata um `d` de `<path>` em subcaminhos de pontos. Cobre M, L, H, V, C, S, Q, T, A e Z, nas duas
 * caixas, que é o que o acervo desenha (medido em 2026-09-18: L, C, A, M, Z, h, v, a, m, l, H, z, V,
 * c, q). Comando desconhecido devolve `null`, e a forma vira incerta.
 */
export function achatarCaminho(d) {
  const partes = String(d ?? '').match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g);
  if (!partes) return [];
  const subs = [];
  let atual = null;
  let x = 0;
  let y = 0;
  let inicioX = 0;
  let inicioY = 0;
  let ctrlX = null;
  let ctrlY = null;
  let ultimoTipo = '';
  const põe = (px, py) => {
    if (!atual) {
      atual = [];
      subs.push(atual);
    }
    atual.push({ x: px, y: py });
  };
  for (const parte of partes) {
    const cmd = parte[0];
    const rel = cmd === cmd.toLowerCase();
    const n = numeros(parte.slice(1));
    const maiusculo = cmd.toUpperCase();
    let i = 0;
    if (maiusculo === 'Z') {
      if (atual && atual.length) {
        x = inicioX;
        y = inicioY;
      }
      atual = null;
      ultimoTipo = 'Z';
      continue;
    }
    const tamanho = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7 }[maiusculo];
    if (!tamanho) return null;
    while (i + tamanho <= n.length) {
      const arg = n.slice(i, i + tamanho);
      i += tamanho;
      if (maiusculo === 'M') {
        x = rel ? x + arg[0] : arg[0];
        y = rel ? y + arg[1] : arg[1];
        atual = null;
        põe(x, y);
        inicioX = x;
        inicioY = y;
        ctrlX = null;
        ctrlY = null;
      } else if (maiusculo === 'L') {
        x = rel ? x + arg[0] : arg[0];
        y = rel ? y + arg[1] : arg[1];
        põe(x, y);
        ctrlX = null;
        ctrlY = null;
      } else if (maiusculo === 'H') {
        x = rel ? x + arg[0] : arg[0];
        põe(x, y);
        ctrlX = null;
        ctrlY = null;
      } else if (maiusculo === 'V') {
        y = rel ? y + arg[0] : arg[0];
        põe(x, y);
        ctrlX = null;
        ctrlY = null;
      } else if (maiusculo === 'C' || maiusculo === 'S') {
        const p0 = { x, y };
        let p1;
        if (maiusculo === 'C') p1 = { x: rel ? x + arg[0] : arg[0], y: rel ? y + arg[1] : arg[1] };
        else p1 = /[CS]/.test(ultimoTipo) && ctrlX !== null ? { x: 2 * x - ctrlX, y: 2 * y - ctrlY } : { x, y };
        const desloca = maiusculo === 'C' ? 2 : 0;
        const p2 = { x: rel ? x + arg[desloca] : arg[desloca], y: rel ? y + arg[desloca + 1] : arg[desloca + 1] };
        const p3 = { x: rel ? x + arg[desloca + 2] : arg[desloca + 2], y: rel ? y + arg[desloca + 3] : arg[desloca + 3] };
        for (const p of pontosDaBezier(p0, p1, p2, p3)) põe(p.x, p.y);
        ctrlX = p2.x;
        ctrlY = p2.y;
        x = p3.x;
        y = p3.y;
      } else if (maiusculo === 'Q' || maiusculo === 'T') {
        const p0 = { x, y };
        let q;
        if (maiusculo === 'Q') q = { x: rel ? x + arg[0] : arg[0], y: rel ? y + arg[1] : arg[1] };
        else q = /[QT]/.test(ultimoTipo) && ctrlX !== null ? { x: 2 * x - ctrlX, y: 2 * y - ctrlY } : { x, y };
        const desloca = maiusculo === 'Q' ? 2 : 0;
        const fim = { x: rel ? x + arg[desloca] : arg[desloca], y: rel ? y + arg[desloca + 1] : arg[desloca + 1] };
        // Quadrática vira cúbica equivalente, para reusar o mesmo amostrador.
        const p1 = { x: p0.x + (2 / 3) * (q.x - p0.x), y: p0.y + (2 / 3) * (q.y - p0.y) };
        const p2 = { x: fim.x + (2 / 3) * (q.x - fim.x), y: fim.y + (2 / 3) * (q.y - fim.y) };
        for (const p of pontosDaBezier(p0, p1, p2, fim)) põe(p.x, p.y);
        ctrlX = q.x;
        ctrlY = q.y;
        x = fim.x;
        y = fim.y;
      } else if (maiusculo === 'A') {
        const fimX = rel ? x + arg[5] : arg[5];
        const fimY = rel ? y + arg[6] : arg[6];
        for (const p of pontosDaArcoSeguro(x, y, arg[0], arg[1], arg[2], arg[3], arg[4], fimX, fimY)) põe(p.x, p.y);
        x = fimX;
        y = fimY;
        ctrlX = null;
        ctrlY = null;
      }
      ultimoTipo = maiusculo;
    }
  }
  return subs.filter((sub) => sub.length >= 2);
}

function pontosDaArcoSeguro(x0, y0, rx, ry, giro, grande, sentido, x1, y1) {
  try {
    return pontosDoArco(x0, y0, rx, ry, giro, Number(grande) !== 0, Number(sentido) !== 0, x1, y1);
  } catch {
    return [{ x: x1, y: y1 }];
  }
}

/** Número de voltas do polígono em volta do ponto: diferente de zero é dentro (`fill-rule` padrão). */
function dentroDosPoligonos(subs, px, py) {
  let voltas = 0;
  for (const sub of subs) {
    for (let i = 0; i < sub.length; i += 1) {
      const a = sub[i];
      const b = sub[(i + 1) % sub.length];
      if (a.y <= py) {
        if (b.y > py && (b.x - a.x) * (py - a.y) - (px - a.x) * (b.y - a.y) > 0) voltas += 1;
      } else if (b.y <= py && (b.x - a.x) * (py - a.y) - (px - a.x) * (b.y - a.y) < 0) voltas -= 1;
    }
  }
  return voltas !== 0;
}

// ---------------------------------------------------------------------------------------------
// Leitura das formas pintadas
// ---------------------------------------------------------------------------------------------

function lerAtributos(raw) {
  const out = {};
  for (const m of raw.matchAll(ATTR)) out[m[1]] = m[2];
  return out;
}

/** Igual a `colisao.mjs`: `&quot;` termina em ponto e vírgula e partiria a declaração no meio. */
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
  const n = Number.parseFloat(String(valor).trim());
  return Number.isFinite(n) ? n : null;
}

function medida(valor, base) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  if (texto.endsWith('%')) {
    const pct = Number.parseFloat(texto);
    return Number.isFinite(pct) && Number.isFinite(base) ? (pct / 100) * base : null;
  }
  return numero(texto);
}

/** Translação pura, como em `colisao.mjs`; `null` quando gira, escala ou inclina. */
function translacao(valor) {
  const texto = String(valor ?? '').trim();
  if (!texto || texto === 'none') return { dx: 0, dy: 0 };
  const matriz = /^matrix\(\s*([-\d.eE]+)\s*,\s*([-\d.eE]+)\s*,\s*([-\d.eE]+)\s*,\s*([-\d.eE]+)\s*,\s*([-\d.eE]+)\s*,\s*([-\d.eE]+)\s*\)$/.exec(texto);
  if (matriz) {
    const [a, b, c, d, e, f] = matriz.slice(1).map(Number);
    if (Math.abs(a - 1) > 1e-6 || Math.abs(d - 1) > 1e-6 || Math.abs(b) > 1e-6 || Math.abs(c) > 1e-6) return null;
    return { dx: e, dy: f };
  }
  const mover = /^translate\(\s*([-\d.eE]+)(?:px)?\s*(?:[,\s]\s*([-\d.eE]+)(?:px)?)?\s*\)$/.exec(texto);
  if (mover) return { dx: Number(mover[1]), dy: Number(mover[2] ?? 0) };
  return null;
}

/**
 * `<clipPath id>` em partes que o leitor sabe testar, ou `'incerto'`.
 *
 * Precisa ir além do retângulo: o Recharts recorta cada FAIXA de uma pilha por um `<clipPath>` de um
 * `<path>` de cantos arredondados (`recharts-bar-stack-clip-path-*`), e tratá-lo como incerto
 * descartava a marca inteira, o que fazia a guarda ler o cartão atrás de um rótulo que está sobre a
 * barra. Foi a primeira correção que a calibração pediu, em `02/03 v3`.
 *
 * A região do recorte é a UNIÃO das partes, que é como o SVG a define.
 */
function lerRecortes(svg) {
  const mapa = new Map();
  for (const m of svg.matchAll(/<clipPath\s([^>]*)>([\s\S]*?)<\/clipPath>/g)) {
    const id = lerAtributos(m[1]).id;
    if (!id) continue;
    const dentro = m[2];
    const partes = [];
    let incerto = /<(use|circle|ellipse|text)\b/.test(dentro);
    for (const alvo of dentro.matchAll(/<(rect|path|polygon)\s([^>]*?)\/?>/g)) {
      const a = lerAtributos(alvo[2]);
      if (alvo[1] === 'rect') {
        const x = numero(a.x) ?? 0;
        const y = numero(a.y) ?? 0;
        const w = numero(a.width);
        const h = numero(a.height);
        if (w === null || h === null) incerto = true;
        else partes.push({ tipo: 'rect', x0: Math.min(x, x + w), y0: Math.min(y, y + h), x1: Math.max(x, x + w), y1: Math.max(y, y + h) });
        continue;
      }
      let subs = null;
      if (alvo[1] === 'path') subs = achatarCaminho(a.d);
      else {
        const n = numeros(a.points);
        const pontos = [];
        for (let i = 0; i + 1 < n.length; i += 2) pontos.push({ x: n[i], y: n[i + 1] });
        subs = pontos.length >= 2 ? [pontos] : [];
      }
      if (!subs || !subs.length) incerto = true;
      else partes.push({ tipo: 'poli', subs });
    }
    mapa.set(id, incerto || !partes.length ? 'incerto' : partes);
  }
  return mapa;
}

/** Leva as partes de um recorte para a coordenada do cartão. */
function moverRecorte(partes, no) {
  const T = (x, y) => ({ x: x * no.s + no.dx, y: y * no.s + no.dy });
  return partes.map((parte) => {
    if (parte.tipo === 'rect') {
      const p0 = T(parte.x0, parte.y0);
      const p1 = T(parte.x1, parte.y1);
      return { tipo: 'rect', x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y };
    }
    return { tipo: 'poli', subs: parte.subs.map((sub) => sub.map((p) => T(p.x, p.y))) };
  });
}

/**
 * Devolve `{ formas, temTransform }`.
 *
 * `formas` vem em ordem de pintura, cada uma com:
 *   `cor` ({ r, g, b, a } já com o `opacity` da cadeia embutido no alfa), `incerto` (a cor ou a
 *   geometria não são resolvíveis), `bbox`, `contem(x, y)` e `recortes` (já na coordenada do cartão).
 *
 * `temTransform` é a saída de segurança: giro, escala ou inclinação fora de `<svg>` aninhado.
 */
export function lerFundos(conteudo) {
  const svg = conteudo.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const recortesDefinidos = lerRecortes(svg);
  const pilha = [];
  const formas = [];
  let temTransform = false;
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
    const mover = translacao(attrs.transform ?? style.transform);
    const herdado = pilha[pilha.length - 1] ?? {
      dx: 0, dy: 0, s: 1, oculto: false, html: false, girado: false, janelaW: NaN, janelaH: NaN,
      pintura: undefined, alfa: 1, recortes: [],
    };
    const no = {
      nome,
      dx: herdado.dx + (mover?.dx ?? 0) * herdado.s,
      dy: herdado.dy + (mover?.dy ?? 0) * herdado.s,
      s: herdado.s,
      oculto: herdado.oculto || NAO_DESENHA.has(nome),
      html: herdado.html || nome === 'foreignObject',
      girado: herdado.girado || !mover,
      janelaW: herdado.janelaW,
      janelaH: herdado.janelaH,
      pintura: style.fill ?? attrs.fill ?? herdado.pintura,
      alfa: herdado.alfa * (numero(style.opacity ?? attrs.opacity) ?? 1),
      recortes: herdado.recortes,
    };
    if (nome === 'svg') {
      const vb = (attrs.viewBox ?? '').split(/[\s,]+/).map(Number);
      const ok = vb.length === 4 && vb.every(Number.isFinite);
      const largura = numero(attrs.width);
      const escala = ok && largura ? largura / vb[2] : 1;
      no.dx += (medida(attrs.x, herdado.janelaW) ?? 0) * herdado.s;
      no.dy += (medida(attrs.y, herdado.janelaH) ?? 0) * herdado.s;
      if (Math.abs(escala - 1) > ESCALA_TOLERANCIA) no.s = herdado.s * escala;
      if (ok) {
        no.dx -= vb[0] * no.s;
        no.dy -= vb[1] * no.s;
      }
      no.janelaW = ok ? vb[2] : largura ?? herdado.janelaW;
      no.janelaH = ok ? vb[3] : numero(attrs.height) ?? herdado.janelaH;
    }
    const idRecorte = /url\(\s*["']?#([^)"']+)/.exec(style['clip-path'] ?? attrs['clip-path'] ?? '')?.[1];
    if (idRecorte) {
      const alvo = recortesDefinidos.get(idRecorte) ?? 'incerto';
      no.recortes = [...no.recortes, alvo === 'incerto' ? 'incerto' : moverRecorte(alvo, no)];
    }
    if (no.girado && !no.oculto && !no.html && (FORMAS.has(nome) || nome === 'text')) temTransform = true;
    if (!no.oculto && !no.html && !no.girado && FORMAS.has(nome)) {
      const forma = montarForma(nome, attrs, style, no);
      if (forma) formas.push(forma);
    }
    if (!autoFecha) pilha.push(no);
  }
  return { formas, temTransform };
}

function montarForma(nome, attrs, style, no) {
  const pintura = style.fill ?? attrs.fill ?? no.pintura;
  const cor = lerCor(pintura);
  if (cor === null) return null; // não pinta área
  const alfaPreenchimento = numero(style['fill-opacity'] ?? attrs['fill-opacity']) ?? 1;
  const incertoCor = cor === 'incerto' || pintura === undefined;
  const base = incertoCor ? { r: 0, g: 0, b: 0, a: 1 } : cor;
  const T = (x, y) => ({ x: x * no.s + no.dx, y: y * no.s + no.dy });
  const comum = {
    cor: { r: base.r, g: base.g, b: base.b, a: (base.a ?? 1) * alfaPreenchimento * no.alfa },
    incerto: incertoCor,
    recortes: no.recortes,
    nome,
  };
  if (comum.cor.a <= 0.001) return null;
  if (nome === 'rect') {
    const x = medida(attrs.x, no.janelaW) ?? 0;
    const y = medida(attrs.y, no.janelaH) ?? 0;
    const w = medida(attrs.width, no.janelaW);
    const h = medida(attrs.height, no.janelaH);
    if (w === null || h === null) return null;
    const p0 = T(Math.min(x, x + w), Math.min(y, y + h));
    const p1 = T(Math.max(x, x + w), Math.max(y, y + h));
    const bbox = { x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y };
    return { ...comum, bbox, contem: (px, py) => px >= bbox.x0 && px <= bbox.x1 && py >= bbox.y0 && py <= bbox.y1 };
  }
  if (nome === 'circle' || nome === 'ellipse') {
    const cx = medida(attrs.cx, no.janelaW) ?? 0;
    const cy = medida(attrs.cy, no.janelaH) ?? 0;
    const rx = nome === 'circle' ? medida(attrs.r, no.janelaW) : medida(attrs.rx, no.janelaW);
    const ry = nome === 'circle' ? medida(attrs.r, no.janelaH) : medida(attrs.ry, no.janelaH);
    if (!rx || !ry) return null;
    const c = T(cx, cy);
    const ax = rx * no.s;
    const ay = ry * no.s;
    const bbox = { x0: c.x - ax, y0: c.y - ay, x1: c.x + ax, y1: c.y + ay };
    return { ...comum, bbox, contem: (px, py) => ((px - c.x) / ax) ** 2 + ((py - c.y) / ay) ** 2 <= 1 };
  }
  let subs = null;
  if (nome === 'path') subs = achatarCaminho(attrs.d);
  else {
    const n = numeros(attrs.points);
    const pontos = [];
    for (let i = 0; i + 1 < n.length; i += 2) pontos.push({ x: n[i], y: n[i + 1] });
    subs = pontos.length >= 2 ? [pontos] : [];
  }
  if (subs === null) return { ...comum, incerto: true, bbox: null, contem: () => false };
  if (!subs.length) return null;
  const mapeados = subs.map((sub) => sub.map((p) => T(p.x, p.y)));
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const sub of mapeados) {
    for (const p of sub) {
      x0 = Math.min(x0, p.x);
      y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x);
      y1 = Math.max(y1, p.y);
    }
  }
  return { ...comum, bbox: { x0, y0, x1, y1 }, contem: (px, py) => dentroDosPoligonos(mapeados, px, py) };
}

/**
 * A forma pinta neste ponto? Conta o recorte da cadeia, que só diminui a área. Devolve `true`,
 * `false` ou `'incerto'`: recorte que o leitor não sabe testar sobre uma forma que cobriria o ponto
 * não pode virar "não pinta", senão a guarda leria o cartão atrás de uma marca que está lá.
 */
function pinta(forma, px, py) {
  let duvida = false;
  for (const recorte of forma.recortes) {
    if (recorte === 'incerto') {
      duvida = true;
      continue;
    }
    // A região do recorte é a união das suas partes.
    const dentro = recorte.some((parte) => (parte.tipo === 'rect'
      ? px >= parte.x0 && px <= parte.x1 && py >= parte.y0 && py <= parte.y1
      : dentroDosPoligonos(parte.subs, px, py)));
    if (!dentro) return false;
  }
  if (!forma.contem(px, py)) return false;
  return duvida ? 'incerto' : true;
}

/**
 * Amostra a caixa de tinta e devolve os fundos encontrados, cada um com a fração da tinta que cobre:
 * `[{ cor, cobertura, incerto, formas }]`, do mais coberto para o menos. `halo` opcional
 * (`{ cor, espessura }`) é composto por cima de tudo, porque é tinta pintada sob o glifo.
 */
export function fundosDaCaixa(formas, caixa, halo = null) {
  const largura = Math.max(0, caixa.x1 - caixa.x0);
  const colunas = Math.max(AMOSTRA_COLUNAS_MIN, Math.min(AMOSTRA_COLUNAS_MAX, Math.round(largura / AMOSTRA_PASSO) + 1));
  const candidatas = formas.filter((f) => f.bbox === null || (f.bbox.x1 >= caixa.x0 && f.bbox.x0 <= caixa.x1 && f.bbox.y1 >= caixa.y0 && f.bbox.y0 <= caixa.y1));
  const grupos = new Map();
  let amostras = 0;
  for (let i = 0; i < colunas; i += 1) {
    const px = colunas === 1 ? (caixa.x0 + caixa.x1) / 2 : caixa.x0 + ((caixa.x1 - caixa.x0) * i) / (colunas - 1);
    for (const fracao of AMOSTRA_LINHAS) {
      const py = caixa.y0 + (caixa.y1 - caixa.y0) * fracao;
      amostras += 1;
      let cor = null;
      let incerto = false;
      const nomes = [];
      for (const forma of candidatas) {
        if (forma.incerto && forma.bbox === null) {
          incerto = true;
          continue;
        }
        const cobre = pinta(forma, px, py);
        if (cobre === false) continue;
        if (cobre === 'incerto') {
          incerto = true;
          continue;
        }
        if (forma.incerto) incerto = true;
        cor = cor === null ? { r: forma.cor.r, g: forma.cor.g, b: forma.cor.b, a: 1 } : sobrepor(cor, forma.cor);
        nomes.push(forma.nome);
      }
      if (halo && cor !== null) cor = sobrepor(cor, halo.cor);
      const chave = cor === null ? 'sem_fundo' : `${incerto ? 'i' : 'c'}:${Math.round(cor.r)},${Math.round(cor.g)},${Math.round(cor.b)}`;
      const grupo = grupos.get(chave) ?? { cor, incerto, n: 0, formas: new Set() };
      grupo.n += 1;
      for (const nome of nomes) grupo.formas.add(nome);
      grupos.set(chave, grupo);
    }
  }
  return [...grupos.values()]
    .map((g) => ({ cor: g.cor, cobertura: g.n / amostras, incerto: g.incerto, formas: [...g.formas] }))
    .sort((a, b) => b.cobertura - a.cobertura);
}
