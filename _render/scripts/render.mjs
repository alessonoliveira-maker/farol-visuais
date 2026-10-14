/**
 * npm run render -- <caminho relativo a VISUAIS> [outro caminho...] [--tema escuro|claro|ambos]
 *                    [--sem-comparar] [--manter-tmp]
 *
 * Aceita um ou mais alvos na mesma chamada, na ordem dada; as flags valem para todos, o empacotamento
 * e o navegador sao um so para a chamada inteira, e alvo que nao existe e falha explicita que nao
 * aborta os demais.
 *
 * Renderiza toda versao (pasta com Chart.tsx) sob o caminho: grava `preview.svg` (ou
 * `preview-claro.svg`) ao lado do Chart.tsx e as imagens de conferencia em `_render/.qa/`.
 *
 * Carga controlada: trava entre processos, UM navegador por execucao e uma pagina so, reusada em
 * sequencia. Cada versao e conferida abrindo o SVG sozinho (arquivo e `<img>`) e comparando pixel
 * a pixel com a pagina.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { INHERITED_BASELINE } from './lib/base-herdada.mjs';
import { buildBundle } from './lib/build.mjs';
import { buildFontFaces, faceCollisions } from './lib/fonts.mjs';
import { withLock } from './lib/lock.mjs';
import { RENDERER_VERSION, libHash, readMeta, sourceHash, tokensHash } from './lib/meta.mjs';
import {
  QA_DIR,
  TMP_DIR,
  ensureDir,
  parseArgs,
  planTargets,
  relToVisuais,
  writeFileAtomic,
} from './lib/paths.mjs';
import { startServer } from './lib/server.mjs';

const THEMES = { escuro: 'dark', claro: 'light' };
/** Diferenca por canal (0 a 255) abaixo da qual o pixel conta como igual: absorve antisserrilhado. */
const PIXEL_TOLERANCE = 48;
/** Fracao de pixels diferentes: ate LIMIT_OK e fiel; acima de LIMIT_FAIL a versao falha. */
const LIMIT_OK = 0.005;
const LIMIT_FAIL = 0.02;

const nf = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const pct = (ratio) => `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(ratio * 100)}%`;
const kb = (bytes) => `${nf.format(bytes / 1024)} KB`;

function escapeXml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function previewFileName(theme) {
  return theme === 'light' ? 'preview-claro.svg' : 'preview.svg';
}

function qaBase(rel, theme) {
  return path.join(QA_DIR, `${rel}${theme === 'light' ? '.claro' : ''}`);
}

/** Papeis que a secao 11 admite na raiz do visual; a mesma lista da guarda FRASE-ACESSIVEL. */
const ACE_ROLES = ['img', 'figure', 'group', 'table'];

/**
 * Frase acessivel da raiz do Chart, lida do DOM vivo (nao do SVG serializado).
 *
 * A raiz de um grafico Recharts vira desenho e perde `role` e `aria-label` na serializacao, entao
 * a guarda ACE-1 ficava cega justo nos graficos. Aqui a frase sai do proprio elemento que o leitor
 * de tela anuncia, no primeiro `role` da secao 11 em ordem de documento dentro do corpo.
 */
async function readRootAce(page) {
  return page.evaluate((roles) => {
    const body = document.querySelector('[data-farol-body]');
    if (!body) return { role: '', label: '' };
    for (const el of body.querySelectorAll('[role][aria-label]')) {
      const role = el.getAttribute('role') ?? '';
      const label = el.getAttribute('aria-label') ?? '';
      if (roles.includes(role) && label) return { role, label };
    }
    return { role: '', label: '' };
  }, ACE_ROLES);
}

