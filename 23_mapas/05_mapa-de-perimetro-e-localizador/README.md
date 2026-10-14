# Mapa de perímetro e localizador

## O que é

Um mapa de contexto: acende as UFs de um recorte (o perímetro de atuação, a região a que uma participação de mercado se refere) e deixa o resto do país em tom neutro, para dizer a que geografia o número ao lado pertence. Não é o gráfico analítico da página; é o que impede o número de ser lido como nacional. O perímetro ganha um contorno externo único, sem que os polígonos sejam dissolvidos: os mesmos polígonos são desenhados duas vezes, primeiro só com um contorno grosso, depois com o preenchimento por cima, que cobre a metade interna do contorno e todas as bordas entre vizinhos. Lê-se em duas camadas: fora, a malha neutra; dentro, o recorte preenchido e contornado.

**Neste catálogo o mapa não usa a malha do IBGE.** A lista de imports do contrato é fechada e a versão só aceita cinco arquivos, então não existe o módulo de geometria (`ufPaths.ts`) que o estudo da família previa. As quatro versões desenham sobre a mesma **malha de hexágonos** do coroplético (`23_mapas/02_coropletico-por-uf`), feita à mão e declarada no `data.ts` de cada versão, com as vizinhanças que ela cria e as que ela perde escritas no comentário. Os hexágonos se tocam sem vão, que é o que a técnica das duas passadas pede.

## Quando usar

- Ao lado de um KPI que só vale para um recorte geográfico, como participação de mercado ou mercado endereçável do perímetro.
- Para mostrar o perímetro atual e uma expansão proposta, com a estimativa em faixa e a procedência de cada número.
- Para colorir por uma taxa só as UFs do perímetro e deixar o resto sem cor, quando o perímetro tem até cerca de 12 UFs.
- Para registrar que o perímetro mudou, desde quando os números valem e quais deixaram de ser comparáveis.
- Aguenta as 27 UFs na malha; o que limita é o cartão: com célula abaixo de 34 px a sigla de 11 px deixa de caber, e a miniatura de 120 px sai sem sigla.

## Quando evitar

- A pergunta é a distribuição de um valor em todas as UFs: use o coroplético (`23_mapas/02_coropletico-por-uf`).
- O perímetro não é geográfico, e sim segmento ou carteira: use o perímetro aninhado (`12_hierarquia/05_perimetro-aninhado`).
- O cenário é numérico e sem geografia: use a faixa de cenário contra meta (`13_progresso-meta-e-gauge/07_faixa-de-cenario-contra-meta`).
- A forma real do território faz parte da resposta (fronteira, litoral, distância): este modelo desenha vizinhança aproximada, não contorno.
- A pergunta é só qual UF é maior dentro do perímetro: use as barras ordenadas (`02_barras-horizontais/01_barras-simples-ordenadas`).

## Anatomia

1. **Malha.** Constante `HEX_GRID` no `data.ts`, um `Record` de UF para linha e coluna, com as linhas ímpares deslocadas meia célula. A geometria (centro e vértices de cada hexágono) é calculada uma vez, fora do componente, por `buildLayout`, e o `<svg>` é desenhado em escala 1, com `width` e `height` iguais ao `viewBox`, para o texto de 11 px chegar com 11 px.
2. **Fora do perímetro.** Hexágono em `--surface-sunken` com traço de 1 px em `--line-strong`. O preenchimento mede 1,15:1 contra o cartão, então é o traço que segura a silhueta do país. O catálogo pedia `--surface-overlay`, que no tema claro é o mesmo branco do cartão (TOK-1).
3. **Perímetro, primeira passada.** Os hexágonos do recorte sem preenchimento, com traço de 4 px em `--text-primary` e `strokeLinejoin="round"`.
4. **Perímetro, segunda passada.** Os mesmos hexágonos com o preenchimento (`--chart-1`, ou a classe da rampa na `v2`) e um traço fino de 1 px por cima. Sobra visível 1,5 px de contorno externo. A ordem das duas passadas é o que faz a técnica funcionar: invertidas, o contorno grosso cobre o preenchimento.
5. **Recorte tracejado (`v3`, `v4`).** A mesma técnica com `strokeDasharray`: traço e vão de um sexto do lado do hexágono e deslocamento de meio traço, o que dá 3 ciclos exatos por lado e um traço inteiro em cada vértice. O recorte tracejado é sempre desenhado antes do cheio, para a divisa entre os dois sair cheia.
6. **Sigla.** `<text>` de 11 px no centro do hexágono: `--accent-cyan-contrast` sobre `--chart-1`, `--text-primary` no recorte tracejado e `--text-muted` fora. Na `v1` a miniatura não tem sigla e é `aria-hidden`.
7. **Número e procedência.** Participação por `formatPercent` com uma casa, sempre derivada de receita e mercado declarados no `data.ts`, e o par escrito por `formatCurrencyCompact`. A etiqueta de procedência usa `text-prov-medido`, `text-prov-derivado` e `text-prov-premissa`. Na `v2` a rampa tem 3 classes e a cor entrega só dois níveis seguros (a classe baixa contra as duas altas); a ordem inteira mora no percentual escrito em cada hexágono. Na `v3` a faixa ao lado do mapa repete o traço das marcas: ponto cheio para o medido, faixa vazada e tracejada para a premissa, em escala que começa no zero.
8. **Ausência.** Participação sem medição ou sem mercado de referência sai por `formatUnavailable()` com o ícone `Unplug`, nunca zero.
9. **Raiz.** `figure` (ou `article` com `role="group"` na `v1`, que é o próprio cartão) com `aria-label` calculado do dado: as UFs de cada recorte, a participação e a data de vigência.

