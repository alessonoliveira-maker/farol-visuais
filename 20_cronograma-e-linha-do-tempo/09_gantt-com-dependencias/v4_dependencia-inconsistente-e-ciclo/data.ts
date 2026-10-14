/**
 * Plano de pré-vendas com dois erros de dado deixados de propósito: uma sucessora que começa antes
 * de a predecessora terminar e duas tarefas que dependem uma da outra. Cada tarefa traz o primeiro
 * e o último dia de trabalho (os dois inclusive, sempre em dia útil) e as tarefas que precisam
 * terminar antes. A sobreposição é medida em dias úteis, de segunda a sexta.
 * Dado fictício e fixo: tarefas genéricas, sem pessoa, empresa, marca ou plataforma real.
 * Casos difíceis exercitados: `task-06` começa em 2026-10-26 e a predecessora `task-05` só termina em
 * 2026-10-30; `task-03` depende de `task-04` e `task-04` depende de `task-03`.
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
  { id: 'task-01', name: 'Definir perfil de cliente ideal', start: '2026-10-05', end: '2026-10-16', dependsOn: [] },
  { id: 'task-02', name: 'Escrever cadência de abordagem', start: '2026-10-19', end: '2026-10-23', dependsOn: ['task-01'] },
  { id: 'task-03', name: 'Treinar o time na cadência', start: '2026-11-02', end: '2026-11-06', dependsOn: ['task-02', 'task-04'] },
  { id: 'task-04', name: 'Revisar cadência com o time', start: '2026-11-09', end: '2026-11-13', dependsOn: ['task-03'] },
  { id: 'task-05', name: 'Montar lista de contas alvo', start: '2026-10-19', end: '2026-10-30', dependsOn: ['task-01'] },
  { id: 'task-06', name: 'Enriquecer cadastro das contas', start: '2026-10-26', end: '2026-11-06', dependsOn: ['task-05'] },
  {
    id: 'task-07',
    name: 'Iniciar prospecção das contas',
    start: '2026-11-16',
    end: '2026-11-27',
    dependsOn: ['task-04', 'task-06'],
  },
];
