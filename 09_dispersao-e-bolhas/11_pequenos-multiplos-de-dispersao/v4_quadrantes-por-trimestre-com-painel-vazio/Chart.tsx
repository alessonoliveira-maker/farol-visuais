import { Filter } from 'lucide-react';
import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  cicloCut as defaultCicloCut,
  data as defaultData,
  ticketCut as defaultTicketCut,
  type QuarterPanel,
  type ScatterPoint,
} from './data';

/**
 * Seis trimestres em quadrante, com os mesmos cortes de ticket e de ciclo em todos os painéis e a
 * contagem por região escrita no cabeçalho de cada um. O que a grade responde é para onde a massa
 * andou de um trimestre para o outro, e essa pergunta só tem resposta se o corte não se mover.
 *
 * POR QUE O CORTE NÃO SE MOVE NO PAINEL EM QUE A META ERA OUTRA. No 3º trimestre de 2025 a meta de
 * ticket em vigor era mais alta que a atual. Desenhar a linha daquele trimestre naquele painel faria
 * a mesma posição significar coisas diferentes de um painel para o outro, que é exatamente o defeito
 * que este modelo existe para evitar. Então o corte desenhado é o atual nos seis painéis, e a meta
 * que valia naquele trimestre vai ESCRITA no cabeçalho do painel afetado: quem lê a contagem daquele
 * painel sabe contra que régua ela foi feita.
 *
 * O PAINEL SEM OBSERVAÇÃO não recebe plano. Grade e eixos com zero pontos afirmariam "o plano foi
 * medido e nada caiu aqui", que é uma frase diferente de "não houve oportunidade ganha neste
 * trimestre". Ele mantém a moldura, tracejada (DAD-2, que pede a ausência contornada), e escreve a
 * ausência com ícone e palavra, que é o desenho da EST-1.
 */
export interface QuarterQuadrantGridProps {
  readonly data?: readonly QuarterPanel[];
  /** Corte de ticket dos quadrantes, o mesmo em todos os painéis. */
  readonly ticketCut?: number;
  /** Corte de ciclo dos quadrantes, em dias, o mesmo em todos os painéis. */
  readonly cicloCut?: number;
  readonly height?: number;
  readonly className?: string;
}

const COLUMNS = 3;
/** Passo do domínio do ticket: o topo é o primeiro múltiplo dele acima do maior valor (EIX-4). */
const TICKET_STEP = 100_000;
/** Passo do domínio do ciclo, em dias. Passo de 40 em vez de 20 para o tique do meio ficar a cerca
 * de 13 px da linha de corte, em vez dos 7 px que o passo menor daria: duas réguas encostadas leem
 * como uma só. */
const CICLO_STEP = 40;
/** Abaixo disso a nuvem não tem forma comparável com a dos vizinhos, e o painel ganha a nota. */
const SMALL_SAMPLE_BELOW = 5;

/** `right` reserva a metade direita do rótulo do tique mais alto, que `interval={0}` não reposiciona. */
const MARGIN = { top: 6, right: 30, bottom: 4, left: 0 } as const;
/** Entre 48 e 64 (EIX-6): abaixo disso "160 dias" quebra em duas linhas no tique. */
const Y_AXIS_WIDTH = 56;
/** 26 px e não 18: o rótulo do tique nasce a `tickMargin` da linha do eixo e a tinta dele mede
 * cerca de 15 px, então a faixa precisa de pelo menos 23 px. Com 18 o render acusava o rótulo
 * da fileira de baixo passando 3 px da área do corpo (ESP-3). */
const X_AXIS_HEIGHT = 26;
const POINT_FILL = 'var(--chart-1)';
/** Referência (17.2): o corte é régua de leitura, não série de dado. Mede 5,21:1 no escuro e 5,37:1
 * no claro contra o cartão, acima do piso de 3:1 que a ACE-6 pede do traço que carrega a relação. */
const CUT_STROKE = 'var(--text-muted)';
/** Raio de 3 px, fixado nas duas pontas do `ZAxis` porque o tamanho aqui não codifica nada. */
const POINT_RADIUS = 3;
const POINT_AREA = Math.PI * POINT_RADIUS * POINT_RADIUS;

interface VerticalGridArgs {
  readonly offset: { readonly left: number; readonly width: number };
}
interface HorizontalGridArgs {
  readonly offset: { readonly top: number; readonly height: number };
}

