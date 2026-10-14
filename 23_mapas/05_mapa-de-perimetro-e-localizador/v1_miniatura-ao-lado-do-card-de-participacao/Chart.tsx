import { Filter, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatDate, formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, HEX_GRID, type PerimeterShare, type Provenance, type UfCode } from './data';

/**
 * Cartão de participação de mercado com a miniatura do perímetro ao lado: o número, a legenda que
 * diz a que recorte geográfico ele se refere e um mapa localizador de 120 px, com as UFs do
 * perímetro acesas sobre a malha do país. Responde "este percentual vale para quais UFs" num
 * relance, sem transformar o mapa em gráfico: ele é contexto, e por isso é decorativo para o leitor
 * de tela, que recebe as UFs pela frase da raiz.
 */
export interface PerimeterLocatorCardProps {
  readonly data?: PerimeterShare;
  readonly height?: number;
  readonly className?: string;
}

/** Largura da miniatura, em px: a malha inteira é escalada para caber nela. */
const MINIATURE_W = 120;
/** Espessura visível do contorno externo do perímetro. */
const CONTOUR_W = 1.5;
/** Traço da segunda passada, na cor do preenchimento: fecha a emenda entre hexágonos vizinhos. */
const SEAM_W = 1;
/** A primeira passada desenha o dobro do contorno, porque a metade de dentro some sob o preenchimento. */
const FIRST_PASS_W = 2 * CONTOUR_W + SEAM_W;
const MESH_STROKE_W = 1;
/** Respiro do viewBox: o contorno externo cai para fora do hexágono e não pode ser cortado. */
const PAD = CONTOUR_W + SEAM_W / 2 + 0.5;

const PROVENANCE: Record<Provenance, { readonly label: string; readonly tone: string }> = {
  medido: { label: 'MEDIDO', tone: 'text-prov-medido' },
  derivado: { label: 'DERIVADO', tone: 'text-prov-derivado' },
  premissa: { label: 'PREMISSA', tone: 'text-prov-premissa' },
  lacuna: { label: 'LACUNA', tone: 'text-prov-lacuna' },
};

interface HexCell {
  readonly uf: UfCode;
  readonly points: string;
}

interface Layout {
  readonly cells: readonly HexCell[];
  readonly width: number;
  readonly height: number;
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
 * Geometria pura, calculada uma vez. A malha é montada em unidades de célula (largura 1), medida, e
 * só então escalada para a miniatura fechar em MINIATURE_W. Os hexágonos se tocam sem vão: é o que
 * deixa o preenchimento da segunda passada cobrir as bordas internas do perímetro.
 */
function buildLayout(): Layout {
  const unitRadius = 1 / Math.sqrt(3);
  const raw = (Object.keys(HEX_GRID) as UfCode[]).map((uf) => {
    const position = HEX_GRID[uf];
    return { uf, x: position.column + (position.row % 2 === 1 ? 0.5 : 0), y: position.row * unitRadius * 1.5 };
  });
  // Limites da malha: ela é constante e nunca vazia, e o laço dispensa o spread sobre lista.
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const cell of raw) {
    minX = Math.min(minX, cell.x - 0.5);
    maxX = Math.max(maxX, cell.x + 0.5);
    minY = Math.min(minY, cell.y - unitRadius);
    maxY = Math.max(maxY, cell.y + unitRadius);
  }
  const hexWidth = (MINIATURE_W - 2 * PAD) / (maxX - minX);
  const radius = hexWidth * unitRadius;
  const cells = raw.map((cell) => ({
    uf: cell.uf,
    points: hexPoints(PAD + (cell.x - minX) * hexWidth, PAD + (cell.y - minY) * hexWidth, radius),
  }));
  return { cells, width: MINIATURE_W, height: Math.ceil((maxY - minY) * hexWidth + 2 * PAD) };
}

const LAYOUT = buildLayout();

/** Participação: receita sobre mercado. Sem mercado de referência não há taxa, e ausência não é zero. */
function shareOf(revenue: number, market: number): number | null {
  if (market <= 0) return null;
  return revenue / market;
}

function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1] ?? ''}`;
}

function ufCount(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'UF' : 'UFs'}`;
}

/** O cartão é a própria peça (moldura `stage`): borda, fundo e respiro são dele. */
const CARD = 'rounded-lg border border-line-subtle bg-surface-raised p-4';

