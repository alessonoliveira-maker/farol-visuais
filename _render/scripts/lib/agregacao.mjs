/**
 * Leitor de AGREGAÇÃO do `Chart.tsx` e do `data.ts`: acha a função que resume uma lista e devolve
 * `0` quando a lista está vazia. Existe para a guarda AGREGACAO-ZERO de `guardas.mjs` e não decide
 * nada: só devolve achados com linha, regra e texto.
 *
 * POR QUE ESTE LEITOR EXISTE, e por que nenhuma revisão por imagem o substitui. A EST-1b do
 * CONTRATO.md nasceu de uma medição: 12 de 15 implementações de mediana do acervo devolviam `0`
 * para lista vazia, e nenhuma revisão por PNG pegou isso em seis peças seguidas. O motivo é
 * estrutural, não de atenção: o dado publicado de cada versão é completo, então o ramo do vazio
 * nunca é executado no render, e a foto da peça está certa. O defeito mora no RAMO, não na foto.
 * É a armadilha DAD-6 do ARMADILHAS.md.
 *
 * POR QUE ÁRVORE SINTÁTICA, e nunca expressão regular. O que interessa aqui é ESTRUTURA: qual lista
 * a guarda de vazio testa contra qual lista alimenta a conta; se o `0` está no ramo do vazio ou é a
 * semente de um `reduce`, onde somar zero é a definição certa; se o `?? 0` está sobre o resultado de
 * uma agregação ou sobre um índice de array, que o `noUncheckedIndexedAccess` do projeto OBRIGA a
 * fechar com `?? 0` em todo `sorted[mid]`. Expressão regular erra nos dois sentidos, e o segundo
 * caso sozinho acusaria em falso toda mediana correta do acervo.
 *
 * AS SEIS REGRAS, e o que cada uma acusa:
 *
 *   TIPO      Função de agregação com retorno declarado `number` em vez de `number | null`. É a
 *             letra da EST-1b. Só acusa quando a anotação existe e é exatamente `number`, e quando
 *             ao menos um parâmetro é lista: `formatPercent(v: number): string` não é agregação.
 *   VIZINHA   A guarda de vazio testa uma lista DIFERENTE da que alimenta a conta. É a forma exata
 *             da DAD-6, na escrita `rows.length === 0 ? 0 : filtrada.reduce(...) / filtrada.length`.
 *   DIVISOR   Soma dividida por `X.length` sem NENHUM teste de vazio sobre `X` no escopo. Divisão
 *             por zero chega à tela como `NaN`, que também não é medida.
 *   EXTREMO   `Math.min(...lista)` ou `Math.max(...lista)` sem semente e sem guarda: devolvem
 *             `Infinity` e `-Infinity`, que chegam ao eixo e à dica como número.
 *   ZERO      O ramo do vazio devolve o literal `0`: `x.length === 0 ? 0 : ...`,
 *             `if (x.length === 0) return 0;` e `base > 0 ? parte / base : 0`.
 *   RECAI     `?? 0` ou `|| 0` sobre o resultado de uma agregação, que é o `null` da EST-1b sendo
 *             desfeito no chamador.
 *
 * COMO A DERIVAÇÃO É SEGUIDA, e por que ela é o coração da regra VIZINHA. Testar `data` e contar
 * sobre `data.map(...)` está CERTO: `map`, `slice`, `sort`, `toSorted` e o espalhamento preservam o
 * tamanho, então a guarda de `data` também cobre o derivado. Testar `data` e contar sobre
 * `data.filter(...)` está ERRADO, porque `filter`, `flatMap` e `reduce` mudam o tamanho: é
 * exatamente o caso que a DAD-6 descreve, em que a filtrada esvazia e a vizinha não. O leitor
 * monta a classe de equivalência por essas duas listas de métodos.
 *
 * PREFERE FALSO NEGATIVO A FALSO POSITIVO, por decisão: guarda que grita sem motivo é desligada por
 * quem produz, e aí não vale nada. Por isso a regra TIPO exige a anotação escrita, a regra EXTREMO
 * se cala diante de qualquer teste de vazio sobre a mesma raiz, e a regra VIZINHA só acusa quando
 * consegue provar que as duas listas NÃO são a mesma.
 *
 * NÃO COBRE, declarado: agregação escrita em `if` de várias saídas com listas cruzadas (a forma de
 * ternário está coberta, a de bloco não); agregação que atravessa arquivo, porque cada arquivo é
 * lido sozinho; e o zero que vem de fora, por parâmetro com valor padrão `= 0`.
 */
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

