# Revisão de 20_cronograma-e-linha-do-tempo/05_swimlane-de-eventos, terceira passada da v3

Data: 2026-10-15. Revisor independente. Versão julgada: `v3_handoff-em-raias-de-funcao`, em `revisao_desatualizada` depois da segunda rodada de correção autorizada pelo dono em 2026-10-15. Foi julgado o arquivo de hoje, não a nota de 2026-10-08.

`npm run check -- 20_cronograma-e-linha-do-tempo/05_swimlane-de-eventos`: 0 com erro, 0 aviso, 0 escape de guarda. Previews e PNGs de 2026-10-15 10:30, a mesma hora do `Chart.tsx`. EIXO-CALMO, OPACIDADE-MARCA e RAIO-CONTRA-AREA não medem esta peça (sem grade, sem opacidade, sem marca de área), e foram conferidas à mão, sem achado.

| Versão | Resultado | Não |
|---|---|---|
| `v3_handoff-em-raias-de-funcao` | reprovada | 31 |

Não se aplica: perguntas 3, 4, 6, 26, 27, 28, 29 e 30.

## O que a correção resolveu: o foco padrão, rótulo a rótulo, nos dois temas

Medido no `preview.svg` (o `viewBox` de 894 por 246 sai em escala 1) e conferido nos dois PNGs com recorte ampliado. A geometria é a mesma nos dois temas, só a cor muda. Nenhum dos três rótulos tem linha de chamada, porque os três ficam a 5 px ou menos do próprio tracejado.

| Rótulo | Espera de Transportadora Leste | Âncora | Tinta ao próprio tracejado | Tracejado alheio mais perto | Losango ou barra alheia mais perto |
|---|---|---|---|---|---|
| `6 dias` | Marketing para Pré-vendas | x 222,1; y 47 | 4,0 px, logo acima do começo do traço, 14 px depois do losango do foco | Atacado Central, 13,0 px | losango de Construtora Sul, 5,9 px acima |
| `5 dias` | Pré-vendas para Executivo | x 426,7; y 96,2 | 6,0 px, acima do traço | Clínica Horizonte, 42,7 px | barra de Indústria Oeste 5,1 px acima, de Clínica Horizonte 7,8 px abaixo |
| `3 dias` | Executivo para Operações | x 640,6; y 163 | 1,1 px (no PNG, 2 px de imagem entre o traço e o pé do `3`) | Atacado Central, 60,9 px | barra de Clínica Horizonte, 7,9 px acima |

As três esperas estão sobre o tracejado da própria conta, nos dois temas. O bloqueante de 2026-10-08 (`6 dias` escrito sobre o tracejado de Atacado Central, a 3 px do losango dela) está resolvido: o tracejado rosa começa em (262,3; 61), a 13 px da tinta, e nada rosa toca o rótulo. As contas conferem de novo com o dado: esperas de 6, 5 e 3 dias no foco, totais de 5, 14, 2, 9, 6 e 0 dias no painel, 12 tracejados desenhados (só as esperas maiores que zero) e frase acessível com 14 dias em 3 passagens.

## Bloqueante 1: com o foco em outra oportunidade, o rótulo fica junto do tracejado alheio e a linha de chamada não chega ao texto

Pergunta 31, ROT-7 (exceção da marca fina: em traço fino quem sai do lugar é o rótulo, por anticolisão, "com linha de chamada se precisar", e a decisão se toma "sobre o que o dado pode produzir, não sobre o que o dado fixo do preview produziu"), armadilha GEO-4, e seção 14.1, identificação das marcas, que bloqueia sempre. O foco por prop está na lista do que a versão demonstra, e o parecer de 2026-10-08 (item 4 do que mudar) pediu a conferência com os outros focos.

Como foi medido: a geometria e a anticolisão do `Chart.tsx` foram reproduzidas linha a linha num script de bancada, fora do catálogo, e a réplica devolve as três âncoras do foco padrão acima com diferença de 0,1 px. Depois o script trocou `focusId` pelas seis oportunidades, e o desenho de cada foco foi fotografado no mesmo navegador do render, em escala 2, para olhar. A tinta usada é a medida no PNG: 31,5 px de largura para `N dias` e cerca de 26 px para `1 dia`, em Space Grotesk 600 de 11 px.

