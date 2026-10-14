import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type FunnelStageZero } from './data';

/**
 * Barras centralizadas em escala proporcional, ligadas por um conector translúcido do rodapé de
 * uma etapa ao topo da seguinte. A centralização tira a linha de base comum, então valor e as
 * duas taxas, do passo e da entrada, ficam escritos em toda etapa. Etapa zerada vira um traço de
 * 1 px com "0" escrito, nunca some, e o conector que chega nela vira triângulo.
 */
export interface CenteredFunnelProps {
  readonly data?: readonly FunnelStageZero[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 574;
const VIEW_H = 234;
const CX = 118;
/** Largura total do maior half da barra (vmax ocupa a área inteira). */
const BAR_AREA = 220;
const ROW_H = 18;
const GAP_H = 28;
const TOP_MARGIN = 6;
const LABEL_X = CX + BAR_AREA / 2 + 16;
const BAR_FILL = 'var(--chart-1)';
const CONNECTOR_FILL = 'var(--chart-1)';
const CONNECTOR_OPACITY = 0.22;
/** Traço de etapa zerada (EST-3): 2 px de largura, sempre visível, nunca barra invisível. */
const ZERO_TICK_WIDTH = 2;
const LINE_STEP = 15;

/** Metade da largura da barra na escala do vmax; zero medido devolve zero, sem clamp mínimo. */
function halfWidth(value: number, vmax: number): number {
  if (value <= 0 || vmax <= 0) return 0;
  return (value / vmax) * (BAR_AREA / 2);
}

interface Line {
  readonly text: string;
  readonly size: number;
  readonly weight: number;
  readonly fill: string;
}

export default function CenteredFunnel({ data = defaultData, height, className }: CenteredFunnelProps) {
  const rows = data;
  const style = height === undefined ? undefined : { height };

  if (rows.length < 2) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Funil precisa de ao menos duas etapas para calcular taxa de passo.</span>
      </div>
    );
  }

  const entrada = rows[0]!.value;
  const vmax = Math.max(...rows.map((r) => r.value), 1);
  const negociacao = rows.find((r) => r.id === 'negociacao');
  const last = rows[rows.length - 1]!;

  const summary =
    `Gráfico de barras centralizadas com o funil comercial da unidade Sul na semana de 2026-09-07, ` +
    `de ${formatInt(entrada)} ${rows[0]!.noun} a ${formatInt(last.value)} ${last.noun}. ` +
    (negociacao
      ? `Negociação teve ${formatInt(negociacao.value)} oportunidades, ${formatPercent(negociacao.value / (rows[rows.indexOf(negociacao) - 1]?.value || 1))} do passo. `
      : '') +
    `Nenhuma oportunidade virou ganha nesta semana.`;

  const geo = rows.map((stage, i) => {
    const half = halfWidth(stage.value, vmax);
    const yTop = TOP_MARGIN + i * (ROW_H + GAP_H);
    return { stage, half, x0: CX - half, x1: CX + half, yTop, yBottom: yTop + ROW_H };
  });

  return (
    <svg aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style} viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
      {geo.slice(0, -1).map((g, i) => {
        const next = geo[i + 1]!;
        return (
          <polygon
            fill={CONNECTOR_FILL}
            fillOpacity={CONNECTOR_OPACITY}
            key={`connector-${g.stage.id}`}
            points={`${String(g.x0)},${String(g.yBottom)} ${String(g.x1)},${String(g.yBottom)} ${String(next.x1)},${String(next.yTop)} ${String(next.x0)},${String(next.yTop)}`}
          />
        );
      })}
      {geo.map((g) => {
        if (g.stage.value <= 0) {
          return <rect fill={BAR_FILL} height={ROW_H} key={g.stage.id} width={ZERO_TICK_WIDTH} x={CX - ZERO_TICK_WIDTH / 2} y={g.yTop} />;
        }
        return <rect fill={BAR_FILL} height={ROW_H} key={g.stage.id} rx={2} width={g.x1 - g.x0} x={g.x0} y={g.yTop} />;
      })}
      {geo.map((g, i) => {
        const prev = geo[i - 1];
        const lines: Line[] = [{ text: `${g.stage.label} · ${formatInt(g.stage.value)} ${g.stage.noun}`, size: 12, weight: 600, fill: 'var(--text-primary)' }];
        if (prev) {
          const passo = prev.stage.value > 0 ? g.stage.value / prev.stage.value : 0;
          const cumulativa = entrada > 0 ? g.stage.value / entrada : 0;
          lines.push({ text: `${formatPercent(passo)} do passo`, size: 11, weight: 500, fill: 'var(--text-secondary)' });
          lines.push({ text: `${formatPercent(cumulativa)} da entrada`, size: 11, weight: 500, fill: 'var(--text-muted)' });
        }
        const centerY = g.yTop + ROW_H / 2;
        const startY = centerY - ((lines.length - 1) * LINE_STEP) / 2;
        return (
          <g key={`label-${g.stage.id}`}>
            {lines.map((line, li): ReactElement => (
              <text className={li === 0 ? 'font-display' : 'font-sans'} dominantBaseline="central" fill={line.fill} fontSize={line.size} fontWeight={line.weight} key={line.text} x={LABEL_X} y={startY + li * LINE_STEP}>
                {line.text}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
