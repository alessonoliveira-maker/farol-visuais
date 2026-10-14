import type { ReactElement } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, GRID_COLOR } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, SLA_MINUTES, WITHOUT_CONTACT } from './data';

/**
 * ECDF: a escada que sobe a cada observação, do menor valor ao maior, com o eixo vertical de zero a
 * cem por cento. Responde direto a pergunta que o histograma obriga a responder somando barras de
 * cabeça: que percentual dos casos fica abaixo de um limiar.
 *
 * A vantagem dela é não ter parâmetro. Não escolhe bin nem banda, não suaviza nada, e por isso duas
 * curvas feitas por pessoas diferentes sobre o mesmo dado são idênticas. O custo é de familiaridade:
 * quem nunca viu uma escada acumulada precisa do par de guias rotulado no cruzamento, que é o que
 * traduz a curva inteira numa frase.
 *
 * O degrau é `stepAfter` e não uma linha ligando os pontos. A diferença importa: entre duas
 * observações não existe caso nenhum, e a reta inclinada inventaria os que faltam.
 */
export interface FirstContactEcdfProps {
  readonly data?: readonly number[];
  readonly slaMinutes?: number;
  readonly withoutContact?: number;
  readonly height?: number;
  readonly className?: string;
}

interface EcdfPoint {
  readonly value: number;
  readonly share: number;
}

const MARGIN = { top: 10, right: 16, bottom: 4, left: 4 } as const;
const CURVE_STROKE = 'var(--chart-1)';
const GUIDE_STROKE = 'var(--line-strong)';
const AXIS_STEP = 60;
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
/** Respiro entre o ponto do cruzamento e o começo do rótulo, o mesmo da 17.7. */
const LABEL_DX = 10;
/**
 * O rótulo desce em vez de ficar na altura do ponto: na altura dele, que é o que `position: 'right'`
 * entrega, a guia tracejada atravessa as letras nos dois temas.
 *
 * Os 16 px saem de medição no preview `card`, não de estimativa. A guia horizontal cai em 151 px e
 * a linha de grade de 50% em 175 px, um corredor de 24 px; com 12 px a tinta ficava a 3 px da guia,
 * porque a base central do texto não deixa a tinta simétrica em torno da âncora. Com 16 px a tinta
 * mede de 159,5 a 167,5 px, com 8 px livres acima e 7 px abaixo, iguais nos dois temas.
 */
const LABEL_DY = 16;

/**
 * Empates colapsados: cada valor distinto vira **um** ponto, já com o acumulado até ele. Gravar um
 * ponto por observação deixaria degraus de altura zero empilhados no mesmo x, o que engorda o SVG
 * sem mudar nada na tela.
 */
function ecdf(values: readonly number[]): EcdfPoint[] {
  if (values.length === 0) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const points: EcdfPoint[] = [{ value: 0, share: 0 }];
  let seen = 0;
  for (let index = 0; index < sorted.length; index += 1) {
    const value = sorted[index] ?? 0;
    seen += 1;
    if (sorted[index + 1] === value) continue;
    points.push({ value, share: seen / sorted.length });
  }
  return points;
}

export default function FirstContactEcdf({
  data = defaultData,
  slaMinutes = SLA_MINUTES,
  withoutContact = WITHOUT_CONTACT,
  height,
  className,
}: FirstContactEcdfProps) {
  const points = ecdf(data);
  const within = data.filter((value) => value <= slaMinutes).length;
  /**
   * Altura da curva no limiar, ou `null` sem nenhum lead no recorte. Sem a guarda, o recorte vazio
   * desenhava as duas guias cruzando na origem e escrevia "0% em até 30 min", isto é, um SLA
   * medido e reprovado onde não houve medição nenhuma.
   */
  const share = data.length === 0 ? null : within / data.length;
  const longest = data.reduce((most, value) => Math.max(most, value), 0);
  const ceiling = Math.ceil(longest / AXIS_STEP) * AXIS_STEP;

  /**
   * O rótulo é desenhado à mão porque o `label` de objeto do Recharts só sabe posicionar em torno
   * do ponto e herda o y dele, e aqui o y do ponto é exatamente o da guia horizontal.
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
        y={(viewBox?.y ?? 0) + LABEL_DY}
      >
        {text}
      </text>
    );

  const summary =
    points.length === 0 || share === null
      ? `Curva acumulada sem nenhum lead no recorte: o percentual dentro do SLA de ${formatInt(slaMinutes)} minutos fica ${formatUnavailable()}, e a curva não é desenhada.`
      : `Curva acumulada do tempo até o primeiro contato de ${formatInt(data.length)} leads do mês. ` +
        `${formatPercent(share, 0)} recebem contato dentro do SLA de ${formatInt(slaMinutes)} minutos, ou seja ${formatInt(within)} leads. ` +
        `O caso mais demorado esperou ${formatInt(longest)} minutos.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      {/* O sentido da acumulada vive escrito, não subentendido: a mesma curva de cabeça para baixo
          responderia "ou mais", e nada no desenho denunciaria a troca. */}
      <span aria-hidden className="shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        leads já contatados até o tempo do eixo
      </span>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={points} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              dataKey="value"
              domain={[0, ceiling]}
              tickFormatter={(value: number) => formatInt(value)}
              /* Marca a cada hora: com o passo automático o eixo saltava de 90 em 90, e o leitor
                 ficava sem âncora para localizar os 30 minutos do SLA. */
              ticks={Array.from({ length: ceiling / AXIS_STEP + 1 }, (_, index) => index * AXIS_STEP)}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              domain={[0, 1]}
              tickFormatter={(value: number) => formatPercent(value, 0)}
              ticks={[...Y_TICKS]}
              width={44}
            />
            <ReferenceLine stroke={GUIDE_STROKE} strokeDasharray="4 3" x={slaMinutes} />
            {/* Sem altura medida não há cruzamento: as duas guias e o ponto saem juntos, em vez de
                se encontrarem na origem do eixo como se ninguém tivesse sido contatado. */}
            {share === null ? null : (
              <ReferenceLine stroke={GUIDE_STROKE} strokeDasharray="4 3" y={share} />
            )}
            {/* O rótulo do cruzamento é a peça inteira traduzida em uma frase, e por isso ele sai
                da altura do ponto: ali a guia horizontal passa dentro das letras. */}
            {share === null ? null : (
              <ReferenceDot
                fill={CURVE_STROKE}
                label={renderCrossingLabel(`${formatPercent(share, 0)} em até ${formatInt(slaMinutes)} min`)}
                r={4}
                stroke="var(--surface-raised)"
                strokeWidth={1.5}
                x={slaMinutes}
                y={share}
              />
            )}
            <Line
              dataKey="share"
              dot={false}
              isAnimationActive={false}
              stroke={CURVE_STROKE}
              strokeWidth={2}
              type="stepAfter"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`minutos até o primeiro contato, n ${formatInt(data.length)} leads`}</span>
        <span>o degrau sobe no próprio valor; entre dois degraus não há caso nenhum</span>
        <span className="tabular-nums">{`${formatInt(data.length - within)} leads esperaram mais que o SLA`}</span>
        {withoutContact <= 0 ? null : (
          <span className="tabular-nums">{`${formatInt(withoutContact)} leads ainda sem contato ficaram fora da curva`}</span>
        )}
      </div>
    </figure>
  );
}
