import { Filter } from 'lucide-react';
import { useId } from 'react';

import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, today as defaultToday, type PlanTask } from './data';

/**
 * Gantt com dependências: uma linha por tarefa, a barra do primeiro ao último dia de trabalho e um
 * conector em cotovelo do fim de cada predecessora ao início da sucessora. Responde o que precisa
 * terminar antes de cada tarefa começar e onde o plano está hoje. A geometria é toda calculada aqui.
 */
export interface ChannelRolloutGanttProps {
  /** Tarefas com início e fim inclusive e a lista de predecessoras. A ordem de entrada é a ordem das linhas. */
  readonly data?: readonly PlanTask[];
  /** Hoje, em YYYY-MM-DD, vindo do dado e nunca do relógio. */
  readonly today?: string;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
/**
 * Largura do viewBox: a que o corpo do canvas largo entrega ao SVG (960 menos 66 px de moldura).
 * A altura sai da conta de linhas, então no preview a escala é 1 e os 11 px chegam com 11 px (GEO-18).
 */
const VIEW_WIDTH = 894;
/** Coluna do término, alinhada à direita (TIP-6); o nome da tarefa ocupa o que vem antes dela. */
const END_COLUMN_RIGHT = 276;
const PLOT_LEFT = 296;
const PLOT_RIGHT = VIEW_WIDTH - 12;
/** Faixa do topo: rótulo de hoje e cabeçalho da coluna. */
const TOP = 18;
const TOP_BASELINE = 11;
const ROW_HEIGHT = 30;
const BAR_HEIGHT = 14;
const BAR_RADIUS = 3;
const AXIS_HEIGHT = 24;
const TICK_MARGIN = 8;
/** Meia largura do rótulo de data em 11 px, para o tique da borda não sair do viewBox. */
const DATE_HALF_WIDTH = 32;
const TODAY_HALF_WIDTH = 50;
/** Distância entre o fim da predecessora e a perna vertical do cotovelo. */
const LEG_OFFSET = 10;
const ARROW = 6;
const LINK_WIDTH = 1.5;
/** Halo na cor do cartão por baixo do conector e da linha de hoje, para os dois se verem sobre uma barra (TOK-10). */
const HALO_WIDTH = 5;
/** Conector carrega a relação: sai de --line-strong (1,79:1) para --text-muted, 5,21:1 e 5,37:1 (ACE-6). */
const LINK_STROKE = 'var(--text-muted)';
const NUM = 'kpi-number font-medium text-text-primary';

interface Row {
  readonly task: PlanTask;
  readonly startMs: number;
  /** Fim exclusivo: o último dia de trabalho ocupa o dia inteiro. */
  readonly endMs: number;
  readonly x0: number;
  readonly x1: number;
  readonly y: number;
}

interface Link {
  readonly key: string;
  readonly from: Row;
  readonly to: Row;
  readonly d: string;
}

/** Data YYYY-MM-DD em milissegundos UTC. */
function toMs(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function toIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Segunda-feira da semana de uma data, por Date.UTC: o tique semanal cai sempre no mesmo dia. */
function mondayOf(ms: number): number {
  const date = new Date(ms);
  const sinceMonday = (date.getUTCDay() + 6) % 7;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - sinceMonday);
}

/** Todas as segundas do eixo, da primeira até a última antes do fim. */
function mondayTicks(startMs: number, endMs: number): number[] {
  const ticks: number[] = [];
  for (let tick = mondayOf(startMs); tick < endMs; tick += WEEK_MS) ticks.push(tick);
  return ticks;
}

/** Escala de tempo: milissegundos para x, linear entre o início e o fim do eixo. */
function timeScale(startMs: number, endMs: number): (ms: number) => number {
  const span = Math.max(endMs - startMs, DAY_MS);
  return (ms) => PLOT_LEFT + ((ms - startMs) / span) * (PLOT_RIGHT - PLOT_LEFT);
}

/** Escala de banda: índice da linha para o centro vertical, com altura de linha fixa. */
function bandCenter(index: number): number {
  return TOP + index * ROW_HEIGHT + ROW_HEIGHT / 2;
}

/** Menor valor de uma lista; `null` quando a lista é vazia (EST-1b). */
function minOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.min(...values);
}

/** Maior valor de uma lista; `null` quando a lista é vazia (EST-1b). */
function maxOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.max(...values);
}

