import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  XAxis,
  YAxis,
  ZAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, stages as defaultStages, type LossCell } from './data';

/**
 * Dot plot em matriz categórica: cada linha é um motivo de perda, cada coluna é uma etapa do funil,
 * e a área da bolha é a contagem de oportunidades perdidas naquele cruzamento. A matriz é esparsa,
 * e é isso que justifica a bolha em vez do mapa de calor: 29 dos 84 cruzamentos são zero, e no mapa
 * de calor eles pesariam como célula pintada.
 *
 * Os totais marginais vivem numa camada própria dentro do gráfico, porque só ali as escalas dos
 * eixos respondem: o total de cada motivo sai alinhado à linha dele e o total de cada etapa sai
 * alinhado à coluna. Sem os dois, a matriz mostra onde concentra e esconde quanto concentra.
 */
export interface LossMatrixProps {
  readonly data?: readonly LossCell[];
  /** As etapas na ordem do funil; ordena as colunas e nunca sai do dado. */
  readonly stages?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

/** A margem superior guarda a tinta da linha de totais por etapa, que nasce acima do plano. */
const MARGIN = { top: 26, right: 48, bottom: 8, left: 8 } as const;
const Y_AXIS_WIDTH = 180;
/**
 * Piso e teto do RAIO em px; a área sai deles, porque é a área que codifica o valor. A GEO-3 pede
 * `Math.sqrt(rMin ** 2 + (rMax ** 2 − rMin ** 2) * v / topo)`, e a conta em área é a mesma
 * identidade: com `area = π·rMin² + t·(π·rMax² − π·rMin²)`, `sqrt(area / π)` devolve aquela raiz.
 *
 * O teto é 12 px porque o passo entre linhas é de cerca de 30 px com 14 motivos: 24 px de diâmetro
 * deixam 6 px de respiro entre duas bolhas máximas vizinhas, e um teto maior colaria as linhas.
 */
const RAIO_MIN = 2.4;
const RAIO_MAX = 12;
const AREA_MIN = Math.PI * RAIO_MIN * RAIO_MIN;
const AREA_MAX = Math.PI * RAIO_MAX * RAIO_MAX;
/** Degraus redondos da régua de tamanho; o último é o máximo observado (ROT-5b). */
const LEGEND_REFERENCES = [5, 12] as const;
const TOTALS_FONT = 11;
/** Quanto a linha de totais por etapa sobe acima da borda de cima do plano. */
const TOTALS_LIFT = 9;
/** Respiro entre a borda direita do plano e o começo da coluna de totais por motivo. */
const TOTALS_GAP = 10;

interface LossPoint extends LossCell {
  /** O total do motivo viaja com a célula para a dica dizer a parte e o todo na mesma linha. */
  readonly reasonTotal: number;
  /** O máximo da matriz também viaja: o `shape` do Scatter recebe o ponto, nunca o escopo de fora. */
  readonly maxOfMatrix: number;
}

interface CategoryTotal {
  readonly label: string;
  readonly total: number;
}

/** As referências menores que o máximo, mais o próprio máximo: a régua sempre alcança a maior bolha. */
function legendValues(maxValor: number): readonly number[] {
  return [...LEGEND_REFERENCES.filter((value) => value < maxValor), maxValor];
}

/** Raio em px de um círculo cuja ÁREA segue a escala linear do `ZAxis`, com domínio a partir de 0. */
function raioPorArea(valor: number, maxValor: number): number {
  if (valor <= 0) return 0;
  const area = AREA_MIN + (valor / maxValor) * (AREA_MAX - AREA_MIN);
  return Math.sqrt(area / Math.PI);
}

/**
 * A bolha de um cruzamento, com o zero medido fora do desenho.
 *
 * O `shape` é obrigatório aqui, e não é preciosismo: o `range` do `ZAxis` tem piso de área, então
 * sem forma própria uma contagem zero sairia do mesmo tamanho de uma contagem 1 e as duas leriam
 * igual. O zero continua no dado, continua contado no rodapé e só não recebe tinta (EST-3, DAD-2).
 */
function LossDot({ cx, cy, payload }: { readonly cx?: number; readonly cy?: number; readonly payload?: LossPoint }) {
  if (cx === undefined || cy === undefined || payload === undefined) return null;
  const raio = raioPorArea(payload.count, payload.maxOfMatrix);
  if (raio <= 0) return null;
  return <circle cx={cx} cy={cy} fill="var(--chart-1)" r={raio} stroke="var(--surface-raised)" strokeWidth={1} />;
}

/**
 * Os totais marginais, numa camada dentro do `ScatterChart` porque só ali a área de plotagem e as
 * escalas dos eixos respondem. Alinhar por conta própria seria refazer a mesma conta de escala duas
 * vezes, e qualquer divergência apareceria como número deslocado da linha que ele soma.
 */
function MarginalTotals({
  stageTotals,
  reasonTotals,
}: {
  readonly stageTotals: readonly CategoryTotal[];
  readonly reasonTotals: readonly CategoryTotal[];
}) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;
  const baseline = plotArea.y - TOTALS_LIFT;
  const colunaDireita = plotArea.x + plotArea.width + TOTALS_GAP;
  return (
    <g>
      {/* As duas palavras nomeiam as duas bandas de total, cada uma na cabeça da sua (GEO-13). */}
      <text fill="var(--text-muted)" fontSize={TOTALS_FONT} textAnchor="end" x={plotArea.x - TOTALS_GAP} y={baseline}>
        total
      </text>
      <text fill="var(--text-muted)" fontSize={TOTALS_FONT} textAnchor="start" x={colunaDireita} y={baseline}>
        total
      </text>
      {/* `position: 'middle'` não é zelo: sem ele a escala devolve a BORDA da faixa da categoria, e
          cada total nasceu meio passo antes da coluna e da linha que ele soma, medido no render. */}
      {stageTotals.map((item) => {
        const x = xScale(item.label, { position: 'middle' });
        if (x === undefined) return null;
        return (
          <text className="font-display" fill="var(--text-secondary)" fontSize={TOTALS_FONT} fontWeight={600} key={item.label} textAnchor="middle" x={x} y={baseline}>
            {formatInt(item.total)}
          </text>
        );
      })}
      {reasonTotals.map((item) => {
        const y = yScale(item.label, { position: 'middle' });
        if (y === undefined) return null;
        return (
          <text
            className="font-display"
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize={TOTALS_FONT}
            fontWeight={600}
            key={item.label}
            textAnchor="start"
            x={colunaDireita}
            y={y}
          >
            {formatInt(item.total)}
          </text>
        );
      })}
    </g>
  );
}

