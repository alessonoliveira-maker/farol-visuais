import { Filter } from 'lucide-react';

import { formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periodLabel as defaultPeriodLabel, type IndicatorScore } from './data';

/**
 * Stellar chart com os três estados de um eixo: índice medido vira espeto, zero medido vira ponto
 * sobre o anel do zero e indicador sem medição vira raio tracejado, sem ponto. Existe para o zero
 * e a ausência não lerem como o mesmo eixo vazio. A largura do espeto não depende do valor, então
 * a área cresce em linha com o índice, e não com o quadrado dele.
 */
export interface IndicatorStellarProps {
  readonly data?: readonly IndicatorScore[];
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
/** Anel do zero. Tem 20 px para o ponto do zero medido não encostar nas bases dos espetos vizinhos. */
const HUB_R = 20;
const OUTER_R = 112;
/** Meia largura na base e na ponta. As duas são fixas, e é isso que mantém a área linear no valor. */
const HALF_BASE = 3;
const HALF_TIP = 1;
/** Ponto do zero medido: maior que a base do espeto, para se ver entre dois vizinhos altos. */
const ZERO_DOT_R = 5;
const MISSING_STROKE = 'var(--text-muted)';
const MISSING_DASH = '3 3';
/** Raio fixo dos rótulos: não acompanha o valor, então pontas em 95 e 97 não disputam espaço com eles. */
const LABEL_R = OUTER_R + 10;
/** Folga entre a borda de um rótulo centralizado e a âncora do vizinho. */
const POLE_CLEARANCE = 8;
/** Abaixo desta distância em graus, o eixo é o próprio polo e não um vizinho dele. */
const SAME_AXIS_DEG = 0.5;
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
/** Halo da ROT-7: o rótulo da escala nasce em cima do anel que ele nomeia. */
const HALO_STYLE = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

type Anchor = 'start' | 'middle' | 'end';

interface LabelBox {
  readonly lines: readonly string[];
  readonly anchor: Anchor;
  readonly x: number;
  readonly top: number;
  readonly width: number;
}

/** Indicador com índice medido acima de zero: é o que desenha espeto. */
interface ScoredIndicator {
  readonly id: string;
  readonly name: string;
  readonly value: number;
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
 * Distância angular mínima, em graus, entre um rótulo centralizado de largura `width` e a âncora
 * do vizinho. O rótulo do topo e o da base crescem para os dois lados; abaixo dessa distância a
 * borda dele entra por baixo do primeiro rótulo lateral.
 */
function minNeighbourDeg(width: number): number {
  return (Math.asin(Math.min(1, (width / 2 + POLE_CLEARANCE) / LABEL_R)) * 180) / Math.PI;
}

/**
 * Rótulo no raio externo fixo, com âncora pelo quadrante. `tail` é o valor, escrito na última
 * linha do nome, ou a palavra de ausência, que ganha linha própria (`tailInline` falso). O nome
 * só fica em uma linha se couber até a borda e, no polo, se o passo dos vizinhos respeitar o
 * mínimo em graus; senão quebra em duas, que é a primeira saída da anticolisão.
 */
function layoutLabel(name: string, tail: string, tailInline: boolean, angleDeg: number, stepDeg: number): LabelBox {
  const a = toRad(angleDeg);
  const sin = Math.sin(a);
  const anchor: Anchor = Math.abs(sin) < POLE_SIN ? 'middle' : sin > 0 ? 'start' : 'end';
  const point = polar(LABEL_R, angleDeg);
  const tailWidth = tailInline ? VALUE_GAP + tail.length * VALUE_CHAR_W : 0;
  const ownLineWidth = tailInline ? 0 : tail.length * NAME_CHAR_W;
  const oneLine = Math.max(name.length * NAME_CHAR_W + tailWidth, ownLineWidth);
  const room = anchor === 'middle' ? VIEW_W - EDGE_PAD * 2 : (anchor === 'start' ? VIEW_W - point.x : point.x) - EDGE_PAD;
  const fitsOneLine = oneLine <= room && (anchor !== 'middle' || minNeighbourDeg(oneLine) <= stepDeg);
  const lines = fitsOneLine ? [name] : splitBalanced(name, Math.ceil(tailWidth / NAME_CHAR_W));
  const last = lines[lines.length - 1] ?? name;
  const width = Math.max(...lines.map((line) => line.length * NAME_CHAR_W), last.length * NAME_CHAR_W + tailWidth, ownLineWidth);
  const height = (lines.length + (tailInline ? 0 : 1)) * LINE_HEIGHT;
  return { lines, anchor, x: point.x, top: point.y - (height / 2) * (1 + Math.cos(a)), width };
}

/**
 * Segunda saída da anticolisão, também em graus: se mesmo quebrado o rótulo do polo pede mais
 * distância do que o passo dos eixos dá, a âncora do rótulo vizinho se afasta do polo até o
 * mínimo. Só o rótulo anda; o espeto fica no ângulo do eixo.
 */
function spreadFromPoles(angles: readonly number[], poles: readonly { readonly pole: number; readonly need: number }[]): readonly number[] {
  return angles.map((angle) => {
    let resolved = angle;
    for (const { pole, need } of poles) {
      const delta = ((angle - pole + 540) % 360) - 180;
      if (Math.abs(delta) > SAME_AXIS_DEG && Math.abs(delta) < need) resolved = pole + Math.sign(delta) * need;
    }
    return resolved;
  });
}

/** Nome de eixo no meio de uma oração: sem a maiúscula de rótulo. */
function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Lista em prosa: "a", "a e b", "a, b e c"; lista vazia devolve `nenhum`. */
function joinNames(names: readonly string[]): string {
  if (names.length === 0) return 'nenhum';
  if (names.length === 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
}

function isScored(row: IndicatorScore): row is ScoredIndicator {
  return row.value !== null && row.value > 0;
}

/** Maior índice entre os medidos acima de zero, ou `null` quando não há nenhum (EST-1b). */
function highestOf(rows: readonly ScoredIndicator[]): ScoredIndicator | null {
  return rows.reduce<ScoredIndicator | null>((best, row) => (best === null || row.value > best.value ? row : best), null);
}

/** Menor índice entre os medidos acima de zero, ou `null` quando não há nenhum (EST-1b). */
function lowestOf(rows: readonly ScoredIndicator[]): ScoredIndicator | null {
  return rows.reduce<ScoredIndicator | null>((best, row) => (best === null || row.value < best.value ? row : best), null);
}

export default function IndicatorStellar({ data = defaultData, periodLabel = defaultPeriodLabel, height, className }: IndicatorStellarProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum indicador neste recorte: não há eixo para desenhar, medido ou não.</span>
      </div>
    );
  }

