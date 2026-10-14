/**
 * Resultado de 48 campanhas no terceiro trimestre de 2026 (2026-07 a 2026-09), em CONTAGENS e
 * somas: investimento em reais, leads, leads qualificados, agendas marcadas, agendas realizadas e
 * a mediana de dias entre o lead e o negócio ganho. O dado nunca declara a taxa (DAD-1): custo
 * por lead, taxa de agenda e comparecimento são derivados no componente, cada um do seu par.
 *
 * Dado fictício e fixo: nenhuma campanha, canal ou plataforma é real. As 48 linhas nasceram de um
 * gerador com semente fixa, fora do repositório, e foram ESCRITAS aqui; nada é sorteado em tempo
 * de render (DAD-3). Doze campanhas foram ajustadas à mão, para o dado exercitar o caso difícil.
 *
 * Casos difíceis que o dado exercita: 9 das 48 campanhas ainda não têm negócio ganho, então
 * `cycleDays` é `null` e NÃO zero (DAD-2); uma delas (Portal setorial 07) tem zero medido e
 * ausência na mesma linha, porque marcou 0 de 12 agendas, taxa de agenda de 0,0%, e sem agenda
 * não existe comparecimento a medir; a faixa padrão de custo por lead pega 7 campanhas, 2 delas
 * sem ciclo; e as taxas vão de base pequena (14 de 27) a base grande (132 de 651).
 */
export interface Campaign {
  readonly id: string;
  readonly label: string;
  /** Investimento da campanha no trimestre, em reais. */
  readonly spend: number;
  readonly leads: number;
  readonly qualified: number;
  readonly scheduled: number;
  readonly attended: number;
  /** Mediana de dias entre o lead e o negócio ganho. `null` quando nenhum negócio foi ganho. */
  readonly cycleDays: number | null;
}

export type MetricId = 'costPerLead' | 'scheduleRate' | 'attendance' | 'cycle';
export type MetricUnit = 'currency' | 'percent' | 'days';

/** Um eixo tem unidade, polaridade e o jeito de dizer que a métrica não foi medida. */
export interface MetricAxis {
  readonly id: MetricId;
  readonly label: string;
  readonly unit: MetricUnit;
  readonly lowerIsBetter: boolean;
  /** Complemento de "N campanhas ...", com a concordância certa para cada métrica. */
  readonly missingLabel: string;
}

/** Seleção por faixa: um eixo e os dois limites, na unidade do eixo. */
export interface BrushRange {
  readonly axisId: MetricId;
  readonly min: number;
  readonly max: number;
}

/** Primeiro e último mês do recorte, em `YYYY-MM`. */
export const period = { start: '2026-07', end: '2026-09' } as const;

/** O custo e a taxa de agenda ficam vizinhos, porque é o par que a pergunta do cartão cruza. */
export const axes: readonly MetricAxis[] = [
  { id: 'costPerLead', label: 'Custo por lead', unit: 'currency', lowerIsBetter: true, missingLabel: 'sem custo por lead medido' },
  { id: 'scheduleRate', label: 'Taxa de agenda', unit: 'percent', lowerIsBetter: false, missingLabel: 'sem taxa de agenda medida' },
  { id: 'attendance', label: 'Comparecimento', unit: 'percent', lowerIsBetter: false, missingLabel: 'sem comparecimento medido' },
  { id: 'cycle', label: 'Ciclo de venda', unit: 'days', lowerIsBetter: true, missingLabel: 'sem ciclo medido' },
];

/** A faixa que nasce selecionada: custo por lead de R$ 10 a R$ 30, que pega 7 das 48 campanhas. */
export const brush: BrushRange = { axisId: 'costPerLead', min: 10, max: 30 };

