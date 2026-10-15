/**
 * npm run selftest [-- --sem-navegador]
 *
 * Prova as duas garantias da ferramenta que não dá para ver num render isolado:
 *
 * 1. Trava: três processos disputando ao mesmo tempo entram em fila (intervalos sem sobreposição),
 *    e uma trava de dono morto é liberada sem esperar a expiração.
 * 2. Guardas: cada guarda do `check` com um caso que ela tem de acusar e um que ela tem de deixar
 *    passar, mais os quatro comportamentos da fila de dívida. Sem navegador e sem tocar no catálogo.
 * 3. Vários alvos: `check` e `render` processam N alvos numa chamada, na ordem dada, e um alvo
 *    inexistente acusa o caminho sem levar embora os válidos nem o código de saída.
 * 3a. Cobertura por versão: o `check` nomeia QUAIS versões a guarda não mediu, e não só quantas, com
 *    duas versões de motivo diferente na mesma chamada e o teto de nomeação declarado na saída.
 * 3a'. Carimbo da biblioteca: um formatador alterado numa cópia temporária de `app/src` tem de virar
 *    aviso `preview desatualizado (biblioteca)`, nunca erro; preview sem o atributo fica calado; e,
 *    com navegador, o render de verdade grava o carimbo que o check lê.
 * 3b. Dossiê: a extração conta contra a origem (toda regra do contrato e toda armadilha aplicável
 *    entram), o filtro por abordagem corta só o que não se aplica, e o estado no disco é medido.
 * 3c. Linha de base herdada: dentro do SVG sozinho, uma tag com valor proprio na folha do navegador
 *    (`button`, `a`, `h2`, `code`, `small`, `pre`, `th`) tem de desenhar igual a uma tag sem valor
 *    proprio, porque o serializador omite a propriedade herdada que e igual a do pai. Com controle
 *    negativo: sem a linha de base, a medicao tem de acusar as sete.
 * 4. SVG sozinho em outro navegador: cada preview dos moldes, aberto como arquivo no Google Chrome
 *    (o render compara no Edge), é comparado pixel a pixel com a captura da página guardada em
 *    `.qa/*.pagina.png`. Um navegador só, páginas em sequência, dentro da trava.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { acquireLock, withLock } from './lib/lock.mjs';
import { LIB_FILES, libHash, readMeta, readPreviewStamps, sourceHash, tokensHash } from './lib/meta.mjs';
import { APP_SRC, EXAMPLES_DIR, LOCK_DIR, QA_DIR, TMP_DIR, VISUAIS_DIR, ensureDir, findVersions, parseArgs, planTargets, relToVisuais } from './lib/paths.mjs';
import { startServer } from './lib/server.mjs';

const SELF = fileURLToPath(import.meta.url);
const HOLD_MS = 1200;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function child(id, logFile) {
  const release = await acquireLock(`selftest filho ${id}`);
  const start = Date.now();
  await sleep(HOLD_MS);
  const end = Date.now();
  fs.appendFileSync(logFile, `${JSON.stringify({ id, start, end })}\n`);
  release();
}

async function lockQueueTest() {
  ensureDir(TMP_DIR);
  const logFile = path.join(TMP_DIR, `selftest-trava-${process.pid}.log`);
  fs.rmSync(logFile, { force: true });
  const started = Date.now();
  const runs = [1, 2, 3].map(
    (id) =>
      new Promise((resolve, reject) => {
        const proc = spawn(process.execPath, [SELF, '--filho', String(id), '--log', logFile], { stdio: 'ignore' });
        proc.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`filho ${id} saiu com ${code}`))));
      }),
  );
  await Promise.all(runs);
  const entries = fs.readFileSync(logFile, 'utf8').trim().split('\n').map((line) => JSON.parse(line)).sort((a, b) => a.start - b.start);
  fs.rmSync(logFile, { force: true });
  let overlap = false;
  for (let i = 1; i < entries.length; i += 1) {
    if (entries[i].start < entries[i - 1].end) overlap = true;
  }
  const total = Date.now() - started;
  const ok = entries.length === 3 && !overlap && total >= HOLD_MS * 3;
  console.log(`${ok ? 'ok    ' : 'FALHOU'} trava em fila: 3 processos, ${entries.length} concluídos, sobreposição ${overlap ? 'SIM' : 'nenhuma'}, ${total} ms no total (mínimo ${HOLD_MS * 3}).`);
  return ok;
}

async function staleLockTest() {
  if (fs.existsSync(LOCK_DIR)) {
    console.log('aviso  trava vencida: pulado, há uma trava real ativa agora.');
    return true;
  }
  fs.mkdirSync(LOCK_DIR);
  fs.writeFileSync(path.join(LOCK_DIR, 'owner.json'), JSON.stringify({ pid: 2147483000, label: 'dono morto de teste' }));
  const started = Date.now();
  const release = await acquireLock('selftest trava vencida');
  const waited = Date.now() - started;
  release();
  const ok = waited < 5000 && !fs.existsSync(LOCK_DIR);
  console.log(`${ok ? 'ok    ' : 'FALHOU'} trava de dono morto liberada em ${waited} ms.`);
  return ok;
}

async function chromeFidelityTest() {
  const versions = findVersions(EXAMPLES_DIR);
  return withLock('selftest chrome', async () => {
    const { chromium } = await import('playwright-core');
    let browser;
    try {
      browser = await chromium.launch({ channel: process.env.FAROL_SELFTEST_CHANNEL ?? 'chrome', headless: true });
    } catch (error) {
      console.log(`aviso  Chrome indisponível para a prova cruzada: ${error.message.split('\n')[0]}`);
      return true;
    }
    const server = await startServer(TMP_DIR);
    let ok = true;
    try {
      const context = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 640, height: 360 } });
      const page = await context.newPage();
      for (const version of versions) {
        const { meta } = readMeta(version.abs);
        const pageShotFile = path.join(QA_DIR, `${version.rel}.pagina.png`);
        const svgFile = path.join(version.abs, 'preview.svg');
        if (!meta || !fs.existsSync(pageShotFile) || !fs.existsSync(svgFile)) {
          console.log(`aviso  ${version.rel}: sem preview ou sem captura da página; rode npm run render antes.`);
          continue;
        }
        const { width, height } = meta.canvas;
        await page.setViewportSize({ width, height });
        await page.goto(pathToFileURL(svgFile).href, { waitUntil: 'load' });
        await page.evaluate(async () => {
          await document.fonts?.ready;
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        const shot = await page.screenshot({ clip: { x: 0, y: 0, width, height } });
        fs.writeFileSync(path.join(QA_DIR, `${version.rel}.chrome.png`), shot);
        await page.goto(`${server.origin}/__tool/compare.html`);
        const cmp = await page.evaluate(
          ([a, b]) => window.compare(a, b, 48),
          [`data:image/png;base64,${fs.readFileSync(pageShotFile).toString('base64')}`, `data:image/png;base64,${shot.toString('base64')}`],
        );
        const ratio = cmp.sizeMismatch ? 1 : cmp.ratio;
        const pass = ratio <= 0.02;
        if (!pass) ok = false;
        const pct = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ratio * 100);
        console.log(`${pass ? 'ok    ' : 'FALHOU'} Chrome, SVG sozinho contra a página do Edge: ${version.rel} difere em ${pct}% dos pixels.`);
      }
      await context.close();
    } finally {
      await browser.close();
      await server.close();
    }
    return ok;
  });
}

// ---------------------------------------------------------------------------------------------
// Linha de base herdada: a folha do navegador nao pode reescrever o que o serializador omitiu
// ---------------------------------------------------------------------------------------------
//
// POR QUE ESTA PROVA EXISTE. O serializador so grava uma propriedade HERDADA quando ela difere da
// do pai; sendo igual, ele a omite e conta com a heranca. Na pagina a conta fecha, porque o
// preflight do Tailwind ja zerou a folha do navegador. No SVG sozinho nao havia preflight, entao
// toda tag com valor proprio na folha do navegador (`button`, `a`, `h2`, `code`, `small`, `th`,
// `pre`) trocava o valor herdado pelo dela, calada. Medido em producao: o `<button>` da legenda de
// 07_rosca-e-radial/04_barra-radial/v2_sdr-em-foco-no-ranking caia de Manrope 12px para Arial
// 13,3333px, o valor ao lado transbordava 1,65 px da caixa fixada, e o render acusava 1,12%
// (escuro) e 1,17% (claro) de pixels diferentes como AVISO, que ninguem totaliza.
//
// A prova mede a INVARIANTE, nao o sintoma: uma tag que a folha do navegador mexe tem de desenhar
// igual a uma tag que ela nao mexe, dado que o serializador omitiu as duas do mesmo jeito. O
// controle negativo roda a mesma medicao SEM a linha de base e exige que ela acuse; medicao que nao
// sabe reprovar nao prova nada quando aprova.

/** As tags com valor proprio na folha do navegador, e o minimo de marcacao para cada uma existir. */
const TAGS_COM_FOLHA_PROPRIA = [
  ['button', (dentro) => `<button type="button">${dentro}</button>`],
  ['a', (dentro) => `<a href="#">${dentro}</a>`],
  ['h2', (dentro) => `<h2>${dentro}</h2>`],
  ['code', (dentro) => `<code>${dentro}</code>`],
  ['small', (dentro) => `<small>${dentro}</small>`],
  ['pre', (dentro) => `<pre>${dentro}</pre>`],
  ['th', (dentro) => `<table><tbody><tr><th>${dentro}</th></tr></tbody></table>`],
];

/** O controle: `span` nao tem regra na folha do navegador, entao herda tudo do pai. */
const CONTROLE = (dentro) => `<span>${dentro}</span>`;

/**
 * Um preview minimo com a forma que o serializador produz: ilha com a raiz estilizada por extenso
 * (o que `ROOT_ALWAYS` grava) e, dentro dela, um descendente SEM nenhuma propriedade herdada, que e
 * exatamente o caso que o serializador omite quando o valor e igual ao do pai.
 */
function ilhaDeTeste(baseCss, marcacao) {
  const raiz =
    'box-sizing:border-box;font-family:Manrope, Arial, sans-serif;font-size:12px;font-weight:400;' +
    'font-style:normal;line-height:16px;letter-spacing:normal;color:rgb(232, 237, 247);text-align:start;' +
    'margin:0;padding:0';
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">' +
    `<style>${baseCss}</style>` +
    '<foreignObject x="0" y="0" width="640" height="360" style="overflow:visible">' +
    `<div xmlns="http://www.w3.org/1999/xhtml" style="${raiz}" data-raiz="">${marcacao}</div>` +
    '</foreignObject></svg>'
  );
}

async function baseHerdadaTest() {
  const { INHERITED_BASELINE } = await import('./lib/base-herdada.mjs');
  const provas = [];

  // Primeiro a prova barata, sem navegador: a linha de base tem de estar no `<style>` que o render
  // grava. Sem isto, o resto da prova mediria uma linha de base que o produto nao usa.
  const fonteRender = fs.readFileSync(path.join(path.dirname(SELF), 'render.mjs'), 'utf8');
  provas.push(
    prova(
      'linha de base no <style> do preview',
      'presente',
      fonteRender.includes('<style>${INHERITED_BASELINE}${fonts.css}</style>') ? 'presente' : 'AUSENTE',
    ),
  );

  return withLock('selftest base herdada', async () => {
    const { chromium } = await import('playwright-core');
    let browser;
    try {
      browser = await chromium.launch({ channel: process.env.FAROL_BROWSER_CHANNEL ?? 'msedge', headless: true });
    } catch (error) {
      console.log(`aviso  navegador indisponível para a prova da linha de base: ${error.message.split('\n')[0]}`);
      return provas.every(Boolean);
    }
    try {
      const context = await browser.newContext({ deviceScaleFactor: 2, locale: 'pt-BR' });
      const page = await context.newPage();

      /** Mede a tinta e o estilo efetivo do texto de UMA variante. */
      const medir = async (baseCss, envolver) => {
        const svg = ilhaDeTeste(baseCss, envolver('Agendas por SDR'));
        await page.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0">${svg}</body></html>`, {
          waitUntil: 'load',
        });
        return page.evaluate(async () => {
          await document.fonts?.ready;
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const walker = document.createTreeWalker(document.querySelector('[data-raiz]'), NodeFilter.SHOW_TEXT);
          const no = walker.nextNode();
          if (!no || !no.parentElement) return null;
          const range = document.createRange();
          range.selectNodeContents(no);
          const cs = getComputedStyle(no.parentElement);
          return [
            `largura ${Math.round(range.getBoundingClientRect().width * 100) / 100}`,
            `fonte ${cs.fontFamily.split(',')[0].replace(/["']/g, '')} ${cs.fontSize} ${cs.fontWeight}`,
            `cor ${cs.color}`,
            `sublinhado ${cs.textDecorationLine}`,
          ].join('; ');
        });
      };

      for (const [nome, envolver] of TAGS_COM_FOLHA_PROPRIA) {
        const referencia = await medir(INHERITED_BASELINE, CONTROLE);
        const medido = await medir(INHERITED_BASELINE, envolver);
        provas.push(prova(`<${nome}> desenha como o controle <span>`, referencia, medido));
      }

      // Controle negativo: sem a linha de base, a medicao TEM de acusar. Uma prova que so sabe
      // aprovar nao distingue conserto de cegueira.
      const referenciaSem = await medir('', CONTROLE);
      const acusadas = [];
      for (const [nome, envolver] of TAGS_COM_FOLHA_PROPRIA) {
        if ((await medir('', envolver)) !== referenciaSem) acusadas.push(nome);
      }
      provas.push(
        prova(
          `controle negativo: sem a linha de base, a folha do navegador aparece em ${acusadas.join(', ') || 'nenhuma tag'}`,
          `${TAGS_COM_FOLHA_PROPRIA.length} tag(s) acusada(s)`,
          `${acusadas.length} tag(s) acusada(s)`,
        ),
      );
      await context.close();
    } finally {
      await browser.close();
    }
    const falhas = provas.filter((p) => !p).length;
    console.log(`       ${provas.length - falhas} de ${provas.length} provas da linha de base herdada passaram.`);
    return falhas === 0;
  });
}

// ---------------------------------------------------------------------------------------------
// Guardas: um caso que PASSA e um que FALHA para cada uma
// ---------------------------------------------------------------------------------------------
//
// POR QUE ESTA PROVA EXISTE, e por que ela é diferente das duas de cima. Trava e fidelidade de
// navegador são garantias da FERRAMENTA. Isto aqui é a garantia das GUARDAS: uma guarda que não
// acusa o defeito que ela existe para achar é pior que guarda nenhuma, porque ela dá permissão. E o
// erro simétrico é igualmente caro: guarda que acusa a escrita correta é desligada por quem produz
// na primeira semana, e volta a valer zero.
//
// Cada guarda entra com DOIS casos mínimos, escritos aqui e não no catálogo: um que a guarda tem de
// acusar e um que ela tem de deixar passar. Os casos são montados numa pasta temporária, com os
// arquivos que a guarda lê, e apagados no fim. Nenhuma peça do catálogo é tocada.
//
// A FILA DE DÍVIDA também é provada, porque ela é o mecanismo que decide entre erro e aviso: o mesmo
// defeito na mesma peça tem de sair como ERRO quando a peça não está na fila e como AVISO quando
// está, e tem de voltar a erro quando a contagem cresce. Uma fila que anistia calado seria pior que
// não ter fila.

/** Monta uma versão de mentira numa pasta temporária e devolve o caminho. */
function versaoDeTeste(nome, arquivos) {
  const dir = path.join(TMP_DIR, `guarda-${process.pid}-${nome}`);
  ensureDir(dir);
  for (const [arquivo, conteudo] of Object.entries(arquivos)) fs.writeFileSync(path.join(dir, arquivo), conteudo, 'utf8');
  return dir;
}

/** Um `preview.svg` mínimo com a moldura do cartão e as marcas que o caso precisa. */
function previewDeTeste(tema, marcas) {
  const cartao = tema === 'dark' ? 'rgb(18, 28, 46)' : 'rgb(255, 255, 255)';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" data-farol-theme="${tema}">` +
    `<rect fill="${cartao}" x="0" y="0" width="640" height="360"/>` +
    `<svg x="20" y="20" width="600" height="300" viewBox="0 0 600 300">${marcas}</svg>` +
    '</svg>'
  );
}

/** Uma prova: o esperado contra o medido, com o rótulo já escrito. */
function prova(rotulo, esperado, medido) {
  const ok = esperado === medido;
  console.log(`${ok ? 'ok    ' : 'FALHOU'} ${rotulo}: esperado ${esperado}, medido ${medido}.`);
  return ok;
}

