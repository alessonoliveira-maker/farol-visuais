/**
 * Custo e receita reconhecida de um trimestre, em reais, para desenhar dois quadrados de blocos de
 * R$ 10 mil. Dado fictício e fixo: nenhum número é de operação real.
 *
 * O caso difícil está no arredondamento e na diferença: 1.931.400 / 10.000 = 193,1 vira 193 células,
 * 2.478.000 / 10.000 = 247,8 vira 248, e a folga de 55 células (248 menos 193) bate com a diferença
 * exata de R$ 546.600 (54,7 células), que vai escrita junto do bloco aceso.
 */
export type Provenance = 'medido' | 'derivado';

export interface QuarterAmount {
  /** Nome da grandeza em minúsculas, porque entra no meio da frase acessível. A camada vai no nome. */
  readonly label: string;
  /** Valor exato em reais. */
  readonly value: number;
  /** Procedência do número, escrita como etiqueta ao lado do valor. */
  readonly provenance: Provenance;
}

export interface CostVsRevenue {
  /** Período do recorte, em texto de tela. */
  readonly period: string;
  /** Quantos reais vale uma célula. */
  readonly unit: number;
  readonly cost: QuarterAmount;
  readonly revenue: QuarterAmount;
}

export const data: CostVsRevenue = {
  period: '3º trimestre de 2026',
  unit: 10_000,
  cost: { label: 'custo da camada de mídia e equipe', value: 1_931_400, provenance: 'derivado' },
  revenue: { label: 'receita reconhecida', value: 2_478_000, provenance: 'medido' },
};
