/**
 * A OPACIDADE MÍNIMA de cada cor de marca, e o leitor do `Chart.tsx` que a cobra.
 *
 * Duas coisas moram aqui, e moram juntas de propósito. `medirOpacidadeMinima` calcula, a partir de
 * `app/src/styles/tokens.css`, qual é o menor alfa que deixa cada cor de marca composta em 3:1 contra
 * `--surface-raised` nos DOIS temas; `acharOpacidadeMarca` lê o `Chart.tsx` pela árvore sintática e
 * diz onde a peça pede menos do que isso. A tabela era do dossiê de produção e a guarda nasceu depois,
 * então ela foi TRAZIDA para cá em vez de copiada: o dossiê que ensina e a guarda que cobra têm de
 * dizer o mesmo número, e trocar um token em `tokens.css` precisa consertar as duas de uma vez. Cópia
 * divergiria no primeiro ajuste de paleta, e aí a guarda passaria a reprovar exatamente a peça que o
 * dossiê mandou escrever.
 *
 * A REGRA. ACE-5 do CONTRATO.md: "Opacidade em marca é perda de contraste medida, não enfeite". A
 * COR-9 libera `opacity` em marca, e é aí que a conta escapa: `fillOpacity` COMPÕE a cor da marca com
 * a do cartão, e o resultado precisa continuar acima de 3:1 pela WCAG 1.4.11, a mesma régua que vale
 * para a marca opaca. Não há piso de opacidade no contrato porque não existe um: o piso é de
 * CONTRASTE, e o alfa que o atende muda com a cor e com o tema.
 *
 * POR QUE ELA MERECE GUARDA, e por que era a maior lacuna de cobertura medida do catálogo. A ACE-5 é a
 * maior classe de colisão do acervo, 50 das 814 versões planejadas prescrevem opacidade em marca, e
 * NADA a media: a CONTRASTE-MARCA julga só `--surface-overlay` e os `--seq-*`, porque ela nasceu para
 * as armadilhas TOK-1 e TOK-7 e escapa de propósito das cores de papel, onde opacidade baixa é
 * legítima em algumas peças. O resultado é que opacidade sobre `--chart-*`, `--positive`, `--negative`
 * e as demais passava sem medição nenhuma, e o acervo acumulou casos com o `check` verde, todos
 * achados à mão: `16_distribuicao/03_strip-plot-e-beeswarm/v1` pede 0,45 em `--chart-1`, que dá 2,97:1
 * no escuro e 2,04:1 no claro; `09_dispersao-e-bolhas/03_bolhas/v1` pede 0,55, que dá 3,76:1 e 2,43:1.
 *
 * DOIS ACHADOS QUE CONTRARIAM A INTUIÇÃO, e que só aparecem medindo:
 *
 *   O TEMA CLARO REPROVA PRIMEIRO em todas as cores menos `--negative`, que reprova primeiro no
 *   escuro. Então "o claro é sempre o pior" é heurística falsa, e quem mede um tema só erra numa cor.
 *   O piso vale pelo PIOR dos dois, sempre.
 *
 *   CINCO TOKENS NÃO ADMITEM OPACIDADE NENHUMA, porque não alcançam 3:1 NEM OPACOS: `--line-strong` e
 *   `--seq-1` a `--seq-4`. Ali nenhum valor abaixo de 1 passa, e baixar a opacidade só afunda um
 *   número que já está abaixo do piso. A saída não é um alfa maior, é a isenção da 17.2 (o valor
 *   escrito na marca ou junto dela) ou outra cor.
 *
 * ARREDONDAMENTO PARA CIMA, em passo de 0,01, sempre. Para baixo a peça passa no papel e reprova na
 * guarda, que é o pior dos dois erros porque só aparece depois do render.
 */
import { createRequire } from 'node:module';

import { lerCor, razaoDeContraste } from './contraste.mjs';
import { lerTokensDoFarol, medirMarca } from './marca.mjs';

const require = createRequire(import.meta.url);
const ts = require('typescript');

/**
 * As cores que podem pintar marca de dado. A lista é a do dossiê e não é toda a paleta: `--surface-*`
 * é superfície, `--line-subtle` é grade, `--text-*` fora do `--text-muted` é tinta de texto, e
 * `--prov-*` é selo de procedência, que a 17.2 proíbe em marca. Julgar toda cor pintada reprovaria
 * superfície e grade por uma regra que não é delas.
 */
export const CORES_DE_MARCA = [
  '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5', '--chart-6', '--chart-7', '--chart-8',
  '--positive', '--negative', '--warning', '--info', '--text-muted', '--line-strong',
  '--seq-1', '--seq-2', '--seq-3', '--seq-4', '--seq-5', '--seq-6', '--seq-7',
];

/**
 * A opacidade mínima de cada cor de marca para a cor composta ficar no piso nos dois temas.
 *
 * Devolve `{ piso, linhas, semSolucao }`, uma linha por cor, com `minima` nula quando nenhum alfa
 * resolve, `temaQueReprova` no tema que decide o mínimo e a razão opaca dos dois temas.
 */
