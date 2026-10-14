import { Filter } from 'lucide-react';
import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatDays, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutivePanel } from './data';

/**
 * Um ScatterChart por executivo, grade de 4 colunas por 2 linhas, com o mesmo domínio de ticket
 * e de ciclo em todos os painéis. Cada painel ganha uma ReferenceLine tracejada na mediana do
 * próprio ciclo, com o valor escrito no cabeçalho do painel, não sobre a nuvem: a nuvem cresce na
 * diagonal e cobre praticamente todo o corpo do gráfico, então não sobra canto seguro para texto
 * inline sem risco de esconder um ponto (ANO-3, margem reservada fora das marcas). Os ticks
 * numéricos só aparecem na borda externa da grade: eixo x na linha de baixo, eixo y na coluna da
 * esquerda.
 */
export interface ExecutiveScatterGridProps {
  readonly data?: readonly ExecutivePanel[];
  readonly height?: number;
  readonly className?: string;
}

const COLUMNS = 4;
/** Domínio do ticket; o maior valor do dado é R$ 875 mil. */
const TICKET_DOMAIN: readonly [number, number] = [0, 900_000];
/** 3 linhas (EIX-4): painel de ~163 px de largura não sobra espaço para 4 rótulos sem colidir. */
const TICKET_TICKS = [0, 450_000, 900_000] as const;
/** Domínio do ciclo em dias; o maior valor do dado é 150 dias. */
const CICLO_DOMAIN: readonly [number, number] = [0, 160];
/** 3 linhas (EIX-4): painel de ~58 px de altura não sobra espaço para 5 rótulos sem colidir. */
const CICLO_TICKS = [0, 80, 160] as const;

/** `right` maior que o padrão: reserva o espaço da metade do rótulo do tique mais alto
 * ("R$ 900 mil") sem cortar o texto, agora que `interval={0}` (abaixo) desliga o reposicionamento
 * automático do Recharts que descolava esse rótulo da própria linha de grade (item 4c). */
const MARGIN = { top: 6, right: 30, bottom: 4, left: 0 } as const;
/** Entre 48 e 64 (EIX-6): 44 cortava "dias" do tique "160 dias" em duas linhas. */
const Y_AXIS_WIDTH = 56;
const X_AXIS_HEIGHT = 18;
const POINT_FILL = 'var(--chart-1)';
/** Referência (17.2): mediana é média/corte de leitura, não série de dado; `--line-strong` é só
 * para a linha do zero. */
const MEDIAN_STROKE = 'var(--text-muted)';

/**
 * Coordenadas de grade calculadas direto do domínio e da área útil do gráfico (`offset`), não dos
 * tiques do eixo. A malha nativa do Recharts deriva a grade dos mesmos tiques que decidem o rótulo
 * visível, então nos painéis sem rótulo (`tick={false}`) o algoritmo de decolisão de texto some com
 * as linhas internas de grade também: EIX-9 exige domínio e grade idênticos em todo painel,
 * independente de qual borda mostra o número (item 4b/29 da revisão).
 */
function ticketGridX({ offset }: { readonly offset: { readonly left: number; readonly width: number } }): number[] {
  const [min, max] = TICKET_DOMAIN;
  return TICKET_TICKS.map((value) => offset.left + ((value - min) / (max - min)) * offset.width);
}
function cicloGridY({ offset }: { readonly offset: { readonly top: number; readonly height: number } }): number[] {
  const [min, max] = CICLO_DOMAIN;
  return CICLO_TICKS.map((value) => offset.top + offset.height - ((value - min) / (max - min)) * offset.height);
}

/**
 * Mediana de uma lista de números; par usa a média dos dois centrais. Devolve `null` quando a lista
 * está vazia: zero dia é um ciclo plausível, então a mediana zerada de um painel sem oportunidade
 * planta a linha tracejada na base do painel e o cabeçalho escreve "mediana 0 dias", que se lê como
 * o executivo mais rápido da grade justamente onde não houve nada para medir.
 */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const middle = sorted[mid] ?? 0;
  return sorted.length % 2 === 0 ? ((sorted[mid - 1] ?? middle) + middle) / 2 : middle;
}

/** Um painel cuja mediana foi medida, que é o que os extremos da frase acessível podem comparar. */
interface MeasuredPanel {
  readonly executive: ExecutivePanel;
  readonly medianCiclo: number;
}

