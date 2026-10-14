/**
 * Termos dos motivos de perda escritos livremente pelo time comercial, em dois trimestres seguidos.
 * `current` conta quantas das 412 respostas do 3º trimestre de 2026 citam o termo, e `previous`
 * quantas das 398 do 2º trimestre de 2026. Uma resposta que repete o termo pesa uma.
 * `previous: null` quer dizer que o termo não apareceu no trimestre anterior: não há base, e por
 * isso não há variação a calcular. Nunca é zero.
 * Dado fictício e fixo: nenhuma resposta, pessoa ou empresa é real.
 */
export interface TermChange {
  readonly id: string;
  /** Forma exibida: a grafia original mais frequente, com acento. */
  readonly label: string;
  /** Respostas do período atual que citam o termo. */
  readonly current: number;
  /** Respostas do período anterior que citam o termo, ou `null` quando ele não apareceu. */
  readonly previous: number | null;
}

/** Respostas com motivo de perda escrito em cada período: os dois denominadores. */
export const totalResponses = 412;
export const previousTotalResponses = 398;

/** Os dois períodos, como se escrevem na tela. */
export const periodLabel = '3º trimestre de 2026';
export const previousPeriodLabel = '2º trimestre de 2026';

export const data: readonly TermChange[] = [
  { id: 'preco', label: 'preço', current: 96, previous: 91 },
  { id: 'prazo', label: 'prazo', current: 71, previous: 44 },
  { id: 'concorrente', label: 'concorrente', current: 58, previous: 63 },
  { id: 'orcamento', label: 'orçamento', current: 52, previous: 49 },
  { id: 'taxa', label: 'taxa', current: 47, previous: 52 },
  { id: 'momento', label: 'momento', current: 41, previous: 38 },
  { id: 'diretoria', label: 'diretoria', current: 36, previous: 22 },
  { id: 'retorno', label: 'retorno', current: 33, previous: 35 },
  { id: 'contrato', label: 'contrato', current: 30, previous: 27 },
  { id: 'aprovacao', label: 'aprovação', current: 27, previous: 17 },
  { id: 'proposta', label: 'proposta', current: 25, previous: 28 },
  { id: 'banco', label: 'banco', current: 23, previous: 24 },
  { id: 'custo', label: 'custo', current: 22, previous: 19 },
  { id: 'prioridade', label: 'prioridade', current: 20, previous: 18 },
  { id: 'risco', label: 'risco', current: 19, previous: 21 },
  { id: 'confianca', label: 'confiança', current: 18, previous: 17 },
  // Queda forte: fica em tom neutro, porque o destaque é só de quem cresceu acima do corte.
  { id: 'atendimento', label: 'atendimento', current: 17, previous: 29 },
  { id: 'demora', label: 'demora', current: 16, previous: 9 },
  // Exatamente 50% de alta: fica FORA do destaque, que pede variação acima do corte.
  { id: 'burocracia', label: 'burocracia', current: 15, previous: 10 },
  { id: 'garantia', label: 'garantia', current: 14, previous: 21 },
  { id: 'carencia', label: 'carência', current: 13, previous: 8 },
  { id: 'liquidez', label: 'liquidez', current: 13, previous: 12 },
  { id: 'familia', label: 'família', current: 11, previous: 10 },
  // Sem base anterior: sai marcado como novo e não entra no cálculo de variação.
  { id: 'socio', label: 'sócio', current: 11, previous: null },
  { id: 'minimo', label: 'mínimo', current: 10, previous: 11 },
  { id: 'desconto', label: 'desconto', current: 7, previous: 9 },
  { id: 'multa', label: 'multa', current: 7, previous: null },
  { id: 'cadastro', label: 'cadastro', current: 6, previous: 7 },
  // Base pequena: dobra de 3 para 6 e entra no destaque; a dica mostra o volume.
  { id: 'comite', label: 'comitê', current: 6, previous: 3 },
  { id: 'juridico', label: 'jurídico', current: 6, previous: 5 },
  { id: 'carteira', label: 'carteira', current: 5, previous: 6 },
  // Sem variação: 5 respostas nos dois trimestres.
  { id: 'perfil', label: 'perfil', current: 5, previous: 5 },
];
