import { Filter } from 'lucide-react';
import { ResponsiveContainer, SunburstChart, type SunburstData } from 'recharts';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OrigemEntradas, type SubcanalEntrada } from './data';

/**
 * Sunburst de dois níveis em que o anel externo é preparado antes de desenhar, e não depois: o
 * subcanal fino demais para caber com o próprio rótulo entra num filho "Outros subcanais", e a
 * parte da origem que chegou sem subcanal vira um filho "Não classificado" com a diferença.
 *
 * As duas operações existem pelo mesmo motivo geométrico: a soma dos filhos precisa fechar com o
 * pai, porque é isso que faz a abertura angular do anel externo coincidir com a do interno. Ocultar
 * o fino faria o anel externo encolher dentro do pai; somar a diferença no maior filho mentiria
 * sobre ele. Os dois casos ficam escritos na lista e no rodapé, e nada some calado.
 */
export interface GroupedSubchannelSunburstProps {
  readonly data?: readonly OrigemEntradas[];
  readonly height?: number;
  readonly className?: string;
}

/** Distância entre setores vizinhos, que o componente desenha como contorno (COR-5). */
const SECTOR_PADDING = 2;
/** Vão radial entre o anel de origem e o de subcanal. */
const RING_PADDING = 2;
/** Furo central: ele guarda o total e empurra os dois anéis para fora, o que afasta os rótulos. */
const INNER_RADIUS = 72;
/**
 * Contorno de todo setor. Sai em `--text-muted` e não no `--surface-raised` da COR-5 porque é ele
 * que faz o setor "Não classificado" existir: sem preenchimento, o contorno é a única tinta do nó,
 * e pela ACE-6 o traço que carrega a informação precisa de 3:1 (mede 5,21:1 no escuro e 5,37:1 no
 * claro, contra 1,00:1 de `--surface-raised` no tema claro, que é o mesmo branco do cartão).
 */
const SECTOR_STROKE = 'var(--text-muted)';
/** Preenchimento do "Não classificado": a cor do cartão, o que deixa o setor vazado (ACE-2). */
const UNCLASSIFIED_FILL = 'var(--surface-raised)';
/**
 * Piso de participação abaixo do qual o subcanal entra em "Outros subcanais". O catálogo pede 1%, e
 * 1% não basta: o componente imprime rótulo em TODO setor e não tem piso angular, então quem fixa o
 * piso é a geometria do rótulo. Neste canvas o anel externo tem raio médio de 121,5 px, e dois
 * rótulos vizinhos ficam separados por pi vezes 121,5 vezes a soma das duas participações; a tinta
 * de três dígitos em Space Grotesk a 11 px mede 19,5 px, mais 2 px de halo de cada lado, o que pede
 * 23,5 px de centro a centro. Daí a soma das duas participações precisa passar de 0,062, ou 3,1%
 * cada uma; 4% é o degrau acima, com folga de 10 px no par mais apertado do dado.
 */
const MIN_SECTOR_SHARE = 0.04;
/** Rótulo do filho que reúne os subcanais finos. */
const GROUPED_LABEL = 'Outros subcanais';
/** Rótulo da parte da origem que chegou sem subcanal. */
const UNCLASSIFIED_LABEL = 'Não classificado';
/**
 * Rótulo nativo do setor. O componente imprime o valor cru de cada nó e não tem prop que o esconda,
 * então o halo opaco na cor de estrutura (ROT-7) é o que torna o número legível sobre qualquer cor
 * de origem e sobre o vazado, com o par `--text-primary` sobre `--surface-raised` já aprovado
 * (14,53:1 no escuro, 17,96:1 no claro).
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

/** Um filho já preparado para o anel externo. */
interface PreparedChild {
  readonly id: string;
  readonly name: string;
  readonly value: number;
  readonly fill: string;
  /** Subcanais que o filho reúne; vazia quando o filho é um subcanal declarado. */
  readonly grouped: readonly SubcanalEntrada[];
}

