/**
 * As quatro guardas de CONTEÚDO do `npm run check`, propostas pela emenda E1 de
 * `_estudo/00_observacoes-acumuladas.md`. As regras já estavam escritas no CONTRATO.md e nada as
 * media: versões reprovadas pela revisão humana saíam do check com `0 com erro`.
 *
 * | Código           | Regra do contrato          | Onde olha                         |
 * |------------------|----------------------------|-----------------------------------|
 * | MARCA-REAL       | seção 3                    | data.ts, meta.json, Chart.tsx     |
 * | NUMERO-CRU       | seção 8 e TIP-1 (17.1)     | Chart.tsx, só o JSX               |
 * | AUSENCIA-LITERAL | EST-2 (17.8)               | Chart.tsx, data.ts                |
 * | FRASE-ACESSIVEL  | ACE-1 (17.10)              | preview.svg (frase já calculada)  |
 * | ESPESSURA-MARCA  | ESP-2 (17.7), ROT-7        | preview.svg (geometria desenhada) |
 * | COLISAO-TEXTO    | ROT-2 e 17.7 (respiro)     | preview.svg (tinta de cada texto) |
 * | TAMANHO-TEXTO    | TIP-2 (17.1)               | preview.svg (declarado x escala)  |
 * | CONTRASTE-TEXTO  | ACE-3 (17.10), ROT-6, ROT-7| preview.svg, os dois temas        |
 * | AGREGACAO-ZERO   | EST-1b (17.8), DAD-6       | Chart.tsx e data.ts, pela árvore  |
 * | CONTRASTE-MARCA  | TOK-1, TOK-7               | preview.svg, os dois temas        |
 * | REGUA-CONSTANTE  | ROT-5b (17.9)              | Chart.tsx, só a legenda de tamanho|
 * | FORMATO-ACESSIVEL| ACE-1 (17.10), DAD-9       | Chart.tsx, frase contra corpo     |
 * | EIXO-CALMO       | EIX-5 (17.9), EIX-3b       | Chart.tsx, eixo contra AXIS_PROPS |
 * | OPACIDADE-MARCA  | ACE-5 (17.10), 17.2        | Chart.tsx, alfa contra piso de 3:1|
 * | TEXTO-NA-MARCA   | ROT-6, ROT-7b, ACE-3       | preview.svg, os dois temas        |
 * | RAIO-CONTRA-AREA | GEO-3                      | preview.svg contra data.ts        |
 *
 * AS SEIS ÚLTIMAS NASCERAM COM FILA DE DÍVIDA, em 2026-09-28. Guarda que entra num acervo de 347
 * versões encontra no primeiro dia tudo o que se acumulou enquanto ela não existia, e ligá-la como
 * erro reprovaria dezenas de peças de uma vez, com um só desfecho possível: alguém desliga a guarda.
 * O mecanismo está em `divida.mjs`: o que o acervo já carregava está registrado em
 * `divida-guardas.json` e sai como AVISO, peça nova sai como ERRO, dívida que cresce volta a erro, e
 * dívida quitada pede a remoção da própria linha. A fila só encurta. A RAIO-CONTRA-AREA, de 2026-10-02,
 * nasceu do mesmo jeito, com uma peça registrada.
 *
 * ESCAPE. Caso legítimo raro sai com um comentário na própria linha ou na linha imediatamente
 * acima, nas duas formas de comentário, porque dentro do JSX só a segunda funciona:
 *
 *     // check-ok: NUMERO-CRU o "3" é o número do trimestre, não uma medida
 *     {/* check-ok: NUMERO-CRU o "3" é o número do trimestre, não uma medida *\/}
 *
 * O escape vale só para o código citado e só para aquela linha. FRASE-ACESSIVEL não tem linha de
 * código (a frase nasce do dado em tempo de render), então o escape dela vale para o arquivo
 * inteiro, em qualquer linha do Chart.tsx; o mesmo vale para ESPESSURA-MARCA, COLISAO-TEXTO,
 * TAMANHO-TEXTO, CONTRASTE-TEXTO e RAIO-CONTRA-AREA, que medem o desenho e também não têm linha de código a apontar. MARCA-REAL dentro do `meta.json` não tem escape: JSON
 * não aceita comentário e a chave desconhecida é recusada pela seção 4; troque o texto.
 *
 * Todo escape usado é contado e aparece no relatório do check, para que a saída silenciosa de uma
 * guarda seja sempre visível.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { acharAgregacaoZero } from './agregacao.mjs';
import { lerMarcasDeArea, lerVetoresDoDado, medirAreaContraValor } from './area.mjs';
import { PIXEL_DISPOSITIVO, lerLinhasDeTexto } from './colisao.mjs';
import { formaConteCaixa } from './contencao.mjs';
import { HALO_MINIMO, corEmTexto, fundosDaCaixa, lerCor, lerFundos, razaoDeContraste } from './contraste.mjs';
import { repartirPelaFila } from './divida.mjs';
import { acharEixoCalmo } from './eixo.mjs';
import { lerGeometria } from './espessura.mjs';
import { acharFormatoAcessivel } from './formato.mjs';
import { lerMarcas, lerTokensDoFarol, medirMarca, nomeDoToken } from './marca.mjs';
import { CORES_DE_MARCA, acharOpacidadeMarca, medirTextoSobreMarca } from './opacidade.mjs';
import { acharReguaConstante } from './regua.mjs';
import { MARCAS_COM_PADRAO, MARCAS_SIMPLES } from './marcas-bloqueadas.mjs';
import { lerTextosHtml } from './tamanho.mjs';

const require = createRequire(import.meta.url);
const ts = require('typescript');

/** Códigos aceitos no comentário de escape. */
export const CODIGOS = [
  'MARCA-REAL',
  'NUMERO-CRU',
  'AUSENCIA-LITERAL',
  'FRASE-ACESSIVEL',
  'ESPESSURA-MARCA',
  'COLISAO-TEXTO',
  'TAMANHO-TEXTO',
  'CONTRASTE-TEXTO',
  'AGREGACAO-ZERO',
  'CONTRASTE-MARCA',
  'REGUA-CONSTANTE',
  'FORMATO-ACESSIVEL',
  'EIXO-CALMO',
  'OPACIDADE-MARCA',
  'TEXTO-NA-MARCA',
  'RAIO-CONTRA-AREA',
];

/** `// check-ok: CODIGO motivo` ou `{/* check-ok: CODIGO motivo *\/}` (o que vale dentro do JSX). */
const ESCAPE_RE = /(?:\/\/|\/\*)\s*check-ok:\s*([A-Z][A-Z-]+)\s*([^*\n]*)/;

function semAcento(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Lê os escapes do arquivo: devolve `porLinha` (linha 1-based onde o comentário está) e a lista
 * crua, para o relatório. Um escape na linha N cobre a linha N e a linha N+1.
 */
export function lerEscapes(text, rel) {
  const porLinha = new Map();
  const lista = [];
  text.split(/\r?\n/).forEach((line, index) => {
    const match = ESCAPE_RE.exec(line);
    if (!match) return;
    const code = match[1];
    if (!CODIGOS.includes(code)) return;
    const numero = index + 1;
    const motivo = match[2].trim();
    for (const alvo of [numero, numero + 1]) {
      const set = porLinha.get(alvo) ?? new Set();
      set.add(code);
      porLinha.set(alvo, set);
    }
    lista.push(`${rel}:${numero} ${code}${motivo ? ` (${motivo})` : ''}`);
  });
  return { porLinha, lista, codigos: new Set(lista.map((item) => item.split(' ')[1])) };
}

/** Fecha as mensagens de uma guarda contra os escapes e devolve o que sobrou mais o que foi usado. */
function aplicarEscapes(problemas, escapes) {
  const errors = [];
  const usados = [];
  for (const { linha, code, texto } of problemas) {
    if (escapes.porLinha.get(linha)?.has(code)) usados.push(`:${linha} ${code} silenciado por comentário check-ok`);
    else errors.push(texto);
  }
  return { errors, usados };
}

// ---------------------------------------------------------------------------------------------
// MARCA-REAL
// ---------------------------------------------------------------------------------------------

const PADROES_MARCA = [
  ...MARCAS_SIMPLES.map((nome) => ({ nome, padrao: new RegExp(`\\b${semAcento(nome).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}\\b`, 'iu') })),
  ...MARCAS_COM_PADRAO,
];

/** Primeira marca da lista de bloqueio que aparece no texto, ou null. */
export function marcaEm(texto) {
  const alvo = semAcento(texto);
  for (const { nome, padrao } of PADROES_MARCA) {
    if (padrao.test(alvo)) return nome;
  }
  return null;
}

/**
 * MARCA-REAL no `meta.json`. Lê linha a linha, porque o arquivo é curto e assim a mensagem aponta
 * a linha. Sem escape: JSON não aceita comentário (ver cabeçalho).
 */
export function guardaMarcaMeta(versionAbs) {
  const file = path.join(versionAbs, 'meta.json');
  if (!fs.existsSync(file)) return { errors: [], escapes: [] };
  const errors = [];
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, index) => {
    const marca = marcaEm(line);
    if (marca) {
      errors.push(
        `meta.json:${index + 1} MARCA-REAL: marca real "${marca}" no texto do meta.json. ` +
          'Troque por nome genérico (ver CONTRATO.md, seção 3, e a lista em _render/scripts/lib/marcas-bloqueadas.mjs).',
      );
    }
  });
  return { errors, escapes: [] };
}

// ---------------------------------------------------------------------------------------------
// NUMERO-CRU
// ---------------------------------------------------------------------------------------------
//
// O QUE A GUARDA COBRE (só dentro do Chart.tsx, e só no que vira texto na tela):
//   N1. Texto JSX com algarismo solto: `<p>12 meses</p>`, `<text>0 de</text>`, "100% do teto".
//       Algarismo solto é o que não está colado a letra: "p90", "v2" e "h3" não contam.
//   N2. Expressão em posição de filho de JSX que devolve número sem formatador:
//       `{itens.length}`, `{index + 1}`, `{42}`, `{x.toFixed(1)}`, `{n.toLocaleString()}`,
//       `{Math.round(x)}`, `{Number(x)}`, `{String(x + 1)}`, `{new Intl.NumberFormat(...)...}`.
//   N3. Template em posição de filho de JSX com algarismo solto ou com interpolação do tipo N2.
//
// O QUE A GUARDA NÃO COBRE, DE PROPÓSITO (conservadora: deixa passar a dúvida):
//   - Qualquer número em ATRIBUTO: `key={i}`, `x={40}`, `viewBox="0 0 100 20"`, `r={4}`,
//     `strokeWidth={2.25}`, `width={12}`, `barCategoryGap="30%"`, `className="mt-2 text-xs"`,
//     `style={{ left: '50%' }}`. Coordenada, tamanho, chave e valor de CSS não são número de tela.
//   - Identificador solto (`{total}`) e acesso a propriedade (`{row.value}`): sem os tipos do
//     TypeScript não dá para saber se é número ou texto já formatado, então passa.
//   - Chamada de função qualquer (`{signedPercent(x)}`, `{describe(data)}`): helper local costuma
//     embrulhar um formatador de `@/lib/format`; só as chamadas da lista N2 são recusadas.
//   - Número literal dentro de um elemento que já carrega algarismo tabular (`kpi-number`,
//     `font-display`, `tabular-nums`): é o caso da EST-3, "zero medido é zero", que escreve `0` na
//     marca de propósito. A exceção vale só para N1 e N3; N2 é sempre recusado, porque a seção 8
//     manda TODO número de tela passar por um formatador.
//   - Ano de quatro dígitos sozinho ("meta 2027", "safra 2025"): nomeia o alvo, não mede. Uma data
//     escrita à mão continua acusada, porque "2026-08" também traz o "08", que não é ano.
//   - Ordinal colado ("2º"), porque o indicador ordinal conta como letra na fronteira de palavra.
//   - `String(x)` cujo argumento não é número cru: em tique do Recharts, `String(payload?.value)`
//     só afirma ao TypeScript que a categoria é texto.
//   - `data.ts` inteiro: lá número é dado, não tela.

/** Classes que já ligam algarismo tabular (TIP-1). */
const TABULAR_RE = /\b(?:kpi-number|font-display|tabular-nums)\b/;

/** Número que não está colado a letra: "12 meses" sim, "p90", "v2" e "2º" não. */
const NUMERO_SOLTO = /(?<![\p{L}\d])\d+(?:[.,]\d+)*(?![\p{L}])/gu;
/** Ano de quatro dígitos: "meta 2027" nomeia o alvo, não mede nada. */
const ANO = /^(?:19|20)\d{2}$/;

/** O primeiro número solto do texto que não seja um ano, ou null. */
function numeroSoltoEm(texto) {
  for (const match of texto.matchAll(NUMERO_SOLTO)) {
    if (!ANO.test(match[0])) return match[0];
  }
  return null;
}

/** Chamadas que produzem número sem passar pelos formatadores permitidos (seção 8). */
const CHAMADA_CRUA = /^(?:.*\.(?:toFixed|toLocaleString|toPrecision)|Number|Math\.(?:round|floor|ceil|trunc|abs|max|min)|Intl\..*|new\s+Intl\..*)$/;

function ehFilhoDeJsx(node) {
  return Boolean(node.parent) && (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent));
}

/** Algum elemento JSX acima deste nó declara algarismo tabular? */
function temTabularAcima(node, sourceFile) {
  for (let cursor = node.parent; cursor; cursor = cursor.parent) {
    const abertura = ts.isJsxElement(cursor) ? cursor.openingElement : ts.isJsxSelfClosingElement(cursor) ? cursor : null;
    if (!abertura) continue;
    for (const attr of abertura.attributes.properties) {
      if (!ts.isJsxAttribute(attr) || attr.name.getText(sourceFile) !== 'className') continue;
      if (attr.initializer && TABULAR_RE.test(attr.initializer.getText(sourceFile))) return true;
    }
  }
  return false;
}

/** A expressão devolve número sem formatador? Devolve o motivo ou null. */
function expressaoCrua(node, sourceFile) {
  if (ts.isNumericLiteral(node)) return `o literal ${node.getText(sourceFile)}`;
  if (ts.isPropertyAccessExpression(node) && node.name.text === 'length') return `${node.getText(sourceFile)} (use formatInt)`;
  if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
    const chamada = node.expression.getText(sourceFile).replace(/\s+/g, ' ');
    if (CHAMADA_CRUA.test(chamada)) return `${chamada}(...)`;
    // `String(x)` é ambíguo: em tique do Recharts ele só afirma para o TypeScript que a categoria
    // é texto (`String(payload?.value ?? '')`). Só acusa quando o argumento já é número cru.
    if (chamada === 'String' && node.arguments?.[0]) {
      const dentro = expressaoCrua(node.arguments[0], sourceFile);
      return dentro ? `String(${dentro})` : null;
    }
    return null;
  }
  if (ts.isBinaryExpression(node)) {
    // Só conta a aritmética: `??`, `||` e `&&` escolhem entre valores e não fabricam número.
    const aritmetica = [ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken, ts.SyntaxKind.AsteriskToken, ts.SyntaxKind.SlashToken, ts.SyntaxKind.PercentToken];
    if (!aritmetica.includes(node.operatorToken.kind)) return null;
    for (const lado of [node.left, node.right]) {
      const motivo = expressaoCrua(lado, sourceFile);
      if (motivo) return `${node.getText(sourceFile).replace(/\s+/g, ' ')} (${motivo})`;
    }
    return null;
  }
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isNonNullExpression(node)) return expressaoCrua(node.expression, sourceFile);
  return null;
}

// ---------------------------------------------------------------------------------------------
// AUSENCIA-LITERAL
// ---------------------------------------------------------------------------------------------
//
// EST-2 manda escrever a ausência com `formatUnavailable()`, nunca com a palavra digitada à mão,
// porque é a chamada que garante o mesmo texto em todo o Farol. A guarda recusa o literal
// "indisponível" (com ou sem acento, maiúscula ou não) em texto do Chart.tsx e do data.ts.
//
// NÃO cobre: comentário (pode citar a palavra para explicar a regra), o plural "indisponíveis"
// (que aparece em prosa, como "ritmo e projeção indisponíveis sem o realizado", e não é o rótulo
// no lugar do número) e o `meta.json` (título e caso de uso descrevem a versão, não desenham o
// número; há versão chamada "zero, indisponível e sem base").

const AUSENCIA_RE = /\bindisponivel\b/i;

// ---------------------------------------------------------------------------------------------
// Passagem única pelo Chart.tsx / data.ts: MARCA-REAL, NUMERO-CRU e AUSENCIA-LITERAL
// ---------------------------------------------------------------------------------------------

function textosDoNo(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return [node.text];
  if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) return [node.text];
  if (ts.isJsxText(node)) return [node.text];
  return [];
}

/**
 * Roda as três guardas estáticas sobre um arquivo já lido pelo TypeScript.
 * `kind` é 'chart' ou 'data'; NUMERO-CRU só vale para 'chart'.
 */
