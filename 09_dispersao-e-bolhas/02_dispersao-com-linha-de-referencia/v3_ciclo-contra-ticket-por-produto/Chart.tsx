import { Filter } from 'lucide-react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

import { AXIS_PROPS, seriesColor, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatDays, formatDecimal, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ProductCycleTicket } from './data';

/**
 * Duas nuvens no mesmo plano, cada uma com a sua reta de mínimos quadrados e a faixa de 95% da
 * média dessa reta. A faixa é o que separa "os dois produtos têm relações diferentes" de "a
 * amostra não permite dizer": onde as duas faixas se sobrepõem, a diferença entre as inclinações
 * cabe dentro da incerteza e não se sustenta.
 *
 * Esta versão não tem dica, e a ausência é decisão: num combinado a dica é por eixo, não por marca,
 * então ela abriria com seis séries de duas grandezas diferentes na mesma caixa (dias da reta, par
 * de dias da faixa, dias do ponto), que é o caso em que a dica passa a mentir por formato. Tudo o
 * que ela diria já está escrito: inclinação, R² e n na legenda, o limite da sobreposição no rodapé.
 */
export interface CycleTicketByProductScatterProps {
  readonly data?: readonly ProductCycleTicket[];
  readonly height?: number;
  readonly className?: string;
}

interface Point {
  readonly id: string;
  readonly ticketReais: number;
  readonly cicloDias: number;
}

interface Fit {
  readonly intercepto: number;
  readonly inclinacao: number;
  readonly r2: number;
  readonly n: number;
  /** Erro padrão dos resíduos, a raiz de SSE sobre n menos 2. */
  readonly erroResidual: number;
  readonly mediaX: number;
  readonly somaQuadradosX: number;
  readonly x0: number;
  readonly x1: number;
}

interface GridRow {
  readonly ticketReais: number;
  readonly reta: number;
  readonly faixa: readonly [number, number];
}

interface Grupo {
  readonly id: string;
  readonly rotulo: string;
  readonly cor: string;
  readonly forma: 'circle' | 'triangle';
  readonly pontos: readonly Point[];
  readonly fit: Fit | null;
  readonly grade: readonly GridRow[];
}

const MARGIN = { top: 10, right: 20, bottom: 8, left: 8 } as const;
const DOMAIN_X: readonly [number, number] = [0, 320_000];
const TICKS_X = [0, 80_000, 160_000, 240_000, 320_000] as const;
/** O eixo termina em 120 dias, a primeira linha de grade acima do topo da faixa mais alta. */
const DOMAIN_Y: readonly [number, number] = [0, 120];
const TICKS_Y = [0, 30, 60, 90, 120] as const;
const Y_AXIS_WIDTH = 60;
/** Raio fixado nas duas pontas do `ZAxis`, porque o tamanho do ponto aqui não codifica nada. */
const POINT_RADIUS = 3.6;
const Z_RANGE: readonly [number, number] = [
  Math.PI * POINT_RADIUS * POINT_RADIUS,
  Math.PI * POINT_RADIUS * POINT_RADIUS,
];
/** Quantos valores de X a faixa é calculada em: 30 passos dão uma borda lisa sem inventar dado. */
const GRID_STEPS = 30;
const CONFIDENCE = 0.95;
/** A inclinação é traduzida por R$ 100 mil de ticket, que é a unidade em que ela vira decisão. */
const SLOPE_UNIT = 100_000;
/**
 * Teto de 0,15 no preenchimento da faixa: é ele que deixa a sobreposição das duas legível, e é
 * também o que tira a faixa do piso de contraste de marca, resolvido pelo contorno opaco por cima
 * e pelo revestimento na cor do cartão por baixo (a conta está na nota do `meta.json`).
 */
