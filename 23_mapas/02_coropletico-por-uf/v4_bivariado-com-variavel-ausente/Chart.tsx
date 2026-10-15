import { Filter } from 'lucide-react';
import { useId } from 'react';

import { formatCurrency, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, HEX_GRID, type UfCode, type UfMedia } from './data';

/**
 * Coroplético bivariado por UF sobre malha de hexágonos: cada UF é pintada pela combinação de duas
 * classes independentes, a do CPL qualificado e a da taxa de qualificação, 3 por variável, numa
 * paleta 3x3 com legenda própria. UF sem mídia paga fica fora da paleta, em hachura, e UF com menos
 * de 30 leads leva contorno pontilhado. Apoia a decisão de onde o custo por lead qualificado é alto
 * e a qualificação é baixa ao mesmo tempo.
 */
export interface BivariateChoroplethProps {
  readonly data?: readonly UfMedia[];
  readonly height?: number;
  readonly className?: string;
}

const CLASS_COUNT = 3;
/** Abaixo deste volume de leads a classe é escrita, mas a UF leva contorno pontilhado. */
const MIN_SAMPLE = 30;
/** Linhas da tabela do canto que a pergunta procura (taxa baixa com CPL alto). */
const FOCUS_ROWS = 4;
/** Largura da célula hexagonal, de ponta para cima. Dentro vão a sigla, a taxa e o CPL escritos: o valor é o que sustenta a classe nas células tênues (ACE-3). */
const HEX_W = 62;
const HEX_GAP = 2;
const HEX_R = HEX_W / Math.sqrt(3);
const HEX_DRAWN_R = HEX_R - HEX_GAP / Math.sqrt(3);
const ROW_PITCH = HEX_R * 1.5;
const PAD = 2;
const LABEL_SIZE = 12;
const NOTE_SIZE = 11;
/** Passo entre as linhas do hexágono classificado: taxa no centro, sigla acima e CPL abaixo, todas dentro da faixa mais larga do hexágono. */
const VALUE_STEP = 14;
/** Recuo do preenchimento na UF de amostra pequena: abre o canal onde corre o contorno pontilhado. */
const THIN_INSET = 4;
const HATCH_SIZE = 6;
const SWATCH_W = 14;
const SWATCH_H = 16;
/** Legenda 3x3, em escala 1: célula, vão, margem dos limites da taxa e faixa do nome de cada eixo. */
const LEGEND_CELL = 44;
const LEGEND_GAP = 2;
const LEGEND_LEFT = 44;
const LEGEND_TOP = 18;
const LEGEND_RIGHT = 20;
const LEGEND_GRID = CLASS_COUNT * LEGEND_CELL + (CLASS_COUNT - 1) * LEGEND_GAP;
const LEGEND_W = LEGEND_LEFT + LEGEND_GRID + LEGEND_RIGHT;
/** Linha de base do nome do eixo do CPL, abaixo dos limites escritos na divisa. */
const AXIS_NAME_Y = LEGEND_TOP + LEGEND_GRID + 27;
const LEGEND_H = AXIS_NAME_Y + 4;

/**
 * A única constante que sabe a paleta 3x3, lida como PALETTE[classe do CPL][classe da taxa], de 0
 * (baixa) a 2 (alta). O Farol não tem tokens bivariados: o CPL sobe em --chart-5, a taxa em --chart-1
 * e os dois juntos em --chart-7, que é a mistura dos outros dois. O canto baixo e baixo fica perto do
 * cartão e o alto e alto é o tom mais forte. Só existem dois regimes de luminância, tênue (mistura de
 * até 40% com o cartão, texto principal) e cheio (texto vazado), porque no meio do caminho nenhum
 * texto alcança 4,5:1 nos dois temas (a mesma lacuna da TOK-2).
 */
const PALETTE: readonly (readonly string[])[] = [
  [
    'color-mix(in srgb, var(--chart-7) 14%, var(--surface-raised))',
    'color-mix(in srgb, var(--chart-1) 40%, var(--surface-raised))',
    'var(--chart-1)',
  ],
  [
    'color-mix(in srgb, var(--chart-5) 40%, var(--surface-raised))',
    'color-mix(in srgb, var(--chart-7) 40%, var(--surface-raised))',
    'color-mix(in srgb, var(--chart-1) 50%, var(--chart-7))',
  ],
  [
    'var(--chart-5)',
    'color-mix(in srgb, var(--chart-5) 50%, var(--chart-7))',
    'color-mix(in srgb, var(--text-primary) 35%, var(--chart-7))',
  ],
];

