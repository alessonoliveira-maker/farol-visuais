# Citação em destaque e verbatim realçado

## O que é

Um trecho de texto em destaque tipográfico, com fio lateral, corpo de 14 px e atribuição por perfil fictício, e a variante analítica: o verbatim com os termos realçados por categoria e a informação de quanto aquele texto representa. A citação ilustra um padrão já medido em outro visual e não prova frequência, por isso toda citação carrega o contador de representatividade (1 de 38 respostas parecidas, ou 23% das respostas do motivo). O realce é montado em TypeScript: a busca normaliza acento e caixa, o realce marca a forma original escrita, e a string vira segmentos renderizados como `mark`, sem `dangerouslySetInnerHTML`. Nome, e-mail e telefone são mascarados antes de qualquer exibição, e o mascaramento vem antes do recorte e do realce.

## Quando usar

- Dar voz do cliente a um motivo de perda ou de ganho que outro visual já quantificou.
- Mostrar como uma objeção aparece escrita, com os termos da categoria realçados (até três categorias, em slots fixos 1, 3 e 6).
- Até cinco verbatins por motivo, cada um com a parcela das respostas que ele representa.
- Abrir uma tela de Comercial ou de Pré-vendas com a frase que resume o trimestre na voz de quem compra.
- Exibir uma anotação longa (cerca de 800 caracteres) recortada ao redor do termo, com a contagem do que ficou de fora.

## Quando evitar

- Como prova de frequência: uma frase escolhida a dedo não mede nada; use a bar list de termos (02/09).
- Mais de cinco citações empilhadas: o leitor para de ler; leve para a concordância KWIC (03).
- Trecho recortado que inverte o sentido original: recorte por palavras e marque o corte com reticências e a contagem omitida.
- Citação sem o número que ela ilustra ao lado: vira anedota; junte ao KPI simples com contexto (01/01).
- Texto livre sem mascaramento de nome, e-mail e telefone: o componente mascara antes de exibir, sempre.

## Anatomia

1. **Fio lateral:** `border-s-4` (ou `border-s-2` na lista) em `--chart-1`, com o trecho em `text-sm` e `text-text-primary`, sem aspas decorativas.
2. **Atribuição:** perfil fictício e mês por `formatMonthShort`, em 11 px e `text-text-muted`; nunca nome, e-mail ou telefone.
3. **Contador de representatividade:** par de contagens por `formatInt` e parcela por `formatPercent(x, 0)`; a parcela sai de uma função que devolve `number | null` (EST-1b).
4. **Segmentos e `mark`:** a busca roda sobre o texto normalizado com mapa de índices para o original; em sobreposição vence a ocorrência mais longa; o termo entra em `mark` com fundo `bg-chart-N/20`, texto `text-text-primary` e sublinhado de 2 px.
5. **Segundo canal além da cor:** sublinhado sólido, pontilhado ou tracejado por categoria, repetido na legenda.
6. **Legenda de categorias:** acima do trecho, na mesma ordem dos slots, com a contagem de cada uma.
7. **Máscara:** `[telefone]`, `[e-mail]` e `[nome]` em `bg-surface-sunken`, para o leitor ver que houve dado ali.
8. **Recorte:** palavras inteiras ao redor do termo, reticências nas pontas e "N de M caracteres omitidos" logo abaixo.
9. **Estado vazio:** `role="status"` com o ícone `Filter` e uma frase de 12 px em `text-text-muted`, sem citação inventada.
10. **Acessibilidade:** raiz com `role` e `aria-label` calculado do dado, com as mesmas formatações do corpo.

## Versões

