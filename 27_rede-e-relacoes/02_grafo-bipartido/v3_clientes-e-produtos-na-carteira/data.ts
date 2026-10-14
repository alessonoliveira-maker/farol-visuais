/**
 * Produtos em carteira nas 24 contas de maior receita anual, em presença: a conta tem ou não tem
 * o produto. Dado fictício e fixo: nenhuma conta é empresa real e nenhum produto é marca real. As
 * contas levam código (C01 é a de maior receita) e os produtos levam o nome da função que cumprem.
 * A carteira tem nove produtos: os seis de maior presença têm cor fixa, e os três menores entram
 * agrupados em "Outros (3 produtos)", em neutro, pelo teto de seis categorias coloridas (COR-4).
 * Toda conta do recorte tem ao menos um produto. A lista é cortada por receita, e
 * `omittedAccounts` diz quantas contas ficaram fora.
 */
export interface Product {
  readonly id: string;
  readonly label: string;
  /** O mesmo nome no meio de uma oração, sem a maiúscula de rótulo. */
  readonly inSentence: string;
  /** Slot fixo na paleta categórica, na ordem 1, 3, 6, 5, 2, 4 (COR-8). Sem slot, é o agrupado, em neutro. */
  readonly slot?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface Account {
  readonly id: string;
  readonly label: string;
  /** Receita anual da conta, em reais. É o critério do corte e só aparece na dica. */
  readonly revenue: number;
  /** Ids dos produtos em carteira. */
  readonly products: readonly string[];
}

export interface PortfolioGraph {
  readonly accounts: readonly Account[];
  readonly products: readonly Product[];
  /** Quantas contas ficaram fora pelo corte de receita. */
  readonly omittedAccounts: number;
}

export const data: PortfolioGraph = {
  products: [
    { id: 'fiscal', label: 'Emissão fiscal', inSentence: 'emissão fiscal', slot: 1 },
    { id: 'estoque', label: 'Controle de estoque', inSentence: 'controle de estoque', slot: 3 },
    { id: 'folha', label: 'Folha de pagamento', inSentence: 'folha de pagamento', slot: 6 },
    { id: 'conciliacao', label: 'Conciliação bancária', inSentence: 'conciliação bancária', slot: 5 },
    { id: 'frota', label: 'Gestão de frota', inSentence: 'gestão de frota', slot: 2 },
    { id: 'painel', label: 'Painel gerencial', inSentence: 'painel gerencial', slot: 4 },
    { id: 'outros', label: 'Outros (3 produtos)', inSentence: 'outros produtos' },
  ],
  accounts: [
    { id: 'c01', label: 'C01', revenue: 1_842_000, products: ['fiscal', 'estoque', 'folha', 'conciliacao', 'painel'] },
    { id: 'c02', label: 'C02', revenue: 1_615_000, products: ['fiscal', 'estoque', 'folha', 'frota'] },
    { id: 'c03', label: 'C03', revenue: 1_488_000, products: ['fiscal', 'estoque', 'conciliacao'] },
    { id: 'c04', label: 'C04', revenue: 1_352_000, products: ['fiscal', 'folha', 'conciliacao', 'outros'] },
    { id: 'c05', label: 'C05', revenue: 1_207_000, products: ['fiscal', 'estoque'] },
    { id: 'c06', label: 'C06', revenue: 1_164_000, products: ['fiscal', 'estoque', 'frota'] },
    { id: 'c07', label: 'C07', revenue: 1_038_000, products: ['folha', 'conciliacao'] },
    { id: 'c08', label: 'C08', revenue: 986_000, products: ['fiscal'] },
    { id: 'c09', label: 'C09', revenue: 941_000, products: ['fiscal', 'estoque', 'painel'] },
    { id: 'c10', label: 'C10', revenue: 903_000, products: ['fiscal', 'estoque', 'folha', 'conciliacao'] },
    { id: 'c11', label: 'C11', revenue: 857_000, products: ['estoque'] },
    { id: 'c12', label: 'C12', revenue: 812_000, products: ['fiscal', 'folha'] },
    { id: 'c13', label: 'C13', revenue: 774_000, products: ['fiscal', 'estoque', 'frota'] },
    { id: 'c14', label: 'C14', revenue: 729_000, products: ['fiscal'] },
    { id: 'c15', label: 'C15', revenue: 695_000, products: ['folha', 'conciliacao', 'outros'] },
    { id: 'c16', label: 'C16', revenue: 648_000, products: ['fiscal', 'estoque'] },
    { id: 'c17', label: 'C17', revenue: 611_000, products: ['fiscal', 'frota'] },
    { id: 'c18', label: 'C18', revenue: 573_000, products: ['fiscal', 'estoque', 'painel'] },
    { id: 'c19', label: 'C19', revenue: 536_000, products: ['folha'] },
    { id: 'c20', label: 'C20', revenue: 498_000, products: ['fiscal', 'estoque'] },
    { id: 'c21', label: 'C21', revenue: 462_000, products: ['folha', 'conciliacao'] },
    { id: 'c22', label: 'C22', revenue: 427_000, products: ['fiscal'] },
    { id: 'c23', label: 'C23', revenue: 391_000, products: ['frota', 'painel', 'outros'] },
    { id: 'c24', label: 'C24', revenue: 358_000, products: ['fiscal'] },
  ],
  omittedAccounts: 36,
};
