import { Filter } from 'lucide-react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SegmentShare, type ShareData } from './data';

/**
 * Marcador em trilho em tabela: uma linha por segmento, com o trilho da menor à maior participação
 * do perímetro, a mediana como traço fino e o marcador na participação própria. Todas as linhas
 * usam a mesma escala, de 0% ao maior máximo da tabela, porque a pergunta é de nível e não só de
 * posição dentro de cada faixa.
 */
export interface ShareRailsProps {
  readonly data?: ShareData;
  readonly className?: string;
}

/** Diâmetro do marcador, em px: metade dele centra o marcador sobre o ponto (classe `size-3`). */
const MARKER_RADIUS = 6;
/** Colunas de largura fixa, em classes do Tailwind: o trilho fica com o que sobra. */
const NAME_COL = 'w-36';
const SHARE_COL = 'w-14';
const RANK_COL = 'w-20';
const RANGE_COL = 'w-28';
/** Limite da frase acessível por extenso; acima dele ela cai para a forma com contagens (ACE-1). */
const SUMMARY_FULL_LIMIT = 240;

interface Row {
  readonly segment: SegmentShare;
  readonly min: number;
  readonly max: number;
  readonly median: number;
  /** Tamanho do perímetro: os concorrentes mais a própria empresa. */
  readonly size: number;
  readonly rank: number;
}

/** Mediana de uma lista de participações; `null` para lista vazia (EST-1b). */
function medianOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const upper = sorted[mid];
  const lower = sorted[mid - 1];
  if (upper === undefined) return null;
  return sorted.length % 2 === 1 || lower === undefined ? upper : (lower + upper) / 2;
}

function rowOf(segment: SegmentShare): Row | null {
  const perimeter = [...segment.peers, segment.own];
  const median = medianOf(perimeter);
  if (median === null) return null;
  return {
    segment,
    min: Math.min(segment.own, ...segment.peers),
    max: Math.max(segment.own, ...segment.peers),
    median,
    size: perimeter.length,
    rank: 1 + segment.peers.filter((peer) => peer > segment.own).length,
  };
}

const ordinal = (row: Row) => `${formatInt(row.rank)}º de ${formatInt(row.size)}`;

export default function ShareRails({ data = defaultData, className }: ShareRailsProps) {
  const rows = data.segments
    .map(rowOf)
    .filter((row): row is Row => row !== null)
    .sort((a, b) => b.segment.own - a.segment.own);

  if (rows.length === 0) {
    return (
      <div
        aria-label="Lista de segmentos vazia: o recorte não tem segmentos com concorrentes no perímetro."
        className={cn('flex h-full w-full min-w-0 items-center justify-center', className)}
        role="status"
      >
        <p className="inline-flex items-center gap-2 text-xs text-text-muted">
          <Filter aria-hidden className="size-4" />O recorte não tem segmentos no perímetro, então não há trilho a desenhar.
        </p>
      </div>
    );
  }

  const scaleMax = Math.max(...rows.map((row) => row.max));
  const scaleLabel = `de ${formatPercent(0, 0)} a ${formatPercent(scaleMax, 1)}`;
  const ratioOf = (value: number) => value / scaleMax;
  const percentOf = (value: number) => `${String(ratioOf(value) * 100)}%`;

  const above = rows.filter((row) => row.segment.own > row.median);
  const below = rows.filter((row) => row.segment.own < row.median);
  const names = (list: readonly Row[]) => (list.length === 0 ? 'nenhum' : list.map((row) => row.segment.name).join(', '));
  const leader = rows[0];
  const last = rows.at(-1);

  const head = `Marcador em trilho da participação própria em ${formatInt(rows.length)} segmentos, na escala comum ${scaleLabel}.`;
  const full = `${head} Acima da mediana do perímetro: ${names(above)}. Abaixo: ${names(below)}.`;
  const short = `${head} ${formatInt(above.length)} acima da mediana do perímetro e ${formatInt(below.length)} abaixo.${
    leader && last ? ` Lidera ${leader.segment.name}, em ${ordinal(leader)}; a menor é ${last.segment.name}, em ${ordinal(last)}.` : ''
  }`;
  const summary = full.length <= SUMMARY_FULL_LIMIT ? full : short;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-1', className)} role="img">
      <p className="truncate text-xs font-medium text-text-secondary">Perímetro: {data.perimeter}</p>
      <p aria-hidden className="text-xs text-text-secondary tabular-nums">
        <span className="font-semibold text-text-primary">
          {formatInt(above.length)} de {formatInt(rows.length)}
        </span>{' '}
        segmentos acima da mediana do perímetro
      </p>
      <p aria-hidden className="text-[0.6875rem] text-text-muted tabular-nums">
        Escala comum {scaleLabel} em todas as linhas.
      </p>

      <div aria-hidden className="mt-2 flex min-w-0 flex-1 flex-col text-xs">
        <div className="flex h-5 min-w-0 items-center gap-3 text-[0.6875rem] text-text-muted tabular-nums">
          <span className={cn('shrink-0', NAME_COL)}>Segmento</span>
          <span className="flex min-w-0 flex-1 justify-between">
            <span>{formatPercent(0, 0)}</span>
            <span>{formatPercent(scaleMax, 1)}</span>
          </span>
          <span className={cn('shrink-0 text-right', SHARE_COL)}>Própria</span>
          <span className={cn('shrink-0 text-right', RANK_COL)}>Posição</span>
          <span className={cn('shrink-0 text-right', RANGE_COL)}>Faixa</span>
        </div>

        {rows.map((row) => (
          <div className="flex h-9 min-w-0 items-center gap-3 tabular-nums" key={row.segment.id}>
            <span className={cn('shrink-0 text-text-secondary', NAME_COL)}>{row.segment.name}</span>
            <div className="relative h-4 min-w-0 flex-1">
              <div className="absolute inset-x-0 inset-y-0 m-auto h-px bg-line-subtle" />
              <div
                className="absolute inset-y-0 m-auto h-1.5 rounded-full bg-line-strong"
                style={{ left: percentOf(row.min), width: `${String(ratioOf(row.max - row.min) * 100)}%` }}
              />
              <div className="absolute inset-y-0 w-px bg-text-muted" style={{ left: percentOf(row.median) }} />
              <div
                className="absolute inset-y-0 my-auto size-3 rounded-full bg-chart-1"
                style={{ left: `calc(${percentOf(row.segment.own)} - ${String(MARKER_RADIUS)}px)` }}
              />
            </div>
            <span className={cn('kpi-number shrink-0 text-right font-semibold text-text-primary', SHARE_COL)}>{formatPercent(row.segment.own, 1)}</span>
            <span className={cn('shrink-0 text-right text-text-secondary', RANK_COL)}>{ordinal(row)}</span>
            <span className={cn('shrink-0 text-right text-text-muted', RANGE_COL)}>
              {formatPercent(row.min, 1)} a {formatPercent(row.max, 1)}
            </span>
          </div>
        ))}
      </div>

      <p aria-hidden className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-chart-1" />
          participação própria
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-4 w-px bg-text-muted" />
          mediana do perímetro
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-line-strong" />
          da menor à maior participação
        </span>
      </p>
    </div>
  );
}
