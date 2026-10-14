/**
 * Pagina de render do catalogo VISUAIS.
 *
 * Monta UMA versao por vez, escolhida por `?i=<indice>&theme=dark|light`, dentro da moldura da
 * ferramenta. A moldura e daqui, nunca do `Chart.tsx`: o componente que vai para o Farol recebe
 * so o espaco do corpo, do mesmo jeito que recebe o corpo de um `VisualCard`.
 *
 * O Chart e montado sem props: e isso que o contrato promete (default vindo do `data.ts`).
 */
import { Component, type ComponentType, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import { serializeRoot, type SerializeResult } from './serialize';

export interface RenderMeta {
  readonly title: string;
  readonly useCase: string;
  readonly frame: 'card' | 'stage';
  readonly width: number;
  readonly height: number;
}

export interface RenderEntry {
  readonly rel: string;
  readonly Chart: ComponentType;
  readonly meta: RenderMeta;
}

interface FarolBridge {
  ready: boolean;
  error: string | null;
  rel: string | null;
  waitStable: () => Promise<{ stable: boolean; ms: number }>;
  serialize: () => SerializeResult;
  layoutWarnings: () => string[];
}

declare global {
  interface Window {
    __farol: FarolBridge;
  }
}

class Boundary extends Component<{ children: ReactNode }, { message: string | null }> {
  override state = { message: null as string | null };

  static getDerivedStateFromError(error: unknown) {
    return { message: error instanceof Error ? `${error.name}: ${error.message}` : String(error) };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    const stack = info.componentStack ?? '';
    window.__farol.error = `${error instanceof Error ? error.message : String(error)}\n${stack}`;
  }

  override render() {
    if (this.state.message) {
      return <pre className="p-4 text-xs whitespace-pre-wrap text-negative">{this.state.message}</pre>;
    }
    return this.props.children;
  }
}

/** A moldura da ferramenta: cartao no padrao do `VisualCard` do Farol, ou palco para o que ja e cartao. */
function Frame({ meta, children }: { meta: RenderMeta; children: ReactNode }) {
  const roomy = meta.width >= 560;
  const size = { width: meta.width, height: meta.height };

  if (meta.frame === 'stage') {
    return (
      <div
        className={`box-border flex flex-col overflow-hidden bg-surface-canvas font-sans text-text-primary ${roomy ? 'p-5' : 'p-4'}`}
        data-farol-root=""
        style={size}
      >
        <header className="mb-3 min-w-0 shrink-0">
          <h2 className="truncate font-display text-sm leading-tight font-semibold text-text-primary">
            {meta.title}
          </h2>
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-text-muted">{meta.useCase}</p>
        </header>
        <div className="relative min-h-0 min-w-0 flex-1" data-farol-body="">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="box-border flex flex-col overflow-hidden bg-surface-canvas p-3 font-sans text-text-primary"
      data-farol-root=""
      style={size}
    >
      <section
        className={`flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-line-subtle bg-surface-raised ${roomy ? 'p-5' : 'p-4'}`}
      >
        <header className="mb-3 min-w-0 shrink-0">
          <h2
            className={`truncate font-display leading-tight font-semibold text-text-primary ${roomy ? 'text-base' : 'text-sm'}`}
          >
            {meta.title}
          </h2>
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-text-muted">{meta.useCase}</p>
        </header>
        <div className="relative min-h-0 min-w-0 flex-1" data-farol-body="">
          {children}
        </div>
      </section>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function frameRoot(): HTMLElement {
  const root = document.querySelector<HTMLElement>('[data-farol-root]');
  if (!root) throw new Error('moldura nao montada');
  return root;
}

/** Espera o DOM parar de mudar: ResponsiveContainer mede no segundo quadro, fontes chegam depois. */
async function waitStable(): Promise<{ stable: boolean; ms: number }> {
  const started = performance.now();
  await document.fonts.ready;
  let last = '';
  let same = 0;
  while (performance.now() - started < 8000) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const root = document.querySelector('[data-farol-root]');
    const signature = root ? `${root.outerHTML.length}:${root.outerHTML}` : '';
    if (signature === last && signature !== '') {
      same += 1;
      if (same >= 4) return { stable: true, ms: Math.round(performance.now() - started) };
    } else {
      same = 0;
      last = signature;
    }
    await sleep(90);
  }
  return { stable: false, ms: Math.round(performance.now() - started) };
}

/** Avisos de layout que o produtor precisa ver: altura zero e conteudo fora do canvas. */
function layoutWarnings(): string[] {
  const warnings: string[] = [];
  const root = frameRoot();
  const body = root.querySelector<HTMLElement>('[data-farol-body]');
  if (!body) return warnings;
  const bodyRect = body.getBoundingClientRect();
  const first = body.firstElementChild;
  if (!first) {
    warnings.push('O Chart nao renderizou nenhum elemento.');
    return warnings;
  }
  const firstRect = first.getBoundingClientRect();
  if (firstRect.height < 1 || firstRect.width < 1) {
    warnings.push(
      'O elemento raiz do Chart saiu com largura ou altura zero: a raiz precisa de h-full w-full (ver CONTRATO, secao Tamanho).',
    );
  }
  const tolerance = 1.5;
  let reported = 0;
  for (const el of Array.from(body.querySelectorAll('*'))) {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility !== 'visible') continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    const out =
      rect.left < bodyRect.left - tolerance ||
      rect.top < bodyRect.top - tolerance ||
      rect.right > bodyRect.right + tolerance ||
      rect.bottom > bodyRect.bottom + tolerance;
    if (out && reported < 3) {
      const name = `${el.tagName.toLowerCase()}${el.getAttribute('class') ? `.${String(el.getAttribute('class')).split(/\s+/).slice(0, 3).join('.')}` : ''}`;
      warnings.push(
        `Conteudo passa da area do corpo (${name}: ${Math.round(rect.width)}x${Math.round(rect.height)} em ${Math.round(rect.left - bodyRect.left)},${Math.round(rect.top - bodyRect.top)}; corpo ${Math.round(bodyRect.width)}x${Math.round(bodyRect.height)}). Aumente o canvas ou compacte o visual.`,
      );
      reported += 1;
    }
  }
  return warnings;
}

export function mount(entries: readonly RenderEntry[]) {
  const params = new URLSearchParams(window.location.search);
  const index = Number(params.get('i') ?? '0');
  const theme = params.get('theme') === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;

  window.__farol = {
    ready: false,
    error: null,
    rel: null,
    waitStable,
    serialize: () => serializeRoot(frameRoot()),
    layoutWarnings,
  };

  const entry = entries[index];
  const container = document.getElementById('root');
  if (!entry || !container) {
    window.__farol.error = `versao de indice ${String(index)} inexistente no pacote`;
    window.__farol.ready = true;
    return;
  }
  window.__farol.rel = entry.rel;
  const { Chart } = entry;

  createRoot(container).render(
    <Frame meta={entry.meta}>
      <Boundary>
        <Chart />
      </Boundary>
    </Frame>,
  );
  requestAnimationFrame(() => {
    window.__farol.ready = true;
  });
}
