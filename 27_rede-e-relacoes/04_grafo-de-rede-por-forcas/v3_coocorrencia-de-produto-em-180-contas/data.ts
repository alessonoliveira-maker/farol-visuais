/**
 * Coocorrência de produto entre contas: cada ligação diz quantos produtos duas contas têm em comum
 * na posição de 2026-09. São 180 contas e 558 pares com produto em comum, dos quais 236 dividem
 * um produto só. Par sem produto em comum não aparece.
 * Dado fictício e fixo: nenhuma conta é empresa real. O array saiu de um gerador com semente fixa e
 * está escrito aqui por extenso, para o desenho não depender de sorteio em tempo de tela (DAD-3).
 */
export type ProductId =
  | 'carteira'
  | 'previdencia'
  | 'credito'
  | 'seguros'
  | 'cambio'
  | 'consorcio'
  | 'arrendamento'
  | 'fianca'
  | 'custodia';

export interface Product {
  readonly id: ProductId;
  readonly label: string;
  /**
   * Posição fixa do produto na paleta (`--chart-1` a `--chart-6`), na ordem 1, 3, 6, 5, 2, 4 (COR-8).
   * Produto sem slot (`null`) entra em Outros: o teto é de 6 categorias coloridas (COR-4), e a cor
   * pertence ao produto, não à posição dele no ranking (COR-3).
   */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6 | null;
}

export const products: readonly Product[] = [
  { id: 'carteira', label: 'Gestão de carteira', slot: 1 },
  { id: 'previdencia', label: 'Previdência', slot: 3 },
  { id: 'credito', label: 'Crédito estruturado', slot: 6 },
  { id: 'seguros', label: 'Seguro de vida', slot: 5 },
  { id: 'cambio', label: 'Câmbio', slot: 2 },
  { id: 'consorcio', label: 'Consórcio', slot: 4 },
  { id: 'arrendamento', label: 'Arrendamento', slot: null },
  { id: 'fianca', label: 'Fiança bancária', slot: null },
  { id: 'custodia', label: 'Custódia', slot: null },
];

export interface AccountLink {
  /** Id da outra conta do par. Cada par aparece uma vez, na conta que vem antes no arquivo. */
  readonly to: string;
  /** Quantos produtos as duas contas têm em comum. */
  readonly shared: number;
}

export interface AccountNode {
  readonly id: string;
  readonly name: string;
  /** Produto dominante da conta: o de maior receita nela. */
  readonly product: ProductId;
  readonly links: readonly AccountLink[];
}

