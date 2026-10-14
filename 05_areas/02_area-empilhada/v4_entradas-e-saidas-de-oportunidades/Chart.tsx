import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyOpportunityFlow } from './data';

/**
 * Área empilhada divergente: entradas de oportunidades acima do zero, saídas por ganho, por
 * perda e por reclassificação abaixo. Duas pilhas por sinal (`positiva` e `negativa`), cada uma
 * com offset padrão a partir do zero: sem `stackOffset="sign"`, porque esse offset classifica
 * cada semana pelo sinal do próprio valor e, numa semana em que a reclassificação de saída é
 * zero, o zero conta como não negativo e a camada salta para a pilha positiva, desenhando um
 * degrau que o dado não tem. A reclassificação é uma única categoria que entra ou sai conforme a
 * semana, por isso vive em duas colunas da mesma cor, uma em cada pilha. O saldo líquido soma
 * tudo numa linha, o todo por cima das partes que o compõem.
 */
export interface OpportunityFlowAreaProps {
  readonly data?: readonly WeeklyOpportunityFlow[];
  readonly height?: number;
  readonly className?: string;
}

const ENTRADA_FILL = 'var(--chart-1)';
const SAIDA_GANHO_FILL = 'var(--chart-3)';
const SAIDA_PERDA_FILL = 'var(--chart-6)';
/** Reclassificação alterna de sinal semana a semana: mesma categoria, mesma cor nas duas chaves. */
const RECLASSIFICACAO_FILL = 'var(--chart-5)';
const LAYER_STROKE = 'var(--surface-raised)';
const SALDO_STROKE = 'var(--text-primary)';
const ZERO_STROKE = 'var(--line-strong)';
const MARGIN = { top: 10, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 44;
const TICK_INTERVAL = 1;
/** Sinal de menos tipográfico (U+2212), nunca hífen. */
const MINUS = '−';

interface OpportunityFlowRow extends WeeklyOpportunityFlow {
  readonly saldo: number;
}

function withSign(value: number): string {
  const rounded = Math.round(value);
  return rounded < 0 ? `${MINUS}${formatInt(Math.abs(rounded))}` : formatInt(rounded);
}

/** Sinal sempre explícito, `+` ou `−`: para o termo de ajuste de uma conta escrita, nunca só o valor absoluto. */
function withExplicitSign(value: number): string {
  const rounded = Math.round(value);
  return rounded < 0 ? `${MINUS}${formatInt(Math.abs(rounded))}` : `+${formatInt(rounded)}`;
}

interface SaldoDotProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: { readonly saldo?: number };
}

/** Bola cheia nas semanas de saldo positivo; losango na cor negativa nas de saldo negativo (símbolo, não só cor). */
function renderSaldoDot(props: SaldoDotProps): ReactElement {
  const { cx = 0, cy = 0, payload } = props;
  const saldo = payload?.saldo ?? 0;
  if (saldo < 0) {
    const half = 5;
    return (
      <path
        d={`M ${String(cx)} ${String(cy - half)} L ${String(cx + half)} ${String(cy)} L ${String(cx)} ${String(cy + half)} L ${String(cx - half)} ${String(cy)} Z`}
        fill="var(--negative)"
        stroke="var(--surface-raised)"
        strokeWidth={1}
      />
    );
  }
  return <circle cx={cx} cy={cy} fill={SALDO_STROKE} r={3} stroke="var(--surface-raised)" strokeWidth={1} />;
}

