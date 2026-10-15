# Parecer de revisão: 13_progresso-meta-e-gauge/01_barra-de-progresso-linear

Data: 2026-10-14. Revisor independente. Julgadas as quatro versões pelo arquivo de hoje, todas com
motivo `revisao_desatualizada` (os `Chart.tsx` mudaram em 2026-09-28 para o trilho em
`bg-surface-sunken`). PNGs de 2026-10-02 10:58, mais novos que os `Chart.tsx`. `npm run check` com
tipos: 0 com erro, 2 avisos (`AGREGACAO-ZERO` na `v1`, por dívida, e `CONTRASTE-MARCA` na `v4`),
0 escapes.

Resultado: `v1`, `v2` e `v3` aprovadas; `v4` reprovada por um bloqueante só. As observações não
bloqueantes das quatro estão no README do modelo, seção `Observações da revisão (não bloqueantes)`,
parágrafo de 2026-10-14.

| Versão | Resultado | Não |
|---|---|---|
| `v1_receita-do-trimestre-contra-meta` | aprovada | nenhum |
| `v2_agendas-no-ritmo-do-mes` | aprovada | nenhum |
| `v3_cota-por-executivo` | aprovada | nenhum |
| `v4_filas-contra-teto-com-estouro` | reprovada | 11, 20 |

## O que foi medido e como

* **Contraste lido do PNG**, pixel a pixel, com a fórmula da WCAG. Cartão `#121c2e` e `#ffffff`,
  trilho `#070c16` e `#eaeff7`. A barra de demanda da `v4` é `#33456a` no escuro e `#b4c0d6` no
  claro, que é `--line-strong` opaco: 1,79:1 e 1,83:1 contra o cartão, os números da tabela 17.10, e
  2,05:1 e 1,59:1 contra o trilho, que é o fundo adjacente da ACE-3.