async function guardasTest() {
  const G = await import('./lib/guardas.mjs');
  const C = await import('./lib/colisao.mjs');
  const { esquecerDivida } = await import('./lib/divida.mjs');
  const semEscapes = G.lerEscapes('', 'Chart.tsx');
  const provas = [];
  const lixo = [];
  const conta = (r) => `${r.errors.length} erro(s) e ${r.warnings.length} aviso(s)`;

  // --- O DIGITO TABULAR NA LARGURA DO TEXTO, emenda de 2026-09-29. As tabelas de largura sao
  // PROPORCIONAIS e o catalogo escreve quase todo numero com `tabular-nums`, onde todo digito mede
  // igual. Medido no navegador com as fontes do Farol: 0,6201 em, identico em Manrope e Space Grotesk,
  // nos pesos 400 a 700 e nos tamanhos 11 a 30 px, com os nove digitos iguais ao zero nas 32
  // combinacoes. Controle: familia inexistente da 0,5000 em, e as duas reais divergem SEM tabular
  // (0,5895 e 0,5614), o que prova que carregaram.
  const L = (texto, px, fam, tab) => Number(C.larguraDoTexto(texto, px, fam, 0, tab).toFixed(2));
  provas.push(prova('a largura tabular do digito e 0,62 em', 0.62, C.LARGURA_TABULAR));
  // Os tres numeros de tres digitos medem IGUAL sob tabular, que e a propriedade que o dado tem na tela.
  provas.push(prova('111, 000 e 519 medem igual sob tabular', true, L('111', 14, 'grotesk', true) === L('000', 14, 'grotesk', true) && L('000', 14, 'grotesk', true) === L('519', 14, 'grotesk', true)));
  // E medem DIFERENTE sem tabular, senao a emenda nao estaria fazendo nada.
  provas.push(prova('111 e 000 medem diferente sem tabular', true, L('111', 14, 'grotesk', false) !== L('000', 14, 'grotesk', false)));
  // Contra o navegador: 26,05 px para tres digitos a 14 px, e 36,70 px para `100%`.
  provas.push(prova('111 tabular bate com o navegador (26,05)', 26.04, L('111', 14, 'grotesk', true)));
  provas.push(prova('100% tabular bate com o navegador (36,70)', 36.71, L('100%', 14, 'grotesk', true)));
  // A subestimativa que a emenda corrige: 18,23 contra 26,04, ou 30% a menos, e para o lado que
  // ESCONDE colisao. Sem tabular a tabela continua quase exata e nada muda.
  provas.push(prova('sem a emenda 111 saia 30% estreito', 18.23, L('111', 14, 'grotesk', false)));
  provas.push(prova('a emenda nao mexe em texto sem digito', L('dom', 11, 'manrope', false), L('dom', 11, 'manrope', true)));
  // O leitor resolve a cadeia: `normal` declarado DESLIGA o tabular herdado, e por isso a cadeia se
  // resolve em vez de se somar.
  const svgTab = (variante, filho) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60">` +
    `<g style="font-variant-numeric:${variante}"><text x="10" y="30" style="font-family:&quot;Space Grotesk&quot;;font-size:14px${filho}">111</text></g></svg>`;
  const larguraDe = (svg) => {
    const { linhas } = C.lerLinhasDeTexto(svg);
    return Number((linhas[0].segmentos[0].x1 - linhas[0].segmentos[0].x0).toFixed(2));
  };
  provas.push(prova('tabular herdado do ancestral vale no texto', 26.04, larguraDe(svgTab('tabular-nums', ''))));
  provas.push(prova('normal no filho desliga o tabular do pai', 18.23, larguraDe(svgTab('tabular-nums', ';font-variant-numeric:normal'))));

  // --- TAMANHO-TEXTO E A ESCALA DO `<svg>` (TIP-2), emenda de 2026-09-29. A guarda lia o tamanho
  // DECLARADO e dizia "medida" para 14 peças em que o texto chega à tela menor que o piso, a pior a
  // 7,23 px. O fator vem de `colisao.mjs`, que já o calculava para marcar `escalado` e o descartava.
  // As provas fixam as três decisões da emenda: qual das duas razões é o fator, que diferença subpixel
  // não conta, e que o veredito é sobre o tamanho que chega à tela.
  const previewEscalado = (vbW, vbH, w, h, fonte, par = '') =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" data-farol-theme="dark">` +
    `<rect fill="rgb(18, 28, 46)" x="0" y="0" width="640" height="360"/>` +
    `<svg x="20" y="20" width="${w}" height="${h}" viewBox="0 0 ${vbW} ${vbH}"${par ? ` preserveAspectRatio="${par}"` : ''}>` +
    `<text x="10" y="20" style="font-size:${fonte}px;fill:rgb(232, 237, 247)">meta do mes</text></svg></svg>`;
  const tam = (svg, nome) =>
    G.guardaTamanhoTexto(versaoDeTeste(nome, { 'preview.svg': svg }), semEscapes, `prova/tam-${nome}/v1`);
  // Sem escala: 11 px declarados chegam como 11 px e a guarda cala.
  provas.push(prova('TAMANHO-TEXTO cala com 11 px sem escala', '0 erro(s) e 0 aviso(s)', conta(tam(previewEscalado(600, 300, 600, 300, 11), 'sem-escala'))));
  // Com escala 0,8 nos dois eixos: 11 px chegam a 8,8 px e a guarda acusa.
  provas.push(prova('TAMANHO-TEXTO acusa 11 px encolhidos a 8,8 px', 1, tam(previewEscalado(600, 300, 480, 240, 11), 'escala-08').errors.length));
  // O fator é o MENOR dos dois, porque sem `preserveAspectRatio` o padrão é `meet`: largura 1,0 e
  // altura 0,7 dão 7,7 px, não 11. É a forma exata do pior caso do acervo.
  const meet = tam(previewEscalado(600, 300, 600, 210, 11), 'meet');
  provas.push(prova('com meet o fator é a MENOR das duas razões', 1, meet.errors.length));
  provas.push(prova('a mensagem escreve o declarado e a escala', true, meet.errors[0]?.includes('11 px declarados') === true));
  // Com `none` a escala é anisotrópica e quem governa a altura do glifo é a razão de ALTURA.
  provas.push(prova('com preserveAspectRatio none manda a razão de altura', 1, tam(previewEscalado(600, 300, 600, 210, 11), 'none-h', 'none').errors.length));
  // Diferença subpixel é arredondamento do serializador, não desenho: `viewBox` 300 com caixa 299,5.
  provas.push(prova('diferença subpixel do viewBox não vira escala', '0 erro(s) e 0 aviso(s)', conta(tam(previewEscalado(600, 300, 600, 299.5, 11), 'subpixel'))));
  // O comportamento antigo continua: declarado abaixo do piso acusa mesmo sem escala nenhuma.
  provas.push(prova('TAMANHO-TEXTO ainda acusa 9 px declarados', 1, tam(previewEscalado(600, 300, 600, 300, 9), 'nove-px').errors.length));
  // O CASO INVERSO DA GEO-18 (F0.3, 2026-10-02). `viewBox` MENOR que a caixa nos dois eixos amplia: os
  // 11 px chegam a 13,75 e o piso fica seguro, que é o que a entrada passou a dizer. O MISTO não é o
  // inverso, porque manda a menor das duas razões; e a ampliação não devolve a guarda de posição.
  provas.push(prova('TAMANHO-TEXTO cala com viewBox menor que a caixa nos dois eixos', '0 erro(s) e 0 aviso(s)', conta(tam(previewEscalado(480, 240, 600, 300, 11), 'ampliado'))));
  provas.push(prova('TAMANHO-TEXTO acusa o caso misto, viewBox menor num eixo e maior no outro', 1, tam(previewEscalado(480, 400, 600, 300, 11), 'misto').errors.length));
  const ampliadoCol = versaoDeTeste('ampliado-col', { 'preview.svg': previewEscalado(480, 240, 600, 300, 11) });
  provas.push(prova('a ampliação não devolve a COLISAO-TEXTO, que desiste com motivo', 'preview_com_escala', G.guardaColisaoTexto(ampliadoCol, semEscapes).medicao.motivo));
  lixo.push(ampliadoCol);

  // --- ESPESSURA-MARCA: OS DOIS MOTIVOS DE MARCA (F0.3). O banner da guarda explica os dois com um
  // parêntese só, e três produtores leram `marca_fora_do_bar` como "peça sem <Bar>". O que decide é o
  // RÓTULO DENTRO DA MARCA: marca à mão sem rótulo interno não é medida; com ele, é medida pelo piso do
  // rótulo e reprova, sem `<Bar>` nenhum na peça. E sem retângulo de marca o motivo é outro.
  const marcaAMao = (h) =>
    `<rect style="fill:rgb(34, 211, 238)" x="40" y="40" width="200" height="${h}"/>` +
    `<rect style="fill:rgb(34, 211, 238)" x="40" y="100" width="120" height="${h}"/>`;
  const rotuloDentro = (y) => `<text x="50" y="${y}" style="font-size:11px;fill:rgb(232, 237, 247)">R$ 401 mil</text>`;
  const espDir = (nome, marcas) => {
    const dir = versaoDeTeste(nome, { 'preview.svg': previewDeTeste('dark', marcas) });
    lixo.push(dir);
    return G.guardaEspessuraMarca(dir, semEscapes);
  };
  provas.push(prova('ESPESSURA-MARCA sem retângulo de marca sai sem_marca_de_barra', 'sem_marca_de_barra', espDir('esp-circulo', '<circle style="fill:rgb(34, 211, 238)" cx="100" cy="100" r="30"/>').medicao.motivo));
  provas.push(prova('marca à mão sem rótulo dentro sai marca_fora_do_bar', 'marca_fora_do_bar', espDir('esp-sem-rotulo', marcaAMao(16)).medicao.motivo));
  const espComRotulo = espDir('esp-rotulo-16', marcaAMao(16) + rotuloDentro(48));
  provas.push(prova('a mesma marca à mão COM rótulo dentro é medida, sem <Bar> nenhum', true, espComRotulo.medicao.medida));
  provas.push(prova('e a de 16 px é acusada contra o piso do rótulo de 11 px', 1, espComRotulo.errors.length));
  provas.push(prova('marca à mão de 20 px com rótulo dentro passa', '0 erro(s) e 0 aviso(s)', conta(espDir('esp-rotulo-20', marcaAMao(20) + rotuloDentro(50)))));

  // --- AGREGACAO-ZERO (EST-1b). O par é a mesma mediana com e sem o `null`.
  const zeroRuim = versaoDeTeste('agr-ruim', {
    'Chart.tsx':
      'export function median(values: readonly number[]): number {\n' +
      '  if (values.length === 0) return 0;\n' +
      '  return values[0] ?? 0;\n' +
      '}\n' +
      'export const Chart = () => <p>{formatPercent(median([]))}</p>;\n',
  });
  const zeroBom = versaoDeTeste('agr-bom', {
    'Chart.tsx':
      'export function median(values: readonly number[]): number | null {\n' +
      '  if (values.length === 0) return null;\n' +
      '  return values[0] ?? 0;\n' +
      '}\n' +
      'export const Chart = () => <p>{formatPercent(median([]) ?? 1)}</p>;\n',
  });
  lixo.push(zeroRuim, zeroBom);
  const agrRuim = G.guardaAgregacaoZero(zeroRuim, 'teste/agr/v1_ruim');
  const agrBom = G.guardaAgregacaoZero(zeroBom, 'teste/agr/v2_bom');
  provas.push(prova('AGREGACAO-ZERO acusa mediana com retorno number e saída zero', true, agrRuim.errors.length >= 1));
  provas.push(prova('AGREGACAO-ZERO deixa passar a mesma mediana com number | null', 0, agrBom.errors.length));
  // O `?? 0` obrigatório pelo noUncheckedIndexedAccess não pode virar achado: é o falso positivo que
  // acusaria toda mediana correta do acervo.
  provas.push(prova('AGREGACAO-ZERO ignora o "?? 0" de acesso indexado', 0, agrBom.warnings.length));

  // --- A fila de dívida: o MESMO defeito sai erro fora da fila e aviso dentro dela.
  const filaFalsa = path.join(TMP_DIR, `fila-${process.pid}.json`);
  const escreverFila = (conteudo) => {
    fs.writeFileSync(filaFalsa, JSON.stringify(conteudo), 'utf8');
    process.env.FAROL_FILA_DIVIDA = filaFalsa;
    esquecerDivida();
  };
  try {
    escreverFila({ 'teste/agr/v1_ruim': { 'AGREGACAO-ZERO': agrRuim.errors.length } });
    provas.push(prova('fila de dívida troca erro por aviso na peça registrada', `0 erro(s) e ${agrRuim.errors.length} aviso(s)`, conta(G.guardaAgregacaoZero(zeroRuim, 'teste/agr/v1_ruim'))));
    provas.push(prova('fila de dívida barra a peça nova com o mesmo defeito', `${agrRuim.errors.length} erro(s) e 0 aviso(s)`, conta(G.guardaAgregacaoZero(zeroRuim, 'teste/agr/v9_nova'))));
    escreverFila({ 'teste/agr/v1_ruim': { 'AGREGACAO-ZERO': 1 }, 'teste/agr/v8_quitada': { 'AGREGACAO-ZERO': 2 } });
    provas.push(prova('fila de dívida volta a reprovar quando a dívida cresce', '1 erro(s) e 0 aviso(s)', conta(G.guardaAgregacaoZero(zeroRuim, 'teste/agr/v1_ruim'))));
    provas.push(prova('fila de dívida pede a remoção da linha já quitada', '0 erro(s) e 1 aviso(s)', conta(G.guardaAgregacaoZero(zeroBom, 'teste/agr/v8_quitada'))));
  } finally {
    delete process.env.FAROL_FILA_DIVIDA;
    fs.rmSync(filaFalsa, { force: true });
    esquecerDivida();
  }

  // --- CONTRASTE-MARCA (TOK-1, TOK-7). O par é o mesmo trilho em dois tokens.
  const marcaRuim = versaoDeTeste('mar-ruim', {
    'preview.svg': previewDeTeste('dark', '<rect x="10" y="10" width="200" height="12" style="fill:rgb(24, 36, 58)"/>'),
    'preview-claro.svg': previewDeTeste('light', '<rect x="10" y="10" width="200" height="12" style="fill:rgb(234, 239, 247)"/>'),
  });
  const marcaBom = versaoDeTeste('mar-bom', {
    'preview.svg': previewDeTeste('dark', '<rect x="10" y="10" width="200" height="12" style="fill:rgb(7, 12, 22)"/>'),
    'preview-claro.svg': previewDeTeste('light', '<rect x="10" y="10" width="200" height="12" style="fill:rgb(234, 239, 247)"/>'),
  });
  const marcaSeq = versaoDeTeste('mar-seq', {
    'preview.svg': previewDeTeste('dark', '<rect x="10" y="10" width="40" height="40" style="fill:rgb(23, 92, 117)"/>'),
  });
  const marcaRampa = versaoDeTeste('mar-rampa', {
    'preview.svg': previewDeTeste(
      'dark',
      '<rect x="10" y="10" width="40" height="40" style="fill:rgb(23, 92, 117)"/>' +
        '<rect x="60" y="10" width="40" height="40" style="fill:rgb(36, 149, 179)"/>' +
        '<rect x="110" y="10" width="40" height="40" style="fill:rgb(111, 214, 232)"/>',
    ),
  });
  lixo.push(marcaRuim, marcaBom, marcaSeq, marcaRampa);
  provas.push(prova('CONTRASTE-MARCA acusa --surface-overlay como trilho (TOK-1)', true, G.guardaContrasteMarca(marcaRuim, semEscapes, 'teste/mar/v1_ruim').errors.length === 1));
  provas.push(prova('CONTRASTE-MARCA deixa passar o mesmo trilho em --surface-sunken', 0, G.guardaContrasteMarca(marcaBom, semEscapes, 'teste/mar/v2_bom').errors.length));
  provas.push(prova('CONTRASTE-MARCA acusa um degrau --seq-3 sozinho, uso categórico (TOK-7)', true, G.guardaContrasteMarca(marcaSeq, semEscapes, 'teste/mar/v3_seq').errors.length === 1));
  provas.push(prova('CONTRASTE-MARCA deixa passar três degraus --seq-*, que é rampa', 0, G.guardaContrasteMarca(marcaRampa, semEscapes, 'teste/mar/v4_rampa').errors.length));
  // O escape tem de silenciar a guarda inteira, porque a medida não tem linha de código a apontar.
  const comEscape = G.lerEscapes('// check-ok: CONTRASTE-MARCA trilho de propósito neste estudo\n', 'Chart.tsx');
  provas.push(prova('CONTRASTE-MARCA se cala com o escape de arquivo', 0, G.guardaContrasteMarca(marcaRuim, comEscape, 'teste/mar/v5_escape').errors.length));

  // --- CEGUEIRA 1, medida em 2026-09-28: a peneira de área contra o `<svg>` ANCESTRAL.
  // A mesma rampa de três degraus de `01_cards-e-kpis/03_kpi-com-regua-de-meta/v3`, dentro de um
  // `<svg>` aninhado de 238,3 x 22 px. Contra o aninhado, o degrau de 65,38% passava de um quarto da
  // área e era descartado como fundo de painel: sobravam dois degraus e a guarda reprovava a rampa
  // por uso categórico. Contra a tela da peça, os três degraus entram e a rampa passa.
  const degrau = (pct, x, cor) => `<rect height="16" width="${pct}%" x="${x}%" y="3" style="fill:${cor}"/>`;
  const marcaRampaAninhada = versaoDeTeste('mar-rampa-aninhada', {
    'preview.svg': previewDeTeste(
      'dark',
      '<svg x="10" y="10" width="238.3" height="22">' +
        degrau(65.38, 0, 'rgb(13, 42, 58)') +
        degrau(11.54, 65.38, 'rgb(18, 66, 87)') +
        degrau(23.08, 76.92, 'rgb(23, 92, 117)') +
        '</svg>',
    ),
  });
  lixo.push(marcaRampaAninhada);
  provas.push(prova('CONTRASTE-MARCA lê a rampa inteira dentro de <svg> aninhado pequeno (cegueira da peneira de área)', 0, G.guardaContrasteMarca(marcaRampaAninhada, semEscapes, 'teste/mar/v6_rampa-aninhada').errors.length));

  // --- CEGUEIRA 2, medida em 2026-09-28: a isenção "tem texto por cima" só existia no ramo HTML.
  // No SVG o `<text>` é IRMÃO da forma, então o parentesco no DOM não isenta nada e o selo neutro de
  // `12_hierarquia/02` e `12_hierarquia/04` era contado como marca de dado. O trio abaixo prova a
  // isenção E o seu limite: texto DENTRO da caixa isenta, texto AO LADO não isenta.
  const selo = '<rect x="10" y="10" width="200" height="12" style="fill:rgb(24, 36, 58)"/>';
  const rotulo = (x) => `<text x="${x}" y="20" style="font-size:10px">Selo</text>`;
  const marcaSeloComTexto = versaoDeTeste('mar-selo-texto', { 'preview.svg': previewDeTeste('dark', selo + rotulo(14)) });
  const marcaSeloTextoAoLado = versaoDeTeste('mar-selo-ao-lado', { 'preview.svg': previewDeTeste('dark', selo + rotulo(250)) });
  // Célula de heatmap: um degrau `--seq-*` sozinho com o número dentro é o uso que a TOK-7 ENDOSSA,
  // e é o mesmo desenho que a guarda acusa quando a célula está vazia (prova `v3_seq`, acima).
  const marcaCelulaComNumero = versaoDeTeste('mar-celula-numero', {
    'preview.svg': previewDeTeste('dark', '<rect x="10" y="10" width="40" height="40" style="fill:rgb(23, 92, 117)"/><text x="16" y="34" style="font-size:12px">12</text>'),
  });
  lixo.push(marcaSeloComTexto, marcaSeloTextoAoLado, marcaCelulaComNumero);
  provas.push(prova('CONTRASTE-MARCA isenta a forma com <text> IRMÃO dentro da caixa, no SVG', 0, G.guardaContrasteMarca(marcaSeloComTexto, semEscapes, 'teste/mar/v7_selo').errors.length));
  provas.push(prova('CONTRASTE-MARCA continua acusando a MESMA forma com o texto ao lado, no SVG', true, G.guardaContrasteMarca(marcaSeloTextoAoLado, semEscapes, 'teste/mar/v8_ao-lado').errors.length === 1));
  provas.push(prova('CONTRASTE-MARCA isenta o degrau --seq-* com o número escrito dentro (TOK-7)', 0, G.guardaContrasteMarca(marcaCelulaComNumero, semEscapes, 'teste/mar/v9_celula').errors.length));

  // O ramo HTML tem de seguir acusando o trilho sem texto e isentando o fundo com texto: o conserto
  // do SVG não pode ter sido feito ao custo do ramo que já funcionava.
  const html = (miolo) => `<foreignObject x="20" y="20" width="600" height="300">${miolo}</foreignObject>`;
  const trilhoHtml = '<div style="background-color:rgb(24, 36, 58);width:200px;height:12px">MIOLO</div>';
  const marcaTrilhoHtml = versaoDeTeste('mar-html-trilho', { 'preview.svg': previewDeTeste('dark', html(trilhoHtml.replace('MIOLO', ''))) });
  const marcaFundoHtml = versaoDeTeste('mar-html-fundo', { 'preview.svg': previewDeTeste('dark', html(trilhoHtml.replace('MIOLO', 'Conversão de 40%'))) });
  lixo.push(marcaTrilhoHtml, marcaFundoHtml);
  provas.push(prova('CONTRASTE-MARCA continua acusando o trilho sem texto no ramo HTML', true, G.guardaContrasteMarca(marcaTrilhoHtml, semEscapes, 'teste/mar/v10_html-trilho').errors.length === 1));
  provas.push(prova('CONTRASTE-MARCA segue isentando o fundo com texto no ramo HTML', 0, G.guardaContrasteMarca(marcaFundoHtml, semEscapes, 'teste/mar/v11_html-fundo').errors.length));

  // --- REGUA-CONSTANTE (ROT-5b). O par é a mesma legenda com e sem o máximo do dado.
  const cabeca = 'const REFS = [10, 100, 350] as const;\nfunction raio(v: number, max: number) { return Math.sqrt(v / max) * 20; }\n';
  const legenda = (lista) =>
    `${cabeca}export const Chart = ({ data }: { data: readonly number[] }) => {\n` +
    '  const maxCount = Math.max(1, ...data);\n' +
    `  const degraus = ${lista};\n` +
    '  return <svg>{degraus.map((value) => <circle cx={10} cy={10} fill="var(--chart-1)" key={value} r={raio(value, maxCount)} />)}</svg>;\n' +
    '};\n';
  const reguaRuim = versaoDeTeste('reg-ruim', { 'Chart.tsx': legenda('REFS') });
  const reguaBom = versaoDeTeste('reg-bom', { 'Chart.tsx': legenda('[...REFS.filter((r) => r < maxCount), maxCount]') });
  const reguaGrade = versaoDeTeste('reg-grade', {
    'Chart.tsx': `${cabeca}export const Chart = () => <svg>{REFS.map((value) => <circle cx={10} cy={10} fill="none" key={value} r={raio(value, 350)} stroke="var(--line-subtle)" />)}</svg>;\n`,
  });
  lixo.push(reguaRuim, reguaBom, reguaGrade);
  provas.push(prova('REGUA-CONSTANTE acusa legenda de tamanho feita só de constante', true, G.guardaReguaConstante(reguaRuim, 'teste/reg/v1_ruim').errors.length >= 1));
  provas.push(prova('REGUA-CONSTANTE deixa passar a legenda que termina no máximo do dado', 0, G.guardaReguaConstante(reguaBom, 'teste/reg/v2_bom').errors.length));
  // Anel de grade da escala radial é tique de eixo em coordenada polar: constante ali está certa.
  provas.push(prova('REGUA-CONSTANTE deixa passar o anel de grade, que é tique de eixo', 0, G.guardaReguaConstante(reguaGrade, 'teste/reg/v3_grade').errors.length));

  // --- FORMATO-ACESSIVEL (DAD-9). O par é a mesma medida com e sem duas precisões.
  const corpo = (naFrase, noCorpo) =>
    'export const Chart = ({ percent }: { percent: number }) => (\n' +
    `  <div aria-label={\`Meta batida em \${${naFrase}}.\`} role="img">\n` +
    `    <span className="kpi-number">{${noCorpo}}</span>\n` +
    '  </div>\n' +
    ');\n';
  const fmtRuim = versaoDeTeste('fmt-ruim', { 'Chart.tsx': corpo('formatPercent(percent)', 'formatPercent(percent, 0)') });
  const fmtBom = versaoDeTeste('fmt-bom', { 'Chart.tsx': corpo('formatPercent(percent, 0)', 'formatPercent(percent, 0)') });
  // Rótulo de tempo vive legitimamente em duas formas: a TIP-5 manda encurtar o tique e a frase
  // falada tem espaço para o mês inteiro. Foi o falso positivo que a medição de 2026-09-28 tirou.
  const fmtMes = versaoDeTeste('fmt-mes', { 'Chart.tsx': corpo('formatMonthLong(mes)', 'formatMonthShort(mes)') });
  lixo.push(fmtRuim, fmtBom, fmtMes);
  provas.push(prova('FORMATO-ACESSIVEL acusa a mesma medida com duas precisões', true, G.guardaFormatoAcessivel(fmtRuim, 'teste/fmt/v1_ruim').errors.length >= 1));
  provas.push(prova('FORMATO-ACESSIVEL deixa passar o mesmo formato nos dois lados', 0, G.guardaFormatoAcessivel(fmtBom, 'teste/fmt/v2_bom').errors.length));
  provas.push(prova('FORMATO-ACESSIVEL não confunde mês longo e mês curto com divergência', 0, G.guardaFormatoAcessivel(fmtMes, 'teste/fmt/v3_mes').errors.length));
  // F0.5c (2026-10-02): `formatPercentFromScale100` é o nome honesto de `formatPercentPoints`. A guarda
  // tem de CONHECER o nome novo (duas precisões acusam) e não pode tratar os dois nomes como dois
  // formatadores, porque o texto que sai é o mesmo: acusar ali seria acusar a escrita correta.
  const fmtNovoRuim = versaoDeTeste('fmt-novo-ruim', { 'Chart.tsx': corpo('formatPercentFromScale100(percent)', 'formatPercentFromScale100(percent, 0)') });
  const fmtDoisNomes = versaoDeTeste('fmt-dois-nomes', { 'Chart.tsx': corpo('formatPercentFromScale100(percent)', 'formatPercentPoints(percent)') });
  const fmtDoisNomesRuim = versaoDeTeste('fmt-dois-nomes-ruim', { 'Chart.tsx': corpo('formatPercentFromScale100(percent)', 'formatPercentPoints(percent, 0)') });
  lixo.push(fmtNovoRuim, fmtDoisNomes, fmtDoisNomesRuim);
  provas.push(prova('FORMATO-ACESSIVEL acusa duas precisões no nome novo da escala de 0 a 100', true, G.guardaFormatoAcessivel(fmtNovoRuim, 'teste/fmt/v4_novo-ruim').errors.length >= 1));
  provas.push(prova('FORMATO-ACESSIVEL deixa passar o nome novo na frase e o antigo no corpo, que são a mesma função', 0, G.guardaFormatoAcessivel(fmtDoisNomes, 'teste/fmt/v5_dois-nomes').errors.length));
  const errosDoisNomes = G.guardaFormatoAcessivel(fmtDoisNomesRuim, 'teste/fmt/v6_dois-nomes-ruim').errors;
  provas.push(prova('FORMATO-ACESSIVEL acusa os dois nomes com casas diferentes, e cita a chamada como foi escrita', true, errosDoisNomes.length >= 1 && errosDoisNomes[0].includes('formatPercentPoints(percent, 0)')));

  // --- IMPORTS PERMITIDOS (seção 6), F0.5c. O par é a mesma versão importando o nome liberado e um
  // nome que não existe na lista. O nome antigo segue liberado: 15 versões do acervo o importam.
  const { checkSource, ALLOWED_CHART_IMPORTS } = await import('./lib/contract.mjs');
  const comImport = (nome) =>
    `import { ${nome} } from '@/lib/format';\n` +
    "import { data as defaultData } from './data';\n\n" +
    'export default function Chart({ data = defaultData }: { readonly data?: readonly number[] }) {\n' +
    '  return (\n' +
    `    <div aria-label={\`Cobertura de \${${nome}(data[0] ?? 0)}.\`} role="img">\n` +
    `      <span className="kpi-number">{${nome}(data[0] ?? 0)}</span>\n` +
    '    </div>\n' +
    '  );\n' +
    '}\n';
  const errosDeCodigo = (nome, pasta) => {
    const dir = versaoDeTeste(pasta, { 'Chart.tsx': comImport(nome) });
    lixo.push(dir);
    return checkSource(path.join(dir, 'Chart.tsx'), 'chart').errors;
  };
  provas.push(prova('a versão que importa formatPercentFromScale100 passa no check de código', '', errosDeCodigo('formatPercentFromScale100', 'imp-novo').join(' | ')));
  provas.push(prova('o nome antigo formatPercentPoints continua liberado', '', errosDeCodigo('formatPercentPoints', 'imp-antigo').join(' | ')));
  provas.push(prova('formatador fora da lista da seção 6 segue acusado', true, errosDeCodigo('formatPercentScale', 'imp-fora').some((e) => e.includes('"formatPercentScale" de "@/lib/format" não está liberado'))));
  // A tabela da seção 6 e a lista do check dizem os mesmos nomes: presença de cada nome, sem contagem.
  const linhaDoFormat = fs.readFileSync(path.join(VISUAIS_DIR, 'CONTRATO.md'), 'utf8').split('\n').find((l) => l.startsWith('| `@/lib/format` |')) ?? '';
  provas.push(prova('todo nome liberado em @/lib/format está na tabela da seção 6 do contrato', '', ALLOWED_CHART_IMPORTS['@/lib/format'].filter((nome) => !linhaDoFormat.includes(`\`${nome}\``)).join('|')));

  // --- EIXO-CALMO (EIX-5). O par central é o mesmo eixo com e sem o `axisLine={false}`, e o resto
  // são os comportamentos de borda em que a árvore sintática decide e uma busca por texto erraria.
  //
  // `FAROL_AXIS_PROPS=liga` fixa o padrão do módulo compartilhado durante as provas, para elas medirem
  // A GUARDA e não o estado de `app/`: no dia em que o `chartTheme.ts` for consertado na raiz, estas
  // provas continuam dizendo a mesma coisa. Que o arquivo real é legível tem prova própria, abaixo.
  const eixoLeitor = await import('./lib/eixo.mjs');
  provas.push(prova('EIXO-CALMO lê o AXIS_PROPS do chartTheme.ts do Farol, em vez de supor', 'chartTheme.ts', eixoLeitor.axisLineDoFarol().fonte));
  const peca = (grade, eixos, cabeca = '') =>
    "import { CartesianGrid, LineChart, XAxis, YAxis } from 'recharts';\n" +
    "import { AXIS_PROPS, GRID_COLOR } from '@/components/visuals/charts/chartTheme';\n" +
    `${cabeca}export const Chart = () => (\n  <LineChart data={[]}>\n    ${grade}\n    ${eixos}\n  </LineChart>\n);\n`;
  const grade = '<CartesianGrid stroke={GRID_COLOR} vertical={false} />';
  const calmo = '{...AXIS_PROPS} axisLine={false} tickLine={false} tickMargin={8}';
  const eixoRuim = versaoDeTeste('eix-ruim', { 'Chart.tsx': peca(grade, '<XAxis {...AXIS_PROPS} dataKey="mes" tickMargin={8} />') });
  const eixoBom = versaoDeTeste('eix-bom', { 'Chart.tsx': peca(grade, `<XAxis ${calmo} dataKey="mes" />`) });
  // A INVERSÃO DA ORDEM: os mesmos caracteres do caso bom, em outra ordem. Em JSX a última
  // propriedade vence, então aqui o espalhamento vem depois e reinstala a linha do módulo.
  const eixoOrdem = versaoDeTeste('eix-ordem', { 'Chart.tsx': peca(grade, '<XAxis axisLine={false} {...AXIS_PROPS} dataKey="mes" />') });
  // SOBREPOSIÇÃO SINTÁTICA: escreve `axisLine`, e o valor não desliga nada, só troca a cor.
  const eixoStroke = versaoDeTeste('eix-stroke', { 'Chart.tsx': peca(grade, '<XAxis {...AXIS_PROPS} axisLine={{ stroke: GRID_COLOR }} dataKey="mes" />') });
  // UM EIXO SÓ: X desliga, Y herda. Foi esta forma que a estimativa por texto perdeu no acervo, porque
  // o arquivo CONTÉM a palavra `axisLine`; três versões de 03_colunas-verticais/05 são exatamente ela.
  const eixoMetade = versaoDeTeste('eix-metade', { 'Chart.tsx': peca(grade, `<XAxis ${calmo} dataKey="mes" />\n    <YAxis {...AXIS_PROPS} width={40} />`) });
  const eixoSemGrade = versaoDeTeste('eix-sem-grade', { 'Chart.tsx': peca('', '<XAxis {...AXIS_PROPS} dataKey="mes" />') });
  const eixoSemSpread = versaoDeTeste('eix-sem-spread', { 'Chart.tsx': peca(grade, '<XAxis dataKey="mes" stroke="var(--text-muted)" />') });
  // Objeto local montado a partir do AXIS_PROPS e espalhado nos dois eixos: a forma correta de reuso.
  const eixoObjeto = versaoDeTeste('eix-objeto', {
    'Chart.tsx': peca(grade, '<XAxis {...EIXO} dataKey="mes" />\n    <YAxis {...EIXO} width={40} />', 'const EIXO = { ...AXIS_PROPS, axisLine: false as const, tickMargin: 8 };\n'),
  });
  const eixoEscondido = versaoDeTeste('eix-escondido', { 'Chart.tsx': peca(grade, `<XAxis ${calmo} dataKey="mes" />\n    <YAxis {...AXIS_PROPS} hide />`) });
  const eixoEscape = versaoDeTeste('eix-escape', {
    'Chart.tsx': peca(grade, '{/* check-ok: EIXO-CALMO a linha de eixo é o assunto deste estudo */}\n    <XAxis {...AXIS_PROPS} dataKey="mes" />'),
  });
  lixo.push(eixoRuim, eixoBom, eixoOrdem, eixoStroke, eixoMetade, eixoSemGrade, eixoSemSpread, eixoObjeto, eixoEscondido, eixoEscape);
  process.env.FAROL_AXIS_PROPS = 'liga';
  try {
    const eix = (dir, rel) => G.guardaEixoCalmo(dir, rel);
    provas.push(prova('EIXO-CALMO acusa o eixo que espalha AXIS_PROPS e não sobrepõe axisLine', 1, eix(eixoRuim, 'teste/eix/v1_ruim').errors.length));
    provas.push(prova('EIXO-CALMO deixa passar o mesmo eixo com axisLine={false} depois do espalhamento', 0, eix(eixoBom, 'teste/eix/v2_bom').errors.length));
    provas.push(prova('EIXO-CALMO acusa a ORDEM invertida, axisLine={false} antes do espalhamento', 1, eix(eixoOrdem, 'teste/eix/v3_ordem').errors.length));
    provas.push(prova('EIXO-CALMO acusa axisLine com objeto de stroke, sobreposição sintática', 1, eix(eixoStroke, 'teste/eix/v4_stroke').errors.length));
    provas.push(prova('EIXO-CALMO acusa só o eixo que herda quando o outro sobrepõe', 1, eix(eixoMetade, 'teste/eix/v5_metade').errors.length));
    provas.push(prova('EIXO-CALMO não se aplica a peça sem grade, e conta o motivo', 'sem_grade', eix(eixoSemGrade, 'teste/eix/v6_sem-grade').medicao.motivo));
    provas.push(prova('EIXO-CALMO deixa de fora o eixo que não espalha AXIS_PROPS', 'sem_eixo_com_axis_props', eix(eixoSemSpread, 'teste/eix/v7_sem-spread').medicao.motivo));
    provas.push(prova('EIXO-CALMO segue o objeto local montado a partir do AXIS_PROPS', 0, eix(eixoObjeto, 'teste/eix/v8_objeto').errors.length));
    provas.push(prova('EIXO-CALMO isenta o eixo com hide, que não desenha linha nenhuma', 0, eix(eixoEscondido, 'teste/eix/v9_escondido').errors.length));
    provas.push(prova('EIXO-CALMO se cala com o escape na linha de cima, dentro do JSX', 0, eix(eixoEscape, 'teste/eix/v10_escape').errors.length));
    // A CONDIÇÃO É CARREGADA PELO PADRÃO LIDO: simular o conserto na raiz tem de emudecer a guarda.
    // Se ela acusasse do mesmo jeito, estaria medindo a ausência da palavra e não o que o código faz.
    process.env.FAROL_AXIS_PROPS = 'desliga';
    provas.push(prova('EIXO-CALMO emudece sozinha se o AXIS_PROPS passar a desligar a linha', 'axis_props_desliga', eix(eixoRuim, 'teste/eix/v1_ruim').medicao.motivo));
    process.env.FAROL_AXIS_PROPS = 'liga';
    // A fila de dívida da EIXO-CALMO: os quatro comportamentos, com as duas mensagens do caso de dois
    // eixos, porque é com mais de uma mensagem que "cresce" e "quita" se distinguem de verdade.
    const eixoDois = versaoDeTeste('eix-dois', { 'Chart.tsx': peca(grade, '<XAxis {...AXIS_PROPS} dataKey="mes" />\n    <YAxis {...AXIS_PROPS} width={40} />') });
    lixo.push(eixoDois);
    provas.push(prova('EIXO-CALMO acusa os DOIS eixos quando os dois herdam', 2, eix(eixoDois, 'teste/eix/v11_dois').errors.length));
    const filaEixo = path.join(TMP_DIR, `fila-eixo-${process.pid}.json`);
    const gravar = (conteudo) => {
      fs.writeFileSync(filaEixo, JSON.stringify(conteudo), 'utf8');
      process.env.FAROL_FILA_DIVIDA = filaEixo;
      esquecerDivida();
    };
    try {
      gravar({ 'teste/eix/v11_dois': { 'EIXO-CALMO': 2 } });
      provas.push(prova('fila de dívida troca erro por aviso na peça registrada em EIXO-CALMO', '0 erro(s) e 2 aviso(s)', conta(eix(eixoDois, 'teste/eix/v11_dois'))));
      provas.push(prova('fila de dívida barra a peça nova com o mesmo defeito de eixo', '2 erro(s) e 0 aviso(s)', conta(eix(eixoDois, 'teste/eix/v99_nova'))));
      gravar({ 'teste/eix/v11_dois': { 'EIXO-CALMO': 1 }, 'teste/eix/v12_quitada': { 'EIXO-CALMO': 1 } });
      provas.push(prova('fila de dívida volta a reprovar quando a dívida de eixo cresce', '1 erro(s) e 0 aviso(s)', conta(eix(eixoDois, 'teste/eix/v11_dois'))));
      provas.push(prova('fila de dívida pede a remoção da linha de eixo já quitada', '0 erro(s) e 1 aviso(s)', conta(eix(eixoBom, 'teste/eix/v12_quitada'))));
    } finally {
      delete process.env.FAROL_FILA_DIVIDA;
      fs.rmSync(filaEixo, { force: true });
      esquecerDivida();
    }
  } finally {
    delete process.env.FAROL_AXIS_PROPS;
  }

  // --- OPACIDADE-MARCA (ACE-5). O par central é a MESMA marca com opacidade abaixo e acima do mínimo
  // calculado de `tokens.css`, e o resto são os comportamentos de borda: as três propriedades de
  // opacidade, a cadeia que MULTIPLICA, as duas isenções da WCAG 1.4.11 e o que fica de fora.
  //
  // O mínimo de `--chart-1` é 0,66. As provas usam 0,45 (o valor real de
  // `16_distribuicao/03_strip-plot-e-beeswarm/v1`) e 0,70, que são os dois lados da mesma cor.
  const opa = (dir, rel) => G.guardaOpacidadeMarca(dir, rel);
  const graf = (corpo, cabeca = '') =>
    "import { Area, AreaChart, Bar, LabelList, Scatter, ScatterChart } from 'recharts';\n" +
    `${cabeca}export const Chart = () => (\n  <ScatterChart data={[]}>\n    ${corpo}\n  </ScatterChart>\n);\n`;
  const opaRuim = versaoDeTeste('opa-ruim', { 'Chart.tsx': graf('<Scatter fill="var(--chart-1)" fillOpacity={0.45} />') });
  const opaBom = versaoDeTeste('opa-bom', { 'Chart.tsx': graf('<Scatter fill="var(--chart-1)" fillOpacity={0.7} />') });
  // CONSTANTE DE TOPO: é como o acervo escreve, e sem seguir o identificador a guarda se calaria nas
  // peças reais e só acusaria o literal que ninguém escreve.
  const opaConst = versaoDeTeste('opa-const', { 'Chart.tsx': graf('<Scatter fill={PONTO} fillOpacity={POINT_OPACITY} />', "const PONTO = 'var(--chart-1)';\nconst POINT_OPACITY = 0.45;\n") });
  // A CADEIA QUE MULTIPLICA: 0,8 herdado do <g> vezes 0,8 do elemento dá 0,64, abaixo dos 0,66. Nenhuma
  // das duas escritas parece errada sozinha, e é por isso que ler uma propriedade só erra.
  const opaHerdada = versaoDeTeste('opa-herdada', { 'Chart.tsx': graf('<g opacity={0.8}>\n      <rect fill="var(--chart-1)" fillOpacity={0.8} height={10} width={10} />\n    </g>') });
  // CONTROLE da cadeia: o MESMO elemento sem o <g> em volta mede 0,8 e passa. Se esta prova caísse, a
  // anterior estaria acusando o 0,8 e não o produto.
  const opaSoElemento = versaoDeTeste('opa-so-elemento', { 'Chart.tsx': graf('<rect fill="var(--chart-1)" fillOpacity={0.8} height={10} width={10} />') });
  // SÓ O <g>: a marca não declara opacidade nenhuma e chega atenuada de fora. É a forma em que a
  // opacidade está mais escondida, porque ela não aparece na linha da marca.
  const opaSoGrupo = versaoDeTeste('opa-so-grupo', { 'Chart.tsx': graf('<g opacity={0.5}>\n      <rect fill="var(--chart-1)" height={10} width={10} />\n    </g>') });
  // ISENÇÃO 1, TEXTO POR CIMA: o valor escrito DENTRO da marca. A informação está na letra.
  const opaLabel = versaoDeTeste('opa-label', { 'Chart.tsx': graf('<Bar dataKey="v" fill="var(--chart-1)" fillOpacity={0.3}>\n      <LabelList dataKey="v" />\n    </Bar>') });
  // ISENÇÃO 2, VALOR AO LADO (a da 17.2): o trilho pintado é IRMÃO da linha que carrega o número. É a
  // forma da lista em barras do acervo, e é a isenção que o preview não sabe aplicar.
  const opaAoLado = versaoDeTeste('opa-ao-lado', {
    'Chart.tsx': 'export const Chart = () => (\n  <div>\n    <div className="absolute inset-y-0 bg-chart-1/20" />\n    <span>{formatInt(12)} leads</span>\n  </div>\n);\n',
  });
  // CONTROLE da isenção: o MESMO Tailwind translúcido sem nada escrito ao lado tem de ser acusado.
  const opaSoTrilho = versaoDeTeste('opa-so-trilho', { 'Chart.tsx': 'export const Chart = () => (\n  <div>\n    <div className="absolute inset-y-0 bg-chart-1/20" />\n  </div>\n);\n' });
  // AS TRÊS PROPRIEDADES NÃO SÃO A MESMA COISA: `strokeOpacity` atinge o traço, `fill-opacity` é a
  // grafia de atributo do SVG, e `opacity` atinge o elemento inteiro.
  const opaTraco = versaoDeTeste('opa-traco', { 'Chart.tsx': graf('<line stroke="var(--chart-1)" strokeOpacity={0.4} x1={0} x2={9} />') });
  const opaHifen = versaoDeTeste('opa-hifen', { 'Chart.tsx': graf('<rect fill="var(--chart-1)" fill-opacity="0.4" height={10} width={10} />') });
  const opaElemento = versaoDeTeste('opa-elemento', { 'Chart.tsx': graf('<rect fill="var(--chart-1)" height={10} opacity={0.4} width={10} />') });
  // ALFA NA COR, não na propriedade: `rgba()` compõe igual, e o token sai do hex.
  const opaRgba = versaoDeTeste('opa-rgba', { 'Chart.tsx': graf('<rect fill="rgba(45, 212, 232, 0.4)" height={10} width={10} />') });
  // IRRESOLÚVEL: ternário. Falso negativo é o erro que esta casa prefere numa guarda nova.
  const opaTernario = versaoDeTeste('opa-ternario', { 'Chart.tsx': graf('<Scatter fill="var(--chart-1)" fillOpacity={ativo ? 0.9 : 0.3} />') });
  // FORA DE ESCOPO: token que não pinta marca, e TEXTO, que é a ACE-4 com outro piso e outro veredito.
  const opaSuperficie = versaoDeTeste('opa-superficie', { 'Chart.tsx': graf('<rect fill="var(--surface-sunken)" fillOpacity={0.4} height={10} width={10} />') });
  const opaTexto = versaoDeTeste('opa-texto', { 'Chart.tsx': graf('<text fill="var(--text-muted)" opacity={0.4} x={0} y={9}>12</text>') });
  // COR SEM OPACIDADE POSSÍVEL: `--line-strong` não passa 3:1 nem opaco, então aqui a guarda ORIENTA.
  const opaSemSolucao = versaoDeTeste('opa-sem-solucao', { 'Chart.tsx': graf('<Area dataKey="faixa" fill="var(--line-strong)" fillOpacity={0.3} stroke="none" />') });
  const opaEscape = versaoDeTeste('opa-escape', {
    'Chart.tsx': graf('{/* check-ok: OPACIDADE-MARCA a marca esmaecida é o assunto deste estudo */}\n    <Scatter fill="var(--chart-1)" fillOpacity={0.45} />'),
  });
  lixo.push(opaSoGrupo, opaRuim, opaBom, opaConst, opaHerdada, opaSoElemento, opaLabel, opaAoLado, opaSoTrilho, opaTraco, opaHifen, opaElemento, opaRgba, opaTernario, opaSuperficie, opaTexto, opaSemSolucao, opaEscape);
  provas.push(prova('OPACIDADE-MARCA acusa fillOpacity de 0,45 em --chart-1, cujo mínimo é 0,66', 1, opa(opaRuim, 'teste/opa/v1_ruim').errors.length));
  provas.push(prova('OPACIDADE-MARCA deixa passar a mesma marca com 0,70, acima do mínimo', 0, opa(opaBom, 'teste/opa/v2_bom').errors.length));
  provas.push(prova('OPACIDADE-MARCA segue a constante de topo até o número e a cor', 1, opa(opaConst, 'teste/opa/v3_const').errors.length));
  provas.push(prova('OPACIDADE-MARCA multiplica a opacidade herdada do <g> pela do elemento', 1, opa(opaHerdada, 'teste/opa/v4_herdada').errors.length));
  provas.push(prova('OPACIDADE-MARCA deixa passar o mesmo elemento sem o <g> em volta, que mede 0,80', 0, opa(opaSoElemento, 'teste/opa/v5_so-elemento').errors.length));
  provas.push(prova('OPACIDADE-MARCA acusa a marca que só é atenuada pelo <g> de fora', 1, opa(opaSoGrupo, 'teste/opa/v20_so-grupo').errors.length));
  provas.push(prova('OPACIDADE-MARCA diz na mensagem que a opacidade efetiva é 0,64', true, (opa(opaHerdada, 'teste/opa/v4_herdada').errors[0] ?? '').includes('0,64')));
  provas.push(prova('OPACIDADE-MARCA isenta a marca com o valor escrito DENTRO dela (LabelList)', 0, opa(opaLabel, 'teste/opa/v6_label').errors.length));
  provas.push(prova('OPACIDADE-MARCA isenta o trilho com o valor escrito AO LADO, isenção da 17.2', 0, opa(opaAoLado, 'teste/opa/v7_ao-lado').errors.length));
  provas.push(prova('OPACIDADE-MARCA acusa o MESMO trilho quando não há nada escrito ao lado', 1, opa(opaSoTrilho, 'teste/opa/v8_so-trilho').errors.length));
  provas.push(prova('OPACIDADE-MARCA mede strokeOpacity, que não é fillOpacity', 1, opa(opaTraco, 'teste/opa/v9_traco').errors.length));
  provas.push(prova('OPACIDADE-MARCA mede fill-opacity, a grafia de atributo do SVG', 1, opa(opaHifen, 'teste/opa/v10_hifen').errors.length));
  provas.push(prova('OPACIDADE-MARCA mede opacity do elemento, que atinge preenchimento e traço', 1, opa(opaElemento, 'teste/opa/v11_elemento').errors.length));
  provas.push(prova('OPACIDADE-MARCA mede o alfa que vem em rgba(), não só o da propriedade', 1, opa(opaRgba, 'teste/opa/v12_rgba').errors.length));
  provas.push(prova('OPACIDADE-MARCA prefere falso negativo no ternário', 0, opa(opaTernario, 'teste/opa/v13_ternario').errors.length));
  provas.push(prova('OPACIDADE-MARCA registra o ternário como opacidade irresolúvel', 1, opa(opaTernario, 'teste/opa/v13_ternario').medicao.naoMedidos.opacidade_irresoluvel));
  provas.push(prova('OPACIDADE-MARCA não julga token de superfície, que não pinta marca', 0, opa(opaSuperficie, 'teste/opa/v14_superficie').errors.length));
  provas.push(prova('OPACIDADE-MARCA deixa o texto para a ACE-4, que tem outro piso', 0, opa(opaTexto, 'teste/opa/v15_texto').errors.length));
  provas.push(prova('OPACIDADE-MARCA orienta e não reprova na cor que não passa nem opaca', '0 erro(s) e 1 aviso(s)', conta(opa(opaSemSolucao, 'teste/opa/v16_sem-solucao'))));
  provas.push(prova('OPACIDADE-MARCA diz que nessa cor opacidade NÃO É OPÇÃO', true, (opa(opaSemSolucao, 'teste/opa/v16_sem-solucao').warnings[0] ?? '').includes('NÃO É OPÇÃO')));
  provas.push(prova('OPACIDADE-MARCA se cala com o escape na linha de cima, dentro do JSX', 0, opa(opaEscape, 'teste/opa/v17_escape').errors.length));
  provas.push(prova('OPACIDADE-MARCA não se aplica a peça sem opacidade em marca, e conta o motivo', 'sem_opacidade_em_marca', opa(opaSuperficie, 'teste/opa/v14_superficie').medicao.motivo));
  // A GUARDA DISCRIMINA: com o piso revertido para 1:1 nenhuma cor reprova e a guarda emudece. Só as
  // provas de ACUSAÇÃO podem cair aqui; se uma prova de aprovação caísse junto, ela não provava nada.
  // Guarda e devolve o valor de fora em vez de apagá-lo: sem isto, rodar o selftest INTEIRO com
  // `FAROL_PISO_OPACIDADE=1` por fora perdia a reversão a partir deste ponto, e a demonstração de que
  // só as provas de acusação caem terminava no meio do bloco.
  const pisoDeFora = process.env.FAROL_PISO_OPACIDADE;
  process.env.FAROL_PISO_OPACIDADE = '1';
  try {
    provas.push(prova('com o piso revertido para 1:1 a acusação de 0,45 desaparece', 0, opa(opaRuim, 'teste/opa/v1_ruim').errors.length));
    provas.push(prova('com o piso revertido a aprovação de 0,70 continua aprovada', 0, opa(opaBom, 'teste/opa/v2_bom').errors.length));
    provas.push(prova('com o piso revertido a isenção do valor ao lado continua isentando', 0, opa(opaAoLado, 'teste/opa/v7_ao-lado').errors.length));
  } finally {
    if (pisoDeFora === undefined) delete process.env.FAROL_PISO_OPACIDADE;
    else process.env.FAROL_PISO_OPACIDADE = pisoDeFora;
  }
  // A fila de dívida da OPACIDADE-MARCA: os quatro comportamentos, com duas mensagens para distinguir
  // "cresce" de "quita".
  const opaDois = versaoDeTeste('opa-dois', { 'Chart.tsx': graf('<Scatter fill="var(--chart-1)" fillOpacity={0.45} />\n    <Area dataKey="v" fill="var(--positive)" fillOpacity={0.3} stroke="none" />') });
  lixo.push(opaDois);
  provas.push(prova('OPACIDADE-MARCA acusa as DUAS marcas quando as duas estão abaixo', 2, opa(opaDois, 'teste/opa/v18_dois').errors.length));
  const filaOpa = path.join(TMP_DIR, `fila-opa-${process.pid}.json`);
  const gravarOpa = (conteudo) => {
    fs.writeFileSync(filaOpa, JSON.stringify(conteudo), 'utf8');
    process.env.FAROL_FILA_DIVIDA = filaOpa;
    esquecerDivida();
  };
  try {
    gravarOpa({ 'teste/opa/v18_dois': { 'OPACIDADE-MARCA': 2 } });
    provas.push(prova('fila de dívida troca erro por aviso na peça registrada em OPACIDADE-MARCA', '0 erro(s) e 2 aviso(s)', conta(opa(opaDois, 'teste/opa/v18_dois'))));
    provas.push(prova('fila de dívida barra a peça nova com a mesma opacidade', '2 erro(s) e 0 aviso(s)', conta(opa(opaDois, 'teste/opa/v98_nova'))));
    gravarOpa({ 'teste/opa/v18_dois': { 'OPACIDADE-MARCA': 1 }, 'teste/opa/v19_quitada': { 'OPACIDADE-MARCA': 1 } });
    provas.push(prova('fila de dívida volta a reprovar quando a dívida de opacidade cresce', '1 erro(s) e 0 aviso(s)', conta(opa(opaDois, 'teste/opa/v18_dois'))));
    provas.push(prova('fila de dívida pede a remoção da chave de opacidade já quitada', '0 erro(s) e 1 aviso(s)', conta(opa(opaBom, 'teste/opa/v19_quitada'))));
  } finally {
    delete process.env.FAROL_FILA_DIVIDA;
    fs.rmSync(filaOpa, { force: true });
    esquecerDivida();
  }

  // --- TEXTO-NA-MARCA (ROT-6, ROT-7b). O par central é o MESMO rótulo com a marca inteira por baixo e
  // com a borda da marca no meio da tinta: no primeiro o halo esconde a violação e a guarda acusa; no
  // segundo o halo é a resposta certa da ROT-7 e a guarda se cala, porque ali quem mede é a
  // CONTRASTE-TEXTO. Os números do fixture são os do acervo: --text-primary sobre --chart-1 mede
  // 1,53:1 no escuro e 2,99:1 no claro, e contra o halo dá 14,53:1 e 17,96:1.
  const rotuloComHalo = (x, y, texto) =>
    `<text x="${x}" y="${y}" style="fill:rgb(232, 237, 247);stroke:rgb(18, 28, 46);stroke-width:4px;paint-order:stroke;` +
    `font-size:12px;text-anchor:middle;dominant-baseline:central">${texto}</text>`;
  const rotuloComHaloClaro = (x, y, texto) =>
    `<text x="${x}" y="${y}" style="fill:rgb(14, 23, 38);stroke:rgb(255, 255, 255);stroke-width:4px;paint-order:stroke;` +
    `font-size:12px;text-anchor:middle;dominant-baseline:central">${texto}</text>`;
  const fatia = (x0, largura, cor) => `<rect x="${x0}" y="20" width="${largura}" height="60" style="fill:${cor}"/>`;
  const CHART1 = { dark: 'rgb(45, 212, 232)', light: 'rgb(11, 109, 125)' };
  const SEQ1 = { dark: 'rgb(13, 42, 58)', light: 'rgb(220, 236, 242)' };

  // 1. ACUSA: a marca inteira por baixo, halo por cima, --text-primary sobre --chart-1.
  const naMarcaRuim = versaoDeTeste('nam-ruim', {
    'preview.svg': previewDeTeste('dark', fatia(10, 200, CHART1.dark) + rotuloComHalo(110, 50, '44%')),
    'preview-claro.svg': previewDeTeste('light', fatia(10, 200, CHART1.light) + rotuloComHaloClaro(110, 50, '44%')),
  });
  // 2. PASSA: a MESMA tinta, o MESMO halo, com a borda da marca no meio dela. O halo é a ROT-7 fazendo
  // o que foi escrita para fazer, e a guarda não julga: sai `tinta_cruza_fundo`.
  const naMarcaCruza = versaoDeTeste('nam-cruza', {
    'preview.svg': previewDeTeste('dark', fatia(10, 100, CHART1.dark) + rotuloComHalo(110, 50, '44%')),
    'preview-claro.svg': previewDeTeste('light', fatia(10, 100, CHART1.light) + rotuloComHaloClaro(110, 50, '44%')),
  });
  // 3. PASSA: halo legítimo sobre LINHA DE REFERÊNCIA, o caso literal da ROT-7. A linha é traço e não
  // entra no fundo, então o rótulo está sobre o cartão, mede acima do piso e nada é acusado.
  const naMarcaLinha = versaoDeTeste('nam-linha', {
    'preview.svg': previewDeTeste(
      'dark',
      '<line x1="0" y1="50" x2="600" y2="50" style="stroke:rgb(31, 46, 71);stroke-width:2px"/>' + rotuloComHalo(110, 50, '44%'),
    ),
    'preview-claro.svg': previewDeTeste(
      'light',
      '<line x1="0" y1="50" x2="600" y2="50" style="stroke:rgb(220, 227, 239);stroke-width:2px"/>' + rotuloComHaloClaro(110, 50, '44%'),
    ),
  });
  // 4. PASSA: sobre a RAMPA a régua inverte, e --text-primary alcança 12,69:1 e 14,82:1 em --seq-1.
  // É o falso positivo que custaria mais caro, porque reprovaria toda célula de mapa de calor.
  const naMarcaRampa = versaoDeTeste('nam-rampa', {
    'preview.svg': previewDeTeste('dark', fatia(10, 200, SEQ1.dark) + rotuloComHalo(110, 50, '44%')),
    'preview-claro.svg': previewDeTeste('light', fatia(10, 200, SEQ1.light) + rotuloComHaloClaro(110, 50, '44%')),
  });
  // 5. PASSA: a saída que a ROT-7b manda usar, o vazado na cor da superfície e SEM halo (9,50:1 e 6,00:1).
  const vazado = (x, y, cor, texto) =>
    `<text x="${x}" y="${y}" style="fill:${cor};font-size:12px;text-anchor:middle;dominant-baseline:central">${texto}</text>`;
  const naMarcaVazado = versaoDeTeste('nam-vazado', {
    'preview.svg': previewDeTeste('dark', fatia(10, 200, CHART1.dark) + vazado(110, 50, 'rgb(18, 28, 46)', '44%')),
    'preview-claro.svg': previewDeTeste('light', fatia(10, 200, CHART1.light) + vazado(110, 50, 'rgb(255, 255, 255)', '44%')),
  });
  lixo.push(naMarcaRuim, naMarcaCruza, naMarcaLinha, naMarcaRampa, naMarcaVazado);
  const nam = (dir, rel, esc = semEscapes) => G.guardaTextoNaMarca(dir, esc, rel);
  const ruim = nam(naMarcaRuim, 'teste/nam/v1_ruim');
  provas.push(prova('TEXTO-NA-MARCA acusa --text-primary com a marca inteira por baixo, escondido pelo halo', 1, ruim.errors.length));
  provas.push(prova('TEXTO-NA-MARCA dá o número da MARCA, 1,53:1 no escuro, e não o do halo', true, (ruim.errors[0] ?? '').includes('1,53:1 no escuro')));
  provas.push(prova('TEXTO-NA-MARCA diz também o número que o halo dava, 14,53:1', true, (ruim.errors[0] ?? '').includes('14,53:1')));
  provas.push(prova('TEXTO-NA-MARCA mede o tema claro no arquivo dele, 2,99:1', true, (ruim.errors[0] ?? '').includes('2,99:1 no claro')));
  provas.push(prova('TEXTO-NA-MARCA nomeia a cor da marca pelo slot de gráfico, não pelo apelido de acento', true, (ruim.errors[0] ?? '').includes('sobre --chart-1')));
  provas.push(prova('TEXTO-NA-MARCA diz qual texto resolveria, da mesma tabela que o dossiê imprime', true, (ruim.errors[0] ?? '').includes('--accent-cyan-contrast')));
  // A prova que separa esta guarda de um simples "pare de compor o halo": a MESMA tinta com o MESMO
  // halo, só com a borda da marca no meio dela, tem de passar.
  const cruza = nam(naMarcaCruza, 'teste/nam/v2_cruza');
  provas.push(prova('TEXTO-NA-MARCA não julga a tinta que CRUZA a borda da marca, que é a ROT-7 certa', 0, cruza.errors.length));
  provas.push(prova('TEXTO-NA-MARCA conta o cruzamento em vez de calar sobre ele', 'tinta_cruza_fundo', cruza.medicao.motivo));
  provas.push(prova('TEXTO-NA-MARCA nomeia o cruzamento por tema no detalhe da medição', 1, cruza.medicao.naoMedidos?.['escuro:tinta_cruza_fundo']));
  provas.push(prova('TEXTO-NA-MARCA deixa passar halo sobre linha de referência, o caso literal da ROT-7', 0, nam(naMarcaLinha, 'teste/nam/v3_linha').errors.length));
  provas.push(prova('TEXTO-NA-MARCA deixa passar --text-primary sobre a RAMPA, onde a régua inverte', 0, nam(naMarcaRampa, 'teste/nam/v4_rampa').errors.length));
  provas.push(prova('TEXTO-NA-MARCA deixa passar o vazado sem halo, que é a saída da ROT-7b', 0, nam(naMarcaVazado, 'teste/nam/v5_vazado').errors.length));
  const comEscapeNaMarca = G.lerEscapes('// check-ok: TEXTO-NA-MARCA a fatia é o assunto deste estudo\n', 'Chart.tsx');
  provas.push(prova('TEXTO-NA-MARCA se cala com o escape de arquivo', 0, nam(naMarcaRuim, 'teste/nam/v6_escape', comEscapeNaMarca).errors.length));
  const filaNaMarca = path.join(TMP_DIR, `fila-nam-${process.pid}.json`);
  try {
    fs.writeFileSync(filaNaMarca, JSON.stringify({ 'teste/nam/v1_ruim': { 'TEXTO-NA-MARCA': 1 } }), 'utf8');
    process.env.FAROL_FILA_DIVIDA = filaNaMarca;
    esquecerDivida();
    provas.push(prova('fila de dívida troca erro por aviso na peça registrada em TEXTO-NA-MARCA', '0 erro(s) e 1 aviso(s)', conta(nam(naMarcaRuim, 'teste/nam/v1_ruim'))));
    provas.push(prova('fila de dívida barra a peça NOVA com o mesmo defeito', '1 erro(s) e 0 aviso(s)', conta(nam(naMarcaRuim, 'teste/nam/v7_nova'))));
    provas.push(prova('fila de dívida pede a remoção da chave já quitada em TEXTO-NA-MARCA', '0 erro(s) e 1 aviso(s)', conta(nam(naMarcaVazado, 'teste/nam/v1_ruim'))));
  } finally {
    delete process.env.FAROL_FILA_DIVIDA;
    fs.rmSync(filaNaMarca, { force: true });
    esquecerDivida();
  }

  // --- RAIO-CONTRA-AREA (GEO-3), F0.4 de 2026-10-02. O fixture central é a rosa de `07/07 v1` com a
  // geometria que ela tem no acervo (raio mínimo de 33,88 px, máximo de 98,56 px, topo de escala de
  // R$ 50 mil) e os doze valores do `data.ts` dela. Com a MEIA CORREÇÃO que a peça carregava até
  // 2026-09-28, a conta tem de dar os números que a GEO-3 registrou à mão: o setor de pico com 15,05% do
  // valor desenha 12,89% da área, desvio de 2,16 p.p. Com a forma que a GEO-3 manda, a guarda cala.
  const A = await import('./lib/area.mjs');
  const VALORES_DA_ROSA = [14200, 12800, 18400, 22100, 19700, 26300, 31500, 28900, 35200, 42900, 24600, 8400];
  const dadoDe = (campo, valores) => `export const data = [\n${valores.map((v, i) => `  { id: 'item-${i}', ${campo}: ${v} },`).join('\n')}\n];\n`;
  // Ângulo em graus a partir do topo, no sentido horário, e coordenada com quatro casas, como o Recharts.
  const ponto = (cx, cy, r, graus) => `${(cx + r * Math.sin((graus * Math.PI) / 180)).toFixed(4)},${(cy - r * Math.cos((graus * Math.PI) / 180)).toFixed(4)}`;
  const setorDeAnel = (cx, cy, r0, r1, g0, g1) =>
    `<path cx="${cx}" cy="${cy}" d="M ${ponto(cx, cy, r1, g0)} A ${r1.toFixed(4)},${r1.toFixed(4)},0,${g1 - g0 > 180 ? 1 : 0},1,${ponto(cx, cy, r1, g1)} ` +
    `L ${ponto(cx, cy, r0, g1)} A ${r0},${r0},0,${g1 - g0 > 180 ? 1 : 0},0,${ponto(cx, cy, r0, g0)} Z" style="fill:rgb(45, 212, 232)"/>`;
  const fatiaDePizza = (cx, cy, r, g0, g1) =>
    `<path cx="${cx}" cy="${cy}" d="M ${ponto(cx, cy, r, g0)} A ${r.toFixed(4)},${r.toFixed(4)},0,${g1 - g0 > 180 ? 1 : 0},1,${ponto(cx, cy, r, g1)} L ${cx},${cy} Z" style="fill:rgb(45, 212, 232)"/>`;
  const rosaCom = (rMin, raioDe) => VALORES_DA_ROSA.map((v, i) => setorDeAnel(158, 158, rMin, raioDe(v), i * 30, i * 30 + 30)).join('');
  const area = (nome, marcas, dado, esc = semEscapes, rel = `teste/are/${nome}`) => {
    const dir = versaoDeTeste(`are-${nome}`, { 'preview.svg': previewDeTeste('dark', marcas), ...(dado === null ? {} : { 'data.ts': dado }) });
    lixo.push(dir);
    return G.guardaRaioContraArea(dir, esc, rel);
  };
  const [R_MIN, R_MAX, TOPO] = [33.88, 98.56, 50000];
  const rosaMeia = rosaCom(R_MIN, (v) => R_MIN + (R_MAX - R_MIN) * Math.sqrt(v / TOPO));
  const rosaCerta = rosaCom(R_MIN, (v) => Math.sqrt(R_MIN ** 2 + (R_MAX ** 2 - R_MIN ** 2) * (v / TOPO)));
  const rosaLinear = rosaCom(R_MIN, (v) => R_MIN + (R_MAX - R_MIN) * (v / TOPO));
  const dadoDaRosa = dadoDe('value', VALORES_DA_ROSA);

  // 1. ACUSA a meia correção, que tem a raiz escrita no código, com os números da GEO-3.
  const meia = area('meia', rosaMeia, dadoDaRosa);
  provas.push(prova('RAIO-CONTRA-AREA acusa a meia correção da rosa, a raiz do lado de fora do raio mínimo', 1, meia.errors.length));
  provas.push(prova('RAIO-CONTRA-AREA nomeia a lei que reconheceu', true, (meia.errors[0] ?? '').includes('meia correção')));
  provas.push(prova('RAIO-CONTRA-AREA dá o desvio que a GEO-3 mediu à mão na rosa, 2,16 p.p.', true, (meia.errors[0] ?? '').includes('desvio de 2,16 p.p.')));
  provas.push(prova('RAIO-CONTRA-AREA diz qual marca e as duas participações, 15,05% do valor e 12,89% da área', true, (meia.errors[0] ?? '').includes('valor 42.900 tem 15,05% do total e desenha 12,89% da área')));
  provas.push(prova('RAIO-CONTRA-AREA diz com qual campo do data.ts casou a marca', true, (meia.errors[0] ?? '').includes('`data[].value`')));
  // 2. PASSA a forma que a GEO-3 manda, na mesma geometria e no mesmo dado.
  const certa = area('certa', rosaCerta, dadoDaRosa);
  provas.push(prova('RAIO-CONTRA-AREA deixa passar a raiz com o raio mínimo do lado de dentro', '0 erro(s) e 0 aviso(s)', conta(certa)));
  provas.push(prova('e a forma certa conta como MEDIDA, com desvio dentro da tolerância', true, certa.medicao.medida && certa.medicao.pior <= 0.01));
  // 3. ACUSA o raio em linha com o valor, a primeira forma errada da GEO-3.
  const linear = area('linear', rosaLinear, dadoDaRosa);
  provas.push(prova('RAIO-CONTRA-AREA acusa a espessura do setor em linha com o valor', true, linear.errors.length === 1 && linear.errors[0].includes('RAIO cresce em linha')));
  // 4. NÃO ACUSA a coluna radial da GEO-5: o MESMO raio em linha com o valor, com furo de mais de meio raio.
  const coluna = area('coluna', rosaCom(115, (v) => 115 + (180 - 115) * (v / TOPO)), dadoDaRosa);
  provas.push(prova('RAIO-CONTRA-AREA não acusa a coluna radial, que a GEO-5 manda ler por comprimento', '0 erro(s) e 0 aviso(s)', conta(coluna)));
  provas.push(prova('e a coluna radial sai com motivo, não como medida', 'comprimento_radial', coluna.medicao.motivo));
  // 5. BOLHA: raio em linha acusa; raiz passa; área com piso declarado passa, que é a saída da GEO-3.
  const INVESTIMENTOS = [62000, 48000, 35000, 28000, 9000];
  const bolhas = (raioDe) => INVESTIMENTOS.map((v, i) => `<circle cx="${60 + i * 90}" cy="150" r="${raioDe(v)}" style="fill:rgb(45, 212, 232)"/>`).join('');
  const dadoDasBolhas = dadoDe('investimento', INVESTIMENTOS);
  provas.push(prova('RAIO-CONTRA-AREA acusa a bolha de raio em linha com o valor', 1, area('bolha-linear', bolhas((v) => (30 * v) / 62000), dadoDasBolhas).errors.length));
  // "Passa" aqui é passar MEDIDA: guarda cega também devolve zero erro, e não é isso que se prova.
  const passaMedida = (r) => `${conta(r)}, ${r.medicao.medida ? 'medida' : `não medida por ${r.medicao.motivo}`}`;
  provas.push(prova('RAIO-CONTRA-AREA deixa passar a bolha de raio pela raiz', '0 erro(s) e 0 aviso(s), medida', passaMedida(area('bolha-raiz', bolhas((v) => 30 * Math.sqrt(v / 62000)), dadoDasBolhas))));
  const comPiso = area('bolha-piso', bolhas((v) => Math.sqrt((50 + (v / 62000) * 2750) / Math.PI)), dadoDasBolhas);
  provas.push(prova('RAIO-CONTRA-AREA deixa passar a bolha de área com piso declarado', true, comPiso.errors.length === 0 && comPiso.medicao.medida));
  // 6. DOIS CANAIS, três marcas, sem furo: os números de `06/05 v1`, a peça que o acervo carrega. O ângulo
  // segue o investimento e o raio segue o CPL pela meia correção com piso de 32%.
  const [INVEST, CPL] = [[42000, 68000, 15000], [500, 1000, 2500]];
  const doisCanais = (raioDe) => {
    let grau = 0;
    return INVEST.map((v, i) => {
      const abertura = (360 * v) / 125000;
      grau += abertura;
      return fatiaDePizza(130, 130, raioDe(CPL[i]), grau - abertura, grau);
    }).join('');
  };
  const dadoDosCanais = `export const data = [\n${INVEST.map((v, i) => `  { investimento: ${v}, cplQualificado: ${CPL[i]} },`).join('\n')}\n];\n`;
  const pizzaMeia = area('pizza-meia', doisCanais((v) => 120 * 0.32 + 120 * 0.68 * Math.sqrt(v / 2500)), dadoDosCanais);
  provas.push(prova('RAIO-CONTRA-AREA acusa a meia correção no raio da pizza de dois canais, com três marcas', true, pizzaMeia.errors.length === 1 && pizzaMeia.errors[0].includes('canal do raio')));
  provas.push(prova('e mede o estrago acima do piso, 7,93 p.p., contra o campo do RAIO e não o do ângulo', true, (pizzaMeia.errors[0] ?? '').includes('desvio de 7,93 p.p.') && (pizzaMeia.errors[0] ?? '').includes('`data[].cplQualificado`')));
  provas.push(prova('RAIO-CONTRA-AREA deixa passar a mesma pizza com a coroa acima do piso proporcional ao valor', '0 erro(s) e 0 aviso(s), medida', passaMedida(area('pizza-certa', doisCanais((v) => Math.sqrt(36 ** 2 + (120 ** 2 - 36 ** 2) * (v / 2500))), dadoDosCanais))));
  // 7. NÃO MEDIDA, sempre com motivo: o grupo que nenhum vetor explica não é acusado nem aprovado.
  const semValor = area('sem-valor', rosaLinear, 'export const data = [{ a: 1 }, { a: 2 }];\n');
  provas.push(prova('RAIO-CONTRA-AREA não acusa o que não reconhece: valor que não está no data.ts', '0 erro(s)|valor_nao_casado', `${semValor.errors.length} erro(s)|${semValor.medicao.motivo}`));
  provas.push(prova('RAIO-CONTRA-AREA sem fatia, setor nem bolha sai sem_marca_de_area', 'sem_marca_de_area', area('sem-marca', '<rect x="10" y="10" width="200" height="12" style="fill:rgb(45, 212, 232)"/>', dadoDaRosa).medicao.motivo));
  provas.push(prova('RAIO-CONTRA-AREA com data.ts que não abre sai sem_dado', 'sem_dado', area('sem-dado', rosaMeia, null).medicao.motivo));
  // 8. O LEITOR: abertura do arco, círculo do símbolo do Scatter, e a escala que tira a marca da conta.
  const lidas = A.lerMarcasDeArea(previewDeTeste('dark', fatiaDePizza(100, 100, 80, 0, 90) + '<path transform="translate(40, 40)" d="M12,0A12,12,0,1,1,-12,0A12,12,0,1,1,12,0" style="fill:rgb(45, 212, 232)"/>' + '<g transform="scale(2)"><circle cx="5" cy="5" r="3" style="fill:rgb(45, 212, 232)"/></g>'));
  provas.push(prova('o leitor de área mede a abertura da fatia pelo arco, 90 graus', 90, Math.round(((lidas.setores[0]?.abertura ?? 0) * 180) / Math.PI)));
  provas.push(prova('o leitor de área lê o símbolo do Scatter como círculo, mesmo com translate', 12, lidas.circulos[0]?.r));
  provas.push(prova('o leitor de área tira da conta a marca sob scale, e conta quantas tirou', 1, lidas.foraPorTransform));
  // 9. ESCAPE de arquivo e FILA DE DÍVIDA: erro fora da fila, aviso dentro, e pedido de limpeza na quitada.
  const comEscapeDeArea = G.lerEscapes('// check-ok: RAIO-CONTRA-AREA a peça é o contraexemplo do estudo\n', 'Chart.tsx');
  const calada = area('escape', rosaMeia, dadoDaRosa, comEscapeDeArea);
  provas.push(prova('RAIO-CONTRA-AREA se cala com o escape de arquivo, e o escape é contado', '0 erro(s)|1 usado(s)', `${calada.errors.length} erro(s)|${calada.usados.length} usado(s)`));
  const filaDeArea = path.join(TMP_DIR, `fila-are-${process.pid}.json`);
  try {
    fs.writeFileSync(filaDeArea, JSON.stringify({ 'teste/are/registrada': { 'RAIO-CONTRA-AREA': 1 } }), 'utf8');
    process.env.FAROL_FILA_DIVIDA = filaDeArea;
    esquecerDivida();
    provas.push(prova('fila de dívida troca erro por aviso na peça registrada em RAIO-CONTRA-AREA', '0 erro(s) e 1 aviso(s)', conta(area('fila-dentro', rosaMeia, dadoDaRosa, semEscapes, 'teste/are/registrada'))));
    provas.push(prova('fila de dívida barra a peça NOVA com a mesma meia correção', '1 erro(s) e 0 aviso(s)', conta(area('fila-fora', rosaMeia, dadoDaRosa, semEscapes, 'teste/are/nova'))));
    provas.push(prova('fila de dívida pede a remoção da chave quando a rosa é consertada', '0 erro(s) e 1 aviso(s)', conta(area('fila-quitada', rosaCerta, dadoDaRosa, semEscapes, 'teste/are/registrada'))));
  } finally {
    delete process.env.FAROL_FILA_DIVIDA;
    fs.rmSync(filaDeArea, { force: true });
    esquecerDivida();
  }
  // 10. DE PONTA A PONTA: a guarda é chamada pelo `check`, entra no erro da versão e na cobertura.
  const pastaDoCheck = path.join(TMP_DIR, `are-check-${process.pid}`);
  lixo.push(pastaDoCheck);
  for (const [versao, marcas] of [['v1_meia', rosaMeia], ['v2_certa', rosaCerta]]) {
    ensureDir(path.join(pastaDoCheck, versao));
    fs.writeFileSync(path.join(pastaDoCheck, versao, 'Chart.tsx'), 'export const Chart = () => <p>a</p>;\n', 'utf8');
    fs.writeFileSync(path.join(pastaDoCheck, versao, 'data.ts'), dadoDaRosa, 'utf8');
    fs.writeFileSync(path.join(pastaDoCheck, versao, 'preview.svg'), previewDeTeste('dark', marcas), 'utf8');
  }
  const relatorioDeArea = JSON.parse((await rodarScript('check.mjs', [relToVisuais(pastaDoCheck), '--sem-tipos', '--json'])).out);
  const noCheck = (versao) => relatorioDeArea.versoes.find((v) => v.caminho.endsWith(versao));
  provas.push(prova('o check chama a RAIO-CONTRA-AREA e o erro dela reprova a versão', true, (noCheck('v1_meia')?.erros ?? []).some((e) => e.includes('RAIO-CONTRA-AREA'))));
  provas.push(prova('o check não acusa a irmã certa por esta guarda', false, (noCheck('v2_certa')?.erros ?? []).some((e) => e.includes('RAIO-CONTRA-AREA'))));
  provas.push(prova('a cobertura do check conta a RAIO-CONTRA-AREA entre as guardas que medem', 2, relatorioDeArea.cobertura?.are?.medidas));

  for (const dir of lixo) fs.rmSync(dir, { recursive: true, force: true });
  const falhas = provas.filter((p) => !p).length;
  console.log(`       ${provas.length - falhas} de ${provas.length} provas de guarda passaram.`);
  return falhas === 0;
}

