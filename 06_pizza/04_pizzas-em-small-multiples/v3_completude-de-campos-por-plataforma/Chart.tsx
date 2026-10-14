import { Fragment, type CSSProperties, type ReactElement } from 'react';
import { Filter, TriangleAlert, Unplug } from 'lucide-react';

import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, minShare as defaultMinShare, type PlatformCompleteness } from './data';

/**
 * Matriz de roscas binárias, uma por par de plataforma e campo, todas no mesmo diâmetro e na mesma
 * cor: o que se compara entre as células é o número do centro, não a forma do anel. Acima de oito
 * células um PieChart por rosca custaria doze instâncias do Recharts para desenhar doze arcos, então
 * o anel é SVG puro com a geometria calculada aqui, e os rótulos de linha e de coluna são HTML.
 * A célula abaixo do piso muda o número para a cor de atenção e ganha ícone, nunca só a cor.
 */
export interface FieldCompletenessMatrixProps {
  readonly data?: readonly PlatformCompleteness[];
  /** Piso de completude aceito, em fração. */
  readonly minShare?: number;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Diâmetro da rosca, igual em toda célula: 88 px cabem nas colunas de 101,5 px do corpo de 574 px. */
const RING = 88;
const RING_STROKE = 8;
const RING_RADIUS = (RING - RING_STROKE) / 2;
const RING_CENTER = RING / 2;
/** Fração preenchida: a única cor de dado da matriz. */
const FILLED_STROKE = 'var(--chart-1)';
/** A fração vazia é categoria de ausência, e o neutro dela é o da tabela de tokens (1,79:1 contra o cartão, isento pela ACE-3 porque o valor está escrito no centro). */
const EMPTY_STROKE = 'var(--line-strong)';
/** Largura da coluna dos rótulos de linha, em px: cabe "Rede profissional" em 12 px sem reticência (TIP-7). */
const LABEL_COLUMN = 136;
/** 14 px: a tinta de "100%" foi medida no preview em 53 px e o furo do anel tem 72 px, o que deixa 9,5 px de folga de cada lado. */
const CENTER_FONT_SIZE = 14;

interface MatrixCell {
  readonly platform: PlatformCompleteness;
  readonly fieldId: string;
  readonly fieldName: string;
  readonly filled: number;
  /** Fração preenchida; `null` quando a plataforma não recebeu lead no recorte (EST-1b). */
  readonly share: number | null;
  readonly below: boolean;
}

/** Ponto do círculo da rosca no ângulo dado, com 12 horas em zero grau e giro horário. */
function pointAt(degrees: number): { readonly x: number; readonly y: number } {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: Math.round((RING_CENTER + RING_RADIUS * Math.cos(radians)) * 100) / 100,
    y: Math.round((RING_CENTER + RING_RADIUS * Math.sin(radians)) * 100) / 100,
  };
}

