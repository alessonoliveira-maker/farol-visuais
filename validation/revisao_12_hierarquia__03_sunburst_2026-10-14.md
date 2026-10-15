# Revisão de `12_hierarquia/03_sunburst`, 2026-10-14

Revisor independente, primeira passada das três versões em `sem_revisao` (a `v1` está aprovada desde 2026-09-20 e não entrou). Julgadas pelos arquivos de hoje e pelos PNGs de 2026-10-02, mais novos que os `Chart.tsx` de 2026-09-28; não foi preciso renderizar de novo. `npm run check -- 12_hierarquia/03_sunburst` com tipos: 0 com erro, 13 avisos, todos da `TEXTO-NA-MARCA` em fila de dívida conhecida (a guarda orienta e não reprova; ver o peso abaixo).

| Versão | Resultado | Não |
|---|---|---|
| `v2_ramo-indicacao-em-destaque` | reprovada | 6 |
| `v3_motivos-de-perda-com-detalhamento` | reprovada | 6, 16 |
| `v4_subcanais-finos-agrupados` | aprovada | nenhum |

## Peso dos achados

* **Percentual impresso que não soma 100.** NUM-2 e pergunta 6. Não é arredondamento de acabamento: é a proporção que a lista afirma, e a seção 14.1 põe "proporção que não soma" em encoding. Precedente da casa: `19_cascata-waterfall/08` v3 e `25_matriz-e-quadrantes/01`, ambas reprovadas pelo mesmo defeito. A precisão da ROT-10 que isenta arredondamento fala de valor somado, não de percentual inteiro de composição.
* **Rótulo do anel com halo sobre setor preenchido** (`TEXTO-NA-MARCA`, ROT-7b). Observação, não bloqueante: a guarda o classifica como dívida conhecida, o texto lê limpo nos seis PNGs, a `v1` foi aprovada com o mesmo padrão, e na `v4` a saída da ROT-7b nem é possível com o `textOptions` global. Fica no README e pode ir na mesma rodada da `v2` e da `v3`.
* **"Anéis externos mais finos", item do catálogo da `v2` que a versão não desenha.** Observação: o limite é da biblioteca, medido na fonte e declarado no README; o número escrito em todo setor é a saída da GEO-5. O catálogo promete o que o `SunburstChart` não faz.

## `v2_ramo-indicacao-em-destaque`: reprovada

### Bloqueante 1. Pergunta 6; NUM-2

**Evidência.** `Chart.tsx:174` calcula `shareOf(branch.total, total)` e a linha 183 escreve cada origem com `formatPercent(share, 0)`, uma a uma, sem repartir o resto. Os dois PNGs imprimem na lista 35%, 27%, 15%, 12% e 10%: soma 99.

| Origem | Entradas | Exato | Impresso | Pelo maior resto |
|---|---|---|---|---|
| Indicação | 305 | 34,977% | 35% | 35% |
| Mídia paga | 233 | 26,720% | 27% | 27% |
| Orgânico | 135 | 15,482% | 15% | **16%** |
| Cliente ativo | 108 | 12,385% | 12% | 12% |
| Outbound | 91 | 10,436% | 10% | 10% |
| Soma | 872 | 100% | **99%** | 100% |

As contagens fecham (168 + 96 + 41 = 305, e as cinco origens somam 872); o defeito é só do percentual.

**O que mudar.** Repartir o percentual inteiro das origens pelo maior resto numa função pura com retorno `number | null` para total não positivo (EST-1b), indexada por id, e usar o mesmo inteiro em todo lugar em que a origem aparece: lista, centro, linha de leitura e frase acessível. Critério de aceite no PNG: Orgânico com 16%, e o centro e a linha de leitura continuam em 35%.

**O que não mudar.** O ramo aceso declarado no `data.ts` e não inferido do ranking; o neutro `--text-muted` com valor escrito em todo setor; o peso 700 só no nome de Indicação (linha de leitura e lista); a base "de 872 entradas" logo abaixo do percentual no centro; a lista com o filho recuado e menor que o pai; o estado vazio com `role="status"`.

### Registro no formato do checklist

