/**
 * Leitor de LINHAS DE TEXTO do `preview.svg`, com a caixa de tinta estimada. Existe para a guarda
 * COLISAO-TEXTO de `guardas.mjs` e nao decide nada, do mesmo jeito que `espessura.mjs` nao decide.
 *
 * POR QUE UM LEITOR PROPRIO, E NAO `lerGeometria`. Aquele leitor resolve marca contra rotulo e
 * entrega UM item por `<text>`, com o `x` e o `y` da tag, o que basta para a ESP-2. Aqui o alvo e
 * outro e exige tres coisas que ele nao faz, e que nao dava para acrescentar sem mudar o que a
 * ESPESSURA-MARCA ja mede hoje:
 *   1. `<tspan>`. O serializador quebra UMA frase em varios `<tspan>` para trocar de cor ou de peso
 *      no meio ("64 pts" · "71 pts", "n = " "136", "campanha no ar, " "486" " leads"). Medido no
 *      acervo em 2026-09-18: TODOS os 9 pares de tinta que se tocam nas 95 versoes sao `<tspan>`
 *      irmaos dentro do mesmo `<text>`, isto e, palavras vizinhas da mesma frase, separadas pelo
 *      espaco que a propria fonte desenha. Entre `<text>` DIFERENTES nao ha uma sobreposicao
 *      sequer, e o par mais proximo do acervo esta a 6,61 px. Dai a regra de escopo da guarda:
 *      compara so linhas de `<text>` diferentes. Sem ela, a guarda acusaria toda frase colorida.
 *   2. COORDENADA DA PECA INTEIRA. Cada grafico sai num `<svg>` aninhado com `viewBox` proprio e
 *      `x`/`y` na moldura (`viewBox="0 0 574 218" x="33" y="110"`). O leitor soma o deslocamento da
 *      cadeia de `<svg>` e entrega tudo na coordenada do cartao, o que permite comparar o titulo do
 *      cartao com o rotulo do grafico. Escala diferente de 1 nunca apareceu no acervo; se aparecer,
 *      o leitor sinaliza e a guarda nao mede.
 *   3. HERANCA DE ESTILO. `font-size`, `text-anchor` e `dominant-baseline` descem do `<svg>` e do
 *      `<text>` para o `<tspan>`, e o `<tspan>` pode trocar o seu proprio. Sem seguir a cadeia, a
 *      medida do `<tspan>` sai com a fonte errada.
 *
 * COMO A TINTA E ESTIMADA, E COM QUE MARGEM (o ponto fraco declarado desta guarda).
 *
 * LARGURA. Nao ha motor de fonte aqui, entao a largura de avanco de cada caractere esta tabelada em
 * "em", uma tabela por familia. As duas tabelas foram AJUSTADAS por minimos quadrados contra o
 * motor de fonte do proprio navegador do render: 1.347 linhas de texto das 95 versoes do acervo,
 * medidas com `TextMetrics` do canvas na mesma fonte, peso e tamanho com que o preview desenha.
 * Margem medida, em pixel, por linha inteira:
 *   - Space Grotesk (os numeros, que e onde a colisao vira numero errado): p01 −0,38, mediana
 *     −0,02, p99 +0,53, pior caso do acervo −0,71 e +0,68.
 *   - Manrope (a prosa): p01 −1,56, mediana +0,04, p99 +1,24, pior caso −3,84 ("Inbound
 *     patrimonial") e +2,52 ("(cliente novo)").
 * A tabela e NEUTRA de proposito, nao encolhida: a mediana do erro e 0,04 px. Encolher a largura
 * cegaria a guarda justamente no par que encosta, e o custo de falso alarme ja esta coberto pela
 * folga medida do acervo (6,61 px entre `<text>` diferentes contra uma margem de 1 px nos numeros).
 * Caractere fora da tabela cai em `LARGURA_PADRAO`, a mediana do acervo.
 *
 * ALTURA. Pela metrica da fonte, e aqui a estimativa SUBESTIMA de proposito: a tinta vai de 0,72 em
 * acima da linha de base a 0,10 em abaixo. O acervo mede ascendente de 0,750 em na mediana (p05
 * 0,727) e descendente de 0,091 em na mediana (p95 0,273, que e o "g" e o "ç"). Ficar abaixo do p95
 * da descendente faz a guarda perder algum cruzamento vertical raso, que e o erro barato; inflar a
 * altura acusaria par que nao se cruza, que e o erro caro.
 *
 * `dominant-baseline="central"` nao centra a tinta na ancora. A medicao da ESP-2 (CONTRATO.md,
 * 2026-09-17) leu, para texto de 12 px, 5,50 px de tinta acima e 6,25 px abaixo do centro. Com a
 * ascendente de 0,72 em isso poe a linha de base 0,26 em ABAIXO da ancora, e e assim que o leitor
 * converte o `y` de quem usa `central`.
 *
 * A CAIXA E A DO GLIFO, sem folga somada. Quem trata a serrilha do render e a guarda, comparando os
 * respiros contra `PIXEL_DISPOSITIVO`; assim a caixa continua sendo uma medida e a tolerancia fica
 * declarada no lugar onde a decisao e tomada.
 *
 * Cada linha sai com `x0`, `x1`, `y0`, `y1`, `base` e `fonte`, na coordenada do cartao.
 *
 * O QUE O LEITOR RESOLVE E QUASE NAO SE VE, mas sem o que a medida sai errada e calada:
 *   - `transform` de TRANSLACAO, que o serializador escreve no ESTILO e nao no atributo
 *     (`style="transform:matrix(1, 0, 0, 1, 706.611, 0)"`). E como `10_corrida-de-barras` empilha as
 *     linhas da corrida: sem isso as 12 linhas caem todas na mesma altura e no mesmo x, e a guarda
 *     acusaria a versao inteira em falso.
 *   - `x="15.63%"`, resolvido contra o `viewBox` do `<svg>` ancestral (`02/08` e o likert de `02/08`
 *     ancoram rotulo assim).
 *   - `letter-spacing` declarado em px ou em em, somado depois de cada caractere.
 *   - `dominant-baseline: hanging`, que pendura a tinta a partir do `y` em vez de apoia-la nele.
 *
 * O QUE O LEITOR NAO RESOLVE, e por isso a guarda devolve NAO MEDIDA com motivo:
 *   - giro, escala ou inclinacao no `transform`, e so quando um `<text>` cai nesse ramo: compor a
 *     matriz e o que `espessura.mjs` tambem se recusa a fazer. O ladrilho de hachura de `03/07` gira
 *     45 graus dentro de um `<pattern>` e nao cega ninguem.
 *   - `<svg>` aninhado com escala diferente de 1 em volta de texto.
 *   - texto dentro de `foreignObject`: e HTML, invisivel ao leitor de SVG. E o caso da familia
 *     `01_cards-e-kpis` inteira, 35 das 111 versoes de 2026-09-18.
 *   - `textLength`, `lengthAdjust` e `rotate`: nao aparecem no acervo e mudariam a largura sem o
 *     leitor saber; quando aparecerem, a versao sai como nao medida em vez de sair como aprovada.
 *   - HALO. O `stroke` com `paint-order:stroke` pinta tinta opaca em volta do texto e o leitor a
 *     IGNORA, de proposito, porque somar 2 px por lado em todo rotulo com halo inflaria a caixa bem
 *     acima da margem da estimativa. E um ponto cego conhecido: dois halos que se cobrem nao sao
 *     acusados.
 *
 * EMENDA DE 2026-09-18, SO ACRESCENTA: cada linha passou a sair tambem com `segmentos`, e cada
 * segmento com a COR, o PESO, o TAMANHO e o HALO daquele trecho. Foram as guardas TAMANHO-TEXTO e
 * CONTRASTE-TEXTO que pediram, e pediram por medicao, nao por gosto: a linha inteira ja saia com a
 * MAIOR fonte dos seus `<tspan>` (e o que a COLISAO-TEXTO precisa, porque a caixa de tinta e a da
 * linha), o que esconderia um `<tspan>` de 9 px ao lado de um de 11 px; e a cor muitas vezes nao mora
 * no `<text>`, mora no `<tspan>` (115 `<text>` do acervo nao declaram `fill` nenhum e deixam cada
 * `<tspan>` declarar o seu). Nada do que a COLISAO-TEXTO le mudou: `pai`, `texto`, `fonte`, `x0`,
 * `x1`, `y0` e `y1` continuam calculados exatamente como antes.
 */

