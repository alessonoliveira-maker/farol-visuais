/**
 * Executivo 03 em 2026-T3, em índice de 0 a 100 pelo percentil no time de 11 executivos
 * (100 é o melhor do time, 0 é o pior). `value` é null quando a dimensão não foi medida no
 * trimestre; `rank` é a posição no time, 1 a 11, e também é null sem medição. A ordem das
 * dimensões é a do registry. Dado fictício e fixo.
 */
export interface PercentileAxis {
  readonly id: string;
  readonly label: string;
  /** O nome como entra no meio de uma frase (sigla mantém a caixa). */
  readonly phrase: string;
  readonly value: number | null;
  readonly rank: number | null;
}

export const data: readonly PercentileAxis[] = [
  { id: 'discovery', label: 'Descoberta', phrase: 'descoberta', value: 70, rank: 4 },
  { id: 'proposal', label: 'Proposta', phrase: 'proposta', value: 50, rank: 6 },
  { id: 'negotiation', label: 'Negociação', phrase: 'negociação', value: 60, rank: 5 },
  { id: 'follow-up', label: 'Follow up', phrase: 'follow up', value: 0, rank: 11 },
  { id: 'crm', label: 'Registro no CRM em dia', phrase: 'registro no CRM em dia', value: 90, rank: 2 },
  { id: 'forecast', label: 'Precisão de forecast', phrase: 'precisão de forecast', value: null, rank: null },
  { id: 'coverage', label: 'Cobertura de contas', phrase: 'cobertura de contas', value: 30, rank: 8 },
];

/** Quem o perfil descreve, escrito como entra no meio de uma frase. */
export const subject = 'Executivo 03';

/** Tamanho do time sobre o qual o percentil é calculado, o executivo incluso. */
export const teamSize = 11;
