/**
 * Agendas realizadas pela pré-vendas em out/26, por equipe, e as agendas por plataforma de origem
 * no mesmo mês. Dado fictício e fixo: equipes e plataformas são inventadas, sem pessoa nem marca.
 *
 * O caso difícil é a mesma função de frase diante de cinco situações: nenhuma agenda, uma agenda,
 * variação dentro do corte de estabilidade, base anterior zero e dado não coletado. As plataformas
 * empatam na primeira posição de propósito, para o título dinâmico nomear as duas.
 */

export interface TeamAgendas {
  readonly id: string;
  readonly team: string;
  /** Agendas realizadas no mês atual, ou `null` quando a coleta não aconteceu. */
  readonly current: number | null;
  /** Agendas realizadas no mês anterior, ou `null` sem medição. */
  readonly previous: number | null;
  /** Motivo escrito quando `current` é `null`. */
  readonly unavailableReason?: string;
}

export interface PlatformAgendas {
  readonly name: string;
  readonly agendas: number | null;
}

export interface AgendaPhrases {
  /** Mês atual no formato YYYY-MM. */
  readonly month: string;
  /** Mês anterior no formato YYYY-MM. */
  readonly previousMonth: string;
  readonly teams: readonly TeamAgendas[];
  readonly platforms: readonly PlatformAgendas[];
}

export const data: AgendaPhrases = {
  month: '2026-10',
  previousMonth: '2026-09',
  teams: [
    { id: 'team-leste', team: 'Equipe Leste', current: 0, previous: 3 },
    { id: 'team-oeste', team: 'Equipe Oeste', current: 1, previous: 4 },
    { id: 'team-sul', team: 'Equipe Sul', current: 2, previous: 1 },
    { id: 'team-centro', team: 'Equipe Centro', current: 2_312, previous: 2_303 },
    { id: 'team-nova', team: 'Equipe Nova', current: 6, previous: 0 },
    {
      id: 'team-norte',
      team: 'Equipe Norte',
      current: null,
      previous: 18,
      unavailableReason: 'a integração da agenda ficou fora do ar no mês',
    },
  ],
  platforms: [
    { name: 'Plataforma Norte', agendas: 14 },
    { name: 'Plataforma Sul', agendas: 14 },
    { name: 'Plataforma Leste', agendas: 9 },
  ],
};
