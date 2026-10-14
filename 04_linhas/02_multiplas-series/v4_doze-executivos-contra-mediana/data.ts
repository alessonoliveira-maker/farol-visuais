/**
 * Receita reconhecida mensal de 12 executivos, em reais, de 2026-01 a 2026-08.
 * Dado fictício e fixo: nenhum é pessoa real. Valores por executivo em `values`, chaveados
 * pelo `id` de `executives`.
 */
export interface Executive {
  readonly id: string;
  readonly name: string;
}

export const executives: readonly Executive[] = [
  { id: 'exec-01', name: 'Débora F.' },
  { id: 'exec-02', name: 'Vinícius P.' },
  { id: 'exec-03', name: 'Camila R.' },
  { id: 'exec-04', name: 'Fábio N.' },
  { id: 'exec-05', name: 'Juliana T.' },
  { id: 'exec-06', name: 'Ricardo L.' },
  { id: 'exec-07', name: 'Bianca S.' },
  { id: 'exec-08', name: 'Eduardo M.' },
  { id: 'exec-09', name: 'Patrícia G.' },
  { id: 'exec-10', name: 'Rodrigo A.' },
  { id: 'exec-11', name: 'Larissa K.' },
  { id: 'exec-12', name: 'Thiago B.' },
];

export interface MonthlyRevenueRow {
  readonly month: string;
  readonly values: Readonly<Record<string, number>>;
}

export const data: readonly MonthlyRevenueRow[] = [
  { month: '2026-01', values: { 'exec-01': 180_000, 'exec-02': 210_000, 'exec-03': 140_000, 'exec-04': 260_000, 'exec-05': 95_000, 'exec-06': 305_000, 'exec-07': 175_000, 'exec-08': 220_000, 'exec-09': 130_000, 'exec-10': 340_000, 'exec-11': 110_000, 'exec-12': 250_000 } },
  { month: '2026-02', values: { 'exec-01': 183_000, 'exec-02': 206_000, 'exec-03': 154_000, 'exec-04': 258_000, 'exec-05': 97_500, 'exec-06': 306_000, 'exec-07': 175_500, 'exec-08': 214_000, 'exec-09': 136_000, 'exec-10': 337_000, 'exec-11': 111_500, 'exec-12': 250_500 } },
  { month: '2026-03', values: { 'exec-01': 186_000, 'exec-02': 202_000, 'exec-03': 168_000, 'exec-04': 256_000, 'exec-05': 100_000, 'exec-06': 307_000, 'exec-07': 176_000, 'exec-08': 208_000, 'exec-09': 142_000, 'exec-10': 334_000, 'exec-11': 113_000, 'exec-12': 251_000 } },
  { month: '2026-04', values: { 'exec-01': 189_000, 'exec-02': 198_000, 'exec-03': 182_000, 'exec-04': 254_000, 'exec-05': 102_500, 'exec-06': 308_000, 'exec-07': 176_500, 'exec-08': 202_000, 'exec-09': 148_000, 'exec-10': 331_000, 'exec-11': 114_500, 'exec-12': 251_500 } },
  { month: '2026-05', values: { 'exec-01': 192_000, 'exec-02': 194_000, 'exec-03': 196_000, 'exec-04': 252_000, 'exec-05': 105_000, 'exec-06': 309_000, 'exec-07': 177_000, 'exec-08': 196_000, 'exec-09': 154_000, 'exec-10': 328_000, 'exec-11': 116_000, 'exec-12': 252_000 } },
  { month: '2026-06', values: { 'exec-01': 195_000, 'exec-02': 190_000, 'exec-03': 210_000, 'exec-04': 250_000, 'exec-05': 107_500, 'exec-06': 310_000, 'exec-07': 177_500, 'exec-08': 190_000, 'exec-09': 160_000, 'exec-10': 325_000, 'exec-11': 117_500, 'exec-12': 252_500 } },
  { month: '2026-07', values: { 'exec-01': 198_000, 'exec-02': 186_000, 'exec-03': 224_000, 'exec-04': 248_000, 'exec-05': 110_000, 'exec-06': 311_000, 'exec-07': 178_000, 'exec-08': 184_000, 'exec-09': 166_000, 'exec-10': 322_000, 'exec-11': 119_000, 'exec-12': 253_000 } },
  { month: '2026-08', values: { 'exec-01': 201_000, 'exec-02': 182_000, 'exec-03': 238_000, 'exec-04': 246_000, 'exec-05': 112_500, 'exec-06': 312_000, 'exec-07': 178_500, 'exec-08': 178_000, 'exec-09': 172_000, 'exec-10': 319_000, 'exec-11': 120_500, 'exec-12': 253_500 } },
];

/** O executivo em destaque; os demais ficam neutros e a mediana do grupo é a segunda referência. */
export const highlightId = 'exec-03';
