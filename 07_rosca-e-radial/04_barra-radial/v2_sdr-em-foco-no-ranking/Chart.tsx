import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Cell, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type SdrAgendas } from './data';

/**
 * A mesma barra radial de agendas por SDR, agora com uma pessoa em foco: a legenda ao lado
 * troca o destaque por clique ou teclado, e um segundo clique no mesmo nome desmarca. O arco em
 * foco fica na cor de destaque; os demais recuam ao neutro, sempre com o valor escrito.
 */
export interface SdrFocusRadialProps {
  readonly data?: readonly SdrAgendas[];
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

const HIGHLIGHT_FILL = 'var(--chart-1)';
const NEUTRAL_FILL = 'var(--line-strong)';
const TRACK_FILL = 'var(--surface-sunken)';
const START_ANGLE = 90;
const END_ANGLE = -180;
const LABEL_GAP_PX = 6;

/**
 * O `label` do RadialBar tipa `viewBox` como o formato cartesiano (x, y, width, height): o
 * formato polar real, que o Recharts entrega em tempo de execução, não tem nome em comum com
 * aquele tipo e o TypeScript recusa a interseção. `unknown` sai da checagem e a leitura abaixo
 * valida campo a campo antes de usar.
 */
interface RadialLabelProps {
  readonly viewBox?: unknown;
  readonly index?: number;
}

interface PolarViewBox {
  readonly cx: number;
  readonly cy: number;
  readonly innerRadius: number;
  readonly outerRadius: number;
  readonly endAngle: number;
}

function readPolarViewBox(viewBox: unknown): PolarViewBox | null {
  if (typeof viewBox !== 'object' || viewBox === null) return null;
  const v = viewBox as Record<string, unknown>;
  const { cx, cy, innerRadius, outerRadius, endAngle } = v;
  if (typeof cx !== 'number' || typeof cy !== 'number' || typeof innerRadius !== 'number' || typeof outerRadius !== 'number' || typeof endAngle !== 'number') {
    return null;
  }
  return { cx, cy, innerRadius, outerRadius, endAngle };
}

export default function SdrFocusRadial({
  data = defaultData,
  highlightId: highlightIdProp,
  height,
  className,
}: SdrFocusRadialProps) {
  const animate = useAnimateOnce();
  const [activeId, setActiveId] = useState<string | null>(highlightIdProp ?? defaultHighlightId);
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve agenda marcada na semana.</span>
      </div>
    );
  }

  /* "ranking" ordena do maior para o menor, para a legenda e a posição em ordinal lerem como
   * ranking. "chartRows" é a mesma lista invertida: o RadialBarChart posiciona o primeiro item
   * no anel mais interno, então o maior valor só cai no anel externo (a leitura do modelo)
   * entrando por último no array que vira `data` do gráfico. */
  const ranking = [...data].sort((a, b) => b.count - a.count);
  const chartRows = [...ranking].reverse();
  const leader = ranking[0];
  const maxValue = Math.max(...ranking.map((row) => row.count), 1);
  const activeIndex = ranking.findIndex((row) => row.id === activeId);
  const active = activeIndex >= 0 ? ranking[activeIndex] : undefined;

  const toggle = (id: string): void => {
    setActiveId((current) => (current === id ? null : id));
  };

  const reading =
    active && leader
      ? {
          name: active.name,
          ordinal: activeIndex === 0 ? null : `${String(activeIndex + 1)}º`,
          total: String(ranking.length),
          count: formatInt(active.count),
        }
      : null;

  const readingText = reading
    ? reading.ordinal
      ? `${reading.name} está em ${reading.ordinal} de ${reading.total}, com ${reading.count} agendas.`
      : `${reading.name} lidera, com ${reading.count} agendas.`
    : 'Nenhuma SDR selecionada; clique num nome da legenda para focar.';

  const summary = `Barra radial com as agendas de ${String(ranking.length)} SDRs na semana, do maior para o menor anel. ${readingText}`;

  const renderValue = ({ viewBox, index }: RadialLabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : chartRows[index];
    const vb = readPolarViewBox(viewBox);
    if (!row || !vb) return null;
    const { cx, cy, innerRadius, outerRadius } = vb;
    const radius = (innerRadius + outerRadius) / 2;
    const isActive = row.id === activeId;
    /* Halo obrigatório (ROT-7): num anel fino, o gap tangencial da LABEL_GAP_PX pode não
     * bastar para o texto nascer inteiramente fora da própria marca, e o valor em destaque
     * (`--text-primary`) sobre a cor categórica do arco é par proibido pela ACE-8. O halo
     * troca o fundo local por `--surface-raised`, o único par que o valor pode usar. */
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill={isActive ? 'var(--text-primary)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={isActive ? 700 : 500}
        style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
        textAnchor="end"
        x={cx - LABEL_GAP_PX}
        y={cy - radius}
      >
        {formatInt(row.count)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs text-text-secondary">
        {reading ? (
          reading.ordinal ? (
            <>
              <span className="font-semibold text-text-primary">{reading.name}</span> está em{' '}
              <span className="kpi-number font-medium text-text-primary">{reading.ordinal}</span> de{' '}
              <span className="kpi-number font-medium text-text-primary">{reading.total}</span>, com{' '}
              <span className="kpi-number font-medium text-text-primary">{reading.count}</span> agendas.
            </>
          ) : (
            <>
              <span className="font-semibold text-text-primary">{reading.name}</span> lidera, com{' '}
              <span className="kpi-number font-medium text-text-primary">{reading.count}</span> agendas.
            </>
          )
        ) : (
          'Nenhuma SDR selecionada; clique num nome da legenda para focar.'
        )}
      </p>
      <div className="flex min-h-0 flex-1 items-stretch gap-4">
        <div className="relative aspect-square h-full max-h-full w-full max-w-56 shrink-0">
          <ResponsiveContainer height="100%" width="100%">
            <RadialBarChart accessibilityLayer={false} barCategoryGap="18%" data={chartRows} endAngle={END_ANGLE} innerRadius="10%" outerRadius="96%" startAngle={START_ANGLE}>
              <PolarAngleAxis axisLine={false} dataKey="count" domain={[0, maxValue]} tick={false} type="number" />
              <RadialBar background={{ fill: TRACK_FILL }} cornerRadius={4} dataKey="count" isAnimationActive={animate} label={renderValue}>
                {chartRows.map((row) => (
                  <Cell key={row.id} fill={row.id === activeId ? HIGHLIGHT_FILL : NEUTRAL_FILL} />
                ))}
              </RadialBar>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <ul className="my-auto flex min-w-0 flex-1 flex-col gap-2.5 text-xs">
          {ranking.map((row) => {
            const isActive = row.id === activeId;
            return (
              <li key={row.id}>
                <button
                  aria-pressed={isActive}
                  className="flex w-full min-w-0 items-center gap-2.5 rounded text-left"
                  onClick={() => {
                    toggle(row.id);
                  }}
                  type="button"
                >
                  <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: isActive ? HIGHLIGHT_FILL : NEUTRAL_FILL }} />
                  <span className={cn('min-w-0 flex-1 truncate text-text-secondary', isActive && 'font-semibold text-text-primary')}>{row.name}</span>
                  <span className="kpi-number ml-auto shrink-0 font-medium text-text-muted">{formatInt(row.count)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
