import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { ResponsiveContainer, Tooltip, Treemap, type TreemapNode } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveGroup } from './data';

/**
 * Treemap de dois níveis: um retângulo de grupo por executivo, com o contorno na cor do grupo e
 * um selo com nome; dentro, um retângulo por produto, com área proporcional ao valor e
 * luminosidade decrescente do produto maior ao menor do mesmo grupo (color-mix a partir da cor
 * do grupo, na coordenada cartesiana oklab, para o matiz não girar perto do neutro). O índice do
 * grupo (grupoIndex) vem gravado em cada produto no data.ts: a cor nunca é inferida a partir da
 * posição do nó durante o render. Toda largura de rótulo é medida por Canvas 2D com a fonte real
 * (nunca por contagem de caractere): o selo do grupo e o da folha só desenham texto que cabe
 * inteiro dentro deles, e o da folha ainda cede a área colorida quando o texto tomaria quase a
 * célula inteira. Uma lista de identificação por executivo, com todo produto e seu valor, fica
 * sempre visível abaixo do desenho, porque a célula pequena demais nunca ganha rótulo próprio e
 * o selo do grupo é cortado quando o grupo é pequeno demais (nodeInset recua os quatro lados por
 * igual; não sobra uma faixa só para o topo).
 */
export interface PipelineTreemapProps {
  readonly data?: readonly ExecutiveGroup[];
  readonly height?: number;
  readonly className?: string;
}

/** Cor de cada grupo pelo índice gravado no dado, na ordem de slot da COR-8 (1, 3, 6, 5, 2, 4, 7, 8).
 * Os dois últimos exigem rótulo direto em toda marca que os usa: por isso o selo do grupo nunca
 * é omitido por regra de layout, só pelo corte de tamanho medido em renderNode (o nome não cabe). */
const GROUP_COLORS = ['--chart-1', '--chart-3', '--chart-6', '--chart-5', '--chart-2', '--chart-4', '--chart-7', '--chart-8'] as const;

const GROUP_RADIUS = 6;
const LEAF_RADIUS = 4;
const GROUP_STROKE_WIDTH = 2;
/** Recuo dos filhos dentro do grupo (nodeInset do Recharts): igual nos quatro lados, porque o
 * Recharts sempre pinta os filhos depois do grupo (nunca antes, `renderNode` em Treemap.js da
 * biblioteca) e cobriria o selo se a faixa recuada fosse mais baixa que a margem mais a altura do
 * selo (2 + 18, com 2 px de folga). O preço é recuar os outros três lados na mesma medida, mesmo
 * sem selo ali: o nodeInset do Recharts não reserva faixa só no topo. */
const GROUP_INSET = 22;
/** Vão entre produtos irmãos (nodeGap do Recharts): revela o fundo em surface-raised. */
const LEAF_GAP = 2;
/** Piso da ESP-2: marca com rótulo de 11 px dentro não desce de 11 + 6 = 17 px de espessura; 18 px
 * dá 1 px de folga (medido pela guarda ESPESSURA-MARCA do `npm run check` em 2026-09-20). */
const GROUP_BADGE_HEIGHT = 18;
const GROUP_BADGE_PADDING = 4;
const GROUP_BADGE_RADIUS = 4;
const GROUP_BADGE_MARGIN = 2;
const LEAF_MIN_WIDTH = 40;
const LEAF_MIN_HEIGHT = 28;
const LEAF_PADDING = 4;
/** Folga extra além da largura medida por Canvas 2D, só no desenho do selo (nunca na decisão de
 * caber): a guarda CONTRASTE-TEXTO do `npm run check` mede a tinta por um estimador próprio,
 * mais grosso do que `measureTextWidth`, e sem folga ele acusa 1 a 2 px de tinta na borda do
 * glifo mais largo sobre a cor do grupo (13 a 15% da tinta, medido em 2026-09-20). A decisão de
 * caber continua sem folga, contra a largura útil real. */
const TEXT_SAFETY_MARGIN = 6;
const LEAF_LINE_HEIGHT = 14;
const LEAF_BADGE_RADIUS = 2;
const LEAF_BADGE_MARGIN = 2;
/** Tamanho (px) do texto do selo de grupo e do selo de folha: os dois usam a mesma escala. */
const LABEL_FONT_SIZE = 11;
/** Peso do nome no selo de grupo. TIP-3 permite peso 700 em no máximo dois elementos por
 * visual; com um selo por grupo (8 no total), o nome fica no peso base da categoria da tabela
 * 17.1, sem destaque, porque nenhum grupo é o destacado do visual (revisão de 2026-09-20). */
