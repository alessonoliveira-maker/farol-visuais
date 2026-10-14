/**
 * Comparação de 5 plataformas fictícias de automação de marketing contra 8 critérios, apurada
 * em 2026-08. `status` por critério e plataforma, na mesma ordem de `platforms`: 'cumpre',
 * 'parcial', 'nao_cumpre', 'nao_se_aplica' (o critério não existe para aquele tipo de
 * plataforma) ou 'sem_dado' (não foi possível confirmar). Dado fictício e fixo: nenhuma
 * plataforma real é citada, os nomes são genéricos.
 */
export type MatrixStatus = 'cumpre' | 'parcial' | 'nao_cumpre' | 'nao_se_aplica' | 'sem_dado';

export interface Platform {
  readonly id: string;
  readonly name: string;
}

export interface ComparisonRow {
  readonly id: string;
  readonly criterion: string;
  readonly statuses: readonly MatrixStatus[];
}

export const platforms: readonly Platform[] = [
  { id: 'vela', name: 'Painel Vela' },
  { id: 'ancora', name: 'Painel Âncora' },
  { id: 'bussola', name: 'Painel Bússola' },
  { id: 'deriva', name: 'Painel Deriva' },
  { id: 'constelacao', name: 'Painel Constelação' },
];

export const data: readonly ComparisonRow[] = [
  { id: 'segmentacao', criterion: 'Segmentação por comportamento', statuses: ['cumpre', 'cumpre', 'parcial', 'nao_cumpre', 'cumpre'] },
  { id: 'mensageria', criterion: 'Envio por canal de mensageria oficial', statuses: ['cumpre', 'nao_cumpre', 'nao_cumpre', 'cumpre', 'parcial'] },
  { id: 'pontuacao', criterion: 'Pontuação de lead nativa', statuses: ['parcial', 'cumpre', 'cumpre', 'parcial', 'nao_cumpre'] },
  { id: 'integracao', criterion: 'Integração com CRM via API', statuses: ['cumpre', 'cumpre', 'cumpre', 'cumpre', 'cumpre'] },
  { id: 'atribuicao', criterion: 'Atribuição multitoque', statuses: ['nao_cumpre', 'nao_se_aplica', 'cumpre', 'nao_cumpre', 'sem_dado'] },
  { id: 'suporte-pt', criterion: 'Suporte em português', statuses: ['cumpre', 'cumpre', 'nao_se_aplica', 'cumpre', 'cumpre'] },
  { id: 'preco-contato', criterion: 'Preço por contato ativo', statuses: ['parcial', 'sem_dado', 'cumpre', 'nao_cumpre', 'cumpre'] },
  { id: 'sla', criterion: 'SLA de suporte 24x7', statuses: ['nao_se_aplica', 'nao_se_aplica', 'nao_se_aplica', 'cumpre', 'sem_dado'] },
];
