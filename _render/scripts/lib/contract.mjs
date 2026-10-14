/**
 * As regras do CONTRATO.md que dá para verificar sem navegador: nomes, arquivos, imports, cor,
 * determinismo, acessibilidade mínima, escrita e READMEs.
 *
 * O código é lido pela árvore sintática do TypeScript, não por expressão regular sobre o texto:
 * comentário não conta como import, e `url(#grad)` dentro de template não vira cor hexadecimal.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import {
  guardaAgregacaoZero,
  guardaColisaoTexto,
  guardaContrasteMarca,
  guardaContrasteTexto,
  guardaEixoCalmo,
  guardaOpacidadeMarca,
  guardaTextoNaMarca,
  guardaEspessuraMarca,
  guardaFormatoAcessivel,
  guardaFraseAcessivel,
  guardaMarcaMeta,
  guardaReguaConstante,
  guardaTamanhoTexto,
  guardasDeCodigo,
  lerEscapes,
} from './guardas.mjs';
import { LIB_FILES, knownTokens, libHash, readMeta, readPreviewStamps, sourceHash, tokensHash } from './meta.mjs';
import { NAME_PATTERNS, VALID_PREFIXES, VISUAIS_DIR, splitVersion } from './paths.mjs';

const require = createRequire(import.meta.url);
const ts = require('typescript');

/**
 * Imports permitidos no Chart.tsx. `'*'` libera qualquer nome exportado; lista fecha os nomes.
 * A justificativa de cada entrada está no CONTRATO.md, seção "Imports permitidos".
 */
export const ALLOWED_CHART_IMPORTS = {
  react: '*',
  recharts: '*',
  'lucide-react': '*',
  '@/lib/format': [
    'formatInt',
    'formatDecimal',
    'formatCurrency',
    'formatCurrencyCompact',
    'formatCurrencyAxis',
    'formatPercent',
    // F0.5c (2026-10-02): o nome honesto da escala de 0 a 100. O antigo fica liberado porque o
    // acervo o chama e trocar o nome num Chart.tsx derrubaria o veredito da peça por nada.
    'formatPercentFromScale100',
    'formatPercentPoints',
    'formatDate',
    'formatMonthShort',
    'formatMonthLong',
    'formatDays',
    'formatHours',
    'formatRateWithVolume',
    'formatUnavailable',
  ],
  '@/lib/utils': ['cn'],
  '@/components/visuals/valueFormat': ['formatValue', 'formatAxisLabel', 'axisValueFormat', 'ValueFormat'],
  '@/components/visuals/charts/ChartTooltip': ['ChartTooltip', 'ChartTooltipProps'],
  '@/components/visuals/charts/chartTheme': [
    'CHART_SERIES_COLORS',
    'CHART_SEQUENTIAL_COLORS',
    'seriesColor',
    'AXIS_COLOR',
    'GRID_COLOR',
    'CURSOR_COLOR',
    'AXIS_PROPS',
    'CHART_ANIMATION_MS',
    'useAnimateOnce',
  ],
  './data': '*',
};

export const README_MODEL_SECTIONS = [
  'O que é',
  'Quando usar',
  'Quando evitar',
  'Anatomia',
  'Versões',
  'Como colar no Farol',
  'Referências',
];

const CSS_NAMED_COLORS = new Set(
  'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'.split(' '),
);

