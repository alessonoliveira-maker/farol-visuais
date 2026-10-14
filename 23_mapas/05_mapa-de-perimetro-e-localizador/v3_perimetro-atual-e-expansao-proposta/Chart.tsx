import { Filter, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, HEX_GRID, type PerimeterExpansionData, type UfCode } from './data';

/**
 * Perímetro vigente e expansão proposta no mesmo mapa: contorno cheio e preenchimento para as UFs em
 * que a operação já atua, contorno tracejado para as que a expansão acrescenta, tom neutro para o
 * resto. O painel ao lado põe a participação atual, medida, junto da que o plano assume para as UFs
 * novas, em faixa, cada número com a sua procedência, e desenha os dois na mesma escala. Apoia a
 * decisão de aprovar a expansão sabendo o que é medição e o que é premissa.
 */
export interface PerimeterExpansionMapProps {
  readonly data?: PerimeterExpansionData;
  readonly height?: number;
  readonly className?: string;
}

/** Largura da célula hexagonal, de ponta para cima: com 44 px a sigla de 11 px respira dentro do contorno. */
const HEX_W = 44;
const HEX_R = HEX_W / Math.sqrt(3);
const ROW_PITCH = HEX_R * 1.5;
/** Espessura visível do contorno externo, cheio ou tracejado. */
const CONTOUR_W = 1.5;
/** Traço da segunda passada, na cor do preenchimento: fecha a emenda entre hexágonos vizinhos. */
const SEAM_W = 1;
/** A primeira passada desenha o dobro do contorno, porque a metade de dentro some sob o preenchimento. */
const FIRST_PASS_W = 2 * CONTOUR_W + SEAM_W;
const MESH_STROKE_W = 1;
/** Respiro do viewBox: o contorno externo cai para fora do hexágono e não pode ser cortado. */
const PAD = CONTOUR_W + SEAM_W / 2 + 0.5;
/**
 * Traço e vão do tracejado: um sexto do lado do hexágono cada, então cabem 3 ciclos exatos por lado
 * e, com o deslocamento de meio traço, todo vértice do contorno ganha um traço inteiro dobrado.
 */
const DASH = Math.round((HEX_R / 6) * 100) / 100;
const LABEL_SIZE = 11;
const SWATCH_W = 14;
const SWATCH_H = 16;

/** Faixa das duas participações na mesma escala: SVG de tamanho fixo, em escala 1. */
const STRIP_W = 560;
const STRIP_NAME_W = 64;
const STRIP_PAD_RIGHT = 14;
const STRIP_ROW_TOP = 9;
const STRIP_ROW_PITCH = 18;
const STRIP_AXIS_Y = 40;
const STRIP_H = 56;
const STRIP_BAND_H = 14;
const STRIP_DOT_R = 6;
/** Passos redondos possíveis para os tiques da escala, em fração, do mais fino ao mais largo. */
const TICK_STEPS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5] as const;
const MAX_TICK_INTERVALS = 4;

type Group = 'current' | 'expansion' | 'outside';

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

/**
 * Geometria pura, calculada uma vez: centro e vértices de cada UF, com as linhas ímpares deslocadas
 * meia célula. Os hexágonos se tocam sem vão: é o que deixa o preenchimento da segunda passada
 * cobrir as bordas internas de cada recorte.
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

/** Participação: receita sobre mercado. Sem mercado de referência não há taxa, e ausência não é zero. */
function shareOf(revenue: number, market: number): number | null {
  if (market <= 0) return null;
  return revenue / market;
}

interface Scale {
  readonly step: number;
  readonly intervals: number;
  readonly ceiling: number;
}

/**
 * Escala da faixa: começa no zero e termina no primeiro tique acima do maior valor desenhado, com o
 * menor passo redondo que dê até 4 intervalos (EIX-4). Sem valor não há escala (EST-1b).
 */