/** Nomes que dizem "isto resume uma lista num número", no núcleo da EST-1b. */
const NOME_NUCLEO =
  /(?:^|[^a-z])(?:median|mediana|average|avg|mean|media|quantile|quantil|quartile|quartil|percentile|percentil|midpoint|interquartil|iqr)(?:$|[^a-z])/i;
/** A família que a EST-1b cita junto: taxa, percentual de etapa, proporção. Mais larga, então só
 *  vale quando o corpo TAMBÉM tem forma de agregação. */
const NOME_FAMILIA = /(?:^|[^a-z])(?:taxa|rate|ratio|share|proporcao|proportion|percentualDe|stageRate|conversao|conversion)(?:$|[^a-z])/i;

/** Métodos de lista que devolvem lista do MESMO tamanho: a guarda da origem cobre o derivado. */
const PRESERVA_TAMANHO = new Set(['map', 'slice', 'sort', 'toSorted', 'reverse', 'toReversed', 'concat', 'with']);
/** Métodos que MUDAM o tamanho: aqui a guarda da origem não cobre nada. É o miolo da DAD-6. */
const MUDA_TAMANHO = new Set(['filter', 'flatMap', 'flat', 'reduce', 'reduceRight', 'splice']);

/** Texto do nó com espaço normalizado, para comparar duas escritas da mesma lista. */
function textoNormalizado(node, sourceFile) {
  try {
    return node.getText(sourceFile).replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

/** Identificador na base de uma cadeia: `a.b.c` e `a.filter(x).map(y)` devolvem os dois `a`. */
function raizDe(node) {
  let atual = node;
  for (let i = 0; i < 64 && atual; i += 1) {
    if (ts.isIdentifier(atual)) return atual.text;
    if (ts.isPropertyAccessExpression(atual) || ts.isElementAccessExpression(atual)) atual = atual.expression;
    else if (ts.isCallExpression(atual)) atual = atual.expression;
    else if (ts.isNonNullExpression(atual) || ts.isParenthesizedExpression(atual) || ts.isAsExpression(atual)) atual = atual.expression;
    else if (ts.isArrayLiteralExpression(atual) && atual.elements.length === 1 && ts.isSpreadElement(atual.elements[0])) atual = atual.elements[0].expression;
    else return null;
  }
  return null;
}

/**
 * A cadeia de uma lista, do nó até a raiz, dizendo se em algum passo o tamanho mudou.
 * `withQuota.filter(f).map(g)` devolve `{ raiz: 'withQuota', mudouTamanho: true }`.
 */
function cadeiaDaLista(node) {
  let atual = node;
  let mudouTamanho = false;
  for (let i = 0; i < 64 && atual; i += 1) {
    if (ts.isIdentifier(atual)) return { raiz: atual.text, mudouTamanho };
    if (ts.isCallExpression(atual) && ts.isPropertyAccessExpression(atual.expression)) {
      const metodo = atual.expression.name.text;
      if (MUDA_TAMANHO.has(metodo)) mudouTamanho = true;
      else if (!PRESERVA_TAMANHO.has(metodo)) return { raiz: null, mudouTamanho: true };
      atual = atual.expression.expression;
      continue;
    }
    if (ts.isParenthesizedExpression(atual) || ts.isNonNullExpression(atual) || ts.isAsExpression(atual)) {
      atual = atual.expression;
      continue;
    }
    if (ts.isArrayLiteralExpression(atual) && atual.elements.length === 1 && ts.isSpreadElement(atual.elements[0])) {
      atual = atual.elements[0].expression;
      continue;
    }
    if (ts.isPropertyAccessExpression(atual)) {
      atual = atual.expression;
      continue;
    }
    return { raiz: null, mudouTamanho: true };
  }
  return { raiz: null, mudouTamanho: true };
}

/**
 * Para cada `const` do arquivo, de que lista ele vem e se o tamanho foi preservado no caminho.
 * É o mapa que deixa a regra VIZINHA aceitar `data` como guarda de `data.map(...)` e recusar `data`
 * como guarda de `data.filter(...)`.
 */
function mapaDeDerivacao(sourceFile) {
  const mapa = new Map();
  const visita = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const cadeia = cadeiaDaLista(node.initializer);
      if (cadeia.raiz && cadeia.raiz !== node.name.text) mapa.set(node.name.text, cadeia);
    }
    ts.forEachChild(node, visita);
  };
  visita(sourceFile);
  return mapa;
}

