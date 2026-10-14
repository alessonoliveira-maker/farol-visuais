/**
 * Três plataformas de mídia paga medidas mês a mês em 2025: custo por lead (CPL) em reais no eixo
 * X, taxa de qualificação em fração de 0 a 1 no eixo Y e investimento do mês em reais, que vira a
 * área de cada bolha. O `slot` é a posição categórica fixa da plataforma na paleta, e não a ordem
 * de valor: com ele a mesma plataforma tem a mesma cor em todos os meses (COR-3).
 * Dado fictício e fixo: nenhum nome é plataforma, marca ou empresa real.
 */
export interface PlatformMonth {
  readonly id: string;
  readonly name: string;
  readonly slot: number;
  /** Mês de competência em `YYYY-MM`. */
  readonly mes: string;
  readonly cpl: number;
  readonly taxaQualificacao: number;
  readonly investimento: number;
}

export const data: readonly PlatformMonth[] = [
  { id: 'plat-busca', name: 'Busca paga', slot: 1, mes: '2025-01', cpl: 58, taxaQualificacao: 0.19, investimento: 72_000 },
  { id: 'plat-busca', name: 'Busca paga', slot: 1, mes: '2025-02', cpl: 61, taxaQualificacao: 0.20, investimento: 68_000 },
  { id: 'plat-busca', name: 'Busca paga', slot: 1, mes: '2025-03', cpl: 57, taxaQualificacao: 0.18, investimento: 75_000 },
  { id: 'plat-busca', name: 'Busca paga', slot: 1, mes: '2025-04', cpl: 64, taxaQualificacao: 0.21, investimento: 81_000 },
  { id: 'plat-busca', name: 'Busca paga', slot: 1, mes: '2025-05', cpl: 68, taxaQualificacao: 0.23, investimento: 79_000 },
  { id: 'plat-busca', name: 'Busca paga', slot: 1, mes: '2025-06', cpl: 71, taxaQualificacao: 0.24, investimento: 88_000 },
  { id: 'plat-busca', name: 'Busca paga', slot: 1, mes: '2025-07', cpl: 69, taxaQualificacao: 0.23, investimento: 92_000 },
  { id: 'plat-busca', name: 'Busca paga', slot: 1, mes: '2025-08', cpl: 74, taxaQualificacao: 0.26, investimento: 86_000 },
  { id: 'plat-busca', name: 'Busca paga', slot: 1, mes: '2025-09', cpl: 78, taxaQualificacao: 0.27, investimento: 97_000 },
  { id: 'plat-busca', name: 'Busca paga', slot: 1, mes: '2025-10', cpl: 81, taxaQualificacao: 0.29, investimento: 105_000 },
  { id: 'plat-busca', name: 'Busca paga', slot: 1, mes: '2025-11', cpl: 85, taxaQualificacao: 0.30, investimento: 112_000 },
  { id: 'plat-busca', name: 'Busca paga', slot: 1, mes: '2025-12', cpl: 88, taxaQualificacao: 0.32, investimento: 128_000 },
  { id: 'plat-video', name: 'Vídeo social', slot: 3, mes: '2025-01', cpl: 31, taxaQualificacao: 0.06, investimento: 41_000 },
  { id: 'plat-video', name: 'Vídeo social', slot: 3, mes: '2025-02', cpl: 29, taxaQualificacao: 0.05, investimento: 46_000 },
  { id: 'plat-video', name: 'Vídeo social', slot: 3, mes: '2025-03', cpl: 33, taxaQualificacao: 0.07, investimento: 52_000 },
  { id: 'plat-video', name: 'Vídeo social', slot: 3, mes: '2025-04', cpl: 30, taxaQualificacao: 0.06, investimento: 49_000 },
  { id: 'plat-video', name: 'Vídeo social', slot: 3, mes: '2025-05', cpl: 35, taxaQualificacao: 0.08, investimento: 58_000 },
  { id: 'plat-video', name: 'Vídeo social', slot: 3, mes: '2025-06', cpl: 34, taxaQualificacao: 0.07, investimento: 63_000 },
  { id: 'plat-video', name: 'Vídeo social', slot: 3, mes: '2025-07', cpl: 38, taxaQualificacao: 0.09, investimento: 57_000 },
  { id: 'plat-video', name: 'Vídeo social', slot: 3, mes: '2025-08', cpl: 36, taxaQualificacao: 0.08, investimento: 66_000 },
  { id: 'plat-video', name: 'Vídeo social', slot: 3, mes: '2025-09', cpl: 41, taxaQualificacao: 0.10, investimento: 71_000 },
  { id: 'plat-video', name: 'Vídeo social', slot: 3, mes: '2025-10', cpl: 39, taxaQualificacao: 0.09, investimento: 64_000 },
  { id: 'plat-video', name: 'Vídeo social', slot: 3, mes: '2025-11', cpl: 44, taxaQualificacao: 0.11, investimento: 74_000 },
  { id: 'plat-video', name: 'Vídeo social', slot: 3, mes: '2025-12', cpl: 46, taxaQualificacao: 0.12, investimento: 82_000 },
  { id: 'plat-rede', name: 'Rede profissional', slot: 6, mes: '2025-01', cpl: 148, taxaQualificacao: 0.34, investimento: 18_000 },
  { id: 'plat-rede', name: 'Rede profissional', slot: 6, mes: '2025-02', cpl: 152, taxaQualificacao: 0.36, investimento: 21_000 },
  { id: 'plat-rede', name: 'Rede profissional', slot: 6, mes: '2025-03', cpl: 141, taxaQualificacao: 0.33, investimento: 19_000 },
  { id: 'plat-rede', name: 'Rede profissional', slot: 6, mes: '2025-04', cpl: 158, taxaQualificacao: 0.38, investimento: 24_000 },
  { id: 'plat-rede', name: 'Rede profissional', slot: 6, mes: '2025-05', cpl: 163, taxaQualificacao: 0.39, investimento: 27_000 },
  { id: 'plat-rede', name: 'Rede profissional', slot: 6, mes: '2025-06', cpl: 171, taxaQualificacao: 0.41, investimento: 25_000 },
  { id: 'plat-rede', name: 'Rede profissional', slot: 6, mes: '2025-07', cpl: 166, taxaQualificacao: 0.40, investimento: 29_000 },
  { id: 'plat-rede', name: 'Rede profissional', slot: 6, mes: '2025-08', cpl: 178, taxaQualificacao: 0.43, investimento: 33_000 },
  { id: 'plat-rede', name: 'Rede profissional', slot: 6, mes: '2025-09', cpl: 184, taxaQualificacao: 0.45, investimento: 31_000 },
  { id: 'plat-rede', name: 'Rede profissional', slot: 6, mes: '2025-10', cpl: 191, taxaQualificacao: 0.46, investimento: 36_000 },
  { id: 'plat-rede', name: 'Rede profissional', slot: 6, mes: '2025-11', cpl: 197, taxaQualificacao: 0.48, investimento: 39_000 },
  { id: 'plat-rede', name: 'Rede profissional', slot: 6, mes: '2025-12', cpl: 206, taxaQualificacao: 0.51, investimento: 43_000 },
];

/** A plataforma cujo rastro de meses anteriores é desenhado; no Farol vem da seleção da página. */
export const trailId = 'plat-busca';
