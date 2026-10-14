/**
 * npm run galeria
 *
 * Gera `VISUAIS/galeria.html`: família, modelo e versões, com o preview por `<img>` relativo,
 * título, caso de uso, o que demonstra, canvas, estado do preview e links para os arquivos.
 *
 * A página é autocontida: as cores são os tokens lidos do `app/src/styles/tokens.css` na hora da
 * geração (então a galeria acompanha o Farol a cada `npm run galeria`), e as fontes Manrope e
 * Space Grotesk entram recortadas nos caracteres que a página usa, como no preview.
 * Não abre navegador nem compilador, então não passa pela trava.
 */
import fs from 'node:fs';
import path from 'node:path';

import { readReadmeSummary } from './lib/contract.mjs';
import { buildFontFaces } from './lib/fonts.mjs';
import { readMeta, readPreviewStamps, sourceHash, tokensHash } from './lib/meta.mjs';
import { APP_SRC, EXAMPLES_DIR, VISUAIS_DIR, findVersions, splitVersion, toPosix, writeFileAtomic } from './lib/paths.mjs';

const OUTPUT = path.join(VISUAIS_DIR, 'galeria.html');

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Markdown de uma linha para texto: tira ênfase, código e link, mantém o texto. */
function plain(markdown) {
  return String(markdown ?? '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/^\s*[-+]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstParagraph(markdown) {
  return plain(String(markdown ?? '').split(/\r?\n\r?\n/).map((p) => p.trim()).find(Boolean) ?? '');
}

function href(abs) {
  return toPosix(path.relative(VISUAIS_DIR, abs)).split('/').map(encodeURIComponent).join('/');
}

function titleFromSlug(slug) {
  const words = slug.replace(/^(\d{2}|v\d+)_/, '').replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function previewState(versionAbs) {
  const stamps = readPreviewStamps(path.join(versionAbs, 'preview.svg'));
  if (!stamps) return { key: 'ausente', label: 'sem preview' };
  if (stamps.source !== sourceHash(versionAbs)) return { key: 'velho', label: 'preview desatualizado' };
  if (stamps.tokens !== tokensHash()) return { key: 'tokens', label: 'tokens mudaram' };
  return { key: 'ok', label: 'preview em dia' };
}

function collect(versions) {
  const families = new Map();
  for (const version of versions) {
    const { family, model } = splitVersion(version.rel);
    const modelAbs = path.dirname(version.abs);
    const familyAbs = path.dirname(modelAbs);
    if (!families.has(familyAbs)) {
      const readme = readReadmeSummary(path.join(familyAbs, 'README.md'));
      families.set(familyAbs, {
        abs: familyAbs,
        slug: family,
        title: readme.title ?? titleFromSlug(family),
        intro: firstParagraph(readme.intro),
        models: new Map(),
      });
    }
    const familyEntry = families.get(familyAbs);
    if (!familyEntry.models.has(modelAbs)) {
      const readme = readReadmeSummary(path.join(modelAbs, 'README.md'));
      familyEntry.models.set(modelAbs, {
        abs: modelAbs,
        slug: model,
        title: readme.title ?? titleFromSlug(model),
        what: firstParagraph(readme.sections['o que e'] ?? readme.intro),
        when: firstParagraph(readme.sections['quando usar']),
        avoid: firstParagraph(readme.sections['quando evitar']),
        hasReadme: fs.existsSync(path.join(modelAbs, 'README.md')),
        versions: [],
      });
    }
    const { draft, errors } = readMeta(version.abs);
    familyEntry.models.get(modelAbs).versions.push({
      ...version,
      slug: path.basename(version.abs),
      meta: draft ?? { title: titleFromSlug(path.basename(version.abs)), useCase: '', demonstrates: [], canvas: null },
      metaErrors: errors,
      state: previewState(version.abs),
      hasLight: fs.existsSync(path.join(version.abs, 'preview-claro.svg')),
    });
  }
  return [...families.values()].map((f) => ({ ...f, models: [...f.models.values()] }));
}

function versionCard(version) {
  const { meta } = version;
  const canvas = meta.canvas;
  const size = canvas ? `${canvas.width} x ${canvas.height}${canvas.preset ? ` (${canvas.preset})` : ''}` : 'canvas inválido';
  const img = fs.existsSync(path.join(version.abs, 'preview.svg'))
    ? `<img src="${href(path.join(version.abs, 'preview.svg'))}"${version.hasLight ? ` data-claro="${href(path.join(version.abs, 'preview-claro.svg'))}" data-escuro="${href(path.join(version.abs, 'preview.svg'))}"` : ''} width="${canvas?.width ?? 640}" height="${canvas?.height ?? 360}" loading="lazy" alt="${escapeHtml(`${meta.title}. ${meta.useCase}`)}">`
    : '<div class="vazio">Sem preview. Rode <code>npm run render</code> nesta versão.</div>';
  const demonstrates = (meta.demonstrates ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const files = ['Chart.tsx', 'data.ts', 'meta.json']
    .filter((name) => fs.existsSync(path.join(version.abs, name)))
    .map((name) => `<a href="${href(path.join(version.abs, name))}">${name}</a>`)
    .join('');
  const search = [meta.title, meta.useCase, ...(meta.demonstrates ?? []), version.rel].join(' ').toLowerCase();
  return `<article class="versao" id="${escapeHtml(version.rel)}" data-busca="${escapeHtml(search)}">
  <div class="quadro">${img}</div>
  <div class="texto">
    <p class="rotulo"><span class="slug">${escapeHtml(version.slug)}</span><span class="estado estado-${version.state.key}">${escapeHtml(version.state.label)}</span></p>
    <h4>${escapeHtml(meta.title)}</h4>
    <p class="caso">${escapeHtml(meta.useCase)}</p>
    ${demonstrates ? `<ul class="demonstra">${demonstrates}</ul>` : ''}
    <p class="rodape"><span>${escapeHtml(size)}</span>${files}</p>
    ${version.metaErrors.length ? `<p class="erro">meta.json com ${version.metaErrors.length} problema(s): rode npm run check.</p>` : ''}
  </div>
</article>`;
}

function modelSection(model) {
  const readmeLink = model.hasReadme ? `<a href="${href(path.join(model.abs, 'README.md'))}">README</a>` : '<span class="erro">sem README</span>';
  const facts = [
    model.what ? `<p>${escapeHtml(model.what)}</p>` : '',
    model.when ? `<p><strong>Quando usar.</strong> ${escapeHtml(model.when)}</p>` : '',
    model.avoid ? `<p><strong>Quando evitar.</strong> ${escapeHtml(model.avoid)}</p>` : '',
  ].join('');
  return `<section class="modelo" id="${escapeHtml(toPosix(path.relative(VISUAIS_DIR, model.abs)))}">
  <header><h3>${escapeHtml(model.title)}</h3><p class="meta-modelo"><span class="slug">${escapeHtml(model.slug)}</span>${readmeLink}<span>${model.versions.length} versão(ões)</span></p>${facts}</header>
  ${model.versions.map(versionCard).join('\n')}
</section>`;
}

function familySection(family, groupId) {
  return `<section class="familia" id="${escapeHtml(`${groupId}:${family.slug}`)}">
  <header><p class="slug">${escapeHtml(family.slug)}</p><h2>${escapeHtml(family.title)}</h2>${family.intro ? `<p class="intro">${escapeHtml(family.intro)}</p>` : ''}</header>
  ${family.models.map(modelSection).join('\n')}
</section>`;
}

function nav(groups) {
  return groups
    .filter((group) => group.families.length)
    .map(
      (group) => `<p class="grupo">${escapeHtml(group.title)}</p><ul>${group.families
        .map(
          (family) => `<li><a href="#${escapeHtml(`${group.id}:${family.slug}`)}">${escapeHtml(family.title)}</a><ul>${family.models
            .map((model) => `<li><a href="#${escapeHtml(toPosix(path.relative(VISUAIS_DIR, model.abs)))}">${escapeHtml(model.title)}</a></li>`)
            .join('')}</ul></li>`,
        )
        .join('')}</ul>`,
    )
    .join('');
}

function tokensCss() {
  return fs.readFileSync(path.join(APP_SRC, 'styles', 'tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
}

const PAGE_CSS = `
*{box-sizing:border-box}
html{background:var(--surface-canvas);color:var(--text-primary);scroll-behavior:smooth}
body{margin:0;font-family:'Manrope',ui-sans-serif,system-ui,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:'Space Grotesk','Manrope',ui-sans-serif,sans-serif;font-weight:600;line-height:1.2;margin:0}
a{color:var(--accent-cyan);text-decoration:none}a:hover{text-decoration:underline}
code{font-family:ui-monospace,'Cascadia Mono',monospace;font-size:.85em;background:var(--surface-overlay);padding:.1em .35em;border-radius:4px}
:focus-visible{outline:2px solid var(--ring);outline-offset:2px}
.topo{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:space-between;padding:14px 24px;background:var(--surface-sunken);border-bottom:1px solid var(--line-subtle)}
.topo h1{font-size:18px}.topo .sub{color:var(--text-muted);font-size:13px;margin:2px 0 0}
.acoes{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
input[type=search]{font:inherit;font-size:14px;color:var(--text-primary);background:var(--surface-raised);border:1px solid var(--control-border);border-radius:8px;padding:7px 12px;width:min(320px,70vw)}
button{font:inherit;font-size:13px;font-weight:600;color:var(--text-primary);background:var(--surface-overlay);border:1px solid var(--control-border);border-radius:8px;padding:7px 12px;cursor:pointer}
.corpo{display:grid;grid-template-columns:260px minmax(0,1fr);gap:0;min-height:calc(100vh - 64px)}
nav{position:sticky;top:64px;align-self:start;max-height:calc(100vh - 64px);overflow:auto;padding:20px 16px 40px 24px;border-right:1px solid var(--line-subtle);font-size:13px}
nav ul{list-style:none;margin:0;padding:0}nav li{margin:2px 0}nav ul ul{padding-left:12px;margin:2px 0 10px;border-left:1px solid var(--line-subtle)}
nav a{color:var(--text-secondary);display:block;padding:2px 6px;border-radius:5px}nav a:hover{background:var(--surface-overlay);color:var(--text-primary);text-decoration:none}
nav .grupo{margin:16px 0 6px;color:var(--text-muted);font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
main{padding:24px 32px 80px;min-width:0}
.familia{margin:0 0 56px}.familia>header{margin:0 0 20px;padding:0 0 16px;border-bottom:1px solid var(--line-subtle)}
.familia h2{font-size:26px}.intro{color:var(--text-secondary);max-width:80ch;margin:8px 0 0}
.slug{font-family:ui-monospace,'Cascadia Mono',monospace;font-size:12px;color:var(--text-muted)}
.modelo{margin:0 0 36px}.modelo>header{margin:0 0 14px}.modelo h3{font-size:19px}
.modelo>header p{color:var(--text-secondary);max-width:90ch;margin:6px 0 0;font-size:14px}
.meta-modelo{display:flex;gap:14px;flex-wrap:wrap;align-items:baseline}
.versao{display:grid;grid-template-columns:minmax(0,auto) minmax(260px,1fr);gap:20px;align-items:start;padding:16px;margin:0 0 16px;background:var(--surface-raised);border:1px solid var(--line-subtle);border-radius:12px}
.quadro{min-width:0;max-width:100%}.quadro img{display:block;max-width:100%;height:auto;border-radius:10px}
.vazio{padding:40px 20px;border:1px dashed var(--line-strong);border-radius:10px;color:var(--text-muted);font-size:13px;text-align:center}
.texto{min-width:0}.texto h4{font-size:16px;margin:6px 0 4px}
.rotulo{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:0}
.estado{font-size:11px;font-weight:700;border-radius:999px;padding:1px 8px;border:1px solid currentColor}
.estado-ok{color:var(--positive)}.estado-tokens{color:var(--warning)}.estado-velho,.estado-ausente{color:var(--negative)}
.caso{color:var(--text-secondary);margin:0 0 10px;font-size:14px}
.demonstra{margin:0 0 12px;padding-left:18px;color:var(--text-secondary);font-size:13px}.demonstra li{margin:2px 0}
.rodape{display:flex;gap:12px;flex-wrap:wrap;align-items:baseline;margin:0;font-size:13px}.rodape span{color:var(--text-muted)}
.erro{color:var(--negative);font-size:13px}
.oculto{display:none!important}
.nada{color:var(--text-muted);padding:24px 0}
@media (max-width:1100px){.versao{grid-template-columns:minmax(0,1fr)}}
@media (max-width:820px){.corpo{grid-template-columns:minmax(0,1fr)}nav{position:static;max-height:none;border-right:0;border-bottom:1px solid var(--line-subtle)}main{padding:20px 16px 60px}.topo{position:static}}
`;

const PAGE_JS = `
(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('tema');
  const apply = (theme) => {
    root.dataset.theme = theme;
    toggle.textContent = theme === 'dark' ? 'Tema claro' : 'Tema escuro';
    for (const img of document.querySelectorAll('img[data-claro]')) img.src = theme === 'light' ? img.dataset.claro : img.dataset.escuro;
    try { localStorage.setItem('galeria-tema', theme); } catch {}
  };
  let saved = 'dark';
  try { saved = localStorage.getItem('galeria-tema') || 'dark'; } catch {}
  apply(saved);
  toggle.addEventListener('click', () => apply(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  const search = document.getElementById('busca');
  const empty = document.getElementById('nada');
  search.addEventListener('input', () => {
    const terms = search.value.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').split(/\\s+/).filter(Boolean);
    let shown = 0;
    for (const card of document.querySelectorAll('.versao')) {
      const text = card.dataset.busca.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
      const hit = terms.every((t) => text.includes(t));
      card.classList.toggle('oculto', !hit);
      if (hit) shown += 1;
    }
    for (const model of document.querySelectorAll('.modelo')) model.classList.toggle('oculto', !model.querySelector('.versao:not(.oculto)'));
    for (const family of document.querySelectorAll('.familia')) family.classList.toggle('oculto', !family.querySelector('.modelo:not(.oculto)'));
    empty.classList.toggle('oculto', shown > 0);
  });
})();
`;

function textUsage(html) {
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  const extra = 'Tema claro escuro Buscar por título, caso de uso ou caminho ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const chars = [...new Set([...visible, ...extra])].filter((c) => !/\s/.test(c)).join('');
  return {
    'Manrope|400|normal': chars,
    'Manrope|600|normal': chars,
    'Manrope|700|normal': chars,
    'Space Grotesk|600|normal': chars,
  };
}

async function main() {
  const catalog = collect(findVersions(VISUAIS_DIR));
  const examples = fs.existsSync(EXAMPLES_DIR) ? collect(findVersions(EXAMPLES_DIR)) : [];
  const groups = [
    { id: 'catalogo', title: 'Catálogo', families: catalog },
    { id: 'moldes', title: 'Moldes da ferramenta (_render/exemplos)', families: examples },
  ];
  const count = (families) => ({
    families: families.length,
    models: families.reduce((sum, f) => sum + f.models.length, 0),
    versions: families.reduce((sum, f) => sum + f.models.reduce((s, m) => s + m.versions.length, 0), 0),
  });
  const totals = count(catalog);
  const today = new Date().toISOString().slice(0, 10);
  const mainHtml = groups
    .map((group) =>
      group.families.length
        ? `<div class="grupo-bloco">${group.id === 'moldes' ? '<h2 style="font-size:14px;color:var(--text-muted);margin:0 0 18px;text-transform:uppercase;letter-spacing:.06em">Moldes da ferramenta</h2>' : ''}${group.families.map((family) => familySection(family, group.id)).join('\n')}</div>`
        : group.id === 'catalogo'
          ? '<p class="nada">O catálogo ainda não tem versões. Os moldes abaixo mostram o formato.</p>'
          : '',
    )
    .join('\n');

  const skeleton = (fontCss) => `<!doctype html>
<html lang="pt-BR" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Galeria VISUAIS do Farol</title>
<style>${fontCss}</style>
<style>${tokensCss()}</style>
<style>${PAGE_CSS}</style>
</head>
<body>
<header class="topo">
  <div><h1>Galeria VISUAIS do Farol</h1><p class="sub">${totals.families} família(s), ${totals.models} modelo(s), ${totals.versions} versão(ões) no catálogo. Gerada em ${today} por npm run galeria.</p></div>
  <div class="acoes"><input id="busca" type="search" placeholder="Buscar por título, caso de uso ou caminho" aria-label="Buscar versões"><button id="tema" type="button">Tema claro</button></div>
</header>
<div class="corpo">
<nav aria-label="Famílias e modelos">${nav(groups)}</nav>
<main>
<p id="nada" class="nada oculto">Nenhuma versão com esses termos.</p>
${mainHtml}
</main>
</div>
<script>${PAGE_JS}</script>
</body>
</html>
`;
  const draft = skeleton('');
  const fonts = await buildFontFaces(textUsage(draft));
  const html = skeleton(fonts.css);
  writeFileAtomic(OUTPUT, html);
  const kb = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(Buffer.byteLength(html) / 1024);
  const ex = count(examples);
  console.log(`[galeria] ${toPosix(path.relative(VISUAIS_DIR, OUTPUT))}: ${totals.versions} versão(ões) do catálogo e ${ex.versions} molde(s); ${kb} KB.`);
}

main().catch((error) => {
  console.error(`[galeria] ${error.message}`);
  process.exit(1);
});
