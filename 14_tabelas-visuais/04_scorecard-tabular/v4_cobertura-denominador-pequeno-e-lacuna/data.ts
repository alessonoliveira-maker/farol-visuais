/**
 * Sete origens de lead em 2026-08: volume, quantos leads têm telefone e cargo preenchidos, e
 * quantos viraram agenda. Cidade não entra aqui: nenhuma origem tem esse campo coletado, e é por
 * isso que a coluna inteira é lacuna (declarada uma vez no Chart, não célula a célula).
 * "Evento regional" e "Webinar piloto" têm poucos leads de propósito, para exercitar o limiar de
 * denominador pequeno; "Rede profissional" e "Formulário do site" têm cobertura de telefone
 * abaixo de 50%, para exercitar o aviso de baixa cobertura.
 * Dado fictício e fixo: nenhuma pessoa, empresa ou plataforma real.
 */
export interface CoverageRow {
  readonly id: string;
  readonly origin: string;
  readonly volume: number;
  readonly phoneCovered: number;
  readonly roleCovered: number;
  readonly agendas: number;
  /** Leads do mês anterior; null quando a origem ainda não existia (sem base de comparação). */
  readonly previousVolume: number | null;
}

export const periodLabel = '2026-08';
export const previousPeriodLabel = '2026-07';

export const data: readonly CoverageRow[] = [
  { id: 'midia-social', origin: 'Mídia social', volume: 412, phoneCovered: 302, roleCovered: 210, agendas: 58, previousVolume: 368 },
  { id: 'busca-paga', origin: 'Busca paga', volume: 268, phoneCovered: 168, roleCovered: 100, agendas: 30, previousVolume: 281 },
  { id: 'indicacao', origin: 'Indicação', volume: 96, phoneCovered: 89, roleCovered: 74, agendas: 41, previousVolume: 84 },
  { id: 'rede-profissional', origin: 'Rede profissional', volume: 88, phoneCovered: 40, roleCovered: 61, agendas: 19, previousVolume: 88 },
  { id: 'formulario-site', origin: 'Formulário do site', volume: 63, phoneCovered: 20, roleCovered: 15, agendas: 9, previousVolume: 71 },
  { id: 'evento-regional', origin: 'Evento regional', volume: 4, phoneCovered: 3, roleCovered: 2, agendas: 1, previousVolume: 6 },
  { id: 'webinar-piloto', origin: 'Webinar piloto', volume: 2, phoneCovered: 2, roleCovered: 0, agendas: 0, previousVolume: null },
];