export default function ExecutiveScatterGrid({ data = defaultData, height, className }: ExecutiveScatterGridProps) {
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
        <span>Nenhum executivo neste recorte: não há oportunidades ganhas para posicionar.</span>
      </div>
    );
  }

  const rows = Math.ceil(data.length / COLUMNS);
  const totalPoints = data.reduce((sum, executive) => sum + executive.points.length, 0);
  const withMedian = data.map((executive) => ({
    executive,
    medianCiclo: median(executive.points.map((point) => point.ciclo)),
  }));
  /** Os extremos saem só dos painéis medidos: o painel sem ponto não é o mais rápido de ninguém. */
  const measured: readonly MeasuredPanel[] = withMedian.filter(
    (row): row is MeasuredPanel => row.medianCiclo !== null,
  );
  const unmeasured = withMedian.length - measured.length;
  const first = measured[0];
  const fastest = first === undefined ? undefined : measured.reduce((top, row) => (row.medianCiclo < top.medianCiclo ? row : top), first);
  const slowest = first === undefined ? undefined : measured.reduce((top, row) => (row.medianCiclo > top.medianCiclo ? row : top), first);

  const summary =
    `Grade de dispersão em pequenos múltiplos: ticket contra ciclo de ${formatInt(totalPoints)} oportunidades ganhas por ${formatInt(data.length)} executivos, mesmos eixos em todos os painéis.` +
    (fastest && slowest && fastest !== slowest
      ? ` ${fastest.executive.name} tem o ciclo mediano mais curto, ${formatDays(Math.round(fastest.medianCiclo))}; ${slowest.executive.name} tem o mais longo, ${formatDays(Math.round(slowest.medianCiclo))}.`
      : '') +
    (unmeasured === 0
      ? ''
      : ` ${formatInt(unmeasured)} ${unmeasured === 1 ? 'painel fica' : 'painéis ficam'} sem oportunidade ganha, com a mediana ${formatUnavailable()}.`);

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Mesma escala nos {formatInt(data.length)} painéis: ticket de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(TICKET_DOMAIN[0])}</span> a{' '}
        <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(TICKET_DOMAIN[1])}</span>, ciclo de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatDays(CICLO_DOMAIN[0])}</span> a{' '}
        <span className="kpi-number font-medium text-text-primary">{formatDays(CICLO_DOMAIN[1])}</span>.
      </p>
      <div
        className="grid min-h-0 flex-1 gap-3"
        style={{
          gridTemplateColumns: `repeat(${String(COLUMNS)}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${String(rows)}, minmax(0, 1fr))`,
        }}
      >
        {withMedian.map(({ executive, medianCiclo }, index) => {
          const isLeftColumn = index % COLUMNS === 0;
          const isBottomRow = index >= data.length - COLUMNS;
          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={executive.id}>
              {/* O nome ocupa a primeira linha sozinho. Com a contagem ao lado dele, sobravam
                  cerca de 120 px dos 217 px do cabeçalho e o nome mais longo da grade saía com
                  reticência, que a TIP-7 proíbe em nome de marca desenhada. Em duas linhas o nome
                  recebe a largura inteira do painel e a contagem desce para a linha de apoio,
                  sem custo de altura: o cabeçalho já tinha duas linhas. */}
              <span className="mb-0.5 block shrink-0 text-xs leading-tight font-medium text-text-secondary">
                {executive.name}
              </span>
              {/* O painel sem oportunidade escreve a ausência no lugar do número, e fica sem a linha
                  de mediana logo abaixo: as duas coisas contam a mesma história. */}
              <p aria-hidden className="mb-1 flex shrink-0 items-baseline gap-1.5 text-[0.6875rem] leading-tight text-text-muted">
                <span>
                  <span className="kpi-number">{formatInt(executive.points.length)}</span>{' '}
                  {executive.points.length === 1 ? 'oportunidade' : 'oportunidades'}
                </span>
                <span>·</span>
                <span>
                  mediana{' '}
                  {medianCiclo === null ? (
                    <span className="text-text-secondary">{formatUnavailable()}</span>
                  ) : (
                    <span className="kpi-number text-text-secondary">{formatDays(Math.round(medianCiclo))}</span>
                  )}
                </span>
              </p>
              <div className="min-h-0 flex-1">
                <ResponsiveContainer height="100%" width="100%">
                  <ScatterChart accessibilityLayer={false} margin={MARGIN}>
                    <CartesianGrid
                      horizontalCoordinatesGenerator={cicloGridY}
                      stroke="var(--line-subtle)"
                      verticalCoordinatesGenerator={ticketGridX}
                    />
                    <XAxis
                      {...AXIS_PROPS}
                      axisLine={false}
                      dataKey="ticket"
                      domain={TICKET_DOMAIN}
                      height={X_AXIS_HEIGHT}
                      interval={0}
                      tick={isBottomRow ? { fill: 'var(--text-muted)', fontSize: 11 } : false}
                      tickFormatter={(value: number) => formatCurrencyAxis(value)}
                      tickMargin={6}
                      ticks={[...TICKET_TICKS]}
                      type="number"
                    />
                    <YAxis
                      {...AXIS_PROPS}
                      axisLine={false}
                      dataKey="ciclo"
                      domain={CICLO_DOMAIN}
                      interval={0}
                      tick={isLeftColumn ? { fill: 'var(--text-muted)', fontSize: 11 } : false}
                      tickFormatter={(value: number) => formatDays(value)}
                      tickMargin={6}
                      ticks={[...CICLO_TICKS]}
                      type="number"
                      width={Y_AXIS_WIDTH}
                    />
                    {medianCiclo === null ? null : (
                      <ReferenceLine ifOverflow="extendDomain" stroke={MEDIAN_STROKE} strokeDasharray="3 3" y={medianCiclo} />
                    )}
                    <Scatter data={[...executive.points]} fill={POINT_FILL} isAnimationActive={animate} shape="circle" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
