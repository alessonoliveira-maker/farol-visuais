/**
 * Receita reconhecida do trimestre contra a meta, repartida por origem.
 * Dado fictício e fixo: nenhuma origem é conta real.
 */
export interface OrigemReceita {
  readonly id: string;
  readonly label: string;
  readonly valor: number;
}

export interface MetaReceitaPorOrigem {
  readonly quarterLabel: string;
  readonly meta: number;
  /** Ordem de exibição fixa: cliente atual, indicação, inbound, mídia paga. Nunca reordenar por valor. */
  readonly origens: readonly OrigemReceita[];
}

export const data: MetaReceitaPorOrigem = {
  quarterLabel: '3º trimestre de 2026',
  meta: 5_000_000,
  origens: [
    { id: 'cliente-atual', label: 'Cliente atual', valor: 1_540_000 },
    { id: 'indicacao', label: 'Indicação', valor: 860_000 },
    { id: 'inbound', label: 'Inbound', valor: 610_000 },
    { id: 'midia-paga', label: 'Mídia paga', valor: 240_000 },
  ],
};