/**
 * Nomes que guardam UM ELEMENTO de uma lista, com o nó da lista de onde ele saiu.
 *
 * Existe porque `noUncheckedIndexedAccess` torna `rows[0]` possivelmente `undefined`, e por isso a
 * forma idiomática de guarda de vazio neste catálogo não é `rows.length === 0`, e sim
 * `const leader = rows[0]; if (!leader) return <vazio/>;`. Medido: sem reconhecer esta forma a regra
 * EXTREMO acusava em falso a `02_barras-horizontais/09_bar-list/v1`, que guarda corretamente.
 * Cobre `L[0]`, `L.at(0)`, `L.find(...)` e o destrinchamento `const [primeiro] = L`.
 */
function mapaDeElemento(sourceFile) {
  const mapa = new Map();
  const daLista = (init) => {
    if (ts.isElementAccessExpression(init)) return init.expression;
    if (ts.isNonNullExpression(init) || ts.isParenthesizedExpression(init) || ts.isAsExpression(init)) return daLista(init.expression);
    if (ts.isCallExpression(init) && ts.isPropertyAccessExpression(init.expression) && /^(?:at|find|findLast)$/.test(init.expression.name.text)) return init.expression.expression;
    return null;
  };
  const visita = (node) => {
    if (ts.isVariableDeclaration(node) && node.initializer) {
      if (ts.isIdentifier(node.name)) {
        const lista = daLista(node.initializer);
        if (lista) mapa.set(node.name.text, lista);
      } else if (ts.isArrayBindingPattern(node.name)) {
        for (const el of node.name.elements) {
          if (ts.isBindingElement(el) && ts.isIdentifier(el.name)) mapa.set(el.name.text, node.initializer);
        }
      }
    }
    ts.forEachChild(node, visita);
  };
  visita(sourceFile);
  return mapa;
}

/** `!X`, `X === undefined`, `X == null` ou `X === null`: devolve o nó de `X`, ou `null`. */
function testeDeFalsidade(expr) {
  const node = ts.isParenthesizedExpression(expr) ? expr.expression : expr;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken) return node.operand;
  if (ts.isBinaryExpression(node)) {
    const op = node.operatorToken.kind;
    const K = ts.SyntaxKind;
    const igual = op === K.EqualsEqualsEqualsToken || op === K.EqualsEqualsToken;
    if (!igual) return null;
    const vazio = (n) => n.kind === K.NullKeyword || (ts.isIdentifier(n) && n.text === 'undefined');
    if (vazio(node.right)) return node.left;
    if (vazio(node.left)) return node.right;
  }
  return null;
}

/**
 * Todos os nomes cujo tamanho é o mesmo que o de `nome`, seguindo o mapa de derivação para cima.
 * Para na primeira etapa que mudou o tamanho: dali para trás a guarda não cobre mais nada.
 */
function classeDeTamanho(nome, mapa) {
  const set = new Set();
  let atual = nome;
  for (let i = 0; i < 16 && atual && !set.has(atual); i += 1) {
    set.add(atual);
    const passo = mapa.get(atual);
    if (!passo || passo.mudouTamanho || !passo.raiz) break;
    atual = passo.raiz;
  }
  return set;
}

// ---------------------------------------------------------------------------------------------
// Teste de vazio
// ---------------------------------------------------------------------------------------------

/** O literal é o número zero? Aceita `0`, `0.0` e o `-0` escrito à mão. */
function ehZero(node) {
  const alvo = ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken ? node.operand : node;
  return ts.isNumericLiteral(alvo) && Number.parseFloat(alvo.text) === 0;
}

/** `X.length`, devolvendo o nó de `X`; `null` quando não é acesso a `length`. */
function objetoDoLength(node) {
  const alvo = ts.isParenthesizedExpression(node) || ts.isNonNullExpression(node) ? node.expression : node;
  if (ts.isPropertyAccessExpression(alvo) && alvo.name.text === 'length') return alvo.expression;
  return null;
}

