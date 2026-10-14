import { ArrowLeft, Filter } from 'lucide-react';
import { useState } from 'react';
import { ResponsiveContainer, SunburstChart, type SunburstData } from 'recharts';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, initialPath as defaultInitialPath, type CategoriaPerda } from './data';

/**
 * Sunburst que troca de raiz por clique: o dado do gráfico é sempre a subárvore do caminho aberto.
 * Na raiz o anel interno traz as categorias e o externo os submotivos; dentro de uma categoria o
 * anel interno passa a ser ela mesma, em círculo inteiro, e o externo traz só os submotivos dela.
 * Clicar num setor de categoria desce; clicar numa folha não faz nada, porque não há nível abaixo.
 *
 * O caminho é estado e a árvore é dado: um recorte novo pode apagar o ramo aberto, então o caminho
 * é podado no primeiro id que não existe mais e a peça volta sozinha ao nível acima, em vez de
 * tentar ler um nó inexistente.
 *
 * O que se pode fazer com o mouse também se faz pelo teclado: a mesma descida está na lista de
 * identificação, em botões, porque o SVG do gráfico sai do alcance do leitor de tela.
 */
export interface LossDrilldownSunburstProps {
  readonly data?: readonly CategoriaPerda[];
  /** Caminho aberto na montagem, por id, do nível mais alto para o mais fundo. */
  readonly initialPath?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

/** Distância entre setores vizinhos, que o componente desenha como contorno (COR-5). */
const SECTOR_PADDING = 2;
/**
 * Vão radial entre o anel de categoria e o de submotivo. Maior que o padrão 2 da biblioteca porque
 * dentro de uma categoria aberta os dois anéis têm a MESMA cor, já que a cor pertence à categoria:
 * ali quem separa um nível do outro é raio e borda, e um vão de 2 px deixa a peça ler como um bloco
 * só de tinta.
 */
const RING_PADDING = 6;
/** Furo central: ele guarda o total do nível aberto e, quando há para onde voltar, o botão. */
const INNER_RADIUS = 76;
/** Contorno do setor na cor que separa segmentos dentro do cartão (tabela 17.2). */
const SECTOR_STROKE = 'var(--surface-raised)';
/** Cor do que se pode clicar, na trilha, no voltar e na lista: 9,50:1 e 6,00:1 contra o cartão. */
const ACTION_COLOR = 'var(--chart-1)';
/** Nome do topo da trilha: o nível em que nenhuma categoria está aberta. */
const ROOT_LABEL = 'Todas as perdas';
/**
 * Rótulo nativo do setor. O componente imprime o valor cru de cada nó e não tem prop que o
 * esconda, então o halo opaco na cor de estrutura (ROT-7) é o que torna o número legível sobre
 * qualquer cor de categoria, com o par `--text-primary` sobre `--surface-raised` já aprovado
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

function colorForSlot(slot: CategoriaPerda['slot']): string {
  return CHART_SERIES_COLORS[slot - 1] ?? ACTION_COLOR;
}

/** Soma de uma lista de submotivos. A semente 0 é a definição da soma vazia, não ausência. */
function sumSubmotivos(submotivos: readonly SubmotivoValue[]): number {
  return submotivos.reduce((sum, item) => sum + item.value, 0);
}

interface SubmotivoValue {
  readonly value: number;
}

/** Participação de uma parte no todo. `null` quando não existe todo a dividir (EST-1b). */
function shareOf(part: number, whole: number): number | null {
  if (whole <= 0) {
    return null;
  }
  return part / whole;
}

/** Um nó desenhado no anel interno do nível aberto, com o que a lista precisa para identificá-lo. */
interface LevelNode {
  readonly id: string;
  readonly name: string;
  readonly value: number;
  readonly color: string;
  /** Filhos que ainda serão desenhados no anel externo; vazio numa folha. */
  readonly children: readonly SubmotivoPoint[];
}

interface SubmotivoPoint {
  readonly id: string;
  readonly name: string;
  readonly value: number;
}

/**
 * Resolve o caminho contra a árvore. Devolve a categoria aberta, ou `null` na raiz, e o caminho
 * podado: id que não existe mais é descartado, que é o que faz a peça voltar à raiz quando o
 * filtro global remove o ramo aberto.
 */
function resolveOpen(rows: readonly CategoriaPerda[], path: readonly string[]): CategoriaPerda | null {
  const first = path[0];
  if (first === undefined) {
    return null;
  }
  return rows.find((row) => row.id === first) ?? null;
}

/** Nós do nível aberto: as categorias na raiz, os submotivos dentro de uma categoria. */
function levelNodes(rows: readonly CategoriaPerda[], open: CategoriaPerda | null): readonly LevelNode[] {
  if (open === null) {
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      value: sumSubmotivos([...row.submotivos]),
      color: colorForSlot(row.slot),
      children: [...row.submotivos].sort((a, b) => b.value - a.value),
    }));
  }
  const color = colorForSlot(open.slot);
  return [...open.submotivos]
    .sort((a, b) => b.value - a.value)
    .map((item) => ({ id: item.id, name: item.name, value: item.value, color, children: [] }));
}

