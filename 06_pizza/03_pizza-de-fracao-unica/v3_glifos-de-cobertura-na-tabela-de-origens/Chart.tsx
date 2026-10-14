import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatInt, formatMonthLong, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, month as defaultMonth, type OriginCoverage } from './data';

/**
 * Coluna de glifos de fração dentro de uma tabela: um setor de 20 px por origem, desenhado como
 * `path` de arco em SVG puro, com a geometria calculada aqui em TypeScript. Não há um `PieChart`
 * por linha de propósito: sete instâncias de Recharts numa tabela custam sete medições de caixa e
 * sete animações para desenhar o que um arco resolve. O glifo dá o relance; quem mede fino é o
 * percentual escrito ao lado, que existe em toda linha.
 */
export interface OriginCoverageTableProps {
  readonly data?: readonly OriginCoverage[];
  readonly month?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Raio do glifo em pixels: 20 px de diâmetro, o degrau baixo da faixa de 16 a 24 px do modelo. */
const GLYPH_RADIUS = 10;
const GLYPH_SIZE = GLYPH_RADIUS * 2;
/** Abaixo de 10 leads a fração sozinha engana, e a linha sai pelo par de volume e taxa. */
const MIN_BASE = 10;

/** Coordenada de `path` com duas casas: o arredondamento não é número de tela, é geometria. */
function coord(value: number): string {
  return value.toFixed(2);
}

/**
 * Setor a partir das 12 horas, no sentido horário, para fração entre 0 e 1 exclusivos. Um único
 * arco não fecha o círculo: em 1 o ponto final coincide com o inicial e o `path` degenera, então
 * a fração cheia é tratada fora daqui, como círculo.
 */
function wedgePath(fraction: number, radius: number): string {
  const angle = -Math.PI / 2 + fraction * 2 * Math.PI;
  const x = radius + radius * Math.cos(angle);
  const y = radius + radius * Math.sin(angle);
  const largeArc = fraction > 0.5 ? '1' : '0';
  return `M ${coord(radius)} ${coord(radius)} L ${coord(radius)} 0 A ${coord(radius)} ${coord(radius)} 0 ${largeArc} 1 ${coord(x)} ${coord(y)} Z`;
}

/** Fração coberta da origem, nula quando não houve lead a medir: ausência nunca vira zero. */
function coverageOf(row: OriginCoverage): number | null {
  return row.leads > 0 ? row.qualified / row.leads : null;
}

/** Cobertura decrescente, com a origem sem base medida no fim da tabela. */
function byCoverageDesc(left: OriginCoverage, right: OriginCoverage): number {
  const a = coverageOf(left);
  const b = coverageOf(right);
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return b - a;
}

/** Glifo de fração única: trilho do todo e setor da parte, mesma geometria em toda linha. */
function CoverageGlyph({ fraction }: { readonly fraction: number }): ReactElement {
  return (
    <svg aria-hidden className="shrink-0" height={GLYPH_SIZE} viewBox={`0 0 ${String(GLYPH_SIZE)} ${String(GLYPH_SIZE)}`} width={GLYPH_SIZE}>
      {/* Trilho é o todo existente, em neutro de dado: nunca --surface-overlay, que no tema claro
          é o mesmo branco do cartão e faria o glifo sumir da tabela. */}
      <circle cx={GLYPH_RADIUS} cy={GLYPH_RADIUS} fill="var(--line-strong)" r={GLYPH_RADIUS} />
      {fraction >= 1 ? (
        <circle cx={GLYPH_RADIUS} cy={GLYPH_RADIUS} fill="var(--chart-1)" r={GLYPH_RADIUS} />
      ) : fraction > 0 ? (
        <path d={wedgePath(fraction, GLYPH_RADIUS)} fill="var(--chart-1)" />
      ) : null}
    </svg>
  );
}

export default function OriginCoverageTable({
  data = defaultData,
  month = defaultMonth,
  height,
  className,
}: OriginCoverageTableProps): ReactElement {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: a tabela de cobertura fica vazia até o filtro devolver leads.</span>
      </div>
    );
  }

  const rows = [...data].sort(byCoverageDesc);
  const totalLeads = rows.reduce((sum, row) => sum + row.leads, 0);
  const totalQualified = rows.reduce((sum, row) => sum + row.qualified, 0);
  /** O par de extremos vem da tabela já ordenada, e cada um leva nome, taxa e volume. */
  const first = rows[0] ?? null;
  const last = rows[rows.length - 1] ?? null;
  const namedRate = (row: OriginCoverage | null): string =>
    row === null ? 'nenhuma origem medida' : `${row.name}, ${formatRateWithVolume(row.qualified, row.leads)}`;

  const summary = `Tabela de ${formatInt(rows.length)} origens de lead com a cobertura de qualificação de ${formatMonthLong(month)}, um glifo de fração por linha. Maior em ${namedRate(first)}; menor em ${namedRate(last)}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <table className="w-full min-w-0 border-collapse">
        <thead>
          <tr className="border-b border-line-subtle">
            <th className="pb-1.5" scope="col">
              <span className="sr-only">glifo da fração coberta</span>
            </th>
            <th className="pb-1.5 pl-2 text-left text-[0.6875rem] font-medium text-text-secondary" scope="col">
              origem
            </th>
            <th className="pb-1.5 pl-3 text-right text-[0.6875rem] font-medium text-text-secondary" scope="col">
              cobertura
            </th>
            <th className="pb-1.5 pl-3 text-right text-[0.6875rem] font-medium text-text-secondary" scope="col">
              base
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const fraction = coverageOf(row);
            const smallBase = row.leads < MIN_BASE;
            return (
              <tr key={row.id}>
                {/* O glifo vai dentro de um contêiner flex, e isso não é enfeite: em fluxo de
                    texto o SVG fica na linha de base e o espaço do descendente engorda a linha,
                    que no preview serializado somou 6,5 px por linha e deslocou a tabela inteira.
                    Como item de flex ele perde a linha de base e a altura da linha para de depender
                    da fonte. */}
                <td className="w-5 py-2">
                  <div className="flex items-center">
                    {fraction === null ? (
                      <Unplug aria-hidden className="size-4 shrink-0 text-text-muted" />
                    ) : (
                      <CoverageGlyph fraction={fraction} />
                    )}
                  </div>
                </td>
                {/* Nome inteiro, sem reticência: o nome é a identidade da marca, e a TIP-7 só
                    libera truncar texto de apoio. A coluna fica com a largura que sobra das duas
                    de número, que é mais que o suficiente para a origem mais longa. */}
                <th className="py-2 pr-3 pl-2 text-left text-xs font-medium text-text-primary" scope="row">
                  {row.name}
                </th>
                {/* Percentual sempre escrito, em toda linha: o glifo dá o relance e o número decide.
                    Base pequena sai pelo par de volume e taxa, que é o que a seção 8 manda. */}
                <td className="kpi-number py-2 pl-3 text-right text-xs whitespace-nowrap text-text-primary">
                  {fraction === null
                    ? formatUnavailable()
                    : smallBase
                      ? formatRateWithVolume(row.qualified, row.leads)
                      : formatPercent(fraction, 1)}
                </td>
                <td className="py-2 pl-3 text-right text-[0.6875rem] whitespace-nowrap text-text-muted tabular-nums">
                  {fraction === null ? 'sem lead no mês' : smallBase ? 'base pequena' : `${formatInt(row.qualified)} de ${formatInt(row.leads)}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-[0.6875rem] leading-snug text-text-muted tabular-nums">
        Em {formatMonthLong(month)}, {formatRateWithVolume(totalQualified, totalLeads)} dos leads têm qualificação registrada.
      </p>
      <p className="mt-1 text-[0.6875rem] leading-snug text-text-muted">
        Ordenada pela cobertura; o glifo é o mesmo em toda linha e quem mede fino é o percentual.
      </p>
    </div>
  );
}
