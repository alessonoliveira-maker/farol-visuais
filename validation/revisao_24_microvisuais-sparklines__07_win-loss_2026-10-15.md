# Parecer de revisão: 24_microvisuais-sparklines/07_win-loss, terceira passada da v2

Data: 2026-10-15. Revisor independente, outra instância. Motivo: `revisao_desatualizada` na `v2`
(o `Chart.tsx` mudou na segunda rodada de correção, autorizada pelo dono em 2026-10-15). Foi julgado
o arquivo de hoje, não a nota antiga. A `v1`, a `v3` e a `v4` não foram rejulgadas e seguem aprovadas.
O parecer anterior está em `revisao_24_microvisuais-sparklines__07_win-loss_2026-10-05.md`.

`npm run check -- 24_microvisuais-sparklines/07_win-loss`: 0 com erro, 0 avisos, 0 escapes. As guardas
de texto não medem o modelo (`texto_em_html`), então geometria, cor e texto foram medidos à mão. Os
PNGs dos dois temas são de 10:08:47, mais novos que o `Chart.tsx` (10:07:32) e o `data.ts` (10:08:07).
Os ramos foram conferidos por execução fora da árvore: o `Chart.tsx` empacotado com esbuild no diretório
temporário da sessão e renderizado em texto com `renderToStaticMarkup`, com o dado trocado pela prop
`data`. Nenhum arquivo do catálogo foi tocado para isso.

| Versão | Resultado | Não |
|---|---|---|
| `v2_maior-sequencia-fora-do-sla-anotada` | reprovada | 8, com reflexo na 19 |

## O que a segunda rodada corrigiu, conferido por execução

* Janela inteira nula (26 semanas `null`): o topo escreve "indisponível" (`formatUnavailable()`, linha
  133), a linha de leitura escreve "26 semanas sem resultado medido" (linha 138) e a frase diz "nenhuma
  semana tem resultado medido (indisponível). Não há sequência a anotar.", com 145 caracteres. O zero
  inventado do bloqueante anterior sumiu desse caso.
* A frase acessível conta as semanas sem resultado em qualquer ramo (linha 115): com 13 vitórias e 13
  nulas ela diz "13 dentro, 0 fora e 0 no limite, 13 sem resultado medido", e a soma fecha com 26.
* O dado padrão não mudou e está correto nos dois temas (tabela abaixo).

## Medido nos PNGs de hoje

| Medida | Escuro | Claro |
|---|---|---|
| Marcas contra o `data.ts` | 11 acima, 14 abaixo e 1 traço, na ordem do array | igual |
| Bloco, em px de CSS | 20 por 16, vão de 2 | igual |
| `--positive` contra o cartão | 7,36:1 | 5,34:1 |
| `--negative` contra o cartão | 5,50:1 | 6,36:1 |
| Empate e colchete, `--text-muted` | 5,21:1 | 5,37:1 |
| Linha central, `--line-subtle` | 1,25:1 (referência, não relação) | 1,29:1 |
| Colchete | de 332 a 593 px no PNG em 2x, bordas do 7º ao 12º bloco | igual |
| Fidelidade, SVG contra página | 0,098% | 0,096% |
| Frase acessível do dado padrão | 173 caracteres | igual |
| Tinta do corpo | de 130 a 287,5 px, sem corte | igual |

As 32 perguntas foram respondidas para o dado padrão: só a 8 sai "não", e ela mora no ramo. Não se
aplica: 6, 18, 26, 27, 28, 29, 30, 31.

## Bloqueante 1. Com ao menos uma semana medida, o corpo visível não conta a semana sem resultado

