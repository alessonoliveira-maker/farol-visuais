import type { ReactElement } from 'react';
import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import {
  formatCurrencyAxis,
  formatCurrencyCompact,
  formatInt,
  formatPercent,
  formatRateWithVolume,
  formatUnavailable,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, GUIDE_CPL, WITHOUT_LEADS, ZERO_COST } from './data';

/**
 * A acumulada na forma **ou mais**: a altura em x é a fração das campanhas que custam x ou mais por
 * lead. É a mesma curva da forma "até" espelhada, e é por isso que o sentido vive escrito acima do
 * plano: sem a frase, a leitura se inverte sem que nada no desenho denuncie a troca.
 *
 * Duas decisões de escala, e as duas mudam o que se lê.
 *
 * **O eixo horizontal é logarítmico**, porque a métrica é assimétrica: com o CPL mais caro do ano
 * quase mil vezes o mais barato, um eixo linear empurraria toda a leitura útil para os primeiros
 * pontos percentuais da largura e deixaria o resto vazio. A escala está avisada no rótulo, porque
 * distância igual passando a valer razão igual é o tipo de coisa que ninguém adivinha.
 *
 * **A curva é reamostrada em degraus de quantil** antes do render. Com 1.100 campanhas a escada
 * exata teria um degrau por valor distinto; a reamostragem desenha um ponto a cada duocentésimo da
 * amostra, e a massa que ela deixa de fora entre dois degraus vizinhos é medida e escrita no rodapé,
 * em vez de prometida.
 *
 * **O degrau é `stepBefore`, e não `stepAfter`.** Este é o ponto em que a forma "ou mais" difere da
 * forma "até", e trocar os dois inventa casos. A fração de campanhas com CPL maior ou igual a x é
 * constante no intervalo que **termina** numa observação, então o patamar carrega o valor do ponto
 * da direita: com `stepAfter` a curva seguraria o valor do ponto da esquerda por todo o intervalo e
 * afirmaria, em cada degrau, que as campanhas daquele valor ainda estão acima do limiar depois de
 * ele ter sido passado. O que nenhuma das duas formas admite é linha ligando os pontos: entre duas
 * observações não existe campanha nenhuma, e a reta inclinada inventaria as que faltam.
 */
export interface CplSurvivalProps {
  readonly data?: readonly number[];
  readonly guideCpl?: number;
  readonly withoutLeads?: number;
  readonly zeroCost?: number;
  readonly height?: number;
  readonly className?: string;
}

interface SurvivalPoint {
  readonly cpl: number;
  readonly share: number;
}

/** A margem da direita guarda a metade de fora do rótulo do último tique, medida em 20 px. */
const MARGIN = { top: 10, right: 24, bottom: 0, left: 0 } as const;
const CURVE_STROKE = 'var(--chart-1)';
/** Guia de referência, que é papel de estrutura e não marca de dado, como o par de guias da v1. */
const GUIDE_STROKE = 'var(--line-strong)';
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
const Y_AXIS_WIDTH = 48;
/** EIX-6b: `tickMargin` de 8 mais cerca de 15 px de tinta de um rótulo de 11 px. */
const X_AXIS_HEIGHT = 26;
/** Degraus de quantil da reamostragem: um ponto a cada duocentésimo da amostra. */
const QUANTILE_STEPS = 200;
/** Teto de rótulos no eixo logarítmico, para a escada de tiques rarear em vez de colidir. */
const MAX_TICKS = 6;
const LABEL_DX = 10;
/**
 * O rótulo do cruzamento sobe em vez de ficar na altura do ponto, porque na altura dele a guia
 * horizontal atravessa as letras, que foi o defeito corrigido na v1 deste modelo. Sobe, e não desce,
 * porque abaixo da guia sobram poucos pixels até a linha de grade de zero.
 */
const LABEL_DY = 14;

/** Degrau da malha 1, 2, 5 vezes potência de dez imediatamente abaixo do valor. */
function latticeBelow(value: number): number {
  const decade = 10 ** Math.floor(Math.log10(value));
  for (const unit of [5, 2, 1]) {
    if (unit * decade <= value) return unit * decade;
  }
  return decade / 10;
}

/** Degrau da malha 1, 2, 5 vezes potência de dez imediatamente acima do valor. */
function latticeAbove(value: number): number {
  const decade = 10 ** Math.floor(Math.log10(value));
  for (const unit of [1, 2, 5]) {
    if (unit * decade >= value) return unit * decade;
  }
  return decade * 10;
}

