/**
 * Anotações de oportunidades de 2026-T3 que citam o termo preço, com data, desfecho e executivo
 * fictício. O preview carrega as 40 mais recentes de 2.000 ocorrências do recorte; as contagens
 * por desfecho valem para as 2.000. Sem nome de pessoa, empresa ou contato. Dado fictício e fixo.
 */
export type Outcome = 'ganha' | 'perdida' | 'aberta';

export interface TermNote {
  readonly id: string;
  /** Data da anotação, em YYYY-MM-DD. */
  readonly date: string;
  readonly outcome: Outcome;
  readonly executive: string;
  readonly text: string;
}

export interface KwicWithOutcomeData {
  readonly term: string;
  /** Todas as ocorrências do recorte, das quais `notes` traz só as primeiras. */
  readonly totalOccurrences: number;
  /** Ocorrências do recorte inteiro por desfecho; a soma é `totalOccurrences`. */
  readonly totalsByOutcome: Readonly<Record<Outcome, number>>;
  readonly notes: readonly TermNote[];
}

export const data: KwicWithOutcomeData = {
  term: 'preço',
  totalOccurrences: 2000,
  totalsByOutcome: { ganha: 612, perdida: 1184, aberta: 204 },
  notes: [
    { id: 'n-01', date: '2026-09-30', outcome: 'perdida', executive: 'Executivo 03', text: 'Cliente achou o preço acima do orçamento aprovado pela diretoria e encerrou a conversa.' },
    { id: 'n-02', date: '2026-09-30', outcome: 'ganha', executive: 'Executivo 01', text: 'Fechamos depois de ajustar o preço para a tabela de frota com entrega em dez dias.' },
    { id: 'n-03', date: '2026-09-29', outcome: 'aberta', executive: 'Executivo 05', text: 'Pediu para rever o preço do pacote de manutenção antes de levar a proposta ao sócio.' },
    { id: 'n-04', date: '2026-09-29', outcome: 'perdida', executive: 'Executivo 02', text: 'Preço foi o único motivo citado, e o prazo de pagamento não compensou a diferença.' },
    { id: 'n-05', date: '2026-09-28', outcome: 'perdida', executive: 'Executivo 03', text: 'Comparou o preço com a proposta de outro fornecedor e pediu desconto de 6% à vista.' },
    { id: 'n-06', date: '2026-09-28', outcome: 'ganha', executive: 'Executivo 04', text: 'O preço final ficou dentro da faixa combinada na primeira reunião e a assinatura saiu no dia.' },
    { id: 'n-07', date: '2026-09-27', outcome: 'aberta', executive: 'Executivo 06', text: 'Aguarda retorno da área financeira sobre o preço com o seguro incluído.' },
    { id: 'n-08', date: '2026-09-27', outcome: 'perdida', executive: 'Executivo 01', text: 'Reclamou do preço, mas disse que voltaria se o frete fosse isento.' },
    { id: 'n-09', date: '2026-09-26', outcome: 'perdida', executive: 'Executivo 05', text: 'Sem condição de aceitar o preço neste trimestre; pediu contato em janeiro.' },
    { id: 'n-10', date: '2026-09-26', outcome: 'ganha', executive: 'Executivo 02', text: 'Aceitou o preço da proposta B, com a entrada dividida em duas parcelas.' },
    { id: 'n-11', date: '2026-09-25', outcome: 'perdida', executive: 'Executivo 04', text: 'Preço, prazo e garantia entraram na comparação, e o preço pesou mais.' },
    { id: 'n-12', date: '2026-09-25', outcome: 'aberta', executive: 'Executivo 03', text: 'Quer fixar o preço por doze meses antes de assinar; levei o pedido à gerência.' },
    { id: 'n-13', date: '2026-09-24', outcome: 'perdida', executive: 'Executivo 06', text: 'Disse que o preço do concorrente era 9% menor e que não abriria mão.' },
    { id: 'n-14', date: '2026-09-24', outcome: 'perdida', executive: 'Executivo 02', text: 'Achou o preço justo, porém o prazo de entrega inviabilizou o projeto da filial.' },
    { id: 'n-15', date: '2026-09-23', outcome: 'ganha', executive: 'Executivo 05', text: 'O preço da renovação não mudou e isso decidiu a conversa em poucos minutos.' },
    { id: 'n-16', date: '2026-09-23', outcome: 'perdida', executive: 'Executivo 01', text: 'Pediu a revisão do preço de três itens e depois deixou de responder as mensagens.' },
    { id: 'n-17', date: '2026-09-22', outcome: 'aberta', executive: 'Executivo 04', text: 'Negociando o preço do lote com a compra; nova rodada marcada para quinta.' },
    { id: 'n-18', date: '2026-09-22', outcome: 'perdida', executive: 'Executivo 03', text: 'Preço.' },
    { id: 'n-19', date: '2026-09-21', outcome: 'ganha', executive: 'Executivo 06', text: 'Gostou do preço com o desconto de volume e fechou duas unidades.' },
    { id: 'n-20', date: '2026-09-21', outcome: 'perdida', executive: 'Executivo 05', text: 'O preço de lista assustou, e a simulação com parcelas só chegou depois da decisão.' },
    { id: 'n-21', date: '2026-09-20', outcome: 'perdida', executive: 'Executivo 02', text: 'Cobrou clareza sobre o preço do serviço de instalação, que não estava na proposta.' },
    { id: 'n-22', date: '2026-09-20', outcome: 'aberta', executive: 'Executivo 01', text: 'Vai comparar o preço com mais dois orçamentos e responde até o dia 5.' },
    { id: 'n-23', date: '2026-09-19', outcome: 'perdida', executive: 'Executivo 04', text: 'Preço acima do teto da licitação interna; sem margem para negociar.' },
    { id: 'n-24', date: '2026-09-19', outcome: 'ganha', executive: 'Executivo 03', text: 'Com o preço fechado em contrato anual, o cliente liberou a compra no mesmo dia.' },
    { id: 'n-25', date: '2026-09-18', outcome: 'perdida', executive: 'Executivo 06', text: 'Mencionou o preço três vezes na ligação e pediu uma condição que não temos.' },
    { id: 'n-26', date: '2026-09-18', outcome: 'perdida', executive: 'Executivo 01', text: 'Preço da peça de reposição foi o ponto, e não o do equipamento.' },
    { id: 'n-27', date: '2026-09-17', outcome: 'aberta', executive: 'Executivo 02', text: 'Aguardando aprovação do novo preço pela gerência regional.' },
    { id: 'n-28', date: '2026-09-17', outcome: 'ganha', executive: 'Executivo 05', text: 'Concordou com o preço depois de ver o custo total em cinco anos.' },
    { id: 'n-29', date: '2026-09-16', outcome: 'perdida', executive: 'Executivo 03', text: 'Achou o preço alto para um primeiro contrato e preferiu um piloto menor.' },
    { id: 'n-30', date: '2026-09-16', outcome: 'perdida', executive: 'Executivo 04', text: 'O preço mudou entre a primeira proposta e a segunda, e isso gerou desconfiança.' },
    { id: 'n-31', date: '2026-09-15', outcome: 'ganha', executive: 'Executivo 06', text: 'Preço e prazo cabiam no plano dele, então foi uma negociação curta.' },
    { id: 'n-32', date: '2026-09-15', outcome: 'perdida', executive: 'Executivo 02', text: 'Pediu o mesmo preço do ano passado, e a tabela subiu 7% desde então.' },
    { id: 'n-33', date: '2026-09-14', outcome: 'aberta', executive: 'Executivo 05', text: 'Segue interessado, mas travou no preço da implantação inicial.' },
    { id: 'n-34', date: '2026-09-14', outcome: 'perdida', executive: 'Executivo 01', text: 'Disse que o preço deveria incluir o treinamento e não incluía.' },
    { id: 'n-35', date: '2026-09-13', outcome: 'perdida', executive: 'Executivo 06', text: 'Sem retorno desde que enviei o preço revisto; tentei duas vezes.' },
    { id: 'n-36', date: '2026-09-13', outcome: 'ganha', executive: 'Executivo 04', text: 'O preço com a troca do usado fechou a conta que ele queria.' },
    { id: 'n-37', date: '2026-09-12', outcome: 'perdida', executive: 'Executivo 03', text: 'Considerou o preço aceitável, mas a verba só libera em outubro.' },
    { id: 'n-38', date: '2026-09-12', outcome: 'perdida', executive: 'Executivo 05', text: 'Outro fornecedor cobrou preço menor sem exigir contrato de fidelidade.' },
    { id: 'n-39', date: '2026-09-11', outcome: 'aberta', executive: 'Executivo 02', text: 'Prometeu responder sobre o preço depois da reunião de diretoria.' },
    { id: 'n-40', date: '2026-09-11', outcome: 'ganha', executive: 'Executivo 01', text: 'Preço fechado, entrega agendada e financiamento aprovado no mesmo dia.' },
  ],
};
