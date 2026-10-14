/**
 * Respostas abertas de um formulário de marketing num trimestre, à pergunta sobre o que pesou na
 * decisão: cada linha é um texto distinto e a quantidade de respostas escritas exatamente assim
 * (contagem de respostas; as 12 linhas somam 82). Dado fictício e fixo: nenhuma resposta cita
 * pessoa, empresa, marca ou produto real.
 *
 * O recorte exercita a troca da árvore pela concordância: a raiz padrão, garantia, aparece em
 * 4 respostas, uma a menos que o mínimo da árvore. As quatro cobrem as bordas da concordância:
 * contexto esquerdo mais longo que a janela, raiz no fim da resposta (direita vazia), raiz
 * abrindo a resposta com maiúscula (esquerda vazia) e contexto direito mais longo que a janela.
 * Para ver os outros dois caminhos da mesma peça, passe `rootWord="prazo"` (27 respostas, desenha
 * a árvore) ou `rootWord="frete"` (nenhuma resposta, estado vazio).
 */
export interface FormAnswer {
  readonly id: string;
  /** A resposta como foi escrita, com a grafia original. */
  readonly text: string;
  /** Quantas respostas foram escritas exatamente assim. */
  readonly count: number;
}

export const data: readonly FormAnswer[] = [
  { id: 'ans-01', text: 'na comparação entre as duas propostas a garantia estendida pesou mais', count: 1 },
  { id: 'ans-02', text: 'faltou clareza sobre a garantia', count: 1 },
  { id: 'ans-03', text: 'Garantia de doze meses foi o diferencial', count: 1 },
  { id: 'ans-04', text: 'o vendedor explicou bem a garantia e o prazo de entrega para a nossa filial', count: 1 },
  { id: 'ans-05', text: 'prazo de entrega curto', count: 9 },
  { id: 'ans-06', text: 'prazo de entrega dentro do combinado', count: 6 },
  { id: 'ans-07', text: 'prazo de pagamento flexível', count: 7 },
  { id: 'ans-08', text: 'o prazo de instalação foi rápido', count: 4 },
  { id: 'ans-09', text: 'atendimento rápido do vendedor', count: 14 },
  { id: 'ans-10', text: 'indicação de um conhecido', count: 12 },
  { id: 'ans-11', text: 'preço dentro do orçamento', count: 16 },
  { id: 'ans-12', text: 'já conhecia a empresa', count: 10 },
];

/** Palavra raiz escolhida; a comparação é pela chave sem acento e em minúsculas. */
export const rootWord = 'garantia';

/** Primeiro e último mês do trimestre das respostas, em `YYYY-MM`. */
export const period = { start: '2026-07', end: '2026-09' } as const;
