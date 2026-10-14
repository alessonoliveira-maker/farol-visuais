import { Filter } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  highlightId as defaultHighlightId,
  type DashboardGroup,
  type IndicatorNode,
  type ProvenanceMap,
  type SourceNode,
} from './data';

/**
 * Arc diagram de procedência em SVG puro, com o eixo na vertical para os 30 nomes ficarem na
 * horizontal: indicadores agrupados por dashboard, fontes de dado no fim do eixo e um arco por
 * dependência. A fonte selecionada acende os arcos dela. Responde quais indicadores caem se uma
 * fonte de dado parar.
 */
export interface SourceProvenanceArcsProps {
  readonly data?: ProvenanceMap;
  /** Id da fonte acesa. Id que não existe em `sources` deixa o desenho inteiro em neutro. */
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox repete o corpo medido do cartão, para a escala sair 1 e os 11 px valerem na tela (GEO-18). */
const VIEW_WIDTH = 494;
const VIEW_HEIGHT = 526;
const TOP_PAD = 10;
/** Coluna do nome do dashboard, à esquerda dos rótulos. */
const GUTTER_WIDTH = 92;
const GUTTER_GAP = 12;
/** Largura média do caractere em Manrope 500 de 12 px: a margem dos rótulos sai do maior nome. */
const NAME_CHAR_WIDTH = 6.4;
/** Coluna da contagem de cada fonte, entre o nome e o nó. */
const COUNT_COLUMN = 30;
/** Do fim do rótulo ao eixo: o maior nó, de 9 px de raio, mais 7 px de folga. */
const LABEL_GAP = 16;
/** Folga à direita do arco mais longo: meia espessura do arco aceso mais o respiro da borda. */
const RIGHT_PAD = 8;
const INDICATOR_PITCH = 14;
const GROUP_GAP = 10;
const SOURCE_PITCH = 22;
/** Vão entre o último indicador e a primeira fonte: abriga o cabeçalho da coluna de contagem. */
const SOURCE_GAP = 26;
/** Linha de base do texto a partir do centro da linha. */
const TEXT_DY = 4;
/** Raio do nó de grau 1; o raio cresce com a raiz do grau, então a área segue o grau (GEO-3). */
const NODE_UNIT = 3;
const NODE_STROKE = 1.5;
const ARC_WIDTH = 1.5;
const LIT_ARC_WIDTH = 2.5;
/** Revestimento na cor do cartão por baixo de cada arco, 1 px de cada lado (TOK-4). */
const CASING = 2;
/** ACE-6: o arco é o dado. `--line-strong` mede 1,79:1; `--text-muted` mede 5,21:1 e 5,37:1. */
const ARC_STROKE = 'var(--text-muted)';
/** ACE-5: fora do destaque o arco baixa para 0,76, que composto mede 3,58:1 e 3,28:1 (piso em 0,72). */
const DIM_OPACITY = 0.76;
const HIGHLIGHT = 'var(--chart-1)';
const NODE_FILL = 'var(--text-secondary)';
const SURFACE = 'var(--surface-raised)';

/** EST-1b: lista vazia não tem extremos, e a função devolve null em vez de zero. */
function extentOf(values: readonly number[]): readonly [number, number] | null {
  const first = values[0];
  if (first === undefined) return null;
  return values.reduce<readonly [number, number]>(
    ([low, high], value) => [Math.min(low, value), Math.max(high, value)],
    [first, first],
  );
}

/** EST-1b: fonte sem dependente não tem posição média, e a média devolve null em vez de zero. */
function meanOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function nodeRadius(degree: number): number {
  return NODE_UNIT * Math.sqrt(degree);
}

function listNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
}

interface GroupBlock {
  readonly group: DashboardGroup;
  readonly members: readonly IndicatorNode[];
  /** Posição do primeiro e do último nó do bloco no eixo. */
  readonly first: number;
  readonly last: number;
}

/** Empilha os dashboards no eixo, um bloco por grupo com vão entre eles, e devolve o y de cada indicador. */
function layoutIndicators(map: ProvenanceMap): { readonly blocks: GroupBlock[]; readonly yOf: Map<string, number> } {
  const yOf = new Map<string, number>();
  const blocks: GroupBlock[] = [];
  let cursor = TOP_PAD;
  for (const group of map.groups) {
    const members = map.indicators.filter((indicator) => indicator.groupId === group.id);
    if (members.length === 0) continue;
    members.forEach((member, index) => yOf.set(member.id, cursor + index * INDICATOR_PITCH));
    const last = cursor + (members.length - 1) * INDICATOR_PITCH;
    blocks.push({ group, members, first: cursor, last });
    cursor = last + INDICATOR_PITCH + GROUP_GAP;
  }
  return { blocks, yOf };
}

