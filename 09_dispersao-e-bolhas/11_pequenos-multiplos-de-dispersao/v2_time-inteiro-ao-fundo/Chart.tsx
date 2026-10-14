import { Filter } from 'lucide-react';
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutivePanel } from './data';

/**
 * Um painel por executivo, e em todos eles a nuvem do time inteiro desenhada antes, em anel vazado
 * neutro, com as oportunidades do próprio executivo por cima em ponto cheio de destaque. A nuvem de
 * fundo é a mesma figura nos oito painéis, então ela vira a régua: o que muda de painel para painel
 * é apenas onde o recorte cai dentro dela.
 *
 * O destaque NÃO mora só na cor, e o motivo é medido à mão nos dois temas (TOK-9): `--chart-1`
 * contra `--text-muted` dá 1,82:1 no escuro e 1,12:1 no claro, ou seja no tema claro a cor sozinha
 * não separa a marca acesa da neutra. Nenhuma guarda do check mede marca contra marca. Por isso o
 * destaque soma três canais além da cor: preenchimento (ponto cheio contra anel vazado), tamanho
 * (raio 3,8 px contra 2,6 px) e revestimento de `--surface-raised` por baixo do contorno, que mede
 * 9,50:1 contra `--chart-1` no escuro e 6,00:1 no claro (TOK-4).
 */
export interface TeamBackdropScatterGridProps {
  readonly data?: readonly ExecutivePanel[];
  readonly height?: number;
  readonly className?: string;
}

const COLUMNS = 4;
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

/** Contexto neutro: `--text-muted` é a "categoria neutra" da tabela de tokens da seção 7, e mede
 * 5,21:1 no escuro e 5,37:1 no claro contra o cartão, acima do piso de 3:1 da ACE-3. O papel
 * "Neutro de dado" da 17.2 indica `--line-strong`, que mede 1,79:1 e 1,83:1 e só se sustenta com o
 * valor escrito na marca; numa nuvem de 84 pontos não há valor a escrever em cada um, então aqui
 * vale a medição e não a linha da tabela (divergência declarada no README e no `notes`). */
const TEAM_STROKE = 'var(--text-muted)';
const FOCUS_FILL = 'var(--chart-1)';
/** Revestimento na cor do cartão: é ele que separa o ponto aceso do anel neutro onde os dois se
 * cruzam, porque as duas cores entre si medem 1,12:1 no tema claro (TOK-4 e TOK-9). */
const FOCUS_COAT = 'var(--surface-raised)';

const TEAM_RADIUS = 2.6;
const FOCUS_RADIUS = 3.8;
/** Área do símbolo, porque o `ZAxis` do Recharts escala área e não raio. O tamanho aqui não
 * codifica grandeza nenhuma: ele separa dois papéis, contexto e destaque. */
const TEAM_AREA = Math.PI * TEAM_RADIUS * TEAM_RADIUS;
const FOCUS_AREA = Math.PI * FOCUS_RADIUS * FOCUS_RADIUS;
const TEAM_Z = 1;
const FOCUS_Z = 3;

interface PlotPoint {
  readonly ticket: number;
  readonly ciclo: number;
  readonly z: number;
}

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
 * vazia, nunca `0`: zero real é um ciclo plausível e um ticket plausível, então a mediana zerada de
 * um painel sem oportunidade seria eleita a mais curta da grade justamente onde não houve nada para
 * medir (EST-1b).
 */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const middle = sorted[mid] ?? 0;
  return sorted.length % 2 === 0 ? ((sorted[mid - 1] ?? middle) + middle) / 2 : middle;
}

/** Um painel cuja mediana foi medida, que é o único que pode disputar os extremos da frase. */
interface MeasuredPanel {
  readonly executive: ExecutivePanel;
  readonly medianTicket: number;
  readonly medianCiclo: number;
}