```
Versão: 12_hierarquia/03_sunburst/v2_ramo-indicacao-em-destaque
Data: 2026-10-14
Resultado: reprovada
Não: 6
Correções:
  6. NUM-2: percentual das origens pelo maior resto (Orgânico passa a 16%), o mesmo inteiro na lista, no centro, na linha de leitura e na frase.
Não se aplica: 4, 7, 13, 18, 26, 28, 29, 30, 32
```

## `v3_motivos-de-perda-com-detalhamento`: reprovada

### Bloqueante 1. Pergunta 6; NUM-2

**Evidência.** O mesmo cálculo da `v2`: `Chart.tsx:303` e `:324` escrevem cada nó do nível aberto com `formatPercent(share, 0)`, e a linha 218 faz o mesmo para o líder. No estado do preview, aberto em Sem perfil, os dois PNGs imprimem 58%, 28% e 13%: soma 99.

| Submotivo | Perdas | Exato | Impresso | Pelo maior resto |
|---|---|---|---|---|
| Patrimônio abaixo do piso | 148 | 58,498% | 58% | **59%** |
| Decisor não identificado | 71 | 28,063% | 28% | 28% |
| Fora da região atendida | 34 | 13,439% | 13% | 13% |
| Soma | 253 | 100% | **99%** | 100% |

Os outros estados, lidos no código e conferidos pela conta sobre o `data.ts`, fecham por acaso do dado: raiz 39, 27, 15, 12 e 7; Sem contato 75 e 25; Concorrência 62 e 38; Momento 70 e 30; Produto 62 e 38.

**O que mudar.** Percentual inteiro pelo maior resto dentro do nível aberto, numa função pura com `number | null` para total não positivo (EST-1b), e o mesmo inteiro na lista, na linha de leitura e na frase acessível. Critério de aceite no PNG: "Patrimônio abaixo do piso domina 59% das 253 perdas de Sem perfil", e a lista 59, 28 e 13.

### Bloqueante 2. Pergunta 16; EST-1 e o item do catálogo "Volta à raiz quando o filtro global remove o ramo aberto"

**Evidência.** `resolveOpen` (`Chart.tsx:106`) só devolve a raiz quando o id aberto some do dado. Quando o ramo continua no dado mas chega vazio (`submotivos: []`, ou todos com valor 0), `levelNodes` devolve o nível dele, `levelTotal` dá 0 e a linha 201 troca a peça inteira pelo bloco de vazio. Duas consequências:

1. O bloco diz "Nenhuma perda neste recorte: não há categoria nem submotivo para dividir no anel", o que é falso: o recorte tem as perdas das outras categorias (402 no dado fixo, se Sem perfil zerar).
2. O bloco substitui também a trilha e o Voltar, então a pessoa não tem como sair do ramo. O `path` continua no estado e o beco persiste até o filtro mudar de novo.

O mesmo beco se alcança sem filtro: na raiz, uma categoria com submotivos zerados sai com `openable = node.children.length > 0` (linha 304) e vira botão na lista, e o clique leva ao bloco. O README manda montar a lista de categorias a partir de um dicionário fixo da página (Como colar, item 3), que é justamente o caminho que produz categoria com lista de submotivos vazia.

A `v4` de `12_hierarquia/01_treemap`, da mesma família, mostra o desenho esperado para ramo vazio: bloco `role="status"` com trilha e voltar.

**O que mudar.** Ramo aberto com soma não positiva conta como removido (`resolveOpen` só aceita a categoria se a soma dos submotivos for maior que 0), descer exige valor maior que 0 e não só filhos, e o bloco de vazio passa a testar o dado inteiro, não o nível. Critério de aceite, conferível montando o componente com `data` em que Sem perfil tem `submotivos: []` e `initialPath` em `['sem-perfil']`: a peça abre na raiz com as quatro outras categorias e a trilha "Todas as perdas".

**O que não mudar.** O caminho em `useState` e o dado do gráfico igual à subárvore aberta; a categoria aberta voltando como anel interno inteiro; o `ringPadding` de 6 px; clique em folha sem efeito; a descida também por botão na lista; o centro com Voltar e "dentro de Sem perfil"; a cor por `slot` na ordem 1, 3, 6, 5, 2.