## Versões

- `v1_miniatura-ao-lado-do-card-de-participacao`: cartão de KPI de moldura `stage` com a participação, a legenda escrita do perímetro, o par de receita e mercado, a data de vigência e a miniatura de 120 px ao lado, sem sigla e decorativa.
- `v2_participacao-so-dentro-do-perimetro`: as 7 UFs do perímetro pintadas em 3 classes da rampa sequencial (`--seq-3`, `--seq-6` e `--seq-7`), com sigla e percentual em cada uma, as outras 20 em tom neutro e sem dica, legenda em degraus com as UFs de cada classe por extenso e a nota de que o número nacional não é a soma do mapa.
- `v3_perimetro-atual-e-expansao-proposta`: contorno cheio no perímetro vigente e tracejado nas 4 UFs da expansão, painel com a participação medida e a estimada em faixa, cada uma com a sua procedência, e as duas desenhadas na mesma escala.
- `v4_perimetro-que-mudou-de-vigencia`: prop `shownPerimeter` que alterna o perímetro aceso sem mudar a escala, selo com a data de vigência, ícones `Plus` e `Minus` nas UFs que entraram e saíram, aviso de que as duas participações não se comparam, receita e mercado escritos sob cada participação medida (`formatCurrencyCompact`) e ausência escrita onde não houve medição.

## Como colar no Farol

1. Copie o `Chart.tsx` e o `data.ts` da versão. A chave de toda UF é a sigla (`UfCode`); o perímetro chega como lista de siglas e a participação como receita e mercado, nunca como taxa pronta.
2. Troque `HEX_GRID` pela malha versionada do Farol quando ela existir. Se o Farol ganhar o módulo de paths do IBGE, a técnica das duas passadas vale igual para `<path>`: troque `hexPoints` pelo `d` de cada UF e ponha `vectorEffect="non-scaling-stroke"` nos traços, porque ali o grupo é escalado.
3. Não inverta a ordem das camadas do `<svg>`: fora, recorte tracejado (contorno, depois preenchimento), recorte cheio (contorno, depois preenchimento), siglas. Cada uma cobre um pedaço da anterior de propósito.
4. Na `v1` o cartão é a própria peça: não embrulhe num `VisualCard`, ou a etiqueta de procedência aparece duas vezes. Nas outras três, embrulhe e deixe o período do recorte no título do cartão.
5. Na `v3` e na `v4` o mapa e a faixa têm tamanho fixo em px. Trocar o canvas pede refazer a conta que está no `notes` do `meta.json` de cada uma.
6. Na `v4`, ligue `shownPerimeter` a um controle da página (dois botões, vigente e anterior). A tabela ao lado não muda com a prop, só o mapa e a legenda dele.
7. Troque os estados vazios inline por `EmptyState` e as células de ausência por `UnavailableState` na variante compacta (seção 16 do contrato).

## Referências

- Datawrapper Academy, mapas localizadores como tipo próprio: o mapa como contexto, não como gráfico principal.
- Datawrapper Academy, categoria de mapas coropléticos: os artigos sobre ocultar regiões, base da `v2`.
- IBGE, documentação da API de malhas v3: a malha por UF que este modelo usaria em duas camadas, se houvesse módulo de geometria.
- Arquivos do Farol de referência: `app/src/styles/tokens.css` (tokens de superfície, de procedência e a rampa `--seq-N`) e `app/src/lib/format.ts`.
- Pedido registrado: um módulo de geometria (`ufPaths.ts`, paths da malha do IBGE em qualidade mínima) como import liberado na seção 6 do contrato. Sem ele o contorno real não entra e este modelo fica na malha de hexágonos, o mesmo pedido já feito em `23_mapas/02_coropletico-por-uf` e `23_mapas/03_simbolos-proporcionais`.

