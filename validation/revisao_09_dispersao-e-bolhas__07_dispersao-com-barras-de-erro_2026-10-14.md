# Revisão de 09_dispersao-e-bolhas/07_dispersao-com-barras-de-erro, 2026-10-14

Versões julgadas: `v2_sdrs-diferentes-do-time`, `v3_canais-com-erro-nos-dois-eixos` e `v4_amostra-minima`, todas `sem_revisao`. A `v1` está aprovada desde 2026-09-19 e não foi julgada de novo.

`npm run check -- 09_dispersao-e-bolhas/07_dispersao-com-barras-de-erro`: 0 com erro, 0 avisos, as quatro versões `ok`. PNGs de 2026-10-02, mais novos que os `Chart.tsx` de 2026-09-28, olhados nos dois temas e ampliados nos pontos apertados.

Resultado: as três reprovadas, todas pelo mesmo tipo de defeito, um ramo do código em que o cartão escreve algo falso. Nos dois PNGs do dado padrão as três estão corretas, legíveis e honestas no encoding; nada do que segue aparece no render, e por isso cada bloqueante cita a linha e descreve o recorte que o dispara. A seção 14.1 bloqueia sempre a regra que decide o que o desenho afirma, a EST-1b fixou que o defeito que mora no ramo conta, e a revisão de hoje de `09_dispersao-e-bolhas/02_dispersao-com-linha-de-referencia` aplicou a mesma régua. As observações não bloqueantes foram para o README do modelo.

## Resumo para o corretor

* **`v2`, SDR sem lead trabalhado some sem contagem.** Pergunta 8; EST-4 e DAD-2; seção 14.1, ausência.
* **`v3`, o veredito da linha de leitura é texto fixo.** Pergunta 17; ANO-5; seção 14.1, o que o desenho afirma.
* **`v4`, dois.** Canal sem lead some sem contagem, e a contagem do piso fica falsa (pergunta 8; EST-4 e DAD-2). A oração do custo do piso sai mesmo quando não há custo (perguntas 17 e 19; ANO-5 e ACE-1).

As correções são de lógica e de texto. Nenhuma mexe em cor, eixo, canvas ou `data.ts`, e com o dado padrão os quatro ramos novos não disparam, então os PNGs devem sair iguais; o `check` vai pedir render novo só porque o sha do `Chart.tsx` muda.

---

## v2_sdrs-diferentes-do-time

```
Versão: 09_dispersao-e-bolhas/07_dispersao-com-barras-de-erro/v2_sdrs-diferentes-do-time
Data: 2026-10-14
Resultado: reprovada
Não: 8
Correções:
  8. EST-4 e DAD-2: contar os SDRs com zero lead trabalhado que o `continue` tira do plano e escrever a contagem no rodapé e na frase acessível.
Não se aplica: 6, 26, 27, 28, 29, 30
```

### Bloqueante 1. Pergunta 8; EST-4 e DAD-2; seção 14.1 (ausência)

**Evidência no código.** `Chart.tsx:328-329`: `wilson()` devolve `null` quando `leadsTrabalhados` é zero, e a linha seguinte faz `if (intervalo === null) continue;`. O SDR sai de `points` e não entra em contador nenhum. Daí em diante tudo conta só os plotados: `quantos` (`:357`), a linha de leitura (`:394`, "4 de 8 SDRs se distinguem do time"), a frase acessível (`:360-363`, "taxa de agenda de 8 SDRs") e o rodapé (`:472`).

**O recorte que dispara.** O dado padrão mais um nono SDR com `leadsTrabalhados: 0`. O desenho mostra os mesmos 8 pontos, a linha diz "4 de 8 SDRs", a frase diz "8 SDRs", e nada no cartão diz que o recorte tem 9 e que um deles não tem base para comparar. O ramo não é hipotético: o próprio componente o reconhece no estado vazio (`:317`, "Nenhum SDR neste recorte com lead trabalhado no período"), que trata o caso em que todos estão nele; o caso em que só um está cai no `continue`. SDR de férias ou contratado no fim do mês é o caso comum.

