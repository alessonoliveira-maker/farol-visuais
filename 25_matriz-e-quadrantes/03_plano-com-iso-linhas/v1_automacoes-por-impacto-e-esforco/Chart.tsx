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
  ZIndexLayer,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, priorityRatio as defaultPriorityRatio, type AutomationScore } from './data';

/**
 * Plano de impacto contra esforço das automações do backlog, com retas de razão constante que saem
 * da origem: ordena a fila por retorno sobre esforço e deixa em segundo plano a matriz clássica de
 * quatro regiões, para decidir o que entra primeiro.
 */
export interface AutomationIsoRatioProps {
  readonly data?: readonly AutomationScore[];
  /** Razão de impacto por esforço a partir da qual a automação entra primeiro na fila. */
  readonly priorityRatio?: number;
  readonly height?: number;
  readonly className?: string;
}

type Region = 'rapido' | 'aposta' | 'preenchimento' | 'baixo';

interface PlanePoint {
  readonly id: string;
  readonly name: string;
  readonly impacto: number;
  readonly esforco: number;
  readonly ratio: number;
  readonly region: Region;
  readonly priority: boolean;
  /** Lugar entre os itens de mesmas notas, centrado no zero: num par, metade para cada lado. */
  readonly slot: number;
}

interface IsoSegment {
  readonly ratio: number;
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
  readonly exit: 'top' | 'right';
}

/** Topo com os títulos das regiões de cima e, logo acima do plano, a razão na ponta de cada reta. */
const MARGIN = { top: 36, right: 44, bottom: 20, left: 8 } as const;
const SCORE_MIN = 1;
const SCORE_MAX = 5;
/** Meio ponto de folga de cada lado, para a nota 1 e a nota 5 não caírem em cima do contorno. */
const DOMAIN: readonly [number, number] = [SCORE_MIN - 0.5, SCORE_MAX + 0.5];
const TICKS = [1, 2, 3, 4, 5] as const;
/** Razões das retas de fundo, da maior para a menor. */
const ISO_RATIOS = [3, 2, 1, 0.5] as const;
/** Divisória da matriz clássica, entre as notas 3 e 4: nenhuma nota inteira cai em cima dela. */
const REGION_CUT = 3.5;
/** Abaixo da faixa de 48 a 64 da EIX-6, que é de tique de moeda: aqui o tique é um algarismo. */
const Y_AXIS_WIDTH = 28;
const X_AXIS_HEIGHT = 24;
const POINT_RADIUS = 5;
/** Distância entre centros de dois itens de mesmas notas: um diâmetro mais 2 px de vão. */
const DODGE_STEP = 2 * POINT_RADIUS + 2;
const Z_RANGE: readonly [number, number] = [Math.PI * POINT_RADIUS * POINT_RADIUS, Math.PI * POINT_RADIUS * POINT_RADIUS];
const ROW_TITLE = 12;
const TEXT_SIZE = 11;
const LABEL_HEIGHT = 12;
const LABEL_CHAR_WIDTH = 6.2;
const POINT_GAP = 8;
/** Acima das linhas de referência (400) e abaixo dos pontos (600): o halo corta reta, nunca ponto. */
const LABEL_Z = 450;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

const REGION_TITLE: Record<Region, string> = {
  rapido: 'Ganho rápido',
  aposta: 'Grande aposta',
  preenchimento: 'Preenchimento',
  baixo: 'Baixo retorno',
};

function regionOf(impacto: number, esforco: number): Region {
  if (impacto > REGION_CUT) return esforco > REGION_CUT ? 'aposta' : 'rapido';
  return esforco > REGION_CUT ? 'baixo' : 'preenchimento';
}

/** A razão com a letra da unidade: inteira sem casa na ponta da reta, com uma casa no item. */
function ratioText(ratio: number, digits: number): string {
  return `${formatDecimal(ratio, digits)}x`;
}

