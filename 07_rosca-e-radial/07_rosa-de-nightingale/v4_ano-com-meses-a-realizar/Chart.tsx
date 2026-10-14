import type { ReactElement } from 'react';
import { Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlySpendStatus } from './data';

/**
 * Rosa de Nightingale com o ano em andamento: meses fechados desenham área proporcional ao valor,
 * o mês corrente entra com contorno tracejado e a nota de corte, e os meses futuros nunca viram
 * raio zero, só contorno tracejado e o rótulo "a realizar". A escala usa apenas os meses fechados,
 * para o parcial não achatar o resto da rosa. A grandeza que se lê é a área do setor, declarada no
 * rodapé porque o ângulo é igual nos doze.
 */
export interface MediaSpendYearProps {
  readonly data?: readonly MonthlySpendStatus[];
  readonly height?: number;
  readonly className?: string;
}

const FILL = 'var(--chart-1)';
const SEPARATOR = 'var(--surface-raised)';
const MUTED_STROKE = 'var(--text-muted)';
const GRID_STROKE = 'var(--line-subtle)';
const GRID_STEP = 10_000;
const LABEL_GAP = 8;
const OUTER_RADIUS = '64%';
const INNER_RADIUS = '22%';
/**
 * Piso de raio para mês sem dado, como fração do vão radial: visível como contorno, nunca some como
 * um zero. O número é pequeno de propósito, porque o contorno cai sobre a mesma escala das marcas
 * cheias e um raio grande passa a **parecer um valor**. Na conta de área desta versão, 0,28 do vão
 * equivale a R$ 7,3 mil, bem abaixo do menor mês fechado (R$ 14,2 mil), enquanto os 0,4 que a versão
 * usava antes equivalem a R$ 11,3 mil, que já disputa com fevereiro. A conversão muda com a fórmula
 * do raio: na conta linear anterior os mesmos 0,4 valiam R$ 6,4 mil.
 */
const FUTURE_RADIUS_FRACTION = 0.28;

interface SliceProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly startAngle?: number;
  readonly endAngle?: number;
  readonly payload?: MonthlySpendStatus;
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
 * exagerando o pequeno: medido neste mesmo dado, fev/26 (R$ 14,2 mil) desenhava 53,0% da área de
 * jul/26 (R$ 34,8 mil), quando a proporção real é 40,8%.
 */
function radiusForValue(value: number, top: number, rMin: number, rMax: number): number {
  return Math.sqrt(rMin ** 2 + (rMax ** 2 - rMin ** 2) * (value / top));
}

