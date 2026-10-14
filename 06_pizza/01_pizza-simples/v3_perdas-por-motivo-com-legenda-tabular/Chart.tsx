import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, selectedId as defaultSelectedId, type LossReason } from './data';

/**
 * Pizza pequena com legenda tabular: o disco carrega a fração e a legenda carrega os números
 * exatos, em colunas de largura fixa. O par vive junto porque ângulo não se lê com precisão e
 * contagem e valor não cabem dentro da fatia; a legenda é o número e a pizza é a proporção.
 */
export interface LossReasonPieProps {
  readonly data?: readonly LossReason[];
  readonly selectedId?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Diâmetro da pizza, em px: ela é o glifo da composição e a legenda é o corpo do cartão. */
const PIE_SIZE = 120;
const OUTER_RADIUS = 50;
/**
 * Ganho de raio da fatia em foco. Ele existe porque a opacidade sozinha não dá conta: o piso de
 * contraste da marca (ver `DIM_OPACITY`) deixa uma faixa estreita demais para o olho separar a
 * fatia acesa das apagadas, o que se viu no primeiro render. A geometria é o segundo canal que a
 * ACE-2 pede, e cabe na caixa: 50 mais 6 dá 56, contra os 60 de meio lado.
 */
const ACTIVE_RADIUS_GAIN = 6;
/**
 * Opacidade das fatias fora de foco. 0,75 é o piso que serve as cinco cores usadas ao mesmo
 * tempo: os mínimos medidos para ficar em 3:1 sobre o cartão são 0,66 em var(--chart-1), 0,66 em
 * var(--chart-3), 0,63 em var(--chart-5), 0,71 em var(--chart-6) e 0,72 em var(--text-muted).
 * Composto a 0,75 o pior caso mede 3,22:1, no tema claro. Descer mais levaria a marca abaixo do
 * piso, então a faixa de contraste disponível para este estado é estreita por medição, e não por
 * escolha de desenho.
 */
const DIM_OPACITY = 0.75;
/** Slots categóricos na ordem da COR-8 (1, 3, 6, 5): a cor segue o `slot` do dado. */
const SLOT_COLORS = [
  CHART_SERIES_COLORS[0],
  CHART_SERIES_COLORS[2],
  CHART_SERIES_COLORS[5],
  CHART_SERIES_COLORS[4],
] as const;
/** Neutro da cauda agrupada: passa 3:1 nos dois temas (5,21:1 e 5,37:1), ao contrário de var(--line-strong). */
const NEUTRAL_FILL = 'var(--text-muted)';
/** Uma classe só para o cabeçalho, as linhas e o total, para as cinco colunas nunca desalinharem. */
const ROW_GRID = 'grid w-full grid-cols-[0.625rem_minmax(0,1fr)_2.5rem_5.5rem_2.5rem] items-center gap-x-3 text-left';

interface SliceShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly startAngle?: number;
  readonly endAngle?: number;
  readonly fill?: string;
  readonly payload?: LossReason;
}

/** Cor da fatia: neutra na cauda agrupada, categórica por slot fixo nas demais (COR-3). */
function sliceFill(row: LossReason): string {
  if (row.slot === undefined) return NEUTRAL_FILL;
  return SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0];
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

/** Cauda agrupada por último e o resto em ordem decrescente de contagem, que é o que o ângulo mede. */
function orderRows(rows: readonly LossReason[]): readonly LossReason[] {
  const valid = rows.filter((row) => row.count > 0);
  const named = valid.filter((row) => row.parts === undefined).sort((a, b) => b.count - a.count);
  const tail = valid.filter((row) => row.parts !== undefined);
  return [...named, ...tail];
}

