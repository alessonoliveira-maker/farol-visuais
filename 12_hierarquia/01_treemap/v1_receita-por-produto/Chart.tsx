import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { ResponsiveContainer, Tooltip, Treemap, type TreemapNode } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyCompact, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ProductRevenue } from './data';

/**
 * Treemap de um nível: um retângulo por produto, com área proporcional à receita reconhecida
 * no trimestre. Célula que comporta nome e valor formatado junto mostra os dois; célula pequena
 * demais nunca mostra só um dos dois (checklist 27, ROT-10). A identificação completa de todo
 * produto (nome e valor) vive também, sempre, numa lista fora do gráfico: ela não depende do
 * tamanho que a célula recebeu nem da dica, e por isso cobre a célula pequena demais para texto
 * sem precisar adivinhar, célula a célula, o que o layout do Recharts vai desenhar. Produto com
 * valor zero ou negativo sai do desenho, porque área não representa isso, e aparece na mesma
 * lista com o motivo em vez do valor.
 */
export interface ProductTreemapProps {
  readonly data?: readonly ProductRevenue[];
  readonly height?: number;
  readonly className?: string;
}

/** Largura mínima (px) para a célula tentar caber nome e valor. */
const MIN_LABEL_WIDTH = 64;
/** Altura mínima (px) para a célula tentar caber nome e valor. */
const MIN_LABEL_HEIGHT = 36;
/** Respiro interno do texto dentro da célula. */
const CELL_PADDING = 8;
const CELL_RADIUS = 4;
/** Vão entre células (nodeGap do Recharts): revela o fundo em surface-raised, o separador entre
 * segmentos da 17.2, pintado no depth 0. */
const CELL_GAP = 2;
/** Largura média do glifo a 12px (Manrope 500 e Space Grotesk 500): heurística sem medir o DOM. */
const CHAR_WIDTH = 6.3;
/** Distância vertical entre linhas de texto dentro da célula (nome pode quebrar em até duas). */
const LABEL_LINE_HEIGHT = 16;
/** Distância do topo da célula até a base da primeira linha de texto. */
const FIRST_LINE_OFFSET = 18;
/** Respiro entre a última linha do nome e a base da célula, além da própria linha de valor. */
const LAST_LINE_MARGIN = 2;

/** Largura do texto formatado cabe na célula, descontado o respiro dos dois lados. */
function fitsWidth(text: string, width: number): boolean {
  return text.length * CHAR_WIDTH <= width - CELL_PADDING * 2;
}

/** Altura necessária para desenhar `lineCount` linhas de texto dentro da célula. */
function requiredHeight(lineCount: number): number {
  return FIRST_LINE_OFFSET + (lineCount - 1) * LABEL_LINE_HEIGHT + LAST_LINE_MARGIN;
}

/**
 * O nome é a identidade da célula (TIP-7): nunca sai cortado por reticência. Quando a linha
 * única não cabe, quebra em até duas linhas por palavra inteira, buscando o corte mais
 * equilibrado que caiba nos dois lados; nunca reticência, porque a palavra some por inteiro.
 */
function wrapName(name: string, width: number): readonly string[] {
  if (fitsWidth(name, width)) {
    return [name];
  }
  const words = name.split(' ');
  if (words.length < 2) {
    return [name];
  }
  let best: { lines: readonly [string, string]; balance: number } | null = null;
  for (let i = 1; i < words.length; i++) {
    const first = words.slice(0, i).join(' ');
    const second = words.slice(i).join(' ');
    if (fitsWidth(first, width) && fitsWidth(second, width)) {
      const balance = Math.abs(first.length - second.length);
      if (!best || balance < best.balance) {
        best = { lines: [first, second], balance };
      }
    }
  }
  if (best) {
    return best.lines;
  }
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
}

interface CellLabelFit {
  readonly nameLines: readonly string[];
  readonly valueText: string;
  /** Nome e valor cabem juntos: célula nunca mostra só um dos dois (ROT-10). */
  readonly fits: boolean;
}

/** Nome e valor são avaliados como um par: a célula só ganha texto quando os dois cabem juntos,
 * porque identificação pela metade (nome sem número, ou o inverso) não é identificação. */
