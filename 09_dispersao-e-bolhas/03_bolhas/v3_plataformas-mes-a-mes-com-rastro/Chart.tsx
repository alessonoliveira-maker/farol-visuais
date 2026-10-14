import { Filter } from 'lucide-react';
import { useState } from 'react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, trailId as defaultTrailId, type PlatformMonth } from './data';

/**
 * Bolhas que se movem no tempo: um mês por vez, três plataformas, CPL no eixo horizontal, taxa de
 * qualificação no vertical e investimento na área. Trocar o mês troca os dados, e a bolha de cada
 * plataforma continua sendo a mesma porque o casamento é pelo `id`, nunca pela posição no array: com
 * o array reordenado por investimento a cada mês, casar por índice trocaria as cores de lugar.
 * O rastro dos meses anteriores da plataforma selecionada fica em pontos pequenos, e o mês exibido
 * vai escrito no plano, porque quem lê o preview parado não vê transição nenhuma.
 */
export interface PlatformMonthBubblesProps {
  readonly data?: readonly PlatformMonth[];
  /** A plataforma cujo rastro é desenhado; no Farol vem da seleção da página. */
  readonly trailId?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 12, right: 24, bottom: 8, left: 8 } as const;
const DOMAIN_CPL: readonly [number, number] = [0, 250];
const TICKS_CPL = [0, 50, 100, 150, 200, 250] as const;
const DOMAIN_TAXA: readonly [number, number] = [0, 0.6];
const TICKS_TAXA = [0, 0.15, 0.3, 0.45, 0.6] as const;
const Y_AXIS_WIDTH = 48;
/**
 * Piso e teto do RAIO em px; a área sai deles, porque é a área que codifica o valor. A GEO-3 pede
 * `Math.sqrt(rMin ** 2 + (rMax ** 2 − rMin ** 2) * v / topo)`, e a conta em área é a mesma
 * identidade: com `area = π·rMin² + t·(π·rMax² − π·rMin²)`, `sqrt(area / π)` devolve exatamente
 * aquela raiz. O que a armadilha proíbe é a meia correção, a raiz aplicada por dentro do piso.
 */
const RAIO_MIN = 2.2;
const RAIO_MAX = 17;
const AREA_MIN = Math.PI * RAIO_MIN * RAIO_MIN;
const AREA_MAX = Math.PI * RAIO_MAX * RAIO_MAX;
/** Degraus intermediários da régua; o último é o máximo observado no ano inteiro (ROT-5b). */
const LEGEND_REFERENCES = [25_000, 75_000] as const;
/** Raio do ponto de rastro, fixo: o rastro mostra caminho, não magnitude. */
const RASTRO_RAIO = 3;
const LABEL_SIZE = 11;
/** Largura por caractere superestimada de propósito: errar sobrando não quebra nada (GEO-8). */
const LABEL_CHAR_WIDTH = 6.4;
const LABEL_PAD = 3;
/** Respiro entre a borda da bolha e o começo do rótulo. */
const LABEL_GAP = 7;
/**
 * Slot categórico fixo para cor, na ordem 1, 3, 6, 5, 2, 4 da COR-8: `--chart-2` e `--chart-4`
 * repetem o hex de `--warning` e de `--positive`, então vão por último e aqui não são usados.
 * Medido contra o cartão: `--chart-1` 9,50:1 no escuro e 6,00:1 no claro, `--chart-3` 6,47:1 e
 * 6,18:1, `--chart-6` 7,39:1 e 5,39:1, todos acima do piso de 3:1 da ACE-5 sem nenhuma opacidade.
 */
const SLOT_COLOR: Readonly<Record<number, string>> = {
  1: 'var(--chart-1)',
  2: 'var(--chart-2)',
  3: 'var(--chart-3)',
  4: 'var(--chart-4)',
  5: 'var(--chart-5)',
  6: 'var(--chart-6)',
};

type Anchor = 'start' | 'middle' | 'end';

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/** As referências menores que o máximo, mais o próprio máximo: a régua sempre alcança a maior bolha. */
function legendValues(maxValor: number): readonly number[] {
  return [...LEGEND_REFERENCES.filter((value) => value < maxValor), maxValor];
}

