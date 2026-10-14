/**
 * Criativos de uma campanha no trimestre: a frequência média, em quantas vezes a mesma pessoa viu
 * o anúncio, e o par bruto de impressões e cliques que dá a taxa de clique. A taxa não vem
 * calculada no dado de propósito, para o par ficar disponível junto dela.
 * Criativo sem impressão entregue não tem taxa: ele fica com denominador zero, que é ausência de
 * medida e não taxa de zero.
 * Dado fictício e fixo: nenhum criativo, campanha ou plataforma corresponde a um real.
 */
export interface CreativeFrequencyCtr {
  readonly id: string;
  readonly rotulo: string;
  readonly frequenciaMedia: number;
  readonly impressoes: number;
  readonly cliques: number;
}

export const data: readonly CreativeFrequencyCtr[] = [
  { id: 'cri-01', rotulo: 'Criativo A', frequenciaMedia: 1.4, impressoes: 128_400, cliques: 1_890 },
  { id: 'cri-02', rotulo: 'Criativo B', frequenciaMedia: 1.9, impressoes: 96_200, cliques: 875 },
  { id: 'cri-03', rotulo: 'Criativo C', frequenciaMedia: 2.3, impressoes: 142_700, cliques: 2_397 },
  { id: 'cri-04', rotulo: 'Criativo D', frequenciaMedia: 2.8, impressoes: 74_500, cliques: 901 },
  { id: 'cri-05', rotulo: 'Criativo E', frequenciaMedia: 3.2, impressoes: 188_300, cliques: 1_958 },
  { id: 'cri-06', rotulo: 'Criativo F', frequenciaMedia: 3.7, impressoes: 112_600, cliques: 1_715 },
  { id: 'cri-07', rotulo: 'Criativo G', frequenciaMedia: 4.3, impressoes: 161_400, cliques: 1_590 },
  { id: 'cri-08', rotulo: 'Criativo H', frequenciaMedia: 5.1, impressoes: 88_900, cliques: 1_142 },
  { id: 'cri-09', rotulo: 'Criativo I', frequenciaMedia: 5.9, impressoes: 134_200, cliques: 1_455 },
  { id: 'cri-10', rotulo: 'Criativo J', frequenciaMedia: 1.1, impressoes: 0, cliques: 0 },
];
