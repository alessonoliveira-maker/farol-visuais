/**
 * Checklist de handoff de 18 oportunidades fictícias da pré-vendas para o Comercial em 2026-09,
 * contra os 7 critérios que a régua de passagem exige. `checks` é `true` (cumprido) ou `false`
 * (pendente) na mesma ordem de `criteria`. Dado fictício e fixo: nenhuma empresa ou pessoa real
 * é citada; os nomes de empresa são genéricos.
 */
export interface HandoffCriterion {
  readonly id: string;
  readonly shortLabel: string;
  readonly name: string;
}

export interface OpportunityHandoff {
  readonly id: string;
  readonly company: string;
  readonly checks: readonly boolean[];
}

export const criteria: readonly HandoffCriterion[] = [
  { id: 'qualificacao', shortLabel: 'Qualificação', name: 'Qualificação registrada no CRM' },
  { id: 'telefone', shortLabel: 'Telefone', name: 'Telefone do decisor confirmado' },
  { id: 'email', shortLabel: 'E-mail', name: 'E-mail corporativo confirmado' },
  { id: 'dor', shortLabel: 'Dor mapeada', name: 'Dor de negócio mapeada na anotação' },
  { id: 'orcamento', shortLabel: 'Orçamento', name: 'Orçamento estimado registrado' },
  { id: 'decisor', shortLabel: 'Decisor', name: 'Decisor identificado pelo nome' },
  { id: 'proximo-passo', shortLabel: 'Próximo passo', name: 'Próximo passo agendado com data' },
];

export const data: readonly OpportunityHandoff[] = [
  { id: 'vale-alto', company: 'Construtora Vale Alto', checks: [true, true, true, true, false, true, true] },
  { id: 'serra-azul', company: 'Grupo Serra Azul', checks: [true, true, true, false, false, true, true] },
  { id: 'distribuidora-norte', company: 'Distribuidora Norte', checks: [true, false, true, true, false, true, false] },
  { id: 'rio-bonito', company: 'Metalúrgica Rio Bonito', checks: [false, true, true, true, false, false, true] },
  { id: 'campo-largo', company: 'Agropecuária Campo Largo', checks: [true, true, false, false, false, true, true] },
  { id: 'estrada-nova', company: 'Transportes Estrada Nova', checks: [true, true, true, true, true, true, true] },
  { id: 'pedra-branca', company: 'Indústria Pedra Branca', checks: [false, false, true, false, false, true, false] },
  { id: 'porto-seguro', company: 'Comércio Porto Seguro', checks: [true, true, true, true, false, true, false] },
  { id: 'monte-verde', company: 'Engenharia Monte Verde', checks: [true, false, false, true, false, false, true] },
  { id: 'fazenda-doce', company: 'Laticínios Fazenda Doce', checks: [true, true, true, false, false, true, true] },
  { id: 'linha-clara', company: 'Têxtil Linha Clara', checks: [false, true, false, false, false, false, false] },
  { id: 'folha-viva', company: 'Papelaria Folha Viva', checks: [true, true, true, true, false, true, true] },
  { id: 'cruz-do-sul', company: 'Farmacêutica Cruz do Sul', checks: [true, false, true, true, false, true, false] },
  { id: 'sabor-da-terra', company: 'Alimentos Sabor da Terra', checks: [true, true, false, true, false, true, true] },
  { id: 'caminho-certo', company: 'Logística Caminho Certo', checks: [false, false, false, false, false, false, false] },
  { id: 'ponto-firme', company: 'Consultoria Ponto Firme', checks: [true, true, true, true, true, true, false] },
  { id: 'chao-novo', company: 'Imobiliária Chão Novo', checks: [true, true, true, false, false, true, true] },
  { id: 'rede-aberta', company: 'Tecnologia Rede Aberta', checks: [true, true, true, true, false, true, true] },
];
