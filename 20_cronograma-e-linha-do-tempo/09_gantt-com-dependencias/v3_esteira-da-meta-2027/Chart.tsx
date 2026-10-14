import { Filter, Unplug } from 'lucide-react';
import { Fragment, useId } from 'react';

import { formatDate, formatDays, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  focusId as defaultFocusId,
  frontLabels,
  frontOrder,
  readingEnd as defaultReadingEnd,
  readingStart as defaultReadingStart,
  type PipelineTask,
} from './data';

/**
 * Gantt com dependências em foco: 18 tarefas agrupadas por frente, com a folga de cada uma escrita
 * na linha e a janela de leitura sombreada no fim do eixo. Os conectores ficam ocultos e só os da
 * tarefa em foco aparecem, com as predecessoras e sucessoras dela acesas e o resto em neutro.
 * Responde se a esteira fecha antes da janela e o que depende da tarefa escolhida.
 */
export interface GoalPipelineGanttProps {
  /** Tarefas com frente, início e fim planejados e predecessoras. Dentro da frente vale a ordem de entrada. */
  readonly data?: readonly PipelineTask[];
  /** Id da tarefa em foco. Id que não existe no plano deixa o desenho sem foco e sem conector. */
  readonly focusId?: string;
  /** Primeiro e último dia da janela de leitura, em YYYY-MM-DD. */
  readonly readingStart?: string;
  readonly readingEnd?: string;
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
 * Largura do viewBox: a que o corpo de um canvas de 960 px entrega ao SVG (960 menos 66 px de moldura).
 * A altura sai da conta de linhas, então no preview a escala é 1 e os 11 px chegam com 11 px (GEO-18).
 */
const VIEW_WIDTH = 894;
/** Recuo do nome da tarefa em relação ao rótulo da frente. */
const NAME_INDENT = 8;
/** Coluna da folga, alinhada à direita (TIP-6); o nome da tarefa ocupa o que vem antes dela. */
const SLACK_COLUMN_RIGHT = 262;
const PLOT_LEFT = 280;
const PLOT_RIGHT = VIEW_WIDTH - 10;
/** Faixa do topo: duas linhas de anotação da janela e o cabeçalho da coluna. */
const TOP = 30;
/** 14 px entre as duas linhas de base: a tinta de uma fica a 5 px da tinta da outra, acima do piso de 4 px. */
const TOP_FIRST_BASELINE = 9;
const TOP_SECOND_BASELINE = 23;
const GROUP_HEADER_HEIGHT = 20;
/** O espaço separa as frentes; linha divisória entre grupos é proibida (ESP-5). */
const GROUP_GAP = 8;
const ROW_HEIGHT = 20;
const BAR_HEIGHT = 12;
const BAR_RADIUS = 3;
const AXIS_HEIGHT = 24;
const TICK_MARGIN = 8;
/** Com 6 px por dia a data inteira só cabe de duas em duas semanas. */
const TICK_EVERY_WEEKS = 2;
/** Meia largura do rótulo de data em 11 px, para o tique da borda não sair do viewBox. */
const DATE_HALF_WIDTH = 32;
/** Meia largura da anotação da janela, para ela não sair do viewBox quando a janela é estreita. */
const WINDOW_LABEL_HALF_WIDTH = 76;
/** Distância entre o fim da predecessora e a perna vertical do cotovelo: metade do vão do fim de semana. */
const LEG_OFFSET = 6;
const ARROW = 5;
const LINK_WIDTH = 1.5;
/** Halo na cor do cartão por baixo do conector, para ele se ver onde cruza uma barra neutra (TOK-10). */
const HALO_WIDTH = 5;
const FOCUS_FILL = 'var(--chart-1)';
/**
 * Rebaixar é trocar de token, não de opacidade: --text-muted mede 5,21:1 e 5,37:1 contra o cartão,
 * e uma barra a 30% de opacidade ficaria abaixo do piso de 3:1 (ACE-5).
 */
const REST_FILL = 'var(--text-muted)';
const NUM = 'kpi-number font-medium text-text-primary';
const READING = 'mb-2 h-5 shrink-0 text-xs leading-5 text-text-secondary';

type Role = 'focus' | 'linked' | 'rest' | 'plain';

interface Timing {
  readonly earlyStart: number;
  readonly earlyFinish: number;
  readonly lateFinish: number;
  /** Dias úteis que a tarefa pode atrasar sem empurrar o fim do plano. */
  readonly slack: number;
}

interface Row {
  readonly task: PipelineTask;
  readonly timing: Timing;
  readonly role: Role;
  readonly x0: number;
  readonly x1: number;
  readonly y: number;
}

interface GroupHeader {
  readonly key: string;
  readonly label: string;
  readonly y: number;
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

/** Segunda-feira da semana de uma data, por Date.UTC: o tique cai sempre no mesmo dia da semana. */
function mondayOf(ms: number): number {
  const date = new Date(ms);
  const sinceMonday = (date.getUTCDay() + 6) % 7;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - sinceMonday);
}

/** Segundas do eixo, de duas em duas semanas, da primeira até a última antes do fim. */
function mondayTicks(startMs: number, endMs: number): number[] {
  const ticks: number[] = [];
  for (let tick = mondayOf(startMs); tick < endMs; tick += TICK_EVERY_WEEKS * WEEK_MS) ticks.push(tick);
  return ticks;
}

/** Escala de tempo: milissegundos para x, linear entre o início e o fim do eixo. */
function timeScale(startMs: number, endMs: number): (ms: number) => number {
  const span = Math.max(endMs - startMs, DAY_MS);
  return (ms) => PLOT_LEFT + ((ms - startMs) / span) * (PLOT_RIGHT - PLOT_LEFT);
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

/** Rótulo no meio de uma oração: a inicial maiúscula vira minúscula. */
function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Contagem de dias úteis com a concordância certa: 1 dia útil, 12 dias úteis. */
function workDays(days: number): string {
  return `${formatDays(days)} ${Math.abs(days) === 1 ? 'útil' : 'úteis'}`;
}

/** Lista em prosa: "a", "a e b", "a, b e c". */
function joinList(parts: readonly string[]): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1] ?? ''}`;
}

/** Predecessoras válidas de cada tarefa: sem repetição, sem a própria tarefa e sem id fora do plano. */
function predecessorMap(tasks: readonly PipelineTask[]): Map<string, readonly string[]> {
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
  tasks: readonly PipelineTask[],
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
 * seta, contorna pela esquerda passando entre as duas linhas, sem cruzar a barra de nenhuma das duas.
 */
function elbowPath(from: Row, to: Row): string {
  const start = `M${px(from.x1)},${px(from.y)}`;
  const legX = from.x1 + LEG_OFFSET;
  const tipBase = to.x0 - ARROW;
  if (tipBase >= legX) return `${start} H${px(legX)} V${px(to.y)} H${px(tipBase)}`;
  const betweenRows = from.y + (to.y >= from.y ? ROW_HEIGHT / 2 : -ROW_HEIGHT / 2);
  return `${start} H${px(legX)} V${px(betweenRows)} H${px(tipBase - LEG_OFFSET)} V${px(to.y)} H${px(tipBase)}`;
}

export default function GoalPipelineGantt({
  data = defaultData,
  focusId = defaultFocusId,
  readingStart = defaultReadingStart,
  readingEnd = defaultReadingEnd,
  height,
  className,
}: GoalPipelineGanttProps) {
  // Id do marcador por useId: dois Gantts na mesma página não disputam a mesma ponta de seta.
  const arrowId = `gantt-arrow-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const style = height === undefined ? undefined : { height };
  const statusClass = cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className);

  if (data.length === 0) {
    return (
      <div className={statusClass} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma tarefa neste recorte: não há esteira para desenhar nem data final para prever.</span>
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
          Data final {formatUnavailable()}: a esteira tem dependência em ciclo, e sem ordem entre as tarefas não há
          data cedo nem tarde para calcular.
        </span>
      </div>
    );
  }

  const windowFromMs = toMs(readingStart);
  const windowToMs = toMs(readingEnd) + DAY_MS;
  const startMs = mondayOf(Math.min(fromWorkIndex(planStart), windowFromMs));
  const endMs = Math.max(fromWorkIndex(planFinish) + DAY_MS, windowToMs);
  const x = timeScale(startMs, endMs);
  const ticks = mondayTicks(startMs, endMs);

  const focusKnown = timings.has(focusId);
  const focusBefore = focusKnown ? (predecessors.get(focusId) ?? []) : [];
  const focusAfter = focusKnown ? data.filter((task) => (predecessors.get(task.id) ?? []).includes(focusId)).map((task) => task.id) : [];
  const roleOf = (id: string): Role => {
    if (!focusKnown) return 'plain';
    if (id === focusId) return 'focus';
    return focusBefore.includes(id) || focusAfter.includes(id) ? 'linked' : 'rest';
  };

  // Escala de banda com altura de linha fixa: cada frente abre com o rótulo dela e um respiro antes.
  const headers: GroupHeader[] = [];
  const rows: Row[] = [];
  let cursor = TOP;
  for (const front of frontOrder) {
    const tasks = data.filter((task) => task.front === front);
    if (tasks.length === 0) continue;
    if (headers.length > 0) cursor += GROUP_GAP;
    headers.push({ key: front, label: frontLabels[front], y: cursor + GROUP_HEADER_HEIGHT / 2 });
    cursor += GROUP_HEADER_HEIGHT;
    for (const task of tasks) {
      const timing = timings.get(task.id);
      if (timing === undefined) continue;
      rows.push({
        task,
        timing,
        role: roleOf(task.id),
        x0: x(fromWorkIndex(timing.earlyStart)),
        x1: x(fromWorkIndex(timing.earlyFinish) + DAY_MS),
        y: cursor + ROW_HEIGHT / 2,
      });
      cursor += ROW_HEIGHT;
    }
  }
  const plotBottom = cursor;
  const viewHeight = plotBottom + AXIS_HEIGHT;

  // Conectores só da tarefa em foco: quem ela espera e quem espera por ela.
  const byId = new Map(rows.map((row) => [row.task.id, row]));
  const focus = byId.get(focusId);
  const links =
    focus === undefined
      ? []
      : [
          ...focusBefore.flatMap((id) => {
            const from = byId.get(id);
            return from === undefined ? [] : [{ key: `${id}-${focusId}`, d: elbowPath(from, focus) }];
          }),
          ...focusAfter.flatMap((id) => {
            const to = byId.get(id);
            return to === undefined ? [] : [{ key: `${focusId}-${id}`, d: elbowPath(focus, to) }];
          }),
        ];

  const criticalRows = rows.filter((row) => row.timing.slack === 0);
  const criticalByFront = frontOrder
    .map((front) => ({ front, label: lowerFirst(frontLabels[front]), count: criticalRows.filter((row) => row.task.front === front).length }))
    .filter((entry) => entry.count > 0);
  const frontCount = headers.length;
  const finishIso = toIso(fromWorkIndex(planFinish));
  // Dias úteis livres entre o fim da esteira e a abertura da janela; negativo quando a esteira invade a janela.
  const spare = toWorkIndex(windowFromMs) - planFinish - 1;
  const spareText = spare >= 0 ? `com ${workDays(spare)} de sobra até a janela de leitura` : `${workDays(-spare)} depois de a janela de leitura abrir`;
  const beforeWord = focusBefore.length === 1 ? 'predecessora' : 'predecessoras';
  const afterWord = focusAfter.length === 1 ? 'sucessora' : 'sucessoras';
  const windowLeft = x(windowFromMs);
  const windowRight = x(windowToMs);
  const windowLabelX = Math.min(Math.max((windowLeft + windowRight) / 2, WINDOW_LABEL_HALF_WIDTH), VIEW_WIDTH - WINDOW_LABEL_HALF_WIDTH);

  const summary = [
    `Gantt de ${formatInt(rows.length)} tarefas em ${formatInt(frontCount)} frentes.`,
    `São críticas ${formatInt(criticalRows.length)} (${joinList(criticalByFront.map((entry) => `${formatInt(entry.count)} em ${entry.label}`))}) e a data final prevista é ${formatDate(finishIso)}, ${spareText}.`,
    focus === undefined
      ? 'Sem tarefa em foco, os conectores ficam ocultos.'
      : `Em foco, ${lowerFirst(focus.task.name)}: ${formatInt(focusBefore.length)} ${beforeWord} e ${formatInt(focusAfter.length)} ${afterWord}.`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className={READING}>
        Tarefas críticas: <span className={NUM}>{formatInt(criticalRows.length)}</span> de{' '}
        <span className={NUM}>{formatInt(rows.length)}</span> (
        {criticalByFront.map((entry, index) => (
          <Fragment key={entry.front}>
            {index === 0 ? '' : index === criticalByFront.length - 1 ? ' e ' : ', '}
            <span className={NUM}>{formatInt(entry.count)}</span> em {entry.label}
          </Fragment>
        ))}
        ). A esteira fecha em <span className={NUM}>{formatDate(finishIso)}</span>,{' '}
        {spare >= 0 ? (
          <>
            com <span className={NUM}>{workDays(spare)}</span> de sobra até a janela de leitura.
          </>
        ) : (
          <>
            <span className={NUM}>{workDays(-spare)}</span> depois de a janela de leitura abrir.
          </>
        )}
      </p>
      {/* Legenda: a amostra acesa vale para a tarefa em foco e para as ligadas a ela; a neutra, para o resto. */}
      <ul aria-hidden className="mb-2 flex h-4 shrink-0 items-center gap-5 text-xs leading-4 text-text-secondary">
        {focus === undefined ? (
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 shrink-0 rounded-[2px]" style={{ backgroundColor: FOCUS_FILL }} />
            <span>sem tarefa em foco, os conectores ficam ocultos</span>
          </li>
        ) : (
          <>
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-4 shrink-0 rounded-[2px]" style={{ backgroundColor: FOCUS_FILL }} />
              <span>
                <span className="font-semibold text-text-primary">{focus.task.name}</span>, em foco, com{' '}
                <span className={NUM}>{formatInt(focusBefore.length)}</span> {beforeWord} e{' '}
                <span className={NUM}>{formatInt(focusAfter.length)}</span> {afterWord}
              </span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-4 shrink-0 rounded-[2px]" style={{ backgroundColor: REST_FILL }} />
              <span>demais tarefas</span>
            </li>
          </>
        )}
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
            <marker id={arrowId} markerHeight={ARROW} markerUnits="userSpaceOnUse" markerWidth={ARROW} refX={0} refY={ARROW / 2}>
              <path d={`M0,0 L${String(ARROW)},${String(ARROW / 2)} L0,${String(ARROW)} Z`} fill={FOCUS_FILL} />
            </marker>
          </defs>
          {/* Faixa de período opaca em --surface-sunken, e não em baixa opacidade nem em --surface-overlay, que no claro é o branco do cartão (ANO-4). */}
          <rect
            fill="var(--surface-sunken)"
            height={plotBottom - TOP}
            width={Math.max(Math.min(windowRight, PLOT_RIGHT) - windowLeft, 0)}
            x={windowLeft}
            y={TOP}
          />
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
              fill={row.role === 'rest' ? REST_FILL : FOCUS_FILL}
              height={BAR_HEIGHT}
              key={`bar-${row.task.id}`}
              rx={BAR_RADIUS}
              width={Math.max(row.x1 - row.x0, 1)}
              x={row.x0}
              y={row.y - BAR_HEIGHT / 2}
            />
          ))}
          {links.map((link) => (
            <path d={link.d} fill="none" key={`halo-${link.key}`} stroke="var(--surface-raised)" strokeWidth={HALO_WIDTH} vectorEffect="non-scaling-stroke" />
          ))}
          {links.map((link) => (
            <path
              d={link.d}
              fill="none"
              key={`link-${link.key}`}
              markerEnd={`url(#${arrowId})`}
              stroke={FOCUS_FILL}
              strokeLinejoin="round"
              strokeWidth={LINK_WIDTH}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {/* Anotação da faixa na margem do topo, fora das marcas, com o nome e o período (ANO-2). */}
          <text className="font-sans" fill="var(--text-muted)" fontSize={11} fontWeight={500} textAnchor="middle" x={windowLabelX} y={TOP_FIRST_BASELINE}>
            janela de leitura
          </text>
          <text className="font-display" fill="var(--text-muted)" fontSize={11} fontWeight={500} textAnchor="middle" x={windowLabelX} y={TOP_SECOND_BASELINE}>
            {`${formatDate(readingStart)} a ${formatDate(readingEnd)}`}
          </text>
          <text className="font-sans" fill="var(--text-muted)" fontSize={11} fontWeight={500} textAnchor="end" x={SLACK_COLUMN_RIGHT} y={TOP_SECOND_BASELINE}>
            folga, em dias úteis
          </text>
          {headers.map((header) => (
            <text
              className="font-sans"
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={11}
              fontWeight={600}
              key={`front-${header.key}`}
              x={0}
              y={header.y}
            >
              {header.label}
            </text>
          ))}
          {rows.map((row) => {
            const critical = row.timing.slack === 0;
            // Peso 700 só no nome em foco (TIP-3); o resto rebaixa por token, nunca por opacidade (ACE-4).
            const nameFill = row.role === 'rest' ? 'var(--text-muted)' : row.role === 'plain' ? 'var(--text-secondary)' : 'var(--text-primary)';
            return (
              <g key={`label-${row.task.id}`}>
                <text
                  className="font-sans"
                  dominantBaseline="central"
                  fill={nameFill}
                  fontSize={12}
                  fontWeight={row.role === 'focus' ? 700 : 500}
                  x={NAME_INDENT}
                  y={row.y}
                >
                  {row.task.name}
                </text>
                <text
                  className="font-display"
                  dominantBaseline="central"
                  fill={critical ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize={11}
                  fontWeight={critical ? 600 : 500}
                  textAnchor="end"
                  x={SLACK_COLUMN_RIGHT}
                  y={row.y}
                >
                  {formatDays(row.timing.slack)}
                </text>
              </g>
            );
          })}
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
