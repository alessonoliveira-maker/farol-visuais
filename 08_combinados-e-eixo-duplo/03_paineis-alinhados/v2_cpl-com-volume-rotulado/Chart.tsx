import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import type { LabelProps } from 'recharts';
import { CartesianGrid, ComposedChart, LabelList, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QualifiedLeadCost } from './data';

/**
 * A variação deste modelo que dispensa o painel extra: um eixo só, o do CPL, e o volume de leads
 * escrito nos dois meses que mudam a leitura. É a outra saída que a EIX-8 admite no lugar do eixo
 * duplo, e ela cabe onde não há altura para dois painéis: o rótulo direto carrega a segunda
 * grandeza sem pedir escala nem legenda para ela.
 */
export interface QualifiedCplWithVolumeProps {
  readonly data?: readonly QualifiedLeadCost[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 20, right: 12, bottom: 0, left: 0 } as const;
/**
 * Cabe `R$ 300` com folga, dentro da faixa de 48 a 64 da EIX-6.
 *
 * A reserva do Recharts para a tinta do tique é `width` menos 14 px (o `tickSize` de 6 mais o
 * `tickMargin` de 8), não só o respiro: com 48 sobravam 34 px para os 33,8 px de `R$ 300`, uma
 * folga de 0,2 px que qualquer emenda de dado transformaria em rótulo de duas linhas (REC-2).
 * Com 52 a folga é de 4,2 px, acima do p99 de erro da tabela de largura por glifo.
 */
const Y_AXIS_WIDTH = 52;
const GRID_STEPS = 4;
/** Teto do `FORCED_TICK_LIMIT` do Farol, que não está na lista de imports da seção 6. */
const CATEGORY_TICK_LIMIT = 8;
const CPL_COLOR = 'var(--chart-1)';
/**
 * Respiro entre o ponto e a tinta do rótulo de volume, em px.
 *
 * Medido no primeiro render, com 10: no mês mais barato a linha sobe 23 px em meia banda e
 * atravessava a própria anotação, que saiu do preview com cara de texto riscado. 16 px tiram a
 * tinta do caminho da linha nos dois meses anotados, e o halo abaixo cobre o resto.
 */
const LABEL_OFFSET = 16;

/** Menor número redondo (1, 2 ou 5 vezes uma potência de 10) que não fica abaixo do passo pedido. */
function niceStep(roughStep: number): number {
  if (roughStep <= 0) return 1;
  const exponent = Math.floor(Math.log10(roughStep));
  const magnitude = 10 ** exponent;
  const fraction = roughStep / magnitude;
  const niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return niceFraction * magnitude;
}

/**
 * Domínio a partir do zero com no máximo `GRID_STEPS` degraus redondos (EIX-1, EIX-4).
 *
 * O laço existe porque `niceStep` arredonda a fração para baixo e às vezes devolve um passo que
 * pede mais degraus do que o pedido: com máximo 51 e 4 degraus ele dá 10, que fecharia em 6
 * linhas de grade num painel que só tem espaço para 4. Subir o passo é o que respeita a EIX-4.
 */
function buildDomain(maxValue: number): { domainMax: number; ticks: readonly number[] } {
  let step = niceStep(maxValue / GRID_STEPS);
  for (let guard = 0; guard < 12 && Math.ceil(maxValue / step) > GRID_STEPS; guard += 1) {
    step = niceStep(step * 1.5);
  }
  const domainMax = Math.max(step, Math.ceil(maxValue / step) * step);
  const count = Math.round(domainMax / step);
  return { domainMax, ticks: Array.from({ length: count + 1 }, (_, i) => i * step) };
}

/** O mês de CPL mais baixo, ou `null` quando não há mês nenhum (EST-1b: ausência é do tipo). */
function lowestCost(rows: readonly QualifiedLeadCost[]): QualifiedLeadCost | null {
  let found: QualifiedLeadCost | null = null;
  for (const row of rows) {
    if (found === null || row.cpl < found.cpl) found = row;
  }
  return found;
}

/** O mês de maior volume, ou `null` quando não há mês nenhum. */
function largestVolume(rows: readonly QualifiedLeadCost[]): QualifiedLeadCost | null {
  let found: QualifiedLeadCost | null = null;
  for (const row of rows) {
    if (found === null || row.leads > found.leads) found = row;
  }
  return found;
}

/**
 * O rótulo de volume, desenhado só nos meses que têm texto no próprio dado.
 *
 * O texto chega por `dataKey` e não por índice, que é a saída da REC-5: o `content` de um
 * `LabelList` não recebe `payload`, e o índice conta as marcas desenhadas, não as linhas do
 * array. Com halo da ROT-7, porque a tinta cruza a linha do CPL e não tem marca preenchida
 * inteira por baixo: é o caso em que a ROT-7b manda cor de texto COM halo, nunca vazado.
 *
 * O respiro é subtraído AQUI, e isso é medição e não gosto: com `position="top"` e `offset` no
 * `LabelList`, o `y` que chega ao `content` é o do próprio ponto, não o deslocado. Medido no
 * preview do primeiro render, em que o rótulo de fev saiu com `y` igual ao `cy` do ponto, e
 * mudar o `offset` de 10 para 16 não moveu um pixel. A causa é o `viewBox` de altura zero que a
 * `Line` entrega ao rótulo: sem caixa, não há de onde deslocar.
 */
function VolumeLabel({ x, y, value }: LabelProps): ReactElement | null {
  if (typeof value !== 'string' || typeof x !== 'number' || typeof y !== 'number') return null;
  return (
    <text
      className="font-display"
      fill="var(--text-muted)"
      fontSize={11}
      style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
      textAnchor="middle"
      x={x}
      y={y - LABEL_OFFSET}
    >
      {value}
    </text>
  );
}

export default function QualifiedCplWithVolume({
  data = defaultData,
  height,
  className,
}: QualifiedCplWithVolumeProps) {
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
        <span>Nenhum mês neste recorte: não há CPL qualificado nem volume de leads para ler.</span>
      </div>
    );
  }

  const rows = data;
  const first = rows[0];
  const last = rows[rows.length - 1];
  const cheapest = lowestCost(rows);
  const busiest = largestVolume(rows);
  const totalLeads = rows.reduce((sum, row) => sum + row.leads, 0);
  const costDomain = buildDomain(rows.reduce((max, row) => Math.max(max, row.cpl), 0));

  // Rótulo por `dataKey` próprio, calculado junto com o dado (REC-5). Só os dois meses que mudam
  // a leitura recebem texto, que é o teto de duas anotações da ANO-1.
  const annotated = new Set([cheapest?.month, busiest?.month].filter((month) => month !== undefined));
  const chartRows = rows.map((row) => ({
    ...row,
    volumeLabel: annotated.has(row.month) ? `${formatInt(row.leads)} leads` : undefined,
  }));

  const xTicks =
    rows.length <= CATEGORY_TICK_LIMIT
      ? rows.map((row) => row.month)
      : rows.filter((_, index) => index % 2 === 0).map((row) => row.month);

  const change = first && last && first.cpl > 0 ? (last.cpl - first.cpl) / first.cpl : null;

  const reading = [
    first && last && change !== null
      ? `CPL ${change >= 0 ? 'subiu' : 'caiu'} ${formatPercent(Math.abs(change), 0)}, de ${formatCurrencyCompact(first.cpl)} em ${formatMonthShort(first.month)} a ${formatCurrencyCompact(last.cpl)} em ${formatMonthShort(last.month)}`
      : '',
    `${formatInt(totalLeads)} leads no ano`,
  ]
    .filter(Boolean)
    .join('; ');

  const summary = [
    first && last
      ? `Linha com o CPL qualificado de ${formatInt(rows.length)} meses, de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)}, de ${formatCurrencyCompact(first.cpl)} a ${formatCurrencyCompact(last.cpl)}.`
      : '',
    cheapest ? `O CPL mais baixo é ${formatCurrencyCompact(cheapest.cpl)} em ${formatMonthShort(cheapest.month)}, com só ${formatInt(cheapest.leads)} leads.` : '',
    busiest ? `O maior volume é ${formatInt(busiest.leads)} leads em ${formatMonthShort(busiest.month)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <p aria-hidden className="mb-1 shrink-0 text-xs font-medium text-text-secondary">
        CPL qualificado (R$ por lead)
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={chartRows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="month"
              interval={0}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickMargin={8}
              ticks={[...xTicks]}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, costDomain.domainMax]}
              interval={0}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              ticks={[...costDomain.ticks]}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip labelFormat="month" valueFormat="currencyCompact" />}
              cursor={{ stroke: CURSOR_COLOR }}
              isAnimationActive={false}
            />
            <Line
              activeDot={{ r: 4, fill: CPL_COLOR }}
              dataKey="cpl"
              dot={{ r: 3, fill: CPL_COLOR, strokeWidth: 0 }}
              isAnimationActive={animate}
              name="CPL qualificado"
              stroke={CPL_COLOR}
              strokeWidth={2}
              type="monotone"
            >
              <LabelList content={VolumeLabel} dataKey="volumeLabel" />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
