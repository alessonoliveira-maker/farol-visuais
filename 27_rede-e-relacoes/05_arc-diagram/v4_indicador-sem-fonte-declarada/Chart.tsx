import { Filter } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type DashboardGroup, type IndicatorNode, type ProvenanceMap, type SourceNode } from './data';

/**
 * Arc diagram de procedência em SVG puro, com o eixo na vertical: indicadores por dashboard, fontes
 * de dado e, no fim do eixo, os indicadores sem fonte declarada, que ficam sem arco. Separa duas
 * ausências: o indicador que ninguém declarou de onde vem e a fonte declarada que ninguém usa.
 * Responde o que ficou fora da leitura de risco, e por quê.
 */
export interface UndeclaredProvenanceArcsProps {
  readonly data?: ProvenanceMap;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox repete o corpo medido do cartão, para a escala sair 1 e os 11 px valerem na tela (GEO-18). */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 368;
const TOP_PAD = 10;
/** Coluna do nome do dashboard, à esquerda dos rótulos. */
const GUTTER_WIDTH = 92;
const GUTTER_GAP = 12;
/** Largura média do caractere em Manrope 500 de 12 px: a margem dos rótulos sai do maior nome. */
const NAME_CHAR_WIDTH = 6.4;
/** Coluna da contagem de cada fonte, entre o nome e o nó. */
const COUNT_COLUMN = 30;
/** Do fim do rótulo ao eixo: o maior nó mais a folga. */
const LABEL_GAP = 16;
/** Faixa à direita que os arcos não ocupam: o canto de cima dela abriga a legenda. */
const RIGHT_RESERVE = 110;
const LEGEND_X = 420;
const INDICATOR_PITCH = 14;
const GROUP_GAP = 10;
const SOURCE_PITCH = 20;
/** Vão entre o último indicador e a primeira fonte: abriga o cabeçalho da coluna de contagem. */
const SOURCE_GAP = 26;
/** Vão entre a última fonte e o grupo sem procedência, maior que o vão entre dashboards. */
const ABSENT_GAP = 30;
/** Linha de base do texto a partir do centro da linha, e distância do nó à nota à direita dele. */
const TEXT_DY = 4;
const NOTE_DX = 12;
/** Raio do nó de grau 1; o raio cresce com a raiz do grau, então a área segue o grau (GEO-3). */
const NODE_UNIT = 3;
/** Zero medido: ponto cheio e mínimo. Ausência: anel vazado e maior. Duas formas, não dois tons. */
const ZERO_RADIUS = 2.5;
const ABSENT_RADIUS = 4.5;
const ABSENT_STROKE = 1.5;
const ARC_WIDTH = 1.5;
/** Revestimento na cor do cartão por baixo de cada arco, 1 px de cada lado (TOK-4). */
const CASING = 2;
/** ACE-6: o arco é o dado. `--line-strong` mede 1,79:1; `--text-muted` mede 5,21:1 e 5,37:1. */
const ARC_STROKE = 'var(--text-muted)';
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
  /** Indicadores do dashboard com fonte declarada: são os que entram no bloco. */
  readonly members: readonly IndicatorNode[];
  /** Todos os indicadores do dashboard, com e sem fonte. */
  readonly size: number;
  readonly first: number;
  readonly last: number;
}

/**
 * Empilha no eixo só os indicadores com fonte declarada, um bloco por dashboard. Os sem fonte
 * saem do bloco e vão para o fim do eixo, depois das fontes.
 */
function layoutIndicators(
  map: ProvenanceMap,
  hasSource: (indicator: IndicatorNode) => boolean,
): { readonly blocks: GroupBlock[]; readonly yOf: Map<string, number> } {
  const yOf = new Map<string, number>();
  const blocks: GroupBlock[] = [];
  let cursor = TOP_PAD;
  for (const group of map.groups) {
    const all = map.indicators.filter((indicator) => indicator.groupId === group.id);
    const members = all.filter(hasSource);
    if (members.length === 0) continue;
    members.forEach((member, index) => yOf.set(member.id, cursor + index * INDICATOR_PITCH));
    const last = cursor + (members.length - 1) * INDICATOR_PITCH;
    blocks.push({ group, members, size: all.length, first: cursor, last });
    cursor = last + INDICATOR_PITCH + GROUP_GAP;
  }
  return { blocks, yOf };
}

