import { Unplug } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatCurrency, formatCurrencyAxis, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periods as defaultPeriods, type ExecutivePortfolio, type PortfolioItem, type PortfolioPeriods } from './data';

/** Tabela de cascatas micro: uma ponte de quatro passos por executivo, todas na mesma escala. */
export interface PortfolioMicroBridgesProps {
  readonly data?: readonly ExecutivePortfolio[];
  readonly periods?: PortfolioPeriods;
  readonly height?: number;
  readonly className?: string;
}

/** Caixa de desenho fixa; o SVG escala só na horizontal (`preserveAspectRatio="none"`), sem texto dentro. */
const CELL_WIDTH = 270;
const CELL_HEIGHT = 30;
const CELL_PAD = 2;
const COLUMNS = 5;
const BAR_WIDTH = 22;
/** Piso de um passo medido e diferente de zero: some menos que o traço do zero, que é cinza e de 2 px. */
const STEP_MIN = 2;
const ZERO_MARK = 2;
const ROW_GRID = 'grid grid-cols-[112px_minmax(0,1fr)_88px_88px] items-center gap-x-2';

interface Slot {
  readonly item: PortfolioItem;
  readonly low: number;
  readonly high: number;
  readonly end: number;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signedCurrency(value: number): string {
  if (value === 0) return formatCurrencyAxis(0);
  return `${value > 0 ? '+' : '−'}${formatCurrencyAxis(Math.abs(value))}`;
}

/** Mesma função de faixa da ponte grande: passo nasce onde o anterior terminou, total ancora no zero. */
function toSlots(items: readonly PortfolioItem[]): readonly Slot[] {
  let running = 0;
  return items.map((item) => {
    const start = item.kind === 'total' ? 0 : running;
    const end = item.kind === 'total' ? item.value : running + item.value;
    running = end;
    return { item, low: Math.min(start, end), high: Math.max(start, end), end };
  });
}

/** Domínio comum sobre o acumulado de todas as linhas medidas; `null` quando nenhuma tem passo. */
function commonDomain(rows: readonly ExecutivePortfolio[]): readonly [number, number] | null {
  const slots = rows.flatMap((row) => toSlots(row.items));
  if (slots.length === 0) return null;
  return [Math.min(0, ...slots.map((slot) => slot.low)), Math.max(0, ...slots.map((slot) => slot.high))];
}

/** Quanto a variação líquida erra a soma dos passos; `null` quando a linha não tem passo medido. */
function rowGap(row: ExecutivePortfolio): number | null {
  const steps = row.items.filter((item) => item.kind === 'step');
  const total = row.items.find((item) => item.kind === 'total');
  if (steps.length === 0 || !total) return null;
  return total.value - steps.reduce((sum, item) => sum + item.value, 0);
}

function netOf(row: ExecutivePortfolio): number | null {
  const total = row.items.find((item) => item.kind === 'total');
  return total ? total.value : null;
}

function rowTitle(row: ExecutivePortfolio, slots: readonly Slot[]): string {
  const parts = slots.map((slot) => `${slot.item.label.toLowerCase()} ${signedCurrency(slot.item.value)}`);
  return `${row.name}: ${parts.join('; ')}`;
}

/** SVG puro por célula: faixa [baixo, alto] de cada item, conector e linha do zero, sem rótulo interno. */
function MicroBridge({ row, domain }: { readonly row: ExecutivePortfolio; readonly domain: readonly [number, number] }): ReactElement {
  const slots = toSlots(row.items);
  const [lo, hi] = domain;
  const scale = (value: number): number => CELL_PAD + ((hi - value) / (hi - lo)) * (CELL_HEIGHT - 2 * CELL_PAD);
  const slotWidth = CELL_WIDTH / COLUMNS;
  return (
    <svg aria-hidden className="h-[30px] w-full" preserveAspectRatio="none" viewBox={`0 0 ${String(CELL_WIDTH)} ${String(CELL_HEIGHT)}`}>
      <title>{rowTitle(row, slots)}</title>
      <line stroke="var(--line-strong)" vectorEffect="non-scaling-stroke" x1={0} x2={CELL_WIDTH} y1={scale(0)} y2={scale(0)} />
      {slots.map((slot, index) => {
        const x = index * slotWidth + (slotWidth - BAR_WIDTH) / 2;
        const isTotal = slot.item.kind === 'total';
        const isZero = !isTotal && slot.item.value === 0;
        const levelY = scale(!isTotal && slot.item.value < 0 ? slot.low : slot.high);
        const rawTop = scale(slot.high);
        const rawHeight = scale(slot.low) - rawTop;
        const barHeight = isZero ? ZERO_MARK : Math.max(rawHeight, STEP_MIN);
        const barTop = isZero ? levelY - ZERO_MARK / 2 : rawTop - (barHeight - rawHeight) / 2;
        const fill = isTotal ? 'var(--chart-1)' : isZero ? 'var(--text-secondary)' : slot.item.value > 0 ? 'var(--positive)' : 'var(--negative)';
        return (
          <g key={slot.item.id}>
            {index < slots.length - 1 ? (
              <line stroke="var(--line-strong)" vectorEffect="non-scaling-stroke" x1={x + BAR_WIDTH} x2={x + slotWidth} y1={levelY} y2={levelY} />
            ) : null}
            <rect fill={fill} height={barHeight} width={BAR_WIDTH} x={x} y={barTop} />
          </g>
        );
      })}
    </svg>
  );
}

export default function PortfolioMicroBridges({ data = defaultData, periods = defaultPeriods, height, className }: PortfolioMicroBridgesProps) {
  const style = height === undefined ? undefined : { height };
  const measured = data.filter((row) => row.items.length > 0 && row.from !== null && row.to !== null);
  const domain = commonDomain(measured);

  if (measured.length === 0 || domain === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum executivo com carteira medida neste recorte: não há passo para desenhar.
      </div>
    );
  }

