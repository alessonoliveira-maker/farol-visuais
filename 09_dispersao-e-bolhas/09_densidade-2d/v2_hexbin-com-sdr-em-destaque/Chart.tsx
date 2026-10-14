import { Filter } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  sdrLeads as defaultSdrLeads,
  sdrName as defaultSdrName,
  totalCaption as defaultCaption,
  type SdrLead,
  type TeamHexBin,
} from './data';

/**
 * Densidade 2D em rede hexagonal, com uma camada de pontos individuais por cima. A rede é montada em
 * PIXEL, não em domínio: o passo horizontal vale a largura de um hexágono de topo pontudo e o vertical
 * três quartos da altura dele, que é o que faz os hexágonos encaixarem sem vão nem sobreposição. Os
 * seis vértices saem de ângulo, de 60 em 60 graus a partir de menos 90, porque coordenada escrita à
 * mão é o caminho curto para um hexágono que não fecha.
 *
 * Por que a escala de cor tem três degraus e não sete. Medido em 2026-09-28 contra o fundo do cartão,
 * só `--seq-5`, `--seq-6` e `--seq-7` passam de 3:1 nos dois temas; os quatro primeiros degraus ficam
 * entre 1,14:1 e 3,38:1 no escuro e entre 1,21:1 e 2,60:1 no claro. Num modelo em que hexágono não
 * desenhado QUER DIZER ausência de lead, um degrau invisível não é feiura: ele mente, porque a
 * contagem baixa passa a ler como vazio. Os três degraus úteis, por sua vez, medem 1,42:1 e 1,45:1
 * ENTRE SI, então a cor sozinha também não ordena; por isso o raio do hexágono repete a faixa, a
 * legenda escreve a contagem de cada uma e a posição delas na legenda é fixa.
 */
export interface TeamHexbinProps {
  readonly data?: readonly TeamHexBin[];
  /** Os leads da pessoa em destaque, desenhados um por um sobre a densidade do time. */
  readonly highlightLeads?: readonly SdrLead[];
  /** Nome de quem está em destaque, escrito na legenda. */
  readonly highlightName?: string;
  /** O que o total conta e em que período ("leads do time no semestre"). */
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
const SCORE_MAX = 100;
const TICKS = [0, 25, 50, 75, 100] as const;
/** Os três degraus que passam de 3:1 contra o cartão nos dois temas (ver o comentário do topo). */
const BAND_COLORS = ['var(--seq-5)', 'var(--seq-6)', 'var(--seq-7)'] as const;
const BAND_NAMES = ['baixa', 'média', 'alta'] as const;
/** Fator de raio por faixa: canal redundante da ordem, não codificação de área. Nenhuma
 * proporcionalidade é afirmada, e por isso a legenda escreve a contagem em vez de sugerir escala. */
const BAND_RADIUS = [0.62, 0.82, 1] as const;
const BAND_COUNT = 3;
const HIGHLIGHT_FILL = 'var(--chart-1)';
const HIGHLIGHT_R = 4;
/** Anel na cor do cartão, e ele carrega a leitura em vez de decorar: medido em 2026-09-28,
 * `--chart-1` mede 1,10:1 contra `--seq-6` no tema claro e 1,07:1 contra `--seq-7` no escuro, e
 * nenhuma das oito cores categóricas do Farol passa de 1,16:1 contra os três degraus. O anel mede
 * de 3,72:1 a 10,12:1, então é ele que separa o ponto do hexágono debaixo. */
const HIGHLIGHT_RING = 'var(--surface-raised)';
const HIGHLIGHT_RING_W = 1.5;
const PANEL_X = 262;
const PANEL_SWATCH_STEP = 70;
const PANEL_SWATCH_CY = 74;

/** Soma que devolve null em lista vazia (EST-1b): ausência é do tipo, nunca zero. */
function sumOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0);
}

/** Máximo que devolve null em lista vazia: `Math.max` de lista vazia devolve infinito, e infinito desenha. */
function maxOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return Math.max(...values);
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