const GROUP_LABEL_WEIGHT = 500;
const LEAF_NAME_WEIGHT = 500;
const LEAF_VALUE_WEIGHT = 600;
/** Mistura mínima de cor do grupo no produto menor de cada grupo (o maior fica em 100%).
 * Medida em 2026-09-20 com a fórmula de contraste da WCAG sobre `oklab` dos 8 tokens `--chart-*`
 * contra `--surface-raised`: abaixo de 78% o par mais fraco do tema claro (chart-8, que ali é o
 * mesmo card) cai abaixo de 3:1; 80% deixa 3,17:1 no claro e 4,25:1 no escuro, com folga sobre o
 * piso da ACE-3 para toda folha que fica sem selo (célula pequena demais nunca ganha texto, e aí
 * não há isenção por valor escrito). A rampa de 45 a 100 medida na revisão caía a 2,29 a 2,68:1
 * no escuro e 1,83 a 2,48:1 no claro; a correção encurta a rampa, não troca o neutro do fim dela. */
const MIN_LEAF_MIX = 80;
/** Teto do selo da folha em fração da ÁREA da célula (checklist 27, item d): acima disso, o
 * fundo `--surface-overlay` do selo cobre quase a área inteira e a folha de maior valor do grupo
 * lê como vazia enquanto as menores, sem selo, ficam com a cor cheia. É a área que decide, não a
 * largura ou a altura isoladas: um selo que ocupa a largura toda mas só uma fatia baixa da altura
 * ainda deixa a maior parte da cor visível, e é exatamente o caso comum (nome em uma linha, valor
 * embaixo). Medido em 2026-09-20: o selo típico de "Gestão de investimentos" mede 17% da célula;
 * o teto de 50% só barra o selo que precisaria de quase toda a largura E quase toda a altura ao
 * mesmo tempo (nome quebrado em duas linhas mais valor, em célula pouco maior que o texto). Quando
 * o selo não cabe dentro do teto, a folha fica só com a cor: o produto continua identificável pela
 * dica e, sempre, pela lista de identificação abaixo do gráfico. */
const LEAF_BADGE_MAX_AREA_RATIO = 0.5;

/** Cache module a module: a mesma string, no mesmo tamanho e peso, não se mede duas vezes. */
const textWidthCache = new Map<string, number>();
let measureCanvas: HTMLCanvasElement | null = null;

/** Heurística de largura, generosa de propósito (superestima, nunca subestima): usada sem
 * `document` e sempre que a fonte real ainda não terminou de carregar. */
function fallbackTextWidth(text: string, family: 'sans' | 'display'): number {
  return text.length * LABEL_FONT_SIZE * (family === 'display' ? 0.72 : 0.68);
}

/**
 * Largura real do texto, por Canvas 2D com a fonte, o peso e o tamanho do SVG (ROT-6, ACE-3).
 * Substitui a heurística de largura média de glifo: ela subestimava letra maiúscula e acentuada
 * e deixava o rótulo vazar do selo para cima da cor do grupo, com contraste texto contra marca
 * categórica abaixo do piso proibido pela ROT-6. Ficou uma segunda armadilha depois de trocar
 * para Canvas 2D, medida em 2026-09-20: no primeiro render, antes de `document.fonts` terminar
 * de carregar a Manrope de verdade, `ctx.font` caía para a fonte do sistema, mais estreita, e o
 * `textWidthCache` guardava esse número errado para sempre, porque nada força um novo render
 * quando a fonte troca (o SVG repinta o glifo, largo, mas a caixa do selo já estava desenhada
 * pela medida estreita). Por isso a função só confia no Canvas 2D quando `document.fonts.check`
 * confirma que a face exata já carregou, e só cacheia depois dessa confirmação: até lá, cada
 * chamada usa a heurística generosa e tenta de novo na próxima vez que o Recharts renderizar.
 */
function measureTextWidth(text: string, weight: number, family: 'sans' | 'display'): number {
  if (text.length === 0) return 0;
  const key = `${family}|${String(weight)}|${text}`;
  const cached = textWidthCache.get(key);
  if (cached !== undefined) return cached;
  if (typeof document === 'undefined') {
    return fallbackTextWidth(text, family);
  }
  const fontFamily = family === 'display' ? "'Space Grotesk'" : "'Manrope'";
  const fontShorthand = `${String(weight)} ${String(LABEL_FONT_SIZE)}px ${fontFamily}`;
  if (!document.fonts?.check(fontShorthand)) {
    return fallbackTextWidth(text, family);
  }
  const ctx = (measureCanvas ??= document.createElement('canvas')).getContext('2d');
  if (!ctx) {
    return fallbackTextWidth(text, family);
  }
  ctx.font = fontShorthand;
  const width = ctx.measureText(text).width;
  textWidthCache.set(key, width);
  return width;
}