export function medirOpacidadeMinima(piso = 3) {
  let tabelas;
  try {
    tabelas = lerTokensDoFarol();
  } catch {
    return null;
  }
  if (!tabelas?.dark || !tabelas?.light) return null;
  const razao = (token, alfa, tema) => {
    const cor = tabelas[tema].get(token);
    const cartao = tabelas[tema].get('--surface-raised');
    if (!cor || !cartao) return null;
    return medirMarca({ ...cor, a: alfa }, cartao).razao;
  };
  const linhas = [];
  for (const token of CORES_DE_MARCA) {
    if (!tabelas.dark.get(token)) continue;
    let minima = null;
    let temaQueReprova = null;
    for (let passo = 1; passo <= 100; passo += 1) {
      const alfa = passo / 100;
      const escuro = razao(token, alfa, 'dark');
      const claro = razao(token, alfa, 'light');
      if (escuro >= piso && claro >= piso) {
        minima = alfa;
        temaQueReprova = escuro < claro ? 'escuro' : 'claro';
        break;
      }
    }
    linhas.push({
      token,
      minima,
      temaQueReprova,
      opacoEscuro: razao(token, 1, 'dark'),
      opacoClaro: razao(token, 1, 'light'),
    });
  }
  return { piso, linhas, semSolucao: linhas.filter((l) => l.minima === null).map((l) => l.token) };
}

/**
 * O piso indexado por token, mais o contraste que um alfa dado produz nos dois temas.
 *
 * A guarda usa as duas coisas: o piso para decidir, e a razão medida para escrever na mensagem o
 * número que o produtor vai conferir. Sem o número a mensagem manda "aumente a opacidade" sem dizer
 * quanto, e quem produz chuta.
 */
export function pisoDeOpacidade(piso = 3) {
  const tabela = medirOpacidadeMinima(piso);
  if (!tabela) return null;
  let tabelas;
  try {
    tabelas = lerTokensDoFarol();
  } catch {
    return null;
  }
  const porToken = new Map(tabela.linhas.map((l) => [l.token, l]));
  /**
   * O nome de token de uma cor LITERAL, desempatado a favor da cor de marca.
   *
   * O desempate não é detalhe: pela COR-8 o Farol pinta `--chart-1` e `--accent-cyan` com o mesmo hex,
   * e o mesmo vale para `--chart-2`, `--warning` e `--prov-premissa`, e para `--chart-4`, `--positive`
   * e `--prov-medido`. O `nomeDoToken` devolve o PRIMEIRO da tabela, que é o apelido, e o piso está
   * indexado pela cor de marca: sem o desempate, `rgba(45, 212, 232, 0.4)` saía como `--accent-cyan` e
   * a guarda a descartava como token que não pinta marca. Medido pelo selftest em 2026-09-28.
   */
  const tokenDeMarcaDaCor = (cor, tema = 'dark') => {
    for (const [nome, v] of tabelas[tema]) {
      if (!porToken.has(nome)) continue;
      if (Math.abs(v.r - cor.r) <= 3 && Math.abs(v.g - cor.g) <= 3 && Math.abs(v.b - cor.b) <= 3) return nome;
    }
    return null;
  };
  /** A razão de contraste do token naquele alfa, por tema; `null` quando o token não é de marca. */
  const razaoComAlfa = (token, alfa) => {
    const out = {};
    for (const [tema, rotulo] of [['dark', 'escuro'], ['light', 'claro']]) {
      const cor = tabelas[tema].get(token);
      const cartao = tabelas[tema].get('--surface-raised');
      if (!cor || !cartao) return null;
      out[rotulo] = medirMarca({ ...cor, a: alfa }, cartao).razao;
    }
    return out;
  };
  return { piso, porToken, razaoComAlfa, tabelas, tokenDeMarcaDaCor };
}

