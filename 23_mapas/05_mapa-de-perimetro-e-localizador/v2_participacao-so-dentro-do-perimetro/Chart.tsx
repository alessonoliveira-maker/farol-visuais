import { Filter, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, HEX_GRID, type UfCode, type UfMarket } from './data';

/**
 * Mapa de perímetro com a participação de mercado só dentro dele: as UFs do perímetro são pintadas
 * pela classe da sua participação, com a sigla e o percentual escritos, e todas as outras ficam em
 * tom neutro, sem classe de cor e sem dica. Um contorno externo amarra o perímetro como um recorte
 * só. Ao lado, a legenda em degraus nomeia as UFs de cada classe e a nota avisa que o número
 * nacional não sai da soma do mapa. Apoia a decisão de onde, dentro do perímetro, ainda há espaço.
 */
export interface PerimeterShareMapProps {
  readonly data?: readonly UfMarket[];
  readonly height?: number;
  readonly className?: string;
}

const CLASS_COUNT = 3;
/** Largura da célula hexagonal, de ponta para cima: com 38 px cabem a sigla e o percentual de uma casa em 11 px. */
const HEX_W = 38;
const HEX_R = HEX_W / Math.sqrt(3);
const ROW_PITCH = HEX_R * 1.5;
/** Espessura visível do contorno externo do perímetro. */
const CONTOUR_W = 1.5;
/** Traço da segunda passada, na cor do cartão: separa as UFs vizinhas do perímetro (COR-5). */
const SEAM_W = 1;
/** A primeira passada desenha o dobro do contorno, porque a metade de dentro some sob o preenchimento. */
const FIRST_PASS_W = 2 * CONTOUR_W + SEAM_W;
const MESH_STROKE_W = 1;
/** Respiro do viewBox: o contorno externo cai para fora do hexágono e não pode ser cortado. */
const PAD = CONTOUR_W + SEAM_W / 2 + 0.5;
const LABEL_SIZE = 11;
/** Linhas de base da sigla e do valor em torno do centro: 13,5 px entre elas deixam 4 px de tinta a tinta. */
const SIGLA_DY = -3.5;
const VALUE_DY = 10;
const ICON_SIZE = 12;
/** Recuo do tracejado da UF do perímetro sem mercado de referência: fica por dentro, longe do contorno externo. */
const ABSENT_INSET = 3;
const SWATCH_W = 14;
const SWATCH_H = 16;
/** A classe mais baixa mede 2,29:1 e 1,92:1 contra o cartão (TOK-8): na amostra da legenda o traço segura a forma. */
const OUTLINED_CLASSES = 1;

/**
 * Três classes na rampa sequencial: --seq-3, --seq-6 e --seq-7. Ficam fora --seq-4 e --seq-5, sobre os
 * quais nenhum texto alcança 4,5:1 nos dois temas (TOK-2), e --seq-1 e --seq-2, que no tema claro
 * quase se confundem com a malha de fora. Como o percentual está escrito em todo hexágono do
 * perímetro, a cor é apoio de varredura e a ordem mora no número (TOK-8).
 */
const CLASS_COLORS = ['var(--seq-3)', 'var(--seq-6)', 'var(--seq-7)'] as const;
/** A classe baixa lê com o texto do cartão; as 2 altas, com o texto sobre acento (ROT-6). */
const CLASS_TEXT = ['var(--text-primary)', 'var(--accent-cyan-contrast)', 'var(--accent-cyan-contrast)'] as const;

interface HexCell {
  readonly uf: UfCode;
  readonly cx: number;
  readonly cy: number;
  readonly points: string;
}

