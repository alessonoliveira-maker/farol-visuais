import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatHours, formatInt, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  DAY_LABELS,
  DAY_ORDER,
  HOURS,
  SAMPLE_FLOOR,
  sdrs as defaultSdrs,
  windowCaption as defaultCaption,
  type AgendaCell,
  type Sdr,
  type WeekDay,
} from './data';

/**
 * Oito grades de agendas marcadas, uma por pessoa da pré-vendas, no mesmo domínio.
 *
 * A escala tem TRÊS faixas, e não cinco como a v1 deste modelo, por uma razão de medição e não de
 * gosto. Com 480 células não há onde escrever o valor de cada uma, então aqui a cor é o único canal
 * de grandeza, e a `TOK-8` do ARMADILHAS.md é literal: só `--seq-5`, `--seq-6` e `--seq-7` passam de
 * 3:1 contra o cartão nos dois temas (4,89 e 3,72; 6,96 e 5,45; 10,12 e 8,29). Uma quarta faixa
 * cairia em `--seq-4`, que mede 3,38:1 no escuro e 2,60:1 no claro e desapareceria no tema claro. O
 * que compensa a perda de degraus é a FAIXA NOMEADA: cada amostra da legenda traz o intervalo de
 * contagem escrito ao lado, e cada painel escreve o próprio total, então a ordem não depende de
 * distinguir azul de azul.
 *
 * Quatro estados de célula, com canais diferentes, porque célula não desenhada é ausência e
 * ausência não é zero (EST-2, DAD-2): a partir de `SAMPLE_FLOOR` a célula é pintada na faixa; de 1
 * até o piso ela é hachurada, porque a amostra existe e não sustenta leitura de intensidade; zero
 * medido é o poço `--surface-sunken` com contorno sólido; hora fora da escala é contorno tracejado,
 * sem preenchimento.
 *
 * O `viewBox` sai no tamanho exato do corpo do cartão, para as guardas `COLISAO-TEXTO` e
 * `CONTRASTE-TEXTO` medirem a peça em vez de saírem com `preview_com_escala`.
 */
export interface SdrAgendaSmallMultiplesProps {
  readonly data?: readonly AgendaCell[];
  readonly sdrs?: readonly Sdr[];
  /** O que a célula mede, impresso na legenda e na frase acessível. */
  readonly caption?: string;
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 894;
const VIEW_H = 371.5;
const RIGHT_PAD = 2;
/** Recuo do texto encostado na esquerda: a tinta do primeiro glifo passa da âncora (ESP-3). */
const TEXT_LEFT = 4;
const LEFT_W = 50;
const GAP = 1;
const COLUMNS = 4;
const COL_GAP = 16;
const ROW_GAP = 16;
const PANEL_AREA_TOP = 52;
const PANEL_H = 121;
const PANEL_GRID_TOP = 20;
const PANEL_GRID_H = 85;
const DAY_COUNT = 5;
const HOUR_COUNT = 12;
const HOUR_LABEL_STEP = 3;
const PANEL_W = (VIEW_W - RIGHT_PAD - LEFT_W - (COLUMNS - 1) * COL_GAP) / COLUMNS;
const CELL_W = (PANEL_W - (HOUR_COUNT - 1) * GAP) / HOUR_COUNT;
const CELL_H = (PANEL_GRID_H - (DAY_COUNT - 1) * GAP) / DAY_COUNT;
const READ_BASELINE = 12;
const SCALE_TOP = 24;
const SCALE_H = 12;
const SCALE_SWATCH_W = 22;
const SCALE_BLOCK_W = 80;
const FOOT_ONE = 330;
const FOOT_TWO = 347;
const FOOT_SWATCH_W = 16;
const FOOT_SWATCH_H = 12;
/** Cortes de hora que a linha de leitura usa: manhã até 11h, tarde depois das 16h. */
const EARLY_CUT = 11;
const LATE_CUT = 16;

/** As três faixas que passam de 3:1 contra o cartão nos dois temas (TOK-8). */
const BAND_COLORS = [
  CHART_SEQUENTIAL_COLORS[4],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const BAND_COUNT = BAND_COLORS.length;

/** Maior valor de uma lista: `null` na lista vazia, porque `Math.max` de nada devolve infinito. */
function maxOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((champion, value) => (value > champion ? value : champion), values[0] ?? 0);
}

function sumOf(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}

/** Borda inferior da faixa `index`, com a última terminando no máximo observado (ROT-5b). */
function bandEdge(index: number, ceiling: number): number {
  const span = ceiling - SAMPLE_FLOOR + 1;
  return SAMPLE_FLOOR + Math.round((index * span) / BAND_COUNT);
}

function bandOf(value: number, ceiling: number): number {
  for (let index = BAND_COUNT - 1; index > 0; index -= 1) {
    if (value >= bandEdge(index, ceiling)) return index;
  }
  return 0;
}

/** Uma pessoa com o total do trimestre e as duas parcelas que a linha de leitura compara. */
interface PanelStat {
  readonly sdr: Sdr;
  readonly total: number;
  readonly early: number;
  readonly late: number;
}

function panelX(column: number): number {
  return LEFT_W + column * (PANEL_W + COL_GAP);
}

function panelY(row: number): number {
  return PANEL_AREA_TOP + row * (PANEL_H + ROW_GAP);
}

export default function SdrAgendaSmallMultiples({
  data = defaultData,
  sdrs = defaultSdrs,
  caption = defaultCaption,
  height,
  className,
}: SdrAgendaSmallMultiplesProps) {
  const measured = data.filter((cell): cell is AgendaCell & { value: number } => cell.value !== null);
  const ceiling = maxOf(measured.map((cell) => cell.value));

  if (ceiling === null || sdrs.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma hora medida neste recorte: as grades não têm o que colorir.</span>
      </div>
    );
  }

