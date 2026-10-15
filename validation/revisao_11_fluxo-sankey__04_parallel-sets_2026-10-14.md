# Parecer de revisão: 11_fluxo-sankey/04_parallel-sets

Data: 2026-10-14. Revisão independente de `v2`, `v3` e `v4`, as três com motivo `sem_revisao`. Julgado o arquivo de hoje (Chart.tsx de 2026-09-29, PNGs de 2026-10-02, mais novos que o código), com `npm run check -- 11_fluxo-sankey/04_parallel-sets` em 0 erros e 6 avisos (dois de AGREGACAO-ZERO na `v1`, fora deste julgamento, e um de CONTRASTE-MARCA em cada versão).

Resultado: `v2`, `v3` e `v4` reprovadas. Há uma única rodada de correção, e os três bloqueantes abaixo são todos os encontrados na varredura completa das 32 perguntas. As observações não bloqueantes estão no README do modelo, seção final.

Tokens usados nas medidas abaixo, de `app/src/styles/tokens.css`, contra `--surface-raised`: `--line-strong` 1,79:1 (escuro) e 1,83:1 (claro); `--text-muted` 5,21:1 e 5,37:1; `--text-secondary` 8,16:1 e 8,13:1; `--chart-1` 9,50:1 e 6,00:1. Entre marcas: `--chart-1` contra `--text-muted` 1,82:1 e 1,12:1; `--text-secondary` contra `--text-muted` 1,56:1 e 1,51:1.

## v2_combinacao-em-destaque: reprovada

Não: 32, 11, 20.

**Bloqueante 1. Perguntas 32, 11 e 20; regras ACE-6, ACE-3 e tabela 17.2 (papel "Neutro de dado, com valor escrito"); armadilha TOK-5.**
Evidência: `Chart.tsx:81` define `CONTEXT_FILL = 'var(--line-strong)'` e `Chart.tsx:276` pinta com ele toda fita fora de foco: 27 das 28 combinações, nos dois vãos, 54 fitas, mais a amostra da legenda (`Chart.tsx:381`), as 55 marcas que o check mede em 1,79:1 no escuro e 1,83:1 no claro. A tabela 17.2 só aceita `--line-strong` como dado "quando cada marca carrega o próprio número", e nenhuma das 54 fitas tem número junto dela: o que está escrito é o total de cada bloco (`Chart.tsx:346`) e a soma das 27 na legenda (227 agendas), nunca a contagem da fita (14, 5, 16, 6, 7, 4 e assim por diante). Teste da ACE-6: tapadas as fitas neutras, some como as outras 227 agendas se combinam, por exemplo que as outras 7 agendas de Indicação com empresa Grande foram remarcadas, ou de que origens vêm as 164 Realizadas fora do foco. A ACE-6 nomeia "a ligação de um Sankey" como traço que carrega a relação, e o modelo existe para mostrar como os atributos se combinam. Precedentes da família com o mesmo desenho: `03_alluvial/v2` caiu por isto hoje e `02_sankey-multietapa/v1` em 2026-10-05.
O que mudar:
1. `CONTEXT_FILL` passa a `var(--text-muted)` opaco, que mede 5,21:1 e 5,37:1. A amostra da legenda acompanha.
2. Toda fita, acesa ou neutra, ganha o contorno `var(--surface-raised)` de 1 a 1,5 px da COR-5 (a `v4` já faz isso com `RIBBON_STROKE`): com 27 fitas da mesma cor e sem borda, a troca do item 1 funde o contexto numa massa só (armadilha TOK-4).
3. Os blocos de eixo também são `--text-muted` (`BLOCK_FILL`, `Chart.tsx:82`). Depois do item 1, bloco e fita têm a mesma cor e só o contorno de 1 px os separa; ou o bloco muda de token (por exemplo `--text-secondary`, 8,16:1 e 8,13:1 contra o cartão), ou a separação é conferida no PNG dos dois temas e descrita no `notes`.
4. Pela TOK-9, depois do item 1 a fita acesa e as neutras medem 1,82:1 entre si no escuro e 1,12:1 no claro: no tema claro o destaque passa a depender só de matiz. O peso 600 nas categorias em foco e o 700 na linha de leitura são segundo canal fora da fita; falta um na própria fita. A saída que a revisão de `18_radar/06_coordenadas-paralelas/v2` aceitou é um revestimento em `--surface-raised` sob a fita acesa, mais largo que o contorno das neutras. Medir o par marca contra marca nos dois temas e escrever o número no `notes`.
5. Atualizar o que hoje afirma a isenção: o comentário do topo (`Chart.tsx:19` a `23` e `80`), o "Custo aceito" do `DESVIO DECLARADO 1` no `notes` do `meta.json` e o item da `v2` na Anatomia e no registro do produtor do README.

