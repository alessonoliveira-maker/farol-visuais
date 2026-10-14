import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, Cell, LabelList, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadOriginsData } from './data';

/**
 * Pizza com detalhamento de Outros (bar of pie): a pizza principal mostra as quatro maiores
 * origens de lead e uma fatia "Outros" em neutro; ao lado, uma barra horizontal abre a
 * composição de "Outros" em suas quatro origens menores, do maior para o menor. Dois conectores
 * em SVG, calculados a partir dos ângulos da fatia "Outros", ligam as duas bordas da fatia às
 * bordas do painel de detalhe, como no clássico bar of pie.
 */
export interface LeadOriginsBarOfPieProps {
  readonly data?: LeadOriginsData;
  readonly height?: number;
  readonly className?: string;
}

const PIE_SIZE = 200;
const PIE_CENTER = PIE_SIZE / 2;
const PIE_RADIUS = 90;
const PANEL_GAP = 24;
const PANEL_ANCHOR_X = PIE_SIZE + PANEL_GAP;
/** Cantos da caixa do painel de detalhe, mesma altura da caixa da pizza (0 a PIE_SIZE). */
const PANEL_TOP_Y = 0;
const PANEL_BOTTOM_Y = PIE_SIZE;
const RADIAN = Math.PI / 180;
/** Slots categóricos na ordem da COR-8 (1, 3, 6, 5): a cor segue o `slot` do dado, não a posição. */
const SLOT_COLORS = [CHART_SERIES_COLORS[0], CHART_SERIES_COLORS[2], CHART_SERIES_COLORS[5], CHART_SERIES_COLORS[4]] as const;
const OTHER_FILL = 'var(--line-strong)';
const CONNECTOR_STROKE = 'var(--text-muted)';
const VALUE_LABEL_GAP = 6;
const BAR_MAX = 16;
const NAME_AXIS_WIDTH = 78;
const MARGIN = { top: 6, right: 60, bottom: 6, left: 0 } as const;
/** Halo na cor do cartão: o rótulo continua legível sobre a marca ou sobre a linha do conector. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface Slice {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  readonly fill: string;
}

/**
 * Ponto a um raio dado, numa fração acumulada do total, na convenção de ângulo do Recharts
 * (0 grau é o 3 horas; o ângulo decresce no sentido horário conforme a fração acumulada cresce).
 * `startAngle` é o mesmo valor passado ao `Pie`, calculado por rodada a partir da fração de Outros.
 */
function pointAtFraction(startAngle: number, fraction: number, radius: number = PIE_RADIUS): { x: number; y: number } {
  const angleDeg = startAngle - 360 * fraction;
  const angleRad = -angleDeg * RADIAN;
  return { x: PIE_CENTER + radius * Math.cos(angleRad), y: PIE_CENTER + radius * Math.sin(angleRad) };
}

/** Percentual inteiro pelo maior resto, sempre somando 100 (NUM-2). */
function integerPercents(values: readonly number[]): readonly number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map((value) => Math.floor(value));
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  const result = [...floors];
  let missing = 100 - floors.reduce((sum, value) => sum + value, 0);
  for (const { index } of order) {
    if (missing <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    missing -= 1;
  }
  return result;
}

interface SliceLabelProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly midAngle?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly index?: number;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