function buildScale(values: readonly number[]): Scale | null {
  if (values.length === 0) return null;
  let largest = 0;
  for (const value of values) largest = Math.max(largest, value);
  const step = TICK_STEPS.find((candidate) => largest / candidate <= MAX_TICK_INTERVALS) ?? 1;
  const intervals = Math.max(1, Math.ceil(Math.round((largest / step) * 1000) / 1000));
  return { step, intervals, ceiling: intervals * step };
}

/** Posição de um valor na faixa: zero na borda da coluna de nomes, teto da escala na borda direita. */
function stripX(value: number, ceiling: number): number {
  const span = STRIP_W - STRIP_NAME_W - STRIP_PAD_RIGHT;
  return Math.round((STRIP_NAME_W + (value / ceiling) * span) * 100) / 100;
}

function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1] ?? ''}`;
}

function ufCount(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'UF' : 'UFs'}`;
}

function Swatch({ group }: { readonly group: Group }) {
  return (
    <svg aria-hidden className="shrink-0" height={SWATCH_H} viewBox={`0 0 ${String(SWATCH_W)} ${String(SWATCH_H)}`} width={SWATCH_W}>
      <polygon
        fill={group === 'current' ? 'var(--chart-1)' : 'var(--surface-sunken)'}
        points={hexPoints(SWATCH_W / 2, SWATCH_H / 2, SWATCH_W / 2 - 0.75)}
        stroke={group === 'outside' ? 'var(--line-strong)' : 'var(--text-primary)'}
        strokeDasharray={group === 'expansion' ? '3 2' : undefined}
        strokeWidth={group === 'outside' ? 1 : 1.5}
      />
    </svg>
  );
}

const SIGLA_FILL: Record<Group, string> = {
  current: 'var(--accent-cyan-contrast)',
  expansion: 'var(--text-primary)',
  outside: 'var(--text-muted)',
};

const SMALL = 'text-[0.6875rem] leading-4';

