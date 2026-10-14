/**
 * Leads recebidos por mês e por UF, de jan/26 a ago/26, em contagem. Dado fictício e fixo.
 * Exercita o caso difícil da escala compartilhada: SP chega a 1.840 por mês e RR a 24, então as UFs
 * pequenas desenham uma linha quase rente à base. Há um zero medido (RR em fev/26), um mês sem coleta
 * (TO em mar/26, `null`) e uma UF sem nenhum mês medido (AP, toda `null`). Zero e ausência são coisas
 * diferentes: zero é leitura, `null` é lacuna.
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

export interface UfLeadsSeries {
  readonly uf: UfCode;
  readonly name: string;
  /** Um valor por mês de MONTHS, na mesma ordem. `null` é mês sem coleta; 0 é zero medido. */
  readonly leads: readonly (number | null)[];
}

export const data: readonly UfLeadsSeries[] = [
  { uf: 'AC', name: 'Acre', leads: [40, 41, 42, 44, 45, 46, 47, 48] },
  { uf: 'AL', name: 'Alagoas', leads: [90, 95, 100, 105, 110, 115, 118, 118] },
  { uf: 'AP', name: 'Amapá', leads: [null, null, null, null, null, null, null, null] },
  { uf: 'AM', name: 'Amazonas', leads: [170, 175, 180, 190, 195, 200, 205, 210] },
  { uf: 'BA', name: 'Bahia', leads: [520, 540, 560, 570, 590, 610, 630, 640] },
  { uf: 'CE', name: 'Ceará', leads: [330, 350, 360, 380, 390, 400, 410, 420] },
  { uf: 'DF', name: 'Distrito Federal', leads: [330, 340, 350, 350, 360, 370, 370, 380] },
  { uf: 'ES', name: 'Espírito Santo', leads: [200, 210, 220, 230, 240, 250, 260, 260] },
  { uf: 'GO', name: 'Goiás', leads: [400, 410, 420, 430, 430, 440, 450, 450] },
  { uf: 'MA', name: 'Maranhão', leads: [170, 175, 180, 180, 185, 185, 190, 190] },
  { uf: 'MT', name: 'Mato Grosso', leads: [220, 240, 250, 270, 280, 290, 300, 300] },
  { uf: 'MS', name: 'Mato Grosso do Sul', leads: [190, 200, 200, 210, 220, 220, 230, 230] },
  { uf: 'MG', name: 'Minas Gerais', leads: [780, 800, 830, 860, 880, 910, 960, 1020] },
  { uf: 'PA', name: 'Pará', leads: [260, 270, 270, 275, 280, 280, 280, 280] },
  { uf: 'PB', name: 'Paraíba', leads: [120, 130, 135, 140, 140, 145, 150, 150] },
  { uf: 'PR', name: 'Paraná', leads: [520, 560, 600, 640, 700, 730, 760, 780] },
  { uf: 'PE', name: 'Pernambuco', leads: [340, 350, 360, 370, 380, 380, 390, 390] },
  { uf: 'PI', name: 'Piauí', leads: [80, 85, 85, 90, 90, 95, 96, 96] },
  { uf: 'RJ', name: 'Rio de Janeiro', leads: [700, 690, 720, 760, 800, 830, 880, 910] },
  { uf: 'RN', name: 'Rio Grande do Norte', leads: [100, 105, 110, 110, 115, 115, 120, 120] },
  { uf: 'RS', name: 'Rio Grande do Sul', leads: [560, 570, 600, 640, 670, 690, 700, 720] },
  { uf: 'RO', name: 'Rondônia', leads: [70, 72, 75, 80, 80, 85, 86, 88] },
  { uf: 'RR', name: 'Roraima', leads: [20, 0, 18, 22, 23, 24, 24, 24] },
  { uf: 'SC', name: 'Santa Catarina', leads: [420, 450, 490, 530, 570, 600, 630, 650] },
  { uf: 'SP', name: 'São Paulo', leads: [1450, 1520, 1580, 1640, 1710, 1760, 1800, 1840] },
  { uf: 'SE', name: 'Sergipe', leads: [70, 72, 74, 76, 78, 80, 82, 84] },
  { uf: 'TO', name: 'Tocantins', leads: [60, 62, null, 66, 68, 70, 70, 72] },
];
