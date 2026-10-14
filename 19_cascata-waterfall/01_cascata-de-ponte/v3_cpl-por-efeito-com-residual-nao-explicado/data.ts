/**
 * CPL (custo por lead) de marketing em reais por lead: R$ 184 em 2026-07 e R$ 212 em 2026-08.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * Os efeitos são os calculados pela decomposição (volume, custo, mix de plataforma); o resíduo
 * não mora aqui: o componente o obtém por função pura como (fim − início) − soma dos efeitos.
 * Aqui sobram R$ 5 de 28 (18% da diferença): 184 − 9 + 26 + 6 + 5 = 212.
 */
export interface CplEffect {
  readonly id: string;
  readonly label: string;
  readonly value: number;
}

export interface CplBridge {
  readonly fromPeriod: string;
  readonly from: number;
  readonly toPeriod: string;
  readonly to: number;
  readonly effects: readonly CplEffect[];
}

export const data: CplBridge = {
  fromPeriod: '2026-07',
  from: 184,
  toPeriod: '2026-08',
  to: 212,
  effects: [
    { id: 'volume', label: 'Volume', value: -9 },
    { id: 'custo', label: 'Custo', value: 26 },
    { id: 'mix', label: 'Mix de plataforma', value: 6 },
  ],
};