// ---------------------------------------------------------------------------------------------
// O leitor do Chart.tsx
// ---------------------------------------------------------------------------------------------
//
// POR QUE A ÁRVORE SINTÁTICA DO CÓDIGO, e não o preview. Decidido por MEDIÇÃO em 2026-09-28, sobre as
// 398 versões do acervo, e o resultado CONTRARIOU a expectativa de quem pediu a guarda: um leitor de
// preview feito só para opacidade mede 69 versões e o leitor de código mede 48. O preview LÊ MAIS, e a
// suposição de que os pontos cegos conhecidos (`preview_com_transform`, `texto_em_html`, `marca_html`)
// o derrubariam está errada, porque nenhum deles é do MEIO: eles são do `marca.mjs`, que precisa de
// GEOMETRIA para medir contenção e por isso se declara cego com `transform`. Opacidade e cor não pedem
// geometria nenhuma, então um leitor dedicado atravessa as 29 versões com `transform` sem tropeçar.
//
// A ESCOLHA FOI PELO CÓDIGO MESMO ASSIM, por três razões medidas, e a primeira é a que decide:
//
//   O PREVIEW NÃO SABE APLICAR A ISENÇÃO DE "VALOR AO LADO", e é dela que vive metade do acervo
//   translúcido. Medido: o preview chega a 69 versões e ACUSA 59; o código chega a 48, acusa 16 e
//   ISENTA 33 marcas pela 17.2. "Ao lado" não tem definição geométrica que não seja inventada, e é
//   exatamente essa isenção que o contrato usa para autorizar `--line-strong` e `--seq-1` a `--seq-4`.
//   Guarda que não sabe isentar joga caso legítimo na fila de dívida, e a fila diz outra coisa: "está
//   errado e ainda não foi consertado". 59 versões, 15% do catálogo, parkeadas como erro, é o retrato
//   de uma guarda que alguém desliga na semana seguinte.
//
//   O PREVIEW NÃO SABE QUAL TOKEN A PEÇA PEDIU, e não por descuido: pela COR-8, o Farol pinta
//   `--chart-1` e `--accent-cyan` com o MESMO hex, e o mesmo vale para `--chart-2`, `--warning` e
//   `--prov-premissa`, e para `--chart-4`, `--positive` e `--prov-medido`. Na cor já resolvida os três
//   são indistinguíveis, e um deles (`--prov-*`) a 17.2 PROÍBE em marca. O código escreve
//   `var(--chart-1)` com todas as letras.
//
//   O PREVIEW SÓ EXISTE DEPOIS DO RENDER. Esta guarda tem de barrar a peça no momento em que ela é
//   ESCRITA, que é quando o `fillOpacity` é decidido, e não uma rodada de render depois. De quebra, o
//   código dá a LINHA e o NÚMERO a trocar: "o `fillOpacity` de 0,45 na linha 173 está abaixo de 0,66"
//   é acionável, e "esta cor mede 2,04:1" manda o produtor procurar.
//
// O QUE O CÓDIGO PERDE, declarado e medido: opacidade ou cor CALCULADA em tempo de execução, 22 e 19
// versões. `fillOpacity={escala(v)}`, o ternário e `fill={corDaSerie(i)}` ficam de fora, e é a escolha
// certa aqui, porque a alternativa é inventar um valor. É a única vantagem real que o preview tinha, e
// ela cabe numa segunda guarda no dia em que alguém quiser cobri-la.
//
// COMO A CONTA É MONTADA. O alfa efetivo de uma marca é o produto de tudo o que a atenua:
//
//     alfa = opacidade herdada dos `<g>` ancestrais × `opacity` do elemento × `fillOpacity` × alfa da cor
//
// Os quatro multiplicam, e é por isso que ler uma propriedade só erra. `<g opacity={0.6}>` com
// `fillOpacity={0.6}` dentro dá 0,36, não 0,6, e nenhuma das duas escritas parece errada sozinha.

/** Propriedades de opacidade, e a qual pintura cada uma se aplica. As três NÃO são a mesma coisa. */
const OPACIDADE = new Map([
  ['fillOpacity', 'fill'],
  ['fill-opacity', 'fill'],
  ['strokeOpacity', 'stroke'],
  ['stroke-opacity', 'stroke'],
  // `opacity` atinge o elemento inteiro, preenchimento E traço, e ainda se propaga para os filhos.
  ['opacity', 'ambos'],
]);
/**
 * Tags cuja `opacity` se PROPAGA para os descendentes nesta leitura: os agrupadores do SVG, mais o
 * `<Layer>` do Recharts, que renderiza um `<g>`.
 *
 * A lista é curta de propósito. Um `<Bar opacity={0.5}>` também repassa o valor às suas `<Cell>`, mas
 * isso é convenção da biblioteca e não semântica do SVG; herdar dali seria supor o que o Recharts faz
 * com a prop. Fica de fora como falso negativo declarado, que é o erro que esta casa prefere.
 */
const AGRUPADORES = new Set(['g', 'svg', 'a', 'Layer']);
/**
 * Tags de texto. Ficam fora porque opacidade em texto é a ACE-4, que é outra regra, com outro piso
 * (4,5:1) e outro veredito ("nunca"). Medir texto aqui daria dois donos para o mesmo defeito.
 */
const TEXTO = new Set(['text', 'tspan', 'textPath', 'Text', 'Label', 'LabelList', 'title', 'desc']);
/**
 * Tags que escrevem o valor na marca ou junto dela, quando aparecem como FILHAS do elemento pintado.
 * É por elas que a isenção da WCAG 1.4.11 entra pelo caminho do Recharts: `<Bar><LabelList/></Bar>`
 * põe o número em cada barra, e a 17.2 diz que a marca com o valor escrito não precisa dos 3:1.
 */
const ESCREVE_O_VALOR = new Set(['LabelList', 'Label', 'text', 'Text']);
/** Profundidade máxima ao seguir identificador; o mesmo teto de `eixo.mjs`. */
const TETO = 8;

/**
 * O piso de contraste de conteúdo NÃO TEXTUAL da WCAG 2.1, item 1.4.11, que é o que a ACE-5 cobra.
 *
 * Não é o piso de texto (4,5:1, da ACE-3): usar aquele reprovaria cor de papel legítima. Também não
 * existe "piso de opacidade" no contrato, porque o piso é de CONTRASTE e o alfa que o atende muda com
 * a cor e com o tema.
 *
 * `FAROL_PISO_OPACIDADE` troca o número e existe SÓ para o `npm run selftest`, que precisa provar que a
 * guarda DISCRIMINA: com o piso em 1 nenhuma cor reprova, a guarda emudece, e então só as provas de
 * acusação podem cair. Se uma prova de aprovação cair junto, ela não estava provando nada.
 */
