import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { ResponsiveContainer, Treemap, type TreemapNode } from 'recharts';

import { formatCurrencyCompact, formatDecimal, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type ProductGrowth } from './data';

/**
 * Treemap de um nível com um produto aceso: a área continua sendo a receita do trimestre
 * corrente, e o destaque diz qual produto mais cresceu contra o trimestre anterior. O destaque
 * vem do `data.ts` e nunca é inferido aqui, porque cor que se escolhe sozinha muda de dono a
 * cada recorte. A célula só recebe texto quando nome e valor cabem juntos; quando não cabem, ela
 * fica muda e a identificação vai para a lista fora do gráfico, que não depende do tamanho que o
 * layout do Recharts deu a cada retângulo.
 */
export interface ProductGrowthTreemapProps {
  readonly data?: readonly ProductGrowth[];
  /** Id do produto aceso; os demais ficam no neutro de dado. */
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Destaque: a única cor do visual (17.2). Mede 9,50:1 no escuro e 6,00:1 no claro. */
const HIGHLIGHT_FILL = 'var(--chart-1)';
/**
 * Neutro de dado SEM valor escrito em toda marca (17.2): mede 5,21:1 e 5,37:1 contra o cartão,
 * então passa os 3:1 por si. `--line-strong` não serve aqui, porque a isenção dele exige o número
 * em cada marca e no treemap a célula pequena fica muda por geometria.
 */
const NEUTRAL_FILL = 'var(--text-muted)';
/** Texto sobre o destaque: o par aprovado da ROT-6 (10,06:1 no escuro, 6,00:1 no claro). */
const HIGHLIGHT_TEXT = 'var(--accent-cyan-contrast)';
/** Texto vazado sobre o neutro: a cor do cartão sobre `--text-muted` mede 5,21:1 e 5,37:1. */
const NEUTRAL_TEXT = 'var(--surface-raised)';

/** Largura mínima (px) para a célula tentar caber nome e valor. */
const MIN_LABEL_WIDTH = 64;
/** Altura mínima (px) para a célula tentar caber nome e valor. */
const MIN_LABEL_HEIGHT = 36;
/** Respiro interno do texto dentro da célula. */
const CELL_PADDING = 8;
const CELL_RADIUS = 4;
/** Vão entre células: revela o fundo em `--surface-raised`, o separador entre segmentos da 17.2. */
const CELL_GAP = 2;
/**
 * Largura por caractere a 12 px, por família de fonte, e aqui ela é SUPERESTIMADA de propósito.
 * A tabela do contrato mede 0,526 em em minúscula de Manrope e 0,590 em em dígito de Space
 * Grotesk; estes valores ficam acima disso. No caso geral subestimar é o lado seguro, porque a
 * peça desenha e a COLISAO-TEXTO pega a consequência; num treemap é o contrário: rótulo que
 * transborda a célula cai sobre a vizinha e nenhuma guarda mede texto contra retângulo, enquanto
 * rótulo escondido é coberto pela lista de identificação abaixo do gráfico.
 */
const NAME_CHAR_WIDTH = 6.6;
const VALUE_CHAR_WIDTH = 7.2;
/** Distância vertical entre linhas de texto dentro da célula. */
const LABEL_LINE_HEIGHT = 16;
/** Distância do topo da célula até a base da primeira linha de texto. */
const FIRST_LINE_OFFSET = 18;
/** Respiro entre a última linha de texto e a base da célula. */
const LAST_LINE_MARGIN = 2;
/** Teto de nome em duas linhas: acima disso a célula fica muda (TIP-7 proíbe reticência). */
const MAX_NAME_LINES = 2;
/** NUM-1: variação inteira a partir de 10%, com uma casa decimal abaixo disso. */
const INTEGER_VARIATION_FLOOR = 0.1;
/** Sinal de menos tipográfico (U+2212), nunca hífen (seção 8, NUM-3). */
const MINUS_SIGN = '−';

/** O texto cabe na largura útil da célula, descontado o respiro dos dois lados. */
function fitsWidth(text: string, width: number, charWidth: number): boolean {
  return text.length * charWidth <= width - CELL_PADDING * 2;
}

/** Altura necessária para desenhar `lineCount` linhas de texto dentro da célula. */
function requiredHeight(lineCount: number): number {
  return FIRST_LINE_OFFSET + (lineCount - 1) * LABEL_LINE_HEIGHT + LAST_LINE_MARGIN;
}

/**
 * O nome é a identidade da célula e nunca sai cortado por reticência (TIP-7). Quando a linha
 * única não cabe, quebra em duas por palavra inteira, no corte mais equilibrado que caiba dos
 * dois lados. Quando nem isso cabe devolve `null`, e a célula fica muda: devolver duas linhas
 * largas demais faria o texto vazar para a célula vizinha, e a seção 5 proíbe contar com
 * `overflow` para esconder o que não cabe.
 */
function wrapName(name: string, width: number): readonly string[] | null {
  if (fitsWidth(name, width, NAME_CHAR_WIDTH)) {
    return [name];
  }
  const words = name.split(' ');
  if (words.length < MAX_NAME_LINES) {
    return null;
  }
  let best: { lines: readonly [string, string]; balance: number } | null = null;
  for (let index = 1; index < words.length; index++) {
    const first = words.slice(0, index).join(' ');
    const second = words.slice(index).join(' ');
    if (fitsWidth(first, width, NAME_CHAR_WIDTH) && fitsWidth(second, width, NAME_CHAR_WIDTH)) {
      const balance = Math.abs(first.length - second.length);
      if (best === null || balance < best.balance) {
        best = { lines: [first, second], balance };
      }
    }
  }
  return best === null ? null : best.lines;
}

/**
 * Nome e valor são avaliados como par (ROT-10): identificação pela metade não é identificação,
 * então a célula ou mostra os dois ou fica muda. A última linha devolvida é sempre o valor.
 */
function measureCellText(
  name: string,
  valueText: string,
  width: number,
  cellHeight: number,
): readonly string[] | null {
  if (width < MIN_LABEL_WIDTH || cellHeight < MIN_LABEL_HEIGHT) {
    return null;
  }
  if (!fitsWidth(valueText, width, VALUE_CHAR_WIDTH)) {
    return null;
  }
  const nameLines = wrapName(name, width);
  if (nameLines === null) {
    return null;
  }
  const lines = [...nameLines, valueText];
  return cellHeight < requiredHeight(lines.length) ? null : lines;
}

/** Receita somada do recorte. `null` em lista vazia, nunca zero (EST-1b). */
function sumRevenue(rows: readonly ProductGrowth[]): number | null {
  if (rows.length === 0) {
    return null;
  }
  return rows.reduce((sum, row) => sum + row.revenue, 0);
}

/** Receita somada do trimestre anterior, só sobre quem tem base medida. `null` sem ninguém. */
function sumPreviousRevenue(rows: readonly ProductGrowth[]): number | null {
  const measured = rows.filter((row) => row.revenuePrevious !== null);
  if (measured.length === 0) {
    return null;
  }
  return measured.reduce((sum, row) => (row.revenuePrevious === null ? sum : sum + row.revenuePrevious), 0);
}

/** Participação de uma parte no todo. `null` quando não há todo a dividir. */
function shareOf(part: number, whole: number | null): number | null {
  if (whole === null || whole === 0) {
    return null;
  }
  return part / whole;
}

/** Crescimento contra a base do próprio produto. `null` sem base medida (EST-4). */
function growthOf(row: ProductGrowth): number | null {
  const base = row.revenuePrevious;
  if (base === null || base === 0) {
    return null;
  }
  return (row.revenue - base) / base;
}

/** Variação com sinal tipográfico sobre o valor absoluto (NUM-3) e precisão da NUM-1. */
function formatVariation(fraction: number): string {
  const digits = Math.abs(fraction) >= INTEGER_VARIATION_FLOOR ? 0 : 1;
  const sign = fraction < 0 ? MINUS_SIGN : '+';
  return `${sign}${formatPercent(Math.abs(fraction), digits)}`;
}

export default function ProductGrowthTreemap({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: ProductGrowthTreemapProps) {
  const drawn = data.filter((product) => product.revenue > 0);
  const excluded = data.filter((product) => product.revenue <= 0);
  const style = height === undefined ? undefined : { height };

  if (drawn.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum produto com receita positiva neste recorte: não houve o que dividir na área.</span>
      </div>
    );
  }

  const total = sumRevenue(drawn);
  const totalPrevious = sumPreviousRevenue(drawn);
  const highlight = drawn.find((product) => product.id === highlightId);
  const highlightGrowth = highlight === undefined ? null : growthOf(highlight);
  const highlightShare = highlight === undefined ? null : shareOf(highlight.revenue, total);
  const highlightSharePrevious =
    highlight === undefined || highlight.revenuePrevious === null
      ? null
      : shareOf(highlight.revenuePrevious, totalPrevious);

  const totalText = total === null ? '' : formatCurrencyCompact(total);
  const highlightBaseText =
    highlight === undefined || highlight.revenuePrevious === null
      ? ''
      : formatCurrencyCompact(highlight.revenuePrevious);
  const highlightGrowthText = highlightGrowth === null ? '' : formatVariation(highlightGrowth);
  const highlightShareText = highlightShare === null ? '' : formatPercent(highlightShare, 0);
  const highlightSharePreviousText =
    highlightSharePrevious === null ? '' : formatPercent(highlightSharePrevious, 1);
  const highlightPointsText =
    highlightShare === null || highlightSharePrevious === null
      ? ''
      : `${highlightShare >= highlightSharePrevious ? '+' : MINUS_SIGN}${formatDecimal(
          Math.abs(highlightShare - highlightSharePrevious) * 100,
          1,
        )}`;

  // ANO-5: uma linha, calculada do dado, e cada variação nomeia a própria base (NUM-4).
  const reading =
    highlight === undefined || highlightGrowthText === '' || highlightBaseText === '' || highlightPointsText === ''
      ? null
      : `${highlight.name}: ${highlightGrowthText} contra ${highlightBaseText} no 2026-T2, e ${highlightPointsText} pontos de participação, de ${highlightSharePreviousText} para ${highlightShareText}.`;

  const excludedSentence =
    excluded.length === 0
      ? null
      : `Fora do desenho: ${excluded
          .map((product) => `${product.name}, ${formatCurrencyCompact(product.revenue)}, ${product.note ?? 'sem valor positivo'}`)
          .join('; ')}.`;

  const summary = [
    `Treemap com a receita reconhecida de ${formatInt(drawn.length)} produtos no 2026-T3; a área é proporcional ao valor.`,
    highlight === undefined || highlightGrowthText === ''
      ? ''
      : `Acende ${highlight.name}, o que mais cresceu: ${highlightGrowthText} contra ${highlightBaseText}, e ${highlightShareText} do total de ${totalText}.`,
    excluded.length === 0 ? '' : `${formatInt(excluded.length)} produto ficou fora do desenho.`,
  ]
    .filter((part) => part !== '')
    .join(' ');

  function renderCell({ x, y, width, height: cellHeight, depth, name, value, ...rest }: TreemapNode): ReactElement {
    if (depth === 0) {
      // Fundo do canvas inteiro: é o que aparece no vão que CELL_GAP abre entre as células.
      return <rect fill="var(--surface-raised)" height={cellHeight} rx={CELL_RADIUS} width={width} x={x} y={y} />;
    }
    const id = typeof rest.id === 'string' ? rest.id : '';
    const isHighlight = id === highlightId;
    const lines = measureCellText(name, formatCurrencyCompact(value), width, cellHeight);
    const lastIndex = lines === null ? -1 : lines.length - 1;
    return (
      <g>
        <rect
          fill={isHighlight ? HIGHLIGHT_FILL : NEUTRAL_FILL}
          height={cellHeight}
          rx={CELL_RADIUS}
          width={width}
          x={x}
          y={y}
        />
        {lines?.map((line, index) => (
          <text
            className={index === lastIndex ? 'font-display' : 'font-sans'}
            fill={isHighlight ? HIGHLIGHT_TEXT : NEUTRAL_TEXT}
            fontSize={12}
            fontWeight={isHighlight ? 700 : 500}
            key={`${id}-${String(index)}`}
            x={x + CELL_PADDING}
            y={y + FIRST_LINE_OFFSET + index * LABEL_LINE_HEIGHT}
          >
            {line}
          </text>
        ))}
      </g>
    );
  }

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {reading === null ? null : (
        <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
          {reading}
        </p>
      )}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <Treemap
            aspectRatio={1}
            content={renderCell}
            data={drawn}
            dataKey="revenue"
            fill={HIGHLIGHT_FILL}
            isAnimationActive={false}
            nameKey="name"
            nodeGap={CELL_GAP}
          />
        </ResponsiveContainer>
      </div>
      {/* Identificação de todo produto desenhado por cor, nome, valor e variação (ROT-10): não
          depende do tamanho que a célula recebeu no layout, então cobre a célula muda. O valor e a
          variação ficam em coluna à direita de cada item (TIP-6). */}
      <ul className="mt-2 grid shrink-0 grid-cols-3 gap-x-4 gap-y-1">
        {drawn.map((product) => {
          const growth = growthOf(product);
          const isHighlight = product.id === highlightId;
          return (
            <li className="flex min-w-0 items-center gap-1.5 text-[0.6875rem]" key={product.id}>
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-sm"
                style={{ backgroundColor: isHighlight ? HIGHLIGHT_FILL : NEUTRAL_FILL }}
              />
              <span className={cn('min-w-0 text-text-secondary', isHighlight && 'font-semibold text-text-primary')}>
                {product.name}
              </span>
              <span className="ml-auto shrink-0 font-display text-text-primary">
                {formatCurrencyCompact(product.revenue)}
              </span>
              {growth === null ? (
                <span className="shrink-0 text-text-muted">sem base</span>
              ) : (
                <span
                  className="shrink-0 font-display"
                  style={{ color: growth < 0 ? 'var(--negative)' : 'var(--positive)' }}
                >
                  {formatVariation(growth)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {excludedSentence === null ? null : (
        <p className="mt-1 shrink-0 text-[0.6875rem] text-text-muted">{excludedSentence}</p>
      )}
    </div>
  );
}