const BAND_FILL_OPACITY = 0.15;
const BAND_STROKE_WIDTH = 1.25;
/** O revestimento na cor do cartão é o que separa dois contornos que se cruzam. */
const BAND_UNDER_WIDTH = 3.5;
const LINE_WIDTH = 2;
/** Passos do rastreio da sobreposição das faixas, fino o suficiente para o limite sair em milhar. */
const OVERLAP_STEPS = 400;

/**
 * t de Student a 95% de confiança, por grau de liberdade, para amostra pequena. A tabela existe
 * porque com n abaixo de 30 o 1,96 da normal subestima a faixa: com 20 graus de liberdade o valor
 * certo é 2,086, e usar 1,96 encolheria a faixa em cerca de 6%, o que é justamente o erro que faz
 * duas faixas parecerem separadas quando não estão.
 */
const T_95: Readonly<Record<number, number>> = {
  1: 12.706,
  2: 4.303,
  3: 3.182,
  4: 2.776,
  5: 2.571,
  6: 2.447,
  7: 2.365,
  8: 2.306,
  9: 2.262,
  10: 2.228,
  11: 2.201,
  12: 2.179,
  13: 2.16,
  14: 2.145,
  15: 2.131,
  16: 2.12,
  17: 2.11,
  18: 2.101,
  19: 2.093,
  20: 2.086,
  21: 2.08,
  22: 2.074,
  23: 2.069,
  24: 2.064,
  25: 2.06,
  26: 2.056,
  27: 2.052,
  28: 2.048,
  29: 2.045,
};
/** Acima de 29 graus de liberdade a tabela converge para o valor da normal. */
const T_95_LARGE = 1.96;

function tValue(graus: number): number {
  return T_95[graus] ?? T_95_LARGE;
}

/**
 * Mínimos quadrados com o que a faixa de confiança precisa. Devolve `null` com menos de três
 * pontos, porque o erro residual divide por n menos 2 e com dois pontos a reta passa exata: a
 * faixa sairia com largura zero e diria que não há incerteza nenhuma.
 */
function linearFit(pontos: readonly Point[]): Fit | null {
  const n = pontos.length;
  if (n < 3) return null;
  const mediaX = pontos.reduce((soma, ponto) => soma + ponto.ticketReais, 0) / n;
  const mediaY = pontos.reduce((soma, ponto) => soma + ponto.cicloDias, 0) / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  /**
   * Os extremos do X saem deste mesmo laço, e não de `Math.min` sobre a lista, porque o extremo de
   * lista vazia é infinito: não é zero, mas também não é medida, e chegaria ao desenho como número.
   */
  let menorX: number | null = null;
  let maiorX: number | null = null;
  for (const ponto of pontos) {
    sxx += (ponto.ticketReais - mediaX) ** 2;
    sxy += (ponto.ticketReais - mediaX) * (ponto.cicloDias - mediaY);
    syy += (ponto.cicloDias - mediaY) ** 2;
    menorX = menorX === null || ponto.ticketReais < menorX ? ponto.ticketReais : menorX;
    maiorX = maiorX === null || ponto.ticketReais > maiorX ? ponto.ticketReais : maiorX;
  }
  if (sxx === 0 || syy === 0) return null;
  if (menorX === null || maiorX === null) return null;
  const inclinacao = sxy / sxx;
  const intercepto = mediaY - inclinacao * mediaX;
  let sse = 0;
  for (const ponto of pontos) {
    sse += (ponto.cicloDias - (intercepto + inclinacao * ponto.ticketReais)) ** 2;
  }
  return {
    intercepto,
    inclinacao,
    r2: (sxy * sxy) / (sxx * syy),
    n,
    erroResidual: Math.sqrt(sse / (n - 2)),
    mediaX,
    somaQuadradosX: sxx,
    x0: menorX,
    x1: maiorX,
  };
}

/** Meia largura da faixa de 95% da média no ponto X, que alarga à medida que X se afasta do centro. */
function halfBand(fit: Fit, x: number): number {
  const dentro = 1 / fit.n + (x - fit.mediaX) ** 2 / fit.somaQuadradosX;
  return tValue(fit.n - 2) * fit.erroResidual * Math.sqrt(dentro);
}

