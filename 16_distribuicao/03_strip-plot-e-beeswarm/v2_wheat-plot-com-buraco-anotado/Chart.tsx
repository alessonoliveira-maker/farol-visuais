import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BIN_WIDTH, data as defaultData, GAP_REASON, type Opportunity } from './data';

/**
 * Wheat plot: cada oportunidade vira um ponto no dia exato em que a primeira reunião aconteceu, e a
 * altura é a ordem dela dentro do intervalo de 5 dias. O histograma responderia "quantas por faixa";
 * este responde "em que dia", e é a segunda pergunta que revela os vãos.
 *
 * A altura não é grandeza: ela só resolve sobreposição. Por isso o eixo Y fica oculto, e por isso a
 * nota de leitura precisa dizer de onde vem a pilha. Sem essa frase o leitor tenta ler altura como
 * medida, que é o erro mais caro desta forma.
 */
export interface FirstMeetingWheatPlotProps {
  readonly data?: readonly Opportunity[];
  readonly binWidth?: number;
  readonly gapReason?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Uma oportunidade já posicionada: o dia manda no eixo, o nível só resolve a sobreposição. */
interface Dot extends Opportunity {
  readonly level: number;
}

interface Gap {
  readonly from: number;
  readonly to: number;
}

interface Band {
  readonly from: number;
  readonly to: number;
  readonly count: number;
}

const MARGIN = { top: 20, right: 26, bottom: 0, left: 26 } as const;
/**
 * Altura da faixa do eixo X (EIX-6b): os 8 px de `tickMargin` mais os cerca de 15 px de tinta de uma
 * linha de 11 px. Canvas maior não resolve, porque a grade em `flex-1` absorve a altura extra e
 * empurra o rótulo junto: quem cede é a faixa do eixo.
 */
const X_AXIS_H = 24;
const TICK_MARGIN = 8;
/** Passo do tique, em dias. Múltiplo redondo que fecha de 3 a 5 linhas de grade (EIX-4). */
const TICK_STEP = 10;
/**
 * Área do ponto em px², que é o que o `ZAxis` do Recharts recebe: 38 px² equivalem a um raio de
 * 3,5 px. Com o passo de nível em cerca de 10 px, dois vizinhos da mesma pilha nunca se encostam.
 */
const DOT_AREA = 38;
const DOT_FILL = 'var(--chart-1)';
/**
 * Contorno na cor da superfície, e não opacidade. Opacidade compõe a marca com o cartão e derruba o
 * contraste: medido nesta sessão, `--chart-1` com `fillOpacity` de 0,45 mede 2,97:1 no tema escuro e
 * 2,04:1 no claro, abaixo do piso de 3:1 da ACE-5. Opaco ele mede 9,50:1 e 6,00:1, e o contorno
 * separa dois pontos colados sem tocar no contraste do preenchimento.
 */
const DOT_EDGE = 'var(--surface-raised)';
const DOT_EDGE_W = 0.75;
const GAP_FILL = 'var(--surface-sunken)';
const GAP_STROKE = 'var(--line-subtle)';
const ANNOTATION_COLOR = 'var(--text-muted)';
const ANNOTATION_SIZE = 11;

/**
 * Mediana da lista, ou `null` quando ela está vazia. Nunca zero: zero dia até a primeira reunião é um
 * prazo plausível, então a mediana zerada de uma lista vazia entraria no cartão como o melhor mês já
 * medido, num recorte em que nada foi medido (EST-1b).
 */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const above = sorted[middle];
  if (above === undefined) return null;
  if (sorted.length % 2 === 1) return above;
  const below = sorted[middle - 1];
  if (below === undefined) return null;
  return (below + above) / 2;
}

/**
 * Empilha as oportunidades por intervalo. O desempate por `id` existe para o desenho não mudar entre
 * renders: com dois casos no mesmo dia, a ordem do `sort` sem desempate depende da ordem de entrada,
 * e o preview deixaria de ser o retrato do componente.
 */
function stack(rows: readonly Opportunity[], binWidth: number): readonly Dot[] {
  const ordered = [...rows].sort((a, b) => a.days - b.days || a.id.localeCompare(b.id));
  const used = new Map<number, number>();
  return ordered.map((row) => {
    const bin = Math.floor(row.days / binWidth);
    const seen = used.get(bin);
    const level = seen === undefined ? 0 : seen;
    used.set(bin, level + 1);
    return { ...row, level };
  });
}

/**
 * O vão mais largo de dias inteiros sem nenhuma reunião, dentro do intervalo observado, ou `null`
 * quando não existe nenhum. Medido do próprio dado: a lacuna escrita à mão envelhece no primeiro
 * recorte diferente e passa a apontar para um vão que tem caso.
 */
function widestGap(days: readonly number[]): Gap | null {
  const sorted = [...days].sort((a, b) => a - b);
  const low = sorted[0];
  const high = sorted[sorted.length - 1];
  if (low === undefined || high === undefined) return null;
  const present = new Set(sorted);
  let best: Gap | null = null;
  let open: Gap | null = null;
  for (let day = low + 1; day < high; day += 1) {
    if (present.has(day)) {
      open = null;
      continue;
    }
    open = open === null ? { from: day, to: day } : { from: open.from, to: day };
    if (best === null || open.to - open.from > best.to - best.from) best = open;
  }
  return best;
}

