# Reparo de dados estruturados — produtos sob consulta

Base: `a4ae9e6a97726ffaf839c15a8048efbfab119de0`. Branch: `codex/corrige-schema-produtos`. Proposta sem merge ou publicação em produção.

## Diagnóstico

O rastreamento de 1º de novembro informado pelo Google não basta para concluir a situação atual. A auditoria inicial leu as 15 URLs do sitemap publicado e encontrou quatro ocorrências incompletas de `Product`, referentes a dois produtos, em três páginas:

| Página | Produto com marcação incompleta |
|---|---|
| `/` | Blocos personalizados e Pastas digitais simples, dentro de `ItemList` |
| `/blocos-personalizados` | Blocos personalizados |
| `/pastas-digitais-simples` | Pastas digitais simples |

As quatro ocorrências não têm `offers`, `review` nem `aggregateRating`. O snapshot dessa inspeção está em `scripts/product-schema/baseline-public.json`. O workflow repete a leitura HTTP das três páginas, sem alteração da produção, e registra a data/hora e o resultado atual em `current-public.json`. Esse resultado deve ser consultado para distinguir a inspeção atual do rastreamento antigo do Search Console.

Sem acesso à propriedade privada do Search Console, esta entrega não confirma a lista de URLs de seu relatório interno nem inicia o comando “Validar correção”. O diagnóstico é feito no HTML público e nos geradores existentes.

## Correção proposta

- Na home, a coleção mantém dez itens e todos os nomes, descrições, IDs e links. Os dois itens sob consulta passam de `Product` para `Thing`, assim como os outros itens da vitrine. Não ficam marcações `Product` na página inicial.
- Nas duas páginas próprias, o serviço gráfico sob orçamento usa `Service`, com o prestador IDY e a cidade Porto Alegre já confirmados. Os IDs, URLs, `WebPage`, breadcrumbs, imagens e descrições permanecem preservados. Não é uma oferta de preço fechado.
- Os dois geradores foram corrigidos. Editar somente o HTML gerado faria o próximo build reintroduzir o problema.
- Não foram criados preços, ofertas de R$ 0, avaliações, estrelas, estoque ou disponibilidade fictícios. Os R$ 100,00 da criação de arte não são usados como preço do produto.
- Não foram criados produtos ou URLs. Os outros oito produtos e seus preços permanecem iguais, inclusive os valores de pastas com bolsa, impressões, receituários e canetas.

## Preservação e testes

A verificação compara todos os arquivos da base por hash, com exceção dos dois geradores e dos três HTML envolvidos. Para esses HTML, remove apenas os blocos JSON-LD e exige igualdade integral com a produção anterior: imagens, nomes, preços, formulários, botões, carrinho, WhatsApp, IA, rodapés e todo o conteúdo visual devem permanecer byte a byte iguais. Também compara os schemas e permite somente as transformações descritas acima.

O workflow executa os 100 testes comerciais existentes, confere build idempotente e JSON-LD das 15 páginas, e verifica a loja local e a prévia em 1440, 768, 390 e 320 px. Os cenários incluem dez produtos visíveis, as duas fichas sob consulta, botão VER PRODUTO, seleção da arte, criação única de R$ 100,00 compartilhada entre os dois itens, carrinho, persistência, preço A4 de R$ 2,20, WhatsApp interceptado sem envio, imagens, canonical, ausência de rolagem lateral e erros JavaScript.

As capturas de computador/celular, o resultado da leitura atual da produção e o relatório do navegador ficam no artifact `produtos-schema-previa-e-testes` da PR. A prévia conserva o `noindex` automático do Netlify; canonical, sitemap e robots de produção não são alterados.

## Teste de resultados avançados do Google

A automação abre a [ferramenta oficial](https://search.google.com/test/rich-results?hl=pt-BR) e testa o HTML corrigido das três páginas no modo CÓDIGO. Isso permite validar a proposta sem publicar e sem retirar a proteção `noindex` da prévia. O artifact `google-resultados-avancados` registra links dos resultados, textos e capturas. Se houver bloqueio, CAPTCHA ou indisponibilidade, o resultado será indicado como **não validado**; testes locais não serão apresentados como aprovação do Google.

O resultado esperado é a ausência do erro de `Product` incompleto. Como os dois produtos continuam sob consulta, não se pretende obter resultados avançados de produto nem preço para eles. Breadcrumbs e outras marcações válidas podem continuar sendo reconhecidos.

Depois de eventual autorização e publicação, será necessário inspecionar as URLs públicas e solicitar nova validação no Search Console. Um erro histórico pode continuar aparecendo até novo processamento pelo Google. Nenhuma solicitação de indexação ou validação da propriedade privada foi enviada nesta etapa.

## Referências

- [Google — requisitos de Product e offers](https://developers.google.com/search/docs/appearance/structured-data/product-snippet): `Product` exige pelo menos uma das propriedades `offers`, `review` ou `aggregateRating` para snippets. Não se inventam dados para satisfazer o teste.
- [Google — introdução aos dados de produto](https://developers.google.com/search/docs/appearance/structured-data/product): os requisitos variam conforme o uso; não há garantia de exibição de resultados avançados.

**Produção permanece sem alterações. PR em rascunho, sujeita à aprovação do responsável.**
