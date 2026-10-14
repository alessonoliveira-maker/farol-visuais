/**
 * Entradas de leads por semana ISO, contagem inteira, semanas 14 a 33 (abril a agosto).
 * Formato longo: uma linha por ano e semana; a faixa de mínimo e máximo de 2023 a 2025 e a linha
 * de 2026 são calculadas no Chart.tsx. 2026 só está medido até a semana 27; da 28 em diante ainda
 * não existe e por isso nem entra aqui. Dado fictício e fixo.
 */
export interface WeeklyLeadRecord {
  readonly year: 2023 | 2024 | 2025 | 2026;
  readonly isoWeek: number;
  readonly leads: number;
}

export const data: readonly WeeklyLeadRecord[] = [
  { year: 2023, isoWeek: 14, leads: 180 }, { year: 2023, isoWeek: 15, leads: 185 },
  { year: 2023, isoWeek: 16, leads: 188 }, { year: 2023, isoWeek: 17, leads: 190 },
  { year: 2023, isoWeek: 18, leads: 195 }, { year: 2023, isoWeek: 19, leads: 198 },
  { year: 2023, isoWeek: 20, leads: 193 }, { year: 2023, isoWeek: 21, leads: 189 },
  { year: 2023, isoWeek: 22, leads: 182 }, { year: 2023, isoWeek: 23, leads: 178 },
  { year: 2023, isoWeek: 24, leads: 175 }, { year: 2023, isoWeek: 25, leads: 180 },
  { year: 2023, isoWeek: 26, leads: 186 }, { year: 2023, isoWeek: 27, leads: 192 },
  { year: 2023, isoWeek: 28, leads: 196 }, { year: 2023, isoWeek: 29, leads: 199 },
  { year: 2023, isoWeek: 30, leads: 194 }, { year: 2023, isoWeek: 31, leads: 188 },
  { year: 2023, isoWeek: 32, leads: 183 }, { year: 2023, isoWeek: 33, leads: 179 },
  { year: 2024, isoWeek: 14, leads: 200 }, { year: 2024, isoWeek: 15, leads: 205 },
  { year: 2024, isoWeek: 16, leads: 210 }, { year: 2024, isoWeek: 17, leads: 208 },
  { year: 2024, isoWeek: 18, leads: 204 }, { year: 2024, isoWeek: 19, leads: 199 },
  { year: 2024, isoWeek: 20, leads: 195 }, { year: 2024, isoWeek: 21, leads: 190 },
  { year: 2024, isoWeek: 22, leads: 186 }, { year: 2024, isoWeek: 23, leads: 183 },
  { year: 2024, isoWeek: 24, leads: 180 }, { year: 2024, isoWeek: 25, leads: 185 },
  { year: 2024, isoWeek: 26, leads: 190 }, { year: 2024, isoWeek: 27, leads: 197 },
  { year: 2024, isoWeek: 28, leads: 203 }, { year: 2024, isoWeek: 29, leads: 210 },
  { year: 2024, isoWeek: 30, leads: 216 }, { year: 2024, isoWeek: 31, leads: 220 },
  { year: 2024, isoWeek: 32, leads: 215 }, { year: 2024, isoWeek: 33, leads: 210 },
  { year: 2025, isoWeek: 14, leads: 215 }, { year: 2025, isoWeek: 15, leads: 222 },
  { year: 2025, isoWeek: 16, leads: 228 }, { year: 2025, isoWeek: 17, leads: 232 },
  { year: 2025, isoWeek: 18, leads: 228 }, { year: 2025, isoWeek: 19, leads: 222 },
  { year: 2025, isoWeek: 20, leads: 216 }, { year: 2025, isoWeek: 21, leads: 210 },
  { year: 2025, isoWeek: 22, leads: 205 }, { year: 2025, isoWeek: 23, leads: 201 },
  { year: 2025, isoWeek: 24, leads: 198 }, { year: 2025, isoWeek: 25, leads: 203 },
  { year: 2025, isoWeek: 26, leads: 210 }, { year: 2025, isoWeek: 27, leads: 218 },
  { year: 2025, isoWeek: 28, leads: 225 }, { year: 2025, isoWeek: 29, leads: 232 },
  { year: 2025, isoWeek: 30, leads: 238 }, { year: 2025, isoWeek: 31, leads: 244 },
  { year: 2025, isoWeek: 32, leads: 239 }, { year: 2025, isoWeek: 33, leads: 233 },
  { year: 2026, isoWeek: 14, leads: 200 }, { year: 2026, isoWeek: 15, leads: 210 },
  { year: 2026, isoWeek: 16, leads: 215 }, { year: 2026, isoWeek: 17, leads: 225 },
  { year: 2026, isoWeek: 18, leads: 230 }, { year: 2026, isoWeek: 19, leads: 215 },
  { year: 2026, isoWeek: 20, leads: 205 }, { year: 2026, isoWeek: 21, leads: 195 },
  { year: 2026, isoWeek: 22, leads: 150 }, { year: 2026, isoWeek: 23, leads: 185 },
  { year: 2026, isoWeek: 24, leads: 180 }, { year: 2026, isoWeek: 25, leads: 190 },
  { year: 2026, isoWeek: 26, leads: 240 }, { year: 2026, isoWeek: 27, leads: 245 },
];
