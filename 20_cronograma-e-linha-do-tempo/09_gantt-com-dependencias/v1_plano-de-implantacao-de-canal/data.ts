/**
 * Plano de implantação de um canal de mídia paga: sete tarefas, cada uma com o primeiro e o último
 * dia de trabalho (os dois inclusive, sempre em dia útil) e as tarefas que precisam terminar antes.
 * Dado fictício e fixo: tarefas genéricas, sem pessoa, empresa, marca ou plataforma real.
 * Casos difíceis exercitados: tarefa de três dias, nome de 31 caracteres, tarefa com três
 * predecessoras e duas tarefas que saem da mesma predecessora.
 */
export interface PlanTask {
  readonly id: string;
  /** Frase comum começada por verbo no infinitivo, sem nome próprio: entra em minúscula no meio de uma oração. */
  readonly name: string;
  /** Primeiro dia de trabalho, em YYYY-MM-DD. */
  readonly start: string;
  /** Último dia de trabalho, em YYYY-MM-DD. */
  readonly end: string;
  /** Ids das predecessoras: a tarefa só começa depois que todas terminam. Id fora do plano é ignorado. */
  readonly dependsOn: readonly string[];
}

export const data: readonly PlanTask[] = [
  { id: 'task-01', name: 'Definir público e orçamento', start: '2026-10-05', end: '2026-10-16', dependsOn: [] },
  { id: 'task-02', name: 'Produzir criativos e páginas', start: '2026-10-19', end: '2026-10-30', dependsOn: ['task-01'] },
  { id: 'task-03', name: 'Escrever roteiro de abordagem', start: '2026-10-19', end: '2026-10-23', dependsOn: ['task-01'] },
  { id: 'task-04', name: 'Configurar campanhas e medição', start: '2026-11-02', end: '2026-11-13', dependsOn: ['task-02'] },
  { id: 'task-05', name: 'Integrar formulário ao cadastro', start: '2026-11-02', end: '2026-11-11', dependsOn: ['task-02'] },
  { id: 'task-06', name: 'Treinar pré-vendas no roteiro', start: '2026-11-02', end: '2026-11-04', dependsOn: ['task-03'] },
  {
    id: 'task-07',
    name: 'Rodar piloto e liberar o canal',
    start: '2026-11-16',
    end: '2026-11-27',
    dependsOn: ['task-04', 'task-05', 'task-06'],
  },
];

/** Data de hoje vinda do dado, nunca do relógio. */
export const today = '2026-10-21';
