import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, Cell, LabelList, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CampaignTailData } from './data';

/**
 * Pizza com detalhamento de Outros no caso difícil: a cauda tem 23 campanhas, todas abaixo de 1% dos
 * leads do mês, e nenhuma lista cabe inteira no cartão. O painel abre as 10 maiores e fecha a conta
 * numa linha escrita com a contagem e a soma das que sobraram, porque rolagem não existe em cartão e
 * reticência apagaria nome de campanha (TIP-7). O critério que manda uma campanha para a cauda está
 * no rodapé, e duas checagens em TypeScript recusam desenhar quando o agrupamento deixa de ser
 * honesto: cauda maior que a maior fatia nomeada, ou linha de cauda que viola o próprio teto.
 */
export interface CampaignTailBarOfPieProps {
  readonly data?: CampaignTailData;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas por número, não por preset (GEO-1). A conta, com a moldura `card` de recuo 33 e cabeçalho de
 * uma linha: corpo = 960 − 66 por 560 − 66 − 40,5 − 12, isto é 894 x 441,5 px. As linhas escritas são
 * quatro, a lista de identificação (24 px com o vão), o rodapé do critério (24,5 px com o vão), o
 * cabeçalho do painel (24 px) e a linha do resto da cauda (18 px), e o que sobra para as 10 barras é
 * 338 px. Daí o plano de 326 px, a banda de 32,6 px e a espessura de 13,04 px, acima do piso de 12 px
 * da ESP-2. Nenhum preset fecha esta conta: no `largo` de 960x400 a espessura cai para 7,1 px.
 */
const PANEL_HEIGHT = 380;
const PIE_BOX_WIDTH = 320;
const PIE_CENTER_X = PIE_BOX_WIDTH / 2;
const PIE_CENTER_Y = PANEL_HEIGHT / 2;
const PIE_RADIUS = 140;
const PANEL_GAP = 24;
/**
 * O conector para 8 px antes da borda do painel. Sem esse recuo a ponta da reta encosta na primeira
 * letra do cabeçalho do detalhe e na da linha do resto da cauda, e a `COLISAO-TEXTO` não pega isso,
 * porque ela só compara texto com texto: linha contra letra é dos olhos, e o PNG de conferência da
 * primeira rodada mostrou os dois se tocando nas duas pontas.
 */
const CONNECTOR_INSET = 8;
const PANEL_ANCHOR_X = PIE_BOX_WIDTH + PANEL_GAP - CONNECTOR_INSET;
/**
 * Teto de largura do painel. Sem ele a barra de 8 leads atravessa o cartão inteiro e fica mais longa
 * que o raio da fatia de 268 leads ao lado, o que faz a cauda parecer o assunto; com o teto, o painel
 * ocupa a largura que as 10 linhas precisam e o disco volta a ser a mensagem.
 */
const PANEL_MAX_WIDTH = 528;
const PANEL_TOP_Y = 0;
const PANEL_BOTTOM_Y = PANEL_HEIGHT;
const RADIAN = Math.PI / 180;
const LABEL_RADIUS_FRACTION = 0.62;
/** Abaixo disto o rótulo interno não cabe no arco; quem nomeia a fatia é a lista de identificação (ROT-10). */
const MIN_LABEL_FRACTION = 0.05;
/** Neutro da cauda: `--text-muted` mede 5,21:1 no escuro e 5,37:1 no claro contra o cartão, acima do piso de 3:1. */
const TAIL_FILL = 'var(--text-muted)';
/**
 * Texto vazado na cor do cartão, SEM halo (ROT-7b): o rótulo tem a fatia inteira por baixo, e o halo
 * da ROT-7 é a mesma `--surface-raised`, que no tema claro é o mesmo branco do vazado e apagaria a
 * letra por dentro. Vazado mede de 5,21:1 a 6,18:1 sobre as cinco cores desta peça.
 */
const SLICE_LABEL_FILL = 'var(--surface-raised)';
const CONNECTOR_STROKE = 'var(--text-muted)';
const VALUE_LABEL_GAP = 6;
const BAR_MAX = 16;
/** Cabe o nome mais largo da cauda, "Diagnóstico de carteira", que soma 139 px de tinta em Manrope de 12 px. */
const NAME_AXIS_WIDTH = 148;
const MARGIN = { top: 6, right: 60, bottom: 6, left: 0 } as const;
/** `barCategoryGap` de 30%, o piso da ESP-2: o vão sai dos dois lados da banda, então a barra fica com 40% dela. */
const BAR_CATEGORY_GAP = '30%';

interface Slice {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  readonly fill: string;
}

/**
 * Ponto a um raio dado, numa fração acumulada do total, na convenção de ângulo do Recharts (0 grau é
 * o 3 horas; o ângulo decresce no sentido horário conforme a fração acumulada cresce).
 */
function pointAtFraction(startAngle: number, fraction: number): { x: number; y: number } {
  const angleDeg = startAngle - 360 * fraction;
  const angleRad = -angleDeg * RADIAN;
  return { x: PIE_CENTER_X + PIE_RADIUS * Math.cos(angleRad), y: PIE_CENTER_Y + PIE_RADIUS * Math.sin(angleRad) };
}

/**
 * Percentual inteiro pelo maior resto, sempre somando 100 (NUM-2).
 *
 * Devolve `null` quando não há todo a repartir, em vez de uma lista de zeros: percentual de nada não
 * é zero por cento, e a EST-1b manda a ausência morar no tipo, não num ramo silencioso.
 */
function integerPercents(values: readonly number[], base: number): readonly number[] | null {
  if (base <= 0 || values.length === 0) return null;
  const raw = values.map((value) => (value / base) * 100);
  const floors = raw.map((value) => Math.floor(value));
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  const result = [...floors];
  let missing = 100 - floors.reduce((sum, value) => sum + value, 0);
  // O passo inverte quando os pisos já passam de 100, para o resto sair de quem tem a menor fração:
  // sem isso a soma impressa poderia fechar em 101, e a ROT-10 mede a soma do que está escrito.
  const step = missing >= 0 ? 1 : -1;
  const queue = missing >= 0 ? order : [...order].reverse();
  for (const { index } of queue) {
    if (missing === 0) break;
    result[index] = (result[index] ?? 0) + step;
    missing -= step;
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

export default function CampaignTailBarOfPie({ data = defaultData, height, className }: CampaignTailBarOfPieProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const tailRows = [...data.tail].sort((a, b) => b.leads - a.leads);
  const shown = tailRows.slice(0, data.detailRows);
  const hidden = tailRows.slice(data.detailRows);
  const tailTotal = tailRows.reduce((sum, row) => sum + row.leads, 0);
  const hiddenTotal = hidden.reduce((sum, row) => sum + row.leads, 0);
  const hiddenMax = hidden.reduce((max, row) => Math.max(max, row.leads), 0);
  const namedTotal = data.named.reduce((sum, row) => sum + row.leads, 0);
  const namedMax = data.named.reduce((max, row) => Math.max(max, row.leads), 0);
  const total = namedTotal + tailTotal;

  const slices: readonly Slice[] = [
    ...data.named.map((row) => ({
      id: row.id,
      name: row.name,
      leads: row.leads,
      fill: CHART_SERIES_COLORS[row.slot] ?? TAIL_FILL,
    })),
    { id: 'outros', name: 'Outros', leads: tailTotal, fill: TAIL_FILL },
  ];
  const percents = integerPercents(
    slices.map((slice) => slice.leads),
    total,
  );

  if (percents === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há campanha para agrupar nem cauda para abrir.</span>
      </div>
    );
  }

  // Primeira checagem: cauda maior que a maior fatia nomeada quer dizer teto baixo ou categoria mal
  // definida, e nesse caso o desenho passaria a afirmar que a maior parte do mês é "Outros".
  // Segunda: linha de cauda acima do próprio teto declarado é agrupamento que não segue a sua regra.
  // Nos dois casos a peça recusa desenhar, porque as duas pizzas ficariam bonitas e mentirosas.
  const tailOverflows = tailTotal > namedMax;
  const brokenRule = tailRows.find((row) => row.leads / total >= data.tailMaxShare);

  if (tailOverflows || brokenRule !== undefined) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>
          {formatUnavailable()}:{' '}
          {tailOverflows
            ? 'a cauda agrupada passou a maior campanha nomeada, e o agrupamento precisa ser revisto antes do desenho.'
            : 'uma campanha da cauda passou o teto declarado, e o agrupamento precisa ser revisto antes do desenho.'}
        </span>
      </div>
    );
  }

