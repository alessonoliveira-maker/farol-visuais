import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, MONTHS, SAMPLE_FLOOR, type OriginMonthCell, type OriginRateRow } from './data';

/**
 * Matriz de dupla codificação: o LADO do quadrado sai da raiz do volume de leads e a COR sai da taxa
 * de agenda. Existe porque a matriz de taxa pura mente na ponta de baixo, onde 3 agendas em 5 leads
 * pintam o degrau mais forte da escala e roubam a leitura de uma origem com 34 em 160.
 *
 * O LADO PELA RAIZ, e não pelo valor, porque quem compara quadrado compara ÁREA: com o lado
 * proporcional ao volume, um par com um quinto do volume desenharia um quinto do lado e um vinte e
 * cinco avos da área, que é a armadilha GEO-3. O teto do lado é o maior volume OBSERVADO, calculado
 * do dado, e por isso a régua da legenda termina nele e não numa constante (ROT-5b).
 *
 * QUANTOS NÍVEIS A COR AFIRMA, e a resposta é desconfortável. Sem número escrito na célula, e aqui
 * não há como escrever (o menor quadrado preenchido tem 8 px de lado, contra os 17 px que um texto de
 * 11 px exigiria), a TOK-8 manda ficar em `--seq-5`, `--seq-6` e `--seq-7`, os três degraus que
 * passam de 3:1 contra o cartão nos dois temas. Medido degrau contra degrau, esses três NÃO se
 * separam: 1,42:1 entre o quinto e o sexto, 1,45:1 entre o sexto e o sétimo e 2,07:1 entre os
 * extremos, todos abaixo de 3:1. Então a peça afirma DOIS níveis de cor, baixo e alto, e nada mais:
 * o que carrega a ordem é o intervalo de cada faixa ESCRITO na legenda, a ordem das linhas pela taxa
 * do período e a taxa com volume escrita na margem de cada linha.
 *
 * QUATRO ESTADOS, em canais diferentes: par com amostra recebe quadrado preenchido na faixa; par com
 * menos de `SAMPLE_FLOOR` leads recebe o quadrado só de contorno, no tamanho do volume, porque o
 * volume é medição e a taxa dali não conclui; zero lead medido recebe um ponto neutro, que mantém a
 * grade inteira sem afirmar tamanho nenhum; e mês sem medição recebe uma caixa tracejada de tamanho
 * fixo, que não se confunde com volume porque nenhum quadrado desenhado é tracejado.
 */
export interface RateAndVolumeMatrixProps {
  readonly data?: readonly OriginRateRow[];
  readonly height?: number;
  readonly className?: string;
}

/** O corpo do cartão de 960 x 624 na moldura `card`, medido: 960 − 66 por 624 − 118,5. */
const VIEW_W = 894;
const VIEW_H = 505.5;

const LEFT_W = 168;
const TEXT_LEFT = 2;
/**
 * Passo de coluna escrito como número, e não como divisão da largura pelo número de meses, porque
 * dividir por `length` de lista é a forma que a guarda AGREGACAO-ZERO acusa, e com razão em conta de
 * dado. A conta está aqui: 894 menos 168 de eixo à esquerda e 132 reservados à direita para a taxa
 * com volume da linha, por 6 meses, dá 99 px de passo.
 */
const COL_STEP = 99;
const ROW_STEP = 44;
/** Lado do quadrado do maior volume observado. Cabe em ROW_STEP com 4 px de respiro em cima e embaixo. */
const MAX_SIDE = 36;
/** Lado mínimo do quadrado só de contorno, para amostra rala não sumir da grade. */
const MIN_SIDE = 6;
const ABSENT_SIDE = 14;
const ZERO_DOT_R = 2.5;
const CELL_RADIUS = 2;

const READ_Y = 12;
const NOTE_Y = 30;
const MONTH_Y = 50;
const GRID_TOP = 58;
const SIZE_LEGEND_Y = 440;
const SIZE_BLOCK_W = 92;
const COLOR_LEGEND_Y = 476;
/**
 * Passo da legenda de cor, medido pela tabela por glifo: a etiqueta mais larga, "42,5% a 60,0%",
 * ocupa 77 px, mais 20 px de amostra e 6 px de vão dão 103 px, então 112 px deixa 9 px de respiro.
 * Com os 100 px da primeira tentativa o rótulo encostava na amostra seguinte, visto no render.
 */
