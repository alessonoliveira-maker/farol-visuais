/**
 * Atingimento de meta do trimestre de 96 executivos de vendas, como fração da meta (1,00 é 100%),
 * truncado em 1,50 porque o sistema de origem não registra mais que isso. Dado fictício e fixo:
 * nenhum valor corresponde a pessoa real.
 *
 * O miolo é uma normal por quantis (mediana 0,98, desvio 0,30) com uma variação pequena e fixa por
 * executivo; da metade superior para cima o atingimento se estica um pouco, e o que passa de 1,50
 * é gravado como 1,50, o que forma o patamar que o Q-Q precisa mostrar. O executivo de menor
 * atingimento fechou o trimestre em zero, medido, e fica no dado como zero. Nada é sorteado: o
 * mesmo código dá a mesma lista em qualquer máquina. A ordem do array é a de cadastro, embaralhada
 * por um passo coprimo com 96, e é de propósito: o Q-Q ordena sozinho.
 */

const COUNT = 96;
const MEDIAN = 0.98;
const SIGMA = 0.3;
/** Acima deste desvio o atingimento se estica, e é daí que vêm os casos no teto. */
const STRETCH_FROM_Z = 0.8;
const STRETCH_SLOPE = 0.3;
/** Teto do sistema de origem: nada acima disso é registrado. */
const CEILING = 1.5;
/** Passo coprimo com 96 que embaralha a posição de cada quantil no array. */
const SHUFFLE_STEP = 35;

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


const ordered: number[] = Array.from({ length: COUNT }, (_, index) => {
  const z = inverseNormal((index + 0.5) / COUNT);
  const extra = z > STRETCH_FROM_Z ? STRETCH_SLOPE * (z - STRETCH_FROM_Z) : 0;
  const raw = MEDIAN + SIGMA * z + extra + 0.015 * Math.sin(index * 12.9898 + 3 * 78.233);
  return Math.min(CEILING, Math.max(0, Math.round(raw * 100) / 100));
});
/** O executivo de menor atingimento não vendeu no trimestre: zero medido, e não ausência. */
ordered[0] = 0;

/** Atingimento da meta por executivo, em fração, na ordem de cadastro. */
export const data: readonly number[] = ordered.map((_, index) => ordered[(index * SHUFFLE_STEP) % COUNT] ?? 0);
