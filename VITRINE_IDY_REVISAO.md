# Nova apresentação dos oito produtos — prévia para avaliação

**NÃO PUBLICAR EM PRODUÇÃO.** Pedido do responsável: desenvolver e testar a vitrine, apresentar prévia Netlify e aguardar aprovação. Base publicada `43139fea92c669dfa9a15a605a5db6ab487cd194`. Branch `codex/vitrine-produtos-idy`. As PRs independentes #18 e #19 permanecem intactas.

## Apresentação

Vitrine com três colunas acima de 900 px, duas entre 521 e 900 px e uma até 520 px. Fotografias ilustrativas grandes, com enquadramento 3:2, fundos claros e apresentação padronizada. Nome, características cadastradas e preço/orçamento ficam visíveis; “VER PRODUTO” abre as opções, quantidade e ação comercial. A expansão é nativa e funciona por teclado e sem JavaScript; os demais recursos de compra continuam dependendo do JavaScript existente.

Categorias disponíveis no próprio catálogo, sincronizadas com a navegação existente. Papel limitado aos dois dados já cadastrados: Couchê 300 g e sulfite comum. Nenhum tipo de papel é atribuído aos demais produtos. Busca sem distinção de maiúsculas/acentos, combinando termos do nome, descrição e opções: “Couchê 300g”, “9x5”, “A5 50” e “DTF UV”. Limpar filtros restaura categorias, papel e pesquisa.

Os oito produtos, nomes, descrições, opções e preços permanecem no catálogo original, sem edição. A3: R$ 3 por face, R$ 6 por folha frente e verso. Canetas: 100 por R$ 5,20/un.; 500 por R$ 4/un.; 1.000 por R$ 3,60/un. Quantidades não cadastradas e demais produtos continuam sob orçamento. O texto “A partir de R$ 3,60/un.” mantém a condição de 1.000 unidades. Não há cobrança automática.

## Imagens

Oito imagens originais de apresentação geradas para esta proposta, identificadas na vitrine como **ilustrativas**. Não são fotos de encomendas reais entregues ou modelos/condições garantidos. Não há imagens, textos promocionais ou elementos gráficos copiados da ANS. A referência de organização comercial segue a descrição do responsável; as fotografias mencionadas da ANS não estavam anexadas nesta conversa.

As imagens têm 1536 × 1024 px, sem ampliação, convertidas para WebP mantendo as dimensões e o enquadramento. Os oito arquivos somam aproximadamente 690 KiB; cada um é carregado sob demanda. Os PNG originais estão preservados nos artefatos locais de geração. Pasta publicada somente na prévia: `assets/loja/produtos/`. As imagens antigas não foram removidas; o carrinho continua usando as miniaturas originais.

## Preservação

`assets/loja/catalog.js` e `assets/loja/cart.js` idênticos à base. Os handlers comerciais e a renderização do carrinho não foram alterados. Mudanças no JavaScript limitadas à apresentação e aos filtros; opções, quantidades e cálculos usam os mesmos controles e funções. Cabeçalho, abertura, mascote, Xerox, WhatsApp, IA, carrinho, rodapé e demais páginas têm suas fontes protegidas por comparação com a base. O CSS novo atua somente dentro de `.catalog`.

Oito produtos pré-renderizados no HTML inicial, com os mesmos IDs e âncoras. Title, description, canonical, Open Graph e JSON-LD preservados. Sitemap, robots, redirects e configuração de hospedagem não foram modificados. O build existente usa a nova apresentação tanto no HTML inicial quanto nos resultados filtrados e é idempotente.

## Validação

Executar os dois arquivos de testes comerciais existentes e `node scripts/vitrine/check.mjs`. O workflow da proposta verifica a cópia local e a prévia real em 1440, 1280, 1024, 768, 520, 390 e 320 px: três/duas/uma coluna, imagens e resolução, detalhes por teclado, filtros combinados e limpeza, buscas, entradas contendo HTML, A3, três quantidades de canetas, quantidades não cadastradas, persistência, edição, remoção, pedido misto e WhatsApp simulado. Nenhuma mensagem ou conversa de IA é enviada.

Relatórios e capturas no artefato `vitrine-idy-previas-e-testes`. A produção deve continuar servindo a base publicada durante toda a avaliação. Não fazer merge nem publicar em produção sem nova aprovação expressa do responsável.
