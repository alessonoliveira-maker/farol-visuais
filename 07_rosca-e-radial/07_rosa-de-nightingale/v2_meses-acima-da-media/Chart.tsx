import type { ReactElement } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlySpend } from './data';

/**
 * Rosa de Nightingale com um anel tracejado na média mensal, pela mesma conta de raio dos setores:
 * meses acima ficam na cor de destaque, meses abaixo em neutro com o valor escrito ao lado (a
 * isenção do neutro exige o número), e o maior mês leva nome e valor em peso 700. A grandeza que se
 * lê é a área do setor, declarada no rodapé porque o ângulo é igual nos doze.
 */
export interface MediaSpendAboveAverageProps {
  readonly data?: readonly MonthlySpend[];
  readonly height?: number;
  readonly className?: string;
}

const ABOVE_FILL = 'var(--chart-1)';
const BELOW_FILL = 'var(--line-strong)';
const SEPARATOR = 'var(--surface-raised)';
const AVERAGE_STROKE = 'var(--text-muted)';
const LABEL_GAP = 8;
const OUTER_RADIUS = '60%';
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
 * exagerando o pequeno: medido neste mesmo dado, dez/25 (R$ 8,4 mil) desenhava 32,9% da área de
 * out/25 (R$ 42,9 mil), quando a proporção real é 19,6%. O anel da média passa pela mesma conta,
 * senão a referência mede uma coisa e as marcas medem outra.
 */
function radiusForValue(value: number, top: number, rMin: number, rMax: number): number {
  return Math.sqrt(rMin ** 2 + (rMax ** 2 - rMin ** 2) * (value / top));
}

export default function MediaSpendAboveAverage({ data = defaultData, height, className }: MediaSpendAboveAverageProps) {
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
  const average = rows.reduce((sum, row) => sum + row.value, 0) / rows.length;
  const scaleTop = Math.max(average, ...rows.map((r) => r.value)) * 1.02;
  const peak = rows.reduce((a, b) => (b.value > a.value ? b : a));
  const aboveCount = rows.filter((row) => row.value > average).length;

  const summary = `Rosa de Nightingale com o investimento em mídia de 12 meses de 2025 contra a média de ${formatCurrencyCompact(average)}. ${formatInt(aboveCount)} meses ficaram acima da média; o maior é ${formatMonthShort(peak.month)}, com ${formatCurrencyCompact(peak.value)}.`;

  /** A média mora no miolo do anel, não perto do perímetro: lá não disputa espaço com os 12
   * rótulos de mês da borda externa. */
  const renderAverageRing = (cx: number, cy: number, rMin: number, rMax: number): ReactElement => {
    const r = radiusForValue(average, scaleTop, rMin, rMax);
    return (
      <g aria-hidden>
        <circle cx={cx} cy={cy} fill="none" r={r} stroke={AVERAGE_STROKE} strokeDasharray="3 3" />
        <text textAnchor="middle" x={cx} y={cy}>
          <tspan className="font-sans" dy="-0.3em" fill={AVERAGE_STROKE} fontSize={11} x={cx}>
            média
          </tspan>
          <tspan className="font-display" dy="1.3em" fill={AVERAGE_STROKE} fontSize={11} fontWeight={600} x={cx}>
            {formatCurrencyCompact(average)}
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
    const value = row?.value ?? 0;
    /* O anel da média sai no ÚLTIMO setor, e não no primeiro, porque o `shape` pinta um setor por
       vez: desenhado antes, ele fica por baixo das pétalas e some justamente sob os meses acima da
       média, que são os que a versão existe para comparar com ele. */
    const isLast = row?.month === rows[rows.length - 1]?.month;
    const isLeader = row?.month === peak.month;
    const isAbove = value > average;
    const outer = radiusForValue(value, scaleTop, rMin, rMax);
    /* Mês abaixo da média escreve o valor porque o neutro só vale com o número ao lado (17.2), e o
       maior mês escreve o valor porque o destaque não pode viver só da cor (COR-2). */
    const showsValue = !isAbove || isLeader;
    const mid = (startAngle + endAngle) / 2;
    const monthPoint = toXY(cx, cy, rMax + LABEL_GAP, mid);
    const anchor = Math.cos((mid * Math.PI) / 180) >= 0 ? 'start' : 'end';
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          endAngle={endAngle}
          fill={isAbove ? ABOVE_FILL : BELOW_FILL}
          innerRadius={rMin}
          outerRadius={outer}
          startAngle={startAngle}
          stroke={SEPARATOR}
          strokeWidth={1.5}
        />
        <text dominantBaseline="central" textAnchor={anchor} x={monthPoint.x} y={monthPoint.y}>
          <tspan
            className="font-sans"
            dy={showsValue ? '-0.55em' : '0'}
            fill={isLeader ? 'var(--text-primary)' : 'var(--text-muted)'}
            fontSize={11}
            fontWeight={isLeader ? 700 : 400}
            x={monthPoint.x}
          >
            {formatMonthShort(row?.month ?? '')}
          </tspan>
          {showsValue ? (
            <tspan
              className="font-display"
              dy="1.15em"
              fill={isLeader ? 'var(--text-primary)' : 'var(--text-secondary)'}
              fontSize={11}
              fontWeight={isLeader ? 700 : undefined}
              x={monthPoint.x}
            >
              {formatCurrencyCompact(value)}
            </tspan>
          ) : null}
        </text>
        {isLast ? renderAverageRing(cx, cy, rMin, rMax) : null}
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
                  <Cell fill={row.value > average ? ABOVE_FILL : BELOW_FILL} key={row.month} />
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
        <span>anel tracejado: média mensal</span>
      </div>
    </div>
  );
}
