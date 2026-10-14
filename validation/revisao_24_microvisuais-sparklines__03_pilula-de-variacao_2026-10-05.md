# Parecer de revisão: 24_microvisuais-sparklines/03_pilula-de-variacao

Data: 2026-10-05. Revisor independente, primeira passada: as quatro versões estavam sem revisão. `npm run check` com tipos: 0 com erro, 0 avisos, 0 escapes.

Como foi medido: nos PNGs de `_render/.qa/24_microvisuais-sparklines/03_pilula-de-variacao/`, que têm 2 px de imagem por px de CSS e são mais novos que os quatro `Chart.tsx`; na frase gravada em `data-farol-ace` de cada `preview.svg`; e na leitura do código para os ramos que o dado padrão não percorre.

| Versão | Resultado | Não |
|---|---|---|
| `v1_receita-do-mes-contra-mes-anterior` | aprovada | nenhum |
| `v2_setas-de-tendencia-na-linha-de-leitura` | reprovada | 1 e 16 |
| `v3_status-do-handoff-por-oportunidade` | aprovada | nenhum |
| `v4_origens-com-base-zero-e-base-minuscula` | reprovada | 16 |

As observações não bloqueantes das quatro versões estão no README do modelo, seção `Observações da revisão (não bloqueantes)`, parágrafo de 2026-10-05. Este arquivo trata do que reprova.

## v2_setas-de-tendencia-na-linha-de-leitura

Resultado: reprovada. Dois bloqueantes: um mora no ramo de vazio, o outro está no dado padrão.

### Bloqueante 1. Lista vazia desenha um ponto final solto e a legenda de setas que não existem

Pergunta 16. Regra: EST-1.

**Evidência.**

- `Chart.tsx` não tem nenhum ramo com `role="status"`. A `v3` deste modelo tem (linhas 92 a 105), e as 12 versões dos modelos irmãos `24/01`, `24/02` e `24/04` também.
- Com `indicators: []`, `readings` fica vazio e o componente segue. O `<p>` da linha 118 desenha só o ponto final da linha 125. O cabeçalho continua dizendo `Pré-vendas, leitura da semana`.
- A legenda das linhas 128 a 137 não depende do dado: continua desenhando as três setas com `em alta`, `estável, variação abaixo de 5%` e `em queda`.
- A frase acessível vira `Linha de leitura da pré-vendas na semana de 28/09/2026: 0 indicadores, 0 em alta, 0 estáveis e 0 em queda.` A tela ensina a ler uma frase que não foi escrita.

**O que mudar.** Antes do `return` principal, quando `data.indicators.length === 0`, devolver o bloco de vazio no molde da `v3`: raiz `flex h-full w-full min-w-0 items-center justify-center rounded-lg border border-line-subtle bg-surface-raised p-4` com `role="status"`, ícone `Filter` de 16 px e uma frase de 12 px em `--text-muted` dizendo que a semana não tem indicador medido e que por isso não há tendência a ler. Sem cabeçalho e sem legenda. O `aria-label` do bloco com pelo menos 100 caracteres (o da `v3` tem 99).

### Bloqueante 2. Nenhum indicador cai, e a seta de queda só existe na legenda

Pergunta 1. Regra: seção 14.1, versão que não demonstra o que declara.

**Evidência.**

- O primeiro item do `demonstrates`, no catálogo e no `meta.json`, é `ArrowUpRight, ArrowDownRight e ArrowRight inline`. O caso de uso pergunta quais indicadores estão `estáveis, em alta ou em queda`.
- `data.ts`, linhas 41 a 45: os cinco pares dão +9,3%, +1,6%, +24%, −4,5% e um sem base. Com a faixa de 5%, são dois em alta, dois estáveis e nenhum em queda. O comentário do topo do `data.ts` lista os casos difíceis e a queda não está entre eles.
- Nos dois PNGs a `ArrowDownRight` aparece uma vez só, na legenda, ao lado de `em queda`. Na frase não há nenhuma. O `data-farol-ace` do preview confirma: `2 em alta, 2 estáveis e 0 em queda`.
- O que fica sem demonstração é o caso em que a polaridade mais pesa: a queda de uma métrica em que subir é melhor, com seta para baixo em `--negative`, ao lado da seta para cima em `--negative` do tempo de resposta. É a prova de que a cor segue a métrica e o glifo segue o sentido.