// ---------------------------------------------------------------------------------------------
// Vários alvos numa chamada
// ---------------------------------------------------------------------------------------------
//
// POR QUE ESTA PROVA EXISTE. `check` e `render` liam só `positional[0]`: passar vários alvos
// processava o primeiro e DESCARTAVA o resto sem uma palavra. O defeito custou uma peça em
// 2026-09-28, e o custo não foi o alvo perdido; foi a leitura, porque um conserto que nunca rodou tem
// a mesma cara de um conserto que não pegou, e a suspeita contamina tudo o que vem depois.
//
// Duas provas fecham a porta: dois alvos têm de virar DOIS processamentos, e um alvo inexistente ao
// lado de um válido tem de acusar o caminho, processar o válido e sair com código diferente de zero.
// Nenhuma peça do catálogo é tocada: os alvos são pastas temporárias, e as versões de mentira não
// têm `meta.json`, então o `render` nem chega a empacotar ou a abrir navegador.

/** Roda um script da ferramenta num processo à parte e devolve saída e código de saída. */
function rodarScript(script, args) {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, [path.join(path.dirname(SELF), script), ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    let err = '';
    proc.stdout.on('data', (chunk) => { out += chunk; });
    proc.stderr.on('data', (chunk) => { err += chunk; });
    proc.on('exit', (code) => resolve({ code, out, err }));
  });
}

