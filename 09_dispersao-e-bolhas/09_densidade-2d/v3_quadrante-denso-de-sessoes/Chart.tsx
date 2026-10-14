import { Filter } from 'lucide-react';

import { formatInt, formatPercentPoints } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, totalCaption as defaultCaption, type SessionBin } from './data';

/**
 * Quadrante denso: a grade de 24 por 16 conta as sessões e as divisórias do quadrante correm na BORDA
 * de um bin, nunca no meio dele. Isso não é capricho de alinhamento: divisória no meio de uma célula
 * parte a contagem daquela célula entre duas regiões, e nenhuma das duas somas fica verdadeira. Por
 * isso o corte é declarado em ÍNDICE de bin (`COL_SPLIT`, `ROW_SPLIT`) e o pixel sai do índice, em vez
 * de o corte vir do domínio e cair onde cair.
 *
 * Por que a contagem de cada região está no painel e não escrita dentro da região. A primeira versão
 * escrevia as quatro contagens dentro do plano, com halo (ROT-7). A célula desta grade mede 17 por
 * 11 px, e a GEO-4 mede que halo em marca fina apaga a marca inteira: o rótulo da região de maior
 * massa abria um rombo justamente no trecho mais cheio do desenho, que é o que ele deveria deixar ver.
 * A saída da GEO-4 e da GEO-2 é a mesma: em marca fina quem sai do lugar é o TEXTO. Os números foram
 * para uma lista de identificação ao lado (ROT-10), e cada linha dela leva um pictograma de quadrante
 * que diz, sem palavra nenhuma, de que região aquele número é.
 *
 * Por que três degraus de cor, e não os cinco que o catálogo pedia. Medido em 2026-09-28 contra o fundo
 * do cartão, só `--seq-5`, `--seq-6` e `--seq-7` passam de 3:1 nos dois temas (TOK-8): os quatro
 * primeiros degraus ficam entre 1,14:1 e 3,38:1 no escuro e entre 1,21:1 e 2,60:1 no claro, e neste
 * modelo célula invisível não é feiura, é mentira, porque célula não desenhada QUER DIZER nenhuma
 * sessão. Escrever a contagem dentro da célula, que ativaria a isenção da ACE-3, também não cabe. Os
 * três degraus úteis medem 1,42:1 e 1,45:1 ENTRE SI, então a cor sozinha nem ordena; o tamanho da
 * célula repete a faixa e a legenda escreve a contagem de cada uma.
 *
 * E por que os limites são logarítmicos. Numa densidade 2D a distribuição das contagens é
 * violentamente assimétrica: com limites em terços iguais do máximo, 184 das 190 células cairiam na
 * faixa de baixo, e com limites na raiz, 171. Em potências, a divisão sai 51, 120 e 19, que é o que dá
 * alguma informação aos três degraus disponíveis.
 */
