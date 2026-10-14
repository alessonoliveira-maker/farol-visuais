/**
 * DOM renderizado para SVG autônomo.
 *
 * Regra de decomposição, aplicada a partir da raiz da moldura:
 *
 * 1. `<svg>` "gráfico" (maior que 32 px num dos lados) sai como SVG nativo: o clone leva os
 *    atributos de geometria e, no `style`, as propriedades computadas da lista `SVG_PROPS`.
 *    `var(--*)` e `currentColor` somem porque o valor computado já é a cor.
 * 2. Elemento HTML sem SVG gráfico dentro vira uma ilha: `foreignObject` na caixa medida, com o
 *    clone XHTML e estilos computados inline. Ícone pequeno (lucide) vai junto, inline.
 * 3. Elemento HTML com SVG gráfico dentro é decomposto: a decoração (fundo, borda, raio) sai como
 *    `rect` nativo, o recorte (`overflow`) vira `clipPath`, a opacidade vira grupo, e os filhos
 *    seguem a mesma regra. Texto solto nesse elemento vira ilha de uma linha por vez.
 *
 * Estilo por LISTA EXPLÍCITA, nunca por "tudo que difere do padrão". A primeira versão fazia o
 * diff de todas as propriedades e quebrou num caso concreto: o preflight do Tailwind põe
 * `border-style: solid` com largura 0 em todo elemento; a largura igual ao padrão era omitida, o
 * estilo não, e o SVG sozinho desenhava borda `medium` de 3 px em volta de cada texto. Por isso
 * as propriedades acopladas (borda, contorno, fundo com imagem, decoração de texto, transform)
 * saem em grupo, e as demais por diff contra o pai (herdadas) ou contra o padrão da tag.
 */

