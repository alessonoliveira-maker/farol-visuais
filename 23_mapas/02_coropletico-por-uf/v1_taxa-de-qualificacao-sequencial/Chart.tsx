import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, HEX_GRID, IBGE_TO_UF, type UfCode, type UfLeads } from './data';

/**
 * Coroplético por UF sobre malha de hexágonos: cada UF é pintada pela classe da sua taxa de
 * qualificação, em 5 classes por quantis, com a sigla e a taxa escritas dentro. Ao lado, a legenda em
 * degraus com o intervalo e a contagem de UFs de cada classe, e a lista das 5 maiores taxas com o
 * volume. A linha do dado chega com o código do IBGE e é casada com a malha pela tabela do data.ts.
 * Apoia a decisão de onde a qualificação é forte ou fraca no território.
 */
export interface QualificationChoroplethProps {
  readonly data?: readonly UfLeads[];
  readonly height?: number;
  readonly className?: string;
}

const CLASS_COUNT = 5;
const TOP_COUNT = 5;
/** Largura da célula hexagonal, de ponta para cima: com 40 px cabem a sigla e a taxa de uma casa em 11 px. */
const HEX_W = 40;
const HEX_GAP = 2;
const HEX_R = HEX_W / Math.sqrt(3);
const HEX_DRAWN_R = HEX_R - HEX_GAP / Math.sqrt(3);
const ROW_PITCH = HEX_R * 1.5;
const PAD = 2;
const LABEL_SIZE = 11;
/** Linhas de base da sigla e do valor em torno do centro: 13,5 px entre elas deixam 4 px de tinta a tinta. */
const SIGLA_DY = -3.5;
const VALUE_DY = 10;
const SWATCH_W = 14;
const SWATCH_H = 16;

/**
 * Cinco classes na rampa sequencial, pulando --seq-4 e --seq-5: nenhum texto alcança 4,5:1 sobre
 * eles nos dois temas (TOK-2). Como a taxa está escrita em todo hexágono, a cor é apoio de varredura.
 */
const CLASS_COLORS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
/** As 3 classes baixas leem com o texto do cartão; as 2 altas, com o texto sobre acento (ROT-6). */
const CLASS_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;
/** As 2 classes mais baixas medem menos de 1,6:1 contra o cartão (TOK-8): o contorno segura a silhueta do mapa. */
const OUTLINED_CLASSES = 2;

interface HexCell {
  readonly uf: UfCode;
  readonly cx: number;
  readonly cy: number;
}

interface UfRow {
  readonly uf: UfCode;
  readonly name: string;
  readonly leads: number;
  readonly qualified: number;
  readonly rate: number | null;
}

function hexPoints(cx: number, cy: number, radius: number): string {
  const points: string[] = [];
  for (let corner = 0; corner < 6; corner += 1) {
    const angle = (Math.PI / 180) * (60 * corner - 30);
    const x = Math.round((cx + radius * Math.cos(angle)) * 100) / 100;
    const y = Math.round((cy + radius * Math.sin(angle)) * 100) / 100;
    points.push(`${String(x)},${String(y)}`);
  }
  return points.join(' ');
}

/** Geometria pura, calculada uma vez: centro de cada UF, com as linhas ímpares deslocadas meia célula. */
function buildLayout(): { readonly cells: readonly HexCell[]; readonly width: number; readonly height: number } {
  const raw = (Object.keys(HEX_GRID) as UfCode[]).map((uf) => {
    const position = HEX_GRID[uf];
    const half = position.row % 2 === 1 ? HEX_W / 2 : 0;
    return { uf, cx: position.column * HEX_W + half, cy: position.row * ROW_PITCH };
  });
  // Limites do desenho: a malha é constante e nunca vazia, e o laço dispensa o spread sobre lista.
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const cell of raw) {
    minX = Math.min(minX, cell.cx - HEX_W / 2 - PAD);
    maxX = Math.max(maxX, cell.cx + HEX_W / 2 + PAD);
    minY = Math.min(minY, cell.cy - HEX_R - PAD);
    maxY = Math.max(maxY, cell.cy + HEX_R + PAD);
  }
  const cells = raw.map((cell) => ({
    uf: cell.uf,
    cx: Math.round((cell.cx - minX) * 100) / 100,
    cy: Math.round((cell.cy - minY) * 100) / 100,
  }));
  return { cells, width: Math.ceil(maxX - minX), height: Math.ceil(maxY - minY) };
}

const LAYOUT = buildLayout();

/**
 * Taxa de qualificação na precisão em que é escrita (uma casa do percentual): a classe, a ordem e o
 * empate saem do mesmo número que a tela mostra. UF sem lead recebido é ausência, nunca taxa zero.
 */
function shownRate(entry: UfLeads): number | null {
  if (entry.leads <= 0) return null;
  return Math.round((entry.qualified / entry.leads) * 1000) / 1000;
}