/** Tag e atributo, na mesma forma de `espessura.mjs`. */
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
const ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
/** Subarvores que definem, nao desenham (mesma lista de `espessura.mjs`). */
const NAO_DESENHA = new Set(['defs', 'clipPath', 'pattern', 'mask', 'marker', 'symbol']);
/** Atributos que mudariam a largura sem o leitor saber medir. */
const ATRIBUTOS_QUE_CEGAM = ['textLength', 'lengthAdjust', 'rotate'];
/** Tolerancia da escala de um `<svg>` aninhado antes de o leitor desistir. */
const ESCALA_TOLERANCIA = 0.001;

/** Tinta acima da linha de base, em em (acervo: mediana 0,750; p05 0,727). */
export const ASCENDENTE = 0.72;
/** Tinta abaixo da linha de base, em em (acervo: mediana 0,091; p95 0,273). */
export const DESCENDENTE = 0.10;
/** Quanto a linha de base cai abaixo da ancora com `dominant-baseline: central`, em em. */
export const CENTRAL_DESLOCA = 0.26;
/**
 * O mesmo para `dominant-baseline: hanging`, que pendura a tinta a partir da ancora: medido em
 * 2026-09-18 nos 9 rotulos do acervo que o usam (o eixo de porcentagem de `02/04`), a tinta comeca
 * 0,07 em abaixo do `y`, o que poe a linha de base 0,79 em abaixo dele.
 */
