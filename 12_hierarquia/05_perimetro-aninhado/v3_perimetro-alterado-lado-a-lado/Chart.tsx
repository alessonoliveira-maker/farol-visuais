import { formatCurrencyCompact, formatDecimal, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PerimeterChangeData, type PerimeterLevel, type Provenance } from './data';

/**
 * Dois perímetros aninhados lado a lado, na mesma escala de área: o lado de cada quadrado sai da raiz
 * quadrada do valor sobre o MESMO maior valor dos dois quadros, então o quadro da direita nasce maior
 * porque o mercado dele é maior, e não porque ganhou um quadro próprio. A participação em reais é a
 * mesma nos dois, e o percentual cai só porque o denominador cresceu. HTML com Tailwind; nenhum SVG,
 * porque a forma inteira é geometria de caixa.
 */
export interface PerimeterChangeProps {
  readonly data?: PerimeterChangeData;
  readonly height?: number;
  readonly className?: string;
}

const BOX = 200;
const BOX_GAP = 24;
const LIST_GAP = 28;
const LIST = 380;
/** Coluna de valor da lista, com folga sobre os 63 px de tinta de `R$ 138,0 bi` em Space Grotesk. */
const VALUE_COL = 96;
/** Linha de rótulo acima dos quadros, o vão até eles e a linha de participação abaixo. */
const HEADER = 16;
const BOX_TOP = HEADER + 4;
const SHARE_GAP = 6;
const SHARE_ROW = 16;
const SECOND_LEFT = BOX + BOX_GAP;
const LIST_LEFT = SECOND_LEFT + BOX + LIST_GAP;
const CONTENT_WIDTH = LIST_LEFT + LIST;
const CONTENT_HEIGHT = BOX_TOP + BOX + SHARE_GAP + SHARE_ROW;
/** O nível que serve de denominador da participação, e o nível de destaque. */
const REACHABLE_INDEX = 2;
const SHARE_INDEX = 3;
/** Um todo tem 100 pontos percentuais: é o que transforma a queda de participação em p.p. */
const POINTS_IN_WHOLE = 100;

/**
 * Estilo por nível, do mais amplo ao mais estreito, na mesma régua da `v1`: um hue só, `--chart-1`
 * (COR-1), com o contorno firmando até o preenchimento do destaque.
 */
const LEVEL_VISUAL: readonly string[] = [
  'border border-dashed border-chart-1',
  'border border-chart-1',
  'border-2 border-chart-1',
  'bg-chart-1',
];
const DEFAULT_VISUAL = 'border border-chart-1';
/** Contorno de separação na cor da superfície, para o destaque não encostar no traço de cima (COR-5). */
const SEPARATION = 'shadow-[0_0_0_1.5px_var(--surface-raised)]';
const SMALL_TEXT = 'text-[0.6875rem] leading-none text-text-muted tabular-nums';
const VALUE_TEXT = 'kpi-number shrink-0 text-right text-xs font-medium text-text-secondary';

const PROVENANCE_LABEL: Record<Provenance, string> = {
  medido: 'medido',
  derivado: 'derivado',
  premissa: 'premissa',
};

const PROVENANCE_CLASS: Record<Provenance, string> = {
  medido: 'text-prov-medido',
  derivado: 'text-prov-derivado',
  premissa: 'text-prov-premissa',
};

/** Lado do quadrado em px: raiz quadrada da razão de valor, para a área ser proporcional ao valor. */
function sidePx(value: number, base: number, box: number): number {
  if (base <= 0) return 0;
  return Math.sqrt(value / base) * box;
}

/** Fração de um valor sobre outro; `null` quando a base não existe, porque ali a razão não existe. */
function share(value: number, base: number): number | null {
  if (base <= 0) return null;
  return value / base;
}

function shareText(value: number, base: number): string {
  const fraction = share(value, base);
  return fraction === null ? formatUnavailable() : formatPercent(fraction, 1);
}

/** Pontos percentuais com a unidade escrita, para a queda não sair lida como taxa (DAD-4). */
function pointsText(points: number): string {
  return `${formatDecimal(Math.abs(points), 1)} p.p.`;
}

interface Panel {
  readonly id: string;
  readonly label: string;
  readonly left: number;
  /** Qual dos dois recortes este quadro desenha. */
  readonly pick: (level: PerimeterLevel) => number;
}

