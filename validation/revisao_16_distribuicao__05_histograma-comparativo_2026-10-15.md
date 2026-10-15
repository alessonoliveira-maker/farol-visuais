# Parecer de revisão: 16_distribuicao/05_histograma-comparativo

Data: 2026-10-15. Revisor independente, primeira passada, as três versões em `sem_revisao` (`v2`, `v3` e `v4`), julgadas pelo arquivo e pelos PNGs de hoje (render de 2026-10-02, posterior ao último `Chart.tsx`, de 2026-09-29). A `v1` já tinha veredito e ficou fora. `npm run check` com tipos: 0 com erro, 6 avisos (4 da `v1`, 1 `CONTRASTE-MARCA` na `v3`, tratado abaixo como bloqueante), 0 escapes.

Resultado: as três reprovadas, cada uma por um ponto só, e nenhum deles é de acabamento. A `v3` afirma com tinta que não alcança o piso: uma origem inteira é pintada no neutro que o contrato só libera quando cada marca escreve o próprio número, e nenhuma escreve. A `v2` e a `v4` desenham certo e falham na frase acessível: a `v2` afirma um fato que o código nunca confere, e a `v4` descreve a escala errada justamente no alternador que o catálogo pede para ela demonstrar. As observações não bloqueantes estão no README do modelo, seção `Observações da revisão (não bloqueantes)`.

| Versão | Resultado | Não |
|---|---|---|
| `v2_ganhos-contra-perdas-por-faixa-de-ticket` | reprovada | 19 |
| `v3_ciclo-empilhado-por-origem-em-foco` | reprovada | 11, 20 |
| `v4_grupos-de-tamanho-desigual` | reprovada | 14, 19 |

Não se aplica, nas três: perguntas 13 (sem meta, média nem teto), 26 (as quatro versões estão no disco), 27, 28, 29, 30 (nenhuma opacidade), 31 (nenhum halo de rótulo) e 32. Na `v2` e na `v4` também a 6, porque nenhuma é parte de um todo.

## O que foi medido e o que não foi

* **Refeito do `data.ts`, por script com a mesma regra de faixa do componente:** na `v2`, 93 perdidas (22, 19, 15, 12, 9, 7, 5, 4) e 84 ganhas (6, 9, 11, 11, 14, 13, 11, 9), virada na faixa de R$ 100 mil com 14 contra 9. Na `v3`, 278 negócios (120, 96 e 62), totais por faixa 12, 49, 57, 49, 36, 27, 18, 13, 9, 5, 2 e 1, indicação em 50,0% (6 de 12) na primeira faixa, legenda somando 100,0%. Na `v4`, 640 e 38 leads, indicação em 34,2% (13 de 38) na faixa de 3 a 6 dias contra 20,9% (134 de 640). Tudo confere com o desenho, com a linha de leitura e com o README.
* **Pixel lido nos PNGs (2 px de dispositivo por px de tela):** na `v3`, a coluna x = 1060 da faixa de 140 a 154 dias nos dois temas; na `v4`, as colunas x = 400 (faixa de 6 a 9 dias), x = 300 e a linha y = 428 no começo da silhueta.
* **Não renderizado:** o estado vazio das três, a recusa acima de quatro origens da `v3` e a `v4` com `scale="count"`. O que se diz deles é leitura do código, com a linha citada.
* **Guardas sem medição:** `OPACIDADE-MARCA` (`sem_opacidade_em_marca`) e `RAIO-CONTRA-AREA` (`sem_marca_de_area`) nas três. Conferido à mão: nenhuma marca declara opacidade.

## v2_ganhos-contra-perdas-por-faixa-de-ticket

```
Versão: 16_distribuicao/05_histograma-comparativo/v2_ganhos-contra-perdas-por-faixa-de-ticket
Data: 2026-10-15
Resultado: reprovada
Não: 19
Correções:
  19. ACE-1: a frase acessível afirma "e seguem à frente" sem conferir no dado; calcular a cláusula ou tirá-la.
Não se aplica: 6, 13, 26, 27, 28, 29, 30, 31, 32
```