function isoText(ratio: number): string {
  return ratioText(ratio, Number.isInteger(ratio) ? 0 : 1);
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * Reta impacto = razão × esforço cortada na borda do domínio, em TypeScript: entra pela esquerda ou
 * por baixo e sai por cima ou pela direita. Os dois extremos ficam DENTRO do domínio, porque a
 * ReferenceLine com segment descarta a reta inteira se uma ponta passar da borda (REC-1).
 */
function clipRatioLine(ratio: number): IsoSegment | null {
  const [lo, hi] = DOMAIN;
  if (!(ratio > 0)) return null;
  const x0 = Math.max(lo, lo / ratio);
  const x1 = Math.min(hi, hi / ratio);
  if (x0 >= x1) return null;
  /* A reta de razão 1 sai exatamente pelo canto: o rótulo dela vai para a margem da direita, onde não disputa o canto com o contorno. */
  return { ratio, x0, y0: Math.max(lo, ratio * x0), x1, y1: Math.min(hi, ratio * x1), exit: ratio > 1 ? 'top' : 'right' };
}

function coordinateKey(row: AutomationScore): string {
  return `${String(row.esforco)}|${String(row.impacto)}`;
}

/** Só entra no plano quem tem as duas notas dentro da escala; o lugar de quem divide as notas sai do id. */
function toPoints(rows: readonly AutomationScore[], priorityRatio: number): readonly PlanePoint[] {
  const inScale = (score: number) => score >= SCORE_MIN && score <= SCORE_MAX;
  const valid = rows.filter((row) => inScale(row.impacto) && inScale(row.esforco));
  const groups = new Map<string, readonly string[]>();
  for (const row of valid) {
    const key = coordinateKey(row);
    groups.set(key, [...(groups.get(key) ?? []), row.id].sort());
  }
  return valid.map((row) => {
    const group = groups.get(coordinateKey(row)) ?? [row.id];
    const ratio = row.impacto / row.esforco;
    return {
      id: row.id,
      name: row.name,
      impacto: row.impacto,
      esforco: row.esforco,
      ratio,
      region: regionOf(row.impacto, row.esforco),
      priority: ratio >= priorityRatio,
      slot: group.indexOf(row.id) - (group.length - 1) / 2,
    };
  });
}

/**
 * Deslocamento determinístico de quem divide as mesmas notas: ao longo da reta que liga a origem ao
 * ponto, em pixel. Os dois continuam na mesma razão, que é a leitura oficial do plano.
 */
function dodge(px: number, py: number, ox: number, oy: number, slot: number): readonly [number, number] {
  const dx = px - ox;
  const dy = py - oy;
  const length = Math.hypot(dx, dy);
  if (slot === 0 || length === 0) return [px, py];
  return [px + (dx / length) * slot * DODGE_STEP, py + (dy / length) * slot * DODGE_STEP];
}

interface DodgedDotProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: PlanePoint;
}

/**
 * Ponto do Scatter passado como ELEMENTO, não como função: o Recharts clona o elemento e ele vira
 * componente dentro do gráfico, e só assim pode ler a escala para achar o pixel da origem. A forma
 * própria recebe cx e cy, nunca raio (REC-31), então o raio é a constante do topo.
 */
function DodgedDot({ cx, cy, payload }: DodgedDotProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const ox = xScale?.(0);
  const oy = yScale?.(0);
  if (cx === undefined || cy === undefined || payload === undefined || ox === undefined || oy === undefined) return <g />;
  const [x, y] = dodge(cx, cy, ox, oy, payload.slot);
  return (
    <circle
      cx={x}
      cy={y}
      fill={payload.priority ? 'var(--chart-1)' : 'var(--text-muted)'}
      r={POINT_RADIUS}
      stroke="var(--surface-raised)"
      strokeWidth={1}
    />
  );
}

interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

interface LabelBox extends Rect {
  readonly id: string;
  readonly text: string;
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
}

function inside(rect: Rect, bounds: Rect): boolean {
  return (
    rect.left >= bounds.left &&
    rect.left + rect.width <= bounds.left + bounds.width &&
    rect.top >= bounds.top &&
    rect.top + rect.height <= bounds.top + bounds.height
  );
}

/**
 * Posição dos rótulos calculada aqui, fora do LabelList, que não conhece os vizinhos. Cada nome tenta
 * a direita do ponto, a esquerda, acima e abaixo, sem sair do plano nem tocar outro ponto, outro
 * rótulo ou uma divisória; sem lugar livre, fica à direita, porque rótulo que some deixa item sem nome.
 */
