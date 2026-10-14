/**
 * Leads que entraram por origem declarada, mês a mês, de outubro de 2025 a setembro de 2026. Dado
 * fictício e fixo: nenhuma origem é plataforma real e nenhum nome é pessoa real. A unidade é lead,
 * contagem inteira.
 *
 * O par origem x mês declara `null` quando a origem NÃO existia naquele mês, e `0` quando ela
 * existia e não trouxe nenhum lead. As duas coisas têm desenho diferente no componente, porque uma
 * origem que só nasceu em março não tem desempenho zero em janeiro: ela não tem medição nenhuma.
 *
 * O último mês é parcial: a coleta fecha em `PARTIAL_UNTIL` e por isso os valores de setembro de
 * 2026 são de meio mês, não de mês fechado.
 */
export interface Channel {
  readonly id: string;
  readonly label: string;
}

/** Os três canais, na ordem em que aparecem de cima para baixo. Nunca em ordem de volume. */
export const CHANNELS: readonly Channel[] = [
  { id: 'pago', label: 'Mídia paga' },
  { id: 'organico', label: 'Orgânico' },
  { id: 'indicacao', label: 'Indicação' },
];

/** Doze meses em `YYYY-MM`, do mais antigo ao mais recente. */
export const MONTHS: readonly string[] = [
  '2025-10',
  '2025-11',
  '2025-12',
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
  '2026-09',
];

/** O mês que ainda está aberto, e a data em que a coleta dele parou. */
export const PARTIAL_MONTH = '2026-09';
export const PARTIAL_UNTIL = '2026-09-14';

export interface OriginRow {
  readonly id: string;
  readonly label: string;
  /** O canal a que a origem pertence, ou `null` para a linha que fica fora dos grupos. */
  readonly channel: string | null;
  /** Uma posição por mês, na mesma ordem de MONTHS. `null` é origem que não existia no mês. */
  readonly monthly: readonly (number | null)[];
}

/**
 * Casos difíceis exercitados de propósito: os grupos são desiguais, com 7 origens em mídia paga e 2
 * em indicação; Anúncio de lista nasceu em janeiro de 2026 e Comparador pago em março, então os
 * meses anteriores são ausência e não zero; Patrocínio de boletim tem dois meses de zero medido, com
 * verba pausada; Evento próprio só existe nos dois meses de evento e é zero medido nos outros dez,
 * o que produz uma linha quase toda no poço; Sem origem declarada fica fora dos canais, porque ela
 * não é um canal e sim a falta de um.
 */
export const data: readonly OriginRow[] = [
  { id: 'busca-paga', label: 'Busca paga', channel: 'pago', monthly: [92, 88, 80, 93, 108, 118, 116, 132, 143, 146, 160, 71] },
  {
    id: 'rede-social-paga',
    label: 'Rede social paga',
    channel: 'pago',
    monthly: [58, 55, 52, 59, 70, 76, 73, 85, 94, 94, 104, 46],
  },
  {
    id: 'video-patrocinado',
    label: 'Vídeo patrocinado',
    channel: 'pago',
    monthly: [21, 19, 21, 22, 28, 29, 27, 34, 40, 37, 44, 18],
  },
  { id: 'display', label: 'Display', channel: 'pago', monthly: [17, 13, 15, 12, 16, 14, 10, 14, 16, 10, 13, 3] },
  {
    id: 'anuncio-de-lista',
    label: 'Anúncio de lista',
    channel: 'pago',
    monthly: [null, null, null, 15, 20, 21, 19, 26, 31, 28, 34, 14],
  },
  {
    id: 'patrocinio-de-boletim',
    label: 'Patrocínio de boletim',
    channel: 'pago',
    monthly: [7, 5, 0, 6, 10, 9, 6, 10, 14, 0, 13, 4],
  },
  {
    id: 'comparador-pago',
    label: 'Comparador pago',
    channel: 'pago',
    monthly: [null, null, null, null, null, 17, 15, 21, 26, 22, 28, 11],
  },
  {
    id: 'busca-organica',
    label: 'Busca orgânica',
    channel: 'organico',
    monthly: [71, 67, 62, 70, 82, 89, 85, 98, 107, 107, 117, 51],
  },
  { id: 'blog', label: 'Blog', channel: 'organico', monthly: [26, 23, 24, 24, 30, 31, 28, 34, 39, 35, 41, 16] },
  { id: 'boletim', label: 'Boletim', channel: 'organico', monthly: [13, 11, 14, 12, 17, 16, 13, 19, 23, 18, 24, 9] },
  { id: 'evento-proprio', label: 'Evento próprio', channel: 'organico', monthly: [0, 0, 0, 0, 41, 0, 0, 0, 0, 57, 0, 0] },
  {
    id: 'acesso-direto',
    label: 'Acesso direto',
    channel: 'organico',
    monthly: [31, 28, 28, 29, 36, 37, 34, 41, 46, 43, 49, 20],
  },
  {
    id: 'indicacao-de-cliente',
    label: 'Indicação de cliente',
    channel: 'indicacao',
    monthly: [9, 7, 11, 9, 13, 12, 9, 15, 19, 14, 19, 7],
  },
  {
    id: 'indicacao-de-parceiro',
    label: 'Indicação de parceiro',
    channel: 'indicacao',
    monthly: [4, 2, 7, 3, 7, 6, 3, 7, 11, 6, 10, 3],
  },
  {
    id: 'sem-origem-declarada',
    label: 'Sem origem declarada',
    channel: null,
    monthly: [21, 17, 18, 16, 20, 19, 14, 19, 21, 15, 19, 6],
  },
];
