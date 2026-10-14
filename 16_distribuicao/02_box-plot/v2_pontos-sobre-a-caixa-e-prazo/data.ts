/**
 * Horas entre a entrada do lead e a agenda marcada, por fila de pré-vendas, no mês. Dado fictício,
 * determinístico, sem nenhuma correspondência com a base real.
 *
 * Uma observação por lead, e não os cinco números prontos, pelo mesmo motivo da v1: o método de
 * quartil muda a caixa em amostra pequena, e com o dado cru a convenção fica declarada num lugar só.
 * Aqui o dado cru é ainda mais necessário, porque a versão desenha **todos** os pontos por cima da
 * caixa, e ponto por cima de resumo pronto não existe.
 *
 * A fila da Larissa M. é deliberadamente bimodal: treze leads entre 3 e 9 horas e treze entre 62 e
 * 96, sem quase nada no meio. Ela é a razão de ser desta versão. Os cinco números dela desenham uma
 * caixa larga com a mediana em 35,5 h, que se lê como "espalhado, centro por volta de um dia e
 * meio", quando o que existe são dois grupos e nenhum caso perto do centro da caixa.
 *
 * A fila da Camila O. é o caso oposto: vinte e dois leads quase todos entre 44 e 48 horas, colados
 * no prazo. A caixa fica minúscula e nove dos vinte e dois passam a ser classificados como fora da
 * cerca, o que mostra que "outlier" é uma conta sobre o intervalo interquartil, não um juízo sobre o
 * caso.
 */

export interface Lead {
  /** Código fictício do lead, o que o drill abriria. */
  readonly id: string;
  /** Horas entre a entrada e a agenda marcada. */
  readonly hours: number;
}

export interface SdrQueue {
  readonly id: string;
  readonly name: string;
  readonly leads: readonly Lead[];
}

/** Prazo acordado entre a entrada do lead e a agenda, em horas. */
export const DEADLINE_HOURS = 48;

/** Teto fixo do eixo, em horas, vindo da régua da métrica e não do maior valor da amostra. */
export const DOMAIN_MAX = 120;

/**
 * Leads que entraram no mês e não chegaram a ter agenda no momento da extração. Não têm horas
 * medidas, então não viram zero nem entram na caixa: são contados no rodapé. Tratá-los como zero
 * hora faria a fila mais abandonada aparecer como a mais rápida de todas.
 */
export const WITHOUT_SCHEDULE = 63;

function queue(id: string, name: string, prefix: number, hours: readonly number[]): SdrQueue {
  return {
    id,
    name,
    leads: hours.map((value, index) => ({ id: `LD ${String(prefix + index)}`, hours: value })),
  };
}

export const data: readonly SdrQueue[] = [
  queue('bruna-c', 'Bruna C.', 6100, [
    2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 11, 12, 13, 14,
    16, 18, 21, 26, 33, 49, 58, 71,
  ]),
  queue('diego-p', 'Diego P.', 6300, [
    5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 25, 26, 28,
    30, 32, 34, 36, 39, 42, 45, 50, 55, 63, 84,
  ]),
  queue('larissa-m', 'Larissa M.', 6500, [
    3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 62, 64, 66, 68, 70, 72, 74,
    78, 82, 86, 90, 92, 96,
  ]),
  queue('camila-o', 'Camila O.', 6700, [
    6, 9, 12, 15, 18, 44, 45, 45, 46, 46, 46, 47, 47, 47, 47, 48, 48, 52, 56, 61,
    68, 88,
  ]),
  queue('rafael-t', 'Rafael T.', 6900, [
    9, 12, 15, 18, 21, 24, 27, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 75, 80,
    86, 94, 104, 118,
  ]),
  queue('ernesto-v', 'Ernesto V.', 7100, [
    4, 6, 8, 11, 14, 19, 24, 31, 40, 51, 64, 70, 79, 88, 95, 101, 108, 112, 116,
  ]),
];
