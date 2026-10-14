import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type TeamCategory, type TeamNetwork } from './data';

/**
 * Chord sem fita: as equipes no perímetro de um círculo e uma linha fina para cada par que já
 * dividiu oportunidade. A linha diz que a relação existe, e só isso: a espessura é uma só, de
 * propósito, e uma nota no rodapé avisa que ela não mede quantidade. Responde quais equipes já
 * trabalharam juntas e quais nunca dividiram nenhuma oportunidade.
 *
 * A ordem da volta é por categoria e, dentro dela, pelo número de parceiras, com um vão maior
 * entre categorias (`CATEGORY_GAP_STEPS`): assim cada categoria ocupa um trecho só do círculo. O
 * número que ordena vai escrito ao lado de cada nome, então a ordem se explica sem frase (GEO-12).
 *
 * Equipe isolada não some: fica no lugar dela na volta, como anel vazado em `--text-muted`, com a
 * contagem zero escrita. É zero medido, não ausência de dado (EST-3).
 *
 * A linha carrega a relação, então sai em `--text-muted` opaco, que mede 5,21:1 no escuro e 5,37:1
 * no claro (ACE-6). Texto sempre horizontal (TIP-5): à direita do centro o rótulo começa no nó, à
 * esquerda termina nele, e o que encostar em outro é empurrado para longe do equador
 * (`placeLabels`).
 *
 * O `viewBox` tem o tamanho do corpo medido do cartão, 574 x 425 px, e a escala do `<svg>` sai 1.
 */
export interface TeamCircleProps {
  readonly data?: TeamNetwork;
  readonly height?: number;
  readonly className?: string;
}

/** Corpo medido do canvas alto na moldura card, com o caso de uso em duas linhas. */
const VIEW_W = 574;
const VIEW_H = 425;
/** O centro fica 7 px à direita do meio: os rótulos mais largos caem do lado esquerdo. */
const CENTER_X = 294;
const CENTER_Y = 203;
const R_NODE = 142;
const NODE_RADIUS = 5;
/** Contorno do nó isolado: o anel vazado tem o mesmo tamanho de fora do nó cheio. */
const RING_STROKE = 1.5;
const LABEL_GAP = 7;
/** Raio da âncora do rótulo: fora do nó, com vão para a caixa de 10 px não reentrar (GEO-19). */
const LABEL_RADIUS = R_NODE + NODE_RADIUS + LABEL_GAP;
/** A volta começa à esquerda, no meio do primeiro vão, e segue em sentido horário. */
const SEAM_DEGREE = 180;
/** Vão entre duas categorias, em passos de nó. */
const CATEGORY_GAP_STEPS = 1.75;
/** Espessura única de toda linha: a relação é de existência, não de quantidade. */
const EDGE_WIDTH = 1.2;
const LABEL_FONT_PX = 11;
const READING_FONT_PX = 12;
const LABEL_HALF_HEIGHT = 5;
/** Respiro mínimo entre duas caixas de rótulo (ROT-9). */
const LABEL_RESPIRO = 4;
const PUSH_STEP = 2;
const MAX_PUSH_STEPS = 30;
/** Cosseno abaixo do qual o nó está no polo e o rótulo fica centrado: cerca de 2 graus. */
const POLE_EPSILON = 0.035;
/** Largura média por caractere, em em, só para estimar a caixa do rótulo: sempre para mais. */
const CHAR_WIDTH_FACTOR = 0.6;
const READING_Y = 8;
const NOTE_ROWS_Y = [398, 413] as const;
/** Até quantas equipes a frase acessível cita pelo nome antes de passar à contagem. */
const MAX_NAMED = 3;
const UNCATEGORIZED: TeamCategory = { id: 'sem-categoria', label: 'Sem categoria' };

interface Point {
  readonly x: number;
  readonly y: number;
}

interface PlacedTeam {
  readonly id: string;
  readonly label: string;
  readonly degree: number;
  readonly angle: number;
  readonly point: Point;
}

interface PlacedEdge {
  readonly id: string;
  readonly a: PlacedTeam;
  readonly b: PlacedTeam;
}

interface Layout {
  readonly teams: readonly PlacedTeam[];
  readonly edges: readonly PlacedEdge[];
}

