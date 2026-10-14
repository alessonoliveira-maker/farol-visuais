import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  XAxis,
  YAxis,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyAxis, formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, SELECTED, type CplBucket, type SelectedCampaign, WITHOUT_CPL } from './data';

/**
 * Barcode: um traço por valor de custo por lead, em meio pixel, com a escala do eixo sendo a única
 * coisa que posiciona a marca. É a forma mais crua de distribuição que existe, e a única que cabe na
 * altura de uma faixa de KPI.
 *
 * O limite dele é a coincidência. Enquanto poucos casos dividem o mesmo valor, o traço de altura
 * uniforme diz tudo: onde existe caso e onde está o vão. Quando o valor foi lançado arredondado, a
 * pilha de casos no mesmo lugar deixa de aparecer, e é aí que a altura de cada traço precisa passar a
 * contar quantos. Este cartão está desse lado do limite, e o rodapé diz por quê.
 */
export interface CplBarcodeProps {
  readonly data?: readonly CplBucket[];
  readonly selected?: SelectedCampaign;
  readonly withoutCpl?: number;
  readonly height?: number;
  readonly className?: string;
}

/** A margem direita guarda a metade do último tique do eixo X, que nasce centrado na borda do plano. */
const MARGIN = { top: 16, right: 20, bottom: 0, left: 4 } as const;
/** Faixa do eixo Y de contagem, estreita porque o tique é inteiro curto. */
const Y_AXIS_W = 32;
/** Altura da faixa do eixo X pela EIX-6b: 8 px de `tickMargin` mais a tinta de uma linha de 11 px. */
const X_AXIS_H = 24;
const TICK_MARGIN = 8;
/**
 * Tapete do ramo saturado: uma faixa de barcode de altura uniforme logo abaixo da linha do zero. A
 * altura por contagem apaga o valor de uma campanha só (menos de 1 px), e o tapete devolve a presença
 * de todo valor e os vãos da cauda sem inventar piso na contagem.
 */
const TAPE_GAP = 3;
const TAPE_H = 8;
/** O traço da selecionada passa do tapete por este tanto, para se separar pela altura e não pela cor. */
const TAPE_SELECTED_EXTRA = 4;
const TAPE_BAND = TAPE_GAP + TAPE_H + TAPE_SELECTED_EXTRA;
/** Passo do tique de valor, em reais. */
const CPL_STEP = 100;
/** Passo do tique de contagem. Fecha de 3 a 5 linhas de grade horizontais no plano (EIX-4). */
const COUNT_STEP = 30;
/**
 * Quantas campanhas no mesmo valor o barcode de altura uniforme ainda deixa ler. Acima disso os
 * traços coincidentes viram um traço só e a contagem desaparece, então a altura passa a contar.
 */
const COINCIDENCE_LIMIT = 8;
/** Altura do traço uniforme, em pixel, no barcode abaixo do limite de coincidência. */
const TICK_H = 20;
const MARK = 'var(--chart-1)';
const SELECTED_MARK = 'var(--chart-2)';
const SURFACE = 'var(--surface-raised)';
const LABEL_COLOR = 'var(--text-secondary)';
const LABEL_SIZE = 11;
const HALO_W = 4;
const MARK_W = 1;
const SELECTED_W = 1.5;

/** O maior valor da lista, ou `null` quando ela está vazia. Nunca zero e nunca infinito. */
function highest(values: readonly number[]): number | null {
  const sorted = [...values].sort((a, b) => a - b);
  const last = sorted[sorted.length - 1];
  return last === undefined ? null : last;
}

/** O menor valor da lista, ou `null` quando ela está vazia. */
function lowest(values: readonly number[]): number | null {
  const sorted = [...values].sort((a, b) => a - b);
  const first = sorted[0];
  return first === undefined ? null : first;
}

/**
 * O passo do lançamento, medido como a menor distância entre dois valores vizinhos, ou `null` em lista
 * de um caso só. Medido e não declarado: escrever dez reais à mão faria a frase mentir no primeiro
 * trimestre em que o time passasse a lançar de cinco em cinco.
 */
function step(buckets: readonly CplBucket[]): number | null {
  const ordered = [...buckets].map((bucket) => bucket.cpl).sort((a, b) => a - b);
  let smallest: number | null = null;
  for (let index = 1; index < ordered.length; index += 1) {
    const before = ordered[index - 1];
    const after = ordered[index];
    if (before === undefined || after === undefined) continue;
    const gap = after - before;
    if (smallest === null || gap < smallest) smallest = gap;
  }
  return smallest;
}