export function guardasDeCodigo(sourceFile, kind, escapes) {
  const rel = path.basename(sourceFile.fileName);
  const problemas = [];
  const linha = (node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const push = (node, code, mensagem) => problemas.push({ linha: linha(node), code, texto: `${rel}:${linha(node)} ${code}: ${mensagem}` });

  const visit = (node) => {
    for (const texto of textosDoNo(node)) {
      const marca = marcaEm(texto);
      if (marca) {
        push(node, 'MARCA-REAL', `marca real "${marca}" em "${texto.trim().slice(0, 60)}". Use nome genérico ("Rede social paga", "Busca paga"); ver CONTRATO.md, seção 3, e a lista em _render/scripts/lib/marcas-bloqueadas.mjs.`);
      }
      if (AUSENCIA_RE.test(semAcento(texto))) {
        push(node, 'AUSENCIA-LITERAL', `a palavra "indisponível" escrita à mão em "${texto.trim().slice(0, 60)}". Chame formatUnavailable() com o ícone Unplug (CONTRATO.md, EST-2).`);
      }
    }

    if (kind === 'chart' && ehFilhoDeJsx(node)) {
      if (ts.isJsxText(node) && numeroSoltoEm(node.text) && !temTabularAcima(node, sourceFile)) {
        push(node, 'NUMERO-CRU', `número escrito no texto do JSX ("${node.text.trim().slice(0, 50)}") fora de algarismo tabular. Traga o número do dado por um formatador de @/lib/format e ponha o texto em kpi-number, font-display ou tabular-nums (CONTRATO.md, seção 8 e TIP-1).`);
      }
      if (ts.isJsxExpression(node) && node.expression) {
        const alvo = node.expression;
        const motivo = expressaoCrua(alvo, sourceFile);
        if (motivo) {
          push(node, 'NUMERO-CRU', `número sem formatador no JSX: ${motivo}. Todo número de tela passa por @/lib/format (CONTRATO.md, seção 8).`);
        } else if (ts.isTemplateExpression(alvo) || ts.isNoSubstitutionTemplateLiteral(alvo)) {
          const pedacos = ts.isTemplateExpression(alvo) ? [alvo.head.text, ...alvo.templateSpans.map((span) => span.literal.text)] : [alvo.text];
          const interpolado = ts.isTemplateExpression(alvo) ? alvo.templateSpans.map((span) => expressaoCrua(span.expression, sourceFile)).find(Boolean) : null;
          if (interpolado) push(node, 'NUMERO-CRU', `número sem formatador interpolado no texto: ${interpolado}. Ver CONTRATO.md, seção 8.`);
          else if (pedacos.some((texto) => numeroSoltoEm(texto)) && !temTabularAcima(node, sourceFile)) {
            push(node, 'NUMERO-CRU', `número escrito dentro do texto interpolado ("${pedacos.join('…').trim().slice(0, 50)}") fora de algarismo tabular. Ver CONTRATO.md, seção 8 e TIP-1.`);
          }
        } else if (ts.isStringLiteral(alvo) && numeroSoltoEm(alvo.text) && !temTabularAcima(node, sourceFile)) {
          push(node, 'NUMERO-CRU', `número escrito no texto ("${alvo.text.trim().slice(0, 50)}") fora de algarismo tabular. Ver CONTRATO.md, seção 8 e TIP-1.`);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return aplicarEscapes(problemas, escapes);
}

// ---------------------------------------------------------------------------------------------
// FRASE-ACESSIVEL
// ---------------------------------------------------------------------------------------------
//
// ACE-1: "Frase acessível de 100 a 250 caracteres na raiz". A frase é CALCULADA do dado, então não
// dá para medi-la no código: `aria-label={describe(data)}` só vira texto quando o componente roda.
// A guarda mede onde a frase já existe pronta, o `preview.svg`, que o render grava com o dado
// padrão. O check já recusa preview ausente ou desatualizado, então o que for medido aqui é a
// frase que o Farol vai anunciar.
//
// Qual dos `aria-label` do SVG é a raiz do Chart: o do elemento do corpo (fora a tag `<svg>`, que
// é a moldura da ferramenta com o título e o caso de uso do meta.json) que carrega um dos `role`
// da seção 11, na ordem do documento. Só esses quatro, e nessa ordem, para não medir peça interna
// (um `role="radiogroup"` de um seletor, por exemplo, que não é a frase da raiz).
//
// O CARIMBO resolve o ponto cego do serializador, que só preserva `role` e `aria-label` do que sai
// como HTML dentro de `foreignObject`: a raiz de um gráfico Recharts vira desenho e perdia os dois,
// o que deixava a guarda cega em 44 das 64 versões das famílias 01 e 02. O render agora lê a frase
// no DOM vivo e a grava no nó raiz do SVG, em `data-farol-ace` (com o papel em
// `data-farol-ace-role`): atributo de dado, invisível, que viaja junto quando a pessoa copia só o
// SVG. A guarda lê o carimbo primeiro e só cai na varredura do corpo quando ele não existe.
//
// NÃO COBRE: preview antigo, gravado antes do carimbo, não vira erro; conta como NÃO MEDIDA, do
// mesmo jeito que a raiz sem `role` da seção 11 com `aria-label` (o render avisa nesse caso). Fica
// de fora a raiz que usa `aria-labelledby`, a versão sem preview (já é erro próprio) e o
// crescimento da frase com outro recorte de dado: o aviso a partir de 235 existe justamente porque
// a frase é calculada e muda de tamanho com o dado.

const ACE_MIN = 100;
const ACE_MAX = 250;
const ACE_AVISO = 235;
/** Papéis que a seção 11 admite na raiz do visual. */
const ACE_ROLES = new Set(['img', 'figure', 'group', 'table']);

function decodificarXml(texto) {
  return texto
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Lê o carimbo da frase no nó raiz do SVG; `null` quando o preview é anterior ao carimbo. */
function lerCarimboAce(svg) {
  const raiz = svg.slice(0, svg.indexOf('>') + 1);
  const label = /\sdata-farol-ace="([^"]*)"/.exec(raiz);
  if (!label) return null;
  const role = /\sdata-farol-ace-role="([^"]*)"/.exec(raiz)?.[1] ?? '';
  return { role, frase: decodificarXml(label[1]) };
}

/**
 * Mede a frase acessível da raiz do Chart no preview.svg.
 *
 * Devolve também `medicao`, que diz se a versão foi medida e, quando não foi, por quê: quem conta
 * as versões (o check) separa o que a guarda não alcança do que ela aprovou.
 */
export function guardaFraseAcessivel(versionAbs, escapes) {
  const errors = [];
  const warnings = [];
  const usados = [];
  const naoMedida = (motivo) => ({ errors, warnings, usados, medicao: { medida: false, motivo, fonte: null, n: null } });
  const file = path.join(versionAbs, 'preview.svg');
  if (!fs.existsSync(file)) return naoMedida('sem_preview');
  const svg = fs.readFileSync(file, 'utf8');
  const carimbo = lerCarimboAce(svg);
  let frase = carimbo?.frase || null;
  let fonte = frase ? 'carimbo' : null;
  if (!carimbo) {
    const corpo = svg.slice(svg.indexOf('>') + 1); // fora a tag <svg>, que é a moldura da ferramenta
    for (const tag of corpo.matchAll(/<[a-zA-Z:]+\s([^>]*)>/g)) {
      const role = /\brole="([^"]*)"/.exec(tag[1])?.[1];
      const label = /\baria-label="([^"]*)"/.exec(tag[1])?.[1];
      if (role && label && ACE_ROLES.has(role)) {
        frase = decodificarXml(label);
        fonte = 'corpo';
        break;
      }
    }
  }
  if (frase === null) return naoMedida(carimbo ? 'raiz_sem_frase' : 'preview_sem_carimbo');
  const medicao = { medida: true, motivo: null, fonte, n: frase.length };
  const feito = () => ({ errors, warnings, usados, medicao });
  const n = frase.length;
  if (n >= ACE_MIN && n < ACE_AVISO) return feito();
  const trecho = `"${frase.slice(0, 60)}…"`;
  if (n > ACE_MAX || n < ACE_MIN) {
    if (escapes.codigos.has('FRASE-ACESSIVEL')) {
      usados.push(`FRASE-ACESSIVEL silenciado por comentário check-ok (${n} caracteres)`);
      return feito();
    }
    const como = n > ACE_MAX
      ? `corte para no máximo ${ACE_MAX}: diga o tipo, o total, o maior e o destacado, e deixe o resto para o visual`
      : `chegue a pelo menos ${ACE_MIN}: comece pelo tipo de gráfico e diga a conclusão, não só o título`;
    errors.push(`Chart.tsx FRASE-ACESSIVEL: a frase da raiz tem ${n} caracteres, fora da faixa de ${ACE_MIN} a ${ACE_MAX} da ACE-1; ${como}. Medida em preview.svg: ${trecho}`);  } else {
    warnings.push(`Chart.tsx FRASE-ACESSIVEL: a frase da raiz tem ${n} caracteres, a ${ACE_MAX - n} do teto de ${ACE_MAX} da ACE-1; a frase é calculada do dado e cresce com o recorte. Medida em preview.svg: ${trecho}`);
  }
  return feito();
}

// ---------------------------------------------------------------------------------------------
// ESPESSURA-MARCA
// ---------------------------------------------------------------------------------------------
//
// ESP-2 (emenda de 2026-09-17) põe piso na espessura EFETIVA da marca, a que se mede no desenho e
// não a que `maxBarSize` declara: 12 px em cartão, e nunca abaixo do tamanho do texto mais 6 px
// quando o rótulo é desenhado DENTRO da marca (18 px para o texto de 12 px, porque a tinta mede
// 11,75 px e não fica centrada na âncora; o mesmo degrau que a ROT-7 encontrou para o halo).
//
// ONDE OLHA, E POR QUÊ NÃO NO CÓDIGO: `lerGeometria` explica no cabeçalho de `espessura.mjs`. Em
// resumo, "dentro" depende do sinal da largura em tempo de execução, então só o desenho responde.
//
// OS DOIS PISOS TÊM ALCANCE DIFERENTE, de propósito:
//   - O piso do RÓTULO INTERNO é geometria pura (tinta de texto sobre marca) e vale para qualquer
//     marca desenhada em SVG, inclusive a de `02/08`, que o autor desenha à mão.
//   - O piso GERAL de 12 px é o outro lado do `maxBarSize` e do passo da ESP-6, que só existem no
//     `<Bar>` do Recharts. Fora dele (régua de meta, fita de KPI, barra desenhada à mão) a guarda
//     não aplica o piso geral: ali a espessura é escolha de outro item do contrato, não da ESP-2.
//
// PESOS DIFERENTES, também de propósito: o piso do rótulo interno REPROVA, porque tem medição por
// trás (a tinta do texto invade a borda da marca, e isso se vê). O piso geral só AVISA, porque o
// número 12 nunca foi medido: a medição de 2026-09-17 registrou marca de 10 e de 12 px desenhando
// sem defeito com o rótulo fora, e o minigráfico dentro de um cartão é fino por desenho, não por
// desleixo. Regra sem medição não reprova trabalho correto; vira aviso até a ESP-2 ganhar o número.
//
// NÃO MEDIDA, sempre com motivo, nunca calada: `sem_preview`, `preview_com_transform` (o leitor não
// compõe matriz), `marca_html` (a barra de `01_cards-e-kpis` e de `02/04 v3` é um `<div>` dentro de
// `foreignObject`, invisível ao parser de SVG), `sem_marca_de_barra` e `marca_fora_do_bar` (marca
// desenhada à mão, sem `<Bar>` a quem aplicar o piso geral e sem rótulo por dentro a medir).
//
// ESCAPE: como a FRASE-ACESSIVEL, a medida não tem linha de código, então `// check-ok:
// ESPESSURA-MARCA motivo` em qualquer linha do Chart.tsx vale para o arquivo inteiro.

const ESP_PISO_GERAL = 12;
/** Folga medida entre a tinta do rótulo e a borda da marca (ESP-2): 12 px de texto pedem 18 px. */
const ESP_FOLGA_DO_ROTULO = 6;
/** Tinta de `R$ 401,3 mil` em 12 px mede 69,00 px (ROT-7): 0,479 em por caractere, arredondado para cima. */
const ESP_LARGURA_POR_EM = 0.52;
/** Metade da tinta dentro da marca já é rótulo interno; abaixo disso o rótulo está na ponta livre. */
const ESP_COBERTURA_MINIMA = 0.5;

/**
 * Qual dimensão é a espessura, por escopo: a que VARIA é o valor, a outra é a espessura. Vale para
 * barra deitada e para coluna em pé sem perguntar a orientação ao código, e não se deixa enganar
 * pelo toco, cuja largura é menor que a própria espessura.
 */
function eixoDaEspessura(marcas) {
  const variacao = (valores) => {
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
    if (!media) return 0;
    return Math.sqrt(valores.reduce((a, b) => a + (b - media) ** 2, 0) / valores.length) / media;
  };
  const porEscopo = new Map();
  for (const marca of marcas) {
    const lista = porEscopo.get(marca.escopo) ?? [];
    lista.push(marca);
    porEscopo.set(marca.escopo, lista);
  }
  const eixo = new Map();
  for (const [escopo, lista] of porEscopo) {
    const cH = variacao(lista.map((m) => m.h));
    const cW = variacao(lista.map((m) => m.w));
    eixo.set(escopo, cW > cH ? 'h' : cH > cW ? 'w' : 'min');
  }
  return (marca) => {
    const qual = eixo.get(marca.escopo);
    return qual === 'h' ? marca.h : qual === 'w' ? marca.w : Math.min(marca.h, marca.w);
  };
}

/** Mede a ESP-2 no preview.svg. Devolve `medicao` no mesmo formato da FRASE-ACESSIVEL. */
export function guardaEspessuraMarca(versionAbs, escapes) {
  const errors = [];
  const warnings = [];
  const usados = [];
  const rotulo = path.basename(path.dirname(versionAbs)) + '/' + path.basename(versionAbs);
  const naoMedida = (motivo) => ({ errors, warnings, usados, medicao: { medida: false, motivo, fonte: null, espessura: null, espessuraRotulo: null } });
  const file = path.join(versionAbs, 'preview.svg');
  if (!fs.existsSync(file)) return naoMedida('sem_preview');
  const { marcas, textos, htmlMark, temTransform } = lerGeometria(fs.readFileSync(file, 'utf8'));
  if (temTransform) return naoMedida('preview_com_transform');
  if (!marcas.length) return naoMedida(htmlMark ? 'marca_html' : 'sem_marca_de_barra');

  const espessuraDe = eixoDaEspessura(marcas);
  const arred = (n) => Number(n.toFixed(2));
  let geral = null;
  for (const marca of marcas.filter((m) => m.serie)) {
    const e = espessuraDe(marca);
    if (geral === null || e < geral) geral = e;
  }
  // O rótulo interno é o texto cuja tinta cai sobre a marca: âncora na altura da marca e ao menos
  // metade da largura estimada por dentro dela. `textAnchor="end"` na ponta livre fica de fora.
  let interno = null;
  for (const texto of textos) {
    const conteudo = texto.texto.replace(/\s+/g, ' ').trim();
    if (!conteudo || texto.x === null || texto.y === null || !Number.isFinite(texto.fonte)) continue;
    const largura = ESP_LARGURA_POR_EM * texto.fonte * conteudo.length;
    const inicio = texto.ancora === 'middle' ? texto.x - largura / 2 : texto.ancora === 'end' ? texto.x - largura : texto.x;
    for (const marca of marcas) {
      if (marca.escopo !== texto.escopo || texto.y < marca.y0 || texto.y > marca.y1) continue;
      const cobre = Math.min(inicio + largura, marca.x1) - Math.max(inicio, marca.x0);
      if (cobre / largura < ESP_COBERTURA_MINIMA) continue;
      const e = espessuraDe(marca);
      const piso = Math.max(ESP_PISO_GERAL, texto.fonte + ESP_FOLGA_DO_ROTULO);
      if (!interno || e - piso < interno.e - interno.piso) interno = { e, piso, conteudo, fonte: texto.fonte };
    }
  }
  const fonte = marcas.some((m) => m.serie) ? 'recharts' : 'svg';
  // Marca desenhada à mão e sem rótulo por dentro não tem piso a aplicar: nada foi medido, e dizer
  // "ok" aqui seria a saída calada que esta guarda existe para evitar.
  if (geral === null && !interno) return naoMedida('marca_fora_do_bar');
  const medicao = { medida: true, motivo: null, fonte, espessura: geral === null ? null : arred(geral), espessuraRotulo: interno ? arred(interno.e) : null };
  if (interno && interno.e < interno.piso) {
    errors.push(
      `preview.svg ESPESSURA-MARCA: em ${rotulo} o rótulo "${interno.conteudo.slice(0, 24)}" de ${arred(interno.fonte)} px é desenhado DENTRO de uma marca de ${arred(interno.e)} px, ` +
        `abaixo do piso de ${arred(interno.piso)} px da ESP-2 (tamanho do texto mais ${ESP_FOLGA_DO_ROTULO} px; 18 px para o texto de 12 px). ` +
        'Engrosse a marca pelo passo da ESP-6 (passo = espessura × séries / (1 − 2 × barCategoryGap)) ou leve o rótulo para fora da ponta livre, com VALUE_LABEL_GAP (ROT-2).',
    );
  }
  // O piso geral é AVISO, não erro, enquanto o número não for medido. Ele nasceu como escolha de
  // desenho, e a medição de 2026-09-17 mostrou que marca de 10 e de 12 px desenha sem defeito quando
  // o rótulo está fora; barra fina é ainda a forma idiomática do minigráfico dentro de um cartão.
  // Bloquear por ele reprovaria versão correta, que é o erro que esta guarda existe para não cometer.
  // Sobe a erro no dia em que a ESP-2 ganhar o número medido (ver CONTRATO.md, seção 18).
  if (geral !== null && geral < ESP_PISO_GERAL) {
    warnings.push(
      `preview.svg ESPESSURA-MARCA: em ${rotulo} a marca mais fina do <Bar> mede ${arred(geral)} px, abaixo do piso geral de ${ESP_PISO_GERAL} px da ESP-2, ` +
        'que é escolha de desenho ainda não medida e por isso não reprova. Se a marca for a barra principal do gráfico, derive o passo pela ESP-6 ' +
        '(passo = espessura desejada × séries + barGap × (séries − 1), dividido por (1 − 2 × barCategoryGap)) e declare-o em constante nomeada; ' +
        'se for minigráfico ou marca de densidade, a espessura fina é a forma certa e este aviso é esperado.',
    );
  }
  if (escapes.codigos.has('ESPESSURA-MARCA')) {
    const silenciadas = errors.length + warnings.length;
    if (silenciadas) usados.push(`ESPESSURA-MARCA silenciado por comentário check-ok (${silenciadas} mensagem(ns))`);
    errors.length = 0;
    warnings.length = 0;
  }
  return { errors, warnings, usados, medicao };
}

