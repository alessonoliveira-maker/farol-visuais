/**
 * Histórico fictício importado de uma planilha antiga: um evento sem data, uma anotação perto de
 * 3.000 caracteres, um autor ausente e dois eventos no mesmo minuto. Dado fixo e sem sorteio:
 * nenhuma pessoa ou empresa é real.
 */
export type EventKind = 'call' | 'email' | 'meeting' | 'note';

export interface ImportedEvent {
  readonly id: string;
  readonly kind: EventKind;
  readonly title: string;
  /** `null` quando a planilha de origem não trazia quem registrou. */
  readonly author: string | null;
  /** `null` quando a planilha não trazia data; o evento vai para o fim, fora da ordem. */
  readonly at: string | null;
  readonly detail?: string;
}

export interface ImportedHistory {
  readonly opportunity: string;
  readonly events: readonly ImportedEvent[];
}

const NOTE_SENTENCES: readonly string[] = [
  'O cliente descreveu a rotina de cotação como manual, feita em planilhas por cada filial, sem um responsável único.',
  'Pediu que a proposta separasse o custo de implantação do custo mensal para facilitar a aprovação interna.',
  'Citou que a diretoria avalia fornecedores duas vezes por ano e que a próxima janela de decisão fecha em dezembro.',
  'Há receio com a migração dos dados antigos, principalmente os pedidos em aberto das três filiais maiores.',
  'Combinamos uma prova de conceito curta, com uma filial e um mês de operação, antes de qualquer contrato.',
  'A equipe financeira quer ver o relatório de conciliação funcionando com o formato de arquivo que já usam.',
];

/** Texto longo montado por repetição dos trechos acima, cortado no último ponto antes do limite. */
function buildLongNote(limit: number): string {
  let text = '';
  for (let i = 0; text.length < limit; i += 1) {
    text += `${NOTE_SENTENCES[i % NOTE_SENTENCES.length] ?? ''} `;
  }
  const cut = text.slice(0, limit);
  return cut.slice(0, cut.lastIndexOf('.') + 1);
}

export const LONG_NOTE_LIMIT = 3000;

export const data: ImportedHistory = {
  opportunity: 'OP-0507',
  events: [
    { id: 'ev-5', kind: 'note', title: 'Anotação sem data da planilha de origem', author: 'Talita V.', at: null, detail: 'Cliente prefere contato por telefone no fim da tarde.' },
    { id: 'ev-3', kind: 'email', title: 'E-mail com a proposta enviado', author: 'Murilo C.', at: '2026-09-18T10:15' },
    { id: 'ev-1', kind: 'meeting', title: 'Reunião de diagnóstico', author: 'Talita V.', at: '2026-09-10T09:00' },
    { id: 'ev-4', kind: 'note', title: 'Anotação da conversa com a diretoria', author: 'Murilo C.', at: '2026-09-22T14:30', detail: buildLongNote(LONG_NOTE_LIMIT) },
    { id: 'ev-2', kind: 'call', title: 'Ligação de retorno', author: null, at: '2026-09-18T10:15' },
  ],
};
