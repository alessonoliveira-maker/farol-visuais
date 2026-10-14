import { Filter, Pause, Play } from 'lucide-react';
import { useEffect, useId, useRef, useState, type RefObject } from 'react';

import { CHART_ANIMATION_MS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { campaigns, data as defaultData, type CampaignId, type CampaignRacePeriod } from './data';

/**
 * Corrida de barras em SVG puro com as 12 campanhas sempre desenhadas, mas só as 10 primeiras do
 * ranking do mês em opacidade plena; da 11ª em diante a marca fica em opacidade reduzida, abaixo
 * de uma linha tracejada que demarca o topo 10. A opacidade anima por transição CSS junto da
 * posição, então uma campanha some e volta ao topo sem barra piscando e sem nada sair da área do
 * corpo. Mês sem coleta não interpola como zero: o componente carrega o último valor conhecido,
 * desenha a marca com textura listrada e escreve "sem coleta" ao lado do número. O componente
 * monta parado no último mês, que é também o quadro que o preview retrata; o botão de reprodução
 * refaz a corrida inteira a partir do primeiro mês.
 */
export interface CampaignRaceProps {
  /** Um item por mês, na ordem cronológica. O componente não reordena os períodos. */
  readonly data?: readonly CampaignRacePeriod[];
  readonly height?: number;
  readonly className?: string;
}

const TOTAL_CAMPAIGNS = campaigns.length;
/** Só as 10 primeiras do ranking ficam em opacidade plena; as demais, abaixo da linha do topo. */
const TOP_LIMIT = 10;
const RANK_WIDTH = 20;
/** Reserva para o rótulo de campanha: cobre "Conteúdo patrocinado em rede social B2B" sem reticência (TIP-7). */
const NAME_WIDTH = 310;
/** Reserva para "205 leads · sem coleta" na ponta livre da barra. */
const RIGHT_MARGIN = 172;
const VALUE_LABEL_GAP = 6;
/** Fração da faixa ocupada pela marca; o resto é respiro entre campanhas (ESP-2). */
const BAR_FRACTION = 0.6;
const HIGHLIGHT_FILL = 'var(--chart-1)';
/** Neutro de dado: só é permitido porque o valor está escrito ao lado de cada marca. */
const NEUTRAL_FILL = 'var(--line-strong)';
/**
 * Opacidade só da marca (o `rect`) de quem está fora do topo 10; nunca do texto, para posição,
 * nome e valor manterem o contraste aprovado da tabela 17.10 nos dois temas (ACE-3, ACE-4).
 */
const OUT_OF_TOP_OPACITY = 0.32;
/** Tamanho antes da primeira medição real do contêiner; o layout final vem do ResizeObserver. */
const FALLBACK_SIZE = { width: 900, height: 274 } as const;
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

interface RankedCampaign {
  readonly id: CampaignId;
  readonly label: string;
  readonly value: number;
  readonly frozen: boolean;
  readonly rank: number;
}

/**
 * Usa o valor do mês corrente; se for `null` (sem coleta), busca o último valor não nulo nos
 * meses anteriores e marca `frozen`. Empate resolvido pelo nome, para a ordem não oscilar à toa.
 */
function rankFrame(history: readonly CampaignRacePeriod[], frameIndex: number): RankedCampaign[] {
  const current = history[frameIndex];
  if (!current) return [];
  const rows = campaigns.map((campaign) => {
    const raw = current.values[campaign.id];
    if (raw !== null) return { frozen: false, id: campaign.id, label: campaign.label, value: raw };
    for (let i = frameIndex - 1; i >= 0; i -= 1) {
      const past = history[i]?.values[campaign.id];
      if (past !== undefined && past !== null) {
        return { frozen: true, id: campaign.id, label: campaign.label, value: past };
      }
    }
    return { frozen: true, id: campaign.id, label: campaign.label, value: 0 };
  });
  return rows
    .slice()
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR'))
    .map((row, index) => ({ ...row, rank: index }));
}

export default function CampaignRace({ data = defaultData, height, className }: CampaignRaceProps) {
  const stripeId = useId();
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
  const ranked = rankFrame(data, safeIndex);
  const domainMax = Math.max(1, ...ranked.map((row) => row.value)) * 1.08;
  const barAreaWidth = Math.max(40, size.width - NAME_WIDTH - RIGHT_MARGIN);
  const rowStep = size.height / TOTAL_CAMPAIGNS;
  const barHeight = Math.max(9, rowStep * BAR_FRACTION);
  const boundaryY = TOP_LIMIT * rowStep;
  const leader = ranked[0];
  const frozenNow = ranked.filter((row) => row.frozen && row.rank < TOP_LIMIT);

  const togglePlay = () => {
    if (reducedMotion) return;
    setPlaying((wasPlaying) => {
      if (wasPlaying) return false;
      if (frameIndex >= data.length - 1) setFrameIndex(0);
      return true;
    });
  };

  const summary = [
    `Corrida de barras horizontais com ${String(TOTAL_CAMPAIGNS)} campanhas mês a mês, de ${formatMonthShort(firstFrame.period)} a ${formatMonthShort(lastFrame.period)}, com campanhas entrando e saindo do topo 10.`,
    `Quadro parado em ${formatMonthShort(currentFrame.period)}.`,
    leader ? `Lidera ${leader.label}, com ${formatInt(leader.value)} leads.` : '',
    frozenNow.length > 0 ? `${frozenNow.map((row) => row.label).join(', ')} sem coleta neste mês, mantendo o último valor conhecido.` : '',
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
          <defs>
            <pattern height={6} id={stripeId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={6}>
              <rect fill="var(--surface-raised)" height={6} width={6} />
              <rect fill="var(--line-strong)" height={6} width={2} />
            </pattern>
          </defs>
          <line stroke="var(--text-muted)" strokeDasharray="3 3" x1={0} x2={size.width} y1={boundaryY} y2={boundaryY} />
          <text className="font-display" dominantBaseline="auto" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={size.width} y={boundaryY - 4}>
            {`Topo ${formatInt(TOP_LIMIT)}`}
          </text>
          {ranked.map((row) => {
            const barWidth = (row.value / domainMax) * barAreaWidth;
            const isLeader = row.rank === 0;
            const inTop = row.rank < TOP_LIMIT;
            const rowOpacity = inTop ? 1 : OUT_OF_TOP_OPACITY;
            const positionTransition = `transform ${String(CHART_ANIMATION_MS)}ms ease`;
            const barTransition = `width ${String(CHART_ANIMATION_MS)}ms ease, opacity ${String(CHART_ANIMATION_MS)}ms ease`;
            const valueText = `${formatInt(row.value)} leads${row.frozen ? ' · sem coleta' : ''}`;
            return (
              <g key={row.id} style={{ transform: `translateY(${String(row.rank * rowStep)}px)`, transition: positionTransition }}>
                <text dominantBaseline="central" fill={isLeader ? 'var(--chart-1)' : 'var(--text-muted)'} fontSize={11} fontWeight={500} x={0} y={rowStep / 2}>
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
                  fill={row.frozen ? `url(#${stripeId})` : isLeader ? HIGHLIGHT_FILL : NEUTRAL_FILL}
                  height={barHeight}
                  opacity={rowOpacity}
                  rx={3}
                  style={{ transition: barTransition }}
                  width={barWidth}
                  x={NAME_WIDTH}
                  y={(rowStep - barHeight) / 2}
                />
                <g style={{ transform: `translate(${String(NAME_WIDTH + barWidth)}px, 0)`, transition: positionTransition }}>
                  <text
                    className="font-display"
                    dominantBaseline="central"
                    fill={isLeader ? 'var(--text-primary)' : 'var(--text-secondary)'}
                    fontSize={12}
                    fontWeight={isLeader ? 700 : 500}
                    x={VALUE_LABEL_GAP}
                    y={rowStep / 2}
                  >
                    {valueText}
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
