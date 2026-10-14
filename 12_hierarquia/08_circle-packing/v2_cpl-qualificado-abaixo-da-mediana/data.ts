/**
 * Campanhas de mídia paga de 2026-08, agrupadas por canal: leads qualificados (contagem) e custo
 * por lead qualificado (reais por lead). Dado fictício e fixo: nenhum canal, campanha ou pessoa é
 * real. Os nomes de campanha são curtos de propósito, porque o rótulo direto só cabe dentro do
 * círculo quando a caixa de tinta do nome mais o CPL couber no raio.
 */
export interface CampaignLeaf {
  readonly id: string;
  readonly label: string;
  /** Leads qualificados no mês; é o valor que a área do círculo codifica. */
  readonly qualifiedLeads: number;
  /** Custo por lead qualificado, em reais. Decide a cor: abaixo ou acima da mediana. */
  readonly costPerLead: number;
}

export interface ChannelGroup {
  readonly id: string;
  readonly label: string;
  /**
   * Posição fixa da categoria na paleta (1 a 6, que viram `--chart-1` a `--chart-6`). A cor
   * pertence ao canal e não à posição no ranking (CONTRATO, COR-3), e a distribuição segue a
   * ordem 1, 3, 6, 5, 2, 4 da COR-8. Como esta versão pinta variação semântica no corpo
   * (`--positive`), os slots 2 e 4 estão fora em qualquer hipótese.
   */
  readonly slot: 1 | 3 | 5 | 6;
  readonly children: readonly CampaignLeaf[];
}

export const data: readonly ChannelGroup[] = [
  {
    id: 'busca-paga',
    label: 'Busca paga',
    slot: 1,
    children: [
      { id: 'marca', label: 'Marca', qualifiedLeads: 142, costPerLead: 212 },
      { id: 'genericas', label: 'Genéricas', qualifiedLeads: 96, costPerLead: 348 },
      { id: 'rivais', label: 'Rivais', qualifiedLeads: 24, costPerLead: 690 },
    ],
  },
  {
    id: 'rede-social',
    label: 'Rede social',
    slot: 3,
    children: [
      { id: 'semelhantes', label: 'Semelhantes', qualifiedLeads: 118, costPerLead: 265 },
      { id: 'retorno', label: 'Retorno', qualifiedLeads: 74, costPerLead: 198 },
      { id: 'interesses', label: 'Interesses', qualifiedLeads: 41, costPerLead: 520 },
      { id: 'formulario', label: 'Formulário', qualifiedLeads: 12, costPerLead: 845 },
    ],
  },
  {
    id: 'display',
    label: 'Display',
    slot: 6,
    children: [
      { id: 'video-curto', label: 'Vídeo curto', qualifiedLeads: 63, costPerLead: 430 },
      { id: 'nativo', label: 'Nativo', qualifiedLeads: 18, costPerLead: 760 },
      { id: 'patrocinado', label: 'Patrocinado', qualifiedLeads: 9, costPerLead: 980 },
    ],
  },
];
