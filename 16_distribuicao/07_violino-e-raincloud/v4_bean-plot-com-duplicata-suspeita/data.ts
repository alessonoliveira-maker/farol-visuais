/**
 * Minutos entre a entrada do lead e o primeiro contato humano, por canal de entrada, no mês. Dado
 * fictício e fixo, sem correspondência com a base real: os valores saíram uma vez de um gerador com
 * semente e estão escritos abaixo.
 *
 * Uma observação por lead, em minuto inteiro, que é a precisão do registro. Valor repetido é
 * esperado nessa precisão; o que não é esperado são os 37 leads do primeiro canal com exatamente
 * 0 minuto, um quarto do grupo num valor só. É a assinatura de carimbo automático, e a peça existe
 * para o traço deles aparecer em vez de sumir dentro de uma curva suave.
 *
 * O último canal tem 9 leads de propósito: com tão pouco não há forma a estimar, só os traços.
 */

export interface Channel {
  readonly id: string;
  readonly name: string;
  /** Minutos até o primeiro contato de cada lead. */
  readonly minutes: readonly number[];
}

/**
 * Leads que entraram no mês e ainda não tinham contato na extração. Não têm tempo medido, então não
 * viram zero, e aqui isso importa em dobro: zero é justamente o valor sob suspeita.
 */
export const WITHOUT_CONTACT = 18;

export const data: readonly Channel[] = [
  {
    id: 'formulario',
    name: 'Formulário do site',
    minutes: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 23, 13, 8, 14, 16, 7, 18, 34, 34, 41, 12,
      9, 13, 29, 46, 12, 38, 12, 32, 25, 7, 11, 13, 29, 7, 22, 45, 12, 17, 21, 17, 18, 44, 23, 21,
      33, 16, 34, 18, 11, 5, 9, 6, 12, 10, 43, 5, 9, 8, 11, 22, 9, 9, 13, 20, 17, 18, 7, 12,
      14, 18, 20, 18, 26, 18, 8, 4, 20, 10, 14, 22, 15, 5, 37, 14, 11, 11, 24, 13, 28, 35, 13, 9,
      8, 6, 25, 10, 15, 35, 43, 9, 8, 30, 30, 14, 43, 13, 12, 5, 13, 23, 102, 10, 23, 9, 6, 10,
      3, 9, 41, 22, 12, 18, 6,
    ],
  },
  {
    id: 'chat',
    name: 'Chat do site',
    minutes: [
      9, 10, 6, 15, 6, 9, 19, 2, 15, 6, 6, 6, 10, 19, 3, 6, 20, 22, 26, 11, 11, 10, 4, 4,
      4, 11, 22, 38, 2, 2, 3, 16, 15, 12, 11, 8, 36, 7, 3, 7, 6, 4, 12, 10, 4, 33, 11, 21,
      8, 4, 12, 3, 12, 20, 5, 11, 11, 5, 31, 18, 12, 9, 9, 3, 9, 4, 9, 5, 18, 7, 7, 26,
      4, 9, 10, 3, 7, 11, 5, 11, 21, 7, 3, 19, 16, 22, 12, 10, 4, 11, 15, 31, 5, 29, 43, 5,
      6, 4, 34, 5, 3, 3, 5, 2, 6, 7, 3, 3, 5, 18, 5, 23, 12, 7, 8, 6, 4, 9, 30, 9,
      20, 14, 14, 8, 15, 4,
    ],
  },
  {
    id: 'telefone',
    name: 'Telefone',
    minutes: [
      22, 48, 45, 36, 39, 12, 23, 23, 25, 10, 9, 14, 11, 16, 30, 22, 10, 30, 24, 43, 19, 22, 28, 25,
      24, 17, 38, 15, 15, 42, 25, 51, 20, 67, 24, 45, 29, 15, 11, 19, 20, 13, 26, 24, 12, 57, 58, 24,
      14, 18, 29, 41, 23, 67, 33, 21, 37, 26, 54, 30, 16, 22, 67, 69, 55, 7, 13, 27, 6, 31, 9, 16,
      22, 44, 47, 39, 41, 24, 48, 19, 11, 18, 10, 21, 31, 58, 33, 25, 20, 52, 21, 27, 19, 25, 19, 12,
      19, 26,
    ],
  },
  {
    id: 'indicacao',
    name: 'Indicação de parceiro',
    minutes: [
      4, 9, 12, 18, 25, 31, 47, 58, 96,
    ],
  },
];
