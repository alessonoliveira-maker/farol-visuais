import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type RadialCampaign, type RadialTaxonomy } from './data';

/**
 * Dendrograma radial: a raiz no centro, o raio pela profundidade (plataforma em 46 px, campanha em
 * 90 px, criativo em 128 px) e o ângulo pela ordem da folha. Todas as folhas ficam no mesmo raio,
 * que é o que separa o dendrograma da árvore arrumada. A abertura angular de 10 graus entre a
 * última e a primeira folha existe para o anel ter começo e fim visíveis.
 *
 * A aresta é o elbow polar: arco no raio do pai, da posição dele até a do filho, e depois o
 * segmento radial para fora (`elbowPath`). Ela carrega a relação, então leva cor de dado e não o
 * neutro de referência (ACE-6).
 *
 * O desenho cabe num `viewBox` do tamanho exato do corpo medido (574 x 361 px de um corpo de
 * 574 x 361,5 px), e isso é deliberado: `<svg>` aninhado com `viewBox` maior que a própria caixa
 * encolhe o texto junto, e é assim que 11 px declarados chegam à tela com menos de 11 px. Aqui a
 * escala sai 1 e o piso da TIP-2 vale de fato.
 *
 * Rótulo do perímetro sempre HORIZONTAL, alinhado à direita na metade esquerda do anel
 * (`textAnchor` por sinal do cosseno). O catálogo pedia a metade esquerda girada 180 graus, e a
 * TIP-5 do contrato proíbe `rotate` em texto sem abrir exceção para visual radial: a metade do
 * pedido que sobrevive é o alinhamento, e ela resolve o mesmo problema, que é o rótulo crescer
 * para fora do anel em vez de atravessá-lo.
 *
 * O caminho aceso não muda de cor, muda de espessura e de forma: a aresta engrossa de 1,1 para
 * 3 px, o nó da folha ganha anel em volta e o nome curto da campanha passa a peso 700. Cor não
 * seria segundo canal (ACE-2) e trocar o tom da categoria pelo destaque apagaria justamente a
 * plataforma a que o criativo pertence.
 */
export interface RadialDendrogramProps {
  readonly data?: RadialTaxonomy;
  readonly height?: number;
  readonly className?: string;
}

/** Corpo medido do canvas 640x480 na moldura card, com o caso de uso em uma linha. */
const VIEW_W = 574;
const VIEW_H = 361;
const CENTER_X = 287;
const CENTER_Y = 196;
/** Abertura angular entre a última e a primeira folha, em graus. */
const GAP_DEGREES = 10;
/** Primeira folha um pouco à direita do topo, metade da abertura depois das 12 horas. */
const START_DEGREE = -85;
const R_PLATFORM = 46;
const R_CAMPAIGN = 90;
const R_LEAF = 128;
/** Raio do nome curto da campanha, fora do anel de folhas. */
const R_LABEL = 140;
const DOT_ROOT = 5;
const DOT_PLATFORM = 4;
const DOT_CAMPAIGN = 3;
const DOT_LEAF = 2.2;
const DOT_LEAF_LIT = 3.4;
const RING_LIT = 6.6;
const EDGE_WIDTH = 1.1;
const EDGE_WIDTH_LIT = 3;
const LABEL_FONT_PX = 11;
const READING_FONT_PX = 12;
/** Legenda em três colunas de largura fixa, com o valor alinhado à direita (ROT-5, TIP-6). */
const LEGEND_COLUMN = 190;
const LEGEND_VALUE_X = 178;
const LEGEND_SWATCH = 9;
const LEGEND_Y = 8;
const READING_Y = 34;

function slotColor(slot: number): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** Duas casas bastam para coordenada de caminho, e evita `toFixed` perto de texto de tela. */
function n2(value: number): string {
  return String(Math.round(value * 100) / 100);
}

interface Point {
  readonly x: number;
  readonly y: number;
}

function pointAt(radius: number, degrees: number): Point {
  const radians = (degrees * Math.PI) / 180;
  return { x: CENTER_X + radius * Math.cos(radians), y: CENTER_Y + radius * Math.sin(radians) };
}

/**
 * Elbow polar: arco no raio do pai, de `fromAngle` até `toAngle`, e segmento radial até
 * `outerRadius`. O arco degenera sozinho quando os dois ângulos coincidem (filho único), e aí
 * sobra o segmento radial, que é o desenho certo.
 */
function elbowPath(radius: number, fromAngle: number, toAngle: number, outerRadius: number): string {
  const from = pointAt(radius, fromAngle);
  const to = pointAt(radius, toAngle);
  const outer = pointAt(outerRadius, toAngle);
  const sweep = toAngle >= fromAngle ? 1 : 0;
  return `M ${n2(from.x)},${n2(from.y)} A ${n2(radius)},${n2(radius)} 0 0 ${String(sweep)} ${n2(to.x)},${n2(to.y)} L ${n2(outer.x)},${n2(outer.y)}`;
}

interface PlacedLeaf {
  readonly id: string;
  readonly angle: number;
  readonly lit: boolean;
}

