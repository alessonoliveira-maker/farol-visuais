# Revisão de `12_hierarquia/01_treemap`, 2026-10-14

Versões julgadas: `v2_produto-que-mais-cresceu` (reprovada), `v3_cpl-qualificado-por-campanha` e `v4_detalhamento-com-ramo-vazio` (aprovadas). `npm run check -- 12_hierarquia/01_treemap`: 0 com erro, 0 avisos. PNGs de 2026-10-02, mais novos que os `Chart.tsx` de 2026-09-28; não foi preciso renderizar de novo.

## `v2_produto-que-mais-cresceu`: reprovada

### Bloqueante 1. Pergunta 14; NUM-4 e seção 14.1 (proporção sobre um todo que não é o todo, no número que o desenho afirma)

**Evidência.** `Chart.tsx:198` calcula `totalPrevious = sumPreviousRevenue(drawn)`, e `drawn` (linha 180) é a lista filtrada por `revenue > 0` no 2026-T3. Com isso o total do 2026-T2 perde a receita de todo produto que zerou ou estornou no trimestre corrente: no dado fixo, Consultoria tributária tinha R$ 62 mil no 2026-T2 e sai da base. A soma usada é R$ 4,345 mi; a receita do 2026-T2 é R$ 4,407 mi.

Consequência na tela, nos dois temas: a linha de leitura escreve "+3,7 pontos de participação, de 7,4% para 11%". A conta certa é 320 / 4.407 = 7,26%, ou seja "+3,8 pontos, de 7,3% para 11%".

No dado fixo a diferença é de 0,1 ponto, mas o defeito é de método e cresce com o dado. Se o maior produto (Gestão patrimonial, R$ 1,64 mi no 2026-T2) zerasse no 2026-T3, a peça escreveria "+5,4 pontos, de 11,8% para 17,2%", e a conta certa seria "+10,0 pontos, de 7,3% para 17,2%". A participação no trimestre anterior é justamente a anotação que o catálogo diz que esta versão demonstra ("crescimento em pontos e participação no total"), e é ela que vai ser copiada para o Farol. Nenhuma guarda do `check` confere denominador contra o dado, por isso a peça sai verde.

**O que mudar.** Somar a base do 2026-T2 sobre `data`, e não sobre `drawn`: todo produto com `revenuePrevious` medido entra no total anterior, tenha ou não receita positiva no corrente. O produto novo, com `revenuePrevious: null`, continua fora, porque não existia. Critério de aceite no PNG: "de 7,3% para 11%" e "+3,8 pontos".

**O que não mudar.** O neutro `--text-muted` com texto vazado em `--surface-raised`; o destaque em `--chart-1` com peso 700 só no nome e no valor dele; a célula muda quando nome e valor não cabem juntos; a lista de identificação com variação e "sem base"; a linha "Fora do desenho" com o zero escrito; o `canvas` de 880 por 420; a ausência de dica.

### Itens que podem ir na mesma rodada (não bloqueiam; também estão no README)

- NUM-1: as duas participações da mesma frase com a mesma precisão (hoje "7,4%" e "11%").
- NUM-5: o total do 2026-T3 (R$ 4,7 mi) escrito na linha de leitura; hoje só está na frase acessível.
- ACE-1: a frase acessível afirma "o que mais cresceu" sem conferir que o `highlightId` é o de maior crescimento; ou conferir no dado, ou dizer só "acende Imobiliário, que cresceu +63%". E flexionar "1 produto ficou fora do desenho" no plural.
- DAD-9: o período ("2026-T2", "2026-T3") vem do dado, como o `period` da `v4`, e não escrito no `Chart.tsx`.

### Registro no formato do checklist

```
Versão: 12_hierarquia/01_treemap/v2_produto-que-mais-cresceu
Data: 2026-10-14
Resultado: reprovada
Não: 14
Correções:
  14. NUM-4 (14.1): somar a receita do 2026-T2 sobre todo produto com base medida, não só sobre os desenhados; a linha passa a "+3,8 pontos, de 7,3% para 11%".
Não se aplica: 7, 13, 18, 26, 28, 29, 30, 31, 32
```

## `v3_cpl-qualificado-por-campanha` e `v4_detalhamento-com-ramo-vazio`: aprovadas

**`v3`.** As doze variações conferem com o `data.ts` (Busca marca +10,98%, na faixa de 10% a 30%; Busca concorrência +47,6%, o extremo escrito na régua). Os seis percentuais da régua batem com a verba de cada faixa e somam 100; "6 das 12 campanhas pioraram, com 62% dos R$ 252,7 mil" bate com 35 + 27. A cor segue a polaridade invertida do custo (COR-6), o texto vazado em `--surface-raised` mede acima de 4,5:1 sobre as três marcas nos dois temas, a ausência é contorno vazado e vem por último na régua, e toda campanha muda (Vídeo institucional, Display retargeting, Documento patrocinado, Busca cauda longa) tem nome, valor, sinal e ícone na lista. A diferença de render de 0,67% e 0,72% é a colisão de faces de fonte depois de "CPL", defeito do app que o render anuncia, tratado como em `23_mapas/01_tile-grid-por-uf`.

**`v4`.** "Concorrência: 10% do investimento de ago/26, R$ 16,5 mil" confere (16,5 sobre 168,0 = 9,8%). O ramo vazio troca o gráfico por bloco `role="status"` com voltar, a trilha fica visível, a lista de vizinhos soma o ramo pai (22,2 + 42,6 + 16,5 = 81,3) e a `key` com a assinatura do filtro remonta o corpo. Os níveis com treemap, fora do preview, foram lidos no código: o valor do pai é sempre a soma dos filhos e as funções de medida são as mesmas das irmãs.

As observações das duas estão no README do modelo, na revisão de 2026-10-14.
