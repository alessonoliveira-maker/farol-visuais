import { Filter } from 'lucide-react';

import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, othersCount as defaultOthersCount, type MonthlyOriginRank } from './data';

/**
 * Streamgraph ordenado em SVG puro, porque o Recharts empilha na ordem dos filhos e não reordena a
 * pilha por período. Duas decisões de geometria sustentam o desenho, e as duas são o que faltava nas
 * tentativas anteriores desta versão.
 *
 * 1. FRONTEIRA COMPARTILHADA, CALCULADA UMA VEZ. Numa pilha, a borda de cima de uma camada é a borda
 *    de baixo da vizinha. Por isso a geometria não sai camada por camada: em cada trecho de tempo o
 *    código monta UMA lista de fronteiras, do deslocamento da silhueta para cima, e cada faixa
 *    consome o mesmo objeto `Border` que a vizinha, com o mesmo par de números já arredondado em
 *    texto (`toFixed(COORD_DECIMALS)`) e os mesmos pontos de controle da cúbica. A borda que as duas
 *    dividem sai no SVG com coordenada idêntica, percorrida em sentidos opostos, então não existe
 *    recálculo equivalente para divergir e abrir fresta.
 * 2. TRAVESSIA DECLARADA. Uma pilha opaca não consegue trocar duas vizinhas de posição mantendo as
 *    duas inteiras, contínuas e ladrilhando a faixa: com espessura igual ao valor, cobrir a janela
 *    das duas exige que uma esteja colada na base e a outra no topo, o que só vale nas duas pontas
 *    do movimento. A saída aqui não é abrir vão nem cortar no meio: na troca, a origem que ULTRAPASSA
 *    atravessa inteira, em direção à base, e a ultrapassada se ABRE EM DUAS LÂMINAS, uma que afina
 *    até zero abaixo dela e outra que engrossa acima, e as duas somam exatamente a espessura da
 *    origem naquele ponto. Cada travessia ocupa um par de meses inteiro e a espessura de cada camada
 *    segue valendo o valor interpolado em qualquer x, o que a conta da interpolação linear das
 *    fronteiras entrega de graça.
 *
 * Outras regras do desenho: a ordem existe por mês, por posto simples de tamanho, com a MAIOR SEMPRE
 * NA BASE da faixa (o estudo da família admite base ou centro; base é o que mantém posto vizinho na
 * classificação como vizinho na pilha, e portanto a travessia curta); empate de valor mantém a ordem
 * do mês anterior (dois casos no dado fixo); cor fixa por origem em todos os meses; cada origem sai
 * em fita contínua, emendada trecho a trecho, partida só onde a travessia a divide em lâminas, e o
 * corte cai sempre num ponto de espessura zero; o separador da COR-5 é traço aberto sobre a
 * fronteira compartilhada, porque path fechado por mês deixaria emenda e contorno verticais a cada
 * mês, o ladrilho que a revisão anterior apontou; ordem de pintura pela ordem de chegada, ainda que
 * aqui ela seja cosmética, já que as fitas ladrilham em vez de depender de cobertura.
 */
export interface OriginRankStreamProps {
  readonly data?: readonly MonthlyOriginRank[];
  readonly othersCount?: number;
  readonly className?: string;
}

type LayerKey = Exclude<keyof MonthlyOriginRank, 'month'>;
type LayerValues = Record<LayerKey, number>;

const LAYER_KEYS: readonly LayerKey[] = [
  'referral',
  'paidSearch',
  'paidSocial',
  'content',
  'event',
  'partnership',
  'others',
];
const LAYER_LABEL: Record<LayerKey, string> = {
  referral: 'Indicação',
  paidSearch: 'Busca paga',
  paidSocial: 'Social pago',
  content: 'Conteúdo',
  event: 'Evento',
  partnership: 'Parceria',
  others: 'Outras',
};
/** Slots 1, 3, 6, 5, 2, 4 da COR-8; "Outras" é neutra e fica fora do teto de 6 cores (COR-4). */
const LAYER_COLOR: Record<LayerKey, string> = {
  referral: 'var(--chart-1)',
  paidSearch: 'var(--chart-3)',
  paidSocial: 'var(--chart-6)',
  content: 'var(--chart-5)',
  event: 'var(--chart-2)',
  partnership: 'var(--chart-4)',
  others: 'var(--line-strong)',
};

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 230;
const MARGIN = { top: 4, right: 8, bottom: 4, left: 8 } as const;
const SEPARATOR_COLOR = 'var(--surface-raised)';
const SEPARATOR_WIDTH = 1.5;
/** Um tique a cada três meses, mais o primeiro e o último do recorte. */
const TICK_EVERY = 3;
/** Casas da coordenada no path: o mesmo arredondamento nas duas faixas que dividem a fronteira. */
const COORD_DECIMALS = 2;

