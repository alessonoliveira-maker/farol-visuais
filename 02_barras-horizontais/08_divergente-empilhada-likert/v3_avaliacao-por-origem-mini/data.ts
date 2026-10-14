/**
 * Avaliação de qualidade de lead pelo time de vendas, por origem, no formulário de handoff de
 * agosto de 2026: contagem de respostas por ponto da escala de 5 pontos, em doze origens.
 * Dado fictício e fixo: nenhuma origem, pessoa ou empresa é real.
 */

/** Ponto da escala de 5, do polo negativo ao positivo. */
export type RatingKey = 'veryBad' | 'bad' | 'neutral' | 'good' | 'veryGood';

export interface ScalePoint {
  readonly key: RatingKey;
  readonly label: string;
  readonly pole: 'negative' | 'neutral' | 'positive';
  /** Slot categórico fixo (CONTRATO, COR-8); o neutro não tem slot. */
  readonly slot?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface OriginRatings {
  readonly id: string;
  readonly label: string;
  readonly counts: Readonly<Record<RatingKey, number>>;
}

export const scale: readonly ScalePoint[] = [
  { key: 'veryBad', label: 'Muito ruim', pole: 'negative', slot: 5 },
  { key: 'bad', label: 'Ruim', pole: 'negative', slot: 6 },
  { key: 'neutral', label: 'Neutro', pole: 'neutral' },
  { key: 'good', label: 'Bom', pole: 'positive', slot: 3 },
  { key: 'veryGood', label: 'Muito bom', pole: 'positive', slot: 1 },
];

/**
 * Doze origens; "Mídia paga social" e "Indicação de fundo parceiro" são as duas com mais avaliação
 * ruim que boa (nomes de canal genéricos: nenhuma plataforma real é citada, seção 3 do CONTRATO).
 */
export const data: readonly OriginRatings[] = [
  { id: 'indicacao-cliente', label: 'Indicação de cliente', counts: { veryBad: 1, bad: 2, neutral: 4, good: 14, veryGood: 18 } },
  { id: 'organico-site', label: 'Orgânico do site', counts: { veryBad: 2, bad: 4, neutral: 8, good: 16, veryGood: 9 } },
  { id: 'evento', label: 'Evento presencial', counts: { veryBad: 1, bad: 3, neutral: 6, good: 15, veryGood: 10 } },
  { id: 'midia-paga-social', label: 'Mídia paga social', counts: { veryBad: 6, bad: 12, neutral: 10, good: 9, veryGood: 3 } },
  { id: 'midia-paga-busca', label: 'Mídia paga busca', counts: { veryBad: 4, bad: 10, neutral: 11, good: 11, veryGood: 4 } },
  { id: 'midia-paga-profissional', label: 'Mídia paga profissional', counts: { veryBad: 3, bad: 7, neutral: 9, good: 12, veryGood: 6 } },
  { id: 'webinar', label: 'Webinar', counts: { veryBad: 1, bad: 4, neutral: 7, good: 14, veryGood: 8 } },
  { id: 'newsletter', label: 'Newsletter', counts: { veryBad: 2, bad: 5, neutral: 9, good: 12, veryGood: 6 } },
  { id: 'parceria', label: 'Parceria comercial', counts: { veryBad: 0, bad: 2, neutral: 5, good: 13, veryGood: 12 } },
  { id: 'indicacao-fundo', label: 'Indicação de fundo parceiro', counts: { veryBad: 9, bad: 13, neutral: 6, good: 7, veryGood: 3 } },
  { id: 'trafego-organico-blog', label: 'Orgânico do blog', counts: { veryBad: 1, bad: 5, neutral: 10, good: 13, veryGood: 5 } },
  { id: 'lista-fria', label: 'Lista fria enriquecida', counts: { veryBad: 3, bad: 6, neutral: 8, good: 9, veryGood: 4 } },
];