**Bloqueante, pergunta 19, ACE-1 ("Calculada do dado").** `Chart.tsx`, linhas 328 a 334. A frase do dado padrão é "Até R$ 100 mil as perdidas são maioria; dali para cima as ganhas passam, 14 contra 9, e seguem à frente." O código calcula só a primeira faixa em que as ganhas passam (`crossoverIndex`, linha 137); nada confere as faixas acima dela, e "e seguem à frente" é texto fixo. Com o dado de hoje a afirmação é verdadeira (13 contra 7, 11 contra 5, 9 contra 4), mas num recorte em que a faixa aberta de R$ 175 mil tenha 9 ganhas e 12 perdidas, a pirâmide mostra o lado vermelho mais longo no topo e a frase continua dizendo a quem ouve que as ganhas seguem à frente. A primeira metade tem o mesmo defeito em escala menor: "as perdidas são maioria" até a virada é falso numa faixa empatada, que o `>` do `findIndex` deixa antes da virada. A linha de leitura da tela não tem o problema, porque só diz onde fica a virada; é a frase que diz mais do que o código sabe.

**O que mudar:** calcular as duas afirmações a partir das faixas (por exemplo, `bands.slice(crossAt + 1).every((b) => b.won > Math.abs(b.lost))` para "seguem à frente", com outra redação quando alguma faixa acima volta a perder, e "maioria" só quando nenhuma faixa anterior empata), ou tirar da frase o que não for calculado. O desenho não precisa mudar.

## v3_ciclo-empilhado-por-origem-em-foco

```
Versão: 16_distribuicao/05_histograma-comparativo/v3_ciclo-empilhado-por-origem-em-foco
Data: 2026-10-15
Resultado: reprovada
Não: 11, 20
Correções:
  11. 17.2 e COR-2: --line-strong pinta a camada de prospecção ativa sem que nenhuma marca escreva o próprio número; trocar por neutro que passe 3:1 sozinho.
  20. ACE-3 e TOK-1: essa camada e a amostra dela na legenda medem 1,79:1 no escuro e 1,83:1 no claro contra o cartão.
Não se aplica: 13, 26, 27, 28, 29, 30, 31, 32
```

**Bloqueante, perguntas 11 e 20, tabela 17.2, ACE-3 e TOK-1.** `TONE_FILL.supportSoft` é `var(--line-strong)` (linha 83), e é a cor da camada e da amostra de prospecção ativa, 96 dos 278 negócios. A tabela 17.2 dá a esse token um papel só, "Neutro de dado, com valor escrito", com o limite literal "só vale com o valor escrito na marca ou junto dela", e explica o que é isso: "quando **cada marca** carrega o próprio número". A camada tem 11 segmentos com 11 contagens diferentes (2, 10, 17, 19, 15, 12, 8, 6, 4, 2 e 1) e nenhuma está escrita. O `meta.json` invoca a isenção pela legenda, "Prospecção ativa, 96, 34,5%", mas isso é o total da série, não o valor de marca nenhuma: com ele não se lê quantos negócios de prospecção há na faixa de 28 a 42 dias. O neutro sem valor escrito da mesma tabela é `--text-muted`, que passa o piso sozinho (5,21:1 e 5,37:1); a COR-2 diz o mesmo pelo outro lado: "o neutro vive da isenção do valor escrito".

