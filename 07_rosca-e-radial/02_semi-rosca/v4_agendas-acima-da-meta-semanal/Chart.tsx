import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Sector, useChartHeight, useChartWidth } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, meta as defaultMeta, type AgendaSemanaCanal } from './data';

/**
 * Meia rosca empilhada com dois canais contra a meta semanal: o domínio do ângulo vai de zero até
 * o maior entre a soma e a meta, nunca só até a meta, porque um domínio fixo em 90 faz um canal de
 * 45 e outro de 59 caberem no mesmo meio arco e a leitura declarar empate onde não há (a marca de
 * referência é quem mostra a meta, não o corte do domínio). Quando a soma passa da meta, o arco
 * inteiro é ocupado e a meta vira um traço de referência sobre o próprio arco; quando não passa, a
 * meta cai exatamente na ponta final e o arco mostra o progresso até lá.
 */
export interface AgendaSemanaMetaProps {
  readonly data?: readonly AgendaSemanaCanal[];
  readonly meta?: number;
  readonly height?: number;
  readonly className?: string;
}

const INBOUND_FILL = CHART_SERIES_COLORS[0];
const OUTBOUND_FILL = CHART_SERIES_COLORS[2];
const CY_FRACTION = 0.86;
const CY = `${String(CY_FRACTION * 100)}%`;
const OUTER_FRACTION = 1;
const INNER_FRACTION = 0.68;
const OUTER_RADIUS = `${String(OUTER_FRACTION * 100)}%`;
const INNER_RADIUS = `${String(INNER_FRACTION * 100)}%`;
/** cornerRadius só na ponta final do arco: o primeiro gomo (inbound) fica reto nas duas pontas. */
const TIP_CORNER_RADIUS = 6;
/** Margem padrão do PolarChart (Recharts): 5 px nos quatro lados. */
const CHART_MARGIN = 5;
/** Halo obrigatório (ROT-7): o rótulo da meta pode cruzar o próprio arco preenchido. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/**
 * Recharts resolve o `viewBox` do `<Label position="center">` pelo contexto cartesiano, não pelo
 * polar do próprio gráfico (limitação da biblioteca): sem isso o centro sai em (0,0). Este hook
 * recalcula o cx/cy com a mesma fórmula que o `RadialBarChart` usa por dentro; só funciona chamado
 * de dentro da árvore do próprio gráfico.
 */
function useDonutCenter() {
  const width = useChartWidth() ?? 0;
  const containerHeight = useChartHeight() ?? 0;
  const plotWidth = width - CHART_MARGIN * 2;
  const plotHeight = containerHeight - CHART_MARGIN * 2;
  return {
    cx: CHART_MARGIN + plotWidth / 2,
    cy: CHART_MARGIN + CY_FRACTION * plotHeight,
  };
}

interface CenterLabelProps {
  readonly total: number;
  readonly meta: number;
}

/** Total contra a meta, escrito sobre a base do arco: filho do gráfico, para herdar o contexto. */
function CenterLabel({ total, meta }: CenterLabelProps): ReactElement {
  const { cx, cy } = useDonutCenter();
  return (
    <g aria-hidden>
      <text className="font-display" fill="var(--text-primary)" fontSize={20} fontWeight={600} textAnchor="middle" x={cx} y={cy - 22}>
        {formatInt(total)} de {formatInt(meta)}
      </text>
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={cy - 6}>
        agendas na semana
      </text>
    </g>
  );
}

interface TipShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly startAngle?: number;
  readonly endAngle?: number;
  readonly cornerRadius?: number;
  readonly fill?: string;
}

/**
 * Último gomo do arco, desenhado já com o traço de referência da meta por cima: o `shape` recebe
 * o raio real da banda (cx, cy, innerRadius, outerRadius) calculado pelo Recharts, então o traço
 * cruza a banda de borda a borda e é pintado depois dos dois arcos (nunca fica por baixo deles).
 * A posição é a real do valor no domínio: dentro do arco quando a soma passa da meta, na ponta
 * final quando não passa. Traço sólido com halo de superfície; o rótulo sai para fora do arco.
 */
