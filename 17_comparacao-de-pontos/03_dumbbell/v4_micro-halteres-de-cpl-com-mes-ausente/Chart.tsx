import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatCurrency, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, goodDirection, monthAfter, monthBefore, type PlatformCpl } from './data';

/**
 * Micro halteres de CPL para um cartão de KPI: uma linha por plataforma, com o haltere em SVG de
 * viewBox fixo e a mesma escala nas quatro. Mês sem veiculação vira ponto solto e o texto
 * "sem veiculação" ocupa o lugar do delta; cabeças coladas viram um marcador meio a meio.
 */
export interface CplDumbbellsProps {
  readonly data?: readonly PlatformCpl[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 174;
const VIEW_H = 20;
const CENTER_Y = VIEW_H / 2;
const HEAD_RADIUS = 4;
const HEAD_STROKE = 1.5;
const CONNECTOR_WIDTH = 2;
/** Respiro dos extremos da escala: a cabeça do menor e a do maior valor cabem inteiras na caixa. */
const SCALE_PAD = HEAD_RADIUS + 4;
/** Dois raios mais 2 px: abaixo disto as cabeças se tocam e a forma inteira não se lê. */
const SPLIT_BELOW = HEAD_RADIUS * 2 + 2;
const HEAD_BEFORE_COLOR = 'var(--chart-3)';
const HEAD_AFTER_COLOR = 'var(--chart-1)';
/** Vão entre as metades do marcador bipartido: cada metade recua 1,5 px do centro. */
const HALF_OFFSET = 1.5;
const CARD = 'rounded-lg border border-line-subtle bg-surface-raised p-4';

interface Scale {
  readonly low: number;
  readonly high: number;
}

/** A escala comum às linhas: do menor ao maior CPL medido. Sem nenhum valor, não há escala (EST-1b). */
function commonScale(rows: readonly PlatformCpl[]): Scale | null {
  const values = rows.flatMap((row) => (row.august === null ? [row.july] : [row.july, row.august]));
  if (values.length === 0) return null;
  return { low: Math.min(...values), high: Math.max(...values) };
}

function positionOf(value: number, scale: Scale): number {
  if (scale.high === scale.low) return VIEW_W / 2;
  return SCALE_PAD + ((value - scale.low) / (scale.high - scale.low)) * (VIEW_W - 2 * SCALE_PAD);
}

/** Cor pela polaridade: com `down` como bom, o CPL que cai é positivo. Sem mudança, neutro. */
function deltaColor(delta: number): string {
  if (delta === 0) return 'var(--text-secondary)';
  const isGood = goodDirection === 'down' ? delta < 0 : delta > 0;
  return isGood ? 'var(--positive)' : 'var(--negative)';
}

/** Sinal à mão sobre o valor absoluto, com o menos tipográfico (NUM-3). */
function signedCurrency(delta: number): string {
  if (delta === 0) return formatCurrency(0, 0);
  return `${delta < 0 ? '−' : '+'}${formatCurrency(Math.abs(delta), 0)}`;
}

/** Meio círculo: `side` é o lado em que a metade fica, e as duas juntas fecham o disco. */
function halfDisc(cx: number, side: 'left' | 'right'): string {
  const sweep = side === 'left' ? 0 : 1;
  return `M${String(cx)},${String(CENTER_Y - HEAD_RADIUS)} A${String(HEAD_RADIUS)},${String(HEAD_RADIUS)} 0 0 ${String(sweep)} ${String(cx)},${String(CENTER_Y + HEAD_RADIUS)} Z`;
}

function MicroDumbbell({ row, scale }: { readonly row: PlatformCpl; readonly scale: Scale }): ReactElement {
  const beforeX = positionOf(row.july, scale);
  const beforeHead = <circle cx={beforeX} cy={CENTER_Y} fill="var(--surface-raised)" r={HEAD_RADIUS} stroke={HEAD_BEFORE_COLOR} strokeWidth={HEAD_STROKE} />;
  /* Ponta ausente: só a cabeça de julho, solta. Nenhum conector sai dela, e nada desce a zero. */
  if (row.august === null) {
    return (
      <svg aria-hidden className="h-5 w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {beforeHead}
      </svg>
    );
  }
  const afterX = positionOf(row.august, scale);
  const delta = row.august - row.july;
  const gap = Math.abs(afterX - beforeX);
  /* Cabeças coladas: o marcador único é meio a meio, e a metade da esquerda é a do mês de menor valor. */
  if (gap < SPLIT_BELOW) {
    const centerX = (beforeX + afterX) / 2;
    const beforeIsLeft = row.july <= row.august;
    const hollow = { fill: 'var(--surface-raised)', stroke: HEAD_BEFORE_COLOR, strokeWidth: HEAD_STROKE, strokeLinejoin: 'round' } as const;
    return (
      <svg aria-hidden className="h-5 w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <path d={halfDisc(centerX - HALF_OFFSET, 'left')} {...(beforeIsLeft ? hollow : { fill: HEAD_AFTER_COLOR })} />
        <path d={halfDisc(centerX + HALF_OFFSET, 'right')} {...(beforeIsLeft ? { fill: HEAD_AFTER_COLOR } : hollow)} />
      </svg>
    );
  }
  return (
    <svg aria-hidden className="h-5 w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
      <line stroke={deltaColor(delta)} strokeLinecap="round" strokeWidth={CONNECTOR_WIDTH} x1={beforeX} x2={afterX} y1={CENTER_Y} y2={CENTER_Y} />
      {beforeHead}
      <circle cx={afterX} cy={CENTER_Y} fill={HEAD_AFTER_COLOR} r={HEAD_RADIUS} />
    </svg>
  );
}

/** A plataforma com a maior mudança em módulo entre as que veicularam nos dois meses. */
function largestMove(rows: readonly PlatformCpl[]): { readonly row: PlatformCpl; readonly august: number } | null {
  let best: { row: PlatformCpl; august: number } | null = null;
  for (const row of rows) {
    if (row.august === null) continue;
    if (best === null || Math.abs(row.august - row.july) > Math.abs(best.august - best.row.july)) best = { row, august: row.august };
  }
  return best;
}

export default function CplDumbbells({ data = defaultData, height, className }: CplDumbbellsProps) {
  const style = height === undefined ? undefined : { height };
  const scale = commonScale(data);

  if (data.length === 0 || scale === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', CARD, className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma neste recorte: não há CPL medido para desenhar.</span>
      </div>
    );
  }

  const before = formatMonthShort(monthBefore);
  const after = formatMonthShort(monthAfter);
  const missing = data.filter((row) => row.august === null);
  const move = largestMove(data);
  const scaleText = `de ${formatCurrency(scale.low, 0)} a ${formatCurrency(scale.high, 0)} por lead`;
  const summary = [
    `Micro halteres do custo por lead de ${formatInt(data.length)} plataformas, de ${before} para ${after}, na mesma escala ${scaleText}.`,
    move ? `Maior mudança: ${move.row.name}, de ${formatCurrency(move.row.july, 0)} para ${formatCurrency(move.august, 0)}.` : '',
    missing.length > 0 ? `Sem veiculação em ${after}: ${missing.map((row) => row.name).join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col justify-between text-xs', CARD, className)} role="img" style={style}>
      <ul aria-hidden className="flex flex-col">
        {data.map((row) => {
          const delta = row.august === null ? null : row.august - row.july;
          return (
            <li className="grid h-8 grid-cols-[88px_minmax(0,1fr)_96px] items-center gap-2" key={row.id}>
              <span className="font-medium leading-4 text-text-secondary">{row.name}</span>
              <MicroDumbbell row={row} scale={scale} />
              {delta === null ? (
                <span className="text-right text-[0.6875rem] leading-[14px] text-text-muted">sem veiculação em {after}</span>
              ) : (
                <span className="kpi-number text-right font-semibold" style={{ color: deltaColor(delta) }}>
                  {signedCurrency(delta)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div aria-hidden className="flex shrink-0 flex-col gap-1 text-[0.6875rem] leading-4 text-text-muted">
        <p className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="box-border size-2.5 shrink-0 rounded-full border-2 bg-surface-raised" style={{ borderColor: HEAD_BEFORE_COLOR }} />
            <span className="tabular-nums">{before}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: HEAD_AFTER_COLOR }} />
            <span className="tabular-nums">{after}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="size-2.5 shrink-0" viewBox="0 0 10 10">
              <path d="M3.5,1.5 A3.5,3.5 0 0 0 3.5,8.5 Z" fill="var(--surface-raised)" stroke={HEAD_BEFORE_COLOR} strokeLinejoin="round" strokeWidth={1} />
              <path d="M6.5,1.5 A3.5,3.5 0 0 1 6.5,8.5 Z" fill={HEAD_AFTER_COLOR} />
            </svg>
            diferença menor que a cabeça
          </span>
        </p>
        <p>Escala comum a todas as linhas, {scaleText}.</p>
      </div>
    </div>
  );
}
