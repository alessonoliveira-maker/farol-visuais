import { Filter } from 'lucide-react';
import { ResponsiveContainer, SunburstChart, type SunburstData } from 'recharts';

import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type OrigemEntradas } from './data';

/**
 * Sunburst de dois níveis com um ramo aceso e todos os outros em neutro: a pergunta é o peso da
 * indicação, então o centro escreve o percentual do ramo aceso em vez do total, e o total vai
 * abaixo dele para a base da conta não desaparecer.
 *
 * Dois anéis do mesmo ângulo não se comparam entre si, porque o arco de fora é mais longo para a
 * mesma fração (GEO-5): por isso todo valor está escrito, no setor e na lista, e a leitura de
 * tamanho acontece dentro de cada anel, nunca entre eles.
 */
export interface HighlightedBranchSunburstProps {
  readonly data?: readonly OrigemEntradas[];
  /** Ramo aceso, por id. Vem da página, nunca do ranking do período. */
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Distância entre setores vizinhos, que o componente desenha como contorno (COR-5). */
const SECTOR_PADDING = 2;
/** Vão radial entre o anel de origem e o de subcanal. */
const RING_PADDING = 2;
/**
 * Furo central: ele guarda o percentual do ramo aceso e a base da conta, em três linhas de texto,
 * e o raio de 72 px também empurra os dois anéis para fora, o que aumenta a distância angular
 * entre rótulos vizinhos no anel externo.
 */
const INNER_RADIUS = 72;
/** Contorno do setor na cor que separa segmentos dentro do cartão (tabela 17.2). */
const SECTOR_STROKE = 'var(--surface-raised)';
/** Ramo aceso. Mesmo hex de `--accent-cyan`, que a seção 7 manda evitar em dado. */
const HIGHLIGHT_FILL = 'var(--chart-1)';
/** Ramos não acesos: o neutro de dado, 5,21:1 no escuro e 5,37:1 no claro contra o cartão. */
const NEUTRAL_FILL = 'var(--text-muted)';
/**
 * Rótulo nativo do setor. O componente imprime o valor cru de cada nó e não tem prop para
 * escondê-lo, então o halo opaco na cor de estrutura (ROT-7) é o que torna o número legível sobre
 * o ciano do ramo aceso e sobre o neutro dos outros, com o par `--text-primary` sobre
 * `--surface-raised` já aprovado (14,53:1 no escuro, 17,96:1 no claro).
 */
const SUNBURST_TEXT_OPTIONS = {
  className: 'font-display',
  fontSize: 11,
  fontWeight: 500,
  fill: 'var(--text-primary)',
  stroke: 'var(--surface-raised)',
  strokeWidth: 4,
  paintOrder: 'stroke fill',
} as const;

interface BuiltBranch {
  readonly origin: OrigemEntradas;
  readonly total: number;
  readonly color: string;
  readonly highlighted: boolean;
}

/** Soma de uma lista de subcanais. A semente 0 é a definição da soma vazia, não ausência. */
function sumSubcanais(subcanais: readonly OrigemEntradas['subcanais'][number][]): number {
  return subcanais.reduce((sum, sub) => sum + sub.value, 0);
}

/** Participação de uma parte no todo. `null` quando não existe todo a dividir (EST-1b). */
function shareOf(part: number, whole: number): number | null {
  if (whole <= 0) {
    return null;
  }
  return part / whole;
}

/**
 * Árvore do componente: a cor do ramo é gravada no `fill` do pai e de cada filho, e o valor do pai
 * é sempre a soma dos filhos, nunca um total declarado à parte. É essa igualdade que faz a abertura
 * angular do anel externo fechar com a do interno por construção.
 */
function buildTree(rows: readonly OrigemEntradas[], highlighted: string): {
  readonly tree: SunburstData;
  readonly branches: readonly BuiltBranch[];
} {
  const branches: readonly BuiltBranch[] = rows.map((origin) => ({
    origin,
    total: sumSubcanais([...origin.subcanais]),
    color: origin.id === highlighted ? HIGHLIGHT_FILL : NEUTRAL_FILL,
    highlighted: origin.id === highlighted,
  }));
  const tree: SunburstData = {
    name: 'Total',
    value: branches.reduce((sum, branch) => sum + branch.total, 0),
    children: branches.map(({ origin, total, color }) => ({
      name: origin.name,
      value: total,
      fill: color,
      children: [...origin.subcanais]
        .sort((a, b) => b.value - a.value)
        .map((sub) => ({ name: sub.name, value: sub.value, fill: color })),
    })),
  };
  return { tree, branches };
}

export default function HighlightedBranchSunburst({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: HighlightedBranchSunburstProps) {
  const style = height === undefined ? undefined : { height };
  const { tree, branches } = buildTree(data, highlightId);
  const total = branches.reduce((sum, branch) => sum + branch.total, 0);

  if (total <= 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma entrada neste recorte: não há origem nem subcanal para dividir no anel.</span>
      </div>
    );
  }

  const highlight = branches.find((branch) => branch.highlighted);
  const highlightShare = highlight === undefined ? null : shareOf(highlight.total, total);
  const highlightShareText = highlightShare === null ? formatUnavailable() : formatPercent(highlightShare, 0);
  const topSubcanal = highlight === undefined ? undefined : [...highlight.origin.subcanais].sort((a, b) => b.value - a.value)[0];
  const ranked = [...branches].sort((a, b) => b.total - a.total);

  const summary =
    highlight === undefined
      ? `Gráfico sunburst das ${formatInt(total)} entradas de pré-vendas: origem no anel interno, subcanal no externo. Nenhum ramo está aceso neste recorte.`
      : `Gráfico sunburst das ${formatInt(total)} entradas de pré-vendas: origem no anel interno, subcanal no externo. ${highlight.origin.name} está acesa com ${formatInt(highlight.total)} entradas, ${highlightShareText} do total${topSubcanal === undefined ? '' : `, e ${topSubcanal.name} é o maior subcanal dela, com ${formatInt(topSubcanal.value)}`}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {highlight === undefined ? null : (
        <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
          <span className="font-bold text-text-primary">{highlight.origin.name}</span> responde por{' '}
          <span className="font-display font-medium text-text-primary">{highlightShareText}</span> das entradas da semana,{' '}
          <span className="font-display font-medium text-text-primary">{formatInt(highlight.total)}</span> de{' '}
          <span className="font-display font-medium text-text-primary">{formatInt(total)}</span>
        </p>
      )}
      <div aria-hidden className="relative min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <SunburstChart
            data={tree}
            fill={NEUTRAL_FILL}
            innerRadius={INNER_RADIUS}
            padding={SECTOR_PADDING}
            ringPadding={RING_PADDING}
            stroke={SECTOR_STROKE}
            textOptions={SUNBURST_TEXT_OPTIONS}
          />
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold text-text-primary">{highlightShareText}</span>
          <span className="text-[0.6875rem] text-text-muted">de {formatInt(total)} entradas</span>
          {highlight === undefined ? null : (
            <span className="text-[0.6875rem] text-text-muted">vieram de {highlight.origin.name}</span>
          )}
        </div>
      </div>
      <ul className="mt-2 shrink-0 space-y-1.5">
        {ranked.map((branch) => {
          const subcanais = [...branch.origin.subcanais].sort((a, b) => b.value - a.value);
          const share = shareOf(branch.total, total);
          return (
            <li key={branch.origin.id}>
              <div className="flex items-center gap-1.5 text-xs">
                <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: branch.color }} />
                <span className={cn('min-w-0 flex-1 text-text-primary', branch.highlighted ? 'font-bold' : 'font-medium')}>
                  {branch.origin.name}
                </span>
                <span className="font-display w-9 shrink-0 text-right text-text-primary">
                  {share === null ? formatUnavailable() : formatPercent(share, 0)}
                </span>
                <span className="font-display w-9 shrink-0 text-right text-text-muted">{formatInt(branch.total)}</span>
              </div>
              <p className="ml-3.5 flex flex-wrap gap-x-2 text-[0.6875rem] text-text-muted">
                {subcanais.map((sub, index) => (
                  <span key={sub.id}>
                    {sub.name} <span className="font-display text-text-secondary">{formatInt(sub.value)}</span>
                    {index < subcanais.length - 1 ? ' ·' : ''}
                  </span>
                ))}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