const TW_PALETTE = 'white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|mauve|olive|mist|taupe';
const TW_COLOR_UTILS = 'bg|text|border(?:-[trblxy])?|fill|stroke|ring|ring-offset|outline|divide|from|via|to|shadow|accent|caret|decoration|placeholder|inset-shadow|inset-ring';
const TW_PALETTE_CLASS = new RegExp(`(?:^|[\\s:"'\`])(?:${TW_COLOR_UTILS})-(?:${TW_PALETTE})(?:-\\d{2,3})?(?:\\/\\d+)?(?=$|[\\s"'\`])`);
/** Tokens que existem como variável mas NÃO viram utilitário Tailwind no Farol (sem `--color-*`). */
const TW_TOKEN_TRAP = /(?:^|[\s:"'`])(?:bg|text|border|fill|stroke|ring|from|via|to|outline|decoration)-(?:seq-\d|accent-amber(?:-soft|-contrast)?|accent-cyan(?:-soft|-contrast)?)(?:\/\d+)?(?=$|[\s"'`])/;
const HEX_COLOR = /(^|[^\w&/-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/;
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\s*\(/i;
const SENTENCE_DASH = /\S\s[-–—]\s\S|[–—]/;
/** Texto JSX é cortado nas chaves: " - ok - " entre duas expressões também é separador. */
const JSX_DASH = /(?:^|\S)\s+[-–—]\s+(?:\S|$)|[–—]/;

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function textOfLiteral(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) return node.text;
  if (ts.isJsxText(node)) return node.text;
  return null;
}

function colorProblem(text) {
  const withoutUrls = text.replace(/url\(\s*["']?#[^)"']*["']?\s*\)/g, 'url()');
  if (HEX_COLOR.test(withoutUrls)) return 'cor hexadecimal solta';
  if (COLOR_FUNCTION.test(withoutUrls)) return 'cor em função (rgb, hsl, oklch...) solta';
  if (CSS_NAMED_COLORS.has(text.trim().toLowerCase())) return `cor nomeada "${text.trim()}" solta`;
  if (TW_PALETTE_CLASS.test(text)) return 'classe da paleta padrão do Tailwind (use utilitário de token do Farol)';
  return null;
}

function findDefaultExport(sourceFile) {
  let found = null;
  const locals = new Map();
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) locals.set(statement.name.text, statement);
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.initializer) locals.set(decl.name.text, decl.initializer);
      }
    }
  }
  for (const statement of sourceFile.statements) {
    const modifiers = ts.canHaveModifiers(statement) ? (ts.getModifiers(statement) ?? []) : [];
    const isDefault = modifiers.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
    if (ts.isFunctionDeclaration(statement) && isDefault) found = statement;
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      const expr = statement.expression;
      found = ts.isIdentifier(expr) ? (locals.get(expr.text) ?? expr) : expr;
    }
  }
  if (found && ts.isCallExpression(found) && found.arguments[0]) {
    // memo(Component) ou forwardRef(...): olha o primeiro argumento.
    const inner = found.arguments[0];
    found = ts.isIdentifier(inner) ? (locals.get(inner.text) ?? inner) : inner;
  }
  return found;
}

/**
 * Verifica um arquivo de código da versão. `kind` é 'chart' ou 'data'.
 * Devolve também `escapes`: os comentários `// check-ok: CODIGO motivo` que silenciaram alguma das
 * guardas de conteúdo (ver guardas.mjs), para o relatório contar quantos estão em uso.
 */