interface RatedUf {
  readonly entry: UfMarket;
  readonly share: number;
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

/**
 * Geometria pura, calculada uma vez: centro e vértices de cada UF, com as linhas ímpares deslocadas
 * meia célula. Os hexágonos se tocam sem vão: é o que deixa o preenchimento da segunda passada
 * cobrir a metade interna do contorno do perímetro.
 */
function buildLayout(): { readonly cells: readonly HexCell[]; readonly width: number; readonly height: number } {
  const raw = (Object.keys(HEX_GRID) as UfCode[]).map((uf) => {
    const position = HEX_GRID[uf];
    return { uf, x: position.column * HEX_W + (position.row % 2 === 1 ? HEX_W / 2 : 0), y: position.row * ROW_PITCH };
  });
  // Limites do desenho: a malha é constante e nunca vazia, e o laço dispensa o spread sobre lista.
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const cell of raw) {
    minX = Math.min(minX, cell.x - HEX_W / 2 - PAD);
    maxX = Math.max(maxX, cell.x + HEX_W / 2 + PAD);
    minY = Math.min(minY, cell.y - HEX_R - PAD);
    maxY = Math.max(maxY, cell.y + HEX_R + PAD);
  }
  const cells = raw.map((cell) => {
    const cx = Math.round((cell.x - minX) * 100) / 100;
    const cy = Math.round((cell.y - minY) * 100) / 100;
    return { uf: cell.uf, cx, cy, points: hexPoints(cx, cy, HEX_R) };
  });
  return { cells, width: Math.ceil(maxX - minX), height: Math.ceil(maxY - minY) };
}

const LAYOUT = buildLayout();

/**
 * Participação na precisão em que é escrita (uma casa do percentual): a classe, a ordem e a legenda
 * saem do mesmo número que a tela mostra. Sem mercado de referência não há taxa, e ausência não é zero.
 */
function shownShare(revenue: number, market: number): number | null {
  if (market <= 0) return null;
  return Math.round((revenue / market) * 1000) / 1000;
}

/** Soma de uma parcela nas UFs medidas. Lista vazia não soma zero: não tem soma (EST-1b). */
function sumOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  let total = 0;
  for (const value of values) total += value;
  return total;
}

/**
 * Quebras de intervalo igual em pontos percentuais inteiros, do piso da menor participação ao teto
 * da maior. O passo é arredondado para cima, então o último limite pode passar um pouco da maior.
 */
function buildEdges(shares: readonly number[]): readonly number[] | null {
  if (shares.length === 0) return null;
  let low = Number.POSITIVE_INFINITY;
  let high = Number.NEGATIVE_INFINITY;
  for (const share of shares) {
    low = Math.min(low, share);
    high = Math.max(high, share);
  }
  const lowPct = Math.floor(Math.round(low * 1000) / 10);
  const highPct = Math.ceil(Math.round(high * 1000) / 10);
  const stepPct = Math.max(1, Math.ceil((highPct - lowPct) / CLASS_COUNT));
  return Array.from({ length: CLASS_COUNT + 1 }, (_, index) => (lowPct + index * stepPct) / 100);
}

/** Classe de 0 a 2: cada limite inferior inclui o valor, e a última classe fecha em cima. */
function classOf(share: number, edges: readonly number[]) {
  let bucket = 0;
  for (let index = 1; index < CLASS_COUNT; index += 1) {
    const edge = edges[index];
    if (edge !== undefined && share >= edge) bucket = index;
  }
  return bucket;
}

function joinNames(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1] ?? ''}`;
}

function ufCount(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'UF' : 'UFs'}`;
}

function pairOf(revenue: number, market: number): string {
  return `${formatCurrencyCompact(revenue)} de receita em ${formatCurrencyCompact(market)} de mercado`;
}

function Swatch({ fill, stroke, dashed = false }: { readonly fill: string; readonly stroke: string; readonly dashed?: boolean }) {
  return (
    <svg aria-hidden className="shrink-0" height={SWATCH_H} viewBox={`0 0 ${String(SWATCH_W)} ${String(SWATCH_H)}`} width={SWATCH_W}>
      <polygon
        fill={fill}
        points={hexPoints(SWATCH_W / 2, SWATCH_H / 2, SWATCH_W / 2 - 0.75)}
        stroke={stroke}
        strokeDasharray={dashed ? '3 2' : undefined}
        strokeWidth={dashed ? 1.5 : 1}
      />
    </svg>
  );
}

