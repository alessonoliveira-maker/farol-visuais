/**
 * Leads de marketing do terceiro trimestre de 2026, contados por plataforma de veiculação e por
 * formato do criativo, com a parte que qualificou. Contagem de leads. Dado fictício e fixo:
 * nenhuma plataforma é marca real e nenhum número vem de base real.
 * Três casos difíceis de propósito: Carrossel em Busca paga não teve veiculação (`aired: false`,
 * que não é o mesmo que veicular e não gerar lead); Redes sociais tem três formatos de 2 a 3
 * leads, abaixo de 4 px de largura, que o componente agrega em Outros formatos; e Formulário
 * nativo, com nome de duas palavras, quebra o rótulo do eixo.
 */
export interface FormatCell {
  readonly id: string;
  readonly format: string;
  /** Leads que qualificaram: a parte da base, com linha de base comum entre colunas. */
  readonly qualified: number;
  /** Leads que não qualificaram: o complemento, desenhado acima. */
  readonly notQualified: number;
  /** `false` quando a combinação não teve veiculação no período: não é zero medido. */
  readonly aired: boolean;
}

export interface PlatformGroup {
  readonly id: string;
  readonly label: string;
  /** Formatos na ordem em que aparecem, da esquerda para a direita. */
  readonly formats: readonly FormatCell[];
}

export const data: readonly PlatformGroup[] = [
  {
    id: 'busca-paga',
    label: 'Busca paga',
    formats: [
      { id: 'texto', format: 'Texto', qualified: 70, notQualified: 110, aired: true },
      { id: 'imagem', format: 'Imagem', qualified: 31, notQualified: 79, aired: true },
      { id: 'carrossel', format: 'Carrossel', qualified: 0, notQualified: 0, aired: false },
    ],
  },
  {
    id: 'redes-sociais',
    label: 'Redes sociais',
    formats: [
      { id: 'imagem', format: 'Imagem', qualified: 33, notQualified: 117, aired: true },
      { id: 'video-curto', format: 'Vídeo curto', qualified: 76, notQualified: 134, aired: true },
      { id: 'formulario', format: 'Formulário nativo', qualified: 44, notQualified: 52, aired: true },
      { id: 'enquete', format: 'Enquete', qualified: 1, notQualified: 1, aired: true },
      { id: 'realidade-aumentada', format: 'Realidade aumentada', qualified: 0, notQualified: 3, aired: true },
      { id: 'sorteio', format: 'Sorteio', qualified: 1, notQualified: 2, aired: true },
    ],
  },
  {
    id: 'plataforma-de-video',
    label: 'Plataforma de vídeo',
    formats: [
      { id: 'video-curto', format: 'Vídeo curto', qualified: 38, notQualified: 102, aired: true },
      { id: 'video-longo', format: 'Vídeo longo', qualified: 21, notQualified: 69, aired: true },
    ],
  },
];
