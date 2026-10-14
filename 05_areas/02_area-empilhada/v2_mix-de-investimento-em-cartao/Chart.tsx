import { Filter } from 'lucide-react';
import { Area, ComposedChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatDecimal, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyMediaMix } from './data';

/**
 * Área empilhada micro num cartão pequeno: a participação da busca paga no mix de mídia dos
 * últimos 12 meses, com o eixo escondido (não removido) e a busca paga em chart-1 sobre as
 * demais plataformas em neutro. O total investido e a participação de cada bloco vêm escritos
 * na linha de leitura, o todo e as partes na mesma frase.
 */
export interface MediaMixMicroAreaProps {
  readonly data?: readonly MonthlyMediaMix[];
  readonly height?: number;
  readonly className?: string;
}

/** Plataforma em foco: única cor de destaque do cartão. */
const FOCUS_FILL = 'var(--chart-1)';
/** As demais plataformas dividem o mesmo neutro; só o separador entre elas muda. */
const REST_FILL = 'var(--line-strong)';
const LAYER_STROKE = 'var(--surface-raised)';
const REST_OPACITY = 0.55;
const MARGIN = { top: 4, right: 2, bottom: 0, left: 2 } as const;

export default function MediaMixMicroArea({ data = defaultData, height, className }: MediaMixMicroAreaProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não houve investimento em mídia paga no período.</span>
      </div>
    );
  }

  const rows = data.map((row) => ({
    ...row,
    total: row.buscaPaga + row.redesSociais + row.programatica + row.outros,
  }));
  const first = rows[0];
  const last = rows[rows.length - 1];
  const firstShare = first && first.total > 0 ? first.buscaPaga / first.total : 0;
  const lastShare = last && last.total > 0 ? last.buscaPaga / last.total : 0;
  const deltaPoints = (lastShare - firstShare) * 100;
  const restShare = 1 - lastShare;

  const summary = first && last
    ? `Área empilhada micro do investimento mensal em mídia paga, ${formatInt(rows.length)} meses. ` +
      `Total em ${formatMonthShort(last.month)}: ${formatCurrencyCompact(last.total)}, sendo ${formatPercent(lastShare, 0)} em busca paga e ${formatPercent(restShare, 0)} nas demais. ` +
      `Ganhou ${formatDecimal(Math.abs(deltaPoints), 0)} p.p. de participação no período.`
    : 'Área empilhada micro do investimento mensal em mídia paga por plataforma.';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {last ? (
        <div aria-hidden className="mb-1 shrink-0">
          <p className="text-xs text-text-secondary">
            Participação da <span className="font-semibold text-text-primary">busca paga</span> no mix
          </p>
          <p className="kpi-number text-3xl leading-none font-semibold text-text-primary">
            {formatPercent(lastShare, 0)}
          </p>
          <p className="mt-1 tabular-nums text-xs text-text-secondary">
            {deltaPoints >= 0 ? '+' : '−'}
            {formatDecimal(Math.abs(deltaPoints), 0)} p.p. em {formatInt(rows.length)} meses · total{' '}
            {formatCurrencyCompact(last.total)}
          </p>
        </div>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <XAxis dataKey="month" hide />
            <YAxis domain={[0, 'dataMax']} hide />
            <Area
              dataKey="buscaPaga"
              fill={FOCUS_FILL}
              fillOpacity={0.9}
              isAnimationActive={animate}
              name="Busca paga"
              stackId="mix"
              stroke={LAYER_STROKE}
              strokeWidth={1.5}
              type="monotone"
            />
            <Area
              dataKey="redesSociais"
              fill={REST_FILL}
              fillOpacity={REST_OPACITY}
              isAnimationActive={animate}
              name="Redes sociais"
              stackId="mix"
              stroke={LAYER_STROKE}
              strokeWidth={1.5}
              type="monotone"
            />
            <Area
              dataKey="programatica"
              fill={REST_FILL}
              fillOpacity={REST_OPACITY}
              isAnimationActive={animate}
              name="Programática"
              stackId="mix"
              stroke={LAYER_STROKE}
              strokeWidth={1.5}
              type="monotone"
            />
            <Area
              dataKey="outros"
              fill={REST_FILL}
              fillOpacity={REST_OPACITY}
              isAnimationActive={animate}
              name="Outros"
              stackId="mix"
              stroke={LAYER_STROKE}
              strokeWidth={1.5}
              type="monotone"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