**Por que bloqueia.** A saída da DAD-2 é literal: "Ausência sai da amostra e é contada no rodapé, sempre." A EST-4 pede que comparação sem base se declare, e o SDR sem lead é exatamente uma comparação contra o time sem base. Aqui ele some, e o cartão descreve um time menor que o do recorte. É a regra que decide o que o desenho afirma (14.1), no ramo. A `v3` deste mesmo modelo já faz o certo, com `semSerie` e o rodapé "N canais sem custo semanal apurado ficam fora do plano"; a `v2` precisa do mesmo padrão.

**O que mudar.**

1. Contar as linhas com `leadsTrabalhados <= 0` numa variável própria (`semBase`), no mesmo laço.
2. Com `semBase > 0`, escrever no rodapé, por exemplo, `1 SDR sem lead trabalhado no período fica fora do plano`, depois da frase atual.
3. Levar a mesma contagem à frase acessível. Hoje ela tem 228 caracteres, então a oração nova pede encurtar outra parte para caber nos 250 da ACE-1.
4. Opcional: só quando `semBase > 0`, a linha de leitura troca "de 8 SDRs" por "de 8 SDRs com lead trabalhado".

Com o dado padrão `semBase` é zero e o PNG não muda.

**Na mesma rodada, sem bloquear:** o comentário de `DOMAIN_Y` (`:63`) diz que o maior limite superior é 43,3%, e o dado dá 44,1% (Larissa M., 25 de 76); e com um só SDR num papel a frase escreve "1 estão acima" e o rodapé "os 1 em neutro".

---

## v3_canais-com-erro-nos-dois-eixos

```
Versão: 09_dispersao-e-bolhas/07_dispersao-com-barras-de-erro/v3_canais-com-erro-nos-dois-eixos
Data: 2026-10-14
Resultado: reprovada
Não: 17
Correções:
  17. ANO-5: calcular do dado o veredito da linha de leitura, separando o caso em que o mais barato é também o de melhor taxa e o caso em que os dois intervalos de Wilson se sobrepõem; hoje "mais barato não é mais qualificado" é texto fixo.
Não se aplica: 6, 26, 27, 28, 29, 30
```

### Bloqueante 1. Pergunta 17; ANO-5; seção 14.1 (o que o desenho afirma)

**Evidência no código.** `Chart.tsx:330-334`: nomes, CPL e taxas são calculados, mas a conclusão `mais barato não é mais qualificado:` é literal. `maisBarato` e `melhorTaxa` (`:280-286`) são escolhidos cada um por conta própria, e nada compara os dois, nem os intervalos deles.

**Os recortes que disparam.**

1. **O mais barato é também o de melhor taxa.** O dado padrão com E-mail em 130 qualificados de 240 (54,2%). A linha passa a escrever "mais barato não é mais qualificado: E-mail a R$ 27 com 54,2% (130 de 240), contra E-mail a R$ 27 com 54,2% (130 de 240)". A frase contradiz a si mesma e afirma o contrário do dado. Canal barato que também qualifica bem não é raridade, e E-mail é o caso típico.
2. **Os dois intervalos se sobrepõem.** O dado padrão com Parcerias em 42 de 96 (43,8%). A melhor taxa passa a ser Eventos, e a linha escreve "mais barato não é mais qualificado: E-mail a R$ 27 com 32,9% (79 de 240), contra Eventos a R$ 239 com 45,3% (29 de 64)". O intervalo de 95% do E-mail vai de 27,3% a 39,1% e o de Eventos de 33,7% a 57,4%: as barras do mesmo cartão dizem que a diferença não está estabelecida, e a linha a afirma.

**No dado padrão** o E-mail vai de 27,3% a 39,1% e Parcerias de 39,2% a 58,8%. Os dois se separam por 0,1 p.p., então a frase é verdadeira por essa margem e o preview está certo.

**Por que bloqueia.** A ANO-5 pede linha de leitura calculada do dado, com a conclusão, e aqui a conclusão é a única parte que não é calculada. Frase fixa que o dado desmente é o que as revisões de `20_cronograma-e-linha-do-tempo/07` e `24_microvisuais-sparklines/07` reprovaram; aqui o dado padrão não desmente, mas basta mudar um canal. E esta é a versão de referência para "quando a incerteza entra na conta": veredito por estimativa pontual é a leitura que o próprio modelo existe para evitar ("evita tratar diferença pequena como diferença real").

**O que mudar.**

