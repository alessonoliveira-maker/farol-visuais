# Catálogo VISUAIS do Farol

> Índice mestre do catálogo. Atualizado em 2026-10-15. Todo dado do catálogo é fictício e fixo: nenhum nome de pessoa, empresa, documento ou contato é real. Para trabalhar no catálogo, comece por [CLAUDE.md](CLAUDE.md); para operar a produção ou a manutenção, por [_operacao/ORQUESTRADOR.md](_operacao/ORQUESTRADOR.md).

## Propósito

O catálogo é o mostruário de visuais do Farol para **copiar e colar**. Cada versão é um componente React pronto, desenhado com os tokens e os formatadores do próprio Farol, com dado fictício fixo e um `preview.svg` que é o retrato daquele exato código. Ele existe para três coisas:

1. **Escolher a forma certa** para a pergunta de uma tela: cada modelo escreve quando usar, quando evitar e qual é a alternativa.
2. **Colar sem limpeza:** o `Chart.tsx` sai daqui e entra no Farol como código de produção; nada de catálogo mora nele.
3. **Manter o mesmo acabamento em todas as telas:** tipografia, cor por token, eixos, rótulos, estados de ausência e acessibilidade seguem um contrato único, verificado por ferramenta.

Stack: React 18.3, TypeScript estrito, Recharts 3.10, Tailwind 4 e lucide-react. O que o Recharts não desenha vira SVG puro em React com geometria calculada em TypeScript, ou HTML com Tailwind; nenhuma outra biblioteca de gráfico entra.

## Estado

O estado vivo (números, o que funciona, bloqueios) está em [STATUS.md](STATUS.md) e sai de `node _operacao/fila.mjs --resumo`; os números que este índice traz (o parágrafo abaixo e a tabela de famílias) são **datados**, e o STATUS manda quando divergirem. O plano do catálogo está fechado em [`_estudo/catalogo.json`](_estudo/catalogo.json), os 27 READMEs de família estão escritos, os moldes da ferramenta são 3 em [`_render/exemplos/`](_render/exemplos/), e `npm run dossie -- <familia>/<modelo>` gera a leitura única de quem produz. A [galeria](galeria.html) (`npm run galeria`, fora do git) mostra cada versão com o **veredito** ao lado do estado do preview (`aprovada` ou `reprovada, pendência conhecida`, desde 2026-10-15); quem cola no Farol só usa versão aprovada, e `npm run lint -- <familia>/<modelo>` diz antes o que o lint do Farol vai cobrar.

**A contagem tem quatro respostas verdadeiras e elas não são intercambiáveis.** Na medição de 2026-10-15
(`npm run pendencias` com tipos): versões planejadas no catálogo (814), versões com pasta e `Chart.tsx` no
disco (814), versões com todas as pendências fechadas (784, que é o `prontas` do `pendencias`, e desconta
quem espera veredito ou ficou reprovado) e modelos completos (205). Que duas delas hoje coincidam não as
torna a mesma pergunta. Antes de citar um número, diga qual dos quatro é e de que data.

## Como navegar

O catálogo tem quatro níveis: família, modelo, versão e, dentro da versão, os arquivos.

```
VISUAIS/
  CLAUDE.md                 identidade do nível e regra de leitura por papel
  STATUS.md  PLAN.md        estado vivo e fila de trabalho (protocolo CONVENTIONS)
  README.md                 este índice
  CONTRATO.md               regras de autoria
  CHECKLIST_REVISAO.md      perguntas de revisão por versão
  ARMADILHAS.md             armadilhas da stack por código, e as dez perguntas de autorrevisão
  PRODUCAO.md               diário de auditoria do dono; não é leitura de produtor
  galeria.html              página navegável, gerada
  _operacao/                kit de operação: ORQUESTRADOR, fila.json, fila.mjs, decisões, LOG
  _render/                  ferramenta de render, checagem e galeria
  _estudo/                  pesquisa e plano (não é catálogo)
  validation/               pareceres de revisão e notas de ferramenta
  <NN_familia>/
    README.md
    <NN_modelo>/
      README.md
      <vN_versao>/
        Chart.tsx
        data.ts
        meta.json
        preview.svg
        preview-claro.svg   opcional
```

Exemplo de caminho completo: `02_barras-horizontais/01_barras-simples-ordenadas/v1_receita-por-executivo/Chart.tsx`.

