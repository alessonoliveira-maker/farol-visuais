# Concordância KWIC

## O que é

Cada ocorrência de um termo vira uma linha, com o termo numa coluna central própria, o contexto esquerdo alinhado à direita e o contexto direito alinhado à esquerda: o formato Key Word in Context. O olho desce pela coluna do termo e lê o que vem antes e depois em todas as ocorrências de uma vez, o que revela padrões de uso que a contagem esconde. É o complemento da lista de termos e da nuvem: a contagem diz quanto, a concordância mostra como. O contexto é cortado por palavras em TypeScript, o esquerdo pelo começo, mantendo as palavras mais próximas do termo; o layout é um grid em Tailwind, sem `dir="rtl"`.

## Quando usar

- Ler o uso real de um termo que a lista de termos (família 02) ou a nuvem (04) apontou.
- De 10 a 200 ocorrências na tela; acima disso, com filtro e virtualização ao colar no Farol.
- Agrupar os sentidos de um termo ordenando pelo contexto direito ou esquerdo.
- Conferir se um termo classificado como objeção é mesmo objeção antes de publicar a métrica.

## Quando evitar

- Resumo executivo: a concordância é ferramenta de leitura; na Diretoria use a frase com número (21/01).
- Milhares de ocorrências sem filtro: ninguém lê; filtre por desfecho ou por período antes.
- Pergunta sobre as continuações mais comuns em ramos: use a árvore de palavras (21/07).
- Alinhar o contexto esquerdo com `dir="rtl"`: embaralha a pontuação; corte pelas palavras em TypeScript.
- Texto com dado pessoal sem mascaramento: mascare nome, e-mail e telefone antes de montar a linha.

## Anatomia

1. **Grid de colunas:** `grid-cols-[1fr_auto_1fr]` com as linhas em `display: contents`, para a coluna do termo ter a mesma largura em todas as linhas.
2. **Contexto esquerdo:** `text-right text-text-secondary`, cortado pelo começo por `cutByWords`, com reticência na frente quando perde palavras.
3. **Termo:** `font-semibold text-text-primary`, na forma como foi escrito; a pontuação colada vai para o contexto do lado dela.
4. **Contexto direito:** `text-left text-text-secondary`, cortado pelo fim.
5. **Marcador de borda:** `início` ou `fim` em `text-text-muted` quando o contexto está vazio, para a coluna não colapsar.
6. **Chave sem acento:** `normalize('NFD')` sem diacríticos; agrupa preco e preço e ordena sem erro de acento.
7. **Metadados (v3):** data por `formatDate`, desfecho com ícone e palavra, executivo, tudo em 11 px.
8. **Contagem (v2, v3):** `tabular-nums` e `formatInt`, sempre com o substantivo ocorrências.
9. **Estado vazio:** `role="status"` com ícone `Filter`, no lugar da grade.

## Versões

- [`v1_ocorrencias-de-concorrente`](./v1_ocorrencias-de-concorrente/) ([escuro](./v1_ocorrencias-de-concorrente/preview.svg), [claro](./v1_ocorrencias-de-concorrente/preview-claro.svg)): vinte ocorrências de concorrente nas perdas. Demonstra o grid de três colunas e o corte do contexto pelas palavras mais próximas.
- [`v2_ordenado-pelo-contexto-direito`](./v2_ordenado-pelo-contexto-direito/) ([escuro](./v2_ordenado-pelo-contexto-direito/preview.svg), [claro](./v2_ordenado-pelo-contexto-direito/preview-claro.svg)): ordenação e agrupamento por sentido, com seletor e contagem por grupo.
- [`v3_concordancia-com-desfecho-e-executivo`](./v3_concordancia-com-desfecho-e-executivo/) ([escuro](./v3_concordancia-com-desfecho-e-executivo/preview.svg), [claro](./v3_concordancia-com-desfecho-e-executivo/preview-claro.svg)): data, desfecho e executivo por linha, filtro por desfecho e 40 de 2.000 linhas.
- [`v4_termo-na-borda-e-sem-ocorrencia`](./v4_termo-na-borda-e-sem-ocorrencia/) ([escuro](./v4_termo-na-borda-e-sem-ocorrencia/preview.svg), [claro](./v4_termo-na-borda-e-sem-ocorrencia/preview-claro.svg)): termo no começo e no fim da anotação, grafias agrupadas, pontuação colada e termo sem ocorrência.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta de visuais da página e troque `data` pelas anotações do recorte, já com nome, e-mail e telefone mascarados.
2. Ajuste `CONTEXT_MAX_CHARS` à largura real da coluna do cartão (cerca de 6,4 px por caractere a 12 px, contando a reticência); na `v1` o limite é 46 no canvas de 760 px (a coluna de cerca de 320 px, contexto de até 294 px); o corte é por palavras, e não por CSS.
3. Acima de 200 linhas, adicione filtro no servidor e virtualização da lista: o import de virtualização não é permitido no catálogo, então fica para a colagem.
4. Na v3, o filtro por desfecho deve consultar o recorte completo; as contagens das opções já vêm do total, e não das linhas carregadas.
5. Troque o estado vazio inline por `EmptyState` quando a página já o usa, mantendo o sentido do texto.

