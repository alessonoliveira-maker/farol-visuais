/**
 * Dias que cada oportunidade aberta está parada na etapa em que se encontra, no momento da extração.
 * Dado fictício, determinístico, sem nenhuma correspondência com a base real.
 *
 * São 1.900 oportunidades, e por isso os valores nascem de um gerador com semente fixa em vez de
 * virem digitados um a um. A semente é o que torna o dado FIXO: o mesmo arquivo produz a mesma lista
 * em qualquer máquina e em qualquer dia, então o `preview.svg` continua sendo o retrato do
 * componente. Nada de `Math.random` nem de relógio.
 *
 * A forma é assimétrica à direita e LIMITADA por construção, com o valor entre `low` e `high`: assim
 * os únicos casos fora do domínio do eixo são os declarados em `BEYOND_DOMAIN`, e não uma surpresa da
 * cauda do gerador. Ser assimétrica é o ponto da peça: a mediana de dias parados é pequena em toda
 * etapa e a cauda é longa em todas elas, que é exatamente o que uma média esconderia.
 *
 * O código da oportunidade nasce aqui, não no desenho: parado sem nome é estatística, parado com nome
 * é fila de trabalho, e o código é o que o drill abre.
 */

export interface Opportunity {
  /** Código fictício da oportunidade, o que o drill abriria. */
  readonly id: string;
  /** Dias parados na etapa atual. */
  readonly days: number;
}

export interface FunnelStage {
  readonly id: string;
  readonly name: string;
  readonly opportunities: readonly Opportunity[];
}

/** Limiar de oportunidade parada, em dias. Acima dele a oportunidade entra na fila de revisão. */
export const STALLED_DAYS = 30;

/**
 * Teto do eixo, em dias, vindo da régua da operação e não do maior valor da amostra. Caso acima dele
 * não estica o eixo: vira marcador na borda com o valor escrito, porque um único caso de 412 dias
 * comprimiria as oito caixas em menos de metade da largura útil.
 */
export const DOMAIN_MAX = 180;

/**
 * Gerador congruente linear com semente fixa. Devolve fração em [0, 1).
 *
 * Existe para o dado de 1.900 linhas caber no arquivo sem deixar de ser fixo. A constante é a do
 * Numerical Recipes, escolhida por ser reprodutível em qualquer motor de JavaScript.
 */
function lcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Amostra assimétrica à direita entre `low` e `high`, com o expoente controlando a concentração perto
 * de `low`. Expoente maior aproxima a mediana do piso e alonga a cauda.
 */
function stage(
  id: string,
  name: string,
  codePrefix: number,
  seed: number,
  count: number,
  low: number,
  high: number,
  power: number,
): FunnelStage {
  const next = lcg(seed);
  const opportunities: Opportunity[] = [];
  for (let index = 0; index < count; index += 1) {
    const days = Math.round(low + (high - low) * Math.pow(next(), power));
    opportunities.push({ id: `OP ${String(codePrefix + index)}`, days });
  }
  return { id, name, opportunities };
}

/**
 * Casos além do teto do eixo, declarados um a um em vez de sorteados.
 *
 * Eles existem porque o comportamento do desenho na borda precisa de um caso para exercitar, e
 * porque o número tem de estar escrito: marcador na borda sem valor ao lado seria uma seta muda.
 */
export interface BeyondDomain {
  readonly stageId: string;
  readonly id: string;
  readonly days: number;
}

export const BEYOND_DOMAIN: readonly BeyondDomain[] = [
  { stageId: 'aprovacao-interna', id: 'OP 10482', days: 412 },
  { stageId: 'negociacao', id: 'OP 10731', days: 206 },
];

/**
 * Oportunidades abertas sem data de entrada na etapa atual, por falha de preenchimento. Não têm dias
 * parados medidos, então não viram zero nem entram na caixa: são contadas no rodapé. Contá-las como
 * zero dia faria a etapa com pior cadastro parecer a etapa mais fresca do funil.
 */
export const WITHOUT_STAGE_DATE = 78;

/**
 * Os casos além do teto entram na lista de oportunidades da própria etapa, como qualquer outra: o n, a
 * caixa e a taxa acima do limiar os contam, e o componente deriva o marcador de borda do dado
 * (dias acima do teto), sem ler `BEYOND_DOMAIN`.
 */
function withBeyond(item: FunnelStage): FunnelStage {
  const extras = BEYOND_DOMAIN.filter((beyond) => beyond.stageId === item.id).map((beyond) => ({
    id: beyond.id,
    days: beyond.days,
  }));
  return { ...item, opportunities: [...item.opportunities, ...extras] };
}

/* Negociação e Aprovação interna geram uma oportunidade a menos: o caso de borda de cada uma entra no
   lugar e o total segue em 1.900. */
export const data: readonly FunnelStage[] = [
  stage('triagem', 'Triagem', 20000, 20260101, 520, 1, 45, 3.0),
  stage('qualificacao', 'Qualificação', 21000, 20260202, 410, 1, 60, 3.2),
  stage('diagnostico', 'Diagnóstico', 22000, 20260303, 285, 2, 85, 3.0),
  stage('proposta', 'Proposta enviada', 23000, 20260404, 210, 2, 110, 2.8),
  stage('negociacao', 'Negociação', 24000, 20260505, 169, 4, 130, 2.3),
  stage('aprovacao-interna', 'Aprovação interna', 25000, 20260606, 134, 5, 170, 2.2),
  stage('contrato', 'Contrato', 26000, 20260707, 105, 2, 120, 2.5),
  stage('assinatura', 'Assinatura', 27000, 20260808, 65, 1, 70, 3.4),
].map(withBeyond);
