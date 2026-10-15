import type { ReactElement } from 'react';
import { Filter } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type BarShapeProps } from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatDecimal, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BIN_WIDTH, data as defaultData, DOMAIN_MAX, WITHOUT_CYCLE } from './data';

/**
 * Histograma: o eixo contínuo cortado em faixas de largura igual, com a altura da barra contando
 * quantas observações caíram em cada faixa. É o modelo de entrada da família e a régua contra a qual
 * os outros são julgados.
 *
 * Três decisões separam um histograma honesto de uma barra qualquer. A largura do bin vem da métrica
 * e está escrita no rodapé, porque bin diferente leva a conclusão diferente e bin automático troca
 * de valor junto com o filtro. O bin vazio continua no array com contagem zero, e é ele que abre o
 * buraco que o desenho deve mostrar: se a faixa vazia desaparecer, o Recharts encosta os vizinhos e
 * o achado vira uma barra contínua. E o eixo Y é nomeado, porque altura de barra em painel de
 * produto é lida como dinheiro por padrão, não como contagem.
 *
 * O que ele não faz, de propósito: média, mediana e faixa interquartil são a v2 deste modelo. Aqui a
 * pergunta é só a forma.
 */
export interface CycleHistogramProps {
  readonly data?: readonly number[];
  readonly binWidth?: number;
  readonly domainMax?: number;
  readonly withoutCycle?: number;
  readonly height?: number;
  readonly className?: string;
}

interface Bin {
  readonly start: number;
  readonly end: number;
  /** Centro do bin: é nele que a barra se apoia no eixo numérico. */
  readonly center: number;
  readonly count: number;
}

/** Topo de 12 px: o rótulo do tique mais alto (11 px, centrado na linha) precisa de meia altura acima dela. */
const MARGIN = { top: 12, right: 8, bottom: 4, left: 4 } as const;
/** Passo fixo do eixo Y; o teto sai do dado, arredondado para cima ao múltiplo do passo. */
const Y_STEP = 8;
const BAR_FILL = 'var(--chart-1)';
/** Marca de base nas faixas vazias dentro da amostra, para o vão ser deliberado e não sumiço. */
const EMPTY_MARK = 'var(--line-strong)';
const EMPTY_MARK_H = 2;

/**
 * Conta quantas observações caem em cada faixa. O bin vazio **permanece** no array, com contagem
 * zero, e o array vai do zero ao teto do domínio, não ao maior valor observado.
 */
