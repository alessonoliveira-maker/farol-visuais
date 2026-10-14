# Funil empilhado por composição

## O que é

Cada etapa do funil vira uma barra horizontal dividida pelas categorias de um atributo do lead
(origem, campanha): o comprimento total da barra é o volume da etapa e cada segmento é quanto
daquele volume pertence a cada categoria. Lido em volume, mostra onde cada categoria se perde;
lido em 100%, mostra quem sobrevive até o ganho. "Sem origem" ou "Sem campanha" é cobertura de
dado, não uma categoria de verdade, e por isso fica sempre em contorno neutro, separada e no fim
da pilha.

## Quando usar

- Marketing perguntando quais origens de lead sobrevivem até agenda e ganho, com até 6 categorias
  nomeadas mais a categoria de lacuna, em 3 a 6 etapas.
- Alternar entre volume (onde se perde) e 100% (quem sobrevive), com o modo escrito no título de
  quem cola o gráfico.
- Cauda longa de campanhas ou canais, agrupando as menores numa fatia só e mantendo a lacuna de
  cobertura separada.

## Quando evitar

- Mais de 6 categorias sem agrupar a cauda: agrupar em "Outras" ou usar a família
  `14_tabelas-visuais`.
- Caminhos que se ramificam entre etapas, em que uma pessoa pode pular etapa ou passar por mais de
  um caminho: usar o `11_fluxo-sankey/02_sankey-multietapa`.
- Comparar o mix do fundo com o do topo quando a cobertura de origem muda entre etapas, sem avisar
  o viés de preenchimento (a `v4` existe exatamente para isso).
- Uma etapa só: usar a barra 100% da família `06_barras-empilhadas-e-100` ou o waffle da família
  `22_unidades-waffle-e-pictograma`.

## Anatomia

1. **Barra por etapa**, proporcional ao volume, no eixo categórico vertical (`YAxis type="category"`).
2. **Segmento por categoria**, `Bar stackId="mix"` por categoria, cor fixa por slot (`--chart-1` a
   `--chart-6` na ordem 1, 3, 6, 5, 2, 4 da COR-8). Quando a categoria não é o essencial da
   mensagem (o caso da `v4`, que fala de cobertura e não de mix), as categorias somam num tom
   neutro só (`--line-strong`) em vez de seis cores sem legenda (ROT-4).
3. **Categoria de lacuna** ("Sem origem", "Sem campanha") em contorno `--text-muted` sem
   preenchimento (`fill="none" stroke="var(--text-muted)"`), sempre por último na pilha e fora do
   teto de 6 cores.
4. **Total absoluto da etapa**, escrito na ponta livre da pilha inteira (`LabelList` no último
   segmento, que é sempre a lacuna).
5. **Legenda com amostra na forma da marca**, na ordem visual da pilha, esquerda para direita.
6. **Dica** (`ChartTooltip`) com o valor absoluto de cada categoria, porque o eixo de valor sai
   quando o total já está escrito na ponta (ROT-2).

## Versões

- [`v1_origem-do-lead-ao-ganho-em-volume`](./v1_origem-do-lead-ao-ganho-em-volume/) ([preview](./v1_origem-do-lead-ao-ganho-em-volume/preview.svg)): leads de 2026-08 por origem, do Lead ao Ganho, em volume absoluto. Demonstra o `BarChart` vertical com uma `Bar stackId="mix"` por categoria, a lacuna sempre em contorno e no fim, e o total da etapa escrito na ponta da pilha.
- [`v2_mix-em-100-com-indicacao-em-destaque`](./v2_mix-em-100-com-indicacao-em-destaque/) ([preview](./v2_mix-em-100-com-indicacao-em-destaque/preview.svg)): mesma base em 100%, com indicação em cor cheia e as demais origens atenuadas. Demonstra `stackOffset="expand"`, o percentual por categoria somando 100 pelo maior resto (NUM-2) na legenda com valor, a dica com o valor absoluto (não só a fração) e o total de leads da etapa escrito na ponta, com `MARGIN.right` reservado pelo rótulo mais longo do dado fixo (correção de 2026-09-19, ESP-3).
- [`v3_cauda-longa-de-campanhas-agrupada`](./v3_cauda-longa-de-campanhas-agrupada/) ([preview](./v3_cauda-longa-de-campanhas-agrupada/preview.svg)): 14 campanhas ativas de 2026-08, as 5 maiores em leads nomeadas e as outras 9 agrupadas numa fatia só. Demonstra o agrupamento calculado no componente a partir do volume de entrada, o teto de 6 cores categóricas mais a lacuna, e a dica que nomeia as campanhas que compõem a fatia da cauda.
- [`v4_sem-origem-cai-ao-longo-do-funil`](./v4_sem-origem-cai-ao-longo-do-funil/) ([preview](./v4_sem-origem-cai-ao-longo-do-funil/preview.svg)): mesma base em volume, com o foco na cobertura: 28% dos leads chegam sem origem e só 6% dos ganhos. Demonstra o percentual da lacuna escrito em cada etapa, a cobertura de origem junto do rótulo da categoria, e o aviso de viés de preenchimento na linha de leitura; a parte com origem soma as seis categorias num tom neutro só (`--line-strong`, papel Neutro de dado da 17.2), sem cor por categoria, porque seis cores sem legenda não eram identificáveis na imagem (correção de 2026-09-19, ROT-4); a dica continua trazendo o valor de cada origem.

## Como colar no Farol

1. Escolha volume (`v1`, `v3`, `v4`) quando a pergunta for "onde se perde volume", e 100% (`v2`)
   quando for "que mistura sobrevive"; nunca troque de modo no meio de uma mesma página sem dizer
   isso no título.
