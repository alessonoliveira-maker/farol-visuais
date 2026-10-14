/**
 * Funil de 14 origens de lead em 2026-08, em CONTAGENS: leads recebidos, leads dentro do perfil
 * de cliente ideal, contatados, qualificados, agendas marcadas, agendas realizadas e negócios
 * ganhos. O dado nunca declara a taxa (DAD-1): as seis taxas dos eixos são derivadas no
 * componente, cada uma com o par de numerador e denominador escrito em `axes`, e por isso o
 * percentual desenhado não tem como divergir do volume que a dica escreve.
 *
 * Dado fictício e fixo: nenhuma origem é marca, plataforma ou empresa real.
 *
 * Casos difíceis que o dado exercita: nome longo (Mídia social patrocinada); zero medido (Lista
 * de terceiros, 0 de 4 agendas realizadas viraram negócio); valor pequeno com base pequena (a
 * mesma origem, 7 agendas em 73 qualificados); empate exato em dois eixos (Webinar próprio e
 * Portal setorial com 28,0% de taxa de agenda; Material para baixar e Prospecção ativa com 18,2%
 * de win rate); e uma origem fora do padrão do próprio grupo (Prospecção ativa, com a maior
 * aderência ao perfil do grupo grande e uma das menores taxas de contato).
 *
 * O empate em 28,0% de taxa de agenda é o que fixa a mediana das outras treze origens quando o
 * foco está em Indicação de cliente: 71,0% (142 de 200) contra mediana de 28,0%, a maior
 * distância entre os seis eixos (43,0 pontos percentuais; a segunda é a aderência, com 40,1).
 */
export interface OriginFunnel {
  readonly id: string;
  readonly label: string;
  readonly leads: number;
  readonly inProfile: number;
  readonly contacted: number;
  readonly qualified: number;
  readonly scheduled: number;
  readonly attended: number;
  readonly won: number;
}

export type CountKey = Exclude<keyof OriginFunnel, 'id' | 'label'>;

/** Um eixo é uma taxa: numerador sobre denominador, os dois contagens da mesma origem. */
export interface RateAxis {
  readonly id: string;
  readonly label: string;
  readonly numerator: CountKey;
  readonly denominator: CountKey;
}

/** Competência do recorte, em `YYYY-MM`. */
export const period = '2026-08';

/**
 * A ORDEM DOS EIXOS É DECISÃO DE DADO, e ela reduz cruzamentos. Contados par a par nas 14 linhas,
 * esta ordem soma 30 cruzamentos entre eixos vizinhos; a melhor das 720 ordens possíveis soma 28,
 * mas embaralha o funil (contato, comparecimento, win rate, qualificação, perfil, agenda); a ordem
 * ingênua, com o perfil na frente do funil, soma 37; e a pior soma 52. As métricas correlatas
 * ficam vizinhas: contato com qualificação (7 cruzamentos), perfil entre qualificação e agenda
 * (6 e 6), e comparecimento com win rate (2). Quem trocar a ordem refaz a conta.
 */
export const axes: readonly RateAxis[] = [
  { id: 'contact', label: 'Taxa de contato', numerator: 'contacted', denominator: 'leads' },
  { id: 'qualification', label: 'Taxa de qualificação', numerator: 'qualified', denominator: 'contacted' },
  { id: 'fit', label: 'Aderência ao perfil', numerator: 'inProfile', denominator: 'leads' },
  { id: 'schedule', label: 'Taxa de agenda', numerator: 'scheduled', denominator: 'qualified' },
  { id: 'attendance', label: 'Comparecimento', numerator: 'attended', denominator: 'scheduled' },
  { id: 'win', label: 'Win rate', numerator: 'won', denominator: 'attended' },
];

export const data: readonly OriginFunnel[] = [
  { id: 'customer-referral', label: 'Indicação de cliente', leads: 320, inProfile: 269, contacted: 294, qualified: 200, scheduled: 142, attended: 125, won: 58 },
  { id: 'partner-referral', label: 'Indicação de parceiro', leads: 260, inProfile: 203, contacted: 229, qualified: 142, scheduled: 82, attended: 69, won: 27 },
  { id: 'in-person-event', label: 'Evento presencial', leads: 410, inProfile: 295, contacted: 340, qualified: 194, scheduled: 101, attended: 81, won: 27 },
  { id: 'organic-search', label: 'Busca orgânica', leads: 1480, inProfile: 681, contacted: 947, qualified: 360, scheduled: 122, attended: 88, won: 21 },
  { id: 'paid-search', label: 'Busca paga', leads: 2140, inProfile: 877, contacted: 1305, qualified: 431, scheduled: 129, attended: 89, won: 19 },
  { id: 'own-webinar', label: 'Webinar próprio', leads: 760, inProfile: 395, contacted: 532, qualified: 250, scheduled: 70, attended: 46, won: 9 },
  { id: 'gated-content', label: 'Material para baixar', leads: 1320, inProfile: 502, contacted: 726, qualified: 211, scheduled: 51, attended: 33, won: 6 },
  { id: 'email', label: 'E-mail marketing', leads: 980, inProfile: 431, contacted: 568, qualified: 176, scheduled: 46, attended: 31, won: 6 },
  { id: 'professional-network', label: 'Rede profissional', leads: 890, inProfile: 490, contacted: 587, qualified: 211, scheduled: 65, attended: 46, won: 10 },
  { id: 'paid-social', label: 'Mídia social patrocinada', leads: 2860, inProfile: 772, contacted: 1373, qualified: 302, scheduled: 57, attended: 33, won: 4 },
  { id: 'organic-social', label: 'Mídia social orgânica', leads: 1150, inProfile: 357, contacted: 575, qualified: 144, scheduled: 30, attended: 18, won: 3 },
  { id: 'outbound', label: 'Prospecção ativa', leads: 640, inProfile: 384, contacted: 288, qualified: 98, scheduled: 35, attended: 22, won: 4 },
  { id: 'industry-portal', label: 'Portal setorial', leads: 540, inProfile: 189, contacted: 286, qualified: 75, scheduled: 21, attended: 13, won: 2 },
  { id: 'third-party-list', label: 'Lista de terceiros', leads: 1900, inProfile: 266, contacted: 608, qualified: 73, scheduled: 7, attended: 4, won: 0 },
];

/** A origem que nasce em foco. O clique numa linha ou num nome da coluna lateral troca o foco. */
export const highlightId = 'customer-referral';
