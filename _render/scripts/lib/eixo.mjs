/**
 * Leitor do EIXO CALMO do `Chart.tsx`: diz, para cada eixo cartesiano de uma peça com grade, se a
 * LINHA DE EIXO acaba desenhada. Existe para a guarda EIXO-CALMO de `guardas.mjs` e não decide nada:
 * só devolve achados com linha, regra e texto.
 *
 * A REGRA. EIX-5 do CONTRATO.md: "Eixo calmo: com grade, `tickLine={false}`, `axisLine={false}` e
 * `tickMargin={8}` (sobrescrevem o `axisLine` de `AXIS_PROPS`)". A regra NOMEIA o `AXIS_PROPS`, e o
 * motivo está no módulo compartilhado: `app/src/components/visuals/charts/chartTheme.ts` define
 * `AXIS_PROPS` com `tickLine: false` mas com `axisLine: { stroke: GRID_COLOR }`, isto é, a linha de
 * eixo LIGADA por padrão. Quem espalha `{...AXIS_PROPS}` e não sobrepõe `axisLine` desenha a linha, e
 * com grade no fundo ela é uma terceira régua concorrendo com a grade e com a borda do cartão.
 *
 * POR QUE ELA MERECE GUARDA, e por que nenhuma revisão a pegou. O defeito é de UMA PROPRIEDADE QUE
 * NÃO ESTÁ ESCRITA: não há linha de código errada para ler, há uma linha ausente cujo padrão vem de
 * outro arquivo. Revisão de código não vê ausência, e revisão por imagem confunde a linha de eixo com
 * a linha da grade, porque as duas saem em `--line-subtle` e a de eixo cai justo em cima do primeiro
 * degrau da grade. Medido em 2026-09-28: o padrão do módulo compartilhado é o que está errado, já que
 * a maioria esmagadora dos chamadores de `AXIS_PROPS` sobrepõe `axisLine` à mão; a minoria que não
 * sobrepõe herda a linha em silêncio, com o `check` verde.
 *
 * POR QUE ÁRVORE SINTÁTICA, e nunca expressão regular. O que decide aqui é ORDEM e VALOR, e nenhum
 * dos dois é texto:
 *
 *   ORDEM. Em JSX a última propriedade vence. `{...AXIS_PROPS} axisLine={false}` DESLIGA a linha;
 *   `axisLine={false} {...AXIS_PROPS}` NÃO desliga, porque o espalhamento vem depois e reinstala o
 *   padrão do módulo. As duas escritas têm exatamente os mesmos caracteres, então busca por texto dá
 *   o mesmo veredito para as duas e erra numa delas por construção.
 *
 *   VALOR. `axisLine={{ stroke: GRID_COLOR }}` é sobreposição SINTÁTICA e não SEMÂNTICA: a peça
 *   escreve `axisLine`, uma busca por texto se cala, e a linha continua desenhada com outra cor.
 *
 * DE ONDE VEM O PADRÃO, e por que ele é LIDO em vez de suposto. O leitor abre o `chartTheme.ts` do
 * Farol e mede o `axisLine` do próprio `AXIS_PROPS`. Isso importa por uma razão de futuro: o conserto
 * na raiz é uma linha naquele arquivo, e no dia em que ele acontecer esta guarda tem de ficar QUIETA
 * sozinha, em vez de acusar o acervo inteiro por uma verdade que deixou de valer. `FAROL_AXIS_PROPS`
 * troca o valor lido e existe SÓ para o `npm run selftest`, que precisa provar os dois sentidos da
 * guarda sem depender do estado de `app/`.
 *
 * O QUE ELE ACUSA, nas três formas em que a linha sobra:
 *
 *   HERDADO   a peça espalha `AXIS_PROPS` e não escreve `axisLine` nenhum naquele eixo. É o caso
 *             central, e o mais comum.
 *   ORDEM     a peça escreve `axisLine={false}` ANTES do espalhamento, que o desfaz. É a inversão
 *             que só a árvore pega.
 *   SINTATICO a peça escreve `axisLine` com valor que não desliga nada, um objeto de `stroke` ou
 *             `true`.
 *
 * O QUE ELE NÃO ACUSA, por decisão, com o motivo de cada um:
 *
 *   PEÇA SEM GRADE. A EIX-5 condiciona o eixo calmo à grade ("com grade"). Sem `CartesianGrid` não
 *   há régua concorrente e a linha de eixo é a única referência: ali ela está certa.
 *
 *   EIXO QUE NÃO ESPALHA `AXIS_PROPS`. A letra da regra fala do padrão do módulo compartilhado, e um
 *   eixo escrito à mão declara o que quer. Fica de fora também porque o padrão do Recharts para
 *   `axisLine` é `true`, então acusar aqui seria medir a biblioteca e não o catálogo.
 *
 *   EIXO COM `hide`. Eixo escondido não desenha linha nenhuma, e vários eixos do acervo existem só
 *   para declarar domínio.
 *
 *   VALOR QUE O LEITOR NÃO CONSEGUE RESOLVER: ternário, chamada de função, `undefined`, identificador
 *   que não se resolve no arquivo. Prefere falso negativo a falso positivo, pela mesma razão das
 *   outras guardas da casa: guarda que grita sem motivo é desligada por quem produz, e aí vale zero.
 *
 *   `tickMargin={8}`, a outra metade da EIX-5. Não está no `AXIS_PROPS`, então a ausência dele não é
 *   defeito herdado de módulo compartilhado e sim outra regra, com outra fila e outra medição.
 *
 *   GRADE DESENHADA À MÃO, com `<line>` repetida em vez de `CartesianGrid`, e eixo polar
 *   (`PolarAngleAxis`, `PolarRadiusAxis`), que a EIX-3b trata por outro caminho.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { APP_SRC } from './paths.mjs';

const require = createRequire(import.meta.url);
const ts = require('typescript');

/** Os eixos cartesianos do Recharts. `ZAxis` fica fora: ele não desenha linha de eixo. */
const EIXO_CARTESIANO = new Set(['XAxis', 'YAxis']);
/** A grade que liga a EIX-5. Grade desenhada à mão fica fora, declarado no cabeçalho. */
const GRADE = 'CartesianGrid';
/**
 * Os invólucros de gráfico do Recharts. Servem para escopar a pergunta "há grade NESTE gráfico?": um
 * `Chart.tsx` com dois gráficos, um com grade e outro sem, não pode ter o eixo de um julgado pela
 * grade do outro.
 */
