/**
 * Agendas realizadas por mês e por UF, de jan/26 a ago/26, em contagem. Dado fictício e fixo.
 * Exercita a escala própria: SP chega a 655 agendas por mês e RR a 2, mais de 300 vezes menos, então
 * só uma escala por tile deixa ver a forma das pequenas. Há meses sem medição (PI em fev/26, TO em
 * fev/26 e abr/26, `null`), um ponto isolado entre dois vazios (TO em mar/26), uma UF com um único
 * mês medido (RR) e uma UF sem nenhum mês medido (AP, toda `null`). Mês sem medição não é zero.
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface GridPosition {
  readonly row: number;
  readonly column: number;
}

/**
 * Grade de 7 colunas por 6 linhas, desenhada à mão para este catálogo; NÃO é a br_states_grid1 do
 * geofacet, que não foi verificada em fonte pública. Norte no alto e Sul na base; litoral do Nordeste
 * na coluna da direita, de RN a AL; DF encostado em GO e em MG; MS entre MT e PR; ES à direita de MG.
 * É a mesma vizinhança do modelo 23/01, sem a coluna vazia da esquerda.
 */
export const GRID_COLUMNS = 7;
export const GRID_ROWS = 6;
export const UF_GRID: Readonly<Record<UfCode, GridPosition>> = {
  RR: { row: 1, column: 2 }, AP: { row: 1, column: 3 },
  AM: { row: 2, column: 2 }, PA: { row: 2, column: 3 }, MA: { row: 2, column: 4 },
  PI: { row: 2, column: 5 }, CE: { row: 2, column: 6 }, RN: { row: 2, column: 7 },
  AC: { row: 3, column: 1 }, RO: { row: 3, column: 2 }, MT: { row: 3, column: 3 },
  TO: { row: 3, column: 4 }, BA: { row: 3, column: 5 }, PE: { row: 3, column: 6 },
  PB: { row: 3, column: 7 },
  MS: { row: 4, column: 3 }, GO: { row: 4, column: 4 }, DF: { row: 4, column: 5 },
  SE: { row: 4, column: 6 }, AL: { row: 4, column: 7 },
  PR: { row: 5, column: 3 }, SP: { row: 5, column: 4 }, MG: { row: 5, column: 5 },
  ES: { row: 5, column: 6 },
  RS: { row: 6, column: 2 }, SC: { row: 6, column: 3 }, RJ: { row: 6, column: 5 },
};

export const MONTHS: readonly string[] = [
  '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08',
];

export interface UfAppointmentSeries {
  readonly uf: UfCode;
  readonly name: string;
  /** Um valor por mês de MONTHS, na mesma ordem. `null` é mês sem medição; 0 é zero medido. */
  readonly appointments: readonly (number | null)[];
}

export const data: readonly UfAppointmentSeries[] = [
  { uf: 'AC', name: 'Acre', appointments: [4, 4, 5, 4, 5, 5, 6, 5] },
  { uf: 'AL', name: 'Alagoas', appointments: [12, 12, 13, 13, 14, 14, 15, 15] },
  { uf: 'AP', name: 'Amapá', appointments: [null, null, null, null, null, null, null, null] },
  { uf: 'AM', name: 'Amazonas', appointments: [30, 31, 32, 32, 33, 34, 34, 35] },
  { uf: 'BA', name: 'Bahia', appointments: [100, 104, 108, 112, 118, 120, 126, 130] },
  { uf: 'CE', name: 'Ceará', appointments: [66, 68, 70, 72, 74, 76, 78, 80] },
  { uf: 'DF', name: 'Distrito Federal', appointments: [80, 82, 86, 88, 90, 92, 95, 98] },
  { uf: 'ES', name: 'Espírito Santo', appointments: [52, 54, 56, 58, 60, 61, 62, 64] },
  { uf: 'GO', name: 'Goiás', appointments: [90, 92, 95, 96, 100, 104, 108, 110] },
  { uf: 'MA', name: 'Maranhão', appointments: [24, 25, 25, 26, 27, 27, 28, 28] },
  { uf: 'MT', name: 'Mato Grosso', appointments: [48, 50, 52, 53, 55, 56, 58, 60] },
  { uf: 'MS', name: 'Mato Grosso do Sul', appointments: [40, 41, 42, 44, 45, 46, 47, 48] },
  { uf: 'MG', name: 'Minas Gerais', appointments: [210, 220, 226, 240, 251, 260, 268, 280] },
  { uf: 'PA', name: 'Pará', appointments: [36, 36, 37, 38, 38, 39, 40, 40] },
  { uf: 'PB', name: 'Paraíba', appointments: [18, 18, 19, 20, 20, 21, 21, 22] },
  { uf: 'PR', name: 'Paraná', appointments: [150, 158, 166, 172, 181, 190, 198, 208] },
  { uf: 'PE', name: 'Pernambuco', appointments: [70, 72, 72, 76, 78, 80, 82, 84] },
  { uf: 'PI', name: 'Piauí', appointments: [6, null, 7, 7, 8, 8, 9, 9] },
  { uf: 'RJ', name: 'Rio de Janeiro', appointments: [180, 190, 185, 200, 214, 226, 232, 240] },
  { uf: 'RN', name: 'Rio Grande do Norte', appointments: [14, 15, 15, 16, 16, 17, 17, 18] },
  { uf: 'RS', name: 'Rio Grande do Sul', appointments: [140, 142, 150, 155, 158, 166, 170, 176] },
  { uf: 'RO', name: 'Rondônia', appointments: [8, 9, 9, 10, 10, 10, 11, 11] },
  { uf: 'RR', name: 'Roraima', appointments: [null, null, null, 2, null, null, null, null] },
  { uf: 'SC', name: 'Santa Catarina', appointments: [120, 128, 135, 142, 150, 158, 165, 172] },
  { uf: 'SP', name: 'São Paulo', appointments: [520, 548, 575, 590, 610, 628, 640, 655] },
  { uf: 'SE', name: 'Sergipe', appointments: [5, 5, 6, 6, 6, 7, 7, 7] },
  { uf: 'TO', name: 'Tocantins', appointments: [3, null, 5, null, 4, 4, 5, 6] },
];