export interface SerializeResult {
  readonly body: string;
  readonly width: number;
  readonly height: number;
  readonly fontUsage: Record<string, string>;
  readonly warnings: string[];
  readonly stats: { islands: number; nativeSvgs: number; rects: number; textIslands: number };
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';
const GRAPHIC_SVG_MIN = 32;

/** Propriedades de caixa e layout de HTML que mudam a imagem estática (diff contra o padrão da tag). */
const HTML_BOX_PROPS = [
  'display', 'box-sizing', 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'position', 'top', 'right', 'bottom', 'left', 'z-index', 'float', 'clear', 'vertical-align',
  'overflow-x', 'overflow-y', 'opacity', 'isolation', 'mix-blend-mode', 'filter',
  'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis', 'order',
  'justify-content', 'justify-items', 'justify-self', 'align-items', 'align-content', 'align-self',
  'row-gap', 'column-gap',
  'grid-template-columns', 'grid-template-rows', 'grid-template-areas', 'grid-auto-flow',
  'grid-auto-columns', 'grid-auto-rows', 'grid-column-start', 'grid-column-end', 'grid-row-start',
  'grid-row-end',
  'table-layout', 'object-fit', 'object-position', 'aspect-ratio',
  'background-color', 'box-shadow',
  '-webkit-line-clamp', '-webkit-box-orient', 'text-overflow',
];

/** Propriedades de texto de HTML (a maioria herdada: diff contra o pai). */
const HTML_TEXT_PROPS = [
  'color', 'font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch',
  'font-feature-settings', 'font-variation-settings', 'font-variant-numeric', 'font-variant-ligatures',
  'font-variant-caps', 'font-variant-east-asian', 'font-variant-position', 'font-kerning',
  'font-optical-sizing', 'line-height', 'letter-spacing', 'word-spacing', 'text-align',
  'text-align-last', 'text-indent', 'text-transform', 'white-space-collapse', 'text-wrap-mode',
  'text-wrap-style', 'word-break', 'overflow-wrap', 'hyphens', 'line-break', 'tab-size', 'direction',
  'unicode-bidi', 'text-shadow', 'text-rendering', 'visibility', 'list-style-type',
  'list-style-position', 'border-collapse', 'border-spacing', 'caption-side', 'empty-cells',
];

/** Na raiz de uma ilha estas saem sempre: no arquivo final não há pai estilizado de quem herdar. */
const ROOT_ALWAYS = new Set([
  'color', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing',
  'text-align', 'white-space-collapse', 'text-wrap-mode', 'direction', 'font-feature-settings',
  'font-variant-numeric',
]);

/** Propriedades de SVG copiadas do estilo computado. */
const SVG_PROPS = [
  'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray',
  'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'opacity',
  'visibility', 'font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch',
  'font-feature-settings', 'font-variant-numeric', 'font-variant-ligatures', 'font-kerning',
  'letter-spacing', 'word-spacing', 'text-anchor', 'dominant-baseline', 'alignment-baseline',
  'baseline-shift', 'text-decoration-line', 'white-space-collapse', 'text-wrap-mode', 'stop-color',
  'stop-opacity', 'flood-color', 'flood-opacity', 'lighting-color', 'vector-effect', 'paint-order',
  'shape-rendering', 'text-rendering', 'color-interpolation-filters', 'clip-rule', 'mix-blend-mode',
  'filter', 'isolation',
];
const SVG_PROPS_SET = new Set(SVG_PROPS);

const INHERITED = new Set([
  'color', 'font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch',
  'font-feature-settings', 'font-variation-settings', 'font-variant-numeric', 'font-variant-ligatures',
  'font-variant-caps', 'font-variant-east-asian', 'font-variant-position', 'font-kerning',
  'font-optical-sizing', 'line-height', 'letter-spacing', 'word-spacing', 'text-align',
  'text-align-last', 'text-indent', 'text-transform', 'white-space-collapse', 'text-wrap-mode',
  'text-wrap-style', 'word-break', 'overflow-wrap', 'hyphens', 'line-break', 'tab-size', 'direction',
  'text-shadow', 'text-rendering', 'visibility', 'list-style-type', 'list-style-position',
  'border-collapse', 'border-spacing', 'caption-side', 'empty-cells',
  'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray',
  'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'text-anchor',
  'dominant-baseline', 'paint-order', 'shape-rendering', 'clip-rule', 'color-interpolation-filters',
]);

/** Elementos SVG em que `overflow` muda o desenho. */
const SVG_OVERFLOW_TAGS = new Set(['svg', 'symbol', 'marker', 'pattern', 'foreignObject']);

const KEEP_HTML_ATTRS = /^(role|aria-[a-z-]+|lang|dir|colspan|rowspan|scope|headers|alt|abbr|datetime|value|type|checked|disabled|open)$/;
const DROP_SVG_ATTRS = /^(class|style|tabindex|focusable|data-[a-z0-9-]+|on[a-z]+)$/;
const VOID_HTML = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const SIDES = ['top', 'right', 'bottom', 'left'] as const;
const CORNERS = ['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const;

interface Ctx {
  originX: number;
  originY: number;
  warnings: Set<string>;
  stats: { islands: number; nativeSvgs: number; rects: number; textIslands: number };
  clipSeq: number;
}

// ---------------------------------------------------------------------------------------------
// valores

function r2(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(text: string): string {
  return escapeText(text).replace(/"/g, '&quot;');
}

function px(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

let colorCanvas: CanvasRenderingContext2D | null = null;
const colorCache = new Map<string, string>();

/** Cor computada em sRGB: `rgb()`/`rgba()` passam direto; oklab, oklch e `color()` são amostradas. */
function normalizeColor(value: string): string {
  const trimmed = value.trim();
  if (/^rgba?\(/.test(trimmed) || trimmed === 'transparent' || trimmed === 'none') return trimmed;
  const cached = colorCache.get(trimmed);
  if (cached) return cached;
  if (!colorCanvas) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    colorCanvas = canvas.getContext('2d', { willReadFrequently: true });
  }
  if (!colorCanvas) return trimmed;
  colorCanvas.clearRect(0, 0, 1, 1);
  colorCanvas.fillStyle = '#000';
  colorCanvas.fillStyle = trimmed;
  colorCanvas.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0, alpha = 0] = colorCanvas.getImageData(0, 0, 1, 1).data;
  const result =
    alpha === 255
      ? `rgb(${String(red)}, ${String(green)}, ${String(blue)})`
      : `rgba(${String(red)}, ${String(green)}, ${String(blue)}, ${r2(alpha / 255)})`;
  colorCache.set(trimmed, result);
  return result;
}

const COLOR_FN = /\b(?:oklab|oklch|lab|lch|hwb|color)\((?:[^()]|\([^()]*\))*\)/g;

function normalizeValue(prop: string, value: string, ctx: Ctx): string {
  let out = value.replace(COLOR_FN, (match) => normalizeColor(match));
  if (out.includes('url(')) {
    out = out.replace(/url\((["']?)([^"')]*)\1\)/g, (match, _quote: string, target: string) => {
      if (target.startsWith('data:')) return match;
      const hash = target.indexOf('#');
      if (hash >= 0) return `url("#${target.slice(hash + 1)}")`;
      ctx.warnings.add(`Recurso externo em ${prop} não embutido no SVG: ${target.slice(0, 80)}`);
      return match;
    });
  }
  if (/var\(|currentcolor/i.test(out)) {
    ctx.warnings.add(`Valor não resolvido em ${prop}: ${out.slice(0, 80)}`);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// padrões por tag

let defaultsFrame: HTMLIFrameElement | null = null;
const defaultsCache = new Map<string, Map<string, string>>();

function defaultsDoc(): Document {
  if (!defaultsFrame) {
    defaultsFrame = document.createElement('iframe');
    defaultsFrame.setAttribute('aria-hidden', 'true');
    // Largo o bastante para nenhuma largura medida coincidir com a do padrão por acaso.
    defaultsFrame.style.cssText = 'position:fixed;left:-99999px;top:0;width:4000px;height:3000px;border:0;';
    document.body.appendChild(defaultsFrame);
    const doc = defaultsFrame.contentDocument;
    if (!doc) throw new Error('iframe de padrões indisponível');
    doc.open();
    doc.write('<!doctype html><html><head></head><body></body></html>');
    doc.close();
  }
  const doc = defaultsFrame.contentDocument;
  if (!doc) throw new Error('iframe de padrões indisponível');
  return doc;
}

function defaultsFor(el: Element): Map<string, string> {
  const svg = el.namespaceURI === SVG_NS;
  const key = `${svg ? 'svg' : 'html'}|${el.localName}`;
  const cached = defaultsCache.get(key);
  if (cached) return cached;
  const doc = defaultsDoc();
  const win = doc.defaultView;
  if (!win) throw new Error('janela de padrões indisponível');
  let probe: Element;
  let holder: Element;
  if (svg) {
    holder = doc.createElementNS(SVG_NS, 'svg');
    probe = el.localName === 'svg' ? holder : doc.createElementNS(SVG_NS, el.localName);
    if (probe !== holder) holder.appendChild(probe);
  } else {
    holder = doc.createElement(el.localName);
    probe = holder;
  }
  doc.body.appendChild(holder);
  const cs = win.getComputedStyle(probe);
  const map = new Map<string, string>();
  for (let i = 0; i < cs.length; i += 1) {
    const prop = cs.item(i);
    map.set(prop, cs.getPropertyValue(prop));
  }
  holder.remove();
  defaultsCache.set(key, map);
  return map;
}

/** Diff simples de uma lista: herdada contra o pai, não herdada contra o padrão da tag. */
function diffProps(
  props: readonly string[],
  cs: CSSStyleDeclaration,
  parentCs: CSSStyleDeclaration | null,
  defaults: Map<string, string>,
  out: Map<string, string>,
  ctx: Ctx,
  isRoot: boolean,
) {
  for (const prop of props) {
    const value = cs.getPropertyValue(prop);
    if (value === '') continue;
    if (isRoot && ROOT_ALWAYS.has(prop)) {
      out.set(prop, normalizeValue(prop, value, ctx));
      continue;
    }
    const reference = INHERITED.has(prop) && parentCs ? parentCs.getPropertyValue(prop) : defaults.get(prop);
    if (value !== reference) out.set(prop, normalizeValue(prop, value, ctx));
  }
}

/** Grupos acoplados de HTML: borda por lado, raio, contorno, fundo com imagem, decoração, transform. */
function groupedHtmlProps(cs: CSSStyleDeclaration, defaults: Map<string, string>, out: Map<string, string>, ctx: Ctx) {
  for (const side of SIDES) {
    const style = cs.getPropertyValue(`border-${side}-style`);
    const width = px(cs.getPropertyValue(`border-${side}-width`));
    if (style !== 'none' && style !== 'hidden' && width > 0) {
      out.set(`border-${side}-width`, `${r2(width)}px`);
      out.set(`border-${side}-style`, style);
      out.set(`border-${side}-color`, normalizeValue('border-color', cs.getPropertyValue(`border-${side}-color`), ctx));
    } else {
      const defaultStyle = defaults.get(`border-${side}-style`) ?? 'none';
      if (defaultStyle !== 'none' && px(defaults.get(`border-${side}-width`) ?? '0') > 0) {
        out.set(`border-${side}-style`, 'none');
      }
    }
  }
  const radii = CORNERS.map((corner) => cs.getPropertyValue(`border-${corner}-radius`));
  if (radii.some((value) => value !== '0px' && value !== '')) {
    CORNERS.forEach((corner, i) => out.set(`border-${corner}-radius`, radii[i] ?? '0px'));
  }
  if (cs.outlineStyle !== 'none' && px(cs.outlineWidth) > 0) {
    out.set('outline-style', cs.outlineStyle);
    out.set('outline-width', cs.outlineWidth);
    out.set('outline-color', normalizeValue('outline-color', cs.outlineColor, ctx));
    out.set('outline-offset', cs.outlineOffset);
  }
  if (cs.backgroundImage !== 'none') {
    for (const prop of ['background-image', 'background-size', 'background-position', 'background-repeat', 'background-clip', 'background-origin']) {
      out.set(prop, normalizeValue(prop, cs.getPropertyValue(prop), ctx));
    }
  }
  if (cs.textDecorationLine !== 'none') {
    for (const prop of ['text-decoration-line', 'text-decoration-style', 'text-decoration-color', 'text-decoration-thickness', 'text-underline-offset']) {
      out.set(prop, normalizeValue(prop, cs.getPropertyValue(prop), ctx));
    }
  }
  const transforms = ['transform', 'translate', 'rotate', 'scale'].filter((prop) => {
    const value = cs.getPropertyValue(prop);
    return value !== '' && value !== 'none';
  });
  if (transforms.length) {
    for (const prop of transforms) out.set(prop, cs.getPropertyValue(prop));
    out.set('transform-origin', cs.transformOrigin);
  }
}

function htmlStyle(el: Element, cs: CSSStyleDeclaration, parentCs: CSSStyleDeclaration | null, ctx: Ctx, isRoot: boolean): Map<string, string> {
  const defaults = defaultsFor(el);
  const out = new Map<string, string>();
  diffProps(HTML_BOX_PROPS, cs, null, defaults, out, ctx, false);
  diffProps(HTML_TEXT_PROPS, cs, isRoot ? null : parentCs, defaults, out, ctx, isRoot);
  groupedHtmlProps(cs, defaults, out, ctx);
  return out;
}

function svgStyle(el: Element, cs: CSSStyleDeclaration, parentCs: CSSStyleDeclaration | null, ctx: Ctx): Map<string, string> {
  const defaults = defaultsFor(el);
  const out = new Map<string, string>();
  diffProps(SVG_PROPS, cs, parentCs, defaults, out, ctx, false);
  if (SVG_OVERFLOW_TAGS.has(el.localName)) {
    out.set('overflow', cs.overflowX === 'visible' && cs.overflowY === 'visible' ? 'visible' : 'hidden');
  }
  if (!el.hasAttribute('transform') && cs.transform !== 'none' && el.localName !== 'svg') {
    out.set('transform', cs.transform);
    out.set('transform-origin', cs.transformOrigin);
    out.set('transform-box', cs.getPropertyValue('transform-box'));
  }
  return out;
}

function styleString(map: Map<string, string>): string {
  return Array.from(map, ([prop, value]) => `${prop}:${value}`).join(';');
}

// ---------------------------------------------------------------------------------------------
// visibilidade e classificação

function isHidden(cs: CSSStyleDeclaration): boolean {
  return cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse' || cs.opacity === '0';
}

function isGraphicSvg(el: Element): boolean {
  if (el.namespaceURI !== SVG_NS || el.localName !== 'svg') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > GRAPHIC_SVG_MIN || rect.height > GRAPHIC_SVG_MIN;
}

function containsGraphicSvg(el: Element): boolean {
  for (const svg of Array.from(el.querySelectorAll('svg'))) {
    if (svg.parentElement && svg.parentElement.closest('svg')) continue;
    if (isGraphicSvg(svg)) return true;
  }
  return false;
}

function pseudoWarning(el: Element, ctx: Ctx) {
  for (const pseudo of ['::before', '::after'] as const) {
    const content = getComputedStyle(el, pseudo).content;
    if (content && content !== 'none' && content !== 'normal') {
      ctx.warnings.add(`Pseudo-elemento ${pseudo} com content não é reproduzido no SVG (${el.localName}); use elemento real.`);
    }
  }
}

/** Matriz de transform que só desloca: a caixa medida já inclui o deslocamento. */
function isPureTranslation(cs: CSSStyleDeclaration): boolean {
  const extra = ['rotate', 'scale'].some((prop) => {
    const value = cs.getPropertyValue(prop);
    return value !== '' && value !== 'none';
  });
  if (extra) return false;
  if (cs.transform === 'none') return true;
  const match = /^matrix\(([^)]+)\)$/.exec(cs.transform);
  if (!match?.[1]) return false;
  const [a, b, c, d] = match[1].split(',').map((part) => Number(part.trim()));
  return a === 1 && b === 0 && c === 0 && d === 1;
}

// ---------------------------------------------------------------------------------------------
// clones

function cloneSvgElement(
  el: Element,
  parentCs: CSSStyleDeclaration | null,
  ctx: Ctx,
  placement?: { x: number; y: number; w: number; h: number },
  standalone = false,
): string {
  const cs = getComputedStyle(el);
  if (cs.display === 'none') return '';
  const tag = el.localName;
  if (tag === 'foreignObject') {
    ctx.warnings.add('foreignObject dentro de SVG do Chart não é suportado no preview.');
    return '';
  }
  const attrs: string[] = [];
  if (tag === 'svg' && (standalone || placement)) attrs.push(`xmlns="${SVG_NS}"`);
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name;
    if (DROP_SVG_ATTRS.test(name) || name === 'xmlns') continue;
    if (SVG_PROPS_SET.has(name) || name === 'overflow') continue;
    // Só a raiz posicionada (nativa ou dentro de ilha) troca largura e altura pela caixa medida;
    // um <svg> aninhado em outro fica com os atributos originais, em unidades do pai.
    if (tag === 'svg' && (placement || standalone) && (name === 'width' || name === 'height' || name === 'x' || name === 'y')) continue;
    let value = attr.value;
    if (value.includes('url(')) {
      value = value.replace(/url\((["']?)[^"')#]*#([^"')]+)\1\)/g, 'url(#$2)');
    }
    if (/var\(|currentcolor/i.test(value)) {
      ctx.warnings.add(`Atributo ${name} com valor não resolvido: ${value.slice(0, 60)}`);
    }
    attrs.push(`${name}="${escapeAttr(value)}"`);
  }
  if (tag === 'svg' && (placement || standalone)) {
    const rect = el.getBoundingClientRect();
    if (placement) attrs.push(`x="${r2(placement.x)}"`, `y="${r2(placement.y)}"`);
    attrs.push(`width="${r2(placement?.w ?? rect.width)}"`, `height="${r2(placement?.h ?? rect.height)}"`);
  }
  // A raiz de um SVG compara com o padrão: no arquivo final ela não herda nada do HTML em volta.
  const style = svgStyle(el, cs, tag === 'svg' ? null : parentCs, ctx);
  const styleText = styleString(style);
  if (styleText) attrs.push(`style="${escapeAttr(styleText)}"`);

  let children = '';
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      children += escapeText(node.textContent ?? '');
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element;
      if (child.namespaceURI === SVG_NS) children += cloneSvgElement(child, cs, ctx);
    }
  }
  return `<${tag} ${attrs.join(' ')}>${children}</${tag}>`;
}

function cloneHtmlElement(el: Element, parentCs: CSSStyleDeclaration | null, ctx: Ctx, rootBox?: DOMRect): string {
  const cs = getComputedStyle(el);
  if (isHidden(cs)) return '';
  if (el.namespaceURI === SVG_NS) return cloneSvgElement(el, parentCs, ctx, undefined, true);
  pseudoWarning(el, ctx);
  const tag = el.localName;
  const style = htmlStyle(el, cs, parentCs, ctx, Boolean(rootBox));

  if (rootBox) {
    for (const prop of ['position', 'top', 'right', 'bottom', 'left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'float', 'z-index', 'flex-grow', 'flex-shrink', 'flex-basis', 'align-self', 'justify-self', 'order', 'grid-column-start', 'grid-column-end', 'grid-row-start', 'grid-row-end', 'min-width', 'min-height', 'max-width', 'max-height']) {
      style.delete(prop);
    }
    if (isPureTranslation(cs)) {
      for (const prop of ['transform', 'translate', 'rotate', 'scale', 'transform-origin']) style.delete(prop);
    } else {
      ctx.warnings.add(`Rotação ou escala CSS na raiz de uma ilha HTML (${tag}) pode deslocar o preview.`);
    }
    const display = cs.display;
    const map: Record<string, string> = { inline: 'block', 'inline-block': 'block', 'inline-flex': 'flex', 'inline-grid': 'grid', contents: 'block', 'list-item': 'block' };
    style.set('display', map[display] ?? display);
    style.set('box-sizing', 'border-box');
    style.set('width', `${r2(rootBox.width)}px`);
    style.set('height', `${r2(rootBox.height)}px`);
    style.set('margin', '0');
  } else if (cs.position === 'absolute' || cs.position === 'fixed') {
    const offsetParent = (el as HTMLElement).offsetParent;
    if (!offsetParent || !offsetParent.closest('[data-farol-island]')) {
      ctx.warnings.add(`Elemento ${tag} posicionado em relação a um ancestral fora da própria ilha; o preview pode deslocá-lo.`);
    }
  }

  const attrs: string[] = [];
  if (rootBox) attrs.push(`xmlns="${XHTML_NS}"`);
  for (const attr of Array.from(el.attributes)) {
    if (KEEP_HTML_ATTRS.test(attr.name)) attrs.push(`${attr.name}="${escapeAttr(attr.value)}"`);
  }
  if (tag === 'img') {
    const src = (el as HTMLImageElement).currentSrc || el.getAttribute('src') || '';
    if (src.startsWith('data:')) attrs.push(`src="${escapeAttr(src)}"`);
    else ctx.warnings.add('Imagem externa não entra no SVG; use SVG inline ou data URI.');
  }
  if (tag === 'canvas') {
    try {
      const data = (el as HTMLCanvasElement).toDataURL('image/png');
      const rect = el.getBoundingClientRect();
      return `<img xmlns="${XHTML_NS}" src="${data}" style="${escapeAttr(`display:block;width:${r2(rect.width)}px;height:${r2(rect.height)}px`)}"/>`;
    } catch {
      ctx.warnings.add('Canvas contaminado não pode ser copiado para o SVG.');
      return '';
    }
  }
  const styleText = styleString(style);
  if (styleText) attrs.push(`style="${escapeAttr(styleText)}"`);
  const open = `<${tag}${attrs.length ? ` ${attrs.join(' ')}` : ''}`;
  if (VOID_HTML.has(tag)) return `${open}/>`;

  let children = '';
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) children += escapeText(node.textContent ?? '');
    else if (node.nodeType === Node.ELEMENT_NODE) children += cloneHtmlElement(node as Element, cs, ctx);
  }
  return `${open}>${children}</${tag}>`;
}

// ---------------------------------------------------------------------------------------------
// decomposição

function boxOf(el: Element, ctx: Ctx) {
  const rect = el.getBoundingClientRect();
  return { x: rect.left - ctx.originX, y: rect.top - ctx.originY, w: rect.width, h: rect.height, rect };
}

function hasAlpha(color: string): boolean {
  const normalized = normalizeColor(color);
  if (normalized === 'transparent') return false;
  const match = /rgba\([^)]*,\s*([\d.]+)\)$/.exec(normalized);
  return !match || Number(match[1]) > 0;
}

/** Fundo, borda e raio como `rect` nativo; o que não cabe em `rect` vira ilha vazia com o mesmo CSS. */
function decoration(el: Element, cs: CSSStyleDeclaration, ctx: Ctx): string {
  const { x, y, w, h } = boxOf(el, ctx);
  if (w <= 0 || h <= 0) return '';
  const widths = SIDES.map((side) => {
    const style = cs.getPropertyValue(`border-${side}-style`);
    return style === 'none' || style === 'hidden' ? 0 : px(cs.getPropertyValue(`border-${side}-width`));
  });
  const colors = SIDES.map((side) => normalizeColor(cs.getPropertyValue(`border-${side}-color`)));
  const styles = SIDES.map((side) => cs.getPropertyValue(`border-${side}-style`));
  const radii = CORNERS.map((corner) => cs.getPropertyValue(`border-${corner}-radius`).trim());
  const hasBg = hasAlpha(cs.backgroundColor);
  const hasBorder = widths.some((width) => width > 0);
  const hasShadow = cs.boxShadow !== 'none';
  const hasImage = cs.backgroundImage !== 'none';
  const hasOutline = cs.outlineStyle !== 'none' && px(cs.outlineWidth) > 0;
  if (!hasBg && !hasBorder && !hasShadow && !hasImage && !hasOutline) return '';

  const uniformBorder = widths.every((width) => width === widths[0]) && colors.every((color) => color === colors[0]) && styles.every((s) => s === 'solid' || s === 'none');
  const uniformRadius = radii.every((value) => value === radii[0] && /^[\d.]+px$/.test(value));
  if (!hasShadow && !hasImage && !hasOutline && (uniformBorder || !hasBorder) && uniformRadius) {
    const radius = px(radii[0] ?? '0');
    let out = '';
    if (hasBg) {
      out += `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}"${radius ? ` rx="${r2(radius)}"` : ''} fill="${escapeAttr(normalizeColor(cs.backgroundColor))}"/>`;
      ctx.stats.rects += 1;
    }
    const bw = widths[0] ?? 0;
    if (hasBorder && bw > 0) {
      out += `<rect x="${r2(x + bw / 2)}" y="${r2(y + bw / 2)}" width="${r2(w - bw)}" height="${r2(h - bw)}"${radius ? ` rx="${r2(Math.max(0, radius - bw / 2))}"` : ''} fill="none" stroke="${escapeAttr(colors[0] ?? 'transparent')}" stroke-width="${r2(bw)}"/>`;
      ctx.stats.rects += 1;
    }
    return out;
  }
  const css = [
    'box-sizing:border-box',
    `width:${r2(w)}px`,
    `height:${r2(h)}px`,
    `background-color:${normalizeValue('background-color', cs.backgroundColor, ctx)}`,
    hasImage ? `background-image:${normalizeValue('background-image', cs.backgroundImage, ctx)}` : '',
    ...SIDES.map((side, i) => ((widths[i] ?? 0) > 0 ? `border-${side}:${r2(widths[i] ?? 0)}px ${styles[i] ?? 'solid'} ${colors[i] ?? 'transparent'}` : '')),
    ...CORNERS.map((corner, i) => `border-${corner}-radius:${radii[i] ?? '0'}`),
    hasShadow ? `box-shadow:${normalizeValue('box-shadow', cs.boxShadow, ctx)}` : '',
    hasOutline ? `outline:${cs.outlineWidth} ${cs.outlineStyle} ${normalizeValue('outline-color', cs.outlineColor, ctx)};outline-offset:${cs.outlineOffset}` : '',
  ].filter(Boolean);
  ctx.stats.islands += 1;
  return `<foreignObject x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" style="overflow:visible"><div xmlns="${XHTML_NS}" style="${escapeAttr(css.join(';'))}"></div></foreignObject>`;
}

const TEXT_PROPS = [
  'color', 'font-family', 'font-size', 'font-style', 'font-weight', 'font-stretch', 'font-feature-settings',
  'font-variant-numeric', 'font-variant-ligatures', 'font-variant-caps', 'font-kerning', 'letter-spacing',
  'word-spacing', 'text-transform', 'text-shadow', 'text-rendering', 'direction',
];

function textIslands(node: Text, parent: Element, ctx: Ctx): string {
  const raw = node.textContent ?? '';
  if (!raw.trim()) return '';
  const cs = getComputedStyle(parent);
  if (isHidden(cs)) return '';
  const css = TEXT_PROPS.map((prop) => `${prop}:${normalizeValue(prop, cs.getPropertyValue(prop), ctx)}`);
  if (cs.textDecorationLine !== 'none') {
    css.push(`text-decoration:${cs.textDecorationLine} ${cs.textDecorationStyle} ${normalizeColor(cs.textDecorationColor)}`);
  }
  css.push('display:block', 'white-space:pre', 'margin:0', 'padding:0', 'border:0');
  const range = document.createRange();
  const words: { text: string; rect: DOMRect }[] = [];
  const regex = /\S+\s*/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    range.setStart(node, match.index);
    range.setEnd(node, match.index + match[0].trimEnd().length);
    const rect = range.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) words.push({ text: match[0], rect });
  }
  const lines: { text: string; left: number; top: number; right: number; bottom: number }[] = [];
  for (const word of words) {
    const last = lines.at(-1);
    if (last && Math.abs(word.rect.top - last.top) < word.rect.height / 2) {
      last.text += word.text;
      last.right = Math.max(last.right, word.rect.right);
      last.bottom = Math.max(last.bottom, word.rect.bottom);
    } else {
      lines.push({ text: word.text, left: word.rect.left, top: word.rect.top, right: word.rect.right, bottom: word.rect.bottom });
    }
  }
  let out = '';
  for (const line of lines) {
    const lineHeight = line.bottom - line.top;
    const x = line.left - ctx.originX;
    const y = line.top - ctx.originY;
    const w = line.right - line.left;
    out += `<foreignObject x="${r2(x)}" y="${r2(y)}" width="${r2(w + 2)}" height="${r2(lineHeight)}" style="overflow:visible"><span xmlns="${XHTML_NS}" style="${escapeAttr(`${css.join(';')};line-height:${r2(lineHeight)}px`)}">${escapeText(line.text.trimEnd())}</span></foreignObject>`;
    ctx.stats.textIslands += 1;
  }
  return out;
}

function visit(el: Element, ctx: Ctx): string {
  const cs = getComputedStyle(el);
  if (isHidden(cs)) return '';

  if (el.namespaceURI === SVG_NS && el.localName === 'svg') {
    const box = boxOf(el, ctx);
    ctx.stats.nativeSvgs += 1;
    // A página encaixa a ORIGEM do <svg> (elemento substituído) no pixel CSS inteiro, mas escala o
    // conteúdo pelo tamanho de layout fracionário; o <svg> aninhado no arquivo não encaixa nada.
    // Medido: sem encaixe, y 85,5 dava 1,2% de pixels diferentes; arredondando também largura e
    // altura, o waffle (lado 241,3 px) dava 1,27% nas bordas das células e o KPI 0,26%; com origem
    // arredondada e tamanho fracionário, 0,03% e 0,00%.
    const x = Math.round(box.x);
    const y = Math.round(box.y);
    const w = box.w;
    const h = box.h;
    return cloneSvgElement(el, null, ctx, { x, y, w, h });
  }
  if (el.namespaceURI === SVG_NS) return '';

  if (!containsGraphicSvg(el) && cs.display !== 'contents') {
    const box = boxOf(el, ctx);
    if (box.w <= 0 && box.h <= 0) return '';
    ctx.stats.islands += 1;
    el.setAttribute('data-farol-island', '');
    const inner = cloneHtmlElement(el, null, ctx, box.rect);
    el.removeAttribute('data-farol-island');
    return `<foreignObject x="${r2(box.x)}" y="${r2(box.y)}" width="${r2(box.w)}" height="${r2(box.h)}" style="overflow:visible">${inner}</foreignObject>`;
  }

  pseudoWarning(el, ctx);
  if (cs.position !== 'static' && cs.zIndex !== 'auto' && Number(cs.zIndex) !== 0) {
    ctx.warnings.add(`z-index em elemento decomposto (${el.localName}); o SVG segue a ordem do documento.`);
  }
  let content = cs.display === 'contents' ? '' : decoration(el, cs, ctx);
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) content += visit(node as Element, ctx);
    else if (node.nodeType === Node.TEXT_NODE) content += textIslands(node as Text, el, ctx);
  }

  const clips = cs.overflowX !== 'visible' || cs.overflowY !== 'visible';
  if (clips && cs.display !== 'contents') {
    const { x, y, w, h } = boxOf(el, ctx);
    const bl = px(cs.borderLeftWidth);
    const bt = px(cs.borderTopWidth);
    const br = px(cs.borderRightWidth);
    const bb = px(cs.borderBottomWidth);
    const radius = Math.max(0, px(cs.borderTopLeftRadius) - Math.max(bl, bt));
    ctx.clipSeq += 1;
    const id = `farol-clip-${String(ctx.clipSeq)}`;
    content = `<clipPath id="${id}"><rect x="${r2(x + bl)}" y="${r2(y + bt)}" width="${r2(Math.max(0, w - bl - br))}" height="${r2(Math.max(0, h - bt - bb))}"${radius ? ` rx="${r2(radius)}"` : ''}/></clipPath><g clip-path="url(#${id})">${content}</g>`;
  }
  const opacity = Number(cs.opacity);
  if (opacity < 1) content = `<g opacity="${r2(opacity)}">${content}</g>`;
  if (!isPureTranslation(cs)) ctx.warnings.add(`Transform CSS em elemento decomposto (${el.localName}) não é reproduzido.`);
  return content;
}

