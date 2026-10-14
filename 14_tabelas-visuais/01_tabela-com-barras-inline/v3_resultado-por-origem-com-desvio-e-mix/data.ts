/**
 * Resultado por origem de lead em 2026-08: saldo (receita atribuída menos custo de mídia, em
 * reais) e o mix de status dos leads daquela origem (contagem, não percentual: o componente
 * calcula o percentual e o volume a partir daqui). Dado fictício e fixo; nomes de origem são
 * genéricos, nunca marca real de plataforma.
 */
export interface OriginMix {
  readonly novo: number;
  readonly emCadencia: number;
  readonly agendado: number;
  readonly descartado: number;
}

export interface OriginResult {
  readonly id: string;
  readonly name: string;
  /** Receita atribuída menos custo de mídia da origem, em reais. Pode ser negativo. */
  readonly balance: number;
  readonly mix: OriginMix;
}

/** Ordem fixa das categorias na barra 100% e na legenda, igual em todas as linhas. */
export const mixOrder: readonly { readonly key: keyof OriginMix; readonly label: string }[] = [
  { key: 'novo', label: 'Novo' },
  { key: 'emCadencia', label: 'Em cadência' },
  { key: 'agendado', label: 'Agendado' },
  { key: 'descartado', label: 'Descartado' },
];

export const data: readonly OriginResult[] = [
  { id: 'origem-01', name: 'Indicação', balance: 89_000, mix: { novo: 40, emCadencia: 30, agendado: 70, descartado: 40 } },
  { id: 'origem-02', name: 'Formulário do site', balance: 58_000, mix: { novo: 210, emCadencia: 180, agendado: 120, descartado: 102 } },
  { id: 'origem-03', name: 'Busca orgânica', balance: 21_000, mix: { novo: 90, emCadencia: 80, agendado: 90, descartado: 80 } },
  { id: 'origem-04', name: 'Webinar', balance: 9_400, mix: { novo: 20, emCadencia: 16, agendado: 40, descartado: 20 } },
  { id: 'origem-05', name: 'Parceria B2B', balance: 4_100, mix: { novo: 10, emCadencia: 8, agendado: 26, descartado: 10 } },
  { id: 'origem-06', name: 'E-mail marketing', balance: -3_200, mix: { novo: 60, emCadencia: 58, agendado: 70, descartado: 40 } },
  { id: 'origem-07', name: 'Outbound por telefone', balance: -18_700, mix: { novo: 70, emCadencia: 90, agendado: 120, descartado: 122 } },
  { id: 'origem-08', name: 'Busca paga', balance: -26_400, mix: { novo: 150, emCadencia: 140, agendado: 160, descartado: 138 } },
  { id: 'origem-09', name: 'Rede social paga', balance: -38_900, mix: { novo: 120, emCadencia: 118, agendado: 150, descartado: 136 } },
  { id: 'origem-10', name: 'Evento presencial', balance: -41_500, mix: { novo: 5, emCadencia: 9, agendado: 34, descartado: 16 } },
];
