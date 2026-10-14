/**
 * Registro fictício de 14 riscos dos cenários de orçamento de 2027, cada um com dono (papel, nunca pessoa), gatilho e plano de resposta. `probability` é a chance estimada
 * de ocorrer no ano (de 0 a 1) e `impact` é a perda de receita estimada, em R$ mil; `null` é
 * risco sem impacto avaliado, que fica fora da grade e nunca vale zero. As faixas têm critério
 * numérico (limite inferior incluso, superior excluso) e o nível de cada célula sai de uma
 * tabela de consulta acordada, nunca do produto dos índices. Dado fictício e fixo.
 */
export type Level = 'baixo' | 'medio' | 'alto';

export interface Band {
  readonly key: string;
  readonly label: string;
  readonly from: number;
  /** Limite superior excluso; `null` na última faixa, que não tem teto. */
  readonly to: number | null;
}

export interface Risk {
  readonly id: string;
  readonly name: string;
  readonly probability: number;
  readonly impact: number;
  readonly owner: string;
  readonly trigger: string;
  readonly response: string;
}

/** Da menos para a mais provável: o índice 0 é a base da matriz. */
export const PROBABILITY_BANDS: readonly Band[] = [
  { key: 'rara', label: 'Rara', from: 0, to: 0.2 },
  { key: 'improvavel', label: 'Improvável', from: 0.2, to: 0.4 },
  { key: 'possivel', label: 'Possível', from: 0.4, to: 0.6 },
  { key: 'provavel', label: 'Provável', from: 0.6, to: 0.8 },
  { key: 'quase-certa', label: 'Quase certa', from: 0.8, to: null },
];

/** Perda de receita em R$ mil, do menor para o maior impacto. */
export const IMPACT_BANDS: readonly Band[] = [
  { key: 'minimo', label: 'Mínimo', from: 0, to: 50 },
  { key: 'menor', label: 'Menor', from: 50, to: 150 },
  { key: 'moderado', label: 'Moderado', from: 150, to: 400 },
  { key: 'maior', label: 'Maior', from: 400, to: 1000 },
  { key: 'critico', label: 'Crítico', from: 1000, to: null },
];

/** Tabela de consulta acordada: linha é a faixa de probabilidade, coluna é a de impacto. */
export const LEVEL_TABLE: readonly (readonly Level[])[] = [
  ['baixo', 'baixo', 'baixo', 'medio', 'medio'],
  ['baixo', 'baixo', 'medio', 'medio', 'alto'],
  ['baixo', 'medio', 'medio', 'alto', 'alto'],
  ['medio', 'medio', 'alto', 'alto', 'alto'],
  ['medio', 'alto', 'alto', 'alto', 'alto'],
];

export const data: readonly Risk[] = [
  {
    id: 's01',
    name: 'Dependência de mídia paga',
    probability: 0.74,
    impact: 640,
    owner: 'Coordenação de marketing',
    trigger: 'Custo por lead acima de R$ 180 por 3 semanas',
    response: 'Migrar 20% da verba para indicação e eventos',
  },
  {
    id: 's02',
    name: 'Teto de capacidade de pré-vendas',
    probability: 0.66,
    impact: 520,
    owner: 'Gerência de pré-vendas',
    trigger: 'Fila de qualificação acima de 5 dias úteis',
    response: 'Contratar 2 analistas temporários no trimestre',
  },
  {
    id: 's03',
    name: 'Concentração de receita em três contas',
    probability: 0.78,
    impact: 900,
    owner: 'Diretoria comercial',
    trigger: 'Uma das três contas reduz o pedido em 15%',
    response: 'Plano de expansão em 10 contas médias',
  },
  {
    id: 's04',
    name: 'Perda do principal canal de origem',
    probability: 0.84,
    impact: 1250,
    owner: 'Diretoria comercial',
    trigger: 'Queda de 30% nos leads do canal em um mês',
    response: 'Ativar canais reserva já homologados',
  },
  {
    id: 's05',
    name: 'Reajuste de preço sem aceitação',
    probability: 0.62,
    impact: 1100,
    owner: 'Gerência de preços',
    trigger: 'Cancelamentos acima de 4% no mês do reajuste',
    response: 'Reajuste escalonado em duas etapas',
  },
  {
    id: 's06',
    name: 'Atraso na contratação de executivos',
    probability: 0.82,
    impact: 430,
    owner: 'Gerência de pessoas',
    trigger: 'Vaga aberta há mais de 60 dias',
    response: 'Banco de talentos e indicação premiada',
  },
  {
    id: 's07',
    name: 'Aumento do custo de aquisição',
    probability: 0.58,
    impact: 380,
    owner: 'Coordenação de marketing',
    trigger: 'Custo por oportunidade 25% acima do orçado',
    response: 'Revisar mix de canais e pausar o pior quartil',
  },
  {
    id: 's08',
    name: 'Inadimplência acima do orçamento',
    probability: 0.88,
    impact: 310,
    owner: 'Controladoria',
    trigger: 'Atraso acima de 30 dias passa de 6% da carteira',
    response: 'Cobrança preventiva e limite de crédito por conta',
  },
  {
    id: 's09',
    name: 'Fornecedor de leads com entrega irregular',
    probability: 0.5,
    impact: 240,
    owner: 'Coordenação de marketing',
    trigger: 'Entrega abaixo de 70% do contratado por 2 meses',
    response: 'Cláusula de multa e segundo fornecedor',
  },
  {
    id: 's10',
    name: 'Retrabalho na qualificação',
    probability: 0.46,
    impact: 180,
    owner: 'Gerência de pré-vendas',
    trigger: 'Devolução de leads acima de 12%',
    response: 'Roteiro único de qualificação',
  },
  {
    id: 's11',
    name: 'Falha pontual na agenda de visitas',
    probability: 0.42,
    impact: 90,
    owner: 'Operações de campo',
    trigger: 'Mais de 5 visitas perdidas na semana',
    response: 'Confirmação automática 24 horas antes',
  },
  {
    id: 's12',
    name: 'Falha prolongada no sistema de pedidos',
    probability: 0.26,
    impact: 700,
    owner: 'Tecnologia',
    trigger: 'Indisponibilidade acima de 4 horas',
    response: 'Modo manual de contingência e comunicado',
  },
  {
    id: 's13',
    name: 'Revisão de metas pela matriz',
    probability: 0.3,
    impact: 170,
    owner: 'Diretoria comercial',
    trigger: 'Comunicado de revisão de meta fora do ciclo',
    response: 'Reserva de 5% da meta como margem',
  },
  {
    id: 's14',
    name: 'Erro de cadastro em lote',
    probability: 0.12,
    impact: 110,
    owner: 'Operações comerciais',
    trigger: 'Lote com mais de 2% de registros duplicados',
    response: 'Validação na entrada e conferência por amostra',
  },
];
