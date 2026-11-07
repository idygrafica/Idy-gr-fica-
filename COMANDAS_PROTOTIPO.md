# Calculadora de comandas — protótipo, sem publicação autorizada

Base: main `5fac1d2120ba3eac9370733a767e5e830e36157f`. Preserva os preços dos cartões da PR #34 e o banner da PR #33. Não modifica a aplicação independente de IA.

## O que está disponível

Somente o produto Comandas recebe o formulário “MONTE SUA COMANDA”: largura/altura em cm, papel 54/75 g, preta/colorida, 1 via, 50 folhas por bloco, 1–1.000 blocos. Mostra total estimado, valor por bloco, folhas e resumo. Recalcula imediatamente e limpa estimativas antigas quando os dados são inválidos.

Adicionar ao carrinho cria uma **solicitação sob orçamento**, nunca um produto com preço aprovado. Especificações persistem no ID da configuração; nenhum preço enviado pelo navegador é aceito. O WhatsApp inclui o resumo e a estimativa expressamente provisória. Em pedidos mistos, o subtotal aprovado não inclui a comanda. Não há envio automático de mensagem, upload, pagamento ou nova IA.

Os IDs antigos de comandas de 1/2/3 vias continuam válidos para carrinhos existentes, sob consulta. O formulário novo oferece somente 1 via. Configurações, papel, cor e medidas diferentes permanecem itens distintos; edição e soma não ultrapassam 1.000 blocos.

## Custos: o que está confirmado e o que é hipótese

Não foram encontrados custos internos de papel, clique de impressão, mão de obra, perdas ou margem no repositório. Preços de venda de A3/A4, criação de arte, receituários e pastas **não foram tratados como custos de produção**.

- Imposto de 6%: informado pelo usuário.
- Dez totais 10 × 7 cm / 75 g / 50 folhas: fornecidos pelo usuário como referências provisórias.
- Margem de 30%, perdas de 5%, 2 folhas de preparação, margens de 3 mm, intervalo de corte de 1 mm e todos os valores de papel, impressão, preparação, corte, cola e acabamento: **hipóteses do protótipo**, sem alegação de custo real ou disponibilidade validada.
- Xerox e formatos A4/A3 já constam do projeto. A área útil, gramatura 54 g e capacidade de corte devem ser confirmadas pela produção antes de orçamento definitivo.

Configuração central: `assets/loja/comandas-config.js`. Valores monetários em centavos; dimensões em cm. O bloco `reference.costBasis` é uma fotografia da calibração inicial: atualizar custos atuais não altera essa base silenciosamente. Recalibrar esse bloco exige revisão da tabela. `approvedForSale:false` é uma proteção do protótipo; mudar para true não ativa cobrança e é rejeitado pelo motor.

## Método de cálculo

1. Converte as medidas para inteiros de 0,1 mm. Desconta as margens da folha e calcula encaixe nas duas orientações, incluindo combinações em faixas de corte guilhotinado. Não usa apenas divisão de áreas nem alega otimização industrial para todo arranjo possível.
2. Para cada folha A4/A3 viável: `folhasBoas = ceil(blocos × 50 / peçasPorFolha)`; `folhasProdução = ceil(folhasBoas / (1 − perdas)) + folhasPreparação`.
3. Soma papel e impressão por folha de produção, preparação fixa, corte por pilha/movimento, cola e acabamento fixos e por bloco. Escolhe a alternativa viável de menor custo estimado. Não conta as perdas duas vezes.
4. A curva comercial usa os cinco pontos de cada cor: valores exatos nas referências, interpolação entre pontos e continuação da inclinação 50–100 para 101–1.000 blocos. Isso é extrapolação provisória, não aprovação comercial de novos preços.
5. Calcula um resíduo de custo calibrado: `R = referência(q,cor) × (1 − impostoBase − margemBase) − custoBase(10×7,75g,q,cor)`. Esse resíduo também é provisório; não é despesa real comprovada.
6. `preçoEstimado = ceil(max(custoAtual, custoAtual + R) / (1 − impostoAtual − margemAtual))`, em centavos. Custos fixos, folhas inteiras e aproveitamento causam degraus reais; dobrar medidas não multiplica simplesmente o preço pela área. Mudanças de custos, perdas, imposto ou margem refletem no valor.

Medidas entre 1 e 42 cm, com até duas casas decimais, são aceitas como entrada. Se não couberem na área útil de nenhuma folha, não há preço automático: a interface pede avaliação humana. Margem + imposto >= 100%, custos negativos, gramaturas/cores inválidas e tiragens fora do limite são rejeitados.

## Verificação

Executar `node scripts/loja/comandas.test.mjs` e as seis suítes comerciais existentes (107 testes anteriores). Conferir formulário, filtro/busca, carrinho misto, restauração, WhatsApp interceptado, limites, erros e responsividade no computador, tablet e celular. Nenhuma mensagem real deve ser enviada.

Somente a prévia da PR será publicada pelo Netlify. Nenhum merge na main ou publicação em produção nesta etapa. Custos internos e viabilidade precisam de validação antes de transformar a simulação em tabela comercial definitiva.
