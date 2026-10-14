import { Filter, Unplug } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatInt, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  HEX_GRID,
  REGIONS,
  selectedRegion as defaultSelectedRegion,
  type Region,
  type UfCode,
  type UfRevenue,
} from './data';

/**
 * Coroplético por macrorregião com abertura para UF, sobre malha de hexágonos. Sem região aberta, as
 * 5 macrorregiões são blocos pintados pela receita média por cliente. Com `selectedRegion`, a região
 * escolhida troca o bloco pelas suas UFs, cada uma com sigla e valor, e as outras regiões afundam em
 * tom neutro, só com nome e valor. A tabela ao lado acompanha a camada visível: valor, posição no
 * ranking e cobertura do dado. Apoia a decisão de onde a receita por cliente é maior e quanto ela
 * varia dentro da região.
 */
export interface RegionDrillChoroplethProps {
  readonly data?: readonly UfRevenue[];
  /** Região aberta em UFs. `null` mostra a visão padrão, de macrorregiões. */
  readonly selectedRegion?: Region | null;
  readonly height?: number;
  readonly className?: string;
}

const CLASS_COUNT = 5;
/** As quebras de classe caem em múltiplos deste valor, em reais. */
const EDGE_ROUND = 10;
/** Largura da célula hexagonal, de ponta para cima: com 46 px cabem a sigla e um valor de até R$ 999 em 11 px. */
const HEX_W = 46;
const HEX_GAP = 2;
const HEX_R = HEX_W / Math.sqrt(3);
const HEX_DRAWN_R = HEX_R - HEX_GAP / Math.sqrt(3);
const ROW_PITCH = HEX_R * 1.5;
const PAD = 2;
const LABEL_SIZE = 11;
/** Linhas de base do nome e do valor em torno do centro: 13,5 px entre elas deixam 4 px de tinta a tinta. */
const NAME_DY = -3.5;
const VALUE_DY = 10;
const SWATCH_W = 14;
const SWATCH_H = 16;
/** Colunas da tabela: nome flexível, valor, posição e cobertura com largura fixa e número à direita (TIP-6). */
const TABLE_GRID = 'grid grid-cols-[minmax(0,1fr)_7rem_6.5rem_9rem] gap-x-3';

/**
 * Afastamento de cada macrorregião, em px: é o espaço, e não um contorno, que separa os blocos. O
 * Norte fica parado e as outras só se afastam dele. Canal medido entre regiões vizinhas: de 5 px
 * (AP com MA e TO com MA, as duas arestas oblíquas do Nordeste) a 10,2 px (PI com GO).
 */
const REGION_SHIFT: Readonly<Record<Region, { readonly x: number; readonly y: number }>> = {
  norte: { x: 0, y: 0 },
  nordeste: { x: 10, y: 0 },
  'centro-oeste': { x: 0, y: 6 },
  sudeste: { x: 10, y: 8 },
  sul: { x: 0, y: 12 },
};
/** Bloco de região: o traço de baixo sobra 1 px para fora e vira a borda; o de cima fecha a emenda entre hexágonos. */
const RIM_STROKE = 2.5;
const SEAM_STROKE = 0.75;

/**
 * Cinco classes na rampa sequencial, pulando --seq-4 e --seq-5: nenhum texto alcança 4,5:1 sobre
 * eles nos dois temas (TOK-2). Como o valor está escrito em toda marca, a cor é apoio de varredura.
 */
const CLASS_COLORS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const CLASS_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;
/** As 2 classes mais baixas medem menos de 1,6:1 contra o cartão (TOK-8): o contorno segura a silhueta. */
const OUTLINED_CLASSES = 2;
/** Região fora de foco: o poço rebaixado do cartão, com nome e valor em texto de apoio (7,0:1 ou mais). */
const FADED_FILL = 'var(--surface-sunken)';
const FADED_TEXT = 'var(--text-secondary)';

interface HexCell {
  readonly uf: UfCode;
  readonly region: Region;
  readonly cx: number;
  readonly cy: number;
}

interface Anchor {
  readonly x: number;
  readonly y: number;
}