export default function LeadOriginsBarOfPie({ data = defaultData, height, className }: LeadOriginsBarOfPieProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const detailRows = [...data.outrosDetail].sort((a, b) => b.leads - a.leads);
  const outrosTotal = detailRows.reduce((sum, row) => sum + row.leads, 0);
  const mainTotal = data.main.reduce((sum, row) => sum + row.leads, 0);
  const total = mainTotal + outrosTotal;

  if (data.main.length === 0 && detailRows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há origem para detalhar.</span>
      </div>
    );
  }

  const slices: Slice[] = [
    ...data.main.map((row) => ({ id: row.id, name: row.name, leads: row.leads, fill: SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0] })),
    { id: 'outros', name: 'Outros', leads: outrosTotal, fill: OTHER_FILL },
  ];
  const percents = integerPercents(slices.map((slice) => slice.leads));
  const outrosPercent = percents[percents.length - 1] ?? 0;
  const leaderIndex = slices.reduce((best, slice, index) => (slice.leads > (slices[best]?.leads ?? -1) ? index : best), 0);
  const leader = slices[leaderIndex];
  const leaderPercent = percents[leaderIndex] ?? 0;

  // A pizza gira para a fatia "Outros" ficar centrada às 3 horas, de frente para o painel de
  // detalhe: com f a fração de "Outros", startAngle = -180 * f e endAngle = startAngle - 360
  // deixam a fatia simétrica em torno do eixo horizontal que aponta para o painel (Outros
  // continua a última fatia da volta, e a ordem das principais não muda). Assim as duas bordas
  // de "Outros" nascem já viradas para fora do disco, e os conectores saem retos até os dois
  // cantos da caixa do painel, sem contornar o disco nem cruzar nenhuma outra fatia.
  const outrosFraction = total > 0 ? outrosTotal / total : 0;
  const pieStartAngle = -180 * outrosFraction;
  const pieEndAngle = pieStartAngle - 360;
  const startFraction = total > 0 ? mainTotal / total : 0;
  const edgeStart = pointAtFraction(pieStartAngle, startFraction);
  const edgeEnd = pointAtFraction(pieStartAngle, 1);

  const reading = `${formatInt(total)} leads no mês; Outros soma ${formatInt(outrosTotal)} (${formatPercent(outrosPercent / 100, 0)}) e se abre ao lado.`;

  const summary = [
    `Gráfico de pizza com a origem de ${formatInt(total)} leads do mês em ${String(slices.length)} categorias, do maior para o menor.`,
    leader ? `${leader.name} lidera com ${formatPercent(leaderPercent / 100, 0)} do total.` : '',
    `Outros soma ${formatPercent(outrosPercent / 100, 0)} (${formatInt(outrosTotal)} leads) e se abre ao lado em ${detailRows.map((row) => row.name.toLowerCase()).join(', ')}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderSliceLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius: sliceOuter = 0,
    index = -1,
  }: SliceLabelProps): ReactElement | null => {
    const pct = percents[index];
    if (pct === undefined) return null;
    const radius = innerRadius + (sliceOuter - innerRadius) * 0.62;
    const angle = -midAngle * RADIAN;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-primary)"
        fontSize={12}
        fontWeight={500}
        style={HALO}
        textAnchor="middle"
        x={x}
        y={y}
      >
        {formatPercent(pct / 100, 0)}
      </text>
    );
  };

  const renderName = ({ y, payload }: NameTickProps): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );

  const renderValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : detailRows[index];
    if (!row) return null;
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-secondary)"
        fontSize={12}
        fontWeight={500}
        style={HALO}
        x={Number(x) + Number(width) + VALUE_LABEL_GAP}
        y={Number(y) + Number(barHeight) / 2}
      >
        {`${formatInt(row.leads)} leads`}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs tabular-nums text-text-secondary">
        {reading}
      </p>
      <div className="flex min-h-0 flex-1 items-start gap-6">
        <div className="relative shrink-0" style={{ height: PIE_SIZE, width: PIE_SIZE }}>
          <ResponsiveContainer height="100%" width="100%">
            <PieChart accessibilityLayer={false}>
              <Pie
                cx="50%"
                cy="50%"
                data={slices}
                dataKey="leads"
                endAngle={pieEndAngle}
                isAnimationActive={animate}
                label={renderSliceLabel}
                labelLine={false}
                nameKey="name"
                outerRadius={PIE_RADIUS}
                startAngle={pieStartAngle}
                stroke="var(--surface-raised)"
                strokeWidth={2}
              >
                {slices.map((slice) => (
                  <Cell fill={slice.fill} key={slice.id} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Os dois conectores do bar of pie: duas retas simples, da borda superior e da borda
              inferior da fatia "Outros" até o canto de cima e o canto de baixo da caixa do
              painel de detalhe. A rotação da pizza já vira "Outros" de frente para o painel, então
              as duas bordas nascem no lado direito do disco, apontando para fora; a reta não entra
              de volta no disco nem passa por cima de nenhuma outra fatia. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-visible"
            viewBox={`0 0 ${String(PIE_SIZE)} ${String(PIE_SIZE)}`}
          >
            <path
              d={`M ${String(edgeStart.x)} ${String(edgeStart.y)} L ${String(PANEL_ANCHOR_X)} ${String(PANEL_TOP_Y)}`}
              fill="none"
              stroke={CONNECTOR_STROKE}
              strokeWidth={1}
            />
            <path
              d={`M ${String(edgeEnd.x)} ${String(edgeEnd.y)} L ${String(PANEL_ANCHOR_X)} ${String(PANEL_BOTTOM_Y)}`}
              fill="none"
              stroke={CONNECTOR_STROKE}
              strokeWidth={1}
            />
          </svg>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2" style={{ height: PIE_SIZE }}>
          <p className="shrink-0 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">Outros</span>:{' '}
            <span className="kpi-number font-medium text-text-primary">{formatInt(outrosTotal)} leads</span> (
            {formatPercent(outrosPercent / 100, 0)} do total)
          </p>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart accessibilityLayer={false} barCategoryGap="34%" data={detailRows} layout="vertical" margin={MARGIN}>
                <XAxis domain={[0, 'dataMax']} hide type="number" />
                <YAxis axisLine={false} dataKey="name" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
                <Bar dataKey="leads" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[0, 3, 3, 0]}>
                  {detailRows.map((row) => (
                    <Cell fill={OTHER_FILL} key={row.id} />
                  ))}
                  <LabelList content={renderValue} dataKey="leads" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Lista de identificação: nome e percentual de toda fatia (ROT-10), inclusive "Outros",
          cujo detalhe já vive no painel ao lado. aria-hidden porque a frase acessível repete. */}
      <ul aria-hidden className="mt-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1.5">
        {slices.map((slice, index) => (
          <li className="flex items-center gap-1.5 text-xs text-text-secondary" key={slice.id}>
            <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: slice.fill }} />
            <span>{slice.name}</span>
            <span className="font-display text-text-muted">{formatPercent((percents[index] ?? 0) / 100, 0)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
