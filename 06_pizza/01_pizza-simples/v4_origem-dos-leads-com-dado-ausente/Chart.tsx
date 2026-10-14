import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadOrigin } from './data';

/**
 * Pizza com rótulo externo e uma fatia de ausência: cada parte se nomeia fora do disco, ligada
 * por uma linha guia de dois segmentos, e o que chegou sem origem declarada fica visível como
 * setor vazado, fora da ordenação e por último. O rótulo sai de dentro porque duas fatias vizinhas
 * medem 3% e 2%, e nenhum texto de 11 px cabe numa corda de poucos pixels.
 */
export interface LeadOriginPieProps {
  readonly data?: readonly LeadOrigin[];
  readonly height?: number;
  readonly className?: string;
}

const RADIAN = Math.PI / 180;
/** Do raio da fatia até o joelho da linha guia, em px: o primeiro segmento, radial. */
const LEADER_GAP = 10;
/** Do joelho até a âncora do texto, em px: o segundo segmento, reto. */
const LEADER_RUN = 26;
/** Respiro entre a ponta da linha guia e a tinta do texto. */
const LEADER_TIP = 4;
/**
 * Distância mínima entre os centros de dois rótulos do mesmo lado, em px. O bloco de duas linhas
 * de 11 px mede cerca de 29 px de tinta, então 34 px deixam 5 px de vão, acima do respiro de 4 px
 * que a guarda de colisão usa como limiar de aviso.
 */
const LABEL_MIN_GAP = 34;
/** Metade do bloco de duas linhas, para o rótulo do topo e o do fim não saírem do corpo. */
const LABEL_HALF_HEIGHT = 16;
const LABEL_FONT_SIZE = 11;
const MARGIN_Y = 16;
/** 74% do raio máximo: os 26% restantes seguram o contorno da fatia vazada e o joelho da guia. */
const OUTER_RADIUS = '74%';
/**
 * Largura de caractere medida a 11 px, por família e por classe de glifo. São duas famílias e não
 * uma porque o número sai em Space Grotesk e o nome em Manrope: uma constante só para as duas erra
 * cerca de 11% em uma delas, sempre.
 */
const CHAR_WIDTH_11PX = {
  grotesk: { digit: 6.49, upper: 6.7, lower: 5.95 },
  manrope: { digit: 6.19, upper: 6.78, lower: 5.79 },
} as const;
/** Glifo fora da tabela (espaço, vírgula, sinal de porcentagem, acento solto). */
const CHAR_WIDTH_FALLBACK = 6.05;
/** Cor da linha guia: mede 5,21:1 no escuro e 5,37:1 no claro contra o cartão, acima do piso de 3:1. */
const LEADER_COLOR = 'var(--text-muted)';
/** Slots categóricos na ordem da COR-8 (1, 3, 6, 5): a cor segue o `slot` do dado, nunca a posição. */
const SLOT_COLORS = [
  CHART_SERIES_COLORS[0],
  CHART_SERIES_COLORS[2],
  CHART_SERIES_COLORS[5],
  CHART_SERIES_COLORS[4],
] as const;

interface SliceShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly startAngle?: number;
  readonly endAngle?: number;
  readonly fill?: string;
  readonly stroke?: string;
  readonly payload?: LeadOrigin;
}

interface LabelLayerProps {
  /** `x`/`y` nunca são lidos: existem só para o Label não cair no ramo cartesiano da checagem de
   * tipo fraco do Recharts, em que `ViewBox` é a união de cartesiano e polar. */
  readonly viewBox?: {
    readonly cx?: number;
    readonly cy?: number;
    readonly outerRadius?: number;
    readonly x?: number;
    readonly y?: number;
  };
}

interface SliceGeometry {
  readonly id: string;
  readonly name: string;
  readonly count: number;
  readonly percent: number;
  readonly isAbsent: boolean;
  /** Meio do setor na convenção do Recharts: zero às 3 horas, crescendo no sentido anti-horário. */
  readonly midAngle: number;
}

interface PlacedLabel extends SliceGeometry {
  readonly side: -1 | 1;
  readonly anchorX: number;
  readonly anchorY: number;
  readonly elbowX: number;
  readonly elbowY: number;
  readonly textX: number;
  readonly textY: number;
}

/** Cor da fatia: sem preenchimento na ausência, categórica por slot fixo nas declaradas (COR-3). */
function sliceFill(row: LeadOrigin): string | undefined {
  if (row.slot === undefined) return undefined;
  return SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0];
}

