import { formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, MEASURES, OBSERVATIONS } from './data';

/**
 * Heatmap de correlação: matriz de medidas por medidas com o coeficiente em cada célula. Três
 * decisões separam um correlograma honesto de um enfeite.
 *
 * A escala é divergente e centrada em zero, nunca sequencial: correlação tem sinal, e uma rampa de
 * um matiz só faz `-0,71` parecer mais fraco que `0,44`. O Farol ainda não tem tokens divergentes
 * próprios, então a cor é composta entre `--negative`, `--surface-overlay` e `--positive`.
 *
 * Só o triângulo inferior é desenhado, porque a matriz é simétrica e a diagonal vale sempre 1. E o
 * número de observações fica escrito na legenda, porque coeficiente sem n é opinião: com 10 semanas
 * qualquer par parece relacionado.
 *
 * Os dois eixos levam o nome da medida, e nenhum leva número. O triângulo inferior descarta a
 * primeira linha e a última coluna, então numerar as colunas deixava a primeira medida sem nome em
 * lugar nenhum do cartão, e ela é justamente a que a pergunta do cartão persegue.
 */
export interface CorrelationHeatmapProps {
  readonly data?: readonly (readonly number[])[];
  readonly observations?: number;
  readonly height?: number;
  readonly className?: string;
}

const CELL_W = 70;
const CELL_H = 50;
const GAP = 2;
const LEFT_W = 104;
const TOP_H = 32;
/** Altura de uma linha do cabeçalho, para o nome que precisa de duas. */
const HEAD_LINE = 14;
/** Acima deste módulo a relação é forte o bastante para o número entrar em peso 600. */
const STRONG = 0.6;
/**
 * Largura média de um caractere em 11 px, medida neste preview: 84 px para os 17 caracteres de
 * "CPL qualificado" com o número na frente. SVG puro não mede texto, então a quebra do cabeçalho
 * se decide por esta constante.
 */
const CHAR_W = 4.95;
/** O que cabe numa linha do cabeçalho, com 5 px de respiro de cada lado da célula. */
const HEAD_CHARS = Math.floor((CELL_W - 10) / CHAR_W);

/**
 * Nome da coluna em até duas linhas, quebrado por palavra inteira. Reticência é proibida em nome
 * de marca desenhada (TIP-7), então o que não cabe desce de linha em vez de sumir.
 */
function headLines(label: string): readonly string[] {
  const lines: string[] = [];
  for (const word of label.split(' ')) {
    const current = lines[lines.length - 1];
    if (current === undefined || current.length + 1 + word.length > HEAD_CHARS) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = `${current} ${word}`;
    }
  }
  return lines;
}

/**
 * Cor divergente composta: quanto mais longe de zero, mais saturada a ponta correspondente. O zero
 * fica no neutro da superfície, e não num tom claro de uma das pontas.
 */
function cellFill(value: number): string {
  const intensity = Math.round(Math.min(1, Math.abs(value)) * 100);
  const edge = value >= 0 ? 'var(--positive)' : 'var(--negative)';
  return `color-mix(in oklab, ${edge} ${String(intensity)}%, var(--surface-overlay))`;
}

/**
 * O número não escolhe cor pelo valor: a cor da célula é uma mistura em CSS e SVG puro não mede a
 * luminância dela, então qualquer limiar pelo coeficiente erra em um dos temas. O número assenta
 * numa pastilha de `--surface-sunken` com `--text-primary`, o par do poço do cartão, e o contraste
 * deixa de depender do fundo da célula.
 */
const CHIP_W = 42;
const CHIP_H = 22;

