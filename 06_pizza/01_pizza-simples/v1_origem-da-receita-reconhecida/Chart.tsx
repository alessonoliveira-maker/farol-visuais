import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type RevenueOrigin } from './data';

/**
 * Pizza simples: até cinco fatias de um todo único, ordenadas do maior para o menor a partir
 * das 12 horas no sentido horário, com o percentual escrito dentro de cada fatia e uma lista de
 * identificação por nome e percentual abaixo do gráfico, para toda fatia ficar legível sem abrir
 * a dica. É a forma de referência da família: destaque, legenda tabular com seleção e rótulo
 * externo com linha guia vivem em outras versões.
 */
export interface RevenueOriginPieProps {
  readonly data?: readonly RevenueOrigin[];
  readonly height?: number;
  readonly className?: string;
}

/** Teto de fatias antes de agrupar a cauda em "Outros" (a base de hoje não o exercita). */
const MAX_SLICES = 5;
const OTHER_LABEL = 'Outros';
/** Abaixo de 18 graus (5% do círculo) o rótulo interno não cabe: some, e o valor fica na dica. */
const MIN_LABEL_FRACTION = 0.05;
/** Slots categóricos na ordem da COR-8 (1, 3, 6, 5): a cor segue o `slot` do dado, nunca a posição pós-ordenação. */
const SLOT_COLORS = [
  CHART_SERIES_COLORS[0],
  CHART_SERIES_COLORS[2],
  CHART_SERIES_COLORS[5],
  CHART_SERIES_COLORS[4],
] as const;
/** Slot reservado para a cauda agrupada em "Outros" pelo `prepareSlices` (não exercido pela base de hoje); pinta em neutro, nunca em cor categórica (ver `sliceFill`). */
const OTHER_SLOT = 4;
const OUTER_RADIUS = '76%';
const LABEL_RADIUS_FRACTION = 0.62;
const RADIAN = Math.PI / 180;
/** Halo na cor do cartão: o percentual precisa de contraste sobre qualquer uma das quatro cores. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/**
 * Ordena do maior para o menor e agrupa a cauda além do teto em "Outros" (ponto delicado do estudo).
 *
 * O filtro de `value > 0` continua sendo a decisão certa (não existe fatia de zero nem de
 * negativo), mas o descarte não pode ser calado: quem chama conta as linhas descartadas em
 * `droppedCount` e escreve o número no rodapé, porque senão o leitor toma os 100% do desenho pelo
 * universo inteiro (conserto de 2026-09-25).
 */
function prepareSlices(rows: readonly RevenueOrigin[], max = MAX_SLICES): readonly RevenueOrigin[] {
  const valid = [...rows].filter((row) => row.value > 0).sort((a, b) => b.value - a.value);
  if (valid.length <= max) return valid;
  const head = valid.slice(0, max - 1);
  const tail = valid.slice(max - 1);
  return [
    ...head,
    { id: 'outros', name: OTHER_LABEL, value: tail.reduce((sum, row) => sum + row.value, 0), slot: OTHER_SLOT },
  ];
}

/** Cor da fatia: neutra para a cauda agrupada em "Outros" (COR-8), categórica por slot fixo nas demais (COR-3). */
function sliceFill(row: RevenueOrigin): string {
  return row.id === 'outros' ? 'var(--line-strong)' : (SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0]);
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
  readonly percent?: number;
  readonly index?: number;
}

