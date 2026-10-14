/**
 * Campanhas de marketing do trimestre: leads gerados, em contagem, e investimento, em reais.
 * O custo por lead não é guardado aqui: sai de investimento sobre leads, e por isso a campanha
 * com zero lead não tem custo por lead (são 3, e elas ficam fora do plano). Das 48 com lead,
 * 9 custaram perto de R$ 20 mil, 5 perto de R$ 5 mil e 4 perto de R$ 50 mil, com volumes de
 * lead muito diferentes dentro de cada grupo.
 * Dado fictício e fixo: nenhuma campanha, canal ou veículo corresponde a um real.
 */
export interface CampaignQuarter {
  readonly id: string;
  readonly name: string;
  /** Leads gerados no trimestre; zero quer dizer que o custo por lead não existe. */
  readonly leads: number;
  /** Investimento do trimestre, em reais. */
  readonly investimentoReais: number;
}

export const data: readonly CampaignQuarter[] = [
  { id: 'camp-01', name: 'Feira regional de inverno', leads: 200, investimentoReais: 20_000 },
  { id: 'camp-02', name: 'Webinar com especialista', leads: 240, investimentoReais: 19_200 },
  { id: 'camp-03', name: 'Patrocínio de boletim setorial', leads: 280, investimentoReais: 21_280 },
  { id: 'camp-04', name: 'Vídeo curto, depoimentos', leads: 340, investimentoReais: 18_700 },
  { id: 'camp-05', name: 'Busca paga, concorrentes', leads: 420, investimentoReais: 20_160 },
  { id: 'camp-06', name: 'Rede social, público semelhante', leads: 500, investimentoReais: 19_000 },
  { id: 'camp-07', name: 'E-mail, base inativa', leads: 600, investimentoReais: 21_600 },
  { id: 'camp-08', name: 'Remarketing de visitantes', leads: 700, investimentoReais: 18_620 },
  { id: 'camp-09', name: 'Busca paga, institucional', leads: 940, investimentoReais: 20_680 },
  { id: 'camp-10', name: 'Mala direta para associações', leads: 45, investimentoReais: 4_950 },
  { id: 'camp-11', name: 'Evento local de parceiros', leads: 90, investimentoReais: 5_220 },
  { id: 'camp-12', name: 'Conteúdo patrocinado, guia', leads: 210, investimentoReais: 4_830 },
  { id: 'camp-13', name: 'Indicação premiada', leads: 480, investimentoReais: 5_280 },
  { id: 'camp-14', name: 'E-mail, boletim mensal', leads: 900, investimentoReais: 4_680 },
  { id: 'camp-15', name: 'Feira nacional do setor', leads: 440, investimentoReais: 50_160 },
  { id: 'camp-16', name: 'Mídia programática, varejo', leads: 610, investimentoReais: 47_580 },
  { id: 'camp-17', name: 'Vídeo longo, série de casos', leads: 780, investimentoReais: 53_040 },
  { id: 'camp-18', name: 'Busca paga, categorias', leads: 960, investimentoReais: 49_920 },
  { id: 'camp-19', name: 'Webinar de planejamento', leads: 120, investimentoReais: 9_600 },
  { id: 'camp-20', name: 'Rede social, vídeo de bastidor', leads: 150, investimentoReais: 6_900 },
  { id: 'camp-21', name: 'Parceiros, cartilha conjunta', leads: 260, investimentoReais: 8_320 },
  { id: 'camp-22', name: 'E-mail, lançamento', leads: 340, investimentoReais: 7_140 },
  { id: 'camp-23', name: 'Busca paga, cauda longa', leads: 520, investimentoReais: 8_840 },
  { id: 'camp-24', name: 'Remarketing de carrinho', leads: 640, investimentoReais: 7_680 },
  { id: 'camp-25', name: 'Rede social, enquete', leads: 700, investimentoReais: 9_100 },
  { id: 'camp-26', name: 'Conteúdo patrocinado, estudo', leads: 200, investimentoReais: 14_000 },
  { id: 'camp-27', name: 'Evento local de usuários', leads: 280, investimentoReais: 12_320 },
  { id: 'camp-28', name: 'Vídeo curto, dicas rápidas', leads: 430, investimentoReais: 13_760 },
  { id: 'camp-29', name: 'Indicação de clientes', leads: 580, investimentoReais: 12_180 },
  { id: 'camp-30', name: 'Busca paga, regional', leads: 600, investimentoReais: 14_400 },
  { id: 'camp-31', name: 'Rede social, carrossel', leads: 660, investimentoReais: 15_180 },
  { id: 'camp-32', name: 'Mala direta, renovação', leads: 95, investimentoReais: 8_550 },
  { id: 'camp-33', name: 'Parceiros, seminário', leads: 130, investimentoReais: 11_050 },
  { id: 'camp-34', name: 'E-mail, pesquisa de satisfação', leads: 60, investimentoReais: 2_400 },
  { id: 'camp-35', name: 'Rede social, publicação impulsionada', leads: 140, investimentoReais: 2_380 },
  { id: 'camp-36', name: 'Indicação de parceiros', leads: 230, investimentoReais: 3_220 },
  { id: 'camp-37', name: 'Conteúdo patrocinado, artigo', leads: 320, investimentoReais: 3_840 },
  { id: 'camp-38', name: 'Remarketing de leitores', leads: 410, investimentoReais: 3_280 },
  { id: 'camp-39', name: 'E-mail, dica semanal', leads: 620, investimentoReais: 3_720 },
  { id: 'camp-40', name: 'Busca paga, marca própria', leads: 30, investimentoReais: 1_800 },
  { id: 'camp-41', name: 'Feira regional de verão', leads: 250, investimentoReais: 23_750 },
  { id: 'camp-42', name: 'Webinar em série', leads: 330, investimentoReais: 29_700 },
  { id: 'camp-43', name: 'Mídia programática, indústria', leads: 420, investimentoReais: 31_500 },
  { id: 'camp-44', name: 'Vídeo longo, demonstração', leads: 540, investimentoReais: 33_480 },
  { id: 'camp-45', name: 'Patrocínio de programa setorial', leads: 650, investimentoReais: 35_750 },
  { id: 'camp-46', name: 'Busca paga, soluções', leads: 800, investimentoReais: 28_000 },
  { id: 'camp-47', name: 'Rede social, alcance amplo', leads: 900, investimentoReais: 63_000 },
  { id: 'camp-48', name: 'Evento próprio anual', leads: 380, investimentoReais: 36_100 },
  { id: 'camp-49', name: 'Mala direta, teste de lista', leads: 0, investimentoReais: 1_250 },
  { id: 'camp-50', name: 'Parceiros, piloto regional', leads: 0, investimentoReais: 2_900 },
  { id: 'camp-51', name: 'Vídeo curto, teste de formato', leads: 0, investimentoReais: 800 },
];

/** Investimento da curva que recebe a faixa de tolerância, em reais. */
export const bandInvestment = 20_000;

/** Tolerância da faixa em fração do investimento da curva: quem cai nela custou o mesmo. */
export const bandTolerance = 0.1;
