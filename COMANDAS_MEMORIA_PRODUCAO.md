# PR #35 — memória de produção por natureza

Prévia exclusiva: `/_previas/comandas-producao/`. Sem merge, produção, vendas, carrinho ou envio pelo WhatsApp. A nova análise usa uma cópia dos custos unitários existentes; não grava nem substitui sua configuração. O painel não é autenticado e os valores editados ficam apenas nesta aba.

## Natureza dos custos

| Grupo | Composição | Base de cálculo |
|---|---|---|
| Por folha | Papel, impressão, manutenção e tempo ativo do operador | Folhas úteis + perdas |
| Por bloco | Cola, corte, montagem por tempo e acabamento | Quantidade de blocos |
| Por pedido | Preparação e organização, materiais/serviços e seus tempos | Uma vez por pedido |

As folhas extras de preparação e seus respectivos custos são discriminados no grupo do pedido. Elas **não são contadas outra vez** no grupo por folha. Perdas são folhas adicionais, com seus próprios custos de papel, impressão, manutenção e operador; não um segundo percentual aplicado sobre a despesa já contabilizada.

- Montagem = blocos × minutos por bloco × custo/hora ÷ 60.
- Operação = folhas × minutos ativos por folha × custo/hora ÷ 60.
- Preparação e organização = custo direto por pedido + minutos por pedido × custo/hora ÷ 60.
- Corte, cola e acabamento = quantidade de blocos × custo por bloco. Esses custos devem excluir o trabalho já informado na montagem, para não duplicar mão de obra.
- Se impressão/clique já incluir manutenção, deve ser confirmado e informado zero no campo separado, em vez de repetir a cobrança.
- Custo ausente permanece `null`; zero somente quando informado explicitamente. O painel discrimina fontes de compra, estimativas herdadas e campos pendentes.

As parcelas fixas antigas de corte/cola/acabamento não são transferidas para o custo do pedido. Os campos/valores originais foram preservados. Se uma configuração contiver parcela legada positiva, a nova análise fica pendente de reclassificação; não ignora o valor nem o converte automaticamente em custo por bloco.

## Aproveitamento e fórmulas financeiras

O encaixe guilhotinado existente considera medidas, margem não imprimível, espaçamento e duas orientações, em A4 ou A3 conforme o perfil. Não é apenas proporção de área. HP A3 continua sem compatibilidade presumida.

```
folhas finais = blocos × 50 (1 via)
folhas úteis = teto(folhas finais / peças por folha)
folhas perdidas = teto(folhas úteis / (1 − taxa de perdas)) − folhas úteis
folhas produzidas = úteis + perdidas + preparação
C = soma dos três grupos
preço mínimo sem lucro = teto_centavo(C / 0,94)
venda com 45% de margem = teto_centavo(C / 0,49)
venda com 50% de margem = teto_centavo(C / 0,44)
margem efetiva da referência = (referência × 0,94 − C) / referência
```

Imposto de 6% sobre a venda. Margens sobre o faturamento, depois de custos e imposto, sem ajuste de calibração. Cada linha de despesa é arredondada para cima ao centavo depois da multiplicação; o custo total soma essas linhas, para a memória fechar. Os custos unitários (por exemplo, R$0,052/A4) não são previamente arredondados ao centavo. Arredondar as linhas pode produzir alguns centavos a mais do que arredondar apenas o total.

Preço mínimo, vendas e margem efetiva permanecem **pendentes** se houver custo ou condição necessária ausente. O subtotal conhecido não é custo final nem preço mínimo. Margem negativa da referência é exibida, sem ser limitada a zero.

A tabela de referência só é comparada para 10 × 7 cm (ou girado), 75 g, 50 folhas, na cor escolhida. Não é interpolada nem usada para completar custos. Para 1.000 blocos não há preço de referência cadastrado, portanto sua margem efetiva fica sem referência, mesmo quando os custos forem completos. Os valores da tabela continuam provisórios na PR; no site oficial, Comandas permanece sob orçamento.

## Memória com os dados já cadastrados

Exemplo selecionado: 10 × 7 cm, 75 g, preta, Xerox A4. Compra informada: papel R$0,052/A4. Impressão Xerox preta **estimada herdada** R$0,06/A4. Premissas herdadas **estimadas**: margem não imprimível 0,3 cm por lado, espaçamento 0,1 cm, perdas 5% e 2 folhas de preparação. Encaixe: 8 peças/A4.

| Blocos | Folhas finais | Úteis | Perdas | Preparação | Produzidas | Papel/impressão já calculáveis* | Ref. preta | Ref. colorida |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 50 | 7 | 1 | 2 | 10 | R$1,14 | R$20 | R$25 |
| 10 | 500 | 63 | 4 | 2 | 69 | R$7,74 | R$90 | R$110 |
| 20 | 1.000 | 125 | 7 | 2 | 134 | R$15,02 | R$140 | R$175 |
| 50 | 2.500 | 313 | 17 | 2 | 332 | R$37,20 | R$240 | R$310 |
| 100 | 5.000 | 625 | 33 | 2 | 660 | R$73,93 | R$420 | R$550 |
| 1.000 | 50.000 | 6.250 | 329 | 2 | 6.581 | R$737,08 | Sem referência | Sem referência |

\* Subtotal parcial do exemplo preto; inclui papel e impressão das folhas úteis, perdas e preparação, arredondados por linha. Não inclui custos pendentes. A tabela colorida é apenas referência; selecione impressão colorida no painel para sua memória específica. Nenhum subtotal é preço para o cliente.

### Informações ainda necessárias no exemplo

- Manutenção por A4 e minutos ativos do operador por folha.
- Custo de mão de obra por hora e tempo de montagem por bloco.
- Cola, corte e acabamento por bloco, sem duplicar a montagem.
- Materiais/serviços e tempo de preparação por pedido.
- Materiais/serviços e tempo de organização por pedido.

Os 11 campos pendentes são configuráveis. As fontes estimadas também devem ser confirmadas antes de validar venda. Para os outros equipamentos, formatos e papéis, as pendências variam; o painel lista as da configuração selecionada.

## Orçamento anterior de R$48,16

Papel/impressão R$23,16, mão de obra R$15, cola/acabamento R$5 e manutenção R$5 continuam preservados como referência agregada de **um serviço específico**. Não se conhecem todas as especificações, consumos e tempos desse orçamento; portanto não o forçamos a coincidir com os custos unitários atuais, nem dividimos automaticamente esses agregados por 50. A página da estimativa inicial passa a indicar que suas hipóteses são históricas e direciona para a fórmula atual por natureza.

## Verificação

27 novos testes de comportamento cobrem memória calculada manualmente com dados fictícios isolados, perdas sem duplicação, serviços variáveis por bloco, custos por pedido, mínimos/margens, prejuízo, preços ausentes, compatibilidade e preservação da configuração. Esses dados de teste não são carregados pela página. Regressão das funcionalidades e conferência no navegador acompanham a atualização da PR.

Resultado local: **230 testes aprovados** (203 anteriores + 27 novos). Navegador em 1440/768/390 px: referências e campos pendentes, memória manual com valores fictícios isolados, serviços por bloco variando, custos por pedido estáveis, cálculo das margens, HP A3 não presumida, preservação das edições da aba anterior, sem checkout/escrita no carrinho ou erros JavaScript. Host de produção bloqueado.
