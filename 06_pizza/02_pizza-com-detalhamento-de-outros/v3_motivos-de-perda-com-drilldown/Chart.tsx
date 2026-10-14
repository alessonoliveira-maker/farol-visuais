import { ChevronRight, Filter, Unplug } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, initialFocusId, type LossDrilldownData } from './data';

/**
 * Pizza com detalhamento de Outros na variante interativa: em vez de abrir a cauda num painel ao
 * lado, um clique na fatia troca o dado da própria pizza pelo nível filho dela, com trilha de
 * navegação e o total do nível pai à vista. A regra que manda um motivo para a cauda fica escrita
 * no rodapé, com a contagem de motivos que ela reúne, e a composição de "Outros" fica nomeada na
 * lista já no nível de cima, porque a ROT-10 não aceita dica nem clique como lugar de nomear parte
 * de um todo.
 */
export interface LossDrilldownPieProps {
  readonly data?: LossDrilldownData;
  /** Nível aberto na primeira renderização; o render do catálogo não captura clique. */
  readonly focusId?: string;
  readonly height?: number;
  readonly className?: string;
}

const PIE_SIZE = 170;
const PIE_RADIUS = 76;
const RADIAN = Math.PI / 180;
const LABEL_RADIUS_FRACTION = 0.62;
/** Abaixo disto o rótulo interno não cabe no arco; quem nomeia a fatia é a lista tabular (ROT-10). */
const MIN_LABEL_FRACTION = 0.05;
/** Neutro da cauda: `--text-muted` mede 5,21:1 no escuro e 5,37:1 no claro contra o cartão, acima do piso de 3:1. */
const TAIL_FILL = 'var(--text-muted)';
/**
 * Texto vazado na cor do cartão, SEM halo (ROT-7b): o rótulo tem a fatia inteira por baixo, e o
 * halo da ROT-7 é a mesma `--surface-raised`, que no tema claro é o mesmo branco do vazado e
 * apagaria a letra por dentro. Vazado mede de 5,21:1 a 6,18:1 sobre as cores usadas aqui.
 */
const SLICE_LABEL_FILL = 'var(--surface-raised)';
/** Colunas da legenda tabular (ROT-5): amostra, nome, contagem e percentual com largura fixa à direita. */
const ROW_GRID = 'grid w-full grid-cols-[0.625rem_1fr_2.75rem_2.5rem_0.75rem] items-center gap-x-2 text-left';
/**
 * Teto de largura da lista. Sem ele a coluna do nome estica até a borda do cartão e abre um vão de
 * mais de 200 px entre "Acima do orçamento" e o seu próprio número, o que desfaz a leitura em linha
 * que a ROT-5 pede; medido no PNG de conferência da primeira rodada.
 */
const LIST_MAX_WIDTH = 304;

interface Row {
  readonly id: string;
  readonly name: string;
  readonly losses: number;
  readonly fill: string;
  /** Nomes dos submotivos que o clique abre; lista vazia é fatia que não se abre. */
  readonly parts: readonly string[];
}

/**
 * Percentual inteiro pelo maior resto, sempre somando 100 (NUM-2).
 *
 * Devolve `null` quando não há todo a repartir, em vez de uma lista de zeros: percentual de nada não
 * é zero por cento, e a EST-1b manda a ausência morar no tipo, não num ramo silencioso.
 */
function integerPercents(values: readonly number[], base: number): readonly number[] | null {
  if (base <= 0 || values.length === 0) return null;
  const raw = values.map((value) => (value / base) * 100);
  const floors = raw.map((value) => Math.floor(value));
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  const result = [...floors];
  let missing = 100 - floors.reduce((sum, value) => sum + value, 0);
  // O passo inverte quando os pisos já passam de 100, para o resto sair de quem tem a menor fração:
  // sem isso a soma impressa poderia fechar em 101, e a ROT-10 mede a soma do que está escrito.
  const step = missing >= 0 ? 1 : -1;
  const queue = missing >= 0 ? order : [...order].reverse();
  for (const { index } of queue) {
    if (missing === 0) break;
    result[index] = (result[index] ?? 0) + step;
    missing -= step;
  }
  return result;
}

interface SliceLabelProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly midAngle?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly percent?: number;
  readonly index?: number;
}