1. **Família** (`NN_slug`, na raiz): agrupa os visuais pela relação que o dado tem, como ranking, tempo, parte do todo, distribuição ou fluxo. O README da família diz o que ela resolve, lista os modelos, traz um guia rápido de escolha, as confusões frequentes e as referências cruzadas para as famílias vizinhas.
2. **Modelo** (`NN_slug`, dentro da família): uma forma com uma abordagem de construção. O README do modelo tem sete seções fixas, nesta ordem: O que é, Quando usar, Quando evitar, Anatomia, Versões, Como colar no Farol e Referências.
3. **Versão** (`vN_slug`, dentro do modelo): um caso de uso concreto que ensina uma técnica ou um cuidado. É uma pasta com estes arquivos, e só eles:

| Arquivo | O que é | Vai para o Farol? |
|---|---|---|
| `Chart.tsx` | O componente de produção: `export default`, prop `data` opcional com default do `data.ts`, raiz `h-full w-full min-w-0` e só os imports liberados pelo contrato | Sim |
| `data.ts` | O dado fictício e fixo com os tipos, exercitando um caso difícil (nome longo, valor pequeno, categoria de ausência, nulo) | Sim, como amostra, ou sai quando a página passa o dado |
| `meta.json` | Título, caso de uso, o que demonstra, canvas e moldura; fica fora do código para não sujar o componente | Não |
| `preview.svg` | Retrato do componente no tema escuro, gerado por `npm run render`; `preview-claro.svg` é o do tema claro | Não |

Slugs de pasta não levam acento; o texto de tela leva.

**Abordagem de construção.** Cada modelo declara uma no campo `abordagem_stack` do catálogo:

| Abordagem | Quando se usa |
|---|---|
| `recharts-nativo` | O componente do Recharts desenha a forma com as próprias props |
| `recharts-custom` | Recharts com `shape`, camada ou cálculo próprio para uma forma que ele não traz pronta |
| `svg-puro` | SVG em React com geometria calculada em TypeScript, para o que o Recharts não faz |
| `html-tailwind` | HTML com classes do Tailwind e tokens do Farol, quando não há gráfico ou o visual já é o cartão |

**Canvas e moldura.** O `canvas_sugerido` de cada versão é um preset do contrato: `kpi` (360 x 180), `kpi-alto` (360 x 280), `card` (640 x 360), `quadrado` (480 x 480), `largo` (960 x 400), `faixa` (960 x 260) e `alto` (640 x 560). A moldura `card` imita o `VisualCard`; a moldura `stage` serve ao visual que já é o próprio cartão, como o KPI.

## Documentos de regra e ferramenta

* [CONTRATO.md](CONTRATO.md): o contrato de autoria. Cobre estrutura e nomes, anatomia do `Chart.tsx` e do `data.ts`, `meta.json` e presets de canvas, imports permitidos, cor só por token, números e datas, acessibilidade, comandos, moldura do preview, READMEs, o roteiro para colar no Farol (seção 16) e o padrão de acabamento (seção 17, códigos TIP, COR, EIX, ROT, ANO, NUM, ESP, EST, DIC e ACE). Quem produz segue à risca; o check recusa o que diverge.
* [CHECKLIST_REVISAO.md](CHECKLIST_REVISAO.md): 32 perguntas de sim ou não em quatro blocos (escolha do visual, honestidade do encoding, acabamento e contrato de código), aplicadas a cada versão depois do render. Um único não reprova a versão; o parecer segue o registro do fim do arquivo.
* [_render/](_render/): a ferramenta de render, checagem e galeria. Roda de dentro da pasta, depois de `npm install`:

| Comando | Para quê |
|---|---|
| `npm run render -- <caminho> --tema ambos` | Gera `preview.svg` e `preview-claro.svg` e as capturas de conferência em `_render/.qa/` |
| `npm run check -- <caminho>` | Verifica contrato, READMEs e tipos; sai com código 1 se algo diverge |
| `npm run galeria` | Regenera `galeria.html` a partir do que existe em disco |
| `npm run selftest` | Prova a própria ferramenta (trava entre processos e fidelidade do SVG) |

  Os moldes oficiais estão em [_render/exemplos/](_render/exemplos/): Recharts nativo em barras (02), HTML com Tailwind em KPI (01) e SVG puro em waffle (22). Copie o mais próximo em vez de começar do zero.
