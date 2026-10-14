/**
 * Campanhas de marketing do quarto trimestre de 2026, cada uma com início e fim declarados
 * (os dois dias inclusive) e a plataforma onde ficam no ar.
 * Dado fictício e fixo: as campanhas e as plataformas são genéricas, nenhuma é marca real.
 */
export type Platform = 'search' | 'social' | 'email' | 'video';

export interface Campaign {
  readonly id: string;
  readonly name: string;
  readonly platform: Platform;
  /** Primeiro dia no ar, em YYYY-MM-DD. */
  readonly start: string;
  /** Último dia no ar, em YYYY-MM-DD. */
  readonly end: string;
}

export const data: readonly Campaign[] = [
  { id: 'camp-01', name: 'Retomada de outubro', platform: 'search', start: '2026-10-01', end: '2026-10-31' },
  { id: 'camp-02', name: 'Semana do cliente', platform: 'email', start: '2026-10-12', end: '2026-10-18' },
  { id: 'camp-03', name: 'Lançamento da linha verão', platform: 'social', start: '2026-10-20', end: '2026-12-05' },
  { id: 'camp-04', name: 'Prova social em vídeo', platform: 'video', start: '2026-10-26', end: '2026-11-30' },
  { id: 'camp-05', name: 'Esquenta da Black Friday', platform: 'social', start: '2026-11-02', end: '2026-11-26' },
  { id: 'camp-06', name: 'Black Friday', platform: 'search', start: '2026-11-20', end: '2026-11-30' },
  { id: 'camp-07', name: 'Cashback de dezembro', platform: 'email', start: '2026-12-01', end: '2026-12-23' },
  { id: 'camp-08', name: 'Ofertas de Natal', platform: 'search', start: '2026-12-08', end: '2026-12-31' },
];

/** Janela do trimestre: o eixo vai do primeiro ao último dia, inclusive. */
export const windowStart = '2026-10-01';
export const windowEnd = '2026-12-31';
/** Data de hoje vinda do dado, nunca do relógio. */
export const today = '2026-11-12';
/** Janela de congelamento de mudanças, do primeiro ao último dia. */
export const freezeStart = '2026-12-20';
export const freezeEnd = '2026-12-31';

/** Cor fixa por plataforma: o slot de --chart-N pertence à plataforma, não à posição (COR-3, COR-8). */
export const platformSlots: Readonly<Record<Platform, number>> = {
  search: 1,
  social: 3,
  email: 6,
  video: 5,
};

export const platformLabels: Readonly<Record<Platform, string>> = {
  search: 'Busca paga',
  social: 'Redes sociais',
  email: 'E-mail',
  video: 'Vídeo',
};
