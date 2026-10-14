/**
 * Árvore de indicadores da receita de um produto novo, em que o ticket médio ainda não foi medido:
 * receita igual a ganhos projetados vezes ticket médio. A moeda está em reais e a contagem em
 * negócios fechados no ano.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real, e nenhum produto real.
 *
 * O QUE ESTA VERSÃO CARREGA, e por isso o tipo é diferente do das irmãs: a faixa é OPCIONAL. Um nó de
 * procedência `lacuna` é aquele que ninguém mediu, e dar a ele um `range` com centro inventado seria
 * exatamente o defeito que a DAD-2 registra, ausência virando número. Sem faixa, o cartão escreve
 * `formatUnavailable()` no lugar do valor e sai de contorno tracejado.
 *
 * REGRA DA FAIXA DO PAI, escrita no rodapé porque aqui ela é a mensagem: a faixa de um nó com operador
 * não é o produto dos extremos dos filhos, que superestima a incerteza de um produto de variáveis
 * independentes. Ela vem do espalhamento relativo de cada filho, `(p90 menos p10) dividido pelo
 * central`, combinado em quadratura, isto é a raiz da soma dos quadrados. Aqui: ganhos projetados
 * espalham 50,0% em torno de 12, e o ticket médio espalha 160,0% em torno de R$ 150 mil; a quadratura
 * dá 167,6%, e R$ 1,8 mi mais ou menos metade disso fecham a faixa de R$ 290 mil a R$ 3,31 mi, que o
 * cartão imprime no formato compacto, com uma casa decimal, como R$ 290,0 mil e R$ 3,3 mi. É o ponto
 * da versão: uma premissa com faixa mais larga que o próprio centro devolve um resultado cujo topo
 * vale onze vezes o próprio piso, e nenhuma casa decimal esconde isso.
 *
 * O ticket medido em contrato entra como nó de lacuna porque ele é a medição que resolveria a
 * premissa, e ela não existe: o produto é novo e não há contrato assinado para contar.
 */
export type Provenance = 'medido' | 'premissa' | 'derivado' | 'lacuna';

export type DriverUnit = 'currency' | 'count';

export interface DriverRange {
  readonly p10: number;
  readonly central: number;
  readonly p90: number;
}

export interface DriverNode {
  readonly id: string;
  readonly label: string;
  readonly unit: DriverUnit;
  /** Substantivo impresso depois do número, só em unidade "count" ("ganhos"). */
  readonly noun?: string;
  /** Ausente no nó de lacuna: sem medição não há centro nem extremos a desenhar. */
  readonly range?: DriverRange;
  readonly provenance: Provenance;
  /** Operador que liga os filhos para formar este nó. Ausente em folha e no nó que só aponta a fonte. */
  readonly operator?: 'vezes' | 'mais';
  readonly children?: readonly DriverNode[];
}

export const data: DriverNode = {
  id: 'receita-produto-novo',
  label: 'Receita do produto novo',
  unit: 'currency',
  range: { p10: 290_000, central: 1_800_000, p90: 3_310_000 },
  provenance: 'derivado',
  operator: 'vezes',
  children: [
    {
      id: 'ganhos-projetados',
      label: 'Ganhos projetados',
      unit: 'count',
      noun: 'ganhos',
      range: { p10: 9, central: 12, p90: 15 },
      provenance: 'premissa',
    },
    {
      id: 'ticket-medio',
      label: 'Ticket médio',
      unit: 'currency',
      range: { p10: 60_000, central: 150_000, p90: 300_000 },
      provenance: 'premissa',
      // Sem operador de propósito: o filho não compõe este valor, ele aponta a medição que falta.
      children: [
        {
          id: 'ticket-medido',
          label: 'Ticket medido em contrato',
          unit: 'currency',
          provenance: 'lacuna',
        },
      ],
    },
  ],
};
