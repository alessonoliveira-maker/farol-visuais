import { Filter } from 'lucide-react';
import { useState } from 'react';
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
import { formatCurrencyAxis, formatCurrencyCompact, formatDays, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  daysCut as defaultDaysCut,
  highlightId as defaultHighlightId,
  valueCut as defaultValueCut,
  type ForecastOpportunity,
} from './data';

/**
 * Matriz 2x2 do forecast por valor e dias parada, ligada a uma lista das mesmas oportunidades: o
 * clique na região filtra a lista e o cursor sobre uma linha acende o ponto dela no plano.
 */
export interface ForecastQuadrantsProps {
  readonly data?: readonly ForecastOpportunity[];
  /** Valor de corte, em reais. Premissa comercial. */
  readonly valueCut?: number;
  /** Dias de corte. Premissa comercial. */
  readonly daysCut?: number;
  /** Oportunidade acesa na abertura, como se o cursor estivesse sobre a linha dela. */
  readonly highlightId?: string | null;
  readonly height?: number;
  readonly className?: string;
}

type Region = 'critica' | 'proteger' | 'revisar' | 'manter' | 'fronteira';

interface Point {
  readonly id: string;
  readonly name: string;
  readonly valor: number;
  readonly dias: number;
  readonly region: Region;
}

const MARGIN = { top: 36, right: 88, bottom: 20, left: 8 } as const;
const DOMAIN_X: readonly [number, number] = [0, 90];
const TICKS_X = [0, 30, 60, 90] as const;
const DOMAIN_Y: readonly [number, number] = [0, 400_000];
const TICKS_Y = [0, 100_000, 200_000, 300_000, 400_000] as const;
/** Acima da faixa de 48 a 64 da EIX-6, por medição: com 64 o tique `R$ 400 mil` quebra em duas linhas (REC-2). */
const Y_AXIS_WIDTH = 76;
const X_AXIS_HEIGHT = 24;
const POINT_RADIUS = 4;
const Z_RANGE: readonly [number, number] = [Math.PI * POINT_RADIUS * POINT_RADIUS, Math.PI * POINT_RADIUS * POINT_RADIUS];
const RING_RADIUS = 8;
/** Linhas da lista antes de "ver todas": o resto só é desenhado quando pedido, e a lista passa a rolar. */
const LIST_ROWS_COLLAPSED = 7;
/** Faixa de indiferença em torno de cada corte, em fração do próprio corte: quem cai nela não é classificado. */
const BAND = 0.08;
const ACTION_TINT = 0.07;
const OTHER_TINT = 0.04;
const TEXT_SIZE = 11;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

const REGION_TITLE: Record<Region, string> = {
  critica: 'Destravar agora',
  proteger: 'Proteger o ritmo',
  revisar: 'Revisar ou arquivar',
  manter: 'Manter o ritmo',
  fronteira: 'Na fronteira',
};
/** Ordem das regiões nos botões e na lista: a crítica primeiro, a fronteira por último. */
const REGION_ORDER: readonly Region[] = ['critica', 'proteger', 'revisar', 'manter', 'fronteira'];

function classify(valor: number, dias: number, valueCut: number, daysCut: number): Region {
  if (Math.abs(valor - valueCut) <= BAND * valueCut || Math.abs(dias - daysCut) <= BAND * daysCut) return 'fronteira';
  if (valor > valueCut) return dias > daysCut ? 'critica' : 'proteger';
  return dias > daysCut ? 'revisar' : 'manter';
}

/** Anel de destaque: acende o ponto que a lista aponta sem redesenhar a nuvem. */
function renderRing(props: { readonly cx?: number; readonly cy?: number }) {
  if (props.cx === undefined || props.cy === undefined) return <g />;
  return <circle cx={props.cx} cy={props.cy} fill="none" r={RING_RADIUS} stroke="var(--text-primary)" strokeWidth={2} />;
}

/** Ponto oco: fronteira, ou região fora do filtro. Forma própria porque a cor sozinha não distingue (ACE-2). */
function renderHollow(props: { readonly cx?: number; readonly cy?: number }) {
  if (props.cx === undefined || props.cy === undefined) return <g />;
  return <circle cx={props.cx} cy={props.cy} fill="var(--surface-raised)" r={POINT_RADIUS} stroke="var(--text-muted)" strokeWidth={1.5} />;
}

interface PlaneLayerProps {
  readonly valueCut: number;
  readonly daysCut: number;
  readonly counts: Record<Region, number>;
}

