/**
 * Estado de 6 campos em 4 fontes de lead fictícias, apurado em 2026-09: 'presente' quando a
 * fonte coleta o campo e ele chega preenchido, 'vazio' quando a fonte coleta mas o campo vem em
 * branco, 'fora' quando o campo não faz parte da coleta da fonte (preenchimento desconhecido).
 * A ordem de `states` é a de `fields`. Dado fictício e fixo: nenhuma empresa ou pessoa real.
 */
export type FieldState = 'presente' | 'vazio' | 'fora';

export interface LeadField {
  readonly id: string;
  readonly name: string;
}

export interface SourceCoverage {
  readonly id: string;
  readonly source: string;
  readonly states: readonly FieldState[];
}

export const fields: readonly LeadField[] = [
  { id: 'telefone', name: 'Telefone' },
  { id: 'cargo', name: 'Cargo' },
  { id: 'empresa', name: 'Empresa' },
  { id: 'utm', name: 'UTM' },
  { id: 'cidade', name: 'Cidade' },
  { id: 'consentimento', name: 'Consentimento' },
];

export const data: readonly SourceCoverage[] = [
  { id: 'formulario-site', source: 'Formulário do site', states: ['presente', 'presente', 'presente', 'presente', 'presente', 'presente'] },
  { id: 'anuncio-pago', source: 'Anúncio pago', states: ['presente', 'vazio', 'presente', 'presente', 'presente', 'presente'] },
  { id: 'chat', source: 'Chat do site', states: ['fora', 'vazio', 'vazio', 'presente', 'presente', 'presente'] },
  { id: 'evento-presencial', source: 'Evento presencial', states: ['vazio', 'presente', 'presente', 'vazio', 'presente', 'vazio'] },
];
