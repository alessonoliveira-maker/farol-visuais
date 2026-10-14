/**
 * Indicações dirigidas entre clientes desde 2025-01: quem indicou quem. São 36 clientes e
 * 33 indicações, e cada cliente foi indicado por no máximo um outro.
 * Dado fictício e fixo: nenhum nome é pessoa real. O array saiu de um gerador com semente fixa e
 * está escrito aqui por extenso, para o desenho não depender de sorteio em tempo de tela (DAD-3).
 */
export interface ClientNode {
  readonly id: string;
  readonly name: string;
  /** Ids dos clientes que este cliente indicou. A seta do desenho sai dele e aponta para cada um. */
  readonly referred: readonly string[];
}

export const data: readonly ClientNode[] = [
  { id: 'c-01', name: 'Ricardo L.', referred: ['c-02', 'c-03', 'c-04', 'c-05', 'c-06', 'c-07', 'c-08', 'c-09', 'c-10'] },
  { id: 'c-02', name: 'Cláudio B.', referred: [] },
  { id: 'c-03', name: 'Carla N.', referred: [] },
  { id: 'c-04', name: 'Sérgio S.', referred: ['c-11', 'c-12', 'c-13', 'c-14', 'c-15'] },
  { id: 'c-05', name: 'Igor T.', referred: [] },
  { id: 'c-06', name: 'Tatiana R.', referred: [] },
  { id: 'c-07', name: 'Viviane G.', referred: [] },
  { id: 'c-08', name: 'Alberto D.', referred: ['c-17', 'c-18'] },
  { id: 'c-09', name: 'Camila M.', referred: [] },
  { id: 'c-10', name: 'Diego R.', referred: [] },
  { id: 'c-11', name: 'Sílvia V.', referred: [] },
  { id: 'c-12', name: 'Gabriel T.', referred: ['c-16'] },
  { id: 'c-13', name: 'Nicole R.', referred: [] },
  { id: 'c-14', name: 'José Henrique B.', referred: [] },
  { id: 'c-15', name: 'Murilo G.', referred: [] },
  { id: 'c-16', name: 'Júlia V.', referred: [] },
  { id: 'c-17', name: 'Pedro V.', referred: [] },
  { id: 'c-18', name: 'Adriana D.', referred: [] },
  { id: 'c-19', name: 'Marcelo B.', referred: ['c-20', 'c-21', 'c-22', 'c-23', 'c-24', 'c-25', 'c-26'] },
  { id: 'c-20', name: 'Breno B.', referred: [] },
  { id: 'c-21', name: 'Bernardo P.', referred: [] },
  { id: 'c-22', name: 'Roberto R.', referred: [] },
  { id: 'c-23', name: 'Nelson M.', referred: ['c-27', 'c-28', 'c-29', 'c-30'] },
  { id: 'c-24', name: 'Sofia B.', referred: [] },
  { id: 'c-25', name: 'Hugo V.', referred: ['c-31'] },
  { id: 'c-26', name: 'Leandro G.', referred: [] },
  { id: 'c-27', name: 'César N.', referred: [] },
  { id: 'c-28', name: 'Lívia A.', referred: [] },
  { id: 'c-29', name: 'Daniel R.', referred: [] },
  { id: 'c-30', name: 'Jorge N.', referred: [] },
  { id: 'c-31', name: 'Helena C.', referred: [] },
  { id: 'c-32', name: 'Karina D.', referred: ['c-33', 'c-34'] },
  { id: 'c-33', name: 'Samuel C.', referred: ['c-35', 'c-36'] },
  { id: 'c-34', name: 'Isabela M.', referred: [] },
  { id: 'c-35', name: 'Laura S.', referred: [] },
  { id: 'c-36', name: 'Henrique B.', referred: [] },
];

/**
 * Cliente em foco no retrato: o terceiro que mais indica, escolhido porque tem indicação recebida
 * e indicações feitas, e assim a vizinhança acesa mostra os dois sentidos da seta.
 */
export const highlightId = 'c-04';

/** Mês em que o registro de indicações começa, em `YYYY-MM`. Entra na linha de leitura. */
export const since = '2025-01';
