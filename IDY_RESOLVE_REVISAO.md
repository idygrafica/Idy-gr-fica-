# IDY Resolve — proposta para aprovação

## Experiência

Abertura “VOCÊ IMAGINA. A IDY RESOLVE.” com os arquivos oficiais do logotipo, mascote e Xerox, sem alterações nas imagens. Três maneiras de começar, sete situações do cliente e orientação com links para as páginas existentes. A compra direta permanece disponível pelo atalho “Ir direto para a loja”, pela busca no cabeçalho e pelo carrinho original.

O pedido só exige uma descrição. Quantidade aproximada, medidas, situação da arte e detalhes são opcionais. O guia funciona no navegador, sem nova IA, banco de dados, rastreamento ou upload. Prepara a mensagem para o cliente revisar e enviar no WhatsApp comercial. Arquivos são anexados na conversa, sem simular envio. O resumo pode ser copiado para o atendimento com IA existente.

## Integração existente, conferida antes de implementar

Fonte de `atendimento-idy` auditada em `85406bda84db2e144e5e60a18199962a8bb11d8d`. Há cadastro e anexos (PDF, PNG e JPEG, limite de 8 MB), mas não há suporte a preenchimento do pedido por URL. Por isso, não se acrescenta um parâmetro de contexto que seria ignorado. O cliente abre o atendimento existente e cola o resumo; cadastro e anexos acontecem na aplicação atual. Nenhum arquivo ou função dessa aplicação foi alterado.

Os testes só fazem GET na página e no endpoint público de saúde do atendimento. Não cadastram clientes, enviam conversas ou anexos, acionam atendentes nem geram notificações reais.

## Preservação

Base: `92583ed7e5615c28aed7350897d80c4d6e297064` (PR #17 publicada). Catálogo pré-renderizado, imagens, oito produtos, preços, opções, carrinho, busca, categorias, cabeçalho e rodapé mantidos. O menu de categorias fica junto ao catálogo, acessível pelo atalho da abertura. Nenhum preço é calculado pelo guia.

A3 mantém R$ 3,00 por face e R$ 6,00 frente e verso, sem descontos. Canetas DTF UV mantêm os valores aprovados para 100, 500 e 1.000 unidades; demais quantidades seguem sob orçamento. As onze páginas internas, arquivos SEO e redirecionamentos permanecem iguais. A URL canônica e o sitemap oficial não mudam.

## Validação reproduzível

Workflow `idy-resolve-preview.yml`: 25 testes comerciais existentes, dez testes do resumo/WhatsApp e destinos dos exemplos, pré-renderização do catálogo, verificação de fontes protegidas e navegação em Chrome local e no Netlify em 1440, 1024, 768, 390 e 320 px. Auditoria axe WCAG A/AA dos novos componentes; rótulos, teclado, validação, cópia e alternativa manual, ausência de JavaScript, redução de movimento e ausência de rolagem horizontal. Testes da loja original em seis larguras. Todas as mensagens WhatsApp são interceptadas e simuladas.

CSS e módulo JS próprios, sem bibliotecas novas no navegador. Imagens adicionais reutilizam fotografias existentes e carregam sob demanda. Movimento leve de entrada, uma única vez, com respeito à preferência de movimento reduzido.

## Publicação

Somente branch separada e Pull Request em rascunho, com Deploy Preview do Netlify. A proteção `noindex` da prévia é intencional. Não há merge nem atualização da produção antes da aprovação do usuário. Capturas e relatórios são anexados pelo workflow à PR.

## Segunda proposta — produtos ganham vida

A abertura ganha cinco cenas: cardápios/divulgação, fachada, publicação, adesivos e personalização. Os controles de produto são abas com navegação por teclado; tocar no exemplo ou na chamada abre o mesmo guia com descrição sugerida. Informações já digitadas são preservadas. Os oito produtos e o carrinho não se tornam demonstrações: continuam sendo a loja original.

Origem das imagens: `el-patron.jpg`, `fachada-pai-filho.png` e `rotulos-etiquetas-personalizadas.webp`, já presentes na galeria do repositório. A montagem do material de gastronomia e dos rótulos é identificada como ilustrativa. A fachada compara um esboço ilustrativo com uma foto existente; não afirma mostrar o antes e depois de uma obra. Livro e camiseta são demonstrações ilustrativas desenhadas em CSS/SVG, sem cliente fictício, promessa de capa dura ou de técnica disponível. Materiais, acabamentos e viabilidade são confirmados no orçamento. Não se anuncia fabricação de caixas de pizza.

A fotografia da fachada pode ser revelada com um controle deslizante. O livro pode ser aberto, a etiqueta aplicada e a estampa revelada. A arte de gastronomia entra em perspectiva como material impresso. Não há carrossel automático, animação em loop, vídeo, biblioteca extra nem solicitações a serviços de IA. Movimento reduzido troca os estados imediatamente. As imagens secundárias carregam sob demanda quando a cena é escolhida.

A validação passa a conferir cinco cenas, as cinco entradas de orçamento, conservação do texto do cliente, abas por teclado, controle deslizante, abertura do livro, aplicação e remoção da estampa, acessibilidade em cada cena e alternativa sem JavaScript. As capturas incluem a abertura no computador e no celular e cada cena da vitrine. A barra técnica do Netlify é ocultada somente nas capturas da automação.
