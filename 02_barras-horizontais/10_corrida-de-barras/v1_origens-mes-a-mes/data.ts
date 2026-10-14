/**
 * Leads por origem, contados por mês, jan a dez em dois anos fiscais fictícios (24 meses).
 * Dado fictício e fixo: nenhuma origem corresponde a uma campanha ou parceiro real.
 */
export type OriginId =
  | 'indicacao'
  | 'cliente_ativo'
  | 'meta_ads'
  | 'google_ads'
  | 'linkedin_ads'
  | 'outbound_sdr'
  | 'organico_site'
  | 'parceria'
  | 'evento'
  | 'referencia_contador';

export interface OriginSeries {
  readonly id: OriginId;
  readonly label: string;
}

/** As 10 origens rastreadas. Nome longo de propósito, para exercitar a coluna de rótulo (TIP-7). */
export const origins: readonly OriginSeries[] = [
  { id: 'indicacao', label: 'Indicação de cliente' },
  { id: 'cliente_ativo', label: 'Cliente ativo em expansão' },
  { id: 'meta_ads', label: 'Tráfego pago em redes sociais' },
  { id: 'google_ads', label: 'Busca paga institucional' },
  { id: 'linkedin_ads', label: 'Mídia paga para decisores B2B' },
  { id: 'outbound_sdr', label: 'Outbound SDR' },
  { id: 'organico_site', label: 'Orgânico do site' },
  { id: 'parceria', label: 'Parceria distribuidora' },
  { id: 'evento', label: 'Evento presencial' },
  { id: 'referencia_contador', label: 'Referência de contador ou advogado' },
];

export interface OriginRacePeriod {
  /** Mês de referência. */
  readonly period: string;
  /** Contagem de leads no mês, por origem. */
  readonly values: Readonly<Record<OriginId, number>>;
}