export default function CorrelationHeatmap({
  data = defaultData,
  observations = OBSERVATIONS,
  height,
  className,
}: CorrelationHeatmapProps) {
  const rows = data.length;
  const columns = rows;

  const pairs = data.flatMap((row, rowIndex) =>
    row.map((value, columnIndex) => ({
      value,
      from: MEASURES[rowIndex + 1]?.label ?? '',
      to: MEASURES[columnIndex]?.label ?? '',
    })),
  );
  const strongest = pairs.reduce<(typeof pairs)[number] | null>(
    (best, pair) => (best === null || Math.abs(pair.value) > Math.abs(best.value) ? pair : best),
    null,
  );
  const weakest = pairs.reduce<(typeof pairs)[number] | null>(
    (worst, pair) => (worst === null || Math.abs(pair.value) < Math.abs(worst.value) ? pair : worst),
    null,
  );

  const summary =
    strongest === null || weakest === null
      ? 'Matriz de correlação sem par para medir.'
      : `Correlação entre ${formatInt(MEASURES.length)} medidas semanais de mídia em ${formatInt(observations)} semanas. ` +
        `O par mais forte é ${strongest.from} com ${strongest.to}, em ${formatDecimal(strongest.value, 2)}. ` +
        `O mais fraco é ${weakest.from} com ${weakest.to}, em ${formatDecimal(weakest.value, 2)}.`;

  const viewWidth = LEFT_W + columns * (CELL_W + GAP) - GAP;
  const viewHeight = TOP_H + rows * (CELL_H + GAP) - GAP;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <svg aria-hidden className="h-full max-w-full" viewBox={`0 0 ${String(viewWidth)} ${String(viewHeight)}`}>
          {/* Cada coluna leva o nome da medida, não o número dela. Com número, o triângulo inferior
              descarta a primeira linha e a última coluna e a medida 1 fica sem nome em lugar nenhum
              do cartão, justamente a que o subtítulo pergunta (GEO-13). */}
          {MEASURES.slice(0, columns).map((measure, columnIndex) => {
            const lines = headLines(measure.label);
            return (
              <g key={measure.id}>
                {lines.map((line, lineIndex) => (
                  <text
                    fill="var(--text-secondary)"
                    fontSize={11}
                    key={`${measure.id}-${String(lineIndex)}`}
                    textAnchor="middle"
                    x={LEFT_W + columnIndex * (CELL_W + GAP) + CELL_W / 2}
                    y={TOP_H - 5 - (lines.length - 1 - lineIndex) * HEAD_LINE}
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}

          {data.map((row, rowIndex) => {
            const measure = MEASURES[rowIndex + 1];
            const y = TOP_H + rowIndex * (CELL_H + GAP);
            return (
              <g key={measure?.id ?? rowIndex}>
                <text
                  dominantBaseline="central"
                  fill="var(--text-secondary)"
                  fontSize={11}
                  textAnchor="end"
                  x={LEFT_W - 8}
                  y={y + CELL_H / 2}
                >
                  {measure?.label ?? ''}
                </text>
                {row.map((value, columnIndex) => {
                  const x = LEFT_W + columnIndex * (CELL_W + GAP);
                  const strong = Math.abs(value) >= STRONG;
                  return (
                    <g key={`${String(rowIndex)}-${String(columnIndex)}`}>
                      <rect fill={cellFill(value)} height={CELL_H} rx={2} width={CELL_W} x={x} y={y} />
                      <rect
                        fill="var(--surface-sunken)"
                        height={CHIP_H}
                        rx={4}
                        width={CHIP_W}
                        x={x + (CELL_W - CHIP_W) / 2}
                        y={y + (CELL_H - CHIP_H) / 2}
                      />
                      <text
                        className={cn('font-display tabular-nums', strong && 'font-semibold')}
                        dominantBaseline="central"
                        fill="var(--text-primary)"
                        fontSize={12}
                        textAnchor="middle"
                        x={x + CELL_W / 2}
                        y={y + CELL_H / 2}
                      >
                        {formatDecimal(value, 2)}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="font-display tabular-nums">{formatDecimal(-1, 2)}</span>
          <span
            className="h-3 w-24 rounded-[2px]"
            style={{
              backgroundImage:
                'linear-gradient(to right, var(--negative), var(--surface-overlay) 50%, var(--positive))',
            }}
          />
          <span className="font-display tabular-nums">{formatDecimal(1, 2)}</span>
        </span>
        <span className="tabular-nums">{`Pearson sobre ${formatInt(observations)} semanas fechadas`}</span>
        <span>triângulo inferior: a matriz é simétrica</span>
        <span>correlação não é causa</span>
      </div>
    </figure>
  );
}