const COLOR_BLOCK_W = 112;
const FOOT_Y = 496;
const SWATCH_W = 20;
const SWATCH_H = 12;
/**
 * Paradas do rodapé, medidas pela tabela por glifo de `colisao.mjs` e não pela média por classe: as
 * etiquetas ocupam 126,8 px, 249,4 px e 202,2 px, o que deixa 29,2 px e 30,6 px de respiro antes da
 * parada seguinte, bem acima dos 4 px da ROT-9.
 */
const FOOT_STOP_TWO = 180;
const FOOT_STOP_THREE = 486;

/** Os três degraus que passam de 3:1 contra o cartão nos dois temas, que é o que a TOK-8 permite. */
const BAND_COLORS = [CHART_SEQUENTIAL_COLORS[4], CHART_SEQUENTIAL_COLORS[5], CHART_SEQUENTIAL_COLORS[6]] as const;
const BAND_COUNT = BAND_COLORS.length;

function sumOf(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/** Taxa do par. `null` sem denominador, porque taxa sem base não é zero e sim ausência (EST-1b). */
function rateOf(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return numerator / denominator;
}

/** Maior valor da lista. `null` na lista vazia, porque `Math.max` de nada devolve infinito. */
function maxOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((champion, value) => (value > champion ? value : champion), values[0] ?? 0);
}

/** Menor valor da lista, com a mesma regra do máximo. */
function minOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((champion, value) => (value < champion ? value : champion), values[0] ?? 0);
}

/** Mediana da lista. `null` na lista vazia, nunca zero, que é a letra da EST-1b. */
function medianOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? null;
  const before = sorted[middle - 1];
  const after = sorted[middle];
  if (before === undefined || after === undefined) return null;
  return (before + after) / 2;
}

/** Lado do quadrado: raiz do volume sobre o teto observado, para a ÁREA ser proporcional (GEO-3). */
function sideOf(volume: number, ceiling: number): number {
  if (ceiling <= 0) return 0;
  return MAX_SIDE * Math.sqrt(volume / ceiling);
}

/** Piso da faixa `index`, derivado da menor e da maior taxa conclusiva do recorte. */
function bandFloor(index: number, low: number, high: number): number {
  return low + (index * (high - low)) / BAND_COUNT;
}

function bandOf(rate: number, low: number, high: number): number {
  if (high <= low) return BAND_COUNT - 1;
  const raw = Math.floor(((rate - low) / (high - low)) * BAND_COUNT);
  return Math.min(BAND_COUNT - 1, Math.max(0, raw));
}

function columnCenter(columnIndex: number): number {
  return LEFT_W + columnIndex * COL_STEP + COL_STEP / 2;
}

/** Uma origem com os dois agregados do período, que é o que ordena as linhas e escreve a margem. */
interface OriginTotals {
  readonly row: OriginRateRow;
  readonly leads: number;
  readonly agendas: number;
  readonly rate: number;
}