/** Posto por tamanho, maior primeiro (posto 0 é a base da faixa); empate mantém a ordem anterior. */
function rankOrder(values: LayerValues, previous: readonly LayerKey[] | null): LayerKey[] {
  const previousPosition = (key: LayerKey): number =>
    previous === null ? LAYER_KEYS.indexOf(key) : previous.indexOf(key);
  return [...LAYER_KEYS].sort((a, b) => values[b] - values[a] || previousPosition(a) - previousPosition(b));
}

/** Fronteiras da pilha centrada, em unidades de valor: n mais uma, da base para o topo. */
function stackEdges(order: readonly LayerKey[], values: LayerValues): number[] {
  const total = order.reduce((sum, key) => sum + values[key], 0);
  let cursor = -total / 2;
  const edges = [cursor];
  for (const key of order) {
    cursor += values[key];
    edges.push(cursor);
  }
  return edges;
}

/** Trocas de vizinhos que levam `from` a `to`, uma de cada vez, na ordem em que acontecem. */
function neighbourSwaps(from: readonly LayerKey[], to: readonly LayerKey[]): number[] {
  const arrival = new Map<LayerKey, number>(to.map((key, index) => [key, index]));
  const current = [...from];
  const positions: number[] = [];
  const arrivalOf = (key: LayerKey | undefined): number => (key === undefined ? -1 : arrival.get(key) ?? -1);
  for (let end = current.length - 1; end > 0; end -= 1) {
    for (let index = 0; index < end; index += 1) {
      const lower = current[index];
      const upper = current[index + 1];
      if (lower === undefined || upper === undefined) continue;
      if (arrivalOf(lower) > arrivalOf(upper)) {
        current[index] = upper;
        current[index + 1] = lower;
        positions.push(index);
      }
    }
  }
  return positions;
}

/** Os quatro x de um trecho, já em texto: controle nos terços, que é a cúbica horizontal. */
interface Span {
  readonly x0: string;
  readonly c1: string;
  readonly c2: string;
  readonly x1: string;
}

/** Uma fronteira do trecho: o mesmo objeto serve de topo de uma faixa e de base da faixa de cima. */
interface Border {
  readonly left: string;
  readonly right: string;
}

/** Um trecho de uma origem: as duas fronteiras que ela consome naquele par de sub nós. */
interface Tile {
  readonly key: LayerKey;
  readonly span: Span;
  readonly bottom: Border;
  readonly top: Border;
  readonly arrival: number;
}

interface Ribbon {
  readonly key: LayerKey;
  readonly d: string;
  readonly paintAt: number;
}

/**
 * Fita fechada de uma origem ao longo de vários trechos seguidos, ida pela base e volta pelo topo,
 * com os mesmos números nas duas direções. A fita é contínua de propósito: um path por trecho
 * deixaria uma emenda vertical a cada mês, que é o ladrilho que a revisão anterior apontou.
 */
function ribbonPath(tiles: readonly Tile[]): string {
  const first = tiles[0];
  const last = tiles[tiles.length - 1];
  if (!first || !last) return '';
  const parts = [`M ${first.span.x0},${first.bottom.left}`];
  for (const tile of tiles) {
    parts.push(`C ${tile.span.c1},${tile.bottom.left} ${tile.span.c2},${tile.bottom.right} ${tile.span.x1},${tile.bottom.right}`);
  }
  parts.push(`L ${last.span.x1},${last.top.right}`);
  for (let index = tiles.length - 1; index >= 0; index -= 1) {
    const tile = tiles[index];
    if (!tile) continue;
    parts.push(`C ${tile.span.c2},${tile.top.right} ${tile.span.c1},${tile.top.left} ${tile.span.x0},${tile.top.left}`);
  }
  parts.push('Z');
  return parts.join(' ');
}

