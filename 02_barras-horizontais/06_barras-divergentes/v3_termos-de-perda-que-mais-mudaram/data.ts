/**
 * Termos extraídos do motivo de perda de oportunidades, contados por trimestre de 2026.
 * A contribuição de cada termo para a mudança de vocabulário não mora aqui: o componente
 * calcula a diferença de proporção entre os dois trimestres a partir da contagem e do total.
 * Dado fictício e fixo: termos genéricos de motivo de perda comercial, sem cliente real.
 */
export interface LossReasonTerm {
  readonly id: string;
  readonly term: string;
  /** Vezes que o termo apareceu nos motivos de perda do 2º trimestre de 2026. */
  readonly q2Count: number;
  /** Vezes que apareceu no 3º trimestre de 2026. Zero quando o termo só surgiu no trimestre novo. */
  readonly q3Count: number;
}

export const data: readonly LossReasonTerm[] = [
  { id: 'termo-01', term: 'Concorrente', q2Count: 48, q3Count: 61 },
  { id: 'termo-02', term: 'Preço alto', q2Count: 55, q3Count: 42 },
  { id: 'termo-03', term: 'Sem retorno', q2Count: 70, q3Count: 58 },
  { id: 'termo-04', term: 'Fora do perfil', q2Count: 64, q3Count: 52 },
  { id: 'termo-05', term: 'Momento errado', q2Count: 38, q3Count: 44 },
  { id: 'termo-06', term: 'Já tem gestor', q2Count: 30, q3Count: 41 },
  { id: 'termo-07', term: 'Taxa alta', q2Count: 27, q3Count: 35 },
  { id: 'termo-08', term: 'Sem orçamento', q2Count: 41, q3Count: 30 },
  { id: 'termo-09', term: 'Não é o decisor', q2Count: 19, q3Count: 25 },
  { id: 'termo-10', term: 'Precisa de tempo', q2Count: 25, q3Count: 31 },
  { id: 'termo-11', term: 'Resolveu sozinho', q2Count: 17, q3Count: 12 },
  { id: 'termo-12', term: 'Não confiou', q2Count: 14, q3Count: 22 },
  { id: 'termo-13', term: 'Processo lento', q2Count: 20, q3Count: 13 },
  { id: 'termo-14', term: 'Falta de clareza', q2Count: 16, q3Count: 24 },
  { id: 'termo-15', term: 'Documentação', q2Count: 12, q3Count: 8 },
  { id: 'termo-16', term: 'Portfólio limitado', q2Count: 18, q3Count: 27 },
  { id: 'termo-17', term: 'Localização distante', q2Count: 9, q3Count: 6 },
  { id: 'termo-18', term: 'Indicação de rival', q2Count: 11, q3Count: 17 },
  { id: 'termo-19', term: 'Burocracia', q2Count: 22, q3Count: 19 },
  { id: 'termo-20', term: 'Mercado instável', q2Count: 0, q3Count: 9 },
  { id: 'termo-21', term: 'Cor da marca', q2Count: 2, q3Count: 1 },
  { id: 'termo-22', term: 'Outro idioma', q2Count: 1, q3Count: 2 },
];

/** Total de oportunidades perdidas com motivo registrado em cada trimestre. */
export const q2Total = 612;
export const q3Total = 648;