const INVOLUCRO = new Set(['AreaChart', 'BarChart', 'ComposedChart', 'LineChart', 'RadarChart', 'RadialBarChart', 'ScatterChart']);

/** Como uma propriedade `axisLine` se comporta na tela. */
const LIGA = 'liga';
const DESLIGA = 'desliga';
const AUSENTE = 'ausente';
const INCERTO = 'incerto';

/** O nome da tag de um elemento JSX, aberto ou autofechado; `null` quando não é elemento. */
function nomeDaTag(node) {
  const abertura = aberturaDe(node);
  if (!abertura) return null;
  try {
    return abertura.tagName.getText();
  } catch {
    return null;
  }
}

/** A abertura de um elemento JSX, onde moram os atributos na ordem escrita. */
function aberturaDe(node) {
  if (ts.isJsxSelfClosingElement(node)) return node;
  if (ts.isJsxElement(node)) return node.openingElement;
  return null;
}

function descascar(no) {
  let atual = no;
  while (atual && (ts.isAsExpression(atual) || ts.isParenthesizedExpression(atual) || ts.isNonNullExpression(atual))) atual = atual.expression;
  return atual;
}

/**
 * Mapa de nome para o que ele produz, para seguir um identificador até o objeto que ele guarda.
 * Entra toda declaração de variável do arquivo, em qualquer escopo: a forma correta mais comum de
 * reuso é um objeto local (`const EIXO = { ...AXIS_PROPS, axisLine: false }`) espalhado nos dois
 * eixos, e sem este mapa a guarda leria esse objeto como opaco e se calaria nos dois sentidos.
 */
function declaracoes(sourceFile) {
  const mapa = new Map();
  const visita = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) mapa.set(node.name.text, node.initializer);
    ts.forEachChild(node, visita);
  };
  visita(sourceFile);
  return mapa;
}

