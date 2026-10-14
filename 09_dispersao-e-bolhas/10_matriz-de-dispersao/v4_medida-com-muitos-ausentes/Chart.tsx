import { Filter } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';

import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CampaignMetrics } from './data';

/**
 * Matriz de dispersão 4 por 4 em que uma das medidas não foi registrada em parte das campanhas. O
 * ponto da versão é que a ausência não se resolve num lugar só: ela muda o denominador de cada célula
 * que depende da medida faltante e deixa as outras intactas, então cada célula escreve o próprio n em
 * vez de o cartão anunciar um número único que valeria para menos da metade dos painéis. Registro sem
 * a medida sai da amostra daquela célula e é contado no rodapé, nunca lançado como zero, porque zero
 * é uma posição no plano e diria que a campanha teve CTR nenhum (EST-1b, DAD-2).
 */
export interface ScatterMatrixMissingProps {
  readonly data?: readonly CampaignMetrics[];
  readonly height?: number;
  readonly className?: string;
}

type MeasureKey = 'investment' | 'cpl' | 'ctr' | 'qualificationRate';

interface Measure {
  readonly id: MeasureKey;
  readonly label: string;
  /** Devolve `null` quando a campanha não tem a medida: a ausência é do tipo, não de um valor de
   * fuga (EST-1b). É este `null` que tira a campanha da célula sem a pôr no zero. */
  readonly accessor: (row: CampaignMetrics) => number | null;
  readonly format: (value: number) => string;
  /** Domínio redondo e `ticks` fixos (EIX-4). A mesma régua vale para a medida quando ela é o X de
   * uma coluna e quando é o Y de uma linha: é propriedade da MEDIDA, nunca da célula, e é isso que
   * impede duas células da mesma coluna de escalarem diferente. O domínio NÃO se recalcula sobre os
   * presentes de cada célula, e essa é a escolha que mantém as células comparáveis: o eixo de CTR é
   * o mesmo nas células que perdem 19 campanhas e na diagonal que perde as mesmas 19. */
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
    // Maior valor entre os 45 presentes: 3,82% (camp-17 Maná).
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
/** Folga do eixo de contagem (oculto) da diagonal acima da barra mais alta, para ela não encostar no
 * topo do corpo (ESP-3). */
const HIST_COUNT_HEADROOM = 1.25;
const CELL_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 } as const;
/** Raio do ponto em px, menor que os 4,514 px do padrão do Recharts para o canto do n não disputar
 * espaço com a nuvem. O raio vai numa forma própria, e não no `range` do ZAxis, porque medido em
 * 2026-09-28 o ZAxis não chega ao símbolo: com ele o preview saiu com o padrão da biblioteca. */
const POINT_RADIUS = 3;
const POINT_FILL = 'var(--chart-1)';
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

/** Revestimento da cor do cartão por baixo do traço, para dois pontos vizinhos não se fundirem numa
 * mancha só onde a nuvem é densa (COR-5, TOK-4). */
function Dot({ cx, cy }: DotProps) {
  if (cx === undefined || cy === undefined) {
    return null;
  }
  return <circle cx={cx} cy={cy} fill={POINT_FILL} r={POINT_RADIUS} stroke="var(--surface-raised)" strokeWidth={1} />;
}

/** Os valores presentes de uma medida, sem os ausentes. Devolve a lista, e não uma conta: quem precisa
 * do n usa o `length` dela, e quem precisa do histograma usa os valores, sem que nenhuma das duas
 * coisas passe por um zero de conveniência. */
function presentValues(rows: readonly CampaignMetrics[], measure: Measure): readonly number[] {
  const out: number[] = [];
  for (const row of rows) {
    const value = measure.accessor(row);
    if (value !== null) {
      out.push(value);
    }
  }
  return out;
}

/** Os pares completos de uma célula: a campanha só entra se tiver AS DUAS medidas. Por isso o n da
 * célula de CTR contra CPL é menor que o de investimento contra CPL, e por isso ele se escreve célula
 * a célula em vez de uma vez no cartão. */
function pairs(rows: readonly CampaignMetrics[], colMeasure: Measure, rowMeasure: Measure): readonly Point[] {
  const out: Point[] = [];
  for (const row of rows) {
    const x = colMeasure.accessor(row);
    const y = rowMeasure.accessor(row);
    if (x !== null && y !== null) {
      out.push({ x, y });
    }
  }
  return out;
}

/** Seis faixas iguais dentro do domínio redondo e compartilhado da própria medida, contadas só sobre
 * os valores presentes. As seis faixas caem no centro das seis bandas que o Recharts desenha para
 * `data.length === 6`; mudar `HIST_BINS` sem revisar essa contagem desalinha a diagonal das dispersões
 * vizinhas da mesma coluna (EIX-12). */
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

