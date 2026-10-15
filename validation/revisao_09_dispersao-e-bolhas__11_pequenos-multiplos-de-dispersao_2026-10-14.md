# Revisão de 09_dispersao-e-bolhas/11_pequenos-multiplos-de-dispersao, 2026-10-14

Revisor independente. Julgadas `v2`, `v3` e `v4`, todas `sem_revisao`. A `v1` segue aprovada desde 2026-09-28 e não foi julgada aqui.

`npm run check -- 09_dispersao-e-bolhas/11_pequenos-multiplos-de-dispersao`: 0 com erro, 0 avisos. ESPESSURA-MARCA e CONTRASTE-MARCA não medem nenhuma das quatro (`preview_com_transform`); o contraste das marcas foi conferido contra a 17.2 e a 17.10: `--chart-1` 9,50 e 6,00, `--text-muted` 5,21 e 5,37 contra o cartão, nos dois temas.

Conferido à mão contra o `data.ts`: as contagens por região dos cinco trimestres com observação da `v4` (somam 11, 13, 9, 2 e 12), a tendência "1 de 11" a "9 de 12", o domínio de R$ 800 mil e 160 dias com passo de 40, e a soma de 47 oportunidades da frase acessível. Tudo bate.

## v4_quadrantes-por-trimestre-com-painel-vazio: reprovada

```
Versão: 09_dispersao-e-bolhas/11_pequenos-multiplos-de-dispersao/v4_quadrantes-por-trimestre-com-painel-vazio
Data: 2026-10-14
Resultado: reprovada
Não: 1
Correções:
  1. 14.1 (identificação das marcas; versão contra o catálogo): o título diz que os pontos são executivos e o corpo conta oportunidades; alinhar os dois e declarar a escolha.
Não se aplica: 6, 18, 26, 27, 28, 30, 31
```

**Bloqueante 1. Pergunta 1, seção 14.1: identificação das marcas e versão que não demonstra o que o catálogo diz.**

- Evidência no PNG, nos dois temas: o título do cartão, a primeira coisa lida, é `Quadrantes de executivos por trimestre`. Logo abaixo, o corpo inteiro trata cada ponto como oportunidade: `Cada título conta as oportunidades por região`, `11 oportunidades`, `2 oportunidades · amostra pequena`, `0 oportunidades`, e as regiões em feminino (`0 rápidas, 2 lentas`), que concordam com oportunidade e não com executivo.
- Evidência no código: `meta.json` linha 2 mantém o título do catálogo; `data.ts` linhas 2 e 3 declaram os pontos como "oportunidades ganhas, agrupadas por trimestre"; a frase acessível diz "47 oportunidades em 6 trimestres".
- Evidência no catálogo (`_estudo/catalogo/09_dispersao-e-bolhas/11_pequenos-multiplos-de-dispersao.json`, linhas 56 e 57): título `Quadrantes de executivos por trimestre` e caso de uso "se um tem 2 **executivos** e outro não tem oportunidades". Ali o ponto é o executivo, como no quadrante de executivos da família 25. O `meta.json` reescreveu o caso de uso para "se um tem 2 oportunidades e outro não tem nenhuma" e manteve o título. A seção "Divergências declaradas" do README lista só a tensão entre os itens 1 e 4; a troca da unidade do ponto não aparece em lugar nenhum.
- Por que bloqueia: o título identifica a marca como executivo e o corpo a conta como oportunidade. "Quadrante de executivos" é uma forma conhecida, com um ponto por pessoa, e quem a reconhece pelo título lê `11 oportunidades` como contradição ou lê 11 executivos no trimestre. Identificar as marcas é regra que decide o que o desenho afirma (14.1). Não é questão de redação: aqui o texto lê errado, e não só diferente do catálogo. Na `04_bolhas-em-grade-categorica/v4` a troca de `useCase` ficou como observação porque ali nada se lia errado.
- O que mudar, uma das duas saídas:
  - **(a) Seguir o catálogo.** Cada ponto é um executivo no trimestre (ticket mediano e ciclo mediano dele), o painel pequeno tem 2 executivos, o vazio não tem oportunidade, e cabeçalho, contagens por região, linha de leitura e frase falam em executivos. A meta de ticket que mudou num trimestre também fica mais natural, porque meta de ticket é de executivo.
  - **(b) Manter oportunidades e retitular.** Trocar o título do `meta.json` por um que nomeie a unidade real, por exemplo `Quadrantes de oportunidades por trimestre`, e declarar a troca de unidade em "Divergências declaradas" do README e no `notes`, com o motivo.
  - Em qualquer das duas, o resto da peça fica como está.

Conferido e sem reparo na `v4`: mesmos cortes desenhados nos seis painéis, com a meta antiga escrita no cabeçalho em vez de mover a linha (EIX-9); `ReferenceLine` com `extendDomain` em `--text-muted`; painel vazio sem plano, com moldura tracejada, `Filter` e frase (EST-1, DAD-2); `0 oportunidades` como zero medido (EST-3); nota de amostra pequena no painel de 2; cabeçalho de quatro linhas em todos, plano de cerca de 204 por 89 px nos cinco painéis com observação, medido no PNG; `tickOwners` passando a régua ao vizinho quando o painel da borda está vazio; frase de 233 caracteres que começa pelo tipo e traz a conclusão calculada; nenhum 700, tamanhos de 12 e 11 px, nenhuma opacidade.

## v2_time-inteiro-ao-fundo: aprovada

Sem bloqueante. Observações registradas no README do modelo, parágrafo de 2026-10-14.

## v3_doze-regioes-ordenadas-pela-mediana: aprovada

Sem bloqueante. As 12 medianas de ciclo foram conferidas à mão contra o `data.ts`, e a ordem da tela sai certa do arquivo alfabético. Observações registradas no README do modelo, parágrafo de 2026-10-14.
