/**
 * Duração de cada etapa da esteira comercial no trimestre, em horas corridas, uma observação por caso
 * concluído. Dado fictício e fixo: as amostras saem de quantis de uma distribuição de Weibull,
 * calculados sem nenhum aleatório, para imitar a cauda longa dos tempos reais. Casos ainda abertos
 * não entram, e cada etapa traz o SLA escrito na régua da operação.
 */
export interface StageDurations {
  readonly id: string;
  /** Nome da etapa; o componente acrescenta a estatística ("mediana") no rótulo. */
  readonly label: string;
  /** O que cada observação conta, no plural: "leads", "agendas". */
  readonly sampleNoun: string;
  /** SLA da etapa em horas, ou `null` quando a etapa não tem régua escrita. */
  readonly slaHours: number | null;
  /** Durações observadas em horas, sem ordem garantida. */
  readonly durationsHours: readonly number[];
}

/**
 * Amostra fixa e assimétrica: o quantil de Weibull em posições igualmente espaçadas, com uma casa.
 * `scale` e `shape` foram escolhidos para dar a mediana e o p90 de cada etapa.
 */
function weibullSample(count: number, scale: number, shape: number): readonly number[] {
  return Array.from({ length: count }, (_, index) => {
    const position = (index + 0.5) / count;
    return Math.round(scale * (-Math.log(1 - position)) ** (1 / shape) * 10) / 10;
  });
}

export const data: readonly StageDurations[] = [
  {
    id: 'primeiro-contato',
    label: 'Até o primeiro contato',
    sampleNoun: 'leads',
    slaHours: 24,
    durationsHours: weibullSample(412, 9.9, 0.731),
  },
  {
    id: 'agenda',
    label: 'Do primeiro contato à agenda',
    sampleNoun: 'agendas',
    slaHours: 72,
    durationsHours: weibullSample(168, 35.2, 1.214),
  },
  {
    id: 'aceite-handoff',
    label: 'Do handoff ao aceite de vendas',
    sampleNoun: 'handoffs',
    slaHours: 8,
    durationsHours: weibullSample(57, 5.27, 0.651),
  },
];
