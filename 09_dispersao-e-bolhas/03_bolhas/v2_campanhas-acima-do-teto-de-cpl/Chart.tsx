import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ReferenceLine,
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
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, metaQualificacao, tetoCpl, type Campaign } from './data';

/**
 * Bolhas com teto e meta: cada círculo é uma campanha pelo CPL no eixo horizontal e pela taxa de
 * qualificação no vertical, e a área codifica o investimento. As campanhas que passam do teto de
 * CPL acendem e ganham nome direto; as demais ficam em neutro. A pergunta que o desenho responde
 * não é quantas passaram, é quanto dinheiro elas carregam, e por isso o investimento somado das que
 * passaram vai escrito no rodapé.
 */
export interface CampaignCeilingBubblesProps {
  readonly data?: readonly Campaign[];
  /** Teto de CPL do plano de mídia, em reais por lead. */
  readonly teto?: number;
  /** Meta de qualificação do plano de mídia, em fração de 0 a 1. */
  readonly meta?: number;
  readonly height?: number;
  readonly className?: string;
}

/** Margem direita larga porque o rótulo da meta vive nela, fora das marcas (ANO-3, REC-4). */
const MARGIN = { top: 24, right: 72, bottom: 8, left: 8 } as const;
const DOMAIN_CPL: readonly [number, number] = [0, 200];
const TICKS_CPL = [0, 50, 100, 150, 200] as const;
const DOMAIN_TAXA: readonly [number, number] = [0, 0.6];
const TICKS_TAXA = [0, 0.15, 0.3, 0.45, 0.6] as const;
const Y_AXIS_WIDTH = 68;
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
/**
 * Degraus intermediários da régua de tamanho. O último degrau NÃO é constante: é o maior
 * investimento do recorte, montado em `legendValues`, porque régua que para antes do dado deixa a
 * maior bolha da tela sem referência (ROT-5b).
 */
const LEGEND_REFERENCES = [5_000, 20_000] as const;
const LABEL_SIZE = 11;
/** Largura por caractere superestimada de propósito: errar sobrando não quebra nada (GEO-8). */
const LABEL_CHAR_WIDTH = 6.4;
const LABEL_PAD = 3;
/** Respiro entre a borda da bolha e o começo do rótulo. */
const LABEL_GAP = 7;
/**
 * A cor da bolha é cheia, sem `fillOpacity`. A especificação do catálogo pede opacidade para deixar
 * ver a pilha, e a ACE-5 cobra que a cor COMPOSTA siga acima de 3:1 nos dois temas: medido aqui,
 * `--chart-1` a 0,55 cai para 2,43:1 no tema claro, o mesmo número que a emenda registra para
 * `09/04`. A saída que o contrato oferece é contorno na cor da superfície, que separa vizinhas sem
 * tocar no contraste do preenchimento (COR-5, TOK-4, TOK-6).
 */
const DESTAQUE = 'var(--chart-1)';
/**
 * O neutro das bolhas de contexto. A 17.2 indica `--line-strong` como neutro de dado, mas só com o
 * valor escrito na marca ou junto dela, que é a isenção da WCAG 1.4.11; com 21 bolhas sem valor
 * escrito a isenção não existe, e `--line-strong` mede 1,79:1 no escuro e 1,83:1 no claro.
 */
const NEUTRO = 'var(--text-muted)';

type Anchor = 'start' | 'middle' | 'end';

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

interface Bubble extends Campaign {
  readonly acimaDoTeto: boolean;
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

function overlaps(a: Box, b: Box, pad: number): boolean {
  return a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;
}

/**
 * Camada de rótulo das campanhas acima do teto, desenhada por último para ficar por cima da nuvem
 * (REC-13). Vive dentro do `ScatterChart` porque só ali os hooks de escala respondem, e a
 * anticolisão precisa dos pixels de todas as bolhas ao mesmo tempo: o `content` do `LabelList`
 * recebe um rótulo por vez e não sabe onde os vizinhos caíram.
 *
 * O deslocamento das candidatas depende do RAIO de cada bolha, e não de um número fixo: com área
 * variável, um respiro constante que serve para a bolha de R$ 6 mil entra por dentro da de R$ 96 mil
 * e joga o texto sobre a cor da marca, onde `--text-primary` não passa o piso de 4,5:1.
 */
function CeilingLabelLayer({
  bubbles,
  labeled,
  maxInvestimento,
  destaqueId,
}: {
  readonly bubbles: readonly Bubble[];
  readonly labeled: readonly Bubble[];
  readonly maxInvestimento: number;
  readonly destaqueId: string;
}) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;

  const marks: Box[] = [];
  for (const bubble of bubbles) {
    const cx = xScale(bubble.cpl);
    const cy = yScale(bubble.taxaQualificacao);
    if (cx === undefined || cy === undefined) continue;
    const raio = raioPorArea(bubble.investimento, maxInvestimento);
    marks.push({ left: cx - raio, top: cy - raio, right: cx + raio, bottom: cy + raio });
  }

  const placed: { readonly bubble: Bubble; readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number }[] = [];
  for (const bubble of labeled) {
    const cx = xScale(bubble.cpl);
    const cy = yScale(bubble.taxaQualificacao);
    if (cx === undefined || cy === undefined) continue;
    const raio = raioPorArea(bubble.investimento, maxInvestimento);
    const width = bubble.name.length * LABEL_CHAR_WIDTH;
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
      /** O rótulo pode invadir a margem direita e a superior, que estão reservadas para ele. */
      const foraDoPlano =
        box.left < plotArea.x + 1 ||
        box.right > plotArea.x + plotArea.width + MARGIN.right - 12 ||
        box.top < plotArea.y - MARGIN.top + 6 ||
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
    placed.push({ bubble, box: melhor.box, anchor: melhor.anchor, x: melhor.x, y: melhor.y });
  }

