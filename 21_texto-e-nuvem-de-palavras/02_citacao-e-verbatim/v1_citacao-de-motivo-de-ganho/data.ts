/**
 * A frase de cliente que resume o motivo de ganho mais citado no 3º trimestre de 2026 na
 * Comercial, com o perfil fictício de quem a disse e o quanto ela representa das respostas.
 * Dado fictício e fixo: o perfil é uma faixa de cliente, sem nome, e-mail ou telefone.
 *
 * O caso difícil é a representatividade: a frase ilustra um padrão, não prova frequência. Por isso
 * ela vem sempre com as duas contagens, as 38 respostas parecidas e as 164 respostas de ganho do
 * período, e a parcela é calculada, nunca digitada.
 */
export interface WinQuote {
  readonly id: string;
  /** Motivo de ganho em minúsculas, para entrar no meio de frase. */
  readonly reason: string;
  /** Primeiro mês do período das respostas, YYYY-MM. */
  readonly periodStart: string;
  /** Último mês do período das respostas, YYYY-MM. */
  readonly periodEnd: string;
  /** Trecho literal da resposta; `null` quando nenhuma resposta do motivo pôde ser citada. */
  readonly quote: string | null;
  /** Perfil fictício de quem disse, em minúsculas, para entrar no meio de frase. */
  readonly profile: string;
  /** Mês em que a resposta foi dada, YYYY-MM. */
  readonly answeredOn: string;
  /** Respostas parecidas com a citada, ela inclusa. */
  readonly similarCount: number;
  /** Todas as respostas de ganho do período. */
  readonly totalCount: number;
}

export const data: WinQuote = {
  id: 'ganho-2026-t3',
  reason: 'atendimento consultivo',
  periodStart: '2026-07',
  periodEnd: '2026-09',
  quote:
    'O que pesou foi ter alguém que explicou o plano inteiro antes de falar em contrato. Eu fiquei sabendo o que estava assinando, e isso, para um patrimônio de família, vale mais que meio ponto de taxa.',
  profile: 'cliente patrimonial, faixa B',
  answeredOn: '2026-09',
  similarCount: 38,
  totalCount: 164,
};
