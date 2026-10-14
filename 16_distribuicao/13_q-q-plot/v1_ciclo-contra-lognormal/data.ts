/**
 * Ciclo de fechamento de 120 negócios ganhos em 2026, em dias corridos, um valor por negócio.
 * Dado fictício e fixo: nenhum valor corresponde a negócio real.
 *
 * O miolo é uma lognormal construída por quantis (mediana de 40 dias, desvio de 0,5 no log), com
 * uma variação pequena e fixa por negócio, e a cauda dos 10% mais lentos é esticada de propósito:
 * é ela que o Q-Q precisa mostrar saindo da diagonal. Nada é sorteado, o mesmo código dá a mesma
 * lista em qualquer máquina. A ordem do array é a de cadastro, embaralhada por um passo coprimo com
 * 120, e é de propósito: o Q-Q ordena sozinho, e quem entregasse a lista já ordenada esconderia que
 * essa ordenação é parte da conta.
 */

/** Quantidade de negócios ganhos. */
const DEAL_COUNT = 120;
/** Mediana do ciclo, em dias, antes da variação. */
const MEDIAN_DAYS = 40;
/** Desvio do log do ciclo no miolo. */
const LOG_SIGMA = 0.5;
/** Passo coprimo com 120 que embaralha a posição de cada quantil no array. */
const SHUFFLE_STEP = 37;
/** A partir de quantos desvios o ciclo real passa a se esticar além da lognormal. */
const TAIL_FROM_Z = 1.2;
/** Menor ciclo plausível do funil, em dias. */
const MIN_DAYS = 12;

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

const ordered: number[] = Array.from({ length: DEAL_COUNT }, (_, index) => {
  const z = inverseNormal((index + 0.5) / DEAL_COUNT);
  const stretch = z > TAIL_FROM_Z ? 0.3 * (z - TAIL_FROM_Z) ** 1.3 : 0;
  const log = Math.log(MEDIAN_DAYS) + LOG_SIGMA * z + 0.04 * Math.sin(index * 12.9898 + 78.233) + stretch;
  return Math.max(MIN_DAYS, Math.round(Math.exp(log)));
});

/** Ciclo de fechamento por negócio, em dias, na ordem de cadastro. */
export const data: readonly number[] = ordered.map((_, index) => ordered[(index * SHUFFLE_STEP) % DEAL_COUNT] ?? MIN_DAYS);
