# Parecer de revisão: 22_unidades-waffle-e-pictograma/03_pictograma-isotype

Data: 2026-10-12. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render de 08:31 a 08:32, posterior ao `Chart.tsx` das quatro, o mais novo de 08:31:48). `npm run check` com tipos: 0 com erro, 0 aviso.

Resultado: `v1`, `v2` e `v4` aprovadas; `v3` reprovada por dois bloqueantes, que se corrigem juntos na lista ao lado da matriz. As 16 observações não bloqueantes estão no README do modelo.

## Peso dos bloqueantes

* **`v3`, resto do todo sem nome, sem número e abaixo do piso.** Perguntas 27 e 20; ROT-10, ACE-3 e tabela 17.2. A seção 14.1 põe contraste e identificação das marcas entre as regras que bloqueiam sempre. É número medido no PNG, não gosto, e o waffle irmão (`22/01`, `v1` e `v2`) passou hoje com o mesmo token justamente porque escreve o valor do resto na legenda.
* **`v3`, lista que achata os níveis aninhados.** Perguntas 27 e 12; ROT-10 na precisão de 2026-09-20. A amostra de cor ao lado de cada número afirma uma contagem que a matriz não tem. É o mais discutível dos dois, porque o aninhamento é o que o catálogo pede e os números estão certos; o que falta é a lista dizer o nível, e a régua pede isso com todas as letras.

## O que foi medido e o que não foi

* **Medido:** os oito PNGs de conferência; a cor de cada uma das 100 figuras da `v2` e da `v3`, amostrada pixel a pixel nos dois temas e conferida com `app/src/styles/tokens.css`; o contraste de cada cor contra o cartão; a contagem de ícones por fileira da `v1` (17, 13, 11, 6, 3 e 2) e da `v4` (34, 21 e 16), por varredura de colunas de tinta; a contagem de figuras refeita do `data.ts` (`v2` 31, 29, 20, 15 e 5 pelo maior resto; `v3` 58, 21 e 4 por arredondamento); a altura do corpo e a folga das quatro, pelas linhas de base do PNG; a frase acessível gravada em cada preview (168, 130, 174 e 179 caracteres).
* **Não medido pela ferramenta:** COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA nas quatro (`texto_em_html`); CONTRASTE-MARCA nas quatro (`sem_marca`, porque o ícone do lucide mora dentro do `foreignObject`). Contraste de texto, contraste de marca e colisão foram cobertos à mão. ESPESSURA-MARCA, EIXO-CALMO, OPACIDADE-MARCA e RAIO-CONTRA-AREA não se aplicam.
* **Não renderizado:** o vazio das quatro; na `v2`, o estado de foco da legenda; na `v4`, a unidade ampliada, o aviso dela, a origem com zero lead e o caso em que nenhuma origem tem coleta. O que se diz desses ramos é leitura do código.
* **Não testado:** as saídas sugeridas abaixo. As larguras citadas nelas são conta sobre o PNG, não render.

## `v3_cada-100-leads-de-midia-paga`: reprovada, dois bloqueantes

### Bloqueante 1. Perguntas 27 e 20; ROT-10, ACE-3 e tabela 17.2 (neutro de dado com valor escrito), armadilha TOK-5

**Evidência.** As 100 figuras da matriz, amostradas no PNG, têm quatro aparências, e a lista ao lado identifica três:

| Figuras | Forma | Escuro | Contra o cartão | Claro | Contra o cartão | Na lista |
|---|---|---|---|---|---|---|
| 4 | cheia, `--chart-1` | `#2dd5e9` | 9,59:1 | `#0b6d7d` | 6,00:1 | "4 chegam à agenda" |
| 17 | contorno, `--seq-7` | `#6fd6e8` | 10,12:1 | `#12556a` | 8,29:1 | "21 qualificam" |
| 37 | contorno, `--seq-5` | `#2495b3` | 4,89:1 | `#3d8ea9` | 3,72:1 | "58 têm telefone" |
| 42 | contorno, `--line-strong` | `#33456a` | **1,79:1** | `#b4c0d6` | **1,83:1** | nada |

As 42 figuras de quem não tem telefone (521 dos 1.240 leads) saem de `EMPTY_COLOR = 'var(--line-strong)'` (`Chart.tsx:20`, usado na linha 92). A lista das linhas 99 a 124 tem quatro linhas e nenhuma é delas: o grupo não tem nome, não tem número e não tem amostra em lugar nenhum do corpo. O todo está declarado no rodapé ("1 figura = 1 em cada 100"), e as partes escritas, tomadas sem repetição, somam 58.