Pergunta 8, com reflexo na 19 (a informação existe só na frase). Regras: EST-2 ("Nunca zero"), seção
14.1 (ausência exibida como zero bloqueia sempre), DAD-2 ("Ausência sai da amostra e é contada no
rodapé, sempre"), DAD-9 ("Quem usa leitor de tela recebe o recorte certo e quem enxerga não") e DAD-5.
É o item 3 do "O que mudar" do parecer anterior ("contá-la na frase acessível e na linha do ramo sem
sequência"), feito só na frase. A correção levou a guarda de `data.length === 0` para `measured === 0`
e deixou o resto do contínuo intacto.

**Evidência no código.**

* Linha 133: o topo só escreve `formatUnavailable()` com `measured === 0`; com uma semana medida já
  escreve "sem sequência fora do SLA".
* Linha 140: o ramo sem sequência escreve `formatInt(losses)` seguido de "semanas fora do SLA, nenhuma
  colada na outra", sem `unmeasured` e sem o denominador das semanas medidas.
* Linha 141: o ramo com sequência também não cita `unmeasured`.
* Linha 115: só a frase acessível recebe `unmeasured`. A legenda (linhas 182 a 195) não tem item para
  a semana sem resultado, que no SVG é um vão sem marca (linha 154).

**Evidência por execução**, com o dado trocado pela prop.

| Dado | Topo, 14 px | Linha de leitura, 11 px | Frase acessível |
|---|---|---|---|
| 1 vitória e 25 nulas | sem sequência fora do SLA | 0 semanas fora do SLA, nenhuma colada na outra | 1 dentro, 0 fora e 0 no limite, 25 sem resultado medido |
| 13 vitórias e 13 nulas | sem sequência fora do SLA | 0 semanas fora do SLA, nenhuma colada na outra | 13 dentro, 0 fora e 0 no limite, 13 sem resultado medido |
| derrota e nula alternadas, 12 semanas | sem sequência fora do SLA | 6 semanas fora do SLA, nenhuma colada na outra | 0 dentro, 6 fora e 0 no limite, 6 sem resultado medido |
| nula na 9ª semana do dado padrão | 3 semanas seguidas fora | a maior, de 08/06/2026 a 22/06/2026 | 11 dentro, 13 fora e 1 no limite, 1 sem resultado medido |

Na primeira linha o corpo é, palavra por palavra, o texto que reprovou a passada de 2026-10-05 para a
janela inteira nula ("sem sequência fora do SLA" e "0 semanas fora do SLA"), agora com 25 de 26
semanas sem medição. O zero é a boa notícia: quem enxerga lê SLA cumprido na janela, e só quem ouve
a frase sabe que 25 semanas não foram medidas. Na terceira linha o cartão afirma que nenhuma derrota
encosta na outra quando entre elas só há semanas sem resultado.

**O que mudar.**

1. Sempre que `unmeasured > 0`, a contagem das semanas sem resultado aparece no corpo visível, nos dois
   ramos (com e sem sequência), e não só na frase. Dois caminhos servem, à escolha do corretor:
   a. acrescentar à linha de leitura "; N semanas sem resultado medido" (e, no ramo sem sequência, dar
      o denominador: "0 de 1 semana medida fora do SLA" ou "0 fora do SLA em 13 semanas medidas");
   b. acrescentar à legenda, só quando houver ausência, o item "sem resultado medido (N)" com amostra
      vazada, que também dá nome ao vão sem marca do SVG (ACE-2: ausência com forma vazada e palavra).
2. O mesmo texto calculado alimenta corpo e frase (DAD-5), para os dois não divergirem de novo.
3. Medir a largura: o caso mais longo da linha hoje é o empate vizinho, 88 caracteres e cerca de 484 px
   a 11 px no corpo de 574 px. Somar "; 1 semana sem resultado medido" passa de 574 px e quebra em duas
   linhas; o corpo tem 38,5 px de sobra em cima e embaixo, então a quebra cabe, mas confira nos dois
   PNGs que nada corta nem encosta. O caminho b não mexe na largura da linha.
4. Conferência antes de devolver: renderizar com 1 vitória e 25 nulas, com 13 vitórias e 13 nulas e com
   derrota e nula alternadas; ler topo, linha, legenda e frase (de 100 a 250 caracteres); e devolver o
   dado padrão. O `data.ts` não muda, e o PNG do dado padrão não pode mudar além da fidelidade.

Não reprova e vai no README: plural fixo ("em 1 semanas", "1 semanas sem resultado medido"),
"nenhuma colada na outra" sem derrota nenhuma, `Unplug` ausente no estado indisponível e a semana nula
encostada na maior sequência sem oração própria, como o empate tem. Alinhar na mesma rodada é barato.

## Registro

```
Versão: 24_microvisuais-sparklines/07_win-loss/v2_maior-sequencia-fora-do-sla-anotada
Data: 2026-10-15
Resultado: reprovada
Não: 8 (reflexo na 19)
Correções:
  8. EST-2, DAD-2 e DAD-9: com qualquer semana sem resultado, escrever a contagem dela no corpo
     visível nos dois ramos (linha de leitura ou item de legenda vazado), e não deixar "0 semanas
     fora do SLA" sem o denominador das semanas medidas.
Não se aplica: 6, 18, 26, 27, 28, 29, 30, 31
```

Registrado com `npm run revisao` em 2026-10-15, impressão 732bf8a69fb9.
