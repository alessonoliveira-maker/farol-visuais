/**
 * Leads qualificados e custo por lead qualificado (CPL) por criativo no mês, em reais.
 * Dado fictício e fixo, nenhum criativo, pessoa ou empresa real. `paused` é o criativo
 * pausado no meio do mês: continua na lista, com valores menores e etiqueta própria.
 */
export interface Creative {
  readonly id: string;
  readonly name: string;
  readonly qualifiedLeads: number;
  readonly cpl: number;
  readonly paused?: boolean;
}

export const data: readonly Creative[] = [
  { id: 'cr1', name: 'Vídeo depoimento de cliente em SC', qualifiedLeads: 96, cpl: 158 },
  { id: 'cr2', name: 'Carrossel introdução ao FIDC', qualifiedLeads: 84, cpl: 172 },
  { id: 'cr3', name: 'Estático oferta de linha CRI', qualifiedLeads: 71, cpl: 190 },
  { id: 'cr4', name: 'Vídeo explicativo sobre MFO', qualifiedLeads: 65, cpl: 205 },
  { id: 'cr5', name: 'Carrossel planejamento sucessório', qualifiedLeads: 58, cpl: 221 },
  { id: 'cr6', name: 'Estático prova social de clientes', qualifiedLeads: 47, cpl: 244 },
  { id: 'cr7', name: 'Vídeo institucional da casa', qualifiedLeads: 39, cpl: 268 },
  { id: 'cr8', name: 'Carrossel oferta imobiliária para famílias com saída de patrimônio', qualifiedLeads: 33, cpl: 301 },
  { id: 'cr9', name: 'Estático convite para webinar', qualifiedLeads: 21, cpl: 355 },
  { id: 'cr10', name: 'Vídeo case de cliente na região Sul', qualifiedLeads: 14, cpl: 410, paused: true },
];
