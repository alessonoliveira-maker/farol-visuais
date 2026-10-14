/**
 * Cinco métricas de mídia paga de 2026-08 por plataforma: custo por lead e investimento em reais;
 * taxa de clique, taxa de agenda e cobertura de telefone como fração de 0 a 1.
 * Dado fictício e fixo: plataformas genéricas, nenhuma marca real.
 */
export type MetricKey = 'costPerLead' | 'clickRate' | 'meetingRate' | 'phoneCoverage' | 'spend';

export interface MetricSpec {
  readonly key: MetricKey;
  readonly label: string;
  /** Unidade e sentido, escritos sob o nome do painel. */
  readonly note: string;
  readonly unit: 'currency' | 'percent';
  /** Sentido do bom: 'down' quando menor é melhor; 'none' para volume sem polaridade. */
  readonly goodDirection: 'up' | 'down' | 'none';
}

export interface PlatformMetrics {
  readonly id: string;
  readonly platform: string;
  /** null quando a plataforma não mede a métrica: é indisponível, nunca zero. */
  readonly values: Readonly<Record<MetricKey, number | null>>;
}

/** Um painel por métrica, nesta ordem. */
export const metrics: readonly MetricSpec[] = [
  { key: 'costPerLead', label: 'Custo por lead', note: 'em reais, menor é melhor', unit: 'currency', goodDirection: 'down' },
  { key: 'clickRate', label: 'Taxa de clique', note: '% das impressões', unit: 'percent', goodDirection: 'up' },
  { key: 'meetingRate', label: 'Taxa de agenda', note: '% dos leads', unit: 'percent', goodDirection: 'up' },
  { key: 'phoneCoverage', label: 'Cobertura de telefone', note: '% dos leads', unit: 'percent', goodDirection: 'up' },
  { key: 'spend', label: 'Investimento', note: 'em reais, total do mês', unit: 'currency', goodDirection: 'none' },
];

export const data: readonly PlatformMetrics[] = [
  {
    id: 'plat-rede-social',
    platform: 'Rede social',
    values: { costPerLead: 88, clickRate: 0.012, meetingRate: 0.043, phoneCoverage: 0.912, spend: 36_200 },
  },
  {
    id: 'plat-busca',
    platform: 'Busca paga',
    values: { costPerLead: 142, clickRate: 0.061, meetingRate: 0.118, phoneCoverage: 0.638, spend: 41_800 },
  },
  {
    id: 'plat-portal',
    platform: 'Portal de conteúdo',
    values: { costPerLead: 205, clickRate: 0.0031, meetingRate: 0.021, phoneCoverage: null, spend: 6_150 },
  },
  {
    id: 'plat-rede-profissional',
    platform: 'Rede profissional',
    values: { costPerLead: 318, clickRate: 0.0048, meetingRate: 0.162, phoneCoverage: 0.574, spend: 22_400 },
  },
];

/** A plataforma acesa por padrão em todos os painéis. */
export const highlightId = 'plat-rede-profissional';
