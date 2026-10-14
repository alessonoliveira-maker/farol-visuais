import { ArrowDown, ArrowUp, Filter, Minus } from 'lucide-react';
import type { ReactElement } from 'react';
import { ResponsiveContainer, Treemap, type TreemapNode } from 'recharts';

import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CampaignCost } from './data';

/**
 * Treemap de dois canais: a área é o investimento da campanha no mês e a cor é o sentido da
 * variação do custo por lead qualificado, invertida, porque subir o CPL é piorar. A magnitude da
 * variação não mora na cor: os tokens do Farol não têm rampa divergente e a rampa sequencial só
 * tem três degraus acima do piso de contraste, então quem carrega a faixa é a posição fixa na
 * régua, o nome escrito da faixa e o número com sinal na própria célula. Célula que não comporta
 * nome e número juntos fica muda e é identificada na lista fora do gráfico.
 */
export interface CampaignCostTreemapProps {
  readonly data?: readonly CampaignCost[];
  readonly height?: number;
  readonly className?: string;
}

/** Piora: custo subindo é o ruim da métrica (COR-6). Mede 5,50:1 e 6,36:1 contra o cartão. */
const WORSE_FILL = 'var(--negative)';
/** Melhora: custo caindo. Mede 7,36:1 e 5,34:1 contra o cartão. */
const BETTER_FILL = 'var(--positive)';
/** Estável: neutro de dado da 17.2, 5,21:1 e 5,37:1 contra o cartão. */
const STABLE_FILL = 'var(--text-muted)';
/** Ausência de base: contorno sem preenchimento, o papel de ausência da 17.2. */
const MISSING_STROKE = 'var(--text-muted)';
/** Texto vazado na cor do cartão sobre marca cheia: 5,50:1, 7,36:1 e 5,21:1 nos três preenchimentos. */
const FILLED_TEXT = 'var(--surface-raised)';
/** Texto sobre a célula vazada, que tem o cartão atrás: 8,16:1 e 8,13:1. */
const HOLLOW_TEXT = 'var(--text-secondary)';

/** Limites da escala invertida, em fração da variação do CPL. */
const WORSE_STRONG = 0.3;
const WORSE_MILD = 0.1;
const BETTER_MILD = -0.1;
const BETTER_STRONG = -0.3;
/**
 * Teto simétrico da régua. Campanha além do teto entra na faixa da ponta e o número escrito na
 * célula continua o real: cortar o número no teto seria reportar errado a variação medida.
 */
const SCALE_CAP = 0.5;
/**
 * Piso de participação no investimento abaixo do qual a célula nunca recebe rótulo, mesmo se a
 * geometria permitir. Não há opacidade menor aqui: `fillOpacity` derruba a marca abaixo dos 3:1
 * da WCAG 1.4.11 (ACE-5), e o recuo de ênfase é a célula muda mais o nome na linha de rodapé.
 */
const SMALL_SHARE = 0.01;

/** Largura mínima (px) para a célula tentar caber nome e número. */
const MIN_LABEL_WIDTH = 64;
/** Altura mínima (px) para a célula tentar caber nome e número. */
const MIN_LABEL_HEIGHT = 36;
const CELL_PADDING = 8;
const CELL_RADIUS = 4;
const CELL_GAP = 2;
const HOLLOW_STROKE_WIDTH = 1;
/**
 * Largura por caractere a 12 px, superestimada de propósito: rótulo que transborda a célula cai
 * sobre a vizinha e nenhuma guarda mede texto contra retângulo, enquanto rótulo escondido é
 * coberto pela lista de identificação. A tabela do contrato mede 0,526 em em minúscula de Manrope
 * e 0,590 em em dígito de Space Grotesk, e estes números ficam acima disso.
 */
const NAME_CHAR_WIDTH = 6.6;
const VALUE_CHAR_WIDTH = 7.2;
const LABEL_LINE_HEIGHT = 16;
const FIRST_LINE_OFFSET = 18;
const LAST_LINE_MARGIN = 2;
const MAX_NAME_LINES = 2;
/** NUM-1: variação inteira a partir de 10%, com uma casa decimal abaixo disso. */
const INTEGER_VARIATION_FLOOR = 0.1;
/** Sinal de menos tipográfico (U+2212), nunca hífen (seção 8, NUM-3). */
const MINUS_SIGN = '−';

type BandId = 'piora-forte' | 'piora-leve' | 'estavel' | 'melhora-leve' | 'melhora-forte' | 'sem-base';

interface Band {
  readonly id: BandId;
  /** Nome escrito da faixa: é ele, e não o degrau de cor, que carrega a magnitude. */
  readonly label: string;
  readonly fill: string | null;
}

