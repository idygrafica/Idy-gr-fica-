# SEO técnico da loja — revisão para publicação

Base analisada: `e689735ffd43697101d3f085bb283b294b981a9f`, que contém a loja e a tabela aprovada das canetas. Repositório `idygrafica/Idy-gr-fica-`. Esta alteração fica em branch/PR; não integra a main nem publica a produção.

## Diagnóstico confirmado

- As 12 páginas canônicas, robots e sitemap estão acessíveis. robots libera rastreamento; não foi encontrado `noindex` nas páginas/headers auditados. Canonical já apontava ao domínio oficial, e o sitemap já enumerava as 12 páginas. Esses arquivos/valores corretos são preservados.
- A resposta HTML original da loja não contém os oito produtos: o catálogo só é montado após JavaScript. O Google pode executar JavaScript, mas essa dependência adia e torna menos direta a descoberta do conteúdo comercial.
- Os aliases `.html`, inclusive `/index.html`, respondem 200 com conteúdo duplicado. As versões com barra de Impressões Rápidas e Impressões do Dia a Dia também respondem 200. As reescritas 200 estavam antes das regras 301 dessas barras finais.
- A loja não tem oito páginas próprias de produto. São oito cartões na página inicial; não se deve inventar URLs de produto no sitemap nem prometer oito páginas indexadas.
- Os títulos e descrições já mencionavam Porto Alegre. A página inicial ainda descrevia principalmente o antigo site institucional. Metadados de partilha estavam incompletos em várias páginas.

## Correções

- HTML inicial com os oito produtos e seus dados reais, gerado a partir do catálogo atual. O mesmo componente de apresentação atende ao build e aos filtros da loja; não existe uma segunda tabela de preços. A geração é idempotente e roda no build Netlify.
- Títulos e descrições únicos, voltados aos serviços de cada página em Porto Alegre. Open Graph coerente com title, descrição e canonical. Conteúdo visível e fotografias preservados.
- URLs antigas `.html` redirecionam 301 para suas versões canônicas. Barras finais são normalizadas antes das reescritas 200. Não há regra geral que transforme URLs inexistentes em páginas válidas; 404 é preservado. O arquivo de verificação Google permanece acessível.
- Metadados de coleção/ItemList descrevem os oito produtos existentes, com âncoras reais na página. Sem ofertas fictícias, estoque, avaliações, frete ou promessas de rich results. Mantém LocalBusiness com os contatos/endereço existentes e informa Porto Alegre como área atendida.
- Verificações de publicação passam a comparar páginas com o checkout atual, evitando exigir metatags de versões antigas. O build do verificador usa a mesma geração de catálogo do Netlify. O guarda histórico da PR de canetas fica restrito à própria branch; seus testes de preço e de navegador continuam ativos na main.

## Preservação e testes

O catálogo, a lógica de preços/carrinho/WhatsApp, CSS e todas as imagens são comparados com os hashes da base atual. A extração do componente preserva o HTML comercial dos oito cartões, adicionando apenas IDs de âncora. Os corpos das demais páginas são idênticos; na loja, a única inclusão de corpo é o catálogo antes gerado pelo navegador.

O workflow executa 25 testes de preços e regressões, compara capturas antes/depois das 12 páginas em 1440, 768 e 390 px e verifica catálogo sem JavaScript, metadados, links internos, aliases e 404. Também executa a suíte funcional atual da loja em seis larguras, sem mensagens reais ao WhatsApp. Os resultados devem ser conferidos no pipeline/artefatos da PR antes da publicação.

## O que depende do Google Search Console

Após aprovação, integração e publicação: confirmar a propriedade `https://idygrafica.netlify.app/` na conta do responsável; o arquivo de verificação existente foi preservado, mas sua presença não comprova que a conta está validada. Enviar/reprocessar `https://idygrafica.netlify.app/sitemap.xml`; inspecionar a home e as páginas prioritárias com teste ao vivo; solicitar indexação quando apropriado; acompanhar “Páginas”, canonical escolhida pelo Google, experiência e desempenho por consultas/localidade.

Sem acesso autorizado ao Search Console não é possível confirmar quais URLs o Google já indexou, o motivo real de exclusões nessa conta, posições ou impressões. Canonical e sitemap são sinais; indexação, snippets e posições são decisões do Google. Não usar a API Indexing para estas páginas comerciais comuns. Páginas exclusivas de produto, Merchant Center e Perfil da Empresa podem ser etapas futuras, com conteúdo e condições comerciais aprovados.

## Referências oficiais

- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/appearance/structured-data/product-snippet

## Publicação

PR para revisão. Nenhum merge ou deploy de produção é executado por este workflow. A integração nativa poderá criar uma Deploy Preview da PR; ela é uma prévia e normalmente recebe `noindex` do Netlify. Não remover essa proteção da prévia. Após aprovação e testes, publicar pelo mesmo projeto Netlify existente, sem alterar o atendimento independente.