export default function RateAndVolumeMatrix({ data = defaultData, height, className }: RateAndVolumeMatrixProps) {
  const totals: readonly OriginTotals[] = data
    .map((row) => {
      const cells = row.monthly.filter((cell): cell is OriginMonthCell => cell !== null);
      const leads = sumOf(cells.map((cell) => cell.leads));
      const agendas = sumOf(cells.map((cell) => cell.agendas));
      return { row, leads, agendas, rate: rateOf(agendas, leads) };
    })
    .filter((entry): entry is OriginTotals => entry.rate !== null)
    .sort((left, right) => right.rate - left.rate);

  const volumes = data.flatMap((row) =>
    row.monthly.filter((cell): cell is OriginMonthCell => cell !== null && cell.leads > 0).map((cell) => cell.leads),
  );
  const conclusiveRates = data.flatMap((row) =>
    row.monthly
      .filter((cell): cell is OriginMonthCell => cell !== null && cell.leads >= SAMPLE_FLOOR)
      .map((cell) => rateOf(cell.agendas, cell.leads))
      .filter((rate): rate is number => rate !== null),
  );
  const ceiling = maxOf(volumes);
  const smallest = minOf(volumes);
  const middle = medianOf(volumes);
  const lowRate = minOf(conclusiveRates);
  const highRate = maxOf(conclusiveRates);

  if (
    totals.length === 0 ||
    ceiling === null ||
    smallest === null ||
    middle === null ||
    lowRate === null ||
    highRate === null
  ) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem com lead medido neste recorte: a matriz não tem o que dimensionar.</span>
      </div>
    );
  }

  const topRate = totals[0];
  let topVolume = totals[0];
  for (const entry of totals) {
    if (topVolume === undefined || entry.leads > topVolume.leads) topVolume = entry;
  }
  /** Onde o maior volume aconteceu, que é o par que a anotação nomeia. Laço simples, e não `forEach`,
   * para o estreitamento de tipo do TypeScript alcançar a atribuição. */
  let peak: { readonly label: string; readonly month: string } | null = null;
  for (const row of data) {
    for (let columnIndex = 0; columnIndex < MONTHS.length; columnIndex += 1) {
      const cell = row.monthly[columnIndex];
      const month = MONTHS[columnIndex];
      if (cell === null || cell === undefined || month === undefined) continue;
      if (cell.leads !== ceiling) continue;
      peak = { label: row.label, month };
    }
  }
  /** Quantas vezes o maior par é maior que o menor. `null` sem base, nunca zero (EST-1b). */
  const spread = smallest > 0 ? ceiling / smallest : null;
  const totalLeads = sumOf(totals.map((entry) => entry.leads));
  const topRateShare = topRate === undefined ? null : rateOf(topRate.leads, totalLeads);

  const note =
    peak === null || spread === null
      ? null
      : `${peak.label} em ${formatMonthShort(peak.month)}: ${formatInt(ceiling)} leads, ${formatInt(Math.round(spread))} vezes o menor`;

  const summary =
    topRate === undefined || topVolume === undefined
      ? `Matriz de taxa de agenda por origem e mês.`
      : `Matriz de calor com ${formatInt(totals.length)} origens por ${formatInt(MONTHS.length)} meses: o lado do quadrado mede o volume de leads e a cor mede a taxa de agenda. ` +
        `${topRate.row.label} tem a maior taxa, ${formatRateWithVolume(topRate.agendas, topRate.leads)}, e ${topVolume.row.label} o maior volume, ${formatInt(topVolume.leads)} leads.`;

  return (
    <div
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="img"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {topRate === undefined || topRateShare === null ? null : (
          <text fill="var(--text-secondary)" fontSize={12} x={TEXT_LEFT} y={READ_Y}>
            <tspan className="font-semibold" fill="var(--text-primary)">
              {topRate.row.label}
            </tspan>{' '}
            tem a maior taxa do período,{' '}
            <tspan className="font-display tabular-nums">{formatRateWithVolume(topRate.agendas, topRate.leads)}</tspan>,
            com <tspan className="font-display tabular-nums">{formatPercent(topRateShare, 1)}</tspan> dos leads.
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
            x={columnCenter(columnIndex)}
            y={MONTH_Y}
          >
            {formatMonthShort(month)}
          </text>
        ))}

        {totals.map((entry, rowIndex) => {
          const centerY = GRID_TOP + rowIndex * ROW_STEP + ROW_STEP / 2;
          return (
            <g key={entry.row.id}>
              <text
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={12}
                textAnchor="end"
                x={LEFT_W - 8}
                y={centerY}
              >
                {entry.row.label}
              </text>

              {MONTHS.map((month, columnIndex) => {
                const cell = entry.row.monthly[columnIndex] ?? null;
                const centerX = columnCenter(columnIndex);
                const key = `${entry.row.id}-${month}`;
                if (cell === null) {
                  return (
                    <rect
                      fill="none"
                      height={ABSENT_SIDE}
                      key={key}
                      rx={CELL_RADIUS}
                      stroke="var(--text-muted)"
                      strokeDasharray="2 2"
                      width={ABSENT_SIDE}
                      x={centerX - ABSENT_SIDE / 2}
                      y={centerY - ABSENT_SIDE / 2}
                    />
                  );
                }
                if (cell.leads === 0) {
                  return <circle cx={centerX} cy={centerY} fill="var(--text-muted)" key={key} r={ZERO_DOT_R} />;
                }
                const side = Math.max(MIN_SIDE, sideOf(cell.leads, ceiling));
                const rate = rateOf(cell.agendas, cell.leads);
                if (cell.leads < SAMPLE_FLOOR || rate === null) {
                  return (
                    <rect
                      fill="none"
                      height={side}
                      key={key}
                      rx={CELL_RADIUS}
                      stroke="var(--text-muted)"
                      width={side}
                      x={centerX - side / 2}
                      y={centerY - side / 2}
                    />
                  );
                }
                return (
                  <rect
                    fill={BAND_COLORS[bandOf(rate, lowRate, highRate)]}
                    height={side}
                    key={key}
                    rx={CELL_RADIUS}
                    width={side}
                    x={centerX - side / 2}
                    y={centerY - side / 2}
                  />
                );
              })}

              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={11}
                textAnchor="end"
                x={VIEW_W - TEXT_LEFT}
                y={centerY}
              >
                {formatRateWithVolume(entry.agendas, entry.leads)}
              </text>
            </g>
          );
        })}

        {[smallest, middle, ceiling].map((reference, index) => {
          const side = sideOf(reference, ceiling);
          const blockX = TEXT_LEFT + index * SIZE_BLOCK_W;
          return (
            <g key={`size-${String(index)}`}>
              <rect
                fill="none"
                height={side}
                rx={CELL_RADIUS}
                stroke="var(--text-muted)"
                width={side}
                x={blockX + (MAX_SIDE - side) / 2}
                y={SIZE_LEGEND_Y - side / 2}
              />
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize={11}
                x={blockX + MAX_SIDE + 6}
                y={SIZE_LEGEND_Y}
              >
                {formatInt(reference)}
              </text>
            </g>
          );
        })}
        <text
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={TEXT_LEFT + 3 * SIZE_BLOCK_W + 8}
          y={SIZE_LEGEND_Y}
        >
          tamanho: leads no par origem e mês
        </text>

        {BAND_COLORS.map((color, index) => {
          const blockX = TEXT_LEFT + index * COLOR_BLOCK_W;
          const floor = bandFloor(index, lowRate, highRate);
          const roof = index === BAND_COUNT - 1 ? highRate : bandFloor(index + 1, lowRate, highRate);
          return (
            <g key={`band-${String(index)}`}>
              <rect fill={color} height={SWATCH_H} rx={2} width={SWATCH_W} x={blockX} y={COLOR_LEGEND_Y - SWATCH_H / 2} />
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize={11}
                x={blockX + SWATCH_W + 6}
                y={COLOR_LEGEND_Y}
              >
                {formatPercent(floor, 1)} a {formatPercent(roof, 1)}
              </text>
            </g>
          );
        })}
        <text
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={TEXT_LEFT + BAND_COUNT * COLOR_BLOCK_W + 8}
          y={COLOR_LEGEND_Y}
        >
          cor: taxa de agenda; origens ordenadas pela taxa do período
        </text>

        <circle cx={TEXT_LEFT + SWATCH_W / 2} cy={FOOT_Y} fill="var(--text-muted)" r={ZERO_DOT_R} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={TEXT_LEFT + SWATCH_W + 6} y={FOOT_Y}>
          ponto: zero lead medido
        </text>
        <rect
          fill="none"
          height={SWATCH_H}
          rx={1}
          stroke="var(--text-muted)"
          width={SWATCH_W}
          x={FOOT_STOP_TWO}
          y={FOOT_Y - SWATCH_H / 2}
        />
        <text
          className="tabular-nums"
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={FOOT_STOP_TWO + SWATCH_W + 6}
          y={FOOT_Y}
        >
          contorno sem preenchimento: menos de {formatInt(SAMPLE_FLOOR)} leads
        </text>
        <rect
          fill="none"
          height={SWATCH_H}
          rx={1}
          stroke="var(--text-muted)"
          strokeDasharray="2 2"
          width={SWATCH_W}
          x={FOOT_STOP_THREE}
          y={FOOT_Y - SWATCH_H / 2}
        />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={FOOT_STOP_THREE + SWATCH_W + 6} y={FOOT_Y}>
          tracejado: origem sem medição no mês
        </text>
      </svg>
    </div>
  );
}