// ---------------------------------------------------------------------------------------------
// COLISAO-TEXTO
// ---------------------------------------------------------------------------------------------
//
// POR QUE ELA EXISTE. Na revisao de 2026-09-18 a versao `v2_cpl-qualificado-contra-media` de
// `03_colunas-verticais/05_colunas-positivo-e-negativo` foi reprovada porque o rotulo `+R$ 38` de
// jun/26 encostava no texto da `ReferenceArea` e o par passava a ler `+R$ 383`. Nao e feiura: e
// NUMERO ERRADO NA TELA, dois textos que viram um terceiro numero que ninguem escreveu. Quem pegou
// foi o olho de um revisor, e olho nao escala para 814 versoes.
//
// ONDE OLHA: no `preview.svg`, como a FRASE-ACESSIVEL e a ESPESSURA-MARCA, porque a posicao de um
// rotulo so existe depois que o Recharts desenha. `colisao.mjs` explica no cabecalho como a tinta e
// estimada e com que margem; em resumo, largura por tabela de caractere ajustada contra o motor de
// fonte do navegador (mediana do erro 0,04 px, p99 entre -1,6 e +1,3 px) e altura pela metrica da
// fonte, deliberadamente subestimada.
//
// AS DUAS FAIXAS, E POR QUE OS PESOS SAO DIFERENTES:
//
//   ERRO, tinta que encontra tinta. `classificarPar` explica os dois casos e o porque de serem
//   dois. O que da confianca de REPROVAR aqui nao e a regra escrita, e a medicao do acervo: em
//   2026-09-18, com as 1.347 linhas de texto das 95 versoes aprovadas medidas pelo motor de fonte do
//   navegador, entre `<text>` DIFERENTES nao ha uma sobreposicao sequer, e o par mais proximo na
//   mesma linha esta a 7,03 px; o caso que reprovou a `03/05 v2` mede 0,35 px. O corredor entre o
//   trabalho aprovado e o defeito esta vazio por 6,5 px, bem mais que a margem da estimativa, entao
//   a faixa de erro nao reprova trabalho correto por imprecisao de medida.
//
//   ACHADO QUE MUDOU O DESENHO DESTA GUARDA, e que so apareceu quando o mecanismo entrou: o defeito
//   que a criou NAO E UMA SOBREPOSICAO. As duas tintas da `03/05 v2` nunca se cobrem; elas param a
//   0,35 px uma da outra. Uma guarda que so procurasse area passaria batido pelo unico caso que ja
//   foi reprovado por olho humano. Dai o segundo caso de erro, o texto colado na mesma linha.
//
//   AVISO, proximidade que nao chega a se encontrar, com o afastamento medido impresso na mensagem.
//   O respiro de 4 px tinta contra tinta que o CONTRATO.md registra (17.7) saiu de uma medicao de
//   rotulo empilhado sobre barra, e nao de texto contra texto lado a lado, entao ele ORIENTA e nao
//   reprova. Vira erro no dia em que existir medicao de texto contra texto que o sustente.
//
// ESCOPO: so pares de `<text>` DIFERENTES. `<tspan>` irmaos dentro do mesmo `<text>` sao a mesma
// frase quebrada para trocar de cor ("64 pts" · "71 pts", "n = " "136"), laiada pelo proprio motor
// de texto, e as palavras vizinhas de uma frase se tocam por desenho: os 9 unicos pares de tinta
// sobreposta do acervo sao todos assim. Sem esta regra a guarda acusaria toda frase colorida.
//
// NAO MEDIDA, sempre com motivo, nunca calada: `sem_preview`, `preview_com_transform` (giro, escala
// ou inclinacao que o leitor nao compoe; translacao pura ele resolve), `preview_com_escala`
// (`<svg>` aninhado com escala diferente de 1 em volta de texto), `preview_com_atributo_cego`
// (`textLength`, `lengthAdjust` ou `rotate`, que mudam a largura sem o leitor saber),
// `texto_em_html` (o texto mora em `foreignObject`, como na familia `01_cards-e-kpis`),
// `um_texto_so` (um unico `<text>`, entao nao ha par a comparar) e `sem_texto` (nenhum).
//
// PONTO CEGO DECLARADO: o halo (`stroke` com `paint-order:stroke`) nao entra na caixa. Dois halos
// que se cobrem nao sao acusados.
//
// ESCAPE: como a FRASE-ACESSIVEL e a ESPESSURA-MARCA, a medida nao tem linha de codigo, entao
// `// check-ok: COLISAO-TEXTO motivo` em qualquer linha do Chart.tsx vale para o arquivo inteiro.

/** Respiro abaixo do qual o par vira AVISO, em px (CONTRATO.md, 17.7). */
const COL_RESPIRO = 4;
/** Quantos pares a mensagem lista antes de resumir, para o relatorio nao virar despejo. */
const COL_PARES_NA_MENSAGEM = 3;
/** Fracao da menor altura de tinta que os dois precisam dividir para estarem na MESMA linha. */
const COL_MESMA_LINHA = 0.5;
/**
 * Abaixo deste respiro, em px, a guarda nao sabe distinguir "encosta" de "sobrepoe", e as duas
 * leituras dao o mesmo defeito na tela. Os dois termos sao medidos, nenhum e escolha de desenho:
 *   - PIXEL_DISPOSITIVO (0,50 px) e a resolucao do render em 2x. Branco menor que isso nao existe.
 *   - MARGEM da estimativa (0,50 px) e o p99 do erro da tabela de largura no Space Grotesk, que e a
 *     familia dos numeros; a guarda nao pode decidir mais fino do que ela propria mede.
 * O acervo confirma que a soma nao aperta ninguem: medidos em 2026-09-18 os 2.646 pares de texto na
 * mesma linha das 72 versoes que a guarda alcanca, o par mais proximo do trabalho aprovado esta a
 * 7,03 px, e o caso que reprovou a 03/05 v2 mede 0,46 px estimados (0,35 px reais). O corredor
 * entre um e outro esta vazio por 6,5 px, entao mover este numero dentro dele nao muda veredito de
 * versao nenhuma; ele so fica onde a medicao o justifica.
 */
const COL_RESOLUCAO = PIXEL_DISPOSITIVO + 0.5;

/** Sobreposicao (positiva) ou respiro (negativo) de dois intervalos. */
function cruzamento(a0, a1, b0, b1) {
  return Math.min(a1, b1) - Math.max(a0, b0);
}

/**
 * Classifica um par de linhas de texto: `erro`, `aviso` ou `null`.
 *
 * Os dois casos de ERRO, e por que sao dois. Eles nao sao o mesmo defeito:
 *
 *   1. TINTA SOBRE TINTA de verdade, com area: os dois eixos se cruzam por mais de um pixel de
 *      dispositivo. E o rotulo impresso por cima de outro, ilegivel por definicao.
 *   2. DOIS TEXTOS NA MESMA LINHA que se encostam. Aqui nao e preciso haver area: quando duas
 *      caixas dividem a linha, o olho le uma em seguida da outra, e o que separa uma palavra da
 *      outra e o branco entre elas. Respiro abaixo de `COL_RESOLUCAO` nao existe no desenho, entao
 *      "+R$ 38" seguido de "3 meses" le "+R$ 383". Foi o caso que reprovou a 03/05 v2, e ele mede
 *      0,35 px de respiro real, NAO sobreposicao: medido com o motor de fonte do navegador, as duas
 *      tintas nunca chegam a se cobrir. Uma guarda que exigisse area aqui nao pegaria o defeito que
 *      a criou, e e por isso que a faixa de erro tem estes dois casos e nao um so.
 *
 * Por que a regra 1 pede mais de `COL_RESOLUCAO` nos DOIS eixos, e nao "maior que zero":
 * medido em 2026-09-18 em `02_barras-horizontais/02_barras-agrupadas/v3`, os rotulos "38" e "41" de
 * linhas vizinhas se cruzam 3,11 px na horizontal e ZERO na vertical, isto e, as caixas se tocam
 * pelo canto; o PNG de conferencia mostra os dois numeros soltos, cada um na sua linha, e a versao
 * esta aprovada. Exigir apenas "maior que zero" reprovaria esse desenho correto por um roce de
 * canto. Quem se toca pelo canto continua saindo, como AVISO, com o afastamento impresso.
 */
function classificarPar(a, b) {
  const ox = cruzamento(a.x0, a.x1, b.x0, b.x1);
  const oy = cruzamento(a.y0, a.y1, b.y0, b.y1);
  const alturaMinima = Math.min(a.y1 - a.y0, b.y1 - b.y0);
  const mesmaLinha = oy >= COL_MESMA_LINHA * alturaMinima;
  if (ox > COL_RESOLUCAO && oy > COL_RESOLUCAO) {
    return { tipo: 'erro', motivo: 'sobreposta', ox, oy, respiro: 0 };
  }
  if (mesmaLinha && ox > -COL_RESOLUCAO) {
    return { tipo: 'erro', motivo: 'colada', ox, oy, respiro: Math.max(0, -ox) };
  }
  const respiro = Math.hypot(Math.max(0, -ox), Math.max(0, -oy));
  if (respiro < COL_RESPIRO) return { tipo: 'aviso', motivo: mesmaLinha ? 'perto na linha' : 'perto de canto', ox, oy, respiro };
  return { tipo: null, respiro };
}

/** Mede a colisao de texto no preview.svg. Devolve `medicao` no formato das outras guardas. */
export function guardaColisaoTexto(versionAbs, escapes) {
  const errors = [];
  const warnings = [];
  const usados = [];
  const rotulo = `${path.basename(path.dirname(versionAbs))}/${path.basename(versionAbs)}`;
  const naoMedida = (motivo) => ({ errors, warnings, usados, medicao: { medida: false, motivo, pares: null, respiroMinimo: null } });
  const file = path.join(versionAbs, 'preview.svg');
  if (!fs.existsSync(file)) return naoMedida('sem_preview');
  const bruto = fs.readFileSync(file, 'utf8');
  const { linhas, temTransform, temEscala, temAtributoCego } = lerLinhasDeTexto(bruto);
  if (temTransform) return naoMedida('preview_com_transform');
  if (temEscala) return naoMedida('preview_com_escala');
  if (temAtributoCego) return naoMedida('preview_com_atributo_cego');
  if (new Set(linhas.map((l) => l.pai)).size < 2) {
    if (/<foreignObject/.test(bruto)) return naoMedida('texto_em_html');
    return naoMedida(linhas.length ? 'um_texto_so' : 'sem_texto');
  }

  const arred = (n) => Number(n.toFixed(2));
  const graves = [];
  const proximos = [];
  let pares = 0;
  let respiroMinimo = null;
  for (let i = 0; i < linhas.length; i += 1) {
    for (let j = i + 1; j < linhas.length; j += 1) {
      const a = linhas[i];
      const b = linhas[j];
      if (a.pai === b.pai) continue; // mesma frase: quem separa as palavras e o motor de texto
      pares += 1;
      const veredito = classificarPar(a, b);
      if (respiroMinimo === null || veredito.respiro < respiroMinimo) respiroMinimo = arred(veredito.respiro);
      // A esquerda primeiro: a mensagem le melhor na ordem em que o texto aparece na tela.
      const [p, q] = a.x0 <= b.x0 ? [a, b] : [b, a];
      if (veredito.tipo === 'erro') graves.push({ p, q, ...veredito });
      else if (veredito.tipo === 'aviso') proximos.push({ p, q, ...veredito });
    }
  }
  const medicao = { medida: true, motivo: null, pares, respiroMinimo };
  const corte = (texto) => `"${texto.slice(0, 26)}"`;
  const lista = (itens, descreve) => {
    const cabeca = itens.slice(0, COL_PARES_NA_MENSAGEM).map(descreve).join('; ');
    return itens.length > COL_PARES_NA_MENSAGEM ? `${cabeca}; e mais ${itens.length - COL_PARES_NA_MENSAGEM} par(es)` : cabeca;
  };

  if (graves.length) {
    graves.sort((x, y) => x.respiro - y.respiro || y.ox * y.oy - x.ox * x.oy);
    errors.push(
      `preview.svg COLISAO-TEXTO: em ${rotulo} a tinta de ${graves.length} par(es) de texto se encontra, e texto sobre texto ` +
        'vira número que ninguém escreveu (foi o que reprovou a 03/05 v2: "+R$ 38" encostado em "3 meses" lia "+R$ 383"). ' +
        `${lista(graves, (g) => (g.motivo === 'sobreposta'
          ? `${corte(g.p.texto)} sobre ${corte(g.q.texto)}, sobreposição de ${arred(g.ox)} x ${arred(g.oy)} px`
          : `${corte(g.p.texto)} a ${arred(g.respiro)} px de ${corte(g.q.texto)} na mesma linha, abaixo do pixel do render`))}. ` +
        'Afaste os dois: mova a âncora (textAnchor "end" ou "start" no lugar de "middle"), encurte o rótulo ou tire um dos dois da área disputada.',
    );
  }
  if (proximos.length) {
    proximos.sort((x, y) => x.respiro - y.respiro);
    warnings.push(
      `preview.svg COLISAO-TEXTO: em ${rotulo} ${proximos.length} par(es) de texto ficam a menos de ${COL_RESPIRO} px de tinta a tinta. ` +
        `${lista(proximos, (g) => `${corte(g.p.texto)} a ${arred(g.respiro)} px de ${corte(g.q.texto)} (${g.motivo})`)}. ` +
        'O piso de 4 px do CONTRATO.md (17.7) foi medido em rótulo empilhado sobre barra, não em texto lado a lado, então aqui ele ' +
        'orienta e não reprova; confira no PNG de conferência se os dois ainda se leem soltos.',
    );
  }
  if (escapes.codigos.has('COLISAO-TEXTO')) {
    const silenciadas = errors.length + warnings.length;
    if (silenciadas) usados.push(`COLISAO-TEXTO silenciado por comentário check-ok (${silenciadas} mensagem(ns))`);
    errors.length = 0;
    warnings.length = 0;
  }
  return { errors, warnings, usados, medicao };
}