/** Separador: traço aberto sobre a fronteira compartilhada, sem borda vertical nenhuma (COR-5). */
function separatorPath(segments: readonly Tile[]): string {
  const first = segments[0];
  if (!first) return '';
  const parts = [`M ${first.span.x0},${first.top.left}`];
  for (const segment of segments) {
    parts.push(`C ${segment.span.c1},${segment.top.left} ${segment.span.c2},${segment.top.right} ${segment.span.x1},${segment.top.right}`);
  }
  return parts.join(' ');
}

export default function OriginRankStream({
  data = defaultData,
  othersCount = defaultOthersCount,
  className,
}: OriginRankStreamProps) {
  const rows = [...data];

  if (rows.length < 2) {
    const message =
      rows.length === 0
        ? 'Nenhum mês neste recorte: não houve lead atribuído a origem no período.'
        : 'Um mês só neste recorte: a troca de ordem precisa de dois meses para existir.';
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  const plotWidth = VIEW_WIDTH - MARGIN.left - MARGIN.right;
  const plotHeight = VIEW_HEIGHT - MARGIN.top - MARGIN.bottom;
  const centerY = MARGIN.top + plotHeight / 2;
  const xAt = (index: number): number => MARGIN.left + (index / (rows.length - 1)) * plotWidth;

  const valuesByRow: LayerValues[] = rows.map((row) => {
    const values = {} as LayerValues;
    for (const key of LAYER_KEYS) values[key] = row[key];
    return values;
  });
  const totals = valuesByRow.map((values) => LAYER_KEYS.reduce((sum, key) => sum + values[key], 0));
  const halfExtent = Math.max(...totals) / 2;
  const yAt = (value: number): number => centerY - (value / halfExtent) * (plotHeight / 2);

  let previousOrder: LayerKey[] | null = null;
  const orders: LayerKey[][] = valuesByRow.map((values) => {
    const order = rankOrder(values, previousOrder);
    previousOrder = order;
    return order;
  });

  const tilesBySpan: Tile[][] = [];
  const separators: string[] = [];
  const openSeparators = new Map<string, Tile[]>();
  const fixed = (value: number): string => value.toFixed(COORD_DECIMALS);

  for (let index = 0; index < rows.length - 1; index += 1) {
    const fromOrder = orders[index];
    const toOrder = orders[index + 1];
    const fromValues = valuesByRow[index];
    const toValues = valuesByRow[index + 1];
    if (!fromOrder || !toOrder || !fromValues || !toValues) continue;

    const swaps = neighbourSwaps(fromOrder, toOrder);
    const steps = Math.max(1, swaps.length);
    const spanWidth = (xAt(index + 1) - xAt(index)) / steps;
    // Valor de cada origem no sub nó, interpolado no tempo; a curva da fronteira faz o resto.
    const valuesAt = (fraction: number): LayerValues => {
      const values = {} as LayerValues;
      for (const key of LAYER_KEYS) values[key] = fromValues[key] + (toValues[key] - fromValues[key]) * fraction;
      return values;
    };

    let stepOrder = [...fromOrder];
    for (let step = 0; step < steps; step += 1) {
      const leftValues = valuesAt(step / steps);
      const rightValues = valuesAt((step + 1) / steps);
      const leftOrder = [...stepOrder];
      const swapAt = swaps[step];
      const rightOrder = [...stepOrder];
      if (swapAt !== undefined) {
        const lower = rightOrder[swapAt];
        const upper = rightOrder[swapAt + 1];
        if (lower !== undefined && upper !== undefined) {
          rightOrder[swapAt] = upper;
          rightOrder[swapAt + 1] = lower;
        }
      }
      stepOrder = [...rightOrder];

      const x0 = xAt(index) + step * spanWidth;
      const x1 = x0 + spanWidth;
      const span: Span = {
        x0: fixed(x0),
        c1: fixed(x0 + spanWidth / 3),
        c2: fixed(x0 + (2 * spanWidth) / 3),
        x1: fixed(x1),
      };
      const leftEdges = stackEdges(leftOrder, leftValues).map((value) => fixed(yAt(value)));
      const rightEdges = stackEdges(rightOrder, rightValues).map((value) => fixed(yAt(value)));
      const edge = (source: readonly string[], position: number): string => source[position] ?? '0';
      const plainBorder = (position: number): Border => ({
        left: edge(leftEdges, position),
        right: edge(rightEdges, position),
      });

      const borders: Border[] = [];
      const owners: LayerKey[] = [];
      if (swapAt === undefined) {
        for (let position = 0; position <= leftOrder.length; position += 1) borders.push(plainBorder(position));
        for (const key of leftOrder) owners.push(key);
      } else {
        // A ultrapassada sai da posição `swapAt`; quem ultrapassa vem de cima e atravessa inteira.
        const passed = leftOrder[swapAt];
        const passer = leftOrder[swapAt + 1];
        for (let position = 0; position <= swapAt; position += 1) borders.push(plainBorder(position));
        for (let position = 0; position < swapAt; position += 1) {
          const key = leftOrder[position];
          if (key !== undefined) owners.push(key);
        }
        // Base e topo de quem atravessa: saem da posição de cima e chegam na de baixo.
        borders.push({ left: edge(leftEdges, swapAt + 1), right: edge(rightEdges, swapAt) });
        borders.push({ left: edge(leftEdges, swapAt + 2), right: edge(rightEdges, swapAt + 1) });
        if (passed !== undefined && passer !== undefined) owners.push(passed, passer, passed);
        for (let position = swapAt + 2; position <= leftOrder.length; position += 1) borders.push(plainBorder(position));
        for (let position = swapAt + 2; position < leftOrder.length; position += 1) {
          const key = leftOrder[position];
          if (key !== undefined) owners.push(key);
        }
      }

      // Em ordem da base para o topo; quem pinta antes fica na ordem de chegada, mais abaixo.
      const spanTiles: Tile[] = [];
      owners.forEach((key, position) => {
        const bottom = borders[position];
        const top = borders[position + 1];
        if (!bottom || !top) return;
        spanTiles.push({ key, span, bottom, top, arrival: rightOrder.indexOf(key) });
      });
      tilesBySpan.push(spanTiles);

      // Separador por PAR de vizinhas: enquanto as mesmas duas seguem coladas, o traço continua.
      const spanSeparators = new Map<string, Tile>();
      for (let position = 0; position < spanTiles.length - 1; position += 1) {
        const below = spanTiles[position];
        const above = spanTiles[position + 1];
        if (below && above) spanSeparators.set(`${below.key}|${above.key}`, below);
      }
      for (const [id, chain] of openSeparators) {
        if (spanSeparators.has(id)) continue;
        separators.push(separatorPath(chain));
        openSeparators.delete(id);
      }
      for (const [id, tile] of spanSeparators) {
        const chain = openSeparators.get(id) ?? [];
        chain.push(tile);
        openSeparators.set(id, chain);
      }
    }
  }

  for (const chain of openSeparators.values()) separators.push(separatorPath(chain));

  /**
   * Uma fita por origem, emendando trecho a trecho enquanto a origem for uma faixa só. Na travessia
   * a ultrapassada tem duas faixas no mesmo trecho: a de baixo fecha a fita que vinha (ela chega
   * com espessura zero do outro lado) e a de cima abre a fita que segue, então a emenda cai sempre
   * num ponto de espessura zero e nenhuma borda vertical aparece dentro da faixa.
   */
  const ribbons: Ribbon[] = [];
  for (const key of LAYER_KEYS) {
    let open: Tile[] = [];
    const close = (): void => {
      if (open.length === 0) return;
      const last = open[open.length - 1];
      ribbons.push({ key, d: ribbonPath(open), paintAt: last ? last.arrival : 0 });
      open = [];
    };
    for (const spanTiles of tilesBySpan) {
      const mine = spanTiles.filter((tile) => tile.key === key);
      const lower = mine[0];
      const upper = mine[1];
      if (!lower) continue;
      open.push(lower);
      if (upper) {
        close();
        open.push(upper);
      }
    }
    close();
  }
  // Ordem de pintura pela ordem de CHEGADA de cada fita, da base para o topo da pilha de destino.
  ribbons.sort((a, b) => a.paintAt - b.paintAt);

  const firstOrder = orders[0] ?? [];
  const lastOrder = orders[orders.length - 1] ?? [];
  const firstRow = rows[0];
  const lastRow = rows[rows.length - 1];
  const moveOf = (key: LayerKey): number => firstOrder.indexOf(key) - lastOrder.indexOf(key);
  const climber = LAYER_KEYS.reduce((best, key) => (moveOf(key) > moveOf(best) ? key : best), LAYER_KEYS[0] ?? 'others');
  const faller = LAYER_KEYS.reduce((worst, key) => (moveOf(key) < moveOf(worst) ? key : worst), LAYER_KEYS[0] ?? 'others');
  const rankText = (order: readonly LayerKey[], key: LayerKey): string => `${formatInt(order.indexOf(key) + 1)}º`;
  const swapCount = orders.slice(1).reduce((sum, order, position) => {
    const previous = orders[position];
    return previous ? sum + neighbourSwaps(previous, order).length : sum;
  }, 0);
  const totalsByKey = LAYER_KEYS.reduce((acc, key) => {
    acc[key] = rows.reduce((sum, row) => sum + row[key], 0);
    return acc;
  }, {} as LayerValues);

  const tickIndices = rows
    .map((_row, index) => index)
    .filter((index) => index % TICK_EVERY === 0 || index === rows.length - 1);
  // Legenda na ordem visual da pilha do último mês, lida de cima para baixo (ROT-4).
  const legendOrder = [...lastOrder].reverse();

  const summary = [
    `Streamgraph ordenado com ${formatInt(LAYER_KEYS.length)} origens de lead em ${formatInt(rows.length)} meses, sem eixo numérico:`,
    `a ordem por tamanho muda ${formatInt(swapCount)} vezes.`,
    firstRow && lastRow
      ? `${LAYER_LABEL[climber]} sai do ${rankText(firstOrder, climber)} posto em ${formatMonthShort(firstRow.month)} e chega ao ${rankText(lastOrder, climber)} em ${formatMonthShort(lastRow.month)}; ${LAYER_LABEL[faller]} cai do ${rankText(firstOrder, faller)} ao ${rankText(lastOrder, faller)}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure">
      <p aria-hidden className="mb-1 shrink-0 text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{LAYER_LABEL[climber]}</span> sai do{' '}
        {rankText(firstOrder, climber)} posto e chega ao {rankText(lastOrder, climber)};{' '}
        <span className="font-semibold text-text-primary">{LAYER_LABEL[faller]}</span> cai do{' '}
        {rankText(firstOrder, faller)} ao {rankText(lastOrder, faller)}, em {formatInt(swapCount)} trocas de posto.
      </p>
      <p aria-hidden className="mb-2 shrink-0 text-[0.6875rem] text-text-muted">
        Forma sem eixo numérico: mostra a ordem de tamanho e a travessia de cada troca, não o valor exato de um mês; na
        legenda, o total de leads de cada origem nos {formatInt(rows.length)} meses.
      </p>
      <div className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
        {legendOrder.map((key) => (
          <span className="flex items-center gap-1 text-xs text-text-secondary" key={key}>
            <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: LAYER_COLOR[key] }} />
            {key === 'others' ? `Outras (n=${formatInt(othersCount)})` : LAYER_LABEL[key]}{' '}
            <span className="kpi-number text-sm font-semibold text-text-primary">{formatInt(totalsByKey[key])}</span>
          </span>
        ))}
      </div>
      <div className="flex h-full min-h-0 w-full flex-1 flex-col">
        <svg
          aria-hidden
          className="min-h-0 w-full flex-1"
          preserveAspectRatio="none"
          viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}
        >
          {/* Já na ordem de chegada; as fitas ladrilham, então a ordem de pintura não é o que evita
              vão: o que evita é a fronteira compartilhada (ver comentário do topo). */}
          {ribbons.map((ribbon, position) => (
            <path d={ribbon.d} fill={LAYER_COLOR[ribbon.key]} key={`${ribbon.key}-${String(position)}`} />
          ))}
          {separators.map((d, position) => (
            <path
              d={d}
              fill="none"
              key={`separador-${String(position)}`}
              stroke={SEPARATOR_COLOR}
              strokeWidth={SEPARATOR_WIDTH}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {/* Eixo de mês em HTML, fora do viewBox escalado: preserveAspectRatio="none" serve à forma
            orgânica, mas achataria texto (TIP-5) se o tique fosse um <text> do SVG. */}
        <div aria-hidden className="relative h-4 w-full shrink-0">
          {tickIndices.map((index, position) => {
            const row = rows[index];
            if (!row) return null;
            const isFirst = position === 0;
            const isLast = position === tickIndices.length - 1;
            const shift = isFirst ? '0%' : isLast ? '-100%' : '-50%';
            return (
              <span
                className="absolute top-0 whitespace-nowrap text-[0.6875rem] leading-none text-text-muted"
                key={row.month}
                style={{ left: `${String((xAt(index) / VIEW_WIDTH) * 100)}%`, transform: `translateX(${shift})` }}
              >
                {formatMonthShort(row.month)}
              </span>
            );
          })}
        </div>
      </div>
    </figure>
  );
}
