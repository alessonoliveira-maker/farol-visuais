import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, familyLabel as defaultFamilyLabel, companyLabel as defaultCompanyLabel, type ButterflyStage } from './data';

/**
 * Dois funis espelhados num eixo central em zero, mesma escala dos dois lados: família à
 * esquerda, empresa à direita. Etapa em que a empresa não existe aparece como não se aplica,
 * nunca como zero, e a etapa em que a razão entre os lados inverte ganha uma linha de leitura.
 */
export interface ButterflyFunnelProps {
  readonly data?: readonly ButterflyStage[];
  readonly familyLabel?: string;
  readonly companyLabel?: string;
  readonly height?: number;
  readonly className?: string;
}

interface Row extends ButterflyStage {
  readonly familyNeg: number;
  readonly companyPlot: number;
  readonly companyApplicable: boolean;
}

const FAMILY_FILL = 'var(--chart-1)';
const COMPANY_FILL = 'var(--line-strong)';
/** Domínio 30% maior que o maior valor, para o rótulo caber além da ponta da barra mais longa. */
const DOMAIN_PADDING = 1.3;
const MARGIN = { top: 20, right: 16, bottom: 8, left: 16 } as const;
const NAME_AXIS_WIDTH = 112;
const VALUE_LABEL_GAP = 6;
const BAR_MAX = 18;
const BAR_CATEGORY_GAP = '30%';
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

function findInversionStage(rows: readonly Row[]): string | undefined {
  let prevSign: boolean | undefined;
  for (const row of rows) {
    if (!row.companyApplicable) continue;
    const sign = row.familyValue >= (row.companyValue ?? 0);
    if (prevSign !== undefined && sign !== prevSign) return row.stage;
    prevSign = sign;
  }
  return undefined;
}

export default function ButterflyFunnel({
  data = defaultData,
  familyLabel = defaultFamilyLabel,
  companyLabel = defaultCompanyLabel,
  height,
  className,
}: ButterflyFunnelProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  // O valor 0 some do empilhamento com sinal (o Recharts descarta o ponto da série e desalinha o
  // índice do LabelList para as etapas seguintes); um epsilon positivo mantém o índice certo sem
  // desenhar barra visível.
  const rows: Row[] = data.map((d) => ({ ...d, familyNeg: -d.familyValue, companyPlot: d.companyValue ?? 0.01, companyApplicable: d.companyValue !== null }));
  const domainMax = Math.max(...rows.map((r) => r.familyValue), ...rows.map((r) => r.companyPlot)) * DOMAIN_PADDING;
  const inversionStage = findInversionStage(rows);
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  const naStage = rows.find((r) => !r.companyApplicable);

  const summary =
    `Gráfico de barras espelhado comparando ${familyLabel} e ${companyLabel} por etapa, mesma escala. ` +
    `Abre em ${first.stage} com ${formatInt(first.familyValue)} contra ${formatInt(first.companyValue ?? 0)} e fecha em ${last.stage} com ${formatInt(last.familyValue)} contra ${formatInt(last.companyValue ?? 0)}. ` +
    `${inversionStage ? `Em ${inversionStage}, ${companyLabel} ultrapassa. ` : ''}${naStage ? `${naStage.stage} não se aplica aqui.` : ''}`;

  const renderStageTick = ({ x, y, payload }: { readonly x?: number | string; readonly y?: number | string; readonly payload?: { readonly value?: unknown } }): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={payload?.value === inversionStage ? 700 : 500} textAnchor="end" x={Number(x) - 6} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );

  const renderFamily = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const tipX = Number(x) + Number(width);
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="end" x={tipX - VALUE_LABEL_GAP} y={Number(y) + Number(barHeight) / 2}>
        {formatInt(row.familyValue)}
      </text>
    );
  };

  const renderCompany = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const tipX = Number(x) + Number(width);
    const midY = Number(y) + Number(barHeight) / 2;
    if (!row.companyApplicable) {
      return (
        <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} style={HALO} x={tipX + VALUE_LABEL_GAP} y={midY}>
          não se aplica
        </text>
      );
    }
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} x={tipX + VALUE_LABEL_GAP} y={midY}>
        {formatInt(row.companyValue ?? 0)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: FAMILY_FILL }} />
          {familyLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: COMPANY_FILL }} />
          {companyLabel}
        </span>
      </div>
      {inversionStage ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          Em <span className="font-semibold text-text-primary">{inversionStage}</span>, {companyLabel} passa à frente de {familyLabel}.
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} layout="vertical" margin={MARGIN} stackOffset="sign">
            <XAxis domain={[-domainMax, domainMax]} hide type="number" />
            <YAxis axisLine={false} dataKey="stage" interval={0} tick={renderStageTick} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            <ReferenceLine stroke="var(--line-strong)" x={0} />
            <Bar dataKey="familyNeg" fill={FAMILY_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[3, 0, 0, 3]} stackId="side">
              <LabelList content={renderFamily} dataKey="familyNeg" />
            </Bar>
            <Bar dataKey="companyPlot" fill={COMPANY_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[0, 3, 3, 0]} stackId="side">
              <LabelList content={renderCompany} dataKey="companyPlot" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
