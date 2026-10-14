import { CircleAlert, Filter, TriangleAlert, Unplug } from 'lucide-react';
import { useId } from 'react';

import { formatInt, formatMonthLong, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { attentionFrom as defaultAttentionFrom, data as defaultData, month as defaultMonth, type QueueCapacity } from './data';

/**
 * Coluna de bullets de capacidade: cada fila contra o próprio teto, todas na mesma escala relativa
 * (percentual do teto), para o teto cair na mesma vertical nas cinco réguas. Aqui chegar a 100% é
 * ruim: as faixas sobem de intensidade num tom só (--seq-1 a --seq-3) do conforto ao estouro, e o
 * uso acima do teto continua desenhado, em hachura, em vez de saturar no 100%. SVG puro por linha,
 * com a geometria em percentual da largura: a régua estica no Farol sem distorcer a hachura.
 */
export interface CapacityBulletsProps {
  readonly data?: readonly QueueCapacity[];
  /** Mês da fotografia, YYYY-MM. */
  readonly month?: string;
  /** Corte de atenção declarado, em fração do teto. */
  readonly attentionFrom?: number;
  readonly className?: string;
}

/** Uma grade só para as cinco linhas: nome e valor na largura do conteúdo, a régua com o resto; o nome quebra, nunca é cortado. */
const ROW_GRID =
  'grid min-h-0 flex-1 grid-cols-[minmax(0,max-content)_minmax(6rem,1fr)_max-content] content-between items-center gap-x-5 gap-y-2 pt-4';
const BULLET_HEIGHT = 22;
/** Faixas com 3 px de respiro em cima e embaixo, para o traço do teto passar delas. */
const BAND_INSET = 3;
const BAR_HEIGHT = 8;
const BAR_Y = (BULLET_HEIGHT - BAR_HEIGHT) / 2;
const MARK_WIDTH = 2;
/** Vão na cor do cartão entre faixas vizinhas (COR-5) e atrás do traço do teto. */
const GAP_WIDTH = 2;
const HALO_WIDTH = 5;
const HATCH_SIZE = 4;
const HATCH_STROKE = 2;
/** A escala comum vai ao maior uso relativo com 5 pontos de folga, arredondada ao 10% de cima. */
const SCALE_HEADROOM = 0.05;
const SCALE_STEP = 0.1;

type Zone = 'comfort' | 'attention' | 'overflow';

interface QueueReading {
  readonly queue: QueueCapacity;
  /** Uso dividido pelo teto; `null` sem coleta ou sem teto declarado. */
  readonly ratio: number | null;
  readonly zone: Zone | null;
}

function readQueue(queue: QueueCapacity, attentionFrom: number): QueueReading {
  const { usage, ceiling } = queue;
  if (usage === null || ceiling === null || ceiling <= 0) return { queue, ratio: null, zone: null };
  const ratio = usage / ceiling;
  return { queue, ratio, zone: ratio > 1 ? 'overflow' : ratio >= attentionFrom ? 'attention' : 'comfort' };
}

/** Topo da escala comum a todas as réguas, em fração do teto (1,3 = 130% do teto). */
function commonScale(readings: readonly QueueReading[]): number {
  const top = Math.max(1, ...readings.flatMap((reading) => (reading.ratio === null ? [] : [reading.ratio]))) + SCALE_HEADROOM;
  return Math.ceil(top / SCALE_STEP - 1e-9) * SCALE_STEP;
}

/** Regra de três da régua: fração do teto sobre o topo da escala, em percentual da largura. */
function at(relative: number, scaleMax: number): string {
  return `${String((Math.min(Math.max(relative, 0), scaleMax) / scaleMax) * 100)}%`;
}

interface BulletProps {
  readonly reading: QueueReading;
  readonly scaleMax: number;
  readonly attentionFrom: number;
  readonly hatchId: string;
}

function Bullet({ reading, scaleMax, attentionFrom, hatchId }: BulletProps) {
  const { queue, ratio } = reading;
  const bandHeight = BULLET_HEIGHT - BAND_INSET * 2;
  if (queue.ceiling === null || queue.ceiling <= 0) {
    // Teto desconhecido: trilho vazado, sem faixas nem marca. Nada de inventar um 100%.
    return (
      <div aria-hidden className="flex items-center" style={{ height: BULLET_HEIGHT }}>
        <div className="w-full border border-dashed border-text-muted" style={{ height: bandHeight }} />
      </div>
    );
  }
  const ceilingX = at(1, scaleMax);
  return (
    <svg aria-hidden className="block w-full overflow-visible" height={BULLET_HEIGHT}>
      <defs>
        {/* Fundo na cor do cartão: --negative sobre --seq-3 mede 2,4:1 no escuro; sobre o cartão, 5,5:1. */}
        <pattern height={HATCH_SIZE} id={hatchId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={HATCH_SIZE}>
          <rect fill="var(--surface-raised)" height={HATCH_SIZE} width={HATCH_SIZE} x={0} y={0} />
          <line stroke="var(--negative)" strokeWidth={HATCH_STROKE} x1={0} x2={0} y1={0} y2={HATCH_SIZE} />
        </pattern>
      </defs>
      <rect fill="var(--seq-1)" height={bandHeight} width={at(attentionFrom, scaleMax)} x={0} y={BAND_INSET} />
      <rect fill="var(--seq-2)" height={bandHeight} width={at(1 - attentionFrom, scaleMax)} x={at(attentionFrom, scaleMax)} y={BAND_INSET} />
      <rect fill="var(--seq-3)" height={bandHeight} width={at(scaleMax - 1, scaleMax)} x={ceilingX} y={BAND_INSET} />
      <line
        stroke="var(--surface-raised)"
        strokeWidth={GAP_WIDTH}
        x1={at(attentionFrom, scaleMax)}
        x2={at(attentionFrom, scaleMax)}
        y1={BAND_INSET}
        y2={BULLET_HEIGHT - BAND_INSET}
      />
      {ratio !== null ? <rect fill="var(--chart-1)" height={BAR_HEIGHT} width={at(Math.min(ratio, 1), scaleMax)} x={0} y={BAR_Y} /> : null}
      {ratio !== null && ratio > 1 ? (
        <rect
          fill={`url(#${hatchId})`}
          height={BAR_HEIGHT - 1}
          stroke="var(--negative)"
          strokeWidth={1}
          width={at(ratio - 1, scaleMax)}
          x={ceilingX}
          y={BAR_Y + 0.5}
        />
      ) : null}
      <line stroke="var(--surface-raised)" strokeWidth={HALO_WIDTH} x1={ceilingX} x2={ceilingX} y1={0} y2={BULLET_HEIGHT} />
      <line stroke="var(--text-muted)" strokeWidth={MARK_WIDTH} x1={ceilingX} x2={ceilingX} y1={0} y2={BULLET_HEIGHT} />
    </svg>
  );
}

function ceilingText(queue: QueueCapacity): string {
  if (queue.ceiling === null || queue.ceiling <= 0) return 'teto não declarado';
  return `teto ${queue.ceilingSource} de ${formatInt(queue.ceiling)} ${queue.unit}`;
}

function summaryOf(readings: readonly QueueReading[], month: string, attentionFrom: number): string {
  const over = readings.flatMap(({ queue, zone }) =>
    zone === 'overflow' && queue.usage !== null && queue.ceiling !== null
      ? [`${queue.name} com ${formatInt(queue.usage)} de ${formatInt(queue.ceiling)}`]
      : [],
  );
  const attention = readings.filter((reading) => reading.zone === 'attention').length;
  const assumed = readings.filter(({ queue }) => queue.ceiling !== null && queue.ceilingSource === 'premissa').length;
  return [
    `Gráfico de bullets com ${formatInt(readings.length)} filas contra o próprio teto em ${formatMonthLong(month)}.`,
    over.length === 0 ? 'Nenhuma passou do teto.' : `${formatInt(over.length)} acima do teto: ${over.join(' e ')}.`,
    `${formatInt(attention)} em atenção a partir de ${formatPercent(attentionFrom, 0)} do teto; ${formatInt(assumed)} dos tetos são premissa.`,
  ].join(' ');
}

const STATUS_TONE: Record<Zone, string> = {
  overflow: 'text-negative',
  attention: 'text-warning',
  comfort: 'text-text-muted',
};

export default function CapacityBullets({
  data = defaultData,
  month = defaultMonth,
  attentionFrom = defaultAttentionFrom,
  className,
}: CapacityBulletsProps) {
  const baseId = useId().replace(/:/g, '');

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma fila neste recorte: não há uso para comparar com o teto.</span>
      </div>
    );
  }

  const readings = data.map((queue) => readQueue(queue, attentionFrom));
  const scaleMax = commonScale(readings);
  const summary = summaryOf(readings, month, attentionFrom);
  const hasAnyCeiling = readings.some(({ queue }) => queue.ceiling !== null && queue.ceiling > 0);

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col tabular-nums', className)} role="figure">
      <div className={ROW_GRID}>
        {readings.map((reading, index) => {
          const { queue, zone } = reading;
          const slack = queue.usage !== null && queue.ceiling !== null && queue.ceiling > 0 ? queue.ceiling - queue.usage : null;
          return (
            <div className="contents" key={queue.id}>
              <div className="min-w-0">
                <p className="text-xs leading-4 font-medium text-text-secondary">{queue.name}</p>
                <p className="text-[0.6875rem] leading-4 text-text-muted">{ceilingText(queue)}</p>
              </div>
              <div className="relative min-w-0">
                {index === 0 && hasAnyCeiling ? (
                  // Um rótulo só para a coluna: a escala é comum, então o teto cai na mesma vertical em todas as linhas.
                  <div aria-hidden className="absolute inset-x-0 -top-4 h-3 text-[0.6875rem] leading-3 text-text-muted">
                    <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap" style={{ left: at(1, scaleMax) }}>
                      100% do teto
                    </span>
                  </div>
                ) : null}
                <Bullet attentionFrom={attentionFrom} hatchId={`${baseId}-${queue.id}`} reading={reading} scaleMax={scaleMax} />
              </div>
              <div className="text-right">
                <p className="text-xs leading-4 text-text-muted">
                  {queue.usage === null ? (
                    formatUnavailable()
                  ) : (
                    <>
                      <span className="kpi-number text-sm leading-4 font-semibold text-text-primary">{formatInt(queue.usage)}</span>
                      {queue.ceiling !== null && queue.ceiling > 0 ? ` de ${formatInt(queue.ceiling)}` : ` ${queue.unit}`}
                    </>
                  )}
                </p>
                <p className={cn('flex items-center justify-end gap-1 text-[0.6875rem] leading-4', zone ? STATUS_TONE[zone] : 'text-text-muted')}>
                  {queue.usage === null ? (
                    <>
                      <Unplug aria-hidden className="size-3 shrink-0" />
                      <span>sem coleta no mês</span>
                    </>
                  ) : slack === null ? (
                    <span>sem teto, sem julgamento</span>
                  ) : zone === 'overflow' ? (
                    <>
                      <TriangleAlert aria-hidden className="size-3 shrink-0" strokeWidth={2.5} />
                      <span className="font-semibold">estouro de {formatInt(-slack)}</span>
                    </>
                  ) : zone === 'attention' ? (
                    <>
                      <CircleAlert aria-hidden className="size-3 shrink-0" strokeWidth={2.5} />
                      <span className="font-semibold">atenção, folga de {formatInt(slack)}</span>
                    </>
                  ) : (
                    <span>folga de {formatInt(slack)}</span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[0.6875rem] leading-4 text-text-muted">
        Escala comum em percentual do próprio teto de {formatMonthShort(month)}, de 0 a {formatPercent(scaleMax, 0)}. Conforto abaixo de{' '}
        {formatPercent(attentionFrom, 0)}, atenção de {formatPercent(attentionFrom, 0)} ao teto e estouro além dele, em hachura. Teto medido vem da
        vazão real; teto premissa, de planilha sem medição.
      </p>
    </figure>
  );
}
