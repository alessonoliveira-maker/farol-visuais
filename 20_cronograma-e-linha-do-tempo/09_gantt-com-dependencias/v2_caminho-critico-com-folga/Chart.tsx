import { Filter, Unplug } from 'lucide-react';
import { useId } from 'react';

import { formatDate, formatDays, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PlanTask } from './data';

/**
 * Gantt com caminho crítico: as datas cedo e tarde de cada tarefa são calculadas antes do desenho, a
 * sequência sem folga que define a data final acende, e a folga das demais vira um trilho tracejado
 * depois da barra, com os dias úteis escritos na linha. Responde o que atrasa a entrega se atrasar.
 */
export interface CriticalPathGanttProps {
  /** Tarefas com início e fim planejados e a lista de predecessoras. A ordem de entrada é a ordem das linhas. */
  readonly data?: readonly PlanTask[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const WORK_WEEK = 5;
/** Segunda-feira de referência do calendário de dias úteis. */
const MONDAY_EPOCH_MS = Date.UTC(1970, 0, 5);
/**
 * Largura do viewBox: a que o corpo do canvas largo entrega ao SVG (960 menos 66 px de moldura).
 * A altura sai da conta de linhas, então no preview a escala é 1 e os 11 px chegam com 11 px (GEO-18).
 */
const VIEW_WIDTH = 894;
/** Coluna da folga, alinhada à direita (TIP-6); o nome da tarefa ocupa o que vem antes dela. */
const SLACK_COLUMN_RIGHT = 276;
const PLOT_LEFT = 296;
const PLOT_RIGHT = VIEW_WIDTH - 12;
/** Faixa do topo: cabeçalho da coluna. */
const TOP = 18;
const TOP_BASELINE = 11;
const ROW_HEIGHT = 26;
const BAR_HEIGHT = 14;
const BAR_RADIUS = 3;
const AXIS_HEIGHT = 24;
const TICK_MARGIN = 8;
/** Meia largura do rótulo de data em 11 px, para o tique da borda não sair do viewBox. */
const DATE_HALF_WIDTH = 32;
/** Distância entre o fim da predecessora e a perna vertical do cotovelo. */
const LEG_OFFSET = 10;
const ARROW = 6;
const CRITICAL_ARROW = 8;
const LINK_WIDTH = 1.5;
const CRITICAL_LINK_WIDTH = 2.5;
/** Halo na cor do cartão por baixo do conector, para ele se ver onde cruza barra ou trilho (TOK-10). */
const HALO_EXTRA = 3.5;
const CRITICAL_FILL = 'var(--chart-1)';
/**
 * Tarefa com folga, conector e trilho em --text-muted (5,21:1 e 5,37:1) e não em --line-strong
 * (1,79:1 e 1,83:1): a barra é dado, e o conector e o trilho carregam relação (ACE-6, TOK-5).
 */
const SLACK_FILL = 'var(--text-muted)';
const NUM = 'kpi-number font-medium text-text-primary';
const READING = 'mb-2 h-5 shrink-0 text-xs leading-5 text-text-secondary';

interface Timing {
  readonly earlyStart: number;
  readonly earlyFinish: number;
  readonly lateFinish: number;
  /** Dias úteis que a tarefa pode atrasar sem empurrar o fim do plano. */
  readonly slack: number;
}

interface Row {
  readonly task: PlanTask;
  readonly timing: Timing;
  readonly critical: boolean;
  readonly x0: number;
  readonly x1: number;
  /** Fim do trilho de folga: a data tarde de término. */
  readonly lateX: number;
  readonly y: number;
}

interface Link {
  readonly key: string;
  readonly critical: boolean;
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

/** Índice de dia útil de uma data: segunda a sexta contam; sábado e domingo caem na sexta anterior. */
function toWorkIndex(ms: number): number {
  const days = Math.round((ms - MONDAY_EPOCH_MS) / DAY_MS);
  const week = Math.floor(days / 7);
  return week * WORK_WEEK + Math.min(days - week * 7, WORK_WEEK - 1);
}

/** Data, em milissegundos UTC, de um índice de dia útil. */
function fromWorkIndex(index: number): number {
  const week = Math.floor(index / WORK_WEEK);
  return MONDAY_EPOCH_MS + (week * 7 + (index - week * WORK_WEEK)) * DAY_MS;
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

/** Contagem de dias úteis com a concordância certa: 1 dia útil, 12 dias úteis. */
function workDays(days: number): string {
  return `${formatDays(days)} ${Math.abs(days) === 1 ? 'útil' : 'úteis'}`;
}

/** Predecessoras válidas de cada tarefa: sem repetição, sem a própria tarefa e sem id fora do plano. */
function predecessorMap(tasks: readonly PlanTask[]): Map<string, readonly string[]> {
  const known = new Set(tasks.map((task) => task.id));
  return new Map(
    tasks.map((task) => [task.id, [...new Set(task.dependsOn)].filter((id) => known.has(id) && id !== task.id)] as const),
  );
}

/**
 * Ordem topológica pelo algoritmo de Kahn: entra quem não espera mais ninguém. Devolve `null` quando
 * sobra tarefa fora da ordem, isto é, quando o plano tem ciclo e não existe caminho crítico a calcular.
 */
function topologicalOrder(ids: readonly string[], predecessors: ReadonlyMap<string, readonly string[]>): string[] | null {
  const waiting = new Map(ids.map((id) => [id, (predecessors.get(id) ?? []).length]));
  const order = ids.filter((id) => waiting.get(id) === 0);
  for (let cursor = 0; cursor < order.length; cursor += 1) {
    const released = order[cursor];
    if (released === undefined) break;
    for (const id of ids) {
      if (!(predecessors.get(id) ?? []).includes(released)) continue;
      const left = (waiting.get(id) ?? 0) - 1;
      waiting.set(id, left);
      if (left === 0) order.push(id);
    }
  }
  return order.length === ids.length ? order : null;
}

/**
 * Datas cedo e tarde em índice de dia útil. Passada para a frente: a tarefa começa no dia útil
 * seguinte ao fim da última predecessora, nunca antes do início planejado. Passada para trás, a
 * partir do fim do plano: a tarefa termina no dia útil anterior ao início tarde da primeira sucessora.
 */
function computeTimings(
  tasks: readonly PlanTask[],
  order: readonly string[],
  predecessors: ReadonlyMap<string, readonly string[]>,
): Map<string, Timing> {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const early = new Map<string, { readonly start: number; readonly finish: number }>();
  let planFinish = Number.NEGATIVE_INFINITY;
  for (const id of order) {
    const task = byId.get(id);
    if (task === undefined) continue;
    const plannedStart = toWorkIndex(toMs(task.start));
    const duration = Math.max(toWorkIndex(toMs(task.end)) - plannedStart + 1, 1);
    let start = plannedStart;
    for (const before of predecessors.get(id) ?? []) {
      const done = early.get(before);
      if (done !== undefined) start = Math.max(start, done.finish + 1);
    }
    early.set(id, { start, finish: start + duration - 1 });
    planFinish = Math.max(planFinish, start + duration - 1);
  }
  const lateStart = new Map<string, number>();
  const timings = new Map<string, Timing>();
  for (const id of [...order].reverse()) {
    const own = early.get(id);
    if (own === undefined) continue;
    let lateFinish = planFinish;
    for (const after of order) {
      const afterStart = lateStart.get(after);
      if (afterStart !== undefined && (predecessors.get(after) ?? []).includes(id)) lateFinish = Math.min(lateFinish, afterStart - 1);
    }
    lateStart.set(id, lateFinish - (own.finish - own.start));
    timings.set(id, { earlyStart: own.start, earlyFinish: own.finish, lateFinish, slack: lateFinish - own.finish });
  }
  return timings;
}

/**
 * Conector em cotovelo, do fim da predecessora ao início da sucessora. O caminho para na base da
 * seta, que o marcador desenha dali até a barra. Com vão, é M H V H; sem vão para o cotovelo e a
 * seta, contorna pela esquerda passando entre as duas linhas, sem cruzar barra nenhuma.
 */
function elbowPath(from: Row, to: Row, arrow: number): string {
  const start = `M${px(from.x1)},${px(from.y)}`;
  const legX = from.x1 + LEG_OFFSET;
  const tipBase = to.x0 - arrow;
  if (tipBase >= legX) return `${start} H${px(legX)} V${px(to.y)} H${px(tipBase)}`;
  const betweenRows = from.y + (to.y >= from.y ? ROW_HEIGHT / 2 : -ROW_HEIGHT / 2);
  return `${start} H${px(legX)} V${px(betweenRows)} H${px(tipBase - LEG_OFFSET)} V${px(to.y)} H${px(tipBase)}`;
}

export default function CriticalPathGantt({ data = defaultData, height, className }: CriticalPathGanttProps) {
  // Id dos marcadores por useId: dois Gantts na mesma página não disputam a mesma ponta de seta.
  const idBase = `gantt-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const style = height === undefined ? undefined : { height };
  const statusClass = cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className);

  if (data.length === 0) {
    return (
      <div className={statusClass} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma tarefa neste recorte: não há plano para desenhar nem caminho crítico para calcular.</span>
      </div>
    );
  }

  const predecessors = predecessorMap(data);
  const order = topologicalOrder(data.map((task) => task.id), predecessors);
  const timings = order === null ? null : computeTimings(data, order, predecessors);
  const planFinish = timings === null ? null : maxOf([...timings.values()].map((timing) => timing.earlyFinish));
  const planStart = timings === null ? null : minOf([...timings.values()].map((timing) => timing.earlyStart));

  if (timings === null || planFinish === null || planStart === null) {
    return (
      <div className={statusClass} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>
          Caminho crítico {formatUnavailable()}: o plano tem dependência em ciclo, e sem ordem entre as tarefas não há
          data cedo nem tarde para calcular.
        </span>
      </div>
    );
  }

  const startMs = mondayOf(fromWorkIndex(planStart));
  const endMs = fromWorkIndex(planFinish) + DAY_MS;
  const x = timeScale(startMs, endMs);
  const ticks = mondayTicks(startMs, endMs);

  const rows: Row[] = data.flatMap((task, index) => {
    const timing = timings.get(task.id);
    if (timing === undefined) return [];
    return [
      {
        task,
        timing,
        critical: timing.slack === 0,
        x0: x(fromWorkIndex(timing.earlyStart)),
        x1: x(fromWorkIndex(timing.earlyFinish) + DAY_MS),
        lateX: x(fromWorkIndex(timing.lateFinish) + DAY_MS),
        y: bandCenter(index),
      },
    ];
  });
  const byId = new Map(rows.map((row) => [row.task.id, row]));
  const links: Link[] = rows.flatMap((to) =>
    (predecessors.get(to.task.id) ?? []).flatMap((id) => {
      const from = byId.get(id);
      if (from === undefined) return [];
      // Conector crítico: as duas pontas sem folga e nenhum dia útil livre entre elas.
      const critical = from.critical && to.critical && from.timing.earlyFinish + 1 === to.timing.earlyStart;
      return [{ key: `${from.task.id}-${to.task.id}`, critical, d: elbowPath(from, to, critical ? CRITICAL_ARROW : ARROW) }];
    }),
  );
  const slackLinks = links.filter((link) => !link.critical);
  const criticalLinks = links.filter((link) => link.critical);

  const plotBottom = TOP + rows.length * ROW_HEIGHT;
  const viewHeight = plotBottom + AXIS_HEIGHT;
  const criticalCount = rows.filter((row) => row.critical).length;
  const slackRows = rows.filter((row) => !row.critical);
  const minSlack = minOf(slackRows.map((row) => row.timing.slack));
  const maxSlack = maxOf(slackRows.map((row) => row.timing.slack));
  const widest = slackRows.find((row) => row.timing.slack === maxSlack);
  const finishIso = toIso(fromWorkIndex(planFinish));

  const slackSentence =
    minSlack === null || maxSlack === null || widest === undefined
      ? 'Nenhuma tarefa tem folga.'
      : minSlack === maxSlack
        ? `Fora dele, a folga é de ${workDays(maxSlack)}.`
        : `Fora dele, a folga vai de ${formatInt(minSlack)} a ${workDays(maxSlack)}; a maior é de ${lowerFirst(widest.task.name)}.`;
  const summary = `Gráfico de Gantt com caminho crítico de ${formatInt(criticalCount)} das ${formatInt(rows.length)} tarefas, sem folga, que define a entrada no ar em ${formatDate(finishIso)}. ${slackSentence}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className={READING}>
        O caminho crítico tem <span className={NUM}>{formatInt(criticalCount)}</span> das{' '}
        <span className={NUM}>{formatInt(rows.length)}</span> tarefas e define a entrada no ar em{' '}
        <span className={NUM}>{formatDate(finishIso)}</span>
        {minSlack === null || maxSlack === null ? (
          '; nenhuma tarefa tem folga.'
        ) : minSlack === maxSlack ? (
          <>
            ; fora dele, a folga é de <span className={NUM}>{workDays(maxSlack)}</span>.
          </>
        ) : (
          <>
            ; fora dele, a folga vai de <span className={NUM}>{formatInt(minSlack)}</span> a{' '}
            <span className={NUM}>{workDays(maxSlack)}</span>.
          </>
        )}
      </p>
      {/* Legenda na ordem em que as marcas aparecem na linha: barra, e depois o trilho (ROT-4). */}
      <ul aria-hidden className="mb-2 flex h-4 shrink-0 items-center gap-5 text-xs leading-4 text-text-secondary">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 shrink-0 rounded-[2px]" style={{ backgroundColor: CRITICAL_FILL }} />
          <span>caminho crítico, sem folga</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 shrink-0 rounded-[2px]" style={{ backgroundColor: SLACK_FILL }} />
          <span>tarefa com folga</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="w-5 shrink-0 border-t-[1.5px] border-dashed border-text-muted" />
          <span>folga até a data tarde de término</span>
        </li>
      </ul>
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
            <marker id={`${idBase}-slack`} markerHeight={ARROW} markerUnits="userSpaceOnUse" markerWidth={ARROW} refX={0} refY={ARROW / 2}>
              <path d={`M0,0 L${String(ARROW)},${String(ARROW / 2)} L0,${String(ARROW)} Z`} fill={SLACK_FILL} />
            </marker>
            <marker
              id={`${idBase}-critical`}
              markerHeight={CRITICAL_ARROW}
              markerUnits="userSpaceOnUse"
              markerWidth={CRITICAL_ARROW}
              refX={0}
              refY={CRITICAL_ARROW / 2}
            >
              <path
                d={`M0,0 L${String(CRITICAL_ARROW)},${String(CRITICAL_ARROW / 2)} L0,${String(CRITICAL_ARROW)} Z`}
                fill={CRITICAL_FILL}
              />
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
          {/* Trilho de folga: do fim da barra até a data tarde, com um batente no fim. Folga zero não tem trilho e escreve 0 na coluna (EST-3). */}
          {slackRows.map((row) => (
            <g key={`slack-${row.task.id}`}>
              <line
                stroke={SLACK_FILL}
                strokeDasharray="3 3"
                strokeWidth={LINK_WIDTH}
                vectorEffect="non-scaling-stroke"
                x1={row.x1}
                x2={row.lateX}
                y1={row.y}
                y2={row.y}
              />
              <line
                stroke={SLACK_FILL}
                strokeWidth={LINK_WIDTH}
                vectorEffect="non-scaling-stroke"
                x1={row.lateX}
                x2={row.lateX}
                y1={row.y - BAR_HEIGHT / 2}
                y2={row.y + BAR_HEIGHT / 2}
              />
            </g>
          ))}
          {rows.map((row) => (
            <rect
              fill={row.critical ? CRITICAL_FILL : SLACK_FILL}
              height={BAR_HEIGHT}
              key={`bar-${row.task.id}`}
              rx={BAR_RADIUS}
              width={Math.max(row.x1 - row.x0, 1)}
              x={row.x0}
              y={row.y - BAR_HEIGHT / 2}
            />
          ))}
          {/* Os críticos por último: onde cruzam um conector comum, o halo deles abre a passagem e eles ficam por cima. */}
          {[slackLinks, criticalLinks].map((group, groupIndex) => {
            const critical = groupIndex === 1;
            const width = critical ? CRITICAL_LINK_WIDTH : LINK_WIDTH;
            return (
              <g key={critical ? 'critical-links' : 'slack-links'}>
                {group.map((link) => (
                  <path
                    d={link.d}
                    fill="none"
                    key={`halo-${link.key}`}
                    stroke="var(--surface-raised)"
                    strokeWidth={width + HALO_EXTRA}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {group.map((link) => (
                  <path
                    d={link.d}
                    fill="none"
                    key={`link-${link.key}`}
                    markerEnd={`url(#${idBase}-${critical ? 'critical' : 'slack'})`}
                    stroke={critical ? CRITICAL_FILL : SLACK_FILL}
                    strokeLinejoin="round"
                    strokeWidth={width}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>
            );
          })}
          <text className="font-sans" fill="var(--text-muted)" fontSize={11} fontWeight={500} textAnchor="end" x={SLACK_COLUMN_RIGHT} y={TOP_BASELINE}>
            folga, em dias úteis
          </text>
          {rows.map((row) => (
            <g key={`label-${row.task.id}`}>
              <text
                className="font-sans"
                dominantBaseline="central"
                fill={row.critical ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={12}
                fontWeight={row.critical ? 600 : 500}
                x={0}
                y={row.y}
              >
                {row.task.name}
              </text>
              <text
                className="font-display"
                dominantBaseline="central"
                fill={row.critical ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={11}
                fontWeight={row.critical ? 600 : 500}
                textAnchor="end"
                x={SLACK_COLUMN_RIGHT}
                y={row.y}
              >
                {formatDays(row.timing.slack)}
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
