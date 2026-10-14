import { Filter } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  goal as defaultGoal,
  periodLabel as defaultPeriodLabel,
  subject as defaultSubject,
  type CompetencyScore,
} from './data';

/**
 * Stellar chart com meta: um espeto afinado por competência e a meta do plano num círculo
 * tracejado. O espeto que não alcança o círculo acende e ganha peso no rótulo; os demais ficam
 * neutros, com o valor escrito. Responde quais competências entram em treino. A largura do espeto
 * não depende do valor, então a área cresce em linha com o índice, e não com o quadrado dele.
 */
export interface GoalStellarProps {
  readonly data?: readonly CompetencyScore[];
  /** Índice da meta: abaixo dele, estritamente, a competência acende. */
  readonly goal?: number;
  readonly subject?: string;
  readonly periodLabel?: string;
  readonly height?: number;
  readonly className?: string;
}

/** viewBox do tamanho do corpo medido no canvas quadrado, para a escala sair 1 (GEO-18). */
const VIEW_W = 422;
const VIEW_H = 308;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const DOMAIN_MAX = 100;
const GRID_STEP = 25;
const GRID_VALUES = [GRID_STEP, GRID_STEP * 2, GRID_STEP * 3, GRID_STEP * 4] as const;
/** Anel do zero. Afasta as bases do centro: sem ele os espetos se sobrepõem no miolo. */
const HUB_R = 12;
const OUTER_R = 112;
/** Meia largura na base e na ponta. As duas são fixas, e é isso que mantém a área linear no valor. */
const HALF_BASE = 3;
const HALF_TIP = 1;
const LABEL_GAP = 8;
const LINE_HEIGHT = 13;
const BASELINE = 10;
const NAME_SIZE = 11;
const VALUE_SIZE = 12;
/** Largura estimada por caractere, para quebrar o nome e medir a caixa sem ler o DOM. */
const NAME_CHAR_W = 6.1;
const VALUE_CHAR_W = 7.6;
const VALUE_GAP = 4;
const EDGE_PAD = 4;
/** Abaixo deste seno o eixo está no topo ou na base, e o rótulo centraliza. */
const POLE_SIN = 0.1;
/** Meia largura da caixa do rótulo da escala mais o halo: o vão entre dois espetos precisa caber. */
const GRID_LABEL_CLEARANCE = 13;
const HALO_REACH = 2;
const HIGHLIGHT = 'var(--chart-1)';
/** Neutro de contexto: só vale porque o valor de cada espeto neutro vai escrito na ponta (TOK-5). */
const NEUTRAL = 'var(--line-strong)';
const GOAL_STROKE = 'var(--text-muted)';
const GOAL_DASH = '3 3';
/** Faixa em volta do círculo de meta onde nenhuma âncora de rótulo pousa. */
const GOAL_KEEPOUT = 10;
/** Halo da ROT-7: o rótulo que cruza o círculo de meta ou um anel apaga o trecho atrás dele. */
const HALO_STYLE = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

type Anchor = 'start' | 'middle' | 'end';

