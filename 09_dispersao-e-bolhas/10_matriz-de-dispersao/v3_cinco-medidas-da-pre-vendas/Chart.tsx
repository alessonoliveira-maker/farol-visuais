import { Filter } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SdrWeek } from './data';

/**
 * Matriz de dispersão de cinco medidas de pré-vendas, desenhada só no triângulo inferior: com cinco
 * medidas a matriz cheia traria vinte painéis fora da diagonal e cada par apareceria duas vezes,
 * espelhado, o que gasta metade do cartão para não dizer nada novo. O tempo de contato varia por
 * ordem de grandeza, de um minuto a mil, então o eixo dele é logarítmico; e a escala é propriedade da
 * MEDIDA, não da célula, para a mesma medida ter a mesma régua na linha e na coluna. HTML com Tailwind
 * para a grade, um ScatterChart ou BarChart pequeno por célula, sem animação e sem dica.
 */
export interface SdrScatterMatrixProps {
  readonly data?: readonly SdrWeek[];
  readonly height?: number;
  readonly className?: string;
}

type MeasureKey = 'queue' | 'attempts' | 'contactMinutes' | 'meetings' | 'slaRate';

interface Measure {
  readonly id: MeasureKey;
  readonly label: string;
  readonly accessor: (row: SdrWeek) => number;
  readonly format: (value: number) => string;
  /** Substantivo da medida, para a contagem não sair solta na borda (NUM-6). Ausente onde o próprio
   * formatador já carrega a unidade, como no percentual. */
  readonly unit?: string;
  /** Domínio redondo e `ticks` fixos (EIX-4), e a escala junto deles. Os três são propriedade da
   * MEDIDA, nunca da célula: é isso, e só isso, que garante que as cinco células de uma coluna leiam
   * o mesmo X e as cinco de uma linha o mesmo Y. Quem quiser mudar a régua muda aqui, e ela muda nos
   * dois papéis ao mesmo tempo. */
  readonly domain: readonly [number, number];
  readonly ticks: readonly number[];
  readonly scale: 'linear' | 'log';
}

const MEASURES: readonly Measure[] = [
  {
    id: 'queue',
    label: 'Fila',
    accessor: (row) => row.queue,
    format: formatInt,
    unit: 'leads',
    // Faixa medida: 8 a 120.
    domain: [0, 120],
    ticks: [0, 40, 80, 120],
    scale: 'linear',
  },
  {
    id: 'attempts',
    label: 'Tentativas',
    accessor: (row) => row.attempts,
    format: formatInt,
    unit: 'tentativas',
    // Faixa medida: 3 a 40.
    domain: [0, 40],
    ticks: [0, 10, 20, 30, 40],
    scale: 'linear',
  },
  {
    id: 'contactMinutes',
    label: 'Tempo de contato',
    accessor: (row) => row.contactMinutes,
    format: formatInt,
    unit: 'minutos',
    /** Faixa medida: 1 a 1.000 minutos. Domínio em três décadas inteiras e tiques em potência de
     * dez, que na escala logarítmica caem em 0, 1/3, 2/3 e 1 da largura da célula: as mesmas divisas
     * das seis faixas do histograma da diagonal, o que mantém a diagonal alinhada com as dispersões
     * da própria coluna (EIX-12). */
    domain: [1, 1000],
    ticks: [1, 10, 100, 1000],
    scale: 'log',
  },
  {
    id: 'meetings',
    label: 'Agendas',
    accessor: (row) => row.meetings,
    format: formatInt,
    unit: 'agendas',
    // Faixa medida: 1 a 10.
    domain: [0, 12],
    ticks: [0, 4, 8, 12],
    scale: 'linear',
  },
  {
    id: 'slaRate',
    label: 'Dentro do SLA',
    accessor: (row) => row.slaRate,
    format: (value) => formatPercent(value, 0),
    // Faixa medida: 14,2% a 94,9%.
    domain: [0, 1],
    ticks: [0, 0.25, 0.5, 0.75, 1],
    scale: 'linear',
  },
];

const GRID_SIZE = MEASURES.length;
const PAIR_COUNT = (GRID_SIZE * (GRID_SIZE - 1)) / 2;
const LABEL_COL_WIDTH = 110;
const LABEL_ROW_HEIGHT = 40;
const CELL_GAP = 4;
const HIST_BINS = 6;
const HIST_BAR_GAP = '30%';
/** Folga do eixo de contagem (oculto) da diagonal acima da barra mais alta, para ela não encostar no
 * topo do corpo (ESP-3). */