/** Régua ordenada da pior para a melhor faixa. A ordem da lista é a ordem da leitura. */
const BANDS: readonly Band[] = [
  { id: 'piora-forte', label: 'piora de 30% ou mais', fill: WORSE_FILL },
  { id: 'piora-leve', label: 'piora de 10% a 30%', fill: WORSE_FILL },
  { id: 'estavel', label: 'estável, até 10%', fill: STABLE_FILL },
  { id: 'melhora-leve', label: 'melhora de 10% a 30%', fill: BETTER_FILL },
  { id: 'melhora-forte', label: 'melhora de 30% ou mais', fill: BETTER_FILL },
  { id: 'sem-base', label: 'sem 2026-07 medido', fill: null },
];

/** Variação do CPL contra o próprio mês anterior. `null` sem base medida (EST-4). */
function variationOf(row: CampaignCost): number | null {
  const base = row.cplQualifiedPrevious;
  if (base === null || base === 0) {
    return null;
  }
  return (row.cplQualified - base) / base;
}

/** Faixa da campanha na régua invertida. */
function bandOf(row: CampaignCost): BandId {
  const variation = variationOf(row);
  if (variation === null) {
    return 'sem-base';
  }
  if (variation >= WORSE_STRONG) {
    return 'piora-forte';
  }
  if (variation >= WORSE_MILD) {
    return 'piora-leve';
  }
  if (variation > BETTER_MILD) {
    return 'estavel';
  }
  return variation > BETTER_STRONG ? 'melhora-leve' : 'melhora-forte';
}

function fillOfBand(band: BandId): string | null {
  return BANDS.find((entry) => entry.id === band)?.fill ?? null;
}

/** Investimento somado do recorte. `null` em lista vazia, nunca zero (EST-1b). */
function sumInvestment(rows: readonly CampaignCost[]): number | null {
  if (rows.length === 0) {
    return null;
  }
  return rows.reduce((sum, row) => sum + row.investment, 0);
}

/** Participação de uma parte no todo. `null` quando não há todo a dividir. */
function shareOf(part: number, whole: number | null): number | null {
  if (whole === null || whole === 0) {
    return null;
  }
  return part / whole;
}

/**
 * A campanha de maior piora medida, que é o extremo da régua vindo do dado e não de constante
 * (ROT-5b). `Math.max` sobre lista vazia devolveria infinito, então a busca é por varredura.
 */
function worstCampaign(rows: readonly CampaignCost[]): CampaignCost | null {
  let worst: CampaignCost | null = null;
  let worstVariation: number | null = null;
  for (const row of rows) {
    const variation = variationOf(row);
    if (variation === null) {
      continue;
    }
    if (worstVariation === null || variation > worstVariation) {
      worst = row;
      worstVariation = variation;
    }
  }
  return worst;
}

/** Variação com sinal tipográfico sobre o valor absoluto (NUM-3) e precisão da NUM-1. */
function formatVariation(fraction: number): string {
  const digits = Math.abs(fraction) >= INTEGER_VARIATION_FLOOR ? 0 : 1;
  const sign = fraction < 0 ? MINUS_SIGN : '+';
  return `${sign}${formatPercent(Math.abs(fraction), digits)}`;
}

function fitsWidth(text: string, width: number, charWidth: number): boolean {
  return text.length * charWidth <= width - CELL_PADDING * 2;
}

function requiredHeight(lineCount: number): number {
  return FIRST_LINE_OFFSET + (lineCount - 1) * LABEL_LINE_HEIGHT + LAST_LINE_MARGIN;
}

/**
 * O nome é a identidade da célula e nunca sai cortado por reticência (TIP-7): quebra em duas
 * linhas por palavra inteira, e quando nem isso cabe devolve `null` para a célula ficar muda,
 * porque a seção 5 proíbe contar com `overflow` para esconder o que vaza.
 */
function wrapName(name: string, width: number): readonly string[] | null {
  if (fitsWidth(name, width, NAME_CHAR_WIDTH)) {
    return [name];
  }
  const words = name.split(' ');
  if (words.length < MAX_NAME_LINES) {
    return null;
  }
  let best: { lines: readonly [string, string]; balance: number } | null = null;
  for (let index = 1; index < words.length; index++) {
    const first = words.slice(0, index).join(' ');
    const second = words.slice(index).join(' ');
    if (fitsWidth(first, width, NAME_CHAR_WIDTH) && fitsWidth(second, width, NAME_CHAR_WIDTH)) {
      const balance = Math.abs(first.length - second.length);
      if (best === null || balance < best.balance) {
        best = { lines: [first, second], balance };
      }
    }
  }
  return best === null ? null : best.lines;
}