Conferido e sem bloqueante: os três eixos fecham em 248 (52, 50, 48, 38 e 60; 69, 101 e 78; 185, 31, 19 e 13), igual ao `data.ts`; a fita acesa tem 21 agendas e sai com cerca de 15,9 px na escala de 0,756 px por agenda, contínua do primeiro ao último eixo e costurada pela fatia acesa dentro de cada bloco; "8,5% (21 de 248)" confere; peso 700 em dois elementos, o nome e o valor da combinação (TIP-3), com as categorias em foco em 600; os dois desvios da especificação (15% de opacidade e 700 nas três categorias) estão declarados no `notes` e o contrato venceu nos dois (ACE-5, TIP-3); frase acessível começa pelo tipo e diz a parte do todo (ACE-1); vazio e soma zero no mesmo portão `role="status"` (EST-1, EST-1b); textos sobre o cartão, sem colisão nem corte nos dois temas, e as guardas de texto mediram a peça; canvas por número com a conta das linhas no `notes` (GEO-1).

## v3_cobertura-de-dado-dos-leads-por-origem: reprovada

Não: 32, 11, 20.

**Bloqueante 1. Perguntas 32, 11 e 20; regras ACE-6, ACE-3 e tabela 17.2; armadilha TOK-5.**
Evidência: `Chart.tsx:80` define `MISSING_FILL = 'var(--line-strong)'` e `Chart.tsx:264` pinta com ele as fitas das 12 combinações sem telefone, nos três vãos, 36 fitas, mais a amostra da legenda (`Chart.tsx:357`): as 37 marcas que o check mede em 1,79:1 e 1,83:1. Aqui o defeito é mais grave que na `v2`, porque essas fitas são metade da resposta: os 520 leads sem telefone, dos quais 84 vão para Qualificado e 436 para Descartado. Nenhuma delas tem número junto: o que está escrito é o total dos blocos (520, 318, 922) e a taxa na linha de leitura. No PNG escuro, a faixa de 84 leads (cerca de 18,4 px na escala de 0,219 px por lead) que sobe de Sem telefone para a base de Qualificado mal se destaca do cartão, e é exatamente a comparação que a pergunta pede. Teste da ACE-6: tapadas, desaparece para onde vão os leads sem telefone. A seção 7 do contrato admite `--line-strong` para a categoria de ausência em composição, mas isso cobre o segmento, não a ligação; a ACE-6 (emenda de 2026-09-20) é a regra específica do traço que carrega a relação, e o próprio segmento de ausência aqui já é vazado em `--text-muted`.
O que mudar, por um de dois caminhos:
1. Fita cheia em `var(--text-muted)` (5,21:1 e 5,37:1), com contorno `var(--surface-raised)` de 1 a 1,5 px em toda fita (COR-5). Os blocos que não são ausência também são `--text-muted` (`BLOCK_FILL`, `Chart.tsx:81`) e a fita neutra encosta em Mídia social, Busca paga, Orgânico, Cargo declarado, Qualificado e Descartado: mudar o token do bloco (por exemplo `--text-secondary`) ou conferir a separação no PNG dos dois temas.
2. Fita vazada, sem preenchimento, com contorno `var(--text-muted)` de 1,5 a 2 px, o mesmo desenho do segmento de ausência (ACE-2: ausência com forma vazada), como a faixa vazada que `02_sankey-multietapa/v2` aprovou. Conferir no PNG que o emaranhado entre Origem e Cargo continua legível com contornos.
Nos dois caminhos vale a TOK-9: `--chart-1` contra `--text-muted` mede 1,82:1 no escuro e 1,12:1 no claro, então no caminho 1 as duas bandas se separam só por matiz no tema claro. O segundo canal já existe e deve ser declarado: a posição (com `stackOrder`, os leads com telefone ficam sempre por cima em todos os eixos) e o bloco vazado de Sem telefone. Escrever o par medido e o segundo canal no `notes`, e atualizar o comentário do topo (`Chart.tsx:33` a `35` e `79`) e o "Custo aceito" do `notes`.

Conferido e sem bloqueante: os quatro eixos fecham em 1.240 (520, 420 e 300; 680 e 560; 720 e 520; 318 e 922); "32,5% (234 de 720)" e "16,2% (84 de 520)" conferem com o `data.ts`, por `formatRateWithVolume` (NUM-1); as duas categorias de ausência são vazadas, com contorno `--text-muted`, e vêm por último no eixo (seção 7, ACE-2); telefone é vizinho de desfecho e o `stackOrder` está declarado no dado (GEO-12); frase acessível de cerca de 220 caracteres, começa pelo tipo e traz as duas taxas (ACE-1); peso 700 em dois elementos, as duas taxas (TIP-3); legenda com amostra vazada para a ausência (ROT-4); EST-1 presente; textos sem colisão nem corte nos dois temas.