function hexPoints(cx: number, cy: number, radius: number): string {
  const points: string[] = [];
  for (let corner = 0; corner < 6; corner += 1) {
    const angle = (Math.PI / 180) * (60 * corner - 30);
    const x = Math.round((cx + radius * Math.cos(angle)) * 100) / 100;
    const y = Math.round((cy + radius * Math.sin(angle)) * 100) / 100;
    points.push(`${String(x)},${String(y)}`);
  }
  return points.join(' ');
}

/** Macrorregião de cada UF, lida do dado: a malha não a conhece. UF fora do dado fica sem região e sem bloco. */
function regionByUf(rows: readonly UfRevenue[]): ReadonlyMap<UfCode, Region> {
  return new Map(rows.map((row) => [row.uf, row.region]));
}

/**
 * Geometria pura: centro de cada UF, com as linhas ímpares deslocadas meia célula e cada macrorregião
 * afastada pelo REGION_SHIFT, e a âncora de cada região, onde vão o nome e o valor do bloco.
 */
function buildLayout(regions: ReadonlyMap<UfCode, Region>): {
  readonly cells: readonly HexCell[];
  readonly anchors: ReadonlyMap<Region, Anchor>;
  readonly width: number;
  readonly height: number;
} {
  const raw = (Object.keys(HEX_GRID) as UfCode[]).flatMap((uf) => {
    const region = regions.get(uf);
    if (region === undefined) return [];
    const position = HEX_GRID[uf];
    const shift = REGION_SHIFT[region];
    const half = position.row % 2 === 1 ? HEX_W / 2 : 0;
    return [{ uf, region, cx: position.column * HEX_W + half + shift.x, cy: position.row * ROW_PITCH + shift.y }];
  });
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const cell of raw) {
    minX = Math.min(minX, cell.cx - HEX_W / 2 - PAD);
    maxX = Math.max(maxX, cell.cx + HEX_W / 2 + PAD);
    minY = Math.min(minY, cell.cy - HEX_R - PAD);
    maxY = Math.max(maxY, cell.cy + HEX_R + PAD);
  }
  const cells = raw.map((cell) => ({
    uf: cell.uf,
    region: cell.region,
    cx: Math.round((cell.cx - minX) * 100) / 100,
    cy: Math.round((cell.cy - minY) * 100) / 100,
  }));
  const anchors = new Map<Region, Anchor>();
  for (const info of REGIONS) {
    const own = cells.filter((cell) => cell.region === info.id);
    if (own.length === 0) continue;
    const meanY = own.reduce((sum, cell) => sum + cell.cy, 0) / own.length;
    // O nome vai na linha mais larga do bloco e, no empate, na mais próxima do meio: é onde o texto
    // tem chão dos dois lados. No ponto médio do bloco ele encostava na borda (Centro-Oeste).
    let widest: readonly HexCell[] = [];
    for (const cell of own) {
      const row = own.filter((other) => other.cy === cell.cy);
      const current = widest[0];
      const closer = current !== undefined && Math.abs(cell.cy - meanY) < Math.abs(current.cy - meanY);
      if (current === undefined || row.length > widest.length || (row.length === widest.length && closer)) widest = row;
    }
    const first = widest[0];
    if (first === undefined) continue;
    const sumX = widest.reduce((sum, cell) => sum + cell.cx, 0);
    anchors.set(info.id, { x: Math.round((sumX / widest.length) * 100) / 100, y: first.cy });
  }
  return { cells, anchors, width: Math.ceil(maxX - minX), height: Math.ceil(maxY - minY) };
}

interface RegionSummary {
  readonly id: Region;
  readonly label: string;
  readonly ufs: number;
  readonly clients: number;
  readonly billedClients: number;
  readonly average: number | null;
}

/**
 * Receita média por cliente com receita apurada, em reais inteiros: é a precisão escrita e a que
 * classifica, para a cor nunca contradizer o número. Sem cliente apurado é ausência, nunca zero.
 */
function averageOf(revenue: number, billedClients: number): number | null {
  if (billedClients <= 0) return null;
  return Math.round(revenue / billedClients);
}

