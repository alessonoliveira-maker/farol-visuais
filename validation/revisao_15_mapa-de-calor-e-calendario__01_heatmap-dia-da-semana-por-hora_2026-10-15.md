# Revisão de 15_mapa-de-calor-e-calendario/01_heatmap-dia-da-semana-por-hora, 2026-10-15

Revisor independente. Julgadas: v2, v3 e v4, as três com motivo `sem_revisao`. A v1 já estava
aprovada desde 2026-09-20 e não entrou nesta rodada.

`npm run check -- 15_mapa-de-calor-e-calendario/01_heatmap-dia-da-semana-por-hora`: 0 com erro,
1 aviso, e o aviso é da v1 (AGREGACAO-ZERO em `Chart.tsx:99`, já registrado no README). As três
versões julgadas saem `ok`, com COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA medidas.

Resultado: v3 aprovada; v2 e v4 reprovadas, cada uma por um bloqueante. As observações não
bloqueantes das três foram para o README do modelo, na seção "Observações da revisão".

---

## v2_pico-contra-janela-do-sdr: reprovada

```
Versão: 15_mapa-de-calor-e-calendario/01_heatmap-dia-da-semana-por-hora/v2_pico-contra-janela-do-sdr
Data: 2026-10-15
Resultado: reprovada
Não: 12
Correções:
  12. ROT-4 e 14.1 (domínio da escala de cor): a faixa de cada célula tem de ser a que a legenda
      declara; hoje a célula com valor igual ao teto sai pintada na faixa de cima.
Não se aplica: 6, 18, 27, 28, 31
```

### Bloqueante 1. A legenda declara um domínio de cor que a pintura não segue

- **Pergunta 12 (legenda) e seção 14.1, "domínio" como regra que decide o que o desenho afirma.**
- **Evidência no código.** A legenda escreve, em `Chart.tsx:396`, "o número na amostra é o teto da
  faixa", e as amostras trazem 1,8 / 3,6 / 5,4 / 7,2 / 9,0. Pela própria frase, a faixa 3 vai até
  5,4 inclusive. Mas `bucketOf` (`Chart.tsx:113`) faz `Math.floor((value / ceiling) * 5)`, que é
  intervalo aberto em cima: o valor igual ao teto cai na faixa seguinte.
- **Evidência medida.** Das 80 células pintadas, 4 saem uma faixa acima do que a legenda manda:
  terça 8h (1,8, pintada na faixa de teto 3,6), sexta 16h (3,6, na de teto 5,4), quarta 10h e
  quinta 15h (5,4, na de teto 7,2). Conferido com o dado do `data.ts` e a função do `Chart.tsx`.
- **Evidência no PNG.** Nos dois temas, quinta 15h "5,4" sai na cor da amostra "7,2", destacada
  das vizinhas 4,9 e 4,6; pela legenda ela teria a cor delas. Quarta 10h "5,4" sai igual a terça 10h
  "5,6", quando pela legenda sairia igual a segunda 10h "5,2". O desenho cria um ponto quente fora
  da janela que a própria legenda desmente.
- **Por que não é limiar discutível.** O limiar em si (cinco faixas iguais sobre o máximo) está
  certo. O defeito é a frase da legenda afirmar um lado da fronteira e a pintura usar o outro: a
  marca contradiz o texto que a explica.
- **O que mudar (uma das duas, não as duas).**
  1. Atribuir a faixa pelos mesmos tetos que a legenda imprime: calcular a lista de tetos uma vez,
     arredondada a uma casa como `formatDecimal` mostra, e dar à célula a primeira faixa cujo teto
     é maior ou igual ao valor. Não usar `Math.ceil` sobre a razão: 5,4 / 9 × 5 dá
     3,0000000000000004 em ponto flutuante e cai do lado errado de novo.
  2. Manter o `Math.floor` e trocar a legenda para o piso: amostras com 0,0 / 1,8 / 3,6 / 5,4 / 7,2
     e a frase "o número na amostra é o piso da faixa", com o 9,0 escrito à direita da última.
- **Depois de corrigir, conferir** no PNG que quinta 15h e quarta 10h saem na cor da amostra que
  contém 5,4, e rodar `npm run render -- 15_mapa-de-calor-e-calendario/01_heatmap-dia-da-semana-por-hora --tema ambos`.

