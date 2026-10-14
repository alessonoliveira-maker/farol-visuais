/**
 * Trimestre de 14 executivos comerciais: oportunidades trabalhadas e oportunidades ganhas, em
 * contagem. A taxa de ganho não é guardada aqui: sai de ganhas sobre oportunidades, e o produto
 * de volume por taxa devolve as próprias vitórias. Quatro executivos chegam à meta trabalhando
 * poucas oportunidades com taxa alta, três chegam pelo volume, um chega no meio do caminho e um
 * fica a uma vitória dela. Dado fictício e fixo: nenhum nome é pessoa real.
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
  { id: 'exec-01', name: 'Davi S.', oportunidades: 21, ganhas: 12 },
  { id: 'exec-02', name: 'Larissa P.', oportunidades: 27, ganhas: 15 },
  { id: 'exec-03', name: 'Helena B.', oportunidades: 24, ganhas: 12 },
  { id: 'exec-04', name: 'Fábio J.', oportunidades: 27, ganhas: 12 },
  { id: 'exec-05', name: 'Ana Carolina M.', oportunidades: 40, ganhas: 12 },
  { id: 'exec-06', name: 'Murilo C.', oportunidades: 72, ganhas: 15 },
  { id: 'exec-07', name: 'Renan A.', oportunidades: 80, ganhas: 14 },
  { id: 'exec-08', name: 'Otávio L.', oportunidades: 94, ganhas: 12 },
  { id: 'exec-09', name: 'Bruno T.', oportunidades: 76, ganhas: 11 },
  { id: 'exec-10', name: 'Priscila N.', oportunidades: 70, ganhas: 8 },
  { id: 'exec-11', name: 'Camila R.', oportunidades: 64, ganhas: 5 },
  { id: 'exec-12', name: 'Gustavo F.', oportunidades: 54, ganhas: 4 },
  { id: 'exec-13', name: 'Vera K.', oportunidades: 50, ganhas: 4 },
  { id: 'exec-14', name: 'Ícaro M.', oportunidades: 70, ganhas: 4 },
];

/** Meta de vitórias do trimestre por executivo: número registrado no plano comercial, não estimativa. */
export const winsGoal = 12;
