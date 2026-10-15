import { Filter } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Account, type Portfolio } from './data';

/**
 * Unit chart da carteira: um quadrado por conta, agrupado por executivo ou por segmento. A grade de
 * cada grupo é calculada aqui, de baixo para cima e em colunas fixas, e a ordem de preenchimento é a
 * ordem de tabulação. Por executivo, as 120 primeiras contas ficam dentro da moldura tracejada do teto
 * e as que passam dele ficam acima, em `--negative`, com o excedente escrito. Trocar o agrupamento
 * reposiciona o mesmo elemento de cada conta: o layout é medido antes e depois e o deslocamento é
 * animado por transform. A chave de cada conta é o id, então nada embaralha; filtrar contas só
 * remove marcadores, e os demais seguem a mesma ordem de preenchimento.
 */
export interface PortfolioUnitsProps {
  readonly data?: Portfolio;
  /** Chamada ao ativar uma conta com clique, Enter ou Espaço; sem ela o marcador só informa. */
  readonly onSelectAccount?: (accountId: string) => void;
  readonly className?: string;
}

type GroupBy = 'executive' | 'segment';

const CELL = 10;
const GAP = 2;
const PITCH = CELL + GAP;
const COLS = 12;
const STACK_WIDTH = COLS * PITCH - GAP;
const CELL_RADIUS = 1.5;
/** Largura do viewBox igual ao corpo do canvas `largo` (894 px): no cartão o desenho sai em 1:1. */
const VIEW_W = 894;
/** Faixa acima da pilha mais alta, para o excedente escrito. */
const TOP_BAND = 16;
/** Vão entre a base das pilhas e o nome do grupo. */
const NAME_GAP = 6;
const NAME_BAND = 32;
const FRAME_STROKE = 'var(--text-muted)';
const FRAME_DASH = '3 3';
const FRAME_PAD = 2;
const EXCESS_COLOR = 'var(--negative)';
const FLIP_MS = 480;
const GROUP_LABELS: Readonly<Record<GroupBy, string>> = { executive: 'executivo', segment: 'segmento' };

interface Point {
  readonly x: number;
  readonly y: number;
}

interface GroupLayout {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly left: number;
  readonly top: number;
  readonly excess: number;
}

interface Layout {
  readonly positions: ReadonlyMap<string, Point>;
  readonly excess: ReadonlySet<string>;
  /** Ids na ordem de preenchimento, grupo a grupo: a ordem do DOM e da tabulação. */
  readonly order: readonly string[];
  readonly groups: readonly GroupLayout[];
}

/** Posição na ordem de preenchimento: coluna a coluna dentro da linha, e a linha 0 é a da base. */
function cellOf(index: number): { readonly column: number; readonly row: number } {
  return { column: index % COLS, row: Math.floor(index / COLS) };
}

function rowsFor(count: number): number {
  return Math.ceil(count / COLS);
}

/** Maior carteira, ou `null` sem executivo; empate fica com o primeiro (EST-1b). */
function largestOf<T extends { readonly count: number }>(items: readonly T[]): T | null {
  let best: T | null = null;
  for (const item of items) {
    if (best === null || item.count > best.count) best = item;
  }
  return best;
}

interface Bucket {
  readonly id: string;
  readonly label: string;
  readonly accounts: readonly Account[];
}

function bucketsFor(portfolio: Portfolio, mode: GroupBy): Bucket[] {
  const segmentIndex = new Map(portfolio.segments.map((segment, index) => [segment.id, index]));
  const bySegment = (a: Account, b: Account) => (segmentIndex.get(a.segmentId) ?? 0) - (segmentIndex.get(b.segmentId) ?? 0) || a.id.localeCompare(b.id);
  if (mode === 'executive') {
    return portfolio.executives.map((executive) => ({
      id: executive.id,
      label: executive.name,
      // Dentro da carteira a ordem é por segmento: cada segmento forma um bloco contíguo.
      accounts: portfolio.accounts.filter((account) => account.executiveId === executive.id).sort(bySegment),
    }));
  }
  return portfolio.segments.map((segment) => ({
    id: segment.id,
    label: segment.label,
    accounts: portfolio.accounts.filter((account) => account.segmentId === segment.id).sort((a, b) => a.id.localeCompare(b.id)),
  }));
}

/** Alturas máximas nos dois agrupamentos, para o viewBox não mudar ao trocar de um para o outro. */
function maxRowsOf(portfolio: Portfolio): number {
  const counts = (['executive', 'segment'] as const).flatMap((mode) => bucketsFor(portfolio, mode).map((bucket) => bucket.accounts.length));
  // O teto entra na altura: com pilhas baixas a moldura não pode nascer acima do topo do viewBox.
  return Math.max(rowsFor(counts.reduce((max, count) => Math.max(max, count), 0)), rowsFor(portfolio.ceiling));
}