  const tailPercent = percents[percents.length - 1] ?? 0;
  const leaderIndex = slices.reduce((best, slice, index) => (slice.leads > (slices[best]?.leads ?? -1) ? index : best), 0);
  const leader = slices[leaderIndex];
  const leaderPercent = percents[leaderIndex] ?? 0;

  // A pizza gira para "Outros" ficar centrada às 3 horas, de frente para o painel: com f a fração de
  // "Outros", startAngle = -180 * f e endAngle = startAngle - 360 deixam a fatia simétrica em torno do
  // eixo horizontal que aponta para o painel (ROT-11), e os dois conectores saem retos das bordas da
  // fatia até os cantos da caixa de detalhe, sem contornar o disco.
  const tailFraction = tailTotal / total;
  const pieStartAngle = -180 * tailFraction;
  const pieEndAngle = pieStartAngle - 360;
  const edgeStart = pointAtFraction(pieStartAngle, namedTotal / total);
  const edgeEnd = pointAtFraction(pieStartAngle, 1);

  /** A regra da cauda, escrita na tela: sem ela "Outros" é uma caixa fechada (GEO-12). */
  const tailRule = `Outros reúne as ${formatInt(tailRows.length)} campanhas abaixo de ${formatPercent(data.tailMaxShare, 0)} dos leads do mês; o painel abre as ${formatInt(shown.length)} maiores, da maior para a menor.`;
  /** O resto da cauda vira contagem escrita, nunca rolagem nem overflow escondido. */
  const restLine =
    hidden.length === 0
      ? ''
      : `mais ${formatInt(hidden.length)} campanhas somam ${formatInt(hiddenTotal)} leads, e a maior delas tem ${formatInt(hiddenMax)} leads`;

