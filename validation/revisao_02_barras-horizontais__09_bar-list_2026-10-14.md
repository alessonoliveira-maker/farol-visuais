# Parecer de revisão: 02_barras-horizontais/09_bar-list

Data: 2026-10-14. Revisor independente, uma versão em `revisao_desatualizada`: `v3_criativos-com-leads-e-cpl`. A única mudança desde o aceite de 2026-09-18 é o trilho da barra de CPL (`bg-surface-overlay` para `bg-surface-sunken`, linha 110). A versão foi julgada pelo arquivo e pelos PNGs de hoje, não pela nota antiga. Render refeito hoje nos dois temas, sem mudança no `preview.svg`. `npm run check` com tipos: 0 com erro, 3 avisos no modelo; na `v3`, só o aviso de OPACIDADE-MARCA da linha 111, que está na fila de dívida.

```
Versão: 02_barras-horizontais/09_bar-list/v3_criativos-com-leads-e-cpl
Data: 2026-10-14
Resultado: reprovada
Não: 3, 20
Correções:
  20. ACE-3, ACE-8: o percentual do líder sai em --text-muted sobre a própria barra e mede 3,53:1 no escuro e 4,13:1 no claro; mude a cor dele para uma que passe 4,5:1 em todo fundo onde ele pode cair.
  3. ESP-2 (teto), Anatomia 1 e 4: a barra do cr8 tem 40 px com o nome numa linha só e desenha mais tinta que as barras do 5º, 6º e 7º; a altura precisa sair da quebra real do nome.
Não se aplica: 13, 18, 26, 28, 29, 31, 32
```

## Bloqueante 1: pergunta 20, ACE-3 e ACE-8, texto abaixo do piso nos dois temas

* **Evidência.** Linha 105: `<span className="text-text-muted">({formatPercent(share / 100, 0)})</span>`, a 12 px e peso 500, dentro da coluna de valor. A barra do líder tem sempre 100% de largura (`leadsWidth` do maior valor), então o percentual do 1º sai sempre por cima de `bg-chart-1/18`. Medido no PNG: fundo (23, 61, 80) no escuro e (211, 229, 232) no claro, tinta do texto (127, 143, 171) e (92, 107, 135), isto é, `--text-muted` puro. **3,53:1 no escuro e 4,13:1 no claro**, contra 4,5:1 da ACE-3. A conta pelos tokens dá 3,53 e 4,12. A tabela 17.10 já diz que `--text-muted` sobre o cartão (5,21 e 5,37) "é o piso, nada mais claro para texto"; a barra tingida é fundo mais claro que o piso.
* **O mesmo defeito, no mesmo arquivo, com outro dado.** A linha 86 põe o valor inteiro do criativo pausado em `--text-muted`. Com o dado padrão a barra do pausado tem 14,6% e não chega à coluna de valor, mas um pausado com barra longa põe esse texto sobre `bg-text-muted/15`, par que a rodada de 2026-09-18 mediu em 4,23:1 e 4,42:1 e reprovou para o nome. O comentário das linhas 87 e 88 já registra o par; a correção só foi feita no nome.
* **O que mudar.** O percentual, e o valor do pausado, numa cor que passe 4,5:1 em todos os fundos onde a linha pode cair: o cartão, `bg-chart-1/18` e `bg-text-muted/15`. `--text-secondary` mede 8,16 e 8,13 no cartão, 5,52 e 6,23 sobre `bg-chart-1/18` e 6,59 e 6,67 sobre `bg-text-muted/15`. Para manter a hierarquia entre contagem e percentual, use peso (400 contra 500), não um cinza mais claro. A etiqueta "pausado" continua sendo o canal da ACE-2 e não depende disso.

## Bloqueante 2: pergunta 3, ESP-2 (teto) e Anatomia 1 e 4, espessura que afirma o que o dado não tem

* **Evidência.** Linha 90: a altura da barra principal sai da contagem de caracteres (`name.length > 40`), não da quebra. No canvas de 640 px, o nome do cr8 (66 caracteres) cabe numa linha só e a barra dele sai com **40 px** de espessura, contra 22 px nas outras nove. É o único lugar da peça em que a espessura muda, e a mudança não tem regra de dado. A barra do cr8 (33 leads) desenha cerca de 7,5 mil px² de tinta, mais que a do cr5 (58 leads, 7,2 mil), a do cr6 (47 leads, 5,8 mil) e a do cr7 (39 leads, 4,8 mil). As áreas foram medidas por varredura do PNG escuro. Numa lista de série única, em que só o comprimento carrega valor, a 8ª linha lê como destaque, e o `v2` deste mesmo modelo usa cor e peso justamente para dizer destaque. A ESP-2 põe teto de 24 px na espessura em cartão; os 40 px só têm justificativa quando o nome de fato quebra (Anatomia 1: "46 px quando o nome quebra em duas"), o que não acontece neste canvas. As `notes` do `meta.json` dizem que o cr8 "usa a barra principal em duas linhas"; o render mostra uma linha.
* **O que mudar.** A altura da linha sai do conteúdo: altura mínima de 22 px (`MAIN_BAR_HEIGHT`) e crescimento pelo texto, com a barra absoluta acompanhando por `inset-y-0`. Sai o limiar de caracteres. Assim o cr8 fica com 22 px a 640 px e ganha a segunda linha, e a barra mais alta, só no cartão estreito em que o nome quebra de fato. Depois disso, refaça a conta da altura do canvas e o texto das `notes`, que hoje somam 18 px de uma quebra que não acontece (GEO-1).

## O que foi medido e o que não foi

* **Refeito do `data.ts`, à mão:** 528 leads no total; maior resto dá 18, 16, 14, 12, 11, 9, 7, 6, 4 e 3, soma 100, igual ao PNG.
* **Contraste, por token e por pixel do PNG:** os pares acima, mais `--text-muted` sobre `--surface-overlay` na etiqueta (4,75 e 5,37, aprovado) e `--text-secondary` sobre a barra do líder (5,52 e 6,23).
* **Marcas com opacidade (pergunta 30):** a barra principal `bg-chart-1/18` mede 1,48 e 1,30 contra o cartão, a do pausado `bg-text-muted/15` mede 1,24 e 1,22, e a fina de CPL `bg-text-muted/50` mede 2,32 e 1,96 contra o trilho. Todas abaixo de 3:1, mas toda linha escreve o valor junto da marca, então vale a isenção da ACE-3 e da 17.2 (WCAG 1.4.11). Fica como observação no README, não como bloqueante.
* **Frase acessível:** 232 caracteres, começa pelo tipo e é verdadeira contra o dado.
* **Preview contra página:** 0,49% no escuro e 0,52% no claro. A diferença está no texto deslocado em subpixel (nome do pausado, segunda metade da nota, ligadura "fi"), e o próprio render atribui a causa às faces de fonte do app (aviso FIDELIDADE). Não é defeito da versão.
* **Não medido pela ferramenta:** ESPESSURA-MARCA (`marca_html`), COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA (`texto_em_html`), EIXO-CALMO (`sem_grade`). A OPACIDADE-MARCA viu só a linha 111: a barra principal, cuja classe vem da variável `mainBarClass`, passou fora dela. Contraste e colisão foram conferidos à mão.
* **Não renderizado:** o estado vazio e o pausado com barra longa; o que se diz deles é leitura do código.