function assembleSvg({ meta, result, fonts, theme, source, tokens, lib, ace }) {
  const { width, height } = meta.canvas;
  const label = `${meta.title}. ${meta.useCase}`;
  // Carimbo da frase da raiz: atributo de dado no proprio no raiz, como os demais `data-farol-*`.
  // Nao desenha nada, nao entra no layout e viaja junto quando a pessoa copia so o SVG.
  const aceStamp = ` data-farol-ace-role="${escapeXml(ace?.role ?? '')}" data-farol-ace="${escapeXml(ace?.label ?? '')}"`;
  // `data-farol-lib` fica ANTES da frase da raiz: o check le os carimbos nos primeiros 2000
  // caracteres do arquivo, e a frase e o unico atributo do cabecalho sem teto de tamanho.
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}" data-farol-source="${source}" data-farol-tokens="${tokens}" data-farol-lib="${lib}" data-farol-theme="${theme}" data-farol-renderer="${RENDERER_VERSION}"${aceStamp}>`,
    `<title>${escapeXml(meta.title)}</title>`,
    `<desc>${escapeXml(meta.useCase)}</desc>`,
    `<style>${INHERITED_BASELINE}${fonts.css}</style>`,
    result.body,
    '</svg>',
    '',
  ].join('\n');
}

