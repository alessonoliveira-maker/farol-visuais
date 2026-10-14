import { Filter } from 'lucide-react';
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
import { AXIS_PROPS, CURSOR_COLOR, seriesColor, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadOrigin, type OriginShape } from './data';

/**
 * Dispersão de três origens no mesmo plano, cada uma com a própria envoltória: o ponto diz onde cada
 * lead caiu e o polígono diz onde a origem mora. A envoltória existe porque nuvem sobre nuvem vira
 * mancha: com o contorno, a comparação passa a ser entre territórios e não entre pontos soltos.
 */
export interface OriginTerritoryScatterProps {
  readonly data?: readonly LeadOrigin[];
  readonly height?: number;
  readonly className?: string;
}

interface PlotPoint {
  readonly id: string;
  readonly origem: string;
  readonly rotulo: string;
  readonly minutosAteContato: number;
  readonly interacoes: number;
}

interface Grupo {
  readonly origem: string;
  readonly rotulo: string;
  readonly forma: OriginShape;
  readonly cor: string;
  readonly pontos: readonly PlotPoint[];
  readonly medianaMinutos: number | null;
  readonly parte: number;
}

const MARGIN = { top: 10, right: 18, bottom: 8, left: 8 } as const;
const DOMAIN_X: readonly [number, number] = [0, 200];
const TICKS_X = [0, 50, 100, 150, 200] as const;
const DOMAIN_Y: readonly [number, number] = [0, 12];
const TICKS_Y = [0, 3, 6, 9, 12] as const;
const Y_AXIS_WIDTH = 40;
/** Raio de 3,2 px, fixado nas duas pontas do `ZAxis` para o tamanho do ponto não codificar nada. */
const POINT_RADIUS = 3.2;
const Z_RANGE: readonly [number, number] = [Math.PI * POINT_RADIUS * POINT_RADIUS, Math.PI * POINT_RADIUS * POINT_RADIUS];
/** O recorte da envoltória: o miolo da nuvem, sem as duas caudas de 5%. */
const HULL_LOW = 0.05;
const HULL_HIGH = 0.95;
/** Teto de 0,15 para o preenchimento: acima disso três polígonos sobrepostos viram lama. */
const HULL_FILL_OPACITY = 0.15;
const HULL_STROKE_WIDTH = 1.5;
/** O revestimento na cor do cartão é o que separa dois contornos que se cruzam (TOK-4). */
const HULL_UNDER_WIDTH = 4;

interface Pt {
  readonly x: number;
  readonly y: number;
}

/**
 * Percentil por interpolação linear. Devolve `null` para lista vazia, nunca `0`: percentil de nada
 * não é o menor valor possível, é ausência, e um `0` aqui desenharia envoltória colada na origem
 * dos eixos sem ninguém notar (EST-1b).
 */
function percentile(values: readonly number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const posicao = (sorted.length - 1) * p;
  const baixo = sorted[Math.floor(posicao)];
  const alto = sorted[Math.ceil(posicao)];
  if (baixo === undefined || alto === undefined) return null;
  return baixo + (alto - baixo) * (posicao - Math.floor(posicao));
}

function cross(o: Pt, a: Pt, b: Pt): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/**
 * Casco convexo por varredura monótona, calculado em pixels e não em unidades de dado: os dois eixos
 * têm grandezas diferentes, então "o ponto mais externo" só existe depois da projeção na tela.
 */
function convexHull(pontos: readonly Pt[]): readonly Pt[] {
  if (pontos.length < 3) return pontos;
  const ordenados = [...pontos].sort((a, b) => a.x - b.x || a.y - b.y);
  const meia = (sequencia: readonly Pt[]): Pt[] => {
    const saida: Pt[] = [];
    for (const ponto of sequencia) {
      for (;;) {
        if (saida.length < 2) break;
        const penultimo = saida[saida.length - 2];
        const ultimo = saida[saida.length - 1];
        if (penultimo === undefined || ultimo === undefined) break;
        if (cross(penultimo, ultimo, ponto) > 0) break;
        saida.pop();
      }
      saida.push(ponto);
    }
    return saida;
  };
  const baixo = meia(ordenados);
  const alto = meia([...ordenados].reverse());
  return [...baixo.slice(0, -1), ...alto.slice(0, -1)];
}