export const data: readonly AccountNode[] = [
  { id: 'a-001', name: 'Oficina Litoral', product: 'carteira', links: [{ to: 'a-011', shared: 1 }, { to: 'a-049', shared: 3 }, { to: 'a-062', shared: 4 }, { to: 'a-088', shared: 1 }, { to: 'a-105', shared: 1 }, { to: 'a-107', shared: 4 }, { to: 'a-118', shared: 4 }, { to: 'a-121', shared: 3 }, { to: 'a-129', shared: 2 }, { to: 'a-177', shared: 1 }] },
  { id: 'a-002', name: 'Logística Serra', product: 'cambio', links: [{ to: 'a-004', shared: 1 }, { to: 'a-013', shared: 2 }, { to: 'a-034', shared: 2 }, { to: 'a-084', shared: 2 }, { to: 'a-090', shared: 1 }, { to: 'a-125', shared: 1 }, { to: 'a-132', shared: 1 }, { to: 'a-133', shared: 2 }, { to: 'a-142', shared: 1 }] },
  { id: 'a-003', name: 'Distribuidora Serra', product: 'credito', links: [{ to: 'a-020', shared: 1 }, { to: 'a-062', shared: 1 }, { to: 'a-070', shared: 2 }, { to: 'a-119', shared: 2 }, { to: 'a-128', shared: 3 }, { to: 'a-136', shared: 1 }, { to: 'a-159', shared: 3 }, { to: 'a-175', shared: 3 }] },
  { id: 'a-004', name: 'Mercado Pontal', product: 'cambio', links: [{ to: 'a-019', shared: 2 }, { to: 'a-035', shared: 1 }, { to: 'a-077', shared: 2 }, { to: 'a-110', shared: 1 }, { to: 'a-160', shared: 2 }, { to: 'a-174', shared: 2 }] },
  { id: 'a-005', name: 'Construtora Colina', product: 'fianca', links: [{ to: 'a-033', shared: 2 }, { to: 'a-038', shared: 2 }, { to: 'a-106', shared: 1 }, { to: 'a-134', shared: 2 }] },
  { id: 'a-006', name: 'Agro Campos', product: 'cambio', links: [{ to: 'a-011', shared: 2 }, { to: 'a-122', shared: 1 }, { to: 'a-133', shared: 2 }, { to: 'a-148', shared: 1 }] },
  { id: 'a-007', name: 'Editora Pontal', product: 'arrendamento', links: [{ to: 'a-104', shared: 1 }, { to: 'a-113', shared: 2 }, { to: 'a-120', shared: 2 }] },
  { id: 'a-008', name: 'Transportes Central', product: 'previdencia', links: [{ to: 'a-020', shared: 2 }, { to: 'a-056', shared: 2 }, { to: 'a-064', shared: 2 }, { to: 'a-081', shared: 2 }, { to: 'a-127', shared: 2 }, { to: 'a-135', shared: 1 }] },
  { id: 'a-009', name: 'Farmácia Mirante', product: 'credito', links: [{ to: 'a-019', shared: 1 }, { to: 'a-024', shared: 1 }, { to: 'a-075', shared: 1 }, { to: 'a-126', shared: 1 }, { to: 'a-147', shared: 4 }, { to: 'a-179', shared: 2 }] },
  { id: 'a-010', name: 'Mercado Norte', product: 'previdencia', links: [{ to: 'a-020', shared: 2 }, { to: 'a-075', shared: 2 }, { to: 'a-087', shared: 2 }, { to: 'a-094', shared: 2 }, { to: 'a-115', shared: 2 }, { to: 'a-150', shared: 2 }] },
  { id: 'a-011', name: 'Distribuidora Central', product: 'cambio', links: [{ to: 'a-012', shared: 2 }, { to: 'a-014', shared: 3 }, { to: 'a-076', shared: 2 }, { to: 'a-141', shared: 1 }, { to: 'a-177', shared: 2 }] },
  { id: 'a-012', name: 'Agro Colina', product: 'credito', links: [{ to: 'a-077', shared: 3 }, { to: 'a-086', shared: 2 }, { to: 'a-175', shared: 1 }, { to: 'a-179', shared: 1 }] },
  { id: 'a-013', name: 'Construtora Norte', product: 'cambio', links: [{ to: 'a-077', shared: 2 }, { to: 'a-084', shared: 2 }, { to: 'a-125', shared: 1 }] },
  { id: 'a-014', name: 'Indústria Sul', product: 'cambio', links: [{ to: 'a-044', shared: 1 }, { to: 'a-054', shared: 3 }, { to: 'a-094', shared: 1 }, { to: 'a-104', shared: 2 }, { to: 'a-154', shared: 1 }, { to: 'a-180', shared: 1 }] },
  { id: 'a-015', name: 'Logística Mirante', product: 'previdencia', links: [{ to: 'a-040', shared: 1 }, { to: 'a-088', shared: 3 }, { to: 'a-112', shared: 1 }, { to: 'a-153', shared: 1 }, { to: 'a-157', shared: 1 }, { to: 'a-169', shared: 1 }, { to: 'a-170', shared: 2 }, { to: 'a-171', shared: 2 }] },
  { id: 'a-016', name: 'Mercado Serra', product: 'carteira', links: [{ to: 'a-062', shared: 3 }, { to: 'a-072', shared: 4 }, { to: 'a-085', shared: 1 }, { to: 'a-093', shared: 2 }, { to: 'a-105', shared: 2 }] },
  { id: 'a-017', name: 'Farmácia Campos', product: 'arrendamento', links: [{ to: 'a-025', shared: 1 }, { to: 'a-092', shared: 1 }, { to: 'a-113', shared: 3 }, { to: 'a-121', shared: 1 }, { to: 'a-134', shared: 1 }, { to: 'a-142', shared: 1 }, { to: 'a-161', shared: 1 }, { to: 'a-176', shared: 2 }] },
  { id: 'a-018', name: 'Agro Norte', product: 'consorcio', links: [{ to: 'a-021', shared: 2 }, { to: 'a-023', shared: 3 }, { to: 'a-024', shared: 4 }, { to: 'a-059', shared: 2 }, { to: 'a-122', shared: 2 }, { to: 'a-131', shared: 2 }] },
  { id: 'a-019', name: 'Distribuidora Leste', product: 'cambio', links: [{ to: 'a-035', shared: 1 }, { to: 'a-074', shared: 1 }, { to: 'a-077', shared: 2 }, { to: 'a-109', shared: 1 }, { to: 'a-112', shared: 3 }, { to: 'a-133', shared: 2 }] },
  { id: 'a-020', name: 'Construtora Mirante', product: 'previdencia', links: [{ to: 'a-042', shared: 1 }, { to: 'a-064', shared: 2 }] },
  { id: 'a-021', name: 'Gráfica Central', product: 'consorcio', links: [{ to: 'a-087', shared: 1 }, { to: 'a-096', shared: 1 }, { to: 'a-131', shared: 3 }, { to: 'a-138', shared: 2 }, { to: 'a-144', shared: 2 }, { to: 'a-148', shared: 1 }, { to: 'a-156', shared: 1 }] },
  { id: 'a-022', name: 'Distribuidora Campos', product: 'seguros', links: [{ to: 'a-047', shared: 1 }, { to: 'a-050', shared: 3 }, { to: 'a-058', shared: 2 }, { to: 'a-064', shared: 3 }, { to: 'a-089', shared: 1 }, { to: 'a-142', shared: 1 }, { to: 'a-168', shared: 3 }] },
  { id: 'a-023', name: 'Agro Leste', product: 'consorcio', links: [{ to: 'a-038', shared: 1 }, { to: 'a-044', shared: 1 }, { to: 'a-094', shared: 1 }, { to: 'a-100', shared: 1 }, { to: 'a-127', shared: 1 }, { to: 'a-149', shared: 2 }] },
  { id: 'a-024', name: 'Distribuidora Colina', product: 'consorcio', links: [{ to: 'a-042', shared: 2 }, { to: 'a-045', shared: 1 }, { to: 'a-138', shared: 3 }, { to: 'a-139', shared: 2 }, { to: 'a-144', shared: 2 }, { to: 'a-149', shared: 2 }] },
  { id: 'a-025', name: 'Logística Litoral', product: 'previdencia', links: [{ to: 'a-060', shared: 2 }, { to: 'a-100', shared: 2 }, { to: 'a-170', shared: 2 }] },
  { id: 'a-026', name: 'Logística Central', product: 'seguros', links: [{ to: 'a-028', shared: 3 }, { to: 'a-050', shared: 4 }, { to: 'a-065', shared: 2 }, { to: 'a-134', shared: 1 }, { to: 'a-139', shared: 1 }, { to: 'a-150', shared: 1 }, { to: 'a-168', shared: 2 }] },
  { id: 'a-027', name: 'Escola Leste', product: 'carteira', links: [{ to: 'a-046', shared: 3 }, { to: 'a-068', shared: 1 }, { to: 'a-071', shared: 3 }, { to: 'a-079', shared: 3 }, { to: 'a-091', shared: 4 }, { to: 'a-109', shared: 1 }, { to: 'a-118', shared: 2 }, { to: 'a-128', shared: 1 }, { to: 'a-164', shared: 1 }] },
  { id: 'a-028', name: 'Indústria Leste', product: 'seguros', links: [{ to: 'a-031', shared: 2 }, { to: 'a-045', shared: 4 }, { to: 'a-050', shared: 2 }, { to: 'a-157', shared: 2 }] },
  { id: 'a-029', name: 'Agro Oeste', product: 'previdencia', links: [{ to: 'a-064', shared: 2 }, { to: 'a-065', shared: 1 }, { to: 'a-092', shared: 1 }, { to: 'a-095', shared: 2 }, { to: 'a-099', shared: 2 }, { to: 'a-143', shared: 1 }, { to: 'a-171', shared: 4 }] },
  { id: 'a-030', name: 'Gráfica Leste', product: 'seguros', links: [{ to: 'a-037', shared: 2 }, { to: 'a-045', shared: 1 }, { to: 'a-084', shared: 4 }, { to: 'a-133', shared: 1 }, { to: 'a-143', shared: 2 }, { to: 'a-161', shared: 3 }, { to: 'a-172', shared: 4 }, { to: 'a-177', shared: 2 }] },
  { id: 'a-031', name: 'Gráfica Norte', product: 'seguros', links: [{ to: 'a-098', shared: 2 }, { to: 'a-099', shared: 1 }, { to: 'a-156', shared: 3 }] },
  { id: 'a-032', name: 'Indústria Colina', product: 'credito', links: [{ to: 'a-063', shared: 4 }, { to: 'a-103', shared: 3 }, { to: 'a-122', shared: 1 }] },
  { id: 'a-033', name: 'Farmácia Central', product: 'fianca', links: [{ to: 'a-040', shared: 1 }, { to: 'a-089', shared: 1 }, { to: 'a-134', shared: 2 }, { to: 'a-136', shared: 3 }, { to: 'a-145', shared: 1 }, { to: 'a-148', shared: 2 }] },
  { id: 'a-034', name: 'Escola Litoral', product: 'cambio', links: [{ to: 'a-084', shared: 2 }, { to: 'a-104', shared: 3 }, { to: 'a-157', shared: 1 }, { to: 'a-160', shared: 4 }, { to: 'a-174', shared: 1 }, { to: 'a-180', shared: 1 }] },
  { id: 'a-035', name: 'Oficina Lagos', product: 'previdencia', links: [{ to: 'a-040', shared: 1 }, { to: 'a-069', shared: 2 }, { to: 'a-087', shared: 3 }, { to: 'a-088', shared: 3 }, { to: 'a-091', shared: 1 }, { to: 'a-109', shared: 1 }, { to: 'a-168', shared: 1 }, { to: 'a-169', shared: 1 }] },
  { id: 'a-036', name: 'Distribuidora Sul', product: 'seguros', links: [{ to: 'a-058', shared: 2 }, { to: 'a-065', shared: 2 }, { to: 'a-080', shared: 1 }, { to: 'a-098', shared: 3 }, { to: 'a-111', shared: 2 }, { to: 'a-136', shared: 1 }, { to: 'a-140', shared: 1 }, { to: 'a-156', shared: 2 }] },
  { id: 'a-037', name: 'Mercado Sul', product: 'seguros', links: [{ to: 'a-045', shared: 2 }, { to: 'a-080', shared: 1 }, { to: 'a-139', shared: 1 }] },
  { id: 'a-038', name: 'Editora Mirante', product: 'fianca', links: [{ to: 'a-108', shared: 1 }, { to: 'a-134', shared: 2 }, { to: 'a-136', shared: 2 }, { to: 'a-147', shared: 1 }, { to: 'a-177', shared: 1 }] },
  { id: 'a-039', name: 'Construtora Oeste', product: 'credito', links: [{ to: 'a-103', shared: 2 }, { to: 'a-106', shared: 2 }, { to: 'a-148', shared: 3 }] },
  { id: 'a-040', name: 'Oficina Leste', product: 'carteira', links: [{ to: 'a-047', shared: 1 }, { to: 'a-101', shared: 4 }, { to: 'a-115', shared: 1 }, { to: 'a-118', shared: 2 }, { to: 'a-178', shared: 1 }] },
  { id: 'a-041', name: 'Transportes Lagos', product: 'carteira', links: [{ to: 'a-090', shared: 1 }, { to: 'a-103', shared: 1 }, { to: 'a-107', shared: 2 }, { to: 'a-175', shared: 1 }] },
  { id: 'a-042', name: 'Transportes Oeste', product: 'consorcio', links: [{ to: 'a-131', shared: 3 }, { to: 'a-144', shared: 3 }, { to: 'a-149', shared: 2 }] },
  { id: 'a-043', name: 'Distribuidora Pontal', product: 'cambio', links: [{ to: 'a-076', shared: 2 }, { to: 'a-093', shared: 1 }, { to: 'a-102', shared: 1 }, { to: 'a-104', shared: 2 }, { to: 'a-124', shared: 2 }, { to: 'a-145', shared: 2 }] },
  { id: 'a-044', name: 'Mercado Lagos', product: 'carteira', links: [{ to: 'a-068', shared: 1 }, { to: 'a-069', shared: 1 }, { to: 'a-084', shared: 1 }, { to: 'a-089', shared: 2 }, { to: 'a-093', shared: 3 }, { to: 'a-118', shared: 2 }, { to: 'a-167', shared: 4 }] },
  { id: 'a-045', name: 'Transportes Leste', product: 'seguros', links: [{ to: 'a-080', shared: 2 }, { to: 'a-141', shared: 2 }] },
  { id: 'a-046', name: 'Padaria Oeste', product: 'carteira', links: [{ to: 'a-048', shared: 1 }, { to: 'a-055', shared: 3 }, { to: 'a-120', shared: 1 }] },
  { id: 'a-047', name: 'Padaria Central', product: 'credito', links: [{ to: 'a-097', shared: 3 }, { to: 'a-106', shared: 3 }, { to: 'a-140', shared: 1 }, { to: 'a-147', shared: 2 }, { to: 'a-155', shared: 2 }, { to: 'a-175', shared: 3 }] },
  { id: 'a-048', name: 'Clínica Leste', product: 'carteira', links: [{ to: 'a-068', shared: 2 }, { to: 'a-072', shared: 2 }, { to: 'a-089', shared: 3 }, { to: 'a-136', shared: 1 }] },
  { id: 'a-049', name: 'Hotel Leste', product: 'carteira', links: [{ to: 'a-062', shared: 4 }, { to: 'a-093', shared: 3 }, { to: 'a-101', shared: 2 }, { to: 'a-162', shared: 1 }] },
  { id: 'a-050', name: 'Hotel Lagos', product: 'seguros', links: [{ to: 'a-080', shared: 3 }, { to: 'a-087', shared: 1 }, { to: 'a-088', shared: 1 }, { to: 'a-146', shared: 2 }, { to: 'a-154', shared: 3 }] },
  { id: 'a-051', name: 'Farmácia Lagos', product: 'previdencia', links: [{ to: 'a-060', shared: 2 }, { to: 'a-061', shared: 2 }, { to: 'a-115', shared: 2 }, { to: 'a-123', shared: 2 }, { to: 'a-152', shared: 2 }, { to: 'a-169', shared: 2 }] },
  { id: 'a-052', name: 'Hotel Oeste', product: 'credito', links: [{ to: 'a-093', shared: 1 }, { to: 'a-127', shared: 4 }, { to: 'a-135', shared: 1 }, { to: 'a-137', shared: 2 }, { to: 'a-140', shared: 2 }, { to: 'a-142', shared: 2 }, { to: 'a-175', shared: 3 }] },
  { id: 'a-053', name: 'Clínica Mirante', product: 'consorcio', links: [{ to: 'a-116', shared: 1 }, { to: 'a-139', shared: 4 }, { to: 'a-164', shared: 2 }, { to: 'a-165', shared: 2 }] },
  { id: 'a-054', name: 'Padaria Leste', product: 'cambio', links: [{ to: 'a-084', shared: 4 }, { to: 'a-094', shared: 1 }, { to: 'a-105', shared: 1 }, { to: 'a-137', shared: 1 }, { to: 'a-157', shared: 1 }] },
  { id: 'a-055', name: 'Oficina Pontal', product: 'carteira', links: [{ to: 'a-066', shared: 2 }, { to: 'a-076', shared: 1 }, { to: 'a-093', shared: 3 }, { to: 'a-177', shared: 1 }] },
  { id: 'a-056', name: 'Farmácia Oeste', product: 'previdencia', links: [{ to: 'a-082', shared: 1 }, { to: 'a-104', shared: 1 }, { to: 'a-141', shared: 1 }] },
  { id: 'a-057', name: 'Gráfica Colina', product: 'credito', links: [{ to: 'a-063', shared: 2 }, { to: 'a-139', shared: 1 }, { to: 'a-155', shared: 2 }] },
  { id: 'a-058', name: 'Hotel Campos', product: 'seguros', links: [{ to: 'a-154', shared: 2 }, { to: 'a-166', shared: 2 }] },
  { id: 'a-059', name: 'Agro Mirante', product: 'consorcio', links: [{ to: 'a-069', shared: 1 }, { to: 'a-160', shared: 3 }, { to: 'a-162', shared: 1 }, { to: 'a-165', shared: 3 }] },
  { id: 'a-060', name: 'Oficina Colina', product: 'previdencia', links: [{ to: 'a-116', shared: 1 }, { to: 'a-123', shared: 2 }, { to: 'a-171', shared: 4 }, { to: 'a-173', shared: 1 }, { to: 'a-175', shared: 1 }] },
  { id: 'a-061', name: 'Indústria Central', product: 'previdencia', links: [{ to: 'a-081', shared: 2 }, { to: 'a-118', shared: 1 }, { to: 'a-169', shared: 2 }, { to: 'a-178', shared: 2 }] },
  { id: 'a-062', name: 'Construtora Campos', product: 'carteira', links: [{ to: 'a-068', shared: 4 }, { to: 'a-119', shared: 1 }, { to: 'a-121', shared: 2 }, { to: 'a-136', shared: 1 }, { to: 'a-177', shared: 1 }] },
  { id: 'a-063', name: 'Gráfica Sul', product: 'credito', links: [{ to: 'a-097', shared: 2 }, { to: 'a-112', shared: 1 }] },
  { id: 'a-064', name: 'Hotel Pontal', product: 'previdencia', links: [{ to: 'a-130', shared: 2 }, { to: 'a-159', shared: 1 }] },
  { id: 'a-065', name: 'Escola Campos', product: 'seguros', links: [{ to: 'a-143', shared: 1 }] },
  { id: 'a-066', name: 'Escola Lagos', product: 'carteira', links: [{ to: 'a-067', shared: 2 }, { to: 'a-093', shared: 4 }, { to: 'a-118', shared: 2 }, { to: 'a-120', shared: 1 }, { to: 'a-167', shared: 2 }] },
  { id: 'a-067', name: 'Farmácia Colina', product: 'carteira', links: [{ to: 'a-073', shared: 2 }, { to: 'a-082', shared: 1 }, { to: 'a-101', shared: 2 }, { to: 'a-110', shared: 4 }] },
  { id: 'a-068', name: 'Oficina Sul', product: 'carteira', links: [{ to: 'a-085', shared: 3 }, { to: 'a-163', shared: 2 }] },
  { id: 'a-069', name: 'Farmácia Litoral', product: 'previdencia', links: [{ to: 'a-088', shared: 4 }, { to: 'a-099', shared: 2 }, { to: 'a-123', shared: 2 }, { to: 'a-126', shared: 2 }, { to: 'a-147', shared: 1 }, { to: 'a-158', shared: 1 }] },
  { id: 'a-070', name: 'Agro Sul', product: 'credito', links: [{ to: 'a-102', shared: 4 }, { to: 'a-124', shared: 1 }, { to: 'a-125', shared: 2 }] },
  { id: 'a-071', name: 'Hotel Central', product: 'carteira', links: [{ to: 'a-073', shared: 2 }, { to: 'a-081', shared: 1 }, { to: 'a-095', shared: 1 }, { to: 'a-130', shared: 1 }, { to: 'a-162', shared: 1 }] },
  { id: 'a-072', name: 'Clínica Serra', product: 'carteira', links: [{ to: 'a-080', shared: 1 }, { to: 'a-096', shared: 2 }, { to: 'a-107', shared: 2 }, { to: 'a-163', shared: 2 }] },
  { id: 'a-073', name: 'Clínica Pontal', product: 'carteira', links: [{ to: 'a-107', shared: 2 }, { to: 'a-133', shared: 1 }, { to: 'a-153', shared: 2 }, { to: 'a-173', shared: 2 }] },
  { id: 'a-074', name: 'Hotel Mirante', product: 'custodia', links: [{ to: 'a-084', shared: 1 }, { to: 'a-135', shared: 2 }, { to: 'a-145', shared: 4 }, { to: 'a-146', shared: 1 }] },
  { id: 'a-075', name: 'Mercado Mirante', product: 'previdencia', links: [{ to: 'a-087', shared: 3 }, { to: 'a-117', shared: 3 }, { to: 'a-122', shared: 1 }, { to: 'a-129', shared: 1 }, { to: 'a-143', shared: 1 }, { to: 'a-170', shared: 2 }] },
  { id: 'a-076', name: 'Clínica Norte', product: 'cambio', links: [{ to: 'a-092', shared: 2 }, { to: 'a-112', shared: 2 }, { to: 'a-119', shared: 1 }] },
  { id: 'a-077', name: 'Oficina Mirante', product: 'cambio', links: [{ to: 'a-092', shared: 4 }, { to: 'a-093', shared: 1 }, { to: 'a-103', shared: 1 }, { to: 'a-116', shared: 4 }] },
  { id: 'a-078', name: 'Editora Central', product: 'previdencia', links: [{ to: 'a-094', shared: 3 }, { to: 'a-126', shared: 3 }, { to: 'a-158', shared: 3 }] },
  { id: 'a-079', name: 'Hotel Litoral', product: 'carteira', links: [{ to: 'a-129', shared: 2 }, { to: 'a-163', shared: 2 }] },
  { id: 'a-080', name: 'Escola Colina', product: 'seguros', links: [{ to: 'a-146', shared: 2 }, { to: 'a-172', shared: 2 }] },
  { id: 'a-081', name: 'Agro Central', product: 'previdencia', links: [{ to: 'a-090', shared: 1 }, { to: 'a-134', shared: 1 }, { to: 'a-178', shared: 2 }] },
  { id: 'a-082', name: 'Padaria Colina', product: 'carteira', links: [{ to: 'a-093', shared: 2 }, { to: 'a-107', shared: 2 }, { to: 'a-108', shared: 3 }, { to: 'a-123', shared: 1 }, { to: 'a-176', shared: 1 }] },
  { id: 'a-083', name: 'Padaria Mirante', product: 'credito', links: [{ to: 'a-109', shared: 1 }, { to: 'a-114', shared: 3 }, { to: 'a-125', shared: 3 }, { to: 'a-127', shared: 1 }, { to: 'a-147', shared: 2 }] },
  { id: 'a-084', name: 'Gráfica Serra', product: 'cambio', links: [{ to: 'a-124', shared: 2 }] },
  { id: 'a-085', name: 'Logística Oeste', product: 'carteira', links: [{ to: 'a-090', shared: 1 }, { to: 'a-108', shared: 3 }, { to: 'a-150', shared: 1 }, { to: 'a-162', shared: 2 }, { to: 'a-163', shared: 4 }, { to: 'a-167', shared: 4 }] },
  { id: 'a-086', name: 'Construtora Pontal', product: 'credito', links: [{ to: 'a-102', shared: 4 }, { to: 'a-114', shared: 1 }, { to: 'a-132', shared: 1 }, { to: 'a-137', shared: 2 }, { to: 'a-140', shared: 2 }, { to: 'a-151', shared: 1 }] },
  { id: 'a-087', name: 'Logística Leste', product: 'previdencia', links: [{ to: 'a-117', shared: 1 }] },
  { id: 'a-088', name: 'Clínica Colina', product: 'previdencia', links: [{ to: 'a-117', shared: 2 }, { to: 'a-169', shared: 2 }] },
  { id: 'a-089', name: 'Construtora Lagos', product: 'carteira', links: [{ to: 'a-101', shared: 2 }, { to: 'a-105', shared: 1 }, { to: 'a-118', shared: 2 }] },
  { id: 'a-090', name: 'Indústria Litoral', product: 'consorcio', links: [{ to: 'a-114', shared: 1 }, { to: 'a-144', shared: 2 }, { to: 'a-152', shared: 1 }] },
  { id: 'a-091', name: 'Gráfica Oeste', product: 'carteira', links: [{ to: 'a-167', shared: 3 }, { to: 'a-173', shared: 1 }] },
  { id: 'a-092', name: 'Indústria Lagos', product: 'cambio', links: [{ to: 'a-177', shared: 2 }] },
  { id: 'a-093', name: 'Transportes Sul', product: 'carteira', links: [{ to: 'a-137', shared: 1 }] },
  { id: 'a-094', name: 'Transportes Mirante', product: 'previdencia', links: [{ to: 'a-106', shared: 1 }, { to: 'a-108', shared: 3 }, { to: 'a-152', shared: 2 }] },
  { id: 'a-095', name: 'Escola Sul', product: 'previdencia', links: [{ to: 'a-100', shared: 2 }, { to: 'a-127', shared: 2 }, { to: 'a-153', shared: 1 }, { to: 'a-171', shared: 1 }] },
  { id: 'a-096', name: 'Construtora Serra', product: 'carteira', links: [{ to: 'a-110', shared: 2 }, { to: 'a-135', shared: 1 }, { to: 'a-154', shared: 1 }] },
  { id: 'a-097', name: 'Agro Litoral', product: 'credito', links: [{ to: 'a-102', shared: 2 }, { to: 'a-148', shared: 3 }] },
  { id: 'a-098', name: 'Distribuidora Mirante', product: 'seguros', links: [{ to: 'a-122', shared: 1 }, { to: 'a-130', shared: 3 }, { to: 'a-175', shared: 2 }] },
  { id: 'a-099', name: 'Clínica Litoral', product: 'previdencia', links: [{ to: 'a-105', shared: 1 }, { to: 'a-117', shared: 2 }, { to: 'a-131', shared: 1 }] },
  { id: 'a-100', name: 'Farmácia Leste', product: 'previdencia', links: [{ to: 'a-117', shared: 2 }, { to: 'a-126', shared: 2 }] },
  { id: 'a-101', name: 'Logística Campos', product: 'carteira', links: [{ to: 'a-102', shared: 1 }, { to: 'a-108', shared: 2 }, { to: 'a-146', shared: 1 }, { to: 'a-148', shared: 1 }, { to: 'a-158', shared: 1 }] },
  { id: 'a-102', name: 'Distribuidora Lagos', product: 'credito', links: [{ to: 'a-114', shared: 2 }, { to: 'a-119', shared: 3 }, { to: 'a-145', shared: 1 }, { to: 'a-174', shared: 1 }, { to: 'a-180', shared: 3 }] },
  { id: 'a-103', name: 'Editora Oeste', product: 'credito', links: [{ to: 'a-125', shared: 2 }, { to: 'a-136', shared: 1 }, { to: 'a-142', shared: 2 }] },
  { id: 'a-104', name: 'Logística Colina', product: 'cambio', links: [{ to: 'a-149', shared: 1 }] },
  { id: 'a-105', name: 'Mercado Central', product: 'carteira', links: [{ to: 'a-148', shared: 1 }] },
  { id: 'a-106', name: 'Distribuidora Norte', product: 'credito', links: [{ to: 'a-137', shared: 3 }, { to: 'a-159', shared: 2 }, { to: 'a-163', shared: 1 }] },
  { id: 'a-107', name: 'Transportes Colina', product: 'carteira', links: [{ to: 'a-129', shared: 2 }, { to: 'a-149', shared: 1 }, { to: 'a-156', shared: 1 }] },
  { id: 'a-108', name: 'Padaria Sul', product: 'carteira', links: [{ to: 'a-150', shared: 2 }, { to: 'a-154', shared: 1 }, { to: 'a-157', shared: 1 }, { to: 'a-158', shared: 4 }] },
  { id: 'a-109', name: 'Editora Serra', product: 'carteira', links: [{ to: 'a-121', shared: 1 }, { to: 'a-173', shared: 3 }, { to: 'a-174', shared: 1 }] },
  { id: 'a-110', name: 'Construtora Sul', product: 'carteira', links: [{ to: 'a-129', shared: 2 }] },
  { id: 'a-111', name: 'Construtora Litoral', product: 'seguros', links: [{ to: 'a-130', shared: 4 }, { to: 'a-156', shared: 2 }, { to: 'a-175', shared: 2 }] },
  { id: 'a-112', name: 'Farmácia Norte', product: 'cambio', links: [{ to: 'a-145', shared: 1 }] },
  { id: 'a-113', name: 'Mercado Litoral', product: 'arrendamento', links: [{ to: 'a-120', shared: 2 }, { to: 'a-148', shared: 1 }, { to: 'a-162', shared: 2 }] },
  { id: 'a-114', name: 'Gráfica Litoral', product: 'credito', links: [{ to: 'a-115', shared: 1 }, { to: 'a-116', shared: 1 }, { to: 'a-148', shared: 2 }, { to: 'a-171', shared: 1 }] },
  { id: 'a-115', name: 'Transportes Campos', product: 'previdencia', links: [{ to: 'a-150', shared: 3 }, { to: 'a-158', shared: 3 }, { to: 'a-170', shared: 4 }, { to: 'a-171', shared: 2 }] },
  { id: 'a-116', name: 'Indústria Norte', product: 'cambio', links: [] },
  { id: 'a-117', name: 'Mercado Campos', product: 'previdencia', links: [{ to: 'a-141', shared: 1 }, { to: 'a-178', shared: 4 }] },
  { id: 'a-118', name: 'Editora Lagos', product: 'carteira', links: [] },
  { id: 'a-119', name: 'Logística Sul', product: 'credito', links: [{ to: 'a-125', shared: 2 }, { to: 'a-179', shared: 3 }] },
  { id: 'a-120', name: 'Construtora Central', product: 'arrendamento', links: [{ to: 'a-130', shared: 1 }, { to: 'a-135', shared: 1 }, { to: 'a-156', shared: 1 }, { to: 'a-162', shared: 3 }, { to: 'a-176', shared: 3 }, { to: 'a-180', shared: 1 }] },
  { id: 'a-121', name: 'Oficina Oeste', product: 'carteira', links: [] },
  { id: 'a-122', name: 'Distribuidora Litoral', product: 'consorcio', links: [{ to: 'a-179', shared: 1 }] },
  { id: 'a-123', name: 'Clínica Lagos', product: 'previdencia', links: [{ to: 'a-158', shared: 2 }] },
  { id: 'a-124', name: 'Agro Lagos', product: 'cambio', links: [{ to: 'a-167', shared: 1 }] },
  { id: 'a-125', name: 'Transportes Norte', product: 'credito', links: [{ to: 'a-143', shared: 1 }, { to: 'a-148', shared: 2 }, { to: 'a-159', shared: 1 }, { to: 'a-168', shared: 1 }] },
  { id: 'a-126', name: 'Indústria Oeste', product: 'previdencia', links: [] },
  { id: 'a-127', name: 'Padaria Campos', product: 'previdencia', links: [{ to: 'a-140', shared: 3 }, { to: 'a-165', shared: 1 }, { to: 'a-167', shared: 1 }] },
  { id: 'a-128', name: 'Editora Colina', product: 'credito', links: [{ to: 'a-142', shared: 1 }] },
  { id: 'a-129', name: 'Hotel Colina', product: 'carteira', links: [{ to: 'a-151', shared: 3 }] },
  { id: 'a-130', name: 'Escola Mirante', product: 'seguros', links: [{ to: 'a-157', shared: 3 }, { to: 'a-161', shared: 4 }] },
  { id: 'a-131', name: 'Padaria Lagos', product: 'consorcio', links: [{ to: 'a-144', shared: 2 }, { to: 'a-146', shared: 1 }, { to: 'a-161', shared: 1 }, { to: 'a-165', shared: 1 }] },
  { id: 'a-132', name: 'Indústria Campos', product: 'seguros', links: [{ to: 'a-146', shared: 2 }] },
  { id: 'a-133', name: 'Clínica Sul', product: 'cambio', links: [{ to: 'a-160', shared: 2 }, { to: 'a-174', shared: 1 }] },
  { id: 'a-134', name: 'Gráfica Lagos', product: 'fianca', links: [{ to: 'a-136', shared: 2 }, { to: 'a-137', shared: 1 }, { to: 'a-157', shared: 1 }] },
  { id: 'a-135', name: 'Hotel Sul', product: 'custodia', links: [{ to: 'a-145', shared: 2 }, { to: 'a-179', shared: 1 }] },
  { id: 'a-136', name: 'Escola Serra', product: 'fianca', links: [] },
  { id: 'a-137', name: 'Oficina Campos', product: 'credito', links: [{ to: 'a-147', shared: 1 }] },
  { id: 'a-138', name: 'Agro Pontal', product: 'consorcio', links: [{ to: 'a-154', shared: 1 }, { to: 'a-160', shared: 3 }, { to: 'a-164', shared: 2 }, { to: 'a-168', shared: 1 }] },
  { id: 'a-139', name: 'Transportes Serra', product: 'consorcio', links: [{ to: 'a-144', shared: 2 }, { to: 'a-149', shared: 1 }, { to: 'a-153', shared: 1 }, { to: 'a-160', shared: 2 }] },
  { id: 'a-140', name: 'Gráfica Campos', product: 'credito', links: [{ to: 'a-147', shared: 3 }] },
  { id: 'a-141', name: 'Padaria Pontal', product: 'seguros', links: [{ to: 'a-161', shared: 3 }] },
  { id: 'a-142', name: 'Editora Leste', product: 'credito', links: [] },
  { id: 'a-143', name: 'Gráfica Pontal', product: 'seguros', links: [{ to: 'a-157', shared: 2 }, { to: 'a-172', shared: 4 }] },
  { id: 'a-144', name: 'Indústria Serra', product: 'consorcio', links: [{ to: 'a-146', shared: 1 }, { to: 'a-164', shared: 2 }, { to: 'a-165', shared: 2 }, { to: 'a-171', shared: 1 }] },
  { id: 'a-145', name: 'Escola Central', product: 'custodia', links: [] },
  { id: 'a-146', name: 'Editora Campos', product: 'seguros', links: [{ to: 'a-154', shared: 2 }] },
  { id: 'a-147', name: 'Farmácia Pontal', product: 'credito', links: [] },
  { id: 'a-148', name: 'Padaria Norte', product: 'credito', links: [] },
  { id: 'a-149', name: 'Editora Sul', product: 'consorcio', links: [{ to: 'a-167', shared: 1 }] },
  { id: 'a-150', name: 'Mercado Colina', product: 'previdencia', links: [{ to: 'a-160', shared: 1 }] },
  { id: 'a-151', name: 'Mercado Oeste', product: 'carteira', links: [] },
  { id: 'a-152', name: 'Clínica Central', product: 'previdencia', links: [] },
  { id: 'a-153', name: 'Indústria Pontal', product: 'carteira', links: [{ to: 'a-173', shared: 3 }] },
  { id: 'a-154', name: 'Farmácia Sul', product: 'seguros', links: [{ to: 'a-168', shared: 2 }] },
  { id: 'a-155', name: 'Logística Pontal', product: 'credito', links: [] },
  { id: 'a-156', name: 'Logística Norte', product: 'seguros', links: [{ to: 'a-161', shared: 3 }, { to: 'a-168', shared: 2 }, { to: 'a-170', shared: 1 }, { to: 'a-180', shared: 1 }] },
  { id: 'a-157', name: 'Padaria Litoral', product: 'seguros', links: [{ to: 'a-164', shared: 1 }, { to: 'a-175', shared: 3 }] },
  { id: 'a-158', name: 'Editora Norte', product: 'previdencia', links: [{ to: 'a-167', shared: 1 }] },
  { id: 'a-159', name: 'Indústria Mirante', product: 'credito', links: [{ to: 'a-163', shared: 1 }] },
  { id: 'a-160', name: 'Farmácia Serra', product: 'cambio', links: [] },
  { id: 'a-161', name: 'Logística Lagos', product: 'seguros', links: [{ to: 'a-167', shared: 1 }] },
  { id: 'a-162', name: 'Oficina Serra', product: 'arrendamento', links: [] },
  { id: 'a-163', name: 'Clínica Campos', product: 'carteira', links: [{ to: 'a-167', shared: 2 }] },
  { id: 'a-164', name: 'Agro Serra', product: 'consorcio', links: [] },
  { id: 'a-165', name: 'Editora Litoral', product: 'consorcio', links: [] },
  { id: 'a-166', name: 'Escola Norte', product: 'seguros', links: [] },
  { id: 'a-167', name: 'Padaria Serra', product: 'carteira', links: [] },
  { id: 'a-168', name: 'Transportes Litoral', product: 'seguros', links: [] },
  { id: 'a-169', name: 'Hotel Serra', product: 'previdencia', links: [] },
  { id: 'a-170', name: 'Escola Oeste', product: 'previdencia', links: [] },
  { id: 'a-171', name: 'Gráfica Mirante', product: 'previdencia', links: [] },
  { id: 'a-172', name: 'Escola Pontal', product: 'seguros', links: [] },
  { id: 'a-173', name: 'Construtora Leste', product: 'carteira', links: [] },
  { id: 'a-174', name: 'Clínica Oeste', product: 'cambio', links: [] },
  { id: 'a-175', name: 'Hotel Norte', product: 'credito', links: [] },
  { id: 'a-176', name: 'Oficina Norte', product: 'arrendamento', links: [] },
  { id: 'a-177', name: 'Oficina Central', product: 'cambio', links: [] },
  { id: 'a-178', name: 'Transportes Pontal', product: 'previdencia', links: [] },
  { id: 'a-179', name: 'Mercado Leste', product: 'credito', links: [] },
  { id: 'a-180', name: 'Distribuidora Oeste', product: 'credito', links: [] },
];

/** Mês da posição de carteira lida, em `YYYY-MM`. Entra no painel lateral e na frase acessível. */
export const asOf = '2026-09';