function paletteFill(cplClass: number, rateClass: number): string {
  return PALETTE[cplClass]?.[rateClass] ?? 'var(--surface-raised)';
}

/** Com alguma variável na classe alta a célula é cheia e lê com o texto vazado (5,7:1 ou mais); senão, com o texto principal (5,5:1 ou mais). */
function paletteText(cplClass: number, rateClass: number): string {
  return cplClass === CLASS_COUNT - 1 || rateClass === CLASS_COUNT - 1 ? 'var(--surface-raised)' : 'var(--text-primary)';
}

/** O canto baixo e baixo mede menos de 1,3:1 contra o cartão: o contorno segura a silhueta. */
function paletteStroke(cplClass: number, rateClass: number): string {
  return cplClass === 0 && rateClass === 0 ? 'var(--line-strong)' : paletteFill(cplClass, rateClass);
}

interface HexCell {
  readonly uf: UfCode;
  readonly cx: number;
  readonly cy: number;
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

/** Taxa de qualificação na precisão em que é escrita (uma casa do percentual). UF sem lead é ausência. */
function rateOf(entry: UfMedia): number | null {
  if (entry.leads <= 0) return null;
  return Math.round((entry.qualified / entry.leads) * 1000) / 1000;
}

/**
 * CPL qualificado em reais inteiros, a precisão em que é escrito. Sem mídia paga, ou sem nenhum lead
 * qualificado para dividir, o CPL não é medido: é ausência, nunca custo zero.
 */
function cplOf(entry: UfMedia): number | null {
  if (entry.spend === null || entry.spend <= 0 || entry.qualified <= 0) return null;
  return Math.round(entry.spend / entry.qualified);
}

/**
 * Limite superior de cada tercil dos valores medidos. Cada variável é classificada sozinha, e o
 * limite pertence à classe de baixo, então valores iguais nunca se separam.
 */
function buildTerciles(values: readonly number[]): readonly number[] | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const bounds: number[] = [];
  for (let index = 0; index < CLASS_COUNT; index += 1) {
    const bound = sorted[Math.max(0, Math.ceil(((index + 1) * sorted.length) / CLASS_COUNT) - 1)];
    if (bound !== undefined) bounds.push(bound);
  }
  return bounds;
}

function classOf(value: number, upper: readonly number[]): number {
  for (let index = 0; index < CLASS_COUNT; index += 1) {
    const bound = upper[index];
    if (bound !== undefined && value <= bound) return index;
  }
  return CLASS_COUNT - 1;
}

function ufCount(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'UF' : 'UFs'}`;
}

/** CPL em reais inteiros, sem centavo: o mesmo texto na legenda, na tabela e na frase. */
function money(value: number): string {
  return formatCurrency(value, 0);
}

/** Lista de siglas em prosa: A, B e C. */
function listOf(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1] ?? ''}`;
}

/**
 * Os quatro cantos da legenda, na ordem em que a lista os escreve: primeiro o que a pergunta procura.
 * A sigla CPL vai no fim de cada texto de propósito: o par P e L do Manrope kerna diferente na página
 * e no preview, e o que vem depois dele na linha anda 0,6 px (aviso de fidelidade do render).
 */
const CORNERS: readonly { readonly cpl: number; readonly rate: number; readonly label: string }[] = [
  { cpl: CLASS_COUNT - 1, rate: 0, label: 'taxa baixa, CPL alto' },
  { cpl: CLASS_COUNT - 1, rate: CLASS_COUNT - 1, label: 'taxa alta, CPL alto' },
  { cpl: 0, rate: CLASS_COUNT - 1, label: 'taxa alta, CPL baixo' },
  { cpl: 0, rate: 0, label: 'taxa baixa, CPL baixo' },
];

