import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { ResponsiveContainer, Treemap, type TreemapNode } from 'recharts';

import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type ExecutivePipeline } from './data';

/**
 * Treemap aninhado de dois níveis com um executivo aceso. A área continua sendo o pipeline
 * aberto; o que o destaque diz é quanto do total depende de um único executivo.
 *
 * Duas escolhas de mecanismo separam esta versão da `v1`, e as duas existem por medição.
 *
 * A primeira é o layout: o Recharts reparte só o PRIMEIRO nível, e os produtos de cada executivo
 * são repartidos aqui, por squarify próprio, dentro do retângulo que o grupo recebeu. O
 * `nodeInset` do Recharts recua os quatro lados por igual, então não existe faixa reservada só no
 * topo; repartindo os filhos aqui, a faixa de cabeçalho é do topo e o respiro dos outros três
 * lados é uma constante pequena, o que devolve área útil às células.
 *
 * A segunda é a cor: a profundidade NÃO vai na cor. A rampa sequencial do Farol entrega dois
 * níveis úteis, não sete (`--seq-5` contra `--seq-6` mede 1,42:1 e `--seq-6` contra `--seq-7`
 * mede 1,45:1), então quem carrega a hierarquia é o aninhamento, a borda e o rótulo, que o
 * próprio aninhamento já oferece, e a cor fica para a categoria do primeiro nível: o produto
 * herda a cor do executivo sem diluição nenhuma, e o que separa duas células irmãs é o contorno
 * na cor do cartão da COR-5, não uma diferença de luminosidade.
 */
