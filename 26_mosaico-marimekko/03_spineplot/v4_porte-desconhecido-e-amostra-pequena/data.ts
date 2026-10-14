/**
 * Oportunidades comerciais encerradas em 2026, contadas por faixa de porte da conta e pelo
 * desfecho. Contagem de oportunidades. Dado fictício e fixo: nenhum número vem de base real.
 * Três casos difíceis de propósito: 30% das oportunidades não têm porte informado e entram como
 * uma coluna própria, `unknown: true`, fora da ordem natural; Muito grande tem só 4 casos
 * (amostra pequena); e Grande tem 11 casos e nenhum ganho, que é zero medido e não ausência.
 * As faixas conhecidas vêm na ordem natural do porte, e o componente não reordena.
 */
export interface SizeBand {
  readonly id: string;
  readonly label: string;
  /** Oportunidades ganhas: a parte da base, com linha de base comum entre colunas. */
  readonly won: number;
  /** Oportunidades perdidas: a parte de cima, o complemento. */
  readonly lost: number;
  /** `true` na coluna de porte desconhecido: fica à direita, hachurada, fora da taxa global. */
  readonly unknown?: boolean;
}

export const data: readonly SizeBand[] = [
  { id: 'micro', label: 'Micro', won: 18, lost: 78 },
  { id: 'pequena', label: 'Pequena', won: 42, lost: 108 },
  { id: 'media', label: 'Média', won: 36, lost: 68 },
  { id: 'grande', label: 'Grande', won: 0, lost: 11 },
  { id: 'muito-grande', label: 'Muito grande', won: 1, lost: 3 },
  { id: 'desconhecido', label: 'Porte desconhecido', won: 41, lost: 115, unknown: true },
];
