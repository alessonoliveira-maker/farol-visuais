# Parecer de revisão: 12_hierarquia/08_circle-packing

Data: 2026-10-14. Revisor independente, primeira passada sobre `v2`, `v3` e `v4`, as três em `sem_revisao`, julgadas pelo arquivo e pelos PNGs de hoje (render de 2026-10-02 10:58, posterior ao último `Chart.tsx`, de 2026-09-29). `npm run check` com tipos: 0 com erro, 0 avisos, 0 escapes. A `v1` está aprovada desde 2026-09-20 e não foi julgada de novo.

Resultado: `v3` e `v4` aprovadas, `v2` reprovada por um bloqueante só, de identificação das marcas. As observações não bloqueantes das três estão no README do modelo, seção `Observações da revisão (não bloqueantes)`.

| Versão | Resultado | Não |
|---|---|---|
| `v2_cpl-qualificado-abaixo-da-mediana` | reprovada | 12, 19 |
| `v3_entradas-por-origem-subcanal-e-desfecho` | aprovada | nenhum |
| `v4_um-nivel-so-e-zeros` | aprovada | nenhum |

Não se aplica: na `v2` e na `v3`, perguntas 4, 6, 7, 8, 13, 18, 26, 27, 28, 29, 30 e 31. Na `v4`, 6, 7, 8, 13, 18, 26, 27, 28, 29, 30, 31 e 32 (o ramo desenhado não tem traço de relação).

## O que foi medido e o que não foi

* **Refeito do `data.ts`, à mão.** `v2`: CPL ordenado 198, 212, 265, 348, 430, 520, 690, 760, 845 e 980, mediana R$ 475; 5 abaixo, 493 de 597 leads, 82,6%; totais por canal 262, 245 e 90. `v3`: desfechos 46, 68 e 202 (316); descartada à frente em 4 de 5 subcanais (Indicação é a exceção, 12 convertidas); 202 de 316, 63,9%. `v4`: 151 leads nas 5 folhas positivas, 58 de 151, 38,4%.
* **Geometria lida do `preview.svg` da `v2`** (escala 1, px de tela): raios de folha 45,75 (Marca), 37,62 (Genéricas), 18,81 (cinza de Busca paga), 41,71 (Semelhantes), 33,03 (Retorno), 24,59 e 13,30 (cinzas de Rede social), 30,48 (verde de Display), 16,29 e 11,52 (cinzas de Display).
* **Escala da `v3`** pela folha de 96 (36,34 px de diâmetro, do `meta.json`, conferido no PNG): 1,854 px por raiz de entrada. Daí os 12,9 px entre os rótulos 96 e 40 da régua, que a `thinRuler` recusa.
* **Contraste entre preenchimentos, de `app/src/styles/tokens.css`:** `--positive` contra `--text-muted` mede 1,41:1 no escuro e 1,01:1 no claro.
* **Pares de texto e marca:** todos na tabela 17.10 ou na ROT-7b (vazado em `--surface-raised` sobre semântica), e a `CONTRASTE-TEXTO` e a `TEXTO-NA-MARCA` mediram as três sem erro.
* **Guardas não medidas, conferidas à mão:** `ESPESSURA-MARCA` (sem barra do Recharts; na `v4` a barra mede 12 px e o rótulo fica fora), `FORMATO-ACESSIVEL` (frase e corpo usam os mesmos helpers), `EIXO-CALMO` e `OPACIDADE-MARCA` (sem grade, sem opacidade), e na `v4` a `RAIO-CONTRA-AREA` (sem área no ramo desenhado).
* **Não renderizado:** o estado vazio das três e o ramo de empacotamento da `v4`. O que se diz deles é leitura do código.

## `v2_cpl-qualificado-abaixo-da-mediana`: o bloqueante

### Pergunta 12, com a 19 como consequência. Identificação das marcas (14.1), ROT-10 por extensão, ACE-2.

**Evidência.**

