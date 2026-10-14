/**
 * Leitor da RÉGUA DE TAMANHO do `Chart.tsx`: a legenda que ensina a ler área, raio ou tamanho.
 * Existe para a guarda REGUA-CONSTANTE de `guardas.mjs` e não decide nada.
 *
 * A REGRA. ROT-5b do CONTRATO.md, emenda de 2026-09-28: "quando a legenda ensina a ler área ou
 * raio, o último degrau dela é o maior valor OBSERVADO, calculado do dado, nunca uma constante
 * escrita à mão". Constante envelhece no primeiro recorte diferente e deixa a maior marca da tela
 * sem referência: a régua para em 350 e existe um círculo de 900.
 *
 * POR QUE ELA MERECE GUARDA. O defeito apareceu de forma INDEPENDENTE em duas versões da mesma
 * família, `09_dispersao-e-bolhas/09_densidade-2d/v1` e
 * `09_dispersao-e-bolhas/04_bolhas-em-grade-categorica/v1`, as duas pegas por revisão humana e
 * NENHUMA pelo `check`. Duas descobertas independentes do mesmo defeito não são descuido: são
 * lacuna de mecanismo. As duas foram consertadas em 2026-09-25 e hoje escrevem a forma certa, um
 * array de referências intermediárias mais o máximo calculado, então esta guarda nasce como guarda
 * de REGRESSÃO: ela protege um conserto já feito.
 *
 * COMO O DEFEITO É RECONHECIDO. A legenda é um `.map` dentro do JSX cujo valor de cada degrau
 * ALIMENTA UM TAMANHO: o raio de um círculo, o lado de um quadrado, o `size` de uma marca. Se a
 * lista mapeada se resolve, seguindo os `const` do arquivo, num array só de literais numéricos,
 * então o último degrau é constante e a régua não acompanha o recorte. Basta um dos degraus vir do
 * dado (`Math.max`, `reduce`, `sort`, uma chamada que recebe o máximo) para a régua estar certa.
 *
 * POR QUE O TAMANHO E NÃO A POSIÇÃO. Tique de eixo também é array de literais mapeado no JSX
 * (`TICKS = [0, 20, 40, 60, 80, 100]` existe em várias versões, inclusive na própria `09/09 v1`), e
 * ali a constante está CERTA: o eixo tem domínio declarado e o tique é a régua do domínio, não do
 * dado. O que separa os dois é o que o valor alimenta: `r`, `rx`, `ry`, `size`, ou largura e altura
 * juntas. Nenhum tique de eixo do acervo alimenta isso.
 *
 * NÃO COBRE, declarado: legenda desenhada em HTML cujo tamanho vem de classe utilitária em vez de
 * estilo calculado, porque ali o número não está no código; legenda montada noutro arquivo; e a
 * régua cujo último degrau é constante mas MAIOR que qualquer dado possível, que é correta e sai
 * acusada, motivo pelo qual a mensagem pede escape em vez de conserto cego.
 */
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

/** Atributos que recebem TAMANHO de marca. Posição (`x`, `y`, `cx`, `cy`) fica fora de propósito. */
const ATRIBUTO_DE_TAMANHO = new Set(['r', 'rx', 'ry', 'size', 'radius', 'innerRadius', 'outerRadius', 'barSize']);
/** Largura e altura só valem JUNTAS: sozinhas são tique, trilho e faixa. */
const ATRIBUTO_DE_LADO = new Set(['width', 'height']);
/** Sinais de que o valor veio do dado, e não da mão de quem escreveu. */
const VEM_DO_DADO = /\b(?:Math\.max|Math\.min|reduce|reduceRight|sort|toSorted|at\(-1\)|length)\b/;

