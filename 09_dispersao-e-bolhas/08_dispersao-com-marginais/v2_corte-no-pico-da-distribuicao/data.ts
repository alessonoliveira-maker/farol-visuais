/**
 * Campanhas de mídia paga do semestre: custo por lead em reais e qualificação medida pelo par
 * leads e leads qualificados, que é o que permite escrever a taxa com o volume ao lado.
 * O corte de CPL e o corte de qualificação do quadrante vêm junto porque são política comercial,
 * não medida: quem cola no Farol troca os dois sem tocar no componente.
 * Dado fictício e fixo: nenhuma campanha e nenhum canal corresponde a veiculação real.
 */
export interface CampaignCost {
  readonly id: string;
  readonly rotulo: string;
  readonly cpl: number;
  readonly leads: number;
  readonly qualificados: number;
}

export const data: readonly CampaignCost[] = [
  { id: 'camp-01', rotulo: 'E-mail B', cpl: 68.52, leads: 410, qualificados: 106 },
  { id: 'camp-02', rotulo: 'E-mail H', cpl: 188.97, leads: 960, qualificados: 320 },
  { id: 'camp-03', rotulo: 'Display E', cpl: 79.76, leads: 960, qualificados: 150 },
  { id: 'camp-04', rotulo: 'E-mail D', cpl: 90.65, leads: 410, qualificados: 70 },
  { id: 'camp-05', rotulo: 'Busca F', cpl: 110.18, leads: 320, qualificados: 34 },
  { id: 'camp-06', rotulo: 'Parceria E', cpl: 104.72, leads: 640, qualificados: 73 },
  { id: 'camp-07', rotulo: 'Social C', cpl: 89.29, leads: 1680, qualificados: 405 },
  { id: 'camp-08', rotulo: 'Vídeo G', cpl: 140.53, leads: 480, qualificados: 149 },
  { id: 'camp-09', rotulo: 'Social E', cpl: 90.02, leads: 1280, qualificados: 101 },
  { id: 'camp-10', rotulo: 'Parceria B', cpl: 70.91, leads: 320, qualificados: 52 },
  { id: 'camp-11', rotulo: 'Display C', cpl: 57.81, leads: 560, qualificados: 117 },
  { id: 'camp-12', rotulo: 'E-mail F', cpl: 109.66, leads: 880, qualificados: 299 },
  { id: 'camp-13', rotulo: 'E-mail C', cpl: 94.01, leads: 2240, qualificados: 237 },
  { id: 'camp-14', rotulo: 'Busca B', cpl: 68.26, leads: 1120, qualificados: 233 },
  { id: 'camp-15', rotulo: 'Display H', cpl: 171.89, leads: 1120, qualificados: 274 },
  { id: 'camp-16', rotulo: 'Vídeo H', cpl: 169.23, leads: 960, qualificados: 360 },
  { id: 'camp-17', rotulo: 'Social G', cpl: 132.98, leads: 960, qualificados: 216 },
  { id: 'camp-18', rotulo: 'Vídeo D', cpl: 79.37, leads: 1280, qualificados: 302 },
  { id: 'camp-19', rotulo: 'Social B', cpl: 70.23, leads: 1680, qualificados: 309 },
  { id: 'camp-20', rotulo: 'Busca E', cpl: 87.92, leads: 410, qualificados: 49 },
  { id: 'camp-21', rotulo: 'Display B', cpl: 62.35, leads: 1680, qualificados: 192 },
  { id: 'camp-22', rotulo: 'Busca C', cpl: 55.86, leads: 880, qualificados: 194 },
  { id: 'camp-23', rotulo: 'Display A', cpl: 37.62, leads: 1680, qualificados: 304 },
  { id: 'camp-24', rotulo: 'Busca H', cpl: 145.66, leads: 880, qualificados: 290 },
  { id: 'camp-25', rotulo: 'Parceria A', cpl: 55.23, leads: 880, qualificados: 76 },
  { id: 'camp-26', rotulo: 'Parceria G', cpl: 143.34, leads: 1280, qualificados: 292 },
  { id: 'camp-27', rotulo: 'Display D', cpl: 91.14, leads: 410, qualificados: 153 },
  { id: 'camp-28', rotulo: 'E-mail A', cpl: 45.67, leads: 1120, qualificados: 328 },
  { id: 'camp-29', rotulo: 'Social F', cpl: 108.88, leads: 1680, qualificados: 400 },
  { id: 'camp-30', rotulo: 'Display G', cpl: 144.88, leads: 1680, qualificados: 221 },
  { id: 'camp-31', rotulo: 'E-mail G', cpl: 130.21, leads: 240, qualificados: 69 },
  { id: 'camp-32', rotulo: 'E-mail E', cpl: 114.20, leads: 1280, qualificados: 462 },
  { id: 'camp-33', rotulo: 'Parceria D', cpl: 84.88, leads: 480, qualificados: 60 },
  { id: 'camp-34', rotulo: 'Social A', cpl: 36.85, leads: 1920, qualificados: 357 },
  { id: 'camp-35', rotulo: 'Parceria C', cpl: 85.31, leads: 1120, qualificados: 213 },
  { id: 'camp-36', rotulo: 'Busca D', cpl: 94.44, leads: 240, qualificados: 51 },
  { id: 'camp-37', rotulo: 'Parceria H', cpl: 179.60, leads: 640, qualificados: 205 },
  { id: 'camp-38', rotulo: 'Busca A', cpl: 36.44, leads: 1680, qualificados: 9 },
  { id: 'camp-39', rotulo: 'Vídeo E', cpl: 80.55, leads: 480, qualificados: 90 },
  { id: 'camp-40', rotulo: 'Vídeo C', cpl: 92.34, leads: 960, qualificados: 295 },
  { id: 'camp-41', rotulo: 'Parceria F', cpl: 111.74, leads: 560, qualificados: 96 },
  { id: 'camp-42', rotulo: 'Vídeo F', cpl: 106.06, leads: 1120, qualificados: 291 },
  { id: 'camp-43', rotulo: 'Vídeo B', cpl: 68.70, leads: 410, qualificados: 73 },
  { id: 'camp-44', rotulo: 'Vídeo A', cpl: 35.06, leads: 1280, qualificados: 241 },
  { id: 'camp-45', rotulo: 'Busca G', cpl: 114.54, leads: 960, qualificados: 170 },
  { id: 'camp-46', rotulo: 'Display F', cpl: 106.67, leads: 320, qualificados: 29 },
  { id: 'camp-47', rotulo: 'Social D', cpl: 83.60, leads: 2240, qualificados: 547 },
  { id: 'camp-48', rotulo: 'Social H', cpl: 162.86, leads: 560, qualificados: 150 },
];

/** O corte de CPL do quadrante, em reais por lead. */
export const corteCpl = 90;
/** O corte de qualificação do quadrante, em fração. */
export const corteTaxa = 0.28;
