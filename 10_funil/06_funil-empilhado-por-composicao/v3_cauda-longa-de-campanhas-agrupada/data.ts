/**
 * Volume por campanha em cada etapa do funil de pré-vendas, agosto de 2026, para 14 campanhas
 * ativas mais os leads sem campanha atribuída. Dado fictício e fixo: os nomes são placeholders
 * genéricos, nenhuma campanha ou marca real. A ordem das etapas é a ordem do processo (Lead a
 * Ganho); dentro de cada etapa, a chave de `campaigns` é o id da campanha em `campaigns`, nunca
 * o índice do array, porque o componente reordena por volume da entrada.
 */
export interface CampaignMeta {
  readonly id: string;
  readonly name: string;
}

export interface CampaignFunnelStage {
  readonly stage: string;
  readonly campaigns: Readonly<Record<string, number>>;
  /** Leads sem campanha atribuída: tráfego direto ou orgânico sem UTM. */
  readonly noCampaign: number;
}

export const campaigns: readonly CampaignMeta[] = [
  { id: 'A', name: 'Campanha A' },
  { id: 'B', name: 'Campanha B' },
  { id: 'C', name: 'Campanha C' },
  { id: 'D', name: 'Campanha D' },
  { id: 'E', name: 'Campanha E' },
  { id: 'F', name: 'Campanha F' },
  { id: 'G', name: 'Campanha G' },
  { id: 'H', name: 'Campanha H' },
  { id: 'I', name: 'Campanha I' },
  { id: 'J', name: 'Campanha J' },
  { id: 'K', name: 'Campanha K' },
  { id: 'L', name: 'Campanha L' },
  { id: 'M', name: 'Campanha M' },
  { id: 'N', name: 'Campanha N' },
];

export const data: readonly CampaignFunnelStage[] = [
  {
    stage: 'Lead',
    campaigns: { A: 130, B: 95, C: 78, D: 61, E: 54, F: 8, G: 6, H: 5, I: 4, J: 3, K: 2, L: 2, M: 1, N: 1 },
    noCampaign: 90,
  },
  {
    stage: 'Qualificado',
    campaigns: { A: 36, B: 26, C: 22, D: 17, E: 15, F: 2, G: 2, H: 1, I: 1, J: 1, K: 1, L: 1, M: 0, N: 0 },
    noCampaign: 25,
  },
  {
    stage: 'Agenda',
    campaigns: { A: 11, B: 8, C: 7, D: 5, E: 5, F: 1, G: 1, H: 0, I: 0, J: 0, K: 0, L: 0, M: 0, N: 0 },
    noCampaign: 8,
  },
  {
    stage: 'Proposta',
    campaigns: { A: 5, B: 4, C: 3, D: 2, E: 2, F: 0, G: 0, H: 0, I: 0, J: 0, K: 0, L: 0, M: 0, N: 0 },
    noCampaign: 4,
  },
  {
    stage: 'Ganho',
    campaigns: { A: 2, B: 2, C: 1, D: 1, E: 1, F: 0, G: 0, H: 0, I: 0, J: 0, K: 0, L: 0, M: 0, N: 0 },
    noCampaign: 2,
  },
];
