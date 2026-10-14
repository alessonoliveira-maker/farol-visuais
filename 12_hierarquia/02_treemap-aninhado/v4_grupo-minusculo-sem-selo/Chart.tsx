import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { ResponsiveContainer, Treemap, type TreemapNode } from 'recharts';

import { formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CostLayer } from './data';

/**
 * Treemap aninhado de duas camadas de custo em que uma camada é minúscula, e o que esta versão
 * demonstra é a REGRA DE CORTE do rótulo: escala é o que não se negocia, rótulo é.
 *
 * A camada só ganha faixa de cabeçalho quando o nome e o total dela cabem juntos dentro da faixa;
 * a rubrica só ganha rótulo quando o nome e o valor dela cabem juntos dentro da célula. Nos dois
 * casos o teste é do PAR, porque identificação pela metade não é identificação, e nos dois casos a
 * saída do que não cabe é a lista fora do desenho, nunca um retângulo aumentado para o texto caber
 * nem um texto que atravessa a borda e invade o vizinho.
 *
 * Por que a conta de largura SUPERESTIMA aqui: num treemap o rótulo que transborda cai sobre a
 * célula vizinha, e nenhuma guarda do `npm run check` mede invasão entre células. No caso geral
 * subestimar é o lado seguro, porque a peça desenha e a COLISAO-TEXTO acusa o encontro de tinta;
 * aqui é o contrário, então a conta erra para cima e esconder o rótulo é o desfecho aceitável.
 *
 * Por que o Recharts reparte só o primeiro nível: o `nodeInset` dele recua os quatro lados do pai
 * pela mesma medida, então uma faixa reservada só no topo não existe nele, e num grupo minúsculo o
 * recuo dos quatro lados comeria a área inteira dos filhos. Repartindo as rubricas aqui, a faixa
 * sai do topo, some quando não cabe, e a camada sem espaço interno é pintada cheia, porque a área
 * dela é a soma das rubricas e um contorno vazio de poucos pixels faria a camada desaparecer.
 */