function makeTipShape(meta: number, domainMax: number) {
  return function TipShape(props: TipShapeProps): ReactElement {
    const { cx = 0, cy = 0, innerRadius = 0, outerRadius = 0, startAngle = 0, endAngle = 0, cornerRadius = 0, fill } = props;
    const angleDeg = domainMax > 0 ? (meta / domainMax) * 180 : 0;
    const rad = (-angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x1 = cx + (outerRadius + 3) * cos;
    const y1 = cy + (outerRadius + 3) * sin;
    const x2 = cx + (innerRadius - 3) * cos;
    const y2 = cy + (innerRadius - 3) * sin;
    const labelRadius = outerRadius + 16;
    const lx = cx + labelRadius * cos;
    const ly = cy + labelRadius * sin;
    const anchor = cos > 0.15 ? 'start' : cos < -0.15 ? 'end' : 'middle';
    return (
      <g>
        <Sector
          cornerRadius={cornerRadius}
          cx={cx}
          cy={cy}
          endAngle={endAngle}
          fill={fill}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          stroke="var(--surface-raised)"
          strokeWidth={1}
        />
        <g aria-hidden>
          <line stroke="var(--surface-raised)" strokeLinecap="round" strokeWidth={5} x1={x1} x2={x2} y1={y1} y2={y2} />
          <line stroke="var(--text-primary)" strokeLinecap="round" strokeWidth={2} x1={x1} x2={x2} y1={y1} y2={y2} />
          <text className="font-display" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor={anchor} x={lx} y={ly}>
            meta {formatInt(meta)}
          </text>
        </g>
      </g>
    );
  };
}

export default function AgendaSemanaMeta({
  data = defaultData,
  meta = defaultMeta,
  height,
  className,
}: AgendaSemanaMetaProps) {
  const row = data[0];
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  if (row === undefined) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não há agendas registradas na semana.</span>
      </div>
    );
  }
  const { inbound, outbound } = row;
  const total = inbound + outbound;
  const over = total - meta;
  const domainMax = Math.max(total, meta);

  const summary = [
    `Meia rosca empilhada com ${formatInt(total)} agendas de inbound e outbound na semana, contra a meta de ${formatInt(meta)}.`,
    over > 0
      ? `A semana passou da meta em ${formatInt(over)} agendas.`
      : over < 0
        ? `Faltam ${formatInt(Math.abs(over))} agendas para a meta.`
        : 'A semana fechou exatamente na meta.',
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadialBarChart cy={CY} data={data} endAngle={180} innerRadius={INNER_RADIUS} outerRadius={OUTER_RADIUS} startAngle={0}>
            <PolarAngleAxis domain={[0, domainMax]} tick={false} type="number" />
            <CenterLabel meta={meta} total={total} />
            <RadialBar
              background={{ fill: 'var(--surface-sunken)' }}
              dataKey="inbound"
              fill={INBOUND_FILL}
              isAnimationActive={animate}
              stackId="agendas"
              stroke="var(--surface-raised)"
              strokeWidth={1}
            />
            <RadialBar
              cornerRadius={TIP_CORNER_RADIUS}
              dataKey="outbound"
              fill={OUTBOUND_FILL}
              isAnimationActive={animate}
              shape={makeTipShape(meta, domainMax)}
              stackId="agendas"
              stroke="var(--surface-raised)"
              strokeWidth={1}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex shrink-0 items-center justify-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: INBOUND_FILL }} />
          Inbound <span className="kpi-number font-semibold text-text-primary">{formatInt(inbound)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: OUTBOUND_FILL }} />
          Outbound <span className="kpi-number font-semibold text-text-primary">{formatInt(outbound)}</span>
        </span>
        {over > 0 ? (
          <span className="font-semibold text-text-primary">
            <span className="kpi-number">+{formatInt(over)}</span> acima da meta
          </span>
        ) : null}
      </div>
    </div>
  );
}
