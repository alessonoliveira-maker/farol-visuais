/**
 * Receita reconhecida no trimestre por executivo, lida contra a meta individual do mesmo
 * trimestre, as duas em reais.
 * Dado fictício e fixo: os nomes vêm da lista inventada do Farol, nenhum é pessoa real.
 */
export interface ExecutiveTarget {
  readonly id: string;
  readonly name: string;
  /** Receita reconhecida no trimestre até a data de corte, em reais. */
  readonly actual: number;
  /** Meta individual do trimestre, em reais; sempre maior que zero nesta versão. */
  readonly target: number;
}

export const data: readonly ExecutiveTarget[] = [
  { id: 'exec-01', name: 'Talita V.', actual: 312_400, target: 400_000 },
  { id: 'exec-02', name: 'Murilo C.', actual: 486_900, target: 450_000 },
  { id: 'exec-03', name: 'Ingrid S.', actual: 198_700, target: 350_000 },
  { id: 'exec-04', name: 'Renan A.', actual: 401_250, target: 420_000 },
  { id: 'exec-05', name: 'Maria Eduarda F.', actual: 264_800, target: 300_000 },
  { id: 'exec-06', name: 'Heitor M.', actual: 143_600, target: 380_000 },
  { id: 'exec-07', name: 'Otavio R.', actual: 57_450, target: 250_000 },
];
