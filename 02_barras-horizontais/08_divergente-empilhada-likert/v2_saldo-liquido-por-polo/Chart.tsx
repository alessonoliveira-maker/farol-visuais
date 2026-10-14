import { Filter, Unplug } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatPercentPoints, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, scale as defaultScale, type CriterionRatings, type ScalePoint } from './data';

/**
 * Mesma pilha divergente do modelo, ordenada pelo saldo entre polos: o percentual somado de cada
 * lado sai escrito fora da ponta da pilha, e o saldo (positivo menos negativo, em pontos
 * percentuais) fica numa coluna própria com a cor da polaridade. O neutro entra na soma dos 100
 * pontos mas não desenha segmento (dividi-lo ao meio sugeriria que metade de quem não opinou pende
 * para um lado, mesma decisão editorial da v1); em vez do vazio, sai escrito na sua própria coluna,
 * entre o percentual positivo e o saldo, para os três números da linha sempre somarem 100.
 */
export interface HandoffBalanceProps {
  readonly data?: readonly CriterionRatings[];
  readonly scale?: readonly ScalePoint[];
  readonly height?: number;
  readonly className?: string;
}

const GRID_COLUMNS = 'grid grid-cols-[12rem_3.25rem_minmax(0,1fr)_3.25rem_3.5rem_4.5rem_5.5rem] gap-x-3';
const ROW_HEIGHT = 36;
const BAR_HEIGHT = 22;
const SEGMENT_SEPARATOR = 1.5;
const LABEL_MIN_SHARE = 0.07;
const LABEL_MIN_SHARE_SHORT = 0.05;
const SEPARATOR_STROKE = 'var(--surface-raised)';
const ZERO_STROKE = 'var(--line-strong)';
const SEGMENT_TEXT = 'var(--accent-cyan-contrast)';
/** Cabeçalho de coluna: 11 px, mesma classe da contagem de respostas por linha (TIP-2). */
const HEADER_LABEL = 'text-[0.6875rem] leading-4 whitespace-nowrap text-text-muted';
/** Cor do neutro de dado, igual à v1: não tem segmento na pilha, então não leva slot categórico. */
const NEUTRAL_FILL = 'var(--line-strong)';

interface Segment {
  readonly point: ScalePoint;
  readonly percent: number;
  readonly start: number;
}

interface Row {
  readonly item: CriterionRatings;
  readonly total: number;
  readonly negative: number;
  readonly neutral: number;
  readonly positive: number;
  readonly balance: number;
  readonly segments: readonly Segment[];
}

function largestRemainder(counts: readonly number[]): number[] {
  const total = counts.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return counts.map(() => 0);
  const raw = counts.map((value) => (value / total) * 100);
  const result = raw.map(Math.floor);
  let missing = 100 - result.reduce((sum, value) => sum + value, 0);
  const byRemainder = raw
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const { index } of byRemainder) {
    if (missing <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    missing -= 1;
  }
  return result;
}

function toRow(item: CriterionRatings, scale: readonly ScalePoint[]): Row {
  const counts = scale.map((point) => item.counts[point.key]);
  const total = counts.reduce((sum, value) => sum + value, 0);
  const percents = largestRemainder(counts);
  const poleSum = (pole: ScalePoint['pole']) =>
    scale.reduce((sum, point, index) => (point.pole === pole ? sum + (percents[index] ?? 0) : sum), 0);
  const negative = poleSum('negative');
  const neutral = poleSum('neutral');
  const positive = poleSum('positive');
  const segments: Segment[] = [];
  let cursor = -negative;
  scale.forEach((point, index) => {
    if (point.pole === 'neutral') return;
    const percent = percents[index] ?? 0;
    segments.push({ point, percent, start: cursor });
    cursor += percent;
  });
  return { item, total, negative, neutral, positive, balance: positive - negative, segments };
}

function pointColor(point: ScalePoint): string {
  return point.slot === undefined ? NEUTRAL_FILL : (CHART_SERIES_COLORS[point.slot - 1] ?? NEUTRAL_FILL);
}

function toX(fraction: number): string {
  return `${String(Math.round(fraction * 10000) / 100)}%`;
}

function labelFits(percent: number, span: number): boolean {
  return percent > 0 && percent / span >= (percent < 10 ? LABEL_MIN_SHARE_SHORT : LABEL_MIN_SHARE);
}

/**
 * Direção do saldo pelo que o leitor vê, não pela fração crua: o saldo que sai escrito como zero
 * não declara direção nenhuma. Sinal e cor saem os dois daqui para nunca se contradizerem, isto é,
 * um "0%" pintado de verde.
 */
function balanceSign(points: number): -1 | 0 | 1 {
  if (formatPercentPoints(Math.abs(points), 0) === formatPercentPoints(0, 0)) return 0;
  return points > 0 ? 1 : -1;
}

/**
 * Sinal à mão sobre o valor absoluto (NUM-3): hífen do formatador nunca aparece na tela, e zero
 * sai sem sinal. Saldo zero é medição, não ganho: o `>= 0` imprimia "+0%" num polo em que favorável
 * e contrário se anularam.
 */
function signedPoints(points: number): string {
  const text = formatPercentPoints(Math.abs(points), 0);
  const sign = balanceSign(points);
  if (sign === 0) return text;
  return `${sign > 0 ? '+' : '−'}${text}`;
}

