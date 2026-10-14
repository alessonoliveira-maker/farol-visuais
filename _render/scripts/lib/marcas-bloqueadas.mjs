/**
 * Lista de bloqueio da guarda MARCA-REAL (CONTRATO.md, seção 3: "zero dado pessoal real e zero
 * marca de empresa real"). Só dados: quem verifica é `guardas.mjs`.
 *
 * COMO ESTENDER
 * 1. Marca de nome comum e sem ambiguidade: acrescente o nome em `MARCAS_SIMPLES`, do jeito que
 *    se escreve ("Salesforce", "Itaú"). A busca é sem acento, sem diferenciar maiúscula, e com
 *    fronteira de palavra, então "Itaú" acha "itau" e não acha "Itaúna".
 * 2. Marca cujo nome também é palavra comum do idioma (o caso do "Meta", que em português é
 *    objetivo): NÃO ponha em `MARCAS_SIMPLES`. Acrescente uma entrada em `MARCAS_COM_PADRAO` com
 *    uma expressão regular que só case no sentido de marca (por exemplo, exigindo "Ads" ou
 *    "Business" depois). Toda expressão aqui precisa das flags `i` (maiúscula) e `u` (unicode) e
 *    roda sobre o texto JÁ SEM ACENTO.
 * 3. Palavra que a guarda estava acusando por engano: acrescente em `TERMOS_LEGITIMOS`, com o
 *    motivo escrito. Serve de documentação; a defesa real é a fronteira de palavra do item 1.
 *
 * O que a guarda lê: literais de texto do `Chart.tsx` e do `data.ts` (nunca comentário, que pode
 * citar a marca para dizer que ela é proibida) e os valores de texto do `meta.json`.
 */

/** Nomes que nunca aparecem no catálogo, em nenhum dos três arquivos. Ordem alfabética por bloco. */
export const MARCAS_SIMPLES = [
  // Plataformas de mídia e redes
  'LinkedIn',
  'Google',
  'YouTube',
  'Facebook',
  'Instagram',
  'TikTok',
  // CRM e automação
  'RD Station',
  'Bitrix',
  'WhatsApp',
  'Salesforce',
  'HubSpot',
  // Big tech e marcas de consumo
  'Apple',
  'Microsoft',
  'Amazon',
  'Netflix',
  'Uber',
  // Bancos, corretoras e instituições financeiras
  'Nubank',
  'Itaú',
  'Bradesco',
  'Santander',
  'XP',
  'BTG',
];

/**
 * Marcas cujo nome colide com palavra comum. O padrão roda sobre o texto sem acento e precisa
 * decidir sozinho o que é marca.
 */
export const MARCAS_COM_PADRAO = [
  {
    nome: 'Meta Ads',
    // "meta.json", "metadados", o tipo `Meta` e "meta de receita" são legítimos: a palavra só acusa
    // quando vem seguida de Ads ou Business, que é quando ela nomeia a plataforma.
    padrao: /\bmeta\s+(?:ads|business)\b/iu,
  },
];

/**
 * Registrado para quem for mexer na guarda: palavras que PARECEM da lista e são legítimas.
 * Nenhuma delas casa com os padrões acima; a lista existe para não serem bloqueadas por engano.
 */
export const TERMOS_LEGITIMOS = [
  ['meta', 'objetivo comercial, o sentido corrente da palavra em português'],
  ['meta.json', 'arquivo de metadados da versão, seção 4 do contrato'],
  ['metadados', 'palavra comum'],
  ['Meta', 'nome de tipo TypeScript usado pela ferramenta'],
  ['Amazônia', 'topônimo; a fronteira de palavra já separa de "Amazon"'],
  ['Uberlândia', 'topônimo; a fronteira de palavra já separa de "Uber"'],
];
