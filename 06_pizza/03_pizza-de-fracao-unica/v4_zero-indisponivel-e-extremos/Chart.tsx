import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatInt, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type FractionStateCase, period as defaultPeriod } from './data';

/**
 * Os quatro estados em que o glifo de fração única deixa de servir, lado a lado e com a mesma caixa
 * de 44 px, para a comparação ser de estado e não de tamanho. Zero medido desenha o trilho e escreve
 * o zero; fração sem medição sai com contorno tracejado, ícone e o rótulo único de ausência; abaixo
 * de 5% e acima de 95% o setor vira lasca ou disco cheio, e ali o número toma o lugar do glifo, que
 * é a saída que o próprio modelo indica em vez de desenhar uma fração que não se lê.
 */
export interface FractionStatesRowProps {
  readonly data?: readonly FractionStateCase[];
  readonly period?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Raio do glifo em pixels: 44 px de diâmetro, o degrau alto da faixa de glifo de KPI do modelo. */
const GLYPH_RADIUS = 22;
const GLYPH_SIZE = GLYPH_RADIUS * 2;
/** Faixa em que o setor se lê como um quarto, metade ou três quartos; fora dela manda o número. */
const MIN_READABLE = 0.05;
const MAX_READABLE = 0.95;
/** Traço do contorno de ausência, na mesma escala do tracejado de parcial do catálogo. */
const UNAVAILABLE_DASH = '3 3';

type GlyphState = 'zero' | 'unavailable' | 'too-small' | 'too-large' | 'readable';

/** Coordenada de `path` com duas casas: arredondamento de geometria, não número de tela. */
function coord(value: number): string {
  return value.toFixed(2);
}

/** Setor a partir das 12 horas, no sentido horário, para fração entre 0 e 1 exclusivos. */
function wedgePath(fraction: number, radius: number): string {
  const angle = -Math.PI / 2 + fraction * 2 * Math.PI;
  const x = radius + radius * Math.cos(angle);
  const y = radius + radius * Math.sin(angle);
  const largeArc = fraction > 0.5 ? '1' : '0';
  return `M ${coord(radius)} ${coord(radius)} L ${coord(radius)} 0 A ${coord(radius)} ${coord(radius)} 0 ${largeArc} 1 ${coord(x)} ${coord(y)} Z`;
}

/** Fração do recorte, nula quando não houve medição ou não houve base: ausência nunca vira zero. */
function fractionOf(item: FractionStateCase): number | null {
  if (item.part === null || item.total <= 0) return null;
  return item.part / item.total;
}

function stateOf(fraction: number | null): GlyphState {
  if (fraction === null) return 'unavailable';
  if (fraction === 0) return 'zero';
  if (fraction < MIN_READABLE) return 'too-small';
  if (fraction > MAX_READABLE) return 'too-large';
  return 'readable';
}

/**
 * Par de taxa e volume da coluna, escrito num lugar só e usado no corpo e na frase acessível, para
 * quem ouve e quem enxerga receberem o mesmo número com a mesma casa (DAD-5). O zero medido sai sem
 * casa decimal, porque "0,0%" sugere arredondamento de algo que existe.
 */
function pairOf(part: number, total: number, fraction: number): string {
  return formatRateWithVolume(part, total, fraction === 0 ? 0 : 1);
}

/** Trilho do todo e setor da parte, a mesma construção da v1 e da v3 deste modelo. */
function FractionGlyph({ fraction }: { readonly fraction: number }): ReactElement {
  return (
    <svg aria-hidden height={GLYPH_SIZE} viewBox={`0 0 ${String(GLYPH_SIZE)} ${String(GLYPH_SIZE)}`} width={GLYPH_SIZE}>
      {/* Trilho em neutro de dado, nunca --surface-overlay, que no tema claro é o mesmo branco do
          cartão: no zero medido ele é a única coisa desenhada, e precisa ser visto. */}
      <circle cx={GLYPH_RADIUS} cy={GLYPH_RADIUS} fill="var(--line-strong)" r={GLYPH_RADIUS} />
      {fraction >= 1 ? (
        <circle cx={GLYPH_RADIUS} cy={GLYPH_RADIUS} fill="var(--chart-1)" r={GLYPH_RADIUS} />
      ) : fraction > 0 ? (
        <path d={wedgePath(fraction, GLYPH_RADIUS)} fill="var(--chart-1)" />
      ) : null}
    </svg>
  );
}

/** Contorno tracejado da ausência: mesmo diâmetro, nenhum preenchimento, nenhuma fatia zerada. */
function UnavailableGlyph(): ReactElement {
  return (
    <svg aria-hidden height={GLYPH_SIZE} viewBox={`0 0 ${String(GLYPH_SIZE)} ${String(GLYPH_SIZE)}`} width={GLYPH_SIZE}>
      <circle
        cx={GLYPH_RADIUS}
        cy={GLYPH_RADIUS}
        fill="none"
        r={GLYPH_RADIUS - 1}
        stroke="var(--text-muted)"
        strokeDasharray={UNAVAILABLE_DASH}
        strokeWidth={1.5}
      />
    </svg>
  );
}

export default function FractionStatesRow({
  data = defaultData,
  period = defaultPeriod,
  height,
  className,
}: FractionStatesRowProps): ReactElement {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum recorte neste filtro: a comparação de estados fica vazia até o filtro devolver oportunidades.</span>
      </div>
    );
  }

  const phrases = data.map((item) => {
    const fraction = fractionOf(item);
    if (fraction === null || item.part === null) return `${item.label} ${formatUnavailable().toLowerCase()}`;
    const pair = pairOf(item.part, item.total, fraction);
    if (fraction === 0) return `zero medido em ${item.label}, ${pair}`;
    if (fraction < MIN_READABLE) return `${pair} na ${item.label}, abaixo de ${formatPercent(MIN_READABLE, 0)}`;
    if (fraction > MAX_READABLE) return `${pair} na ${item.label}, acima de ${formatPercent(MAX_READABLE, 0)}`;
    return `${pair} na ${item.label}`;
  });
  const summary = `Glifo de fração em ${formatInt(data.length)} estados, nas oportunidades ganhas do ${period}: ${phrases.join('; ')}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {/* ESP-5: só espaço separa as colunas, nunca borda nem divisória. */}
      <div className="grid min-w-0 grid-cols-4 gap-4">
        {data.map((item) => {
          const fraction = fractionOf(item);
          const state = stateOf(fraction);
          return (
            <div className="flex min-w-0 flex-col gap-1.5" key={item.id}>
              {/* A caixa do glifo tem o mesmo tamanho nos quatro estados, e é isso que deixa a
                  comparação ser de estado e não de diâmetro. Fora da faixa legível o número ocupa
                  a caixa, porque a lasca e o disco cheio não se leem como fração. */}
              <div className="flex h-11 w-11 shrink-0 items-center">
                {state === 'unavailable' || fraction === null ? (
                  <UnavailableGlyph />
                ) : state === 'too-small' || state === 'too-large' ? (
                  <span className="kpi-number text-sm font-semibold text-text-primary">{formatPercent(fraction, 1)}</span>
                ) : (
                  <FractionGlyph fraction={fraction} />
                )}
              </div>
              <p className="truncate text-xs leading-none font-medium text-text-secondary">{item.label}</p>
              {fraction === null || item.part === null ? (
                <p className="flex items-center gap-1 text-xs leading-none text-text-muted">
                  <Unplug aria-hidden className="size-3.5 shrink-0" />
                  <span className="truncate">{formatUnavailable()}</span>
                </p>
              ) : (
                <p className="kpi-number text-xs leading-none text-text-primary">{pairOf(item.part, item.total, fraction)}</p>
              )}
              <p className="text-[0.6875rem] leading-snug text-text-muted">{item.note}</p>
            </div>
          );
        })}
      </div>
      {/* DAD-9: o recorte de período e o limite do glifo ficam escritos no corpo, não só na frase. */}
      <p className="mt-3 text-[0.6875rem] leading-snug text-text-muted tabular-nums">
        Oportunidades ganhas no {period}. O setor se lê entre {formatPercent(MIN_READABLE, 0)} e {formatPercent(MAX_READABLE, 0)}; fora dessa faixa o
        número toma o lugar do glifo, e a ausência de medição nunca vira fatia zerada.
      </p>
    </div>
  );
}