function buildGrid(fit: Fit | null): readonly GridRow[] {
  if (fit === null) return [];
  const passo = (fit.x1 - fit.x0) / (GRID_STEPS - 1);
  const linhas: GridRow[] = [];
  for (let indice = 0; indice < GRID_STEPS; indice += 1) {
    const x = fit.x0 + passo * indice;
    const y = fit.intercepto + fit.inclinacao * x;
    const meia = halfBand(fit, x);
    linhas.push({ ticketReais: x, reta: y, faixa: [y - meia, y + meia] });
  }
  return linhas;
}

/**
 * O maior X em que as duas faixas ainda se tocam. Devolve `null` quando elas nunca se encontram no
 * trecho comum, e nesse caso a leitura é que os dois produtos se distinguem em toda a faixa medida.
 */
function overlapUpperBound(a: Fit, b: Fit): number | null {
  const inicio = Math.max(a.x0, b.x0);
  const fim = Math.min(a.x1, b.x1);
  if (fim <= inicio) return null;
  const passo = (fim - inicio) / OVERLAP_STEPS;
  let limite: number | null = null;
  for (let indice = 0; indice <= OVERLAP_STEPS; indice += 1) {
    const x = inicio + passo * indice;
    const ya = a.intercepto + a.inclinacao * x;
    const yb = b.intercepto + b.inclinacao * x;
    const ma = halfBand(a, x);
    const mb = halfBand(b, x);
    if (ya - ma <= yb + mb && yb - mb <= ya + ma) limite = x;
  }
  return limite;
}

