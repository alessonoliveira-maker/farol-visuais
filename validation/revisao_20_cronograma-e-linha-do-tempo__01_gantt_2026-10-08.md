# Parecer de revisão: 20_cronograma-e-linha-do-tempo/01_gantt

> Data: 2026-10-08. Revisor independente. Insumo do corretor: existe uma única rodada de correção, e tudo o que bloqueia está listado aqui.

| Versão | Resultado | Bloqueantes |
|---|---|---|
| `v1_calendario-de-campanhas-do-trimestre` | reprovada | 2 |
| `v2_progresso-contra-linha-de-base` | aprovada | 0 |
| `v3_plano-hierarquico-por-publico` | reprovada | 1 |
| `v4_criativos-empacotados-com-periodo-aberto` | aprovada | 0 |

`npm run check -- 20_cronograma-e-linha-do-tempo/01_gantt`: 0 com erro, 2 avisos, os dois na v3 (frase acessível com 235 caracteres, a 15 do teto; barra de agrupamento de 5 px, que é a forma pedida pelo catálogo). Os PNGs julgados são os de 2026-10-08 16:08, mais novos que os quatro `Chart.tsx`.

As observações não bloqueantes das quatro versões estão no README do modelo, na seção `## Observações da revisão (não bloqueantes)`. Quem corrigir a v1 e a v3 pode aproveitar o arquivo aberto para alinhar as que são dela.

## v1_calendario-de-campanhas-do-trimestre: reprovada

```
Versão: 20_cronograma-e-linha-do-tempo/01_gantt/v1_calendario-de-campanhas-do-trimestre
Data: 2026-10-08
Resultado: reprovada
Não: 17, 19, 31
Correções:
  17 e 19. ANO-5, ACE-1: o pico de campanhas em paralelo sai 6 e o dado dá 4; contar simultaneidade num instante.
  31. ROT-7 (marca fina), ACE-6: o rótulo da primeira barra cruza a linha de hoje; mover o rótulo para depois da linha.
Não se aplica: 4 (barra de intervalo no tempo, sem zero), 6, 18 (sem dica), 27, 28, 29, 30
```

### Bloqueante 1. O pico impresso é falso

- **Pergunta e regra:** 17 e 19; ANO-5 (linha de leitura calculada do dado, com a conclusão) e ACE-1 (frase acessível diz a conclusão); seção 14.1, regra que decide o que o desenho afirma.
- **Evidência na tela:** a linha de leitura diz "Em 12/11/2026, 3 de 8 campanhas estão no ar; no pico, 6 correm em paralelo", e a frase acessível repete "no pico, 6 correm em paralelo". O próprio desenho desmente: nenhuma vertical corta mais de 4 barras.
- **Evidência no dado:** contando dia a dia de 2026-10-01 a 2026-12-31, o máximo é **4 campanhas simultâneas**, de 2026-11-20 a 2026-11-26 (Lançamento da linha verão, Prova social em vídeo, Esquenta da Black Friday e Black Friday). O "3 no ar em 12/11/2026" e os "47 dias" da mais longa conferem.
- **Causa:** `peakOverlap` (Chart.tsx, linhas 123 a 126) conta, para cada campanha, todas as que cruzam o período dela em algum momento, e fica com o maior. Isso mede vizinhança, não simultaneidade: a `camp-03` cruza cinco outras ao longo dos 47 dias dela (01, 04, 05, 06 e 07), daí o 6, mas a `camp-01` termina em 2026-10-31 e a `camp-07` começa em 2026-12-01.
- **O que mudar:** contar quem está no ar num instante. O máximo sempre acontece no início de alguma campanha, então basta, para cada linha, contar as que têm `other.startMs <= row.startMs && row.startMs < other.endMs` e ficar com o maior. Manter o retorno `number | null` (EST-1b). Depois do render, a linha de leitura e a frase acessível precisam dizer 4.

### Bloqueante 2. O rótulo da primeira barra cruza a linha de hoje

- **Pergunta e regra:** 31; ROT-7, exceção da marca fina ("onde o rótulo cruzaria uma marca de traço, quem sai do lugar é o rótulo"). A linha de hoje é dado pelo teste da ACE-6: tapada, ninguém sabe o que está no ar hoje.
- **Evidência medida:** no `preview.svg`, o rótulo `Busca paga, 31 dias` começa em x=415,2 e mede cerca de 99 px; a linha de hoje está em x=491,9, ou seja, **76,7 px depois do início do rótulo**, entre `31` e `dias`. No PNG em 2x, coluna x=1049, o halo do rótulo apaga a linha de y=286 a y=299 no escuro e de y=286 a y=300 no claro: **7,0 px e 7,5 px de linha sem tinta**. No vão entre as duas palavras o halo não fecha, sobra um toco do traço e o rótulo lê `31'dias` nos dois temas.
- **O que mudar:** no `Overlay`, depois de escolher o lado, testar se a caixa estimada do rótulo (de `x` até `x + text.length * CHAR_WIDTH`, ou o espelho quando a âncora é `end`) contém `todayX`. Se contiver, ancorar o rótulo logo depois da linha (`todayX + LABEL_GAP`, na mesma linha da barra) ou do outro lado da barra quando couber. O teste vale para todas as linhas: a decisão se toma pelo que o dado pode produzir, não pela posição de hoje no dado padrão.

### Conferido e aprovado na v1, para não mexer

Tupla `[início, fim)` com fim exclusivo; ticks mensais por `Date.UTC` com `formatMonthShort`; grade só vertical (EIX-3); `tickLine` e `axisLine` desligados com `tickMargin` 8 e altura de eixo 24 (EIX-5, EIX-6b); `interval={0}` nas 8 categorias (EIX-7); cor por chave de plataforma nos slots 1, 3, 6 e 5 (COR-3, COR-8) com a plataforma escrita no rótulo (ACE-2, ROT-1); duas anotações, hoje e congelamento, com `ifOverflow="extendDomain"` e faixa em `--surface-sunken` (ANO-1, ANO-3, ANO-4); vazio com `role="status"` e `Filter` (EST-1); dado fictício e sem relógio.