2. Ao ligar o dado real, mantenha a ordem de processo no array de etapas (a ordem é a informação,
   como no `01_funil-em-barras-com-taxa-de-passo`) e uma chave estável por categoria, para a cor
   de cada uma não mudar quando o recorte muda (COR-3).
3. Para a cauda longa (`v3`), passe a lista completa de categorias com sua metaínformação
   (`campaigns`) e deixe o componente recalcular o agrupamento pelo volume da primeira etapa do
   recorte; não agrupe fora do componente, ou a dica perde a lista de quem compõe "Outras".
4. Se a cobertura de origem mudar muito entre etapas (o caso da `v4`), não conclua qual origem
   "venceu" sem antes checar essa cobertura: o viés de preenchimento é o motivo de a `v4` existir.

## Referências

- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): barras empilhadas e proporcionais na categoria parte do todo.
- [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide): barras empilhadas como alternativa mais legível para partes.
- [Towards Data Science, funnel visualizations](https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/): o funil em rosca só aguenta dois ou três grupos, argumento para barras.
- [Behance, busca "funnel chart dashboard"](https://www.behance.net/search/projects/funnel%20chart%20dashboard): varredura de composições.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19, sobre os PNGs dos dois temas em `_render/.qa/`._

- `v1`: nas etapas do fundo (Proposta e Ganho) cada segmento fica com poucos pixels e a mistura só
  se lê pela dica; é o custo esperado do modo volume, e a `v2` é quem responde "que mistura".
- `v1`, `v2` e `v3`: `VALUE_LABEL_GAP = 8` onde a tabela da 17.7 pede 6 px entre o rótulo e a ponta
  da barra; não muda a leitura.
- `v2`: a legenda lateral imprime o percentual e a contagem da última etapa sem nomear a etapa; só
  a categoria em destaque fica ancorada, pela linha de leitura.
- `v2`: as marcas atenuadas em 35% medem de 1,6:1 a 2,3:1 contra o cartão, abaixo do piso de marca
  da ACE-3; quem sustenta a leitura é o valor escrito ao lado na legenda.
- `v2`: a legenda escreve 41% e a linha de leitura 41,2% para o mesmo número, por precisões
  diferentes da NUM-1 (composição inteira contra taxa com uma casa).
- `v3`: a dica nomeia a cauda pelos ids das campanhas (`F, G, H...`) e não pelos nomes; com 9
  campanhas agrupadas a linha da dica fica longa.
- `v3` e `v4`: a linha de leitura usa `truncate`, então em cartão estreito ela sai por reticências
  em vez de quebrar.
- `v4`: o catálogo descreve a faixa de lacuna como hachurada e a versão usa o contorno neutro da
  17.2; o desvio está declarado no `notes` do `meta.json`, que é o tratamento correto.

_Segunda leitura de 2026-09-19, revisor independente, sobre os mesmos PNGs e o `npm run check` limpo
nas quatro versões._

- `v3`: o preenchimento vem do posto (`rank0` a `rank4`) sobre a lista ordenada pelo volume da
  entrada, que é o arranjo que a COR-3 desaconselha; dentro do gráfico a leitura se sustenta, porque
  a legenda nomeia cada cor e a campanha guarda a mesma cor nas cinco etapas, mas a mesma campanha
  troca de cor quando o recorte muda. Caminho natural: um `slot` fixo em `CampaignMeta`.
- `v1`, `v3` e `v4`: `maxBarSize` recebe o `ROW_STEP` (48 e 44), acima do teto de 24 que a ESP-2 cita
  para cartão; a espessura medida no PNG fica em 15 e 14 px, dentro do piso, e o rótulo mora fora da
  marca, então o teto declarado descreve a intenção e não o desenho.
- `v2`: o vazio da coluna de percentual é o sinal de traço em vez de `formatUnavailable()` da EST-4;
  o ramo é inalcançável, porque o estado vazio já sai antes com `role="status"`.
- `v2`: o destaque de indicação vive da cor cheia contra as atenuadas, e o segundo canal da COR-2 é a
  linha de leitura mais o valor na legenda, não o peso da marca.

## Correções de 2026-09-19 (rodada de revisão)

- `v2`: `MARGIN.right` subiu de 68 para 100 px; o rótulo `1.240 leads` (o mais longo do dado fixo)
  encostava e cortava na borda direita do corpo do gráfico nos dois temas (ESP-3). Verificado nos
  PNGs de `_render/.qa/` dos dois temas: o rótulo agora sobra respiro antes da legenda.
- `v4`: as seis origens coloridas sem legenda e sem rótulo direto viravam série não identificável
  na imagem (ROT-4). Como o essencial desta versão é a cobertura (quanto chega sem origem), não o
  mix por origem, a correção segue a segunda opção do parecer: as seis categorias somam agora numa
  faixa neutra só (`--line-strong`, papel Neutro de dado da 17.2) em vez de seis cores; a dica
  continua trazendo o valor de cada origem para quem quiser o detalhe, o que também resolve o
  apontamento de que a identidade das categorias só existia na dica (DIC-1): sem cor por
  categoria no visual, não há identidade implícita que precise ser "levada" para fora dela.
- `v4`: de passagem, `TAIL_LINE_GAP` foi de 7 para 8 px, um múltiplo de 2 (ESP-1); mudança
  cosmética, sem risco, feita porque já se mexia no mesmo bloco de renderização.
- Nenhum apontamento desta rodada foi contestado; os dois problemas bloqueantes têm correção
  direta na causa, sem depender de leitura alternativa do contrato.
