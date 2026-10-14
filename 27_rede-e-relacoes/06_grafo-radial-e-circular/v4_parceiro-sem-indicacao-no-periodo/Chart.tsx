import { Filter, Unplug } from 'lucide-react';
import { useMemo } from 'react';

import { formatDate, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PartnerPeriod, type PartnerReferral } from './data';

/**
 * O grafo egocêntrico de um parceiro num trimestre em que ele não indicou ninguém. O nó central
 * continua no lugar, sem anel do trimestre em volta, para a ausência ter onde ser vista; o que
 * existe de antes vai num anel de fora, em contorno tracejado, com a palavra anterior escrita nele.
 * Ao lado, o texto diz o que aconteceu e o que isso quer dizer. Serve para o cartão vazio não
 * parecer erro de carga.
 *
 * São três estados, e eles não se parecem. Carteira carregada sem indicação no trimestre é zero
 * medido: é o desenho desta versão. Carteira não carregada (`loaded` falso) é ausência de dado: o
 * cartão inteiro dá lugar ao rótulo de `formatUnavailable()` com o ícone `Unplug`, sem grafo
 * (EST-2). Carteira com indicação no trimestre desenha o anel de dentro, cheio.
 *
 * O histórico é contexto, mas o traço dele ainda diz quem o parceiro indicou, então mede 3:1: sai
 * em `--text-muted`, vazado e tracejado, e não em `--line-strong`, que mede 1,79:1 e 1,83:1
 * (ACE-6, TOK-5). Texto sempre horizontal (TIP-5), com a caixa do código empurrada para fora do
 * anel pela própria meia largura e meia altura (`labelDistance`, GEO-19).
 *
 * O `<svg>` tem 220 x 225 px, a altura do corpo medido do cartão, e a escala sai 1 (GEO-18). O
 * texto ao lado é HTML, para as frases quebrarem sozinhas na largura que sobrar.
 */
export interface PartnerEmptyPeriodProps {
  readonly data?: PartnerPeriod;
  readonly height?: number;
  readonly className?: string;
}

/** Altura do corpo do canvas card na moldura card, com o caso de uso em duas linhas. */
const SVG_W = 220;
const SVG_H = 225;
const CENTER_X = 106;
const CENTER_Y = 112;
/** Anel do trimestre em análise. Fica vazio quando não há indicação nele. */
const R_CURRENT = 40;
/** Anel do histórico, de fora. */
const R_HISTORY = 72;
/** Ângulo da costura, em graus: 0 é a direita, e o ângulo cresce em sentido horário. */
const SEAM_DEGREE = 0;
const EGO_RADIUS = 16;
const NODE_RADIUS = 5;
/** Contorno do nó vazado: o anel tem o mesmo tamanho de fora do nó cheio. */
const RING_STROKE = 1.5;
const EDGE_WIDTH = 1.5;
const HISTORY_DASH = '4 4';
const REFERENCE_WIDTH = 1;
const LABEL_GAP = 4;
const LABEL_FONT_PX = 11;
const EGO_FONT_PX = 12;
/** Meia altura da caixa de um rótulo de 11 px, para a conta do afastamento radial (GEO-19). */
const LABEL_HALF_HEIGHT = 5;
/** Largura média por caractere, em em, só para estimar a caixa do rótulo: sempre para mais. */
const CHAR_WIDTH_FACTOR = 0.6;
/** Halo do rótulo que pousa sobre o anel de referência ou sobre um raio (ROT-7). */
const LABEL_HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface Point {
  readonly x: number;
  readonly y: number;
}

interface RingNode {
  readonly account: string;
  readonly date: string;
  readonly point: Point;
  readonly label: Point;
}

