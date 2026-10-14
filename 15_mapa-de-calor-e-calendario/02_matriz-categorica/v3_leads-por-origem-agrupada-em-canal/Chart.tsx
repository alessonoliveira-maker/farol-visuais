import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatMonthShort, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  CHANNELS,
  data as defaultData,
  MONTHS,
  PARTIAL_MONTH,
  PARTIAL_UNTIL,
  type OriginRow,
} from './data';

/**
 * Matriz categórica com o eixo de linhas em DOIS NÍVEIS: o canal fica numa coluna própria, centrado
 * sobre as origens que ele agrupa, e a hierarquia se lê pelo vão e não por recuo de texto.
 *
 * O VÃO É POSIÇÃO, NÃO BORDA (ESP-5). O y de cada linha é acumulado numa passada só, somando 2 px
 * entre itens do mesmo canal e 8 px na troca de canal, e é esse degrau de 6 px que separa os grupos.
 * Os grupos são desiguais de propósito, com 7 origens em mídia paga e 2 em indicação, porque grupo
 * de tamanho igual é o caso fácil e esconde o erro de centrar o rótulo pelo número de itens em vez
 * de pela extensão desenhada.
 *
 * O CATÁLOGO PEDE 1 px ENTRE ITENS E AQUI SÃO 2 px, por colisão resolvida a favor do CONTRATO: a
 * COR-5 exige vão de pelo menos 1,5 px entre marcas coladas que não contrastam entre si, e a ESP-1
 * pede distância em múltiplo de 2 px. Com 1 px duas células da mesma faixa virariam uma só, e
 * vizinhos da rampa medem de 1,23:1 a 1,52:1 entre si, que é exatamente o caso que a COR-5 descreve.
 *
 * SEM ORIGEM DECLARADA FICA FORA DA RAMPA, em `--text-muted`, por duas razões que a seção 7 junta:
 * ela é a falta de um canal e não um canal, e comparar um desconhecido com um conhecido na mesma
 * escala de cor faria os dois parecerem a mesma espécie de coisa. Vai por último, em tom neutro, com
 * o número escrito como nas demais, e nunca entra no teto da rampa.
 *
 * MÊS PARCIAL (EIX-10): a última coluna leva moldura tracejada num canal aberto de 3 px FORA das
 * células, e não contorno por célula, porque contorno tracejado por célula já significa origem sem
 * medição nesta peça e os dois se confundiriam. A data de corte está escrita no rodapé.
 */
export interface LeadsByGroupedOriginProps {
  readonly data?: readonly OriginRow[];
  readonly height?: number;
  readonly className?: string;
}

/** O corpo do cartão de 960 x 578 na moldura `card`, medido: 960 − 66 por 578 − 118,5. */
const VIEW_W = 894;
const VIEW_H = 459.5;

const CANAL_W = 80;
const ORIGEM_W = 152;
const LEFT_W = CANAL_W + ORIGEM_W;
const TEXT_LEFT = 2;
const GAP = 2;
const CELL_H = 20;
const ITEM_GAP = 2;
const GROUP_GAP = 8;
const CELL_RADIUS = 2;
/**
 * Passo de coluna escrito como número, e não como divisão da largura pelo número de meses, porque
 * dividir por `length` de lista é a forma que a guarda AGREGACAO-ZERO acusa, e com razão em conta de
 * dado. A conta está aqui: (894 − 232 de eixo − 2 de folga) por 12 meses dá 55 px de passo.
 */
const COL_STEP = 55;
const CELL_W = COL_STEP - GAP;

const READ_Y = 12;
const NOTE_Y = 30;
const MONTH_Y = 48;
const GRID_TOP = 60;
/**
 * Recuo da moldura do mês parcial para fora das células. É 1 px, e não um múltiplo de 2 como a
 * ESP-1 pede, porque o vão entre colunas tem 2 px: com recuo de 2 px o traço nasceria sobre a borda
 * da célula vizinha, e com 1 px ele fica inteiro dentro do vão.
 */
const PARTIAL_INSET = 1;