export interface PipelineConcentrationTreemapProps {
  readonly data?: readonly ExecutivePipeline[];
  /** Id do executivo aceso; os demais ficam no neutro de dado. */
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Aceso: a única cor do visual (17.2). Mede 9,50:1 no escuro e 6,00:1 no claro. */
const HIGHLIGHT_FILL = 'var(--chart-1)';
/**
 * Neutro de dado SEM valor escrito em toda marca (17.2): mede 5,21:1 e 5,37:1 contra o cartão,
 * então passa os 3:1 da WCAG 1.4.11 por si. Não serve `--line-strong`, que mede 1,79:1 e 1,83:1 e
 * só é liberado quando toda marca carrega o número escrito; aqui a célula pequena fica muda por
 * geometria. Não serve baixar a opacidade do aceso, que é o que a especificação do catálogo
 * sugere: `--chart-1` composto a 0,6 sobre o cartão mede 2,69:1 no claro, abaixo do piso.
 */
const NEUTRAL_FILL = 'var(--text-muted)';
/**
 * Texto dentro da célula, vazado na cor do cartão: mede 6,00:1 sobre o aceso e 5,21:1 sobre o
 * neutro, nos dois temas. Vazado e SEM halo, pela ROT-7b: o halo também é a cor da superfície, e
 * no tema claro os dois são o mesmo branco, então o halo apagaria a letra. A pergunta que decide
 * é uma só, e aqui a resposta é sim: o texto tem a marca inteira por baixo, porque só desenha
 * quando cabe dentro da própria célula.
 */
const CELL_TEXT = 'var(--surface-raised)';

const GROUP_RADIUS = 6;
const LEAF_RADIUS = 3;
const HIGHLIGHT_STROKE_WIDTH = 2;
const NEUTRAL_STROKE_WIDTH = 1;
/** Vão entre executivos: revela o fundo `--surface-raised` pintado no nó de profundidade zero. */
const GROUP_GAP = 4;
/**
 * Faixa de cabeçalho no topo do grupo, reservada ANTES de repartir os produtos. 18 px, e não 17,
 * pelo piso da ESP-2: texto de 11 px dentro de uma marca pede 11 mais 6 px de espessura, e o
 * grau extra deixa 1 px de folga.
 */
const GROUP_HEADER_HEIGHT = 18;
/** Respiro do bloco de produtos contra o contorno do grupo, nos três lados sem cabeçalho. */
const GROUP_PAD = 3;
/** Contorno na cor do cartão que separa produtos colados (COR-5), sem mexer no preenchimento. */
const LEAF_SEPARATOR_WIDTH = 2;
const LABEL_FONT_SIZE = 11;
/**
 * Distância entre linhas de texto. A tinta de uma linha de 11 px vai de 0,72 em acima da linha de
 * base a 0,10 em abaixo, isto é 9,02 px, então 14 px deixam 4,98 px de respiro entre duas linhas,
 * acima do respiro de 4 px que a COLISAO-TEXTO cobra entre textos vizinhos.
 */
const LABEL_LINE_HEIGHT = 14;
/** Da linha de base da primeira linha até o topo da caixa de texto (0,72 em de ascendente). */
const LABEL_ASCENT = 8;
const LEAF_PADDING = 6;
/** Respiro entre a tinta da última linha e a base da célula. */
const LEAF_BOTTOM_MARGIN = 2;
/**
 * Respiro entre o nome do grupo e o total dele, na mesma linha do cabeçalho. A COLISAO-TEXTO
 * cobra 4 px de tinta contra tinta entre dois textos vizinhos; 8 px deixam o dobro, e é aqui que
 * a ROT-9 mora, porque dois números colados na mesma linha passam a ler como um só.
 */
const HEADER_TEXT_GAP = 8;
/** Piso para a célula tentar escrever nome e valor; abaixo dele ela nem mede. */
const LEAF_MIN_WIDTH = 52;
const LEAF_NAME_WEIGHT = 500;
const LEAF_VALUE_WEIGHT = 600;
const GROUP_NAME_WEIGHT_NEUTRAL = 600;
/** TIP-3: peso 700 em no máximo dois elementos; aqui num só, o nome do executivo aceso. */
const GROUP_NAME_WEIGHT_HIGHLIGHT = 700;
/** Teto de linhas do nome dentro da célula: a TIP-7 proíbe cortar nome por reticência. */
const MAX_NAME_LINES = 2;
/**
 * Teto do que a faixa de cabeçalho e o respiro podem cobrar da área do grupo. Acima dele o grupo é
 * pintado cheio, sem faixa e sem respiro. O número tem medição atrás, do preview de 2026-09-28 da
 * `v4`: um grupo de 0,2% do total nasceu com 7 px de largura, o respiro de 3 px por lado comeu 6
 * deles e a célula dentro dele desenhou 54 px² onde a área do valor pede 420, um erro de 87% na
 * única coisa que o treemap codifica (GEO-3). Escala é o que não se negocia; faixa e respiro são.
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

/**
 * Tinta de uma linha, em px, por soma de glifo. Num treemap o lado seguro do arredondamento se
 * inverte: rótulo que transborda invade a célula vizinha e nenhuma guarda mede invasão entre
 * células, então aqui a conta SUPERESTIMA de propósito e esconder o rótulo é o desfecho aceitável,
 * porque a lista de identificação abaixo do desenho cobre toda célula muda.
 */
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
 * reescala o que sobrou contra a área livre que sobrou, então a área do pai fecha com a dos
 * filhos sem depender do dado.
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
 * dois lados. Devolve `null` quando nem isso cabe, e aí a célula fica muda: devolver a melhor
 * tentativa sem conferir se ela cabe é o que faz o texto vazar para a célula vizinha.
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

/** Altura de tinta necessária para `lineCount` linhas dentro da célula, com respiro embaixo. */
function requiredHeight(lineCount: number): number {
  return LEAF_PADDING + lineCount * LABEL_LINE_HEIGHT + LEAF_BOTTOM_MARGIN;
}

/**
 * Nome e valor são avaliados como PAR: identificação pela metade não é identificação, então a
 * célula ou escreve os dois ou fica muda e a identificação sobe para a lista fora do desenho.
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

/** Soma de uma lista de produtos. `null` em lista vazia, nunca zero (EST-1b). */
function sumProducts(rows: readonly { readonly value: number }[]): number | null {
  if (rows.length === 0) {
    return null;
  }
  return rows.reduce((sum, row) => sum + row.value, 0);
}

/** Participação de uma parte no todo. `null` quando não existe todo a dividir. */
function shareOf(part: number, whole: number | null): number | null {
  if (whole === null || whole === 0) {
    return null;
  }
  return part / whole;
}

interface DrawnGroup {
  readonly id: string;
  readonly name: string;
  readonly value: number;
  readonly products: readonly { readonly id: string; readonly name: string; readonly value: number }[];
  readonly [key: string]: unknown;
}

export default function PipelineConcentrationTreemap({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: PipelineConcentrationTreemapProps) {
  const style = height === undefined ? undefined : { height };

  // O valor do grupo é a soma dos produtos desenhados, calculada aqui: o dado não declara total
  // de executivo, então não existe o caso de o pai divergir da soma dos filhos. Executivo sem
  // nenhum produto positivo não entra, porque a soma dele é `null` e não zero (EST-1b).
  const groups: readonly DrawnGroup[] = [
    ...data.flatMap((executive): readonly DrawnGroup[] => {
      const products = [...executive.products]
        .filter((product) => product.value > 0)
        .sort((a, b) => (b.value === a.value ? a.id.localeCompare(b.id) : b.value - a.value));
      const total = sumProducts(products);
      if (total === null) {
        return [];
      }
      return [{ id: executive.id, name: executive.name, value: total, products }];
    }),
  ].sort((a, b) => (b.value === a.value ? a.id.localeCompare(b.id) : b.value - a.value));

  const grandTotal = sumProducts(groups);
  const excluded = data.flatMap((executive) =>
    executive.products
      .filter((product) => product.value <= 0)
      .map((product) => ({ executive: executive.name, product })),
  );

  if (groups.length === 0 || grandTotal === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo com pipeline aberto neste recorte: não houve o que repartir em área.</span>
      </div>
    );
  }

  const leafCount = groups.reduce((sum, group) => sum + group.products.length, 0);
  const highlight = groups.find((group) => group.id === highlightId);
  const runnerUp = groups.find((group) => group.id !== highlightId);
  const highlightShare = highlight === undefined ? null : shareOf(highlight.value, grandTotal);

  const totalText = formatCurrencyCompact(grandTotal);
  const highlightValueText = highlight === undefined ? '' : formatCurrencyCompact(highlight.value);
  const highlightShareText = highlightShare === null ? '' : formatPercent(highlightShare, 0);
  const runnerUpValueText = runnerUp === undefined ? '' : formatCurrencyCompact(runnerUp.value);

  // ANO-5: uma linha no topo do corpo, calculada do dado, com a conclusão e a base da comparação
  // na mesma frase (NUM-4). É `aria-hidden` porque a frase da raiz já diz o mesmo.
  const reading =
    highlight === undefined || runnerUp === undefined || highlightShareText === ''
      ? null
      : `${highlight.name} concentra ${highlightShareText} do pipeline aberto, ${highlightValueText} de ${totalText}, contra ${runnerUpValueText} de ${runnerUp.name}.`;

  const summary =
    highlight === undefined || highlightShareText === ''
      ? `Treemap aninhado com o pipeline aberto de ${totalText} repartido entre ${formatInt(groups.length)} executivos e ${formatInt(leafCount)} produtos, com a área proporcional ao valor.`
      : `Treemap aninhado do pipeline aberto de ${totalText} entre ${formatInt(groups.length)} executivos e ${formatInt(leafCount)} produtos. Acende ${highlight.name}, que concentra ${highlightShareText} do total com ${highlightValueText}; os demais ficam no neutro.`;

  function renderGroup(node: TreemapNode): ReactElement {
    const { depth, x, y, width, height: groupHeight } = node;

    if (depth === 0) {
      // Fundo do canvas inteiro: é o que aparece no vão entre os grupos e nos respiros internos.
      return <rect fill="var(--surface-raised)" height={groupHeight} rx={GROUP_RADIUS} width={width} x={x} y={y} />;
    }

    const id = typeof node.id === 'string' ? node.id : '';
    const group = groups.find((candidate) => candidate.id === id);
    const isHighlight = id === highlightId;
    const fill = isHighlight ? HIGHLIGHT_FILL : NEUTRAL_FILL;

    const totalOfGroup = group === undefined ? null : group.value;
    const groupValueText = totalOfGroup === null ? '' : formatCurrencyCompact(totalOfGroup);
    const nameInk = inkWidth(node.name, 'sans');
    const valueInk = inkWidth(groupValueText, 'display');
    const groupArea = width * groupHeight;
    /** O que sobra para os produtos depois de reservar `reserved` px no topo e o respiro dos lados. */
    function innerRect(reserved: number): Rect {
      return {
        x: x + GROUP_PAD,
        y: y + reserved,
        width: width - GROUP_PAD * 2,
        height: groupHeight - reserved - GROUP_PAD,
      };
    }
    /** O que foi reservado cabe na conta da GEO-3: área positiva e dentro do teto de custo. */
    function keepsArea(rect: Rect): boolean {
      return rect.width > 0 && rect.height > 0 && rect.width * rect.height >= groupArea * (1 - RESERVED_MAX_AREA_COST);
    }

    // A faixa de cabeçalho passa por duas perguntas. A primeira é do par: nome e total juntos, ou
    // faixa nenhuma, porque identificação pela metade não é identificação. A segunda é de área: a
    // faixa não pode cobrar mais da metade do grupo, senão o que ela custa aparece no encoding.
    const withHeader = innerRect(GROUP_HEADER_HEIGHT);
    const headerFits =
      groupValueText !== '' &&
      groupHeight >= GROUP_HEADER_HEIGHT + GROUP_PAD &&
      width >= nameInk + valueInk + HEADER_TEXT_GAP + GROUP_PAD * 4 &&
      keepsArea(withHeader);
    const inner = headerFits ? withHeader : innerRect(GROUP_PAD);

    // Grupo em que nem o respiro cabe é pintado cheio: a área dele é a soma dos produtos, então
    // pintá-lo mantém o valor na tela na escala certa, e nenhum retângulo cresce para caber texto.
    if (group === undefined || !keepsArea(inner)) {
      return <rect fill={fill} height={groupHeight} rx={LEAF_RADIUS} width={width} x={x} y={y} />;
    }

    const cells = squarify(
      group.products.map((product) => product.value),
      inner,
    );

    return (
      <g>
        {cells.map((cell, index) => {
          const product = group.products[index];
          if (product === undefined) {
            return null;
          }
          const valueText = formatCurrencyCompact(product.value);
          const lines = fitCellText(product.name, valueText, cell);
          const lastIndex = lines === null ? -1 : lines.length - 1;
          return (
            <g key={product.id}>
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
              {lines?.map((line, lineIndex) => (
                <text
                  className={lineIndex === lastIndex ? 'font-display' : 'font-sans'}
                  fill={CELL_TEXT}
                  fontSize={LABEL_FONT_SIZE}
                  fontWeight={lineIndex === lastIndex ? LEAF_VALUE_WEIGHT : LEAF_NAME_WEIGHT}
                  key={line}
                  x={cell.x + LEAF_PADDING}
                  y={cell.y + LEAF_PADDING + LABEL_ASCENT + lineIndex * LABEL_LINE_HEIGHT}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
        <rect
          fill="none"
          height={groupHeight}
          rx={GROUP_RADIUS}
          stroke={fill}
          strokeWidth={isHighlight ? HIGHLIGHT_STROKE_WIDTH : NEUTRAL_STROKE_WIDTH}
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
              fontWeight={isHighlight ? GROUP_NAME_WEIGHT_HIGHLIGHT : GROUP_NAME_WEIGHT_NEUTRAL}
              x={x + GROUP_PAD * 2}
              y={y + GROUP_PAD + LABEL_ASCENT}
            >
              {node.name}
            </text>
            <text
              className="font-display"
              fill="var(--text-secondary)"
              fontSize={LABEL_FONT_SIZE}
              fontWeight={LEAF_VALUE_WEIGHT}
              textAnchor="end"
              x={x + width - GROUP_PAD * 2}
              y={y + GROUP_PAD + LABEL_ASCENT}
            >
              {groupValueText}
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
            content={renderGroup}
            data={groups}
            dataKey="value"
            isAnimationActive={false}
            nameKey="name"
            nodeGap={GROUP_GAP}
          />
        </ResponsiveContainer>
      </div>
      {/* Identificação de todo executivo e de todo produto desenhado, com nome e valor (ROT-10):
          não depende do tamanho que o layout deu à célula, então cobre a célula muda e a faixa de
          cabeçalho que não caber. A coluna de valor tem largura fixa e alinhamento à direita
          (TIP-6, ROT-5). A peça não desenha dica (DIC-1): tudo o que ela diria está escrito. */}
      <div className="mt-2 grid shrink-0 grid-cols-3 gap-x-5 gap-y-2 text-[0.6875rem]">
        {groups.map((group) => {
          const isHighlight = group.id === highlightId;
          const groupFill = isHighlight ? HIGHLIGHT_FILL : NEUTRAL_FILL;
          return (
            <div className="min-w-0" key={group.id}>
              <div className="grid grid-cols-[1fr_84px] items-center gap-x-2">
                <span
                  className={cn(
                    'flex min-w-0 items-center gap-1.5 text-text-secondary',
                    isHighlight && 'font-bold text-text-primary',
                  )}
                >
                  <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: groupFill }} />
                  <span>{group.name}</span>
                </span>
                <span className="font-display text-right text-text-primary">
                  {formatCurrencyCompact(group.value)}
                </span>
              </div>
              <ul className="mt-0.5 space-y-0.5 pl-3.5">
                {group.products.map((product) => (
                  <li className="grid grid-cols-[1fr_84px] items-start gap-x-2" key={product.id}>
                    <span className="flex min-w-0 items-center gap-1.5 text-text-secondary">
                      <span
                        aria-hidden
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: groupFill }}
                      />
                      <span>{product.name}</span>
                    </span>
                    <span className="font-display text-right text-text-primary">
                      {formatCurrencyCompact(product.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {excluded.length === 0 ? null : (
        <p className="mt-1 shrink-0 text-[0.6875rem] text-text-muted">
          {`Fora do desenho: ${excluded
            .map((row) => `${row.executive}, ${row.product.name}, ${row.product.note ?? 'sem valor positivo'}`)
            .join('; ')}.`}
        </p>
      )}
    </div>
  );
}