async function multialvoTest() {
  const provas = [];
  const lixo = [];
  const alvoA = versaoDeTeste('multialvo-a', { 'Chart.tsx': 'export const Chart = () => <p>a</p>;\n' });
  const alvoB = versaoDeTeste('multialvo-b', { 'Chart.tsx': 'export const Chart = () => <p>b</p>;\n' });
  const alvoVazio = path.join(TMP_DIR, `multialvo-${process.pid}-vazio`);
  ensureDir(alvoVazio);
  lixo.push(alvoA, alvoB, alvoVazio);
  const relA = relToVisuais(alvoA);
  const relB = relToVisuais(alvoB);
  const relVazio = relToVisuais(alvoVazio);
  const fantasma = `${relA}-inexistente`;

  try {
    // 1. Unidade: o planejador devolve a união das versões, na ordem dada, sem repetir pasta.
    const dois = planTargets([relA, relB]);
    provas.push(prova('planTargets processa DOIS alvos, não só o primeiro', 2, dois.versions.length));
    provas.push(prova('planTargets mantém a ordem em que os alvos foram pedidos', `${relA}|${relB}`, dois.versions.map((v) => v.rel).join('|')));
    provas.push(prova('planTargets não renderiza a mesma pasta duas vezes', 1, planTargets([relA, relA]).versions.length));
    const comFantasma = planTargets([relA, fantasma]);
    provas.push(prova('planTargets segue com o alvo válido quando o outro não existe', 1, comFantasma.versions.length));
    provas.push(prova('planTargets nomeia o alvo inexistente em vez de calar', true, (comFantasma.targets[1]?.motivo ?? '').includes(fantasma)));

    // 1b. Flag de liga-desliga no meio da lista não pode engolir o alvo seguinte como valor: era a
    // mesma perda calada pela outra porta, e é a forma como a pessoa escreve a chamada na prática.
    const meio = parseArgs(['alvo1', '--sem-tipos', 'alvo2', '--json'], { booleanFlags: ['json', 'sem-tipos'] });
    provas.push(prova('flag sem valor no meio da lista não engole o alvo seguinte', 'alvo1|alvo2', meio.positional.join('|')));
    provas.push(prova('flag sem valor no meio da lista continua ligada', true, meio.flags['sem-tipos']));
    const comValor = parseArgs([relA, '--tema', 'ambos'], { booleanFlags: ['sem-comparar', 'manter-tmp'] });
    provas.push(prova('flag com valor continua lendo o valor', 'ambos', comValor.flags.tema));

    // 2. `check` de ponta a ponta: o relatório tem de listar as duas versões pedidas.
    const checkDois = await rodarScript('check.mjs', [relA, '--sem-tipos', relB, '--json']);
    const relatorioDois = JSON.parse(checkDois.out);
    provas.push(prova('check com dois alvos relata DUAS versões', 2, relatorioDois.versoes.length));
    const checkFantasma = await rodarScript('check.mjs', [relA, fantasma, '--sem-tipos', '--json']);
    const relatorioFantasma = JSON.parse(checkFantasma.out);
    provas.push(prova('check processa o alvo válido mesmo com um inexistente na chamada', 1, relatorioFantasma.versoes.length));
    provas.push(prova('check conta o alvo inexistente como falha no relatório', 1, relatorioFantasma.alvosComFalha));
    provas.push(prova('check nomeia o caminho do alvo inexistente', true, JSON.stringify(relatorioFantasma.alvos).includes(fantasma)));
    provas.push(prova('check sai com código diferente de zero quando um alvo falha', true, checkFantasma.code !== 0));

    // 3. `render` de ponta a ponta: dois desfechos, um por versão, e não um só.
    const renderDois = await rodarScript('render.mjs', [relA, relB]);
    const desfechos = [relA, relB].filter((rel) => renderDois.out.includes(`${rel} [escuro]`)).length;
    provas.push(prova('render com dois alvos processa as DUAS versões', 2, desfechos));
    // O alvo sem versão continua saindo com zero neste comando, então o código de saída aqui mede só
    // o alvo inexistente: é a prova limpa de que a falha de um alvo chega ao código de saída.
    const renderVazio = await rodarScript('render.mjs', [relVazio]);
    provas.push(prova('render com alvo sem versão continua saindo com zero', 0, renderVazio.code));
    const renderFantasma = await rodarScript('render.mjs', [relVazio, fantasma]);
    provas.push(prova('render sai com código diferente de zero por causa do alvo inexistente', true, renderFantasma.code !== 0));
    provas.push(prova('render nomeia o caminho do alvo inexistente', true, renderFantasma.out.includes(fantasma)));

    // 4. Zero alvo posicional: a mensagem de uso de antes, nos dois comandos.
    for (const script of ['check.mjs', 'render.mjs']) {
      const semAlvo = await rodarScript(script, []);
      provas.push(prova(`${script} sem alvo continua pedindo o caminho`, true, semAlvo.err.includes('Informe o caminho relativo a VISUAIS') && semAlvo.code !== 0));
    }
  } finally {
    for (const dir of lixo) fs.rmSync(dir, { recursive: true, force: true });
  }

  const falhas = provas.filter((p) => !p).length;
  console.log(`       ${provas.length - falhas} de ${provas.length} provas de vários alvos passaram.`);
  return falhas === 0;
}

/**
 * Cobertura por versão no relatório em texto do `check`.
 *
 * POR QUE EXISTE: o `check` fechava a cobertura só agregada por guarda ("0 de 4 medidas; não
 * medidas: sem_grade 4"), que diz QUANTAS versões ficaram de fora e nunca QUAIS. Quem produz precisa
 * da segunda, porque é no `notes` da versão que ele escreve o número medido à mão; a saída dele era
 * rodar o `check` de novo com alvo isolado, uma execução por candidata, cada uma pegando trava.
 *
 * O par discriminante é FORMATO-ACESSIVEL com DOIS motivos diferentes na mesma chamada: o agregado
 * mostra os dois motivos sem ligar nenhum a uma versão, então esta prova falha se alguém voltar a
 * imprimir só o agregado, e falha também se o detalhe trocar os motivos entre as duas versões.
 *
 * As duas versões diferem só no texto do `Chart.tsx`, sem preview e sem navegador.
 */
async function coberturaPorVersaoTest() {
  const provas = [];
  const lixo = [];
  /** Uma pasta de modelo com N versões, porque o teto de nomeação se mede com o alvo inteiro. */
  const pastaComVersoes = (nome, versoes) => {
    const dir = path.join(TMP_DIR, `cobertura-${process.pid}-${nome}`);
    for (const [versao, fonte] of Object.entries(versoes)) {
      ensureDir(path.join(dir, versao));
      fs.writeFileSync(path.join(dir, versao, 'Chart.tsx'), fonte, 'utf8');
    }
    lixo.push(dir);
    return relToVisuais(dir);
  };
  const semFrase = 'export const Chart = () => <span className="kpi-number">{42}</span>;\n';
  const comFrase =
    'export const Chart = () => (\n' +
    '  <div aria-label="Meta batida." role="img">\n' +
    '    <span className="kpi-number">{42}</span>\n' +
    '  </div>\n' +
    ');\n';

  try {
    const par = pastaComVersoes('par', { v1_sem_frase: semFrase, v2_com_frase: comFrase });
    const saida = await rodarScript('check.mjs', [par, '--sem-tipos']);
    const linhas = saida.out.split(/\r?\n/);
    const iCabecalho = linhas.findIndex((l) => l.startsWith('[check] cobertura por versão'));
    provas.push(prova('check imprime a cobertura POR VERSÃO, e não só o agregado por guarda', true, iCabecalho >= 0));
    const cabecalho = linhas[iCabecalho] ?? '';
    const detalhe = iCabecalho < 0 ? [] : linhas.slice(iCabecalho + 1).filter((l) => l.startsWith('[check]   '));
    provas.push(prova('a cobertura por versão dá uma linha por versão com guarda não medida', 2, detalhe.length));
    const linhaSemFrase = detalhe.find((l) => l.includes('v1_sem_frase')) ?? '';
    const linhaComFrase = detalhe.find((l) => l.includes('v2_com_frase')) ?? '';
    provas.push(prova('a versão sem frase acessível carrega o motivo DELA', true, linhaSemFrase.includes('FORMATO-ACESSIVEL (DAD-9) sem_frase_acessivel')));
    provas.push(prova('a versão com frase sem formatador carrega o motivo DELA', true, linhaComFrase.includes('FORMATO-ACESSIVEL (DAD-9) frase_sem_formatador')));
    provas.push(prova('a cobertura por versão não troca o motivo de uma pela outra', false, linhaSemFrase.includes('frase_sem_formatador') || linhaComFrase.includes('sem_frase_acessivel')));
    provas.push(prova('o cabeçalho declara o critério de corte na própria saída', true, cabecalho.includes('teto de 12')));

    // O agregado continua de pé: ele é o complemento, porque dá o denominador por guarda, que a
    // linha por versão não tem. O conserto acrescenta, não substitui.
    provas.push(prova('o agregado por guarda continua saindo junto', true, linhas.some((l) => l.includes('FORMATO-ACESSIVEL (DAD-9): 0 de 2 versão(ões) medidas'))));

    // Teto: acima dele a saída nomeia as primeiras e DIZ quantas ficaram sem nomear, em vez de
    // inundar a varredura do acervo com mais de 400 linhas.
    const muitos = pastaComVersoes('muitos', Object.fromEntries(Array.from({ length: 13 }, (_, i) => [`v${i + 1}_a`, semFrase])));
    const saidaMuitos = await rodarScript('check.mjs', [muitos, '--sem-tipos']);
    const linhasMuitos = saidaMuitos.out.split(/\r?\n/);
    const iMuitos = linhasMuitos.findIndex((l) => l.startsWith('[check] cobertura por versão'));
    const detalheMuitos = iMuitos < 0 ? [] : linhasMuitos.slice(iMuitos + 1).filter((l) => l.startsWith('[check]   '));
    provas.push(prova('acima do teto, nomeia 12 versões e para', 12, detalheMuitos.length));
    provas.push(prova('acima do teto, diz quantas ficaram sem nomear', true, (linhasMuitos[iMuitos] ?? '').includes('13 de 13') && (linhasMuitos[iMuitos] ?? '').includes('1 sem nomear')));

    // A medição em si já vinha no `--json`, por versão: o conserto é de apresentação, e esta prova
    // amarra as duas saídas à mesma medição, para não nascer um segundo cálculo divergente.
    const comJson = await rodarScript('check.mjs', [par, '--sem-tipos', '--json']);
    const relatorio = JSON.parse(comJson.out);
    const daPrimeira = relatorio.versoes.find((v) => v.caminho.endsWith('v1_sem_frase'))?.fmt;
    provas.push(prova('--json já trazia a cobertura por versão, e o texto lê a mesma medição', 'sem_frase_acessivel', daPrimeira?.motivo));
  } finally {
    for (const dir of lixo) fs.rmSync(dir, { recursive: true, force: true });
  }

  const falhas = provas.filter((p) => !p).length;
  console.log(`       ${provas.length - falhas} de ${provas.length} provas de cobertura por versão passaram.`);
  return falhas === 0;
}

// ---------------------------------------------------------------------------------------------
// Carimbo da biblioteca compartilhada (`data-farol-lib`)
// ---------------------------------------------------------------------------------------------
//
// POR QUE ESTA PROVA EXISTE. O carimbo de origem cobre `Chart.tsx`, `data.ts` e `meta.json`, e o que a
// peça IMPORTA do Farol ficava de fora: mexer num formatador de `format.ts` (487 das 491 versões o
// importam) mudava o desenho de centenas de previews com o `check` verde. O carimbo novo fecha isso
// como AVISO, separado do de origem, porque somado a ele a primeira linha mexida na biblioteca
// reprovaria o acervo aprovado inteiro.
//
// O CONTRAFACTUAL não toca em `app/`: a biblioteca é copiada para uma pasta temporária, UM formatador
// é alterado na cópia, e a prova corre nos dois sentidos. No sentido real, o preview foi carimbado com
// a biblioteca de hoje e o `check` olha para a biblioteca alterada. No sentido inverso, o preview
// carrega o carimbo da alterada e o `check` de ponta a ponta olha para a de hoje. Os dois têm de
// acusar, como aviso e nunca como erro.
//
// As três bordas que decidem se a guarda reprova acervo correto também são provadas: preview sem o
// atributo (anterior à emenda) fica calado; o aviso da biblioteca não se esconde atrás do de tokens;
// e fim de linha CRLF não muda o carimbo, senão um checkout em outra máquina acenderia tudo.
//
// A LISTA do carimbo segue o alcance (ajuste F0.2b, 2026-10-01): `valueFormat.ts` entrou porque 153
// versões dependem dele e `chartAria.ts` saiu porque nenhuma o importa. As provas do ajuste cobram os
// dois lados por comportamento (um pesa, o outro não) e a regra por presença (todo arquivo listado é
// alcançado por alguma versão), sem fixar quantas versões alcançam cada um.

/** Cópia dos arquivos da biblioteca numa pasta temporária, na mesma árvore de `app/src`. */
function copiaDaBiblioteca(nome, { crlf = false } = {}) {
  const dir = path.join(TMP_DIR, `lib-${process.pid}-${nome}`);
  for (const rel of LIB_FILES) {
    const origem = path.join(APP_SRC, ...rel.split('/'));
    if (!fs.existsSync(origem)) continue;
    const destino = path.join(dir, ...rel.split('/'));
    ensureDir(path.dirname(destino));
    const texto = fs.readFileSync(origem, 'utf8');
    fs.writeFileSync(destino, crlf ? texto.replace(/\r?\n/g, '\r\n') : texto, 'utf8');
  }
  return dir;
}

/**
 * Uma versão de mentira com os previews carimbados à mão. `lib: null` é o preview anterior à emenda,
 * sem o atributo; o carimbo de origem sai dos arquivos da própria pasta, como no render.
 */
function versaoCarimbada(nome, { lib, tokens = tokensHash(), origemVelha = false, claro = false }) {
  const dir = versaoDeTeste(nome, {
    'Chart.tsx': 'export default function Chart() {\n  return <p>carimbo</p>;\n}\n',
    'data.ts': '// Dado fictício e fixo.\nexport const data = [1, 2, 3];\n',
    'meta.json': '{}\n',
  });
  const cabecalho = (tema) =>
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" role="img" aria-label="Carimbo de teste" ' +
    `data-farol-source="${origemVelha ? '0'.repeat(16) : sourceHash(dir)}" data-farol-tokens="${tokens}"` +
    (lib === null ? '' : ` data-farol-lib="${lib}"`) +
    ` data-farol-theme="${tema}" data-farol-renderer="1"></svg>\n`;
  fs.writeFileSync(path.join(dir, 'preview.svg'), cabecalho('dark'), 'utf8');
  if (claro) fs.writeFileSync(path.join(dir, 'preview-claro.svg'), cabecalho('light'), 'utf8');
  return dir;
}

const AVISO_BIBLIOTECA = 'preview desatualizado (biblioteca)';

async function carimboBibliotecaTest() {
  const { checkPreviewStamps } = await import('./lib/contract.mjs');
  const provas = [];
  const lixo = [];
  const conta = (r) => `${r.errors.length} erro(s) e ${r.warnings.length} aviso(s)`;
  const daBiblioteca = (lista) => lista.filter((texto) => texto.includes(AVISO_BIBLIOTECA));

  try {
    // 1. O carimbo em si. A lista é cobrada por PRESENÇA: arquivo novo entra sem esta prova cair.
    const atual = libHash();
    // Ajuste F0.2b (2026-10-01): `valueFormat.ts` entrou nos pedidos e `chartAria.ts` saiu deles.
    const pedidos = ['lib/format.ts', 'lib/utils.ts', 'components/visuals/valueFormat.ts', 'components/visuals/charts/chartTheme.ts', 'components/visuals/charts/ChartTooltip.tsx'];
    provas.push(prova('a lista do carimbo traz os arquivos que o contrato nomeia, valueFormat.ts entre eles', 'nenhum de fora', pedidos.filter((rel) => !LIB_FILES.includes(rel)).join(', ') || 'nenhum de fora'));
    provas.push(prova('o carimbo da biblioteca tem a forma que o leitor do preview aceita', true, /^[a-f0-9]{16}$/.test(atual)));
    const fiel = copiaDaBiblioteca('fiel');
    const emCrlf = copiaDaBiblioteca('crlf', { crlf: true });
    lixo.push(fiel, emCrlf);
    provas.push(prova('a cópia fiel da biblioteca dá o MESMO carimbo: ele é do conteúdo, não do caminho', atual, libHash(fiel)));
    provas.push(prova('fim de linha CRLF não muda o carimbo', atual, libHash(emCrlf)));
    // Cada arquivo da lista tem de pesar: um arquivo listado que não entra na conta é carimbo cego.
    const semPeso = LIB_FILES.filter((rel) => {
      const copia = copiaDaBiblioteca(`peso-${rel.replace(/[^a-z0-9]/gi, '-')}`);
      lixo.push(copia);
      ensureDir(path.dirname(path.join(copia, ...rel.split('/'))));
      fs.appendFileSync(path.join(copia, ...rel.split('/')), '\nexport const MEXIDO = true;\n', 'utf8');
      return libHash(copia) === atual;
    });
    provas.push(prova('mexer em QUALQUER arquivo da lista muda o carimbo', 'todos pesam', semPeso.join(', ') || 'todos pesam'));

    // 1b. O ajuste da lista (F0.2b). Os dois lados da decisão do dono, por comportamento: o despachante
    // de formato que 153 versões alcançam passa a pesar, e o arquivo que nenhuma versão importa deixa
    // de pesar. As cópias levam os dois arquivos, estejam ou não na lista, para a prova não depender dela.
    const copiaCom = (nome, rel, extra) => {
      const copia = copiaDaBiblioteca(nome);
      lixo.push(copia);
      const origem = path.join(APP_SRC, ...rel.split('/'));
      const destino = path.join(copia, ...rel.split('/'));
      ensureDir(path.dirname(destino));
      fs.writeFileSync(destino, (fs.existsSync(origem) ? fs.readFileSync(origem, 'utf8') : '') + extra, 'utf8');
      return copia;
    };
    const MEXIDA = '\nexport const MEXIDO = true;\n';
    provas.push(prova('ACUSA: mexer só no valueFormat.ts da cópia muda o carimbo', true, libHash(copiaCom('so-valueformat', 'components/visuals/valueFormat.ts', MEXIDA)) !== atual));
    provas.push(prova('PASSA: mexer no chartAria.ts, que nenhuma versão importa, não muda o carimbo', atual, libHash(copiaCom('so-chartaria', 'components/visuals/charts/chartAria.ts', MEXIDA))));
    // A regra por trás do ajuste é o ALCANCE: arquivo listado que nenhuma versão alcança só produz aviso
    // sem desenho mudado. Cobrada por presença (alguma versão alcança), nunca por quantas alcançam.
    const fontes = [
      ...findVersions(VISUAIS_DIR).map((v) => fs.readFileSync(path.join(v.abs, 'Chart.tsx'), 'utf8')),
      ...LIB_FILES.map((rel) => path.join(APP_SRC, ...rel.split('/'))).filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, 'utf8')),
    ];
    const semAlcance = (lista) =>
      lista.filter((rel) => {
        const especificador = `@/${rel.replace(/\.tsx?$/, '')}`;
        return !fontes.some((texto) => texto.includes(`'${especificador}'`) || texto.includes(`"${especificador}"`));
      });
    provas.push(prova('PASSA: todo arquivo da lista é alcançado por alguma versão do acervo', 'todos alcançados', semAlcance(LIB_FILES).join(', ') || 'todos alcançados'));
    const inventado = 'lib/arquivo-que-nenhuma-versao-importa.ts';
    provas.push(prova('ACUSA: arquivo que nenhuma versão importa sai como sem alcance', inventado, semAlcance([...LIB_FILES, inventado]).join(', ')));

    // 2. O contrafactual: um formatador alterado na cópia. O primeiro `export function` de `format.ts`
    // passa a devolver o sinal tipográfico de menos, que é o tipo de conserto que esta guarda espera.
    const alterada = copiaDaBiblioteca('alterada');
    lixo.push(alterada);
    const arquivoFormat = path.join(alterada, 'lib', 'format.ts');
    const original = fs.existsSync(arquivoFormat) ? fs.readFileSync(arquivoFormat, 'utf8') : '';
    const mexido = original.replace(/(export function \w+\([^)]*\)[^{]*\{)/, "$1\n  return '\\u2212';");
    if (original) fs.writeFileSync(arquivoFormat, mexido, 'utf8');
    provas.push(prova('o contrafactual alterou mesmo um formatador de format.ts na cópia', true, mexido !== original));
    const carimboAlterado = libHash(alterada);
    provas.push(prova('ACUSA: alterar um formatador na cópia muda o carimbo', true, carimboAlterado !== atual));

    // 3. O check, no sentido real: preview carimbado com a biblioteca de hoje, biblioteca alterada depois.
    const emDia = versaoCarimbada('lib-em-dia', { lib: atual, claro: true });
    const semAtributo = versaoCarimbada('lib-sem-atributo', { lib: null, claro: true });
    lixo.push(emDia, semAtributo);
    provas.push(prova('PASSA: preview com o carimbo da biblioteca atual', '0 erro(s) e 0 aviso(s)', conta(checkPreviewStamps(emDia))));
    const depoisDaMudanca = checkPreviewStamps(emDia, { lib: carimboAlterado });
    provas.push(prova('ACUSA: o mesmo preview, depois que o formatador mudou, sai como AVISO e não como erro', '0 erro(s) e 2 aviso(s)', conta(depoisDaMudanca)));
    provas.push(prova('o aviso leva o texto que o relatório conta', 2, daBiblioteca(depoisDaMudanca.warnings).length));
    provas.push(prova('o aviso nomeia cada arquivo de preview, o escuro e o claro', true, depoisDaMudanca.warnings.some((w) => w.startsWith('preview.svg:')) && depoisDaMudanca.warnings.some((w) => w.startsWith('preview-claro.svg:'))));
    provas.push(prova('PASSA: preview SEM o atributo, anterior à emenda, não acusa', '0 erro(s) e 0 aviso(s)', conta(checkPreviewStamps(semAtributo))));
    // A borda dita em voz alta: sem o atributo o preview é cego à mudança, e não "em dia". Quem
    // quiser contar o alcance de uma mudança na biblioteca precisa do acervo carimbado ANTES dela.
    provas.push(prova('preview sem o atributo segue calado mesmo com a biblioteca alterada: não medido, e não em dia', '0 erro(s) e 0 aviso(s)', conta(checkPreviewStamps(semAtributo, { lib: carimboAlterado }))));

    // 4. Convivência com os outros dois carimbos.
    const tokensVelhos = versaoCarimbada('lib-tokens-velhos', { lib: carimboAlterado, tokens: '0'.repeat(16) });
    const origemVelha = versaoCarimbada('lib-origem-velha', { lib: carimboAlterado, origemVelha: true });
    lixo.push(tokensVelhos, origemVelha);
    const doisAvisos = checkPreviewStamps(tokensVelhos);
    provas.push(prova('tokens e biblioteca velhos dão DOIS avisos: o da biblioteca não se esconde atrás do de tokens', '0 erro(s) e 2 aviso(s)', conta(doisAvisos)));
    provas.push(prova('um dos dois é o da biblioteca', 1, daBiblioteca(doisAvisos.warnings).length));
    const comErro = checkPreviewStamps(origemVelha);
    provas.push(prova('origem desatualizada continua sendo ERRO, e o aviso da biblioteca se cala atrás dele', '1 erro(s) e 0 aviso(s)', conta(comErro)));
    provas.push(prova('biblioteca diferente nunca vira erro de origem', 0, checkPreviewStamps(emDia, { lib: carimboAlterado }).errors.length));

    // 5. De ponta a ponta, no sentido inverso: o preview carrega o carimbo da biblioteca alterada e o
    // `check` de verdade olha para a de hoje. As versões de mentira têm outros erros (o `meta.json` é
    // vazio), então a prova olha só para onde o texto da biblioteca aparece.
    const velha = versaoCarimbada('lib-velha', { lib: carimboAlterado });
    lixo.push(velha);
    const saida = await rodarScript('check.mjs', [relToVisuais(velha), relToVisuais(emDia), relToVisuais(semAtributo), '--sem-tipos', '--json']);
    const relatorio = JSON.parse(saida.out);
    const daVersao = (dir) => relatorio.versoes.find((v) => v.caminho === relToVisuais(dir)) ?? { erros: [], avisos: [] };
    provas.push(prova('check de ponta a ponta ACUSA a biblioteca velha na lista de avisos', 1, daBiblioteca(daVersao(velha).avisos).length));
    provas.push(prova('check de ponta a ponta não põe a biblioteca velha na lista de erros', 0, daVersao(velha).erros.filter((e) => /biblioteca/.test(e)).length));
    provas.push(prova('check de ponta a ponta PASSA o preview em dia', 0, daBiblioteca([...daVersao(emDia).avisos, ...daVersao(emDia).erros]).length));
    provas.push(prova('check de ponta a ponta PASSA o preview sem o atributo', 0, daBiblioteca([...daVersao(semAtributo).avisos, ...daVersao(semAtributo).erros]).length));
  } finally {
    for (const dir of lixo) fs.rmSync(dir, { recursive: true, force: true });
  }

  const falhas = provas.filter((p) => !p).length;
  console.log(`       ${provas.length - falhas} de ${provas.length} provas do carimbo da biblioteca passaram.`);
  return falhas === 0;
}

/**
 * O render de verdade grava o carimbo que o check lê.
 *
 * As provas acima carimbam o preview à mão; sem esta, o `render` podia parar de gravar o atributo (ou
 * gravar `undefined`) e todas continuariam verdes, com o acervo voltando a ficar cego em silêncio. Um
 * molde da ferramenta é copiado para a pasta temporária e renderizado ali: nenhum preview do catálogo
 * nem dos moldes é regravado.
 */
async function carimboNoRenderTest() {
  const { checkPreviewStamps } = await import('./lib/contract.mjs');
  const molde = findVersions(EXAMPLES_DIR)[0];
  if (!molde) {
    console.log('aviso  carimbo no render: pulado, não há molde em _render/exemplos para copiar.');
    return true;
  }
  const dir = versaoDeTeste('lib-render', Object.fromEntries(['Chart.tsx', 'data.ts', 'meta.json'].map((nome) => [nome, fs.readFileSync(path.join(molde.abs, nome), 'utf8')])));
  const rel = relToVisuais(dir);
  const provas = [];
  try {
    const saida = await rodarScript('render.mjs', [rel, '--sem-comparar']);
    if (/Nao consegui abrir o navegador/.test(saida.out + saida.err)) {
      console.log('aviso  carimbo no render: pulado, o navegador do render não abriu.');
      return true;
    }
    const carimbos = readPreviewStamps(path.join(dir, 'preview.svg'));
    provas.push(prova('o render grava o preview do molde copiado', true, carimbos !== null));
    provas.push(prova('o render grava data-farol-lib com o carimbo atual da biblioteca', libHash(), carimbos?.lib ?? 'AUSENTE'));
    const conferido = checkPreviewStamps(dir);
    provas.push(prova('o preview recém-renderizado passa nos três carimbos do check', '0 erro(s) e 0 aviso(s)', `${conferido.errors.length} erro(s) e ${conferido.warnings.length} aviso(s)`));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    // As imagens de conferência que o render deixou em `.qa/` para esta versão de mentira.
    const pastaQa = path.dirname(path.join(QA_DIR, rel));
    if (fs.existsSync(pastaQa)) {
      for (const nome of fs.readdirSync(pastaQa)) {
        if (nome.startsWith(path.basename(rel))) fs.rmSync(path.join(pastaQa, nome), { recursive: true, force: true });
      }
      if (fs.readdirSync(pastaQa).length === 0) fs.rmdirSync(pastaQa);
    }
  }
  const falhas = provas.filter((p) => !p).length;
  console.log(`       ${provas.length - falhas} de ${provas.length} provas do carimbo no render passaram.`);
  return falhas === 0;
}

