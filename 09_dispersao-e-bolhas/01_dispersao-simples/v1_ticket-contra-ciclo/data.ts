/**
 * Oportunidades comerciais ganhas nos últimos 12 meses: ticket em reais no eixo X e ciclo de
 * venda em dias corridos, da abertura ao fechamento, no eixo Y.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 */
export interface WonOpportunity {
  readonly id: string;
  readonly name: string;
  readonly ticketValor: number | null;
  readonly cicloDias: number | null;
}

export const data: readonly WonOpportunity[] = [
  { id: 'opp-01', name: 'Distribuidora Norte', ticketValor: 128_000, cicloDias: 42 },
  { id: 'opp-02', name: 'Fazenda Serra Alta', ticketValor: 96_000, cicloDias: 35 },
  { id: 'opp-03', name: 'Grupo Rio Verde Participações', ticketValor: 312_000, cicloDias: 118 },
  { id: 'opp-04', name: 'Comércio Atacadista Bela Vista', ticketValor: 184_000, cicloDias: 64 },
  { id: 'opp-05', name: 'Metalúrgica Campo Bom', ticketValor: 226_000, cicloDias: 88 },
  { id: 'opp-06', name: 'Construtora Vale do Sol', ticketValor: 358_000, cicloDias: 152 },
  { id: 'opp-07', name: 'Papelaria Estrela do Norte', ticketValor: 42_000, cicloDias: 20 },
  { id: 'opp-08', name: 'Transportadora Rota Azul', ticketValor: 154_000, cicloDias: 58 },
  { id: 'opp-09', name: 'Laticínios Campo Verde', ticketValor: 88_000, cicloDias: 30 },
  { id: 'opp-10', name: 'Consultoria Estratégica Vale do Horizonte', ticketValor: 268_000, cicloDias: 96 },
  { id: 'opp-11', name: 'Auto Peças Bom Retiro', ticketValor: 66_000, cicloDias: 26 },
  { id: 'opp-12', name: 'Imobiliária Portal do Litoral', ticketValor: 342_000, cicloDias: 140 },
  { id: 'opp-13', name: 'Farmácia Popular Santa Rita', ticketValor: 54_000, cicloDias: 24 },
  { id: 'opp-14', name: 'Cooperativa Agrícola Planalto', ticketValor: 196_000, cicloDias: 70 },
  { id: 'opp-15', name: 'Indústria Têxtil Novo Horizonte', ticketValor: 214_000, cicloDias: 82 },
  { id: 'opp-16', name: 'Supermercado Bom Preço Sul', ticketValor: 128_000, cicloDias: 42 },
  { id: 'opp-17', name: 'Editora Página Nova', ticketValor: 18_000, cicloDias: 14 },
  { id: 'opp-18', name: 'Frigorífico Serra Azul', ticketValor: 300_000, cicloDias: 106 },
  { id: 'opp-19', name: 'Confecções Linha Fina', ticketValor: 74_000, cicloDias: 33 },
  { id: 'opp-20', name: 'Concessionária Estrada Real', ticketValor: 380_000, cicloDias: 168 },
  { id: 'opp-21', name: 'Escritório de Advocacia Bom Conselho', ticketValor: 246_000, cicloDias: 92 },
  { id: 'opp-22', name: 'Distribuidora de Bebidas Águas Claras', ticketValor: 112_000, cicloDias: 46 },
  { id: 'opp-23', name: 'Rede de Farmácias Vida Plena', ticketValor: 168_000, cicloDias: 60 },
  { id: 'opp-24', name: 'Corretora de Seguros Vale Sul', ticketValor: 292_000, cicloDias: 104 },
  { id: 'opp-25', name: 'Gráfica Impressão Rápida', ticketValor: null, cicloDias: 58 },
  { id: 'opp-26', name: 'Agropecuária Boa Esperança', ticketValor: 210_000, cicloDias: null },
  { id: 'opp-27', name: 'Óptica Visão Clara', ticketValor: null, cicloDias: null },
];