**Por que bloqueia.** A tabela 17.2 só admite `--line-strong` como neutro de dado "com o valor escrito na marca ou junto dela", e dá o motivo: mede 1,79:1 e 1,83:1 contra o cartão, abaixo do piso de 3:1 da ACE-3. Aqui o valor não está escrito. A ROT-10 lista o pictograma entre as formas em que toda parte se nomeia no desenho parado, e dá a régua prática: se a soma do que está impresso não fecha no total declarado, falta parte nomeada. Faltam 42. O teste da ACE-6 confirma que essas figuras são dado e não pano de fundo: tapadas elas, some do desenho o "em cada 100", que é a pergunta do caso de uso, e sobra um bloco de 58 figuras sem denominador.

**O que mudar.**

1. Uma linha a mais na lista para o resto, com a amostra na forma da marca (figura de contorno em `--line-strong`), o número e a contagem: por exemplo "42 não têm telefone" e "521 leads".
2. Com o valor escrito junto da amostra, `--line-strong` passa a valer pela isenção da 17.2 e não precisa trocar. Não troque por `--text-muted`: no tema claro ele mede 5,37:1 contra os 3,72:1 de `--seq-5`, e o resto passaria a pesar mais que o primeiro nível.
3. Espaço: a lista ocupa hoje 140 px ao lado de uma matriz de 178 px. Uma linha de 20 px com 8 px de vão leva a 168 px e não mexe na altura do corpo.

### Bloqueante 2. Perguntas 27 e 12; ROT-10 na precisão de 2026-09-20 (lista que achata a hierarquia) e seção 14.1 (identificação das marcas)

**Evidência.** As três linhas de nível (`Chart.tsx:100` a `115`) têm a mesma estrutura, o mesmo recuo e o mesmo peso: amostra, número em 20 px e 600, rótulo, contagem. A linha da venda (116 a 123) entra na mesma coluna de número. Na tela, 58, 21, 4 e 0,6 saem em sequência como quatro irmãos.

| Amostra na lista | Número ao lado | Figuras com essa aparência na matriz |
|---|---|---|
| contorno `--seq-5` | 58 | 37 |
| contorno `--seq-7` | 21 | 17 |
| cheia `--chart-1` | 4 | 4 |

Só a última linha confere com o que se conta. A soma dos números que têm amostra é 83, e a matriz tem 58 figuras coloridas. Nada no corpo diz que um nível contém o seguinte: "têm telefone", "qualificam" e "chegam à agenda" são três rótulos paralelos. A `v2` deste mesmo modelo usa a mesma gramática (amostra, número, nome) para partes que não se sobrepõem, e nela o número é a contagem das figuras daquela cor (31, 29, 20, 15 e 5, medidos). Quem aprende a ler a `v2` lê a `v3` errado.

**Por que bloqueia.** A ROT-10 mediu este defeito em `12/06` e escreveu a regra: a lista que achata a hierarquia "vira uma mentira nova", os números "leem como irmãos que deveriam somar", e "cada linha diz o seu nível, por recuo, por `pai › filho` ou por coluna própria, e o valor do pai nunca aparece na mesma altura visual dos filhos". O aninhamento é o que o catálogo pede e os números estão certos; o que a régua cobra é a lista dizer que 21 estão dentro dos 58 e 4 dentro dos 21. Identificação das marcas bloqueia sempre pela 14.1.

**O que mudar.**

1. Cada linha passa a dizer o seu nível. Por recuo crescente da amostra e do rótulo, ou por palavra no rótulo ("desses, qualificam"; "desses, chegam à agenda"; "desses, chegam à venda").
2. Largura para a escolha: o rótulo tem cerca de 246 px e o mais longo ("chegam à venda, menos de uma figura") ocupa 210 px, com 36 px de sobra. Recuo de até 32 px no nível mais fundo cabe. O prefixo "desses, " soma cerca de 40 px e não cabe na última linha sem encurtar o texto dela.
3. A linha do resto, pedida no bloqueante 1, fica no nível de fora, irmã dos 58: é ela com os 58 que fecha os 100.
4. A frase acessível repete a lista chata ("58 têm telefone, 21 qualificam e 4 chegam à agenda"). Ao mudar o corpo, mude a frase junto, para os dois dizerem o mesmo (armadilha DAD-5).

### Para corrigir na mesma rodada, sem peso de bloqueio

* ROT-10: a linha da venda não tem marcador. A régua pede marcador vazado junto do motivo escrito para a parte que não cabe no encoding; o motivo ("menos de uma figura") já está.
* `Chart.tsx:116`: `border-t-0` não desenha nada. Tirar a classe.
* 17.1: os números da lista em 20 px ficam fora dos degraus da tabela (14 px para valor de legenda). Sem consequência visível; se a lista ganhar a quinta linha e apertar, 14 px resolve.

