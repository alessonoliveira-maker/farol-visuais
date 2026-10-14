/**
 * Fechamentos por mês em 2026, repartidos por vertical fictícia de produto, em contagem de
 * contratos, e a meta anual fictícia de fechamentos do ano inteiro.
 *
 * Os quatro últimos meses ainda não fecharam e entram como `null` nas quatro verticais: sem isso
 * a coluna nasceria zerada e a linha do acumulado seguiria reta até dezembro. Nenhum mês fechado
 * tem vertical em zero, de propósito, porque segmento de altura zero é descartado pelo Recharts
 * antes de existir e a leitura da pilha passaria a mentir sobre quem entregou o quê.
 *
 * O `slot` é a posição da vertical na paleta categórica e mora aqui, no dado, para a cor
 * pertencer à categoria e não à ordem em que ela aparece na tela.
 *
 * Dado fictício e fixo: as verticais são categorias genéricas de produto, sem marca real.
 */
export type VerticalKey = 'structured' | 'fixedIncome' | 'pension' | 'realEstate';

export interface Vertical {
  readonly key: VerticalKey;
  readonly name: string;
  /** Slot da paleta categórica, na ordem da COR-8: 1, 3, 6, 5. */
  readonly slot: number;
}

export interface MonthlyClosings {
  readonly month: string;
  readonly structured: number | null;
  readonly fixedIncome: number | null;
  readonly pension: number | null;
  readonly realEstate: number | null;
}

export const verticals: readonly Vertical[] = [
  { key: 'structured', name: 'Crédito estruturado', slot: 1 },
  { key: 'fixedIncome', name: 'Renda fixa', slot: 3 },
  { key: 'pension', name: 'Previdência', slot: 6 },
  { key: 'realEstate', name: 'Imobiliário', slot: 5 },
];

export const data: readonly MonthlyClosings[] = [
  { month: '2026-01', structured: 4, fixedIncome: 3, pension: 2, realEstate: 2 },
  { month: '2026-02', structured: 5, fixedIncome: 3, pension: 2, realEstate: 2 },
  { month: '2026-03', structured: 3, fixedIncome: 2, pension: 2, realEstate: 2 },
  { month: '2026-04', structured: 6, fixedIncome: 4, pension: 3, realEstate: 2 },
  { month: '2026-05', structured: 4, fixedIncome: 3, pension: 3, realEstate: 2 },
  { month: '2026-06', structured: 5, fixedIncome: 4, pension: 2, realEstate: 2 },
  { month: '2026-07', structured: 3, fixedIncome: 3, pension: 2, realEstate: 2 },
  { month: '2026-08', structured: 6, fixedIncome: 4, pension: 3, realEstate: 2 },
  { month: '2026-09', structured: null, fixedIncome: null, pension: null, realEstate: null },
  { month: '2026-10', structured: null, fixedIncome: null, pension: null, realEstate: null },
  { month: '2026-11', structured: null, fixedIncome: null, pension: null, realEstate: null },
  { month: '2026-12', structured: null, fixedIncome: null, pension: null, realEstate: null },
];

/** Meta anual fictícia de fechamentos, a referência do eixo do acumulado. */
export const annualTarget = 120;