- [`v1_citacao-de-motivo-de-ganho`](./v1_citacao-de-motivo-de-ganho/) ([escuro](./v1_citacao-de-motivo-de-ganho/preview.svg), [claro](./v1_citacao-de-motivo-de-ganho/preview-claro.svg)): a frase do motivo de ganho mais citado, perfil fictício e o contador de 1 de 38 respostas parecidas (23% das 164 respostas de ganho).
- [`v2_objecoes-realcadas-por-categoria`](./v2_objecoes-realcadas-por-categoria/) ([escuro](./v2_objecoes-realcadas-por-categoria/preview.svg), [claro](./v2_objecoes-realcadas-por-categoria/preview-claro.svg)): anotação de ligação com preço, momento e concorrente realçados, busca sem acento e sublinhado de estilo próprio por categoria.
- [`v3_cinco-verbatins-por-motivo-de-perda`](./v3_cinco-verbatins-por-motivo-de-perda/) ([escuro](./v3_cinco-verbatins-por-motivo-de-perda/preview.svg), [claro](./v3_cinco-verbatins-por-motivo-de-perda/preview-claro.svg)): seletor de motivo e cinco verbatins ordenados pela parcela, com desfecho e mês; motivo sem verbatim cai no estado vazio. Canvas 640x500 por número, declarado no `meta.json`.
- [`v4_verbatim-longo-e-dado-sensivel`](./v4_verbatim-longo-e-dado-sensivel/) ([escuro](./v4_verbatim-longo-e-dado-sensivel/preview.svg), [claro](./v4_verbatim-longo-e-dado-sensivel/preview-claro.svg)): anotação de 838 caracteres recortada ao redor do termo, com e-mail, telefone e nomes mascarados antes do realce e a contagem dos caracteres omitidos. O dado sensível do `data.ts` é sintético e reservado.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`. A moldura do catálogo é `card`, então a raiz vai dentro de um `VisualCard` e não desenha borda nem fundo (ESP-4).
2. Troque `data` pelo recorte já filtrado da página. Na v3, `selectedId` é só o motivo aberto de início; o estado de seleção é local do componente.
3. Na v2, o mapa de categoria para slot (1, 3 e 6) deve vir do dicionário da página, para a mesma categoria ter a mesma cor em todo o painel.
4. Na v4, o texto que chega do dado já deve passar pelo mascaramento do servidor quando existir; o mascaramento do componente é a segunda barreira, não a única. A lista `knownNames` vem do cadastro do atendimento daquela ligação.
5. O estado vazio inline dá lugar a `EmptyState` quando a página já o usa, mantendo o sentido do texto (EST-6).
6. A etiqueta de procedência da contagem de respostas é do `VisualCard` (ANO-6).

## Referências

- [Storytelling with Data, quotes and text as a visual](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text): o texto escolhido a dedo precisa do número que o contextualiza.
- WAI-ARIA e HTML: o elemento `mark` para realce, `blockquote` e `figcaption` para citação e atribuição.
- Farol: `app/src/lib/format.ts` (formatadores) e `app/src/lib/utils.ts` (`cn`).
- Estudo da família: [`_estudo/familias/21_texto-e-nuvem-de-palavras.md`](../../_estudo/familias/21_texto-e-nuvem-de-palavras.md).
- Molde: `_render/exemplos/01_cards-e-kpis/01_kpi-com-sparkline/`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, primeira passada, as quatro versões (`sem_revisao`): todas aprovadas, sem bloqueante. `npm run check`: 0 com erro, 0 avisos, 0 escapes. As guardas de contraste, de colisão e de texto na marca não medem esta abordagem (`texto_em_html`), então os pares foram medidos à mão nos dois PNGs de cada versão: texto sobre o fundo translúcido do realce de 9,44:1 a 13,67:1, sublinhado opaco de 4,10:1 a 6,17:1 contra o próprio fundo, contagem da aba ativa a 5,98:1 no escuro e 4,65:1 no claro, máscara a 9,36:1 e 7,04:1. A diferença entre página e SVG, contada à mão com limiar de 24 níveis, ficou abaixo de 0,1% nos oito retratos. A `OPACIDADE-MARCA` mediu a `v4` e não viu a `v2`, cujo `bg-chart-N/20` chega por um `Record` de classes. Itens, nenhum reprova:

- `v1` a `v4`, TIP-1: os números em Manrope dentro de texto corrido saem sem `tabular-nums` (`23% das 164 respostas de ganho` e as datas na `v1`; a data do rodapé na `v2`; `96 das 312 respostas de perda, 31%` e os meses na `v3`; a linha de caracteres omitidos e a data na `v4`). Fora de coluna, sem consequência visível.
- `v1`, ANO-5: a linha `Motivo de ganho mais citado: atendimento consultivo` repete cinco palavras do título do cartão logo acima. O motivo é o que ela acrescenta; começar por ele dispensa a repetição.
- `v1`, ESP-2 e ACE-3: a barra da parcela mede 8 px de espessura, abaixo do piso de 12 px, e o trilho em `--surface-sunken` mede 1,15:1 contra o cartão nos dois temas. O valor está escrito na linha de cima e a proporção confere (23,1% do trilho para 38 de 164), então nada se perde no preview.
- `v2`, quebra de linha: `próximo trimestre` cai no fim da linha e vira duas caixas, e quem conta caixas vê quatro de momento onde a legenda diz 3. As pontas retas do corte indicam a continuação, mas é sinal fraco; `whitespace-nowrap` no termo curto resolve.
- `v2`, redação do `meta.json`: "texto claro" só descreve o tema escuro; a marca usa `text-text-primary`, que é escuro no tema claro.
- `v2`, tabela 17.1: a contagem da legenda sai em 12 px e a tabela pede 14 px para valor de legenda. Sem consequência visível.
- `v2` e `v4`, ACE-5: o fundo do realce (`bg-chart-N/20`) mede de 1,31:1 a 1,54:1 contra o cartão. Vale pela isenção do texto escrito na marca, e quem carrega a categoria com 3:1 é o sublinhado opaco. Tirar o sublinhado derruba a identificação.
- `v3`, TIP-6: a coluna das parcelas está alinhada à esquerda, então `9%` e `6%` não alinham a unidade com `23%`, `18%` e `15%`. `text-right` na coluna de 56 px resolve.
- `v3`, NUM-6 e DAD-1: a contagem das abas (`96`, `61`, `52`, `47`, `31`) não leva substantivo, e só a do motivo aberto é nomeada na linha de baixo; cada verbatim escreve a parcela sem a contagem dela (`23% do motivo`, e não 22 de 96), com a base escrita uma vez na linha de contagem.
- `v3`, DAD-9: o período (`de jul/26 a set/26`) só existe na frase acessível; no corpo ele aparece na `v1` e falta aqui.
- `v3`, mora no ramo, EST-2: com `responseCount` zero e verbatim presente, a parcela sai vazia sobre `do motivo`, em vez de `formatUnavailable()`; e com `totalResponses` zero a linha de contagem escreve "das 0 respostas" e cala a parcela.
- `v3`, acessibilidade: `role="tabpanel"` está só no parágrafo de contagem e a lista fica fora dele; as abas não têm `aria-controls` nem navegação por seta. O foco por Tab funciona.
- `v3`, GEO-1: o conteúdo cabe no preset `alto` com sobra e a régua manda o nome do preset nesse caso; o canvas foi por número (640x500), com a conta na nota. O cartão fecha melhor assim, e o desvio é só de declaração.
- `v4`, seção 3 do contrato: o `data.ts` traz e-mail e telefone inventados, e a seção 3 diz "nunca CNPJ, CPF, e-mail ou telefone, nem inventados". O catálogo pede que a versão prove o mascaramento deles, e não há como provar sem a entrada. Os valores são reservados (domínio `.invalid`, DDD 00 e zeros) e o desvio está declarado no `data.ts`, na nota do `meta.json` e neste README. É colisão entre régua e catálogo, a decidir pelo dono: exceção escrita na seção 3 ou redefinição da versão.
- `v4`, cobertura da máscara: a expressão de telefone só pega número com hífen. Medido fora da árvore: `11912345678`, `(11) 91234 5678` e `(11) 3123.4567` passam inteiros, e `11 91234-5678` e `+55 11 91234-5678` deixam o DDD e o código do país à mostra. Nome só é mascarado se estiver em `knownNames`, com a mesma caixa. Quem colar no Farol trata o componente como segunda barreira, como o passo 4 de Como colar já diz; o "sempre" de Quando evitar promete mais do que a expressão entrega.
- `v4`, redação: a tela diz `646 de 800 caracteres`, contados sobre o texto já mascarado, e a linha de Versões diz 838, que é o original. `4 nomes` conta a anotação inteira e o recorte mostra um `[nome]` só. "omitidos do recorte" se lê melhor como "fora do recorte".
- `v4`, mora no ramo, ACE-1: a frase acessível cresce com o número de motivos. Com o dado padrão mede 199 caracteres; cada anotação a mais soma cerca de 120, e a segunda já passa de 250.
