/**
 * Custo por lead qualificado de mídia paga no mês: investimento em reais dividido pela contagem
 * de leads qualificados da mesma janela, com o mês anterior como base, o limiar de ação, o
 * carimbo de coleta da fonte e a procedência do número. Dado fictício e fixo.
 *
 * O caso difícil é a leitura dupla: o CPL caiu contra o mês anterior (bom, porque menor é melhor)
 * e ainda assim segue acima do limiar de ação, então o cartão pinta a queda de verde e acende o
 * ponto de ação ao mesmo tempo.
 */

/** Para onde aponta o "bom" da métrica; a cor da variação sai daqui, nunca do sinal. */
export type Polarity = 'higher-is-better' | 'lower-is-better' | 'neutral';

/** Etiqueta de procedência do Farol, pela regra do elo mais fraco entre as parcelas. */
export type Provenance = 'medido' | 'derivado' | 'premissa' | 'lacuna';

/** As duas parcelas da razão, sempre na mesma janela. */
export interface RatioWindow {
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Investimento de mídia em reais. */
  readonly spend: number;
  /** Leads qualificados contados no mesmo mês. */
  readonly leads: number;
}

export interface Freshness {
  /** Carimbo da última coleta da fonte, com fuso declarado. */
  readonly collectedAt: string;
  /** Relógio de referência que o pai passa; no catálogo é fixo para o preview não mudar. */
  readonly referenceAt: string;
  /** Prazo esperado entre coletas, em horas, vindo do dicionário da métrica. */
  readonly expectedEveryHours: number;
}

export interface CostPerLeadKpi {
  readonly label: string;
  readonly polarity: Polarity;
  readonly provenance: Provenance;
  readonly current: RatioWindow;
  readonly previous: RatioWindow | null;
  /** CPL em reais acima do qual o cartão acende o ponto de ação; `null` quando não há limiar. */
  readonly actionThreshold: number | null;
  readonly freshness: Freshness;
  /** Destino do link esticado: a lista de campanhas do mesmo mês. */
  readonly href: string;
}

export const data: CostPerLeadKpi = {
  label: 'CPL qualificado',
  polarity: 'lower-is-better',
  provenance: 'derivado',
  current: { month: '2026-08', spend: 48_600, leads: 412 },
  previous: { month: '2026-07', spend: 52_300, leads: 392 },
  actionThreshold: 110,
  freshness: {
    collectedAt: '2026-09-13T05:00:00-03:00',
    referenceAt: '2026-09-13T14:30:00-03:00',
    expectedEveryHours: 24,
  },
  href: '#campanhas-2026-08',
};
