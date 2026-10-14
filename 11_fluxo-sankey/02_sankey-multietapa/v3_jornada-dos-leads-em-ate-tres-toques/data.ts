/**
 * Jornada de 318 leads qualificados de um mês, em contagem de leads, desenrolada por passo de
 * contato. Dado fictício e fixo: nenhum canal, lead ou contagem corresponde a caso real.
 *
 * O NÓ É O PAR CANAL E PASSO, não o canal. `name` é único porque carrega o passo, e `label` é o que
 * a tela escreve. É isso que deixa o mesmo canal aparecer em passos seguidos sem formar laço: p2 e
 * p3 de Evento são dois nós diferentes, então "Evento depois de Evento" é uma ligação comum, para a
 * frente, e não um ciclo que o Sankey não sabe desenhar.
 *
 * AS DUAS FORMAS DE SAIR CEDO DA JORNADA, e a diferença entre elas é de LEITURA, não de dado:
 *   1. Quem qualifica no 1º TOQUE pula DUAS colunas, do passo 1 direto ao desfecho. São as três
 *      ligações com `source` no passo 1 e `target` em Qualificado, 99 leads no total, e é essa
 *      ligação que o componente leva ao corredor de baixo.
 *   2. Quem qualifica no 2º toque pularia UMA coluna só, e para esse caso o dado traz um nó de
 *      passagem, "Sem 3º toque", na coluna do passo 3. Uma coluna de distância cabe numa curva
 *      comum, e o nó de passagem ainda deixa a conservação visível DENTRO da coluna, o que um
 *      salto não deixa: por isso as duas saídas são desenhadas de formas diferentes.
 *
 * Conservação conferida linha a linha, porque o Sankey do Recharts toma o valor do nó como o maior
 * entre entradas e saídas e não reclama de nó desequilibrado (armadilha REC-33):
 *   passo 1   68 + 96 + 54 + 56 + 44                   = 318 entram
 *   saem do passo 1   99 pelo corredor  +  219 para o passo 2
 *   passo 2   80 + 43 + 96                             = 219
 *   passo 3   24 + 38 + 53 + 104 (sem 3º toque)        = 219
 *   desfecho  99 + 219                                 = 318
 */
export interface JourneyNode {
  /** Identificador único do par canal e passo; não aparece na tela. */
  readonly name: string;
  /** O que a tela escreve: o nome do canal, a passagem, ou o desfecho. */
  readonly label: string;
  /** Rótulo da coluna a que o nó pertence, escrito uma vez no topo da coluna. */
  readonly step: string;
  /** Papel do nó: ponto de contato, passagem sem novo toque, ou desfecho da jornada. */
  readonly role: 'touch' | 'carry' | 'outcome';
  /** Verdadeiro nos dois nós do trecho mais pesado da jornada, que acende em `--chart-1`. */
  readonly accent: boolean;
}

export interface JourneyLink {
  readonly source: number;
  readonly target: number;
  /** Contagem de leads. */
  readonly value: number;
  /** Verdadeiro na ligação do trecho mais pesado. */
  readonly accent: boolean;
}

export interface JourneyData {
  readonly nodes: readonly JourneyNode[];
  readonly links: readonly JourneyLink[];
}

export const data: JourneyData = {
  nodes: [
    { name: 'p1-midia-social', label: 'Mídia social', step: 'Passo 1', role: 'touch', accent: false },
    { name: 'p1-busca-paga', label: 'Busca paga', step: 'Passo 1', role: 'touch', accent: true },
    { name: 'p1-rede-profissional', label: 'Rede profissional', step: 'Passo 1', role: 'touch', accent: false },
    { name: 'p1-organico', label: 'Orgânico', step: 'Passo 1', role: 'touch', accent: false },
    { name: 'p1-evento', label: 'Evento', step: 'Passo 1', role: 'touch', accent: false },
    { name: 'p2-busca-paga', label: 'Busca paga', step: 'Passo 2', role: 'touch', accent: false },
    { name: 'p2-rede-profissional', label: 'Rede profissional', step: 'Passo 2', role: 'touch', accent: false },
    { name: 'p2-evento', label: 'Evento', step: 'Passo 2', role: 'touch', accent: true },
    { name: 'p3-busca-paga', label: 'Busca paga', step: 'Passo 3', role: 'touch', accent: false },
    { name: 'p3-rede-profissional', label: 'Rede profissional', step: 'Passo 3', role: 'touch', accent: false },
    { name: 'p3-evento', label: 'Evento', step: 'Passo 3', role: 'touch', accent: false },
    { name: 'p3-sem-toque', label: 'Sem 3º toque', step: 'Passo 3', role: 'carry', accent: false },
    { name: 'desfecho-qualificado', label: 'Qualificado', step: 'Desfecho', role: 'outcome', accent: false },
  ],
  links: [
    { source: 0, target: 12, value: 30, accent: false },
    { source: 0, target: 5, value: 38, accent: false },
    { source: 1, target: 12, value: 38, accent: false },
    { source: 1, target: 7, value: 40, accent: true },
    { source: 1, target: 6, value: 18, accent: false },
    { source: 2, target: 7, value: 30, accent: false },
    { source: 2, target: 5, value: 24, accent: false },
    { source: 3, target: 12, value: 31, accent: false },
    { source: 3, target: 6, value: 25, accent: false },
    { source: 4, target: 7, value: 26, accent: false },
    { source: 4, target: 5, value: 18, accent: false },
    { source: 5, target: 10, value: 28, accent: false },
    { source: 5, target: 9, value: 20, accent: false },
    { source: 5, target: 11, value: 32, accent: false },
    { source: 6, target: 10, value: 25, accent: false },
    { source: 6, target: 11, value: 18, accent: false },
    { source: 7, target: 8, value: 24, accent: false },
    { source: 7, target: 9, value: 18, accent: false },
    { source: 7, target: 11, value: 54, accent: false },
    { source: 8, target: 12, value: 24, accent: false },
    { source: 9, target: 12, value: 38, accent: false },
    { source: 10, target: 12, value: 53, accent: false },
    { source: 11, target: 12, value: 104, accent: false },
  ],
};