export default function MediaSpendYear({ data = defaultData, height, className }: MediaSpendYearProps) {
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
  const closed = rows.filter((row) => row.status === 'fechado' && row.value !== undefined);
  const closedMax = Math.max(1, ...closed.map((row) => row.value ?? 0));
  const gridTop = Math.ceil(closedMax / GRID_STEP) * GRID_STEP;
  const partial = rows.find((row) => row.status === 'parcial');
  const futureCount = rows.filter((row) => row.status === 'a_realizar').length;

  const summary = `Rosa de Nightingale com o investimento em mídia de 2026, ${formatInt(closed.length)} meses fechados e ${formatInt(futureCount)} ainda a realizar. ${partial ? `${formatMonthShort(partial.month)} está parcial até ${partial.asOf ? formatDate(partial.asOf) : ''}.` : ''}`;

  /** Escala no miolo do anel, não perto do perímetro: lá não disputa com os 12 rótulos de mês. */
  const renderGrid = (cx: number, cy: number, rMin: number, rMax: number): ReactElement => {
    /* O anel do meio marca a metade da escala em valor, e não a metade do vão radial: ele passa
       pela mesma conta dos setores, senão a grade e as marcas medem coisas diferentes. */
    const rHalf = radiusForValue(gridTop / 2, gridTop, rMin, rMax);
    return (
      <g aria-hidden>
        <circle cx={cx} cy={cy} fill="none" r={rHalf} stroke={GRID_STROKE} strokeDasharray="2 3" />
        <circle cx={cx} cy={cy} fill="none" r={rMax} stroke={GRID_STROKE} strokeDasharray="2 3" />
        <text textAnchor="middle" x={cx} y={cy}>
          <tspan className="font-sans" dy="-0.3em" fill={MUTED_STROKE} fontSize={11} x={cx}>
            escala até
          </tspan>
          <tspan className="font-display" dy="1.3em" fill={MUTED_STROKE} fontSize={11} fontWeight={600} x={cx}>
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
    const row = props.payload;
    /* A grade sai no ÚLTIMO setor, e não no primeiro, porque o `shape` pinta um setor por vez:
       desenhada antes, ela fica por baixo das pétalas e o anel da metade só aparece nos meses
       curtos, isto é, a referência some justamente onde o valor é alto. */
    const isLast = row?.month === rows[rows.length - 1]?.month;
    const mid = (startAngle + endAngle) / 2;
    const anchor = Math.cos((mid * Math.PI) / 180) >= 0 ? 'start' : 'end';
    const monthPoint = toXY(cx, cy, rMax + LABEL_GAP, mid);

    if (row?.status === 'a_realizar') {
      const outer = rMin + (rMax - rMin) * FUTURE_RADIUS_FRACTION;
      return (
        <g>
          <Sector cx={cx} cy={cy} endAngle={endAngle} fill="none" innerRadius={rMin} outerRadius={outer} startAngle={startAngle} stroke={MUTED_STROKE} strokeDasharray="3 3" />
          <text className="font-sans" fill={MUTED_STROKE} fontSize={11} textAnchor={anchor} x={monthPoint.x} y={monthPoint.y}>
            <tspan dy="-0.2em" x={monthPoint.x}>
              {formatMonthShort(row.month)}
            </tspan>
            <tspan dy="1.2em" fontSize={11} x={monthPoint.x}>
              a realizar
            </tspan>
          </text>
          {isLast ? renderGrid(cx, cy, rMin, rMax) : null}
        </g>
      );
    }

    const value = row?.value ?? 0;
    const outer = radiusForValue(value, gridTop, rMin, rMax);
    const isPartial = row?.status === 'parcial';
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
          stroke={isPartial ? MUTED_STROKE : SEPARATOR}
          strokeDasharray={isPartial ? '3 3' : undefined}
          strokeWidth={1.5}
        />
        <text className="font-sans" dominantBaseline="central" fill={MUTED_STROKE} fontSize={11} textAnchor={anchor} x={monthPoint.x} y={monthPoint.y}>
          {formatMonthShort(row?.month ?? '')}
        </text>
        {isLast ? renderGrid(cx, cy, rMin, rMax) : null}
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1.5 shrink-0 truncate text-xs text-text-secondary">
        {partial ? (
          <>
            <span className="font-semibold text-text-primary">{formatMonthShort(partial.month)}</span> parcial até{' '}
            {partial.asOf ? formatDate(partial.asOf) : ''};{' '}
            {formatInt(futureCount)} meses a realizar
          </>
        ) : (
          `${formatInt(futureCount)} meses a realizar`
        )}
      </p>
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
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* A grandeza lida vai escrita, e não subentendida. Sem esta linha o leitor treinado em pizza
          procura o ângulo, que aqui é igual nos doze setores, ou compara raios, que crescem pela
          raiz e por isso não se comparam de forma linear. São duas frases e não três: o contorno
          tracejado já se explica no perímetro, ao lado de cada mês, e uma terceira frase empurraria
          o rodapé para duas linhas, encolhendo a rosa e aproximando os rótulos do perímetro. */}
      <div
        aria-hidden
        className="mt-1.5 flex shrink-0 flex-wrap justify-center gap-x-3 gap-y-0.5 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span>a grandeza é a área do setor, não o raio</span>
        <span>ângulo igual em todos os meses</span>
      </div>
    </div>
  );
}