function measureCellFit(name: string, value: number, width: number, height: number): CellLabelFit {
  const valueText = formatCurrencyCompact(value);
  if (width < MIN_LABEL_WIDTH || height < MIN_LABEL_HEIGHT) {
    return { nameLines: [], valueText, fits: false };
  }
  const nameLines = wrapName(name, width);
  const fits = fitsWidth(valueText, width) && height >= requiredHeight(nameLines.length + 1);
  return { nameLines, valueText, fits };
}

export default function ProductTreemap({ data = defaultData, height, className }: ProductTreemapProps) {
  const visible = data.filter((product) => product.revenue > 0);
  const excluded = data.filter((product) => product.revenue <= 0);
  const style = height === undefined ? undefined : { height };

  if (visible.length === 0) {
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

  const total = visible.reduce((sum, product) => sum + product.revenue, 0);
  const leader = [...visible].sort((a, b) => b.revenue - a.revenue)[0];
  const leaderShare = leader ? formatPercent(leader.revenue / total, 0) : '';

  const excludedSentence =
    excluded.length === 0
      ? ''
      : excluded.length === 1
        ? ` 1 produto ficou fora do desenho, sem receita positiva no período.`
        : ` ${String(excluded.length)} produtos ficaram fora do desenho, sem receita positiva no período.`;

  const summary = leader
    ? `Treemap com a receita reconhecida de ${String(visible.length)} produtos no trimestre; área proporcional ao valor. ${leader.name} lidera com ${formatCurrencyCompact(leader.revenue)}, ${leaderShare} do total de ${formatCurrencyCompact(total)}.${excludedSentence}`
    : '';

  function renderCell({ x, y, width, height: cellHeight, depth, name, value }: TreemapNode): ReactElement {
    if (depth === 0) {
      // Fundo do canvas inteiro: é o que aparece no vão que CELL_GAP abre entre as células.
      return <rect fill="var(--surface-raised)" height={cellHeight} rx={CELL_RADIUS} width={width} x={x} y={y} />;
    }
    const { nameLines, valueText, fits } = measureCellFit(name, value, width, cellHeight);
    return (
      <g>
        <rect fill="var(--chart-1)" height={cellHeight} rx={CELL_RADIUS} width={width} x={x} y={y} />
        {fits ? (
          <>
            {nameLines.map((line, index) => (
              <text
                className="font-sans"
                fill="var(--accent-cyan-contrast)"
                fontSize={12}
                fontWeight={500}
                key={`${name}-${String(index)}`}
                x={x + CELL_PADDING}
                y={y + FIRST_LINE_OFFSET + index * LABEL_LINE_HEIGHT}
              >
                {line}
              </text>
            ))}
            <text
              className="font-display"
              fill="var(--accent-cyan-contrast)"
              fontSize={12}
              fontWeight={600}
              x={x + CELL_PADDING}
              y={y + FIRST_LINE_OFFSET + nameLines.length * LABEL_LINE_HEIGHT}
            >
              {valueText}
            </text>
          </>
        ) : null}
      </g>
    );
  }

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <Treemap
            aspectRatio={1}
            content={renderCell}
            data={visible}
            dataKey="revenue"
            fill="var(--chart-1)"
            isAnimationActive={false}
            nameKey="name"
            nodeGap={CELL_GAP}
          >
            <Tooltip content={<ChartTooltip valueFormat="currencyCompact" />} isAnimationActive={false} />
          </Treemap>
        </ResponsiveContainer>
      </div>
      {/* Identificação de todo produto por cor, nome e valor (ROT-10, checklist 27): não depende
          do tamanho que a célula recebeu no layout do Recharts nem da dica, então cobre também
          a célula pequena demais para nome e valor juntos. Produto fora do desenho (valor zero
          ou negativo) entra com contorno vazado, sem preenchimento, e o motivo no lugar do valor. */}
      <ul className="mt-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1">
        {data.map((product) => (
          <li className="flex items-center gap-1.5 text-[0.6875rem] text-text-secondary" key={product.id}>
            {product.revenue > 0 ? (
              <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: 'var(--chart-1)' }} />
            ) : (
              <span aria-hidden className="size-2 shrink-0 rounded-sm border" style={{ borderColor: 'var(--text-muted)' }} />
            )}
            <span>{product.name}</span>
            {product.revenue > 0 ? (
              <span className="font-display text-text-primary">{formatCurrencyCompact(product.revenue)}</span>
            ) : (
              <span className="text-text-muted">{product.note ?? 'fora do gráfico'}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
