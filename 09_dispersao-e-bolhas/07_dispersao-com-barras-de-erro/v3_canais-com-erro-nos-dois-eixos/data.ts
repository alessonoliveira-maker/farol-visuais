/**
 * Custo por lead e qualificação por canal num mês fixo, e as DUAS incertezas vêm de origens
 * diferentes de propósito, porque é isso que a versão ensina.
 *
 * `cplSemanal` traz o CPL de cada semana do mês, em reais: a média e o desvio padrão amostral
 * saem daqui no componente, nunca digitados, porque desvio digitado é faixa inventada. `leads` e
 * `qualificados` são a contagem bruta, de onde sai a taxa e o intervalo de Wilson dela.
 *
 * Dado fictício e fixo: nenhum nome é canal, plataforma ou empresa real. Os casos difíceis estão
 * plantados: `display` tem muita variação de preço e pouca incerteza de taxa, porque o volume é
 * grande, e `eventos` tem as duas incertezas largas, porque nem o preço nem a amostra se firmam.
 */
export interface ChannelEstimate {
  readonly id: string;
  readonly name: string;
  readonly cplSemanal: readonly number[];
  readonly leads: number;
  readonly qualificados: number;
}

export const data: readonly ChannelEstimate[] = [
  { id: 'busca-paga', name: 'Busca paga', cplSemanal: [88, 95, 82, 91], leads: 320, qualificados: 118 },
  { id: 'social-pago', name: 'Social pago', cplSemanal: [52, 71, 44, 63], leads: 480, qualificados: 122 },
  { id: 'display', name: 'Display', cplSemanal: [38, 61, 29, 47], leads: 610, qualificados: 79 },
  { id: 'video', name: 'Vídeo', cplSemanal: [120, 142, 98, 131], leads: 190, qualificados: 41 },
  { id: 'email', name: 'E-mail', cplSemanal: [26, 31, 23, 29], leads: 240, qualificados: 79 },
  { id: 'eventos', name: 'Eventos', cplSemanal: [232, 268, 205, 251], leads: 64, qualificados: 29 },
  { id: 'parcerias', name: 'Parcerias', cplSemanal: [148, 163, 139, 155], leads: 96, qualificados: 47 },
  { id: 'lista-fria', name: 'Lista fria', cplSemanal: [58, 66, 51, 62], leads: 410, qualificados: 45 },
];

/** O nível de confiança do intervalo vertical, nomeado na tela e usado no cálculo. */
export const confidence = 0.95;