/**
 * A expressão é um teste de vazio sobre uma lista? Devolve `{ no, sentido }`, com `sentido`
 * `'vazio'` quando ser verdadeiro quer dizer lista vazia, e `'cheio'` no contrário.
 *
 * Cobre `X.length === 0`, `0 === X.length`, `X.length < 1`, `X.length <= 0`, `!X.length`,
 * `X.length > 0`, `X.length >= 1`, `X.length !== 0` e, só com `aceitarSolto`, o `X.length` sozinho
 * na posição de condição de um ternário ou de um `if`.
 *
 * `aceitarSolto` é falso na varredura de escopo de propósito: contar todo `X.length` como teste
 * faria o próprio `soma / x.length` se calar a si mesmo, que é justamente o defeito da regra
 * DIVISOR. Um `length` só vale como guarda onde ele decide um caminho.
 */
function testeDeVazio(expr, aceitarSolto = true) {
  const node = ts.isParenthesizedExpression(expr) ? expr.expression : expr;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken) {
    const dentro = testeDeVazio(node.operand, true);
    if (dentro) return { no: dentro.no, sentido: dentro.sentido === 'vazio' ? 'cheio' : 'vazio' };
    return null;
  }
  if (ts.isBinaryExpression(node)) {
    const op = node.operatorToken.kind;
    const K = ts.SyntaxKind;
    const esq = objetoDoLength(node.left);
    const dir = objetoDoLength(node.right);
    if (esq && ehZero(node.right)) {
      if (op === K.EqualsEqualsEqualsToken || op === K.EqualsEqualsToken || op === K.LessThanEqualsToken) return { no: esq, sentido: 'vazio' };
      if (op === K.ExclamationEqualsEqualsToken || op === K.ExclamationEqualsToken || op === K.GreaterThanToken) return { no: esq, sentido: 'cheio' };
    }
    if (dir && ehZero(node.left)) {
      if (op === K.EqualsEqualsEqualsToken || op === K.EqualsEqualsToken || op === K.GreaterThanEqualsToken) return { no: dir, sentido: 'vazio' };
      if (op === K.ExclamationEqualsEqualsToken || op === K.ExclamationEqualsToken || op === K.LessThanToken) return { no: dir, sentido: 'cheio' };
    }
    if (esq && ts.isNumericLiteral(node.right) && Number.parseFloat(node.right.text) === 1) {
      if (op === K.LessThanToken) return { no: esq, sentido: 'vazio' };
      if (op === K.GreaterThanEqualsToken) return { no: esq, sentido: 'cheio' };
    }
  }
  if (aceitarSolto) {
    const solto = objetoDoLength(node);
    if (solto) return { no: solto, sentido: 'cheio' };
  }
  return null;
}

/** Função, arrow ou método que envolve o nó; `null` quando o nó está no topo do módulo. */
function funcaoAncestral(node) {
  let atual = node.parent;
  for (let i = 0; i < 256 && atual; i += 1) {
    if (ts.isFunctionDeclaration(atual) || ts.isFunctionExpression(atual) || ts.isArrowFunction(atual) || ts.isMethodDeclaration(atual)) return atual;
    atual = atual.parent;
  }
  return null;
}

/**
 * Todo teste de vazio dentro de um nó, pela chave de texto e pela raiz. Conta as duas formas: o
 * `X.length` comparado com zero e a falsidade do primeiro elemento (ver `mapaDeElemento`).
 */
function testesNoEscopo(raiz, sourceFile, elementos) {
  const chaves = new Set();
  const raizes = new Set();
  const anotar = (no) => {
    chaves.add(textoNormalizado(no, sourceFile));
    const r = raizDe(no);
    if (r) raizes.add(r);
  };
  const visita = (node) => {
    const teste = testeDeVazio(node, false);
    if (teste) anotar(teste.no);
    const falso = testeDeFalsidade(node);
    if (falso) {
      if (ts.isIdentifier(falso) && elementos?.has(falso.text)) anotar(elementos.get(falso.text));
      const direto = ts.isElementAccessExpression(falso) ? falso.expression : null;
      if (direto) anotar(direto);
    }
    ts.forEachChild(node, visita);
  };
  visita(raiz);
  return { chaves, raizes };
}

// ---------------------------------------------------------------------------------------------
// Forma de agregação
// ---------------------------------------------------------------------------------------------