const FOOT_A = 430;
const FOOT_B = 450;
const SWATCH_W = 20;
const SWATCH_H = 12;
const SCALE_BLOCK_W = 88;
/**
 * Paradas do rodapé, medidas pela tabela por glifo de `colisao.mjs` e não pela média por classe: a
 * primeira etiqueta ocupa 63,3 px a partir de 28 e a segunda 154,9 px a partir de 146, o que deixa
 * 28,7 px e 29,1 px de respiro antes da parada seguinte, bem acima dos 4 px da ROT-9.
 */
const FOOT_STOP_TWO = 120;
const FOOT_STOP_THREE = 330;

const BAND_FLOOR = 1;
/** Cinco degraus com texto legível nos dois temas. `--seq-4` e `--seq-5` não aceitam texto nenhum. */
const BAND_COLORS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const BAND_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;
const BAND_COUNT = BAND_COLORS.length;

function sumOf(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/** Soma só do que foi medido. `null` quando nada foi medido, porque ausência não soma zero (EST-1b). */
function measuredTotal(counts: readonly (number | null)[]): number | null {
  const measured = counts.filter((count): count is number => count !== null);
  if (measured.length === 0) return null;
  return sumOf(measured);
}

/** Maior valor da lista. `null` na lista vazia, porque `Math.max` de nada devolve infinito. */
function maxOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((champion, value) => (value > champion ? value : champion), values[0] ?? 0);
}

/** Borda inferior da faixa, com a última terminando no maior par observado (ROT-5b). */
function bandEdge(index: number, ceiling: number): number {
  const span = ceiling - BAND_FLOOR + 1;
  return BAND_FLOOR + Math.round((index * span) / BAND_COUNT);
}

function bandOf(value: number, ceiling: number): number {
  for (let index = BAND_COUNT - 1; index > 0; index -= 1) {
    if (value >= bandEdge(index, ceiling)) return index;
  }
  return 0;
}

function columnX(columnIndex: number): number {
  return LEFT_W + columnIndex * COL_STEP;
}

/** Uma origem já posicionada: o y sai da acumulação, que é onde o vão de grupo entra. */
interface PlacedOrigin {
  readonly row: OriginRow;
  readonly total: number;
  readonly y: number;
}

