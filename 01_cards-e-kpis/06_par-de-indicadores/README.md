# Par de indicadores

## O que é

Cartão com dois números ligados por efeito e contraefeito: o volume que a equipe persegue (agendas, leads, contratos) no peso de KPI e a qualidade que pode pagar por ele (comparecimento, percentual qualificado, desconto) um degrau abaixo, unidos por um conector escrito. Cada número traz a própria variação, colorida pela própria polaridade e com a base nomeada, e uma linha de veredito calculada resolve em texto o caso em que as duas cores se opõem. Lê-se de cima para baixo: quanto de volume, com que qualidade e o que a combinação significa. É a resposta de desenho à lei de Goodhart: a métrica perseguida sozinha é otimizada à custa de outra, e o par põe esse custo na mesma leitura.

## Quando usar

* Volume que pode ser inflado à custa da qualidade: agendas e comparecimento, leads e percentual qualificado, contratos e desconto médio.
* Par declarado no dicionário de métricas, com a relação escrita e um corte de estabilidade para cada lado.
* Coorte acompanhada no tempo, em que o contraindicador só fecha dias depois do indicador (v1 e v4).
* Tela com dois ou três pares em faixa, cada um com coorte e veredito próprios (v3). Acima de três pares, a peça vira a grade do [modelo 07](../07_grade-e-tira-de-kpis/).
* Tamanho de dado: dois períodos por par, o atual e o de comparação. A forma de uma série longa mora no [modelo 02](../02_kpi-com-minigrafico-de-tendencia/).

## Quando evitar

* As duas medidas não têm relação de efeito e contraefeito: juntá-las no mesmo cartão sugere causalidade. Use dois KPIs simples do [modelo 01](../01_kpi-simples/).
* Entra uma terceira medida: três já não é par. Use a decomposição do [modelo 05](../05_kpi-com-decomposicao/) ou atual contra anterior e meta do modelo 01.
* A relação precisa ser vista em muitos pontos ou entidades: [dispersão, família 09](../../09_dispersao-e-bolhas/) ou [quadrantes, família 25](../../25_matriz-e-quadrantes/).
* Volume e qualidade de coortes diferentes lidos na mesma semana: comparar as agendas desta semana com as presenças desta semana mistura agendas marcadas antes. Monte a coorte antes de publicar.
* Denominador abaixo de 30: a taxa sai com o par e oscila por acaso; o veredito vira ruído. Prefira uma janela maior.

## Anatomia

1. Nome do par à esquerda, em `text-xs font-medium text-text-secondary`, e coorte ou período à direita, em `text-[0.6875rem] text-text-muted`, por `formatDate` ou `formatMonthShort`.
2. Indicador de efeito em `kpi-number text-3xl leading-none font-semibold` (30 px, Space Grotesk 600), com a unidade ao lado em `text-xs text-text-muted` ("agendas marcadas"), por `formatInt`, `formatHours` ou `formatCurrencyCompact`.
3. Variação do efeito: ícone lucide (`ArrowUpRight`, `ArrowDownRight` ou `ArrowRight`), sinal `+` ou `−` (U+2212) e valor em `text-positive`, `text-negative` ou `text-text-secondary`, pela polaridade da medida e pelo corte, seguidos da base em `--text-muted`: "contra 102 na semana anterior".
4. Conector escrito em `--text-muted`: "com". Na v1 ele vira "mas com" quando o volume melhora e o comparecimento piora além do corte.
5. Contraindicador um degrau abaixo, em `kpi-number text-sm font-semibold` (14 px), com o nome em `--text-secondary` e o par de volume em `--text-muted` com `tabular-nums`: "71,2% de comparecimento (84 de 118 agendas)".
6. Variação do contraindicador com a própria polaridade. Taxa varia em pontos percentuais, escritos com `formatDecimal` e a unidade "p.p."; valor, tempo e contagem variam em percentual, inteiro a partir de 10% e com uma casa abaixo disso.
7. Veredito calculado (v2, v3 e v4): a função pura `readPair` devolve um de cinco vereditos (melhora sem custo, efeito à custa do contraefeito, contraefeito à custa do efeito, piora e sem mudança relevante), escrito em `text-xs font-semibold text-text-primary` com ícone neutro em `--text-secondary`. Leva `aria-hidden`, porque a frase acessível da raiz já o traz.
8. Quadrante de 48 px (v2): SVG com o quadrante das duas melhoras em `--line-subtle`, eixos em `--line-strong` e seta em `--chart-1` do mês anterior (centro vazado) para o atual. Direita e acima são melhores nos dois eixos, qualquer que seja a polaridade, e a distância é medida em cortes de estabilidade, com saturação para a ponta nunca sair da caixa.
9. Estados (v4): coorte aberta com o ícone `Clock3`, a palavra parcial e o veredito suspenso até a data de fechamento; volume zero escrito como 0, com a taxa "sem base"; variações dentro do corte sem cor semântica.
10. Cartão próprio de moldura `stage`: `rounded-lg border border-line-subtle bg-surface-raised p-4`, com `role="group"` e frase acessível calculada do dado.

