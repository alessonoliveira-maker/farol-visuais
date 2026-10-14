/**
 * Preenchimento de 6 campos em 7 origens de lead fictícias, como fração de 0 a 1 dos leads da
 * origem com o campo preenchido. `leads` é o volume que sustenta cada taxa da linha. `critical`
 * marca o campo obrigatório na coleta. Dado fictício e fixo: nenhuma empresa ou pessoa real.
 */
export interface LeadField {
  readonly id: string;
  readonly name: string;
  readonly critical: boolean;
}

export interface OriginFill {
  readonly id: string;
  readonly origin: string;
  readonly leads: number;
  readonly rates: readonly number[];
}

/** Piso de preenchimento para julgar a origem: premissa do marketing, não medida. */
export const threshold = 0.8;

export const fields: readonly LeadField[] = [
  { id: 'telefone', name: 'Telefone', critical: true },
  { id: 'cargo', name: 'Cargo', critical: false },
  { id: 'empresa', name: 'Empresa', critical: false },
  { id: 'utm', name: 'UTM', critical: false },
  { id: 'cidade', name: 'Cidade', critical: false },
  { id: 'consentimento', name: 'Consentimento', critical: false },
];

export const data: readonly OriginFill[] = [
  { id: 'formulario-site', origin: 'Formulário do site', leads: 4210, rates: [0.96, 0.62, 0.91, 0.88, 0.93, 0.99] },
  { id: 'anuncio-pago', origin: 'Anúncio pago', leads: 3180, rates: [0.41, 0.22, 0.55, 0.99, 0.81, 0.97] },
  { id: 'webinar', origin: 'Webinar', leads: 1460, rates: [0.38, 0.84, 0.93, 0.9, 0.58, 0.95] },
  { id: 'indicacao-parceiros', origin: 'Indicação de parceiros comerciais', leads: 640, rates: [0.88, 0.79, 0.96, 0.12, 0.85, 0.6] },
  { id: 'evento-presencial', origin: 'Evento presencial', leads: 520, rates: [0.92, 0.87, 0.94, 0, 0.9, 0.5] },
  { id: 'lista-comprada', origin: 'Lista adquirida', leads: 2350, rates: [0.84, 0.45, 0.8, 0, 0.77, 0.05] },
  { id: 'chat', origin: 'Chat do site', leads: 980, rates: [0.29, 0.08, 0.33, 0.92, 0.97, 0.96] },
];