export default function LeadsByGroupedOrigin({ data = defaultData, height, className }: LeadsByGroupedOriginProps) {
  const withTotals = data
    .map((row) => ({ row, total: measuredTotal(row.monthly) }))
    .filter((entry): entry is { row: OriginRow; total: number } => entry.total !== null);

  /** Canal a canal na ordem fixa e, dentro do canal, da origem maior para a menor (GEO-12). */
  const ordered = [
    ...CHANNELS.flatMap((channel) =>
      withTotals.filter((entry) => entry.row.channel === channel.id).sort((left, right) => right.total - left.total),
    ),
    ...withTotals.filter((entry) => entry.row.channel === null).sort((left, right) => right.total - left.total),
  ];

  const placed: PlacedOrigin[] = [];
  let cursor = GRID_TOP;
  let previousChannel: string | null | undefined;
  for (const entry of ordered) {
    if (previousChannel !== undefined) cursor += entry.row.channel === previousChannel ? ITEM_GAP : GROUP_GAP;
    placed.push({ row: entry.row, total: entry.total, y: cursor });
    cursor += CELL_H;
    previousChannel = entry.row.channel;
  }

  /** O teto da rampa vem só das origens agrupadas: a linha neutra não é degrau da mesma escala. */
  const rampValues = placed
    .filter((entry) => entry.row.channel !== null)
    .flatMap((entry) => entry.row.monthly.filter((count): count is number => count !== null && count > 0));
  const ceiling = maxOf(rampValues);

  if (placed.length === 0 || ceiling === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem medida neste recorte: a matriz não tem o que colorir.</span>
      </div>
    );
  }

  const grandTotal = sumOf(placed.map((entry) => entry.total));
  const channelTotals = CHANNELS.map((channel) => ({
    channel,
    total: sumOf(placed.filter((entry) => entry.row.channel === channel.id).map((entry) => entry.total)),
  }));
  let topChannel = channelTotals[0];
  for (const entry of channelTotals) {
    if (topChannel === undefined || entry.total > topChannel.total) topChannel = entry;
  }
  let topOrigin: PlacedOrigin | undefined;
  for (const entry of placed) {
    if (entry.row.channel === null) continue;
    if (topOrigin === undefined || entry.total > topOrigin.total) topOrigin = entry;
  }

  /** Extensão desenhada de cada grupo, que é o que centra o rótulo de canal, não a contagem de itens. */
  const channelSpans = CHANNELS.map((channel) => {
    const own = placed.filter((entry) => entry.row.channel === channel.id);
    const first = own[0];
    const last = own[own.length - 1];
    if (first === undefined || last === undefined) return { channel, center: null };
    return { channel, center: (first.y + last.y + CELL_H) / 2 };
  });

  const partialIndex = MONTHS.indexOf(PARTIAL_MONTH);
  const gridBottom = cursor;

  const note =
    topOrigin === undefined ? null : `${topOrigin.row.label}: maior origem, ${formatInt(topOrigin.total)} leads`;

  const summary =
    topChannel === undefined || topOrigin === undefined
      ? `Matriz de calor com ${formatInt(grandTotal)} leads por origem e mês.`
      : `Matriz de calor com ${formatInt(grandTotal)} leads de ${formatInt(placed.length)} origens em ${formatInt(CHANNELS.length)} canais, de ${formatMonthShort(MONTHS[0] ?? PARTIAL_MONTH)} a ${formatMonthShort(PARTIAL_MONTH)}, com o número escrito em toda célula. ` +
        `${topChannel.channel.label} responde por ${formatRateWithVolume(topChannel.total, grandTotal)} e ${topOrigin.row.label} é a maior origem.`;

  return (
    <div
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="img"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {topChannel === undefined ? null : (
          <text fill="var(--text-secondary)" fontSize={12} x={TEXT_LEFT} y={READ_Y}>
            <tspan className="font-semibold" fill="var(--text-primary)">
              {topChannel.channel.label}
            </tspan>{' '}
            responde por{' '}
            <tspan className="font-display tabular-nums">{formatRateWithVolume(topChannel.total, grandTotal)}</tspan> dos
            leads do recorte.
          </text>
        )}
        {note === null ? null : (
          <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={TEXT_LEFT} y={NOTE_Y}>
            {note}
          </text>
        )}

        {MONTHS.map((month, columnIndex) => (
          <text
            className="font-display tabular-nums"
            fill="var(--text-muted)"
            fontSize={11}
            key={month}
            textAnchor="middle"
            x={columnX(columnIndex) + CELL_W / 2}
            y={MONTH_Y}
          >
            {formatMonthShort(month)}
          </text>
        ))}

        {channelSpans.map((span) =>
          span.center === null ? null : (
            <text
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={12}
              key={span.channel.id}
              x={TEXT_LEFT}
              y={span.center}
            >
              {span.channel.label}
            </text>
          ),
        )}

        {placed.map((entry) => {
          const neutral = entry.row.channel === null;
          return (
            <g key={entry.row.id}>
              <text
                dominantBaseline="central"
                fill={neutral ? 'var(--text-muted)' : 'var(--text-secondary)'}
                fontSize={12}
                textAnchor="end"
                x={LEFT_W - 8}
                y={entry.y + CELL_H / 2}
              >
                {entry.row.label}
              </text>
              {MONTHS.map((month, columnIndex) => {
                const value = entry.row.monthly[columnIndex] ?? null;
                const x = columnX(columnIndex);
                const key = `${entry.row.id}-${month}`;
                if (value === null) {
                  return (
                    <rect
                      fill="none"
                      height={CELL_H - 1}
                      key={key}
                      rx={CELL_RADIUS}
                      stroke="var(--text-muted)"
                      strokeDasharray="2 2"
                      width={CELL_W - 1}
                      x={x + 0.5}
                      y={entry.y + 0.5}
                    />
                  );
                }
                if (value === 0) {
                  return (
                    <g key={key}>
                      <rect
                        fill="var(--surface-sunken)"
                        height={CELL_H - 1}
                        rx={CELL_RADIUS}
                        stroke="var(--text-muted)"
                        width={CELL_W - 1}
                        x={x + 0.5}
                        y={entry.y + 0.5}
                      />
                      <text
                        className="font-display tabular-nums"
                        dominantBaseline="central"
                        fill="var(--text-primary)"
                        fontSize={11}
                        textAnchor="middle"
                        x={x + CELL_W / 2}
                        y={entry.y + CELL_H / 2}
                      >
                        {formatInt(value)}
                      </text>
                    </g>
                  );
                }
                const band = neutral ? null : bandOf(value, ceiling);
                return (
                  <g key={key}>
                    <rect
                      fill={band === null ? 'var(--text-muted)' : BAND_COLORS[band]}
                      height={CELL_H}
                      rx={CELL_RADIUS}
                      width={CELL_W}
                      x={x}
                      y={entry.y}
                    />
                    <text
                      className="font-display tabular-nums"
                      dominantBaseline="central"
                      fill={band === null ? 'var(--accent-cyan-contrast)' : (BAND_TEXT[band] ?? 'var(--text-primary)')}
                      fontSize={11}
                      textAnchor="middle"
                      x={x + CELL_W / 2}
                      y={entry.y + CELL_H / 2}
                    >
                      {formatInt(value)}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {partialIndex < 0 ? null : (
          <rect
            fill="none"
            height={gridBottom - GRID_TOP + 2 * PARTIAL_INSET}
            rx={CELL_RADIUS}
            stroke="var(--text-muted)"
            strokeDasharray="6 3"
            width={CELL_W + 2 * PARTIAL_INSET}
            x={columnX(partialIndex) - PARTIAL_INSET}
            y={GRID_TOP - PARTIAL_INSET}
          />
        )}

        {BAND_COLORS.map((color, index) => {
          const x = TEXT_LEFT + index * SCALE_BLOCK_W;
          const floor = bandEdge(index, ceiling);
          const roof = index === BAND_COUNT - 1 ? ceiling : bandEdge(index + 1, ceiling) - 1;
          return (
            <g key={`band-${String(index)}`}>
              <rect fill={color} height={SWATCH_H} rx={2} width={SWATCH_W} x={x} y={FOOT_A - SWATCH_H / 2} />
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize={11}
                x={x + SWATCH_W + 6}
                y={FOOT_A}
              >
                {formatInt(floor)} a {formatInt(roof)}
              </text>
            </g>
          );
        })}
        <text
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={TEXT_LEFT + BAND_COUNT * SCALE_BLOCK_W + 8}
          y={FOOT_A}
        >
          cor: leads no par origem e mês; origens ordenadas pelo total dentro do canal
        </text>

        <rect
          fill="var(--surface-sunken)"
          height={SWATCH_H}
          rx={1}
          stroke="var(--text-muted)"
          width={SWATCH_W}
          x={TEXT_LEFT}
          y={FOOT_B - SWATCH_H / 2}
        />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={TEXT_LEFT + SWATCH_W + 6} y={FOOT_B}>
          zero medido
        </text>
        <rect
          fill="none"
          height={SWATCH_H}
          rx={1}
          stroke="var(--text-muted)"
          strokeDasharray="2 2"
          width={SWATCH_W}
          x={FOOT_STOP_TWO}
          y={FOOT_B - SWATCH_H / 2}
        />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={FOOT_STOP_TWO + SWATCH_W + 6} y={FOOT_B}>
          origem que não existia no mês
        </text>
        <rect
          fill="none"
          height={SWATCH_H}
          rx={1}
          stroke="var(--text-muted)"
          strokeDasharray="6 3"
          width={SWATCH_W}
          x={FOOT_STOP_THREE}
          y={FOOT_B - SWATCH_H / 2}
        />
        <text
          className="tabular-nums"
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={FOOT_STOP_THREE + SWATCH_W + 6}
          y={FOOT_B}
        >
          mês parcial, medido até {formatDate(PARTIAL_UNTIL)}
        </text>
      </svg>
    </div>
  );
}
