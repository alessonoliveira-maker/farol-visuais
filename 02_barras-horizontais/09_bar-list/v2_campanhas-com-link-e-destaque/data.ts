/**
 * Leads gerados no mês por campanha, contagem de leads. Dado fictício e fixo, nenhuma
 * campanha, pessoa ou empresa real. `id` também é a âncora usada pelo link de cada linha.
 */
export interface Campaign {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
}

export const data: readonly Campaign[] = [
  { id: 'c1', name: 'Prospecção fria em Santa Catarina', leads: 132 },
  { id: 'c2', name: 'Reativação de carteira antiga', leads: 118 },
  { id: 'c3', name: 'Webinar de planejamento patrimonial para famílias empresárias', leads: 104 },
  { id: 'c4', name: 'Conteúdo institucional no blog', leads: 91 },
  { id: 'c5', name: 'Indicação premiada de clientes', leads: 77 },
  { id: 'c6', name: 'Evento fechado em São Paulo', leads: 64 },
  { id: 'c7', name: 'Reforço de marca na região Sul', leads: 52 },
  { id: 'c8', name: 'Base fria enriquecida por dados públicos', leads: 40 },
];

/** Campanha em foco no painel: escolha externa, não uma marca dentro da linha. */
export const highlightId = 'c3';
