/**
 * Custo por lead (CPL) de agosto por origem, em reais: o bruto (todo lead), o qualificado (só o
 * lead aceito pelo comercial) e a meta de CPL qualificado da origem. Dado fictício e fixo. Casos
 * difíceis: bruto igual ao qualificado (Indicação de clientes), qualificado exatamente na meta
 * (Parcerias comerciais), qualificado abaixo da meta (Portais de anúncio) e distâncias empatadas.
 */
export interface LeadCostRow {
  readonly id: string;
  readonly origin: string;
  readonly raw: number;
  readonly qualified: number;
  readonly target: number;
}

export const data: readonly LeadCostRow[] = [
  { id: 'orig-01', origin: 'Busca paga', raw: 28.4, qualified: 61.0, target: 55.0 },
  { id: 'orig-02', origin: 'Redes sociais pagas', raw: 19.8, qualified: 52.3, target: 45.0 },
  { id: 'orig-03', origin: 'Portais de anúncio', raw: 34.1, qualified: 47.9, target: 50.0 },
  { id: 'orig-04', origin: 'Eventos presenciais', raw: 71.5, qualified: 78.2, target: 70.0 },
  { id: 'orig-05', origin: 'Webinários', raw: 22.6, qualified: 36.4, target: 40.0 },
  { id: 'orig-06', origin: 'E-mail marketing', raw: 9.2, qualified: 17.5, target: 20.0 },
  { id: 'orig-07', origin: 'Indicação de clientes', raw: 14.0, qualified: 14.0, target: 18.0 },
  { id: 'orig-08', origin: 'Parcerias comerciais', raw: 25.3, qualified: 38.9, target: 38.9 },
  { id: 'orig-09', origin: 'Conteúdo orgânico', raw: 6.4, qualified: 11.2, target: 15.0 },
  { id: 'orig-10', origin: 'Representantes comerciais', raw: 41.0, qualified: 66.7, target: 60.0 },
  { id: 'orig-11', origin: 'Lista fria enriquecida', raw: 12.8, qualified: 49.6, target: 35.0 },
  { id: 'orig-12', origin: 'Mídia exterior', raw: 38.0, qualified: 58.4, target: 62.0 },
];
