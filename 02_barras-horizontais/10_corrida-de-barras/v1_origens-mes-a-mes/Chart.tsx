import { Filter, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState, type RefObject } from 'react';

import { CHART_ANIMATION_MS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, origins, type OriginId, type OriginRacePeriod } from './data';

/**
 * Corrida de barras em SVG puro: a posição vertical de cada origem vem do índice no ranking do
 * mês corrente, e um `<g>` por origem (chave pela categoria, nunca pelo índice) anima
 * `transform: translateY` e a largura da marca por transição CSS quando o quadro muda. Por
 * padrão o componente monta parado no último mês, que é também o quadro que o preview retrata;
 * o botão de reprodução refaz a corrida inteira a partir do primeiro mês.
 */
export interface OriginRaceProps {
  /** Um item por mês, na ordem cronológica. O componente não reordena os períodos. */
  readonly data?: readonly OriginRacePeriod[];
  readonly height?: number;
  readonly className?: string;
}

const TOP_N = origins.length;
const RANK_WIDTH = 20;
/** Reserva para o rótulo de origem: cobre "Referência de contador ou advogado" sem reticência (TIP-7). */
const NAME_WIDTH = 258;
/** Reserva para "NN leads" na ponta livre da barra. */
const RIGHT_MARGIN = 92;
const VALUE_LABEL_GAP = 6;
/** Fração da faixa ocupada pela marca; o resto é respiro entre origens (ESP-2). */
const BAR_FRACTION = 0.6;
const HIGHLIGHT_FILL = 'var(--chart-1)';
/** Neutro de dado: só é permitido porque o valor está escrito ao lado de cada marca. */
const NEUTRAL_FILL = 'var(--line-strong)';
/** Tamanho antes da primeira medição real do contêiner; o layout final vem do ResizeObserver. */
const FALLBACK_SIZE = { width: 720, height: 260 } as const;
/** Cada quadro fica visível por isso antes de avançar sozinho durante a reprodução. */
const STEP_MS = 900;

function useMeasuredSize(ref: RefObject<HTMLDivElement | null>): { readonly width: number; readonly height: number } {
  const [size, setSize] = useState<{ width: number; height: number }>(FALLBACK_SIZE);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [ref]);
  return size;
}

/** Quem pediu menos movimento no sistema não recebe a corrida, só o quadro final. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };
    query.addEventListener('change', onChange);
    return () => {
      query.removeEventListener('change', onChange);
    };
  }, []);
  return reduced;
}

interface RankedOrigin {
  readonly id: OriginId;
  readonly label: string;
  readonly value: number;
  readonly rank: number;
}

/** Ordena o quadro do mês por valor; empate resolvido pelo nome, para a ordem não oscilar à toa. */
function rankFrame(frame: OriginRacePeriod): RankedOrigin[] {
  return origins
    .map((origin) => ({ id: origin.id, label: origin.label, value: frame.values[origin.id] }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR'))
    .map((row, index) => ({ ...row, rank: index }));
}

export default function OriginRace({ data = defaultData, height, className }: OriginRaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useMeasuredSize(containerRef);
  const reducedMotion = usePrefersReducedMotion();
  const [frameIndex, setFrameIndex] = useState(() => Math.max(0, data.length - 1));
  const [playing, setPlaying] = useState(false);
  const style = height === undefined ? undefined : { height };

  const firstFrame = data[0];
  const lastFrame = data[data.length - 1];

  useEffect(() => {
    if (!playing) return;
    if (frameIndex >= data.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setFrameIndex((current) => Math.min(current + 1, data.length - 1));
    }, STEP_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [playing, frameIndex, data.length]);

  if (!firstFrame || !lastFrame) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há corrida para desenhar.</span>
      </div>
    );
  }

  const safeIndex = Math.min(frameIndex, data.length - 1);
  const currentFrame = data[safeIndex] ?? lastFrame;
  const ranked = rankFrame(currentFrame);
  const domainMax = Math.max(1, ...ranked.map((row) => row.value)) * 1.08;
  const barAreaWidth = Math.max(40, size.width - NAME_WIDTH - RIGHT_MARGIN);
  const rowStep = size.height / TOP_N;
  const barHeight = Math.max(10, rowStep * BAR_FRACTION);
  const leader = ranked[0];
  const runnerUp = ranked[1];

  const togglePlay = () => {
    if (reducedMotion) return;
    setPlaying((wasPlaying) => {
      if (wasPlaying) return false;
      if (frameIndex >= data.length - 1) setFrameIndex(0);
      return true;
    });
  };

  const summary = [
    `Corrida de barras horizontais com ${String(origins.length)} origens de lead mês a mês, de ${formatMonthShort(firstFrame.period)} a ${formatMonthShort(lastFrame.period)}.`,
    `Quadro parado em ${formatMonthShort(currentFrame.period)}.`,
    leader ? `Lidera ${leader.label}, com ${formatInt(leader.value)} leads.` : '',
    runnerUp ? `Em 2º, ${runnerUp.label}, com ${formatInt(runnerUp.value)} leads.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
        <button
          aria-label={playing ? 'Pausar a corrida' : 'Reproduzir a corrida desde o início'}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-overlay hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
          disabled={reducedMotion}
          onClick={togglePlay}
          type="button"
        >
          {playing ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
        </button>
        <span aria-hidden className="kpi-number text-3xl leading-none font-semibold text-text-primary">
          {formatMonthShort(currentFrame.period)}
        </span>
      </div>
      <div className="min-h-0 flex-1" ref={containerRef}>
        <svg aria-hidden className="block h-full w-full">
          {ranked.map((row) => {
            const barWidth = (row.value / domainMax) * barAreaWidth;
            const isLeader = row.rank === 0;
            const rowTransition = `transform ${String(CHART_ANIMATION_MS)}ms ease`;
            return (
              <g key={row.id} style={{ transform: `translateY(${String(row.rank * rowStep)}px)`, transition: rowTransition }}>
                <text dominantBaseline="central" fill={isLeader ? 'var(--chart-1)' : 'var(--text-muted)'} fontSize={11} fontWeight={isLeader ? 700 : 500} x={0} y={rowStep / 2}>
                  {formatInt(row.rank + 1)}
                </text>
                <text
                  className="font-sans"
                  dominantBaseline="central"
                  fill={isLeader ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize={12}
                  fontWeight={isLeader ? 700 : 500}
                  x={RANK_WIDTH}
                  y={rowStep / 2}
                >
                  {row.label}
                </text>
                <rect
                  fill={isLeader ? HIGHLIGHT_FILL : NEUTRAL_FILL}
                  height={barHeight}
                  rx={3}
                  style={{ transition: `width ${String(CHART_ANIMATION_MS)}ms ease` }}
                  width={barWidth}
                  x={NAME_WIDTH}
                  y={(rowStep - barHeight) / 2}
                />
                <g style={{ transform: `translate(${String(NAME_WIDTH + barWidth)}px, 0)`, transition: rowTransition }}>
                  <text
                    className="font-display"
                    dominantBaseline="central"
                    fill={isLeader ? 'var(--text-primary)' : 'var(--text-secondary)'}
                    fontSize={12}
                    fontWeight={isLeader ? 700 : 500}
                    x={VALUE_LABEL_GAP}
                    y={rowStep / 2}
                  >
                    {`${formatInt(row.value)} leads`}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
