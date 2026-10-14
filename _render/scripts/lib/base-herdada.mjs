/**
 * Linha de base herdada do documento autonomo, embutida no `<style>` de todo preview.
 *
 * POR QUE EXISTE. O serializador grava uma propriedade HERDADA so quando ela difere da do pai: se
 * for igual, ele a omite e conta que o clone herde o mesmo valor. Essa conta vale na pagina, onde o
 * preflight do Tailwind ja neutralizou a folha do navegador; nao vale dentro do SVG, que nao tem
 * preflight nenhum. Onde a folha do navegador impoe valor proprio, o clone deixa de herdar e cai no
 * valor dela, calado; o `check` fica verde e o desenho do arquivo foge do desenho da pagina.
 *
 * Medido no catalogo (07_rosca-e-radial/04_barra-radial/v2_sdr-em-foco-no-ranking): um `<button>`
 * dentro de uma ilha, cujo `font` a pagina resolve como Manrope 12px (preflight: `font: inherit`),
 * no arquivo sozinho volta ao `font: 400 13.3333px Arial` da folha do navegador. O nome da SDR
 * virava Arial e o valor ao lado, que declara familia mas nao tamanho, seguia em Space Grotesk a
 * 13,3333px: tinta de 16,53 px numa caixa fixada em 14,875 px. Cada linha da legenda transbordava
 * 1,65 px, e o render acusava 1,12% (escuro) e 1,17% (claro) de pixels diferentes, como AVISO.
 *
 * A mesma armadilha esta em toda tag com valor proprio na folha do navegador: titulo, lista, celula
 * de tabela, link, `pre`, `code`, `small`. Por isso a regra aqui nao lista tags: ela escreve por
 * extenso a propria hipotese do serializador, no seletor universal. O que ele omitiu por ser igual
 * ao pai TEM de herdar. Estilo embutido continua ganhando, porque seletor universal tem
 * especificidade zero, entao tudo o que o serializador de fato gravou segue mandando.
 */
export const INHERITED_BASELINE =
  '*{font-family:inherit;font-size:inherit;font-weight:inherit;font-style:inherit;font-stretch:inherit;' +
  'line-height:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-variant-numeric:inherit;' +
  'font-variant-ligatures:inherit;font-variant-caps:inherit;letter-spacing:inherit;word-spacing:inherit;' +
  'color:inherit;text-align:inherit;text-indent:inherit;text-transform:inherit;list-style-type:inherit;' +
  'list-style-position:inherit;border-collapse:inherit;border-spacing:inherit;caption-side:inherit;' +
  'empty-cells:inherit;tab-size:inherit;text-rendering:inherit;direction:inherit}' +
  // `text-decoration` nao e herdada, mas a folha do navegador a impoe em link e afins, e o
  // serializador so a grava quando ha decoracao: sem isto, `<a href>` nasce azul e sublinhado.
  'a,u,ins,del,s,abbr,acronym{text-decoration:inherit}';