/**
 * Árvore do componente. O valor de um nó com filhos é sempre a soma deles, nunca um total
 * declarado à parte, e a cor do ramo é gravada no `fill` do pai e de cada filho.
 *
 * Dentro de uma categoria aberta, ela mesma volta como o anel interno, em círculo inteiro. Não é
 * enfeite: o componente divide o raio por `treeDepth` e conta a raiz, que nunca desenha, então uma
 * árvore de um nível só gastaria metade do anel disponível com um anel vazio por fora. Com a
 * categoria de volta no anel interno a peça usa dois terços, como na raiz, e o leitor continua
 * vendo dentro de que ramo está sem depender só da trilha.
 */
function buildTree(
  open: CategoriaPerda | null,
  nodes: readonly LevelNode[],
  levelTotal: number,
): SunburstData {
  if (open === null) {
    return {
      name: ROOT_LABEL,
      value: levelTotal,
      children: nodes.map((node) => ({
        name: node.name,
        value: node.value,
        fill: node.color,
        nodeId: node.id,
        openable: node.children.length > 0,
        children: node.children.map((child) => ({
          name: child.name,
          value: child.value,
          fill: node.color,
          nodeId: child.id,
          openable: false,
        })),
      })),
    };
  }
  const color = colorForSlot(open.slot);
  return {
    name: ROOT_LABEL,
    value: levelTotal,
    children: [
      {
        name: open.name,
        value: levelTotal,
        fill: color,
        openable: false,
        children: nodes.map((node) => ({
          name: node.name,
          value: node.value,
          fill: color,
          nodeId: node.id,
          openable: false,
        })),
      },
    ],
  };
}

