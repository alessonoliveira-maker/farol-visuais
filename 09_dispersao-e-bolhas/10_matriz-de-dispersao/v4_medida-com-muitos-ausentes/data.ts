/**
 * Quatro medidas de 64 campanhas fictícias de mídia paga do trimestre: investimento total em reais,
 * custo por lead (CPL) em reais, taxa de clique (CTR) e taxa de qualificação, as duas últimas como
 * fração de 0 a 1. Em 19 das 64 campanhas o CTR não foi registrado, e por isso o campo é
 * `number | null`: a ausência é do tipo, nunca um zero escrito no lugar do que ninguém mediu
 * (EST-1b, DAD-2). Dado fictício e fixo: nenhuma campanha, plataforma ou valor corresponde a dado
 * real.
 */
export interface CampaignMetrics {
  readonly id: string;
  readonly name: string;
  readonly investment: number;
  readonly cpl: number;
  readonly ctr: number | null;
  readonly qualificationRate: number;
}

export const data: readonly CampaignMetrics[] = [
  { id: 'camp-01', name: 'Campanha A-01 Zenite', investment: 57500, cpl: 40.9, ctr: 0.0207, qualificationRate: 0.167 },
  { id: 'camp-02', name: 'Campanha A-02 Bruma', investment: 19900, cpl: 119.9, ctr: null, qualificationRate: 0.237 },
  { id: 'camp-03', name: 'Campanha A-03 Horizonte', investment: 9500, cpl: 109, ctr: 0.0303, qualificationRate: 0.124 },
  { id: 'camp-04', name: 'Campanha A-04 Xisto', investment: 11400, cpl: 110.3, ctr: 0.0251, qualificationRate: 0.039 },
  { id: 'camp-05', name: 'Campanha A-05 Ventania', investment: 5100, cpl: 146.4, ctr: null, qualificationRate: 0.11 },
  { id: 'camp-06', name: 'Campanha A-06 Jequitibá', investment: 25200, cpl: 88, ctr: 0.0275, qualificationRate: 0.309 },
  { id: 'camp-07', name: 'Campanha A-07 Tucano', investment: 21800, cpl: 101.6, ctr: 0.003, qualificationRate: 0.426 },
  { id: 'camp-08', name: 'Campanha A-08 Louva', investment: 15600, cpl: 135.8, ctr: null, qualificationRate: 0.219 },
  { id: 'camp-09', name: 'Campanha A-09 Xingu', investment: 18100, cpl: 105.8, ctr: 0.0113, qualificationRate: 0.201 },
  { id: 'camp-10', name: 'Campanha A-10 Jangada', investment: 26600, cpl: 86.3, ctr: 0.0292, qualificationRate: 0.096 },
  { id: 'camp-11', name: 'Campanha A-11 Quintal', investment: 11800, cpl: 93.9, ctr: null, qualificationRate: 0.195 },
  { id: 'camp-12', name: 'Campanha A-12 Serrano', investment: 27300, cpl: 104.3, ctr: 0.0279, qualificationRate: 0.266 },
  { id: 'camp-13', name: 'Campanha A-13 Sertão', investment: 15900, cpl: 92.4, ctr: 0.0298, qualificationRate: 0.382 },
  { id: 'camp-14', name: 'Campanha A-14 Harmonia', investment: 59200, cpl: 48.9, ctr: null, qualificationRate: 0.266 },
  { id: 'camp-15', name: 'Campanha A-15 Quartzo', investment: 55400, cpl: 29.5, ctr: 0.0147, qualificationRate: 0.203 },
  { id: 'camp-16', name: 'Campanha A-16 Vale', investment: 23500, cpl: 120.1, ctr: 0.0273, qualificationRate: 0.276 },
  { id: 'camp-17', name: 'Campanha B-01 Maná', investment: 33600, cpl: 89, ctr: null, qualificationRate: 0.148 },
  { id: 'camp-18', name: 'Campanha B-02 Recanto', investment: 20400, cpl: 108.3, ctr: 0.0139, qualificationRate: 0.11 },
  { id: 'camp-19', name: 'Campanha B-03 Fervor', investment: 43400, cpl: 40.9, ctr: 0.0293, qualificationRate: 0.229 },
  { id: 'camp-20', name: 'Campanha B-04 Umbral', investment: 3700, cpl: 119.6, ctr: null, qualificationRate: 0.192 },
  { id: 'camp-21', name: 'Campanha B-05 Lagoa', investment: 16100, cpl: 100, ctr: 0.004, qualificationRate: 0.155 },
  { id: 'camp-22', name: 'Campanha B-06 Bandeira', investment: 47600, cpl: 50.7, ctr: 0.0147, qualificationRate: 0.232 },
  { id: 'camp-23', name: 'Campanha B-07 Pedral', investment: 12200, cpl: 126.5, ctr: null, qualificationRate: 0.223 },
  { id: 'camp-24', name: 'Campanha B-08 Zarco', investment: 5000, cpl: 148.1, ctr: 0.0225, qualificationRate: 0.208 },
  { id: 'camp-25', name: 'Campanha B-09 Delta', investment: 6900, cpl: 108.8, ctr: 0.0205, qualificationRate: 0.161 },
  { id: 'camp-26', name: 'Campanha B-10 Gávea', investment: 24500, cpl: 86.5, ctr: null, qualificationRate: 0.191 },
  { id: 'camp-27', name: 'Campanha B-11 Alvorada', investment: 2800, cpl: 114.9, ctr: 0.003, qualificationRate: 0.205 },
  { id: 'camp-28', name: 'Campanha B-12 Grão', investment: 33600, cpl: 58.3, ctr: 0.0321, qualificationRate: 0.136 },
  { id: 'camp-29', name: 'Campanha B-13 Estuário', investment: 20600, cpl: 124.2, ctr: null, qualificationRate: 0.092 },
  { id: 'camp-30', name: 'Campanha B-14 Jade', investment: 8800, cpl: 111.6, ctr: 0.0252, qualificationRate: 0.215 },
  { id: 'camp-31', name: 'Campanha B-15 Farol', investment: 2100, cpl: 149.7, ctr: 0.028, qualificationRate: 0.208 },
  { id: 'camp-32', name: 'Campanha B-16 Anil', investment: 30300, cpl: 84.8, ctr: null, qualificationRate: 0.318 },
  { id: 'camp-33', name: 'Campanha C-01 Kaledo', investment: 17700, cpl: 71.4, ctr: 0.0116, qualificationRate: 0.104 },
  { id: 'camp-34', name: 'Campanha C-02 Aurora', investment: 9900, cpl: 118.9, ctr: 0.0175, qualificationRate: 0.23 },
  { id: 'camp-35', name: 'Campanha C-03 Marola', investment: 14700, cpl: 147.4, ctr: null, qualificationRate: 0.178 },
  { id: 'camp-36', name: 'Campanha C-04 Enseada', investment: 5900, cpl: 126.9, ctr: 0.0236, qualificationRate: 0.241 },
  { id: 'camp-37', name: 'Campanha C-05 Uivo', investment: 1460, cpl: 120.3, ctr: 0.0106, qualificationRate: 0.161 },
  { id: 'camp-38', name: 'Campanha C-06 Cascata', investment: 55400, cpl: 58.8, ctr: null, qualificationRate: 0.136 },
  { id: 'camp-39', name: 'Campanha C-07 Diamante', investment: 3200, cpl: 134.9, ctr: 0.0178, qualificationRate: 0.124 },
  { id: 'camp-40', name: 'Campanha C-08 Meridiano', investment: 8700, cpl: 121.9, ctr: 0.0244, qualificationRate: 0.096 },
  { id: 'camp-41', name: 'Campanha C-09 Litoral', investment: 25700, cpl: 81.9, ctr: null, qualificationRate: 0.174 },
  { id: 'camp-42', name: 'Campanha C-10 Espiga', investment: 6700, cpl: 130.6, ctr: 0.0049, qualificationRate: 0.228 },
  { id: 'camp-43', name: 'Campanha C-11 Orvalho', investment: 6200, cpl: 151, ctr: 0.0194, qualificationRate: 0.189 },
  { id: 'camp-44', name: 'Campanha C-12 Ilhota', investment: 17000, cpl: 87.2, ctr: null, qualificationRate: 0.352 },
  { id: 'camp-45', name: 'Campanha C-13 Karma', investment: 29400, cpl: 91.3, ctr: 0.0138, qualificationRate: 0.121 },
  { id: 'camp-46', name: 'Campanha C-14 Nortada', investment: 24900, cpl: 126.5, ctr: 0.0239, qualificationRate: 0.15 },
  { id: 'camp-47', name: 'Campanha C-15 Canela', investment: 23100, cpl: 82.3, ctr: null, qualificationRate: 0.382 },
  { id: 'camp-48', name: 'Campanha C-16 Ônix', investment: 13600, cpl: 130.2, ctr: 0.0181, qualificationRate: 0.231 },
  { id: 'camp-49', name: 'Campanha D-01 Cedro', investment: 12900, cpl: 94.1, ctr: 0.0243, qualificationRate: 0.384 },
  { id: 'camp-50', name: 'Campanha D-02 Duna', investment: 23600, cpl: 103.1, ctr: null, qualificationRate: 0.112 },
  { id: 'camp-51', name: 'Campanha D-03 Nascente', investment: 5200, cpl: 131.7, ctr: 0.0044, qualificationRate: 0.169 },
  { id: 'camp-52', name: 'Campanha D-04 Fênix', investment: 11600, cpl: 111.8, ctr: 0.0172, qualificationRate: 0.304 },
  { id: 'camp-53', name: 'Campanha D-05 Kairós', investment: 29300, cpl: 87.9, ctr: null, qualificationRate: 0.101 },
  { id: 'camp-54', name: 'Campanha D-06 Insônia', investment: 31900, cpl: 90.5, ctr: 0.0273, qualificationRate: 0.22 },
  { id: 'camp-55', name: 'Campanha D-07 Trilha', investment: 23300, cpl: 124.6, ctr: 0.0175, qualificationRate: 0.121 },
  { id: 'camp-56', name: 'Campanha D-08 Girassol', investment: 26700, cpl: 116.5, ctr: null, qualificationRate: 0.144 },
  { id: 'camp-57', name: 'Campanha D-09 Nirvana', investment: 45200, cpl: 66.2, ctr: 0.0143, qualificationRate: 0.095 },
  { id: 'camp-58', name: 'Campanha D-10 Ipê', investment: 19800, cpl: 109.2, ctr: 0.0234, qualificationRate: 0.29 },
  { id: 'camp-59', name: 'Campanha D-11 Pluma', investment: 23900, cpl: 78.3, ctr: 0.0207, qualificationRate: 0.079 },
  { id: 'camp-60', name: 'Campanha D-12 Pampa', investment: 14300, cpl: 120.3, ctr: 0.0242, qualificationRate: 0.03 },
  { id: 'camp-61', name: 'Campanha D-13 Riacho', investment: 19600, cpl: 102, ctr: 0.0151, qualificationRate: 0.162 },
  { id: 'camp-62', name: 'Campanha D-14 Yara', investment: 36000, cpl: 84.3, ctr: 0.0197, qualificationRate: 0.218 },
  { id: 'camp-63', name: 'Campanha D-15 Boreal', investment: 48800, cpl: 70.3, ctr: 0.0269, qualificationRate: 0.125 },
  { id: 'camp-64', name: 'Campanha D-16 Oceano', investment: 12900, cpl: 96.3, ctr: 0.0107, qualificationRate: 0.03 },
];