export default function CycleTicketByProductScatter({
  data = defaultData,
  height,
  className,
}: CycleTicketByProductScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const formas: readonly ('circle' | 'triangle')[] = ['circle', 'triangle'];
  const grupos: Grupo[] = data.map((produto, indice) => {
    const pontos: Point[] = [];
    for (const oportunidade of produto.oportunidades) {
      if (oportunidade.cicloDias === null) continue;
      pontos.push({
        id: oportunidade.id,
        ticketReais: oportunidade.ticketReais,
        cicloDias: oportunidade.cicloDias,
      });
    }
    const fit = linearFit(pontos);
    return {
      id: produto.id,
      rotulo: produto.rotulo,
      cor: seriesColor(produto.slot - 1),
      forma: formas[indice % formas.length] ?? 'circle',
      pontos,
      fit,
      grade: buildGrid(fit),
    };
  });

  const exibidos = grupos.reduce((soma, grupo) => soma + grupo.pontos.length, 0);
  const total = data.reduce((soma, produto) => soma + produto.oportunidades.length, 0);
  const semCiclo = total - exibidos;

  if (exibidos === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade neste recorte com ticket e ciclo de venda fechados.</span>
      </div>
    );
  }

  const primeiro = grupos[0]?.fit ?? null;
  const segundo = grupos[1]?.fit ?? null;
  const limite = primeiro === null || segundo === null ? null : overlapUpperBound(primeiro, segundo);
  const confiancaTexto = formatPercent(CONFIDENCE, 0);
  const sobreposicaoTexto =
    limite === null
      ? 'as faixas não se encontram no trecho comum'
      : `as duas se sobrepõem até ${formatCurrencyAxis(limite)}`;
  /**
   * A inclinação de cada produto. A legenda repete a unidade em cada item, porque ali cada linha é
   * lida sozinha; a frase acessível a diz uma vez só, no fim, porque ali o teto de 250 caracteres
   * da ACE-1 é apertado. O número e o formatador são os mesmos nos dois.
   */
  const inclinacoes = grupos.map((grupo) => {
    if (grupo.fit === null) return { rotulo: grupo.rotulo, curto: null, texto: null };
    const porUnidade = grupo.fit.inclinacao * SLOPE_UNIT;
    const sinal = porUnidade >= 0 ? '+' : '−';
    const curto = `${sinal}${formatDays(Math.abs(porUnidade))}`;
    return { rotulo: grupo.rotulo, curto, texto: `${curto} por ${formatCurrencyAxis(SLOPE_UNIT)}` };
  });

  const summary =
    `Gráfico de dispersão com ${formatInt(exibidos)} oportunidades de ${formatInt(grupos.length)} produtos, ticket contra ` +
    `ciclo de venda, com reta e faixa de ${confiancaTexto} da média. ` +
    inclinacoes
      .filter((item) => item.curto !== null)
      .map((item) => `${item.rotulo} ${String(item.curto)}`)
      .join(', ') +
    ` por ${formatCurrencyAxis(SLOPE_UNIT)}. Aqui ${sobreposicaoTexto}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul
        aria-hidden
        className="mb-2 flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1 text-xs tabular-nums text-text-secondary"
      >
        {grupos.map((grupo, indice) => (
          <li className="flex items-center gap-2" key={`legenda-${grupo.id}`}>
            <svg className="shrink-0" height={10} viewBox="0 0 10 10" width={10}>
              {grupo.forma === 'circle' ? <circle cx={5} cy={5} fill={grupo.cor} r={4} /> : null}
              {grupo.forma === 'triangle' ? <polygon fill={grupo.cor} points="5,1 9.5,9 0.5,9" /> : null}
            </svg>
            <span>{grupo.rotulo}</span>
            <span className="text-text-muted">{inclinacoes[indice]?.texto ?? ''}</span>
            <span className="text-text-muted">
              {grupo.fit === null
                ? ''
                : `R² ${formatDecimal(grupo.fit.r2, 2)}, n ${formatInt(grupo.fit.n)}`}
            </span>
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="ticketReais"
              domain={[...DOMAIN_X]}
              name="Ticket"
              tickFormatter={formatCurrencyAxis}
              tickMargin={8}
              ticks={[...TICKS_X]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              axisLine={false}
              dataKey="cicloDias"
              domain={[...DOMAIN_Y]}
              name="Ciclo"
              tickFormatter={formatDays}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            {grupos.map((grupo) => (
              <Area
                data={[...grupo.grade]}
                dataKey="faixa"
                fill="none"
                isAnimationActive={animate}
                key={`revestimento-${grupo.id}`}
                legendType="none"
                stroke="var(--surface-raised)"
                strokeWidth={BAND_UNDER_WIDTH}
              />
            ))}
            {grupos.map((grupo) => (
              <Area
                data={[...grupo.grade]}
                dataKey="faixa"
                fill={grupo.cor}
                fillOpacity={BAND_FILL_OPACITY}
                isAnimationActive={animate}
                key={`faixa-${grupo.id}`}
                legendType="none"
                stroke={grupo.cor}
                strokeWidth={BAND_STROKE_WIDTH}
              />
            ))}
            {grupos.map((grupo) => (
              <Line
                activeDot={false}
                data={[...grupo.grade]}
                dataKey="reta"
                dot={false}
                isAnimationActive={animate}
                key={`reta-${grupo.id}`}
                legendType="none"
                stroke={grupo.cor}
                strokeWidth={LINE_WIDTH}
              />
            ))}
            {grupos.map((grupo) => (
              <Scatter
                data={[...grupo.pontos]}
                fill={grupo.cor}
                isAnimationActive={animate}
                key={`pontos-${grupo.id}`}
                name={grupo.rotulo}
                shape={grupo.forma}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`Faixa de ${confiancaTexto} da média da reta, com t da própria amostra, não intervalo de predição; ${sobreposicaoTexto}`}
        {semCiclo === 0 ? '' : `, e ${formatInt(semCiclo)} oportunidades sem ciclo fechado não aparecem`}
      </p>
    </div>
  );
}
