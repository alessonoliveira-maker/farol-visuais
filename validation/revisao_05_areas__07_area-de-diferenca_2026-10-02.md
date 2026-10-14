# Parecer de revisão: 05_areas/07_area-de-diferenca

Data: 2026-10-02. Revisor independente. Versão julgada: `v1_resultado-mensal-contra-zero`, pelo arquivo e pelos PNGs de hoje (render de 2026-10-02, depois da mudança dos formatadores). As outras três versões não entraram. `npm run check`: 0 erros, 3 avisos, nenhum deles na v1.

## v1_resultado-mensal-contra-zero: reprovada, um bloqueante

### O que motivou a revisão, e passou

O tique de moeda negativa sai `−R$ 50 mil`, com U+2212 antes do símbolo, nos dois temas. Medido no `preview.svg`: uma linha só, âncora à direita em x=72, 8 px antes do corpo do gráfico (x=80) e cerca de 18 px depois da borda esquerda do corpo; o tique `jan/25` fica uns 8 px abaixo, sem tocar. Sem corte, sem colisão, sem quebra. O saldo `+R$ 320,8 mil` confere com a soma do `data.ts` e usa a mesma ordem de sinal e símbolo. A mudança dos formatadores não criou defeito nesta versão.

### Bloqueante 1. Pergunta 30, ACE-5 (contraste, seção 14.1: bloqueia sempre)

**Evidência no código.** `Chart.tsx:26` declara `FILL_OPACITY = 0.3`, aplicado em `Chart.tsx:147` (`fillOpacity={FILL_OPACITY}`) sobre o preenchimento `url(#gradiente)` de `--positive` e `--negative`. Não há valor escrito na marca nem junto dela, então a isenção da 17.2 não vale.

**Evidência medida** (cor composta contra `--surface-raised`, de `tokens.css`, piso 3,00:1):

| Tema | `--positive` a 0,30 | `--negative` a 0,30 |
|---|---|---|
| Escuro | 1,80:1 | 1,55:1 |
| Claro | 1,54:1 | 1,67:1 |

As quatro medidas reprovam, nos dois temas. O traço de 2 px é opaco e passa (7,36:1 e 5,50:1 no escuro, 5,34:1 e 6,36:1 no claro), mas a ACE-5 cobra a cor composta do preenchimento, e neste modelo o espaço pintado é o encoding que o catálogo descreve.

**Por que o `check` não acusou.** A guarda OPACIDADE-MARCA declara a v1 como não medida (`sem_opacidade_em_marca`) porque o `fill` é um `url(#…)` montado em template, que o leitor não resolve. A linha de cobertura do `check` nomeia a v1 entre as que se medem à mão. Não é aprovação da guarda.

**O que mudar.** Subir `FILL_OPACITY` para 0,70 ou mais, que é o mínimo de `--positive` (o de `--negative` é 0,66 e o pior dos dois governa), ou pintar em cor cheia. Conferência já feita para 0,70: 4,26:1 e 3,28:1 no escuro, 3,03:1 e 3,66:1 no claro. Com 0,72 a folga no claro sobe para 3,15:1. Depois de mudar, medir à mão os dois temas, porque a guarda continua cega para esta pintura.

**O que não mudar.** O corte duro no zero por `useYAxisScale` e `useChartHeight`, o `baseValue={0}`, a `ReferenceLine` do zero, a legenda de três itens, o tique próprio de uma linha e o saldo com sinal. Tudo isso foi conferido e está certo.

### Registro no formato do checklist

```
Versão: 05_areas/07_area-de-diferenca/v1_resultado-mensal-contra-zero
Data: 2026-10-02
Resultado: reprovada
Não: 30
Correções:
  30. ACE-5: subir FILL_OPACITY de 0,30 para 0,70 ou mais (ou cor cheia), de modo que o preenchimento composto passe de 3:1 nos dois temas.
Não se aplica: 6, 13, 18, 27, 28, 29, 31, 32
```

### Observações (não bloqueiam; registradas no README do modelo)

Comentário de `Chart.tsx:35` ainda cita o texto antigo `R$ -50 mil`; comentário do topo promete a contagem de meses escrita na tela e ela só existe na frase acessível (DAD-10); `Y_AXIS_WIDTH` de 80 fora da faixa da EIX-6 sem consequência visível; tique do eixo X sem `font-display` (TIP-1); `id` do gradiente com os dois pontos do `useId()`; amostra de legenda do zero em `--line-strong`. O corretor pode alinhar esses pontos na mesma passada, mas nenhum deles reprova.

## Nota de régua, para o dono

As irmãs `v2` e `v4` usam 0,32 na mesma pintura e seguem aprovadas com data de 2026-09-18, anterior à emenda da ACE-5 (2026-09-19). A `v2` está na fila de dívida da guarda; a `v4` passa na guarda sem aviso com a mesma opacidade, o que merece conferência. O estudo da família (`_estudo/familias/05_areas.md`) ainda recomenda começar entre 0,25 e 0,35, em conflito com a ACE-5.