* Só 3 das 10 campanhas têm rótulo no círculo (Marca, Genéricas, Retorno). As outras 7 estão só na lista "Sem rótulo no desenho", com nome, leads e CPL, mas sem o canal e sem amostra de cor. Nada no cartão liga uma linha da lista a um círculo.
* Os 5 cinzas não se distinguem a olho. Candidatos: Interesses 41, Rivais 24, Nativo 18, Formulário 12, Patrocinado 9. O cinza de Busca paga (raio 18,81 px) e o maior de Display (16,29 px) diferem 2,5 px de raio, em anéis diferentes. A única saída é conta contra o total da legenda (262 − 142 − 96 = 24, logo Rivais): é quebra-cabeça, não identificação.
* O maior círculo sem nome é Semelhantes (41,71 px), maior que Genéricas (37,62) e Retorno (33,03), que têm rótulo. É a 2ª campanha do recorte e uma das 5 abaixo da mediana, ou seja, parte da resposta do caso de uso. O rótulo não coube pelo comprimento do nome (meia diagonal mais folga de 44,4 px contra raio de 41,7), e isso é a regra funcionando; o defeito é a lista não devolver o canal.
* Para 7 de 10 campanhas o cartão perde justamente o que o modelo existe para mostrar, a qual grupo cada item pertence (README, Quando usar, primeiro item).
* **Consequência na ACE-2 (pergunta 19).** Nos 7 círculos sem rótulo, o veredito só existe pela cor. No claro, `--positive` (#0f7a55) e `--text-muted` (#5c6b87) medem 1,01:1 entre si: sem matiz, os dois são o mesmo cinza. Ligada a lista ao círculo, o CPL escrito na linha vira o segundo canal e a 19 se resolve junto.

**O que mudar.**

* Agrupar a lista por canal, como a `v1` faz por campanha e a `v3` faz com `pai › filho`: a linha de legenda de cada canal (anel, nome, total) seguida, recuada, das campanhas dele sem rótulo no desenho, cada uma com amostra preenchida na cor do veredito, leads e CPL. Cabe na coluna lateral: 3 linhas de canal com passo de 26 px e 7 de campanha com passo de 15 px somam perto de 183 px, contra 309,5 px de altura de desenho.
* Atualizar o item da `v2` em Versões no README e a nota do `meta.json` para descrever a lista agrupada.
* Na mesma passada, se couber: as três observações da `v2` no README (deslocamento 236 da legenda, lista sem teto, `useCase` cortado).

**O que não mexer**, porque foi conferido e está certo: raio pela raiz quadrada sem piso (área por folha bate com o valor), mediana com retorno `number | null`, cor do veredito por chave e não por posição, anéis nos slots 1, 3 e 6 sem `--chart-2` nem `--chart-4` ao lado do `--positive`, `--text-muted` como neutro de dado sem valor escrito (papel da 17.2, 5,21 e 5,37 contra o cartão), rótulo vazado em `--surface-raised` sem halo (ROT-7b), anel em `vectorEffect="non-scaling-stroke"`, frase acessível começando pelo tipo e verdadeira contra o dado, estado vazio com `role="status"`.

## `v3` e `v4`: por que passaram

* **`v3`.** Área exata por folha, desfecho por chave em cor semântica de estado (com a palavra na legenda), origem por slot 1 e 3, rótulo de origem no arco superior por fora e de subcanal por dentro ou por fora do arco, nunca cruzando anel nem disco. Todo subcanal se identifica sem interação: 2 pelo nome no arco, 2 pelo número da folha cruzado com a tabela, 1 por eliminação dentro da origem, e a tabela dá cada folha. A régua termina no máximo observado (ROT-5b). O que sobra (régua com dois círculos onde o `meta.json` promete três, subcanais sem nome no desenho, número de folha sem unidade, rótulo da régua sem chamada) está no README.
* **`v4`.** A guarda troca a forma para barras do zero, com nome ao lado e valor na ponta livre, sem eixo nem grade (ROT-2), e o aviso escrito em `--warning`, par aprovado nos dois temas. Os três zeros aparecem com o nome e "0 leads", como manda o catálogo. O que sobra (vão de 60% entre faixas, motivo "zero não tem área" escrito sob barras, marcador de ausência no zero, "2026-08" à mão e o ramo de empacotamento latente sem nomes e com altura presa à contagem de folhas) está no README, o último com peso.

## Registro

```
Versão: 12_hierarquia/08_circle-packing/v2_cpl-qualificado-abaixo-da-mediana
Data: 2026-10-14
Resultado: reprovada
Não: 12, 19
Correções:
  12. Identificação das marcas (14.1), ROT-10: agrupar a lista lateral por canal, com amostra do veredito por campanha.
  19. ACE-2: resolvida pela mesma mudança, porque o CPL da linha passa a ser o segundo canal do veredito.
Não se aplica: 4, 6, 7, 8, 13, 18, 26, 27, 28, 29, 30, 31
```
