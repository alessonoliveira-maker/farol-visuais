# Area bump

## O que é

Bump chart em que a espessura da faixa também carrega informação: a posição vertical de cada item num período é o seu ranking, e a espessura da faixa nesse período é proporcional ao valor, na mesma escala em todos os períodos. As faixas de um período para o seguinte se ligam por curvas cúbicas horizontais, formando fitas contínuas. Um visual mistura duas leituras, então a régua deste modelo é: **a posição vertical é sempre a leitura primária** (quem lidera, quem sobe, quem cai) e **a espessura é a leitura secundária** (com quanto), e toda versão escreve isso numa linha de leitura no topo do corpo, para o leitor nunca precisar adivinhar qual das duas decide.

## Quando usar

- De 4 a 8 itens em 4 a 12 períodos, quando ranking e volume importam juntos.
- Troca de liderança entre plataformas, origens ou produtos com diferença de tamanho relevante entre eles.
- Leitura de trajetória de um item em destaque contra os demais como contexto, sem perder a régua de volume.

## Quando evitar

- Mais de 8 itens: as faixas ficam finas demais e os rótulos de início e fim colidem; use bump chart de ranking ([04_linhas/08_bump-chart](../../04_linhas/08_bump-chart/)) ou agrupe as menores.
- Só o ranking importa, sem volume: bump chart de ranking ([04_linhas/08_bump-chart](../../04_linhas/08_bump-chart/)), que não precisa calcular espessura.
- Só o volume importa, sem ranking: área empilhada ([02_area-empilhada](../02_area-empilhada/)).
- Comparação fina de valores entre itens: a espessura de uma fita curva acaba lida como posição, não como magnitude exata; publique a tabela ao lado quando o valor exato importar.

## Anatomia

1. Uma coluna por período, com os itens ordenados do maior valor no topo ao menor na base; a coluna inteira fica centrada na altura do corpo, porque o total varia de período a período (regra declarada, nunca um acidente de layout).
2. Espessura de cada faixa proporcional ao valor, numa escala comum a todos os períodos: o mesmo valor sempre desenha a mesma espessura, em qualquer período.
3. Faixas ligadas por curvas cúbicas horizontais (`C`), com os pontos de controle no meio do intervalo entre dois períodos, formando o caminho de ida (borda superior) e o de volta (borda inferior) do mesmo `path` fechado.
4. Cor presa ao item por `slot` fixo (1 a 6, que vira `--chart-1` a `--chart-6`), nunca à posição no ranking daquele período (CONTRATO, COR-3); a versão com destaque usa `--chart-1` só no item acompanhado e `--line-strong` nos demais.
5. Valor medido em zero desenha a faixa mais fina do modelo (2 a 4 px conforme a versão), mas alta o bastante para sobreviver ao próprio contorno (`stroke` de 1,5 px, que come metade da espessura de cada lado da faixa); abaixo desse piso o zero lê igual ao caminho interrompido do `null`, o que é o próprio defeito que a regra existe para evitar. Valor não coletado (`null`) interrompe o caminho nos dois lados do período ausente, sem desenhar faixa nem stub nem interpolar (CONTRATO, EIX-10 e EST-3): zero é uma marca fina, `null` é ausência de marca, e as duas nunca podem virar o mesmo buraco na fita.
6. Empate de valor no mesmo período é desempatado pela ordem do período anterior, não pelo nome nem pela ordem de entrada do dado.
7. Rótulos de início e fim fora da área de faixas: o primeiro período mostra a posição ordinal e o nome, o último mostra o nome e o valor; nenhum rótulo entra dentro de uma faixa, então nenhuma faixa fina precisa de halo para o texto continuar legível.
8. Linha de leitura no topo do corpo, calculada do dado e sempre igual: declara com essas palavras que a posição é a leitura primária e a espessura, a secundária, porque o visual mistura as duas e o leitor não deve ter que adivinhar qual decide.
9. Ordem de desenho das faixas é regra declarada, nunca acidente de z-index do SVG: a versão sem destaque desenha faixas e stubs na ordem de entrada de `data`, então a mesma origem fica sempre do mesmo lado num cruzamento, em qualquer período; a versão com destaque inverte isso de propósito, desenhando as faixas neutras primeiro e o item destacado por último, para ele nunca ficar por baixo.

## Versões

