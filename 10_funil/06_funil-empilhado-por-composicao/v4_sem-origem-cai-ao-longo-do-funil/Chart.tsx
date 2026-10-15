import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercentFromScale100, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type FunnelOriginStage } from './data';

/**
 * A mesma composição por origem, olhada pela cobertura de dado: a faixa "Sem origem", em
 * contorno neutro sempre no fim da pilha, encolhe do topo ao fundo do funil, e o rótulo de
 * cada etapa escreve o quanto disso é percentual, nunca só o comprimento. Como quem avança
 * tende a ter cadastro mais completo, o mix do fundo não é comparável ao do topo: a linha de
 * leitura avisa o viés antes de qualquer conclusão sobre origem "vencedora". Por isso a parte
 * com origem não é colorida por categoria (as seis origens ficariam sem identidade no próprio
 * visual): ela é um tom neutro só, "Neutro de dado" da 17.2. A dica traz as duas partes da
 * pilha (com origem somada e sem origem); o detalhe por origem não está nesta versão.
 */
export interface NoOriginDeclineBarsProps {
  readonly data?: readonly FunnelOriginStage[];
  readonly height?: number;
  readonly className?: string;
}

type OriginKey = Exclude<keyof FunnelOriginStage, 'stage'>;

const COLOR_KEYS = [
  'referral',
  'socialMedia',
  'paidSearch',
  'professionalNetwork',
  'organic',
  'event',
] as const satisfies readonly OriginKey[];

/** Papel "Neutro de dado" da 17.2: as seis origens conhecidas não têm chave nem legenda no
 *  visual (ROT-4 reprovou seis cores sem identidade), então elas viram um bloco só, sem
 *  distinção de categoria; quem quiser saber qual origem é qual usa a dica. */
const WITH_ORIGIN_FILL = 'var(--line-strong)';
const WITH_ORIGIN_LABEL = 'Com origem declarada';
const NO_ORIGIN_LABEL = 'Sem origem declarada';
const NO_ORIGIN_STROKE = 'var(--text-muted)';
/** Direita reserva espaço para as duas linhas da cauda: total em negrito e "NN% sem origem" embaixo. */
const MARGIN = { top: 8, right: 108, bottom: 0, left: 2 } as const;
const STAGE_AXIS_WIDTH = 100;
/** Passo (corpo ÷ 5 etapas) vezes o vão de 34%: 44 × (1 − 2 × 0,34) ≈ 14 px de espessura por barra. */
const ROW_STEP = 44;
const BAR_CATEGORY_GAP = '34%';
const VALUE_LABEL_GAP = 8;
/** Múltiplo de 2 px (ESP-1); separa a linha do total e a da lacuna acima e abaixo do centro. */
const TAIL_LINE_GAP = 8;

function totalOf(row: FunnelOriginStage): number {
  return COLOR_KEYS.reduce((sum, key) => sum + row[key], 0) + row.noOrigin;
}

/** Percentual inteiro da lacuna; `null` quando a etapa não tem lead (ausência, EST-1b). */
function gapPercentOf(row: FunnelOriginStage): number | null {
  const total = totalOf(row);
  return total > 0 ? Math.round((row.noOrigin / total) * 100) : null;
}

/** Cobertura como 100 menos o percentual impresso da lacuna: o par sempre soma 100 (NUM-2). */
function coveragePercentOf(row: FunnelOriginStage): number | null {
  const gap = gapPercentOf(row);
  return gap === null ? null : 100 - gap;
}

function percentText(value: number | null): string {
  return value === null ? formatUnavailable() : formatPercentFromScale100(value, 0);
}

/** Frase da direção da cobertura, calculada da primeira para a última etapa. */
function coverageReading(first: FunnelOriginStage, last: FunnelOriginStage): string {
  const from = coveragePercentOf(first);
  const to = coveragePercentOf(last);
  if (from === null || to === null) {
    return `Cobertura de origem: ${formatUnavailable()} em etapa sem lead, e o mix do fundo não se compara ao do topo.`;
  }
  if (from === to) {
    return `Cobertura de origem fica em ${percentText(from)} do topo ao fundo: o mix do fundo se compara ao do topo.`;
  }
  const verb = to > from ? 'sobe' : 'cai';
  return `Cobertura de origem ${verb} de ${percentText(from)} para ${percentText(to)}: o mix do fundo não se compara ao do topo.`;
}