interface QuarterRef {
  readonly year: number;
  readonly quarter: number;
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

/** Trimestre de uma data `YYYY-MM-DD`, lido do texto, sem `Date` e sem fuso. */
function quarterOf(iso: string): QuarterRef {
  return { year: Number(iso.slice(0, 4)), quarter: Math.ceil(Number(iso.slice(5, 7)) / 3) };
}

/** Posição do trimestre numa linha do tempo contínua, para comparar antes e depois. */
function quarterIndex(ref: QuarterRef): number {
  return ref.year * 4 + ref.quarter;
}

/** O trimestre por extenso, com o ordinal (NUM-7). O ano é rótulo, não medida. */
function quarterLabel(ref: QuarterRef): string {
  return `${formatInt(ref.quarter)}º trimestre de ${String(ref.year)}`;
}

/** "1 indicação" no singular, "N indicações" no plural (NUM-6). */
function countLabel(value: number, singular: string, plural: string): string {
  return `${formatInt(value)} ${value === 1 ? singular : plural}`;
}

/**
 * Distância do centro até o meio da caixa do rótulo. A caixa é um retângulo e o anel é curvo:
 * somar a meia largura pelo cosseno e a meia altura pelo seno põe a caixa inteira além da tangente
 * do nó, e nenhum canto reentra no anel (GEO-19).
 */
function labelDistance(text: string, degrees: number, radius: number): number {
  const radians = (degrees * Math.PI) / 180;
  const halfWidth = (text.length * LABEL_FONT_PX * CHAR_WIDTH_FACTOR) / 2;
  return (
    radius +
    NODE_RADIUS +
    LABEL_GAP +
    halfWidth * Math.abs(Math.cos(radians)) +
    LABEL_HALF_HEIGHT * Math.abs(Math.sin(radians))
  );
}

/** Nós de um anel em ângulos iguais, a partir de meio setor depois da costura, em sentido horário. */
function ringNodes(items: readonly PartnerReferral[], radius: number): readonly RingNode[] {
  const sector = 360 / Math.max(1, items.length);
  return items.map((item, index) => {
    const angle = SEAM_DEGREE + sector / 2 + index * sector;
    return {
      account: item.account,
      date: item.date,
      point: polar(radius, angle),
      label: polar(labelDistance(item.account, angle, radius), angle),
    };
  });
}

/** Da mais recente à mais antiga; na mesma data, pelo código. */
function byRecency(a: PartnerReferral, b: PartnerReferral): number {
  return compareText(b.date, a.date) || compareText(a.account, b.account);
}

export default function PartnerEmptyPeriod({ data = defaultData, height, className }: PartnerEmptyPeriodProps) {
  const style = height === undefined ? undefined : { height };
  const { year, quarter, referrals } = data;
  const rings = useMemo(() => {
    const now = quarterIndex({ year, quarter });
    const current = referrals.filter((item) => quarterIndex(quarterOf(item.date)) === now).sort(byRecency);
    // Indicação com data depois do trimestre em análise fica fora: o cartão fala só até ele.
    const previous = referrals.filter((item) => quarterIndex(quarterOf(item.date)) < now).sort(byRecency);
    return { current: ringNodes(current, R_CURRENT), previous: ringNodes(previous, R_HISTORY) };
  }, [year, quarter, referrals]);

  if (!data.loaded) {
    // Ausência de dado não é zero (EST-2): sem carteira carregada não há grafo nem histórico.
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>
          Indicações de {data.partner}: {formatUnavailable()}. A carteira ainda não foi carregada, e sem ela não
          há zero a afirmar.
        </span>
      </div>
    );
  }

  const { current, previous } = rings;
  const isEmpty = current.length === 0;
  const periodText = quarterLabel({ year, quarter });
  const loadedText = formatDate(data.loadedUntil);
  // Os dois anéis já vêm da mais recente à mais antiga: a última registrada é a primeira que houver.
  const last = current[0] ?? previous[0] ?? null;
  const previousQuarters = new Set(previous.map((node) => quarterIndex(quarterOf(node.date)))).size;
  const currentText = countLabel(current.length, 'indicação', 'indicações');
  const historyText = `${countLabel(previous.length, 'indicação', 'indicações')} em ${countLabel(previousQuarters, 'trimestre', 'trimestres')}`;

  const headSentence = isEmpty
    ? `Grafo radial do parceiro ${data.partner} sem indicações no ${periodText}: zero medido, com a carteira carregada até ${loadedText}.`
    : `Grafo radial do parceiro ${data.partner} com ${currentText} no ${periodText}, com a carteira carregada até ${loadedText}.`;
  const historySentence =
    previous.length === 0 ? 'não há indicação antes deste trimestre.' : `antes deste trimestre há ${historyText}.`;
  const summary =
    last === null
      ? `${headSentence} Não há nenhuma indicação registrada do parceiro, nem neste trimestre nem antes dele.`
      : `${headSentence} A última indicação registrada é ${last.account}, em ${formatDate(last.date)}; ${historySentence}`;

  const seam = polar(R_HISTORY, SEAM_DEGREE);

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 items-center gap-4', className)}
      role="img"
      style={style}
    >
      <svg aria-hidden className="h-full w-auto shrink-0" viewBox={`0 0 ${String(SVG_W)} ${String(SVG_H)}`}>
        {previous.length > 0 ? (
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            fill="none"
            r={R_HISTORY}
            stroke="var(--line-subtle)"
            strokeWidth={REFERENCE_WIDTH}
          />
        ) : null}

