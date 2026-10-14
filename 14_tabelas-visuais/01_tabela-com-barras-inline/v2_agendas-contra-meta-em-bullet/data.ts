/**
 * Agendas produzidas na semana por SDR, contra a meta comum de 18 agendas por semana.
 * Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface SdrAgendas {
  readonly id: string;
  readonly name: string;
  readonly agendas: number;
}

/** Meta semanal, comum a todas as linhas: a escala do bullet é a mesma para todo mundo. */
export const weeklyTarget = 18;

export const data: readonly SdrAgendas[] = [
  { id: 'sdr-01', name: 'Vitor Hugo Nascimento', agendas: 34 },
  { id: 'sdr-02', name: 'Bianca Ferraz', agendas: 24 },
  { id: 'sdr-03', name: 'Thiago Amaral', agendas: 22 },
  { id: 'sdr-04', name: 'Renata Bulhões', agendas: 21 },
  { id: 'sdr-05', name: 'Diego Salgado', agendas: 19 },
  { id: 'sdr-06', name: 'Fernanda Chagas', agendas: 18 },
  { id: 'sdr-07', name: 'Camila dos Reis', agendas: 17 },
  { id: 'sdr-08', name: 'Marcelo Anacleto', agendas: 16 },
  { id: 'sdr-09', name: 'Juliana Prestes', agendas: 15 },
  { id: 'sdr-10', name: 'Otávio Bandeira', agendas: 9 },
];
