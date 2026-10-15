# Parecer de revisão: 13_progresso-meta-e-gauge/04_aneis-concentricos

Data: 2026-10-14. Revisor independente. Julgadas as três versões, todas com motivo
`revisao_desatualizada`: o `Chart.tsx` das três mudou depois dos vereditos de 2026-09-19 (o trilho
saiu de `--surface-overlay` para `--surface-sunken`). Julgado o arquivo de hoje, não as notas
antigas. PNGs de 2026-10-02, mais novos que os `Chart.tsx` de 2026-09-28. `npm run check` com
tipos: 0 com erro, 0 aviso, 0 escape.

Resultado: `v1` reprovada por dois bloqueantes (perguntas 19 e 12), `v2` aprovada, `v3` reprovada
por um bloqueante (pergunta 14). As observações não bloqueantes estão no README do modelo,
parágrafo de 2026-10-14.

## O que foi medido e como

* **Trilho, o motivo da mudança: resolvido nas três.** `TRACK_FILL` é `--surface-sunken`. Lido do
  PNG: `#070c16` contra o cartão `#121c2e` no escuro, `#eaeff7` contra `#ffffff` no claro. O trecho
  que falta para a meta aparece nos dois temas.
* **Encoding, por ângulo no raio médio**, a cada 0,1°, a partir do topo no sentido horário, nos dois
  temas com o mesmo resultado. `v1`: agendas termina em 305,9° (34 de 40 pede 306,0°), SLA em
  316,2° (51 de 58 pede 316,6°), entradas em volta cheia (132 de 120, travado). `v3`: agendas em
  323,8° (9 de 10 pede 324,0°), entradas em volta cheia (41 de 24, travado com 170,8% escrito), SLA
  sem arco. Domínio de 0 a 100 em todos os anéis; cor por id, slots 1, 3 e 6.
* **Contraste das marcas:** a `CONTRASTE-MARCA` mediu as três versões nos dois temas e passou.
* **Texto:** as guardas de tinta saíram `texto_em_html` nas três. Conferido à mão nos PNGs de 2x:
  nada cortado, nada sobreposto, 12 e 11 px, nenhum peso 700.
* **Frases acessíveis**, lidas de `data-farol-ace`: `v1` 139, `v2` 187, `v3` 213 caracteres, as três
  começando pelo tipo.
* **Não renderizado:** o ramo de vazio (lido no código: as três têm o bloco `role="status"` com
  `Filter`) e o ramo sem meta da `v1`, que o dado fixo dela não exercita.

## v1_tres-metas-da-semana: reprovada

### Bloqueante 1. Pergunta 19, ACE-2, item 4 do "O que demonstra" do catálogo

**Evidência.** O catálogo, e o `demonstrates` do `meta.json` com ele, dizem: "Anel que não fechou
com ícone e o que falta escrito na legenda". O `Chart.tsx`, linhas 122 a 126, só desenha ícone para
dois estados: `CircleDashed` sem meta e `CheckCircle2` fechado; o anel aberto cai no `null`. No PNG,
nos dois temas, Agendas marcadas e SLA cumprido saem sem ícone, e só Entradas tratadas tem o
círculo com o visto. A ACE-2 é literal: "estado com ícone e texto". O estado aberto tem o texto
("faltam 6 agendas") e não tem o ícone, que é justamente o que a versão existe para demonstrar.

**O que mudar.** Dar ao anel aberto um ícone próprio, na mesma posição dos outros dois, distinto do
`CheckCircle2` (fechado) e do `CircleDashed`, que o modelo reserva para sem meta. Por exemplo
`CircleAlert` ou `CircleMinus` em `--text-muted`; cor semântica só se o estado pedir, sem
`--chart-2` nem `--chart-4` no corpo (COR-8). Manter o "faltam N" escrito.

### Bloqueante 2. Pergunta 12, ROT-5, item 3 do "O que demonstra" do catálogo

**Evidência.** O catálogo diz: "Legenda lateral tabular com valor bruto, meta e percentual por
anel". O `Chart.tsx`, linhas 131 a 133, só escreve o percentual quando o anel fechou; nos abertos a
linha termina no que falta. No PNG: "34 de 40 agendas, faltam 6 agendas" (o arco codifica 85%, que
não está escrito) e "51 de 58 atendimentos, faltam 7 atendimentos" (88%, idem). O arco carrega o
percentual em três anéis e só um deles o tem escrito, numa peça cujo README diz que o formato nunca
se lê pelo comprimento do arco. A lista é frase corrida, e não as colunas de largura fixa
alinhadas à direita da ROT-5; só o primeiro número de cada linha leva `kpi-number` (TIP-1).

**O que mudar.** Cada item da lista em duas linhas: na primeira, amostra, nome e ícone de estado;
na segunda, colunas de largura fixa alinhadas à direita, em `kpi-number` ou `tabular-nums`, com
valor, meta com a unidade e percentual nos três anéis, e o "faltam N unidade" depois, só nos
abertos. A mesma precisão de percentual nos três anéis e na frase (DAD-5); a inteira é a da
decisão (NUM-1), mas a escolha é do produtor desde que seja uma só. A coluna da lista tem cerca de
330 px no canvas `card`; "132 · de 120 entradas · 110%" cabe. Se não fechar, a GEO-1 manda trocar
o canvas e declarar no `notes`, nunca truncar número.

### Na mesma passada, sem peso de bloqueio

