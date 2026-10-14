# Parecer de revisão: 23_mapas/05_mapa-de-perimetro-e-localizador

Data: 2026-10-13. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render de 12:43:55 a 12:44:04, posterior ao `Chart.tsx`, ao `data.ts` e ao `meta.json` das quatro, o mais novo de 12:43:42). `npm run check` com tipos: 0 com erro, 0 avisos.

Resultado: `v1`, `v2` e `v3` aprovadas; `v4` reprovada, por um bloqueante. As observações não bloqueantes das quatro estão no README do modelo.

## Sobre os desvios do catálogo

O catálogo descreve o modelo sobre a malha do IBGE, pede a malha de fora em `--surface-overlay` e, na `v2`, chamada externa nas UFs pequenas. As quatro versões desenham sobre a malha de hexágonos da família, com a malha de fora em `--surface-sunken` e traço de `--line-strong`, e a `v2` sai sem chamada. Não foi tratado como versão que não demonstra o catálogo, pelas razões já aceitas em `23_mapas/02_coropletico-por-uf`: a seção 1 do contrato fecha a versão em cinco arquivos e a seção 6 fecha a lista de imports; `--surface-overlay` como marca é a TOK-1 (1,00:1 no claro); e os três desvios estão declarados no README, no `notes` das quatro e no comentário da malha.

## Peso do bloqueante

* **`v4`, taxa sem volume.** Perguntas 14 e 25; NUM-1, armadilha DAD-1 e Precedência da seção 17, que põe "volume junto da taxa" entre o que nenhuma regra relaxa. É o mesmo defeito reprovado em `09_dispersao-e-bolhas/06_antes-e-depois-com-setas`, em `20_cronograma-e-linha-do-tempo/02_linha-do-tempo-de-marcos` e em `22_unidades-waffle-e-pictograma/01_waffle` (`v4`). Aqui o `data.ts` já declara as parcelas, então a correção é de tela, com uma armadilha de arredondamento descrita abaixo.

## O que foi medido e o que não foi

* **Medido:** os oito PNGs de conferência, com recortes ampliados do mapa das quatro nos dois temas, da faixa da `v3` e da tabela da `v4`; o contraste de cada par de texto e de marca pela fórmula da WCAG sobre `app/src/styles/tokens.css` (tabela no fim); as frases acessíveis lidas do `preview.svg` (196, 217, 208 e 208 caracteres); a diferença entre o preview e a página, com limiar de 25 por canal, medida minha e não a do render (0,35% e 0,50% na `v1`, de 0,05% a 0,07% nas outras três).
* **Refeito contra o `data.ts`:** na `v1`, 7,4% de R$ 96,2 mi em R$ 1,3 bi; na `v2`, as sete taxas, as quebras em 2, 6, 10 e 14, as classes (3, 1 e 3 UFs) e a soma das parcelas, que fecha nos mesmos R$ 96,2 mi e R$ 1,3 bi da `v1`; na `v3`, os 7,4%, a receita estimada de R$ 14,3 mi a R$ 19,0 mi e a escala de 0 a 8% em passos de 2; na `v4`, 7,9% (104,06 de 1.320), 7,4%, 2,1% e 14,5%, e a coerência entre os dois perímetros (o anterior menos MS mais ES dá o vigente nas duas parcelas).
* **Não medido pela ferramenta:** na `v1`, COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA saem `texto_em_html`; conferido à mão nos dois PNGs e pela conta dos tokens. ESPESSURA-MARCA, EIXO-CALMO, OPACIDADE-MARCA e RAIO-CONTRA-AREA não se aplicam a nenhuma das quatro.
* **Não renderizado:** o vazio das quatro; o ramo sem mercado de referência da `v1`, da `v2` e da `v3`; o modo `previous` da prop `shownPerimeter` da `v4`. O que se diz desses ramos é leitura do código.
* **Não testado:** a saída sugerida abaixo. É conta sobre a geometria e sobre o formatador, não render.

## `v4_perimetro-que-mudou-de-vigencia`: reprovada, um bloqueante

### Bloqueante 1. Perguntas 14 e 25; NUM-1, armadilha DAD-1 e Precedência da seção 17

**Evidência.**