interface PreparedBranch {
  readonly origin: OrigemEntradas;
  readonly total: number;
  readonly color: string;
  readonly children: readonly PreparedChild[];
  /** Parte da origem que chegou sem subcanal; 0 quando a origem fecha com os subcanais. */
  readonly unclassified: number;
}

function colorForSlot(slot: OrigemEntradas['slot']): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** Soma de uma lista de subcanais. A semente 0 é a definição da soma vazia, não ausência. */
function sumValues(items: readonly SubcanalEntrada[]): number {
  return items.reduce((sum, item) => sum + item.value, 0);
}

/** Participação de uma parte no todo. `null` quando não existe todo a dividir (EST-1b). */
function shareOf(part: number, whole: number): number | null {
  if (whole <= 0) {
    return null;
  }
  return part / whole;
}

/**
 * Prepara os filhos de uma origem: subcanal acima do piso fica sozinho, subcanal abaixo do piso
 * entra em "Outros subcanais", e a diferença entre o total declarado e a soma dos subcanais entra
 * em "Não classificado". Os dois filhos sintéticos vão por último, nesta ordem, porque a ausência
 * fecha a composição em vez de se misturar a ela.
 *
 * Um subcanal fino sozinho não vira grupo: agrupar um item só troca o nome dele por um rótulo
 * genérico sem ganhar geometria nenhuma, então nesse caso ele segue desenhado com o próprio nome.
 */
function prepareBranch(origin: OrigemEntradas, floor: number): PreparedBranch {
  const color = colorForSlot(origin.slot);
  const sorted = [...origin.subcanais].sort((a, b) => b.value - a.value);
  const kept = sorted.filter((item) => item.value >= floor);
  const thin = sorted.filter((item) => item.value < floor);
  const children: PreparedChild[] = [];
  const promoted = thin.length === 1 ? thin : [];
  for (const item of [...kept, ...promoted].sort((a, b) => b.value - a.value)) {
    children.push({ id: item.id, name: item.name, value: item.value, fill: color, grouped: [] });
  }
  if (thin.length > 1) {
    children.push({
      id: `${origin.id}-agrupados`,
      name: GROUPED_LABEL,
      value: sumValues(thin),
      fill: color,
      grouped: thin,
    });
  }
  const declared = sumValues(origin.subcanais);
  const unclassified = Math.max(origin.declaredTotal - declared, 0);
  if (unclassified > 0) {
    children.push({
      id: `${origin.id}-nao-classificado`,
      name: UNCLASSIFIED_LABEL,
      value: unclassified,
      fill: UNCLASSIFIED_FILL,
      grouped: [],
    });
  }
  return { origin, total: declared + unclassified, color, children, unclassified };
}

/**
 * Árvore do componente. O valor de cada origem é a soma dos filhos já preparados, nunca o
 * `declaredTotal` lido do dado: os dois coincidem porque "Não classificado" carrega a diferença.
 *
 * O nome do filho leva a origem entre parênteses, e isso não é redundância de rótulo: o componente
 * monta a chave de React de cada setor com o nome do nó mais o índice dele dentro do próprio pai,
 * e dois filhos sintéticos de origens diferentes cairiam na mesma chave, o que faz o React avisar
 * que pode omitir um deles. O nome não é desenhado em lugar nenhum, então o sufixo custa zero.
 */
function buildTree(branches: readonly PreparedBranch[], total: number): SunburstData {
  return {
    name: 'Total',
    value: total,
    children: branches.map((branch) => ({
      name: branch.origin.name,
      value: branch.total,
      fill: branch.color,
      children: branch.children.map((child) => ({
        name: `${child.name} (${branch.origin.name})`,
        value: child.value,
        fill: child.fill,
      })),
    })),
  };
}