- `v1_plataformas-por-investimento-trimestral`: 6 plataformas fictícias de mídia paga em 8 trimestres. Demonstra a ordenação por período com espessura proporcional numa escala comum, as faixas ligadas por curvas cúbicas, os rótulos de início e fim com posição e valor, e a nota que declara as duas codificações, pintadas na ordem de entrada do dado, sem destaque.
- `v2_plataforma-em-destaque`: mesmo cenário de investimento, acompanhando uma única plataforma. Demonstra o item destacado em `--chart-1` contra os demais em `--line-strong`, a posição escrita a cada trimestre ao lado de um marcador na própria faixa, o desenho em duas camadas (neutros primeiro, destaque por último) para o destaque nunca ficar por baixo num cruzamento, e a coluna centrada com a regra escrita na linha de leitura.
- `v3_item-zerado-num-periodo`: 4 origens fictícias de lead em 5 trimestres, com uma origem sem nenhum lead num trimestre e outra sem coleta num trimestre diferente. Demonstra a faixa de espessura mínima para o zero medido (4 px, a que sobrevive ao contorno), o caminho interrompido por inteiro para o dado ausente, o empate resolvido pela ordem do período anterior e a frase acessível citando o líder de cada ponta e a origem zerada. A linha de leitura nomeia qual leitura é primária e qual é secundária, em vez de só descrever as duas.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para a pasta do visual na página.
2. Substitua o dado fictício pela série real, mantendo o formato `{ id, label, slot, values }`, com `values` alinhado a `periods` pela posição e `null` só para período sem coleta, nunca para valor zero.
3. Mantenha o `slot` fixo por item entre todas as instâncias da página: é o que garante que a mesma plataforma ou origem tenha sempre a mesma cor, mesmo trocando de posição no ranking.
4. Na versão com destaque, passe `highlightId` a partir da seleção da página (o item que o usuário está acompanhando), não um valor fixo.
5. Dê altura ao pai (a linha da grade) ou passe `height`; o `viewBox` interno escala para o espaço disponível.
6. Confira que o número de períodos continua entre 4 e 12 e o número de itens entre 4 e 8: fora dessa faixa os rótulos de início e fim voltam a colidir (ROT-9), porque o vão entre faixas foi calibrado para essa contagem.

## Referências

