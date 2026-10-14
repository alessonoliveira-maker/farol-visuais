import { Filter, Unplug } from 'lucide-react';

import { formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CADENCE_MONTH, CURRENT_MONTH, data as defaultData, ELAPSED_MONTHS, type CohortRow } from './data';

/**
 * Cohort de conversão em triângulo com uma mudança de regra no meio: os cohorts de entrada aparecem em
 * dois blocos, antes e depois da nova cadência de pré-vendas, e cada bloco fecha com a sua própria
 * média ponderada. A pergunta que o desenho responde é vertical, coluna a coluna, na mesma idade.
 *
 * A COLUNA EM DESTAQUE NÃO SE DESTACA POR COR. A rampa sequencial já gasta o canal de cor no valor da
 * célula, e degrau contra degrau ela mede de 1,23:1 a 1,52:1 entre vizinhos, então cor de destaque por
 * cima dela não se veria (TOK-8, TOK-9). O destaque vive em peso de fonte, 700 no cabeçalho da coluna e
 * 600 nas células dela, mais a anotação que escreve os dois números (COR-2, ACE-2).
 *
 * A DIVISÓRIA É ANOTAÇÃO, NÃO MOLDURA. A ESP-5 proíbe divisória entre itens, e é por isso que ela entra
 * aqui pela ANO-1, que manda anotar mudança de regra: traço de referência em `--line-strong`, que a
 * ACE-6 endossa para esse papel, com o rótulo escrito ao lado e fora das células.
 *
 * TRÊS AUSÊNCIAS DIFERENTES, TRÊS DESENHOS, porque confundi-las é a DAD-2. Célula sem nada é período que
 * ainda não começou; poço com contorno cheio e o zero escrito é zero medido (EST-3); contorno pontilhado
 * com o ícone é período que existe e não foi medido (EST-2). A chave do rodapé nomeia só os estados que o
 * dado desenha, para o texto nunca prometer estado ausente da tela (DAD-10).
 */
