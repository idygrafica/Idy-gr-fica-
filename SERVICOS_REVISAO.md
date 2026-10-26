# Serviços — padronização com Livros Digitais

Base: main `d609a37ec9eae6b890929af2d2f4f165159248a4` (PR #12 publicada).

A página anterior usava um título e sete cartões, sem separar os grupos comerciais e com imagens que já traziam textos de outros layouts. A nova organização utiliza a identidade publicada em Livros Digitais: branco, azul, verde, tipografia ampliada, linhas retas e logotipo oficial em destaque.

## Organização e condições comerciais

- Impressões digitais A4 e A3, impressões rápidas e pequenas tiragens.
- Cartões de visita, panfletos e materiais publicitários.
- Livros, apostilas e catálogos, com link para a página publicada na PR #12.
- Adesivos e rótulos personalizados.
- Personalização de camisetas, DTF e DTF UV **sob consulta**. Técnica e viabilidade dependem da confirmação da equipe. A loja atual já possui camisetas sob orçamento e canetas DTF UV; não são anunciadas novas capacidades técnicas.
- Comunicação visual, banners, lonas e fachadas. Não há especificações ou promessas de instalação, acabamento ou capacidade; a equipe confirma as condições.
- Comandas, blocos e formulários e materiais gráficos para empresas, em seção própria.
- Links existentes para impressões do dia a dia, cortes especiais, criação de sites e portfólio preservados.

Todos os botões comerciais usam o mesmo WhatsApp (51) 98168-7562. Não há preços, descontos ou prazos novos.

## Imagens e identidade

- Logotipo oficial e Xerox Color 560 são os arquivos originais, sem edição.
- Fotografia ilustrativa de produção: `assets/impressao-grafica-porto-alegre.webp`, já existente.
- Rótulos, identificação Refletto e blocos: fotografias já existentes no projeto, inspecionadas visualmente.
- Cartões e brindes: mesmos recortes CSS e imagem de referência aprovada da loja; nenhum arquivo de produto foi modificado.
- Fotografia editorial: Ahmet Polat / Pexels, já utilizada em Livros Digitais: https://www.pexels.com/photo/books-and-spiral-notebook-5226071/ . Licença: https://www.pexels.com/license/ . Imagem ilustrativa, sem alegação de produção pela IDY.

## Preservação e SEO

A página carrega o CSS publicado de Livros Digitais sem modificá-lo, mais um complemento exclusivo com seletores `.services-page`. Cabeçalho e rodapé são os componentes da página de referência. Não há alteração de outras páginas, estilos compartilhados, fotos existentes, catálogo, preços, carrinho, telefone, atendimento com IA ou configuração do Netlify.

URL `/servicos`, canonical e metadados alinhados ao conteúdo. Um H1, seções H2 e serviços H3. Conteúdo e oito grupos de serviços presentes no HTML, com WebPage, ItemList, Service e BreadcrumbList. Sitemap de 12 URLs, robots e redirecionamentos preservados; nenhuma nova rota criada. O noindex automático da prévia é esperado. Indexação real no Google não é declarada.

## Verificação e entrega

Workflow específico da PR: 25 testes comerciais existentes, comparação do diff com a main, dez verificações de Serviços (1440, 1024, 768, 390 e 320 px, local e Netlify), links, imagens, navegação, WhatsApp e SEO. Comparação visual da loja e de Livros Digitais em 1440, 768 e 390 px. Fluxos completos da loja em seis larguras. Testes não enviam mensagens reais nem pedidos.

Capturas e relatórios no artefato `servicos-revisao-e-previas`. A URL da prévia nativa será adicionada à PR após a criação.

**Apenas prévia para aprovação: não fazer merge ou publicar em produção sem nova autorização.**

## Finalização de conteúdo e SEO na própria PR #13

Preserva o layout, estilos, fotos, cabeçalho, rodapé e os destinos de orçamento já revisados. A estrutura principal continua com um H1, H2 por seção e H3 por serviço, sem saltos de nível no conteúdo. Os títulos dos cartões recebem IDs para identificação acessível pelo respectivo artigo.

As descrições agora explicam o que informar para orçamento de cada material: formato e quantidade, faces impressas, páginas e exemplares, arte pronta, superfície de aplicação ou campos do formulário. Porto Alegre permanece no H1/metadados e aparece naturalmente no contexto de atendimento local. Links para páginas existentes recebem textos mais descritivos, sem novas rotas ou alteração do WhatsApp.

O JSON-LD mantém apenas WebPage, ItemList, Service e BreadcrumbList; os oito serviços recebem descrições iguais aos parágrafos visíveis. Não são acrescentados preços, avaliações, promoções, FAQ ou capacidades não confirmadas. Canonical, sitemap, robots e regras de redirecionamento permanecem idênticos.

O validador verifica a hierarquia principal, correspondência entre dados estruturados e texto, destinos internos e preservação dos estilos e imagens em relação à versão anterior da PR. A prévia continua protegida por noindex automático; não houve publicação em produção.
