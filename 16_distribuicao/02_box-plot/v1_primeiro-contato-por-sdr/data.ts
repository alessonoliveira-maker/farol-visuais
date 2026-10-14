/**
 * Minutos entre a entrada do lead e o primeiro contato humano, por SDR, no mês. Dado fictício,
 * determinístico, sem nenhuma correspondência com a base real.
 *
 * O array traz uma observação por lead, e não os cinco números do box já calculados. O resumo é
 * derivado no componente porque **o método de quartil muda a caixa**: interpolação linear,
 * dobradiças de Tukey e as duas funções de planilha dão resultados diferentes em amostra pequena.
 * Com o dado cru na mão, o método fica declarado num lugar só e pode ser trocado sem refazer a
 * origem; com o resumo pronto, ninguém mais sabe qual convenção produziu aquela caixa.
 *
 * O código do lead nasce aqui, e não no desenho: outlier sem nome é curiosidade, e com nome vira
 * fila de trabalho. Os prefixos são espaçados para nenhum código se repetir entre SDRs.
 */

export interface Contact {
  /** Código fictício do lead, o que o drill abriria. */
  readonly id: string;
  /** Minutos até o primeiro contato humano. */
  readonly minutes: number;
}

export interface SdrQueue {
  readonly id: string;
  readonly name: string;
  readonly contacts: readonly Contact[];
}

/** SLA de primeiro contato, em minutos. */
export const SLA_MINUTES = 30;

/** Teto fixo do eixo, em minutos, vindo da régua da métrica e não do maior valor da amostra. */
export const DOMAIN_MAX = 200;

/**
 * Leads que entraram no mês e ainda não receberam nenhum contato no momento da extração. Não têm
 * tempo medido, então não viram zero nem entram na caixa: são contados no rodapé. Tratá-los como
 * zero puxaria toda mediana para baixo e premiaria justamente a fila mais abandonada.
 */
export const WITHOUT_CONTACT = 24;

function queue(id: string, name: string, prefix: number, minutes: readonly number[]): SdrQueue {
  return {
    id,
    name,
    contacts: minutes.map((value, index) => ({ id: `LD ${String(prefix + index)}`, minutes: value })),
  };
}

export const data: readonly SdrQueue[] = [
  queue('bruna-c', 'Bruna C.', 4100, [
    11, 5, 11, 3, 4, 10, 7, 2, 3, 4, 4, 7, 9, 9, 9, 6, 5, 13, 15, 6,
    19, 19, 4, 7, 6, 13, 10, 8, 4, 21, 6, 16, 4, 4, 28, 11, 3, 4, 1, 8,
    19, 14, 5, 7, 2, 5, 10, 6, 6, 10, 10, 7, 8, 9, 20, 14, 12, 7, 13, 6,
    9, 7,
  ]),
  queue('diego-p', 'Diego P.', 4300, [
    6, 36, 15, 10, 17, 16, 7, 7, 15, 24, 8, 7, 8, 27, 146, 5, 10, 14, 15, 55,
    3, 9, 4, 23, 7, 17, 5, 2, 40, 21, 2, 35, 27, 30, 22, 4, 7, 35, 13, 27,
    12, 12, 3, 4, 26, 21, 6, 14, 15, 11, 10, 16, 21, 22, 31, 7, 12, 37,
  ]),
  queue('larissa-m', 'Larissa M.', 4500, [
    11, 34, 17, 32, 7, 50, 38, 27, 10, 24, 8, 35, 3, 23, 25, 12, 6, 16, 4, 26,
    76, 17, 102, 45, 90, 33, 4, 26, 6, 19, 35, 6, 123, 30, 110, 24, 10, 24, 9, 10,
    74, 29, 10, 83, 28, 11, 3, 66, 11,
  ]),
  queue('rafael-t', 'Rafael T.', 4700, [
    31, 5, 13, 27, 7, 72, 46, 118, 21, 67, 21, 36, 174, 29, 13, 69, 110, 26, 124, 138,
    87, 125, 67, 25, 30, 3, 42, 5, 54, 65, 15, 39, 5, 59, 72, 22, 15, 6, 18, 45,
    8, 9, 28, 29, 30, 34, 60, 54, 109, 84, 28, 24, 30, 11,
  ]),
  queue('camila-o', 'Camila O.', 4900, [
    98, 42, 50, 44, 19, 38, 15, 13, 9, 66, 85, 26, 47, 110, 80, 9, 53, 63, 46, 9,
    21, 22, 13, 33, 72, 19, 83, 188, 19, 76, 32, 22, 18, 15, 32, 55, 15, 47, 13, 55,
    13,
  ]),
  queue('ernesto-v', 'Ernesto V.', 5100, [
    34, 36, 166, 12, 13, 179, 22, 14, 4, 2, 35, 1, 18, 2, 1, 55, 1, 173, 6, 9,
    89, 104, 102, 40, 12, 35, 7, 12, 10, 23, 35, 6, 92,
  ]),
];
