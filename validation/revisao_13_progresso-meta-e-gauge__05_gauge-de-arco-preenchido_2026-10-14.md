# Parecer de revisão: 13_progresso-meta-e-gauge/05_gauge-de-arco-preenchido

Data: 2026-10-14. Revisor independente. Julgadas as três versões, todas com motivo
`revisao_desatualizada`: o `Chart.tsx` das três mudou em 2026-09-28, depois dos vereditos de
2026-09-19 (o trilho saiu de `--surface-overlay` para `--surface-sunken`). Julgado o arquivo de
hoje, não as notas antigas. PNGs de 2026-10-02, mais novos que os `Chart.tsx`. `npm run check` com
tipos: 0 com erro, 2 avisos AGREGACAO-ZERO (v1 na fila de dívida, v3 só em limite de desenho), 0
escape.

Resultado: `v1` reprovada por um bloqueante (perguntas 13 e 15), `v2` reprovada por um bloqueante
(pergunta 15, TIP-7), `v3` aprovada. As observações não bloqueantes estão no README do modelo,
parágrafo de 2026-10-14.

## O que foi medido e como

* **Trilho, o motivo da mudança: resolvido nas três.** `--surface-sunken` aparece nos dois temas;
  na v3 a fila em zero medido mostra o arco de fundo sozinho também no claro.
* **Encoding:** domínio explícito a partir de zero nas três (`[0, target]`, `[0, target × 1,2]`,
  `[0, max(capacidade)]`). Ângulos conferidos no `preview.svg`: v1 termina em 58° (57 de 90 pede
  210° − 152°), v2 troca de cor em 10° (20 de 24) e termina em −20° (23 de 24), v3 termina em 37,2°
  (18 de 25). Uma cor de destaque só; `--positive` só no excedente, com ícone e texto.
* **Contraste:** CONTRASTE-TEXTO e CONTRASTE-MARCA mediram as três nos dois temas e passaram.
* **Frases acessíveis**, lidas de `data-farol-ace`: v1 203, v2 184, v3 151 caracteres, as três
  começando pelo tipo.
* **Colisão entre texto e marca**, que a COLISAO-TEXTO não mede (ela compara texto com texto):
  medida nos PNGs de 2x, procurando o pixel de texto puro mais próximo do pixel de arco puro. v1:
  1,4 px de PNG, isto é, diagonalmente vizinhos, nos dois temas. v2: 7,1 px de PNG (3,5 px de
  canvas). v3: folga larga.
* **Não renderizado:** os ramos de `target` 0 (v1 e v2) e de realizado acima de 1,2 vez a meta
  (v2), que o dado fixo não exercita; ficaram como observação no README.

## v1_meta-de-agendas-em-arco: reprovada

### Bloqueante. Perguntas 13 e 15, ROT-7 e 17.7 (respiro): o `57` encosta no arco

**Evidência.** O `CenterLabel` (linhas 72 a 88) escreve o número em 30 px com a linha de base em
`cy − 6` (60,6 px no corpo de 302 × 111). A borda interna real da banda, lida no `preview.svg`, tem
raio 31,2 px em torno de `cy` 66,6; o topo do `5` (39,5 px) cai exatamente nela no canto superior
esquerdo. No PNG de 2x, o pixel de texto puro (329, 319) e o pixel de arco puro (328, 318) são
vizinhos em diagonal, e o pixel (328, 319) é mistura de 57% de `--chart-1` com 43% do texto no
escuro (56% e 44% no claro): não há folga nenhuma, nos dois temas. E o arco é pintado depois do
número (o `<path>` do `RadialBar` vem depois do `<text>` no SVG), então é a marca que cobre o canto
do glifo, e não o contrário. Com `tabular-nums`, todo valor de dois algarismos tem a mesma largura e
o mesmo contato; com três algarismos o arco cobriria o número. A revisão de 2026-09-18 registrou o
ponto como "menos de 1 px, sem sobreposição"; medido hoje, é contato, e pela 14.1 constante de
acabamento com colisão visível reprova.

**O que mudar.** Posicionar o número pela geometria real: tinta do número a pelo menos 4 px da
borda interna da banda (o raio que o Recharts usa, com a margem de 5 px e o vão de banda, não
`min(largura, altura) / 2`), descendo a linha de base, reduzindo a fonte ou afinando a banda; e
desenhar o `CenterLabel` depois do `RadialBar`, para nenhuma marca passar por cima de texto.
Conferir com um valor de três algarismos antes de entregar.

