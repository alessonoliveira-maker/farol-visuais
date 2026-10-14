import { Filter } from 'lucide-react';

import { formatCurrency, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  HEX_GRID,
  UF_NAMES,
  type PlatformCpl,
  type Region,
  type UfCode,
} from './data';

/**
 * Tile grid hexagonal por UF, em três pequenos múltiplos lado a lado (uma plataforma por mapa) e uma
 * única escala divergente em torno da média da própria plataforma. Menor CPL é melhor, então abaixo
 * da média é --positive e acima é --negative. O centro é cinza, e o sinal vem escrito em todo hexágono.
 * Os hexágonos são polígonos SVG (e não clip-path em HTML) porque o clip-path não sai no preview.
 */
export interface HexCplMapsProps {
  readonly data?: readonly PlatformCpl[];
  readonly height?: number;
  readonly className?: string;
}

/** Largura de uma célula hexagonal (ponta para cima). Abaixo de 32 px só a sigla caberia (spec). */
const HEX_W = 32;
const HEX_GAP = 2;
const HEX_R = HEX_W / Math.sqrt(3);
const HEX_DRAWN_R = HEX_R - HEX_GAP / Math.sqrt(3);
const ROW_PITCH = HEX_R * 1.5;
const PAD = 2;
/** Desvio arredondado em pontos inteiros: abaixo de 5% é centro; de 5% a 15% é leve; acima de 15% é forte. */
const NEUTRAL_PCT = 5;
const STRONG_PCT = 15;

/**
 * Afastamento de cada macrorregião, em px, para separá-las por espaço sem desenhar contorno sobre o hexágono.
 * O Norte fica parado e o que está abaixo dele desce. O Nordeste desliza paralelo à aresta comum com o
 * Norte (x 8, y -4,62, a 30 graus): uma translação qualquer soma 4 px de vão entre MA com AP e MA com TO,
 * e só esse eixo mantém os dois pares em 2 px. Vão mínimo de 2 px em todo par de hexágonos.
 */
const REGION_SHIFT: Readonly<Record<Region, { readonly x: number; readonly y: number }>> = {
  norte: { x: 0, y: 0 },
  nordeste: { x: 8, y: -4.62 },
  'centro-oeste': { x: 0, y: 6 },
  sudeste: { x: 2, y: 12 },
  sul: { x: -4, y: 12 },
};

interface HexCell {
  readonly uf: UfCode;
  readonly cx: number;
  readonly cy: number;
  readonly points: string;
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

/** Geometria pura, calculada uma vez: centros por linha e coluna, linhas ímpares deslocadas meia célula. */
function buildLayout(): { readonly cells: readonly HexCell[]; readonly width: number; readonly height: number } {
  const raw = (Object.keys(HEX_GRID) as UfCode[]).map((uf) => {
    const position = HEX_GRID[uf];
    const shift = REGION_SHIFT[position.region];
    const half = position.row % 2 === 1 ? HEX_W / 2 : 0;
    return {
      uf,
      cx: position.column * HEX_W + half + shift.x,
      cy: position.row * ROW_PITCH + shift.y,
    };
  });
  // Limites de desenho: a grade é constante e nunca vazia, e o laço dispensa o spread sobre lista.
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
  const cells = raw.map((cell) => {
    const cx = cell.cx - minX;
    const cy = cell.cy - minY;
    return { uf: cell.uf, cx, cy, points: hexPoints(cx, cy, HEX_DRAWN_R) };
  });
  return { cells, width: Math.ceil(maxX - minX), height: Math.ceil(maxY - minY) };
}

const LAYOUT = buildLayout();

/** Desvio do CPL contra a média, em pontos inteiros. CPL ausente é null, nunca 0. */
function deviationPct(cpl: number | null | undefined, mean: number): number | null {
  if (cpl === null || cpl === undefined || mean <= 0) return null;
  return Math.round(((cpl - mean) / mean) * 100);
}

/** Classe de 0 a 4: 0 muito abaixo (melhor), 2 centro, 4 muito acima (pior). */
function bucketOf(pct: number): number {
  if (pct <= -STRONG_PCT) return 0;
  if (pct <= -NEUTRAL_PCT) return 1;
  if (pct < NEUTRAL_PCT) return 2;
  if (pct < STRONG_PCT) return 3;
  return 4;
}

/**
 * A única função que sabe a cor da escala divergente. O Farol não tem tokens --div-*: os extremos são
 * --positive e --negative, o centro é --line-strong e os degraus leves são a mistura dos dois. Quando
 * os tokens divergentes existirem, só o corpo desta função muda (TOK-3).
 */
function bucketFill(bucket: number): string {
  if (bucket === 0) return 'var(--positive)';
  if (bucket === 1) return 'color-mix(in srgb, var(--positive) 32%, var(--line-strong))';
  if (bucket === 2) return 'var(--line-strong)';
  if (bucket === 3) return 'color-mix(in srgb, var(--negative) 32%, var(--line-strong))';
  return 'var(--negative)';
}

/** Extremos leem com o texto vazado na cor do cartão (ROT-6, 5,3:1 ou mais); centro e leves, com o texto principal. */
function bucketText(bucket: number): string {
  return bucket === 0 || bucket === 4 ? 'var(--surface-raised)' : 'var(--text-primary)';
}

/** Sinal à mão sobre o valor absoluto (NUM-3): + e − tipográfico, e o zero sem sinal. Com o % na dica e na legenda. */
function signedPct(pct: number): string {
  if (pct === 0) return `${formatPercent(0, 0)}`;
  return `${pct > 0 ? '+' : '−'}${formatPercent(Math.abs(pct) / 100, 0)}`;
}

/** O mesmo desvio sem o símbolo, para caber no hexágono de 32 px: a unidade vai na legenda. */
function signedNumber(pct: number): string {
  if (pct === 0) return formatInt(0);
  return `${pct > 0 ? '+' : '−'}${formatInt(Math.abs(pct))}`;
}

const LEGEND_STEPS = [
  `mais de ${String(STRONG_PCT)}% abaixo`,
  `${String(NEUTRAL_PCT)}% a ${String(STRONG_PCT)}% abaixo`,
  `dentro de ${String(NEUTRAL_PCT)}%`,
  `${String(NEUTRAL_PCT)}% a ${String(STRONG_PCT)}% acima`,
  `mais de ${String(STRONG_PCT)}% acima`,
] as const;

export default function HexCplMaps({ data = defaultData, height, className }: HexCplMapsProps) {
  const panels = data.map((platform) => {
    const entries = LAYOUT.cells.map((cell) => ({ cell, pct: deviationPct(platform.cpl[cell.uf], platform.nationalMean) }));
    const measured = entries.filter((entry) => entry.pct !== null);
    const above = measured.filter((entry) => (entry.pct ?? 0) > 0).length;
    let extreme: (typeof entries)[number] | undefined;
    for (const entry of measured) {
      if (extreme === undefined || (entry.pct ?? 0) > (extreme.pct ?? 0)) extreme = entry;
    }
    return { platform, entries, measured: measured.length, above, extreme };
  });

  if (panels.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma neste recorte: os mapas não têm o que comparar.</span>
      </div>
    );
  }