function bin(values: readonly number[], width: number, domainMax: number): Bin[] {
  const total = Math.ceil(domainMax / width);
  const counts = new Array<number>(total).fill(0);
  for (const value of values) {
    const index = Math.floor(value / width);
    if (index < 0 || index >= total) continue;
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts.map((count, index) => ({
    start: index * width,
    end: (index + 1) * width,
    center: index * width + width / 2,
    count,
  }));
}

/**
 * Mediana da amostra, ou `null` quando não há amostra.
 *
 * O `null` é a decisão, não um detalhe de implementação. Zero é um valor plausível em dias, então a
 * mediana zerada de uma lista vazia chega à tela como medição e ninguém consegue distinguir "a
 * metade fecha em até 0 dias" de "não houve negócio para medir". É a mesma forma da `v2` deste
 * modelo, e fecha a instância que o README desta família registrava como pendência.
 */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? null;
  return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

/** A média herdava o mesmo zero da mediana, pelo `data.length === 0 ? 0` que ficava no corpo. */
function average(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function CycleHistogram({
  data = defaultData,
  binWidth = BIN_WIDTH,
  domainMax = DOMAIN_MAX,
  withoutCycle = WITHOUT_CYCLE,
  height,
  className,
}: CycleHistogramProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  /**
   * A guarda testa `data`, que é a lista que alimenta as contas, e não `bins`: `bins` nasce de
   * `domainMax` dividido por `binWidth` e nunca é vazio, então uma guarda apoiada nele nunca
   * dispara e a amostra vazia seguia até a frase acessível como se tivesse sido medida.
   */
  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>
          {`Nenhuma oportunidade ganha neste recorte: sem amostra não há distribuição para desenhar, e a mediana fica ${formatUnavailable()} em vez de zero.`}
        </span>
      </div>
    );
  }

  const bins = bin(data, binWidth, domainMax);

  const lastFilled = bins.reduce((last, item, index) => (item.count > 0 ? index : last), -1);
  /** Faixa vazia cercada por faixas com caso: é o buraco da distribuição, não o fim dela. */
  const hole = bins.find((item, index) => item.count === 0 && index > 0 && index < lastFilled);
  const tallest = bins.reduce<Bin | null>((best, item) => (best === null || item.count > best.count ? item : best), null);

  const yTop = Math.max(Y_STEP, Math.ceil((tallest?.count ?? 0) / Y_STEP) * Y_STEP);
  const yTicks = Array.from({ length: yTop / Y_STEP + 1 }, (_, index) => index * Y_STEP);

  const middle = median(data);
  const mean = average(data);
  /** Cada medida escreve a própria ausência: nenhuma delas vira número quando não foi calculada. */
  const fullestText =
    tallest === null
      ? formatUnavailable()
      : `vai de ${formatInt(tallest.start)} a ${formatDays(tallest.end)}, com ${formatInt(tallest.count)} oportunidades`;
  const middleText = middle === null ? formatUnavailable() : formatDays(middle);
  const meanText = mean === null ? formatUnavailable() : `${formatDecimal(mean, 0)} dias`;

  /**
   * Barra cheia quando há caso na faixa; traço de base quando a faixa está vazia **dentro** da
   * amostra. A barra de contagem zero não pinta nada, e sem a marca o vão fica indistinguível de
   * recorte do eixo. Depois do último bin com caso não há marca: ali é o fim da amostra, não buraco.
   */
  const renderBin = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const item = bins[Number(index)];
    const left = Number(x);
    const span = Number(width);
    if (item !== undefined && item.count === 0) {
      const inside = Number(index) < lastFilled;
      const baseline = Number(y);
      return inside ? (
        <rect fill={EMPTY_MARK} height={EMPTY_MARK_H} width={span} x={left} y={baseline - EMPTY_MARK_H} />
      ) : (
        <g />
      );
    }
    return <rect fill={BAR_FILL} height={Number(barHeight)} width={span} x={left} y={Number(y)} />;
  };

  const summary =
    `Histograma do ciclo de fechamento de ${formatInt(data.length)} oportunidades ganhas, em faixas de ${formatDays(binWidth)}. ` +
    `A faixa mais cheia ${fullestText}. ` +
    `A metade fecha em até ${middleText} e a média fica em ${meanText}, puxada pela cauda longa.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      {/* O nome do eixo Y vive aqui, e não rotacionado na lateral: em 11 px o texto vertical é o
          primeiro a ser ignorado, e é justamente ele que impede ler altura como dinheiro. */}
      <span aria-hidden className="shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        oportunidades ganhas
      </span>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={0} data={bins} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              dataKey="center"
              domain={[0, domainMax]}
              interval="preserveStartEnd"
              tickCount={8}
              tickFormatter={(value: number) => formatInt(value)}
              type="number"
            />
            {/* `interval={0}` porque o Recharts descarta em silêncio tiques que julga sobrepostos, e o
                eixo passava a ler 0, 8, 16, 32 como escala que dobra. */}
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              domain={[0, yTop]}
              interval={0}
              tickFormatter={(value: number) => formatInt(value)}
              ticks={yTicks}
              width={28}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active !== true) return null;
                const item = payload?.[0]?.payload as Bin | undefined;
                if (item === undefined) return null;
                return (
                  <div className="rounded border border-line-subtle bg-surface-overlay px-2 py-1 text-xs text-text-primary shadow-lg">
                    <p className="font-display tabular-nums">{`${formatInt(item.start)} a ${formatDays(item.end)}`}</p>
                    <p className="tabular-nums text-text-secondary">
                      {`${formatInt(item.count)} ${item.count === 1 ? 'oportunidade' : 'oportunidades'}`}
                    </p>
                  </div>
                );
              }}
              cursor={{ fill: 'var(--line-subtle)' }}
            />
            {/* Uma série só. Duas séries de Bar repartem a banda do bin entre si, e as barras deixam
                de encostar: o histograma vira gráfico de colunas, que é outra coisa. Por isso a marca
                da faixa vazia sai do mesmo shape, e não de uma segunda série. */}
            <Bar dataKey="count" fill={BAR_FILL} isAnimationActive={animate} shape={renderBin} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`ciclo em dias, faixas de ${formatDays(binWidth)}`}</span>
        <span className="tabular-nums">{`n ${formatInt(data.length)} oportunidades ganhas`}</span>
        <span className="tabular-nums">{`domínio fixo de 0 a ${formatDays(domainMax)}, da métrica e não da amostra`}</span>
        {hole === undefined ? null : (
          <span className="tabular-nums">{`nenhum negócio fechou entre ${formatInt(hole.start)} e ${formatDays(hole.end)}`}</span>
        )}
        {withoutCycle <= 0 ? null : (
          <span className="tabular-nums">{`${formatInt(withoutCycle)} ganhas sem data de criação ficaram fora`}</span>
        )}
      </div>
    </figure>
  );
}
