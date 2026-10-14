/**
 * Desvio diário do tempo de primeira resposta ao lead contra a meta, em minutos, para 6 squads
 * fictícios de pré-vendas em 12 dias. Positivo é squad mais lento que a meta, negativo é mais
 * rápido. Dado fictício e fixo, com um dia de instabilidade de sistema propositalmente extremo
 * em "SDR Noturno" (10 vezes o passo), para exercitar o recorte no teto.
 */
export interface ResponseTimeDeviationSeries {
  readonly id: string;
  readonly name: string;
  readonly deviations: readonly number[];
}

export const data: readonly ResponseTimeDeviationSeries[] = [
  {
    id: 'sdr-manha',
    name: 'SDR Manhã',
    deviations: [0.5, -0.3, 0.8, -0.5, 0.3, -0.2, 0.6, -0.4, 0.2, 0.5, -0.3, 0.4],
  },
  {
    id: 'sdr-tarde',
    name: 'SDR Tarde',
    deviations: [-0.6, -0.8, -0.5, -0.7, -0.9, -0.6, -0.8, -0.7, -0.5, -0.6, -0.8, -0.7],
  },
  {
    id: 'sdr-noturno',
    name: 'SDR Noturno',
    deviations: [0.4, -0.2, 0.3, -0.1, 0.5, 20.0, 0.3, -0.2, 0.4, -0.1, 0.3, 0.2],
  },
  {
    id: 'sdr-fim-de-semana',
    name: 'SDR Fim de Semana',
    deviations: [1.0, 1.2, 0.9, 1.4, 1.1, 1.3, 1.0, 1.5, 1.2, 1.4, 1.1, 1.3],
  },
  {
    id: 'sdr-enterprise',
    name: 'SDR Enterprise',
    deviations: [0.1, -0.1, 0.2, 0.0, -0.2, 0.1, 0.0, 0.2, -0.1, 0.1, 0.0, -0.1],
  },
  {
    id: 'sdr-inbound-rapido',
    name: 'SDR Inbound Rápido',
    deviations: [-1.0, -1.2, -0.9, -1.1, -1.3, -1.0, -1.2, -0.9, -1.1, -1.0, -1.2, -1.1],
  },
];

/** Passo comum a todos os squads, em minutos de desvio contra a meta de resposta. */
export const passo = 2;