1. Calcular o veredito antes do texto, com os limites que `Point` já guarda:
   * `maisBarato.id === melhorTaxa.id`: algo como "o mais barato é também o de melhor taxa: E-mail a R$ 27 com 54,2% (130 de 240)";
   * `maisBarato.upper < melhorTaxa.lower`: mantém "mais barato não é mais qualificado: …" como hoje;
   * nos outros casos: algo como "a taxa do mais barato e a da melhor não se distinguem no intervalo de 95%: …", com os dois pares, e o nível escrito por `nivelEscrito`.
2. Opcional: levar o mesmo veredito à frase acessível (DAD-5). Hoje "melhor taxa é Parcerias" é verdadeiro em todo ramo, então não é obrigatório.

Com o dado padrão cai no segundo caso (39,1% contra 39,2%) e o PNG não muda.

**Na mesma rodada, sem bloquear:** o rodapé do ramo `semSerie` (`:406`) diz "sem custo semanal apurado" também para o canal com uma semana só ou sem lead, e a frase acessível não leva essa contagem; e `semanas` (`:288`) vem do canal mais barato, então com número de semanas diferente entre canais o rodapé erra para os outros.

---

## v4_amostra-minima

```
Versão: 09_dispersao-e-bolhas/07_dispersao-com-barras-de-erro/v4_amostra-minima
Data: 2026-10-14
Resultado: reprovada
Não: 8, 17, 19
Correções:
  8. EST-4 e DAD-2: contar os canais com zero lead que o `continue` tira do plano, escrever a contagem no rodapé e na frase, e somá-los a quem está abaixo do piso.
  17 e 19. ANO-5 e ACE-1: escrever "o eixo para em X e não em Y" só quando Y passa de X; sem custo, dizer que o intervalo dos escassos não mudaria o eixo, ou omitir a oração.
Não se aplica: 6, 26, 27, 28, 29, 30
```

### Bloqueante 1. Pergunta 8; EST-4 e DAD-2; seção 14.1 (ausência)

**Evidência no código.** `Chart.tsx:270-271`: `wilson()` devolve `null` quando `leads` é zero, e o laço faz `continue`. `quantos` (`:321`) e `quantosEscassos` (`:322`) contam só `points`.

**O recorte que dispara.** O dado padrão mais um nono canal com `leads: 0`. A linha de leitura continua "2 de 8 canais ficam abaixo do piso de 20 leads", e a frase acessível "Dispersão de 8 canais … 2 canais abaixo do piso de 20 leads". O recorte tem 9 canais e 3 abaixo do piso, porque zero é menos que 20. O componente conhece o caso: o estado vazio (`:306`) é "Nenhum canal neste recorte com lead trabalhado no período".

**Por que bloqueia.** Esta versão existe para mostrar o canal de amostra pequena sem escondê-lo, e o comentário do topo diz isso com todas as letras: "O que não acontece é o ponto sumir: canal com pouco lead é resultado, e esconder o resultado é pior que mostrar o resultado com ressalva." O canal com zero lead é o caso limite da pergunta do catálogo, é o único que some, e a contagem do piso, que é a conclusão da versão, fica falsa. A DAD-2 manda contar a ausência no rodapé, sempre, e a 14.1 bloqueia a ausência no ramo.

**O que mudar.**

1. Contar as linhas com `leads <= 0` em `semLead`, no mesmo laço.
2. Com `semLead > 0`, escrever no rodapé, por exemplo, `1 canal sem lead no período fica fora do plano`.
3. Fazer a contagem do piso fechar com o recorte, na linha e na frase: ou `escassos.length + semLead` de `points.length + semLead`, ou "2 de 8 canais abaixo do piso, mais 1 sem lead". A forma é do produtor, desde que a soma feche.
4. Conferir a frase acessível contra os 250 caracteres da ACE-1 (hoje são 216).

### Bloqueante 2. Perguntas 17 e 19; ANO-5 e ACE-1; seção 14.1 (o que o desenho afirma)

**Evidência no código.** `tetoSeContasse` (`:316`) é calculado, mas a linha de leitura (`:353-354`) e a frase acessível (`:327-330`) escrevem "o eixo para em ${tetoEscrito} e não em ${tetoIgnoradoEscrito}" sem condição.