/** Percentual inteiro de composição pelo maior resto, para os três somarem 100 (NUM-2). */
function partesInteiras(valores: readonly number[]): readonly number[] {
  const total = valores.reduce((soma, valor) => soma + valor, 0);
  if (total <= 0) return valores.map(() => 0);
  const brutos = valores.map((valor) => (valor / total) * 100);
  const pisos = brutos.map((bruto) => Math.floor(bruto));
  let sobra = 100 - pisos.reduce((soma, piso) => soma + piso, 0);
  const ordem = brutos
    .map((bruto, indice) => ({ indice, resto: bruto - Math.floor(bruto) }))
    .sort((a, b) => b.resto - a.resto);
  const saida = [...pisos];
  for (const item of ordem) {
    if (sobra <= 0) break;
    saida[item.indice] = (saida[item.indice] ?? 0) + 1;
    sobra -= 1;
  }
  return saida;
}

/**
 * Camada das envoltórias, desenhada antes dos pontos para ficar por baixo deles, e com os grupos em
 * ordem de tamanho decrescente, para o território maior não cobrir o menor (REC-13).
 */
function HullLayer({ grupos }: { readonly grupos: readonly Grupo[] }) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;

  const cascos = grupos.map((grupo) => {
    const minutos = grupo.pontos.map((ponto) => ponto.minutosAteContato);
    const interacoes = grupo.pontos.map((ponto) => ponto.interacoes);
    const xBaixo = percentile(minutos, HULL_LOW);
    const xAlto = percentile(minutos, HULL_HIGH);
    const yBaixo = percentile(interacoes, HULL_LOW);
    const yAlto = percentile(interacoes, HULL_HIGH);
    if (xBaixo === null || xAlto === null || yBaixo === null || yAlto === null) return null;
    const miolo: Pt[] = [];
    for (const ponto of grupo.pontos) {
      if (ponto.minutosAteContato < xBaixo || ponto.minutosAteContato > xAlto) continue;
      if (ponto.interacoes < yBaixo || ponto.interacoes > yAlto) continue;
      const px = xScale(ponto.minutosAteContato);
      const py = yScale(ponto.interacoes);
      if (px === undefined || py === undefined) continue;
      miolo.push({ x: px, y: py });
    }
    const casco = convexHull(miolo);
    if (casco.length < 3) return null;
    const caminho = `${casco.map((ponto, indice) => `${indice === 0 ? 'M' : 'L'}${String(ponto.x)},${String(ponto.y)}`).join(' ')} Z`;
    return { origem: grupo.origem, cor: grupo.cor, caminho };
  });

  return (
    <g>
      {cascos.map((casco) =>
        casco === null ? null : (
          <g key={`casco-${casco.origem}`}>
            <path d={casco.caminho} fill="none" stroke="var(--surface-raised)" strokeWidth={HULL_UNDER_WIDTH} />
            <path d={casco.caminho} fill={casco.cor} fillOpacity={HULL_FILL_OPACITY} stroke={casco.cor} strokeWidth={HULL_STROKE_WIDTH} />
          </g>
        ),
      )}
    </g>
  );
}

