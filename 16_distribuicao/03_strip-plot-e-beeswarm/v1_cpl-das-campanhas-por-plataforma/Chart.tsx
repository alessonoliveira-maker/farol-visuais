import { Filter } from 'lucide-react';
import { ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from 'recharts';

import { AXIS_PROPS } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CPL_TARGET, data as defaultData, WITHOUT_LEADS, type MediaKind } from './data';

/**
 * Strip plot: cada observação vira um ponto numa escala só, com uma faixa por grupo. Mostra o valor
 * exato de cada caso e os buracos entre eles, que o histograma apaga, e perde para o histograma na
 * leitura da forma.
 *
 * No Farol ele ganha do box plot quando a unidade importa. Aqui cada ponto é uma campanha que alguém
 * pode pausar, copiar ou reforçar, então esconder as 41 campanhas de social dentro de uma caixa
 * seria trocar uma fila de trabalho por um resumo.
 *
 * Duas decisões sustentam a leitura. A mediana entra como traço curto, e não como caixa, porque a
 * caixa competiria com os pontos pelo mesmo espaço. E o ponto é opaco, com contorno na cor do cartão:
 * a opacidade compunha a marca com o fundo e derrubava o ponto isolado, que é o outlier procurado, a
 * 2,04:1 no claro (ACE-5). O contorno separa dois pontos colados e deixa a pilha legível pelo recorte.
 */
export interface CplStripPlotProps {
  readonly data?: readonly MediaKind[];
  readonly target?: number;
  readonly withoutLeads?: number;
  readonly height?: number;
  readonly className?: string;
}

interface StripPoint {
  readonly kind: string;
  readonly cpl: number;
  readonly campaign: string;
}

const MARGIN = { top: 20, right: 20, bottom: 4, left: 4 } as const;
const CATEGORY_WIDTH = 132;
const POINT_FILL = 'var(--chart-1)';
const POINT_STROKE_WIDTH = 1;
const POINT_SIZE = 46;
const MEDIAN_STROKE = 'var(--text-primary)';
const MEDIAN_H = 18;
const MEDIAN_W = 2;
/** Teto do eixo, em reais. Arredondado para cima em passo de 50, e fixo entre filtros. */
const AXIS_STEP = 50;