export const HANGING_DESLOCA = 0.79;
/**
 * Um pixel de dispositivo, em px de coordenada. O preview e conferido em `deviceScaleFactor: 2`,
 * entao o menor ponto que o render sabe desenhar mede 0,5 px de coordenada. E a resolucao do
 * desenho, nao uma folga escolhida: abaixo dela nao existe branco entre duas tintas, porque a borda
 * de um glifo que cai dentro de um pixel pinta esse pixel inteiro em tom parcial. E tambem a ordem
 * de grandeza da margem da propria estimativa nos numeros (p99 de 0,53 px no Space Grotesk), o que
 * mantem as duas coisas na mesma escala.
 */
export const PIXEL_DISPOSITIVO = 0.5;
/** Largura de caractere fora da tabela, em em (mediana do acervo). */
export const LARGURA_PADRAO = 0.55;
/**
 * Largura de UM digito quando o texto pede digito tabular, em em.
 *
 * MEDIDO no navegador em 2026-09-29, com as fontes do Farol carregadas: `0,6201 em`, IDENTICO em
 * Manrope e Space Grotesk, nos pesos 400, 500, 600 e 700, nos tamanhos 11, 12, 14 e 30 px, e os nove
 * digitos medem igual ao zero em todas as 32 combinacoes. O valor identico nas duas familias nao e
 * fallback: o controle com familia inexistente devolve 0,5000 em (igual a `serif`) e as duas familias
 * reais divergem SEM tabular (0,5895 e 0,5614), o que prova que as duas carregaram.
 *
 * POR QUE ISTO IMPORTA. As tabelas abaixo sao PROPORCIONAIS, e o catalogo escreve quase todo numero com
 * `tabular-nums` (e a regra do Farol para numero que se compara em coluna). Com tabular todo digito
 * mede igual, e a tabela proporcional passa a errar PARA OS DOIS LADOS: `111` a 14 px mede 26,05 px e a
 * soma proporcional dava 18,23, uma subestimativa de 30%; `000` mede os mesmos 26,05 e a soma dava
 * 27,05, uma superestimativa de 3,8%. Subestimar largura de rotulo esconde colisao, que e o erro caro.
 * Sem tabular a tabela e quase exata: medido em cinco strings, o erro ficou entre 0,1% e 0,5%.
 */
export const LARGURA_TABULAR = 0.62;
/** O texto pede digito tabular? `normal` declarado DESLIGA, e por isso a cadeia se resolve, nao se soma. */
function pedeTabular(style, attrs) {
  const variante = style['font-variant-numeric'] ?? attrs['font-variant-numeric'];
  const feature = style['font-feature-settings'] ?? attrs['font-feature-settings'];
  if (variante === undefined && feature === undefined) return null;
  return /tabular-nums/.test(variante ?? '') || /tnum/.test(feature ?? '');
}