export default function PerimeterExpansionMap({ data = defaultData, height, className }: PerimeterExpansionMapProps) {
  const { current, expansion } = data;

  if (current.ufs.length === 0 && expansion.ufs.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF no perímetro vigente nem na expansão: o mapa não tem recorte para mostrar.</span>
      </div>
    );
  }

  // UF que aparecer nas duas listas fica no perímetro vigente: expansão é só o que ele ainda não tem.
  const groupOf = new Map<UfCode, Group>();
  for (const uf of expansion.ufs) groupOf.set(uf, 'expansion');
  for (const uf of current.ufs) groupOf.set(uf, 'current');
  const cellsOf = (group: Group) => LAYOUT.cells.filter((cell) => (groupOf.get(cell.uf) ?? 'outside') === group);
  const currentCells = cellsOf('current');
  const expansionCells = cellsOf('expansion');
  const outsideCells = cellsOf('outside');
  const currentUfs = currentCells.map((cell) => cell.uf).sort();
  const expansionUfs = expansionCells.map((cell) => cell.uf).sort();

  const share = shareOf(current.revenue, current.market);
  const shareText = share === null ? formatUnavailable() : formatPercent(share, 1);
  const rangeText = `${formatPercent(expansion.shareLow, 1)} a ${formatPercent(expansion.shareHigh, 1)}`;
  const scale = buildScale(share === null ? [expansion.shareHigh] : [share, expansion.shareHigh]);

  const summary =
    `Mapa de perímetro em hexágonos. ${current.label}: ${ufCount(currentUfs.length)} (${joinList(currentUfs)}), participação medida de ${shareText}. ` +
    `${expansion.label}: ${ufCount(expansionUfs.length)} (${joinList(expansionUfs)}), participação estimada de ${rangeText}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 items-start gap-8', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      {/* Escala 1: largura e altura iguais ao viewBox, para o texto de 11 px chegar com 11 px (GEO-18). */}
      <svg aria-hidden className="shrink-0" height={LAYOUT.height} viewBox={`0 0 ${String(LAYOUT.width)} ${String(LAYOUT.height)}`} width={LAYOUT.width}>
        {/* Fora do perímetro: tom neutro. O poço mede 1,15:1 contra o cartão; quem segura a silhueta é o traço. */}
        {outsideCells.map((cell) => (
          <polygon fill="var(--surface-sunken)" key={cell.uf} points={cell.points} stroke="var(--line-strong)" strokeWidth={MESH_STROKE_W} />
        ))}
        {/* Expansão, primeira passada: contorno grosso tracejado. O deslocamento de meio traço põe um traço inteiro em cada vértice. */}
        {expansionCells.map((cell) => (
          <polygon
            fill="none"
            key={cell.uf}
            points={cell.points}
            stroke="var(--text-primary)"
            strokeDasharray={`${String(DASH)} ${String(DASH)}`}
            strokeDashoffset={DASH / 2}
            strokeWidth={FIRST_PASS_W}
          />
        ))}
        {/* Expansão, segunda passada: o preenchimento cobre a metade interna do tracejado e as bordas entre as UFs novas. */}
        {expansionCells.map((cell) => (
          <polygon fill="var(--surface-sunken)" key={cell.uf} points={cell.points} stroke="var(--surface-sunken)" strokeWidth={SEAM_W} />
        ))}
        {/* Perímetro vigente DEPOIS da expansão: na divisa entre os dois quem aparece é o contorno cheio, que é o medido. */}
        {currentCells.map((cell) => (
          <polygon fill="none" key={cell.uf} points={cell.points} stroke="var(--text-primary)" strokeLinejoin="round" strokeWidth={FIRST_PASS_W} />
        ))}
        {/* Segunda passada, sempre DEPOIS da primeira: sobra só o contorno externo, sem dissolver polígono nenhum. */}
        {currentCells.map((cell) => (
          <polygon fill="var(--chart-1)" key={cell.uf} points={cell.points} stroke="var(--chart-1)" strokeWidth={SEAM_W} />
        ))}
        {LAYOUT.cells.map((cell) => {
          const group = groupOf.get(cell.uf) ?? 'outside';
          return (
            <text
              dominantBaseline="central"
              fill={SIGLA_FILL[group]}
              fontSize={LABEL_SIZE}
              fontWeight={group === 'outside' ? 500 : 600}
              key={cell.uf}
              textAnchor="middle"
              x={cell.cx}
              y={cell.cy}
            >
              {cell.uf}
            </text>
          );
        })}
      </svg>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        {/* Legenda na ordem do painel: vigente, expansão, fora. A amostra repete a forma e o traço da marca. */}
        <div aria-hidden className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-text-secondary', SMALL)}>
          <span className="flex items-center gap-1.5">
            <Swatch group="current" />
            <span>perímetro vigente</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Swatch group="expansion" />
            <span>expansão proposta</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Swatch group="outside" />
            <span className="tabular-nums">fora do perímetro, {ufCount(outsideCells.length)}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-6">
          <div className="flex min-w-0 flex-col">
            <p className="text-xs font-semibold text-text-primary">{current.label}</p>
            <p className={cn('text-text-secondary tabular-nums', SMALL)}>
              {ufCount(currentUfs.length)}: {joinList(currentUfs)}
            </p>
            {share === null ? (
              <p className="mt-1.5 flex h-6 items-center gap-1.5 text-text-muted">
                <Unplug aria-hidden className="size-4 shrink-0" />
                <span className="font-display text-base leading-none">{shareText}</span>
              </p>
            ) : (
              <p className="kpi-number mt-1.5 text-2xl leading-none font-semibold text-text-primary">{shareText}</p>
            )}
            <p className={cn('mt-1.5 flex items-center gap-1.5 text-text-muted', SMALL)}>
              <span className="font-semibold text-prov-medido">MEDIDO</span>
              <span>participação atual</span>
            </p>
            <p className={cn('text-text-muted tabular-nums', SMALL)}>
              <span className="block">{formatCurrencyCompact(current.revenue)} de receita</span>
              <span className="block">em {formatCurrencyCompact(current.market)} de mercado</span>
            </p>
          </div>

          <div className="flex min-w-0 flex-col">
            <p className="text-xs font-semibold text-text-primary">{expansion.label}</p>
            <p className={cn('text-text-secondary tabular-nums', SMALL)}>
              {ufCount(expansionUfs.length)}: {joinList(expansionUfs)}
            </p>
            <p className="kpi-number mt-1.5 text-2xl leading-none font-semibold text-text-primary">{rangeText}</p>
            <p className={cn('mt-1.5 flex items-center gap-1.5 text-text-muted', SMALL)}>
              <span className="font-semibold text-prov-premissa">PREMISSA</span>
              <span>participação estimada nas UFs novas</span>
            </p>
            <p className={cn('text-text-muted tabular-nums', SMALL)}>
              <span className="block">
                {formatCurrencyCompact(expansion.market * expansion.shareLow)} a {formatCurrencyCompact(expansion.market * expansion.shareHigh)} de receita
              </span>
              <span className="block">em {formatCurrencyCompact(expansion.market)} de mercado</span>
            </p>
          </div>
        </div>

        {scale === null ? null : (
          <div aria-hidden className="flex flex-col gap-1">
            <p className={cn('text-text-muted', SMALL)}>As duas participações na mesma escala, cada uma sobre o mercado do próprio recorte</p>
            {/* Escala 1, tamanho fixo. Grade só na direção da leitura (o valor corre no eixo X) e sem linha de eixo (EIX-5). */}
            <svg className="shrink-0" height={STRIP_H} viewBox={`0 0 ${String(STRIP_W)} ${String(STRIP_H)}`} width={STRIP_W}>
              {Array.from({ length: scale.intervals + 1 }, (_, index) => {
                const tick = index * scale.step;
                const x = stripX(tick, scale.ceiling);
                return (
                  <g key={`tick-${String(index)}`}>
                    <line stroke="var(--line-subtle)" x1={x} x2={x} y1={0} y2={STRIP_AXIS_Y} />
                    <text className="font-display tabular-nums" fill="var(--text-muted)" fontSize={LABEL_SIZE} textAnchor="middle" x={x} y={STRIP_H - 4}>
                      {formatPercent(tick, 0)}
                    </text>
                  </g>
                );
              })}
              <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={LABEL_SIZE} x={0} y={STRIP_ROW_TOP}>
                vigente
              </text>
              <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={LABEL_SIZE} x={0} y={STRIP_ROW_TOP + STRIP_ROW_PITCH}>
                expansão
              </text>
              {/* O medido é ponto cheio com contorno cheio; a premissa é faixa vazada com contorno tracejado, como no mapa. */}
              {share === null ? null : (
                <circle cx={stripX(share, scale.ceiling)} cy={STRIP_ROW_TOP} fill="var(--chart-1)" r={STRIP_DOT_R} stroke="var(--text-primary)" strokeWidth={CONTOUR_W} />
              )}
              <rect
                fill="var(--surface-sunken)"
                height={STRIP_BAND_H}
                stroke="var(--text-primary)"
                strokeDasharray="4 3"
                strokeWidth={CONTOUR_W}
                width={Math.max(0, stripX(expansion.shareHigh, scale.ceiling) - stripX(expansion.shareLow, scale.ceiling))}
                x={stripX(expansion.shareLow, scale.ceiling)}
                y={STRIP_ROW_TOP + STRIP_ROW_PITCH - STRIP_BAND_H / 2}
              />
            </svg>
          </div>
        )}

        <p className={cn('text-text-muted tabular-nums', SMALL)}>
          A faixa é premissa do plano e vale só para as {ufCount(expansionUfs.length)} novas, não para o perímetro ampliado.
        </p>
      </div>
    </figure>
  );
}
