/**
 * Campanhas do trimestre por leads gerados no eixo X, taxa de qualificação em fração de 0 a 1 no
 * eixo Y e investimento em reais, que vira a área de cada bolha.
 *
 * O investimento tem TRÊS estados, e eles não se confundem: um número maior que zero é verba gasta;
 * `0` é zero MEDIDO, a campanha existiu e não consumiu verba (conteúdo próprio, busca orgânica,
 * indicação); `null` é ausência de registro, e ausência nunca vira zero. O eixo X é contagem de
 * leads, e não CPL, justamente para a campanha de verba zero continuar tendo posição no plano.
 * Dado fictício e fixo: nenhum nome é campanha, marca ou empresa real.
 */
export interface Campaign {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  readonly taxaQualificacao: number;
  /** Verba consumida em reais; `0` é zero medido e `null` é investimento não registrado. */
  readonly investimento: number | null;
}

export const data: readonly Campaign[] = [
  { id: 'camp-01', name: 'Busca institucional', leads: 1_850, taxaQualificacao: 0.11, investimento: 96_000 },
  { id: 'camp-02', name: 'Busca cauda longa', leads: 640, taxaQualificacao: 0.14, investimento: 12_000 },
  { id: 'camp-03', name: 'Display frio', leads: 2_400, taxaQualificacao: 0.05, investimento: 58_000 },
  { id: 'camp-04', name: 'Vídeo topo de funil', leads: 1_620, taxaQualificacao: 0.07, investimento: 41_000 },
  { id: 'camp-05', name: 'Público semelhante amplo', leads: 980, taxaQualificacao: 0.16, investimento: 34_000 },
  { id: 'camp-06', name: 'Retargeting de 30 dias', leads: 420, taxaQualificacao: 0.29, investimento: 18_000 },
  { id: 'camp-07', name: 'Carrinho abandonado', leads: 260, taxaQualificacao: 0.33, investimento: 9_000 },
  { id: 'camp-08', name: 'Criador de nicho', leads: 180, taxaQualificacao: 0.27, investimento: 4_500 },
  { id: 'camp-09', name: 'Boletim setorial', leads: 150, taxaQualificacao: 0.31, investimento: 900 },
  { id: 'camp-10', name: 'Portal de notícias', leads: 520, taxaQualificacao: 0.22, investimento: 26_000 },
  { id: 'camp-11', name: 'Webinar ao vivo', leads: 210, taxaQualificacao: 0.44, investimento: 31_000 },
  { id: 'camp-12', name: 'Evento presencial', leads: 90, taxaQualificacao: 0.52, investimento: 210_000 },
  { id: 'camp-13', name: 'Régua de nutrição', leads: 340, taxaQualificacao: 0.36, investimento: 2_400 },
  { id: 'camp-14', name: 'Conteúdo do blog', leads: 780, taxaQualificacao: 0.19, investimento: 0 },
  { id: 'camp-15', name: 'Busca orgânica da marca', leads: 1_240, taxaQualificacao: 0.24, investimento: 0 },
  { id: 'camp-16', name: 'Indicação de cliente', leads: 70, taxaQualificacao: 0.40, investimento: 0 },
  { id: 'camp-17', name: 'Parceria sem verba apurada', leads: 130, taxaQualificacao: 0.21, investimento: null },
  { id: 'camp-18', name: 'Mala direta antiga', leads: 200, taxaQualificacao: 0.09, investimento: null },
];
