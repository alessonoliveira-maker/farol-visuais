import { formatCurrencyCompact, formatDecimal, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ZoomPerimeterData } from './data';

/**
 * Perímetro aninhado com painel ampliado: à esquerda a cascata inteira, com o nível alcançável quase
 * colado ao canto; à direita o mesmo alcançável ocupando um quadro só para ele, onde a participação e
 * a meta finalmente têm tamanho. As duas formas se ligam por um cone de duas linhas finas saindo dos
 * cantos do quadrado ampliado. HTML com Tailwind; o cone é o único SVG, porque linha diagonal é a
 * única coisa aqui que geometria de caixa não desenha.
 */
export interface ZoomPerimeterProps {
  readonly data?: ZoomPerimeterData;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Lado do quadro geral e do painel ampliado, em px. Iguais de propósito: com os dois lados iguais, a
 * ampliação deixa de ser número escrito à mão e passa a sair do dado, porque ela vira a raiz da razão
 * entre o mercado total e o nível ampliado.
 */
const OVERVIEW = 180;
const PANEL = 180;
/** Vão do cone entre os dois quadros, e as folgas da coluna de identificação. */
const CONE = 88;
const LIST_GAP = 28;
const LIST = 300;
/** Linha de rótulo acima de cada quadro, e o vão até ele. */
const HEADER = 16;
const BOX_TOP = HEADER + 4;
/**
 * Faixa de 2 px abaixo da base dos quadros, onde a linha de baixo do cone corre. Sem ela a linha
 * cairia exatamente sobre a borda de baixo dos quadrados, que é desenhada por dentro da caixa: metade
 * do traço ficaria escondida e a outra metade recortada pelo SVG, e o cone chegaria ao painel com
 * meio pixel de tinta.
 */
const BASELINE_DROP = 2;
const PANEL_LEFT = OVERVIEW + CONE;
const LIST_LEFT = PANEL_LEFT + PANEL + LIST_GAP;
const CONTENT_WIDTH = LIST_LEFT + LIST;
const CONTENT_HEIGHT = BOX_TOP + PANEL + BASELINE_DROP;
/** Um todo tem 100 pontos percentuais: é o divisor que transforma o alcançável em reais por ponto. */
const POINTS_IN_WHOLE = 100;
/** O nível que o painel amplia, e o nível de destaque, na ordem fixa do tipo do dado. */
const ZOOM_INDEX = 2;
const SHARE_INDEX = 3;
/** Respiro entre a marca e o rótulo que a nomeia, e o recuo dos textos dentro do painel. */
const LABEL_GAP = 6;
const PANEL_PAD = 8;
/** Meia altura da tinta de 11 px, para centrar o rótulo na aresta que ele nomeia. */
const HALF_LINE = 7;

/**
 * Estilo por nível, do mais amplo ao mais estreito, na mesma régua da `v1`: um hue só, `--chart-1`
 * (COR-1), com o contorno firmando até o preenchimento do destaque. `--chart-1` mede 9,50:1 no escuro
 * e 6,00:1 no claro contra o cartão, então não depende de isenção de contraste.
 */
const LEVEL_VISUAL: readonly string[] = [
  'border border-dashed border-chart-1',
  'border border-chart-1',
  'border-2 border-chart-1',
  'bg-chart-1',
];
const DEFAULT_VISUAL = 'border border-chart-1';
/**
 * A meta é referência, não série: sai do hue do dado e vai para `--text-muted` tracejado, que mede
 * 5,21:1 e 5,37:1 contra o cartão. Tracejado porque ela ainda não aconteceu.
 */
const TARGET_VISUAL = 'border border-dashed border-text-muted';
/** Contorno de separação na cor da superfície: sem ele o destaque encosta no traço do nível acima (COR-5). */
const SEPARATION = 'shadow-[0_0_0_1.5px_var(--surface-raised)]';
const VALUE_TEXT = 'kpi-number shrink-0 text-xs font-medium text-text-secondary';
const SMALL_TEXT = 'text-[0.6875rem] leading-none text-text-muted tabular-nums';

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

/** Pontos percentuais com a unidade escrita, para a distância não sair lida como taxa (DAD-4). */
function pointsText(points: number): string {
  return `${formatDecimal(Math.abs(points), 1)} p.p.`;
}

/**
 * O cone que liga o nível ampliado ao painel: sai dos dois cantos da aresta direita do quadrado de
 * origem e chega aos dois cantos da aresta esquerda do painel. Onde ele passa por trás de um contorno
 * do quadro geral, o contorno pinta em cima e o traço se interrompe, que é a saída da TOK-10 para guia
 * que cruza marca: quebrar a guia em vez de procurar uma cor que sirva nos dois fundos.
 */
function conePaths(zoomSide: number): readonly string[] {
  const baseline = BOX_TOP + PANEL + BASELINE_DROP / 2;
  const corner = BOX_TOP + PANEL - zoomSide;
  return [
    `M ${zoomSide.toFixed(2)} ${corner.toFixed(2)} L ${String(PANEL_LEFT)} ${String(BOX_TOP)}`,
    `M ${zoomSide.toFixed(2)} ${String(baseline)} L ${String(PANEL_LEFT)} ${String(baseline)}`,
  ];
}

export default function ZoomPerimeter({ data = defaultData, height, className }: ZoomPerimeterProps) {
  const base = data.levels[0].value;
  const reachable = data.levels[ZOOM_INDEX];
  const ours = data.levels[SHARE_INDEX];

  /** Lado do nível ampliado dentro do quadro geral: é dele que o cone sai. */
  const zoomSide = sidePx(reachable.value, base, OVERVIEW);
  /** Ampliação medida no desenho, não declarada à mão: o lado do painel sobre o lado de origem. */
  const linear = zoomSide <= 0 ? null : PANEL / zoomSide;
  const currentShare = share(ours.value, reachable.value);
  const gapPoints = currentShare === null ? null : (data.targetShare - currentShare) * POINTS_IN_WHOLE;
  const gapValue = currentShare === null ? null : (data.targetShare - currentShare) * reachable.value;

  const shareText = currentShare === null ? formatUnavailable() : formatPercent(currentShare, 1);
  const targetText = formatPercent(data.targetShare, 1);
  const gapValueText = gapValue === null ? formatUnavailable() : formatCurrencyCompact(gapValue);
  const gapPointsText = gapPoints === null ? formatUnavailable() : pointsText(gapPoints);
  const perPointText = formatCurrencyCompact(reachable.value / POINTS_IN_WHOLE);
  const areaTimesText = linear === null ? formatUnavailable() : formatInt(linear * linear);
  const linearTimesText = linear === null ? formatUnavailable() : formatDecimal(linear, 1);

  const sharePanelSide = currentShare === null ? 0 : Math.sqrt(currentShare) * PANEL;
  const targetPanelSide = Math.sqrt(data.targetShare) * PANEL;

  const summary = `Perímetro aninhado com painel ampliado do nível alcançável, que cresce ${areaTimesText} vezes em área: a participação de ${formatCurrencyCompact(ours.value)} é ${shareText} dos ${formatCurrencyCompact(reachable.value)} alcançáveis, contra a meta de ${targetText}. Faltam ${gapValueText}, ou ${gapPointsText}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="text-xs text-text-secondary tabular-nums" style={{ width: CONTENT_WIDTH }}>
        Cada ponto percentual do alcançável vale{' '}
        <span className="kpi-number font-semibold text-text-primary">{perPointText}</span>, e faltam{' '}
        <span className="kpi-number font-semibold text-text-primary">{gapValueText}</span>, ou{' '}
        <span className="kpi-number font-semibold text-text-primary">{gapPointsText}</span>, para a meta de {targetText}.
      </p>

      <div className="relative shrink-0" style={{ height: CONTENT_HEIGHT, width: CONTENT_WIDTH }}>
        <svg aria-hidden className="absolute inset-0" height={CONTENT_HEIGHT} width={CONTENT_WIDTH}>
          {conePaths(zoomSide).map((path) => (
            <path d={path} fill="none" key={path} stroke="var(--text-muted)" strokeWidth={1} />
          ))}
        </svg>

        <p className={cn('absolute left-0 top-0', SMALL_TEXT)}>perímetro inteiro</p>
        <p className={cn('absolute top-0', SMALL_TEXT)} style={{ left: PANEL_LEFT }}>
          alcançável ampliado
        </p>

        <div aria-hidden className="absolute left-0" style={{ height: OVERVIEW, top: BOX_TOP, width: OVERVIEW }}>
          {data.levels.map((level, index) => {
            const size = sidePx(level.value, base, OVERVIEW);
            return (
              <div
                className={cn('absolute bottom-0 left-0', LEVEL_VISUAL[index] ?? DEFAULT_VISUAL, index === SHARE_INDEX && SEPARATION)}
                key={level.id}
                style={{ height: size, width: size }}
              />
            );
          })}
        </div>

        <div
          className={cn('absolute', LEVEL_VISUAL[ZOOM_INDEX] ?? DEFAULT_VISUAL)}
          style={{ height: PANEL, left: PANEL_LEFT, top: BOX_TOP, width: PANEL }}
        >
          <div aria-hidden className="absolute flex flex-col gap-1" style={{ left: PANEL_PAD, top: PANEL_PAD }}>
            <span className={SMALL_TEXT}>lado {linearTimesText} vezes</span>
            <span className={SMALL_TEXT}>área {areaTimesText} vezes</span>
          </div>
          <div aria-hidden className={cn('absolute bottom-0 left-0', TARGET_VISUAL)} style={{ height: targetPanelSide, width: targetPanelSide }} />
          <div
            aria-hidden
            className={cn('absolute bottom-0 left-0', LEVEL_VISUAL[SHARE_INDEX] ?? DEFAULT_VISUAL, SEPARATION)}
            style={{ height: sharePanelSide, width: sharePanelSide }}
          />
          <p
            className={cn('absolute flex items-center gap-1', SMALL_TEXT)}
            style={{ left: targetPanelSide + LABEL_GAP, top: PANEL - targetPanelSide - HALF_LINE }}
          >
            <span aria-hidden className={cn('size-2 shrink-0', TARGET_VISUAL)} />
            meta {targetText}
          </p>
          <p
            className="absolute flex items-center gap-1 text-[0.6875rem] leading-none font-semibold text-text-primary"
            style={{ left: targetPanelSide + LABEL_GAP, top: PANEL - sharePanelSide / 2 - HALF_LINE }}
          >
            <span aria-hidden className={cn('size-2 shrink-0', LEVEL_VISUAL[SHARE_INDEX] ?? DEFAULT_VISUAL)} />
            nosso {shareText}
          </p>
        </div>

        <ul className="absolute flex flex-col justify-center gap-1.5" style={{ height: PANEL, left: LIST_LEFT, top: BOX_TOP, width: LIST }}>
          {data.levels.map((level, index) => (
            <li className="flex items-center justify-between gap-2" key={level.id}>
              <span className="flex min-w-0 items-center gap-1.5">
                <span aria-hidden className={cn('size-2.5 shrink-0', LEVEL_VISUAL[index] ?? DEFAULT_VISUAL)} />
                <span className={cn('text-xs', index === SHARE_INDEX ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                  {level.label}
                </span>
              </span>
              <span className={cn(VALUE_TEXT, index === SHARE_INDEX && 'font-bold text-text-primary')}>{formatCurrencyCompact(level.value)}</span>
            </li>
          ))}
          <li className="mt-4 flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5">
              <span aria-hidden className={cn('size-2.5 shrink-0', TARGET_VISUAL)} />
              <span className="text-xs font-medium text-text-secondary">Meta de participação</span>
            </span>
            <span className={VALUE_TEXT}>{formatCurrencyCompact(data.targetShare * reachable.value)}</span>
          </li>
        </ul>
      </div>

      <p className={cn('leading-snug', SMALL_TEXT)} style={{ width: CONTENT_WIDTH }}>
        {data.perimeterNote}
      </p>
    </figure>
  );
}