  return (
    <g>
      {placed.map((item) => (
        <text
          fill="var(--text-primary)"
          fontSize={LABEL_SIZE}
          fontWeight={item.bubble.id === destaqueId ? 700 : 600}
          key={item.bubble.id}
          style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
          textAnchor={item.anchor}
          x={item.x}
          y={item.y}
        >
          {item.bubble.name}
        </text>
      ))}
    </g>
  );
}

export default function CampaignCeilingBubbles({
  data = defaultData,
  teto = tetoCpl,
  meta = metaQualificacao,
  height,
  className,
}: CampaignCeilingBubblesProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte com CPL, qualificação e investimento registrados.</span>
      </div>
    );
  }

  // Maiores primeiro dentro de cada grupo: o Recharts pinta na ordem de entrada, então as pequenas
  // nascem por cima das grandes (REC-13). Os grupos entram neutro antes de destaque, pelo mesmo motivo.
  const bubbles: readonly Bubble[] = [...data]
    .sort((a, b) => b.investimento - a.investimento)
    .map((row) => ({ ...row, acimaDoTeto: row.cpl > teto }));
  const neutras = bubbles.filter((bubble) => !bubble.acimaDoTeto);
  const acima = bubbles.filter((bubble) => bubble.acimaDoTeto);

  const investimentos = bubbles.map((bubble) => bubble.investimento);
  const maxInvestimento = Math.max(...investimentos);
  const totalInvestimento = investimentos.reduce((soma, valor) => soma + valor, 0);
  const investimentoAcima = acima.reduce((soma, bubble) => soma + bubble.investimento, 0);
  /** O rótulo em peso 700 é um só, o de maior CPL, pelo teto de dois elementos da TIP-3. */
  const pior = acima.reduce<Bubble | null>((atual, bubble) => (atual === null || bubble.cpl > atual.cpl ? bubble : atual), null);
  const destaqueId = pior === null ? '' : pior.id;
  const legendRows = legendValues(maxInvestimento);
  /** A caixa de todos os círculos da régua é a do maior deles, que é o máximo observado. */
  const maiorLegendaRaio = raioPorArea(maxInvestimento, maxInvestimento);

  /** As mesmas chamadas alimentam a frase acessível e o corpo, para as duas lerem igual (DAD-9). */
  const tetoEscrito = formatCurrencyAxis(teto);
  const metaEscrita = formatPercent(meta, 0);
  const acimaEscrito = formatCurrencyCompact(investimentoAcima);
  const totalEscrito = formatCurrencyCompact(totalInvestimento);
  const quantasAcima = formatInt(acima.length);
  const quantas = formatInt(bubbles.length);

  const summary =
    `Gráfico de bolhas com ${quantas} campanhas, CPL no eixo horizontal, qualificação no vertical e ` +
    `investimento na área. ${quantasAcima} passam do teto de ${tetoEscrito} de CPL e carregam ` +
    `${acimaEscrito} dos ${totalEscrito} investidos; a meta é ${metaEscrita}.`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as Bubble | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'cpl', name: 'CPL', value: formatCurrencyAxis(row.cpl) },
      { dataKey: 'taxaQualificacao', name: 'Qualificação', value: formatPercent(row.taxaQualificacao) },
      { dataKey: 'investimento', name: 'Investimento', value: formatCurrencyCompact(row.investimento) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {`${quantasAcima} de ${quantas} campanhas passam do teto de ${tetoEscrito} de CPL`}
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
              label={{ angle: -90, dx: -4, fill: 'var(--text-muted)', fontSize: 11, position: 'insideLeft', style: { textAnchor: 'middle' }, value: 'Taxa de qualificação' }}
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickMargin={8}
              ticks={[...TICKS_TAXA]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis dataKey="investimento" domain={[0, maxInvestimento]} name="Investimento" range={[AREA_MIN, AREA_MAX]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={{ fill: 'var(--text-muted)', fontSize: LABEL_SIZE, position: 'top', value: `teto ${tetoEscrito}` }}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              x={teto}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={{ fill: 'var(--text-muted)', fontSize: LABEL_SIZE, position: 'right', value: `meta ${metaEscrita}` }}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              y={meta}
            />
            <Scatter data={[...neutras]} fill={NEUTRO} isAnimationActive={animate} name="Dentro do teto" stroke="var(--surface-raised)" strokeWidth={1} />
            <Scatter data={[...acima]} fill={DESTAQUE} isAnimationActive={animate} name="Acima do teto" stroke="var(--surface-raised)" strokeWidth={1} />
            <CeilingLabelLayer bubbles={bubbles} destaqueId={destaqueId} labeled={acima} maxInvestimento={maxInvestimento} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="mt-2 flex shrink-0 items-center gap-6 text-[0.6875rem] text-text-muted">
        <span>Investimento</span>
        {legendRows.map((value) => {
          const raio = raioPorArea(value, maxInvestimento);
          const box = Math.ceil(2 * maiorLegendaRaio);
          return (
            <span className="flex items-end gap-2.5" key={value}>
              <svg height={box} width={box}>
                <circle cx={box / 2} cy={box - raio} fill={NEUTRO} r={raio} stroke="var(--surface-raised)" strokeWidth={1} />
              </svg>
              <span className="kpi-number">{formatCurrencyCompact(value)}</span>
            </span>
          );
        })}
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`acima do teto: ${acimaEscrito} dos ${totalEscrito}`}
      </p>
    </div>
  );
}