* No PNG, nos dois temas, a tabela escreve quatro participações e nada mais: `7,9%` e `7,4%` na linha `Participação no perímetro`, `2,1%` no Espírito Santo e `14,5%` no Mato Grosso do Sul. Não há receita nem mercado em nenhum texto do cartão.
* `Chart.tsx`, linha 3: a versão importa `formatDate`, `formatInt`, `formatPercent` e `formatUnavailable`. `formatCurrencyCompact` não entra. `ShareCell` (linhas 146 a 160) recebe só a fração.
* Não há dica (`<title>`) no mapa nem na tabela, e a frase acessível (linhas 212 a 218) também só leva os percentuais. O volume não está em lugar nenhum, nem para quem passa o cursor, nem para quem ouve.
* O `data.ts` está certo: `SharePair` declara `revenue` e `market` para os dois perímetros e para as duas UFs que mudaram de lado, que é a saída da DAD-1. O que falta é a tela escrever o que o dado já traz.
* As três irmãs escrevem o par: a `v1` e a `v3` sob o número, a `v2` sob a linha de leitura e, por UF, na dica. O item 7 da Anatomia do README diz que a participação sai "sempre derivada de receita e mercado" com "o par escrito por `formatCurrencyCompact`". A `v4` é a única que não cumpre, e o `notes` não declara o desvio.

**Por que bloqueia.** A NUM-1 pede a taxa com o volume, e a Precedência da seção 17 põe "volume junto da taxa" entre o que a revisão do Farol mandou não mudar. Não é acabamento: é o que impede um percentual de ser lido sem base. E nesta versão a base é o assunto. O aviso diz que as duas participações não se comparam porque "o mercado de referência mudou junto com o perímetro", e o leitor não vê de quanto para quanto. O caso difícil que o `data.ts` monta (sai uma UF de 14,5%, entra uma de 2,1%) também depende do tamanho de cada mercado: 14,5% são R$ 8,7 mi em R$ 60,0 mi, e 2,1% são R$ 840,0 mil em R$ 40,0 mi. Na família, o coroplético e o tile grid foram aprovados com o volume por UF só na dica, mas ali eram 27 células de mapa e o número principal trazia o volume escrito. Aqui são quatro números numa tabela e nenhum deles tem volume em lugar algum.

**O que mudar.**

1. Escrever o par sob cada participação medida, com `formatCurrencyCompact`, em 11 px e `--text-muted`, como a `v1` e a `v3` fazem (receita em uma linha, `em R$ … de mercado` na outra, ou a forma curta que couber na coluna). São quatro células: as duas do perímetro e as duas das UFs. As duas células de ausência continuam só com `formatUnavailable()` e o ícone.
2. **Armadilha de arredondamento, medida.** `formatCurrencyCompact` tem uma casa fixa. Com o dado de hoje, o mercado do perímetro anterior (R$ 1,32 bi) e o do vigente (R$ 1,30 bi) imprimem o mesmo `R$ 1,3 bi`, logo abaixo de um aviso que diz que o mercado mudou. E o par do anterior, lido como sai impresso (`R$ 104,1 mi` em `R$ 1,3 bi`), refaz 8,0% contra os 7,9% escritos ao lado. Como o dado é fictício, a saída é mudar as parcelas para a diferença aparecer na precisão impressa.
3. Um conjunto que fecha, por conta e não por render: Mato Grosso do Sul no perímetro anterior com `revenue: 20_300_000` e `market: 140_000_000` (segue em 14,5%); perímetro anterior com `revenue: 115_660_000` e `market: 1_400_000_000` (o vigente menos ES mais MS, nas duas parcelas). Fica `8,3%` no anterior, com `R$ 115,7 mi` em `R$ 1,4 bi`, que refaz 8,3% pelo impresso, contra `7,4%` no vigente, com `R$ 96,2 mi` em `R$ 1,3 bi`. O vigente não muda e continua igual ao da `v1`, da `v2` e da `v3`. Outro conjunto serve, desde que os dois mercados impressos sejam diferentes e cada par refaça o percentual ao lado.
4. O canvas `card` não fecha com as linhas novas. A coluna lateral tem 332 px (medido no PNG) e a grade tem duas colunas de valor de 84 px: o par em uma linha, com cerca de 135 px, não cabe, então são duas linhas de 11 px por célula. Isso soma cerca de 32 px na linha do perímetro e 16 px em cada linha de UF, 64 px ao todo, sobre 206 px de tinta na coluna hoje (medido no PNG) num corpo de 225 px. Pela GEO-1, quem cede é a altura: canvas por número, com a conta refeita no `notes`. O hexágono de 34 px é o piso da sigla de 11 px e não encolhe.
5. Alinhar o que descreve a peça: no `notes`, os percentuais do dado novo e a conta do canvas; no `demonstrates`, um item dizendo que cada participação leva o par; no comentário do topo do `data.ts`, as parcelas novas; no README, a linha da `v4` em Versões.
6. A frase acessível tem 208 caracteres e o teto é 250. Se o par entrar nela, medir de novo. Se não entrar, o corpo e a frase continuam dizendo os mesmos percentuais com o mesmo formatador (DAD-5), e isso basta.
7. Conferir depois do render, nos dois temas: nenhuma linha nova cortada no pé do cartão, a legenda do mapa ainda dentro do corpo (hoje sobram 10 px abaixo dela), as duas células de ausência alinhadas à direita com as outras, e `npm run check` com 0 erro.