/** O tipo anotado é exatamente `number`, sem `| null` e sem `| undefined`? */
function retornoNumberSeco(node) {
  const tipo = node.type;
  if (!tipo) return false;
  return tipo.kind === ts.SyntaxKind.NumberKeyword;
}

/** Algum parâmetro é lista: `readonly T[]`, `T[]`, `Array<T>` ou `ReadonlyArray<T>`. */
function temParametroDeLista(node) {
  for (const p of node.parameters) {
    let tipo = p.type;
    if (!tipo) continue;
    if (ts.isTypeOperatorNode(tipo) && tipo.operator === ts.SyntaxKind.ReadonlyKeyword) tipo = tipo.type;
    if (ts.isArrayTypeNode(tipo) || ts.isTupleTypeNode(tipo)) return true;
    if (ts.isTypeReferenceNode(tipo) && ts.isIdentifier(tipo.typeName) && /^(?:Array|ReadonlyArray)$/.test(tipo.typeName.text)) return true;
  }
  return false;
}

/** O corpo tem forma de agregação: soma dividida por `length`, ou um `reduce` que soma. */
function corpoAgrega(node, sourceFile) {
  let achou = false;
  const visita = (n) => {
    if (achou) return;
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.SlashToken && objetoDoLength(n.right)) achou = true;
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && /^(?:reduce|reduceRight)$/.test(n.expression.name.text)) achou = true;
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'sort' && /sorted|ordenad/i.test(textoNormalizado(n, sourceFile))) achou = true;
    ts.forEachChild(n, visita);
  };
  if (node.body) visita(node.body);
  return achou;
}

/** O nome com que a função é conhecida: o próprio, ou o do `const` que a recebeu. */
function nomeDaFuncao(node) {
  if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) && node.name) return node.name.getText();
  const pai = node.parent;
  if (pai && ts.isVariableDeclaration(pai) && ts.isIdentifier(pai.name)) return pai.name.text;
  if (pai && ts.isPropertyAssignment(pai) && ts.isIdentifier(pai.name)) return pai.name.text;
  return '';
}

/** A chamada é de uma função de agregação, pelo nome do que está sendo chamado? */
function chamadaDeAgregacao(node) {
  if (!ts.isCallExpression(node)) return null;
  const alvo = node.expression;
  const nome = ts.isIdentifier(alvo) ? alvo.text : ts.isPropertyAccessExpression(alvo) ? alvo.name.text : '';
  return nome && NOME_NUCLEO.test(nome) ? nome : null;
}

// ---------------------------------------------------------------------------------------------
// As seis regras
// ---------------------------------------------------------------------------------------------

const ONDE_LER = 'Ver CONTRATO.md, EST-1b, e a armadilha DAD-6 do ARMADILHAS.md.';

/** Nome que recebe o valor: o `const`, a chave do objeto ou o atributo do JSX em volta. */
function destinoDoValor(node) {
  let atual = node;
  for (let i = 0; i < 8 && atual?.parent; i += 1) {
    const pai = atual.parent;
    if (ts.isVariableDeclaration(pai) && ts.isIdentifier(pai.name)) return pai.name.text;
    if (ts.isPropertyAssignment(pai) && (ts.isIdentifier(pai.name) || ts.isStringLiteral(pai.name))) return pai.name.text;
    if (ts.isJsxAttribute(pai) && ts.isIdentifier(pai.name)) return pai.name.text;
    if (ts.isJsxExpression(pai) || ts.isParenthesizedExpression(pai) || ts.isArrayLiteralExpression(pai) || ts.isAsExpression(pai)) {
      atual = pai;
      continue;
    }
    return '';
  }
  return '';
}

/**
 * O zero CHEGA A SER LIDO, ou é só um limite de desenho?
 *
 * A distinção decide entre erro e aviso, e ela é de substância, não de gosto.
 * `taxa = base > 0 ? parte / base : 0` seguido de `formatPercent(taxa)` escreve "0%" no cartão: é
 * medição falsa, e reprova. `pxPerUnit = row.percent > 0 ? altura / row.percent : 0` é conversão de
 * unidade para posicionar um traço numa tela que não tem nada para posicionar: é piso de desenho, e
 * orienta sem reprovar. Medido no acervo em 2026-09-28: sem esta separação, 1 em cada 4 dos achados
 * de maior gravidade era geometria, e uma guarda com essa proporção de ruído é desligada na primeira
 * semana.
 *
 * COMO É DECIDIDO: sobe-se do zero até o primeiro ancestral que diz para onde o valor vai. Atributo
 * de JSX de geometria, propriedade de objeto de estilo e `return` de função de unidade contam como
 * desenho; chamada a um formatador de `@/lib/format`, `aria-label` e posição de filho de JSX contam
 * como texto. Quando o zero mora num `const`, o leitor dá UM salto e olha onde o nome é usado dentro
 * da mesma função. Não achando nada decisivo, o veredito é AVISO: preferir falso negativo é regra
 * desta guarda.
 */
