import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, Rectangle, ResponsiveContainer, XAxis, YAxis, type BarShapeProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  entityLabel as defaultEntityLabel,
  referenceLabel as defaultReferenceLabel,
  type DimensionScore,
} from './data';

/**
 * Barras paralelas por dimensão: a nota da pessoa avaliada contra a média do time, numa escala
 * comum de 0 a 100 pontos em que mais é sempre melhor. Dimensões ordenadas da maior lacuna
 * negativa à maior positiva. A coluna da lacuna, à direita, é HTML puro numa grade de N linhas
 * iguais dentro do mesmo pai de altura cheia do BarChart (margem zero, sem cabeçalho): as duas
 * dividem a mesma altura em N partes iguais e alinham sem medir o DOM.
 */
export interface DimensionGapBarsProps {
  readonly data?: readonly DimensionScore[];
  readonly entityLabel?: string;
  readonly referenceLabel?: string;
  readonly height?: number;
  readonly className?: string;
}

interface Row extends DimensionScore {
  readonly gap: number;
}

const HIGHLIGHT_FILL = 'var(--chart-1)';
const NEUTRAL_FILL = 'var(--line-strong)';
const MARGIN = { top: 0, right: 64, bottom: 0, left: 0 } as const;
/** Folga acima do nome mais longo (TIP-7): "Acerto da previsão de fechamento" a 12 px medio. */
const NAME_AXIS_WIDTH = 270;
const GAP_COLUMN_WIDTH = 88;
const VALUE_LABEL_GAP = 6;
const BAR_GAP = 8;
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 12;
/**
 * Passo por dimensão pela ESP-6, com a conta invertida para a espessura virar promessa e não teto:
 * (BAR_MAX × 2 séries + BAR_GAP × 1 emenda) / (1 − 2 × 0,32) = 88,9 px, arredondado para 90 (ESP-1).
 * O corpo do gráfico pede ROW_STEP × número de dimensões; em menos que isso o Recharts afinaria a
 * marca abaixo do piso de 12 px da ESP-2, que foi o defeito medido em 2026-09-18 (marca de 2 px no
 * canvas card, com BAR_MAX = 11 declarado). Quem cede é a altura: o vão de 8 px entre as duas barras
 * do par é o que segura o rótulo do meio, e afiná-lo colaria as duas marcas.
 */
const ROW_STEP = 90;
const BAR_RADIUS: [number, number, number, number] = [0, 3, 3, 0];
const SCALE_MAX = 100;

function byGap(a: Row, b: Row): number {
  return a.gap - b.gap || a.dimension.localeCompare(b.dimension, 'pt-BR');
}

interface NameTickProps {
  readonly y?: number | string;
  readonly index?: number;
}

interface PairBarShapeProps extends BarShapeProps {
  readonly payload?: Row;
}

/**
 * Um rótulo por par, não um por barra: com as duas notas perto (ou empatadas, "76 pts" contra
 * "76 pts"), rótulo grudado na ponta de cada barra faz o par colidir, porque a diferença de
 * comprimento das barras pode ser menor que a largura do próprio texto (ESP-3). O par sempre tem
 * exatamente um texto, na maior ponta das duas barras e no meio do par: nunca há um segundo texto
 * para colidir com o primeiro. Vive no `shape` das duas barras, não numa `LabelList`: o Recharts
 * filtra o `content` de `LabelList` para só as props SVG e descarta `payload`, então um `content`
 * de `LabelList` nunca enxerga a linha do dado; o `shape` de `Bar` recebe o `payload` inteiro. A
 * barra do score grava sua própria ponta em pixel (`x + width`, já na escala exata que o Recharts
 * desenhou, sem recalcular a régua); a barra da média lê essa ponta de volta pelo `id` da linha, e o
 * texto vai na maior das duas, nunca inventando uma escala própria que possa divergir da barra real.
 * O próprio `y` da barra da média menos metade do `BAR_GAP` já é o meio entre as duas barras.
 */