export default function LossDrilldownPie({ data = defaultData, focusId = initialFocusId, height, className }: LossDrilldownPieProps) {
  const animate = useAnimateOnce();
  const [openId, setOpenId] = useState<string | null>(focusId);
  const style = height === undefined ? undefined : { height };

  const grandTotal = data.motives.reduce((sum, motive) => sum + motive.losses, 0);
  const tail = data.motives.find((motive) => motive.slot === null);
  const open = openId === null ? undefined : data.motives.find((motive) => motive.id === openId && motive.submotives.length > 0);

  // Checagem de hierarquia antes de desenhar: total de pai que não fecha com a soma dos filhos faria
  // o nível filho dizer uma proporção que o nível pai nega, e nenhuma guarda do check mede isso,
  // porque as duas telas estão certas em separado.
  const broken = data.motives.find(
    (motive) => motive.submotives.length > 0 && motive.submotives.reduce((sum, part) => sum + part.losses, 0) !== motive.losses,
  );

  const topRows: readonly Row[] = data.motives.map((motive) => ({
    id: motive.id,
    name: motive.name,
    losses: motive.losses,
    fill: motive.slot === null ? TAIL_FILL : (CHART_SERIES_COLORS[motive.slot] ?? TAIL_FILL),
    parts: motive.submotives.map((part) => part.name),
  }));
  const rows: readonly Row[] =
    open === undefined
      ? topRows
      : open.submotives.map((part) => ({
          id: part.id,
          name: part.name,
          losses: part.losses,
          fill: CHART_SERIES_COLORS[part.slot] ?? TAIL_FILL,
          parts: [],
        }));

  const levelTotal = rows.reduce((sum, row) => sum + row.losses, 0);
  const percents = integerPercents(
    rows.map((row) => row.losses),
    levelTotal,
  );
  const topPercents = integerPercents(
    topRows.map((row) => row.losses),
    grandTotal,
  );

  if (broken !== undefined) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>
          {formatUnavailable()}: o total de {broken.name} não fecha com a soma dos submotivos, e uma hierarquia que não soma não se desenha.
        </span>
      </div>
    );
  }

  if (percents === null || topPercents === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma perda neste recorte: não há motivo para abrir.</span>
      </div>
    );
  }

  const leaderIndex = rows.reduce((best, row, index) => (row.losses > (rows[best]?.losses ?? -1) ? index : best), 0);
  const leader = rows[leaderIndex];
  const leaderPercent = percents[leaderIndex] ?? 0;
  const openIndex = open === undefined ? -1 : topRows.findIndex((row) => row.id === open.id);
  // O percentual do pai vem da MESMA conta do nível de cima, nunca de um arredondamento próprio:
  // dois caminhos para o mesmo número é como a trilha e a lista passam a discordar em 1 ponto.
  const openPercent = topPercents[openIndex] ?? 0;
  const tailCount = tail === undefined ? 0 : tail.submotives.length;
  const tailRule =
    tail === undefined ? '' : `${tail.name} reúne os ${formatInt(tailCount)} motivos abaixo de ${formatInt(data.tailMaxLosses)} perdas`;

  const levelLabel =
    open === undefined
      ? `${formatInt(grandTotal)} perdas no ${data.periodLabel}`
      : `${formatInt(levelTotal)} de ${formatInt(grandTotal)} perdas, ${formatPercent(openPercent / 100, 0)} do ${data.periodLabel}`;
  const footer =
    open === undefined ? `Percentual do ${data.periodLabel}; ${tailRule}.` : `Percentual dentro de ${open.name}; em Todos, ${tailRule}.`;

  const summary = [
    open === undefined
      ? `Gráfico de pizza com os ${formatInt(rows.length)} motivos das ${formatInt(grandTotal)} perdas do ${data.periodLabel}.`
      : `Gráfico de pizza dos motivos de perda do ${data.periodLabel}, aberto em ${open.name}, que soma ${formatInt(levelTotal)} de ${formatInt(grandTotal)} perdas em ${formatInt(rows.length)} submotivos.`,
    leader === undefined ? '' : `${leader.name} lidera o nível com ${formatPercent(leaderPercent / 100, 0)}.`,
    tail === undefined ? '' : `Em Todos, ${tailRule}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderSliceLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius: sliceOuter = 0,
    percent = 0,
    index = -1,
  }: SliceLabelProps): ReactElement | null => {
    if (percent < MIN_LABEL_FRACTION) return null;
    const pct = percents[index];
    if (pct === undefined) return null;
    const radius = innerRadius + (sliceOuter - innerRadius) * LABEL_RADIUS_FRACTION;
    const angle = -midAngle * RADIAN;
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill={SLICE_LABEL_FILL}
        fontSize={12}
        fontWeight={500}
        textAnchor="middle"
        x={cx + radius * Math.cos(angle)}
        y={cy + radius * Math.sin(angle)}
      >
        {formatPercent(pct / 100, 0)}
      </text>
    );
  };

  // O clique vem do Recharts com o índice da fatia, e é por ele que a peça acha a linha: o payload da
  // biblioteca não tem tipo próprio, e confiar nele obrigaria a afirmar uma forma que o pacote não
  // garante.
  const handleSliceClick = (_entry: unknown, index: number): void => {
    const row = rows[index];
    if (row === undefined || row.parts.length === 0) return;
    setOpenId(row.id);
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      {/* Trilha de navegação, focável por teclado, e o total do nível pai sempre à vista. A raiz usa
          role="group" e não role="img" de propósito: "img" apaga os botões da árvore de
          acessibilidade, e a trilha só é navegável por teclado se o leitor de tela a alcançar. */}
      <div className="mb-2 flex shrink-0 items-center justify-between gap-2 text-xs">
        <nav aria-label="Trilha de navegação do gráfico" className="flex min-w-0 items-center gap-1">
          {open === undefined ? (
            <span className="font-semibold text-text-primary">Todos</span>
          ) : (
            <>
              <button
                className="border-0 bg-transparent p-0 font-medium text-text-secondary underline"
                onClick={() => {
                  setOpenId(null);
                }}
                type="button"
              >
                Todos
              </button>
              <ChevronRight aria-hidden className="size-3 shrink-0 text-text-muted" />
              <span className="font-semibold text-text-primary">{open.name}</span>
            </>
          )}
        </nav>
        <span className="shrink-0 tabular-nums text-text-secondary">{levelLabel}</span>
      </div>
      <div className="flex min-h-0 flex-1 items-center gap-6">
        <div className="shrink-0" style={{ height: PIE_SIZE, width: PIE_SIZE }}>
          <ResponsiveContainer height="100%" width="100%">
            <PieChart accessibilityLayer={false}>
              <Pie
                cx="50%"
                cy="50%"
                data={rows}
                dataKey="losses"
                endAngle={-270}
                isAnimationActive={animate}
                label={renderSliceLabel}
                labelLine={false}
                nameKey="name"
                onClick={handleSliceClick}
                outerRadius={PIE_RADIUS}
                startAngle={90}
                stroke="var(--surface-raised)"
                strokeWidth={2}
              >
                {rows.map((row) => (
                  <Cell fill={row.fill} key={row.id} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Lista equivalente: a mesma navegação do clique na fatia, em botão, mais nome, contagem e
            percentual de toda parte (ROT-5, ROT-10). */}
        <ul className="flex min-w-0 flex-1 flex-col gap-y-1.5" style={{ maxWidth: LIST_MAX_WIDTH }}>
          <li aria-hidden className={cn(ROW_GRID, 'text-[0.6875rem] text-text-muted')}>
            <span />
            <span>motivo</span>
            <span className="text-right">perdas</span>
            <span className="text-right">%</span>
            <span />
          </li>
          {rows.map((row, index) => {
            const cells = (
              <>
                <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: row.fill }} />
                <span className="min-w-0 text-text-secondary">{row.name}</span>
                <span className="kpi-number text-right text-text-secondary">{formatInt(row.losses)}</span>
                <span className="kpi-number text-right text-text-muted">{formatPercent((percents[index] ?? 0) / 100, 0)}</span>
                {row.parts.length > 0 ? <ChevronRight aria-hidden className="size-3 text-text-muted" /> : <span />}
              </>
            );
            return (
              <li key={row.id}>
                {row.parts.length > 0 ? (
                  <button
                    className={cn(ROW_GRID, 'border-0 bg-transparent p-0 text-xs')}
                    onClick={() => {
                      setOpenId(row.id);
                    }}
                    type="button"
                  >
                    {cells}
                  </button>
                ) : (
                  <span className={cn(ROW_GRID, 'text-xs')}>{cells}</span>
                )}
                {/* A composição da cauda fica nomeada no desenho parado, sem depender do clique. */}
                {row.id === tail?.id && row.parts.length > 0 ? (
                  <p aria-hidden className="mt-0.5 pl-[1.125rem] text-[0.6875rem] text-text-muted">
                    inclui {row.parts.join(', ')}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {footer}
      </p>
    </div>
  );
}
