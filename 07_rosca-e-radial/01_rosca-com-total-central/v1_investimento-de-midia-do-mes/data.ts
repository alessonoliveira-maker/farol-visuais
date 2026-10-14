/**
 * Investimento de mídia paga por canal em 2026-08, em reais.
 * Dado fictício e fixo: nenhuma plataforma real é citada, só o tipo de canal.
 * `colorIndex` é o slot fixo em `--chart-1`..`--chart-8` (COR-3): a cor pertence ao canal, não à
 * posição que ele ocupa depois de ordenado por valor.
 */
export interface MediaChannelSpend {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly colorIndex: number;
}

export const data: readonly MediaChannelSpend[] = [
  { id: 'busca-paga', label: 'Busca paga', value: 96_400, colorIndex: 0 },
  { id: 'redes-sociais', label: 'Redes sociais', value: 68_100, colorIndex: 2 },
  { id: 'video-em-display', label: 'Vídeo em display', value: 21_900, colorIndex: 5 },
];