Foco em Construtora Sul (`focusId="op-sul"`):

- `2 dias` (Pré-vendas para Executivo), âncora x 301,4 e y 145, tinta de x 301,8 a 333,3 e de y 139,9 a 149,0. Fica 3,9 px abaixo do começo da barra fina de Distribuidora Norte em Executivo (x 321,7) e a 6,9 px do tracejado de Norte, de (282,1; 83) a (321,7; 133), que chega exatamente ali. O tracejado da própria Construtora Sul, de (321,7; 97) a (361,3; 147), fica a 17,6 px. Tudo o que encosta no número é de Norte.
- A linha de chamada desse rótulo vai de (351,4; 134,5) a (347,4; 138,0): 5,3 px de traço cor de oliva que terminam a 14,2 px da tinta. No desenho fotografado ela é um toco solto entre o número e o traço dele, sem tocar nenhum dos dois.
- `0 dias` (Marketing para Pré-vendas), tinta de x 171,0 a 202,5: a 10,5 px do tracejado de Norte e a 20,1 px do ponto de passagem de Construtora Sul; a chamada tem 6 px e também termina a 14,2 px da tinta.

Foco em Atacado Central (`focusId="op-central"`):

- `1 dia` (Pré-vendas para Executivo), âncora x 334,1 e y 161,2, tinta de x 334,5 a 360,5. Fica a 9,2 px do tracejado de Construtora Sul, que chega ao começo da barra dela em Executivo, e a 18,8 px do próprio, de (361,3; 83) a (381,1; 161). A chamada, de (379,1; 153,2) a (373,1; 154,2), tem 6,1 px e termina a 12,7 px da tinta.

Nos focos em Distribuidora Norte, Clínica Horizonte e Indústria Oeste nenhum rótulo fica mais perto de tracejado alheio do que do próprio. Das cinco linhas de chamada que os seis focos desenham, três não chegam ao texto.

Por que reprova e não é nuance: o texto do número é neutro, sem cor de série, e só a posição diz de quem ele é. A linha de chamada foi a saída autorizada pelo dono para o caso em que o rótulo precisa se afastar do próprio traço, e o README promete que ela "liga o rótulo ao próprio traço". Nos três casos em que ela é necessária, ela não liga, e o número fica colado à chegada do tracejado de outra conta. É o mesmo defeito das duas passadas anteriores, número lido como sendo de outra marca, agora num foco que a versão diz demonstrar.

Causa, no `Chart.tsx`:

- Linha 280, `const w = label.length * 7 + 4`: a caixa do rótulo tem 46 px para `N dias`, cuja tinta mede 31,5 px, e 39 px para `1 dia`, cuja tinta mede cerca de 26 px.
- O texto é escrito a partir de `best.x`, com âncora no começo (linha 353). Nos candidatos à esquerda do traço, `dx = -6 - w` (linha 301), a tinta fica na parte esquerda da caixa, e os 14,5 px da direita, justamente o lado voltado para o próprio tracejado, ficam vazios.
- `nearOwn` (linhas 288 a 297) e a ponta da chamada (linhas 340 e 341) medem e prendem na caixa, não na tinta. O rótulo fica 14 px mais longe do próprio traço do que o algoritmo acha, e a chamada termina na parte vazia.
- No foco padrão não aparece porque as três caixas escolhidas tocam o próprio traço pelo lado em que está a tinta.

Defeito vizinho, da mesma conta: a ordenação por `gap` crescente (linha 306) prefere a caixa que cruza o próprio tracejado (`gap` zero). No foco padrão é o que deixa `3 dias` a 1,1 px do traço dele. Nos focos em Distribuidora Norte (`1 dia`), Atacado Central (`2 dias`) e Clínica Horizonte (`4 dias`), o traço entra de 0,7 a 2,3 px no canto de baixo e à esquerda da caixa de tinta.