// ---------------------------------------------------------------------------------------------
// TAMANHO-TEXTO
// ---------------------------------------------------------------------------------------------
//
// POR QUE ELA EXISTE. Na revisão de 2026-09-18 a `v4_ano-com-meses-a-realizar` de
// `07_rosca-e-radial/07_rosa-de-nightingale` foi reprovada porque o rótulo "a realizar" sai em 9 px,
// abaixo do piso de 11 px da TIP-2. O piso está escrito no CONTRATO.md desde 2026-09-14 e nada o
// media: medido no acervo no dia em que esta guarda entrou, 4 das 213 versões escrevem abaixo de 11 px
// e TRÊS delas passaram em revisão humana. O olho pegou uma. É o padrão que este catálogo já viu seis
// vezes: régua escrita sem mecanismo acumula passivo calado.
//
// QUAL É O PISO, E DE ONDE ELE VEM. CONTRATO.md, 17.1, TIP-2: "Três tamanhos no corpo, no máximo,
// além do número de KPI (em geral 14, 12 e 11 px). Nada abaixo de 11 px." O piso é ÚNICO e não
// distingue papel: a tabela da 17.1 lista os papéis (KPI 30 px, apoio 14 px, rótulo e legenda 12 px,
// tique e anotação 11 px) e o menor deles é o piso. Então a guarda não precisa saber se o texto é
// tique, rótulo ou nota; o número é o mesmo para todos. REPROVA porque o número vem do contrato e não
// é escolha de desenho: abaixo dele o texto é ilegível no tamanho em que a peça é colada no Farol.
//
// ONDE OLHA: no `preview.svg`, nos dois lugares em que o preview escreve texto.
//   1. `<text>` de SVG, pelos SEGMENTOS que `colisao.mjs` entrega. É por segmento, e não por linha,
//      porque a linha sai com a MAIOR fonte dos seus `<tspan>` (é o que a caixa de tinta da
//      COLISAO-TEXTO precisa), e um `<tspan>` de 9 px ao lado de um de 11 px ficaria escondido.
//   2. HTML dentro de `foreignObject`, por `tamanho.mjs`. A COLISAO-TEXTO e a CONTRASTE-TEXTO não
//      alcançam esse texto porque ali falta POSIÇÃO, que depende do fluxo do navegador; tamanho, não:
//      está declarado em px no estilo computado. Foi o que permitiu pegar as outras duas versões do
//      passivo (`02/08 v4`, selo de 10 px, e `05/09 v4`, sinal de 9 px), que de outro modo sairiam
//      como aprovadas.
//
// OS DOIS TEMAS são lidos porque o preview claro é um arquivo próprio e poderia divergir; medido em
// 2026-09-18, os dois sempre concordam no tamanho, e a mensagem diz o tema quando divergirem.
//
// O QUE AVISA EM VEZ DE REPROVAR, e esta foi a única correção que a calibração pediu: TEXTO SEM LETRA
// E SEM ALGARISMO. `05/09 v4` desenha um "▲" de 9 px como marca de direção, dentro de
// `foreignObject`. Um triângulo não se lê, se vê: é marca desenhada com glifo, e a TIP-2 é a escala
// tipográfica do que se lê. Reprovar ali seria reprovar trabalho correto por um número que não governa
// aquele pixel, então sai como aviso, com o caractere impresso, para a revisão decidir.
//
// NÃO MEDIDA, sempre com motivo: `sem_preview` e `sem_texto`. O tamanho é declarado, então na prática
// a guarda mede toda versão que tem preview, inclusive a família `01_cards-e-kpis`, que as outras duas
// guardas de preview não alcançam.
//
// PONTO CEGO DECLARADO: texto que não declara tamanho em nenhum nível da cadeia. `colisao.mjs` o lê
// como 12 px, acima do piso; no acervo isso não acontece, porque o `<svg>` do Recharts declara 15 px e
// todo `<text>` do catálogo declara o seu. Em HTML, o trecho sem tamanho na cadeia sai contado em
// `semTamanho` e não é lido como aprovado.
//
// A ESCALA DO `<svg>`, emenda de 2026-09-29, e ela mudou o que a guarda mede. Até aqui o veredito era
// sobre o tamanho DECLARADO, e a tabela acima dizia isso. Mas um `<svg>` aninhado com `viewBox` maior
// que a própria caixa encolhe todo o conteúdo, texto incluído, e o número declarado deixa de ser o
// número que chega à tela. Medido no acervo no dia da emenda: 14 versões declaram 11 px que chegam
// abaixo de 11, a pior a 7,23 px, e as 14 tinham preview aprovado e check verde. O fator NÃO foi
// inventado aqui: `colisao.mjs` já o calculava para marcar `escalado`, que é o motivo pelo qual a
// COLISAO-TEXTO desiste dessas peças, e o jogava fora; agora ele sai no segmento e a conta é
// `declarado × escala`.
//
// TRÊS DECISÕES DA EMENDA, cada uma com prova no selftest. PRIMEIRA: o fator é o MENOR das duas
// razões, não a de largura, porque sem `preserveAspectRatio` o padrão do SVG é `xMidYMid meet`, que
// escala uniformemente pela menor e centraliza o resto; com `none` quem governa a altura do glifo é a
// razão de altura. Em `07_rosca-e-radial/06_coluna-radial/v2` as duas razões são 0,8792 e 0,6573, e
// usar a de largura erraria 2,44 px na peça mais grave do acervo. SEGUNDA: diferença subpixel entre a
// caixa e o `viewBox` NÃO conta, porque o serializador grava o `viewBox` em inteiro e a caixa em
// fracionário, e quase toda peça tem por isso um fator de 0,998 que não é decisão de desenho nenhuma;
// sem o filtro a guarda reprovaria duas versões de `05_areas/10_area-bump` por 11 px chegarem a 10,98,
// com a causa na ferramenta. TERCEIRA: as 14 entraram pela FILA DE DÍVIDA, não como erro seco, porque
// erro seco pararia a produção no dia em que a emenda entrou.
//
// O CONSERTO, para quem for pagar a dívida, não é o número declarado: é desenhar num `viewBox` do
// tamanho do corpo medido, para a escala sair 1, o que também devolve a COLISAO-TEXTO à peça.

/** Piso da TIP-2, em px (CONTRATO.md, 17.1). */
const TAM_PISO = 11;
/** Quantos trechos a mensagem lista antes de resumir. */
const TAM_NA_MENSAGEM = 3;
/** Texto que se lê tem letra ou algarismo; sem isso é marca desenhada com glifo (▲, ·, —). */
const TEM_LEITURA = /[\p{L}\p{N}]/u;

/** Trechos abaixo do piso num arquivo de preview, do menor para o maior. */
function trechosPequenos(arquivo) {
  if (!fs.existsSync(arquivo)) return null;
  const bruto = fs.readFileSync(arquivo, 'utf8');
  const { linhas } = lerLinhasDeTexto(bruto);
  const { trechos, semTamanho } = lerTextosHtml(bruto);
  const achados = [];
  let medidos = 0;
  let menor = null;
  // O tamanho que vale e o que CHEGA A TELA: o declarado vezes a escala do `<svg>` que contem o texto.
  // Ate 2026-09-29 esta guarda lia so o declarado, e por isso dizia "medida" para 14 pecas do acervo em
  // que 11 px declarados chegam abaixo do piso, a pior a 7,23 px. O fator vem de `colisao.mjs`, que ja
  // o calculava para marcar `escalado` e o jogava fora; nenhuma medicao nova foi inventada aqui.
  const anotar = (texto, declarado, onde, escala = 1) => {
    const fonte = declarado * escala;
    medidos += 1;
    if (menor === null || fonte < menor) menor = fonte;
    if (fonte < TAM_PISO) achados.push({ texto, fonte, onde, declarado, escala });
  };
  for (const linha of linhas) {
    for (const seg of linha.segmentos) anotar(seg.texto, seg.fonte, 'svg', seg.escala ?? 1);
  }
  for (const trecho of trechos) anotar(trecho.texto, trecho.fonte, `html <${trecho.tag}>`);
  achados.sort((a, b) => a.fonte - b.fonte);
  return { achados, medidos, semTamanho, menor };
}

/** Mede a TIP-2 no preview. Devolve `medicao` no formato das outras guardas. */
export function guardaTamanhoTexto(versionAbs, escapes, rel) {
  const errors = [];
  const warnings = [];
  const usados = [];
  const rotulo = `${path.basename(path.dirname(versionAbs))}/${path.basename(versionAbs)}`;
  const naoMedida = (motivo) => ({ errors, warnings, usados, medicao: { medida: false, motivo, trechos: null, menor: null, semTamanho: null } });
  const escuro = trechosPequenos(path.join(versionAbs, 'preview.svg'));
  if (!escuro) return naoMedida('sem_preview');
  const claro = trechosPequenos(path.join(versionAbs, 'preview-claro.svg'));
  if (!escuro.medidos && !(claro?.medidos ?? 0)) return naoMedida('sem_texto');

  // O mesmo texto no mesmo tamanho é UM defeito, com a contagem de ocorrências e os temas em que
  // aparece: o rótulo "a realizar" de `07/07 v4` sai três vezes, uma por mês a realizar.
  const porChave = new Map();
  const juntar = (lista, tema) => {
    for (const item of lista ?? []) {
      const chave = `${item.texto}|${item.fonte}|${item.onde}`;
      const atual = porChave.get(chave) ?? { ...item, porTema: new Map() };
      atual.porTema.set(tema, (atual.porTema.get(tema) ?? 0) + 1);
      porChave.set(chave, atual);
    }
  };
  juntar(escuro.achados, 'escuro');
  juntar(claro?.achados, 'claro');
  const todos = [...porChave.values()]
    .map((item) => ({ ...item, temas: [...item.porTema.keys()], vezes: Math.max(...item.porTema.values()) }))
    .sort((a, b) => a.fonte - b.fonte);
  const graves = todos.filter((item) => TEM_LEITURA.test(item.texto));
  const glifos = todos.filter((item) => !TEM_LEITURA.test(item.texto));
  const arred = (n) => Number(n.toFixed(2));
  const medicao = {
    medida: true,
    motivo: null,
    trechos: escuro.medidos,
    menor: escuro.menor === null ? null : arred(escuro.menor),
    semTamanho: escuro.semTamanho + (claro?.semTamanho ?? 0),
  };
  const tema = (item) => (item.temas.length === 2 ? 'nos dois temas' : `só no tema ${item.temas[0]}`);
  const vezes = (item) => (item.vezes > 1 ? `, ${item.vezes} ocorrências` : '');
  const lista = (itens) => {
    const comEscala = (item) =>
      item.escala !== undefined && Math.abs(item.escala - 1) > 0.005
        ? ` [${arred(item.declarado)} px declarados, encolhidos pela escala ${arred(item.escala)} do <svg>]`
        : '';
    const cabeca = itens.slice(0, TAM_NA_MENSAGEM).map((item) => `"${item.texto.slice(0, 26)}" em ${arred(item.fonte)} px${comEscala(item)} (${item.onde}${vezes(item)}, ${tema(item)})`).join('; ');
    return itens.length > TAM_NA_MENSAGEM ? `${cabeca}; e mais ${itens.length - TAM_NA_MENSAGEM} trecho(s)` : cabeca;
  };

  // A EMENDA DA ESCALA, de 2026-09-29, entra pela FILA DE DÍVIDA, e não como erro seco. Ao passar a
  // medir o tamanho que chega à tela, a guarda achou de uma vez 14 peças que o acervo carregava, todas
  // com preview aprovado; ligar isso como erro pararia a produção no mesmo dia, que é exatamente o
  // desfecho que a fila existe para evitar. Peça nova continua barrada, porque não está na fila.
  const mensagens = [];
  if (graves.length) {
    mensagens.push(
      `preview.svg TAMANHO-TEXTO: em ${rotulo} ${graves.length} trecho(s) de texto saem abaixo do piso de ${TAM_PISO} px da TIP-2. ` +
        `${lista(graves)}. ` +
        'A TIP-2 (CONTRATO.md, 17.1) fixa o piso para qualquer papel de texto, e o menor da tabela de escala é o tique e a anotação, em 11 px: ' +
        'suba o trecho para 11 px, ou tire o texto do desenho se ele não couber em 11 px (rótulo que não cabe vira legenda, ROT-4, ou sai do visual). ' +
        'Quando a mensagem diz que a escala do `<svg>` encolheu o texto, o conserto não é o número declarado: é desenhar num `viewBox` do ' +
        'tamanho do corpo medido, para a escala sair 1, ou dividir o tamanho declarado pela escala para o que chega à tela ficar em 11 px.',
    );
  }
  const repartido = repartirPelaFila(rel, 'TAMANHO-TEXTO', mensagens);
  errors.push(...repartido.errors);
  warnings.push(...repartido.warnings);
  if (glifos.length) {
    warnings.push(
      `preview.svg TAMANHO-TEXTO: em ${rotulo} ${glifos.length} trecho(s) abaixo de ${TAM_PISO} px não têm letra nem algarismo. ` +
        `${lista(glifos)}. ` +
        'Um glifo sem leitura é marca desenhada com fonte, não texto, e a TIP-2 é a escala do que se lê, então isto não reprova; ' +
        'se for marca, prefira desenhá-la em SVG (a forma não depende da escala tipográfica) e, se for texto, suba para 11 px.',
    );
  }
  if (escapes.codigos.has('TAMANHO-TEXTO')) {
    const silenciadas = errors.length + warnings.length;
    if (silenciadas) usados.push(`TAMANHO-TEXTO silenciado por comentário check-ok (${silenciadas} mensagem(ns))`);
    errors.length = 0;
    warnings.length = 0;
  }
  return { errors, warnings, usados, medicao };
}

// ---------------------------------------------------------------------------------------------
// CONTRASTE-TEXTO
// ---------------------------------------------------------------------------------------------
//
// POR QUE ELA EXISTE. Na revisão de 2026-09-18 a `v2_colunas-com-cunha-na-pior-passagem` de
// `10_funil/01_funil-em-barras-com-taxa-de-passo` foi reprovada porque a caixa de superfície sob o
// rótulo cobria só duas das três linhas: a terceira, "922 saíram", caía sobre a cunha e media 3,07:1
// no escuro e 3,29:1 no claro, abaixo de AA. Contraste é a régua que o olho humano mede pior e a que
// mais aparece nos vereditos da revisão; o CONTRATO.md tem 19 pares medidos na tabela da 17.10 e
// nenhum mecanismo conferia o que a versão de fato desenhou.
//
// OS TRÊS PONTOS QUE O PEDIDO MANDA EXPLICAR:
//
// 1. O QUE ESTÁ ATRÁS é resolvido pela GEOMETRIA, em `contraste.mjs`, que explica no cabeçalho como.
//    Resumo: toda forma preenchida entra em ordem de pintura, com a cor já composta (o `fill-opacity`
//    de 0,38 da cunha do funil muda o número), a caixa de tinta de cada trecho de texto é amostrada
//    numa grade, e cada fundo sai com a FRAÇÃO da tinta que cobre. Cunha, fatia e pétala não são
//    retângulos, então `polygon` e `path` são achatados em polígono e testados por número de voltas;
//    `rect`, `circle` e `ellipse` têm teste exato; o `clip-path` do grupo do Recharts recorta. O halo
//    da ROT-7 (`paint-order:stroke`) é tinta da superfície pintada por baixo do glifo: quando existe,
//    é ele o fundo. É o mesmo caminho da ESPESSURA-MARCA e da COLISAO-TEXTO, que também resolvem por
//    geometria do desenho e não por leitura do código.
//
// 2. O LIMIAR vem do CONTRATO.md, 17.10, ACE-3: "texto 4,5:1 contra a superfície onde está". É o
//    mesmo 4,5:1 da WCAG 2.1 (critério 1.4.3, AA) e a mesma fórmula com que a tabela da 17.10 mediu os
//    seus 19 pares, então os números desta guarda são comparáveis um a um com os de lá. REPROVA porque
//    o número é do contrato e da norma, não escolha de desenho.
//    A ÚNICA faixa que avisa em vez de reprovar é onde os dois documentos divergem: a WCAG isenta
//    TEXTO GRANDE (1.4.3: 18 pt, ou 14 pt em negrito, isto é 24 px, ou 18,66 px com peso 700) e pede
//    só 3:1; a ACE-3 fixa 4,5:1 sem isenção. Abaixo de 3:1 o texto grande reprova pelas duas réguas;
//    entre 3:1 e 4,5:1 a guarda AVISA e diz que a divergência é do contrato contra a norma, porque
//    escolher ali é decisão de quem escreve a régua, não da medida. No acervo essa faixa está vazia.
//
// 3. OS DOIS TEMAS são medidos, cada um no seu arquivo (`preview.svg` e `preview-claro.svg`), e a
//    mensagem diz qual falhou e com que número. O caso do funil prova que isso não é zelo: ele falha
//    nos dois, com números diferentes (3,07:1 e 3,29:1), e o CONTRATO.md registra pares que passam num
//    tema e reprovam no outro (`--positive` sobre `bg-positive/15`: 5,66:1 no escuro, 4,33:1 no claro).
//
// A FRAÇÃO DA TINTA decide o peso, e a fração é medida:
//   - ERRO no fundo DOMINANTE, o que pega a maior parte da tinta do trecho. É sobre ele que as letras
//     se leem, e se ele reprova o trecho é ilegível.
//   - AVISO em fundo minoritário que reprova: é a ponta de um rótulo que passa da marca para o cartão,
//     ou o vão entre duas letras caindo sobre outra cor. A tinta ali existe e o defeito pode ser real,
//     mas quem decide é o olho no PNG, porque a caixa de tinta é estimada (ver `colisao.mjs`) e a borda
//     é justamente onde a estimativa erra.
//
// NÃO MEDIDA, sempre com motivo, nunca calada: `sem_preview`, `preview_com_transform`,
// `preview_com_escala`, `preview_com_atributo_cego` (os três do leitor de `colisao.mjs`, mais giro ou
// inclinação em volta de forma, do leitor de fundo), `texto_em_html` (o texto mora em `foreignObject`,
// como na família `01_cards-e-kpis` inteira, e ali a POSIÇÃO depende do fluxo do navegador),
// `sem_texto` e `sem_fundo_resolvido` (nenhum trecho com cor e fundo resolvíveis, por gradiente ou por
// forma sem cor na cadeia). E TRECHO A TRECHO, dentro de uma versão que a guarda mede, o que ficou de
// fora sai contado em `medicao.naoMedidos`, por tema e por motivo, inclusive o texto em HTML de uma
// versão medida pelo SVG: "medida" nunca quer dizer "medida inteira".
//
// PONTOS CEGOS DECLARADOS: `stroke` de forma não entra no fundo (uma linha de grade de 2 px atrás de um
// rótulo não muda a cor da maioria da tinta, e é para ela que a ROT-7 pede halo); a caixa de tinta é a
// estimada por `colisao.mjs`, com o erro que o cabeçalho de lá declara; e a antialiasing da borda do
// glifo, que a WCAG também não mede.

/** Piso de texto da ACE-3 e da WCAG 2.1 (1.4.3, AA). */
const CON_PISO = 4.5;
/** Piso de TEXTO GRANDE da WCAG 2.1 (1.4.3), que a ACE-3 não isenta: daí a faixa de aviso. */
const CON_PISO_GRANDE = 3;
/** Texto grande da WCAG: 18 pt (24 px), ou 14 pt (18,66 px) com peso 700. */
const CON_GRANDE_PX = 24;
const CON_GRANDE_PX_NEGRITO = 18.66;
const CON_PESO_NEGRITO = 700;
/** Quantos trechos a mensagem lista antes de resumir. */
const CON_NA_MENSAGEM = 3;