## v3_plano-hierarquico-por-publico: reprovada

```
Versão: 20_cronograma-e-linha-do-tempo/01_gantt/v3_plano-hierarquico-por-publico
Data: 2026-10-08
Resultado: reprovada
Não: 20
Correções:
  20. ACE-3, TOK-5, papel de cor da 17.2: a barra de entrega Planejada mede 1,79:1 e 1,83:1 sem número escrito; contorno em var(--text-muted).
Não se aplica: 4 (barra de intervalo no tempo, sem zero), 6, 18 (sem dica), 27, 28, 29, 30
```

### Bloqueante 1. As barras de entrega Planejada ficam abaixo do piso de contraste nos dois temas

- **Pergunta e regra:** 20; ACE-3 (marca de dado e contorno 3:1 contra o fundo adjacente, salvo com o valor escrito na marca ou junto dela); armadilha TOK-5 (`--line-strong` não se vê como marca); tabela 17.2, em que neutro de dado **sem** valor escrito é `--text-muted` e `--line-strong` só vale com o número ao lado.
- **Evidência no código:** `STATUS.planned.fill` é `var(--surface-sunken)` (Chart.tsx, linha 69) e o contorno é `var(--line-strong)` de 1 px (linhas 290 e 291).
- **Evidência medida nos PNGs** (barra de `Premissas de receita`, coluna x=1010 em 2x):

| Tema | Cartão | Preenchimento | Contraste | Contorno | Contraste | Anel do ícone | Contraste |
|---|---|---|---|---|---|---|---|
| escuro | `#121c2e` | `#070c16` | 1,15:1 | `#33456a` | 1,79:1 | `#7f8fab` | 5,21:1 |
| claro | `#ffffff` | `#eaeff7` | 1,15:1 | `#b4c0d6` | 1,83:1 | `#5c6b87` | 5,37:1 |

- **Por que a isenção não vale aqui:** a linha traz nome, dono e a palavra `Planejada`, mas nenhum número do período. Início e fim da entrega só existem na posição da barra, e pelo teste de tapar a informação some com ela. São 3 das 8 entregas (`Painel de campanhas`, `Premissas de receita`, `Revisão do orçamento`) e todo o plano depois de hoje, que é a metade do ano que o caso de uso quer ver distribuída.
- **Efeito colateral visível:** o anel do ícone `Planejada` usa `--text-muted` e a barra usa `--line-strong`, então a amostra da coluna de status e a marca que ela identifica estão em tokens diferentes.
- **Por que o check não acusou:** a guarda CONTRASTE-MARCA só lê traço a partir de 2 px, e o contorno é de 1 px. Fora do escopo da guarda a medição é do revisor.
- **O que mudar:** contorno da barra planejada em `var(--text-muted)`, que mede 5,21:1 e 5,37:1 e é o mesmo token do anel. O preenchimento `--surface-sunken` pode ficar, porque quem carrega a marca passa a ser o contorno, ou sair, virando a forma vazada do papel de ausência da 17.2. Atualizar a nota do `meta.json`, que hoje diz "contorno var(--line-strong)". Não mexer nas outras três cores de status nem na faixa de agrupamento, que já mede 5,21:1 e 5,37:1.

### Conferido e aprovado na v3, para não mexer

Três níveis achatados com indentação de 12 px por nível; colunas de dono e status alinhadas com o cabeçalho (168, 64 e 80 px); status com ícone de forma própria e palavra (ACE-2), `Em atraso` em `--negative` com peso 600 e triângulo; envoltória de `min(início)` e `max(fim)` conferida nos quatro públicos; contagem `2 concluídas, 2 em curso, 3 planejadas, 1 em atraso` confere com o dado; ticks trimestrais com grade só vertical; linha de hoje em duas `ReferenceLine` com halo (TOK-10); 16 linhas impressas com `interval={0}`; vazio com `role="status"`. O aviso de 5 px na barra de agrupamento é a forma que o catálogo pede.

## v2_progresso-contra-linha-de-base e v4_criativos-empacotados-com-periodo-aberto: aprovadas

Sem bloqueante nas 32 perguntas. Os números impressos foram refeitos à mão e conferem: na v2, `+12 d` e `+13 d`, esperado de 71% e 29%, `2 de 5` com plano; na v4, o empacotamento guloso dá as 7 faixas desenhadas e 16 no excedente, e `16 de 33` no ar com `4` sem data de fim.

Duas observações dessas versões são defeito de ramo que o dado padrão não exercita, e por isso não reprovam, mas merecem a atenção de quem colar no Farol:

- **v2:** linha sem plano e sem início real recebe `hoje` como início (Chart.tsx, linha 120). Na escala do preview a marca de um dia teria 1,5 px e ficaria sob a linha de hoje; numa janela curta vira realizado que não existe.
- **v4:** o empacotamento trata o criativo em aberto como encerrado em hoje mais um dia (linha 129), então um criativo com início futuro cairia na mesma faixa, por cima do rótulo `em aberto`.

O trilho do planejado da v2 usa a mesma receita de tokens que reprova na v3 e mede o mesmo 1,79:1 e 1,83:1. A diferença que decide é a isenção: na v2 cada linha escreve `feito`, `esperado` e `atraso` ao lado do trilho, que é o papel de série de comparação com valor escrito da 17.2; na v3 a barra planejada não tem número nenhum. A troca do contorno para `--text-muted` também serve à v2 e está anotada no README.
