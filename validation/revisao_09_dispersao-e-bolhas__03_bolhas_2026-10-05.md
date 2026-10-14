# Parecer de revisão: 09_dispersao-e-bolhas/03_bolhas

Data: 2026-10-05. Revisor independente. `npm run check -- 09_dispersao-e-bolhas/03_bolhas`: 0 com erro, 3 avisos (todos na `v1`).

| Versão | Motivo da revisão | Resultado |
|---|---|---|
| `v1_campanhas-por-cpl-e-qualificacao` | revisao_desatualizada | aprovada |
| `v2_campanhas-acima-do-teto-de-cpl` | sem_revisao | reprovada |
| `v3_plataformas-mes-a-mes-com-rastro` | sem_revisao | aprovada |
| `v4_investimento-zero-e-valores-desiguais` | sem_revisao | reprovada |

Há um bloqueante em cada versão reprovada, e os dois têm a mesma natureza: uma medida de eixo que nenhum texto visível do cartão nomeia. Todo o resto das duas versões foi varrido e está em ordem ou virou observação no README do modelo. As observações não precisam ser corrigidas para a versão voltar aprovada; corrigir junto é bem-vindo.

## v2_campanhas-acima-do-teto-de-cpl: reprovada

### Bloqueante 1. Pergunta 13, `ANO-2` e seção 14.1 (identificação)

**Evidência.** Nos dois PNGs, o eixo vertical traz só `0%`, `15%`, `30%`, `45%` e `60%`, e a linha horizontal de referência traz o rótulo `meta 30%`. A palavra "qualificação" não aparece em nenhum texto visível: nem no título ("Campanhas acima do teto de CPL"), nem no subtítulo, nem na linha de leitura ("3 de 24 campanhas passam do teto de R$ 120 de CPL"), nem na régua, nem no rodapé. Ela existe só no `aria-label` e na dica (`name="Qualificação"` no `YAxis`, linha 300 do `Chart.tsx`). Quem olha o cartão sabe que X é CPL, porque a linha do teto diz `teto R$ 120`, e sabe que a área é investimento, mas não tem como saber percentual de quê é a posição vertical nem de quê é a meta. A `ANO-2` pede anotação "com nome e valor", e "meta" nomeia o tipo da linha, não a medida.

**Por que bloqueia.** A posição em Y é uma das duas leituras principais do modelo, e a 14.1 põe identificação entre as regras que decidem o que o desenho afirma. Na `v1` e na `v3` a mesma falta de nome no eixo é observação, porque o título ou o subtítulo do cartão nomeiam as duas medidas; aqui nenhum texto nomeia.

**O que mudar.** Escrever o nome da medida no desenho, sem depender da dica. Qualquer uma das saídas serve: nome dos eixos em texto de 11 px em `--text-muted` na margem reservada ("CPL" e "taxa de qualificação"); ou o rótulo da linha como "meta de qualificação 30%", com a margem direita refeita para ele caber (hoje são 72 px, medidos para "meta 30%"); ou a linha de leitura citando a qualificação e a meta. O texto novo não pode colidir com os tiques, com `teto R$ 120` nem com o rótulo "Evento presencial", que já entra na margem direita.

### Conferido e em ordem

- Encoding: `ZAxis` com `domain` de zero ao máximo e `range` em área; raio de 17 px medido no PNG para R$ 96 mil; régua pela mesma conta, terminando no máximo observado (`ROT-5b`); `RAIO-CONTRA-AREA` passou.
- Números: 3 campanhas acima de R$ 120 (132, 148 e 176), R$ 246,0 mil de R$ 848,0 mil, conferidos somando o `data.ts`.
- Cor e contraste: destaque em `--chart-1` cheio, neutro em `--text-muted` com o desvio da 17.2 declarado no `meta.json`, sem opacidade; destaque também por rótulo e peso (`COR-2`, `ACE-2`); um rótulo em 700 e dois em 600 (`TIP-3`).
- Eixos: grade nos dois sentidos (`EIX-3b`), `axisLine={false}`, `tickLine` e `tickMargin` em ordem, tiques de moeda por `formatCurrencyAxis`, cinco tiques por eixo desenhados.
- Referências: duas `ReferenceLine` com `ifOverflow="extendDomain"` e rótulo em margem reservada, sem corte nos dois temas.
- Vazio, dica, frase acessível (214 caracteres), dado fictício e canvas por número declarado na nota: em ordem.

### Observações (no README, não reprovam)

- O halo de "Webinar ao vivo" interrompe o tracejado do teto e deixa um resto de traço entre "ao" e "vivo"; a anticolisão não trata linha de referência como obstáculo.
- Três anotações (teto, meta e rodapé) contra as duas da `ANO-1`.
- Palavra "Investimento" da régua desalinhada da base dos valores.

## v4_investimento-zero-e-valores-desiguais: reprovada

