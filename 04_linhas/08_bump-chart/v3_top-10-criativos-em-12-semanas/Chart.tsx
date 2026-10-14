import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, weeks as defaultWeeks, type CreativeCplSeries } from './data';

/**
 * Bump chart de um top 10 dinâmico: só os 10 menores CPL de cada semana entram no ranking, quem
 * cai abaixo vira lacuna (não zero), e a linha volta com ponto anelado quando reentra. Um
 * criativo em destaque mostra a fadiga: descida lenta e constante ao longo das 12 semanas.
 */
export interface Top10CplBumpProps {
  readonly data?: readonly CreativeCplSeries[];
  readonly weeks?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

interface ChartRow {
  readonly week: string;
  readonly raw: Readonly<Record<string, number>>;
  readonly ranks: Readonly<Record<string, number | null>>;
  /** Deslocamento vertical só do rótulo de nome, nunca do ponto (Anatomia, item 4). */
  readonly labelOffset: Readonly<Record<string, number>>;
  /** Quem desenha o círculo e o número quando duas séries empatam na mesma posição: o
   * ponto é um só (a posição é a mesma), então só a primeira em ordem de id o desenha. */
  readonly primary: Readonly<Record<string, boolean>>;
}

const TOP_N = 10;
const MARGIN = { top: 20, right: 184, bottom: 4, left: 184 } as const;
const RANK_AXIS_WIDTH = 4;
const DOT_RADIUS = 8;
const LABEL_GAP = 8;
/** Distância entre os dois nomes empatados, medida entre âncoras (ROT-9 exige piso de 4 px de
 * tinta livre; com texto de 12 px o piso equivale a 16 px entre âncoras, e o passo entre linhas
 * do ranking dá a folga para mais do que isso sem invadir a linha vizinha). */
const LABEL_TIE_GAP = 15;
/** Rótulo de quem entra no top 10 sem nunca aparecer numa ponta (não tem posição na primeira
 * nem na última semana): fica no vão vazio entre a linha do ranking e a de cima. */
const BOUNDARY_LABEL_OFFSET = DOT_RADIUS + 6;
const HIGHLIGHT_ID = 'crt-10';
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

function shortDate(iso: string): string {
  const [, month, day] = iso.split('-');
  return `${day ?? ''}/${month ?? ''}`;
}

/** Competição 1, 2, 2, 4, com corte no top 10: quem fica abaixo vira null (lacuna, não zero). */
function rankWeek(items: readonly { id: string; name: string; value: number }[]): Record<string, number | null> {
  const sorted = [...items].sort((a, b) => a.value - b.value || a.name.localeCompare(b.name, 'pt-BR'));
  const ranks: Record<string, number | null> = {};
  sorted.forEach((item, index) => {
    const prev = sorted[index - 1];
    const rank = prev !== undefined && prev.value === item.value ? (ranks[prev.id] ?? index + 1) : index + 1;
    ranks[item.id] = rank !== null && rank <= TOP_N ? rank : null;
  });
  return ranks;
}

/** Rótulos das pontas se amontoam quando duas posições empatam (mesma linha, tinta em tinta):
 * separa os NOMES em torno da posição comum, sem mexer no ponto real do dado (Anatomia, item 4).
 * O ponto (círculo e número) fica no lugar verdadeiro para as duas séries, porque as duas de fato
 * ocupam a mesma posição; só o texto do nome se afasta, e só a primeira em ordem de id desenha o
 * círculo, para o mesmo número não ficar escrito duas vezes exatamente um sobre o outro. */
function computeLabelOffsets(ranks: Readonly<Record<string, number | null>>): {
  offsets: Record<string, number>;
  primary: Record<string, boolean>;
} {
  const groups = new Map<number, string[]>();
  Object.entries(ranks).forEach(([id, rank]) => {
    if (rank === null) return;
    const list = groups.get(rank) ?? [];
    list.push(id);
    groups.set(rank, list);
  });
  const offsets: Record<string, number> = {};
  const primary: Record<string, boolean> = {};
  groups.forEach((ids) => {
    const sorted = [...ids].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const mid = (sorted.length - 1) / 2;
    sorted.forEach((id, i) => {
      offsets[id] = (i - mid) * LABEL_TIE_GAP;
      primary[id] = i === 0;
    });
  });
  return { offsets, primary };
}

export default function Top10CplBump({ data = defaultData, weeks = defaultWeeks, height, className }: Top10CplBumpProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0 || weeks.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>
          Nenhum criativo neste recorte: não há top <span className="tabular-nums">{formatInt(TOP_N)}</span> para
          ranquear.
        </span>
      </div>
    );
  }

  const rows: ChartRow[] = weeks.map((week, wIndex) => {
    const items = data.map((series) => ({ id: series.id, name: series.name, value: series.values[wIndex] ?? 0 }));
    const raw: Record<string, number> = {};
    items.forEach((item) => {
      raw[item.id] = item.value;
    });
    const ranks = rankWeek(items);
    const { offsets, primary } = computeLabelOffsets(ranks);
    return { week, raw, ranks, labelOffset: offsets, primary };
  });

  const lastIndex = rows.length - 1;
  const ranksBySeries = new Map(data.map((s) => [s.id, rows.map((r) => r.ranks[s.id] ?? null)]));
  const boundaryBySeries = new Map<string, Record<number, 'entry' | 'exit'>>();
  data.forEach((series) => {
    const seriesRanks = ranksBySeries.get(series.id) ?? [];
    const boundaries: Record<number, 'entry' | 'exit'> = {};
    seriesRanks.forEach((rank, i) => {
      if (rank === null) return;
      const prev = i > 0 ? seriesRanks[i - 1] : undefined;
      const next = i < lastIndex ? seriesRanks[i + 1] : undefined;
      if (i > 0 && prev === null) boundaries[i] = 'entry';
      if (i < lastIndex && next === null) boundaries[i] = 'exit';
    });
    boundaryBySeries.set(series.id, boundaries);
  });

  const highlight = data.find((s) => s.id === HIGHLIGHT_ID);
  const highlightStart = rows[0]?.ranks[HIGHLIGHT_ID] ?? null;
  const highlightEnd = rows[lastIndex]?.ranks[HIGHLIGHT_ID] ?? null;

  const summary = highlight && highlightStart !== null && highlightEnd !== null
    ? `Gráfico de linhas em posição (bump chart) com o top 10 de CPL de 12 criativos em 12 semanas; abaixo do 10º vira lacuna. ${highlight.name} desce da ${String(highlightStart)}ª para a ${String(highlightEnd)}ª posição, sinal de fadiga.`
    : 'Gráfico de linhas em posição (bump chart) sem semana para ranquear.';

  const nameById = new Map(data.map((s) => [s.id, s.name]));
  /** Quem nunca aparece na ponta (fora do top 10 na primeira e na última semana) não tem onde
   * escrever o nome pelo rótulo direto de início e fim, e sem nome lê como se a linha fosse de
   * quem já tem rótulo (checklist 1 e 12, item b e d). O nome entra no momento em que a série
   * entra no top 10; a saída continua marcada só pelo ponto anelado, como a de quem já é
   * rotulado nas pontas, para não amontoar duas linhas de texto no mesmo vão de 1 semana. */
  const idsWithoutEndLabel = new Set(
    data.filter((s) => (rows[0]?.ranks[s.id] ?? null) === null && (rows[lastIndex]?.ranks[s.id] ?? null) === null).map((s) => s.id),
  );

  const renderDot = (seriesId: string) => ({ cx, cy, index, value }: DotItemDotProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || value === undefined || value === null || index === undefined) return null;
    const isHighlight = seriesId === HIGHLIGHT_ID;
    const color = isHighlight ? 'var(--chart-1)' : 'var(--line-strong)';
    const textColor = isHighlight ? 'var(--text-primary)' : 'var(--text-secondary)';
    const weight = isHighlight ? 700 : 500;
    const name = nameById.get(seriesId) ?? '';
    const boundary = boundaryBySeries.get(seriesId)?.[index];
    const row = rows[index];
    /** Empate real faz duas séries ocuparem o mesmo pixel: o ponto (círculo e número) fica no
     * lugar verdadeiro, sem deslocamento, porque é ali que as duas de fato estão; só o NOME nas
     * pontas se afasta, em torno da posição comum (Anatomia, item 4; corrige o deslocamento do
     * círculo que soltava o ponto da própria linha, checklist 15 item d). */
    const offset = row?.labelOffset[seriesId] ?? 0;
    const isPrimary = row?.primary[seriesId] ?? true;
    return (
      <g key={`${seriesId}-${String(index)}`}>
        {index === 0 ? (
          <text className="font-sans" dominantBaseline="central" fill={textColor} fontSize={12} fontWeight={weight} style={HALO} textAnchor="end" x={cx - DOT_RADIUS - LABEL_GAP} y={cy + offset}>
            {name}
          </text>
        ) : null}
        {boundary === 'entry' && idsWithoutEndLabel.has(seriesId) ? (
          <text className="font-sans" dominantBaseline="central" fill={textColor} fontSize={11} fontWeight={500} style={HALO} textAnchor="middle" x={cx} y={cy - BOUNDARY_LABEL_OFFSET}>
            {name}
          </text>
        ) : null}
        {isPrimary ? (
          <>
            {boundary ? <circle cx={cx} cy={cy} fill="none" r={DOT_RADIUS + 4} stroke={color} strokeDasharray="2 2" strokeWidth={1.5} /> : null}
            <circle cx={cx} cy={cy} fill="var(--surface-raised)" r={DOT_RADIUS} stroke={color} strokeWidth={2} />
            <text className="font-display tabular-nums" dominantBaseline="central" fill="var(--text-primary)" fontSize={11} fontWeight={600} textAnchor="middle" x={cx} y={cy}>
              {String(value)}
            </text>
          </>
        ) : null}
        {index === lastIndex ? (
          <text className="font-sans" dominantBaseline="central" fill={textColor} fontSize={12} fontWeight={weight} style={HALO} textAnchor="start" x={cx + DOT_RADIUS + LABEL_GAP} y={cy + offset}>
            {name}
          </text>
        ) : null}
      </g>
    );
  };

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, string | number>) => {
    const row = props.payload?.[0]?.payload as ChartRow | undefined;
    const mapped = (props.payload ?? []).map((entry) => {
      const id = data.find((s) => s.name === entry.name)?.id;
      const rawValue = id !== undefined ? row?.raw[id] : undefined;
      return { ...entry, value: rawValue ?? entry.value };
    });
    return <ChartTooltip active={props.active} label={props.label} payload={mapped as unknown as ChartTooltipProps['payload']} valueFormat="currencyCompact" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Eixo mostra a posição no top <span className="tabular-nums">{formatInt(TOP_N)}</span>, não
        o CPL; quem sai vira lacuna e o CPL fica na dica.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis axisLine={false} dataKey="week" interval={1} stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={shortDate} tickLine={false} tickMargin={8} />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              domain={[1, TOP_N]}
              reversed
              tick={false}
              tickLine={false}
              ticks={Array.from({ length: TOP_N }, (_, i) => i + 1)}
              width={RANK_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: 'var(--line-strong)' }} isAnimationActive={false} itemSorter={(item) => Number(item.value) || 0} />
            {data.map((series) => (
              <Line
                connectNulls={false}
                dataKey={(row: ChartRow) => row.ranks[series.id] ?? null}
                dot={renderDot(series.id)}
                isAnimationActive={animate}
                key={series.id}
                name={series.name}
                stroke={series.id === HIGHLIGHT_ID ? 'var(--chart-1)' : 'var(--line-strong)'}
                strokeWidth={series.id === HIGHLIGHT_ID ? 2.5 : 1}
                type="linear"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
