import { Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MissingLevelPerimeterData, type PerimeterLevel, type Provenance } from './data';

/**
 * Perímetro aninhado com um nível sem estimativa. Os níveis medidos ficam no lado que o valor deles
 * manda, pela raiz quadrada da razão; o nível ausente não ganha lado, porque lado é valor: ele aparece
 * como contorno tracejado no único limite que se conhece, o nível acima, e o percentual que dependia
 * dele sai por `formatUnavailable()`. HTML com Tailwind; nenhum SVG, porque a forma é geometria de
 * caixa.
 */
export interface MissingLevelPerimeterProps {
  readonly data?: MissingLevelPerimeterData;
  readonly height?: number;
  readonly className?: string;
}

const BOX = 200;
const LIST_GAP = 24;
const LIST = 340;
/** Coluna de valor da lista: cabe `R$ 120,0 bi` em Space Grotesk e o par de ícone e palavra da ausência. */
const VALUE_COL = 96;
const CONTENT_WIDTH = BOX + LIST_GAP + LIST;
const CONTENT_HEIGHT = BOX;
const SHARE_INDEX = 3;
/** O nível imediatamente acima da participação, que é o denominador dela: aqui, o alcançável. */
const DENOMINATOR_INDEX = 2;
/** Respiro entre o contorno do limite e o rótulo que o nomeia, à direita dele. */
const LABEL_GAP = 8;
/**
 * Recuo do contorno do limite para dentro do nível acima, em px. É acabamento, não valor: sem ele o
 * tracejado cairia exatamente sobre a borda do nível acima e os dois contornos se anulariam na tela. O
 * contorno marca o limite do nível ausente, nunca o tamanho dele, e o texto ao lado diz isso.
 */
const BOUND_INSET = 4;

/**
 * Estilo por nível, do mais amplo ao mais estreito, na mesma régua da `v1`: um hue só, `--chart-1`
 * (COR-1), com o contorno firmando até o preenchimento do destaque. O nível sem estimativa não entra
 * nesta lista, porque ele não é um degrau da escala: ele é o vazio dentro dela.
 */
const LEVEL_VISUAL: readonly string[] = [
  'border border-dashed border-chart-1',
  'border border-chart-1',
  'border-2 border-chart-1',
  'bg-chart-1',
];
const DEFAULT_VISUAL = 'border border-chart-1';
/**
 * Contorno do limite do nível ausente: tracejado em `--text-muted`, o par que a ACE-8 aprova como
 * contorno de ausência (5,21:1 e 5,37:1). Nunca vermelho, que a EST-2 proíbe; quem diz lacuna é o selo.
 */
const BOUND_VISUAL = 'border border-dashed border-text-muted';
/** Contorno de separação na cor da superfície, para o destaque não encostar no traço de cima (COR-5). */
const SEPARATION = 'shadow-[0_0_0_1.5px_var(--surface-raised)]';
const SMALL_TEXT = 'text-[0.6875rem] leading-none text-text-muted tabular-nums';

const PROVENANCE_LABEL: Record<Provenance, string> = {
  medido: 'medido',
  derivado: 'derivado',
  lacuna: 'lacuna',
};

const PROVENANCE_CLASS: Record<Provenance, string> = {
  medido: 'text-prov-medido',
  derivado: 'text-prov-derivado',
  lacuna: 'text-prov-lacuna',
};

/** Lado do quadrado em px: raiz quadrada da razão de valor, para a área ser proporcional ao valor. */
function sidePx(value: number, base: number, box: number): number {
  if (base <= 0) return 0;
  return Math.sqrt(value / base) * box;
}

/** Valor do nível, ou o rótulo único de ausência quando o nível não tem medição (EST-2). */
function valueText(level: PerimeterLevel): string {
  const value = level.value;
  return value === undefined ? formatUnavailable() : formatCurrencyCompact(value);
}

