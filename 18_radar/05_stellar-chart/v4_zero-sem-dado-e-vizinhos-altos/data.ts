/**
 * Índice de oito indicadores do processo comercial no terceiro trimestre de 2026, numa escala de
 * 0 a 100 pontos. Dado fictício e fixo: nenhuma empresa ou pessoa real.
 * `value: 0` é índice medido que deu zero; `value: null` é indicador que ainda não foi medido.
 * Os dois casos estão no eixo vertical, um no topo e outro na base, e o zero medido fica entre os
 * dois índices mais altos do recorte, 97 e 95, que é onde um eixo vazio mais parece falha do
 * desenho. A ordem é a do registry de indicadores e corre no sentido horário a partir do topo.
 */
export interface IndicatorScore {
  readonly id: string;
  readonly name: string;
  /** Índice de 0 a 100, ou `null` quando o indicador ainda não foi medido. */
  readonly value: number | null;
}

export const data: readonly IndicatorScore[] = [
  { id: 'forecast', name: 'Precisão de forecast', value: 0 },
  { id: 'cobertura', name: 'Cobertura de carteira', value: 95 },
  { id: 'cadencia', name: 'Cadência de contato', value: 62 },
  { id: 'ciclo', name: 'Ciclo de venda', value: 71 },
  { id: 'roteiro', name: 'Uso do roteiro', value: null },
  { id: 'ticket', name: 'Ticket médio', value: 54 },
  { id: 'avanco', name: 'Taxa de avanço', value: 78 },
  { id: 'ganho', name: 'Taxa de ganho', value: 97 },
];

/** Período do recorte, já no texto de tela. */
export const periodLabel = '3º trimestre de 2026';
