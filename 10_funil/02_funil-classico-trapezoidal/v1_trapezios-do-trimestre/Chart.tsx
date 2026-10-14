import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Cell, Funnel, FunnelChart, LabelList, ResponsiveContainer, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periodLabel as defaultPeriodLabel, type FunnelStage } from './data';

/**
 * Funil clássico trapezoidal: cada etapa é um trapézio centralizado cuja largura é proporcional
 * ao volume, do topo ao fundo. Bom para a leitura de conjunto de um processo monotônico de poucas
 * etapas; cada etapa escreve o valor e a taxa da entrada com o denominador nomeado, nunca só a
 * forma, porque a área do trapézio não corresponde ao valor.
 */
export interface ClassicFunnelProps {
  readonly data?: readonly FunnelStage[];
  readonly periodLabel?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Cor única: série de uma medida só ao longo das etapas (COR-1). */
const FILL = 'var(--chart-1)';
const MARGIN = { top: 8, right: 152, bottom: 8, left: 8 } as const;
const LABEL_GAP = 10;

export default function ClassicFunnel({
  data = defaultData,
  periodLabel = defaultPeriodLabel,
  height,
  className,
}: ClassicFunnelProps) {
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
        <span>Nenhuma etapa neste recorte: não há dado de funil para {periodLabel}.</span>
      </div>
    );
  }

  const first = data[0];
  const last = data[data.length - 1];
  const entry = first?.value ?? 0;
  const summary =
    first && last
      ? `Funil com ${String(data.length)} etapas do funil comercial de ${periodLabel}, da maior para a menor largura. Abre em ${first.stage} com ${String(first.value)} oportunidades e fecha em ${last.stage} com ${String(last.value)}, ${formatRateWithVolume(last.value, entry)} da entrada.`
      : 'Funil sem etapas.';

  const renderLabel = ({ x, y, width, height: rowHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : data[index];
    if (!row) return null;
    const lx = Number(x) + Number(width) + LABEL_GAP;
    const ly = Number(y) + Number(rowHeight) / 2;
    return (
      <g>
        <text className="font-sans" fill="var(--text-secondary)" fontSize={12} fontWeight={600} x={lx} y={ly - 7}>
          {row.stage}
        </text>
        <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={600} x={lx} y={ly + 8}>
          {formatRateWithVolume(row.value, entry)}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <ResponsiveContainer height="100%" width="100%">
        <FunnelChart accessibilityLayer={false} margin={MARGIN}>
          <Funnel dataKey="value" data={data} isAnimationActive={animate} lastShapeType="rectangle" nameKey="stage">
            {data.map((row) => (
              <Cell fill={FILL} key={row.id} stroke="var(--surface-raised)" strokeWidth={1} />
            ))}
            <LabelList content={renderLabel} dataKey="value" />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}