export default function MissingLevelPerimeter({ data = defaultData, height, className }: MissingLevelPerimeterProps) {
  /**
   * Base da escala: o maior valor medido da cascata. O `reduce` com semente em zero existe porque o
   * nível ausente não tem valor a comparar, e porque base tirada de lista vazia sairia como
   * `-Infinity`, que chegaria ao desenho como número (EST-1b).
   */
  const base = data.levels.reduce((largest, level) => (level.value === undefined ? largest : Math.max(largest, level.value)), 0);

  /** O nível sem estimativa e o nível imediatamente acima dele, que é o limite conhecido. */
  const missingIndex = data.levels.findIndex((level) => level.value === undefined);
  const missingLevel = missingIndex < 0 ? undefined : data.levels.at(missingIndex);
  const boundLevel = missingIndex <= 0 ? undefined : data.levels.at(missingIndex - 1);
  const boundValue = boundLevel?.value;
  const boundSide = boundValue === undefined ? null : Math.max(0, sidePx(boundValue, base, BOX) - BOUND_INSET * 2);

  const ours = data.levels[SHARE_INDEX];
  /**
   * Participação sobre o nível imediatamente acima dela. Quando esse nível não tem valor, a razão não
   * existe: o que vai para a tela é o rótulo de ausência, nunca zero e nunca um percentual calculado
   * sobre o limite conhecido, que seria a ausência virando número (DAD-2).
   */
  const denominator = data.levels[DENOMINATOR_INDEX].value;
  const shareValue = denominator === undefined || denominator <= 0 || ours.value === undefined ? null : ours.value / denominator;
  const shareText = shareValue === null ? formatUnavailable() : formatPercent(shareValue, 1);

  const measured = data.levels.flatMap((level, index) => {
    const value = level.value;
    if (value === undefined) return [];
    return [{ id: level.id, index, side: sidePx(value, base, BOX) }];
  });

  const summary = `Perímetro aninhado com o ${missingLevel === undefined ? 'perímetro inteiro medido' : missingLevel.label.toLowerCase()} sem estimativa: mercado total de ${valueText(data.levels[0])}, endereçável de ${valueText(data.levels[1])} e participação de ${valueText(ours)} medidos; o percentual da participação sai como ${shareText}, por falta de denominador.`;

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="text-xs text-text-secondary tabular-nums" style={{ width: CONTENT_WIDTH }}>
        Sem o {missingLevel === undefined ? 'perímetro' : missingLevel.label.toLowerCase()} medido, os{' '}
        <span className="kpi-number font-semibold text-text-primary">{valueText(ours)}</span> de participação não têm denominador.
      </p>

      <div className="relative shrink-0" style={{ height: CONTENT_HEIGHT, width: CONTENT_WIDTH }}>
        <div aria-hidden className="absolute left-0 top-0" style={{ height: BOX, width: BOX }}>
          {measured.map((shape) => (
            <div
              className={cn('absolute bottom-0 left-0', LEVEL_VISUAL[shape.index] ?? DEFAULT_VISUAL, shape.index === SHARE_INDEX && SEPARATION)}
              key={shape.id}
              style={{ height: shape.side, width: shape.side }}
            />
          ))}
          {boundSide === null ? null : <div className={cn('absolute bottom-0 left-0', BOUND_VISUAL)} style={{ height: boundSide, width: boundSide }} />}
        </div>

        {boundSide === null || missingLevel === undefined ? null : (
          <div
            className="absolute flex flex-col gap-1"
            style={{ left: boundSide + BOUND_INSET * 2 + LABEL_GAP, top: BOX - boundSide - BOUND_INSET * 2 }}
          >
            <span className="text-[0.6875rem] leading-none font-medium text-text-secondary">{missingLevel.label}</span>
            <span className={cn(SMALL_TEXT, PROVENANCE_CLASS[missingLevel.provenance])}>{missingLevel.source}</span>
          </div>
        )}

        <div className="absolute flex flex-col justify-center gap-2" style={{ height: BOX, left: BOX + LIST_GAP, top: 0, width: LIST }}>
          <ul className="flex flex-col gap-2">
            {data.levels.map((level, index) => (
              <li className="flex flex-col gap-1" key={level.id}>
                <div className="flex items-baseline gap-2">
                  <span className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span aria-hidden className={cn('size-2.5 shrink-0', level.value === undefined ? BOUND_VISUAL : LEVEL_VISUAL[index] ?? DEFAULT_VISUAL)} />
                    <span className={cn('text-xs', index === SHARE_INDEX ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                      {level.label}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'flex shrink-0 items-center justify-end gap-1 text-xs',
                      level.value === undefined
                        ? 'text-text-muted'
                        : cn('kpi-number font-medium', index === SHARE_INDEX ? 'font-semibold text-text-primary' : 'text-text-secondary'),
                    )}
                    style={{ width: VALUE_COL }}
                  >
                    {level.value === undefined ? <Unplug aria-hidden className="size-3 shrink-0" /> : null}
                    {valueText(level)}
                  </span>
                </div>
                <span className={cn('pl-4', SMALL_TEXT, PROVENANCE_CLASS[level.provenance])}>
                  {PROVENANCE_LABEL[level.provenance]}, {level.source}
                </span>
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-1 text-[0.6875rem] leading-none text-text-muted">
            <Unplug aria-hidden className="size-3 shrink-0" />
            Participação sobre o {missingLevel === undefined ? 'nível acima' : missingLevel.label.toLowerCase()}: {shareText}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1" style={{ width: CONTENT_WIDTH }}>
        <p className={cn('leading-snug', SMALL_TEXT)}>{data.boundNote}</p>
        <p className={cn('leading-snug', SMALL_TEXT)}>{data.perimeterNote}</p>
      </div>
    </figure>
  );
}
