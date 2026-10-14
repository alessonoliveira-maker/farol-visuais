/**
 * Leitor dos FORMATADORES do `Chart.tsx`, separados em dois grupos: os que montam a frase acessível
 * e os que escrevem o que se vê. Existe para a guarda FORMATO-ACESSIVEL de `guardas.mjs` e não
 * decide nada.
 *
 * O DEFEITO. O mesmo número sai com duas aparências: o corpo escreve "+12%" e o leitor de tela ouve
 * "alta de 12,4%". Quem enxerga e quem ouve recebem números diferentes para a mesma medida, e nenhum
 * dos dois sabe disso. A forma extrema é a armadilha DAD-9, em que a frase acessível carrega um
 * recorte de período ("até setembro") que o desenho não carrega, porque a frase é CALCULADA do dado
 * e o rodapé é escrito à mão.
 *
 * ONDE ELE VIVE, e por que nenhuma guarda o pegava. A assimetria é estrutural: a frase da raiz é
 * montada em cima do dado, com um formatador escolhido para ler bem em voz alta, e o corpo é escrito
 * com outro formatador escolhido para caber na caixa. As duas escolhas são razoáveis em separado, e
 * só a COMPARAÇÃO revela a divergência. Revisão por imagem não a vê, porque a frase acessível não
 * está na imagem; revisão por código não a vê, porque as duas linhas estão longe uma da outra.
 *
 * O QUE ESTE LEITOR COMPARA, e por que só isto. Para cada chamada a um formatador de `@/lib/format`,
 * ele guarda o ARGUMENTO em texto normalizado e a CHAMADA inteira em texto normalizado. Quando o
 * mesmo argumento aparece na frase acessível e no corpo visível com chamadas diferentes, há
 * divergência. Diferente quer dizer formatador diferente (`formatPercent` contra
 * `formatPercentPoints`) ou o mesmo formatador com casas diferentes (`formatPercent(x)` contra
 * `formatPercent(x, 0)`), que é exatamente a distância entre "12,4%" e "12%".
 *
 * COMPARAR PELO ARGUMENTO é o que torna a guarda precisa em vez de palpite. Dois números diferentes
 * podem e devem ter formatos diferentes; o MESMO número não. Só quando o texto do argumento coincide
 * é que a guarda tem prova de que a medida é a mesma.
 *
 * A REGIÃO DA FRASE. É o valor de `aria-label`, e mais o `const` que esse valor nomeia, seguido por
 * UM salto. `aria-label={summary}` com `const summary = \`...\`` acima é a escrita idiomática do
 * catálogo inteiro, então sem esse salto a guarda mediria quase nada.
 *
 * NÃO COBRE, declarado: número montado sem formatador dentro da frase (a NUMERO-CRU já recusa isso
 * no JSX, mas a frase acessível é string e passa); divergência de PALAVRA sem divergência de
 * formatador ("queda de" contra um sinal de menos); e o caso em que a frase e o corpo usam nomes
 * diferentes para o mesmo dado, porque ali o leitor perde a prova de que a medida é a mesma e
 * prefere se calar.
 */
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

/** Atributos que só o leitor de tela recebe. */
const SO_PARA_O_LEITOR = new Set(['aria-label', 'aria-valuetext', 'aria-description']);

/**
 * Os formatadores que a guarda COMPARA: os de grandeza escalar, em que a mesma medida sai com a
 * mesma aparência ou está errada.
 *
 * O que ficou FORA, e por que, medido no acervo em 2026-09-28. A primeira versão comparava todos os
 * formatadores e acusou 11 versões, das quais só 3 tinham o defeito. Das 8 restantes:
 *
 *   SEIS eram `formatMonthLong` na frase contra `formatMonthShort` no corpo, que é a escrita CERTA e
 *   está no contrato: a TIP-5 manda usar a forma curta de tempo quando o tique não cabe, e a frase
 *   falada tem espaço para o mês inteiro. Rótulo de tempo vive legitimamente em duas formas.
 *
 *   DUAS eram `formatRateWithVolume(parte, base)` na frase contra `formatInt(parte)` no corpo, que
 *   não é divergência de FORMATO: a frase diz mais, acrescentando a taxa ao número que o corpo
 *   mostra. Mudar o que se diz é decisão de redação, e a ACE-1 pede justamente que a frase conclua.
 *
 * Por isso a comparação vale só entre formatadores de grandeza, onde "12%" e "12,4%" são a MESMA
 * afirmação com duas precisões, e uma das duas está sobrando.
 */
