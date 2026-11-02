# Impressões e receituários — publicação autorizada

Base: main `93a01068b0f7a2a387934dd687b875d209e534ef`. Branch isolada `codex/precos-impressos-receituarios`. O usuário aprovou explicitamente a PR #24 e a aplicação do commit `eed1e03` para publicação. Backup anterior: `backup/antes-precos-impressos-20261102`, em `93a01068b0f7a2a387934dd687b875d209e534ef`. As alterações posteriores à aprovação são somente de documentação e verificação em produção.

Mantém os dez produtos e o layout geral. A ficha existente `a3` passa a se chamar “Impressões A4 e A3 coloridas” e recebe três opções, sem remover as opções A3 sulfite comum frente e frente/verso. A ficha existente `blocos` (“Receituários e blocos”) recebe a opção “Receituário A5 · 75 g · 50 folhas · colorido frente (4×0)”; as opções anteriores A7/A6/A5 permanecem sob consulta. O produto separado de blocos personalizados em offset 90 g permanece sob consulta e não recebe o preço de receituário em papel 75 g.

| Venda aprovada | Quantidade | Unitário | Total |
|---|---:|---:|---:|
| A4 · papel 75 g · colorida frente 4×0 | 1 folha | R$ 2,20 | R$ 2,20 |
| A3 · couché 300 g · colorida frente 4×0 | 1 folha | R$ 4,50 | R$ 4,50 |
| A3 · Supremo 250 g · colorida frente 4×0 | 1 folha | R$ 5,00 | R$ 5,00 |
| Receituário A5 · papel 75 g · 50 folhas · colorido frente 4×0 | 1 bloco | R$ 50,00 | R$ 50,00 |
| Mesmo receituário | 5 blocos | R$ 38,00 | R$ 190,00 |
| Mesmo receituário | 10 blocos | R$ 34,00 | R$ 340,00 |

Impressões: preço linear por folha. Receituários: totais exatos por tiragem; não interpolar, aplicar faixas ou estender a tabela a outras quantidades. Exemplo: 6 blocos ficam sob consulta. Acrescentar mais itens da mesma configuração recalcula pela quantidade final; 1+4 blocos passam a R$ 190,00 e 5+5 passam a R$ 340,00.

Criação simples: R$ 100,00 por arte identificada no pedido, uma única vez, independentemente de unidades, formatos ou produtos. Arte pronta: sem serviço de criação. A nova opção de receituário reutiliza essa regra, inclusive se a mesma arte já estiver nos blocos ou pastas digitais do pedido. Exemplos: 5 blocos + criação = R$ 290,00; 10 blocos + criação = R$ 440,00. Criação complexa/projeto especial: orçamento específico. Arquivos enviados pelo atendimento existente no WhatsApp, sem upload automático.

Pastas com bolsa e digitais simples continuam sob consulta. Canetas, cartões, comandas, adesivos, brindes, blocos offset e seus preços/especificações não são alterados. Fotos, mascote, logo, Xerox, páginas institucionais, projeto da IA, sitemap, robots, canonical e URLs permanecem intactos. Os filtros existentes continuam funcionando; as opções de papel 75 g e Supremo 250 g são derivadas do catálogo aprovado. Nenhum custo interno é exposto ao cliente.

## Verificação

- 16 testes do carrinho e 9 de canetas, com a lista de opções por folha atualizada para incluir os novos preços aprovados.
- 25 testes dos produtos digitais, mantendo produção sob consulta e criação única.
- 32 testes novos: valores unitários/totais, tiragens exatas, quantidades não aprovadas, consolidação, edição/restauração, preços injetados, arte pronta/criação única, pedidos mistos e mensagem do WhatsApp.
- Navegador: computador 1440, tablet 768 e celulares 390/320; seleção de preço/quantidade, total com/sem criação, edição/restauração no carrinho, WhatsApp interceptado, opções antigas, dez produtos, busca/filtros, ausência de custos internos e erros JavaScript, fotos e capturas.
- Proteção dos arquivos fora do escopo por hash, oito fichas fora da alteração preservadas em HTML, dez IDs/categorias, metadados e regiões gerais da home preservados; build idempotente.
- Regressões de blocos/pastas digitais, navegação entre páginas, carrinho compartilhado, SEO e aliases mantidas. Relatórios/capturas no artifact da PR.

Publicar após os checks da PR e confirmar os novos preços no site, carrinho e WhatsApp. Pastas e cartões permanecem aguardando definição comercial, sem alterações de preço. Para reverter, recuperar o backup ou reverter o merge da PR #24, preservando mudanças futuras.
