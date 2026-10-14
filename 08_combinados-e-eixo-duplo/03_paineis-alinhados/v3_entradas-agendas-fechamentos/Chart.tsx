import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Brush, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type FunnelWeek } from './data';

/**
 * Três painéis alinhados no mesmo eixo x, um por etapa do funil, com `syncId` comum: o cursor e a
 * dica atravessam os três, e o `Brush` do painel de baixo recorta os três ao mesmo tempo, porque o
 * `syncId` sincroniza também o recorte, não só a dica.
 *
 * As três etapas estão na mesma unidade mas em ordens de grandeza diferentes, então cada painel
 * tem a sua escala e o cartão declara isso por escrito: é o aviso que a EIX-9 faz ao contrário,
 * porque aqui a comparação legítima é de FORMA no tempo, nunca de altura entre painéis.
 */
export interface FunnelPanelsProps {
  readonly data?: readonly FunnelWeek[];
  readonly height?: number;
  readonly className?: string;
}

const SYNC_ID = 'funil-semanal-entradas-agendas-fechamentos';
const MARGIN = { top: 6, right: 12, bottom: 0, left: 0 } as const;
const Y_AXIS_WIDTH = 48;
const GRID_STEPS = 4;
/** Altura do `Brush`, somada à base do painel de baixo para os três planos ficarem proporcionais. */
const BRUSH_HEIGHT = 28;
const BRUSH_TRAVELLER_WIDTH = 6;
/** Uma cor só nos três painéis, de propósito: ver a nota de cor no README do modelo. */
const SERIES_COLOR = 'var(--chart-1)';

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
 * Domínio a partir do zero com no máximo `GRID_STEPS` degraus redondos e inteiros (EIX-1, EIX-4).
 *
 * O laço existe porque `niceStep` arredonda a fração para baixo: com máximo 51 e 4 degraus ele
 * devolve 10, que fecharia em 6 linhas de grade num plano de 74 px, com 13 px entre rótulos de
 * 11 px. Subir o passo é o que respeita a EIX-4 e o respiro da 17.7.
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

/** O maior valor de uma etapa, ou `null` quando não há semana nenhuma (EST-1b). */
function highest(rows: readonly FunnelWeek[], pick: (row: FunnelWeek) => number): number | null {
  let found: number | null = null;
  for (const row of rows) {
    if (found === null || pick(row) > found) found = pick(row);
  }
  return found;
}

/**
 * Um tique por mês presente no dado, ancorado na primeira semana daquele mês (saída da REC-21).
 *
 * Imprimir as 26 semanas põe rótulos de 58 px a 20 px de distância um do outro; imprimir uma em
 * cada quatro repete o mês em tiques vizinhos. A fronteira de mês é a única âncora que o leitor
 * já tem na cabeça, e ela sai em `formatMonthShort`, que é curto.
 */
function monthlyTicks(rows: readonly FunnelWeek[]): readonly string[] {
  const seen = new Set<string>();
  const ticks: string[] = [];
  for (const row of rows) {
    const month = row.week.slice(0, 7);
    if (seen.has(month)) continue;
    seen.add(month);
    ticks.push(row.week);
  }
  return ticks;
}

interface PanelProps {
  readonly rows: readonly FunnelWeek[];
  readonly title: string;
  readonly dataKey: 'entradas' | 'agendas' | 'fechamentos';
  readonly domainMax: number;
  readonly ticks: readonly number[];
  readonly xTicks: readonly string[];
  readonly showXTicks: boolean;
  readonly showBrush: boolean;
  readonly animate: boolean;
}