interface PlacedCampaign {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly angle: number;
  readonly slot: number;
  readonly leaves: readonly PlacedLeaf[];
  readonly lit: boolean;
}

interface PlacedPlatform {
  readonly id: string;
  readonly label: string;
  readonly slot: number;
  readonly angle: number;
  readonly total: number;
  readonly campaigns: readonly PlacedCampaign[];
  readonly lit: boolean;
}

interface Layout {
  readonly platforms: readonly PlacedPlatform[];
  readonly total: number;
  readonly campaignCount: number;
}

/**
 * Total de criativos da taxonomia. Devolve `null` para lista vazia, nunca `0` (EST-1b): taxonomia
 * sem plataforma declarada não tem zero criativo, tem ausência de taxonomia, e quem desenha isso
 * é o estado vazio. O `0` das somas é semente de `reduce`, onde somar zero é a definição certa.
 */
function totalCreatives(platforms: RadialTaxonomy['platforms']): number | null {
  if (platforms.length === 0) return null;
  return platforms.reduce(
    (sum, platform) =>
      sum + platform.campaigns.reduce((inner: number, campaign: RadialCampaign) => inner + campaign.creatives, 0),
    0,
  );
}

/** A plataforma com mais criativos, para a linha de leitura e para a frase acessível. */
function leaderOf(platforms: readonly PlacedPlatform[]): PlacedPlatform | null {
  if (platforms.length === 0) return null;
  return [...platforms].sort((a, b) => b.total - a.total)[0] ?? null;
}

function buildLayout(input: RadialTaxonomy, total: number): Layout {
  const step = total > 1 ? (360 - GAP_DEGREES) / (total - 1) : 0;
  let cursor = 0;
  let campaignCount = 0;

  const platforms = input.platforms.map((platform) => {
    const campaigns = platform.campaigns.map((campaign) => {
      const isLitCampaign = campaign.id === input.highlight.campaignId;
      const leaves = Array.from({ length: campaign.creatives }, (_, index) => {
        const angle = START_DEGREE + (cursor + index) * step;
        return {
          id: `${campaign.id}-${String(index)}`,
          angle,
          lit: isLitCampaign && index === input.highlight.creativeIndex,
        };
      });
      cursor += campaign.creatives;
      campaignCount += 1;
      const first = leaves.at(0);
      const last = leaves.at(-1);
      return {
        id: campaign.id,
        code: campaign.code,
        name: campaign.name,
        angle: first && last ? (first.angle + last.angle) / 2 : START_DEGREE,
        slot: platform.slot,
        leaves,
        lit: isLitCampaign,
      };
    });
    const leaves = campaigns.flatMap((campaign) => campaign.leaves);
    const first = leaves.at(0);
    const last = leaves.at(-1);
    return {
      id: platform.id,
      label: platform.label,
      slot: platform.slot,
      angle: first && last ? (first.angle + last.angle) / 2 : START_DEGREE,
      total: leaves.length,
      campaigns,
      lit: campaigns.some((campaign) => campaign.lit),
    };
  });

  return { platforms, total, campaignCount };
}

/** "1 campanha" no singular, "N campanhas" no plural (NUM-6). */
function formatCampaigns(value: number): string {
  return `${formatInt(value)} ${value === 1 ? 'campanha' : 'campanhas'}`;
}

/** "1 plataforma" no singular, "N plataformas" no plural (NUM-6). */
function formatPlatforms(value: number): string {
  return `${formatInt(value)} ${value === 1 ? 'plataforma' : 'plataformas'}`;
}

