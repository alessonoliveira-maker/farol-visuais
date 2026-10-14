import { Filter, TriangleAlert } from 'lucide-react';
import { useMemo } from 'react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, weeklyTarget as defaultTarget, type SdrAgendas } from './data';

/**
 * Tabela com bullet inline por linha: agendas da semana contra a meta comum, em SVG puro por
 * célula. Faixas qualitativas de 0 a 70%, 70 a 100% e acima de 100% da meta; quem fica abaixo de
 * 70% ganha ícone e cor de alerta; quem passa do teto da escala ganha marca de estouro.
 */
export interface SdrBulletTableProps {
  readonly data?: readonly SdrAgendas[];
  readonly weeklyTarget?: number;
  readonly height?: number;
  readonly className?: string;
}

/** A escala do bullet vai até 150% da meta; acima disso a barra estoura e ganha marca. */
const SCALE_MAX_RATIO = 1.5;
/** Abaixo deste tanto da meta a linha ganha ícone e cor de alerta (nunca só a cor). */
const SEVERE_RATIO = 0.7;
const SCALE_PX = 152;
const VIEW_WIDTH = 160;
const VIEW_HEIGHT = 18;
const BAND_TOP = 3;
/** Espessura do trilho e da marca (ESP-2): piso de 12 px em cartão; a marca ocupa a mesma faixa do trilho. */
const BAND_HEIGHT = 12;
const MARK_TOP = BAND_TOP;
const MARK_HEIGHT = BAND_HEIGHT;
/** Opacidade crescente do mesmo token para separar as três faixas (ANO-4; padrão do bullet chart 13/02). */
const BAND_OPACITY_BELOW = 0.45;
const BAND_OPACITY_MID = 0.72;
const BAND_OPACITY_ABOVE = 1;

function xFor(ratio: number): number {
  return (Math.min(ratio, SCALE_MAX_RATIO) / SCALE_MAX_RATIO) * SCALE_PX;
}

export default function SdrBulletTable({
  data = defaultData,
  weeklyTarget = defaultTarget,
  height,
  className,
}: SdrBulletTableProps) {
  const rows = useMemo(
    () =>
      [...data]
        .map((row) => ({ ...row, ratio: weeklyTarget > 0 ? row.agendas / weeklyTarget : 0 }))
        .sort((a, b) => b.ratio - a.ratio),
    [data, weeklyTarget],
  );
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum SDR neste recorte: não há agendas para comparar contra a meta.</span>
      </div>
    );
  }

  const worst = rows[rows.length - 1];
  const best = rows[0];
  const summary =
    worst && best
      ? `Tabela com bullet inline das agendas de ${String(rows.length)} SDRs contra a meta semanal de ${formatInt(weeklyTarget)} agendas. ${best.name} lidera com ${formatInt(best.agendas)}, ${formatPercent(best.ratio, 0)} da meta. ${worst.name} fica abaixo de ${formatPercent(SEVERE_RATIO, 0)} da meta, com ${formatInt(worst.agendas)}.`
      : 'Tabela sem SDRs neste recorte.';

  const targetX = xFor(1);
  const band1 = xFor(SEVERE_RATIO);

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-line-subtle">
        <table className="w-full min-w-0 border-collapse text-xs">
          <thead>
            <tr className="border-b border-line-subtle bg-surface-overlay/60">
              <th className="px-2 py-1.5 text-left align-bottom text-[0.6875rem] font-medium text-text-secondary" scope="col">
                SDR
              </th>
              <th className="px-2 py-1.5 text-left align-bottom" scope="col">
                <span className="block text-[0.6875rem] font-medium text-text-secondary">Agendas da semana</span>
                <div className="mt-1 flex w-40 justify-between text-[0.6875rem] font-normal text-text-muted">
                  <span>{formatInt(0)}</span>
                  <span>meta {formatInt(weeklyTarget)}</span>
                  <span>{formatPercent(SCALE_MAX_RATIO, 0)}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const severe = row.ratio < SEVERE_RATIO;
              const overflow = row.ratio > SCALE_MAX_RATIO;
              const barX = xFor(row.ratio);
              const markColor = severe ? 'var(--negative)' : 'var(--chart-1)';
              return (
                <tr className="border-b border-line-subtle/60 last:border-0" key={row.id}>
                  <td className={cn('px-2 py-1.5 align-middle text-text-secondary', severe && 'font-semibold text-text-primary')}>
                    <span className="inline-flex items-center gap-1.5">
                      {severe ? <TriangleAlert aria-hidden className="size-3.5 shrink-0 text-negative" /> : null}
                      {row.name}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 align-middle">
                    <div className="flex items-center gap-2.5">
                      <svg className="h-[18px] w-40 shrink-0" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
                        <rect fill="var(--surface-sunken)" height={BAND_HEIGHT} opacity={BAND_OPACITY_BELOW} width={band1} x={0} y={BAND_TOP} />
                        <rect fill="var(--surface-sunken)" height={BAND_HEIGHT} opacity={BAND_OPACITY_MID} width={targetX - band1} x={band1} y={BAND_TOP} />
                        <rect fill="var(--surface-sunken)" height={BAND_HEIGHT} opacity={BAND_OPACITY_ABOVE} width={SCALE_PX - targetX} x={targetX} y={BAND_TOP} />
                        <rect fill={markColor} height={MARK_HEIGHT} rx={1} width={Math.max(barX, 2)} x={0} y={MARK_TOP} />
                        <line
                          stroke="var(--text-muted)"
                          strokeDasharray="3 3"
                          vectorEffect="non-scaling-stroke"
                          x1={targetX}
                          x2={targetX}
                          y1={0}
                          y2={VIEW_HEIGHT}
                        />
                        {overflow ? (
                          <path
                            d={`M ${String(SCALE_PX)} ${String(MARK_TOP - 1)} L ${String(VIEW_WIDTH - 2)} ${String(MARK_TOP + MARK_HEIGHT / 2)} L ${String(SCALE_PX)} ${String(MARK_TOP + MARK_HEIGHT + 1)} Z`}
                            fill={markColor}
                          />
                        ) : null}
                      </svg>
                      <span
                        className={cn('shrink-0 text-right font-display tabular-nums', severe && 'font-semibold text-text-primary')}
                      >
                        {formatInt(row.agendas)}{' '}
                        <span className="font-sans text-[0.6875rem] font-normal text-text-muted">agendas ({formatPercent(row.ratio, 0)})</span>
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        {formatInt(rows.length)} SDRs. A seta marca quem passou de {formatPercent(SCALE_MAX_RATIO, 0)} da meta.
      </p>
    </div>
  );
}