/** Mede o contraste de um arquivo de preview; devolve `{ motivo }` ou `{ achados, trechos, ... }`. */
function contrasteDoArquivo(arquivo) {
  if (!fs.existsSync(arquivo)) return { motivo: 'sem_preview' };
  const bruto = fs.readFileSync(arquivo, 'utf8');
  const { linhas, temTransform, temEscala, temAtributoCego } = lerLinhasDeTexto(bruto);
  if (temTransform) return { motivo: 'preview_com_transform' };
  if (temEscala) return { motivo: 'preview_com_escala' };
  if (temAtributoCego) return { motivo: 'preview_com_atributo_cego' };
  if (!linhas.length) return { motivo: /<foreignObject/.test(bruto) ? 'texto_em_html' : 'sem_texto' };
  const { formas, temTransform: formaGirada } = lerFundos(bruto);
  if (formaGirada) return { motivo: 'preview_com_transform' };

  const achados = [];
  let medidos = 0;
  const foraPorMotivo = new Map();
  const fora = (motivo, quantos = 1) => foraPorMotivo.set(motivo, (foraPorMotivo.get(motivo) ?? 0) + quantos);
  // Texto em HTML fica fora da medida MESMO numa versão que a guarda mede pelo SVG: a posição dele
  // depende do fluxo do navegador. Conta sempre, para "medida" nunca ser lida como "medida inteira".
  // O cabeçalho do cartão, que é da moldura da ferramenta, entra nessa conta em toda versão.
  const emHtml = lerTextosHtml(bruto).trechos.length;
  if (emHtml) fora('texto_em_html', emHtml);
  let piorMedido = null;
  for (const linha of linhas) {
    for (const seg of linha.segmentos) {
      const corTexto = lerCor(seg.pintura);
      if (corTexto === null || corTexto === 'incerto') {
        fora(corTexto === null ? 'texto_sem_cor' : 'texto_com_cor_incerta');
        continue;
      }
      const corHalo = seg.halo ? lerCor(seg.halo.pintura) : null;
      const halo = corHalo && corHalo !== 'incerto' && (seg.halo.espessura ?? 0) >= HALO_MINIMO ? { cor: corHalo } : null;
      const fundos = fundosDaCaixa(formas, { x0: seg.x0, x1: seg.x1, y0: seg.y0, y1: seg.y1 }, halo);
      const dominante = fundos[0] ?? null;
      if (!dominante || dominante.cor === null || dominante.incerto) {
        fora(!dominante || dominante.cor === null ? 'sem_fundo' : 'fundo_incerto');
        continue;
      }
      medidos += 1;
      const grande = seg.fonte >= CON_GRANDE_PX || (seg.fonte >= CON_GRANDE_PX_NEGRITO && (seg.peso ?? 400) >= CON_PESO_NEGRITO);
      for (const fundo of fundos) {
        if (fundo.cor === null || fundo.incerto) continue;
        const razao = razaoDeContraste(corTexto, fundo.cor);
        const eDominante = fundo === dominante;
        if (eDominante && (piorMedido === null || razao < piorMedido)) piorMedido = razao;
        if (razao >= CON_PISO) continue;
        const grandeIsento = grande && razao >= CON_PISO_GRANDE;
        achados.push({
          texto: seg.texto,
          fonte: seg.fonte,
          peso: seg.peso,
          razao,
          cobertura: fundo.cobertura,
          corTexto,
          corFundo: fundo.cor,
          comHalo: Boolean(halo),
          formas: fundo.formas,
          tipo: eDominante && !grandeIsento ? 'erro' : 'aviso',
          porque: eDominante ? (grandeIsento ? 'texto grande entre 3:1 e 4,5:1' : 'fundo dominante') : 'parte da tinta',
        });
      }
    }
  }
  return { achados, medidos, foraPorMotivo, piorMedido, trechos: linhas.reduce((n, l) => n + l.segmentos.length, 0) };
}

