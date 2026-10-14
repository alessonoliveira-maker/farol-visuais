import { Filter, Unplug } from 'lucide-react';
import { Pie, PieChart, ResponsiveContainer, Sector, Tooltip, type PieSectorShapeProps } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyCompact, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MediaLeadSlice } from './data';

/**
 * Pizza de raio variável com uma plataforma sem lead qualificado: o ângulo continua sendo o
 * investimento, porque a verba foi gasta de verdade, e a ausência aparece no RAIO, como setor no
 * piso, vazado e de contorno tracejado. O CPL não vem no dado: é derivado aqui, e o divisor zero é
 * resolvido no tipo, com `number | null`, para nunca haver `Infinity` chegando ao raio (EST-1b).
 */
export interface RadiusPieMissingProps {
  readonly data?: readonly MediaLeadSlice[];
  readonly height?: number;
  readonly className?: string;
}

/** Caixa do desenho, deitada de propósito: a linha de chamada precisa de largura para o rótulo. */
const BOX_W = 340;
const BOX_H = 190;
const CX = BOX_W / 2;
const CY = BOX_H / 2;
const R_MAX = 76;
/** Fração do raio máximo reservada como piso: é nele que o setor sem CPL medido aparece. */
const R_MIN_RATIO = 0.3;
const R_MIN = R_MAX * R_MIN_RATIO;
const START_ANGLE = 90;
const END_ANGLE = -270;
const RADIAN = Math.PI / 180;
/** Linha de chamada: começa 4 px fora do piso e para 12 px fora do raio máximo (ROT-11). */
const CALLOUT_START = R_MIN + 4;
const CALLOUT_END = R_MAX + 12;
/** Cotovelo e as duas linhas do rótulo de ausência, na caixa do desenho. */
const CALLOUT_ELBOW_X = 190;
const CALLOUT_TEXT_X = 196;
const CALLOUT_LINE_1_Y = 12;
const CALLOUT_LINE_2_Y = 26;
const CALLOUT_ELBOW_Y = 19;
/** Slots categóricos na ordem da COR-8 (1, 3, 6, 5): a cor segue o slot do dado, não a posição. */
const SLOT_COLORS = [
  CHART_SERIES_COLORS[0],
  CHART_SERIES_COLORS[2],
  CHART_SERIES_COLORS[5],
  CHART_SERIES_COLORS[4],
] as const;
/** Halo na cor do cartão: o rótulo do anel e a chamada ficam sobre o próprio tracejado e precisam vencê lo (ROT-7). */
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;

/**
 * CPL qualificado de uma plataforma, ou `null` quando ela não gerou lead qualificado.
 *
 * Aqui mora o ponto da versão: `investimento / 0` é `Infinity`, e `Infinity` chega ao raio como
 * número, desenha o setor no raio máximo e diz que a plataforma mais barata é a que não entregou
 * nada. O tipo resolve antes do desenho, e a ausência sai escrita (EST-1b, EST-2).
 */
function cplOf(row: MediaLeadSlice): number | null {
  if (row.leadsQualificados <= 0) return null;
  return row.investimento / row.leadsQualificados;
}

/**
 * Raio em pixels para um valor, entre o piso e o raio máximo, por área.
 *
 * A área do setor cresce com o quadrado do raio, então o raio honesto é o que faz a coroa acima do
 * piso crescer junto com o valor: `r² − rMin²` proporcional a `v / topo` (GEO-3).
 */
function radiusForValue(value: number, top: number): number {
  if (top <= 0) return R_MIN;
  const fraction = Math.min(1, Math.max(0, value / top));
  return Math.sqrt(R_MIN * R_MIN + (R_MAX * R_MAX - R_MIN * R_MIN) * fraction);
}

/** Ponto a um raio e um ângulo dados, na convenção do Recharts (90° é o topo, sentido horário). */
function pointAt(radius: number, angleDeg: number): { x: number; y: number } {
  const angleRad = -angleDeg * RADIAN;
  return { x: CX + radius * Math.cos(angleRad), y: CY + radius * Math.sin(angleRad) };
}

/**
 * Ângulo do meio de cada setor, na mesma conta do Recharts.
 *
 * Conferido em `recharts/es6/polar/Pie.js`: com `paddingAngle` e `minAngle` em zero, que são os
 * padrões, e sem nenhuma ordenação, o setor `i` começa onde o anterior terminou. Sem esta conta a
 * linha de chamada apontaria para o lugar errado.
 */
