import { Filter, Unplug } from 'lucide-react';
import { useId } from 'react';

import { formatDate, formatDays, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PlanTask } from './data';

/**
 * Gantt com dependências que não fecham: a sucessora que começa antes de a predecessora terminar
 * ganha conector tracejado contornando pela esquerda, e as tarefas presas em ciclo são marcadas e
 * listadas fora do gráfico, sem a volta desenhada. Enquanto houver ciclo o caminho crítico sai pelo
 * rótulo de ausência do Farol. Responde o que corrigir no plano antes de confiar na data final.
 */
export interface DependencyAuditGanttProps {
  /** Tarefas com início e fim inclusive e a lista de predecessoras. A ordem de entrada é a ordem das linhas. */
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
 * Largura do viewBox: a que o corpo de um canvas de 960 px entrega ao SVG (960 menos 66 px de moldura).
 * A altura sai da conta de linhas, então no preview a escala é 1 e os 11 px chegam com 11 px (GEO-18).
 */
const VIEW_WIDTH = 894;
/** Coluna do término, alinhada à direita (TIP-6); o nome da tarefa ocupa o que vem antes dela. */
const END_COLUMN_RIGHT = 276;
const PLOT_LEFT = 296;
const PLOT_RIGHT = VIEW_WIDTH - 12;
/** Faixa do topo: cabeçalho da coluna. */
const TOP = 18;
const TOP_BASELINE = 11;
const ROW_HEIGHT = 30;
const BAR_HEIGHT = 14;
const BAR_RADIUS = 3;
const AXIS_HEIGHT = 24;
const TICK_MARGIN = 8;
/** Meia largura do rótulo de data em 11 px, para o tique da borda não sair do viewBox. */
const DATE_HALF_WIDTH = 32;
/** Distância entre o fim da predecessora e a perna vertical do cotovelo. */
const LEG_OFFSET = 10;
const ARROW = 6;
const LINK_WIDTH = 1.5;
/** O conector com problema é mais grosso para o tracejado não sumir no tamanho do cartão. */
const PROBLEM_LINK_WIDTH = 2;
const PROBLEM_DASH = '5 3';
/** Halo na cor do cartão por baixo do conector, para ele se ver onde cruza outra marca (TOK-10). */
const HALO_EXTRA = 3.5;
const TASK_FILL = 'var(--chart-1)';
/** Conector carrega a relação: sai de --line-strong (1,79:1) para --text-muted, 5,21:1 e 5,37:1 (ACE-6). */
const LINK_STROKE = 'var(--text-muted)';
/** Erro de dado, na barra em ciclo e no conector inconsistente: 5,50:1 no escuro e 6,36:1 no claro. */
const PROBLEM_FILL = 'var(--negative)';
const NUM = 'kpi-number font-medium text-text-primary';

type LinkKind = 'ok' | 'inconsistent' | 'cycle';

interface Row {
  readonly task: PlanTask;
  /** Índices de dia útil do primeiro e do último dia de trabalho. */
  readonly startIndex: number;
  readonly endIndex: number;
  readonly inCycle: boolean;
  readonly x0: number;
  readonly x1: number;
  readonly y: number;
}

interface Link {
  readonly key: string;
  readonly kind: LinkKind;
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

/** Contagem de dias úteis com a concordância certa: 1 dia útil, 5 dias úteis. */
function workDays(days: number): string {
  return `${formatDays(days)} ${Math.abs(days) === 1 ? 'útil' : 'úteis'}`;
}

/** Lista em prosa: "a", "a e b", "a, b e c". */
function joinList(parts: readonly string[]): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1] ?? ''}`;
}

/** Predecessoras válidas de cada tarefa: sem repetição e sem id fora do plano. A própria tarefa fica, porque é ciclo. */
function predecessorMap(tasks: readonly PlanTask[]): Map<string, readonly string[]> {
  const known = new Set(tasks.map((task) => task.id));
  return new Map(tasks.map((task) => [task.id, [...new Set(task.dependsOn)].filter((id) => known.has(id))] as const));
}

/**
 * Tarefas presas em ciclo: o que sobra depois de podar, até não sobrar o que podar, quem não espera
 * ninguém do resto e quem não é esperado por ninguém do resto. Tarefa que só vem depois de um ciclo sai.
 */
function cyclicCore(ids: readonly string[], predecessors: ReadonlyMap<string, readonly string[]>): Set<string> {
  const core = new Set(ids);
  let pruned = true;
  while (pruned) {
    pruned = false;
    for (const id of [...core]) {
      const waitsInside = (predecessors.get(id) ?? []).some((before) => core.has(before));
      const awaitedInside = [...core].some((after) => (predecessors.get(after) ?? []).includes(id));
      if (waitsInside && awaitedInside) continue;
      core.delete(id);
      pruned = true;
    }
  }
  return core;
}

/**
 * Caminho crítico em dias úteis: quantas tarefas não têm folga e em que dia útil o plano termina.
 * A ordem topológica vem do algoritmo de Kahn; sem ela não há passada para a frente nem para trás,
 * e a função devolve `null` em vez de um número inventado (EST-1b).
 */
function criticalPath(
  rows: readonly Row[],
  predecessors: ReadonlyMap<string, readonly string[]>,
): { readonly count: number; readonly finish: number } | null {
  const waiting = new Map(rows.map((row) => [row.task.id, (predecessors.get(row.task.id) ?? []).length]));
  const order = rows.filter((row) => waiting.get(row.task.id) === 0);
  for (let cursor = 0; cursor < order.length; cursor += 1) {
    const released = order[cursor];
    if (released === undefined) break;
    for (const row of rows) {
      if (!(predecessors.get(row.task.id) ?? []).includes(released.task.id)) continue;
      const left = (waiting.get(row.task.id) ?? 0) - 1;
      waiting.set(row.task.id, left);
      if (left === 0) order.push(row);
    }
  }
  if (order.length === 0 || order.length !== rows.length) return null;

  const early = new Map<string, { readonly start: number; readonly finish: number }>();
  let finish = Number.NEGATIVE_INFINITY;
  for (const row of order) {
    let start = row.startIndex;
    for (const before of predecessors.get(row.task.id) ?? []) {
      const done = early.get(before);
      if (done !== undefined) start = Math.max(start, done.finish + 1);
    }
    const own = { start, finish: start + Math.max(row.endIndex - row.startIndex, 0) };
    early.set(row.task.id, own);
    finish = Math.max(finish, own.finish);
  }
  const lateStart = new Map<string, number>();
  let count = 0;
  for (const row of [...order].reverse()) {
    const own = early.get(row.task.id);
    if (own === undefined) continue;
    let lateFinish = finish;
    for (const after of order) {
      const afterStart = lateStart.get(after.task.id);
      if (afterStart !== undefined && (predecessors.get(after.task.id) ?? []).includes(row.task.id)) lateFinish = Math.min(lateFinish, afterStart - 1);
    }
    lateStart.set(row.task.id, lateFinish - (own.finish - own.start));
    if (lateFinish === own.finish) count += 1;
  }
  return { count, finish };
}

/**
 * Conector em cotovelo, do fim da predecessora ao início da sucessora. O caminho para na base da
 * seta, que o marcador desenha dali até a barra. Com vão, é M H V H. Sem vão, que é o caso da
 * sucessora sobreposta, sai pela direita, desce até o meio do espaço entre as duas linhas, volta
 * por ali até antes do início da sucessora e entra nela pela esquerda: não cruza barra nenhuma.
 */
function elbowPath(from: Row, to: Row): string {
  const start = `M${px(from.x1)},${px(from.y)}`;
  const legX = from.x1 + LEG_OFFSET;
  const tipBase = to.x0 - ARROW;
  if (tipBase >= legX) return `${start} H${px(legX)} V${px(to.y)} H${px(tipBase)}`;
  const betweenRows = from.y + (to.y >= from.y ? ROW_HEIGHT / 2 : -ROW_HEIGHT / 2);
  return `${start} H${px(legX)} V${px(betweenRows)} H${px(tipBase - LEG_OFFSET)} V${px(to.y)} H${px(tipBase)}`;
}

export default function DependencyAuditGantt({ data = defaultData, height, className }: DependencyAuditGanttProps) {
  // Id dos marcadores por useId: dois Gantts na mesma página não disputam a mesma ponta de seta.
  const idBase = `gantt-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const style = height === undefined ? undefined : { height };
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
        <span>Nenhuma tarefa neste recorte: não há plano para desenhar nem dependência para conferir.</span>
      </div>
    );
  }

  const predecessors = predecessorMap(data);
  const core = cyclicCore(data.map((task) => task.id), predecessors);
  const startMs = mondayOf(firstMs);
  const x = timeScale(startMs, lastMs);
  const ticks = mondayTicks(startMs, lastMs);

  const rows: Row[] = data.map((task, index) => {
    const taskStart = toMs(task.start);
    const taskEnd = toMs(task.end);
    return {
      task,
      startIndex: toWorkIndex(taskStart),
      endIndex: toWorkIndex(taskEnd),
      inCycle: core.has(task.id),
      x0: x(taskStart),
      x1: x(taskEnd + DAY_MS),
      y: bandCenter(index),
    };
  });
  const byId = new Map(rows.map((row) => [row.task.id, row]));
  const links: Link[] = rows.flatMap((to) =>
    (predecessors.get(to.task.id) ?? []).flatMap((id) => {
      const from = byId.get(id);
      if (from === undefined || from === to) return [];
      // Sucessora que começa antes de a predecessora terminar: dentro de um ciclo é a volta, e a volta não se desenha.
      const overlaps = to.startIndex <= from.endIndex;
      if (from.inCycle && to.inCycle && overlaps) return [];
      const kind: LinkKind = from.inCycle && to.inCycle ? 'cycle' : overlaps ? 'inconsistent' : 'ok';
      return [{ key: `${from.task.id}-${to.task.id}`, kind, from, to, d: elbowPath(from, to) }];
    }),
  );
  const okLinks = links.filter((link) => link.kind === 'ok');
  const problemLinks = links.filter((link) => link.kind !== 'ok');
  const inconsistent = links.filter((link) => link.kind === 'inconsistent');
  const cycleRows = rows.filter((row) => row.inCycle);
  // `null` enquanto houver ciclo: a ausência é do tipo, e a tela escreve o rótulo de ausência no lugar do número.
  const critical = criticalPath(rows, predecessors);

  const plotBottom = TOP + rows.length * ROW_HEIGHT;
  const viewHeight = plotBottom + AXIS_HEIGHT;
  const lastIso = toIso(lastMs - DAY_MS);
  const cycleNames = joinList(cycleRows.map((row) => lowerFirst(row.task.name)));

  const summary = [
    `Gráfico de Gantt de ${formatInt(rows.length)} tarefas, de ${formatDate(toIso(firstMs))} a ${formatDate(lastIso)}.`,
    critical === null
      ? `Caminho crítico ${formatUnavailable()} enquanto houver ciclo. Tarefas em ciclo: ${formatInt(cycleRows.length)} de ${formatInt(rows.length)}, ${cycleNames}.`
      : `Caminho crítico: ${formatInt(critical.count)} de ${formatInt(rows.length)} tarefas, com fim previsto em ${formatDate(toIso(fromWorkIndex(critical.finish)))}.`,
    `Dependências inconsistentes: ${formatInt(inconsistent.length)}.`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {/* A mensagem vai no topo e o detalhe de cada problema embaixo; o ícone fica em contêiner flex, fora do fluxo do texto (GEO-17). */}
      <p aria-hidden className="mb-2 flex h-5 shrink-0 items-center gap-1.5 text-xs leading-5 text-text-secondary">
        {critical === null ? (
          <>
            <span>Caminho crítico:</span>
            <Unplug aria-hidden className="size-3.5 shrink-0 text-text-muted" />
            <span>
              <span className="text-text-muted">{formatUnavailable()}</span> enquanto houver ciclo. Tarefas em ciclo:{' '}
              <span className={NUM}>{formatInt(cycleRows.length)}</span> de <span className={NUM}>{formatInt(rows.length)}</span>.
              Dependências inconsistentes: <span className={NUM}>{formatInt(inconsistent.length)}</span>.
            </span>
          </>
        ) : (
          <span>
            Caminho crítico: <span className={NUM}>{formatInt(critical.count)}</span> de{' '}
            <span className={NUM}>{formatInt(rows.length)}</span> tarefas, com fim previsto em{' '}
            <span className={NUM}>{formatDate(toIso(fromWorkIndex(critical.finish)))}</span>. Dependências inconsistentes:{' '}
            <span className={NUM}>{formatInt(inconsistent.length)}</span>.
          </span>
        )}
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
            <marker id={`${idBase}-ok`} markerHeight={ARROW} markerUnits="userSpaceOnUse" markerWidth={ARROW} refX={0} refY={ARROW / 2}>
              <path d={`M0,0 L${String(ARROW)},${String(ARROW / 2)} L0,${String(ARROW)} Z`} fill={LINK_STROKE} />
            </marker>
            <marker id={`${idBase}-problem`} markerHeight={ARROW} markerUnits="userSpaceOnUse" markerWidth={ARROW} refX={0} refY={ARROW / 2}>
              <path d={`M0,0 L${String(ARROW)},${String(ARROW / 2)} L0,${String(ARROW)} Z`} fill={PROBLEM_FILL} />
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
              fill={row.inCycle ? PROBLEM_FILL : TASK_FILL}
              height={BAR_HEIGHT}
              key={`bar-${row.task.id}`}
              rx={BAR_RADIUS}
              width={Math.max(row.x1 - row.x0, 1)}
              x={row.x0}
              y={row.y - BAR_HEIGHT / 2}
            />
          ))}
          {/* Os conectores com problema por último: ficam por cima, e o halo deles abre a passagem onde cruzam outro traço. */}
          {[okLinks, problemLinks].map((group, groupIndex) => {
            const problem = groupIndex === 1;
            const width = problem ? PROBLEM_LINK_WIDTH : LINK_WIDTH;
            return (
              <g key={problem ? 'problem-links' : 'ok-links'}>
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
                    markerEnd={`url(#${idBase}-${problem ? 'problem' : 'ok'})`}
                    stroke={problem ? PROBLEM_FILL : LINK_STROKE}
                    strokeDasharray={link.kind === 'inconsistent' ? PROBLEM_DASH : undefined}
                    strokeLinejoin="round"
                    strokeWidth={width}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>
            );
          })}
          <text className="font-sans" fill="var(--text-muted)" fontSize={11} fontWeight={500} textAnchor="end" x={END_COLUMN_RIGHT} y={TOP_BASELINE}>
            término
          </text>
          {rows.map((row) => (
            <g key={`label-${row.task.id}`}>
              {/* A tarefa em ciclo muda a cor da barra e o peso do nome: a cor não fica sozinha (ACE-2). */}
              <text
                className="font-sans"
                dominantBaseline="central"
                fill={row.inCycle ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={12}
                fontWeight={row.inCycle ? 600 : 500}
                x={0}
                y={row.y}
              >
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
      {/* Os problemas listados fora do gráfico, cada um com a amostra da marca que o aponta no desenho e o nome das tarefas. */}
      <ul aria-hidden className="mt-2 shrink-0 text-xs leading-5 text-text-secondary">
        {inconsistent.map((link) => (
          <li className="flex h-5 items-center gap-2" key={`issue-${link.key}`}>
            <span className="w-5 shrink-0" style={{ borderTop: '2px dashed var(--negative)' }} />
            <span>
              <span className="font-semibold text-text-primary">{link.to.task.name}</span> começa em{' '}
              <span className={NUM}>{formatDate(link.to.task.start)}</span>,{' '}
              <span className={NUM}>{workDays(link.from.endIndex - link.to.startIndex + 1)}</span> antes de terminar a
              predecessora, {lowerFirst(link.from.task.name)}.
            </span>
          </li>
        ))}
        {cycleRows.length === 0 ? null : (
          <li className="flex h-5 items-center gap-2">
            <span className="h-2.5 w-5 shrink-0 rounded-[2px]" style={{ backgroundColor: PROBLEM_FILL }} />
            <span>
              Ciclo entre {cycleNames}: cada tarefa espera a outra para começar, e a volta não é desenhada.
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
