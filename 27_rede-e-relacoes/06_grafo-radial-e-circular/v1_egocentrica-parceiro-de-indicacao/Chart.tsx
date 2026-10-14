import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, egoId as defaultEgoId, type Referral } from './data';

/**
 * Grafo radial egocêntrico: o parceiro fica no centro, as contas que ele indicou no primeiro anel
 * (`R_FIRST`) e as contas que essas indicaram no segundo (`R_SECOND`). Não há simulação: o primeiro
 * anel divide a volta em setores iguais e o segundo abre um leque em torno do ângulo de quem indicou
 * (`buildLayout`). Responde quanto o parceiro alcança de forma direta e indireta, e quais contas
 * diretas levaram a indicação adiante.
 *
 * A volta começa numa costura à direita (`SEAM_DEGREE`), que fica sem nó de propósito: é ali que o
 * grau de cada anel vai escrito, na horizontal, e é dali que o primeiro anel corre em sentido
 * horário, de quem mais indicou adiante a quem não indicou. O critério não está escrito em cada nó,
 * então a ordem é declarada na segunda linha do corpo (GEO-12).
 *
 * Texto sempre horizontal (TIP-5). O catálogo pedia o rótulo girado pelo ângulo e virado 180 graus
 * na metade esquerda; o que sobra do pedido é o rótulo crescer para fora do anel sem atravessá-lo, e
 * isso se resolve sem giro: no primeiro anel o código vai dentro do nó, e no segundo a caixa do
 * texto é empurrada para fora pela própria meia largura e meia altura (`labelDistance`, GEO-19).
 *
 * A aresta carrega a relação, quem indicou quem, então sai em `--text-muted` e não no neutro de
 * referência (ACE-6). Os anéis são referência e ficam em `--line-subtle`.
 *
 * O `viewBox` tem o tamanho do corpo medido do cartão, 422 x 355 px, para a escala do `<svg>` sair
 * 1 e os 11 px declarados chegarem à tela com 11 px (GEO-18).
 */