/** Duas casas bastam para coordenada, e o SVG do preview fica menor. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function polar(radius: number, degrees: number): Point {
  const radians = (degrees * Math.PI) / 180;
  return { x: round2(CENTER_X + radius * Math.cos(radians)), y: round2(CENTER_Y + radius * Math.sin(radians)) };
}

/** Comparação por código de caractere: a mesma ordem em qualquer idioma de navegador (seção 10). */
function compareText(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}__${b}` : `${b}__${a}`;
}

/**
 * Posiciona as equipes na volta. Par repetido, par de uma equipe com ela mesma e par com id
 * desconhecido não contam. Dentro da categoria o passo é um só; entre duas categorias o vão vale
 * `CATEGORY_GAP_STEPS` passos, e o primeiro vão fica centrado na costura. Equipe com categoria que
 * não está em `categories` não some: vai para um trecho próprio no fim da volta.
 */
function buildLayout(network: TeamNetwork): Layout | null {
  const known = new Set(network.teams.map((team) => team.id));
  const seen = new Set<string>();
  const degree = new Map<string, number>();
  const validPairs: { readonly a: string; readonly b: string }[] = [];
  for (const pair of network.pairs) {
    const key = pairKey(pair.a, pair.b);
    if (pair.a === pair.b || !known.has(pair.a) || !known.has(pair.b) || seen.has(key)) continue;
    seen.add(key);
    validPairs.push(pair);
    degree.set(pair.a, (degree.get(pair.a) ?? 0) + 1);
    degree.set(pair.b, (degree.get(pair.b) ?? 0) + 1);
  }

  const categoryIds = new Set(network.categories.map((category) => category.id));
  const categoryOf = (id: string): string => (categoryIds.has(id) ? id : UNCATEGORIZED.id);
  const categoryList = network.teams.some((team) => !categoryIds.has(team.category))
    ? [...network.categories, UNCATEGORIZED]
    : network.categories;
  // Ordem dentro da categoria: mais parceiras primeiro, empate pelo nome.
  const members = categoryList
    .map((category) =>
      network.teams
        .filter((team) => categoryOf(team.category) === category.id)
        .sort((a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0) || compareText(a.label, b.label)),
    )
    .filter((list) => list.length > 0);
  if (members.length === 0) return null;

  let steps = members.length * CATEGORY_GAP_STEPS;
  for (const list of members) steps += list.length - 1;
  const step = 360 / steps;
  let cursor = SEAM_DEGREE + (CATEGORY_GAP_STEPS * step) / 2;
  const byId = new Map<string, PlacedTeam>();
  const teams: PlacedTeam[] = [];
  for (const list of members) {
    list.forEach((team, index) => {
      const angle = cursor + index * step;
      const placed: PlacedTeam = {
        id: team.id,
        label: team.label,
        degree: degree.get(team.id) ?? 0,
        angle,
        point: polar(R_NODE, angle),
      };
      byId.set(team.id, placed);
      teams.push(placed);
    });
    cursor += (list.length - 1 + CATEGORY_GAP_STEPS) * step;
  }

  const edges = validPairs.flatMap((pair) => {
    const a = byId.get(pair.a);
    const b = byId.get(pair.b);
    return a && b ? [{ id: pairKey(pair.a, pair.b), a, b }] : [];
  });
  return { teams, edges };
}

/** `M xi,yi Q cx,cy xj,yj`: a curva do catálogo, com o controle no centro do círculo. */
function edgePath(edge: PlacedEdge): string {
  return `M ${String(edge.a.point.x)},${String(edge.a.point.y)} Q ${String(CENTER_X)},${String(CENTER_Y)} ${String(edge.b.point.x)},${String(edge.b.point.y)}`;
}

interface LabelSpec {
  readonly id: string;
  readonly angle: number;
  readonly width: number;
}

interface PlacedLabel {
  readonly x: number;
  readonly y: number;
  readonly anchor: 'start' | 'middle' | 'end';
}

interface Box {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

function tooClose(a: Box, b: Box): boolean {
  return (
    a.left < b.right + LABEL_RESPIRO &&
    b.left < a.right + LABEL_RESPIRO &&
    a.top < b.bottom + LABEL_RESPIRO &&
    b.top < a.bottom + LABEL_RESPIRO
  );
}

/** Estimativa grosseira da largura do rótulo, só para a caixa de colisão: sempre para mais. */
function estimateWidth(text: string): number {
  return text.length * LABEL_FONT_PX * CHAR_WIDTH_FACTOR;
}

/**
 * Rótulo horizontal em volta do círculo. A âncora fica no raio `LABEL_RADIUS`; a caixa sobe ou desce
 * meia altura conforme o seno, para ficar inteira do lado de fora. Os rótulos entram do equador
 * para os polos, e o que encostar num já posto é empurrado para longe do equador, de 2 em 2 px.
 */
function placeLabels(specs: readonly LabelSpec[]): ReadonlyMap<string, PlacedLabel> {
  const boxes: Box[] = [];
  const placed = new Map<string, PlacedLabel>();
  const sinOf = (degrees: number): number => Math.sin((degrees * Math.PI) / 180);
  const ordered = [...specs].sort(
    (a, b) => Math.abs(sinOf(a.angle)) - Math.abs(sinOf(b.angle)) || compareText(a.id, b.id),
  );
  for (const spec of ordered) {
    const cos = Math.cos((spec.angle * Math.PI) / 180);
    const sin = sinOf(spec.angle);
    const anchor = Math.abs(cos) < POLE_EPSILON ? 'middle' : cos > 0 ? 'start' : 'end';
    const x = CENTER_X + LABEL_RADIUS * cos;
    const left = anchor === 'start' ? x : anchor === 'end' ? x - spec.width : x - spec.width / 2;
    const away = sin >= 0 ? 1 : -1;
    const boxAt = (centerY: number): Box => ({
      left,
      right: left + spec.width,
      top: centerY - LABEL_HALF_HEIGHT,
      bottom: centerY + LABEL_HALF_HEIGHT,
    });
    let y = CENTER_Y + (LABEL_RADIUS + LABEL_HALF_HEIGHT) * sin;
    let box = boxAt(y);
    for (let tries = 0; tries < MAX_PUSH_STEPS && boxes.some((other) => tooClose(box, other)); tries += 1) {
      y += away * PUSH_STEP;
      box = boxAt(y);
    }
    boxes.push(box);
    placed.set(spec.id, { x: round2(x), y: round2(y), anchor });
  }
  return placed;
}

/** "1 equipe" no singular, "N equipes" no plural: a contagem nunca sai sem o substantivo (NUM-6). */
function countLabel(value: number, singular: string, plural: string): string {
  return `${formatInt(value)} ${value === 1 ? singular : plural}`;
}

/** A contagem ao lado do nome. Equipe isolada escreve o zero, com a palavra da relação (EST-3). */
function partnersText(degree: number): string {
  return degree === 0 ? `${formatInt(degree)} relações` : countLabel(degree, 'parceira', 'parceiras');
}

/** "A", "A e B", "A, B e C". */
function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
}

interface Segment {
  readonly text: string;
  readonly strong?: boolean;
}

/** A linha de leitura em pedaços, para o número sair em Space Grotesk e o resto em Manrope. */
function readingSegments(total: number, connected: number, isolated: number, year: string): readonly Segment[] {
  if (connected === 0) {
    return [
      { text: 'Nenhuma das ' },
      { text: formatInt(total), strong: true },
      { text: ` equipes dividiu oportunidade em ${year}.` },
    ];
  }
  if (isolated === 0) {
    return [
      { text: 'As ' },
      { text: formatInt(total), strong: true },
      { text: ` equipes já dividiram oportunidade em ${year}; nenhuma ficou isolada.` },
    ];
  }
  return [
    { text: formatInt(connected), strong: true },
    { text: ' das ' },
    { text: formatInt(total), strong: true },
    { text: ` equipes já dividiram oportunidade em ${year}; ` },
    { text: formatInt(isolated), strong: true },
    { text: isolated === 1 ? ' nunca dividiu nenhuma.' : ' nunca dividiram nenhuma.' },
  ];
}

export default function TeamCircle({ data = defaultData, height, className }: TeamCircleProps) {
  const style = height === undefined ? undefined : { height };
  const layout = useMemo(() => buildLayout(data), [data]);
  const labels = useMemo(() => {
    if (layout === null) return new Map<string, PlacedLabel>();
    return placeLabels(
      layout.teams.map((team) => ({
        id: team.id,
        angle: team.angle,
        width: estimateWidth(`${team.label}: ${partnersText(team.degree)}`),
      })),
    );
  }, [layout]);

  if (layout === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma equipe neste recorte: sem equipe cadastrada, não há círculo a desenhar.</span>
      </div>
    );
  }

  const total = layout.teams.length;
  const isolatedTeams = layout.teams.filter((team) => team.degree === 0);
  const connected = total - isolatedTeams.length;
  let maxDegree = 0;
  for (const team of layout.teams) maxDegree = Math.max(maxDegree, team.degree);
  // Na ordem da volta, que é a ordem em que o olho encontra as equipes no desenho.
  const leaders = layout.teams.filter((team) => team.degree === maxDegree).map((team) => team.label);
  const isolatedNames = isolatedTeams.map((team) => team.label);

  // O nome da equipe é nome próprio e entra na frase com a palavra equipe na frente: sem ela, a
  // maiúscula de "Vendas A" no meio da oração lê como rótulo colado.
  const leaderSentence =
    connected === 0
      ? ''
      : leaders.length === 1
        ? `a equipe ${leaders[0] ?? ''} lidera, com ${partnersText(maxDegree)}.`
        : leaders.length <= MAX_NAMED
          ? `as equipes ${joinNames(leaders)} empatam na frente, com ${partnersText(maxDegree)} cada.`
          : `${countLabel(leaders.length, 'equipe empata', 'equipes empatam')} na frente, com ${partnersText(maxDegree)} cada.`;
  const isolatedSentence =
    isolatedNames.length === 0
      ? 'Nenhuma equipe ficou isolada.'
      : isolatedNames.length === 1
        ? `Nunca dividiu nenhuma: a equipe ${isolatedNames[0] ?? ''}.`
        : isolatedNames.length <= MAX_NAMED
          ? `Nunca dividiram nenhuma: as equipes ${joinNames(isolatedNames)}.`
          : `${formatInt(isolatedNames.length)} equipes nunca dividiram nenhuma.`;
  const summary = [
    `Grafo circular com ${countLabel(total, 'equipe', 'equipes')} e ${countLabel(layout.edges.length, 'par que dividiu', 'pares que dividiram')} oportunidades em ${data.year}.`,
    connected === 0
      ? ''
      : `${formatInt(connected)} ${connected === 1 ? 'delas tem' : 'delas têm'} ao menos uma parceira; ${leaderSentence}`,
    isolatedSentence,
  ]
    .filter(Boolean)
    .join(' ');

  const segments = readingSegments(total, connected, isolatedTeams.length, data.year);

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <text
          className="font-sans tabular-nums"
          dominantBaseline="central"
          fill="var(--text-secondary)"
          fontSize={READING_FONT_PX}
          x={0}
          y={READING_Y}
        >
          {segments.map((segment, index) =>
            segment.strong ? (
              <tspan
                className="font-display"
                fill="var(--text-primary)"
                fontWeight={600}
                key={`${String(index)}-${segment.text}`}
              >
                {segment.text}
              </tspan>
            ) : (
              <tspan key={`${String(index)}-${segment.text}`}>{segment.text}</tspan>
            ),
          )}
        </text>

        {/* A linha é o dado (ACE-6): `--text-muted` opaco, 5,21:1 e 5,37:1 contra o cartão. A
            espessura é a mesma em toda linha, porque a relação é de existência. */}
        {layout.edges.map((edge) => (
          <path
            d={edgePath(edge)}
            fill="none"
            key={`edge-${edge.id}`}
            stroke="var(--text-muted)"
            strokeWidth={EDGE_WIDTH}
          />
        ))}

        {layout.teams.map((team) =>
          team.degree === 0 ? (
            // Isolada: anel vazado, do mesmo tamanho de fora do nó cheio (ACE-2: forma e palavra).
            <circle
              cx={team.point.x}
              cy={team.point.y}
              fill="var(--surface-raised)"
              key={`node-${team.id}`}
              r={NODE_RADIUS - RING_STROKE / 2}
              stroke="var(--text-muted)"
              strokeWidth={RING_STROKE}
            />
          ) : (
            <circle
              cx={team.point.x}
              cy={team.point.y}
              fill="var(--text-secondary)"
              key={`node-${team.id}`}
              r={NODE_RADIUS}
            />
          ),
        )}

        {layout.teams.map((team) => {
          const label = labels.get(team.id);
          if (!label) return null;
          return (
            <text
              className="font-sans"
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={LABEL_FONT_PX}
              fontWeight={500}
              key={`label-${team.id}`}
              textAnchor={label.anchor}
              x={label.x}
              y={label.y}
            >
              {`${team.label}: `}
              <tspan className="font-display" fill="var(--text-primary)">
                {partnersText(team.degree)}
              </tspan>
            </text>
          );
        })}

        <text
          className="font-sans"
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={LABEL_FONT_PX}
          x={0}
          y={NOTE_ROWS_Y[0]}
        >
          Linha fina: o par já dividiu ao menos uma oportunidade no ano.
        </text>
        <text
          className="font-sans"
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={LABEL_FONT_PX}
          x={0}
          y={NOTE_ROWS_Y[1]}
        >
          A espessura é única e não mede quantas.
        </text>
      </svg>
    </div>
  );
}
