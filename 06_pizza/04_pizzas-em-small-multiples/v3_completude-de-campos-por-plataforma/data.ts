/**
 * Completude dos campos do lead em três plataformas de mídia, no mês.
 * Cada campo traz quantos leads chegaram com ele preenchido; o denominador é o total de leads da
 * plataforma, então a rosca da célula é binária: preenchido contra vazio.
 * Dado fictício e fixo: nenhuma plataforma corresponde a um produto real de mercado.
 */
export interface FieldCompleteness {
  readonly fieldId: string;
  readonly fieldName: string;
  /** Leads da plataforma que chegaram com o campo preenchido. */
  readonly filled: number;
}

export interface PlatformCompleteness {
  readonly platformId: string;
  readonly platformName: string;
  /** Leads recebidos da plataforma no mês: o denominador de toda rosca da linha. */
  readonly received: number;
  /** Ordem fixa dos campos, a mesma em toda plataforma: é ela que define as colunas da matriz. */
  readonly fields: readonly FieldCompleteness[];
}

export const data: readonly PlatformCompleteness[] = [
  {
    platformId: 'social',
    platformName: 'Mídia social',
    received: 412,
    fields: [
      { fieldId: 'origem', fieldName: 'Origem', filled: 404 },
      { fieldId: 'porte', fieldName: 'Porte', filled: 168 },
      { fieldId: 'telefone', fieldName: 'Telefone', filled: 239 },
      { fieldId: 'cargo', fieldName: 'Cargo', filled: 74 },
    ],
  },
  {
    platformId: 'busca',
    platformName: 'Busca paga',
    received: 268,
    fields: [
      { fieldId: 'origem', fieldName: 'Origem', filled: 268 },
      { fieldId: 'porte', fieldName: 'Porte', filled: 96 },
      { fieldId: 'telefone', fieldName: 'Telefone', filled: 201 },
      { fieldId: 'cargo', fieldName: 'Cargo', filled: 51 },
    ],
  },
  {
    platformId: 'profissional',
    platformName: 'Rede profissional',
    received: 96,
    fields: [
      { fieldId: 'origem', fieldName: 'Origem', filled: 96 },
      { fieldId: 'porte', fieldName: 'Porte', filled: 78 },
      { fieldId: 'telefone', fieldName: 'Telefone', filled: 44 },
      { fieldId: 'cargo', fieldName: 'Cargo', filled: 88 },
    ],
  },
];

/** Piso de completude aceito, em fração. Abaixo dele o número da rosca sai em atenção. */
export const minShare = 0.5;
