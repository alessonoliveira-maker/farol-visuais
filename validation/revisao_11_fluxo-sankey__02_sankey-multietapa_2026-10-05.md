# Parecer de revisão: 11_fluxo-sankey/02_sankey-multietapa

Data: 2026-10-05. Revisão independente das quatro versões, motivo `revisao_desatualizada` pela emenda ACE-6 de 2026-09-20. Julgado o arquivo de hoje, com `npm run check` em 0 erros e 3 avisos (todos na v1).

Resultado: v2 e v4 aprovadas; v1 e v3 reprovadas. Há uma única rodada de correção, e os bloqueantes abaixo são todos os encontrados.

## v1_oportunidades-com-perdas-por-motivo: reprovada

Não: 32, 20, 15.

**Bloqueante 1. Pergunta 32 (e 20), regra ACE-6, armadilha TOK-5.**
Evidência: `Chart.tsx:57` define `NEUTRAL_COLOR = 'var(--line-strong)'` e `Chart.tsx:164` e `175` pintam com ele o `stroke` de toda ligação cujo destino é perda ou "Em andamento". São 16 das 20 ligações do diagrama. O próprio check mede esse token em 1,79:1 no escuro e 1,83:1 no claro contra o cartão, abaixo dos 3:1. No PNG claro as faixas de 3 e de 8 oportunidades que saem de Negociação quase somem. Teste da ACE-6: tapada a ligação, o rótulo "Perdida: timing, 15 oportunidades" continua lá, mas deixa de dizer de qual etapa a perda saiu; a ligação é o dado. A isenção de valor escrito da ACE-3 cobre o nó, não a relação.
O que mudar: trocar o neutro das ligações (e, por coerência, dos nós de perda e de andamento) para `var(--text-muted)`, que mede 5,21:1 e 5,37:1 e já é o que v2, v3 e v4 usam. Atualizar o item 4 do `demonstrates` do `meta.json` e o item 5 da Anatomia do README, que hoje citam `--line-strong`.

**Bloqueante 2. Pergunta 15, regras ESP-3 e ROT-7, armadilha GEO-4.**
Evidência: a ligação é traço grosso (`strokeWidth={linkWidth}`, `Chart.tsx:175`) sobre curva de raio pequeno. No PNG, a faixa de Aberta para Diagnóstico (cerca de 154 px de espessura) transborda a coluna de destino: a tinta do caminho aparece à direita do nó Diagnóstico e abaixo dele, desce até perto de y = 600 px na imagem de 2000 px, passa por trás do nó "Perdida: sem perfil" e fica sob o rótulo desse nó. O halo de "Perdida: sem perfil" e de "58 oportunidades" recorta caixas da cor do cartão dentro da faixa, e o de "420 oportunidades" recorta a borda de saída da raiz, nos dois temas. A marca afirma largura de chegada maior que a altura do nó que a recebe.
O que mudar: desenhar a ligação como região fechada, copiando `ribbonPath` da v2 ou da v4 (borda de cima e borda de baixo deslocadas de meia largura, `fill` no lugar de `stroke`). Com isso a faixa termina na borda do nó e nenhum rótulo cai sobre ela.

Conferido e sem bloqueante: conservação fecha nas quatro etapas (420, 268, 131, 64); EST-1 presente; TIP-3 com dois elementos em 700; frase acessível com 248 caracteres, dentro do teto e com aviso do check.

## v3_jornada-dos-leads-em-ate-tres-toques: reprovada

Não: 15.

**Bloqueante 1. Pergunta 15, regra COR-5, armadilha TOK-4 (marcas que se fundem onde se sobrepõem).**
Evidência: todas as faixas neutras são `fill` opaco em `var(--text-muted)` com `stroke="none"` (`Chart.tsx:260` a `267` e `354` a `359`), e 22 das 23 ligações têm essa cor. Onde se cruzam, viram uma mancha só, nos dois temas:
1. No vão entre o Passo 3 e o Desfecho, as três faixas do corredor (30, 38 e 31 leads) sobem atravessando as quatro faixas que saem do Passo 3 (24, 38, 53 e 104). No PNG, a região de x entre 1450 e 1610 px e y entre 870 e 1150 px (imagem de 2000 px) é um bloco contínuo: não se vê onde a faixa de "Sem 3º toque" termina nem por onde o corredor chega ao nó Qualificado. A chegada dos 99 leads de toque único, que é a técnica que a versão demonstra, não se lê.
2. No vão entre o Passo 1 e o Passo 2, as mesmas três faixas descem para o corredor cruzando as oito faixas que avançam; os cruzamentos se fundem do mesmo jeito.
3. A faixa acesa em `--chart-1` (Busca paga para Evento, 40 leads) é a quarta do array e as neutras seguintes são pintadas por cima dela: no cruzamento ela aparece cortada por quatro faixas neutras e perde cerca de metade da largura visível, justo a marca de destaque.
O que mudar: dar a cada faixa (comum e de corredor) um contorno de 1,5 a 2 px em `var(--surface-raised)`, que é a separação que a COR-5 pede entre vizinhos que não contrastam e a saída da TOK-4, para que cada cruzamento mostre qual faixa passa por cima; e desenhar a faixa acesa por último (por exemplo registrando a ligação com `accent` e desenhando no último nó, como já se faz com o corredor), para ela não ser coberta. Conferir depois o vão do Passo 3 ao Desfecho nos dois temas: cada uma das sete chegadas precisa ser acompanhável até o nó.