export interface SessionQuadrantProps {
  readonly data?: readonly SessionBin[];
  /** O que o total conta e em que período ("sessões do site no mês"). */
  readonly caption?: string;
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 894;
const VIEW_H = 265;
const PLOT_X = 50;
const PLOT_Y = 44;
const GRID_COLS = 24;
const GRID_ROWS = 16;
const CELL_W = 17;
const CELL_H = 11;
/** Vão entre células vizinhas (COR-5): duas células da mesma faixa medem 1,00:1 entre si, então sem
 * este vão a mancha de maior massa vira um bloco sólido e deixa de mostrar quantas células a formam. */
const CELL_GAP = 1.5;
const PLOT_W = CELL_W * GRID_COLS;
const PLOT_H = CELL_H * GRID_ROWS;
/** Domínio de cada eixo, e o passo de bin que sai dele. */
const MINUTES_MAX = 24;
const PAGES_MAX = 32;
const PAGES_PER_ROW = PAGES_MAX / GRID_ROWS;
const TICKS_MINUTES = [0, 6, 12, 18, 24] as const;
const TICKS_PAGES = [8, 16, 24, 32] as const;
/** As divisórias do quadrante, em índice de bin: coluna 6 é o minuto 6, linha 4 é a página 8. */
const COL_SPLIT = 6;
const ROW_SPLIT = 4;
/** Os três degraus que passam de 3:1 contra o cartão nos dois temas (ver o comentário do topo). */
const BAND_COLORS = ['var(--seq-5)', 'var(--seq-6)', 'var(--seq-7)'] as const;
const BAND_NAMES = ['baixa', 'média', 'alta'] as const;
/** Fração do lado da célula por faixa: canal redundante da ordem, não codificação de área. */
const BAND_SIDE = [0.62, 0.81, 1] as const;
const BAND_COUNT = 3;
/**
 * A divisória CARREGA a relação, não é pano de fundo: tapada ela, ninguém sabe onde uma região acaba e
 * a outra começa, e as quatro contagens da lista perdem a referência. Pela ACE-6 isso pede 3:1, e
 * `--line-strong` mede 1,79:1 no escuro e 1,83:1 no claro. `--text-muted` mede 5,21:1 e 5,37:1.
 */
const SPLIT_STROKE = 'var(--text-muted)';
const SPLIT_WIDTH = 1.5;
/** Coluna da lista de identificação das regiões (ROT-10) e coluna da legenda de faixa. */
const LIST_X = 478;
const LIST_NAME_X = 497;
const LIST_RIGHT = 712;
const LIST_ROW_STEP = 24;
const BAND_X = 736;
const BAND_RIGHT = 878;
const SWATCH_W = 16;
const SWATCH_H = 11;
/** Pictograma de quadrante: quatro quadrados de 5 px com 1 px de vão, 11 px no total. */
const GLYPH_SIDE = 5;
const GLYPH_GAP = 1;

interface Region {
  readonly name: string;
  /** O mesmo nome como aparece no meio de uma frase, declarado em vez de calculado. */
  readonly inline: string;
  /** Tempo abaixo da divisória de coluna. */
  readonly quickTime: boolean;
  /** Páginas acima da divisória de linha. */
  readonly manyPages: boolean;
}

const REGIONS: readonly Region[] = [
  { name: 'Varredura rápida', inline: 'varredura rápida', quickTime: true, manyPages: true },
  { name: 'Exploração', inline: 'exploração', quickTime: false, manyPages: true },
  { name: 'Saída rápida', inline: 'saída rápida', quickTime: true, manyPages: false },
  { name: 'Leitura longa', inline: 'leitura longa', quickTime: false, manyPages: false },
];

/** Soma que devolve null em lista vazia (EST-1b): ausência é do tipo, nunca zero. */
function sumOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0);
}

/** Máximo que devolve null em lista vazia: `Math.max` de lista vazia devolve infinito, e infinito desenha. */
function maxOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return Math.max(...values);
}

/**
 * Participações inteiras que somam 100 pelo maior resto (NUM-2). Arredondar cada uma por conta própria
 * soma 99 neste recorte, e uma composição que não fecha põe em dúvida as quatro parcelas.
 */
function sharePoints(values: readonly number[], total: number): readonly number[] {
  const exact = values.map((value) => (value / total) * 100);
  const floors = exact.map((value) => Math.floor(value));
  const missing = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest)
    .slice(0, Math.max(0, missing))
    .map((entry) => entry.index);
  return floors.map((value, index) => (order.includes(index) ? value + 1 : value));
}

/** Limites logarítmicos das três faixas, com a de cima terminando no máximo observado (ROT-5b). */
function bandLimits(maxCount: number): readonly number[] {
  return [Math.round(maxCount ** (1 / BAND_COUNT)), Math.round(maxCount ** (2 / BAND_COUNT)), maxCount];
}

function bandOf(count: number, limits: readonly number[]): number {
  for (let band = 0; band < limits.length; band += 1) {
    const limit = limits[band];
    if (limit !== undefined && count <= limit) return band;
  }
  return limits.length - 1;
}

function matchesRegion(bin: SessionBin, region: Region): boolean {
  return (bin.col < COL_SPLIT) === region.quickTime && (bin.row >= ROW_SPLIT) === region.manyPages;
}

/**
 * Total de uma região, somado com semente 0 de propósito, e este zero não contraria a EST-1b: as quatro
 * regiões existem sempre, porque são o quadrante, e região sem nenhuma célula tem zero sessão MEDIDO
 * (EST-3), não medição ausente. Onde a ausência seria de medida, e não de sessão, quem responde é o
 * `sumOf` acima, que devolve null e leva o visual inteiro para o estado vazio.
 */
function regionTotalOf(data: readonly SessionBin[], region: Region): number {
  return data.reduce((total, bin) => (matchesRegion(bin, region) ? total + bin.count : total), 0);
}

