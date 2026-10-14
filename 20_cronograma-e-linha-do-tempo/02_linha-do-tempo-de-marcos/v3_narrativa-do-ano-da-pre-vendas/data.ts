/**
 * Oito eventos de 2026 da pré-vendas, em ordem de data, cada um com título e uma frase.
 * `before` e `after` (contatos feitos e reuniões agendadas) existem só no evento que mexeu na taxa de
 * agenda: a taxa e a variação saem dessas contagens, nunca de fração escrita à mão.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 */
export interface PreSalesEvent {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly sentence: string;
  readonly before?: AgendaCount;
  readonly after?: AgendaCount;
}

/** Contagens de um período: contatos feitos e reuniões que viraram agenda. */
export interface AgendaCount {
  readonly contacts: number;
  readonly meetings: number;
}

export const data: readonly PreSalesEvent[] = [
  { id: 'e-meta', title: 'Meta de agenda revista', date: '2026-01-12', sentence: 'Meta por SDR sobe de 22 para 26 reuniões ao mês.' },
  { id: 'e-contas', title: 'Nova lista de contas', date: '2026-02-23', sentence: 'Base de contas prioritárias substitui a lista geral.' },
  { id: 'e-script', title: 'Script de abertura novo', date: '2026-03-30', sentence: 'O primeiro contato passa a citar o gatilho da conta.' },
  {
    id: 'e-cadencia',
    title: 'Nova cadência de contatos',
    date: '2026-05-11',
    sentence: 'Sequência de seis toques em dez dias, em três canais.',
    before: { contacts: 400, meetings: 60 },
    after: { contacts: 400, meetings: 84 },
  },
  { id: 'e-pausa', title: 'Campanha de mídia pausada', date: '2026-06-22', sentence: 'Duas semanas com menos leads novos entrando na fila.' },
  { id: 'e-painel', title: 'Painel de agenda por SDR', date: '2026-08-03', sentence: 'Cada SDR acompanha a própria taxa durante o dia.' },
  { id: 'e-objecoes', title: 'Treino de objeções', date: '2026-09-14', sentence: 'Duas sessões com gravações anonimizadas de ligações.' },
  { id: 'e-turnos', title: 'Dois turnos de contato', date: '2026-10-26', sentence: 'Contato também no fim da tarde, quando a fila enche.' },
];
