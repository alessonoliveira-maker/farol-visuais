import { Filter } from 'lucide-react';

import { formatDecimal, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, HEX_GRID, type UfCode, type UfLeads } from './data';

/**
 * Coroplético divergente por UF sobre malha de hexágonos: cada UF é pintada pelo desvio da sua taxa
 * de qualificação contra a média nacional, em pontos percentuais, com três intensidades de cada lado.
 * Acima da média é --positive e abaixo é --negative (qualificar mais é melhor), o sinal vem escrito em
 * todo hexágono e a UF que mais se afasta leva contorno grosso e anotação. Apoia a decisão de onde
 * investigar a qualificação, para cima ou para baixo.
 */
export interface DeviationChoroplethProps {
  readonly data?: readonly UfLeads[];
  readonly height?: number;
  readonly className?: string;
}

/** Limites de classe sobre o desvio já arredondado a uma casa, em pontos percentuais. */
const NEAR_PP = 2;
const FAR_PP = 5;
/** Largura da célula hexagonal, de ponta para cima: com 40 px cabem a sigla e o desvio com sinal em 11 px. */
const HEX_W = 40;
const HEX_GAP = 2;
const HEX_R = HEX_W / Math.sqrt(3);
const HEX_DRAWN_R = HEX_R - HEX_GAP / Math.sqrt(3);
const ROW_PITCH = HEX_R * 1.5;
const PAD = 2;
const LABEL_SIZE = 11;
/** Linhas de base da sigla e do valor em torno do centro: 13,5 px entre elas deixam 4 px de tinta a tinta. */
const SIGLA_DY = -3.5;
const VALUE_DY = 10;
const SWATCH_W = 14;
const SWATCH_H = 16;
const HIGHLIGHT_STROKE = 2.5;
/** Parcela da cor do lado na mistura com o cartão: fraca e média. A forte é a cor cheia. */
const WEAK_MIX = 20;
const MEDIUM_MIX = 50;

type Side = -1 | 0 | 1;

interface HexCell {
  readonly uf: UfCode;
  readonly cx: number;
  readonly cy: number;
}

interface Bucket {
  readonly side: Side;
  /** 0 na média; 1 fraca, 2 média, 3 forte. */
  readonly level: number;
}

function hexPoints(cx: number, cy: number, radius: number): string {
  const points: string[] = [];
  for (let corner = 0; corner < 6; corner += 1) {
    const angle = (Math.PI / 180) * (60 * corner - 30);
    const x = Math.round((cx + radius * Math.cos(angle)) * 100) / 100;
    const y = Math.round((cy + radius * Math.sin(angle)) * 100) / 100;
    points.push(`${String(x)},${String(y)}`);
  }
  return points.join(' ');
}

/** Geometria pura, calculada uma vez: centro de cada UF, com as linhas ímpares deslocadas meia célula. */
function buildLayout(): { readonly cells: readonly HexCell[]; readonly width: number; readonly height: number } {
  const raw = (Object.keys(HEX_GRID) as UfCode[]).map((uf) => {
    const position = HEX_GRID[uf];
    const half = position.row % 2 === 1 ? HEX_W / 2 : 0;
    return { uf, cx: position.column * HEX_W + half, cy: position.row * ROW_PITCH };
  });
  // Limites do desenho: a malha é constante e nunca vazia, e o laço dispensa o spread sobre lista.
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const cell of raw) {
    minX = Math.min(minX, cell.cx - HEX_W / 2 - PAD);
    maxX = Math.max(maxX, cell.cx + HEX_W / 2 + PAD);
    minY = Math.min(minY, cell.cy - HEX_R - PAD);
    maxY = Math.max(maxY, cell.cy + HEX_R + PAD);
  }
  const cells = raw.map((cell) => ({
    uf: cell.uf,
    cx: Math.round((cell.cx - minX) * 100) / 100,
    cy: Math.round((cell.cy - minY) * 100) / 100,
  }));
  return { cells, width: Math.ceil(maxX - minX), height: Math.ceil(maxY - minY) };
}

const LAYOUT = buildLayout();