/** Arco da fração, das 12 horas no sentido horário. Só para fração maior que zero e menor que 1. */
function arcPath(fraction: number): string {
  const sweep = fraction * 360;
  const start = pointAt(0);
  const end = pointAt(sweep);
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${String(start.x)} ${String(start.y)} A ${String(RING_RADIUS)} ${String(RING_RADIUS)} 0 ${String(largeArc)} 1 ${String(end.x)} ${String(end.y)}`;
}

/** Uma linha por plataforma, uma célula por campo, na ordem fixa dos campos da primeira linha. */
function toCells(platform: PlatformCompleteness, minShare: number): readonly MatrixCell[] {
  return platform.fields.map((field) => {
    const share = platform.received > 0 ? field.filled / platform.received : null;
    return {
      platform,
      fieldId: field.fieldId,
      fieldName: field.fieldName,
      filled: field.filled,
      share,
      below: share !== null && share < minShare,
    };
  });
}

/** A célula de menor completude, ou `null` quando nenhuma tem denominador medido. */
function worstCell(cells: readonly MatrixCell[]): MatrixCell | null {
  return cells.reduce<MatrixCell | null>((worst, cell) => {
    if (cell.share === null) return worst;
    if (worst === null || worst.share === null) return cell;
    return cell.share < worst.share ? cell : worst;
  }, null);
}

export default function FieldCompletenessMatrix({
  data = defaultData,
  minShare = defaultMinShare,
  height,
  className,
}: FieldCompletenessMatrixProps) {
  const rootStyle: CSSProperties | undefined = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={rootStyle}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma neste recorte: não houve lead recebido no período.</span>
      </div>
    );
  }

  const rows = data.map((platform) => ({ platform, cells: toCells(platform, minShare) }));
  const allCells = rows.flatMap((row) => row.cells);
  const columnNames = rows[0]?.cells.map((cell) => ({ id: cell.fieldId, name: cell.fieldName })) ?? [];
  const belowCount = allCells.filter((cell) => cell.below).length;
  const worst = worstCell(allCells);
  const minText = formatPercent(minShare, 0);

  /* A mesma frase serve à linha de leitura visível e à frase acessível, então as duas nunca saem
     com formatadores diferentes para a mesma medida (DAD-5, FORMATO ACESSIVEL). */
  const reading =
    worst === null || worst.share === null
      ? `Nenhuma plataforma com denominador medido para comparar com o piso de ${minText}.`
      : `${formatInt(belowCount)} de ${formatInt(allCells.length)} células abaixo de ${minText}: a pior é ${worst.fieldName} em ${worst.platform.platformName}, com ${formatPercent(worst.share, 0)}.`;

  const summary = `Matriz de ${formatInt(rows.length)} por ${formatInt(columnNames.length)} roscas com a completude dos campos do lead por plataforma de mídia, todas no mesmo diâmetro e na mesma cor. ${reading}`;

  const renderRing = (cell: MatrixCell): ReactElement => {
    if (cell.share === null) {
      /* Sem denominador não existe fração: a rosca sai do desenho e o lugar dela escreve a
         ausência com ícone, nunca uma rosca vazia que se leria como zero (EST-2, DAD-2). */
      return (
        <span
          className="flex shrink-0 items-center justify-center gap-1 text-[0.6875rem] text-text-muted"
          style={{ height: RING }}
        >
          <Unplug aria-hidden className="size-3 shrink-0" />
          <span>{formatUnavailable()}</span>
        </span>
      );
    }
    const tone = cell.below ? 'var(--warning)' : 'var(--text-primary)';
    return (
      <svg aria-hidden className="shrink-0" height={RING} viewBox={`0 0 ${String(RING)} ${String(RING)}`} width={RING}>
        <circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          fill="none"
          r={RING_RADIUS}
          stroke={EMPTY_STROKE}
          strokeWidth={RING_STROKE}
        />
        {cell.share >= 1 ? (
          <circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            fill="none"
            r={RING_RADIUS}
            stroke={FILLED_STROKE}
            strokeWidth={RING_STROKE}
          />
        ) : (
          <path d={arcPath(cell.share)} fill="none" stroke={FILLED_STROKE} strokeWidth={RING_STROKE} />
        )}
        <text
          className="font-display"
          dominantBaseline="central"
          fill={tone}
          fontSize={CENTER_FONT_SIZE}
          fontWeight={600}
          textAnchor="middle"
          x={RING_CENTER}
          y={RING_CENTER}
        >
          {formatPercent(cell.share, 0)}
        </text>
      </svg>
    );
  };

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="figure"
      style={rootStyle}
    >
      <p aria-hidden className="mb-3 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div
        className="grid min-h-0 flex-1 items-start gap-x-2 gap-y-3"
        style={{ gridTemplateColumns: `${String(LABEL_COLUMN)}px repeat(${String(columnNames.length)}, minmax(0, 1fr))` }}
      >
        <span />
        {columnNames.map((column) => (
          <span className="text-center text-[0.6875rem] text-text-muted" key={column.id}>
            {column.name}
          </span>
        ))}
        {rows.map((row) => (
          <Fragment key={row.platform.platformId}>
            <span className="flex min-w-0 flex-col justify-center" style={{ height: RING }}>
              <span className="text-xs font-medium text-text-secondary">{row.platform.platformName}</span>
              <span className="text-[0.6875rem] tabular-nums text-text-muted">
                {`${formatInt(row.platform.received)} leads`}
              </span>
            </span>
            {row.cells.map((cell) => (
              <span className="flex min-w-0 flex-col items-center" key={cell.fieldId}>
                {renderRing(cell)}
                {cell.share === null ? null : (
                  <span className="mt-1 flex shrink-0 items-center gap-1 text-[0.6875rem] text-text-muted">
                    {/* O ícone é o segundo canal do estado abaixo do piso: o número muda de cor e
                        ganha forma, porque cor sozinha não informa (ACE-2). O glifo mora num
                        contêiner flex, nunca solto na linha de texto (GEO-17). */}
                    {cell.below ? (
                      <TriangleAlert aria-hidden className="size-3 shrink-0" style={{ color: 'var(--warning)' }} />
                    ) : null}
                    <span className="tabular-nums">
                      {`${formatInt(cell.filled)} de ${formatInt(row.platform.received)}`}
                    </span>
                  </span>
                )}
              </span>
            ))}
          </Fragment>
        ))}
      </div>
    </figure>
  );
}