**O que mudar.** Só o dado. Tirar um dos dois estáveis da faixa: `handoff` com `previous: 25` dá 21 contra 25, queda de 16%, `ArrowDownRight` em `--negative`. O trecho fica um caractere mais curto (`−16% contra 25` no lugar de `−4,5% contra 22`), então a quebra das quatro linhas e o canvas de 640 x 320 se mantêm. A frase acessível ganha `Handoffs aceitos: −16%, o que é pior.` e vai para perto de 220 caracteres, dentro do teto de 250. Ajustar o comentário do topo do `data.ts` (um estável, um em queda) e conferir no render novo se a seta de queda assenta na mesma altura das outras.

### Para acertar na mesma passada (não bloqueantes, já no README)

- NUM-4: a base vai só pelo valor (`contra 108`). Escrever `contra a semana anterior` uma vez, no cabeçalho ou na legenda, para o nome do período não depender de existir um item sem base.
- Posição da seta: a tinta da `ArrowUpRight` para 3,5 px acima da linha de base (medido: seta de 249 a 262, algarismos de 250 a 269, em px de imagem). `self-center` no glifo ou um deslocamento de 2 px resolve.
- EST-2 no ramo de `current` nulo: `Unplug` e `--text-muted`, e contar esse indicador à parte na frase acessível.
- `meta.json`, `notes`: a frase tem quatro linhas, não cinco.

### Conferido e sem bloqueante

Sinal à mão com U+2212 e precisão da NUM-1 nos quatro percentuais; cor pela polaridade (tempo de resposta em `--negative` com seta para cima, e a legenda escreve `subir é pior`, então a leitura não depende só da cor); indicador sem base sem seta e com a ausência declarada; três tamanhos de texto (14, 12 e 11 px); pares de contraste todos aprovados na tabela 17.10; frase acessível de 183 caracteres com os mesmos números do corpo; nenhuma colisão nem transbordo nos dois PNGs.

