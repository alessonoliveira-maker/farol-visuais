/**
 * Coocorrência de 40 origens na jornada de um lead em 2026-08. Dado fictício e fixo: cada par conta as
 * jornadas em que as duas origens aparecem juntas. A matriz é esparsa de propósito (a maioria dos
 * pares é zero medido) e carrega os dois casos de ausência que não se confundem:
 *
 * - `journeys: 0` ou par ausente da lista: a fonte registra as duas origens e elas nunca andaram
 *   juntas. É zero MEDIDO.
 * - `journeys: null`: a fonte não registra uma das duas origens naquele cruzamento (o portal de
 *   parceiros e o diretório setorial não gravam o toque nas ferramentas de chat, webinar, podcast e
 *   material rico). É SEM MEDIÇÃO, e nunca vira zero.
 *
 * 22 das 40 origens não têm nenhum par: são colapsadas no componente, e a contagem do que saiu é escrita.
 */
export interface OriginNode {
  readonly id: string;
  readonly label: string;
}

export interface OriginPair {
  readonly a: string;
  readonly b: string;
  /** Jornadas com as duas origens; `null` quando a fonte não mede o par. */
  readonly journeys: number | null;
}

export interface SparseData {
  /** Mês de referência, em YYYY-MM. */
  readonly month: string;
  readonly nodes: readonly OriginNode[];
  readonly pairs: readonly OriginPair[];
}

const p = (a: string, b: string, journeys: number | null): OriginPair => ({ a, b, journeys });

const ACTIVE: readonly OriginNode[] = [
  { id: 'bp', label: 'Busca paga' },
  { id: 'bo', label: 'Busca orgânica' },
  { id: 'rp', label: 'Redes pagas' },
  { id: 'ro', label: 'Redes orgânicas' },
  { id: 'dir', label: 'Acesso direto' },
  { id: 'blog', label: 'Blog' },
  { id: 'email', label: 'Base de e-mail' },
  { id: 'ind', label: 'Indicação de cliente' },
  { id: 'evt', label: 'Evento' },
  { id: 'parc', label: 'Parceiro' },
  { id: 'mkt', label: 'Marketplace' },
  { id: 'disp', label: 'Display' },
  { id: 'chat', label: 'Chat do site' },
  { id: 'web', label: 'Webinar' },
  { id: 'pod', label: 'Podcast' },
  { id: 'rich', label: 'Material rico' },
  { id: 'comp', label: 'Comparador' },
  { id: 'dset', label: 'Diretório setorial' },
];

/** Origens que existem no cadastro e nunca apareceram numa jornada com outra. */
const ISOLATED: readonly OriginNode[] = Array.from({ length: 22 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  return { id: `avulsa-${number}`, label: `Origem avulsa ${number}` };
});

export const data: SparseData = {
  month: '2026-08',
  nodes: [...ACTIVE, ...ISOLATED],
  pairs: [
    p('bp', 'bo', 94), p('bp', 'rp', 61), p('bp', 'disp', 38), p('bp', 'dir', 47),
    p('bp', 'email', 15), p('bp', 'mkt', 12), p('bp', 'comp', 9), p('bp', 'web', 5),
    p('bo', 'ro', 52), p('bo', 'blog', 66), p('bo', 'dir', 71), p('bo', 'email', 28),
    p('bo', 'rich', 33), p('bo', 'comp', 17), p('bo', 'chat', 22), p('bo', 'web', 11),
    p('rp', 'ro', 44), p('rp', 'disp', 57), p('rp', 'dir', 19), p('rp', 'email', 13),
    p('rp', 'mkt', 6), p('rp', 'chat', 14), p('ro', 'blog', 24), p('ro', 'dir', 31),
    p('ro', 'email', 18), p('ro', 'pod', 7), p('ro', 'web', 9), p('blog', 'dir', 21),
    p('blog', 'email', 36), p('blog', 'rich', 48), p('blog', 'web', 12), p('email', 'ind', 27),
    p('email', 'evt', 16), p('email', 'web', 29), p('email', 'rich', 34), p('ind', 'evt', 41),
    p('ind', 'parc', 23), p('ind', 'dir', 38), p('evt', 'parc', 18), p('evt', 'web', 25),
    p('evt', 'pod', 5), p('parc', 'mkt', 2), p('mkt', 'disp', 10), p('mkt', 'dir', 8),
    p('mkt', 'comp', 14), p('disp', 'dir', 6), p('disp', 'comp', 4), p('web', 'rich', 31),
    p('pod', 'rich', 9), p('dset', 'bp', 7), p('dset', 'mkt', 3), p('dset', 'comp', 11),
    p('parc', 'chat', null), p('parc', 'web', null), p('parc', 'pod', null), p('parc', 'rich', null),
    p('dset', 'chat', null), p('dset', 'web', null), p('dset', 'pod', null), p('dset', 'rich', null),
    p('parc', 'dset', null),
  ],
};