function textoDe(node, sourceFile) {
  try {
    return node.getText(sourceFile).replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

/**
 * Mapa de nome para o que ele produz, para seguir a lista mapeada até a origem. Entram os `const` e
 * também as FUNÇÕES, porque a forma certa da régua no acervo é uma função que recebe o máximo
 * (`legendValues(maxCount)`) e devolve as referências mais ele: sem olhar o corpo da função, a
 * guarda não saberia distinguir essa forma de uma que devolve só constante.
 */
function declaracoes(sourceFile) {
  const mapa = new Map();
  const visita = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) mapa.set(node.name.text, node.initializer);
    if (ts.isFunctionDeclaration(node) && node.name && node.body) mapa.set(node.name.text, node.body);
    ts.forEachChild(node, visita);
  };
  visita(sourceFile);
  return mapa;
}

/**
 * Segue a expressão até a origem e diz o que ela é.
 * Devolve `{ tipo: 'literais', no }` quando chega num array só de números escritos à mão,
 * `{ tipo: 'do-dado' }` quando encontra sinal de cálculo sobre o dado, e `{ tipo: 'incerto' }`
 * quando não consegue decidir, caso em que a guarda se cala.
 */
function origemDaLista(expr, mapa, sourceFile, profundidade = 0) {
  if (!expr || profundidade > 8) return { tipo: 'incerto' };
  let no = expr;
  while (ts.isAsExpression(no) || ts.isParenthesizedExpression(no) || ts.isNonNullExpression(no)) no = no.expression;
  if (ts.isArrayLiteralExpression(no)) {
    const elementos = no.elements;
    if (!elementos.length) return { tipo: 'incerto' };
    if (elementos.every((el) => ts.isNumericLiteral(el) || (ts.isPrefixUnaryExpression(el) && ts.isNumericLiteral(el.operand)))) return { tipo: 'literais', no };
    return VEM_DO_DADO.test(textoDe(no, sourceFile)) ? { tipo: 'do-dado' } : { tipo: 'incerto' };
  }
  if (ts.isIdentifier(no)) {
    const destino = mapa.get(no.text);
    return destino ? origemDaLista(destino, mapa, sourceFile, profundidade + 1) : { tipo: 'incerto' };
  }
  if (ts.isCallExpression(no)) {
    // Chamada: a régua está certa quando o dado entra por argumento ou pelo corpo da função.
    if (VEM_DO_DADO.test(textoDe(no, sourceFile))) return { tipo: 'do-dado' };
    if (ts.isIdentifier(no.expression)) {
      const corpo = mapa.get(no.expression.text);
      if (corpo && VEM_DO_DADO.test(textoDe(corpo, sourceFile))) return { tipo: 'do-dado' };
    }
    return { tipo: 'incerto' };
  }
  return VEM_DO_DADO.test(textoDe(no, sourceFile)) ? { tipo: 'do-dado' } : { tipo: 'incerto' };
}

/**
 * O parâmetro do `.map` alimenta o TAMANHO DE UMA MARCA PINTADA dentro do JSX do corpo?
 *
 * As duas condições são necessárias, e a segunda nasceu de uma medição. A primeira versão desta
 * guarda pedia só "o valor alimenta um raio", e com isso acusou três versões corretas
 * (`07_rosca-e-radial/06_coluna-radial` v1 e v2, `07_rosca-e-radial/07_rosa-de-nightingale/v3`) em
 * que o `.map` desenha o ANEL DE GRADE da escala radial, que é o tique de eixo em coordenada polar:
 * ali a constante está certa, porque o domínio é declarado. O que separa as duas coisas é a pintura.
 * O degrau de uma legenda de tamanho é uma marca CHEIA, igual à do desenho, porque ele existe para
 * mostrar como a marca se parece; o anel de grade é `fill="none"` com traço de linha.
 */