### Registro no formato do checklist

```
Versão: 12_hierarquia/03_sunburst/v3_motivos-de-perda-com-detalhamento
Data: 2026-10-14
Resultado: reprovada
Não: 6, 16
Correções:
  6. NUM-2: percentual do nível aberto pelo maior resto (Patrimônio abaixo do piso passa a 59%), o mesmo inteiro na lista, na linha de leitura e na frase.
  16. EST-1: ramo aberto vazio volta à raiz em vez de cair no bloco de vazio sem trilha; descer exige valor maior que 0; o vazio testa o dado inteiro.
Não se aplica: 4, 7, 13, 18, 26, 28, 29, 30, 32
```

## Itens que podem ir na mesma rodada da `v2` e da `v3` (não bloqueiam; estão no README)

* ROT-7b: rótulo do anel vazado em `--surface-raised` e sem halo, já que todo setor é preenchido (5,21:1 e 5,37:1 sobre `--text-muted`, de 5,34:1 a 9,50:1 sobre as categóricas). Tira os avisos da `TEXTO-NA-MARCA` das duas.
* DAD-9: semana e trimestre vindos do dado e escritos na tela.
* `v3`: a cor de ação em `--chart-1` disputa papel com a cor de Sem perfil na raiz; e o `path` podado no estado, como o comentário de `resolveOpen` promete.
* `v2`: a nota curta da GEO-5 dizendo que os anéis não se comparam entre si, e o `notes` do `meta.json` com `accent-cyan` no lugar de `accent-amber`.

## `v4_subcanais-finos-agrupados`: aprovada

Sem "não" nas 32 perguntas. Conferido no código, no dado e nos dois PNGs:

* Preparo refeito à mão com piso de 39,84 entradas (4% de 996): Mídia paga 126, 78, 43, Outros 46 (Vídeo 23, Remarketing 14, Afiliado 9) e Não classificado 56, somando o declarado 349; Indicação 108, 57 e Outros 42; Orgânico 86, 47 e Outros 45; Outbound 61, Outros 59 (Evento 34, Lista fria 17, Webinar 8) e Não classificado 44, somando 164; Cliente ativo 56 e Outros 42. Treze subcanais agrupados, cem entradas sem subcanal, igual à linha de leitura e ao rodapé.
* Percentuais 35, 21, 18, 16 e 10 somam 100 (por acaso do dado; o maior resto fica como observação). Cores por `slot` na ordem 1, 3, 6, 5, 2, cinco partes coloridas; a ausência vem por último em cada origem, fora de "Outros", em vazado com contorno de `--text-muted` (5,21:1 e 5,37:1, ACE-6) e com palavra no rodapé (ACE-2).
* Todo nó tem nome e número na lista, inclusive cada subcanal agrupado (ROT-10); a lista segue a ordem do anel. Nenhum rótulo encosta: o par mais apertado, 43 e 46, tem 34,1 px de centro a centro contra os 23,5 px que a tinta pede. Nenhum halo corta o contorno do vazado.
* A troca do hachurado do catálogo pelo vazado segue a COR-9, e o piso de 4% no lugar do 1% está derivado da geometria do rótulo e declarado.

## Não medido pela ferramenta

* `ESPESSURA-MARCA` nas três (`sem_marca_de_barra` na `v2` e na `v4`, `marca_html` na `v3`): o anel mede 46,3 px na `v2`, cerca de 51 px no estado aberto da `v3` e 31,7 px na `v4`, todos acima dos 17 px do rótulo de 11 px.
* `CONTRASTE-TEXTO` e `COLISAO-TEXTO` não alcançam o centro, a trilha, a lista e o rodapé (`foreignObject`): os pares usados são `--text-primary`, `--text-secondary`, `--text-muted` e `--chart-1` sobre `--surface-raised`, todos aprovados na tabela 17.10, e nos PNGs nada encosta nem corta.
* O estado de raiz da `v3` não está no preview: os percentuais e a folga dos rótulos dele foram conferidas pela conta sobre o `data.ts`, não por render.