/**
 * Texto do plano numa camada só dentro do ScatterChart (usa usePlotArea e as escalas): títulos de ação
 * nos cantos, nomes dos cortes nas margens e dos eixos. O `label` nativo da ReferenceLine cairia
 * dentro da área, sobre a nuvem (REC-4).
 */
function PlaneLayer({ valueCut, daysCut, counts }: PlaneLayerProps) {
  const area = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!area || !xScale || !yScale) return null;
  const cx = xScale(daysCut);
  const cy = yScale(valueCut);
  if (cx === undefined || cy === undefined) return null;
  const right = area.x + area.width;
  const bottom = area.y + area.height;
  const corners: readonly { readonly region: Region; readonly x: number; readonly y: number; readonly anchor: 'start' | 'end' }[] = [
    { region: 'proteger', x: area.x + 8, y: area.y + 16, anchor: 'start' },
    { region: 'critica', x: right - 8, y: area.y + 16, anchor: 'end' },
    { region: 'manter', x: area.x + 8, y: bottom - 8, anchor: 'start' },
    { region: 'revisar', x: right - 8, y: bottom - 8, anchor: 'end' },
  ];

  return (
    <g>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={MARGIN.left} y={12}>
        Valor da oportunidade
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="end" x={right} y={bottom + X_AXIS_HEIGHT + 14}>
        Dias desde o último movimento
      </text>
      <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} textAnchor="middle" x={cx} y={area.y - 8}>
        {`${formatDays(daysCut)} parada · PREMISSA`}
      </text>
      <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} x={right + 6} y={cy - 2}>
        {formatCurrencyCompact(valueCut)}
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={right + 6} y={cy + 12}>
        PREMISSA
      </text>
      {corners.map((corner) => (
        <text
          className="font-display"
          fill={corner.region === 'critica' ? 'var(--text-primary)' : 'var(--text-secondary)'}
          fontSize={TEXT_SIZE}
          fontWeight={600}
          key={corner.region}
          style={HALO}
          textAnchor={corner.anchor}
          x={corner.x}
          y={corner.y}
        >
          {`${REGION_TITLE[corner.region]} · ${formatInt(counts[corner.region])}`}
        </text>
      ))}
    </g>
  );
}

interface SidePanelProps {
  readonly points: readonly Point[];
  readonly semData: readonly ForecastOpportunity[];
  readonly counts: Record<Region, number>;
  readonly criticalValue: number;
  readonly totalValue: number;
  readonly selected: Region | null;
  readonly hoverId: string | null;
  readonly onSelect: (region: Region | null) => void;
  readonly onHover: (id: string | null) => void;
}

/** Coluna da direita: bloco da região crítica, botões de região e a lista que o clique filtra. */
function SidePanel({ points, semData, counts, criticalValue, totalValue, selected, hoverId, onSelect, onHover }: SidePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const share = totalValue > 0 ? criticalValue / totalValue : null;
  const rows = [...points]
    .filter((point) => selected === null || point.region === selected)
    .sort((a, b) => REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region) || b.valor - a.valor);
  const showSemData = selected === null && semData.length > 0;
  const hidden = rows.length - LIST_ROWS_COLLAPSED;
  const collapsible = !expanded && hidden > 0;
  const visibleRows = collapsible ? rows.slice(0, LIST_ROWS_COLLAPSED) : rows;

  return (
    <div className="flex min-h-0 w-[19.5rem] shrink-0 flex-col gap-3">
      <div className="shrink-0 tabular-nums">
        <p className="font-display text-xs font-semibold text-text-primary">{REGION_TITLE.critica}</p>
        <p className="text-xs text-text-secondary">
          {`${formatInt(counts.critica)} oportunidades · ${formatCurrencyCompact(criticalValue)}`}
        </p>
        <p className="text-[0.6875rem] text-text-muted">
          {share === null ? 'Pipeline vivo sem valor' : `${formatPercent(share, 0)} dos ${formatCurrencyCompact(totalValue)} do pipeline vivo`}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-x-1 gap-y-0.5">
        {REGION_ORDER.map((region) => (
          <button
            aria-pressed={selected === region}
            className={cn(
              'rounded-md px-2 py-0.5 text-[0.6875rem] leading-4 tabular-nums',
              selected === region ? 'bg-surface-sunken font-semibold text-text-primary' : 'text-text-secondary',
            )}
            key={region}
            onClick={() => onSelect(selected === region ? null : region)}
            type="button"
          >
            {`${REGION_TITLE[region]} · ${formatInt(counts[region])}`}
          </button>
        ))}
      </div>
      <ul className={cn('min-h-0 flex-1 text-[0.6875rem] tabular-nums', expanded && 'overflow-y-auto')}>
        {visibleRows.map((point) => (
          <li
            className={cn(
              'flex items-baseline gap-2 rounded-md px-2 py-0.5',
              hoverId === point.id ? 'bg-surface-sunken text-text-primary' : 'text-text-secondary',
            )}
            key={point.id}
            onBlur={() => onHover(null)}
            onFocus={() => onHover(point.id)}
            onMouseEnter={() => onHover(point.id)}
            onMouseLeave={() => onHover(null)}
            tabIndex={0}
          >
            <span className={cn('min-w-0 flex-1', point.region === 'critica' && 'font-semibold text-text-primary')}>{point.name}</span>
            <span className="w-16 shrink-0 text-right">{formatCurrencyCompact(point.valor)}</span>
            <span className="w-14 shrink-0 text-right">{formatDays(point.dias)}</span>
          </li>
        ))}
        {collapsible ? (
          <li className="px-2 py-0.5">
            <button className="text-left text-text-muted" onClick={() => setExpanded(true)} type="button">
              {`Ver todas: mais ${formatInt(hidden)}${showSemData ? ` e ${formatInt(semData.length)} sem data, fora do plano` : ''}`}
            </button>
          </li>
        ) : null}
        {showSemData && !collapsible
          ? semData.map((row) => (
              <li className="flex items-baseline gap-2 px-2 py-0.5 text-text-muted" key={row.id}>
                <span className="min-w-0 flex-1">{row.name}</span>
                <span className="w-16 shrink-0 text-right">{formatCurrencyCompact(row.valorReais)}</span>
                <span className="w-14 shrink-0 rounded-md bg-surface-sunken px-1 text-center">sem data</span>
              </li>
            ))
          : null}
      </ul>
    </div>
  );
}

