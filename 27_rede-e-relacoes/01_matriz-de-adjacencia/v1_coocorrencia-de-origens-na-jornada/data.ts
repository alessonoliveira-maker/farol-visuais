/**
 * Coocorrência de origens na jornada de um lead em 2026-08. Dado fictício e fixo: cada par conta as
 * jornadas em que as duas origens aparecem juntas, uma jornada por lead no mês, sem direção (a
 * relação é simétrica, por isso a matriz desenha só o triângulo inferior).
 *
 * Casos difíceis de propósito. Um par gigante (Busca paga com Busca orgânica) que, numa rampa linear,
 * apagaria todo o resto. Pares com zero medido (a fonte cobre todas as origens, então o par ausente da
 * lista é zero medido, não falta de dado). E 12 origens em 3 grupos, para a ordem por grupo mostrar
 * os blocos.
 */
export type OriginGroupId = 'pago' | 'organico' | 'relacionamento';

export interface OriginGroup {
  readonly id: OriginGroupId;
  readonly label: string;
}

/** Ordem de leitura dos grupos, a mesma do desenho de cima para baixo. */
export const GROUPS: readonly OriginGroup[] = [
  { id: 'pago', label: 'Pago' },
  { id: 'organico', label: 'Orgânico' },
  { id: 'relacionamento', label: 'Relacionamento' },
];

export interface OriginNode {
  readonly id: string;
  readonly label: string;
  readonly group: OriginGroupId;
}

export interface OriginPair {
  readonly a: string;
  readonly b: string;
  readonly journeys: number;
}

export interface CooccurrenceData {
  /** Mês de referência, em YYYY-MM. */
  readonly month: string;
  /** Jornadas de lead com pelo menos duas origens no mês. */
  readonly journeys: number;
  readonly nodes: readonly OriginNode[];
  readonly pairs: readonly OriginPair[];
}

export const data: CooccurrenceData = {
  month: '2026-08',
  journeys: 1_840,
  nodes: [
    { id: 'busca-paga', label: 'Busca paga', group: 'pago' },
    { id: 'redes-pagas', label: 'Redes pagas', group: 'pago' },
    { id: 'display', label: 'Display', group: 'pago' },
    { id: 'marketplace', label: 'Marketplace', group: 'pago' },
    { id: 'busca-org', label: 'Busca orgânica', group: 'organico' },
    { id: 'redes-org', label: 'Redes orgânicas', group: 'organico' },
    { id: 'blog', label: 'Blog', group: 'organico' },
    { id: 'direto', label: 'Acesso direto', group: 'organico' },
    { id: 'evento', label: 'Evento', group: 'relacionamento' },
    { id: 'indicacao', label: 'Indicação de cliente', group: 'relacionamento' },
    { id: 'email', label: 'Base de e-mail', group: 'relacionamento' },
    { id: 'parceiro', label: 'Parceiro', group: 'relacionamento' },
  ],
  pairs: [
    { a: 'busca-paga', b: 'redes-pagas', journeys: 168 },
    { a: 'busca-paga', b: 'display', journeys: 74 },
    { a: 'busca-paga', b: 'marketplace', journeys: 22 },
    { a: 'redes-pagas', b: 'display', journeys: 131 },
    { a: 'redes-pagas', b: 'marketplace', journeys: 9 },
    { a: 'busca-org', b: 'redes-org', journeys: 96 },
    { a: 'busca-org', b: 'blog', journeys: 143 },
    { a: 'busca-org', b: 'direto', journeys: 201 },
    { a: 'redes-org', b: 'blog', journeys: 38 },
    { a: 'redes-org', b: 'direto', journeys: 52 },
    { a: 'blog', b: 'direto', journeys: 61 },
    { a: 'evento', b: 'indicacao', journeys: 47 },
    { a: 'evento', b: 'email', journeys: 29 },
    { a: 'evento', b: 'parceiro', journeys: 18 },
    { a: 'indicacao', b: 'email', journeys: 33 },
    { a: 'indicacao', b: 'parceiro', journeys: 41 },
    { a: 'email', b: 'parceiro', journeys: 12 },
    { a: 'busca-paga', b: 'busca-org', journeys: 412 },
    { a: 'busca-paga', b: 'redes-org', journeys: 57 },
    { a: 'busca-paga', b: 'blog', journeys: 26 },
    { a: 'busca-paga', b: 'direto', journeys: 118 },
    { a: 'redes-pagas', b: 'busca-org', journeys: 88 },
    { a: 'redes-pagas', b: 'redes-org', journeys: 104 },
    { a: 'redes-pagas', b: 'blog', journeys: 14 },
    { a: 'redes-pagas', b: 'direto', journeys: 63 },
    { a: 'display', b: 'busca-org', journeys: 31 },
    { a: 'display', b: 'redes-org', journeys: 19 },
    { a: 'display', b: 'blog', journeys: 7 },
    { a: 'display', b: 'direto', journeys: 24 },
    { a: 'marketplace', b: 'busca-org', journeys: 15 },
    { a: 'marketplace', b: 'direto', journeys: 11 },
    { a: 'busca-paga', b: 'evento', journeys: 6 },
    { a: 'busca-paga', b: 'indicacao', journeys: 3 },
    { a: 'busca-paga', b: 'email', journeys: 21 },
    { a: 'redes-pagas', b: 'evento', journeys: 4 },
    { a: 'redes-pagas', b: 'indicacao', journeys: 2 },
    { a: 'redes-pagas', b: 'email', journeys: 17 },
    { a: 'redes-pagas', b: 'parceiro', journeys: 1 },
    { a: 'display', b: 'email', journeys: 5 },
    { a: 'marketplace', b: 'email', journeys: 2 },
    { a: 'marketplace', b: 'parceiro', journeys: 8 },
    { a: 'busca-org', b: 'evento', journeys: 9 },
    { a: 'busca-org', b: 'indicacao', journeys: 34 },
    { a: 'busca-org', b: 'email', journeys: 66 },
    { a: 'busca-org', b: 'parceiro', journeys: 5 },
    { a: 'redes-org', b: 'evento', journeys: 12 },
    { a: 'redes-org', b: 'indicacao', journeys: 16 },
    { a: 'redes-org', b: 'email', journeys: 28 },
    { a: 'redes-org', b: 'parceiro', journeys: 3 },
    { a: 'blog', b: 'evento', journeys: 8 },
    { a: 'blog', b: 'indicacao', journeys: 11 },
    { a: 'blog', b: 'email', journeys: 49 },
    { a: 'blog', b: 'parceiro', journeys: 2 },
    { a: 'direto', b: 'evento', journeys: 15 },
    { a: 'direto', b: 'indicacao', journeys: 72 },
    { a: 'direto', b: 'email', journeys: 44 },
    { a: 'direto', b: 'parceiro', journeys: 10 },
  ],
};