/** Como este valor de `axisLine` se comporta. Ver o cabeçalho para o que fica em `INCERTO` e por quê. */
function classificarValor(expr, mapa, profundidade = 0) {
  if (profundidade > 8) return INCERTO;
  const no = descascar(expr);
  if (!no) return INCERTO;
  if (no.kind === ts.SyntaxKind.FalseKeyword) return DESLIGA;
  if (no.kind === ts.SyntaxKind.TrueKeyword) return LIGA;
  // Objeto de `stroke`, cor em texto, número de espessura: a linha continua desenhada. É a
  // sobreposição sintática, o caso que uma busca por texto conta como conserto.
  if (ts.isObjectLiteralExpression(no) || ts.isStringLiteral(no) || ts.isNumericLiteral(no) || ts.isNoSubstitutionTemplateLiteral(no)) return LIGA;
  if (ts.isIdentifier(no)) {
    const destino = mapa.get(no.text);
    return destino ? classificarValor(destino, mapa, profundidade + 1) : INCERTO;
  }
  return INCERTO;
}

/** O nome da chave de uma propriedade de objeto; `null` quando é calculada. */
function chaveDe(prop) {
  if (!prop.name) return null;
  if (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) return prop.name.text;
  return null;
}

/**
 * O que um espalhamento (`{...X}`) traz: se ele passa pelo `AXIS_PROPS` e o que ele diz de `axisLine`.
 * Segue objeto literal e identificador, porque o reuso correto do acervo é um objeto local montado a
 * partir do `AXIS_PROPS`.
 */
function resolverEspalhamento(expr, mapa, padraoDoFarol, profundidade = 0) {
  if (profundidade > 8) return { usaAxisProps: false, axisLine: INCERTO };
  const no = descascar(expr);
  if (!no) return { usaAxisProps: false, axisLine: INCERTO };
  if (ts.isIdentifier(no)) {
    if (no.text === 'AXIS_PROPS') return { usaAxisProps: true, axisLine: padraoDoFarol };
    const destino = mapa.get(no.text);
    if (!destino) return { usaAxisProps: false, axisLine: INCERTO };
    return resolverEspalhamento(destino, mapa, padraoDoFarol, profundidade + 1);
  }
  if (ts.isObjectLiteralExpression(no)) {
    let usaAxisProps = false;
    let axisLine = AUSENTE;
    // Na ordem: dentro de um objeto literal a última chave também vence.
    for (const prop of no.properties) {
      if (ts.isSpreadAssignment(prop)) {
        const dentro = resolverEspalhamento(prop.expression, mapa, padraoDoFarol, profundidade + 1);
        if (dentro.usaAxisProps) usaAxisProps = true;
        if (dentro.axisLine !== AUSENTE) axisLine = dentro.axisLine;
        continue;
      }
      if (chaveDe(prop) !== 'axisLine') continue;
      axisLine = ts.isPropertyAssignment(prop) ? classificarValor(prop.initializer, mapa) : INCERTO;
    }
    return { usaAxisProps, axisLine };
  }
  return { usaAxisProps: false, axisLine: INCERTO };
}

/**
 * O `axisLine` do `AXIS_PROPS` do Farol, LIDO do `chartTheme.ts` em vez de suposto.
 *
 * Por que lido: o conserto na raiz é uma linha naquele arquivo, e no dia em que ele acontecer esta
 * guarda tem de emudecer sozinha. Guarda que carrega a premissa codificada continuaria acusando o
 * acervo inteiro depois do conserto, e seria desligada.
 *
 * `FAROL_AXIS_PROPS` (`liga`, `desliga` ou `ausente`) troca o valor e existe só para o selftest.
 */