interface StageTickProps {
  readonly y?: number | string;
  readonly index?: number;
}

export default function NoOriginDeclineBars({ data = defaultData, height, className }: NoOriginDeclineBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma etapa neste recorte: não houve lead no funil do período.</span>
      </div>
    );
  }

  const rows = [...data];
  const first = rows[0];
  const last = rows[rows.length - 1];

  const reading = first && last ? coverageReading(first, last) : null;
  const summary =
    first && last
      ? `Barras horizontais empilhadas com a cobertura de origem em ${String(rows.length)} etapas do funil, de ${first.stage} a ${last.stage}. ${reading ?? ''}`
      : 'Barras horizontais empilhadas com a cobertura de origem em cada etapa do funil.';

  const renderStageTick = ({ y, index = -1 }: StageTickProps): ReactElement => {
    const row = rows[index];
    const cy = Number(y);
    return (
      <text dominantBaseline="central" textAnchor="start" x={0} y={cy}>
        <tspan className="font-sans" dy="-4" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0}>
          {row ? row.stage : ''}
        </tspan>
        <tspan className="font-sans tabular-nums" dy="15" fill="var(--text-muted)" fontSize={11} x={0}>
          {row ? (gapPercentOf(row) === null ? 'sem lead' : `${percentText(coveragePercentOf(row))} com origem`) : ''}
        </tspan>
      </text>
    );
  };

  /** Forma própria na lacuna: com ela o Recharts não descarta a barra de largura zero, e o total e a ausência escrita continuam na ponta (REC-11). */
  const renderGap = ({ x, y, width, height: barHeight }: BarShapeProps): ReactElement => (
    <Rectangle
      fill="none"
      height={Number(barHeight)}
      radius={[0, 3, 3, 0]}
      stroke={Number(width) > 0 ? NO_ORIGIN_STROKE : 'none'}
      strokeWidth={1}
      width={Number(width)}
      x={Number(x)}
      y={Number(y)}
    />
  );

  const renderTail = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const tipX = Number(x) + Number(width) + VALUE_LABEL_GAP;
    const cy = Number(y) + Number(barHeight) / 2;
    const gap = gapPercentOf(row);
    return (
      <>
        <text className="font-display tabular-nums" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={600} x={tipX} y={gap === null ? cy : cy - TAIL_LINE_GAP}>
          {formatInt(totalOf(row))} leads
        </text>
        {gap === null ? null : (
          <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={tipX} y={cy + TAIL_LINE_GAP}>
            {`${percentText(gap)} sem origem`}
          </text>
        )}
      </>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">{reading}</p> : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis {...AXIS_PROPS} domain={[0, 'dataMax']} hide type="number" />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="stage"
              interval={0}
              tick={renderStageTick}
              tickLine={false}
              type="category"
              width={STAGE_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip labelFormat="text" valueFormat="int" />}
              cursor={{ fill: 'var(--line-subtle)' }}
              isAnimationActive={false}
            />
            <Bar
              dataKey={(row: FunnelOriginStage) => COLOR_KEYS.reduce((sum, key) => sum + row[key], 0)}
              fill={WITH_ORIGIN_FILL}
              isAnimationActive={animate}
              maxBarSize={ROW_STEP}
              name={WITH_ORIGIN_LABEL}
              stackId="mix"
            />
            <Bar
              dataKey="noOrigin"
              fill="none"
              isAnimationActive={animate}
              maxBarSize={ROW_STEP}
              name={NO_ORIGIN_LABEL}
              shape={renderGap}
              stackId="mix"
            >
              <LabelList content={renderTail} dataKey="noOrigin" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