/**
 * Largura de avanco por caractere, em em, ajustada contra o motor de fonte do navegador sobre as
 * 1.347 linhas de texto do acervo (ver o cabecalho). Manrope e a familia de texto do Farol; Space
 * Grotesk e a dos numeros, e so os caracteres que o acervo desenha estao tabelados. Caractere que
 * falta no Grotesk cai no valor do Manrope, e o que falta nos dois cai em LARGURA_PADRAO.
 *
 * O AJUSTE E POR PALAVRA, NAO POR LETRA: o que ele conhece e a SOMA das larguras de cada linha
 * medida, entao letra que so aparece dentro de uma palavra fixa fica mal determinada
 * individualmente, ainda que a soma esteja certa. No Grotesk, "m", "i" e "l" quase so aparecem em
 * "mil", e os tres valores abaixo so fazem sentido somados; "i" nao mede mesmo 0,520 em. Isso nao
 * atrapalha a guarda, que soma a linha inteira, mas quem for copiar um numero isolado desta tabela
 * para outro uso precisa saber.
 */
const MANROPE = {
  ' ': 0.216, '$': 0.589, '%': 0.891, '(': 0.437, ')': 0.437, '+': 0.520, ',': 0.200, '-': 0.433, '.': 0.228, '/': 0.367,
  0: 0.613, 1: 0.405, 2: 0.576, 3: 0.561, 4: 0.593, 5: 0.579, 6: 0.627, 7: 0.486, 8: 0.588, 9: 0.597, '=': 0.721,
  A: 0.693, B: 0.641, C: 0.728, D: 0.641, E: 0.580, F: 0.462, G: 0.694, H: 0.732, I: 0.316, J: 0.524, K: 0.569,
  L: 0.513, M: 0.834, N: 0.705, O: 0.795, P: 0.612, Q: 0.639, R: 0.617, S: 0.611, T: 0.576, V: 0.577, W: 0.760,
  a: 0.567, b: 0.632, c: 0.526, d: 0.599, e: 0.593, f: 0.382, g: 0.579, h: 0.587, i: 0.257, j: 0.227, k: 0.667,
  l: 0.243, m: 0.822, n: 0.607, o: 0.605, p: 0.580, q: 0.543, r: 0.351, s: 0.530, t: 0.394, u: 0.623, v: 0.457,
  w: 0.625, x: 0.464, y: 0.702, z: 0.516,
  'É': 0.562, 'á': 0.558, 'â': 0.497, 'ã': 0.580, 'ç': 0.536, 'é': 0.574, 'ê': 0.618, 'í': 0.217, 'ó': 0.641,
  'õ': 0.525, 'ú': 0.603,
};
const GROTESK = {
  ' ': 0.302, '$': 0.599, '+': 0.616, ',': 0.267, '/': 0.403, '%': 0.762,
  0: 0.644, 1: 0.434, 2: 0.598, 3: 0.607, 4: 0.629, 5: 0.599, 6: 0.617, 7: 0.544, 8: 0.610, 9: 0.619,
  A: 0.557, L: 0.557, R: 0.599, S: 0.557, T: 0.556,
  a: 0.605, c: 0.607, d: 0.624, e: 0.563, f: 0.505, g: 0.618, h: 0.563, i: 0.520, l: 0.268, m: 0.520, n: 0.615,
  o: 0.591, p: 0.588, r: 0.448, s: 0.464, t: 0.506,
  '·': 0.186, 'º': 0.446, '−': 0.621,
};

/**
 * As duas tabelas, para quem precisa PUBLICAR a largura por glifo em vez de so somar.
 *
 * Existe porque tres produtores em tres rodadas diferentes usaram a MEDIA POR CLASSE do dossie e
 * erraram de 8% a 26% em string real, sempre para baixo, que e o lado que esconde colisao. A media
 * descreve a classe e nao a composicao; publicar a tabela inteira custa menos de 2 KB e tira o motivo
 * de usar a media.
 */
export const TABELAS_DE_GLIFO = { manrope: MANROPE, grotesk: GROTESK };

/**
 * Largura de um pedaco de texto, em px, na familia e no tamanho dados. `espacamento` e o
 * `letter-spacing` ja resolvido em px, que o CSS soma DEPOIS de cada caractere, o ultimo inclusive.
 */