// ---------------------------------------------------------------------------------------------
// fontes usadas

function collectFontUsage(root: Element): Record<string, string> {
  const usage: Record<string, Set<string>> = {};
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    const text = node.textContent ?? '';
    if (parent && text.trim()) {
      const cs = getComputedStyle(parent);
      if (!isHidden(cs)) {
        const family = (cs.fontFamily.split(',')[0] ?? '').trim().replace(/^["']|["']$/g, '');
        const key = `${family}|${cs.fontWeight}|${cs.fontStyle === 'italic' || cs.fontStyle.startsWith('oblique') ? 'italic' : 'normal'}`;
        const set = (usage[key] ??= new Set<string>());
        let chars = text;
        if (cs.textTransform === 'uppercase') chars += text.toLocaleUpperCase('pt-BR');
        if (cs.textTransform === 'lowercase') chars += text.toLocaleLowerCase('pt-BR');
        if (cs.textTransform === 'capitalize') chars += text.toLocaleUpperCase('pt-BR') + text.toLocaleLowerCase('pt-BR');
        if (cs.textOverflow === 'ellipsis' || cs.getPropertyValue('-webkit-line-clamp') !== 'none') chars += '…';
        for (const char of chars) if (!/\s/.test(char)) set.add(char);
      }
    }
    node = walker.nextNode();
  }
  return Object.fromEntries(Object.entries(usage).map(([key, set]) => [key, Array.from(set).sort().join('')]));
}

export function serializeRoot(root: HTMLElement): SerializeResult {
  const rect = root.getBoundingClientRect();
  const ctx: Ctx = {
    originX: rect.left,
    originY: rect.top,
    warnings: new Set(),
    stats: { islands: 0, nativeSvgs: 0, rects: 0, textIslands: 0 },
    clipSeq: 0,
  };
  const body = visit(root, ctx);
  return {
    body,
    width: rect.width,
    height: rect.height,
    fontUsage: collectFontUsage(root),
    warnings: Array.from(ctx.warnings),
    stats: ctx.stats,
  };
}
