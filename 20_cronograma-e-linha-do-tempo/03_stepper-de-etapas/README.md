# Stepper de etapas

## O que é

Uma sequência horizontal de passos com estado e sem escala de tempo: responde em que ponto de um processo linear uma coisa está agora. Cada passo é um marcador circular ligado ao seguinte por um conector, com o rótulo e a data abaixo. O estado se lê pela forma, nunca só pela cor: check no concluído, anel duplo e rótulo em peso maior no atual, contorno vazado no futuro, tracejado e a palavra "pulada" no pulado, cadeado no bloqueado. O conector preenchido vai até o passo atual. Feito em HTML com Tailwind, como lista ordenada com flex, sem Recharts.

## Quando usar

- Processo linear de 3 a 7 passos em que a pergunta é onde a entidade está agora (v1).
- Handoff entre pré-vendas e executivo, com o tempo gasto entre um passo e o seguinte e o SLA da passagem (v2).
- Coluna compacta de etapa dentro de uma tabela de até cerca de 15 oportunidades (v3).
- Exceção de percurso: etapa pulada, retorno ou passo bloqueado (v4).

## Quando evitar

- A duração em escala real importa: use o Gantt (20/01) ou a jornada por entidade (20/04).
- Processo não linear com ramificações: use um fluxo da família 11.
- Comparar muitas entidades pela distribuição de etapa: use o funil (família 10).
- Mais de 7 passos: agrupe em fases ou use a régua de marcos (20/02).

## Anatomia

1. **Lista ordenada.** `ol` com `li` por passo, `aria-current="step"` no atual; a raiz é `role="group"` com frase calculada do dado (`aria-label`).
2. **Marcador.** Círculo de 28 px com `Check` sobre `bg-chart-1` (concluído), anel duplo de `--chart-1` de 36 px com o número (atual), contorno de `text-muted` vazado (futuro), contorno tracejado com `SkipForward` (pulado), `Lock` no miolo do anel (bloqueado). Texto sobre `--chart-1` usa `--accent-cyan-contrast`.
3. **Conector.** `flex-1`, 2 px em `bg-chart-1` quando preenchido, 1 px em `bg-text-muted` quando pendente, tracejado quando chega a etapa pulada. Não usa `--line-strong`, que mede 1,79:1 contra o cartão.
4. **Rótulo e data.** Rótulo em `text-xs` (peso 700 só no atual), data por `formatDate`; o atual diz "desde" e a data.
5. **Duração e SLA** (v2). `formatDays` sobre o conector; acima do limite, `--warning`, `AlertTriangle` e "acima de" mais o limite.
6. **Retorno** (v4). Colchete de bordas por cima dos conectores com ponta de seta em SVG curto e a data da volta.
7. **Linha de leitura.** Uma frase de 12 px calculada do dado, `aria-hidden`.
8. **Estado vazio.** `role="status"` com `Filter` e uma frase de 12 px em `text-muted` (EST-1).

## Versões

- **`v1_etapas-do-handoff`**: o stepper básico de quatro passos do handoff, com check, anel no atual, data por `formatDate` e frase "passo 3 de 4".
- **`v2_tempo-entre-passos-com-sla`**: duração em dias sobre cada conector, passagem acima do SLA em `--warning` com ícone e texto, e dias em aberto do passo atual a partir da data de referência do dado. Canvas por número (960 x 300), declarado no `notes`.
- **`v3_stepper-compacto-em-tabela`**: marcadores de 8 px, cada um numa célula fixa de 14 px com a marca centrada (a mesma etapa cai na mesma coluna em todo estado), sem rótulo, sem marcador nenhum quando a etapa é desconhecida, etapa atual em texto, ordenação por etapa e dias parados, legenda única no cabeçalho e linha sem etapa escrita como indisponível.
- **`v4_etapa-pulada-retorno-e-bloqueio`**: percurso não linear com etapa pulada, seta de retorno com data, passo bloqueado com motivo e empilhamento vertical por container query abaixo de 480 px.

## Como colar no Farol

1. Copie o `Chart.tsx` da versão e troque o default de `data` pelo percurso da entidade; o estado de v1, v2 e v3 se deduz da última etapa alcançada, o de v4 vem declarado no dado.
2. Envolva num `VisualCard` e passe o título e a etapa por fora; o Chart não desenha cabeçalho de cartão.
3. Em v2, a data de referência vem do dado da página, nunca do relógio do componente.
4. Em v3, o estado vazio inline dá lugar ao `EmptyState` do Farol e a ausência ao `UnavailableState` (seção 16, passo 7).
5. Em v4, confira o empilhamento num cartão de menos de 480 px: o preview só mostra a disposição horizontal.

## Referências

- Flowbite, Timeline: o stepper horizontal com conector `h-px` entre marcadores.
- Figma Community, Progress Bar UI Kit: a variação em etapas que origina o stepper e a régua de marcos.
- Data Viz Catalogue, Timeline: a distinção entre sequência com escala e sem escala.
- Referência do Farol: `app/src/styles/tokens.css` para os tokens e `app/src/lib/format.ts` para `formatDate` e `formatDays`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-08, primeira passada das quatro versões. Medido nos PNGs de `_render/.qa/` (2 px de imagem por px de CSS) e nos tokens de `app/src/styles/tokens.css`. O que reprovou a `v3` está em `validation/revisao_20_cronograma-e-linha-do-tempo__03_stepper-de-etapas_2026-10-08.md`, não aqui.