  const n = data.length;
  const stepDeg = 360 / n;
  const rings = GRID_VALUES.map((value) => ({ value, r: valueToRadius(value) }));
  const scaleAngle = gridLabelAngle(n);
  const axisAngles = data.map((_, i) => axisAngle(i, n));
  const tails = data.map((row) => (row.value === null ? formatUnavailable() : formatInt(row.value)));
  const layoutAt = (angles: readonly number[]): readonly LabelBox[] =>
    data.map((row, i) => layoutLabel(row.name, tails[i] ?? '', row.value !== null, angles[i] ?? 0, stepDeg));
  /* Duas passadas: a primeira mede o rótulo de cada polo, a segunda posiciona todos já afastados. */
  const poles = layoutAt(axisAngles).flatMap((box, i) => (box.anchor === 'middle' ? [{ pole: axisAngles[i] ?? 0, need: minNeighbourDeg(box.width) }] : []));
  const boxes = layoutAt(spreadFromPoles(axisAngles, poles));

  const scored = data.filter(isScored);
  const highest = highestOf(scored);
  const lowest = lowestOf(scored);
  const zeroNames = joinNames(data.filter((row) => row.value === 0).map((row) => lowerFirst(row.name)));
  const missingNames = joinNames(data.filter((row) => row.value === null).map((row) => lowerFirst(row.name)));
  const others =
    highest !== null && lowest !== null
      ? ` Dos outros ${formatInt(scored.length)}, o maior é ${lowerFirst(highest.name)}, ${formatInt(highest.value)}, e o menor é ${lowerFirst(lowest.name)}, ${formatInt(lowest.value)}.`
      : '';
  const summary = `Gráfico estelar com ${formatInt(n)} indicadores comerciais no ${periodLabel}, de ${formatInt(0)} a ${formatInt(DOMAIN_MAX)}. Medido em zero: ${zeroNames}. Ainda não medido: ${missingNames}.${others}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {/* A legenda vem primeiro e tem a forma das duas marcas de exceção: é ela que separa zero de ausência. */}
      <div aria-hidden className="mb-1.5 flex shrink-0 flex-wrap items-center gap-x-4 text-xs leading-4 font-medium text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 shrink-0 rounded-full bg-chart-1" />
          medido em zero
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 shrink-0 border-t-[1.5px] border-dashed border-text-muted" />
          ainda não medido
        </span>
      </div>
      <svg aria-hidden className="min-h-0 w-full flex-1" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {rings.map((ring) => (
          <circle cx={CX} cy={CY} fill="none" key={`ring-${String(ring.value)}`} r={ring.r} stroke="var(--line-subtle)" vectorEffect="non-scaling-stroke" />
        ))}
        <circle cx={CX} cy={CY} fill="none" r={HUB_R} stroke="var(--line-strong)" vectorEffect="non-scaling-stroke" />
        {data.map((row, i) => {
          const angle = axisAngles[i] ?? 0;
          const origin = polar(HUB_R, angle);
          if (row.value === null) {
            /* Sem medição não é zero (DAD-2): raio tracejado do anel do zero ao anel externo, sem ponto. */
            const end = polar(OUTER_R, angle);
            return <line key={`mark-${row.id}`} stroke={MISSING_STROKE} strokeDasharray={MISSING_DASH} strokeWidth={1.5} vectorEffect="non-scaling-stroke" x1={origin.x} x2={end.x} y1={origin.y} y2={end.y} />;
          }
          if (row.value <= 0) {
            /* Zero medido é zero (EST-3): ponto cheio sobre o anel do zero, na origem do próprio eixo. */
            return <circle cx={origin.x} cy={origin.y} fill="var(--chart-1)" key={`mark-${row.id}`} r={ZERO_DOT_R} stroke="var(--surface-raised)" strokeWidth={1.5} />;
          }
          return <path d={spike(CX, CY, i, n, valueToRadius(row.value))} fill="var(--chart-1)" key={`mark-${row.id}`} />;
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
        {data.map((row, i) => {
          const box = boxes[i];
          const tail = tails[i] ?? '';
          if (box === undefined) return null;
          const isMissing = row.value === null;
          return (
            <text className="font-sans" fill="var(--text-secondary)" fontSize={NAME_SIZE} fontWeight={500} key={`label-${row.id}`} textAnchor={box.anchor}>
              {box.lines.map((line, k) => (
                <tspan key={line} x={box.x} y={box.top + BASELINE + k * LINE_HEIGHT}>
                  {line}
                  {!isMissing && k === box.lines.length - 1 ? (
                    <tspan className="font-display" dx={VALUE_GAP} fill="var(--text-primary)" fontSize={VALUE_SIZE} fontWeight={600}>
                      {tail}
                    </tspan>
                  ) : null}
                </tspan>
              ))}
              {isMissing ? (
                <tspan fill="var(--text-muted)" fontWeight={400} x={box.x} y={box.top + BASELINE + box.lines.length * LINE_HEIGHT}>
                  {tail}
                </tspan>
              ) : null}
            </text>
          );
        })}
      </svg>
      <div aria-hidden className="mt-1.5 flex shrink-0 flex-wrap justify-center gap-x-3 text-[0.6875rem] leading-4 text-text-muted tabular-nums">
        <span>
          comprimento do espeto: índice de {formatInt(0)} a {formatInt(DOMAIN_MAX)}
        </span>
        <span>anéis a cada {formatInt(GRID_STEP)} pontos</span>
      </div>
    </div>
  );
}

