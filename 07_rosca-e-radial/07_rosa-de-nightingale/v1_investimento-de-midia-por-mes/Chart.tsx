import type { ReactElement } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlySpend } from './data';

/**
 * Rosa de Nightingale: um setor por mês, todos com o mesmo ângulo, e o raio pela raiz quadrada do
 * investimento, para a **área** da fatia crescer na mesma proporção do valor. A grandeza que o
 * leitor lê aqui é a área, e é por isso que ela está declarada no rodapé: quem chega de uma pizza
 * procura o ângulo, e o ângulo é igual nos doze setores, não diz nada. Anéis tracejados marcam a
 * escala e o nome do mês fica no perímetro, sempre na horizontal.
 */
export interface MediaSpendRoseProps {
  readonly data?: readonly MonthlySpend[];
  readonly height?: number;
  readonly className?: string;
}

const FILL = 'var(--chart-1)';
const SEPARATOR = 'var(--surface-raised)';
const GRID_STROKE = 'var(--line-subtle)';
const GRID_TEXT = 'var(--text-muted)';
/** Topo do domínio: primeiro múltiplo de 10 mil acima do maior valor (EIX-4). */
const GRID_STEP = 10_000;
const LABEL_GAP = 8;
const OUTER_RADIUS = '64%';
const INNER_RADIUS = '22%';

interface SliceProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly startAngle?: number;
  readonly endAngle?: number;
  readonly payload?: MonthlySpend;
}

/** Mesma convenção do `polarToCartesian` do Recharts: ângulo cresce no sentido horário. */
function toXY(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (-angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Raio da fronteira de um valor, de modo que a área do setor seja proporcional ao valor.
 *
 * A raiz quadrada existe porque a área cresce com o quadrado do raio: raio proporcional ao valor
 * faria o dobro parecer quatro vezes. E o furo central entra **dentro** da raiz, não fora dela,
 * porque a área de um setor de anel vale `r² − rMin²` e não `r²`. A forma anterior,
 * `rMin + (rMax − rMin) * Math.sqrt(v / topo)`, deixava a raiz do lado de fora e continuava
 * exagerando o pequeno: medido neste mesmo dado, dez/25 (R$ 8,4 mil) desenhava 32,7% da área de
 * out/25 (R$ 42,9 mil), quando a proporção real é 19,6%. Com a conta abaixo a área desenhada de
 * cada mês bate com a participação do valor na casa dos centésimos de ponto.
 */
function radiusForValue(value: number, top: number, rMin: number, rMax: number): number {
  return Math.sqrt(rMin ** 2 + (rMax ** 2 - rMin ** 2) * (value / top));
}

export default function MediaSpendRose({ data = defaultData, height, className }: MediaSpendRoseProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <span>Nenhuma linha neste recorte: não houve investimento de mídia registrado.</span>
      </div>
    );
  }

  const rows = data.map((row) => ({ ...row, weight: 1 as const }));
  const gridTop = Math.max(GRID_STEP, Math.ceil(Math.max(...rows.map((r) => r.value)) / GRID_STEP) * GRID_STEP);
  const peak = rows.reduce((a, b) => (b.value > a.value ? b : a));
  const low = rows.reduce((a, b) => (b.value < a.value ? b : a));

  const summary = `Rosa de Nightingale com o investimento em mídia paga em 12 meses de 2025, com a área de cada setor proporcional ao valor. O maior é ${formatMonthShort(peak.month)}, com ${formatCurrencyCompact(peak.value)}; o menor é ${formatMonthShort(low.month)}, com ${formatCurrencyCompact(low.value)}.`;

  /** O rótulo da escala mora no miolo do anel (nunca perto do perímetro): lá não há disputa
   * com os 12 rótulos de mês, que vivem todos na borda externa. */
  const renderGrid = (cx: number, cy: number, rMin: number, rMax: number): ReactElement => {
    /* O anel do meio marca a metade da escala em valor, e não a metade do vão radial: ele passa
       pela mesma conta dos setores, senão a grade e as marcas medem coisas diferentes. */
    const rHalf = radiusForValue(gridTop / 2, gridTop, rMin, rMax);
    return (
      <g aria-hidden>
        <circle cx={cx} cy={cy} fill="none" r={rHalf} stroke={GRID_STROKE} strokeDasharray="2 3" />
        <circle cx={cx} cy={cy} fill="none" r={rMax} stroke={GRID_STROKE} strokeDasharray="2 3" />
        <text textAnchor="middle" x={cx} y={cy}>
          <tspan className="font-sans" dy="-0.3em" fill={GRID_TEXT} fontSize={11} x={cx}>
            escala até
          </tspan>
          <tspan className="font-display" dy="1.3em" fill={GRID_TEXT} fontSize={11} fontWeight={600} x={cx}>
            {formatCurrencyCompact(gridTop)}
          </tspan>
        </text>
      </g>
    );
  };

  const renderSlice = (props: SliceProps): ReactElement => {
    const cx = props.cx ?? 0;
    const cy = props.cy ?? 0;
    const rMin = props.innerRadius ?? 0;
    const rMax = props.outerRadius ?? 0;
    const startAngle = props.startAngle ?? 0;
    const endAngle = props.endAngle ?? 0;
    const value = props.payload?.value ?? 0;
    /* A grade sai no ÚLTIMO setor, e não no primeiro, porque o `shape` pinta um setor por vez:
       desenhada antes, ela fica por baixo das pétalas e o anel da metade só aparece nos meses
       curtos, isto é, a referência some justamente onde o valor é alto. */
    const isLast = props.payload?.month === rows[rows.length - 1]?.month;
    const outer = radiusForValue(value, gridTop, rMin, rMax);
    const mid = (startAngle + endAngle) / 2;
    const labelPoint = toXY(cx, cy, rMax + LABEL_GAP, mid);
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          endAngle={endAngle}
          fill={FILL}
          innerRadius={rMin}
          outerRadius={outer}
          startAngle={startAngle}
          stroke={SEPARATOR}
          strokeWidth={1.5}
        />
        <text
          className="font-sans"
          dominantBaseline="central"
          fill={GRID_TEXT}
          fontSize={11}
          textAnchor={Math.cos((mid * Math.PI) / 180) >= 0 ? 'start' : 'end'}
          x={labelPoint.x}
          y={labelPoint.y}
        >
          {formatMonthShort(props.payload?.month ?? '')}
        </text>
        {isLast ? renderGrid(cx, cy, rMin, rMax) : null}
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="aspect-square h-full max-h-full max-w-full">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart accessibilityLayer={false} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie
                cx="50%"
                cy="50%"
                data={rows}
                dataKey="weight"
                endAngle={-270}
                innerRadius={INNER_RADIUS}
                isAnimationActive={animate}
                nameKey="month"
                outerRadius={OUTER_RADIUS}
                shape={renderSlice}
                startAngle={90}
              >
                {rows.map((row) => (
                  <Cell fill={FILL} key={row.month} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* A grandeza lida vai escrita, e não subentendida. Sem esta linha o leitor treinado em pizza
          procura o ângulo, que aqui é igual nos doze setores, ou compara raios, que crescem pela
          raiz e por isso não se comparam de forma linear. */}
      <div
        aria-hidden
        className="mt-1.5 flex shrink-0 flex-wrap justify-center gap-x-3 gap-y-0.5 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span>a grandeza é a área do setor, não o raio</span>
        <span>ângulo igual em todos os meses</span>
        <span>anéis tracejados: metade e topo da escala</span>
      </div>
    </div>
  );
}