### Itens de mesma rodada, que não bloqueiam

* **Período de cada participação (DAD-9).** A tabela diz desde quando o perímetro vale e não diz de quando é cada medição. Ao escrever o par, vale dizer no cabeçalho das colunas, ou deixar declarado que fica para o título do `VisualCard`.
* **Data no caso de uso.** O `useCase` do `meta.json`, literal do catálogo, escreve `2026-03-01`, e o subtítulo do cartão mostra a data nesse formato ao lado de `01/03/2026` no corpo (NUM-7). O primeiro item do `demonstrates` faz o mesmo.
* **Legenda do mapa.** Nomeia o perímetro exibido e a UF só do outro. O tom neutro de fora e os ícones de mais e de menos ficam sem entrada; os ícones se explicam na tabela ao lado.
* **Modo `previous`.** A ferramenta monta a versão sem props, então o perímetro anterior aceso não tem PNG. Lido no código: ES passa a tracejada com o mais, MS acende com o menos, a legenda troca para `perímetro anterior` e `só no vigente`, e a frase passa a `substituído em`. Nenhum defeito achado na leitura.
* **TIP-4.** A célula sem destaque da tabela, em `font-display`, não declara peso e herda o 400; o navegador entrega o 500. Sem consequência visível.
* **Ramo sem mercado.** Com participação nula no perímetro, a frase acessível escreve `de indisponível`. O dado padrão não exercita.

**O que a `v4` acerta e não deve mudar na correção:** a malha calculada fora do componente, igual nos dois modos; o ícone que segue a mudança e não o modo; o tracejado desenhado antes do contorno cheio; as duas ausências por `formatUnavailable()` com o ícone `Unplug`, nunca zero; o aviso colado às duas participações, com ícone e palavra; e a coerência do dado entre os dois perímetros.

## `v1`, `v2` e `v3`: aprovadas

**`v1_miniatura-ao-lado-do-card-de-participacao`.** O percentual sai de R$ 96,2 mi em R$ 1,3 bi, o par e a data de vigência estão escritos sob o número, e a miniatura acende as sete UFs certas (cinco na última linha da malha, MG e ES acima). O contorno externo sai inteiro nos dois temas, sem borda interna. Todo o texto mora em HTML e as guardas não o medem; pela conta dos tokens, a etiqueta DERIVADO mede 6,47:1 e 6,18:1 e o menor par é `--text-muted` sobre o cartão, com 5,21:1 e 5,37:1. A moldura é `stage`, o cartão é a própria peça, e por isso a etiqueta de procedência é dele. O que fica para o README: a malha de fora abaixo de 3:1 como pano de fundo, a folga de 13 px da legenda escrita e o ramo sem mercado.

**`v2_participacao-so-dentro-do-perimetro`.** As sete taxas impressas batem com o `data.ts`; as quebras de 4 em 4 pontos (2, 6, 10 e 14) põem ES, RJ e MG na classe baixa, SP na do meio e RS, PR e SC na alta; e a cor de cada hexágono bate com a classe nos dois temas. A rampa de três degraus (`--seq-3`, `6` e `7`) evita os dois degraus sem texto legível da TOK-2, e com o percentual em todo hexágono vale o regime da TOK-8 em que a cor é apoio: a classe baixa mede 2,29:1 e 1,92:1 contra o cartão, dentro da isenção do valor escrito. Quem separa dentro de fora é o contorno em `--text-primary`, a sigla em peso 600 e o número. Sigla e percentual cabem no hexágono de 38 px (o mais largo, `12,6%`, fica com cerca de 2 px de cada lado) e a COLISAO-TEXTO não avisou. A nota do número nacional está escrita. O que fica para o README: o volume por UF só na dica, a altura da legenda e o peso herdado.