## v4_combinacoes-raras-agregadas: reprovada

Não: 3.

**Bloqueante 1. Pergunta 3 (nenhuma forma sugere algo que o dado não tem) e seção 14.1, regra que decide o que o desenho afirma (encoding e unidade de cada segmento).**
Evidência: `Chart.tsx:198` a `215` tira as 6 combinações raras das suas categorias e cria a categoria "Outras combinações" nos três eixos. Em parallel sets cada eixo é a partição da mesma população por aquela dimensão, e a linha de leitura diz "Das 28 combinações das 248 agendas", então cada bloco se lê como o total da categoria nas 248. Com o corte, 10 dos 12 blocos nomeados medem e escrevem menos que o total real do `data.ts`:

| Categoria | Escrito no bloco | Total real |
|---|---|---|
| Mídia social | 48 | 54 |
| Busca paga | 46 | 50 |
| Rede social | 44 | 48 |
| Orgânico | 30 | 33 |
| Indicação | 60 | 63 |
| Média | 93 | 101 |
| Grande | 66 | 78 |
| Remarcada | 23 | 30 |
| Cancelada | 11 | 20 |
| Não compareceu | 5 | 9 |

Só Pequena (69) e Realizada (189) saem certas, porque nenhuma rara passa por elas. Cancelada perde 45% e Não compareceu 44%: quem pergunta ao cartão quantas agendas foram canceladas lê 11, e foram 20. Além disso Porte e Desfecho ganham um valor que não é porte nem desfecho: as 20 agendas agregadas têm porte (12 Grande, 8 Média) e desfecho (7 Remarcada, 9 Cancelada, 4 Não compareceu). A lista do rodapé permite reconstruir a verdade, mas só somando à mão. É a diferença para o "Outros (n=X)" da COR-4, que agrupa categorias pequenas sem mudar a contagem das que ficam nomeadas.
O que mudar:
1. Cada bloco nomeado volta a medir e escrever o total real da categoria, e Porte e Desfecho deixam de ter a categoria "Outras combinações". Fita única de "outras" exige bloco agregado nos três eixos, e é esse bloco que tira as agendas das categorias; por isso não há saída que mantenha a fita única.
2. As 6 raras ficam dentro das suas categorias, empilhadas por último em cada bloco (chave de empilhamento "rara" depois das frequentes), pintadas num neutro único e sem cor de origem: a parte rara se lê como fatia neutra no pé de cada bloco, e o grupo "outras combinações" passa a ser o conjunto dessas fitas neutras, com "6 combinações, 20 agendas" escrito numa anotação ou entrada de legenda com valor.
3. Como as fitas raras deixam de ter número junto delas (hoje o "20 agendas" fica acima do bloco agregado, e por isso o `--line-strong` atual está isento pela 17.2), o neutro delas precisa dos 3:1 da ACE-6: `--text-muted` (5,21:1 e 5,37:1). Os blocos de Porte e Desfecho estão no mesmo `--text-muted` (`BLOCK_FILL`, `Chart.tsx:78`): mudar o token do bloco ou conferir a separação nos dois PNGs.
4. Sem a sexta raia, o eixo mais alto volta a 5 categorias e a escala sobe para cerca de 0,95 px por agenda: a rara de 2 agendas sai com cerca de 1,9 px. Entre fitas raras vizinhas, que são o mesmo grupo, o contorno da COR-5 pode ser dispensado para não comer a fita; contra as fitas coloridas ele fica.
5. Ficam como estão: o limiar em constante, a anotação do limiar, a linha de leitura, a frase acessível e a lista do rodapé. O desvio contra o texto do catálogo ("faixa outras combinações em --line-strong") se declara no `notes`, porque o contrato vence; atualizar o comentário do topo (`Chart.tsx:19` a `35`), o `demonstrates`, o `notes` e o item da `v4` no README.

Conferido e sem bloqueante: as 28 combinações somam 248 e as 6 raras somam 20 (2, 4, 4, 4, 3 e 3), conferidas contra o `data.ts`; slots 1, 3, 6, 5 e 2 por chave, vindos do dado (COR-3, COR-8); contorno `--surface-raised` de 1 px entre fitas (COR-5); limiar em constante do topo e agregação no componente, com o dado cru; frase acessível de 198 caracteres (ACE-1); peso 700 em dois elementos (TIP-3); lista do rodapé com nome e contagem, sem corte; EST-1 presente; textos sem colisão nos dois temas.