export interface EgoReferralGraphProps {
  readonly data?: readonly Referral[];
  /** Código da entidade no centro. Id que não indica ninguém em `data` cai no estado vazio. */
  readonly egoId?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Corpo medido do canvas quadrado na moldura card, com o caso de uso em duas linhas. */
const VIEW_W = 422;
const VIEW_H = 355;
const CENTER_X = 211;
const CENTER_Y = 196;
const R_FIRST = 74;
const R_SECOND = 136;
/** Ângulo da costura, em graus: 0 é a direita, e o ângulo cresce em sentido horário. */
const SEAM_DEGREE = 0;
/** Abertura máxima entre duas contas vizinhas do mesmo leque, em graus. */
const CHILD_STEP_MAX = 13;
/** Parte do setor de quem indicou que o leque pode ocupar, para não invadir o setor vizinho. */
const CHILD_FAN_SHARE = 0.7;
const EGO_RADIUS = 18;
/** 14 px de raio: o código de 11 px cabe inteiro no nó, com folga nos quatro cantos da caixa. */
const FIRST_RADIUS = 14;
const SECOND_RADIUS = 4.5;
const EDGE_WIDTH = 1.5;
const RING_WIDTH = 1;
const LABEL_GAP = 4;
const LABEL_FONT_PX = 11;
const READING_FONT_PX = 12;
/** Meia altura da caixa de um rótulo de 11 px, para a conta do afastamento radial (GEO-19). */
const LABEL_HALF_HEIGHT = 5;
/** Largura média por caractere, em em, só para estimar a caixa do rótulo: sempre para mais. */
const CHAR_WIDTH_FACTOR = 0.6;
const READING_Y = 8;
const ORDER_Y = 27;
/** Até quantas contas empatadas a frase acessível cita pelo código antes de passar à contagem. */
const MAX_NAMED_LEADERS = 3;
/** Halo do rótulo que pousa sobre o anel de referência (ROT-7). */
const RING_LABEL_HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface Point {
  readonly x: number;
  readonly y: number;
}

interface SecondNode {
  readonly id: string;
  readonly point: Point;
  readonly label: Point;
}

interface FirstNode {
  readonly id: string;
  readonly point: Point;
  readonly children: readonly SecondNode[];
}

interface Layout {
  readonly first: readonly FirstNode[];
  readonly secondCount: number;
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

/**
 * Distância do centro até o meio da caixa do rótulo do segundo anel. A caixa é um retângulo e o anel
 * é curvo: somar a meia largura pelo cosseno e a meia altura pelo seno põe a caixa inteira além da
 * tangente do nó, em qualquer ângulo, e nenhum canto reentra no anel (GEO-19).
 */
function labelDistance(text: string, degrees: number): number {
  const radians = (degrees * Math.PI) / 180;
  const halfWidth = (text.length * LABEL_FONT_PX * CHAR_WIDTH_FACTOR) / 2;
  return (
    R_SECOND +
    SECOND_RADIUS +
    LABEL_GAP +
    halfWidth * Math.abs(Math.cos(radians)) +
    LABEL_HALF_HEIGHT * Math.abs(Math.sin(radians))
  );
}

/**
 * Monta os dois anéis a partir da lista de indicações. Conta direta é toda conta que o centro
 * indicou; conta indireta é a que uma direta indicou e que ainda não tem lugar no desenho. Conta
 * indicada por duas diretas fica com a primeira da lista, para cada conta ser contada uma vez.
 * Indicação de terceiro grau em diante não é desenhada: o modelo mostra dois graus.
 */
function buildLayout(links: readonly Referral[], egoId: string): Layout | null {
  const direct: string[] = [];
  for (const link of links) {
    if (link.from === egoId && link.to !== egoId && !direct.includes(link.to)) direct.push(link.to);
  }
  if (direct.length === 0) return null;

  const taken = new Set<string>([egoId, ...direct]);
  const childrenOf = new Map<string, readonly string[]>();
  for (const id of direct) {
    const kids: string[] = [];
    for (const link of links) {
      if (link.from !== id || taken.has(link.to)) continue;
      taken.add(link.to);
      kids.push(link.to);
    }
    childrenOf.set(id, kids);
  }
  const kidsOf = (id: string): readonly string[] => childrenOf.get(id) ?? [];

  // Ordem do primeiro anel: quem mais indicou adiante primeiro, empate pelo código.
  const ordered = [...direct].sort((a, b) => kidsOf(b).length - kidsOf(a).length || compareText(a, b));
  const sector = 360 / ordered.length;
  const first = ordered.map((id, index) => {
    // Meio setor depois da costura: a costura cai no vão entre o último nó e o primeiro.
    const angle = SEAM_DEGREE + sector / 2 + index * sector;
    const kids = kidsOf(id);
    const step = Math.min(CHILD_STEP_MAX, (sector * CHILD_FAN_SHARE) / Math.max(1, kids.length - 1));
    const children = kids.map((kid, position) => {
      const kidAngle = angle + (position - (kids.length - 1) / 2) * step;
      return { id: kid, point: polar(R_SECOND, kidAngle), label: polar(labelDistance(kid, kidAngle), kidAngle) };
    });
    return { id, point: polar(R_FIRST, angle), children };
  });
  return { first, secondCount: first.reduce((sum, node) => sum + node.children.length, 0) };
}

/** "1 conta" no singular, "N contas" no plural: a contagem nunca sai sem o substantivo (NUM-6). */
function countLabel(value: number, singular: string, plural: string): string {
  return `${formatInt(value)} ${value === 1 ? singular : plural}`;
}

/** O grau do anel com o indicador ordinal (NUM-7). */
function ringLabel(ring: number): string {
  return `${formatInt(ring)}º grau`;
}

/** "A", "A e B", "A, B e C". */
function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
}

/** Dica do nó do primeiro anel: o número exato de contas que ele indicou, que o corpo só desenha. */
function firstNodeTip(node: FirstNode): string {
  if (node.children.length === 0) return `${node.id}: não indicou nenhuma conta`;
  return `${node.id}: indicou ${countLabel(node.children.length, 'conta', 'contas')}`;
}

export default function EgoReferralGraph({
  data = defaultData,
  egoId = defaultEgoId,
  height,
  className,
}: EgoReferralGraphProps) {
  const style = height === undefined ? undefined : { height };
  const layout = useMemo(() => buildLayout(data, egoId), [data, egoId]);

  if (layout === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma indicação de {egoId} neste recorte: sem conta direta, não há anel a desenhar.</span>
      </div>
    );
  }

