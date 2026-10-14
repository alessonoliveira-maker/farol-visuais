import { Filter } from 'lucide-react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, totalCaption as defaultCaption, type InteractionHexBin } from './data';

/**
 * Densidade 2D em rede hexagonal com escala de cor por QUANTIL. A rede é a mesma da versão 2, montada
 * em pixel e com os vértices saindo de ângulo; o que muda é como os limites das faixas nascem, e a
 * troca existe por um motivo medido neste recorte: com faixas de largura igual, o limite de baixo cai
 * em 6.667 e 50 dos 51 hexágonos ficam na mesma faixa. Um hexágono sozinho leva metade das
 * interações, então ele estica a escala e apaga todo o resto do desenho. Por quantil, cada faixa reúne
 * cerca de um terço das CÉLULAS, e a divisão sai 18, 16 e 17.
 *
 * O preço disso é que os degraus deixam de ser comparáveis entre si, e a legenda tem que dizer isso em
 * palavra, não em cor: a distância de 3 a 44 interações não é a mesma de 313 a 20.000. Quem lê sem o
 * aviso conclui que o terceiro degrau vale o triplo do primeiro.
 *
 * Por que a escala tem três degraus e não sete. Medido em 2026-09-28 contra o fundo do cartão, só
 * `--seq-5`, `--seq-6` e `--seq-7` passam de 3:1 nos dois temas (TOK-8). Num modelo em que hexágono
 * não desenhado QUER DIZER ausência de interação, um degrau invisível mente. E os três degraus úteis
 * medem 1,42:1 e 1,45:1 ENTRE SI, então o raio do hexágono repete a faixa e a legenda escreve a
 * contagem de cada uma.
 */
export interface InteractionQuantileHexbinProps {
  readonly data?: readonly InteractionHexBin[];
  /** O que o total conta e em que período ("interações com a página no mês"). */
  readonly caption?: string;
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 574;
const VIEW_H = 234;
const PLOT_X = 46;
const PLOT_Y = 46;
/** Rede hexagonal em pixel: raio, passo horizontal e passo vertical de topo pontudo. */
const HEX_R = 12;
const HEX_DX = Math.sqrt(3) * HEX_R;
const HEX_DY = 1.5 * HEX_R;
const HEX_COLS = 9;
const HEX_ROWS = 8;
const HEX_VERTICES = 6;
const PLOT_W = HEX_DX * HEX_COLS;
const PLOT_H = HEX_DY * (HEX_ROWS - 1) + 2 * HEX_R;
const SECONDS_MAX = 120;
const SCROLL_MAX = 100;
const TICKS_SECONDS = [0, 30, 60, 90, 120] as const;
const TICKS_SCROLL = [0, 25, 50, 75, 100] as const;
/** Os três degraus que passam de 3:1 contra o cartão nos dois temas (ver o comentário do topo). */
const BAND_COLORS = ['var(--seq-5)', 'var(--seq-6)', 'var(--seq-7)'] as const;
const BAND_NAMES = ['1º terço', '2º terço', '3º terço'] as const;
/** Fator de raio por faixa: canal redundante da ordem, não codificação de área. */
const BAND_RADIUS = [0.62, 0.82, 1] as const;
const BAND_COUNT = 3;
const PANEL_X = 262;
const PANEL_SWATCH_STEP = 70;
const PANEL_SWATCH_CY = 74;
/** Respiro entre a borda do hexágono dominante e o rótulo que o nomeia. */
const LABEL_GAP = 6;

/** Soma que devolve null em lista vazia (EST-1b): ausência é do tipo, nunca zero. */
function sumOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Quantil que devolve null em lista vazia (EST-1b). A fração vai de 0 a 1 e o índice é arredondado, o
 * que é a definição mais simples de quantil: basta ser a mesma em toda a escala, porque o que a peça
 * afirma é a ORDEM das faixas, não o valor exato do corte.
 */
function quantileOf(values: readonly number[], fraction: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round(fraction * (sorted.length - 1))));
  return sorted[index] ?? null;
}