export default function PerimeterChange({ data = defaultData, height, className }: PerimeterChangeProps) {
  const reachable = data.levels[REACHABLE_INDEX];
  const ours = data.levels[SHARE_INDEX];
  /**
   * Base ÚNICA para os dois quadros: o maior valor que aparece em qualquer um dos dois recortes. É o
   * que põe os dois na mesma escala de área, e é a razão de o quadro da esquerda nascer menor. Semente
   * em zero no `reduce`, para a base nunca sair de uma lista vazia como `-Infinity` (EST-1b).
   */
  const base = data.levels.reduce((largest, level) => Math.max(largest, level.before, level.after), 0);

  const beforeShare = share(ours.before, reachable.before);
  const afterShare = share(ours.after, reachable.after);
  const dropPoints = beforeShare === null || afterShare === null ? null : (beforeShare - afterShare) * POINTS_IN_WHOLE;

  const beforeShareText = shareText(ours.before, reachable.before);
  const afterShareText = shareText(ours.after, reachable.after);
  const growthText = formatCurrencyCompact(reachable.after - reachable.before);
  const dropText = dropPoints === null ? formatUnavailable() : pointsText(dropPoints);

  const panels: readonly Panel[] = [
    { id: 'antes', label: data.beforeLabel, left: 0, pick: (level) => level.before },
    { id: 'depois', label: data.afterLabel, left: SECOND_LEFT, pick: (level) => level.after },
  ];

  const summary = `Perímetro aninhado em dois recortes na mesma escala: a participação segue em ${formatCurrencyCompact(ours.before)} nos dois, o alcançável vai de ${formatCurrencyCompact(reachable.before)} para ${formatCurrencyCompact(reachable.after)} e a participação cai de ${beforeShareText} para ${afterShareText}, ${dropText} só pelo denominador.`;

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="text-xs text-text-secondary tabular-nums" style={{ width: CONTENT_WIDTH }}>
        A participação em reais não muda,{' '}
        <span className="kpi-number font-semibold text-text-primary">{formatCurrencyCompact(ours.before)}</span>; o alcançável cresce{' '}
        <span className="kpi-number font-semibold text-text-primary">{growthText}</span> e a participação cai de {beforeShareText} para{' '}
        <span className="kpi-number font-semibold text-text-primary">{afterShareText}</span>, ou {dropText}
      </p>

      <div className="relative shrink-0" style={{ height: CONTENT_HEIGHT, width: CONTENT_WIDTH }}>
        {panels.map((panel) => (
          <div key={panel.id}>
            <p className={cn('absolute top-0', SMALL_TEXT)} style={{ left: panel.left }}>
              {panel.label}
            </p>
            <div aria-hidden className="absolute" style={{ height: BOX, left: panel.left, top: BOX_TOP, width: BOX }}>
              {data.levels.map((level, index) => {
                const size = sidePx(panel.pick(level), base, BOX);
                return (
                  <div
                    className={cn('absolute bottom-0 left-0', LEVEL_VISUAL[index] ?? DEFAULT_VISUAL, index === SHARE_INDEX && SEPARATION)}
                    key={level.id}
                    style={{ height: size, width: size }}
                  />
                );
              })}
            </div>
            <p
              className="absolute text-[0.6875rem] leading-none text-text-secondary tabular-nums"
              style={{ left: panel.left, top: BOX_TOP + BOX + SHARE_GAP, width: BOX }}
            >
              participação{' '}
              <span className="kpi-number font-semibold text-text-primary">{shareText(panel.pick(ours), panel.pick(reachable))}</span> do
              alcançável
            </p>
          </div>
        ))}

        <ul className="absolute flex flex-col justify-center gap-2" style={{ height: BOX, left: LIST_LEFT, top: BOX_TOP, width: LIST }}>
          <li className="flex items-baseline gap-2">
            <span className="min-w-0 flex-1" />
            {panels.map((panel) => (
              <span className={cn('shrink-0 text-right', SMALL_TEXT)} key={panel.id} style={{ width: VALUE_COL }}>
                {panel.label}
              </span>
            ))}
          </li>
          {data.levels.map((level, index) => (
            <li className="flex flex-col gap-1" key={level.id}>
              <div className="flex items-baseline gap-2">
                <span className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span aria-hidden className={cn('size-2.5 shrink-0', LEVEL_VISUAL[index] ?? DEFAULT_VISUAL)} />
                  <span className={cn('text-xs', index === SHARE_INDEX ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                    {level.label}
                  </span>
                </span>
                {panels.map((panel) => (
                  <span className={cn(VALUE_TEXT, index === SHARE_INDEX && 'font-semibold text-text-primary')} key={panel.id} style={{ width: VALUE_COL }}>
                    {formatCurrencyCompact(panel.pick(level))}
                  </span>
                ))}
              </div>
              <span className={cn('pl-4', SMALL_TEXT, PROVENANCE_CLASS[level.provenance])}>
                {PROVENANCE_LABEL[level.provenance]}, {level.source}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className={cn('leading-snug', SMALL_TEXT)} style={{ width: CONTENT_WIDTH }}>
        {data.changeNote}
      </p>
    </figure>
  );
}