export function checkSource(file, kind) {
  const errors = [];
  const warnings = [];
  const escapes = [];
  const rel = path.basename(file);
  if (!fs.existsSync(file)) return { errors, warnings, escapes };
  const text = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, kind === 'chart' ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const tokens = knownTokens();
  const at = (node) => `${rel}:${lineOf(sourceFile, node)}`;
  let importsData = false;
  const jsxAttributes = new Set();

  const checkImport = (node, specifier, names) => {
    if (kind === 'data') {
      errors.push(`${at(node)} data.ts não importa nada (dado fixo e autocontido): "${specifier}".`);
      return;
    }
    const rule = ALLOWED_CHART_IMPORTS[specifier];
    if (rule === undefined) {
      errors.push(`${at(node)} import fora da lista permitida: "${specifier}". Ver CONTRATO.md, Imports permitidos.`);
      return;
    }
    if (specifier === './data') importsData = true;
    if (rule !== '*') {
      if (names === null) {
        errors.push(`${at(node)} "${specifier}" só aceita import nomeado (${rule.join(', ')}).`);
        return;
      }
      for (const name of names) {
        if (!rule.includes(name)) errors.push(`${at(node)} "${name}" de "${specifier}" não está liberado. Liberados: ${rule.join(', ')}.`);
      }
    }
  };

  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      let names = [];
      if (!clause) {
        errors.push(`${at(node)} import de efeito colateral proibido: "${node.moduleSpecifier.text}".`);
      } else {
        if (clause.name) names = null;
        if (clause.namedBindings) {
          if (ts.isNamespaceImport(clause.namedBindings)) names = null;
          else if (names) names = clause.namedBindings.elements.map((el) => (el.propertyName ?? el.name).text);
        }
        const typeOnly = clause.isTypeOnly;
        if (!(typeOnly && node.moduleSpecifier.text === './data')) checkImport(node, node.moduleSpecifier.text, names);
        if (node.moduleSpecifier.text === './data') importsData = true;
      }
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      errors.push(`${at(node)} reexport proibido: "${node.moduleSpecifier.text}". Chart.tsx exporta o componente e os próprios tipos.`);
    } else if (ts.isImportEqualsDeclaration(node)) {
      errors.push(`${at(node)} import = require proibido.`);
    } else if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (callee.kind === ts.SyntaxKind.ImportKeyword) errors.push(`${at(node)} import dinâmico proibido.`);
      if (ts.isIdentifier(callee) && callee.text === 'require') errors.push(`${at(node)} require proibido.`);
      if (ts.isIdentifier(callee) && callee.text === 'Date') errors.push(`${at(node)} Date() lê o relógio: dado e desenho precisam ser fixos.`);
      if (ts.isIdentifier(callee) && (callee.text === 'fetch' || callee.text === 'setInterval')) errors.push(`${at(node)} ${callee.text} proibido no catálogo.`);
    }

    if (ts.isPropertyAccessExpression(node)) {
      const full = node.getText(sourceFile).replace(/\s+/g, '');
      if (/^(Math\.random|Date\.now|performance\.now|crypto\.randomUUID|crypto\.getRandomValues)$/.test(full)) {
        errors.push(`${at(node)} ${full} proibido: dado e desenho precisam ser determinísticos.`);
      }
      if (/^console\./.test(full)) warnings.push(`${at(node)} ${full} esquecido.`);
    }
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Date' && (!node.arguments || node.arguments.length === 0)) {
      errors.push(`${at(node)} new Date() sem argumento lê o relógio: use data fixa em texto YYYY-MM-DD.`);
    }

    const literal = textOfLiteral(node);
    if (literal !== null) {
      const problem = colorProblem(literal);
      if (problem) errors.push(`${at(node)} ${problem}: "${literal.trim().slice(0, 60)}". Cor só por token do Farol (var(--token) ou utilitário do tema).`);
      if (TW_TOKEN_TRAP.test(literal)) {
        errors.push(`${at(node)} utilitário Tailwind inexistente no Farol: "${literal.trim().slice(0, 60)}". seq-* e accent-amber/cyan não têm --color-*; use style ou fill com var(--token).`);
      }
      if (/\bInter\b/.test(literal)) errors.push(`${at(node)} a fonte Inter é proibida no Farol.`);
      if (/^https?:\/\//.test(literal.trim())) errors.push(`${at(node)} recurso externo proibido: o preview e o Farol não buscam nada na rede.`);
      for (const match of literal.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
        if (!tokens.has(match[1])) errors.push(`${at(node)} token inexistente no Farol: ${match[1]}.`);
      }
      const isUiText = ts.isJsxText(node) || (ts.isStringLiteral(node) && node.parent && (ts.isJsxAttribute(node.parent) || ts.isJsxExpression(node.parent)));
      const prose = ts.isJsxText(node) || /\s\S+\s/.test(literal);
      const dashed = ts.isJsxText(node) ? JSX_DASH.test(literal) : SENTENCE_DASH.test(literal);
      if ((isUiText || prose) && dashed && !/^[\s\d.,+−-]*$/.test(literal)) {
        errors.push(`${at(node)} hífen, travessão ou meia risca como separador de frase: "${literal.trim().slice(0, 60)}". Use ponto, vírgula, dois pontos ou ponto e vírgula.`);
      }
    }

    if (ts.isPropertyAssignment(node) || ts.isJsxAttribute(node)) {
      const name = node.name.getText(sourceFile);
      if (name === 'fontFamily' || name === 'font-family') {
        const init = ts.isJsxAttribute(node) ? node.initializer : node.initializer;
        const value = init && (ts.isStringLiteral(init) ? init.text : null);
        if (value !== null && value !== undefined && !/^var\(--font-(sans|display|mono)\)$/.test(value.trim())) {
          errors.push(`${at(node)} fontFamily fora dos tokens: use className font-sans/font-display ou var(--font-sans|display).`);
        }
      }
    }
    if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(sourceFile);
      jsxAttributes.add(name);
      if (name === 'dangerouslySetInnerHTML') errors.push(`${at(node)} dangerouslySetInnerHTML proibido.`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  if (kind === 'chart') {
    const component = findDefaultExport(sourceFile);
    if (!component) {
      errors.push(`${rel}: falta export default do componente.`);
    } else if (ts.isFunctionLike(component)) {
      const [first] = component.parameters;
      if (!first) {
        errors.push(`${rel}: o componente não recebe props; a prop data opcional (default do data.ts) é obrigatória.`);
      } else if (!ts.isObjectBindingPattern(first.name)) {
        errors.push(`${rel}: desestruture as props na assinatura, com data = defaultData (ver CONTRATO.md, Anatomia).`);
      } else {
        const dataEl = first.name.elements.find((el) => (el.propertyName ?? el.name).getText(sourceFile) === 'data');
        if (!dataEl) errors.push(`${rel}: a prop data não existe na assinatura.`);
        else if (!dataEl.initializer) errors.push(`${rel}: a prop data precisa de default vindo do data.ts (data = defaultData).`);
      }
    } else {
      warnings.push(`${rel}: não consegui ler a assinatura do export default; confira a prop data manualmente.`);
    }
    if (!importsData) errors.push(`${rel}: não importa o dado de ./data (o default da prop data vem de lá).`);
    if (!jsxAttributes.has('role')) errors.push(`${rel}: nenhum elemento com role (img, figure, group, table...).`);
    if (!jsxAttributes.has('aria-label') && !jsxAttributes.has('aria-labelledby')) {
      errors.push(`${rel}: nenhum aria-label ou aria-labelledby; o visual precisa de nome acessível.`);
    }
    for (const statement of sourceFile.statements) {
      const modifiers = ts.canHaveModifiers(statement) ? (ts.getModifiers(statement) ?? []) : [];
      const exported = modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      const isDefault = modifiers.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
      if (exported && !isDefault && (ts.isVariableStatement(statement) || ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement))) {
        warnings.push(`${rel}:${lineOf(sourceFile, statement)} export de valor além do default; no Farol isso quebra o recarregamento rápido. Exporte só o componente e tipos.`);
      }
    }
  } else {
    const hasData = sourceFile.statements.some((statement) => {
      const modifiers = ts.canHaveModifiers(statement) ? (ts.getModifiers(statement) ?? []) : [];
      return (
        ts.isVariableStatement(statement) &&
        modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
        statement.declarationList.declarations.some((decl) => ts.isIdentifier(decl.name) && decl.name.text === 'data')
      );
    });
    if (!hasData) errors.push(`${rel}: falta export const data (o dado fictício padrão).`);
    if (!/\bfict[íi]ci/i.test(text)) warnings.push(`${rel}: diga no comentário que o dado é fictício e fixo.`);
  }

  // Guardas de conteúdo (emenda E1): MARCA-REAL, NUMERO-CRU e AUSENCIA-LITERAL.
  const guardas = guardasDeCodigo(sourceFile, kind, lerEscapes(text, rel));
  errors.push(...guardas.errors);
  escapes.push(...guardas.usados.map((item) => `${rel}${item}`));
  return { errors, warnings, escapes };
}