const ATRIBUTO_DE_TEXTO = new Set(['aria-label', 'aria-valuetext', 'title', 'alt', 'children', 'summary']);
const PROPRIEDADE_DE_ESTILO = /^(?:width|height|top|left|right|bottom|inset|margin|padding|transform|translate|gap|flex|grid|stroke|fill|opacity|radius|border|font|line|max|min|z)/i;

/** Sobe do nó até o primeiro ancestral que diz se o valor vira texto lido ou geometria. */
function chegaAoTexto(node) {
  let atual = node;
  for (let i = 0; i < 24 && atual?.parent; i += 1) {
    const pai = atual.parent;
    if (ts.isJsxAttribute(pai)) return ATRIBUTO_DE_TEXTO.has(pai.name.getText());
    if (ts.isPropertyAssignment(pai) && (ts.isIdentifier(pai.name) || ts.isStringLiteral(pai.name)) && PROPRIEDADE_DE_ESTILO.test(pai.name.text)) return false;
    if (ts.isCallExpression(pai) && atual !== pai.expression) {
      const alvo = pai.expression;
      const nome = ts.isIdentifier(alvo) ? alvo.text : ts.isPropertyAccessExpression(alvo) ? alvo.name.text : '';
      if (/^format/.test(nome)) return true;
    }
    if (ts.isJsxExpression(pai) && pai.parent && (ts.isJsxElement(pai.parent) || ts.isJsxFragment(pai.parent))) return true;
    atual = pai;
  }
  return false;
}

/**
 * Acha os defeitos de agregação num arquivo já lido pelo TypeScript.
 * Devolve `[{ linha, code: 'AGREGACAO-ZERO', regra, texto }]`, no formato que `aplicarEscapes` de
 * `guardas.mjs` consome.
 */
