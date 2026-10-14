import { ArrowDown, ArrowRight, ArrowUp, Filter, Minus, Unplug } from 'lucide-react';
import { useState } from 'react';

import { formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Outlook, type RatedAccount } from './data';

/**
 * Nine-box de calibração de carteira: potencial nas linhas, relacionamento nas colunas, as duas
 * notas são avaliação do time e por isso os dois eixos levam contorno tracejado. Cada célula escreve
 * a contagem e o nome da ação; a célula vazia continua na grade com 0 contas, a lotada mostra seis
 * chips por potencial e o resto como +n com o botão que abre a lista. Conta sem nota fica numa faixa
 * fora da grade. A altura da linha é regra de conteúdo (cabe os chips), não mede nenhum valor.
 */
export interface RatedAccountNineBoxProps {
  readonly data?: readonly RatedAccount[];
  /** Chamado ao abrir a lista de uma célula; o Farol liga isso ao painel de contas. */
  readonly onOpenList?: (cellId: string) => void;
  readonly height?: number;
  readonly className?: string;
}

const LABEL_W = 72;
const MAX_CHIPS = 6;
const CHIP_H = 18;
const ROW_H = 60;
/** Linha da célula lotada: cabeçalho de 26 px, seis chips e a linha do +n com o botão, mais o respiro. */
const CROWDED_ROW_H = 8 + 26 + 4 + MAX_CHIPS * CHIP_H + 4 + 24;
/** Nota de 0 a 10: abaixo de 4 é baixo, de 4 a 6,9 é médio, a partir de 7 é alto. */
const MID_FROM = 4;
const HIGH_FROM = 7;

const ROWS = ['Alto', 'Médio', 'Baixo'] as const;
const COLUMNS = ['Fraco', 'Moderado', 'Forte'] as const;
/** Ação de cada célula: linha de potencial (alto primeiro) por coluna de relacionamento (fraco primeiro). */
const ACTIONS: readonly (readonly string[])[] = [
  ['Aproximar', 'Desenvolver', 'Investir'],
  ['Reavaliar', 'Manter', 'Aprofundar'],
  ['Reduzir', 'Atender no padrão', 'Colher'],
];
const OUTLOOK_TEXT: Record<Outlook, string> = { up: 'sobe', flat: 'estável', down: 'cai' };
const OUTLOOK_ICON = { up: ArrowUp, flat: Minus, down: ArrowDown } as const;

/** Faixa 0 (alto), 1 (médio) ou 2 (baixo): a linha de cima é a de mais potencial. */
function bandOf(score: number): number {
  return score >= HIGH_FROM ? 0 : score >= MID_FROM ? 1 : 2;
}

/** O eixo é julgamento do time: o contorno tracejado e a palavra avaliação marcam isso. */
function AxisTitle({ children, icon }: { readonly children: string; readonly icon: 'up' | 'right' }) {
  const Icon = icon === 'up' ? ArrowUp : ArrowRight;
  return (
    <span className="flex w-fit items-center gap-1 border border-dashed border-line-strong px-1.5 py-0.5 text-[11px] font-medium text-text-secondary">
      {children}
      <Icon aria-hidden className="size-3 shrink-0" />
    </span>
  );
}

