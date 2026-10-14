import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatCurrencyAxis, formatDecimal, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PlanActualBridge, type PlanActualItem } from './data';

/** Ponte do plano e do realizado espelhadas num eixo central, com a variância de cada passo no meio. */
export interface MirroredBridgeProps {
  readonly data?: PlanActualBridge;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Corpo medido no canvas 960 x 460 com moldura `card` e caso de uso em uma linha (seção 13):
 * 960 − 66 = 894 de largura e 460 − 118,5 = 341,5 de altura. O viewBox tem esse tamanho, então a
 * escala do SVG é 1 e os 11 px declarados chegam como 11 px (GEO-18).
 * Largura: 4 + lado 336 + centro 214 + lado 336 + 4 = 894. Cada lado reserva 88 px para o rótulo
 * além da maior barra, e sobram 248 px de escala por lado.
 */
const VIEW_W = 894;
const VIEW_H = 341.5;
const EDGE = 4;
const CENTER_W = 214;
const SIDE_W = (VIEW_W - 2 * EDGE - CENTER_W) / 2;
const LABEL_ROOM = 88;
const SCALE_W = SIDE_W - LABEL_ROOM;
const LEFT_ZERO = EDGE + SIDE_W;
const RIGHT_ZERO = LEFT_ZERO + CENTER_W;
const READING_Y = 14;
const HEAD_Y = 38;
const ROW_TOP = 50;
const ROW_BOTTOM = VIEW_H - 30;
const BAR_H = 20;
const CORNER = 3;
const LABEL_GAP = 6;
const ZERO_MARK = 2;
const MIN_BAR = 2;
const STRIP_PAD = 16;
const NOTE_Y = VIEW_H - 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

type Verdict = 'better' | 'worse' | 'even';
type Side = 'plan' | 'actual';

interface Row extends PlanActualItem {
  readonly planLow: number;
  readonly planHigh: number;
  readonly planEnd: number;
  readonly actualLow: number;
  readonly actualHigh: number;
  readonly actualEnd: number;
  /** Distância do realizado ao plano: em passo, entre grandezas; em total, entre valores. */
  readonly variance: number;
  readonly verdict: Verdict;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signed(value: number): string {
  if (value === 0) return formatCurrencyAxis(0);
  return `${value > 0 ? '+' : '−'}${formatCurrencyAxis(Math.abs(value))}`;
}

/** Total em milhões com duas casas: R$ 1,89 mi, que o compacto de uma casa arredondaria para 1,9. */
function millions(value: number): string {
  return `R$ ${formatDecimal(value / 1_000_000, 2)} mi`;
}

/** Variação inteira a partir de 10% e com uma casa abaixo disso (NUM-1). */
function pctText(fraction: number): string {
  const abs = Math.abs(fraction);
  return `${fraction < 0 ? '−' : '+'}${formatPercent(abs, abs >= 0.1 ? 0 : 1)}`;
}

/** Cada passo nasce onde o anterior terminou, nos dois lados; total reancora no valor dele. */
function buildRows(items: readonly PlanActualItem[]): readonly Row[] {
  let planRun = 0;
  let actualRun = 0;
  return items.map((item) => {
    const isTotal = item.kind === 'total';
    const planStart = isTotal ? 0 : planRun;
    const actualStart = isTotal ? 0 : actualRun;
    const planEnd = isTotal ? item.plan : planRun + item.plan;
    const actualEnd = isTotal ? item.actual : actualRun + item.actual;
    planRun = planEnd;
    actualRun = actualEnd;
    const variance = isTotal ? item.actual - item.plan : Math.abs(item.actual) - Math.abs(item.plan);
    const good = item.polarity === 'higher' ? variance : -variance;
    return {
      ...item,
      planLow: Math.min(planStart, planEnd),
      planHigh: Math.max(planStart, planEnd),
      planEnd,
      actualLow: Math.min(actualStart, actualEnd),
      actualHigh: Math.max(actualStart, actualEnd),
      actualEnd,
      variance,
      verdict: good > 0 ? 'better' : good < 0 ? 'worse' : 'even',
    };
  });
}

/** Quanto a soma dos passos erra o fim menos o início de um lado; `null` sem início, fim ou passos. */
function closureGap(items: readonly PlanActualItem[], side: Side): number | null {
  const first = items[0];
  const last = items[items.length - 1];
  const steps = items.filter((item) => item.kind === 'step');
  if (!first || !last || first.kind !== 'total' || last.kind !== 'total' || steps.length === 0) return null;
  return last[side] - first[side] - steps.reduce((acc, item) => acc + item[side], 0);
}

/** A variância dita em palavras: cancelamento acima do plano diz "acima", não um sinal que enganaria. */
function varianceWords(row: Row): string {
  if (row.kind === 'step' && row.polarity === 'lower' && row.variance > 0) return `${formatCurrencyAxis(row.variance)} acima do plano`;
  return signed(row.variance);
}

const VERDICT_FILL: Record<Verdict, string> = { better: 'var(--positive)', worse: 'var(--negative)', even: 'var(--text-muted)' };

interface SideBarProps {
  readonly row: Row;
  readonly side: Side;
  readonly cy: number;
  readonly zeroX: number;
  readonly dir: 1 | -1;
  readonly scale: number;
}

/** Uma barra de um lado: contorno para o plano, cheia para o realizado; rótulo na ponta livre, longe do eixo. */
function SideBar({ row, side, cy, zeroX, dir, scale }: SideBarProps): ReactElement {
  const low = side === 'plan' ? row.planLow : row.actualLow;
  const high = side === 'plan' ? row.planHigh : row.actualHigh;
  const amount = side === 'plan' ? row.plan : row.actual;
  const isTotal = row.kind === 'total';
  const isZero = !isTotal && amount === 0;
  const xa = zeroX + dir * low * scale;
  const xb = zeroX + dir * high * scale;
  const x = Math.min(xa, xb);
  const width = Math.max(Math.abs(xb - xa), MIN_BAR);
  const fill = isTotal ? 'var(--chart-1)' : amount >= 0 ? 'var(--positive)' : 'var(--negative)';
  const outer = dir === 1 ? x + width : x;
  return (
    <g>
      {isZero ? (
        <rect fill="var(--text-secondary)" height={BAR_H} width={ZERO_MARK} x={x - ZERO_MARK / 2} y={cy - BAR_H / 2} />
      ) : side === 'plan' ? (
        <rect fill="none" height={BAR_H} rx={CORNER} stroke={fill} strokeWidth={1.5} width={width} x={x} y={cy - BAR_H / 2} />
      ) : (
        <rect fill={fill} height={BAR_H} rx={CORNER} width={width} x={x} y={cy - BAR_H / 2} />
      )}
      <text
        className="font-display"
        dominantBaseline="central"
        fill={isTotal ? 'var(--text-primary)' : isZero ? 'var(--text-muted)' : fill}
        fontSize={isTotal ? 14 : 12}
        fontWeight={isTotal ? 600 : 500}
        style={HALO}
        textAnchor={dir === 1 ? 'start' : 'end'}
        x={outer + dir * LABEL_GAP}
        y={cy}
      >
        {isTotal ? millions(amount) : signed(amount)}
      </text>
    </g>
  );
}

/** A tira central de uma linha: nome do passo e a variância do realizado contra o plano, com seta e palavra. */
function Strip({ row, cy }: { readonly row: Row; readonly cy: number }): ReactElement {
  const x0 = LEFT_ZERO + STRIP_PAD;
  const fill = VERDICT_FILL[row.verdict];
  const up = row.variance > 0;
  const base = Math.abs(row.plan);
  const pct = base === 0 ? 'sem base' : pctText(row.variance / base);
  return (
    <g>
      <text className="font-sans" fill="var(--text-secondary)" fontSize={12} fontWeight={row.kind === 'total' ? 600 : 500} x={x0} y={cy - 3}>
        {row.label}
      </text>
      {row.verdict === 'even' ? (
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} fontWeight={500} x={x0} y={cy + 12}>
          no plano
        </text>
      ) : (
        <g>
          <polygon fill={fill} points={up ? `${x0},${cy + 12} ${x0 + 8},${cy + 12} ${x0 + 4},${cy + 5}` : `${x0},${cy + 5} ${x0 + 8},${cy + 5} ${x0 + 4},${cy + 12}`} />
          <text className="font-display" fill={fill} fontSize={12} fontWeight={600} x={x0 + 14} y={cy + 12}>
            {signed(row.variance)}
            <tspan className="font-sans" fill="var(--text-muted)" fontSize={11} fontWeight={500}>{` (${pct})`}</tspan>
          </text>
        </g>
      )}
    </g>
  );
}

export default function MirroredBridge({ data = defaultData, height, className }: MirroredBridgeProps) {
  const style = height === undefined ? undefined : { height };

  if (data.items.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum passo neste recorte: não há plano nem receita registrados para montar as pontes.</span>
      </div>
    );
  }