function dataUrl(buffer) {
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function launchBrowser() {
  const { chromium } = await import('playwright-core');
  const executablePath = process.env.FAROL_BROWSER_PATH;
  const channel = process.env.FAROL_BROWSER_CHANNEL ?? 'msedge';
  try {
    return await chromium.launch(executablePath ? { executablePath, headless: true } : { channel, headless: true });
  } catch (error) {
    throw new Error(
      `Nao consegui abrir o navegador (${executablePath ?? `channel ${channel}`}). Instale o Microsoft Edge ou defina FAROL_BROWSER_CHANNEL=chrome ou FAROL_BROWSER_PATH.\n${error.message}`,
    );
  }
}

async function settleSvgPage(page) {
  await page.evaluate(async () => {
    if (document.fonts) await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function renderOne({ page, origin, index, entry, theme, compare, lib }) {
  const { meta, rel, abs } = entry;
  const { width, height } = meta.canvas;
  const clip = { x: 0, y: 0, width, height };
  const outcome = { rel, theme, errors: [], warnings: [], svgBytes: 0, fontBytes: 0, diffFile: null, diffImg: null };
  const consoleMessages = [];
  const onConsole = (message) => {
    if (message.type() === 'error' || message.type() === 'warning') consoleMessages.push(message.text());
  };
  const onPageError = (error) => consoleMessages.push(`erro de pagina: ${error.message}`);
  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  try {
    await page.setViewportSize({ width, height });
    await page.goto(`${origin}/?i=${index}&theme=${theme}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__farol && window.__farol.ready, null, { timeout: 30_000 });
    const stable = await page.evaluate(() => window.__farol.waitStable());
    if (!stable.stable) outcome.warnings.push(`O DOM nao estabilizou em ${stable.ms} ms (animacao ou medicao em laco?).`);
    const runtimeError = await page.evaluate(() => window.__farol.error);
    if (runtimeError) {
      outcome.errors.push(`O Chart quebrou ao montar sem props: ${runtimeError.split('\n')[0]}`);
      return outcome;
    }
    outcome.warnings.push(...(await page.evaluate(() => window.__farol.layoutWarnings())));

    const pageShot = await page.screenshot({ clip });
    const result = await page.evaluate(() => window.__farol.serialize());
    const ace = await readRootAce(page);
    if (!ace.label) outcome.warnings.push('A raiz do visual nao tem role da secao 11 com aria-label: a frase da ACE-1 fica sem carimbo e sem medicao.');
    outcome.warnings.push(...result.warnings);
    const fonts = await buildFontFaces(result.fontUsage);
    for (const family of fonts.missingFamilies) {
      outcome.errors.push(`Fonte fora do Farol usada no texto: ${family}. So Manrope e Space Grotesk.`);
    }
    outcome.fontBytes = fonts.bytes;
    const svg = assembleSvg({ meta, result, fonts, theme, source: sourceHash(abs), tokens: tokensHash(), lib, ace });
    const leftovers = svg.replace(/<style>[\s\S]*?<\/style>/, '').match(/var\(--[a-z0-9-]+\)|currentcolor/gi);
    if (leftovers) outcome.errors.push(`O SVG ainda carrega valores nao resolvidos: ${[...new Set(leftovers)].join(', ')}`);
    outcome.svgBytes = Buffer.byteLength(svg);
    const svgFile = path.join(abs, previewFileName(theme));
    writeFileAtomic(svgFile, svg);

    const base = qaBase(rel, theme);
    ensureDir(path.dirname(base));

    await page.goto(pathToFileURL(svgFile).href, { waitUntil: 'load' });
    await settleSvgPage(page);
    const svgShot = await page.screenshot({ clip });
    fs.writeFileSync(`${base}.png`, svgShot);
    fs.writeFileSync(`${base}.pagina.png`, pageShot);

    if (compare) {
      const src = `/__visuais/${rel}/${previewFileName(theme)}`;
      await page.goto(`${origin}/__tool/img.html?src=${encodeURIComponent(src)}&w=${width}&h=${height}`, { waitUntil: 'load' });
      await page.evaluate(() => window.__imgReady);
      await page.waitForTimeout(150);
      const imgShot = await page.screenshot({ clip });

      await page.goto(`${origin}/__tool/compare.html`, { waitUntil: 'load' });
      const run = (a, b) => page.evaluate(([x, y, t]) => window.compare(x, y, t), [dataUrl(a), dataUrl(b), PIXEL_TOLERANCE]);
      const byFile = await run(pageShot, svgShot);
      const byImg = await run(pageShot, imgShot);
      for (const [label, cmp, suffix] of [['arquivo', byFile, 'diff'], ['img', byImg, 'diff-img']]) {
        if (cmp.sizeMismatch) {
          outcome.errors.push(`Comparacao (${label}): tamanhos diferentes ${cmp.a.join('x')} contra ${cmp.b.join('x')}.`);
          continue;
        }
        if (label === 'arquivo') outcome.diffFile = cmp.ratio;
        else outcome.diffImg = cmp.ratio;
        const diffFile = `${base}.${suffix}.png`;
        if (cmp.ratio > LIMIT_OK && cmp.diffPng) {
          fs.writeFileSync(diffFile, Buffer.from(cmp.diffPng.split(',')[1], 'base64'));
        } else if (fs.existsSync(diffFile)) {
          fs.rmSync(diffFile);
        }
        if (cmp.ratio > LIMIT_FAIL) {
          outcome.errors.push(`SVG sozinho (${label}) difere da pagina em ${pct(cmp.ratio)} dos pixels; veja ${relToVisuais(diffFile)}.`);
        } else if (cmp.ratio > LIMIT_OK) {
          outcome.warnings.push(`SVG sozinho (${label}) difere da pagina em ${pct(cmp.ratio)} dos pixels.`);
        }
      }
    }
    const relevant = consoleMessages.filter((text) => !/Download the React DevTools/.test(text));
    for (const text of [...new Set(relevant)].slice(0, 5)) outcome.warnings.push(`console: ${text.split('\n')[0].slice(0, 220)}`);
  } catch (error) {
    outcome.errors.push(`Falha no render: ${error.message.split('\n')[0]}`);
  } finally {
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
  }
  return outcome;
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleanFlags: ['sem-comparar', 'manter-tmp'] });
  const { targets, versions } = planTargets(positional);
  const themeFlag = String(flags.tema ?? 'escuro');
  const themes = themeFlag === 'ambos' ? ['dark', 'light'] : [THEMES[themeFlag]];
  if (themes.some((theme) => !theme)) throw new Error('--tema aceita escuro, claro ou ambos.');
  const compare = !flags['sem-comparar'];

  // Uma linha por alvo pedido: o que nao resolveu sai aqui com o caminho e o motivo. Antes o comando
  // lia so `positional[0]` e descartava o resto em silencio, o que faz um conserto que nunca rodou
  // ter a mesma cara de um conserto que nao pegou.
  const scope = targets.map((t) => t.scope).join(' ') || '.';
  for (const [i, t] of targets.entries()) {
    if (t.motivo) console.log(`[render] alvo ${i + 1}/${targets.length} ${t.arg}: FALHOU; ${t.motivo}`);
    else console.log(`[render] alvo ${i + 1}/${targets.length} ${t.scope}: ${t.versions.length} versao(oes).`);
  }
  // Alvo sem nenhuma versao continua saindo com 0, como sempre saiu neste comando; alvo que nao
  // resolve e falha e leva o codigo de saida para 1.
  // Uma vez por chamada, nao por versao: a colisao e do app inteiro e nao muda de peca para peca.
  // Sem esta linha a divergencia que ela causa sai so como aviso por versao, que ninguem soma.
  const colisoes = faceCollisions();
  if (colisoes.length) {
    console.log(
      `[render] FIDELIDADE: ${colisoes.length} face(s) do app sao declaradas por dois arquivos sem unicode-range, ` +
        'entao a pagina compoe as faces por glifo e o preview escolhe por faixa: os dois kernam diferente ' +
        '(medido: 0,594 px no par P->L de "CPL", e a linha inteira anda dai para a frente).',
    );
    for (const { face, specs } of colisoes) console.log(`[render]   ${face}: ${specs.join(' + ')}`);
    console.log(
      '[render]   Conserto, fora desta ferramenta: em app/src/main.tsx, trocar os imports por subconjunto pelo CSS ' +
        'combinado do peso (@fontsource/<fonte>/<peso>.css), que declara unicode-range.',
    );
  }

  const targetFailures = targets.filter((t) => t.motivo).length;
  if (versions.length === 0) {
    console.log(`Nenhuma versao (pasta com Chart.tsx) sob ${scope}.`);
    console.log(`[render] ${targets.length} alvo(s) pedido(s): 0 processado(s), ${targetFailures} com falha.`);
    return targetFailures ? 1 : 0;
  }

  return withLock(`render ${scope}`, async () => {
    const started = Date.now();
    const outcomes = [];
    const entries = [];
    for (const version of versions) {
      const { meta, errors } = readMeta(version.abs);
      const missing = ['Chart.tsx', 'data.ts'].filter((name) => !fs.existsSync(path.join(version.abs, name)));
      const allErrors = [...errors, ...missing.map((name) => `${name} ausente.`)];
      if (allErrors.length || !meta) {
        outcomes.push({ rel: version.rel, theme: themes[0], errors: allErrors, warnings: [] });
      } else {
        entries.push({ ...version, meta });
      }
    }

    let bundle = null;
    let server = null;
    let browser = null;
    // Carimbo da biblioteca compartilhada, lido UMA vez e ANTES de empacotar: e o estado que o pacote
    // vai embutir. Lido depois, uma edicao em `format.ts` no meio da chamada gravaria o carimbo novo
    // num desenho feito com a biblioteca velha, e o check ficaria calado justo no caso que ele existe
    // para acusar. Lido antes, o pior caso e um aviso a mais, que um novo render apaga.
    const lib = libHash();
    try {
      if (entries.length) {
        console.log(`[render] empacotando ${entries.length} versao(oes)...`);
        try {
          bundle = await buildBundle(entries);
        } catch (error) {
          console.error(`[render] o empacotamento falhou; rode npm run check para ver o erro de tipo ou import.\n${error.message}`);
          return 1;
        }
        server = await startServer(bundle.distDir);
        browser = await launchBrowser();
        const context = await browser.newContext({
          deviceScaleFactor: 2,
          reducedMotion: 'reduce',
          locale: 'pt-BR',
          timezoneId: 'America/Sao_Paulo',
          viewport: { width: 640, height: 360 },
        });
        const page = await context.newPage();
        for (const [index, entry] of entries.entries()) {
          for (const theme of themes) {
            const outcome = await renderOne({ page, origin: server.origin, index, entry, theme, compare, lib });
            outcomes.push(outcome);
            const mark = outcome.errors.length ? 'FALHOU' : outcome.warnings.length ? 'aviso ' : 'ok    ';
            const diff = compare && outcome.diffFile !== null
              ? `  diferenca arquivo ${pct(outcome.diffFile)} / img ${pct(outcome.diffImg ?? 0)}`
              : '';
            console.log(`${mark} ${entry.rel} [${theme === 'dark' ? 'escuro' : 'claro'}]  svg ${kb(outcome.svgBytes)} (fontes ${kb(outcome.fontBytes)})${diff}`);
          }
        }
        await context.close();
      }
    } finally {
      if (browser) await browser.close();
      if (server) await server.close();
      if (bundle && !flags['manter-tmp']) fs.rmSync(bundle.runDir, { recursive: true, force: true });
      if (fs.existsSync(TMP_DIR) && fs.readdirSync(TMP_DIR).every((name) => name === 'vite-cache')) {
        // nada: o cache do Vite fica para a proxima execucao
      }
    }

    let failures = 0;
    for (const outcome of outcomes) {
      if (!outcome.errors.length && !outcome.warnings.length) continue;
      console.log(`\n${outcome.rel} [${outcome.theme === 'dark' ? 'escuro' : 'claro'}]`);
      for (const error of outcome.errors) console.log(`  erro:  ${error}`);
      for (const warning of outcome.warnings) console.log(`  aviso: ${warning}`);
      if (outcome.errors.length) failures += 1;
    }
    const rendered = outcomes.filter((o) => o.svgBytes);
    const average = rendered.length ? rendered.reduce((sum, o) => sum + o.svgBytes, 0) / rendered.length : 0;
    console.log(
      `\n[render] ${targets.length} alvo(s) pedido(s): ${targets.length - targetFailures} processado(s), ${targetFailures} com falha.`,
    );
    for (const t of targets.filter((t) => t.motivo)) console.log(`[render] alvo com falha: ${t.arg}; ${t.motivo}`);
    console.log(
      `[render] ${rendered.length} preview(s) em ${nf.format((Date.now() - started) / 1000)} s; tamanho medio ${kb(average)}; ${failures} com erro. Conferencia em _render/.qa/.`,
    );
    // TOTAL DA DIVERGENCIA. A comparacao pixel a pixel ja existia, mas so falava por versao e so
    // como aviso: divergencia de 0,6% em trinta pecas somava trinta avisos e nenhuma leitura. Aqui
    // ela vira um numero por chamada, com a pior versao nomeada, que e o que permite decidir se o
    // limiar de reprovacao deve descer.
    if (compare) {
      const medidos = outcomes.filter((o) => o.diffFile !== null);
      const acima = medidos.filter((o) => Math.max(o.diffFile, o.diffImg ?? 0) > LIMIT_OK);
      const pior = medidos.reduce((a, b) => (Math.max(b.diffFile, b.diffImg ?? 0) > Math.max(a?.diffFile ?? -1, a?.diffImg ?? -1) ? b : a), null);
      console.log(
        `[render] fidelidade: ${acima.length} de ${medidos.length} comparacao(oes) acima de ${pct(LIMIT_OK)}` +
          (pior ? `; pior ${pct(Math.max(pior.diffFile, pior.diffImg ?? 0))} em ${pior.rel} [${pior.theme === 'dark' ? 'escuro' : 'claro'}]` : '') +
          `; reprova acima de ${pct(LIMIT_FAIL)}.`,
      );
    }
    return failures || targetFailures ? 1 : 0;
  });
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(`[render] ${error.message}`);
    process.exit(1);
  });
