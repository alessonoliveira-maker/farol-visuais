import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, Cell, LabelList, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PartnerGrowthData } from './data';

/**
 * Pizza com detalhamento de Outros (bar of pie) em que a cauda tem dono: a pizza principal fica
 * intacta, com as quatro origens nomeadas e a fatia "Outros" em neutro, e o painel de detalhe ao
 * lado acende a única origem pequena que mudou de patamar no mês. O critério que manda uma origem
 * para a cauda está escrito no rodapé, com a contagem de origens que ele reúne, porque "Outros"
 * sem critério declarado é a desonestidade típica desta forma.
 */
export interface PartnerGrowthBarOfPieProps {
  readonly data?: PartnerGrowthData;
  readonly height?: number;
  readonly className?: string;
}

const PIE_SIZE = 216;
const PIE_CENTER = PIE_SIZE / 2;
const PIE_RADIUS = 96;
const PANEL_GAP = 24;
/**
 * O conector para 8 px antes da borda do painel. Sem esse recuo a ponta da reta encosta na primeira
 * letra do cabeçalho do detalhe, e a `COLISAO-TEXTO` não pega isso, porque ela só compara texto com
 * texto: linha contra letra é dos olhos, e o PNG de conferência mostrou os dois se tocando.
 */
const CONNECTOR_INSET = 8;
const PANEL_ANCHOR_X = PIE_SIZE + PANEL_GAP - CONNECTOR_INSET;
/** Largura fixa da legenda tabular à direita, dimensionada pelo nome mais largo, "Site orgânico". */
const LEGEND_WIDTH = 216;
/** Colunas da legenda tabular (ROT-5): amostra, nome, contagem e percentual com largura fixa à direita. */
const LEGEND_GRID = 'grid grid-cols-[0.625rem_1fr_2.5rem_2.25rem] items-center gap-x-2 text-left';
/** Cantos da caixa do painel de detalhe, mesma altura da caixa da pizza (0 a PIE_SIZE). */
const PANEL_TOP_Y = 0;
const PANEL_BOTTOM_Y = PIE_SIZE;
const RADIAN = Math.PI / 180;
const LABEL_RADIUS_FRACTION = 0.62;
/** Abaixo disto o rótulo interno não cabe no arco; quem nomeia a fatia é a lista de identificação (ROT-10). */
const MIN_LABEL_FRACTION = 0.05;
/**
 * Slots categóricos na ordem da COR-8 (1, 3, 6, 5, 2, 4) com o slot 1 RESERVADO para o destaque do
 * painel, então as quatro origens nomeadas caem em 3, 6, 5 e 2. Duas consequências foram conferidas
 * antes de escolher: `--chart-1` aparece uma vez só na peça inteira, e não em duas categorias
 * diferentes (COR-3); e a própria COR-8 avisa que 2 junto de 6 cai para ΔE 4,1 em deuteranopia no
 * tema claro, logo exige o vão da COR-5 e rótulo em cada marca, que é o que a peça faz. A restrição
 * literal de `--chart-2` (hex de `--warning`) é para visual que pinta variação semântica no corpo:
 * aqui o crescimento de Parceiro é escrito em palavras e número, nunca em verde ou vermelho.
 */
const SLOT_COLORS = CHART_SERIES_COLORS;
/** Neutro da cauda: `--text-muted` mede 5,21:1 no escuro e 5,37:1 no claro contra o cartão, acima do piso de 3:1 da marca. */
const TAIL_FILL = 'var(--text-muted)';
/** A cor de destaque quando só uma coisa acende (COR-8), aqui só na barra do painel. */
const HIGHLIGHT_FILL = 'var(--chart-1)';
/**
 * Texto vazado na cor do cartão, SEM halo (ROT-7b): o rótulo tem a fatia inteira por baixo, e o
 * halo da ROT-7 é a mesma `--surface-raised`, que no tema claro é o mesmo branco do vazado e
 * apagaria a letra por dentro. Medido na matriz de pares: vazado sobre `--chart-3` 6,18:1, sobre
 * `--chart-6` 5,39:1, sobre `--chart-5` 5,90:1, sobre `--chart-2` 5,74:1 e sobre `--text-muted`
 * 5,21:1, todos acima do piso de 4,50:1 de texto.
 */
const SLICE_LABEL_FILL = 'var(--surface-raised)';
const CONNECTOR_STROKE = 'var(--text-muted)';
const VALUE_LABEL_GAP = 6;
const BAR_MAX = 16;
const NAME_AXIS_WIDTH = 78;
const MARGIN = { top: 6, right: 60, bottom: 6, left: 0 } as const;

