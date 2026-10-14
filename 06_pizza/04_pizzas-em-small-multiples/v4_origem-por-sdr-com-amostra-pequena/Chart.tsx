import { Fragment, type CSSProperties } from 'react';
import { Filter, TriangleAlert } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginCount, type SdrOrigins } from './data';

/**
 * Small multiples com uma célula de amostra pequena: quatro pizzas do mesmo diâmetro, uma por pessoa
 * da pré vendas, com as mesmas origens na mesma ordem e a categoria de ausência vazada e por último.
 * A pizza cujo n fica abaixo de MIN_SAMPLE sai inteira em neutro, ganha o selo de amostra pequena e
 * perde o percentual: no lugar dele a coluna escreve a contagem absoluta, porque percentual de seis
 * leads varia dezessete pontos com um lead a mais e leria como precisão que o dado não tem.
 */
export interface SdrOriginPiesProps {
  readonly data?: readonly SdrOrigins[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Mínimo de leads para o percentual da composição ser publicado. É esta constante que decide o estado de cada célula. */
const MIN_SAMPLE = 12;
/** Diâmetro fixo, igual em toda pizza: 92 px fecham o corpo de 894 por 281,5 px com as seis linhas escritas. */
const PIE_DIAMETER = 92;
const OUTER_RADIUS = '94%';
/** Neutro da pizza de amostra pequena e da categoria de ausência. */
const MUTED = 'var(--text-muted)';
/** Contorno na cor do cartão para as cunhas vizinhas não se colarem (COR-5). */
const SLICE_STROKE = 'var(--surface-raised)';
const SLICE_STROKE_WIDTH = 2;
const MISSING_STROKE_WIDTH = 1.5;
/** Largura da coluna dos nomes de origem, em px: cabe "Sem origem declarada" em 11 px com a amostra ao lado. */
const LABEL_COLUMN = 160;

interface SliceRow {
  readonly origin: OriginCount;
  /** Percentual inteiro da composição, pelo maior resto; `null` na pizza de amostra pequena. */
  readonly percent: number | null;
}

interface PieRow {
  readonly sdr: SdrOrigins;
  readonly total: number;
  readonly small: boolean;
  readonly slices: readonly SliceRow[];
}

/** Cor da origem pelo slot fixo do dado; a categoria de ausência não recebe cor, e sim forma vazada. */
function slotColor(origin: OriginCount): string | null {
  if (origin.missing === true || origin.slot === undefined) return null;
  return CHART_SERIES_COLORS[origin.slot - 1] ?? 'var(--chart-1)';
}

/** Percentuais inteiros pelo maior resto, somando 100 (NUM-2). `null` quando não há total a repartir (EST-1b). */
function integerPercents(values: readonly number[]): readonly number[] | null {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return null;
  const raw = values.map((value) => (value / total) * 100);
  const result = raw.map((value) => Math.floor(value));
  const byRemainder = raw
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest);
  let missing = 100 - result.reduce((sum, value) => sum + value, 0);
  for (const { index } of byRemainder) {
    if (missing <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    missing -= 1;
  }
  return result;
}

/** Uma linha por pizza. É MIN_SAMPLE que decide se a célula publica percentual ou só contagem. */
function toRows(people: readonly SdrOrigins[]): readonly PieRow[] {
  return people.map((sdr) => {
    const counts = sdr.origins.map((origin) => origin.count);
    const total = counts.reduce((sum, count) => sum + count, 0);
    const small = total < MIN_SAMPLE;
    const percents = small ? null : integerPercents(counts);
    return {
      sdr,
      total,
      small,
      slices: sdr.origins.map((origin, index) => ({ origin, percent: percents?.[index] ?? null })),
    };
  });
}

export default function SdrOriginPies({ data = defaultData, height, className }: SdrOriginPiesProps) {
  const animate = useAnimateOnce();
  const rootStyle: CSSProperties | undefined = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={rootStyle}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Ninguém neste recorte: não houve lead distribuído no período.</span>
      </div>
    );
  }

  const rows = toRows(data);
  const legend = rows[0]?.slices.map((slice) => slice.origin) ?? [];
  const smallOnes = rows.filter((row) => row.small);
  const minText = formatInt(MIN_SAMPLE);

  /* A mesma frase serve à linha de leitura visível e à frase acessível, então as duas nunca saem
     com formatadores diferentes para a mesma medida (DAD-5). */
  const reading =
    smallOnes.length === 0
      ? `Toda pizza tem amostra acima do mínimo de ${minText} leads.`
      : `${smallOnes.map((row) => row.sdr.sdrLabel).join(', ')} abaixo do mínimo de ${minText} leads: sem percentual, só contagem.`;