export function larguraDoTexto(texto, fonte, familia, espacamento = 0, tabular = false) {
  const tabela = familia === 'grotesk' ? GROTESK : MANROPE;
  let em = 0;
  let n = 0;
  for (const c of texto) {
    // Digito sob `tabular-nums` mede a largura tabular, nao a proporcional da tabela.
    em += tabular && c >= '0' && c <= '9' ? LARGURA_TABULAR : tabela[c] ?? MANROPE[c] ?? LARGURA_PADRAO;
    n += 1;
  }
  return em * fonte + espacamento * n;
}

function lerAtributos(raw) {
  const out = {};
  for (const m of raw.matchAll(ATTR)) out[m[1]] = m[2];
  return out;
}

/**
 * Declaracoes de um `style`. As aspas do `font-family` chegam como `&quot;`, que TERMINA EM PONTO E
 * VIRGULA: partir o estilo pelo `;` cru quebraria `font-family:&quot;Space Grotesk&quot;, Manrope`
 * em tres pedacos e a familia sairia como `&quot`, o que jogava todo numero na tabela errada e
 * errava a largura em 4 px. A entidade e desfeita antes de partir.
 */
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

/**
 * Medida de coordenada; `%` resolve contra a janela do `<svg>` ancestral, como em `espessura.mjs`.
 * `02/08` e `02_barras-horizontais/08_divergente-empilhada-likert` ancoram rotulo em `x="15.63%"`.
 */
function medida(valor, base) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  if (texto.endsWith('%')) {
    const pct = Number.parseFloat(texto);
    return Number.isFinite(pct) && Number.isFinite(base) ? (pct / 100) * base : null;
  }
  return numero(texto);
}

/** `0.71em` vale 0,71 do tamanho da fonte; numero cru vale px. */
function deslocamento(valor, fonte) {
  if (valor === undefined || valor === null) return 0;
  const texto = String(valor).trim();
  const n = Number.parseFloat(texto);
  if (!Number.isFinite(n)) return 0;
  return texto.endsWith('em') ? n * fonte : n;
}

/**
 * Translacao pura de um `transform`, ou `null` quando ele gira, escala ou inclina.
 *
 * O serializador escreve o deslocamento em `style="transform:matrix(1, 0, 0, 1, 706.611, 0)"`, no
 * ESTILO e nao no atributo, e e assim que `02_barras-horizontais/10_corrida-de-barras` empilha as
 * linhas da corrida. Ler so o atributo deixaria a guarda com todas as linhas na mesma altura e no
 * mesmo x, que e exatamente o tipo de medida errada que vira acusacao falsa.
 *
 * EXPORTADA em 2026-09-28 porque `marca.mjs` passou a comparar a caixa da forma com a caixa do
 * texto: duas leituras do mesmo SVG precisam concordar na coordenada, e um segundo parser de
 * `transform` divergiria do primeiro no dia em que um dos dois fosse corrigido.
 */
