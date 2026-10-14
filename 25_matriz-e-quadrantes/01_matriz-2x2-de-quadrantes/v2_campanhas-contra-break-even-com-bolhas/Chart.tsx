import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import {
  formatCurrency,
  formatCurrencyAxis,
  formatCurrencyCompact,
  formatInt,
  formatPercent,
  formatRateWithVolume,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  breakEvenCpl as defaultBreakEven,
  data as defaultData,
  qualificationGoal as defaultGoal,
  type CampaignMonth,
} from './data';

/**
 * Matriz 2x2 de campanhas pelo custo por lead e pela taxa de qualificação, com o investimento no
 * tamanho da bolha: mostra quais campanhas pagam o lead abaixo do break-even e batem a meta, e
 * quanto do dinheiro do mês está em cada região.
 */
export interface CampaignQuadrantsProps {
  readonly data?: readonly CampaignMonth[];
  /** CPL máximo que ainda se paga, em reais por lead. Premissa, desenhada tracejada. */
  readonly breakEvenCpl?: number;
  /** Meta de taxa de qualificação, em fração. */
  readonly qualificationGoal?: number;
  readonly height?: number;
  readonly className?: string;
}

type Region = 'escalar' | 'renegociar' | 'barato' | 'pausar';

interface Point {
  readonly id: string;
  readonly name: string;
  readonly cpl: number;
  readonly taxa: number;
  readonly investimento: number;
  readonly leads: number;
  readonly qualificados: number;
  readonly region: Region;
}

interface RegionSummary {
  readonly count: number;
  readonly investimento: number;
  readonly leads: number;
  readonly qualificados: number;
}

const MARGIN = { top: 36, right: 96, bottom: 20, left: 8 } as const;
const DOMAIN_X: readonly [number, number] = [0, 8];
const TICKS_X = [0, 2, 4, 6, 8] as const;
const DOMAIN_Y: readonly [number, number] = [0, 0.4];
const TICKS_Y = [0, 0.1, 0.2, 0.3, 0.4] as const;
const Y_AXIS_WIDTH = 56;
const X_AXIS_HEIGHT = 24;
/** Raio da maior bolha. A área é proporcional ao investimento, com o domínio a partir de zero (GEO-3). */
const MAX_RADIUS = 20;
const MAX_AREA = Math.PI * MAX_RADIUS * MAX_RADIUS;
/** Degraus da régua de tamanho, em fração do maior investimento do recorte: o último é o próprio máximo. */
const SIZE_STEPS = [0.25, 0.5, 1] as const;
const ACTION_TINT = 0.07;
const OTHER_TINT = 0.04;
const TEXT_SIZE = 11;
/** Respiro dos blocos de resumo contra a borda do plano, em px. */
const BLOCK_INSET = 8;
/** Posição da coluna de rótulos das bolhas de Escalar, em fração da largura do plano, e distância mínima entre rótulos, em px. */
const LABEL_COLUMN = 0.2;
const LABEL_GAP = 12;
/** Piso da coluna de rótulos, em px abaixo do topo do plano: logo abaixo do bloco de resumo de Escalar. */
const COLUMN_TOP = 66;
/** Halo na cor do cartão para os blocos de resumo sobre a grade (ROT-7). */
const HALO = '0 0 3px var(--surface-raised), 0 0 3px var(--surface-raised), 0 0 6px var(--surface-raised)';

/** Participações em pontos percentuais inteiros que somam 100, pelo método do maior resto (NUM-2). */
function sharesByLargestRemainder(values: Record<Region, number>, total: number): Record<Region, number | null> {
  const keys = Object.keys(values) as Region[];
  if (total <= 0) return { escalar: null, renegociar: null, barato: null, pausar: null };
  const exact = keys.map((key) => ({ key, raw: (values[key] / total) * 100 }));
  const result: Record<Region, number | null> = { escalar: 0, renegociar: 0, barato: 0, pausar: 0 };
  let used = 0;
  for (const item of exact) {
    result[item.key] = Math.floor(item.raw);
    used += Math.floor(item.raw);
  }
  const order = [...exact].sort((a, b) => b.raw - Math.floor(b.raw) - (a.raw - Math.floor(a.raw)));
  for (let index = 0; index < 100 - used; index += 1) {
    const item = order[index % order.length];
    if (item) result[item.key] = (result[item.key] ?? 0) + 1;
  }
  return result;
}

const REGION_TITLE: Record<Region, string> = {
  escalar: 'Escalar',
  renegociar: 'Renegociar o custo',
  barato: 'Volume barato que não vira nada',
  pausar: 'Pausar',
};