  const firstCount = layout.first.length;
  const secondCount = layout.secondCount;
  const total = firstCount + secondCount;
  // O primeiro anel já vem ordenado: o primeiro nó tem o maior leque e o último, o menor.
  const maxKids = layout.first[0]?.children.length ?? 0;
  const minKids = layout.first[firstCount - 1]?.children.length ?? 0;
  const forwarders = layout.first.filter((node) => node.children.length > 0).length;
  const leaders = layout.first.filter((node) => node.children.length === maxKids).map((node) => node.id);

  const orderTail =
    maxKids === minKids
      ? 'em ordem de código.'
      : minKids === 0
        ? 'de quem mais indicou a quem não indicou.'
        : 'de quem mais indicou a quem menos indicou.';
  const orderNote = `${ringLabel(1)} em sentido horário, ${orderTail}`;

  const kidsText = countLabel(maxKids, 'conta', 'contas');
  const forwardSentence =
    maxKids === 0
      ? `Nenhuma das ${formatInt(firstCount)} diretas indicou adiante.`
      : `${formatInt(forwarders)} das ${formatInt(firstCount)} diretas ${forwarders === 1 ? 'indicou' : 'indicaram'} adiante.`;
  const leaderSentence =
    maxKids === 0
      ? ''
      : leaders.length === 1
        ? `${leaders[0] ?? ''} é quem mais indicou, com ${kidsText}.`
        : leaders.length <= MAX_NAMED_LEADERS
          ? `${joinNames(leaders)} empatam na frente, com ${kidsText} cada.`
          : `${countLabel(leaders.length, 'conta empata', 'contas empatam')} na frente, com ${kidsText} cada.`;
  const summary = [
    `Grafo radial egocêntrico do parceiro ${egoId} com ${countLabel(total, 'conta alcançada', 'contas alcançadas')}: ${countLabel(firstCount, 'direta', 'diretas')} no ${ringLabel(1)} e ${countLabel(secondCount, 'indireta', 'indiretas')} no ${ringLabel(2)}.`,
    forwardSentence,
    leaderSentence,
  ]
    .filter(Boolean)
    .join(' ');

  const seamFirst = polar(R_FIRST, SEAM_DEGREE);
  const seamSecond = polar(R_SECOND, SEAM_DEGREE);

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <text
          className="font-sans"
          dominantBaseline="central"
          fill="var(--text-secondary)"
          fontSize={READING_FONT_PX}
          x={0}
          y={READING_Y}
        >
          <tspan fill="var(--text-primary)" fontWeight={600}>
            {egoId}
          </tspan>
          {' alcança '}
          <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
            {formatInt(total)}
          </tspan>
          {total === 1 ? ' conta: ' : ' contas: '}
          <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
            {formatInt(firstCount)}
          </tspan>
          {/* Cada contagem nomeia o anel dela, na ordem de dentro para fora: sem isso, direta e
              1º grau só se ligam na cabeça de quem já conhece o desenho. */}
          {firstCount === 1 ? ' direta, no ' : ' diretas, no '}
          <tspan className="tabular-nums">{ringLabel(1)}</tspan>
          {', e '}
          <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
            {formatInt(secondCount)}
          </tspan>
          {secondCount === 1 ? ' indireta, no ' : ' indiretas, no '}
          <tspan className="tabular-nums">{ringLabel(2)}</tspan>.
        </text>
        <text
          className="font-sans tabular-nums"
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={LABEL_FONT_PX}
          x={0}
          y={ORDER_Y}
        >
          {orderNote}
        </text>

        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          fill="none"
          r={R_FIRST}
          stroke="var(--line-subtle)"
          strokeWidth={RING_WIDTH}
        />
        {secondCount > 0 ? (
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            fill="none"
            r={R_SECOND}
            stroke="var(--line-subtle)"
            strokeWidth={RING_WIDTH}
          />
        ) : null}