  const summary = `Grade de ${formatInt(rows.length)} pizzas com a origem dos leads por pessoa, na mesma ordem e no mesmo diâmetro. Sem origem declarada vai vazada e por último. ${reading}`;

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="figure"
      style={rootStyle}
    >
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-4 text-text-secondary">
        {reading}
      </p>
      <div
        className="grid min-h-0 flex-1 items-start gap-x-2.5 gap-y-2"
        style={{ gridTemplateColumns: `${String(LABEL_COLUMN)}px repeat(${String(rows.length)}, minmax(0, 1fr))` }}
      >
        <span />
        {rows.map((row) => (
          <span className="flex min-w-0 flex-col items-center" key={`head-${row.sdr.sdrId}`}>
            <span className="text-xs leading-4 font-medium text-text-secondary">{row.sdr.sdrLabel}</span>
            <span className="text-[0.6875rem] leading-4 tabular-nums text-text-muted">
              {`${formatInt(row.total)} leads`}
            </span>
          </span>
        ))}

        <span />
        {rows.map((row) => (
          <span className="flex min-w-0 flex-col items-center" key={`pie-${row.sdr.sdrId}`}>
            <div className="shrink-0" style={{ height: PIE_DIAMETER, width: PIE_DIAMETER }}>
              <ResponsiveContainer height="100%" width="100%">
                <PieChart accessibilityLayer={false}>
                  {/* A ordem das cunhas é a do dado, nunca a do valor: a mesma origem começa no
                      mesmo ângulo em todas as pizzas, e a ausência fecha o giro. */}
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={row.slices.map((slice) => ({
                      id: slice.origin.id,
                      name: slice.origin.name,
                      value: slice.origin.count,
                    }))}
                    dataKey="value"
                    endAngle={-270}
                    isAnimationActive={animate}
                    labelLine={false}
                    nameKey="name"
                    outerRadius={OUTER_RADIUS}
                    startAngle={90}
                    stroke={SLICE_STROKE}
                    strokeWidth={SLICE_STROKE_WIDTH}
                  >
                    {row.slices.map((slice) => {
                      const color = slotColor(slice.origin);
                      if (color === null) {
                        /* Ausência com forma vazada, e não com uma cor a mais (ACE-2). */
                        return (
                          <Cell
                            fill="none"
                            key={slice.origin.id}
                            stroke={MUTED}
                            strokeWidth={MISSING_STROKE_WIDTH}
                          />
                        );
                      }
                      return <Cell fill={row.small ? MUTED : color} key={slice.origin.id} />;
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {row.small ? (
              <span className="mt-1 flex shrink-0 items-center gap-1 text-[0.6875rem] leading-4" style={{ color: 'var(--warning)' }}>
                {/* O selo não leva fundo tingido: --surface-overlay mede 1,00:1 contra o cartão no
                    tema claro, então a tarja simplesmente não existiria na tela (TOK-1). O ícone
                    fica em contêiner flex, nunca solto na linha (GEO-17). */}
                <TriangleAlert aria-hidden className="size-3 shrink-0" />
                <span>amostra pequena</span>
              </span>
            ) : null}
          </span>
        ))}

        {legend.map((origin, originIndex) => {
          const color = slotColor(origin);
          return (
            <Fragment key={origin.id}>
              <span className="flex min-w-0 items-center gap-2 text-[0.6875rem] leading-4 text-text-secondary">
                <span
                  aria-hidden
                  className={cn('size-2.5 shrink-0 rounded-[2px]', color === null && 'border-[1.5px] border-text-muted')}
                  style={color === null ? undefined : { backgroundColor: color }}
                />
                <span className="min-w-0 flex-1">{origin.name}</span>
              </span>
              {rows.map((row) => {
                const slice = row.slices[originIndex];
                if (slice === undefined) return <span key={`${origin.id}-${row.sdr.sdrId}`} />;
                return (
                  <span
                    className="text-right text-[0.6875rem] leading-4 tabular-nums"
                    key={`${origin.id}-${row.sdr.sdrId}`}
                    style={{ color: row.small ? 'var(--text-muted)' : 'var(--text-secondary)' }}
                  >
                    {slice.percent === null
                      ? `${formatInt(slice.origin.count)} de ${formatInt(row.total)}`
                      : `${formatPercent(slice.percent / 100, 0)} (${formatInt(slice.origin.count)} de ${formatInt(row.total)})`}
                  </span>
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </figure>
  );
}
