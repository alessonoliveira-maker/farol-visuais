/**
 * Árvore de indicadores que desce da receita nova do ano seguinte até a capacidade da Pré-vendas, em
 * cinco níveis: receita igual a ganhos vezes ticket médio; ganhos igual a oportunidades vezes taxa de
 * ganho; oportunidades igual a agendas vezes a taxa de agenda que vira oportunidade; agendas igual a
 * entradas vezes a taxa de agendamento. A moeda está em reais, a contagem em negócios e em pessoas
 * entradas no funil, e a taxa em fração de 0 a 1.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real, e o teto de capacidade também é fictício.
 *
 * REGRA DA FAIXA DO PAI: a faixa de um nó com operador não é o produto dos extremos dos filhos, que
 * superestima a incerteza de um produto de variáveis independentes. Ela vem do espalhamento relativo
 * de cada filho, `(p90 menos p10) dividido pelo central`, combinado em quadratura, isto é a raiz da
 * soma dos quadrados. O efeito que esta versão deixa ver é o acúmulo: com dois níveis a receita
 * espalhava 47,0% em torno do centro (é a v1); com quatro operadores encadeados o espalhamento vai a
 * 61,2%, porque cada elo acrescenta a sua própria incerteza. Daí a faixa de R$ 5,83 mi a R$ 10,97 mi
 * para o mesmo centro de R$ 8,4 mi; o cartão imprime esses extremos no formato compacto, com uma
 * casa decimal, então na tela eles aparecem como R$ 5,8 mi e R$ 11,0 mi.
 *
 * CAPACIDADE, que é a pergunta desta versão: o cenário exige 3.500 entradas no ano, ou cerca de 292
 * por mês, contra um teto fictício de 240 por mês. A demanda fica em 122% do teto, então o cenário
 * não cabe na operação como ela está, e o nó de entradas acende em negative.
 *
 * PROCEDÊNCIA POR NÍVEL: as duas taxas do meio do funil são medição do CRM; a taxa de agendamento e o
 * ticket médio são premissa do planejamento; os nós com operador são derivados, inclusive o de
 * entradas, que nesta leitura nasce da meta e não de uma contagem.
 */
export type Provenance = 'medido' | 'premissa' | 'derivado' | 'lacuna';

export type DriverUnit = 'currency' | 'count' | 'percent';

export interface DriverRange {
  readonly p10: number;
  readonly central: number;
  readonly p90: number;
}

export interface DriverNode {
  readonly id: string;
  readonly label: string;
  readonly unit: DriverUnit;
  /** Substantivo impresso depois do número, só em unidade "count" ("ganhos", "entradas"). */
  readonly noun?: string;
  readonly range: DriverRange;
  readonly provenance: Provenance;
  /** Operador que liga os filhos para formar este nó. Ausente em folha. */
  readonly operator?: 'vezes' | 'mais';
  /**
   * Numerador e denominador de uma taxa de conversão (unidade "percent" que nasce de uma razão entre
   * contagens, não de composição). Presente, o cartão imprime `formatRateWithVolume` (NUM-1: "taxa
   * de conversão com uma casa e o volume"); ausente, cai no `formatPercent` comum.
   */
  readonly rateVolume?: { readonly numerator: number; readonly denominator: number };
  /**
   * Ramo lateral recolhido: o cartão sai sem a microbarra, com a faixa escrita numa linha só. É o que
   * paga a altura de cinco níveis dentro do canvas, e vale para a alavanca de apoio, nunca para o nó
   * da cadeia principal, que é onde a faixa precisa ser vista.
   */
  readonly collapsed?: boolean;
  /**
   * Teto de entradas por mês que a operação sustenta. Só o nó de capacidade o declara; presente, o
   * cartão compara a demanda do cenário com ele e acende quando passa.
   */
  readonly monthlyCeiling?: number;
  readonly children?: readonly DriverNode[];
}

export const data: DriverNode = {
  id: 'receita-nova',
  label: 'Receita nova',
  unit: 'currency',
  range: { p10: 5_830_000, central: 8_400_000, p90: 10_970_000 },
  provenance: 'derivado',
  operator: 'vezes',
  children: [
    {
      id: 'ganhos',
      label: 'Ganhos',
      unit: 'count',
      noun: 'ganhos',
      range: { p10: 31, central: 42, p90: 53 },
      provenance: 'derivado',
      operator: 'vezes',
      children: [
        {
          id: 'oportunidades',
          label: 'Oportunidades',
          unit: 'count',
          noun: 'oportunidades',
          range: { p10: 274, central: 350, p90: 426 },
          provenance: 'derivado',
          operator: 'vezes',
          children: [
            {
              id: 'agendas',
              label: 'Agendas',
              unit: 'count',
              noun: 'agendas',
              range: { p10: 574, central: 700, p90: 826 },
              provenance: 'derivado',
              operator: 'vezes',
              children: [
                {
                  id: 'entradas',
                  label: 'Entradas na Pré-vendas',
                  unit: 'count',
                  noun: 'entradas',
                  range: { p10: 3_150, central: 3_500, p90: 3_850 },
                  provenance: 'derivado',
                  monthlyCeiling: 240,
                },
                {
                  id: 'taxa-de-agendamento',
                  label: 'Taxa de agendamento',
                  unit: 'percent',
                  range: { p10: 0.17, central: 0.2, p90: 0.23 },
                  provenance: 'premissa',
                  collapsed: true,
                  // Par volume: 700 agendas de 3.500 entradas (nós vizinhos).
                  rateVolume: { numerator: 700, denominator: 3_500 },
                },
              ],
            },
            {
              id: 'agenda-para-oportunidade',
              label: 'Agenda para oportunidade',
              unit: 'percent',
              range: { p10: 0.44, central: 0.5, p90: 0.56 },
              provenance: 'medido',
              collapsed: true,
              // Par volume: 350 oportunidades de 700 agendas (nós vizinhos).
              rateVolume: { numerator: 350, denominator: 700 },
            },
          ],
        },
        {
          id: 'taxa-de-ganho',
          label: 'Taxa de ganho',
          unit: 'percent',
          range: { p10: 0.1, central: 0.12, p90: 0.14 },
          provenance: 'medido',
          collapsed: true,
          // Par volume: 42 ganhos de 350 oportunidades (nós vizinhos).
          rateVolume: { numerator: 42, denominator: 350 },
        },
      ],
    },
    {
      id: 'ticket-medio',
      label: 'Ticket médio',
      unit: 'currency',
      range: { p10: 175_000, central: 200_000, p90: 230_000 },
      provenance: 'premissa',
    },
  ],
};

/** Meses do ano, o divisor que leva a meta anual ao ritmo mensal com que a operação é dimensionada. */
export const monthsInYear = 12;