/**
 * Os carimbos dos dois previews de UMA versão contra o estado atual: origem, tokens, biblioteca e tema.
 *
 * O PESO DE CADA UM. Origem diferente é ERRO: `Chart.tsx`, `data.ts` ou `meta.json` mudou, e o preview
 * com certeza não é mais o desenho do código. Tokens e biblioteca diferentes são AVISO: o que mudou é
 * compartilhado, e a mudança pode nem alcançar a peça (uma versão que não chama o formatador mexido
 * desenha igual), então o carimbo diz "pode ter envelhecido", e não "envelheceu".
 *
 * BIBLIOTECA (emenda de 2026-10-01). Antes dela, mexer em `format.ts` ou `chartTheme.ts` envelhecia
 * centenas de previews com o `check` verde: 487 das 491 versões importam `@/lib/format` e 349
 * importam `chartTheme`, e nenhum dos dois entrava em carimbo algum. Duas regras de borda:
 *   - preview SEM o atributo é anterior à emenda e NÃO acusa. Ausência é "não medido", e tratar como
 *     "diferente" acenderia o acervo inteiro no dia em que a guarda ligou, sem nada ter mudado;
 *   - o aviso da biblioteca NÃO se esconde atrás do aviso de tokens. Os dois são fatos separados, e
 *     quem conta quantos previews uma mudança de formatador alcançou precisa do número inteiro.
 * Com a origem desatualizada os dois avisos se calam: o erro já manda renderizar de novo.
 *
 * `atual` existe para a prova: o selftest entrega o carimbo de uma cópia temporária da biblioteca com
 * um formatador alterado, que é o contrafactual sem tocar em `app/`.
 */