export function axisLineDoFarol() {
  const forcado = process.env.FAROL_AXIS_PROPS;
  if (forcado === LIGA || forcado === DESLIGA || forcado === AUSENTE) return { valor: forcado, fonte: 'FAROL_AXIS_PROPS' };
  const arquivo = path.join(APP_SRC, 'components', 'visuals', 'charts', 'chartTheme.ts');
  // Ausente é o caso de quem roda a ferramenta sem o app ao lado. O padrão de segurança é `liga`, que
  // é o estado medido em 2026-09-28: assumir `desliga` deixaria a guarda cega justamente na
  // configuração em que ela é necessária.
  if (!fs.existsSync(arquivo)) return { valor: LIGA, fonte: 'padrao_sem_chartTheme' };
  const sourceFile = ts.createSourceFile(arquivo, fs.readFileSync(arquivo, 'utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  const mapa = declaracoes(sourceFile);
  const objeto = descascar(mapa.get('AXIS_PROPS'));
  if (!objeto || !ts.isObjectLiteralExpression(objeto)) return { valor: LIGA, fonte: 'padrao_axis_props_ilegivel' };
  for (const prop of objeto.properties) {
    if (!ts.isPropertyAssignment(prop) || chaveDe(prop) !== 'axisLine') continue;
    return { valor: classificarValor(prop.initializer, mapa), fonte: 'chartTheme.ts' };
  }
  return { valor: AUSENTE, fonte: 'chartTheme.ts' };
}

/** O elemento declara `hide` verdadeiro? Eixo escondido não desenha linha, então a EIX-5 não o alcança. */
function estaEscondido(abertura, mapa) {
  for (const atributo of abertura.attributes.properties) {
    if (!ts.isJsxAttribute(atributo)) continue;
    if (atributo.name.getText() !== 'hide') continue;
    // `<XAxis hide />` sem valor é `true`.
    if (!atributo.initializer) return true;
    const valor = ts.isJsxExpression(atributo.initializer) ? atributo.initializer.expression : atributo.initializer;
    return classificarValor(valor, mapa) === LIGA;
  }
  return false;
}

/**
 * O estado final de `axisLine` neste eixo, percorrendo os atributos NA ORDEM ESCRITA, que é a ordem em
 * que o JSX resolve o conflito. Devolve também COMO a linha sobrou, porque cada forma pede um
 * conserto diferente e a mensagem tem de dizer qual.
 */
function estadoDoEixo(abertura, mapa, padraoDoFarol) {
  let usaAxisProps = false;
  let estado = AUSENTE;
  let origem = null;
  let desligouAntes = false;
  for (const atributo of abertura.attributes.properties) {
    if (ts.isJsxSpreadAttribute(atributo)) {
      const trazido = resolverEspalhamento(atributo.expression, mapa, padraoDoFarol);
      if (trazido.usaAxisProps) usaAxisProps = true;
      if (trazido.axisLine !== AUSENTE) {
        estado = trazido.axisLine;
        origem = 'espalhamento';
      }
      continue;
    }
    if (!ts.isJsxAttribute(atributo) || atributo.name.getText() !== 'axisLine') continue;
    // `<XAxis axisLine />` é `axisLine={true}`.
    if (!atributo.initializer) estado = LIGA;
    else {
      const valor = ts.isJsxExpression(atributo.initializer) ? atributo.initializer.expression : atributo.initializer;
      estado = classificarValor(valor, mapa);
    }
    origem = 'atributo';
    if (estado === DESLIGA) desligouAntes = true;
  }
  let forma = null;
  if (estado === LIGA) {
    if (origem === 'atributo') forma = 'sintatico';
    else if (desligouAntes) forma = 'ordem';
    else forma = 'herdado';
  }
  return { usaAxisProps, estado, forma };
}

/** O invólucro de gráfico mais próximo acima deste nó; `null` quando o eixo mora fora de um. */
function involucroAncestral(node) {
  let atual = node.parent;
  while (atual) {
    const nome = nomeDaTag(atual);
    if (nome && INVOLUCRO.has(nome)) return atual;
    atual = atual.parent;
  }
  return null;
}

/** Há `CartesianGrid` dentro deste nó? */
function temGrade(raiz) {
  let achou = false;
  const visita = (no) => {
    if (achou) return;
    if (nomeDaTag(no) === GRADE) {
      achou = true;
      return;
    }
    ts.forEachChild(no, visita);
  };
  visita(raiz);
  return achou;
}

/**
 * Acha os eixos que deixam a linha de eixo desenhada numa peça com grade.
 *
 * Devolve `{ achados: [{ linha, code: 'EIXO-CALMO', texto }], medida, motivo, eixos, padrao }`.
 * `medida` é falso com motivo quando a EIX-5 não se aplica ou o leitor não teve o que ler; nunca
 * calado, para o `check` contar a cobertura à parte.
 */
export function acharEixoCalmo(sourceFile) {
  const rel = path.basename(sourceFile.fileName);
  const { valor: padraoDoFarol, fonte } = axisLineDoFarol();
  const mapa = declaracoes(sourceFile);
  const linhaDe = (node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const achados = [];

  const eixos = [];
  const visita = (node) => {
    const nome = nomeDaTag(node);
    if (nome && EIXO_CARTESIANO.has(nome)) eixos.push({ node, nome });
    ts.forEachChild(node, visita);
  };
  visita(sourceFile);

  if (!temGrade(sourceFile)) return { achados, medida: false, motivo: 'sem_grade', eixos: 0, padrao: padraoDoFarol };
  if (!eixos.length) return { achados, medida: false, motivo: 'sem_eixo_cartesiano', eixos: 0, padrao: padraoDoFarol };
  // O `AXIS_PROPS` já desliga a linha: a EIX-5 não tem mais o que sobrescrever e a guarda emudece
  // sozinha. É o que faz o conserto na raiz ser possível sem ninguém precisar desligar a guarda.
  if (padraoDoFarol !== LIGA) return { achados, medida: false, motivo: `axis_props_${padraoDoFarol}`, eixos: eixos.length, padrao: padraoDoFarol };

  let medidos = 0;
  for (const { node, nome } of eixos) {
    const abertura = aberturaDe(node);
    if (!abertura) continue;
    const involucro = involucroAncestral(node);
    // Sem invólucro reconhecido, a pergunta da grade recai sobre o arquivo, que já respondeu sim.
    if (involucro && !temGrade(involucro)) continue;
    if (estaEscondido(abertura, mapa)) continue;
    const { usaAxisProps, estado, forma } = estadoDoEixo(abertura, mapa, padraoDoFarol);
    if (!usaAxisProps) continue;
    medidos += 1;
    if (estado !== LIGA) continue;
    const linha = linhaDe(node);
    const comoSobrou =
      forma === 'ordem'
        ? 'o `axisLine={false}` está ANTES do `{...AXIS_PROPS}`, e em JSX a última propriedade vence: o espalhamento vem depois e reinstala a linha; troque a ordem'
        : forma === 'sintatico'
          ? 'o `axisLine` está escrito com um valor que NÃO desliga a linha, só troca a cor dela; sobreposição sintática não é sobreposição semântica'
          : 'o eixo espalha `{...AXIS_PROPS}` e não escreve `axisLine` nenhum, então herda o padrão do módulo compartilhado';
    achados.push({
      linha,
      code: 'EIXO-CALMO',
      texto:
        `${rel}:${linha} EIXO-CALMO: este <${nome}> desenha a LINHA DE EIXO numa peça que tem CartesianGrid, porque ${comoSobrou}. ` +
        `O padrão foi lido de ${fonte}: o AXIS_PROPS do Farol traz axisLine com a linha LIGADA, e a EIX-5 existe exatamente para sobrescrevê-lo. ` +
        'Com grade no fundo a linha de eixo é uma terceira régua: ela sai na mesma --line-subtle da grade e cai em cima do primeiro degrau dela. ' +
        'Escreva `axisLine={false}` DEPOIS do espalhamento, junto de `tickLine={false}` e `tickMargin={8}`. ' +
        'Ver CONTRATO.md, EIX-5, que nomeia o AXIS_PROPS, e EIX-3b para o plano com duas grandezas, que pede grade nos dois sentidos sem tique e sem linha de eixo.',
    });
  }

  if (!medidos) return { achados, medida: false, motivo: 'sem_eixo_com_axis_props', eixos: eixos.length, padrao: padraoDoFarol };
  return { achados, medida: true, motivo: null, eixos: medidos, padrao: padraoDoFarol };
}