        {/* O raio do histórico ainda diz quem foi indicado (ACE-6): `--text-muted`, 5,21:1 e
            5,37:1. `--line-strong`, que o catálogo pedia, mede 1,79:1 e 1,83:1 (TOK-5). */}
        {previous.map((node) => (
          <line
            key={`edge-previous-${node.account}`}
            stroke="var(--text-muted)"
            strokeDasharray={HISTORY_DASH}
            strokeWidth={EDGE_WIDTH}
            x1={CENTER_X}
            x2={node.point.x}
            y1={CENTER_Y}
            y2={node.point.y}
          />
        ))}
        {current.map((node) => (
          <line
            key={`edge-current-${node.account}`}
            stroke="var(--text-muted)"
            strokeWidth={EDGE_WIDTH}
            x1={CENTER_X}
            x2={node.point.x}
            y1={CENTER_Y}
            y2={node.point.y}
          />
        ))}

        {previous.map((node) => (
          <g key={`node-previous-${node.account}`}>
            {/* Dica fora do `<text>`: traz a data da indicação, que o corpo só escreve para a
                última (DIC-1). */}
            <title>{`${node.account}: indicada em ${formatDate(node.date)}`}</title>
            <circle
              cx={node.point.x}
              cy={node.point.y}
              fill="var(--surface-raised)"
              r={NODE_RADIUS - RING_STROKE / 2}
              stroke="var(--text-muted)"
              strokeWidth={RING_STROKE}
            />
          </g>
        ))}
        {current.map((node) => (
          <g key={`node-current-${node.account}`}>
            <title>{`${node.account}: indicada em ${formatDate(node.date)}`}</title>
            <circle cx={node.point.x} cy={node.point.y} fill="var(--text-secondary)" r={NODE_RADIUS} />
          </g>
        ))}

        <circle cx={CENTER_X} cy={CENTER_Y} fill="var(--chart-1)" r={EGO_RADIUS} />
        {/* Sobre `--chart-1` o texto legível é `--accent-cyan-contrast` (ROT-6). */}
        <text
          className="font-sans tabular-nums"
          dominantBaseline="central"
          fill="var(--accent-cyan-contrast)"
          fontSize={EGO_FONT_PX}
          fontWeight={700}
          textAnchor="middle"
          x={CENTER_X}
          y={CENTER_Y}
        >
          {data.partner}
        </text>

        {previous.length > 0 ? (
          <text
            className="font-sans"
            dominantBaseline="central"
            fill="var(--text-muted)"
            fontSize={LABEL_FONT_PX}
            style={LABEL_HALO}
            textAnchor="middle"
            x={seam.x}
            y={seam.y}
          >
            anterior
          </text>
        ) : null}
        {previous.map((node) => (
          <text
            className="font-sans tabular-nums"
            dominantBaseline="central"
            fill="var(--text-muted)"
            fontSize={LABEL_FONT_PX}
            fontWeight={500}
            key={`label-previous-${node.account}`}
            textAnchor="middle"
            x={node.label.x}
            y={node.label.y}
          >
            {node.account}
          </text>
        ))}
        {current.map((node) => (
          <text
            className="font-sans tabular-nums"
            dominantBaseline="central"
            fill="var(--text-primary)"
            fontSize={LABEL_FONT_PX}
            fontWeight={600}
            key={`label-current-${node.account}`}
            style={LABEL_HALO}
            textAnchor="middle"
            x={node.label.x}
            y={node.label.y}
          >
            {node.account}
          </text>
        ))}
      </svg>

      <div aria-hidden className="flex min-w-0 flex-1 flex-col gap-3 tabular-nums">
        <div className="flex flex-col gap-1">
          {/* O ícone fica num contêiner flex, fora do fluxo do texto: em linha ele engorda a linha
              só no preview (GEO-17). */}
          <p className="flex items-center gap-2 text-xs text-text-secondary">
            {isEmpty ? <Filter aria-hidden className="size-4 shrink-0 text-text-muted" /> : null}
            <span>
              <span className="font-semibold text-text-primary">{isEmpty ? 'Sem indicações' : currentText}</span> de{' '}
              {data.partner} no {periodText}.
            </span>
          </p>
          {isEmpty ? (
            <p className="text-[0.6875rem] leading-4 text-text-muted">
              {/* A data vai em Space Grotesk: em Manrope tabular o "14" abre um vão entre os dois
                  algarismos e a data lê como dois números. */}
              Zero medido: a carteira foi carregada até <span className="font-display">{loadedText}</span> e o
              trimestre fechou sem conta indicada. Parceiro sem dado carregado sai como {formatUnavailable()}, sem
              grafo.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-text-secondary">
            {last === null ? (
              'Nenhuma indicação registrada do parceiro.'
            ) : (
              <>
                Última indicação registrada:{' '}
                <span className="font-semibold text-text-primary">{last.account}</span>, em{' '}
                <span className="font-display">{formatDate(last.date)}</span>, no{' '}
                {quarterLabel(quarterOf(last.date))}.
              </>
            )}
          </p>
          {previous.length > 0 ? (
            <p className="text-[0.6875rem] leading-4 text-text-muted">
              Anterior, em contorno tracejado: {historyText}, da mais recente à mais antiga em sentido horário.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
