# Parecer de revisão: 16_distribuicao/01_histograma

Data: 2026-10-15
Motivo: `revisao_desatualizada` (o `Chart.tsx` mudou depois do veredito de 2026-09-28; julgado o arquivo de hoje).
check: 0 erros, 3 avisos na `v1` (CONTRASTE-MARCA e dois EIXO-CALMO, os dois últimos em fila de dívida).
PNGs conferidos: `_render/.qa/16_distribuicao/01_histograma/v1_ciclo-de-fechamento.png` e `.claro.png`, de 2026-10-02, mais novos que o `Chart.tsx`.

## Versão: 16_distribuicao/01_histograma/v1_ciclo-de-fechamento

```
Resultado: reprovada
Não: 15
Correções:
  15. ESP-3, EIX-6b (emenda de 2026-10-02), EIX-4, REC-29: subir MARGIN.top para 12 e calcular domain e ticks do eixo Y no componente, com interval={0}.
Não se aplica: 6, 13, 26, 27, 28, 29, 30, 31, 32
```

### Bloqueante único: o eixo Y perdeu o tique 24, e o 32 saiu da própria linha

**Pergunta 15** (os dois PNGs saem sem corte, sobreposição ou transbordo; margem explícita reservando
espaço para rótulo). Regras: **ESP-3**, **EIX-6b, emenda de 2026-10-02** (peso declarado: "bloqueia quando
o tique some ou sai da linha de grade no render"), **EIX-4** (`domain` e `ticks` calculados no componente,
de 3 a 5 linhas em intervalo redondo) e a armadilha **REC-29**.

Evidência, lida no `preview.svg` e no `preview-claro.svg` e vista nos dois PNGs:

- O eixo Y imprime só `0`, `8`, `16` e `32`. O tique `24` não existe, e a linha de grade dele também não:
  as linhas estão em y = 120, 92, 64 e 8 do plano, e falta a de y = 36. O leitor vê 8, 16, 32 com o
  último degrau duas vezes mais alto que os outros, sequência que lê como escala que dobra.
- O rótulo `32` está ancorado em y = 11,25, e a linha dele em y = 8: 3,25 px abaixo da própria linha
  (6,5 px no PNG de 2x).
- Causa, a mesma descrita na emenda: `MARGIN.top` é 8, abaixo dos 12 px que cobrem a meia altura de
  22,5 px que o Recharts atribui ao tique; o `preserveEnd` padrão empurra o 32 para 11,25 e o
  `isVisible` descarta o 24, que ficou perto demais. Os ticks não são declarados, então a grade segue o
  descarte.

O que mudar:

1. `MARGIN.top` de 8 para 12, com a conta ao lado da constante (meia altura de 22,5 px, arredondada).
2. Calcular no componente o passo e o teto do eixo Y a partir da maior contagem (hoje 31, passo 8,
   teto 32, a primeira linha acima do maior valor), e passar `domain={[0, teto]}`, `ticks` e
   `interval={0}` ao `YAxis`. A `v4` deste modelo já faz o `interval={0}` com o comentário do porquê.
3. Conferir no render que saem cinco linhas (0, 8, 16, 24, 32) e que cada rótulo cai na linha dele,
   nos dois temas.

### Levar junto na mesma rodada (não bloqueante, registrado no README)

- Marca da faixa vazia em `--line-strong`, 1,79:1 no escuro e 1,83:1 no claro, abaixo dos 3:1 da ACE-3.
  Não reprova porque o vão aparece e o rodapé escreve "nenhum negócio fechou entre 161 e 168 dias", mas
  o README já pede a troca para `--text-muted`, como na `v2` e na `v4`, a quem mexer na `v1`.
- `meta.json`, campo `notes`: descreve "a segunda série de Bar" que o código não tem; o código usa uma
  série com `shape`, que é o certo pela REC-19. Corrigir a nota.
- Exemplo de dica "42 a 49 dias, 22 oportunidades" no `meta.json` e no README: a faixa tem 19.
- `MARGIN.right` de 8 px empurra o rótulo `210` 4,1 px para a esquerda (561,9 contra 566); 12 px resolvem.
- `axisLine={false}` depois do espalhamento de `AXIS_PROPS` nos dois eixos (EIX-5).

As demais observações (valor acima do domínio descartado em silêncio, "puxada pela cauda longa" fixo,
só o primeiro buraco nomeado, faixas de mesma altura fundidas, tiques do X fora da borda do bin,
TIP-1 nos tiques, constantes sem nome, DIC-4) estão no README e não precisam desta rodada.

### O que está certo e não deve mudar

Bins calculados no componente com domínio fixo de 0 a 210 e soma das barras igual a 312; barras
alinhadas à borda de cada faixa (7 dias medem 17,8 px e o bin de 35 a 42 começa exatamente no 35);
faixa vazia interna mantida no array; ausência (9 sem data de criação) fora da amostra e contada no
rodapé; vazio com `role="status"`, ícone `Filter` e `formatUnavailable()`; agregações `number | null`;
frase acessível de 227 caracteres, começando pelo tipo; contraste de texto e de barra aprovado nos dois
temas pelo check.
