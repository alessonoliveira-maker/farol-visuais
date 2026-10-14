/**
 * Cobertura de cadastro e desfecho dos 1.240 leads de marketing da competência 2026-08, cruzada em
 * quatro eixos: origem, cargo, telefone e desfecho. Dado fictício e fixo: nenhuma origem é
 * plataforma real, nenhuma empresa é real, nenhum telefone, e-mail ou documento aparece aqui, nem
 * inventado.
 *
 * A AUSÊNCIA É CATEGORIA, NÃO BURACO. "Sem telefone" e "Cargo ausente" são categorias do eixo, com
 * contagem própria e desenho próprio, e ficam por último dentro do eixo. Fosse filtro, os 520 leads
 * sem telefone sumiriam da conta e a taxa de qualificação da casa subiria sozinha; fosse zero, a
 * lacuna viraria medida. Cada linha de `data` é uma combinação inteira, e todo total de categoria é
 * a SOMA das linhas, então os quatro eixos fecham em 1.240 por construção.
 */
export interface ParallelCategory {
  readonly id: string;
  readonly label: string;
  /** Categoria de ausência de dado: desenhada vazada e sempre no fim do eixo. */
  readonly absence?: boolean;
}

export type AxisId = 'origem' | 'cargo' | 'telefone' | 'desfecho';

export interface ParallelAxis {
  readonly id: AxisId;
  readonly label: string;
  readonly categories: readonly ParallelCategory[];
}

export interface ParallelCombo {
  readonly origem: string;
  readonly cargo: string;
  readonly telefone: string;
  readonly desfecho: string;
  readonly count: number;
}

export const axes: readonly ParallelAxis[] = [
  {
    id: 'origem',
    label: 'Origem',
    categories: [
      { id: 'midia', label: 'Mídia social' },
      { id: 'busca', label: 'Busca paga' },
      { id: 'organico', label: 'Orgânico' },
    ],
  },
  {
    id: 'cargo',
    label: 'Cargo',
    categories: [
      { id: 'cargo-sim', label: 'Cargo declarado' },
      { id: 'cargo-nao', label: 'Cargo ausente', absence: true },
    ],
  },
  {
    id: 'telefone',
    label: 'Telefone',
    categories: [
      { id: 'tel-sim', label: 'Com telefone' },
      { id: 'tel-nao', label: 'Sem telefone', absence: true },
    ],
  },
  {
    id: 'desfecho',
    label: 'Desfecho',
    categories: [
      { id: 'qualificado', label: 'Qualificado' },
      { id: 'descartado', label: 'Descartado' },
    ],
  },
];

export const data: readonly ParallelCombo[] = [
  { origem: 'midia', cargo: 'cargo-sim', telefone: 'tel-sim', desfecho: 'qualificado', count: 72 },
  { origem: 'midia', cargo: 'cargo-sim', telefone: 'tel-sim', desfecho: 'descartado', count: 118 },
  { origem: 'midia', cargo: 'cargo-sim', telefone: 'tel-nao', desfecho: 'qualificado', count: 14 },
  { origem: 'midia', cargo: 'cargo-sim', telefone: 'tel-nao', desfecho: 'descartado', count: 76 },
  { origem: 'midia', cargo: 'cargo-nao', telefone: 'tel-sim', desfecho: 'qualificado', count: 30 },
  { origem: 'midia', cargo: 'cargo-nao', telefone: 'tel-sim', desfecho: 'descartado', count: 80 },
  { origem: 'midia', cargo: 'cargo-nao', telefone: 'tel-nao', desfecho: 'qualificado', count: 14 },
  { origem: 'midia', cargo: 'cargo-nao', telefone: 'tel-nao', desfecho: 'descartado', count: 116 },
  { origem: 'busca', cargo: 'cargo-sim', telefone: 'tel-sim', desfecho: 'qualificado', count: 56 },
  { origem: 'busca', cargo: 'cargo-sim', telefone: 'tel-sim', desfecho: 'descartado', count: 104 },
  { origem: 'busca', cargo: 'cargo-sim', telefone: 'tel-nao', desfecho: 'qualificado', count: 14 },
  { origem: 'busca', cargo: 'cargo-sim', telefone: 'tel-nao', desfecho: 'descartado', count: 56 },
  { origem: 'busca', cargo: 'cargo-nao', telefone: 'tel-sim', desfecho: 'qualificado', count: 24 },
  { origem: 'busca', cargo: 'cargo-nao', telefone: 'tel-sim', desfecho: 'descartado', count: 66 },
  { origem: 'busca', cargo: 'cargo-nao', telefone: 'tel-nao', desfecho: 'qualificado', count: 14 },
  { origem: 'busca', cargo: 'cargo-nao', telefone: 'tel-nao', desfecho: 'descartado', count: 86 },
  { origem: 'organico', cargo: 'cargo-sim', telefone: 'tel-sim', desfecho: 'qualificado', count: 34 },
  { origem: 'organico', cargo: 'cargo-sim', telefone: 'tel-sim', desfecho: 'descartado', count: 76 },
  { origem: 'organico', cargo: 'cargo-sim', telefone: 'tel-nao', desfecho: 'qualificado', count: 14 },
  { origem: 'organico', cargo: 'cargo-sim', telefone: 'tel-nao', desfecho: 'descartado', count: 46 },
  { origem: 'organico', cargo: 'cargo-nao', telefone: 'tel-sim', desfecho: 'qualificado', count: 18 },
  { origem: 'organico', cargo: 'cargo-nao', telefone: 'tel-sim', desfecho: 'descartado', count: 42 },
  { origem: 'organico', cargo: 'cargo-nao', telefone: 'tel-nao', desfecho: 'qualificado', count: 14 },
  { origem: 'organico', cargo: 'cargo-nao', telefone: 'tel-nao', desfecho: 'descartado', count: 56 },
];

/**
 * A ordem de leitura põe TELEFONE vizinho de DESFECHO, porque em parallel sets só eixos vizinhos se
 * comparam direto e é essa a comparação que a pergunta pede. Cargo fica entre origem e telefone,
 * onde ele mostra que as duas lacunas de cadastro andam juntas.
 */
export const axisOrder: readonly AxisId[] = ['origem', 'cargo', 'telefone', 'desfecho'];

/**
 * Ordem de EMPILHAMENTO das combinações dentro de cada categoria, que é outra coisa da ordem dos
 * eixos e precisa ser declarada (armadilha GEO-12). A ordem das categorias dentro do eixo continua
 * sendo a de `axes`; o que esta lista decide é quem fica em cima de quem DENTRO de uma categoria.
 *
 * Telefone vem primeiro porque é o eixo que empresta a cor: assim, em todos os quatro eixos, os
 * leads com telefone ficam por cima e os sem telefone por baixo, e o diagrama inteiro se lê em duas
 * bandas. Com a ordem dos eixos como chave de empilhamento, as fitas se cruzavam justamente no vão
 * entre telefone e desfecho, que é onde a pergunta mora.
 */
export const stackOrder: readonly AxisId[] = ['telefone', 'desfecho', 'cargo', 'origem'];

/** O eixo que empresta cor às fitas: com telefone acende, sem telefone fica no neutro. */
export const colorAxis: AxisId = 'telefone';

/** A categoria do eixo de cor que acende. */
export const colorCategory = 'tel-sim';

/** A categoria do eixo de desfecho que conta como qualificação. */
export const successCategory = 'qualificado';

/** Competência do recorte, em texto. Nada de `new Date()`. */
export const period = '2026-08';

/** O substantivo que acompanha toda contagem de tela (NUM-6). */
export const unitPlural = 'leads';