/**
 * Limite superior de cada classe pelos quantis das taxas medidas: a mesma quantidade de UFs por
 * classe, salvo empate. O limite pertence à classe de baixo, então taxas iguais nunca se separam.
 */
function buildUpperBounds(rates: readonly number[]): readonly number[] | null {
  if (rates.length === 0) return null;
  const sorted = [...rates].sort((a, b) => a - b);
  const bounds: number[] = [];
  for (let index = 0; index < CLASS_COUNT; index += 1) {
    const bound = sorted[Math.max(0, Math.ceil(((index + 1) * sorted.length) / CLASS_COUNT) - 1)];
    if (bound !== undefined) bounds.push(bound);
  }
  return bounds;
}

function classOf(rate: number, upper: readonly number[]): number {
  for (let index = 0; index < CLASS_COUNT; index += 1) {
    const bound = upper[index];
    if (bound !== undefined && rate <= bound) return index;
  }
  return CLASS_COUNT - 1;
}

function ufCount(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'UF' : 'UFs'}`;
}

function rateWithVolume(row: UfRow, rate: number): string {
  return `${formatPercent(rate, 1)} (${formatInt(row.qualified)} de ${formatInt(row.leads)})`;
}

export default function QualificationChoropleth({ data = defaultData, height, className }: QualificationChoroplethProps) {
  // Casamento pelo código do IBGE: linha com código fora da tabela fica fora do mapa e é contada.
  const rows: UfRow[] = data.flatMap((entry) => {
    const info = IBGE_TO_UF[entry.ibge];
    if (info === undefined) return [];
    return [{ uf: info.uf, name: info.name, leads: entry.leads, qualified: entry.qualified, rate: shownRate(entry) }];
  });
  const rated = rows.flatMap((row) => (row.rate === null ? [] : [{ row, rate: row.rate }]));
  const upper = buildUpperBounds(rated.map((item) => item.rate));

  if (upper === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF com lead recebido neste recorte: o mapa não tem o que colorir.</span>
      </div>
    );
  }

  const byUf = new Map(rows.map((row) => [row.uf, row]));
  // Maior taxa primeiro; na mesma taxa escrita, o maior volume de leads vem antes.
  const ranked = [...rated].sort((a, b) => b.rate - a.rate || b.row.leads - a.row.leads);
  const top = ranked.slice(0, TOP_COUNT);
  const leader = ranked[0];
  const last = ranked[ranked.length - 1];
  const unmatched = data.length - rows.length;
  const withoutRate = LAYOUT.cells.filter((cell) => (byUf.get(cell.uf)?.rate ?? null) === null).length;

  const classes = CLASS_COLORS.map((color, index) => {
    let low: number | null = null;
    let high: number | null = null;
    let count = 0;
    for (const item of rated) {
      if (classOf(item.rate, upper) !== index) continue;
      count += 1;
      if (low === null || item.rate < low) low = item.rate;
      if (high === null || item.rate > high) high = item.rate;
    }
    return { index, color, count, low, high };
  });

  const summary =
    leader && last
      ? `Mapa coroplético em hexágonos com a taxa de qualificação de leads de ${ufCount(rated.length)}, em ${formatInt(CLASS_COUNT)} classes por quantis. ` +
        `Lidera ${leader.row.name}, com ${rateWithVolume(leader.row, leader.rate)}; ` +
        `a menor taxa é de ${last.row.name}, com ${rateWithVolume(last.row, last.rate)}.`
      : 'Mapa coroplético de qualificação sem UF medida para comparar.';

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 items-start gap-4', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      {/* Escala 1: largura e altura iguais ao viewBox, para o texto de 11 px chegar com 11 px (GEO-18). */}
      <svg aria-hidden className="shrink-0" height={LAYOUT.height} viewBox={`0 0 ${String(LAYOUT.width)} ${String(LAYOUT.height)}`} width={LAYOUT.width}>
        {LAYOUT.cells.map((cell) => {
          const row = byUf.get(cell.uf);
          const rate = row?.rate ?? null;
          if (row === undefined || rate === null) {
            return (
              <g key={cell.uf}>
                <title>{`${row?.name ?? cell.uf}: taxa ${formatUnavailable()}, sem lead recebido`}</title>
                <polygon
                  fill="none"
                  points={hexPoints(cell.cx, cell.cy, HEX_DRAWN_R - 0.75)}
                  stroke="var(--text-muted)"
                  strokeDasharray="3 2"
                  strokeWidth={1.5}
                />
                <text dominantBaseline="central" fill="var(--text-muted)" fontSize={LABEL_SIZE} fontWeight={600} textAnchor="middle" x={cell.cx} y={cell.cy}>
                  {cell.uf}
                </text>
              </g>
            );
          }
          const bucket = classOf(rate, upper);
          const fill = CLASS_COLORS[bucket];
          const ink = CLASS_TEXT[bucket];
          return (
            <g key={cell.uf}>
              <title>{`${row.name}: ${formatPercent(rate, 1)}, ${formatInt(row.qualified)} qualificados de ${formatInt(row.leads)} leads`}</title>
              <polygon
                fill={fill}
                points={hexPoints(cell.cx, cell.cy, HEX_DRAWN_R - 0.5)}
                stroke={bucket < OUTLINED_CLASSES ? 'var(--line-strong)' : fill}
                strokeWidth={1}
              />
              <text fill={ink} fontSize={LABEL_SIZE} fontWeight={600} textAnchor="middle" x={cell.cx} y={cell.cy + SIGLA_DY}>
                {cell.uf}
              </text>
              <text className="font-display tabular-nums" fill={ink} fontSize={LABEL_SIZE} textAnchor="middle" x={cell.cx} y={cell.cy + VALUE_DY}>
                {formatPercent(rate, 1)}
              </text>
            </g>
          );
        })}
      </svg>

      <div aria-hidden className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Legenda em degraus, da classe mais alta para a mais baixa, com o intervalo observado e a contagem. */}
        <div className="flex flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-secondary">
          <span className="tabular-nums text-text-muted">{`Taxa de qualificação, em ${formatInt(CLASS_COUNT)} classes por quantis`}</span>
          {[...classes].reverse().map((entry) => (
            <span className="flex items-center gap-2" key={`class-${String(entry.index)}`}>
              <svg className="shrink-0" height={SWATCH_H} viewBox={`0 0 ${String(SWATCH_W)} ${String(SWATCH_H)}`} width={SWATCH_W}>
                <polygon
                  fill={entry.color}
                  points={hexPoints(SWATCH_W / 2, SWATCH_H / 2, SWATCH_W / 2 - 0.5)}
                  stroke={entry.index < OUTLINED_CLASSES ? 'var(--line-strong)' : entry.color}
                  strokeWidth={1}
                />
              </svg>
              <span className="min-w-0 flex-1 tabular-nums">
                {entry.low === null || entry.high === null
                  ? 'nenhuma UF nesta classe'
                  : entry.low === entry.high
                    ? formatPercent(entry.low, 1)
                    : `${formatPercent(entry.low, 1)} a ${formatPercent(entry.high, 1)}`}
              </span>
              <span className="shrink-0 tabular-nums text-text-muted">{ufCount(entry.count)}</span>
            </span>
          ))}
          {withoutRate > 0 ? (
            <span className="flex items-center gap-2">
              <svg className="shrink-0" height={SWATCH_H} viewBox={`0 0 ${String(SWATCH_W)} ${String(SWATCH_H)}`} width={SWATCH_W}>
                <polygon
                  fill="none"
                  points={hexPoints(SWATCH_W / 2, SWATCH_H / 2, SWATCH_W / 2 - 0.75)}
                  stroke="var(--text-muted)"
                  strokeDasharray="3 2"
                  strokeWidth={1.5}
                />
              </svg>
              <span className="min-w-0 flex-1">{`taxa ${formatUnavailable()}: sem lead recebido`}</span>
              <span className="shrink-0 tabular-nums text-text-muted">{ufCount(withoutRate)}</span>
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[0.6875rem] leading-4 tabular-nums text-text-muted">
            {`${formatInt(top.length)} maiores taxas, com qualificados sobre leads recebidos`}
          </span>
          <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] items-baseline gap-x-2 gap-y-0.5 text-xs leading-4">
            {top.map((item, index) => {
              // Mesma taxa escrita, mesma posição: o empate divide o ordinal em vez de inventar ordem.
              const rank = top.findIndex((other) => other.rate === item.rate) + 1;
              const isLeader = index === 0;
              return [
                <span className="text-[0.6875rem] tabular-nums text-text-muted" key={`${item.row.uf}-rank`}>{`${formatInt(rank)}º`}</span>,
                <span className={cn('text-[0.6875rem] font-semibold', isLeader ? 'text-text-primary' : 'text-text-secondary')} key={`${item.row.uf}-uf`}>
                  {item.row.uf}
                </span>,
                <span className={cn('min-w-0', isLeader ? 'font-semibold text-text-primary' : 'text-text-secondary')} key={`${item.row.uf}-name`}>
                  {item.row.name}
                </span>,
                <span className={cn('text-right font-display tabular-nums text-text-primary', isLeader && 'font-semibold')} key={`${item.row.uf}-rate`}>
                  {formatPercent(item.rate, 1)}
                </span>,
                <span className="text-right text-[0.6875rem] tabular-nums text-text-muted" key={`${item.row.uf}-volume`}>
                  {`${formatInt(item.row.qualified)} de ${formatInt(item.row.leads)}`}
                </span>,
              ];
            })}
          </div>
          {unmatched > 0 ? (
            <span className="text-[0.6875rem] leading-4 tabular-nums text-text-muted">
              {`${formatInt(unmatched)} ${unmatched === 1 ? 'linha' : 'linhas'} com código do IBGE fora da tabela, fora do mapa.`}
            </span>
          ) : null}
        </div>
      </div>
    </figure>
  );
}
