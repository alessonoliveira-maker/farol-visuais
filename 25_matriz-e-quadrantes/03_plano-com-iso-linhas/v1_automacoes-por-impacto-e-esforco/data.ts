/**
 * Backlog de 14 automações de pré-vendas, com as notas de impacto e de esforço que o time deu a
 * cada uma, de 1 a 5, em número inteiro. As duas notas são avaliação do time, não medição: impacto
 * é o ganho esperado na rotina de quem prospecta, e esforço é o trabalho estimado para colocar a
 * automação no ar. A razão de impacto por esforço não é guardada aqui: sai das duas notas.
 * Dois pares têm exatamente as mesmas notas, de propósito, e três itens empatam na razão 1.
 * Dado fictício e fixo: nenhuma automação, ferramenta ou time corresponde a um real.
 */
export interface AutomationScore {
  readonly id: string;
  readonly name: string;
  /** Nota de impacto, de 1 a 5, dada pelo time. */
  readonly impacto: number;
  /** Nota de esforço, de 1 a 5, dada pelo time. */
  readonly esforco: number;
}

export const data: readonly AutomationScore[] = [
  { id: 'aut-01', name: 'Lembrete de reunião', impacto: 4, esforco: 1 },
  { id: 'aut-02', name: 'Resposta imediata', impacto: 3, esforco: 1 },
  { id: 'aut-03', name: 'Roteamento por região', impacto: 5, esforco: 2 },
  { id: 'aut-04', name: 'Alerta de lead parado', impacto: 2, esforco: 1 },
  { id: 'aut-05', name: 'Cadência de retomada', impacto: 4, esforco: 3 },
  { id: 'aut-06', name: 'Registro de ligação', impacto: 4, esforco: 3 },
  { id: 'aut-07', name: 'Enriquecimento de cadastro', impacto: 3, esforco: 3 },
  { id: 'aut-08', name: 'Resumo de conversa', impacto: 4, esforco: 4 },
  { id: 'aut-09', name: 'Agenda direto no formulário', impacto: 5, esforco: 5 },
  { id: 'aut-10', name: 'Pontuação de leads', impacto: 3, esforco: 4 },
  { id: 'aut-11', name: 'Assistente de qualificação por conversa', impacto: 4, esforco: 5 },
  { id: 'aut-12', name: 'Deduplicação de contatos', impacto: 2, esforco: 4 },
  { id: 'aut-13', name: 'Relatório semanal automático', impacto: 2, esforco: 4 },
  { id: 'aut-14', name: 'Painel diário de pré-vendas', impacto: 2, esforco: 5 },
];

/** Razão de impacto por esforço a partir da qual a automação entra primeiro na fila. */
export const priorityRatio = 2;
