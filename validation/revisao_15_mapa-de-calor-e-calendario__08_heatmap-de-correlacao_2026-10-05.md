# Revisão de 15_mapa-de-calor-e-calendario/08_heatmap-de-correlacao

Data: 2026-10-05. Revisor independente. Julgadas as quatro versões pelo arquivo e pelos PNGs de hoje (render de 2026-10-05, 07:02). `npm run check` com tipos: 0 com erro, 1 aviso (TAMANHO-TEXTO na `v1`, em fila de dívida).

Resultado: `v1_seis-medidas-de-midia` reprovada; `v2_pares-fortes-rotulados`, `v3_catorze-medidas-em-blocos` e `v4_pares-insuficientes-e-nao-calculavel` aprovadas, com observações no README do modelo.

## v1_seis-medidas-de-midia: reprovada

O que a rodada anterior pedia está resolvido. O número deixou de escolher cor por limiar de coeficiente e assenta numa pastilha de `--surface-sunken` com `--text-primary`, legível nas 15 células nos dois PNGs. O sinal de menos sai em U+2212 no preview. Os dois eixos levam nome e a medida 1 tem identidade (GEO-13). Nada disso volta.

### Bloqueante 1. Pergunta 16, EST-1: `data` vazio não tem estado

Evidência, lida no `Chart.tsx`: não há ramo de vazio. Com `data = []`, `rows` vale 0, a frase vira "Matriz de correlação sem par para medir." (linha 109), mas o componente segue e devolve a mesma `<figure>`: um `<svg>` de `viewBox` 102 x 30 sem célula e sem cabeçalho, e abaixo dele a régua de −1,00 a 1,00, "Pearson sobre 52 semanas fechadas", "triângulo inferior" e "correlação não é causa". A tela afirma método e amostra de uma matriz que não existe, e não há bloco `role="status"`.

O que mudar: antes do `return` principal, devolver o bloco de vazio que as três irmãs já têm (`v2`, linhas 128 a 139): raiz `flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted`, `role="status"`, ícone `Filter` de 16 px e a frase dizendo que o recorte não tem par com histórico. A condição é `pairs.length === 0`, que é a lista que alimenta a conta.

### Bloqueante 2. Pergunta 10, TIP-2 (armadilha GEO-18): texto do SVG abaixo de 11 px

Evidência, medida pela guarda TAMANHO-TEXTO no `preview.svg`: 22 trechos de texto declarados em 11 px chegam à tela em 10,05 px, porque o `<svg>` usa `viewBox` de 462 x 290 (`LEFT_W` mais cinco colunas de 70 px com vão de 2, por `TOP_H` mais cinco linhas de 50 px com vão de 2) com `className="h-full max-w-full"` e é encolhido por escala 0,91 no corpo do canvas `quadrado`, que tem 422 px de largura (422 sobre 462 dá 0,913). São os cinco nomes de coluna, os cinco de linha e, na mesma escala, os 15 coeficientes declarados em 12 px, que chegam em cerca de 10,9 px. A consequência segunda é a que pesa: por `preview_com_escala`, COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA não medem esta versão, e as três medem as irmãs.

A guarda trata como dívida conhecida e só avisa. A revisão não: o piso é do contrato, a medição existe, o arquivo foi editado hoje sem quitar, e o próprio README do modelo já descreve o conserto que as três irmãs aplicaram.

O que mudar: desenhar no `viewBox` do corpo medido, na altura do pior caso de cabeçalho, com `className="h-full w-full"`, para a escala sair 1 (saída da GEO-18). O corpo de `quadrado` na moldura `card` mede 422 x 372 px com o caso de uso em uma linha e 422 x 355,5 px em duas, números do `notes` da `v4`, que usa o mesmo canvas. Em 422 px de largura a geometria de hoje não cabe (precisa de 462), então a célula encolhe: a `v4` fecha seis medidas com coluna de rótulo de 82 px e passo de 68 px, mas o rótulo `Leads qualificados` da `v1` pede coluna mais larga; a conta é do corretor, e o canvas pode ir por número se nenhum preset fechar (GEO-1). A legenda em HTML abaixo do SVG entra na conta de altura. Depois do conserto, remover a chave da `v1` da fila de dívida de TAMANHO-TEXTO e conferir que as três guardas de texto passam a medir.

### Para acertar na mesma passada (não bloqueantes, já no README)

* `meta.json`, `notes`: a frase "O texto vira --surface-sunken acima de 0,50 em módulo" descreve o código anterior. Reescrever para a pastilha, e registrar a conta do `viewBox` novo.
* Frase acessível: começar por "Matriz de correlação entre", como as irmãs (ACE-1).
* Polos: a TOK-3 aceita `--positive` e `--negative`, mas as irmãs foram para `--chart-1` e `--chart-5`. Se o redesenho já mexer em `cellFill`, alinhar; se não, fica como está.
* README, seção Pendências: o item do sinal de menos está quitado pelo formatador e pode ser retirado pelo corretor.

### Conferido à mão na v1, porque as guardas não mediram

Contraste: `--text-primary` sobre `--surface-sunken` e `--text-secondary` e `--text-muted` sobre o cartão são pares aprovados nos dois temas. Colisão: 9 px entre `Investimento` e `Impressões` no cabeçalho, o par mais próximo. Texto na marca: o coeficiente fica inteiro sobre a pastilha de 42 x 22 px, nunca sobre a cor da célula. Células claras de valor baixo no tema claro (0,12 e 0,17) ficam abaixo de 3:1 contra o cartão, o que a ACE-3 admite porque o valor está escrito na marca.

### Registro

```
Versão: 15_mapa-de-calor-e-calendario/08_heatmap-de-correlacao/v1_seis-medidas-de-midia
Data: 2026-10-05
Resultado: reprovada
Não: 10, 16
Correções:
  10. TIP-2: desenhar em escala 1, com viewBox do corpo medido, para o texto chegar em 11 px e as três guardas de texto voltarem a medir.
  16. EST-1: ramo de vazio com role="status", ícone Filter e frase, no molde das irmãs.
Não se aplica: 3, 4, 6, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

## v2, v3 e v4: aprovadas

Sem "não" nas 32 perguntas. Conferido além das guardas: na `v2`, 14 células com número e anel contra 14 pares de módulo a partir de 0,70 no `data.ts`, e as dez medidas nomeadas no desenho parado; na `v3`, área do losango igual à do círculo pela conta (meia diagonal de raio vezes 1,2533, cujo quadrado dobrado dá pi vezes o raio ao quadrado) e régua terminando em 0,94, o máximo do dado; na `v4`, 6 células medidas, 4 hachuradas e 5 de ausência sobre 15, iguais às da frase acessível, coeficiente de par curto não desenhado e variância zero nunca escrita como zero. Medido no PNG da `v4`: 2 px entre a palavra de ausência e o contorno tracejado, de cada lado, nos dois temas; não encosta e foi como observação. As observações das três estão no README do modelo, parágrafo de 2026-10-05.
