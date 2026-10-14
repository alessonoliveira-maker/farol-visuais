# Meia-olho e desfechos hipotéticos

## O que é

A forma da incerteza de um cenário simulado, numa linha por cenário. Em cima fica a meia densidade dos desfechos que o simulador produziu, alta onde ele caiu mais vezes; na base ficam o ponto da mediana, o traço grosso com os 66% centrais dos desfechos e o traço fino com os 95%. Quando as linhas são muitas, a meia densidade deita numa faixa de 16 px e a força da cor faz o papel da altura. E quando a peça vai para uma apresentação ao vivo, os mesmos desfechos podem ser mostrados um por vez, com uma versão estática em pontos para o PDF e para quem pediu menos movimento.

O que separa este modelo do violino e do box plot é a origem do dado: aqui cada valor é uma rodada de simulador, e não um caso observado. Por isso toda versão escreve que aquilo é faixa de cenário ou desfecho simulado, e nunca previsão pontual.

## Quando usar

- Mostrar a faixa de um cenário simulado com forma, ponto e intervalos nomeados numa linha, de 2 a 4 cenários em meia densidade.
- Comparar cenários contra uma meta ou teto, com a taxa e o volume de desfechos de cada lado escritos.
- De 5 a 12 cenários no mesmo cartão, em gradiente: cada linha pede 28 px contra 58 a 62 da meia densidade.
- Explicar incerteza ao vivo, com desfechos animados e controle de pausa, em torno de 50 desfechos.
- Amostras de centenas a milhares de rodadas por cenário na forma; com menos de umas 30, a densidade suavizada desenha picos que são sorte.

## Quando evitar

- Casos observados, e não simulados: violino e raincloud (modelo 07) ou box plot com pontos (modelo 02).
- Público que precisa contar desfechos em vez de ler altura ou cor: quantile dotplot (modelo 09), que é também a versão estática da `v4`.
- Relatório impresso com desfechos animados: o papel congela um quadro e o transforma em previsão. A `v4` troca sozinha para os pontos; não force a animação.
- Faixa de previsão ao longo do tempo: fan chart na família 05, modelo 05.
- Massa parada num valor só, como um teto de capacidade, dentro da densidade: a suavização a espalha para os lados. A `v3` mostra a saída, que é tirá-la da forma e desenhá-la como barra.

## Anatomia

1. **Coluna de nomes à esquerda**, em `--text-secondary` de 12 px, com os números da linha abaixo em 11 px: mediana e intervalo de 66% por `formatCurrencyCompact` na `v1`, taxa com volume por `formatRateWithVolume` na `v2` e na `v3`.
2. **Meia densidade** em `--chart-1`, caminho do violino com um lado só: núcleo gaussiano, uma banda de Silverman para todos os cenários e altura na mesma escala. É cortada, com borda vertical, no menor e no maior desfecho simulados.
3. **Traço fino dos 95% e traço grosso dos 66%**, em `--text-primary`, 8 px abaixo da base da forma, fora do preenchimento. Os percentis saem de `INNER_MASS` e `OUTER_MASS`, e o texto de tela sai das mesmas constantes por `formatPercent`.
4. **Ponto da mediana** em `--text-primary`, com anel de 1,5 px em `--surface-raised` que o separa do traço grosso.
5. **Nome dos intervalos** só na primeira linha medida da `v1`; nas outras versões, no rodapé, com amostra na forma da marca.
6. **Eixo de valor** com tique por `formatCurrencyAxis` e grade vertical em `--line-subtle`, que é a direção da leitura. O passo aceita 1, 2, 2,5 e 5 vezes uma potência de dez.
7. **Linha de meta ou de teto**, tracejada em `--text-muted`, atravessando todas as linhas, com o nome numa margem reservada no topo. Só existe porque o domínio é o mesmo para todos os cenários.
8. **Parte além da meta**, só na `v2`: cheia em `--chart-1`, contra a parte aquém dela vazada com contorno em `--text-muted`, e um vão de 5 px na cor do cartão por onde a linha da meta passa.
9. **Faixa em gradiente**, só na `v3`: `linearGradient` com um `stop` por ponto da grade, `id` por `useId` com os caracteres limpos, e opacidade entre 0,66 e 1, que é o piso em que `--chart-1` composta com o cartão mede 3:1 nos dois temas.
10. **Barra da massa no teto**, só na `v3`: à direita da linha do teto, com a taxa e o volume escritos. Zero medido não ganha barra e ganha o zero escrito.
11. **Controles e contador**, só na `v4` animada: botões de pausar e de avançar com ícones `Pause`, `Play` e `SkipForward`, e o texto "desfecho 7 de 50".
12. **Pontos da versão estática**, só na `v4`: um por desfecho, empilhados em faixas, cheios quando atingem a meta e vazados quando não.
13. **Linha de leitura** no topo e **rodapé de método**, os dois calculados do dado. O rodapé carrega a nota de que aquilo é faixa de cenários, o que a cor ou a altura codifica e, na `v4`, que se trata da versão estática.