export default function TeamBackdropScatterGrid({ data = defaultData, height, className }: TeamBackdropScatterGridProps) {
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
  /** Domínio derivado do conjunto inteiro, e não de constante escrita à mão: é o que a EIX-9 pede e
   * o que mantém a promessa de escala comum quando a página passa outro `data` por prop. */
  const maxTicket = data.reduce((top, item) => item.points.reduce((inner, point) => Math.max(inner, point.ticket), top), 0);
  const maxCiclo = data.reduce((top, item) => item.points.reduce((inner, point) => Math.max(inner, point.ciclo), top), 0);
  const ticketTop = Math.max(TICKET_STEP, Math.ceil(maxTicket / TICKET_STEP) * TICKET_STEP);
  const cicloTop = Math.max(CICLO_STEP, Math.ceil(maxCiclo / CICLO_STEP) * CICLO_STEP);
  const ticketTicks = [0, ticketTop / 2, ticketTop];
  const cicloTicks = [0, cicloTop / 2, cicloTop];

  /**
   * Coordenadas de grade calculadas do domínio e da área útil, não dos tiques do eixo: a malha
   * nativa do Recharts sai dos mesmos tiques que decidem o rótulo visível, então nos painéis com
   * `tick={false}` ela ficaria incompleta e diferente de painel para painel, o que a EIX-9 proíbe.
   */
  const gridX = ({ offset }: VerticalGridArgs): number[] =>
    ticketTicks.map((value) => offset.left + (value / ticketTop) * offset.width);
  const gridY = ({ offset }: HorizontalGridArgs): number[] =>
    cicloTicks.map((value) => offset.top + offset.height - (value / cicloTop) * offset.height);

  /** A nuvem de fundo é montada uma vez e reusada nos painéis, para ser literalmente a mesma figura. */
  const teamCloud: readonly PlotPoint[] = data.flatMap((item) =>
    item.points.map((point) => ({ ticket: point.ticket, ciclo: point.ciclo, z: TEAM_Z })),
  );

  const owners = tickOwners(data.map((item) => item.points.length > 0), COLUMNS);
  const withMedian = data.map((executive) => ({
    executive,
    medianTicket: median(executive.points.map((point) => point.ticket)),
    medianCiclo: median(executive.points.map((point) => point.ciclo)),
  }));
  const measured: readonly MeasuredPanel[] = withMedian.filter(
    (row): row is MeasuredPanel => row.medianTicket !== null && row.medianCiclo !== null,
  );
  const unmeasured = withMedian.length - measured.length;
  const first = measured[0];
  const richest = first === undefined ? undefined : measured.reduce((top, row) => (row.medianTicket > top.medianTicket ? row : top), first);
  const fastest = first === undefined ? undefined : measured.reduce((top, row) => (row.medianCiclo < top.medianCiclo ? row : top), first);

  /** Os textos dos extremos nascem uma vez e vão para a frase acessível e para a linha de leitura,
   * que é a saída da DAD-5: o mesmo número não sai com duas aparências. */
  const richestText = richest === undefined ? '' : `${richest.executive.name} tem o maior ticket mediano, ${formatCurrencyCompact(richest.medianTicket)}`;
  const fastestText = fastest === undefined ? '' : `${fastest.executive.name} o ciclo mais curto, ${formatDays(Math.round(fastest.medianCiclo))}`;
  const scaleText = `ticket até ${formatCurrencyAxis(ticketTop)} e ciclo até ${formatDays(cicloTop)}`;

  const summary =
    `Pequenos múltiplos de dispersão: ticket contra ciclo de ${formatInt(teamCloud.length)} oportunidades, um painel por executivo, com a nuvem do time ao fundo de todos.` +
    (richest && fastest && richest !== fastest ? ` ${richestText}; ${fastestText}.` : '') +
    (unmeasured === 0 ? '' : ` ${formatInt(unmeasured)} ${unmeasured === 1 ? 'painel fica' : 'painéis ficam'} sem oportunidade ganha.`);

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul aria-hidden className="mb-1 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 text-xs tabular-nums text-text-secondary">
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height={10} viewBox="0 0 10 10" width={10}>
            <circle cx={5} cy={5} fill="none" r={3.2} stroke={TEAM_STROKE} strokeWidth={1} />
          </svg>
          <span>
            Anel vazado: as {formatInt(teamCloud.length)} oportunidades do time, a mesma nuvem nos {formatInt(data.length)} painéis
          </span>
        </li>
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height={10} viewBox="0 0 10 10" width={10}>
            <circle cx={5} cy={5} fill={FOCUS_FILL} r={3.8} stroke={FOCUS_COAT} strokeWidth={1} />
          </svg>
          <span>Ponto cheio e maior: as do executivo do painel</span>
        </li>
      </ul>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-muted">
        {`Mesma escala nos ${formatInt(data.length)} painéis, ${scaleText}.${richest && fastest && richest !== fastest ? ` ${richestText}; ${fastestText}.` : ''}`}
      </p>
      <div
        className="grid min-h-0 flex-1 gap-3"
        style={{
          gridTemplateColumns: `repeat(${String(COLUMNS)}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${String(rows)}, minmax(0, 1fr))`,
        }}
      >
        {withMedian.map(({ executive }, index) => {
          const focusCloud: readonly PlotPoint[] = executive.points.map((point) => ({
            ticket: point.ticket,
            ciclo: point.ciclo,
            z: FOCUS_Z,
          }));
          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={executive.id}>
              {/* O nome ocupa a primeira linha sozinho, com a largura inteira do painel: com a
                  contagem ao lado dele o nome mais longo da grade sairia com reticência, que a
                  TIP-7 proíbe em nome de categoria desenhada. */}
              <span className="mb-0.5 block shrink-0 text-xs leading-tight font-medium text-text-secondary">
                {executive.name}
              </span>
              <p aria-hidden className="mb-1 shrink-0 text-[0.6875rem] leading-tight tabular-nums text-text-muted">
                {`${formatInt(executive.points.length)} ${executive.points.length === 1 ? 'oportunidade' : 'oportunidades'}`}
              </p>
              <div className="min-h-0 flex-1">
                {executive.points.length === 0 ? (
                  /* Painel sem observação não recebe plano: sem grade e sem eixo, moldura tracejada
                     e a ausência escrita (EST-1, e a DAD-2 que pede a ausência contornada). Com
                     grade e eixos e nenhum ponto, o painel leria como "medimos o plano e nada caiu
                     aqui", que é afirmação diferente. */
                  <div
                    className="flex h-full w-full items-center justify-center rounded border border-dashed border-line-subtle px-2 text-center"
                    role="status"
                  >
                    <span className="flex items-center gap-1.5 text-[0.6875rem] leading-tight text-text-muted">
                      <Filter aria-hidden className="size-3.5 shrink-0" />
                      Sem oportunidade ganha no trimestre
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
                      <ZAxis dataKey="z" domain={[TEAM_Z, FOCUS_Z]} range={[TEAM_AREA, FOCUS_AREA]} type="number" />
                      {/* A nuvem do time vem antes na ordem do JSX, então é desenhada por baixo. */}
                      <Scatter data={[...teamCloud]} fill="none" isAnimationActive={false} shape="circle" stroke={TEAM_STROKE} strokeWidth={1} />
                      <Scatter data={[...focusCloud]} fill={FOCUS_FILL} isAnimationActive={animate} shape="circle" stroke={FOCUS_COAT} strokeWidth={1} />
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
