import { Filter } from 'lucide-react';
import { Pie, PieChart, ResponsiveContainer, Sector, Tooltip, type PieSectorShapeProps } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { cplAlvo, data as defaultData, type CplTargetSlice } from './data';

/**
 * Pizza de raio variável contra um anel de alvo: o ângulo de cada setor é a participação da
 * plataforma no investimento de mídia do mês, o raio é o CPL qualificado, e um anel tracejado
 * marca o raio do CPL alvo. Quem passa do anel ganha o próprio valor escrito do lado de fora do
 * arco, com halo; quem não passa é lido na legenda. O sinal de "acima do alvo" é a palavra na
 * legenda mais o cruzamento do anel, nunca a cor: a cor continua pertencendo à categoria (COR-3).
 */
export interface RadiusPieTargetProps {
  readonly data?: readonly CplTargetSlice[];
  /** CPL qualificado alvo do mês, em reais: o raio do anel de referência. */
  readonly target?: number;
  readonly height?: number;
  readonly className?: string;
}

/** Caixa do desenho, deitada de propósito: o rótulo do anel precisa de largura, não de altura. */
const BOX_W = 380;
const BOX_H = 208;
const CX = BOX_W / 2;
const CY = BOX_H / 2;
/** Raio máximo: sobram 13 px para o rótulo que fica do lado de fora do arco, mais a tinta dele. */
const R_MAX = 86;
/** Fração do raio máximo reservada como piso: nenhum setor nasce com raio zero. */
const R_MIN_RATIO = 0.3;
const R_MIN = R_MAX * R_MIN_RATIO;
/**
 * A anotação do anel sai na horizontal, à direita, com uma linha de chamada saindo do próprio
 * anel: no primeiro render ela estava sobre o anel, num ângulo escolhido pelo setor mais baixo, e
 * a tinta dela (75,24 px pela tabela por glifo) voltava por cima da fatia, com o halo comendo um
 * pedaço da marca (GEO-4). Fora do desenho não há marca nenhuma embaixo, em nenhum recorte.
 */
const RING_LEADER_END_X = CX + R_MAX + 14;
const RING_TEXT_X = RING_LEADER_END_X + 4;
const START_ANGLE = 90;
const END_ANGLE = -270;
const RADIAN = Math.PI / 180;
/** Slots categóricos na ordem da COR-8 (1, 3, 6, 5): a cor segue o slot do dado, não a posição. */
const SLOT_COLORS = [
  CHART_SERIES_COLORS[0],
  CHART_SERIES_COLORS[2],
  CHART_SERIES_COLORS[5],
  CHART_SERIES_COLORS[4],
] as const;
/** Halo na cor do cartão: o rótulo continua legível ao cruzar o anel ou o contorno de um setor. */
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;

/** Folga entre o canto mais próximo da tinta do rótulo e o arco do setor (GEO-19). */
const LABEL_CLEAR = 4;
/** Meia caixa de tinta estimada do rótulo de 11 px: largura por caractere e altura da linha. */
function labelAnchor(radius: number, angleDeg: number, text: string): { x: number; y: number } {
  const halfW = text.length * 3.4 + 2;
  const halfH = 7;
  const angleRad = -angleDeg * RADIAN;
  const ux = Math.cos(angleRad);
  const uy = Math.sin(angleRad);
  let d = radius;
  for (let guard = 0; guard < 400; guard += 1) {
    const dx = Math.max(Math.abs(d * ux) - halfW, 0);
    const dy = Math.max(Math.abs(d * uy) - halfH, 0);
    if (Math.hypot(dx, dy) >= radius + LABEL_CLEAR) break;
    d += 0.5;
  }
  return { x: CX + d * ux, y: CY + d * uy };
}

/**
 * Raio em pixels para um valor, entre o piso e o raio máximo, por área.
 *
 * A área de um setor cresce com o quadrado do raio, então o raio honesto é o que faz a coroa
 * acima do piso crescer junto com o valor: `r² − rMin²` proporcional a `v / topo` (GEO-3). A forma
 * `rMin + (rMax − rMin) × √(v/topo)` parece equivalente e não é: com piso de 30% ela desenha 32%
 * da área para 20% do valor, que é o sintoma exato da GEO-3.
 */
function radiusForValue(value: number, top: number): number {
  if (top <= 0) return R_MIN;
  const fraction = Math.min(1, Math.max(0, value / top));
  return Math.sqrt(R_MIN * R_MIN + (R_MAX * R_MAX - R_MIN * R_MIN) * fraction);
}