function buildLayout(portfolio: Portfolio, mode: GroupBy, maxRows: number): Layout {
  const buckets = bucketsFor(portfolio, mode);
  const slotWidth = VIEW_W / Math.max(buckets.length, 1);
  const bottom = TOP_BAND + maxRows * PITCH - GAP;
  const positions = new Map<string, Point>();
  const excess = new Set<string>();
  const order: string[] = [];
  const groups: GroupLayout[] = buckets.map((bucket, bucketIndex) => {
    // O recuo de FRAME_PAD deixa a moldura do primeiro grupo inteira dentro do corpo.
    const left = bucketIndex * slotWidth + FRAME_PAD + 1;
    bucket.accounts.forEach((account, index) => {
      const { column, row } = cellOf(index);
      order.push(account.id);
      positions.set(account.id, { x: left + column * PITCH, y: bottom - CELL - row * PITCH });
      if (mode === 'executive' && index >= portfolio.ceiling) excess.add(account.id);
    });
    const over = mode === 'executive' ? Math.max(bucket.accounts.length - portfolio.ceiling, 0) : 0;
    return {
      id: bucket.id,
      label: bucket.label,
      count: bucket.accounts.length,
      left,
      top: bottom - rowsFor(bucket.accounts.length) * PITCH + GAP,
      excess: over,
    };
  });
  return { positions, excess, order, groups };
}