## Versões

- `v1_receita-2027-por-cenario`: três cenários de receita de 2027 com 400 desfechos cada, em meia densidade com ponto e intervalos. Demonstra o caminho de um lado só, os nomes dos intervalos só na primeira linha, a forma cortada no domínio simulado e a nota de que é faixa de cenários. O terceiro cenário tem nome longo, a faixa mais larga e cauda comprida à direita.
- `v2_chance-de-bater-a-meta`: os mesmos três cenários contra a meta fictícia de R$ 10 mi. Demonstra a meta como uma linha só para todas as linhas, a forma partida em cheio e vazado, o texto com taxa e volume por cenário e o domínio vindo por prop do componente pai. No cenário conservador passam 5 desfechos de 400, e a área cheia é um fio que só o texto sustenta.
- `v3_doze-cenarios-em-gradiente`: doze orçamentos mensais de mídia, de R$ 20 mil a R$ 130 mil, medidos em entradas por mês contra o teto fictício de 300. Demonstra o gradiente com um `stop` por ponto da grade, o `id` por `useId`, as linhas de 16 px com ponto e intervalos por cima e a massa no teto como barra própria. Nos dois maiores orçamentos a própria mediana é o teto.
- `v4_desfechos-animados-com-versao-estatica`: 50 desfechos de receita do trimestre contra a meta de R$ 2,5 mi. Animada, mostra um desfecho a cada 500 ms, em ordem sorteada com semente fixa, com eixo fixo, contador, pausa e avanço. Com movimento reduzido, na impressão ou com `staticOnly`, vira quantile dotplot com a nota de versão estática. **O preview é a versão estática**, porque o render emula movimento reduzido.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para `app/src/pages/<pagina>/visuals/<NomeDoComponente>/`.
2. O `data` é o desfecho cru de cada rodada, e não a mediana e os intervalos prontos. Não troque por um resumo: a forma, o ponto e os traços precisam sair da mesma amostra, e intervalo digitado ao lado de densidade calculada diverge no primeiro ajuste do simulador.
3. Na `v2` e na `v4`, calcule o `domain` na página, sobre todos os cenários que ela compara, e passe por prop. Domínio por cartão faz a mesma meta cair em lugares diferentes de um cartão para o outro.
4. Na `v3`, o `ceiling` é o valor em que o simulador registra o desfecho limitado. Desfecho igual ao teto conta como parado nele; se o seu simulador não aplica o teto, aplique antes de entregar o dado.
5. Na `v4`, passe `staticOnly` na rota de exportação se o PDF for gerado sem mídia de impressão. A peça já troca sozinha com `prefers-reduced-motion` e com `print`.
6. O desenho é um `<svg>` com `viewBox` de 574 px de largura, a do corpo de um cartão de 640. Em coluna mais estreita ele encolhe por inteiro, texto incluído: abaixo de uns 520 px de corpo, reduza a coluna de nomes (`LABEL_W`) em vez de deixar o texto cair abaixo de 11 px.
7. Embrulhe no `VisualCard`, com `title` e `useCase` do `meta.json`, e troque o estado vazio inline pelo `EmptyState`, mantendo o texto.
8. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Referências

