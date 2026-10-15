/**
 * npm run lint -- <caminho> [<caminho> …] [--json]
 *
 * Roda o eslint DO FAROL sobre os `Chart.tsx` e `data.ts` do alvo: o binário, os plugins e as regras
 * vêm de `../app` (o mesmo `eslint.config.js`, reproduzido em `configDoFarol`), com o programa de tipos
 * do `VISUAIS/tsconfig.json`, que aponta `@/*` para `app/src`. Deriva zero contra o destino, portanto,
 * também na régua de lint, e não só em tipo e token.
 *
 * POR QUE EXISTE. O pedido P4 da replicação (2026-09-20) mediu que seis dos oito primeiros visuais
 * colados precisaram de ajuste para passar no lint do Farol, com o código aprovado pelo `npm run check`.
 * Em 2026-10-15 a mesma régua foi passada no acervo inteiro: 181 das 814 versões aprovadas (22%) falham,
 * com 264 erros em 12 regras; as três mais frequentes são `prefer-optional-chain` (103), `no-base-to-string`
 * (53) e `prefer-nullish-coalescing` (22). O `check` aprova código que o destino reprova, e quem cola
 * descobre isso um visual de cada vez.
 *
 * É ADVERTÊNCIA, NÃO PORTÃO. Este comando não entra no `npm run check` nem muda o veredito de nenhuma
 * versão: ligar a régua como erro reprovaria 181 peças aprovadas de uma vez, e a correção automática
 * (`--fix`) não é segura, porque o autofix de `prefer-optional-chain` propõe `a?.b !== null`, que muda a
 * leitura (`undefined !== null` é verdadeiro). O uso previsto é o passo 8 da seção 16 do CONTRATO: quem
 * vai colar roda `npm run lint -- <familia>/<modelo>` antes, lê o que o Farol vai cobrar e ajusta na
 * cópia, dentro de `app/src/`, com comentário no ponto. Sai com código 1 quando há erro, para servir de
 * portão a quem quiser um.
 *
 * O programa de tipos cobre o catálogo inteiro (814 `Chart.tsx` e `data.ts`), então a primeira análise
 * paga a construção dele mesmo para um alvo só: conte de um a três minutos.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { APP_DIR, VISUAIS_DIR, parseArgs, planTargets } from './lib/paths.mjs';

/** Resolve os pacotes a partir do `package.json` do Farol, para usar exatamente a versão que ele usa. */
const requireDoFarol = createRequire(path.join(APP_DIR, 'package.json'));

/**
 * `require` de pacote só ESM devolve o namespace (`{ default }`), e não o plugin; os de CommonJS devolvem o
 * próprio objeto. Este carregador aceita os dois, porque a lista do Farol mistura os dois tipos
 * (`eslint-plugin-react-refresh` e `eslint-config-prettier` são ESM; `@eslint/js` e `globals` são CommonJS).
 */
function carregar(nome) {
  const modulo = requireDoFarol(nome);
  return modulo && typeof modulo === 'object' && 'default' in modulo && modulo.default ? modulo.default : modulo;
}

/** As três regras que o P4 mediu na colagem; a prova do `selftest` confere que a régua as carrega. */
export const REGRAS_DO_P4 = ['@typescript-eslint/prefer-optional-chain', '@typescript-eslint/no-base-to-string', 'react-hooks/immutability'];

/**
 * A configuração do Farol (`app/eslint.config.js`), com duas diferenças declaradas: o programa de tipos é o
 * `VISUAIS/tsconfig.json`, e os `ignores` são os do catálogo. Qualquer outra regra que o Farol acrescentar
 * no arquivo dele precisa ser copiada aqui; o `selftest` compara as regras explícitas dos dois.
 * `tsconfig` e `ignores` existem para o `selftest` apontar a régua a um programa pequeno e descartável.
 */
export function configDoFarol({ tsconfig = path.join(VISUAIS_DIR, 'tsconfig.json'), ignores = ['**/node_modules/**', '_render/**', '_estudo/**'] } = {}) {
  const js = carregar('@eslint/js');
  const prettier = carregar('eslint-config-prettier');
  const reactHooks = carregar('eslint-plugin-react-hooks');
  const reactRefresh = carregar('eslint-plugin-react-refresh');
  const globals = carregar('globals');
  const tseslint = carregar('typescript-eslint');
  return tseslint.config(
    { ignores },
    {
      files: ['**/*.{ts,tsx}'],
      extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.stylisticTypeChecked],
      languageOptions: {
        ecmaVersion: 2022,
        globals: { ...globals.browser, ...globals.node },
        parserOptions: { project: [tsconfig], tsconfigRootDir: path.dirname(tsconfig) },
      },
      plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
      rules: {
        ...reactHooks.configs.recommended.rules,
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'no-restricted-syntax': [
          'error',
          { selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']", message: 'Use DATA_REF de data/constants.ts. Date.now() quebra o determinismo do Farol.' },
          { selector: "NewExpression[callee.name='Date'][arguments.length=0]", message: 'Use DATA_REF de data/constants.ts. new Date() quebra o determinismo do Farol.' },
        ],
      },
    },
    prettier,
  );
}