const FORMATADORES_DE_GRANDEZA = new Set([
  'formatInt',
  'formatDecimal',
  'formatCurrency',
  'formatCurrencyCompact',
  'formatCurrencyAxis',
  'formatPercent',
  'formatPercentFromScale100',
  'formatPercentPoints',
  'formatDays',
  'formatHours',
]);

/**
 * Dois nomes, UMA função. `formatPercentPoints` é o nome antigo de `formatPercentFromScale100` (o
 * corpo dos dois em `format.ts` é `formatPercent(x / 100, digits)`), e a seção 8 do contrato mantém
 * os dois importáveis: o acervo chama o antigo e a versão nova chama o novo.
 *
 * A comparação é pelo nome CANÔNICO, e a mensagem cita a chamada como foi escrita. Sem isto, a peça
 * que tivesse um nome na frase e o outro no corpo seria acusada de "formatador diferente" com o
 * MESMO texto dos dois lados, que é acusar a escrita correta. Medido em 2026-10-02: nenhuma peça do
 * acervo usa o nome novo, então a tabela não cala nem acende nada hoje; ela existe para a guarda
 * não nascer errada na primeira peça em migração.
 */
const NOME_CANONICO = new Map([['formatPercentPoints', 'formatPercentFromScale100']]);
const canonico = (nome) => NOME_CANONICO.get(nome) ?? nome;

function textoDe(node, sourceFile) {
  try {
    return node.getText(sourceFile).replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

/** A chamada é a um formatador de grandeza do Farol? Devolve o nome, ou `null`. */
function nomeDoFormatador(node) {
  if (!ts.isCallExpression(node)) return null;
  const alvo = node.expression;
  const nome = ts.isIdentifier(alvo) ? alvo.text : ts.isPropertyAccessExpression(alvo) ? alvo.name.text : '';
  return FORMATADORES_DE_GRANDEZA.has(nome) ? nome : null;
}

/**
 * Guarda UMA chamada de formatador em `porArgumento`. A chave é a chamada com o nome canônico, que é
 * o que se compara; `escrita` é a chamada como está no arquivo, que é o que a mensagem cita.
 */
function registrar(porArgumento, node, nome, sourceFile) {
  if (node.arguments.length < 1) return;
  const argumento = textoDe(node.arguments[0], sourceFile);
  if (!argumento) return;
  const argumentos = node.arguments.map((a) => textoDe(a, sourceFile)).join(', ');
  const chamada = `${canonico(nome)}(${argumentos})`;
  const lista = porArgumento.get(argumento) ?? new Map();
  if (!lista.has(chamada)) {
    lista.set(chamada, { nome, escrita: `${nome}(${argumentos})`, linha: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1 });
  }
  porArgumento.set(argumento, lista);
}

/** Toda chamada de formatador dentro de um nó, pelo argumento e pela chamada inteira. */
function formatadoresEm(raiz, sourceFile) {
  const porArgumento = new Map();
  const visita = (node) => {
    const nome = nomeDoFormatador(node);
    if (nome) registrar(porArgumento, node, nome, sourceFile);
    ts.forEachChild(node, visita);
  };
  visita(raiz);
  return porArgumento;
}

/**
 * As duas regiões do arquivo: `frase`, tudo o que só o leitor de tela recebe, e `corpo`, o resto.
 * Devolve `{ frase: [nós], corpo: [nós], temFrase }`.
 */
function regioes(sourceFile) {
  const frase = [];
  const declaradas = new Map();
  let temFrase = false;
  const visita = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) declaradas.set(node.name.text, node.initializer);
    ts.forEachChild(node, visita);
  };
  visita(sourceFile);
  const acharAtributos = (node) => {
    if (ts.isJsxAttribute(node) && SO_PARA_O_LEITOR.has(node.name.getText()) && node.initializer) {
      temFrase = true;
      const valor = ts.isJsxExpression(node.initializer) ? node.initializer.expression : node.initializer;
      if (valor) {
        frase.push(valor);
        // UM salto: `aria-label={summary}` é a escrita do catálogo inteiro.
        if (ts.isIdentifier(valor) && declaradas.has(valor.text)) frase.push(declaradas.get(valor.text));
      }
    }
    ts.forEachChild(node, acharAtributos);
  };
  acharAtributos(sourceFile);
  const dentroDaFrase = new Set();
  for (const no of frase) {
    const marca = (n) => {
      dentroDaFrase.add(n);
      ts.forEachChild(n, marca);
    };
    marca(no);
  }
  return { frase, dentroDaFrase, temFrase };
}