function placeLabels(
  items: readonly { readonly id: string; readonly text: string; readonly px: number; readonly py: number }[],
  marks: readonly (Rect & { readonly id: string })[],
  bounds: Rect,
  fixed: readonly Rect[],
): readonly LabelBox[] {
  const placed: LabelBox[] = [];
  for (const item of [...items].sort((a, b) => a.py - b.py)) {
    const width = item.text.length * LABEL_CHAR_WIDTH;
    const middle = item.py - LABEL_HEIGHT / 2;
    const centered = Math.min(Math.max(item.px - width / 2, bounds.left), bounds.left + bounds.width - width);
    const candidates: readonly Rect[] = [
      { left: item.px + POINT_GAP, top: middle, width, height: LABEL_HEIGHT },
      { left: item.px - POINT_GAP - width, top: middle, width, height: LABEL_HEIGHT },
      { left: centered, top: item.py - POINT_RADIUS - 2 - LABEL_HEIGHT, width, height: LABEL_HEIGHT },
      { left: centered, top: item.py + POINT_RADIUS + 2, width, height: LABEL_HEIGHT },
    ];
    const blockers: readonly Rect[] = [...fixed, ...marks.filter((mark) => mark.id !== item.id), ...placed];
    const chosen = candidates.find((rect) => inside(rect, bounds) && !blockers.some((blocker) => overlaps(rect, blocker))) ?? candidates[0];
    if (chosen) placed.push({ ...chosen, id: item.id, text: item.text });
  }
  return placed;
}

interface PlaneLayerProps {
  readonly points: readonly PlanePoint[];
  readonly isoLines: readonly IsoSegment[];
}

/**
 * Tudo o que não é ponto nem reta, numa camada dentro do ScatterChart (depende de usePlotArea e das
 * escalas): o contorno tracejado, os nomes dos eixos e das regiões nas margens, a razão na ponta de
 * cada reta e o nome dos itens da frente da fila. O `label` nativo da ReferenceLine nasce dentro da
 * área, em cima da nuvem (REC-4), e as regiões ficam fora do plano porque as quatro retas se abrem
 * a partir do canto de baixo e a de razão 1 sai pelo canto de cima: nenhum canto interno fica livre.
 */
function PlaneLayer({ points, isoLines }: PlaneLayerProps) {
  const area = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!area || !xScale || !yScale) return null;
  const ox = xScale(0);
  const oy = yScale(0);
  const cx = xScale(REGION_CUT);
  const cy = yScale(REGION_CUT);
  if (ox === undefined || oy === undefined || cx === undefined || cy === undefined) return null;

  const right = area.x + area.width;
  const bottom = area.y + area.height;
  const rowBottom = bottom + X_AXIS_HEIGHT + 14;
  const positions = points.flatMap((point) => {
    const px = xScale(point.esforco);
    const py = yScale(point.impacto);
    if (px === undefined || py === undefined) return [];
    const [x, y] = dodge(px, py, ox, oy, point.slot);
    return [{ point, x, y }];
  });
  const labels = placeLabels(
    positions
      .filter((position) => position.point.priority)
      .map((position) => ({
        id: position.point.id,
        text: `${position.point.name} · ${ratioText(position.point.ratio, 1)}`,
        px: position.x,
        py: position.y,
      })),
    positions.map((position) => ({
      id: position.point.id,
      left: position.x - POINT_RADIUS - 1,
      top: position.y - POINT_RADIUS - 1,
      width: 2 * POINT_RADIUS + 2,
      height: 2 * POINT_RADIUS + 2,
    })),
    { left: area.x, top: area.y, width: area.width - 2, height: area.height },
    [
      { left: cx - 2, top: area.y, width: 4, height: area.height },
      { left: area.x, top: cy - 2, width: area.width, height: 4 },
    ],
  );
  const regions: readonly { readonly region: Region; readonly x: number; readonly y: number }[] = [
    { region: 'rapido', x: (area.x + cx) / 2, y: ROW_TITLE },
    { region: 'aposta', x: (cx + right) / 2, y: ROW_TITLE },
    { region: 'preenchimento', x: (area.x + cx) / 2, y: rowBottom },
    { region: 'baixo', x: (cx + right) / 2, y: rowBottom },
  ];

  return (
    <g>
      {/* Contorno tracejado do plano: as duas notas são avaliação do time, não medição. */}
      <rect fill="none" height={area.height} stroke="var(--line-strong)" strokeDasharray="4 4" width={area.width} x={area.x} y={area.y} />
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={MARGIN.left} y={ROW_TITLE}>
        Impacto
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="end" x={right + MARGIN.right - 2} y={rowBottom}>
        Esforço
      </text>
      {regions.map((item) => (
        <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} fontWeight={600} key={item.region} textAnchor="middle" x={item.x} y={item.y}>
          {REGION_TITLE[item.region]}
        </text>
      ))}
      {isoLines.map((line, index) => {
        const x = xScale(line.x1);
        const y = yScale(line.y1);
        if (x === undefined || y === undefined) return null;
        const text = index === 0 ? `razão ${isoText(line.ratio)}` : isoText(line.ratio);
        return line.exit === 'top' ? (
          <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} key={line.ratio} textAnchor="middle" x={x} y={area.y - 6}>
            {text}
          </text>
        ) : (
          <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} key={line.ratio} x={right + 6} y={y + 4}>
            {text}
          </text>
        );
      })}
      <ZIndexLayer zIndex={LABEL_Z}>
        {labels.map((box) => (
          <text className="font-display" fill="var(--text-primary)" fontSize={TEXT_SIZE} fontWeight={600} key={box.id} style={HALO} x={box.left} y={box.top + LABEL_HEIGHT - 2}>
            {box.text}
          </text>
        ))}
      </ZIndexLayer>
    </g>
  );
}

