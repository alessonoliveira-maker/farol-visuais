/**
 * Capacidade declarada de cada função da área comercial fictícia: quantas pessoas a função tem,
 * o teto que ela aguenta por mês e o uso do último mês fechado, na unidade própria de cada uma.
 *
 * O teto é PREMISSA (vem do planejamento) e o uso é MEDIDO (vem do mês fechado), e as duas
 * procedências aparecem escritas no cartão porque convivem no mesmo número de tela.
 *
 * A unidade é por função, e de propósito: entrada de pré-vendas e oportunidade de vendas não se
 * somam, então o cartão da área conta pessoas e funções, nunca a soma dos tetos.
 *
 * Dado fictício e fixo: só cargo, contagem e capacidade; nenhuma pessoa é citada.
 */
export interface CapacityRole {
  readonly id: string;
  readonly label: string;
  readonly people: number;
  /** Teto mensal declarado no planejamento. Procedência: premissa. */
  readonly ceiling: number;
  /** Uso do último mês fechado. Procedência: medido. */
  readonly used: number;
  /** Substantivo da unidade do teto e do uso, escrito no cartão (NUM-6). */
  readonly unit: string;
}

export interface CapacityArea {
  readonly id: string;
  readonly label: string;
  readonly roles: readonly CapacityRole[];
}

export const data: CapacityArea = {
  id: 'area-comercial',
  label: 'Área comercial',
  roles: [
    {
      id: 'pre-vendas',
      label: 'Pré-vendas',
      people: 6,
      ceiling: 240,
      used: 226,
      unit: 'entradas por mês',
    },
    {
      id: 'comercial',
      label: 'Comercial',
      people: 5,
      ceiling: 150,
      used: 158,
      unit: 'oportunidades por mês',
    },
    {
      id: 'marketing',
      label: 'Marketing',
      people: 4,
      ceiling: 90,
      used: 54,
      unit: 'criativos por mês',
    },
    {
      id: 'atendimento',
      label: 'Atendimento',
      people: 3,
      ceiling: 600,
      used: 402,
      unit: 'conversas por mês',
    },
  ],
};
