import { Filter } from 'lucide-react';
import { ResponsiveContainer, SunburstChart, type SunburstData } from 'recharts';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OrigemEntradas } from './data';

/**
 * Sunburst de dois níveis: origem no anel interno, subcanal no externo, ângulo proporcional ao
 * número de entradas. O rótulo nativo do Recharts só imprime o número, sem nome, e não evita
 * sobreposição em setor fino (ponto delicado do modelo); por isso a identificação de nome e
 * valor de cada origem e subcanal vive também na lista abaixo do anel, que não depende do
 * tamanho que o setor recebeu no layout.
 */
export interface OriginSunburstProps {
  readonly data?: readonly OrigemEntradas[];
  readonly height?: number;
  readonly className?: string;
}

/** Vão entre setores vizinhos (COR-5): desenhado como o contorno de cada setor. */
const SECTOR_PADDING = 2;
/** Vão radial entre o anel de origem e o de subcanal. */
const RING_PADDING = 2;
/** Furo central: onde mora o total, numa div absoluta por cima do SVG. */
const INNER_RADIUS = 64;
/** Contorno do setor na cor de estrutura que separa segmentos (tabela 17.2), não o par padrão do
 * componente (stroke branco, fill cinza escuro), ilegível nos dois temas. */
const SECTOR_STROKE = 'var(--surface-raised)';
/**
 * Rótulo nativo do setor: o Recharts só sabe imprimir o número cru de cada nó, sem nome e sem
 * formatação. Como os ramos usam cinco cores categóricas diferentes e só há par aprovado (tabela
 * 17.10, ROT-6) para texto sobre `--chart-1`, o texto ganha um halo opaco na cor de estrutura
 * (`--surface-raised`, ROT-7) por baixo do glifo: o halo vira o fundo composto contra qualquer
 * cor de setor, e o par `--text-primary` sobre `--surface-raised` já está aprovado (14,53:1 no
 * escuro, 17,96:1 no claro). O nome de cada nó, que o componente não imprime, vive na lista
 * abaixo do anel.
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
}

function colorForSlot(slot: OrigemEntradas['slot']): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** Monta a árvore do Recharts: cor gravada no fill de cada nó, do pai e dos filhos, e subcanais
 * ordenados por valor dentro da origem, somando exatamente o pai. */
function buildTree(rows: readonly OrigemEntradas[]): { readonly tree: SunburstData; readonly branches: readonly BuiltBranch[] } {
  const branches = rows.map((origin) => ({
    origin,
    total: origin.subcanais.reduce((sum, sub) => sum + sub.value, 0),
    color: colorForSlot(origin.slot),
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

export default function OriginSunburst({ data = defaultData, height, className }: OriginSunburstProps) {
  const style = height === undefined ? undefined : { height };
  const { tree, branches } = buildTree(data);
  const total = branches.reduce((sum, branch) => sum + branch.total, 0);

  if (total <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma entrada neste recorte: não há origem nem subcanal para dividir no anel.</span>
      </div>
    );
  }

  const ranked = [...branches].sort((a, b) => b.total - a.total);
  const leader = ranked[0];
  const leaderShare = leader ? formatPercent(leader.total / total, 0) : '';
  const topSubcanal = leader ? [...leader.origin.subcanais].sort((a, b) => b.value - a.value)[0] : undefined;

  const summary = leader
    ? `Gráfico sunburst com ${formatInt(total)} entradas de pré-vendas por origem, no anel interno, e subcanal, no externo. ${leader.origin.name} lidera com ${formatInt(leader.total)} entradas, ${leaderShare} do total${topSubcanal ? `; o subcanal ${topSubcanal.name} é o maior dentro dela, com ${formatInt(topSubcanal.value)}` : ''}.`
    : '';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {leader ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">{leader.origin.name}</span> lidera com{' '}
          <span className="font-display font-medium text-text-primary">{formatInt(leader.total)}</span> entradas,{' '}
          <span className="font-display font-medium text-text-primary">{leaderShare}</span> do total
        </p>
      ) : null}
      <div aria-hidden className="relative min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <SunburstChart
            data={tree}
            fill="var(--line-strong)"
            innerRadius={INNER_RADIUS}
            padding={SECTOR_PADDING}
            ringPadding={RING_PADDING}
            stroke={SECTOR_STROKE}
            textOptions={SUNBURST_TEXT_OPTIONS}
          />
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-sm font-semibold text-text-primary">{formatInt(total)}</span>
          <span className="text-[0.6875rem] text-text-muted">entradas</span>
        </div>
      </div>
      <ul className="mt-2 shrink-0 space-y-1.5">
        {ranked.map((branch) => {
          const subcanais = [...branch.origin.subcanais].sort((a, b) => b.value - a.value);
          return (
            <li key={branch.origin.id}>
              <div className="flex items-center gap-1.5 text-xs">
                <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: branch.color }} />
                <span className="min-w-0 flex-1 truncate font-medium text-text-primary">{branch.origin.name}</span>
                <span className="font-display w-9 shrink-0 text-right text-text-primary">{formatPercent(branch.total / total, 0)}</span>
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