export default function ForecastQuadrants({
  data = defaultData,
  valueCut = defaultValueCut,
  daysCut = defaultDaysCut,
  highlightId = defaultHighlightId,
  height,
  className,
}: ForecastQuadrantsProps) {
  const animate = useAnimateOnce();
  const [selected, setSelected] = useState<Region | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(highlightId);
  const style = height === undefined ? undefined : { height };

  const points: Point[] = [];
  const semData: ForecastOpportunity[] = [];
  for (const row of data) {
    if (row.diasParada === null) {
      semData.push(row);
    } else {
      points.push({
        id: row.id,
        name: row.name,
        valor: row.valorReais,
        dias: row.diasParada,
        region: classify(row.valorReais, row.diasParada, valueCut, daysCut),
      });
    }
  }

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade aberta neste recorte, então não há forecast para classificar.</span>
      </div>
    );
  }

  const counts: Record<Region, number> = { critica: 0, proteger: 0, revisar: 0, manter: 0, fronteira: 0 };
  for (const point of points) counts[point.region] += 1;
  const criticalValue = points.filter((point) => point.region === 'critica').reduce((soma, point) => soma + point.valor, 0);
  /** Pipeline vivo: toda oportunidade aberta, com ou sem data de movimento. */
  const totalValue = data.reduce((soma, row) => soma + row.valorReais, 0);

  /** Neutro preenchido, crítica preenchida em destaque, e oco para a fronteira e para o que o filtro tirou. */
  const isHollow = (point: Point) => point.region === 'fronteira' || (selected !== null && point.region !== selected);
  const hollow = points.filter(isHollow);
  const filled = points.filter((point) => !isHollow(point));
  const critical = filled.filter((point) => point.region === 'critica');
  const neutral = filled.filter((point) => point.region !== 'critica');
  const lit = points.filter((point) => point.id === hoverId);
  const onPointEnter = (item: unknown) => {
    const id = (item as { readonly payload?: { readonly id?: string } }).payload?.id;
    if (id !== undefined) setHoverId(id);
  };

  const summary =
    `Gráfico de dispersão com ${formatInt(points.length)} oportunidades do forecast por valor e dias parada, cortado em ` +
    `${formatCurrencyCompact(valueCut)} e ${formatDays(daysCut)}. ${formatInt(counts.critica)} valem mais e estão paradas há mais tempo, ` +
    `somando ${formatCurrencyCompact(criticalValue)}. ${formatInt(semData.length)} não têm data de movimento.`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'valor', name: 'Valor', value: formatCurrencyCompact(point.valor) },
      { dataKey: 'dias', name: 'Parada há', value: formatDays(point.dias) },
      { dataKey: 'region', name: 'Região', value: REGION_TITLE[point.region] },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  const [x0, x1] = DOMAIN_X;
  const [y0, y1] = DOMAIN_Y;
  const bandX: readonly [number, number] = [daysCut * (1 - BAND), daysCut * (1 + BAND)];
  const bandY: readonly [number, number] = [valueCut * (1 - BAND), valueCut * (1 + BAND)];
  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        <span className="tabular-nums">{formatInt(counts.critica)}</span> de <span className="tabular-nums">{formatInt(data.length)}</span> oportunidades
        valem mais de {formatCurrencyCompact(valueCut)} e estão paradas há mais de {formatDays(daysCut)}, fora da faixa de {formatPercent(BAND, 0)} dos cortes
      </p>
      <div className="flex min-h-0 flex-1 gap-4">
        <div aria-hidden className="min-h-0 min-w-0 flex-1">
          <ResponsiveContainer height="100%" width="100%">
            <ScatterChart accessibilityLayer={false} margin={MARGIN}>
              <CartesianGrid stroke="var(--line-subtle)" />
              <XAxis
                {...AXIS_PROPS}
                axisLine={false}
                dataKey="dias"
                domain={[...DOMAIN_X]}
                height={X_AXIS_HEIGHT}
                name="Dias parada"
                tickFormatter={(value: number) => formatDays(value)}
                tickMargin={8}
                ticks={[...TICKS_X]}
                type="number"
              />
              <YAxis
                {...AXIS_PROPS}
                axisLine={false}
                dataKey="valor"
                domain={[...DOMAIN_Y]}
                name="Valor"
                tickFormatter={formatCurrencyAxis}
                tickMargin={8}
                ticks={[...TICKS_Y]}
                type="number"
                width={Y_AXIS_WIDTH}
              />
              <ZAxis range={[...Z_RANGE]} type="number" />
              <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
              {/* As áreas leem as constantes do domínio: com dataMax o filtro encolheria o fundo em silêncio (ifOverflow discard). */}
              {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
              <ReferenceArea fill="var(--text-muted)" fillOpacity={OTHER_TINT} ifOverflow="extendDomain" stroke="none" x1={x0} x2={daysCut} y1={y0} y2={valueCut} />
              {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
              <ReferenceArea fill="var(--text-muted)" fillOpacity={OTHER_TINT} ifOverflow="extendDomain" stroke="none" x1={x0} x2={daysCut} y1={valueCut} y2={y1} />
              {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
              <ReferenceArea fill="var(--text-muted)" fillOpacity={OTHER_TINT} ifOverflow="extendDomain" stroke="none" x1={daysCut} x2={x1} y1={y0} y2={valueCut} />
              {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
              <ReferenceArea fill="var(--chart-1)" fillOpacity={ACTION_TINT} ifOverflow="extendDomain" stroke="none" x1={daysCut} x2={x1} y1={valueCut} y2={y1} />
              {/* Faixa de indiferença: sunken e opaca, porque o overlay no claro é o branco do cartão (ANO-4). */}
              <ReferenceArea fill="var(--surface-sunken)" ifOverflow="extendDomain" stroke="none" x1={bandX[0]} x2={bandX[1]} y1={y0} y2={y1} />
              <ReferenceArea fill="var(--surface-sunken)" ifOverflow="extendDomain" stroke="none" x1={x0} x2={x1} y1={bandY[0]} y2={bandY[1]} />
              <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" strokeDasharray="4 4" strokeWidth={1.5} x={daysCut} />
              <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" strokeDasharray="4 4" strokeWidth={1.5} y={valueCut} />
              <Scatter data={hollow} isAnimationActive={animate} name="Fronteira ou fora do filtro" onMouseEnter={onPointEnter} shape={renderHollow} />
              <Scatter data={neutral} fill="var(--text-muted)" isAnimationActive={animate} name="Demais regiões" onMouseEnter={onPointEnter} shape="circle" />
              <Scatter data={critical} fill="var(--chart-1)" isAnimationActive={animate} name="Destravar agora" onMouseEnter={onPointEnter} shape="circle" />
              <Scatter data={lit} isAnimationActive={false} legendType="none" name="Destaque da lista" shape={renderRing} />
              <PlaneLayer counts={counts} daysCut={daysCut} valueCut={valueCut} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <SidePanel
          counts={counts}
          criticalValue={criticalValue}
          hoverId={hoverId}
          onHover={setHoverId}
          onSelect={setSelected}
          points={points}
          selected={selected}
          semData={semData}
          totalValue={totalValue}
        />
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`${formatInt(points.length)} de ${formatInt(data.length)} no plano; ${formatInt(semData.length)} sem data de movimento ficam só na lista. Faixa de ${formatPercent(BAND, 0)} em torno dos cortes: ${formatInt(counts.fronteira)} em ponto oco`}
      </p>
    </div>
  );
}
