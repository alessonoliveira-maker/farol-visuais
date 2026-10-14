import { Info } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, stageNames as defaultStageNames, type ExecutiveFunnel } from './data';

/**
 * Um funil pequeno por executivo, em percentual da entrada e na mesma escala de 0 a 100% em
 * todos os painéis, ordenados pela taxa de conversão final. A mediana do time entra como linha
 * de referência, e o painel com poucas oportunidades perde a taxa em vez de fingir precisão.
 */
export interface ExecutivePanelsProps {
  readonly data?: readonly ExecutiveFunnel[];
  readonly stageNames?: readonly string[];
  /** Abaixo deste total de aberturas, o painel some com a taxa (amostra pequena). */
  readonly minReliableOpened?: number;
  readonly height?: number;
  readonly className?: string;
}

interface Row {
  readonly exec: ExecutiveFunnel;
  /**
   * Taxa final em pontos de 0 a 100, ou `null` quando o executivo não abriu nada no recorte: sem
   * denominador a taxa não existe, e 0% é um valor plausível que o painel leria como conversão
   * medida e pior do time.
   */
  readonly finalRate: number | null;
  readonly stageRows: readonly { readonly stage: string; readonly percent: number }[];
}

/** Um executivo com base de cálculo, que é o único que pode entrar na mediana e no desenho. */
interface MeasuredRow extends Row {
  readonly finalRate: number;
}

const BAR_MAX = 10;
const BAR_CATEGORY_GAP = '24%';
const VALUE_LABEL_GAP = 6;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;
const PANEL_MARGIN = { top: 2, right: 30, bottom: 2, left: 0 } as const;

function toRows(data: readonly ExecutiveFunnel[], stageNames: readonly string[]): Row[] {
  return data.map((exec) => {
    const values = [exec.opened, exec.diagnosed, exec.proposed, exec.negotiated, exec.won];
    /* Sem abertura não há percentual de etapa nenhum: a lista sai vazia em vez de sair zerada, que
       desenharia cinco barras rentes ao eixo como se as etapas tivessem sido medidas. */
    const stageRows =
      exec.opened > 0 ? stageNames.map((stage, i) => ({ stage, percent: ((values[i] ?? 0) / exec.opened) * 100 })) : [];
    return { exec, finalRate: exec.opened > 0 ? (exec.won / exec.opened) * 100 : null, stageRows };
  });
}

/**
 * Mediana do time, ou `null` quando ninguém entrou na conta. A guarda precisa testar esta lista, a
 * dos executivos confiáveis, e não `data`: com todo mundo abaixo do mínimo de aberturas, `data` está
 * cheia e a lista da conta está vazia, e a mediana zerada volta como tracejado colado no zero e como
 * "mediana do time, 0%" na linha de leitura.
 */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2 : (sorted[mid] ?? null);
}

export default function ExecutivePanels({
  data = defaultData,
  stageNames = defaultStageNames,
  minReliableOpened = 10,
  height,
  className,
}: ExecutivePanelsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = toRows(data, stageNames);
  /** Confiável é quem tem taxa calculável e passa do mínimo de aberturas, nesta ordem. */
  const isMeasured = (row: Row): row is MeasuredRow =>
    row.finalRate !== null && row.exec.opened >= minReliableOpened;
  const reliable = rows.filter(isMeasured).sort((a, b) => b.finalRate - a.finalRate);
  const unreliable = rows.filter((row) => !isMeasured(row));
  const ordered: readonly Row[] = [...reliable, ...unreliable];
  const teamMedian = median(reliable.map((r) => r.finalRate));
  const teamMedianText = teamMedian === null ? formatUnavailable() : formatPercent(teamMedian / 100);
  const best = reliable[0];
  const worst = reliable[reliable.length - 1];

  const summary =
    `Grade com o funil de ${String(data.length)} executivos em percentual da entrada, ordenados pela conversão final. ` +
    `${best ? `${best.exec.name} lidera com ${formatPercent(best.finalRate / 100)}` : ''}${worst && worst.exec.id !== best?.exec.id ? `; ${worst.exec.name} tem o menor, ${formatPercent(worst.finalRate / 100)}` : ''}. ` +
    `Mediana: ${teamMedianText}. ${unreliable.map((r) => r.exec.name).join(', ')}, com menos de ${String(minReliableOpened)} aberturas, some a taxa.`;

  const renderFinal = (finalRate: number) =>
    function FinalLabel({ x, y, width, height: rowHeight, index }: LabelProps): ReactElement | null {
      if (index !== stageNames.length - 1) return null;
      return (
        <text
          className="font-display"
          dominantBaseline="central"
          fill="var(--text-primary)"
          fontSize={11}
          fontWeight={700}
          style={HALO}
          x={Number(x) + Number(width) + VALUE_LABEL_GAP}
          y={Number(y) + Number(rowHeight) / 2}
        >
          {formatPercent(finalRate / 100)}
        </text>
      );
    };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p className="mb-2 shrink-0 text-xs text-text-secondary">
        Mesma escala de <span className="tabular-nums">0 a 100%</span> em todos os painéis, para comparar taxa e não só forma. Cada painel lê de cima para
        baixo: {stageNames.join(', ')}, em percentual da entrada.{' '}
        {teamMedian === null
          ? `Mediana do time ${formatUnavailable()}: ninguém alcançou o mínimo de aberturas, e o tracejado não entra.`
          : `Tracejado: mediana do time, ${teamMedianText}.`}
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-3">
        {ordered.map((row) => (
          <div className="flex min-h-0 flex-col" key={row.exec.id}>
            <div className="mb-1 flex shrink-0 items-center justify-between text-[11px]">
              <span className={isMeasured(row) ? 'font-medium text-text-primary' : 'text-text-muted'}>{row.exec.name}</span>
              <span className="tabular-nums text-text-muted">n = {formatInt(row.exec.opened)}</span>
            </div>
            {isMeasured(row) ? (
              <div className="min-h-0 flex-1">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...row.stageRows]} layout="vertical" margin={PANEL_MARGIN}>
                    <XAxis domain={[0, 100]} hide type="number" />
                    <YAxis dataKey="stage" hide type="category" width={0} />
                    {teamMedian === null ? null : (
                      <ReferenceLine ifOverflow="extendDomain" stroke="var(--text-muted)" strokeDasharray="3 3" x={teamMedian} />
                    )}
                    <Bar dataKey="percent" fill="var(--chart-1)" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[0, 2, 2, 0]}>
                      <LabelList content={renderFinal(row.finalRate)} dataKey="percent" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-1 items-center gap-1.5 text-[11px] text-text-muted">
                <Info aria-hidden className="size-3 shrink-0" />
                <span>Menos de {formatInt(minReliableOpened)} aberturas: taxa oculta.</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
