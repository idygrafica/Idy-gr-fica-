# Livros Digitais: reformulação comercial para aprovação

Base: `9e20e9009c503b8e1854689e49c02521d85b048e`, versão mais recente da main ao iniciar.

A página antes destacava uma publicação digital específica, sem apresentar os três grupos de impressão editorial. Agora a apresentação separa livros, apostilas e catálogos, explica como pedir orçamento e mantém a publicação online como exemplo secundário.

- Estilo branco, azul e detalhes verdes; tipografia ampliada, elementos retos, novo CSS carregado apenas nesta página.
- Textos sem preços, prazos ou descontos inventados. Espiral, grampeamento e encadernações são preferências para consulta, expressamente sujeitas à confirmação de disponibilidade e viabilidade.
- Fotografias ilustrativas de livros, materiais de estudo e publicações; nenhuma imagem ou identidade da loja foi substituída. As fotos são carregadas do CDN público Pexels e não representam trabalhos produzidos pela IDY.
- Cabeçalho, rodapé, script de navegação, telefone comercial e acesso ao atendimento com IA preservados.
- Seis informações para orçamento: material, formato, páginas, exemplares, cor e acabamento. Links diretos para o WhatsApp comercial, sem envio automático.
- Título, descrição, Open Graph e dados estruturados alinhados à impressão digital de livros, apostilas e catálogos em Porto Alegre. Canonical `/livros-digitais`, sitemap de 12 páginas, robots e redirecionamentos preservados.

## Validação

O workflow dedicado executa os 25 testes comerciais existentes, confere a lista exata de arquivos alterados, preservação dos componentes compartilhados, estrutura SEO, links e imagens. Chromium verifica a página em 1440, 1024, 768, 390 e 320 px e compara a vitrine anterior e atual em 1440, 768 e 390 px. O fluxo existente de navegação e carrinho é testado sem mensagens reais no WhatsApp.

Capturas e resultados ficam no artefato `livros-digitais-revisao`. A PR #12 possui prévia nativa em https://deploy-preview-12--idygrafica.netlify.app/livros-digitais, conferida nas cinco larguras. As 12 páginas continuam acessíveis, os aliases da página redirecionam corretamente e URLs inexistentes continuam retornando 404. O `noindex` automático da prévia é esperado; a página não adiciona bloqueio à produção.

O responsável autorizou expressamente a publicação após concluir o refinamento e os testes. A integração ocorrerá somente com a prévia validada.

## Fotografias

Licença Pexels: https://www.pexels.com/license/ (uso comercial em sites permitido; fotos apresentadas como ilustrativas, sem alegação de autoria/produção IDY).

- Livros: https://www.pexels.com/photo/open-books-with-printed-pages-9247607/
- Materiais de estudo: Ahmet Polat, https://www.pexels.com/photo/books-and-spiral-notebook-5226071/
- Publicações/catálogos: alleksana, https://www.pexels.com/photo/a-stack-of-open-magazines-4271613/

Os arquivos editoriais legados foram inspecionados: um deles, apesar do nome, mostra blocos de pedidos; foi descartado nesta página, sem alterar o arquivo original ou seu uso nas demais páginas.

A primeira validação passou com a estrutura nova. A revisão visual identificou imagens legadas inadequadas; a seleção foi corrigida e a segunda execução confirmou fotos carregadas na prévia real, sem erros de JavaScript ou rolagem horizontal. O botão móvel do menu foi ocultado no computador apenas nesta página. O workflow também verifica o noindex da prévia, o sitemap/robots e que a produção segue com a página anterior.

## Refinamento solicitado: mais presença da marca e exposição dos serviços

A abertura foi refinada com azul e verde da IDY, assinatura “Sua ideia no papel certo!”, logotipo oficial na composição e fotografia editorial neutra. Os arquivos originais de identidade permanecem intactos. A faixa azul reforça os diferenciais, e três atalhos com âncoras reais dão acesso direto aos grupos de impressão, sem criar novas URLs.

Foram acrescentadas três dúvidas comerciais, com respostas curtas disponíveis no HTML inicial. Os dados estruturados agora relacionam WebPage, Service e BreadcrumbList. A página continua com um único H1, canonical original, sitemap e robots preservados. A prévia segue com noindex intencional; a indexação real só poderá ser verificada após publicação e análise no Search Console.

A alteração permanece na PR #12. Após autorização expressa do responsável nesta sessão, o workflow também verificará a página pública em cinco larguras e confirmará a ausência de noindex em produção após o merge. Não há mudança de credenciais ou configurações do Netlify.