function regionOf(cpl: number, taxa: number, breakEven: number, goal: number): Region {
  if (cpl < breakEven) return taxa >= goal ? 'escalar' : 'barato';
  return taxa >= goal ? 'renegociar' : 'pausar';
}

/**
 * Texto dos cortes e dos eixos, numa camada só dentro do ScatterChart (usa usePlotArea e as escalas).
 * O `label` nativo da ReferenceLine nasceria dentro da área, sobre a nuvem (REC-4); aqui os nomes
 * vivem nas margens reservadas.
 */
function PlaneLayer({
  breakEven,
  goal,
  focus,
  maxInvestimento,
}: {
  readonly breakEven: number;
  readonly goal: number;
  readonly focus: readonly Point[];
  readonly maxInvestimento: number;
}) {
  const area = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!area || !xScale || !yScale) return null;
  const cx = xScale(breakEven);
  const cy = yScale(goal);
  if (cx === undefined || cy === undefined) return null;
  const right = area.x + area.width;
  const bottom = area.y + area.height;

  /** Rótulos diretos das bolhas de Escalar em coluna à esquerda, ordenados por altura, com antidescolisão vertical e fio fino até a bolha. */
  const all = focus
    .map((point) => ({ point, px: xScale(point.cpl), py: yScale(point.taxa) }))
    .filter((item): item is { point: Point; px: number; py: number } => item.px !== undefined && item.py !== undefined)
    .sort((a, b) => a.py - b.py);
  /** Bolhas acima do piso da coluna (sob o bloco de resumo) levam o nome ao lado, sem fio. */
  const beside = all.filter((item) => item.py - area.y < COLUMN_TOP);
  const placed = all.filter((item) => item.py - area.y >= COLUMN_TOP);
  const labelX = area.x + area.width * LABEL_COLUMN;
  const labelYs: number[] = [];
  placed.forEach((item, index) => {
    const previous = index === 0 ? Number.NEGATIVE_INFINITY : (labelYs[index - 1] ?? 0);
    labelYs.push(Math.max(item.py, previous + LABEL_GAP, area.y + COLUMN_TOP));
  });
  /** Se a coluna estourou o plano por baixo, sobe tudo de volta, de baixo para cima. */
  for (let index = labelYs.length - 1; index >= 0; index -= 1) {
    const limit = index === labelYs.length - 1 ? cy - 6 : (labelYs[index + 1] ?? 0) - LABEL_GAP;
    labelYs[index] = Math.min(labelYs[index] ?? 0, limit);
  }

  return (
    <g>
      {beside.map((item) => (
        <text
          className="font-display"
          dominantBaseline="central"
          fill="var(--text-primary)"
          fontSize={TEXT_SIZE}
          key={item.point.id}
          paintOrder="stroke"
          stroke="var(--surface-raised)"
          strokeLinejoin="round"
          strokeWidth={3}
          y={item.py}
        >
          {/* Duas linhas, quebradas na vírgula, para o rótulo não cruzar o corte do break-even. */}
          {item.point.name.split(', ').map((line, lineIndex, lines) => (
            <tspan
              dy={lineIndex === 0 ? -((lines.length - 1) * LABEL_GAP) / 2 : LABEL_GAP}
              key={line}
              x={item.px + MAX_RADIUS * Math.sqrt(item.point.investimento / maxInvestimento) + 5}
            >
              {lineIndex < lines.length - 1 ? `${line},` : line}
            </tspan>
          ))}
        </text>
      ))}
      {placed.map((item, index) => {
        const ly = labelYs[index] ?? item.py;
        const radius = MAX_RADIUS * Math.sqrt(item.point.investimento / maxInvestimento);
        const dx = item.px - (labelX + 4);
        const dy = item.py - ly;
        const length = Math.hypot(dx, dy) || 1;
        return (
          <g key={item.point.id}>
            {length > radius + 2 ? (
              <line
                stroke="var(--line-strong)"
                strokeWidth={1}
                x1={labelX + 4}
                x2={item.px - (dx / length) * radius}
                y1={ly}
                y2={item.py - (dy / length) * radius}
              />
            ) : null}
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-primary)"
              fontSize={TEXT_SIZE}
              paintOrder="stroke"
              stroke="var(--surface-raised)"
              strokeLinejoin="round"
              strokeWidth={3}
              textAnchor="end"
              x={labelX}
              y={ly}
            >
              {item.point.name}
            </text>
          </g>
        );
      })}
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={MARGIN.left} y={12}>
        Taxa de qualificação dos leads
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="end" x={right} y={bottom + X_AXIS_HEIGHT + 14}>
        Custo por lead, em reais (CPL)
      </text>
      <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} textAnchor="middle" x={cx} y={area.y - 8}>
        {`break-even ${formatCurrency(breakEven)} · PREMISSA`}
      </text>
      <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} x={right + 6} y={cy - 2}>
        {`meta ${formatPercent(goal)}`}
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={right + 6} y={cy + 12}>
        META
      </text>
    </g>
  );
}

