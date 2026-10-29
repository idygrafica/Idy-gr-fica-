# Impressões Rápidas e personalização DTF

Reformula `/impressoes-rapidas` na identidade editorial branca, azul e verde usada nas páginas atualizadas. Inclui A3/A4, currículos/documentos, canetas, chamada de personalização de camisetas e bonés e orientações para pedido online. Preserva os metadados title, description, canonical e Open Graph da página original. A fotografia local da Xerox e o mascote oficial substituem a dependência de uma imagem externa na abertura, sem alterar seus arquivos originais.

Nova página `/dtf-personalizacao`: camisetas e bonés personalizados, explicação do DTF têxtil, informações de orçamento, quatro perguntas frequentes, Service e BreadcrumbList, metadados locais e Open Graph. Há links de ida e volta entre as páginas. Não há promessa de indexação ou posição no Google; sitemap com 13 URLs e alias `.html` em 301 preparados para rastreamento.

Chamada: **Sua marca veste novas ideias.** Orçamento no WhatsApp comercial existente, com mensagens referentes a cada pedido. Não há preços inventados, mínimo ou prazo presumido. Peça, tecido, modelo e aplicação são confirmados no orçamento. DTF têxtil e DTF UV para canetas são apresentados separadamente.

## Fotografias

- `assets/personalizacao/camiseta-bone-estudio.jpg`: fotografia de estúdio de MART PRODUCTION, fonte https://www.pexels.com/photo/a-man-wearing-a-blank-white-shirt-9558713/ . Original 6000 × 4000 px. Cópia para o site 1800 × 1200 px, obtida do CDN Pexels sem ampliação, aproximadamente 52 KiB. Uso como fotografia ilustrativa de peças sem personalização, com legenda explícita; não é apresentada como trabalho entregue pela IDY ou depoimento do modelo.
- Licença Pexels verificada em https://www.pexels.com/license/ em 29/10/2026: uso comercial em websites permitido. Crédito mantido aqui. Não há venda da fotografia nem alegação de endosso.
- Xerox Color 560, logotipo e mascote oficiais permanecem nos arquivos originais. A fotografia de produção gráfica já existente no acervo é reaproveitada com indicação de caráter ilustrativo.
- Fotografias de bonés com bordado e marcas de terceiros encontradas na pesquisa foram descartadas; não ilustram corretamente uma oferta de DTF têxtil.

## Escopo protegido

Base: `92583ed7e5615c28aed7350897d80c4d6e297064`. Preços, oito produtos, componentes e estilos da loja, carrinho, outras páginas e projeto `atendimento-idy` permanecem sem alteração. Nenhuma mensagem real ou conversa com IA é iniciada pelos testes. O cabeçalho segue o padrão institucional existente; o rodapé das duas páginas inclui o link de DTF e preserva os canais de contato.

## Validação e publicação

Executar `node scripts/loja/cart.test.mjs`, `node scripts/loja/canetas.test.mjs`, `node scripts/seo-technical/build-catalog.mjs`, `node scripts/impressoes-dtf/check.mjs` e `node scripts/loja/browser.mjs`. O novo workflow confere as duas páginas em 1440, 1024, 768, 390 e 320 px na prévia e após publicação; imagens, resolução, links, WhatsApp simulado, menus, FAQ, SEO, 13 páginas, aliases e 404. Verifica também os hashes de todos os arquivos anteriores fora do escopo e o build idempotente da loja. Relatórios e capturas ficam no artefato `impressoes-dtf-previas-e-testes`.

Publicação em produção autorizada expressamente pelo responsável após desenvolvimento, testes e inspeção visual. Usar a conexão GitHub–Netlify existente. Não integrar as PRs independentes #18 e #19.

Reversão: a base completa acima permanece recuperável no histórico Git. Reverter o merge desta alteração restaura conjuntamente a página, sitemap e alias, preservando o restante do site; o deploy anterior também pode ser republicado pelo painel do mesmo projeto Netlify. Não reverter melhorias anteriores nem alterar o projeto de IA.
