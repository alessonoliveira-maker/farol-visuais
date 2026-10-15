import { useState } from 'react';
import { Filter, TriangleAlert, Unplug } from 'lucide-react';

import { formatInt, formatMonthShort, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CURRENT_MONTH, data as defaultData, ELAPSED_MONTHS, MIN_SAMPLE, type CohortRow } from './data';

/**
 * Cohort de conversão em triângulo escrito para a leitura difícil: o mês em curso que parece queda, a base
 * pequena que parece campeã, o período que não foi medido e o cohort que não teve entradas. O alternador
 * troca a unidade da célula entre taxa e contagem, porque é a contagem que desmonta a taxa enganosa.
 *
 * QUATRO SITUAÇÕES, QUATRO DESENHOS, e nenhuma delas se distingue por cor sozinha (DAD-2, ACE-2):
 *
 * 1. Período que ainda não começou: célula sem preenchimento, sem contorno e sem número. A forma do
 *    triângulo é a informação, e ela não precisa de tinta.
 * 2. Período em curso: preenchimento da rampa e contorno TRACEJADO na mesma tinta do número, com o número.
 * 3. Período sem medição: nenhum preenchimento, contorno PONTILHADO e o ícone `Unplug`, sem número, com o
 *    rótulo de `formatUnavailable()` escrito na legenda, porque a célula de 68 px não o comporta (EST-2).
 * 4. Zero medido: poço de `--surface-sunken`, contorno CHEIO e o zero escrito (EST-3). Fora da rampa, que
 *    é o que a DAD-2 pede para não confundir zero com ausência.
 *
 * A BASE RALA NÃO SE ESMAECE. A especificação do catálogo pedia a marca esmaecida no cohort de doze leads,
 * e a ACE-5 fecha esse caminho com medição: `--seq-1` a `--seq-4` não alcançam 3:1 nem opacos, então
 * nenhuma opacidade abaixo de 1 passa nos dois temas, e baixar a opacidade só afunda um número que já está
 * abaixo do piso. O contrato vence, e a saída é mais honesta do que o esmaecido: a linha de base rala PERDE
 * a intensidade em vez de ganhar transparência, porque intensidade é afirmação de ordem e doze leads não a
 * sustentam. O aviso vive no contorno cheio em `--warning`, no ícone `TriangleAlert` e no `n` escrito ao
 * lado, três canais além da cor.
 *
 * SEM BASE NÃO HÁ LINHA. O cohort sem entradas não recebe sete células de zero: recebe uma célula única com
 * o rótulo de ausência, porque uma taxa sem denominador não é zero e não é pequena, é inexistente.
 */