/**
 * Bloco de resumo de uma região, em HTML sobre o gráfico, encostado no canto externo dela. A taxa é
 * recalculada sobre os totais da região (qualificados sobre leads), nunca a média das taxas.
 */
function RegionBlock({
  region,
  summary,
  share,
}: {
  readonly region: Region;
  readonly summary: RegionSummary;
  /** Participação em pontos percentuais inteiros, já fechada em 100 entre as regiões. */
  readonly share: number | null;
}) {
  const left = region === 'escalar' || region === 'barato';
  const top = region === 'escalar' || region === 'renegociar';
  const offsetX = left ? MARGIN.left + Y_AXIS_WIDTH + BLOCK_INSET : MARGIN.right + BLOCK_INSET;
  const offsetY = top ? MARGIN.top + BLOCK_INSET : MARGIN.bottom + X_AXIS_HEIGHT + BLOCK_INSET;
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute z-10 flex max-w-[30%] flex-col gap-0.5 tabular-nums', left ? 'items-start text-left' : 'items-end text-right')}
      style={{
        [left ? 'left' : 'right']: offsetX,
        [top ? 'top' : 'bottom']: offsetY,
        textShadow: HALO,
      }}
    >
      <p className="font-display text-xs font-semibold text-text-primary">{REGION_TITLE[region]}</p>
      <p className="text-[0.6875rem] text-text-secondary">
        {`${formatInt(summary.count)} ${summary.count === 1 ? 'campanha' : 'campanhas'} · ${formatCurrencyCompact(summary.investimento)}`}
        {share === null ? '' : ` (${formatInt(share)}%)`}
      </p>
      <p className="text-[0.6875rem] text-text-muted">
        {summary.leads > 0 ? `Qualificação ${formatRateWithVolume(summary.qualificados, summary.leads)}` : 'Sem leads na região'}
      </p>
    </div>
  );
}