/** Quebras de intervalo igual em reais redondos, do piso do menor valor ao teto do maior da camada visível. */
function buildEdges(values: readonly number[]): readonly number[] | null {
  if (values.length === 0) return null;
  let low = Number.POSITIVE_INFINITY;
  let high = Number.NEGATIVE_INFINITY;
  for (const value of values) {
    low = Math.min(low, value);
    high = Math.max(high, value);
  }
  const lowEdge = Math.floor(low / EDGE_ROUND) * EDGE_ROUND;
  const highEdge = Math.ceil(high / EDGE_ROUND) * EDGE_ROUND;
  const step = Math.max(EDGE_ROUND, Math.ceil((highEdge - lowEdge) / CLASS_COUNT / EDGE_ROUND) * EDGE_ROUND);
  return Array.from({ length: CLASS_COUNT + 1 }, (_, index) => lowEdge + index * step);
}

/** Classe de 0 a 4: o limite de baixo pertence à classe, e a última fecha em cima. */
function classOf(value: number, edges: readonly number[]): number {
  let bucket = 0;
  for (let index = 1; index < CLASS_COUNT; index += 1) {
    const edge = edges[index];
    if (edge !== undefined && value >= edge) bucket = index;
  }
  return bucket;
}

/** Posição com empate: quem tem o mesmo valor escrito divide a posição, e a seguinte é pulada. */
function rankOf(value: number, all: readonly number[]): number {
  return all.filter((other) => other > value).length + 1;
}

/** Maior valor primeiro; quem não tem valor medido vai por último, separado de qualquer número. */
function byAverageDesc(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return b - a;
}