/** Média nacional pelas contagens (qualificados sobre leads), que é a média ponderada pelo volume. */
function nationalRate(rows: readonly UfLeads[]): number | null {
  let leads = 0;
  let qualified = 0;
  for (const row of rows) {
    if (row.leads <= 0) continue;
    leads += row.leads;
    qualified += row.qualified;
  }
  return leads === 0 ? null : qualified / leads;
}

/** Taxa em décimos de ponto percentual, a precisão em que é escrita. UF sem lead é ausência, nunca zero. */
function rateTenths(entry: UfLeads): number | null {
  if (entry.leads <= 0) return null;
  return Math.round((entry.qualified / entry.leads) * 1000);
}

/** Classe do desvio, medido em décimos de ponto: o limite pertence à classe mais forte, dos dois lados. */
function bucketOf(tenths: number): Bucket {
  if (tenths === 0) return { side: 0, level: 0 };
  const size = Math.abs(tenths);
  const level = size >= FAR_PP * 10 ? 3 : size >= NEAR_PP * 10 ? 2 : 1;
  return { side: tenths > 0 ? 1 : -1, level };
}

/**
 * A única função que sabe a cor da escala divergente. O Farol não tem tokens divergentes (TOK-3): o
 * extremo é --positive ou --negative cheio, e as duas intensidades de dentro são a mesma cor misturada
 * com o cartão, de modo que o centro da escala é o tom mais próximo do fundo nos dois temas. A mistura
 * é opaca (color-mix), e não fill-opacity, para a conta de contraste do texto valer sobre a marca.
 */
function bucketFill(bucket: Bucket): string {
  if (bucket.side === 0) return 'var(--surface-raised)';
  const token = bucket.side > 0 ? 'var(--positive)' : 'var(--negative)';
  if (bucket.level >= 3) return token;
  return `color-mix(in srgb, ${token} ${String(bucket.level === 2 ? MEDIUM_MIX : WEAK_MIX)}%, var(--surface-raised))`;
}

/** Sobre a cor cheia, o texto vazado na cor do cartão (5,3:1 ou mais); nas misturas, o texto principal (5,1:1 ou mais). */
function bucketText(bucket: Bucket): string {
  return bucket.level >= 3 ? 'var(--surface-raised)' : 'var(--text-primary)';
}

/** O centro e a intensidade fraca medem menos de 1,5:1 contra o cartão: o contorno segura a silhueta do mapa. */
function bucketStroke(bucket: Bucket): string {
  return bucket.level <= 1 ? 'var(--line-strong)' : bucketFill(bucket);
}

/** Sinal à mão sobre o valor absoluto (NUM-3): + e − tipográfico, e o zero sem sinal. A unidade p.p. vai ao lado. */
function signedPoints(tenths: number): string {
  const body = formatDecimal(Math.abs(tenths) / 10, 1);
  if (tenths === 0) return body;
  return `${tenths > 0 ? '+' : '−'}${body}`;
}

