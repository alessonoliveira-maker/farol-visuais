import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  highlightId as defaultHighlightId,
  previousWeek as defaultPreviousWeek,
  type MeetingOutcome,
  type PreviousWeek,
} from './data';

/**
 * Pizza simples com uma fatia em destaque: a categoria que carrega a mensagem sai do disco por
 * deslocamento no próprio eixo do setor, acende em `--chart-1` e as demais ficam num neutro único.
 * O destaque não mora na cor, porque aceso contra neutro mede 1,12:1 no tema claro; ele mora no
 * deslocamento, no peso do rótulo e na anotação, que são canais que sobrevivem aos dois temas.
 */
export interface MeetingOutcomePieProps {
  readonly data?: readonly MeetingOutcome[];
  readonly highlightId?: string;
  readonly previousWeek?: PreviousWeek;
  readonly height?: number;
  readonly className?: string;
}

/** Deslocamento da fatia acesa ao longo do próprio eixo, em px. */
const EXPLODE_PX = 8;
/**
 * Margem reservada nos quatro lados: o deslocamento acontece na direção do setor aceso, que muda
 * com o dado, então não há um lado só a proteger. `EXPLODE_PX` mais 2 px de folga, múltiplo de 2.
 */
const EXPLODE_MARGIN = 10;
const MARGIN = { top: EXPLODE_MARGIN, right: EXPLODE_MARGIN, bottom: EXPLODE_MARGIN, left: EXPLODE_MARGIN } as const;
/** 84% do raio máximo: os 16% restantes são a segunda reserva do deslocamento, além da margem. */
const OUTER_RADIUS = '84%';
const LABEL_RADIUS_FRACTION = 0.62;
const RADIAN = Math.PI / 180;
/** Abaixo de 18 graus (5% do círculo) o rótulo interno não cabe na corda: some, e a lista carrega o número. */
const MIN_LABEL_FRACTION = 0.05;
const HIGHLIGHT_FILL = 'var(--chart-1)';
/**
 * Neutro único das fatias que não são a mensagem. `--text-muted` mede 5,21:1 no escuro e 5,37:1 no
 * claro contra o cartão, acima do piso de 3:1 da marca; `--line-strong`, o neutro de barra da 17.2,
 * mede 1,79:1 e 1,83:1 e desapareceria contra o cartão justamente na borda do disco.
 */
const NEUTRAL_FILL = 'var(--text-muted)';
/**
 * Texto vazado na cor do cartão: é o único par que passa 4,5:1 sobre o aceso (6,00:1 no claro) e
 * sobre o neutro (5,21:1 no escuro) ao mesmo tempo, então um valor só serve as duas famílias de
 * fatia. Sem halo: no tema claro `--surface-raised` é o mesmo branco do vazado e o halo apagaria o
 * próprio texto, medido em 1,00:1 (ROT-7).
 */
const SLICE_LABEL_FILL = 'var(--surface-raised)';

interface SliceShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly startAngle?: number;
  readonly endAngle?: number;
  readonly midAngle?: number;
  readonly fill?: string;
  readonly payload?: MeetingOutcome;
}

interface SliceLabelProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly midAngle?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly percent?: number;
  readonly index?: number;
}