  const byKey = new Map<string, number | null>();
  for (const cell of data) byKey.set(`${cell.sdrId}-${cell.day}-${String(cell.hour)}`, cell.value);

  const panels = sdrs
    .map((sdr) => {
      const own = measured.filter((cell) => cell.sdrId === sdr.id);
      const total = sumOf(own.map((cell) => cell.value));
      const early = sumOf(own.filter((cell) => cell.hour < EARLY_CUT).map((cell) => cell.value));
      const late = sumOf(own.filter((cell) => cell.hour > LATE_CUT).map((cell) => cell.value));
      return { sdr, total, early, late };
    })
    .sort((left, right) => right.total - left.total);

  let earliest: PanelStat | undefined;
  let latest: PanelStat | undefined;
  for (const panel of panels) {
    if (panel.total <= 0) continue;
    if (earliest === undefined || panel.early / panel.total > earliest.early / earliest.total) earliest = panel;
    if (latest === undefined || panel.late / panel.total < latest.late / latest.total) latest = panel;
  }

  if (earliest === undefined || latest === undefined) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma pessoa com agenda marcada neste recorte.</span>
      </div>
    );
  }

  const earlyShare = formatRateWithVolume(earliest.early, earliest.total);
  const lateShare = formatRateWithVolume(latest.late, latest.total);
  const highlighted = new Set<string>([earliest.sdr.id, latest.sdr.id]);

  const summary =
    `Pequenos múltiplos: ${formatInt(panels.length)} mapas de calor de ${formatInt(DAY_COUNT)} dias por ${formatInt(HOUR_COUNT)} horas com as agendas marcadas por pessoa, no mesmo domínio. ` +
    `${earliest.sdr.name} concentra ${earlyShare} antes das ${formatHours(EARLY_CUT)}; ` +
    `${latest.sdr.name} fica em ${lateShare} depois das ${formatHours(LATE_CUT)}.`;

  return (
    <div
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="img"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <text className="tabular-nums" fill="var(--text-secondary)" fontSize={12} x={TEXT_LEFT} y={READ_BASELINE}>
          <tspan className="font-semibold" fill="var(--text-primary)">
            {earliest.sdr.name}
          </tspan>{' '}
          concentra {earlyShare} das agendas antes das {formatHours(EARLY_CUT)}, a maior parcela;{' '}
          <tspan className="font-semibold" fill="var(--text-primary)">
            {latest.sdr.name}
          </tspan>{' '}
          fica em {lateShare} depois das {formatHours(LATE_CUT)}, a menor.
        </text>

        {BAND_COLORS.map((color, index) => {
          const x = TEXT_LEFT + index * SCALE_BLOCK_W;
          const floor = bandEdge(index, ceiling);
          const roof = index === BAND_COUNT - 1 ? ceiling : bandEdge(index + 1, ceiling) - 1;
          return (
            <g key={`band-${String(index)}`}>
              <rect fill={color} height={SCALE_H} rx={2} width={SCALE_SWATCH_W} x={x} y={SCALE_TOP} />
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize={11}
                x={x + SCALE_SWATCH_W + 6}
                y={SCALE_TOP + SCALE_H / 2}
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
          x={TEXT_LEFT + BAND_COUNT * SCALE_BLOCK_W + 10}
          y={SCALE_TOP + SCALE_H / 2}
        >
          {caption}
        </text>

        {[0, 1].map((row) =>
          DAY_ORDER.map((day: WeekDay, dayIndex) => (
            <text
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={11}
              key={`day-${String(row)}-${day}`}
              textAnchor="end"
              x={LEFT_W - 6}
              y={panelY(row) + PANEL_GRID_TOP + dayIndex * (CELL_H + GAP) + CELL_H / 2}
            >
              {DAY_LABELS[day]}
            </text>
          )),
        )}

        {panels.map((panel, panelIndex) => {
          const column = panelIndex % COLUMNS;
          const row = Math.floor(panelIndex / COLUMNS);
          const originX = panelX(column);
          const originY = panelY(row);
          const strong = highlighted.has(panel.sdr.id);
          return (
            <g key={panel.sdr.id}>
              <text
                fill="var(--text-primary)"
                fontSize={12}
                fontWeight={strong ? 700 : 500}
                x={originX}
                y={originY + 12}
              >
                {panel.sdr.name}
              </text>
              <text
                className="font-display tabular-nums"
                fill="var(--text-muted)"
                fontSize={11}
                textAnchor="end"
                x={originX + PANEL_W}
                y={originY + 12}
              >
                {formatInt(panel.total)} agendas
              </text>
              {DAY_ORDER.flatMap((day: WeekDay, dayIndex) =>
                HOURS.map((hour, hourIndex) => {
                  const value = byKey.get(`${panel.sdr.id}-${day}-${String(hour)}`) ?? null;
                  const x = originX + hourIndex * (CELL_W + GAP);
                  const y = originY + PANEL_GRID_TOP + dayIndex * (CELL_H + GAP);
                  const key = `${panel.sdr.id}-${day}-${String(hour)}`;
                  if (value === null) {
                    return (
                      <rect
                        fill="none"
                        height={CELL_H}
                        key={key}
                        rx={1}
                        stroke="var(--text-muted)"
                        strokeDasharray="2 2"
                        width={CELL_W}
                        x={x}
                        y={y}
                      />
                    );
                  }
                  if (value === 0) {
                    return (
                      <rect
                        fill="var(--surface-sunken)"
                        height={CELL_H}
                        key={key}
                        rx={1}
                        stroke="var(--text-muted)"
                        width={CELL_W}
                        x={x}
                        y={y}
                      />
                    );
                  }
                  if (value < SAMPLE_FLOOR) {
                    return (
                      <g key={key}>
                        <line
                          stroke="var(--text-muted)"
                          x1={x + CELL_W * 0.12}
                          x2={x + CELL_W * 0.56}
                          y1={y + CELL_H * 0.88}
                          y2={y + CELL_H * 0.12}
                        />
                        <line
                          stroke="var(--text-muted)"
                          x1={x + CELL_W * 0.44}
                          x2={x + CELL_W * 0.88}
                          y1={y + CELL_H * 0.88}
                          y2={y + CELL_H * 0.12}
                        />
                      </g>
                    );
                  }
                  return (
                    <rect
                      fill={BAND_COLORS[bandOf(value, ceiling)]}
                      height={CELL_H}
                      key={key}
                      rx={1}
                      width={CELL_W}
                      x={x}
                      y={y}
                    />
                  );
                }),
              )}
              {HOURS.map((hour, hourIndex) =>
                hourIndex % HOUR_LABEL_STEP === 0 ? (
                  <text
                    className="font-display tabular-nums"
                    fill="var(--text-muted)"
                    fontSize={11}
                    key={`hour-${panel.sdr.id}-${String(hour)}`}
                    textAnchor="middle"
                    x={originX + hourIndex * (CELL_W + GAP) + CELL_W / 2}
                    y={originY + PANEL_H - 2}
                  >
                    {formatHours(hour)}
                  </text>
                ) : null,
              )}
            </g>
          );
        })}

        <g>
          <line
            stroke="var(--text-muted)"
            x1={TEXT_LEFT + FOOT_SWATCH_W * 0.12}
            x2={TEXT_LEFT + FOOT_SWATCH_W * 0.56}
            y1={FOOT_ONE + FOOT_SWATCH_H / 2}
            y2={FOOT_ONE - FOOT_SWATCH_H / 2}
          />
          <line
            stroke="var(--text-muted)"
            x1={TEXT_LEFT + FOOT_SWATCH_W * 0.44}
            x2={TEXT_LEFT + FOOT_SWATCH_W * 0.88}
            y1={FOOT_ONE + FOOT_SWATCH_H / 2}
            y2={FOOT_ONE - FOOT_SWATCH_H / 2}
          />
        </g>
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={TEXT_LEFT + FOOT_SWATCH_W + 6} y={FOOT_ONE}>
          hachura: menos de {formatInt(SAMPLE_FLOOR)} agendas, amostra baixa para intensidade
        </text>
        <rect
          fill="var(--surface-sunken)"
          height={FOOT_SWATCH_H}
          rx={1}
          stroke="var(--text-muted)"
          width={FOOT_SWATCH_W}
          x={368}
          y={FOOT_ONE - FOOT_SWATCH_H / 2}
        />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={390} y={FOOT_ONE}>
          zero medido
        </text>
        <rect
          fill="none"
          height={FOOT_SWATCH_H}
          rx={1}
          stroke="var(--text-muted)"
          strokeDasharray="2 2"
          width={FOOT_SWATCH_W}
          x={470}
          y={FOOT_ONE - FOOT_SWATCH_H / 2}
        />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={492} y={FOOT_ONE}>
          {formatUnavailable()}: fora da escala nesta hora
        </text>
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={TEXT_LEFT} y={FOOT_TWO}>
          Sábado e domingo ficam fora da grade: a pré-vendas não atende no fim de semana. Grades ordenadas pelo total do
          trimestre, da maior para a menor.
        </text>
      </svg>
    </div>
  );
}