interface Slice {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  readonly fill: string;
}

/**
 * Ponto a um raio dado, numa fração acumulada do total, na convenção de ângulo do Recharts
 * (0 grau é o 3 horas; o ângulo decresce no sentido horário conforme a fração acumulada cresce).
 */
function pointAtFraction(startAngle: number, fraction: number, radius: number = PIE_RADIUS): { x: number; y: number } {
  const angleDeg = startAngle - 360 * fraction;
  const angleRad = -angleDeg * RADIAN;
  return { x: PIE_CENTER + radius * Math.cos(angleRad), y: PIE_CENTER + radius * Math.sin(angleRad) };
}

/**
 * Percentual inteiro pelo maior resto, sempre somando 100 (NUM-2).
 *
 * Devolve `null` quando não há todo a repartir, em vez de uma lista de zeros: percentual de nada
 * não é zero por cento, e a EST-1b manda a ausência morar no tipo, não num ramo silencioso.
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

interface SliceLabelProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly midAngle?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly percent?: number;
  readonly index?: number;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

export default function PartnerGrowthBarOfPie({ data = defaultData, height, className }: PartnerGrowthBarOfPieProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const tailRows = [...data.tail].sort((a, b) => b.leads - a.leads);
  const tailTotal = tailRows.reduce((sum, row) => sum + row.leads, 0);
  const namedTotal = data.named.reduce((sum, row) => sum + row.leads, 0);
  const total = namedTotal + tailTotal;

  const slices: readonly Slice[] = [
    ...data.named.map((row) => ({
      id: row.id,
      name: row.name,
      leads: row.leads,
      // O recuo é o neutro da cauda, nunca o destaque: slot fora da tabela não pode acender uma
      // origem nomeada com a cor que a peça reservou para Parceiro.
      fill: SLOT_COLORS[row.slot] ?? TAIL_FILL,
    })),
    { id: 'outros', name: 'Outros', leads: tailTotal, fill: TAIL_FILL },
  ];
  const percents = integerPercents(slices.map((slice) => slice.leads));

  if (percents === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há origem para agrupar nem cauda para abrir.</span>
      </div>
    );
  }

  const tailPercent = percents[percents.length - 1] ?? 0;
  const leaderIndex = slices.reduce((best, slice, index) => (slice.leads > (slices[best]?.leads ?? -1) ? index : best), 0);
  const leader = slices[leaderIndex];
  const leaderPercent = percents[leaderIndex] ?? 0;
  const highlight = tailRows.find((row) => row.id === data.highlightId);

  // A pizza gira para "Outros" ficar centrada às 3 horas, de frente para o painel: com f a fração
  // de "Outros", startAngle = -180 * f e endAngle = startAngle - 360 deixam a fatia simétrica em
  // torno do eixo horizontal que aponta para o painel (ROT-11). Assim os dois conectores saem
  // retos das bordas da fatia até os cantos da caixa de detalhe, sem contornar o disco.
  const tailFraction = tailTotal / total;
  const pieStartAngle = -180 * tailFraction;
  const pieEndAngle = pieStartAngle - 360;
  const edgeStart = pointAtFraction(pieStartAngle, namedTotal / total);
  const edgeEnd = pointAtFraction(pieStartAngle, 1);

  /** A regra da cauda, escrita na tela: sem ela "Outros" é uma caixa fechada (GEO-12). */
  const tailRule = `Outros reúne as ${formatInt(tailRows.length)} origens com menos de ${formatInt(data.tailMaxLeads)} leads no mês, da maior para a menor.`;
  const reading =
    highlight === undefined
      ? `Outros soma ${formatInt(tailTotal)} leads (${formatPercent(tailPercent / 100, 0)} do mês) e se abre ao lado.`
      : `Outros soma ${formatInt(tailTotal)} leads (${formatPercent(tailPercent / 100, 0)} do mês), e ${highlight.name} já chega a ${formatInt(highlight.leads)} dos ${formatInt(data.tailMaxLeads)} que separam a cauda.`;
  const annotation =
    highlight === undefined
      ? ''
      : `${highlight.name}: ${formatInt(highlight.leads)} leads contra ${formatInt(highlight.previousLeads)} em ${formatMonthShort(data.previousMonth)}`;

  const summary = [
    `Gráfico de pizza com a origem dos ${formatInt(total)} leads de ${formatMonthShort(data.month)} em ${String(slices.length)} fatias.`,
    leader === undefined ? '' : `${leader.name} lidera com ${formatPercent(leaderPercent / 100, 0)}.`,
    `Outros reúne ${formatInt(tailRows.length)} origens abaixo de ${formatInt(data.tailMaxLeads)} leads e soma ${formatPercent(tailPercent / 100, 0)}.`,
    highlight === undefined
      ? ''
      : `Dentro dela, ${highlight.name} passou de ${formatInt(highlight.previousLeads)} para ${formatInt(highlight.leads)} leads.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderSliceLabel = ({
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
    const radius = innerRadius + (sliceOuter - innerRadius) * LABEL_RADIUS_FRACTION;
    const angle = -midAngle * RADIAN;
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill={SLICE_LABEL_FILL}
        fontSize={12}
        fontWeight={500}
        textAnchor="middle"
        x={cx + radius * Math.cos(angle)}
        y={cy + radius * Math.sin(angle)}
      >
        {formatPercent(pct / 100, 0)}
      </text>
    );
  };

  const renderName = ({ y, payload }: NameTickProps): ReactElement => {
    const name = String(payload?.value ?? '');
    const isHighlight = name === highlight?.name;
    return (
      <text
        className="font-sans"
        dominantBaseline="central"
        fill={isHighlight ? 'var(--text-primary)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={isHighlight ? 700 : 500}
        x={0}
        y={Number(y)}
      >
        {name}
      </text>
    );
  };

  // O valor sai na ponta livre da barra, sobre o cartão, e NÃO leva halo: a ROT-7 tira o halo de
  // onde ele apagaria marca de traço fino, e os dois conectores de 1 px terminam na borda esquerda
  // do painel, longe da ponta direita das barras, então não há cruzamento a proteger.
  const renderValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : tailRows[index];
    if (row === undefined) return null;
    const isHighlight = row.id === data.highlightId;
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill={isHighlight ? 'var(--text-primary)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={isHighlight ? 700 : 500}
        x={Number(x) + Number(width) + VALUE_LABEL_GAP}
        y={Number(y) + Number(barHeight) / 2}
      >
        {`${formatInt(row.leads)} leads`}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
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
          {/* Os dois conectores do bar of pie: da borda de cima e da borda de baixo da fatia
              "Outros" até os dois cantos da caixa do painel de detalhe. */}
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
            <span className="kpi-number font-medium text-text-primary">{formatInt(tailTotal)} leads</span> (
            {formatPercent(tailPercent / 100, 0)} do total)
          </p>
          {annotation === '' ? null : (
            <p aria-hidden className="shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
              {annotation}
            </p>
          )}
          <div className="min-h-0 flex-1">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart accessibilityLayer={false} barCategoryGap="34%" data={tailRows} layout="vertical" margin={MARGIN}>
                <XAxis domain={[0, 'dataMax']} hide type="number" />
                <YAxis axisLine={false} dataKey="name" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
                <Bar dataKey="leads" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[0, 3, 3, 0]}>
                  {tailRows.map((row) => (
                    <Cell fill={row.id === data.highlightId ? HIGHLIGHT_FILL : TAIL_FILL} key={row.id} />
                  ))}
                  <LabelList content={renderValue} dataKey="leads" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Legenda tabular de identificação: nome, contagem e percentual de toda fatia (ROT-5,
            ROT-10), com a contagem que "Outros" reúne no próprio rótulo (COR-4). Ela mora ao lado,
            e não embaixo, porque o painel de detalhe precisa de um teto de largura: com a coluna
            toda para ele, a barra de 18 leads ficava mais longa que o raio da fatia de 142. */}
        <ul aria-hidden className="flex shrink-0 flex-col gap-y-1.5" style={{ width: LEGEND_WIDTH }}>
          <li className={cn(LEGEND_GRID, 'text-[0.6875rem] text-text-muted')}>
            <span />
            <span>origem</span>
            <span className="text-right">leads</span>
            <span className="text-right">%</span>
          </li>
          {slices.map((slice, index) => (
            <li className={cn(LEGEND_GRID, 'text-xs')} key={slice.id}>
              <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: slice.fill }} />
              <span className="min-w-0 text-text-secondary">
                {slice.id === 'outros' ? `${slice.name} (n=${formatInt(tailRows.length)})` : slice.name}
              </span>
              <span className="kpi-number text-right text-text-secondary">{formatInt(slice.leads)}</span>
              <span className="kpi-number text-right text-text-muted">{formatPercent((percents[index] ?? 0) / 100, 0)}</span>
            </li>
          ))}
        </ul>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {tailRule}
      </p>
    </div>
  );
}
