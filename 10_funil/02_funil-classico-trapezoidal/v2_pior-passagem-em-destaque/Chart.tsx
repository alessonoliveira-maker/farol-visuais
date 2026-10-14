import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Cell, Funnel, FunnelChart, LabelList, ResponsiveContainer, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periodLabel as defaultPeriodLabel, type FunnelStage } from './data';

/**
 * Mesmo funil comercial da versão básica, com a etapa de destino da pior taxa de passo em
 * destaque. Uma linha de leitura distingue a pior taxa (proporção) da maior perda absoluta
 * (contagem): são dois recortes diferentes do mesmo funil e não coincidem sempre.
 */
export interface WorstStepFunnelProps {
  readonly data?: readonly FunnelStage[];
  readonly periodLabel?: string;
  readonly height?: number;
  readonly className?: string;
}

const HIGHLIGHT_FILL = 'var(--chart-1)';
/** Neutro de dado: permitido porque toda etapa tem o valor escrito (COR-2). */
const NEUTRAL_FILL = 'var(--line-strong)';
const MARGIN = { top: 28, right: 152, bottom: 8, left: 8 } as const;
const LABEL_GAP = 10;

export default function WorstStepFunnel({
  data = defaultData,
  periodLabel = defaultPeriodLabel,
  height,
  className,
}: WorstStepFunnelProps) {
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

  const entry = data[0]?.value ?? 0;

  // Pior taxa de passo: menor razão entre uma etapa e a etapa anterior.
  let worstStepIndex = -1;
  let worstStepRatio = Infinity;
  // Maior perda absoluta: maior queda em contagem entre duas etapas seguidas.
  let worstDropIndex = -1;
  let worstDrop = -Infinity;
  for (let i = 1; i < data.length; i += 1) {
    const prev = data[i - 1];
    const row = data[i];
    if (!prev || !row || prev.value <= 0) continue;
    const ratio = row.value / prev.value;
    if (ratio < worstStepRatio) {
      worstStepRatio = ratio;
      worstStepIndex = i;
    }
    const drop = prev.value - row.value;
    if (drop > worstDrop) {
      worstDrop = drop;
      worstDropIndex = i;
    }
  }
  const worstStepTo = worstStepIndex >= 0 ? data[worstStepIndex] : undefined;
  const worstStepFrom = worstStepIndex >= 1 ? data[worstStepIndex - 1] : undefined;
  const worstDropTo = worstDropIndex >= 0 ? data[worstDropIndex] : undefined;
  const worstDropFrom = worstDropIndex >= 1 ? data[worstDropIndex - 1] : undefined;

  const readingFull =
    worstStepFrom && worstStepTo && worstDropFrom && worstDropTo
      ? `Pior taxa de passo: ${worstStepFrom.stage} para ${worstStepTo.stage}, ${formatRateWithVolume(worstStepTo.value, worstStepFrom.value)}. Maior perda absoluta: ${worstDropFrom.stage} para ${worstDropTo.stage}, ${formatInt(worstDrop)} oportunidades.`
      : null;
  /**
   * Versão curta para a linha visível: as duas mesmas leituras, com rótulos de uma palavra,
   * para caber no corpo do cartão sem cortar o segundo número (revisão 2026-09-18). A frase
   * acessível completa segue em `readingFull`, sem teto de tamanho.
   */
  const reading =
    worstStepFrom && worstStepTo && worstDropFrom && worstDropTo
      ? `Passo: ${worstStepFrom.stage} a ${worstStepTo.stage}, ${formatRateWithVolume(worstStepTo.value, worstStepFrom.value)}. Perda: ${worstDropFrom.stage} a ${worstDropTo.stage}, ${formatInt(worstDrop)} oportunidades.`
      : null;

  const summary = readingFull
    ? `Funil com ${String(data.length)} etapas do funil comercial de ${periodLabel}, com destaque em ${worstStepTo?.stage ?? ''}. ${readingFull}`
    : `Funil com ${String(data.length)} etapas do funil comercial de ${periodLabel}.`;

  const renderLabel = ({ x, y, width, height: rowHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : data[index];
    if (!row) return null;
    const isHighlight = index === worstStepIndex;
    const lx = Number(x) + Number(width) + LABEL_GAP;
    const ly = Number(y) + Number(rowHeight) / 2;
    return (
      <g>
        <text
          className="font-sans"
          fill={isHighlight ? 'var(--text-primary)' : 'var(--text-secondary)'}
          fontSize={12}
          fontWeight={isHighlight ? 700 : 500}
          x={lx}
          y={ly - 7}
        >
          {row.stage}
        </text>
        <text
          className="font-display"
          fill={isHighlight ? 'var(--text-primary)' : 'var(--text-secondary)'}
          fontSize={12}
          fontWeight={isHighlight ? 700 : 500}
          x={lx}
          y={ly + 8}
        >
          {formatRateWithVolume(row.value, entry)}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? (
        <p aria-hidden className="mb-1 line-clamp-2 shrink-0 text-xs leading-snug text-text-muted">
          {reading}
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <FunnelChart accessibilityLayer={false} margin={MARGIN}>
            <Funnel dataKey="value" data={data} isAnimationActive={animate} lastShapeType="rectangle" nameKey="stage">
              {data.map((row, index) => (
                <Cell
                  fill={index === worstStepIndex ? HIGHLIGHT_FILL : NEUTRAL_FILL}
                  key={row.id}
                  stroke="var(--surface-raised)"
                  strokeWidth={1}
                />
              ))}
              <LabelList content={renderLabel} dataKey="value" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