/**
 * Limites das três faixas tirados do máximo OBSERVADO, em degraus iguais na RAIZ da contagem e não em
 * terços do máximo: numa densidade a cauda é longa, e terços iguais jogariam quase todas as células na
 * faixa de baixo. A faixa de cima termina no máximo do recorte (ROT-5b).
 */
function bandLimits(maxCount: number): readonly number[] {
  const root = Math.sqrt(maxCount);
  return [Math.round((root / BAND_COUNT) ** 2), Math.round(((2 * root) / BAND_COUNT) ** 2), maxCount];
}

function bandOf(count: number, limits: readonly number[]): number {
  for (let band = 0; band < limits.length; band += 1) {
    const limit = limits[band];
    if (limit !== undefined && count <= limit) return band;
  }
  return limits.length - 1;
}

/** O hexágono da rede mais próximo de um ponto, pela distância em pixel: é assim que a rede agrega. */
function nearestHex(px: number, py: number): string {
  let key = '';
  let best = Number.POSITIVE_INFINITY;
  for (let row = 0; row < HEX_ROWS; row += 1) {
    const cols = row % 2 === 1 ? HEX_COLS - 1 : HEX_COLS;
    for (let col = 0; col < cols; col += 1) {
      const distance = (hexCenterX(col, row) - px) ** 2 + (hexCenterY(row) - py) ** 2;
      if (distance < best) {
        best = distance;
        key = `${String(col)}-${String(row)}`;
      }
    }
  }
  return key;
}

