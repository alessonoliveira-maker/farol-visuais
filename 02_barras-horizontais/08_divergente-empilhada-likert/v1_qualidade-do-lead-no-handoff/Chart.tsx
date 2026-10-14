import { Filter, Unplug } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, scale as defaultScale, type CriterionRatings, type ScalePoint } from './data';

/**
 * Divergente empilhada Likert em SVG puro: cada critério vira uma pilha centrada no zero, com as
 * notas ruins à esquerda e as boas à direita. O neutro não entra na pilha e fica numa coluna
 * própria, porque dividi-lo ao meio sugere que metade de quem não opinou é a favor. O zero cai no
 * mesmo x em todas as linhas, calculado pelo maior polo negativo e pelo maior positivo do conjunto.
 * Cada linha é um SVG com coordenada horizontal em percentual: a pilha acompanha a largura do
 * cartão e o texto continua em 12 px.
 */
export interface HandoffLikertProps {
  /** Critérios na ordem do formulário de handoff; o componente não reordena. */
  readonly data?: readonly CriterionRatings[];
  /** Pontos da escala, do polo negativo ao positivo, com o slot de cor de cada um. */
  readonly scale?: readonly ScalePoint[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Colunas: critério, pilha, neutro e respostas. A pilha fica com a largura que sobra. */
const GRID_COLUMNS = 'grid grid-cols-[14rem_minmax(0,1fr)_7rem_5rem] gap-x-4';
const ROW_HEIGHT = 36;
/** 22 px numa faixa de 36: o respiro fica em 39% da faixa (ESP-2). */
const BAR_HEIGHT = 22;
/** Barra do neutro na escala própria da coluna, do zero ao maior neutro do conjunto. */
const NEUTRAL_BAR_MAX = 56;
/** Contorno na cor do cartão entre segmentos vizinhos, que entre si não contrastam (COR-5). */
const SEGMENT_SEPARATOR = 1.5;
/**
 * Percentual dentro do segmento só a partir destas frações do domínio. Com a pilha perto de 430 px
 * e o domínio de 128 pontos do dado padrão, 7% dá cerca de 30 px, o que cabe "NN%" em 12 px; com um
 * algarismo só ("8%"), 5% do domínio, cerca de 22 px, já basta.
 */
const LABEL_MIN_SHARE = 0.07;
const LABEL_MIN_SHARE_SHORT = 0.05;
/** Distância da legenda até o zero, dos dois lados. */
const LEGEND_ZERO_GAP = 8;
const SEPARATOR_STROKE = 'var(--surface-raised)';
const ZERO_STROKE = 'var(--line-strong)';
/** Neutro de dado: só é permitido porque o percentual está escrito ao lado da barra. */
const NEUTRAL_FILL = 'var(--line-strong)';
/** Texto sobre o segmento: de 5,39:1 a 10,06:1 sobre --chart-1, 3, 5 e 6 nos dois temas (WCAG). */
const SEGMENT_TEXT = 'var(--accent-cyan-contrast)';

interface Segment {
  readonly point: ScalePoint;
  readonly percent: number;
  /** Início do segmento em pontos percentuais a partir do zero: negativo fica à esquerda. */
  readonly start: number;
}

interface Row {
  readonly item: CriterionRatings;
  readonly total: number;
  readonly negative: number;
  readonly neutral: number;
  readonly positive: number;
  readonly segments: readonly Segment[];
}

/** Percentuais inteiros que somam 100 pelo maior resto; no empate, ganha o ponto que vem antes. */
function largestRemainder(counts: readonly number[]): number[] {
  const total = counts.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return counts.map(() => 0);
  const raw = counts.map((value) => (value / total) * 100);
  const result = raw.map(Math.floor);
  let missing = 100 - result.reduce((sum, value) => sum + value, 0);
  const byRemainder = raw.map((value, index) => ({ index, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const { index } of byRemainder) {
    if (missing <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    missing -= 1;
  }
  return result;
}

/** Deslocamento da linha: os negativos começam em menos a soma do polo, os positivos no zero. */
function toRow(item: CriterionRatings, scale: readonly ScalePoint[]): Row {
  const counts = scale.map((point) => item.counts[point.key]);
  const total = counts.reduce((sum, value) => sum + value, 0);
  const percents = largestRemainder(counts);
  const poleSum = (pole: ScalePoint['pole']) => scale.reduce((sum, point, index) => (point.pole === pole ? sum + (percents[index] ?? 0) : sum), 0);
  const negative = poleSum('negative');
  const segments: Segment[] = [];
  let cursor = -negative;
  scale.forEach((point, index) => {
    if (point.pole === 'neutral') return;
    const percent = percents[index] ?? 0;
    segments.push({ point, percent, start: cursor });
    cursor += percent;
  });
  return { item, total, negative, neutral: poleSum('neutral'), positive: poleSum('positive'), segments };
}

function pointColor(point: ScalePoint): string {
  return point.slot === undefined ? NEUTRAL_FILL : (CHART_SERIES_COLORS[point.slot - 1] ?? NEUTRAL_FILL);
}

/** Fração do domínio em atributo SVG: o percentual resolve contra a largura do próprio SVG. */
function toX(fraction: number): string {
  return `${String(Math.round(fraction * 10000) / 100)}%`;
}

/** O rótulo cabe no segmento? Um algarismo pede menos largura que dois. */
function labelFits(percent: number, span: number): boolean {
  return percent > 0 && percent / span >= (percent < 10 ? LABEL_MIN_SHARE_SHORT : LABEL_MIN_SHARE);
}

function LegendItem({ point }: { readonly point: ScalePoint }) {
  return (
    <span className="flex items-center gap-2.5 text-xs text-text-secondary">
      <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: pointColor(point) }} />
      {point.label}
    </span>
  );
}

export default function HandoffLikert({ data = defaultData, scale = defaultScale, height, className }: HandoffLikertProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma avaliação neste recorte: não houve handoff avaliado no período.</span>
      </div>
    );
  }

  const rows = data.map((item) => toRow(item, scale));
  const measured = rows.filter((row) => row.total > 0);
  const leftMax = Math.max(0, ...measured.map((row) => row.negative));
  const rightMax = Math.max(0, ...measured.map((row) => row.positive));
  const span = Math.max(1, leftMax + rightMax);
  const zero = toX(leftMax / span);
  const neutralMax = Math.max(1, ...measured.map((row) => row.neutral));
  const neutralPoint = scale.find((point) => point.pole === 'neutral');

  const byBalance = [...measured].sort((a, b) => a.positive - a.negative - (b.positive - b.negative));
  const worst = byBalance[0];
  const best = byBalance[byBalance.length - 1];
  const summary = [
    `Gráfico de barras divergentes empilhadas com ${formatInt(rows.length)} critérios do handoff em escala de ${formatInt(scale.length)} pontos.`,
    worst ? `Pior saldo: ${worst.item.label}, ${formatPercent(worst.negative / 100, 0)} negativas e ${formatPercent(worst.positive / 100, 0)} positivas.` : '',
    best && best !== worst ? `Melhor: ${best.item.label}, ${formatPercent(best.positive / 100, 0)} positivas.` : '',
    'Neutro em coluna própria.',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className={cn(GRID_COLUMNS, 'mb-2 shrink-0 items-start')}>
        <span />
        <div className="relative h-4 min-w-0">
          <div
            className="absolute inset-y-0 flex items-center gap-4 whitespace-nowrap"
            style={{ right: `calc(${toX(1 - leftMax / span)} + ${String(LEGEND_ZERO_GAP)}px)` }}
          >
            {scale.filter((point) => point.pole === 'negative').map((point) => (
              <LegendItem key={point.key} point={point} />
            ))}
          </div>
          <div
            className="absolute inset-y-0 flex items-center gap-4 whitespace-nowrap"
            style={{ left: `calc(${zero} + ${String(LEGEND_ZERO_GAP)}px)` }}
          >
            {scale.filter((point) => point.pole === 'positive').map((point) => (
              <LegendItem key={point.key} point={point} />
            ))}
          </div>
        </div>
        <div className="col-span-2">
          {neutralPoint ? <LegendItem point={neutralPoint} /> : null}
          <span className="block text-[0.6875rem] leading-4 text-text-muted">em coluna própria, fora da pilha</span>
        </div>
      </div>

      {rows.map((row) => (
        <div className={cn(GRID_COLUMNS, 'shrink-0 items-center')} key={row.item.id} style={{ height: ROW_HEIGHT }}>
          <span className="text-xs font-medium whitespace-nowrap text-text-secondary">{row.item.label}</span>
          {row.total > 0 ? (
            <svg aria-hidden className="block w-full" height={ROW_HEIGHT}>
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
          ) : (
            <span className="flex items-center gap-2 text-xs text-text-muted">
              <Unplug aria-hidden className="size-4 shrink-0" />
              {formatUnavailable()}
            </span>
          )}
          <span className="flex items-center gap-2">
            {row.total > 0 ? (
              <>
                <span className="block h-3 shrink-0" style={{ width: NEUTRAL_BAR_MAX }}>
                  <span className="block h-3" style={{ width: (row.neutral / neutralMax) * NEUTRAL_BAR_MAX, backgroundColor: NEUTRAL_FILL }} />
                </span>
                <span className="font-display w-8 text-right text-xs font-medium text-text-secondary">{formatPercent(row.neutral / 100, 0)}</span>
              </>
            ) : null}
          </span>
          <span className="text-right text-[0.6875rem] whitespace-nowrap text-text-muted tabular-nums">{formatInt(row.total)} respostas</span>
        </div>
      ))}
    </div>
  );
}