/** O intervalo mais cheio, ou `null` em lista vazia. */
function fullestBand(dots: readonly Dot[], binWidth: number): Band | null {
  const perBin = new Map<number, number>();
  for (const dot of dots) {
    const bin = Math.floor(dot.days / binWidth);
    const seen = perBin.get(bin);
    perBin.set(bin, (seen === undefined ? 0 : seen) + 1);
  }
  let best: Band | null = null;
  for (const [bin, count] of perBin) {
    if (best !== null && count <= best.count) continue;
    best = { from: bin * binWidth, to: (bin + 1) * binWidth - 1, count };
  }
  return best;
}

export default function FirstMeetingWheatPlot({
  data = defaultData,
  binWidth = BIN_WIDTH,
  gapReason = GAP_REASON,
  height,
  className,
}: FirstMeetingWheatPlotProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const dots = stack(data, binWidth);
  const days = dots.map((dot) => dot.days);
  const middle = median(days);
  const gap = widestGap(days);
  const fullest = fullestBand(dots, binWidth);
  const slowest = dots[dots.length - 1];

  /* Zero ao maior nível, como a especificação pede. O piso de 1 existe para o caso em que nenhum
     intervalo tem dois casos: domínio de zero a zero não desenha escala nenhuma. */
  const levelTop = Math.max(1, dots.reduce((top, dot) => (dot.level > top ? dot.level : top), 0));
  const dayTop =
    slowest === undefined ? TICK_STEP : Math.ceil((slowest.days + 1) / TICK_STEP) * TICK_STEP;
  const ticks: number[] = [];
  for (let day = 0; day <= dayTop; day += TICK_STEP) ticks.push(day);

  if (dots.length === 0 || slowest === undefined || middle === null || fullest === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 flex-col items-start justify-center gap-2', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 text-text-muted" />
        <p className="text-xs text-text-muted">
          O recorte não tem oportunidade com primeira reunião marcada, então não há prazo a distribuir
          nem vão a apontar.
        </p>
      </div>
    );
  }

  const summary =
    `Wheat plot dos dias até a primeira reunião de ${formatInt(dots.length)} oportunidades do mês, um ponto por oportunidade. ` +
    `A metade chega em até ${formatDays(middle)} e a faixa de ${formatInt(fullest.from)} a ${formatDays(fullest.to)} concentra ${formatInt(fullest.count)} casos. ` +
    (gap === null
      ? 'Nenhum dia do intervalo ficou sem reunião.'
      : `Nenhuma reunião de ${formatInt(gap.from)} a ${formatDays(gap.to)}.`);

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      {/* Nota de leitura: a altura do ponto não é grandeza, é a ordem dentro do intervalo, e nada no
          desenho diz isso. Sem a frase o leitor lê a pilha como se ela medisse algo (GEO-12). */}
      <p aria-hidden className="shrink-0 text-xs leading-4 text-text-muted">
        {`cada ponto é uma oportunidade, e a pilha sobe pela ordem dentro do intervalo de ${formatDays(binWidth)}`}
      </p>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            {/* Grade só na direção da leitura (EIX-3): quem carrega valor aqui é o eixo X, então as
                linhas úteis são as verticais. A exceção da EIX-3b não vale nesta geometria, porque o
                eixo Y não é grandeza lida por posição, é ordem de empilhamento. */}
            <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
            <XAxis
              {...AXIS_PROPS}
              /* `axisLine` depois do espalhamento: o `AXIS_PROPS` traz a linha de eixo ligada, e com
                 grade no fundo ela é uma régua a mais (EIX-5, REC-30). A ordem decide. */
              axisLine={false}
              dataKey="days"
              domain={[0, dayTop]}
              height={X_AXIS_H}
              tickFormatter={(value: number) => formatDays(value)}
              tickMargin={TICK_MARGIN}
              ticks={ticks}
              type="number"
            />
            <YAxis dataKey="level" domain={[0, levelTop]} hide type="number" />
            {/* Raio fixo: o tamanho do ponto não codifica nada, e sem o `ZAxis` o Recharts passa a
                variar o raio por conta própria (REC-15). */}
            <ZAxis range={[DOT_AREA, DOT_AREA]} />
            {/* O vão vem antes dos pontos para ficar por baixo deles. As meias unidades nas bordas
                fazem a faixa cobrir exatamente os dias inteiros vazios, sem invadir os vizinhos. */}
            {gap === null ? null : (
              <ReferenceArea
                fill={GAP_FILL}
                fillOpacity={1}
                x1={gap.from - 0.5}
                x2={gap.to + 0.5}
                y1={0}
                y2={levelTop}
              />
            )}
            {gap === null ? null : (
              <ReferenceLine
                /* Rótulo em `position: 'top'`, fora da área de plotagem: dentro dela ele disputaria
                   espaço com a pilha vizinha (REC-4). A margem superior é a faixa reservada. */
                label={{
                  fill: ANNOTATION_COLOR,
                  fontSize: ANNOTATION_SIZE,
                  position: 'top',
                  value: 'sem reunião',
                }}
                stroke={GAP_STROKE}
                strokeDasharray="3 3"
                x={(gap.from + gap.to) / 2}
              />
            )}
            <Scatter
              data={dots}
              fill={DOT_FILL}
              isAnimationActive={animate}
              stroke={DOT_EDGE}
              strokeWidth={DOT_EDGE_W}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">
          {`n ${formatInt(dots.length)} oportunidades do mês, metade em até ${formatDays(middle)}`}
        </span>
        {gap === null ? null : (
          <span className="tabular-nums">
            {`nenhuma reunião de ${formatInt(gap.from)} a ${formatDays(gap.to)}: ${gapReason}`}
          </span>
        )}
        <span className="tabular-nums">
          {`a mais lenta, ${slowest.client}, levou ${formatDays(slowest.days)}`}
        </span>
      </div>
    </figure>
  );
}
