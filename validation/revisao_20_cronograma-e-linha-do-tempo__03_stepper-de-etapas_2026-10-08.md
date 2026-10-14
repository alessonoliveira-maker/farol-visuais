# Parecer de revisão: 20_cronograma-e-linha-do-tempo/03_stepper-de-etapas

Data: 2026-10-08. Revisor independente, primeira passada das quatro versões (`sem_revisao`). `npm run check`: 0 erros, 0 avisos. As guardas de texto não leem esta abordagem (`texto_em_html` nas quatro), então contraste, colisão, corte e alinhamento foram conferidos à mão.

Como foi medido: nos PNGs de `_render/.qa/20_cronograma-e-linha-do-tempo/03_stepper-de-etapas/`, que têm 2 px de imagem por px de CSS, lidos pixel a pixel; no `.pagina.png` de cada versão, que é a página viva, comparado com o PNG do arquivo; e nos tokens de `app/src/styles/tokens.css`, com a fórmula de contraste da WCAG.

| Versão | Resultado | Não |
|---|---|---|
| `v1_etapas-do-handoff` | aprovada | nenhum |
| `v2_tempo-entre-passos-com-sla` | aprovada | nenhum |
| `v3_stepper-compacto-em-tabela` | reprovada | 8 e 29 |
| `v4_etapa-pulada-retorno-e-bloqueio` | aprovada | nenhum |

As observações não bloqueantes das quatro estão no README do modelo, seção `Observações da revisão (não bloqueantes)`. Este arquivo trata do que reprova e do que foi pesado e não reprovou.

Não se aplica, nas quatro: perguntas 3, 4, 6, 7, 13, 18, 26, 27, 28, 30 e 31. A 29 só se aplica à `v3`, que empilha 14 linhas sobre a mesma escala de etapas. A 32 se aplica a `v1`, `v2` e `v4`, e passa: nenhum conector usa `--line-strong`; o pendente e o tracejado estão em `--text-muted`, que mede 5,72:1 no escuro e 5,05:1 no claro contra o palco.

## v3_stepper-compacto-em-tabela

Resultado: reprovada. Dois bloqueantes, iguais nos dois temas. O resto confere com o dado: 14 linhas, ordenação por etapa e depois por dias parados (empate desfeito pelo código), "0 dias" escrito como zero medido, "1 dia" no singular, `formatUnavailable()` com `Unplug` nas duas células de texto da linha sem etapa, legenda única no cabeçalho com amostra na forma da marca, estado vazio da EST-1 e frase acessível de 197 caracteres.

### Bloqueante 1. Pergunta 8. EST-2 e EIX-10, armadilha DAD-2

**O que o desenho faz.** A oportunidade cuja etapa o CRM não registrou é desenhada com cinco marcadores de etapa futura. A legenda do cabeçalho ensina que o círculo vazado quer dizer "futura", então a linha afirma, pelas marcas, que nenhuma etapa foi feita. O dado não diz isso: diz que a etapa é desconhecida.

**Evidência.**

* `data.ts`, linhas 2 e 3: `stageIndex` é `null` "quando o CRM não registrou etapa". É ausência, não começo de percurso. Linha 30: `OP-0431` com `stageIndex: null`.
* `Chart.tsx`, linha 36: `if (stageIndex === null || index > stageIndex) return 'pending';`. O nulo entra no mesmo ramo da etapa futura. Linhas 143 a 145: os cinco `Dot` são desenhados para toda linha, sem exceção para o nulo. Linha 22: `pending: 'futura'` é a palavra da legenda.
* PNG, nos dois temas: a linha `OP-0431` (y de 982 a 997 na imagem) traz cinco círculos vazados de 16 px de imagem, com a mesma forma e a mesma cor da amostra "futura" do cabeçalho. Ao lado, "indisponível" duas vezes. Marca e texto se contradizem na mesma linha.
* `meta.json`, quinto item de `demonstrates`: "Oportunidade sem etapa registrada escrita como indisponível, nunca como etapa zero". O texto cumpre; as marcas desenham exatamente a etapa zero.
* A linha de leitura diz "da etapa mais adiantada à mais inicial" e a linha sem etapa é a última, então a ordem também a apresenta como a mais inicial.

**Por que bloqueia.** A EST-2 fecha com "Nunca zero, nunca barra zerada", e o stepper com todas as etapas em "futura" é a barra zerada deste modelo. A seção 14.1 põe "ausência exibida como zero" entre as regras que bloqueiam sempre. A forma que a seção 17.2 reserva à ausência (contorno `--text-muted` sem preenchimento) já está ocupada aqui pelo estado "futura", e é por isso que as duas se confundem.

**O que mudar.**

1. `stateAt` não devolve `'pending'` para `stageIndex === null`. A linha sem etapa não desenha marcador de estado: a célula dos marcadores fica sem marca (o `formatUnavailable()` da coluna "Etapa atual" já diz o que falta) ou recebe uma forma própria, diferente da "futura", com entrada na legenda do cabeçalho. O `aria-label="sem etapa registrada"` da célula continua.
2. A linha de leitura passa a dizer onde fica a oportunidade sem etapa (hoje ela cai no fim sem aviso), calculado do dado: só aparece quando existe linha sem etapa.
3. Conferir depois: nenhum círculo com a forma da amostra "futura" na linha de `OP-0431`.