function parametroAlimentaTamanho(callback, nome, sourceFile) {
  if (!nome) return false;
  // Apelidos locais: `const raio = raioPorArea(value, maxCount)` faz de `raio` o mesmo valor. Sem
  // este salto a guarda perderia a forma de `09_dispersao-e-bolhas/04_bolhas-em-grade-categorica/v1`,
  // que calcula o raio numa linha e o usa na seguinte.
  const nomes = new Set([nome]);
  const apelidos = (no) => {
    if (ts.isVariableDeclaration(no) && ts.isIdentifier(no.name) && no.initializer) {
      const texto = textoDe(no.initializer, sourceFile);
      for (const conhecido of [...nomes]) {
        if (new RegExp(`(?:^|[^\\w$])${conhecido}(?:$|[^\\w$])`).test(texto)) nomes.add(no.name.text);
      }
    }
    ts.forEachChild(no, apelidos);
  };
  if (callback.body) apelidos(callback.body);
  const usaONome = (no) => {
    const texto = textoDe(no, sourceFile);
    return [...nomes].some((n) => new RegExp(`(?:^|[^\\w$])${n.replace(/[$]/g, '\\$&')}(?:$|[^\\w$])`).test(texto));
  };
  let achou = false;
  const visitaElemento = (abertura) => {
    const lados = new Set();
    let porTamanho = false;
    let pintado = false;
    for (const atributo of abertura.attributes.properties) {
      if (!ts.isJsxAttribute(atributo) || !atributo.initializer) continue;
      const chave = atributo.name.getText();
      if (chave === 'fill' || chave === 'fillOpacity' || chave === 'style' || chave === 'className') {
        const valor = textoDe(atributo.initializer, sourceFile);
        if (!/["']none["']/.test(valor) && /fill|background|bg-/.test(`${chave} ${valor}`)) pintado = true;
      }
      if (!usaONome(atributo.initializer)) continue;
      if (ATRIBUTO_DE_TAMANHO.has(chave)) porTamanho = true;
      if (ATRIBUTO_DE_LADO.has(chave)) lados.add(chave);
    }
    if ((porTamanho || lados.size >= 2) && pintado) achou = true;
  };
  const visita = (no) => {
    if (ts.isJsxSelfClosingElement(no)) visitaElemento(no);
    if (ts.isJsxElement(no)) visitaElemento(no.openingElement);
    ts.forEachChild(no, visita);
  };
  if (callback.body) visita(callback.body);
  return achou;
}

/**
 * Acha as réguas de tamanho com último degrau constante.
 * Devolve `[{ linha, code: 'REGUA-CONSTANTE', texto }]`.
 */
export function acharReguaConstante(sourceFile) {
  const rel = path.basename(sourceFile.fileName);
  const achados = [];
  const mapa = declaracoes(sourceFile);
  const linhaDe = (node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;

  const visita = (node) => {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'map' && node.arguments.length >= 1) {
      const callback = node.arguments[0];
      if (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) {
        const primeiro = callback.parameters[0];
        const nomeParam = primeiro && ts.isIdentifier(primeiro.name) ? primeiro.name.text : null;
        if (parametroAlimentaTamanho(callback, nomeParam, sourceFile)) {
          const origem = origemDaLista(node.expression.expression, mapa, sourceFile);
          if (origem.tipo === 'literais') {
            const lista = textoDe(origem.no, sourceFile).slice(0, 44);
            const linha = linhaDe(node);
            achados.push({
              linha,
              code: 'REGUA-CONSTANTE',
              texto:
                `${rel}:${linha} REGUA-CONSTANTE: a legenda de tamanho é desenhada a partir de ${lista}, um array de números escritos à mão, ` +
                'e nada no caminho vem do dado. O último degrau de uma régua de área, raio ou tamanho é o maior valor OBSERVADO no recorte, ' +
                'calculado com Math.max sobre o dado; constante envelhece no primeiro recorte diferente e deixa a maior marca da tela sem referência. ' +
                'Guarde as referências intermediárias em constante e monte a lista como [...referências abaixo do máximo, máximo]. ' +
                'Ver CONTRATO.md, ROT-5b, medido em 09_dispersao-e-bolhas/09_densidade-2d/v1 e 09_dispersao-e-bolhas/04_bolhas-em-grade-categorica/v1.',
            });
          }
        }
      }
    }
    ts.forEachChild(node, visita);
  };
  visita(sourceFile);
  return achados;
}