/** Coordenada com duas casas, para o caminho não carregar dízima. */
function px(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/** Nome de tarefa no meio de uma oração: a inicial maiúscula do rótulo vira minúscula. */
function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * Conector em cotovelo, do fim da predecessora ao início da sucessora. O caminho para na base da
 * seta, que o marcador desenha dali até a barra. Com vão, é M H V H; sem vão para o cotovelo e a
 * seta, contorna pela esquerda passando entre as duas linhas, sem cruzar barra nenhuma.
 */
function elbowPath(from: Row, to: Row): string {
  const start = `M${px(from.x1)},${px(from.y)}`;
  const legX = from.x1 + LEG_OFFSET;
  const tipBase = to.x0 - ARROW;
  if (tipBase >= legX) return `${start} H${px(legX)} V${px(to.y)} H${px(tipBase)}`;
  const betweenRows = from.y + (to.y >= from.y ? ROW_HEIGHT / 2 : -ROW_HEIGHT / 2);
  return `${start} H${px(legX)} V${px(betweenRows)} H${px(tipBase - LEG_OFFSET)} V${px(to.y)} H${px(tipBase)}`;
}

export default function ChannelRolloutGantt({
  data = defaultData,
  today = defaultToday,
  height,
  className,
}: ChannelRolloutGanttProps) {
  // Id do marcador por useId: dois Gantts na mesma página não disputam a mesma ponta de seta.
  const arrowId = `gantt-arrow-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const style = height === undefined ? undefined : { height };
  const todayMs = toMs(today);
  const firstMs = minOf(data.map((task) => toMs(task.start)));
  const lastMs = maxOf(data.map((task) => toMs(task.end) + DAY_MS));

  if (firstMs === null || lastMs === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma tarefa neste recorte: não há plano para desenhar nem dependência para ligar.</span>
      </div>
    );
  }

  // O eixo começa na segunda da primeira tarefa e se estende para caber hoje, quando hoje cai fora do plano.
  const startMs = mondayOf(Math.min(firstMs, todayMs));
  const endMs = Math.max(lastMs, todayMs + DAY_MS);
  const x = timeScale(startMs, endMs);
  const ticks = mondayTicks(startMs, endMs);

  const rows: Row[] = data.map((task, index) => {
    const taskStart = toMs(task.start);
    const taskEnd = toMs(task.end) + DAY_MS;
    return { task, startMs: taskStart, endMs: taskEnd, x0: x(taskStart), x1: x(taskEnd), y: bandCenter(index) };
  });
  const byId = new Map(rows.map((row) => [row.task.id, row]));
  const links: Link[] = rows.flatMap((to) =>
    to.task.dependsOn.flatMap((id) => {
      const from = byId.get(id);
      if (from === undefined || from === to) return [];
      return [{ key: `${from.task.id}-${to.task.id}`, from, to, d: elbowPath(from, to) }];
    }),
  );

  const plotBottom = TOP + rows.length * ROW_HEIGHT;
  const viewHeight = plotBottom + AXIS_HEIGHT;
  const todayX = x(todayMs);
  const todayLabelX = Math.min(Math.max(todayX, PLOT_LEFT + TODAY_HALF_WIDTH), VIEW_WIDTH - TODAY_HALF_WIDTH);

  const done = rows.filter((row) => row.endMs <= todayMs).length;
  const running = rows.filter((row) => row.startMs <= todayMs && todayMs < row.endMs).length;
  const pending = rows.length - done - running;
  // A última a terminar fecha o plano; no empate vale a linha mais abaixo.
  const last = rows.reduce((best, row) => (row.endMs >= best.endMs ? row : best));
  const waiting = links.filter((link) => link.to === last).length;
  const doneWord = done === 1 ? 'tarefa concluída' : 'tarefas concluídas';
  const waitingWord = waiting === 1 ? 'predecessora' : 'predecessoras';

  const summary = [
    `Gráfico de Gantt com dependências: ${formatInt(rows.length)} tarefas e ${formatInt(links.length)} ligações de ${formatDate(toIso(firstMs))} a ${formatDate(last.task.end)}.`,
    `Em ${formatDate(today)}, ${formatInt(done)} ${doneWord}, ${formatInt(running)} em andamento e ${formatInt(pending)} por começar.`,
    `A última, ${lowerFirst(last.task.name)}, espera ${formatInt(waiting)} ${waitingWord}.`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 h-5 shrink-0 text-xs leading-5 text-text-secondary">
        Em <span className={NUM}>{formatDate(today)}</span>, <span className={NUM}>{formatInt(done)}</span> {doneWord},{' '}
        <span className={NUM}>{formatInt(running)}</span> em andamento e <span className={NUM}>{formatInt(pending)}</span>{' '}
        por começar; a última espera <span className={NUM}>{formatInt(waiting)}</span> {waitingWord} e fecha o plano em{' '}
        <span className={NUM}>{formatDate(last.task.end)}</span>.
      </p>
      <div className="min-h-0 w-full flex-1">
        {/* viewBox fixo: no Farol o desenho encolhe inteiro com o cartão, e vectorEffect segura a espessura dos traços. */}
        <svg
          aria-hidden
          className="block h-auto max-h-full w-full"
          preserveAspectRatio="xMinYMin meet"
          viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(viewHeight)}`}
        >
          <defs>
            {/* Sem orient: todo conector entra na barra pela esquerda, então a seta aponta sempre para a direita. */}
            <marker id={arrowId} markerHeight={ARROW} markerUnits="userSpaceOnUse" markerWidth={ARROW} refX={0} refY={ARROW / 2}>
              <path d={`M0,0 L${String(ARROW)},${String(ARROW / 2)} L0,${String(ARROW)} Z`} fill={LINK_STROKE} />
            </marker>
          </defs>
          {ticks.map((tick) => (
            <line
              key={`grid-${String(tick)}`}
              stroke="var(--line-subtle)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              x1={x(tick)}
              x2={x(tick)}
              y1={TOP}
              y2={plotBottom}
            />
          ))}
          {rows.map((row) => (
            <rect
              fill="var(--chart-1)"
              height={BAR_HEIGHT}
              key={`bar-${row.task.id}`}
              rx={BAR_RADIUS}
              width={Math.max(row.x1 - row.x0, 1)}
              x={row.x0}
              y={row.y - BAR_HEIGHT / 2}
            />
          ))}
          {/* Duas linhas: o fio da cor do cartão por baixo deixa a linha de hoje visível sobre a barra colorida (TOK-10). */}
          <line stroke="var(--surface-raised)" strokeWidth={HALO_WIDTH} vectorEffect="non-scaling-stroke" x1={todayX} x2={todayX} y1={TOP} y2={plotBottom} />
          <line stroke="var(--text-primary)" strokeWidth={LINK_WIDTH} vectorEffect="non-scaling-stroke" x1={todayX} x2={todayX} y1={TOP} y2={plotBottom} />
          {/* Conector por cima da linha de hoje e das barras: o halo abre passagem onde a perna cruza outra marca. */}
          {links.map((link) => (
            <path
              d={link.d}
              fill="none"
              key={`halo-${link.key}`}
              stroke="var(--surface-raised)"
              strokeWidth={HALO_WIDTH}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {links.map((link) => (
            <path
              d={link.d}
              fill="none"
              key={`link-${link.key}`}
              markerEnd={`url(#${arrowId})`}
              stroke={LINK_STROKE}
              strokeLinejoin="round"
              strokeWidth={LINK_WIDTH}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <text className="font-sans" fill="var(--text-muted)" fontSize={11} fontWeight={500} textAnchor="end" x={END_COLUMN_RIGHT} y={TOP_BASELINE}>
            término
          </text>
          <text className="font-display" fill="var(--text-primary)" fontSize={11} fontWeight={600} textAnchor="middle" x={todayLabelX} y={TOP_BASELINE}>
            {`hoje, ${formatDate(today)}`}
          </text>
          {rows.map((row) => (
            <g key={`label-${row.task.id}`}>
              <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={row.y}>
                {row.task.name}
              </text>
              <text
                className="font-display"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize={11}
                fontWeight={500}
                textAnchor="end"
                x={END_COLUMN_RIGHT}
                y={row.y}
              >
                {formatDate(row.task.end)}
              </text>
            </g>
          ))}
          {ticks.map((tick) => {
            const tickX = x(tick);
            // Tique colado à borda direita fica com a linha de grade e sem o rótulo, que sairia do viewBox.
            if (tickX + DATE_HALF_WIDTH > VIEW_WIDTH) return null;
            return (
              <text
                className="font-display"
                fill="var(--text-muted)"
                fontSize={11}
                fontWeight={500}
                key={`tick-${String(tick)}`}
                textAnchor="middle"
                x={Math.max(tickX, DATE_HALF_WIDTH)}
                y={plotBottom + TICK_MARGIN + TICK_MARGIN}
              >
                {formatDate(toIso(tick))}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