* [galeria.html](galeria.html): a página navegável com família, modelo, versões, preview, caso de uso, o que demonstra, estado do preview e links para os arquivos, com busca e troca de tema. É gerada por `npm run galeria`: não edite à mão.

**Fluxo de quem produz um modelo:** `npm run dossie -- <familia>/<modelo>` e ler o dossiê (nunca o CONTRATO, o ARMADILHAS ou o PRODUCAO inteiros), copiar o modelo-guia ou o molde, escrever os arquivos e o README, `check --sem-tipos`, `render --tema ambos`, abrir os PNGs nos dois temas, responder as dez perguntas de autorrevisão, `check` até sair `0 com erro`. O veredito é de um revisor independente, pelo `CHECKLIST_REVISAO.md` e `npm run revisao`. Os briefings completos de cada papel vivem em `.claude/agents/visuais-{produtor,revisor,corretor,ferramenta}.md`, na raiz do repositório, e a sessão que os despacha segue [_operacao/ORQUESTRADOR.md](_operacao/ORQUESTRADOR.md). **Fluxo de quem cola no Farol:** seção 16 do CONTRATO.

## Famílias

Modelos, versões planejadas e abordagens são calculados de [`_estudo/catalogo.json`](_estudo/catalogo.json). **Versões planejadas** são as que já têm título, caso de uso, o que demonstra e canvas definidos no catálogo. As colunas **Versões no disco**, **Prontas** e **Reprovadas em pendência conhecida** são a medição de 2026-10-15 (`npm run pendencias` com tipos, gravada às 14:07Z em `_render/.qa/pendencias.json`, depois da segunda rodada de correção do Lote 25) e foram contadas por script a partir desse arquivo, família por família: no disco é a versão sem os motivos `sem_pasta` e `sem_chart`; pronta é a versão sem motivo nenhum, isto é, check em zero erro e veredito aprovado válido; reprovada conta o motivo `revisao_reprovada`, o único aberto no acervo nessa data (9 versões em 8 modelos, cosméticas ou de régua por decisão D13, cada uma com o veredito registrado em [_operacao/LOG.md](_operacao/LOG.md)). Nessa medição, aprovada e pronta coincidem, porque nenhuma versão aprovada tem outro motivo aberto; por isso a tabela traz uma coluna só. O estado vivo segue em [STATUS.md](STATUS.md), e estas três colunas valem para a data da medição até serem recalculadas. Na coluna Abordagens, `nativo` é `recharts-nativo`, `custom` é `recharts-custom`, `svg` é `svg-puro` e `html` é `html-tailwind`, com o número de modelos de cada uma.