/** As regras escritas à mão no `eslint.config.js` do Farol, para o `selftest` acusar deriva entre os dois. */
export function regrasExplicitasDoFarol() {
  const texto = fs.readFileSync(path.join(APP_DIR, 'eslint.config.js'), 'utf8');
  return [...texto.matchAll(/^\s*'([a-z@][\w/-]+)':\s*\[/gm)].map((m) => m[1]);
}

/** Lint dos arquivos de uma lista de versões; devolve o relatório por versão e a contagem por regra. */
export async function lintarVersoes(versions, opcoesDeConfig = {}) {
  const { ESLint } = requireDoFarol('eslint');
  const eslint = new ESLint({ cwd: VISUAIS_DIR, overrideConfigFile: true, overrideConfig: configDoFarol(opcoesDeConfig) });
  const arquivos = versions.flatMap((v) => ['Chart.tsx', 'data.ts'].map((n) => path.join(v.abs, n)).filter((f) => fs.existsSync(f)));
  const resultados = arquivos.length ? await eslint.lintFiles(arquivos) : [];
  const porVersao = new Map(versions.map((v) => [v.abs, { caminho: v.rel, erros: [], avisos: [] }]));
  const porRegra = new Map();
  for (const r of resultados) {
    const versao = porVersao.get(path.dirname(r.filePath));
    if (!versao) continue;
    for (const m of r.messages) {
      const regra = m.ruleId ?? (m.fatal ? 'fatal' : 'sem-regra');
      const linha = `${path.basename(r.filePath)}:${m.line}:${m.column} ${regra}: ${m.message}`;
      (m.severity === 2 ? versao.erros : versao.avisos).push(linha);
      if (m.severity === 2) porRegra.set(regra, (porRegra.get(regra) ?? 0) + 1);
    }
  }
  return { versoes: [...porVersao.values()], porRegra: [...porRegra].sort((a, b) => b[1] - a[1]).map(([regra, n]) => ({ regra, n })) };
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleanFlags: ['json'] });
  const { targets, versions } = planTargets(positional);
  const asJson = Boolean(flags.json);
  if (!asJson) for (const t of targets) console.log(t.motivo ? `[lint] alvo ${t.arg}: FALHOU; ${t.motivo}` : `[lint] alvo ${t.scope}: ${t.versions.length} versão(ões).`);
  if (!versions.length) {
    if (asJson) process.stdout.write(`${JSON.stringify({ versoes: [], porRegra: [], comErro: 0, erros: 0 })}\n`);
    else console.log(`[lint] nenhuma versão sob ${targets.map((t) => t.arg).join(' ')}.`);
    return 1;
  }
  const inicio = Date.now();
  const relatorio = await lintarVersoes(versions);
  const comErro = relatorio.versoes.filter((v) => v.erros.length).length;
  const erros = relatorio.versoes.reduce((n, v) => n + v.erros.length, 0);
  if (asJson) {
    process.stdout.write(`${JSON.stringify({ ...relatorio, comErro, erros, segundos: Math.round((Date.now() - inicio) / 1000) })}\n`);
    return erros ? 1 : 0;
  }
  for (const v of relatorio.versoes) {
    console.log(`${v.erros.length ? 'erro ' : v.avisos.length ? 'aviso' : 'ok   '}  ${v.caminho}`);
    for (const linha of [...v.erros, ...v.avisos]) console.log(`  ${linha}`);
  }
  console.log(`\n[lint] ${relatorio.versoes.length} versão(ões), ${comErro} com erro, ${erros} erro(s) pela régua do Farol, em ${Math.round((Date.now() - inicio) / 1000)} s.`);
  if (relatorio.porRegra.length) console.log(`[lint] por regra: ${relatorio.porRegra.map((r) => `${r.regra} ${r.n}`).join(', ')}.`);
  console.log('[lint] advertência, não portão: o check não roda esta régua; quem cola ajusta na cópia (CONTRATO, seção 16, passo 8). Não use --fix no catálogo: o autofix de prefer-optional-chain muda a leitura.');
  return erros ? 1 : 0;
}

// Só roda como comando; importado pelo `selftest`, exporta a régua sem lintar nada.
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main()
    .then((code) => process.exit(code))
    .catch((error) => {
      console.error(`[lint] ${error.message}`);
      process.exit(1);
    });
}