/** Raio em px de um círculo cuja ÁREA segue a escala linear do `ZAxis`, com domínio a partir de 0. */
function raioPorArea(valor: number, maxValor: number): number {
  const area = AREA_MIN + (valor / maxValor) * (AREA_MAX - AREA_MIN);
  return Math.sqrt(area / Math.PI);
}

function corDoSlot(slot: number): string {
  return SLOT_COLOR[slot] ?? 'var(--chart-1)';
}

function overlaps(a: Box, b: Box, pad: number): boolean {
  return a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;
}

/**
 * Rastro dos meses anteriores da plataforma selecionada, desenhado ANTES das bolhas do mês para
 * ficar por baixo delas (REC-13). Vive dentro do `ScatterChart` porque só ali as escalas respondem.
 */
function TrailLayer({ trail, color }: { readonly trail: readonly PlatformMonth[]; readonly color: string }) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!xScale || !yScale) return null;

  return (
    <g>
      {trail.map((row) => {
        const cx = xScale(row.cpl);
        const cy = yScale(row.taxaQualificacao);
        if (cx === undefined || cy === undefined) return null;
        return <circle cx={cx} cy={cy} fill={color} key={row.mes} r={RASTRO_RAIO} stroke="var(--surface-raised)" strokeWidth={1} />;
      })}
    </g>
  );
}

/**
 * Nome de cada plataforma junto da sua bolha, mais o mês exibido escrito no canto vazio do plano.
 * São três marcas, então rótulo direto dispensa legenda categórica (ROT-1, ROT-4), e o rótulo leva
 * halo porque em algum recorte plausível ele cai sobre a grade ou sobre outra bolha (ROT-7).
 *
 * O deslocamento das candidatas depende do RAIO de cada bolha, e não de um número fixo: com área
 * variável, um respiro constante que serve para a bolha de R$ 18 mil entra por dentro da de R$ 128
 * mil e joga o texto sobre a cor da marca, onde `--text-primary` não passa o piso de 4,5:1.
 */
function PlatformLabelLayer({
  rows,
  maxInvestimento,
  mesEscrito,
}: {
  readonly rows: readonly PlatformMonth[];
  readonly maxInvestimento: number;
  readonly mesEscrito: string;
}) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;

  const marks: Box[] = [];
  for (const row of rows) {
    const cx = xScale(row.cpl);
    const cy = yScale(row.taxaQualificacao);
    if (cx === undefined || cy === undefined) continue;
    const raio = raioPorArea(row.investimento, maxInvestimento);
    marks.push({ left: cx - raio, top: cy - raio, right: cx + raio, bottom: cy + raio });
  }

  const placed: { readonly row: PlatformMonth; readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number }[] = [];
  for (const row of rows) {
    const cx = xScale(row.cpl);
    const cy = yScale(row.taxaQualificacao);
    if (cx === undefined || cy === undefined) continue;
    const raio = raioPorArea(row.investimento, maxInvestimento);
    const width = row.name.length * LABEL_CHAR_WIDTH;
    const lado = raio + LABEL_GAP;
    const candidates: readonly { readonly dx: number; readonly dy: number; readonly anchor: Anchor }[] = [
      { dx: lado, dy: 4, anchor: 'start' },
      { dx: -lado, dy: 4, anchor: 'end' },
      { dx: 0, dy: -lado - 4, anchor: 'middle' },
      { dx: 0, dy: lado + LABEL_SIZE, anchor: 'middle' },
      { dx: lado * 0.8, dy: -lado * 0.8, anchor: 'start' },
      { dx: -lado * 0.8, dy: -lado * 0.8, anchor: 'end' },
      { dx: lado * 0.8, dy: lado * 0.8 + LABEL_SIZE, anchor: 'start' },
      { dx: -lado * 0.8, dy: lado * 0.8 + LABEL_SIZE, anchor: 'end' },
    ];
    let melhor: { readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number; readonly faltas: number } | null = null;
    for (const candidate of candidates) {
      const x = cx + candidate.dx;
      const y = cy + candidate.dy;
      const left = candidate.anchor === 'start' ? x : candidate.anchor === 'end' ? x - width : x - width / 2;
      const box: Box = { left, top: y - LABEL_SIZE + 2, right: left + width, bottom: y + 2 };
      const foraDoPlano =
        box.left < plotArea.x + 1 ||
        box.right > plotArea.x + plotArea.width + MARGIN.right - 8 ||
        box.top < plotArea.y ||
        box.bottom > plotArea.y + plotArea.height;
      const faltas =
        (foraDoPlano ? 100 : 0) +
        marks.filter((mark) => overlaps(box, mark, 1)).length +
        placed.filter((outro) => overlaps(box, outro.box, LABEL_PAD)).length;
      if (faltas === 0) {
        melhor = { box, anchor: candidate.anchor, x, y, faltas };
        break;
      }
      if (melhor === null || faltas < melhor.faltas) melhor = { box, anchor: candidate.anchor, x, y, faltas };
    }
    if (melhor === null) continue;
    placed.push({ row, box: melhor.box, anchor: melhor.anchor, x: melhor.x, y: melhor.y });
  }

  return (
    <g>
      {/* O canto de CPL baixo com qualificação alta fica vazio nos doze meses, e é ali que o mês cabe. */}
      <text
        className="font-display"
        fill="var(--text-muted)"
        fontSize={LABEL_SIZE}
        style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
        textAnchor="start"
        x={plotArea.x + 4}
        y={plotArea.y + LABEL_SIZE}
      >
        {mesEscrito}
      </text>
      {placed.map((item) => (
        <text
          fill="var(--text-primary)"
          fontSize={LABEL_SIZE}
          fontWeight={600}
          key={item.row.id}
          style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
          textAnchor={item.anchor}
          x={item.x}
          y={item.y}
        >
          {item.row.name}
        </text>
      ))}
    </g>
  );
}