## Referências

- Concordância KWIC, método da linguística de corpus (Key Word in Context), como ferramenta de leitura de uso de um termo.
- Estudo da família: [`_estudo/familias/21_texto-e-nuvem-de-palavras.md`](../../_estudo/familias/21_texto-e-nuvem-de-palavras.md).
- Farol: `app/src/lib/format.ts` (`formatDate`, `formatInt`).
- Molde de tabela em HTML: `14_tabelas-visuais/01_tabela-com-barras-inline/v1_receita-por-executivo`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, primeira passada, as quatro versões (`sem_revisao`): `v2`, `v3` e `v4` aprovadas, sem bloqueante; `v1` reprovada por um bloqueante, o contexto de 44 caracteres que não cabe na coluna de 242,5 px (cobre o termo em 3 linhas e é cortado na borda em 7), descrito em `validation/revisao_21_texto-e-nuvem-de-palavras__03_concordancia-kwic_2026-10-13.md`. `npm run check`: 0 com erro, 4 avisos, 0 escapes. Os 4 avisos são a AGREGACAO-ZERO na linha `kept.length > 0 ? 1 : 0` do `cutByWords`, um por versão: o zero ali é o espaço que não se soma antes da primeira palavra, não agrega lista e não chega à tela. As guardas de colisão, de contraste e de texto na marca não medem esta abordagem (`texto_em_html`), então a tinta de cada linha foi medida à mão nos PNGs dos dois temas, a largura de cada contexto foi calculada com a Manrope 400 a 12 px, e os pares de cor saíram de `tokens.css`. Os estados fora do dado padrão (as outras ordenações da `v2`, os filtros da `v3` e os vazios das quatro) foram conferidos só por leitura do código.

- `v1` a `v4`, TIP-1: os números em Manrope dentro de frase saem sem `tabular-nums` (`20 de 31 ocorrências` no rodapé da `v1`; `15 de 22` no da `v2`; `Primeiras 40 de 2.000` no da `v3`; `5 ocorrências` e `Nenhuma das 7 anotações` na `v4`). Fora de coluna, sem consequência visível.
- `v1`, `v3` e `v4`, ACE-2: o marcador de contexto vazio (`início`, `fim`, `início da anotação`, `fim da anotação`) só se separa do texto citado pela cor, `--text-muted` ao lado de `--text-secondary`, que medem 1,51:1 entre si no claro e 1,56:1 no escuro. O catálogo pede o marcador discreto em `text-text-muted`, e a maiúscula do termo e o cabeçalho da coluna ajudam; itálico ou colchetes dariam o segundo canal sem pesar.
- `v1` a `v4`, NUM-6: `locate` acha só a primeira ocorrência de cada anotação, então a palavra `ocorrências` conta anotações que citam o termo. Na `v3`, a `n-11` escreve `preço` duas vezes e vira uma linha só. Ou a segunda ocorrência ganha linha, ou o substantivo passa a ser anotações.
- `v1`, texto escrito à mão: `nas perdas de 2026-T3`, `na ordem da data` e `oportunidades perdidas` estão fixos no `Chart.tsx`, e o `data.ts` não traz o período, o recorte nem a data de cada anotação. Com outro dado o rodapé e a frase acessível continuam dizendo o mesmo. O recorte e a ordem deveriam vir do dado; e a frase acessível não cita o período que o rodapé cita (DAD-9).
- `v2`, seletor: a opção `Termo` é constante por construção, porque a chave do termo é a própria chave de busca, e sempre devolve um grupo só; com o dado padrão `Contexto esquerdo` também, porque as 15 anotações têm `o` antes do termo. Nos dois estados a primeira linha escreve `15 ocorrências` e a frase acessível escreve `agrupada em 1 sentidos`. Variar a palavra anterior ao termo no `data.ts` (`do`, `ao`, `pelo`) e flexionar `sentido` resolvem; a opção `Termo` só separa algo se ordenar pela grafia como foi escrita, e é o catálogo que a pede.
- `v2`, ordem dentro do grupo: o grupo `mais` sai como barato, rápido, barato, barato, porque o desempate é a ordem do dado. A contagem `4 ocorrências` soma três `mais barato` e um `mais rápido`, e a frase acessível chama os 6 grupos de sentidos. Desempatar pela segunda palavra deixa contíguo o `mais barato`, que é o sentido que o caso de uso cita.
- `v2`, NUM-5: as contagens por grupo valem para as 15 linhas carregadas, e não para as 22 do recorte. O rodapé diz `15 de 22`, mas a contagem não nomeia a base.
- `v2`, ACE-1: a frase acessível diz que há 6 grupos com contagem e não diz qual é o maior (`mais`, com 4). As contagens estão no DOM, então o leitor de tela as alcança; a conclusão cabe na frase, que tem 143 caracteres.
- `v2`, folga do corte: `CONTEXT_MAX_CHARS = 32` não conta os 2 caracteres da reticência, e o comentário fala em cerca de 220 px quando a coluna tem 203,5 px de texto. `entregou a documentação completa …` mede 209,5 px e entra 6 px no respiro da coluna de contagem. Sem consequência visível: a célula de contagem dessa linha está vazia, e preenchida ainda ficaria a 6 px.
- `v2` e `v3`, ACE-8: `--text-secondary` sobre `--surface-sunken`, o par da opção inativa, não está na tabela 17.10. Medido: 9,36:1 no escuro e 7,04:1 no claro.
- `v3`, ANO-6 e pergunta 17: o rodapé termina em `O resto do recorte entra ao colar no Farol, com filtro e virtualização`, e a frase acessível em `o resto do recorte fica fora do preview`. As duas falam com quem cola, e não com quem lê o painel; coladas como estão, chegam ao usuário. Pesado e não reprovado: é redação, a primeira frase do rodapé cumpre o que o catálogo pede (`Primeiras 40 de 2.000`), e a instrução já está no passo 3 de Como colar. Ao colar, corte a segunda frase do rodapé e o fim da frase acessível.
- `v3`, TIP-4: a célula da data usa `font-display` sem peso e herda 400, que a Space Grotesk não carrega; o navegador cai no 500, que é o que a tabela 17.1 pede. `font-medium` na célula escreve o que já se vê.
- `v4`, redação: o cabeçalho da seção escreve sempre `grafias`, mesmo com uma só, enquanto a frase acessível flexiona (`1 grafia`); com três grafias a lista sai `a e b e c`. Só fora do dado padrão.