export default function RadialDendrogram({ data = defaultData, height, className }: RadialDendrogramProps) {
  const style = height === undefined ? undefined : { height };
  const total = totalCreatives(data.platforms);
  const layout = useMemo(() => (total === null || total < 1 ? null : buildLayout(data, total)), [data, total]);

  if (layout === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum criativo neste recorte: sem taxonomia declarada, não há anel a desenhar.</span>
      </div>
    );
  }

  const leader = leaderOf(layout.platforms);
  const leaderShare = leader === null ? null : formatRateWithVolume(leader.total, layout.total);
  const litCampaign = layout.platforms
    .flatMap((platform) => platform.campaigns)
    .find((campaign) => campaign.lit);
  const litPlatform = layout.platforms.find((platform) => platform.lit);
  const pathSentence =
    litCampaign && litPlatform
      ? `O caminho aceso liga o criativo ${data.highlight.label} à campanha ${litCampaign.code}, na plataforma ${litPlatform.label}.`
      : 'Nenhum criativo declarado para acender o caminho até a raiz.';

  const summary = [
    `Dendrograma radial com ${formatInt(layout.total)} criativos em ${formatCampaigns(layout.campaignCount)} e ${formatPlatforms(layout.platforms.length)}.`,
    leader === null || leaderShare === null ? '' : `${leader.label} lidera com ${leaderShare}.`,
    pathSentence,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {layout.platforms.map((platform, index) => (
          <g key={`legend-${platform.id}`}>
            <rect
              fill={slotColor(platform.slot)}
              height={LEGEND_SWATCH}
              rx={2}
              width={LEGEND_SWATCH}
              x={index * LEGEND_COLUMN}
              y={LEGEND_Y}
            />
            <text
              className="font-sans"
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={LABEL_FONT_PX}
              x={index * LEGEND_COLUMN + LEGEND_SWATCH + 5}
              y={LEGEND_Y + LEGEND_SWATCH / 2}
            >
              {platform.label}
            </text>
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-primary)"
              fontSize={LABEL_FONT_PX}
              fontWeight={500}
              textAnchor="end"
              x={index * LEGEND_COLUMN + LEGEND_VALUE_X}
              y={LEGEND_Y + LEGEND_SWATCH / 2}
            >
              {formatRateWithVolume(platform.total, layout.total)}
            </text>
          </g>
        ))}
        <text
          className="font-sans"
          dominantBaseline="central"
          fill="var(--text-secondary)"
          fontSize={READING_FONT_PX}
          x={0}
          y={READING_Y}
        >
          {pathSentence}
        </text>
        {layout.platforms.map((platform) => {
          const point = pointAt(R_PLATFORM, platform.angle);
          return (
            <path
              d={`M ${n2(CENTER_X)},${n2(CENTER_Y)} L ${n2(point.x)},${n2(point.y)}`}
              fill="none"
              key={`edge-root-${platform.id}`}
              stroke={slotColor(platform.slot)}
              strokeWidth={platform.lit ? EDGE_WIDTH_LIT : EDGE_WIDTH}
            />
          );
        })}
        {layout.platforms.flatMap((platform) =>
          platform.campaigns.map((campaign) => (
            <path
              d={elbowPath(R_PLATFORM, platform.angle, campaign.angle, R_CAMPAIGN)}
              fill="none"
              key={`edge-campaign-${campaign.id}`}
              stroke={slotColor(campaign.slot)}
              strokeWidth={campaign.lit ? EDGE_WIDTH_LIT : EDGE_WIDTH}
            />
          )),
        )}
        {layout.platforms.flatMap((platform) =>
          platform.campaigns.flatMap((campaign) =>
            campaign.leaves.map((leaf) => (
              <path
                d={elbowPath(R_CAMPAIGN, campaign.angle, leaf.angle, R_LEAF)}
                fill="none"
                key={`edge-leaf-${leaf.id}`}
                stroke={slotColor(campaign.slot)}
                strokeWidth={leaf.lit ? EDGE_WIDTH_LIT : EDGE_WIDTH}
              />
            )),
          ),
        )}
        <circle cx={CENTER_X} cy={CENTER_Y} fill="var(--text-muted)" r={DOT_ROOT} />
        {layout.platforms.map((platform) => {
          const point = pointAt(R_PLATFORM, platform.angle);
          return (
            <circle
              cx={point.x}
              cy={point.y}
              fill={slotColor(platform.slot)}
              key={`node-platform-${platform.id}`}
              r={DOT_PLATFORM}
            />
          );
        })}
        {layout.platforms.flatMap((platform) =>
          platform.campaigns.map((campaign) => {
            const point = pointAt(R_CAMPAIGN, campaign.angle);
            return (
              <circle
                cx={point.x}
                cy={point.y}
                fill={slotColor(campaign.slot)}
                key={`node-campaign-${campaign.id}`}
                r={campaign.lit ? DOT_CAMPAIGN + 1.4 : DOT_CAMPAIGN}
              />
            );
          }),
        )}
        {layout.platforms.flatMap((platform) =>
          platform.campaigns.flatMap((campaign) =>
            campaign.leaves.map((leaf) => {
              const point = pointAt(R_LEAF, leaf.angle);
              return (
                <g key={`node-leaf-${leaf.id}`}>
                  {leaf.lit ? (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      fill="none"
                      r={RING_LIT}
                      stroke={slotColor(campaign.slot)}
                      strokeWidth={1.4}
                    />
                  ) : null}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    fill={slotColor(campaign.slot)}
                    r={leaf.lit ? DOT_LEAF_LIT : DOT_LEAF}
                  />
                </g>
              );
            }),
          ),
        )}
        {layout.platforms.flatMap((platform) =>
          platform.campaigns.map((campaign) => {
            const point = pointAt(R_LABEL, campaign.angle);
            const toTheRight = Math.cos((campaign.angle * Math.PI) / 180) >= 0;
            return (
              <g key={`label-${campaign.id}`}>
                {/* Nome inteiro da campanha no tooltip nativo, fora do `<text>` para o leitor de
                    tinta das guardas não somar a largura dele ao nome curto. O perímetro desenha o
                    nome curto; o preview não captura tooltip (seção 13) e nada essencial vive só
                    ali (DIC-1). */}
                <title>{campaign.name}</title>
                <text
                  className="font-sans"
                  dominantBaseline="central"
                  fill={campaign.lit ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize={LABEL_FONT_PX}
                  fontWeight={campaign.lit ? 700 : 500}
                  textAnchor={toTheRight ? 'start' : 'end'}
                  x={point.x}
                  y={point.y}
                >
                  {campaign.code}
                </text>
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}
