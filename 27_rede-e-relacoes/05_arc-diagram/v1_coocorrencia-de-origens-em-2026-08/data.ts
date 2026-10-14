/**
 * Coocorrência de origens na jornada dos leads de um mês. `volume` é quantos leads tiveram a
 * origem em algum ponto da jornada; `weight` é quantos leads tiveram as duas origens do par na
 * mesma jornada. Unidade: leads. Dado fictício e fixo: nenhuma origem é canal, marca ou empresa
 * real. A ordem dos nós aqui é a de cadastro, de propósito: quem ordena o eixo por volume é o
 * componente. Par sem linha em `links` é par sem nenhum lead em comum no mês. O par de 12 leads
 * exercita o piso de espessura, e os nomes de duas palavras exercitam a quebra do rótulo.
 */
export interface OriginNode {
  readonly id: string;
  /** Nome da origem como rótulo, com a inicial maiúscula. */
  readonly label: string;
  /** O mesmo nome no meio de uma oração, sem a maiúscula de rótulo. */
  readonly inSentence: string;
  /** Leads do mês com a origem em algum ponto da jornada. */
  readonly volume: number;
}

export interface OriginLink {
  readonly source: string;
  readonly target: string;
  /** Leads do mês com as duas origens na mesma jornada. Inteiro maior que zero. */
  readonly weight: number;
}

export interface OriginNetwork {
  /** Mês do recorte, em `YYYY-MM`. */
  readonly month: string;
  readonly nodes: readonly OriginNode[];
  readonly links: readonly OriginLink[];
}

export const data: OriginNetwork = {
  month: '2026-08',
  nodes: [
    { id: 'email', label: 'E-mail', inSentence: 'e-mail', volume: 655 },
    { id: 'busca-paga', label: 'Busca paga', inSentence: 'busca paga', volume: 1_284 },
    { id: 'parceiros', label: 'Parceiros', inSentence: 'parceiros', volume: 96 },
    { id: 'redes-sociais', label: 'Redes sociais', inSentence: 'redes sociais', volume: 874 },
    { id: 'evento', label: 'Evento presencial', inSentence: 'evento presencial', volume: 198 },
    { id: 'busca-organica', label: 'Busca orgânica', inSentence: 'busca orgânica', volume: 1_106 },
    { id: 'indicacao', label: 'Indicação', inSentence: 'indicação', volume: 412 },
  ],
  links: [
    { source: 'busca-paga', target: 'busca-organica', weight: 318 },
    { source: 'busca-paga', target: 'redes-sociais', weight: 204 },
    { source: 'busca-organica', target: 'email', weight: 176 },
    { source: 'redes-sociais', target: 'email', weight: 121 },
    { source: 'busca-paga', target: 'email', weight: 97 },
    { source: 'email', target: 'indicacao', weight: 64 },
    { source: 'busca-organica', target: 'indicacao', weight: 58 },
    { source: 'indicacao', target: 'evento', weight: 47 },
    { source: 'indicacao', target: 'parceiros', weight: 41 },
    { source: 'redes-sociais', target: 'evento', weight: 33 },
    { source: 'evento', target: 'parceiros', weight: 29 },
    { source: 'busca-paga', target: 'indicacao', weight: 12 },
  ],
};