* **Guardas não medidas, conferidas à mão:** `ESPESSURA-MARCA`, `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e
  `TEXTO-NA-MARCA` (texto e barra em HTML; nos PNGs nenhum texto cortado nem encostado, e todo par de
  texto está na 17.10), `OPACIDADE-MARCA` (a guarda não lê `opacity-70` da `v2` nem `opacity-50` da
  `v4`, que vêm por classe; medidos à mão, estão no README).
* **Não renderizado:** o estado vazio da `v3` e da `v4`, o ramo de mediana nula da `v3` e o ramo de
  meta zero da `v1`. O que se diz deles é leitura do código.

## `v4_filas-contra-teto-com-estouro`: o bloqueante

### Perguntas 11 e 20; tabela 17.2 (neutro de dado com valor escrito), ACE-3, seção 14.1 (papel de cor e contraste); armadilha TOK-5

**O que o desenho faz.** A barra de demanda de cada fila é pintada com `--line-strong`
(`Chart.tsx:79`, `backgroundColor: 'var(--line-strong)'`). É a marca principal da versão: ela diz
quanto da capacidade cada fila ocupa. Mede 1,79:1 no escuro e 1,83:1 no claro contra o cartão, e
2,05:1 e 1,59:1 contra o trilho. O `check` acusa as três marcas em `CONTRASTE-MARCA`.

**O que está escrito na tela.** Por fila, só o teto e a folga ou o estouro: "teto 180" e "34 acima
do teto do mês"; "teto 150" e "faltam 18"; "teto 90 (premissa)" e "faltam 29". A demanda de
Agendas marcadas (132) e de Retomada de contato (61), que é exatamente o comprimento da barra
neutra, não aparece em lugar nenhum, nem na frase acessível. Na fila que estourou a parte neutra
vale o teto, que está escrito; nas outras duas, não. A demanda só sai por subtração.

**Por que bloqueia.** A tabela 17.2 tem dois neutros e separa os dois por este critério:
`--line-strong` "quando cada marca carrega o próprio número", com o limite "só vale com o valor
escrito na marca ou junto dela, que é a isenção da WCAG 1.4.11"; `--text-muted` "quando não há
número por marca". A ACE-3 pede 3:1 da marca contra o fundo adjacente, salvo com o valor escrito.
Aqui não há valor escrito, então a isenção não vale e a marca fica abaixo do piso nos dois temas. É
o caso descrito na TOK-5 ("os estudos previam `--line-strong` para teto e trilho, e quem produziu
obedeceu") e o mesmo critério aplicado em `19_cascata-waterfall/07`, `11_fluxo-sankey/03` e
`22_unidades-waffle-e-pictograma/03`. A guarda só orienta porque não sabe se o valor está escrito;
a revisão sabe, e não está. A observação de 2026-09-18 no README dizia que o par é o aprovado "com o
valor escrito ao lado", e o valor não está ao lado.

**O que mudar.** Uma das duas:

1. **Manter `--line-strong`, como o catálogo pede, e escrever a demanda em cada linha**, na linha
   de apoio e antes da folga: "demanda 132 · faltam 18 para o teto do mês", "demanda 214 · 34 acima
   do teto do mês", com `formatInt` em `kpi-number`. A fila sem coleta continua com
   `formatUnavailable()`. É a correção menor, ativa a isenção da 17.2 e responde de uma vez à
   observação de 2026-09-18 ("a demanda de cada fila não aparece escrita").
2. **Trocar a barra para `--text-muted`** (5,21:1 e 5,37:1 contra o cartão; 5,98:1 e 4,65:1 contra o
   trilho), mantendo o resto. Nesse caso, atualizar a Anatomia, item 3, e a linha da `v4` em
   Versões no README, e dizer o desvio no `notes` do `meta.json`. Conferir nos dois PNGs que o traço
   do teto, também em `--text-muted`, continua lido onde passa ao lado da barra.

Qualquer das duas exige novo render com `--tema ambos`. Na opção 2 o aviso de `CONTRASTE-MARCA`
some; na opção 1 ele continua, porque a guarda não lê o texto, e o `notes` deve dizer que a demanda
está escrita em cada linha.

**Da mesma rodada, sem peso de bloqueio** (também no README): escrever o substantivo da contagem
(NUM-6), que a opção 1 pode resolver junto ("demanda 132 agendas"); trocar o contorno tracejado da
fila sem coleta de `--line-strong` para `--text-muted`, papel Ausência da 17.2; dizer na frase
acessível qual fila estourou e quanto.

**O que não mexer**, porque foi conferido e está certo: domínio do zero e escala comum em 1,3 vez o
maior entre teto e demanda, calculada sobre o conjunto; polaridade invertida, com o excedente em
`--negative` (5,50:1 e 6,36:1 contra o cartão), ícone `AlertTriangle` e a palavra "acima"; teto de
premissa dito no rótulo, sem cor de procedência; fila sem coleta com trilho tracejado, `Unplug` e
`formatUnavailable()`, nunca barra zerada; estado vazio com `role="status"`; frase acessível de 100
a 250 caracteres começando pelo tipo.

## `v1`, `v2` e `v3`: por que passaram

* **`v1`.** Barra do zero, domínio em `Math.max(valor, meta) × 1,05`, meta escrita com nome e valor,
  o que falta escrito em `kpi-number`, declaração de que não há ritmo esperado. `--chart-1` contra o
  trilho mede 10,90:1 e 5,20:1; o traço da meta, 5,98:1 e 4,65:1. O ramo de meta zero que escreve
  "0,0%" é latente, está na fila de dívida da `AGREGACAO-ZERO` e foi para o README.
* **`v2`.** Ritmo e projeção chegam prontos no dado, sem relógio no componente; projeção em
  textura da mesma cor e dita como premissa; lacuna escrita em `--negative` com a palavra "atrás".
  O traço do ritmo cai, neste dado, no vão da listra e se vê nos dois temas (9,36:1 e 7,04:1); a
  fragilidade dessa posição está no README.
* **`v3`.** Escala comum sobre o conjunto, ordem por atingimento, excedente em `--positive` com o
  percentual escrito, sem meta no fim com o valor escrito e fora da mediana, mediana nula vira
  `formatUnavailable()` com `Unplug`. A mediana some onde cruza a barra (TOK-10), mas o valor dela
  está escrito no topo e o traço se lê nas cinco linhas em que passa pelo trilho.

## Registro

```
Versão: 13_progresso-meta-e-gauge/01_barra-de-progresso-linear/v4_filas-contra-teto-com-estouro
Data: 2026-10-14
Resultado: reprovada
Não: 11, 20
Correções:
  11. Tabela 17.2, neutro de dado com valor escrito: escrever a demanda em cada linha, ou trocar a barra para --text-muted.
  20. ACE-3, TOK-5: resolvida pela mesma mudança (valor escrito ativa a isenção; --text-muted passa 3:1 por si).
Não se aplica: 3, 6, 18, 26, 27, 28, 29, 30, 31, 32
```

A 30 entra em "não se aplica" porque a única opacidade da `v4` está no traço do teto de premissa,
que é referência pelo teste da ACE-6 (tapado, "teto 90 (premissa)" e "faltam 29" continuam
escritos); a medida dele, 2,33:1 e 1,96:1 contra o trilho, está no README como observação.
