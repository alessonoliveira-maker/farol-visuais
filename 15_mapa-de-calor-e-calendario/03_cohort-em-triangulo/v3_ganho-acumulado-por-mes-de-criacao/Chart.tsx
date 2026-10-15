import { Filter, Unplug } from 'lucide-react';

import { formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CURRENT_MONTH, data as defaultData, ELAPSED_MONTHS, MILESTONES, type CohortRow } from './data';

/**
 * Cohort de conversão em triângulo na densidade em que ele ainda lê: dezoito meses de criação por treze
 * meses decorridos, em linhas de 20 px e sem rolagem. O que a densidade obriga a resolver é onde a
 * informação mora, porque a cor não aguenta treze colunas.
 *
 * O NÚMERO FICA EM TODA CÉLULA, e é ele que autoriza a rampa de cinco degraus pela isenção da TOK-8. A
 * conta que decidiu a largura: a taxa sai com cinco caracteres, que em Space Grotesk de 11 px somam
 * 27,54 px de tinta, e a coluna de 40,8 px comporta isso com o respiro de 8 px e o contorno de 2 px.
 *
 * OS MARCOS NÃO SÃO BORDA. A especificação do catálogo pedia borda de coluna em M3, M6 e M12, e a ESP-5
 * proíbe borda interna e divisória entre itens; o contrato vence, então o marco vive no peso e na cor do
 * cabeçalho da coluna e na linha da legenda que os nomeia.
 *
 * A COLUNA DE TAMANHO NÃO TEM TRILHO. Nenhum neutro do Farol alcança 3:1 contra o cartão (surface-overlay
 * 1,10 e 1,00, surface-sunken 1,15, line-subtle 1,25, line-strong 1,79), então um trilho seria estrutura
 * invisível, sobretudo no tema claro. A barra vive sozinha em `--chart-1`, que mede 9,50 e 6,00, e a
 * escala dela é o número escrito ao lado, que é a isenção da WCAG 1.4.11.
 *
 * TRÊS AUSÊNCIAS DIFERENTES, TRÊS DESENHOS (DAD-2): célula sem nada é período que ainda não começou; poço
 * com contorno cheio e o zero escrito é zero medido (EST-3); contorno pontilhado com o ícone é período
 * que existe e não foi medido (EST-2).
 */
export interface CohortWinTriangleProps {
  readonly data?: readonly CohortRow[];
  readonly height?: number;
  readonly className?: string;
}

/** Cinco degraus, pulando `--seq-4` e `--seq-5`, os dois que não aceitam texto nenhum nos dois temas. */
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
const SIZE_BAR_HEIGHT = 6;
/** A idade em que a frase acessível compara os cohorts, e o marco do meio da leitura. */
const REFERENCE_ELAPSED = 6;

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

/** Período em curso: o mês de criação mais os meses decorridos cai no mês corrente do recorte. */
function isOpenPeriod(month: string, elapsed: number, current: string): boolean {
  return monthIndex(month) + elapsed === monthIndex(current);
}

/**
 * Estado de uma célula, e a ordem dos testes é a leitura: fora do array o período não existe; `null`
 * existe e não foi medido; e só com base maior que zero a divisão vira taxa, porque sem base a resposta
 * é ausência e nunca zero (EST-1b).
 */
