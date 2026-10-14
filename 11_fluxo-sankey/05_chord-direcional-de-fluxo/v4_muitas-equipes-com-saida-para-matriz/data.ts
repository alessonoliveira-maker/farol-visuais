/**
 * Repasses de oportunidades entre catorze equipes comerciais no terceiro trimestre de 2026, em
 * contagem de repasses (não valor financeiro). Dado fictício e fixo: nenhuma equipe, pessoa ou
 * empresa é real, e o nome é um ponto cardeal, nunca um nome de área existente.
 *
 * O dado JÁ VEM COLAPSADO, que é o recorte da versão: as seis maiores equipes ficam com o próprio
 * arco e as oito menores estão somadas na entidade `outras`, porque a COR-4 põe teto de seis
 * categorias coloridas e a roda perde a leitura acima de oito entidades. `collapsedTeams` diz
 * quantas equipes foram somadas, e é esse número que vai para o rótulo, na forma "Outras (n=8)".
 *
 * `internalCount` são os repasses TROCADOS ENTRE as oito equipes agrupadas. Eles não aparecem em
 * `data` de propósito: um chord não desenha fita de uma entidade para si mesma, e inventar uma
 * fita fechada ali seria desenhar um fluxo que não existe entre arcos. Eles também não entram no
 * arco de `outras`, que mede só o que sai dela; entram na legenda e na frase acessível, escritos.
 * Por isso o total do trimestre é `internalCount` mais a soma de `data`, e não a soma de `data`.
 */
export interface FlowGroup {
  readonly id: string;
  readonly label: string;
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6 | null;
}

export interface FlowCell {
  readonly from: string;
  readonly to: string;
  readonly count: number;
}

/** Slots na ordem da COR-8 (1, 3, 6, 5, 2, 4); o grupo agregado fica sem slot e vai por último. */
export const groups: readonly FlowGroup[] = [
  { id: 'norte', label: 'Equipe Norte', slot: 1 },
  { id: 'sul', label: 'Equipe Sul', slot: 3 },
  { id: 'central', label: 'Equipe Central', slot: 6 },
  { id: 'leste', label: 'Equipe Leste', slot: 5 },
  { id: 'oeste', label: 'Equipe Oeste', slot: 2 },
  { id: 'litoral', label: 'Equipe Litoral', slot: 4 },
  { id: 'outras', label: 'Outras', slot: null },
];

/** O id do grupo agregado, o único que representa mais de uma equipe. */
export const collapsedId = 'outras';

/** Quantas equipes foram somadas dentro de `outras`. Vai escrito no rótulo e na frase acessível. */
export const collapsedTeams = 8;

/** Repasses trocados ENTRE as equipes agrupadas, que não viram fita e por isso vão escritos. */
export const internalCount = 19;

/**
 * Soma 355 repasses entre arcos, mais os 19 internos de `outras`, o que dá 374 no trimestre. A
 * Equipe Litoral não manda nada para o grupo agregado, então há par de mão única no desenho.
 */
export const data: readonly FlowCell[] = [
  { from: 'norte', to: 'sul', count: 26 },
  { from: 'norte', to: 'central', count: 18 },
  { from: 'norte', to: 'leste', count: 12 },
  { from: 'norte', to: 'oeste', count: 9 },
  { from: 'norte', to: 'litoral', count: 5 },
  { from: 'norte', to: 'outras', count: 4 },
  { from: 'sul', to: 'norte', count: 21 },
  { from: 'sul', to: 'central', count: 14 },
  { from: 'sul', to: 'leste', count: 10 },
  { from: 'sul', to: 'oeste', count: 7 },
  { from: 'sul', to: 'litoral', count: 5 },
  { from: 'sul', to: 'outras', count: 4 },
  { from: 'central', to: 'norte', count: 15 },
  { from: 'central', to: 'sul', count: 12 },
  { from: 'central', to: 'leste', count: 9 },
  { from: 'central', to: 'oeste', count: 7 },
  { from: 'central', to: 'litoral', count: 5 },
  { from: 'central', to: 'outras', count: 4 },
  { from: 'leste', to: 'norte', count: 11 },
  { from: 'leste', to: 'sul', count: 9 },
  { from: 'leste', to: 'central', count: 8 },
  { from: 'leste', to: 'oeste', count: 7 },
  { from: 'leste', to: 'litoral', count: 5 },
  { from: 'leste', to: 'outras', count: 4 },
  { from: 'oeste', to: 'norte', count: 9 },
  { from: 'oeste', to: 'sul', count: 8 },
  { from: 'oeste', to: 'central', count: 7 },
  { from: 'oeste', to: 'leste', count: 6 },
  { from: 'oeste', to: 'litoral', count: 4 },
  { from: 'oeste', to: 'outras', count: 3 },
  { from: 'litoral', to: 'norte', count: 7 },
  { from: 'litoral', to: 'sul', count: 6 },
  { from: 'litoral', to: 'central', count: 6 },
  { from: 'litoral', to: 'leste', count: 5 },
  { from: 'litoral', to: 'oeste', count: 5 },
  { from: 'outras', to: 'norte', count: 13 },
  { from: 'outras', to: 'sul', count: 12 },
  { from: 'outras', to: 'central', count: 11 },
  { from: 'outras', to: 'leste', count: 9 },
  { from: 'outras', to: 'oeste', count: 8 },
  { from: 'outras', to: 'litoral', count: 5 },
];
