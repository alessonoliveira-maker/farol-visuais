# Revisão de 09_dispersao-e-bolhas/09_densidade-2d, 2026-10-14

Versões julgadas: `v2_hexbin-com-sdr-em-destaque`, `v3_quadrante-denso-de-sessoes` e `v4_concentracao-extrema-por-quantis`, todas `sem_revisao`. A `v1` está aprovada desde 2026-09-28 e não foi julgada de novo.

`npm run check -- 09_dispersao-e-bolhas/09_densidade-2d`: 0 com erro, 0 avisos; as quatro versões saem `ok`. PNGs de 2026-10-02, mais novos que os `Chart.tsx` de 2026-09-28.

Resultado: `v2` e `v4` aprovadas; `v3` reprovada por um bloqueante só. Nos dois previews a `v3` está certa e legível. O defeito mora num ramo do código: num recorte em que a região de maior massa não seja a "saída rápida", a linha de leitura e a frase acessível passam a dizer algo falso. A 14.1 manda bloquear sempre a regra que decide o que o desenho afirma, e a EST-1b já fixou que defeito no ramo conta, mesmo quando a foto está certa. As observações não bloqueantes das três versões foram para o README do modelo.

## Resumo para o corretor

* **`v3`: a linha de leitura escreve o recorte de uma região só, qualquer que seja a líder.** Perguntas 17 e 19; ANO-5 e ACE-1; seção 14.1, identificação das marcas.

A correção é de texto calculado. Não mexe em cor, eixo, grade nem canvas, e o preview do dado padrão deve sair igual, porque nele a líder já é a "saída rápida".

---

## v3_quadrante-denso-de-sessoes

```
Versão: 09_dispersao-e-bolhas/09_densidade-2d/v3_quadrante-denso-de-sessoes
Data: 2026-10-14
Resultado: reprovada
Não: 17, 19
Correções:
  17. ANO-5: derivar da região líder o trecho do recorte que vem depois do nome, em vez de escrever "abaixo de 6 min e de 8 páginas" para as quatro.
  19. ACE-1: a frase acessível repete a linha de leitura, então sai certa com a mesma correção; conferir as quatro regiões.
Não se aplica: 4, 13, 18, 26, 28, 29, 30, 31
```

### Bloqueante 1. Perguntas 17 e 19; ANO-5 e ACE-1; seção 14.1 (identificação das marcas)

**Evidência.** `Chart.tsx:196-199`:

```ts
const readingLine =
  `Maior massa em ${REGIONS[leaderIndex]?.inline ?? ''}, abaixo de ${formatInt(COL_SPLIT)} min e de ` +
  `${formatInt(ROW_SPLIT * PAGES_PER_ROW)} páginas: ...`;
```

O nome da região sai do dado (`leaderIndex`), mas o recorte que vem depois dele, "abaixo de 6 min e de 8 páginas", é fixo. Só vale para a "saída rápida" (`quickTime: true`, `manyPages: false`). As outras três regiões de `REGIONS` (`Chart.tsx:101-106`) ficam do outro lado de pelo menos uma das divisórias:

| Região líder | O que a linha escreveria hoje | O recorte verdadeiro |
|---|---|---|
| Varredura rápida | abaixo de 6 min e de 8 páginas | abaixo de 6 min, com 8 páginas ou mais |
| Exploração | abaixo de 6 min e de 8 páginas | 6 min ou mais, com 8 páginas ou mais |
| Saída rápida | abaixo de 6 min e de 8 páginas | igual (é o caso do preview) |
| Leitura longa | abaixo de 6 min e de 8 páginas | 6 min ou mais, abaixo de 8 páginas |

Em três dos quatro desfechos possíveis, então, o cartão aponta a maior massa para o quadrante errado. A `summary` (`Chart.tsx:200-202`) concatena a mesma `readingLine`, e a frase anunciada ao leitor de tela sai igualmente falsa (pergunta 19, ACE-1, "diz a conclusão").

O recorte que dispara o defeito não é exótico. O passo 3 de "Como colar no Farol" diz que os limites se movem com o filtro de propósito, e um recorte de tráfego de blog, com sessões longas e muitas páginas, põe a "exploração" na frente. No dado padrão a líder é a saída rápida, com 4.994 sessões (55%), conferidas à mão: linhas 0 a 3, colunas 0 a 5, dão 2.441 + 1.643 + 721 + 189. Por isso o preview está certo.

**O que mudar.** Dar a cada região o recorte dela, derivado de `COL_SPLIT` e `ROW_SPLIT` e não escrito à mão por região (os quatro textos acima são o resultado esperado), e montar a linha com ele. Um jeito é calcular o trecho a partir de `quickTime` e `manyPages`:

* tempo: "abaixo de 6 min" ou "de 6 min para cima";
* páginas: "abaixo de 8 páginas" ou "com 8 páginas ou mais".

Depois de corrigir, conferir a linha passando um `data` em que cada uma das quatro regiões lidere. A frase acessível segue a linha sozinha, porque a concatena. O teto de 250 caracteres continua com folga: o preview mede 209, e o recorte mais longo acrescenta cerca de 15.

### O que foi conferido na v3 e passou (para o corretor não mexer)

* Divisórias em índice de bin: `splitX` 152 coincide com o tique 6 e `splitY` 176 com o tique 8. A linha de 1,5 px ocupa exatamente o vão entre as células e não parte nenhuma. Em `--text-muted`, mede 5,21:1 e 5,37:1, acima do piso da ACE-6.
* Composição das regiões: 863, 2.037, 4.994 e 1.206 somam 9.100, e as participações 10, 22, 55 e 13 somam 100 pelo maior resto (NUM-2, ROT-10). Os pictogramas foram ampliados nos dois PNGs e cada um marca o quadrante certo, na orientação do plano.
* Faixas em potências: 1 a 9, 10 a 83 e 84 a 753, terminando no máximo observado (ROT-5b); 19 células na faixa alta, conferidas.
* Tamanhos de texto (12, 11 e o total em 14), contraste e colisão: limpos nas guardas e nos dois PNGs. A frase acessível mede 209 caracteres.
* As divergências declaradas contra o catálogo (três degraus em vez de cinco, pela TOK-8, e contagem na lista ao lado em vez de dentro da região, pela GEO-4 com ROT-10) estão justificadas no README e no `meta.json`, e não foram tratadas como bloqueante.

Observações não bloqueantes desta versão estão no README do modelo: o README se contradiz sobre o tamanho da célula, o eixo de páginas não tem tique 0, os tiques saem sem unidade, a legenda fica degenerada em recorte minúsculo e há posições soltas no JSX. Nenhuma delas precisa entrar nesta rodada, mas a do README é barata de corrigir junto.

---

## v2_hexbin-com-sdr-em-destaque e v4_concentracao-extrema-por-quantis

Aprovadas, sem bloqueante. Registradas com `npm run revisao`. As observações estão no README.
