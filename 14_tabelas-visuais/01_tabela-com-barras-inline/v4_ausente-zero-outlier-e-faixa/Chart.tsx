import { Filter, Unplug } from 'lucide-react';
import { useMemo } from 'react';

import { formatCurrency, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginMetric } from './data';

/**
 * Tabela com três colunas de caso difícil: CPL (indisponível e zero medido não são a mesma
 * coisa), volume (um outlier truncado num teto declarado, com o valor real escrito) e margem
 * (ponto e intervalo cruzando o zero, com amostra de um negócio mostrando só o ponto). HTML com
 * Tailwind; o ponto e o intervalo são SVG puro com geometria calculada aqui.
 */
export interface OriginEdgeCaseTableProps {
  readonly data?: readonly OriginMetric[];
  readonly height?: number;
  readonly className?: string;
}

const CPL_TRACK_HEIGHT = 12;
const VOLUME_TRACK_HEIGHT = 12;
/** Teto do volume é 1,15 vez o segundo maior valor, quando o maior passa do dobro do segundo. */
const OUTLIER_MULTIPLE = 2;
const OUTLIER_HEADROOM = 1.15;
const MARGIN_VIEW_WIDTH = 140;
const MARGIN_VIEW_HEIGHT = 16;

function signedPercent(fraction: number, digits = 1): string {
  // NUM-3: sinal à mão com o menos tipográfico, formatPercent recebe sempre o valor absoluto.
  return `${fraction >= 0 ? '+' : '−'}${formatPercent(Math.abs(fraction), digits)}`;
}