/**
 * Varredura independente dos códigos na origem, por implementação diferente da do extrator.
 *
 * O extrator casa o INÍCIO da linha; esta varredura apara a linha antes de olhar, então enxerga
 * também um código aninhado num sub-item. A diferença é de propósito: hoje não existe código
 * aninhado, e o dia em que alguém escrever um, esta prova falha e alguém decide, em vez de o dossiê
 * passar a perder a regra calado.
 *
 * Nenhuma das duas tem lista de prefixos: `[A-Z]{3}` aceita prefixo novo sem ninguém mexer aqui.
 */
function codigosNaOrigem(texto, marca) {
  const achados = [];
  for (const linha of texto.split('\n')) {
    const aparada = linha.trim();
    if (!aparada.startsWith(marca)) continue;
    const m = aparada.slice(marca.length).match(/^([A-Z]{3}-\d+[a-z]?)\./);
    if (m) achados.push(m[1]);
  }
  return achados;
}

/**
 * O dossiê: a prova é a CONTAGEM contra a origem, não o texto gerado.
 *
 * Existe porque o dossiê é a alavanca de custo das 467 versões que faltam, e a forma de ele
 * apodrecer não é dar erro: é passar a trazer 74 das 79 regras sem ninguém notar, e um produtor
 * entregar 40 peças sem a regra que faltou.
 */
