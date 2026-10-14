/**
 * Leads semanais por origem em 2026 (52 semanas), em contagem de leads. Seis origens nomeadas,
 * mais "outras" (agregação de 2 origens menores, contagem de origens fixa, o volume varia por
 * semana) e "semOrigem", a camada de ausência no topo da pilha. O total semanal cai ao longo do
 * ano mesmo com a composição se redistribuindo, por isso a versão soma o painel de total abaixo
 * da área 100%. Dado fictício e fixo.
 */
export interface WeeklyLeadOrigin {
  readonly week: string;
  readonly indicacao: number;
  readonly conteudo: number;
  readonly evento: number;
  readonly parceria: number;
  readonly anuncio: number;
  readonly referencia: number;
  readonly outras: number;
  readonly semOrigem: number;
}

/** Número de origens menores agregadas em "outras": fixo, não varia por semana. */
export const outrasCount = 2;

export const data: readonly WeeklyLeadOrigin[] = [
  { week: '2026-01-05', indicacao: 30, conteudo: 29, evento: 16, parceria: 12, anuncio: 70, referencia: 11, outras: 1, semOrigem: 58 },
  { week: '2026-01-12', indicacao: 31, conteudo: 30, evento: 16, parceria: 12, anuncio: 71, referencia: 11, outras: 2, semOrigem: 58 },
  { week: '2026-01-19', indicacao: 32, conteudo: 30, evento: 15, parceria: 13, anuncio: 71, referencia: 11, outras: 2, semOrigem: 58 },
  { week: '2026-01-26', indicacao: 33, conteudo: 30, evento: 15, parceria: 13, anuncio: 71, referencia: 11, outras: 2, semOrigem: 58 },
  { week: '2026-02-02', indicacao: 34, conteudo: 30, evento: 15, parceria: 13, anuncio: 71, referencia: 11, outras: 2, semOrigem: 58 },
  { week: '2026-02-09', indicacao: 35, conteudo: 30, evento: 15, parceria: 13, anuncio: 71, referencia: 11, outras: 2, semOrigem: 58 },
  { week: '2026-02-16', indicacao: 36, conteudo: 30, evento: 14, parceria: 13, anuncio: 71, referencia: 11, outras: 1, semOrigem: 58 },
  { week: '2026-02-23', indicacao: 37, conteudo: 30, evento: 14, parceria: 14, anuncio: 70, referencia: 10, outras: 2, semOrigem: 57 },
  { week: '2026-03-02', indicacao: 37, conteudo: 29, evento: 14, parceria: 14, anuncio: 68, referencia: 10, outras: 2, semOrigem: 57 },
  { week: '2026-03-09', indicacao: 37, conteudo: 28, evento: 13, parceria: 14, anuncio: 67, referencia: 10, outras: 2, semOrigem: 56 },
  { week: '2026-03-16', indicacao: 38, conteudo: 28, evento: 13, parceria: 14, anuncio: 65, referencia: 10, outras: 2, semOrigem: 55 },
  { week: '2026-03-23', indicacao: 38, conteudo: 27, evento: 13, parceria: 14, anuncio: 62, referencia: 10, outras: 2, semOrigem: 54 },
  { week: '2026-03-30', indicacao: 38, conteudo: 26, evento: 12, parceria: 14, anuncio: 60, referencia: 9, outras: 1, semOrigem: 53 },
  { week: '2026-04-06', indicacao: 38, conteudo: 26, evento: 12, parceria: 13, anuncio: 58, referencia: 9, outras: 2, semOrigem: 52 },
  { week: '2026-04-13', indicacao: 37, conteudo: 25, evento: 12, parceria: 13, anuncio: 55, referencia: 9, outras: 2, semOrigem: 51 },
  { week: '2026-04-20', indicacao: 37, conteudo: 25, evento: 11, parceria: 13, anuncio: 53, referencia: 9, outras: 2, semOrigem: 49 },
  { week: '2026-04-27', indicacao: 37, conteudo: 24, evento: 11, parceria: 13, anuncio: 51, referencia: 8, outras: 2, semOrigem: 48 },
  { week: '2026-05-04', indicacao: 36, conteudo: 24, evento: 11, parceria: 13, anuncio: 49, referencia: 8, outras: 2, semOrigem: 46 },
  { week: '2026-05-11', indicacao: 36, conteudo: 24, evento: 11, parceria: 13, anuncio: 48, referencia: 8, outras: 1, semOrigem: 45 },
  { week: '2026-05-18', indicacao: 35, conteudo: 24, evento: 11, parceria: 12, anuncio: 47, referencia: 8, outras: 2, semOrigem: 43 },
  { week: '2026-05-25', indicacao: 35, conteudo: 25, evento: 10, parceria: 12, anuncio: 46, referencia: 7, outras: 2, semOrigem: 41 },
  { week: '2026-06-01', indicacao: 34, conteudo: 25, evento: 10, parceria: 12, anuncio: 46, referencia: 7, outras: 2, semOrigem: 40 },
  { week: '2026-06-08', indicacao: 34, conteudo: 25, evento: 10, parceria: 12, anuncio: 46, referencia: 7, outras: 2, semOrigem: 38 },
  { week: '2026-06-15', indicacao: 33, conteudo: 26, evento: 10, parceria: 12, anuncio: 46, referencia: 7, outras: 2, semOrigem: 37 },
  { week: '2026-06-22', indicacao: 33, conteudo: 27, evento: 10, parceria: 11, anuncio: 47, referencia: 7, outras: 1, semOrigem: 35 },
  { week: '2026-06-29', indicacao: 33, conteudo: 28, evento: 10, parceria: 11, anuncio: 47, referencia: 7, outras: 2, semOrigem: 34 },
  { week: '2026-07-06', indicacao: 32, conteudo: 29, evento: 10, parceria: 11, anuncio: 48, referencia: 7, outras: 2, semOrigem: 33 },
  { week: '2026-07-13', indicacao: 33, conteudo: 30, evento: 10, parceria: 11, anuncio: 48, referencia: 7, outras: 2, semOrigem: 32 },
  { week: '2026-07-20', indicacao: 33, conteudo: 31, evento: 10, parceria: 11, anuncio: 49, referencia: 7, outras: 2, semOrigem: 31 },
  { week: '2026-07-27', indicacao: 33, conteudo: 31, evento: 10, parceria: 11, anuncio: 49, referencia: 7, outras: 2, semOrigem: 30 },
  { week: '2026-08-03', indicacao: 33, conteudo: 32, evento: 11, parceria: 11, anuncio: 49, referencia: 7, outras: 1, semOrigem: 30 },
  { week: '2026-08-10', indicacao: 34, conteudo: 33, evento: 11, parceria: 11, anuncio: 48, referencia: 7, outras: 2, semOrigem: 29 },
  { week: '2026-08-17', indicacao: 35, conteudo: 33, evento: 11, parceria: 12, anuncio: 47, referencia: 8, outras: 2, semOrigem: 29 },
  { week: '2026-08-24', indicacao: 36, conteudo: 34, evento: 11, parceria: 12, anuncio: 46, referencia: 8, outras: 2, semOrigem: 29 },
  { week: '2026-08-31', indicacao: 36, conteudo: 34, evento: 12, parceria: 12, anuncio: 44, referencia: 8, outras: 2, semOrigem: 28 },
  { week: '2026-09-07', indicacao: 37, conteudo: 34, evento: 12, parceria: 12, anuncio: 42, referencia: 8, outras: 2, semOrigem: 28 },
  { week: '2026-09-14', indicacao: 38, conteudo: 34, evento: 12, parceria: 13, anuncio: 40, referencia: 8, outras: 1, semOrigem: 28 },
  { week: '2026-09-21', indicacao: 40, conteudo: 34, evento: 12, parceria: 13, anuncio: 38, referencia: 9, outras: 2, semOrigem: 28 },
  { week: '2026-09-28', indicacao: 41, conteudo: 33, evento: 13, parceria: 13, anuncio: 35, referencia: 9, outras: 2, semOrigem: 28 },
  { week: '2026-10-05', indicacao: 42, conteudo: 33, evento: 13, parceria: 14, anuncio: 33, referencia: 9, outras: 2, semOrigem: 28 },
  { week: '2026-10-12', indicacao: 43, conteudo: 32, evento: 13, parceria: 14, anuncio: 31, referencia: 9, outras: 2, semOrigem: 28 },
  { week: '2026-10-19', indicacao: 44, conteudo: 32, evento: 14, parceria: 14, anuncio: 29, referencia: 10, outras: 2, semOrigem: 28 },
  { week: '2026-10-26', indicacao: 45, conteudo: 31, evento: 14, parceria: 15, anuncio: 27, referencia: 10, outras: 1, semOrigem: 28 },
  { week: '2026-11-02', indicacao: 46, conteudo: 30, evento: 14, parceria: 15, anuncio: 25, referencia: 10, outras: 2, semOrigem: 28 },
  { week: '2026-11-09', indicacao: 46, conteudo: 30, evento: 15, parceria: 15, anuncio: 24, referencia: 10, outras: 2, semOrigem: 28 },
  { week: '2026-11-16', indicacao: 47, conteudo: 29, evento: 15, parceria: 16, anuncio: 24, referencia: 10, outras: 2, semOrigem: 27 },
  { week: '2026-11-23', indicacao: 48, conteudo: 29, evento: 15, parceria: 16, anuncio: 23, referencia: 11, outras: 2, semOrigem: 27 },
  { week: '2026-11-30', indicacao: 48, conteudo: 28, evento: 15, parceria: 16, anuncio: 23, referencia: 11, outras: 2, semOrigem: 26 },
  { week: '2026-12-07', indicacao: 48, conteudo: 28, evento: 16, parceria: 17, anuncio: 23, referencia: 11, outras: 1, semOrigem: 25 },
  { week: '2026-12-14', indicacao: 48, conteudo: 28, evento: 16, parceria: 17, anuncio: 24, referencia: 11, outras: 2, semOrigem: 24 },
  { week: '2026-12-21', indicacao: 48, conteudo: 28, evento: 16, parceria: 17, anuncio: 25, referencia: 11, outras: 2, semOrigem: 23 },
  { week: '2026-12-28', indicacao: 48, conteudo: 28, evento: 16, parceria: 17, anuncio: 25, referencia: 11, outras: 2, semOrigem: 22 },
];
