/**
 * 84 oportunidades abertas do forecast: valor em reais e dias desde o último movimento. `diasParada`
 * nulo quer dizer que a oportunidade nunca registrou movimento, então não há como medir quanto
 * tempo ela está parada. Dado fictício e fixo: nenhuma empresa corresponde a uma real.
 */
export interface ForecastOpportunity {
  readonly id: string;
  readonly name: string;
  readonly valorReais: number;
  readonly diasParada: number | null;
}

/** Valor a partir do qual a oportunidade pesa no forecast, em reais. Premissa comercial. */
export const valueCut = 150_000;
/** Dias sem movimento a partir dos quais a oportunidade é considerada parada. Premissa comercial. */
export const daysCut = 30;
/** Oportunidade destacada na abertura, como se o cursor estivesse sobre a linha dela na lista. */
export const highlightId = 'op-12';

export const data: readonly ForecastOpportunity[] = [
  { id: 'op-01', name: 'Indústria Norte', valorReais: 305_000, diasParada: 18 },
  { id: 'op-02', name: 'Metalúrgica Lago Azul', valorReais: 170_000, diasParada: 75 },
  { id: 'op-03', name: 'Indústria Vale Verde', valorReais: 55_000, diasParada: 53 },
  { id: 'op-04', name: 'Construtora Três Marias', valorReais: 220_000, diasParada: 48 },
  { id: 'op-05', name: 'Rede Central', valorReais: 78_000, diasParada: 73 },
  { id: 'op-06', name: 'Atacado Campo Largo', valorReais: 64_000, diasParada: 65 },
  { id: 'op-07', name: 'Indústria Agroalimentar Vale do Rio Grande Sul', valorReais: 81_000, diasParada: 52 },
  { id: 'op-08', name: 'Construtora Sol Nascente', valorReais: 64_000, diasParada: 1 },
  { id: 'op-09', name: 'Comercial Aurora', valorReais: 139_000, diasParada: 70 },
  { id: 'op-10', name: 'Rede Serra Alta', valorReais: 62_000, diasParada: 72 },
  { id: 'op-11', name: 'Transportes Paraná Sul', valorReais: 111_000, diasParada: 66 },
  { id: 'op-12', name: 'Transportes Vale Verde', valorReais: 280_000, diasParada: 38 },
  { id: 'op-13', name: 'Metalúrgica Paraná Sul', valorReais: 133_000, diasParada: 68 },
  { id: 'op-14', name: 'Distribuidora Riacho', valorReais: 66_000, diasParada: 5 },
  { id: 'op-15', name: 'Agroindustrial Santa Rita', valorReais: 119_000, diasParada: 69 },
  { id: 'op-16', name: 'Agroindustrial Lago Azul', valorReais: 190_000, diasParada: 52 },
  { id: 'op-17', name: 'Transportes Pioneira', valorReais: 245_000, diasParada: 24 },
  { id: 'op-18', name: 'Comercial União', valorReais: 83_000, diasParada: 8 },
  { id: 'op-19', name: 'Metalúrgica Vale Verde', valorReais: 101_000, diasParada: 7 },
  { id: 'op-20', name: 'Indústria Horizonte', valorReais: 102_000, diasParada: 88 },
  { id: 'op-21', name: 'Rede Vale Verde', valorReais: 245_000, diasParada: 74 },
  { id: 'op-22', name: 'Logística Estrela', valorReais: 92_000, diasParada: 29 },
  { id: 'op-23', name: 'Distribuidora Cerrado', valorReais: 240_000, diasParada: 67 },
  { id: 'op-24', name: 'Comercial Pioneira', valorReais: 235_000, diasParada: 45 },
  { id: 'op-25', name: 'Transportes Aurora', valorReais: 117_000, diasParada: 2 },
  { id: 'op-26', name: 'Metalúrgica Santa Rita', valorReais: 101_000, diasParada: 74 },
  { id: 'op-27', name: 'Atacado Estrela', valorReais: 84_000, diasParada: 43 },
  { id: 'op-28', name: 'Transportes Santa Rita', valorReais: 99_000, diasParada: 21 },
  { id: 'op-29', name: 'Indústria Ponte Nova', valorReais: 52_000, diasParada: 26 },
  { id: 'op-30', name: 'Transportes Cerrado', valorReais: 88_000, diasParada: 60 },
  { id: 'op-31', name: 'Agroindustrial Vale Verde', valorReais: 85_000, diasParada: null },
  { id: 'op-32', name: 'Metalúrgica Sol Nascente', valorReais: 61_000, diasParada: 1 },
  { id: 'op-33', name: 'Rede Norte', valorReais: 100_000, diasParada: 81 },
  { id: 'op-34', name: 'Indústria Serra Alta', valorReais: 205_000, diasParada: 52 },
  { id: 'op-35', name: 'Metalúrgica União', valorReais: 270_000, diasParada: 12 },
  { id: 'op-36', name: 'Atacado Lago Azul', valorReais: 185_000, diasParada: 16 },
  { id: 'op-37', name: 'Logística Santa Rita', valorReais: 71_000, diasParada: 48 },
  { id: 'op-38', name: 'Rede Pioneira', valorReais: 77_000, diasParada: 57 },
  { id: 'op-39', name: 'Logística Aurora', valorReais: 119_000, diasParada: 42 },
  { id: 'op-40', name: 'Agroindustrial União', valorReais: 65_000, diasParada: 71 },
  { id: 'op-41', name: 'Distribuidora Central', valorReais: 68_000, diasParada: 8 },
  { id: 'op-42', name: 'Distribuidora Serra Alta', valorReais: 220_000, diasParada: 84 },
  { id: 'op-43', name: 'Distribuidora Ponte Nova', valorReais: 190_000, diasParada: 13 },
  { id: 'op-44', name: 'Comercial Estrela', valorReais: 77_000, diasParada: 21 },
  { id: 'op-45', name: 'Construtora Aurora', valorReais: 68_000, diasParada: 24 },
  { id: 'op-46', name: 'Distribuidora Rio Claro', valorReais: 72_000, diasParada: 51 },
  { id: 'op-47', name: 'Comercial Central', valorReais: 320_000, diasParada: 23 },
  { id: 'op-48', name: 'Logística Litoral', valorReais: 109_000, diasParada: 6 },
  { id: 'op-49', name: 'Logística Horizonte', valorReais: 235_000, diasParada: null },
  { id: 'op-50', name: 'Construtora Riacho', valorReais: 158_000, diasParada: 12 },
  { id: 'op-51', name: 'Comercial Rio Claro', valorReais: 85_000, diasParada: null },
  { id: 'op-52', name: 'Distribuidora Paraná Sul', valorReais: 53_000, diasParada: 8 },
  { id: 'op-53', name: 'Agroindustrial Norte', valorReais: 315_000, diasParada: 75 },
  { id: 'op-54', name: 'Construtora Norte', valorReais: 160_000, diasParada: 14 },
  { id: 'op-55', name: 'Construtora Planalto', valorReais: 115_000, diasParada: 1 },
  { id: 'op-56', name: 'Logística Central', valorReais: 61_000, diasParada: 58 },
  { id: 'op-57', name: 'Transportes Lago Azul', valorReais: 61_000, diasParada: 3 },
  { id: 'op-58', name: 'Indústria Riacho', valorReais: 260_000, diasParada: 38 },
  { id: 'op-59', name: 'Atacado Riacho', valorReais: 330_000, diasParada: 14 },
  { id: 'op-60', name: 'Metalúrgica Três Marias', valorReais: 200_000, diasParada: 35 },
  { id: 'op-61', name: 'Logística Lago Azul', valorReais: 150_000, diasParada: 31 },
  { id: 'op-62', name: 'Agroindustrial Litoral', valorReais: 260_000, diasParada: 3 },
  { id: 'op-63', name: 'Agroindustrial Paraná Sul', valorReais: 175_000, diasParada: 4 },
  { id: 'op-64', name: 'Construtora Litoral', valorReais: 295_000, diasParada: 63 },
  { id: 'op-65', name: 'Agroindustrial Pioneira', valorReais: 99_000, diasParada: 9 },
  { id: 'op-66', name: 'Agroindustrial Ponte Nova', valorReais: 160_000, diasParada: null },
  { id: 'op-67', name: 'Logística Mirante', valorReais: 128_000, diasParada: 7 },
  { id: 'op-68', name: 'Metalúrgica Rio Claro', valorReais: 75_000, diasParada: 50 },
  { id: 'op-69', name: 'Logística Três Marias', valorReais: 85_000, diasParada: 85 },
  { id: 'op-70', name: 'Logística Ponte Nova', valorReais: 290_000, diasParada: null },
  { id: 'op-71', name: 'Indústria Paraná Sul', valorReais: 290_000, diasParada: 5 },
  { id: 'op-72', name: 'Logística Delta', valorReais: 60_000, diasParada: 30 },
  { id: 'op-73', name: 'Agroindustrial Rio Claro', valorReais: 295_000, diasParada: 19 },
  { id: 'op-74', name: 'Logística Norte', valorReais: 315_000, diasParada: 64 },
  { id: 'op-75', name: 'Distribuidora Monte Real', valorReais: 90_000, diasParada: 22 },
  { id: 'op-76', name: 'Construtora Cerrado', valorReais: 335_000, diasParada: 17 },
  { id: 'op-77', name: 'Distribuidora Alto da Serra', valorReais: 83_000, diasParada: 5 },
  { id: 'op-78', name: 'Indústria Aurora', valorReais: 65_000, diasParada: 11 },
  { id: 'op-79', name: 'Rede Planalto', valorReais: 190_000, diasParada: 10 },
  { id: 'op-80', name: 'Metalúrgica Ponte Nova', valorReais: 200_000, diasParada: 35 },
  { id: 'op-81', name: 'Rede Riacho', valorReais: 111_000, diasParada: 9 },
  { id: 'op-82', name: 'Comercial Mirante', valorReais: 146_000, diasParada: 48 },
  { id: 'op-83', name: 'Logística Monte Real', valorReais: 112_000, diasParada: 70 },
  { id: 'op-84', name: 'Transportes Sol Nascente', valorReais: 87_000, diasParada: 12 },
];
