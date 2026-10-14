import { Filter } from 'lucide-react';

import { formatInt, formatMonthShort, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, entryMonth, type ExecutiveWinRate, type HalfResult } from './data';

/**
 * Slope chart de win rate com dois casos difíceis: executivos que empatam nos dois semestres, cujas
 * retas se sobrepõem e cujos rótulos se afastam com traço guia, e quem entrou em julho, que tem
 * ponto só na coluna direita. Nenhuma reta é inventada até o zero para o semestre que não existe.
 */
export interface ExecutiveSlopeTiesProps {
  readonly data?: readonly ExecutiveWinRate[];
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox é o corpo do canvas quadrado (card, caso de uso em duas linhas): escala 1, texto sem encolher (GEO-18). */
const VIEW_W = 422;
const VIEW_H = 355;
const READING_Y = 13;
const HEADER_Y = 40;
const PLOT_TOP = 58;
const PLOT_BOTTOM = 306;
const FOOTER_Y = 336;
const FOOTER_STEP = 14;
const X_LEFT = 140;
const X_RIGHT = 282;
const DOT_RADIUS = 4.5;
const LABEL_OFFSET = 16;
const VALUE_WIDTH = 36;
/** Largura do espaço do valor quando ele é a palavra de ausência, mais larga que um percentual. */
const ABSENT_WIDTH = 68;
/** Folga entre rótulos: dois rótulos no mesmo valor se afastam metade para cada lado (8,5 px), acima do mínimo do guia. */
const LABEL_GAP = 17;
const LEADER_MIN = 8;
const DOMAIN_STEP = 10;
const LINE_WIDTH = 1.5;
const LINE_WIDTH_TIE = 2.5;
const TIE_COLOR = 'var(--chart-1)';
const ENTRY_COLOR = 'var(--chart-3)';
const NEUTRAL = 'var(--text-muted)';

/** Taxa em milésimos inteiros, para o empate ser exato; `null` sem oportunidade decidida (EST-1b). */
function permille(half: HalfResult | null): number | null {
  if (half === null || half.decided <= 0) return null;
  return Math.round((half.won / half.decided) * 1000);
}

/** Menor e maior de uma lista; `null` para lista vazia (EST-1b), nunca um limite inventado. */
function extent(list: readonly number[]): readonly [number, number] | null {
  const first = list[0];
  if (first === undefined) return null;
  let low = first;
  let high = first;
  for (const value of list) {
    if (value < low) low = value;
    if (value > high) high = value;
  }
  return [low, high];
}

/**
 * afastarRotulos: dado o y desejado de cada rótulo, devolve o y de cada um com `gap` de folga,
 * dentro de [min, max]. Rótulos vizinhos formam um bloco que se centra no próprio grupo (mínimos
 * quadrados), então o deslocamento se reparte em vez de empurrar tudo para baixo.
 */
function spreadLabels(wanted: readonly number[], gap: number, min: number, max: number): readonly number[] {
  const order = wanted.map((_, index) => index).sort((a, b) => (wanted[a] ?? 0) - (wanted[b] ?? 0) || a - b);
  const clampStart = (adj: number, n: number) => Math.min(Math.max(adj / n, min), max - (n - 1) * gap);
  const blocks: { n: number; adj: number; start: number }[] = [];
  for (const index of order) {
    const adj0 = wanted[index] ?? 0;
    let current = { n: 1, adj: adj0, start: clampStart(adj0, 1) };
    for (let prev = blocks[blocks.length - 1]; prev !== undefined && prev.start + prev.n * gap > current.start; prev = blocks[blocks.length - 1]) {
      blocks.pop();
      const n = prev.n + current.n;
      const adj = prev.adj + current.adj - current.n * prev.n * gap;
      current = { n, adj, start: clampStart(adj, n) };
    }
    blocks.push(current);
  }
  const placed: number[] = wanted.map(() => 0);
  let cursor = 0;
  for (const block of blocks) {
    for (let j = 0; j < block.n; j += 1) {
      const target = order[cursor];
      if (target !== undefined) placed[target] = block.start + j * gap;
      cursor += 1;
    }
  }
  return placed;
}

interface Row {
  readonly item: ExecutiveWinRate;
  readonly first: number | null;
  readonly second: number;
  readonly tied: boolean;
}

export default function ExecutiveSlopeTies({ data = defaultData, height, className }: ExecutiveSlopeTiesProps) {
  const style = height === undefined ? undefined : { height };

  const base: { item: ExecutiveWinRate; first: number | null; second: number }[] = [];
  for (const item of data) {
    const second = permille(item.second);
    if (second !== null) base.push({ item, first: permille(item.first), second });
  }
  const rows: Row[] = base.map((row) => ({
    ...row,
    tied: row.first !== null && base.some((other) => other.item.id !== row.item.id && other.first === row.first && other.second === row.second),
  }));

  const range = extent(rows.flatMap((row) => (row.first === null ? [row.second] : [row.first, row.second])).map((value) => value / 10));
  if (rows.length === 0 || range === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo com oportunidade decidida neste recorte: não há win rate para comparar entre os semestres.</span>
      </div>
    );
  }

