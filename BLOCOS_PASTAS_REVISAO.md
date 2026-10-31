# Blocos e pastas digitais — prévia para aprovação

Base: main `7c50aee196b4c0b0e9969812f5b6a2d64b69856f`. Branch isolada `codex/blocos-pastas-digitais`. Não fazer merge nem publicar em produção sem nova autorização.

Adapta apenas as duas fichas da vitrine, mantendo os oito IDs/produtos, catálogo e preços originais intactos. Opções antigas A7/A6/A5 e pastas com bolso 4×0/4×4 permanecem na seção “Outras opções já disponíveis”. Não altera as PRs #18 e #19. Usa o carrinho e o WhatsApp existentes; não há segundo checkout ou upload automático.

## Preços recebidos e aprovação

Todos os valores de produção a seguir são referências fornecidas pelo usuário, sem verificação independente das fotografias da concorrente. Não são publicados no catálogo nem tratados como oferta IDY.

| Produto de referência | Quantidade | Total concorrente/referência | Unitário derivado, arredondado | Preço de produção aprovado IDY |
|---|---:|---:|---:|---|
| Bloco A5 | 5 | R$ 170,00 | R$ 34,00 | Nenhum — sob consulta |
| Bloco A5 | 20 | R$ 413,20 | R$ 20,66 | Nenhum — sob consulta |
| Bloco A5 | 50 | R$ 529,00 | R$ 10,58 | Nenhum — sob consulta |
| Bloco A5 | 100 | R$ 722,00 | R$ 7,22 | Nenhum — sob consulta |
| Pasta COM BOLSA da concorrente | 100 | R$ 637,44 | R$ 6,37 | Nenhum — produto diferente |
| Pasta COM BOLSA da concorrente | 200 | R$ 786,54 | R$ 3,93 | Nenhum — produto diferente |
| Pasta COM BOLSA da concorrente | 500 | R$ 1.233,85 | R$ 2,47 | Nenhum — produto diferente |
| Pasta COM BOLSA da concorrente | 1.000 | R$ 1.979,40 | R$ 1,98 | Nenhum — produto diferente |
| Criação simples da arte IDY | 1 arte | — | R$ 100,00 | Aprovado: uma vez por arte |
| Arte já pronta | — | — | R$ 0,00 de criação | Aprovado: sem adicional de criação |

A seleção principal usa as quatro tiragens atuais: 5, 20, 50 e 100 blocos. A referência anterior de 10 blocos foi retirada da seleção, sem invalidar solicitações antigas sob consulta. Inconsistência histórica A5: a referência de 10 blocos custa R$ 37,46/un., 10,18% mais que R$ 34,00/un. para 5 blocos. Precisa conferir a foto/tabela original e se a especificação é a mesma; não foi corrigida por suposição nem recomendada como tabela comercial.

A4 e A6: sem referência e sem preço aprovado. Pasta simples IDY: sem preço aprovado em nenhuma tiragem. A tabela `approvedDigitalTotals` permanece vazia, com campos por produto/formato para totais em centavos de tiragens exatas; sem extrapolação. A IDY deverá aprovar os valores antes de preencher esses campos.

## Dados a confirmar antes da venda

- Todos os blocos, inclusive A5: custo real de offset 90 g, impressão 4×0, 50 folhas, colagem/refile, desperdício, tributos/margem, prazo e capacidade. Conferir referência incoerente de 5/10 blocos.
- A4 e A6: custo e aproveitamento de papel/impressão por tamanho e cada tiragem. Não extrapolar A5.
- Pastas: papel/gramatura, formato aberto/fechado, área imprimível, cor/faces, vinco, montagem, capacidade e prazo para 100/200/500/1.000; validar que não requer bolsa, laminação ou acabamentos especiais.
- Aprovar preço total de cada tiragem e condições comerciais. Criação complexa sempre exige orçamento próprio.

## Arte e carrinho

A configuração registra arte pronta ou criação simples de R$ 100,00. O cliente identifica a arte com um nome: mesmo nome (sem diferença de caixa/espaços externos) representa a mesma arte no pedido; outro nome representa outra arte. O subtotal de criação conta nomes únicos, independentemente de unidades, formatos, acréscimo da mesma configuração ou restauração. Remover a última configuração de uma arte remove sua cobrança. Itens antigos não ganham cobrança de arte.

O subtotal de produção e o subtotal de criação são separados. O total final permanece “Sob consulta” se qualquer produto não tiver preço aprovado. O botão do WhatsApp envia uma solicitação com quantidades, configuração e criação, nunca uma compra fechada ou cobrança automática. Nenhuma mensagem real é enviada pelos testes.

## Visual, imagens e SEO

Mantém branco, azul e verde, layout geral, seis outras fichas, fotos oficiais, logo, mascote e Xerox. Blocos reutilizam a imagem ilustrativa existente de 1536×1024. A fotografia real disponível mostra blocos preto e branco em caixa e não corresponde à configuração colorida proposta; foi preservada sem troca. Para a pasta simples, uma nova imagem ilustrativa de estúdio foi gerada, 1536×1024, sem bolsa e sem copiar concorrentes; não é fotografia de trabalho entregue. Original preservado no workspace; WebP para a loja.

Mantém todas as URLs/âncoras, canonical, títulos e descrição gerais e robots existentes. Acrescenta somente duas páginas canônicas: `/blocos-personalizados` e `/pastas-digitais-simples`, com títulos, descrições, Open Graph, Product sem ofertas fictícias e breadcrumbs. As páginas reutilizam cabeçalho, rodapé, formulário e carrinho da loja; nomes, fotografias e links das duas fichas levam às páginas. O sitemap conserva todas as entradas anteriores e ganha somente essas duas URLs; o Netlify conserva as regras anteriores e acrescenta os dois aliases `.html` com 301. Os oito produtos não são duplicados; as páginas e a coleção referenciam o mesmo ID de produto nos dados estruturados. Projeto independente de atendimento com IA permanece intocado.

## Validação

- 16 testes comerciais originais e 9 testes de canetas, inalterados.
- 24 testes adicionais de opções, valores não aprovados, criação por arte, tiragem, consolidação, remoção, restauração, pedido misto, WhatsApp, preços injetados e preços futuros exatos.
- Navegador: desktop 1440, tablet 768, celulares 390 e 320; opções, zero/preço de arte, preço final incompleto, criação compartilhada, edição/restauração/remoção, nome malicioso escapado, WhatsApp interceptado, preços A3/canetas, busca/categoria, imagens nítidas, sem rolagem lateral, fallback sem JavaScript, URLs do sitemap e ausência de erros JavaScript.
- Preservação por hash dos arquivos originais fora do escopo, HTML das outras seis fichas, cabeçalho/hero/rodapé/carrinho inicial e metadata; build idempotente.
- Páginas próprias: 1440/768/390/320, canonical/metadata/schema sem ofertas, aliases 301, um produto por página, compartilhamento do carrinho entre loja/blocos/pastas, cobrança de criação única entre páginas, pesquisa e categorias levando à loja, envio ao WhatsApp interceptado e fallback sem JavaScript.
- Relatório e capturas gerados em `.preview/digital-products/`, anexados pelo workflow da PR.

Pendente comercial: tabela final da produção e capacidade. Pendente aprovação: revisão da prévia e autorização explícita de publicação. Nenhum merge é realizado nesta entrega.