export default function OpportunityFlowArea({ data = defaultData, height, className }: OpportunityFlowAreaProps) {
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
        <span>Nenhuma semana neste recorte: não houve movimento de oportunidades no funil.</span>
      </div>
    );
  }

  const rows: readonly OpportunityFlowRow[] = data.map((row) => ({
    ...row,
    saldo:
      row.entradas + row.saidaGanho + row.saidaPerda + row.reclassificacaoEntrada + row.reclassificacaoSaida,
  }));
  const first = rows[0];
  const last = rows[rows.length - 1];
  const totalEntradas = rows.reduce((sum, row) => sum + row.entradas, 0);
  const totalSaidaGanho = rows.reduce((sum, row) => sum + row.saidaGanho, 0);
  const totalSaidaPerda = rows.reduce((sum, row) => sum + row.saidaPerda, 0);
  const totalSaidas = totalSaidaGanho + totalSaidaPerda;
  const totalReclassificacaoEntrada = rows.reduce((sum, row) => sum + row.reclassificacaoEntrada, 0);
  const totalReclassificacaoSaida = rows.reduce((sum, row) => sum + row.reclassificacaoSaida, 0);
  /** A parcela que faltava na conta: reclassificação líquida, positiva quando o funil recebeu mais do que perdeu. */
  const reclassificacaoLiquida = totalReclassificacaoEntrada + totalReclassificacaoSaida;
  const saldoAcumulado = rows.reduce((sum, row) => sum + row.saldo, 0);
  const negativeWeeks = rows.filter((row) => row.saldo < 0);

  const summary = first && last
    ? `Área empilhada divergente com entradas e saídas semanais de oportunidades, ${formatInt(rows.length)} semanas. ` +
      `Saldo líquido de ${withSign(saldoAcumulado)}: entraram ${formatInt(totalEntradas)}, saíram ${formatInt(Math.abs(totalSaidas))}, ` +
      `reclassificação líquida ${withExplicitSign(reclassificacaoLiquida)}. ` +
      `${formatInt(negativeWeeks.length)} ${negativeWeeks.length === 1 ? 'semana fechou' : 'semanas fecharam'} negativa.`
    : 'Área empilhada divergente de entradas e saídas semanais de oportunidades.';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Saldo líquido do período:{' '}
        <span className="kpi-number font-semibold text-text-primary">{withSign(saldoAcumulado)}</span>
        {' · '}
        entradas <span className="tabular-nums">{formatInt(totalEntradas)}</span>, saídas{' '}
        <span className="tabular-nums">{withSign(totalSaidas)}</span>, reclassificação{' '}
        <span className="tabular-nums">{withExplicitSign(reclassificacaoLiquida)}</span>
        {negativeWeeks.length > 0 ? (
          <>
            {' · '}
            <span className="font-semibold text-text-primary">{formatInt(negativeWeeks.length)}</span>{' '}
            {negativeWeeks.length === 1 ? 'semana negativa' : 'semanas negativas'}
          </>
        ) : null}
      </p>
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1" aria-hidden>
        <li className="flex items-center gap-1.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: RECLASSIFICACAO_FILL }} />
          Reclassificação
        </li>
        <li className="flex items-center gap-1.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: ENTRADA_FILL }} />
          Entradas
        </li>
        <li className="flex items-center gap-1.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: SAIDA_GANHO_FILL }} />
          Saída por ganho
        </li>
        <li className="flex items-center gap-1.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: SAIDA_PERDA_FILL }} />
          Saída por perda
        </li>
        <li className="flex items-center gap-1.5 text-xs leading-5 text-text-secondary">
          <svg aria-hidden className="h-2.5 w-4 shrink-0" viewBox="0 0 16 10">
            <line stroke={SALDO_STROKE} strokeWidth={2} x1={0} x2={16} y1={5} y2={5} />
            <circle cx={8} cy={5} fill={SALDO_STROKE} r={2.5} stroke="var(--surface-raised)" strokeWidth={1} />
          </svg>
          Saldo líquido
        </li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="week"
              interval={TICK_INTERVAL}
              tickFormatter={(value: string) => formatDate(value).slice(0, 5)}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis {...AXIS_PROPS} axisLine={false} tickFormatter={withSign} tickLine={false} width={VALUE_AXIS_WIDTH} />
            <Tooltip
              content={<ChartTooltip labelFormat="date" valueFormat="int" />}
              cursor={{ stroke: 'var(--line-strong)' }}
              isAnimationActive={false}
            />
            <ReferenceLine stroke={ZERO_STROKE} strokeWidth={1} y={0} />
            <Area
              dataKey="entradas"
              fill={ENTRADA_FILL}
              fillOpacity={0.9}
              isAnimationActive={animate}
              name="Entradas"
              stackId="positiva"
              stroke={LAYER_STROKE}
              strokeWidth={1.5}
              type="monotone"
            />
            <Area
              dataKey="reclassificacaoEntrada"
              fill={RECLASSIFICACAO_FILL}
              fillOpacity={0.9}
              isAnimationActive={animate}
              name="Reclassificação"
              stackId="positiva"
              stroke={LAYER_STROKE}
              strokeWidth={1.5}
              type="monotone"
            />
            <Area
              dataKey="saidaGanho"
              fill={SAIDA_GANHO_FILL}
              fillOpacity={0.9}
              isAnimationActive={animate}
              name="Saída por ganho"
              stackId="negativa"
              stroke={LAYER_STROKE}
              strokeWidth={1.5}
              type="monotone"
            />
            <Area
              dataKey="saidaPerda"
              fill={SAIDA_PERDA_FILL}
              fillOpacity={0.9}
              isAnimationActive={animate}
              name="Saída por perda"
              stackId="negativa"
              stroke={LAYER_STROKE}
              strokeWidth={1.5}
              type="monotone"
            />
            <Area
              dataKey="reclassificacaoSaida"
              fill={RECLASSIFICACAO_FILL}
              fillOpacity={0.9}
              isAnimationActive={animate}
              name="Reclassificação"
              stackId="negativa"
              stroke={LAYER_STROKE}
              strokeWidth={1.5}
              type="monotone"
            />
            <Line
              dataKey="saldo"
              dot={renderSaldoDot}
              isAnimationActive={animate}
              name="Saldo líquido"
              stroke={SALDO_STROKE}
              strokeWidth={2}
              type="monotone"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
