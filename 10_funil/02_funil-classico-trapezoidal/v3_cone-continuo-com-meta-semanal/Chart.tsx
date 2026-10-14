import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, ComposedChart, LabelList, Line, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, weekLabel as defaultWeekLabel, type FunnelStageWithTarget } from './data';

/**
 * Afunilamento contínuo em faixa horizontal: a faixa colorida (uma Area empilhada sobre uma base
 * transparente) estreita da esquerda para a direita conforme o volume cai, e o contorno tracejado
 * é a meta semanal na mesma escala. O eixo de valor fica oculto de propósito: a forma é só
 * impressão de conjunto, e o valor de cada etapa vem escrito no eixo de categoria, nunca da altura
 * desenhada (ver Quando evitar no README do modelo).
 */
export interface ContinuousFunnelConeProps {
  readonly data?: readonly FunnelStageWithTarget[];
  readonly weekLabel?: string;
  readonly height?: number;
  readonly className?: string;
}

const BAND_FILL = 'var(--chart-1)';
const MARGIN = { top: 8, right: 78, bottom: 8, left: 78 } as const;

interface ConeRow extends FunnelStageWithTarget {
  readonly base: number;
  readonly band: number;
  readonly metaUpper: number;
  readonly metaLower: number;
}

export default function ContinuousFunnelCone({
  data = defaultData,
  weekLabel = defaultWeekLabel,
  height,
  className,
}: ContinuousFunnelConeProps) {
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
        <span>Nenhuma etapa neste recorte: não há dado de funil para {weekLabel}.</span>
      </div>
    );
  }

  const domainMax = data.reduce((max, row) => Math.max(max, row.value, row.target), 0) * 1.08;
  const center = domainMax / 2;
  const rows: readonly ConeRow[] = data.map((row) => ({
    ...row,
    base: (domainMax - row.value) / 2,
    band: row.value,
    metaUpper: center + row.target / 2,
    metaLower: center - row.target / 2,
  }));

  const first = data[0];
  const last = data[data.length - 1];
  const belowTarget = data.filter((row) => row.value < row.target).length;
  const summary =
    first && last
      ? `Gráfico de área em cone com ${String(data.length)} etapas da pré-vendas, ${weekLabel}, contra a meta semanal. ${first.stage} soma ${formatInt(first.value)}, ${formatRateWithVolume(first.value, first.target)} da meta. ${last.stage} soma ${formatInt(last.value)}, ${formatRateWithVolume(last.value, last.target)} da meta. ${String(belowTarget)} de ${String(data.length)} etapas ficam abaixo da meta.`
      : 'Cone sem etapas.';
  /**
   * "Delas" fecha na palavra etapas, não no volume: a fração é de contagem de etapas abaixo da
   * meta, e "da esteira" sugeria fração de volume (revisão 2026-09-18).
   */
  const reading = `${String(belowTarget)} de ${String(data.length)} etapas abaixo da meta semanal; ${formatPercent(belowTarget / data.length)} delas.`;

  /**
   * ROT-3: o contorno tracejado da meta é uma série sem rótulo próprio; escreve o nome e o valor
   * no fim da linha superior, na última etapa, para o contorno deixar de ser uma linha muda
   * (revisão 2026-09-18). `textAnchor="end"` fecha o texto exatamente no ponto, sem pedir margem
   * extra: o texto cresce para dentro do corpo, nunca para fora do canvas.
   */
  const renderMetaLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index === undefined || index !== rows.length - 1) return null;
    const row = rows[index];
    if (!row) return null;
    return (
      <text
        className="font-sans"
        fill="var(--text-secondary)"
        fontSize={11}
        textAnchor="end"
        x={Number(x)}
        y={Number(y) - 8}
      >
        {`meta semanal, ${formatInt(row.target)}`}
      </text>
    );
  };

  const renderTick = ({ x, y, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    return (
      <g>
        <text className="font-sans" fill="var(--text-secondary)" fontSize={12} fontWeight={600} textAnchor="middle" x={x} y={Number(y) + 16}>
          {row.stage}
        </text>
        <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={x} y={Number(y) + 31}>
          {formatRateWithVolume(row.value, row.target)}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 line-clamp-2 shrink-0 text-xs leading-snug text-text-muted">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <XAxis axisLine={false} dataKey="stage" height={44} interval={0} tick={renderTick} tickLine={false} />
            <YAxis domain={[0, domainMax]} hide />
            <Area dataKey="base" fill="transparent" isAnimationActive={false} stackId="cone" stroke="none" />
            <Area
              dataKey="band"
              dot={{ r: 3, fill: BAND_FILL, strokeWidth: 0 }}
              fill={BAND_FILL}
              fillOpacity={0.35}
              isAnimationActive={animate}
              stackId="cone"
              stroke={BAND_FILL}
              strokeWidth={1}
              type="linear"
            />
            <Line dataKey="metaUpper" dot={{ r: 3, fill: 'var(--text-muted)', strokeWidth: 0 }} isAnimationActive={false} stroke="var(--text-muted)" strokeDasharray="3 3" type="linear">
              <LabelList content={renderMetaLabel} dataKey="metaUpper" />
            </Line>
            <Line dataKey="metaLower" dot={{ r: 3, fill: 'var(--text-muted)', strokeWidth: 0 }} isAnimationActive={false} stroke="var(--text-muted)" strokeDasharray="3 3" type="linear" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
