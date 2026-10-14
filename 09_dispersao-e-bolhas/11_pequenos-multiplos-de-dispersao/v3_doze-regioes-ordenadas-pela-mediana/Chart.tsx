import { Filter } from 'lucide-react';
import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatDays, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type RegionPanel } from './data';

/**
 * Doze regiões comerciais numa grade de 3 colunas, ordenadas pela mediana do ciclo, do mais curto
 * ao mais longo. A ordem é a informação: com os painéis em ordem alfabética a grade responderia
 * "como é cada região", e ordenada ela responde "quais fecham mais rápido para o mesmo ticket",
 * que é a pergunta do cartão.
 *
 * Ordem por medida precisa se apresentar (GEO-12), e aqui ela se apresenta duas vezes: a mediana que
 * ordena está escrita no cabeçalho de cada painel, o que já dispensaria a frase pelo discriminador da
 * própria armadilha, e a linha de leitura acima da grade diz o critério por extenso, porque a mesma
 * linha precisa declarar a escala comum e as duas coisas cabem juntas.
 */
export interface RegionScatterGridProps {
  readonly data?: readonly RegionPanel[];
  readonly height?: number;
  readonly className?: string;
}

const COLUMNS = 3;
/** Passo do domínio do ticket: o topo é o primeiro múltiplo dele acima do maior valor (EIX-4). */
const TICKET_STEP = 100_000;
/** Passo do domínio do ciclo, em dias. */
const CICLO_STEP = 20;

/** `right` reserva a metade direita do rótulo do tique mais alto, que `interval={0}` não reposiciona. */
const MARGIN = { top: 6, right: 30, bottom: 4, left: 0 } as const;
/** Entre 48 e 64 (EIX-6): abaixo disso "160 dias" quebra em duas linhas no tique. */
const Y_AXIS_WIDTH = 56;
/** 26 px e não 18: o rótulo do tique nasce a `tickMargin` da linha do eixo e a tinta dele mede
 * cerca de 15 px, então a faixa precisa de pelo menos 23 px. Com 18 o render acusava o rótulo
 * da fileira de baixo passando 3 px da área do corpo (ESP-3). */
const X_AXIS_HEIGHT = 26;
const POINT_FILL = 'var(--chart-1)';
/** Referência (17.2): a mediana é corte de leitura, não série de dado. */
const MEDIAN_STROKE = 'var(--text-muted)';
/** Raio de 3 px, fixado nas duas pontas do `ZAxis` porque o tamanho aqui não codifica nada. */
const POINT_RADIUS = 3;
const POINT_AREA = Math.PI * POINT_RADIUS * POINT_RADIUS;

interface VerticalGridArgs {
  readonly offset: { readonly left: number; readonly width: number };
}
interface HorizontalGridArgs {
  readonly offset: { readonly top: number; readonly height: number };
}

/**
 * Quais painéis escrevem o rótulo de cada eixo. A regra é a borda da grade, mas ela sozinha tem um
 * buraco que só aparece quando existe painel sem observação: o painel vazio não desenha eixo, então
 * se ele calhar na coluna da esquerda a fileira inteira fica sem régua de ciclo, e se calhar na
 * fileira de baixo a coluna inteira fica sem régua de ticket. Aqui a responsabilidade passa para o
 * vizinho com observação, o mais à esquerda da fileira e o mais abaixo da coluna. Os painéis sem
 * rótulo reservam a mesma largura e a mesma altura de eixo, então o plano de todos sai do mesmo
 * tamanho de qualquer jeito (EIX-9).
 */
function tickOwners(filled: readonly boolean[], columns: number): { readonly x: ReadonlySet<number>; readonly y: ReadonlySet<number> } {
  const rowCount = Math.ceil(filled.length / columns);
  const x = new Set<number>();
  const y = new Set<number>();
  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const index = row * columns + col;
      if (filled[index] === true) {
        y.add(index);
        break;
      }
    }
  }
  for (let col = 0; col < columns; col += 1) {
    for (let row = rowCount - 1; row >= 0; row -= 1) {
      const index = row * columns + col;
      if (filled[index] === true) {
        x.add(index);
        break;
      }
    }
  }
  return { x, y };
}