export interface CohortPartialTriangleProps {
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
/** A idade em que a linha de leitura confronta a taxa da base rala com a do maior cohort. */
const REFERENCE_ELAPSED = 6;

type Unit = 'taxa' | 'contagem';

/**
 * `as const` para o alternador virar tupla: sem isso `UNITS[0]` é `T | undefined` sob
 * `noUncheckedIndexedAccess` e o recuo do `find` não teria como ser um valor concreto.
 */
const UNITS = [
  { id: 'taxa', label: 'taxa', caption: 'taxa acumulada de agenda' },
  { id: 'contagem', label: 'contagem', caption: 'agendas acumuladas, em contagem' },
] as const satisfies readonly { readonly id: Unit; readonly label: string; readonly caption: string }[];

type CellState =
  | { readonly kind: 'futuro' }
  | { readonly kind: 'ausente' }
  | { readonly kind: 'valor'; readonly booked: number; readonly rate: number; readonly open: boolean };

interface CohortLine {
  readonly row: CohortRow;
  readonly cells: readonly CellState[];
  /** Base existe e está abaixo do piso: a taxa é medida e não sustenta intensidade de cor. */
  readonly thin: boolean;
  /** Base inexistente: não há taxa, não há zero, não há linha de células. */
  readonly baseless: boolean;
}

function monthIndex(month: string): number {
  return Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1;
}

/** Período em curso: o mês de entrada mais os meses decorridos cai no mês corrente do recorte. */
function isOpenPeriod(month: string, elapsed: number, current: string): boolean {
  return monthIndex(month) + elapsed === monthIndex(current);
}

/**
 * Estado de uma célula, e a ordem dos testes é a leitura: fora do array o período não existe; `null` existe
 * e não foi medido; e só com base maior que zero a divisão vira taxa, porque sem base a resposta é ausência
 * e nunca zero (EST-1b).
 */
function cellState(row: CohortRow, elapsed: number, current: string): CellState {
  if (elapsed >= row.booked.length) return { kind: 'futuro' };
  const booked = row.booked[elapsed];
  if (booked === undefined || booked === null || row.size <= 0) return { kind: 'ausente' };
  return {
    kind: 'valor',
    booked,
    rate: booked / row.size,
    open: isOpenPeriod(row.month, elapsed, current),
  };
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
 * Taxa ponderada pelos leads numa coluna, só sobre período fechado e só onde existe base. O cohort de base
 * rala entra, porque o peso dele é o próprio tamanho e doze leads pesam doze; o cohort sem base não entra,
 * porque não há o que pesar. Devolve `null` quando nenhuma linha tem aquela idade fechada.
 */
function weightedRate(
  lines: readonly CohortLine[],
  elapsed: number,
): { readonly rate: number; readonly booked: number; readonly leads: number } | null {
  let booked = 0;
  let leads = 0;
  for (const line of lines) {
    const state = line.cells[elapsed];
    if (state === undefined || state.kind !== 'valor' || state.open) continue;
    booked += state.booked;
    leads += line.row.size;
  }
  return leads === 0 ? null : { rate: booked / leads, booked, leads };
}

function paletteAt(level: number): { readonly fill: string; readonly text: string } {
  return { fill: SEQ_TOKENS[level] ?? SEQ_TOKENS[0], text: SEQ_TEXT[level] ?? SEQ_TEXT[0] };
}

/** Piso de cohorts para o rodapé: com um só, a média repetiria a própria linha. */
const MIN_COMMON = 2;

/**
 * População fixa do rodapé: os cohorts com base que já fecharam, com medida, todas as colunas até a mais
 * funda em que pelo menos `MIN_COMMON` deles chegam. Toda coluna é a média (ou o total) dos mesmos
 * cohorts, então o valor só cai de uma coluna para outra por piora real, nunca por troca de gente
 * (EST-1b). Cohort com célula sem medição fica de fora da população inteira. Devolve `null` quando
 * nenhuma idade tem cohorts fechados em número suficiente.
 */
function commonPopulation(
  lines: readonly CohortLine[],
): { readonly lines: readonly CohortLine[]; readonly depth: number } | null {
  for (let depth = ELAPSED_MONTHS - 1; depth >= 0; depth -= 1) {
    const members = lines.filter(
      (line) =>
        !line.baseless &&
        line.cells.length > depth &&
        line.cells.slice(0, depth + 1).every((state) => state.kind === 'valor' && !state.open),
    );
    if (members.length >= MIN_COMMON) return { lines: members, depth };
  }
  return null;
}

interface Confront {
  readonly thinMonth: string;
  readonly thinBooked: number;
  readonly thinSize: number;
  readonly fullMonth: string;
  readonly fullBooked: number;
  readonly fullSize: number;
}

/**
 * O confronto que desmonta a taxa enganosa: na mesma idade, a célula fechada da primeira linha de base rala
 * contra a do maior cohort de base cheia. Devolve `null` quando um dos dois lados não existe fechado ali,
 * porque meia comparação não é comparação.
 */
function confrontAt(lines: readonly CohortLine[], elapsed: number): Confront | null {
  let thin: { readonly month: string; readonly booked: number; readonly size: number } | null = null;
  let full: { readonly month: string; readonly booked: number; readonly size: number } | null = null;
  for (const line of lines) {
    const state = line.cells[elapsed];
    if (line.baseless || state === undefined || state.kind !== 'valor' || state.open) continue;
    const entry = { month: line.row.month, booked: state.booked, size: line.row.size };
    if (line.thin) {
      if (thin === null) thin = entry;
      continue;
    }
    if (full === null || entry.size > full.size) full = entry;
  }
  return thin === null || full === null
    ? null
    : {
        thinMonth: thin.month,
        thinBooked: thin.booked,
        thinSize: thin.size,
        fullMonth: full.month,
        fullBooked: full.booked,
        fullSize: full.size,
      };
}

export default function CohortPartialTriangle({
  data = defaultData,
  height,
  className,
}: CohortPartialTriangleProps) {
  const [unit, setUnit] = useState<Unit>('taxa');
  const columns = Array.from({ length: ELAPSED_MONTHS }, (_, index) => index);
  const lines: readonly CohortLine[] = data.map((row) => ({
    row,
    cells: columns.map((elapsed) => cellState(row, elapsed, CURRENT_MONTH)),
    thin: row.size > 0 && row.size < MIN_SAMPLE,
    baseless: row.size <= 0,
  }));

  const allCells = lines.flatMap((line) => line.cells);
  const missing = allCells.filter((state) => state.kind === 'ausente').length;
  const hasZero = allCells.some((state) => state.kind === 'valor' && state.booked === 0);
  const hasFuture = allCells.some((state) => state.kind === 'futuro');
  const thinLines = lines.filter((line) => line.thin);
  const baselessLines = lines.filter((line) => line.baseless);

  /** O domínio da cor ignora a linha de base rala, que não recebe intensidade, e o valor zero, que sai do poço. */
  const painted = lines
    .filter((line) => !line.thin && !line.baseless)
    .flatMap((line) => line.cells)
    .flatMap((state) =>
      state.kind === 'valor' && state.booked > 0 ? [unit === 'taxa' ? state.rate : state.booked] : [],
    );
  const span = extent(painted);

  const firstLabel = `M${formatInt(0)}`;
  const lastLabel = `M${formatInt(ELAPSED_MONTHS - 1)}`;
  const referenceLabel = `M${formatInt(REFERENCE_ELAPSED)}`;
  const activeUnit = UNITS.find((option) => option.id === unit) ?? UNITS[0];

  /** Fronteiras das faixas, escritas na legenda porque a cor sozinha não ordena (TOK-8). */
  const bounds =
    span === null
      ? null
      : Array.from({ length: BUCKETS + 1 }, (_, index) => span.min + ((span.max - span.min) * index) / BUCKETS);

  function bucketOf(value: number): number {
    if (span === null || span.max === span.min) return 0;
    const step = Math.floor(((value - span.min) / (span.max - span.min)) * BUCKETS);
    return Math.min(BUCKETS - 1, Math.max(0, step));
  }

  /** O par que a linha de leitura confronta: a base rala contra o maior cohort de base cheia, na mesma idade. */
  const confront = confrontAt(lines, REFERENCE_ELAPSED);
  const closedRates = lines.flatMap((line) => {
    const state = line.cells[REFERENCE_ELAPSED];
    return !line.baseless && state !== undefined && state.kind === 'valor' && !state.open ? [state.rate] : [];
  });
  const columnMax = extent(closedRates);
  const thinRate = confront === null ? null : confront.thinBooked / confront.thinSize;
  const fullRate = confront === null ? null : confront.fullBooked / confront.fullSize;
  const thinHigher = thinRate !== null && fullRate !== null && thinRate > fullRate;
  const thinLeads = columnMax !== null && thinRate !== null && thinRate >= columnMax.max;
  const population = commonPopulation(lines);
  const footerCount = population === null ? 0 : population.lines.length;
  const footerLabel = population === null ? null : `M${formatInt(population.depth)}`;
  const thresholdLabel = `${formatInt(MIN_SAMPLE)} leads`;

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

  const footerSentence =
    footerLabel === null
      ? 'O rodapé fica em branco: nenhuma idade tem dois cohorts fechados.'
      : `Rodapé: ${unit === 'taxa' ? 'média' : 'soma'} dos mesmos ${formatInt(footerCount)} cohorts, até ${footerLabel}.`;

  const summary =
    confront === null
      ? `Triângulo de cohort de ${formatInt(data.length)} meses de entrada, de ${firstLabel} a ${lastLabel}, sem cohort de base rala a confrontar nesta idade. ${footerSentence}`
      : `Triângulo de cohort de ${formatInt(data.length)} meses de entrada. ` +
        `Em ${referenceLabel}, ${formatMonthShort(confront.thinMonth)} ${thinLeads ? 'lidera' : 'marca'} com ${formatRateWithVolume(confront.thinBooked, confront.thinSize)}, contra ${formatRateWithVolume(confront.fullBooked, confront.fullSize)} de ${formatMonthShort(confront.fullMonth)}, e fica sem intensidade por ter menos de ${thresholdLabel}. ${footerSentence}`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="shrink-0 text-xs leading-4 text-text-secondary">
        {confront === null
          ? `Nenhum cohort de base rala chegou a ${referenceLabel} fechado, então não há confronto de bases a mostrar.`
          : `Em ${referenceLabel}, ${formatMonthShort(confront.thinMonth)} marca ${formatRateWithVolume(confront.thinBooked, confront.thinSize)} e ${formatMonthShort(confront.fullMonth)} marca ${formatRateWithVolume(confront.fullBooked, confront.fullSize)}: a taxa da base menor é ${thinHigher ? 'maior' : 'menor'}, e a célula fica sem intensidade por ter menos de ${thresholdLabel}, qualquer que seja a taxa.`}
      </p>
      <p aria-hidden className="shrink-0 text-[11px] leading-4 text-text-muted">
        {`${formatInt(baselessLines.length)} cohort sem entradas e ${formatInt(missing)} período sem medição`}
      </p>

      <div className="flex shrink-0 items-center gap-2 text-[11px] leading-4">
        <span className="text-text-muted">Célula em</span>
        {UNITS.map((option) => (
          <button
            aria-pressed={option.id === unit}
            className={cn(
              'rounded-sm px-2 py-0.5 leading-4',
              option.id === unit ? 'bg-chart-1 font-semibold' : 'font-medium text-text-secondary',
            )}
            key={option.id}
            onClick={() => {
              setUnit(option.id);
            }}
            style={option.id === unit ? { color: 'var(--accent-cyan-contrast)' } : undefined}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <table
        className="w-full flex-1 table-fixed text-[11px] leading-4"
        style={{ borderCollapse: 'separate', borderSpacing: CELL_GAP }}
      >
        <thead>
          <tr>
            <th className="w-14 text-left align-bottom font-medium text-text-muted" scope="col">
              Entrada
            </th>
            <th className="w-20 pr-2 text-right align-bottom font-medium text-text-muted" scope="col">
              Leads
            </th>
            {columns.map((elapsed) => (
              <th
                className={cn(
                  'text-center align-bottom font-display tabular-nums',
                  elapsed === REFERENCE_ELAPSED ? 'font-semibold text-text-primary' : 'font-medium text-text-muted',
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
              <th
                className={cn(
                  'text-left align-middle font-medium',
                  line.thin || line.baseless ? 'text-warning' : 'text-text-secondary',
                )}
                scope="row"
              >
                {formatMonthShort(line.row.month)}
              </th>
              <td className="pr-2 align-middle">
                <div className="flex items-center justify-end gap-1.5">
                  {line.thin || line.baseless ? (
                    <TriangleAlert aria-hidden className="size-3 shrink-0 text-warning" />
                  ) : null}
                  <span
                    className={cn(
                      'w-7 shrink-0 text-right font-display tabular-nums',
                      line.thin || line.baseless ? 'text-warning' : 'text-text-secondary',
                    )}
                  >
                    {formatInt(line.row.size)}
                  </span>
                </div>
              </td>
              {line.baseless ? (
                <td className="px-1 align-middle text-text-muted" colSpan={columns.length}>
                  <span className="flex items-center gap-1.5">
                    <Unplug aria-hidden className="size-3 shrink-0" />
                    <span>{`${formatUnavailable()}: sem leads no mês, a taxa não tem base`}</span>
                  </span>
                </td>
              ) : (
                columns.map((elapsed) => {
                  const state = line.cells[elapsed];
                  if (state === undefined || state.kind === 'futuro') {
                    return <td className="align-middle" key={elapsed} />;
                  }
                  if (state.kind === 'ausente') {
                    return (
                      <td
                        className="rounded-sm border border-dotted px-1 py-1 align-middle"
                        key={elapsed}
                        style={{ borderColor: 'var(--text-muted)' }}
                      >
                        <span className="flex items-center justify-center text-text-muted">
                          <Unplug aria-hidden className="size-3" />
                        </span>
                      </td>
                    );
                  }
                  const zero = state.booked === 0;
                  const palette = paletteAt(bucketOf(unit === 'taxa' ? state.rate : state.booked));
                  /**
                   * A ordem de decisão do preenchimento: zero vai para o poço fora da rampa; base rala fica
                   * sem intensidade nenhuma; o resto recebe o degrau. O contorno carrega o outro eixo, que é
                   * a confiança na base, e no estado comum ele é a cor do cartão, que é a separação da COR-5.
                   */
                  const fill = zero ? 'var(--surface-sunken)' : line.thin ? undefined : palette.fill;
                  /**
                   * O tracejado do período em curso sai na MESMA tinta do número quando a célula é pintada,
                   * e não em `--text-primary` fixo: o contorno é pintado sobre o preenchimento da própria
                   * célula, e `--text-primary` sobre `--seq-7` mede 1,44:1, abaixo dos 3:1 que a ACE-6 pede
                   * de traço que carrega informação. Na tinta do número o pior caso medido é 5,45:1.
                   */
                  const border = line.thin
                    ? 'var(--warning)'
                    : zero
                      ? 'var(--text-muted)'
                      : state.open
                        ? palette.text
                        : 'var(--surface-raised)';
                  const color = zero || line.thin ? 'var(--text-primary)' : palette.text;
                  return (
                    <td
                      className={cn(
                        'rounded-sm border px-1 py-1 text-center align-middle font-display font-medium tabular-nums',
                        state.open ? 'border-dashed' : 'border-solid',
                      )}
                      key={elapsed}
                      style={{ backgroundColor: fill, borderColor: border, color }}
                    >
                      {unit === 'taxa' ? formatPercent(state.rate, 1) : formatInt(state.booked)}
                    </td>
                  );
                })
              )}
            </tr>
          ))}
          <tr>
            <th className="text-left align-middle font-medium text-text-muted" scope="row">
              {unit === 'taxa' ? 'Média' : 'Total'}
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
                    elapsed === REFERENCE_ELAPSED ? 'font-semibold' : 'font-medium',
                  )}
                  key={elapsed}
                >
                  {average === null ? '' : unit === 'taxa' ? formatPercent(average.rate, 1) : formatInt(average.booked)}
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
                <span className="font-display tabular-nums text-text-secondary">
                  {unit === 'taxa' ? formatPercent(bound, 0) : formatInt(Math.round(bound))}
                </span>
                {index < BUCKETS ? (
                  <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: paletteAt(index).fill }} />
                ) : null}
              </span>
            ))
          )}
          <span>{`${activeUnit.caption}; a ordem fina está no número, não no degrau`}</span>
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{`${firstLabel} é a entrada e ${lastLabel} são seis meses depois`}</span>
          <span>{`tracejado: ${formatMonthShort(CURRENT_MONTH)} em curso`}</span>
          {hasFuture ? <span>vazio: ainda não começou</span> : null}
          {hasZero ? <span>poço com contorno: zero medido</span> : null}
          {missing > 0 ? (
            <span>{`${formatUnavailable()}: contorno pontilhado, ${formatInt(missing)} célula fora das médias`}</span>
          ) : null}
          {footerLabel === null ? (
            <span>rodapé em branco: nenhuma idade com dois cohorts fechados</span>
          ) : (
            <span>{`${unit === 'taxa' ? 'média ponderada' : 'total'} só dos cohorts que já fecharam ${footerLabel}, sem período em curso nem célula sem medição`}</span>
          )}
          {thinLines.length > 0 ? (
            <span>{`abaixo de ${formatInt(MIN_SAMPLE)} leads a célula fica sem intensidade`}</span>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}
