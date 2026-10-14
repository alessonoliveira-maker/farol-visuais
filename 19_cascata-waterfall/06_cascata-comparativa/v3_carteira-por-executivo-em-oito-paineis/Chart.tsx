import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatCurrencyAxis, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveBridge } from './data';

/** Uma ponte pequena da carteira por executivo, todas na mesma escala, ordenadas pela carteira final. */
export interface ExecutiveGridProps {
  readonly data?: readonly ExecutiveBridge[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas 960 x 520, moldura `card`, caso de uso em uma linha: corpo de 894 x 401,5 (seção 13). Quatro
 * colunas com vão de 12 px dão células de (894 − 36) / 4 = 214,5 px de largura; o viewBox da célula tem
 * essa largura e 172 de altura, então a escala é 1 e os 11 px declarados chegam como 11 px (GEO-18).
 */
const CELL_W = 214.5;
const CELL_H = 172;
const PAD = 4;
const TITLE_Y = 13;
const LANE_Y = 38;
const PLOT_TOP = 46;
const PLOT_BOTTOM = CELL_H - 24;
const FOOT_Y = CELL_H - 8;
const BAR_W = 18;
const CORNER = 3;
const ZERO_MARK = 2;
const MIN_BAR = 2;
const GRID_STEP = 500_000;
const SMALL_SAMPLE = 10;
const CHAR_W = 6.6;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

const TOTAL_FILL = 'var(--chart-1)';
const STEPS = [
  { key: 'entries', label: 'Entradas', sign: 1, fill: 'var(--info)' },
  { key: 'won', label: 'Ganhas', sign: -1, fill: 'var(--positive)' },
  { key: 'lost', label: 'Perdidas', sign: -1, fill: 'var(--negative)' },
  { key: 'archived', label: 'Arquivadas por 30 dias paradas', sign: -1, fill: 'var(--warning)' },
] as const;

/** Início, os quatro passos e o fim: o número de colunas é do desenho, não do dado. */
const COLUMN_COUNT = STEPS.length + 2;

interface Column {
  readonly id: string;
  readonly label: string;
  readonly kind: 'total' | 'step';
  readonly value: number;
  readonly fill: string;
  readonly low: number;
  readonly high: number;
  readonly end: number;
}

interface Panel {
  readonly exec: ExecutiveBridge;
  readonly columns: readonly Column[];
  readonly end: number;
  readonly closed: number;
  readonly small: boolean;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signed(value: number): string {
  if (value === 0) return formatCurrencyAxis(0);
  return `${value > 0 ? '+' : '−'}${formatCurrencyAxis(Math.abs(value))}`;
}

/** Taxa de ganho entre as fechadas; `null` sem nenhuma fechada, nunca 0 (EST-1b). */
function winRate(won: number, lost: number): number | null {
  return won + lost === 0 ? null : won / (won + lost);
}

/** Cada passo nasce onde o anterior terminou; início e fim ancoram no zero. */
function buildPanel(exec: ExecutiveBridge): Panel {
  let running = exec.start;
  const columns: Column[] = [{ id: 'start', label: 'Início', kind: 'total', value: exec.start, fill: TOTAL_FILL, low: 0, high: exec.start, end: exec.start }];
  for (const step of STEPS) {
    const value = step.sign * exec[step.key];
    const next = running + value;
    columns.push({ id: step.key, label: step.label, kind: 'step', value, fill: step.fill, low: Math.min(running, next), high: Math.max(running, next), end: next });
    running = next;
  }
  columns.push({ id: 'end', label: 'Fim', kind: 'total', value: running, fill: TOTAL_FILL, low: 0, high: running, end: running });
  const closed = exec.wonCount + exec.lostCount;
  return { exec, columns, end: running, closed, small: closed < SMALL_SAMPLE };
}

interface CellProps {
  readonly panel: Panel;
  readonly max: number;
}

/** A célula inteira: nome e taxa, grade comum, colunas, conectores, três valores escritos. */
function BridgeCell({ panel, max }: CellProps): ReactElement {
  const { exec, columns } = panel;
  const step = (CELL_W - 2 * PAD) / COLUMN_COUNT;
  // Escala linear valor para pixel, a mesma em todas as células (EIX-9).
  const toY = (value: number): number => PLOT_BOTTOM - (value / max) * (PLOT_BOTTOM - PLOT_TOP);
  const rate = winRate(exec.wonCount, exec.lostCount);
  const steps = columns.filter((column) => column.kind === 'step');
  const biggest = steps.reduce<Column | null>((best, column) => (best === null || Math.abs(column.value) > Math.abs(best.value) ? column : best), null);
  const start = columns[0];
  const end = columns[columns.length - 1];
  const ticks: number[] = [];
  for (let tick = GRID_STEP; tick < max; tick += GRID_STEP) ticks.push(tick);
  return (
    <svg aria-hidden className="h-auto w-full" viewBox={`0 0 ${String(CELL_W)} ${String(CELL_H)}`}>
      <text className="font-sans" fill="var(--text-primary)" fontSize={12} fontWeight={600} x={PAD} y={TITLE_Y}>
        {exec.name}
      </text>
      <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor="end" x={CELL_W - PAD} y={TITLE_Y}>
        {panel.small || rate === null ? `n=${String(panel.closed)}` : formatRateWithVolume(exec.wonCount, panel.closed)}
      </text>
      {panel.small ? (
        <g>
          <text className="font-sans" fill="var(--text-primary)" fontSize={12} fontWeight={600} x={PAD} y={PLOT_TOP + 20}>
            Amostra pequena: n={String(panel.closed)}
          </text>
          {['Só ' + String(panel.closed) + ' oportunidades fechadas', 'no trimestre: a ponte e a taxa de', 'ganho não valem como padrão.'].map((line, index) => (
            <text className="font-sans" fill="var(--text-muted)" fontSize={11} fontWeight={500} key={line} x={PAD} y={PLOT_TOP + 42 + index * 16}>
              {line}
            </text>
          ))}
          <text className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={11} fontWeight={500} x={PAD} y={FOOT_Y}>
            {`Carteira final ${formatCurrencyAxis(panel.end)}`}
          </text>
        </g>
      ) : (
        <g>
          {ticks.map((tick) => (
            <line key={tick} stroke="var(--line-subtle)" strokeWidth={1} x1={PAD} x2={CELL_W - PAD} y1={toY(tick)} y2={toY(tick)} />
          ))}
          <line stroke="var(--line-strong)" strokeWidth={1} x1={PAD} x2={CELL_W - PAD} y1={toY(0)} y2={toY(0)} />
          {columns.map((column, index) => {
            const cx = PAD + step * (index + 0.5);
            const top = toY(column.high);
            const bottom = toY(column.low);
            const isZero = column.kind === 'step' && column.value === 0;
            const next = columns[index + 1];
            return (
              <g key={column.id}>
                {next ? <line stroke="var(--text-muted)" strokeWidth={1} x1={cx + BAR_W / 2} x2={cx + step - BAR_W / 2} y1={toY(column.end)} y2={toY(column.end)} /> : null}
                {isZero ? (
                  <rect fill="var(--text-secondary)" height={ZERO_MARK} width={BAR_W} x={cx - BAR_W / 2} y={top - ZERO_MARK / 2}>
                    <title>{`${column.label}: ${formatCurrencyAxis(0)}, medido`}</title>
                  </rect>
                ) : (
                  <rect fill={column.fill} height={Math.max(bottom - top, MIN_BAR)} rx={CORNER} width={BAR_W} x={cx - BAR_W / 2} y={top}>
                    <title>{`${column.label}: ${column.kind === 'total' ? formatCurrencyAxis(column.value) : signed(column.value)}`}</title>
                  </rect>
                )}
              </g>
            );
          })}
          {biggest ? (
            (() => {
              const text = signed(biggest.value);
              const half = (text.length * CHAR_W) / 2;
              const cx = PAD + step * (columns.indexOf(biggest) + 0.5);
              const labelX = Math.min(Math.max(cx, PAD + half), CELL_W - PAD - half);
              return (
                <g>
                  <line stroke="var(--text-muted)" strokeWidth={1} x1={cx} x2={cx} y1={LANE_Y + 4} y2={toY(biggest.high) - 1} />
                  <text className="font-display" fill={biggest.fill} fontSize={11} fontWeight={600} style={HALO} textAnchor="middle" x={labelX} y={LANE_Y}>
                    {text}
                  </text>
                </g>
              );
            })()
          ) : null}
          {start && end ? (
            <g>
              <text className="font-display" fill="var(--text-primary)" fontSize={11} fontWeight={600} x={PAD} y={FOOT_Y}>
                <tspan className="font-sans" fill="var(--text-muted)" fontWeight={500}>início </tspan>
                {formatCurrencyAxis(start.value)}
              </text>
              <text className="font-display" fill="var(--text-primary)" fontSize={11} fontWeight={600} textAnchor="end" x={CELL_W - PAD} y={FOOT_Y}>
                <tspan className="font-sans" fill="var(--text-muted)" fontWeight={500}>fim </tspan>
                {formatCurrencyAxis(end.value)}
              </text>
            </g>
          ) : null}
        </g>
      )}
    </svg>
  );
}

export default function ExecutiveGrid({ data = defaultData, height, className }: ExecutiveGridProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não há carteira registrada para montar as pontes.</span>
      </div>
    );
  }

  // Ordem pela carteira final, da maior para a menor; empate fica na ordem do dado.
  const panels = data.map(buildPanel).sort((a, b) => b.end - a.end);
  const drawn = panels.filter((panel) => !panel.small);
  // Domínio comum calculado sobre todos os painéis desenhados antes de desenhar o primeiro (EIX-9).
  const peak = Math.max(1, ...drawn.flatMap((panel) => panel.columns.map((column) => column.high)));
  const max = (Math.floor(peak / GRID_STEP) + 1) * GRID_STEP;

  const rated = drawn
    .map((panel) => ({ name: panel.exec.name, rate: winRate(panel.exec.wonCount, panel.exec.lostCount) }))
    .filter((entry): entry is { name: string; rate: number } => entry.rate !== null)
    .sort((a, b) => a.rate - b.rate);
  const low = rated[0];
  const high = rated[rated.length - 1];
  const lead = panels[0];
  const smallNames = panels.filter((panel) => panel.small).map((panel) => panel.exec.name);
  const summary =
    `Gráfico de cascata da carteira de ${String(panels.length)} executivos, na mesma escala e pela carteira final` +
    (lead ? `: ${lead.exec.name} lidera com ${formatCurrencyAxis(lead.end)}` : '') +
    (low && high ? `; taxa de ganho de ${formatPercent(low.rate, 1)} (${low.name}) a ${formatPercent(high.rate, 1)} (${high.name})` : '') +
    (smallNames.length > 0 ? `; ${smallNames.join(' e ')} com amostra pequena` : '') +
    '.';
  const reading = `Escala comum, de ${formatCurrencyAxis(0)} a ${formatCurrencyAxis(max)}, com linhas a cada ${formatCurrencyAxis(GRID_STEP)}; painéis pela carteira final, da maior para a menor`;

  return (
    <div aria-label={summary} className={cn('@container flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
        {reading}
      </p>
      <ul aria-hidden className="mb-2 mt-1 flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-text-secondary">
        <li className="flex items-center gap-1">
          <span className="size-2 rounded-sm" style={{ backgroundColor: TOTAL_FILL }} />
          Início e fim
        </li>
        {STEPS.map((entry) => (
          <li className="flex items-center gap-1" key={entry.key}>
            <span className="size-2 rounded-sm" style={{ backgroundColor: entry.fill }} />
            {entry.label}
          </li>
        ))}
        <li className="text-text-muted">Ao lado do nome, a taxa de ganho</li>
      </ul>
      <div aria-hidden className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 @3xl:grid-cols-4">
        {panels.map((panel) => (
          <div className="min-w-0" key={panel.exec.id}>
            <BridgeCell max={max} panel={panel} />
          </div>
        ))}
      </div>
    </div>
  );
}
