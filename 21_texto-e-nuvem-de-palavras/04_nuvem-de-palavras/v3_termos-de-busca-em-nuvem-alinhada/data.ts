/**
 * Termos de busca paga de 2026-08, com os leads que cada um trouxe, quantos deles passaram na
 * qualificação e o investimento do mês no termo, em reais.
 * O custo por lead qualificado não vem pronto: é `spend ÷ qualified`, e não existe quando o termo
 * não qualificou ninguém. O recorte exercita os casos difíceis: termo de três palavras, dois
 * termos com exatamente metade dos leads qualificados (metade não é maioria), dois termos sem
 * nenhum qualificado e um termo com um lead só, qualificado.
 * Dado fictício e fixo: nenhum termo, campanha, pessoa ou empresa é real.
 */
export interface SearchTerm {
  readonly id: string;
  /** O termo como foi comprado, em minúsculas e com acento. */
  readonly label: string;
  /** Leads que o termo trouxe no mês. */
  readonly leads: number;
  /** Leads do termo que passaram na qualificação. */
  readonly qualified: number;
  /** Investimento do mês no termo, em reais. */
  readonly spend: number;
}

/** Mês do recorte. */
export const period = '2026-08';

/** Termo que chega selecionado: o filtro ativo do painel. */
export const selectedId = 'planejamento-sucessorio';

export const data: readonly SearchTerm[] = [
  { id: 'holding-familiar', label: 'holding familiar', leads: 84, qualified: 52, spend: 11_040 },
  { id: 'planejamento-sucessorio', label: 'planejamento sucessório', leads: 71, qualified: 44, spend: 9_860 },
  { id: 'previdencia-privada', label: 'previdência privada', leads: 66, qualified: 21, spend: 6_930 },
  { id: 'consorcio-imobiliario', label: 'consórcio imobiliário', leads: 58, qualified: 17, spend: 5_510 },
  { id: 'gestao-de-patrimonio', label: 'gestão de patrimônio', leads: 49, qualified: 33, spend: 8_250 },
  { id: 'seguro-de-vida', label: 'seguro de vida', leads: 44, qualified: 12, spend: 4_180 },
  { id: 'investir-no-exterior', label: 'investir no exterior', leads: 38, qualified: 17, spend: 5_720 },
  { id: 'renda-fixa', label: 'renda fixa', leads: 35, qualified: 9, spend: 2_940 },
  { id: 'consultoria-de-investimentos', label: 'consultoria de investimentos', leads: 31, qualified: 14, spend: 5_130 },
  { id: 'fundo-imobiliario', label: 'fundo imobiliário', leads: 27, qualified: 8, spend: 2_480 },
  { id: 'carteira-administrada', label: 'carteira administrada', leads: 22, qualified: 14, spend: 3_920 },
  { id: 'inventario-extrajudicial', label: 'inventário extrajudicial', leads: 19, qualified: 9, spend: 2_310 },
  { id: 'doacao-em-vida', label: 'doação em vida', leads: 16, qualified: 8, spend: 1_840 },
  { id: 'aposentadoria', label: 'aposentadoria', leads: 14, qualified: 3, spend: 1_260 },
  { id: 'sucessao-empresarial', label: 'sucessão empresarial', leads: 12, qualified: 9, spend: 2_700 },
  { id: 'venda-de-empresa', label: 'venda de empresa', leads: 9, qualified: 7, spend: 2_450 },
  { id: 'testamento', label: 'testamento', leads: 8, qualified: 3, spend: 720 },
  { id: 'protecao-cambial', label: 'proteção cambial', leads: 7, qualified: 3, spend: 1_180 },
  { id: 'fundo-exclusivo', label: 'fundo exclusivo', leads: 6, qualified: 5, spend: 1_900 },
  { id: 'blindagem-patrimonial', label: 'blindagem patrimonial', leads: 5, qualified: 1, spend: 640 },
  { id: 'ganho-de-capital', label: 'ganho de capital', leads: 4, qualified: 2, spend: 560 },
  { id: 'renda-passiva', label: 'renda passiva', leads: 3, qualified: 0, spend: 310 },
  { id: 'independencia-financeira', label: 'independência financeira', leads: 2, qualified: 0, spend: 180 },
  { id: 'usufruto', label: 'usufruto', leads: 1, qualified: 1, spend: 95 },
];
