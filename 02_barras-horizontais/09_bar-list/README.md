# Bar list

## O que é

Lista compacta em que cada linha é ao mesmo tempo rótulo, barra de fundo proporcional e número à
direita. Não é um gráfico com eixo: é uma tabela em que a barra vive atrás do texto. Um `div` por
linha com a barra em posição absoluta, opacidade baixa e largura em percentual do maior valor da
lista, o nome por cima e o valor numa coluna tabular à direita. Nenhum SVG e nenhum Recharts; toda
a peça é HTML com Tailwind. A normalização pelo maior valor da lista fica sempre explícita, porque
sem eixo o leitor não sabe contra o que a barra mede, e o número escrito é a única leitura precisa.

## Quando usar

- Top N compacto dentro de card: origens de lead, campanhas, criativos, termos citados.
- De 3 a cerca de 15 linhas, com nome que pode virar link para o detalhe.
- Densidade importa mais que precisão de eixo, e o número exato vai escrito em toda linha.
- Card estreito, de 320 px em diante, em que um `BarChart` com eixo de categoria truncaria os nomes.

## Quando evitar

- Comparação precisa entre valores próximos: barras simples ordenadas com escala (`01_barras-simples-ordenadas`).
- Valores negativos: a lista assume magnitudes não negativas; use barras divergentes de sinal (`06_barras-divergentes`).
- Várias colunas numéricas por linha com ordenação: tabela com barras inline (`14_tabelas-visuais`).
- Ocupação contra um teto real: barras com trilho (`13_progresso-meta-e-gauge`).
- Mais de 15 linhas sem cauda agregada: a lista vira rolagem e perde o ranking.

## Anatomia

1. Linha de altura fixa (28 px numa linha, 46 px quando o nome quebra em duas) com o nome à
   esquerda e o valor tabular à direita, sempre pelos formatadores do Farol.
2. Barra de fundo em `div` `absolute inset-y-0 left-0`, largura em percentual do maior valor da
   lista, cor por token com opacidade baixa (`bg-chart-1/18` a `/25`), nunca hexadecimal.
3. Normalização sempre pelo maior valor da própria lista, nunca por um total ou teto arbitrário;
   quando a peça demonstra isso, uma nota de rodapé em `--text-muted` diz contra o que a barra mede.
4. Nome de item nunca some por reticência (`TIP-7`): nome longo quebra em duas linhas e a altura da
   linha se ajusta, em vez de truncar.
5. Destaque por regra de dado (campanha em foco, item pausado, termo sem classificação) muda a cor
   da barra e o peso do nome ao mesmo tempo, nunca só a cor (`COR-2`, `ACE-2`).
6. Estado de fronteira tratado por regra: recorte sem linhas troca a lista inteira por um bloco
   `role="status"` com o ícone `Filter` (`EST-1`).
7. Raiz com `role="table"`, cada linha `role="row"`, o nome como `role="rowheader"` e o valor como
   `role="cell"`, e `aria-label` na raiz com a frase calculada do dado (seção 11 do CONTRATO).

## Versões

- `v1_top-origens-do-mes`: top 5 origens de lead do mês num card estreito. Demonstra a barra de
  fundo em `div` absoluta com largura em percentual do maior valor, a linha de altura fixa com nome
  e contagem, a barra distinguível do cartão no tema escuro e a nota de rodapé explicando contra o
  que a barra mede.
- `v2_campanhas-com-link-e-destaque`: top 8 campanhas com o nome como link e uma campanha em foco.
  Demonstra o link com foco visível por teclado, a campanha em foco na cor de destaque contra as
  demais em neutro, o estado de foco vindo de uma prop externa (não guardado na linha) e o nome
  longo em duas linhas sem reticência, com a altura da linha ajustada.
- `v3_criativos-com-leads-e-cpl`: top 10 criativos por leads qualificados, com o custo por lead numa
  segunda barra fina abaixo da principal. Demonstra os dois números por linha, o criativo pausado em
  neutro com etiqueta própria (não só cor) e o percentual do total ao lado da contagem, somando 100
  pelo método do maior resto.
- `v4_termos-com-cauda-agregada`: termos citados nos motivos de perda, com a cauda longa somada numa
  linha final. Demonstra a contagem por documento (não por ocorrência), a linha "Outros N termos"
  fora da ordenação e separada só por espaço (nunca por borda, `ESP-5`), o termo de mais de 60
  caracteres em duas linhas sem reticência, e o termo sem classificação de motivo em contorno
  tracejado com o rótulo "sem classificação" ao lado do nome.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para uma pasta de visual da página, por exemplo
   `app/src/pages/<pagina>/visuals/BarList/`.
