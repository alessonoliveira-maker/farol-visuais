/**
 * Custo mensal da área comercial em três camadas, em reais, por mês de 2025.
 * Dado fictício e fixo: nenhum valor corresponde a custo real.
 *
 * Julho estoura de propósito o teto de escala do visual (R$ 80,0 mil), com uma campanha de meio de
 * ano em mídia: é o caso difícil que esta versão existe para desenhar, porque teto de escala que
 * nunca é alcançado deixa o corte sem prova visual e o defeito só aparece no dado real de quem cola
 * o componente. O mês escolhido fica na parte de baixo do relógio de propósito: no topo, o rótulo
 * do valor cortado nasceria ao lado do rótulo do anel de escala e os dois números leriam como par.
 */
export interface MonthlyCostLayers {
  readonly month: string;
  readonly midia: number;
  readonly equipe: number;
  readonly estrutura: number;
}

export const data: readonly MonthlyCostLayers[] = [
  { month: '2025-01', midia: 11_000, equipe: 29_500, estrutura: 8_200 },
  { month: '2025-02', midia: 9_800, equipe: 29_500, estrutura: 8_200 },
  { month: '2025-03', midia: 15_200, equipe: 30_100, estrutura: 8_300 },
  { month: '2025-04', midia: 18_700, equipe: 30_100, estrutura: 8_300 },
  { month: '2025-05', midia: 16_300, equipe: 30_800, estrutura: 8_400 },
  { month: '2025-06', midia: 21_500, equipe: 30_800, estrutura: 8_400 },
  { month: '2025-07', midia: 52_800, equipe: 31_500, estrutura: 8_500 },
  { month: '2025-08', midia: 24_100, equipe: 31_500, estrutura: 8_500 },
  { month: '2025-09', midia: 29_900, equipe: 32_200, estrutura: 8_600 },
  { month: '2025-10', midia: 36_700, equipe: 32_200, estrutura: 8_600 },
  { month: '2025-11', midia: 20_200, equipe: 32_900, estrutura: 8_700 },
  { month: '2025-12', midia: 6_800, equipe: 32_900, estrutura: 8_700 },
];