export default function RevenueOriginPie({ data = defaultData, height, className }: RevenueOriginPieProps) {
  const animate = useAnimateOnce();
  const rows = prepareSlices(data);
  const percents = integerPercents(rows.map((row) => row.value));
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const style = height === undefined ? undefined : { height };
  /** Quantas categorias o `prepareSlices` deixou fora do todo por não ter valor positivo. */
  const droppedCount = data.filter((row) => row.value <= 0).length;

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        {/* Recorte vazio e recorte inteiro descartado são dois estados: o segundo tem categoria, e
            atribuí-lo ao período seria mentir sobre o motivo. */}
        <span>
          {droppedCount === 0
            ? 'Nenhuma linha neste recorte: não houve receita reconhecida no período.'
            : `Nenhuma fatia a desenhar: as ${formatInt(droppedCount)} categorias do recorte estão sem valor positivo.`}
        </span>
      </div>
    );
  }

  const leaderIndex = rows.reduce((best, row, index) => (row.value > (rows[best]?.value ?? -1) ? index : best), 0);
  const leader = rows[leaderIndex];
  const leaderPercent = percents[leaderIndex];

  /**
   * A conclusão vem antes da base, e a frase é curta de propósito. A redação anterior começava pelo
   * total e terminava no percentual do líder, o que punha o número da conclusão na cauda: qualquer
   * corte de largura levava embora justamente o que a linha existe para dizer.
   */
  const reading =
    leader && leaderPercent !== undefined
      ? `${leader.name} lidera com ${formatPercent(leaderPercent / 100, 0)} dos ${formatCurrencyCompact(total)} do trimestre.`
      : null;

  /** O descarte declarado: o mesmo texto vai para o rodapé e para a frase acessível. */
  const droppedNote =
    droppedCount === 0
      ? null
      : `${formatInt(droppedCount)} ${droppedCount === 1 ? 'categoria' : 'categorias'} fora do todo, sem valor positivo: os 100% são do que ficou`;

  const summary = [
    `Gráfico de pizza com a origem da receita reconhecida do 3º trimestre, dividida em ${String(rows.length)} categorias.`,
    rows
      .map((row, index) => `${row.name} soma ${formatPercent((percents[index] ?? 0) / 100, 0)}`)
      .join(', '),
    `Total de ${formatCurrencyCompact(total)}.`,
    droppedNote === null ? '' : `${droppedNote}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderLabel = ({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius: sliceOuter = 0, percent = 0, index = -1 }: SliceLabelProps): ReactElement | null => {
    if (percent < MIN_LABEL_FRACTION) return null;
    const pct = percents[index];
    if (pct === undefined) return null;
    const radius = innerRadius + (sliceOuter - innerRadius) * LABEL_RADIUS_FRACTION;
    const angle = -midAngle * RADIAN;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="middle" x={x} y={y}>
        {formatPercent(pct / 100, 0)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {/* Sem `truncate`: a frase termina no valor do todo, e reticência de texto apaga número, não
          sobra de redação. Não cabendo numa linha, ela quebra em duas e o gráfico cede os 16 px. */}
      {reading ? <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">{reading}</p> : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer={false}>
            <Tooltip content={<ChartTooltip valueFormat="currencyCompact" />} isAnimationActive={false} />
            <Pie
              cx="50%"
              cy="50%"
              data={rows}
              dataKey="value"
              endAngle={-270}
              isAnimationActive={animate}
              label={renderLabel}
              labelLine={false}
              nameKey="name"
              outerRadius={OUTER_RADIUS}
              startAngle={90}
              stroke="var(--surface-raised)"
              strokeWidth={2}
            >
              {rows.map((row) => (
                <Cell fill={sliceFill(row)} key={row.id} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Lista de identificação: nome e percentual de toda fatia, inclusive as que ficam abaixo do
          piso do rótulo interno (ROT-4, ROT-5, ACE-2). aria-hidden porque a frase acessível da
          raiz já enumera as mesmas categorias. */}
      <ul aria-hidden className="mt-2 flex shrink-0 flex-col gap-2.5">
        {rows.map((row, index) => (
          <li className="flex items-center gap-2.5 text-xs text-text-secondary" key={row.id}>
            <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: sliceFill(row) }} />
            <span className="min-w-0 flex-1">{row.name}</span>
            <span className="font-display shrink-0">{formatPercent((percents[index] ?? 0) / 100, 0)}</span>
          </li>
        ))}
      </ul>
      {/* Rodapé do que saiu da amostra, na forma de `09_dispersao-e-bolhas/01_dispersao-simples/v1`:
          o percentual inteiro soma 100 entre as fatias desenhadas, e só esta linha diz que o todo
          é menor que o recorte. */}
      {droppedNote === null ? null : (
        <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
          {droppedNote}
        </p>
      )}
    </div>
  );
}