export function translacao(valor) {
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

/** Quanto a linha de base cai abaixo da ancora, em em, conforme o `dominant-baseline`. */
function deslocaDaBase(baseline) {
  if (baseline === 'central' || baseline === 'middle') return CENTRAL_DESLOCA;
  if (baseline === 'hanging' || baseline === 'text-before-edge') return HANGING_DESLOCA;
  return 0;
}

function familiaDe(valor) {
  return /space\s*grotesk/i.test(valor ?? '') ? 'grotesk' : 'manrope';
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

/**
 * Devolve `{ linhas, temTransform, temEscala, temAtributoCego }`.
 *
 * `linhas`: `{ pai, texto, fonte, base, x0, x1, y0, y1, segmentos }`, ja na coordenada do cartao.
 * `pai` e o indice do `<text>` de origem: linhas do mesmo `<text>` sao a mesma frase e a guarda nao
 * as compara. `segmentos` e a mesma linha quebrada por trecho de estilo, cada um com `texto`,
 * `fonte`, `peso`, `pintura` (a declaracao de cor, crua), `halo` (`{ pintura, espessura }` quando o
 * trecho leva `paint-order:stroke`) e a sua propria caixa de tinta `x0`, `x1`, `y0`, `y1`.
 */
export function lerLinhasDeTexto(conteudo) {
  const svg = conteudo.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const pilha = [];
  const linhas = [];
  let temTransform = false;
  let temEscala = false;
  let temAtributoCego = false;
  let pai = 0;
  let linha = null; // linha em montagem: { pai, x, base, ancora, largura, fonte, texto }
  let dentroDeTexto = null; // estado herdado do <text> corrente
  let fim = 0;

  const fecharLinha = () => {
    if (!linha || !linha.texto.trim()) {
      linha = null;
      return;
    }
    const x = linha.ancora === 'middle' ? linha.x - linha.largura / 2 : linha.ancora === 'end' ? linha.x - linha.largura : linha.x;
    linhas.push({
      pai: linha.pai,
      texto: linha.texto.replace(/\s+/g, ' ').trim(),
      fonte: linha.fonte,
      base: linha.base,
      x0: x,
      x1: x + linha.largura,
      y0: linha.base - ASCENDENTE * linha.fonte,
      y1: linha.base + DESCENDENTE * linha.fonte,
      // Emenda de 2026-09-18: o mesmo trecho, agora com a coordenada absoluta e o estilo proprio.
      // So os segmentos com texto que se le entram; o espaco entre dois `<tspan>` nao e um trecho.
      segmentos: linha.segmentos
        .filter((seg) => seg.texto.trim())
        .map((seg) => ({
          texto: seg.texto.replace(/\s+/g, ' ').trim(),
          fonte: seg.fonte,
          // A escala do `<svg>` que contem o trecho. `fonte` e o DECLARADO e `fonte * escala` e o que
          // chega a tela, que e o numero que a TIP-2 governa.
          escala: seg.escala ?? 1,
          tabular: seg.tabular === true,
          peso: seg.peso,
          pintura: seg.pintura,
          halo: seg.halo,
          x0: x + seg.off0,
          x1: x + seg.off1,
          y0: linha.base - ASCENDENTE * seg.fonte,
          y1: linha.base + DESCENDENTE * seg.fonte,
        })),
    });
    linha = null;
  };

  const abrirLinha = (x, base, estilo) => {
    fecharLinha();
    linha = { pai: estilo.pai, x, base, ancora: estilo.ancora, largura: 0, fonte: estilo.fonte, texto: '', segmentos: [] };
  };

  const somarTexto = (bruto, estilo) => {
    if (!linha) return;
    const texto = decodificar(bruto);
    if (!texto) return;
    const largura = larguraDoTexto(texto, estilo.fonte, estilo.familia, estilo.espacamento, estilo.tabular === true);
    linha.segmentos.push({
      texto,
      fonte: estilo.fonte,
      escala: estilo.escala ?? 1,
      tabular: estilo.tabular === true,
      peso: estilo.peso,
      pintura: estilo.pintura,
      halo: estilo.halo,
      off0: linha.largura,
      off1: linha.largura + largura,
    });
    linha.texto += texto;
    linha.largura += largura;
    if (estilo.fonte > linha.fonte) linha.fonte = estilo.fonte;
  };

  TAG.lastIndex = 0;
  let m;
  while ((m = TAG.exec(svg))) {
    if (dentroDeTexto && linha) somarTexto(svg.slice(fim, m.index), dentroDeTexto.corrente);
    fim = TAG.lastIndex;
    const [, fecha, nome, raw, autoFecha] = m;
    if (fecha) {
      if (nome === 'text') {
        fecharLinha();
        dentroDeTexto = null;
      } else if (nome === 'tspan' && dentroDeTexto) {
        dentroDeTexto.corrente = dentroDeTexto.base;
      }
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
      dx: 0, dy: 0, oculto: false, html: false, escalado: false, escala: 1, tabular: false, girado: false, janelaW: NaN, janelaH: NaN,
      fonte: null, familia: 'manrope', ancora: 'start', baseline: 'auto', espacamento: 0, cego: false,
      pintura: undefined, peso: null, ordemDeTinta: undefined, traco: undefined, tracoLargura: null,
    };
    const fonteAqui = numero(style['font-size'] ?? attrs['font-size']) ?? herdado.fonte;
    const familiaAqui = style['font-family'] ?? attrs['font-family'];
    const no = {
      nome,
      dx: herdado.dx + (mover?.dx ?? 0),
      dy: herdado.dy + (mover?.dy ?? 0),
      oculto: herdado.oculto || NAO_DESENHA.has(nome),
      html: herdado.html || nome === 'foreignObject',
      escalado: herdado.escalado,
      escala: herdado.escala,
      tabular: pedeTabular(style, attrs) ?? herdado.tabular,
      // Giro, escala ou inclinacao no `transform`. So pesa se um `<text>` cair neste ramo: o ladrilho
      // de hachura de `03/07` gira 45 graus dentro de um `<pattern>` e nao mexe em rotulo nenhum.
      girado: herdado.girado || !mover,
      janelaW: herdado.janelaW,
      janelaH: herdado.janelaH,
      fonte: fonteAqui,
      familia: familiaAqui === undefined ? herdado.familia : familiaDe(familiaAqui),
      ancora: style['text-anchor'] ?? attrs['text-anchor'] ?? herdado.ancora,
      baseline: style['dominant-baseline'] ?? attrs['dominant-baseline'] ?? herdado.baseline,
      espacamento: style['letter-spacing'] === undefined || /^normal$/i.test(style['letter-spacing'])
        ? herdado.espacamento
        : deslocamento(style['letter-spacing'], fonteAqui ?? 12),
      cego: herdado.cego || ATRIBUTOS_QUE_CEGAM.some((chave) => attrs[chave] !== undefined),
      // Emenda de 2026-09-18: cor, peso e halo do trecho, herdados pela mesma cadeia do resto.
      pintura: style.fill ?? attrs.fill ?? herdado.pintura,
      peso: numero(style['font-weight'] ?? attrs['font-weight']) ?? herdado.peso,
      ordemDeTinta: style['paint-order'] ?? attrs['paint-order'] ?? herdado.ordemDeTinta,
      traco: style.stroke ?? attrs.stroke ?? herdado.traco,
      tracoLargura: numero(style['stroke-width'] ?? attrs['stroke-width']) ?? herdado.tracoLargura,
    };
    /** Halo da ROT-7: `paint-order:stroke` pinta o traco POR BAIXO do glifo, e ele vira o fundo. */
    no.halo = /stroke/.test(no.ordemDeTinta ?? '') && no.traco && no.traco !== 'none'
      ? { pintura: no.traco, espessura: no.tracoLargura ?? 1 }
      : null;
    if (nome === 'svg') {
      // O icone da lucide entra como `<svg viewBox="0 0 24 24" width="14">`, que e escala 0,58; ele
      // nao tem texto dentro, entao a escala so cega a guarda se um `<text>` cair neste ramo.
      const vb = (attrs.viewBox ?? '').split(/[\s,]+/).map(Number);
      const largura = numero(attrs.width);
      const ok = vb.length === 4 && vb.every(Number.isFinite);
      // A ESCALA ACUMULADA, e nao so o fato de existir escala. O booleano `escalado` cega a COLISAO-TEXTO,
      // que precisa de posicao; o FATOR serve a TAMANHO-TEXTO, porque tamanho declarado vezes escala e o
      // tamanho que chega a tela. Medido em 2026-09-29: 14 pecas do acervo declaram 11 px que chegam
      // abaixo do piso de 11, a pior a 7,23 px, e a guarda dizia "medida" para todas elas.
      //
      // QUAL DAS DUAS RAZOES E O FATOR. Nao e a de largura. Sem `preserveAspectRatio` o padrao do SVG e
      // `xMidYMid meet`, que escala o conteudo UNIFORMEMENTE pela MENOR das duas razoes e centraliza o
      // resto; com `none` a escala e anisotropica e quem governa a altura do glifo e a razao de altura.
      // Medido em `07_rosca-e-radial/06_coluna-radial/v2`: viewBox 480x480 numa caixa de 422x315,5 da
      // 0,8792 em largura e 0,6573 em altura, e o texto de 11 px chega a 7,23 px, nao a 9,67 px. Usar a
      // razao de largura aqui erraria 2,44 px justamente na peca mais grave do acervo.
      const altura = numero(attrs.height);
      const fatorLargura = ok && largura ? largura / vb[2] : 1;
      const fatorAltura = ok && altura ? altura / vb[3] : 1;
      const fator = /none/i.test(attrs.preserveAspectRatio ?? '') ? fatorAltura : Math.min(fatorLargura, fatorAltura);
      //
      // ESCALA DE DESENHO CONTRA ARREDONDAMENTO DO SERIALIZADOR. O serializador grava o `viewBox` em
      // inteiro e a caixa em fracionario, e por isso quase toda peca tem um `<svg>` com `viewBox` 282
      // dentro de uma caixa de 281,5: fator 0,99823, que nao e decisao de desenho nenhuma. Sem este
      // filtro a guarda reprovaria `05_areas/10_area-bump/v1` e `v2` por 11 px chegarem a 10,98, e a
      // causa estaria na ferramenta. O criterio e estrutural e nao um numero magico: a escala so conta
      // quando a caixa difere do `viewBox` em pelo menos UM pixel inteiro em algum eixo, porque abaixo
      // disso a diferenca cabe no arredondamento que o proprio arquivo introduziu.
      const diferencaEmPx = Math.max(
        ok && largura ? Math.abs(largura - vb[2]) : 0,
        ok && altura ? Math.abs(altura - vb[3]) : 0,
      );
      if (diferencaEmPx >= 1 && Math.abs(fator - 1) > ESCALA_TOLERANCIA) {
        no.escalado = true;
        no.escala = herdado.escala * fator;
      }
      no.dx += medida(attrs.x, herdado.janelaW) ?? 0;
      no.dy += medida(attrs.y, herdado.janelaH) ?? 0;
      no.janelaW = ok ? vb[2] : numero(attrs.width) ?? herdado.janelaW;
      no.janelaH = ok ? vb[3] : numero(attrs.height) ?? herdado.janelaH;
    }
    if (!no.html && !no.oculto && nome === 'text' && !autoFecha) {
      pai += 1;
      if (no.girado) temTransform = true;
      if (no.escalado) temEscala = true;
      if (no.cego) temAtributoCego = true;
      const fonte = no.fonte ?? 12;
      const estilo = { pai, fonte, familia: no.familia, ancora: no.ancora, baseline: no.baseline, espacamento: no.espacamento, pintura: no.pintura, peso: no.peso, halo: no.halo, escala: no.escala, tabular: no.tabular };
      dentroDeTexto = { base: estilo, corrente: estilo, dx: no.dx, dy: no.dy, janelaW: no.janelaW, janelaH: no.janelaH };
      const x = (medida(attrs.x, no.janelaW) ?? 0) + no.dx;
      const y = (medida(attrs.y, no.janelaH) ?? 0) + no.dy;
      abrirLinha(x, y + deslocaDaBase(no.baseline) * fonte, estilo);
      dentroDeTexto.ultimoY = y;
    } else if (dentroDeTexto && nome === 'tspan' && !autoFecha) {
      if (no.cego) temAtributoCego = true;
      const fonte = no.fonte ?? dentroDeTexto.base.fonte;
      const estilo = { pai: dentroDeTexto.base.pai, fonte, familia: no.familia, ancora: no.ancora, baseline: no.baseline, espacamento: no.espacamento, pintura: no.pintura, peso: no.peso, halo: no.halo, escala: no.escala, tabular: no.tabular };
      dentroDeTexto.corrente = estilo;
      const xProprio = medida(attrs.x, dentroDeTexto.janelaW);
      const yProprio = medida(attrs.y, dentroDeTexto.janelaH);
      const dy = deslocamento(attrs.dy, fonte);
      if (xProprio !== null || yProprio !== null || dy) {
        // `x` proprio ou `dy` comecam uma LINHA nova; o serializador quebra assim o rotulo de eixo.
        const y = (yProprio !== null ? yProprio + dentroDeTexto.dy : dentroDeTexto.ultimoY) + dy;
        dentroDeTexto.ultimoY = y;
        abrirLinha((xProprio !== null ? xProprio + dentroDeTexto.dx : (linha?.x ?? 0)), y + deslocaDaBase(no.baseline) * fonte, estilo);
      } else if (linha) {
        // Sem `x` e sem `dy` o `<tspan>` continua a MESMA linha; `dx` e o respiro que ele pede.
        linha.largura += deslocamento(attrs.dx, fonte);
      }
    }
    if (!autoFecha) pilha.push(no);
  }
  fecharLinha();
  return { linhas, temTransform, temEscala, temAtributoCego };
}