```
Versão: 24_microvisuais-sparklines/03_pilula-de-variacao/v2_setas-de-tendencia-na-linha-de-leitura
Data: 2026-10-05
Resultado: reprovada
Não: 1, 16
Correções:
  1. Seção 14.1: pôr no data.ts um indicador em queda fora da faixa de 5%, para a ArrowDownRight existir na frase.
  16. EST-1: ramo de vazio com role="status", ícone Filter e frase, no molde da v3, sem cabeçalho nem legenda.
Não se aplica: 3, 4, 6, 7, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

## v4_origens-com-base-zero-e-base-minuscula

Resultado: reprovada. Um bloqueante, no ramo de vazio. O desenho do dado padrão está certo.

### Bloqueante 1. Lista vazia desenha o cabeçalho, a regra e os nomes das colunas de uma tabela sem linha

Pergunta 16. Regra: EST-1.

**Evidência.**

- `Chart.tsx` não tem nenhum ramo com `role="status"`.
- Com `rows: []`, as linhas 138 a 144 continuam escrevendo `Variação de ago/26 contra jul/26; neutra dentro de ±1%` e a linha das polaridades (`base de leads abaixo de 10 mostra o delta absoluto; a cor segue a medida: ...`). As linhas 147 a 154 continuam escrevendo `Origem`, `Leads`, `CPL qualificado` e `Investimento`. Abaixo disso não há nada.
- A frase acessível vira `Variação de leads por origem em ago/26 contra jul/26, 0 origens: 0 em alta, 0 em queda, 0 estável, 0 sem base no mês anterior e 0 sem dado no mês atual.` A tela afirma comparação, faixa e polaridade de uma tabela que não existe.

**O que mudar.** Antes do `return` principal, quando `data.rows.length === 0`, devolver o bloco de vazio no molde da `v3` (linhas 92 a 105): a mesma raiz de cartão com `role="status"`, ícone `Filter` de 16 px e uma frase de 12 px em `--text-muted` dizendo que o recorte não tem origem com lead e que por isso não há variação contra o mês anterior a mostrar. Sem cabeçalho e sem nomes de coluna. `aria-label` com pelo menos 100 caracteres.

### Para acertar na mesma passada (não bloqueantes, já no README)

- ACE-1: começar a frase acessível pelo tipo (`Tabela com a variação de leads por origem`).
- TIP-1: `tabular-nums` na linha do cabeçalho (linha 138).
- Alinhamento: a célula `indisponível` fica cerca de 2 px acima da linha de base da linha dela (medido: `indisponível` de 602 a 624 com descendente, `Lista fria` de 607 a 623, em px de imagem).
- Seção 5: levar `MEASURES`, `COLUMN_CLASS` e `VALUE_CLASS` para o topo do arquivo.

### Conferido e sem bloqueante

As 18 células contra o `data.ts`: +20%, −11%, 0,0% estável, +3 leads (base 6, abaixo de 10), base zero com `Minus` neutro e a frase da EST-4, e sem coleta com `Unplug` e `formatUnavailable()`; CPL em alta em `--negative` com seta para cima (+5,1% e +6,8%) e em queda em `--positive`; investimento sempre em `--text-secondary`. A leitura de bom e ruim não depende só da cor, porque a segunda linha do cabeçalho escreve a polaridade das três medidas. Largura: o trecho mais apertado, `sem base` na coluna de investimento, termina em 1683 px de imagem e o limite do conteúdo fica em 1686, com os 16 px de padding inteiros até a borda; não transborda nem encosta. Frase acessível de 219 caracteres.

```
Versão: 24_microvisuais-sparklines/03_pilula-de-variacao/v4_origens-com-base-zero-e-base-minuscula
Data: 2026-10-05
Resultado: reprovada
Não: 16
Correções:
  16. EST-1: ramo de vazio com role="status", ícone Filter e frase, no molde da v3, sem cabeçalho nem nomes de coluna.
Não se aplica: 3, 4, 6, 7, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

## v1 e v3: aprovadas

Sem "não" nas 32 perguntas. Na `v1`, conferido: 1.297.500 contra 1.204.800 dá +7,69% e sai `+7,7%` em `--positive`; contra 1.303.900 dá −0,49%, dentro da faixa de 1%, e sai `−0,5% estável` em `--text-secondary` com `Minus`; as duas bases vêm com valor e mês na mesma linha; frase acessível de 167 caracteres com os mesmos números do corpo. A pergunta 16 não se aplica à `v1`, que é um indicador só: `value` nulo escreve `formatUnavailable()` com `Unplug`.

Na `v3`, conferido: as 16 durações em dias úteis refeitas à mão contra as datas (02/10/2026 é sexta) batem com a tela, e a contagem por estado fecha em 3, 2, 1 e 10; a oportunidade com exatos 2 dias úteis fica no prazo e a de 3 fica fora, como a regra escrita no cabeçalho; sem data de handoff escreve `sem data` e `sem contagem`, nunca zero; o vazio tem `role="status"`. As observações das duas estão no README.

## O que as guardas não mediram, e foi conferido à mão

O texto das quatro versões mora em HTML, então COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA saíram com `texto_em_html` nas quatro, e FORMATO-ACESSIVEL não mediu a `v1` (`frase_sem_formatador`). Contraste: só `--text-primary`, `--text-secondary`, `--text-muted`, `--positive` e `--negative` sobre `--surface-raised`, todos aprovados na tabela 17.10 nos dois temas, sem opacidade e sem fundo tingido. Colisão e transbordo: nenhum nos oito PNGs. Formato da `v1`: `7,7%`, `−0,5%`, `R$ 1,2 mi` e `R$ 1,3 mi` saem iguais na frase e no corpo, pelas mesmas funções.