Conferido e sem bloqueante: ACE-6 atendida (ligações em `--text-muted`, 5,21:1 e 5,37:1; acesa em `--chart-1`); conservação 318 na entrada e no desfecho, 219 nos passos 2 e 3; legenda com amostra na forma da marca; EST-1 presente; texto sem corte nem colisão no check.

## v2 e v4: aprovadas

ACE-6 atendida nas duas: faixas em cor de camada ou em `--text-muted`, faixa vazada da v2 com contorno de 2 px em `--text-muted`, arco da v4 em `--chart-3`. Observações não bloqueantes foram para o README do modelo.

---

# Segunda passada, 2026-10-05: v1 e v3 depois da correção

Motivo `revisao_desatualizada`: o `Chart.tsx` das duas mudou depois do parecer acima. Julgado o arquivo de hoje, com os PNGs renderizados depois da mudança. `npm run check` em 0 erros e 2 avisos (os dois na v1). Resultado: v1 aprovada, v3 reprovada. O texto acima fica como histórico da primeira passada.

## v1_oportunidades-com-perdas-por-motivo: aprovada

Os dois bloqueantes fecharam. `NEUTRAL_COLOR` é `var(--text-muted)` (`Chart.tsx:57`), e a ligação é região fechada com `fill` e `stroke="none"` (`Chart.tsx:175` a `178`). Nos dois PNGs a faixa de Aberta para Diagnóstico termina na borda do nó, e o rótulo de "Perdida: sem perfil, 58 oportunidades" fica sobre o cartão, sem faixa por baixo. Observações novas foram para o README.

## v3_jornada-dos-leads-em-ate-tres-toques: reprovada

Não: 15.

**Bloqueante único. Pergunta 15, regra COR-2 (o destaque é a marca que a versão existe para mostrar), armadilhas REC-13 (quem é pintado por último cobre o vizinho) e TOK-4.**

O que foi atendido da passada anterior: o contorno de 1,5 px em `--surface-raised` está em toda faixa e em toda pista (`Chart.tsx:267` a `269` e `364` a `366`). Com ele, os cruzamentos entre neutras ficaram legíveis nos dois temas, e as sete chegadas ao nó Qualificado (30, 38, 24, 38, 53, 31 e 104 leads, de cima para baixo) se acompanham até o nó. Esse ponto está resolvido.

O que não foi atendido: a faixa acesa continua coberta por neutras. A ordenação de `Chart.tsx:464` põe a ligação com `accent` no fim da lista de ligações, mas as pistas do corredor não são ligações desenhadas ali: elas são pintadas pelo renderizador do último nó (`Chart.tsx:356` a `369`), depois de todas as ligações. As pistas que saem de Mídia social (30 leads) e de Busca paga (38 leads) descem no mesmo vão de curva por onde a faixa acesa passa, quase paralelas a ela, e ficam por cima.

Evidência medida no PNG (2200 por 1600 px, escala 2), contando por coluna os pixels na cor da faixa acesa entre y = 560 e y = 1260:
1. No trecho reto, de x = 130 a x = 460, a faixa mede 60 px de espessura vertical em toda coluna.
2. Entre x = 440 e x = 600, a faixa tem **zero** pixel visível em 18 colunas, em dois trechos (em torno de x = 497 a 505 e de x = 541 a 548). Coluna sem nenhum pixel quer dizer marca partida: a faixa de destaque está cortada em três pedaços.
3. No mesmo intervalo, 58 das 160 colunas (de x = 483 a x = 556) mostram menos de 30 px, ou seja menos de metade da espessura.
4. Os números são os mesmos no tema claro e no escuro.

Consequência: o trecho mais pesado da jornada, que é o que o catálogo manda acender e o que a legenda promete ("Trecho mais pesado da jornada"), se perde justamente no cruzamento, e o comentário de `Chart.tsx:463` ("nunca coberta por elas") afirma o que o desenho não faz.

O que mudar: pintar a faixa acesa **depois** do corredor. O caminho mais curto é o que o corredor já usa: quando a ligação tem `accent`, o renderizador de ligação registra a geometria num mapa por índice e devolve grupo vazio, e o renderizador do último nó desenha, nesta ordem, as pistas neutras do corredor, as pistas acesas e, por fim, as faixas acesas que avançam uma coluna, com o mesmo contorno de 1,5 px. Conferir depois, nos dois temas, que a faixa acesa mede a espessura inteira em toda coluna de x = 440 a x = 600 do PNG, e corrigir o comentário da linha 463.

Conferido e sem bloqueante: conservação 318, 219, 219 e 318; ACE-6 atendida (`--text-muted` e `--chart-1`); frase acessível com 221 caracteres; linha de leitura e legenda sem corte; nenhum rótulo sobre faixa; EST-1 presente; TIP-3 sem peso 700 no corpo; check sem aviso nesta versão.
