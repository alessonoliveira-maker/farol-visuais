/**
 * Agendas marcadas por canal de origem num mês fixo: `leads` é o denominador e `agendas` é o
 * numerador da taxa de agenda. Dado fictício e fixo: nenhum nome é canal ou empresa real.
 *
 * O dado existe para o caso difícil, não para o caminho feliz: `lista-fria` tem 3 leads e 1
 * agenda, então a taxa dele é 33,3% com intervalo de confiança que vai de cerca de 6% a 79%, e
 * `webinar` tem 12 leads. Os dois ficam abaixo do piso de amostra e servem para mostrar o que
 * acontece com o eixo quando o intervalo deles entra na conta do domínio: ele dobra, de 45% para
 * 90%, e os seis canais que têm medida passam a ocupar metade do plano.
 *
 * As taxas dos seis medidos ficam todas abaixo de 30% de propósito, para a faixa alta do plano
 * sobrar limpa para os dois rótulos de duas linhas dos canais sem amostra.
 */
export interface ChannelAgendaCount {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  readonly agendas: number;
}

export const data: readonly ChannelAgendaCount[] = [
  { id: 'social-pago', name: 'Social pago', leads: 340, agendas: 48 },
  { id: 'busca-paga', name: 'Busca paga', leads: 270, agendas: 62 },
  { id: 'display', name: 'Display', leads: 210, agendas: 26 },
  { id: 'email', name: 'E-mail', leads: 150, agendas: 27 },
  { id: 'indicacao', name: 'Indicação', leads: 96, agendas: 20 },
  { id: 'eventos', name: 'Eventos', leads: 44, agendas: 7 },
  { id: 'webinar', name: 'Webinar', leads: 12, agendas: 5 },
  { id: 'lista-fria', name: 'Lista fria', leads: 3, agendas: 1 },
];

/**
 * O piso de volume: abaixo dele a taxa não se publica com intervalo, porque o intervalo cobriria
 * meio eixo e o leitor leria a largura como se fosse informação sobre o canal.
 */
export const minimumSample = 20;

/** O nível de confiança do intervalo desenhado, nomeado na tela e usado no cálculo. */
export const confidence = 0.95;
