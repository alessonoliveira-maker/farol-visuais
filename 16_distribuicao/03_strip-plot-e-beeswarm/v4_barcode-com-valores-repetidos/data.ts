/**
 * Custo por lead das campanhas do trimestre, uma linha por valor lançado e a contagem de campanhas
 * naquele valor exato. Em reais. Dado fictício e fixo, sem nome de fornecedor real.
 *
 * O dado vem agregado por valor de propósito, e é isso que a versão ensina: as 1.100 campanhas foram
 * lançadas em múltiplos de dez reais, então elas não ocupam 1.100 posições no eixo, ocupam 34. Guardar
 * uma linha por campanha daria a falsa impressão de que o barcode tem 1.100 traços para desenhar.
 *
 * Valor sem campanha simplesmente não tem linha aqui, e é assim que os vãos do fim da faixa existem:
 * de R$ 310 em diante o lançamento é esparso, e o barcode mostra o buraco que o histograma fecharia.
 */

export interface CplBucket {
  /** Valor de custo por lead lançado, em reais, sempre múltiplo de dez. */
  readonly cpl: number;
  /** Quantas campanhas do trimestre foram lançadas exatamente nesse valor. */
  readonly campaigns: number;
}

export const data: readonly CplBucket[] = [
  { cpl: 20, campaigns: 1 },
  { cpl: 30, campaigns: 3 },
  { cpl: 40, campaigns: 6 },
  { cpl: 50, campaigns: 13 },
  { cpl: 60, campaigns: 26 },
  { cpl: 70, campaigns: 45 },
  { cpl: 80, campaigns: 69 },
  { cpl: 90, campaigns: 91 },
  { cpl: 100, campaigns: 105 },
  { cpl: 110, campaigns: 113 },
  { cpl: 120, campaigns: 110 },
  { cpl: 130, campaigns: 100 },
  { cpl: 140, campaigns: 87 },
  { cpl: 150, campaigns: 73 },
  { cpl: 160, campaigns: 60 },
  { cpl: 170, campaigns: 48 },
  { cpl: 180, campaigns: 37 },
  { cpl: 190, campaigns: 29 },
  { cpl: 200, campaigns: 22 },
  { cpl: 210, campaigns: 16 },
  { cpl: 220, campaigns: 12 },
  { cpl: 230, campaigns: 8 },
  { cpl: 240, campaigns: 6 },
  { cpl: 250, campaigns: 5 },
  { cpl: 260, campaigns: 4 },
  { cpl: 270, campaigns: 2 },
  { cpl: 280, campaigns: 2 },
  { cpl: 290, campaigns: 1 },
  { cpl: 300, campaigns: 1 },
  { cpl: 310, campaigns: 1 },
  { cpl: 330, campaigns: 1 },
  { cpl: 360, campaigns: 1 },
  { cpl: 400, campaigns: 1 },
  { cpl: 460, campaigns: 1 },
];

/**
 * Campanhas que rodaram no trimestre sem gerar nenhum lead. Custo por lead não existe com denominador
 * zero, e escrever zero ou infinito mentiria das duas formas possíveis: elas ficam fora do eixo e são
 * contadas no rodapé.
 */
export const WITHOUT_CPL = 34;

export interface SelectedCampaign {
  readonly name: string;
  /** Custo por lead da campanha selecionada, em reais. */
  readonly cpl: number;
}

/**
 * A campanha que o cartão abre selecionada. No Farol quem manda é o clique na lista ao lado; aqui ela
 * é o estado inicial, e serve para mostrar como uma campanha se localiza dentro da faixa.
 */
export const SELECTED: SelectedCampaign = { name: 'Alvorada institucional', cpl: 310 };
