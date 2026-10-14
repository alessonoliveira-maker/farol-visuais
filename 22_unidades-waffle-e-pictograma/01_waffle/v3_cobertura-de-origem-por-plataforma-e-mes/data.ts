/**
 * Leads por plataforma de mídia e mês do trimestre, e quantos chegaram com origem declarada.
 * Dado fictício e fixo: as plataformas são grupos genéricos, nenhum nome de produto real.
 *
 * Os casos difíceis estão em duas células: redes sociais em 2026-07 tem só 22 leads, abaixo do piso
 * de amostra, e vídeo e display em 2026-07 não teve coleta (`total` nulo). Sem coleta não é 0%.
 */
export interface CoverageCell {
  readonly platformId: string;
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Leads do mês na plataforma, ou `null` quando não houve coleta. */
  readonly total: number | null;
  /** Leads com origem declarada, ou `null` quando não houve coleta. */
  readonly declared: number | null;
}

export interface CoverageData {
  readonly platforms: readonly { readonly id: string; readonly label: string }[];
  /** Meses na ordem de leitura, esquerda para a direita. */
  readonly months: readonly string[];
  readonly cells: readonly CoverageCell[];
}

export const data: CoverageData = {
  platforms: [
    { id: 'search', label: 'Busca paga' },
    { id: 'social', label: 'Redes sociais' },
    { id: 'video', label: 'Vídeo e display' },
  ],
  months: ['2026-06', '2026-07', '2026-08'],
  cells: [
    { platformId: 'search', month: '2026-06', total: 412, declared: 331 },
    { platformId: 'search', month: '2026-07', total: 388, declared: 312 },
    { platformId: 'search', month: '2026-08', total: 401, declared: 326 },
    { platformId: 'social', month: '2026-06', total: 296, declared: 190 },
    { platformId: 'social', month: '2026-07', total: 22, declared: 17 },
    { platformId: 'social', month: '2026-08', total: 318, declared: 172 },
    { platformId: 'video', month: '2026-06', total: 154, declared: 121 },
    { platformId: 'video', month: '2026-07', total: null, declared: null },
    { platformId: 'video', month: '2026-08', total: 167, declared: 139 },
  ],
};