interface CellText {
  readonly nameLines: readonly string[];
  readonly numberLines: readonly string[];
}

/**
 * Nome e investimento são avaliados como par (ROT-10): a célula ou mostra os dois ou fica muda.
 * A variação é a terceira linha e só entra quando sobra altura; ela nunca aparece sozinha,
 * porque o número que identifica a parte no todo é o investimento, que a área codifica.
 */
function measureCellText(
  name: string,
  valueText: string,
  variationText: string,
  width: number,
  cellHeight: number,
): CellText | null {
  if (width < MIN_LABEL_WIDTH || cellHeight < MIN_LABEL_HEIGHT) {
    return null;
  }
  if (!fitsWidth(valueText, width, VALUE_CHAR_WIDTH) || !fitsWidth(variationText, width, VALUE_CHAR_WIDTH)) {
    return null;
  }
  const nameLines = wrapName(name, width);
  if (nameLines === null) {
    return null;
  }
  if (cellHeight >= requiredHeight(nameLines.length + 2)) {
    return { nameLines, numberLines: [valueText, variationText] };
  }
  if (cellHeight >= requiredHeight(nameLines.length + 1)) {
    return { nameLines, numberLines: [valueText] };
  }
  return null;
}

export default function CampaignCostTreemap({ data = defaultData, height, className }: CampaignCostTreemapProps) {
  const drawn = data.filter((row) => row.investment > 0);
  const style = height === undefined ? undefined : { height };

  if (drawn.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha com investimento neste recorte: não houve verba para dividir na área.</span>
      </div>
    );
  }

  const total = sumInvestment(drawn);
  const totalText = total === null ? '' : formatCurrencyCompact(total);
  const worsened = drawn.filter((row) => bandOf(row) === 'piora-forte' || bandOf(row) === 'piora-leve');
  const worsenedTotal = sumInvestment(worsened);
  const worsenedShare = worsenedTotal === null ? null : shareOf(worsenedTotal, total);
  const worsenedShareText = worsenedShare === null ? '' : formatPercent(worsenedShare, 0);
  const worst = worstCampaign(drawn);
  const worstVariation = worst === null ? null : variationOf(worst);
  const worstText = worstVariation === null ? '' : formatVariation(worstVariation);
  const capText = formatPercent(SCALE_CAP, 0);

  const smallCampaigns = drawn.filter((row) => {
    const share = shareOf(row.investment, total);
    return share !== null && share < SMALL_SHARE;
  });

  const reading =
    totalText === '' || worsenedShareText === ''
      ? null
      : `Subir o CPL qualificado é pior: ${formatInt(worsened.length)} das ${formatInt(drawn.length)} campanhas pioraram, com ${worsenedShareText} dos ${totalText} de ago/26.`;
  /** O extremo da régua vem do dado, nunca de constante (ROT-5b). */
  const scaleCaption =
    worst === null || worstText === ''
      ? `Faixas da variação do CPL qualificado, régua simétrica de ±${capText}.`
      : `Faixas da variação do CPL qualificado, régua simétrica de ±${capText}; o extremo medido é ${worstText}, em ${worst.name}.`;

  const smallSentence =
    smallCampaigns.length === 0
      ? null
      : `Abaixo de 1% do investimento, e por isso sem rótulo na célula: ${smallCampaigns
          .map((row) => `${row.name}, ${formatCurrencyCompact(row.investment)}`)
          .join('; ')}.`;

  const summary = `Treemap de ${formatInt(drawn.length)} campanhas em ago/26: a área é o investimento e a cor é o sentido da variação do CPL qualificado, invertida. ${formatInt(worsened.length)} pioraram e levam ${worsenedShareText} dos ${totalText}; a pior é ${worst?.name ?? ''}, com ${worstText}.`;

  function renderCell({ x, y, width, height: cellHeight, depth, name, value, ...rest }: TreemapNode): ReactElement {
    if (depth === 0) {
      // Fundo do canvas inteiro: é o que aparece no vão que CELL_GAP abre entre as células.
      return <rect fill="var(--surface-raised)" height={cellHeight} rx={CELL_RADIUS} width={width} x={x} y={y} />;
    }
    const id = typeof rest.id === 'string' ? rest.id : '';
    const row = drawn.find((entry) => entry.id === id);
    const band = row === undefined ? 'sem-base' : bandOf(row);
    const fill = fillOfBand(band);
    const variation = row === undefined ? null : variationOf(row);
    const share = shareOf(value, total);
    const isSmall = share !== null && share < SMALL_SHARE;
    const text = isSmall
      ? null
      : measureCellText(name, formatCurrencyCompact(value), variation === null ? 'sem base' : formatVariation(variation), width, cellHeight);
    const lines = text === null ? [] : [...text.nameLines, ...text.numberLines];
    const nameCount = text === null ? 0 : text.nameLines.length;
    return (
      <g>
        <rect
          fill={fill ?? 'none'}
          height={cellHeight}
          rx={CELL_RADIUS}
          stroke={fill === null ? MISSING_STROKE : undefined}
          strokeWidth={fill === null ? HOLLOW_STROKE_WIDTH : undefined}
          width={width}
          x={x}
          y={y}
        />
        {lines.map((line, index) => (
          <text
            className={index < nameCount ? 'font-sans' : 'font-display'}
            fill={fill === null ? HOLLOW_TEXT : FILLED_TEXT}
            fontSize={12}
            fontWeight={index < nameCount ? 500 : 600}
            key={`${id}-${String(index)}`}
            x={x + CELL_PADDING}
            y={y + FIRST_LINE_OFFSET + index * LABEL_LINE_HEIGHT}
          >
            {line}
          </text>
        ))}
      </g>
    );
  }

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {reading === null ? null : (
        <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
          {reading}
        </p>
      )}
      {/* Régua da variação: a ordem da lista é a ordem das faixas, da pior para a melhor, e o nome
          escrito de cada faixa é o que carrega a magnitude, porque não existe rampa divergente nos
          tokens do Farol (TOK-3) e a sequencial não tem cinco degraus acima do piso (TOK-8). */}
      <p className="shrink-0 text-[0.6875rem] text-text-muted">{scaleCaption}</p>
      <ul className="mb-2 mt-1 grid shrink-0 grid-cols-3 gap-x-4 gap-y-1">
        {BANDS.map((band) => {
          const rows = drawn.filter((row) => bandOf(row) === band.id);
          const bandTotal = sumInvestment(rows);
          const bandShare = bandTotal === null ? null : shareOf(bandTotal, total);
          return (
            <li className="flex min-w-0 items-center gap-1.5 text-[0.6875rem]" key={band.id}>
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-sm"
                style={
                  band.fill === null
                    ? { borderColor: MISSING_STROKE, borderStyle: 'solid', borderWidth: 1 }
                    : { backgroundColor: band.fill }
                }
              />
              <span className="min-w-0 text-text-secondary">{band.label}</span>
              <span className="ml-auto shrink-0 font-display text-text-primary">
                {`${formatInt(rows.length)} ${rows.length === 1 ? 'campanha' : 'campanhas'}`}
              </span>
              <span className="shrink-0 font-display text-text-muted">
                {bandShare === null ? '' : formatPercent(bandShare, 0)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <Treemap
            aspectRatio={1}
            content={renderCell}
            data={drawn}
            dataKey="investment"
            isAnimationActive={false}
            nameKey="name"
            nodeGap={CELL_GAP}
          />
        </ResponsiveContainer>
      </div>
      {/* Identificação de toda campanha desenhada (ROT-10): a dica não conta, e a célula muda por
          geometria precisa de nome e número em algum lugar do desenho parado. */}
      <ul className="mt-2 grid shrink-0 grid-cols-3 gap-x-4 gap-y-1">
        {drawn.map((row) => {
          const variation = variationOf(row);
          const band = bandOf(row);
          const fill = fillOfBand(band);
          return (
            <li className="flex min-w-0 items-center gap-1.5 text-[0.6875rem]" key={row.id}>
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-sm"
                style={
                  fill === null
                    ? { borderColor: MISSING_STROKE, borderStyle: 'solid', borderWidth: 1 }
                    : { backgroundColor: fill }
                }
              />
              <span className="min-w-0 text-text-secondary">{row.name}</span>
              <span className="ml-auto shrink-0 font-display text-text-primary">
                {formatCurrencyCompact(row.investment)}
              </span>
              {variation === null ? (
                <span className="shrink-0 text-text-muted">sem base</span>
              ) : (
                <span className="flex shrink-0 items-center gap-0.5 font-display" style={{ color: fill ?? undefined }}>
                  {band === 'estavel' ? (
                    <Minus aria-hidden className="size-3" />
                  ) : variation > 0 ? (
                    <ArrowUp aria-hidden className="size-3" />
                  ) : (
                    <ArrowDown aria-hidden className="size-3" />
                  )}
                  {formatVariation(variation)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {smallSentence === null ? null : (
        <p className="mt-1 shrink-0 text-[0.6875rem] text-text-muted">{smallSentence}</p>
      )}
    </div>
  );
}