function midAngles(values: readonly number[]): readonly number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => START_ANGLE);
  const sweep = END_ANGLE - START_ANGLE;
  let cursor = START_ANGLE;
  return values.map((value) => {
    const slice = (value / total) * sweep;
    const mid = cursor + slice / 2;
    cursor += slice;
    return mid;
  });
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

export default function RadiusPieMissing({ data = defaultData, height, className }: RadiusPieMissingProps) {
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
        <span>Nenhum investimento neste recorte: não há plataforma para comparar.</span>
      </div>
    );
  }

  const percents = integerPercents(data.map((row) => row.investimento));
  const angles = midAngles(data.map((row) => row.investimento));
  const medidos = data.map((row) => cplOf(row)).filter((value): value is number => value !== null);
  /** Topo da escala do raio: o maior CPL MEDIDO, ou nenhuma escala quando não há CPL medido. */
  const scaleTop = medidos.length === 0 ? null : Math.max(...medidos);
  const missingIndex = data.findIndex((row) => cplOf(row) === null);
  const missing = missingIndex === -1 ? undefined : data[missingIndex];
  const missingPercent = percents[missingIndex] ?? 0;

  const reading = missing
    ? `${missing.name} levou ${formatPercent(missingPercent / 100, 0)} da verba e não gerou lead qualificado no mês.`
    : `Todas as ${formatInt(data.length)} plataformas geraram lead qualificado no mês.`;

  const summaryIntro = `Gráfico de pizza de raio variável com ${formatInt(data.length)} plataformas de mídia: o ângulo mede o investimento e o raio mede o CPL qualificado.`;
  const summary = missing
    ? `${summaryIntro} ${missing.name} levou ${formatPercent(missingPercent / 100, 0)} da verba e ficou com o CPL ${formatUnavailable()}, porque gerou ${formatInt(missing.leadsQualificados)} leads qualificados.`
    : summaryIntro;

  const calloutAngle = angles[missingIndex === -1 ? 0 : missingIndex] ?? START_ANGLE;
  const calloutStart = pointAt(CALLOUT_START, calloutAngle);
  const calloutTurn = pointAt(CALLOUT_END, calloutAngle);
  /**
   * O rótulo do anel vai no ângulo do setor de MENOR raio medido, que é onde há mais cartão livre
   * entre a fatia e o anel. Escolher o primeiro setor da lista poria o rótulo sobre a marca em
   * qualquer recorte que começasse pelo CPL mais alto.
   */
  const ringLabelIndex = data.reduce((best, row, index) => {
    const cpl = cplOf(row);
    if (cpl === null) return best;
    const bestCpl = cplOf(data[best] ?? row);
    if (bestCpl === null) return index;
    return cpl < bestCpl ? index : best;
  }, 0);
  const ringLabel = pointAt(R_MAX, angles[ringLabelIndex] ?? START_ANGLE);

  const renderSlice = (props: PieSectorShapeProps) => {
    const row = props.payload as MediaLeadSlice | undefined;
    const cpl = row ? cplOf(row) : null;
    const ausente = cpl === null || scaleTop === null;
    return (
      <Sector
        cx={props.cx}
        cy={props.cy}
        endAngle={props.endAngle}
        fill={ausente ? 'none' : (SLOT_COLORS[row?.slot ?? 0] ?? CHART_SERIES_COLORS[0])}
        innerRadius={0}
        outerRadius={ausente || cpl === null || scaleTop === null ? R_MIN : radiusForValue(cpl, scaleTop)}
        startAngle={props.startAngle}
        stroke={ausente ? 'var(--text-muted)' : 'var(--surface-raised)'}
        strokeDasharray={ausente ? '3 3' : undefined}
        strokeWidth={ausente ? 1 : 2}
      />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary tabular-nums">
        {reading}
      </p>
      <div className="flex min-h-0 flex-1 justify-center">
        <div className="relative shrink-0" style={{ height: BOX_H, width: BOX_W }}>
          <ResponsiveContainer height="100%" width="100%">
            <PieChart accessibilityLayer={false}>
              <Pie
                cx="50%"
                cy="50%"
                data={data}
                dataKey="investimento"
                endAngle={END_ANGLE}
                innerRadius={0}
                isAnimationActive={animate}
                nameKey="name"
                outerRadius={R_MAX}
                shape={renderSlice}
                startAngle={START_ANGLE}
              />
              <Tooltip
                content={(tooltipProps) => {
                  const row = tooltipProps.payload[0]?.payload as MediaLeadSlice | undefined;
                  if (!row) return null;
                  const color = SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0];
                  const cpl = cplOf(row);
                  return (
                    <ChartTooltip
                      active={tooltipProps.active}
                      label={row.name}
                      payload={[
                        { color, graphicalItemId: 'investimento', name: 'Investimento', value: row.investimento },
                        {
                          color,
                          graphicalItemId: 'cpl',
                          name: 'CPL qualificado',
                          value: cpl === null ? formatUnavailable() : formatCurrencyCompact(cpl),
                        },
                      ]}
                      valueFormat="currencyCompact"
                    />
                  );
                }}
                isAnimationActive={false}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Anel do topo da escala e a chamada do setor sem CPL medido. A linha de chamada abraça
              só o setor que ela representa (ROT-11), e o rótulo sai em duas linhas porque a frase
              inteira mede 194 px e a caixa tem 340: em uma linha ela sairia do desenho. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0"
            viewBox={`0 0 ${String(BOX_W)} ${String(BOX_H)}`}
          >
            <circle
              cx={CX}
              cy={CY}
              fill="none"
              r={R_MAX}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            {scaleTop === null ? null : (
              <text
                className="font-display"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize={11}
                style={HALO}
                textAnchor="middle"
                x={ringLabel.x}
                y={ringLabel.y}
              >
                {formatCurrencyCompact(scaleTop)}
              </text>
            )}
            {missing ? (
              <g>
                <polyline
                  fill="none"
                  points={`${String(calloutStart.x)},${String(calloutStart.y)} ${String(calloutTurn.x)},${String(calloutTurn.y)} ${String(CALLOUT_ELBOW_X)},${String(CALLOUT_ELBOW_Y)}`}
                  stroke="var(--text-muted)"
                  strokeWidth={1}
                />
                <text
                  dominantBaseline="central"
                  fill="var(--text-primary)"
                  fontSize={11}
                  style={HALO}
                  textAnchor="start"
                  x={CALLOUT_TEXT_X}
                  y={CALLOUT_LINE_1_Y}
                >
                  {`CPL ${formatUnavailable()}:`}
                </text>
                <text
                  className="font-display"
                  dominantBaseline="central"
                  fill="var(--text-primary)"
                  fontSize={11}
                  style={HALO}
                  textAnchor="start"
                  x={CALLOUT_TEXT_X}
                  y={CALLOUT_LINE_2_Y}
                >
                  {`${formatInt(missing.leadsQualificados)} leads qualificados`}
                </text>
              </g>
            ) : null}
          </svg>
        </div>
      </div>
      <ul className="mt-2 flex shrink-0 flex-col gap-1">
        {data.map((row, index) => {
          const cpl = cplOf(row);
          return (
            <li className="flex items-center gap-2 text-xs text-text-secondary" key={row.id}>
              {/* Amostra vazada e tracejada para a ausência (ROT-4), com a borda em
                  var(--text-muted), que mede 5,21:1 no escuro e 5,37:1 no claro; a
                  var(--line-strong) fica em 1,79:1 e não alcança o piso de amostra da ACE-3. */}
              <span
                aria-hidden
                className={cn('size-2.5 shrink-0 rounded-sm', cpl === null && 'border border-dashed')}
                style={
                  cpl === null
                    ? { borderColor: 'var(--text-muted)' }
                    : { backgroundColor: SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0] }
                }
              />
              <span className="min-w-0 flex-1 truncate">{row.name}</span>
              <span className="font-display w-8 shrink-0 text-right text-text-primary">
                {formatPercent((percents[index] ?? 0) / 100, 0)}
              </span>
              <span className="flex w-24 shrink-0 items-center justify-end gap-1">
                {cpl === null ? (
                  <>
                    <Unplug aria-hidden className="size-3 shrink-0 text-text-muted" />
                    <span className="text-text-muted">{formatUnavailable()}</span>
                  </>
                ) : (
                  <span className="font-display text-text-primary">{formatCurrencyCompact(cpl)}</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 shrink-0 text-[0.6875rem] text-text-muted tabular-nums">
        {scaleTop === null
          ? 'Ângulo: participação no investimento. Raio: sem CPL medido em nenhuma plataforma.'
          : `Ângulo: participação no investimento. Raio: CPL qualificado, do piso ao maior medido, ${formatCurrencyCompact(scaleTop)}.`}
      </p>
    </div>
  );
}