export interface CohortCadenceTriangleProps {
  readonly data?: readonly CohortRow[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Cinco degraus da rampa, pulando `--seq-4` e `--seq-5`: são os dois tons em que nenhum texto do Farol
 * alcança 4,5:1 nos dois temas ao mesmo tempo. Cinco degraus só valem porque toda célula escreve o
 * número, que é a condição da isenção registrada na TOK-8.
 */
const SEQ_TOKENS = ['var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-6)', 'var(--seq-7)'] as const;
/** Texto por degrau, medido no pior tema: 12,69, 9,21 e 6,33 nos baixos; 5,45 e 8,29 nos altos. */
const SEQ_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;
const BUCKETS = SEQ_TOKENS.length;
const CELL_GAP = 2;
/** A coluna em destaque é o primeiro mês de vida, onde a cadência de pré-vendas age. */
const HIGHLIGHT_ELAPSED = 1;

type CellState =
  | { readonly kind: 'futuro' }
  | { readonly kind: 'ausente' }
  | { readonly kind: 'valor'; readonly rate: number; readonly open: boolean };

interface CohortLine {
  readonly row: CohortRow;
  readonly cells: readonly CellState[];
}

function monthIndex(month: string): number {
  return Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1;
}

/** Período em curso: o mês de entrada mais os meses decorridos cai no mês corrente do recorte. */
function isOpenPeriod(month: string, elapsed: number, current: string): boolean {
  return monthIndex(month) + elapsed === monthIndex(current);
}

/**
 * Estado de uma célula, e a ordem dos testes é a própria leitura: fora do array o período não existe;
 * `null` existe e não foi medido; e só com base maior que zero a divisão vira taxa, porque sem base a
 * resposta é ausência e nunca zero (EST-1b).
 */
function cellState(row: CohortRow, elapsed: number, current: string): CellState {
  if (elapsed >= row.booked.length) return { kind: 'futuro' };
  const booked = row.booked[elapsed];
  if (booked === undefined || booked === null || row.size <= 0) return { kind: 'ausente' };
  return { kind: 'valor', rate: booked / row.size, open: isOpenPeriod(row.month, elapsed, current) };
}

/** Extremos de uma lista, sem ramo que devolva zero para lista vazia (EST-1b). */
function extent(values: readonly number[]): { readonly min: number; readonly max: number } | null {
  let min: number | null = null;
  let max: number | null = null;
  for (const value of values) {
    if (min === null || value < min) min = value;
    if (max === null || value > max) max = value;
  }
  return min === null || max === null ? null : { min, max };
}

/**
 * Taxa ponderada pelos leads de um bloco numa coluna, só sobre período fechado: juntar o mês em curso
 * puxaria a média para baixo por causa dos dias que ainda não aconteceram. Devolve `null` quando o bloco
 * não tem nenhum cohort fechado naquela idade.
 */
function weightedRate(
  lines: readonly CohortLine[],
  elapsed: number,
): { readonly rate: number; readonly leads: number; readonly cohorts: number } | null {
  let booked = 0;
  let leads = 0;
  let cohorts = 0;
  for (const line of lines) {
    const state = line.cells[elapsed];
    if (state === undefined || state.kind !== 'valor' || state.open) continue;
    booked += state.rate * line.row.size;
    leads += line.row.size;
    cohorts += 1;
  }
  return leads === 0 ? null : { rate: booked / leads, leads, cohorts };
}

function paletteAt(level: number): { readonly fill: string; readonly text: string } {
  return { fill: SEQ_TOKENS[level] ?? SEQ_TOKENS[0], text: SEQ_TEXT[level] ?? SEQ_TEXT[0] };
}

export default function CohortCadenceTriangle({
  data = defaultData,
  height,
  className,
}: CohortCadenceTriangleProps) {
  const columns = Array.from({ length: ELAPSED_MONTHS }, (_, index) => index);
  const lines: readonly CohortLine[] = data.map((row) => ({
    row,
    cells: columns.map((elapsed) => cellState(row, elapsed, CURRENT_MONTH)),
  }));
  const before = lines.filter((line) => monthIndex(line.row.month) < monthIndex(CADENCE_MONTH));
  const after = lines.filter((line) => monthIndex(line.row.month) >= monthIndex(CADENCE_MONTH));

  const allCells = lines.flatMap((line) => line.cells);
  const rates = allCells.flatMap((state) => (state.kind === 'valor' ? [state.rate] : []));
  const span = extent(rates);
  const missing = allCells.filter((state) => state.kind === 'ausente').length;
  const hasZero = allCells.some((state) => state.kind === 'valor' && state.rate === 0);
  const hasFuture = allCells.some((state) => state.kind === 'futuro');

  const highlightBefore = weightedRate(before, HIGHLIGHT_ELAPSED);
  const highlightAfter = weightedRate(after, HIGHLIGHT_ELAPSED);
  const highlightLabel = `M${formatInt(HIGHLIGHT_ELAPSED)}`;
  const firstLabel = `M${formatInt(0)}`;
  const lastLabel = `M${formatInt(ELAPSED_MONTHS - 1)}`;
  const cadenceLabel = `nova cadência de pré-vendas, a partir de ${formatMonthShort(CADENCE_MONTH)}`;

  /** Fronteiras das faixas, escritas na legenda porque a cor sozinha não ordena (TOK-8). */
  const bounds =
    span === null
      ? null
      : Array.from(
          { length: BUCKETS + 1 },
          (_, index) => span.min + ((span.max - span.min) * index) / BUCKETS,
        );

  function bucketOf(rate: number): number {
    if (span === null || span.max === span.min) return 0;
    const step = Math.floor(((rate - span.min) / (span.max - span.min)) * BUCKETS);
    return Math.min(BUCKETS - 1, Math.max(0, step));
  }

  if (lines.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum cohort neste recorte: sem mês de entrada não existe triângulo a montar.</span>
      </div>
    );
  }

  const comparable = highlightBefore !== null && highlightAfter !== null;
  const summary = comparable
    ? `Triângulo de cohort com a conversão de lead em agenda de ${formatInt(data.length)} meses de entrada, de ${firstLabel} a ${lastLabel}. ` +
      `Em ${highlightLabel} os cohorts anteriores à cadência de ${formatMonthShort(CADENCE_MONTH)} somam ${formatPercent(highlightBefore.rate, 1)} e os posteriores somam ${formatPercent(highlightAfter.rate, 1)}. ` +
      `A diagonal tracejada é ${formatMonthShort(CURRENT_MONTH)}, em curso.`
    : `Triângulo de cohort com a conversão de lead em agenda de ${formatInt(data.length)} meses de entrada, de ${firstLabel} a ${lastLabel}, sem os dois blocos fechados na mesma idade para comparar a cadência.`;

  function renderCells(line: CohortLine) {
    return columns.map((elapsed) => {
      const state = line.cells[elapsed];
      const strong = elapsed === HIGHLIGHT_ELAPSED;
      if (state === undefined || state.kind === 'futuro') {
        return <td className="align-middle" key={elapsed} />;
      }
      if (state.kind === 'ausente') {
        return (
          <td className="rounded-sm border border-dotted px-1 py-1 align-middle" key={elapsed} style={{ borderColor: 'var(--text-muted)' }}>
            <span className="flex items-center justify-center text-text-muted">
              <Unplug aria-hidden className="size-3" />
            </span>
          </td>
        );
      }
      const zero = state.rate === 0;
      const palette = paletteAt(bucketOf(state.rate));
      /**
       * Toda célula leva 1 px de contorno para a caixa medir igual em qualquer estado, e no estado comum
       * esse contorno é a cor do cartão: é a separação que a COR-5 pede entre marcas que não contrastam
       * entre si, no lugar de um vão que sumiria com a borda tracejada da vizinha.
       *
       * O tracejado do período em curso sai na MESMA tinta do número, e não em `--text-primary` fixo: o
       * contorno é pintado sobre o preenchimento da própria célula, e `--text-primary` sobre `--seq-7`
       * mede 1,44:1, abaixo dos 3:1 que a ACE-6 pede de traço que carrega informação. Na tinta do número
       * o pior caso medido é 5,45:1.
       */
      return (
        <td
          className={cn(
            'rounded-sm border px-1 py-1 text-center align-middle font-display tabular-nums',
            strong ? 'font-semibold' : 'font-medium',
            state.open ? 'border-dashed' : 'border-solid',
          )}
          key={elapsed}
          style={{
            backgroundColor: zero ? 'var(--surface-sunken)' : palette.fill,
            borderColor: zero ? 'var(--text-muted)' : state.open ? palette.text : 'var(--surface-raised)',
            color: zero ? 'var(--text-primary)' : palette.text,
          }}
        >
          {formatPercent(state.rate, 1)}
        </td>
      );
    });
  }

  function renderBlock(block: readonly CohortLine[], key: string, side: string) {
    return (
      <>
        {block.map((line) => (
          <tr key={line.row.month}>
            <th className="text-left align-middle font-medium text-text-secondary" scope="row">
              {formatMonthShort(line.row.month)}
            </th>
            <td className="pr-2 text-right align-middle font-display tabular-nums text-text-secondary">
              {formatInt(line.row.size)}
            </td>
            {renderCells(line)}
          </tr>
        ))}
        <tr key={key}>
          <th className="text-left align-middle font-medium text-text-muted" scope="row">
            Média
          </th>
          {/* Sem contagem de cohorts no rótulo: cada coluna tem uma população diferente, porque a idade
              que um cohort alcançou depende do mês em que ele entrou, e um número fixo aqui seria falso. */}
          <td className="pr-2 text-right align-middle text-text-muted">{side}</td>
          {columns.map((elapsed) => {
            const average = weightedRate(block, elapsed);
            return (
              <td
                className={cn(
                  'px-1 text-center align-middle font-display tabular-nums text-text-primary',
                  elapsed === HIGHLIGHT_ELAPSED ? 'font-semibold' : 'font-medium',
                )}
                key={elapsed}
              >
                {average === null ? '' : formatPercent(average.rate, 1)}
              </td>
            );
          })}
        </tr>
      </>
    );
  }

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="shrink-0 text-xs leading-4 text-text-secondary">
        {comparable && highlightBefore !== null && highlightAfter !== null
          ? `Na idade de ${highlightLabel} a conversão ${highlightAfter.rate >= highlightBefore.rate ? 'sobe' : 'cai'} de ${formatPercent(highlightBefore.rate, 1)}, com os ${formatInt(highlightBefore.cohorts)} cohorts anteriores, para ${formatPercent(highlightAfter.rate, 1)}, com os ${formatInt(highlightAfter.cohorts)} que já entraram sob a nova cadência.`
          : `Sem dois blocos fechados na idade de ${highlightLabel} não há comparação de cadência a fazer.`}
      </p>
      {comparable && highlightBefore !== null && highlightAfter !== null ? (
        <p aria-hidden className="shrink-0 text-[11px] leading-4 text-text-muted">
          {`${highlightLabel}: ${formatPercent(highlightBefore.rate, 1)} antes, ${formatPercent(highlightAfter.rate, 1)} depois`}
        </p>
      ) : null}

      <table
        className="w-full flex-1 table-fixed text-[11px] leading-4"
        style={{ borderCollapse: 'separate', borderSpacing: CELL_GAP }}
      >
        <thead>
          <tr>
            <th className="w-14 text-left align-bottom font-medium text-text-muted" scope="col">
              Entrada
            </th>
            <th className="w-16 pr-2 text-right align-bottom font-medium text-text-muted" scope="col">
              Leads
            </th>
            {columns.map((elapsed) => (
              <th
                className={cn(
                  'text-center align-bottom font-display tabular-nums',
                  elapsed === HIGHLIGHT_ELAPSED ? 'font-bold text-text-primary' : 'font-medium text-text-muted',
                )}
                key={elapsed}
                scope="col"
              >
                {`M${formatInt(elapsed)}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderBlock(before, 'media-antes', 'antes')}
          <tr>
            <td className="py-1" colSpan={columns.length + 2}>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-text-muted">{cadenceLabel}</span>
                {/* Traço de referência por BORDA, não por área preenchida: uma faixa de 1 px pintada em
                    --line-strong é lida como marca de área abaixo do piso de 3:1, e o que a ACE-6 endossa
                    neste token é a linha de referência, que é o que esta borda é. */}
                <span aria-hidden className="min-w-0 flex-1 border-t" style={{ borderColor: 'var(--line-strong)' }} />
              </div>
            </td>
          </tr>
          {renderBlock(after, 'media-depois', 'depois')}
        </tbody>
      </table>

      <figcaption aria-hidden className="flex shrink-0 flex-col gap-1 text-[11px] leading-4 text-text-muted">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {bounds === null ? (
            <span>{formatUnavailable()}</span>
          ) : (
            bounds.map((bound, index) => (
              <span className="flex items-center gap-x-2" key={`faixa-${formatInt(index)}`}>
                <span className="font-display tabular-nums text-text-secondary">{formatPercent(bound, 0)}</span>
                {index < BUCKETS ? (
                  <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: paletteAt(index).fill }} />
                ) : null}
              </span>
            ))
          )}
          <span>taxa acumulada de agenda; a ordem fina está no número, não no degrau</span>
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{`${firstLabel} é a entrada e ${lastLabel} são seis meses depois`}</span>
          <span>{`tracejado: ${formatMonthShort(CURRENT_MONTH)} de calendário, em curso`}</span>
          <span>média ponderada pelos leads, sem período em curso</span>
          {hasFuture ? <span>vazio: período que ainda não começou</span> : null}
          {hasZero ? <span>poço com contorno cheio: zero medido</span> : null}
          {missing > 0 ? (
            <span>{`${formatUnavailable()}: contorno pontilhado, ${formatInt(missing)} célula fora das médias`}</span>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}