export default function GroupedSubchannelSunburst({ data = defaultData, height, className }: GroupedSubchannelSunburstProps) {
  const style = height === undefined ? undefined : { height };
  const grandTotal = data.reduce((sum, origin) => sum + origin.declaredTotal, 0);
  const floor = grandTotal * MIN_SECTOR_SHARE;
  const branches = data.map((origin) => prepareBranch(origin, floor));
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

  const tree = buildTree(branches, total);
  const ranked = [...branches].sort((a, b) => b.total - a.total);
  const leader = ranked[0];
  const leaderShare = leader === undefined ? null : shareOf(leader.total, total);
  const leaderShareText = leaderShare === null ? formatUnavailable() : formatPercent(leaderShare, 0);
  const groupedCount = branches.reduce((sum, branch) => sum + branch.children.reduce((inner, child) => inner + child.grouped.length, 0), 0);
  const unclassifiedTotal = branches.reduce((sum, branch) => sum + branch.unclassified, 0);
  const unclassifiedShare = shareOf(unclassifiedTotal, total);
  const unclassifiedShareText = unclassifiedShare === null ? formatUnavailable() : formatPercent(unclassifiedShare, 0);

  const summary =
    leader === undefined
      ? `Gráfico sunburst das ${formatInt(total)} entradas de pré-vendas: origem no anel interno, subcanal no externo.`
      : `Gráfico sunburst das ${formatInt(total)} entradas de pré-vendas por origem e subcanal. ${leader.origin.name} lidera com ${leaderShareText}; ${formatInt(groupedCount)} subcanais finos entraram em Outros subcanais e ${formatInt(unclassifiedTotal)} entradas saem em vazado, sem subcanal.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {leader === undefined ? null : (
        <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
          <span className="font-bold text-text-primary">{leader.origin.name}</span> lidera com{' '}
          <span className="font-display font-medium text-text-primary">{leaderShareText}</span> das{' '}
          <span className="font-display font-medium text-text-primary">{formatInt(total)}</span> entradas;{' '}
          <span className="font-display font-medium text-text-primary">{formatInt(groupedCount)}</span> subcanais finos foram agrupados
        </p>
      )}
      <div aria-hidden className="relative min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <SunburstChart
            data={tree}
            fill={UNCLASSIFIED_FILL}
            innerRadius={INNER_RADIUS}
            padding={SECTOR_PADDING}
            ringPadding={RING_PADDING}
            stroke={SECTOR_STROKE}
            textOptions={SUNBURST_TEXT_OPTIONS}
          />
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold text-text-primary">{formatInt(total)}</span>
          <span className="text-[0.6875rem] text-text-muted">entradas na semana</span>
        </div>
      </div>
      <ul className="mt-2 shrink-0 space-y-1.5">
        {ranked.map((branch) => {
          const share = shareOf(branch.total, total);
          return (
            <li key={branch.origin.id}>
              <div className="flex items-center gap-1.5 text-xs">
                <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: branch.color }} />
                <span className="min-w-0 flex-1 font-medium text-text-primary">{branch.origin.name}</span>
                <span className="font-display w-9 shrink-0 text-right text-text-primary">
                  {share === null ? formatUnavailable() : formatPercent(share, 0)}
                </span>
                <span className="font-display w-9 shrink-0 text-right text-text-muted">{formatInt(branch.total)}</span>
              </div>
              <p className="ml-3.5 flex flex-wrap gap-x-2 text-[0.6875rem] text-text-muted">
                {branch.children.map((child, index) => (
                  <span key={child.id}>
                    {child.name} <span className="font-display text-text-secondary">{formatInt(child.value)}</span>
                    {child.grouped.length === 0
                      ? ''
                      : ` (${child.grouped.map((item) => `${item.name} ${formatInt(item.value)}`).join(', ')})`}
                    {index < branch.children.length - 1 ? ' ·' : ''}
                  </span>
                ))}
              </p>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Em vazado, <span className="font-display text-text-secondary">{formatInt(unclassifiedTotal)}</span> entradas sem subcanal declarado,{' '}
        <span className="font-display text-text-secondary">{unclassifiedShareText}</span> do total.
      </p>
    </div>
  );
}