export function acharAgregacaoZero(sourceFile) {
  const rel = path.basename(sourceFile.fileName);
  const achados = [];
  const jaVisto = new Set();
  const linhaDe = (node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const derivacao = mapaDeDerivacao(sourceFile);
  const elementos = mapaDeElemento(sourceFile);
  const escopoDoModulo = testesNoEscopo(sourceFile, sourceFile, elementos);

  const push = (node, regra, mensagem, nivel = 'erro') => {
    const linha = linhaDe(node);
    const chave = `${linha}|${regra}`;
    if (jaVisto.has(chave)) return;
    jaVisto.add(chave);
    achados.push({ linha, code: 'AGREGACAO-ZERO', regra, nivel, texto: `${rel}:${linha} AGREGACAO-ZERO (${regra}): ${mensagem}` });
  };
  /** O zero que vira limite de desenho orienta; o que é lido na tela reprova. */
  const nivelDoZero = (node) => {
    if (chegaAoTexto(node)) return 'erro';
    const nome = destinoDoValor(node);
    if (!nome) return 'aviso';
    const fn = funcaoAncestral(node);
    const alvo = fn?.body ?? sourceFile;
    let lido = false;
    const varre = (n) => {
      if (lido) return;
      if (ts.isIdentifier(n) && n.text === nome && n !== node && chegaAoTexto(n)) lido = true;
      ts.forEachChild(n, varre);
    };
    varre(alvo);
    return lido ? 'erro' : 'aviso';
  };

  /** Há guarda de vazio que cobre esta lista, no corpo da função em volta ou no módulo? */
  const temGuarda = (no) => {
    const chave = textoNormalizado(no, sourceFile);
    const raiz = raizDe(no);
    const classe = raiz ? classeDeTamanho(raiz, derivacao) : new Set();
    const escopos = [escopoDoModulo];
    const fn = funcaoAncestral(no);
    if (fn?.body) escopos.push(testesNoEscopo(fn.body, sourceFile, elementos));
    for (const escopo of escopos) {
      if (escopo.chaves.has(chave)) return true;
      for (const nome of classe) {
        if (escopo.raizes.has(nome)) return true;
      }
    }
    return false;
  };

  const visita = (node) => {
    // TIPO. Função de agregação com retorno `number` em vez de `number | null`.
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) {
      const nome = nomeDaFuncao(node);
      const nucleo = nome && NOME_NUCLEO.test(nome);
      const familia = nome && NOME_FAMILIA.test(nome);
      const agrega = corpoAgrega(node, sourceFile);
      if (temParametroDeLista(node) && retornoNumberSeco(node) && (nucleo || (familia && agrega))) {
        push(
          node.type ?? node,
          'TIPO',
          `a função "${nome}" resume uma lista e declara retorno "number". Lista vazia não tem mediana, média nem taxa: ` +
            'declare `number | null`, devolva `null` no caso vazio e deixe o chamador cair em formatUnavailable(). ' +
            `Devolver 0 passa por todas as guardas e por toda revisão por imagem, porque o dado publicado da peça é completo e o ramo nunca aparece no render. ${ONDE_LER}`,
        );
      }
    }

    if (ts.isConditionalExpression(node)) {
      const teste = testeDeVazio(node.condition, true);
      if (teste) {
        const ramoVazio = teste.sentido === 'vazio' ? node.whenTrue : node.whenFalse;
        const ramoCheio = teste.sentido === 'vazio' ? node.whenFalse : node.whenTrue;
        // ZERO. O ramo do vazio entrega o literal 0.
        if (ehZero(ramoVazio)) {
          push(
            node,
            'ZERO',
            `o ramo de lista vazia de "${textoNormalizado(node.condition, sourceFile).slice(0, 48)}" devolve 0. ` +
              'Zero é medida: escrito na tela ele afirma que a conta deu zero, quando não houve conta. Devolva `null` e trate a ausência no desenho. ' +
              `${ONDE_LER}`,
            nivelDoZero(node),
          );
        }
        // VIZINHA. A guarda testa uma lista e a conta roda sobre outra, de tamanho diferente.
        const guardaRaiz = raizDe(teste.no);
        const classeGuarda = guardaRaiz ? classeDeTamanho(guardaRaiz, derivacao) : new Set();
        const chaveGuarda = textoNormalizado(teste.no, sourceFile);
        // Só CONTA vale aqui: `length` como divisor e o `reduce` que soma. Um `length` qualquer no
        // ramo cheio costuma ser outra guarda ou um total escrito na frase, e contá-lo acusava em
        // falso `16_distribuicao/04_ecdf-e-histograma-acumulado/v1` e
        // `08_combinados-e-eixo-duplo/03_paineis-alinhados/v1`, as duas corretas.
        const contas = [];
        const varre = (n) => {
          if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.SlashToken) {
            const obj = objetoDoLength(n.right);
            if (obj) contas.push(obj);
          }
          if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && /^(?:reduce|reduceRight)$/.test(n.expression.name.text)) contas.push(n.expression.expression);
          ts.forEachChild(n, varre);
        };
        varre(ramoCheio);
        for (const conta of contas) {
          const chave = textoNormalizado(conta, sourceFile);
          if (chave === chaveGuarda) continue;
          const raizConta = raizDe(conta);
          if (raizConta && classeGuarda.has(raizConta) && !cadeiaDaLista(conta).mudouTamanho) continue;
          if (raizConta && classeDeTamanho(raizConta, derivacao).has(guardaRaiz ?? '\u0000') && !cadeiaDaLista(conta).mudouTamanho) continue;
          push(
            node,
            'VIZINHA',
            `a guarda de vazio testa "${chaveGuarda.slice(0, 32)}" e a conta roda sobre "${chave.slice(0, 32)}", que é outra lista. ` +
              'Quando a filtrada esvazia e a vizinha não, a guarda não dispara e a conta sai zero, infinito ou NaN. ' +
              `A guarda testa SEMPRE a lista que alimenta a conta. ${ONDE_LER}`,
          );
          break;
        }
      }
      // ZERO (denominador). `base > 0 ? parte / base : 0`.
      if (ehZero(node.whenFalse)) {
        const cond = ts.isParenthesizedExpression(node.condition) ? node.condition.expression : node.condition;
        let base = null;
        if (ts.isBinaryExpression(cond) && [ts.SyntaxKind.GreaterThanToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(cond.operatorToken.kind) && ehZero(cond.right)) base = cond.left;
        else if (ts.isIdentifier(cond) || ts.isPropertyAccessExpression(cond)) base = cond;
        if (base && !objetoDoLength(base)) {
          const textoBase = textoNormalizado(base, sourceFile);
          let divide = false;
          const varre = (n) => {
            if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.SlashToken && textoNormalizado(n.right, sourceFile) === textoBase) divide = true;
            ts.forEachChild(n, varre);
          };
          varre(node.whenTrue);
          if (divide) {
            push(
              node,
              'ZERO',
              `"${textoBase.slice(0, 32)}" é o denominador, e o ramo sem denominador devolve 0. Taxa sem base não é zero: é ausência. ` +
                `Devolva \`null\` e escreva formatUnavailable() no lugar do percentual. ${ONDE_LER}`,
              nivelDoZero(node),
            );
          }
        }
      }
    }

    // ZERO (bloco). `if (x.length === 0) return 0;`
    if (ts.isIfStatement(node) && !node.elseStatement) {
      const teste = testeDeVazio(node.expression, true);
      if (teste && teste.sentido === 'vazio') {
        const corpo = ts.isBlock(node.thenStatement) ? node.thenStatement.statements : [node.thenStatement];
        for (const st of corpo) {
          if (ts.isReturnStatement(st) && st.expression && ehZero(st.expression)) {
            push(
              st,
              'ZERO',
              'a saída de lista vazia devolve 0. Devolva `null`: o chamador cai em formatUnavailable() e a marca da medida ausente deixa de ser desenhada, ' +
                `em vez de plantar zero medido onde não houve medição. ${ONDE_LER}`,
            );
          }
        }
      }
    }

    // EXTREMO. `Math.min(...lista)` e `Math.max(...lista)` sem semente e sem guarda.
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'Math' &&
      /^(?:min|max)$/.test(node.expression.name.text) &&
      node.arguments.length === 1 &&
      ts.isSpreadElement(node.arguments[0])
    ) {
      const lista = node.arguments[0].expression;
      if (!temGuarda(lista)) {
        const qual = node.expression.name.text;
        push(
          node,
          'EXTREMO',
          `Math.${qual}(...${textoNormalizado(lista, sourceFile).slice(0, 34)}) sobre lista vazia devolve ${qual === 'min' ? 'Infinity' : '-Infinity'}, ` +
            'que não é zero mas também não é medida, e chega ao domínio do eixo e à dica como número. ' +
            `Ponha uma semente que seja limite de desenho (Math.${qual}(1, ...lista)) ou teste a MESMA lista antes e devolva \`null\`. ${ONDE_LER}`,
        );
      }
    }

    // DIVISOR. Soma dividida por `X.length` sem nenhum teste de vazio sobre `X`.
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.SlashToken) {
      const divisor = objetoDoLength(node.right);
      if (divisor && !temGuarda(divisor)) {
        push(
          node,
          'DIVISOR',
          `a média divide por "${textoNormalizado(divisor, sourceFile).slice(0, 34)}.length" e nada no escopo testa se essa lista está vazia. ` +
            'Divisão por zero chega à tela como NaN. Teste a MESMA lista que alimenta a conta, nunca a vizinha, e devolva `null` no vazio. ' +
            `${ONDE_LER}`,
        );
      }
    }

    // RECAI. `?? 0` ou `|| 0` sobre o resultado de uma agregação.
    if (ts.isBinaryExpression(node) && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(node.operatorToken.kind) && ehZero(node.right)) {
      const esq = ts.isParenthesizedExpression(node.left) ? node.left.expression : node.left;
      const nome = chamadaDeAgregacao(esq);
      if (nome) {
        push(
          node,
          'RECAI',
          `"${nome}(...) ${node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken ? '??' : '||'} 0" desfaz no chamador o \`null\` que a agregação devolveu. ` +
            'O `null` existe para virar formatUnavailable() e para a marca não ser desenhada; trocado por 0 ele volta a ser zero medido. ' +
            `${ONDE_LER}`,
        );
      }
    }

    ts.forEachChild(node, visita);
  };
  visita(sourceFile);
  return achados;
}
