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
import { data as defaultData, windowDays, windowHours, type AttendanceCell } from './data';

/**
 * Bolhas em grade categórica com uma janela marcada: os dois eixos são categorias, hora cheia e dia
 * útil, a área da bolha é o número de agendas marcadas, e uma faixa retangular nomeia a janela de
 * melhor comparecimento. A faixa sozinha quase não se vê, porque nenhum neutro do Farol alcança
 * 3:1 contra o cartão, então ela nunca é o único canal: as bolhas de dentro trocam de cor, o texto
 * da faixa diz o que ela marca e a taxa com o volume vai escrita acima do plano.
 */
export interface AttendanceWindowGridProps {
  readonly data?: readonly AttendanceCell[];
  /** Dias da janela marcada; a ordem aqui não importa, quem manda é a ordem do eixo. */
  readonly highlightDays?: readonly string[];
  /** Horas cheias da janela marcada. */
  readonly highlightHours?: readonly number[];
  readonly height?: number;
  readonly className?: string;
}

/** A margem de cima guarda a tinta do texto da faixa, que mora acima da borda de cima do plano. */
const MARGIN = { top: 20, right: 24, bottom: 8, left: 8 } as const;
const Y_AXIS_WIDTH = 76;
/**
 * Piso e teto do RAIO em px; a área sai deles, porque é a área que codifica o valor. A GEO-3 pede
 * `Math.sqrt(rMin ** 2 + (rMax ** 2 − rMin ** 2) * v / topo)`, e a conta em área é a mesma
 * identidade: com `area = π·rMin² + t·(π·rMax² − π·rMin²)`, `sqrt(area / π)` devolve aquela raiz.
 */
const RAIO_MIN = 2.6;
const RAIO_MAX = 15;
const AREA_MIN = Math.PI * RAIO_MIN * RAIO_MIN;
const AREA_MAX = Math.PI * RAIO_MAX * RAIO_MAX;
/** Degraus redondos da régua de tamanho; o último é o máximo observado (ROT-5b). */
const LEGEND_REFERENCES = [5, 12] as const;
/** Raio da amostra de cor da legenda de estado: ela nomeia o grupo, não mede volume. */
const SAMPLE_RAIO = 6;
const ANNOTATION_FONT = 11;
/** Quanto a linha de base do texto da faixa sobe acima da borda de cima do plano. */
const ANNOTATION_LIFT = 7;
/** O destaque de quem está na janela e o neutro de quem está fora, os dois em cor cheia. */
const DESTAQUE = 'var(--chart-1)';
/**
 * O neutro das bolhas de contexto é `--text-muted`, e não o `--line-strong` que a 17.2 indica como
 * neutro de dado: a isenção de contraste daquele token vale só com o valor escrito na marca ou
 * junto dela, e aqui as 46 bolhas de fora não têm valor escrito. Medido contra o cartão,
 * `--text-muted` dá 5,21:1 no escuro e 5,37:1 no claro, contra 1,79:1 e 1,83:1 do `--line-strong`.
 */
const NEUTRO = 'var(--text-muted)';