  const domainMax = Math.ceil(range[1] / DOMAIN_STEP) * DOMAIN_STEP;
  /* Slope lê posição, não comprimento: a escala começa no degrau abaixo do menor valor. */
  const domainMin = Math.floor(range[0] / DOMAIN_STEP) * DOMAIN_STEP;
  const yOf = (thousandths: number) => PLOT_BOTTOM - ((thousandths / 10 - domainMin) / (domainMax - domainMin)) * (PLOT_BOTTOM - PLOT_TOP);
  const wantedSecond = rows.map((row) => yOf(row.second));
  /* Quem não tem o 1º semestre entra na pilha da esquerda na altura do próprio ponto da direita. */
  const wantedFirst = rows.map((row, index) => (row.first === null ? (wantedSecond[index] ?? 0) : yOf(row.first)));
  const placedFirst = spreadLabels(wantedFirst, LABEL_GAP, PLOT_TOP, PLOT_BOTTOM);
  const placedSecond = spreadLabels(wantedSecond, LABEL_GAP, PLOT_TOP, PLOT_BOTTOM);

  const tiedRows = rows.filter((row) => row.tied);
  const tiedPairs = Math.floor(tiedRows.length / 2);
  const absentRows = rows.filter((row) => row.first === null);
  const entrant = absentRows[0];
  const pct = (thousandths: number) => formatPercent(thousandths / 1000, 0);
  const entryLabel = formatMonthShort(entryMonth);

  const tieNames = tiedRows.length >= 2 ? `${tiedRows[0]?.item.name ?? ''} e ${tiedRows[1]?.item.name ?? ''}` : null;
  const readingLine = tieNames === null ? 'Nenhum empate nos dois semestres.' : `Empate nos dois semestres: ${tieNames}`;
  const footerPairs = `${formatInt(tiedPairs)} ${tiedPairs === 1 ? 'par empatado' : 'pares empatados'} nos dois semestres; ${formatInt(absentRows.length)} sem dado no 1º semestre.`;
  const footerEntrant = entrant ? `${entrant.item.name} entrou em ${entryLabel}: ${formatRateWithVolume(entrant.item.second.won, entrant.item.second.decided, 0)} no 2º semestre.` : null;
  const summary =
    `Gráfico de inclinação com o win rate de ${String(rows.length)} executivos do 1º para o 2º semestre. ` +
    (tieNames === null ? 'Nenhum empate nos dois semestres. ' : `${tieNames} empatam nos dois semestres. `) +
    (entrant ? `${entrant.item.name} entrou em ${entryLabel} e só tem o 2º semestre, com ${pct(entrant.second)}.` : 'Todos têm os dois semestres.');

  return (
    <svg aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style} viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
      <text aria-hidden className="font-sans" fill="var(--text-secondary)" fontSize={12} x={0} y={READING_Y}>
        {readingLine}
      </text>
      {[
        { x: X_LEFT, label: '1º semestre' },
        { x: X_RIGHT, label: '2º semestre' },
      ].map((column) => (
        <text className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={600} key={column.label} textAnchor="middle" x={column.x} y={HEADER_Y}>
          {column.label}
        </text>
      ))}

