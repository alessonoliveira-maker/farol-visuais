# Dispersão de termos (scattertext)

## O que é

Cada termo é um ponto: o eixo X mede o termo no grupo A e o eixo Y mede o mesmo termo no grupo B, em
posição de frequência, em escala log ou em proporção. Termos sobre a diagonal são comuns aos dois
grupos; os que se afastam dela são característicos de um. Popularizada pelo Scattertext, a forma
responde qual vocabulário distingue dois grupos num universo de 100 a 300 termos, algo que barras não
comportam. No Recharts é um `ScatterChart` com dois eixos numéricos de domínio igual, a diagonal por
`ReferenceLine` com `segment` e os nomes desenhados por uma camada própria que só aceita o rótulo que
não colide com marca nem com outro rótulo.

## Quando usar

- Achar os termos típicos de cada um de dois grupos, entre 100 e 300 termos.
- Ganhas contra perdidas, CPL abaixo contra acima da mediana, antes contra depois de uma mudança.
- Público analítico de Marketing ou de RevOps, que vai explorar com busca e dica.
- Quando as barras divergentes (02/06) cortariam termos demais para caber.

## Quando evitar

- Público não analítico ou apresentação: use barras divergentes de mudança de vocabulário (02/06).
- Menos de 30 termos: a pirâmide de termos (02/07) mostra as duas magnitudes com o nome em cada barra.
- Mais de 300 termos sem frequência mínima: vira nuvem de pontos; filtre antes de desenhar.
- Escala log com zero: o ponto some; use posição, ou some 1 e declare no subtítulo.
- Grupos de tamanhos muito diferentes em contagem bruta: o maior domina; use a proporção de cada grupo.

## Anatomia

1. **Dois eixos numéricos de domínio igual**, com grade nos dois sentidos (EIX-3b) e tiques em intervalo
   redondo. O eixo é posição de frequência (`v1`, `v2`), contagem mais 1 em log (`v3`) ou proporção do
   grupo (`v4`). Empate em posição recebe a posição média do bloco, para a ordem alfabética não inventar
   diferença.
2. **Diagonal** por `ReferenceLine` com `segment`, `ifOverflow="extendDomain"`, `--text-muted` e
   tracejado 3 3: a mesma posição, contagem ou proporção nos dois grupos.
3. **Marca por papel**: típico de um grupo em `--chart-1`, típico do outro em `--chart-3`, comum aos
   dois em `--text-muted`, sempre com raio fixo pelo `ZAxis` (área π r², REC-31).
4. **Camada de nomes** dentro do `ScatterChart`, com `usePlotArea`, `useXAxisScale` e `useYAxisScale`:
   algoritmo guloso que percorre os termos do mais distante da diagonal para o menos e só aceita a
   posição, entre 8 candidatas ao redor da marca, que não cobre marca nem outro nome e em que o ponto dono é o mais próximo da tinta (folga de 2 px). Na v1, o primeiro termo de cada lado ainda ganha vaga distante com linha de chamada.
5. **Cantos nomeados** em linhas fora do plano, com amostra de cor, no lugar de legenda: o plano inteiro
   é marca e qualquer texto dentro dele cobre pontos.
6. **Linha de leitura** calculada do dado, mais uma linha com o que o eixo mede e o n de cada grupo.
7. **Dica** com o que o corpo não escreve: posição e contagem nos dois grupos (`v1`, `v2`), contagem de
   anúncios e CPL qualificado médio (`v3`), proporção com o volume e o zero escrito (`v4`).
8. **Estado vazio** com `role="status"` quando não há termo no recorte.

## Versões

- `v1_ganhas-contra-perdidas`: 100 termos de anotações de 2026 em posição de frequência nos dois grupos,
  com 15 nomes escolhidos por colisão e cantos nomeados. Canvas `quadrado`.
- `v2_busca-destaca-um-termo`: prop de termo buscado que acende o ponto em `--chart-1` com anel e nome
  em peso 700, nuvem em cinza e três frases em concordância curta. Termo inexistente escreve termo não
  encontrado no recorte. Canvas `alto`.
- `v3_titulos-de-criativos-por-cpl`: 250 palavras de títulos de criativos de ago/26 em escala log com 1
  somado, mínimo de 3 anúncios aplicado antes e nome só nas palavras típicas de um grupo. Canvas `alto`.
