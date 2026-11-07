# PR #35 — segunda simulação: custos de produção, sem calibração

A simulação 1 foi preservada, inclusive seus preços de referência e integração de orçamento provisório. A simulação 2 está em `/_previas/comandas-custos/`, com link interno no produto Comandas visível apenas em localhost/Deploy Preview. É uma ferramenta de análise da prévia, não uma área com autenticação. Não há merge ou publicação em produção nesta etapa.

## Dados ausentes e equipamentos

`assets/loja/comandas-cost-config.js` centraliza os parâmetros da segunda simulação. Custos ausentes começam como **null**, nunca como R$0,00. As referências de compra A4 75 g (R$26/500), folha bruta 54 g (R$34,41/33 em 66×96), estimativa HP preta A4 (R$0,02), imposto de 6% e margens desejadas de 45%/50% foram informadas pelo usuário. A margem principal começa em 45%; as tabelas comparam ambas. Zero precisa ser explicitamente informado quando não houver custo adicional.

O painel separa papel 54/75 g por folha A4/A3; impressão preta/colorida por face, manutenção por folha e tempo ativo do operador por folha para cada equipamento/formato; mão de obra por hora, tempo de preparação e montagem por bloco; materiais/custos fixos de preparação, corte, cola e acabamento fixos/por bloco; perdas, folhas de preparação, margem não imprimível e espaçamento de corte; imposto e margem sobre faturamento.

A Xerox Color 560 usa os formatos A4/A3 já existentes nos serviços do projeto. O modelo exato da HP pigmentada não foi informado. Há referência explícita de impressão por A4; a capacidade A3 e a área imprimível permanecem a confirmar. Cada combinação possui seus próprios custos; não copiamos custos da Xerox para a HP. Um formato não suportado é excluído do cálculo, e capacidade não confirmada mantém o preço pendente.

O botão **Carregar estimativas anteriores** só recupera hipóteses já documentadas na simulação 1 (papel, impressão da Xerox, geometria, perdas, preparação em folhas e margem), marcadas como estimativas não confirmadas. Não cria valores ausentes para HP, manutenção, mão de obra, corte, cola, acabamento ou preparação fixa; não sobrescreve campos preenchidos. As antigas parcelas agregadas de preparação/serviços não são importadas porque não separavam mão de obra/material com segurança.

O painel não tem checkout, não altera o carrinho e não envia custos ao WhatsApp. Os valores preenchidos ficam em memória no navegador; podem ser baixados como JSON para revisão. Não há gravação remota automática nem armazenamento na chave do carrinho.

## Formação do preço

1. Reutiliza somente normalização das medidas e geometria de encaixe da primeira simulação. **Não chama seu estimador comercial.** Calcula peças por folha, nas duas orientações e em faixas guilhotinadas, descontando área não imprimível e espaçamento.
2. `folhasBoas = ceil(blocos × 50 / peçasPorFolha)`.
3. `folhasProdução = ceil(folhasBoas / (1 − perdas)) + folhasPreparação`.
4. Papel, impressão e manutenção usam **todas as folhas produzidas**. As perdas não são cobradas novamente em uma segunda reserva monetária.
5. `minutosMãoDeObra = minutosPreparação + blocos × minutosPorBloco + folhasProdução × minutosAtivosPorFolha`.
6. Mão de obra = minutos × custo/hora ÷ 60. Corte, cola e acabamento usam parcela fixa + parcela por bloco; nesses campos devem entrar somente custos não incluídos na mão de obra por tempo.
7. Custo total = papel + impressão + manutenção + mão de obra + preparação fixa + corte + cola + acabamento.
8. `venda = custoTotal / (1 − imposto − margem)`, com arredondamento para cima ao centavo. A margem é sobre o faturamento após custos e imposto; não é markup sobre custo.
9. Imposto = venda × taxa. Lucro da simulação = venda − custo − imposto. Exibição em reais arredondada; a margem efetiva é reportada pelo motor.