  let worst = panels[0];
  for (const panel of panels) {
    if (worst === undefined || panel.above > worst.above) worst = panel;
  }
  const extremePct = worst?.extreme?.pct;
  const summary =
    worst && worst.extreme && extremePct !== null && extremePct !== undefined
      ? `${formatInt(panels.length)} mapas hexagonais de CPL qualificado por UF contra a média de cada plataforma, em que menor é melhor. ` +
        `${worst.platform.label} tem mais UFs acima da média: ${formatInt(worst.above)} de ${formatInt(worst.measured)} medidas, ` +
        `com o maior desvio em ${worst.extreme.cell.uf}, ${signedPct(extremePct)}.`
      : 'Mapas hexagonais de CPL qualificado sem UF medida para comparar.';

  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden className="flex min-h-0 flex-1 flex-wrap content-start justify-center gap-x-4 gap-y-2">
        {panels.map((panel) => (
          <div className="flex shrink-0 flex-col gap-1" key={panel.platform.id}>
            <p className="m-0 flex items-baseline justify-between text-xs leading-4 text-text-secondary">
              <span className="font-medium">{panel.platform.label}</span>
              <span className="tabular-nums text-text-muted">{`média ${formatCurrency(panel.platform.nationalMean, 0)}`}</span>
            </p>
            <svg height={LAYOUT.height} viewBox={`0 0 ${String(LAYOUT.width)} ${String(LAYOUT.height)}`} width={LAYOUT.width}>
              {panel.entries.map(({ cell, pct }) => {
                const title = `${UF_NAMES[cell.uf]}: ${
                  pct === null ? formatUnavailable() : `${formatCurrency(panel.platform.cpl[cell.uf] ?? 0, 0)}, ${signedPct(pct)} contra a média`
                }`;
                if (pct === null) {
                  return (
                    <g key={cell.uf}>
                      <title>{title}</title>
                      <polygon fill="none" points={cell.points} stroke="var(--text-muted)" strokeDasharray="3 2" strokeWidth={1.5} />
                      <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cell.cx} y={cell.cy}>
                        {cell.uf}
                      </text>
                    </g>
                  );
                }
                const bucket = bucketOf(pct);
                return (
                  <g key={cell.uf}>
                    <title>{title}</title>
                    <polygon fill={bucketFill(bucket)} points={cell.points} />
                    <text fill={bucketText(bucket)} fontSize={11} fontWeight={600} textAnchor="middle" x={cell.cx} y={cell.cy - 2}>
                      {cell.uf}
                    </text>
                    <text className="font-display tabular-nums" fill={bucketText(bucket)} fontSize={11} textAnchor="middle" x={cell.cx} y={cell.cy + 9}>
                      {signedNumber(pct)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ))}
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-1 text-[0.6875rem] leading-4 text-text-muted">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {LEGEND_STEPS.map((label, index) => (
            <span className="flex items-center gap-1" key={label}>
              <svg className="shrink-0" height={16} viewBox="0 0 14 16" width={14}>
                <polygon fill={bucketFill(index)} points={hexPoints(7, 8, 7)} />
              </svg>
              <span className="tabular-nums text-text-secondary">{label}</span>
            </span>
          ))}
          <span className="flex items-center gap-1">
            <svg className="shrink-0" height={16} viewBox="0 0 14 16" width={14}>
              <polygon fill="none" points={hexPoints(7, 8, 6.25)} stroke="var(--text-muted)" strokeDasharray="3 2" strokeWidth={1.5} />
            </svg>
            <span className="text-text-secondary">sem lead qualificado</span>
          </span>
        </div>
        <span>Número no hexágono: desvio do CPL qualificado contra a média da plataforma, em %. Abaixo é melhor.</span>
      </div>
    </figure>
  );
}