| # | Família | Modelos | Versões planejadas | Versões no disco | Prontas | Reprovadas em pendência conhecida | Abordagens | Estudo e plano |
|---|---|---:|---:|---:|---:|---:|---|---|
| 01 | [Cards e KPIs](01_cards-e-kpis/README.md) | 8 | 32 | 32 | 32 | 0 | nativo 1, svg 1, html 6 | [estudo](_estudo/familias/01_cards-e-kpis.md), [catálogo](_estudo/catalogo/01_cards-e-kpis.json) |
| 02 | [Barras horizontais](02_barras-horizontais/README.md) | 10 | 39 | 39 | 39 | 0 | nativo 5, custom 2, svg 2, html 1 | [estudo](_estudo/familias/02_barras-horizontais.md), [catálogo](_estudo/catalogo/02_barras-horizontais.json) |
| 03 | [Colunas verticais](03_colunas-verticais/README.md) | 8 | 32 | 32 | 32 | 0 | nativo 5, custom 2, html 1 | [estudo](_estudo/familias/03_colunas-verticais.md), [catálogo](_estudo/catalogo/03_colunas-verticais.json) |
| 04 | [Linhas](04_linhas/README.md) | 9 | 35 | 35 | 35 | 0 | nativo 7, custom 2 | [estudo](_estudo/familias/04_linhas.md), [catálogo](_estudo/catalogo/04_linhas.json) |
| 05 | [Áreas](05_areas/README.md) | 10 | 39 | 39 | 39 | 0 | nativo 7, custom 2, svg 1 | [estudo](_estudo/familias/05_areas.md), [catálogo](_estudo/catalogo/05_areas.json) |
| 06 | [Pizza](06_pizza/README.md) | 6 | 24 | 24 | 24 | 0 | nativo 3, custom 3 | [estudo](_estudo/familias/06_pizza.md), [catálogo](_estudo/catalogo/06_pizza.json) |
| 07 | [Rosca e radial](07_rosca-e-radial/README.md) | 7 | 28 | 28 | 28 | 0 | nativo 5, custom 1, svg 1 | [estudo](_estudo/familias/07_rosca-e-radial.md), [catálogo](_estudo/catalogo/07_rosca-e-radial.json) |
| 08 | [Combinados e eixo duplo](08_combinados-e-eixo-duplo/README.md) | 6 | 24 | 24 | 24 | 0 | nativo 5, custom 1 | [estudo](_estudo/familias/08_combinados-e-eixo-duplo.md), [catálogo](_estudo/catalogo/08_combinados-e-eixo-duplo.json) |
| 09 | [Dispersão e bolhas](09_dispersao-e-bolhas/README.md) | 11 | 44 | 44 | 41 | 3 | nativo 5, custom 2, svg 2, html 2 | [estudo](_estudo/familias/09_dispersao-e-bolhas.md), [catálogo](_estudo/catalogo/09_dispersao-e-bolhas.json) |
| 10 | [Funil](10_funil/README.md) | 7 | 28 | 28 | 28 | 0 | nativo 4, custom 2, html 1 | [estudo](_estudo/familias/10_funil.md), [catálogo](_estudo/catalogo/10_funil.json) |
| 11 | [Fluxo e Sankey](11_fluxo-sankey/README.md) | 5 | 20 | 20 | 17 | 3 | nativo 1, custom 1, svg 3 | [estudo](_estudo/familias/11_fluxo-sankey.md), [catálogo](_estudo/catalogo/11_fluxo-sankey.json) |
| 12 | [Hierarquia](12_hierarquia/README.md) | 8 | 32 | 32 | 31 | 1 | nativo 2, custom 1, svg 3, html 2 | [estudo](_estudo/familias/12_hierarquia.md), [catálogo](_estudo/catalogo/12_hierarquia.json) |
| 13 | [Progresso, meta e gauge](13_progresso-meta-e-gauge/README.md) | 7 | 26 | 26 | 26 | 0 | nativo 3, custom 3, html 1 | [estudo](_estudo/familias/13_progresso-meta-e-gauge.md), [catálogo](_estudo/catalogo/13_progresso-meta-e-gauge.json) |
| 14 | [Tabelas visuais](14_tabelas-visuais/README.md) | 9 | 36 | 36 | 36 | 0 | svg 1, html 8 | [estudo](_estudo/familias/14_tabelas-visuais.md), [catálogo](_estudo/catalogo/14_tabelas-visuais.json) |
| 15 | [Mapa de calor e calendário](15_mapa-de-calor-e-calendario/README.md) | 8 | 32 | 32 | 32 | 0 | svg 6, html 2 | [estudo](_estudo/familias/15_mapa-de-calor-e-calendario.md), [catálogo](_estudo/catalogo/15_mapa-de-calor-e-calendario.json) |
| 16 | [Distribuição](16_distribuicao/README.md) | 13 | 51 | 51 | 51 | 0 | nativo 5, custom 4, svg 4 | [estudo](_estudo/familias/16_distribuicao.md), [catálogo](_estudo/catalogo/16_distribuicao.json) |
| 17 | [Comparação de pontos](17_comparacao-de-pontos/README.md) | 6 | 24 | 24 | 24 | 0 | nativo 3, custom 2, svg 1 | [estudo](_estudo/familias/17_comparacao-de-pontos.md), [catálogo](_estudo/catalogo/17_comparacao-de-pontos.json) |
| 18 | [Radar](18_radar/README.md) | 6 | 24 | 24 | 24 | 0 | nativo 3, custom 1, svg 2 | [estudo](_estudo/familias/18_radar.md), [catálogo](_estudo/catalogo/18_radar.json) |
| 19 | [Cascata (waterfall)](19_cascata-waterfall/README.md) | 8 | 32 | 32 | 32 | 0 | custom 6, svg 2 | [estudo](_estudo/familias/19_cascata-waterfall.md), [catálogo](_estudo/catalogo/19_cascata-waterfall.json) |
| 20 | [Cronograma e linha do tempo](20_cronograma-e-linha-do-tempo/README.md) | 9 | 36 | 36 | 36 | 0 | nativo 3, custom 1, svg 2, html 3 | [estudo](_estudo/familias/20_cronograma-e-linha-do-tempo.md), [catálogo](_estudo/catalogo/20_cronograma-e-linha-do-tempo.json) |
| 21 | [Texto e nuvem de palavras](21_texto-e-nuvem-de-palavras/README.md) | 7 | 28 | 28 | 28 | 0 | custom 2, svg 2, html 3 | [estudo](_estudo/familias/21_texto-e-nuvem-de-palavras.md), [catálogo](_estudo/catalogo/21_texto-e-nuvem-de-palavras.json) |
| 22 | [Unidades, waffle e pictograma](22_unidades-waffle-e-pictograma/README.md) | 6 | 24 | 24 | 24 | 0 | custom 1, svg 2, html 3 | [estudo](_estudo/familias/22_unidades-waffle-e-pictograma.md), [catálogo](_estudo/catalogo/22_unidades-waffle-e-pictograma.json) |
| 23 | [Mapas](23_mapas/README.md) | 6 | 24 | 24 | 23 | 1 | svg 4, html 2 | [estudo](_estudo/familias/23_mapas.md), [catálogo](_estudo/catalogo/23_mapas.json) |
| 24 | [Microvisuais e sparklines](24_microvisuais-sparklines/README.md) | 7 | 28 | 28 | 28 | 0 | nativo 2, svg 1, html 4 | [estudo](_estudo/familias/24_microvisuais-sparklines.md), [catálogo](_estudo/catalogo/24_microvisuais-sparklines.json) |
| 25 | [Matriz e quadrantes](25_matriz-e-quadrantes/README.md) | 7 | 28 | 28 | 27 | 1 | nativo 1, custom 1, html 5 | [estudo](_estudo/familias/25_matriz-e-quadrantes.md), [catálogo](_estudo/catalogo/25_matriz-e-quadrantes.json) |
| 26 | [Mosaico e marimekko](26_mosaico-marimekko/README.md) | 3 | 12 | 12 | 12 | 0 | svg 3 | [estudo](_estudo/familias/26_mosaico-marimekko.md), [catálogo](_estudo/catalogo/26_mosaico-marimekko.json) |
| 27 | [Rede e relações](27_rede-e-relacoes/README.md) | 8 | 32 | 32 | 32 | 0 | svg 7, html 1 | [estudo](_estudo/familias/27_rede-e-relacoes.md), [catálogo](_estudo/catalogo/27_rede-e-relacoes.json) |
| | **Total: 27 famílias** | **205** | **814** | **814** | **805** | **9** | nativo 70, custom 40, svg 50, html 45 | |

