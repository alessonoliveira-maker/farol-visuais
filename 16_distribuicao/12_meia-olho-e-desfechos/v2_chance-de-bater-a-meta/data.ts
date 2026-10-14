/**
 * Receita de 2027 simulada em três cenários, em reais, para medir contra uma meta: 400
 * desfechos do simulador por cenário. Dado fictício e fixo: nenhum cenário, valor, meta ou
 * praça corresponde a empresa real.
 *
 * O array guarda o desfecho cru de cada rodada, e não a mediana e os intervalos já calculados. O
 * resumo é derivado no componente porque a forma, o ponto e os dois intervalos precisam sair da
 * mesma amostra: intervalo digitado ao lado de uma densidade calculada diverge no primeiro ajuste.
 *
 * Os desfechos saem de um gerador com semente fixa, escrito aqui mesmo: a mesma semente devolve os
 * mesmos 400 números em qualquer máquina e em qualquer dia. Os três cenários cobrem os três casos
 * da leitura contra a meta: no conservador quase nenhum desfecho passa dela, e a parte preenchida da
 * forma é um fio que só o texto sustenta; no base passa pouco mais de um terço; e no de expansão
 * passa a maioria, com o nome longo e a cauda comprida à direita.
 */

/** Meta fictícia de receita de 2027, em reais. */
export const META = 10_000_000;

/**
 * Domínio do eixo, em reais, igual para todos os cenários. É calculado por quem monta a página,
 * sobre todos os cenários que ela compara, e entra por prop: domínio por cenário faria a mesma meta
 * cair em posições diferentes de um cartão para o outro.
 */
export const DOMAIN: readonly [number, number] = [6_000_000, 19_000_000];

export interface Scenario {
  readonly id: string;
  /** Nome de tela do cenário, com inicial maiúscula. */
  readonly name: string;
  /** O mesmo cenário dentro de uma oração, em minúsculas e com a preposição que a frase pede. */
  readonly phrase: string;
  /** Receita de 2027 em reais, um valor por rodada do simulador. */
  readonly outcomes: readonly number[];
}

/** Rodadas do simulador por cenário. */
const RUNS = 400;
/** Os desfechos são arredondados para a dezena de milhar, que é a precisão do simulador. */
const STEP = 10_000;

/** Gerador de 32 bits com semente fixa: o sorteio é reproduzível, e não depende de relógio. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Desfechos de distribuição log-normal em torno da mediana pedida, com a dispersão pedida. */
function simulate(seed: number, median: number, spread: number): readonly number[] {
  const next = seededRandom(seed);
  return Array.from({ length: RUNS }, () => {
    const first = Math.max(next(), 1e-9);
    const second = next();
    const normal = Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
    return Math.round((median * Math.exp(spread * normal)) / STEP) * STEP;
  });
}

export const data: readonly Scenario[] = [
  {
    id: 'conservador',
    name: 'Conservador',
    phrase: 'no cenário conservador',
    outcomes: simulate(11, 8_300_000, 0.08),
  },
  {
    id: 'base',
    name: 'Base',
    phrase: 'no cenário base',
    outcomes: simulate(23, 9_640_000, 0.1),
  },
  {
    id: 'expansao',
    name: 'Expansão com praça nova',
    phrase: 'no cenário de expansão com praça nova',
    outcomes: simulate(37, 11_600_000, 0.15),
  },
];