/** Vértices por ângulo, de 60 em 60 graus a partir de menos 90 (topo pontudo). */
function hexPath(cx: number, cy: number, radius: number): string {
  const vertices: string[] = [];
  for (let vertex = 0; vertex < HEX_VERTICES; vertex += 1) {
    const angle = ((-90 + vertex * 60) * Math.PI) / 180;
    const vx = Math.round((cx + radius * Math.cos(angle)) * 100) / 100;
    const vy = Math.round((cy + radius * Math.sin(angle)) * 100) / 100;
    vertices.push(`${String(vx)},${String(vy)}`);
  }
  return `M${vertices.join('L')}Z`;
}

function hexCenterX(col: number, row: number): number {
  return PLOT_X + HEX_DX / 2 + col * HEX_DX + (row % 2 === 1 ? HEX_DX / 2 : 0);
}

function hexCenterY(row: number): number {
  return PLOT_Y + HEX_R + row * HEX_DY;
}

function bandOf(count: number, limits: readonly number[]): number {
  for (let band = 0; band < limits.length; band += 1) {
    const limit = limits[band];
    if (limit !== undefined && count <= limit) return band;
  }
  return limits.length - 1;
}

export default function InteractionQuantileHexbin({
  data = defaultData,
  caption = defaultCaption,
  height,
  className,
}: InteractionQuantileHexbinProps) {
  const style = height === undefined ? undefined : { height };
  const counts = data.map((bin) => bin.count);
  const total = sumOf(counts);
  /** Os dois cortes de tercil e o máximo observado, que fecha a faixa de cima (ROT-5b). */
  const firstCut = quantileOf(counts, 1 / BAND_COUNT);
  const secondCut = quantileOf(counts, 2 / BAND_COUNT);
  const maxCount = quantileOf(counts, 1);

  if (total === null || firstCut === null || secondCut === null || maxCount === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma interação neste recorte com tempo e rolagem medidos: a rede não tem o que contar.</span>
      </div>
    );
  }

  const limits = [firstCut, secondCut, maxCount];
  const smallest = quantileOf(counts, 0) ?? 1;
  const scaleSeconds = (value: number) => PLOT_X + (value / SECONDS_MAX) * PLOT_W;
  const scaleScroll = (value: number) => PLOT_Y + PLOT_H - (value / SCROLL_MAX) * PLOT_H;

  let leader = data[0];
  for (const bin of data) if (leader === undefined || bin.count > leader.count) leader = bin;
  if (leader === undefined) return null;

  /** A frase acessível repete esta linha inteira, para o número não sair com duas aparências. */
  const readingLine =
    `Hexágono mais cheio: ${formatInt(leader.count)} interações, ${formatPercent(leader.count / total, 0)} do total, ` +
    `um entre ${formatInt(data.length)} células com dado`;
  const summary =
    `Hexbin de densidade por quantis com ${formatInt(data.length)} hexágonos preenchidos e ${formatInt(total)} ` +
    `${caption}, por tempo e rolagem. ${readingLine}.`;

  const leaderX = hexCenterX(leader.col, leader.row);
  const leaderY = hexCenterY(leader.row);

  return (
    <svg
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="img"
      style={style}
      viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}
    >
      {/* Linha de leitura (ANO-5): a conclusão sai calculada do dado, e a frase acessível repete a mesma. */}
      <text aria-hidden className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={12} x={PLOT_X} y={13}>
        {readingLine}
      </text>
      <text aria-hidden className="font-sans tabular-nums" fill="var(--text-muted)" fontSize={11} x={PLOT_X} y={29}>
        Rolagem da página, 0 a 100% ↑
      </text>

      {/* Grade nos dois sentidos (EIX-3b): tempo e rolagem são as duas grandezas lidas por posição. */}
      {TICKS_SECONDS.map((tick) => (
        <g key={`seg-${String(tick)}`}>
          <line
            stroke="var(--line-subtle)"
            x1={scaleSeconds(tick)}
            x2={scaleSeconds(tick)}
            y1={PLOT_Y}
            y2={PLOT_Y + PLOT_H}
          />
          <text
            className="font-display"
            fill="var(--text-muted)"
            fontSize={11}
            textAnchor="middle"
            x={scaleSeconds(tick)}
            y={PLOT_Y + PLOT_H + 16}
          >
            {formatInt(tick)}
          </text>
        </g>
      ))}
      {TICKS_SCROLL.map((tick) => (
        <g key={`rol-${String(tick)}`}>
          <line
            stroke="var(--line-subtle)"
            x1={PLOT_X}
            x2={PLOT_X + PLOT_W}
            y1={scaleScroll(tick)}
            y2={scaleScroll(tick)}
          />
          <text
            className="font-display"
            dominantBaseline="central"
            fill="var(--text-muted)"
            fontSize={11}
            textAnchor="end"
            x={PLOT_X - 6}
            y={scaleScroll(tick)}
          >
            {formatInt(tick)}
          </text>
        </g>
      ))}
      <text
        aria-hidden
        className="font-sans tabular-nums"
        fill="var(--text-muted)"
        fontSize={11}
        textAnchor="middle"
        x={PLOT_X + PLOT_W / 2}
        y={PLOT_Y + PLOT_H + 32}
      >
        Segundos na página, 0 a 120 →
      </text>

      {/* Um hexágono por célula com interação. Célula ausente do dado não entra aqui: hexágono não
          desenhado quer dizer ausência, e é por isso que nenhuma faixa pode sumir contra o cartão. */}
      {data.map((bin) => {
        const band = bandOf(bin.count, limits);
        return (
          <path
            d={hexPath(hexCenterX(bin.col, bin.row), hexCenterY(bin.row), HEX_R * (BAND_RADIUS[band] ?? 1))}
            fill={BAND_COLORS[band] ?? BAND_COLORS[0]}
            key={`hex-${String(bin.col)}-${String(bin.row)}`}
            stroke="var(--surface-raised)"
            strokeWidth={1}
          />
        );
      })}

      {/* A contagem escrita no hexágono dominante, com halo (ROT-7), porque é o número que a escala por
          quantil esconde: na cor, o dominante e o terceiro colocado caem no mesmo degrau. O halo não
          apaga marca aqui porque o hexágono tem 24 px de altura, bem acima dos 18 px da GEO-4. */}
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-primary)"
        fontSize={11}
        style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
        x={leaderX + HEX_R + LABEL_GAP}
        y={leaderY}
      >
        {formatInt(leader.count)} interações
      </text>

      {/* Legenda em linha (ROT-4): três faixas de posição fixa, com a contagem de cada uma escrita, e a
          palavra "quantil" dita, porque degraus de quantil não têm largura comparável entre si. */}
      <text className="font-sans" fill="var(--text-secondary)" fontSize={12} x={PANEL_X} y={44}>
        Interações no hexágono
      </text>
      {BAND_NAMES.map((name, band) => {
        const cx = PANEL_X + 12 + band * PANEL_SWATCH_STEP;
        const from = band === 0 ? smallest : (limits[band - 1] ?? 0) + 1;
        const to = limits[band] ?? maxCount;
        return (
          <g key={`faixa-${name}`}>
            <path
              d={hexPath(cx, PANEL_SWATCH_CY, HEX_R * (BAND_RADIUS[band] ?? 1))}
              fill={BAND_COLORS[band] ?? BAND_COLORS[0]}
              stroke="var(--surface-raised)"
              strokeWidth={1}
            />
            <text className="font-display" fill="var(--text-secondary)" fontSize={11} textAnchor="middle" x={cx} y={100}>
              {formatInt(from)} a {formatInt(to)}
            </text>
            <text className="font-sans tabular-nums" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={116}>
              {name}
            </text>
          </g>
        );
      })}
      <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={11} x={PANEL_X} y={140}>
        degraus por quantil: cada faixa reúne
      </text>
      <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={11} x={PANEL_X} y={156}>
        um terço das células, não da contagem,
      </text>
      <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={11} x={PANEL_X} y={172}>
        e a largura dos degraus não se compara
      </text>

      <text className="kpi-number font-semibold" fill="var(--text-primary)" fontSize={14} x={PANEL_X} y={200}>
        {formatInt(total)}
      </text>
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={PANEL_X} y={218}>
        {caption}
      </text>
    </svg>
  );
}
