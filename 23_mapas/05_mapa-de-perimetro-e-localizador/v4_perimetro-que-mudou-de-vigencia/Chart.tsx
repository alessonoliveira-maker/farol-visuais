import { CalendarCheck, Filter, Minus, Plus, TriangleAlert, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatDate, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, HEX_GRID, type PerimeterChangeData, type PerimeterId, type SharePair, type UfCode } from './data';

/**
 * Perímetro que mudou de vigência: o mapa acende um dos dois perímetros, o vigente ou o anterior,
 * sempre na mesma malha e na mesma escala, e marca com ícone as UFs que entraram e as que saíram.
 * Ao lado, o selo com a data desde a qual o vigente vale, as duas participações com o aviso de que
 * não se comparam e, para cada UF que mudou de lado, a medição em cada perímetro, com o estado
 * de ausência onde não houve. Apoia a leitura de uma série de participação que atravessa a data.
 */
export interface PerimeterChangeMapProps {
  readonly data?: PerimeterChangeData;
  /** Qual perímetro o mapa acende. Trocar não muda a malha, a escala nem a tabela ao lado. */
  readonly shownPerimeter?: PerimeterId;
  readonly height?: number;
  readonly className?: string;
}

/** Largura da célula hexagonal, de ponta para cima: com 34 px cabem a sigla de 11 px e o ícone de 12 px. */
const HEX_W = 34;
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
/** Traço e vão do tracejado: um sexto do lado do hexágono, 3 ciclos exatos por lado. */
const DASH = Math.round((HEX_R / 6) * 100) / 100;
const LABEL_SIZE = 11;
const ICON_SIZE = 12;
/** Com ícone, a sigla sobe e o ícone fica logo abaixo do centro; sem ícone, a sigla fica no centro. */
const SIGLA_WITH_ICON_DY = -3;
const ICON_DY = 1;
const SWATCH_W = 14;
const SWATCH_H = 16;

/** Papel da UF no mapa: no perímetro exibido, só no outro perímetro, ou fora dos dois. */
type Role = 'shown' | 'other' | 'outside';
type Change = 'entered' | 'left';

const PERIMETER_WORD: Record<PerimeterId, string> = { current: 'vigente', previous: 'anterior' };

const ROLE_INK: Record<Role, string> = {
  shown: 'var(--accent-cyan-contrast)',
  other: 'var(--text-primary)',
  outside: 'var(--text-muted)',
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

/**
 * Geometria pura, calculada uma vez e igual para os dois perímetros: é o que garante que alternar a
 * prop `shownPerimeter` não muda a escala. Os hexágonos se tocam sem vão, para o preenchimento da
 * segunda passada cobrir as bordas internas do perímetro.
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

/** Participação: receita sobre mercado. Sem medição ou sem mercado de referência não há taxa, e ausência não é zero. */
function shareOf(pair: SharePair | null): number | null {
  if (pair === null || pair.market <= 0) return null;
  return pair.revenue / pair.market;
}

function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1] ?? ''}`;
}

function ufCount(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'UF' : 'UFs'}`;
}

