# Parecer de revisão: 24_microvisuais-sparklines/02_sparkbar

Data: 2026-10-05. Revisor independente, primeira passada. `npm run check`: 0 erros, 5 avisos (quatro de `ESPESSURA-MARCA`, esperados em minigráfico, e um de `CONTRASTE-MARCA` na `v4`, coberto pela isenção da tabela 17.2).

Como foi medido: nos PNGs de `_render/.qa/24_microvisuais-sparklines/02_sparkbar/`, que têm 2 px de imagem por px de CSS, e na geometria do `preview.svg`. Na `v3`, o PNG do SVG e o da página viva (`.pagina.png`) não diferem em nenhum pixel acima de 16 níveis por canal, e o defeito abaixo aparece igual nos dois, então é do componente e não do serializador. Contraste pela fórmula da WCAG sobre os tokens de `app/src/styles/tokens.css`.

| Versão | Resultado | Não |
|---|---|---|
| `v1_agendas-por-semana-com-semana-atual` | aprovada | nenhum |
| `v2_variacao-mensal-do-cpl-divergente` | aprovada | nenhum |
| `v3_filas-da-prevendas-em-escala-comum` | reprovada | 7 e 3 |
| `v4_barras-pareadas-com-origem-sem-mes-anterior` | aprovada | nenhum |

As observações não bloqueantes das quatro versões estão no README do modelo, seção `Observações da revisão (não bloqueantes)`. Este arquivo trata só do que reprova. Não se aplica, nas quatro: perguntas 6, 13, 18, 26, 27, 28, 29, 31 e 32. A pergunta 30 só se aplica à `v1`, e ali passa (3,04:1 no claro e 3,35:1 no escuro).

## v3_filas-da-prevendas-em-escala-comum

Resultado: reprovada. Um bloqueante, visível no dado padrão e igual nos dois temas. Domínio comum, ordem das filas, traço do zero medido, valor da última semana, frase acessível e estado vazio conferem com o dado.

### Bloqueante 1. Abaixo de 12 entradas a coluna sai da escala, e três filas ficam idênticas

Perguntas 7 e 3. Regras: EIX-9 (escala comum quando os gráficos existem para serem comparados) e seção 14.1, encoding. É também o caso de versão que não demonstra o que o catálogo diz: o caso de uso pede a leitura da altura absoluta entre linhas.

**Por que pesa.** A versão existe para mostrar que, em escala comum, a altura de uma célula se compara com a de outra. O piso de altura troca a escala por uma constante em um terço das colunas, e o desenho passa a afirmar volume igual onde o dado tem quase quatro vezes de diferença.

**Evidência.**

- `Chart.tsx`, linhas 21 a 23: célula de 28 px com margem de 2 px em cima e 1 px embaixo, então a escala de 0 a 96 ocupa 25 px, 0,26 px por entrada.
- `Chart.tsx`, linhas 28 e 58: `MIN_COLUMN_HEIGHT = 3` e `Math.max(height, MIN_COLUMN_HEIGHT)`. Três px valem 11,5 entradas, 12% do topo da escala. Todo valor de 1 a 11 é desenhado como se fosse 11,5.
- `preview.svg`: 50 das 144 colunas positivas têm `height="3"` exato.
- `preview.svg`: as filas `Programa de afiliados`, `Telefone receptivo` e `Cadastro manual da recepção` têm as 12 colunas positivas em 3,00 px cada. As três linhas são idênticas pixel a pixel, e as somas do trimestre são 86, 85 e 23.
- A coluna `Última` denuncia o desenho na própria tela: 11, 4 e 3 escritos ao lado de três barras finais da mesma altura.
- Alturas reais dessas filas: de 1,04 a 2,86 px em `Programa de afiliados`, de 1,04 a 2,60 px em `Telefone receptivo` e de 0,26 a 0,78 px em `Cadastro manual da recepção`.
- A forma dentro da fila também some: `Telefone receptivo` cai de 9 para 4 e `Programa de afiliados` sobe de 5 para 11, e as duas saem como uma régua reta.
- Em `Eventos e feiras`, as semanas de 6, 9, 4, 8 e 11 entradas saem em 3,00 px, a mesma altura da semana de 12 (3,12 px). Em `Webinars`, 9 das 12 colunas positivas estão no piso.
- Nos PNGs, o recorte da célula de sparkbar dessas três filas é idêntico pixel a pixel, com 6 px de imagem de tinta, no tema escuro e no claro, no PNG do SVG e no da página.
- O `meta.json` declara o piso de 3 px no `notes`, e o item 4 da `Anatomia` do README fala em 2 px. Nenhum dos dois aparece na tela, que só diz `mesma escala, máx. 96`.

