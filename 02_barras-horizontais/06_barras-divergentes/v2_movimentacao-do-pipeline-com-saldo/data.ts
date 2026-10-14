/**
 * Movimentação do pipeline qualificado de cada executivo numa semana, em reais.
 * Entradas e avanços somam ao pipeline e vêm positivos; perdas e desqualificações tiram do
 * pipeline e já vêm com sinal negativo, prontos para empilhar por sinal. O saldo não mora no
 * dado: o componente soma os quatro componentes.
 * Dado fictício e fixo: os nomes vêm da lista inventada do Farol, nenhum é pessoa real.
 */
export interface PipelineMovement {
  readonly id: string;
  readonly name: string;
  /** Oportunidades novas que entraram no pipeline qualificado. Zero ou positivo. */
  readonly inflow: number;
  /** Oportunidades que avançaram de estágio para dentro do pipeline qualificado. Zero ou positivo. */
  readonly advanced: number;
  /** Oportunidades perdidas na semana. Zero ou negativo. */
  readonly lost: number;
  /** Oportunidades desqualificadas na semana. Zero ou negativo. */
  readonly disqualified: number;
}

export const data: readonly PipelineMovement[] = [
  { id: 'exec-01', name: 'Talita V.', inflow: 420_000, advanced: 180_000, lost: -150_000, disqualified: -60_000 },
  { id: 'exec-02', name: 'Murilo C.', inflow: 260_000, advanced: 310_000, lost: -380_000, disqualified: -40_000 },
  { id: 'exec-03', name: 'Ingrid S.', inflow: 150_000, advanced: 90_000, lost: -120_000, disqualified: -120_000 },
  { id: 'exec-04', name: 'Renan A.', inflow: 310_000, advanced: 0, lost: -90_000, disqualified: -30_000 },
  { id: 'exec-05', name: 'Lorena B.', inflow: 80_000, advanced: 60_000, lost: -290_000, disqualified: -110_000 },
  { id: 'exec-07', name: 'Priscila T.', inflow: 0, advanced: 0, lost: -140_000, disqualified: -45_000 },
];

/** Início da semana medida, em YYYY-MM-DD. */
export const weekStart = '2026-08-31';