- Biblioteca: [nivo, AreaBump](https://nivo.rocks/area-bump/). Observar ranking e valor na mesma forma.
- Biblioteca: [nivo, Bump](https://nivo.rocks/bump/). Observar a versão só de ranking para comparar com o bump chart de `04_linhas`.
- Catálogo: [Datylon, 80 types of charts and graphs](https://www.datylon.com/blog/types-of-charts-graphs-examples-data-visualization). Observar bump area chart como tipo próprio.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18._

- `v1_plataformas-por-investimento-trimestral`: o rótulo de início traz posição ordinal e nome e o de fim traz nome e valor, sem repetir a posição; a anatomia já descreve essa divisão, mas o `demonstrates` do `meta.json` fala em "posição ordinal e valor" como se as duas pontas trouxessem as duas coisas.
- `v1_plataformas-por-investimento-trimestral`: o contorno de 1,5 px na cor da superfície come parte das faixas mais finas; com o menor valor da série (R$ 85,0 mil) a faixa ainda se lê, mas a margem é pequena para dados mais desiguais que estes.
- `v2_plataforma-em-destaque`: o campo `slot` do `data.ts` não é usado pelo `Chart.tsx`, que pinta o destaque em `--chart-1` e todo o resto em `--line-strong`; o comentário do tipo descreve um uso que não acontece nesta versão.
- `v2_plataforma-em-destaque`: nos cruzamentos entre duas séries de contexto as faixas ficam na mesma cor neutra e só se distinguem seguindo a fita até uma das pontas; é o efeito pretendido do padrão de destaque, mas vale dizer isso na nota da versão.
- `v2_plataforma-em-destaque`: o `demonstrates` cita a coluna centrada "com a regra declarada", e a linha de leitura na tela declara só as duas codificações (posição e espessura), não a centralização da coluna.
- `v3_item-zerado-num-periodo`: a interrupção do caminho por dado não coletado (Parceria comercial no 2º tri/25) não tem nota nem aparece na frase acessível, ao contrário do zero medido, que tem as duas coisas. Ver "Pendências conhecidas" abaixo: medido e não corrigido nesta rodada porque estoura o teto de 250 caracteres da ACE-1.

_Revisão independente de 2026-09-18 (segunda passada; as três versões aprovadas, nenhum bloqueante)._

- `v1_plataformas-por-investimento-trimestral`: o contorno de 1,5 px na cor da superfície desenha uma emenda vertical em cada âncora de período, dentro de toda faixa; lê como segmentação da fita, não como dado. É o mesmo contorno que a anatomia pede, mas vale medir se um vão só entre faixas resolveria sem cortar a fita na horizontal.
- `v1_plataformas-por-investimento-trimestral`: o comentário do `ROW_GAP` no `Chart.tsx` cita "ESP-7.7", código que não existe na seção 17 do CONTRATO (os códigos de espaçamento vão de ESP-1 a ESP-4, na 17.7).
- `v2_plataforma-em-destaque`: o halo da ROT-7 sob o rótulo de posição apaga parte da faixa em destaque em cada um dos 8 períodos; medido no PNG escuro, a faixa passa de 19 px para 5 px de tinta visível sob o rótulo. A leitura de ranking não muda e o texto fica legível, mas a espessura é justamente a codificação secundária do modelo, então o entalhe custa o que o visual promete. Caminho sem escopo novo: subir o rótulo para uma pista reservada acima da coluna, em vez de 11 px acima do centro da faixa.
- `v3_item-zerado-num-periodo`: os rótulos da direita passam cerca de 17 unidades da largura do `viewBox` (580); no render a folga horizontal do contêiner absorve e o texto sai inteiro nos dois temas, mas num contêiner mais estreito "Parceria comercial 38" seria cortado na borda do SVG. Reservar mais `MARGIN.right` ou alargar o `viewBox` resolve na origem.
- `v3_item-zerado-num-periodo`: a entrada do modelo no catálogo (`_estudo/catalogo/05_areas.json`) ainda diz "Espessura mínima de 1 px para zero medido", número que a correção anterior substituiu por 4 px com motivo medido. O catálogo é que está desatualizado; a versão segue o que o `meta.json` declara.
- `v3_item-zerado-num-periodo`: no ponto do zero sobra cerca de 1,8 px de tinta de faixa depois do contorno, não os "cerca de 2,5 px" que o comentário do `ZERO_THICKNESS` declara. A marca continua visível e distinta do caminho interrompido, mas o número do comentário está otimista.
- `v3_item-zerado-num-periodo`: o rótulo da direita escreve a contagem sem o substantivo ("Indicação 50"), enquanto a NUM-6 pede o substantivo em contagem solta; a unidade aparece uma vez só, na linha de leitura ("leads").
- Modelo inteiro: o `npm run check` mediu a guarda COLISAO-TEXTO em 2 das 3 versões e deixou uma de fora por `preview_com_escala`, então o silêncio da guarda não vale como aprovação nessa versão; a conferência dos pares de texto foi feita nos PNGs.

## Correção de 2026-09-18 (rodada única)

`v3_item-zerado-num-periodo` foi reprovada: o zero medido de Evento presencial no 3º tri/25 não desenhava nenhum pixel de marca (ZERO_THICKNESS de 1 px inteiramente coberto pelo contorno de 1,5 px na cor da superfície), então lia igual ao caminho interrompido do dado não coletado, o que contraria EST-3, EIX-10 e a pergunta 1/3 do checklist ("nenhuma forma sugere algo que o dado não tem"). Correção na causa: `ZERO_THICKNESS` subiu de 1 para 4 px, o suficiente para sobrar cerca de 2,5 px de tinta depois do contorno consumir os outros 1,5 px; conferido nos dois PNGs (escuro e claro) em `x` do 3º tri/25, a faixa de Evento presencial agora é uma linha contínua, e o buraco de Parceria comercial no 2º tri/25 (dado não coletado) segue sem nenhuma tinta, então os dois casos leem diferente. Aproveitando a correção, a linha de leitura passou a nomear qual eixo é primário e qual é secundário ("Posição (ranking) é a leitura primária; espessura da faixa (leads) é secundária", antes só descrevia as duas sem dizer qual pesa mais) e o JSDoc do `Chart.tsx` passou a declarar a ordem de desenho das faixas (decisão do dono para o modelo inteiro; ver Anatomia, itens 8 e 9). `v1` e `v2` não foram tocadas: já estavam aprovadas e a régua desta rodada foi corrigir só o que reprovou.

## Pendências conhecidas

- `v3_item-zerado-num-periodo`: a interrupção por dado não coletado (Parceria comercial, 2º tri/25) segue sem nota visual e sem menção na frase acessível. A frase acessível já usa 212 dos 250 caracteres que a ACE-1 permite; a sentença mais curta testada para o gap ("Parceria comercial não teve coleta no 2º tri/25...") levava o total a 312 caracteres e reprovaria a ACE-1. Fica para uma rodada que reveja a frase inteira, não só acrescente uma cláusula.
- `v3_item-zerado-num-periodo`: o stub de largura 7 px do 1º tri/25 de Parceria comercial (valor 10, faixa de ~5,2 px) sobra com pouca tinta visível depois do contorno de 1,5 px; não é o zero medido nem estava nos problemas bloqueantes desta rodada, então não foi alterado para não abrir escopo novo sobre uma versão já sob correção.
- `v1_plataformas-por-investimento-trimestral`: observação já registrada acima (contorno comendo faixas finas com dados mais desiguais que o fictício atual) segue sem alteração porque a versão está aprovada e fora do escopo desta rodada.