        {/* A aresta é o dado (ACE-6): `--text-muted` mede 5,21:1 e 5,37:1 contra o cartão;
            `--line-strong` mede 1,79:1 e 1,83:1 e fica só para referência. */}
        {layout.first.map((node) => (
          <line
            key={`edge-${node.id}`}
            stroke="var(--text-muted)"
            strokeWidth={EDGE_WIDTH}
            x1={CENTER_X}
            x2={node.point.x}
            y1={CENTER_Y}
            y2={node.point.y}
          />
        ))}
        {layout.first.flatMap((node) =>
          node.children.map((child) => (
            <line
              key={`edge-${node.id}-${child.id}`}
              stroke="var(--text-muted)"
              strokeWidth={EDGE_WIDTH}
              x1={node.point.x}
              x2={child.point.x}
              y1={node.point.y}
              y2={child.point.y}
            />
          )),
        )}

        {layout.first.flatMap((node) =>
          node.children.map((child) => (
            <circle
              cx={child.point.x}
              cy={child.point.y}
              fill="var(--text-muted)"
              key={`node-${child.id}`}
              r={SECOND_RADIUS}
            />
          )),
        )}
        {layout.first.map((node) => (
          <g key={`node-${node.id}`}>
            {/* Dica fora do `<text>`, para o leitor de tinta das guardas não somar a largura dela
                ao código. Ela traz a contagem exata do leque, que o corpo só desenha (DIC-1). */}
            <title>{firstNodeTip(node)}</title>
            <circle cx={node.point.x} cy={node.point.y} fill="var(--text-muted)" r={FIRST_RADIUS} />
            {/* Texto vazado na cor do cartão sobre `--text-muted`: 5,21:1 no escuro e 5,37:1 no
                claro. `--text-primary` sobre o mesmo fundo mede 2,79:1 e reprova. */}
            <text
              className="font-sans tabular-nums"
              dominantBaseline="central"
              fill="var(--surface-raised)"
              fontSize={LABEL_FONT_PX}
              fontWeight={600}
              textAnchor="middle"
              x={node.point.x}
              y={node.point.y}
            >
              {node.id}
            </text>
          </g>
        ))}

        <circle cx={CENTER_X} cy={CENTER_Y} fill="var(--chart-1)" r={EGO_RADIUS} />
        {/* Sobre `--chart-1` o texto legível é `--accent-cyan-contrast` (ROT-6). */}
        <text
          className="font-sans tabular-nums"
          dominantBaseline="central"
          fill="var(--accent-cyan-contrast)"
          fontSize={READING_FONT_PX}
          fontWeight={700}
          textAnchor="middle"
          x={CENTER_X}
          y={CENTER_Y}
        >
          {egoId}
        </text>

        <text
          className="font-sans tabular-nums"
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={LABEL_FONT_PX}
          style={RING_LABEL_HALO}
          textAnchor="middle"
          x={seamFirst.x}
          y={seamFirst.y}
        >
          {ringLabel(1)}
        </text>
        {secondCount > 0 ? (
          <text
            className="font-sans tabular-nums"
            dominantBaseline="central"
            fill="var(--text-muted)"
            fontSize={LABEL_FONT_PX}
            style={RING_LABEL_HALO}
            textAnchor="middle"
            x={seamSecond.x}
            y={seamSecond.y}
          >
            {ringLabel(2)}
          </text>
        ) : null}

        {layout.first.flatMap((node) =>
          node.children.map((child) => (
            <text
              className="font-sans tabular-nums"
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={LABEL_FONT_PX}
              fontWeight={500}
              key={`label-${child.id}`}
              textAnchor="middle"
              x={child.label.x}
              y={child.label.y}
            >
              {child.id}
            </text>
          )),
        )}
      </svg>
    </div>
  );
}
