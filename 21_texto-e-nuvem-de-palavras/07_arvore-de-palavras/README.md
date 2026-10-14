# Árvore de palavras

## O que é

Uma palavra raiz e as sequências de palavras que a seguem (sufixo), que a precedem (prefixo) ou as
duas, ligadas por conectores curvos. O tamanho da fonte de cada nó codifica quantas frases passam
por ele, então os ramos maiores são os jeitos mais comuns de a frase continuar. Lê-se da raiz para
fora. A trie é montada em TypeScript sobre as frases, com chave sem acento e em minúsculas, poda
por contagem mínima e profundidade de 3 palavras; o desenho é SVG puro, determinístico, e sempre
acompanha uma lista textual equivalente para leitor de tela.

## Quando usar

- Explorar o que vem depois ou antes de uma palavra frequente, em 50 a 500 frases.
- Achar as formas comuns de uma objeção começar, como não tenho ou não é o momento.
- Ligar o ramo ao desfecho, acendendo os ramos cujas frases terminaram em perda (v2).
- Oficina de roteiro da pré-vendas, em que a equipe lê as frases em conjunto.
- Até cerca de 11 folhas por lado no cartão; acima disso, suba a contagem mínima da poda.

## Quando evitar

- Raiz com menos de 5 ocorrências: a árvore vira fio. Mostre as frases na concordância KWIC
  (21/03); a v4 faz essa troca sozinha.
- Mais de 200 frases sem poda: fica ilegível. Aplique contagem mínima e profundidade máxima.
- Contagem de termos isolados: a lista de barras de termos (02/09) responde melhor.
- Resumo executivo: a árvore pede exploração. Use a frase com número (21/01).
- Grafias sem normalizar: preço e preco viram ramos separados. Agrupe pela chave sem acento, como
  as quatro versões fazem.

## Anatomia

1. **Trie.** `buildTree` quebra cada frase em palavras, compara pela chave sem acento e em
   minúsculas (`normalizeKey`) e escreve a grafia original mais frequente da chave. Só a primeira
   ocorrência da raiz em cada frase abre caminho, então toda contagem é de frases.
2. **Poda, contador e ordem.** Filho abaixo de `MIN_COUNT` sai, e a nota do rodapé diz quantos
   ramos saíram (`text-text-muted`, 11 px, números por `formatInt`). A mesma nota declara que os
   ramos irmãos vão do mais para o menos frequente, porque a contagem que ordena não está escrita
   nos nós do meio do caminho (GEO-12).
3. **Nó.** Um `<text>` por nó em `--text-secondary` e peso 500; a raiz em `--text-primary`. Cadeia
   sem bifurcação e sem perda de contagem vira um nó só (posso falar agora).
4. **Tamanho da palavra.** `FONT_MAX` vezes a raiz quadrada da parcela das frases da raiz que
   passam pelo nó, com piso de `FONT_MIN`. É a marca do modelo, não tipografia de apoio.
5. **Posição.** Y pelas folhas, uma linha por folha na ordem da contagem, com o pai no meio entre o
   primeiro e o último filho. X pela soma das larguras medidas das palavras do caminho mais o vão
   do nível, que cresce com o espalhamento vertical dos filhos.
6. **Medida de largura.** Canvas 2D com a fonte, o peso e o tamanho reais, só depois que a face
   carregou (`useTextMeasure`, GEO-8); antes disso vale a soma por glifo de `GLYPH_EM`, para mais.
7. **Conector.** Bézier de tangente horizontal nas duas pontas, em `--text-muted` e 1,5 px. Ele
   diz qual palavra segue qual, então é dado e precisa de 3:1 (ACE-6); `--line-strong` não serve.
8. **Contagem na folha.** À direita da folha, em Space Grotesk 11 px e `--text-muted`, com o
   substantivo (`formatInt` mais frase, ligação, anotação ou ocorrência). Na v2 vira a parcela
   perdida por `formatRateWithVolume`.
9. **Linha de leitura.** Uma frase acima do desenho, calculada do dado, com `aria-hidden`, porque
   a frase acessível da raiz diz o mesmo (ANO-5).
10. **Lista equivalente.** `<ul className="sr-only">` com um item por ramo, da raiz à folha, e a
    raiz do componente com `role="figure"` e frase acessível calculada (ACE-1).
11. **Dica.** `<title>` nativo em cada nó, com o que o desenho não escreve: a parcela e a contagem
    dos nós do meio do caminho.
12. **Escala 1.** O `<svg>` declara `width` e `height` iguais ao `viewBox`, e a largura é a do
    corpo do canvas (`VIEW_W`), para os 11 px chegarem à tela com 11 px (GEO-18). Se o dado pedir
    mais largura, o `viewBox` cresce e o desenho encolhe inteiro, sem corte.
