/**
 * Esteira de preparação da meta do ano seguinte: 18 tarefas em três frentes (dados, pré-vendas e
 * mídia), cada uma com o primeiro e o último dia de trabalho (os dois inclusive, sempre em dia útil)
 * e as tarefas que precisam terminar antes. A folga é medida em dias úteis, de segunda a sexta.
 * Dado fictício e fixo: tarefas genéricas, sem pessoa, empresa, marca ou plataforma real.
 * Casos difíceis exercitados: dependência que atravessa frentes, tarefa de três dias, folga de 2 dias
 * úteis ao lado de uma de 10 e fim do plano no último dia útil antes da janela de leitura.
 */
export type Front = 'data' | 'presales' | 'media';

export interface PipelineTask {
  readonly id: string;
  /** Frase comum começada por verbo no infinitivo, sem nome próprio: entra em minúscula no meio de uma oração. */
  readonly name: string;
  readonly front: Front;
  /** Primeiro dia de trabalho planejado, em YYYY-MM-DD. Vale como "não antes de" na conta das datas cedo. */
  readonly start: string;
  /** Último dia de trabalho planejado, em YYYY-MM-DD. Com o início, dá a duração em dias úteis. */
  readonly end: string;
  /** Ids das predecessoras: a tarefa só começa no dia útil seguinte ao fim de todas. Id fora do plano é ignorado. */
  readonly dependsOn: readonly string[];
}

export const data: readonly PipelineTask[] = [
  { id: 'data-01', name: 'Fechar definição das métricas', front: 'data', start: '2026-10-05', end: '2026-10-16', dependsOn: [] },
  { id: 'data-02', name: 'Mapear fontes de receita', front: 'data', start: '2026-10-05', end: '2026-10-09', dependsOn: [] },
  { id: 'data-03', name: 'Integrar base do cadastro', front: 'data', start: '2026-10-19', end: '2026-10-30', dependsOn: ['data-01', 'data-02'] },
  { id: 'data-04', name: 'Validar números com finanças', front: 'data', start: '2026-11-02', end: '2026-11-13', dependsOn: ['data-03'] },
  { id: 'data-05', name: 'Montar painel da meta', front: 'data', start: '2026-11-16', end: '2026-11-27', dependsOn: ['data-04'] },
  { id: 'data-06', name: 'Homologar painel com a diretoria', front: 'data', start: '2026-11-30', end: '2026-12-11', dependsOn: ['data-05'] },
  { id: 'presales-01', name: 'Revisar perfil de cliente ideal', front: 'presales', start: '2026-10-05', end: '2026-10-09', dependsOn: [] },
  { id: 'presales-02', name: 'Redesenhar cadência de contato', front: 'presales', start: '2026-10-12', end: '2026-10-23', dependsOn: ['presales-01'] },
  { id: 'presales-03', name: 'Atualizar roteiro de abordagem', front: 'presales', start: '2026-10-26', end: '2026-10-30', dependsOn: ['presales-02'] },
  { id: 'presales-04', name: 'Treinar o time no novo roteiro', front: 'presales', start: '2026-11-02', end: '2026-11-13', dependsOn: ['presales-03'] },
  { id: 'presales-05', name: 'Rodar piloto com uma carteira', front: 'presales', start: '2026-11-23', end: '2026-12-04', dependsOn: ['presales-04', 'data-04'] },
  { id: 'presales-06', name: 'Ajustar metas por pessoa', front: 'presales', start: '2026-12-07', end: '2026-12-09', dependsOn: ['presales-05', 'data-05'] },
  { id: 'media-01', name: 'Auditar contas e conversões', front: 'media', start: '2026-10-12', end: '2026-10-16', dependsOn: [] },
  { id: 'media-02', name: 'Corrigir rastreamento de leads', front: 'media', start: '2026-10-19', end: '2026-10-30', dependsOn: ['media-01', 'data-01'] },
  { id: 'media-03', name: 'Planejar verba por canal', front: 'media', start: '2026-11-02', end: '2026-11-06', dependsOn: ['media-02'] },
  { id: 'media-04', name: 'Produzir criativos da campanha', front: 'media', start: '2026-11-02', end: '2026-11-13', dependsOn: ['media-02'] },
  { id: 'media-05', name: 'Subir campanhas de teste', front: 'media', start: '2026-11-16', end: '2026-11-27', dependsOn: ['media-03', 'media-04', 'data-04'] },
  { id: 'media-06', name: 'Calibrar lances e orçamento', front: 'media', start: '2026-11-30', end: '2026-12-04', dependsOn: ['media-05'] },
];

/** Ordem das frentes no desenho, de cima para baixo. */
export const frontOrder: readonly Front[] = ['data', 'presales', 'media'];

export const frontLabels: Readonly<Record<Front, string>> = {
  data: 'Dados',
  presales: 'Pré-vendas',
  media: 'Mídia',
};

/** Tarefa em foco: só os conectores dela aparecem. String vazia deixa o plano sem foco e sem conector. */
export const focusId = 'data-04';

/** Janela de leitura da meta, do primeiro ao último dia. */
export const readingStart = '2026-12-14';
export const readingEnd = '2027-01-13';