2. Troque o `import` do `./data` pelo seletor real da página e passe `data` (e `highlightId`, quando
   a versão expuser) pelas props; o default do `data.ts` fica só como amostra do catálogo.
3. Se a versão usa link por linha (`v2`), troque o `href="#id"` de âncora do catálogo pela rota real
   do detalhe (campanha, criativo, termo) da página.
4. Ponha o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-64">`
   ou maior, seguindo o `canvas` sugerido) ou passe `height`.
5. Troque o bloco de estado vazio inline pelo `EmptyState` do Farol, mantendo o mesmo texto
   (seção 16 do CONTRATO).
6. Rode `npm run typecheck` e `npm run lint` no `app/` e confira nos dois temas e a 390 px de largura.

## Referências

- [Tremor, BarList](https://www.tremor.so/docs/visualizations/barlist): `sortOrder`, `valueFormatter`,
  `onValueChange`, `href` no item, a largura mínima da barra e o fato de a barra ser HTML, não SVG.
- [Tremor NPM, Data Bars](https://npm.tremor.so/docs/visualizations/data-bars): a barra dentro de
  linha de tabela, o mesmo desenho em outra densidade.
- [Storytelling with Data, what is a bar chart](https://www.storytellingwithdata.com/blog/2020/2/19/what-is-a-bar-chart):
  por que o número ao lado da barra não é redundância quando não há eixo.
- [shadcn, chart-bar-horizontal.tsx](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-bar-horizontal.tsx):
  o contraste com a bar list; lá há eixo e escala, aqui não, e a escolha é precisão contra densidade.
- [From Data to Viz, Word cloud](https://www.data-to-viz.com/graph/wordcloud.html): a lista de termos
  com barras (`v4`) como alternativa recomendada à nuvem de palavras.
- [Datawrapper Academy, How to add bar charts to tables](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables):
  base zero, faixa máxima fixa e cor separada para negativos.
- Farol: `app/src/components/visuals/charts/BarsChart.tsx`, para contraste com a versão que tem eixo.

## Pendências conhecidas

- O termo sem classificação (`v4`) sai com contorno tracejado em `--text-muted`, e não com a barra
  hachurada literal que o catálogo descreve: `COR-9` proíbe textura decorativa em marca e fundo, e o
  contorno sem preenchimento é exatamente o desenho que a seção 17.2 já reserva ao papel "Ausência".
  Registrado para quem revisar decidir se o catálogo deve ser reescrito ou se o contorno fica como a
  leitura válida de "hachurada" neste contrato.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18. As quatro versões passaram sem bloqueante na releitura do fim do dia, feita
depois das correções registradas mais abaixo; o que segue nesta lista não reprova nenhuma delas._

- `v1`: o dado só tem nome curto, valor plausível e nenhuma categoria de ausência, então não
  exercita o caso difícil que a seção 3 do CONTRATO pede (nome longo, valor pequeno, ausência).
- `v1`: o nome sai com `whitespace-nowrap` sem corte, o que contraria a anatomia item 4: com um nome
  longo a linha transborda em vez de quebrar em duas.
- `v2`: as linhas têm `role="row"` sem `rowheader` nem `cell`, ao contrário da anatomia item 7; o
  leitor de tela só recebe a frase da raiz.
- `v2`: a altura da linha vem da contagem de caracteres do nome, não da quebra medida, então a mesma
  regra pode deixar vão morto num card largo e apertar duas linhas de texto num card estreito.
- `v2`: sem nota de rodapé dizendo contra o que a barra mede, embora o "O que é" do modelo diga que a
  normalização fica sempre explícita.
- `v3`: a etiqueta "pausado" repete em palavra o que a cor já diz, e fica a 11 px, no piso da 17.1;
  ela resolve a `ACE-2`, mas ganharia em ir junto do número, onde o olho já para.
- `v4`: o rótulo "sem classificação" fica em `--text-muted` a 11 px ao lado do nome, no limite de
  leitura declarado pela 17.1.
- `v2`: no canvas `card` de 640 px o nome longo cabe numa linha só, então o preview mostra a linha
  mais alta com vão morto em vez da quebra em duas linhas que o catálogo declara demonstrar; a
  quebra só aparece no card estreito de 320 a 390 px que o modelo tem como alvo.
- `v3`: mesmo ponto da `v2` com o limiar de 40 caracteres; o `cr8`, criado para exercitar a quebra,
  sai numa linha só no canvas de 640 px, e a altura extra que o `meta.json` justifica fica sobrando.
- `v3`: a barra fina de CPL tem sentido invertido em relação à principal, e só a nota de rodapé
  segura essa leitura; quem olha rápido tende a ler barra maior como resultado melhor.
- `v4`: o catálogo pede barra hachurada para o termo sem classificação e a versão entrega contorno
  tracejado, desvio já justificado em Pendências conhecidas pela `COR-9`; quem mantém o catálogo
  decide se o texto dele muda.
- `v4`: a nota de rodapé diz que a barra mede contra o maior termo classificado, mas o `max` do
  código considera todos os termos; hoje os dois coincidem, com outro dado podem divergir.
- `v4`: as linhas têm `role="row"` sem `rowheader` nem `cell`, mesma ressalva já registrada na `v2`,
  enquanto a `v1` e a `v3` seguem a anatomia item 7.

### Correções da rodada de 2026-09-18

- `v3`: o nome do criativo pausado saía em `text-muted` sobre a própria barra `bg-text-muted/15`
  (4,23:1 no escuro, 4,42:1 no claro, abaixo do piso 4,5:1 da `ACE-3`); passou a `text-secondary`,
  que mede 8,16:1 e 8,13:1 (`ACE-3`, `ACE-8`).
- `v3`: ganhou a nota de rodapé que faltava, dizendo contra o que cada barra mede e avisando que o
  sentido da barra de CPL é invertido em relação à principal.
- `v4`: a linha "Outros N termos" tinha barra própria e `tailDocumentCount` entrava no `max` da
  normalização, o que dava posição na escala a um agregado que o catálogo declara fora do domínio
  das barras (checklist 1 e 25); a barra da cauda saiu e o `max` passou a considerar só os termos
  ranqueados.
- `v4`: o número dentro de "Outros 23 termos" saía em Manrope sem `tabular-nums`; ganhou a classe
  (`TIP-1`).
- `v4`: a nota de rodapé passou a dizer contra o que a barra mede e que a cauda fica fora da escala.
- `v3`: o nome do criativo saía com `whitespace-nowrap`, mesma ressalva já registrada na `v1`; a
  linha 4 da Anatomia pede quebra em duas linhas, não corte. Passou a `whitespace-normal` com altura
  de linha maior quando o nome ultrapassa 40 caracteres, no padrão que a `v4` já usava para o termo
  longo. O `data.ts` ganhou um nome de 66 caracteres (`cr8`) para exercitar o ramo, em vez de deixar
  o caso difícil só no código sem prova no preview (padrão P7 do estudo acumulado).
- `v3` (correção de 2026-10-14): o limiar de 40 caracteres saiu; a barra principal tem altura mínima
  de 22 px e cresce pela quebra real do nome (o cr8 fica com 22 px a 640 px). Contagem e percentual
  passaram a `text-secondary`, com hierarquia pelo peso. Canvas refeito para 640x590.

### Revisão de 2026-10-14 (`v3`, revisão desatualizada pela troca do trilho de CPL)

_A `v3` foi reprovada nesta data por dois bloqueantes, descritos em
`validation/revisao_02_barras-horizontais__09_bar-list_2026-10-14.md`: o percentual do líder em
`--text-muted` sobre a própria barra e a barra de 40 px do cr8 sem quebra de nome. A observação de
2026-09-18 sobre o cr8, acima, virou o segundo bloqueante. O que segue não reprova._

- `v3`: as marcas com opacidade ficam abaixo de 3:1 contra o fundo: a barra principal
  `bg-chart-1/18` mede 1,48 e 1,30, a do pausado `bg-text-muted/15` mede 1,24 e 1,22, e a fina de
  CPL `bg-text-muted/50` mede 2,32 e 1,96 contra o trilho `--surface-sunken`. Passam pela isenção
  da `ACE-3` e da 17.2 porque toda linha escreve o valor junto da marca. A `OPACIDADE-MARCA` só
  enxerga a linha 111 e deixa de fora a barra principal, cuja classe vem da variável `mainBarClass`.
- `v3`: o preview difere da página em 0,52% no claro (0,49% no escuro). A causa é a composição das
  faces de fonte do app, apontada pelo aviso FIDELIDADE do render, e não a versão.
- `v3`: `cpl` é `number` sem `null`, então um criativo sem lead qualificado, que não tem CPL, obriga
  um número inventado. Com todos os valores em zero, `maxLeads` e `maxCpl` zeram e a largura vira
  `NaN%`. O dado padrão não exercita nenhum dos dois casos.
- `v3`: o percentual ao lado da contagem não diz a base na tela (o total de leads qualificados da
  lista). A nota de rodapé explica as barras, mas não o percentual.
- `v3`: a frase acessível diz o líder, mas não o custo, que é metade do caso de uso: o líder também
  tem o menor CPL (R$ 158) e o pausado tem o maior (R$ 410).
- `v3`: a etiqueta "pausado" usa fundo `--surface-overlay`, que no claro é o mesmo branco do cartão.
  Por isso ela aparece como chip no escuro e como palavra solta no claro.
- `v3`: a sigla "CPL" aparece na linha e na nota de rodapé sem ser expandida na tela; o rótulo
  "R$ 158 CPL" também não diz que o custo é por lead qualificado.
- `v3`: `CPL_ROW_HEIGHT = 11` está fora do múltiplo de 2 px da `ESP-1`, sem consequência visível.

### Revisão de 2026-10-14, segunda passada (`v3`, depois da correção)

_A `v3` foi aprovada. Os dois bloqueantes da primeira passada estão resolvidos no arquivo e no PNG:
contagem e percentual em `--text-secondary` (5,53:1 e 6,25:1 sobre a barra do líder) e as dez barras
principais com 22 px nos dois temas, o cr8 inclusive. Preview contra página: 0,33% no escuro e 0,36%
no claro. Seguem valendo as observações da primeira passada sobre marcas com opacidade abaixo de
3:1 (isentas pelo valor escrito), `cpl` sem `null` e `NaN%` com tudo zerado, frase acessível sem o
custo, etiqueta sem chip no claro, sigla CPL e `CPL_ROW_HEIGHT`. O que segue é novo e não reprova._

- `v3`, TIP-4: o percentual leva `font-normal` dentro de `font-display` (linha 102) e pede Space
  Grotesk 400, que não é peso carregado; o navegador desenha em 500, igual à contagem, então a
  hierarquia por peso que o comentário da linha 83 promete não aparece no PNG. O valor de CPL (linha
  110) também usa `font-display` sem peso. Para ter a hierarquia, o percentual vai em Manrope com
  `tabular-nums` e `font-normal`, ou se assume o 500 e o comentário sai.
- `v3`, TIP-6 e ROT-5: contagem e percentual saem num texto só, alinhado à direita, então a coluna
  da contagem anda 7,5 px entre as linhas de percentual com dois algarismos e as de um (x = 947 e
  962 no PNG de 2x). Percentual numa coluna própria, de largura fixa e alinhada à direita, alinha os
  dois números.
- `v3`, EIX-9 latente: o trilho de CPL é `flex-1` ao lado do valor `shrink-0`, então o comprimento
  que vale 100% em cada linha depende da largura do texto daquela linha. Com o dado de hoje todo CPL
  tem três algarismos e o trilho mede o mesmo nas dez linhas; um `R$ 1,2 mil` ao lado de `R$ 410`
  encurta o trilho daquela linha em cerca de 5% e as barras deixam de dividir a escala. Largura fixa
  para a coluna do valor de CPL, numa constante do topo, fecha o caso.
- `v3`: no tema claro a barra do pausado (`bg-text-muted/15`) mede 1,07:1 contra a barra dos demais
  (`bg-chart-1/18`), e 1,20:1 no escuro: a diferença é só de matiz, e quem segura a `ACE-2` é a
  etiqueta. A "barra em cinza" do catálogo existe, mas quase não se vê no claro.
- `v3`: o trilho da barra de CPL sugere um teto, e o "Quando evitar" deste modelo reserva o trilho
  para ocupação contra teto real; o pausado enche o trilho só por ter o maior CPL da lista. A nota de
  rodapé segura a leitura.
- `v3`: o componente não corta em 10 nem agrega cauda, e o percentual é calculado sobre a lista
  recebida. Se a página passar um top 10 já cortado de um conjunto maior, "(18%)" passa a ser a
  parte do top 10, não do total, e nada na tela diz a base.
- `v3`, DAD-9: "no mês" e "no período" existem só na frase acessível; o corpo não diz o recorte
  (aqui o dado não tem data, então o período vem do título do cartão ao colar no Farol).
- `v3`: no cartão estreito de 320 a 390 px, alvo do modelo, todo nome que quebra engrossa a própria
  barra para cerca de 36 px, e a barra ganha tinta pelo tamanho do nome, não pelo dado. Barra de
  22 px presa à primeira linha do texto evitaria o efeito; a 640 px ele não aparece.
- `v3`: `min-h-[22px]` (linha 92) repete `MAIN_BAR_HEIGHT` como literal de classe; se a constante
  mudar, a linha interna não acompanha.