/** O degrau seguinte da mesma malha: 1 vira 2, 2 vira 5, 5 vira a dezena. */
function latticeNext(value: number): number {
  const decade = 10 ** Math.floor(Math.log10(value));
  const unit = Math.round(value / decade);
  if (unit === 1) return 2 * decade;
  if (unit === 2) return 5 * decade;
  return 10 * decade;
}

/**
 * A escada de tiques da malha, de `lower` a `upper`, rareada até caber em `MAX_TICKS` rótulos. Ela é
 * derivada do dado, e não uma lista fixa: com o passo automático o eixo logarítmico imprime potência
 * de dez, o que num recorte de três décadas deixa três rótulos e nenhuma âncora no meio.
 */
function ladder(lower: number, upper: number): number[] {
  const all: number[] = [lower];
  for (let guard = 0; guard < 64; guard += 1) {
    const last = all.at(-1) ?? lower;
    if (last >= upper) break;
    all.push(latticeNext(last));
  }
  const stride = Math.max(Math.ceil((all.length - 1) / (MAX_TICKS - 1)), 1);
  const picked = all.filter((_, index) => index % stride === 0);
  const last = all.at(-1) ?? upper;
  if (picked.at(-1) !== last) picked.push(last);
  return picked;
}

/**
 * A curva "ou mais", reamostrada em degraus de quantil. Cada ponto desenhado leva a fração **exata**
 * de campanhas com CPL maior ou igual ao valor dele, contada na lista inteira: o que a reamostragem
 * corta são degraus, nunca a altura de um degrau que ficou.
 *
 * Empates colapsados num ponto por valor distinto, e a fração é contada no **começo** do bloco de
 * empates, não no meio dele, que é onde a reamostragem por posto cairia.
 */
function survival(values: readonly number[], steps: number): SurvivalPoint[] {
  if (values.length === 0) return [];
  const sorted = [...values].sort((left, right) => left - right);
  const total = sorted.length;
  const points: SurvivalPoint[] = [];
  for (let step = 0; step <= steps; step += 1) {
    const rank = Math.min(Math.round((step * total) / steps), total - 1);
    const value = sorted[rank] ?? 0;
    if (points.at(-1)?.cpl === value) continue;
    let first = rank;
    while (first > 0 && sorted[first - 1] === value) first -= 1;
    points.push({ cpl: value, share: (total - first) / total });
  }
  return points;
}

/**
 * A maior massa de campanhas que a reamostragem deixa de desenhar entre dois degraus vizinhos, que é
 * o erro vertical máximo da curva contra a acumulada exata. Medida na lista inteira, não estimada
 * pelo número de degraus pedido, porque bloco de empates grande gasta vários postos num só ponto.
 */
function omittedMass(values: readonly number[], points: readonly SurvivalPoint[]): number | null {
  if (values.length === 0 || points.length < 2) return null;
  const total = values.length;
  let worst = 0;
  for (let index = 0; index + 1 < points.length; index += 1) {
    const from = points[index];
    const to = points[index + 1];
    if (from === undefined || to === undefined) continue;
    const between = values.filter((value) => value > from.cpl && value < to.cpl).length;
    if (between / total > worst) worst = between / total;
  }
  return worst;
}

/** Fração das campanhas com CPL maior ou igual ao limiar, ou `null` sem nenhuma campanha medida. */
function shareAtOrAbove(values: readonly number[], limit: number): number | null {
  if (values.length === 0) return null;
  return values.filter((value) => value >= limit).length / values.length;
}

/** O CPL mais alto do recorte, ou `null`: lista vazia não tem máximo, tem ausência de máximo. */
function highestCpl(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((most, value) => (value > most ? value : most), values[0] ?? 0);
}

/** O CPL mais baixo do recorte, ou `null`, pelo mesmo motivo. */
function lowestCpl(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((least, value) => (value < least ? value : least), values[0] ?? 0);
}

