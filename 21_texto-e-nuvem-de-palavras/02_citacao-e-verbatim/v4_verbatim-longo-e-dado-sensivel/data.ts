/**
 * Anotações de ligação da Pré-vendas de dois motivos de perda, a primeira longa (cerca de 800
 * caracteres) e com dado sensível escrito no meio, a segunda inexistente. Dado fictício e fixo.
 *
 * O dado sensível é sintético e reservado de propósito, só para provar o mascaramento: o e-mail usa
 * o domínio `.invalid` (RFC 2606, nunca resolve), o telefone é todo de zeros e os dois nomes são
 * fictícios, de inicial de sobrenome. Nada aqui identifica pessoa, empresa ou linha real.
 *
 * O caso difícil é o trecho: o termo buscado ("desconto") está no meio do texto, então o recorte
 * por palavras corta as duas pontas e o componente conta os caracteres que ficaram de fora. O
 * motivo sem anotação (`note: null`) cai no estado vazio, sem citação inventada.
 */
export interface SensitiveNote {
  /** Texto literal da anotação, ainda COM o dado sensível; o componente mascara antes de exibir. */
  readonly text: string;
  /** Dia da ligação, YYYY-MM-DD. */
  readonly calledOn: string;
  /** Nomes que aparecem escritos na anotação e precisam ser mascarados. */
  readonly knownNames: readonly string[];
}

export interface ReasonNote {
  readonly id: string;
  /** Motivo em minúsculas, para entrar no meio de frase. */
  readonly reason: string;
  /** Anotação do motivo; `null` quando nenhuma ligação do motivo tem anotação. */
  readonly note: SensitiveNote | null;
}

export interface LongVerbatim {
  /** Termo buscado, sem acento e em minúsculas; o realce marca a forma escrita. */
  readonly term: string;
  readonly team: string;
  readonly entries: readonly ReasonNote[];
}

const LONG_NOTE =
  'Ligação de retorno após a proposta. A Marlene C., responsável pelo financeiro, atendeu de primeira e disse que o grupo revisa todos os contratos de gestão no começo do semestre. ' +
  'Pediu o resumo executivo para o Ricardo T., que fica na diretoria, e comentou a estrutura de taxas, o histórico de rentabilidade e o prazo de migração da carteira, que ela considera longo demais para o calendário deles. ' +
  'O ponto sensível foi o desconto: quem decide é a Marlene C., pelo e-mail marlene.c@exemplo.invalid ou pelo telefone (00) 90000-0000, e sem desconto na taxa de administração do primeiro ano ela não leva a proposta ao comitê. ' +
  'O Ricardo T. já avisou que o comitê só se reúne uma vez por mês, então o prazo aperta. ' +
  'Combinei de ligar de novo na quinta, depois que ela conversar com o time jurídico, e de mandar a comparação de taxas por escrito.';

export const data: LongVerbatim = {
  term: 'desconto',
  team: 'Pré-vendas',
  entries: [
    {
      id: 'preco',
      reason: 'preço',
      note: { text: LONG_NOTE, calledOn: '2026-09-24', knownNames: ['Marlene C.', 'Ricardo T.'] },
    },
    { id: 'pagamento', reason: 'condição de pagamento', note: null },
  ],
};