export default function PortfolioUnits({ data = defaultData, onSelectAccount, className }: PortfolioUnitsProps) {
  const [mode, setMode] = useState<GroupBy>('executive');
  const nodes = useRef(new Map<string, SVGGElement>());
  const previous = useRef<ReadonlyMap<string, Point> | null>(null);
  const maxRows = useMemo(() => maxRowsOf(data), [data]);
  const layout = useMemo(() => buildLayout(data, mode, maxRows), [data, mode, maxRows]);

  // FLIP: a posição anterior ficou guardada, a nova acaba de ser medida; cada elemento volta do antigo ao novo.
  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = layout.positions;
    if (before === null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    layout.positions.forEach((to, id) => {
      const from = before.get(id);
      const node = nodes.current.get(id);
      if (from === undefined || node === undefined || typeof node.animate !== 'function') return;
      if (from.x === to.x && from.y === to.y) return;
      node.animate(
        [{ transform: `translate(${String(from.x)}px, ${String(from.y)}px)` }, { transform: `translate(${String(to.x)}px, ${String(to.y)}px)` }],
        { duration: FLIP_MS, easing: 'ease-in-out' },
      );
    });
  }, [layout]);

  if (data.accounts.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma conta neste recorte: não há carteira para desenhar.</span>
      </div>
    );
  }

  const viewH = TOP_BAND + maxRows * PITCH - GAP + NAME_GAP + NAME_BAND;
  const bottom = TOP_BAND + maxRows * PITCH - GAP;
  // A moldura fecha exatamente `ceiling` células: linhas inteiras e, se sobra resto, um degrau na linha de cima.
  const fullRows = Math.floor(data.ceiling / COLS);
  const rest = data.ceiling % COLS;
  const framePath = (left: number): string => {
    const x0 = left - FRAME_PAD;
    const x1 = left + STACK_WIDTH + FRAME_PAD;
    const yBottom = bottom + FRAME_PAD;
    const yFull = bottom - fullRows * PITCH + GAP - FRAME_PAD;
    if (rest === 0) return `M${String(x0)} ${String(yBottom)}H${String(x1)}V${String(yFull)}H${String(x0)}Z`;
    const xStep = left + rest * PITCH - GAP / 2;
    const yStep = bottom - fullRows * PITCH + GAP / 2;
    const yTop = yFull - PITCH;
    return `M${String(x0)} ${String(yBottom)}H${String(x1)}V${String(yStep)}H${String(xStep)}V${String(yTop)}H${String(x0)}Z`;
  };
  const accountById = new Map(data.accounts.map((account) => [account.id, account]));
  const segmentById = new Map(data.segments.map((segment) => [segment.id, segment]));
  const executiveById = new Map(data.executives.map((executive) => [executive.id, executive]));
  const byExecutive = bucketsFor(data, 'executive').map((bucket) => ({ ...bucket, count: bucket.accounts.length }));
  const overCeiling = byExecutive.filter((bucket) => bucket.count > data.ceiling);
  const extra = overCeiling.reduce((sum, bucket) => sum + bucket.count - data.ceiling, 0);
  const biggest = largestOf(byExecutive);
  const pct = (value: number, whole: number) => `${String((value / whole) * 100)}%`;

  const summary = `Gráfico de unidades com ${formatInt(data.accounts.length)} contas de ${formatInt(data.executives.length)} executivos, um quadrado por conta, agrupadas por ${GROUP_LABELS[mode]}. ${formatInt(overCeiling.length)} executivos passam do teto de ${formatInt(data.ceiling)}, com ${formatInt(extra)} contas a mais.${biggest ? ` Maior carteira: ${biggest.label}, com ${formatInt(biggest.count)}.` : ''}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="group">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-1" role="group" aria-label="Agrupar contas por">
          {(['executive', 'segment'] as const).map((option) => (
            <button
              aria-pressed={mode === option}
              className={cn(
                'rounded-md border border-line-subtle px-2 py-1 text-xs leading-4 text-text-secondary outline-none focus-visible:border-text-primary',
                mode === option && 'bg-surface-sunken font-semibold text-text-primary',
              )}
              key={option}
              onClick={() => {
                setMode(option);
              }}
              type="button"
            >
              Por {GROUP_LABELS[option]}
            </button>
          ))}
        </div>
        <ul aria-hidden className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-[0.6875rem] leading-4 text-text-secondary">
          {data.segments.map((segment) => (
            <li className="flex items-center gap-1.5" key={segment.id}>
              <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: CHART_SERIES_COLORS[segment.slot - 1] }} />
              {segment.label}
            </li>
          ))}
          {mode === 'executive' ? (
            <>
              <li className="flex items-center gap-1.5">
                <span className="size-2.5 shrink-0 rounded-[2px] border border-dashed border-text-muted" />
                <span className="kpi-number">teto de {formatInt(data.ceiling)} contas</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: EXCESS_COLOR }} />
                acima do teto
              </li>
            </>
          ) : null}
        </ul>
      </div>

      <div className="relative w-full" style={{ aspectRatio: `${String(VIEW_W)} / ${String(viewH)}` }}>
        <svg className="block h-auto w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(viewH)}`}>
          {mode === 'executive'
            ? layout.groups.map((group) => (
                <path
                  aria-hidden
                  d={framePath(group.left)}
                  fill="none"
                  key={`frame-${group.id}`}
                  stroke={FRAME_STROKE}
                  strokeDasharray={FRAME_DASH}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))
            : null}
          {layout.order.map((id) => accountById.get(id)).map((account) => {
            if (account === undefined) return null;
            const point = layout.positions.get(account.id);
            const segment = segmentById.get(account.segmentId);
            if (point === undefined) return null;
            const isExcess = layout.excess.has(account.id);
            const owner = executiveById.get(account.executiveId)?.name ?? '';
            const label = `Conta ${account.id}, segmento ${segment?.label ?? ''}, carteira de ${owner}${isExcess ? ', acima do teto' : ''}`;
            const activate = () => {
              onSelectAccount?.(account.id);
            };
            return (
              <g
                aria-label={label}
                className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-text-primary [&:focus-visible>rect]:stroke-[2]"
                key={account.id}
                onClick={activate}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activate();
                  }
                }}
                ref={(node) => {
                  if (node) nodes.current.set(account.id, node);
                  else nodes.current.delete(account.id);
                }}
                role="button"
                tabIndex={0}
                transform={`translate(${String(point.x)} ${String(point.y)})`}
              >
                <rect
                  fill={isExcess ? EXCESS_COLOR : (CHART_SERIES_COLORS[(segment?.slot ?? 1) - 1] ?? 'var(--chart-1)')}
                  height={CELL}
                  rx={CELL_RADIUS}
                  width={CELL}
                >
                  <title>{label}</title>
                </rect>
              </g>
            );
          })}
        </svg>
        {layout.groups.map((group) => (
          <div
            aria-hidden
            className="absolute min-w-0 text-xs leading-4"
            key={`name-${mode}-${group.id}`}
            style={{ left: pct(group.left, VIEW_W), top: pct(bottom + NAME_GAP, viewH), width: pct(STACK_WIDTH + GAP * 2, VIEW_W) }}
          >
            <p className="font-semibold text-text-secondary">{group.label}</p>
            <p className="kpi-number text-[0.6875rem] text-text-muted">{formatInt(group.count)} contas</p>
          </div>
        ))}
        {layout.groups
          .filter((group) => group.excess > 0)
          .map((group) => (
            <p
              aria-hidden
              className="kpi-number absolute whitespace-nowrap text-[0.6875rem] leading-4 font-semibold text-negative"
              key={`excess-${group.id}`}
              style={{ left: pct(group.left, VIEW_W), top: pct(group.top - TOP_BAND, viewH) }}
            >
              +{formatInt(group.excess)} acima do teto
            </p>
          ))}
      </div>
    </div>
  );
}
