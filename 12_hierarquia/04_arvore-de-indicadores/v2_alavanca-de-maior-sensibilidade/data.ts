/**
 * Árvore de indicadores do cenário de receita nova do ano seguinte, lida pela SENSIBILIDADE de cada
 * alavanca: receita igual a ganhos vezes ticket médio, e ganhos igual a oportunidades vezes taxa de
 * ganho. A moeda está em reais, a contagem em negócios e a taxa em fração de 0 a 1. Cada nó traz o
 * valor central, a faixa de p10 a p90 e a etiqueta de procedência.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real.
 *
 * REGRA DA FAIXA DO PAI, que esta versão escreve no rodapé porque ninguém a adivinha olhando os
 * cartões: a faixa de um nó com operador não é o produto dos extremos dos filhos, que superestima a
 * incerteza de um produto de variáveis independentes. Ela vem do espalhamento relativo de cada
 * filho, `(p90 menos p10) dividido pelo central`, combinado em quadratura, isto é a raiz da soma dos
 * quadrados. Em ganhos: oportunidades espalha 17,1% em torno de 350 e taxa de ganho espalha 33,3% em
 * torno de 12%; a quadratura dá 37,4%, e 42 mais ou menos metade disso fecha a faixa de 34 a 50. Na
 * receita: 38,1% de ganhos com 27,5% do ticket dão 47,0%, e R$ 8,4 mi mais ou menos metade disso
 * fecham a faixa de R$ 6,4 mi a R$ 10,4 mi.
 *
 * SENSIBILIDADE, que é o que esta versão destaca: num produto, o efeito de cada fator sobre o
 * resultado é proporcional ao quanto ele varia em relação ao próprio centro, então a alavanca que
 * mais move a receita é a de maior espalhamento relativo. Aqui é a taxa de ganho, com 33,3% contra
 * 27,5% do ticket médio e 17,1% das oportunidades. Um ponto de taxa vale 350 vezes 0,01 vezes
 * R$ 200 mil, ou R$ 700,0 mil de receita.
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
  /** Substantivo impresso depois do número, só em unidade "count" ("ganhos", "oportunidades"). */
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
  readonly children?: readonly DriverNode[];
}

export const data: DriverNode = {
  id: 'receita-nova',
  label: 'Receita nova do ano seguinte',
  unit: 'currency',
  range: { p10: 6_400_000, central: 8_400_000, p90: 10_400_000 },
  provenance: 'derivado',
  operator: 'vezes',
  children: [
    {
      id: 'ganhos',
      label: 'Ganhos',
      unit: 'count',
      noun: 'ganhos',
      range: { p10: 34, central: 42, p90: 50 },
      provenance: 'derivado',
      operator: 'vezes',
      children: [
        {
          id: 'oportunidades',
          label: 'Oportunidades',
          unit: 'count',
          noun: 'oportunidades',
          range: { p10: 320, central: 350, p90: 380 },
          provenance: 'medido',
        },
        {
          id: 'taxa-de-ganho',
          label: 'Taxa de ganho',
          unit: 'percent',
          range: { p10: 0.1, central: 0.12, p90: 0.14 },
          provenance: 'medido',
          // Par volume da taxa de conversão: 42 ganhos de 350 oportunidades (nós vizinhos).
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

/**
 * Um ponto de taxa, em fração. É o degrau com que a diretoria conversa ("subir um ponto da taxa de
 * ganho"), e fica no dado porque é premissa de leitura, não constante de desenho.
 */
export const ratePoint = 0.01;