/**
 * Acha as divergências de formato entre a frase acessível e o corpo visível.
 * Devolve `{ achados, medida, motivo }`; `medida` é falso quando não há frase ou não há formatador
 * dos dois lados, e nesse caso o motivo diz qual dos dois faltou.
 */
export function acharFormatoAcessivel(sourceFile) {
  const rel = path.basename(sourceFile.fileName);
  const { frase, dentroDaFrase, temFrase } = regioes(sourceFile);
  if (!temFrase) return { achados: [], medida: false, motivo: 'sem_frase_acessivel' };

  const naFrase = new Map();
  for (const no of frase) {
    for (const [argumento, chamadas] of formatadoresEm(no, sourceFile)) {
      const alvo = naFrase.get(argumento) ?? new Map();
      for (const [chamada, info] of chamadas) alvo.set(chamada, info);
      naFrase.set(argumento, alvo);
    }
  }
  if (!naFrase.size) return { achados: [], medida: false, motivo: 'frase_sem_formatador' };

  // O corpo é todo formatador que NÃO está dentro da região da frase.
  const noCorpo = new Map();
  const visita = (node) => {
    if (dentroDaFrase.has(node)) return;
    const nome = nomeDoFormatador(node);
    if (nome) registrar(noCorpo, node, nome, sourceFile);
    ts.forEachChild(node, visita);
  };
  visita(sourceFile);
  if (!noCorpo.size) return { achados: [], medida: false, motivo: 'corpo_sem_formatador' };

  const achados = [];
  for (const [argumento, chamadasFrase] of naFrase) {
    const chamadasCorpo = noCorpo.get(argumento);
    if (!chamadasCorpo) continue;
    const soNaFrase = [...chamadasFrase.keys()].filter((c) => !chamadasCorpo.has(c));
    const soNoCorpo = [...chamadasCorpo.keys()].filter((c) => !chamadasFrase.has(c));
    if (!soNaFrase.length || !soNoCorpo.length) continue;
    const linha = chamadasFrase.get(soNaFrase[0]).linha;
    const mesmoFormatador = new Set([...soNaFrase, ...soNoCorpo].map((c) => c.slice(0, c.indexOf('(')))).size === 1;
    const escritaNaFrase = soNaFrase.map((c) => chamadasFrase.get(c).escrita);
    const escritaNoCorpo = soNoCorpo.map((c) => chamadasCorpo.get(c).escrita);
    achados.push({
      linha,
      code: 'FORMATO-ACESSIVEL',
      texto:
        `${rel}:${linha} FORMATO-ACESSIVEL: a medida "${argumento.slice(0, 34)}" sai com ${escritaNaFrase.join(' e ')} na frase acessível e com ` +
        `${escritaNoCorpo.join(' e ')} no que se vê. ` +
        (mesmoFormatador
          ? 'Mesmo formatador com casas diferentes é a distância entre "12%" e "12,4%": quem ouve e quem enxerga recebem números diferentes da mesma medida. '
          : 'Formatador diferente para o mesmo dado dá duas aparências ao mesmo número, uma para quem ouve e outra para quem enxerga. ') +
        'Escolha um formato por medida e use o MESMO nos dois lados, ou escreva o número uma vez em constante e passe-a para os dois. ' +
        'Ver ARMADILHAS.md, DAD-9, e CONTRATO.md, ACE-1.',
    });
  }
  return { achados, medida: true, motivo: null };
}
