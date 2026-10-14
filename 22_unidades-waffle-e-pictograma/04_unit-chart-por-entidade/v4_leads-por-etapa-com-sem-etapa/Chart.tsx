import { Filter } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadStage } from './data';

/**
 * Unit chart de leads por etapa. Até 1.500 leads cada quadrado é um lead; acima disso a unidade passa
 * sozinha a 10 leads e o aviso vai escrito no topo, porque a legenda sozinha deixaria o leitor contar
 * quadrados como se fossem leads. O número acima de cada grupo é sempre a contagem exata, e o desenho
 * arredonda. A etapa ausente fica por último, em quadrados de contorno tracejado.
 */
export interface LeadUnitsProps {
  readonly data?: readonly LeadStage[];
  readonly className?: string;
}

const CELL = 10;
const GAP = 2;
const PITCH = CELL + GAP;
const CELL_RADIUS = 1.5;
/** Acima deste total de leads a unidade deixa de ser o lead (CONTRATO do modelo: cerca de 1.500). */
const MAX_ENTITIES = 1500;
const AGGREGATED_UNIT = 10;
const MAX_ROWS = 10;
const MIN_COLS = 4;
const MARK_COLOR = 'var(--chart-1)';
/** Ausência de dado: contorno em texto neutro, que mede 5,2:1 no escuro e 5,4:1 no claro. */
const MISSING_STROKE = 'var(--text-muted)';
const MISSING_STROKE_WIDTH = 1.5;
const MISSING_DASH = '3 2';

interface Group {
  readonly stage: LeadStage;
  readonly squares: number;
}

export default function LeadUnits({ data = defaultData, className }: LeadUnitsProps) {
  const total = data.reduce((sum, stage) => sum + stage.count, 0);

  if (total <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há etapa para desenhar.</span>
      </div>
    );
  }

  const unit = total > MAX_ENTITIES ? AGGREGATED_UNIT : 1;
  // A ausência vai sempre por último, e a ordem do funil se mantém entre as demais.
  const ordered = [...data.filter((stage) => !stage.missing), ...data.filter((stage) => stage.missing)];
  const groups: Group[] = ordered.map((stage) => ({ stage, squares: Math.round(stage.count / unit) }));
  const tallest = groups.reduce((max, group) => Math.max(max, group.squares), 0);
  const cols = Math.max(MIN_COLS, Math.ceil(tallest / MAX_ROWS));
  const gridWidth = cols * PITCH - GAP;
  const missing = ordered.find((stage) => stage.missing);

  const summary = `Gráfico de unidades com ${formatInt(total)} leads em ${formatInt(ordered.length)} etapas${unit > 1 ? `, um quadrado para cada ${formatInt(unit)} leads` : ', um quadrado por lead'}.${missing ? ` ${formatInt(missing.count)} leads estão sem etapa registrada.` : ''}`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure">
      <div aria-hidden>
        {unit > 1 ? (
          <p className="text-xs leading-5 font-medium text-text-secondary">
            <span className="kpi-number">1 quadrado = {formatInt(unit)} leads</span>: o recorte tem {formatInt(total)} leads e passa de {formatInt(MAX_ENTITIES)}, então a unidade foi agregada
          </p>
        ) : (
          <p className="text-xs leading-5 text-text-muted">
            <span className="kpi-number">{formatInt(total)}</span> leads, um quadrado por lead
          </p>
        )}
        <p className="text-[0.6875rem] leading-4 text-text-muted">O número de cada etapa é a contagem exata; o desenho arredonda ao quadrado mais próximo.</p>
      </div>
      <div className="grid min-h-0 flex-1 grid-flow-col auto-cols-fr gap-3">
        {groups.map(({ stage, squares }) => {
          const rows = Math.ceil(squares / cols);
          return (
            <div className={cn('flex min-w-0 flex-col', stage.missing && 'ml-3')} key={stage.id}>
              <div className="flex min-h-0 flex-1 flex-col justify-end gap-1">
                <p aria-hidden className="kpi-number text-sm leading-4 font-semibold text-text-primary">
                  {formatInt(stage.count)}
                </p>
                {rows > 0 ? (
                  <svg aria-hidden className="block w-full" style={{ maxWidth: gridWidth }} viewBox={`0 0 ${String(gridWidth)} ${String(rows * PITCH - GAP)}`}>
                    {Array.from({ length: squares }, (_, index) => {
                      const x = (index % cols) * PITCH;
                      const y = (rows - 1 - Math.floor(index / cols)) * PITCH;
                      const key = `${stage.id}-${String(index)}`;
                      if (stage.missing) {
                        const inset = MISSING_STROKE_WIDTH / 2;
                        return (
                          <rect
                            fill="none"
                            height={CELL - inset * 2}
                            key={key}
                            rx={CELL_RADIUS}
                            stroke={MISSING_STROKE}
                            strokeDasharray={MISSING_DASH}
                            strokeWidth={MISSING_STROKE_WIDTH}
                            width={CELL - inset * 2}
                            x={x + inset}
                            y={y + inset}
                          />
                        );
                      }
                      return <rect fill={MARK_COLOR} height={CELL} key={key} rx={CELL_RADIUS} width={CELL} x={x} y={y} />;
                    })}
                  </svg>
                ) : null}
              </div>
              <p
                aria-hidden
                className={cn('mt-1 h-8 border-t border-line-subtle pt-1 text-xs leading-4', stage.missing ? 'text-text-muted' : 'text-text-secondary')}
              >
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
