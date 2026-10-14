/**
 * Leads por origem e por mês, de mar/25 a ago/26 (18 meses), em 10 origens de Marketing.
 * `null` é mês em que a coleta falhou: nunca vira zero. Zero medido (evento sem edição no mês)
 * aparece como 0. Uma origem nova tem só 6 meses medidos e fica sem traço (série curta).
 * Dado fictício e fixo.
 */
export interface OriginSeries {
  readonly id: string;
  readonly name: string;
  /** Leads por mês, do mais antigo ao mais recente, ou `null` quando a coleta falhou. */
  readonly leads: readonly (number | null)[];
}

export interface LeadsByOrigin {
  /** Primeiro mês de todas as séries, YYYY-MM. */
  readonly startMonth: string;
  readonly origins: readonly OriginSeries[];
}

export const data: LeadsByOrigin = {
  startMonth: '2025-03',
  origins: [
    {
      id: 'busca-paga',
      name: 'Busca paga',
      leads: [410, 432, 448, 440, 465, 480, 472, 495, 510, 502, 520, 535, 528, 540, 552, 548, 560, 556],
    },
    {
      id: 'busca-organica',
      name: 'Busca orgânica',
      leads: [300, 312, 318, 330, 341, 356, null, null, 392, 405, 418, 430, 441, 452, 460, 468, 475, 483],
    },
    {
      id: 'portais',
      name: 'Portais de anúncio',
      leads: [250, 262, 270, 255, 280, 292, 301, 288, 310, 322, 330, 318, 340, 352, 347, 361, 370, 378],
    },
    {
      id: 'redes-sociais',
      name: 'Redes sociais',
      leads: [180, 190, 205, 198, 212, 220, 231, 226, 240, 238, null, null, null, 252, 247, 258, 262, 255],
    },
    {
      id: 'indicacao',
      name: 'Indicação de clientes',
      leads: [120, 126, 131, 128, 140, 144, 139, 150, 158, 154, 163, 170, null, 176, 181, 188, 192, 199],
    },
    {
      id: 'email',
      name: 'E-mail marketing',
      leads: [140, 132, 128, 120, 118, 112, 109, 104, 101, 98, 96, 94, 92, 91, 90, 88, 89, 87],
    },
    {
      id: 'parcerias',
      name: 'Parcerias comerciais',
      leads: [60, 66, 63, 70, 74, 78, 81, 86, 84, 90, 95, 99, 97, 104, 108, 112, 109, 115],
    },
    {
      id: 'eventos',
      name: 'Eventos presenciais',
      leads: [0, 0, 240, 0, 0, 0, 185, 0, 0, 0, 0, 220, 0, 0, 0, 0, 260, 0],
    },
    {
      id: 'webinarios',
      name: 'Webinários',
      leads: [0, 35, 0, 48, 0, 52, 0, 0, 61, 0, 70, 0, 66, 0, 74, 0, 83, 0],
    },
    {
      id: 'chat-do-site',
      name: 'Chat do site',
      leads: [null, null, null, null, null, null, null, null, null, null, null, null, 34, 41, 47, 52, 58, 63],
    },
  ],
};
