# Parecer de revisão: 14_tabelas-visuais/05_ranking-com-variacao-de-posicao

Data: 2026-10-14. Revisor independente. Julgada uma versão, `v3_executivos-com-tres-variacoes`, com
motivo `revisao_desatualizada`: o `Chart.tsx` mudou em 2026-09-28, depois do veredito de 2026-09-19
(o trilho da barra saiu de `--surface-overlay` para `--surface-sunken`). Julgado o arquivo de hoje e
a régua de hoje, que inclui a ACE-6 de 2026-09-20, posterior ao veredito antigo. PNGs de 2026-10-02,
mais novos que o `Chart.tsx`. `npm run check` com tipos: 0 com erro, 1 aviso (CONTRASTE-MARCA desta
versão), 0 escape.

Resultado: reprovada por três bloqueantes. As observações não bloqueantes estão no README do modelo,
parágrafo de 2026-10-14.

## O que passou

Barra inline parte do zero com domínio calculado sobre o recorte (Bianca F. enche os 96 px do
trilho); sinal tipográfico U+2212; cor semântica pela polaridade da receita; um destaque só, em
`--chart-1` e peso 700 no nome e no valor; vazio em `role="status"`; frase acessível de 199
caracteres, começando pelo tipo. Nenhuma guarda de texto mede o modelo (`texto_em_html`), então
corte, colisão e contraste foram medidos à mão nos PNGs de 2x, pela fórmula da WCAG.

## v3_executivos-com-tres-variacoes: reprovada

### Bloqueante 1. Perguntas 32, 20 e 11; ACE-6, ACE-3, tabela 17.2, armadilha TOK-5

**Evidência.** `TrackSparkline` (`Chart.tsx:35`) pinta traço e ponto final das cinco linhas sem
destaque em `--line-strong`. Amostrado no PNG, linha de Bianca F., x = 1546, y = 279: `rgb(51, 69,
106)` sobre `rgb(18, 28, 46)`, **1,79:1** no escuro; `rgb(180, 192, 214)` sobre branco, **1,83:1** no
claro. O `check` acusa os mesmos números. O teste da ACE-6 decide o papel: a coluna Δ posição só
cobre jul/26 contra ago/26 (`positions[4] − positions[5]`), e as posições de mar/26 a jun/26 existem
apenas no traço. Tapado o traço, quatro dos seis meses somem; é dado, não referência, e não há valor
escrito junto que ative a isenção da 17.2 ("só vale com o valor escrito"). A nota do `meta.json`
("a coluna de Δ posição já diz o mesmo em texto") é falsa pelo mesmo motivo. O catálogo pede "demais
em line-strong"; especificação que colide com o contrato perde para o contrato.

**O que mudar.** Traço e ponto das linhas sem destaque num token de dado com 3:1 nos dois temas
(`--text-muted`, a saída da TOK-5), mantendo `--chart-1` no destaque; reescrever as `notes` do
`meta.json` declarando o desvio do catálogo e retirando a frase de que a trajetória é decorativa.

### Bloqueante 2. Pergunta 15; ESP-3, seção 14.1 (marca partida)

**Evidência.** A escala x da trajetória vai de 0 a `TRACK_WIDTH` sem folga, e o ponto final é
desenhado em `cx = TRACK_WIDTH` com `r = 2` (`Chart.tsx:32` e `39`). O `<svg>` recorta no `viewBox`:
no PNG de 2x a tinta do fim termina na coluna 1673, que é o centro do ponto. O marcador da posição
atual sai como meio disco nas seis linhas e nos dois temas, e a ponta arredondada do início sai
cortada reta em x = 0. A escala y já tem `TRACK_PAD`; a x não tem.

**O que mudar.** Aplicar a folga também em x (de `TRACK_PAD` a `TRACK_WIDTH − TRACK_PAD`, com folga
de pelo menos o raio mais meio traço), para ponto e pontas caberem inteiros.

### Bloqueante 3. Pergunta 23 e EIX-9; seção 14.1 (domínio: o desenho afirma uma ordem impossível)

**Evidência.** No `data.ts`, as posições de cada mês entre os seis executivos: mar/26 dá {2, 3, 3,
4, 5, 6}, ninguém em 1º e Bianca F. e Diego A. em 3º; abr/26 dá {1, 2, 2, 5, 5, 6}, ninguém em 3º
nem 4º; jun/26 dá {2, 2, 3, 5, 5, 6}, ninguém em 1º nem 4º. O domínio comum de 1 a 6, que a versão
demonstra, existe para a altura de uma linha comparar com a das outras; em três dos seis meses ela
afirma posição repartida e topo vazio, o que nenhuma regra de empate admite (competição padrão 1,
2, 2, 4, Anatomia do README). Com o bloqueante 1 corrigido o traço passa a ser lido, e a
incoerência junto.

**O que mudar.** Em cada mês, uma permutação de 1 a 6. Manter jul/26 e ago/26, que já batem com
`valueAnterior` e `value`.