**O recorte que dispara.** Sem escasso nenhum, `tetoSeContasse` é sempre igual a `domainYMax`, porque o maior limite superior passa a ser o dos medidos. Com o dado padrão sem Webinar e Lista fria, a linha escreve "0 de 6 canais ficam abaixo do piso de 20 leads; sem o intervalo deles o eixo para em 45% e não em 45%", e a frase "… e o eixo para em 45% em vez de 45%". O mesmo acontece com escasso presente sempre que o intervalo dele não passa do degrau dos medidos: um canal de 15 leads e 1 agenda no lugar dos dois escassos vai de 1,2% a 29,8% e produz o mesmo "45% e não em 45%". Recorte sem canal abaixo do piso é o mais comum que esta peça vai encontrar no Farol.

**Por que bloqueia.** A oração afirma um custo, o de o eixo ir mais alto, que nesse ramo não existe, e diz isso com o mesmo número dos dois lados. É a conclusão da linha de leitura, então vale a ANO-5, e a frase acessível repete o erro, então vale a ACE-1 ("diz a conclusão"). Frase calculada que ainda assim afirma o que o dado não tem está do lado da 14.1 que bloqueia.

**O que mudar.**

1. Comparar `tetoSeContasse > domainYMax` antes de montar os dois textos.
2. Havendo custo, manter a oração como hoje. Não havendo, trocar por algo como "o intervalo deles não mudaria o eixo", ou omitir a oração. Sem escasso nenhum, a linha diz que todos os canais passam do piso de 20 leads.
3. A frase acessível segue a mesma condição, com o mesmo texto calculado uma vez (DAD-5).

Com o dado padrão há custo (45% contra 90%), e o PNG não muda.

**Na mesma rodada, sem bloquear:** a nota do `meta.json` diz que sem o intervalo dos escassos o eixo "para em 60%" e fala em "oito canais que têm medida", quando o render diz 45% e os medidos são seis, e o comentário do topo do `Chart.tsx` (`:37`) repete "oito canais" (DAD-10); o rodapé (`:413-414`) diz que o ponto "sai da conta do domínio", quando quem sai é o intervalo; e com um só escasso a frase escreve "1 canais".

---

## Conferido nas três, e que a correção não deve mexer

* **Wilson certo e passado como distância (REC-20).** Recalculado à mão e conferido no PNG: na `v2`, Larissa M. vai de 23,4% a 44,1%, com a serifa de cima a 5 px da linha de 45%; na `v3`, Parcerias vai de 39,2% a 58,8% e Eventos de 33,7% a 57,4%; na `v4`, a Lista fria (1 de 3) vai de 6,1% a 79,2%, só na dica.
* **O caso que prova a regra da `v2`.** Diego F. (18 de 130) tem teto de 20,8%, abaixo dos 22,4% do time, e sai em `--negative`; Bruno A. (8 de 58), com a mesma taxa de 13,8%, tem teto de 24,9%, cruza a linha e sai neutro. Larissa M. passa por 1 p.p. (piso de 23,4%) e Rodrigo V. por 0,6 p.p. (teto de 21,8%).
* **Desvio amostral da `v3`, com n menos 1.** Eventos fica em R$ 239 com desvio de R$ 27,0, e o traço termina em R$ 266, dentro dos R$ 280 do eixo.
* **Domínio da `v4`.** 45% com os escassos fora da conta e 90% com eles dentro, os dois derivados do dado.
* **Acabamento.** Grade nos dois sentidos (EIX-3b), eixo calmo sobrescrevendo o `AXIS_PROPS` (EIX-5), de 4 a 5 linhas por eixo (EIX-4), `ZAxis` com as duas pontas iguais (REC-15), `ReferenceLine` com `extendDomain` e nome na margem reservada na `v2` (ANO-3), traço em `--text-muted`, `--positive` e `--negative`, todos acima de 3:1 nos dois temas (ACE-6), e nenhuma opacidade em marca (ACE-5).
* **Folgas medidas no PNG ampliado, nos dois temas.** Na `v2`, o ")" de "32,9% (25 de 76)" fica a 3 px da serifa do ponto neutro de 104 leads. Na `v3`, a tinta de Busca paga fica a 3,5 px da serifa vizinha, a de Parcerias a 3 px e a de Display a 2,7 px. Nenhum halo corta traço (pergunta 31), e a `COLISAO-TEXTO` mede as três sem acusar par.
* **Frase acessível e corpo.** Saem dos mesmos textos já formatados nas três versões (DAD-5), com 228, 229 e 216 caracteres.
