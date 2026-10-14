# Revisão de 08_combinados-e-eixo-duplo/02_eixo-duplo-com-dominios-calculados, 2026-10-14

Revisor independente. Versões julgadas: `v2_cpl-e-leads-em-duas-linhas`, `v3_agendas-e-comparecimento-26-semanas`
e `v4_antipadrao-colunas-em-dois-eixos`, as três `sem_revisao`. A `v1` não estava no pedido.

`npm run check` do modelo: 0 com erro, 0 aviso, tipos em 1,6 s. PNGs de 2026-10-02, mais novos que os
`Chart.tsx` de 2026-09-29; os seis foram abertos.

| Versão | Resultado | Não |
|---|---|---|
| `v2_cpl-e-leads-em-duas-linhas` | reprovada | 8 (com reflexo na 12 e na 19) |
| `v3_agendas-e-comparecimento-26-semanas` | aprovada | nenhum |
| `v4_antipadrao-colunas-em-dois-eixos` | aprovada | nenhum |

As observações das três (18 itens) estão no README do modelo, seção `## Observações da revisão (não
bloqueantes)`, parágrafo de 2026-10-14.

## v2_cpl-e-leads-em-duas-linhas: reprovada

Um bloqueante, e ele mora no ramo, não na foto: os dois PNGs do dado padrão estão corretos, legíveis e
honestos. A renúncia ao segundo eixo está certa e declarada; o índice num eixo só é a leitura que a
pergunta pede.

### Bloqueante 1. Mês final sem lead: a frase acessível inventa o índice 100 e a linha do custo perde o nome

Pergunta 8 (ausência nunca vira valor), com reflexo na 12 (identificação das marcas) e na 19 (frase
acessível). Regras: EIX-10, EST-1b e seção 14.1 (ausência exibida como valor decide o que o desenho
afirma e bloqueia sempre), ROT-3, ACE-1; armadilhas DAD-2 e DAD-5.

**Evidência no código.**

* `Chart.tsx`, linha 125: `costPerLead` devolve `null` quando `row.leads <= 0`. O próprio componente
  prevê o caso, e `toIndex` propaga o `null` para `costIndex`.
* Linha 291, frase acessível: `formatInt(last.costIndex ?? INDEX_BASE)` e `formatInt(last.leadIndex ??
  INDEX_BASE)`. Com o último mês sem lead, a frase anuncia "O custo terminou em índice 100", isto é,
  "igual à base", para um mês em que o custo por lead não existe.
