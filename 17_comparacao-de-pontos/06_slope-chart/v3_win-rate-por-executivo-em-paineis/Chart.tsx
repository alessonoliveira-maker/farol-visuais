import { Filter } from 'lucide-react';

import { formatDecimal, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveHalves } from './data';

/**
 * Win rate de cada executivo no 1º e no 2º semestre, um micro slope por painel e a mesma escala
 * vertical em todos. A reta cinza tracejada é a média da empresa, repetida em cada painel como
 * referência. Painéis ordenados pela variação em pontos percentuais, do maior ganho à maior queda.
 */
export interface ExecutiveSlopePanelsProps {
  readonly data?: readonly ExecutiveHalves[];
  readonly height?: number;
  readonly className?: string;
}

const MICRO_W = 120;
const MICRO_H = 68;
const MICRO_X_FIRST = 36;
const MICRO_X_SECOND = 84;
const MICRO_TOP = 8;
const MICRO_BOTTOM = 50;
const MICRO_LABEL_GAP = 7;
const MICRO_DOT_RADIUS = 3.5;
const DOMAIN_STEP = 10;

/** Taxa de ganho; `null` sem oportunidade decidida (EST-1b), nunca zero. */
function rateOf(won: number, decided: number): number | null {
  return decided > 0 ? won / decided : null;
}

/** Razão das somas (não média das taxas) sobre uma lista; `null` para lista vazia. */
function pooledRate(items: readonly ExecutiveHalves[], half: 'first' | 'second'): number | null {
  if (items.length === 0) return null;
  const won = items.reduce((sum, item) => sum + (half === 'first' ? item.wonFirst : item.wonSecond), 0);
  const decided = items.reduce((sum, item) => sum + (half === 'first' ? item.decidedFirst : item.decidedSecond), 0);
  return rateOf(won, decided);
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

interface Panel {
  readonly item: ExecutiveHalves;
  readonly first: number;
  readonly second: number;
  /** Variação em décimos de ponto percentual, inteira para o empate ser exato. */
  readonly tenths: number;
}

function signedPoints(tenths: number): string {
  if (tenths === 0) return `${formatDecimal(0, 1)} p.p.`;
  return `${tenths > 0 ? '+' : '−'}${formatDecimal(Math.abs(tenths) / 10, 1)} p.p.`;
}

interface MicroSlopeProps {
  readonly first: number;
  readonly second: number;
  readonly averageFirst: number;
  readonly averageSecond: number;
  /** Teto da escala em fração, igual para todos os painéis. */
  readonly domainMax: number;
}

/**
 * Micro slope autocontido: duas taxas, a reta da média e a escala comum. Não lê nada fora das
 * props, então serve igual num cartão de KPI. Largura e altura iguais ao viewBox (escala 1).
 */
function MicroSlope({ first, second, averageFirst, averageSecond, domainMax }: MicroSlopeProps) {
  const yOf = (rate: number) => MICRO_BOTTOM - (rate / domainMax) * (MICRO_BOTTOM - MICRO_TOP);
  return (
    <svg aria-hidden className="block shrink-0" height={MICRO_H} viewBox={`0 0 ${String(MICRO_W)} ${String(MICRO_H)}`} width={MICRO_W}>
      <line stroke="var(--line-subtle)" x1={MICRO_X_FIRST - 12} x2={MICRO_X_SECOND + 12} y1={MICRO_BOTTOM} y2={MICRO_BOTTOM} />
      <line stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1} x1={MICRO_X_FIRST} x2={MICRO_X_SECOND} y1={yOf(averageFirst)} y2={yOf(averageSecond)} />
      <line stroke="var(--chart-1)" strokeLinecap="round" strokeWidth={2} x1={MICRO_X_FIRST} x2={MICRO_X_SECOND} y1={yOf(first)} y2={yOf(second)} />
      <circle cx={MICRO_X_FIRST} cy={yOf(first)} fill="var(--chart-1)" r={MICRO_DOT_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} />
      <circle cx={MICRO_X_SECOND} cy={yOf(second)} fill="var(--chart-1)" r={MICRO_DOT_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} />
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={11} fontWeight={500} textAnchor="end" x={MICRO_X_FIRST - MICRO_LABEL_GAP} y={yOf(first)}>
        {formatPercent(first, 0)}
      </text>
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={11} fontWeight={500} textAnchor="start" x={MICRO_X_SECOND + MICRO_LABEL_GAP} y={yOf(second)}>
        {formatPercent(second, 0)}
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={MICRO_X_FIRST} y={MICRO_BOTTOM + 14}>
        1º
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={MICRO_X_SECOND} y={MICRO_BOTTOM + 14}>
        2º
      </text>
    </svg>
  );
}

