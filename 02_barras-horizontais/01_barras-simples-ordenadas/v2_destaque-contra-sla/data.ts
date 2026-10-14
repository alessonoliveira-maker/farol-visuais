/**
 * Tempo mediano até o primeiro contato por SDR em 2026-08, em horas úteis contadas da entrada do lead.
 * Dado fictício e fixo: nenhum nome é pessoa real. Exercita o caso difícil: uma SDR exatamente no
 * SLA (não passa), uma que passa por pouco, um empate, um valor pequeno e um nome longo.
 */
export interface FirstContactTime {
  readonly id: string;
  readonly name: string;
  readonly hours: number;
}

export const data: readonly FirstContactTime[] = [
  { id: 'sdr-01', name: 'Rafaela N.', hours: 7.2 },
  { id: 'sdr-02', name: 'Tiago B.', hours: 1.9 },
  { id: 'sdr-03', name: 'Ana Luísa K.', hours: 5.6 },
  { id: 'sdr-04', name: 'Otávio G.', hours: 3.1 },
  { id: 'sdr-05', name: 'Marcela F.', hours: 4 },
  { id: 'sdr-06', name: 'Vinícius O.', hours: 2.4 },
  { id: 'sdr-07', name: 'Luana C.', hours: 4.3 },
  { id: 'sdr-08', name: 'João Vitor E.', hours: 2.4 },
  { id: 'sdr-09', name: 'Patrícia H.', hours: 3.6 },
  { id: 'sdr-10', name: 'Everton J.', hours: 0.6 },
  { id: 'sdr-11', name: 'Sabrina W.', hours: 1.3 },
  { id: 'sdr-12', name: 'Gustavo Henrique A.', hours: 2.8 },
];

/** SLA combinado com a pré-vendas: primeiro contato em até 4 horas úteis. */
export const slaHours = 4;