/** Mede a ACE-3 nos dois temas do preview. Devolve `medicao` no formato das outras guardas. */
export function guardaContrasteTexto(versionAbs, escapes) {
  const errors = [];
  const warnings = [];
  const usados = [];
  const rotulo = `${path.basename(path.dirname(versionAbs))}/${path.basename(versionAbs)}`;
  const naoMedida = (motivo) => ({ errors, warnings, usados, medicao: { medida: false, motivo, temas: null, trechos: null, pior: null, naoMedidos: null } });
  const escuro = contrasteDoArquivo(path.join(versionAbs, 'preview.svg'));
  if (escuro.motivo === 'sem_preview') return naoMedida('sem_preview');
  const claro = contrasteDoArquivo(path.join(versionAbs, 'preview-claro.svg'));
  const medidos = [['escuro', escuro], ['claro', claro]].filter(([, r]) => r.motivo === undefined && r.medidos > 0);
  if (!medidos.length) return naoMedida(escuro.motivo ?? (escuro.medidos === 0 ? 'sem_fundo_resolvido' : 'sem_medicao'));

  const arred = (n) => Number(n.toFixed(2));
  const num = (n) => arred(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const naoMedidos = {};
  for (const [tema, r] of medidos) {
    for (const [motivo, n] of r.foraPorMotivo) naoMedidos[`${tema}:${motivo}`] = n;
  }
  const medicao = {
    medida: true,
    motivo: null,
    temas: medidos.map(([tema]) => tema),
    trechos: escuro.medidos ?? null,
    pior: medidos.reduce((pior, [, r]) => (r.piorMedido !== null && (pior === null || r.piorMedido < pior) ? r.piorMedido : pior), null),
    naoMedidos,
  };
  if (medicao.pior !== null) medicao.pior = arred(medicao.pior);

  // O mesmo trecho reprovado nos dois temas é UM defeito, com os dois números na mensagem; e o mesmo
  // rótulo repetido dentro de um tema conta como ocorrência, não como defeito novo.
  const porChave = new Map();
  for (const [tema, r] of medidos) {
    for (const achado of r.achados) {
      const chave = `${achado.texto}|${achado.tipo}|${achado.porque}`;
      const atual = porChave.get(chave) ?? { ...achado, porTema: new Map() };
      const pior = atual.porTema.get(tema);
      if (!pior || achado.razao < pior.razao) {
        atual.porTema.set(tema, { tema, razao: achado.razao, corTexto: achado.corTexto, corFundo: achado.corFundo, cobertura: achado.cobertura, vezes: (pior?.vezes ?? 0) + 1 });
      } else {
        pior.vezes += 1;
      }
      if (achado.razao < atual.razao) atual.razao = achado.razao;
      porChave.set(chave, atual);
    }
  }
  const todos = [...porChave.values()]
    .map((item) => ({ ...item, temas: [...item.porTema.values()], vezes: Math.max(...[...item.porTema.values()].map((t) => t.vezes)) }))
    .sort((a, b) => a.razao - b.razao);
  const graves = todos.filter((item) => item.tipo === 'erro');
  const leves = todos.filter((item) => item.tipo === 'aviso');
  const descreve = (item) => {
    const temas = item.temas.map((t) => `${num(t.razao)}:1 no ${t.tema} (${corEmTexto(t.corTexto)} sobre ${corEmTexto(t.corFundo)})`).join(' e ');
    const parte = item.porque === 'parte da tinta' ? `, em ${Math.round(item.cobertura * 100)}% da tinta` : '';
    const repetido = item.vezes > 1 ? `, ${item.vezes} ocorrências` : '';
    return `"${item.texto.slice(0, 26)}" de ${arred(item.fonte)} px mede ${temas}${parte}${repetido}`;
  };
  const lista = (itens) => {
    const cabeca = itens.slice(0, CON_NA_MENSAGEM).map(descreve).join('; ');
    return itens.length > CON_NA_MENSAGEM ? `${cabeca}; e mais ${itens.length - CON_NA_MENSAGEM} trecho(s)` : cabeca;
  };

  if (graves.length) {
    errors.push(
      `preview.svg CONTRASTE-TEXTO: em ${rotulo} ${graves.length} trecho(s) de texto ficam abaixo do piso de ${num(CON_PISO)}:1 da ACE-3 contra o que está pintado atrás. ` +
        `${lista(graves)}. ` +
        'Foi o que reprovou a 10/01 v2, em que a caixa de superfície cobria duas das três linhas do rótulo e a terceira caía sobre a cunha. ' +
        'Escolha um dos caminhos da 17.10: troque a cor do texto por um par medido da tabela da ACE-6, ponha o rótulo fora da marca (ROT-2) ' +
        'ou dê a ele o halo obrigatório da ROT-7 (paintOrder stroke com var(--surface-raised) e strokeWidth 4), lembrando que o halo precisa cobrir TODAS as linhas do rótulo.',
    );
  }
  if (leves.length) {
    warnings.push(
      `preview.svg CONTRASTE-TEXTO: em ${rotulo} ${leves.length} trecho(s) ficam abaixo de ${num(CON_PISO)}:1 em parte da tinta, ou são texto grande na faixa em que a ACE-3 e a WCAG divergem. ` +
        `${lista(leves)}. ` +
        'Parte da tinta sobre outro fundo costuma ser rótulo que passa da marca para o cartão, e a caixa de tinta é estimada justamente na borda, então aqui a guarda orienta e não reprova: ' +
        'confira no PNG de conferência. Texto grande entre 3:1 e 4,5:1 passa na WCAG 1.4.3 e reprova na ACE-3, que não isenta tamanho; a decisão é de quem escreve a régua.',
    );
  }
  if (escapes.codigos.has('CONTRASTE-TEXTO')) {
    const silenciadas = errors.length + warnings.length;
    if (silenciadas) usados.push(`CONTRASTE-TEXTO silenciado por comentário check-ok (${silenciadas} mensagem(ns))`);
    errors.length = 0;
    warnings.length = 0;
  }
  return { errors, warnings, usados, medicao };
}

// ---------------------------------------------------------------------------------------------
// AGREGACAO-ZERO
// ---------------------------------------------------------------------------------------------
//
// EST-1b, emenda de 2026-09-28: toda função que agrega uma lista declara retorno `number | null` e
// devolve `null` para lista vazia, nunca `0`. A regra existe porque a EST-2, que governa a
// RENDERIZAÇÃO da ausência, calava sobre o CÁLCULO: uma função que devolve `0` passa por todas as
// guardas do `check` e por todas as perguntas do CHECKLIST_REVISAO.md, porque o que se inspeciona é a
// tela, e a tela de dado completo está certa. O defeito mora no RAMO, não na foto.
//
// POR QUE ELA É A GUARDA DE MAIOR RETORNO DO PROJETO, pelos números da própria emenda: 12 de 15
// implementações de mediana do acervo devolviam `0` para lista vazia, e NENHUMA revisão por PNG pegou
// isso em seis peças seguidas. É a armadilha DAD-6.
//
// ONDE OLHA: `Chart.tsx` e `data.ts`, pela ÁRVORE SINTÁTICA, nunca por expressão regular. O leitor e
// as seis regras estão em `agregacao.mjs`, com o porquê de cada recorte.
//
// ERRO CONTRA AVISO, duas camadas. A primeira é a substância: o zero que CHEGA A SER LIDO reprova, e
// o que só vira limite de desenho orienta (ver `chegaAoTexto` em `agregacao.mjs`). A segunda é a fila
// de dívida de `divida.mjs`, que faz peça nova ser barrada e o acervo virar fila visível.
//
// ESCAPE por linha, como a NUMERO-CRU: `// check-ok: AGREGACAO-ZERO motivo` na linha ou na de cima.

/** Mede a EST-1b no código da versão. `rel` é o caminho relativo a VISUAIS, para a fila de dívida. */
export function guardaAgregacaoZero(versionAbs, rel) {
  const errors = [];
  const warnings = [];
  const usados = [];
  const mensagens = { erro: [], aviso: [] };
  let arquivos = 0;
  for (const [nome, kind] of [['Chart.tsx', ts.ScriptKind.TSX], ['data.ts', ts.ScriptKind.TS]]) {
    const file = path.join(versionAbs, nome);
    if (!fs.existsSync(file)) continue;
    arquivos += 1;
    const texto = fs.readFileSync(file, 'utf8');
    const escapes = lerEscapes(texto, nome);
    const sourceFile = ts.createSourceFile(file, texto, ts.ScriptTarget.ES2022, true, kind);
    const achados = acharAgregacaoZero(sourceFile);
    for (const achado of achados) {
      if (escapes.porLinha.get(achado.linha)?.has('AGREGACAO-ZERO')) {
        usados.push(`${nome}:${achado.linha} AGREGACAO-ZERO silenciado por comentário check-ok`);
        continue;
      }
      mensagens[achado.nivel].push(achado.texto);
    }
  }
  if (!arquivos) return { errors, warnings, usados, medicao: { medida: false, motivo: 'sem_codigo', graves: null, leves: null } };
  const repartido = repartirPelaFila(rel, 'AGREGACAO-ZERO', mensagens.erro);
  errors.push(...repartido.errors);
  warnings.push(...repartido.warnings);
  warnings.push(
    ...mensagens.aviso.map(
      (texto) =>
        `${texto} [aqui o zero vira limite de desenho e não número lido na tela, então a guarda ORIENTA e não reprova; ` +
        'confira se ele não chega a texto por um caminho que o leitor não segue.]',
    ),
  );
  return {
    errors,
    warnings,
    usados,
    medicao: { medida: true, motivo: null, graves: mensagens.erro.length, leves: mensagens.aviso.length },
  };
}

// ---------------------------------------------------------------------------------------------
// CONTRASTE-MARCA
// ---------------------------------------------------------------------------------------------
//
// O QUE ELA MEDE: o contraste de cada cor usada como MARCA DE DADO contra o fundo do cartão,
// `--surface-raised`, NOS DOIS TEMAS. A CONTRASTE-TEXTO já mede tinta de texto; nada media a marca, e
// é ali que vivem a TOK-1 e a TOK-7 do ARMADILHAS.md. O leitor de marcas, o que conta como marca e o
// porquê de cada recorte estão em `marca.mjs`.
//
// QUAIS TOKENS ELA JULGA, e por que só estes. Julgar toda cor pintada reprovaria o acervo inteiro sem
// razão, e a medição de 2026-09-28 mostra por quê: a área de um gráfico de área usa `--chart-1` com
// opacidade baixa de propósito, e a linha opaca por cima é que carrega o sinal; o revestimento da
// TOK-4 usa a PRÓPRIA cor do cartão por baixo do traço, e mede 1,00:1 contra ele por desenho. Nos
// dois casos o número baixo é a forma certa. Então a guarda julga exatamente os tokens que o contrato
// PROÍBE como marca:
//
//   ERRO, `--surface-overlay`. A TOK-1 é literal desde 2026-09-25: nunca trilho, moldura nem faixa.
//   Ele mede 1,00:1 no claro, porque ali é o mesmo branco de `--surface-raised`, e 1,10:1 no escuro: a
//   estrutura não existe na tela. Medido em 32 versões do acervo, que é o retrato dos 18 modelos que a
//   armadilha registra. Saída: `--surface-sunken` ou `--line-subtle`, que a própria TOK-1 indica.
//
//   ERRO, degrau `--seq-*` usado como cor CATEGÓRICA. É a TOK-7. `--seq-3` mede 2,29:1 no escuro e
//   1,92:1 no claro, contra 5,3:1 a 8,4:1 das cores de papel, e a ordem de luminância quebra: no claro
//   o degrau do meio vira o ponto mais claro da escala e ela deixa de ordenar. Categórico se reconhece
//   pela CONTAGEM: menos de três degraus distintos desenhados é uso categórico; três ou mais é rampa,
//   que é o uso certo e sai de fora.
//
//   AVISO, `--line-strong` e `--line-subtle` como PREENCHIMENTO de área. Os dois são endossados pela
//   TOK-1 como contorno e como estrutura visível, e a DAD-2 pede neutro fora da rampa para o zero
//   medido, que no Farol só existe nestes tokens. Preenchê-los numa marca de valor mede 1,79:1 a
//   1,83:1 e é tensão real entre duas regras do contrato, não defeito fechado: a guarda dá o número e
//   quem escreve a régua decide. Medido em 68 versões.
//
// A OPACIDADE ENTRA NA CONTA, porque é ela que derruba a marca: `--line-strong` opaco já está abaixo
// do piso, e com a opacidade que a especificação costuma pedir cai para 1,07:1 a 1,25:1.
//
// PISO de 3:1, o da WCAG 2.1 para conteúdo não textual (1.4.11). A ACE-3 não escreve um piso de marca,
// e usar o de texto, 4,5:1, reprovaria cor de papel legítima.
//
// NÃO MEDIDA, sempre com motivo: `sem_preview`, `preview_com_transform`, `sem_marca` e a marca com
// pintura que o leitor não resolve (gradiente, padrão, variável), contada à parte.
//
// ESCAPE de arquivo, como a CONTRASTE-TEXTO: a medida não tem linha de código a apontar.

/** Piso de contraste de conteúdo não textual da WCAG 2.1 (1.4.11). */
const MARCA_PISO = 3;
/** Abaixo de três degraus distintos, a rampa sequencial virou cor categórica (TOK-7). */
const MARCA_SEQ_CATEGORICO = 3;
/** Quantos achados a mensagem lista antes de resumir. */
const MARCA_NA_MENSAGEM = 3;

/** Mede a TOK-1 e a TOK-7 nos dois temas. `rel` é o caminho da versão, para a fila de dívida. */
export function guardaContrasteMarca(versionAbs, escapes, rel) {
  const errors = [];
  const warnings = [];
  const usados = [];
  const rotulo = `${path.basename(path.dirname(versionAbs))}/${path.basename(versionAbs)}`;
  const naoMedida = (motivo) => ({ errors, warnings, usados, medicao: { medida: false, motivo, temas: null, marcas: null, pior: null, naoMedidos: null } });
  if (!fs.existsSync(path.join(versionAbs, 'preview.svg'))) return naoMedida('sem_preview');
  const temas = lerTokensDoFarol();
  const arred = (n) => Number(n.toFixed(2));
  const num = (n) => arred(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const porChave = new Map();
  const naoMedidos = {};
  const medidos = [];
  let pior = null;
  let motivoUnico = null;
  for (const [arquivo, tema] of [['preview.svg', 'dark'], ['preview-claro.svg', 'light']]) {
    const file = path.join(versionAbs, arquivo);
    if (!fs.existsSync(file)) continue;
    const tabela = temas[tema];
    const fundo = tabela.get('--surface-raised');
    if (!fundo) {
      naoMedidos[`${tema}:sem_token_de_cartao`] = 1;
      motivoUnico ??= 'sem_token_de_cartao';
      continue;
    }
    const { marcas, foraPorMotivo, temTransform } = lerMarcas(fs.readFileSync(file, 'utf8'));
    for (const [motivo, n] of foraPorMotivo) naoMedidos[`${tema}:${motivo}`] = n;
    if (temTransform) {
      naoMedidos[`${tema}:preview_com_transform`] = 1;
      motivoUnico ??= 'preview_com_transform';
      continue;
    }
    if (!marcas.length) {
      motivoUnico ??= 'sem_marca';
      continue;
    }
    medidos.push(tema);
    // A CONTAGEM de degraus olha o que a peça DESENHA, inclusive a forma isenta: a célula de heatmap
    // com número dentro é um degrau desenhado, e descontá-la faria a rampa parecer uso categórico.
    const degrausSeq = new Set(marcas.map((marca) => nomeDoToken(marca.cor, tabela)).filter((nome) => nome && /^--seq-\d/.test(nome)));
    for (const marca of marcas) {
      // Forma com texto escrito por cima é suporte, não marca: a informação está na letra. No HTML o
      // leitor já a deixava de fora pelo parentesco; no SVG ela chega marcada, porque ali o `<text>`
      // é irmão da forma e só a geometria separa os dois casos.
      if (marca.isenta) {
        const chave = `${tema}:marca_isenta_por_texto_sobreposto`;
        naoMedidos[chave] = (naoMedidos[chave] ?? 0) + 1;
        continue;
      }
      const { razao } = medirMarca(marca.cor, fundo);
      const nome = nomeDoToken(marca.cor, tabela);
      const seq = nome !== null && /^--seq-\d/.test(nome);
      const julgado =
        nome === '--surface-overlay'
          ? 'erro'
          : seq && degrausSeq.size < MARCA_SEQ_CATEGORICO
            ? 'erro'
            : (nome === '--line-strong' || nome === '--line-subtle') && marca.tipo === 'fill'
              ? 'aviso'
              : null;
      if (julgado === null) {
        const fora = nome === null ? 'marca_fora_da_tabela_de_tokens' : 'marca_de_token_nao_julgado';
        naoMedidos[`${tema}:${fora}`] = (naoMedidos[`${tema}:${fora}`] ?? 0) + 1;
        continue;
      }
      if (pior === null || razao < pior) pior = razao;
      if (razao >= MARCA_PISO) continue;
      const chave = `${nome}|${marca.tipo}|${marca.origem}`;
      const atual = porChave.get(chave) ?? { nome, tipo: marca.tipo, origem: marca.origem, nivel: julgado, seq, porTema: new Map() };
      const antes = atual.porTema.get(tema);
      if (!antes || razao < antes.razao) atual.porTema.set(tema, { tema, razao, alfa: marca.cor.a, vezes: (antes?.vezes ?? 0) + 1 });
      else antes.vezes += 1;
      porChave.set(chave, atual);
    }
  }
  if (!medidos.length) return naoMedida(motivoUnico ?? 'sem_medicao');

  const menor = (item) => Math.min(...[...item.porTema.values()].map((t) => t.razao));
  const descreve = (item) => {
    const onde = item.tipo === 'stroke' ? 'traço' : item.origem === 'html' ? 'fundo de elemento sem texto' : 'preenchimento';
    const temasTexto = [...item.porTema.values()]
      .map((t) => `${num(t.razao)}:1 no ${t.tema}${t.alfa < 0.999 ? ` com opacidade ${num(t.alfa)}` : ''}${t.vezes > 1 ? `, ${t.vezes} marcas` : ''}`)
      .join(' e ');
    return `${item.nome} como ${onde} mede ${temasTexto}`;
  };
  const lista = (itens) => {
    const cabeca = itens.slice(0, MARCA_NA_MENSAGEM).map(descreve).join('; ');
    return itens.length > MARCA_NA_MENSAGEM ? `${cabeca}; e mais ${itens.length - MARCA_NA_MENSAGEM} marca(s)` : cabeca;
  };
  const todos = [...porChave.values()].sort((a, b) => menor(a) - menor(b));
  const graves = todos.filter((item) => item.nivel === 'erro');
  const leves = todos.filter((item) => item.nivel === 'aviso');

  const mensagensGraves = [];
  if (graves.length) {
    const temSeq = graves.some((item) => item.seq);
    mensagensGraves.push(
      `preview.svg CONTRASTE-MARCA: em ${rotulo} ${graves.length} cor(es) de marca de dado ficam abaixo do piso de ${num(MARCA_PISO)}:1 contra o cartão (--surface-raised). ` +
        `${lista(graves)}. ` +
        (temSeq
          ? 'Degrau da rampa sequencial como cor categórica é a armadilha TOK-7: os --seq-* são feitos para receber texto por cima DENTRO de uma célula, não para contrastar com a superfície do cartão, ' +
            'e no tema claro o degrau do meio vira o ponto mais claro da escala, que deixa de ordenar. Cor categórica de marca sai das cores de papel (--positive, --warning, --negative, --chart-*), que medem de 5,3:1 a 8,4:1 nos dois temas. '
          : '') +
        'Para --surface-overlay a regra é a armadilha TOK-1: ele mede 1,00:1 no tema claro, onde é exatamente o mesmo branco do cartão, então o trilho simplesmente não existe na tela. ' +
        'A tabela do CONTRATO.md dizia o contrário até 2026-09-25 e hoje diz nunca trilho, nunca moldura, nunca faixa: use --surface-sunken, o poço rebaixado, ou --line-subtle. ' +
        'Confira SEMPRE os dois temas, porque o acervo inteiro só registrou o claro e quem olhou um tema achou que tinha escapado.',
    );
  }
  if (leves.length) {
    warnings.push(
      `preview.svg CONTRASTE-MARCA: em ${rotulo} ${leves.length} marca(s) de área pintadas com token de LINHA ficam abaixo de ${num(MARCA_PISO)}:1 contra o cartão. ` +
        `${lista(leves)}. ` +
        'Aqui a guarda orienta e não reprova, porque duas regras do contrato se cruzam: a TOK-1 endossa --line-strong como contorno e --line-subtle como estrutura visível, ' +
        'e a DAD-2 pede neutro FORA da rampa para o zero medido, que no Farol só existe nestes dois tokens. ' +
        'Se a marca carrega valor, ela precisa ser vista: prefira --surface-sunken com contorno, ou uma cor de papel com hachura para distinguir o zero.',
    );
  }
  if (escapes.codigos.has('CONTRASTE-MARCA')) {
    const silenciadas = mensagensGraves.length + warnings.length;
    if (silenciadas) usados.push(`CONTRASTE-MARCA silenciado por comentário check-ok (${silenciadas} mensagem(ns))`);
    mensagensGraves.length = 0;
    warnings.length = 0;
  } else {
    const repartido = repartirPelaFila(rel, 'CONTRASTE-MARCA', mensagensGraves);
    errors.push(...repartido.errors);
    warnings.push(...repartido.warnings);
  }
  return {
    errors,
    warnings,
    usados,
    medicao: { medida: true, motivo: null, temas: medidos, marcas: todos.length, pior: pior === null ? null : arred(pior), naoMedidos },
  };
}

// ---------------------------------------------------------------------------------------------
// REGUA-CONSTANTE
// ---------------------------------------------------------------------------------------------
//
// ROT-5b, emenda de 2026-09-28: quando a legenda ensina a ler área ou raio, o último degrau dela é o
// maior valor OBSERVADO, calculado do dado, nunca uma constante escrita à mão. Constante envelhece no
// primeiro recorte diferente e deixa a maior marca da tela sem referência.
//
// POR QUE ELA EXISTE. O defeito apareceu de forma INDEPENDENTE em duas versões da mesma família,
// `09_dispersao-e-bolhas/09_densidade-2d/v1` e `09_dispersao-e-bolhas/04_bolhas-em-grade-categorica/v1`,
// as duas pegas por revisão humana e nenhuma pelo `check`. Duas descobertas independentes do mesmo
// defeito não são descuido, são lacuna de mecanismo. As duas foram consertadas em 2026-09-25, e por
// isso esta guarda nasce protegendo um conserto já feito. Na primeira execução sobre o acervo, em
// 2026-09-28, ela achou uma TERCEIRA versão da mesma família que a rodada de conserto não alcançou.
//
// O leitor e o que separa legenda de tamanho de tique de eixo estão em `regua.mjs`.
//
// ERRO, com fila de dívida. Diferente da AGREGACAO-ZERO, aqui não há camada de substância entre erro e
// aviso: régua que para antes do dado está errada, ponto. O único caso legítimo é o último degrau
// constante e MAIOR que qualquer dado possível, e esse sai por escape, com o motivo escrito.
//
// ESCAPE por linha: `// check-ok: REGUA-CONSTANTE motivo` na linha do `.map` ou na de cima.

/** Mede a ROT-5b no Chart.tsx. `rel` é o caminho da versão, para a fila de dívida. */
export function guardaReguaConstante(versionAbs, rel) {
  const errors = [];
  const warnings = [];
  const usados = [];
  const file = path.join(versionAbs, 'Chart.tsx');
  if (!fs.existsSync(file)) return { errors, warnings, usados, medicao: { medida: false, motivo: 'sem_codigo', reguas: null } };
  const texto = fs.readFileSync(file, 'utf8');
  const escapes = lerEscapes(texto, 'Chart.tsx');
  const sourceFile = ts.createSourceFile(file, texto, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  const mensagens = [];
  for (const achado of acharReguaConstante(sourceFile)) {
    if (escapes.porLinha.get(achado.linha)?.has('REGUA-CONSTANTE')) {
      usados.push(`Chart.tsx:${achado.linha} REGUA-CONSTANTE silenciado por comentário check-ok`);
      continue;
    }
    mensagens.push(achado.texto);
  }
  const repartido = repartirPelaFila(rel, 'REGUA-CONSTANTE', mensagens);
  errors.push(...repartido.errors);
  warnings.push(...repartido.warnings);
  return { errors, warnings, usados, medicao: { medida: true, motivo: null, reguas: mensagens.length } };
}

// ---------------------------------------------------------------------------------------------
// FORMATO-ACESSIVEL
// ---------------------------------------------------------------------------------------------
//
// O QUE ELA MEDE: o mesmo número sai com a mesma aparência para quem ouve e para quem enxerga? A
// guarda compara os formatadores que montam a frase acessível com os que escrevem o corpo visível, e
// acusa quando a MESMA medida sai de duas formas: `formatPercent(percent)` na frase, que lê "63,4%", e
// `formatPercent(percent, 0)` no corpo, que mostra "63%".
//
// POR QUE NENHUMA GUARDA A PEGAVA. A assimetria é estrutural, e é a mesma que produz a armadilha
// DAD-9: a frase da raiz é CALCULADA do dado, com um formatador escolhido para ler bem em voz alta, e o
// corpo é escrito com outro, escolhido para caber na caixa. As duas escolhas são defensáveis em
// separado, e só a comparação revela a divergência. Revisão por imagem não vê a frase, que não está na
// imagem; revisão por código não junta duas linhas distantes.
//
// A COMPARAÇÃO É PELO ARGUMENTO, e é isso que a torna precisa em vez de palpite: números diferentes
// podem ter formatos diferentes, o MESMO número não. `formato.mjs` explica quais formatadores entram e
// quais ficam de fora, com a medição que descartou os de rótulo de tempo e o de taxa com volume.
//
// ERRO, com fila de dívida, e sem camada de aviso: duas precisões para a mesma medida é sempre uma
// sobrando.
//
// NÃO MEDIDA: versão sem `aria-label`, frase sem formatador de grandeza e corpo sem formatador de
// grandeza, os três contados à parte. Medido em 2026-09-28: 258 das 347 versões são medidas.
//
// O QUE NÃO SE SUSTENTOU COMO GUARDA, e está escrito aqui para ninguém tentar de novo sem medir: a
// outra metade da DAD-9, o qualificador de PERÍODO que existe só na frase acessível. A frase é
// legitimamente mais longa e mais conclusiva que o corpo, porque a ACE-1 pede que ela conclua, então
// "no ano", "até setembro" e "no trimestre" aparecem nela por desenho na maior parte do acervo. Uma
// guarda por presença de palavra acusaria a escrita correta, e foi descartada em favor desta, que
// compara formato e tem prova estrutural de que a medida é a mesma.
//
// ESCAPE por linha: `// check-ok: FORMATO-ACESSIVEL motivo` na linha da chamada da frase.

/** Mede a divergência de formato entre frase e corpo. `rel` é o caminho, para a fila de dívida. */
export function guardaFormatoAcessivel(versionAbs, rel) {
  const errors = [];
  const warnings = [];
  const usados = [];
  const file = path.join(versionAbs, 'Chart.tsx');
  if (!fs.existsSync(file)) return { errors, warnings, usados, medicao: { medida: false, motivo: 'sem_codigo', divergencias: null } };
  const texto = fs.readFileSync(file, 'utf8');
  const escapes = lerEscapes(texto, 'Chart.tsx');
  const sourceFile = ts.createSourceFile(file, texto, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  const { achados, medida, motivo } = acharFormatoAcessivel(sourceFile);
  const mensagens = [];
  for (const achado of achados) {
    if (escapes.porLinha.get(achado.linha)?.has('FORMATO-ACESSIVEL')) {
      usados.push(`Chart.tsx:${achado.linha} FORMATO-ACESSIVEL silenciado por comentário check-ok`);
      continue;
    }
    mensagens.push(achado.texto);
  }
  const repartido = repartirPelaFila(rel, 'FORMATO-ACESSIVEL', mensagens);
  errors.push(...repartido.errors);
  warnings.push(...repartido.warnings);
  return { errors, warnings, usados, medicao: { medida, motivo, divergencias: mensagens.length } };
}

// ---------------------------------------------------------------------------------------------
// EIXO-CALMO
// ---------------------------------------------------------------------------------------------
//
// O QUE ELA MEDE: numa peça que desenha grade, cada eixo cartesiano acaba SEM a linha de eixo? A
// EIX-5 do CONTRATO.md manda "com grade, tickLine={false}, axisLine={false} e tickMargin={8}", e
// NOMEIA o AXIS_PROPS: "(sobrescrevem o axisLine de AXIS_PROPS)". A guarda mede a sobreposição que a
// regra pede, no eixo em que ela é pedida.
//
// ESCOPO: só o Chart.tsx, e dentro dele só XAxis e YAxis de peça que tem CartesianGrid. Fica de fora,
// declarado: peça sem grade (a EIX-5 não se aplica), eixo que não espalha AXIS_PROPS (a regra fala do
// padrão do módulo compartilhado), eixo com `hide`, o tickMargin={8} da mesma EIX-5 (que não vem de
// módulo compartilhado e por isso é outra medição), grade desenhada à mão e eixo polar. O leitor e o
// porquê de cada exclusão estão em `eixo.mjs`.
//
// POR QUE ELA EXISTE. O defeito é uma PROPRIEDADE QUE NÃO ESTÁ ESCRITA: o chartTheme.ts do Farol
// define AXIS_PROPS com axisLine ligado, então quem espalha e não sobrepõe herda a linha em silêncio.
// Revisão de código não vê ausência e revisão por imagem confunde a linha de eixo com o primeiro
// degrau da grade, porque as duas saem na mesma --line-subtle. Medido em 2026-09-28: 20 versões do
// acervo herdavam a linha com o check verde, e TRÊS delas saíram de um agente nesta mesma sessão e
// foram reportadas como limpas. Guarda existe para isto: o portão da fase é o check, e o que o check
// não vê ninguém vê.
//
// A ORDEM É PARTE DA MEDIÇÃO, e é o que nenhuma busca por texto alcança. Em JSX a última propriedade
// vence: `{...AXIS_PROPS} axisLine={false}` desliga a linha e `axisLine={false} {...AXIS_PROPS}` NÃO
// desliga. As duas escritas têm os mesmos caracteres.
//
// O PADRÃO É LIDO, não suposto: a guarda abre o chartTheme.ts e mede o axisLine do próprio
// AXIS_PROPS. O conserto na raiz é uma linha naquele arquivo, e no dia em que ele acontecer esta
// guarda emudece sozinha (`axis_props_desliga` na cobertura) em vez de acusar o acervo por uma
// verdade que deixou de valer.
//
// ERRO, com fila de dívida, e sem camada de aviso: linha de eixo sobrando com grade no fundo é sempre
// uma régua a mais. O caso legítimo raro sai por escape, com o motivo escrito.
//
// ESCAPE por linha: `// check-ok: EIXO-CALMO motivo` na linha do <XAxis> ou na de cima; dentro do JSX
// vale a forma `{/* check-ok: EIXO-CALMO motivo */}`.

/** Mede a EIX-5 no Chart.tsx. `rel` é o caminho da versão, para a fila de dívida. */
export function guardaEixoCalmo(versionAbs, rel) {
  const errors = [];
  const warnings = [];
  const usados = [];
  const file = path.join(versionAbs, 'Chart.tsx');
  if (!fs.existsSync(file)) return { errors, warnings, usados, medicao: { medida: false, motivo: 'sem_codigo', eixos: null, padrao: null } };
  const texto = fs.readFileSync(file, 'utf8');
  const escapes = lerEscapes(texto, 'Chart.tsx');
  const sourceFile = ts.createSourceFile(file, texto, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  const { achados, medida, motivo, eixos, padrao } = acharEixoCalmo(sourceFile);
  const mensagens = [];
  for (const achado of achados) {
    if (escapes.porLinha.get(achado.linha)?.has('EIXO-CALMO')) {
      usados.push(`Chart.tsx:${achado.linha} EIXO-CALMO silenciado por comentário check-ok`);
      continue;
    }
    mensagens.push(achado.texto);
  }
  const repartido = repartirPelaFila(rel, 'EIXO-CALMO', mensagens);
  errors.push(...repartido.errors);
  warnings.push(...repartido.warnings);
  return { errors, warnings, usados, medicao: { medida, motivo, eixos, padrao } };
}

// ---------------------------------------------------------------------------------------------
// OPACIDADE-MARCA
// ---------------------------------------------------------------------------------------------
//
// O QUE ELA MEDE: a opacidade que a peça pede numa marca de dado derruba a cor COMPOSTA sobre o cartão
// abaixo de 3:1, nos dois temas? A ACE-5 do CONTRATO.md é literal: "Opacidade em marca é perda de
// contraste medida, não enfeite". `fillOpacity` compõe a cor da marca com a de `--surface-raised`, e o
// resultado tem de continuar acima do piso da WCAG 1.4.11, a mesma régua da marca opaca.
//
// ESCOPO: só o `Chart.tsx`, e dentro dele só o elemento que declara opacidade (`fillOpacity`,
// `opacity`, `strokeOpacity`, as grafias com hífen, e o `bg-<token>/<pct>` do Tailwind no `className`)
// E pinta numa das 21 cores de marca de `tokens.css`. Fica de fora, declarado: tag de TEXTO, que é a
// ACE-4 e tem outro piso e outro veredito; token de superfície, de grade e de procedência, que não
// pintam marca; opacidade ou cor CALCULADA em tempo de execução, que o leitor não resolve e prefere
// deixar passar; opacidade herdada de componente do Recharts, porque herdar dali seria supor o que a
// biblioteca faz com a prop, e só `<g>`, `<svg>`, `<a>` e `<Layer>` propagam por semântica do SVG;
// marca sobre marca e marca sobre poço, porque o fundo usado é sempre o do cartão, como na
// CONTRASTE-MARCA. O leitor, a conta e o porquê de cada exclusão estão em `opacidade.mjs`.
//
// POR QUE ELA EXISTE, e por que era a MAIOR LACUNA DE COBERTURA do catálogo. A ACE-5 é a maior classe
// de colisão do acervo, 50 das 814 versões planejadas prescrevem opacidade em marca, e nada a media: a
// CONTRASTE-MARCA julga só `--surface-overlay` e os `--seq-*`, porque nasceu para as armadilhas TOK-1 e
// TOK-7. Opacidade sobre `--chart-*`, `--positive` e `--negative` passava sem medição nenhuma, e o
// acervo acumulou casos com o check VERDE, todos achados à mão por quem produzia:
// `16_distribuicao/03_strip-plot-e-beeswarm/v1` com 0,45 em `--chart-1` (2,97:1 e 2,04:1) e
// `09_dispersao-e-bolhas/03_bolhas/v1` com 0,55 (3,76:1 e 2,43:1). O escopo mal declarado de uma guarda
// vizinha é o que criou esta lacuna, e é por isso que este cabeçalho escreve o escopo por extenso.
//
// AS DUAS ISENÇÕES DA WCAG 1.4.11, e as duas estão implementadas: marca com o valor escrito DENTRO dela
// (`<Bar><LabelList/></Bar>`, célula de tabela com o número) e marca com o valor escrito AO LADO (a
// 17.2), que é o trilho da lista em barras ao lado do número da linha. A segunda é a que decidiu a
// guarda ler CÓDIGO e não preview: "ao lado" não tem definição geométrica que não seja inventada, e é
// justamente ela que o contrato usa para autorizar as cores que não alcançam 3:1 nem opacas.
//
// DUAS CAMADAS, como na CONTRASTE-MARCA:
//
//   ERRO, com fila de dívida, quando a cor TEM opacidade mínima calculável e a peça pede menos. O
//   conserto é aritmético e a mensagem dá o número: `--chart-1` precisa de 0,66 e a peça pediu 0,45.
//
//   AVISO, sem fila, nas cinco cores em que opacidade NÃO É OPÇÃO porque elas não alcançam 3:1 nem
//   opacas (`--line-strong`, `--seq-1` a `--seq-4`). Ali duas regras do contrato se cruzam: a tabela da
//   17.2 autoriza estes tokens como neutro de dado DESDE QUE a marca carregue o valor escrito, e a
//   emenda E5 registra a tensão como ABERTA. A guarda dá o número e quem escreve a régua decide.
//
// ESCAPE por linha: `// check-ok: OPACIDADE-MARCA motivo` na linha da marca ou na de cima; dentro do
// JSX vale a forma `{/* check-ok: OPACIDADE-MARCA motivo */}`.

/** Mede a ACE-5 no Chart.tsx. `rel` é o caminho da versão, para a fila de dívida. */
export function guardaOpacidadeMarca(versionAbs, rel) {
  const errors = [];
  const warnings = [];
  const usados = [];
  const file = path.join(versionAbs, 'Chart.tsx');
  if (!fs.existsSync(file)) return { errors, warnings, usados, medicao: { medida: false, motivo: 'sem_codigo', marcas: null, naoMedidos: null } };
  const texto = fs.readFileSync(file, 'utf8');
  const escapes = lerEscapes(texto, 'Chart.tsx');
  const sourceFile = ts.createSourceFile(file, texto, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  const { achados, medida, motivo, marcas, fora } = acharOpacidadeMarca(sourceFile);
  const mensagens = [];
  for (const achado of achados) {
    if (escapes.porLinha.get(achado.linha)?.has('OPACIDADE-MARCA')) {
      usados.push(`Chart.tsx:${achado.linha} OPACIDADE-MARCA silenciado por comentário check-ok`);
      continue;
    }
    // A camada de aviso sai FORA da fila: ela não reprova nem hoje nem para peça nova, então registrá-la
    // na fila só encheria o arquivo de linhas que nunca viram erro.
    if (achado.nivel === 'aviso') warnings.push(achado.texto);
    else mensagens.push(achado.texto);
  }
  const repartido = repartirPelaFila(rel, 'OPACIDADE-MARCA', mensagens);
  errors.push(...repartido.errors);
  warnings.push(...repartido.warnings);
  return { errors, warnings, usados, medicao: { medida, motivo, marcas, naoMedidos: fora } };
}

// ---------------------------------------------------------------------------------------------
// TEXTO-NA-MARCA
// ---------------------------------------------------------------------------------------------
//
// O QUE ELA MEDE: o texto que tem a marca INTEIRA por baixo mede 4,5:1 contra ESSA MARCA, nos dois
// temas, IGNORANDO o halo. A ROT-6 é literal, "--text-primary sobre as categóricas mede de 1,53:1 a
// 3,37:1 e é proibido", e a ROT-7b decide o caso: "o texto tem a marca inteira por baixo? Se tem,
// vazado e SEM halo; se atravessa, cor de texto e COM halo".
//
// POR QUE ELA EXISTE, E POR QUE A CONTRASTE-TEXTO NÃO A SUBSTITUI. A CONTRASTE-TEXTO resolve o fundo
// pela geometria, e a geometria inclui o halo da ROT-7, que é tinta da superfície pintada por baixo do
// glifo. Quando o halo existe, ela mede o texto contra O HALO, e está certa em fazê-lo: sobre linha de
// grade e sobre marca fina, o halo É o fundo que o olho vê. Só que o halo composto sobre a marca dá um
// número altíssimo, e o defeito atravessa o portão pela porta da frente: em
// `06_pizza/01_pizza-simples/v1` o percentual em --text-primary mede 1,53:1 no escuro e 2,99:1 no claro
// CONTRA A FATIA, e 14,53:1 e 17,96:1 contra o halo. O check saía verde nas duas leituras.
//
// A MEDIÇÃO É ADICIONAL, NUNCA SUBSTITUTA, e o número que decidiu isso está aqui: se a CONTRASTE-TEXTO
// simplesmente parasse de compor o halo, ela passaria a reprovar 18 versões do acervo, das quais 10 têm
// a marca inteira por baixo (defeito) e 8 têm a tinta CRUZANDO a borda de uma área, com cobertura do
// fundo dominante entre 0,50 e 0,97 (ROT-7 funcionando como escrita). Trocar uma medida pela outra
// consertaria 10 e estragaria 8. As duas convivem porque perguntam coisas diferentes: "o que o olho vê
// atrás desta tinta" é a CONTRASTE-TEXTO; "esta tinta tem uma marca inteira por baixo, e ela é legível
// sem o halo" é esta.
//
// O DISCRIMINADOR É GEOMÉTRICO, e é o que separa o defeito do caso legítimo: o fundo resolvido sem o
// halo tem de ser UM SÓ em toda a caixa de tinta, isto é cobertura 1,00. Tinta que cruza fronteira sai
// com dois fundos ou mais e não é julgada aqui, porque ali o halo é a resposta certa da ROT-7 e quem
// mede é a CONTRASTE-TEXTO. Medido no acervo em 2026-09-29: das 202 leituras de trecho-tema abaixo do
// piso sem o halo na conta, 167 são de fundo único, em 10 versões, e 35 cruzam fronteira, em 7 versões.
// Nenhuma das 167 estava sem halo, o que quer dizer que a classe inteira é escape por halo: sem o
// escape, a CONTRASTE-TEXTO já reprovaria as dez desde o primeiro dia.
//
// O CRITÉRIO DE CONTENÇÃO É O MESMO DA CONTRASTE-MARCA, e mora em `contencao.mjs` por isso. Lá a FORMA
// é isentada porque tem texto por cima; aqui o TEXTO é julgado contra a forma de baixo. É a mesma
// pergunta virada do avesso, e duas cópias dela divergiriam na primeira emenda, deixando um defeito sem
// nenhuma guarda. A forma que contém a caixa entra na mensagem com a fração da tela que ela ocupa,
// porque é isso que diz ao produtor se o que está por baixo é marca de dado ou fundo de painel.
//
// O QUE PASSA, e este é o falso positivo que mais custaria se a guarda o cometesse: texto sobre marca
// cuja cor ALCANÇA o piso não é defeito, e a régua inverte conforme o preenchimento. Sobre as
// categóricas e as semânticas os legíveis são o vazado em --surface-raised e o --accent-cyan-contrast;
// sobre a rampa a coisa vira, e --text-primary passa em --seq-1 a --seq-3. A guarda não precisa dessa
// tabela para decidir, porque mede a cor de fato desenhada, mas a usa na MENSAGEM para dizer qual cor
// resolveria: ela vem de `medirTextoSobreMarca`, no mesmo lugar de onde o dossiê a imprime, para as
// duas nunca divergirem. No acervo de 2026-09-29 são 45 versões com texto contido em marca e todas as
// leituras acima do piso, contra 10 versões abaixo.
//
// OS DOIS TEMAS, cada um no seu arquivo, e a mensagem diz os dois números. No claro as categóricas
// escurecem e o mesmo par sobe de 1,53:1 para 2,99:1: continua reprovando, com outro número.
//
// ERRO, com fila de dívida. O piso é o da ACE-3 e da WCAG 2.1 AA, e a ROT-6 escreve a proibição por
// extenso, então não há faixa de aviso. A fila existe porque a guarda nasce num acervo que já carrega
// dez versões com o defeito.
//
// NÃO MEDIDA, sempre com motivo, nunca calada: os motivos do leitor de `colisao.mjs` (`sem_preview`,
// `preview_com_transform`, `preview_com_escala`, `preview_com_atributo_cego`), `texto_em_html` (o texto
// mora em `foreignObject` e a posição depende do fluxo do navegador) e `sem_texto_sobre_fundo` quando
// nenhum trecho fica sobre fundo resolvido. E trecho a trecho, dentro de uma versão medida, o que saiu
// vai contado em `medicao.naoMedidos`, por tema e por motivo, `tinta_cruza_fundo` inclusive.
//
// PONTOS CEGOS DECLARADOS: a caixa de tinta é a estimada por `colisao.mjs`, com o erro do cabeçalho de
// lá; gradiente e padrão saem como fundo incerto; e o `stroke` de forma não entra no fundo, o que aqui
// é o recorte certo, porque marca de traço é justamente o caso em que a ROT-7 manda pôr halo.
//
// ESCAPE de arquivo, como a CONTRASTE-TEXTO e a CONTRASTE-MARCA: a medida não tem linha de código a
// apontar, então `// check-ok: TEXTO-NA-MARCA motivo` em qualquer linha do Chart.tsx vale para o arquivo.

/** Piso de texto da ACE-3 e da WCAG 2.1 (1.4.3, AA). O mesmo da CONTRASTE-TEXTO, de propósito. */
const NAMARCA_PISO = 4.5;
/**
 * O nome do token de uma cor de MARCA, preferindo os nomes que a matriz de pares conhece.
 *
 * Existe porque três tokens do Farol compartilham hexadecimal: `--chart-1` repete `--accent-cyan`,
 * `--chart-3` repete `--info`, `--chart-2` repete `--warning` e `--chart-4` repete `--positive`. A
 * busca crua devolvia `--accent-cyan` para a fatia de pizza, e aí a linha da matriz não existia e a
 * mensagem saía sem dizer qual cor de texto resolveria, justamente na parte mais útil dela.
 */
function nomeDaCorDeMarca(cor, tabela) {
  const soMarcas = new Map([...tabela].filter(([nome]) => CORES_DE_MARCA.includes(nome)));
  return nomeDoToken(cor, soMarcas) ?? nomeDoToken(cor, tabela);
}
/** Quantos pares a mensagem descreve antes de resumir. */
const NAMARCA_NA_MENSAGEM = 3;

/**
 * Mede um preview: devolve `{ motivo }` ou `{ achados, medidos, foraPorMotivo, pior }`.
 * `tabela` é a tabela de tokens daquele tema, e serve só para nomear a cor na mensagem.
 */
function textoNaMarcaDoArquivo(arquivo, tabela) {
  if (!fs.existsSync(arquivo)) return { motivo: 'sem_preview' };
  const bruto = fs.readFileSync(arquivo, 'utf8');
  const { linhas, temTransform, temEscala, temAtributoCego } = lerLinhasDeTexto(bruto);
  if (temTransform) return { motivo: 'preview_com_transform' };
  if (temEscala) return { motivo: 'preview_com_escala' };
  if (temAtributoCego) return { motivo: 'preview_com_atributo_cego' };
  if (!linhas.length) return { motivo: /<foreignObject/.test(bruto) ? 'texto_em_html' : 'sem_texto' };
  const { formas, temTransform: formaGirada } = lerFundos(bruto);
  if (formaGirada) return { motivo: 'preview_com_transform' };
  // A tela da peça é o denominador da fração que a mensagem imprime, o mesmo denominador que a peneira
  // de área da CONTRASTE-MARCA passou a usar em 2026-09-28: é a tela que define o que é grande.
  const raiz = /<svg[^>]*\bwidth="([\d.]+)"[^>]*\bheight="([\d.]+)"/.exec(bruto);
  const areaDaTela = raiz ? Number(raiz[1]) * Number(raiz[2]) : NaN;

  const achados = [];
  const foraPorMotivo = new Map();
  const fora = (motivo) => foraPorMotivo.set(motivo, (foraPorMotivo.get(motivo) ?? 0) + 1);
  let medidos = 0;
  let pior = null;
  for (const linha of linhas) {
    for (const seg of linha.segmentos) {
      const corTexto = lerCor(seg.pintura);
      if (corTexto === null || corTexto === 'incerto') {
        fora(corTexto === null ? 'texto_sem_cor' : 'texto_com_cor_incerta');
        continue;
      }
      const caixa = { x0: seg.x0, x1: seg.x1, y0: seg.y0, y1: seg.y1 };
      // SEM o halo na conta: é a marca que interessa aqui, e o halo é justamente o que a esconde.
      const fundos = fundosDaCaixa(formas, caixa, null);
      const dominante = fundos[0] ?? null;
      if (!dominante || dominante.cor === null) {
        fora('sem_fundo');
        continue;
      }
      if (dominante.incerto) {
        fora('fundo_incerto');
        continue;
      }
      // Fundo único em toda a caixa é a tradução geométrica da pergunta da ROT-7b. Dois fundos querem
      // dizer que a tinta cruza fronteira, e ali o halo é a regra e não o defeito.
      if (fundos.length > 1) {
        fora('tinta_cruza_fundo');
        continue;
      }
      medidos += 1;
      const razao = razaoDeContraste(corTexto, dominante.cor);
      if (pior === null || razao < pior) pior = razao;
      if (razao >= NAMARCA_PISO) continue;
      const corHalo = seg.halo ? lerCor(seg.halo.pintura) : null;
      const halo = corHalo && corHalo !== 'incerto' && (seg.halo.espessura ?? 0) >= HALO_MINIMO ? { cor: corHalo } : null;
      const comHalo = halo ? fundosDaCaixa(formas, caixa, halo)[0] ?? null : null;
      const razaoComHalo = comHalo && comHalo.cor !== null && !comHalo.incerto ? razaoDeContraste(corTexto, comHalo.cor) : null;
      // A menor forma que contém a caixa, só para a mensagem dizer o que está por baixo do rótulo.
      let container = null;
      for (const forma of formas) {
        if (!formaConteCaixa(forma, caixa)) continue;
        const area = forma.bbox ? (forma.bbox.x1 - forma.bbox.x0) * (forma.bbox.y1 - forma.bbox.y0) : Infinity;
        if (container === null || area < container.area) container = { nome: forma.nome, area };
      }
      achados.push({
        texto: seg.texto,
        fonte: seg.fonte,
        peso: seg.peso,
        razao,
        razaoComHalo,
        comHalo: Boolean(halo),
        corTexto,
        nomeDoTexto: nomeDoToken(corTexto, tabela),
        corMarca: dominante.cor,
        nomeDaMarca: nomeDaCorDeMarca(dominante.cor, tabela),
        forma: container?.nome ?? null,
        fracaoDaTela: container && Number.isFinite(areaDaTela) && Number.isFinite(container.area) ? container.area / areaDaTela : null,
      });
    }
  }
  return { achados, medidos, foraPorMotivo, pior };
}

/** Mede a ROT-6 e a ROT-7b nos dois temas. `rel` é o caminho da versão, para a fila de dívida. */
export function guardaTextoNaMarca(versionAbs, escapes, rel) {
  const errors = [];
  const warnings = [];
  const usados = [];
  const rotulo = `${path.basename(path.dirname(versionAbs))}/${path.basename(versionAbs)}`;
  const naoMedida = (motivo, naoMedidos = null) => ({ errors, warnings, usados, medicao: { medida: false, motivo, temas: null, trechos: null, pior: null, naoMedidos } });
  const temas = lerTokensDoFarol();
  const escuro = textoNaMarcaDoArquivo(path.join(versionAbs, 'preview.svg'), temas.dark);
  if (escuro.motivo === 'sem_preview') return naoMedida('sem_preview');
  const claro = textoNaMarcaDoArquivo(path.join(versionAbs, 'preview-claro.svg'), temas.light);
  const medidos = [['escuro', escuro], ['claro', claro]].filter(([, r]) => r.motivo === undefined && r.medidos > 0);
  if (!medidos.length) {
    // A VERSÃO EM QUE NENHUM TRECHO FOI MEDIDO ainda tem de dizer POR QUÊ, e o motivo mais informativo
    // é o que mais apareceu trecho a trecho: uma peça cujos rótulos todos cruzam fronteira sai com
    // `tinta_cruza_fundo`, que é a verdade, e não com o `sem_texto_sobre_fundo` genérico, que leria
    // como se não houvesse texto sobre marca nenhuma.
    const contados = [...(escuro.foraPorMotivo ?? new Map())].sort((a, b) => b[1] - a[1]);
    const detalhe = contados.length ? Object.fromEntries(contados.map(([motivo, n]) => [`escuro:${motivo}`, n])) : null;
    return naoMedida(escuro.motivo ?? contados[0]?.[0] ?? 'sem_texto_sobre_fundo', detalhe);
  }

  const arred = (n) => Number(n.toFixed(2));
  const num = (n) => arred(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const naoMedidos = {};
  for (const [tema, r] of medidos) {
    for (const [motivo, n] of r.foraPorMotivo) naoMedidos[`${tema}:${motivo}`] = n;
  }
  const medicao = {
    medida: true,
    motivo: null,
    temas: medidos.map(([tema]) => tema),
    trechos: escuro.medidos ?? null,
    pior: medidos.reduce((p, [, r]) => (r.pior !== null && (p === null || r.pior < p) ? r.pior : p), null),
    naoMedidos,
  };
  if (medicao.pior !== null) medicao.pior = arred(medicao.pior);

  // UMA MENSAGEM POR PAR de cor de texto e de preenchimento, porque é o par que se conserta: trocar a
  // cor do rótulo sobre uma fatia resolve todas as fatias daquela cor de uma vez. Agrupar por trecho
  // daria 19 mensagens numa versão de sunburst e nenhuma decisão nova; agrupar por versão esconderia o
  // par novo que aparecesse depois, e a fila de dívida existe justamente para pegar o que CRESCE.
  const porPar = new Map();
  for (const [tema, r] of medidos) {
    for (const achado of r.achados) {
      const chave = `${achado.nomeDoTexto ?? corEmTexto(achado.corTexto)}|${achado.nomeDaMarca ?? 'preenchimento sem token'}`;
      const atual = porPar.get(chave) ?? { ...achado, porTema: new Map(), trechos: new Set() };
      atual.trechos.add(achado.texto);
      const antes = atual.porTema.get(tema);
      if (!antes || achado.razao < antes.razao) {
        atual.porTema.set(tema, { tema, razao: achado.razao, razaoComHalo: achado.razaoComHalo, vezes: (antes?.vezes ?? 0) + 1 });
      } else {
        antes.vezes += 1;
      }
      if (achado.razao < atual.razao) atual.razao = achado.razao;
      porPar.set(chave, atual);
    }
  }
  const pares = [...porPar.values()].sort((a, b) => a.razao - b.razao);

  const matriz = medirTextoSobreMarca(NAMARCA_PISO);
  const saidas = (nomeDaMarca) => {
    const linha = nomeDaMarca ? matriz?.linhas.find((l) => l.fundo === nomeDaMarca) : null;
    if (!linha) return '';
    if (!linha.aprovados.length) {
      return ` Sobre ${nomeDaMarca} NENHUM dos textos do Farol alcança o piso nos dois temas, então aqui a saída não é cor: o número sai de dentro da marca ou a marca muda de cor.`;
    }
    return ` Sobre ${nomeDaMarca} os textos que alcançam o piso nos dois temas são ${linha.aprovados.join(' e ')}.`;
  };
  const descreve = (par) => {
    const nomes = [...par.porTema.values()]
      .map((t) => `${num(t.razao)}:1 no ${t.tema}${t.razaoComHalo === null ? '' : ` (contra o halo dava ${num(t.razaoComHalo)}:1)`}`)
      .join(' e ');
    const quem = `${par.nomeDoTexto ?? corEmTexto(par.corTexto)} sobre ${par.nomeDaMarca ?? corEmTexto(par.corMarca)}`;
    const onde = par.forma === null
      ? ', sem uma forma única que contenha a caixa de tinta'
      : `, dentro de um <${par.forma}>${par.fracaoDaTela === null ? '' : ` de ${num(par.fracaoDaTela * 100)}% da tela`}`;
    const quantos = par.trechos.size > 1 ? `, em ${par.trechos.size} rótulos` : '';
    return `${quem} mede ${nomes}${onde}${quantos}, no rótulo "${[...par.trechos][0].slice(0, 20)}" de ${arred(par.fonte)} px`;
  };

  const mensagens = pares.map(
    (par) =>
      `preview.svg TEXTO-NA-MARCA: em ${rotulo} o texto tem a marca INTEIRA por baixo e fica abaixo do piso de ${num(NAMARCA_PISO)}:1 da ACE-3 contra ela. ` +
      `${descreve(par)}. ` +
      (par.comHalo
        ? 'O halo da ROT-7 está aí, e é por isso que a CONTRASTE-TEXTO aprovou: ela resolve o fundo pela geometria, o halo é tinta da superfície pintada sob o glifo, então ela mediu o halo e não a marca. ' +
          'A ROT-7b decide o caso com uma pergunta: o texto tem a marca inteira por baixo? Tem, e então é vazado em var(--surface-raised) e SEM halo, porque a marca já é o segundo fundo e o halo não tem o que separar. '
        : 'A ROT-6 é literal nisto: --text-primary sobre as categóricas mede de 1,53:1 a 3,37:1 e é proibido. ') +
      `${saidas(par.nomeDaMarca)}`.trimStart() +
      ' O outro caminho é o da ROT-2, com o rótulo fora da marca, em --text-secondary sobre o cartão. ' +
      'Os dois temas estão na medida acima e o veredito é do pior deles, porque a ACE-3 vale nos dois: ' +
      'a mesma categórica escurece no tema claro, o que muda o número e não a leitura.',
  );

  if (escapes.codigos.has('TEXTO-NA-MARCA')) {
    if (mensagens.length) usados.push(`TEXTO-NA-MARCA silenciado por comentário check-ok (${mensagens.length} mensagem(ns))`);
  } else {
    const repartido = repartirPelaFila(rel, 'TEXTO-NA-MARCA', mensagens);
    errors.push(...repartido.errors);
    warnings.push(...repartido.warnings);
  }
  return { errors, warnings, usados, medicao };
}

// ---------------------------------------------------------------------------------------------
// RAIO-CONTRA-AREA
// ---------------------------------------------------------------------------------------------
//
// O QUE ELA MEDE: a ÁREA de cada fatia, anel, setor e bolha do `preview.svg` contra o valor que a marca
// carrega no `data.ts`, em participação. É a conferência que a GEO-3 manda fazer à mão ("confira somando
// a área desenhada de cada marca e comparando com a participação de cada valor"), feita pela ferramenta.
//
// POR QUE ELA EXISTE. A GEO-3 tem duas formas erradas, e a segunda tem a raiz quadrada escrita no código
// e passa por conserto feito. O README de `06_pizza/05_pizza-de-raio-variavel` registrou o custo: a v1
// usa `rMin + (rMax − rMin) × √(v/topo)`, "nenhuma guarda do `check` mede raio contra área, então a peça
// passa verde", e a irmã foi aprovada assim. A rosa de `07/07 v1` ficou no mesmo estado até 2026-09-28.
//
// COMO ELA DECIDE, em `area.mjs`. As marcas viram grupos (setores de mesmo centro, pizzas inteiras de raio
// diferente, bolhas de um mesmo `<svg>`) e cada grupo é comparado, por posto, com os vetores numéricos do
// `data.ts`, à procura da LEI que o desenho segue. `area` (proporcional) e `area_com_piso` (área afim
// com piso não negativo, em marca sem furo, que a GEO-3 aceita: "área em px² com piso e teto declarados")
// passam. `raio_linear` (o raio, ou a espessura do anel, em linha com o valor) e `meia_raiz` (a raiz do
// lado de fora do raio mínimo) reprovam, e a mensagem dá o estrago em pontos percentuais. Grupo sem lei
// reconhecida NÃO É JULGADO: sai contado, com motivo. A guarda só reprova o que reconhece, de propósito,
// porque casar marca com valor por posto não prova qual campo do dado a peça quis desenhar.
//
// PISO: 0,01 p.p. entre a participação em área e a do valor. Reprova raio em linha com o valor e meia
// correção (`rMin + k·√v`); área com piso passa em marca sem furo.
//
// DE ONDE VEM A TOLERÂNCIA. É medida, não escolhida: nas 60 leituras de grupo do acervo de 2026-10-02 em
// que a lei certa cabe, o maior desvio é 0,0007 p.p. (`09/03 v4`, 13 bolhas), e a lei errada mais discreta
// do acervo, a coluna radial de 365 marcas de `07/06 v3`, desvia 0,038 p.p. A GEO-3 escreve a mesma régua
// em palavras: "as duas listas batem na casa dos centésimos de ponto". Com 0,05 a `07/06 v3` passaria
// por área proporcional sem ser. O veredito não muda entre 0,002 e 0,2: é sempre a mesma peça acusada.
//
// O FURO DE MAIS DE MEIO RAIO É DA GEO-5, NÃO DESTA GUARDA. Coluna radial e barra radial codificam por
// comprimento, e a GEO-5 escreve a saída: "o círculo interno ocupa mais da metade do raio, o que contém o
// efeito". Num grupo assim o raio em linha com o valor é o desenho declarado, e a guarda não o acusa;
// sem esta saída ela reprovaria `07/06 v1`, que desvia 0,60 p.p. e está certa pela régua dela.
//
// ERRO, com fila de dívida. O número vem da régua e é medido, então reprova. A fila existe porque a
// guarda nasce com uma peça aprovada que carrega o defeito, `06/05 v1`.
//
// OS MOTIVOS DE NÃO MEDIÇÃO, um a um: `sem_preview`; `sem_marca_de_area` (nenhuma fatia, setor ou círculo
// com preenchimento, ou todos do mesmo tamanho); `sem_dado` (o `data.ts` não abre); `valor_nao_casado`
// (nenhum vetor do `data.ts` explica o grupo: valor que nasce de conta no `Chart.tsx`, recorte por filtro,
// marca cortada no teto da escala, legenda de mais de três círculos); e `comprimento_radial` (o furo da
// GEO-5). Dentro de uma versão medida, o grupo que ficou de fora sai em `medicao.naoMedidos`.
//
// PONTOS CEGOS DECLARADOS: setor com `cornerRadius` e forma que não é arco de círculo não são lidos; o
// raio arredondado ao pixel pelo layout (`06/06 v1`, com a margem padrão do `PieChart`) não fecha em
// lei nenhuma e sai `valor_nao_casado`; e a comparação ENTRE anéis concêntricos é a GEO-5.

/** Tolerância, em pontos percentuais, entre a participação em área e a participação do valor. */
const AREA_TOLERANCIA = 0.01;
/** GEO-5: furo acima desta fração do raio de fora faz do grupo coluna radial, lida por comprimento. */
const AREA_FURO = 0.5;

/** O que cada lei errada da GEO-3 quer dizer, na frase da mensagem. */
const AREA_LEIS_ERRADAS = {
  raio_linear: 'o RAIO cresce em linha com o valor, e a área cresce com o quadrado dele',
  meia_raiz: 'a raiz quadrada está escrita, mas do lado de fora do raio mínimo (`rMin + k·√v`), que é a meia correção da GEO-3',
};

/** Mede a GEO-3 no `preview.svg` contra o `data.ts`. `rel` é o caminho da versão, para a fila de dívida. */
export function guardaRaioContraArea(versionAbs, escapes, rel) {
  const errors = [];
  const warnings = [];
  const usados = [];
  const rotulo = `${path.basename(path.dirname(versionAbs))}/${path.basename(versionAbs)}`;
  // O detalhe por grupo só existe depois da medição; antes dela a versão sai só com o motivo.
  let detalhe = { grupos: null, medidos: null, naoMedidos: null };
  const naoMedida = (motivo) => ({ errors, warnings, usados, medicao: { medida: false, motivo, pior: null, ...detalhe } });
  const arquivo = path.join(versionAbs, 'preview.svg');
  if (!fs.existsSync(arquivo)) return naoMedida('sem_preview');
  const marcas = lerMarcasDeArea(fs.readFileSync(arquivo, 'utf8'));
  if (!marcas.setores.length && !marcas.circulos.length) return naoMedida('sem_marca_de_area');
  const dado = path.join(versionAbs, 'data.ts');
  const { vetores, erro } = fs.existsSync(dado) ? lerVetoresDoDado(fs.readFileSync(dado, 'utf8')) : { vetores: [], erro: 'data.ts ausente' };
  const { grupos } = medirAreaContraValor(marcas, vetores, { tolerancia: AREA_TOLERANCIA, furoDeColunaRadial: AREA_FURO });
  if (!grupos.length) return naoMedida('sem_marca_de_area');
  if (erro || !vetores.length) return naoMedida('sem_dado');

  const comLei = grupos.filter((g) => g.lei);
  const naoMedidos = {};
  for (const g of grupos) if (!g.lei) naoMedidos[g.motivo] = (naoMedidos[g.motivo] ?? 0) + 1;
  detalhe = { grupos: grupos.length, medidos: comLei.length, naoMedidos };
  if (!comLei.length) return naoMedidos.valor_nao_casado ? naoMedida('valor_nao_casado') : naoMedida('comprimento_radial');

  const num = (n, casas = 2) => n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  const medicao = { medida: true, motivo: null, ...detalhe, pior: Number(Math.max(...comLei.map((g) => g.desvio)).toFixed(4)) };
  // UMA MENSAGEM POR GRUPO, porque é o grupo que se conserta: a função de raio é uma só para todas as
  // marcas dele. E é o grupo que a fila de dívida conta, para pegar a segunda pizza errada que aparecer.
  const mensagens = comLei
    .filter((g) => AREA_LEIS_ERRADAS[g.lei])
    .map(
      (g) =>
        `preview.svg RAIO-CONTRA-AREA: em ${rotulo}, nos ${g.onde}, ${AREA_LEIS_ERRADAS[g.lei]}. ` +
        `Casada com \`${g.vetor}\` do data.ts, a marca de valor ${num(g.pior.valor, 0)} tem ${num(g.pior.partValor)}% do total e desenha ` +
        `${num(g.pior.partArea)}% da área${g.pior.acimaDoPiso ? ' acima do piso' : ''}: desvio de ${num(g.desvio)} p.p., contra a tolerância de ${num(AREA_TOLERANCIA)}. ` +
        'A GEO-3 dá a forma que fecha a conta: `Math.sqrt(rMin² + (rMax² − rMin²) * v / topo)`, que sem raio mínimo é `rMax * Math.sqrt(v / topo)`. ' +
        'Depois do conserto a área de cada marca bate com a participação do valor na casa dos centésimos de ponto.',
    );

  if (escapes.codigos.has('RAIO-CONTRA-AREA')) {
    if (mensagens.length) usados.push(`RAIO-CONTRA-AREA silenciado por comentário check-ok (${mensagens.length} mensagem(ns))`);
  } else {
    const repartido = repartirPelaFila(rel, 'RAIO-CONTRA-AREA', mensagens);
    errors.push(...repartido.errors);
    warnings.push(...repartido.warnings);
  }
  return { errors, warnings, usados, medicao };
}