**Recomendado na mesma rodada, não bloqueante.** A linha de leitura corta em `setembro de 2…`
(TIP-7 permite, porque o achado vem antes e o ano está na frase acessível, mas a data partida lê
mal): `formatMonthShort` ou quebra em duas linhas. E o ramo de `target` 0 devolve `ratio` 0 e
escreveria `0,0% da meta` (aviso AGREGACAO-ZERO da fila de dívida): `null` e `formatUnavailable()`.

## v2_fechamentos-acima-da-meta: reprovada

### Bloqueante. Pergunta 15, TIP-7 (emenda de 2026-09-28): o rodapé corta o domínio do arco

**Evidência.** O rodapé (linhas 165 a 167) é uma linha só com `truncate`: "Meta de {meta},
{origem}. Arco alarga a {domainMax} só para o excedente caber." No PNG, nos dois temas, sai
"Meta de 20, fixada no orçamento comercial de 2026 para o…"; some "mês. Arco alarga a 24 só para
o excedente caber." A TIP-7 só admite `truncate` em texto de apoio que passe nas **duas**
condições, e este falha nas duas: o conteúdo cortado não está na frase acessível (ela termina em
"fixada no orçamento comercial de 2026 para o mês." e não cita 24 nem a folga), e a cauda carrega
um número, o 24, que não está escrito em nenhum outro lugar da peça. A consequência é de domínio,
regra que decide o que o desenho afirma: o fim do arco não tem número por decisão do modelo
(Anatomia, item 5), a única frase que diz o que ele vale é a cortada, e o trecho escuro depois do
verde fica sem explicação. O item 5 do `demonstrates` do `meta.json` ("Multiplicador do domínio e
origem da meta escritos por extenso, não só desenhados") não aparece no render.

**O que mudar.** Fazer a frase do domínio caber inteira: tirar o `truncate` e deixar o rodapé
quebrar em duas linhas, trocando o canvas por número se o `kpi-alto` não fechar o cartão (GEO-1),
ou escrever o domínio primeiro ("Arco vai a 24, 1,2 vez a meta, só para o excedente caber; meta de
20 fixada no orçamento comercial de 2026"). Nos dois casos, pôr o fim do arco na frase acessível.

**Recomendado na mesma rodada, não bloqueante.** `+15,0%` para `+15%` (NUM-1, variação inteira a
partir de 10%, como o catálogo escreve), na linha positiva e na frase. Domínio que cubra realizado
acima de 1,2 vez a meta (hoje um realizado de 25 passa do fim do arco). Ramo de `target` 0, que
hoje divide por zero na linha positiva e na frase.

## v3_filas-na-mesma-escala: aprovada

Nenhum bloqueante. Domínio comum calculado sobre o conjunto, zero medido com o arco de fundo
sozinho e o número 0 nos dois temas, sem coleta com contorno tracejado, ícone `Unplug` e
`formatUnavailable()`, vazio com `role="status"` e `Filter`. As notas (`truncate` em nome de fila,
percentual pela capacidade da fila contra arco pelo domínio comum, TIP-1) estão no README.

## Registro

```
Versão: 13_progresso-meta-e-gauge/05_gauge-de-arco-preenchido/v1_meta-de-agendas-em-arco
Data: 2026-10-14
Resultado: reprovada
Não: 13, 15
Correções:
  13 e 15. ROT-7 e 17.7: afastar a tinta do número central 4 px da borda interna real e pintá-lo depois do arco.
Não se aplica: 3, 6, 7, 16, 18, 27, 28, 29, 30, 31, 32

Versão: 13_progresso-meta-e-gauge/05_gauge-de-arco-preenchido/v2_fechamentos-acima-da-meta
Data: 2026-10-14
Resultado: reprovada
Não: 15
Correções:
  15. TIP-7: o rodapé com o fim do arco (24) não pode ser cortado; quebrar em duas linhas ou escrever o domínio primeiro, e levá-lo à frase acessível.
Não se aplica: 3, 6, 7, 16, 18, 27, 28, 29, 30, 32

Versão: 13_progresso-meta-e-gauge/05_gauge-de-arco-preenchido/v3_filas-na-mesma-escala
Data: 2026-10-14
Resultado: aprovada
Não: nenhum
Não se aplica: 3, 6, 13, 18, 27, 28, 29, 30, 31, 32
```
