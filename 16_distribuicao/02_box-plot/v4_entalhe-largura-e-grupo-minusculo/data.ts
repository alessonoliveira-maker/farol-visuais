/**
 * Custo por lead qualificado de cada campanha do trimestre, em reais, agrupado por tipo de mídia.
 * Dado fictício, determinístico, sem nenhuma correspondência com a base real.
 *
 * O eixo de categoria é tipo de mídia e não plataforma, pelo mesmo motivo do strip plot da família:
 * recorte por fornecedor não sobrevive à troca de fornecedor, e marca real não entra no catálogo.
 *
 * Uma observação por campanha, e não os cinco números prontos, porque esta versão precisa de duas
 * coisas que o resumo pronto não carrega: o `n` de cada grupo, que é o que a largura da caixa codifica,
 * e o intervalo interquartil, que é o que o entalhe divide pela raiz de `n`.
 *
 * Dois grupos existem para exercitar o limite do desenho, e não para completar a amostra.
 *
 * A mídia nativa tem nove campanhas e um intervalo interquartil de 80 reais simétrico em torno da
 * mediana, então o entalhe de 1,58 vez o interquartil sobre a raiz de nove mede 42,13 reais contra os
 * 40 que a caixa tem de cada lado da mediana: o entalhe não cabe na caixa. É a situação que o desenho
 * precisa declarar em vez de desenhar torto.
 *
 * A programática tem quatro campanhas. Quatro casos não sustentam quartil: a caixa desenhada sobre
 * eles afirmaria uma metade central que é praticamente a amostra inteira. Ela entra como os quatro
 * pontos e o `n` escrito, sem caixa.
 */

export interface Campaign {
  /** Código fictício da campanha. */
  readonly id: string;
  /** Custo por lead qualificado, em reais. */
  readonly cpl: number;
}

export interface MediaKind {
  readonly id: string;
  readonly name: string;
  readonly campaigns: readonly Campaign[];
}

/** Teto do eixo, em reais, vindo da régua da métrica e não do maior valor da amostra. */
export const DOMAIN_MAX = 560;

/** Abaixo deste número de campanhas o grupo não ganha caixa: só os pontos e o n escrito. */
export const MIN_BOX_N = 5;

/**
 * Campanhas do trimestre que não geraram nenhum lead qualificado. Sem denominador não há custo por
 * lead: o valor não é zero nem infinito, é ausente. Ficam fora da amostra e contadas no rodapé.
 */
export const WITHOUT_QUALIFIED = 11;

function kind(id: string, name: string, prefix: number, values: readonly number[]): MediaKind {
  return {
    id,
    name,
    campaigns: values.map((cpl, index) => ({ id: `CP ${String(prefix + index)}`, cpl })),
  };
}

export const data: readonly MediaKind[] = [
  kind('busca-paga', 'Busca paga', 3100, [
    118, 124, 131, 136, 140, 145, 148, 152, 155, 158, 161, 164, 166, 168, 171, 173, 175, 177, 179, 181,
    183, 185, 187, 189, 191, 193, 196, 198, 201, 204, 207, 210, 214, 218, 222, 227, 232, 238, 244, 251,
    258, 266, 275, 285, 296, 308, 322, 341,
  ]),
  kind('social-pago', 'Social pago', 3300, [
    132, 141, 148, 154, 159, 164, 169, 173, 177, 181, 185, 189, 193, 197, 201, 205, 209, 213, 217, 221,
    226, 231, 236, 242, 248, 255, 262, 270, 279, 289, 300, 312, 325, 340, 356, 374, 394, 416, 441, 469,
    512,
  ]),
  kind('video', 'Vídeo', 3500, [
    168, 182, 193, 203, 212, 221, 229, 237, 245, 253, 261, 269, 277, 286, 295, 305, 316, 328, 341, 356,
    373, 392, 414, 440, 471, 528,
  ]),
  kind('display', 'Display', 3700, [
    146, 163, 177, 189, 200, 210, 220, 229, 238, 247, 257, 268, 280, 294, 311, 333, 364, 412,
  ]),
  kind('nativa', 'Nativa', 3900, [121, 143, 167, 187, 207, 227, 247, 279, 334]),
  kind('programatica', 'Programática', 4100, [198, 289, 312, 355]),
];
