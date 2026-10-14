/**
 * Oportunidades comerciais encerradas em 2026, contadas por faixa de porte da conta: ganhas e
 * perdidas. Contagem de oportunidades. Dado fictício e fixo: nenhum número vem de base real.
 * As faixas vêm na ordem natural do porte, do menor para o maior, e o componente não reordena.
 * Muito grande tem o nome de duas palavras e é a coluna mais estreita, que é o caso da quebra
 * de rótulo no eixo.
 */
export interface PorteBand {
  readonly id: string;
  readonly label: string;
  /** Oportunidades ganhas: a parte da base, com linha de base comum entre colunas. */
  readonly won: number;
  /** Oportunidades perdidas: a parte de cima, o complemento. */
  readonly lost: number;
}

export const data: readonly PorteBand[] = [
  { id: 'micro', label: 'Micro', won: 14, lost: 58 },
  { id: 'pequena', label: 'Pequena', won: 44, lost: 104 },
  { id: 'media', label: 'Média', won: 49, lost: 77 },
  { id: 'grande', label: 'Grande', won: 41, lost: 51 },
  { id: 'muito-grande', label: 'Muito grande', won: 30, lost: 34 },
];