### Bloqueante 1. Pergunta 14, `NUM-6` e seção 14.1 (unidade e identificação)

**Evidência.** Nos dois PNGs, os tiques do eixo X são `0`, `500`, `1.000`, `1.500`, `2.000` e `2.500`, escritos por `tickFormatter={formatInt}` (linha 167 do `Chart.tsx`), sem substantivo. A `NUM-6` é literal: "contagem solta leva o substantivo". A palavra "leads" não aparece em nenhum texto visível do cartão: título, subtítulo, linha de leitura ("A maior verba é 233 vezes a menor..."), régua e as duas notas do rodapé falam só de verba. O eixo Y traz só o `%`, e "qualificação" também não aparece em lugar nenhum da tela. As duas palavras existem apenas no `aria-label` e na dica (`name="Leads"` e `name="Qualificação"`).

**Por que bloqueia.** Unidade e identificação estão na lista da 14.1 que bloqueia sempre. Sem o substantivo, a posição horizontal não se lê: 2.500 pode ser lead, real ou clique. O `data.ts` explica que X é contagem de leads justamente para a campanha de verba zero ter posição no plano, e essa decisão, que sustenta a versão, não chega a quem olha o cartão.

**O que mudar.** Dar o substantivo à contagem e nomear as duas medidas no desenho, sem depender da dica. Saídas possíveis: nome dos eixos em texto de 11 px em `--text-muted` na margem reservada ("leads gerados" no X e "taxa de qualificação" no Y); ou o substantivo no próprio tique, se couber sem colisão entre vizinhos (`ROT-9`); ou a linha de leitura nomeando as duas medidas. O cartão já escreve quatro linhas além do plano, então refaça a conta da `GEO-1` se entrar linha nova, e confira que o nome do eixo não encosta nos tiques nem na régua.

### Conferido e em ordem

- Os três estados do investimento: verba acima de zero em bolha cheia, zero medido em anel tracejado de raio 5 px com `R$ 0 medido` escrito na régua (`EST-3`, `ACE-2`), e `null` fora do plano, contado no rodapé com `formatUnavailable()` (`EIX-10`, `EST-2`, `DAD-2`). Nenhuma ausência vira zero. Três anéis e treze bolhas contados no PNG, contra 3 e 13 no `data.ts`.
- Piso de área: declarado na tela e calculado do dado. R$ 900 ocupa 9,0% da área da maior e vale 0,43% dela, conferido à mão; `RAIO-CONTRA-AREA` passou (área com piso). A régua usa a mesma conta afim, então os círculos de referência são fiéis à escala desenhada.
- Números: 233 vezes (210.000 por 900), R$ 542,8 mil somados, conferidos no `data.ts`.
- Cor e contraste: `--chart-1` cheio com contorno do cartão, anel em `--text-muted`, sem opacidade, legível nos dois temas.
- Eixos: grade nos dois sentidos, `axisLine={false}`, `allowDecimals={false}` na contagem, cinco e seis tiques desenhados. Nenhuma bolha cortada na borda esquerda (a de 90 leads fica inteira).
- Vazio, dica, frase acessível (227 caracteres), dado fictício e canvas por número declarado na nota: em ordem.

### Observações (no README, não reprovam)

- A nota "R$ 900 lê 9% da área e vale 0,4%" não diz de quê.
- Sem nenhuma verba acima de zero, o bloco de vazio leva junto as campanhas de zero medido.
- `formatUnavailable()` dentro da frase do rodapé, sem o ícone `Unplug`.
- Palavra "Investimento" da régua desalinhada da base dos valores.

## Versões aprovadas

- `v1_campanhas-por-cpl-e-qualificacao`: o motivo da reprovação de 2026-09-28 (`ACE-5`, bolha a 2,44:1 no claro) não existe mais no arquivo de hoje: a linha 125 do `Chart.tsx` desenha `--chart-1` cheio, sem `fillOpacity`. Julgada inteira de novo, sem bloqueante. Observações no README do modelo.
- `v3_plataformas-mes-a-mes-com-rastro`: sem bloqueante. Área conferida à mão porque a guarda não mediu. Observações no README do modelo.

---

# Segunda passada, 2026-10-05: retorno da correção da v2 e da v4

Julgados os arquivos de hoje (`Chart.tsx` das 07:08), não a nota acima. `npm run check -- 09_dispersao-e-bolhas/03_bolhas`: 0 com erro, 3 avisos (todos na `v1`). As duas versões voltam **reprovadas**, cada uma com um bloqueante, o mesmo nas duas.

O que a correção resolveu, e fica: a identificação das medidas. Na `v2` o eixo vertical agora diz "Taxa de qualificação". Na `v4` o eixo horizontal diz "Leads gerados (contagem)", que dá o substantivo à contagem (`NUM-6`), e o vertical diz "Taxa de qualificação". Os dois bloqueantes da primeira passada estão fechados.

## v2_campanhas-acima-do-teto-de-cpl: reprovada