13. **Estado vazio.** Raiz sem nenhuma frase desenha um bloco com `role="status"`, ícone `Filter`
    e uma frase em `text-text-muted` (EST-1).

## Versões

- `v1_raiz-nao-nas-objecoes`: árvore de sufixo com raiz não sobre 69 objeções de um mês, 61 delas
  com a raiz. Demonstra a trie com poda por contagem mínima de 3, a profundidade de 3 palavras, a
  fonte pela frequência, o conector bézier com o pai centralizado nas folhas e a lista textual
  equivalente. Previews: [preview.svg](./v1_raiz-nao-nas-objecoes/preview.svg) (escuro) e
  [preview-claro.svg](./v1_raiz-nao-nas-objecoes/preview-claro.svg) (claro).
- `v2_ramos-que-levam-a-perda`: a mesma árvore com o desfecho no fim de cada ramo. Demonstra a
  parcela perdida por `formatRateWithVolume`, o destaque de até dois ramos com maioria perdida e
  volume (folha em `--chart-1` e peso 700, conector mais grosso da raiz à folha) e a regra de
  destaque escrita na nota. Previews: [preview.svg](./v2_ramos-que-levam-a-perda/preview.svg)
  (escuro) e [preview-claro.svg](./v2_ramos-que-levam-a-perda/preview-claro.svg) (claro).
- `v3_arvore-dupla-com-raiz-preco`: prefixo à esquerda e sufixo à direita da raiz preço, sobre 500
  anotações. Demonstra as duas tries com larguras medidas, a chave que junta preço, preco e Preço,
  a poda por contagem mínima de 8 com contador de ramos omitidos e o clique numa palavra, que refaz
  a árvore com ela como raiz. Previews: [preview.svg](./v3_arvore-dupla-com-raiz-preco/preview.svg)
  (escuro) e [preview-claro.svg](./v3_arvore-dupla-com-raiz-preco/preview-claro.svg) (claro).
- `v4_raiz-rara-vira-concordancia`: raiz garantia com 4 ocorrências em 82 respostas. Demonstra a
  troca da árvore pela concordância abaixo de 5 ocorrências, o aviso com a contagem e o limite, o
  estado vazio com `role="status"` e a função única que decide entre os três caminhos
  (`chooseView`). Previews: [preview.svg](./v4_raiz-rara-vira-concordancia/preview.svg) (escuro) e
  [preview-claro.svg](./v4_raiz-rara-vira-concordancia/preview-claro.svg) (claro).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão. A prop `data` é uma lista de textos distintos com a
   contagem de cada um (`text` e `count`; na v2, `calls` e `lost`), e `rootWord` é a raiz.
2. Agregue as frases iguais antes de passar o dado: a peça soma a contagem, não deduplica texto
   com espaço ou pontuação diferente.
3. Ajuste `MIN_COUNT` ao volume: 3 serve a dezenas de frases e 8 serve a centenas. O teto prático
   é de 11 folhas por lado; a nota do rodapé diz quantos ramos a poda tirou.
4. `VIEW_W` é a largura do corpo do cartão de destino. Mudou a largura do cartão, mude `VIEW_W`
   junto, senão o desenho escala e o texto deixa de chegar no tamanho declarado.
5. A altura do desenho sai das folhas (`ROW_MIN` por folha). O cartão precisa dar essa altura mais
   a linha de leitura e a nota; a conta de cada versão está no `notes` do `meta.json`.
6. Na v2, a regra de destaque mora em três constantes: `MAJORITY_SHARE`, `MIN_HIGHLIGHT_VOLUME` e
   `MAX_HIGHLIGHTS`. Mudou a regra, a nota do rodapé muda sozinha.
7. Na v3, o estado da raiz escolhida fica no componente (`picked`). Para a página saber qual raiz
   está ativa, leve esse estado para fora por uma prop controlada.
8. Na v4, `TREE_MIN_OCCURRENCES` é o limite da troca. Se a página já tem a concordância KWIC
   (21/03), prefira renderizá-la no lugar do caminho interno de concordância.
9. Embrulhe em `VisualCard` e troque o estado vazio inline por `EmptyState` (seção 16 do
   CONTRATO, passos 5 e 7).

## Referências

- Wattenberg e Viégas, The Word Tree, an Interactive Visual Concordance, IEEE Transactions on
  Visualization and Computer Graphics, 2008: a técnica, a fonte pela frequência e a fusão de
  cadeias sem bifurcação.
