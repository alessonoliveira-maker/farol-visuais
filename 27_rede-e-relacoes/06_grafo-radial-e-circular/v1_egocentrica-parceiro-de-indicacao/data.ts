/**
 * Indicações registradas na carteira do parceiro fictício P07, acumuladas até 2026-09-30. Cada linha
 * é uma indicação: `from` é quem indicou e `to` é a conta indicada. Unidade: contas. Dado fictício e
 * fixo: parceiro e contas aparecem só como código, e nenhum código é empresa ou pessoa real.
 *
 * A ordem das linhas é a de cadastro, de propósito: quem ordena o primeiro anel pelo número de contas
 * indicadas adiante é o componente. Casos difíceis: três contas empatadas na frente, com 3 indicações
 * cada (C08, C19 e C26); três contas diretas que não indicaram ninguém (C11, C22 e C34), que ficam
 * no anel sem leque; e uma conta com uma indicação só (C15), que não abre leque, só um raio.
 */
export interface Referral {
  /** Código de quem indicou: o parceiro ou uma conta já indicada. */
  readonly from: string;
  /** Código da conta indicada. */
  readonly to: string;
}

/** O parceiro no centro do grafo. O Farol passa o parceiro selecionado na página. */
export const egoId = 'P07';

export const data: readonly Referral[] = [
  { from: 'P07', to: 'C03' },
  { from: 'P07', to: 'C08' },
  { from: 'C08', to: 'C41' },
  { from: 'P07', to: 'C11' },
  { from: 'P07', to: 'C15' },
  { from: 'C08', to: 'C42' },
  { from: 'C03', to: 'C50' },
  { from: 'P07', to: 'C19' },
  { from: 'C19', to: 'C44' },
  { from: 'P07', to: 'C22' },
  { from: 'C08', to: 'C43' },
  { from: 'C19', to: 'C45' },
  { from: 'P07', to: 'C26' },
  { from: 'C26', to: 'C47' },
  { from: 'C15', to: 'C54' },
  { from: 'P07', to: 'C30' },
  { from: 'C26', to: 'C48' },
  { from: 'C03', to: 'C51' },
  { from: 'C30', to: 'C52' },
  { from: 'P07', to: 'C34' },
  { from: 'C19', to: 'C46' },
  { from: 'C26', to: 'C49' },
  { from: 'C30', to: 'C53' },
];
