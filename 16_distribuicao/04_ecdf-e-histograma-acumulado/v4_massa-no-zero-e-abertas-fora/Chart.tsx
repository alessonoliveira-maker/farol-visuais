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
  formatCurrency,
  formatCurrencyAxis,
  formatInt,
  formatPercent,
  formatUnavailable,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, WITHOUT_OUTCOME } from './data';

/**
 * A acumulada de uma medida em que quase metade dos casos vale exatamente zero, e o desenho todo é
 * sobre não deixar que três coisas diferentes leiam igual.
 *
 * **Zero medido.** A oportunidade encerrou e a receita apurada deu zero. É medição, entra na conta e
 * aparece como o salto inicial: a curva não nasce no chão, nasce na altura da massa do zero. Esse
 * salto é a informação mais importante do cartão, e é por isso que ele leva rótulo próprio.
 *
 * **Sem desfecho.** A oportunidade segue aberta, não tem receita apurada e **fica fora da conta**.
 * Incluí-la como zero afirmaria que fechou sem receita; descartá-la em silêncio empurraria a curva
 * para cima de graça, que é o erro mais confortável de todos. Ela aparece contada no rodapé, com a
 * forma que responde a pergunta dela, que é a curva de sobrevivência e não a acumulada.
 *
 * **Ausência de valor no eixo.** O domínio do eixo horizontal não encolhe até o maior negócio do
 * recorte: ele é fixo em passos redondos. Com domínio ajustado ao dado, o salto do zero mudaria de
 * lugar a cada recorte e, num recorte sem negócio pequeno, ele encostaria na borda e leria como
 * defeito de render em vez de massa medida.
 */
export interface ClosedRevenueEcdfProps {
  readonly data?: readonly number[];
  readonly withoutOutcome?: number;
  readonly height?: number;
  readonly className?: string;
}

interface EcdfPoint {
  readonly value: number;
  readonly share: number;
}

/** A margem da direita guarda a metade de fora do rótulo do último tique, medida em 26 px. */
const MARGIN = { top: 10, right: 32, bottom: 0, left: 0 } as const;
const CURVE_STROKE = 'var(--chart-1)';
/** Guia de referência, que é papel de estrutura e não marca de dado, como o par de guias da v1. */
const GUIDE_STROKE = 'var(--line-strong)';
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
const Y_AXIS_WIDTH = 48;
/** EIX-6b: `tickMargin` de 8 mais cerca de 15 px de tinta de um rótulo de 11 px. */
const X_AXIS_HEIGHT = 26;
/** Teto declarado do eixo de receita e o passo dos tiques, em reais. */
const DOMAIN_TOP = 500_000;
const DOMAIN_STEP = 100_000;
const LABEL_DX = 10;
/**
 * O rótulo do salto desce em vez de ficar na altura do ponto: na altura dele a guia horizontal
 * atravessa as letras, que foi o defeito corrigido na v1 deste modelo. Desce, e não sobe, porque
 * acima da guia a curva já subiu, e a faixa livre está abaixo dela.
 */
const LABEL_DY = 14;

/**
 * Acumulada com empates colapsados: cada valor distinto vira **um** ponto, já com a fração até ele.
 * Gravar um ponto por oportunidade deixaria degraus de altura zero empilhados no mesmo x.
 *
 * O primeiro ponto é o piso do recorte com fração zero, e é ele que faz o salto inicial existir no
 * desenho: sem ele a curva começaria já na altura da massa do zero e o salto, que é o assunto do
 * cartão, não teria traço nenhum.
 */
function ecdf(values: readonly number[]): EcdfPoint[] {
  if (values.length === 0) return [];
  const sorted = [...values].sort((left, right) => left - right);
  const total = sorted.length;
  const points: EcdfPoint[] = [{ value: sorted[0] ?? 0, share: 0 }];
  let seen = 0;
  for (let index = 0; index < total; index += 1) {
    const value = sorted[index] ?? 0;
    seen += 1;
    if (sorted[index + 1] === value) continue;
    points.push({ value, share: seen / total });
  }
  return points;
}

/** Fração das encerradas que fecharam exatamente no piso, ou `null` sem nenhuma encerrada. */
function shareAtFloor(values: readonly number[], floor: number): number | null {
  if (values.length === 0) return null;
  return values.filter((value) => value === floor).length / values.length;
}

/** A maior receita apurada, ou `null`: lista vazia não tem máximo, tem ausência de máximo. */
function highestRevenue(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((most, value) => (value > most ? value : most), values[0] ?? 0);
}

