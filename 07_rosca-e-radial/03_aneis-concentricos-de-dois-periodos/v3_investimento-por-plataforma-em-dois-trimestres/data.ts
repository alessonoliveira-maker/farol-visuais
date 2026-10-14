/**
 * Investimento em mídia paga por plataforma em dois trimestres fechados, em reais. Dado fictício
 * e fixo. O componente ordena pelo trimestre atual e aplica a mesma ordem aos dois anéis: Vídeo
 * troca de posição com Display entre os dois trimestres, prova de que a ordem não pode vir do
 * trimestre anterior.
 */
export interface PlatformRing {
  readonly id: string;
  readonly name: string;
  /** Posição fixa na paleta categórica, atribuída na ordem 1, 3, 6, 5 (CONTRATO, COR-8). */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly previous: number;
  readonly current: number;
}

export const data: readonly PlatformRing[] = [
  { id: 'busca-paga', name: 'Busca paga', slot: 1, previous: 198_000, current: 205_000 },
  { id: 'redes-sociais', name: 'Redes sociais', slot: 3, previous: 154_000, current: 176_000 },
  { id: 'video', name: 'Vídeo', slot: 6, previous: 68_000, current: 98_000 },
  { id: 'display', name: 'Display', slot: 5, previous: 92_000, current: 69_000 },
];

/**
 * Rótulo já formatado do trimestre: não existe um `YYYY-MM` para trimestre no `@/lib/format`,
 * então o texto de tela vem pronto daqui, como o `totalCaption` do molde de waffle.
 */
export const previousQuarterLabel = '1º trimestre de 2026';
export const currentQuarterLabel = '2º trimestre de 2026';
