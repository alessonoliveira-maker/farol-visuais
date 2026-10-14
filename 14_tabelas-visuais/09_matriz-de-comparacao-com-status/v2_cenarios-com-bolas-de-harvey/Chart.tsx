import { TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatValue } from '@/components/visuals/valueFormat';
import { cn } from '@/lib/utils';
import { criteria as defaultCriteria, data as defaultData, type Criterion, type ScenarioRow } from './data';

/**
 * Bola de Harvey por cenário e critério: o arco preenchido em quartos mostra o quanto o cenário
 * se aproxima do melhor ponto da faixa declarada para aquele critério (a faixa normaliza,
 * nunca o maior e o menor valor da tela), e o número real fica escrito ao lado, porque o
 * glifo quantiza em 5 degraus e esconde a diferença fina. `direction` decide se a fração
 * preenchida vem do valor cru ou do seu complemento. HTML com Tailwind e um SVG puro por bola.
 */
export interface HarveyMatrixProps {
  readonly data?: readonly ScenarioRow[];
  readonly criteria?: readonly Criterion[];
  readonly height?: number;
  readonly className?: string;
}

/** Raio da bola de Harvey em pixels; o SVG usa `2 * BALL_RADIUS` de lado. */
const BALL_RADIUS = 7;
type Quarter = 0 | 0.25 | 0.5 | 0.75 | 1;

/** Arco de bola de Harvey calculado para 0, 1/4, 1/2, 3/4 e 1. Nunca caractere Unicode. */
function harveyPath(frac: Quarter, r = BALL_RADIUS): string {
  if (frac === 0) return '';
  if (frac === 1) return `M ${String(r)} 0 A ${String(r)} ${String(r)} 0 1 1 ${String(r - 0.01)} 0 Z`;
  const angle = -Math.PI / 2 + frac * 2 * Math.PI;
  const x = r + r * Math.cos(angle);
  const y = r + r * Math.sin(angle);
  return `M ${String(r)} ${String(r)} L ${String(r)} 0 A ${String(r)} ${String(r)} 0 ${frac > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
}

/** Normaliza um valor cru na faixa declarada do critério e inverte quando menor é melhor. */
function goodFraction(value: number, criterion: Criterion): Quarter {
  const span = criterion.max - criterion.min || 1;
  const normalized = Math.min(1, Math.max(0, (value - criterion.min) / span));
  const good = criterion.direction === 'maior_melhor' ? normalized : 1 - normalized;
  return (Math.round(good * 4) / 4) as Quarter;
}

/** Vão entre a bola e o contorno de líder, desenhado como geometria própria: um contorno via
 * classe `ring` de Tailwind é box-shadow e não sobrevive à serialização do preview em SVG. */
const RING_GAP = 2.5;

function HarveyBall({ frac, isLeader }: { readonly frac: Quarter; readonly isLeader: boolean }): ReactElement {
  const outerRadius = BALL_RADIUS + RING_GAP;
  const side = outerRadius * 2;
  return (
    <svg aria-hidden className="shrink-0" height={side} viewBox={`0 0 ${String(side)} ${String(side)}`} width={side}>
      {isLeader ? <circle cx={outerRadius} cy={outerRadius} fill="none" r={outerRadius - 0.75} stroke="var(--text-primary)" strokeWidth={1.5} /> : null}
      <g transform={`translate(${String(RING_GAP)} ${String(RING_GAP)})`}>
        <circle cx={BALL_RADIUS} cy={BALL_RADIUS} fill="none" r={BALL_RADIUS - 0.75} stroke="var(--line-subtle)" strokeWidth={1.5} />
        {frac > 0 ? <path d={harveyPath(frac)} fill="var(--chart-1)" /> : null}
      </g>
    </svg>
  );
}

export default function HarveyMatrix({
  data = defaultData,
  criteria = defaultCriteria,
  height,
  className,
}: HarveyMatrixProps): ReactElement {
  const style = height === undefined ? undefined : { height };

  const fractions = data.map((row) => criteria.map((criterion, index) => goodFraction(row.values[index] ?? criterion.min, criterion)));
  const leaderByColumn = criteria.map((_, columnIndex) => Math.max(...fractions.map((row) => row[columnIndex] ?? 0)));
  const totals = data.map((_, rowIndex) => (fractions[rowIndex] ?? []).reduce<number>((sum, frac) => sum + frac, 0));
  const bestRowIndex = totals.reduce((best, total, index) => (total > (totals[best] ?? -Infinity) ? index : best), 0);
  const worstRowIndex = totals.reduce((worst, total, index) => (total < (totals[worst] ?? Infinity) ? index : worst), 0);
  const best = data[bestRowIndex];
  const worst = data[worstRowIndex];

  const summary =
    `Matriz de bolas de Harvey com ${String(data.length)} cenários de 2027 em ${String(criteria.length)} critérios normalizados por faixa própria. ` +
    (best ? `${best.scenario} soma o maior preenchimento nos 6 critérios` : '') +
    (worst && worst.id !== best?.id ? `; ${worst.scenario} soma o menor.` : '.');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <table className="w-full min-w-0 flex-1 border-collapse">
        <thead>
          <tr>
            <th className="w-[15%] pb-1 text-left text-xs font-medium text-text-secondary" scope="col">
              Cenário
            </th>
            {criteria.map((criterion) => {
              const DirectionIcon = criterion.direction === 'maior_melhor' ? TrendingUp : TrendingDown;
              return (
                <th className="px-1 pb-1 text-center align-bottom" key={criterion.id} scope="col">
                  <span className="block text-[11px] leading-tight font-medium text-text-secondary">{criterion.name}</span>
                  <span className="mt-0.5 inline-flex items-center justify-center gap-1 text-[11px] tabular-nums text-text-muted">
                    <DirectionIcon aria-hidden className="size-2.5" />
                    faixa {formatValue(criterion.min, criterion.unit)} a {formatValue(criterion.max, criterion.unit)}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr className="border-t border-line-subtle" key={row.id}>
              <th className="py-1.5 pr-2 text-left text-xs font-medium text-text-primary" scope="row">
                {row.scenario}
              </th>
              {criteria.map((criterion, columnIndex) => {
                const frac = fractions[rowIndex]?.[columnIndex] ?? 0;
                const isLeader = frac > 0 && frac === leaderByColumn[columnIndex];
                const rawValue = row.values[columnIndex] ?? criterion.min;
                return (
                  <td className="py-1.5" key={criterion.id}>
                    <div className="flex flex-col items-center gap-0.5">
                      <HarveyBall frac={frac} isLeader={isLeader} />
                      <span className="kpi-number text-[11px] text-text-primary">{formatValue(rawValue, criterion.unit)}</span>
                      <span className="sr-only">
                        {isLeader ? 'Líder neste critério. ' : ''}
                        Preenchimento {formatValue(frac, 'percent')} de {criterion.name}.
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1.5 shrink-0 text-[11px] text-text-muted">
        A bola cheia é o melhor ponto da faixa própria de cada critério; contorno marca o cenário líder na coluna, empatado ou não.
      </p>
    </div>
  );
}