function ufCount(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'UF' : 'UFs'}`;
}

/** Texto de cada degrau da legenda, calculado dos mesmos limites que classificam. */
function bucketLabel(bucket: Bucket): string {
  const sign = bucket.side > 0 ? '+' : '−';
  if (bucket.level >= 3) return `${sign}${formatDecimal(FAR_PP, 1)} p.p. ou ${bucket.side > 0 ? 'mais' : 'menos'}`;
  if (bucket.level === 2) return `${sign}${formatDecimal(NEAR_PP, 1)} a ${sign}${formatDecimal(FAR_PP - 0.1, 1)} p.p.`;
  return `${sign}${formatDecimal(0.1, 1)} a ${sign}${formatDecimal(NEAR_PP - 0.1, 1)} p.p.`;
}

/** Degraus da legenda de cima para baixo: do mais acima da média ao mais abaixo, com a média no meio. */
const LEGEND_BUCKETS: readonly Bucket[] = [
  { side: 1, level: 3 },
  { side: 1, level: 2 },
  { side: 1, level: 1 },
  { side: 0, level: 0 },
  { side: -1, level: 1 },
  { side: -1, level: 2 },
  { side: -1, level: 3 },
];

export default function DeviationChoropleth({ data = defaultData, height, className }: DeviationChoroplethProps) {
  const national = nationalRate(data);

  if (national === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF com lead recebido neste recorte: não há média nacional para medir o desvio.</span>
      </div>
    );
  }

  // O desvio é a diferença entre os dois números na precisão em que são escritos: a conta fecha na tela.
  const nationalTenths = Math.round(national * 1000);
  const byUf = new Map(data.map((entry) => [entry.uf, entry]));
  const measured = data.flatMap((entry) => {
    const tenths = rateTenths(entry);
    return tenths === null ? [] : [{ entry, tenths, deviation: tenths - nationalTenths }];
  });
  const deviationOf = new Map(measured.map((item) => [item.entry.uf, item]));
  const above = measured.filter((item) => item.deviation > 0).length;
  const below = measured.filter((item) => item.deviation < 0).length;
  const withoutRate = LAYOUT.cells.length - measured.length;
  // Quem mais se afasta, para qualquer lado; no mesmo desvio, a UF de maior volume.
  let farthest = measured[0];
  for (const item of measured) {
    if (farthest === undefined) continue;
    const size = Math.abs(item.deviation);
    const best = Math.abs(farthest.deviation);
    if (size > best || (size === best && item.entry.leads > farthest.entry.leads)) farthest = item;
  }
  const farthestUf = farthest?.entry.uf;
  const farthestCell = farthestUf === undefined ? undefined : LAYOUT.cells.find((cell) => cell.uf === farthestUf);
  const countOf = (bucket: Bucket) =>
    measured.filter((item) => {
      const own = bucketOf(item.deviation);
      return own.side === bucket.side && own.level === bucket.level;
    }).length;

  const summary = farthest
    ? `Mapa coroplético em hexágonos com o desvio da taxa de qualificação de ${ufCount(measured.length)} contra a média nacional de ${formatPercent(nationalTenths / 1000, 1)}. ` +
      `Ficam acima ${ufCount(above)} e abaixo ${formatInt(below)}; quem mais se afasta é ${farthest.entry.name}, com ${signedPoints(farthest.deviation)} p.p.`
    : 'Mapa coroplético de desvio da média nacional sem UF medida para comparar.';

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 items-start gap-4', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      {/* Escala 1: largura e altura iguais ao viewBox, para o texto de 11 px chegar com 11 px (GEO-18). */}
      <svg aria-hidden className="shrink-0" height={LAYOUT.height} viewBox={`0 0 ${String(LAYOUT.width)} ${String(LAYOUT.height)}`} width={LAYOUT.width}>
        {LAYOUT.cells.map((cell) => {
          const item = deviationOf.get(cell.uf);
          if (item === undefined) {
            return (
              <g key={cell.uf}>
                <title>{`${byUf.get(cell.uf)?.name ?? cell.uf}: desvio ${formatUnavailable()}, sem lead recebido`}</title>
                <polygon
                  fill="none"
                  points={hexPoints(cell.cx, cell.cy, HEX_DRAWN_R - 0.75)}
                  stroke="var(--text-muted)"
                  strokeDasharray="3 2"
                  strokeWidth={1.5}
                />
                <text dominantBaseline="central" fill="var(--text-muted)" fontSize={LABEL_SIZE} fontWeight={600} textAnchor="middle" x={cell.cx} y={cell.cy}>
                  {cell.uf}
                </text>
              </g>
            );
          }
          const bucket = bucketOf(item.deviation);
          const ink = bucketText(bucket);
          return (
            <g key={cell.uf}>
              <title>
                {`${item.entry.name}: ${formatPercent(item.tenths / 1000, 1)} (${formatInt(item.entry.qualified)} de ${formatInt(item.entry.leads)} leads), ` +
                  `${signedPoints(item.deviation)} p.p. contra a média`}
              </title>
              <polygon fill={bucketFill(bucket)} points={hexPoints(cell.cx, cell.cy, HEX_DRAWN_R - 0.5)} stroke={bucketStroke(bucket)} strokeWidth={1} />
              <text fill={ink} fontSize={LABEL_SIZE} fontWeight={600} textAnchor="middle" x={cell.cx} y={cell.cy + SIGLA_DY}>
                {cell.uf}
              </text>
              <text className="font-display tabular-nums" fill={ink} fontSize={LABEL_SIZE} textAnchor="middle" x={cell.cx} y={cell.cy + VALUE_DY}>
                {signedPoints(item.deviation)}
              </text>
            </g>
          );
        })}
        {/* O contorno grosso vai por último, por cima dos vizinhos, e ocupa o vão de 2 px entre os hexágonos. */}
        {farthestCell ? (
          <polygon
            fill="none"
            points={hexPoints(farthestCell.cx, farthestCell.cy, HEX_DRAWN_R)}
            stroke="var(--text-primary)"
            strokeLinejoin="round"
            strokeWidth={HIGHLIGHT_STROKE}
          />
        ) : null}
      </svg>

      <div aria-hidden className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="m-0 text-xs leading-4 tabular-nums text-text-secondary">
          {`${ufCount(above)} acima da média e ${formatInt(below)} abaixo`}
        </p>

        {/* Anotação do contorno grosso, antes da legenda: é a resposta da pergunta, e nomeia a UF, o sinal e a unidade. */}
        {farthest ? (
          <span className="flex items-center gap-2 text-[0.6875rem] leading-4 text-text-muted">
            <svg className="shrink-0" height={SWATCH_H} viewBox={`0 0 ${String(SWATCH_W)} ${String(SWATCH_H)}`} width={SWATCH_W}>
              <polygon
                fill="none"
                points={hexPoints(SWATCH_W / 2, SWATCH_H / 2, SWATCH_W / 2 - 1)}
                stroke="var(--text-primary)"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <span className="min-w-0 flex-1 tabular-nums">
              {`maior desvio: ${farthest.entry.name} (${farthest.entry.uf}), ${signedPoints(farthest.deviation)} p.p.`}
            </span>
          </span>
        ) : null}

        {/* Legenda simétrica: três degraus acima, a média escrita no meio, três degraus abaixo. */}
        <div className="flex flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-secondary">
          <span className="text-text-muted">Desvio da taxa de qualificação, em pontos percentuais</span>
          {LEGEND_BUCKETS.map((bucket) => (
            <span className="flex items-center gap-2" key={`bucket-${String(bucket.side)}-${String(bucket.level)}`}>
              <svg className="shrink-0" height={SWATCH_H} viewBox={`0 0 ${String(SWATCH_W)} ${String(SWATCH_H)}`} width={SWATCH_W}>
                <polygon
                  fill={bucketFill(bucket)}
                  points={hexPoints(SWATCH_W / 2, SWATCH_H / 2, SWATCH_W / 2 - 0.5)}
                  stroke={bucketStroke(bucket)}
                  strokeWidth={1}
                />
              </svg>
              <span className={cn('min-w-0 flex-1 tabular-nums', bucket.side === 0 && 'font-medium text-text-primary')}>
                {bucket.side === 0 ? `na média nacional de ${formatPercent(nationalTenths / 1000, 1)}` : bucketLabel(bucket)}
              </span>
              <span className="shrink-0 tabular-nums text-text-muted">{ufCount(countOf(bucket))}</span>
            </span>
          ))}
          {withoutRate > 0 ? (
            <span className="flex items-center gap-2">
              <svg className="shrink-0" height={SWATCH_H} viewBox={`0 0 ${String(SWATCH_W)} ${String(SWATCH_H)}`} width={SWATCH_W}>
                <polygon
                  fill="none"
                  points={hexPoints(SWATCH_W / 2, SWATCH_H / 2, SWATCH_W / 2 - 0.75)}
                  stroke="var(--text-muted)"
                  strokeDasharray="3 2"
                  strokeWidth={1.5}
                />
              </svg>
              <span className="min-w-0 flex-1">{`desvio ${formatUnavailable()}: sem lead recebido`}</span>
              <span className="shrink-0 tabular-nums text-text-muted">{ufCount(withoutRate)}</span>
            </span>
          ) : null}
        </div>
      </div>
    </figure>
  );
}