  const rows = buildRows(data.items);
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  // Escala linear valor para pixel, única para os dois lados: o domínio vem antes de qualquer desenho.
  const peak = Math.max(1, ...rows.map((row) => Math.max(row.planHigh, row.actualHigh)));
  const scale = SCALE_W / peak;
  const pitch = (ROW_BOTTOM - ROW_TOP) / rows.length;
  const cyOf = (index: number): number => ROW_TOP + pitch * (index + 0.5);

  const endGap = last.actual - last.plan;
  const worse = rows.filter((row) => row.kind === 'step' && row.verdict === 'worse');
  const where = endGap === 0 ? 'no plano' : `${formatCurrencyAxis(Math.abs(endGap))} ${endGap < 0 ? 'abaixo' : 'acima'} do plano`;
  const worseNames = worse.map((row) => row.label.toLowerCase());
  const gaps = [closureGap(data.items, 'plan'), closureGap(data.items, 'actual')];
  const open = gaps.some((gap) => gap !== null && gap !== 0);
  const reading =
    `Realizado fecha ${where} (${millions(last.actual)} contra ${millions(last.plan)})` +
    (worseNames.length > 0 ? `; piora em ${worseNames.join(', ')}` : '') +
    (open ? '; os passos de um dos lados não fecham' : '');
  const summary =
    `Gráfico de cascata espelhada do plano e do realizado em ${data.period}: o realizado fecha em ${millions(last.actual)}, ${where}` +
    (worse.length > 0 ? `; piores passos: ${worse.map((row) => `${row.label.toLowerCase()} ${varianceWords(row)}`).join(', ')}.` : '.') +
    (first.variance === 0 ? '' : ` O início já difere em ${signed(first.variance)}.`);

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <svg aria-hidden className="h-full w-full" preserveAspectRatio="xMidYMin meet" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <text className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={EDGE} y={READING_Y}>
          {reading}
        </text>
        <text className="font-sans" fill="var(--text-primary)" fontSize={12} fontWeight={600} textAnchor="end" x={LEFT_ZERO} y={HEAD_Y}>
          Plano
        </text>
        <text className="font-sans" fill="var(--text-secondary)" fontSize={12} fontWeight={600} x={LEFT_ZERO + STRIP_PAD} y={HEAD_Y}>
          Realizado contra o plano
        </text>
        <text className="font-sans" fill="var(--text-primary)" fontSize={12} fontWeight={600} x={RIGHT_ZERO} y={HEAD_Y}>
          Realizado
        </text>
        <line stroke="var(--line-strong)" strokeWidth={1} x1={LEFT_ZERO} x2={LEFT_ZERO} y1={ROW_TOP} y2={ROW_BOTTOM} />
        <line stroke="var(--line-strong)" strokeWidth={1} x1={RIGHT_ZERO} x2={RIGHT_ZERO} y1={ROW_TOP} y2={ROW_BOTTOM} />
        {rows.map((row, index) => {
          const cy = cyOf(index);
          const nextCy = cyOf(index + 1);
          const isLast = index === rows.length - 1;
          return (
            <g key={row.id}>
              {isLast ? null : (
                <g>
                  <line stroke="var(--text-muted)" strokeWidth={1} x1={LEFT_ZERO - row.planEnd * scale} x2={LEFT_ZERO - row.planEnd * scale} y1={cy + BAR_H / 2} y2={nextCy - BAR_H / 2} />
                  <line stroke="var(--text-muted)" strokeWidth={1} x1={RIGHT_ZERO + row.actualEnd * scale} x2={RIGHT_ZERO + row.actualEnd * scale} y1={cy + BAR_H / 2} y2={nextCy - BAR_H / 2} />
                </g>
              )}
              <SideBar cy={cy} dir={-1} row={row} scale={scale} side="plan" zeroX={LEFT_ZERO} />
              <SideBar cy={cy} dir={1} row={row} scale={scale} side="actual" zeroX={RIGHT_ZERO} />
              <Strip cy={cy} row={row} />
            </g>
          );
        })}
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} fontWeight={500} x={EDGE} y={NOTE_Y}>
          Contorno é o plano, cheio é o realizado. Seta para cima é mais que o plano e para baixo é menos; verde melhora, vermelho piora.
        </text>
      </svg>
    </div>
  );
}