export default function PerimeterShareMap({ data = defaultData, height, className }: PerimeterShareMapProps) {
  const rows = data.map((entry) => ({ entry, share: shownShare(entry.revenue, entry.market) }));
  const rated: RatedUf[] = rows.flatMap((row) => (row.share === null ? [] : [{ entry: row.entry, share: row.share }]));
  const edges = buildEdges(rated.map((item) => item.share));

  if (edges === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF do perímetro com mercado de referência neste recorte: o mapa não tem o que colorir.</span>
      </div>
    );
  }

  const byUf = new Map(rows.map((row) => [row.entry.uf, row]));
  // Maior participação primeiro; na mesma participação escrita, ordem alfabética do nome.
  const ranked = [...rated].sort((a, b) => b.share - a.share || a.entry.name.localeCompare(b.entry.name, 'pt-BR'));
  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];
  const outsideCount = LAYOUT.cells.filter((cell) => !byUf.has(cell.uf)).length;
  const unratedCount = rows.length - rated.length;

  const revenueTotal = sumOf(rated.map((item) => item.entry.revenue));
  const marketTotal = sumOf(rated.map((item) => item.entry.market));
  const perimeterShare = revenueTotal === null || marketTotal === null ? null : shownShare(revenueTotal, marketTotal);
  const perimeterText = perimeterShare === null ? formatUnavailable() : formatPercent(perimeterShare, 1);
  const pairText = revenueTotal === null || marketTotal === null ? formatUnavailable() : pairOf(revenueTotal, marketTotal);

  // Legenda em degraus, da classe mais alta para a mais baixa, com o intervalo observado e as UFs dela.
  const classes = CLASS_COLORS.map((color, index) => {
    const members = ranked.filter((item) => classOf(item.share, edges) === index);
    const high = members[0];
    const low = members[members.length - 1];
    const range =
      high === undefined || low === undefined
        ? `${formatPercent(edges[index] ?? 0, 0)} a ${formatPercent(edges[index + 1] ?? 0, 0)}`
        : high.share === low.share
          ? formatPercent(high.share, 1)
          : `${formatPercent(low.share, 1)} a ${formatPercent(high.share, 1)}`;
    return { index, color, range, names: members.length === 0 ? 'nenhuma UF nesta classe' : joinNames(members.map((item) => item.entry.name)) };
  }).reverse();

  const summary =
    top && bottom
      ? `Mapa de perímetro com a participação de mercado de ${ufCount(rated.length)}: ${perimeterText} no conjunto, ${pairText}. ` +
        `Maior: ${top.entry.name}, ${formatPercent(top.share, 1)}; menor: ${bottom.entry.name}, ${formatPercent(bottom.share, 1)}. ` +
        `As outras ${ufCount(outsideCount)} ficam sem medição.`
      : 'Mapa de perímetro sem UF medida para comparar.';

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 items-start gap-4', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      {/* Escala 1: largura e altura iguais ao viewBox, para o texto de 11 px chegar com 11 px (GEO-18). */}
      <svg aria-hidden className="shrink-0" height={LAYOUT.height} viewBox={`0 0 ${String(LAYOUT.width)} ${String(LAYOUT.height)}`} width={LAYOUT.width}>
        {/* Fora do perímetro: tom neutro, sem classe de cor e sem dica. O poço mede 1,15:1 contra o cartão; quem segura a silhueta é o traço. */}
        {LAYOUT.cells.map((cell) =>
          byUf.has(cell.uf) ? null : (
            <g key={cell.uf}>
              <polygon fill="var(--surface-sunken)" points={cell.points} stroke="var(--line-strong)" strokeWidth={MESH_STROKE_W} />
              <text dominantBaseline="central" fill="var(--text-muted)" fontSize={LABEL_SIZE} fontWeight={500} textAnchor="middle" x={cell.cx} y={cell.cy}>
                {cell.uf}
              </text>
            </g>
          ),
        )}
        {/* Primeira passada: os hexágonos do perímetro só com o contorno grosso. */}
        {LAYOUT.cells.map((cell) =>
          byUf.has(cell.uf) ? (
            <polygon fill="none" key={cell.uf} points={cell.points} stroke="var(--text-primary)" strokeLinejoin="round" strokeWidth={FIRST_PASS_W} />
          ) : null,
        )}
        {/* Segunda passada, sempre DEPOIS da primeira: o preenchimento cobre a metade interna do contorno
            e sobra só o contorno externo, sem dissolver polígono nenhum. */}
        {LAYOUT.cells.map((cell) => {
          const row = byUf.get(cell.uf);
          if (row === undefined) return null;
          if (row.share === null) {
            return (
              <g key={cell.uf}>
                <title>{`${row.entry.name}: participação ${formatUnavailable()}, sem mercado de referência`}</title>
                <polygon fill="var(--surface-sunken)" points={cell.points} stroke="var(--surface-raised)" strokeWidth={SEAM_W} />
                <polygon fill="none" points={hexPoints(cell.cx, cell.cy, HEX_R - ABSENT_INSET)} stroke="var(--text-muted)" strokeDasharray="3 2" strokeWidth={1.5} />
                <text fill="var(--text-muted)" fontSize={LABEL_SIZE} fontWeight={600} textAnchor="middle" x={cell.cx} y={cell.cy + SIGLA_DY}>
                  {cell.uf}
                </text>
                <Unplug aria-hidden height={ICON_SIZE} stroke="var(--text-muted)" width={ICON_SIZE} x={cell.cx - ICON_SIZE / 2} y={cell.cy} />
              </g>
            );
          }
          const bucket = classOf(row.share, edges);
          return (
            <g key={cell.uf}>
              <title>{`${row.entry.name}: ${formatPercent(row.share, 1)}, ${pairOf(row.entry.revenue, row.entry.market)}`}</title>
              <polygon fill={CLASS_COLORS[bucket]} points={cell.points} stroke="var(--surface-raised)" strokeWidth={SEAM_W} />
              <text fill={CLASS_TEXT[bucket]} fontSize={LABEL_SIZE} fontWeight={600} textAnchor="middle" x={cell.cx} y={cell.cy + SIGLA_DY}>
                {cell.uf}
              </text>
              <text className="font-display tabular-nums" fill={CLASS_TEXT[bucket]} fontSize={LABEL_SIZE} textAnchor="middle" x={cell.cx} y={cell.cy + VALUE_DY}>
                {formatPercent(row.share, 1)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div aria-hidden className="flex flex-col">
          <p className="text-xs leading-4 text-text-secondary">
            No perímetro, <span className="kpi-number font-semibold text-text-primary">{perimeterText}</span>
            {top && bottom ? (
              <>
                {/* Da maior para a menor, a mesma ordem em que a legenda lista as classes e a frase acessível cita as duas. */}
                : de <span className="kpi-number font-semibold text-text-primary">{formatPercent(top.share, 1)}</span> ({top.entry.uf}) a{' '}
                <span className="kpi-number font-semibold text-text-primary">{formatPercent(bottom.share, 1)}</span> ({bottom.entry.uf}).
              </>
            ) : (
              '.'
            )}
          </p>
          <p className="text-[0.6875rem] leading-4 text-text-muted tabular-nums">{pairText}</p>
        </div>

        <div aria-hidden className="flex flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-secondary">
          <span className="text-text-muted">Participação de cada UF sobre o mercado da própria UF</span>
          {classes.map((entry) => (
            // Alinhado pelo topo: a classe com 3 UFs quebra o nome em duas linhas, e a amostra fica na primeira.
            <span className="flex items-start gap-2" key={`class-${String(entry.index)}`}>
              <Swatch fill={entry.color} stroke={entry.index < OUTLINED_CLASSES ? 'var(--line-strong)' : entry.color} />
              <span className="w-[5.75rem] shrink-0 tabular-nums">{entry.range}</span>
              <span className="min-w-0 flex-1">{entry.names}</span>
            </span>
          ))}
          {unratedCount > 0 ? (
            <span className="flex items-center gap-2">
              <Swatch dashed fill="var(--surface-sunken)" stroke="var(--text-muted)" />
              <span className="w-[5.75rem] shrink-0">{formatUnavailable()}</span>
              <span className="min-w-0 flex-1 tabular-nums">{ufCount(unratedCount)}, sem mercado de referência</span>
            </span>
          ) : null}
          {/* Item à parte, depois dos degraus: fora do perímetro não é a classe mais baixa, é ausência de medição. */}
          <span className="flex items-center gap-2">
            <Swatch fill="var(--surface-sunken)" stroke="var(--line-strong)" />
            <span className="w-[5.75rem] shrink-0">fora do perímetro</span>
            <span className="min-w-0 flex-1 tabular-nums">{ufCount(outsideCount)}, sem medição</span>
          </span>
        </div>

        <p className="text-[0.6875rem] leading-tight text-text-muted tabular-nums">
          A participação nacional não é a soma do mapa: cada percentual tem como base o mercado da própria UF, e as{' '}
          {ufCount(outsideCount)} de fora não são medidas.
        </p>
      </div>
    </figure>
  );
}
