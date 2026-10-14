/**
 * Movimentos entre etapas do funil no trimestre, em contagem de movimentos (a mesma oportunidade
 * que se move duas vezes conta duas vezes). Dado fictício e fixo.
 *
 * Esta versão existe para o retrocesso, então o recorte é só o caminho ENTRE etapas: ganha e
 * perdida ficam fora, e por isso o total de cada linha é o total de movimentos daquela linha, que é
 * a base de todo percentual escrito na célula.
 *
 * O dado foi montado para exercitar o caso difícil da leitura por percentual: a linha Contrato tem
 * base pequena ao lado das outras, então uma contagem baixa de retrocesso ali vira percentual alto,
 * e é por isso que o percentual da linha aparece escrito junto do total da linha, nunca sozinho.
 */
export interface StageDefinition {
  readonly id: string;
  readonly label: string;
}

/** Etapas do funil, na ordem. A mesma lista vale como linha e como coluna. */
export const STAGES: readonly StageDefinition[] = [
  { id: 'descoberta', label: 'Descoberta' },
  { id: 'qualificacao', label: 'Qualificação' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'proposta', label: 'Proposta' },
  { id: 'negociacao', label: 'Negociação' },
  { id: 'contrato', label: 'Contrato' },
];

export interface TransitionRow {
  readonly from: string;
  /** Movimentos para cada etapa de STAGES, na mesma ordem. A posição da própria etapa é permanência. */
  readonly to: readonly number[];
}

export const data: readonly TransitionRow[] = [
  { from: 'descoberta', to: [143, 182, 12, 0, 0, 0] },
  { from: 'qualificacao', to: [9, 88, 124, 6, 0, 0] },
  { from: 'diagnostico', to: [3, 18, 63, 97, 4, 0] },
  { from: 'proposta', to: [21, 9, 14, 44, 57, 3] },
  { from: 'negociacao', to: [0, 1, 4, 12, 31, 44] },
  { from: 'contrato', to: [0, 0, 1, 3, 9, 96] },
];

/** Último dia do trimestre medido, para o recorte aparecer desenhado e não só na frase acessível. */
export const periodEnd = '2026-09-14';
