/**
 * Motivos de perda registrados juntos nas perdas comerciais de 2026. Dado fictício e fixo: uma perda
 * pode ter mais de um motivo, e cada par conta as perdas em que os dois foram registrados juntos. A
 * relação é simétrica; o par ausente da lista é zero medido, porque o registro cobre todos os motivos.
 *
 * Caso difícil de propósito: 18 motivos em três famílias (condição comercial, produto e relação com
 * o cliente) com ligações fortes dentro de cada uma e fracas entre elas, para a ordem alfabética
 * parecer ruído e a ordem por agrupamento mostrar os blocos. Os nomes têm até 22 caracteres, o que
 * decide a margem esquerda do desenho.
 */
export interface LossReason {
  readonly id: string;
  readonly label: string;
}

export interface ReasonPair {
  readonly a: string;
  readonly b: string;
  /** Perdas em que os dois motivos foram registrados juntos. */
  readonly losses: number;
}

export interface LossReasonData {
  readonly year: string;
  /** Perdas registradas no ano, com um ou mais motivos. */
  readonly totalLosses: number;
  readonly reasons: readonly LossReason[];
  readonly pairs: readonly ReasonPair[];
}

const p = (a: string, b: string, losses: number): ReasonPair => ({ a, b, losses });

export const data: LossReasonData = {
  year: '2026',
  totalLosses: 1_460,
  reasons: [
    { id: 'preco', label: 'Preço acima do mercado' },
    { id: 'desconto', label: 'Desconto negado' },
    { id: 'prazo', label: 'Prazo de pagamento' },
    { id: 'adesao', label: 'Taxa de adesão alta' },
    { id: 'orcamento', label: 'Orçamento cortado' },
    { id: 'verba', label: 'Sem verba aprovada' },
    { id: 'integracao', label: 'Falta de integração' },
    { id: 'funcao', label: 'Funcionalidade ausente' },
    { id: 'implantacao', label: 'Implantação complexa' },
    { id: 'suporte', label: 'Suporte insatisfatório' },
    { id: 'instavel', label: 'Plataforma instável' },
    { id: 'contrato', label: 'Contrato muito rígido' },
    { id: 'semresp', label: 'Lead sem resposta' },
    { id: 'desqualif', label: 'Lead desqualificado' },
    { id: 'decisor', label: 'Decisor não localizado' },
    { id: 'gestor', label: 'Troca de gestor' },
    { id: 'adiou', label: 'Decisão adiada' },
    { id: 'concorrente', label: 'Fechou com concorrente' },
  ],
  pairs: [
    p('preco', 'desconto', 87), p('preco', 'prazo', 31), p('preco', 'adesao', 44),
    p('preco', 'orcamento', 74), p('preco', 'verba', 52), p('desconto', 'prazo', 28),
    p('desconto', 'adesao', 36), p('desconto', 'orcamento', 68), p('desconto', 'verba', 41),
    p('prazo', 'adesao', 22), p('prazo', 'orcamento', 25), p('prazo', 'verba', 33),
    p('adesao', 'orcamento', 19), p('adesao', 'verba', 17), p('orcamento', 'verba', 58),
    p('integracao', 'funcao', 63), p('integracao', 'implantacao', 49), p('integracao', 'suporte', 27),
    p('integracao', 'instavel', 38), p('integracao', 'contrato', 12), p('funcao', 'implantacao', 34),
    p('funcao', 'suporte', 18), p('funcao', 'instavel', 21), p('funcao', 'contrato', 9),
    p('implantacao', 'suporte', 46), p('implantacao', 'instavel', 29), p('implantacao', 'contrato', 14),
    p('suporte', 'instavel', 52), p('suporte', 'contrato', 11), p('instavel', 'contrato', 7),
    p('semresp', 'desqualif', 41), p('semresp', 'decisor', 57), p('semresp', 'gestor', 23),
    p('semresp', 'adiou', 35), p('semresp', 'concorrente', 6), p('desqualif', 'decisor', 19),
    p('desqualif', 'gestor', 8), p('desqualif', 'adiou', 26), p('desqualif', 'concorrente', 4),
    p('decisor', 'gestor', 48), p('decisor', 'adiou', 39), p('decisor', 'concorrente', 11),
    p('gestor', 'adiou', 31), p('gestor', 'concorrente', 9), p('adiou', 'concorrente', 14),
    p('preco', 'concorrente', 33), p('desconto', 'concorrente', 29), p('orcamento', 'adiou', 36),
    p('verba', 'adiou', 28), p('verba', 'gestor', 15), p('orcamento', 'gestor', 12),
    p('prazo', 'contrato', 24), p('adesao', 'contrato', 13), p('preco', 'contrato', 18),
    p('desconto', 'contrato', 21), p('integracao', 'concorrente', 16), p('funcao', 'concorrente', 22),
    p('suporte', 'gestor', 9), p('instavel', 'concorrente', 12), p('implantacao', 'adiou', 8),
    p('verba', 'semresp', 5), p('orcamento', 'semresp', 6), p('preco', 'funcao', 10),
    p('preco', 'integracao', 7), p('desconto', 'suporte', 3), p('funcao', 'adiou', 5),
    p('contrato', 'concorrente', 17), p('suporte', 'desqualif', 2), p('instavel', 'semresp', 4),
    p('desqualif', 'orcamento', 1),
  ],
};