function ufCount(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'UF' : 'UFs'}`;
}

/** Valor em reais inteiros, sem centavo: o mesmo texto no hexágono, na tabela, na legenda e na frase. */
function money(value: number): string {
  return formatCurrency(value, 0);
}

export default function RegionDrillChoropleth({
  data = defaultData,
  selectedRegion = defaultSelectedRegion,
  height,
  className,
}: RegionDrillChoroplethProps) {
  const ufRows = data.map((row) => ({ row, average: averageOf(row.revenue, row.billedClients) }));
  const regions: RegionSummary[] = REGIONS.flatMap((info) => {
    const own = data.filter((row) => row.region === info.id);
    if (own.length === 0) return [];
    let clients = 0;
    let billedClients = 0;
    let revenue = 0;
    for (const row of own) {
      clients += row.clients;
      billedClients += row.billedClients;
      revenue += row.revenue;
    }
    // Média ponderada pelas contagens, nunca a média das médias das UFs.
    return [{ id: info.id, label: info.label, ufs: own.length, clients, billedClients, average: averageOf(revenue, billedClients) }];
  });
  const regionValues = regions.flatMap((region) => (region.average === null ? [] : [region.average]));
  const ufValues = ufRows.flatMap((item) => (item.average === null ? [] : [item.average]));

  if (regionValues.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF com receita apurada neste recorte: o mapa não tem o que colorir.</span>
      </div>
    );
  }

  const open = selectedRegion === null ? undefined : regions.find((region) => region.id === selectedRegion);
  const openRows = open ? ufRows.filter((item) => item.row.region === open.id).sort((a, b) => byAverageDesc(a.average, b.average)) : [];
  const openValues = openRows.flatMap((item) => (item.average === null ? [] : [item.average]));
  const rankedRegions = [...regions].sort((a, b) => byAverageDesc(a.average, b.average));
  // A escala é da camada visível: UFs da região aberta, ou as macrorregiões. A legenda diz qual.
  const edges = buildEdges(open ? openValues : regionValues);
  const layout = buildLayout(regionByUf(data));
  const averageByUf = new Map(ufRows.map((item) => [item.row.uf, item]));
  const openMissing = openRows.length - openValues.length;
  const topRegion = rankedRegions[0];
  const bottomRegion = [...rankedRegions].reverse().find((region) => region.average !== null);
  const openTop = openRows[0];
  const openBottom = [...openRows].reverse().find((item) => item.average !== null);

  const regionRank = (region: RegionSummary) =>
    region.average === null ? 'fora do ranking' : `${formatInt(rankOf(region.average, regionValues))}ª de ${formatInt(regionValues.length)} regiões`;
  const ufRank = (average: number | null) =>
    average === null ? 'fora do ranking' : `${formatInt(rankOf(average, ufValues))}º de ${ufCount(ufValues.length)}`;

  // A frase acessível muda com a região aberta: com drill, fala da região e da faixa das suas UFs.
  let summary = 'Mapa coroplético de receita média por cliente sem região medida para comparar.';
  if (open) {
    const position =
      open.average === null
        ? 'A região não tem receita apurada'
        : `A região é a ${formatInt(rankOf(open.average, regionValues))}ª de ${formatInt(regionValues.length)}, com ${money(open.average)}`;
    const range =
      openTop && openBottom && openTop.average !== null && openBottom.average !== null
        ? `; entre as UFs, vai de ${money(openBottom.average)} em ${openBottom.row.name} a ${money(openTop.average)} em ${openTop.row.name}`
        : '';
    const missing = openMissing > 0 ? `, e ${ufCount(openMissing)} não ${openMissing === 1 ? 'tem' : 'têm'} receita apurada` : '';
    summary =
      `Mapa coroplético em hexágonos da receita média por cliente, com o ${open.label} aberto em ${ufCount(open.ufs)}. ` +
      `${position}${range}${missing}.`;
  } else if (topRegion && bottomRegion && topRegion.average !== null && bottomRegion.average !== null) {
    summary =
      `Mapa coroplético em hexágonos da receita média por cliente em ${formatInt(regions.length)} macrorregiões, sem região aberta em UFs. ` +
      `Lidera o ${topRegion.label}, com ${money(topRegion.average)}; a menor média é a do ${bottomRegion.label}, com ${money(bottomRegion.average)}.`;
  }

  const renderSwatch = (fill: string, outlined: boolean) => (
    <svg aria-hidden className="shrink-0" height={SWATCH_H} viewBox={`0 0 ${String(SWATCH_W)} ${String(SWATCH_H)}`} width={SWATCH_W}>
      <polygon
        fill={fill}
        points={hexPoints(SWATCH_W / 2, SWATCH_H / 2, SWATCH_W / 2 - 0.5)}
        stroke={outlined ? 'var(--line-strong)' : fill}
        strokeWidth={1}
      />
    </svg>
  );
  const renderEmptySwatch = () => (
    <svg aria-hidden className="shrink-0" height={SWATCH_H} viewBox={`0 0 ${String(SWATCH_W)} ${String(SWATCH_H)}`} width={SWATCH_W}>
      <polygon
        fill="none"
        points={hexPoints(SWATCH_W / 2, SWATCH_H / 2, SWATCH_W / 2 - 0.75)}
        stroke="var(--text-muted)"
        strokeDasharray="3 2"
        strokeWidth={1.5}
      />
    </svg>
  );
  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 items-start gap-4', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      {/* Escala 1: largura e altura iguais ao viewBox, para o texto de 11 px chegar com 11 px (GEO-18). */}
      <svg aria-hidden className="shrink-0" height={layout.height} viewBox={`0 0 ${String(layout.width)} ${String(layout.height)}`} width={layout.width}>
        {regions.map((region) => {
          if (open && region.id === open.id) return null;
          const cells = layout.cells.filter((cell) => cell.region === region.id);
          const anchor = layout.anchors.get(region.id);
          const bucket = open || region.average === null || edges === null ? null : classOf(region.average, edges);
          const fill = open ? FADED_FILL : bucket === null ? 'var(--surface-raised)' : (CLASS_COLORS[bucket] ?? FADED_FILL);
          const ink = open ? FADED_TEXT : bucket === null ? 'var(--text-muted)' : (CLASS_TEXT[bucket] ?? FADED_TEXT);
          const hasRim = open !== undefined || bucket === null || bucket < OUTLINED_CLASSES;
          return (
            <g key={region.id}>
              <title>
                {`${region.label}: ${region.average === null ? formatUnavailable() : money(region.average)} por cliente, ` +
                  `${formatRateWithVolume(region.billedClients, region.clients)} clientes com receita apurada`}
              </title>
              {hasRim
                ? cells.map((cell) => (
                    <polygon
                      fill="none"
                      key={`${cell.uf}-rim`}
                      points={hexPoints(cell.cx, cell.cy, HEX_R)}
                      stroke="var(--line-strong)"
                      strokeLinejoin="round"
                      strokeWidth={RIM_STROKE}
                    />
                  ))
                : null}
              {cells.map((cell) => (
                <polygon fill={fill} key={cell.uf} points={hexPoints(cell.cx, cell.cy, HEX_R)} stroke={fill} strokeWidth={SEAM_STROKE} />
              ))}
              {anchor ? (
                <>
                  <text fill={ink} fontSize={LABEL_SIZE} fontWeight={600} textAnchor="middle" x={anchor.x} y={anchor.y + NAME_DY}>
                    {region.label}
                  </text>
                  <text className="font-display tabular-nums" fill={ink} fontSize={LABEL_SIZE} textAnchor="middle" x={anchor.x} y={anchor.y + VALUE_DY}>
                    {region.average === null ? formatUnavailable() : money(region.average)}
                  </text>
                </>
              ) : null}
            </g>
          );
        })}
        {open
          ? layout.cells
              .filter((cell) => cell.region === open.id)
              .map((cell) => {
                const item = averageByUf.get(cell.uf);
                // A malha só traz UF que veio no dado, então a linha existe; o teste é só para o tipo.
                if (item === undefined) return null;
                const average = item.average;
                if (average === null || edges === null) {
                  return (
                    <g key={cell.uf}>
                      <title>
                        {`${item.row.name}: receita ${formatUnavailable()}, ` +
                          `${formatRateWithVolume(item.row.billedClients, item.row.clients)} clientes com receita apurada`}
                      </title>
                      <polygon
                        fill="none"
                        points={hexPoints(cell.cx, cell.cy, HEX_DRAWN_R - 0.75)}
                        stroke="var(--text-muted)"
                        strokeDasharray="3 2"
                        strokeWidth={1.5}
                      />
                      <text dominantBaseline="central" fill="var(--text-muted)" fontSize={LABEL_SIZE} fontWeight={600} textAnchor="middle" x={cell.cx} y={cell.cy}>
                        {cell.uf}
                      </text>
                    </g>
                  );
                }
                const bucket = classOf(average, edges);
                const fill = CLASS_COLORS[bucket] ?? FADED_FILL;
                const ink = CLASS_TEXT[bucket] ?? FADED_TEXT;
                return (
                  <g key={cell.uf}>
                    <title>
                      {`${item.row.name}: ${money(average)} por cliente, ` +
                        `${formatRateWithVolume(item.row.billedClients, item.row.clients)} clientes com receita apurada`}
                    </title>
                    <polygon
                      fill={fill}
                      points={hexPoints(cell.cx, cell.cy, HEX_DRAWN_R - 0.5)}
                      stroke={bucket < OUTLINED_CLASSES ? 'var(--line-strong)' : fill}
                      strokeWidth={1}
                    />
                    <text fill={ink} fontSize={LABEL_SIZE} fontWeight={600} textAnchor="middle" x={cell.cx} y={cell.cy + NAME_DY}>
                      {cell.uf}
                    </text>
                    <text className="font-display tabular-nums" fill={ink} fontSize={LABEL_SIZE} textAnchor="middle" x={cell.cx} y={cell.cy + VALUE_DY}>
                      {money(average)}
                    </text>
                  </g>
                );
              })
          : null}
      </svg>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Tabela sincronizada com a camada visível: as UFs da região aberta, ou as macrorregiões. */}
        <div
          aria-label={open ? `Receita média por cliente nas UFs do ${open.label}` : 'Receita média por cliente por macrorregião'}
          className="flex flex-col text-xs text-text-secondary"
          role="table"
        >
          <div className={cn(TABLE_GRID, 'items-end text-[0.6875rem] leading-4 text-text-muted')} role="row">
            <span role="columnheader">{open ? 'UF' : 'Região'}</span>
            <span className="text-right" role="columnheader">Receita por cliente</span>
            <span className="text-right" role="columnheader">Posição</span>
            <span className="text-right" role="columnheader">Clientes com receita apurada</span>
          </div>
          {open ? (
            <div className={cn(TABLE_GRID, 'mb-0.5 items-center font-semibold leading-5 text-text-primary')} role="row">
              <span className="tabular-nums" role="cell">{`${open.label}, ${ufCount(open.ufs)}`}</span>
              <span className="text-right font-display tabular-nums" role="cell">
                {open.average === null ? formatUnavailable() : money(open.average)}
              </span>
              <span className="text-right tabular-nums" role="cell">{regionRank(open)}</span>
              <span className="text-right tabular-nums" role="cell">{formatRateWithVolume(open.billedClients, open.clients)}</span>
            </div>
          ) : null}
          {open
            ? openRows.map((item) => {
                const bucket = item.average === null || edges === null ? null : classOf(item.average, edges);
                return (
                  <div className={cn(TABLE_GRID, 'items-center leading-[1.125rem]')} key={item.row.uf} role="row">
                    <span className="flex min-w-0 items-center gap-1.5" role="cell">
                      {bucket === null ? renderEmptySwatch() : renderSwatch(CLASS_COLORS[bucket] ?? FADED_FILL, bucket < OUTLINED_CLASSES)}
                      <span className="font-semibold text-text-primary">{item.row.uf}</span>
                      <span className="min-w-0">{item.row.name}</span>
                    </span>
                    {item.average === null ? (
                      <span className="flex items-center justify-end gap-1 text-text-muted" role="cell">
                        <Unplug aria-hidden className="size-3.5 shrink-0" />
                        {formatUnavailable()}
                      </span>
                    ) : (
                      <span className="text-right font-display tabular-nums text-text-primary" role="cell">{money(item.average)}</span>
                    )}
                    <span className="text-right tabular-nums" role="cell">{ufRank(item.average)}</span>
                    <span className="text-right tabular-nums" role="cell">{formatRateWithVolume(item.row.billedClients, item.row.clients)}</span>
                  </div>
                );
              })
            : rankedRegions.map((region) => {
                const bucket = region.average === null || edges === null ? null : classOf(region.average, edges);
                return (
                  <div className={cn(TABLE_GRID, 'items-center leading-5')} key={region.id} role="row">
                    <span className="flex min-w-0 items-center gap-1.5" role="cell">
                      {bucket === null ? renderEmptySwatch() : renderSwatch(CLASS_COLORS[bucket] ?? FADED_FILL, bucket < OUTLINED_CLASSES)}
                      <span className="font-semibold text-text-primary">{region.label}</span>
                      <span className="min-w-0 tabular-nums">{ufCount(region.ufs)}</span>
                    </span>
                    <span className="text-right font-display tabular-nums text-text-primary" role="cell">
                      {region.average === null ? formatUnavailable() : money(region.average)}
                    </span>
                    <span className="text-right tabular-nums" role="cell">{regionRank(region)}</span>
                    <span className="text-right tabular-nums" role="cell">{formatRateWithVolume(region.billedClients, region.clients)}</span>
                  </div>
                );
              })}
        </div>

        {/* Legenda em degraus da camada visível, com o intervalo de cada classe escrito em reais inteiros. */}
        <div aria-hidden className="flex flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-secondary">
          <span className="tabular-nums text-text-muted">
            {`${open ? `UFs do ${open.label}` : 'Macrorregiões'}: receita média por cliente em ${formatInt(CLASS_COUNT)} classes de intervalo igual`}
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            {edges
              ? CLASS_COLORS.map((color, index) => {
                  const low = edges[index];
                  const next = edges[index + 1];
                  if (low === undefined || next === undefined) return null;
                  return (
                    <span className="flex items-center gap-1" key={`class-${String(index)}`}>
                      {renderSwatch(color, index < OUTLINED_CLASSES)}
                      <span className="tabular-nums">{`${money(low)} a ${money(index === CLASS_COUNT - 1 ? next : next - 1)}`}</span>
                    </span>
                  );
                })
              : null}
            {open && openMissing > 0 ? (
              <span className="flex items-center gap-1">
                {renderEmptySwatch()}
                <span>sem receita apurada</span>
              </span>
            ) : null}
            {open ? (
              <span className="flex items-center gap-1">
                {renderSwatch(FADED_FILL, true)}
                <span>região fechada, só com a média</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </figure>
  );
}
