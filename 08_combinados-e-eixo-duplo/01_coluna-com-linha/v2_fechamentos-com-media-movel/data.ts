/**
 * Fechamentos por semana num recorte de 12 semanas de calendário, em contagem de oportunidades ganhas.
 *
 * Esta lista traz 11 linhas de propósito: a semana de 2026-07-27 não tem linha, como acontece com o
 * resultado de uma consulta agrupada em que semana sem registro some. O componente gera o calendário
 * completo e trata a semana ausente como lacuna declarada, nunca como zero. Quem sabe que a ausência
 * é zero medido passa a linha com `closings: 0`.
 *
 * A semana é nomeada pela segunda-feira em que começa. A última linha é a semana corrente e está
 * parcial: ela cobre apenas os dias já decorridos, por isso fica fora da média móvel e recebe
 * marca vazada no desenho.
 *
 * Dado fictício e fixo: nenhuma pessoa, empresa ou operação real.
 */
export interface WeeklyClosing {
  /** Segunda-feira da semana, em YYYY-MM-DD. */
  readonly week: string;
  /** Oportunidades ganhas na semana. */
  readonly closings: number;
  /** Semana ainda em curso: a contagem não cobre a semana inteira. */
  readonly partial: boolean;
}

export const data: readonly WeeklyClosing[] = [
  { week: '2026-07-13', closings: 11, partial: false },
  { week: '2026-07-20', closings: 17, partial: false },
  { week: '2026-08-03', closings: 15, partial: false },
  { week: '2026-08-10', closings: 18, partial: false },
  { week: '2026-08-17', closings: 13, partial: false },
  { week: '2026-08-24', closings: 12, partial: false },
  { week: '2026-08-31', closings: 20, partial: false },
  { week: '2026-09-07', closings: 16, partial: false },
  { week: '2026-09-14', closings: 14, partial: false },
  { week: '2026-09-21', closings: 19, partial: false },
  { week: '2026-09-28', closings: 3, partial: true },
];

/** Último dia com fechamento computado na semana parcial, em YYYY-MM-DD. */
export const asOf = '2026-09-28';