- [ggdist, slab + interval stats and geoms](https://mjskay.github.io/ggdist/articles/slabinterval.html): a família meia-olho, intervalo em gradiente e pontos de quantil, todos com os mesmos intervalos.
- [Hypothetical Outcome Plots Help Untrained Observers Judge Trends in Ambiguous Data](https://pubmed.ncbi.nlm.nih.gov/30136961/): o experimento com público sem treino que sustenta os desfechos animados.
- No catálogo: `16_distribuicao/07_violino-e-raincloud`, de onde vem o caminho da densidade, e `16_distribuicao/09_dot-plot-empilhado`, de onde vem a versão estática da `v4`.
- Colisão registrada entre o catálogo e o contrato: a `v3` pede opacidade pela densidade, e a `ACE-5` põe piso de 3:1 na cor composta. A opacidade ficou entre 0,66 e 1; a conta está no `notes` do `meta.json` da versão.
- Vão de cobertura das guardas, medido no `check` desta leva: `OPACIDADE-MARCA` não mede a `v3` porque o alfa é calculado e não literal, e `CONTRASTE-MARCA` não resolve preenchimento em `url()`. O piso de 0,66 foi tirado da tabela de opacidade mínima do dossiê, e não de guarda.

## Observações da revisão (não bloqueantes)

**Revisão de 2026-10-05.** As quatro versões foram aprovadas, sem bloqueante. O que segue não reprova.

- v1: a cauda do cenário de expansão passa do último tique do eixo, R$ 17,5 mi, e fica sem linha de grade acima dela (EIX-4); a posição está certa, mas o extremo se lê por extrapolação.
- v2: o domínio que entra por prop vai até R$ 19 mi e o último tique é R$ 17,5 mi, o mesmo ponto da v1 (EIX-4).
- v2: o vão de 5 px em volta da meta tira da forma a massa que encosta nela, então a área cheia fica um pouco menor que a taxa escrita; quem sustenta o número é o texto, que conta o dado cru.
- v3: a barra da massa no teto tem piso de 2 px, e com 100% valendo 48 px as linhas de 0,5% (2 de 400) e de 4,8% (19 de 400) saem com 2 px e 2,3 px, iguais a olho; só o texto ao lado as distingue.
- v3: o piso do gradiente foi medido nos PNGs em 3,03:1 no tema claro e 4,83:1 no escuro (ACE-5). No claro não há folga, e nenhuma guarda mede esta marca: mudança em `--chart-1` ou em `OPACITY_FLOOR` pede nova medição à mão.
- v4: na versão animada, 7 dos 50 quadros, o primeiro inclusive, escrevem "R$ 2,5 mi, abaixo da meta" logo abaixo de "meta R$ 2,5 mi", porque desfechos de R$ 2,45 mi a R$ 2,49 mi arredondam para o valor da meta. O ponto vazado e a posição estão certos; vale escrever a distância até a meta ou usar duas casas neste rótulo.
- v4: o eixo tem três tiques, de R$ 2,0 mi a R$ 3,0 mi, e o menor e o maior desfecho ficam fora desse intervalo (EIX-4); os dois extremos só estão escritos na frase acessível.
- v4: o preview e os PNGs de conferência mostram só a versão estática. A animada foi conferida nesta revisão por um render à parte, sem movimento reduzido, nos dois temas e nos 50 quadros (rótulo do quadro entre 14,2 e 555,3 px de 574, sem corte nem colisão com o nome da meta), mas não tem retrato nem guarda no fluxo.
- v1 a v4: alguns valores de desenho estão escritos no JSX sem constante nomeada no topo (`axisY + 15` no tique, `strokeWidth={4}` no halo, `y={11}` no nome da meta), sem consequência visível.
