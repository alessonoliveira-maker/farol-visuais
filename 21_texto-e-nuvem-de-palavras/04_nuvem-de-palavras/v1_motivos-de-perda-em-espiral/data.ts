/**
 * Termos dos motivos de perda escritos livremente pelo time comercial no 3º trimestre de 2026.
 * `responses` conta quantas das 412 respostas citam o termo; `occurrences` conta quantas vezes ele
 * aparece no total. Uma resposta que repete o termo três vezes pesa uma em `responses`, e é esse o
 * peso da nuvem. A soma de `responses` passa de 412 porque cada resposta cita vários termos.
 * Os termos já chegam em minúsculas, sem as palavras vazias do português e do domínio, e só entram
 * os citados por pelo menos 5 respostas.
 * Dado fictício e fixo: nenhuma resposta, pessoa ou empresa é real.
 */
export interface LossTerm {
  readonly id: string;
  /** Forma exibida: a grafia original mais frequente, com acento. */
  readonly label: string;
  /** Respostas que citam o termo ao menos uma vez. */
  readonly responses: number;
  /** Vezes em que o termo aparece, somando as repetições dentro da mesma resposta. */
  readonly occurrences: number;
}

/** Respostas com motivo de perda escrito no recorte: o denominador da taxa de citação. */
export const totalResponses = 412;

/** Período do recorte, como se escreve na tela. */
export const periodLabel = '3º trimestre de 2026';

export const data: readonly LossTerm[] = [
  { id: 'preco', label: 'preço', responses: 96, occurrences: 131 },
  { id: 'prazo', label: 'prazo', responses: 71, occurrences: 88 },
  { id: 'concorrente', label: 'concorrente', responses: 58, occurrences: 66 },
  { id: 'orcamento', label: 'orçamento', responses: 52, occurrences: 61 },
  { id: 'taxa', label: 'taxa', responses: 47, occurrences: 63 },
  { id: 'momento', label: 'momento', responses: 41, occurrences: 44 },
  { id: 'diretoria', label: 'diretoria', responses: 36, occurrences: 41 },
  { id: 'retorno', label: 'retorno', responses: 33, occurrences: 39 },
  { id: 'contrato', label: 'contrato', responses: 30, occurrences: 37 },
  { id: 'aprovacao', label: 'aprovação', responses: 27, occurrences: 31 },
  { id: 'proposta', label: 'proposta', responses: 25, occurrences: 33 },
  { id: 'banco', label: 'banco', responses: 23, occurrences: 29 },
  { id: 'custo', label: 'custo', responses: 22, occurrences: 27 },
  { id: 'prioridade', label: 'prioridade', responses: 20, occurrences: 21 },
  { id: 'risco', label: 'risco', responses: 19, occurrences: 24 },
  { id: 'confianca', label: 'confiança', responses: 18, occurrences: 19 },
  { id: 'atendimento', label: 'atendimento', responses: 17, occurrences: 20 },
  { id: 'demora', label: 'demora', responses: 16, occurrences: 18 },
  { id: 'burocracia', label: 'burocracia', responses: 15, occurrences: 16 },
  { id: 'garantia', label: 'garantia', responses: 14, occurrences: 17 },
  // Empate triplo de propósito: os três saem com o mesmo tamanho e a ordem se desempata pelo `id`.
  // O termo longo é o último a tentar lugar e é o que não cabe: fica fora com 13 respostas,
  // enquanto termos curtos de menos respostas entram. É o viés que a nota do cartão declara.
  { id: 'carencia', label: 'carência', responses: 13, occurrences: 14 },
  { id: 'liquidez', label: 'liquidez', responses: 13, occurrences: 15 },
  { id: 'rentabilidade', label: 'rentabilidade', responses: 13, occurrences: 16 },
  { id: 'familia', label: 'família', responses: 11, occurrences: 12 },
  { id: 'socio', label: 'sócio', responses: 11, occurrences: 13 },
  { id: 'imposto', label: 'imposto', responses: 10, occurrences: 13 },
  { id: 'minimo', label: 'mínimo', responses: 10, occurrences: 11 },
  { id: 'resposta', label: 'resposta', responses: 9, occurrences: 9 },
  { id: 'sucessao', label: 'sucessão', responses: 9, occurrences: 10 },
  { id: 'suporte', label: 'suporte', responses: 9, occurrences: 11 },
  { id: 'comparacao', label: 'comparação', responses: 8, occurrences: 8 },
  { id: 'plataforma', label: 'plataforma', responses: 8, occurrences: 10 },
  { id: 'relatorio', label: 'relatório', responses: 8, occurrences: 9 },
  { id: 'desconto', label: 'desconto', responses: 7, occurrences: 9 },
  { id: 'multa', label: 'multa', responses: 7, occurrences: 8 },
  { id: 'renovacao', label: 'renovação', responses: 7, occurrences: 7 },
  { id: 'cadastro', label: 'cadastro', responses: 6, occurrences: 6 },
  { id: 'comite', label: 'comitê', responses: 6, occurrences: 7 },
  { id: 'documentacao', label: 'documentação', responses: 6, occurrences: 8 },
  { id: 'juridico', label: 'jurídico', responses: 6, occurrences: 6 },
  { id: 'carteira', label: 'carteira', responses: 5, occurrences: 7 },
  { id: 'migracao', label: 'migração', responses: 5, occurrences: 6 },
  { id: 'perfil', label: 'perfil', responses: 5, occurrences: 5 },
  { id: 'portabilidade', label: 'portabilidade', responses: 5, occurrences: 5 },
];