export function pisoDeMarca() {
  const forcado = Number.parseFloat(process.env.FAROL_PISO_OPACIDADE ?? '');
  return Number.isFinite(forcado) && forcado > 0 ? forcado : 3;
}

function descascar(no) {
  let atual = no;
  while (atual && (ts.isAsExpression(atual) || ts.isParenthesizedExpression(atual) || ts.isNonNullExpression(atual))) atual = atual.expression;
  return atual;
}

function aberturaDe(node) {
  if (ts.isJsxSelfClosingElement(node)) return node;
  if (ts.isJsxElement(node)) return node.openingElement;
  return null;
}

function nomeDaTag(node) {
  const abertura = aberturaDe(node);
  if (!abertura) return null;
  try {
    return abertura.tagName.getText();
  } catch {
    return null;
  }
}

/** Mapa de nome para o valor que ele guarda, em qualquer escopo do arquivo (igual a `eixo.mjs`). */
function declaracoes(sourceFile) {
  const mapa = new Map();
  const visita = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) mapa.set(node.name.text, node.initializer);
    ts.forEachChild(node, visita);
  };
  visita(sourceFile);
  return mapa;
}

function chaveDe(prop) {
  if (!prop.name) return null;
  if (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) return prop.name.text;
  return null;
}

/**
 * O número que esta expressão vale, ou `null` quando o leitor não resolve.
 *
 * Segue identificador e acesso a propriedade de objeto literal, porque a forma mais comum do acervo é
 * uma constante no topo do arquivo (`const POINT_OPACITY = 0.45`) usada no JSX. Ternário, chamada de
 * função e prop de componente devolvem `null` de propósito: `null` aqui é falso negativo, e falso
 * negativo é o erro que esta casa prefere numa guarda nova.
 */
function numeroDe(expr, mapa, profundidade = 0) {
  if (profundidade > TETO) return null;
  const no = descascar(expr);
  if (!no) return null;
  if (ts.isNumericLiteral(no)) return Number(no.text);
  if (ts.isPrefixUnaryExpression(no) && no.operator === ts.SyntaxKind.MinusToken) {
    const n = numeroDe(no.operand, mapa, profundidade + 1);
    return n === null ? null : -n;
  }
  if (ts.isStringLiteral(no) || ts.isNoSubstitutionTemplateLiteral(no)) {
    const n = Number.parseFloat(no.text);
    return Number.isFinite(n) ? n : null;
  }
  if (ts.isIdentifier(no)) {
    const destino = mapa.get(no.text);
    return destino ? numeroDe(destino, mapa, profundidade + 1) : null;
  }
  if (ts.isPropertyAccessExpression(no) && ts.isIdentifier(no.expression)) {
    const objeto = descascar(mapa.get(no.expression.text));
    if (objeto && ts.isObjectLiteralExpression(objeto)) {
      for (const prop of objeto.properties) {
        if (ts.isPropertyAssignment(prop) && chaveDe(prop) === no.name.text) return numeroDe(prop.initializer, mapa, profundidade + 1);
      }
    }
    return null;
  }
  return null;
}

/**
 * O texto que esta expressão vale, ou `null`. Serve para `fill`, `stroke` e `className`, que no
 * acervo são literais ou constantes de topo. Template com substituição fica fora: `color-mix` montado
 * em tempo de execução não tem um alfa único para medir.
 */
function textoDe(expr, mapa, profundidade = 0) {
  if (profundidade > TETO) return null;
  const no = descascar(expr);
  if (!no) return null;
  if (ts.isStringLiteral(no) || ts.isNoSubstitutionTemplateLiteral(no)) return no.text;
  if (ts.isIdentifier(no)) {
    const destino = mapa.get(no.text);
    return destino ? textoDe(destino, mapa, profundidade + 1) : null;
  }
  if (ts.isPropertyAccessExpression(no) && ts.isIdentifier(no.expression)) {
    const objeto = descascar(mapa.get(no.expression.text));
    if (objeto && ts.isObjectLiteralExpression(objeto)) {
      for (const prop of objeto.properties) {
        if (ts.isPropertyAssignment(prop) && chaveDe(prop) === no.name.text) return textoDe(prop.initializer, mapa, profundidade + 1);
      }
    }
  }
  return null;
}

/** O valor de um atributo JSX como expressão; `null` quando o atributo não existe. */
function atributo(abertura, nome) {
  let achado = null;
  for (const a of abertura.attributes.properties) {
    if (!ts.isJsxAttribute(a)) continue;
    if (a.name.getText() !== nome) continue;
    // A última escrita vence, como em qualquer JSX.
    achado = a;
  }
  if (!achado) return null;
  if (!achado.initializer) return { presente: true, expr: null };
  const expr = ts.isJsxExpression(achado.initializer) ? achado.initializer.expression : achado.initializer;
  return { presente: true, expr: expr ?? null };
}