export default function LossReasonPie({
  data = defaultData,
  selectedId: initialSelectedId = defaultSelectedId,
  height,
  className,
}: LossReasonPieProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);
  const [hoverId, setHoverId] = useState<string | undefined>(undefined);

  const rows = orderRows(data);
  const percents = integerPercents(rows.map((row) => row.count));

  if (rows.length === 0 || percents === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma perda neste recorte: o trimestre não registrou oportunidade perdida.</span>
      </div>
    );
  }

  const totalCount = rows.reduce((sum, row) => sum + row.count, 0);
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
  /** O foco visível: o ponteiro ou o teclado manda como prévia, e sem ele vale a seleção, que não se apaga. */
  const activeId = hoverId ?? selectedId;
  const leader = rows[0];
  const leaderPercent = percents[0];
  /** O motivo que pesa mais em valor, que não é o mesmo que pesa mais em contagem: é o achado do cartão. */
  const byAmount = [...rows].sort((a, b) => b.amount - a.amount)[0];

  const reading =
    leader && leaderPercent !== undefined
      ? `${leader.name} concentra ${formatPercent(leaderPercent / 100, 0)} das ${formatInt(totalCount)} perdas do trimestre.`
      : `${formatInt(totalCount)} perdas no trimestre.`;

  const summary = [
    `Gráfico de pizza com as ${formatInt(totalCount)} oportunidades perdidas do trimestre em ${String(rows.length)} motivos, com contagem e valor na legenda.`,
    leader && leaderPercent !== undefined ? `${leader.name} concentra ${formatPercent(leaderPercent / 100, 0)} das perdas.` : '',
    byAmount && byAmount.id !== leader?.id ? `${byAmount.name} pesa mais em valor, com ${formatCurrencyCompact(byAmount.amount)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  function toggle(id: string): void {
    setSelectedId((current) => (current === id ? undefined : id));
  }

  const renderSlice = (props: SliceShapeProps): ReactElement => {
    const isActive = activeId !== undefined && props.payload?.id === activeId;
    const isDim = activeId !== undefined && !isActive;
    return (
      <Sector
        cx={props.cx}
        cy={props.cy}
        endAngle={props.endAngle}
        fill={props.fill}
        fillOpacity={isDim ? DIM_OPACITY : 1}
        innerRadius={props.innerRadius}
        outerRadius={(props.outerRadius ?? 0) + (isActive ? ACTIVE_RADIUS_GAIN : 0)}
        startAngle={props.startAngle}
        stroke="var(--surface-raised)"
        strokeWidth={2}
      />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      {/* Sem `flex-1`: o bloco fica no topo do corpo e a sobra do canvas vira respiro embaixo. Com
          `flex-1` a fileira esticava e abria um vão de 44 px entre a legenda e a nota de rodapé,
          que lia como acidente de alinhamento. */}
      <div className="flex shrink-0 items-start gap-6">
        <div className="shrink-0" style={{ height: PIE_SIZE, width: PIE_SIZE }}>
          <ResponsiveContainer height="100%" width="100%">
            <PieChart accessibilityLayer={false}>
              <Pie
                cx="50%"
                cy="50%"
                data={rows}
                dataKey="count"
                endAngle={-270}
                isAnimationActive={animate}
                label={false}
                nameKey="name"
                onMouseEnter={(entry) => {
                  const id = (entry.payload as LossReason | undefined)?.id;
                  if (id !== undefined) setHoverId(id);
                }}
                onMouseLeave={() => {
                  setHoverId(undefined);
                }}
                outerRadius={OUTER_RADIUS}
                shape={renderSlice}
                startAngle={90}
              >
                {rows.map((row) => (
                  <Cell fill={sliceFill(row)} key={row.id} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legenda tabular: é ela que carrega nome, contagem, valor e percentual de cada fatia, na
            mesma ordem angular do disco, com a linha de total no fim. */}
        <ul className="flex min-w-0 flex-1 flex-col gap-2">
          <li aria-hidden className={cn(ROW_GRID, 'text-[0.6875rem] text-text-muted')}>
            <span />
            <span>motivo</span>
            <span className="text-right">perdas</span>
            <span className="text-right">valor</span>
            <span className="text-right">%</span>
          </li>
          {rows.map((row, index) => {
            const isActive = row.id === activeId;
            return (
              <li key={row.id}>
                <button
                  aria-pressed={selectedId === row.id}
                  className={cn(ROW_GRID, 'border-0 bg-transparent p-0 text-xs')}
                  onBlur={() => {
                    setHoverId(undefined);
                  }}
                  onClick={() => {
                    toggle(row.id);
                  }}
                  onFocus={() => {
                    setHoverId(row.id);
                  }}
                  onMouseEnter={() => {
                    setHoverId(row.id);
                  }}
                  onMouseLeave={() => {
                    setHoverId(undefined);
                  }}
                  type="button"
                >
                  <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: sliceFill(row) }} />
                  <span className={cn('min-w-0', isActive ? 'font-bold text-text-primary' : 'text-text-secondary')}>{row.name}</span>
                  <span className="kpi-number text-right text-text-secondary">{formatInt(row.count)}</span>
                  <span className="kpi-number text-right text-text-secondary">{formatCurrencyCompact(row.amount)}</span>
                  <span className="kpi-number text-right text-text-muted">{formatPercent((percents[index] ?? 0) / 100, 0)}</span>
                </button>
                {/* A composição da cauda fica escrita no desenho, não numa dica: a ROT-10 não
                    reconhece a dica como lugar de nomear parte de um todo, e o preview estático
                    nem a mostra. */}
                {row.parts === undefined ? null : (
                  <p aria-hidden className="mt-0.5 pl-[1.375rem] text-[0.6875rem] text-text-muted">
                    inclui {row.parts.join(', ')}
                  </p>
                )}
              </li>
            );
          })}
          <li aria-hidden className={cn(ROW_GRID, 'text-xs')}>
            <span />
            <span className="text-text-secondary">Total</span>
            <span className="kpi-number text-right text-text-primary">{formatInt(totalCount)}</span>
            <span className="kpi-number text-right text-text-primary">{formatCurrencyCompact(totalAmount)}</span>
            <span className="kpi-number text-right text-text-muted">{formatPercent(1, 0)}</span>
          </li>
        </ul>
      </div>
      {/* Qual métrica o ângulo mede, dito no cartão (GEO-12): sem esta linha o leitor pode tomar a
          fatia pelo valor, que é a outra coluna da legenda. */}
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        As fatias medem a contagem de perdas; o valor vai na coluna à direita.
      </p>
    </div>
  );
}