### Bloqueante 2. Pergunta 29. EIX-12, alinhamento entre painéis (seção 14.1)

**O que o desenho faz.** As 14 linhas compartilham a mesma escala de cinco etapas e existem para serem lidas em coluna, de cima para baixo. O marcador da mesma etapa cai em até três colunas de pixel, conforme o estado dele e a posição do anel na linha.

**Evidência.** Centro de cada marcador, em px de imagem (divida por 2 para px de CSS), igual nos dois temas:

| Etapa | feita | atual | futura | linha sem etapa |
|---|---|---|---|---|
| 1 | 487,5 | 493,5 | não ocorre | 487,5 |
| 2 | 515,5 | 521,5 | 527,5 | 515,5 |
| 3 | 543,5 | 549,5 | 555,5 | 543,5 |
| 4 | 571,5 | 577,5 | 583,5 | 571,5 |
| 5 | não ocorre | 605,5 | 611,5 | 599,5 |

* O passo entre etapas é de 14 px de CSS. O marcador "futura" da etapa n fica a 6 px do "feita" da mesma etapa e a 8 px do "feita" da etapa n + 1: quase no meio do caminho entre duas colunas.
* Exemplo no PNG: a etapa 4 está em 571,5 nas linhas de Fechamento, em 577,5 nas de Negociação e em 583,5 nas de Proposta, Diagnóstico e Qualificação. Na última linha os cinco círculos caem entre as colunas das 13 de cima (599,5 contra 611,5 na etapa 5).
* `Chart.tsx`, linhas 41 a 51: `Dot` mede 8 px em "feita" e "futura" e 14 px em "atual". Linha 140: a fila é `flex items-center gap-1.5`, sem célula de largura fixa por etapa, então tudo o que vem depois do anel anda 6 px.

**Por que bloqueia.** A seção 14.1 lista "alinhamento entre painéis" entre as regras que decidem o que o desenho afirma, e a EIX-12 dá a régua: o mesmo ponto da categoria cai na mesma coluna de pixels. Aqui a posição horizontal é o que diz qual etapa é qual, e um círculo vazado solto não se rastreia até a coluna dele. Não é constante de acabamento sem consequência: o desvio é medido, aparece no preview e chega a 43% do passo.

**O que mudar.**

1. Cada marcador ganha uma célula de largura fixa igual à do anel (14 px), com a marca centrada nela, nos três estados. O centro da etapa n passa a ser o mesmo nas 14 linhas.
2. A fila fica com 5 células de 14 px e 4 vãos de 6 px, 94 px, que cabem nos 156 px da coluna. A amostra da legenda não muda.
3. Conferir depois, no PNG: uma coluna de pixel por etapa, com desvio zero entre linhas.

## O que foi pesado e não reprovou

* **`v4`, ponta da seta de retorno.** No PNG de conferência e no `preview.svg` o triângulo ocupa x de 80 a 95 (imagem) e a perna x de 76 a 79: a ponta sai 4,75 px de CSS à direita do eixo da perna. No `.pagina.png` o triângulo ocupa x de 70 a 86, centrado na perna, e encosta no anel de destino. O `Chart.tsx` está certo; quem erra é o serializador, que remonta o `<svg>` aninhado sem `position`, `left` e `bottom` (o `style` do nó no `preview.svg` só traz fonte e `overflow`). Mesma classe da armadilha GEO-17. Divergência de 0,022%, abaixo do limiar de 0,5%. Ficou como observação no README, com a saída, e como defeito de ferramenta no relatório.
* **`v4`, empilhamento vertical.** O preview só mostra a disposição horizontal. As variantes `@min-[480px]:` estão ativas (a 600 px a peça sai horizontal) e as classes de base montam a coluna com conector vertical. Conferido pelo código, declarado no README.
* **`v2`, número fora de algarismo tabular** em três frases corridas (TIP-1). Sem coluna a alinhar, sem consequência no preview.
* **`v2`, conector de alerta contra conector normal:** 1,14:1 e 1,05:1 entre si (TOK-9). O segundo canal existe: ícone `AlertTriangle` e "acima de 2 dias" escritos sobre o conector, mais os dias em aberto com ícone no passo atual (ACE-2).
* **As quatro, moldura `stage`** com README que manda envolver num `VisualCard`. Todos os pares de texto e de marca passam contra o palco e contra o cartão; o pior é `--text-muted` no claro, 5,05:1 e 5,37:1.

## Registro

```
Versão: 20_cronograma-e-linha-do-tempo/03_stepper-de-etapas/v3_stepper-compacto-em-tabela
Data: 2026-10-08
Resultado: reprovada
Não: 8, 29
Correções:
  8. EST-2 (DAD-2): a linha com etapa nula não desenha marcador de etapa futura; fica sem marca ou com forma própria nomeada na legenda.
  29. EIX-12: cada marcador numa célula fixa de 14 px com a marca centrada, para a mesma etapa cair na mesma coluna de pixels nas 14 linhas.
Não se aplica: 3, 4, 6, 7, 13, 18, 26, 27, 28, 30, 31, 32
```

`v1_etapas-do-handoff`, `v2_tempo-entre-passos-com-sla` e `v4_etapa-pulada-retorno-e-bloqueio`: aprovadas em 2026-10-08, nenhum "não".