/** Uma faixa do eixo, já com a medida da própria lista de campanhas. */
interface KindRow extends MediaKind {
  /**
   * Mediana da faixa, ou `null` quando ela não tem nenhuma campanha no recorte. Zero é um custo por
   * lead plausível, então a mediana zerada de uma lista vazia entra no desenho como a faixa mais
   * barata de todas, com o traço colado na origem do eixo: ausência vestida de medição.
   */
  readonly middle: number | null;
  readonly above: number;
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? null;
  return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

export default function CplStripPlot({
  data = defaultData,
  target = CPL_TARGET,
  withoutLeads = WITHOUT_LEADS,
  height,
  className,
}: CplStripPlotProps) {
  /**
   * Ordem pela mediana, com a faixa mais barata no topo. A ordenação é decrescente porque o eixo de
   * categoria do Recharts empilha de baixo para cima: ordenar crescente joga o melhor caso para o
   * rodapé do cartão, que é o último lugar onde alguém olha.
   */
  const kinds: readonly KindRow[] = data
    .map((kind) => ({
      ...kind,
      middle: median(kind.campaigns.map((campaign) => campaign.cpl)),
      above: kind.campaigns.filter((campaign) => campaign.cpl > target).length,
    }))
    .sort((a, b) => {
      /* Faixa sem mediana não entra na ordenação por valor: ela vai para o começo do array, que é o
         rodapé da grade e, na leitura de cima para baixo, o último lugar (17.2, ausência por último). */
      if (a.middle === null || b.middle === null) {
        return (a.middle === null ? 0 : 1) - (b.middle === null ? 0 : 1);
      }
      return b.middle - a.middle;
    });

  /** Só as faixas que têm mediana medida entram nos extremos da frase acessível. */
  const measured = kinds.filter((kind): kind is KindRow & { middle: number } => kind.middle !== null);
  const unmeasured = kinds.filter((kind) => kind.middle === null);
  const all = kinds.flatMap((kind) => kind.campaigns);
  const ceiling = Math.ceil(Math.max(target, ...all.map((campaign) => campaign.cpl)) / AXIS_STEP) * AXIS_STEP;
  const above = kinds.reduce((sum, kind) => sum + kind.above, 0);
  const priciest = measured[0];
  const cheapest = measured[measured.length - 1];
  /** Caso extremo: a campanha de maior CPL, com nome e faixa, porque o ponto isolado é o procurado. */
  const worst = kinds
    .flatMap((kind) => kind.campaigns.map((campaign) => ({ ...campaign, kind: kind.name })))
    .reduce<{ name: string; cpl: number; kind: string } | null>(
      (top, item) => (top === null || item.cpl > top.cpl ? item : top),
      null,
    );

  /** Cauda da frase de ordem: a faixa sem mediana não entra na ordenação por valor e vai para o fim. */
  const orderTail =
    unmeasured.length === 0 ? '' : `, e ${unmeasured.length === 1 ? 'a' : 'as'} sem campanha no fim`;

  const summary =
    cheapest === undefined || priciest === undefined
      ? `Strip plot de custo por lead com ${formatInt(kinds.length)} tipos de mídia e nenhuma campanha medida: a mediana de cada faixa fica ${formatUnavailable()}.`
      : `Custo por lead de ${formatInt(all.length)} campanhas do trimestre, distribuídas em ${formatInt(kinds.length)} tipos de mídia. ` +
        `A mediana vai de ${formatCurrency(cheapest.middle, 0)} em ${cheapest.name} a ${formatCurrency(priciest.middle, 0)} em ${priciest.name}. ` +
        `${formatInt(above)} campanhas passam da meta de ${formatCurrency(target, 0)} por lead` +
        (worst === null ? '.' : `; a mais cara é ${worst.name}, com ${formatCurrency(worst.cpl, 0)}.`) +
        (unmeasured.length === 0
          ? ''
          : ` ${formatInt(unmeasured.length)} sem campanha no recorte ficam com a mediana ${formatUnavailable()}.`);

  if (all.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 flex-col items-start justify-center gap-2', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 text-text-muted" />
        <p className="text-xs text-text-muted">
          O recorte não tem campanha com lead, então não há custo por lead a distribuir nem mediana por
          tipo de mídia a comparar.
        </p>
      </div>
    );
  }

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart margin={MARGIN}>
            <XAxis
              {...AXIS_PROPS}
              dataKey="cpl"
              domain={[0, ceiling]}
              tickFormatter={(value: number) => formatCurrency(value, 0)}
              type="number"
            />
            {/* `allowDuplicatedCategory` desligado: com ele ligado cada ponto do Scatter abre uma
                banda nova no eixo, e as quatro faixas viram cento e catorze linhas invisíveis. */}
            <YAxis
              {...AXIS_PROPS}
              allowDuplicatedCategory={false}
              dataKey="kind"
              interval={0}
              tick={(props: { x?: number | string; y?: number | string; payload?: { value?: string } }) => {
                const kind = kinds.find((item) => item.name === props.payload?.value);
                return (
                  <g transform={`translate(${String(Number(props.x ?? 0))},${String(Number(props.y ?? 0))})`}>
                    <text
                      className="tabular-nums"
                      dominantBaseline="central"
                      fill="var(--text-secondary)"
                      fontSize={11}
                      textAnchor="end"
                      x={-10}
                    >
                      {kind === undefined ? '' : `${kind.name} · n ${formatInt(kind.campaigns.length)}`}
                    </text>
                  </g>
                );
              }}
              type="category"
              width={CATEGORY_WIDTH}
            />
            {/* Raio fixo: o tamanho do ponto não carrega informação nenhuma nesta peça. */}
            <ZAxis range={[POINT_SIZE, POINT_SIZE]} />
            <ReferenceLine
              label={{
                fill: 'var(--text-muted)',
                fontSize: 11,
                position: 'top',
                value: `meta ${formatCurrency(target, 0)}`,
              }}
              stroke="var(--line-strong)"
              strokeDasharray="4 3"
              x={target}
            />
            {kinds.map((kind) => (
              <Scatter
                data={kind.campaigns.map<StripPoint>((campaign) => ({
                  kind: kind.name,
                  cpl: campaign.cpl,
                  campaign: campaign.name,
                }))}
                fill={POINT_FILL}
                isAnimationActive={false}
                key={kind.id}
                /* Marca opaca: contorno na cor da superfície separa dois pontos colados sem tocar
                   no contraste do preenchimento contra o cartão. */
                stroke="var(--surface-raised)"
                strokeWidth={POINT_STROKE_WIDTH}
              />
            ))}
            {/* A mediana entra depois dos pontos, por cima, como traço curto. Faixa sem campanha
                fica sem traço: desenhá-lo exigiria um número, e o número que a conta devolvia era
                zero, isto é, a faixa mais barata da grade num recorte em que nada foi medido. */}
            {measured.map((kind) => (
              <Scatter
                data={[{ kind: kind.name, cpl: kind.middle }]}
                isAnimationActive={false}
                key={`mediana-${kind.id}`}
                shape={({ cx, cy }: { cx?: number; cy?: number }) => (
                  <rect
                    fill={MEDIAN_STROKE}
                    height={MEDIAN_H}
                    width={MEDIAN_W}
                    x={Number(cx ?? 0) - MEDIAN_W / 2}
                    y={Number(cy ?? 0) - MEDIAN_H / 2}
                  />
                )}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`custo por lead, n ${formatInt(all.length)} campanhas do trimestre`}</span>
        {/* A ordem das faixas vai escrita porque o critério não aparece em lugar nenhum do desenho:
            a mediana de cada faixa é um traço, nunca um número, então quem olha não tem como deduzir
            por que "Busca paga" vem antes de "Vídeo" e a lista de nomes lê como arbitrária. */}
        <span>{`faixas em ordem de mediana crescente, de cima para baixo${orderTail}`}</span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-0.5" style={{ backgroundColor: MEDIAN_STROKE }} />
          <span>mediana do tipo de mídia</span>
        </span>
        <span>um ponto é uma campanha; pontos sobrepostos aparecem separados por contorno claro</span>
        <span className="tabular-nums">{`${formatInt(above)} campanhas acima da meta de ${formatCurrency(target, 0)}`}</span>
        {worst === null ? null : (
          <span className="tabular-nums">{`maior CPL: ${worst.name} (${worst.kind}), ${formatCurrency(worst.cpl, 0)}`}</span>
        )}
        {withoutLeads <= 0 ? null : (
          <span className="tabular-nums">{`${formatInt(withoutLeads)} campanhas sem nenhum lead ficaram fora`}</span>
        )}
        {/* A faixa sem campanha aparece no eixo com n 0 e sem traço; só esta linha diz por que o
            traço não está lá, e a diferença entre "não tem mediana" e "a mediana é baixa". */}
        {unmeasured.length === 0 ? null : (
          <span className="tabular-nums">
            {`mediana ${formatUnavailable()} em ${unmeasured.map((kind) => kind.name.toLowerCase()).join(', ')}: sem campanha no recorte`}
          </span>
        )}
      </div>
    </figure>
  );
}
