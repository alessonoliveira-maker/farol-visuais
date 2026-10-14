/**
 * Rede de indicações entre clientes: quem indicou quem desde 2025-01, com o produto principal e a
 * receita de cada cliente nos últimos 12 meses, em reais. São 60 clientes e 72 indicações.
 * Dado fictício e fixo: nenhum nome é pessoa real. O array saiu de um gerador com semente fixa e
 * está escrito aqui por extenso, para o desenho não depender de sorteio em tempo de tela (DAD-3).
 */
export type ProductId = 'carteira' | 'previdencia' | 'credito' | 'seguros';

export interface Product {
  readonly id: ProductId;
  readonly label: string;
  /**
   * Posição fixa do produto na paleta (`--chart-1` a `--chart-6`). A cor pertence ao produto e
   * não à posição no ranking (COR-3), e os slots saem na ordem 1, 3, 6, 5 (COR-8).
   */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export const products: readonly Product[] = [
  { id: 'carteira', label: 'Gestão de carteira', slot: 1 },
  { id: 'previdencia', label: 'Previdência', slot: 3 },
  { id: 'credito', label: 'Crédito estruturado', slot: 6 },
  { id: 'seguros', label: 'Seguro de vida', slot: 5 },
];

export interface ClientNode {
  readonly id: string;
  readonly name: string;
  readonly product: ProductId;
  /** Receita do cliente nos últimos 12 meses, em reais. */
  readonly revenue: number;
  /** Ids dos clientes que este cliente indicou. Cada indicação aparece uma vez, em quem indicou. */
  readonly referred: readonly string[];
}

export const data: readonly ClientNode[] = [
  { id: 'c-01', name: 'Rita F.', product: 'carteira', revenue: 92_200, referred: ['c-02', 'c-03', 'c-04', 'c-05', 'c-06', 'c-07', 'c-08', 'c-09'] },
  { id: 'c-02', name: 'Rodrigo T.', product: 'carteira', revenue: 426_900, referred: ['c-10', 'c-11', 'c-12', 'c-13'] },
  { id: 'c-03', name: 'Laura T.', product: 'carteira', revenue: 132_300, referred: ['c-16', 'c-05', 'c-04', 'c-20'] },
  { id: 'c-04', name: 'Bruna F.', product: 'carteira', revenue: 198_700, referred: ['c-22'] },
  { id: 'c-05', name: 'Jorge A.', product: 'carteira', revenue: 87_900, referred: [] },
  { id: 'c-06', name: 'Mateus P.', product: 'carteira', revenue: 212_500, referred: ['c-19'] },
  { id: 'c-07', name: 'Renata L.', product: 'carteira', revenue: 42_400, referred: ['c-14'] },
  { id: 'c-08', name: 'Gabriel B.', product: 'carteira', revenue: 108_900, referred: ['c-04', 'c-09'] },
  { id: 'c-09', name: 'Priscila D.', product: 'carteira', revenue: 129_100, referred: [] },
  { id: 'c-10', name: 'Letícia N.', product: 'carteira', revenue: 283_100, referred: [] },
  { id: 'c-11', name: 'Camila L.', product: 'carteira', revenue: 114_700, referred: ['c-12'] },
  { id: 'c-12', name: 'Karina L.', product: 'carteira', revenue: 55_800, referred: ['c-17', 'c-18'] },
  { id: 'c-13', name: 'Lorena M.', product: 'carteira', revenue: 61_500, referred: ['c-15', 'c-11'] },
  { id: 'c-14', name: 'Sílvia A.', product: 'carteira', revenue: 200_000, referred: [] },
  { id: 'c-15', name: 'Simone N.', product: 'carteira', revenue: 253_900, referred: [] },
  { id: 'c-16', name: 'Adriana M.', product: 'carteira', revenue: 31_100, referred: [] },
  { id: 'c-17', name: 'Heitor M.', product: 'carteira', revenue: 162_400, referred: [] },
  { id: 'c-18', name: 'Raquel M.', product: 'carteira', revenue: 178_100, referred: [] },
  { id: 'c-19', name: 'Hugo V.', product: 'carteira', revenue: 105_900, referred: [] },
  { id: 'c-20', name: 'Maria Aparecida S.', product: 'previdencia', revenue: 181_800, referred: ['c-21', 'c-22', 'c-23', 'c-24', 'c-25', 'c-26', 'c-27'] },
  { id: 'c-21', name: 'Rafael P.', product: 'seguros', revenue: 348_800, referred: ['c-28', 'c-29', 'c-30'] },
  { id: 'c-22', name: 'Nicole G.', product: 'seguros', revenue: 252_900, referred: [] },
  { id: 'c-23', name: 'Vanessa N.', product: 'previdencia', revenue: 69_100, referred: ['c-22'] },
  { id: 'c-24', name: 'Sandra S.', product: 'previdencia', revenue: 44_700, referred: [] },
  { id: 'c-25', name: 'Mariana G.', product: 'previdencia', revenue: 266_200, referred: ['c-22'] },
  { id: 'c-26', name: 'Sofia D.', product: 'previdencia', revenue: 79_000, referred: [] },
  { id: 'c-27', name: 'Alberto R.', product: 'previdencia', revenue: 122_300, referred: ['c-31'] },
  { id: 'c-28', name: 'Júlia M.', product: 'carteira', revenue: 59_300, referred: ['c-33', 'c-30', 'c-29'] },
  { id: 'c-29', name: 'Vicente M.', product: 'previdencia', revenue: 53_800, referred: [] },
  { id: 'c-30', name: 'Clara D.', product: 'previdencia', revenue: 50_300, referred: ['c-32'] },
  { id: 'c-31', name: 'Emanuel F.', product: 'previdencia', revenue: 177_200, referred: ['c-34'] },
  { id: 'c-32', name: 'Giovana S.', product: 'credito', revenue: 80_700, referred: [] },
  { id: 'c-33', name: 'César B.', product: 'seguros', revenue: 30_700, referred: [] },
  { id: 'c-34', name: 'Breno A.', product: 'previdencia', revenue: 167_400, referred: [] },
  { id: 'c-35', name: 'Caio A.', product: 'credito', revenue: 187_200, referred: ['c-36', 'c-37', 'c-38', 'c-39', 'c-40', 'c-41'] },
  { id: 'c-36', name: 'Murilo C.', product: 'credito', revenue: 208_600, referred: ['c-42', 'c-43', 'c-44', 'c-41'] },
  { id: 'c-37', name: 'Carla N.', product: 'credito', revenue: 229_500, referred: ['c-40'] },
  { id: 'c-38', name: 'Vera L.', product: 'credito', revenue: 74_400, referred: ['c-45'] },
  { id: 'c-39', name: 'Olívia N.', product: 'credito', revenue: 129_500, referred: ['c-47'] },
  { id: 'c-40', name: 'Tatiana F.', product: 'carteira', revenue: 83_500, referred: [] },
  { id: 'c-41', name: 'Diego D.', product: 'credito', revenue: 255_200, referred: ['c-46', 'c-37'] },
  { id: 'c-42', name: 'Aline M.', product: 'credito', revenue: 85_600, referred: [] },
  { id: 'c-43', name: 'Lucas S.', product: 'credito', revenue: 135_800, referred: [] },
  { id: 'c-44', name: 'Cecília L.', product: 'credito', revenue: 91_700, referred: ['c-43'] },
  { id: 'c-45', name: 'Viviane T.', product: 'credito', revenue: 100_500, referred: [] },
  { id: 'c-46', name: 'Larissa F.', product: 'credito', revenue: 77_800, referred: [] },
  { id: 'c-47', name: 'Rosana P.', product: 'credito', revenue: 119_300, referred: [] },
  { id: 'c-48', name: 'Paulo F.', product: 'seguros', revenue: 84_400, referred: ['c-49', 'c-50', 'c-51', 'c-52'] },
  { id: 'c-49', name: 'Daniel L.', product: 'seguros', revenue: 44_000, referred: ['c-53', 'c-52'] },
  { id: 'c-50', name: 'Henrique V.', product: 'seguros', revenue: 203_300, referred: [] },
  { id: 'c-51', name: 'Elisa T.', product: 'seguros', revenue: 67_100, referred: [] },
  { id: 'c-52', name: 'Pedro S.', product: 'seguros', revenue: 215_100, referred: ['c-54'] },
  { id: 'c-53', name: 'Juliano A.', product: 'seguros', revenue: 40_600, referred: [] },
  { id: 'c-54', name: 'Nelson D.', product: 'seguros', revenue: 62_800, referred: [] },
  { id: 'c-55', name: 'Fernanda M.', product: 'seguros', revenue: 95_900, referred: ['c-56', 'c-57'] },
  { id: 'c-56', name: 'João Guilherme P.', product: 'carteira', revenue: 79_400, referred: ['c-57', 'c-58'] },
  { id: 'c-57', name: 'Amanda L.', product: 'previdencia', revenue: 196_000, referred: [] },
  { id: 'c-58', name: 'Cláudio V.', product: 'previdencia', revenue: 86_200, referred: [] },
  { id: 'c-59', name: 'Samuel G.', product: 'seguros', revenue: 390_600, referred: ['c-60'] },
  { id: 'c-60', name: 'Isabela N.', product: 'seguros', revenue: 43_900, referred: [] },
];

/** Mês em que o registro de indicações começa, em `YYYY-MM`. Entra no rodapé e na frase acessível. */
export const since = '2025-01';
