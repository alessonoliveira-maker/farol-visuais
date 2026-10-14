# Revisão de 17_comparacao-de-pontos/01_dot-plot-de-cleveland

Data: 2026-10-05. Revisor independente. `npm run check`: 0 com erro, 0 avisos. PNGs de 09:22, mais novos que os quatro `Chart.tsx`.

Resultado: `v2` e `v3` aprovadas com observações no README; `v1` e `v4` reprovadas. Os bloqueantes das duas são da mesma classe (papel de cor da referência, seção 17.2) e a `v4` soma um de pintura.

Contrastes medidos dos tokens usados aqui, contra `--surface-raised` e contra a zebra em `--surface-sunken`:

| Token | Escuro, cartão | Escuro, zebra | Claro, cartão | Claro, zebra |
|---|---|---|---|---|
| `--line-strong` | 1,79:1 | 2,05:1 | 1,83:1 | 1,59:1 |
| `--text-muted` | 5,21:1 | 5,98:1 | 5,37:1 | 4,65:1 |

## v1_ticket-medio-por-executivo: reprovada

### B1. Perguntas 11 e 13. Seção 17.2 (papel Referência), ANO-3, TOK-5

Evidência: `Chart.tsx`, linhas 214 a 224, desenha a mediana com `stroke="var(--line-strong)"` e `strokeDasharray="4 4"`. A tabela 17.2 dá o papel por nome: Referência (média, meta, teto) é `--text-muted`, 1 px, tracejado `3 3`; `--line-strong` fica só para a linha do zero. O traço mede 1,79:1 no escuro e 1,83:1 no claro, e 1,59:1 sobre as sete faixas de zebra no claro. A consequência aparece no render: a mediana (R$ 241,0 mil) cai a cerca de 1,5 px da linha de grade de R$ 240 mil, e nos dois PNGs as duas se leem como uma linha de grade só, um pouco mais grossa. A referência que a linha de leitura cita ("R$ 97,4 mil acima da mediana do time") não se distingue da grade. É o mesmo defeito que reprovou `09_dispersao-e-bolhas/06/v3` hoje.

O que mudar: `stroke="var(--text-muted)"` e tracejado `3 3` na `ReferenceLine` da mediana. Depois da troca, conferir nos dois temas que a mediana se separa da grade de R$ 240 mil; se ainda colar, o caminho é do dado (um ticket do meio que tire a mediana de cima do tique), não do domínio.

### Para alinhar na mesma passada (não bloqueia)

- Linha de leitura com `truncate` e o número da distância (R$ 97,4 mil) fora da frase acessível: a TIP-7 pede o conteúdo inteiro na frase. Cabe com folga no canvas `alto`; defeito latente.
- Halo dos valores em `--surface-raised` sobre faixa de zebra em `--surface-sunken`: no escuro aparece uma mancha mais clara em volta do número nas linhas pares. Sem perda de leitura.

## v4_sla-por-sdr-em-paineis-com-semana-vazia: reprovada

### B1. Perguntas 13 e 31. ROT-7, ordem de pintura

Evidência, nos dois PNGs ampliados 4 vezes: o tracejado do teto (x de 30 min) passa por cima do texto em dois painéis. No painel de 17/08/2026, corta "sem lead" de Bianca M. na altura do "l". No painel de 31/08/2026, corta "sem lead" no "e" e "na semana" no "a". O halo declarado em `HALO` não protege nada, porque `NoLeadShape` e `EmptyWeekNote` são pintados antes da `ReferenceLine`: a linha fica por cima do glifo. Hoje o corte é pálido só porque o traço está no token errado (B2); corrigido o token, ele fica evidente.

O que mudar: o texto precisa ser pintado depois da linha do teto (camada de `zIndex` acima da `ReferenceLine`, ou o texto como `label` de uma referência própria), para o halo cobrir o tracejado; ou tirar o texto do caminho, começando "sem lead" depois do x do teto e centrando a nota da semana vazia entre o teto e o fim do domínio. Conferir os dois textos nos dois temas.

### B2. Perguntas 11 e 20. Seção 17.2 (papéis Referência e Ausência), ACE-3, TOK-5

Evidência: três usos de `--line-strong` fora do papel dele. (a) Teto de SLA, `Chart.tsx` linha 197: referência em `--line-strong`, sem rótulo no painel; é o assunto do cartão ("7 de 39 medições passaram do teto") e mede 1,79:1 e 1,83:1, com 1,59:1 sobre a zebra no claro. (b) Anel de SDR sem lead, linha 107: a 17.2 manda contorno `--text-muted` para ausência. Na semana de recesso são oito anéis sem palavra ao lado de cada um, então a isenção da ACE-3 (valor escrito junto da marca) não vale; quatro deles ficam sobre a zebra, a 1,59:1 no claro. (c) Amostras da legenda do anel e do teto, linhas 214 e 215: amostra não tem valor escrito por definição (TOK-5) e mede o mesmo 1,83:1. O catálogo pede "ponto vazado em line-strong", mas o contrato vence, como o próprio dossiê avisa.

O que mudar: `--text-muted` no traço do teto (1 px, tracejado `3 3`), no contorno do anel e nas duas amostras da legenda. Atualizar o item de `demonstrates` do `meta.json` que cita `line-strong` e declarar o desvio do catálogo nas notas.

### Para alinhar na mesma passada (não bloqueia)

- Legenda abaixo dos painéis: a ROT-4 pede acima ou ao lado.
- Linha de leitura com `truncate` e a data na cauda (TIP-7). Cabe com folga no canvas `largo`; escrever a conclusão primeiro ou deixar quebrar.
- A ordem dos SDRs é a do `data.ts` e nada no cartão declara o critério (GEO-12).
- Unidade só no último tique de cada painel ("90 min"); a legenda repete a unidade.

## Aprovadas

- `v2_desvio-contra-a-meta-com-marca-direcional`: zero no meio do domínio simétrico, barra a partir do zero, desvio zero desenhado e escrito "na meta", contagem 5 de 12 conferida, linha do zero em `--line-strong` sólido como a 17.2 e a EIX-5 pedem. Barra composta a 0,7 medida à mão, porque a guarda OPACIDADE-MARCA não leu a constante: 3,03:1 e 3,67:1 no claro, 4,26:1 e 3,28:1 no escuro contra o cartão.
- `v3_cpl-bruto-qualificado-e-meta-por-origem`: ordem pela distância conferida linha a linha, três formas distintas, polaridade certa na coluna (5 de 12 acima da meta), empates do dado visíveis.

As observações das duas estão no README do modelo.
