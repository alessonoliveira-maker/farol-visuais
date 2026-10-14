# Parecer de revisão: 25_matriz-e-quadrantes/04_matriz-de-cobertura-binaria

Data: 2026-10-06. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 11:20, posterior ao `Chart.tsx` das quatro). `npm run check` com tipos: 0 com erro, 0 aviso.

Resultado: `v1`, `v2` e `v3` aprovadas; `v4` reprovada por um bloqueante. As 24 observações não bloqueantes estão no README do modelo.

## Peso do bloqueante

* **`v4`, o rodapé dá ao número o nome do denominador.** Pergunta 14; NUM-5, NUM-6 e seção 14.1 (unidade). Não é redação: a linha se chama "Fontes que coletam" e o número embaixo dela é outra medida, a de fontes com o campo preenchido entre as que coletam. Lido como está escrito, o cartão afirma que 2 de 4 fontes coletam cargo, e as 4 coletam. É a mesma distinção que a versão existe para ensinar, coleta contra preenchimento, invertida no rótulo.

## O que foi medido e o que não foi

* **Medido:** os dois PNGs de cada versão, com recorte ampliado do cabeçalho, da hachura, do traço de ligação e da linha de três textos; as contagens, somas, percentuais e médias ponderadas das quatro, refeitas do `data.ts`; a caixa de tinta do cabeçalho `Consentimento` contra a régua da grade na `v4`; os pares de contraste de texto e de marca, compostos de `app/src/styles/tokens.css`.
* **Não medido pela ferramenta:** CONTRASTE-TEXTO, COLISAO-TEXTO e TEXTO-NA-MARCA nas quatro (`texto_em_html`) e ESPESSURA-MARCA nas quatro (`sem_marca_de_barra` e `marca_html`). As quatro foram cobertas à mão, como descrito acima.
* **Não renderizado:** o estado vazio das quatro. O render só desenha o dado padrão, então o que se diz dele é leitura do código.
* **Não testado:** as saídas sugeridas. As larguras citadas nelas são conta sobre o PNG, não render.

## `v4_campo-fora-da-coleta`: reprovada, um bloqueante

### Bloqueante 1. Pergunta 14; NUM-5, NUM-6 e seção 14.1 (unidade)

**Evidência.** `Chart.tsx:123` a `125` escreve o cabeçalho da linha do rodapé como "Fontes que coletam". `Chart.tsx:130` e `131` escrevem, em cada coluna, `filled / collecting` e "`filled` de `collecting`", onde `filled` conta as fontes com estado `presente` e `collecting` as que não estão `fora` (`fieldRate`, linhas 61 a 65). O nome da linha é o do denominador; a medida, preenchido, não está escrita em lugar nenhum do rodapé, da nota lateral nem da frase acessível.

| Campo | Rodapé impresso | Fontes que coletam, pelo dado | Preenchido entre elas, pelo dado |
|---|---|---|---|
| Telefone | 67%, 2 de 3 | 3 de 4 | 2 de 3 |
| Cargo | 50%, 2 de 4 | 4 de 4 | 2 de 4 |
| Empresa | 75%, 3 de 4 | 4 de 4 | 3 de 4 |
| UTM | 75%, 3 de 4 | 4 de 4 | 3 de 4 |
| Cidade | 100%, 4 de 4 | 4 de 4 | 4 de 4 |
| Consentimento | 75%, 3 de 4 | 4 de 4 | 3 de 4 |

Em cinco das seis colunas, "Fontes que coletam" seguido de "2 de 4" ou "3 de 4" lê como contagem de fontes que coletam, e contradiz a legenda do próprio cartão, onde o anel é "Coletado, vazio na base". O leitor de tela ouve o mesmo: cabeçalho de linha "Fontes que coletam", célula "50% 2 de 4". A `v1` do mesmo modelo usa a construção idêntica com o sentido direto ("Origens que entregam", "50% (4 de 8)"), o que reforça a leitura errada na `v4`.

**Por que bloqueia.** A 14.1 põe a unidade entre as regras que decidem o que o desenho afirma. Aqui o rótulo troca defeito de base (campo coletado e vazio) por defeito de coleta (fonte que não coleta), que é o erro que o estudo do modelo chama de ponto delicado. Contagem sem substantivo já passou como observação neste acervo (`25/01`, `v3`); o caso aqui é outro, porque o substantivo existe e é o errado.

**O que mudar.**

1. Renomear o cabeçalho da linha para a medida, por exemplo "Preenchido entre as que coletam". Mede cerca de 165 px em 11 px e quebra em duas linhas na coluna de 150 px, o que cabe porque a linha do rodapé não tem altura fixa.
2. Dar substantivo à contagem ("2 de 3 fontes"), ou deixá-lo no cabeçalho se a célula de 76 px não comportar.
3. Alinhar a nota lateral: hoje diz "O percentual do rodapé só conta as 3 fontes que coletam", que também nomeia só o denominador e vale só para telefone. Dizer o que se conta e de qual campo, por exemplo "Em telefone, o rodapé mede o preenchimento só entre as 3 fontes que coletam."
4. Conferir que a frase acessível continua entre 100 e 250 caracteres depois da troca (hoje 227).

### Para aproveitar a mesma rodada (não bloqueia)

* **Cabeçalho mais largo que a célula (GEO-7).** `Consentimento` mede 80 px e a célula 76 (`CELL_WIDTH`). Nos dois PNGs a tinta vai de x 1126 a 1286 e a régua da grade termina em 1277: o nome passa 4,5 px da grade e fica 2,25 px fora do centro dos pontos. Não colide com nada (20 px até a legenda) e não é cortado. `CELL_WIDTH` de 82 fecha; a coluna lateral cai de 264 para 228 px e a nota ganha uma linha.
* **Nota lateral só cita a primeira célula fora da coleta** (`firstOutside`). Com duas fontes fora, a segunda fica só na hachura.
* **Catálogo.** O item "Coluna inteira hachurada" não cabe na geometria do caso de uso (fontes nas linhas, uma delas sem telefone): hachurar a coluna diria que nenhuma fonte coleta telefone. O `meta.json` reescreveu o item e o `notes` declara. A versão está certa; quem corrige o texto é o dono do catálogo.

## Registro

```
Versão: 25_matriz-e-quadrantes/04_matriz-de-cobertura-binaria/v4_campo-fora-da-coleta
Data: 2026-10-06
Resultado: reprovada
Não: 14
Correções:
  14. NUM-5 e NUM-6, seção 14.1 (unidade): renomear a linha do rodapé para a medida (preenchido entre as que coletam) e alinhar a nota lateral.
Não se aplica: 3, 4, 6, 13, 18, 27, 28, 29, 30, 31, 32
```