**A consequência está no preview.** A própria `CONTRASTE-MARCA` acusa: "--line-strong como preenchimento mede 1,79:1 no dark, 11 marcas e 1,83:1 no light, 11 marcas", mais a amostra da legenda como fundo sem texto. Ela só avisa porque não distingue marca de zero de marca com valor; a mensagem dela mesma diz "Se a marca carrega valor, ela precisa ser vista". Na faixa de 140 a 154 dias, a prospecção é o topo da pilha (1 negócio sobre 1 de mídia paga, indicação zero), e no PNG escuro, coluna x = 1060, o segmento sai em RGB (51, 69, 106) direto contra o cartão em (18, 28, 46), com uns 2 px de tela de tinta depois do separador: em tamanho real ele quase some, e a faixa se lê com 1 negócio quando tem 2. No claro, (180, 192, 214) contra o branco. O mesmo par toca o cartão na lateral de toda pilha mais alta que a vizinha da direita (de 112 a 126 dias acima da quinta unidade, por exemplo).

**O que mudar:** pintar a prospecção com um neutro que passe 3:1 contra o cartão nos dois temas. Como a mídia paga já ocupa `--text-muted`, as duas camadas neutras passam a precisar de uma distinção que não seja só de tom (a GEO-11 lembra que "a mais escura" não vale nos dois temas): por exemplo, hachura em uma delas, repetida na amostra da legenda, com o separador de 1 px em `--surface-raised` da COR-5 mantido entre as camadas. A outra saída que o contrato admite é escrever o número de cada segmento junto dele, o que as faixas de 1 a 2 negócios (3 a 6 px de altura) não comportam. Medir de novo os dois temas depois da troca.

**Não bloqueante, mas no mesmo lugar e por isso dito aqui:** a origem em foco se distingue só por cor e por posição na pilha; a COR-2 pede um segundo canal (peso 700 no item da legenda ou anotação na marca), e no tema claro `--chart-1` e `--text-muted` medem 1,12:1 entre si, então a troca de neutro acima pode deixar o topo e a base da pilha ainda mais parecidos. Está no README como observação.

## v4_grupos-de-tamanho-desigual

```
Versão: 16_distribuicao/05_histograma-comparativo/v4_grupos-de-tamanho-desigual
Data: 2026-10-15
Resultado: reprovada
Não: 14, 19
Correções:
  19. ACE-1: com scale="count" a frase acessível continua dizendo "em percentual do próprio canal"; derivar a abertura da frase da escala.
  14. NUM-6: com scale="count" o rodapé escreve "cada lead de indicação vale 1 do canal"; não escrever essa linha na contagem.
Não se aplica: 6, 13, 26, 27, 28, 29, 30, 31, 32
```

**Bloqueante, pergunta 19, ACE-1, e pergunta 14, NUM-6 (unidade).** O alternador de escala é um dos quatro itens que o catálogo pede para esta versão demonstrar ("Alternador absoluto ou percentual do grupo, com a escolha no rótulo do eixo"), e ele está pela metade. Na tela a troca funciona: `axisName` (linha 237) passa a "leads agendados", o tique e a dica passam a contagem. Mas a frase acessível começa com o literal "Histograma comparativo em percentual do próprio canal" (linha 280), sem olhar `scale`: com `scale="count"`, quem enxerga lê contagem no eixo e quem ouve é informado de percentual. É exatamente o defeito que o README deste modelo descreve no item 10 de "Como colar no Farol": "Trocar a escala sem trocar o texto do eixo é a maneira mais silenciosa de trocar a pergunta da peça"; a frase acessível é o texto do eixo para quem não vê. E o rodapé, na linha 443, chama `printValue(scale === 'count' ? 1 : oneLeadShare)`, que na contagem vira `formatInt(1)` e escreve "cada lead de indicação vale 1 do canal": número sem unidade numa frase que, nessa escala, não tem conteúdo. O preview só exercita `share`, por isso nada disso aparece no PNG; está no ramo que a versão anuncia.

**O que mudar:** montar a abertura da frase com a mesma decisão do `axisName` ("em percentual do próprio canal" ou "em contagem de leads"), e mostrar a linha "cada lead de indicação vale" só na escala percentual, que é onde ela informa alguma coisa. Conferir a escala de contagem uma vez, com um render temporário, antes de devolver; o dado padrão e o preview continuam em `share`.