export default function ExecutiveSlopePanels({ data = defaultData, height, className }: ExecutiveSlopePanelsProps) {
  const style = height === undefined ? undefined : { height };
  const averageFirst = pooledRate(data, 'first');
  const averageSecond = pooledRate(data, 'second');

  const panels: Panel[] = [];
  for (const item of data) {
    const first = rateOf(item.wonFirst, item.decidedFirst);
    const second = rateOf(item.wonSecond, item.decidedSecond);
    if (first !== null && second !== null) panels.push({ item, first, second, tenths: Math.round((second - first) * 1000) });
  }
  panels.sort((a, b) => b.tenths - a.tenths || a.item.name.localeCompare(b.item.name, 'pt-BR'));

  const top = panels[0];
  const bottom = panels[panels.length - 1];
  if (averageFirst === null || averageSecond === null || top === undefined || bottom === undefined) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo com oportunidade decidida neste recorte: não há win rate para comparar entre os semestres.</span>
      </div>
    );
  }

  const rateRange = extent(panels.flatMap((panel) => [panel.first, panel.second]).concat([averageFirst, averageSecond]));
  const volumeRange = extent(data.flatMap((item) => [item.decidedFirst, item.decidedSecond]));
  if (rateRange === null || volumeRange === null) return null;
  const domainMax = (Math.ceil((rateRange[1] * 100) / DOMAIN_STEP) * DOMAIN_STEP) / 100;
  const readingLine = `Ordem pela variação em p.p., do maior ganho (${top.item.name}, ${signedPoints(top.tenths)}) à maior queda (${bottom.item.name}, ${signedPoints(bottom.tenths)}).`;
  const footnote = `Win rate: ganhas ÷ decididas, de ${String(volumeRange[0])} a ${String(volumeRange[1])} oportunidades por semestre. 1º e 2º semestre de 2026. Tracejado: média da empresa, ${formatPercent(averageFirst, 0)} e ${formatPercent(averageSecond, 0)}.`;
  const summary = `Painéis de inclinação com o win rate de ${String(panels.length)} executivos do 1º para o 2º semestre, ordenados pela variação em pontos percentuais. Maior ganho: ${top.item.name}, de ${formatPercent(top.first, 0)} para ${formatPercent(top.second, 0)}. Maior queda: ${bottom.item.name}, de ${formatPercent(bottom.first, 0)} para ${formatPercent(bottom.second, 0)}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs text-text-secondary">
        {readingLine}
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-7 content-start gap-x-2 gap-y-4">
        {panels.map((panel) => {
          const deltaTone = panel.tenths > 0 ? 'text-positive' : panel.tenths < 0 ? 'text-negative' : 'text-text-secondary';
          return (
            <div className="flex min-w-0 flex-col items-start" key={panel.item.id}>
              <span className="w-full whitespace-nowrap text-xs font-medium text-text-secondary">{panel.item.name}</span>
              <MicroSlope averageFirst={averageFirst} averageSecond={averageSecond} domainMax={domainMax} first={panel.first} second={panel.second} />
              <span className={cn('font-display whitespace-nowrap text-[11px] font-medium', deltaTone)}>{signedPoints(panel.tenths)}</span>
            </div>
          );
        })}
      </div>
      <p aria-hidden className="shrink-0 text-[11px] text-text-muted">
        {footnote}
      </p>
    </div>
  );
}
