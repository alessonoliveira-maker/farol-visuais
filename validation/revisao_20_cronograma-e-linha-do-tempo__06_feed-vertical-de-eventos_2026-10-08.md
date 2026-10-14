# Parecer de revisão: 20_cronograma-e-linha-do-tempo/06_feed-vertical-de-eventos

Data: 2026-10-08. Revisor independente, primeira passada das quatro versões (`sem_revisao`). `npm run check`: 0 erros, 0 avisos. As guardas COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA não leem esta abordagem (`texto_em_html` nas quatro), então contraste, colisão e corte foram conferidos à mão.

Como foi medido: nos PNGs de `_render/.qa/20_cronograma-e-linha-do-tempo/06_feed-vertical-de-eventos/`, que têm 2 px de imagem por px de tela, com leitura de cor pixel a pixel; no `.pagina.png`, que é a página viva, comparado com o PNG do `preview.svg`; e nos tokens de `app/src/styles/tokens.css`, com a fórmula de contraste da WCAG.

| Versão | Resultado | Não |
|---|---|---|
| `v1_historico-de-uma-oportunidade` | aprovada | nenhum |
| `v2_handoff-com-tempo-de-espera` | reprovada | 11 |
| `v3_log-da-pre-vendas-agrupado-por-dia` | aprovada | nenhum |
| `v4_evento-sem-data-e-texto-longo` | aprovada | nenhum |

As observações não bloqueantes das quatro estão no README do modelo, seção `Observações da revisão (não bloqueantes)`. Este arquivo trata do que reprova e do que foi pesado e não reprovou.

Não se aplica, nas quatro: perguntas 3, 4, 6, 7, 13, 18, 26, 27, 28, 29, 30 e 31. A 32 foi aplicada ao trilho e passa, pelo motivo dado no fim.

## v2_handoff-com-tempo-de-espera

Resultado: reprovada. Um bloqueante, igual nos dois temas. O resto confere com o dado: as quatro esperas refeitas à mão a partir do `data.ts` dão 3, 1, 7 e 2 dias, como no desenho; `2 de 4 esperas acima de 2 dias` fecha; a espera igual ao limite não é marcada; a última passagem, sem retomada, conta até a data de referência e diz `sem dono até agora`; o alerta tem ícone e o limite escrito; os eventos rebaixados em `--text-muted` sobre `--surface-sunken` medem 5,98:1 no escuro e 4,65:1 no claro; estado vazio da EST-1; frase acessível de 151 caracteres.

### Bloqueante 1. Pergunta 11. COR-8, com a tabela 17.2

**O que o desenho faz.** O marcador de toda passagem de dono é um disco âmbar, e o triângulo que avisa a espera acima do limite é do mesmo âmbar. Não é parecido: é o mesmo hex. As quatro passagens saem pintadas na cor do alerta, inclusive as duas que esperaram dentro do limite (`1 dia sem dono` e `2 dias sem dono até agora`), cuja linha de espera traz ampulheta cinza e nenhum aviso. Quem lê a cor antes do texto conta quatro alertas onde o dado tem dois.

**Evidência.**

* `app/src/styles/tokens.css`: `--chart-2` e `--warning` valem `#f5a524` no escuro (linhas 46 e 58) e `#945808` no claro (linhas 124 e 134). `--prov-premissa` repete o mesmo valor.
* `Chart.tsx`, linha 142: `isHandoff ? 'bg-chart-2' : 'bg-surface-sunken'`. Linha 127: `<TriangleAlert ... className="size-3.5 shrink-0 text-warning" />`. As duas no mesmo corpo.
* PNG escuro: na caixa do disco da passagem (x de 70 a 110, y de 306 a 346) a cor dominante é `#f5a524`, com 1.284 pixels; na caixa do triângulo (x de 140 a 170, y de 524 a 552) a tinta do traço é `#f5a524`. PNG claro, mesmas caixas: `#945808` nas duas.
* `meta.json`, primeiro item de `demonstrates`: "cor var(--chart-2) própria". A cor não é própria: é a do estado de aviso e a do selo PREMISSA do `VisualCard`. A nota declara um desvio do catálogo (a espera por extenso) e cala sobre este.

**Por que bloqueia.** A COR-8 é literal: "Visual que pinta variação semântica no próprio corpo não usa `--chart-2` nem `--chart-4` em nenhuma hipótese". A 17.2 define o papel semântico para variação e para estado, e espera acima do limite é estado. A pergunta 11 do checklist repete a proibição. A seção 14.1 põe papel de cor entre as regras que bloqueiam sempre, porque decide o que o desenho afirma. O catálogo pede `var(--chart-2)` para a passagem, e o dossiê resolve a colisão: o contrato vence e o desvio se declara na nota do `meta.json`.

**O que mudar.**