/**
 * A camada do barcode. Ela mora dentro do gráfico porque o meio pixel só existe depois que a escala
 * existe: arredondar para o pixel inteiro e somar meio pixel é o que faz o traço de 1 px sair sólido
 * em vez de dois pixels lavados, e para isso é preciso saber onde o eixo colocou o valor.
 */
function BarcodeLayer({
  buckets,
  saturated,
  selected,
}: {
  readonly buckets: readonly CplBucket[];
  readonly saturated: boolean;
  readonly selected: SelectedCampaign;
}) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;

  const baseline = yScale(0);
  if (baseline === undefined) return null;
  const selectedX = xScale(selected.cpl);
  const label = `${selected.name}, ${formatCurrency(selected.cpl, 0)}`;

  return (
    <g shapeRendering="crispEdges">
      {buckets.map((bucket) => {
        const raw = xScale(bucket.cpl);
        if (raw === undefined) return null;
        /* Meio pixel sobre o pixel inteiro: é o que mantém o traço de 1 px sólido em qualquer largura
           de cartão, e o `crispEdges` do grupo impede o navegador de suavizá-lo de volta. */
        const x = Math.round(raw) + 0.5;
        const top = saturated ? yScale(bucket.campaigns) : baseline - TICK_H;
        if (top === undefined) return null;
        return (
          <g key={`valor-${String(bucket.cpl)}`}>
            <line stroke={MARK} strokeWidth={MARK_W} x1={x} x2={x} y1={baseline} y2={top} />
            {!saturated ? null : (
              <line
                stroke={MARK}
                strokeWidth={MARK_W}
                x1={x}
                x2={x}
                y1={baseline + TAPE_GAP}
                y2={baseline + TAPE_GAP + TAPE_H}
              />
            )}
          </g>
        );
      })}
      {selectedX === undefined ? null : (
        <g>
          {/* Cor não separa as duas marcas sozinha: `--chart-2` contra `--chart-1` mede 1,14:1 no
              escuro e 1,05:1 no claro. No ramo uniforme a altura não conta nada, então a selecionada
              sobe até o topo do plano. No saturado a altura é a contagem e não pode carregar a
              seleção: ela vira o traço mais longo do tapete, e no plano de contagem fica só uma guia
              tracejada, que lê como referência e não como marca (TOK-9, ACE-2). */}
          {saturated ? (
            <>
              <line
                stroke={SELECTED_MARK}
                strokeWidth={SELECTED_W}
                x1={Math.round(selectedX) + 0.5}
                x2={Math.round(selectedX) + 0.5}
                y1={baseline + TAPE_GAP}
                y2={baseline + TAPE_BAND}
              />
              <line
                stroke={LABEL_COLOR}
                strokeDasharray="3 3"
                strokeWidth={MARK_W}
                x1={Math.round(selectedX) + 0.5}
                x2={Math.round(selectedX) + 0.5}
                y1={baseline}
                y2={plotArea.y}
              />
            </>
          ) : (
            <line
              stroke={SELECTED_MARK}
              strokeWidth={SELECTED_W}
              x1={Math.round(selectedX) + 0.5}
              x2={Math.round(selectedX) + 0.5}
              y1={baseline}
              y2={plotArea.y}
            />
          )}
          {/* Halo na cor da superfície porque o rótulo cruza a linha de grade do valor redondo mais
              próximo (ROT-7); sem ele a grade passa por dentro das letras. */}
          <text
            className="tabular-nums"
            fill={LABEL_COLOR}
            fontSize={LABEL_SIZE}
            shapeRendering="auto"
            style={{ paintOrder: 'stroke', stroke: SURFACE, strokeWidth: HALO_W }}
            textAnchor="end"
            x={Math.round(selectedX) - LABEL_SIZE / 2}
            y={plotArea.y + LABEL_SIZE}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

export default function CplBarcode({
  data = defaultData,
  selected = SELECTED,
  withoutCpl = WITHOUT_CPL,
  height,
  className,
}: CplBarcodeProps) {
  const style = height === undefined ? undefined : { height };

  const total = data.reduce((sum, bucket) => sum + bucket.campaigns, 0);
  const counts = data.map((bucket) => bucket.campaigns);
  const worst = highest(counts);
  const cheapest = lowest(data.map((bucket) => bucket.cpl));
  const priciest = highest(data.map((bucket) => bucket.cpl));
  const launchStep = step(data);
  const below = data
    .filter((bucket) => bucket.cpl < selected.cpl)
    .reduce((sum, bucket) => sum + bucket.campaigns, 0);

  if (data.length === 0 || worst === null || cheapest === null || priciest === null || total === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 flex-col items-start justify-center gap-2', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 text-text-muted" />
        <p className="text-xs text-text-muted">
          O recorte não tem campanha com custo por lead calculável, então não há faixa de valores a
          desenhar.
        </p>
      </div>
    );
  }

  const saturated = worst > COINCIDENCE_LIMIT;
  const countTop = Math.ceil(worst / COUNT_STEP) * COUNT_STEP;
  const cplTop = Math.ceil(priciest / CPL_STEP) * CPL_STEP;
  const countTicks: number[] = [];
  for (let value = 0; value <= countTop; value += COUNT_STEP) countTicks.push(value);
  const cplTicks: number[] = [];
  for (let value = 0; value <= cplTop; value += CPL_STEP) cplTicks.push(value);

  const summary =
    `Barcode do custo por lead de ${formatInt(total)} campanhas em ${formatInt(data.length)} valores` +
    (launchStep === null ? '' : ` múltiplos de ${formatCurrency(launchStep, 0)}`) +
    `, de ${formatCurrency(cheapest, 0)} a ${formatCurrency(priciest, 0)}. ` +
    (saturated
      ? `Até ${formatInt(worst)} campanhas dividem o mesmo valor, então a altura de cada traço conta quantas. `
      : `Nenhum valor passa de ${formatInt(worst)} campanhas, então o traço tem altura uniforme. `) +
    `${formatInt(withoutCpl)} campanhas sem CPL ficaram fora.`;

  const axisRows = data.map((bucket) => ({ cpl: bucket.cpl, campaigns: bucket.campaigns }));

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      {/* O nome do eixo Y vive aqui, e não girado na lateral: texto vertical em 11 px é o primeiro a
          ser ignorado, e a TIP-5 não admite rótulo rotacionado. */}
      <span aria-hidden className="shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        campanhas lançadas em cada valor
      </span>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} data={axisRows} margin={MARGIN}>
            {/* Grade nos dois sentidos pela EIX-3b: os dois eixos são quantitativos e o traço é lido
                por posição em X, que é o valor, e pela ponta em Y, que é a contagem. A grade aqui é a
                régua do desenho, e não enfeite. */}
            <CartesianGrid stroke={GRID_COLOR} />
            <XAxis
              {...AXIS_PROPS}
              /* Depois do espalhamento: o `AXIS_PROPS` traz a linha de eixo ligada e com grade no
                 fundo ela é uma régua a mais (EIX-5, REC-30). */
              axisLine={false}
              dataKey="cpl"
              domain={[0, cplTop]}
              height={X_AXIS_H + (saturated ? TAPE_BAND : 0)}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickMargin={TICK_MARGIN + (saturated ? TAPE_BAND : 0)}
              ticks={cplTicks}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              axisLine={false}
              dataKey="campaigns"
              domain={[0, countTop]}
              /* Sem `interval={0}` o eixo descarta tique em plano baixo e a grade vai junto: no
                 primeiro render os passos de 30 viraram passos de 60 e sobraram 3 linhas (REC-29). */
              interval={0}
              tickFormatter={(value: number) => formatInt(value)}
              tickMargin={TICK_MARGIN}
              ticks={countTicks}
              type="number"
              width={Y_AXIS_W}
            />
            <BarcodeLayer buckets={data} saturated={saturated} selected={selected} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">
          {`n ${formatInt(total)} campanhas do trimestre em ${formatInt(data.length)} valores distintos, de ${formatCurrency(cheapest, 0)} a ${formatCurrency(priciest, 0)}`}
        </span>
        {!saturated ? null : (
          <span className="tabular-nums">
            {`até ${formatInt(worst)} campanhas no mesmo valor, acima do limite de ${formatInt(COINCIDENCE_LIMIT)}: a altura do traço passou a contar; a faixa curta abaixo do zero marca todo valor com caso`}
          </span>
        )}
        <span className="flex items-center gap-1 tabular-nums">
          <span className="h-3 w-0.5 shrink-0" style={{ backgroundColor: SELECTED_MARK }} />
          <span>
            {`${selected.name}, ${formatCurrency(selected.cpl, 0)} por lead, acima de ${formatRateWithVolume(below, total)}`}
          </span>
        </span>
        {withoutCpl <= 0 ? null : (
          <span className="tabular-nums">
            {`fora do eixo, sem nenhum lead: ${formatInt(withoutCpl)} campanhas`}
          </span>
        )}
      </div>
    </figure>
  );
}