      {/* Retas neutras primeiro e o par empatado por cima; só há reta onde existem os dois semestres. */}
      {[false, true].map((tiedLayer) =>
        rows.map((row, index) =>
          row.first !== null && row.tied === tiedLayer ? (
            <line
              key={`line-${row.item.id}`}
              stroke={row.tied ? TIE_COLOR : NEUTRAL}
              strokeLinecap="round"
              strokeWidth={row.tied ? LINE_WIDTH_TIE : LINE_WIDTH}
              x1={X_LEFT}
              x2={X_RIGHT}
              y1={yOf(row.first)}
              y2={wantedSecond[index]}
            />
          ) : null,
        ),
      )}

      {rows.map((row, index) => {
        const absent = row.first === null;
        const color = row.tied ? TIE_COLOR : absent ? ENTRY_COLOR : NEUTRAL;
        const nameFill = row.tied ? TIE_COLOR : absent ? ENTRY_COLOR : 'var(--text-secondary)';
        const weight = row.tied || absent ? 600 : 400;
        const yFirst = wantedFirst[index] ?? 0;
        const ySecond = wantedSecond[index] ?? 0;
        const labelFirst = placedFirst[index] ?? 0;
        const labelSecond = placedSecond[index] ?? 0;
        const leftSlot = absent ? ABSENT_WIDTH : VALUE_WIDTH;
        return (
          <g key={`ends-${row.item.id}`}>
            {/* Traço guia só quando o rótulo saiu mais de 8 px do ponto (afastarRotulos). */}
            {!absent && Math.abs(labelFirst - yFirst) > LEADER_MIN ? (
              <line stroke={NEUTRAL} strokeWidth={1} x1={X_LEFT - DOT_RADIUS - 1} x2={X_LEFT - LABEL_OFFSET + 3} y1={yFirst} y2={labelFirst} />
            ) : null}
            {Math.abs(labelSecond - ySecond) > LEADER_MIN ? (
              <line stroke={NEUTRAL} strokeWidth={1} x1={X_RIGHT + DOT_RADIUS + 1} x2={X_RIGHT + LABEL_OFFSET - 3} y1={ySecond} y2={labelSecond} />
            ) : null}

            {!absent ? <circle cx={X_LEFT} cy={yFirst} fill={color} r={DOT_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} /> : null}
            {absent ? (
              <circle cx={X_RIGHT} cy={ySecond} fill="var(--surface-raised)" r={DOT_RADIUS} stroke={color} strokeWidth={2} />
            ) : (
              <circle cx={X_RIGHT} cy={ySecond} fill={color} r={DOT_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} />
            )}

            <text className="font-sans" dominantBaseline="central" fill={nameFill} fontSize={12} fontWeight={weight} textAnchor="end" x={X_LEFT - LABEL_OFFSET - leftSlot} y={labelFirst}>
              {row.item.name}
            </text>
            {row.first === null ? (
              <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={X_LEFT - LABEL_OFFSET} y={labelFirst}>
                {formatUnavailable()}
              </text>
            ) : (
              <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={500} textAnchor="end" x={X_LEFT - LABEL_OFFSET} y={labelFirst}>
                {pct(row.first)}
              </text>
            )}
            <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={500} textAnchor="start" x={X_RIGHT + LABEL_OFFSET} y={labelSecond}>
              {pct(row.second)}
            </text>
            <text className="font-sans" dominantBaseline="central" fill={nameFill} fontSize={12} fontWeight={weight} textAnchor="start" x={X_RIGHT + LABEL_OFFSET + VALUE_WIDTH} y={labelSecond}>
              {row.item.name}
            </text>
          </g>
        );
      })}

      <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={11} x={0} y={FOOTER_Y}>
        {footerPairs}
      </text>
      {footerEntrant !== null ? (
        <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={11} x={0} y={FOOTER_Y + FOOTER_STEP}>
          {footerEntrant}
        </text>
      ) : null}
    </svg>
  );
}