Custos unitários aceitam quatro casas decimais em reais, para não truncar custos pequenos por clique. Cálculos materiais usam unidades inteiras de 1/100 de centavo. O custo final e a venda são arredondados para cima ao centavo. Imposto + margem >= 100%, custos negativos/não finitos, formatos impossíveis e parâmetros inválidos bloqueiam a venda calculada.

Campo ausente mantém **venda, custo completo e diferença sem valor**. Parcelas conhecidas aparecem somente como subtotal explicitamente incompleto. Uma ausência não reduz artificialmente o custo. Cada cenário é validado separadamente, permitindo analisar um perfil completo sem inventar custos dos demais.

## Comparação com a tabela

Cada cenário mostra as tiragens 1, 10, 20, 50 e 100, referência da cor selecionada, custo total, venda calculada e diferença = venda − referência. A tabela não participa da formação do preço. Não há resíduo, calibração, ajuste para fechar referência, interpolação ou extrapolação comercial na segunda simulação.

A referência permanece 10 × 7 cm, 75 g, 50 folhas, 1 via. Se medidas ou papel forem diferentes, a ressalva aparece no painel. A quantidade selecionada pode ir até 1.000; se não houver preço de referência para ela, a diferença fica indisponível, sem criar referência fictícia.

## Resultado possível com os dados atualmente disponíveis

Sem os dados pendentes, nenhum dos quatro cenários apresenta preço de venda completo. A prévia agora carrega as estimativas anteriores, preservando as novas referências de compra e classificando as origens. Ver `COMANDAS_CONFERENCIA_CUSTOS.md`. Com essas referências e hipóteses, para 10 blocos de 10 × 7 cm em 75 g:

| Cenário | Folhas de produção | Papel + impressão preta | Papel + impressão colorida | Venda/diferença |
|---|---:|---:|---:|---|
| Xerox A4 | 69 | R$7,728 (≈ R$7,73) | R$17,388 (≈ R$17,39) | Pendente |
| Xerox A3 | 36 | R$7,92 | R$15,84 | Pendente |
| HP A4/A3 | Área imprimível A4 e capacidade/área A3 a confirmar | Não informado | Não informado | Pendente |

Os subtotais acima são incompletos e ainda estimados. Faltam custos de manutenção, mão de obra, serviços e preparação fixa para chegar a uma venda legítima e à diferença da referência. Essa ausência é apresentada, não preenchida com valores inventados.

## Testes e preservação

Os dados de `scripts/loja/comandas-costs.fixture.mjs` são inteiramente fictícios para testes automatizados. Não são carregados no painel e não representam preços/custos IDY. Testes verificam a aritmética completa com entradas conhecidas, dados ausentes, zeros explícitos, custo fracionário, imposto/margem, comparação Xerox/HP e A4/A3 e independência da referência.

Executar as sete suítes comerciais existentes (145 testes), `node scripts/loja/comandas-costs.test.mjs` (31) e `node scripts/loja/comandas-cost-audit.test.mjs` (10): 186 testes. Conferir o painel no computador, tablet e celular, preenchimento e invalidação imediata, formatos da HP, exportação dos parâmetros, ausência de checkout e proteção de host. Revalidar a primeira simulação, os nove outros produtos, o build e as páginas existentes.

O painel interno tem noindex/nofollow, não entra no sitemap comercial e não possui canonical para uma nova página de serviço. Em domínios de produção, o JavaScript não renderiza campos ou resultados e o link interno fica oculto. Isso evita ativação acidental de análise; não substitui autenticação. Imagens, demais produtos, preços aprovados, IA e configurações de hospedagem permanecem intactos.


Conferência mais recente: `COMANDAS_CONFERENCIA_CUSTOS.md`. A conversão do 54 g em 9 A4 ou 4 A3 é uma estimativa de corte, não referência de compra desses formatos. Manutenção, mão de obra e acabamento continuam pendentes.