function fitsWidth(text: string, width: number, weight: number, family: 'sans' | 'display' = 'sans'): boolean {
  return measureTextWidth(text, weight, family) <= width;
}

/** Luminosidade da folha por color-mix a partir da cor do grupo: o maior produto do grupo fica
 * na cor cheia, os demais se diluem em direção ao neutro de superfície conforme encolhem. Mistura
 * em `oklab`, não em `oklch`: oklch interpola o matiz pelo caminho polar e, perto de um neutro de
 * matiz indefinido, o navegador pode girar o círculo inteiro, o que pintava as folhas do grupo C
 * (`--chart-6`, um dourado) de verde e teal, iguais às cores dos selos de Executivo F e Executivo
 * A na legenda (COR-1, COR-3). oklab é cartesiano: `a` e `b` vão a zero em linha reta, sem girar. */
function leafFill(colorVar: string, rank: number, count: number): string {
  if (count <= 1) {
    return `var(${colorVar})`;
  }
  const pct = 100 - (rank * (100 - MIN_LEAF_MIX)) / (count - 1);
  return `color-mix(in oklab, var(${colorVar}) ${pct.toFixed(0)}%, var(--surface-overlay))`;
}

/** Nome da folha nunca sai cortado por reticência (TIP-7): quebra em até duas linhas por palavra
 * inteira, buscando o corte mais equilibrado que caiba nos dois lados. */
function wrapLeafName(name: string, usableWidth: number): readonly string[] {
  if (fitsWidth(name, usableWidth, LEAF_NAME_WEIGHT)) {
    return [name];
  }
  const words = name.split(' ');
  if (words.length < 2) {
    return [name];
  }
  let best: { lines: readonly [string, string]; balance: number } | null = null;
  for (let i = 1; i < words.length; i++) {
    const first = words.slice(0, i).join(' ');
    const second = words.slice(i).join(' ');
    if (fitsWidth(first, usableWidth, LEAF_NAME_WEIGHT) && fitsWidth(second, usableWidth, LEAF_NAME_WEIGHT)) {
      const balance = Math.abs(first.length - second.length);
      if (!best || balance < best.balance) {
        best = { lines: [first, second], balance };
      }
    }
  }
  if (best) {
    return best.lines;
  }
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
}

interface LeafFit {
  readonly lines: readonly string[];
  readonly valueText: string;
  readonly badgeWidth: number;
  readonly badgeHeight: number;
  /** Nome e valor são avaliados como par: célula pequena demais nunca mostra só um dos dois;
   * e o selo nunca cresce a ponto de apagar a área que é o encoding do valor (checklist 27). */
  readonly fits: boolean;
}

function measureLeafFit(name: string, value: number, width: number, height: number): LeafFit {
  const valueText = formatCurrencyCompact(value);
  if (width < LEAF_MIN_WIDTH || height < LEAF_MIN_HEIGHT) {
    return { lines: [], valueText, badgeWidth: 0, badgeHeight: 0, fits: false };
  }
  // A largura e a altura úteis já descontam a margem do selo (não só o respiro do texto): é
  // contra elas, e não contra `width`/`height` crus, que toda medida de verdade compara, para o
  // selo desenhado nunca precisar de mais espaço do que a célula tem depois de recuado.
  const usableWidth = width - LEAF_PADDING * 2 - LEAF_BADGE_MARGIN * 2;
  const usableHeight = height - LEAF_BADGE_MARGIN * 2;
  const lines = wrapLeafName(name, usableWidth);
  const valueWidth = measureTextWidth(valueText, LEAF_VALUE_WEIGHT, 'display');
  const lineWidths = lines.map((line) => measureTextWidth(line, LEAF_NAME_WEIGHT, 'sans'));
  const contentWidth = Math.max(valueWidth, ...lineWidths);
  const badgeWidth = Math.min(usableWidth + LEAF_PADDING * 2, contentWidth + LEAF_PADDING * 2 + TEXT_SAFETY_MARGIN);
  const badgeHeight = LEAF_PADDING * 2 + (lines.length + 1) * LEAF_LINE_HEIGHT;
  // Nome e valor só desenham quando cabem de verdade: nenhuma linha do nome, nem o valor, pode
  // passar da largura útil, e a altura precisa sobrar para todas as linhas. Sem checar CADA linha
  // (não só o valor), `wrapLeafName` podia devolver a melhor tentativa mesmo sem achar um corte
  // que coubesse, e o texto vazava do selo para cima da cor do grupo (ROT-6, medido em 1,53:1
  // contra `--chart-1` no escuro pela revisão de 2026-09-20: era exatamente esta lacuna).
  const fitsText = valueWidth <= usableWidth && lineWidths.every((lineWidth) => lineWidth <= usableWidth) && badgeHeight <= usableHeight;
  const fitsArea = badgeWidth * badgeHeight <= width * height * LEAF_BADGE_MAX_AREA_RATIO;
  return { lines, valueText, badgeWidth, badgeHeight, fits: fitsText && fitsArea };
}