export default function OriginTerritoryScatter({ data = defaultData, height, className }: OriginTerritoryScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const preparados = data.map((origem) => ({
    origem,
    pontos: origem.leads
      .filter((lead): lead is { id: string; minutosAteContato: number; interacoes: number } => lead.minutosAteContato !== null)
      .map((lead) => ({
        id: lead.id,
        origem: origem.origem,
        rotulo: origem.rotulo,
        minutosAteContato: lead.minutosAteContato,
        interacoes: lead.interacoes,
      })),
  }));
  const exibidos = preparados.reduce((soma, item) => soma + item.pontos.length, 0);
  const totalLeads = data.reduce((soma, origem) => soma + origem.leads.length, 0);
  const missingCount = totalLeads - exibidos;

  if (exibidos === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte com minutos até o contato registrados.</span>
      </div>
    );
  }

  const partes = partesInteiras(preparados.map((item) => item.pontos.length));
  const grupos: Grupo[] = preparados.map((item, indice) => ({
    origem: item.origem.origem,
    rotulo: item.origem.rotulo,
    forma: item.origem.forma,
    cor: seriesColor(item.origem.slot - 1),
    pontos: item.pontos,
    medianaMinutos: percentile(
      item.pontos.map((ponto) => ponto.minutosAteContato),
      0.5,
    ),
    parte: partes[indice] ?? 0,
  }));
  /** A ordem de desenho é por tamanho, do maior para o menor; a legenda segue a mesma ordem. */
  const porTamanho = [...grupos].sort((a, b) => b.pontos.length - a.pontos.length);

  const medianasTexto = porTamanho
    .map((grupo) => `${grupo.rotulo} ${grupo.medianaMinutos === null ? '' : `${formatInt(grupo.medianaMinutos)} min`}`)
    .join(', ');
  /** Curta de propósito: a ACE-1 dá 250 caracteres, e a frase cresce com o número de origens. */
  const summary =
    `Gráfico de dispersão com ${formatInt(exibidos)} leads de ${formatInt(grupos.length)} origens, minutos até o contato contra ` +
    `interações, com a envoltória de cada origem. Mediana até o contato: ${medianasTexto}. ` +
    (missingCount > 0 ? `${formatInt(missingCount)} sem contato registrado não aparecem.` : '');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as PlotPoint | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'minutosAteContato', name: 'Até o contato', value: `${formatInt(point.minutosAteContato)} min` },
      { dataKey: 'interacoes', name: 'Interações', value: formatInt(point.interacoes) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.rotulo} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul aria-hidden className="mb-1 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 text-xs tabular-nums text-text-secondary">
        {porTamanho.map((grupo) => (
          <li className="flex items-center gap-2" key={`legenda-${grupo.origem}`}>
            <svg className="shrink-0" height={10} viewBox="0 0 10 10" width={10}>
              {grupo.forma === 'circle' ? <circle cx={5} cy={5} fill={grupo.cor} r={4} /> : null}
              {grupo.forma === 'square' ? <rect fill={grupo.cor} height={8} width={8} x={1} y={1} /> : null}
              {grupo.forma === 'triangle' ? <polygon fill={grupo.cor} points="5,1 9.5,9 0.5,9" /> : null}
            </svg>
            <span>{grupo.rotulo}</span>
            <span className="text-text-muted">{`${formatInt(grupo.pontos.length)} leads, ${formatPercent(grupo.parte / 100, 0)}`}</span>
          </li>
        ))}
      </ul>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-muted">
        {`Mediana de minutos até o contato: ${medianasTexto}`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              dataKey="minutosAteContato"
              domain={[...DOMAIN_X]}
              name="Até o contato"
              tickFormatter={(value: number) => `${formatInt(value)} min`}
              tickMargin={8}
              ticks={[...TICKS_X]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              dataKey="interacoes"
              domain={[...DOMAIN_Y]}
              name="Interações"
              tickFormatter={formatInt}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <HullLayer grupos={porTamanho} />
            {porTamanho.map((grupo) => (
              <Scatter
                data={[...grupo.pontos]}
                fill={grupo.cor}
                isAnimationActive={animate}
                key={`pontos-${grupo.origem}`}
                name={grupo.rotulo}
                shape={grupo.forma}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {missingCount > 0 ? (
        <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
          {`Envoltória sobre o miolo de cada origem, sem as caudas de 5%; ${formatInt(missingCount)} sem contato registrado não aparecem`}
        </p>
      ) : null}
    </div>
  );
}