export default function TeamHexbin({
  data = defaultData,
  highlightLeads = defaultSdrLeads,
  highlightName = defaultSdrName,
  caption = defaultCaption,
  height,
  className,
}: TeamHexbinProps) {
  const style = height === undefined ? undefined : { height };
  const counts = data.map((bin) => bin.count);
  const total = sumOf(counts);
  const maxCount = maxOf(counts);

  if (total === null || maxCount === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead do time neste recorte com fit e engajamento pontuados: a rede não tem o que contar.</span>
      </div>
    );
  }

  const limits = bandLimits(maxCount);
  const scaleFit = (value: number) => PLOT_X + (value / SCORE_MAX) * PLOT_W;
  const scaleEng = (value: number) => PLOT_Y + PLOT_H - (value / SCORE_MAX) * PLOT_H;

  const bandByKey = new Map<string, number>();
  for (const bin of data) bandByKey.set(`${String(bin.col)}-${String(bin.row)}`, bandOf(bin.count, limits));

  const topBand = BAND_COUNT - 1;
  let inTopBand = 0;
  let outsideMass = 0;
  for (const lead of highlightLeads) {
    const band = bandByKey.get(nearestHex(scaleFit(lead.fit), scaleEng(lead.engajamento)));
    if (band === undefined) outsideMass += 1;
    else if (band === topBand) inTopBand += 1;
  }
  const inOtherBands = highlightLeads.length - inTopBand - outsideMass;

  /** A frase acessível repete esta linha inteira, e não uma versão sua: assim o número não sai com
   * duas aparências para quem ouve e para quem enxerga. O teto é de 250 caracteres (ACE-1). */
  const readingLine =
    `${formatInt(highlightLeads.length)} leads de ${highlightName}: ${formatInt(inTopBand)} na faixa alta do time, ` +
    `${formatInt(inOtherBands)} nas demais, ${formatInt(outsideMass)} fora da massa`;
  const summary =
    `Hexbin de densidade com ${formatInt(data.length)} hexágonos preenchidos e ${formatInt(total)} ${caption}, por ` +
    `fit e engajamento. O hexágono mais cheio tem ${formatInt(maxCount)} leads. ${readingLine}.`;

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
        Engajamento, 0 a 100 ↑
      </text>

      {/* Grade nos dois sentidos (EIX-3b): fit e engajamento são as duas grandezas lidas por posição. */}
      {TICKS.map((tick) => {
        const x = scaleFit(tick);
        const y = scaleEng(tick);
        return (
          <g key={`grade-${String(tick)}`}>
            <line stroke="var(--line-subtle)" x1={x} x2={x} y1={PLOT_Y} y2={PLOT_Y + PLOT_H} />
            <line stroke="var(--line-subtle)" x1={PLOT_X} x2={PLOT_X + PLOT_W} y1={y} y2={y} />
            <text
              className="font-display"
              fill="var(--text-muted)"
              fontSize={11}
              textAnchor="middle"
              x={x}
              y={PLOT_Y + PLOT_H + 16}
            >
              {formatInt(tick)}
            </text>
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              textAnchor="end"
              x={PLOT_X - 6}
              y={y}
            >
              {formatInt(tick)}
            </text>
          </g>
        );
      })}
      <text
        aria-hidden
        className="font-sans tabular-nums"
        fill="var(--text-muted)"
        fontSize={11}
        textAnchor="middle"
        x={PLOT_X + PLOT_W / 2}
        y={PLOT_Y + PLOT_H + 32}
      >
        Fit, 0 a 100 →
      </text>

      {/* Um hexágono por célula com lead. Célula ausente do dado não entra aqui: no modelo, hexágono
          não desenhado quer dizer ausência, e é por isso que nenhuma faixa pode sumir contra o cartão. */}
      {data.map((bin) => {
        const band = bandOf(bin.count, limits);
        const factor = BAND_RADIUS[band] ?? 1;
        return (
          <path
            d={hexPath(hexCenterX(bin.col, bin.row), hexCenterY(bin.row), HEX_R * factor)}
            fill={BAND_COLORS[band] ?? BAND_COLORS[0]}
            key={`hex-${String(bin.col)}-${String(bin.row)}`}
            stroke="var(--surface-raised)"
            strokeWidth={1}
          />
        );
      })}

      {/* Camada de pontos da pessoa em destaque, por cima da densidade. O anel na cor do cartão é o que
          separa o ponto do hexágono debaixo: cor contra cor não passa de 1,16:1 em nenhuma combinação. */}
      {highlightLeads.map((lead) => (
        <circle
          cx={scaleFit(lead.fit)}
          cy={scaleEng(lead.engajamento)}
          fill={HIGHLIGHT_FILL}
          key={`destaque-${String(lead.fit)}-${String(lead.engajamento)}`}
          r={HIGHLIGHT_R}
          stroke={HIGHLIGHT_RING}
          strokeWidth={HIGHLIGHT_RING_W}
        />
      ))}

      {/* Legenda em linha (ROT-4): três faixas de posição fixa, cada uma com a contagem escrita, porque
          a cor não ordena sozinha. A de cima termina no máximo do recorte, nunca numa constante. */}
      <text className="font-sans" fill="var(--text-secondary)" fontSize={12} x={PANEL_X} y={44}>
        Leads no hexágono
      </text>
      {BAND_NAMES.map((name, band) => {
        const cx = PANEL_X + 12 + band * PANEL_SWATCH_STEP;
        const from = band === 0 ? 1 : (limits[band - 1] ?? 0) + 1;
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
            <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={116}>
              {name}
            </text>
          </g>
        );
      })}
      <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={11} x={PANEL_X} y={134}>
        degraus iguais na raiz da contagem,
      </text>
      <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={11} x={PANEL_X} y={150}>
        não faixas de igual largura
      </text>

      <circle
        cx={PANEL_X + 12}
        cy={174}
        fill={HIGHLIGHT_FILL}
        r={HIGHLIGHT_R}
        stroke={HIGHLIGHT_RING}
        strokeWidth={HIGHLIGHT_RING_W}
      />
      <text
        className="font-sans tabular-nums"
        dominantBaseline="central"
        fill="var(--text-secondary)"
        fontSize={11}
        x={PANEL_X + 30}
        y={174}
      >
        {formatInt(highlightLeads.length)} leads de {highlightName}
      </text>

      <text className="kpi-number font-semibold" fill="var(--text-primary)" fontSize={14} x={PANEL_X} y={204}>
        {formatInt(total)}
      </text>
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={PANEL_X} y={222}>
        {caption}
      </text>
    </svg>
  );
}