async function dossieTest() {
  console.log('\n[selftest] dossiê: a extração contra a origem.');
  const D = await import('./lib/dossie.mjs');
  const provas = [];
  const lixo = [];

  const contrato = D.lerFonte(D.CONTRATO_PATH);
  const armadilhas = D.lerFonte(D.ARMADILHAS_PATH);
  const catalogo = D.lerCatalogo();

  // --- 1. Canário de prefixo. Um contrato sintético com um prefixo que não existe no catálogo: se
  // alguém trocar a extração por uma allowlist (`ROT|EIX|COR|...`), esta prova cai na hora.
  const sintetico = [
    '## 17. Padrão de acabamento',
    '',
    '* **ROT-1. Enunciado curto.** ',
    '* **ZZZ-9. Prefixo que ainda não existe.** Segunda frase que deve ficar fora do enunciado curto.',
    '  * **Sub-item.** Não é regra e não pode ser contado.',
    '* **TIP-2. Com duas frases.** A segunda cabe no orçamento.',
  ].join('\n');
  const doSintetico = D.extrairRegras(sintetico);
  provas.push(prova('extração acha regra de prefixo que ainda não existe', 3, doSintetico.length));
  provas.push(prova('extração não conta sub-item como regra', 'ROT-1|ZZZ-9|TIP-2', doSintetico.map((r) => r.codigo).join('|')));

  // --- 2. Nenhuma regra perdida entre a origem e o dossiê.
  const naOrigem = codigosNaOrigem(contrato, '* **');
  const extraidas = D.extrairRegras(contrato);
  provas.push(prova('a extração acha TODAS as regras codificadas do contrato', naOrigem.length, extraidas.length));
  provas.push(prova('a extração não inventa nem reordena código de regra', naOrigem.join('|'), extraidas.map((r) => r.codigo).join('|')));
  // Fragmento que termina em vírgula ou em dois-pontos é regra cortada no meio da oração, que foi o
  // defeito do primeiro corte (a corrida em negrito): lia-se como regra inteira e sem a régua.
  const fragmentos = extraidas.filter((r) => /[,:;]\s*(?:\[…\])?$/.test(r.enunciado)).map((r) => r.codigo);
  provas.push(prova('nenhum enunciado termina no meio da oração', '', fragmentos.join('|')));
  // Código repetido é dívida paga em 2026-09-28: `ACE-5` e `ACE-6` estavam cada um em duas regras
  // diferentes, e foi esta contagem que achou. Repetir é ambiguidade de citação, não detalhe.
  const repetidos = extraidas.map((r) => r.codigo).filter((c, i, todos) => todos.indexOf(c) !== i);
  provas.push(prova('nenhum código de regra é usado por duas regras', '', [...new Set(repetidos)].join('|')));
  provas.push(prova('a contagem de regras é a de códigos únicos', new Set(extraidas.map((r) => r.codigo)).size, extraidas.length));

  // --- 3. Nenhuma armadilha perdida, e o filtro por abordagem corta só o que não se aplica.
  const entradasNaOrigem = codigosNaOrigem(armadilhas, '### ');
  const entradas = D.extrairArmadilhas(armadilhas);
  provas.push(prova('a extração acha TODAS as entradas de ARMADILHAS', entradasNaOrigem.length, entradas.length));
  provas.push(prova('a extração não inventa nem reordena código de armadilha', entradasNaOrigem.join('|'), entradas.map((a) => a.codigo).join('|')));
  // O dossiê manda consultar a saída pelo código: entrada sem bloco `Saída` na origem faria o
  // encaminhamento apontar para uma contramedida que não existe.
  provas.push(prova('toda entrada tem Saída consultável na origem', 0, entradas.filter((a) => !a.temSaida).length));
  const semRec = entradas.filter((a) => a.prefixo !== 'REC').length;
  provas.push(prova('svg-puro fica sem as entradas de Recharts', semRec, entradas.filter((a) => D.prefixosAplicaveis('svg-puro').includes(a.prefixo)).length));
  provas.push(prova('html-tailwind fica sem as entradas de Recharts', semRec, entradas.filter((a) => D.prefixosAplicaveis('html-tailwind').includes(a.prefixo)).length));
  provas.push(prova('recharts-nativo fica com as entradas de Recharts', entradas.length, entradas.filter((a) => D.prefixosAplicaveis('recharts-nativo').includes(a.prefixo)).length));
  // Nomeada por extenso: `recharts-custom` vale 40 dos 205 modelos e não pode depender do prefixo do nome.
  provas.push(prova('recharts-custom fica com as entradas de Recharts', entradas.length, entradas.filter((a) => D.prefixosAplicaveis('recharts-custom').includes(a.prefixo)).length));
  provas.push(prova('abordagem desconhecida não ganha Recharts por acaso', semRec, entradas.filter((a) => D.prefixosAplicaveis('abordagem-que-nao-existe').includes(a.prefixo)).length));

  // --- 4. O dossiê montado: todo código da origem aparece no arquivo, e o que não se aplica não.
  const familia = catalogo[0];
  const modeloRecharts = catalogo.flatMap((f) => f.modelos.map((m) => ({ f, m }))).find((x) => x.m.abordagem_stack === 'recharts-nativo');
  const modeloSvg = catalogo.flatMap((f) => f.modelos.map((m) => ({ f, m }))).find((x) => x.m.abordagem_stack === 'svg-puro');
  // PAPEL COMPLETO de propósito (F0.1, 2026-10-01). Estas duas montagens alimentam as provas da extração
  // INTEIRA, que continua existindo: o papel `completo` é o endereço do que os papéis enxutos deixaram
  // fora, e tem de seguir trazendo tudo. O que o produtor e o revisor recebem é provado à parte, na
  // seção 4f, por presença contra a origem.
  const comRecharts = D.montarDossie({ familia: modeloRecharts.f, modelo: modeloRecharts.m, contrato, armadilhas, papel: 'completo' });
  const comSvg = D.montarDossie({ familia: modeloSvg.f, modelo: modeloSvg.m, contrato, armadilhas, papel: 'completo' });
  const faltando = (texto, codigos) => codigos.filter((c) => !texto.includes(`**${c}.`)).join('|');
  provas.push(prova('o dossiê imprime as 79 regras, uma por código', '', faltando(comRecharts.texto, naOrigem)));
  provas.push(prova('o dossiê de Recharts imprime as 61 armadilhas', '', faltando(comRecharts.texto, entradasNaOrigem)));
  provas.push(prova('o dossiê de svg-puro imprime as armadilhas que valem', '', faltando(comSvg.texto, entradasNaOrigem.filter((c) => !c.startsWith('REC')))));
  const recNoSvg = entradasNaOrigem.filter((c) => c.startsWith('REC') && comSvg.texto.includes(`**${c}.`));
  provas.push(prova('o dossiê de svg-puro não imprime entrada de Recharts', '', recNoSvg.join('|')));
  // O corte de 2026-09-28 é de CORPO, não de entrada: a contagem não pode cair, e o encaminhamento
  // para a origem tem de estar escrito, porque sintoma sem saída e sem endereço vira adivinhação.
  provas.push(prova('a saída não é mais transcrita no dossiê', false, comRecharts.texto.includes('- Saída:')));
  provas.push(prova('o dossiê manda consultar a saída pelo código', true, comRecharts.texto.includes('A SAÍDA DE CADA ARMADILHA VIVE NO `ARMADILHAS.md`, E SE CONSULTA PELO CÓDIGO')));
  provas.push(prova('o dossiê diz que consultar é obrigatório', true, comRecharts.texto.includes('Consultar é obrigatório')));
  // Contra a ORIGEM, nunca contra literal: as duas provas nasceram com 61 e 32 escritos à mão e
  // quebraram na primeira vez que o ARMADILHAS.md cresceu, acusando o corte por um defeito que era do
  // teste. Segunda fonte da verdade escrita à mão deriva, inclusive dentro do selftest.
  provas.push(prova('o corte do corpo não derrubou a contagem de entradas', entradasNaOrigem.length, comRecharts.contagem.armadilhasAplicaveis));
  provas.push(prova('o corte do corpo não derrubou a contagem nas outras abordagens', entradasNaOrigem.filter((c) => !c.startsWith('REC')).length, comSvg.contagem.armadilhasAplicaveis));

  // --- 4b. Ordem de apresentação por código, que a origem não tem e o dossiê tem.
  const ordemNoDossie = (texto, prefixo) => [...texto.matchAll(new RegExp(`^- \\*\\*(${prefixo}-\\d+[a-z]?)\\.`, 'gm'))].map((m) => m[1]);
  for (const prefixo of ['ROT', 'ESP']) {
    const lidos = ordemNoDossie(comRecharts.texto, prefixo);
    const ordenados = [...lidos].sort(D.compararCodigo);
    provas.push(prova(`o dossiê lista ${prefixo} em ordem de código`, ordenados.join('|'), lidos.join('|')));
  }
  provas.push(prova('o sufixo de letra vem depois do número puro', 'ROT-5|ROT-5b|ROT-6', ['ROT-6', 'ROT-5b', 'ROT-5'].sort(D.compararCodigo).join('|')));
  provas.push(prova('o número de dois dígitos não ordena como texto', 'EIX-9|EIX-10', ['EIX-10', 'EIX-9'].sort(D.compararCodigo).join('|')));

  // --- 5. As seções estruturais entram inteiras, e a subseção cortada por título sai mesmo.
  const semSecao = D.SECOES_ESTRUTURAIS.filter((s) => !comRecharts.texto.includes(`### CONTRATO §${s.num}.`) && !comRecharts.texto.includes(`### CONTRATO §${s.num} `)).map((s) => s.num);
  provas.push(prova('toda seção estrutural escolhida entra no dossiê', '', semSecao.join('|')));
  provas.push(prova('a subseção de revisão sai do recorte da seção 12', false, comRecharts.texto.includes('npm run revisao -- <familia>')));
  provas.push(prova('o dossiê diz que quem produz não roda revisão', true, comRecharts.texto.includes('nunca roda `npm run revisao`')));

  // --- 6. Estado no disco, medido numa árvore sintética: 2 de 3, não 3 de 3 nem 0 de 3.
  const raiz = path.join(TMP_DIR, `dossie-${process.pid}`);
  lixo.push(raiz);
  const famFalsa = { slug: '99_familia-de-teste', nome: 'Família de teste' };
  const modFalso = {
    slug: '01_modelo-de-teste',
    nome: 'Modelo de teste',
    abordagem_stack: 'svg-puro',
    resumo: 'Resumo.',
    quando_usar: ['Usar.'],
    quando_evitar: ['Evitar.'],
    versoes: [
      { slug: 'v1_pronta', titulo: 'Pronta', caso_de_uso: 'Caso.', o_que_demonstra: ['Um.'], canvas_sugerido: 'card' },
      { slug: 'v2_pronta', titulo: 'Pronta', caso_de_uso: 'Caso.', o_que_demonstra: ['Um.'], canvas_sugerido: 'card' },
      { slug: 'v3_falta', titulo: 'Falta', caso_de_uso: 'Caso.', o_que_demonstra: ['Um.'], canvas_sugerido: 'card' },
    ],
  };
  for (const slug of ['v1_pronta', 'v2_pronta']) {
    const dir = path.join(raiz, famFalsa.slug, modFalso.slug, slug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'Chart.tsx'), 'export const Chart = () => <p>t</p>;\n', 'utf8');
  }
  ensureDir(path.join(raiz, famFalsa.slug, modFalso.slug, 'v3_falta'));
  const estado = D.estadoNoDisco(famFalsa, modFalso, raiz);
  provas.push(prova('pasta sem Chart.tsx não conta como versão produzida', 2, estado.versoes.filter((v) => v.produzida).length));
  provas.push(prova('a versão que falta aparece como a produzir', 'v3_falta', estado.versoes.filter((v) => !v.produzida).map((v) => v.slug).join('|')));
  const doFalso = D.montarDossie({ familia: famFalsa, modelo: modFalso, contrato, armadilhas, raiz });
  provas.push(prova('o dossiê carimba PRODUZIDA uma vez por versão no disco', 2, doFalso.texto.split('— PRODUZIDA').length - 1));
  provas.push(prova('o dossiê carimba A PRODUZIR na que falta', 1, doFalso.texto.split('— A PRODUZIR').length - 1));

  // --- 4c. AS GUARDAS. A seção nasceu porque o piloto de 2026-09-28 saiu do dossiê para ler
  // `guardas.mjs`: quem conta as guardas é o código, e o dossiê tem de trazer TODAS, com piso, escopo,
  // motivo de não medida e a sintaxe do escape. Perder uma guarda aqui é uma rodada de check a mais.
  const { guardas, tabela, escapaveis, comFila } = D.extrairGuardas();
  const bannersNoCodigo = D.lerFonte(D.GUARDAS_PATH).split('\n').filter((l) => /^\/\/ [A-Z][A-Z-]+$/.test(l)).length;
  provas.push(prova('a extração acha TODAS as guardas com banner no código', bannersNoCodigo, guardas.length));
  provas.push(prova('a tabela do cabeçalho tem uma linha por guarda, mais cabeçalho e régua', guardas.length + 2, tabela.length));
  provas.push(prova('toda guarda da tabela do cabeçalho aparece como seção do dossiê', '', guardas.filter((g) => !comRecharts.texto.includes(`### ${g.codigo}`)).map((g) => g.codigo).join('|')));
  // `NUMERO-CRU` não tem função própria (as três guardas de código dividem uma passagem só pela
  // árvore), então a prova é a linha do dossiê, que sempre nomeia o arquivo.
  provas.push(prova('toda guarda diz onde vive', guardas.length, comRecharts.texto.split('Vive em `guardas.mjs`').length - 1));
  provas.push(prova('toda guarda entra com pelo menos um parágrafo de escopo', '', guardas.filter((g) => g.paragrafos.length === 0).map((g) => g.codigo).join('|')));
  provas.push(prova('a lista de códigos que aceitam escape não se perde', escapaveis.length, guardas.filter((g) => g.escapavel).length));
  provas.push(prova('as guardas com fila de dívida são as declaradas em divida.mjs', comFila.join('|'), guardas.filter((g) => g.fila).map((g) => g.codigo).join('|')));
  // Os três tropeços do piloto, um a um.
  provas.push(prova('o teto de 250 da FRASE-ACESSIVEL está no dossiê', true, comRecharts.texto.includes('ACE_MAX = 250')));
  provas.push(prova('o escopo de dois tokens da CONTRASTE-MARCA está no dossiê', true, comRecharts.texto.includes('QUAIS TOKENS ELA JULGA')));
  provas.push(prova('a sintaxe do escape está no dossiê, pronta para copiar', true, comRecharts.texto.includes('// check-ok: NUMERO-CRU')));
  provas.push(prova('a forma de escape que funciona dentro do JSX está no dossiê', true, comRecharts.texto.includes('{/* check-ok: NUMERO-CRU')));
  provas.push(prova('o dossiê separa escape de fila de dívida', true, comRecharts.texto.includes('ESTE MECANISMO NÃO É ESCAPE')));
  provas.push(prova('o dossiê avisa que check verde não é medida', true, comRecharts.texto.includes('preview_com_transform')));
  provas.push(prova('o dossiê traz a condição de código do preview girado', true, comRecharts.texto.includes('temTransform = true')));
  // O fechamento do docblock não pode vazar para dentro do recorte: vazou na primeira versão, e a
  // linha ` */` aparecia no meio da explicação do escape como se fosse texto.
  const recortes = D.extrairEscapeEFila();
  provas.push(prova('o recorte do escape não leva o fechamento de comentário', false, recortes.escape.trimEnd().endsWith('*/')));
  provas.push(prova('o recorte da fila não leva o fechamento de comentário', false, recortes.fila.trimEnd().endsWith('*/')));

  // --- 4c2. O CORTE NÃO PODE AMPUTAR A PARTE OPERACIONAL. O orçamento de 360 B cortava o
  // "QUAIS TOKENS ELA JULGA" no meio, e o agente ficou sem saber se rampa de 4 degraus era erro.
  provas.push(prova('nenhum parágrafo de guarda sai cortado', '', guardas.flatMap((g) => g.paragrafos.filter((p) => p.endsWith('[…]')).map(() => g.codigo)).join('|')));
  provas.push(prova('o escopo de tokens da CONTRASTE-MARCA vai inteiro, com os dois casos de erro', true, comRecharts.texto.includes('degrau `--seq-*` usado como cor CATEGÓRICA')));
  provas.push(prova('o critério de contagem que separa rampa de categórico está no dossiê', true, comRecharts.texto.includes('menos de três degraus distintos desenhados é uso categórico')));
  // Os dois leitores que agentes foram ler entram inteiros NO PAPEL COMPLETO, e a RECAI é o caso nomeado.
  // Esta prova se chamava "as duas guardas de código trazem o leitor inteiro" e afirmava, como regra do
  // dossiê de produção, justamente o que o F0.1 consertou: a fonte inteira de dois arquivos dentro da
  // leitura de todo produtor. A extração continua valendo e continua provada; o que o produtor recebe
  // no lugar, o caminho, está provado na seção 4f.
  const comAjudante = guardas.filter((g) => g.ajudantes.length).map((g) => g.codigo);
  provas.push(prova('a extração do papel completo ainda acha os dois leitores de guarda', 'AGREGACAO-ZERO|FORMATO-ACESSIVEL', comAjudante.join('|')));
  provas.push(prova('a regra RECAI aparece com o que ela dispara', true, comRecharts.texto.includes('RECAI     `?? 0` ou `|| 0` sobre o resultado de uma agregação')));
  provas.push(prova('o leitor da FORMATO-ACESSIVEL diz que compara pelo argumento', true, comRecharts.texto.includes('COMPARAR PELO ARGUMENTO')));

  // --- 4c3. O TETO DE 250 CARACTERES. Custou uma rodada de check em 4 de 4 modelos do piloto.
  provas.push(prova('o dossiê manda contar os caracteres antes do check', true, comRecharts.texto.includes('CONTE OS CARACTERES DA FRASE ACESSÍVEL ANTES DE RODAR O `check`')));
  provas.push(prova('o dossiê diz o piso e o teto da frase', true, comRecharts.texto.includes('100 a 250 caracteres')));
  provas.push(prova('o dossiê diz que acima do teto é erro, não aviso', true, /acima de 250 é \*\*erro\*\*, não aviso/.test(comRecharts.texto)));

  // --- 4c4. A GEOMETRIA DA MOLDURA, medida. Dois agentes deduziram e chegaram a números diferentes.
  const moldura = D.medirMoldura();
  provas.push(prova('a moldura é medida em preview de verdade', true, moldura.medidos > 200));
  provas.push(prova('a medição separa as quatro combinações de moldura e largura', 4, moldura.grupos.length));
  const cardFolgado = moldura.grupos.find((g) => g.frame === 'card' && g.folgado);
  provas.push(prova('o recuo por lado do card folgado é o medido', 33, cardFolgado?.recuo));
  provas.push(prova('o desconto de largura do card folgado é 66 px', 66, cardFolgado ? 2 * cardFolgado.recuo : null));
  // O cabeçalho tem DUAS alturas, e é isso que nenhum dos dois agentes tinha: sem isso não existe um
  // número só de desconto de altura, e foi por isso que um disse 122 e o outro 126.
  provas.push(prova('o cabeçalho do card folgado tem duas alturas medidas', '40.5|57', [...cardFolgado.cabecalhos.keys()].sort((a, b) => a - b).join('|')));
  provas.push(prova('o dossiê publica a fórmula do corpo, não um número só', true, comRecharts.texto.includes('corpo_altura  = canvas_altura  − 2 × recuo − cabeçalho − 12')));
  // Esta prova exigia que o dossiê ACUSASSE a divergência com a §13 ("nunca 234"). A §13 foi corrigida e
  // passou a trazer o par 241,5 e 225, então a prova mantinha viva uma cobrança já paga, e quatro produtores
  // leram no dossiê que o contrato estava errado. Agora ela cobra o oposto: que o dossiê publique o par
  // medido e confirme o contrato. A lição é da própria prova: teste de texto de pendência envelhece com a
  // pendência, e quem conserta a origem tem de conferir quem ainda a cobra.
  provas.push(prova('o dossiê publica o par medido do canvas card', true, comRecharts.texto.includes('574 x 241,5 px') && comRecharts.texto.includes('574 x 225 px')));

  // --- 4c5. O SERIALIZADOR. Propriedade herdada igual à do pai não é gravada, e isso inverteu um destaque.
  const serializador = D.extrairSerializador();
  provas.push(prova('o cabeçalho do serializador é extraído', true, serializador.includes('Regra de decomposição')));
  provas.push(prova('o dossiê explica o diff contra o pai', true, comRecharts.texto.includes('diff contra o pai')));
  provas.push(prova('o dossiê escreve a consequência prática do diff', true, comRecharts.texto.includes('não é gravada')));

  // --- 4c6. AS LACUNAS DA PALETA, medidas na geração contra os tokens do Farol.
  const paleta = D.medirLacunasDaPaleta();
  provas.push(prova('a paleta é medida, não copiada', true, Boolean(paleta)));
  const seq = paleta.grupos[0].medidas;
  const doisDecimais = (n) => Number(n.toFixed(2));
  // Os números que o dono endossou, conferidos um a um contra `tokens.css` nesta execução.
  provas.push(prova('a rampa no tema escuro mede o que foi medido antes', '1.14|1.58|2.29|3.38|4.89|6.96|10.12', seq.map((m) => doisDecimais(m.escuro)).join('|')));
  provas.push(prova('a rampa no tema claro mede o que foi medido antes', '1.21|1.49|1.92|2.6|3.72|5.45|8.29', seq.map((m) => doisDecimais(m.claro)).join('|')));
  const neutros = paleta.grupos[1].medidas;
  provas.push(prova('os neutros no escuro medem o que foi medido antes', '1.1|1.15|1.25|1.79', neutros.map((m) => doisDecimais(m.escuro)).join('|')));
  provas.push(prova('os neutros no claro medem o que foi medido antes', '1|1.15|1.29|1.83', neutros.map((m) => doisDecimais(m.claro)).join('|')));
  provas.push(prova('nenhum neutro alcança o piso de 3:1', 0, neutros.filter((m) => m.escuro >= 3 && m.claro >= 3).length));
  provas.push(prova('só três degraus da rampa passam nos dois temas', 3, seq.filter((m) => m.escuro >= 3 && m.claro >= 3).length));
  // O que fecha a conclusão: escrever o valor no bloco não salva, porque o melhor par reprova no escuro.
  provas.push(prova('o melhor texto sobre --seq-4 fica abaixo do piso de texto no escuro', true, paleta.melhorSobreSeq4.escuro.razao < paleta.pisoDeTexto));
  provas.push(prova('o melhor texto sobre --seq-4 no escuro mede 4,29', 4.29, doisDecimais(paleta.melhorSobreSeq4.escuro.razao)));
  provas.push(prova('o dossiê publica a saída de contorno da lacuna', true, comRecharts.texto.includes('posição fixa e nome da faixa')));

  // --- 4c7. A LARGURA DE CARACTERE. A mesma grandeza existia em três números, e um agente copiou o
  // `6.4` dos vizinhos sem saber se era medido. A prova é que o dossiê mede pela função da guarda.
  const largura = D.medirLarguraDeCaractere(11);
  const tres = (n) => Number(n.toFixed(3));
  const grotesk = largura.medidas.find((f) => f.nome === 'grotesk');
  const manrope = largura.medidas.find((f) => f.nome === 'manrope');
  const classe = (f, nome) => f.classes.find((c) => c.nome === nome);
  provas.push(prova('a largura de dígito em Space Grotesk é a medida da tabela', 0.59, tres(classe(grotesk, 'dígitos').em)));
  provas.push(prova('a largura de dígito a 11 px é 6,49', 6.49, Number(classe(grotesk, 'dígitos').px.toFixed(2))));
  provas.push(prova('as três classes entram nas duas famílias', 6, largura.medidas.flatMap((f) => f.classes).length));
  // O 6,4 das peças é SUBESTIMATIVA, e é isso que o torna aceitável: a guarda pega o excesso no render,
  // mas ninguém pega rótulo escondido. Se um dia a medida cair abaixo de 6,4, este caso avisa.
  provas.push(prova('o 6,4 das peças continua abaixo da largura medida de dígito', true, 6.4 < classe(grotesk, 'dígitos').px));
  provas.push(prova('a largura padrão de caractere fora da tabela é a da origem', 0.55, tres(largura.padrao.em)));
  provas.push(prova('o dossiê publica a derivação do 6,4, não só o número', true, comRecharts.texto.includes('subestimativa de 1,4%')));
  provas.push(prova('o dossiê diz por que subestimar é o lado seguro', true, comRecharts.texto.includes('esconde o rótulo')));
  // Esta prova cobrava que o dossiê APONTASSE para a tabela por glifo. Dois produtores, no mesmo dia,
  // escreveram que apontar não resolve: a tabela não estava no arquivo e eles decidiam pela média que o
  // próprio dossiê desautoriza. A prova passou a cobrar a PUBLICAÇÃO, com os dois valores conhecidos.
  provas.push(prova('o dossiê publica a tabela por glifo', true, comRecharts.texto.includes('A tabela por glifo, que é a régua de decidir')));
  provas.push(prova('a tabela por glifo traz as duas famílias', true, comRecharts.texto.includes('**Manrope** (80 glifos)') && comRecharts.texto.includes('**Space Grotesk** (40 glifos)')));
  provas.push(prova('a tabela publicada traz o valor medido do 1 em Grotesk', true, comRecharts.texto.includes('`1` 0,434')));
  provas.push(prova('o dossiê publica o dígito tabular de 0,620 em', true, comRecharts.texto.includes('**todo dígito mede 0,620 em**')));
  provas.push(prova('o dossiê avisa que a média erra para baixo', true, comRecharts.texto.includes('erra **para baixo**')));
  // Manrope e Grotesk não podem sair com o mesmo número: são famílias diferentes e o produtor escolhe.
  provas.push(prova('a família do número e a do texto medem diferente', false, tres(classe(grotesk, 'dígitos').em) === tres(classe(manrope, 'dígitos').em)));

  // --- 4c8. A FILA DE DÍVIDA CONTA PEÇA, NÃO CHAVE. Contar chave de topo dava 67 contra 63 peças, e
  // isso virou dois relatos de contradição no mesmo dia, de dois agentes diferentes.
  const { resumoDaFila } = await import('./lib/divida.mjs');
  const fila = resumoDaFila();
  const cru = JSON.parse(fs.readFileSync(fila.arquivo, 'utf8'));
  const chavesDeTopo = Object.keys(cru).length;
  const meta = Object.keys(cru).filter((k) => k.startsWith('_'));
  provas.push(prova('o resumo conta PEÇA, não chave de topo', chavesDeTopo - meta.length, fila.pecas));
  provas.push(prova('o resumo nomeia as chaves de instrução em vez de contá-las como dívida', meta.join('|'), fila.metaChaves.join('|')));
  provas.push(prova('contar chave de topo dá o número que gerou o falso alarme', chavesDeTopo, fila.pecas + fila.metaChaves.length));
  provas.push(prova('o resumo traz a composição por guarda', true, fila.porCodigo.length > 0 && fila.porCodigo.every((c) => c.pecas > 0)));
  provas.push(prova('o dossiê descreve a fila por peça', true, comRecharts.texto.includes(`A fila de dívida hoje: ${fila.pecas} peça(s)`)));
  provas.push(prova('o dossiê avisa que peça nova não está na fila', true, comRecharts.texto.includes('a sua peça é nova, então ela não está na fila')));
  // Escopo não é aprovação: a versão geral do "check verde não quer dizer medido", que o dono errou
  // em duas de quatro previsões sobre a EIXO-CALMO.
  provas.push(prova('o dossiê diz que estar fora do escopo não é estar aprovado', true, comRecharts.texto.includes('não é estar APROVADO')));
  provas.push(prova('o dossiê cita o motivo de escopo da EIXO-CALMO', true, comRecharts.texto.includes('sem_eixo_com_axis_props')));

  // --- 4c9. O ZAXIS E OS OUTROS PADRÕES DO RECHARTS. Assinatura de tipo não é semântica: `range` é
  // ÁREA e não raio, e a escala de banda devolve a borda. Cada um custou um render.
  const padroes = D.extrairPadroesDoRecharts();
  provas.push(prova('a versão do Recharts sai do pacote instalado', '3.10.1', padroes.versao));
  for (const chave of ['zRange', 'zSize', 'zRaio', 'zFallback', 'simboloArea', 'bandaCentro', 'espessuraBarra', 'gapCategoria', 'gapBarra']) {
    provas.push(prova(`o padrão ${chave} tem prova no pacote`, true, padroes.achados.has(chave)));
  }
  // O 4,514 px que o agente viu é `sqrt(64/π)`: é a prova de que `range` é área. Se um dia o pacote
  // mudar o padrão ou a fórmula, esta conta deixa de fechar e a seção precisa ser reescrita.
  provas.push(prova('o raio padrão do ponto é a raiz da área 64 sobre pi', 4.51, Number(Math.sqrt(64 / Math.PI).toFixed(2))));
  // A seção é POR MODELO, então o `ZAxis` só aparece no dossiê de quem o importa: a prova é contra a
  // peça de dispersão, não contra qualquer peça de Recharts.
  const daDispersao = D.acharModelo(catalogo, '09_dispersao-e-bolhas/01_dispersao-simples');
  const comZAxis = D.montarDossie({ familia: daDispersao.familia, modelo: daDispersao.modelo, contrato, armadilhas }).texto;
  provas.push(prova('o dossiê de quem usa ZAxis diz que o range é área, não raio', true, comZAxis.includes('é a ÁREA do símbolo em px², não o raio')));
  provas.push(prova('o dossiê dá as duas condições em que o range não chega', true, comZAxis.includes('nunca um `r`') && comZAxis.includes('não registrado')));
  provas.push(prova('o dossiê diz que a escala de banda devolve a borda', true, comZAxis.includes('devolve a BORDA da faixa')));
  // E o modelo que não usa ZAxis não carrega a pegadinha dele: é o escopo por modelo funcionando.
  provas.push(prova('modelo sem ZAxis não recebe a pegadinha do ZAxis', false, comRecharts.texto.includes('é a ÁREA do símbolo em px²')));
  provas.push(prova('a peça de svg-puro não recebe a seção do Recharts', false, comSvg.texto.includes('assinatura de tipo não é semântica')));

  // --- 4c10. DO CANVAS AO PASSO. A tabela da moldura dava o corpo e faltava o passo, que é o que
  // decide o piso de espessura antes de renderizar.
  const conta = D.calcularPasso({ corpo: 241.5, faixas: 8, piso: 12 });
  provas.push(prova('o plano desconta margem e eixo do corpo', 201.5, conta.plano));
  provas.push(prova('a espessura com 8 faixas no canvas card é 20,15', 20.15, Number(conta.espessura.toFixed(2))));
  // O vão entra DUAS vezes, uma de cada lado da banda: 80% e não 90%, que é o erro de conta fácil.
  provas.push(prova('o vão de categoria entra dos dois lados da banda', 0.8, Number((conta.espessura / (conta.plano / 8)).toFixed(3))));
  provas.push(prova('o teto de faixas do canvas card é 13', 13, conta.faixasNoPiso));
  provas.push(prova('14 faixas caem abaixo do piso no canvas card', true, D.calcularPasso({ corpo: 241.5, faixas: 14, piso: 12 }).espessura < 12));
  provas.push(prova('duas séries afinam a barra além do vão', true, D.calcularPasso({ corpo: 241.5, faixas: 8, series: 2, piso: 12 }).espessura < conta.espessura / 2));
  provas.push(prova('o dossiê publica a fórmula do passo', true, comRecharts.texto.includes('banda     = plano / faixas')));
  provas.push(prova('o dossiê traz o exemplo trabalhado com o teto de faixas', true, comRecharts.texto.includes('O teto deste canvas é 13 faixas')));
  // O canvas estreito não alcança o cabeçalho de uma linha, e publicar só essa hipótese prometia um teto
  // de faixas que não existe: um produtor achou o defeito em 2026-09-29. O corpo real do `kpi-alto` é o de
  // duas linhas, 155,5 px, e ali 8 faixas nascem abaixo do piso.
  const kpiAltoDuasLinhas = D.calcularPasso({ corpo: 155.5, faixas: 8, piso: 12 });
  provas.push(prova('kpi-alto com cabeçalho de duas linhas comporta 7 faixas, não 8', 7, kpiAltoDuasLinhas.faixasNoPiso));
  provas.push(prova('8 faixas em kpi-alto nascem abaixo do piso', true, kpiAltoDuasLinhas.espessura < 12));
  provas.push(prova('a tabela do passo marca o canvas estreito como inalcançável', true, comRecharts.texto.includes('**inalcançável**')));
  provas.push(prova('a tabela do passo publica as duas hipóteses de cabeçalho', true, comRecharts.texto.includes('Corpo, cabeçalho de 1 linha') && comRecharts.texto.includes('Corpo, 2 linhas')));
  // A nota da §13 cobrava uma emenda já feita, e quatro produtores leram que o contrato estava errado.
  provas.push(prova('o dossiê não cobra mais a emenda já feita da §13', true, !comRecharts.texto.includes('a §13 do contrato fala em "cerca de 574 x 234')));
  provas.push(prova('o dossiê registra a concordância com a §13', true, comRecharts.texto.includes('Nota de concordância')));
  // O nome de `formatPercentPoints` promete ponto percentual e a função imprime percentual: é a DAD-4.
  provas.push(prova('o dossiê avisa que formatPercentPoints escreve percentual', true, comRecharts.texto.includes('`formatPercentPoints` **não** escreve ponto percentual')));

  // --- 4c11. RAZÃO ENTRE MARCAS NÃO É PISO. A entrada errada do ARMADILHAS.md foi corrigida na
  // origem; aqui a prova é que o dossiê apresenta o número como prova do segundo canal, não como piso.
  const pares = paleta.pares;
  provas.push(prova('os dois pares de marca são medidos', 2, pares.length));
  provas.push(prova('chart-1 contra chart-5 mede 1,61 no escuro', 1.61, doisDecimais(pares[0].escuro)));
  provas.push(prova('chart-1 contra chart-5 mede 1,04 no claro', 1.04, doisDecimais(pares[0].claro)));
  provas.push(prova('o aceso contra o neutro de ausência mede 1,82 e 1,12', '1.82|1.12', `${doisDecimais(pares[1].escuro)}|${doisDecimais(pares[1].claro)}`));
  provas.push(prova('o dossiê diz que razão entre marcas não é piso', true, comRecharts.texto.includes('Razão entre marcas não é piso')));
  provas.push(prova('o dossiê manda acrescentar canal, não trocar token', true, comRecharts.texto.includes('acrescentar o segundo canal') && comRecharts.texto.includes('Não tente consertar a cor')));
  provas.push(prova('o dossiê aponta a ACE-2 como a régua que cobre distinguir categoria', true, comRecharts.texto.includes('que no contrato é a **ACE-2**')));

  // --- 4c12. A OPACIDADE MÍNIMA POR COR. A ACE-5 é 50 das 814 versões planejadas, a maior classe de
  // colisão do catálogo, e três agentes mediram a mesma composição à mão no mesmo dia.
  const opacidade = D.medirOpacidadeMinima(3);
  provas.push(prova('a tabela de opacidade cobre as cores de marca', 21, opacidade.linhas.length));
  const porToken = (t) => opacidade.linhas.find((l) => l.token === t);
  // Os três pontos que os agentes mediram à mão, reproduzidos pela fórmula da guarda.
  provas.push(prova('a opacidade mínima de --chart-1 é 0,66', 0.66, porToken('--chart-1').minima));
  provas.push(prova('o tema que reprova primeiro em --chart-1 é o claro', 'claro', porToken('--chart-1').temaQueReprova));
  provas.push(prova('--negative é a única que reprova primeiro no escuro', '--negative', opacidade.linhas.filter((l) => l.temaQueReprova === 'escuro').map((l) => l.token).join('|')));
  // Cor que não passa nem opaca não tem opacidade possível, e dizer isso é o mais útil da tabela.
  provas.push(prova('as cores sem opacidade possível são as que não passam nem opacas', '--line-strong|--seq-1|--seq-2|--seq-3|--seq-4', opacidade.semSolucao.join('|')));
  provas.push(prova('nenhuma cor sem solução passa opaca', 0, opacidade.linhas.filter((l) => l.minima === null && l.opacoEscuro >= 3 && l.opacoClaro >= 3).length));
  // Arredondamento PARA CIMA: o passo imediatamente abaixo do mínimo tem de reprovar em algum tema.
  for (const token of ['--chart-1', '--chart-8', '--seq-5']) {
    const l = porToken(token);
    const abaixo = D.medirOpacidadeMinima(3).linhas.find((x) => x.token === token);
    provas.push(prova(`${token} tem mínimo em passo de 0,01`, 0, Number((abaixo.minima * 100).toFixed(4)) % 1));
    provas.push(prova(`${token} reprovaria um centésimo abaixo do mínimo`, true, l.minima > 0.01));
  }
  provas.push(prova('o dossiê publica a tabela de opacidade', true, comRecharts.texto.includes('A opacidade mínima de cada cor')));
  provas.push(prova('o dossiê diz que nessas cores opacidade não é opção', true, comRecharts.texto.includes('opacidade não é opção')));
  provas.push(prova('o dossiê oferece o contorno na cor da superfície como saída', true, comRecharts.texto.includes('contorno na cor da superfície')));

  // --- 4c13. TOKEN FANTASMA. `--danger` não existe; quem marca atraso ou falha é `--negative`.
  provas.push(prova('--danger é acusado como token inexistente', '--danger', D.tokensFantasmas('pontos acima de 48 h em --danger').join('|')));
  provas.push(prova('token existente não é acusado', '', D.tokensFantasmas('marca em --chart-1 sobre --surface-raised').join('|')));
  // Família escrita sem o degrau (`--seq`, `--prov`) é prefixo de token existente e não é fantasma.
  provas.push(prova('família sem o degrau não é acusada', '', D.tokensFantasmas('a rampa --seq e o selo --prov').join('|')));
  provas.push(prova('o dossiê diz que --danger não existe e quem faz o papel', true, comRecharts.texto.includes('`--danger` não existe') && comRecharts.texto.includes('é `--negative`')));
  provas.push(prova('o dossiê lista as propostas da 17.11 como inexistentes', true, comRecharts.texto.includes('`--chart-neutral`') && comRecharts.texto.includes('`--positive-soft`')));
  // A flag de linha de comando não pode entrar na lista de token fantasma: ela não é token.
  provas.push(prova('flag de comando não vira token fantasma na lista do dossiê', false, /token que circula e não existe[^\n]*`--tema`/.test(comRecharts.texto)));

  // --- 4c14. A GRADE É REGRA DE DIREÇÃO. Traduzir a regra em valor de prop errou num box plot horizontal.
  provas.push(prova('o dossiê diz que a grade é regra de direção', true, comRecharts.texto.includes('a grade é regra de DIREÇÃO, não de valor de prop')));
  provas.push(prova('o dossiê dá os dois valores de prop por orientação', true, comRecharts.texto.includes('`vertical={false}`') && comRecharts.texto.includes('`horizontal={false}`')));
  provas.push(prova('o dossiê nomeia a exceção dos dois eixos quantitativos', true, comRecharts.texto.includes('a `EIX-3b` é a exceção medida') || comRecharts.texto.includes('A `EIX-3b` é a exceção medida')));

  // --- 4c15. A MATRIZ DE TEXTO SOBRE MARCA. Três agentes mediram pares à mão, cada um numa peça, porque
  // a tabela da ACE-8 aprova um par só e não cobre marca semântica.
  const matriz = D.medirTextoSobreMarca(4.5);
  provas.push(prova('a matriz cobre os cinco textos', 5, matriz.textos.length));
  provas.push(prova('a matriz cobre os mesmos preenchimentos da tabela de opacidade', opacidade.linhas.length, matriz.linhas.length));
  const doFundo = (t) => matriz.linhas.find((l) => l.fundo === t);
  // O piso desta matriz é o de TEXTO, 4,5, e não o de marca, 3: os dois não se misturam.
  provas.push(prova('o piso da matriz é o de texto da ACE-3', 4.5, matriz.piso));
  provas.push(prova('o par que a ACE-8 aprova aparece aprovado', true, doFundo('--chart-1').aprovados.includes('--accent-cyan-contrast')));
  provas.push(prova('texto primário sobre categórica continua reprovado', false, doFundo('--chart-1').aprovados.includes('--text-primary')));
  // O caso que o agente mediu à mão: marca semântica com texto por dentro.
  provas.push(prova('sobre --negative o vazado passa', true, doFundo('--negative').aprovados.includes('--surface-raised')));
  provas.push(prova('sobre --text-muted como preenchimento o vazado passa', true, doFundo('--text-muted').aprovados.includes('--surface-raised')));
  // A informação mais útil da matriz: onde texto não é opção.
  provas.push(prova('os preenchimentos sem texto possível são três', '--chart-8|--seq-4|--seq-5', matriz.semTexto.join('|')));
  provas.push(prova('nenhum preenchimento sem texto tem aprovado', 0, matriz.linhas.filter((l) => matriz.semTexto.includes(l.fundo) && l.aprovados.length).length));
  // `--chart-8` reprova por 0,0014: a tabela arredondada diria 4,50 e pareceria aprovado.
  provas.push(prova('--chart-8 reprova por margem fina, não com folga', true, doFundo('--chart-8').melhor.pior > 4.49 && doFundo('--chart-8').melhor.pior < 4.5));
  provas.push(prova('o dossiê publica a matriz', true, comRecharts.texto.includes('Que texto é legível sobre cada preenchimento')));
  provas.push(prova('o dossiê separa os dois pisos com essas palavras', true, comRecharts.texto.includes('os dois pisos não se misturam')));
  provas.push(prova('o dossiê trata o vazado nas duas variantes de tema', true, comRecharts.texto.includes('texto vazado na cor da superfície')));

  // --- 4c16. A TABELA DA ACE-8 CONFERIDA. Ela foi escrita à mão, e número escrito à mão deriva.
  const ace8 = D.conferirParesDaAce8(contrato);
  provas.push(prova('a conferência da ACE-8 resolve os pares nomeados', true, ace8.conferidos >= 15));
  // As duas divergências conhecidas são de arredondamento da cor composta e não mudam veredito. Se
  // aparecer uma terceira, ou se uma delas crescer, esta prova cai e alguém decide.
  provas.push(prova('as divergências da ACE-8 são as duas conhecidas', '`--positive` sobre `bg-positive/15`|`--negative` sobre `bg-negative/15`', ace8.divergencias.map((d) => d.par).join('|')));
  provas.push(prova('nenhuma divergência da ACE-8 passa de 0,02', true, ace8.divergencias.every((d) => {
    const n = (s) => s.split(' / ').map((x) => Number(x.replace(',', '.')));
    const [te, tc] = n(d.tabela);
    const [me, mc] = n(d.medido);
    // Em centésimos, e não em ponto flutuante: `5,66 − 5,64` dá 0,020000000000000462 e reprovaria
    // uma diferença que é exatamente de 2 centésimos.
    const cent = (x, y) => Math.abs(Math.round(x * 100) - Math.round(y * 100));
    return cent(te, me) <= 2 && cent(tc, mc) <= 2;
  })));
  provas.push(prova('o dossiê declara a divergência e a causa', true, comRecharts.texto.includes('arredonda a cor composta para canal inteiro')));

  // --- 4c17. AS DUAS NOTAS DE LARGURA DE CARACTERE.
  provas.push(prova('o dossiê inverte a direção segura no treemap', true, comRecharts.texto.includes('Num treemap é o contrário')));
  provas.push(prova('o dossiê dá o critério do arredondamento', true, comRecharts.texto.includes('arredonde para o lado cuja')));
  provas.push(prova('o dossiê acusa o valor único para as duas famílias', true, comRecharts.texto.includes('erra por cerca de 11%')));

  // --- 4c18. O COMPORTAMENTO DOS COMPONENTES, POR MODELO. O escopo é o que torna a seção viável: entra
  // só o que as versões existentes do modelo importam. O sunburst custou a leitura de dois arquivos do
  // pacote, e a chave de React do setor chegou a quebrar o render.
  const doSunburst = D.acharModelo(catalogo, '12_hierarquia/03_sunburst');
  const nomesSunburst = D.importsDoModelo(doSunburst.familia, doSunburst.modelo);
  provas.push(prova('a lista de componentes sai das versões do próprio modelo', true, nomesSunburst.has('SunburstChart')));
  // Import de TIPO não é componente e não entra: listá-lo como "sem pegadinha" seria ruído.
  provas.push(prova('import de tipo fica fora da lista de componentes', false, nomesSunburst.has('SunburstData')));
  const sondaSunburst = D.sondarComponentes(nomesSunburst);
  const itensSunburst = sondaSunburst.porComponente.find((c) => c.componente === 'SunburstChart');
  provas.push(prova('as três pegadinhas do SunburstChart são confirmadas no pacote', 3, itensSunburst.itens.length));
  provas.push(prova('a que quebrou o render, a chave de React, está entre elas', true, itensSunburst.itens.some((i) => i.codigo.includes('sunburst-sector-'))));
  provas.push(prova('toda pegadinha carrega arquivo e linha do pacote', 0, itensSunburst.itens.filter((i) => !i.arquivo || !i.linha).length));
  // Componente sem sonda declarada é um estado DIFERENTE de sonda que não confirmou: três estados, não dois.
  provas.push(prova('componente sem sonda é declarado como tal', true, sondaSunburst.semSonda.includes('ResponsiveContainer')));
  provas.push(prova('nenhuma sonda do pacote instalado ficou sem confirmar', 0, sondaSunburst.naoConfirmadas.length));
  // Sonda com agulha que não existe tem de virar LACUNA, nunca descrição do plausível.
  const sondaQuebrada = D.sondarComponentes(new Set(['SunburstChart']), path.join(TMP_DIR, `pacote-inexistente-${process.pid}`));
  provas.push(prova('sonda que não acha a linha vira lacuna declarada, não descrição', 'nao-confirmada', sondaQuebrada.porComponente[0].estado));
  // O mesmo fato vale pelo componente e pelos hooks de escala: quem chama o hook é quem ancora na mão.
  const porHook = D.sondarComponentes(new Set(['useXAxisScale']));
  provas.push(prova('o hook de escala herda a pegadinha da borda da faixa', 1, porHook.porComponente[0].itens.length));
  const doModeloDeBarra = D.acharModelo(catalogo, '02_barras-horizontais/01_barras-simples-ordenadas');
  const sondaBarra = D.sondarComponentes(D.importsDoModelo(doModeloDeBarra.familia, doModeloDeBarra.modelo));
  // Esta prova fixava `itens.length === 1` e quebrou quando o `Bar` ganhou duas sondas novas em
  // 2026-09-29. Contagem de sonda é estado, e cresce por bom motivo; o que a prova precisa cobrar é a
  // PRESENÇA da pegadinha certa. É a quarta prova desta suíte que fixava estado em vez de comportamento.
  const sondasDoBar = sondaBarra.porComponente.find((c) => c.componente === 'Bar')?.itens ?? [];
  provas.push(prova('o modelo de barra recebe a pegadinha do vão de categoria', true, sondasDoBar.some((i) => /v[ãa]o|banda/i.test(i.titulo))));
  provas.push(prova('o modelo de barra recebe a pegadinha do height negativo', true, sondasDoBar.some((i) => /height/i.test(i.titulo))));
  provas.push(prova('o modelo de barra recebe a pegadinha do índice filtrado', true, sondasDoBar.some((i) => /originalDataIndex/i.test(i.titulo))));
  provas.push(prova('o modelo de barra recebe a pegadinha do ifOverflow', true, sondaBarra.porComponente.some((c) => c.componente === 'ReferenceLine' && c.itens.length === 1)));
  // Modelo sem versão no disco recebe a sondagem inteira, porque quem escreve a v1 não tem irmã.
  const semVersao = catalogo.flatMap((f) => f.modelos.map((m) => ({ f, m }))).find((x) => D.ABORDAGENS_RECHARTS.has(x.m.abordagem_stack) && D.importsDoModelo(x.f, x.m).size === 0);
  if (semVersao) {
    const doVazio = D.montarDossie({ familia: semVersao.f, modelo: semVersao.m, contrato, armadilhas });
    provas.push(prova('modelo sem versão recebe a sondagem inteira', true, doVazio.texto.includes('entra a sondagem inteira')));
    provas.push(prova('modelo sem versão vê a pegadinha do SunburstChart mesmo sem importar', true, doVazio.texto.includes('sunburst-sector-')));
  }
  provas.push(prova('o dossiê do sunburst publica a seção por componente', true, D.montarDossie({ familia: doSunburst.familia, modelo: doSunburst.modelo, contrato, armadilhas }).texto.includes('O comportamento dos componentes que este modelo usa')));

  // --- 4c19. A CONTAGEM DE GUARDAS SAI DO CÓDIGO, e nenhum número dela é escrito à mão. A `OPACIDADE-MARCA`
  // nasceu hoje e o dossiê tem de ir a 14 sozinho.
  provas.push(prova('a OPACIDADE-MARCA entrou na lista de guardas', true, guardas.some((g) => g.codigo === 'OPACIDADE-MARCA')));
  provas.push(prova('o título da seção de guardas usa a contagem do código', true, comRecharts.texto.includes(`## As ${bannersNoCodigo} guardas do \`npm run check\``)));
  // Número escrito à mão foi o defeito que esta frente já achou duas vezes em si mesma: nem o gerador
  // nem esta suíte podem trazer a contagem de guardas como literal.
  const fonteDoGerador = fs.readFileSync(path.join(path.dirname(SELF), 'lib', 'dossie.mjs'), 'utf8');
  provas.push(prova('o gerador não traz a contagem de guardas escrita à mão', '', (fonteDoGerador.match(/\d+ guardas?/g) ?? []).join('|')));
  provas.push(prova('esta suíte não traz a contagem de guardas escrita à mão', '', (fs.readFileSync(SELF, 'utf8').match(/\d+ guardas? do/g) ?? []).join('|')));

  // --- 4c20. O LIMIAR DE CARACTERES DO CABEÇALHO. Duas metades já publicadas e nunca juntadas: a
  // tabela dava as duas alturas e não dizia qual usar, e um agente errou uma v4 por isso.
  const limiar = D.medirLimiarDoCabecalho([574, 894]);
  const a574 = limiar.faixas.find((f) => f.largura === 574);
  const a894 = limiar.faixas.find((f) => f.largura === 894);
  provas.push(prova('o limiar sai do corpus real de casos de uso', 814, limiar.corpus));
  // A caixa do caso de uso TEM de ser a mesma do corpo: se não fosse, o limiar sairia errado e
  // reproduziria o defeito que a tabela da moldura veio consertar.
  provas.push(prova('a caixa do cabeçalho é a mesma do corpo em todo preview medido', 0, moldura.larguraDivergente));
  // A ALTURA DE LINHA do corpo, que dois produtores pediram em rodadas diferentes: a conta de linhas da
  // GEO-1 precisa do PAR (tamanho, altura), porque a altura não é função do tamanho.
  const alt = D.medirAlturaDeLinha();
  provas.push(prova('a altura de linha é medida em preview de verdade', true, alt.previews > 400 && alt.total > 3000));
  const paresDe11 = alt.linhas.filter((l) => l.tamanho === 11).map((l) => l.altura);
  provas.push(prova('a 11 px o acervo usa mais de uma altura de linha', true, paresDe11.length >= 4));
  provas.push(prova('a 11 px a altura vai de 11 a 16,5 px', '11 a 16.5', `${Math.min(...paresDe11)} a ${Math.max(...paresDe11)}`));
  const dominante = alt.linhas.reduce((melhor, l) => (melhor === null || l.vezes > melhor.vezes ? l : melhor), null);
  provas.push(prova('o par dominante do corpo é 12 px com 16 px', '12|16', `${dominante.tamanho}|${dominante.altura}`));
  provas.push(prova('o dossiê publica a tabela de altura de linha', true, comRecharts.texto.includes('A altura de linha do corpo, que é o que a conta de linhas da GEO-1 pede')));
  provas.push(prova('o dossiê avisa que a altura não é função do tamanho', true, comRecharts.texto.includes('**A altura não é função do tamanho:**')));
  provas.push(prova('a 574 px a faixa segura vai até 92 caracteres', 92, a574.seguro));
  provas.push(prova('a 574 px a fronteira termina em 104 caracteres', 104, a574.maiorQueCabe));
  provas.push(prova('a 894 px a faixa segura vai até 153 caracteres', 153, a894.seguro));
  // Os quatro pontos que os dois agentes mediram, contra as faixas calculadas.
  provas.push(prova('87 caracteres a 574 px cabem em uma linha', true, 87 <= a574.seguro));
  provas.push(prova('91 caracteres a 574 px cabem em uma linha', true, 91 <= a574.seguro));
  provas.push(prova('105 caracteres a 574 px não cabem em uma linha', true, 105 > a574.maiorQueCabe));
  provas.push(prova('108 caracteres a 894 px cabem em uma linha', true, 108 <= a894.seguro));
  // A regra de três cai DENTRO da fronteira: é o número que engana, e é por isso que há três faixas.
  const porRegraDeTres = Math.round(574 / limiar.avancoMedio);
  provas.push(prova('a regra de três cai dentro da faixa de fronteira', true, porRegraDeTres > a574.seguro && porRegraDeTres <= a574.maiorQueCabe));
  provas.push(prova('o dossiê publica as três faixas', true, comRecharts.texto.includes('Uma linha garantida')));
  provas.push(prova('o dossiê avisa que no canvas estreito são sempre duas linhas', true, comRecharts.texto.includes('nenhum caso de uso real cabe')));

  // --- 4c21. A TIP-3 PERMITE DOIS elementos em peso 700: marcar a menção é falso positivo em 44
  // versões planejadas, e falso positivo ensina a ignorar a marca.
  const comPeso = D.colisoesDaVersao({ titulo: 'T', caso_de_uso: 'C', o_que_demonstra: ['Nome e valor do destaque em peso 700'] });
  provas.push(prova('a menção a peso 700 é marcada', 'TIP-3', comPeso.map((c) => c.codigo).join('|')));
  provas.push(prova('a marca da TIP-3 vem com a ressalva de contagem, não como colisão', true, (comPeso[0].nota ?? '').includes('permite dois')));
  provas.push(prova('o dossiê não apresenta a TIP-3 como colisão fechada', false, /"peso 700" \(contra a `TIP-3`\)/.test(comRecharts.texto)));

  // --- 4c22. A ROT-7b: o vazado não leva halo, e a matriz sem essa ressalva convida ao erro.
  provas.push(prova('a ROT-7b entrou na extração de regras', true, extraidas.some((r) => r.codigo === 'ROT-7b')));
  provas.push(prova('a matriz vem com a ressalva do halo', true, comRecharts.texto.includes('O vazado NÃO leva halo')));
  provas.push(prova('a ressalva traz o teste de uma pergunta', true, comRecharts.texto.includes('o texto tem a marca inteira por baixo?')));

  // --- 4c23. A SOMA POR GLIFO CONTRA A MÉDIA. Duas medições de produção mostraram que a média por classe
  // erra 9% e 21% em string real: a média orça, a soma decide.
  const { larguraDoTexto } = await import('./lib/colisao.mjs');
  const somaGrotesk = (t) => Number(larguraDoTexto(t, 11, 'grotesk').toFixed(2));
  // `42 agendas` teve medição de render: 62,6 px. A soma por glifo tem de chegar perto; a média, não.
  provas.push(prova('a soma por glifo de "42 agendas" fica a menos de 2 px do render medido', true, Math.abs(somaGrotesk('42 agendas') - 62.6) < 2));
  provas.push(prova('a média por classe erra mais que a soma no mesmo caso', true, Math.abs(10 * 5.7 - 62.6) > Math.abs(somaGrotesk('42 agendas') - 62.6)));
  // A folga é o p99 do erro declarado da tabela, 2 px, e não uma folga percentual.
  provas.push(prova('o dossiê recomenda folga de 2 px por linha, não percentual', true, comRecharts.texto.includes('+2 px por linha cobrem o p99')));
  provas.push(prova('o dossiê manda somar por glifo para decidir', true, comRecharts.texto.includes('A MÉDIA É PARA ORÇAR; A SOMA POR GLIFO É PARA DECIDIR')));
  provas.push(prova('o dossiê traz exemplos trabalhados de string típica', true, comRecharts.texto.includes('| `R$ 401,3 mil` |')));
  // O `6.4 × n` erra ALTO em string real, o que esconde rótulo: é o contrário do que a primeira redação dizia.
  // F0.1b (2026-10-02): a string é a que `formatCurrencyAxis` devolve desde o F0.5b, com o U+2212 antes
  // do símbolo. A prova usava `R$ −200 mil`, a posição antiga do sinal, que formatador nenhum escreve mais.
  provas.push(prova('o 6,4 por caractere superestima string real', true, 10 * 6.4 > somaGrotesk('42 agendas') && 11 * 6.4 > somaGrotesk(D.TIQUE_NEGATIVO)));
  provas.push(prova('o tique negativo de exemplo leva o U+2212 antes do símbolo', true, D.TIQUE_NEGATIVO.startsWith('−R$ ')));
  provas.push(prova('o dossiê escreve o tique negativo como a biblioteca o devolve', true, comRecharts.texto.includes(`| \`${D.TIQUE_NEGATIVO}\` |`)));
  // Só a parte que o GERADOR escreve (a moldura): o recorte do contrato pode citar o texto antigo como
  // história, e isso é da régua, não deste arquivo.
  const inicioDaMoldura = comRecharts.texto.indexOf('\n## A geometria da moldura, medida');
  const molduraDoCompleto = comRecharts.texto.slice(inicioDaMoldura, comRecharts.texto.indexOf('\n## ', inicioDaMoldura + 1));
  provas.push(prova('a parte da moldura existe no dossiê completo', true, inicioDaMoldura > 0 && molduraDoCompleto.length > 0));
  provas.push(prova('o gerador não escreve mais o sinal depois do símbolo', false, /R\$ [−-]\d/.test(molduraDoCompleto)));
  provas.push(prova('o dossiê corrige a própria redação sobre o 6,4', true, comRecharts.texto.includes('não é conservador, é impreciso nos dois')));
  // Terceiro caso da inversão: eixo e margem pedem superestimar.
  provas.push(prova('o dossiê inclui eixo e margem no lado de superestimar', true, comRecharts.texto.includes('Em largura de eixo e em margem, superestime')));
  // A prova anterior exigia a frase "mais o `tickMargin` de 8 px", que é a conta ERRADA e a mesma que as
  // redações vencidas da EIX-6 cometiam: ela prevê eixo que quebra o tique em duas linhas. A prova
  // codificava o defeito, e passou a cobrar os 18 px da EIX-6 mais o mecanismo que os explica.
  provas.push(prova('o dossiê manda acrescentar 18 px à tinta, não 8', true, comRecharts.texto.includes('acrescente 18 px')));
  provas.push(prova('o dossiê não repete a conta vencida do tickMargin sozinho', true, !comRecharts.texto.includes('mais** o `tickMargin` de 8 px')));
  // PROVA REESCRITA no F0.1b (2026-10-02). Ela cobrava a frase "mesmo com `tickLine={false}`", que era a
  // explicação dos 18 px pela soma do `tickSize` com o `tickMargin`; a bancada do F0.5c mediu o eixo de 1
  // em 1 px e não confirmou a conta. A prova fixava a explicação vencida e passou a cobrar o mecanismo
  // medido (o `<Text>` que mede palavra por palavra) e a ausência da conta antiga.
  provas.push(prova('o dossiê explica a sobrecarga pelo mecanismo que o F0.5c mediu', true, comRecharts.texto.includes('`recharts/es6/component/Text.js`')));
  provas.push(prova('o dossiê não explica mais os 18 px pela âncora do tique', false, comRecharts.texto.includes('getTickLineCoord')));
  provas.push(prova('o dossiê escreve o teto de tinta de 46 px', true, comRecharts.texto.includes('tinta de no máximo 46 px')));
  // Os limiares saem da tabela da emenda da `EIX-6`, por extração: a prova confere o dossiê contra o que
  // a extração leu HOJE, sem fixar 62 nem 81, para a próxima bancada não derrubar nada.
  const limiares = D.extrairLimiaresDoTique(contrato);
  provas.push(prova('a extração acha no contrato o limiar dos dois tiques de exemplo', '', [D.TIQUE_POSITIVO, D.TIQUE_NEGATIVO].filter((t) => !limiares.get(t)?.eixo).join('|')));
  provas.push(prova('o dossiê publica o limiar medido do tique negativo, lido do contrato', true, comRecharts.texto.includes(`\`${D.TIQUE_NEGATIVO}\` só a partir de ${limiares.get(D.TIQUE_NEGATIVO)?.eixo} px`)));
  const tabelaSintetica = ['| Tique | Tinta | Menor eixo em uma linha | Eixo menos tinta em Manrope |', '|---|---|---|---|', '| `A 1 mil` | 40,00 px | **55 px** | 15,0 |', '', '| `B` | 1 px | **9 px** | 8 |'].join('\n');
  const doSinteticoDeTique = D.extrairLimiaresDoTique(tabelaSintetica);
  provas.push(prova('a extração de limiar lê a coluna pelo título e para no fim da tabela', '55|15,0|1', `${doSinteticoDeTique.get('A 1 mil')?.eixo}|${doSinteticoDeTique.get('A 1 mil')?.sobrecarga}|${doSinteticoDeTique.size}`));
  provas.push(prova('contrato sem a tabela devolve mapa vazio, em vez de número de memória', 0, D.extrairLimiaresDoTique('* **EIX-6. Tique de moeda.**').size));
  const semTabelaDeTique = contrato.replace('Menor eixo em uma linha', 'Outra coluna');
  const dossieSemTabela = D.montarDossie({ familia: modeloRecharts.f, modelo: modeloRecharts.m, contrato: semTabelaDeTique, armadilhas, papel: 'completo' }).texto;
  provas.push(prova('sem a tabela no contrato, o dossiê aponta para a emenda e não escreve limiar', true, dossieSemTabela.includes('os limiares medidos estão na tabela da emenda') && !dossieSemTabela.includes('só a partir de')));

  // --- 4c24. A SONDA DO SANKEY. Declarar "sem pegadinha conhecida" mandou um produtor ler o pacote, e a
  // fórmula da escala decide a espessura de toda faixa.
  const sondaSankey = D.sondarComponentes(new Set(['Sankey']));
  provas.push(prova('o Sankey deixou de sair como sem pegadinha', 'com-pegadinha', sondaSankey.porComponente[0].estado));
  // Eram duas em 2026-09-28 e são quatro desde 2026-09-29: a ordem de pintura (ligações antes dos
  // nós) e o tipo aceito por `node` e `link` entraram porque um produtor precisou ir ler o pacote.
  provas.push(prova('as quatro pegadinhas do Sankey são confirmadas no pacote', 4, sondaSankey.porComponente[0].itens.length));
  provas.push(prova('a do valor do nó cita o Math.max dos dois lados', true, sondaSankey.porComponente[0].itens.some((i) => i.codigo.includes('Math.max(getSumOfIds'))));
  provas.push(prova('a da escala cita o mínimo entre as colunas', true, sondaSankey.porComponente[0].itens.some((i) => i.codigo.includes('Math.min(...depthTree'))));
  const doSankey = D.acharModelo(catalogo, '11_fluxo-sankey/01_sankey-simples');
  const textoSankey = D.montarDossie({ familia: doSankey.familia, modelo: doSankey.modelo, contrato, armadilhas }).texto;
  provas.push(prova('o dossiê do sankey publica a sonda e o código da armadilha', true, textoSankey.includes('REC-33') && textoSankey.includes('Sankey.js:130')));

  // --- 4c25. FORA DO ESCOPO, A MEDIÇÃO É DO PRODUTOR, e isso vai NA LINHA DA GUARDA.
  provas.push(prova('a linha da guarda diz que fora do escopo a medição é sua', true, comRecharts.texto.includes('Fora do escopo desta guarda **a medição é sua**')));
  const trechoDaMarca = comRecharts.texto.slice(comRecharts.texto.indexOf('### CONTRASTE-MARCA'), comRecharts.texto.indexOf('### REGUA-CONSTANTE'));
  provas.push(prova('a CONTRASTE-MARCA carrega a ressalva na própria seção', true, trechoDaMarca.includes('a medição é sua')));

  // --- 4d. FORMATADORES e SUPERFÍCIE DA BIBLIOTECA. Leitura apenas de `app/`.
  const formatadores = D.extrairFormatadores();
  const exportsNoArquivo = D.lerFonte(path.join(APP_SRC, 'lib', 'format.ts')).split('\n').filter((l) => /^export function /.test(l)).length;
  provas.push(prova('a extração acha TODOS os formatadores exportados', exportsNoArquivo, formatadores.itens.length));
  provas.push(prova('todo formatador entra no dossiê com assinatura', '', formatadores.itens.filter((f) => !comRecharts.texto.includes(`\`${f.assinatura}\``)).map((f) => f.nome).join('|')));
  // F0.1b (2026-10-02): sem o corpo de `format.ts`, a linha do que devolve é tudo o que o produtor tem.
  // A extração só lia comentário de uma linha, e as duas funções documentadas em bloco saíam vazias; uma
  // delas é a `formatCurrencyAxis`, que a `EIX-6` manda usar em todo tique de moeda.
  provas.push(prova('nenhum formatador sai sem a linha do que devolve', '', formatadores.itens.filter((f) => !f.comentario).map((f) => f.nome).join('|')));
  const formatoSintetico = path.join(TMP_DIR, `format-${process.pid}.ts`);
  lixo.push(formatoSintetico);
  ensureDir(TMP_DIR);
  fs.writeFileSync(
    formatoSintetico,
    [
      '/**',
      ' * Cabeçalho.',
      ' *',
      ' * O sinal de negativo: sai o U+2212,',
      ' * antes do símbolo.',
      ' */',
      '/** Uma linha. */',
      'export function umaLinha(v: number): string {',
      '}',
      '/**',
      ' * Primeiro parágrafo, em',
      ' * duas linhas.',
      ' *',
      ' * Segundo parágrafo, que é história.',
      ' */',
      'export function emBloco(v: number): string {',
      '}',
      'export function semNada(v: number): string {',
      '}',
    ].join('\n'),
    'utf8',
  );
  const doFormatoSintetico = D.extrairFormatadores(formatoSintetico);
  const comentarioDe = (nome) => doFormatoSintetico.itens.find((f) => f.nome === nome)?.comentario;
  provas.push(prova('o comentário de uma linha segue saindo como estava', 'Uma linha.', comentarioDe('umaLinha')));
  provas.push(prova('o comentário em bloco sai pelo primeiro parágrafo, numa linha só', 'Primeiro parágrafo, em duas linhas.', comentarioDe('emBloco')));
  provas.push(prova('função sem comentário sai vazia, em vez de herdar o da vizinha', '', comentarioDe('semNada')));
  provas.push(prova('o parágrafo do sinal sai do cabeçalho, inteiro e numa linha', 'O sinal de negativo: sai o U+2212, antes do símbolo.', doFormatoSintetico.sinal));
  provas.push(prova('arquivo sem o parágrafo do sinal devolve vazio, em vez de outro parágrafo', '', D.extrairFormatadores(path.join(path.dirname(SELF), 'dossie.mjs')).sinal));
  // F0.5c (2026-10-02): o dossiê fixava "13 chamam o formatador", medido em 2026-09-29, e seguia
  // publicando 13 quando já eram 15. A contagem agora sai da varredura, e a prova a confere contra uma
  // contagem INDEPENDENTE feita aqui, sem fixar o número: quem migrar uma versão não derruba a prova.
  const importaDoFormat = (nome) =>
    [...findVersions(VISUAIS_DIR), ...findVersions(EXAMPLES_DIR)].filter((v) =>
      [...fs.readFileSync(path.join(v.abs, 'Chart.tsx'), 'utf8').matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+'@\/lib\/format'/g)].some((m) =>
        m[1].split(',').some((cru) => cru.trim().split(/\s+as\s+/)[0].trim() === nome),
      ),
    ).length;
  provas.push(prova('o dossiê publica quantas peças importam formatPercentPoints, medido no acervo', true, comRecharts.texto.includes(`${importaDoFormat('formatPercentPoints')} importam \`formatPercentPoints\``)));
  provas.push(prova('o dossiê não repete a contagem fixada em 2026-09-29', false, comRecharts.texto.includes('13 chamam o formatador')));
  const exportaNomeHonesto = formatadores.itens.some((f) => f.nome === 'formatPercentFromScale100');
  provas.push(prova('o dossiê cita o nome honesto quando o Farol o exporta, e só então', exportaNomeHonesto, comRecharts.texto.includes('nome honesto `formatPercentFromScale100`')));
  const imports = D.extrairImports();
  provas.push(prova('a varredura de imports achou peça', true, imports.pecas > 300));
  provas.push(prova('a superfície do Recharts sai ordenada pela frequência', true, imports.recharts.every((par, i) => i === 0 || imports.recharts[i - 1][1] >= par[1])));
  for (const hook of ['usePlotArea', 'useXAxisScale', 'useYAxisScale']) {
    provas.push(prova(`o dossiê de Recharts traz a assinatura de ${hook}`, true, comRecharts.texto.includes(`\`${hook}: `)));
  }
  // Peça de SVG ou de HTML não recebe a lista da biblioteca que ela não usa.
  provas.push(prova('o dossiê de svg-puro não lista os componentes do Recharts', false, comSvg.texto.includes('`ResponsiveContainer`')));
  provas.push(prova('o dossiê de svg-puro ainda lista o tema e a dica', true, comSvg.texto.includes('`useAnimateOnce`')));

  // --- 4e. O CANVAS É CONSELHO, e a colisão entre o que o catálogo pede e o que o contrato proíbe.
  provas.push(prova('o dossiê marca o canvas como conselho, não especificação', true, comRecharts.texto.includes('conselho do catálogo, não especificação')));
  const pedePeso700 = { titulo: 'Teste', caso_de_uso: 'Caso.', o_que_demonstra: ['Rótulo em peso 700 nos seis itens'] };
  const dizQueNaoUsa = { titulo: 'Teste', caso_de_uso: 'Caso.', o_que_demonstra: ['Nome curto visível, sem texto girado'] };
  provas.push(prova('a marcação acha a colisão de peso de fonte', 'TIP-3', D.colisoesDaVersao(pedePeso700).map((c) => c.codigo).join('|')));
  // A negação é o que separa marcação de ruído: "sem texto girado" é a regra obedecida, não quebrada.
  provas.push(prova('a marcação não acusa a versão que diz NÃO fazer aquilo', '', D.colisoesDaVersao(dizQueNaoUsa).map((c) => c.codigo).join('|')));
  provas.push(prova('a marcação não acusa versão sem termo nenhum', '', D.colisoesDaVersao({ titulo: 'Teste', caso_de_uso: 'Caso.', o_que_demonstra: ['Barra simples com rótulo na ponta'] }).map((c) => c.codigo).join('|')));

  // --- 4f. OS PAPÉIS (F0.1, 2026-10-01). O dossiê tinha ido de 59 para 167 KB, maior que os três
  // arquivos que veio substituir, e quem revisa lia tudo para usar quatro seções. O corte é de CORPO: as
  // provas cobram presença contra a origem em cada papel, e nenhum código de regra, de armadilha ou de
  // guarda pode sumir junto. Nenhuma fixa tamanho em bytes nem contagem de linhas.
  const doHistograma = D.acharModelo(catalogo, '16_distribuicao/05_histograma-comparativo');
  const montarPapel = (papel, fonteDeArmadilhas = armadilhas) =>
    D.montarDossie({ familia: doHistograma.familia, modelo: doHistograma.modelo, contrato, armadilhas: fonteDeArmadilhas, papel });
  const mensagemDe = (acao) => {
    try {
      acao();
      return '';
    } catch (error) {
      return error.message;
    }
  };
  const doProdutor = D.montarDossie({ familia: doHistograma.familia, modelo: doHistograma.modelo, contrato, armadilhas });
  const doRevisor = montarPapel('revisor');
  const doCompleto = montarPapel('completo');
  provas.push(prova('sem papel pedido, o dossiê é o do produtor', 'produtor', doProdutor.contagem.papel));
  const recusa = mensagemDe(() => montarPapel('gerente'));
  provas.push(prova('papel desconhecido é recusado com a lista dos aceitos', true, recusa.includes('gerente') && D.PAPEIS.every((p) => recusa.includes(p))));
  const aplicaveisAoHistograma = entradasNaOrigem.filter((c) => D.prefixosAplicaveis(doHistograma.modelo.abordagem_stack).includes(c.slice(0, 3)));
  // A guarda no dossiê do produtor (F0.1b, 2026-10-02): a linha de tabela que abre com o código dela, ou o
  // bloco em prosa que abre com o código em negrito, até a linha em branco. Vazio quando não está.
  const blocoDaGuarda = (texto, codigo) => {
    const linhaDeTabela = texto.split('\n').find((l) => l.startsWith(`| \`${codigo}\` `));
    if (linhaDeTabela) return linhaDeTabela;
    const i = texto.indexOf(`\n**\`${codigo}\`**`);
    if (i < 0) return '';
    const fim = texto.indexOf('\n\n', i + 1);
    return texto.slice(i + 1, fim < 0 ? texto.length : fim);
  };
  for (const [nome, d] of [['produtor', doProdutor], ['revisor', doRevisor]]) {
    provas.push(prova(`o dossiê do ${nome} traz toda regra do contrato, por código`, '', faltando(d.texto, naOrigem)));
    provas.push(prova(`o dossiê do ${nome} traz toda armadilha aplicável, por código`, '', faltando(d.texto, aplicaveisAoHistograma)));
    // PROVA REESCRITA no F0.1b: cobrava `### CODIGO` nos dois papéis, e no do produtor a guarda passou a
    // ser linha de tabela ou bloco em prosa. A regra que ela afirma é a mesma: nenhuma guarda some.
    const temAGuarda = (g) => (nome === 'produtor' ? blocoDaGuarda(d.texto, g.codigo).length > 0 : d.texto.includes(`### ${g.codigo}`));
    provas.push(prova(`o dossiê do ${nome} traz toda guarda do código`, '', guardas.filter((g) => !temAGuarda(g)).map((g) => g.codigo).join('|')));
    provas.push(prova(`o dossiê do ${nome} diz onde está o que ficou fora`, true, d.texto.includes('--papel completo')));
  }
  provas.push(prova('o canário do corte de regra acusa: sem um código a prova não passa', 'TIP-2', faltando(doProdutor.texto.replaceAll('**TIP-2.', '**XXX.'), naOrigem)));

  // A parte de um título H2 até o próximo, e a seção de uma guarda até a próxima.
  const parteDe = (texto, titulo) => {
    const i = texto.indexOf(`\n${titulo}`);
    if (i < 0) return '';
    const fim = texto.indexOf('\n## ', i + 1);
    return texto.slice(i, fim < 0 ? texto.length : fim);
  };
  const secaoDaGuarda = (texto, codigo) => {
    const i = texto.indexOf(`\n### ${codigo}`);
    if (i < 0) return '';
    const fins = [texto.indexOf('\n### ', i + 1), texto.indexOf('\n## ', i + 1)].filter((n) => n > 0);
    return texto.slice(i, fins.length ? Math.min(...fins) : texto.length);
  };
  const linhasDeTabela = (trecho) => trecho.split('\n').filter((l) => l.startsWith('| '));

  // A GUARDA RESUMIDA: régua, onde olha, o que mede, piso, escape e motivos de não medição, sem código.
  // PROVAS REAPONTADAS no F0.1b (2026-10-02): a parte `guardasResumidas` saiu do produtor, que recebe a
  // tabela, e segue no revisor. As provas dela passaram a ler o dossiê do revisor, com a mesma cobrança.
  const semNoResumo = (teste) => guardas.filter((g) => !teste(secaoDaGuarda(doRevisor.texto, g.codigo), g)).map((g) => g.codigo).join('|');
  provas.push(prova('toda guarda resumida diz a régua e onde olha', '', semNoResumo((s) => s.includes('**Régua:**') && s.includes('**Onde olha:**'))));
  provas.push(prova('toda guarda resumida diz o que mede', '', semNoResumo((s) => /O QUE (?:ELA MEDE|A GUARDA COBRE)|\*\*O que mede:\*\*/.test(s))));
  provas.push(prova('toda guarda resumida responde sobre o escape', '', semNoResumo((s) => /\n- (?:ESCAPE|\*\*Escape:\*\*)/.test(s))));
  provas.push(prova('toda guarda resumida responde sobre a não medição', '', semNoResumo((s) => /\n- (?:N[ÃA]O MEDIDA|\*\*Não medida por:\*\*)/.test(s))));
  provas.push(prova('nenhuma constante de piso se perde no resumo', '', semNoResumo((s, g) => g.constantes.every((c) => s.includes(`\`${c.nome} = ${c.valor}\``)))));
  provas.push(prova('toda guarda resumida diz a linha em que vive', '', semNoResumo((s, g) => s.includes(`\`guardas.mjs:${g.linha}\``))));
  provas.push(prova('o teto de 250 da FRASE-ACESSIVEL chega ao produtor', true, blocoDaGuarda(doProdutor.texto, 'FRASE-ACESSIVEL').includes('ACE_MAX = 250')));
  provas.push(prova('a sintaxe do escape chega ao produtor nas duas formas', true, doProdutor.texto.includes('// check-ok: NUMERO-CRU') && doProdutor.texto.includes('{/* check-ok: NUMERO-CRU')));
  // A RAIO-CONTRA-AREA (F0.4, 2026-10-02) chega aos papéis pelo mesmo caminho das outras, com a tolerância
  // como está no código, e a GEO-3 a cita na origem. Presença, lida da origem na hora: emendar o banner ou
  // a régua não quebra a prova, e tirar o banner tem de tirar a guarda da extração.
  const guardaDeArea = guardas.find((g) => g.codigo === 'RAIO-CONTRA-AREA');
  const toleranciaDeArea = guardaDeArea?.constantes.find((c) => c.nome === 'AREA_TOLERANCIA');
  const areaNoProdutor = blocoDaGuarda(doProdutor.texto, 'RAIO-CONTRA-AREA');
  provas.push(prova('a RAIO-CONTRA-AREA é extraída com a função e com o leitor dela', 'guardaRaioContraArea|area.mjs', `${guardaDeArea?.funcao}|${(guardaDeArea?.arquivos ?? []).filter((a) => a === 'area.mjs').join('')}`));
  provas.push(prova('a tolerância da RAIO-CONTRA-AREA chega ao produtor como está no código', true, Boolean(toleranciaDeArea) && areaNoProdutor.includes(`\`AREA_TOLERANCIA = ${toleranciaDeArea?.valor}\``)));
  provas.push(prova('os motivos de grupo não julgado da RAIO-CONTRA-AREA chegam ao produtor', '', ['valor_nao_casado', 'comprimento_radial'].filter((m) => !areaNoProdutor.includes(`\`${m}\``)).join('|')));
  provas.push(prova('a RAIO-CONTRA-AREA chega ao revisor com a seção dela', true, secaoDaGuarda(doRevisor.texto, 'RAIO-CONTRA-AREA').includes('`area.mjs`')));
  const geo3 = armadilhas.slice(armadilhas.indexOf('\n### GEO-3.'), armadilhas.indexOf('\n### GEO-4.'));
  provas.push(prova('a GEO-3 cita na origem a guarda que a mede', true, geo3.includes('`RAIO-CONTRA-AREA`')));
  const semBanner = D.extrairGuardas(D.lerFonte(D.GUARDAS_PATH).replace('\n// RAIO-CONTRA-AREA\n', '\n// raio contra area\n'));
  provas.push(prova('sem o banner no código, a RAIO-CONTRA-AREA some da extração', false, semBanner.guardas.some((g) => g.codigo === 'RAIO-CONTRA-AREA')));
  const parteDasGuardas = parteDe(doRevisor.texto, `## As ${guardas.length} guardas do \`npm run check\`, resumidas`);
  provas.push(prova('a parte das guardas resumidas existe no dossiê do revisor', true, parteDasGuardas.length > 0));
  provas.push(prova('a guarda resumida não traz trecho de código cercado', false, parteDasGuardas.includes('```')));
  provas.push(prova('o produtor não recebe a fonte dos leitores de guarda', false, doProdutor.texto.includes('O leitor desta guarda')));
  provas.push(prova('o leitor da AGREGACAO-ZERO vira caminho', true, secaoDaGuarda(doRevisor.texto, 'AGREGACAO-ZERO').includes('`agregacao.mjs`')));
  provas.push(prova('o leitor da FORMATO-ACESSIVEL vira caminho', true, secaoDaGuarda(doRevisor.texto, 'FORMATO-ACESSIVEL').includes('`formato.mjs`')));
  provas.push(prova('o produtor sabe o nome dos dois leitores que ficaram fora', '', ['`agregacao.mjs`', '`formato.mjs`'].filter((a) => !doProdutor.texto.includes(a)).join('|')));

  // AS GUARDAS EM TABELA (F0.1b, 2026-10-02): o que o produtor recebe. Encolhe o "o que mede" e some o
  // comentário da constante; piso, escape e não medição entram INTEIROS, e a guarda em que um deles não
  // cabe numa célula vem em prosa. Tudo por presença contra a extração, sem contar linha nem byte.
  const guardasDoProdutor = parteDe(doProdutor.texto, `## As ${guardas.length} guardas do \`npm run check\`, em tabela`);
  provas.push(prova('a parte das guardas em tabela existe no dossiê do produtor', true, guardasDoProdutor.length > 0));
  provas.push(prova('a tabela de guardas não traz trecho de código cercado', false, guardasDoProdutor.includes('```')));
  provas.push(prova('o produtor não recebe a guarda resumida além da tabela', false, doProdutor.texto.includes('guardas do `npm run check`, resumidas')));
  const reguasDaTabela = D.reguaPorGuarda(tabela);
  const semNaTabela = (teste) => guardas.filter((g) => !teste(blocoDaGuarda(guardasDoProdutor, g.codigo), g, D.resumirGuarda(g))).map((g) => g.codigo).join('|');
  provas.push(prova('toda guarda do produtor diz a régua e onde olha', '', semNaTabela((b, g) => b.includes(reguasDaTabela.get(g.codigo).regra) && b.includes(reguasDaTabela.get(g.codigo).onde))));
  provas.push(prova('toda guarda do produtor diz a linha em que vive', '', semNaTabela((b, g) => b.includes(`\`:${g.linha}\``))));
  provas.push(prova('nenhuma constante de piso se perde na tabela', '', semNaTabela((b, g) => g.constantes.every((c) => b.includes(`\`${c.nome} = ${c.valor}\``)))));
  provas.push(prova('nenhum parágrafo de piso é cortado na tabela', '', semNaTabela((b, g, r) => !r.piso || b.includes(r.piso))));
  provas.push(prova('nenhum parágrafo de escape é cortado na tabela', '', semNaTabela((b, g, r) => !r.escape || b.includes(r.escape))));
  provas.push(prova('nenhum parágrafo de não medição é cortado na tabela', '', semNaTabela((b, g, r) => !r.naoMedida || b.includes(r.naoMedida))));
  provas.push(prova('toda guarda do produtor responde sobre o escape', '', semNaTabela((b, g, r) => b.includes(r.escape ?? (g.escapavel ? 'aceita, com o alcance do bloco acima' : 'não aceita')))));
  provas.push(prova('todo motivo de não medição achado no código chega ao produtor', '', semNaTabela((b, g, r) => Boolean(r.naoMedida) || g.motivos.every((m) => b.includes(`\`${m}\``)))));
  provas.push(prova('o que mede de toda guarda abre com o texto da origem', '', semNaTabela((b, g, r) => b.includes(D.recortarEnunciado(r.oQueMede, D.ORCAMENTO_DO_QUE_MEDE).enunciado))));
  const prosaDeclarada = doProdutor.contagem.guardasEmProsa.map((p) => p.codigo);
  const prosaNoTexto = guardas.filter((g) => guardasDoProdutor.includes(`\n**\`${g.codigo}\`**`)).map((g) => g.codigo);
  provas.push(prova('a guarda em prosa no texto é a que a montagem declara, e nenhuma outra', prosaDeclarada.join('|'), prosaNoTexto.join('|')));
  provas.push(prova('a introdução nomeia toda guarda que foi para a prosa', '', prosaDeclarada.filter((c) => !guardasDoProdutor.slice(0, guardasDoProdutor.indexOf('\n> ')).includes(`\`${c}\``)).join('|')));
  provas.push(prova('nenhuma guarda sai nas duas formas', '', prosaDeclarada.filter((c) => guardasDoProdutor.split('\n').some((l) => l.startsWith(`| \`${c}\` `))).join('|')));
  provas.push(prova('o revisor não declara guarda em prosa, porque não leva a tabela', 0, doRevisor.contagem.guardasEmProsa.length));
  // A decisão de caber, em guardas sintéticas: acusa o parágrafo longo e a barra vertical, passa a curta.
  const guardaCurta = { codigo: 'CURTA', escapavel: true, constantes: [{ nome: 'PISO_X', valor: '3', comentario: 'fica na origem' }], motivos: ['sem_preview'], paragrafos: ['O QUE ELA MEDE: a coisa. Segunda frase que passa do orçamento porque é comprida de propósito, com detalhe que mora no banner da guarda e não precisa vir para a célula da tabela do produtor de jeito nenhum.', 'ESCAPE por linha.'] };
  const celulasCurta = D.celulasDaGuarda(guardaCurta, { regra: 'XXX-1', onde: 'Chart.tsx' });
  provas.push(prova('guarda de parágrafos curtos cabe na tabela', true, celulasCurta.cabe));
  provas.push(prova('o que mede é cortado em fim de frase, com a marca do corte', 'O QUE ELA MEDE: a coisa. […]', celulasCurta.mede));
  provas.push(prova('a constante vai com nome e valor, sem o comentário', '`PISO_X = 3`', celulasCurta.piso));
  provas.push(prova('sem parágrafo de não medição, vão os motivos achados no código', '`sem_preview`', celulasCurta.naoMedida));
  const paragrafoLongo = `NÃO MEDIDA, sempre com motivo: ${'`sem_preview` (explicado por extenso), '.repeat(12)}e mais nada.`;
  const celulasLonga = D.celulasDaGuarda({ ...guardaCurta, codigo: 'LONGA', paragrafos: [...guardaCurta.paragrafos, paragrafoLongo] }, { regra: 'XXX-1', onde: 'Chart.tsx' });
  provas.push(prova('o canário é mesmo maior que a célula', true, Buffer.byteLength(paragrafoLongo, 'utf8') > D.ORCAMENTO_DA_CELULA));
  provas.push(prova('parágrafo de não medição maior que a célula tira a guarda da tabela', 'false|paragrafo_longo', `${celulasLonga.cabe}|${celulasLonga.motivo}`));
  provas.push(prova('o parágrafo longo não é cortado para caber', paragrafoLongo, celulasLonga.naoMedida));
  const celulasComBarra = D.celulasDaGuarda({ ...guardaCurta, codigo: 'BARRA', paragrafos: ['Declara retorno `number | null`.'] }, { regra: 'XXX-1', onde: 'Chart.tsx' });
  provas.push(prova('texto com barra vertical tira a guarda da tabela, em vez de escapar a barra', 'false|barra_vertical|Declara retorno `number | null`.', `${celulasComBarra.cabe}|${celulasComBarra.motivo}|${celulasComBarra.mede}`));
  provas.push(prova('guarda sem escape diz que não aceita', 'não aceita', D.celulasDaGuarda({ ...guardaCurta, escapavel: false, paragrafos: ['Mede.'] }, null).escape));
  provas.push(prova('sem parágrafo e sem motivo no código, a célula não atesta cobertura', false, /nenhum/.test(D.celulasDaGuarda({ ...guardaCurta, motivos: [], paragrafos: ['Mede.'] }, null).naoMedida)));

  // OS FORMATADORES E O RECHARTS ENXUTOS (F0.1b): sai o corpo de `format.ts` e a contagem de imports; fica
  // a assinatura com a linha do que devolve, o parágrafo do sinal, os hooks e o comportamento conferido.
  const formatadoresDoProdutor = parteDe(doProdutor.texto, `## Os ${formatadores.itens.length} formatadores de \`@/lib/format\``);
  provas.push(prova('todo formatador chega ao produtor com a assinatura e a linha do que devolve', '', formatadores.itens.filter((f) => !formatadoresDoProdutor.includes(`| \`${f.assinatura}\` | ${f.comentario} |`)).map((f) => f.nome).join('|')));
  provas.push(prova('o parágrafo do sinal da origem fala do U+2212 e da moeda', true, formatadores.sinal.includes('U+2212') && formatadores.sinal.includes('R$')));
  provas.push(prova('o parágrafo do sinal chega inteiro ao produtor', true, formatadores.sinal.length > 0 && formatadoresDoProdutor.includes(formatadores.sinal)));
  provas.push(prova('a tabela de formatadores do produtor só imprime linha que o completo imprime', '', linhasDeTabela(formatadoresDoProdutor).filter((l) => !doCompleto.texto.includes(l)).join(' ')));
  provas.push(prova('o produtor não recebe o corpo de format.ts', false, doProdutor.texto.includes('function formatNumber(') || formatadoresDoProdutor.includes('```')));
  provas.push(prova('o produtor sabe que o caso de borda mora no corpo, e onde', true, formatadoresDoProdutor.includes('caso de borda') && formatadoresDoProdutor.includes(`\`${formatadores.arquivo}\``)));
  provas.push(prova('o aviso da DAD-4 sobre o conversor de escala chega ao produtor', true, formatadoresDoProdutor.includes('`DAD-4`')));
  const rechartsDoProdutor = parteDe(doProdutor.texto, '## A superfície do Recharts e do tema que o catálogo usa');
  provas.push(prova('o produtor não recebe a contagem de imports do Recharts', false, rechartsDoProdutor.includes('quantas peças importam cada nome') || /`ResponsiveContainer` \d/.test(rechartsDoProdutor)));
  provas.push(prova('o produtor segue com a assinatura dos hooks', '', ['usePlotArea', 'useXAxisScale', 'useYAxisScale'].filter((h) => !rechartsDoProdutor.includes(`\`${h}: `)).join('|')));
  provas.push(prova('o produtor segue com o comportamento conferido no pacote', true, rechartsDoProdutor.includes('### O comportamento dos componentes que este modelo usa')));
  provas.push(prova('o cabeçalho do produtor nomeia os três cortes novos', '', ['o corpo de `format.ts`', 'quantas peças importam cada nome', 'o corpo de cada uma'].filter((t) => !parteDe(`\n${doProdutor.texto}`, '# Dossiê de produção').includes(t)).join('|')));
  provas.push(prova('o completo guarda o corpo, a contagem e o corpo das guardas', '', ['function formatNumber(', 'com quantas peças importam cada nome', '`ResponsiveContainer`', 'Pisos e limiares, como estão no código'].filter((t) => !doCompleto.texto.includes(t)).join('|')));

  // O TETO DO PRODUTOR: 110 KB, decisão do dono no F0.1c (2026-10-02). É guarda contra crescimento calado,
  // não meta de tamanho: na ponta ele avisa e grava, e AQUI ELE REPROVA. O aviso sai da mesma função nos
  // dois lugares. O valor fica fixado numa prova de propósito: quem subir o teto para calar o aviso tem de
  // mexer nela, e a mudança aparece na revisão.
  provas.push(prova('o teto do produtor é o que o dono decidiu, 110 KB', 110 * 1024, D.TETO_DO_PRODUTOR));
  // A redação do aviso se prova com teto explícito, para não depender do valor da constante.
  provas.push(prova('produtor acima do teto recebe aviso com os dois tamanhos', true, (D.avisoDoTeto({ papel: 'produtor', bytes: 101 * 1024 }, 100 * 1024) ?? '').includes('101,0 KB contra 100,0 KB')));
  provas.push(prova('um byte acima do teto do produtor já é aviso', true, D.avisoDoTeto({ papel: 'produtor', bytes: D.TETO_DO_PRODUTOR + 1 }) !== null));
  provas.push(prova('produtor no teto exato não recebe aviso', null, D.avisoDoTeto({ papel: 'produtor', bytes: D.TETO_DO_PRODUTOR })));
  provas.push(prova('o teto é do produtor: o completo acima dele não recebe aviso', null, D.avisoDoTeto({ papel: 'completo', bytes: D.TETO_DO_PRODUTOR * 2 })));
  // PASSA: o dossiê de verdade do modelo de prova cabe no teto. É esta a prova que fica vermelha no dia em
  // que uma emenda de régua ou uma seção nova levar o produtor para cima dos 110 KB.
  provas.push(prova('o dossiê do produtor do modelo de prova cabe no teto', null, D.avisoDoTeto(doProdutor.contagem)));
  console.log(`       tamanho do dossiê do produtor do modelo de prova: ${doProdutor.contagem.bytes} B, teto de ${D.TETO_DO_PRODUTOR} B.`);
  // ACUSA: o mesmo modelo, montado pelo mesmo caminho, com a origem inflada de propósito. O enchimento
  // entra na seção "Antes de entregar", que o produtor leva inteira, na medida da folga mais 1 KB: é o
  // crescimento calado que o teto existe para pegar, e o tamanho sai da folga medida, não de número fixo.
  const fraseDeEnchimento = 'Enchimento da prova do teto. ';
  const folgaDoModeloDeProva = Math.max(D.TETO_DO_PRODUTOR - doProdutor.contagem.bytes, 0);
  const enchimento = fraseDeEnchimento.repeat(Math.ceil((folgaDoModeloDeProva + 1024) / fraseDeEnchimento.length));
  const produtorInflado = montarPapel('produtor', armadilhas.replace('\n## Antes de entregar\n', `\n## Antes de entregar\n\n${enchimento}\n`));
  provas.push(prova('o enchimento da origem chega inteiro ao produtor inflado', true, produtorInflado.texto.includes(enchimento.trim())));
  provas.push(prova('produtor inflado de propósito acima do teto é acusado', true, D.avisoDoTeto(produtorInflado.contagem) !== null));

  // --- 4g. OS RECORTES PONTUAIS DO F0.3 (2026-10-02). O defeito comum era prosa do gerador que ficou para
  // trás da origem emendada. Cada prova cobra o trecho QUE A ORIGEM TEM HOJE, lido dela na hora, e nunca
  // uma redação fixa: emendar a régua não pode quebrar a prova, e tirar o trecho tem de calar o dossiê.
  const listaSintetica = ['- Primeiro item, de uma linha.', '- Segundo item `com marca`, que continua', '  na linha de baixo.', '  * Sub-item que não entra.', '- Terceiro.'].join('\n');
  provas.push(prova('o recorte de item junta a continuação e para no sub-item', 'Segundo item `com marca`, que continua na linha de baixo.', D.extrairItem(listaSintetica, '`com marca`')));
  provas.push(prova('item que a origem não tem devolve nulo, não texto de memória', null, D.extrairItem(listaSintetica, 'marca que não existe')));
  const entradaSintetica = '### ZZZ-1. Uma [1 modelo]\n\n- **Saída.** Antes. O trecho começa aqui e\n  termina aqui. Depois.\n\n### ZZZ-10. Outra\n\n- **Saída.** O trecho começa aqui e termina aqui.\n';
  provas.push(prova('o recorte de frase fica dentro da entrada do código pedido', 'O trecho começa aqui e termina aqui.', D.extrairFraseDaArmadilha(entradaSintetica, 'ZZZ-1', 'O trecho começa', 'termina aqui.')));
  provas.push(prova('frase que a entrada não tem devolve nulo', null, D.extrairFraseDaArmadilha(entradaSintetica, 'ZZZ-1', 'Trecho ausente', 'termina aqui.')));
  // GEO-1: a forma de declarar o canvas vem da armadilha, e o texto por versão não afirma mais um caso só.
  const comoDeclarar = D.extrairFraseDaArmadilha(armadilhas, 'GEO-1', 'quando a conta não cabe em nenhum preset', 'se lê de primeira.');
  provas.push(prova('a GEO-1 traz os casos de como declarar o canvas', true, typeof comoDeclarar === 'string' && comoDeclarar.includes('nome')));
  provas.push(prova('o produtor recebe a frase da GEO-1 como a origem a escreve', true, doProdutor.texto.includes(comoDeclarar)));
  provas.push(prova('o texto por versão não manda mais declarar o canvas por número', false, doProdutor.texto.includes('canvas declarado por número')));
  const semOsCasos = montarPapel('produtor', armadilhas.replace('quando a conta não cabe em nenhum preset', 'quando a conta não fecha'));
  provas.push(prova('sem a frase na origem o dossiê cala, em vez de afirmar de memória', false, semOsCasos.texto.includes('Como declarar o canvas')));
  // A frase acessível: onde ela vive no preview, pela frase do banner da guarda.
  const carimbo = D.extrairFraseDoCarimbo();
  provas.push(prova('o banner da FRASE-ACESSIVEL nomeia o atributo do carimbo', true, carimbo?.frase.includes('`data-farol-ace`') === true));
  provas.push(prova('o produtor lê onde a frase acessível vive no preview', true, doProdutor.texto.includes(carimbo?.frase ?? 'AUSENTE')));
  provas.push(prova('banner sem o parágrafo do carimbo devolve nulo', null, D.extrairFraseDoCarimbo('// OUTRO PARÁGRAFO qualquer.\n')));
  // ESPESSURA-MARCA: os dois motivos de marca, pelo item de Fluxo do ARMADILHAS.
  const motivosDaEspessura = D.extrairItem(armadilhas, 'Quando a `ESPESSURA-MARCA` não mede');
  provas.push(prova('o item de Fluxo nomeia os dois motivos de marca', true, ['`sem_marca_de_barra`', '`marca_fora_do_bar`'].every((m) => motivosDaEspessura?.includes(m))));
  provas.push(prova('produtor e revisor recebem o item dos dois motivos, literal', '', [doProdutor, doRevisor].filter((d) => !d.texto.includes(motivosDaEspessura ?? 'AUSENTE')).map((d) => d.papel ?? 'papel').join('|')));
  // A caixa de tinta: conta sobre as constantes do leitor, que a GEO-19 manda reservar.
  const C2 = await import('./lib/colisao.mjs');
  const [caixa11] = D.medirCaixaDeTinta([11]);
  provas.push(prova('a caixa de tinta de 11 px sai das constantes do leitor', Number((11 * (C2.ASCENDENTE + C2.DESCENDENTE)).toFixed(2)), Number(caixa11.altura.toFixed(2))));
  provas.push(prova('o produtor recebe a altura da caixa de tinta de 11 px', true, doProdutor.texto.includes(`**${caixa11.altura.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} px**`)));
  // EIX-6b: a emenda do tique da borda mora num sub-item, que o enunciado da regra não alcança.
  const emendaDoTique = D.extrairItem(contrato, 'com o eixo de categoria escondido');
  const cabecaDaEmenda = (emendaDoTique ?? 'AUSENTE').split('.**')[0];
  provas.push(prova('o contrato traz a emenda do tique com o eixo de categoria escondido', true, emendaDoTique !== null && /\d+ px/.test(cabecaDaEmenda)));
  provas.push(prova('os três papéis recebem a emenda do tique', '', [doProdutor, doRevisor, doCompleto].filter((d) => !d.texto.includes(cabecaDaEmenda)).length ? 'falta em algum papel' : ''));
  const semEmenda = D.montarDossie({ familia: doHistograma.familia, modelo: doHistograma.modelo, contrato: contrato.replace('com o eixo de categoria escondido', 'com o eixo oculto'), armadilhas });
  provas.push(prova('sem a emenda no contrato a seção dela não sai', false, semEmenda.texto.includes('Emenda da `EIX-6b`')));
  // Texto sobre marca TRANSLÚCIDA: o par que a matriz aprova opaco cai com `fillOpacity`.
  const composta = D.medirTextoSobreMarcaComposta(4.5);
  provas.push(prova('opaco, o vazado sobre --chart-1 passa no claro', true, composta.razao('--surface-raised', '--chart-1', 1, 'light') >= 4.5));
  provas.push(prova('composto a 0,72, o mesmo par cai abaixo do piso de texto', true, composta.razao('--surface-raised', '--chart-1', 0.72, 'light') < 4.5));
  const doChart1 = composta.linhas.find((l) => l.fundo === '--chart-1');
  const passaNosDois = (l, alfa) => ['dark', 'light'].every((tema) => composta.razao(l.texto, l.fundo, alfa, tema) >= 4.5);
  provas.push(prova('na opacidade mínima publicada o texto passa nos dois temas', true, passaNosDois(doChart1, doChart1.minima)));
  provas.push(prova('um passo abaixo dela o texto reprova em algum tema', false, passaNosDois(doChart1, doChart1.minima - 0.01)));
  provas.push(prova('a opacidade do texto nunca é menor que a da marca', 0, composta.linhas.filter((l) => l.minima < l.daMarca).length));
  provas.push(prova('produtor e completo avisam que a matriz vale para marca opaca', '', [doProdutor, doCompleto].filter((d) => !d.texto.includes('A matriz vale para marca OPACA')).length ? 'falta em algum papel' : ''));
  // As duas sondas novas do pacote: a isenção da forma própria e a faixa de um período só.
  const sondaDaFaixa = D.sondarComponentes(new Set(['ReferenceArea', 'Bar']));
  const itensDe = (nome) => sondaDaFaixa.porComponente.find((c) => c.componente === nome)?.itens ?? [];
  provas.push(prova('a sonda do Bar confirma no pacote a isenção só para dimensão zero', true, itensDe('Bar').some((i) => i.codigo.includes('!hasCustomShape') && i.linha > 0)));
  provas.push(prova('a sonda da ReferenceArea confirma o x2 mapeado no fim da banda', true, itensDe('ReferenceArea').some((i) => /BANDA/.test(i.titulo) && i.codigo.includes("position: 'end'"))));
  provas.push(prova('nenhuma das duas sondas novas ficou sem confirmar', 0, sondaDaFaixa.naoConfirmadas.length));
  // A seleção do resumo, numa guarda sintética: título não é resposta, e cada rótulo vai para o seu lugar.
  const resumoSintetico = D.resumirGuarda({ paragrafos: ['TÍTULO SEM CORPO:', 'ESCAPE por linha.', 'Mede a coisa.', 'NÃO MEDIDA: sem_preview.', 'PISO de 3:1.'] });
  provas.push(prova('o resumo pula o título e os parágrafos de outro rótulo', 'Mede a coisa.', resumoSintetico.oQueMede));
  provas.push(prova('o resumo separa piso, escape e não medição', 'PISO de 3:1.|ESCAPE por linha.|NÃO MEDIDA: sem_preview.', `${resumoSintetico.piso}|${resumoSintetico.escape}|${resumoSintetico.naoMedida}`));
  provas.push(prova('o rótulo O QUE ELA MEDE vence a ordem dos parágrafos', 'O QUE ELA MEDE: x.', D.resumirGuarda({ paragrafos: ['Histórico.', 'O QUE ELA MEDE: x.'] }).oQueMede));
  provas.push(prova('guarda sem parágrafo nenhum sai sem o que mede, em vez de inventar', null, D.resumirGuarda({ paragrafos: [] }).oQueMede));
  provas.push(prova('toda guarda do código tem o que mede para resumir', '', guardas.filter((g) => !D.resumirGuarda(g).oQueMede).map((g) => g.codigo).join('|')));
  provas.push(prova('toda guarda do código tem régua na tabela do cabeçalho', '', guardas.filter((g) => !D.reguaPorGuarda(tabela).get(g.codigo)?.regra).map((g) => g.codigo).join('|')));

  // A MOLDURA ENXUTA: a linha do canvas do modelo, a linha da moldura que vale para ele e a tabela do
  // passo. As linhas de tabela têm de ser as MESMAS do completo: papel enxuto não publica outro número.
  const { CANVAS_PRESETS } = await import('./lib/meta.mjs');
  const molduraDoProdutor = parteDe(doProdutor.texto, '## A geometria da moldura, medida');
  const canvasDoModelo = [...new Set(doHistograma.modelo.versoes.map((v) => v.canvas_sugerido).filter((p) => CANVAS_PRESETS[p]))];
  provas.push(prova('o modelo de prova tem canvas sugerido conhecido', true, canvasDoModelo.length > 0));
  provas.push(prova('a moldura enxuta nomeia todo canvas do modelo, com a medida', '', canvasDoModelo.filter((p) => !molduraDoProdutor.includes(`\`${p}\` ${CANVAS_PRESETS[p].width}x${CANVAS_PRESETS[p].height}`)).join('|')));
  const classeDeLargura = (folgado) => (folgado ? '≥ 560 px' : '< 560 px');
  const classesDoModelo = new Set(canvasDoModelo.map((p) => CANVAS_PRESETS[p].width >= 560));
  provas.push(prova('a moldura enxuta traz a linha de moldura do canvas do modelo', '', [...classesDoModelo].filter((f) => !molduraDoProdutor.includes(classeDeLargura(f))).map(classeDeLargura).join('|')));
  provas.push(prova('a moldura enxuta não traz a linha de moldura de outro canvas', '', [true, false].filter((f) => !classesDoModelo.has(f) && molduraDoProdutor.includes(classeDeLargura(f))).map(classeDeLargura).join('|')));
  provas.push(prova('a moldura enxuta traz a tabela do passo', true, molduraDoProdutor.includes('Corpo, cabeçalho de 1 linha') && molduraDoProdutor.includes('Espessura com 8 faixas')));
  provas.push(prova('a moldura enxuta só imprime linha de tabela que o completo imprime', '', linhasDeTabela(molduraDoProdutor).filter((l) => !doCompleto.texto.includes(l)).join(' ')));
  const cortesDaMoldura = ['A tabela por glifo', 'A altura de linha do corpo', 'A largura de caractere', 'O que o serializador grava'];
  provas.push(prova('o produtor não recebe o que a moldura enxuta cortou', '', cortesDaMoldura.filter((t) => doProdutor.texto.includes(`### ${t}`) || doProdutor.texto.includes(`#### ${t}`)).join('|')));

  // A PALETA ENXUTA: só as duas tabelas que decidem cor antes de desenhar.
  const paletaDoProdutor = parteDe(doProdutor.texto, '## As lacunas medidas da paleta');
  provas.push(prova('a paleta enxuta traz a tabela de opacidade mínima', true, paletaDoProdutor.includes('### A opacidade mínima de cada cor') && paletaDoProdutor.includes('| Cor | Opacidade mínima |')));
  provas.push(prova('a paleta enxuta traz a tabela de texto sobre marca', true, paletaDoProdutor.includes('### Que texto é legível sobre cada preenchimento') && paletaDoProdutor.includes('| Preenchimento |')));
  // Presença de cada cor em CADA tabela, lida na subseção dela: contar ocorrências na parte inteira
  // quebraria no dia em que a paleta enxuta ganhasse uma terceira tabela por bom motivo.
  const semLinhaNaTabela = (titulo) => opacidade.linhas.map((l) => l.token).filter((t) => !secaoDaGuarda(paletaDoProdutor, titulo).includes(`| \`${t}\` |`)).join('|');
  provas.push(prova('a tabela de opacidade enxuta traz toda cor de marca', '', semLinhaNaTabela('A opacidade mínima de cada cor')));
  provas.push(prova('a tabela de texto sobre marca enxuta traz todo preenchimento', '', semLinhaNaTabela('Que texto é legível sobre cada preenchimento')));
  provas.push(prova('a paleta enxuta só imprime linha de tabela que o completo imprime', '', linhasDeTabela(paletaDoProdutor).filter((l) => !doCompleto.texto.includes(l)).join(' ')));
  const cortesDaPaleta = ['Rampa sequencial contra o cartão', 'Neutros de estrutura contra o cartão', 'Texto e procedência contra o cartão', 'Razão entre marcas não é piso'];
  provas.push(prova('a paleta enxuta não traz as outras subseções', '', cortesDaPaleta.filter((t) => paletaDoProdutor.includes(`### ${t}`)).join('|')));
  provas.push(prova('o completo guarda o que o produtor deixou fora', '', [...cortesDaMoldura, ...cortesDaPaleta, 'O leitor desta guarda'].filter((t) => !doCompleto.texto.includes(t)).join('|')));

  // ANTES DE ENTREGAR: as perguntas de autorrevisão do ARMADILHAS.md, por extração literal.
  const antes = D.extrairAntesDeEntregar(armadilhas);
  provas.push(prova('a seção Antes de entregar sai literal da origem', true, antes.corpo.length > 0 && armadilhas.includes(antes.corpo)));
  provas.push(prova('o dossiê do produtor traz a seção Antes de entregar inteira', true, doProdutor.texto.includes(`\n## ${antes.titulo}\n`) && doProdutor.texto.includes(antes.corpo)));
  const perguntas = [...antes.corpo.matchAll(/^\d+\. \*\*(.+?)\*\*/gm)].map((m) => m[1]);
  provas.push(prova('a origem tem perguntas numeradas para extrair', true, perguntas.length > 0));
  provas.push(prova('toda pergunta de antes de entregar chega ao produtor', '', perguntas.filter((p) => !doProdutor.texto.includes(`**${p}**`)).join('|')));
  provas.push(prova('origem sem a seção Antes de entregar é erro, não parte vazia', true, mensagemDe(() => D.extrairAntesDeEntregar('## Fluxo\n\ntexto\n')).includes('não encontrada')));
  provas.push(prova('seção Antes de entregar vazia na origem é erro', true, mensagemDe(() => D.extrairAntesDeEntregar('## Antes de entregar\n\n## Outra\n\ntexto\n')).includes('vazia')));
  const armadilhasSemASecao = armadilhas.replace('\n## Antes de entregar\n', '\n## Outro nome\n');
  provas.push(prova('o dossiê do produtor não sai calado sem a seção prometida', true, mensagemDe(() => montarPapel('produtor', armadilhasSemASecao)).includes('Antes de entregar')));
  provas.push(prova('o revisor não falha por uma seção que ele não leva', '', mensagemDe(() => montarPapel('revisor', armadilhasSemASecao))));
  provas.push(prova('o completo também traz Antes de entregar', true, doCompleto.texto.includes(antes.corpo)));

  // O REVISOR: o modelo, as versões, as regras, as armadilhas e as guardas resumidas, e só.
  const doRevisorTraz = ['## O modelo', '## As versões', 'regras de acabamento, em enunciado', '## As armadilhas que valem para', 'guardas do `npm run check`, resumidas'];
  provas.push(prova('o dossiê do revisor traz as cinco partes dele', '', doRevisorTraz.filter((t) => !doRevisor.texto.includes(t)).join('|')));
  const foraDoRevisor = ['## A especificação estrutural', '## A geometria da moldura', '## As lacunas medidas da paleta', 'formatadores de `@/lib/format`', '## A superfície do Recharts', '## Os comandos', `## ${antes.titulo}`];
  provas.push(prova('o dossiê do revisor não traz o que é de quem produz', '', foraDoRevisor.filter((t) => doRevisor.texto.includes(t)).join('|')));
  provas.push(prova('o dossiê do produtor traz o que o revisor não traz', '', foraDoRevisor.filter((t) => !doProdutor.texto.includes(t)).join('|')));
  provas.push(prova('o dossiê do revisor não aponta para seção que ele não traz', false, doRevisor.texto.includes('A 14.1, acima')));
  provas.push(prova('o dossiê do revisor se apresenta como de revisão', true, doRevisor.texto.startsWith('# Dossiê de revisão: ')));
  provas.push(prova('o dossiê do produtor é menor que o completo', true, doProdutor.contagem.bytes < doCompleto.contagem.bytes));
  provas.push(prova('o dossiê do revisor é menor que o do produtor', true, doRevisor.contagem.bytes < doProdutor.contagem.bytes));

  // --- 7. Vários alvos e alvo inexistente, o mesmo contrato de `check` e `render`.
  const alvoBom = `${modeloSvg.f.slug}/${modeloSvg.m.slug}`;
  const alvoOutro = `${modeloRecharts.f.slug}/${modeloRecharts.m.slug}`;
  const fantasma = `${modeloSvg.f.slug}/99_modelo-inexistente`;
  const dois = D.planModelos(catalogo, [alvoBom, alvoOutro]);
  provas.push(prova('planModelos processa DOIS alvos, na ordem pedida', `${alvoBom}|${alvoOutro}`, dois.modelos.map((x) => `${x.familia.slug}/${x.modelo.slug}`).join('|')));
  provas.push(prova('planModelos não repete o mesmo modelo', 1, D.planModelos(catalogo, [alvoBom, alvoBom]).modelos.length));
  provas.push(prova('planModelos expande a família inteira', familia.modelos.length, D.planModelos(catalogo, [familia.slug]).modelos.length));
  const comFantasma = D.planModelos(catalogo, [alvoBom, fantasma]);
  provas.push(prova('planModelos segue com o alvo válido quando o outro não existe', 1, comFantasma.modelos.length));
  provas.push(prova('planModelos nomeia o alvo inexistente em vez de calar', true, (comFantasma.alvos[1]?.motivo ?? '').includes(fantasma)));
  // Modelo sem pasta no disco é alvo legítimo: são 81 dos 205, e é para eles que o dossiê existe.
  const semPasta = catalogo.flatMap((f) => f.modelos.map((m) => ({ f, m }))).find((x) => !fs.existsSync(path.join(VISUAIS_DIR, x.f.slug, x.m.slug)));
  if (semPasta) {
    const rel = `${semPasta.f.slug}/${semPasta.m.slug}`;
    provas.push(prova('modelo sem pasta no disco continua sendo alvo válido', 1, D.planModelos(catalogo, [rel]).modelos.length));
  }
  const ponta = await rodarScript('dossie.mjs', [alvoBom, fantasma, '--json']);
  const relatorio = JSON.parse(ponta.out);
  provas.push(prova('dossie grava o alvo válido mesmo com um inexistente na chamada', 1, relatorio.dossies.length));
  provas.push(prova('dossie conta o alvo inexistente como falha no relatório', 1, relatorio.alvosComFalha));
  provas.push(prova('dossie nomeia o caminho do alvo inexistente', true, JSON.stringify(relatorio.alvos).includes(fantasma)));
  provas.push(prova('dossie sai com código diferente de zero quando um alvo falha', true, ponta.code !== 0));
  provas.push(prova('dossie imprime onde gravou', true, relatorio.dossies[0].arquivo.includes('.qa/dossie/')));
  // A flag `--papel`: o padrão grava no nome que os agentes já leem, o outro papel grava em arquivo
  // próprio para não sobrescrever, e valor fora da lista é erro antes de qualquer gravação.
  provas.push(prova('dossie sem --papel relata o papel produtor', 'produtor', relatorio.papel));
  provas.push(prova('dossie sem --papel grava no nome que os agentes já leem', true, relatorio.dossies[0].arquivo.endsWith(`/${modeloSvg.f.slug}__${modeloSvg.m.slug}.md`)));
  const pontaRevisor = await rodarScript('dossie.mjs', [alvoBom, '--papel', 'revisor', '--json']);
  const relatorioRevisor = pontaRevisor.code === 0 ? JSON.parse(pontaRevisor.out) : { dossies: [{ arquivo: '' }] };
  provas.push(prova('dossie --papel revisor relata o papel pedido', 'revisor', relatorioRevisor.papel));
  provas.push(prova('dossie --papel revisor grava em arquivo próprio', true, relatorioRevisor.dossies[0].arquivo.endsWith(`/${modeloSvg.f.slug}__${modeloSvg.m.slug}.revisor.md`)));
  // O teto na ponta (F0.1b): o JSON diz se o produtor passou, pelo tamanho que ele mesmo relata, e o
  // papel sem teto nunca sai marcado. Sem número fixo: a prova confere a marca contra os bytes do relato.
  provas.push(prova('dossie marca no JSON o produtor acima do teto, pelo tamanho relatado', relatorio.dossies[0].bytes > D.TETO_DO_PRODUTOR, relatorio.dossies[0].acimaDoTeto));
  provas.push(prova('dossie não marca teto em papel que não é o do produtor', false, relatorioRevisor.dossies[0].acimaDoTeto));
  const pontaPapelErrado = await rodarScript('dossie.mjs', [alvoBom, '--papel', 'gerente']);
  provas.push(prova('dossie recusa papel desconhecido', true, pontaPapelErrado.code !== 0 && pontaPapelErrado.err.includes('--papel aceita')));
  const pontaPapelVazio = await rodarScript('dossie.mjs', [alvoBom, '--papel']);
  provas.push(prova('dossie recusa --papel sem valor em vez de cair no padrão', true, pontaPapelVazio.code !== 0 && pontaPapelVazio.err.includes('--papel aceita')));
  const semAlvo = await rodarScript('dossie.mjs', []);
  provas.push(prova('dossie sem alvo pede o caminho', true, semAlvo.err.includes('Informe o caminho relativo a VISUAIS') && semAlvo.code !== 0));

  for (const dir of lixo) fs.rmSync(dir, { recursive: true, force: true });
  const falhas = provas.filter((p) => !p).length;
  console.log(`       ${provas.length - falhas} de ${provas.length} provas do dossiê passaram.`);
  return falhas === 0;
}