/**
 * A cor que este texto de pintura nomeia: `{ token }` para `var(--x)`, `{ cor }` para cor literal com
 * canal alfa, ou `null`.
 *
 * `var(--x, fallback)` e `color-mix(...)` devolvem `null`: os dois têm mais de uma cor dentro e
 * medir um deles pelo primeiro token daria o número errado com cara de certo.
 */
function corDaPintura(texto) {
  if (texto === null) return null;
  const limpo = texto.trim();
  if (!limpo || limpo === 'none' || limpo === 'transparent') return null;
  if (/color-mix/i.test(limpo)) return null;
  const varias = limpo.match(/var\(\s*(--[a-z0-9-]+)\s*\)$/i);
  if (varias && /^var\(/i.test(limpo)) return { token: varias[1], alfaDaCor: 1 };
  if (/^var\(/i.test(limpo)) return null;
  const cor = lerCor(limpo);
  if (cor === null || cor === 'incerto') return null;
  return { cor, alfaDaCor: cor.a ?? 1 };
}

/**
 * O `bg-<token>/<pct>` do Tailwind dentro de um `className`: o token composto naquele alfa.
 *
 * Esta é a terceira forma de opacidade do catálogo, e a que o preview menos alcança, porque ela vive
 * no HTML do `foreignObject`. `bg-positive/20` é `--positive` a 0,20, e o mínimo de `--positive` é
 * 0,70. Sem esta leitura a guarda mediria só o SVG e daria verde na tabela, que é onde o Tailwind
 * translúcido mora.
 */
function tailwindTranslucido(className) {
  if (className === null) return [];
  const out = [];
  for (const m of className.matchAll(/\bbg-([a-z][a-z0-9-]*)\/(\d{1,3})\b/g)) {
    const pct = Number(m[2]);
    if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) continue;
    out.push({ token: `--${m[1]}`, alfa: pct / 100, escrita: m[0] });
  }
  return out;
}

/** O elemento tem texto escrito dentro dele, próprio ou de filho que escreve valor? */
function escreveOValor(node) {
  if (!ts.isJsxElement(node)) return false;
  for (const filho of node.children) {
    if (ts.isJsxText(filho) && /[\p{L}\p{N}]/u.test(filho.text)) return true;
    // `{formatar(v)}` como filho direto é o valor escrito dentro do elemento; é o caso da célula de
    // tabela pintada com o Tailwind translúcido, que carrega o número.
    if (ts.isJsxExpression(filho) && filho.expression && filho.expression.kind !== ts.SyntaxKind.JsxEmptyExpression) return true;
    const nome = nomeDaTag(filho);
    if (nome && ESCREVE_O_VALOR.has(nome)) return true;
  }
  return false;
}

/** Há texto escrito nesta subárvore JSX, em qualquer profundidade? */
function temTextoNaSubarvore(node, profundidade = 0) {
  if (profundidade > 12) return false;
  if (ts.isJsxText(node)) return /[\p{L}\p{N}]/u.test(node.text);
  if (ts.isJsxExpression(node)) return Boolean(node.expression) && node.expression.kind !== ts.SyntaxKind.JsxEmptyExpression;
  if (ts.isJsxElement(node)) {
    const nome = nomeDaTag(node);
    if (nome && ESCREVE_O_VALOR.has(nome)) return true;
    return node.children.some((filho) => temTextoNaSubarvore(filho, profundidade + 1));
  }
  if (ts.isJsxSelfClosingElement(node)) {
    const nome = nomeDaTag(node);
    return Boolean(nome && ESCREVE_O_VALOR.has(nome));
  }
  return false;
}

/**
 * A marca tem o valor escrito NELA ou JUNTO DELA, isto é, vale a isenção da WCAG 1.4.11 que a 17.2
 * usa? Quatro sinais, todos estruturais, e os dois últimos são as duas isenções que o contrato nomeia:
 *
 *   PROP `label`. `<Bar label={…}>` é o `LabelList` escrito como propriedade.
 *   FILHO QUE ESCREVE. `<Bar><LabelList/></Bar>` e `<td className="bg-positive/20">{n}</td>`: o valor
 *   escrito DENTRO da marca, que é a isenção de "texto por cima".
 *   IRMÃO QUE ESCREVE. `<g><rect/><text>…</text></g>`: no SVG o texto é IRMÃO da forma, nunca filho, e
 *   é assim que sai a plaquinha de nome de um treemap e o glifo no centro de um círculo.
 *   IRMÃO COM TEXTO NA SUBÁRVORE. É a isenção de "valor escrito AO LADO", a da 17.2, e é ela que
 *   legitima `--line-strong` e `--seq-1` a `--seq-4` como neutro de dado. Em `09_bar-list` o trilho
 *   pintado é um `<div>` irmão da linha que carrega o número da origem; sem este sinal a lista em
 *   barras inteira seria acusada, e ela está certa.
 *
 * AQUI ESTÁ A RAZÃO MAIS FORTE DE A GUARDA LER O CÓDIGO. A isenção de CONTENÇÃO o preview mede por
 * geometria, e `marca.mjs` já a mede. A isenção de "AO LADO" o preview NÃO mede: "ao lado" não tem
 * definição geométrica que não seja inventada, e é justamente ela que o contrato usa para autorizar as
 * cores que não alcançam 3:1 nem opacas. Guarda que não sabe aplicar a isenção transforma caso
 * legítimo em dívida permanente, que a própria fila proíbe ("a fila diz: está errado e ainda não foi
 * consertado").
 *
 * A LEITURA É FROUXA DE PROPÓSITO: irmão com texto não prova que o texto seja O VALOR daquela marca. O
 * excesso vira falso negativo, que é o erro que esta casa prefere numa guarda nova.
 */
function temValorEscrito(node) {
  const abertura = aberturaDe(node);
  if (abertura) {
    const label = atributo(abertura, 'label');
    // `label={false}` não escreve nada; qualquer outro valor escreve.
    if (label) {
      const valor = label.expr ? descascar(label.expr) : null;
      if (!valor || valor.kind !== ts.SyntaxKind.FalseKeyword) return true;
    }
  }
  if (escreveOValor(node)) return true;
  const pai = node.parent;
  if (pai && ts.isJsxElement(pai)) {
    for (const irmao of pai.children) {
      if (irmao === node) continue;
      if (temTextoNaSubarvore(irmao)) return true;
    }
  }
  return false;
}

/** A opacidade acumulada dos agrupadores acima deste nó. */
function alfaHerdado(node, mapa) {
  let alfa = 1;
  const cadeia = [];
  let atual = node.parent;
  while (atual) {
    const nome = nomeDaTag(atual);
    if (nome && AGRUPADORES.has(nome)) {
      const abertura = aberturaDe(atual);
      const op = abertura ? atributo(abertura, 'opacity') : null;
      if (op?.expr) {
        const n = numeroDe(op.expr, mapa);
        if (n !== null && n >= 0 && n < 1) {
          alfa *= n;
          cadeia.push(`<${nome} opacity={${n}}>`);
        }
      }
    }
    atual = atual.parent;
  }
  return { alfa, cadeia };
}

/**
 * Acha, no `Chart.tsx`, as marcas cuja opacidade composta derruba a cor abaixo do piso de 3:1.
 *
 * Devolve `{ achados: [{ linha, code: 'OPACIDADE-MARCA', texto }], medida, motivo, marcas, fora }`.
 * `medida` é falso com motivo quando não havia o que medir, nunca calado, para o `check` contar a
 * cobertura à parte. `fora` conta o que o leitor viu e não soube resolver, por motivo.
 */
export function acharOpacidadeMarca(sourceFile, piso = pisoDeMarca()) {
  const achados = [];
  const fora = {};
  const conta = (motivo) => {
    fora[motivo] = (fora[motivo] ?? 0) + 1;
  };
  const regua = pisoDeOpacidade(piso);
  if (!regua) return { achados, medida: false, motivo: 'sem_tokens_do_farol', marcas: 0, fora };
  const mapa = declaracoes(sourceFile);
  const rel = sourceFile.fileName.split(/[\\/]/).pop();
  const linhaDe = (node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const arred = (n) => Number(n.toFixed(2));
  const num = (n) => arred(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /** Uma marca medida: token, alfa composto e como o alfa se formou, para a mensagem. */
  const medidas = [];

  const visita = (node) => {
    const abertura = aberturaDe(node);
    if (abertura) {
      const tag = nomeDaTag(node);
      if (tag && !TEXTO.has(tag)) medirElemento(node, abertura, tag);
    }
    ts.forEachChild(node, visita);
  };

  function medirElemento(node, abertura, tag) {
    const herdado = alfaHerdado(node, mapa);
    const props = new Map();
    for (const [nome, alvo] of OPACIDADE) {
      const a = atributo(abertura, nome);
      if (!a) continue;
      // `<rect fillOpacity />` sem valor é `true`, isto é, 1: não atenua nada.
      if (!a.expr) continue;
      const n = numeroDe(a.expr, mapa);
      if (n === null) {
        conta('opacidade_irresoluvel');
        continue;
      }
      props.set(nome, { alvo, valor: n });
    }
    const classe = atributo(abertura, 'className');
    const translucidos = classe?.expr ? tailwindTranslucido(textoDe(classe.expr, mapa)) : [];
    // O ALFA PODE VIR NA COR, não na propriedade: `rgba(…, 0.4)` e `#2dd4e866` compõem igual e não
    // aparecem em `fillOpacity` nenhum. Sem esta pergunta o elemento sairia daqui sem ser medido, e a
    // forma mais silenciosa de derrubar a marca seria a única que a guarda não veria.
    const alfaNaCor = ['fill', 'stroke'].some((alvo) => {
      const pintura = atributo(abertura, alvo);
      const cor = pintura?.expr ? corDaPintura(textoDe(pintura.expr, mapa)) : null;
      return cor !== null && cor.alfaDaCor < 0.999;
    });
    if (!props.size && !translucidos.length && !alfaNaCor && herdado.alfa >= 1) return;

    const doElemento = props.get('opacity')?.valor ?? 1;
    const isento = temValorEscrito(node);

    /**
     * Julga uma pintura. `alvo` é 'fill' ou 'stroke'; `alfaProprio` é o que as propriedades do próprio
     * elemento atenuam; `escritas` são as formas que produziram esse alfa, para a mensagem poder
     * mostrar a multiplicação; `tokenForcado` vem do Tailwind, onde a cor está no `className` e não em
     * `fill`.
     */
    const julgar = (alvo, alfaProprio, escritas, tokenForcado = null) => {
      let token = tokenForcado;
      let alfaDaCor = 1;
      if (token === null) {
        const pintura = atributo(abertura, alvo);
        const texto = pintura?.expr ? textoDe(pintura.expr, mapa) : null;
        const cor = corDaPintura(texto);
        if (cor === null) {
          conta(pintura ? 'cor_irresoluvel' : `sem_${alvo}_declarado`);
          return;
        }
        alfaDaCor = cor.alfaDaCor;
        if (cor.token) token = cor.token;
        else {
          // Cor literal: o nome sai da tabela de tokens, para a mensagem citar o token e para o piso
          // ser o mesmo. Literal que não é token nenhum fica fora, porque o piso é por cor.
          token = regua.tokenDeMarcaDaCor(cor.cor);
          if (token === null) {
            conta('cor_fora_da_tabela_de_tokens');
            return;
          }
        }
      }
      const linha = regua.porToken.get(token);
      if (!linha) {
        conta('token_que_nao_pinta_marca');
        return;
      }
      const alfa = herdado.alfa * alfaProprio * alfaDaCor;
      if (alfa >= 0.999) return;
      medidas.push({ token, alfa });
      if (isento) {
        conta('marca_com_valor_escrito');
        return;
      }
      const razoes = regua.razaoComAlfa(token, alfa);
      const pior = razoes === null ? null : Math.min(razoes.escuro, razoes.claro);
      if (pior !== null && pior >= piso) return;
      const cadeia = [...herdado.cadeia, ...escritas];
      const comoSeForma =
        cadeia.length > 1
          ? `A opacidade efetiva é ${num(alfa)}, e ela não está escrita em lugar nenhum: ${cadeia.join(' × ')} MULTIPLICAM. `
          : '';
      const semSolucao = linha.minima === null;
      const saida = semSolucao
        ? `Nesta cor opacidade NÃO É OPÇÃO: \`${token}\` mede ${num(linha.opacoEscuro)}:1 no escuro e ${num(linha.opacoClaro)}:1 no claro já OPACO, ` +
          'então nenhum valor abaixo de 1 passa nos dois temas e baixar a opacidade só afunda um número que já está abaixo do piso. ' +
          'Aqui a guarda ORIENTA e não reprova, porque duas regras do contrato se cruzam: a tabela da 17.2 autoriza este token como neutro de dado DESDE QUE a marca ' +
          'carregue o valor escrito nela ou junto dela, e a emenda E5 do próprio contrato registra a tensão como aberta. ' +
          'Se a marca não carrega número, ela precisa de outra cor; se carrega, escreva o valor de forma que a 17.2 o alcance.'
        : `O mínimo de \`${token}\` é ${num(linha.minima)}, calculado de tokens.css e arredondado para cima em 0,01; ` +
          `o tema que reprova primeiro é o ${linha.temaQueReprova}.`;
      achados.push({
        linha: linhaDe(node),
        code: 'OPACIDADE-MARCA',
        nivel: semSolucao ? 'aviso' : 'erro',
        texto:
          `${rel}:${linhaDe(node)} OPACIDADE-MARCA: <${tag}> pinta ${alvo === 'fill' ? 'preenchimento' : 'traço'} em \`${token}\` com opacidade ${num(alfa)}, ` +
          `e a cor COMPOSTA sobre o cartão mede ${razoes === null ? '?' : `${num(razoes.escuro)}:1 no escuro e ${num(razoes.claro)}:1 no claro`}, abaixo do piso de ${num(piso)}:1. ` +
          comoSeForma +
          `${saida} ` +
          'A ACE-5 do CONTRATO.md é literal: opacidade em marca é perda de contraste MEDIDA, não enfeite, porque `fillOpacity` compõe a cor da marca com a do cartão ' +
          'e o resultado tem de continuar acima de 3:1 pela WCAG 1.4.11, a mesma régua da marca opaca. ' +
          'Meça SEMPRE os dois temas: o claro reprova primeiro em todas as cores menos --negative, então conferir um tema só erra numa cor. ' +
          'A saída que a própria ACE-5 oferece é quase sempre melhor que um alfa maior: contorno na cor da superfície separa marcas coladas sem mexer no contraste do preenchimento. ' +
          'Ver CONTRATO.md, ACE-5, e a tabela de opacidade mínima do `npm run dossie`, que sai deste mesmo cálculo.',
      });
    };

    const tocados = new Set();
    for (const [nome, { alvo, valor }] of props) {
      if (nome === 'opacity') continue;
      tocados.add(alvo);
      julgar(alvo, doElemento * valor, [`${nome}={${valor}}`, ...(doElemento < 1 ? [`opacity={${doElemento}}`] : [])]);
    }
    // `opacity` sozinho atinge preenchimento e traço; com `fillOpacity` ao lado, o preenchimento já
    // saiu na volta acima com os dois multiplicados, e repetir aqui contaria a mesma marca duas vezes.
    if (doElemento < 1) {
      if (!tocados.has('fill')) julgar('fill', doElemento, [`opacity={${doElemento}}`]);
      if (!tocados.has('stroke')) julgar('stroke', doElemento, [`opacity={${doElemento}}`]);
      tocados.add('fill');
      tocados.add('stroke');
    }
    // A pintura que não declarou opacidade NENHUMA no próprio elemento e ainda assim chega atenuada:
    // porque a COR carrega alfa (`rgba()`, `#rrggbbaa`), ou porque um `<g>` acima atenua o grupo
    // inteiro. Sem esta volta, `<g opacity={0.5}><rect fill="var(--chart-1)"/></g>` saía sem medição, e
    // é a forma em que a opacidade está MAIS escondida, porque ela não aparece na linha da marca.
    if (alfaNaCor || herdado.alfa < 1) {
      for (const alvo of ['fill', 'stroke']) {
        if (!tocados.has(alvo)) julgar(alvo, 1, alfaNaCor ? ['alfa no canal da própria cor'] : []);
      }
    }
    for (const t of translucidos) {
      julgar('fill', t.alfa * doElemento, [`${t.escrita} (${num(t.alfa)})`, ...(doElemento < 1 ? [`opacity={${doElemento}}`] : [])], t.token);
    }
  }

  visita(sourceFile);
  if (!medidas.length) return { achados, medida: false, motivo: 'sem_opacidade_em_marca', marcas: 0, fora };
  return { achados, medida: true, motivo: null, marcas: medidas.length, fora };
}

// ---------------------------------------------------------------------------------------------
// A matriz de TEXTO sobre preenchimento de marca (piso de 4,5:1 da ACE-3)
// ---------------------------------------------------------------------------------------------
//
// POR QUE ELA MORA AQUI, e não no gerador do dossiê, onde nasceu. Ela vive ao lado de
// `CORES_DE_MARCA` porque é a mesma lista de preenchimentos, e ao lado da tabela de opacidade porque
// as duas respondem à mesma pergunta em pisos diferentes. Desde 2026-09-29 ela tem DOIS leitores: o
// dossiê, que a imprime para ensinar, e a guarda TEXTO-NA-MARCA, que cobra o mesmo piso no desenho.
// Duas cópias divergiriam no primeiro ajuste de paleta, e aí a guarda reprovaria exatamente a peça
// que a tabela mandou escrever. Trocar um token em `tokens.css` conserta as duas de uma vez.

/**
 * A MATRIZ de texto sobre preenchimento de marca, nos dois temas, contra o piso de texto.
 *
 * POR QUE ELA EXISTE: três agentes mediram pares de texto sobre marca à mão, cada um numa peça
 * diferente, porque a tabela da ACE-8 aprova um par só (`--accent-cyan-contrast` sobre `--chart-1`) e
 * não diz nada sobre marca semântica, que é o caso de quem pinta célula com `--positive`,
 * `--negative` ou `--text-muted`.
 *
 * DOIS PISOS QUE NÃO SE MISTURAM: **texto sobre marca é 4,5:1, pela ACE-3**; marca sobre fundo é 3:1,
 * pela WCAG 1.4.11. A tabela de opacidade acima usa o segundo; esta usa o primeiro, e um agente já
 * confundiu os dois hoje. Uma matriz não serve para os dois pisos.
 *
 * O texto VAZADO na cor da superfície entra como os outros, e resolve sozinho as duas variantes por
 * tema: `--surface-raised` é escuro no tema escuro e branco no claro, então a leitura já é por tema.
 */
export const TEXTOS_SOBRE_MARCA = ['--text-primary', '--text-secondary', '--text-muted', '--accent-cyan-contrast', '--surface-raised'];

export function medirTextoSobreMarca(piso = 4.5) {
  let tabelas;
  try {
    tabelas = lerTokensDoFarol();
  } catch {
    return null;
  }
  if (!tabelas?.dark || !tabelas?.light) return null;
  const razao = (texto, fundo, tema) => {
    const a = tabelas[tema].get(texto);
    const b = tabelas[tema].get(fundo);
    if (!a || !b) return null;
    return razaoDeContraste(a, b);
  };
  const linhas = [];
  for (const fundo of CORES_DE_MARCA) {
    if (!tabelas.dark.get(fundo)) continue;
    const celulas = TEXTOS_SOBRE_MARCA.filter((texto) => tabelas.dark.get(texto)).map((texto) => {
      const escuro = razao(texto, fundo, 'dark');
      const claro = razao(texto, fundo, 'light');
      const pior = Math.min(escuro, claro);
      return { texto, escuro, claro, pior, passa: pior >= piso, temaQueReprova: escuro <= claro ? 'escuro' : 'claro' };
    });
    const aprovados = celulas.filter((c) => c.passa);
    linhas.push({ fundo, celulas, aprovados: aprovados.map((c) => c.texto), melhor: celulas.slice().sort((x, y) => y.pior - x.pior)[0] });
  }
  return {
    piso,
    textos: TEXTOS_SOBRE_MARCA.filter((t) => tabelas.dark.get(t)),
    linhas,
    semTexto: linhas.filter((l) => l.aprovados.length === 0).map((l) => l.fundo),
  };
}