export default function RatedAccountNineBox({ data = defaultData, onOpenList, height, className }: RatedAccountNineBoxProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma conta neste recorte: o nine-box não tem o que calibrar.</span>
      </div>
    );
  }

  const unrated = data.filter((account) => account.potential === null || account.relationship === null);
  const cells = ROWS.flatMap((_, row) =>
    COLUMNS.map((__, column) => {
      const accounts = data
        .filter(
          (account) =>
            account.potential !== null &&
            account.relationship !== null &&
            bandOf(account.potential) === row &&
            2 - bandOf(account.relationship) === column,
        )
        .sort((a, b) => (b.potential ?? 0) - (a.potential ?? 0) || a.id.localeCompare(b.id));
      return { id: `${String(row)}-${String(column)}`, row, column, accounts, action: ACTIONS[row]?.[column] ?? '' };
    }),
  );
  const crowded = cells.reduce<(typeof cells)[number] | undefined>(
    (best, cell) => (best === undefined || cell.accounts.length > best.accounts.length ? cell : best),
    undefined,
  );
  const emptyCount = cells.filter((cell) => cell.accounts.length === 0).length;
  const rowHeights = ROWS.map((_, row) => (crowded !== undefined && row === crowded.row ? CROWDED_ROW_H : ROW_H));

  const summary =
    `Nine-box de ${formatInt(data.length)} contas por potencial e relacionamento, avaliação do time. ` +
    `Chips: nota de potencial de zero a dez e posição prevista (sobe, estável, cai). ` +
    `A célula ${crowded?.action.toLowerCase() ?? ''} reúne ${formatInt(crowded?.accounts.length ?? 0)} contas, ` +
    `${formatInt(emptyCount)} ${emptyCount === 1 ? 'célula está vazia' : 'células estão vazias'} e ${formatInt(unrated.length)} contas estão sem avaliação.`;

  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <div
        className="grid min-h-0 flex-1 content-start"
        style={{
          gridTemplateColumns: `${String(LABEL_W)}px repeat(3, minmax(0, 1fr))`,
          gridTemplateRows: `auto auto ${rowHeights.map((h) => `${String(h)}px`).join(' ')}`,
          gap: 1,
          columnGap: 1,
        }}
      >
        <AxisTitle icon="up">Potencial</AxisTitle>
        <div className="col-span-3 flex items-center pl-3">
          <AxisTitle icon="right">Relacionamento</AxisTitle>
        </div>

        <div />
        {COLUMNS.map((column) => (
          <span className="pb-1 text-center text-[11px] text-text-secondary" key={column}>
            {column}
          </span>
        ))}

        {ROWS.map((rowLabel, row) => (
          <div className="contents" key={rowLabel}>
            <span className="flex items-center justify-end pr-2 text-[11px] text-text-secondary">{rowLabel}</span>
            {cells
              .filter((cell) => cell.row === row)
              .map((cell) => {
                const count = cell.accounts.length;
                const isEmpty = count === 0;
                const isCrowded = cell === crowded;
                const isSelected = selected === cell.id;
                const shown = cell.accounts.slice(0, MAX_CHIPS);
                const label = `${cell.action}, potencial ${rowLabel.toLowerCase()} e relacionamento ${(COLUMNS[cell.column] ?? '').toLowerCase()}: ${formatInt(count)} contas`;
                return (
                  <section
                    className={cn(
                      'flex min-w-0 flex-col gap-0.5 px-2 py-1',
                      isEmpty ? 'bg-surface-raised' : 'bg-surface-sunken',
                      isSelected && 'ring-2 ring-inset ring-text-primary',
                    )}
                    key={cell.id}
                    style={{ outline: '1px solid var(--line-subtle)', outlineOffset: -1 }}
                  >
                    <button
                      aria-label={label}
                      aria-pressed={isSelected}
                      className="flex items-baseline justify-between gap-2 text-left"
                      onClick={() => setSelected(isSelected ? null : cell.id)}
                      type="button"
                    >
                      <span className={cn('flex items-baseline gap-1', isEmpty ? 'text-text-muted' : 'text-text-primary')}>
                        <span className="kpi-number text-lg font-semibold">{formatInt(count)}</span>
                        <span className="text-[11px]">{count === 1 ? 'conta' : 'contas'}</span>
                      </span>
                      <span className={cn('text-[11px]', isEmpty ? 'text-text-muted' : 'font-medium text-text-secondary')}>
                        {cell.action}
                      </span>
                    </button>
                    {isCrowded ? (
                      <>
                        <ul className="m-0 flex list-none flex-col gap-px p-0">
                          {shown.map((account) => {
                            const Icon = OUTLOOK_ICON[account.outlook];
                            return (
                              <li
                                className="flex items-center gap-1.5 bg-surface-raised px-1.5 text-[11px]"
                                key={account.id}
                                style={{ height: CHIP_H - 1 }}
                              >
                                <Icon aria-label={`posição prevista: ${OUTLOOK_TEXT[account.outlook]}`} className="size-3 shrink-0 text-text-secondary" role="img" />
                                <span className="min-w-0 flex-1 whitespace-nowrap text-text-secondary">{account.name}</span>
                                <span className="shrink-0 pl-1 font-display tabular-nums text-text-muted">{formatDecimal(account.potential ?? 0, 1)}</span>
                              </li>
                            );
                          })}
                        </ul>
                        <span className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-display tabular-nums text-text-muted">+{formatInt(count - shown.length)} contas</span>
                          <button
                            className="rounded-full border border-line-strong px-2 py-0.5 text-text-primary"
                            onClick={() => onOpenList?.(cell.id)}
                            type="button"
                          >
                            Abrir lista
                          </button>
                        </span>
                      </>
                    ) : null}
                  </section>
                );
              })}
          </div>
        ))}
      </div>

      <div
        aria-label="Contas sem avaliação"
        className="flex shrink-0 items-center gap-2 border border-dotted border-line-strong px-2 py-1 text-[11px] text-text-secondary"
        role="group"
      >
        <Unplug aria-hidden className="size-3 shrink-0 text-text-muted" />
        <span>
          {formatInt(unrated.length)} {unrated.length === 1 ? 'conta sem avaliação' : 'contas sem avaliação'} do time: fora da grade, a avaliar.
        </span>
      </div>

      <p aria-hidden className="shrink-0 text-[11px] text-text-muted">
        Tracejado: avaliação do time, não medição. Símbolo no chip: posição prevista em um ano, seta para cima sobe, traço estável, seta para baixo cai. Número no chip: nota de potencial, de zero a dez.
      </p>
    </figure>
  );
}