export default function PerimeterLocatorCard({ data = defaultData, height, className }: PerimeterLocatorCardProps) {
  const style = height === undefined ? undefined : { height };

  if (data.perimeter.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', CARD, className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF no perímetro declarado: sem perímetro a participação não tem a que se referir.</span>
      </div>
    );
  }

  const inside = new Set<UfCode>(data.perimeter);
  const share = shareOf(data.revenue, data.market);
  const provenance = PROVENANCE[data.provenance];
  const shareText = share === null ? formatUnavailable() : formatPercent(share, 1);
  // As duas parcelas saem uma vez daqui e servem ao corpo e à frase acessível, para os dois nunca divergirem.
  const revenueText = `${formatCurrencyCompact(data.revenue)} de receita`;
  const marketText = `em ${formatCurrencyCompact(data.market)} de mercado`;
  const sinceText = formatDate(data.validSince);

  const summary =
    `Cartão de KPI ${provenance.label.toLowerCase()}: ${data.label.toLowerCase()} de ${shareText} no perímetro ${data.perimeterName}, ` +
    `${revenueText} ${marketText}. São ${ufCount(data.perimeter.length)}: ${joinList(data.perimeter)}. Vigente desde ${sinceText}.`;

  return (
    <article aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', CARD, className)} role="group" style={style}>
      <div className="flex items-baseline justify-between gap-2 text-[0.6875rem] leading-none">
        <p className={cn('font-semibold', provenance.tone)}>{provenance.label}</p>
        <p className="shrink-0 text-text-muted tabular-nums">{formatMonthShort(data.referenceMonth)}</p>
      </div>

      <div className="mt-2 flex min-h-0 flex-1 items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col self-stretch">
          <p className="text-xs font-medium text-text-secondary">{data.label}</p>
          {share === null ? (
            <p className="mt-1 flex h-7.5 items-center gap-2 text-text-muted">
              <Unplug aria-hidden className="size-5 shrink-0" />
              <span className="font-display text-xl leading-none">{shareText}</span>
            </p>
          ) : (
            <p className="kpi-number mt-1 text-3xl leading-none font-semibold text-text-primary">{shareText}</p>
          )}
          <p className="mt-1.5 text-xs font-medium text-text-primary">no perímetro {data.perimeterName}</p>
          <p className="mt-1 text-[0.6875rem] leading-tight text-text-muted tabular-nums">
            <span className="block">{revenueText}</span>
            <span className="block">{marketText}</span>
          </p>

          <p className="mt-auto pt-1 text-[0.6875rem] leading-tight text-text-muted tabular-nums">
            {ufCount(data.perimeter.length)}, desde {sinceText}
          </p>
        </div>

        {/* Escala 1: largura e altura iguais ao viewBox. Decorativa: a frase da raiz já nomeia as UFs. */}
        <svg aria-hidden className="shrink-0" height={LAYOUT.height} viewBox={`0 0 ${String(LAYOUT.width)} ${String(LAYOUT.height)}`} width={LAYOUT.width}>
          {/* Fora do perímetro: tom neutro. O poço mede 1,15:1 contra o cartão, então quem segura a silhueta é o traço. */}
          {LAYOUT.cells.map((cell) =>
            inside.has(cell.uf) ? null : (
              <polygon fill="var(--surface-sunken)" key={cell.uf} points={cell.points} stroke="var(--line-strong)" strokeWidth={MESH_STROKE_W} />
            ),
          )}
          {/* Primeira passada: os hexágonos do perímetro só com o contorno grosso. */}
          {LAYOUT.cells.map((cell) =>
            inside.has(cell.uf) ? (
              <polygon fill="none" key={cell.uf} points={cell.points} stroke="var(--text-primary)" strokeLinejoin="round" strokeWidth={FIRST_PASS_W} />
            ) : null,
          )}
          {/* Segunda passada, sempre DEPOIS da primeira: o preenchimento cobre a metade interna do contorno e
              todas as bordas entre vizinhos, e sobra só o contorno externo, sem dissolver polígono nenhum. */}
          {LAYOUT.cells.map((cell) =>
            inside.has(cell.uf) ? (
              <polygon fill="var(--chart-1)" key={cell.uf} points={cell.points} stroke="var(--chart-1)" strokeWidth={SEAM_W} />
            ) : null,
          )}
        </svg>
      </div>
    </article>
  );
}
