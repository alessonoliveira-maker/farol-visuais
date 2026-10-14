import { AlertTriangle, Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
  type LabelProps,
} from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, monthLabel as defaultMonthLabel, type FunnelStage } from './data';

/**
 * Funil trapezoidal que valida a monotonicidade antes de desenhar: se uma etapa soma mais que a
 * etapa anterior (janelas de data diferentes, reengajamento), o trapézio abriria para baixo sem
 * aviso, então o componente escreve o aviso e troca para barras horizontais na ordem do processo,
 * nunca ordenadas por valor.
 */
export interface StageAboveFunnelProps {
  readonly data?: readonly FunnelStage[];
  readonly monthLabel?: string;
  readonly height?: number;
  readonly className?: string;
}

const FILL = 'var(--chart-1)';
const MARGIN = { top: 8, right: 152, bottom: 8, left: 8 } as const;
const LABEL_GAP = 10;

export default function StageAboveFunnel({
  data = defaultData,
  monthLabel = defaultMonthLabel,
  height,
  className,
}: StageAboveFunnelProps) {
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
        <span>Nenhuma etapa neste recorte: não há dado de funil para {monthLabel}.</span>
      </div>
    );
  }

  const brokenIndex = data.findIndex((row, i) => i > 0 && row.value > (data[i - 1]?.value ?? Infinity));
  const broken = brokenIndex > 0 ? data[brokenIndex] : undefined;
  const brokenPrev = brokenIndex > 0 ? data[brokenIndex - 1] : undefined;
  const warningFull =
    broken && brokenPrev
      ? `${broken.stage} soma mais que ${brokenPrev.stage} em ${monthLabel}, ${formatRateWithVolume(broken.value, brokenPrev.value)}, porque a janela de data é diferente: mostrado em barras, não em funil.`
      : null;
  /**
   * Versão curta para o aviso visível: a taxa acima de 100% já está escrita no rótulo da barra
   * ao lado (revisão A22, não repetir dado já impresso); o aviso guarda só o essencial que não
   * está em nenhum outro lugar, a causa, para caber numa linha do cartão (revisão 2026-09-18). A
   * frase acessível completa, com a taxa, segue em `warningFull`.
   */
  const warning =
    broken && brokenPrev
      ? `${broken.stage} supera ${brokenPrev.stage} em ${monthLabel}: janela de data diferente, por isso em barras.`
      : null;

  const summary = warningFull
    ? `Gráfico de barras com ${String(data.length)} etapas da pré-vendas de ${monthLabel}, na ordem do processo. ${warningFull}`
    : `Funil com ${String(data.length)} etapas da pré-vendas de ${monthLabel}, da maior para a menor largura.`;

  const renderRow = ({ x, y, width, height: rowHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : data[index];
    const prev = index !== undefined && index > 0 ? data[index - 1] : undefined;
    if (!row) return null;
    const rate = prev ? formatRateWithVolume(row.value, prev.value) : `${formatInt(row.value)} oportunidades`;
    const lx = Number(x) + Number(width) + LABEL_GAP;
    const ly = Number(y) + Number(rowHeight) / 2;
    return (
      <g>
        <text className="font-sans" fill="var(--text-secondary)" fontSize={12} fontWeight={600} x={lx} y={ly - 7}>
          {row.stage}
        </text>
        <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={600} x={lx} y={ly + 8}>
          {rate}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {warning ? (
        <p aria-hidden className="mb-1 flex shrink-0 items-start gap-1.5 text-xs text-warning">
          <AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          <span className="line-clamp-2 leading-snug">{warning}</span>
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          {broken ? (
            <BarChart accessibilityLayer={false} barCategoryGap="34%" data={[...data]} layout="vertical" margin={MARGIN}>
              <XAxis domain={[0, 'dataMax']} hide type="number" />
              <YAxis dataKey="stage" hide type="category" width={0} />
              <Bar dataKey="value" fill={FILL} isAnimationActive={animate} maxBarSize={20} radius={[0, 3, 3, 0]}>
                <LabelList content={renderRow} dataKey="value" />
              </Bar>
            </BarChart>
          ) : (
            <FunnelChart accessibilityLayer={false} margin={MARGIN}>
              <Funnel dataKey="value" data={data} isAnimationActive={animate} lastShapeType="rectangle" nameKey="stage">
                {data.map((row) => (
                  <Cell fill={FILL} key={row.id} stroke="var(--surface-raised)" strokeWidth={1} />
                ))}
                <LabelList content={renderRow} dataKey="value" />
              </Funnel>
            </FunnelChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