### Por abordagem

| Abordagem | Modelos | Parcela | Versões planejadas |
|---|---:|---:|---:|
| `recharts-nativo` | 70 | 34,1% | 276 |
| `recharts-custom` | 40 | 19,5% | 160 |
| `svg-puro` | 50 | 24,4% | 198 |
| `html-tailwind` | 45 | 22,0% | 180 |

### Por canvas sugerido

| Preset | Tamanho | Versões | Parcela |
|---|---|---:|---:|
| `card` | 640 x 360 | 321 | 39,4% |
| `largo` | 960 x 400 | 229 | 28,1% |
| `alto` | 640 x 560 | 131 | 16,1% |
| `quadrado` | 480 x 480 | 65 | 8,0% |
| `kpi-alto` | 360 x 280 | 36 | 4,4% |
| `faixa` | 960 x 260 | 28 | 3,4% |
| `kpi` | 360 x 180 | 4 | 0,5% |

### Modelos com menos de 4 versões

Todo modelo tem 4 versões planejadas, menos 6:

* 02_barras-horizontais/10_corrida-de-barras (Corrida de barras): 3 versões
* 04_linhas/03_step-degrau (Linha em degrau): 3 versões
* 05_areas/10_area-bump (Area bump): 3 versões
* 13_progresso-meta-e-gauge/04_aneis-concentricos (Anéis concêntricos de metas): 3 versões
* 13_progresso-meta-e-gauge/05_gauge-de-arco-preenchido (Gauge de arco preenchido): 3 versões
* 16_distribuicao/13_q-q-plot (Q-Q plot): 3 versões

