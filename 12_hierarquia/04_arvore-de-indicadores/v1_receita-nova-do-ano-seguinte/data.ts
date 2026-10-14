/**
 * Árvore de indicadores do cenário de receita nova do ano seguinte, decomposta em alavancas por
 * soma ou produto: receita igual a ganhos vezes ticket médio; ganhos igual a oportunidades vezes
 * taxa de ganho. Cada nó traz o valor central, a faixa de p10 a p90 e a etiqueta de procedência.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real.
 *
 * Regra da faixa do pai (o ponto delicado deste modelo): a faixa não é a soma nem o produto direto
 * das faixas dos filhos, porque isso superestima a incerteza de um produto de variáveis
 * independentes. A faixa de cada nó com operador vem da combinação do espalhamento relativo de
 * cada filho em quadratura (raiz da soma dos quadrados dos espalhamentos), a aproximação padrão
 * para a incerteza de um produto. Exemplo em ganhos: oportunidades espalha 17% em torno de 350,
 * taxa de ganho espalha 33% em torno de 12%; a combinação em quadratura dá cerca de 37% em torno
 * de 42, o que resulta na faixa de 34 a 50 abaixo.
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
   * Numerador e denominador de uma taxa de conversão (unidade "percent" que nasce de uma razão
   * entre contagens, não de composição). Presente, o cartão imprime `formatRateWithVolume`
   * (NUM-1: "taxa de conversão com uma casa e o volume"); ausente, cai no `formatPercent` comum.
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