interface LabelBox {
  readonly lines: readonly string[];
  readonly anchor: Anchor;
  readonly x: number;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Ângulo do eixo `i` de `n`, em graus: zero no topo, sentido horário. */
function axisAngle(i: number, n: number): number {
  return (360 * i) / n;
}

function polar(r: number, angleDeg: number): { x: number; y: number } {
  const a = toRad(angleDeg);
  return { x: CX + r * Math.sin(a), y: CY - r * Math.cos(a) };
}

/** Comprimento em linha com o valor. Com a largura fixa do espeto, a área sai na mesma proporção. */
function valueToRadius(value: number): number {
  return HUB_R + (Math.max(0, value) / DOMAIN_MAX) * (OUTER_R - HUB_R);
}

/**
 * Quatro casas, e não duas: com duas, o arredondamento da meia base de 3 px desviava a área em até
 * 0,018 ponto percentual de participação, medido no preview, e a proporção deixava de ser exata.
 */
function fmt(n: number): string {
  return String(Math.round(n * 10000) / 10000);
}

/**
 * Espeto do eixo `i` de `n`, do anel do zero até o raio `r`: trapézio de base e ponta fixas.
 *
 * A área vale `(HALF_BASE + HALF_TIP) * comprimento`, isto é 4 px vezes o comprimento, e o
 * comprimento é linear no valor: a área é proporcional ao valor e nunca ao quadrado dele (GEO-3).
 * O que quebraria a conta é largura que cresce com o valor, ou setor de ângulo fixo: nos dois a
 * área passa a ir com o quadrado do raio. A ponta tem 2 px e não zero porque ponta em agulha some
 * nos últimos pixels e o espeto passa a ler mais curto do que o valor.
 */
function spike(cx: number, cy: number, i: number, n: number, r: number): string {
  const a = toRad(axisAngle(i, n));
  const ux = Math.sin(a);
  const uy = -Math.cos(a);
  const px = Math.cos(a);
  const py = Math.sin(a);
  const bx = cx + HUB_R * ux;
  const by = cy + HUB_R * uy;
  const tx = cx + r * ux;
  const ty = cy + r * uy;
  return [
    `M${fmt(bx - HALF_BASE * px)},${fmt(by - HALF_BASE * py)}`,
    `L${fmt(tx - HALF_TIP * px)},${fmt(ty - HALF_TIP * py)}`,
    `L${fmt(tx + HALF_TIP * px)},${fmt(ty + HALF_TIP * py)}`,
    `L${fmt(bx + HALF_BASE * px)},${fmt(by + HALF_BASE * py)}`,
    'Z',
  ].join(' ');
}

/** Vão entre dois eixos mais próximo da horizontal direita: nenhum rótulo centralizado chega lá (GEO-15). */
function gridLabelAngle(n: number): number {
  const step = 360 / n;
  return (Math.max(0, Math.round(90 / step - 0.5)) + 0.5) * step;
}

/** Quebra em duas linhas por palavra inteira, no corte mais equilibrado; o valor vai na segunda. */
function splitBalanced(name: string, valueChars: number): readonly string[] {
  const words = name.split(' ');
  let best: readonly string[] = [name];
  let bestLength = name.length + valueChars;
  for (let k = 1; k < words.length; k += 1) {
    const head = words.slice(0, k).join(' ');
    const tail = words.slice(k).join(' ');
    const longest = Math.max(head.length, tail.length + valueChars);
    if (longest < bestLength) {
      best = [head, tail];
      bestLength = longest;
    }
  }
  return best;
}

/**
 * Caixa do rótulo ancorado em `radius` no ângulo do eixo. A âncora sai do quadrante, e o bloco
 * sobe no topo, centra nos lados e desce na base, para nunca voltar por cima da ponta do espeto.
 */
function layoutLabel(name: string, valueText: string, angleDeg: number, radius: number): LabelBox {
  const a = toRad(angleDeg);
  const sin = Math.sin(a);
  const anchor: Anchor = Math.abs(sin) < POLE_SIN ? 'middle' : sin > 0 ? 'start' : 'end';
  const point = polar(radius, angleDeg);
  const valueWidth = VALUE_GAP + valueText.length * VALUE_CHAR_W;
  const room = anchor === 'middle' ? VIEW_W - EDGE_PAD * 2 : (anchor === 'start' ? VIEW_W - point.x : point.x) - EDGE_PAD;
  const fitsOneLine = name.length * NAME_CHAR_W + valueWidth <= room;
  const lines = fitsOneLine ? [name] : splitBalanced(name, Math.ceil(valueWidth / NAME_CHAR_W));
  const last = lines[lines.length - 1] ?? name;
  const width = Math.max(...lines.map((line) => line.length * NAME_CHAR_W), last.length * NAME_CHAR_W + valueWidth);
  const height = lines.length * LINE_HEIGHT;
  const left = anchor === 'start' ? point.x : anchor === 'end' ? point.x - width : point.x - width / 2;
  const top = point.y - (height / 2) * (1 + Math.cos(a));
  return { lines, anchor, x: point.x, left, top, width, height };
}

/** O anel de raio `r` passa por dentro da caixa, contando o alcance do halo? */
function ringCrossesBox(box: LabelBox, r: number): boolean {
  const right = box.left + box.width;
  const bottom = box.top + box.height;
  const nearX = Math.min(Math.max(CX, box.left), right);
  const nearY = Math.min(Math.max(CY, box.top), bottom);
  const near = Math.hypot(nearX - CX, nearY - CY);
  const far = Math.max(
    Math.hypot(box.left - CX, box.top - CY),
    Math.hypot(right - CX, box.top - CY),
    Math.hypot(box.left - CX, bottom - CY),
    Math.hypot(right - CX, bottom - CY),
  );
  return near - HALO_REACH <= r && r <= far + HALO_REACH;
}

/** Nome de eixo no meio de uma oração: sem a maiúscula de rótulo. */
function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * Raio da âncora do rótulo: logo depois da ponta do espeto, menos quando isso cai em cima do
 * círculo de meta. Ali o rótulo salta para fora do círculo, porque um traço do tracejado colado
 * ao número lê como sinal ou apóstrofo ("59'"). O halo fica para o que ainda cruza.
 */
function labelRadius(tipRadius: number, goalRadius: number): number {
  const natural = tipRadius + LABEL_GAP;
  return Math.abs(natural - goalRadius) < GOAL_KEEPOUT ? goalRadius + LABEL_GAP : natural;
}

/** Lista em prosa: "a", "a e b", "a, b e c". */
function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
}

