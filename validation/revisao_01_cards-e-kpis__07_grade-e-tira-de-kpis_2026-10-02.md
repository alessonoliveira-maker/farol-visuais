# Parecer de revisão: 01_cards-e-kpis/07_grade-e-tira-de-kpis

> Data: 2026-10-02. Revisor independente. Versão julgada: `v2_tira-da-pre-vendas-com-primario-e-janela`
> (motivo: o render de 2026-10-01 passou a desenhar o `<button>` com a linha de base herdada).
> As outras três versões não entraram, por decisão do dono. `npm run check`: 0 com erro, 3 avisos.

## Resumo

| Versão | Resultado | Bloqueantes |
|---|---|---|
| `v2_tira-da-pre-vendas-com-primario-e-janela` | reprovada | 1 (pergunta 8, EIX-10) |

**O bloqueante não tem relação com a mudança do botão.** O seletor, que era o motivo da revisão,
está limpo nos dois temas (medição na seção "O que foi conferido e passou"). O defeito mora na
janela de 90 dias, um estado que nenhuma revisão anterior tinha visto, porque o material de
conferência só fotografa a janela de 30 dias. Nesta passada as três janelas foram abertas na página
viva, com o mesmo empacotamento do render, e fotografadas nos dois temas.

## v2_tira-da-pre-vendas-com-primario-e-janela

### Bloqueante 1. Pergunta 8, EIX-10: a última caixa semanal tem 6 dias e é desenhada como semana cheia

**Onde:** `Chart.tsx`, função `sparkSeries`, linhas 35 a 41, e a nota das linhas 158 a 162.

**O que o código faz.** Na janela de 90 dias a série diária é somada em caixas de 7 a partir do
índice 0: `for (let i = 0; i < slice.length; i += 7)`. Como 90 não é múltiplo de 7, saem 12 caixas
de 7 dias e uma décima terceira, **a mais recente**, com 6 dias (índices 84 a 89). A linha liga as
13 somas como se fossem a mesma grandeza.

**Evidência medida, com o dado publicado (Agendas realizadas).**

- Somas desenhadas: 114, 124, 98, 80, 107, 136, 125, 95, 101, 136, 146, 119, **87**.
- Dias por caixa: 7 nas doze primeiras, **6** na última.
- A última caixa soma 87 em 6 dias, média de 14,5 por dia. Os 7 dias que terminam na data de
  referência somam **102**. O ponto final sai 15 agendas abaixo, 14,7% a menos, só pelo dia que falta.
- Na escala da sparkline, que vai do menor ao maior valor (80 a 146), o ponto final é desenhado a
  0,11 da altura e deveria estar a 0,33. No `d` lido da página viva: `L183.33 16.73 L200.00 34.18`,
  quando o valor comparável daria `y` de 26,0. São 8,2 das 40 unidades do `viewBox`, um quinto da
  altura do desenho.
- A queda do último trecho sai de 119 para 87 (32 agendas) e a queda real é de 119 para 102 (17).
  O desenho quase dobra a queda final.