const HIST_COUNT_HEADROOM = 1.25;
const CELL_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 } as const;
/** Raio do ponto em px, contra os 4,514 px do padrão do Recharts: com 240 registros numa célula de
 * cerca de 145 por 94 px o ponto padrão vira massa contínua e a densidade deixa de se ler. O raio vai
 * numa forma própria, e não no `range` do ZAxis, porque medido em 2026-09-28 o ZAxis não chega ao
 * símbolo: com ele o preview saiu com os 4,514 px do padrão da biblioteca nos 4.800 pontos. */
const POINT_RADIUS = 2.2;
const POINT_FILL = 'var(--chart-1)';
/** A especificação da versão pede "opacidade baixa" e a ACE-5 põe piso nela: `fillOpacity` compõe a
 * cor da marca com a do cartão e o resultado precisa ficar acima de 3:1 nos dois temas. Medido nos
 * tokens do Farol, `--chart-1` sobre `--surface-raised` cai para 2,99:1 no tema claro com 0,66 e
 * chega a 3,25:1 com 0,70, enquanto no escuro 0,70 mede 5,30:1. O contrato vence a especificação:
 * 0,70 é a opacidade mais baixa que passa nos dois temas, e a densidade fica por conta do raio. */
const POINT_FILL_OPACITY = 0.7;
const HIST_FILL = 'var(--chart-1)';

interface Bin {
  readonly mid: number;
  readonly count: number;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

interface DotProps {
  readonly cx?: number;
  readonly cy?: number;
}

function DenseDot({ cx, cy }: DotProps) {
  if (cx === undefined || cy === undefined) {
    return null;
  }
  return <circle cx={cx} cy={cy} fill={POINT_FILL} fillOpacity={POINT_FILL_OPACITY} r={POINT_RADIUS} />;
}

/** As seis divisas do histograma, no espaço da própria escala da medida: iguais em valor quando a
 * escala é linear, iguais em razão quando é logarítmica. É o que faz as seis faixas caírem nas seis
 * bandas de largura igual que o Recharts desenha, porque o eixo logarítmico mapeia intervalo de razão
 * constante em largura constante de pixel. */
function binIndex(value: number, measure: Measure): number {
  const [min, max] = measure.domain;
  if (measure.scale === 'log') {
    const step = (Math.log10(max) - Math.log10(min)) / HIST_BINS;
    return Math.min(HIST_BINS - 1, Math.max(0, Math.floor((Math.log10(value) - Math.log10(min)) / step)));
  }
  const step = (max - min) / HIST_BINS || 1;
  return Math.min(HIST_BINS - 1, Math.max(0, Math.floor((value - min) / step)));
}

function binMid(index: number, measure: Measure): number {
  const [min, max] = measure.domain;
  if (measure.scale === 'log') {
    const step = (Math.log10(max) - Math.log10(min)) / HIST_BINS;
    return 10 ** (Math.log10(min) + (index + 0.5) * step);
  }
  const step = (max - min) / HIST_BINS || 1;
  return min + (index + 0.5) * step;
}

/** Contagem de registros por faixa da própria medida, para a célula da diagonal. */
function histogram(rows: readonly SdrWeek[], measure: Measure): readonly Bin[] {
  const counts = new Array<number>(HIST_BINS).fill(0);
  for (const row of rows) {
    const index = binIndex(measure.accessor(row), measure);
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts.map((count, index) => ({ mid: binMid(index, measure), count }));
}

function points(rows: readonly SdrWeek[], colMeasure: Measure, rowMeasure: Measure): readonly Point[] {
  return rows.map((row) => ({ x: colMeasure.accessor(row), y: rowMeasure.accessor(row) }));
}

function rangeLabel(measure: Measure): string {
  const [min, max] = measure.domain;
  const faixa = `${measure.format(min)} a ${measure.format(max)}`;
  return measure.unit === undefined ? faixa : `${faixa} ${measure.unit}`;
}

export default function SdrScatterMatrix({ data = defaultData, height, className }: SdrScatterMatrixProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum registro de SDR neste recorte: não há dado para comparar as cinco medidas.</span>
      </div>
    );
  }