  const nets = measured.map((row) => ({ row, net: netOf(row) ?? 0 }));
  const best = nets.reduce((max, entry) => (entry.net > max.net ? entry : max), nets[0]!);
  const totalNet = nets.reduce((sum, entry) => sum + entry.net, 0);
  const unmeasured = data.filter((row) => !measured.includes(row));
  const withoutExpansion = measured.filter((row) => row.items.some((item) => item.id === 'expansao' && item.value === 0));
  const unclosed = measured.filter((row) => (rowGap(row) ?? 0) !== 0).length;

  const summary =
    `Tabela de cascatas micro da carteira de ${formatInt(data.length)} executivos, de ${periods.from} a ${periods.to}, em quatro passos. ` +
    `${formatInt(measured.length)} com dado medido somam ${signedCurrency(totalNet)}; a maior variação é de ${best.row.name}, ` +
    `${signedCurrency(best.net)}. ${formatInt(unmeasured.length)} sem dado medido.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 shrink-0">
        <p className="text-xs font-medium text-text-secondary">
          Carteira {signedCurrency(totalNet)} de {periods.from} a {periods.to}; {formatInt(withoutExpansion.length)} sem expansão e {formatInt(unmeasured.length)} sem dado
          medido{unclosed > 0 ? `; ${formatInt(unclosed)} linha(s) não fecham` : ''}
        </p>
        <p className="mt-1 text-[11px] text-text-muted">
          Da esquerda para a direita: novas contas, expansão, reajuste, cancelamentos e variação líquida, na mesma escala em todas as linhas.
        </p>
      </div>
      <div aria-hidden className={cn(ROW_GRID, 'shrink-0 pb-1 text-[11px] text-text-muted')}>
        <span>Executivo</span>
        <span>Passos e variação líquida</span>
        <span className="text-right">Carteira</span>
        <span className="text-right">Variação</span>
      </div>
      <ul aria-hidden className="min-h-0 flex-1">
        {data.map((row) => {
          const isBest = row.id === best.row.id;
          const net = netOf(row);
          const missing = row.items.length === 0 || row.from === null || row.to === null;
          return (
            <li className={cn(ROW_GRID, 'h-[34px]')} key={row.id}>
              <span className={cn('text-xs', isBest ? 'font-bold text-text-primary' : 'text-text-secondary')}>{row.name}</span>
              {missing ? (
                <span className="col-span-3 flex items-center gap-1.5 text-xs text-text-muted">
                  <Unplug aria-hidden className="size-4 shrink-0" />
                  {formatUnavailable()}
                </span>
              ) : (
                <>
                  <MicroBridge domain={domain} row={row} />
                  <span className="kpi-number text-right text-xs text-text-primary" title={formatCurrency(row.to ?? 0, 0)}>
                    {formatCurrencyAxis(row.to ?? 0)}
                  </span>
                  <span
                    className={cn(
                      'kpi-number text-right text-xs',
                      net === null || net === 0 ? 'text-text-muted' : net > 0 ? 'text-positive' : 'text-negative',
                      isBest && 'font-bold',
                    )}
                  >
                    {net === null ? formatUnavailable() : signedCurrency(net)}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
