# Criação de Sites — vitrine comercial para aprovação

Base publicada: `9108af2831824c0bcb32a6f54289479303eaed6b`, preservando todas as melhorias anteriores. Alteração exclusiva de `/criacao-sites`.

## Direção criativa

Abertura com a chamada “Sua empresa merece um site à altura”, botão verde de orçamento e três dispositivos mostrando a mesma proposta. A pessoa pode alternar entre demonstrações de site institucional, catálogo e página de campanha, sincronizadas nas telas de computador, tablet e celular. Todos os exemplos são identificados como demonstrações ilustrativas, sem inventar clientes, projetos, avaliações ou resultados.

Três formatos de site, benefícios comerciais sem promessas de resultados, quatro etapas do projeto, integração com impressos e comunicação visual, referência real à loja da própria IDY, seis perguntas frequentes e chamadas para WhatsApp ao longo da página. Escopo, preços, domínio, hospedagem, suporte e integrações são definidos no orçamento. Sem promessa de posição no Google e sem ativação de pagamentos.

Branco, azul e verde, identidade oficial em destaque, cabeçalho e rodapé padronizados. Ativa somente o item de navegação da própria página. Dispositivos usam formas gráficas em HTML, CSS e SVG leves; sem imagens externas, iframes, vídeos, novas fontes, bibliotecas de animação ou carregamento de sites de terceiros. Tablet e celular ficam posicionados para preservar a leitura do exemplo no computador. O WhatsApp flutuante é compacto somente nesta página, com o mesmo link, número e rótulo acessível, sem o balão cobrindo os exemplos.

## Movimento, funcionamento e desempenho

Entradas suaves e animações únicas na rolagem, sem movimento contínuo. Conteúdo permanece visível se JavaScript ou IntersectionObserver falhar. Respeita `prefers-reduced-motion`. Demonstrações têm seleção por teclado e estado ARIA, sem links ou botões falsos dentro das telas ilustrativas. Perguntas frequentes usam details/summary nativos. Sem JavaScript, a primeira demonstração, textos, FAQ e contatos permanecem disponíveis; o seletor de modelos é ocultado.

HTML abaixo de 50 KB, CSS específico abaixo de 35 KB e JavaScript abaixo de 5 KB. Somente o logotipo já existente é carregado como imagem. Telas e ilustrações vetoriais não adicionam downloads de fotografias ou dependências externas. Reutiliza o estilo compartilhado sem modificá-lo, com regras novas limitadas a `.web-page`.

## SEO e preservação

Título e descrição locais, H1 único, H2/H3 organizados, canonical preservado `https://idygrafica.netlify.app/criacao-sites`, sitemap/robots/redirects inalterados. WebPage, Service, BreadcrumbList e FAQPage compatíveis com o conteúdo visível; sem ofertas ou avaliações inventadas. A marcação FAQ não implica garantia de exibição especial pelo Google.

Preços, oito produtos, carrinho, WhatsApp comercial, aplicação IA, todas as demais páginas, arquivos originais de imagens e configurações Netlify permanecem intactos. Validação protege o escopo por diff e confere as fontes das páginas e componentes comerciais contra a base publicada. A home pré-renderizada é gerada somente no build de teste, sem alterar a fonte do commit.

## Testes e entrega

Workflow executa os 25 testes comerciais existentes; conferência local e Netlify em cinco larguras; troca de demonstrações em três telas, teclado, FAQ, botões, links, menu móvel, imagens, ausência de overflow, redução de movimento e fallback sem JavaScript. Confere dados estruturados, canonical, sitemap, robots, aliases e acesso às 12 páginas. Executa navegação e carrinho da loja em seis larguras. WhatsApp usa destino simulado, sem mensagens reais. Capturas e relatório ficam como artefato da execução.

Seis arquivos: `criacao-sites.html`, `assets/criacao-sites.css`, `assets/criacao-sites.js`, `scripts/criacao-sites/check.mjs`, `.github/workflows/criacao-sites-preview.yml` e este documento. PR em rascunho e prévia para avaliação. Não fazer merge nem publicar em produção antes de autorização expressa.