## Estudo

A pasta [`_estudo/`](_estudo/) guarda a pesquisa e o plano que deram origem ao catálogo. É referência, não especificação, e não entra no build. Quando um estudo e o CONTRATO divergem, vale o CONTRATO; as divergências conhecidas estão na seção seguinte e nos READMEs das famílias.

| Arquivo ou pasta | O que tem | Quando abrir |
|---|---|---|
| [`00_acabamento.md`](_estudo/00_acabamento.md) | O que separa um dashboard de alto nível da média: cinco regras de resumo, princípios com fonte, regras concretas (tipografia numérica, cor para os dois temas, contraste, grade e eixos, rótulo direto, anotação, densidade, estados de carregamento e ausência, dica, microvisuais e acessibilidade), guias de estilo e publicações de referência, antipadrões com a correção e um checklist de revisão de cartão | Para entender o porquê de uma regra da seção 17 do CONTRATO ou achar a fonte dela |
| [`00_portais-de-design.md`](_estudo/00_portais-de-design.md) | Varredura de portais de design: de 3 a 8 peças por família, cada uma com o que aproveitar e como sai no Farol (Recharts, SVG puro ou HTML), e a marca de procedência de cada link (`[aberto]`, `[busca]`, `(não abriu)`) | Para buscar referência visual antes de desenhar; peça marcada como busca não teve a qualidade conferida e precisa ser olhada antes de adotar |
| [`familias/`](_estudo/familias/) | 27 estudos, um por família: o que a família responde, decisões transversais, tabela numerada de modelos e variações, e fontes | Antes de produzir qualquer modelo da família; a numeração `FF#k` vem daqui |
| [`catalogo/`](_estudo/catalogo/) | Um JSON por família, que é o que entra no consolidado, e subpastas com um JSON por modelo | Para ler ou ajustar o plano de uma família |
| [`catalogo.json`](_estudo/catalogo.json) | O consolidado: array das 27 famílias em ordem de slug, juntado por script a partir dos JSONs de família, sem redigitação | Para contar, validar ou gerar índice; não edite à mão: mudou um JSON de família, junte de novo |
| [`plano_catalogo.json`](_estudo/plano_catalogo.json) | O plano que fundiu cerca de 400 modelos listados pelos pesquisadores nos 205 atuais, com as variações absorvidas por modelo e as moradias decididas entre famílias | Para saber em que modelo foi parar uma variação do estudo |
| `_resumos_pesquisa_ok.json` e `_resumos_pesquisa_novos.json` | Resumos intermediários da pesquisa por família | Só para rastrear a origem de um resumo |

### Campos do catálogo

| Nível | Campos |
|---|---|
| Família | `slug`, `nome`, `modelos` |
| Modelo | `slug`, `nome`, `abordagem_stack`, `resumo`, `quando_usar`, `quando_evitar`, `arquivo_estudo`, `versoes` |
| Versão | `slug`, `titulo`, `caso_de_uso`, `o_que_demonstra`, `canvas_sugerido` |

Na produção, `titulo`, `caso_de_uso`, `o_que_demonstra` e `canvas_sugerido` correspondem a `title`, `useCase`, `demonstrates` e `canvas` do `meta.json`; `resumo`, `quando_usar` e `quando_evitar` correspondem às seções O que é, Quando usar e Quando evitar do README do modelo.

**Validação de 2026-09-14:** toda família tem slug, nome e modelos; todo modelo tem slug, nome, abordagem e versões; toda versão tem slug, título, caso de uso, o que demonstra e canvas; nenhum slug de modelo se repete entre famílias e nenhum slug de versão se repete dentro do modelo. Nada faltou.

### Convenções de referência

* **`FF#k`:** o k-ésimo modelo da tabela do estudo da família FF; `01#26`, por exemplo, é a bandline no estudo de Cards e KPIs. A lista de variações absorvidas não repete o modelo base, e nenhum `FF#k` foi absorvido por dois modelos.
* **`FF/NN`:** o modelo NN da família FF, como `13/03`. Aparece nas referências cruzadas e nas moradias decididas entre famílias: tracker de estado em 24/04, burn-up em 04/06, bump chart em 04/08, semicírculo em 07/02, progresso radial e anéis de metas em 13/03 e 13/04, bar list em 02/09, punch card em 09/04, texto com número em 21/01, big number em 01/01 e marcas dentro de célula em 14/01.

