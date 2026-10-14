import { Filter } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';

import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CampaignMetrics } from './data';

/**
 * Matriz de dispersão 4 por 4 para explorar de uma vez os pares entre investimento, CPL, CTR e
 * taxa de qualificação de campanhas de mídia paga. Cada coluna compartilha o domínio de X entre
 * as quatro linhas e cada linha compartilha o de Y; a diagonal troca o par pela distribuição da
 * própria medida. HTML com Tailwind para a grade, um ScatterChart ou BarChart pequeno por célula,
 * sem animação e sem dica: visual de exploração, não de apresentação para diretoria.
 */
export interface ScatterMatrixProps {
  readonly data?: readonly CampaignMetrics[];
  readonly height?: number;
  readonly className?: string;
}

type MeasureKey = 'investment' | 'cpl' | 'ctr' | 'qualificationRate';

interface Measure {
  readonly id: MeasureKey;
  readonly label: string;
  readonly accessor: (row: CampaignMetrics) => number;
  readonly format: (value: number) => string;
  /** Domínio redondo e `ticks` fixos (EIX-4): a mesma régua vale para a medida em X e em Y, e o
   * eixo termina na primeira linha de grade redonda acima do maior valor do conjunto fictício e
   * fixo de `data.ts`, calculado uma vez aqui em vez de por render (`max × folga`). */
  readonly domain: readonly [number, number];
  readonly ticks: readonly number[];
}

const MEASURES: readonly Measure[] = [
  {
    id: 'investment',
    label: 'Investimento',
    accessor: (row) => row.investment,
    format: formatCurrencyCompact,
    // Maior valor: R$ 59,2 mil (camp-14 Harmonia).
    domain: [0, 60_000],
    ticks: [0, 20_000, 40_000, 60_000],
  },
  {
    id: 'cpl',
    label: 'CPL',
    accessor: (row) => row.cpl,
    format: formatCurrencyCompact,
    // Maior valor: R$ 151 (camp-43 Orvalho).
    domain: [0, 160],
    ticks: [0, 40, 80, 120, 160],
  },
  {
    id: 'ctr',
    label: 'CTR',
    accessor: (row) => row.ctr,
    format: (value) => formatPercent(value, 1),
    // Maior valor: 3,82% (camp-17 Maná).
    domain: [0, 0.04],
    ticks: [0, 0.01, 0.02, 0.03, 0.04],
  },
  {
    id: 'qualificationRate',
    label: 'Taxa de qualificação',
    accessor: (row) => row.qualificationRate,
    format: (value) => formatPercent(value, 0),
    // Maior valor: 42,6% (camp-07 Tucano).
    domain: [0, 0.5],
    ticks: [0, 0.25, 0.5],
  },
];

const GRID_SIZE = MEASURES.length;
const LABEL_COL_WIDTH = 92;
const LABEL_ROW_HEIGHT = 40;
const CELL_GAP = 4;
const HIST_BINS = 6;
const HIST_BAR_GAP = '30%';
/** Folga do eixo de contagem (oculto) da diagonal acima da barra mais alta, para ela não encostar
 * no topo do corpo (ESP-3); `allowDecimals={false}` porque é contagem de campanhas (EIX-4). */
const HIST_COUNT_HEADROOM = 1.25;
const CELL_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 } as const;
const POINT_FILL = 'var(--chart-1)';
const HIST_FILL = 'var(--chart-1)';

interface Bin {
  readonly mid: number;
  readonly count: number;
}

/** Seis faixas iguais dentro do domínio redondo e compartilhado da própria medida (mesmo domínio
 * usado nas dispersões da linha e da coluna). As seis faixas caem no centro das seis bandas que o
 * Recharts desenha para `data.length === 6`; mudar `HIST_BINS` sem revisar essa contagem desalinha
 * a diagonal das dispersões vizinhas (EIX-12). */
