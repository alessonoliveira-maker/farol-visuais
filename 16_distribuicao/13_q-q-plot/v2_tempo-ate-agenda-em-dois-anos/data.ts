/**
 * Tempo até a agenda, em dias corridos, de cada reunião marcada a partir de um lead qualificado,
 * em dois anos de tamanhos diferentes: 140 reuniões em 2025 e 95 em 2026. Dado fictício e fixo:
 * nenhum valor corresponde a lead ou reunião real.
 *
 * Os dois anos são lognormais por quantis, com a mesma mediana de 6 dias e o mesmo desvio no miolo
 * (0,5 no log). Em 2026 só a metade superior se estica, e é isso que o Q-Q de duas amostras precisa
 * separar de um simples deslocamento. Nada é sorteado: o mesmo código dá a mesma lista em qualquer
 * máquina. A ordem dos arrays é a de cadastro, embaralhada por um passo coprimo, e é de propósito:
 * o Q-Q ordena sozinho, e lista já ordenada esconderia que essa ordenação é parte da conta.
 */

export interface TimeToScheduleSamples {
  /** Ano de comparação: um valor por reunião, na ordem de cadastro. */
  readonly previous: readonly number[];
  /** Ano medido: um valor por reunião, na ordem de cadastro. */
  readonly current: readonly number[];
}

const PREVIOUS_COUNT = 140;
const CURRENT_COUNT = 95;
/** Mediana dos dois anos, em dias, antes da variação. */
const MEDIAN_DAYS = 6;
/** Desvio do log do tempo no miolo. */
const LOG_SIGMA = 0.5;
/** Acima deste desvio, só 2026 se estica; abaixo dele os dois anos são a mesma lognormal. */
const STRETCH_FROM_Z = 0.5;
/** Quanto 2026 se estica por desvio acima do limite, no log. */
const STRETCH_SLOPE = 0.3;
/** Passos coprimos com 140 e com 95 que embaralham a posição de cada quantil. */
const PREVIOUS_STEP = 33;
const CURRENT_STEP = 29;

/** Inverso da normal padrão (Acklam), só para gerar o dado fictício por quantis. */
function inverseNormal(p: number): number {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const tail = (q: number): number =>
    (((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q + c[5]!) /
    ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1);
  if (p < 0.02425) return tail(Math.sqrt(-2 * Math.log(p)));
  if (p > 1 - 0.02425) return -tail(Math.sqrt(-2 * Math.log(1 - p)));
  const q = p - 0.5;
  const r = q * q;
  return (
    ((((((a[0]! * r + a[1]!) * r + a[2]!) * r + a[3]!) * r + a[4]!) * r + a[5]!) * q) /
    (((((b[0]! * r + b[1]!) * r + b[2]!) * r + b[3]!) * r + b[4]!) * r + 1)
  );
}


function build(count: number, step: number, stretch: boolean, seed: number): readonly number[] {
  const ordered = Array.from({ length: count }, (_, index) => {
    const z = inverseNormal((index + 0.5) / count);
    const extra = stretch && z > STRETCH_FROM_Z ? STRETCH_SLOPE * (z - STRETCH_FROM_Z) : 0;
    const log = Math.log(MEDIAN_DAYS) + LOG_SIGMA * z + 0.05 * Math.sin(index * 12.9898 + seed) + extra;
    return Math.max(1, Math.round(Math.exp(log)));
  });
  return ordered.map((_, index) => ordered[(index * step) % count] ?? 1);
}

export const data: TimeToScheduleSamples = {
  previous: build(PREVIOUS_COUNT, PREVIOUS_STEP, false, 2),
  current: build(CURRENT_COUNT, CURRENT_STEP, true, 5),
};
