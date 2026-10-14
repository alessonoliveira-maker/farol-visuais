/**
 * Leads gerados por criativo, agrupados por campanha de marketing em 2026-08.
 * Dado fictício e fixo: nenhuma campanha, criativo ou pessoa é real.
 */
export interface CreativeLeaf {
  readonly id: string;
  readonly label: string;
  readonly leads: number;
}

export interface CampaignGroup {
  readonly id: string;
  readonly label: string;
  /**
   * Posição fixa da categoria na paleta (1 a 6, que viram `--chart-1` a `--chart-6`).
   * A cor pertence à campanha e não à posição no ranking (CONTRATO, COR-3, COR-8):
   * o dicionário distribui na ordem 1, 3, 6, 5, 2, 4.
   */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly children: readonly CreativeLeaf[];
}

export const data: readonly CampaignGroup[] = [
  {
    id: 'fidc-concessionarias',
    label: 'Prospecção FIDC Concessionárias',
    slot: 1,
    children: [
      { id: 'depoimento-cliente', label: 'Depoimento de cliente', leads: 42 },
      { id: 'comparativo-taxas', label: 'Comparativo de taxas', leads: 31 },
      { id: 'convite-webinar', label: 'Convite para webinar', leads: 19 },
      { id: 'bastidores-operacao', label: 'Bastidores da operação', leads: 8 },
    ],
  },
  {
    id: 'consultoria-herdeiros',
    label: 'Consultoria Patrimonial para Herdeiros',
    slot: 3,
    children: [
      { id: 'video-institucional', label: 'Vídeo institucional', leads: 27 },
      { id: 'historia-familia', label: 'História da família Andrade', leads: 22 },
      { id: 'diagnostico-gratuito', label: 'Diagnóstico gratuito', leads: 15 },
      { id: 'orcamento-simplificado', label: 'Orçamento simplificado', leads: 6 },
      { id: 'erros-comuns', label: 'Erros comuns em heranças', leads: 3 },
    ],
  },
  {
    id: 'retargeting-site',
    label: 'Retargeting do Site MFO',
    slot: 6,
    children: [
      { id: 'prova-social', label: 'Prova social', leads: 24 },
      { id: 'o-que-e-mfo', label: 'O que é um MFO', leads: 14 },
      { id: 'cases-de-sucesso', label: 'Cases de sucesso', leads: 9 },
    ],
  },
  {
    id: 'institucional-marca',
    label: 'Institucional da Marca',
    slot: 5,
    children: [
      { id: 'manifesto-marca', label: 'Manifesto da marca', leads: 7 },
      { id: 'aniversario-empresa', label: 'Aniversário da empresa', leads: 2 },
    ],
  },
];