* **Frase acessível.** Hoje não diz qual meta fechou nem que o SLA ficou a 7 atendimentos. Com o
  dado padrão, por exemplo: "Anéis concêntricos com 3 metas da pré-vendas na semana de 07/09/2026.
  1 de 3 metas fechadas: Entradas tratadas, com 110,0%. Agendas marcadas não fechou, faltam 6
  agendas; SLA cumprido não fechou, faltam 7 atendimentos." São 218 caracteres; com o percentual
  inteiro, 216. Montar percorrendo `rings`, não só o primeiro aberto.
* **Ramo sem meta latente.** O mesmo código da `v3` escreve "N de sem meta" sem unidade quando
  `goal` é `null`; o bloqueante da `v3`, abaixo, vale aqui também e se corrige com a mesma linha.
* `bandForIndex` e `ringColor` com fallback silencioso (quarta meta sobreposta à terceira, id
  desconhecido em `--chart-1`), e o ícone a cerca de 190 px do nome. Estão no README.

**O que não mexer:** anéis na ordem do dado, domínio de 0 a 100 por anel, estouro travado na volta
cheia com o percentual escrito, slots 1, 3 e 6 por id, trilho em `--surface-sunken`, bloco de vazio.

## v3_meta-proporcional-e-sem-meta: reprovada

### Bloqueante. Pergunta 14, NUM-6, seção 14.1 (unidade)

**Evidência.** No PNG, nos dois temas, a linha do SLA diz "7 de sem meta". O `Chart.tsx`, linha 142,
só escreve a unidade dentro do ramo com meta (`${formatInt(ring.goal)} ${ring.unit}`); sem meta, o
ramo devolve "sem meta" e a unidade some, deixando o "de" sobrando da forma "N de META unidade". A
unidade do anel, "atendimentos" (`data.ts`, linha 23), não aparece em lugar nenhum da tela nem da
frase acessível, que diz só "SLA cumprido ainda sem meta definida". Ao lado de "SLA cumprido", um 7
solto lê tanto como contagem quanto como percentual ou horas. A NUM-6 pede o substantivo em toda
contagem solta, e a 14.1 põe a unidade entre as regras que bloqueiam sempre. É o anel que a versão
existe para demonstrar.

**O que mudar.** No ramo `goal === null`, escrever `${formatInt(ring.value)} ${ring.unit}, sem meta
definida`, com o número em `kpi-number`: "7 atendimentos, sem meta definida". Na frase, "SLA cumprido
ainda sem meta definida, com 7 atendimentos.". Com a concordância de baixo também corrigida, a frase
fica com 232 caracteres, abaixo do aviso de 235. Aplicar a mesma linha na `v1`, que tem o ramo.

### Na mesma passada, sem peso de bloqueio

* **Concordância.** "faltam 1 agendas" na tela e "falta 1 agendas" na frase. Levar a forma singular
  no dado (por exemplo `unitOne: 'agenda'`) e escolher pela contagem; vale para `v1` também.
* **Amostra do anel sem meta.** A bolinha cheia em `--chart-6` aponta para um anel dourado que não
  existe; o anel é trilho tracejado. Amostra vazada e tracejada em `--text-muted` quando `goal` é
  `null` (ROT-4, "vazado para ausência").
* **Aresta do setor às 12 h** no trilho tracejado (medida a 358,9°), o `TrendingUp` ausente em
  exatamente 100% e o `String()` do selo. Estão no README.
* Se a `v1` passar a lista para colunas, alinhar a `v3` ao mesmo desenho mantém o modelo coerente;
  não é exigência da `v3`.

**O que não mexer:** trilho tracejado sem arco e sem zero no anel sem meta; volta cheia travada com
170,8% escrito e `TrendingUp`; selo com "3 de 5 dias úteis"; frase que nomeia a ausência.

## v2_quem-fechou-as-tres-metas: aprovada

Sem "não" nas 32 perguntas. Seis trios com o mesmo raio (svg de 64 px em todos) e o mesmo domínio
de 0 a 100 (EIX-9); legenda única no topo com amostra por meta na ordem dos anéis, de fora para
dentro, que é também a ordem dos pares da esquerda para a direita; par valor/meta em `kpi-number`
de 11 px, com `CheckCircle2` e `--text-primary` no fechado e `--text-muted` no aberto, então o
estado não depende só de cor (ACE-2); selo "três metas" com ícone e texto só para Talita V., a única
que fechou as três; 100% exato conta como fechado (Talita no SLA, Renan em agendas e SLA); nome
longo "Heitor de Moraes Prado" inteiro nos dois temas; canvas de 960 por 440 declarado no `notes`.
As observações (frase que não diz quem fechou, pares sem unidade, selo curto, margem herdada do
Recharts) estão no README.

## Registro

```
Versão: 13_progresso-meta-e-gauge/04_aneis-concentricos/v1_tres-metas-da-semana
Data: 2026-10-14
Resultado: reprovada
Não: 19, 12
Correções:
  19. ACE-2 e item 4 do catálogo: ícone próprio no anel que não fechou, distinto do fechado e do sem meta.
  12. ROT-5 e item 3 do catálogo: percentual escrito nos três anéis, em colunas tabulares alinhadas à direita.
Não se aplica: 3, 6, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

```
Versão: 13_progresso-meta-e-gauge/04_aneis-concentricos/v2_quem-fechou-as-tres-metas
Data: 2026-10-14
Resultado: aprovada
Não: nenhum
Não se aplica: 3, 6, 8, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

```
Versão: 13_progresso-meta-e-gauge/04_aneis-concentricos/v3_meta-proporcional-e-sem-meta
Data: 2026-10-14
Resultado: reprovada
Não: 14
Correções:
  14. NUM-6: o anel sem meta escreve "7 atendimentos, sem meta definida", e a frase leva o valor com a unidade.
Não se aplica: 3, 6, 13, 18, 26, 27, 28, 29, 30, 31, 32
```