**O que mudar.**

1. Baixar o piso de altura para 1 px, que é o menor traço que a tela desenha: `MIN_COLUMN_HEIGHT = 1`. Com isso `Programa de afiliados` volta a subir de 1 para 3 px, `Telefone receptivo` volta a cair de 2 para 1 px e `Cadastro manual da recepção` fica em 1 px, a menor da tabela, como o dado diz.
2. O zero medido não se confunde com a coluna de 1 px: ele segue em `--text-muted` e com 11 px de largura, contra 5 px em `--chart-1`. Conferir isso nos dois PNGs, porque é a única distinção que sobra entre os dois.
3. Tirar o `rx={1}` da coluna com menos de 2 px de altura, para o canto arredondado não comer a marca inteira.
4. Se 1 px ficar fraco demais no render, a saída é ganhar resolução e não subir o piso: célula mais alta, com o canvas declarado por número pela GEO-1. Piso acima de 1 px devolve o defeito.
5. Alinhar o texto que descreve o piso: o comentário da linha 27 do `Chart.tsx`, o `notes` do `meta.json` e o item 4 da `Anatomia` do README, que hoje dizem três coisas diferentes (3 px, 3 px e 2 px).
6. Render nos dois temas por último, e conferir que as três últimas filas saem diferentes entre si e que `Eventos e feiras` mostra as semanas de 4 e de 12 entradas com alturas diferentes.

**Na mesma passada, sem peso de bloqueio.** As observações da `v3` no README cabem na mesma edição: o substantivo em `Última` e em `máx. 96` (NUM-6), o `?? 0` que transforma fila curta em zero medido (EST-1b), a célula vazia no lugar de `formatUnavailable()` (EST-2) e o `tabular-nums` na data do rodapé (TIP-1).

### Registro

```
Versão: 24_microvisuais-sparklines/02_sparkbar/v3_filas-da-prevendas-em-escala-comum
Data: 2026-10-05
Resultado: reprovada
Não: 7 e 3
Correções:
  7. EIX-9 e seção 14.1: baixar o piso de altura da coluna de 3 px para 1 px, para a altura voltar a seguir a escala comum abaixo de 12 entradas.
  3. Mesma causa: três filas de somas 86, 85 e 23 saem idênticas e sugerem volume igual.
Não se aplica: 6, 13, 18, 26, 27, 28, 29, 30, 31 e 32
```

## Versões aprovadas

`v1`, `v2` e `v4` passaram nas 32 perguntas nos dois temas e não precisam de correção. As observações de cada uma estão no README do modelo. Três pontos ficam registrados aqui porque foram pesados e não reprovaram:

- `v1`: o ponto sobre a coluna da semana atual acrescenta 3,5 px de tinta acima do valor. O centro do ponto está no valor, o número vem escrito ao lado e o erro é de 7% da coluna, então é melhoria e não encoding desonesto. A opacidade de 0,72 do neutro foi medida à mão, porque a guarda `OPACIDADE-MARCA` não a viu.
- `v2`: a variação exatamente zero sai como `−0,0%` em vermelho com seta para cima. Mora no ramo, e o dado padrão não tem zero.
- `v2`: o render mediu diferença acima de 0,5% nos dois temas (0,56% e 0,58% na réplica à mão). A origem é o serializador, que desloca meio pixel o texto depois de `CPL`, e dois terços dos pixels estão no subtítulo da moldura. Dentro do cartão a diferença é de 0,19% e 0,21%.

## Defeitos de ferramenta notados

- `OPACIDADE-MARCA` devolve `sem_opacidade_em_marca` na `v1`, que tem `fillOpacity={index === lastIndex ? 1 : NEUTRAL_OPACITY}` no `Cell`. A guarda não enxerga opacidade passada por expressão.
- O serializador do preview desloca o texto que vem depois de `CPL` na `v2`, no subtítulo da moldura e no corpo, o bastante para passar do limite de 0,5%.
