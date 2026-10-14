/**
 * Leitor do TAMANHO de cada texto que o `preview.svg` escreve DENTRO de `foreignObject`, isto é, em
 * HTML. Existe para a guarda TAMANHO-TEXTO de `guardas.mjs` e não decide nada.
 *
 * POR QUE ESTE LEITOR EXISTE, quando `colisao.mjs` já entrega `fonte` por trecho de `<text>`. Porque
 * o piso da TIP-2 é um número declarado, não uma medida de geometria, e é justamente por isso que ele
 * pode ser lido onde a geometria não alcança. Medido no acervo em 2026-09-18, nas 213 versões: dos 4
 * lugares com texto abaixo de 11 px, DOIS estão em `<text>` de SVG (`03/02 v2` com 10 px, `07/07 v4`
 * com 9 px) e DOIS em HTML dentro de `foreignObject` (`02/08 v4` com um selo de 10 px, `05/09 v4` com
 * um sinal de 9 px). Uma guarda que só lesse SVG cobriria metade do passivo e diria "medida" para a
 * outra metade, que é a saída calada que estas guardas existem para não dar. A COLISAO-TEXTO e a
 * CONTRASTE-TEXTO continuam sem alcançar o HTML, porque ali o que falta é POSIÇÃO, que depende do
 * fluxo do navegador, e não tamanho.
 *
 * COMO O TAMANHO É RESOLVIDO. O render serializa o estilo COMPUTADO de cada nó, então `font-size`
 * chega sempre em px e sempre explícito em quem o define; o leitor só precisa seguir a cadeia de
 * herança de pai para filho e guardar o texto de cada elemento com o tamanho vigente ali. `em`, `rem`
 * e palavra-chave (`small`) nunca apareceram; se aparecerem, o trecho sai como sem tamanho, nunca
 * como aprovado por omissão.
 *
 * O QUE ENTRA. Todo `foreignObject` do arquivo, inclusive o cabeçalho do cartão, que é da moldura da
 * ferramenta e não da versão: o título mede 14 ou 16 px e o subtítulo 12 px, sempre acima do piso, e
 * separar a moldura do conteúdo exigiria um sinal no arquivo que não existe. Se um dia a moldura
 * escrever abaixo de 11 px, a guarda vai acusar a versão por um texto que não é dela, e o conserto é
 * a moldura, não a versão.
 */

const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
const ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
/** Elementos HTML que fecham sozinhos e nunca guardam texto. */
const VAZIOS = new Set(['br', 'hr', 'img', 'input', 'source', 'wbr']);

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

function decodificar(texto) {
  return texto
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** `font-size` em px, ou `null` quando a declaração não está em px. */
function tamanhoEmPx(valor) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  if (!/px$/.test(texto)) return null;
  const n = Number.parseFloat(texto);
  return Number.isFinite(n) ? n : null;
}

/**
 * Devolve `{ trechos, semTamanho }` do texto em HTML.
 *
 * `trechos`: `{ texto, fonte, tag }`, um por elemento com texto próprio. `semTamanho` conta os
 * trechos cuja cadeia não declara `font-size` em px, que a guarda reporta como não medidos.
 */
export function lerTextosHtml(conteudo) {
  const svg = conteudo.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const trechos = [];
  let semTamanho = 0;
  for (const bloco of svg.matchAll(/<foreignObject\b[^>]*>([\s\S]*?)<\/foreignObject>/g)) {
    const html = bloco[1];
    const pilha = [];
    let fim = 0;
    TAG.lastIndex = 0;
    let m;
    const guardar = (bruto) => {
      const topo = pilha[pilha.length - 1];
      if (!topo) return;
      const texto = decodificar(bruto).replace(/\s+/g, ' ');
      if (!texto.trim()) return;
      if (topo.fonte === null) {
        semTamanho += 1;
        return;
      }
      trechos.push({ texto: texto.trim(), fonte: topo.fonte, tag: topo.nome });
    };
    while ((m = TAG.exec(html))) {
      guardar(html.slice(fim, m.index));
      fim = TAG.lastIndex;
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
      const style = lerEstilo(lerAtributos(raw).style);
      const herdado = pilha[pilha.length - 1] ?? { fonte: null };
      const declarado = style['font-size'];
      const no = { nome, fonte: declarado === undefined ? herdado.fonte : tamanhoEmPx(declarado) };
      if (!autoFecha && !VAZIOS.has(nome)) pilha.push(no);
    }
    guardar(html.slice(fim));
  }
  return { trechos, semTamanho };
}