**`v3_perimetro-atual-e-expansao-proposta`.** O contorno cheio do perímetro vigente e o tracejado das quatro UFs da expansão se leem nos dois temas, e a divisa entre os dois sai cheia. A expansão tem o preenchimento da malha de fora de propósito e se separa pelo tracejado (16,67:1 e 15,56:1), pela sigla em peso 600 e pela cor do texto. O painel escreve os dois números com o par de cada um, e a receita estimada (R$ 14,3 mi a R$ 19,0 mi) é a faixa aplicada aos R$ 280,0 mi. A faixa começa no zero, termina no primeiro tique acima do maior valor e repete o traço do mapa: ponto cheio para o medido, faixa tracejada para a premissa. A legenda dela e a nota do rodapé dizem que as duas participações têm bases diferentes. As etiquetas de procedência dentro do Chart foram pesadas e não reprovadas, como em `25/04`, `25/05`, `25/07` e `22/05`: o catálogo pede, o `notes` declara, e elas estão em texto, não em marca.

## Contraste medido

Fórmula da WCAG sobre os tokens. Texto pede 4,5:1; marca pede 3:1, salvo com o valor escrito nela.

| Par | Escuro | Claro | Onde |
|---|---|---|---|
| `--prov-derivado`, `--prov-medido` e `--prov-premissa` sobre o cartão (texto) | 6,47, 7,36 e 8,36 | 6,18, 5,34 e 5,74 | `v1`, `v3` |
| `--text-muted` sobre o cartão e sobre `--surface-sunken` | 5,21 e 5,98 | 5,37 e 4,65 | notas e siglas de fora |
| `--text-primary` sobre `--surface-sunken` | 16,67 | 15,56 | siglas e contorno tracejado, `v3` e `v4` |
| `--text-primary` sobre `--seq-3` | 6,33 | 9,35 | `v2` |
| `--accent-cyan-contrast` sobre `--seq-6` e `--seq-7` | 7,38 e 10,72 | 5,45 e 8,29 | `v2` |
| `--accent-cyan-contrast` sobre `--chart-1` | 10,06 | 6,00 | siglas e ícone, `v3` e `v4` |
| `--warning` sobre o cartão (ícone do aviso) | 8,36 | 5,74 | `v4` |
| `--chart-1` contra o cartão e contra a malha de fora | 9,50 e 10,90 | 6,00 e 5,20 | perímetro, nas quatro |
| `--seq-3`, `--seq-6` e `--seq-7` contra o cartão | 2,29, 6,96 e 10,12 | 1,92, 5,45 e 8,29 | `v2`, com o valor escrito |
| `--seq-3` contra a malha de fora; `--seq-6` contra `--seq-7` | 2,63; 1,45 | 1,66; 1,52 | `v2`, separados pelo contorno e pelo número |
| `--surface-sunken` e `--line-strong` contra o cartão | 1,15 e 1,79 | 1,15 e 1,83 | malha de fora, pano de fundo |

## Registro do parecer

```
Versão: 23_mapas/05_mapa-de-perimetro-e-localizador/v1_miniatura-ao-lado-do-card-de-participacao
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 6, 7, 13, 18, 26, 27, 28, 29, 30, 31

Versão: 23_mapas/05_mapa-de-perimetro-e-localizador/v2_participacao-so-dentro-do-perimetro
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 6, 7, 13, 26, 27, 28, 29, 30, 31

Versão: 23_mapas/05_mapa-de-perimetro-e-localizador/v3_perimetro-atual-e-expansao-proposta
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 6, 13, 18, 26, 27, 28, 29, 30, 31

Versão: 23_mapas/05_mapa-de-perimetro-e-localizador/v4_perimetro-que-mudou-de-vigencia
Data: 2026-10-13
Resultado: reprovada
Não: 14 e 25
Correções:
  14. NUM-1 (DAD-1): escrever receita e mercado, por formatCurrencyCompact, sob cada uma das quatro participações medidas da tabela.
  25. Precedência da seção 17: volume junto da taxa; ajustar as parcelas do dado para os dois mercados não imprimirem o mesmo valor e refazer a conta do canvas pela GEO-1.
Não se aplica: 3, 4, 6, 13, 18, 26, 27, 28, 29, 30, 31
```