/** Um painel do combinado: título com a unidade no lugar da legenda, e o gráfico de um eixo só. */
function Panel({
  rows,
  title,
  dataKey,
  domainMax,
  ticks,
  xTicks,
  showXTicks,
  showBrush,
  animate,
}: PanelProps): ReactElement {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <p aria-hidden className="mb-1 shrink-0 text-xs font-medium text-text-secondary">
        {title}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={[...rows]} margin={MARGIN} syncId={SYNC_ID}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            {/* `tick={false}` e nunca `hide` (saída da REC-17): `hide` devolveria ao plano os 30 px
              reservados ao eixo, e os painéis de cima ficariam mais altos que o de baixo, o que
              desmancha justamente a proporção que esta versão desenha. */}
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="week"
              interval={0}
              tick={showXTicks ? AXIS_PROPS.tick : false}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickMargin={8}
              ticks={[...xTicks]}
            />
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              axisLine={false}
              domain={[0, domainMax]}
              interval={0}
              tickFormatter={(value: number) => formatInt(value)}
              ticks={[...ticks]}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip labelFormat="date" valueFormat="int" />}
              cursor={{ stroke: CURSOR_COLOR }}
              isAnimationActive={false}
            />
            <Line
              activeDot={{ r: 4, fill: SERIES_COLOR }}
              dataKey={dataKey}
              dot={false}
              isAnimationActive={animate}
              name={title}
              stroke={SERIES_COLOR}
              strokeWidth={2}
              type="monotone"
            />
            {showBrush ? (
              <Brush
                ariaLabel="Recorte de semanas, aplicado aos três painéis"
                dataKey="week"
                fill="var(--surface-sunken)"
                height={BRUSH_HEIGHT}
                stroke="var(--text-muted)"
                travellerWidth={BRUSH_TRAVELLER_WIDTH}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function FunnelPanels({ data = defaultData, height, className }: FunnelPanelsProps) {
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
        <span>Nenhuma semana neste recorte: não há entradas, agendas nem fechamentos para ler.</span>
      </div>
    );
  }

  const rows = data;
  const first = rows[0];
  const last = rows[rows.length - 1];
  const xTicks = monthlyTicks(rows);

  const entradasDomain = buildDomain(highest(rows, (row) => row.entradas) ?? 0);
  const agendasDomain = buildDomain(highest(rows, (row) => row.agendas) ?? 0);
  const fechamentosDomain = buildDomain(highest(rows, (row) => row.fechamentos) ?? 0);

  const reading =
    first && last
      ? `Em ${formatInt(rows.length)} semanas, entradas sobem de ${formatInt(first.entradas)} a ${formatInt(last.entradas)} e fechamentos caem de ${formatInt(first.fechamentos)} para ${formatInt(last.fechamentos)}`
      : '';

  const summary = [
    first && last
      ? `Três painéis por semana, com entradas, agendas e fechamentos de ${formatDate(first.week)} a ${formatDate(last.week)}.`
      : '',
    first && last
      ? `Entradas sobem de ${formatInt(first.entradas)} a ${formatInt(last.entradas)} e agendas de ${formatInt(first.agendas)} a ${formatInt(last.agendas)}, enquanto fechamentos caem de ${formatInt(first.fechamentos)} para ${formatInt(last.fechamentos)}.`
      : '',
    'Cada painel tem a sua escala.',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex min-h-0 flex-col" style={{ flexGrow: 3, flexShrink: 1, flexBasis: 0 }}>
          <Panel
            animate={animate}
            dataKey="entradas"
            domainMax={entradasDomain.domainMax}
            rows={rows}
            showBrush={false}
            showXTicks={false}
            ticks={entradasDomain.ticks}
            title="Entradas (contagem por semana)"
            xTicks={xTicks}
          />
        </div>
        <div className="flex min-h-0 flex-col" style={{ flexGrow: 2, flexShrink: 1, flexBasis: 0 }}>
          <Panel
            animate={animate}
            dataKey="agendas"
            domainMax={agendasDomain.domainMax}
            rows={rows}
            showBrush={false}
            showXTicks={false}
            ticks={agendasDomain.ticks}
            title="Agendas (contagem por semana)"
            xTicks={xTicks}
          />
        </div>
        {/* A base do painel de baixo carrega a altura do `Brush`, que é chrome do cartão inteiro e
          não do painel: sem isso o plano dos fechamentos nasceria 28 px mais curto que a
          proporção pedida. */}
        <div className="flex min-h-0 flex-col" style={{ flexGrow: 2, flexShrink: 1, flexBasis: BRUSH_HEIGHT }}>
          <Panel
            animate={animate}
            dataKey="fechamentos"
            domainMax={fechamentosDomain.domainMax}
            rows={rows}
            showBrush
            showXTicks
            ticks={fechamentosDomain.ticks}
            title="Fechamentos (contagem por semana)"
            xTicks={xTicks}
          />
        </div>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-xs text-text-muted">
        Escalas diferentes por painel: compare a forma no tempo, não a altura entre painéis.
      </p>
    </div>
  );
}
