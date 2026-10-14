/**
 * Perdas comerciais de oportunidades no trimestre, por motivo e submotivo, em ocorrências. Dado
 * fictício e fixo: nenhum nome é pessoa nem empresa real.
 *
 * O dado existe para exercitar o caso difícil do modelo, e por isso ele é desconfortável de
 * propósito. Todo submotivo tem nome longo, de 45 a 76 caracteres, que é a faixa em que o rótulo
 * deixa de caber numa linha e a decisão passa a depender de medir a tinta. Há um submotivo curto
 * demais em valor para caber rótulo nenhum (4 perdas) e um submotivo de valor zero, que não tem
 * faixa a ocupar numa partição e por isso sai do desenho, com o motivo da ausência escrito no
 * próprio dado (`excludedReason`), nunca inventado pelo componente.
 */
export interface LossSubmotive {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  /** Por que o submotivo não entra na partição. Só existe em valor zero, e é texto de tela. */
  readonly excludedReason?: string;
}

export interface LossMotive {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  /** Slot fixo de cor (COR-3, COR-8): pertence ao motivo, não à posição no ranking. */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly children: readonly LossSubmotive[];
}

export const data: readonly LossMotive[] = [
  {
    id: 'preco',
    label: 'Preço e condição comercial',
    value: 62,
    slot: 1,
    children: [
      {
        id: 'taxa-acima',
        label: 'Taxa de administração acima do concorrente direto',
        value: 24,
      },
      {
        id: 'desconto-retroativo',
        label: 'Pediu desconto retroativo na taxa de custódia',
        value: 21,
      },
      {
        id: 'corretora-digital',
        label: 'Comparou com corretora digital sem assessoria',
        value: 17,
      },
    ],
  },
  {
    id: 'governanca',
    label: 'Governança e documentação',
    value: 37,
    slot: 3,
    children: [
      {
        id: 'documentacao-incompleta',
        label: 'Documentação societária incompleta para a diligência',
        value: 18,
      },
      {
        id: 'procuracao-exterior',
        label: 'Sócio residente no exterior sem procuração registrada em cartório',
        value: 15,
      },
      {
        id: 'suitability-recusado',
        label: 'Recusou assinar o termo de suitability atualizado',
        value: 4,
      },
    ],
  },
  {
    id: 'sem-decisor',
    label: 'Sem decisor identificado',
    value: 28,
    slot: 6,
    children: [
      {
        id: 'sem-alcada',
        label: 'Interlocutor sem alçada para aprovar o mandato',
        value: 16,
      },
      {
        id: 'familia-sem-consenso',
        label: 'Família sem consenso sobre quem centraliza a decisão',
        value: 12,
      },
      {
        id: 'contato-saiu',
        label: 'Contato indicado saiu da empresa antes da reunião',
        value: 0,
        excludedReason: 'registrado no período e encerrado sem desfecho',
      },
    ],
  },
];

/** Substantivo da contagem, escrito ao lado de todo número (NUM-6). */
export const unitLabel = 'perdas';

/** Recorte de período, escrito no desenho e na frase acessível, nunca só na frase (DAD-9). */
export const periodLabel = '2026-T3';
