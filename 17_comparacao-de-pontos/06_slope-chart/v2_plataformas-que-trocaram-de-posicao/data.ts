/**
 * CPL qualificado de 7 plataformas de mídia fictícias no primeiro e no segundo trimestre de 2026,
 * em reais por lead qualificado. CPL que cai é bom: a polaridade é declarada no componente e a cor
 * não segue a subida. Dado fictício e fixo: nenhuma plataforma corresponde a produto real.
 */
export interface PlatformCpl {
  readonly id: string;
  readonly name: string;
  readonly cplBefore: number;
  readonly cplAfter: number;
}

export const periodBefore = 'T1/2026';
export const periodAfter = 'T2/2026';

export const data: readonly PlatformCpl[] = [
  { id: 'busca-paga', name: 'Busca paga', cplBefore: 120, cplAfter: 104 },
  { id: 'video-curto', name: 'Vídeo curto', cplBefore: 98, cplAfter: 118 },
  { id: 'display', name: 'Display', cplBefore: 154, cplAfter: 149 },
  { id: 'marketplace', name: 'Marketplace', cplBefore: 174, cplAfter: 181 },
  { id: 'midia-exterior', name: 'Mídia exterior', cplBefore: 188, cplAfter: 190 },
  { id: 'rede-profissional', name: 'Rede profissional', cplBefore: 210, cplAfter: 196 },
  { id: 'podcast', name: 'Podcast', cplBefore: 236, cplAfter: 228 },
];