1. `Chart.tsx`, linha 142: o marcador de passagem sai de `bg-chart-2` e vai para `bg-chart-1`. É o papel de destaque da 17.2 (a marca que carrega a mensagem, um destaque por visual) e o primeiro slot da ordem 1, 3, 6, 5, 2, 4.
2. `Chart.tsx`, linha 145: o ícone sobre o disco passa de `var(--surface-raised)` para `var(--accent-cyan-contrast)`, par aprovado na 17.10 (10,06:1 no escuro, 6,00:1 no claro). É o mesmo par que a `v1` já usa no evento mais recente.
3. `text-warning` fica só no `TriangleAlert` da linha 127 (8,36:1 e 5,74:1 contra o cartão, aprovado). O âmbar passa a querer dizer uma coisa só.
4. `meta.json`: o primeiro item de `demonstrates` deixa de citar `var(--chart-2)`, e a nota declara o desvio do catálogo com o motivo (COR-8, mesmo hex de `--warning`).
5. Comentário do topo do `Chart.tsx` (linha 10) e README do modelo (Anatomia, item 2, e a linha da `v2` em Versões) citam `--chart-2` e acompanham a troca.
6. Conferir depois, com `npm run render -- 20_cronograma-e-linha-do-tempo/06_feed-vertical-de-eventos/v2_handoff-com-tempo-de-espera --tema ambos` e `npm run check`: nos dois PNGs, nenhum pixel do disco de passagem com o hex do triângulo.

**Saída que não resolve.** Manter `--chart-2` na passagem e tirar a cor do alerta cumpre a letra da frase citada, mas deixa `--chart-2` como primeiro e único slot categórico, fora da ordem da COR-8, e mantém as passagens na cor do selo PREMISSA ao lado do `VisualCard`.

As observações da `v2` no README (plural de `1 esperas`, `0 de 0 esperas`, número sem `tabular-nums` no limite) cabem na mesma passada, sem obrigação.

## Pesado e não reprovou

Vale para o corretor não reabrir o que já foi decidido, e para a próxima revisão saber o que foi olhado.

### Nas quatro versões

* **Pergunta 20, contraste de texto, medido à mão.** Sobre `--surface-sunken`: `--text-primary` 16,67:1 no escuro e 15,56:1 no claro; `--text-secondary` 9,36:1 e 7,04:1; `--text-muted` 5,98:1 e 4,65:1, que é o par mais fraco do modelo e está aprovado na 17.10. Sobre `--surface-raised`: os pares da tabela. Nenhum texto abaixo de 4,5:1.
* **Pergunta 32, o trilho em `--line-strong`.** Mede 1,79:1 no escuro e 1,83:1 no claro. Aplicado o teste da ACE-6: tapado o trilho, a ordem continua na lista e nas datas escritas, então ele é referência e não dado. O disco neutro dos marcadores (`--surface-sunken`, 1,15:1 contra o cartão) também não carrega nada sozinho: a marca é o ícone, em `--text-secondary`.
* **Pergunta 10, TIP-1.** Há número em Manrope sem `tabular-nums` na linha de leitura das quatro. É texto corrido, sem coluna, sem consequência no preview: observação pela 14.1.
* **Pergunta 16.** As quatro trocam o desenho inteiro por `role="status"` com `Filter` de 16 px e frase em 12 px `--text-muted`.
* **Pergunta 19.** Frases acessíveis de 197, 151, 173 e 212 caracteres, começando pelo tipo e com a conclusão.

### v1_historico-de-uma-oportunidade

* **Pergunta 11.** `--chart-1` só no evento mais recente, com ícone em `--accent-cyan-contrast` (10,06:1 e 6,00:1): um destaque, par aprovado. O segundo canal da COR-2 é a primeira posição com a ordem escrita na linha de leitura; o peso 600 do título ajuda pouco.
* **Pergunta 14.** `63 dias` entre o primeiro e o último evento e `há 64 dias` contra a referência de 2026-09-30 conferem com o `data.ts`; a base da data relativa está nomeada na linha de leitura.
* **Pergunta 23.** O dado é fraco em caso difícil (sem quebra de linha, sem ausência). Aceito porque a `v4` do mesmo modelo existe para isso; fica como observação.

### v3_log-da-pre-vendas-agrupado-por-dia

* **Pergunta 12.** Os chips do cabeçalho de dia identificam o tipo só pelo ícone. A fila de filtros logo acima traz o mesmo ícone com o nome e o total, na mesma ordem, e serve de legenda com amostra na forma da marca (ROT-4).
* **Pergunta 14.** Refeito do `data.ts`: 64 atividades, 16 por tipo, 14, 13, 15, 12 e 10 por dia, e `mais 11`, `mais 10`, `mais 12`, `mais 9` e `mais 7`. Tudo fecha com o desenho.
* **Demonstração da virtualização.** É nota no comentário e no README, não código, porque `@tanstack/react-virtual` está fora da lista de imports da seção 6. O desvio está declarado na nota do `meta.json`.

### v4_evento-sem-data-e-texto-longo

* **TIP-7 contra o `line-clamp-3`.** A regra fala de nome de marca e de `truncate` em texto de apoio sem saída. Aqui o título não é cortado, a anotação inteira fica no DOM (o corte é só visual), o botão `ver mais, 2.942 caracteres` a abre com `aria-expanded` e `aria-controls`, e a nota do `meta.json` declara o desvio. Na página viva a terceira linha termina em reticências.
* **Pergunta 8, ausência.** Autor nulo sai como `formatUnavailable()` com `Unplug` em `--text-muted`. Evento sem data não recebe data inventada: vai para o fim com marcador vazado e tracejado, ícone `CircleHelp` e o texto `data desconhecida`. A marca é diferente da dos datados, então a posição no fim não se lê como "o mais antigo" sem aviso. O contorno em `--line-strong` passa pela isenção do valor escrito ao lado.
* **Pergunta 15, estado aberto.** Pela conta, a anotação aberta passa do corpo de 425 px (cerca de 510 px só de texto) e a lista não rola. Os dois PNGs, que são o que a pergunta mede, saem limpos. Fica como observação, e como lacuna da régua: o render não fotografa estado aberto por botão.
