/**
 * Pipeline aberto do trimestre por executivo e, dentro de cada um, por produto, em reais.
 * MFO fictício, sem relação com a operação real da Somma: nenhum nome é pessoa real. O índice
 * de string satisfaz o TreemapDataType do Recharts, exigido pelo genérico de Treemap. `grupoIndex`
 * fixa o ancestral de primeiro nível no próprio dado (0 a 7, um por executivo): a cor da folha
 * vem dele, nunca de inferir a posição do nó durante o render. Produto sem valor no trimestre
 * (caso difícil da seção 3) sai do desenho, porque área não representa isso, e aparece só na
 * lista de identificação com o motivo em vez do valor (ROT-10), como no `01_treemap`.
 */
export interface ProductSlice {
  readonly id: string;
  readonly name: string;
  readonly value: number;
  readonly grupoIndex: number;
  /** Motivo da ausência do desenho, só em produto com valor zero ou negativo. */
  readonly note?: string;
  readonly [key: string]: unknown;
}

export interface ExecutiveGroup {
  readonly id: string;
  readonly name: string;
  readonly grupoIndex: number;
  readonly children: readonly ProductSlice[];
  readonly [key: string]: unknown;
}

function group(
  id: string,
  name: string,
  grupoIndex: number,
  children: ReadonlyArray<readonly [string, string, number, string?]>,
): ExecutiveGroup {
  return {
    id,
    name,
    grupoIndex,
    children: children.map(([slug, productName, value, note]) => ({
      id: `${id}-${slug}`,
      name: productName,
      value,
      grupoIndex,
      ...(note === undefined ? {} : { note }),
    })),
  };
}

export const data: readonly ExecutiveGroup[] = [
  group('exec-a', 'Executivo A', 0, [
    ['gestao', 'Gestão de investimentos', 1_400_000],
    ['sucessorio', 'Planejamento sucessório', 850_000],
    ['cambio', 'Câmbio', 200_000],
  ]),
  group('exec-b', 'Executivo B', 1, [
    ['gestao', 'Gestão de investimentos', 1_100_000],
    ['fidc', 'Operações estruturadas (FIDC)', 650_000],
    ['credito', 'Crédito privado', 400_000],
  ]),
  group('exec-c', 'Executivo C', 2, [
    ['gestao', 'Gestão de investimentos', 2_850_000],
    ['sucessorio', 'Planejamento sucessório', 1_300_000],
    ['imobiliario', 'Imobiliário', 700_000],
    ['tributario', 'Consultoria tributária internacional', 490_000],
    ['previdencia', 'Previdência corporativa', 300_000],
  ]),
  group('exec-d', 'Executivo D', 3, [
    ['gestao', 'Gestão de investimentos', 1_050_000],
    ['credito', 'Crédito privado', 550_000],
    ['cambio', 'Câmbio', 290_000],
  ]),
  group('exec-e', 'Executivo E', 4, [
    ['fidc', 'Operações estruturadas (FIDC)', 950_000],
    ['gestao', 'Gestão de investimentos', 600_000],
    ['imobiliario', 'Imobiliário', 210_000],
    ['tributario', 'Consultoria tributária internacional', 0, 'sem pipeline aberto no trimestre'],
  ]),
  group('exec-f', 'Executivo F', 5, [
    ['gestao', 'Gestão de investimentos', 880_000],
    ['sucessorio', 'Planejamento sucessório', 440_000],
    ['previdencia', 'Previdência corporativa', 220_000],
  ]),
  group('exec-g', 'Executivo G', 6, [
    ['gestao', 'Gestão de investimentos', 850_000],
    ['credito', 'Crédito privado', 460_000],
  ]),
  group('exec-h', 'Executivo H', 7, [
    ['gestao', 'Gestão de investimentos', 900_000],
    ['fidc', 'Operações estruturadas (FIDC)', 560_000],
  ]),
];
