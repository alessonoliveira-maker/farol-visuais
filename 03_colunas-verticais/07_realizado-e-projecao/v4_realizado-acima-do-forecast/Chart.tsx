import { Filter } from 'lucide-react';
import { useId, type ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatDate, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { currentMonth as defaultCurrentMonth, data as defaultData, type MonthlyForecastRow } from './data';

/** Receita reconhecida por mês, com os três casos limite do trio realizado, previsto e meta. */
export interface ForecastEdgeCasesProps {
  readonly data?: readonly MonthlyForecastRow[];
  readonly currentMonth?: string;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Card ≈ 574 × 234 px de corpo; a legenda (realizado, previsto restante, meta) toma a linha de
 * cima e deixa ≈ 574 × 210 px para o gráfico. Margem de topo generosa: o mês de julho fecha a
 * 560 mil de um teto de 600 mil (EIX-4 só reserva uma grade acima, ≈ 12 px de folga sobre a
 * própria coluna), e ali o rótulo de valor (6 px acima) e a nota "previsão desatualizada"
 * (26 px acima) empilham na mesma coluna: sem os 44 px de margem, a nota nasce fora da área do
 * SVG.
 */
const MARGIN = { top: 44, right: 8, bottom: 16, left: 0 } as const;
const VALUE_AXIS_WIDTH = 48;
const BAR_CATEGORY_GAP = '30%';
/**
 * ESP-6, série empilhada única, 5 categorias: disponível ≈ 574 − 48 − 8 = 518; passo ≈ 518 / 5 ≈
 * 103,6; espessura ≈ 103,6 × (1 − 2 × 0,30) ≈ 41,4 px, acima do teto de 24 px em cartão (ESP-2):
 * o teto vence.
 */
const BAR_MAX = 24;
const TICK_STEP = 200_000;
const VALUE_LABEL_GAP = 6;
/** 26 px de âncora: 20 px acima da âncora do valor (6 px), folga medida para textos de 11 e
 * 12 px não colidirem quando os dois aparecem juntos na mesma coluna (ROT-2). */
const NOTE_GAP = 26;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface Row extends MonthlyForecastRow {
  readonly realizadoValue: number;
  readonly restante: number;
  readonly semLeitura: boolean;
  readonly note: string;
  readonly label: string;
}

interface ShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: Row;
}

interface GhostShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly payload?: MonthlyForecastRow;
}

interface TextLabelProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly width?: number | string;
  readonly value?: unknown;
}

function niceCeiling(max: number, step: number): number {
  return Math.max(step, Math.ceil(max / step) * step);
}