/**
 * Mediana de uma lista de números; par usa a média dos dois centrais. Devolve `null` para lista
 * vazia, nunca `0`: aqui a mediana também ORDENA a grade, então um zero de lista vazia não erraria
 * só o número escrito no cabeçalho, promoveria o painel sem observação ao primeiro lugar da ordem,
 * que se lê como a região mais rápida da casa (EST-1b).
 */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const middle = sorted[mid] ?? 0;
  return sorted.length % 2 === 0 ? ((sorted[mid - 1] ?? middle) + middle) / 2 : middle;
}

interface OrderedPanel {
  readonly region: RegionPanel;
  readonly medianCiclo: number | null;
}
/** Um painel cuja mediana foi medida, que é o único que pode disputar os extremos da frase. */
interface MeasuredPanel {
  readonly region: RegionPanel;
  readonly medianCiclo: number;
}

export default function RegionScatterGrid({ data = defaultData, height, className }: RegionScatterGridProps) {
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
        <span>Nenhuma região neste recorte: não há oportunidades ganhas para ordenar.</span>
      </div>
    );
  }

  const rows = Math.ceil(data.length / COLUMNS);
  /** Domínio derivado do conjunto inteiro (EIX-9): a promessa de escala comum vale também quando a
   * página passa outro `data` por prop, o que constante escrita à mão não garante. */
  const maxTicket = data.reduce((top, item) => item.points.reduce((inner, point) => Math.max(inner, point.ticket), top), 0);
  const maxCiclo = data.reduce((top, item) => item.points.reduce((inner, point) => Math.max(inner, point.ciclo), top), 0);
  const ticketTop = Math.max(TICKET_STEP, Math.ceil(maxTicket / TICKET_STEP) * TICKET_STEP);
  const cicloTop = Math.max(CICLO_STEP, Math.ceil(maxCiclo / CICLO_STEP) * CICLO_STEP);
  const ticketTicks = [0, ticketTop / 2, ticketTop];
  const cicloTicks = [0, cicloTop / 2, cicloTop];

  /**
   * Coordenadas de grade calculadas do domínio e da área útil, não dos tiques do eixo: a malha nativa
   * do Recharts sai dos mesmos tiques que decidem o rótulo visível, então nos painéis com
   * `tick={false}` ela ficaria incompleta e diferente de painel para painel (EIX-9).
   */
  const gridX = ({ offset }: VerticalGridArgs): number[] =>
    ticketTicks.map((value) => offset.left + (value / ticketTop) * offset.width);
  const gridY = ({ offset }: HorizontalGridArgs): number[] =>
    cicloTicks.map((value) => offset.top + offset.height - (value / cicloTop) * offset.height);

  const totalPoints = data.reduce((sum, region) => sum + region.points.length, 0);
  const withMedian: readonly OrderedPanel[] = data.map((region) => ({
    region,
    medianCiclo: median(region.points.map((point) => point.ciclo)),
  }));
  /** Região sem observação não tem mediana, então ela não disputa posição na ordem: vai para o fim,
   * e a linha de leitura declara isso junto com o critério. */
  const ordered = [...withMedian].sort((a, b) => {
    if (a.medianCiclo === null) return b.medianCiclo === null ? 0 : 1;
    if (b.medianCiclo === null) return -1;
    return a.medianCiclo - b.medianCiclo;
  });
  const measured: readonly MeasuredPanel[] = ordered.filter((row): row is MeasuredPanel => row.medianCiclo !== null);
  const unmeasured = ordered.length - measured.length;
  const owners = tickOwners(ordered.map((row) => row.region.points.length > 0), COLUMNS);
  const fastest = measured[0];
  const slowest = measured[measured.length - 1];

  const fastestText = fastest === undefined ? '' : `${fastest.region.name} fecha mais rápido, ${formatDays(Math.round(fastest.medianCiclo))}`;
  const slowestText = slowest === undefined ? '' : `${slowest.region.name} mais devagar, ${formatDays(Math.round(slowest.medianCiclo))}`;
  const scaleText = `ticket até ${formatCurrencyAxis(ticketTop)} e ciclo até ${formatDays(cicloTop)}`;

  const summary =
    `Pequenos múltiplos de dispersão: ticket contra ciclo de ${formatInt(totalPoints)} oportunidades em ${formatInt(data.length)} regiões, painéis ordenados pela mediana do ciclo.` +
    (fastest && slowest && fastest !== slowest ? ` ${fastestText}; ${slowestText}.` : '') +
    (unmeasured === 0 ? '' : ` ${formatInt(unmeasured)} ${unmeasured === 1 ? 'região fica' : 'regiões ficam'} no fim, sem mediana.`);

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {`Ordem dos painéis: mediana do ciclo, do mais curto ao mais longo${unmeasured === 0 ? '' : `, e região sem mediana no fim`}. Mesma escala nos ${formatInt(data.length)} painéis, ${scaleText}.`}
      </p>
      <div
        className="grid min-h-0 flex-1 gap-3"
        style={{
          gridTemplateColumns: `repeat(${String(COLUMNS)}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${String(rows)}, minmax(0, 1fr))`,
        }}
      >
        {ordered.map(({ region, medianCiclo }, index) => {
          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={region.id}>
              {/* O nome ocupa a primeira linha sozinho, com a largura inteira do painel: dividindo a
                  linha com a contagem, o nome mais longo da grade sairia com reticência, que a TIP-7
                  proíbe em nome de categoria desenhada. */}
              <span className="mb-0.5 block shrink-0 text-xs leading-tight font-medium text-text-secondary">
                {region.name}
              </span>
              <p aria-hidden className="mb-1 flex shrink-0 items-baseline gap-1.5 text-[0.6875rem] leading-tight tabular-nums text-text-muted">
                <span>{`${formatInt(region.points.length)} ${region.points.length === 1 ? 'oportunidade' : 'oportunidades'}`}</span>
                <span>·</span>
                {/* A mediana é o número que ordena a grade, então ela precisa estar escrita no painel:
                    sem isso a sequência dos painéis lê como lista arbitrária (GEO-12). */}
                <span className="text-text-secondary">
                  {medianCiclo === null ? `mediana ${formatUnavailable()}` : `mediana ${formatDays(Math.round(medianCiclo))}`}
                </span>
              </p>
              <div className="min-h-0 flex-1">
                {region.points.length === 0 ? (
                  /* Painel sem observação não recebe plano: sem grade e sem eixo, moldura tracejada e
                     a ausência escrita (EST-1, mais a DAD-2, que pede a ausência contornada). Com
                     grade e eixos e nenhum ponto, o painel afirmaria "o plano foi medido e nada caiu
                     aqui", que é outra coisa. */
                  <div
                    className="flex h-full w-full items-center justify-center rounded border border-dashed border-line-subtle px-2 text-center"
                    role="status"
                  >
                    <span className="flex items-center gap-1.5 text-[0.6875rem] leading-tight text-text-muted">
                      <Filter aria-hidden className="size-3.5 shrink-0" />
                      Sem oportunidade ganha no semestre
                    </span>
                  </div>
                ) : (
                  <ResponsiveContainer height="100%" width="100%">
                    <ScatterChart accessibilityLayer={false} margin={MARGIN}>
                      <CartesianGrid
                        horizontalCoordinatesGenerator={gridY}
                        stroke="var(--line-subtle)"
                        verticalCoordinatesGenerator={gridX}
                      />
                      <XAxis
                        {...AXIS_PROPS}
                        axisLine={false}
                        dataKey="ticket"
                        domain={[0, ticketTop]}
                        height={X_AXIS_HEIGHT}
                        interval={0}
                        tick={owners.x.has(index) ? { fill: 'var(--text-muted)', fontSize: 11 } : false}
                        tickFormatter={(value: number) => formatCurrencyAxis(value)}
                        tickMargin={8}
                        ticks={ticketTicks}
                        type="number"
                      />
                      <YAxis
                        {...AXIS_PROPS}
                        axisLine={false}
                        dataKey="ciclo"
                        domain={[0, cicloTop]}
                        interval={0}
                        tick={owners.y.has(index) ? { fill: 'var(--text-muted)', fontSize: 11 } : false}
                        tickFormatter={(value: number) => formatDays(value)}
                        tickMargin={8}
                        ticks={cicloTicks}
                        type="number"
                        width={Y_AXIS_WIDTH}
                      />
                      <ZAxis range={[POINT_AREA, POINT_AREA]} type="number" />
                      {medianCiclo === null ? null : (
                        <ReferenceLine ifOverflow="extendDomain" stroke={MEDIAN_STROKE} strokeDasharray="3 3" y={medianCiclo} />
                      )}
                      <Scatter data={[...region.points]} fill={POINT_FILL} isAnimationActive={animate} shape="circle" stroke="var(--surface-raised)" strokeWidth={1} />
                    </ScatterChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