## Pendências registradas no fechamento das famílias

Levantadas por cada família ao fechar o próprio catálogo, em 2026-09-14. Resolver antes ou durante a produção do modelo citado.

**Conflito com o CONTRATO (vale o CONTRATO):**

* 05/01 se chama "Área simples com gradiente", mas a COR-9 proíbe gradiente decorativo; o preenchimento é plano e o nome pede revisão.
* 08: a EIX-8 proíbe eixo duplo e o modelo 02 é justamente eixo duplo; o README da família propõe painéis alinhados como padrão e eixo duplo só como exceção registrada. O estudo cita o token inexistente `--farol-serie-1` e `Intl` direto, os dois fora do contrato.
* 14/04 põe selo de procedência por linha, contra a ANO-6, que reserva `--prov-*` ao `VisualCard`. Pela mesma regra, o teto de premissa em 13 se distingue por texto, não por cor de procedência.
* 22/01: o catálogo planeja `01_waffle` em `html-tailwind`, mas o molde da ferramenta é `01_waffle-10x10` em SVG puro; a v3 soma 900 `div`, acima do teto de cerca de 400 da regra de performance da família.
* Ausência: 05, 06 e 11 trocaram a hachura ou a posição sugeridas no estudo pelo papel de ausência do CONTRATO (contorno `--text-muted` sem preenchimento, sempre por último). 09 usa o destaque em `--chart-1` (seção 17.2), não o `--chart-2` do estudo.

**Falta token, import ou conferência de API:**

* 26: falta um par de tokens divergentes para resíduo.
* 21/03: a virtualização da v3 fica para a colagem, porque `@tanstack/react-virtual` não está entre os imports permitidos.
* 18/02: o formato de `isRange` está por validar e a coroa usa `shape`; a v3 abre exceção à regra de duas séries.
* Hooks do Recharts 3.10 (`useXAxisScale`, `usePlotArea`, `useXAxisInverseScale`) a conferir no build, pendência herdada do plano.

**Técnica diferente da abordagem declarada do modelo:**

* 11/01 v4 e 11/02 v4 usam SVG puro dentro de modelo Recharts.
* 21/04 v3, a nuvem alinhada, é HTML dentro de modelo `svg-puro`.
* 20/08 v3 faz a régua micro em Recharts, e não em SVG puro como sugere o estudo 24.
* 23/03 desenha as bolhas em grade em SVG puro, e não em `ScatterChart`; 15/07 segue `svg-puro` onde o estudo pedia HTML.

**Não aparece no preview estático:** o zoom por área de 09 e a linha fixa ao rolar de 14/07 v2; as duas precisam de conferência no Farol.

**Referência a verificar:**

* 23/01 v3: nenhuma grade hexagonal pública do Brasil foi verificada; a vizinhança das UFs precisa de revisão.
* Sem peça de portal: 20 (Marey e roadmap), 23/05, 23/06, 27/01, 27/03 e 27/08; portais pobres em 26.
* Correção já feita sobre o estudo 10: na sequência 420, 268, 131, 64 e 29, a pior taxa de passo é Negociação para Ganha (45,3%) e a maior queda é de 152.

**Cobertura:**

* 02: faltam a barra por UF agrupada por região (citada no estudo 23) e a lista de termos com KWIC.
* 23 não desenha ligação entre pontos e devolve esse caso para 27.
* 03: a variante com três cenários citada no estudo ficou fora; o caso mora hoje em 17/04, o range plot.
* 11 deixou de fora contato futuro, pré-vendas com 30 nós e receita por produto.
* Sobreposições a conferir: 04/04 com 05/05 (faixa) e 04/08 com 05/10 (area bump).
* Variações sem versão própria, documentadas no README da família: bandline e anel (01), contorno (09), Voronoi (12), termômetro e bullet com valor negativo (13), polígono, densidade sobreposta, letter-value e outras extensões (16), dumbbell agrupado e pareado em colunas (17), degraus e faixa por período (24), posto e mapa perceptual (25) e bar mekko divergente (26).