function makeBarShapes(scoreEndByRowId: Map<string, number>) {
  const renderScoreBar = ({ x, y, width, height: barHeight, payload }: PairBarShapeProps): ReactElement => {
    const row = payload as Row | undefined;
    if (row) scoreEndByRowId.set(row.id, Number(x) + Number(width));
    return <Rectangle fill={HIGHLIGHT_FILL} height={Number(barHeight)} radius={BAR_RADIUS} width={Number(width)} x={Number(x)} y={Number(y)} />;
  };

  const renderPairBar = ({ x, y, width, height: barHeight, payload }: PairBarShapeProps): ReactElement => {
    const row = payload as Row | undefined;
    const averageEnd = Number(x) + Number(width);
    const bar = <Rectangle fill={NEUTRAL_FILL} height={Number(barHeight)} radius={BAR_RADIUS} width={Number(width)} x={Number(x)} y={Number(y)} />;
    if (!row) return bar;
    const scoreEnd = scoreEndByRowId.get(row.id) ?? averageEnd;
    const textX = Math.max(scoreEnd, averageEnd) + VALUE_LABEL_GAP;
    const textY = Number(y) - BAR_GAP / 2;
    return (
      <g>
        {bar}
        <text className="font-display" dominantBaseline="central" fontSize={11} fontWeight={500} x={textX} y={textY}>
          <tspan fill="var(--text-primary)">{formatInt(row.score)} pts</tspan>
          <tspan fill="var(--text-muted)"> · </tspan>
          <tspan fill="var(--text-secondary)">{formatInt(row.teamAverage)} pts</tspan>
        </text>
      </g>
    );
  };

  return { renderScoreBar, renderPairBar };
}

export default function DimensionGapBars({
  data = defaultData,
  entityLabel = defaultEntityLabel,
  referenceLabel = defaultReferenceLabel,
  height,
  className,
}: DimensionGapBarsProps) {
  const animate = useAnimateOnce();
  const rows: Row[] = data.map((row) => ({ ...row, gap: row.score - row.teamAverage })).sort(byGap);
  const style = height === undefined ? undefined : { height };
  const { renderScoreBar, renderPairBar } = makeBarShapes(new Map());

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Minus aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma dimensão neste recorte: a avaliação do trimestre não tem nota lançada.</span>
      </div>
    );
  }

  const worst = rows[0];
  const best = rows[rows.length - 1];

  /*
   * O pior caso só é "atraso" quando a lacuna é negativa: com todas as dimensões empatadas ou
   * acima da média, chamar o menor gap de "atraso" afirmaria um atraso que não existe.
   */
  const worstLine =
    worst && worst.gap < 0
      ? `Maior atraso em ${worst.dimension}, ${formatInt(Math.abs(worst.gap))} pontos abaixo.`
      : worst
        ? `Menor vantagem em ${worst.dimension}, ${formatInt(worst.gap)} pontos acima.`
        : '';

  const summary = [
    `Barras agrupadas comparando ${entityLabel} e ${referenceLabel} em ${String(rows.length)} dimensões, da maior lacuna à maior vantagem.`,
    worstLine,
    best && best.gap > 0 && best.id !== worst?.id ? `Maior vantagem em ${best.dimension}, ${formatInt(best.gap)} pontos acima.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderName = ({ y, index = -1 }: NameTickProps): ReactElement => (
    <text
      className="font-sans"
      dominantBaseline="central"
      fill="var(--text-secondary)"
      fontSize={12}
      fontWeight={500}
      x={MARGIN.left}
      y={Number(y)}
    >
      {rows[index]?.dimension ?? ''}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 items-center gap-4 text-xs leading-4 text-text-secondary">
        <span className="flex items-center gap-2.5">
          <span className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: HIGHLIGHT_FILL }} />
          {entityLabel}
        </span>
        <span className="flex items-center gap-2.5">
          <span className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: NEUTRAL_FILL }} />
          {referenceLabel}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 gap-3" style={{ minHeight: rows.length * ROW_STEP }}>
        <div className="min-w-0 flex-1">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              accessibilityLayer={false}
              barCategoryGap={BAR_CATEGORY_GAP}
              barGap={BAR_GAP}
              data={rows}
              layout="vertical"
              margin={MARGIN}
            >
              <XAxis domain={[0, SCALE_MAX]} hide type="number" />
              <YAxis
                axisLine={false}
                dataKey="id"
                interval={0}
                tick={renderName}
                tickLine={false}
                type="category"
                width={NAME_AXIS_WIDTH}
              />
              <Bar dataKey="score" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderScoreBar} />
              <Bar dataKey="teamAverage" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderPairBar} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div
          className="grid shrink-0"
          style={{ gridTemplateRows: `repeat(${String(rows.length)}, minmax(0, 1fr))`, width: GAP_COLUMN_WIDTH }}
        >
          {rows.map((row) => {
            const Icon = row.gap > 0 ? ArrowUpRight : row.gap < 0 ? ArrowDownRight : Minus;
            const tone = row.gap > 0 ? 'text-positive' : row.gap < 0 ? 'text-negative' : 'text-text-secondary';
            const label = row.gap === 0 ? '0 pts' : `${row.gap > 0 ? '+' : '−'}${formatInt(Math.abs(row.gap))} pts`;
            return (
              <div className={cn('flex items-center gap-1 text-xs font-medium tabular-nums', tone)} key={row.id}>
                <Icon aria-hidden className="size-3 shrink-0" />
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
