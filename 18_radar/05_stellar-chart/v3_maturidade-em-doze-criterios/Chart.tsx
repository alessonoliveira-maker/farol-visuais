import { Filter } from 'lucide-react';

import { formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, subject as defaultSubject, type MaturityCriterion } from './data';

/**
 * Stellar chart de doze eixos: um espeto afinado por critério, com o nome no raio externo fixo e
 * a lista dos mais baixos ao lado. Mostra onde estão as lacunas de maturidade antes do orçamento.
 * A largura do espeto não depende do valor, então a área cresce em linha com o índice, e não com
 * o quadrado dele; a leitura é pelo comprimento contra os anéis.
 */
export interface MaturityStellarProps {
  readonly data?: readonly MaturityCriterion[];
  readonly subject?: string;
  readonly height?: number;
  readonly className?: string;
}

/**
 * viewBox do tamanho que a estrela recebe no canvas de 640 por 412: corpo de 574 menos a lista de
 * 160 e o vão de 16, para a escala sair 1 (GEO-18).
 */
const VIEW_W = 398;
const VIEW_H = 276;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const DOMAIN_MAX = 100;
const GRID_STEP = 25;
const GRID_VALUES = [GRID_STEP, GRID_STEP * 2, GRID_STEP * 3, GRID_STEP * 4] as const;
/** Só os anéis de 50 e 100 levam número: com 21 px entre anéis, o 75 fica a 3 px do 100. */
const SCALE_LABEL_STEP = GRID_STEP * 2;
/** Anel do zero. Com doze eixos, 16 px deixam 2 px de vão entre as bases vizinhas. */
const HUB_R = 16;
const OUTER_R = 100;
/** Meia largura na base e na ponta. As duas são fixas, e é isso que mantém a área linear no valor. */
const HALF_BASE = 3;
const HALF_TIP = 1;
/** Raio fixo dos rótulos: não acompanha o valor, então doze nomes nunca disputam a ponta dos espetos. */
const LABEL_R = OUTER_R + 10;
/** Folga entre a borda de um rótulo centralizado e a âncora do vizinho. */
const POLE_CLEARANCE = 8;
/** Quantos critérios a lista ao lado traz; empate no corte entra inteiro. */
const LOWEST_COUNT = 3;
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
 * do vizinho. O rótulo do topo e o da base crescem para os dois lados; passando disso, a borda
 * dele entra por baixo do primeiro rótulo lateral.
 */
function minNeighbourDeg(width: number): number {
  return (Math.asin(Math.min(1, (width / 2 + POLE_CLEARANCE) / LABEL_R)) * 180) / Math.PI;
}

/**
 * Rótulo no raio externo fixo. A âncora sai do quadrante: `start` à direita, `end` à esquerda e
 * `middle` no topo e na base. O bloco sobe no topo, centra nos lados e desce na base, e o nome só
 * fica em uma linha se couber até a borda e, no polo, se respeitar o passo angular dos vizinhos.
 */
function layoutLabel(name: string, valueText: string, angleDeg: number, stepDeg: number): LabelBox {
  const a = toRad(angleDeg);
  const sin = Math.sin(a);
  const anchor: Anchor = Math.abs(sin) < POLE_SIN ? 'middle' : sin > 0 ? 'start' : 'end';
  const point = polar(LABEL_R, angleDeg);
  const valueWidth = VALUE_GAP + valueText.length * VALUE_CHAR_W;
  const oneLine = name.length * NAME_CHAR_W + valueWidth;
  const room = anchor === 'middle' ? VIEW_W - EDGE_PAD * 2 : (anchor === 'start' ? VIEW_W - point.x : point.x) - EDGE_PAD;
  const fitsOneLine = oneLine <= room && (anchor !== 'middle' || minNeighbourDeg(oneLine) <= stepDeg);
  const lines = fitsOneLine ? [name] : splitBalanced(name, Math.ceil(valueWidth / NAME_CHAR_W));
  const height = lines.length * LINE_HEIGHT;
  return { lines, anchor, x: point.x, top: point.y - (height / 2) * (1 + Math.cos(a)) };
}

/** Nome de eixo no meio de uma oração: sem a maiúscula de rótulo. */
function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Os critérios de menor índice, do menor para o maior. Empate no corte entra inteiro. */
function lowestOf(rows: readonly MaturityCriterion[]): readonly MaturityCriterion[] {
  const sorted = [...rows].sort((x, y) => x.value - y.value);
  const cut = sorted[LOWEST_COUNT - 1];
  if (cut === undefined) return sorted;
  return sorted.filter((row) => row.value <= cut.value);
}

/** Média dos índices, ou `null` quando não há linha (EST-1b): lista vazia não tem média zero. */
function averageOf(rows: readonly MaturityCriterion[]): number | null {
  if (rows.length === 0) return null;
  return rows.reduce((sum, row) => sum + row.value, 0) / rows.length;
}