### O que mudar

O desenho autorizado pelo dono continua o mesmo: barras, losangos e tracejado alheio como obstáculo, ponto livre mais perto do próprio traço, chamada na cor da conta acima de 5 px. O que falta é medir na tinta, e não numa caixa maior que ela.

1. Caixa do rótulo do tamanho da tinta. Por exemplo `w = label.length * 5.4 + 2`, numa constante nomeada no topo do arquivo, que dá 34,4 px para `N dias` (tinta de 31,5) e 29 px para `1 dia` (tinta de 26). A alternativa é escrever os candidatos da esquerda com `textAnchor="end"` em `best.x + w`, para a tinta ficar no lado voltado ao traço.
2. Respiro mínimo de 2 px também contra o próprio tracejado: descartar o candidato com `gap` abaixo de 2, por exemplo `.filter((c) => c.gap >= 2 && c.gap <= 34)`. O traço continua sendo o mais perto, só não passa mais pelo número.
3. Simulado com os dois itens nos seis focos, na mesma réplica: todo rótulo fica de 3,1 a 8,5 px do próprio tracejado e nenhum é cruzado por ele, toda chamada termina a 3,1 px ou menos da tinta, e nenhum rótulo fica mais perto de tracejado alheio do que do próprio. O pior caso é `2 dias` de Construtora Sul, 6,5 px do dele contra 6,9 px do de Norte, e ali a chamada encosta no número. No foco padrão, `6 dias` ganha uma chamada de 5,6 px, `5 dias` fica onde está e `3 dias` passa a 6,1 px do traço.
4. Conferir no render com pelo menos `focusId="op-sul"` e `focusId="op-central"`, e não só com o padrão, porque a chamada nunca é desenhada no foco padrão de hoje.
5. Ajustar o comentário da linha 286, que ainda diz "vence o primeiro livre de barras", e deixar a frase do README sobre a chamada verdadeira para todos os focos.

Nada disso pede halo. Na marca fina quem sai do lugar é o texto (GEO-4).

## Pesado e não reprovou

- O tracejado do foco é pintado antes de todas as barras e passa por baixo das barras finas de Atacado Central em Marketing (x 229 a 243) e de Clínica Horizonte em Pré-vendas (x 431 a 448). O traço reaparece do outro lado e a espera se lê pelo número. Observação no README.
- `5 dias` cruza a linha de grade de 19/10 sem halo. A grade é `--line-subtle`, referência e não dado, e o número se lê nos dois temas. Já anotado em 2026-10-08.
- Barras fora do foco com 6 px, abaixo do piso de 12 px da ESP-2. A troca pela opacidade está declarada no `meta.json` e as barras se leem nos dois temas. Já anotado.
- Frase acessível de 113 caracteres que começa pelo assunto e não pelo tipo do gráfico (ACE-1). Redação, já anotada.
- Todo o texto sai em 11 px, contra os 12 px da 17.1 para rótulo e legenda. A escala é 1 e o texto se lê. Já anotado.
- Contraste de texto e de marca medido pela ferramenta nos dois temas, sem achado. O tracejado de cada oportunidade usa a cor dela, acima de 3:1 contra as duas superfícies das raias (ACE-6). Peso 700 só no nome e no total do foco (TIP-3).

## Registro

```
Versão: 20_cronograma-e-linha-do-tempo/05_swimlane-de-eventos/v3_handoff-em-raias-de-funcao
Data: 2026-10-15
Resultado: reprovada
Não: 31
Correções:
  31. ROT-7 (marca fina), GEO-4, 14.1 (identificação das marcas): medir a caixa do rótulo de dias pela tinta (cerca de 5,4 px por caractere) e dar 2 px de respiro também contra o próprio tracejado, para que o rótulo fique junto do traço dele e a linha de chamada chegue ao número em todo foco, conferido com op-sul e op-central.
Não se aplica: 3, 4, 6, 26, 27, 28, 29, 30
```