export function checkPreviewStamps(versionAbs, atual = {}) {
  const errors = [];
  const warnings = [];
  const stampSource = atual.source ?? sourceHash(versionAbs);
  const stampTokens = atual.tokens ?? tokensHash();
  const stampLib = atual.lib ?? libHash();
  for (const [file, theme] of [['preview.svg', 'dark'], ['preview-claro.svg', 'light']]) {
    const stamps = readPreviewStamps(path.join(versionAbs, file));
    if (!stamps) {
      if (file === 'preview.svg') errors.push('preview.svg ausente: rode npm run render -- <caminho>.');
      continue;
    }
    if (stamps.source !== stampSource) {
      errors.push(`${file} desatualizado: Chart.tsx, data.ts ou meta.json mudou depois do render. Rode npm run render.`);
    } else {
      if (stamps.tokens !== stampTokens) warnings.push(`${file} feito com tokens antigos do Farol; rode npm run render para acompanhar.`);
      if (stamps.lib !== null && stamps.lib !== stampLib) {
        warnings.push(
          `${file}: preview desatualizado (biblioteca): a biblioteca compartilhada do Farol (${LIB_FILES.map((rel) => rel.split('/').at(-1)).join(', ')}) ` +
            'mudou depois do render, e o desenho pode ter mudado sem o Chart.tsx mudar. Rode npm run render e confira a imagem.',
        );
      }
    }
    if (stamps.theme !== theme) errors.push(`${file} gravado com tema "${stamps.theme}", esperado "${theme}".`);
  }
  return { errors, warnings };
}