export default function PlatformMonthBubbles({
  data = defaultData,
  trailId = defaultTrailId,
  height,
  className,
}: PlatformMonthBubblesProps) {
  const animate = useAnimateOnce();
  const meses = [...new Set(data.map((row) => row.mes))].sort((a, b) => a.localeCompare(b));
  const ultimoMes = meses[meses.length - 1] ?? '';
  const [mes, setMes] = useState(ultimoMes);
  const style = height === undefined ? undefined : { height };

  const rowsDoMes = data.filter((row) => row.mes === mes);
  if (data.length === 0 || rowsDoMes.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma neste recorte com CPL, qualificação e investimento registrados no mês.</span>
      </div>
    );
  }

  // Maiores primeiro: o Recharts pinta na ordem de entrada, então as pequenas nascem por cima (REC-13).
  const rows = [...rowsDoMes].sort((a, b) => b.investimento - a.investimento);
  /**
   * O topo da área é o máximo do ANO, não o do mês: com o domínio do `ZAxis` preso ao mês, a mesma
   * bolha mudaria de tamanho só porque o vizinho encolheu, e a comparação entre meses morreria.
   */
  const maxInvestimento = Math.max(...data.map((row) => row.investimento));
  const investimentoDoMes = rows.reduce((soma, row) => soma + row.investimento, 0);
  const cplValues = rows.map((row) => row.cpl);
  const minCpl = Math.min(...cplValues);
  const maxCpl = Math.max(...cplValues);
  // O casamento é pelo id, nunca pela posição: o array do mês vem reordenado por investimento.
  const trail = data.filter((row) => row.id === trailId && row.mes < mes).sort((a, b) => a.mes.localeCompare(b.mes));
  const trailRow = rows.find((row) => row.id === trailId);
  const trailName = trailRow === undefined ? '' : trailRow.name;
  const legendRows = legendValues(maxInvestimento);
  /** A caixa de todos os círculos da régua é a do maior deles, que é o máximo observado. */
  const maiorLegendaRaio = raioPorArea(maxInvestimento, maxInvestimento);

  /** As mesmas chamadas alimentam a frase acessível e o corpo, para as duas lerem igual (DAD-9). */
  const mesEscrito = formatMonthShort(mes);
  const quantas = formatInt(rows.length);
  const cplMenor = formatCurrencyAxis(minCpl);
  const cplMaior = formatCurrencyAxis(maxCpl);
  const somaEscrita = formatCurrencyCompact(investimentoDoMes);
  const quantosNoRastro = formatInt(trail.length);

  const summary =
    `Gráfico de bolhas com ${quantas} plataformas de mídia em ${mesEscrito}, CPL no eixo horizontal, ` +
    `qualificação no vertical e investimento na área. CPL de ${cplMenor} a ${cplMaior} e ` +
    `${somaEscrita} investidos; rastro dos ${quantosNoRastro} meses anteriores de ${trailName}.`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as PlatformMonth | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'cpl', name: 'CPL', value: formatCurrencyAxis(row.cpl) },
      { dataKey: 'taxaQualificacao', name: 'Qualificação', value: formatPercent(row.taxaQualificacao) },
      { dataKey: 'investimento', name: 'Investimento', value: formatCurrencyCompact(row.investimento) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={`${row.name}, ${formatMonthShort(row.mes)}`} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {`Em ${mesEscrito} o CPL vai de ${cplMenor} a ${cplMaior}, com ${somaEscrita} investidos`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="cpl"
              domain={[...DOMAIN_CPL]}
              name="CPL"
              tickFormatter={formatCurrencyAxis}
              tickMargin={8}
              ticks={[...TICKS_CPL]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="taxaQualificacao"
              domain={[...DOMAIN_TAXA]}
              name="Qualificação"
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickMargin={8}
              ticks={[...TICKS_TAXA]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis dataKey="investimento" domain={[0, maxInvestimento]} name="Investimento" range={[AREA_MIN, AREA_MAX]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <TrailLayer color={corDoSlot(trailRow === undefined ? 1 : trailRow.slot)} trail={trail} />
            {rows.map((row) => (
              <Scatter data={[row]} fill={corDoSlot(row.slot)} isAnimationActive={animate} key={row.id} name={row.name} stroke="var(--surface-raised)" strokeWidth={1} />
            ))}
            <PlatformLabelLayer maxInvestimento={maxInvestimento} mesEscrito={mesEscrito} rows={rows} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {/*
        A cor do NÃO selecionado vive no contêiner, e não em cada botão, de propósito: o preview
        serializa só o que difere do pai, e com `text-text-muted` botão a botão o selecionado saía
        SEM cor nenhuma no SVG e lia mais apagado que os outros, invertendo o destaque.
      */}
      <div className="mt-2 flex shrink-0 items-center gap-1 text-text-muted">
        {meses.map((item) => (
          <button
            aria-pressed={item === mes}
            className={cn(
              'rounded px-2 py-1 text-[0.6875rem] tabular-nums',
              // O mês exibido muda fundo, cor E peso: no tema escuro o poço fica a 1,3:1 do cartão
              // e sozinho ele quase não se vê, então a cor não é o único canal (ACE-2).
              item === mes && 'bg-surface-sunken font-semibold text-text-primary',
            )}
            key={item}
            onClick={() => {
              setMes(item);
            }}
            type="button"
          >
            {formatMonthShort(item)}
          </button>
        ))}
      </div>
      <div aria-hidden className="mt-2 flex shrink-0 items-center gap-6 text-[0.6875rem] text-text-muted">
        <span>Investimento do mês</span>
        {legendRows.map((value) => {
          const raio = raioPorArea(value, maxInvestimento);
          const box = Math.ceil(2 * maiorLegendaRaio);
          return (
            <span className="flex items-end gap-2.5" key={value}>
              <svg height={box} width={box}>
                <circle cx={box / 2} cy={box - raio} fill="var(--text-muted)" r={raio} stroke="var(--surface-raised)" strokeWidth={1} />
              </svg>
              <span className="kpi-number">{formatCurrencyCompact(value)}</span>
            </span>
          );
        })}
        <span className="flex items-end gap-2.5">
          {/* A amostra do rastro leva a cor da plataforma selecionada, senão ela ensina a ler outra marca. */}
          <svg height={Math.ceil(2 * maiorLegendaRaio)} width={2 * RASTRO_RAIO + 2}>
            <circle
              cx={RASTRO_RAIO + 1}
              cy={Math.ceil(2 * maiorLegendaRaio) - RASTRO_RAIO}
              fill={corDoSlot(trailRow === undefined ? 1 : trailRow.slot)}
              r={RASTRO_RAIO}
            />
          </svg>
          <span>{`rastro de ${trailName}`}</span>
        </span>
      </div>
    </div>
  );
}