* Linha 357, linha de leitura visível: o mesmo caso já é tratado ali ("Sem índice calculável no último
  mês do recorte"). A guarda entrou no corpo e foi esquecida na frase, que é exatamente a DAD-5; o corpo
  diz que não há índice e o leitor de tela ouve 100.
* Linha 299, `renderEndLabel`: o rótulo só é desenhado em `index === rows.length - 1` e com valor não
  nulo. Com `costIndex` nulo no último mês, a linha do custo termina no mês anterior **sem nome
  nenhum**: sobram a cor (1,03:1 contra a do volume no tema claro, como a própria nota mede) e um
  círculo de 5,2 px contra um quadrado de 4,6 px. O README diz que a identificação acontece no fim de
  cada linha; nesse ramo ela não acontece para uma das duas.

**Por que não é hipótese remota.** O mês em que o lead mais falta é o último, o mês corrente ainda no
começo, com investimento já lançado e zero lead. O `data.ts` declara `leads: number` sem piso, o
`Chart.tsx` trata `leads <= 0` de propósito, e o README manda colar trocando só o seletor de dado.
Quem cola passa por esse ramo no primeiro dia de cada mês. É o mesmo padrão reprovado em
`24_microvisuais-sparklines/07_win-loss/v1` (2026-10-05): desenho certo, texto que escreve valor onde
o dado não existe.

**O que mudar.**

1. Na frase acessível, quando `last.costIndex` (ou `last.leadIndex`) for `null`, escrever a ausência
   pelo nome, com `formatUnavailable()` ou com o motivo ("sem lead em dez/26 para calcular o custo"),
   no mesmo texto do corpo. Nunca `?? INDEX_BASE` nem outro número de reposição.
2. Ancorar o rótulo de fim de linha no **último ponto não nulo** de cada série, e não em
   `rows.length - 1`. O índice do último ponto presente de cada chave se calcula uma vez, antes do
   JSX, e o `renderEndLabel` compara com ele.
3. Conferir com um render de bancada em que `2026-12` tem `leads: 0` (sem gravar o `data.ts`): a
   frase não pode conter "índice 100" para dezembro e as duas linhas precisam terminar com nome.

### Aproveite a rodada (não bloqueante, já anotado no README)

A versão volta de qualquer jeito, e três ramos do mesmo arquivo dizem coisa errada fora do dado padrão.
Não reprovam (o acervo trata ramo de texto que não envolve ausência como observação), mas custam
pouco na mesma passada:

* Linha 362: o verbo é fixo. Com os dois índices abaixo de 100 sai "O custo subiu mais que o volume";
  no empate sai "O volume subiu mais que o custo". Derivar o verbo do sinal de cada índice contra 100.
* Linhas 282 a 285 e 449 a 455: o aviso de achatamento só existe quando o custo varia mais que o
  volume, e o texto tem as duas séries fixas. Com o volume variando 1,5 vez mais que o custo, a série
  achatada é a do custo e nenhum aviso sai. Usar a razão da maior amplitude pela menor e nomear as
  séries pela ordem.
* Primeiro mês sem lead: `scale` vira `null`, as duas séries somem, e o plano ainda desenha grade com
  domínio automático, o título "índice" e a linha "base 100". O texto acima e abaixo diz que não há
  índice; o plano devia dar lugar ao bloco de indisponível da EST-2.

### Registro

```
Versão: 08_combinados-e-eixo-duplo/02_eixo-duplo-com-dominios-calculados/v2_cpl-e-leads-em-duas-linhas
Data: 2026-10-14
Resultado: reprovada
Não: 8 (com reflexo na 12 e na 19)
Correções:
  8. EIX-10, EST-1b, DAD-2, DAD-5: tirar o `?? INDEX_BASE` da frase acessível e escrever a ausência
     do último mês como o corpo já escreve; ancorar o rótulo de fim de linha no último ponto presente.
Não se aplica: 6, 27, 28, 29, 30, 32
```

## v3_agendas-e-comparecimento-26-semanas: aprovada

Sem bloqueante nos dois temas. Conferido: colunas do zero com domínio `[0, 40]` calculado de 38; taxa
de 0% a 100% pelo teto natural; cinco marcas em frações iguais, coincidentes na grade nos dois PNGs
(40 com 100%, 30 com 75%, e assim por diante); zero medido de 18/05 com coluna de 2 px e "0" escrito;
semana inválida de 17/08 vazada com contorno tracejado, legenda e palavra; os dois vãos da linha com
`connectNulls={false}`; revestimento de `--surface-raised` separando a linha da coluna no tema claro
(TOK-10); tique mensal ancorado na primeira semana, sem giro; dica com `formatRateWithVolume`. O eixo
duplo vem com sinal (tique na cor da série, zero alinhado, rodapé com os dois domínios e a frase de que
o encontro não significa nada), no mesmo regime em que a `v1` e o `04_pareto/v1` foram aprovados; a
exceção da EIX-8 segue pendente do dono do contrato, como o README já registra.

## v4_antipadrao-colunas-em-dois-eixos: aprovada

Sem bloqueante nos dois temas. Contas conferidas contra o `data.ts`: tetos R$ 60 mil e 600, empate em
R$ 100 por lead, teto seguinte 800 e empate em R$ 75; parecem eficientes Rede social, Vídeo curto e
Newsletter (custo por lead de R$ 87,66, R$ 87,65 e R$ 52,89) e só Newsletter abaixo de R$ 75, isto é,
de 3 para 1, como o rodapé escreve. Os dois painéis da correção são `BarChart` com a mesma margem e o
mesmo eixo de 64 px, e cada plataforma cai na mesma coluna de pixels nos dois PNGs (EIX-12). Segundo
canal cheio contra vazado na legenda e nas duas metades, contorno de 1,5 px acima de 3:1 nos dois temas.