export default function LossMatrix({ data = defaultData, stages = defaultStages, height, className }: LossMatrixProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const cells = data.filter((row) => row.count > 0);

  if (cells.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        {/* Recorte sem linha e recorte com todas as linhas em zero são dois estados diferentes. */}
        <span>
          {data.length === 0
            ? 'Nenhuma perda neste recorte: não há cruzamento de motivo e etapa para desenhar.'
            : `Nenhuma perda neste recorte: os ${formatInt(data.length)} cruzamentos medidos deram zero.`}
        </span>
      </div>
    );
  }

  const maxCount = Math.max(...cells.map((row) => row.count));
  const zeroCells = data.length - cells.length;

  /** As etapas presentes no dado, na ordem do funil que o dado declara. */
  const stageOrder = stages.filter((stage) => data.some((row) => row.stage === stage));
  const stageTotals: readonly CategoryTotal[] = stageOrder.map((stage) => ({
    label: stage,
    total: data.filter((row) => row.stage === stage).reduce((soma, row) => soma + row.count, 0),
  }));

  const reasonNames: string[] = [];
  for (const row of data) {
    if (!reasonNames.includes(row.reason)) reasonNames.push(row.reason);
  }
  /**
   * Motivos do MENOR total para o maior, e a ordem parece invertida de propósito: o eixo Y de
   * categoria do Recharts desenha o primeiro item do array embaixo, então crescente no array é
   * decrescente na tela, com o maior motivo no topo do cartão (REC-3).
   */
  const reasonTotals: readonly CategoryTotal[] = reasonNames
    .map((reason) => ({
      label: reason,
      total: data.filter((row) => row.reason === reason).reduce((soma, row) => soma + row.count, 0),
    }))
    .sort((a, b) => a.total - b.total);

  /**
   * A matriz inteira alimenta o gráfico, zeros incluídos, e isso é o que garante as 6 colunas e as
   * 14 linhas na ordem certa: o domínio de um eixo de categoria sai do dado, não das marcas
   * desenhadas, então filtrar o zero aqui apagaria colunas de motivos esparsos.
   */
  const rows: readonly LossPoint[] = reasonTotals.flatMap((item) =>
    stageOrder
      .map((stage) => data.find((row) => row.reason === item.label && row.stage === stage))
      .filter((row): row is LossCell => row !== undefined)
      .map((row) => ({ ...row, maxOfMatrix: maxCount, reasonTotal: item.total })),
  );

  const grandTotal = data.reduce((soma, row) => soma + row.count, 0);
  const topReason = reasonTotals[reasonTotals.length - 1];
  const topStage = [...stageTotals].sort((a, b) => b.total - a.total)[0];
  const legendRows = legendValues(maxCount);
  /** A caixa de todos os círculos da régua é a do maior deles, que é o máximo observado. */
  const boxLegenda = Math.ceil(2 * raioPorArea(maxCount, maxCount));

  /** As mesmas chamadas alimentam a frase acessível e o corpo, para as duas lerem igual (DAD-9). */
  const grandEscrito = formatInt(grandTotal);
  const zerosEscrito = formatInt(zeroCells);
  const cruzamentosEscrito = formatInt(data.length);
  const motivosEscrito = formatInt(reasonTotals.length);
  const etapasEscrito = formatInt(stageOrder.length);
  const topReasonTotal = topReason === undefined ? '' : formatInt(topReason.total);
  const topStageTotal = topStage === undefined ? '' : formatInt(topStage.total);
  const topReasonNome = topReason === undefined ? 'sem motivo medido' : topReason.label;
  const topStageNome = topStage === undefined ? 'sem etapa medida' : topStage.label.toLowerCase();

  const summary =
    `Matriz de bolhas com ${grandEscrito} perdas em ${motivosEscrito} motivos e ${etapasEscrito} etapas do funil. ` +
    `${topReasonNome} lidera com ${topReasonTotal}, a ${topStageNome} concentra ${topStageTotal}, e ` +
    `${zerosEscrito} dos ${cruzamentosEscrito} cruzamentos deram zero.`;


  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as LossPoint | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'count', name: 'Perdas', value: formatInt(row.count) },
      { dataKey: 'reasonTotal', name: 'Do motivo', value: formatRateWithVolume(row.count, row.reasonTotal) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={`${row.reason}, ${row.stage}`} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        <span className="font-semibold text-text-primary">{topReasonNome}</span>
        {` lidera com ${topReasonTotal} perdas, e a ${topStageNome} concentra ${topStageTotal} das ${grandEscrito}`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            {/* Os dois eixos são CATEGORIA, então vale a EIX-3 como está escrita e não a exceção da
                EIX-3b, reescopada em 2026-09-28 para os dois eixos quantitativos lidos por posição.
                A grade horizontal separa as linhas de motivo, que são 14; a coluna de etapa já se
                lê pelo tique do eixo. */}
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis {...AXIS_PROPS} allowDuplicatedCategory={false} axisLine={false} dataKey="stage" interval={0} name="Etapa" tickMargin={8} type="category" />
            <YAxis {...AXIS_PROPS} allowDuplicatedCategory={false} axisLine={false} dataKey="reason" interval={0} name="Motivo" tickMargin={8} type="category" width={Y_AXIS_WIDTH} />
            {/* O mesmo domínio em toda a matriz: é ele que torna duas bolhas de linhas diferentes
                comparáveis pela área. */}
            <ZAxis dataKey="count" domain={[0, maxCount]} name="Perdas" range={[AREA_MIN, AREA_MAX]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={[...rows]} isAnimationActive={animate} name="Perdas" shape={<LossDot />} />
            <MarginalTotals reasonTotals={reasonTotals} stageTotals={stageTotals} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="mt-2 flex shrink-0 items-center gap-6 text-[0.6875rem] text-text-muted">
        <span>Perdas</span>
        {legendRows.map((value) => (
          <span className="flex items-end gap-2.5" key={value}>
            <svg height={boxLegenda} width={boxLegenda}>
              <circle
                cx={boxLegenda / 2}
                cy={boxLegenda - raioPorArea(value, maxCount)}
                fill="var(--chart-1)"
                r={raioPorArea(value, maxCount)}
                stroke="var(--surface-raised)"
                strokeWidth={1}
              />
            </svg>
            <span className="kpi-number">{formatInt(value)}</span>
          </span>
        ))}
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`${zerosEscrito} dos ${cruzamentosEscrito} cruzamentos medidos deram zero perda, sem bolha`}
      </p>
    </div>
  );
}
