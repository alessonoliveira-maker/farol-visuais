import { Filter } from 'lucide-react';

import { formatCurrencyCompact } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periodAfter, periodBefore, type PlatformCpl } from './data';

/**
 * Slope chart do CPL qualificado por plataforma em dois trimestres. As retas que se cruzam, isto é,
 * as plataformas que trocaram de posição, ficam em cor; as demais ficam em cinza fino. CPL menor é
 * melhor, então a subida não é pintada de bom nem de ruim: o sinal do delta e o texto dizem o sentido.
 */
export interface PlatformSlopeProps {
  readonly data?: readonly PlatformCpl[];
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox é o corpo do canvas card (caso de uso em duas linhas): escala 1, texto sem encolher (GEO-18). */
const VIEW_W = 574;
const VIEW_H = 225;
const READING_Y = 13;
const HEADER_Y = 34;
const PLOT_TOP = 50;
const PLOT_BOTTOM = 212;
const X_LEFT = 172;
const X_RIGHT = 330;
const LABEL_OFFSET = 16;
const VALUE_WIDTH = 56;
const DELTA_WIDTH = 54;
const LABEL_GAP = 15;
const LEADER_MIN = 8;
const DOMAIN_STEP = 20;
const LINE_WIDTH = 1.5;
const LINE_WIDTH_LEAD = 2.5;
const DOT_RADIUS = 3.5;
const DOT_RADIUS_LEAD = 4.5;
const CROSS_RADIUS = 6;
/** Cores das duas retas que se cruzam: slots 1 e 3 da ordem COR-8. */
const LEAD_COLORS = ['var(--chart-1)', 'var(--chart-3)'] as const;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Menor e maior de uma lista; `null` para lista vazia (EST-1b), nunca um limite inventado. */
function extent(list: readonly number[]): readonly [number, number] | null {
  const first = list[0];
  if (first === undefined) return null;
  let low = first;
  let high = first;
  for (const value of list) {
    if (value < low) low = value;
    if (value > high) high = value;
  }
  return [low, high];
}

/**
 * afastarRotulos: dado o y desejado de cada rótulo, devolve o y de cada um com `gap` de folga,
 * dentro de [min, max]. Rótulos vizinhos formam um bloco que se centra no próprio grupo (mínimos
 * quadrados), então o deslocamento se reparte em vez de empurrar tudo para baixo.
 */
function spreadLabels(wanted: readonly number[], gap: number, min: number, max: number): readonly number[] {
  const order = wanted.map((_, index) => index).sort((a, b) => (wanted[a] ?? 0) - (wanted[b] ?? 0) || a - b);
  const clampStart = (adj: number, n: number) => Math.min(Math.max(adj / n, min), max - (n - 1) * gap);
  const blocks: { n: number; adj: number; start: number }[] = [];
  for (const index of order) {
    const adj0 = wanted[index] ?? 0;
    let current = { n: 1, adj: adj0, start: clampStart(adj0, 1) };
    for (let prev = blocks[blocks.length - 1]; prev !== undefined && prev.start + prev.n * gap > current.start; prev = blocks[blocks.length - 1]) {
      blocks.pop();
      const n = prev.n + current.n;
      const adj = prev.adj + current.adj - current.n * prev.n * gap;
      current = { n, adj, start: clampStart(adj, n) };
    }
    blocks.push(current);
  }
  const placed: number[] = wanted.map(() => 0);
  let cursor = 0;
  for (const block of blocks) {
    for (let j = 0; j < block.n; j += 1) {
      const target = order[cursor];
      if (target !== undefined) placed[target] = block.start + j * gap;
      cursor += 1;
    }
  }
  return placed;
}

/** Primeiro par cujo vizinho de cima e o de baixo se invertem entre os dois momentos, ou `null`. */
function findCrossing(items: readonly PlatformCpl[]): { readonly first: PlatformCpl; readonly second: PlatformCpl } | null {
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const a = items[i];
      const b = items[j];
      if (a && b && (a.cplBefore - b.cplBefore) * (a.cplAfter - b.cplAfter) < 0) {
        return a.cplBefore < b.cplBefore ? { first: a, second: b } : { first: b, second: a };
      }
    }
  }
  return null;
}