export default function GoalStellar({
  data = defaultData,
  goal = defaultGoal,
  subject = defaultSubject,
  periodLabel = defaultPeriodLabel,
  height,
  className,
}: GoalStellarProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma competência neste recorte: não há avaliação registrada para comparar com a meta.</span>
      </div>
    );
  }

  const n = data.length;
  const rings = GRID_VALUES.map((value) => ({ value, r: valueToRadius(value) }));
  const goalR = valueToRadius(goal);
  const scaleAngle = gridLabelAngle(n);
  /* O rótulo da meta fica no vão oposto ao da escala: no mesmo vão ele cairia a 5 px do anel de 75. */
  const goalPoint = polar(goalR, 360 - scaleAngle);
  /* Abaixo é estrito: índice em cima da meta cumpriu a meta e fica neutro. */
  const below = data.filter((row) => row.value < goal).sort((a, b) => a.value - b.value);
  const belowIds = new Set(below.map((row) => row.id));
  const goalText = formatInt(goal);

  const readingLine =
    below.length === 0
      ? `Nenhuma competência abaixo da meta de ${goalText}.`
      : `Abaixo da meta de ${goalText}: ${joinNames(below.map((row) => lowerFirst(row.name)))}.`;
  const belowDetail = below.map((row) => `${lowerFirst(row.name)}, com ${formatInt(row.value)}`).join('; ');
  const verdict =
    below.length === 0
      ? 'Nenhuma fica abaixo da meta.'
      : `${formatInt(below.length)} ${below.length === 1 ? 'fica' : 'ficam'} abaixo da meta: ${belowDetail}.`;
  const summary = `Gráfico estelar com ${formatInt(n)} competências de ${subject} no ${periodLabel}, índice de ${formatInt(0)} a ${formatInt(DOMAIN_MAX)}, e a meta de ${goalText} em círculo tracejado. ${verdict}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1.5 shrink-0 text-xs leading-4 font-medium text-text-secondary tabular-nums">
        {readingLine}
      </p>
      <svg aria-hidden className="min-h-0 w-full flex-1" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {rings.map((ring) => (
          <circle cx={CX} cy={CY} fill="none" key={`ring-${String(ring.value)}`} r={ring.r} stroke="var(--line-subtle)" vectorEffect="non-scaling-stroke" />
        ))}
        <circle cx={CX} cy={CY} fill="none" r={HUB_R} stroke="var(--line-strong)" vectorEffect="non-scaling-stroke" />
        {/* A meta entra antes dos espetos: assim se vê qual ponta passa do círculo e qual para antes. */}
        <circle cx={CX} cy={CY} fill="none" r={goalR} stroke={GOAL_STROKE} strokeDasharray={GOAL_DASH} vectorEffect="non-scaling-stroke" />
        {data.map((row, i) => {
          const fill = belowIds.has(row.id) ? HIGHLIGHT : NEUTRAL;
          if (row.value > 0) {
            return <path d={spike(CX, CY, i, n, valueToRadius(row.value))} fill={fill} key={`spike-${row.id}`} />;
          }
          /* Zero medido é zero (EST-3): ponto na origem do eixo, e o rótulo escreve o zero. */
          const origin = polar(HUB_R, axisAngle(i, n));
          return <circle cx={origin.x} cy={origin.y} fill={fill} key={`spike-${row.id}`} r={HALF_BASE} />;
        })}
        {rings
          .filter((ring) => ring.r * Math.sin(Math.PI / n) >= GRID_LABEL_CLEARANCE)
          .map((ring) => {
            const point = polar(ring.r, scaleAngle);
            return (
              <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={NAME_SIZE} key={`scale-${String(ring.value)}`} style={HALO_STYLE} textAnchor="middle" x={point.x} y={point.y}>
                {formatInt(ring.value)}
              </text>
            );
          })}
        <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={NAME_SIZE} style={HALO_STYLE} textAnchor="middle" x={goalPoint.x} y={goalPoint.y}>
          meta
          <tspan className="font-display" dx={VALUE_GAP}>
            {goalText}
          </tspan>
        </text>
        {data.map((row, i) => {
          const isBelow = belowIds.has(row.id);
          const valueText = formatInt(row.value);
          const box = layoutLabel(row.name, valueText, axisAngle(i, n), labelRadius(valueToRadius(row.value), goalR));
          const crossesLine = ringCrossesBox(box, goalR) || rings.some((ring) => ringCrossesBox(box, ring.r));
          return (
            <text
              className="font-sans"
              fill={isBelow ? 'var(--text-primary)' : 'var(--text-secondary)'}
              fontSize={NAME_SIZE}
              fontWeight={isBelow ? 600 : 400}
              key={`label-${row.id}`}
              style={crossesLine ? HALO_STYLE : undefined}
              textAnchor={box.anchor}
            >
              {box.lines.map((line, k) => (
                <tspan key={line} x={box.x} y={box.top + BASELINE + k * LINE_HEIGHT}>
                  {line}
                  {k === box.lines.length - 1 ? (
                    <tspan className="font-display" dx={VALUE_GAP} fontSize={VALUE_SIZE} fontWeight={isBelow ? 600 : 500}>
                      {valueText}
                    </tspan>
                  ) : null}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>
      <div aria-hidden className="mt-1.5 flex shrink-0 flex-wrap justify-center gap-x-3 text-[0.6875rem] leading-4 text-text-muted tabular-nums">
        <span>em destaque: abaixo da meta</span>
        <span>
          índice de {formatInt(0)} a {formatInt(DOMAIN_MAX)}, anéis a cada {formatInt(GRID_STEP)}
        </span>
      </div>
    </div>
  );
}