## Observações do produtor (não bloqueantes)

_Escritas em 2026-10-13, ao entregar as quatro versões. Nenhuma tem consequência medível no preview; ficam para quem tocar os arquivos depois._

- As quatro: `ESPESSURA-MARCA` sai sem medir (`sem_marca_de_barra` em três e `marca_fora_do_bar` na `v3`), porque a marca é `<polygon>`. A sigla e o percentual dentro do hexágono foram conferidos nos dois PNGs de cada versão.
- `v1`: `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e `TEXTO-NA-MARCA` saem `texto_em_html`, porque todo o texto do cartão mora em `foreignObject` e a miniatura não tem texto. O silêncio delas não vale como aprovação; a conferência foi visual, nos dois temas.
- `v1`, `v3` e `v4`: `FORMATO-ACESSIVEL` sai `frase_sem_formatador`, porque a frase acessível e o corpo usam as mesmas variáveis já formatadas (o número é calculado uma vez e escrito nos dois lugares). A igualdade foi conferida lendo a frase gravada no preview contra o PNG.
- `v2`: na legenda, a classe com 3 UFs quebra os nomes em duas linhas nos 306 px da coluna. Com perímetro maior a legenda cresce e pode passar da altura do mapa; ali vale trocar o nome por extenso pela sigla, ou o canvas.
- `v2`: o ramo da UF do perímetro sem mercado de referência (hexágono no poço com tracejado por dentro e ícone `Unplug`, mais um item próprio na legenda) não é exercitado pelo dado padrão e foi lido só no código.
- `v3`: a faixa das duas participações é um SVG de 560 px fixos. Em cartão mais estreito que o `largo` ela passa do painel; a conta está no `notes` do `meta.json`.
- `v3`: a leitura adotada para a faixa de 5,1% a 6,8% é a participação nas 4 UFs novas, sobre o mercado delas. Se o plano quiser dizer a participação do perímetro ampliado, muda o dado e a nota do rodapé, não o desenho.
- `v4`: o preview retrata só o modo `current` da prop `shownPerimeter`. O modo `previous` (perímetro anterior aceso, a UF que entrou em tracejado, a legenda trocada) foi lido no código e não renderizado, porque a ferramenta monta a versão sem props.
- `v2`, `v3` e `v4`: o período de referência das parcelas só existe no comentário do `data.ts`; fica para o título do `VisualCard` (DAD-9). Na `v1`, que é o próprio cartão, o mês de referência está escrito no canto.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-10-13, sobre as quatro versões. `v1`, `v2` e `v3` aprovadas; `v4` reprovada por taxa sem volume, com o parecer em `validation/revisao_23_mapas__05_mapa-de-perimetro-e-localizador_2026-10-13.md`. O que segue não reprova._

- `v1`: a malha de fora da miniatura não tem sigla e nenhum elemento dela chega a 3:1 contra o cartão (poço 1,15:1; traço `--line-strong` 1,79:1 no escuro e 1,83:1 no claro). Lê nos dois PNGs como pano de fundo, e as UFs estão escritas ao lado. Se a miniatura deixar de ser decorativa, o traço sobe para `--text-muted`, o contorno de ausência da seção 17.2.
- `v1`: a legenda escrita `no perímetro Sul e Sudeste` mede 151 px numa coluna de 164 px. Nome de perímetro mais longo quebra em duas linhas e as linhas escritas passam dos 130,5 px da coluna. O dado padrão não exercita caso difícil (pergunta 23).
- `v1`: preview contra página, medido na revisão com limiar de 25 por canal: 0,35% no escuro e 0,50% no claro, na borda arredondada do cartão e no kerning da etiqueta. A miniatura é idêntica nos dois, e o render não gravou imagem de diferença.
- `v1`, `v3` e `v4`: no ramo sem mercado de referência a frase acessível escreve `de indisponível`, e na `v1` o par segue escrevendo o mercado zerado em reais. Lido no código, sem render.
- `v2`: o percentual de cada hexágono vai sem o par de receita e mercado, que fica na dica nativa (DAD-1); o par do perímetro está escrito. Mesmo tratamento de `23_mapas/02_coropletico-por-uf/v1`. O Espírito Santo, com 2,1% de R$ 40,0 mi, é onde o volume muda a leitura.
- `v2`: a legenda ocupa cerca de 115 dos 225 px do corpo (51%), acima dos 30% da ROT-4. Fica ao lado do mapa, sem consequência. A coluna do intervalo está alinhada à esquerda (TIP-6).
- `v2`: `--seq-6` contra `--seq-7` mede 1,45:1 e 1,52:1 (TOK-8): quem separa São Paulo das três UFs da classe alta é o número, que está em todo hexágono.
- `v2`, `v3` e `v4`: texto em `font-display` sem peso declarado herda 400 e o navegador entrega 500 (TIP-4): o percentual do hexágono na `v2`, os tiques da faixa na `v3` e a célula sem destaque da tabela na `v4`. Sem consequência visível.
- `v3`: as etiquetas MEDIDO e PREMISSA ficam dentro do Chart de moldura `card`, contra a ANO-6 e a pergunta 17. O catálogo pede, o `notes` declara, e elas estão em texto (5,34:1 e 5,74:1 no claro), não em marca. Mesma tensão já anotada em `25/04`, `25/05`, `25/07` e `22/05`. Ao colar, o selo do `VisualCard` dirá um grau só para um painel que tem dois.
- `v3`: a faixa redesenha os dois números impressos logo acima dela, sem rótulo nas marcas (pergunta 2). O que ela acrescenta é mostrar a faixa inteira abaixo do ponto medido.
- `v3`: os dois números do painel estão em 24 px, tamanho que a tabela 17.1 não lista (30 px para KPI, 14 px para apoio), e o título `Expansão proposta para 2027` não leva algarismo tabular (TIP-1). Sem consequência visível.
- `v4`: o caso de uso do `meta.json`, literal do catálogo, escreve a data como `2026-03-01` e ela aparece no subtítulo do cartão ao lado de `01/03/2026` no corpo (NUM-7).
- `v4`: a legenda do mapa não nomeia o tom neutro de fora dos dois perímetros nem os ícones de mais e de menos, que só se explicam na tabela ao lado.
- `v4`: a tabela não diz o período em que cada participação foi medida (DAD-9); ao escrever o par pedido no parecer, vale dizer também de quando ele é.

_Segunda rodada, 2026-10-13, só a `v4`, julgada pelo arquivo corrigido: aprovada. As quatro participações agora levam receita e mercado, cada par refaz o percentual ao lado e os dois mercados imprimem valores diferentes (R$ 1,4 bi e R$ 1,3 bi). `npm run check` com 0 erro e 1 aviso. O que segue não reprova._

- `v4`: a frase acessível tem 244 caracteres, a 6 do teto de 250 (aviso do `check`, ACE-1), e 245 no modo `previous`. Uma segunda UF trocando de lado, ou um nome mais longo que Espírito Santo, passa do teto; quando acontecer, o par sai da frase ou as UFs vão por sigla.
- `v4`: o modo `previous` da prop `shownPerimeter` segue sem PNG, porque a ferramenta monta a versão sem props. Lido no código de hoje: Mato Grosso do Sul acende com o menos, Espírito Santo fica tracejado com o mais, a legenda troca para `perímetro anterior` e `só no vigente`, e a malha e a tabela não mudam. Nenhum defeito achado na leitura.
- `v4`: o selo tem borda de 1 px em `--line-strong` (1,79:1 no escuro e 1,83:1 no claro), contra a letra da ESP-5. É a borda que faz dele um selo no tema claro (TOK-1), e o texto dentro mede 8,16:1 e 8,13:1. Sem consequência visível.
- `v4`: a legenda fica abaixo do mapa, e a ROT-4 diz acima ou ao lado. Tem 16 px de altura e cabe no corpo; continua sem entrada para o tom neutro de fora e para os ícones, como já anotado.
- `v4`: o destaque de peso 600 nas duas participações do perímetro não se distingue, nos dois PNGs, das duas de UF, que herdam 400 e saem em 500 (TIP-4). Declarar o peso da célula sem destaque resolve os dois pontos.
- `v4`: nas linhas de UF o nome da medida não se repete; quem diz que `2,1%` e `14,5%` são participação é o par logo abaixo e a linha `Participação no perímetro` acima.
- `v4`: o `notes` do `meta.json` termina com `cerca de 190 px de linhas escritas` na coluna lateral, e a mesma nota diz cerca de 270 px antes. Medido no PNG: 267 px de tinta, de 104 a 371 px, com cerca de 27 px de sobra no pé do corpo. A conta que vale é a de 270.
- `v4`: seguem valendo da primeira rodada a data `2026-03-01` no caso de uso (NUM-7) e a falta do período de cada medição (DAD-9); os cabeçalhos `anterior` e `vigente` com o selo dão a fronteira de 01/03/2026, e o período exato fica para o título do `VisualCard`. Já o item sobre `de indisponível` na frase acessível deixou de valer para a `v4`: no ramo sem mercado a frase escreve só o estado de ausência no lugar do par (lido no código, sem render).