interface AttendancePoint extends AttendanceCell {
  /** Se a célula cai dentro da janela marcada; é o que decide a cor da bolha. */
  readonly inWindow: boolean;
  /** O máximo da grade viaja com a célula: o `shape` do Scatter recebe o ponto, nunca o escopo. */
  readonly maxOfGrid: number;
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

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}h`;
}

/**
 * A faixa que marca a janela, desenhada a partir das BORDAS das células e não do retângulo que a
 * `ReferenceArea` entrega.
 *
 * A troca foi medida nesta peça: com `x1`, `x2`, `y1` e `y2` nas quatro categorias das pontas, o
 * retângulo que chegava ao `shape` não coincidia com as células da janela, e a faixa saiu cobrindo
 * só a linha do meio das três do eixo de dia. As escalas do eixo respondem a pergunta certa de uma
 * vez: `position: 'start'` dá a borda de entrada de uma categoria e `position: 'end'` a de saída,
 * então a faixa nasce colada nas bordas das células, sem meio passo somado à mão.
 */
function WindowBand({
  fromHour,
  toHour,
  fromDay,
  toDay,
}: {
  readonly fromHour: number;
  readonly toHour: number;
  readonly fromDay: string;
  readonly toDay: string;
}) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;
  /**
   * As DUAS bordas de CADA categoria da ponta, e o menor e o maior das quatro por eixo.
   *
   * Pedir só `start` da primeira e `end` da última parece bastar e não basta: as duas pontas vêm na
   * ordem do EIXO, o eixo de dia desenha o primeiro item do array embaixo, e com isso o `start` da
   * ponta de baixo caiu depois do `end` da ponta de cima. A faixa saiu cobrindo uma linha só, a do
   * meio das três, medida no render. Com as quatro bordas na mão o extremo é o extremo em qualquer
   * sentido de eixo.
   */
  const xa = xScale(fromHour, { position: 'start' });
  const xb = xScale(fromHour, { position: 'end' });
  const xc = xScale(toHour, { position: 'start' });
  const xd = xScale(toHour, { position: 'end' });
  const ya = yScale(fromDay, { position: 'start' });
  const yb = yScale(fromDay, { position: 'end' });
  const yc = yScale(toDay, { position: 'start' });
  const yd = yScale(toDay, { position: 'end' });
  if (xa === undefined || xb === undefined || xc === undefined || xd === undefined) return null;
  if (ya === undefined || yb === undefined || yc === undefined || yd === undefined) return null;
  const left = Math.min(xa, xb, xc, xd);
  const right = Math.max(xa, xb, xc, xd);
  const top = Math.min(ya, yb, yc, yd);
  const bottom = Math.max(ya, yb, yc, yd);
  return (
    <g>
      <rect fill="var(--surface-sunken)" height={bottom - top} rx={4} stroke="var(--line-strong)" strokeWidth={1} width={right - left} x={left} y={top} />
      {/* ANO-4: faixa sempre com texto dizendo o que ela marca. O texto mora na margem de cima,
          alinhado ao centro das colunas da janela, e não encostado na faixa, porque toda borda da
          faixa cai no MEIO do vão entre duas linhas: medido aqui, sobram cerca de 15 px entre a
          bolha da linha vizinha e a borda, e uma frase de 11 px ocuparia todos eles, com a tinta
          encostando na marca (ROT-9). */}
      <text fill="var(--text-muted)" fontSize={ANNOTATION_FONT} textAnchor="middle" x={(left + right) / 2} y={plotArea.y - ANNOTATION_LIFT}>
        janela de melhor comparecimento
      </text>
    </g>
  );
}

/** A bolha de um cruzamento, acesa dentro da janela e neutra fora dela. */
function AttendanceDot({ cx, cy, payload }: { readonly cx?: number; readonly cy?: number; readonly payload?: AttendancePoint }) {
  if (cx === undefined || cy === undefined || payload === undefined) return null;
  const raio = raioPorArea(payload.scheduled, payload.maxOfGrid);
  if (raio <= 0) return null;
  return (
    <circle cx={cx} cy={cy} fill={payload.inWindow ? DESTAQUE : NEUTRO} r={raio} stroke="var(--surface-raised)" strokeWidth={1} />
  );
}

/** A ordem das categorias de um eixo é a ordem de primeira ocorrência no array, não a alfabética. */
function categoryOrder<T>(rows: readonly AttendanceCell[], pick: (row: AttendanceCell) => T): readonly T[] {
  const seen: T[] = [];
  for (const row of rows) {
    if (!seen.includes(pick(row))) seen.push(pick(row));
  }
  return seen;
}

/** As pontas da janela na ORDEM DO EIXO, mais quantas categorias ela cobre. */
function span<T>(order: readonly T[], selection: readonly T[]): { readonly from: T; readonly to: T; readonly steps: number } | null {
  const indexes = selection.map((value) => order.indexOf(value)).filter((index) => index >= 0);
  if (indexes.length === 0) return null;
  const first = Math.min(...indexes);
  const last = Math.max(...indexes);
  const from = order[first];
  const to = order[last];
  if (from === undefined || to === undefined) return null;
  return { from, to, steps: last - first };
}

export default function AttendanceWindowGrid({
  data = defaultData,
  highlightDays = windowDays,
  highlightHours = windowHours,
  height,
  className,
}: AttendanceWindowGridProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  /** Só estado vazio, máximo e contas usam o filtrado: o zero não vira bolha, o piso de área o faria parecer volume. */
  const cells = data.filter((row) => row.scheduled > 0);
  const zeroCells = data.length - cells.length;
  /** As ordens saem da grade INTEIRA: o domínio categórico nasce da primeira ocorrência na série (EST-3, 14.1). */
  const hourOrder = categoryOrder(data, (row) => row.hour);
  const dayOrder = categoryOrder(data, (row) => row.day);
  const hourSpan = span(hourOrder, highlightHours);
  const daySpan = span(dayOrder, highlightDays);

  if (cells.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        {/* Recorte sem linha e recorte com todas as linhas em zero são dois estados diferentes. */}
        <span>
          {data.length === 0
            ? 'Nenhuma agenda neste recorte: não há cruzamento de dia e hora para desenhar.'
            : `Nenhuma agenda neste recorte: os ${formatInt(data.length)} cruzamentos medidos deram zero.`}
        </span>
      </div>
    );
  }

  const naJanela = cells.filter((row) => highlightDays.includes(row.day) && highlightHours.includes(row.hour));
  const foraDaJanela = cells.filter((row) => !highlightDays.includes(row.day) || !highlightHours.includes(row.hour));
  const marcadasNaJanela = naJanela.reduce((soma, row) => soma + row.scheduled, 0);
  const comparecidasNaJanela = naJanela.reduce((soma, row) => soma + row.attended, 0);
  const marcadasFora = foraDaJanela.reduce((soma, row) => soma + row.scheduled, 0);
  const comparecidasFora = foraDaJanela.reduce((soma, row) => soma + row.attended, 0);
  const maxScheduled = Math.max(...cells.map((row) => row.scheduled));
  /** A grade inteira alimenta a série, na ordem do dado, que é a ordem das categorias nos eixos. */
  const rows: readonly AttendancePoint[] = data.map((row) => ({
    ...row,
    inWindow: highlightDays.includes(row.day) && highlightHours.includes(row.hour),
    maxOfGrid: maxScheduled,
  }));
  const legendRows = legendValues(maxScheduled);
  /** A caixa de todos os círculos da régua é a do maior deles, que é o máximo observado. */
  const maiorLegendaRaio = raioPorArea(maxScheduled, maxScheduled);
  const boxLegenda = Math.ceil(2 * maiorLegendaRaio);

  const primeiraHora = hourSpan === null ? undefined : hourSpan.from;
  const ultimaHora = hourSpan === null ? undefined : hourSpan.to;
  /** As mesmas chamadas alimentam a frase acessível e o corpo, para as duas lerem igual (DAD-9). */
  const taxaJanela = formatRateWithVolume(comparecidasNaJanela, marcadasNaJanela);
  const taxaFora = formatRateWithVolume(comparecidasFora, marcadasFora);
  const totalMarcadas = formatInt(marcadasNaJanela + marcadasFora);
  const abertura = formatHour(hourOrder[0] ?? 0);
  const fechamento = formatHour(hourOrder[hourOrder.length - 1] ?? 0);
  /**
   * O texto nomeia a janela na ordem em que ela é LIDA, de cima para baixo no desenho, e essa
   * ordem é o inverso da ordem do array: o eixo Y de categoria do Recharts põe o primeiro item do
   * array embaixo. Escrever "de quinta a terça", que é o que a ordem do eixo entregaria, diria o
   * contrário do que a faixa mostra.
   */
  const diasDaJanelaLidos = [...dayOrder].reverse().filter((day) => highlightDays.includes(day));
  const primeiroDia = diasDaJanelaLidos[0];
  const ultimoDia = diasDaJanelaLidos[diasDaJanelaLidos.length - 1];
  const janelaEscrita =
    primeiroDia === undefined || ultimoDia === undefined || primeiraHora === undefined || ultimaHora === undefined
      ? 'sem janela declarada'
      : `${primeiroDia.toLowerCase()} a ${ultimoDia.toLowerCase()}, das ${formatHour(primeiraHora)} às ${formatHour(ultimaHora)}`;

  const summary =
    `Gráfico de bolhas em grade com ${totalMarcadas} agendas por dia útil e hora, de ${abertura} a ${fechamento}. ` +
    `Na janela de ${janelaEscrita} o comparecimento é ${taxaJanela}, contra ${taxaFora} fora dela.`;


  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as AttendanceCell | undefined;
    if (!row || row.scheduled <= 0) return null;
    const entries = [
      { dataKey: 'scheduled', name: 'Agendas', value: formatInt(row.scheduled) },
      { dataKey: 'attended', name: 'Comparecimento', value: formatRateWithVolume(row.attended, row.scheduled) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={`${row.day}, ${formatHour(row.hour)}`} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {`Melhor janela: ${janelaEscrita}, com ${taxaJanela} de comparecimento, contra ${taxaFora} fora dela`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            {/* Os dois eixos são CATEGORIA, então vale a EIX-3 como está escrita e não a exceção da
                EIX-3b, que pede os dois sentidos só quando as duas grandezas são quantitativas e
                lidas por posição. A grade horizontal separa as linhas de dia; a coluna de hora já
                se lê pelo tique do eixo. */}
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              allowDuplicatedCategory={false}
              axisLine={false}
              dataKey="hour"
              interval={0}
              name="Hora"
              tick={{ ...AXIS_PROPS.tick, className: 'font-display' }}
              tickFormatter={(value: number) => formatHour(value)}
              tickMargin={8}
              type="category"
            />
            <YAxis {...AXIS_PROPS} allowDuplicatedCategory={false} axisLine={false} dataKey="day" interval={0} name="Dia" tickMargin={8} type="category" width={Y_AXIS_WIDTH} />
            <ZAxis dataKey="scheduled" domain={[0, maxScheduled]} name="Agendas" range={[AREA_MIN, AREA_MAX]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            {/* A faixa vem antes das séries: a ordem de pintura é a ordem dos filhos, e faixa por
                cima apagaria as bolhas que ela existe para destacar (REC-13). */}
            {hourSpan === null || daySpan === null ? null : (
              <WindowBand fromDay={daySpan.from} fromHour={hourSpan.from} toDay={daySpan.to} toHour={hourSpan.to} />
            )}
            {/* Uma série só, com a grade inteira na ordem do dado, e não uma série por grupo. Em
                eixo de categoria o domínio sai da ORDEM DO DADO: separar em duas séries, ou
                reordenar por valor como a REC-13 pede em bolhas soltas, trocaria a ordem das horas
                e dos dias pela ordem dos volumes. E aqui não há nada a reordenar por cima: numa
                grade categórica duas marcas nunca dividem a mesma posição. */}
            <Scatter data={[...rows]} isAnimationActive={animate} name="Agendas" shape={<AttendanceDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="mt-2 flex shrink-0 items-center gap-6 text-[0.6875rem] text-text-muted">
        <span>Agendas</span>
        {legendRows.map((value) => (
          <span className="flex items-end gap-2.5" key={value}>
            <svg height={boxLegenda} width={boxLegenda}>
              <circle
                cx={boxLegenda / 2}
                cy={boxLegenda - raioPorArea(value, maxScheduled)}
                fill={DESTAQUE}
                r={raioPorArea(value, maxScheduled)}
                stroke="var(--surface-raised)"
                strokeWidth={1}
              />
            </svg>
            <span className="kpi-number">{formatInt(value)}</span>
          </span>
        ))}
        {/* A cor não é o único canal (ACE-2): a posição dentro da faixa já separa os dois grupos, e
            estas duas amostras dão o nome de cada um por escrito. */}
        {[
          { color: DESTAQUE, label: 'na janela' },
          { color: NEUTRO, label: 'fora da janela' },
        ].map((item) => (
          <span className="flex items-end gap-2" key={item.label}>
            <svg height={boxLegenda} width={2 * SAMPLE_RAIO + 2}>
              <circle cx={SAMPLE_RAIO + 1} cy={boxLegenda - SAMPLE_RAIO - 1} fill={item.color} r={SAMPLE_RAIO} stroke="var(--surface-raised)" strokeWidth={1} />
            </svg>
            <span>{item.label}</span>
          </span>
        ))}
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`fora da janela: ${taxaFora} de comparecimento`}
        {zeroCells > 0
          ? `. ${formatInt(zeroCells)} ${zeroCells === 1 ? 'cruzamento medido com zero agenda, sem bolha' : 'cruzamentos medidos com zero agenda, sem bolha'}`
          : ''}
      </p>
    </div>
  );
}