export default function ClosedRevenueEcdf({
  data = defaultData,
  withoutOutcome = WITHOUT_OUTCOME,
  height,
  className,
}: ClosedRevenueEcdfProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  /* A guarda testa `data`, que é a lista de onde saem a curva, o salto e o teto do eixo. O array de
     pontos é derivado e poderia nascer não vazio a partir do domínio, então guarda apoiada nele
     nunca dispararia e o salto sairia desenhado no chão. */
  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>
          {`Receita por oportunidade ${formatUnavailable().toLowerCase()}: neste recorte nenhuma oportunidade encerrou, e sem desfecho não há acumulada, há curva de sobrevivência.`}
        </span>
      </div>
    );
  }

  const points = ecdf(data);
  const floorShare = shareAtFloor(data, 0);
  const highest = highestRevenue(data);
  /* Teto declarado, que só cresce se o recorte passar dele: encolhê-lo até o maior negócio moveria o
     salto do zero de lugar a cada recorte. */
  const axisTop =
    highest === null ? DOMAIN_TOP : Math.max(DOMAIN_TOP, Math.ceil(highest / DOMAIN_STEP) * DOMAIN_STEP);
  const ticks = Array.from({ length: axisTop / DOMAIN_STEP + 1 }, (_, index) => index * DOMAIN_STEP);
  /* A curva segue reta em cem por cento do maior valor apurado até o teto declarado do eixo, porque
     é isso que a acumulada diz ali: acima do máximo, todas as encerradas já entraram. Sem este
     ponto a linha para no meio do plano e o vão vira dado faltando aos olhos de quem lê. */
  const curve = points.length === 0 ? points : [...points, { value: axisTop, share: 1 }];

  /**
   * O rótulo é desenhado à mão porque o `label` de objeto do Recharts só posiciona em torno do ponto
   * e herda o y dele, e aqui o y do ponto é exatamente o da guia horizontal do salto.
   */
  const renderJumpLabel =
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
    floorShare === null || highest === null
      ? `Curva acumulada da receita por oportunidade sem base no recorte: a massa no piso fica ${formatUnavailable()} e a curva não é desenhada.`
      : `Curva acumulada da receita reconhecida por oportunidade, só das ${formatInt(data.length)} encerradas. ` +
        `${formatPercent(floorShare, 0)} fecharam em ${formatCurrency(0, 0)}, medido, e a curva nasce nessa altura. ` +
        `${formatInt(withoutOutcome)} oportunidades seguem abertas e ficam fora da conta.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      {/* O sentido da acumulada vive escrito: a mesma curva de cabeça para baixo responderia "ou
          mais", e nada no desenho denunciaria a troca. */}
      <span aria-hidden className="shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        oportunidades com receita reconhecida até o valor do eixo
      </span>

      {/* O recorte da curva, escrito acima dela e não só no rodapé: quem lê a altura precisa saber
          sobre que população ela é fração. */}
      <span aria-hidden className="shrink-0 text-xs leading-4 tabular-nums text-text-secondary">
        {`a curva vale só para as ${formatInt(data.length)} encerradas`}
      </span>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={curve} margin={MARGIN}>
            {/* Grade nos dois sentidos: os dois eixos são quantitativos e lidos por posição, receita
                no horizontal e fração acumulada no vertical. */}
            <CartesianGrid stroke={GRID_COLOR} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="value"
              domain={[0, axisTop]}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickMargin={8}
              ticks={ticks}
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
            {/* A guia leva a altura do salto até o eixo, que é o que transforma "a curva nasce alto"
                em um número. Sem massa medida no piso, ela e o ponto não são desenhados. */}
            {floorShare === null ? null : (
              <ReferenceLine ifOverflow="extendDomain" stroke={GUIDE_STROKE} strokeDasharray="4 3" y={floorShare} />
            )}
            {floorShare === null ? null : (
              <ReferenceDot
                fill={CURVE_STROKE}
                ifOverflow="extendDomain"
                label={renderJumpLabel(`${formatPercent(floorShare, 0)} em ${formatCurrency(0, 0)}, medido`)}
                r={4}
                stroke="var(--surface-raised)"
                strokeWidth={1.5}
                x={0}
                y={floorShare}
              />
            )}
            <Line
              dataKey="share"
              dot={false}
              isAnimationActive={animate}
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
        <span className="tabular-nums">
          {`receita reconhecida por oportunidade, maior apurada ${highest === null ? formatUnavailable() : formatCurrencyAxis(highest)}`}
        </span>
        <span className="tabular-nums">{`eixo fixo até ${formatCurrencyAxis(axisTop)}, para o salto no piso não mudar de lugar`}</span>
        {withoutOutcome <= 0 ? null : (
          <span className="tabular-nums">
            {`${formatInt(withoutOutcome)} abertas fora da conta: sem desfecho a pergunta é de sobrevivência`}
          </span>
        )}
      </div>
    </figure>
  );
}