export default function AutomationIsoRatio({ data = defaultData, priorityRatio = defaultPriorityRatio, height, className }: AutomationIsoRatioProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const points = toPoints(data, priorityRatio);
  const first = points[0];

  if (first === undefined) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma automação neste recorte tem as duas notas dadas pelo time, então não há fila para ordenar.</span>
      </div>
    );
  }

  const isoLines = ISO_RATIOS.flatMap((ratio) => {
    const line = clipRatioLine(ratio);
    return line ? [line] : [];
  });
  const priority = points.filter((point) => point.priority);
  const top = points.reduce((best, point) => (point.ratio > best.ratio ? point : best), first);
  const dodged = points.filter((point) => point.slot !== 0).length;
  const fora = data.length - points.length;
  const scale = `${formatInt(SCORE_MIN)} a ${formatInt(SCORE_MAX)}`;
  const threshold = isoText(priorityRatio);

  const summary =
    `Gráfico de dispersão com as notas de impacto e de esforço de ${formatInt(points.length)} automações, de ${scale}, sobre retas de razão. ` +
    `${formatInt(priority.length)} rendem ${threshold} ou mais de impacto por esforço; a primeira da fila é ${lowerFirst(top.name)}, com ${ratioText(top.ratio, 1)}.`;
  const footer =
    `${formatInt(points.length)} automações no plano` +
    (dodged > 0 ? `; ${formatInt(dodged)} com notas repetidas foram afastadas sobre a própria reta` : '') +
    (fora > 0 ? `; ${formatInt(fora)} sem as duas notas ficam fora` : '') +
    '.';

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as PlanePoint | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'impacto', name: 'Impacto', value: formatInt(point.impacto) },
      { dataKey: 'esforco', name: 'Esforço', value: formatInt(point.esforco) },
      { dataKey: 'ratio', name: 'Razão', value: ratioText(point.ratio, 1) },
      { dataKey: 'region', name: 'Região', value: REGION_TITLE[point.region] },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs text-text-secondary">
        Fila oficial pela razão de impacto por esforço: <span className="tabular-nums">{formatInt(priority.length)}</span> de{' '}
        <span className="tabular-nums">{formatInt(points.length)}</span> automações rendem <span className="tabular-nums">{threshold}</span> ou mais
      </p>
      <p aria-hidden className="mb-2 mt-1 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`Notas de ${scale} são avaliação do time, não medição. As divisórias só nomeiam regiões.`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            {/* Nos dois eixos: axisLine depois do spread do AXIS_PROPS, que vem ligado (REC-30), e interval 0 para o eixo não descartar tique e levar a grade junto (REC-29). */}
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="esforco"
              domain={[...DOMAIN]}
              height={X_AXIS_HEIGHT}
              interval={0}
              name="Esforço"
              tickFormatter={(value: number) => formatInt(value)}
              tickMargin={8}
              ticks={[...TICKS]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="impacto"
              domain={[...DOMAIN]}
              interval={0}
              name="Impacto"
              tickFormatter={(value: number) => formatInt(value)}
              tickMargin={8}
              ticks={[...TICKS]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            {/* Retas de fundo primeiro e divisórias depois: entre linhas de referência, a ordem dos filhos é a ordem de pintura. */}
            {isoLines.map((line) => (
              <ReferenceLine
                ifOverflow="extendDomain"
                key={line.ratio}
                segment={[
                  { x: line.x0, y: line.y0 },
                  { x: line.x1, y: line.y1 },
                ]}
                stroke="var(--line-strong)"
                strokeWidth={1}
              />
            ))}
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--text-muted)" strokeWidth={1.5} x={REGION_CUT} />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--text-muted)" strokeWidth={1.5} y={REGION_CUT} />
            <Scatter data={[...points]} isAnimationActive={animate} name="Automações" shape={<DodgedDot />} />
            <PlaneLayer isoLines={isoLines} points={points} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {footer}
      </p>
    </div>
  );
}
