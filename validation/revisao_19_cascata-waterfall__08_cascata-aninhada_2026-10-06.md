# Parecer de revisão: 19_cascata-waterfall/08_cascata-aninhada

Data: 2026-10-06. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 09:52, posterior ao `Chart.tsx` das quatro). `npm run check` com tipos: 0 com erro, 0 avisos.

Resultado: `v1`, `v2` e `v4` aprovadas; `v3` reprovada por um bloqueante. As 18 observações não bloqueantes estão no README do modelo.

## Peso do bloqueante

* **`v3`, percentual impresso que não soma.** NUM-2 e pergunta 6 do checklist. Não é constante de acabamento: é a proporção que o rótulo afirma, e é ela que sustenta a escala própria de cada nível, que a versão existe para demonstrar. Pela seção 14.1 entra em encoding (proporção que não soma) e reprova.
* A precisão da ROT-10 de 2026-09-20, que isenta aritmética de arredondamento, fala de valor em moeda arredondado. Para percentual inteiro de composição a régua é a NUM-2, que manda fechar pelo maior resto, e a família já tem o precedente: `02_cascata-de-decomposicao` fecha 100% com `wholeShares`.
* O mesmo arredondamento existe na `v4`, onde o dado fixo soma 100 por coincidência. Ali ficou como observação, porque nenhum estado da versão imprime soma errada.

## O que foi medido e o que não foi

* **Medido:** os dois PNGs de cada versão por varredura de pixels (2 px de dispositivo por px); contraste do conector, do contorno de ausência e do texto em `--chart-1` pelas cores lidas nos PNGs; os percentuais de cada nível da `v3` pela mesma formatação do `formatPercent` com zero casas (`Intl` em `pt-BR`), aplicada aos valores do `data.ts`.
* **Não renderizado:** os níveis raiz, sem contato e proposta da `v3`. O render só desenha o estado inicial (`initialPath = ['pre-venda']`), então a evidência desses níveis é conta sobre o dado e leitura do código, não PNG.
* **Não testado:** a saída sugerida. Os inteiros citados nela são conta, não medida.

## `v3_perdas-do-funil-em-tres-niveis`: reprovada

### Bloqueante 1. Pergunta 6; NUM-2

**Evidência.** `countLabel` (`Chart.tsx:80`) escreve cada parte com `formatPercent(part, 0)`, arredondando uma a uma, sem repartir o resto. Com o dado fixo, dois dos quatro níveis que a versão navega imprimem partes que não somam o total impresso ao lado:

| Nível | Partes impressas | Soma das partes | Total impresso |
|---|---|---|---|
| Raiz (um clique na migalha) | Pré-venda 1.030 (87%), Proposta 110 (9%), Negociação 40 (3%) | 99% | Perdas 1.180 (100%) |
| Pré-venda (o preview) | 460 (39%), 390 (33%), 120 (10%), 60 (5%) | 87% | 1.030 (87%) |
| Sem contato (um clique no passo) | Telefone 210 (18%), E-mail 140 (12%), Mensagem 80 (7%), Visita 30 (3%) | 40% | Sem contato 460 (39%) |
| Proposta | 38 (3%), 29 (2%), 21 (2%), 9 (1%), Sem classificação 13 (1%) | 9% | 110 (9%) |

Na raiz falta um ponto contra o 100% que a migalha e a coluna final escrevem; em sem contato sobra um ponto contra o 39% do próprio pai. As contagens fecham nos quatro níveis (1.030 + 110 + 40 = 1.180; 210 + 140 + 80 + 30 = 460): o defeito é só do percentual. O preview fecha, e por isso o PNG não mostra o problema.

**O que mudar.** Repartir o percentual inteiro pelo maior resto dentro de cada nível, tendo como alvo o inteiro já atribuído ao pai (100 na raiz), e usar esse mesmo inteiro em todo lugar em que o nó aparece: rótulo da coluna, migalha, `aria-label` do botão do passo e frase acessível. Função pura, com retorno `number | null` quando o total não é positivo (EST-1b); o `wholeShares` de `02_cascata-de-decomposicao/v1` é o molde, e ela pode morar no `data.ts` ao lado do `selectPath`, que a versão já apresenta como testável fora do React.

Conta esperada com o dado fixo, para conferir a correção sem depender do render:

* Raiz, alvo 100: 87, 9 e 4 (Negociação sobe de 3 para 4, maior resto de 0,39).
* Pré-venda, alvo 87: 39, 33, 10 e 5. Igual ao de hoje, então o preview não muda.
* Sem contato, alvo 39: 18, 12, 7 e 2 (Visita desce de 3 para 2).
* Proposta, alvo 9: 3, 2, 2, 1 e 1. Igual ao de hoje.

**O que não mudar.** A contagem escrita em cada marca, a escala própria por nível com a linha que a declara, o passo vazado de Sem classificação por último, a migalha e o seletor puro. A dica pode continuar com uma casa, que é o valor exato.

## Registro

```
Versão: 19_cascata-waterfall/08_cascata-aninhada/v3_perdas-do-funil-em-tres-niveis
Data: 2026-10-06
Resultado: reprovada
Não: 6
Correções:
  6. NUM-2: percentual inteiro por maior resto em cada nível, com alvo no inteiro do pai (100 na raiz), e o mesmo inteiro no rótulo, na migalha e na frase.
Não se aplica: 26, 28, 29, 30, 31
```

As demais três versões (`v1`, `v2`, `v4`) tiveram as 32 perguntas respondidas com sim ou não se aplica; o veredito de cada uma está em `_render/.qa/revisao/19_cascata-waterfall__08_cascata-aninhada.json`.
