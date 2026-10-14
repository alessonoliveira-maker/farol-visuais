import type { CSSProperties } from 'react';
import { Filter } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, limit as defaultLimit, type WeeklyNoShow } from './data';

/**
 * Small multiples com uma categoria acesa: quatro pizzas do mesmo diâmetro, uma por semana, em que
 * só o não comparecimento recebe a cor de destaque e o resto da semana fica em neutro. A pergunta é
 * de limiar, não de composição, então o percentual é escrito só para a fatia acesa, e a única semana
 * que passa do teto ganha peso 700 e uma anotação curta com o valor do limite.
 */
export interface WeeklyNoShowPiesProps {
  readonly data?: readonly WeeklyNoShow[];
  /** Teto aceito de não comparecimento, em fração das agendas da semana. */
  readonly limit?: number;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** A única cor do visual: a categoria acesa em todas as pizzas (COR-1, COR-3). */
const NO_SHOW_FILL = 'var(--chart-1)';
/** Categoria neutra endossada pela tabela de tokens; mede 5,2:1 no escuro e 5,4:1 no claro. */
const REST_FILL = 'var(--text-muted)';
/** Diâmetro fixo, igual em toda pizza: o corpo do canvas largo tem 281,5 px e sobram 145 px depois das quatro linhas escritas. */
const PIE_DIAMETER = 136;
const OUTER_RADIUS = '94%';
/** Contorno na cor do cartão para as duas fatias não se colarem (COR-5). */
const SLICE_STROKE = 'var(--surface-raised)';
const SLICE_STROKE_WIDTH = 2;

const NO_SHOW_LABEL = 'Não compareceu';
const REST_LABEL = 'Compareceu ou remarcou';

interface WeekRow {
  readonly week: WeeklyNoShow;
  readonly total: number;
  /** Fração de não comparecimento; `null` quando a semana não teve agenda medida (EST-1b). */
  readonly share: number | null;
  readonly aboveLimit: boolean;
}

/** Monta a linha de cada semana. Semana sem agenda fica com `share` nulo, nunca com zero. */
function toRows(weeks: readonly WeeklyNoShow[], limit: number): readonly WeekRow[] {
  return weeks.map((week) => {
    const total = week.noShow + week.attended;
    const share = total > 0 ? week.noShow / total : null;
    return { week, total, share, aboveLimit: share !== null && share > limit };
  });
}

/** A semana de maior não comparecimento, ou `null` se nenhuma tem agenda medida. */
function worstRow(rows: readonly WeekRow[]): WeekRow | null {
  return rows.reduce<WeekRow | null>((best, row) => {
    if (row.share === null) return best;
    if (best === null || best.share === null) return row;
    return row.share > best.share ? row : best;
  }, null);
}

export default function WeeklyNoShowPies({
  data = defaultData,
  limit = defaultLimit,
  height,
  className,
}: WeeklyNoShowPiesProps) {
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
        <span>Nenhuma semana neste recorte: não houve agenda marcada no período.</span>
      </div>
    );
  }

  const rows = toRows(data, limit);
  const limitText = formatPercent(limit, 0);
  const worst = worstRow(rows);
  const aboveCount = rows.filter((row) => row.aboveLimit).length;
  const belowCount = rows.length - aboveCount;
  /* A anotação da ANO-2 leva nome e valor, e o valor sai do formatador, nunca digitado. */
  const limitNote = `acima do limite de ${limitText}`;

  const verdict =
    worst === null || worst.share === null
      ? 'Nenhuma semana tem agenda medida para comparar com o limite.'
      : aboveCount === 0
        ? `Nenhuma semana passa do limite de ${limitText}; o pico é ${worst.week.weekLabel}, com ${formatRateWithVolume(worst.week.noShow, worst.total, 1)}.`
        : `${worst.week.weekLabel} é a semana acima do limite de ${limitText}, com ${formatRateWithVolume(worst.week.noShow, worst.total, 1)}; nas outras ${String(belowCount)} o índice fica abaixo.`;

  const summary = `Grade de ${String(rows.length)} pizzas com o não comparecimento das agendas semana a semana, na mesma cor e no mesmo diâmetro. ${verdict}`;

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="figure"
      style={rootStyle}
    >
      {/* Legenda única (ROT-4): as duas partes se nomeiam aqui, e os números de cada parte ficam
          escritos sob cada pizza, na mesma ordem desta lista (ROT-10). */}
      <ul aria-hidden className="mb-4 flex shrink-0 flex-wrap gap-x-6 gap-y-1">
        <li className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: NO_SHOW_FILL }} />
          <span>{NO_SHOW_LABEL}</span>
        </li>
        <li className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: REST_FILL }} />
          <span>{REST_LABEL}</span>
        </li>
      </ul>

      <div
        className="grid min-h-0 flex-1 gap-3"
        style={{ gridTemplateColumns: `repeat(${String(rows.length)}, minmax(0, 1fr))` }}
      >
        {rows.map((row) => {
          const slices = [
            { id: 'nao-compareceu', name: NO_SHOW_LABEL, value: row.week.noShow, fill: NO_SHOW_FILL },
            { id: 'resto', name: REST_LABEL, value: row.week.attended, fill: REST_FILL },
          ];
          return (
            <div className="flex min-w-0 flex-col items-center" key={row.week.weekId}>
              <p
                className="shrink-0 text-xs"
                style={{
                  color: row.aboveLimit ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: row.aboveLimit ? 700 : 500,
                }}
              >
                {row.week.weekLabel}
              </p>
              <div className="mt-1 shrink-0" style={{ height: PIE_DIAMETER, width: PIE_DIAMETER }}>
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart accessibilityLayer={false}>
                    {/* A fatia acesa é a primeira, então ela começa sempre às 12 horas e ocupa a
                        mesma posição angular em todas as pizzas: é o que torna a grade comparável. */}
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={slices}
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
                      {slices.map((slice) => (
                        <Cell fill={slice.fill} key={slice.id} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Percentual escrito só para a fatia acesa, com o volume ao lado (DAD-1). Ele fica
                  FORA do disco porque uma fatia de 8% a 19% não tem corda para a tinta de "18,5%":
                  dentro dela o rótulo atravessaria a borda e cairia sobre o cartão (TEXTO-NA-MARCA). */}
              <p
                className="kpi-number mt-2 shrink-0 text-xs"
                style={{ color: NO_SHOW_FILL, fontWeight: row.aboveLimit ? 700 : 500 }}
              >
                {row.share === null ? formatInt(row.week.noShow) : formatRateWithVolume(row.week.noShow, row.total, 1)}
              </p>
              <p className="mt-1 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
                {`${formatInt(row.week.attended)} compareceram ou remarcaram`}
              </p>
              {row.aboveLimit ? (
                <p className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">{limitNote}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </figure>
  );
}
