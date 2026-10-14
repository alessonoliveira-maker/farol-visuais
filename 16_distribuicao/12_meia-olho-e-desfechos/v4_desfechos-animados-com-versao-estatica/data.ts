/**
 * Receita do trimestre em 50 desfechos do simulador, em reais, um por rodada. Dado fictício e fixo:
 * nenhum valor ou meta corresponde a empresa real.
 *
 * São cinquenta, e não quatrocentos, de propósito: na animação cada desfecho ocupa a tela sozinho
 * por meio segundo, e na versão estática cada um vira um ponto que se conta com o dedo. Com
 * cinquenta, um ponto vale dois por cento, e a pergunta "em quantos desses a meta é batida" tem
 * resposta que se confere olhando.
 *
 * Os casos difíceis estão no próprio sorteio: há valores repetidos, que caem na mesma faixa e se
 * empilham em vez de se cobrir, há um desfecho isolado na ponta de cima e outro na de baixo, e a
 * meta cai perto do meio da distribuição, então a resposta não se adivinha pela forma.
 *
 * Os desfechos saem de um gerador com semente fixa, escrito aqui mesmo: a mesma semente devolve os
 * mesmos cinquenta números em qualquer máquina e em qualquer dia.
 */
export interface Outcome {
  /** Número da rodada do simulador, a partir de 1. */
  readonly run: number;
  /** Receita do trimestre naquela rodada, em reais. */
  readonly revenue: number;
}

/** Meta fictícia de receita do trimestre, em reais. */
export const META = 2_500_000;

/**
 * Domínio fixo do eixo, em reais, cobrindo todos os desfechos. Na animação ele não pode sair do
 * quadro da vez: eixo que se ajusta a cada desfecho faz o ponto parecer parado e a régua, andar.
 */
export const DOMAIN: readonly [number, number] = [1_800_000, 3_400_000];

/** Largura da faixa em que a versão estática empilha os pontos, em reais. A meta é múltipla dela. */
export const BIN = 50_000;

const RUNS = 50;
/** Os desfechos são arredondados para a dezena de milhar, que é a precisão do simulador. */
const STEP = 10_000;
const MEDIAN = 2_360_000;
const SPREAD = 0.11;
const SEED = 51;

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

function simulate(): readonly Outcome[] {
  const next = seededRandom(SEED);
  return Array.from({ length: RUNS }, (_, index) => {
    const first = Math.max(next(), 1e-9);
    const second = next();
    const normal = Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
    return { run: index + 1, revenue: Math.round((MEDIAN * Math.exp(SPREAD * normal)) / STEP) * STEP };
  });
}

export const data: readonly Outcome[] = simulate();
