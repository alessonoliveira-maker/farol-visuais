/**
 * Oportunidades fechadas no trimestre: o valor que estava no forecast 30 dias antes do
 * fechamento e o valor efetivamente fechado, os dois em reais. Oportunidade perdida fecha em
 * zero por definição, e o zero aqui é medido, não ausência.
 * Dado fictício e fixo: nenhuma empresa corresponde a uma real.
 */
export type DealOutcome = 'ganha' | 'perdida';

export interface ForecastVersusClosed {
  readonly id: string;
  readonly rotulo: string;
  readonly previstoReais: number;
  readonly fechadoReais: number;
  readonly desfecho: DealOutcome;
}

export const data: readonly ForecastVersusClosed[] = [
  { id: 'opp-01', rotulo: 'Distribuidora Norte', previstoReais: 48_000, fechadoReais: 52_000, desfecho: 'ganha' },
  { id: 'opp-02', rotulo: 'Transportadora Vale Claro', previstoReais: 62_000, fechadoReais: 55_000, desfecho: 'ganha' },
  { id: 'opp-03', rotulo: 'Indústria Campo Alto', previstoReais: 75_000, fechadoReais: 96_000, desfecho: 'ganha' },
  { id: 'opp-04', rotulo: 'Rede Atacadista Sul', previstoReais: 88_000, fechadoReais: 84_000, desfecho: 'ganha' },
  { id: 'opp-05', rotulo: 'Metalúrgica Serra Nova', previstoReais: 104_000, fechadoReais: 118_000, desfecho: 'ganha' },
  { id: 'opp-06', rotulo: 'Construtora Ponte Velha', previstoReais: 112_000, fechadoReais: 78_000, desfecho: 'ganha' },
  { id: 'opp-07', rotulo: 'Frigorífico Rio Verde', previstoReais: 126_000, fechadoReais: 132_000, desfecho: 'ganha' },
  { id: 'opp-08', rotulo: 'Usina Sol Poente', previstoReais: 140_000, fechadoReais: 145_000, desfecho: 'ganha' },
  { id: 'opp-09', rotulo: 'Laboratório Beira Rio', previstoReais: 155_000, fechadoReais: 132_000, desfecho: 'ganha' },
  { id: 'opp-10', rotulo: 'Cerealista Vento Leste', previstoReais: 168_000, fechadoReais: 196_000, desfecho: 'ganha' },
  { id: 'opp-11', rotulo: 'Têxtil Morro Azul', previstoReais: 182_000, fechadoReais: 175_000, desfecho: 'ganha' },
  { id: 'opp-12', rotulo: 'Fazenda Pedra Branca', previstoReais: 196_000, fechadoReais: 205_000, desfecho: 'ganha' },
  { id: 'opp-13', rotulo: 'Química Porto Fundo', previstoReais: 215_000, fechadoReais: 188_000, desfecho: 'ganha' },
  { id: 'opp-14', rotulo: 'Locadora Lago Sereno', previstoReais: 232_000, fechadoReais: 246_000, desfecho: 'ganha' },
  { id: 'opp-15', rotulo: 'Papelaria Mata Fria', previstoReais: 248_000, fechadoReais: 172_000, desfecho: 'ganha' },
  { id: 'opp-16', rotulo: 'Cooperativa Água Limpa', previstoReais: 265_000, fechadoReais: 258_000, desfecho: 'ganha' },
  { id: 'opp-17', rotulo: 'Refrigeração Bela Vista', previstoReais: 288_000, fechadoReais: 302_000, desfecho: 'ganha' },
  { id: 'opp-18', rotulo: 'Madeireira Céu Aberto', previstoReais: 310_000, fechadoReais: 286_000, desfecho: 'ganha' },
  { id: 'opp-19', rotulo: 'Terminal Baía Longa', previstoReais: 336_000, fechadoReais: 352_000, desfecho: 'ganha' },
  { id: 'opp-20', rotulo: 'Mineradora Chão Duro', previstoReais: 362_000, fechadoReais: 398_000, desfecho: 'ganha' },
  { id: 'opp-21', rotulo: 'Gráfica Campo Largo', previstoReais: 395_000, fechadoReais: 344_000, desfecho: 'ganha' },
  { id: 'opp-22', rotulo: 'Siderúrgica Arco Norte', previstoReais: 428_000, fechadoReais: 512_000, desfecho: 'ganha' },
  { id: 'opp-23', rotulo: 'Hospitalar Vila Nova', previstoReais: 455_000, fechadoReais: 442_000, desfecho: 'ganha' },
  { id: 'opp-24', rotulo: 'Energia Serra Fria', previstoReais: 486_000, fechadoReais: 505_000, desfecho: 'ganha' },
  { id: 'opp-25', rotulo: 'Logística Beira Mar', previstoReais: 520_000, fechadoReais: 468_000, desfecho: 'ganha' },
  { id: 'opp-26', rotulo: 'Agroindústria Rio Claro', previstoReais: 558_000, fechadoReais: 572_000, desfecho: 'ganha' },
  { id: 'opp-27', rotulo: 'Atacado Serra Verde', previstoReais: 96_000, fechadoReais: 0, desfecho: 'perdida' },
  { id: 'opp-28', rotulo: 'Embalagens Vale Fundo', previstoReais: 205_000, fechadoReais: 0, desfecho: 'perdida' },
  { id: 'opp-29', rotulo: 'Automação Praia Alta', previstoReais: 274_000, fechadoReais: 0, desfecho: 'perdida' },
  { id: 'opp-30', rotulo: 'Cimentos Monte Raso', previstoReais: 342_000, fechadoReais: 0, desfecho: 'perdida' },
];

/** A tolerância que o time acordou para chamar o forecast de acertado. */
export const tolerance = 0.15;