### Bloqueante 1. Pergunta 10, `TIP-5`

**Evidência.** Linha 301 do `Chart.tsx`: `label={{ angle: -90, ..., position: 'insideLeft', value: 'Taxa de qualificação' }}` no `YAxis`. No `preview.svg` o texto sai com `transform="rotate(-90, 9, 138.5)"`, e nos dois PNGs "Taxa de qualificação" está de pé, lido de baixo para cima, à esquerda dos tiques. A `TIP-5` é literal: "Texto sempre horizontal. Nenhum `angle` em tique e nenhum `rotate` em texto." Busca por `angle: -90`, `angle={-90}` e `rotate(-90` em todos os `Chart.tsx` do acervo devolve só esta versão e a `v4`.

**Consequência medida além da leitura.** O giro tirou a versão de três guardas: `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e `TEXTO-NA-MARCA` saem como `preview_com_transform` na `v2` e na `v4` e continuam medindo a `v1` e a `v3`. O `preview.svg` do commit anterior não tinha `rotate` nenhum. Esta é a versão com três rótulos diretos com halo sobre a nuvem, que é o caso que essas guardas existem para medir.

**O que mudar.** Tirar o `angle` e escrever o nome na horizontal. Saídas que cabem no desenho de hoje, qualquer uma serve:
- nome acima do eixo Y, alinhado à esquerda, na faixa de `MARGIN.top` (24 px): o rótulo `teto R$ 120` fica em x de 523 px e não disputa o lugar;
- o rótulo da linha como "meta de qualificação 30%", com a margem direita refeita para ele e sem encostar em "Evento presencial", que já entra nessa margem;
- a linha de leitura citando a qualificação e a meta.

Junto, devolver `Y_AXIS_WIDTH` à faixa de 48 a 64 da `EIX-6` (está em 68 só para abrigar o texto de pé) e conferir no `check` que as três guardas voltaram a medir a versão.

### Conferido nesta passada e em ordem

- Encoding, números, cor, referências, vazio, dica e dado: nada mudou desde a primeira passada além do `label` e da largura do eixo; reconferidos no arquivo de hoje. `RAIO-CONTRA-AREA` passou.
- Colisão e contraste de texto, à mão, porque as guardas não mediram: tiques do Y ancorados à direita em x de 62 px, nome girado em x de 9 px, sem toque; "Evento presencial" (y de 66 px) e `meta 30%` (y de 138,5 px) na margem direita, sem toque nem corte; texto em `--text-muted` e `--text-primary` sobre o cartão nos dois temas.
- Frase acessível medida pela guarda; `EIXO-CALMO` sem aviso.

## v4_investimento-zero-e-valores-desiguais: reprovada

### Bloqueante 1. Pergunta 10, `TIP-5`

**Evidência.** Linha 179 do `Chart.tsx`: o mesmo `label` com `angle: -90` no `YAxis`; no `preview.svg`, `transform="rotate(-90, 9, 109.5)"`; nos dois PNGs "Taxa de qualificação" está de pé. Mesma consequência nas guardas: `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e `TEXTO-NA-MARCA` não mediram a versão.

**O que mudar.** Tirar o `angle` e escrever o nome do eixo Y na horizontal: acima do eixo, alinhado à esquerda (hoje `MARGIN.top` é 14 px e o tique `60%` fica em y de 14 px, então a margem de cima cresce para caber a linha de 11 px sem encostar nele), ou na linha de leitura. O nome do eixo X, "Leads gerados", já está na horizontal, a 7 px dos tiques, e **fica como está**. Devolver `Y_AXIS_WIDTH` à faixa da `EIX-6`. O cartão perdeu plano nesta correção (191 px de altura contra 256 px declarados na nota do `meta.json`); se a margem de cima crescer, refaça a conta da `GEO-1` e confira que os cinco tiques do Y continuam desenhados (`REC-29`).

### Conferido nesta passada e em ordem

- Os três estados do investimento, o piso de área declarado, os números (233 vezes, R$ 542,8 mil, 9% e 0,4%), cor e vazio: sem mudança, reconferidos. Três anéis e treze bolhas no PNG. `RAIO-CONTRA-AREA` passou.
- Colisão, à mão: nome do eixo X com linha de base em y de 244 px, tiques terminando perto de 229 px; nenhum texto cortado na base do plano nem encostado na régua, nos dois temas.
- Seis tiques no X e cinco no Y desenhados, grade nos dois sentidos, `axisLine={false}`.

## Nota de régua

A primeira passada sugeriu "nome dos eixos em texto de 11 px na margem reservada" sem lembrar a `TIP-5`, e o caminho mais curto no Recharts para nome de eixo Y é justamente o `label` girado. A seção 14.1 não declara o peso da `TIP-5`; aqui ela bloqueia porque o desvio é visível nos dois PNGs, é único no acervo e desligou três guardas. Observações desta passada estão no README do modelo.