/** Deslocamento do centro da fatia acesa: o mesmo vetor serve ao setor e ao rótulo dele. */
function explodeOffset(midAngle: number): { readonly dx: number; readonly dy: number } {
  const angle = -midAngle * RADIAN;
  return { dx: Math.cos(angle) * EXPLODE_PX, dy: Math.sin(angle) * EXPLODE_PX };
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

export default function MeetingOutcomePie({
  data = defaultData,
  highlightId = defaultHighlightId,
  previousWeek = defaultPreviousWeek,
  height,
  className,
}: MeetingOutcomePieProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = [...data].filter((row) => row.count > 0).sort((a, b) => b.count - a.count);
  const percents = integerPercents(rows.map((row) => row.count));

  if (rows.length === 0 || percents === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma agenda neste recorte: a semana não teve reunião marcada.</span>
      </div>
    );
  }

  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const highlightIndex = rows.findIndex((row) => row.id === highlightId);
  const highlight = highlightIndex < 0 ? undefined : rows[highlightIndex];
  const highlightPercent = percents[highlightIndex];

  const reading =
    highlight && highlightPercent !== undefined
      ? `${highlight.name} ficou em ${formatPercent(highlightPercent / 100, 0)} das ${formatInt(total)} agendas da semana.`
      : `${formatInt(total)} agendas na semana, sem categoria em destaque.`;

  /**
   * A base nomeada da ANO-2: nome da referência e valor, com o volume que a DAD-1 exige. O nome da
   * medida não cabe aqui junto do par taxa e volume dentro dos 50 caracteres da regra; ele vive na
   * linha de leitura logo acima e na linha da lista em peso 700, a um passo de distância.
   */
  const annotation = `Semana anterior: ${formatRateWithVolume(previousWeek.noShowCount, previousWeek.totalCount, 0)} agendas`;

  const others = rows
    .map((row, index) => ({ name: row.name, id: row.id, percent: percents[index] ?? 0 }))
    .filter((row) => row.id !== highlightId)
    .map((row) => `${row.name} ${formatPercent(row.percent / 100, 0)}`)
    .join(', ');

  const summary = [
    `Gráfico de pizza com o desfecho das ${formatInt(total)} agendas da semana em ${String(rows.length)} categorias.`,
    highlight && highlightPercent !== undefined
      ? `${highlight.name} soma ${formatPercent(highlightPercent / 100, 0)}, contra ${formatRateWithVolume(previousWeek.noShowCount, previousWeek.totalCount, 0)} na semana anterior.`
      : '',
    others === '' ? '' : `${others}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderSlice = (props: SliceShapeProps): ReactElement => {
    const isHighlight = props.payload?.id === highlightId;
    const { dx, dy } = isHighlight ? explodeOffset(props.midAngle ?? 0) : { dx: 0, dy: 0 };
    return (
      <Sector
        cx={(props.cx ?? 0) + dx}
        cy={(props.cy ?? 0) + dy}
        endAngle={props.endAngle}
        fill={props.fill}
        innerRadius={props.innerRadius}
        outerRadius={props.outerRadius}
        startAngle={props.startAngle}
        stroke="var(--surface-raised)"
        strokeWidth={2}
      />
    );
  };

  const renderLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius: sliceOuter = 0,
    percent = 0,
    index = -1,
  }: SliceLabelProps): ReactElement | null => {
    if (percent < MIN_LABEL_FRACTION) return null;
    const pct = percents[index];
    if (pct === undefined) return null;
    const isHighlight = rows[index]?.id === highlightId;
    const { dx, dy } = isHighlight ? explodeOffset(midAngle) : { dx: 0, dy: 0 };
    const radius = innerRadius + (sliceOuter - innerRadius) * LABEL_RADIUS_FRACTION;
    const angle = -midAngle * RADIAN;
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill={SLICE_LABEL_FILL}
        fontSize={12}
        fontWeight={isHighlight ? 700 : 500}
        textAnchor="middle"
        x={cx + dx + radius * Math.cos(angle)}
        y={cy + dy + radius * Math.sin(angle)}
      >
        {formatPercent(pct / 100, 0)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      {/* A pizza vai à direita e a coluna de leitura à esquerda porque o líder de 58% ocupa a
          metade direita do disco: a fatia acesa cai no flanco esquerdo, e é dali que a anotação
          precisa estar "ao lado" dela, sem linha de chamada dando a volta no disco (ROT-11). */}
      <div className="flex min-h-0 flex-1 items-center gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p aria-hidden className="text-[0.6875rem] text-text-muted">
            {annotation}
          </p>
          {/* Lista de identificação com contagem e percentual em colunas de largura fixa à direita
              (ROT-5, ROT-10), na mesma ordem angular das fatias. Três fatias dividem o mesmo
              neutro, então a amostra de cor não identifica sozinha: quem identifica é a ordem da
              lista somada ao percentual, que é único em cada linha. aria-hidden porque a frase
              acessível da raiz já enumera as mesmas categorias. */}
          <ul aria-hidden className="flex flex-col gap-2.5">
            <li className="flex items-center gap-2.5 text-[0.6875rem] text-text-muted">
              <span className="size-2.5 shrink-0" />
              <span className="min-w-0 flex-1">desfecho</span>
              <span className="w-8 shrink-0 text-right">agendas</span>
              <span className="w-10 shrink-0 text-right">%</span>
            </li>
            {rows.map((row, index) => {
              const isHighlight = row.id === highlightId;
              return (
                <li className="flex items-center gap-2.5 text-xs" key={row.id}>
                  <span
                    className="size-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: isHighlight ? HIGHLIGHT_FILL : NEUTRAL_FILL }}
                  />
                  <span className={cn('min-w-0 flex-1', isHighlight ? 'font-bold text-text-primary' : 'text-text-secondary')}>
                    {row.name}
                  </span>
                  <span className="kpi-number w-8 shrink-0 text-right text-text-secondary">{formatInt(row.count)}</span>
                  <span className="kpi-number w-10 shrink-0 text-right text-text-muted">
                    {formatPercent((percents[index] ?? 0) / 100, 0)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="aspect-square h-full max-h-full shrink-0">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart accessibilityLayer={false} margin={MARGIN}>
              <Pie
                cx="50%"
                cy="50%"
                data={rows}
                dataKey="count"
                endAngle={-270}
                isAnimationActive={animate}
                label={renderLabel}
                labelLine={false}
                nameKey="name"
                outerRadius={OUTER_RADIUS}
                shape={renderSlice}
                startAngle={90}
              >
                {rows.map((row) => (
                  <Cell fill={row.id === highlightId ? HIGHLIGHT_FILL : NEUTRAL_FILL} key={row.id} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