/**
 * 3d. Lint do Farol (`npm run lint`, 2026-10-15, pedido P4): a régua é a do `app/eslint.config.js`, carrega
 * as três regras que a colagem mediu e toda regra explícita do arquivo do Farol, acusa `p && p.value !== null`
 * e `String(unknown)` numa versão descartável e deixa passar a forma equivalente `p?.value != null`. O
 * programa de tipos da prova é um `tsconfig` temporário sobre a pasta descartável, para não construir o
 * programa dos 814 `Chart.tsx` a cada `selftest`.
 */
async function lintTest() {
  const provas = [];
  const L = await import('./lint.mjs');
  const regrasDaRegua = new Set(L.configDoFarol().flatMap((c) => Object.keys(c.rules ?? {})));
  provas.push(prova('a régua do lint carrega as três regras que o P4 mediu na colagem', '', L.REGRAS_DO_P4.filter((r) => !regrasDaRegua.has(r)).join('|')));
  const explicitas = L.regrasExplicitasDoFarol();
  provas.push(prova('o eslint.config.js do Farol tem regras explícitas para comparar', true, explicitas.length >= 3));
  provas.push(prova('toda regra explícita do eslint.config.js do Farol está na régua do catálogo', '', explicitas.filter((r) => !regrasDaRegua.has(r)).join('|')));

  const raiz = path.join(TMP_DIR, `lint-${process.pid}`);
  fs.rmSync(raiz, { recursive: true, force: true });
  const versoes = [];
  const escrever = (nome, chart) => {
    const dir = path.join(raiz, '99_prova', '01_lint', nome);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'Chart.tsx'), chart, 'utf8');
    fs.writeFileSync(path.join(dir, 'data.ts'), 'export const data = [{ value: 1 }];\n', 'utf8');
    versoes.push({ abs: dir, rel: relToVisuais(dir) });
  };
  // A forma é a de `01/01 v4`, que o Farol acusou na colagem: `previous` vem de acesso por índice (tipo
  // `Row | undefined`, pelo `noUncheckedIndexedAccess`) e a cadeia fica dentro de um `if`. Com o operando
  // tipado `| null` em vez de `| undefined`, ou atribuída a uma variável, a regra se cala (medido em
  // 2026-10-15), então o fixture segue a forma do acervo. `interface` e não `type`, pela
  // `consistent-type-definitions` da mesma régua.
  escrever(
    'v1_acusa',
    [
      'interface Row { value: number | null }',
      'export function Chart({ rows, payload }: { rows: Row[]; payload?: { value: unknown } }) {',
      '  const previous = rows[rows.length - 2];',
      '  const kpi = rows[0];',
      "  if (previous && previous.value !== null && kpi && kpi.value !== null) return <p>{previous.value - kpi.value}{String(payload?.value ?? '')}</p>;",
      '  return <p>nada</p>;',
      '}',
      '',
    ].join('\n'),
  );
  escrever(
    'v2_passa',
    [
      'interface Row { value: number | null }',
      'export function Chart({ rows }: { rows: Row[] }) {',
      '  const previous = rows[rows.length - 2];',
      '  if (previous?.value != null && previous.value > 0) return <p>sim</p>;',
      '  return <p>não</p>;',
      '}',
      '',
    ].join('\n'),
  );
  const tsconfig = path.join(raiz, 'tsconfig.json');
  fs.writeFileSync(tsconfig, JSON.stringify({ extends: path.relative(raiz, path.join(VISUAIS_DIR, 'tsconfig.json')).split(path.sep).join('/'), include: ['**/Chart.tsx', '**/data.ts'], exclude: [] }), 'utf8');
  try {
    const relatorio = await L.lintarVersoes(versoes, { tsconfig, ignores: [] });
    const acusa = relatorio.versoes.find((v) => v.caminho.endsWith('v1_acusa')) ?? { erros: [] };
    const passa = relatorio.versoes.find((v) => v.caminho.endsWith('v2_passa')) ?? { erros: ['sem relatório'] };
    provas.push(prova('lint acusa prefer-optional-chain em `p && p.value !== null`', true, acusa.erros.some((e) => e.includes('@typescript-eslint/prefer-optional-chain'))));
    provas.push(prova('lint acusa no-base-to-string em String(unknown)', true, acusa.erros.some((e) => e.includes('@typescript-eslint/no-base-to-string'))));
    provas.push(prova('lint deixa passar a forma equivalente `p?.value != null`', 0, passa.erros.length));
    provas.push(prova('o relatório do lint conta por regra', true, relatorio.porRegra.some((r) => r.regra === '@typescript-eslint/prefer-optional-chain' && r.n >= 1)));
  } finally {
    fs.rmSync(raiz, { recursive: true, force: true });
  }
  const falhas = provas.filter((p) => !p).length;
  console.log(`       ${provas.length - falhas} de ${provas.length} provas do lint passaram.`);
  return falhas === 0;
}

async function main() {
  const { flags } = parseArgs(process.argv.slice(2));
  if (flags.filho) {
    await child(flags.filho, flags.log);
    return 0;
  }
  const results = [await lockQueueTest(), await staleLockTest(), await guardasTest(), await multialvoTest(), await coberturaPorVersaoTest(), await carimboBibliotecaTest(), await dossieTest(), await lintTest()];
  if (!flags['sem-navegador']) results.push(await carimboNoRenderTest(), await baseHerdadaTest(), await chromeFidelityTest());
  const failed = results.filter((r) => !r).length;
  console.log(`\n[selftest] ${results.length - failed} de ${results.length} provas passaram.`);
  return failed ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(`[selftest] ${error.message}`);
    process.exit(1);
  });