/** Uma oração com quem entrou e quem saiu, para a frase acessível. */
function changeSentence(entered: readonly string[], left: readonly string[]): string {
  const parts: string[] = [];
  if (entered.length > 0) parts.push(`${entered.length === 1 ? 'entrou' : 'entraram'} ${joinList(entered)}`);
  if (left.length > 0) parts.push(`${left.length === 1 ? 'saiu' : 'saíram'} ${joinList(left)}`);
  if (parts.length === 0) return 'Nenhuma UF entrou ou saiu.';
  const text = parts.join(' e ');
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

function Swatch({ kind }: { readonly kind: Role }) {
  return (
    <svg aria-hidden className="shrink-0" height={SWATCH_H} viewBox={`0 0 ${String(SWATCH_W)} ${String(SWATCH_H)}`} width={SWATCH_W}>
      <polygon
        fill={kind === 'shown' ? 'var(--chart-1)' : 'var(--surface-sunken)'}
        points={hexPoints(SWATCH_W / 2, SWATCH_H / 2, SWATCH_W / 2 - 0.75)}
        stroke={kind === 'outside' ? 'var(--line-strong)' : 'var(--text-primary)'}
        strokeDasharray={kind === 'other' ? '3 2' : undefined}
        strokeWidth={kind === 'outside' ? 1 : 1.5}
      />
    </svg>
  );
}

/** Célula da tabela: a participação, ou o estado de ausência com o ícone, nunca zero (EST-2). */
function ShareCell({ pair, strong = false }: { readonly pair: SharePair | null; readonly strong?: boolean }) {
  const share = shareOf(pair);
  if (pair === null || share === null) {
    return (
      <span className="flex items-center justify-end gap-1 text-[0.6875rem] leading-4 text-text-muted">
        <Unplug aria-hidden className="size-3 shrink-0" />
        <span>{formatUnavailable()}</span>
      </span>
    );
  }
  return (
    <span className="flex flex-col text-right">
      <span className={cn('font-display text-xs leading-4 tabular-nums text-text-primary', strong && 'font-semibold')}>
        {formatPercent(share, 1)}
      </span>
      <span className="text-[0.6875rem] leading-4 tabular-nums text-text-muted">{formatCurrencyCompact(pair.revenue)}</span>
      <span className="text-[0.6875rem] leading-4 tabular-nums text-text-muted">de {formatCurrencyCompact(pair.market)}</span>
    </span>
  );
}

const SMALL = 'text-[0.6875rem] leading-4';

export default function PerimeterChangeMap({ data = defaultData, shownPerimeter = 'current', height, className }: PerimeterChangeMapProps) {
  const { previous, current } = data;

  if (previous.ufs.length === 0 && current.ufs.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF no perímetro vigente nem no anterior: o mapa não tem recorte para mostrar.</span>
      </div>
    );
  }

  const inPrevious = new Set<UfCode>(previous.ufs);
  const inCurrent = new Set<UfCode>(current.ufs);
  const shown = shownPerimeter === 'current' ? inCurrent : inPrevious;
  const other = shownPerimeter === 'current' ? inPrevious : inCurrent;
  const otherId: PerimeterId = shownPerimeter === 'current' ? 'previous' : 'current';

  const roleOf = (uf: UfCode): Role => (shown.has(uf) ? 'shown' : other.has(uf) ? 'other' : 'outside');
  // A mudança é do dado, não da prop: quem entrou segue marcado com o mais nos dois modos de exibição.
  const changeOf = (uf: UfCode): Change | null =>
    inCurrent.has(uf) && !inPrevious.has(uf) ? 'entered' : inPrevious.has(uf) && !inCurrent.has(uf) ? 'left' : null;
  const cellsOf = (role: Role) => LAYOUT.cells.filter((cell) => roleOf(cell.uf) === role);
  const shownCells = cellsOf('shown');
  const otherCells = cellsOf('other');
  const outsideCells = cellsOf('outside');

  const details = new Map(data.changed.map((entry) => [entry.uf, entry]));
  // Quem entrou primeiro, depois quem saiu; dentro de cada grupo, ordem alfabética da sigla.
  const changes = LAYOUT.cells
    .flatMap((cell) => {
      const change = changeOf(cell.uf);
      if (change === null) return [];
      const detail = details.get(cell.uf);
      return [{ uf: cell.uf, change, name: detail?.name ?? cell.uf, previous: detail?.previous ?? null, current: detail?.current ?? null }];
    })
    .sort((a, b) => (a.change === b.change ? a.uf.localeCompare(b.uf) : a.change === 'entered' ? -1 : 1));

  const previousShare = shareOf(previous);
  const currentShare = shareOf(current);
  const pairText = (share: number | null, pair: SharePair): string =>
    share === null ? formatUnavailable() : `${formatPercent(share, 1)} (${formatCurrencyCompact(pair.revenue)} de ${formatCurrencyCompact(pair.market)})`;
  const previousText = pairText(previousShare, previous);
  const currentText = pairText(currentShare, current);
  const sinceText = formatDate(data.changedOn);

  const summary =
    `Mapa de perímetro exibindo o ${PERIMETER_WORD[shownPerimeter]}, de ${ufCount(shownCells.length)}, ` +
    `${shownPerimeter === 'current' ? 'que vale desde' : 'substituído em'} ${sinceText}. ` +
    `${changeSentence(
      changes.filter((item) => item.change === 'entered').map((item) => item.name),
      changes.filter((item) => item.change === 'left').map((item) => item.name),
    )} Participações, ${previousText} no anterior e ${currentText} no vigente, não se comparam.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 items-start gap-4', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden className="flex shrink-0 flex-col gap-2">
        {/* Escala 1: largura e altura iguais ao viewBox, para o texto de 11 px chegar com 11 px (GEO-18). */}
        <svg className="shrink-0" height={LAYOUT.height} viewBox={`0 0 ${String(LAYOUT.width)} ${String(LAYOUT.height)}`} width={LAYOUT.width}>
          {/* Fora dos dois perímetros: tom neutro. O poço mede 1,15:1 contra o cartão; quem segura a silhueta é o traço. */}
          {outsideCells.map((cell) => (
            <polygon fill="var(--surface-sunken)" key={cell.uf} points={cell.points} stroke="var(--line-strong)" strokeWidth={MESH_STROKE_W} />
          ))}
          {/* UF só do outro perímetro, primeira passada: contorno grosso tracejado, com um traço inteiro em cada vértice. */}
          {otherCells.map((cell) => (
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
          {otherCells.map((cell) => (
            <polygon fill="var(--surface-sunken)" key={cell.uf} points={cell.points} stroke="var(--surface-sunken)" strokeWidth={SEAM_W} />
          ))}
          {/* Perímetro exibido, primeira passada: só o contorno grosso. Vem DEPOIS do tracejado, para a divisa sair cheia. */}
          {shownCells.map((cell) => (
            <polygon fill="none" key={cell.uf} points={cell.points} stroke="var(--text-primary)" strokeLinejoin="round" strokeWidth={FIRST_PASS_W} />
          ))}
          {/* Segunda passada, sempre DEPOIS da primeira: sobra só o contorno externo, sem dissolver polígono nenhum. */}
          {shownCells.map((cell) => (
            <polygon fill="var(--chart-1)" key={cell.uf} points={cell.points} stroke="var(--chart-1)" strokeWidth={SEAM_W} />
          ))}
          {LAYOUT.cells.map((cell) => {
            const role = roleOf(cell.uf);
            const change = changeOf(cell.uf);
            const Icon = change === 'entered' ? Plus : Minus;
            return (
              <g key={cell.uf}>
                <text
                  dominantBaseline={change === null ? 'central' : undefined}
                  fill={ROLE_INK[role]}
                  fontSize={LABEL_SIZE}
                  fontWeight={role === 'outside' ? 500 : 600}
                  textAnchor="middle"
                  x={cell.cx}
                  y={change === null ? cell.cy : cell.cy + SIGLA_WITH_ICON_DY}
                >
                  {cell.uf}
                </text>
                {change === null ? null : (
                  <Icon aria-hidden height={ICON_SIZE} stroke={ROLE_INK[role]} strokeWidth={3} width={ICON_SIZE} x={cell.cx - ICON_SIZE / 2} y={cell.cy + ICON_DY} />
                )}
              </g>
            );
          })}
        </svg>

        <div className={cn('flex items-center gap-x-3 text-text-secondary', SMALL)}>
          <span className="flex items-center gap-1.5">
            <Swatch kind="shown" />
            <span>perímetro {PERIMETER_WORD[shownPerimeter]}</span>
          </span>
          {otherCells.length > 0 ? (
            <span className="flex items-center gap-1.5">
              <Swatch kind="other" />
              <span>só no {PERIMETER_WORD[otherId]}</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        {/* O selo tem borda própria: no tema claro o fundo de sobreposição é o mesmo branco do cartão (TOK-1). */}
        <p className={cn('flex items-center gap-1.5 self-start rounded-full border border-line-strong px-2 py-0.5 text-text-secondary', SMALL)}>
          <CalendarCheck aria-hidden className="size-3 shrink-0" />
          <span className="tabular-nums">perímetro vigente desde {sinceText}</span>
        </p>

        <div className="grid grid-cols-[minmax(0,1fr)_5.75rem_5.75rem] items-start gap-x-2 gap-y-1.5">
          <span aria-hidden />
          <span className={cn('flex flex-col text-right text-text-muted tabular-nums', SMALL)}>
            <span>{PERIMETER_WORD.previous}</span>
            <span>{ufCount(previous.ufs.length)}</span>
          </span>
          <span className={cn('flex flex-col text-right text-text-muted tabular-nums', SMALL)}>
            <span>{PERIMETER_WORD.current}</span>
            <span>{ufCount(current.ufs.length)}</span>
          </span>

          <span className="text-xs leading-4 text-text-secondary">Participação no perímetro</span>
          <ShareCell pair={previous} strong />
          <ShareCell pair={current} strong />

          {/* O aviso fica colado às duas participações, que são os números que deixam de ser comparáveis. */}
          <p className={cn('col-span-3 flex items-start gap-1.5 text-text-secondary', SMALL)}>
            <TriangleAlert aria-hidden className="mt-0.5 size-3 shrink-0 text-warning" />
            <span className="tabular-nums">Não se comparam: o mercado de referência mudou junto com o perímetro em {sinceText}.</span>
          </p>

          {changes.map((item) => {
            const Icon = item.change === 'entered' ? Plus : Minus;
            return [
              <span className="mt-1 flex min-w-0 items-start gap-1.5" key={`${item.uf}-name`}>
                <Icon aria-hidden className="mt-0.5 size-3 shrink-0 text-text-secondary" strokeWidth={3} />
                <span className="flex min-w-0 flex-col">
                  <span className="text-xs leading-4 font-medium text-text-primary">{item.name}</span>
                  <span className={cn('text-text-muted', SMALL)}>{item.change === 'entered' ? 'entrou no perímetro' : 'saiu do perímetro'}</span>
                </span>
              </span>,
              <span className="mt-1 flex flex-col" key={`${item.uf}-previous`}>
                <ShareCell pair={item.previous} />
              </span>,
              <span className="mt-1 flex flex-col" key={`${item.uf}-current`}>
                <ShareCell pair={item.current} />
              </span>,
            ];
          })}
        </div>
      </div>
    </figure>
  );
}