Revisão de 2026-10-13, segunda passada, só a `v1` (`revisao_desatualizada`, julgado o arquivo depois da correção): aprovada, sem bloqueante. O bloqueante da primeira passada não aparece mais: com o canvas de 760 x 600 e o limite de 46 caracteres com a reticência contada, o contexto esquerdo termina em 335,5 px e o termo começa em 343,5 px ou depois nas 20 linhas (vão de 8,0 a 10,0 px dos dois lados), o contexto mais largo mede 270 px numa coluna de 302,5 px de texto, e as 12 reticências (5 à esquerda, 7 à direita) saem inteiras, nos dois temas e na página viva. `npm run check`: 0 com erro, 4 avisos (os mesmos da AGREGACAO-ZERO), 0 escapes. A tinta foi medida à mão nos quatro PNGs, o corte das 20 linhas foi reproduzido contra o `data.ts`, os pares de texto medem 5,21:1 ou mais no escuro e 5,37:1 ou mais no claro, e o estado vazio foi conferido só por leitura do código. As quatro observações da primeira passada que citam a `v1` (TIP-1, ACE-2, NUM-6 e o texto escrito à mão) seguem valendo no arquivo de hoje. A linha `aguarda nova revisão` de Pendências conhecidas foi respondida por esta passada.

- `v1`, folga do corte: o orçamento é em caracteres, e não em largura medida. Com o dado padrão sobram 32,5 px de cada lado, mas os quatro contextos mais longos, escritos em maiúsculas, calculam de 294 a 315 px na Manrope 400 a 12 px (até 6,95 px por caractere), e três deles passam dos 302,5 px da coluna em 6 a 13 px, o que devolveria o contexto esquerdo encostado no termo e o direito cortado na borda. Sem consequência no preview; ao colar com anotação digitada em caixa alta, baixar o limite para 43 ou menos, ou orçar pela largura.
- `v1`, geometria declarada: o comentário da linha 19 do `Chart.tsx` e o passo 2 de Como colar dizem `coluna de cerca de 320 px` e `6,4 px por caractere`. Medido no PNG: a coluna de `1fr` tem 310,5 px e 302,5 px de texto depois do `pr-2` ou do `pl-2`, e os contextos do dado padrão saem de 5,6 a 6,0 px por caractere. A conclusão se mantém (294 px cabem em 302,5 px), mas a folga sobre a estimativa é de 8,5 px, e não de 26 px.
- `v1`, ANO-5: o rodapé repete o que o título e o subtítulo do cartão já dizem (o termo, as vinte ocorrências, as perdas e `2026-T3`); de novo ele traz só `de 31`, a ordem e o aviso do corte. `20 de 31, na ordem da data. Contexto cortado pelas palavras.` diz o mesmo sem repetir.
- `v1`, NUM-7: `2026-T3` vai para a tela no formato do documento. O Farol não tem formatador de trimestre, e outras quatro versões da família 12 escrevem o mesmo literal no `Chart.tsx`; fica registrado para quando o formatador existir.
- `v1`, redação do `data.ts`: o comentário do campo `totalOccurrences` diz `além das que vêm em notes`, que se lê como 31 fora as 20; o comentário do topo e a tela dizem 20 de 31.

## Pendências conhecidas

Nenhuma pendência conhecida.
