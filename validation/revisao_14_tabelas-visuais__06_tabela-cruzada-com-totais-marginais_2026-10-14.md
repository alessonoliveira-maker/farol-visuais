# Parecer de revisão: 14_tabelas-visuais/06_tabela-cruzada-com-totais-marginais

Data: 2026-10-14. Revisor independente. Julgada uma versão, `v2_heatmap-no-miolo-e-barras-nas-margens`,
com motivo `revisao_desatualizada`: o `Chart.tsx` mudou depois do veredito de 2026-09-19 (os dois
trilhos das barras de total saíram de `--surface-overlay` para `--surface-sunken`, varredura de
2026-09-28). Julgado o arquivo de hoje com a régua de hoje, não a nota antiga. PNGs de 2026-10-02, mais
novos que o `Chart.tsx` de 2026-09-28, e sem `.diff.png` desta versão. `npm run check` com tipos: 0 com
erro, 2 avisos (AGREGACAO-ZERO na linha 49 da v2 e na 116 da v4, as duas em dívida conhecida), 0 escape.

Resultado: reprovada por um bloqueante. As observações não bloqueantes estão no README do modelo,
parágrafo de 2026-10-14.

## O que passou

Somas conferidas à mão: linhas 22, 23, 9, 37, 28 e 13; colunas 49, 29, 30, 18 e 6; total geral 132
pelos dois lados. Escala de cor calculada só sobre as 15 células medidas (1 a 22), fora dos totais, e a
legenda diz isso. Barras de total partem do zero nos dois sentidos e são proporcionais, medidas no PNG
de 2x: trilho de linha com 52 px (26 px em 1x), Renata V. enche o trilho e Iury B. ocupa 12 px; trilho
de coluna com 56 px, Prospecção enche e Fechamento ocupa 6 px. Não se aplica com ícone `Ban`, `sr-only`
e legenda, fora das somas e da escala. Texto em 11, 12 e 14 px; um só elemento em peso 700. Nenhuma
guarda de texto mede o modelo (`texto_em_html`), então o contraste foi medido à mão pela fórmula da WCAG
sobre `app/src/styles/tokens.css`: texto nas células de 6,33:1 a 12,69:1 no escuro e de 5,45:1 a
14,82:1 no claro; `--text-muted` sobre o cartão 5,21:1 e 5,37:1; `--chart-1` contra o trilho 10,90:1 e
5,20:1. Frase acessível de 193 caracteres, começando pelo tipo. Sem corte, sobreposição ou transbordo
nos dois PNGs.

## v2_heatmap-no-miolo-e-barras-nas-margens: reprovada

### Bloqueante 1. Perguntas 1 e 17; ANO-1, ANO-5, COR-2 e seção 14.1 (o desenho afirma uma resposta falsa)

**Evidência.** O caso de uso pergunta "qual etapa concentra mais oportunidades e quais executivos
carregam essa concentração". O único destaque da peça, peso 700 no cabeçalho com a anotação "30 no
total", cai em Proposta por um índice fixo (`HIGHLIGHT_STAGE_INDEX = 2`, `data.ts:19`), sem relação com
o dado. Pelo dado, quem concentra é Prospecção, com 49; Proposta é a segunda, com 30. Nos dois PNGs, quem
lê o subtítulo e procura a resposta encontra a coluna em negrito, e ela é a errada; a tela não diz por que
Proposta está em destaque (o motivo, "a de maior atenção do time nesta semana", vive só no comentário do
`data.ts`). O próprio Chart calcula a etapa certa (`busiestStageIndex`, `Chart.tsx:66`) e só a usa na
frase acessível, que conclui "Prospecção concentra o maior total de coluna" e logo depois diz "Etapa em
destaque: Proposta": quem ouve e quem enxerga recebem conclusões diferentes (armadilha DAD-5). O catálogo
chama a coluna de "etapa proposta" na mesma versão em que pergunta pela concentração, então o que a
versão precisa demonstrar é a etapa que concentra, destacada; com este dado as duas coisas se separaram,
e a peça ensina a quem copiar um destaque escrito à mão que contradiz o próprio número.

**O que mudar.** Derivar o destaque do dado, pelo maior total de coluna que o Chart já calcula, e apagar
o índice fixo do `data.ts`; a anotação passa a dizer o motivo em texto curto com nome e valor (por
exemplo "maior total, 49", ANO-2). Para manter o texto do catálogo, ajustar o `data.ts` de modo que
Proposta seja a etapa de maior total, preservando o nome longo, o valor 1 e os não se aplica, e conferir
de novo as somas da `notes` do `meta.json`. A frase acessível passa a nomear uma etapa só.

## Para aproveitar a mesma rodada (não bloqueante, detalhado no README)

* A frase acessível escreve o período "2026-09" como literal, fora do dado e fora da tela, e no formato
  do dado (ACE-1, NUM-7, vizinha da DAD-9); monta os números com `String()` e não com `formatInt`.
* Algarismos de "30 no total" e do "1" e "22" da legenda em Manrope sem `tabular-nums` (TIP-1).
* Estado vazio sem o ícone `Filter` de 16 px (EST-1); `min` cai em 0 com a lista vazia (EST-1b).
* A altura do trilho de coluna (28 px) está escrita no JSX, fora das constantes do topo.