export default function CplSurvival({
  data = defaultData,
  guideCpl = GUIDE_CPL,
  withoutLeads = WITHOUT_LEADS,
  zeroCost = ZERO_COST,
  height,
  className,
}: CplSurvivalProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  /* A guarda testa `data`, que é a lista de onde saem a curva, o cruzamento e o erro. O array de
     pontos é derivado e poderia nascer não vazio a partir do domínio, então guarda apoiada nele
     nunca dispararia. */
  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>
          {`Custo por lead ${formatUnavailable().toLowerCase()}: neste recorte nenhuma campanha teve lead para dividir o custo, e curva sem base não tem altura.`}
        </span>
      </div>
    );
  }

  const points = survival(data, QUANTILE_STEPS);
  const lowest = lowestCpl(data);
  const highest = highestCpl(data);
  const share = shareAtOrAbove(data, guideCpl);
  const above = data.filter((value) => value >= guideCpl).length;
  const error = omittedMass(data, points);
  const lower = lowest === null ? guideCpl : latticeBelow(lowest);
  const upper = highest === null ? guideCpl : latticeAbove(highest);

  /**
   * O rótulo é desenhado à mão, e pendurado na **ponta esquerda da guia horizontal**, não no ponto
   * do cruzamento. Medido no primeiro render: ancorado no ponto, com o texto correndo para a
   * esquerda, a cauda da frase cai em cima da curva, que desce por ali; a ponta esquerda da guia
   * está no canto de baixo à esquerda, que é a única região do plano que a curva descendente deixa
   * livre. O deslocamento para cima tira as letras de dentro da própria guia, que foi o defeito
   * corrigido na v1 deste modelo.
   */
  const renderCrossingLabel =
    (text: string) =>
    ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly y?: number } }): ReactElement => (
      <text
        className="tabular-nums"
        dominantBaseline="central"
        fill="var(--text-primary)"
        fontSize={12}
        fontWeight={500}
        textAnchor="start"
        x={(viewBox?.x ?? 0) + LABEL_DX}
        y={(viewBox?.y ?? 0) - LABEL_DY}
      >
        {text}
      </text>
    );

  const summary =
    share === null || highest === null
      ? `Curva acumulada descendente do custo por lead sem base no recorte: a fração acima de ${formatCurrencyAxis(guideCpl)} fica ${formatUnavailable()}.`
      : `Curva acumulada descendente do custo por lead de ${formatInt(data.length)} campanhas, com o eixo horizontal em escala logarítmica. ` +
        `${formatRateWithVolume(above, data.length, 0)} custam ${formatCurrencyAxis(guideCpl)} ou mais por lead. ` +
        `O CPL mais alto do ano chega a ${formatCurrencyCompact(highest)}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      {/* O sentido da acumulada e a escala do eixo, os dois escritos: a mesma curva espelhada
          responderia "até", e distância igual valendo razão igual ninguém adivinha. */}
      <span aria-hidden className="shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        campanhas que custam o valor do eixo ou mais por lead, em escala logarítmica
      </span>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={points} margin={MARGIN}>
            {/* Grade nos dois sentidos: os dois eixos são quantitativos e a leitura é do cruzamento,
                então ela é a régua do desenho. No horizontal as linhas saem espaçadas em razão, que
                é o que torna a escala logarítmica visível sem depender do rótulo. */}
            <CartesianGrid stroke={GRID_COLOR} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="cpl"
              domain={[lower, upper]}
              height={X_AXIS_HEIGHT}
              interval={0}
              scale="log"
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickMargin={8}
              ticks={ladder(lower, upper)}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, 1]}
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickMargin={8}
              ticks={[...Y_TICKS]}
              width={Y_AXIS_WIDTH}
            />
            <ReferenceLine ifOverflow="extendDomain" stroke={GUIDE_STROKE} strokeDasharray="4 3" x={guideCpl} />
            {/* Sem altura medida não há cruzamento: a guia horizontal e o ponto saem juntos, em vez
                de se encontrarem na origem como se nenhuma campanha fosse cara. */}
            {share === null ? null : (
              <ReferenceLine
                ifOverflow="extendDomain"
                label={renderCrossingLabel(
                  `${formatRateWithVolume(above, data.length, 0)} custam ${formatCurrencyAxis(guideCpl)} ou mais`,
                )}
                stroke={GUIDE_STROKE}
                strokeDasharray="4 3"
                y={share}
              />
            )}
            {share === null ? null : (
              <ReferenceDot
                fill={CURVE_STROKE}
                ifOverflow="extendDomain"
                r={4}
                stroke="var(--surface-raised)"
                strokeWidth={1.5}
                x={guideCpl}
                y={share}
              />
            )}
            <Line
              dataKey="share"
              dot={false}
              isAnimationActive={animate}
              stroke={CURVE_STROKE}
              strokeWidth={2}
              type="stepBefore"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`custo por lead, n ${formatInt(data.length)} campanhas com CPL medível`}</span>
        <span className="tabular-nums">
          {`reamostrada em ${formatInt(QUANTILE_STEPS)} degraus de quantil, erro vertical de até ${error === null ? formatUnavailable() : formatPercent(error, 1)}`}
        </span>
        {withoutLeads + zeroCost <= 0 ? null : (
          <span className="tabular-nums">
            {`fora do log: ${formatInt(withoutLeads)} campanhas sem lead e ${formatInt(zeroCost)} com custo zero`}
          </span>
        )}
      </div>
    </figure>
  );
}
