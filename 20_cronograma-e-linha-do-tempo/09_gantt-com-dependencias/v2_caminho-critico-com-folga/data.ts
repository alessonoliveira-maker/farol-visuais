/**
 * Plano de implantação de um canal de mídia paga: sete tarefas, cada uma com o primeiro e o último
 * dia de trabalho (os dois inclusive, sempre em dia útil) e as tarefas que precisam terminar antes.
 * A folga é medida em dias úteis, de segunda a sexta.
 * Dado fictício e fixo: tarefas genéricas, sem pessoa, empresa, marca ou plataforma real.
 * Casos difíceis exercitados: folga pequena de 2 dias úteis ao lado de uma de 12, tarefa de três
 * dias e folga compartilhada por duas tarefas em cadeia.
 */
export interface PlanTask {
  readonly id: string;
  /** Frase comum começada por verbo no infinitivo, sem nome próprio: entra em minúscula no meio de uma oração. */
  readonly name: string;
  /** Primeiro dia de trabalho planejado, em YYYY-MM-DD. Vale como "não antes de" na conta das datas cedo. */
  readonly start: string;
  /** Último dia de trabalho planejado, em YYYY-MM-DD. Com o início, dá a duração em dias úteis. */
  readonly end: string;
  /** Ids das predecessoras: a tarefa só começa no dia útil seguinte ao fim de todas. Id fora do plano é ignorado. */
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
