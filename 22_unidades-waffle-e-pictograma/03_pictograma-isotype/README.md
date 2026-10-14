# Pictograma isotype

## O que é

Fileiras de ícones iguais em que cada ícone vale uma quantidade fixa, declarada na legenda: mais quantidade é mais ícones, nunca ícone maior, como manda o método Isotype. O modelo também cobre a matriz de 100 figuras, que traduz uma taxa em "x em cada 100" para público amplo. O ícone nunca é fatiado: a contagem arredonda para inteiro e o número escrito ao lado diz o resto. Feito em HTML com Tailwind, com ícones do lucide-react repetidos em flex ou grid e sem Recharts.

## Quando usar

- Contagem pequena, até cerca de 50 ícones por fileira, com ícone ligado à unidade (um troféu por vitória).
- De 2 a 6 fileiras de categorias, lidas por comprimento e por contagem.
- Taxa dita como x em cada 100 pessoas, para diretoria ou apresentação.
- Unidade que é pessoa (lead, cliente, integrante do time), onde a figura humana ajuda.

## Quando evitar

- Valores grandes ou decimais: barra horizontal com o número (02/01).
- Unidade que não é pessoa nem objeto reconhecível, como oportunidade ou conta: waffle (22/01).
- Diferenças finas entre categorias próximas: barras horizontais ordenadas (02/01).
- Ícone escalado pelo valor, que a área lê mal: repetir o ícone ou usar área quadrada (22/05).
- Tempo e categoria ao mesmo tempo: waffle em barras (22/02).
- Público que lê ícones como infantil: waffle 10x10 com a frase escrita (22/01).

## Anatomia

1. **Ícone:** `lucide-react` de 14 a 16 px com `strokeWidth` 2,5 para ter massa no tema escuro, sempre `aria-hidden`; cor por `style` com `var(--chart-N)` ou `var(--seq-N)`.
2. **Fileira ou matriz:** `flex` com `flex-wrap` para fileiras, `grid` de 10 colunas e linhas explícitas para a matriz de 100.
3. **Unidade:** constante nomeada no topo, escrita na legenda ("1 ícone = 10 leads") e na frase acessível; sobe de degrau quando a fileira passaria de 50 ícones.
4. **Contagem de ícones:** `Math.floor` para fileira com unidade, maior resto para matriz de 100 composições, `Math.round` só para fração única; categoria abaixo de um ícone fica com zero ícone e o texto "menos de um ícone".
5. **Número exato:** `formatInt` e `formatPercent` ao fim da fileira ou na legenda, em `font-display` ou `tabular-nums`.
6. **Ausência:** categoria sem coleta com `Unplug` e `formatUnavailable()` no lugar dos ícones; categoria sem origem em `--text-muted` e por último.
7. **Destaque:** peso 700 no nome e no número do item que carrega a mensagem; na matriz, foco na legenda troca as demais figuras para `--line-strong`, sem alfa.
8. **Frase acessível:** na raiz com `role="figure"`, calculada do dado, com ícones e matriz em `aria-hidden`.

## Versões