export default function LossDrilldownSunburst({
  data = defaultData,
  initialPath = defaultInitialPath,
  height,
  className,
}: LossDrilldownSunburstProps) {
  const [path, setPath] = useState<readonly string[]>(initialPath);
  const style = height === undefined ? undefined : { height };

  const open = resolveOpen(data, path);
  const nodes = levelNodes(data, open);
  const levelTotal = nodes.reduce((sum, node) => sum + node.value, 0);

  if (levelTotal <= 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma perda neste recorte: não há categoria nem submotivo para dividir no anel.</span>
      </div>
    );
  }

  const tree = buildTree(open, nodes, levelTotal);
  const ranked = [...nodes].sort((a, b) => b.value - a.value);
  const leader = ranked[0];
  const leaderShare = leader === undefined ? null : shareOf(leader.value, levelTotal);
  const leaderShareText = leaderShare === null ? formatUnavailable() : formatPercent(leaderShare, 0);

  const summary =
    open === null
      ? `Gráfico sunburst com ${formatInt(levelTotal)} perdas do trimestre por categoria, no anel interno, e submotivo, no externo. ${leader === undefined ? 'Nenhuma categoria tem perda.' : `${leader.name} lidera com ${formatInt(leader.value)} perdas, ${leaderShareText} do total.`}`
      : `Gráfico sunburst aberto em ${open.name}: ${formatInt(levelTotal)} perdas do trimestre divididas em ${formatInt(nodes.length)} submotivos. ${leader === undefined ? 'Nenhum submotivo tem perda.' : `${leader.name} domina com ${formatInt(leader.value)} perdas, ${leaderShareText} do ramo.`}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <p className="mb-1.5 flex shrink-0 flex-wrap items-center gap-x-1.5 text-xs text-text-muted">
        {open === null ? (
          <span className="font-medium text-text-primary">{ROOT_LABEL}</span>
        ) : (
          <>
            <button
              className="font-medium underline-offset-2 hover:underline"
              onClick={() => {
                setPath([]);
              }}
              style={{ color: ACTION_COLOR }}
              type="button"
            >
              {ROOT_LABEL}
            </button>
            <span aria-hidden>›</span>
            <span className="font-medium text-text-primary">{open.name}</span>
          </>
        )}
      </p>
      {leader === undefined ? null : (
        <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
          <span className="font-bold text-text-primary">{leader.name}</span>{' '}
          {open === null ? 'concentra' : 'domina'}{' '}
          <span className="font-display font-medium text-text-primary">{leaderShareText}</span> das{' '}
          <span className="font-display font-medium text-text-primary">{formatInt(levelTotal)}</span> perdas
          {open === null ? ' do trimestre' : ` de ${open.name}`}
        </p>
      )}
      <div className="relative min-h-0 flex-1">
        <div aria-hidden className="h-full w-full">
          <ResponsiveContainer height="100%" width="100%">
            <SunburstChart
              data={tree}
              fill={ACTION_COLOR}
              innerRadius={INNER_RADIUS}
              onClick={(node: SunburstData) => {
                const nodeId: unknown = node.nodeId;
                const openable: unknown = node.openable;
                if (openable === true && typeof nodeId === 'string') {
                  setPath([nodeId]);
                }
              }}
              padding={SECTOR_PADDING}
              ringPadding={RING_PADDING}
              stroke={SECTOR_STROKE}
              textOptions={SUNBURST_TEXT_OPTIONS}
            />
          </ResponsiveContainer>
        </div>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {open === null ? (
            <>
              <span className="font-display text-2xl font-semibold text-text-primary">{formatInt(levelTotal)}</span>
              <span className="text-[0.6875rem] text-text-muted">perdas no trimestre</span>
            </>
          ) : (
            <>
              <button
                className="pointer-events-auto flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
                onClick={() => {
                  setPath([]);
                }}
                style={{ color: ACTION_COLOR }}
                type="button"
              >
                <ArrowLeft aria-hidden className="size-3" />
                Voltar
              </button>
              <span className="mt-1 text-[0.6875rem] text-text-muted">dentro de {open.name}</span>
            </>
          )}
        </div>
      </div>
      <ul className="mt-2 shrink-0 space-y-1.5">
        {ranked.map((node) => {
          const share = shareOf(node.value, levelTotal);
          const openable = node.children.length > 0;
          return (
            <li key={node.id}>
              <div className="flex items-center gap-1.5 text-xs">
                <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: node.color }} />
                {openable ? (
                  <button
                    className="min-w-0 flex-1 text-left font-medium underline-offset-2 hover:underline"
                    onClick={() => {
                      setPath([node.id]);
                    }}
                    style={{ color: ACTION_COLOR }}
                    type="button"
                  >
                    {node.name}
                  </button>
                ) : (
                  <span className="min-w-0 flex-1 font-medium text-text-primary">{node.name}</span>
                )}
                <span className="font-display w-9 shrink-0 text-right text-text-primary">
                  {share === null ? formatUnavailable() : formatPercent(share, 0)}
                </span>
                <span className="font-display w-9 shrink-0 text-right text-text-muted">{formatInt(node.value)}</span>
              </div>
              {openable ? (
                <p className="ml-3.5 flex flex-wrap gap-x-2 text-[0.6875rem] text-text-muted">
                  {node.children.map((child, index) => (
                    <span key={child.id}>
                      {child.name} <span className="font-display text-text-secondary">{formatInt(child.value)}</span>
                      {index < node.children.length - 1 ? ' ·' : ''}
                    </span>
                  ))}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