/** Estrutura, arquivos, metadados, carimbo do preview e código de UMA versão. */
export function checkVersion(version) {
  const errors = [];
  const warnings = [];
  const { family, model, version: versionName, prefix } = splitVersion(version.rel);
  if (!VALID_PREFIXES.has(prefix)) {
    errors.push(`Versão fora da estrutura: esperado <NN_familia>/<NN_modelo>/<vN_versao> na raiz de VISUAIS (achado em "${prefix}").`);
  }
  if (!NAME_PATTERNS.family.test(family)) errors.push(`Nome de família inválido: "${family}" (esperado NN_slug-em-minusculas).`);
  if (!NAME_PATTERNS.model.test(model)) errors.push(`Nome de modelo inválido: "${model}" (esperado NN_slug-em-minusculas).`);
  if (!NAME_PATTERNS.version.test(versionName)) errors.push(`Nome de versão inválido: "${versionName}" (esperado vN_slug-em-minusculas).`);

  for (const name of ['Chart.tsx', 'data.ts']) {
    if (!fs.existsSync(path.join(version.abs, name))) errors.push(`${name} ausente.`);
  }
  const allowedFiles = new Set(['Chart.tsx', 'data.ts', 'meta.json', 'preview.svg', 'preview-claro.svg']);
  for (const entry of fs.readdirSync(version.abs, { withFileTypes: true })) {
    if (!allowedFiles.has(entry.name) && !entry.name.endsWith('.tmp')) warnings.push(`Arquivo ou pasta fora do contrato na versão: ${entry.name}.`);
  }

  const meta = readMeta(version.abs);
  errors.push(...meta.errors);
  warnings.push(...meta.warnings);

  const carimbos = checkPreviewStamps(version.abs);
  errors.push(...carimbos.errors);
  warnings.push(...carimbos.warnings);

  const chartFile = path.join(version.abs, 'Chart.tsx');
  const chart = checkSource(chartFile, 'chart');
  const data = checkSource(path.join(version.abs, 'data.ts'), 'data');
  errors.push(...chart.errors, ...data.errors);
  warnings.push(...chart.warnings, ...data.warnings);
  const escapes = [...chart.escapes, ...data.escapes];

  // Guardas de conteúdo que não moram no código: MARCA-REAL no meta.json e ACE-1 no preview.svg.
  const marcaMeta = guardaMarcaMeta(version.abs);
  errors.push(...marcaMeta.errors);
  const chartText = fs.existsSync(chartFile) ? fs.readFileSync(chartFile, 'utf8') : '';
  const frase = guardaFraseAcessivel(version.abs, lerEscapes(chartText, 'Chart.tsx'));
  errors.push(...frase.errors);
  warnings.push(...frase.warnings);
  escapes.push(...frase.usados.map((item) => `Chart.tsx ${item}`));
  // ESP-2 no preview.svg: a espessura efetiva da marca e o piso extra do rótulo desenhado dentro.
  const espessura = guardaEspessuraMarca(version.abs, lerEscapes(chartText, 'Chart.tsx'));
  errors.push(...espessura.errors);
  warnings.push(...espessura.warnings);
  escapes.push(...espessura.usados.map((item) => `Chart.tsx ${item}`));
  // COLISAO-TEXTO no preview.svg: a tinta de cada texto contra a dos outros, na coordenada do cartão.
  const colisao = guardaColisaoTexto(version.abs, lerEscapes(chartText, 'Chart.tsx'));
  errors.push(...colisao.errors);
  warnings.push(...colisao.warnings);
  escapes.push(...colisao.usados.map((item) => `Chart.tsx ${item}`));
  // TIP-2 no preview: o tamanho declarado de cada trecho de texto, no SVG e no HTML do foreignObject.
  const tamanho = guardaTamanhoTexto(version.abs, lerEscapes(chartText, 'Chart.tsx'), version.rel);
  errors.push(...tamanho.errors);
  warnings.push(...tamanho.warnings);
  escapes.push(...tamanho.usados.map((item) => `Chart.tsx ${item}`));
  // ACE-3 nos dois previews: a cor de cada texto contra o que a geometria mostra pintado atrás dele.
  const contraste = guardaContrasteTexto(version.abs, lerEscapes(chartText, 'Chart.tsx'));
  errors.push(...contraste.errors);
  warnings.push(...contraste.warnings);
  escapes.push(...contraste.usados.map((item) => `Chart.tsx ${item}`));
  // EST-1b no código: agregação que devolve zero para lista vazia, lida pela árvore sintática.
  const agregacao = guardaAgregacaoZero(version.abs, version.rel);
  errors.push(...agregacao.errors);
  warnings.push(...agregacao.warnings);
  escapes.push(...agregacao.usados);
  // TOK-1 e TOK-7 nos dois previews: a cor de cada marca de dado contra o fundo do cartão.
  const marca = guardaContrasteMarca(version.abs, lerEscapes(chartText, 'Chart.tsx'), version.rel);
  errors.push(...marca.errors);
  warnings.push(...marca.warnings);
  escapes.push(...marca.usados.map((item) => `Chart.tsx ${item}`));
  // ROT-5b no Chart.tsx: legenda de tamanho cujo último degrau é constante escrita à mão.
  const regua = guardaReguaConstante(version.abs, version.rel);
  errors.push(...regua.errors);
  warnings.push(...regua.warnings);
  escapes.push(...regua.usados);
  // DAD-9 no Chart.tsx: o mesmo número com duas aparências, uma para quem ouve e outra para quem vê.
  const formato = guardaFormatoAcessivel(version.abs, version.rel);
  errors.push(...formato.errors);
  warnings.push(...formato.warnings);
  escapes.push(...formato.usados);
  // EIX-5 no Chart.tsx: eixo que herda do AXIS_PROPS a linha de eixo numa peça que já tem grade.
  const eixo = guardaEixoCalmo(version.abs, version.rel);
  errors.push(...eixo.errors);
  warnings.push(...eixo.warnings);
  escapes.push(...eixo.usados);
  // ACE-5 no Chart.tsx: opacidade em marca que derruba a cor composta abaixo de 3:1 nos dois temas.
  const opacidade = guardaOpacidadeMarca(version.abs, version.rel);
  errors.push(...opacidade.errors);
  warnings.push(...opacidade.warnings);
  escapes.push(...opacidade.usados);
  // ROT-6 e ROT-7b nos dois previews: texto com a marca inteira por baixo, medido contra a marca e não
  // contra o halo, que é por onde o defeito passava pelo portão da CONTRASTE-TEXTO.
  const naMarca = guardaTextoNaMarca(version.abs, lerEscapes(chartText, 'Chart.tsx'), version.rel);
  errors.push(...naMarca.errors);
  warnings.push(...naMarca.warnings);
  escapes.push(...naMarca.usados.map((item) => `Chart.tsx ${item}`));
  // `ace`, `esp`, `col`, `tam`, `con`, `agr`, `mar`, `reg`, `fmt`, `eix`, `opa` e `nam` não são veredito:
  // dizem
  // só se a guarda mediu esta versão, para o check contar à parte.
  return {
    errors,
    warnings,
    escapes,
    agr: agregacao.medicao ?? { medida: false, motivo: 'sem_medicao', graves: null, leves: null },
    mar: marca.medicao ?? { medida: false, motivo: 'sem_medicao', temas: null, marcas: null, pior: null, naoMedidos: null },
    reg: regua.medicao ?? { medida: false, motivo: 'sem_medicao', reguas: null },
    fmt: formato.medicao ?? { medida: false, motivo: 'sem_medicao', divergencias: null },
    eix: eixo.medicao ?? { medida: false, motivo: 'sem_medicao', eixos: null, padrao: null },
    opa: opacidade.medicao ?? { medida: false, motivo: 'sem_medicao', marcas: null, naoMedidos: null },
    ace: frase.medicao ?? { medida: false, motivo: 'sem_medicao', fonte: null, n: null },
    esp: espessura.medicao ?? { medida: false, motivo: 'sem_medicao', fonte: null, espessura: null, espessuraRotulo: null },
    col: colisao.medicao ?? { medida: false, motivo: 'sem_medicao', pares: null, respiroMinimo: null },
    tam: tamanho.medicao ?? { medida: false, motivo: 'sem_medicao', trechos: null, menor: null, semTamanho: null },
    con: contraste.medicao ?? { medida: false, motivo: 'sem_medicao', temas: null, trechos: null, pior: null, naoMedidos: null },
    nam: naMarca.medicao ?? { medida: false, motivo: 'sem_medicao', temas: null, trechos: null, pior: null, naoMedidos: null },
  };
}