/** Saldo zero é medição, não ganho: sai do par verde/vermelho e vai para o neutro (CONTRATO 17.2). */
function balanceTone(points: number): string {
  const sign = balanceSign(points);
  if (sign === 0) return 'text-text-muted';
  return sign > 0 ? 'text-positive' : 'text-negative';
}

/**
 * Item de legenda: amostra na cor do ponto (ROT-4) e o rótulo da escala por extenso. Em vez de
 * ancorar cada polo à sua metade da pilha (que descasa da v1 porque aqui a coluna da pilha é mais
 * estreita, espremida pelas colunas de soma e saldo, e o polo menor de algumas versões do dado não
 * sobra espaço lateral suficiente), a legenda sai numa linha só, na ordem visual da pilha.
 */
function LegendItem({ point }: { readonly point: ScalePoint }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-text-secondary">
      <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: pointColor(point) }} />
      {point.label}
    </span>
  );
}

export default function HandoffBalance({ data = defaultData, scale = defaultScale, height, className }: HandoffBalanceProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma avaliação neste recorte: não houve handoff avaliado no período.</span>
      </div>
    );
  }

  const rows = data.map((item) => toRow(item, scale)).sort((a, b) => b.balance - a.balance);
  const measured = rows.filter((row) => row.total > 0);
  const leftMax = Math.max(0, ...measured.map((row) => row.negative));
  const rightMax = Math.max(0, ...measured.map((row) => row.positive));
  const span = Math.max(1, leftMax + rightMax);
  const zero = toX(leftMax / span);

  const best = rows[0];
  const worst = rows[rows.length - 1];
  const summary = [
    `Gráfico de barras divergentes empilhadas com ${formatInt(rows.length)} critérios do handoff, ordenados do maior para o menor saldo entre polo positivo e negativo.`,
    best ? `Melhor saldo: ${best.item.label}, ${signedPoints(best.balance)}.` : '',
    worst && worst !== best ? `Pior: ${worst.item.label}, ${signedPoints(worst.balance)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col justify-center', className)} role="img" style={style}>
      <div aria-hidden className={cn(GRID_COLUMNS, 'mb-2 shrink-0 items-center gap-y-1')}>
        <span />
        <span className={cn(HEADER_LABEL, 'text-right')}>% negativo</span>
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
          {scale
            .filter((point) => point.pole !== 'neutral')
            .map((point) => (
              <LegendItem key={point.key} point={point} />
            ))}
        </div>
        <span className={HEADER_LABEL}>% positivo</span>
        <span className={cn(HEADER_LABEL, 'text-right')}>% neutro</span>
        <span className={cn(HEADER_LABEL, 'text-right')}>saldo (p.p.)</span>
        <span className={cn(HEADER_LABEL, 'text-right')}>respostas</span>
      </div>
      {rows.map((row) => (
        <div className={cn(GRID_COLUMNS, 'shrink-0 items-center')} key={row.item.id} style={{ height: ROW_HEIGHT }}>
          <span className="text-xs font-medium whitespace-nowrap text-text-secondary">{row.item.label}</span>
          {row.total > 0 ? (
            <>
              <span className="font-display text-right text-xs text-text-secondary tabular-nums">{formatPercent(row.negative / 100, 0)}</span>
              <svg aria-hidden className="block w-full overflow-visible" height={ROW_HEIGHT}>
                {row.segments.map((segment) =>
                  segment.percent > 0 ? (
                    <rect
                      fill={pointColor(segment.point)}
                      height={BAR_HEIGHT}
                      key={segment.point.key}
                      stroke={SEPARATOR_STROKE}
                      strokeWidth={SEGMENT_SEPARATOR}
                      width={toX(segment.percent / span)}
                      x={toX((segment.start + leftMax) / span)}
                      y={(ROW_HEIGHT - BAR_HEIGHT) / 2}
                    />
                  ) : null,
                )}
                {row.segments.map((segment) =>
                  labelFits(segment.percent, span) ? (
                    <text
                      className="font-display"
                      dominantBaseline="central"
                      fill={SEGMENT_TEXT}
                      fontSize={12}
                      fontWeight={500}
                      key={segment.point.key}
                      textAnchor="middle"
                      x={toX((segment.start + segment.percent / 2 + leftMax) / span)}
                      y={ROW_HEIGHT / 2}
                    >
                      {formatPercent(segment.percent / 100, 0)}
                    </text>
                  ) : null,
                )}
                <line stroke={ZERO_STROKE} strokeWidth={1} x1={zero} x2={zero} y1={0} y2={ROW_HEIGHT} />
              </svg>
              <span className="font-display text-xs text-text-secondary tabular-nums">{formatPercent(row.positive / 100, 0)}</span>
              <span className="font-display text-right text-xs text-text-secondary tabular-nums">{formatPercent(row.neutral / 100, 0)}</span>
              <span
                className={cn('font-display text-right text-xs font-semibold tabular-nums', balanceTone(row.balance))}
              >
                {signedPoints(row.balance)}
              </span>
            </>
          ) : (
            <span className="col-span-5 flex items-center gap-2 text-xs text-text-muted">
              <Unplug aria-hidden className="size-4 shrink-0" />
              {formatUnavailable()}
            </span>
          )}
          <span className="text-right text-[0.6875rem] whitespace-nowrap text-text-muted tabular-nums">{formatInt(row.total)} respostas</span>
        </div>
      ))}
    </div>
  );
}