function cellState(row: CohortRow, elapsed: number, current: string): CellState {
  if (elapsed >= row.won.length) return { kind: 'futuro' };
  const won = row.won[elapsed];
  if (won === undefined || won === null || row.size <= 0) return { kind: 'ausente' };
  return { kind: 'valor', rate: won / row.size, open: isOpenPeriod(row.month, elapsed, current) };
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
 * Taxa ponderada pelas oportunidades criadas numa coluna, só sobre período fechado: juntar o mês em curso
 * puxaria a média para baixo por causa dos dias que ainda não aconteceram. Devolve `null` quando nenhuma
 * linha tem aquela idade fechada.
 */
function weightedRate(
  lines: readonly CohortLine[],
  elapsed: number,
): { readonly rate: number; readonly created: number; readonly cohorts: number } | null {
  let won = 0;
  let created = 0;
  let cohorts = 0;
  for (const line of lines) {
    const state = line.cells[elapsed];
    if (state === undefined || state.kind !== 'valor' || state.open) continue;
    won += state.rate * line.row.size;
    created += line.row.size;
    cohorts += 1;
  }
  return created === 0 ? null : { rate: won / created, created, cohorts };
}

/** Piso de cohorts para o rodapé: com um só, a média repetiria a própria linha. */
const MIN_COMMON = 2;

/**
 * População fixa do rodapé: os cohorts que já fecharam, com medida, todas as colunas até a mais funda em
 * que pelo menos `MIN_COMMON` deles chegam. Toda coluna é a média dos mesmos cohorts, então a média só
 * cai de uma coluna para outra por piora real, nunca por troca de gente (EST-1b). Devolve `null` quando
 * nenhuma idade tem cohorts fechados em número suficiente.
 */
function commonPopulation(
  lines: readonly CohortLine[],
): { readonly lines: readonly CohortLine[]; readonly depth: number } | null {
  for (let depth = ELAPSED_MONTHS - 1; depth >= 0; depth -= 1) {
    const members = lines.filter((line) =>
      line.cells.slice(0, depth + 1).every((state) => state.kind === 'valor' && !state.open) &&
      line.cells.length > depth,
    );
    if (members.length >= MIN_COMMON) return { lines: members, depth };
  }
  return null;
}

/** O cohort de maior taxa numa idade fixa, só entre os períodos fechados. */
function bestAt(
  lines: readonly CohortLine[],
  elapsed: number,
): { readonly month: string; readonly rate: number } | null {
  let best: { readonly month: string; readonly rate: number } | null = null;
  for (const line of lines) {
    const state = line.cells[elapsed];
    if (state === undefined || state.kind !== 'valor' || state.open) continue;
    if (best === null || state.rate > best.rate) best = { month: line.row.month, rate: state.rate };
  }
  return best;
}

function paletteAt(level: number): { readonly fill: string; readonly text: string } {
  return { fill: SEQ_TOKENS[level] ?? SEQ_TOKENS[0], text: SEQ_TEXT[level] ?? SEQ_TEXT[0] };
}

export default function CohortWinTriangle({ data = defaultData, height, className }: CohortWinTriangleProps) {
  const columns = Array.from({ length: ELAPSED_MONTHS }, (_, index) => index);
  const lines: readonly CohortLine[] = data.map((row) => ({
    row,
    cells: columns.map((elapsed) => cellState(row, elapsed, CURRENT_MONTH)),
  }));

  const allCells = lines.flatMap((line) => line.cells);
  const rates = allCells.flatMap((state) => (state.kind === 'valor' && state.rate > 0 ? [state.rate] : []));
  const span = extent(rates);
  const missing = allCells.filter((state) => state.kind === 'ausente').length;
  const hasZero = allCells.some((state) => state.kind === 'valor' && state.rate === 0);
  const hasFuture = allCells.some((state) => state.kind === 'futuro');
  const sizeSpan = extent(data.map((row) => row.size));

  const population = commonPopulation(lines);
  const reference = bestAt(lines, REFERENCE_ELAPSED);
  const referenceAverage = weightedRate(lines, REFERENCE_ELAPSED);
  const footerDepth = population === null ? null : population.depth;
  const footerCount = population === null ? 0 : population.lines.length;
  const footerLabel = footerDepth === null ? null : `M${formatInt(footerDepth)}`;
  const referenceLabel = `M${formatInt(REFERENCE_ELAPSED)}`;
  const firstLabel = `M${formatInt(0)}`;
  const lastLabel = `M${formatInt(ELAPSED_MONTHS - 1)}`;
  const milestoneLabel = MILESTONES.map((elapsed) => `M${formatInt(elapsed)}`).join(', ');

  /** Fronteiras das faixas, escritas na legenda porque a cor sozinha não ordena (TOK-8). */
  const bounds =
    span === null
      ? null
      : Array.from({ length: BUCKETS + 1 }, (_, index) => span.min + ((span.max - span.min) * index) / BUCKETS);

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
        <span>Nenhum mês de criação neste recorte: sem marco de nascimento não existe cohort.</span>
      </div>
    );
  }

  const summary =
    reference === null || referenceAverage === null
      ? `Triângulo de cohort com a taxa de ganho acumulada de ${formatInt(data.length)} meses de criação, de ${firstLabel} a ${lastLabel}, ainda sem nenhum cohort fechado em ${referenceLabel} para comparar.`
      : `Cohort em triângulo, ganho acumulado, ${formatInt(data.length)} meses de criação. ` +
        `Em ${referenceLabel}, o melhor é ${formatMonthShort(reference.month)}, ${formatPercent(reference.rate, 1)}, contra ${formatPercent(referenceAverage.rate, 1)} de média de ${formatInt(referenceAverage.cohorts)} cohorts. ` +
        (footerLabel === null
          ? 'Rodapé em branco: nenhuma idade com dois cohorts fechados.'
          : `Rodapé: média dos mesmos ${formatInt(footerCount)} cohorts, até ${footerLabel}.`);

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="shrink-0 text-xs leading-4 text-text-secondary">
        {reference === null || referenceAverage === null
          ? `Nenhum cohort chegou a ${referenceLabel} fechado, então a comparação na mesma idade ainda não existe.`
          : `Na idade de ${referenceLabel} o melhor cohort é ${formatMonthShort(reference.month)}, com ${formatPercent(reference.rate, 1)} de ganho acumulado, contra a média ponderada de ${formatPercent(referenceAverage.rate, 1)} dos ${formatInt(referenceAverage.cohorts)} cohorts já fechados nessa idade.`}
      </p>

      <table
        className="w-full flex-1 table-fixed text-[11px] leading-4"
        style={{ borderCollapse: 'separate', borderSpacing: CELL_GAP }}
      >
        <thead>
          <tr>
            <th className="w-14 text-left align-bottom font-medium text-text-muted" scope="col">
              Criação
            </th>
            <th className="w-24 pr-2 text-right align-bottom font-medium text-text-muted" scope="col">
              Criadas
            </th>
            {columns.map((elapsed) => (
              <th
                className={cn(
                  'text-center align-bottom font-display tabular-nums',
                  MILESTONES.includes(elapsed) ? 'font-semibold text-text-primary' : 'font-medium text-text-muted',
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
          {lines.map((line) => (
            <tr key={line.row.month}>
              <th className="text-left align-middle font-medium text-text-secondary" scope="row">
                {formatMonthShort(line.row.month)}
              </th>
              <td className="pr-2 align-middle">
                <div className="flex items-center justify-end gap-1.5">
                  {sizeSpan === null || sizeSpan.max <= 0 ? null : (
                    /* Slot de 48 px sem preenchimento: a barra nasce na esquerda dele e a régua é o número ao lado. */
                    <span aria-hidden className="block w-12 shrink-0">
                      <span
                        className="block rounded-full bg-chart-1"
                        style={{
                          height: SIZE_BAR_HEIGHT,
                          width: `${String((line.row.size / sizeSpan.max) * 100)}%`,
                        }}
                      />
                    </span>
                  )}
                  <span className="w-7 shrink-0 text-right font-display tabular-nums text-text-secondary">
                    {formatInt(line.row.size)}
                  </span>
                </div>
              </td>
              {columns.map((elapsed) => {
                const state = line.cells[elapsed];
                if (state === undefined || state.kind === 'futuro') {
                  return <td className="align-middle" key={elapsed} />;
                }
                if (state.kind === 'ausente') {
                  return (
                    <td
                      className="rounded-sm border border-dotted px-1 align-middle"
                      key={elapsed}
                      style={{ borderColor: 'var(--text-muted)' }}
                    >
                      <span className="flex items-center justify-center text-text-muted">
                        <Unplug aria-hidden className="size-3" />
                      </span>
                    </td>
                  );
                }
                const zero = state.rate === 0;
                const palette = paletteAt(bucketOf(state.rate));
                /**
                 * O contorno de 1 px existe em toda célula para a caixa medir igual em qualquer estado, e
                 * no estado comum ele é a cor do cartão: é a separação que a COR-5 pede entre marcas que
                 * não contrastam entre si.
                 *
                 * O tracejado do período em curso sai na MESMA tinta do número, e não em `--text-primary`
                 * fixo: o contorno é pintado sobre o preenchimento da própria célula, e `--text-primary`
                 * sobre `--seq-7` mede 1,44:1, abaixo dos 3:1 que a ACE-6 pede de traço que carrega
                 * informação. Na tinta do número o pior caso medido é 5,45:1.
                 */
                return (
                  <td
                    className={cn(
                      'rounded-sm border px-1 text-center align-middle font-display font-medium tabular-nums',
                      state.open ? 'border-dashed' : 'border-solid',
                    )}
                    key={elapsed}
                    style={{
                      backgroundColor: zero ? 'var(--surface-sunken)' : palette.fill,
                      borderColor: zero
                        ? 'var(--text-muted)'
                        : state.open
                          ? palette.text
                          : 'var(--surface-raised)',
                      color: zero ? 'var(--text-primary)' : palette.text,
                    }}
                  >
                    {formatPercent(state.rate, 1)}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <th className="text-left align-middle font-medium text-text-muted" scope="row">
              Média
            </th>
            <td className="pr-2 text-right align-middle text-text-muted">
              {population === null ? (
                'sem cohort fechado'
              ) : (
                <>
                  {'mesmos '}
                  <span className="font-display tabular-nums">{formatInt(footerCount)}</span>
                  {' cohorts'}
                </>
              )}
            </td>
            {columns.map((elapsed) => {
              const average =
                population === null || elapsed > population.depth ? null : weightedRate(population.lines, elapsed);
              return (
                <td
                  className={cn(
                    'px-1 text-center align-middle font-display tabular-nums text-text-primary',
                    MILESTONES.includes(elapsed) ? 'font-semibold' : 'font-medium',
                  )}
                  key={elapsed}
                >
                  {average === null ? '' : formatPercent(average.rate, 1)}
                </td>
              );
            })}
          </tr>
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
          <span>taxa de ganho acumulada; a ordem fina está no número, não no degrau</span>
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{`${firstLabel} é a criação e ${lastLabel} são doze meses depois`}</span>
          <span>{`marcos: ${milestoneLabel}`}</span>
          <span>barra e número: oportunidades criadas</span>
          <span>{`tracejado: ${formatMonthShort(CURRENT_MONTH)} em curso`}</span>
          <span>
            {footerLabel === null
              ? 'média ponderada: nenhuma idade com dois cohorts fechados'
              : `média ponderada, só dos cohorts que já fecharam ${footerLabel}`}
          </span>
          {hasFuture ? <span>vazio: ainda não começou</span> : null}
          {hasZero ? <span>poço com contorno: zero medido</span> : null}
          {missing > 0 ? (
            <span>{`${formatUnavailable()}: contorno pontilhado, ${formatInt(missing)} célula fora das médias`}</span>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}