/** Soma dos produtos de um executivo: os grupos não trazem `value` próprio, o Recharts calcula
 * o deles a partir dos filhos, e o componente refaz a mesma soma para o texto fora do SVG. */
function groupTotal(group: ExecutiveGroup): number {
  return group.children.reduce((sum, child) => sum + child.value, 0);
}

export default function PipelineTreemap({ data = defaultData, height, className }: PipelineTreemapProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não houve pipeline aberto para dividir em área.</span>
      </div>
    );
  }

  // Produto sem valor no trimestre não tem área (zero não é encoding de nada): sai do desenho e
  // só aparece na lista de identificação, com o motivo em vez do valor (ROT-10, como no
  // `01_treemap`). O rank e o total do grupo são recalculados sobre o que fica visível, para o
  // degrau de cor de `leafFill` não gastar um passo da rampa com um produto que não é desenhado.
  const leafMeta = new Map<string, { readonly rank: number; readonly count: number }>();
  for (const group of data) {
    const visible = group.children.filter((child) => child.value > 0);
    visible.forEach((child, index) => {
      leafMeta.set(child.id, { rank: index, count: visible.length });
    });
  }

  const grandTotal = data.reduce((sum, group) => sum + groupTotal(group), 0);
  const leafCount = data.reduce((sum, group) => sum + group.children.filter((child) => child.value > 0).length, 0);
  const excludedCount = data.reduce((sum, group) => sum + group.children.filter((child) => child.value <= 0).length, 0);
  // O squarify lê os grupos na ordem do array: do maior para o menor produz retângulos mais
  // próximos do quadrado. Fora de ordem, o último grupo tende a sobrar como tira fina, mesmo
  // quando o valor dele não é o menor (medido no preview com os executivos em ordem alfabética).
  // `orderedFullGroups` guarda todo produto, inclusive o sem valor, para a lista de identificação;
  // `orderedGroups` filtra para o Treemap, que não sabe desenhar área zero.
  const orderedFullGroups = [...data].sort((a, b) => groupTotal(b) - groupTotal(a));
  const orderedGroups = orderedFullGroups.map((group) => ({
    ...group,
    children: group.children.filter((child) => child.value > 0),
  }));
  const leader = orderedGroups[0];
  const leaderTotal = leader ? groupTotal(leader) : 0;
  const leaderShare = leader && grandTotal > 0 ? formatPercent(leaderTotal / grandTotal, 0) : '';

  const excludedSentence =
    excludedCount === 0
      ? ''
      : excludedCount === 1
        ? ' 1 produto ficou fora do desenho, sem pipeline aberto no trimestre.'
        : ` ${String(excludedCount)} produtos ficaram fora do desenho, sem pipeline aberto no trimestre.`;

  const summary = leader
    ? `Treemap aninhado com o pipeline aberto de ${formatCurrencyCompact(grandTotal)} entre ${formatInt(data.length)} executivos e ${formatInt(leafCount)} produtos. ${leader.name} lidera com ${formatCurrencyCompact(leaderTotal)}, ${leaderShare} do total.${excludedSentence}`
    : '';

  /** `content` decide pelo `depth`: 0 é o canvas inteiro (pinta o vão que o nodeGap abre), 1 é o
   * grupo (só contorno e selo, nunca área própria) e 2 é a folha (área colorida). */
  function renderNode(node: TreemapNode): ReactElement {
    const { depth, x, y, width, height: cellHeight, name, value } = node;

    if (depth === 0) {
      return <rect fill="var(--surface-raised)" height={cellHeight} rx={GROUP_RADIUS} width={width} x={x} y={y} />;
    }

    const grupoIndexRaw = node.grupoIndex;
    const grupoIndex = typeof grupoIndexRaw === 'number' ? grupoIndexRaw : 0;
    const colorVar = GROUP_COLORS[grupoIndex % GROUP_COLORS.length] ?? GROUP_COLORS[0];

    if (depth === 1) {
      // O selo traz só o nome: nome mais total juntos na mesma linha, medido no preview,
      // transbordava a caixa em grupo estreito e a segunda parte pintava sobre o fundo colorido
      // do primeiro filho, com contraste abaixo do piso (ACE-3). O total do executivo continua
      // disponível na dica e na lista de identificação (item 5 do README), sem esse risco. A
      // largura do nome é medida de verdade (measureTextWidth), não estimada por caractere: é o
      // que garante que o selo nunca desenha texto maior do que a caixa que o contém (ROT-6).
      const nameWidth = measureTextWidth(name, GROUP_LABEL_WEIGHT, 'sans');
      const badgeAvailable = width - GROUP_BADGE_MARGIN * 2 - GROUP_BADGE_PADDING * 2;
      const fitsName = badgeAvailable >= nameWidth && cellHeight >= GROUP_BADGE_MARGIN * 2 + GROUP_BADGE_HEIGHT;
      const badgeWidth = Math.min(width - GROUP_BADGE_MARGIN * 2, nameWidth + GROUP_BADGE_PADDING * 2);
      return (
        <g>
          <rect
            fill="none"
            height={cellHeight}
            rx={GROUP_RADIUS}
            stroke={`var(${colorVar})`}
            strokeWidth={GROUP_STROKE_WIDTH}
            width={width}
            x={x}
            y={y}
          />
          {fitsName ? (
            <>
              <rect
                fill="var(--surface-overlay)"
                height={GROUP_BADGE_HEIGHT}
                rx={GROUP_BADGE_RADIUS}
                width={badgeWidth}
                x={x + GROUP_BADGE_MARGIN}
                y={y + GROUP_BADGE_MARGIN}
              />
              <text
                className="font-sans"
                dominantBaseline="central"
                fill="var(--text-primary)"
                fontSize={LABEL_FONT_SIZE}
                fontWeight={GROUP_LABEL_WEIGHT}
                x={x + GROUP_BADGE_MARGIN + GROUP_BADGE_PADDING}
                y={y + GROUP_BADGE_MARGIN + GROUP_BADGE_HEIGHT / 2}
              >
                {name}
              </text>
            </>
          ) : null}
        </g>
      );
    }

    const id = typeof node.id === 'string' ? node.id : '';
    const meta = leafMeta.get(id);
    const rank = meta?.rank ?? 0;
    const count = meta?.count ?? 1;
    const fill = leafFill(colorVar, rank, count);
    const { lines, valueText, badgeWidth, badgeHeight, fits } = measureLeafFit(name, value, width, cellHeight);

    return (
      <g>
        <rect fill={fill} height={cellHeight} rx={LEAF_RADIUS} width={width} x={x} y={y} />
        {fits ? (
          <>
            <rect
              fill="var(--surface-overlay)"
              height={badgeHeight}
              rx={LEAF_BADGE_RADIUS}
              width={badgeWidth}
              x={x + LEAF_BADGE_MARGIN}
              y={y + LEAF_BADGE_MARGIN}
            />
            {lines.map((line, index) => (
              <text
                className="font-sans"
                fill="var(--text-primary)"
                fontSize={LABEL_FONT_SIZE}
                fontWeight={LEAF_NAME_WEIGHT}
                key={line}
                x={x + LEAF_BADGE_MARGIN + LEAF_PADDING}
                y={y + LEAF_BADGE_MARGIN + LEAF_PADDING + (index + 1) * LEAF_LINE_HEIGHT - 3}
              >
                {line}
              </text>
            ))}
            <text
              className="font-display"
              fill="var(--text-secondary)"
              fontSize={LABEL_FONT_SIZE}
              fontWeight={LEAF_VALUE_WEIGHT}
              x={x + LEAF_BADGE_MARGIN + LEAF_PADDING}
              y={y + LEAF_BADGE_MARGIN + LEAF_PADDING + (lines.length + 1) * LEAF_LINE_HEIGHT - 3}
            >
              {valueText}
            </text>
          </>
        ) : null}
      </g>
    );
  }

  return (
    <div aria-label={summary} className={cn('@container flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {leader ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(grandTotal)}</span> no pipeline aberto de{' '}
          {formatInt(data.length)} executivos; <span className="font-semibold text-text-primary">{leader.name}</span> concentra{' '}
          <span className="kpi-number font-medium text-text-primary">{leaderShare}</span>, com {formatCurrencyCompact(leaderTotal)} em{' '}
          {formatInt(leader.children.length)} produtos.
        </p>
      ) : null}
      {/* min-h reserva o piso do treemap: a lista de identificação abaixo é `shrink-0`, e sem um
          piso aqui o flex column deixaria o Treemap encolher até caber a lista inteira, a ponto
          de nenhuma folha sobrar alta o bastante para o próprio selo (o que a rodada anterior
          fazia calado). O canvas do meta.json cresce para o total caber sem cortar nada. */}
      <div className="min-h-[260px] flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <Treemap
            aspectRatio={1.2}
            content={renderNode}
            data={orderedGroups}
            dataKey="value"
            isAnimationActive={false}
            nameKey="name"
            nodeGap={LEAF_GAP}
            nodeInset={GROUP_INSET}
          >
            <Tooltip content={<ChartTooltip valueFormat="currencyCompact" />} isAnimationActive={false} />
          </Treemap>
        </ResponsiveContainer>
      </div>
      {/* Lista de identificação por executivo e produto (checklist 27, ROT-10): a folha só ganha
          rótulo quando o texto cabe inteiro dentro do selo sem vazar (measureLeafFit) e o selo do
          grupo some quando o grupo é estreito demais; esta lista não depende de nenhum dos dois,
          então cobre a folha pequena demais para nome e valor juntos e o produto sem pipeline no
          trimestre, que fica fora do desenho (marcador vazado, com o motivo em vez do valor). A
          coluna de valor tem largura fixa por grade e alinhamento à direita em vez de fluxo com
          quebra de linha (TIP-6, ROT-5), para os valores se comparem de relance. */}
      <div className="mt-2 grid shrink-0 grid-cols-2 gap-x-5 gap-y-2 text-[0.6875rem] @lg:grid-cols-4">
        {orderedFullGroups.map((group) => {
          const groupColor = `var(${GROUP_COLORS[group.grupoIndex % GROUP_COLORS.length]})`;
          return (
            <div className="min-w-0" key={group.id}>
              {/* A coluna de valor é um número de px FIXO (ROT-5, TIP-6), não `auto`: `auto`
                  dimensiona pelo conteúdo, e o motivo do produto sem valor ("sem pipeline aberto
                  no trimestre") é bem mais longo que qualquer valor formatado, então `auto` dava
                  a maior parte da linha para o motivo e espremia o nome do produto contra ele, os
                  dois se sobrepondo (medido em 2026-09-20). 92 px cobre o maior valor do dado
                  numa linha só, e o motivo, mais longo, quebra em várias linhas dentro dela. */}
              <div className="grid grid-cols-[1fr_92px] items-center gap-x-2">
                <span className="flex min-w-0 items-center gap-1.5 font-semibold text-text-primary">
                  <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: groupColor }} />
                  <span>{group.name}</span>
                </span>
                <span className="font-display text-right text-text-primary">{formatCurrencyCompact(groupTotal(group))}</span>
              </div>
              {/* items-start, não items-baseline: nome ou motivo podem quebrar em mais de uma
                  linha dentro da coluna estreita, e o alinhamento por linha de base de um item
                  multilinha contra outro pousava o texto de um lado sobre a segunda linha do
                  outro (medido em 2026-09-20). */}
              <ul className="mt-0.5 space-y-0.5 pl-3.5">
                {group.children.map((child) => (
                  <li className="grid grid-cols-[1fr_92px] items-start gap-x-2" key={child.id}>
                    <span className="flex min-w-0 items-center gap-1.5 text-text-secondary">
                      {child.value > 0 ? (
                        <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: groupColor }} />
                      ) : (
                        <span aria-hidden className="size-1.5 shrink-0 rounded-full border" style={{ borderColor: 'var(--text-muted)' }} />
                      )}
                      <span>{child.name}</span>
                    </span>
                    {child.value > 0 ? (
                      <span className="font-display text-right text-text-primary">{formatCurrencyCompact(child.value)}</span>
                    ) : (
                      <span className="text-right text-text-muted">{child.note ?? 'sem valor'}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
