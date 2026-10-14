/**
 * Trimestre de 14 executivos comerciais de carteiras muito diferentes: oportunidades trabalhadas,
 * de 12 a 230, e oportunidades ganhas, de zero a 26, em contagem. A taxa de ganho não é guardada
 * aqui: sai de ganhas sobre oportunidades. Três executivos trabalharam oportunidades e não ganharam
 * nenhuma: a taxa deles é zero medido, e zero não tem lugar numa escala logarítmica.
 * Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface ExecutiveWins {
  readonly id: string;
  readonly name: string;
  /** Oportunidades trabalhadas no trimestre; zero quer dizer que a taxa de ganho não existe. */
  readonly oportunidades: number;
  /** Oportunidades ganhas no trimestre, as vitórias. */
  readonly ganhas: number;
}

export const data: readonly ExecutiveWins[] = [
  { id: 'exec-01', name: 'Murilo C.', oportunidades: 140, ganhas: 26 },
  { id: 'exec-02', name: 'Renan A.', oportunidades: 75, ganhas: 20 },
  { id: 'exec-03', name: 'Larissa P.', oportunidades: 40, ganhas: 16 },
  { id: 'exec-04', name: 'Davi S.', oportunidades: 22, ganhas: 14 },
  { id: 'exec-05', name: 'Helena B.', oportunidades: 62, ganhas: 13 },
  { id: 'exec-06', name: 'Fábio J.', oportunidades: 32, ganhas: 12 },
  { id: 'exec-07', name: 'Vera K.', oportunidades: 160, ganhas: 11 },
  { id: 'exec-08', name: 'Bruno T.', oportunidades: 90, ganhas: 9 },
  { id: 'exec-09', name: 'Priscila N.', oportunidades: 230, ganhas: 6 },
  { id: 'exec-10', name: 'Camila R.', oportunidades: 45, ganhas: 4 },
  { id: 'exec-11', name: 'Gustavo F.', oportunidades: 16, ganhas: 3 },
  { id: 'exec-12', name: 'Otávio L.', oportunidades: 12, ganhas: 0 },
  { id: 'exec-13', name: 'Ana Carolina M.', oportunidades: 30, ganhas: 0 },
  { id: 'exec-14', name: 'Ícaro M.', oportunidades: 85, ganhas: 0 },
];

/** Meta de vitórias do trimestre por executivo: número registrado no plano comercial, não estimativa. */
export const winsGoal = 12;

/** Largura da zona de fronteira em torno da meta, em vitórias: quem cai nela não é classificado. */
export const frontierWins = 1;
