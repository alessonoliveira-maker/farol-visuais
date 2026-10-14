# Funil em cartões de etapa

## O que é

Uma faixa de cartões de KPI, um por etapa, ligados por um chip de taxa de passo e uma seta.
Não há codificação de área nem de comprimento entre etapas: sem essa comparação visual, o
número escrito em cada cartão e a taxa com o denominador nomeado no chip carregam sozinhos
toda a leitura. Uma microbarra decorativa dentro do cartão dá só uma pista de magnitude contra
a primeira etapa, nunca a medida principal. Cabe numa faixa estreita de topo de página e
funciona bem quando a decisão depende de custo (CPL) ou de tempo (SLA) junto do volume.

## Quando usar

* Faixa de KPIs no topo das telas de Marketing e Pré-vendas, com 3 a 6 etapas.
* Leitura numérica com custo junto do volume, como CPL e CPL qualificado.
* Prazo entre etapas com SLA, quando há carimbo de data confiável em cada passagem.
* Largura de celular: os cartões empilham e a seta vira para baixo.

## Quando evitar

* Quando a proporção visual é a mensagem principal: usar o
  [01_funil-em-barras-com-taxa-de-passo](../01_funil-em-barras-com-taxa-de-passo/).
* Mais de 6 etapas numa faixa: os cartões ficam estreitos demais para o número e a unidade
  caberem sem cortar; usar barras.
* Mediana de tempo calculada só com quem já passou, sem mostrar quantos ainda estão na etapa:
  a censura infla a mediana e o leitor não tem como saber.
* Um único indicador com meta: usar a família [01_cards-e-kpis](../../01_cards-e-kpis/).

## Anatomia

1. **Cartão de etapa**, um por etapa, em `--surface-raised` com borda `--line-subtle`: rótulo,
   valor em algarismo tabular e unidade por extenso.
2. **Microbarra decorativa**, largura em percentual da primeira etapa, `aria-hidden` e com piso
   de 2 px para uma etapa pequena não desaparecer da tela.
3. **Chip de taxa de passo** entre dois cartões, sempre por `formatRateWithVolume`: nunca só o
   percentual, porque sem o par volume a peça vira ranking de cartões, não funil.
4. **Seta** entre cartões, `ChevronRight` que vira `ChevronDown` quando o `@container` estreita
   e os cartões empilham.
5. **Variação contra o período anterior**, quando a versão comparar dois meses: sinal, ícone e
   cor semântica só no chip que passa do limiar, com a base nomeada na mesma linha.
6. **Conector de tempo**, quando a versão tratar de SLA: mediana e p90 em unidade própria
   (`min`, `h`, `dias`), a contagem de quem passou contra quem ainda está na etapa de origem, e
   a cor do p90 pela faixa de SLA, independente da cor da mediana.
7. **Estado indisponível**, por cartão: ícone `Unplug` e `formatUnavailable()` no lugar do
   número, sem microbarra; as duas taxas vizinhas à etapa sem base também ficam indisponíveis.

## Versões

* [`v1_faixa-de-marketing-com-cpl`](./v1_faixa-de-marketing-com-cpl/): quatro etapas de mídia
  paga (impressões, cliques, leads, leads qualificados) com investimento do mês e CPL de dois
  cortes, chip de taxa de passo sempre com o par volume e microbarra por etapa.
* [`v2_passo-que-piorou-contra-o-mes-anterior`](./v2_passo-que-piorou-contra-o-mes-anterior/):
  a mesma faixa contra o mês anterior; só o chip da passagem que caiu mais de 5 pontos
  percentuais muda de cor e ganha a taxa do mês anterior nomeada, os demais seguem neutros.
* [`v3_tempo-e-sla-entre-etapas`](./v3_tempo-e-sla-entre-etapas/): conector de tempo entre
  etapas da pré-vendas com mediana, p90 e SLA em horas; o p90 estoura o prazo mesmo com a
  mediana dentro, e a contagem de quem ainda está na etapa acompanha a mediana contra a censura.
* [`v4_etapa-sem-medicao`](./v4_etapa-sem-medicao/): plataforma sem evento de conversão de lead
  configurado; o cartão da etapa escreve indisponível em vez de zero, sem microbarra, e as duas
  taxas vizinhas também ficam indisponíveis por falta de base.

## Como colar no Farol

1. Escolha a versão pela pergunta: leitura de custo por lead vai de `v1`; alerta de passo que
   piorou vai de `v2`; prazo e SLA entre etapas vai de `v3`; plataforma com lacuna de instrumento
   vai de `v4`.
