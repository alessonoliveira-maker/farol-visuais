/**
 * Leads gerados no mês por origem declarada, contagem de leads. Dado fictício e fixo,
 * nenhuma pessoa ou empresa real. O mês vem em `YYYY-MM`.
 */
export interface LeadOrigin {
  readonly id: string;
  readonly name: string;
  readonly count: number;
}

export interface LeadOriginBoard {
  readonly month: string;
  readonly origins: readonly LeadOrigin[];
}

export const data: LeadOriginBoard = {
  month: '2026-08',
  origins: [
    { id: 'indicacao', name: 'Indicação de cliente', count: 184 },
    { id: 'formulario', name: 'Formulário do site', count: 149 },
    { id: 'evento', name: 'Evento presencial', count: 97 },
    { id: 'parceria', name: 'Parceria comercial', count: 61 },
    { id: 'paga', name: 'Campanha paga', count: 38 },
  ],
};
