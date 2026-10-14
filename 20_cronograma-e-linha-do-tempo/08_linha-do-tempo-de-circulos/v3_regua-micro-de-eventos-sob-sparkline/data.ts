/**
 * Custo por lead qualificado (CPL), semanal, e eventos de mídia de 2026, para a régua de eventos
 * sob o sparkline. O CPL tem 36 semanas, de 2026-01-05 a 2026-09-07, e dá um degrau para baixo na
 * semana de 2026-04-06. Três eventos caem entre 2026-04-02 e 2026-04-06 de propósito, a menos de
 * um pixel de régua um do outro, para provar o agrupamento numa marca com contador.
 * Dado fictício e fixo: nenhum evento, campanha ou canal é real.
 */
export interface CplPoint {
  /** Segunda-feira da semana, `YYYY-MM-DD`. */
  readonly week: string;
  /** CPL qualificado da semana, em reais. */
  readonly cpl: number;
}

export type MediaEventKind = 'verba' | 'criativo' | 'canal';

export interface MediaEvent {
  readonly id: string;
  readonly name: string;
  /** Data do evento, `YYYY-MM-DD`. */
  readonly date: string;
  readonly kind: MediaEventKind;
}

export interface MediaTimelineData {
  readonly cpl: readonly CplPoint[];
  readonly events: readonly MediaEvent[];
}

const FIRST_WEEK_MS = Date.UTC(2026, 0, 5);
const WEEK_MS = 7 * 86_400_000;

/** CPL qualificado por semana, em reais, a partir de 2026-01-05. */
const CPL_VALUES: readonly number[] = [
  121, 119, 124, 118, 122, 120, 117, 123, 119, 121, 118, 122, 120, 104, 96, 93, 95, 91, 94, 92, 90, 93, 91, 89, 92, 90, 88, 91, 89, 90, 87, 91, 88, 90, 89, 87,
];

export const data: MediaTimelineData = {
  cpl: CPL_VALUES.map((cpl, index) => ({ week: new Date(FIRST_WEEK_MS + index * WEEK_MS).toISOString().slice(0, 10), cpl })),
  events: [
    { id: 'e-01', name: 'Verba de busca ampliada', date: '2026-02-10', kind: 'verba' },
    { id: 'e-02', name: 'Criativos de vídeo trocados', date: '2026-03-16', kind: 'criativo' },
    { id: 'e-03', name: 'Canal de parceiros ativado', date: '2026-04-02', kind: 'canal' },
    { id: 'e-04', name: 'Verba redistribuída entre campanhas', date: '2026-04-03', kind: 'verba' },
    { id: 'e-05', name: 'Criativos novos de busca', date: '2026-04-06', kind: 'criativo' },
    { id: 'e-06', name: 'Pausa de campanha antiga', date: '2026-06-08', kind: 'verba' },
    { id: 'e-07', name: 'Canal de e-mail reativado', date: '2026-07-20', kind: 'canal' },
    { id: 'e-08', name: 'Criativos sazonais', date: '2026-08-24', kind: 'criativo' },
  ],
};