### O que está certo na `v3` e não deve mudar na correção

* A troca das opacidades do catálogo por degraus opacos, declarada no `notes`. `--seq-5` contra `--seq-7` mede 2,07:1 no escuro e 2,23:1 no claro, dentro dos 2:1 entre vizinhos que a TOK-8 aceita para rampa quando a posição também ordena.
* A figura cheia no nível final. `--seq-7` contra `--chart-1` mede 1,07:1 no escuro: sem o preenchimento os dois níveis seriam a mesma cor. É o segundo canal que a ACE-2 pede, e está lá.
* Os três níveis nascendo do mesmo canto, com o corte por `Math.min` que impede um nível de sair do anterior por arredondamento.
* A venda de 0,6 só em texto, a base de 1.240 leads no rodapé com o trimestre, e `figuresOf` devolvendo `null` sem base (EST-1b).

```
Versão: 22_unidades-waffle-e-pictograma/03_pictograma-isotype/v3_cada-100-leads-de-midia-paga
Data: 2026-10-12
Resultado: reprovada
Não: 12, 20, 27
Correções:
  27. ROT-10: nomear na lista as 42 figuras sem telefone, com amostra, número e contagem (42, 521 leads).
  20. ACE-3 e 17.2: `--line-strong` mede 1,79:1 e 1,83:1 e só vale com o valor escrito junto; a linha acima resolve.
  12. ROT-10, precisão de 2026-09-20: cada linha da lista diz o seu nível, por recuo ou por palavra.
Não se aplica: 13, 18, 26, 28, 29, 30, 31, 32
```

## Versões aprovadas

Nenhuma das três tem bloqueante. O que cada uma deixa para depois está no README do modelo, na seção de observações, e não entra na rodada de correção.

### `v1_vitorias-do-semestre-por-origem`

Conferido: 17, 13, 11, 6, 3 e 2 troféus contados nos dois PNGs, iguais aos números escritos, que somam os 52 do rodapé. Todas as fileiras nascem da mesma coluna (x de 185,5 px) e o ícone tem o mesmo tamanho em todas, então o comprimento lê a contagem. Ausência por último e em `--text-muted` (5,21:1 e 5,37:1); demais ícones em `--chart-1` (9,50:1 e 6,00:1). Dois elementos em 700, o nome e o número da origem que lidera. Vazio com `role="status"` e `totalWins` devolvendo `null`.

```
Versão: 22_unidades-waffle-e-pictograma/03_pictograma-isotype/v1_vitorias-do-semestre-por-origem
Data: 2026-10-12
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 13, 18, 26, 28, 29, 30, 31, 32
```

### `v2_clientes-novos-por-indicacao-em-cada-100`

Conferido: 31, 29, 20, 15 e 5 figuras amostradas nos dois PNGs, em blocos contíguos na ordem da legenda, iguais aos percentuais impressos, que somam 100 pelo maior resto sobre 412. Toda parte tem nome, contagem e percentual sem interação. Cores pelo `slot` do dado na ordem 1, 3, 6 e 5, de 5,39:1 a 9,50:1 contra o cartão nos dois temas; ausência por último em `--text-muted`. "Cerca de 3 em cada 10" sai do dado (31 figuras). O estado de foco não foi renderizado; a leitura do código e a ressalva sobre `--line-strong` estão nas observações.

```
Versão: 22_unidades-waffle-e-pictograma/03_pictograma-isotype/v2_clientes-novos-por-indicacao-em-cada-100
Data: 2026-10-12
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 13, 18, 26, 28, 29, 30, 31, 32
```

### `v4_leads-do-mes-em-icones-de-dez`

Conferido: 34, 21 e 16 ícones contados nos dois PNGs para 347, 212 e 168 leads, sem ícone fatiado; a origem de 8 leads com o texto "menos de um ícone" e o número 8; a origem sem coleta com `Unplug` e `formatUnavailable()` no lugar da fileira, sem número e fora do total de 735, que o rodapé qualifica como "com coleta". Vazio e indisponível separados em dois blocos de `role="status"`. O corpo fecha com cerca de 5 px de folga.

O ponto que mais pesa entre as observações é desta versão: o teto de 50 ícones não protege a fileira, que comporta 37. Ficou como observação e não como bloqueio porque o dado padrão não chega lá e nada aparece no render; é limiar a alinhar, descrito no README com a conta.

```
Versão: 22_unidades-waffle-e-pictograma/03_pictograma-isotype/v4_leads-do-mes-em-icones-de-dez
Data: 2026-10-12
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 13, 18, 26, 28, 29, 30, 31, 32
```
