/**
 * Ticket dos negócios ganhos no ano, um por linha, agrupados pelo trimestre em que fecharam. Valor em
 * reais. Dado fictício e fixo: nenhuma família existe e nenhum ticket saiu da base.
 *
 * O beeswarm precisa de um caso por linha, nunca de contagem por faixa: a pergunta da versão é onde
 * estão os maiores, e o maior desaparece dentro de um agregado.
 *
 * As duas verticais existem para a cor ter um papel só. Elas se chamam A e B de propósito: nome de
 * produto inventado passa a ler como produto de verdade, e o catálogo não carrega marca.
 */

export type Vertical = 'A' | 'B';

export interface WonDeal {
  readonly id: string;
  readonly client: string;
  /** Ticket do negócio ganho, em reais. */
  readonly ticket: number;
  readonly vertical: Vertical;
}

export interface Quarter {
  readonly id: string;
  readonly label: string;
  readonly deals: readonly WonDeal[];
}

export const data: readonly Quarter[] = [
  {
    id: 't1',
    label: '1º tri',
    deals: [
      { id: 't1-57', client: 'Família Cardoso', ticket: 11_000, vertical: 'A' }, { id: 't1-02', client: 'Família Hollanda', ticket: 15_000, vertical: 'B' },
      { id: 't1-34', client: 'Família Valença', ticket: 15_000, vertical: 'A' }, { id: 't1-61', client: 'Família Arantes', ticket: 19_000, vertical: 'B' },
      { id: 't1-30', client: 'Família Xavier', ticket: 19_500, vertical: 'A' }, { id: 't1-40', client: 'Família Dantas', ticket: 19_500, vertical: 'A' },
      { id: 't1-07', client: 'Família Macedo', ticket: 21_500, vertical: 'B' }, { id: 't1-11', client: 'Família Klabin', ticket: 22_500, vertical: 'B' },
      { id: 't1-31', client: 'Família Arantes', ticket: 22_500, vertical: 'A' }, { id: 't1-08', client: 'Família Teixeira', ticket: 23_000, vertical: 'A' },
      { id: 't1-03', client: 'Família Ourique', ticket: 23_500, vertical: 'B' }, { id: 't1-48', client: 'Família Delgado', ticket: 25_500, vertical: 'B' },
      { id: 't1-09', client: 'Família Andrade', ticket: 26_500, vertical: 'A' }, { id: 't1-10', client: 'Família Dantas', ticket: 26_500, vertical: 'A' },
      { id: 't1-13', client: 'Família Yamada', ticket: 26_500, vertical: 'B' }, { id: 't1-15', client: 'Família Ibiapina', ticket: 26_500, vertical: 'A' },
      { id: 't1-16', client: 'Família Pontes', ticket: 26_500, vertical: 'A' }, { id: 't1-56', client: 'Família Zuchetti', ticket: 27_000, vertical: 'A' },
      { id: 't1-59', client: 'Família Queiroz', ticket: 27_500, vertical: 'A' }, { id: 't1-45', client: 'Família Ibiapina', ticket: 28_500, vertical: 'A' },
      { id: 't1-06', client: 'Família Furtado', ticket: 29_000, vertical: 'B' }, { id: 't1-69', client: 'Família Andrade', ticket: 29_500, vertical: 'A' },
      { id: 't1-42', client: 'Família Rezende', ticket: 30_500, vertical: 'A' }, { id: 't1-20', client: 'Família Nogueira', ticket: 31_500, vertical: 'A' },
      { id: 't1-23', client: 'Família Esteves', ticket: 31_500, vertical: 'A' }, { id: 't1-27', client: 'Família Cardoso', ticket: 32_000, vertical: 'A' },
      { id: 't1-44', client: 'Família Bittencourt', ticket: 33_500, vertical: 'A' }, { id: 't1-24', client: 'Família Lavigne', ticket: 34_000, vertical: 'A' },
      { id: 't1-39', client: 'Família Andrade', ticket: 34_500, vertical: 'A' }, { id: 't1-63', client: 'Família Ourique', ticket: 35_000, vertical: 'A' },
      { id: 't1-33', client: 'Família Ourique', ticket: 35_500, vertical: 'A' }, { id: 't1-46', client: 'Família Pontes', ticket: 36_000, vertical: 'A' },
      { id: 't1-17', client: 'Família Wanderley', ticket: 36_500, vertical: 'B' }, { id: 't1-51', client: 'Família Ubiratan', ticket: 36_500, vertical: 'A' },
      { id: 't1-47', client: 'Família Wanderley', ticket: 37_000, vertical: 'A' }, { id: 't1-62', client: 'Família Hollanda', ticket: 37_000, vertical: 'A' },
      { id: 't1-22', client: 'Família Barroso', ticket: 37_500, vertical: 'B' }, { id: 't1-29', client: 'Família Queiroz', ticket: 38_000, vertical: 'B' },
      { id: 't1-41', client: 'Família Klabin', ticket: 38_000, vertical: 'A' }, { id: 't1-64', client: 'Família Valença', ticket: 39_500, vertical: 'B' },
      { id: 't1-71', client: 'Família Klabin', ticket: 39_500, vertical: 'A' }, { id: 't1-68', client: 'Família Teixeira', ticket: 40_500, vertical: 'A' },
      { id: 't1-12', client: 'Família Rezende', ticket: 42_000, vertical: 'B' }, { id: 't1-43', client: 'Família Yamada', ticket: 42_000, vertical: 'B' },
      { id: 't1-18', client: 'Família Delgado', ticket: 42_500, vertical: 'A' }, { id: 't1-52', client: 'Família Barroso', ticket: 42_500, vertical: 'B' },
      { id: 't1-38', client: 'Família Teixeira', ticket: 43_500, vertical: 'B' }, { id: 't1-58', client: 'Família Juruna', ticket: 44_500, vertical: 'A' },
      { id: 't1-50', client: 'Família Nogueira', ticket: 45_000, vertical: 'B' }, { id: 't1-65', client: 'Família Camargo', ticket: 46_000, vertical: 'B' },
      { id: 't1-25', client: 'Família Sampaio', ticket: 47_000, vertical: 'A' }, { id: 't1-60', client: 'Família Xavier', ticket: 47_000, vertical: 'B' },
      { id: 't1-04', client: 'Família Valença', ticket: 52_500, vertical: 'B' }, { id: 't1-49', client: 'Família Guimarães', ticket: 52_500, vertical: 'A' },
      { id: 't1-70', client: 'Família Dantas', ticket: 53_500, vertical: 'A' }, { id: 't1-53', client: 'Família Esteves', ticket: 54_500, vertical: 'A' },
      { id: 't1-19', client: 'Família Guimarães', ticket: 55_500, vertical: 'A' }, { id: 't1-14', client: 'Família Bittencourt', ticket: 56_000, vertical: 'A' },
      { id: 't1-21', client: 'Família Ubiratan', ticket: 57_500, vertical: 'A' }, { id: 't1-05', client: 'Família Camargo', ticket: 62_500, vertical: 'B' },
      { id: 't1-54', client: 'Família Lavigne', ticket: 62_500, vertical: 'B' }, { id: 't1-37', client: 'Família Macedo', ticket: 67_500, vertical: 'B' },
      { id: 't1-26', client: 'Família Zuchetti', ticket: 68_000, vertical: 'A' }, { id: 't1-35', client: 'Família Camargo', ticket: 68_500, vertical: 'B' },
      { id: 't1-55', client: 'Família Sampaio', ticket: 71_500, vertical: 'A' }, { id: 't1-28', client: 'Família Juruna', ticket: 75_000, vertical: 'A' },
      { id: 't1-36', client: 'Família Furtado', ticket: 77_500, vertical: 'A' }, { id: 't1-32', client: 'Família Hollanda', ticket: 78_000, vertical: 'B' },
      { id: 't1-66', client: 'Família Furtado', ticket: 80_000, vertical: 'B' }, { id: 't1-01', client: 'Família Arantes', ticket: 88_500, vertical: 'A' },
      { id: 't1-67', client: 'Família Macedo', ticket: 146_000, vertical: 'B' },
    ],
  },
  {
    id: 't2',
    label: '2º tri',
    deals: [
      { id: 't2-69', client: 'Família Dantas', ticket: 10_000, vertical: 'A' }, { id: 't2-19', client: 'Família Nogueira', ticket: 12_500, vertical: 'B' },
      { id: 't2-54', client: 'Família Sampaio', ticket: 18_500, vertical: 'A' }, { id: 't2-73', client: 'Família Bittencourt', ticket: 19_000, vertical: 'B' },
      { id: 't2-13', client: 'Família Bittencourt', ticket: 20_500, vertical: 'B' }, { id: 't2-37', client: 'Família Teixeira', ticket: 20_500, vertical: 'A' },
      { id: 't2-44', client: 'Família Ibiapina', ticket: 22_000, vertical: 'B' }, { id: 't2-24', client: 'Família Sampaio', ticket: 23_500, vertical: 'A' },
      { id: 't2-29', client: 'Família Xavier', ticket: 23_500, vertical: 'A' }, { id: 't2-03', client: 'Família Valença', ticket: 24_000, vertical: 'A' },
      { id: 't2-05', client: 'Família Furtado', ticket: 24_000, vertical: 'A' }, { id: 't2-63', client: 'Família Valença', ticket: 25_500, vertical: 'B' },
      { id: 't2-47', client: 'Família Delgado', ticket: 26_500, vertical: 'A' }, { id: 't2-04', client: 'Família Camargo', ticket: 27_500, vertical: 'A' },
      { id: 't2-50', client: 'Família Ubiratan', ticket: 27_500, vertical: 'A' }, { id: 't2-30', client: 'Família Arantes', ticket: 28_000, vertical: 'A' },
      { id: 't2-34', client: 'Família Camargo', ticket: 28_000, vertical: 'A' }, { id: 't2-58', client: 'Família Queiroz', ticket: 28_500, vertical: 'B' },
      { id: 't2-02', client: 'Família Ourique', ticket: 29_000, vertical: 'B' }, { id: 't2-16', client: 'Família Wanderley', ticket: 30_000, vertical: 'B' },
      { id: 't2-45', client: 'Família Pontes', ticket: 30_000, vertical: 'B' }, { id: 't2-62', client: 'Família Ourique', ticket: 32_500, vertical: 'A' },
      { id: 't2-15', client: 'Família Pontes', ticket: 35_000, vertical: 'A' }, { id: 't2-12', client: 'Família Yamada', ticket: 35_500, vertical: 'A' },
      { id: 't2-48', client: 'Família Guimarães', ticket: 36_000, vertical: 'A' }, { id: 't2-75', client: 'Família Pontes', ticket: 36_500, vertical: 'A' },
      { id: 't2-20', client: 'Família Ubiratan', ticket: 38_000, vertical: 'A' }, { id: 't2-49', client: 'Família Nogueira', ticket: 38_000, vertical: 'B' },
      { id: 't2-35', client: 'Família Furtado', ticket: 38_500, vertical: 'B' }, { id: 't2-60', client: 'Família Arantes', ticket: 38_500, vertical: 'A' },
      { id: 't2-14', client: 'Família Ibiapina', ticket: 39_500, vertical: 'A' }, { id: 't2-31', client: 'Família Hollanda', ticket: 40_000, vertical: 'A' },
      { id: 't2-38', client: 'Família Andrade', ticket: 40_000, vertical: 'A' }, { id: 't2-26', client: 'Família Cardoso', ticket: 40_500, vertical: 'A' },
      { id: 't2-68', client: 'Família Andrade', ticket: 41_000, vertical: 'B' }, { id: 't2-25', client: 'Família Zuchetti', ticket: 42_500, vertical: 'B' },
      { id: 't2-64', client: 'Família Camargo', ticket: 42_500, vertical: 'A' }, { id: 't2-32', client: 'Família Ourique', ticket: 43_000, vertical: 'B' },
      { id: 't2-53', client: 'Família Lavigne', ticket: 43_500, vertical: 'A' }, { id: 't2-71', client: 'Família Rezende', ticket: 43_500, vertical: 'B' },
      { id: 't2-76', client: 'Família Wanderley', ticket: 43_500, vertical: 'B' }, { id: 't2-78', client: 'Família Guimarães', ticket: 43_500, vertical: 'B' },
      { id: 't2-28', client: 'Família Queiroz', ticket: 44_000, vertical: 'B' }, { id: 't2-56', client: 'Família Cardoso', ticket: 44_000, vertical: 'A' },
      { id: 't2-66', client: 'Família Macedo', ticket: 44_000, vertical: 'A' }, { id: 't2-59', client: 'Família Xavier', ticket: 44_500, vertical: 'A' },
      { id: 't2-40', client: 'Família Klabin', ticket: 45_000, vertical: 'B' }, { id: 't2-01', client: 'Família Hollanda', ticket: 46_000, vertical: 'A' },
      { id: 't2-21', client: 'Família Barroso', ticket: 46_000, vertical: 'B' }, { id: 't2-39', client: 'Família Dantas', ticket: 46_500, vertical: 'A' },
      { id: 't2-57', client: 'Família Juruna', ticket: 47_000, vertical: 'A' }, { id: 't2-10', client: 'Família Klabin', ticket: 47_500, vertical: 'B' },
      { id: 't2-65', client: 'Família Furtado', ticket: 48_500, vertical: 'B' }, { id: 't2-72', client: 'Família Yamada', ticket: 50_500, vertical: 'B' },
      { id: 't2-17', client: 'Família Delgado', ticket: 51_500, vertical: 'A' }, { id: 't2-43', client: 'Família Bittencourt', ticket: 54_500, vertical: 'A' },
      { id: 't2-36', client: 'Família Macedo', ticket: 55_500, vertical: 'B' }, { id: 't2-41', client: 'Família Rezende', ticket: 56_000, vertical: 'B' },
      { id: 't2-27', client: 'Família Juruna', ticket: 56_500, vertical: 'A' }, { id: 't2-08', client: 'Família Andrade', ticket: 57_500, vertical: 'B' },
      { id: 't2-74', client: 'Família Ibiapina', ticket: 58_000, vertical: 'A' }, { id: 't2-33', client: 'Família Valença', ticket: 59_000, vertical: 'B' },
      { id: 't2-46', client: 'Família Wanderley', ticket: 60_000, vertical: 'A' }, { id: 't2-52', client: 'Família Esteves', ticket: 62_000, vertical: 'A' },
      { id: 't2-18', client: 'Família Guimarães', ticket: 62_500, vertical: 'A' }, { id: 't2-77', client: 'Família Delgado', ticket: 66_500, vertical: 'B' },
      { id: 't2-23', client: 'Família Lavigne', ticket: 67_000, vertical: 'A' }, { id: 't2-70', client: 'Família Klabin', ticket: 67_000, vertical: 'A' },
      { id: 't2-67', client: 'Família Teixeira', ticket: 69_000, vertical: 'A' }, { id: 't2-09', client: 'Família Dantas', ticket: 70_000, vertical: 'A' },
      { id: 't2-07', client: 'Família Teixeira', ticket: 71_500, vertical: 'A' }, { id: 't2-22', client: 'Família Esteves', ticket: 72_500, vertical: 'A' },
      { id: 't2-61', client: 'Família Hollanda', ticket: 73_000, vertical: 'B' }, { id: 't2-06', client: 'Família Macedo', ticket: 75_000, vertical: 'A' },
      { id: 't2-11', client: 'Família Rezende', ticket: 75_500, vertical: 'A' }, { id: 't2-55', client: 'Família Zuchetti', ticket: 76_000, vertical: 'B' },
      { id: 't2-42', client: 'Família Yamada', ticket: 78_500, vertical: 'B' }, { id: 't2-51', client: 'Família Barroso', ticket: 115_500, vertical: 'A' },
    ],
  },
  {
    id: 't3',
    label: '3º tri',
    deals: [
      { id: 't3-16', client: 'Família Delgado', ticket: 9_000, vertical: 'A' }, { id: 't3-26', client: 'Família Juruna', ticket: 11_000, vertical: 'A' },
      { id: 't3-05', client: 'Família Macedo', ticket: 19_500, vertical: 'A' }, { id: 't3-79', client: 'Família Ubiratan', ticket: 20_000, vertical: 'B' },
      { id: 't3-67', client: 'Família Andrade', ticket: 21_500, vertical: 'B' }, { id: 't3-76', client: 'Família Delgado', ticket: 21_500, vertical: 'A' },
      { id: 't3-53', client: 'Família Sampaio', ticket: 22_000, vertical: 'A' }, { id: 't3-33', client: 'Família Camargo', ticket: 23_000, vertical: 'A' },
      { id: 't3-11', client: 'Família Yamada', ticket: 23_500, vertical: 'A' }, { id: 't3-31', client: 'Família Ourique', ticket: 26_000, vertical: 'B' },
      { id: 't3-42', client: 'Família Bittencourt', ticket: 26_500, vertical: 'A' }, { id: 't3-70', client: 'Família Rezende', ticket: 27_500, vertical: 'B' },
      { id: 't3-74', client: 'Família Pontes', ticket: 28_000, vertical: 'B' }, { id: 't3-18', client: 'Família Nogueira', ticket: 28_500, vertical: 'B' },
      { id: 't3-66', client: 'Família Teixeira', ticket: 28_500, vertical: 'B' }, { id: 't3-58', client: 'Família Xavier', ticket: 29_000, vertical: 'A' },
      { id: 't3-17', client: 'Família Guimarães', ticket: 30_000, vertical: 'A' }, { id: 't3-77', client: 'Família Guimarães', ticket: 30_500, vertical: 'A' },
      { id: 't3-01', client: 'Família Ourique', ticket: 32_000, vertical: 'B' }, { id: 't3-19', client: 'Família Ubiratan', ticket: 32_000, vertical: 'A' },
      { id: 't3-40', client: 'Família Rezende', ticket: 32_500, vertical: 'A' }, { id: 't3-39', client: 'Família Klabin', ticket: 33_000, vertical: 'A' },
      { id: 't3-08', client: 'Família Dantas', ticket: 33_500, vertical: 'B' }, { id: 't3-06', client: 'Família Teixeira', ticket: 35_000, vertical: 'A' },
      { id: 't3-43', client: 'Família Ibiapina', ticket: 36_500, vertical: 'A' }, { id: 't3-02', client: 'Família Valença', ticket: 37_000, vertical: 'A' },
      { id: 't3-03', client: 'Família Camargo', ticket: 37_000, vertical: 'A' }, { id: 't3-41', client: 'Família Yamada', ticket: 37_000, vertical: 'A' },
      { id: 't3-47', client: 'Família Guimarães', ticket: 37_000, vertical: 'A' }, { id: 't3-51', client: 'Família Esteves', ticket: 37_000, vertical: 'B' },
      { id: 't3-04', client: 'Família Furtado', ticket: 38_500, vertical: 'A' }, { id: 't3-32', client: 'Família Valença', ticket: 38_500, vertical: 'A' },
      { id: 't3-49', client: 'Família Ubiratan', ticket: 40_000, vertical: 'A' }, { id: 't3-48', client: 'Família Nogueira', ticket: 40_500, vertical: 'A' },
      { id: 't3-07', client: 'Família Andrade', ticket: 41_000, vertical: 'A' }, { id: 't3-20', client: 'Família Barroso', ticket: 41_500, vertical: 'A' },
      { id: 't3-71', client: 'Família Yamada', ticket: 42_000, vertical: 'B' }, { id: 't3-21', client: 'Família Esteves', ticket: 43_000, vertical: 'A' },
      { id: 't3-62', client: 'Família Valença', ticket: 43_000, vertical: 'B' }, { id: 't3-69', client: 'Família Klabin', ticket: 44_500, vertical: 'A' },
      { id: 't3-22', client: 'Família Lavigne', ticket: 45_000, vertical: 'A' }, { id: 't3-78', client: 'Família Nogueira', ticket: 45_500, vertical: 'B' },
      { id: 't3-25', client: 'Família Cardoso', ticket: 46_500, vertical: 'A' }, { id: 't3-28', client: 'Família Xavier', ticket: 46_500, vertical: 'B' },
      { id: 't3-54', client: 'Família Zuchetti', ticket: 46_500, vertical: 'A' }, { id: 't3-30', client: 'Família Hollanda', ticket: 47_500, vertical: 'A' },
      { id: 't3-23', client: 'Família Sampaio', ticket: 48_000, vertical: 'A' }, { id: 't3-56', client: 'Família Juruna', ticket: 50_000, vertical: 'A' },
      { id: 't3-37', client: 'Família Andrade', ticket: 50_500, vertical: 'B' }, { id: 't3-24', client: 'Família Zuchetti', ticket: 51_000, vertical: 'A' },
      { id: 't3-34', client: 'Família Furtado', ticket: 51_000, vertical: 'A' }, { id: 't3-27', client: 'Família Queiroz', ticket: 51_500, vertical: 'A' },
      { id: 't3-10', client: 'Família Rezende', ticket: 52_500, vertical: 'A' }, { id: 't3-13', client: 'Família Ibiapina', ticket: 53_500, vertical: 'A' },
      { id: 't3-09', client: 'Família Klabin', ticket: 54_500, vertical: 'B' }, { id: 't3-35', client: 'Família Macedo', ticket: 54_500, vertical: 'A' },
      { id: 't3-29', client: 'Família Arantes', ticket: 55_500, vertical: 'A' }, { id: 't3-59', client: 'Família Arantes', ticket: 55_500, vertical: 'B' },
      { id: 't3-45', client: 'Família Wanderley', ticket: 56_500, vertical: 'A' }, { id: 't3-65', client: 'Família Macedo', ticket: 59_500, vertical: 'B' },
      { id: 't3-12', client: 'Família Bittencourt', ticket: 60_000, vertical: 'B' }, { id: 't3-38', client: 'Família Dantas', ticket: 60_500, vertical: 'A' },
      { id: 't3-55', client: 'Família Cardoso', ticket: 60_500, vertical: 'B' }, { id: 't3-68', client: 'Família Dantas', ticket: 62_000, vertical: 'A' },
      { id: 't3-61', client: 'Família Ourique', ticket: 64_000, vertical: 'A' }, { id: 't3-73', client: 'Família Ibiapina', ticket: 64_000, vertical: 'A' },
      { id: 't3-36', client: 'Família Teixeira', ticket: 66_000, vertical: 'B' }, { id: 't3-72', client: 'Família Bittencourt', ticket: 67_000, vertical: 'B' },
      { id: 't3-44', client: 'Família Pontes', ticket: 74_500, vertical: 'B' }, { id: 't3-64', client: 'Família Furtado', ticket: 80_000, vertical: 'B' },
      { id: 't3-60', client: 'Família Hollanda', ticket: 81_000, vertical: 'A' }, { id: 't3-50', client: 'Família Barroso', ticket: 82_000, vertical: 'A' },
      { id: 't3-57', client: 'Família Queiroz', ticket: 83_000, vertical: 'B' }, { id: 't3-46', client: 'Família Delgado', ticket: 86_000, vertical: 'A' },
      { id: 't3-75', client: 'Família Wanderley', ticket: 86_000, vertical: 'B' }, { id: 't3-63', client: 'Família Camargo', ticket: 88_000, vertical: 'A' },
      { id: 't3-15', client: 'Família Wanderley', ticket: 89_500, vertical: 'B' }, { id: 't3-80', client: 'Família Barroso', ticket: 99_000, vertical: 'A' },
      { id: 't3-52', client: 'Família Lavigne', ticket: 124_000, vertical: 'A' }, { id: 't3-14', client: 'Família Pontes', ticket: 131_000, vertical: 'B' },
    ],
  },
  {
    id: 't4',
    label: '4º tri',
    deals: [
      { id: 't4-30', client: 'Família Ourique', ticket: 18_500, vertical: 'A' }, { id: 't4-52', client: 'Família Sampaio', ticket: 20_000, vertical: 'B' },
      { id: 't4-76', client: 'Família Guimarães', ticket: 22_000, vertical: 'B' }, { id: 't4-53', client: 'Família Zuchetti', ticket: 24_000, vertical: 'A' },
      { id: 't4-70', client: 'Família Yamada', ticket: 26_000, vertical: 'A' }, { id: 't4-55', client: 'Família Juruna', ticket: 26_500, vertical: 'A' },
      { id: 't4-43', client: 'Família Pontes', ticket: 27_500, vertical: 'A' }, { id: 't4-50', client: 'Família Esteves', ticket: 28_500, vertical: 'B' },
      { id: 't4-04', client: 'Família Macedo', ticket: 29_500, vertical: 'B' }, { id: 't4-13', client: 'Família Pontes', ticket: 33_000, vertical: 'B' },
      { id: 't4-82', client: 'Família Sampaio', ticket: 33_000, vertical: 'A' }, { id: 't4-34', client: 'Família Macedo', ticket: 34_500, vertical: 'B' },
      { id: 't4-56', client: 'Família Queiroz', ticket: 34_500, vertical: 'B' }, { id: 't4-11', client: 'Família Bittencourt', ticket: 36_500, vertical: 'B' },
      { id: 't4-01', client: 'Família Valença', ticket: 37_500, vertical: 'B' }, { id: 't4-72', client: 'Família Ibiapina', ticket: 38_000, vertical: 'A' },
      { id: 't4-27', client: 'Família Xavier', ticket: 38_500, vertical: 'A' }, { id: 't4-28', client: 'Família Arantes', ticket: 38_500, vertical: 'B' },
      { id: 't4-61', client: 'Família Valença', ticket: 40_000, vertical: 'A' }, { id: 't4-31', client: 'Família Valença', ticket: 40_500, vertical: 'A' },
      { id: 't4-42', client: 'Família Ibiapina', ticket: 40_500, vertical: 'B' }, { id: 't4-75', client: 'Família Delgado', ticket: 40_500, vertical: 'A' },
      { id: 't4-36', client: 'Família Andrade', ticket: 41_000, vertical: 'A' }, { id: 't4-02', client: 'Família Camargo', ticket: 41_500, vertical: 'A' },
      { id: 't4-24', client: 'Família Cardoso', ticket: 41_500, vertical: 'A' }, { id: 't4-79', client: 'Família Barroso', ticket: 42_000, vertical: 'A' },
      { id: 't4-39', client: 'Família Rezende', ticket: 43_000, vertical: 'B' }, { id: 't4-17', client: 'Família Nogueira', ticket: 43_500, vertical: 'A' },
      { id: 't4-05', client: 'Família Teixeira', ticket: 44_000, vertical: 'B' }, { id: 't4-49', client: 'Família Barroso', ticket: 44_000, vertical: 'A' },
      { id: 't4-20', client: 'Família Esteves', ticket: 44_500, vertical: 'A' }, { id: 't4-29', client: 'Família Hollanda', ticket: 44_500, vertical: 'A' },
      { id: 't4-46', client: 'Família Guimarães', ticket: 46_000, vertical: 'A' }, { id: 't4-38', client: 'Família Klabin', ticket: 47_000, vertical: 'A' },
      { id: 't4-81', client: 'Família Lavigne', ticket: 47_000, vertical: 'A' }, { id: 't4-66', client: 'Família Andrade', ticket: 47_500, vertical: 'A' },
      { id: 't4-09', client: 'Família Rezende', ticket: 48_000, vertical: 'B' }, { id: 't4-16', client: 'Família Guimarães', ticket: 48_000, vertical: 'B' },
      { id: 't4-83', client: 'Família Zuchetti', ticket: 48_500, vertical: 'B' }, { id: 't4-77', client: 'Família Nogueira', ticket: 49_000, vertical: 'A' },
      { id: 't4-78', client: 'Família Ubiratan', ticket: 50_500, vertical: 'B' }, { id: 't4-07', client: 'Família Dantas', ticket: 51_000, vertical: 'B' },
      { id: 't4-21', client: 'Família Lavigne', ticket: 51_500, vertical: 'A' }, { id: 't4-48', client: 'Família Ubiratan', ticket: 51_500, vertical: 'A' },
      { id: 't4-41', client: 'Família Bittencourt', ticket: 55_000, vertical: 'A' }, { id: 't4-10', client: 'Família Yamada', ticket: 56_000, vertical: 'B' },
      { id: 't4-19', client: 'Família Barroso', ticket: 57_000, vertical: 'B' }, { id: 't4-73', client: 'Família Pontes', ticket: 57_000, vertical: 'A' },
      { id: 't4-80', client: 'Família Esteves', ticket: 58_000, vertical: 'A' }, { id: 't4-69', client: 'Família Rezende', ticket: 59_000, vertical: 'B' },
      { id: 't4-57', client: 'Família Xavier', ticket: 60_500, vertical: 'B' }, { id: 't4-62', client: 'Família Camargo', ticket: 61_500, vertical: 'A' },
      { id: 't4-68', client: 'Família Klabin', ticket: 61_500, vertical: 'B' }, { id: 't4-06', client: 'Família Andrade', ticket: 62_000, vertical: 'A' },
      { id: 't4-45', client: 'Família Delgado', ticket: 62_000, vertical: 'B' }, { id: 't4-60', client: 'Família Ourique', ticket: 64_000, vertical: 'B' },
      { id: 't4-26', client: 'Família Queiroz', ticket: 65_000, vertical: 'A' }, { id: 't4-33', client: 'Família Furtado', ticket: 65_000, vertical: 'A' },
      { id: 't4-74', client: 'Família Wanderley', ticket: 66_000, vertical: 'B' }, { id: 't4-32', client: 'Família Camargo', ticket: 67_500, vertical: 'B' },
      { id: 't4-47', client: 'Família Nogueira', ticket: 69_000, vertical: 'B' }, { id: 't4-23', client: 'Família Zuchetti', ticket: 72_000, vertical: 'A' },
      { id: 't4-03', client: 'Família Furtado', ticket: 74_500, vertical: 'B' }, { id: 't4-65', client: 'Família Teixeira', ticket: 75_000, vertical: 'A' },
      { id: 't4-37', client: 'Família Dantas', ticket: 76_500, vertical: 'B' }, { id: 't4-35', client: 'Família Teixeira', ticket: 79_000, vertical: 'A' },
      { id: 't4-18', client: 'Família Ubiratan', ticket: 83_500, vertical: 'A' }, { id: 't4-58', client: 'Família Arantes', ticket: 84_000, vertical: 'B' },
      { id: 't4-63', client: 'Família Furtado', ticket: 85_000, vertical: 'B' }, { id: 't4-64', client: 'Família Macedo', ticket: 93_000, vertical: 'A' },
      { id: 't4-12', client: 'Família Ibiapina', ticket: 95_000, vertical: 'B' }, { id: 't4-71', client: 'Família Bittencourt', ticket: 97_000, vertical: 'B' },
      { id: 't4-25', client: 'Família Juruna', ticket: 97_500, vertical: 'A' }, { id: 't4-22', client: 'Família Sampaio', ticket: 102_000, vertical: 'A' },
      { id: 't4-40', client: 'Família Yamada', ticket: 104_000, vertical: 'A' }, { id: 't4-67', client: 'Família Dantas', ticket: 107_000, vertical: 'B' },
      { id: 't4-08', client: 'Família Klabin', ticket: 113_500, vertical: 'A' }, { id: 't4-15', client: 'Família Delgado', ticket: 117_000, vertical: 'B' },
      { id: 't4-54', client: 'Família Cardoso', ticket: 122_500, vertical: 'A' }, { id: 't4-59', client: 'Família Hollanda', ticket: 125_000, vertical: 'B' },
      { id: 't4-14', client: 'Família Wanderley', ticket: 143_000, vertical: 'A' }, { id: 't4-44', client: 'Família Wanderley', ticket: 172_500, vertical: 'B' },
      { id: 't4-51', client: 'Família Lavigne', ticket: 196_000, vertical: 'B' },
    ],
  },
];

/** Nome de tela de cada vertical, na ordem em que a legenda as lista. */
export const VERTICAL_LABELS: Readonly<Record<Vertical, string>> = {
  A: 'Vertical A',
  B: 'Vertical B',
};

/**
 * O negócio que abre o drill por padrão. É o maior ticket do ano, que é a resposta da pergunta da
 * versão; no Farol quem manda é o clique, e esta constante é só o estado inicial.
 */
export const HIGHLIGHT_ID = 't4-51';
