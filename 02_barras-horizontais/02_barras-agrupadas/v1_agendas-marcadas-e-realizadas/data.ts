/**
 * Agendas de primeira reunião marcadas pela pré-vendas e agendas que de fato aconteceram, por canal
 * de entrada do lead, no trimestre de 2026-06 a 2026-08. Contagem de reuniões.
 * Dado fictício e fixo: canais genéricos, nenhuma pessoa nem empresa real.
 */
export interface ChannelMeetings {
  readonly id: string;
  /** Canal de entrada do lead, como a pré-vendas registra. */
  readonly channel: string;
  /** Agendas marcadas no período. */
  readonly scheduled: number;
  /** Agendas marcadas que aconteceram; nunca maior que `scheduled`. */
  readonly held: number;
}

export const data: readonly ChannelMeetings[] = [
  { id: 'canal-busca-paga', channel: 'Busca paga', scheduled: 48, held: 34 },
  { id: 'canal-indicacao', channel: 'Indicação de cliente', scheduled: 31, held: 27 },
  { id: 'canal-rede-social', channel: 'Anúncio em rede social', scheduled: 57, held: 26 },
  { id: 'canal-evento', channel: 'Evento presencial', scheduled: 22, held: 12 },
  { id: 'canal-site', channel: 'Formulário do site', scheduled: 26, held: 19 },
  { id: 'canal-parceiro', channel: 'Parceiro contábil', scheduled: 9, held: 8 },
];