/** Maior índice da lista, ou `null` quando não há linha (EST-1b). No empate vale a ordem do registry. */
function highestOf(rows: readonly MaturityCriterion[]): MaturityCriterion | null {
  return rows.reduce<MaturityCriterion | null>((best, row) => (best === null || row.value > best.value ? row : best), null);
}

export default function MaturityStellar({ data = defaultData, subject = defaultSubject, height, className }: MaturityStellarProps) {
  const style = height === undefined ? undefined : { height };
  const average = averageOf(data);
  const highest = highestOf(data);

  if (average === null || highest === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum critério neste recorte: a avaliação de maturidade ainda não foi registrada.</span>
      </div>
    );
  }

  const n = data.length;
  const stepDeg = 360 / n;
  const rings = GRID_VALUES.map((value) => ({ value, r: valueToRadius(value) }));
  const scaleAngle = gridLabelAngle(n);
  const lowest = lowestOf(data);
  const lowestIds = new Set(lowest.map((row) => row.id));
  const lowestDetail = lowest.map((row) => `${lowerFirst(row.name)}, ${formatInt(row.value)}`).join('; ');

  const summary = `Gráfico estelar da maturidade da ${subject} em ${formatInt(n)} critérios, de ${formatInt(0)} a ${formatInt(DOMAIN_MAX)}, com média de ${formatDecimal(average, 1)}. Mais baixos: ${lowestDetail}. Mais alto: ${lowerFirst(highest.name)}, ${formatInt(highest.value)}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-stretch gap-4', className)} role="img" style={style}>
      <svg aria-hidden className="h-full min-w-0 flex-1" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {rings.map((ring) => (
          <circle cx={CX} cy={CY} fill="none" key={`ring-${String(ring.value)}`} r={ring.r} stroke="var(--line-subtle)" vectorEffect="non-scaling-stroke" />
        ))}
        <circle cx={CX} cy={CY} fill="none" r={HUB_R} stroke="var(--line-strong)" vectorEffect="non-scaling-stroke" />
        {data.map((row, i) => {
          if (row.value > 0) {
            return <path d={spike(CX, CY, i, n, valueToRadius(row.value))} fill="var(--chart-1)" key={`spike-${row.id}`} />;
          }
          /* Zero medido é zero (EST-3): ponto na origem do eixo, e o rótulo escreve o zero. */
          const origin = polar(HUB_R, axisAngle(i, n));
          return <circle cx={origin.x} cy={origin.y} fill="var(--chart-1)" key={`spike-${row.id}`} r={HALF_BASE} />;
        })}
        {rings
          .filter((ring) => ring.value % SCALE_LABEL_STEP === 0 && ring.r * Math.sin(Math.PI / n) >= GRID_LABEL_CLEARANCE)
          .map((ring) => {
            const point = polar(ring.r, scaleAngle);
            return (
              <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={NAME_SIZE} key={`scale-${String(ring.value)}`} style={HALO_STYLE} textAnchor="middle" x={point.x} y={point.y}>
                {formatInt(ring.value)}
              </text>
            );
          })}
        {data.map((row, i) => {
          const isLowest = lowestIds.has(row.id);
          const valueText = formatInt(row.value);
          const box = layoutLabel(row.name, valueText, axisAngle(i, n), stepDeg);
          return (
            <text className="font-sans" fill={isLowest ? 'var(--text-primary)' : 'var(--text-secondary)'} fontSize={NAME_SIZE} fontWeight={isLowest ? 600 : 400} key={`label-${row.id}`} textAnchor={box.anchor}>
              {box.lines.map((line, k) => (
                <tspan key={line} x={box.x} y={box.top + BASELINE + k * LINE_HEIGHT}>
                  {line}
                  {k === box.lines.length - 1 ? (
                    <tspan className="font-display" dx={VALUE_GAP} fill="var(--text-primary)" fontSize={VALUE_SIZE} fontWeight={isLowest ? 600 : 500}>
                      {valueText}
                    </tspan>
                  ) : null}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>
      <div aria-hidden className="flex w-40 shrink-0 flex-col justify-center gap-3">
        <p className="text-xs leading-4 font-medium text-text-secondary tabular-nums">{formatInt(lowest.length)} critérios mais baixos</p>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {lowest.map((row) => (
            <li className="flex items-baseline justify-between gap-3" key={row.id}>
              <span className="min-w-0 text-xs leading-4 font-semibold text-text-primary">{row.name}</span>
              <span className="font-display shrink-0 text-sm leading-4 font-semibold text-text-primary">{formatInt(row.value)}</span>
            </li>
          ))}
        </ul>
        <p className="text-[0.6875rem] leading-4 text-text-muted tabular-nums">
          média dos {formatInt(n)} critérios: {formatDecimal(average, 1)}
        </p>
        <p className="text-[0.6875rem] leading-4 text-text-muted tabular-nums">
          comprimento do espeto: índice de {formatInt(0)} a {formatInt(DOMAIN_MAX)}; anéis a cada {formatInt(GRID_STEP)} pontos
        </p>
      </div>
    </div>
  );
}