- `v4_termos-raros-e-grupos-desbalanceados`: proporção por grupo (400 contra 40 anotações), 142 termos
  de uma menção em cada grupo num marcador único (anel identificado numa linha fora do plano, com amostra, nome e contagem), termo de um grupo só sobre o eixo e aviso de grupo
  pequeno. Canvas `quadrado`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página e troque o `import` do `./data` pelo
   dado real, já com a frequência mínima aplicada na extração ou dentro do componente, como na `v3`.
2. Cada linha do dado traz o termo e a contagem nos dois grupos; a posição de frequência, a proporção e
   a distinção saem do componente, nunca do dado.
3. A camada de nomes é um componente local que só funciona **dentro** do `ScatterChart`, porque depende
   de `usePlotArea`, `useXAxisScale` e `useYAxisScale`; não a mova para fora.
4. Na `v2`, a prop `searchedTerm` recebe o termo do campo de busca da página; a comparação ignora
   maiúscula e acento.
5. Ajuste `TYPICAL_GAP`, `TYPICAL_SCORE` ou `TYPICAL_DIFF` e `LABEL_COUNT` ao tamanho do universo.
6. Coloque o componente no corpo de um `VisualCard` com altura definida no pai ou passe `height`, e
   rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Scattertext, Kessler 2017](https://github.com/JasonKessler/scattertext): a forma original, com
  frequência em cada categoria nos eixos e rótulo só nos termos que cabem.
- Recharts, hooks de escala `usePlotArea`, `useXAxisScale` e `useYAxisScale`: dão à camada própria os
  pixels de todos os pontos ao mesmo tempo, que o `LabelList` não dá.
- ARMADILHAS `REC-1` (referência fora do domínio), `REC-15` e `REC-31` (tamanho do ponto) e `GEO-4`
  (halo sobre marca fina).

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, primeira passada das quatro versões. O que reprovou a `v1`, a `v3` e a `v4` está em `validation/revisao_21_texto-e-nuvem-de-palavras__06_dispersao-de-termos_2026-10-13.md`; abaixo, só o que não reprova.

- `v1`, `v2`, `v3`, EIX-6b (emenda de 2026-10-02): `MARGIN.top` de 8 px. O tique do topo do eixo vertical (`100º`, `300`) sai em 11,25 px, 3,25 px abaixo da linha de grade dele, que está em 8 px. Na `v4`, com 12 px, o tique cai na linha. Não muda a leitura.
- `v1`, `v3`, `v4`, ROT-4: o cinza (`comuns aos dois`, `sem diferença`) não tem amostra; identifica-se por eliminação e pela contagem da linha de leitura.
- `v2`, `v3`, `v4`: o significado da diagonal não está escrito. Só a `v1` escreve `diagonal: mesma posição nos dois` no rodapé.
- `v1`, `v2`, sentido do eixo de posição: o 1º fica na origem, então o termo mais citado nos dois grupos vai embaixo e à esquerda, ao contrário da convenção de frequência que cresce para cima e para a direita. Está declarado (`1º é o mais citado`) e os tiques são ordinais, mas não há tique em 1º.
- `v1`, `v2`, arredondamento: a posição média de empate sai arredondada na dica e na linha de leitura (95,5 vira `96º`), enquanto o ponto fica em 95,5.
- `v1`, GEO-14: o rodapé quebra em duas linhas no canvas `quadrado`.
- Todas, TIP-1: números de rodapé, de linha de eixo e de rótulo em SVG sem `tabular-nums` nem `font-display` (`15 posições`, `(400)`, `Mínimo de 3`, `142 termos`, `2,5 p.p.`). Sem consequência visível.
- `v2`, acessibilidade: as três frases de concordância ficam em bloco `aria-hidden` e fora da frase acessível; quem usa leitor de tela recebe a posição do termo, não as frases que a sustentam.
- `v2`, anel: raio de 9 px com margem superior de 8 px. Termo buscado perto da 100ª posição entre as perdidas pode ter o anel cortado no topo; não acontece com o dado padrão.
- `v3`, sobreposição: as 250 palavras ocupam 87 posições distintas, a maior pilha guarda 21 e 195 palavras dividem o ponto com outra. A opacidade de 0,8 só separa ponto único de pilha, e a dica alcança uma palavra por pilha. Deslocamento determinístico dentro da célula ou marcador com contagem, como na `v4`, resolveria.
- `v3`, tiques: escrevem a contagem mais 1 (`10` vale 9 anúncios), o que está declarado na linha `Escala log, com 1 somado`. Rotular o tique pelo valor real dispensaria a ressalva. Nenhuma palavra do `data.ts` tem zero num grupo, então o caso que justifica somar 1 não aparece no preview.
- `v3`, ferramenta: o SVG isolado estreita o espaço depois de `CPL` e desloca o resto da linha. A diferença contra a página mede 0,64% no escuro e 0,66% no claro, acima de 0,5% e abaixo dos 2% que reprovam no render. A página está certa.
- `v4`, escolha dos nomes: ficam sem nome `pagamento` e `concorrente` (5º e 6º em diferença), `garantia` (2º do lado do telefone) e `boleto` e `upgrade` (termos sobre o eixo, além de `contrato`), enquanto `proposta`, 24º, tem nome.
- `v4`, ROT-7: o halo do rótulo do marcador único cobre cerca de 24 px do começo da diagonal, e o fim de `proposta` encosta nela. É linha de referência e continua legível.
- `v4`, ACE-1: a frase acessível descreve a estrutura e não traz a contagem da linha de leitura (5 no telefone, 19 no vídeo, 22 sem diferença).
- `v4`, seção 17.2: o anel vazado é a forma da ausência na tabela de papéis; aqui marca um agregado e se sustenta pelo texto ao lado.

Revisão de 2026-10-13, segunda passada, da `v1`, da `v3` e da `v4` depois da correção. A `v1` e a `v3` passaram. O que reprovou a `v4` (o anel do marcador único ficou sem a contagem) está na seção `Segunda passada` de `validation/revisao_21_texto-e-nuvem-de-palavras__06_dispersao-de-termos_2026-10-13.md`. Das observações acima deixaram de valer: o tique do topo da `v1` e da `v3` (margem de 12 px, tique na linha de grade), a lista de quem fica sem nome na `v4` e o halo do rótulo do marcador único sobre a diagonal, porque esse rótulo deixou de existir. As demais continuam valendo. Abaixo, só o que é novo ou mudou.

- `v1`, `v3`, `v4`, nome e ponto dono: todo nome sem linha de chamada tem o ponto dono como o mais próximo da tinta. Menor margem medida entre dono e vizinho: 2,3 px em `liberado` (`v3`), 2,7 px em `pagamento` (`v1`) e 3,0 px em `dúvida` (`v1`), contra a folga de 2 px do código. Nas vagas de baixo (`dy: 14`) o nome fica a 9,3 px do dono, o maior valor aceito.
- `v1`, contagem de nomes: o desenho tem 14 nomes, e o `demonstrates`, a seção Versões e o catálogo dizem quinze. O laço percorre os 100 termos e só 14 cabem, então `LABEL_COUNT` não é alcançado. Escrever "até 15".
- `v1`, quem ganha nome: posições 1, 2, 8, 14, 15, 19, 29, 31, 34, 35, 45, 66, 83 e 97 da ordem de distância à diagonal. Ficam sem nome 10 dos 15 mais distantes (`garantia`, `cancelamento`, `urgência`, `indicação`, `referência`, `instalação`, `inadimplência`, `visita`, `cobrança` e `treinamento`), e três nomes vão para termos comuns colados à diagonal (`plano`, `anual` e `filial`, este o 97º de 100). O rodapé declara que o nome sai onde cabe e o primeiro de cada lado está garantido, por isso não reprova. Parar a fila nos termos típicos, como a `v3` faz, e dar linha de chamada a mais termos do topo devolveria os nomes a quem a cor diz que importa.
- `v1`, DAD-10: o comentário de abertura do `Chart.tsx` diz que só os termos mais distantes ganham nome, e o desenho nomeia o 97º.
- `v1`, vaga distante: o nome `demonstração` para a 8,5 px do ponto de `objeção`, a mesma distância de um nome sem linha ao próprio ponto (7,9 a 9,3 px). A linha de chamada desfaz a dúvida, mas a vaga distante só confere se cobre marca; exigir também uma folga contra ponto alheio resolveria.
- `v1`, linha de chamada de `demonstração`: passa a 1,2 px da borda do ponto de `garantia` (5,2 px do centro) e a 4,4 px da tinta de `suporte`, sem tocar em nenhum dos dois.
- `v1`, ROT-7: o fim de `plano` cai sobre a diagonal e o halo cobre cerca de 15 px dela. É linha de referência e continua legível.
- `v1`, GEO-14: o rodapé passou de duas para três linhas no canvas `quadrado`, e o plano mede 362 por 199 px para 100 posições, 2 px por posição na vertical. O canvas `alto` daria vaga a mais nomes.
- `v1`, sobreposição: `jurídico` e `cadastro` têm as mesmas contagens e caem no mesmo ponto (87,5ª e 61,5ª). A linha de leitura conta 31 de perdidas e o desenho mostra 30 discos.
- `v3`, contagem de nomes: 11 nomes, contra "rótulo só nos 20 termos de maior distinção" do `demonstrates` e do catálogo. A fila agora só tem as 18 palavras típicas, então `LABEL_COUNT = 20` não é alcançável com este dado. Escrever "até 20, só entre as típicas", como o rodapé já diz; a nota do `meta.json` também não cita o corte nas típicas.
- `v3`, quem fica sem nome: 7 das 18 típicas (`parcelas`, `zero`, `entrada`, `rápido`, `comprovado`, `fácil` e `saiba`). As 6 de maior distinção têm nome.
- `v3`, par quase coincidente: `liberado` e `comprovado` ficam a 2,3 px um do outro (20 e 19 no eixo vertical, mesmo valor no horizontal) e leem como um ponto só, com o nome `liberado`.
- `v3`, ferramenta: a diferença entre a página e o SVG isolado continua em 0,64% no escuro e 0,66% no claro, toda no texto depois de `CPL`, inclusive no cabeçalho do cartão, que não é do `Chart.tsx`.
- `v4`, quem fica sem nome: `pagamento` (5º em diferença, 19,5 p.p.) e os outros dois termos sobre o eixo, `boleto` e `upgrade`. Os 10 nomes são as posições 1, 2, 3, 4, 6, 7, 8, 13, 17 e 19 da ordem de diferença.
- `v4`, sobreposição: `orçamento`, `vencimento` e `pix` dividem um ponto (3% e 12,5%) e `interesse` e `dúvida` outro (5,25% e 7,5%). São 46 termos em 43 discos.

Revisão de 2026-10-15, terceira passada, só da `v4`, depois da segunda rodada de correção. Passou: a linha `Anel: 142 termos com 1 menção em cada grupo (0,25% do telefone, 2,5% do vídeo)` fica fora do plano, com amostra vazada na cor do anel, e confere com o `data.ts` (142 linhas com 1 e 1; 1 de 400 e 1 de 40). Da segunda passada deixa de valer a lista de quem ganha nome na `v4`. Abaixo, só o que é novo.

- `v4`, GEO-14: a linha do anel quebra em duas no canvas `quadrado` (`2,5% do` e, embaixo, `vídeo)`), e o plano caiu de 191 para 154 px de altura, 19% menos. Uma menção no vídeo (2,5 p.p.) passou de 11,9 para 9,6 px, para discos de 8 px. Uma linha só, com texto mais curto, ou o canvas `alto` devolveria a altura.
- `v4`, quem ganha nome: com o plano mais baixo, os 10 nomes são as posições 1, 2, 3, 4, 6, 7, 13, 17, 19 e 24 da ordem de diferença. `estoque` (8º) perdeu o nome e `proposta` (24º) voltou a ter; ficam sem nome `pagamento` (5º), do 8º ao 12º (`estoque`, `condição`, `crédito`, `objeção` e `upgrade`) e `boleto`. Todo nome tem o dono como ponto mais próximo: dono a 7,9 a 9,3 px, vizinho a 11,2 px ou mais, menor folga de 2,9 px em `concorrente`.
- `v4`, DAD-5: o corpo escreve `1 menção` e a frase acessível `uma menção`, e só o corpo traz as posições do anel (0,25% e 2,5%). Calcular o trecho uma vez e usar nos dois lugares.
- `v4`, marcador único com dado real: termo com 2 e 1, 0 e 1 ou 1 e 0 menções cai a 2,2, 2,2 e 9,6 px do centro do anel (raio de 8 px), dentro ou sobre ele, e se lê como parte do agregado. A nota do `meta.json` declara que o `data.ts` foi escolhido para ninguém cair ali; o componente não trata o caso ao colar no Farol.
- `v4`, diagonal: passa a 8,0 px do centro do anel, dentro do traço dele (7,25 a 8,75 px), e tangencia o anel embaixo, à direita. Os dois continuam legíveis.
- `v4`, estado vazio: o texto `sem anotações nos dois grupos` sai também quando só um grupo tem zero anotações e quando a lista de termos vem vazia com anotações nos dois. Nenhum dos casos aparece no preview.
