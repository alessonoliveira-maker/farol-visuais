/**
 * Perdas do trimestre por motivo declarado e etapa do funil em que a oportunidade morreu.
 * Contagem de oportunidades, não de valor. Dado fictício e fixo: nenhuma pessoa ou empresa real.
 *
 * A matriz é COMPLETA: as 14 razões por 6 etapas dão 84 cruzamentos, e todos foram medidos, então
 * a contagem zero está escrita como zero e não como ausência. Quem desenha separa os dois casos
 * (EST-3 e DAD-2): o zero medido não recebe bolha, porque um piso de área o faria parecer volume,
 * e a nota do rodapé diz quantos cruzamentos ficaram nessa situação.
 *
 * A ordem do array é a ordem das categorias no desenho, e ela não é alfabética. O eixo Y de
 * categoria do Recharts desenha a primeira linha do array embaixo e a última em cima, então os
 * motivos entram do menor total para o maior, para o maior sair no topo do cartão (REC-3). Dentro
 * de cada motivo, a etapa entra na ordem do funil, que é a ordem do eixo X.
 */
export interface LossCell {
  readonly id: string;
  readonly reason: string;
  readonly stage: string;
  readonly count: number;
}

export const data: readonly LossCell[] = [
  { id: 'duplicado-tri', reason: 'Contato duplicado', stage: 'Triagem', count: 9 },
  { id: 'duplicado-dia', reason: 'Contato duplicado', stage: 'Diagnóstico', count: 2 },
  { id: 'duplicado-pro', reason: 'Contato duplicado', stage: 'Proposta', count: 0 },
  { id: 'duplicado-neg', reason: 'Contato duplicado', stage: 'Negociação', count: 0 },
  { id: 'duplicado-con', reason: 'Contato duplicado', stage: 'Contrato', count: 0 },
  { id: 'duplicado-imp', reason: 'Contato duplicado', stage: 'Implantação', count: 0 },
  { id: 'documentacao-tri', reason: 'Documentação incompleta', stage: 'Triagem', count: 0 },
  { id: 'documentacao-dia', reason: 'Documentação incompleta', stage: 'Diagnóstico', count: 0 },
  { id: 'documentacao-pro', reason: 'Documentação incompleta', stage: 'Proposta', count: 0 },
  { id: 'documentacao-neg', reason: 'Documentação incompleta', stage: 'Negociação', count: 3 },
  { id: 'documentacao-con', reason: 'Documentação incompleta', stage: 'Contrato', count: 8 },
  { id: 'documentacao-imp', reason: 'Documentação incompleta', stage: 'Implantação', count: 4 },
  { id: 'compliance-tri', reason: 'Reprovado no compliance', stage: 'Triagem', count: 0 },
  { id: 'compliance-dia', reason: 'Reprovado no compliance', stage: 'Diagnóstico', count: 0 },
  { id: 'compliance-pro', reason: 'Reprovado no compliance', stage: 'Proposta', count: 1 },
  { id: 'compliance-neg', reason: 'Reprovado no compliance', stage: 'Negociação', count: 5 },
  { id: 'compliance-con', reason: 'Reprovado no compliance', stage: 'Contrato', count: 9 },
  { id: 'compliance-imp', reason: 'Reprovado no compliance', stage: 'Implantação', count: 2 },
  { id: 'interno-tri', reason: 'Resolveu por conta própria', stage: 'Triagem', count: 3 },
  { id: 'interno-dia', reason: 'Resolveu por conta própria', stage: 'Diagnóstico', count: 5 },
  { id: 'interno-pro', reason: 'Resolveu por conta própria', stage: 'Proposta', count: 6 },
  { id: 'interno-neg', reason: 'Resolveu por conta própria', stage: 'Negociação', count: 4 },
  { id: 'interno-con', reason: 'Resolveu por conta própria', stage: 'Contrato', count: 0 },
  { id: 'interno-imp', reason: 'Resolveu por conta própria', stage: 'Implantação', count: 0 },
  { id: 'prazo-tri', reason: 'Prazo não atendido', stage: 'Triagem', count: 0 },
  { id: 'prazo-dia', reason: 'Prazo não atendido', stage: 'Diagnóstico', count: 2 },
  { id: 'prazo-pro', reason: 'Prazo não atendido', stage: 'Proposta', count: 7 },
  { id: 'prazo-neg', reason: 'Prazo não atendido', stage: 'Negociação', count: 9 },
  { id: 'prazo-con', reason: 'Prazo não atendido', stage: 'Contrato', count: 3 },
  { id: 'prazo-imp', reason: 'Prazo não atendido', stage: 'Implantação', count: 0 },
  { id: 'prioridade-tri', reason: 'Mudança de prioridade', stage: 'Triagem', count: 2 },
  { id: 'prioridade-dia', reason: 'Mudança de prioridade', stage: 'Diagnóstico', count: 5 },
  { id: 'prioridade-pro', reason: 'Mudança de prioridade', stage: 'Proposta', count: 6 },
  { id: 'prioridade-neg', reason: 'Mudança de prioridade', stage: 'Negociação', count: 7 },
  { id: 'prioridade-con', reason: 'Mudança de prioridade', stage: 'Contrato', count: 4 },
  { id: 'prioridade-imp', reason: 'Mudança de prioridade', stage: 'Implantação', count: 2 },
  { id: 'verba-tri', reason: 'Sem verba no exercício', stage: 'Triagem', count: 1 },
  { id: 'verba-dia', reason: 'Sem verba no exercício', stage: 'Diagnóstico', count: 4 },
  { id: 'verba-pro', reason: 'Sem verba no exercício', stage: 'Proposta', count: 12 },
  { id: 'verba-neg', reason: 'Sem verba no exercício', stage: 'Negociação', count: 8 },
  { id: 'verba-con', reason: 'Sem verba no exercício', stage: 'Contrato', count: 2 },
  { id: 'verba-imp', reason: 'Sem verba no exercício', stage: 'Implantação', count: 0 },
  { id: 'fit-tri', reason: 'Sem fit de perfil', stage: 'Triagem', count: 22 },
  { id: 'fit-dia', reason: 'Sem fit de perfil', stage: 'Diagnóstico', count: 6 },
  { id: 'fit-pro', reason: 'Sem fit de perfil', stage: 'Proposta', count: 0 },
  { id: 'fit-neg', reason: 'Sem fit de perfil', stage: 'Negociação', count: 0 },
  { id: 'fit-con', reason: 'Sem fit de perfil', stage: 'Contrato', count: 0 },
  { id: 'fit-imp', reason: 'Sem fit de perfil', stage: 'Implantação', count: 0 },
  { id: 'concorrente-tri', reason: 'Optou por concorrente', stage: 'Triagem', count: 0 },
  { id: 'concorrente-dia', reason: 'Optou por concorrente', stage: 'Diagnóstico', count: 2 },
  { id: 'concorrente-pro', reason: 'Optou por concorrente', stage: 'Proposta', count: 9 },
  { id: 'concorrente-neg', reason: 'Optou por concorrente', stage: 'Negociação', count: 14 },
  { id: 'concorrente-con', reason: 'Optou por concorrente', stage: 'Contrato', count: 4 },
  { id: 'concorrente-imp', reason: 'Optou por concorrente', stage: 'Implantação', count: 0 },
  { id: 'decisor-tri', reason: 'Sem decisor identificado', stage: 'Triagem', count: 11 },
  { id: 'decisor-dia', reason: 'Sem decisor identificado', stage: 'Diagnóstico', count: 14 },
  { id: 'decisor-pro', reason: 'Sem decisor identificado', stage: 'Proposta', count: 4 },
  { id: 'decisor-neg', reason: 'Sem decisor identificado', stage: 'Negociação', count: 1 },
  { id: 'decisor-con', reason: 'Sem decisor identificado', stage: 'Contrato', count: 0 },
  { id: 'decisor-imp', reason: 'Sem decisor identificado', stage: 'Implantação', count: 0 },
  { id: 'interesse-tri', reason: 'Sem interesse declarado', stage: 'Triagem', count: 16 },
  { id: 'interesse-dia', reason: 'Sem interesse declarado', stage: 'Diagnóstico', count: 12 },
  { id: 'interesse-pro', reason: 'Sem interesse declarado', stage: 'Proposta', count: 5 },
  { id: 'interesse-neg', reason: 'Sem interesse declarado', stage: 'Negociação', count: 1 },
  { id: 'interesse-con', reason: 'Sem interesse declarado', stage: 'Contrato', count: 0 },
  { id: 'interesse-imp', reason: 'Sem interesse declarado', stage: 'Implantação', count: 0 },
  { id: 'contato-tri', reason: 'Não atendeu o contato', stage: 'Triagem', count: 24 },
  { id: 'contato-dia', reason: 'Não atendeu o contato', stage: 'Diagnóstico', count: 9 },
  { id: 'contato-pro', reason: 'Não atendeu o contato', stage: 'Proposta', count: 2 },
  { id: 'contato-neg', reason: 'Não atendeu o contato', stage: 'Negociação', count: 0 },
  { id: 'contato-con', reason: 'Não atendeu o contato', stage: 'Contrato', count: 0 },
  { id: 'contato-imp', reason: 'Não atendeu o contato', stage: 'Implantação', count: 0 },
  { id: 'adiado-tri', reason: 'Projeto adiado', stage: 'Triagem', count: 2 },
  { id: 'adiado-dia', reason: 'Projeto adiado', stage: 'Diagnóstico', count: 6 },
  { id: 'adiado-pro', reason: 'Projeto adiado', stage: 'Proposta', count: 12 },
  { id: 'adiado-neg', reason: 'Projeto adiado', stage: 'Negociação', count: 10 },
  { id: 'adiado-con', reason: 'Projeto adiado', stage: 'Contrato', count: 5 },
  { id: 'adiado-imp', reason: 'Projeto adiado', stage: 'Implantação', count: 1 },
  { id: 'preco-tri', reason: 'Preço acima do orçamento', stage: 'Triagem', count: 0 },
  { id: 'preco-dia', reason: 'Preço acima do orçamento', stage: 'Diagnóstico', count: 3 },
  { id: 'preco-pro', reason: 'Preço acima do orçamento', stage: 'Proposta', count: 18 },
  { id: 'preco-neg', reason: 'Preço acima do orçamento', stage: 'Negociação', count: 14 },
  { id: 'preco-con', reason: 'Preço acima do orçamento', stage: 'Contrato', count: 2 },
  { id: 'preco-imp', reason: 'Preço acima do orçamento', stage: 'Implantação', count: 0 },
];

/** As etapas na ordem do funil; é ela que ordena as colunas, nunca a ordem alfabética. */
export const stages: readonly string[] = ['Triagem', 'Diagnóstico', 'Proposta', 'Negociação', 'Contrato', 'Implantação'];
