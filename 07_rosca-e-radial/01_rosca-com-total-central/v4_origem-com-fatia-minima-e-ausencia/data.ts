/**
 * Leads do mês por origem declarada, em contagem de pessoas.
 * Dado fictício e fixo: nenhuma plataforma ou empresa real é citada.
 * `declared: false` marca a única linha de ausência (sem origem no formulário); ela nunca entra
 * no teto de fatias coloridas e não é somada a "Outros".
 * `colorIndex` é o slot fixo em `--chart-1`..`--chart-8` (COR-3): a cor pertence à origem, não à
 * posição que ela ocupa depois de ordenada por contagem ou de agrupada em "Outros". As três
 * últimas dividem slot porque nunca aparecem individuais neste recorte (sempre viram "Outros");
 * se um recorte futuro tirar uma delas do grupo, ela precisa ganhar um slot próprio aqui.
 */
export interface LeadOriginCount {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly declared: boolean;
  readonly colorIndex: number;
}

export const data: readonly LeadOriginCount[] = [
  { id: 'indicacao', label: 'Indicação', count: 200, declared: true, colorIndex: 0 },
  { id: 'evento', label: 'Evento', count: 120, declared: true, colorIndex: 2 },
  { id: 'site', label: 'Site institucional', count: 70, declared: true, colorIndex: 5 },
  { id: 'campanha-paga', label: 'Campanha paga', count: 32, declared: true, colorIndex: 4 },
  { id: 'parceria', label: 'Parceria comercial', count: 4, declared: true, colorIndex: 1 },
  { id: 'webinar', label: 'Webinar', count: 3, declared: true, colorIndex: 6 },
  { id: 'anuncio-impresso', label: 'Anúncio impresso', count: 2, declared: true, colorIndex: 6 },
  { id: 'panfletagem', label: 'Panfletagem', count: 1, declared: true, colorIndex: 6 },
  { id: 'sem-origem', label: 'Sem origem declarada', count: 54, declared: false, colorIndex: 0 },
];