export interface TinyLayerTreemapProps {
  readonly data?: readonly CostLayer[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Cor da camada pelo `slot` gravado no dado, na ordem de slot da COR-8 (1, 3, 6, 5, 2, 4).
 * `--chart-2` e `--chart-4` ficam por último porque repetem o hex de `--warning` e de `--positive`.
 * São seis slots e seis camadas, o teto exato da COR-4; `--chart-7` e `--chart-8` ficam fora, e o
 * segundo deles não aceita texto nenhum por dentro em nenhum dos dois temas.
 */
const LAYER_COLORS = ['--chart-1', '--chart-3', '--chart-6', '--chart-5', '--chart-2', '--chart-4'] as const;

/**
 * Texto dentro da rubrica, vazado na cor do cartão: mede de 5,34:1 a 6,18:1 sobre as seis cores de
 * camada, no tema que reprova primeiro. Vazado e SEM halo, pela ROT-7b: o halo também é a cor da
 * superfície, e no tema claro os dois são o mesmo branco, então o halo apagaria a letra. A pergunta
 * que decide é uma só, e aqui a resposta é sim, o texto tem a marca inteira por baixo, porque só
 * desenha quando cabe dentro da própria rubrica.
 */
const CELL_TEXT = 'var(--surface-raised)';

const LAYER_RADIUS = 6;
const LEAF_RADIUS = 3;
const LAYER_STROKE_WIDTH = 2;
/**
 * Vão entre camadas: 2 px, e não 4, porque o vão é absoluto e cobra o mesmo de toda camada, então
 * a camada minúscula perde proporcionalmente muito mais área que as grandes. 2 px é o piso da
 * COR-5 para separar vizinhos que não contrastam entre si.
 */
const LAYER_GAP = 2;
/**
 * Faixa de cabeçalho no topo da camada, reservada ANTES de repartir as rubricas. 18 px, e não 17,
 * pelo piso da ESP-2: texto de 11 px escrito dentro de uma marca pede 11 mais 6 px de espessura, e
 * o grau extra deixa 1 px de folga.
 */
const LAYER_HEADER_HEIGHT = 18;
/** Respiro do bloco de rubricas contra o contorno da camada, nos três lados sem cabeçalho. */
const LAYER_PAD = 3;
/** Contorno na cor do cartão que separa rubricas coladas (COR-5), sem mexer no preenchimento. */
const LEAF_SEPARATOR_WIDTH = 2;
const LABEL_FONT_SIZE = 11;
/**
 * Distância entre linhas de texto. A tinta de uma linha de 11 px vai de 0,72 em acima da linha de
 * base a 0,10 em abaixo, isto é 9,02 px, então 14 px deixam 4,98 px de respiro entre duas linhas,
 * acima do respiro de 4 px que a COLISAO-TEXTO cobra entre dois textos vizinhos.
 */
const LABEL_LINE_HEIGHT = 14;
/** Da linha de base da primeira linha até o topo da caixa de texto (0,72 em de ascendente). */
const LABEL_ASCENT = 8;
const LEAF_PADDING = 6;
/** Respiro entre a tinta da última linha e a base da rubrica. */
const LEAF_BOTTOM_MARGIN = 2;
/**
 * Respiro entre o nome da camada e o total dela, na mesma linha do cabeçalho. A COLISAO-TEXTO
 * cobra 4 px de tinta contra tinta entre dois textos vizinhos; 8 px deixam o dobro, e é aqui que a
 * ROT-9 mora, porque dois textos colados na mesma linha passam a ler como um só.
 */
const HEADER_TEXT_GAP = 8;
/** Piso para a rubrica tentar escrever nome e valor; abaixo dele ela nem mede. */
const LEAF_MIN_WIDTH = 52;
const LEAF_NAME_WEIGHT = 500;
const LEAF_VALUE_WEIGHT = 600;
/** TIP-3: peso 700 em no máximo dois elementos; nenhuma camada é o destaque, então 600 aqui. */
const LAYER_NAME_WEIGHT = 600;
/** Teto de linhas do nome dentro da rubrica: a TIP-7 proíbe cortar nome por reticência. */
const MAX_NAME_LINES = 2;
/**
 * Teto do que a faixa de cabeçalho e o respiro podem cobrar da área da camada. Acima dele a camada
 * é pintada cheia, sem faixa e sem respiro. O número tem medição atrás, do preview de 2026-09-28:
 * a camada de 0,2% do custo nasceu com 7 px de largura, o respiro de 3 px por lado comeu 6 deles e
 * a rubrica dentro dela desenhou 54 px² onde a área do valor pede 420, um erro de 87% na única
 * coisa que o treemap codifica (GEO-3). Escala é o que não se negocia; faixa e respiro são.
 */
const RESERVED_MAX_AREA_COST = 0.5;
/** Glifo fora das tabelas: acima do maior valor tabelado, que é 0,891 em do `%` em Manrope. */
const GLYPH_EM_FALLBACK = 0.9;
/**
 * Folga somada a cada linha medida. O ajuste da tabela por glifo tem p99 de erro de mais 0,53 px
 * em Space Grotesk e mais 1,24 px em Manrope por linha inteira, então 2 px cobrem o p99 das duas
 * famílias. Não há folga percentual a aplicar: o erro de 9% a 21% que a produção mediu é da média
 * por classe, não da soma por glifo.
 */
const TEXT_INK_SLACK = 2;

/**
 * Largura de avanço por glifo, em em, recortada da tabela de `_render/scripts/lib/colisao.mjs`,
 * ajustada por mínimos quadrados contra o motor de fonte do navegador sobre 1.347 linhas do
 * acervo. A soma por glifo existe porque a média por classe não descreve string real: ela
 * subestimou `42 agendas` em 9% e um rótulo de moeda negativa em 21%, e uma constante única para
 * as duas famílias erra cerca de 11% em Space Grotesk, que é a fonte do número.
 */
const MANROPE_EM: Readonly<Record<string, number>> = {
  ' ': 0.216, $: 0.589, '%': 0.891, '(': 0.437, ')': 0.437, '+': 0.52, ',': 0.2, '.': 0.228, '/': 0.367,
  '0': 0.613, '1': 0.405, '2': 0.576, '3': 0.561, '4': 0.593, '5': 0.579, '6': 0.627, '7': 0.486, '8': 0.588, '9': 0.597,
  A: 0.693, B: 0.641, C: 0.728, D: 0.641, E: 0.58, F: 0.462, G: 0.694, H: 0.732, I: 0.316, J: 0.524, K: 0.569,
  L: 0.513, M: 0.834, N: 0.705, O: 0.795, P: 0.612, Q: 0.639, R: 0.617, S: 0.611, T: 0.576, V: 0.577, W: 0.76,
  a: 0.567, b: 0.632, c: 0.526, d: 0.599, e: 0.593, f: 0.382, g: 0.579, h: 0.587, i: 0.257, j: 0.227, k: 0.667,
  l: 0.243, m: 0.822, n: 0.607, o: 0.605, p: 0.58, q: 0.543, r: 0.351, s: 0.53, t: 0.394, u: 0.623, v: 0.457,
  w: 0.625, x: 0.464, y: 0.702, z: 0.516,
  'É': 0.562, 'á': 0.558, 'â': 0.497, 'ã': 0.58, 'ç': 0.536, 'é': 0.574, 'ê': 0.618, 'í': 0.217, 'ó': 0.641,
  'õ': 0.525, 'ú': 0.603,
};
/** Space Grotesk, a fonte do número. Glifo que falta aqui cai no valor de Manrope. */
const GROTESK_EM: Readonly<Record<string, number>> = {
  ' ': 0.302, $: 0.599, '+': 0.616, ',': 0.267, '/': 0.403, '%': 0.762,
  '0': 0.644, '1': 0.434, '2': 0.598, '3': 0.607, '4': 0.629, '5': 0.599, '6': 0.617, '7': 0.544, '8': 0.61, '9': 0.619,
  A: 0.557, L: 0.557, R: 0.599, S: 0.557, T: 0.556,
  a: 0.605, c: 0.607, d: 0.624, e: 0.563, f: 0.505, g: 0.618, h: 0.563, i: 0.52, l: 0.268, m: 0.52, n: 0.615,
  o: 0.591, p: 0.588, r: 0.448, s: 0.464, t: 0.506,
};

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Tinta de uma linha, em px, por soma de glifo mais a folga que cobre o p99 do erro por linha. */
function inkWidth(text: string, family: 'sans' | 'display'): number {
  const table = family === 'display' ? GROTESK_EM : MANROPE_EM;
  let em = 0;
  for (const glyph of text) {
    em += table[glyph] ?? MANROPE_EM[glyph] ?? GLYPH_EM_FALLBACK;
  }
  return em * LABEL_FONT_SIZE + TEXT_INK_SLACK;
}

/** Proporção do pior retângulo de uma faixa de área `rowArea` assentada sobre o lado `side`. */
function aspectOf(rowArea: number, area: number, side: number): number {
  const thickness = rowArea / side;
  const length = area / thickness;
  return thickness > length ? thickness / length : length / thickness;
}

/**
 * Squarify de Bruls, Huizing e van Wijk: reparte `rect` entre as áreas dadas, que chegam em ordem
 * decrescente. A soma das áreas devolvidas é a área de `rect` POR CONSTRUÇÃO, porque cada faixa
 * reescala o que sobrou contra a área livre que sobrou, então a área da camada fecha com a das
 * rubricas sem depender do dado.
 */
function squarify(areas: readonly number[], rect: Rect): readonly Rect[] {
  const out: Rect[] = [];
  let free = rect;
  let cursor = 0;
  while (cursor < areas.length) {
    const rest = areas.slice(cursor);
    const restSum = rest.reduce((sum, area) => sum + area, 0);
    const scale = restSum === 0 ? 1 : (free.width * free.height) / restSum;
    const horizontal = free.width < free.height;
    const side = horizontal ? free.width : free.height;
    const first = (rest[0] ?? 0) * scale;
    let rowArea = first;
    let worst = aspectOf(rowArea, first, side);
    let count = 1;
    while (count < rest.length) {
      const next = (rest[count] ?? 0) * scale;
      const candidateArea = rowArea + next;
      const candidateWorst = Math.max(
        aspectOf(candidateArea, first, side),
        aspectOf(candidateArea, next, side),
      );
      if (candidateWorst > worst) {
        break;
      }
      rowArea = candidateArea;
      worst = candidateWorst;
      count += 1;
    }
    const thickness = rowArea / side;
    let along = horizontal ? free.x : free.y;
    for (let index = 0; index < count; index += 1) {
      const length = ((rest[index] ?? 0) * scale) / thickness;
      out.push(
        horizontal
          ? { x: along, y: free.y, width: length, height: thickness }
          : { x: free.x, y: along, width: thickness, height: length },
      );
      along += length;
    }
    free = horizontal
      ? { x: free.x, y: free.y + thickness, width: free.width, height: free.height - thickness }
      : { x: free.x + thickness, y: free.y, width: free.width - thickness, height: free.height };
    cursor += count;
  }
  return out;
}

/**
 * Nome quebrado em até duas linhas por palavra inteira, no corte mais equilibrado que caiba dos
 * dois lados. Devolve `null` quando nem isso cabe, e aí a rubrica fica muda: devolver a melhor
 * tentativa sem conferir se ela cabe é o que faz o texto vazar para a rubrica vizinha.
 */
function wrapName(name: string, usableWidth: number): readonly string[] | null {
  if (inkWidth(name, 'sans') <= usableWidth) {
    return [name];
  }
  const words = name.split(' ');
  if (words.length < MAX_NAME_LINES) {
    return null;
  }
  let best: { readonly lines: readonly [string, string]; readonly balance: number } | null = null;
  for (let index = 1; index < words.length; index += 1) {
    const first = words.slice(0, index).join(' ');
    const second = words.slice(index).join(' ');
    if (inkWidth(first, 'sans') <= usableWidth && inkWidth(second, 'sans') <= usableWidth) {
      const balance = Math.abs(inkWidth(first, 'sans') - inkWidth(second, 'sans'));
      if (best === null || balance < best.balance) {
        best = { lines: [first, second], balance };
      }
    }
  }
  return best === null ? null : best.lines;
}

/** Altura de tinta necessária para `lineCount` linhas dentro da rubrica, com respiro embaixo. */
function requiredHeight(lineCount: number): number {
  return LEAF_PADDING + lineCount * LABEL_LINE_HEIGHT + LEAF_BOTTOM_MARGIN;
}

/**
 * Nome e valor são avaliados como PAR: identificação pela metade não é identificação, então a
 * rubrica ou escreve os dois ou fica muda e a identificação sobe para a lista fora do desenho.
 */
function fitCellText(name: string, valueText: string, cell: Rect): readonly string[] | null {
  if (cell.width < LEAF_MIN_WIDTH) {
    return null;
  }
  const usableWidth = cell.width - LEAF_PADDING * 2;
  if (inkWidth(valueText, 'display') > usableWidth) {
    return null;
  }
  const nameLines = wrapName(name, usableWidth);
  if (nameLines === null) {
    return null;
  }
  const lines = [...nameLines, valueText];
  return cell.height < requiredHeight(lines.length) ? null : lines;
}

/** Soma de uma lista de valores de custo. `null` em lista vazia, nunca zero (EST-1b). */
function sumValues(rows: readonly { readonly value: number }[]): number | null {
  if (rows.length === 0) {
    return null;
  }
  return rows.reduce((sum, row) => sum + row.value, 0);
}

interface DrawnLayer {
  readonly id: string;
  readonly name: string;
  readonly slot: number;
  readonly value: number;
  readonly valueText: string;
  readonly lines: readonly { readonly id: string; readonly name: string; readonly value: number }[];
  readonly [key: string]: unknown;
}

export default function TinyLayerTreemap({ data = defaultData, height, className }: TinyLayerTreemapProps) {
  const style = height === undefined ? undefined : { height };

  // O valor da camada é a soma das rubricas, calculada aqui: o dado não declara total de camada,
  // então não existe o caso de o pai divergir da soma dos filhos. Camada sem nenhuma rubrica
  // positiva não entra, porque a soma dela é `null` e não zero (EST-1b).
  const layers: readonly DrawnLayer[] = [
    ...data.flatMap((layer): readonly DrawnLayer[] => {
      const lines = [...layer.lines]
        .filter((line) => line.value > 0)
        .sort((a, b) => (b.value === a.value ? a.id.localeCompare(b.id) : b.value - a.value));
      const total = sumValues(lines);
      if (total === null) {
        return [];
      }
      return [
        {
          id: layer.id,
          name: layer.name,
          slot: layer.slot,
          value: total,
          valueText: formatCurrencyCompact(total),
          lines,
        },
      ];
    }),
  ].sort((a, b) => (b.value === a.value ? a.id.localeCompare(b.id) : b.value - a.value));

  const grandTotal = sumValues(layers);

  if (layers.length === 0 || grandTotal === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma camada com custo neste recorte: não houve o que repartir em área.</span>
      </div>
    );
  }

  const totalText = formatCurrencyCompact(grandTotal);
  const lineCount = layers.reduce((sum, layer) => sum + layer.lines.length, 0);
  const smallest = layers[layers.length - 1];

  // ANO-5: uma linha no topo do corpo, calculada do dado. Ela nomeia a camada menor e diz a regra
  // de corte, que é o que esta versão existe para mostrar; a base da comparação vem junto (NUM-4).
  const reading =
    smallest === undefined
      ? null
      : `${smallest.name} é a camada menor, ${smallest.valueText} de ${totalText}: camada sem espaço para nome e total juntos fica só com a cor, e é nomeada na lista abaixo.`;

  const summary =
    smallest === undefined
      ? `Treemap aninhado com o custo de ${totalText} no 2026-T3 em ${formatInt(layers.length)} camadas e ${formatInt(lineCount)} rubricas.`
      : `Treemap aninhado com o custo de ${totalText} no 2026-T3 em ${formatInt(layers.length)} camadas e ${formatInt(lineCount)} rubricas. A camada menor é ${smallest.name}, com ${smallest.valueText}, pequena demais para faixa de cabeçalho e nomeada só na lista.`;

  function renderLayer(node: TreemapNode): ReactElement {
    const { depth, x, y, width, height: layerHeight } = node;

    if (depth === 0) {
      // Fundo do canvas inteiro: é o que aparece no vão entre as camadas e nos respiros internos.
      return <rect fill="var(--surface-raised)" height={layerHeight} rx={LAYER_RADIUS} width={width} x={x} y={y} />;
    }

    const id = typeof node.id === 'string' ? node.id : '';
    const layer = layers.find((candidate) => candidate.id === id);
    const slot = layer === undefined ? 0 : layer.slot;
    const fill = `var(${LAYER_COLORS[slot % LAYER_COLORS.length] ?? LAYER_COLORS[0]})`;

    const headerText = layer === undefined ? '' : layer.valueText;
    const nameInk = inkWidth(node.name, 'sans');
    const headerInk = inkWidth(headerText, 'display');
    const groupArea = width * layerHeight;
    /** O que sobra para as rubricas depois de reservar `reserved` px no topo e o respiro dos lados. */
    function innerRect(reserved: number): Rect {
      return {
        x: x + LAYER_PAD,
        y: y + reserved,
        width: width - LAYER_PAD * 2,
        height: layerHeight - reserved - LAYER_PAD,
      };
    }
    /** O que foi reservado cabe na conta da GEO-3: área positiva e dentro do teto de custo. */
    function keepsArea(rect: Rect): boolean {
      return rect.width > 0 && rect.height > 0 && rect.width * rect.height >= groupArea * (1 - RESERVED_MAX_AREA_COST);
    }

    // A REGRA DE CORTE da faixa, em duas perguntas. A primeira é do par: nome e total juntos, ou
    // faixa nenhuma, porque identificação pela metade não é identificação. A segunda é de área: a
    // faixa não pode cobrar mais da metade da camada, senão o que ela custa aparece no encoding.
    const withHeader = innerRect(LAYER_HEADER_HEIGHT);
    const headerFits =
      headerText !== '' &&
      layerHeight >= LAYER_HEADER_HEIGHT + LAYER_PAD &&
      width >= nameInk + headerInk + HEADER_TEXT_GAP + LAYER_PAD * 4 &&
      keepsArea(withHeader);
    const inner = headerFits ? withHeader : innerRect(LAYER_PAD);
    // Camada em que nem o respiro cabe é pintada CHEIA, sem contorno próprio: a área dela é a soma
    // das rubricas, então pintá-la mantém o valor na tela na escala certa, enquanto recuar 3 px de
    // cada lado de uma camada de 7 px de largura apagaria seis sétimos do que o valor pede. Nenhum
    // retângulo cresce para caber texto.
    if (layer === undefined || !keepsArea(inner)) {
      return <rect fill={fill} height={layerHeight} rx={LEAF_RADIUS} width={width} x={x} y={y} />;
    }

    const cells = squarify(
      layer.lines.map((line) => line.value),
      inner,
    );

    return (
      <g>
        {cells.map((cell, index) => {
          const line = layer.lines[index];
          if (line === undefined) {
            return null;
          }
          const valueText = formatCurrencyCompact(line.value);
          const textLines = fitCellText(line.name, valueText, cell);
          const lastIndex = textLines === null ? -1 : textLines.length - 1;
          return (
            <g key={line.id}>
              <rect
                fill={fill}
                height={cell.height}
                rx={LEAF_RADIUS}
                stroke="var(--surface-raised)"
                strokeWidth={LEAF_SEPARATOR_WIDTH}
                width={cell.width}
                x={cell.x}
                y={cell.y}
              />
              {textLines?.map((text, textIndex) => (
                <text
                  className={textIndex === lastIndex ? 'font-display' : 'font-sans'}
                  fill={CELL_TEXT}
                  fontSize={LABEL_FONT_SIZE}
                  fontWeight={textIndex === lastIndex ? LEAF_VALUE_WEIGHT : LEAF_NAME_WEIGHT}
                  key={text}
                  x={cell.x + LEAF_PADDING}
                  y={cell.y + LEAF_PADDING + LABEL_ASCENT + textIndex * LABEL_LINE_HEIGHT}
                >
                  {text}
                </text>
              ))}
            </g>
          );
        })}
        <rect
          fill="none"
          height={layerHeight}
          rx={LAYER_RADIUS}
          stroke={fill}
          strokeWidth={LAYER_STROKE_WIDTH}
          width={width}
          x={x}
          y={y}
        />
        {headerFits ? (
          <>
            <text
              className="font-sans"
              fill="var(--text-primary)"
              fontSize={LABEL_FONT_SIZE}
              fontWeight={LAYER_NAME_WEIGHT}
              x={x + LAYER_PAD * 2}
              y={y + LAYER_PAD + LABEL_ASCENT}
            >
              {node.name}
            </text>
            <text
              className="font-display"
              fill="var(--text-secondary)"
              fontSize={LABEL_FONT_SIZE}
              fontWeight={LEAF_VALUE_WEIGHT}
              textAnchor="end"
              x={x + width - LAYER_PAD * 2}
              y={y + LAYER_PAD + LABEL_ASCENT}
            >
              {headerText}
            </text>
          </>
        ) : null}
      </g>
    );
  }

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {reading === null ? null : (
        <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
          {reading}
        </p>
      )}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <Treemap
            aspectRatio={1}
            content={renderLayer}
            data={layers}
            dataKey="value"
            isAnimationActive={false}
            nameKey="name"
            nodeGap={LAYER_GAP}
          />
        </ResponsiveContainer>
      </div>
      {/* Identificação de toda camada e de toda rubrica, com nome e valor (ROT-10): é ela que
          sustenta a regra de corte, porque cobre a camada sem faixa e a rubrica muda sem depender
          do tamanho que o layout deu a cada retângulo. A coluna de valor tem largura fixa e
          alinhamento à direita (TIP-6, ROT-5). A peça não desenha dica: a especificação do
          catálogo manda o grupo pequeno para a dica, e a ROT-10 diz que dica não conta, porque não
          existe no preview, no papel nem para quem usa leitor de tela (DIC-1). */}
      <div className="mt-2 grid shrink-0 grid-cols-3 gap-x-5 gap-y-2 text-[0.6875rem]">
        {layers.map((layer) => {
          const layerColor = `var(${LAYER_COLORS[layer.slot % LAYER_COLORS.length] ?? LAYER_COLORS[0]})`;
          return (
            <div className="min-w-0" key={layer.id}>
              <div className="grid grid-cols-[1fr_84px] items-center gap-x-2">
                <span className="flex min-w-0 items-center gap-1.5 font-semibold text-text-primary">
                  <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: layerColor }} />
                  <span>{layer.name}</span>
                </span>
                <span className="font-display text-right text-text-primary">{layer.valueText}</span>
              </div>
              <ul className="mt-0.5 space-y-0.5 pl-3.5">
                {layer.lines.map((line) => (
                  <li className="grid grid-cols-[1fr_84px] items-start gap-x-2" key={line.id}>
                    <span className="flex min-w-0 items-center gap-1.5 text-text-secondary">
                      <span
                        aria-hidden
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: layerColor }}
                      />
                      <span>{line.name}</span>
                    </span>
                    <span className="font-display text-right text-text-primary">
                      {formatCurrencyCompact(line.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