interface RegionCounts {
  readonly highFast: number;
  readonly highSlow: number;
  readonly lowFast: number;
  readonly lowSlow: number;
}

/**
 * Contagem por quadrante. Devolve os quatro contadores e não uma taxa, de propósito: taxa sobre 2
 * observações diz "50%" com a mesma cara com que diria sobre 200, e o que o painel precisa mostrar é
 * a contagem crua ao lado do `n` (DAD-1).
 */
function countByRegion(points: readonly ScatterPoint[], ticketLimit: number, cicloLimit: number): RegionCounts {
  let highFast = 0;
  let highSlow = 0;
  let lowFast = 0;
  let lowSlow = 0;
  for (const point of points) {
    const high = point.ticket > ticketLimit;
    const fast = point.ciclo <= cicloLimit;
    if (high && fast) highFast += 1;
    else if (high) highSlow += 1;
    else if (fast) lowFast += 1;
    else lowSlow += 1;
  }
  return { highFast, highSlow, lowFast, lowSlow };
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

/** "3 rápidas, 2 lentas", com o substantivo declarado uma vez na linha de leitura (NUM-6). */
function regionLine(prefix: string, fast: number, slow: number): string {
  return `${prefix}: ${formatInt(fast)} ${fast === 1 ? 'rápida' : 'rápidas'}, ${formatInt(slow)} ${slow === 1 ? 'lenta' : 'lentas'}`;
}

export default function QuarterQuadrantGrid({
  data = defaultData,
  ticketCut = defaultTicketCut,
  cicloCut = defaultCicloCut,
  height,
  className,
}: QuarterQuadrantGridProps) {
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
        <span>Nenhum trimestre neste recorte: não há oportunidades ganhas para distribuir nos quadrantes.</span>
      </div>
    );
  }

  const rows = Math.ceil(data.length / COLUMNS);
  /** Domínio derivado do conjunto inteiro (EIX-9), e o corte entra na conta: com um corte acima do
   * maior valor observado, a linha sairia do plano sem aviso. */
  const maxTicket = data.reduce((top, item) => item.points.reduce((inner, point) => Math.max(inner, point.ticket), top), ticketCut);
  const maxCiclo = data.reduce((top, item) => item.points.reduce((inner, point) => Math.max(inner, point.ciclo), top), cicloCut);
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

  const owners = tickOwners(data.map((quarter) => quarter.points.length > 0), COLUMNS);
  const measured = data.filter((quarter) => quarter.points.length > 0);
  const totalPoints = data.reduce((sum, quarter) => sum + quarter.points.length, 0);
  const emptyCount = data.length - measured.length;
  const firstMeasured = measured[0];
  const lastMeasured = measured[measured.length - 1];
  /** Os extremos da leitura saem só dos painéis com observação: o trimestre vazio não é o melhor nem
   * o pior de ninguém (EST-1b aplicada à escolha do extremo, não só ao cálculo). */
  const firstFast = firstMeasured === undefined ? undefined : countByRegion(firstMeasured.points, ticketCut, cicloCut);
  const lastFast = lastMeasured === undefined ? undefined : countByRegion(lastMeasured.points, ticketCut, cicloCut);
  const hasTrend =
    firstMeasured !== undefined && lastMeasured !== undefined && firstFast !== undefined && lastFast !== undefined && firstMeasured !== lastMeasured;
  const fromText = firstFast === undefined || firstMeasured === undefined ? '' : `${formatInt(firstFast.highFast + firstFast.lowFast)} de ${formatInt(firstMeasured.points.length)}`;
  const toText = lastFast === undefined || lastMeasured === undefined ? '' : `${formatInt(lastFast.highFast + lastFast.lowFast)} de ${formatInt(lastMeasured.points.length)}`;
  /** A linha de leitura nomeia os dois trimestres; a frase acessível não, porque os dois rótulos por
   * extenso custam 40 caracteres e a ACE-1 tem teto de 250. Os números e o formatador são os mesmos
   * nas duas, que é o que a DAD-5 pede. */
  const trendText = !hasTrend || firstMeasured === undefined || lastMeasured === undefined ? '' : `As rápidas vão de ${fromText} no ${firstMeasured.label} a ${toText} no ${lastMeasured.label}`;
  const trendShort = !hasTrend ? '' : `As rápidas vão de ${fromText} no primeiro trimestre medido a ${toText} no último`;

  const summary =
    `Quadrantes em pequenos múltiplos: ${formatInt(totalPoints)} oportunidades em ${formatInt(data.length)} trimestres, ticket contra ciclo e os mesmos cortes em todos.` +
    (trendShort === '' ? '' : ` ${trendShort}.`) +
    (emptyCount === 0 ? '' : ` ${formatInt(emptyCount)} ${emptyCount === 1 ? 'trimestre fica' : 'trimestres ficam'} sem oportunidade ganha.`);

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs tabular-nums text-text-secondary">
        {`Mesmos cortes nos ${formatInt(data.length)} painéis, ticket de ${formatCurrencyAxis(ticketCut)} e ciclo de ${formatDays(cicloCut)}, e a mesma escala em todos, até ${formatCurrencyAxis(ticketTop)} e ${formatDays(cicloTop)}.`}
      </p>
      <p aria-hidden className="shrink-0 text-xs tabular-nums text-text-muted">
        {`Cada título conta as oportunidades por região, rápidas até o corte de ciclo e lentas acima dele, e marca amostra menor que ${formatInt(SMALL_SAMPLE_BELOW)}.`}
      </p>
      {trendText === '' ? null : (
        <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-muted">
          {`${trendText}.`}
        </p>
      )}
      <div
        className="grid min-h-0 flex-1 gap-3"
        style={{
          gridTemplateColumns: `repeat(${String(COLUMNS)}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${String(rows)}, minmax(0, 1fr))`,
        }}
      >
        {data.map((quarter, index) => {
          const counts = countByRegion(quarter.points, ticketCut, cicloCut);
          const isEmpty = quarter.points.length === 0;
          const isSmall = !isEmpty && quarter.points.length < SMALL_SAMPLE_BELOW;
          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={quarter.id}>
              {/* O rótulo do trimestre ocupa a primeira linha sozinho, com a largura inteira do
                  painel: dividindo a linha com a contagem ele sairia com reticência, que a TIP-7
                  proíbe em nome de categoria desenhada. */}
              <span className="mb-0.5 block shrink-0 text-xs leading-tight font-medium text-text-secondary">
                {quarter.label}
              </span>
              {/* A nota da meta fica NESTA linha, e não numa linha própria: uma linha a mais num
                  painel só encurtaria o plano dele, e painel com plano de outro tamanho não se
                  compara com os vizinhos mesmo tendo o mesmo domínio. */}
              <p aria-hidden className="mb-1 shrink-0 text-[0.6875rem] leading-tight tabular-nums text-text-muted">
                {`${formatInt(quarter.points.length)} ${quarter.points.length === 1 ? 'oportunidade' : 'oportunidades'}`}
                {isSmall ? ' · amostra pequena' : ''}
                {quarter.metaTicket === undefined ? '' : ` · meta de ticket era ${formatCurrencyAxis(quarter.metaTicket)}`}
              </p>
              {/* Duas linhas de contagem por região em TODOS os painéis, inclusive no vazio, para o
                  cabeçalho ter a mesma altura nos seis e o plano de cada um sair do mesmo tamanho. */}
              <div aria-hidden className="mb-1 shrink-0 text-[0.6875rem] leading-tight tabular-nums text-text-muted">
                <p>{isEmpty ? 'ticket acima: sem oportunidade' : regionLine('ticket acima', counts.highFast, counts.highSlow)}</p>
                <p>{isEmpty ? 'ticket abaixo: sem oportunidade' : regionLine('ticket abaixo', counts.lowFast, counts.lowSlow)}</p>
              </div>
              <div className="min-h-0 flex-1">
                {isEmpty ? (
                  <div
                    className="flex h-full w-full items-center justify-center rounded border border-dashed border-line-subtle px-2 text-center"
                    role="status"
                  >
                    <span className="flex items-center gap-1.5 text-[0.6875rem] leading-tight text-text-muted">
                      <Filter aria-hidden className="size-3.5 shrink-0" />
                      Sem oportunidades no período
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
                      <ReferenceLine ifOverflow="extendDomain" stroke={CUT_STROKE} strokeDasharray="3 3" x={ticketCut} />
                      <ReferenceLine ifOverflow="extendDomain" stroke={CUT_STROKE} strokeDasharray="3 3" y={cicloCut} />
                      <Scatter data={[...quarter.points]} fill={POINT_FILL} isAnimationActive={animate} shape="circle" stroke="var(--surface-raised)" strokeWidth={1} />
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