**Por que bloqueia.** É a regra do período parcial (EIX-10, pergunta 8 do checklist: "período
parcial é marcado"), e ela decide o que o desenho afirma (contrato, 14.1). O defeito não depende do
dado: toda janela de 90 dias termina com um ponto 1/7 mais baixo do que deveria. Com uma métrica
real e estável, a sparkline de menor a maior gasta a altura inteira nessa queda que não existe, e o
fim da linha é justamente o que se lê numa sparkline. A própria peça trata 0,05% como "estável"
(`FLAT_THRESHOLD`); um artefato de 14% no último ponto não é nuance. E o estado não é caminho
latente: chega-se a ele com um clique, no dado publicado, pelo controle que dá nome à versão, e é
um dos cinco itens do `demonstrates` ("Granularidade escrita quando a janela de 90 dias passa a
semanal").

**A nota não resolve.** "agregado por semana, cerca de 13 semanas" admite que a conta não fecha,
mas não diz qual ponto é o incompleto nem que ele é o último.

**O que mudar.** Todo ponto da linha semanal precisa cobrir o mesmo número de dias. A saída mais
simples, e a recomendada:

1. Em `sparkSeries`, alinhar as caixas **pelo fim** e desenhar só semanas cheias: 12 caixas de 7
   dias terminando na data de referência. Os 6 dias mais antigos ficam fora da linha; o número do
   cartão e o delta continuam sobre os 90 dias, sem mudança.
2. Com o dado publicado, a linha passa a ser 125, 103, 80, 101, 134, 129, 98, 98, 131, 147, 124,
   102. Serve de conferência para o corretor.
3. Reescrever a nota para o que a linha passa a mostrar, ainda calculada de `primarySpark.length`:
   "agregado por semana, 12 semanas completas", sem "cerca de". Ajustar junto o comentário da
   função, que hoje diz "cerca de 13 semanas".

Alternativa aceitável: manter 13 pontos e desenhar a **média diária** de cada caixa (soma dividida
pelos dias da caixa), com a nota dizendo "média diária por semana". Marcar o último trecho como
parcial, à moda da EIX-10 (tracejado e "parcial até"), também fecha a regra, mas ensina a ler um
parcial que só existe por causa do corte das caixas.

**O que não pode mudar com o conserto.** As janelas de 7 e de 30 dias seguem diárias, então os dois
previews, que fotografam a janela de 30 dias, têm de sair idênticos ao que está no disco. A frase
acessível não cita a sparkline e não muda.

### O que foi conferido e passou

**Botões, o motivo desta revisão (medido no `preview.svg` e no `preview-claro.svg`, e de novo na
página viva, com os mesmos números).**

- Texto: Manrope 11 px, peso 500, entrelinha 16,5 px, nos três botões e nos dois temas. Não há mais
  Arial nem 13,33 px.
- Caixa: 20,5 px de altura (70 a 90,5), preenchimento 2 px por 8 px, sem borda. Tinta do texto de
  72 a 87, inteira dentro da caixa; `scrollWidth` igual a `clientWidth` nos três.
- Alinhamento: a tinta do período à esquerda também vai de 72 a 87, mesma linha de base. O grupo
  termina em 940 px, a mesma borda direita do último cartão. 4 px entre botões, 6 px entre a pílula
  e o topo dos cartões.
- Contraste: texto do botão marcado 13,23:1 (escuro) e 17,96:1 (claro) sobre a pílula; texto dos
  não marcados 5,72:1 e 5,05:1 sobre o palco.
- Arquivo contra página: 9 e 66 pixels acima da tolerância de 48, isto é, 0,0009% (escuro) e
  0,0066% (claro), todos entre x 386 e 398, y 339 e 351 do PNG, na linha do delta do cartão
  primário e longe dos botões.

**Resto da peça.** Números reconferidos à mão nas três janelas: 535, 2.202 e 313 com `+9,2%`,
`+6,7%` e `+5,4%` (30 dias); 102, 452 e 60 com `−18%`, `−5,8%` e "estável" (7 dias); 1.468, 6.189 e
888 com `+13%`, `+8,4%` e `+6,9%` (90 dias). Sinal tipográfico, uma casa abaixo de 10% e inteiro
acima (NUM-1, NUM-3). Cor semântica segue `goodDirection`, com sinal e ícone (COR-6, ACE-2).
Sparkline sem área (EIX-2), com 30, 7 e 13 pontos (EIX-11), `--chart-1` a 9,50:1 e 6,00:1.
Todo texto entre 5,05:1 e 17,96:1; nada abaixo de 11 px; nenhum peso 700. Frase acessível de 222,
212 e 223 caracteres, começando por "Tira". Nenhum corte, sobreposição ou transbordo nos seis
estados fotografados.

### Registro do parecer

```
Versão: 01_cards-e-kpis/07_grade-e-tira-de-kpis/v2_tira-da-pre-vendas-com-primario-e-janela
Data: 2026-10-02
Resultado: reprovada
Não: 8
Correções:
  8. EIX-10: na janela de 90 dias, alinhar as caixas semanais pelo fim e desenhar só semanas
     cheias (12 de 7 dias), e reescrever a nota sem "cerca de 13 semanas".
Não se aplica: 6, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

Os não bloqueantes desta passada (dez itens) estão no README do modelo, no parágrafo de 2026-10-02
da seção de observações.
