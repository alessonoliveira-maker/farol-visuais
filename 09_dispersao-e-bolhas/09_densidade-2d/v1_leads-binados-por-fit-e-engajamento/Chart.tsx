import { Filter } from 'lucide-react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, totalCaption as defaultCaption, type FitEngagementBin } from './data';

/**
 * Densidade 2D em grade regular: cada célula é um cruzamento de faixa de fit e de faixa de
 * engajamento, e o círculo que a representa tem área proporcional à contagem de leads que caíram
 * ali. A grade (bordas e número de faixas) é fixa em TypeScript porque precisa continuar igual
 * entre filtros para a comparação valer; a geometria de cada célula (posição, raio) é calculada
 * aqui, em SVG puro. Célula sem lead simplesmente não aparece no dado e não recebe círculo:
 * ausência é ausência, nunca zero desenhado.
 */
export interface FitEngagementDensityProps {
  readonly data?: readonly FitEngagementBin[];
  /** O que a contagem mede e em que período, escrito depois do total ("leads do semestre"). */
  readonly caption?: string;
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 574;
const VIEW_H = 234;
const MARGIN = { top: 40, right: 16, bottom: 40, left: 46 } as const;
/** Bordas fixas da grade (ponto delicado do modelo): 10 faixas de 10 pontos por eixo, sobre
 * pontuação de 0 a 100. Mudar isto entre recortes invalida a comparação célula a célula. */
const GRID_SIZE = 10;
const BIN_WIDTH = 100 / GRID_SIZE;
const TICKS = [0, 20, 40, 60, 80, 100] as const;
/** Área em px²: piso para a menor célula não sumir, teto para células vizinhas não se fundirem. */
const AREA_MIN = 10;
const AREA_MAX = 280;
const CELL_FILL = 'var(--chart-1)';
/**
 * Referências intermediárias da legenda de tamanho. A de cima nunca é constante: é a maior célula
 * do recorte, calculada em `legendValues`. Com as três fixas em 10, 100 e 350 a régua parava em 350
 * enquanto a maior célula tinha 395 leads, e a bolha que carrega a conclusão ficava justamente fora
 * da régua, maior que qualquer círculo da legenda (conserto de 2026-09-25).
 */
const LEGEND_REFERENCES = [10, 100] as const;
const LEGEND_ROW_HEIGHT = 28;
/** Vão do gráfico até a legenda lateral (17.7, ESP-1): faixa de 24 a 28 px, aqui no teto. */
const LEGEND_GAP = 28;

/** As referências abaixo do máximo, mais o máximo do recorte: a régua sempre cobre a maior bolha. */
function legendValues(maxCount: number): readonly number[] {
  return [...LEGEND_REFERENCES.filter((value) => value < maxCount), maxCount];
}

function radiusPorContagem(count: number, maxCount: number): number {
  const area = AREA_MIN + (count / maxCount) * (AREA_MAX - AREA_MIN);
  return Math.sqrt(area / Math.PI);
}

export default function FitEngagementDensity({ data = defaultData, caption = defaultCaption, height, className }: FitEngagementDensityProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte com fit e engajamento pontuados: a grade não tem o que contar.</span>
      </div>
    );
  }

  const plotSize = VIEW_H - MARGIN.top - MARGIN.bottom;
  const total = data.reduce((sum, bin) => sum + bin.count, 0);
  const maxCount = Math.max(...data.map((bin) => bin.count));
  const legendRows = legendValues(maxCount);
  const leader = data.reduce((best, bin) => (bin.count > best.count ? bin : best), data[0]!);

  const scaleFit = (value: number) => MARGIN.left + (value / 100) * plotSize;
  const scaleEng = (value: number) => MARGIN.top + plotSize - (value / 100) * plotSize;

  const leaderFitDe = leader.fitBin * BIN_WIDTH;
  const leaderEngDe = leader.engajamentoBin * BIN_WIDTH;
  const readingLine =
    `Maior concentração: fit de ${formatInt(leaderFitDe)} a ${formatInt(leaderFitDe + BIN_WIDTH)} e engajamento de ` +
    `${formatInt(leaderEngDe)} a ${formatInt(leaderEngDe + BIN_WIDTH)}, ${formatInt(leader.count)} leads (${formatPercent(leader.count / total, 1)} do total)`;
  const summary =
    `Gráfico de densidade em grade com ${String(data.length)} células preenchidas de ${String(GRID_SIZE * GRID_SIZE)} possíveis, ` +
    `${formatInt(total)} ${caption} por faixa de fit e de engajamento. ${readingLine}.`;

  return (
    <svg aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style} viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
      {/* Linha de leitura (ANO-5): a conclusão calculada do dado; a frase acessível já diz o mesmo. */}
      <text aria-hidden className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={12} x={MARGIN.left} y={13}>
        {readingLine}
      </text>
      <text aria-hidden className="font-sans tabular-nums" fill="var(--text-muted)" fontSize={11} x={MARGIN.left} y={28}>
        Engajamento, 0 a 100 ↑
      </text>

      {/* Grade nos dois sentidos (EIX-3, exceção da família): fit e engajamento são as duas grandezas lidas. */}
      {TICKS.map((tick) => {
        const x = scaleFit(tick);
        const y = scaleEng(tick);
        return (
          <g key={`grid-${String(tick)}`}>
            <line stroke="var(--line-subtle)" x1={x} x2={x} y1={MARGIN.top} y2={MARGIN.top + plotSize} />
            <line stroke="var(--line-subtle)" x1={MARGIN.left} x2={MARGIN.left + plotSize} y1={y} y2={y} />
            <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={x} y={MARGIN.top + plotSize + 16}>
              {formatInt(tick)}
            </text>
          </g>
        );
      })}
      <text aria-hidden className="font-sans tabular-nums" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={MARGIN.left + plotSize / 2} y={VIEW_H - 6}>
        Fit, 0 a 100 →
      </text>

      {/* Círculo por célula não vazia (ponto delicado): célula ausente do dado não entra aqui. */}
      {data.map((bin) => {
        const cx = scaleFit(bin.fitBin * BIN_WIDTH + BIN_WIDTH / 2);
        const cy = scaleEng(bin.engajamentoBin * BIN_WIDTH + BIN_WIDTH / 2);
        return (
          <circle
            cx={cx}
            cy={cy}
            fill={CELL_FILL}
            key={`${String(bin.fitBin)}-${String(bin.engajamentoBin)}`}
            r={radiusPorContagem(bin.count, maxCount)}
            stroke="var(--surface-raised)"
            strokeWidth={1}
          />
        );
      })}

      {/* Legenda de tamanho (ROT-4): área é a pior lida das três medidas, por isso mais de uma
          referência, e a última é o máximo do recorte, para a maior bolha ter régua. */}
      <g transform={`translate(${String(MARGIN.left + plotSize + LEGEND_GAP)}, ${String(MARGIN.top + 6)})`}>
        <text className="font-sans" fill="var(--text-secondary)" fontSize={12} x={0} y={0}>
          Leads na célula
        </text>
        {legendRows.map((value, index) => {
          const rowY = 24 + index * LEGEND_ROW_HEIGHT;
          return (
            <g key={value}>
              <circle cx={14} cy={rowY} fill={CELL_FILL} r={radiusPorContagem(value, maxCount)} stroke="var(--surface-raised)" strokeWidth={1} />
              <text className="kpi-number" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={34} y={rowY}>
                {formatInt(value)}
              </text>
            </g>
          );
        })}
        <text className="kpi-number font-semibold" fill="var(--text-primary)" fontSize={14} x={0} y={24 + legendRows.length * LEGEND_ROW_HEIGHT + 20}>
          {formatInt(total)}
        </text>
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={0} y={24 + legendRows.length * LEGEND_ROW_HEIGHT + 36}>
          {caption}
        </text>
      </g>
    </svg>
  );
}