export const data: readonly Campaign[] = [
  { id: 'paid-search-01', label: 'Busca paga 01', spend: 60500, leads: 810, qualified: 126, scheduled: 34, attended: 24, cycleDays: 84 },
  { id: 'paid-search-02', label: 'Busca paga 02', spend: 40460, leads: 470, qualified: 125, scheduled: 43, attended: 28, cycleDays: 62 },
  { id: 'paid-search-03', label: 'Busca paga 03', spend: 97380, leads: 940, qualified: 159, scheduled: 53, attended: 37, cycleDays: 94 },
  { id: 'paid-search-04', label: 'Busca paga 04', spend: 47000, leads: 730, qualified: 192, scheduled: 53, attended: 38, cycleDays: 72 },
  { id: 'paid-search-05', label: 'Busca paga 05', spend: 43820, leads: 730, qualified: 124, scheduled: 34, attended: 22, cycleDays: 65 },
  { id: 'paid-search-06', label: 'Busca paga 06', spend: 49370, leads: 770, qualified: 133, scheduled: 39, attended: 30, cycleDays: 78 },
  { id: 'paid-search-07', label: 'Busca paga 07', spend: 27770, leads: 480, qualified: 104, scheduled: 31, attended: 19, cycleDays: null },
  { id: 'paid-search-08', label: 'Busca paga 08', spend: 71000, leads: 1000, qualified: 222, scheduled: 69, attended: 49, cycleDays: 76 },
  { id: 'social-01', label: 'Mídia social 01', spend: 37720, leads: 1060, qualified: 283, scheduled: 31, attended: 20, cycleDays: 88 },
  { id: 'social-02', label: 'Mídia social 02', spend: 120530, leads: 2510, qualified: 480, scheduled: 115, attended: 64, cycleDays: 94 },
  { id: 'social-03', label: 'Mídia social 03', spend: 50090, leads: 890, qualified: 214, scheduled: 42, attended: 21, cycleDays: null },
  { id: 'social-04', label: 'Mídia social 04', spend: 19860, leads: 1000, qualified: 224, scheduled: 41, attended: 21, cycleDays: 84 },
  { id: 'social-05', label: 'Mídia social 05', spend: 50170, leads: 1440, qualified: 285, scheduled: 43, attended: 27, cycleDays: 98 },
  { id: 'social-06', label: 'Mídia social 06', spend: 25260, leads: 1500, qualified: 350, scheduled: 37, attended: 24, cycleDays: null },
  { id: 'social-07', label: 'Mídia social 07', spend: 81340, leads: 2450, qualified: 393, scheduled: 51, attended: 28, cycleDays: 101 },
  { id: 'social-08', label: 'Mídia social 08', spend: 114120, leads: 2360, qualified: 651, scheduled: 132, attended: 65, cycleDays: null },
  { id: 'network-01', label: 'Rede profissional 01', spend: 81420, leads: 600, qualified: 185, scheduled: 68, attended: 45, cycleDays: null },
  { id: 'network-02', label: 'Rede profissional 02', spend: 49560, leads: 570, qualified: 102, scheduled: 43, attended: 34, cycleDays: 61 },
  { id: 'network-03', label: 'Rede profissional 03', spend: 41820, leads: 370, qualified: 98, scheduled: 34, attended: 26, cycleDays: 60 },
  { id: 'network-04', label: 'Rede profissional 04', spend: 58200, leads: 610, qualified: 113, scheduled: 36, attended: 25, cycleDays: 70 },
  { id: 'network-05', label: 'Rede profissional 05', spend: 48450, leads: 570, qualified: 170, scheduled: 52, attended: 38, cycleDays: 63 },
  { id: 'network-06', label: 'Rede profissional 06', spend: 58860, leads: 530, qualified: 134, scheduled: 56, attended: 43, cycleDays: 71 },
  { id: 'network-07', label: 'Rede profissional 07', spend: 47280, leads: 590, qualified: 187, scheduled: 62, attended: 50, cycleDays: 72 },
  { id: 'network-08', label: 'Rede profissional 08', spend: 41550, leads: 290, qualified: 68, scheduled: 27, attended: 21, cycleDays: 75 },
  { id: 'email-01', label: 'E-mail 01', spend: 5840, leads: 320, qualified: 59, scheduled: 16, attended: 11, cycleDays: 101 },
  { id: 'email-02', label: 'E-mail 02', spend: 13670, leads: 820, qualified: 234, scheduled: 52, attended: 37, cycleDays: 71 },
  { id: 'email-03', label: 'E-mail 03', spend: 30960, leads: 960, qualified: 301, scheduled: 89, attended: 57, cycleDays: 82 },
  { id: 'email-04', label: 'E-mail 04', spend: 27090, leads: 520, qualified: 106, scheduled: 20, attended: 13, cycleDays: 71 },
  { id: 'email-05', label: 'E-mail 05', spend: 21700, leads: 1000, qualified: 252, scheduled: 40, attended: 24, cycleDays: null },
  { id: 'email-06', label: 'E-mail 06', spend: 21170, leads: 480, qualified: 100, scheduled: 28, attended: 19, cycleDays: 93 },
  { id: 'email-07', label: 'E-mail 07', spend: 21390, leads: 1030, qualified: 257, scheduled: 106, attended: 66, cycleDays: 75 },
  { id: 'email-08', label: 'E-mail 08', spend: 41870, leads: 1070, qualified: 166, scheduled: 29, attended: 21, cycleDays: 86 },
  { id: 'webinar-01', label: 'Webinar 01', spend: 17340, leads: 230, qualified: 37, scheduled: 13, attended: 10, cycleDays: 55 },
  { id: 'webinar-02', label: 'Webinar 02', spend: 7420, leads: 190, qualified: 27, scheduled: 14, attended: 12, cycleDays: 70 },
  { id: 'webinar-03', label: 'Webinar 03', spend: 22740, leads: 430, qualified: 118, scheduled: 66, attended: 54, cycleDays: 76 },
  { id: 'webinar-04', label: 'Webinar 04', spend: 9040, leads: 330, qualified: 96, scheduled: 47, attended: 37, cycleDays: 51 },
  { id: 'webinar-05', label: 'Webinar 05', spend: 21270, leads: 300, qualified: 76, scheduled: 41, attended: 34, cycleDays: 56 },
  { id: 'webinar-06', label: 'Webinar 06', spend: 17790, leads: 280, qualified: 78, scheduled: 25, attended: 17, cycleDays: 55 },
  { id: 'webinar-07', label: 'Webinar 07', spend: 36710, leads: 410, qualified: 81, scheduled: 28, attended: 20, cycleDays: 72 },
  { id: 'webinar-08', label: 'Webinar 08', spend: 10680, leads: 290, qualified: 65, scheduled: 21, attended: 15, cycleDays: 75 },
  { id: 'portal-01', label: 'Portal setorial 01', spend: 23870, leads: 380, qualified: 92, scheduled: 29, attended: 17, cycleDays: 77 },
  { id: 'portal-02', label: 'Portal setorial 02', spend: 45150, leads: 370, qualified: 73, scheduled: 15, attended: 8, cycleDays: null },
  { id: 'portal-03', label: 'Portal setorial 03', spend: 45180, leads: 380, qualified: 115, scheduled: 37, attended: 24, cycleDays: 86 },
  { id: 'portal-04', label: 'Portal setorial 04', spend: 17020, leads: 210, qualified: 46, scheduled: 15, attended: 9, cycleDays: 88 },
  { id: 'portal-05', label: 'Portal setorial 05', spend: 23300, leads: 240, qualified: 63, scheduled: 12, attended: 8, cycleDays: null },
  { id: 'portal-06', label: 'Portal setorial 06', spend: 62000, leads: 480, qualified: 138, scheduled: 39, attended: 23, cycleDays: 90 },
  { id: 'portal-07', label: 'Portal setorial 07', spend: 14400, leads: 150, qualified: 12, scheduled: 0, attended: 0, cycleDays: null },
  { id: 'portal-08', label: 'Portal setorial 08', spend: 16130, leads: 260, qualified: 53, scheduled: 13, attended: 9, cycleDays: 101 },
];

/** A métrica que ordena a lista das campanhas selecionadas e vai escrita ao lado de cada nome. */
export const rankBy: MetricId = 'scheduleRate';
