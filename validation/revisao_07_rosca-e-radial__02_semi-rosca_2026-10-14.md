# Revisão de 07_rosca-e-radial/02_semi-rosca, 2026-10-14

Julgada: `v4_agendas-acima-da-meta-semanal`, em `revisao_desatualizada` (o `Chart.tsx` mudou depois do aceite de 2026-09-18, com o trilho passando a `--surface-sunken`). Julgado o arquivo de hoje, não a nota antiga. `check` com 0 erros e 0 avisos; PNGs de 2026-10-02, mais novos que o `Chart.tsx` de 2026-09-28.

Resultado: `v4` reprovada, com dois bloqueantes. As observações não bloqueantes estão no README do modelo, no parágrafo de 2026-10-14 da seção final.

## v4_agendas-acima-da-meta-semanal: reprovada

```
Versão: 07_rosca-e-radial/02_semi-rosca/v4_agendas-acima-da-meta-semanal
Data: 2026-10-14
Resultado: reprovada
Não: 8, 13, 16
Correções:
  16 e 8. EST-1, EST-2 e 14.1: trocar o zero de `row?.inbound ?? 0` por um bloco `role="status"` que substitui o gráfico quando `data` vem vazio.
  13. ANO-3, REC-13 e TOK-10: desenhar a meta depois dos dois `RadialBar`, no raio real da banda, com segundo fundo próprio, para que ela se veja sobre o arco.
Não se aplica: 3, 18, 28, 29, 30, 32 (a meta é referência, não traço que carrega relação)
```

### Bloqueante 1: perguntas 16 e 8, EST-1 e EST-2, seção 14.1 "ausência exibida como zero"

- **O que a peça faz.** `Chart.tsx:123` lê `data[0]` e as linhas 126 e 127 fazem `row?.inbound ?? 0` e `row?.outbound ?? 0`. Não existe ramo para `data.length === 0`. Com `data=[]`, o `CenterLabel` escreve "0 de 90 agendas na semana", a legenda escreve "Inbound 0" e "Outbound 0", o `MetaTick` cai na ponta do arco (domínio `max(0, 90)`) e a frase acessível anuncia "Faltam 90 agendas para a meta".
- **Por que reprova.** A pergunta 16 pede que o vazio substitua o gráfico inteiro por um bloco `role="status"`, e a 8 pede que ausência nunca vire zero. A 14.1 põe "ausência exibida como zero" entre as regras que bloqueiam sempre: o desenho afirma uma semana medida com zero agendas, o que é falso quando o recorte não tem linha.
- **O que mudar.** Antes do `return` principal, `if (data.length === 0)` devolve o bloco do padrão da família (como `07_rosca-e-radial/04_barra-radial/v1_agendas-por-sdr-na-semana/Chart.tsx:79`): raiz `h-full w-full min-w-0`, `role="status"`, ícone `Filter` de 16 px e frase de 12 px em `--text-muted` dizendo que a semana não tem agendas no recorte. Daí em diante `row` é garantido e o `?? 0` sai. Zero medido (linha com `inbound: 0`) continua desenhando e escrevendo 0 (EST-3).
- **Contexto.** `v1`, `v2` e `v3` deste modelo também não têm o bloco de vazio; ficam fora deste julgamento e vão no relatório como defeito notado.

### Bloqueante 2: pergunta 13, ANO-3, armadilhas REC-13 e TOK-10, seção 14.1 "tique perdido"

- **O que o `meta.json` promete.** Terceiro item de `demonstrates`: "Meta marcada por um traço de referência sobre o arco, na posição real do valor". O comentário do topo do `Chart.tsx` diz que, com a soma acima da meta, "a meta vira um traço de referência sobre o próprio arco".
- **O que o render mostra.** No `preview.svg`, o `<line>` tracejado da meta (linha 12 do arquivo) vem antes dos `<path>` dos dois gomos, porque `<MetaTick>` é filho anterior aos `<RadialBar>` (`Chart.tsx:148` contra 149 a 166). O traço vai de 72,1 a 113,0 px de raio, no ângulo certo (155,8 graus, 90 de 104); a banda pintada vai de 74,05 a 101,05 px. Sobre o arco não sobra nada; fora dele sobram dois traços de 3 px de `strokeDasharray="3 3"`, o mais próximo a 3 px da borda externa, sem tocar o arco; no miolo, 2 px invisíveis. No PNG de 2x, nos dois temas, o que se lê é o rótulo "meta 90" flutuando à esquerda do arco, e nada no arco diz onde está o 90: o arco cheio parece ir de 0 até a meta, exatamente a leitura que o domínio em `max(total, meta)` foi escolhido para evitar.
- **Por que reprova.** É a marca que dá nome à versão ("acima da meta") e que torna honesto o domínio em `max(total, meta)`. A 14.1 lista "tique perdido" como consequência visível que bloqueia, e a versão não demonstra o item que o `meta.json` declara.
- **O que mudar.** Consultar `REC-13` e `TOK-10` no `ARMADILHAS.md` antes de corrigir. Mover `<MetaTick>` para depois dos dois `<RadialBar>`. Calcular o raio do traço como o Recharts calcula a banda: descontar a margem de 5 px (`outer` 104, não 109) e o `barCategoryGap` de 10% (banda de 74 a 101), ou ler o raio do próprio setor. Como nenhum token contrasta ao mesmo tempo com o cartão e com o `--chart-3` do outbound (TOK-10), escolher uma das duas saídas medidas: (a) traço contínuo em `--text-muted` com contorno de 2 px em `--surface-raised` cortando o gomo, que vira o "sobre o arco" do `meta.json`; ou (b) dois trechos sólidos encostados nas duas bordas da banda, de fora e de dentro, de 8 px ou mais cada, e então reescrever o item 3 de `demonstrates` para "nas duas bordas do arco". Em qualquer das duas, o rótulo "meta 90" continua com halo e fora da banda, e o tracejado de 3 por 3 sai, porque em 12 px ele deixa só dois traços.

### O que foi conferido e está certo na v4

Domínio do ângulo de zero a `max(total, meta)`: inbound 45 ocupa 77,9 graus e outbound 59 ocupa 102,1 graus, proporção honesta entre os canais, sem corte; a meta no ângulo real (90 de 104). Cor por chave (`INBOUND_FILL` slot 1, `OUTBOUND_FILL` slot 3, na ordem da COR-8), separação de 1 px em `--surface-raised` entre os gomos, sem gradiente, sem agulha nem faixas. Números por `formatInt`, sinal de mais à mão no selo, `font-display` e `kpi-number` em todo número, tamanhos 20, 12 e 11 px, nenhum peso 700, texto horizontal. Frase acessível de 124 caracteres, começando por "Meia rosca empilhada" e com a conclusão. Toda parte com nome e número sem interação, e 45 mais 59 somam o 104 do centro. Contraste de texto e de marca medido pelas guardas nos dois temas.

### Observações que podem ir junto (não bloqueiam)

Estão no README: legenda em ordem inversa à do arco, rótulo direto que caberia no lugar da legenda, "+14" sem o substantivo, 86 px vazios no topo do corpo, centro calculado de dois jeitos, `CHART_MARGIN` não passada e deslocamentos soltos no corpo das funções.
