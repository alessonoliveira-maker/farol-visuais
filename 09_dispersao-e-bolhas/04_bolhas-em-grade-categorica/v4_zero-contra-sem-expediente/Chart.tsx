import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ContactCell } from './data';

/**
 * Bolhas em grade categórica com os três estados que a grade precisa distinguir: volume vira bolha
 * cheia, zero MEDIDO vira anel tracejado do tamanho mínimo, e hora fora do expediente vira traço.
 * O quarto estado, hora aberta sem apuração, não é desenhado e vai contado no rodapé.
 *
 * Virar tudo a mesma coisa é o defeito que a peça existe para não cometer: hora sem contato dentro
 * do expediente é resultado da operação, hora de sábado nunca existiu, e hora aberta sem apuração é
 * falha de registro. Uma célula vazia responde às três, e cada resposta pede uma decisão diferente.
 */
export interface ContactStateGridProps {
  readonly data?: readonly ContactCell[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 12, right: 24, bottom: 8, left: 8 } as const;
const Y_AXIS_WIDTH = 76;
/**
 * Piso e teto do RAIO em px; a área sai deles, porque é a área que codifica o valor. A GEO-3 pede
 * `Math.sqrt(rMin ** 2 + (rMax ** 2 − rMin ** 2) * v / topo)`, e a conta em área é a mesma
 * identidade: com `area = π·rMin² + t·(π·rMax² − π·rMin²)`, `sqrt(area / π)` devolve aquela raiz.
 *
 * O piso é 5 px, e não os 2,6 px de uma grade sem anel: ele precisa ficar ACIMA do raio do anel de
 * zero, senão a menor contagem medida desenharia menos tinta que a ausência de contagem e a ordem
 * do encoding se inverteria na tela.
 */
const RAIO_MIN = 5;
const RAIO_MAX = 14;
const AREA_MIN = Math.PI * RAIO_MIN * RAIO_MIN;
const AREA_MAX = Math.PI * RAIO_MAX * RAIO_MAX;
/**
 * Raio do anel de zero medido. Fica abaixo do piso da bolha e acima do ponto em que o tracejo
 * desaparece: com raio 4 a circunferência mede 25 px e o padrão de 2 px cabe umas seis vezes, contra
 * os 14 px de um raio 2,2, em que a medição de `03_bolhas/v4` não encontrou tracejo nenhum.
 */
const ZERO_RAIO = 4;
/** Metade do traço de hora sem expediente, em px. */
const DASH_HALF = 6;
/** Degraus redondos da régua de tamanho; o último é o máximo observado (ROT-5b). */
const LEGEND_REFERENCES = [5, 15] as const;
/** Acima desta razão entre a maior e a menor contagem medida, o piso de área vai declarado. */
const RAZAO_PARA_DECLARAR_PISO = 10;
/**
 * O neutro dos dois estados de ausência de bolha. A TOK-1 sugere separar dois estados de ausência
 * dando `--surface-sunken` a um e `--line-strong` ao outro, e aqui isso não se sustenta: medido,
 * `--line-strong` dá 1,79:1 no escuro e 1,83:1 no claro contra o cartão, e `--surface-sunken` dá
 * 1,15:1 nos dois, os três abaixo do piso de 3:1 da ACE-3. Quem separa os dois estados é a FORMA,
 * anel contra traço, que é canal mais forte que cor (ACE-2), e os dois ficam em `--text-muted`,
 * medido em 5,21:1 e 5,37:1.
 */
const AUSENCIA = 'var(--text-muted)';

interface ContactPoint extends ContactCell {
  /** O máximo da grade viaja com a célula: o `shape` do Scatter recebe o ponto, nunca o escopo. */
  readonly maxOfGrid: number;
}

/** As referências menores que o máximo, mais o próprio máximo: a régua sempre alcança a maior bolha. */
function legendValues(maxValor: number): readonly number[] {
  return [...LEGEND_REFERENCES.filter((value) => value < maxValor), maxValor];
}

/** Raio em px de um círculo cuja ÁREA segue a escala linear do `ZAxis`, com domínio a partir de 0. */
function raioPorArea(valor: number, maxValor: number): number {
  if (valor <= 0) return 0;
  const area = AREA_MIN + (valor / maxValor) * (AREA_MAX - AREA_MIN);
  return Math.sqrt(area / Math.PI);
}

/** Fração da área da maior bolha que um valor ocupa depois do piso; é o que o rodapé declara. */
function fracaoDaArea(valor: number, maxValor: number): number {
  const raio = raioPorArea(valor, maxValor);
  return (raio * raio) / (RAIO_MAX * RAIO_MAX);
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}h`;
}

/**
 * A marca de um cruzamento, com os quatro estados resolvidos num só `shape`.
 *
 * Uma série só, e não uma por estado, porque em eixo de categoria o domínio sai da ORDEM DO DADO:
 * com um `Scatter` por estado, a ordem das horas e dos dias passaria a depender de qual estado
 * aparece primeiro em qual série, e a grade sairia com as colunas fora da ordem do relógio. Também
 * não há o que reordenar por cima aqui (REC-13): numa grade categórica duas marcas nunca dividem a
 * mesma posição.
 */
function ContactMark({ cx, cy, payload }: { readonly cx?: number; readonly cy?: number; readonly payload?: ContactPoint }) {
  if (cx === undefined || cy === undefined || payload === undefined) return null;
  if (!payload.open) {
    // Sem expediente: a hora não existiu, e um traço é a marca que não sugere quantidade nenhuma.
    return <line stroke={AUSENCIA} strokeWidth={1.5} x1={cx - DASH_HALF} x2={cx + DASH_HALF} y1={cy} y2={cy} />;
  }
  if (payload.contacts === null) {
    // Hora aberta sem apuração: nada desenhado, e o rodapé conta quantas são.
    return null;
  }
  if (payload.contacts === 0) {
    return <circle cx={cx} cy={cy} fill="none" r={ZERO_RAIO} stroke={AUSENCIA} strokeDasharray="2 2" strokeWidth={1.25} />;
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      fill="var(--chart-1)"
      r={raioPorArea(payload.contacts, payload.maxOfGrid)}
      stroke="var(--surface-raised)"
      strokeWidth={1}
    />
  );
}

export default function ContactStateGrid({ data = defaultData, height, className }: ContactStateGridProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const medidas = data.filter((row) => row.open && row.contacts !== null);
  const comContato = medidas.filter((row) => (row.contacts ?? 0) > 0);
  const zeradas = medidas.filter((row) => row.contacts === 0);
  const fechadas = data.filter((row) => !row.open);
  const semApuracao = data.filter((row) => row.open && row.contacts === null);

  if (comContato.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        {/* Três estados de recorte vazio, e dizer o errado seria inventar o motivo do vazio. */}
        <span>
          {data.length === 0
            ? 'Nenhum contato neste recorte: não há cruzamento de dia e hora para desenhar.'
            : medidas.length === 0
              ? 'Nenhum contato neste recorte: nenhuma hora do recorte teve expediente com apuração.'
              : `Nenhum contato neste recorte: as ${formatInt(medidas.length)} horas apuradas deram zero.`}
        </span>
      </div>
    );
  }

  const contagens = comContato.map((row) => row.contacts ?? 0);
  const maxContacts = Math.max(...contagens);
  const minContacts = Math.min(...contagens);
  const totalContacts = contagens.reduce((soma, valor) => soma + valor, 0);
  const pico = comContato.reduce<ContactCell | null>(
    (atual, row) => (atual === null || (row.contacts ?? 0) > (atual.contacts ?? 0) ? row : atual),
    null,
  );
  const razao = maxContacts / minContacts;
  const legendRows = legendValues(maxContacts);
  const boxLegenda = Math.ceil(2 * raioPorArea(maxContacts, maxContacts));

  /** A grade inteira alimenta a série, e é ela que fixa a ordem das colunas e das linhas. */
  const rows: readonly ContactPoint[] = data.map((row) => ({ ...row, maxOfGrid: maxContacts }));
  const hourOrder = data.map((row) => row.hour);

  /** As mesmas chamadas alimentam a frase acessível e o corpo, para as duas lerem igual (DAD-9). */
  const totalEscrito = formatInt(totalContacts);
  const picoEscrito = formatInt(maxContacts);
  const zerosEscrito = formatInt(zeradas.length);
  const fechadasEscrito = formatInt(fechadas.length);
  const semApuracaoEscrito = formatInt(semApuracao.length);
  const abertura = formatHour(Math.min(...hourOrder));
  const fechamento = formatHour(Math.max(...hourOrder));
  const picoDia = pico === null ? 'sem pico medido' : pico.day.toLowerCase();
  const picoHora = pico === null ? '' : formatHour(pico.hour);

  const summary =
    `Grade de bolhas com ${totalEscrito} contatos por dia e hora, de ${abertura} a ${fechamento}. ` +
    `Pico na ${picoDia} às ${picoHora}, com ${picoEscrito}. ` +
    `${zerosEscrito} horas abertas deram zero medido e saem em anel, ${fechadasEscrito} ficam fora do expediente ` +
    `e ${semApuracaoEscrito} não têm apuração.`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as ContactPoint | undefined;
    if (!row) return null;
    const estado = !row.open ? 'sem expediente' : row.contacts === null ? formatUnavailable() : formatInt(row.contacts);
    const entries = [{ dataKey: 'contacts', name: 'Contatos', value: estado }] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={`${row.day}, ${formatHour(row.hour)}`} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {`Pico na ${picoDia} às ${picoHora}, com ${picoEscrito} contatos de ${totalEscrito} na semana`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            {/* Os dois eixos são CATEGORIA, então vale a EIX-3 como está escrita e não a exceção da
                EIX-3b, reescopada em 2026-09-28 para os dois eixos quantitativos lidos por posição.
                A grade horizontal separa as linhas de dia; a coluna de hora já se lê pelo tique. */}
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              allowDuplicatedCategory={false}
              axisLine={false}
              dataKey="hour"
              interval={0}
              name="Hora"
              tick={{ ...AXIS_PROPS.tick, className: 'font-display' }}
              tickFormatter={(value: number) => formatHour(value)}
              tickMargin={8}
              type="category"
            />
            <YAxis {...AXIS_PROPS} allowDuplicatedCategory={false} axisLine={false} dataKey="day" interval={0} name="Dia" tickMargin={8} type="category" width={Y_AXIS_WIDTH} />
            <ZAxis dataKey="contacts" domain={[0, maxContacts]} name="Contatos" range={[AREA_MIN, AREA_MAX]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={[...rows]} isAnimationActive={animate} name="Contatos" shape={<ContactMark />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="mt-2 flex shrink-0 items-center gap-6 text-[0.6875rem] text-text-muted">
        <span>Contatos</span>
        {legendRows.map((value) => (
          <span className="flex items-end gap-2.5" key={value}>
            <svg height={boxLegenda} width={boxLegenda}>
              <circle
                cx={boxLegenda / 2}
                cy={boxLegenda - raioPorArea(value, maxContacts)}
                fill="var(--chart-1)"
                r={raioPorArea(value, maxContacts)}
                stroke="var(--surface-raised)"
                strokeWidth={1}
              />
            </svg>
            <span className="kpi-number">{formatInt(value)}</span>
          </span>
        ))}
        {/* As amostras saem na forma da marca, e não em quadrado de cor: é a forma que separa os
            estados aqui, então uma amostra que não fosse a própria forma não ensinaria nada (ROT-4). */}
        <span className="flex items-end gap-2">
          <svg height={boxLegenda} width={2 * ZERO_RAIO + 3}>
            <circle cx={ZERO_RAIO + 1.5} cy={boxLegenda - ZERO_RAIO - 1} fill="none" r={ZERO_RAIO} stroke={AUSENCIA} strokeDasharray="2 2" strokeWidth={1.25} />
          </svg>
          <span>zero medido</span>
        </span>
        <span className="flex items-end gap-2">
          <svg height={boxLegenda} width={2 * DASH_HALF + 2}>
            <line stroke={AUSENCIA} strokeWidth={1.5} x1={1} x2={2 * DASH_HALF + 1} y1={boxLegenda - ZERO_RAIO - 1} y2={boxLegenda - ZERO_RAIO - 1} />
          </svg>
          <span>sem expediente</span>
        </span>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {razao >= RAZAO_PARA_DECLARAR_PISO
          ? `piso de área: ${formatInt(minContacts)} contatos leem ${formatPercent(fracaoDaArea(minContacts, maxContacts), 0)} da área e valem ${formatPercent(minContacts / maxContacts, 0)}`
          : 'área proporcional ao valor, sem piso declarado'}
      </p>
      <p aria-hidden className="mt-1 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`${semApuracaoEscrito} horas de expediente com contato ${formatUnavailable()} ficam fora do plano`}
      </p>
    </div>
  );
}
