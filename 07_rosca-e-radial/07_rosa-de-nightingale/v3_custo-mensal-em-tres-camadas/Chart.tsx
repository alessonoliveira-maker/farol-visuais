import { cn } from '@/lib/utils';
import { formatCurrencyCompact, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { data as defaultData, type MonthlyCostLayers } from './data';

/**
 * Rosa de Nightingale empilhada: cada mês é um setor de ângulo igual com três camadas de custo, e o
 * raio de cada fronteira sai da raiz quadrada do total acumulado até ali, não do valor isolado da
 * camada, para a área de cada faixa continuar proporcional ao seu valor. Desenhada em SVG puro
 * (arcPath próprio) porque o empilhamento não cabe no `shape` de um único `Pie` do Recharts.
 *
 * A escala tem teto fixo, e mês acima do teto tem a marca cortada. O corte é **declarado**, com as
 * duas tarjas de quebra na cor do cartão, a marca passando para fora do anel do topo e o valor real
 * escrito no perímetro e no rodapé. Antes ele era calado: a marca parava exatamente no anel do topo
 * e dois meses de valores diferentes desenhavam igual, então o leitor concluía empate onde havia
 * diferença, sem nada na tela que o avisasse.
 */
export interface MonthlyCostRoseProps {
  readonly data?: readonly MonthlyCostLayers[];
  readonly height?: number;
  readonly className?: string;
}

const SIZE = 400;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_MIN = 46;
const R_MAX = 148;
const LABEL_GAP = 14;
/**
 * Teto da escala. Ele é fixo, e não derivado do maior mês, para o tamanho do setor querer dizer a
 * mesma coisa quando o recorte muda: escala que persegue o máximo faz o mesmo custo desenhar duas
 * áreas diferentes em dois filtros. O preço dessa escolha é que existe mês acima do teto, e é por
 * isso que o corte vai desenhado (`CUT_*` abaixo) em vez de silencioso.
 */
const SCALE_TOP = 80_000;
const GRID_VALUES = [20_000, 40_000, 60_000, 80_000] as const;
/**
 * Quanto a marca cortada passa do anel do topo, em unidades do `viewBox`. Ela sai para fora de
 * propósito: parando rente ao anel, a marca afirmaria justamente o valor daquele anel, que é o
 * empate que o corte silencioso produzia.
 */
const CUT_OVERSHOOT = 6;
/** As duas tarjas de quebra, em raio e espessura: elas tiram tinta da marca, não acrescentam. */
const CUT_BREAK_RADII = [R_MAX - 9, R_MAX - 2] as const;
const CUT_BREAK_WIDTH = 3;
const SEPARATOR = 'var(--surface-raised)';
const GRID_STROKE = 'var(--line-subtle)';

const LAYERS = [
  { key: 'estrutura', label: 'Estrutura', color: 'var(--chart-6)' },
  { key: 'equipe', label: 'Equipe', color: 'var(--chart-3)' },
  { key: 'midia', label: 'Mídia', color: 'var(--chart-1)' },
] as const;

/** Ponto de relógio: ângulo 0 no topo, crescendo no sentido horário. */
function point(angleDeg: number, r: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
}

/**
 * Raio pela raiz quadrada com furo compensado na própria conta: a área do setor é
 * proporcional ao valor mesmo com `R_MIN` maior que zero, porque a área de um anel vale
 * `r² − rMin²`, não `r²`. Sem essa compensação, a mesma diferença de valor pesa mais perto do
 * centro do que na borda, e uma camada interna pequena pode desenhar mais área que uma camada
 * externa maior no mesmo mês.
 */
function ringRadius(value: number): number {
  const v = Math.min(value, SCALE_TOP);
  return Math.sqrt(R_MIN ** 2 + (R_MAX ** 2 - R_MIN ** 2) * (v / SCALE_TOP));
}

/** Arco aberto, só o traço: é a forma da tarja de quebra de uma marca radial. */
function arcStroke(r: number, a0: number, a1: number): string {
  const start = point(a0, r);
  const end = point(a1, r);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${String(start.x)} ${String(start.y)} A ${String(r)} ${String(r)} 0 ${String(large)} 1 ${String(end.x)} ${String(end.y)}`;
}

function arcPath(r1: number, r2: number, a0: number, a1: number): string {
  const outerStart = point(a0, r2);
  const outerEnd = point(a1, r2);
  const innerEnd = point(a1, r1);
  const innerStart = point(a0, r1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${String(outerStart.x)} ${String(outerStart.y)} A ${String(r2)} ${String(r2)} 0 ${String(large)} 1 ${String(outerEnd.x)} ${String(outerEnd.y)} L ${String(innerEnd.x)} ${String(innerEnd.y)} A ${String(r1)} ${String(r1)} 0 ${String(large)} 0 ${String(innerStart.x)} ${String(innerStart.y)} Z`;
}

export default function MonthlyCostRose({ data = defaultData, height, className }: MonthlyCostRoseProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <span>Nenhuma linha neste recorte: não houve custo mensal registrado.</span>
      </div>
    );
  }

  const step = 360 / data.length;
  const totals = LAYERS.map((layer) => ({
    ...layer,
    total: data.reduce((sum, row) => sum + row[layer.key], 0),
  }));
  const shares = data.map((row) => {
    const total = row.midia + row.equipe + row.estrutura;
    return { month: row.month, total, midiaShare: total > 0 ? row.midia / total : 0 };
  });
  const topMedia = shares.reduce((a, b) => (b.midiaShare > a.midiaShare ? b : a));
  /** Meses acima do teto da escala: a marca deles é cortada, e o corte precisa ir escrito. */
  const cutMonths = shares.filter((row) => row.total > SCALE_TOP);

  /** Com um mês cortado a frase nomeia o valor real; com vários ela conta, para caber na ACE-1. */
  const firstCut = cutMonths[0];
  const cutNote =
    firstCut === undefined
      ? ''
      : cutMonths.length === 1
        ? ` ${formatMonthShort(firstCut.month)} chega a ${formatCurrencyCompact(firstCut.total)} e sai cortada no teto de ${formatCurrencyCompact(SCALE_TOP)}.`
        : ` ${formatInt(cutMonths.length)} meses passam do teto de ${formatCurrencyCompact(SCALE_TOP)} e saem cortados.`;

  const summary = `Rosa de Nightingale empilhada: custo mensal de 2025 em mídia, equipe e estrutura, com área proporcional ao valor. A mídia pesa mais em ${formatMonthShort(topMedia.month)}, com ${formatPercent(topMedia.midiaShare, 0)} do mês.${cutNote}`;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col items-center gap-3', className)} role="figure" style={style}>
      <ul className="flex shrink-0 flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs">
        {totals.map((layer) => (
          <li className="flex items-center gap-1.5" key={layer.key}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: layer.color }} />
            <span className="text-text-secondary">{layer.label}</span>
            <span className="kpi-number text-text-primary">{formatCurrencyCompact(layer.total)}</span>
          </li>
        ))}
      </ul>
      <svg
        aria-hidden
        className="h-full w-auto min-h-0 flex-1 aspect-square"
        role="presentation"
        viewBox={`0 0 ${String(SIZE)} ${String(SIZE)}`}
      >
        {data.map((row, i) => {
          const a0 = i * step;
          const a1 = a0 + step;
          const total = row.estrutura + row.equipe + row.midia;
          const isCut = total > SCALE_TOP;
          const rEstrutura = ringRadius(row.estrutura);
          const rEquipe = ringRadius(row.estrutura + row.equipe);
          /* Mês acima do teto desenha para fora do anel do topo, e não rente a ele: é o sinal de
             que a marca saiu da escala, no lugar do empate que o corte calado produzia. */
          const rMidia = isCut ? R_MAX + CUT_OVERSHOOT : ringRadius(total);
          const mid = (a0 + a1) / 2;
          const labelPoint = point(mid, rMidia + LABEL_GAP);
          const anchor = Math.sin((mid * Math.PI) / 180) >= 0 ? 'start' : 'end';
          return (
            <g key={row.month}>
              <path d={arcPath(R_MIN, rEstrutura, a0, a1)} fill="var(--chart-6)" stroke={SEPARATOR} strokeWidth={1} />
              <path d={arcPath(rEstrutura, rEquipe, a0, a1)} fill="var(--chart-3)" stroke={SEPARATOR} strokeWidth={1} />
              <path d={arcPath(rEquipe, rMidia, a0, a1)} fill="var(--chart-1)" stroke={SEPARATOR} strokeWidth={1} />
              {/* Duas tarjas na cor do cartão atravessando a marca: é a marca universal de escala
                  interrompida. Aqui elas são arcos, e não diagonais como numa coluna, porque a
                  direção de medida é o raio, e a quebra precisa atravessar o raio de ponta a ponta. */}
              {isCut
                ? CUT_BREAK_RADII.map((r) => (
                    <path
                      d={arcStroke(r, a0, a1)}
                      fill="none"
                      key={r}
                      stroke={SEPARATOR}
                      strokeWidth={CUT_BREAK_WIDTH}
                    />
                  ))
                : null}
              <text
                dominantBaseline="central"
                fontSize={11}
                textAnchor={anchor}
                x={labelPoint.x}
                y={labelPoint.y}
              >
                <tspan className="font-sans" dy={isCut ? '-0.55em' : '0'} fill="var(--text-muted)" x={labelPoint.x}>
                  {formatMonthShort(row.month)}
                </tspan>
                {/* O valor real do mês cortado, escrito: é ele que devolve a precisão que o corte
                    tirou, e sem ele o leitor conclui empate onde há diferença. */}
                {isCut ? (
                  <tspan className="font-display" dy="1.15em" fill="var(--text-secondary)" fontWeight={500} x={labelPoint.x}>
                    {formatCurrencyCompact(total)}
                  </tspan>
                ) : null}
              </text>
            </g>
          );
        })}
        {/* Grade e valores de escala por cima das pétalas: caso contrário o mês com maior
            raio pinta sobre a linha e o rótulo, e a referência some atrás da própria rosa. */}
        {GRID_VALUES.map((v) => (
          <circle cx={CX} cy={CY} fill="none" key={v} r={ringRadius(v)} stroke={GRID_STROKE} strokeDasharray="2 3" />
        ))}
        <text
          className="font-sans"
          fill="var(--text-muted)"
          fontSize={11}
          paintOrder="stroke"
          stroke="var(--surface-raised)"
          strokeLinejoin="round"
          strokeWidth={4}
          textAnchor="middle"
          x={CX}
          y={CY - ringRadius(GRID_VALUES[0]) - 3}
        >
          {formatCurrencyCompact(GRID_VALUES[0])}
        </text>
        <text
          className="font-sans"
          fill="var(--text-muted)"
          fontSize={11}
          paintOrder="stroke"
          stroke="var(--surface-raised)"
          strokeLinejoin="round"
          strokeWidth={4}
          textAnchor="middle"
          x={CX}
          y={CY - ringRadius(SCALE_TOP) - 3}
        >
          {formatCurrencyCompact(SCALE_TOP)}
        </text>
      </svg>
      {/* A grandeza lida vai escrita, e não subentendida: o ângulo é igual nos doze meses e o raio
          cresce pela raiz, então quem compara ângulo ou raio lê errado. O corte também vai escrito
          aqui, além do sinal de quebra na própria marca. */}
      <div
        aria-hidden
        className="flex shrink-0 flex-wrap justify-center gap-x-3 gap-y-0.5 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span>a grandeza é a área do setor, não o raio</span>
        <span>ângulo igual em todos os meses</span>
        {cutMonths.map((cut) => (
          <span key={cut.month}>
            {`${formatMonthShort(cut.month)} sai da escala: total de ${formatCurrencyCompact(cut.total)}, marca cortada em ${formatCurrencyCompact(SCALE_TOP)}`}
          </span>
        ))}
      </div>
    </figure>
  );
}