- `v1`, `v2`: o marcador de 28 px fica encostado à esquerda da caixa de 36 px, então o vão até o conector mede 16 px depois do marcador e 8 px antes do seguinte. Não atrapalha a leitura; centralizar o marcador na caixa, como a `v4` já faz, iguala os dois lados.
- `v1`, `v2`, `v4`: a linha de leitura está no rodapé do corpo e a ANO-5 pede o topo. Sem consequência no preview.
- `v1`, `v2`, `v4`: a frase acessível não flexiona pelo número. Com outro dado sai "1 etapas concluídas" na `v1` e "2 pulada" na `v4`; na `v2` o dado padrão já escreve "1 de 3 passagens passaram".
- `v2`: três trechos com número fora de `kpi-number` e de `tabular-nums` (TIP-1): "SLA de 2 dias por passagem" no cabeçalho, "acima de 2 dias" sobre o conector e a linha de leitura. É frase corrida, sem coluna a alinhar, por isso não reprova.
- `v2`: a frase acessível conta as passagens acima do limite e não diz qual delas estourou, que é a pergunta do caso de uso. Quem navega pela lista ordenada encontra o trecho; nomear a passagem na frase fecha a ACE-1 por inteiro.
- `v2`: o conector em `--warning` e o conector em `--chart-1` medem 1,14:1 entre si no escuro e 1,05:1 no claro (armadilha TOK-9). A distinção se sustenta no ícone e no texto do limite, que estão lá; nenhum dos dois pode sair.
- `v3`: o nome mais longo da coluna Conta mede 141,5 px numa célula de 144 px, 2,5 px de folga. Nome maior quebra em duas linhas e engorda a linha da tabela, porque a coluna não declara regra de quebra.
- `v4`: no `preview.svg` e no PNG de conferência a ponta da seta de retorno sai 4,75 px à direita do eixo da perna e 2 px acima do pé dela. Na página viva (`.pagina.png`) ela está centrada e encosta no anel de destino, então o `Chart.tsx` está certo. A causa é da ferramenta: o serializador remonta o `<svg>` aninhado sem `position`, `left` e `bottom`, a mesma classe da armadilha GEO-17. A divergência medida é de 0,022%, abaixo do limiar de 0,5%, e por isso o render não acusa. Saída enquanto a ferramenta não muda: posicionar um `<span>` absoluto e pôr o `<svg>` dentro dele.
- `v4`: o empilhamento vertical abaixo de 480 px foi conferido só pela leitura das classes, porque o preview mostra apenas a disposição horizontal. Na vertical a seta some e a volta fica escrita na linha de leitura.
- `v4`: a data da linha de leitura está fora de `kpi-number` (TIP-1), e a frase repete o que o caso de uso do catálogo já diz, com a data a mais.
- As quatro: o `meta.json` declara moldura `stage`, que o contrato reserva ao visual que já é o próprio cartão, e este README manda envolver num `VisualCard`. O contraste foi medido contra `--surface-canvas`, que é o fundo do palco, e contra `--surface-raised`: o pior par é `--text-muted` no tema claro, 5,05:1 no palco e 5,37:1 no cartão, os dois acima do piso de 4,5:1.

Revisão de 2026-10-08, segunda passada, só da `v3` (`revisao_desatualizada`, julgada pelo arquivo de hoje). Aprovada, sem bloqueante. Medido nos dois PNGs: o centro do marcador de cada etapa cai em 493,5, 525,5, 557,5, 589,5 e 621,5 px de imagem nas 13 linhas com etapa, com desvio zero entre os três estados; a linha de `OP-0431` não tem tinta nenhuma na coluna dos marcadores; o pior par de contraste é `--text-muted` no claro, 5,05:1 contra o palco, e o contorno do marcador futuro chega a essa mesma cor nos dois temas.

- `v3`: a linha de leitura diz "da etapa mais adiantada à mais inicial" e não avisa que a oportunidade sem etapa vai ao fim; isso só está na frase acessível ("1 sem etapa registrada"). Não engana, porque a própria linha da tabela escreve a ausência duas vezes e não desenha marcador; acrescentar o trecho, calculado do dado e só quando houver linha sem etapa, fecha a frase.
- `v3`: a linha de leitura não tem `aria-hidden` (ANO-5), então o leitor de tela ouve a contagem duas vezes, na frase da raiz e no parágrafo.
- `v3`: a segunda chave da ordenação, dias parados do maior para o menor, só é declarada na frase acessível; na tela ela se deduz da coluna (armadilha GEO-12).
- `v3`: o marcador do estado atual mede 14 px e o catálogo fala em marcadores de 8 px. Os outros dois estados medem 8 px, a linha da tabela continua com 24 px e o `notes` declara o desvio: o anel maior é a pista de forma que a ACE-2 pede.
- `v3`: a célula de "Dias parados" usa `kpi-number` sem classe de peso e herda 400, que a TIP-4 não lista para Space Grotesk (500, 600 e 700). O navegador desenha com a face 500, sem consequência no preview; `font-medium` na célula alinha a constante. Pela mesma herança, a palavra de ausência sai em Manrope 600 na coluna "Etapa atual" e em Space Grotesk na de dias.
- `v3`: o código `OP-0429` mede 49,5 px numa célula de 52 px, 2,5 px de folga, e o nome mais longo da coluna Conta mede 142,0 px em 144 px. A observação da primeira passada sobre a quebra em duas linhas continua valendo e agora vale também para a coluna Código.
- `v3`: o `th` da coluna dos marcadores só contém a legenda, e as amostras são `aria-hidden`, então a coluna é anunciada como "feita atual futura", sem um nome próprio como "Percurso".
- `v3`: a contagem não flexiona pelo número: com uma linha só sai "1 oportunidades abertas", na tela e na frase acessível.