/** Variação com sinal à mão sobre o valor absoluto (NUM-3): `+` e o menos tipográfico. */
function signedCurrency(value: number): string {
  if (value === 0) return formatCurrencyCompact(0);
  return `${value > 0 ? '+' : '−'}${formatCurrencyCompact(Math.abs(value))}`;
}

export default function PlatformSlope({ data = defaultData, height, className }: PlatformSlopeProps) {
  const style = height === undefined ? undefined : { height };

  const range = extent(data.flatMap((item) => [item.cplBefore, item.cplAfter]));
  if (range === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma neste recorte: não há CPL para comparar entre os trimestres.</span>
      </div>
    );
  }

  const domainMin = Math.floor(range[0] / DOMAIN_STEP) * DOMAIN_STEP;
  const domainMax = Math.ceil(range[1] / DOMAIN_STEP) * DOMAIN_STEP;
  const yOf = (value: number) => PLOT_BOTTOM - ((value - domainMin) / (domainMax - domainMin)) * (PLOT_BOTTOM - PLOT_TOP);
  const wantedBefore = data.map((item) => yOf(item.cplBefore));
  const wantedAfter = data.map((item) => yOf(item.cplAfter));
  const placedBefore = spreadLabels(wantedBefore, LABEL_GAP, PLOT_TOP, PLOT_BOTTOM);
  const placedAfter = spreadLabels(wantedAfter, LABEL_GAP, PLOT_TOP, PLOT_BOTTOM);

  const crossing = findCrossing(data);
  const leadColor = (item: PlatformCpl): string | null => {
    if (crossing === null) return null;
    if (item.id === crossing.first.id) return LEAD_COLORS[0];
    if (item.id === crossing.second.id) return LEAD_COLORS[1];
    return null;
  };

  let crossPoint: { x: number; y: number } | null = null;
  if (crossing !== null) {
    const d0 = crossing.first.cplBefore - crossing.second.cplBefore;
    const d1 = crossing.first.cplAfter - crossing.second.cplAfter;
    const t = d0 / (d0 - d1);
    crossPoint = { x: X_LEFT + t * (X_RIGHT - X_LEFT), y: yOf(crossing.first.cplBefore + t * (crossing.first.cplAfter - crossing.first.cplBefore)) };
  }

  const lower = (item: PlatformCpl) => item.name.toLowerCase();
  const readingLine =
    crossing === null
      ? 'Nenhuma plataforma trocou de posição. CPL menor é melhor.'
      : `${crossing.first.name} e ${lower(crossing.second)} trocaram de posição. CPL menor é melhor.`;
  const summary =
    crossing === null
      ? `Gráfico de inclinação com o CPL qualificado de ${String(data.length)} plataformas, de ${periodBefore} para ${periodAfter}; CPL menor é melhor. Nenhuma plataforma trocou de posição.`
      : `Gráfico de inclinação com o CPL qualificado de ${String(data.length)} plataformas, de ${periodBefore} para ${periodAfter}; CPL menor é melhor. Trocaram de posição ${lower(crossing.first)}, de ${formatCurrencyCompact(crossing.first.cplBefore)} para ${formatCurrencyCompact(crossing.first.cplAfter)}, e ${lower(crossing.second)}, de ${formatCurrencyCompact(crossing.second.cplBefore)} para ${formatCurrencyCompact(crossing.second.cplAfter)}.`;

  /* Neutras primeiro, destacadas por último: a reta em cor nunca fica sob a cinza. */
  const drawOrder = [...data.keys()].sort((a, b) => Number(leadColor(data[a]!) !== null) - Number(leadColor(data[b]!) !== null));

  return (
    <svg aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style} viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
      <text aria-hidden className="font-sans" fill="var(--text-secondary)" fontSize={12} x={0} y={READING_Y}>
        {readingLine}
      </text>
      {[
        { x: X_LEFT, label: periodBefore },
        { x: X_RIGHT, label: periodAfter },
      ].map((column) => (
        <text className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={600} key={column.label} textAnchor="middle" x={column.x} y={HEADER_Y}>
          {column.label}
        </text>
      ))}

      {drawOrder.map((index) => {
        const item = data[index];
        if (!item) return null;
        const color = leadColor(item);
        return (
          <g key={`mark-${item.id}`}>
            <line
              stroke={color ?? 'var(--text-muted)'}
              strokeLinecap="round"
              strokeWidth={color === null ? LINE_WIDTH : LINE_WIDTH_LEAD}
              x1={X_LEFT}
              x2={X_RIGHT}
              y1={wantedBefore[index]}
              y2={wantedAfter[index]}
            />
            <circle cx={X_LEFT} cy={wantedBefore[index]} fill={color ?? 'var(--text-muted)'} r={color === null ? DOT_RADIUS : DOT_RADIUS_LEAD} stroke="var(--surface-raised)" strokeWidth={1.5} />
            <circle cx={X_RIGHT} cy={wantedAfter[index]} fill={color ?? 'var(--text-muted)'} r={color === null ? DOT_RADIUS : DOT_RADIUS_LEAD} stroke="var(--surface-raised)" strokeWidth={1.5} />
          </g>
        );
      })}

      {crossPoint !== null ? (
        <g>
          <circle cx={crossPoint.x} cy={crossPoint.y} fill="none" r={CROSS_RADIUS} stroke="var(--text-secondary)" strokeWidth={1.5} />
          {/* Anotação (ANO-2): curta, 11 px, com halo porque cruza as retas cinza. */}
          <text className="font-sans" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="middle" x={crossPoint.x} y={crossPoint.y - CROSS_RADIUS - 6}>
            trocam de posição
          </text>
        </g>
      ) : null}

      {data.map((item, index) => {
        const color = leadColor(item);
        const nameFill = color ?? 'var(--text-secondary)';
        const weight = color === null ? 400 : 600;
        const labelBefore = placedBefore[index] ?? 0;
        const labelAfter = placedAfter[index] ?? 0;
        const yBefore = wantedBefore[index] ?? 0;
        const yAfter = wantedAfter[index] ?? 0;
        const delta = item.cplAfter - item.cplBefore;
        return (
          <g key={`ends-${item.id}`}>
            {/* Traço guia só quando o rótulo saiu do lugar do ponto (afastarRotulos). */}
            {Math.abs(labelBefore - yBefore) > LEADER_MIN ? (
              <line stroke="var(--text-muted)" strokeWidth={1} x1={X_LEFT - DOT_RADIUS - 1} x2={X_LEFT - LABEL_OFFSET + 3} y1={yBefore} y2={labelBefore} />
            ) : null}
            {Math.abs(labelAfter - yAfter) > LEADER_MIN ? (
              <line stroke="var(--text-muted)" strokeWidth={1} x1={X_RIGHT + DOT_RADIUS + 1} x2={X_RIGHT + LABEL_OFFSET - 3} y1={yAfter} y2={labelAfter} />
            ) : null}
            <text className="font-sans" dominantBaseline="central" fill={nameFill} fontSize={12} fontWeight={weight} textAnchor="end" x={X_LEFT - LABEL_OFFSET - VALUE_WIDTH} y={labelBefore}>
              {item.name}
            </text>
            <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={500} textAnchor="end" x={X_LEFT - LABEL_OFFSET} y={labelBefore}>
              {formatCurrencyCompact(item.cplBefore)}
            </text>
            <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={500} textAnchor="start" x={X_RIGHT + LABEL_OFFSET} y={labelAfter}>
              {formatCurrencyCompact(item.cplAfter)}
            </text>
            <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor="start" x={X_RIGHT + LABEL_OFFSET + VALUE_WIDTH} y={labelAfter}>
              {signedCurrency(delta)}
            </text>
            <text className="font-sans" dominantBaseline="central" fill={nameFill} fontSize={12} fontWeight={weight} textAnchor="start" x={X_RIGHT + LABEL_OFFSET + VALUE_WIDTH + DELTA_WIDTH} y={labelAfter}>
              {item.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