export default function SessionQuadrant({ data = defaultData, caption = defaultCaption, height, className }: SessionQuadrantProps) {
  const style = height === undefined ? undefined : { height };
  const counts = data.map((bin) => bin.count);
  const total = sumOf(counts);
  const maxCount = maxOf(counts);

  if (total === null || maxCount === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma sessão neste recorte com tempo e páginas medidos: a grade não tem o que contar.</span>
      </div>
    );
  }

  const limits = bandLimits(maxCount);
  const scaleMinutes = (value: number) => PLOT_X + (value / MINUTES_MAX) * PLOT_W;
  const scalePages = (value: number) => PLOT_Y + PLOT_H - (value / PAGES_MAX) * PLOT_H;
  const splitX = PLOT_X + COL_SPLIT * CELL_W;
  const splitY = PLOT_Y + PLOT_H - ROW_SPLIT * CELL_H;

  const regionTotals = REGIONS.map((region) => regionTotalOf(data, region));
  const regionShares = sharePoints(regionTotals, total);
  let leaderIndex = 0;
  for (let index = 0; index < regionTotals.length; index += 1) {
    if ((regionTotals[index] ?? 0) > (regionTotals[leaderIndex] ?? 0)) leaderIndex = index;
  }

  /** A frase acessível repete esta linha inteira, para o número não sair com duas aparências. */
  const readingLine =
    `Maior massa em ${REGIONS[leaderIndex]?.inline ?? ''}, abaixo de ${formatInt(COL_SPLIT)} min e de ` +
    `${formatInt(ROW_SPLIT * PAGES_PER_ROW)} páginas: ${formatInt(regionTotals[leaderIndex] ?? 0)} sessões, ` +
    `${formatPercentPoints(regionShares[leaderIndex] ?? 0, 0)} do mês`;
  const summary =
    `Grade de densidade com ${formatInt(data.length)} células preenchidas de ${formatInt(GRID_COLS * GRID_ROWS)} ` +
    `possíveis, ${formatInt(total)} ${caption} por tempo e páginas vistas. ${readingLine}.`;

  return (
    <svg
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="img"
      style={style}
      viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}
    >
      {/* Linha de leitura (ANO-5): a frase acessível repete esta linha inteira, nunca uma versão dela. */}
      <text aria-hidden className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={12} x={PLOT_X} y={14}>
        {readingLine}
      </text>
      <text aria-hidden className="font-sans tabular-nums" fill="var(--text-muted)" fontSize={11} x={PLOT_X} y={28}>
        Páginas vistas, 0 a 32 ↑
      </text>

      {/* Grade nos dois sentidos (EIX-3b): tempo e páginas são as duas grandezas lidas por posição. */}
      {TICKS_MINUTES.map((tick) => (
        <g key={`min-${String(tick)}`}>
          <line
            stroke="var(--line-subtle)"
            x1={scaleMinutes(tick)}
            x2={scaleMinutes(tick)}
            y1={PLOT_Y}
            y2={PLOT_Y + PLOT_H}
          />
          <text
            className="font-display"
            fill="var(--text-muted)"
            fontSize={11}
            textAnchor="middle"
            x={scaleMinutes(tick)}
            y={PLOT_Y + PLOT_H + 16}
          >
            {formatInt(tick)}
          </text>
        </g>
      ))}
      {TICKS_PAGES.map((tick) => (
        <g key={`pag-${String(tick)}`}>
          <line stroke="var(--line-subtle)" x1={PLOT_X} x2={PLOT_X + PLOT_W} y1={scalePages(tick)} y2={scalePages(tick)} />
          <text
            className="font-display"
            dominantBaseline="central"
            fill="var(--text-muted)"
            fontSize={11}
            textAnchor="end"
            x={PLOT_X - 6}
            y={scalePages(tick)}
          >
            {formatInt(tick)}
          </text>
        </g>
      ))}
      <text
        aria-hidden
        className="font-sans tabular-nums"
        fill="var(--text-muted)"
        fontSize={11}
        textAnchor="middle"
        x={PLOT_X + PLOT_W / 2}
        y={PLOT_Y + PLOT_H + 34}
      >
        Minutos na sessão, 0 a 24 →
      </text>

      {/* Uma célula por bin com sessão. Bin ausente do dado não entra aqui: célula não desenhada quer
          dizer nenhuma sessão, e é por isso que nenhuma faixa pode sumir contra o cartão. */}
      {data.map((bin) => {
        const band = bandOf(bin.count, limits);
        const side = BAND_SIDE[band] ?? 1;
        const width = (CELL_W - CELL_GAP) * side;
        const cellHeight = (CELL_H - CELL_GAP) * side;
        return (
          <rect
            fill={BAND_COLORS[band] ?? BAND_COLORS[0]}
            height={cellHeight}
            key={`cel-${String(bin.col)}-${String(bin.row)}`}
            rx={1}
            width={width}
            x={PLOT_X + bin.col * CELL_W + (CELL_W - width) / 2}
            y={PLOT_Y + PLOT_H - (bin.row + 1) * CELL_H + (CELL_H - cellHeight) / 2}
          />
        );
      })}

      {/* Divisórias na borda de bin, e não no domínio: o corte não parte a contagem de nenhuma célula. */}
      <line stroke={SPLIT_STROKE} strokeWidth={SPLIT_WIDTH} x1={splitX} x2={splitX} y1={PLOT_Y} y2={PLOT_Y + PLOT_H} />
      <line stroke={SPLIT_STROKE} strokeWidth={SPLIT_WIDTH} x1={PLOT_X} x2={PLOT_X + PLOT_W} y1={splitY} y2={splitY} />

      {/* Lista de identificação das regiões (ROT-10), fora do desenho porque a célula de 11 px não
          aguenta halo (GEO-4). O pictograma de quadrante substitui a palavra: o quadrado cheio é a
          posição daquela região no plano, na mesma orientação do gráfico. */}
      <text className="font-sans" fill="var(--text-secondary)" fontSize={12} x={LIST_X} y={52}>
        Regiões do quadrante
      </text>
      {REGIONS.map((region, index) => {
        const rowY = 78 + index * LIST_ROW_STEP;
        const cells = [
          { left: true, top: true },
          { left: false, top: true },
          { left: true, top: false },
          { left: false, top: false },
        ];
        return (
          <g key={region.name}>
            {cells.map((cell) => {
              const active = cell.left === region.quickTime && cell.top === region.manyPages;
              return (
                <rect
                  fill={active ? 'var(--text-secondary)' : 'none'}
                  height={GLYPH_SIDE}
                  key={`${region.name}-${String(cell.left)}-${String(cell.top)}`}
                  stroke={active ? 'none' : 'var(--text-muted)'}
                  width={GLYPH_SIDE}
                  x={LIST_X + (cell.left ? 0 : GLYPH_SIDE + GLYPH_GAP)}
                  y={rowY - GLYPH_SIDE - GLYPH_GAP / 2 + (cell.top ? 0 : GLYPH_SIDE + GLYPH_GAP)}
                />
              );
            })}
            <text
              className="font-sans"
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={11}
              x={LIST_NAME_X}
              y={rowY}
            >
              {region.name}
            </text>
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              textAnchor="end"
              x={LIST_RIGHT}
              y={rowY}
            >
              {formatInt(regionTotals[index] ?? 0)} sessões · {formatPercentPoints(regionShares[index] ?? 0, 0)}
            </text>
          </g>
        );
      })}
      <text aria-hidden className="font-sans tabular-nums" fill="var(--text-muted)" fontSize={11} x={LIST_X} y={196}>
        corte em {formatInt(COL_SPLIT)} min e {formatInt(ROW_SPLIT * PAGES_PER_ROW)} páginas vistas,
      </text>
      <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={11} x={LIST_X} y={212}>
        sempre na borda de um bin
      </text>

      {/* Legenda de faixa (ROT-4): posição fixa, nome escrito e contagem em coluna à direita, porque a
          cor separa cada faixa do cartão mas não separa uma faixa da outra. */}
      <text className="font-sans" fill="var(--text-secondary)" fontSize={12} x={BAND_X} y={52}>
        Sessões na célula
      </text>
      {BAND_NAMES.map((name, band) => {
        const rowY = 78 + band * 22;
        const side = BAND_SIDE[band] ?? 1;
        const from = band === 0 ? 1 : (limits[band - 1] ?? 0) + 1;
        const to = limits[band] ?? maxCount;
        return (
          <g key={`faixa-${name}`}>
            <rect
              fill={BAND_COLORS[band] ?? BAND_COLORS[0]}
              height={(SWATCH_H - CELL_GAP) * side}
              rx={1}
              width={(SWATCH_W - CELL_GAP) * side}
              x={BAND_X + (SWATCH_W - (SWATCH_W - CELL_GAP) * side) / 2}
              y={rowY - ((SWATCH_H - CELL_GAP) * side) / 2}
            />
            <text
              className="font-sans"
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={11}
              x={BAND_X + SWATCH_W + 10}
              y={rowY}
            >
              {name}
            </text>
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              textAnchor="end"
              x={BAND_RIGHT}
              y={rowY}
            >
              {formatInt(from)} a {formatInt(to)}
            </text>
          </g>
        );
      })}
      <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={11} x={BAND_X} y={158}>
        degraus em potências
      </text>
      <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={11} x={BAND_X} y={174}>
        da contagem, e a cor
      </text>
      <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={11} x={BAND_X} y={190}>
        não ordena sozinha
      </text>

      <text className="kpi-number font-semibold" fill="var(--text-primary)" fontSize={14} x={BAND_X} y={222}>
        {formatInt(total)}
      </text>
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={BAND_X} y={240}>
        {caption}
      </text>
    </svg>
  );
}