## Versões

* `v1_agendas-e-comparecimento-da-coorte`: pré-vendas com 118 agendas e 71,2% de comparecimento da mesma coorte. Demonstra a hierarquia de 30 px para 14 px, o conector escrito, cada variação com a própria polaridade e a base nomeada, e a coorte no tipo do dado: o denominador do comparecimento é o número de agendas do cartão. Preview [escuro](./v1_agendas-e-comparecimento-da-coorte/preview.svg) e [claro](./v1_agendas-e-comparecimento-da-coorte/preview-claro.svg).
* `v2_leads-e-percentual-qualificado-com-veredito`: marketing com leads em alta de 34% e qualificação em queda de 9,2 p.p. no mesmo cartão. Demonstra as cores opostas resolvidas pelo veredito em texto, a função pura de cinco vereditos e o quadrante de 48 px com a seta de jul/26 para ago/26. Preview [escuro](./v2_leads-e-percentual-qualificado-com-veredito/preview.svg) e [claro](./v2_leads-e-percentual-qualificado-com-veredito/preview-claro.svg).
* `v3_tres-pares-do-comercial`: faixa com fechamentos e desconto médio, handoff e aceite, funil criado e idade média. Demonstra coorte declarada por cartão, medidas de unidades diferentes, polaridades opostas convivendo, veredito que concorda com o artigo de cada medida e a linha do veredito reservada para os cartões terem a mesma altura. Preview [escuro](./v3_tres-pares-do-comercial/preview.svg) e [claro](./v3_tres-pares-do-comercial/preview-claro.svg).
* `v4_coorte-aberta-volume-zero-e-par-estavel`: os três casos limite lado a lado. Demonstra o contraindicador parcial com o veredito suspenso até a coorte fechar, o volume zero com a taxa sem base e o par estável sem cor semântica. Preview [escuro](./v4_coorte-aberta-volume-zero-e-par-estavel/preview.svg) e [claro](./v4_coorte-aberta-volume-zero-e-par-estavel/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual na página. O cartão já é a moldura: vai direto na grade, sem `VisualCard`, numa célula com altura; a faixa da v3 e da v4 pede a largura da linha inteira e empilha sozinha abaixo de 56rem.
2. Declare o par no registry antes de ligar o dado: relação escrita, polaridade e corte de estabilidade de cada lado. O cartão não decide quais duas métricas formam par.
3. Monte a coorte na consulta, não no componente: o numerador do contraindicador conta desfechos do volume do próprio cartão. Enquanto a coorte não fecha, preencha `closesOn` (v4) em vez de publicar a taxa como final.
4. Calibre os cortes com o time: corte baixo demais faz o veredito alternar toda semana, e corte alto esconde mudança real.
5. A variação de taxa usa `formatDecimal` com a unidade "p.p." porque `formatPercentPoints` do Farol imprime `9,2%` e confundiria variação com taxa. Se o Farol ganhar um formatador de pontos percentuais, troque a função local `pointsText` por ele.
6. Confira os estados que a versão escolhida não desenha: período anterior ausente, volume zero e coorte aberta ganham desenho próprio na v4; na v1 e na v2 o caminho existe, sem desenho dedicado. Ao colar, o estado vazio inline da faixa dá lugar ao `EmptyState` do Farol.

## Referências

* [Nightingale, Dashboard Psychology, Effective Feedback in Data Design](https://nightingaledvs.com/dashboard-psychology-effective-feedback-in-data-design/). Dois números lado a lado para provocar comparação, e o referencial que diz tanto quando agir quanto quando parar de se preocupar: é o papel do corte de estabilidade.
* [Wikipedia, Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law). As formulações de Goodhart e de Strathern e os exemplos de medida que se degrada sob pressão, motivo de existir do par.
* Andy Grove, High Output Management (1983), citado como origem dos indicadores pareados. A [página do livro na Wikipedia](https://en.wikipedia.org/wiki/High_Output_Management) não menciona o conceito, e o estudo não achou fonte aberta que o confirme.
* [Behance, Analytics Metric Cards UI](https://www.behance.net/gallery/255429155/Analytics-Metric-Cards-UI). Conferir se algum cartão combina duas medidas com a relação escrita e a comparação em peso menor.
* [Anatomy of the KPI Card](https://nastengraph.substack.com/p/anatomy-of-the-kpi-card). Período, nome e valor como obrigatórios e o peso do delta contra o número, que o par repete nos dois lados.
* Estudo da família: [`_estudo/familias/01_cards-e-kpis.md`](../../_estudo/familias/01_cards-e-kpis.md), seção 1.25.
* Farol: `app/src/components/visuals/KpiCard.tsx` (variação com ícone, cor pelo sentido do bom, ausência nunca vira zero) e `app/src/lib/format.ts` (`formatRateWithVolume`, `formatHours`, `formatPercentPoints`).

## Observações da revisão (não bloqueantes)

_Duas revisões independentes em 2026-09-15, as quatro versões aprovadas nas duas; nada abaixo reprova._

- Todas: o número da base (`102`, `1.630`, `68,6%`) leva `kpi-number` sem peso declarado e pede Space Grotesk 400, que o Farol não carrega (TIP-4); o navegador cai no 500 e a leitura não muda, mas vale escrever `font-medium`.
- `v1`: o `data.ts` só percorre o caminho feliz; `previous: null` e agendas zero existem no código sem aparecer no preview (a v4 cobre esses casos).
- `v1` e `v2`: a linha de variação da taxa nomeia o valor de base (`contra 68,6% (70 de 102)`) sem o período, que só está na linha do volume acima (NUM-4).
- `v2`: o quadrante das duas melhoras é preenchido com `--line-subtle`, que a 17.10 reserva para grade e borda (1,25:1); a legenda escrita "acima e à direita é melhor" carrega o sentido, então a cor não é o único canal.
- `v2`: o catálogo pede a variação em p.p. com `formatPercentPoints`, e a versão usa `formatDecimal` com a unidade escrita; o desvio está certo, porque `formatPercentPoints(9.2)` imprime `9,2%`, e é o catálogo que precisa ser acertado.
- `v3` e `v4`: a frase acessível do cartão sai com ponto duplo depois da unidade (`alta de 1,9 p.p.. O volume`), porque a descrição termina em `p.p.` e o molde acrescenta `. `.
- `v3`: a frase acessível do cartão escreve a variação sem a base (`alta de 24%`), e a `ChangeLine` visível trunca justamente a base em cartão estreito (TIP-7).
- `v3`: o estado de efeito sem base desenha "sem base" em `font-display text-xl` sem peso, um quarto tamanho (20 px) fora da 17.1 e Space Grotesk 400 não carregado; o caminho não aparece no preview.
- `v3`: "handoff" fica em inglês no rótulo, na coorte e no veredito; é jargão da casa, mas a frase de tela poderia dizer "repasse".
- `v4`: a frase acessível do terceiro cartão mede 245 caracteres, a 5 do teto da ACE-1; um nome de par um pouco maior estoura.
- `v4`: `noPrevious` e `noRelevantChange` usam o mesmo ícone `Equal`, então "sem período anterior" e "nada mudou" se distinguem só pelo texto.
- Todas: período anterior com volume zero sai como "sem semana anterior medida" (v1), "sem mês anterior medido" (v2), "sem jul/26 medido" (v3) ou "sem período anterior medido" (v4), chamando de ausência um zero medido (EST-3, EST-4); nenhum preview passa por esse caminho, mas vale escrever que a base foi 0.
- Todas: a contagem da base sai sem substantivo (`contra 102 na semana anterior`, `contra 34 em jul/26`, `(70 de 102)`); a unidade está na linha de cima e a leitura não muda, mas a NUM-6 pede o substantivo.
- Todas: nenhuma versão tem a prop opcional `height` da seção 5; o cartão de moldura `stage` tem altura natural e não quebra, mas a prop ajuda quem cola numa célula sem altura.
- Todas: os canvas são medidas próprias (400 x 280, 400 x 340 e 1120 x 320) em vez do `kpi-alto` e da `faixa` que o catálogo sugere; o motivo está em `notes`, e é o catálogo que precisa ser acertado.
- `v2`: `meta.json` escreve `−9,2 p.p.` e o catálogo escreve `−9 p.p.`; a versão segue a NUM-1 (uma casa abaixo de 10), então o catálogo precisa ser acertado também aqui.
- `v3`: a coorte "criado em ago/26" mede "idade média na carteira", que depende do dia da medição; lida no mesmo dia, a coorte de jul/26 é mais velha por construção e o veredito "A idade média caiu à custa do funil criado" pode ser artefato. Vale declarar a idade numa distância fixa da criação, como "aos 30 dias", no rótulo e no comentário do `data.ts`.
- `v3`: a frase acessível da faixa junta `effectOverCounter` e `counterOverEffect` em "2 com ganho à custa do outro lado", sem dizer que num par ganhou o volume e no outro a idade; a frase de cada cartão diz.
- `v4`: a taxa parcial `41,3%` fica na mesma linha de "a semana anterior fechou em 69,8%", e o olho faz a queda de 28 p.p. que o código se recusa a calcular; a marca parcial e o veredito suspenso seguram a honestidade, mas a taxa fechada poderia vir com "compare depois de 20/09/2026".