- `v1_vitorias-do-semestre-por-origem`: um troféu por vitória, 52 vitórias em 6 origens ordenadas pelo total, legenda "1 ícone = 1 vitória" e origem sem declaração por último. Card.
- `v2_clientes-novos-por-indicacao-em-cada-100`: matriz de 100 figuras `User` com blocos contíguos, frase "cerca de 3 em cada 10", legenda com percentual e contagem que acende a categoria, transição desligada com movimento reduzido. Quadrado.
- `v3_cada-100-leads-de-midia-paga`: três níveis aninhados (58, 21 e 4) na mesma matriz, lista com o resto de 42 sem telefone no nível de fora e os níveis aninhados em recuo e com "desses", venda de 0,6 em 100 só em texto e base real de 1.240 leads no rodapé. Card.
- `v4_leads-do-mes-em-icones-de-dez`: 1 ícone = 10 leads, 347 viram 34 ícones inteiros, origem abaixo de dez sem ícone, origem sem coleta com `Unplug` e unidade que sobe acima de 50 ícones. Card.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e passe o dado real pela prop `data`.
2. Mantenha o mapa de categoria para cor vindo do dado (`slot` na v2) ou da página, nunca da posição na lista ordenada.
3. A v1, a v3 e a v4 pedem um corpo de cartão de cerca de 240 px de altura; a v2 pede cerca de 370 px.
4. Os estados vazio e indisponível estão inline com `role="status"`; ao colar, troque por `EmptyState` e `UnavailableState` do Farol mantendo o texto.
5. A v2 usa estado de foco na legenda (`useState`); a peça precisa ser renderizada no cliente.
6. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/` e confira os dois temas.

## Referências

- Estudo da família: `_estudo/familias/22_unidades-waffle-e-pictograma.md`.
- Método Isotype de Otto Neurath e Marie Neurath: uma unidade, um ícone, e mais quantidade é mais ícones, nunca ícone maior.
- Waffle da mesma família, para a matriz sem ícone: `22_unidades-waffle-e-pictograma/01_waffle`.
- Ícones: `lucide-react` (`Trophy`, `User`, `Unplug`, `Filter`).

## Observações da revisão (não bloqueantes)

**2026-10-12, revisão independente das quatro versões.** `v1`, `v2` e `v4` aprovadas; `v3` reprovada, com os dois bloqueantes em `validation/revisao_22_unidades-waffle-e-pictograma__03_pictograma-isotype_2026-10-12.md`. O que segue não reprova e fica para quem tocar o arquivo.

- Modelo, README: a Anatomia diz ícone de 14 a 16 px e a `v2` desenha a figura em 18 px (`size-[18px]`, célula de 20 px). Alinhar o texto ou a constante.
- Modelo, "Quando usar": o teto de cerca de 50 ícones por fileira não cabe no canvas `card`. Medido no PNG, o corpo tem 574 px: a `v1` comporta 19 troféus de 16 px com vão de 4 px ao lado do nome, e a `v4` comporta 37 figuras de 14 px sem vão. Acima disso a fileira quebra em duas linhas e deixa de se ler pelo comprimento.
- `v1` e `v4`, NUM-6: o número no fim da fileira vai sem substantivo ("17", "347"). A unidade está no título e na legenda logo abaixo, sem ambiguidade.
- `v1` e `v2`, 17.1 e 17.2: o nome de "Sem origem declarada" está em `--text-secondary` como os demais, e na `v1` também o número; a tabela dá `--text-muted` ao texto da ausência. Os ícones já estão em `--text-muted`.
- `v1`, catálogo: o item do catálogo pede `role img` e a versão usa `role="figure"`, que é o que a seção 11 manda para composição com legenda. O `demonstrates` já diz figure, mas o `meta.json` não tem `notes` declarando a troca.
- `v2`, TIP-1: "dos 412 clientes novos do ano" (`Chart.tsx:115`) está em Manrope sem `tabular-nums`. Não está em coluna, sem consequência visível.
- `v2`, pergunta 2: 412 aparece duas vezes, na frase de apoio e em "n = 412 clientes". O rodapé pode ficar só com a unidade da figura.
- `v2`, ROT-5 e TIP-6: a contagem ("127 clientes") vai embaixo do nome, alinhada à esquerda, e não em coluna à direita como o percentual. A coluna da legenda tem 184 px e uma terceira coluna quebraria mais nomes; fica como escolha registrada.
- `v2`, ACE-5 e TOK-5: no foco da legenda as demais figuras trocam para `--line-strong`, que mede 1,79:1 no escuro e 1,83:1 no claro. Passa por ser estado passageiro em que toda parte continua com nome e número na legenda, mas o `notes` diz que a troca "evita a perda de contraste da ACE-5", e a própria ACE-5 lista esse token entre os que não alcançam 3:1 nem opacos. Reescrever a nota com o número medido.
- `v2`, ACE-2: as 5 figuras da ausência dividem a última coluna com 5 de Busca orgânica e se separam delas só pela cor (`--text-muted` contra `--chart-5`: 1,13:1 no escuro e 1,16:1 no claro em luminância, com matiz diferente). Todas as figuras são de contorno, então a ausência não tem forma própria. Segundo canal possível: categorias cheias e ausência em contorno, como a `v3` faz no nível final.
- `v2` e `v3`, 17.1: a frase em 24 px da `v2` e os números da lista da `v3` em 20 px ficam fora dos degraus da tabela (30 px para número de KPI, 14 px para valor de legenda). Sem colisão nem corte.
- `v4`, teto da unidade: `MAX_ICONS_PER_ROW` vale 50 e a fileira comporta 37 figuras (518 px, de 14 em 14). Com a maior origem entre 380 e 509 leads a unidade não sobe e a fileira quebra em duas linhas, num corpo que hoje tem cerca de 5 px de folga. O dado padrão (34 ícones) não chega lá. Derivar o teto da largura da fileira.
- `v4`, ramo sem render: a unidade ampliada e o aviso que a acompanha só existem no código, porque o dado padrão para em 34 ícones. Pela conta sobre o PNG o aviso soma cerca de 444 px ao lado de um total de cerca de 120 px, num corpo de 574 px: fica no limite, e se quebrar são 20 px a mais de rodapé. Conferir com um dado acima de 509 leads antes de colar.
- `v4`, DAD-9: o mês do recorte (agosto de 2026) só aparece na frase acessível; o corpo diz "leads com coleta" sem o mês. Escrever o mês no rodapé, por `formatMonthShort`.
- `v4`, EST-2: o `Unplug` da origem sem coleta leva `strokeWidth` 2,5 em 16 px e sai empastado nos dois PNGs; o traço padrão do ícone lê melhor.

**2026-10-12, segunda passada, só a `v3`, depois da rodada única de correção.** `v3` aprovada pelo arquivo corrigido. Os dois bloqueantes da primeira passada estão resolvidos no render: a lista ganhou a linha "42 não têm telefone, 521 leads" com amostra e valor escrito, e 42 mais 58 fecham os 100; os níveis aninhados dizem o nível por recuo de 12 px e pela palavra "desses"; a venda tem marcador vazado. Medido nos dois PNGs: 4, 17, 37 e 42 figuras, marcas coloridas de 3,72:1 a 10,12:1 contra o cartão, textos de 5,21:1 a 17,96:1. O que segue não reprova.

- `v3`, ramo sem render: o rótulo "vendem, menos de uma figura" (`Chart.tsx:131`) é texto fixo. Com venda de 1 em cada 100 ou mais, o motivo deixa de ser verdade e a venda continua sem figura na matriz. O dado padrão (0,6) não chega lá. Condicionar o texto a `wonPer100 < 1` antes de colar com dado real.
- `v3`, mesma linha: a coluna do número tem 32 px (`w-8`) e "0,6" ocupa 29,5 px medidos no PNG. Três algarismos em 20 px ("100", "12,3") não cabem e avançam sobre o vão da amostra.
- `v3`, ROT-4 e seção 7: a lista vai de fora para dentro (42, 58, 21, 4) e a matriz preenche do canto para fora (4, 21, 58, 42), com o tom neutro primeiro na lista e por último na matriz. Fica como escolha registrada: os dois irmãos do nível de fora juntos deixam os 100 à vista. A alternativa é a linha dos 42 por último, no recuo zero.
- `v3`, ACE-1 e DAD-5: a lista inteira é `aria-hidden`, então as contagens por nível (521, 719, 260, 50 e 7 leads) só existem para quem enxerga. A frase acessível, de 202 caracteres, traz as figuras e a base de 1.240. Tirar o `aria-hidden` da lista entrega as contagens sem alongar a frase.
- `v3`, TOK-7 e TOK-8: a cor não ordena o último degrau. `--chart-1` contra `--seq-7` mede 1,07:1 no escuro e 1,38:1 no claro, e no claro o nível final (6,00:1 contra o cartão) é mais claro que o do meio (8,29:1). Quem separa e ordena é a figura cheia, com 306 px de tinta por célula contra 212 do contorno, como o `notes` declara. Não trocar a figura cheia por contorno.
- `v3`, redação: "21 desses, qualificam" e "4 desses, agendam" têm vírgula entre sujeito e verbo; a frase acessível diz "chegam à agenda" onde o corpo diz "agendam"; a linha da venda diz o nível só pelo recuo, sem "desses".
- `v3`, NUM-7 e DAD-9: o período sai como "3º trimestre", sem o ano, no rodapé e na frase acessível.
- `v3`, `meta.json`: o `notes` diz "figuras de 16 px" e a figura tem 14 px (`size-3.5`) na célula de 16 px; o `demonstrates` não cita a linha do resto nem o recuo que a correção trouxe.
