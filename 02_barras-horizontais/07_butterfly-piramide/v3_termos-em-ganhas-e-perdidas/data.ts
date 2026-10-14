/**
 * Termos citados nas anotações das oportunidades encerradas no 3º trimestre de 2026: quantas
 * anotações de oportunidades ganhas e quantas de perdidas citam cada termo, em contagem. Uma
 * anotação conta uma vez por termo, e o tamanho de cada grupo é o denominador dos percentuais.
 * Dado fictício e fixo: nenhuma pessoa, empresa ou anotação é real.
 */
export interface TermMentions {
  readonly id: string;
  readonly term: string;
  /** Anotações de oportunidades ganhas que citam o termo. */
  readonly won: number;
  /** Anotações de oportunidades perdidas que citam o termo. */
  readonly lost: number;
}

export interface GroupSizes {
  readonly won: number;
  readonly lost: number;
}

/** Anotações lidas em cada grupo. */
export const groups: GroupSizes = { won: 46, lost: 138 };

export const data: readonly TermMentions[] = [
  { id: 'termo-retorno', term: 'retorno', won: 11, lost: 35 },
  { id: 'termo-indicacao', term: 'indicação de cliente', won: 17, lost: 9 },
  { id: 'termo-taxa', term: 'taxa de administração', won: 7, lost: 33 },
  { id: 'termo-sucessao', term: 'sucessão familiar', won: 14, lost: 12 },
  { id: 'termo-concorrente', term: 'concorrente', won: 0, lost: 36 },
  { id: 'termo-governanca', term: 'governança', won: 12, lost: 15 },
  { id: 'termo-banco-atual', term: 'banco atual', won: 4, lost: 41 },
  { id: 'termo-consolidacao', term: 'consolidação de carteira', won: 9, lost: 0 },
  { id: 'termo-liquidez', term: 'liquidez', won: 6, lost: 16 },
  { id: 'termo-reuniao', term: 'reunião presencial', won: 15, lost: 28 },
  { id: 'termo-prazo', term: 'prazo de resgate', won: 2, lost: 21 },
  { id: 'termo-planejamento', term: 'planejamento tributário', won: 10, lost: 19 },
  { id: 'termo-sem-retorno', term: 'sem retorno do contato', won: 1, lost: 27 },
  { id: 'termo-burocracia', term: 'burocracia', won: 3, lost: 17 },
];