  const summary = [
    // A frase mede 213 caracteres com o dado padrão, dentro dos 100 a 250 da ACE-1 e abaixo do aviso
    // de 235: a menção à fatia Outros saiu daqui porque a terceira sentença já a nomeia, e o que a
    // cauda carrega é a conclusão, não a repetição.
    `Gráfico de pizza com a origem dos ${formatInt(total)} leads de ${formatMonthShort(data.month)} em ${String(data.named.length)} campanhas nomeadas.`,
    leader === undefined ? '' : `${leader.name} lidera com ${formatPercent(leaderPercent / 100, 0)}.`,
    `Outros soma ${formatPercent(tailPercent / 100, 0)} e reúne ${formatInt(tailRows.length)} campanhas abaixo de ${formatPercent(data.tailMaxShare, 0)} cada, das quais o painel abre as ${formatInt(shown.length)} maiores.`,
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

  /** Nome inteiro, sem reticência: a TIP-7 não aceita nome de marca desenhada cortado. */
  const renderName = ({ y, payload }: NameTickProps): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );

  // O valor sai na ponta livre da barra, sobre o cartão, e sem halo: a ROT-7 tira o halo de onde ele
  // apagaria marca de traço fino, e os conectores de 1 px terminam na borda esquerda do painel, longe
  // da ponta direita das barras.
  const renderValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : shown[index];
    if (row === undefined) return null;
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-secondary)"
        fontSize={12}
        fontWeight={500}
        x={Number(x) + Number(width) + VALUE_LABEL_GAP}
        y={Number(y) + Number(barHeight) / 2}
      >
        {`${formatInt(row.leads)} leads`}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="flex min-h-0 flex-1 items-start gap-6">
        <div className="relative shrink-0" style={{ height: PANEL_HEIGHT, width: PIE_BOX_WIDTH }}>
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
          {/* Os dois conectores do bar of pie: da borda de cima e da borda de baixo da fatia "Outros"
              até os dois cantos da caixa do painel de detalhe. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-visible"
            viewBox={`0 0 ${String(PIE_BOX_WIDTH)} ${String(PANEL_HEIGHT)}`}
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
        <div className="flex min-w-0 flex-1 flex-col gap-2" style={{ height: PANEL_HEIGHT, maxWidth: PANEL_MAX_WIDTH }}>
          <p className="shrink-0 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">Outros</span>:{' '}
            <span className="kpi-number font-medium text-text-primary">{formatInt(tailTotal)} leads</span> (
            {formatPercent(tailPercent / 100, 0)} do total)
          </p>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={shown} layout="vertical" margin={MARGIN}>
                <XAxis domain={[0, 'dataMax']} hide type="number" />
                <YAxis axisLine={false} dataKey="name" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
                <Bar dataKey="leads" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[0, 3, 3, 0]}>
                  {shown.map((row) => (
                    <Cell fill={TAIL_FILL} key={row.id} />
                  ))}
                  <LabelList content={renderValue} dataKey="leads" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {restLine === '' ? null : (
            <p aria-hidden className="shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
              {restLine}
            </p>
          )}
        </div>
      </div>
      {/* Lista de identificação: nome e percentual de toda fatia (ROT-10), com a contagem que
          "Outros" reúne no próprio rótulo (COR-4). aria-hidden porque a frase acessível repete. */}
      <ul aria-hidden className="mt-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1.5">
        {slices.map((slice, index) => (
          <li className="flex items-center gap-1.5 text-xs text-text-secondary" key={slice.id}>
            <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: slice.fill }} />
            <span>{slice.id === 'outros' ? `${slice.name} (n=${formatInt(tailRows.length)})` : slice.name}</span>
            <span className="font-display text-text-muted">{formatPercent((percents[index] ?? 0) / 100, 0)}</span>
          </li>
        ))}
      </ul>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {tailRule}
      </p>
    </div>
  );
}