- [Google Charts, Word Trees](https://developers.google.com/chart/interactive/docs/gallery/wordtree):
  árvore de sufixo, de prefixo e dupla, e o clique que troca a raiz.
- No Farol não há componente equivalente. Os tokens vêm de `app/src/styles/tokens.css` e os
  formatadores de `app/src/lib/format.ts`.
- Vizinhos na família: concordância KWIC (`21_texto-e-nuvem-de-palavras/03_concordancia-kwic`),
  para raiz rara, e nuvem de palavras (`04_nuvem-de-palavras`), de onde vem a mesma leitura da
  TIP-2: tamanho de palavra que codifica frequência é marca, e o texto de apoio fica em 12 e 11 px.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13: as quatro versões aprovadas, sem bloqueante. O `check` saiu com 0 erros e 0 avisos e o render mediu de 0,00% a 0,09% de diferença nos oito PNGs. Foi medido à mão o que as guardas não alcançam: as contagens, a poda e as parcelas de cada ramo contra o `data.ts`, a fonte de cada nó contra a raiz quadrada da parcela, o contraste do conector (`--text-muted`, 5,21:1 no escuro e 5,37:1 no claro) e o par marca contra marca do destaque da `v2`. Nenhum item abaixo muda o que o desenho afirma com o dado publicado; o próximo agente que tocar o arquivo alinha.

- `v2` e `v3`, tamanho da palavra sem declaração: a nota do rodapé não diz o que o tamanho codifica, e a `v1` e o caminho de árvore da `v4` dizem. Na `v2` pesa mais, porque as 10 folhas estão no piso de 13 px e o tamanho só varia em nó sem número (`tenho`, `é`, `orçamento`, `temos`): num cartão sobre perda, palavra maior pode ser lida como perda maior. Acrescentar `Tamanho da palavra pela raiz quadrada das ligações` (ou `das anotações`, na `v3`).
- `v2`, recorte só na frase acessível (DAD-9): `91 ligações de jul/26 a set/26` existe no `aria-label` e na dica da raiz, e o corpo não escreve nem o período nem o total. A linha de leitura ou a nota pode levar os dois.
- `v1`, `v2` e caminho de árvore da `v4`, piso de 13 px não declarado: a nota diz raiz quadrada e cala o piso. Folha no piso tem o número escrito; nó do meio no piso, não. Na `v1`, `prioridade` (5 frases, 8,2% das frases) e `tempo` (7 frases, 11,5%) saem com 13 px, que é 13,0% da área da raiz, e na `v2`, `tempo` (9 ligações, 9,9%) também. A contagem deles só existe na dica. Declarar o piso na nota, ou escrever a contagem do nó do meio que cai nele.
- `v2`, par marca contra marca fora do `notes` (TOK-9): medido nesta revisão, `--chart-1` contra `--text-secondary` dá 1,16:1 no escuro e 1,35:1 no claro no texto, e `--chart-1` contra `--text-muted` dá 1,82:1 e 1,12:1 no conector. O destaque se sustenta pelo peso 700 contra 500, pelo traço de 3 px contra 1,5 px e pela linha de leitura, não pela luminância. Escrever os números no `notes`.
- `v2`, regra de destaque na nota: `em até 2 ramos` não diz quem fica quando mais de dois passam (o código escolhe a maior parcela e, no empate, o ramo com mais ligações). Com o dado publicado passam exatamente dois.
- `v3`, estado depois da troca de raiz: o clique, o teclado e o botão de voltar não aparecem no preview e foram conferidos por leitura de código, com a raiz `concorrente` simulada à mão (116 de 500 anotações, 5 folhas). Defeito latente: com `picked` ativo, se `data` mudar para um recorte sem a palavra escolhida, o estado vazio cita a raiz inicial (`Nenhuma anotação com preço`), o que pode ser falso, e não oferece o botão de voltar. Voltar à raiz inicial quando a palavra escolhida some do dado resolve.
- `v3`, dica da raiz: escreve contagem sem substantivo (`Abre o texto em 20 e fecha em 0`, `preço 166, preco 14, Preço 14`; NUM-6), e as 20 anotações em que a raiz abre o texto, que explicam por que as folhas da esquerda somam 169 e não 194 (há mais 5 podadas), só existem nela.
- `v4`, cobertura: o preview fotografa só a concordância, que é o caminho do dado publicado. A árvore (`rootWord="prazo"`, 27 ocorrências, 4 folhas, cerca de 500 x 119 px pela conta à mão) e o estado vazio (`rootWord="frete"`) não foram renderizados nem medidos por guarda; foram conferidos por leitura de código. O aviso ocupa duas linhas no preset `card`, sem corte (a ANO-5 pede uma linha para a linha de leitura).
- As quatro, acabamento sem consequência visível: `CONNECTOR_PAD` de 5 px fora do múltiplo de 2 da ESP-1; peso 500 e 600 da contagem escrito direto no JSX, sem constante nomeada; e o período da linha de leitura (`ago/26`, `jul/26 a set/26`, `2026`) fora do `tabular-nums` (TIP-1).