export default function OriginEdgeCaseTable({ data = defaultData, height, className }: OriginEdgeCaseTableProps) {
  const rows = data;
  const style = height === undefined ? undefined : { height };

  // Domínios calculados uma vez sobre o recorte inteiro, nunca por linha (seção 12 da família).
  // O hook vem antes de qualquer retorno condicional (react-hooks/rules-of-hooks); com o recorte
  // vazio todo valor cai no default (0/false) sem lançar, e o resultado nem chega a ser usado.
  const { cplMax, volumeDomainMax, volumeTruncated, marginLimit } = useMemo(() => {
    const cplValues = rows.flatMap((row) => (row.cpl === null ? [] : [row.cpl]));
    const volumes = [...rows.map((row) => row.volume)].sort((a, b) => b - a);
    const highest = volumes[0] ?? 0;
    const secondHighest = volumes[1] ?? highest;
    const truncated = secondHighest > 0 && highest > secondHighest * OUTLIER_MULTIPLE;
    const marginValues = rows.flatMap((row) => [row.marginCentral, row.marginMin ?? undefined, row.marginMax ?? undefined].filter((v): v is number => v !== undefined));
    return {
      cplMax: cplValues.length > 0 ? Math.max(...cplValues) : 0,
      volumeDomainMax: truncated ? Math.ceil(secondHighest * OUTLIER_HEADROOM) : highest,
      volumeTruncated: truncated,
      marginLimit: marginValues.length > 0 ? Math.max(...marginValues.map(Math.abs)) : 1,
    };
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não há CPL, volume nem margem para comparar.</span>
      </div>
    );
  }

  const maxVolume = Math.max(...rows.map((row) => row.volume));
  const unavailable = rows.find((row) => row.cpl === null);
  const outlier = rows.find((row) => row.volume === maxVolume);
  const single = rows.find((row) => row.n === 1);
  const summary = [
    `Tabela com CPL, volume e margem de ${String(rows.length)} origens de lead em agosto de 2026.`,
    unavailable ? `${unavailable.name} tem CPL ${formatUnavailable()}.` : '',
    outlier && volumeTruncated ? `${outlier.name} tem ${formatInt(outlier.volume)} leads, muito acima das demais.` : '',
    single ? `${single.name} tem margem de um único negócio, sem faixa.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const marginX = (value: number): number => MARGIN_VIEW_WIDTH / 2 + (value / marginLimit) * (MARGIN_VIEW_WIDTH / 2);
  const marginZeroX = MARGIN_VIEW_WIDTH / 2;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-line-subtle">
        <table className="w-full min-w-0 border-collapse text-xs">
          <thead>
            <tr className="border-b border-line-subtle bg-surface-overlay/60">
              <th className="px-2 py-1 text-left align-bottom text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Origem
              </th>
              <th className="w-32 px-2 py-1 text-left align-bottom" scope="col">
                <span className="block text-[0.6875rem] font-medium text-text-secondary">CPL qualificado</span>
                <span className="block text-[0.6875rem] text-text-muted">
                  {formatCurrency(0, 0)} a {formatCurrency(cplMax, 0)}
                </span>
              </th>
              <th className="w-40 px-2 py-1 text-left align-bottom" scope="col">
                <span className="block text-[0.6875rem] font-medium text-text-secondary">Volume de leads</span>
                <span className="block text-[0.6875rem] text-text-muted">
                  {volumeTruncated ? `teto do gráfico: ${formatInt(volumeDomainMax)} leads` : `0 a ${formatInt(volumeDomainMax)} leads`}
                </span>
              </th>
              <th className="px-2 py-1 text-left align-bottom" scope="col">
                <span className="block text-[0.6875rem] font-medium text-text-secondary">Margem (ponto e faixa)</span>
                <span className="block text-[0.6875rem] text-text-muted">
                  {signedPercent(-marginLimit, 0)} a {signedPercent(marginLimit, 0)}; linha cinza é o zero
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const cplPct = row.cpl !== null && cplMax > 0 ? (row.cpl / cplMax) * 100 : 0;
              const volumePct = volumeDomainMax > 0 ? Math.min((row.volume / volumeDomainMax) * 100, 100) : 0;
              const hasInterval = row.marginMin !== null && row.marginMax !== null;
              return (
                <tr className="border-b border-line-subtle/60 last:border-0" key={row.id}>
                  <td className="px-2 py-1 align-middle whitespace-nowrap text-text-secondary">{row.name}</td>
                  <td className="px-2 py-1 align-middle">
                    {row.cpl === null ? (
                      <span className="inline-flex items-center gap-1.5 text-text-muted">
                        <Unplug aria-hidden className="size-3.5 shrink-0" />
                        <span className="font-display text-[0.6875rem]">{formatUnavailable()}</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="relative min-w-0 flex-1 rounded-full bg-surface-sunken" style={{ height: CPL_TRACK_HEIGHT }}>
                          {row.cpl === 0 ? (
                            <span
                              aria-hidden
                              className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full border-[1.5px] border-text-secondary bg-surface-raised"
                              style={{ left: 0 }}
                            />
                          ) : (
                            <div className="h-full rounded-full bg-chart-1" style={{ width: `${String(cplPct)}%` }} />
                          )}
                        </div>
                        <span className="w-16 shrink-0 text-right font-display tabular-nums text-text-secondary">{formatCurrency(row.cpl, 2)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-1 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="relative min-w-0 flex-1 rounded-full bg-surface-sunken" style={{ height: VOLUME_TRACK_HEIGHT }}>
                        <div className="h-full rounded-full bg-chart-1" style={{ width: `${String(volumePct)}%` }} />
                        {volumeTruncated && row.volume >= volumeDomainMax ? (
                          <svg aria-hidden className="absolute top-0 right-0 h-full w-2.5" viewBox="0 0 10 12">
                            <line stroke="var(--surface-raised)" strokeWidth={2} vectorEffect="non-scaling-stroke" x1={3} x2={7} y1={0} y2={12} />
                            <line stroke="var(--surface-raised)" strokeWidth={2} vectorEffect="non-scaling-stroke" x1={7} x2={11} y1={0} y2={12} />
                          </svg>
                        ) : null}
                      </div>
                      <span className="w-16 shrink-0 text-right font-display tabular-nums text-text-secondary">{formatInt(row.volume)}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1 align-middle">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-[140px] shrink-0" viewBox={`0 0 ${String(MARGIN_VIEW_WIDTH)} ${String(MARGIN_VIEW_HEIGHT)}`}>
                        <line stroke="var(--line-strong)" strokeWidth={1} vectorEffect="non-scaling-stroke" x1={marginZeroX} x2={marginZeroX} y1={0} y2={MARGIN_VIEW_HEIGHT} />
                        {hasInterval && row.marginMin !== null && row.marginMax !== null ? (
                          <line
                            stroke="var(--chart-1)"
                            strokeLinecap="round"
                            strokeWidth={2}
                            vectorEffect="non-scaling-stroke"
                            x1={marginX(row.marginMin)}
                            x2={marginX(row.marginMax)}
                            y1={MARGIN_VIEW_HEIGHT / 2}
                            y2={MARGIN_VIEW_HEIGHT / 2}
                          />
                        ) : null}
                        <circle cx={marginX(row.marginCentral)} cy={MARGIN_VIEW_HEIGHT / 2} fill="var(--chart-1)" r={3} />
                      </svg>
                      <span className="shrink-0 font-display tabular-nums text-text-secondary">
                        {signedPercent(row.marginCentral)}
                        {row.n === 1 ? <span className="ml-1 font-sans text-[0.6875rem] font-normal text-text-muted">(n=1)</span> : null}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p aria-hidden className="mt-1.5 shrink-0 text-[0.6875rem] text-text-muted">
        {formatInt(rows.length)} origens. Traço cortado no volume marca truncamento; o número ao lado é o valor real.
      </p>
    </div>
  );
}