/**
 * Ângulo do meio de cada setor, na mesma conta do Recharts.
 *
 * Conferido em `recharts/es6/polar/Pie.js` (`sum > 0`, `paddingAngle: 0` e `minAngle: 0` como
 * padrão, e nenhuma ordenação): o setor `i` vai de `START_ANGLE − Σ360·pⱼ` até menos a própria
 * fatia, e o meio é a média dos dois. Sem esta conta a posição do rótulo seria chute.
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

export default function RadiusPieTarget({
  data = defaultData,
  target = cplAlvo,
  height,
  className,
}: RadiusPieTargetProps) {
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
        <span>Nenhum investimento neste recorte: não há plataforma para comparar com o alvo.</span>
      </div>
    );
  }

  const cplMax = data.reduce((max, row) => Math.max(max, row.cplQualificado), 0);
  const scaleTop = Math.max(cplMax, target);
  const percents = integerPercents(data.map((row) => row.investimento));
  const angles = midAngles(data.map((row) => row.investimento));
  const ringRadius = radiusForValue(target, scaleTop);
  const aboveCount = data.filter((row) => row.cplQualificado > target).length;
  const priciestIndex = data.reduce(
    (worst, row, index) => (row.cplQualificado > (data[worst]?.cplQualificado ?? -1) ? index : worst),
    0,
  );
  const priciest = data[priciestIndex];

  const reading = `${formatInt(aboveCount)} de ${formatInt(data.length)} plataformas acima do alvo, ${formatCurrencyCompact(target)} por lead qualificado.`;
  const summaryIntro = `Gráfico de pizza de raio variável com ${formatInt(data.length)} plataformas de mídia: o ângulo mede o investimento e o raio mede o CPL qualificado.`;
  const summary = priciest
    ? `${summaryIntro} ${formatInt(aboveCount)} de ${formatInt(data.length)} acima do alvo de ${formatCurrencyCompact(target)}, e a mais cara é ${priciest.name.toLowerCase()}, ${formatCurrencyCompact(priciest.cplQualificado)}.`
    : summaryIntro;

  const renderSlice = (props: PieSectorShapeProps) => {
    const row = props.payload as CplTargetSlice | undefined;
    const fill = row ? (SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0]) : CHART_SERIES_COLORS[0];
    return (
      <Sector
        cx={props.cx}
        cy={props.cy}
        endAngle={props.endAngle}
        fill={fill}
        innerRadius={0}
        outerRadius={row ? radiusForValue(row.cplQualificado, scaleTop) : R_MIN}
        startAngle={props.startAngle}
        stroke="var(--surface-raised)"
        strokeWidth={2}
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
                  const row = tooltipProps.payload[0]?.payload as CplTargetSlice | undefined;
                  if (!row) return null;
                  const color = SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0];
                  return (
                    <ChartTooltip
                      active={tooltipProps.active}
                      label={row.name}
                      payload={[
                        { color, graphicalItemId: 'investimento', name: 'Investimento', value: row.investimento },
                        { color, graphicalItemId: 'cpl', name: 'CPL qualificado', value: row.cplQualificado },
                      ]}
                      valueFormat="currencyCompact"
                    />
                  );
                }}
                isAnimationActive={false}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Anel do alvo e os rótulos de quem passa dele. O `viewBox` tem o tamanho exato da caixa,
              para a escala do texto sair 1 e as guardas de tinta continuarem medindo o desenho. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0"
            viewBox={`0 0 ${String(BOX_W)} ${String(BOX_H)}`}
          >
            <circle
              cx={CX}
              cy={CY}
              fill="none"
              r={ringRadius}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <line
              stroke="var(--text-muted)"
              strokeWidth={1}
              x1={CX + ringRadius}
              x2={RING_LEADER_END_X}
              y1={CY}
              y2={CY}
            />
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              textAnchor="start"
              x={RING_TEXT_X}
              y={CY}
            >
              {`alvo ${formatCurrencyCompact(target)}`}
            </text>
            {data.map((row, index) => {
              if (row.cplQualificado <= target) return null;
              // O rótulo fica FORA do arco do próprio setor, sobre o cartão, e não dentro da
              // coroa excedente: dentro, a ROT-7b proibiria o halo (texto vazado na cor da
              // superfície e halo na mesma cor se anulam no tema claro) e a especificação da
              // versão pede halo. Fora do arco, o fundo é o cartão e o halo é o da ROT-7.
              const radius = radiusForValue(row.cplQualificado, scaleTop);
              const point = labelAnchor(radius, angles[index] ?? START_ANGLE, formatCurrencyCompact(row.cplQualificado));
              return (
                <text
                  className="font-display"
                  dominantBaseline="central"
                  fill="var(--text-primary)"
                  fontSize={11}
                  key={row.id}
                  style={HALO}
                  textAnchor="middle"
                  x={point.x}
                  y={point.y}
                >
                  {formatCurrencyCompact(row.cplQualificado)}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
      <ul className="mt-2 flex shrink-0 flex-col gap-1">
        {data.map((row, index) => (
          <li className="flex items-center gap-2 text-xs text-text-secondary" key={row.id}>
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0] }}
            />
            <span className="min-w-0 flex-1 truncate">{row.name}</span>
            <span className="font-display w-8 shrink-0 text-right text-text-primary">
              {formatPercent((percents[index] ?? 0) / 100, 0)}
            </span>
            <span className="font-display w-14 shrink-0 text-right text-text-primary">
              {formatCurrencyCompact(row.cplQualificado)}
            </span>
            <span className="w-20 shrink-0 text-[0.6875rem] text-text-muted">
              {row.cplQualificado > target ? 'acima do alvo' : 'dentro do alvo'}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 shrink-0 text-[0.6875rem] text-text-muted tabular-nums">
        {`Ângulo: participação no investimento. Raio: CPL qualificado, de ${formatCurrencyCompact(0)} a ${formatCurrencyCompact(scaleTop)}.`}
      </p>
    </div>
  );
}