  const summary = `Matriz de dispersão com o triângulo inferior de ${formatInt(GRID_SIZE)} medidas de pré-vendas em ${formatInt(data.length)} registros de SDR por semana, tempo de contato em escala logarítmica: fila e tempo de contato sobem juntos, e o SLA cai quando o tempo sobe.`;

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
        {/* A nota mora nas células que o triângulo inferior deixa vazias, e por isso não encolhe o
            desenho (GEO-14): ela não tira altura de nenhuma célula. Diz as três coisas que a matriz
            triangular não desmente sozinha, porque o desenho parado cala sobre convenção. */}
        <div
          className="flex flex-col justify-start gap-1 pl-2 text-[0.6875rem] text-text-muted"
          style={{ gridColumn: '4 / 7', gridRow: '1 / 3' }}
        >
          <span>
            Só o triângulo inferior: o superior repetiria os mesmos {formatInt(PAIR_COUNT)} pares,
            espelhados.
          </span>
          <span>Na diagonal, a contagem de registros por faixa da própria medida.</span>
          <span>Tempo de contato em escala logarítmica, a mesma na linha e na coluna.</span>
        </div>
        <div
          className="flex flex-col justify-end pb-1 text-[0.6875rem] text-text-muted tabular-nums"
          style={{ gridColumn: 1, gridRow: GRID_SIZE + 1 }}
        >
          {formatInt(data.length)} registros
        </div>
        {MEASURES.map((measure, row) => (
          <div
            className="flex flex-col justify-center pr-2 text-left text-xs font-medium text-text-secondary"
            key={`row-${measure.id}`}
            style={{ gridColumn: 1, gridRow: row + 1 }}
          >
            <span>{measure.label}</span>
            <span className="text-[0.6875rem] font-normal text-text-muted tabular-nums">{rangeLabel(measure)}</span>
          </div>
        ))}
        {MEASURES.map((measure, col) => (
          <div
            className="flex flex-col items-center justify-start pt-1 text-center text-xs font-medium text-text-secondary"
            key={`col-${measure.id}`}
            style={{ gridColumn: col + 2, gridRow: GRID_SIZE + 1 }}
          >
            <span>{measure.label}</span>
            <span className="text-[0.6875rem] font-normal text-text-muted tabular-nums">{rangeLabel(measure)}</span>
          </div>
        ))}
        {MEASURES.map((rowMeasure, row) =>
          /* Triângulo inferior: a linha `row` só desenha as colunas de 0 a `row`. */
          MEASURES.slice(0, row + 1).map((colMeasure, col) => (
            <div
              className="min-h-0 min-w-0"
              key={`cell-${rowMeasure.id}-${colMeasure.id}`}
              style={{ gridColumn: col + 2, gridRow: row + 1 }}
            >
              <ResponsiveContainer height="100%" width="100%">
                {row === col ? (
                  (() => {
                    const bins = histogram(data, rowMeasure);
                    const maxCount = Math.max(1, ...bins.map((bin) => bin.count));
                    return (
                      <BarChart accessibilityLayer={false} barCategoryGap={HIST_BAR_GAP} data={bins} margin={CELL_MARGIN}>
                        {/* Grade só na vertical: a horizontal viria do eixo de contagem, que não é a
                            medida da linha, e sairia com espaçamento diferente das outras células da
                            mesma linha (EIX-12). A EIX-3b obriga grade nos dois sentidos onde a marca
                            é lida por posição nos dois eixos, e aqui ela não é: em Y a barra se lê por
                            comprimento a partir do zero, não por posição. */}
                        <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
                        {/* interval={0}: com eixo `hide`, o interval padrão do Recharts descarta
                            tiques declarados por colisão de rótulo estimada mesmo sem desenhá-lo, e a
                            grade (que lê os ticks do eixo) sai desigual (EIX-4, EIX-9). */}
                        <XAxis
                          dataKey="mid"
                          domain={colMeasure.domain}
                          hide
                          interval={0}
                          scale={colMeasure.scale}
                          ticks={[...colMeasure.ticks]}
                          type="number"
                        />
                        <YAxis allowDecimals={false} domain={[0, Math.ceil(maxCount * HIST_COUNT_HEADROOM)]} hide interval={0} type="number" />
                        <Bar dataKey="count" fill={HIST_FILL} isAnimationActive={false} maxBarSize={14} />
                      </BarChart>
                    );
                  })()
                ) : (
                  <ScatterChart accessibilityLayer={false} margin={CELL_MARGIN}>
                    <CartesianGrid stroke="var(--line-subtle)" />
                    {/* Os dois eixos são quantitativos e o ponto é lido por posição nos dois, então a
                        grade vai nos dois sentidos, em `--line-subtle`, sem tique e sem linha de eixo
                        (EIX-3b). `interval={0}` nos dois: sem ele a mesma medida pode perder tiques
                        diferentes em X e em Y e desenhar régua diferente conforme o papel na célula. */}
                    <XAxis
                      dataKey="x"
                      domain={colMeasure.domain}
                      hide
                      interval={0}
                      scale={colMeasure.scale}
                      ticks={[...colMeasure.ticks]}
                      type="number"
                    />
                    <YAxis
                      dataKey="y"
                      domain={rowMeasure.domain}
                      hide
                      interval={0}
                      scale={rowMeasure.scale}
                      ticks={[...rowMeasure.ticks]}
                      type="number"
                    />
                    <Scatter data={[...points(data, colMeasure, rowMeasure)]} isAnimationActive={false} shape={<DenseDot />} />
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