export default function BivariateChoropleth({ data = defaultData, height, className }: BivariateChoroplethProps) {
  const hatchId = useId();
  const rows = data.map((entry) => ({ entry, rate: rateOf(entry), cpl: cplOf(entry), thin: entry.leads < MIN_SAMPLE }));
  const rateUpper = buildTerciles(rows.flatMap((row) => (row.rate === null ? [] : [row.rate])));
  const cplUpper = buildTerciles(rows.flatMap((row) => (row.cpl === null ? [] : [row.cpl])));

  if (rateUpper === null || cplUpper === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF com taxa e CPL medidos neste recorte: o mapa não tem o que combinar.</span>
      </div>
    );
  }

  // Só entra na paleta quem tem as duas medidas; quem tem só a taxa fica fora dela, em hachura.
  const classed = rows.flatMap((row) =>
    row.rate === null || row.cpl === null
      ? []
      : [{ entry: row.entry, rate: row.rate, cpl: row.cpl, thin: row.thin, rateClass: classOf(row.rate, rateUpper), cplClass: classOf(row.cpl, cplUpper) }],
  );
  const classedByUf = new Map(classed.map((item) => [item.entry.uf, item]));
  const rowByUf = new Map(rows.map((row) => [row.entry.uf, row]));
  const withoutCpl = rows.filter((row) => row.cpl === null).length;
  const thinCount = rows.filter((row) => row.thin).length;
  const countAt = (cplClass: number, rateClass: number) => classed.filter((item) => item.cplClass === cplClass && item.rateClass === rateClass).length;
  // O canto que a pergunta procura: CPL na classe alta e taxa na classe baixa, do maior CPL para o menor.
  const focus = classed.filter((item) => item.cplClass === CLASS_COUNT - 1 && item.rateClass === 0).sort((a, b) => b.cpl - a.cpl);
  const focusTop = focus[0];
  const focusShown = focus.slice(0, FOCUS_ROWS);

  const summary =
    `Mapa coroplético bivariado de CPL qualificado e taxa de qualificação em ${ufCount(classed.length)}, com ${formatInt(CLASS_COUNT)} classes cada. ` +
    (focusTop
      ? `Taxa baixa com CPL alto em ${ufCount(focus.length)}; ${focusTop.entry.name} tem o maior CPL, ${money(focusTop.cpl)}. `
      : 'Nenhuma UF combina taxa baixa com CPL alto. ') +
    `${withoutCpl === 1 ? 'Outra' : 'Outras'} ${ufCount(withoutCpl)} não ${withoutCpl === 1 ? 'tem' : 'têm'} CPL medido e ` +
    `${formatInt(thinCount)} ${thinCount === 1 ? 'tem' : 'têm'} menos de ${formatInt(MIN_SAMPLE)} leads.`;

  const cellX = (cplClass: number) => LEGEND_LEFT + cplClass * (LEGEND_CELL + LEGEND_GAP);
  /** A taxa sobe de baixo para cima na legenda: a classe 0 fica na linha de baixo. */
  const cellY = (rateClass: number) => LEGEND_TOP + (CLASS_COUNT - 1 - rateClass) * (LEGEND_CELL + LEGEND_GAP);
  const renderSwatch = (fill: string, stroke: string) => (
    <svg aria-hidden className="shrink-0" height={SWATCH_H} viewBox={`0 0 ${String(SWATCH_W)} ${String(SWATCH_H)}`} width={SWATCH_W}>
      <polygon fill={fill} points={hexPoints(SWATCH_W / 2, SWATCH_H / 2, SWATCH_W / 2 - 0.5)} stroke={stroke} strokeWidth={1} />
    </svg>
  );

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 items-start gap-4', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      {/* Escala 1: largura e altura iguais ao viewBox, para o texto chegar no tamanho declarado (GEO-18). */}
      <svg aria-hidden className="shrink-0" height={LAYOUT.height} viewBox={`0 0 ${String(LAYOUT.width)} ${String(LAYOUT.height)}`} width={LAYOUT.width}>
        <defs>
          {/* A diagonal é desenhada no próprio ladrilho, sem patternTransform: giro no preview desliga as guardas de texto. */}
          <pattern height={HATCH_SIZE} id={hatchId} patternUnits="userSpaceOnUse" width={HATCH_SIZE}>
            <path
              d={`M-1,1 l2,-2 M0,${String(HATCH_SIZE)} l${String(HATCH_SIZE)},-${String(HATCH_SIZE)} M${String(HATCH_SIZE - 1)},${String(HATCH_SIZE + 1)} l2,-2`}
              stroke="var(--text-muted)"
              strokeWidth={1}
            />
          </pattern>
        </defs>
        {LAYOUT.cells.map((cell) => {
          const row = rowByUf.get(cell.uf);
          // UF que não veio no dado não é desenhada: a malha não inventa medida.
          if (row === undefined) return null;
          const item = classedByUf.get(cell.uf);
          const radius = row.thin ? HEX_DRAWN_R - THIN_INSET : HEX_DRAWN_R - 0.5;
          const volume = `${formatInt(row.entry.qualified)} de ${formatInt(row.entry.leads)} leads`;
          // Amostra pequena: o preenchimento recua e o contorno pontilhado corre sobre o cartão, onde mede 8,1:1.
          const ring = row.thin ? (
            <polygon
              fill="none"
              points={hexPoints(cell.cx, cell.cy, HEX_DRAWN_R - 0.75)}
              stroke="var(--text-secondary)"
              strokeDasharray="3 2"
              strokeWidth={1.5}
            />
          ) : null;
          if (item === undefined) {
            return (
              <g key={cell.uf}>
                <title>
                  {`${row.entry.name}: CPL não medido` +
                    (row.rate === null ? ', sem lead recebido' : `, taxa de ${formatPercent(row.rate, 1)} (${volume})`)}
                </title>
                <polygon fill={`url(#${hatchId})`} points={hexPoints(cell.cx, cell.cy, radius)} stroke="var(--text-muted)" strokeWidth={1} />
                {ring}
                {/* Halo na cor do cartão: a sigla cruza as linhas da hachura (ROT-7). */}
                <text
                  dominantBaseline="central"
                  fill="var(--text-primary)"
                  fontSize={LABEL_SIZE}
                  fontWeight={600}
                  style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
                  textAnchor="middle"
                  x={cell.cx}
                  y={cell.cy}
                >
                  {cell.uf}
                </text>
              </g>
            );
          }
          return (
            <g key={cell.uf}>
              <title>
                {`${item.entry.name}: CPL qualificado de ${money(item.cpl)}, taxa de ${formatPercent(item.rate, 1)} (${volume})`}
              </title>
              <polygon
                fill={paletteFill(item.cplClass, item.rateClass)}
                points={hexPoints(cell.cx, cell.cy, radius)}
                stroke={paletteStroke(item.cplClass, item.rateClass)}
                strokeWidth={1}
              />
              {ring}
              <text
                dominantBaseline="central"
                fill={paletteText(item.cplClass, item.rateClass)}
                fontSize={LABEL_SIZE}
                fontWeight={600}
                textAnchor="middle"
                x={cell.cx}
                y={cell.cy - VALUE_STEP}
              >
                {cell.uf}
              </text>
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill={paletteText(item.cplClass, item.rateClass)}
                fontSize={NOTE_SIZE}
                textAnchor="middle"
                x={cell.cx}
                y={cell.cy}
              >
                {formatPercent(item.rate, 1)}
              </text>
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill={paletteText(item.cplClass, item.rateClass)}
                fontSize={NOTE_SIZE}
                textAnchor="middle"
                x={cell.cx}
                y={cell.cy + VALUE_STEP}
              >
                {money(item.cpl)}
              </text>
            </g>
          );
        })}
      </svg>

      <div aria-hidden className="flex min-w-0 flex-1 flex-col gap-3">
        <p className="m-0 text-xs leading-4 tabular-nums text-text-secondary">
          {focus.length > 0
            ? `${listOf(focus.map((item) => item.entry.uf))}: ${ufCount(focus.length)} de taxa baixa e CPL alto.`
            : 'Nenhuma UF combina taxa baixa e CPL alto neste recorte.'}
        </p>

        <div className="flex items-start gap-4">
          {/* Legenda 3x3 obrigatória: os dois eixos nomeados e o limite de cada tercil escrito na divisa. */}
          <svg className="shrink-0" height={LEGEND_H} viewBox={`0 0 ${String(LEGEND_W)} ${String(LEGEND_H)}`} width={LEGEND_W}>
            {/* A seta diz para onde cada eixo cresce: a taxa para cima, o CPL para a direita. */}
            <path
              d={`M${String(LEGEND_LEFT + 4)},13 V3 M${String(LEGEND_LEFT + 1)},6 L${String(LEGEND_LEFT + 4)},3 L${String(LEGEND_LEFT + 7)},6`}
              fill="none"
              stroke="var(--text-muted)"
              strokeLinecap="round"
              strokeWidth={1.25}
            />
            <text fill="var(--text-muted)" fontSize={NOTE_SIZE} x={LEGEND_LEFT + 12} y={11}>
              taxa de qualificação
            </text>
            {PALETTE.map((column, cplClass) =>
              column.map((_, rateClass) => (
                <rect
                  fill={paletteFill(cplClass, rateClass)}
                  height={LEGEND_CELL - 1}
                  key={`cell-${String(cplClass)}-${String(rateClass)}`}
                  rx={2}
                  stroke={paletteStroke(cplClass, rateClass)}
                  strokeWidth={1}
                  width={LEGEND_CELL - 1}
                  x={cellX(cplClass) + 0.5}
                  y={cellY(rateClass) + 0.5}
                />
              )),
            )}
            {rateUpper.slice(0, CLASS_COUNT - 1).map((bound, index) => (
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={NOTE_SIZE}
                key={`rate-${String(index)}`}
                textAnchor="end"
                x={LEGEND_LEFT - 6}
                y={cellY(index) - LEGEND_GAP / 2}
              >
                {formatPercent(bound, 1)}
              </text>
            ))}
            {cplUpper.slice(0, CLASS_COUNT - 1).map((bound, index) => (
              <text
                className="font-display tabular-nums"
                fill="var(--text-secondary)"
                fontSize={NOTE_SIZE}
                key={`cpl-${String(index)}`}
                textAnchor="middle"
                x={cellX(index) + LEGEND_CELL + LEGEND_GAP / 2}
                y={LEGEND_TOP + LEGEND_GRID + 13}
              >
                {money(bound)}
              </text>
            ))}
            <path
              d={
                `M${String(LEGEND_LEFT)},${String(AXIS_NAME_Y - 4)} H${String(LEGEND_LEFT + 10)} ` +
                `M${String(LEGEND_LEFT + 7)},${String(AXIS_NAME_Y - 7)} L${String(LEGEND_LEFT + 10)},${String(AXIS_NAME_Y - 4)} L${String(LEGEND_LEFT + 7)},${String(AXIS_NAME_Y - 1)}`
              }
              fill="none"
              stroke="var(--text-muted)"
              strokeLinecap="round"
              strokeWidth={1.25}
            />
            <text fill="var(--text-muted)" fontSize={NOTE_SIZE} x={LEGEND_LEFT + 16} y={AXIS_NAME_Y}>
              CPL qualificado
            </text>
          </svg>

          <div className="flex min-w-0 flex-1 flex-col gap-2 text-[0.6875rem] leading-4 text-text-secondary">
            {/* Rótulo só nos cantos da legenda, com a contagem; o canto que a pergunta procura vem primeiro. */}
            <div className="flex flex-col gap-0.5">
              {CORNERS.map((corner, index) => (
                <span className="flex items-center gap-2" key={corner.label}>
                  {renderSwatch(paletteFill(corner.cpl, corner.rate), paletteStroke(corner.cpl, corner.rate))}
                  <span className={cn('min-w-0 flex-1', index === 0 && 'font-semibold text-text-primary')}>{corner.label}</span>
                  <span className="shrink-0 tabular-nums text-text-muted">{ufCount(countAt(corner.cpl, corner.rate))}</span>
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2">
                {renderSwatch(`url(#${hatchId})`, 'var(--text-muted)')}
                <span className="min-w-0 flex-1">sem mídia paga: fora da paleta, sem CPL</span>
                <span className="shrink-0 tabular-nums text-text-muted">{ufCount(withoutCpl)}</span>
              </span>
              <span className="flex items-center gap-2">
                <svg aria-hidden className="shrink-0" height={SWATCH_H} viewBox={`0 0 ${String(SWATCH_W)} ${String(SWATCH_H)}`} width={SWATCH_W}>
                  <polygon
                    fill="none"
                    points={hexPoints(SWATCH_W / 2, SWATCH_H / 2, SWATCH_W / 2 - 0.75)}
                    stroke="var(--text-secondary)"
                    strokeDasharray="3 2"
                    strokeWidth={1.5}
                  />
                </svg>
                <span className="min-w-0 flex-1 tabular-nums">{`amostra pequena: menos de ${formatInt(MIN_SAMPLE)} leads`}</span>
                <span className="shrink-0 tabular-nums text-text-muted">{ufCount(thinCount)}</span>
              </span>
              <span className="text-text-muted">Na divisa da legenda está escrito o teto da classe de baixo.</span>
            </div>

            {focusShown.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                <span className="tabular-nums text-text-muted">
                  {`Canto em foco, do maior para o menor CPL` +
                    (focus.length > focusShown.length ? `, ${formatInt(focusShown.length)} de ${formatInt(focus.length)}` : '')}
                </span>
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-baseline gap-x-2 gap-y-0.5">
                  {focusShown.map((item) => [
                    <span className="font-semibold text-text-primary" key={`${item.entry.uf}-uf`}>{item.entry.uf}</span>,
                    <span className="min-w-0" key={`${item.entry.uf}-name`}>{item.entry.name}</span>,
                    <span className="text-right font-display tabular-nums text-text-primary" key={`${item.entry.uf}-cpl`}>{money(item.cpl)}</span>,
                    <span className="text-right tabular-nums" key={`${item.entry.uf}-rate`}>
                      {`${formatPercent(item.rate, 1)} (${formatInt(item.entry.qualified)} de ${formatInt(item.entry.leads)})`}
                    </span>,
                  ])}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </figure>
  );
}