export default function ScatterMatrixMissing({ data = defaultData, height, className }: ScatterMatrixMissingProps) {
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

  /** As medidas que faltam em alguma campanha, descobertas do dado e não escritas à mão: é assim que o
   * rodapé continua verdadeiro se amanhã for o CPL que faltar. */
  const incomplete = MEASURES.filter((measure) => presentValues(data, measure).length < data.length);
  const missingLabels = incomplete.map((measure) => measure.label).join(', ');
  const missingRows = data.filter((row) => incomplete.some((measure) => measure.accessor(row) === null));
  /** Quantas das dezesseis células dependem de uma medida incompleta, contadas na própria grade. */
  const affectedCells = MEASURES.flatMap((rowMeasure) =>
    MEASURES.filter((colMeasure) => incomplete.includes(rowMeasure) || incomplete.includes(colMeasure)),
  ).length;
  const summary = `Matriz de dispersão com investimento, CPL, CTR e taxa de qualificação de ${formatInt(data.length)} campanhas fictícias; ${formatInt(missingRows.length)} não têm CTR registrado e saem apenas das ${formatInt(affectedCells)} células que dependem dele, onde o n de cada célula cai.`;

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
          MEASURES.map((colMeasure, col) => {
            const diagonal = row === col;
            const values = presentValues(data, rowMeasure);
            const cloud = pairs(data, colMeasure, rowMeasure);
            const shown = diagonal ? values.length : cloud.length;
            return (
              <div
                className="relative min-h-0 min-w-0"
                key={`cell-${rowMeasure.id}-${colMeasure.id}`}
                style={{ gridColumn: col + 2, gridRow: row + 1 }}
              >
                <ResponsiveContainer height="100%" width="100%">
                  {diagonal ? (
                    (() => {
                      const bins = histogram(values, rowMeasure.domain);
                      const maxCount = Math.max(1, ...bins.map((bin) => bin.count));
                      return (
                        <BarChart accessibilityLayer={false} barCategoryGap={HIST_BAR_GAP} data={bins} margin={CELL_MARGIN}>
                          {/* Grade só na vertical: a horizontal viria do eixo de contagem, que não é a
                              medida da linha, e sairia com espaçamento diferente das outras células da
                              mesma linha (EIX-12). A EIX-3b obriga grade nos dois sentidos onde a marca
                              é lida por posição nos dois eixos, e aqui ela não é: em Y a barra se lê por
                              comprimento a partir do zero. */}
                          <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
                          {/* interval={0}: com eixo `hide`, o interval padrão do Recharts descarta
                              tiques declarados por colisão de rótulo estimada mesmo sem desenhá-lo, e a
                              grade (que lê os ticks do eixo) sai desigual (EIX-4, EIX-9). */}
                          <XAxis dataKey="mid" domain={colMeasure.domain} hide interval={0} ticks={[...colMeasure.ticks]} type="number" />
                          <YAxis allowDecimals={false} domain={[0, Math.ceil(maxCount * HIST_COUNT_HEADROOM)]} hide interval={0} type="number" />
                          <Bar dataKey="count" fill={HIST_FILL} isAnimationActive={false} maxBarSize={14} />
                        </BarChart>
                      );
                    })()
                  ) : (
                    <ScatterChart accessibilityLayer={false} margin={CELL_MARGIN}>
                      {/* Os dois eixos são quantitativos e o ponto é lido por posição nos dois, então a
                          grade vai nos dois sentidos, em `--line-subtle`, sem tique e sem linha de eixo
                          (EIX-3b). */}
                      <CartesianGrid stroke="var(--line-subtle)" />
                      <XAxis dataKey="x" domain={colMeasure.domain} hide interval={0} ticks={[...colMeasure.ticks]} type="number" />
                      <YAxis dataKey="y" domain={rowMeasure.domain} hide interval={0} ticks={[...rowMeasure.ticks]} type="number" />
                      <Scatter data={[...cloud]} isAnimationActive={false} shape={<Dot />} />
                    </ScatterChart>
                  )}
                </ResponsiveContainer>
                {/* O n de cada célula, sobre fundo da própria superfície: é o halo da ROT-7 escrito em
                    HTML, e sem ele o número cairia sobre a nuvem em parte das dezesseis células. */}
                <span className="absolute right-0 top-0 rounded-sm bg-surface-raised px-1 text-[0.6875rem] text-text-muted tabular-nums">
                  n = {formatInt(shown)}
                </span>
              </div>
            );
          }),
        )}
      </div>
      {/* Rodapé de ausência: nomeia a medida que falta, quantas campanhas faltam e em quantas células
          isso pesa. A ausência sai da amostra e é contada aqui, sempre (DAD-2). */}
      <p className="mt-1 shrink-0 text-[0.6875rem] text-text-muted tabular-nums">
        n = campanhas com as duas medidas registradas. {formatInt(missingRows.length)} das{' '}
        {formatInt(data.length)} não têm {missingLabels} e saem das {formatInt(affectedCells)} células que dependem
        dele, nunca como zero.
      </p>
    </div>
  );
}