function estimateTextWidth(text: string, family: 'grotesk' | 'manrope'): number {
  const table = CHAR_WIDTH_11PX[family];
  let total = 0;
  for (const char of text) {
    if (char >= '0' && char <= '9') total += table.digit;
    else if (char !== char.toLowerCase()) total += table.upper;
    else if (char !== char.toUpperCase()) total += table.lower;
    else total += CHAR_WIDTH_FALLBACK;
  }
  return total;
}

/**
 * Percentual inteiro pelo maior resto, sempre somando 100 (NUM-2).
 *
 * Devolve `null` quando não há todo a repartir, em vez de uma lista de zeros: percentual de nada
 * não é zero por cento, e a EST-1b manda a ausência morar no tipo e não num ramo silencioso.
 */
function integerPercents(values: readonly number[]): readonly number[] | null {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return null;
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

/** Origens declaradas em ordem decrescente e a ausência por último, fora da ordenação. */
function orderRows(rows: readonly LeadOrigin[]): readonly LeadOrigin[] {
  const valid = rows.filter((row) => row.count > 0);
  const declared = valid.filter((row) => row.declared).sort((a, b) => b.count - a.count);
  return [...declared, ...valid.filter((row) => !row.declared)];
}

/** O texto da segunda linha do rótulo, que é o mesmo em toda medida da peça. */
function valueLine(count: number, percent: number): string {
  return `${formatInt(count)} leads, ${formatPercent(percent / 100, 0)}`;
}

/**
 * Posição de cada rótulo externo, com anticolisão por lado.
 *
 * O empurrão é do topo para baixo, na ordem de `y` crescente, que do mesmo lado do disco é a
 * ordem angular: manter essa ordem é o que garante que duas linhas guia não se cruzem. Quando o
 * grupo estoura o piso do corpo, ele sobe inteiro, também sem reordenar.
 */
function placeLabels(
  slices: readonly SliceGeometry[],
  cx: number,
  cy: number,
  radius: number,
): readonly PlacedLabel[] {
  const anchored: readonly PlacedLabel[] = slices.map((slice) => {
    const angle = -slice.midAngle * RADIAN;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const side: -1 | 1 = cos < 0 ? -1 : 1;
    return {
      ...slice,
      side,
      anchorX: cx + radius * cos,
      anchorY: cy + radius * sin,
      elbowX: cx + (radius + LEADER_GAP) * cos,
      elbowY: cy + (radius + LEADER_GAP) * sin,
      textX: cx + side * (radius + LEADER_GAP + LEADER_RUN),
      textY: cy + (radius + LEADER_GAP) * sin,
    };
  });

  const top = LABEL_HALF_HEIGHT;
  /** O corpo do gráfico tem `2 × cy` de altura, porque `cy` é 50% e as margens de topo e base são iguais. */
  const bottom = Math.max(top, 2 * cy - LABEL_HALF_HEIGHT);
  const placed: PlacedLabel[] = [];

  for (const side of [-1, 1] as const) {
    const group = [...anchored].filter((label) => label.side === side).sort((a, b) => a.textY - b.textY);
    let cursor = top;
    const pushed = group.map((label) => {
      const textY = Math.max(cursor, label.textY);
      cursor = textY + LABEL_MIN_GAP;
      return { ...label, textY };
    });
    const last = pushed.at(-1);
    const overflow = last === undefined ? 0 : last.textY - bottom;
    placed.push(...(overflow > 0 ? pushed.map((label) => ({ ...label, textY: Math.max(top, label.textY - overflow) })) : pushed));
  }

  return placed;
}

export default function LeadOriginPie({ data = defaultData, height, className }: LeadOriginPieProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = orderRows(data);
  const percents = integerPercents(rows.map((row) => row.count));

  if (rows.length === 0 || percents === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: o mês não registrou entrada nova.</span>
      </div>
    );
  }

  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const declaredTotal = rows.filter((row) => row.declared).reduce((sum, row) => sum + row.count, 0);
  const leader = rows[0];
  const leaderPercent = percents[0];
  const absentIndex = rows.findIndex((row) => !row.declared);
  const absentPercent = absentIndex < 0 ? undefined : percents[absentIndex];

  const slices: readonly SliceGeometry[] = rows.map((row, index) => {
    const before = rows.slice(0, index).reduce((sum, item) => sum + item.count, 0);
    /** O ângulo sai da fração crua, a mesma que o Recharts usa para desenhar, e não do inteiro do rótulo. */
    const middle = (before + row.count / 2) / total;
    return {
      id: row.id,
      name: row.name,
      count: row.count,
      percent: percents[index] ?? 0,
      isAbsent: !row.declared,
      midAngle: 90 - 360 * middle,
    };
  });

  /**
   * A largura reservada para o rótulo sai do dado, nunca de uma constante: o maior rótulo do
   * recorte define a margem, e o arredondamento é para cima em passo de 2 px. Superestimar encolhe
   * o disco, que é visível e inofensivo; subestimar cortaria a tinta na borda do corpo.
   */
  const widest = slices.reduce(
    (largest, slice) =>
      Math.max(largest, estimateTextWidth(slice.name, 'manrope'), estimateTextWidth(valueLine(slice.count, slice.percent), 'grotesk')),
    0,
  );
  const marginX = Math.ceil((LEADER_GAP + LEADER_RUN + widest + LEADER_TIP) / 2) * 2;

  const reading =
    leader && leaderPercent !== undefined
      ? `${leader.name} lidera com ${formatPercent(leaderPercent / 100, 0)}; origem declarada em ${formatRateWithVolume(declaredTotal, total, 1)} leads do mês.`
      : `${formatInt(total)} leads no mês, sem origem que lidere.`;

  const summary = [
    `Gráfico de pizza com a origem dos ${formatInt(total)} leads do mês em ${String(rows.length - (absentIndex < 0 ? 0 : 1))} origens declaradas mais a fatia vazada de origem ausente.`,
    leader && leaderPercent !== undefined ? `${leader.name} lidera com ${formatPercent(leaderPercent / 100, 0)}.` : '',
    absentPercent === undefined
      ? ''
      : `${formatPercent(absentPercent / 100, 0)} chegaram sem origem declarada, e a cobertura é de ${formatRateWithVolume(declaredTotal, total, 1)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderSlice = (props: SliceShapeProps): ReactElement => (
    <Sector
      cx={props.cx}
      cy={props.cy}
      endAngle={props.endAngle}
      fill={props.fill ?? 'none'}
      innerRadius={props.innerRadius}
      outerRadius={props.outerRadius}
      startAngle={props.startAngle}
      stroke={props.stroke ?? 'var(--surface-raised)'}
      strokeWidth={props.payload?.declared === false ? 1.5 : 2}
    />
  );

  const renderLabels = ({ viewBox }: LabelLayerProps): ReactElement | null => {
    const { cx, cy, outerRadius: radius } = viewBox ?? {};
    if (cx === undefined || cy === undefined || radius === undefined) return null;
    return (
      <g>
        {placeLabels(slices, cx, cy, radius).map((label) => (
          <g key={label.id}>
            <path
              d={`M${String(label.anchorX)},${String(label.anchorY)} L${String(label.elbowX)},${String(label.elbowY)} L${String(label.textX - label.side * LEADER_TIP)},${String(label.textY)}`}
              fill="none"
              stroke={LEADER_COLOR}
              strokeWidth={1}
            />
            <text textAnchor={label.side === 1 ? 'start' : 'end'} x={label.textX}>
              <tspan
                className="font-sans"
                fill={label.isAbsent ? 'var(--text-muted)' : 'var(--text-secondary)'}
                fontSize={LABEL_FONT_SIZE}
                x={label.textX}
                y={label.textY - 5}
              >
                {label.name}
              </tspan>
              <tspan
                className="font-display"
                fill={label.isAbsent ? 'var(--text-muted)' : 'var(--text-primary)'}
                fontSize={LABEL_FONT_SIZE}
                x={label.textX}
                y={label.textY + 10}
              >
                {valueLine(label.count, label.percent)}
              </tspan>
            </text>
          </g>
        ))}
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          {/* `minAngle` fica no padrão 0 do Recharts: a fatia de 2% não pode ser inflada para caber. */}
          <PieChart accessibilityLayer={false} margin={{ bottom: MARGIN_Y, left: marginX, right: marginX, top: MARGIN_Y }}>
            <Pie
              cx="50%"
              cy="50%"
              data={rows}
              dataKey="count"
              endAngle={-270}
              isAnimationActive={animate}
              label={false}
              labelLine={false}
              nameKey="name"
              outerRadius={OUTER_RADIUS}
              shape={renderSlice}
              startAngle={90}
            >
              {rows.map((row) => (
                <Cell fill={sliceFill(row)} key={row.id} stroke={row.declared ? undefined : LEADER_COLOR} />
              ))}
              {/* Sem `position="center"`: com ela o Label cai no ramo cartesiano e não recebe o
                  viewBox polar com `cx`, `cy` e `outerRadius`, que é o que a camada de rótulos lê. */}
              <Label content={renderLabels} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