function histogram(values: readonly number[], domain: readonly [number, number]): readonly Bin[] {
  const [min, max] = domain;
  const width = (max - min) / HIST_BINS || 1;
  const counts = new Array<number>(HIST_BINS).fill(0);
  for (const value of values) {
    const index = Math.min(HIST_BINS - 1, Math.max(0, Math.floor((value - min) / width)));
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts.map((count, index) => ({ mid: min + (index + 0.5) * width, count }));
}

export default function ScatterMatrix({ data = defaultData, height, className }: ScatterMatrixProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte: não há dado para comparar as quatro medidas.</span>
      </div>
    );
  }

  const richest = [...data].sort((a, b) => b.investment - a.investment)[0];
  const summary = richest
    ? `Matriz de dispersão com investimento, CPL, CTR e taxa de qualificação de ${String(data.length)} campanhas fictícias; diagonal com a distribuição de cada medida. Maior investimento: ${richest.name}, ${formatCurrencyCompact(richest.investment)}.`
    : `Matriz de dispersão com quatro medidas de ${String(data.length)} campanhas fictícias.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div
        aria-hidden
        className="grid min-h-0 flex-1"
        style={{
          gap: CELL_GAP,
          gridTemplateColumns: `${String(LABEL_COL_WIDTH)}px repeat(${String(GRID_SIZE)}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${String(GRID_SIZE)}, minmax(0, 1fr)) ${String(LABEL_ROW_HEIGHT)}px`,
        }}
      >
        <div
          className="flex flex-col justify-end pb-1 text-[0.6875rem] text-text-muted tabular-nums"
          style={{ gridColumn: 1, gridRow: GRID_SIZE + 1 }}
        >
          {formatInt(data.length)} campanhas
        </div>
        {MEASURES.map((measure, row) => (
          <div
            className="flex flex-col justify-center pr-2 text-left text-xs font-medium text-text-secondary"
            key={`row-${measure.id}`}
            style={{ gridColumn: 1, gridRow: row + 1 }}
          >
            <span>{measure.label}</span>
            <span className="text-[0.6875rem] font-normal text-text-muted tabular-nums">
              0 a {measure.format(measure.domain[1])}
            </span>
          </div>
        ))}
        {MEASURES.map((measure, col) => (
          <div
            className="flex flex-col items-center justify-start pt-1 text-center text-xs font-medium text-text-secondary"
            key={`col-${measure.id}`}
            style={{ gridColumn: col + 2, gridRow: GRID_SIZE + 1 }}
          >
            <span>{measure.label}</span>
            <span className="text-[0.6875rem] font-normal text-text-muted tabular-nums">
              0 a {measure.format(measure.domain[1])}
            </span>
          </div>
        ))}
        {MEASURES.map((rowMeasure, row) =>
          MEASURES.map((colMeasure, col) => (
            <div
              className="min-h-0 min-w-0"
              key={`cell-${rowMeasure.id}-${colMeasure.id}`}
              style={{ gridColumn: col + 2, gridRow: row + 1 }}
            >
              <ResponsiveContainer height="100%" width="100%">
                {row === col ? (
                  (() => {
                    const bins = histogram(data.map(rowMeasure.accessor), rowMeasure.domain);
                    const maxCount = Math.max(1, ...bins.map((bin) => bin.count));
                    return (
                      <BarChart accessibilityLayer={false} barCategoryGap={HIST_BAR_GAP} data={bins} margin={CELL_MARGIN}>
                        {/* Grade só na vertical (EIX-3/EIX-9): a horizontal viria do eixo de
                            contagem, que não é a medida da linha, e ficaria com espaçamento
                            diferente das outras células da mesma linha (EIX-12). */}
                        <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
                        {/* interval={0}: com eixo hide, o interval padrão do Recharts descarta
                            tiques declarados por colisão de rótulo estimada mesmo sem desenhá-lo,
                            e a grade (que lê os ticks do eixo) sai com espaçamento desigual
                            (EIX-4, EIX-9). */}
                        <XAxis dataKey="mid" domain={colMeasure.domain} hide interval={0} ticks={[...colMeasure.ticks]} type="number" />
                        <YAxis allowDecimals={false} domain={[0, Math.ceil(maxCount * HIST_COUNT_HEADROOM)]} hide interval={0} type="number" />
                        <Bar dataKey="count" fill={HIST_FILL} isAnimationActive={false} maxBarSize={14} />
                      </BarChart>
                    );
                  })()
                ) : (
                  <ScatterChart accessibilityLayer={false} margin={CELL_MARGIN}>
                    <CartesianGrid stroke="var(--line-subtle)" />
                    {/* interval={0} nos dois eixos ocultos: sem isso o Recharts descarta tiques
                        declarados (EIX-4) e a mesma medida pode perder tiques diferentes em X e
                        em Y, desenhando régua diferente conforme o papel dela na célula (EIX-9). */}
                    <XAxis dataKey="x" domain={colMeasure.domain} hide interval={0} ticks={[...colMeasure.ticks]} type="number" />
                    <YAxis dataKey="y" domain={rowMeasure.domain} hide interval={0} ticks={[...rowMeasure.ticks]} type="number" />
                    <Scatter
                      data={data.map((item) => ({ x: colMeasure.accessor(item), y: rowMeasure.accessor(item) }))}
                      fill={POINT_FILL}
                      isAnimationActive={false}
                      shape="circle"
                      stroke="var(--surface-raised)"
                      strokeWidth={1}
                    />
                  </ScatterChart>
                )}
              </ResponsiveContainer>
            </div>
          )),
        )}
      </div>
    </div>
  );
}