/**
 * Ordena as fontes pela posição média dos indicadores que dependem delas, de baixo para cima,
 * para os arcos se aninharem. Fonte sem dependente não tem média e vai para o fim: é o zero medido.
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

export default function UndeclaredProvenanceArcs({ data = defaultData, height, className }: UndeclaredProvenanceArcsProps) {
  const style = height === undefined ? undefined : { height };
  const sourceIds = new Set(data.sources.map((source) => source.id));
  const sourcesOf = (indicator: IndicatorNode): string[] => indicator.sources.filter((sourceId) => sourceIds.has(sourceId));
  const { blocks, yOf } = layoutIndicators(data, (indicator) => sourcesOf(indicator).length > 0);
  const placed = blocks.flatMap((block) => block.members);
  // Ausência: o indicador sem nenhuma fonte declarada. Não tem arco porque não há o que ligar.
  const absent = data.indicators.filter((indicator) => sourcesOf(indicator).length === 0);
  const dependents = new Map<string, IndicatorNode[]>();
  for (const indicator of placed) {
    for (const sourceId of sourcesOf(indicator)) dependents.set(sourceId, [...(dependents.get(sourceId) ?? []), indicator]);
  }
  const lastBlock = blocks[blocks.length - 1];
  // Margem dos rótulos calculada pelo maior nome; na fonte, o nome divide a linha com a contagem.
  const labelExtent = extentOf([
    ...data.indicators.map((indicator) => indicator.label.length * NAME_CHAR_WIDTH),
    ...data.sources.map((source) => source.label.length * NAME_CHAR_WIDTH + COUNT_COLUMN),
  ]);
  // ROT-5b: a régua de tamanho do nó vai do menor ao maior grau observado entre os nós com ligação.
  const degreeExtent = extentOf([
    ...placed.map((indicator) => sourcesOf(indicator).length),
    ...[...dependents.values()].map((list) => list.length),
  ]);

  if (lastBlock === undefined || labelExtent === null || degreeExtent === null) {
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
  const firstAbsentY = lastSourceY + ABSENT_GAP;
  const labelRight = GUTTER_WIDTH + GUTTER_GAP + labelExtent[1];
  const axisX = labelRight + LABEL_GAP;

  const links = placed.flatMap((indicator) =>
    sourcesOf(indicator).flatMap((sourceId) => {
      const y0 = yOf.get(indicator.id);
      const y1 = sourceY.get(sourceId);
      return y0 === undefined || y1 === undefined ? [] : [{ key: `${indicator.id}>${sourceId}`, y0, y1 }];
    }),
  );
  // Um fator só para todos os arcos. Aqui o maior raio cabe na largura livre, o fator sai 1 e todo arco é semicírculo.
  const radiusExtent = extentOf(links.map((link) => (link.y1 - link.y0) / 2));
  const flatten = radiusExtent === null ? 1 : Math.min(1, (VIEW_WIDTH - axisX - RIGHT_RESERVE) / radiusExtent[1]);
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const groupById = new Map(data.groups.map((group) => [group.id, group]));

  const total = data.indicators.length;
  const indicatorRows = placed.map((indicator) => {
    const names = sourcesOf(indicator).flatMap((sourceId) => sourceById.get(sourceId)?.label ?? []);
    return {
      indicator,
      y: yOf.get(indicator.id) ?? TOP_PAD,
      degree: names.length,
      title: `${indicator.label}: depende de ${formatInt(names.length)} ${names.length === 1 ? 'fonte' : 'fontes'}, ${listNames(names)}`,
    };
  });
  const sourceRows = ordered.map((source) => {
    const count = dependents.get(source.id)?.length ?? 0;
    return {
      source,
      count,
      y: sourceY.get(source.id) ?? firstSourceY,
      title: `${source.label}: ${formatInt(count)} de ${formatInt(placed.length)} indicadores com fonte dependem dela`,
    };
  });
  const absentRows = absent.map((indicator, index) => ({
    indicator,
    y: firstAbsentY + index * INDICATOR_PITCH,
    title: `${indicator.label}, do dashboard ${groupById.get(indicator.groupId)?.label ?? indicator.groupId}: sem fonte declarada`,
  }));
  // Zero medido: a fonte foi declarada e avaliada, e nenhum indicador a usa. É outra coisa que a ausência.
  const unused = sourceRows.filter((row) => row.count === 0);

  const unusedText =
    unused.length === 0
      ? 'Toda fonte declarada tem ao menos um indicador.'
      : unused.length === 1
        ? `Outra ausência: ${unused[0]?.source.inSentence ?? ''} é fonte declarada com ${formatInt(0)} indicadores.`
        : `Outra ausência: ${listNames(unused.map((row) => row.source.inSentence))} são fontes declaradas com ${formatInt(0)} indicadores.`;
  const absentText =
    absent.length === 0
      ? 'Todo indicador tem fonte declarada.'
      : `Sem fonte declarada, e por isso sem arco: ${formatInt(absent.length)} ${absent.length === 1 ? 'indicador' : 'indicadores'}.`;
  const summary = `Diagrama de arcos da procedência de ${formatInt(total)} indicadores em ${formatInt(ordered.length)} fontes de dado, com ${formatInt(links.length)} dependências. ${absentText} ${unusedText}`;
  const footerParts = [
    ...(absent.length === 0
      ? []
      : [`${formatInt(absent.length)} ${absent.length === 1 ? 'indicador' : 'indicadores'} sem procedência declarada`]),
    ...(unused.length === 0
      ? []
      : [`${formatInt(unused.length)} ${unused.length === 1 ? 'fonte declarada' : 'fontes declaradas'} com ${formatInt(0)} indicadores`]),
  ];
  const [minDegree, maxDegree] = degreeExtent;
  const sizeY = TOP_PAD + 26;
  const sizeTextX = LEGEND_X + 2 * nodeRadius(minDegree) + 2 * nodeRadius(maxDegree) + 12;
  const gutterText = { className: 'font-sans', fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600, x: 0 } as const;
  const noteText = { className: 'font-sans', fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 } as const;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {/* A mensagem vai no topo, e não só no rodapé: é a primeira linha que o olho encontra. */}
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        {absent.length === 0 ? (
          <>
            Todos os <span className="font-semibold tabular-nums text-text-primary">{formatInt(total)}</span> indicadores têm
            fonte declarada.
          </>
        ) : (
          <>
            <span className="font-semibold tabular-nums text-text-primary">
              {formatInt(absent.length)} de {formatInt(total)}
            </span>{' '}
            {absent.length === 1
              ? 'indicador não tem fonte declarada e fica fora da leitura de risco.'
              : 'indicadores não têm fonte declarada e ficam fora da leitura de risco.'}
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
          {links.map((link) => (
            <g key={link.key}>
              <path d={arcPath(axisX, link.y0, link.y1, flatten)} fill="none" stroke={SURFACE} strokeWidth={ARC_WIDTH + CASING} />
              <path d={arcPath(axisX, link.y0, link.y1, flatten)} fill="none" stroke={ARC_STROKE} strokeWidth={ARC_WIDTH} />
            </g>
          ))}
          {blocks.map((block) => (
            <text key={block.group.id}>
              <tspan {...gutterText} y={block.first + TEXT_DY}>
                {block.group.label}
              </tspan>
              <tspan className="font-display" fill="var(--text-muted)" fontSize={11} fontWeight={500} x={0} y={block.first + TEXT_DY + INDICATOR_PITCH}>
                {`${formatInt(block.members.length)} de ${formatInt(block.size)} com fonte`}
              </tspan>
            </text>
          ))}
          {indicatorRows.map(({ indicator, y, degree, title }) => (
            <g key={indicator.id}>
              <title>{title}</title>
              <circle cx={axisX} cy={y} fill={NODE_FILL} r={nodeRadius(degree)} />
              <text className="font-sans" fill="var(--text-secondary)" fontSize={12} fontWeight={500} textAnchor="end" x={labelRight} y={y + TEXT_DY}>
                {indicator.label}
              </text>
            </g>
          ))}
          <text {...gutterText} y={firstSourceY + TEXT_DY}>
            Fontes de dado
          </text>
          <text {...noteText} textAnchor="end" x={labelRight} y={firstSourceY - SOURCE_GAP / 2 - 2}>
            indicadores que dependem
          </text>
          {sourceRows.map(({ source, count, y, title }) => (
            <g key={source.id}>
              <title>{title}</title>
              {/* EST-3: zero medido é zero. A fonte que ninguém usa fica no eixo como ponto mínimo, com o 0 escrito. */}
              <circle cx={axisX} cy={y} fill={NODE_FILL} r={count > 0 ? nodeRadius(count) : ZERO_RADIUS} />
              <text className="font-sans" fill="var(--text-secondary)" fontSize={12} fontWeight={500} textAnchor="end" x={labelRight - COUNT_COLUMN} y={y + TEXT_DY}>
                {source.label}
              </text>
              <text
                className="font-display"
                fill={count > 0 ? 'var(--text-secondary)' : 'var(--text-primary)'}
                fontSize={12}
                fontWeight={count > 0 ? 500 : 600}
                textAnchor="end"
                x={labelRight}
                y={y + TEXT_DY}
              >
                {formatInt(count)}
              </text>
              {count > 0 ? null : (
                <text {...noteText} x={axisX + NOTE_DX} y={y + TEXT_DY}>
                  nenhum indicador usa esta fonte
                </text>
              )}
            </g>
          ))}
          {absentRows.length === 0 ? null : (
            <text>
              <tspan {...gutterText} y={firstAbsentY + TEXT_DY}>
                Sem procedência
              </tspan>
              <tspan className="font-display" fill="var(--text-muted)" fontSize={11} fontWeight={500} x={0} y={firstAbsentY + TEXT_DY + INDICATOR_PITCH}>
                {`${formatInt(absentRows.length)} de ${formatInt(total)}`}
              </tspan>
            </text>
          )}
          {absentRows.map(({ indicator, y, title }) => (
            <g key={indicator.id}>
              <title>{title}</title>
              {/* Ausência: anel vazado, sem preenchimento, com o motivo escrito no lugar onde o arco sairia. */}
              <circle
                cx={axisX}
                cy={y}
                fill="none"
                r={ABSENT_RADIUS - ABSENT_STROKE / 2}
                stroke="var(--text-muted)"
                strokeWidth={ABSENT_STROKE}
              />
              <text className="font-sans" fill="var(--text-primary)" fontSize={12} fontWeight={600} textAnchor="end" x={labelRight} y={y + TEXT_DY}>
                {indicator.label}
              </text>
              <text {...noteText} x={axisX + NOTE_DX} y={y + TEXT_DY}>
                sem fonte declarada
              </text>
            </g>
          ))}
          <line stroke={ARC_STROKE} strokeWidth={ARC_WIDTH} x1={LEGEND_X} x2={LEGEND_X + 18} y1={TOP_PAD} y2={TOP_PAD} />
          <text {...noteText} x={LEGEND_X + 26} y={TOP_PAD + TEXT_DY}>
            depende da fonte
          </text>
          <circle cx={LEGEND_X + nodeRadius(minDegree)} cy={sizeY} fill={NODE_FILL} r={nodeRadius(minDegree)} />
          <circle cx={LEGEND_X + 2 * nodeRadius(minDegree) + 4 + nodeRadius(maxDegree)} cy={sizeY} fill={NODE_FILL} r={nodeRadius(maxDegree)} />
          <text className="font-display" fill="var(--text-muted)" fontSize={11} fontWeight={500} x={sizeTextX} y={sizeY + TEXT_DY}>
            {minDegree === maxDegree
              ? `nó: ${formatInt(maxDegree)} ${maxDegree === 1 ? 'ligação' : 'ligações'}`
              : `nó: ${formatInt(minDegree)} a ${formatInt(maxDegree)} ligações`}
          </text>
        </svg>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] leading-4 tabular-nums text-text-muted">
        {footerParts.length === 0 ? 'Sem arco: nenhum nó.' : `Sem arco: ${footerParts.join('; ')}.`}
      </p>
    </figure>
  );
}
