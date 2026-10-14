import { useId, type ReactElement } from 'react';
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  usePlotArea,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CplBridge } from './data';

/** Cascata da variação do CPL por efeito, com o resíduo do modelo visível como passo próprio. */
export interface CplEffectBridgeProps {
  readonly data?: CplBridge;
  readonly height?: number;
  readonly className?: string;
}

/** Duas linhas de rótulo acima da coluna mais alta: 24 de respiro mais uma linha de unidade. */
const MARGIN = { top: 40, right: 8, bottom: 0, left: 8 } as const;
/** ESP-6, série única: 558 px de largura / 5 colunas = passo 111,6; barra = min(24, 111,6 × 0,36) = 24 px. */
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const CATEGORY_AXIS_HEIGHT = 28;
const LABEL_GAP = 6;
const UNIT_LINE = 14;
const CORNER = 3;
const RESIDUAL_ALERT = 0.1;

type RowKind = 'effect' | 'residual' | 'total';

interface EffectRow {
  readonly id: string;
  readonly label: string;
  readonly kind: RowKind;
  readonly value: number;
  readonly start: number;
  readonly end: number;
  readonly range: readonly [number, number];
  readonly isLast: boolean;
}

interface StepShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: EffectRow;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signedCurrency(value: number): string {
  if (value === 0) return formatCurrency(0, 0);
  return `${value > 0 ? '+' : '−'}${formatCurrency(Math.abs(value), 0)}`;
}

/** Função pura do resíduo: (fim − início) − soma dos efeitos. `null` sem nenhum efeito calculado. */
function residualOf(bridge: CplBridge): number | null {
  if (bridge.effects.length === 0) return null;
  const explained = bridge.effects.reduce((sum, effect) => sum + effect.value, 0);
  return bridge.to - bridge.from - explained;
}

/** O zero do eixo é o valor de partida: cada efeito nasce onde o anterior terminou, a faixa final ancora no zero. */
function buildRows(bridge: CplBridge, residual: number): readonly EffectRow[] {
  const steps = [
    ...bridge.effects.map((effect) => ({ ...effect, kind: 'effect' as RowKind })),
    ...(residual === 0 ? [] : [{ id: 'residuo', label: 'Não explicado', kind: 'residual' as RowKind, value: residual }]),
  ];
  let running = 0;
  const rows: EffectRow[] = steps.map((step) => {
    const start = running;
    running += step.value;
    return { ...step, start, end: running, range: [Math.min(start, running), Math.max(start, running)], isLast: false };
  });
  const delta = bridge.to - bridge.from;
  rows.push({ id: 'total', label: 'Variação total', kind: 'total', value: delta, start: 0, end: delta, range: [Math.min(0, delta), Math.max(0, delta)], isLast: true });
  return rows;
}

/**
 * O shape desenha tudo da coluna: retângulo (hachurado no resíduo), rótulo de duas linhas com a
 * unidade e conector. Polaridade invertida (COR-6): CPL que sobe é queda de qualidade, `--negative`.
 */
function EffectStep({ x = 0, y = 0, width = 0, height = 0, payload, count }: StepShapeProps & { readonly count: number }): ReactElement | null {
  const plot = usePlotArea();
  const patternId = `hachura-${useId().replace(/:/g, '')}`;
  if (!payload) return null;
  const isTotal = payload.kind === 'total';
  const isResidual = payload.kind === 'residual';
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  const levelY = payload.value < 0 ? bottom : top;
  const band = plot ? plot.width / count : 0;
  const color = isTotal ? 'var(--chart-1)' : isResidual ? 'var(--text-secondary)' : payload.value > 0 ? 'var(--negative)' : 'var(--positive)';
  const textFill = isTotal ? 'var(--text-primary)' : color;
  return (
    <g>
      {isResidual ? (
        <defs>
          <pattern height={6} id={patternId} patternUnits="userSpaceOnUse" width={6}>
            <path d="M-1 1 L1 -1 M0 6 L6 0 M5 7 L7 5" stroke="var(--text-secondary)" strokeWidth={1.5} />
          </pattern>
        </defs>
      ) : null}
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={levelY} y2={levelY} />
      ) : null}
      <rect
        fill={isResidual ? `url(#${patternId})` : color}
        height={Math.max(bottom - top, 2)}
        rx={CORNER}
        stroke={isResidual ? 'var(--text-secondary)' : undefined}
        strokeWidth={isResidual ? 1.5 : undefined}
        width={width}
        x={x}
        y={top}
      />
      <text className="font-display" fill={textFill} fontSize={12} fontWeight={isTotal ? 600 : 500} textAnchor="middle" x={x + width / 2} y={top - LABEL_GAP - UNIT_LINE}>
        {signedCurrency(payload.value)}
      </text>
      <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={x + width / 2} y={top - LABEL_GAP}>
        por lead
      </text>
    </g>
  );
}

export default function CplEffectBridge({ data = defaultData, height, className }: CplEffectBridgeProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const residual = residualOf(data);

  if (residual === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum efeito calculado neste recorte: sem decomposição, a variação do CPL não se explica.
      </div>
    );
  }

  const rows = buildRows(data, residual);
  const delta = data.to - data.from;
  const lows = rows.map((row) => row.range[0]);
  const highs = rows.map((row) => row.range[1]);
  const domain: [number, number] = [Math.min(0, ...lows), Math.max(0, ...highs)];
  const residualShare = delta === 0 ? null : Math.abs(residual) / Math.abs(delta);
  const alert = residualShare !== null && residualShare > RESIDUAL_ALERT;
  const shareText = residualShare === null ? formatUnavailable() : formatPercent(residualShare, 0);
  const rise = delta >= 0 ? 'subiu' : 'caiu';

  const effectText = data.effects.map((effect) => `${effect.label.toLowerCase()} ${signedCurrency(effect.value)}`).join(', ');
  const summary =
    `Gráfico de cascata da variação do CPL de ${data.fromPeriod} para ${data.toPeriod}: o custo por lead ${rise} de ` +
    `${formatCurrency(data.from, 0)} para ${formatCurrency(data.to, 0)}, ${signedCurrency(delta)}. Efeitos: ${effectText}; ` +
    `${formatCurrency(Math.abs(residual), 0)}, ${shareText.toLowerCase()} da diferença, sem explicação.`;
  const reading =
    `CPL ${signedCurrency(delta)} por lead (${delta >= 0 ? '+' : '−'}${formatPercent(Math.abs(delta) / data.from, 0)}) contra ` +
    `${formatCurrency(data.from, 0)} em ${data.fromPeriod}` +
    (alert ? `; ${formatCurrency(Math.abs(residual), 0)} (${shareText}) sem explicação` : '');

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as EffectRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const color = row.kind === 'total' ? 'var(--chart-1)' : row.kind === 'residual' ? 'var(--text-secondary)' : row.value > 0 ? 'var(--negative)' : 'var(--positive)';
    const extra =
      row.kind === 'total'
        ? { name: `CPL em ${data.toPeriod}`, value: `${formatCurrency(data.to, 0)} por lead` }
        : row.kind === 'residual'
          ? { name: 'Parte da diferença', value: shareText }
          : { name: 'CPL acumulado', value: `${formatCurrency(data.from + row.end, 0)} por lead` };
    const payload = [
      { ...base, color, name: 'Efeito', value: `${signedCurrency(row.value)} por lead` },
      { ...base, color: 'var(--text-muted)', ...extra },
    ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs font-medium text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="label" height={CATEGORY_AXIS_HEIGHT} interval={0} tickMargin={8} />
            <YAxis domain={domain} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <EffectStep {...props} count={rows.length} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
