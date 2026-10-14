/**
 * Origens que aparecem na mesma jornada de lead em 2026-08. Cada par listado em `pairs` teve pelo
 * menos uma jornada do mês com as duas origens; a relação não tem direção nem peso aqui, só
 * existência. Par ausente da lista é par medido sem nenhuma jornada em comum, não falta de dado.
 * Dado fictício e fixo: nenhuma origem é canal, marca ou empresa real.
 *
 * A ordem dos nós é a de cadastro: quem ordena cada grupo pelo número de pares é o componente.
 * Casos difíceis: a origem selecionada tem par nos três grupos; dois empates de grau dentro do mesmo
 * grupo (Blog e Redes orgânicas, Base de e-mail e Indicação), desfeitos pelo nome; uma origem com um
 * par só (Marketplace); e nomes de 14 e 15 caracteres, que são o teto de largura do rótulo.
 */
export interface OriginGroup {
  readonly id: string;
  /** Nome do grupo como rótulo, com a inicial maiúscula. */
  readonly label: string;
  /** O mesmo nome no meio de uma oração, sem a maiúscula de rótulo. */
  readonly inSentence: string;
}

export interface OriginNode {
  readonly id: string;
  readonly label: string;
  readonly inSentence: string;
  /** `id` de um grupo de `groups`. */
  readonly group: string;
}

export interface OriginPair {
  readonly a: string;
  readonly b: string;
}

export interface OriginNetwork {
  /** Mês do recorte, em `YYYY-MM`. */
  readonly month: string;
  /** Ordem de leitura dos grupos na volta, em sentido horário a partir do topo. */
  readonly groups: readonly OriginGroup[];
  readonly nodes: readonly OriginNode[];
  readonly pairs: readonly OriginPair[];
}

/** A origem acesa. O Farol passa a origem selecionada na página. */
export const highlightId = 'busca-paga';

export const data: OriginNetwork = {
  month: '2026-08',
  groups: [
    { id: 'pago', label: 'Pago', inSentence: 'pago' },
    { id: 'organico', label: 'Orgânico', inSentence: 'orgânico' },
    { id: 'relacionamento', label: 'Relacionamento', inSentence: 'relacionamento' },
  ],
  nodes: [
    { id: 'display', label: 'Display', inSentence: 'display', group: 'pago' },
    { id: 'busca-paga', label: 'Busca paga', inSentence: 'busca paga', group: 'pago' },
    { id: 'marketplace', label: 'Marketplace', inSentence: 'marketplace', group: 'pago' },
    { id: 'redes-pagas', label: 'Redes pagas', inSentence: 'redes pagas', group: 'pago' },
    { id: 'blog', label: 'Blog', inSentence: 'blog', group: 'organico' },
    { id: 'redes-org', label: 'Redes orgânicas', inSentence: 'redes orgânicas', group: 'organico' },
    { id: 'busca-org', label: 'Busca orgânica', inSentence: 'busca orgânica', group: 'organico' },
    { id: 'direto', label: 'Acesso direto', inSentence: 'acesso direto', group: 'organico' },
    { id: 'parceiro', label: 'Parceiro', inSentence: 'parceiro', group: 'relacionamento' },
    { id: 'evento', label: 'Evento', inSentence: 'evento', group: 'relacionamento' },
    { id: 'indicacao', label: 'Indicação', inSentence: 'indicação', group: 'relacionamento' },
    { id: 'email', label: 'Base de e-mail', inSentence: 'base de e-mail', group: 'relacionamento' },
  ],
  pairs: [
    { a: 'busca-paga', b: 'redes-pagas' },
    { a: 'busca-paga', b: 'display' },
    { a: 'busca-paga', b: 'busca-org' },
    { a: 'busca-paga', b: 'direto' },
    { a: 'busca-paga', b: 'email' },
    { a: 'redes-pagas', b: 'display' },
    { a: 'redes-pagas', b: 'redes-org' },
    { a: 'redes-pagas', b: 'marketplace' },
    { a: 'display', b: 'direto' },
    { a: 'busca-org', b: 'blog' },
    { a: 'busca-org', b: 'direto' },
    { a: 'busca-org', b: 'redes-org' },
    { a: 'redes-org', b: 'blog' },
    { a: 'blog', b: 'direto' },
    { a: 'evento', b: 'indicacao' },
    { a: 'evento', b: 'parceiro' },
    { a: 'indicacao', b: 'parceiro' },
    { a: 'indicacao', b: 'email' },
    { a: 'email', b: 'busca-org' },
  ],
};