export default function CampaignQuadrants({
  data = defaultData,
  breakEvenCpl = defaultBreakEven,
  qualificationGoal = defaultGoal,
  height,
  className,
}: CampaignQuadrantsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const points: Point[] = [];
  let semLeads = 0;
  let investimentoSemLeads = 0;
  for (const row of data) {
    if (row.leads <= 0) {
      semLeads += 1;
      investimentoSemLeads += row.investimentoReais;
      continue;
    }
    const cpl = row.investimentoReais / row.leads;
    const taxa = row.qualificados / row.leads;
    points.push({
      id: row.id,
      name: row.name,
      cpl,
      taxa,
      investimento: row.investimentoReais,
      leads: row.leads,
      qualificados: row.qualificados,
      region: regionOf(cpl, taxa, breakEvenCpl, qualificationGoal),
    });
  }

  if (points.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte gerou lead, então não há custo por lead para classificar.</span>
      </div>
    );
  }

  const empty: RegionSummary = { count: 0, investimento: 0, leads: 0, qualificados: 0 };
  const summaries: Record<Region, RegionSummary> = { escalar: empty, renegociar: empty, barato: empty, pausar: empty };
  for (const point of points) {
    const before = summaries[point.region];
    summaries[point.region] = {
      count: before.count + 1,
      investimento: before.investimento + point.investimento,
      leads: before.leads + point.leads,
      qualificados: before.qualificados + point.qualificados,
    };
  }
  const totalInvestimento = points.reduce((soma, point) => soma + point.investimento, 0);
  const shares = sharesByLargestRemainder(
    {
      escalar: summaries.escalar.investimento,
      renegociar: summaries.renegociar.investimento,
      barato: summaries.barato.investimento,
      pausar: summaries.pausar.investimento,
    },
    totalInvestimento,
  );
  /** O maior investimento do recorte é o teto do ZAxis e o último degrau da régua: nunca uma constante à mão. */
  const maxInvestimento = Math.max(...points.map((point) => point.investimento));
  /** Maiores desenhadas antes: a bolha pequena fica por cima da grande em vez de debaixo dela. */
  const bySize = [...points].sort((a, b) => b.investimento - a.investimento);
  const focus = bySize.filter((point) => point.region === 'escalar');
  const rest = bySize.filter((point) => point.region !== 'escalar');

  const summary =
    `Gráfico de bolhas com ${formatInt(points.length)} campanhas pelo custo por lead e pela qualificação, cortado no break-even de ` +
    `${formatCurrency(breakEvenCpl)} e na meta de ${formatPercent(qualificationGoal, 0)}. ${formatInt(summaries.escalar.count)} ficam na região de escalar, ` +
    `com ${formatCurrencyCompact(summaries.escalar.investimento)} investidos.`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'investimento', name: 'Investimento', value: formatCurrencyCompact(point.investimento) },
      { dataKey: 'cpl', name: 'Custo por lead', value: formatCurrency(point.cpl) },
      { dataKey: 'taxa', name: 'Qualificação', value: formatRateWithVolume(point.qualificados, point.leads) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  const [x0, x1] = DOMAIN_X;
  const [y0, y1] = DOMAIN_Y;
  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul aria-hidden className="mb-1 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 text-[0.6875rem] tabular-nums text-text-secondary">
        <li className="text-text-muted">Tamanho da bolha: investimento</li>
        {SIZE_STEPS.map((step) => {
          const radius = MAX_RADIUS * Math.sqrt(step);
          return (
            <li className="flex items-center gap-1.5" key={step}>
              <svg className="shrink-0" height={2 * radius + 2} viewBox={`0 0 ${2 * radius + 2} ${2 * radius + 2}`} width={2 * radius + 2}>
                <circle cx={radius + 1} cy={radius + 1} fill="none" r={radius} stroke="var(--text-muted)" strokeWidth={1.5} />
              </svg>
              <span>{formatCurrencyCompact(maxInvestimento * step)}</span>
            </li>
          );
        })}
        <li className="text-text-muted">Classificada pelo centro da bolha</li>
      </ul>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        <span className="tabular-nums">{formatInt(summaries.escalar.count)}</span> de <span className="tabular-nums">{formatInt(points.length)}</span>{' '}
        campanhas pagam o lead abaixo do break-even e batem a meta
      </p>
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="cpl"
              domain={[...DOMAIN_X]}
              height={X_AXIS_HEIGHT}
              name="Custo por lead"
              tickFormatter={formatCurrencyAxis}
              tickMargin={8}
              ticks={[...TICKS_X]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="taxa"
              domain={[...DOMAIN_Y]}
              name="Qualificação"
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            {/* Domínio a partir de zero e faixa de área de zero ao máximo: a área da bolha é proporcional ao investimento, sem raio mínimo. */}
            <ZAxis dataKey="investimento" domain={[0, maxInvestimento]} name="Investimento" range={[0, MAX_AREA]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            {/* As áreas leem as constantes do domínio: com dataMax o filtro encolheria o fundo em silêncio (ifOverflow discard). */}
            {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
            <ReferenceArea fill="var(--text-muted)" fillOpacity={OTHER_TINT} ifOverflow="extendDomain" stroke="none" x1={breakEvenCpl} x2={x1} y1={y0} y2={qualificationGoal} />
            {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
            <ReferenceArea fill="var(--text-muted)" fillOpacity={OTHER_TINT} ifOverflow="extendDomain" stroke="none" x1={breakEvenCpl} x2={x1} y1={qualificationGoal} y2={y1} />
            {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
            <ReferenceArea fill="var(--text-muted)" fillOpacity={OTHER_TINT} ifOverflow="extendDomain" stroke="none" x1={x0} x2={breakEvenCpl} y1={y0} y2={qualificationGoal} />
            {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
            <ReferenceArea fill="var(--chart-1)" fillOpacity={ACTION_TINT} ifOverflow="extendDomain" stroke="none" x1={x0} x2={breakEvenCpl} y1={qualificationGoal} y2={y1} />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" strokeDasharray="4 4" strokeWidth={1.5} x={breakEvenCpl} />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" strokeWidth={1.5} y={qualificationGoal} />
            <Scatter data={rest} fill="var(--text-muted)" isAnimationActive={animate} name="Demais regiões" stroke="var(--surface-raised)" strokeWidth={1.5} />
            <Scatter data={focus} fill="var(--chart-1)" isAnimationActive={animate} name="Escalar" stroke="var(--surface-raised)" strokeWidth={1.5} />
            <PlaneLayer breakEven={breakEvenCpl} focus={focus} goal={qualificationGoal} maxInvestimento={maxInvestimento} />
          </ScatterChart>
        </ResponsiveContainer>
        {(Object.keys(summaries) as Region[]).map((region) => (
          <RegionBlock key={region} region={region} share={shares[region]} summary={summaries[region]} />
        ))}
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {semLeads === 0
          ? `${formatInt(points.length)} campanhas no plano; participações sobre ${formatCurrencyCompact(totalInvestimento)} investidos`
          : `${formatInt(points.length)} de ${formatInt(data.length)} no plano; fora, ${formatInt(semLeads)} sem lead gerado (${formatCurrencyCompact(investimentoSemLeads)} gastos). Participações sobre ${formatCurrencyCompact(totalInvestimento)} do plano`}
      </p>
    </div>
  );
}
