/**
 * Leads por dia, contagem inteira, nos últimos 30 dias de 2026 contra os mesmos 30 dias de 2025.
 * As duas séries estão alinhadas por dia da semana, não por data corrida: o índice `i` de
 * `current` corresponde ao índice `i` de `previous`, mesmo que as datas não coincidam.
 * `campaignSpikeIndex` marca o dia de 2025 com um pico de campanha isolado, usado na anotação.
 * Dado fictício e fixo.
 */
export interface DailyLeadPoint {
  /** Data no formato YYYY-MM-DD. */
  readonly date: string;
  readonly value: number;
}

export interface YearOverYearLeads {
  readonly label: string;
  /** Para onde aponta o "bom": mais leads é bom, por isso 'up'. */
  readonly goodDirection: 'up' | 'down';
  readonly alignment: 'dia_da_semana';
  readonly currentYear: string;
  readonly previousYear: string;
  /** Índice em `previous` do dia com pico de campanha isolado, usado na anotação. */
  readonly campaignSpikeIndex: number;
  readonly current: readonly DailyLeadPoint[];
  readonly previous: readonly DailyLeadPoint[];
}

export const data: YearOverYearLeads = {
  label: 'Total de leads',
  goodDirection: 'up',
  alignment: 'dia_da_semana',
  currentYear: '2026',
  previousYear: '2025',
  campaignSpikeIndex: 9,
  current: [
    { date: '2026-08-06', value: 153 },
    { date: '2026-08-07', value: 146 },
    { date: '2026-08-08', value: 159 },
    { date: '2026-08-09', value: 165 },
    { date: '2026-08-10', value: 155 },
    { date: '2026-08-11', value: 152 },
    { date: '2026-08-12', value: 149 },
    { date: '2026-08-13', value: 166 },
    { date: '2026-08-14', value: 158 },
    { date: '2026-08-15', value: 174 },
    { date: '2026-08-16', value: 175 },
    { date: '2026-08-17', value: 166 },
    { date: '2026-08-18', value: 183 },
    { date: '2026-08-19', value: 164 },
    { date: '2026-08-20', value: 184 },
    { date: '2026-08-21', value: 184 },
    { date: '2026-08-22', value: 180 },
    { date: '2026-08-23', value: 178 },
    { date: '2026-08-24', value: 190 },
    { date: '2026-08-25', value: 193 },
    { date: '2026-08-26', value: 191 },
    { date: '2026-08-27', value: 181 },
    { date: '2026-08-28', value: 180 },
    { date: '2026-08-29', value: 182 },
    { date: '2026-08-30', value: 196 },
    { date: '2026-08-31', value: 192 },
    { date: '2026-09-01', value: 191 },
    { date: '2026-09-02', value: 202 },
    { date: '2026-09-03', value: 193 },
    { date: '2026-09-04', value: 194 },
  ],
  previous: [
    { date: '2025-08-07', value: 111 },
    { date: '2025-08-08', value: 114 },
    { date: '2025-08-09', value: 124 },
    { date: '2025-08-10', value: 112 },
    { date: '2025-08-11', value: 111 },
    { date: '2025-08-12', value: 120 },
    { date: '2025-08-13', value: 114 },
    { date: '2025-08-14', value: 121 },
    { date: '2025-08-15', value: 122 },
    { date: '2025-08-16', value: 310 },
    { date: '2025-08-17', value: 124 },
    { date: '2025-08-18', value: 113 },
    { date: '2025-08-19', value: 117 },
    { date: '2025-08-20', value: 112 },
    { date: '2025-08-21', value: 122 },
    { date: '2025-08-22', value: 125 },
    { date: '2025-08-23', value: 129 },
    { date: '2025-08-24', value: 121 },
    { date: '2025-08-25', value: 122 },
    { date: '2025-08-26', value: 122 },
    { date: '2025-08-27', value: 111 },
    { date: '2025-08-28', value: 116 },
    { date: '2025-08-29', value: 115 },
    { date: '2025-08-30', value: 116 },
    { date: '2025-08-31', value: 117 },
    { date: '2025-09-01', value: 114 },
    { date: '2025-09-02', value: 129 },
    { date: '2025-09-03', value: 122 },
    { date: '2025-09-04', value: 125 },
    { date: '2025-09-05', value: 118 },
  ],
};