### O que a v2 já faz certo e não deve mudar

- O contorno da janela no canal de 6 px fora das células (TOK-10), medido 9,50:1 e 6,00:1.
- Os três estados de célula com três canais; a faixa de almoço com o próprio texto; o
  `?? null` na leitura do mapa, que mantém a ausência como ausência.
- A linha de leitura "das entradas de uma semana média", que nomeia o agregado certo (284 é a
  soma dos 7 dias).

---

## v4_relogio-radial-de-24-horas: reprovada

```
Versão: 15_mapa-de-calor-e-calendario/01_heatmap-dia-da-semana-por-hora/v4_relogio-radial-de-24-horas
Data: 2026-10-15
Resultado: reprovada
Não: 14
Correções:
  14. NUM-5 e NUM-6: a linha de leitura chama de "um dia médio" o volume da semana média; nomear o
      agregado certo ou dividir o volume por 7.
Não se aplica: 6, 13, 18, 27, 28, 29, 31
```

### Bloqueante 1. A linha de leitura atribui ao dia médio o volume da semana

- **Pergunta 14, NUM-5 (agregado explícito) e NUM-6 (unidade); seção 14.1, "unidade" como regra
  que decide o que o desenho afirma.**
- **Evidência no PNG**, nos dois temas, linha de leitura no topo: "Pico das 10 h às 14 h, as 5
  horas seguidas de maior soma: 53,6% (174 de 325) das entradas de um dia médio."
- **Evidência no código.** `total` (`Chart.tsx:202`) soma o valor de todas as células medidas dos
  7 anéis, e cada célula é a média por ocorrência do dia. Somar os 7 dias dá a semana média, não o
  dia médio. A frase está em `Chart.tsx:257`.
- **Evidência medida.** Por dia, a soma das 24 horas é 58,6 (segunda), 61,7, 59,7, 64,4, 51,6,
  19,8 e 9,2 (domingo); o total é 325,0, e o dia médio tem 325,0 / 7 = 46,4 entradas. A linha diz
  que um dia médio tem 325, sete vezes o real. O percentual (53,6%) está certo; o volume entre
  parênteses e o agregado nomeado estão errados.
- **O que mudar (uma das duas).**
  1. Escrever "das entradas de uma semana média", como a v2 escreve para o mesmo cálculo.
  2. Manter "um dia médio" e dividir os dois volumes por 7 antes de formatar (24,9 de 46,4), com o
     percentual inalterado.
- A frase acessível (`Chart.tsx:240`) traz o mesmo "174 de 325" sem nomear o agregado; ao corrigir,
  dizer ali também "de uma semana média", para corpo e frase falarem o mesmo número (DAD-5).

### Não bloqueante, para aproveitar a mesma rodada

- **Legenda de faixas** (`Chart.tsx:378`): "0,0 a 0,3", "0,3 a 1,8" e "1,8 a 9,2". O 0,0 nunca é
  pintado na primeira faixa (os 18 zeros medidos vão ao poço) e 0,3 e 1,8 aparecem em duas faixas.
  Como não há número no setor, o leitor não chega a ver contradição, então fica como observação;
  imprimir o menor e o maior valor de fato de cada faixa (0,1 a 0,2; 0,3 a 1,7; 1,8 a 9,2,
  calculados do dado) resolve sem mudar a pintura.
- As demais observações da v4 estão no README do modelo.

### O que a v4 já faz certo e não deve mudar

- Setor por coordenada calculada, sem `transform`, 0h no topo e sentido horário, conferido no PNG.
- A nota da GEO-5 e a lista de picos com valor escrito; o desvio de escala contra a v1, declarado
  no `meta.json` e forçado pela TOK-8.
- Os três estados de setor (faixa, poço, tracejado), legíveis nos dois temas.

---

## v3_agendas-por-sdr-em-pequenos-multiplos: aprovada

Sem bloqueante. Domínio comum às oito grades (EIX-9), faixas de 5 a 9, 10 a 14 e 15 a 19 que
batem com `bandOf` nos inteiros, hachura abaixo de 5, zero medido e ausência em três canais, nome
inteiro e total em cada painel, ordem dos painéis declarada no rodapé (GEO-12), frase de 217
caracteres. Observações no README.
