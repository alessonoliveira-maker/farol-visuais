/**
 * Campos de contato entregues por 8 origens de lead fictícias: `present` é verdadeiro quando a
 * origem entrega o campo preenchido na maioria dos leads dela. A ordem de `present` é a de
 * `fields`. Dado fictício e fixo: nenhuma empresa, marca ou pessoa real.
 */
export interface LeadField {
  readonly id: string;
  readonly name: string;
}

export interface OriginCoverage {
  readonly id: string;
  readonly origin: string;
  readonly present: readonly boolean[];
}

export const fields: readonly LeadField[] = [
  { id: 'telefone', name: 'Telefone' },
  { id: 'cargo', name: 'Cargo' },
  { id: 'empresa', name: 'Empresa' },
  { id: 'utm', name: 'UTM' },
  { id: 'cidade', name: 'Cidade' },
  { id: 'consentimento', name: 'Consentimento' },
];

export const data: readonly OriginCoverage[] = [
  { id: 'formulario-site', origin: 'Formulário do site', present: [true, true, true, true, true, true] },
  { id: 'anuncio-pago', origin: 'Anúncio pago', present: [true, false, true, true, true, true] },
  { id: 'webinar', origin: 'Webinar', present: [false, true, true, true, false, true] },
  { id: 'indicacao-parceiros', origin: 'Indicação de parceiros comerciais', present: [true, true, true, false, true, false] },
  { id: 'evento-presencial', origin: 'Evento presencial', present: [true, true, true, false, true, false] },
  { id: 'lista-comprada', origin: 'Lista adquirida', present: [false, false, true, false, true, false] },
  { id: 'chat', origin: 'Chat do site', present: [false, false, false, true, true, true] },
  { id: 'rede-social', origin: 'Mensagem em rede social', present: [false, false, false, false, false, false] },
];