function stripAccents(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Prosa do markdown fora de bloco de código, com o número da linha. */
function proseLines(text) {
  const lines = [];
  let fenced = false;
  text.split(/\r?\n/).forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return;
    }
    if (!fenced) lines.push({ line: line.replace(/`[^`]*`/g, '``'), number: index + 1 });
  });
  return lines;
}

function dashProblems(file, text) {
  const problems = [];
  for (const { line, number } of proseLines(text)) {
    const body = line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '').replace(/^\s*\|.*\|\s*$/, (row) => row.replace(/\|\s*:?-{3,}:?\s*/g, '|'));
    if (SENTENCE_DASH.test(body)) problems.push(`${file}:${number} hífen, travessão ou meia risca como separador de frase.`);
  }
  return problems;
}

/**
 * Versões que o catálogo planeja para cada `familia/modelo`. Lido uma vez por processo; se o
 * catálogo não abrir, o check segue calado, porque quem cobra o catálogo inteiro é o `pendencias`.
 */
let catalogoDoModelo = null;
function versoesPlanejadas(modelAbs) {
  if (catalogoDoModelo === null) {
    catalogoDoModelo = new Map();
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(VISUAIS_DIR, '_estudo', 'catalogo.json'), 'utf8'));
      for (const family of raw) {
        for (const model of family.modelos ?? []) {
          catalogoDoModelo.set(`${family.slug}/${model.slug}`, (model.versoes ?? []).map((v) => v.slug));
        }
      }
    } catch {
      catalogoDoModelo = new Map();
    }
  }
  const key = `${path.basename(path.dirname(modelAbs))}/${path.basename(modelAbs)}`;
  return catalogoDoModelo.get(key) ?? [];
}

/** README do modelo: seções obrigatórias, na ordem, e cada versão citada. */
export function checkModelReadme(modelAbs, versionNames) {
  const errors = [];
  const warnings = [];
  const file = path.join(modelAbs, 'README.md');
  const label = `${path.basename(modelAbs)}/README.md`;
  if (!fs.existsSync(file)) return { errors: [`${label} ausente.`], warnings };
  const text = fs.readFileSync(file, 'utf8');
  if (!/^#\s+\S/m.test(text)) errors.push(`${label}: falta o título (# Nome do modelo).`);
  const headings = [...text.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => m[1]);
  const normalized = headings.map(stripAccents);
  let cursor = -1;
  for (const section of README_MODEL_SECTIONS) {
    const index = normalized.indexOf(stripAccents(section));
    if (index < 0) {
      errors.push(`${label}: falta a seção "## ${section}".`);
      continue;
    }
    if (headings[index] !== section) errors.push(`${label}: escreva a seção exatamente como "## ${section}" (achado "## ${headings[index]}").`);
    if (index < cursor) errors.push(`${label}: a seção "## ${section}" está fora da ordem do contrato.`);
    cursor = Math.max(cursor, index);
  }
  for (const name of versionNames) {
    if (!text.includes(name)) warnings.push(`${label}: a seção Versões não cita ${name}.`);
  }

  // VER-1: versão que o catálogo planeja e que não existe em disco precisa estar declarada como
  // planejada, com a sua palavra, no README do modelo. Sem isso a decisão de entregar só parte das
  // versões viraria dívida calada: quem lê o modelo não saberia que falta algo de propósito.
  const ausentes = versoesPlanejadas(modelAbs).filter((slug) => !fs.existsSync(path.join(modelAbs, slug, 'Chart.tsx')));
  if (ausentes.length) {
    const secao = headings.find((h) => stripAccents(h).toLowerCase().startsWith('versoes planejadas'));
    if (!secao) {
      errors.push(
        `${label}: o catálogo planeja ${ausentes.length} versão(ões) que não existem em disco (${ausentes.join(', ')}) e falta a seção ` +
          '"## Versões planejadas (fora desta leva)" dizendo o que cada uma vai demonstrar. Versão que falta de propósito se declara; ' +
          'se a intenção era entregá-las, crie as pastas.',
      );
    } else {
      for (const slug of ausentes) {
        if (!text.includes(slug)) errors.push(`${label}: a versão ${slug} está no catálogo, não existe em disco e não é citada na seção "## ${secao}".`);
      }
    }
  }
  errors.push(...dashProblems(label, text));
  return { errors, warnings };
}

/** README da família: título e parágrafo de abertura. */
export function checkFamilyReadme(familyAbs) {
  const errors = [];
  const warnings = [];
  const file = path.join(familyAbs, 'README.md');
  const label = `${path.basename(familyAbs)}/README.md`;
  if (!fs.existsSync(file)) return { errors: [`${label} ausente.`], warnings };
  const text = fs.readFileSync(file, 'utf8');
  if (!/^#\s+\S/m.test(text)) errors.push(`${label}: falta o título (# Nome da família).`);
  const intro = text.replace(/^#\s+.*$/m, '').split(/\r?\n\r?\n/).map((p) => p.trim()).find((p) => p && !p.startsWith('#'));
  if (!intro) errors.push(`${label}: falta o parágrafo de abertura (o que a família resolve).`);
  if (!/^##\s+Modelos\s*$/m.test(text)) warnings.push(`${label}: recomenda-se a seção "## Modelos" listando os modelos.`);
  errors.push(...dashProblems(label, text));
  return { errors, warnings };
}

/** Lê o título e a abertura de um README, para a galeria. */
export function readReadmeSummary(file) {
  if (!fs.existsSync(file)) return { title: null, intro: null, sections: {} };
  const text = fs.readFileSync(file, 'utf8');
  const title = /^#\s+(.+?)\s*$/m.exec(text)?.[1] ?? null;
  const sections = {};
  const parts = text.split(/^##\s+/m);
  const introBlock = (parts[0] ?? '').replace(/^#\s+.*$/m, '');
  const intro = introBlock.split(/\r?\n\r?\n/).map((p) => p.trim()).find(Boolean) ?? null;
  for (const part of parts.slice(1)) {
    const [heading, ...rest] = part.split(/\r?\n/);
    sections[stripAccents(heading)] = rest.join('\n').trim();
  }
  return { title, intro, sections };
}
