/**
 * Termos das anotações de oportunidades encerradas em 2026, com o número de anotações que citam cada
 * termo entre as ganhas e entre as perdidas. O termo `prazo` traz três frases de concordância curta.
 * Dado fictício e fixo: nenhum termo ou frase vem de anotação real.
 */
export interface Concordance {
  readonly grupo: 'ganhas' | 'perdidas';
  /** O trecho antes do termo, em minúsculas e sem reticências. */
  readonly antes: string;
  /** O trecho depois do termo. */
  readonly depois: string;
}

export interface TermCount {
  readonly id: string;
  readonly term: string;
  readonly ganhas: number;
  readonly perdidas: number;
  /** Frases do termo; só o termo buscado por padrão tem. */
  readonly frases?: readonly Concordance[];
}

/** O termo que a busca acende por padrão. */
export const searchedTerm = 'prazo';

export const data: readonly TermCount[] = [
  { id: 'termo-001', term: 'prazo', ganhas: 70, perdidas: 980,
    frases: [
      { grupo: 'perdidas', antes: 'o cliente achou o', depois: 'de entrega longo e fechou em outra revenda' },
      { grupo: 'ganhas', antes: 'encurtamos o', depois: 'para dez dias e a proposta andou' },
      { grupo: 'perdidas', antes: 'pediu mais', depois: 'de pagamento e o financeiro não liberou' },
    ] },
  { id: 'termo-002', term: 'cliente', ganhas: 392, perdidas: 436 },
  { id: 'termo-003', term: 'retorno', ganhas: 403, perdidas: 288 },
  { id: 'termo-004', term: 'agenda', ganhas: 195, perdidas: 289 },
  { id: 'termo-005', term: 'demonstração', ganhas: 451, perdidas: 51 },
  { id: 'termo-006', term: 'garantia', ganhas: 456, perdidas: 76 },
  { id: 'termo-007', term: 'frete', ganhas: 194, perdidas: 140 },
  { id: 'termo-008', term: 'estoque', ganhas: 171, perdidas: 134 },
  { id: 'termo-009', term: 'parcela', ganhas: 184, perdidas: 120 },
  { id: 'termo-010', term: 'valor', ganhas: 112, perdidas: 146 },
  { id: 'termo-011', term: 'preço', ganhas: 124, perdidas: 144 },
  { id: 'termo-012', term: 'condição', ganhas: 105, perdidas: 198 },
  { id: 'termo-013', term: 'pagamento', ganhas: 85, perdidas: 141 },
  { id: 'termo-014', term: 'crédito', ganhas: 119, perdidas: 194 },
  { id: 'termo-015', term: 'análise', ganhas: 163, perdidas: 86 },
  { id: 'termo-016', term: 'reunião', ganhas: 113, perdidas: 120 },
  { id: 'termo-017', term: 'orçamento', ganhas: 148, perdidas: 89 },
  { id: 'termo-018', term: 'negociação', ganhas: 84, perdidas: 160 },
  { id: 'termo-019', term: 'diretoria', ganhas: 133, perdidas: 125 },
  { id: 'termo-020', term: 'decisão', ganhas: 61, perdidas: 127 },
  { id: 'termo-021', term: 'urgência', ganhas: 27, perdidas: 165 },
  { id: 'termo-022', term: 'interesse', ganhas: 102, perdidas: 67 },
  { id: 'termo-023', term: 'dúvida', ganhas: 111, perdidas: 59 },
  { id: 'termo-024', term: 'objeção', ganhas: 102, perdidas: 126 },
  { id: 'termo-025', term: 'referência', ganhas: 86, perdidas: 114 },
  { id: 'termo-026', term: 'indicação', ganhas: 111, perdidas: 112 },
  { id: 'termo-027', term: 'renovação', ganhas: 71, perdidas: 75 },
  { id: 'termo-028', term: 'upgrade', ganhas: 80, perdidas: 85 },
  { id: 'termo-029', term: 'cancelamento', ganhas: 80, perdidas: 80 },
  { id: 'termo-030', term: 'reajuste', ganhas: 71, perdidas: 96 },
  { id: 'termo-031', term: 'vencimento', ganhas: 110, perdidas: 91 },
  { id: 'termo-032', term: 'boleto', ganhas: 98, perdidas: 95 },
  { id: 'termo-033', term: 'cartão', ganhas: 75, perdidas: 78 },
  { id: 'termo-034', term: 'pix', ganhas: 99, perdidas: 75 },
  { id: 'termo-035', term: 'entrega', ganhas: 64, perdidas: 89 },
  { id: 'termo-036', term: 'instalação', ganhas: 93, perdidas: 73 },
  { id: 'termo-037', term: 'treinamento', ganhas: 96, perdidas: 59 },
  { id: 'termo-038', term: 'suporte', ganhas: 77, perdidas: 92 },
  { id: 'termo-039', term: 'implantação', ganhas: 56, perdidas: 93 },
  { id: 'termo-040', term: 'integração', ganhas: 71, perdidas: 52 },
  { id: 'termo-041', term: 'relatório', ganhas: 47, perdidas: 92 },
  { id: 'termo-042', term: 'painel', ganhas: 46, perdidas: 76 },
  { id: 'termo-043', term: 'licença', ganhas: 56, perdidas: 51 },
  { id: 'termo-044', term: 'usuário', ganhas: 44, perdidas: 94 },
  { id: 'termo-045', term: 'plano', ganhas: 69, perdidas: 58 },
  { id: 'termo-046', term: 'pacote', ganhas: 45, perdidas: 94 },
  { id: 'termo-047', term: 'mensalidade', ganhas: 36, perdidas: 80 },
  { id: 'termo-048', term: 'anual', ganhas: 46, perdidas: 73 },
  { id: 'termo-049', term: 'trimestre', ganhas: 70, perdidas: 49 },
  { id: 'termo-050', term: 'piloto', ganhas: 39, perdidas: 68 },
  { id: 'termo-051', term: 'teste', ganhas: 46, perdidas: 87 },
  { id: 'termo-052', term: 'avaliação', ganhas: 77, perdidas: 46 },
  { id: 'termo-053', term: 'comparativo', ganhas: 89, perdidas: 50 },
  { id: 'termo-054', term: 'benefício', ganhas: 58, perdidas: 50 },
  { id: 'termo-055', term: 'economia', ganhas: 82, perdidas: 61 },
  { id: 'termo-056', term: 'mudança', ganhas: 70, perdidas: 47 },
  { id: 'termo-057', term: 'migração', ganhas: 66, perdidas: 52 },
  { id: 'termo-058', term: 'prioridade', ganhas: 68, perdidas: 42 },
  { id: 'termo-059', term: 'sócio', ganhas: 63, perdidas: 65 },
  { id: 'termo-060', term: 'gestor', ganhas: 45, perdidas: 73 },
  { id: 'termo-061', term: 'financeiro', ganhas: 51, perdidas: 35 },
  { id: 'termo-062', term: 'jurídico', ganhas: 46, perdidas: 66 },
  { id: 'termo-063', term: 'compras', ganhas: 55, perdidas: 34 },
  { id: 'termo-064', term: 'aprovador', ganhas: 50, perdidas: 54 },
  { id: 'termo-065', term: 'responsável', ganhas: 53, perdidas: 67 },
  { id: 'termo-066', term: 'assinatura', ganhas: 35, perdidas: 72 },
  { id: 'termo-067', term: 'minuta', ganhas: 29, perdidas: 59 },
  { id: 'termo-068', term: 'cláusula', ganhas: 39, perdidas: 80 },
  { id: 'termo-069', term: 'multa', ganhas: 72, perdidas: 36 },
  { id: 'termo-070', term: 'carência', ganhas: 71, perdidas: 41 },
  { id: 'termo-071', term: 'fidelidade', ganhas: 49, perdidas: 49 },
  { id: 'termo-072', term: 'reembolso', ganhas: 39, perdidas: 54 },
  { id: 'termo-073', term: 'fatura', ganhas: 33, perdidas: 55 },
  { id: 'termo-074', term: 'cobrança', ganhas: 35, perdidas: 59 },
  { id: 'termo-075', term: 'inadimplência', ganhas: 71, perdidas: 42 },
  { id: 'termo-076', term: 'histórico', ganhas: 40, perdidas: 66 },
  { id: 'termo-077', term: 'cadastro', ganhas: 39, perdidas: 74 },
  { id: 'termo-078', term: 'planilha', ganhas: 49, perdidas: 64 },
  { id: 'termo-079', term: 'sistema', ganhas: 54, perdidas: 51 },
  { id: 'termo-080', term: 'atual', ganhas: 48, perdidas: 52 },
  { id: 'termo-081', term: 'legado', ganhas: 41, perdidas: 52 },
  { id: 'termo-082', term: 'fornecedor', ganhas: 51, perdidas: 28 },
  { id: 'termo-083', term: 'parceiro', ganhas: 56, perdidas: 29 },
  { id: 'termo-084', term: 'revenda', ganhas: 52, perdidas: 30 },
  { id: 'termo-085', term: 'canal', ganhas: 32, perdidas: 43 },
  { id: 'termo-086', term: 'região', ganhas: 38, perdidas: 60 },
  { id: 'termo-087', term: 'filial', ganhas: 53, perdidas: 53 },
  { id: 'termo-088', term: 'matriz', ganhas: 35, perdidas: 54 },
  { id: 'termo-089', term: 'frota', ganhas: 53, perdidas: 31 },
  { id: 'termo-090', term: 'equipe', ganhas: 50, perdidas: 33 },
  { id: 'termo-091', term: 'time', ganhas: 52, perdidas: 26 },
  { id: 'termo-092', term: 'operação', ganhas: 44, perdidas: 28 },
  { id: 'termo-093', term: 'rotina', ganhas: 38, perdidas: 28 },
  { id: 'termo-094', term: 'processo', ganhas: 45, perdidas: 26 },
  { id: 'termo-095', term: 'cronograma', ganhas: 32, perdidas: 50 },
  { id: 'termo-096', term: 'meta', ganhas: 61, perdidas: 25 },
  { id: 'termo-097', term: 'resultado', ganhas: 50, perdidas: 31 },
  { id: 'termo-098', term: 'crescimento', ganhas: 69, perdidas: 36 },
  { id: 'termo-099', term: 'sazonalidade', ganhas: 33, perdidas: 63 },
  { id: 'termo-100', term: 'campanha', ganhas: 37, perdidas: 44 },
];