/**
 * Ordena as fontes pela posição média dos indicadores que dependem delas, de baixo para cima: a
 * fonte dos indicadores mais próximos vem primeiro, e os arcos se aninham em vez de se cruzar.
 * Fonte sem dependente não tem média e vai para o fim.
 */
function orderSources(
  sources: readonly SourceNode[],
  dependentPositions: ReadonlyMap<string, readonly number[]>,
): SourceNode[] {
  const mean = new Map(sources.map((source) => [source.id, meanOf(dependentPositions.get(source.id) ?? [])]));
  return [...sources].sort((a, b) => {
    const meanA = mean.get(a.id) ?? null;
    const meanB = mean.get(b.id) ?? null;
    if (meanA === null || meanB === null) return meanA === meanB ? 0 : meanA === null ? 1 : -1;
    return meanB - meanA;
  });
}

/** Meia elipse de cima para baixo, no sentido horário: sai do eixo para a direita. */
function arcPath(x: number, y0: number, y1: number, flatten: number): string {
  const along = (y1 - y0) / 2;
  return `M ${String(x)},${String(y0)} A ${String(along * flatten)},${String(along)} 0 0 1 ${String(x)},${String(y1)}`;
}

export default function SourceProvenanceArcs({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: SourceProvenanceArcsProps) {
  const style = height === undefined ? undefined : { height };
  const { blocks, yOf } = layoutIndicators(data);
  const placed = blocks.flatMap((block) => block.members);
  const sourceIds = new Set(data.sources.map((source) => source.id));
  // Quem depende de cada fonte, na ordem do eixo. Fonte que não existe em `sources` fica fora.
  const dependents = new Map<string, IndicatorNode[]>();
  for (const indicator of placed) {
    for (const sourceId of indicator.sources) {
      if (sourceIds.has(sourceId)) dependents.set(sourceId, [...(dependents.get(sourceId) ?? []), indicator]);
    }
  }
  const lastBlock = blocks[blocks.length - 1];
  // Margem dos rótulos calculada pelo maior nome; na fonte, o nome divide a linha com a contagem.
  const labelExtent = extentOf([
    ...placed.map((indicator) => indicator.label.length * NAME_CHAR_WIDTH),
    ...data.sources.map((source) => source.label.length * NAME_CHAR_WIDTH + COUNT_COLUMN),
  ]);

  if (lastBlock === undefined || labelExtent === null || dependents.size === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma dependência neste recorte: nenhum indicador tem fonte de dado declarada.</span>
      </div>
    );
  }

  const ordered = orderSources(
    data.sources,
    new Map([...dependents].map(([id, list]) => [id, list.map((indicator) => yOf.get(indicator.id) ?? 0)])),
  );
  const firstSourceY = lastBlock.last + INDICATOR_PITCH + SOURCE_GAP;
  const sourceY = new Map(ordered.map((source, index) => [source.id, firstSourceY + index * SOURCE_PITCH]));
  const lastSourceY = firstSourceY + (ordered.length - 1) * SOURCE_PITCH;
  const labelRight = GUTTER_WIDTH + GUTTER_GAP + labelExtent[1];
  const axisX = labelRight + LABEL_GAP;

  const focus = data.sources.find((source) => source.id === highlightId) ?? null;
  const links = placed.flatMap((indicator) =>
    indicator.sources.flatMap((sourceId) => {
      const y0 = yOf.get(indicator.id);
      const y1 = sourceY.get(sourceId);
      if (y0 === undefined || y1 === undefined) return [];
      return [{ key: `${indicator.id}>${sourceId}`, y0, y1, lit: sourceId === focus?.id }];
    }),
  );
  // Um fator só para todos os arcos: elipses semelhantes aninhadas nunca se cruzam. O arco mais
  // longo ocupa a largura livre inteira, e os demais achatam na mesma proporção.
  const radiusExtent = extentOf(links.map((link) => (link.y1 - link.y0) / 2));
  const flatten = radiusExtent === null ? 1 : Math.min(1, (VIEW_WIDTH - axisX - RIGHT_PAD) / radiusExtent[1]);
  // Os neutros primeiro: os arcos da fonte acesa são desenhados por último, com o revestimento por cima.
  const arcs = links.map((link) => ({ ...link, d: arcPath(axisX, link.y0, link.y1, flatten) }));
  const dimArcs = arcs.filter((arc) => !arc.lit);
  const litArcs = arcs.filter((arc) => arc.lit);

  const total = placed.length;
  const hit = new Set((focus === null ? [] : (dependents.get(focus.id) ?? [])).map((indicator) => indicator.id));
  const hitByBlock = blocks.map((block) => ({
    block,
    count: block.members.filter((member) => hit.has(member.id)).length,
  }));
  const worst = hitByBlock.reduce<(typeof hitByBlock)[number] | null>(
    (top, entry) => (entry.count > 0 && (top === null || entry.count > top.count) ? entry : top),
    null,
  );
  const top = ordered.reduce<SourceNode | null>(
    (best, source) =>
      best === null || (dependents.get(source.id)?.length ?? 0) > (dependents.get(best.id)?.length ?? 0) ? source : best,
    null,
  );
  const topCount = top === null ? 0 : (dependents.get(top.id)?.length ?? 0);
  const breakdown = listNames(
    hitByBlock.filter((entry) => entry.count > 0).map((entry) => `${formatInt(entry.count)} ${entry.block.group.inSentence}`),
  );
  const conclusion =
    focus === null
      ? `A fonte com mais dependentes é ${top?.inSentence ?? ''}, com ${formatInt(topCount)} de ${formatInt(total)} indicadores.`
      : `Se ${focus.inSentence} parar, caem ${formatInt(hit.size)} de ${formatInt(total)} indicadores${breakdown === '' ? '' : `: ${breakdown}`}.`;
  const summary = `Diagrama de arcos com ${formatInt(total)} indicadores em ${formatInt(blocks.length)} dashboards e ${formatInt(ordered.length)} fontes de dado, ligados por ${formatInt(links.length)} dependências. ${conclusion}`;
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));

  const indicatorRows = placed.map((indicator) => {
    const names = indicator.sources.flatMap((sourceId) => sourceById.get(sourceId)?.label ?? []);
    return {
      indicator,
      y: yOf.get(indicator.id) ?? TOP_PAD,
      degree: names.length,
      lit: hit.has(indicator.id),
      title:
        names.length === 0
          ? `${indicator.label}: sem fonte declarada`
          : `${indicator.label}: depende de ${formatInt(names.length)} ${names.length === 1 ? 'fonte' : 'fontes'}, ${listNames(names)}`,
    };
  });
  const sourceRows = ordered.map((source) => {
    const own = dependents.get(source.id) ?? [];
    // A dica acrescenta o que o corpo não escreve: de quais dashboards são os indicadores de cada fonte.
    const byDashboard = blocks.flatMap((block) => {
      const inBlock = own.filter((indicator) => indicator.groupId === block.group.id).length;
      return inBlock === 0 ? [] : [`${formatInt(inBlock)} ${block.group.inSentence}`];
    });
    return {
      source,
      count: own.length,
      y: sourceY.get(source.id) ?? firstSourceY,
      lit: source.id === focus?.id,
      title: `${source.label}: ${formatInt(own.length)} de ${formatInt(total)} indicadores${byDashboard.length === 0 ? '' : `, ${listNames(byDashboard)}`}`,
    };
  });

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {/* A amostra do arco aceso abre a linha de leitura e faz o papel de legenda: a cor fica presa à frase que a explica. */}
      <p aria-hidden className="mb-2 flex shrink-0 items-center gap-1.5 text-xs leading-5 text-text-secondary">
        {focus === null ? (
          <span>
            A fonte com mais dependentes é <span className="font-semibold text-text-primary">{top?.inSentence}</span>, com{' '}
            <span className="font-semibold tabular-nums text-text-primary">
              {formatInt(topCount)} de {formatInt(total)}
            </span>{' '}
            indicadores.
          </span>
        ) : (
          <>
            <span aria-hidden className="w-4 shrink-0 rounded-full" style={{ height: LIT_ARC_WIDTH, backgroundColor: HIGHLIGHT }} />
            <span>
              Se <span className="font-semibold text-text-primary">{focus.inSentence}</span> parar, caem{' '}
              <span className="font-semibold tabular-nums text-text-primary">
                {formatInt(hit.size)} de {formatInt(total)}
              </span>{' '}
              indicadores
              {worst === null ? null : (
                <>
                  , <span className="tabular-nums">{formatInt(worst.count)}</span> {worst.block.group.inSentence}
                </>
              )}
              .
            </span>
          </>
        )}
      </p>
      <div className="min-h-0 flex-1">
        {/* xMidYMin: sobrando altura no cartão, o desenho fica colado ao que vem acima, e a escala segue 1. */}
        <svg
          aria-hidden
          className="h-full w-full"
          preserveAspectRatio="xMidYMin meet"
          viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}
        >
          {/* O eixo é interrompido entre os grupos: o vão é o separador de dashboard. */}
          {blocks.map((block) => (
            <line key={block.group.id} stroke="var(--line-subtle)" x1={axisX} x2={axisX} y1={block.first} y2={block.last} />
          ))}
          <line stroke="var(--line-subtle)" x1={axisX} x2={axisX} y1={firstSourceY} y2={lastSourceY} />
          {/* Arco neutro: revestimento e traço juntos, um por vez, para a opacidade não somar onde dois se sobrepõem. */}
          {dimArcs.map((arc) => (
            <g key={arc.key}>
              <path d={arc.d} fill="none" stroke={SURFACE} strokeWidth={ARC_WIDTH + CASING} />
              <path
                d={arc.d}
                fill="none"
                stroke={ARC_STROKE}
                strokeOpacity={focus === null ? undefined : DIM_OPACITY}
                strokeWidth={ARC_WIDTH}
              />
            </g>
          ))}
          {/* Arcos acesos: todos os revestimentos antes de todos os traços. Um por vez, o revestimento de um
              arco recortava o vizinho onde eles convergem para a fonte, e sobravam fios claros no feixe. */}
          {litArcs.map((arc) => (
            <path d={arc.d} fill="none" key={arc.key} stroke={SURFACE} strokeWidth={LIT_ARC_WIDTH + CASING} />
          ))}
          {litArcs.map((arc) => (
            <path d={arc.d} fill="none" key={arc.key} stroke={HIGHLIGHT} strokeWidth={LIT_ARC_WIDTH} />
          ))}
          {hitByBlock.map(({ block, count }) => (
            <text key={block.group.id}>
              <tspan className="font-sans" fill="var(--text-secondary)" fontSize={11} fontWeight={600} x={0} y={block.first + TEXT_DY}>
                {block.group.label}
              </tspan>
              <tspan className="font-display" fill="var(--text-muted)" fontSize={11} fontWeight={500} x={0} y={block.first + TEXT_DY + INDICATOR_PITCH}>
                {focus === null
                  ? `${formatInt(block.members.length)} indicadores`
                  : `${formatInt(count)} de ${formatInt(block.members.length)} caem`}
              </tspan>
            </text>
          ))}
          {indicatorRows.map(({ indicator, y, degree, lit, title }) => (
            <g key={indicator.id}>
              <title>{title}</title>
              {degree > 0 ? (
                <circle cx={axisX} cy={y} fill={lit ? HIGHLIGHT : NODE_FILL} r={nodeRadius(degree)} />
              ) : (
                // Indicador sem fonte: contorno vazado, para a ausência não sumir do eixo.
                <circle
                  cx={axisX}
                  cy={y}
                  fill={SURFACE}
                  r={NODE_UNIT - NODE_STROKE / 2}
                  stroke="var(--text-muted)"
                  strokeWidth={NODE_STROKE}
                />
              )}
              <text
                className="font-sans"
                fill={lit ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={12}
                fontWeight={lit ? 600 : 500}
                textAnchor="end"
                x={labelRight}
                y={y + TEXT_DY}
              >
                {indicator.label}
              </text>
            </g>
          ))}
          <text className="font-sans" fill="var(--text-secondary)" fontSize={11} fontWeight={600} x={0} y={firstSourceY + TEXT_DY}>
            Fontes de dado
          </text>
          <text
            className="font-sans"
            fill="var(--text-muted)"
            fontSize={11}
            fontWeight={500}
            textAnchor="end"
            x={labelRight}
            y={firstSourceY - SOURCE_GAP / 2 - 2}
          >
            indicadores que dependem
          </text>
          {sourceRows.map(({ source, count, y, lit, title }) => (
            <g key={source.id}>
              <title>{title}</title>
              {/* Zero medido: a fonte sem dependente fica no eixo como ponto mínimo, com o 0 escrito (EST-3). */}
              <circle cx={axisX} cy={y} fill={lit ? HIGHLIGHT : NODE_FILL} r={count > 0 ? nodeRadius(count) : NODE_STROKE} />
              {/* TIP-3: peso 700 só no nome e na contagem da fonte acesa. */}
              <text
                className="font-sans"
                fill={lit ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={12}
                fontWeight={lit ? 700 : 500}
                textAnchor="end"
                x={labelRight - COUNT_COLUMN}
                y={y + TEXT_DY}
              >
                {source.label}
              </text>
              <text
                className="font-display"
                fill={lit ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={12}
                fontWeight={lit ? 700 : 500}
                textAnchor="end"
                x={labelRight}
                y={y + TEXT_DY}
              >
                {formatInt(count)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </figure>
  );
}
