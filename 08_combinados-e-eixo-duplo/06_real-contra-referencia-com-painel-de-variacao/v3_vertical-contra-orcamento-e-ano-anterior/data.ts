/**
 * Receita do ano por vertical de atendimento, em reais, contra duas referências: o orçamento do
 * próprio ano e o realizado do ano anterior.
 * Dado fictício e fixo: as verticais são setores genéricos, não empresas.
 *
 * As duas referências existem porque elas discordam: uma vertical pode crescer muito contra o ano
 * anterior e ainda ficar abaixo do que foi orçado para ela, e é esse desencontro que a versão mostra.
 */
export interface VerticalRevenueVsTwoReferences {
  readonly id: string;
  readonly vertical: string;
  readonly realizado: number;
  readonly orcado: number;
  readonly anoAnterior: number;
}

export const data: readonly VerticalRevenueVsTwoReferences[] = [
  { id: 'vert-01', vertical: 'Indústria', realizado: 750_000, orcado: 704_000, anoAnterior: 588_000 },
  { id: 'vert-02', vertical: 'Agronegócio', realizado: 534_000, orcado: 560_000, anoAnterior: 512_000 },
  { id: 'vert-03', vertical: 'Serviços', realizado: 620_000, orcado: 704_000, anoAnterior: 640_000 },
  { id: 'vert-04', vertical: 'Comércio', realizado: 466_000, orcado: 448_000, anoAnterior: 430_000 },
  { id: 'vert-05', vertical: 'Energia', realizado: 468_000, orcado: 512_000, anoAnterior: 340_000 },
  { id: 'vert-06', vertical: 'Logística', realizado: 302_000, orcado: 288_000, anoAnterior: 298_000 },
];