2. O chip de taxa de passo depende da ordem do array `stages`: ao ligar dado real, mantenha as
   etapas na ordem do processo, nunca ordenadas por valor, porque o chip lê `stages[i]` contra
   `stages[i + 1]`.
3. Ao ligar dado real em `v3`, quando uma passagem não tiver mediana medida ainda, mantenha
   `medianValue: null` e `slaHours: null` em vez de omitir a passagem: sem isso o conector some
   e o leitor não sabe se falta instrumento ou se a etapa não existe.
4. Ao ligar dado real em `v4`, a etapa sem medição carrega `value: null`; nunca `0`, porque o
   cartão de zero medido (`formatInt(0)`) e o de instrumento ausente (`formatUnavailable()`)
   têm o mesmo desenho de cartão e só o número muda de sentido.
5. O container query (`@container` na raiz, `@sm:` nos filhos) já resolve o empilhamento em
   largura de celular; não use `useIsMobile` nem leia `window.innerWidth` ao colar na página.

## Referências

| Referência | O que observar |
|---|---|
| [AG Charts, Cone Funnel](https://www.ag-grid.com/charts/gallery/simple-cone-funnel/) | A dica combinando valor absoluto e taxa sobre a entrada, razão de o chip nunca imprimir só o percentual. |
| [Graphtelling, Funnel Chart Alternatives](https://graphtelling.com/blog/funnel-chart-alternatives/) | Taxa de passo como número principal, sem depender da forma para comunicar a queda. |
| [Behance, Sales Conversions KPI Dashboard](https://www.behance.net/gallery/137208383/Sales-Conversions-KPI-Dashboard) | Faixa de KPIs de conversão, referência de composição para a fileira de cartões. |
| [Behance, Style Guidelines for data visualisation: dark & light](https://www.behance.net/gallery/82482589/Style-Guidelines-for-data-visualisation-dark-light) | Tratamento de cartões e funil nos dois temas. |

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19; as quatro versões aprovadas._

* **Todas as versões:** com a primeira etapa em ordem de grandeza muito maior, a microbarra
  cai no piso de 2 px da segunda etapa em diante e três cartões ficam com o mesmo traço; ela é
  `aria-hidden` e decorativa, e o número escrito carrega a leitura, mas a pista de magnitude
  praticamente some. Vale considerar escala por raiz ou omitir a microbarra quando o piso
  atingir mais de uma etapa.
* **Todas as versões:** o número do cartão sai em `text-xl` (20 px), e não nos 30 px do papel
  "Número de KPI" da tabela 17.1; a escolha cabe na faixa de quatro cartões e continua legível
  nos dois temas, mas foge da escala declarada.
* **Todas as versões:** o trilho da microbarra usa `--surface-sunken`, o que era divergência
  enquanto a seção 7 reservava "trilho de barra" para `--surface-overlay`. Deixou de ser
  divergência em 2026-09-29: a tabela 17.2 do `CONTRATO.md` passou a proibir `--surface-overlay`
  como trilho, moldura e faixa, e o token das quatro versões é o que o catálogo pede.
* **Todas as versões:** `data` com `stages` vazio renderiza uma faixa em branco, sem o bloco
  `role="status"` da EST-1; nenhuma versão do modelo prova hoje o estado vazio.
* **v1:** a frase acessível imprime a conversão total como `0,0% (318 de 2.400.000)`, porque a
  taxa de ponta a ponta fica abaixo de uma casa decimal; os volumes seguem escritos ao lado, mas
  o percentual arredondado se lê como zero.
* **v2:** só o volume do mês atual aparece escrito (`318 de 1.240`); a taxa anterior sai sem o
  par (`31,2%`), e o item do catálogo que previa a dica do chip com os volumes dos dois meses
  não foi implementado, ainda que o `meta.json` fale em "volume dos dois meses escrito".
* **v2:** os chips neutros usam `--text-secondary`, e o catálogo pedia `--text-muted`; o
  destaque continua não competindo, a diferença é de tom.
* **v2:** a frase acessível chama a queda de 5,6 pontos percentuais de "queda de 5,6%";
  `formatPercentPoints` diria a mesma coisa sem ambiguidade.
* **v4:** os cartões perderam a seta (`ChevronRight` e `ChevronDown`) que a Anatomia descreve
  no item 4; ao empilhar em largura de celular, a direção do funil fica só na ordem dos cartões.
* **v4:** os chips vizinhos à etapa sem base escrevem apenas "indisponível", sem dizer que o
  indisponível é a taxa de passo.
