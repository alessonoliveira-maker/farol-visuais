/**
 * Resultado de 14 origens de lead no terceiro trimestre de 2026 (2026-07 a 2026-09), em
 * CONTAGENS e somas: investimento em reais, leads, leads qualificados, agendas marcadas,
 * oportunidades abertas, negócios ganhos, receita ganha em reais e a mediana de dias entre o
 * lead e o negócio ganho. O dado nunca declara a taxa nem a média (DAD-1): custo por lead, taxa
 * de agenda, win rate e ticket médio são derivados no componente, cada um do seu par.
 *
 * Dado fictício e fixo: nenhuma origem é marca, plataforma ou empresa real.
 *
 * Casos difíceis que o dado exercita: zero medido com empate (Indicação de cliente e Busca
 * orgânica não têm investimento, então custam R$ 0 por lead); zero medido e ausência na MESMA
 * linha (Lista de terceiros ganhou 0 de 12 oportunidades, win rate de 0,0%, e por isso não tem
 * ticket médio nem ciclo: `cycleDays` é `null` e a receita ganha dividida por zero negócios não
 * é ticket zero); empate exato de win rate (Material para baixar e Prospecção ativa, 17,6%); e
 * nome longo (Mídia social patrocinada).
 */
export interface OriginQuarter {
  readonly id: string;
  readonly label: string;
  /** Investimento de mídia e de operação da origem no trimestre, em reais. */
  readonly spend: number;
  readonly leads: number;
  readonly qualified: number;
  readonly scheduled: number;
  readonly opportunities: number;
  readonly won: number;
  /** Receita dos negócios ganhos, em reais. */
  readonly wonRevenue: number;
  /** Mediana de dias entre o lead e o negócio ganho. `null` quando nenhum negócio foi ganho. */
  readonly cycleDays: number | null;
}

export type MetricId = 'costPerLead' | 'scheduleRate' | 'winRate' | 'averageTicket' | 'cycle';
export type MetricUnit = 'currency' | 'percent' | 'days';

/** Um eixo tem unidade própria e polaridade própria: em custo e em ciclo, menor é melhor. */
export interface MetricAxis {
  readonly id: MetricId;
  readonly label: string;
  readonly unit: MetricUnit;
  readonly lowerIsBetter: boolean;
}

/** Primeiro e último mês do recorte, em `YYYY-MM`. */
export const period = { start: '2026-07', end: '2026-09' } as const;

/** A ordem segue o caminho do dinheiro: quanto custa o lead, quanto dele vira agenda e negócio, quanto vale e quanto demora. */
export const axes: readonly MetricAxis[] = [
  { id: 'costPerLead', label: 'Custo por lead', unit: 'currency', lowerIsBetter: true },
  { id: 'scheduleRate', label: 'Taxa de agenda', unit: 'percent', lowerIsBetter: false },
  { id: 'winRate', label: 'Win rate', unit: 'percent', lowerIsBetter: false },
  { id: 'averageTicket', label: 'Ticket médio', unit: 'currency', lowerIsBetter: false },
  { id: 'cycle', label: 'Ciclo de venda', unit: 'days', lowerIsBetter: true },
];

export const data: readonly OriginQuarter[] = [
  { id: 'customer-referral', label: 'Indicação de cliente', spend: 0, leads: 940, qualified: 583, scheduled: 414, opportunities: 364, won: 167, wonRevenue: 23764100, cycleDays: 38 },
  { id: 'partner-referral', label: 'Indicação de parceiro', spend: 21280, leads: 760, qualified: 441, scheduled: 256, opportunities: 215, won: 84, wonRevenue: 9945600, cycleDays: 46 },
  { id: 'in-person-event', label: 'Evento presencial', spend: 225060, leads: 1210, qualified: 629, scheduled: 327, opportunities: 262, won: 86, wonRevenue: 8273200, cycleDays: 64 },
  { id: 'organic-search', label: 'Busca orgânica', spend: 0, leads: 4400, qualified: 1144, scheduled: 389, opportunities: 280, won: 67, wonRevenue: 4120500, cycleDays: 72 },
  { id: 'paid-search', label: 'Busca paga', spend: 466200, leads: 6300, qualified: 1386, scheduled: 416, opportunities: 287, won: 60, wonRevenue: 3486000, cycleDays: 78 },
  { id: 'own-webinar', label: 'Webinar próprio', spend: 92250, leads: 2250, qualified: 675, scheduled: 189, opportunities: 125, won: 24, wonRevenue: 1593600, cycleDays: 84 },
  { id: 'gated-content', label: 'Material para baixar', spend: 89700, leads: 3900, qualified: 663, scheduled: 159, opportunities: 102, won: 18, wonRevenue: 849600, cycleDays: 96 },
  { id: 'email', label: 'E-mail marketing', spend: 17400, leads: 2900, qualified: 551, scheduled: 143, opportunities: 96, won: 18, wonRevenue: 946800, cycleDays: 88 },
  { id: 'professional-network', label: 'Rede profissional', spend: 349800, leads: 2650, qualified: 663, scheduled: 206, opportunities: 144, won: 32, wonRevenue: 2825600, cycleDays: 70 },
  { id: 'paid-social', label: 'Mídia social patrocinada', spend: 161500, leads: 8500, qualified: 935, scheduled: 178, opportunities: 103, won: 12, wonRevenue: 458400, cycleDays: 104 },
  { id: 'organic-social', label: 'Mídia social orgânica', spend: 13600, leads: 3400, qualified: 442, scheduled: 93, opportunities: 57, won: 8, wonRevenue: 349600, cycleDays: 100 },
  { id: 'outbound', label: 'Prospecção ativa', spend: 184300, leads: 1900, qualified: 304, scheduled: 109, opportunities: 68, won: 12, wonRevenue: 1495200, cycleDays: 58 },
  { id: 'industry-portal', label: 'Portal setorial', spend: 92800, leads: 1600, qualified: 240, scheduled: 67, opportunities: 42, won: 6, wonRevenue: 331800, cycleDays: 92 },
  { id: 'third-party-list', label: 'Lista de terceiros', spend: 61600, leads: 5600, qualified: 224, scheduled: 22, opportunities: 12, won: 0, wonRevenue: 0, cycleDays: null },
];