export const data: readonly OriginRacePeriod[] = [
  { period: '2024-09', values: { indicacao: 40, cliente_ativo: 34, meta_ads: 79, google_ads: 60, linkedin_ads: 27, outbound_sdr: 47, organico_site: 37, parceria: 15, evento: 11, referencia_contador: 16 } },
  { period: '2024-10', values: { indicacao: 44, cliente_ativo: 35, meta_ads: 67, google_ads: 63, linkedin_ads: 25, outbound_sdr: 50, organico_site: 33, parceria: 16, evento: 11, referencia_contador: 18 } },
  { period: '2024-11', values: { indicacao: 45, cliente_ativo: 34, meta_ads: 57, google_ads: 57, linkedin_ads: 21, outbound_sdr: 52, organico_site: 31, parceria: 16, evento: 10, referencia_contador: 18 } },
  { period: '2024-12', values: { indicacao: 42, cliente_ativo: 32, meta_ads: 60, google_ads: 48, linkedin_ads: 18, outbound_sdr: 53, organico_site: 33, parceria: 15, evento: 9, referencia_contador: 18 } },
  { period: '2025-01', values: { indicacao: 38, cliente_ativo: 29, meta_ads: 70, google_ads: 43, linkedin_ads: 17, outbound_sdr: 51, organico_site: 39, parceria: 13, evento: 8, referencia_contador: 16 } },
  { period: '2025-02', values: { indicacao: 37, cliente_ativo: 28, meta_ads: 71, google_ads: 48, linkedin_ads: 21, outbound_sdr: 48, organico_site: 43, parceria: 11, evento: 7, referencia_contador: 14 } },
  { period: '2025-03', values: { indicacao: 40, cliente_ativo: 29, meta_ads: 59, google_ads: 56, linkedin_ads: 28, outbound_sdr: 45, organico_site: 42, parceria: 11, evento: 6, referencia_contador: 14 } },
  { period: '2025-04', values: { indicacao: 46, cliente_ativo: 33, meta_ads: 49, google_ads: 59, linkedin_ads: 33, outbound_sdr: 43, organico_site: 38, parceria: 12, evento: 6, referencia_contador: 14 } },
  { period: '2025-05', values: { indicacao: 51, cliente_ativo: 37, meta_ads: 52, google_ads: 53, linkedin_ads: 36, outbound_sdr: 42, organico_site: 36, parceria: 15, evento: 7, referencia_contador: 16 } },
  { period: '2025-06', values: { indicacao: 51, cliente_ativo: 40, meta_ads: 62, google_ads: 44, linkedin_ads: 34, outbound_sdr: 44, organico_site: 38, parceria: 18, evento: 9, referencia_contador: 18 } },
  { period: '2025-07', values: { indicacao: 48, cliente_ativo: 41, meta_ads: 63, google_ads: 39, linkedin_ads: 30, outbound_sdr: 47, organico_site: 44, parceria: 20, evento: 10, referencia_contador: 20 } },
  { period: '2025-08', values: { indicacao: 44, cliente_ativo: 40, meta_ads: 51, google_ads: 43, linkedin_ads: 27, outbound_sdr: 50, organico_site: 48, parceria: 21, evento: 12, referencia_contador: 21 } },
  { period: '2025-09', values: { indicacao: 43, cliente_ativo: 37, meta_ads: 41, google_ads: 52, linkedin_ads: 26, outbound_sdr: 54, organico_site: 47, parceria: 21, evento: 13, referencia_contador: 20 } },
  { period: '2025-10', values: { indicacao: 46, cliente_ativo: 34, meta_ads: 44, google_ads: 55, linkedin_ads: 30, outbound_sdr: 56, organico_site: 43, parceria: 20, evento: 13, referencia_contador: 18 } },
  { period: '2025-11', values: { indicacao: 52, cliente_ativo: 33, meta_ads: 54, google_ads: 49, linkedin_ads: 36, outbound_sdr: 56, organico_site: 40, parceria: 18, evento: 12, referencia_contador: 16 } },
  { period: '2025-12', values: { indicacao: 57, cliente_ativo: 35, meta_ads: 55, google_ads: 39, linkedin_ads: 42, outbound_sdr: 54, organico_site: 43, parceria: 16, evento: 11, referencia_contador: 16 } },
  { period: '2026-01', values: { indicacao: 58, cliente_ativo: 38, meta_ads: 43, google_ads: 35, linkedin_ads: 45, outbound_sdr: 51, organico_site: 48, parceria: 16, evento: 10, referencia_contador: 16 } },
  { period: '2026-02', values: { indicacao: 54, cliente_ativo: 42, meta_ads: 33, google_ads: 39, linkedin_ads: 43, outbound_sdr: 48, organico_site: 52, parceria: 17, evento: 8, referencia_contador: 18 } },
  { period: '2026-03', values: { indicacao: 50, cliente_ativo: 45, meta_ads: 36, google_ads: 47, linkedin_ads: 39, outbound_sdr: 46, organico_site: 52, parceria: 20, evento: 8, referencia_contador: 21 } },
  { period: '2026-04', values: { indicacao: 49, cliente_ativo: 46, meta_ads: 46, google_ads: 51, linkedin_ads: 35, outbound_sdr: 46, organico_site: 48, parceria: 23, evento: 8, referencia_contador: 22 } },
  { period: '2026-05', values: { indicacao: 53, cliente_ativo: 45, meta_ads: 47, google_ads: 45, linkedin_ads: 35, outbound_sdr: 47, organico_site: 45, parceria: 25, evento: 9, referencia_contador: 23 } },
  { period: '2026-06', values: { indicacao: 59, cliente_ativo: 42, meta_ads: 35, google_ads: 35, linkedin_ads: 39, outbound_sdr: 50, organico_site: 47, parceria: 26, evento: 10, referencia_contador: 22 } },
  { period: '2026-07', values: { indicacao: 63, cliente_ativo: 40, meta_ads: 25, google_ads: 31, linkedin_ads: 45, outbound_sdr: 54, organico_site: 53, parceria: 26, evento: 12, referencia_contador: 20 } },
  { period: '2026-08', values: { indicacao: 64, cliente_ativo: 39, meta_ads: 28, google_ads: 35, linkedin_ads: 51, outbound_sdr: 57, organico_site: 57, parceria: 25, evento: 14, referencia_contador: 19 } },
];