export default function ForecastEdgeCases({ data = defaultData, currentMonth = defaultCurrentMonth, height, className }: ForecastEdgeCasesProps) {
  const animate = useAnimateOnce();
  const patternId = useId();
  const style = height === undefined ? undefined : { height };
  const rows = [...data];

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita reconhecida nem previsão para o período.</span>
      </div>
    );
  }

  const withCases: readonly Row[] = rows.map((row) => {
    const semLeitura = row.realizado === null && row.forecast === null;
    const realizadoValue = row.realizado ?? 0;
    const stale = row.forecast !== null && row.realizado !== null && row.realizado > row.forecast;
    const restante = row.forecast === null ? 0 : Math.max(0, row.forecast - realizadoValue);
    // A data completa vive só na frase acessível (COLISAO-TEXTO: "sem leitura ainda em
    // 01/05/2026", centrado na primeira coluna, encostava no tique do eixo).
    const note = semLeitura ? 'sem leitura ainda' : stale ? 'previsão desatualizada' : row.meta === null ? 'sem meta cadastrada' : '';
    const label = !semLeitura && row.realizado !== null ? formatCurrencyCompact(row.realizado) : '';
    return { ...row, label, note, realizadoValue, restante, semLeitura };
  });

  const withMeta = withCases.filter((row) => row.meta !== null).length;
  const withForecast = withCases.filter((row) => row.forecast !== null && !row.semLeitura).length;
  const onlyRealizado = withCases.filter((row) => row.forecast === null && !row.semLeitura).length;
  const semLeituraRow = withCases.find((row) => row.semLeitura);
  const ceiling = niceCeiling(Math.max(...withCases.map((row) => Math.max(row.realizadoValue + row.restante, row.meta ?? 0))), TICK_STEP);
  const ticks = Array.from({ length: 4 }, (_, i) => (ceiling / 3) * i);

  const summary = [
    `Gráfico de colunas com a receita reconhecida de ${String(rows.length)} meses.`,
    `${String(withMeta)} meses têm meta cadastrada, ${String(withForecast)} têm forecast em aberto e ${String(onlyRealizado)} só têm realizado fechado.`,
    semLeituraRow ? `${formatMonthShort(semLeituraRow.month)} ainda não tem leitura até ${formatDate(`${semLeituraRow.month}-01`)}.` : '',
    withCases.find((row) => row.note === 'previsão desatualizada') ? 'Um mês já fechou acima do forecast declarado.' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderColumn = ({ x = 0, y = 0, width = 0, height: barHeight = 0, payload }: ShapeProps): ReactElement | null => {
    if (!payload) return null;
    if (payload.semLeitura) {
      const baseline = y + barHeight;
      return <line stroke="var(--text-muted)" strokeWidth={2} x1={x + width * 0.2} x2={x + width * 0.8} y1={baseline} y2={baseline} />;
    }
    return <rect fill="var(--chart-1)" height={Math.max(barHeight, 1)} rx={2} width={width} x={x} y={y} />;
  };

  const renderRestante = ({ x = 0, y = 0, width = 0, height: barHeight = 0, payload }: ShapeProps): ReactElement | null => {
    if (!payload || payload.restante <= 0) return null;
    return <rect fill={`url(#${patternId})`} height={Math.max(barHeight, 1)} rx={2} stroke="var(--chart-1)" strokeWidth={1} width={width} x={x} y={y} />;
  };

  const renderMetaTick = ({ x = 0, y = 0, width = 0, payload }: GhostShapeProps): ReactElement | null => {
    if (!payload || payload.meta === null) return null;
    return (
      <g>
        <line stroke="var(--surface-raised)" strokeWidth={4} x1={x} x2={x + width} y1={y} y2={y} />
        <line stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1.5} x1={x} x2={x + width} y1={y} y2={y} />
      </g>
    );
  };

  const renderValueLabel = ({ x, y, width, value }: TextLabelProps): ReactElement | null => {
    if (!value) return null;
    return (
      <text className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="middle" x={Number(x) + Number(width) / 2} y={Number(y) - VALUE_LABEL_GAP}>
        {String(value)}
      </text>
    );
  };

  const renderNote = ({ x, y, width, value }: TextLabelProps): ReactElement | null => {
    if (!value) return null;
    const isWarning = String(value) === 'previsão desatualizada';
    return (
      <text
        className="font-sans"
        fill={isWarning ? 'var(--warning)' : 'var(--text-muted)'}
        fontSize={11}
        textAnchor="middle"
        x={Number(x) + Number(width) / 2}
        y={Number(y) - NOTE_GAP}
      >
        {String(value)}
      </text>
    );
  };

  const renderTick = ({ x = 0, y = 0, payload }: { readonly x?: number | string; readonly y?: number | string; readonly payload?: { readonly value?: unknown } }): ReactElement => {
    const isCurrent = payload?.value === currentMonth;
    return (
      <text className="font-sans" fill={isCurrent ? 'var(--chart-1)' : 'var(--text-muted)'} fontSize={11} fontWeight={isCurrent ? 700 : 400} textAnchor="middle" x={x} y={Number(y) + 12}>
        {formatMonthShort(String(payload?.value ?? ''))}
      </text>
    );
  };

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const month = typeof props.label === 'string' ? props.label : '';
    const row = withCases.find((entry) => entry.month === month);
    const [first] = props.payload ?? [];
    if (!props.active || !first || !row) return null;
    const entries = row.semLeitura
      ? [{ ...first, color: 'var(--text-muted)', name: 'Sem leitura ainda', value: 0 }]
      : [
          { ...first, color: 'var(--chart-1)', name: 'Realizado', value: row.realizadoValue },
          ...(row.forecast === null ? [] : [{ ...first, color: 'var(--chart-1)', name: 'Previsto restante', value: row.restante }]),
          ...(row.meta === null ? [] : [{ ...first, color: 'var(--text-muted)', name: 'Meta', value: row.meta }]),
        ];
    return <ChartTooltip active={props.active} label={month} labelFormat="month" payload={entries} valueFormat="currencyCompact" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-1 flex shrink-0 items-center gap-3 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 shrink-0 rounded-[2px] bg-chart-1" />
          realizado
        </span>
        <span className="flex items-center gap-1.5">
          <svg aria-hidden className="size-3 shrink-0" viewBox="0 0 12 12">
            <rect fill="none" height={11} rx={2} stroke="var(--chart-1)" strokeWidth={1} width={11} x={0.5} y={0.5} />
            <line stroke="var(--chart-1)" strokeOpacity={0.55} strokeWidth={1} x1={2} x2={5} y1={11} y2={0} />
            <line stroke="var(--chart-1)" strokeOpacity={0.55} strokeWidth={1} x1={7} x2={10} y1={11} y2={0} />
          </svg>
          previsto restante
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-0 w-3 shrink-0 border-t border-dashed border-line-strong" />
          meta
        </span>
      </div>
      <div className="min-h-0 flex-1">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={withCases} margin={MARGIN}>
          <defs>
            <pattern height={6} id={patternId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={6}>
              <rect fill="var(--surface-raised)" height={6} width={6} />
              <line stroke="var(--chart-1)" strokeOpacity={0.55} strokeWidth={1.5} x1={0} x2={0} y1={0} y2={6} />
            </pattern>
          </defs>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" tick={renderTick} tickLine={false} xAxisId="cols" />
          <XAxis dataKey="month" hide xAxisId="meta" />
          <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, ceiling]} tickFormatter={formatCurrencyAxis} ticks={ticks} width={VALUE_AXIS_WIDTH} />
          <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
          <Bar dataKey="realizadoValue" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderColumn} stackId="month" xAxisId="cols">
            {/*
              O rótulo de valor sai do topo da pilha e fica preso ao segmento que ele descreve: o
              `label` só imprime `realizado`, então o `y` do LabelList precisa vir do próprio Bar
              "realizadoValue", não do "restante" que fica em cima. Presa ao "restante", a âncora
              nasce no topo da pilha inteira mesmo quando o rótulo só fala do realizado (era o caso
              de set/26: "R$ 310,0 mil" no topo de uma coluna que soma R$ 495,0 mil). Presa aqui, o
              rótulo nasce sempre no alto do próprio segmento realizado, dentro ou no topo da
              coluna conforme o caso, nunca acima de um valor que ele não nomeia.
            */}
            <LabelList content={renderValueLabel} dataKey="label" />
          </Bar>
          <Bar dataKey="restante" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderRestante} stackId="month" xAxisId="cols">
            <LabelList content={renderNote} dataKey="note" />
          </Bar>
          <Bar dataKey="meta" isAnimationActive={false} maxBarSize={BAR_MAX} shape={renderMetaTick} xAxisId="meta" />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
