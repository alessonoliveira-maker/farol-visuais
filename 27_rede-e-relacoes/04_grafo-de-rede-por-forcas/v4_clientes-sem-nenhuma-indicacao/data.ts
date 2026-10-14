/**
 * Indicações entre clientes desde 2025-01: quem indicou quem. São 64 clientes e 39 indicações;
 * 22 clientes não indicaram ninguém nem foram indicados, e nada no registro os marca: o isolamento
 * sai da leitura das ligações.
 * Dado fictício e fixo: nenhum nome é pessoa real. O array saiu de um gerador com semente fixa e
 * está escrito aqui por extenso, para o desenho não depender de sorteio em tempo de tela (DAD-3).
 */
export interface ClientNode {
  readonly id: string;
  readonly name: string;
  /** Ids dos clientes que este cliente indicou. Cada indicação aparece uma vez, em quem indicou. */
  readonly referred: readonly string[];
}

export const data: readonly ClientNode[] = [
  { id: 'c-01', name: 'Nicole N.', referred: ['c-14', 'c-05', 'c-12', 'c-16'] },
  { id: 'c-02', name: 'Breno F.', referred: [] },
  { id: 'c-03', name: 'Beatriz B.', referred: ['c-49'] },
  { id: 'c-04', name: 'Fábio S.', referred: [] },
  { id: 'c-05', name: 'Letícia M.', referred: [] },
  { id: 'c-06', name: 'Renata C.', referred: [] },
  { id: 'c-07', name: 'Teresa V.', referred: ['c-50', 'c-15'] },
  { id: 'c-08', name: 'Rita A.', referred: ['c-26'] },
  { id: 'c-09', name: 'Lúcia C.', referred: [] },
  { id: 'c-10', name: 'Mateus N.', referred: ['c-56', 'c-29'] },
  { id: 'c-11', name: 'Adriana M.', referred: [] },
  { id: 'c-12', name: 'Sofia S.', referred: ['c-18'] },
  { id: 'c-13', name: 'Bruna N.', referred: ['c-34'] },
  { id: 'c-14', name: 'Ricardo G.', referred: [] },
  { id: 'c-15', name: 'Jorge A.', referred: ['c-37', 'c-27'] },
  { id: 'c-16', name: 'Henrique P.', referred: ['c-24'] },
  { id: 'c-17', name: 'Nelson M.', referred: ['c-52'] },
  { id: 'c-18', name: 'Rodrigo A.', referred: [] },
  { id: 'c-19', name: 'Cristina D.', referred: [] },
  { id: 'c-20', name: 'Simone F.', referred: [] },
  { id: 'c-21', name: 'Felipe M.', referred: [] },
  { id: 'c-22', name: 'Karina D.', referred: [] },
  { id: 'c-23', name: 'Ivone N.', referred: ['c-08', 'c-01'] },
  { id: 'c-24', name: 'Cláudio D.', referred: [] },
  { id: 'c-25', name: 'João Guilherme P.', referred: [] },
  { id: 'c-26', name: 'Gustavo M.', referred: [] },
  { id: 'c-27', name: 'Elisa N.', referred: ['c-37'] },
  { id: 'c-28', name: 'Raquel F.', referred: ['c-59'] },
  { id: 'c-29', name: 'Paulo R.', referred: ['c-56'] },
  { id: 'c-30', name: 'Vanessa S.', referred: [] },
  { id: 'c-31', name: 'César A.', referred: ['c-28', 'c-51', 'c-11'] },
  { id: 'c-32', name: 'Sérgio S.', referred: [] },
  { id: 'c-33', name: 'Otávio D.', referred: [] },
  { id: 'c-34', name: 'Gabriel D.', referred: [] },
  { id: 'c-35', name: 'Patrícia C.', referred: ['c-41', 'c-02', 'c-54'] },
  { id: 'c-36', name: 'Regina S.', referred: [] },
  { id: 'c-37', name: 'Helena M.', referred: [] },
  { id: 'c-38', name: 'Mariana P.', referred: [] },
  { id: 'c-39', name: 'Camila M.', referred: [] },
  { id: 'c-40', name: 'Clara R.', referred: ['c-46'] },
  { id: 'c-41', name: 'Samuel P.', referred: [] },
  { id: 'c-42', name: 'Leandro N.', referred: ['c-01', 'c-31', 'c-07', 'c-23', 'c-58', 'c-45'] },
  { id: 'c-43', name: 'Priscila P.', referred: [] },
  { id: 'c-44', name: 'Vicente G.', referred: [] },
  { id: 'c-45', name: 'Tatiana V.', referred: ['c-43', 'c-23'] },
  { id: 'c-46', name: 'Bianca R.', referred: ['c-62'] },
  { id: 'c-47', name: 'Igor V.', referred: [] },
  { id: 'c-48', name: 'Valéria L.', referred: [] },
  { id: 'c-49', name: 'Fernanda R.', referred: [] },
  { id: 'c-50', name: 'Hugo B.', referred: [] },
  { id: 'c-51', name: 'Roberto D.', referred: [] },
  { id: 'c-52', name: 'Débora G.', referred: ['c-30'] },
  { id: 'c-53', name: 'Murilo S.', referred: [] },
  { id: 'c-54', name: 'Flávia L.', referred: [] },
  { id: 'c-55', name: 'Pedro B.', referred: [] },
  { id: 'c-56', name: 'Márcia S.', referred: [] },
  { id: 'c-57', name: 'Bernardo V.', referred: [] },
  { id: 'c-58', name: 'Sílvia M.', referred: ['c-36'] },
  { id: 'c-59', name: 'Carla M.', referred: [] },
  { id: 'c-60', name: 'Cecília B.', referred: [] },
  { id: 'c-61', name: 'Emanuel G.', referred: [] },
  { id: 'c-62', name: 'Isabela M.', referred: [] },
  { id: 'c-63', name: 'Alberto F.', referred: [] },
  { id: 'c-64', name: 'Lorena T.', referred: [] },
];

/** Mês em que o registro de indicações começa, em `YYYY-MM`. Entra na linha de leitura. */
export const since = '2025-01';
