# Comunicação Visual — prévia para aprovação

Base: main publicada `713a57053bd0697a2663978176e5d82e833ea37f`, incluindo integralmente as PRs #11, #12, #13 e #14. A única página alterada é `/comunicacao-visual`.

## Visual e conteúdo

Padrão de Livros Digitais, Serviços e Impressos: branco, azul, verde, letras maiores, elementos retos e cabeçalho/rodapé idênticos. CSS compartilhado permanece intacto; ajustes novos usam exclusivamente `.communication-page`.

Seis grupos: fachadas; placas e painéis; banners, faixas e lonas; adesivos e vitrines; sinalização interna/externa; projetos para clínicas, lojas e empresas. Conteúdo local de Porto Alegre e região. Atendimento, planejamento, criação/adaptação das artes e produção aparecem com orientações comerciais úteis, sem promessas de prazo ou capacidade.

Não há confirmação explícita de ACM ou adesivo perfurado nas páginas analisadas. As duas opções aparecem somente como consultas condicionadas à disponibilidade e à viabilidade; não são cadastradas como serviços garantidos, preços ou ofertas. Materiais, acabamentos, aplicação/instalação e condições são confirmados pela equipe.

## Fotografias e vídeo

Reutiliza arquivos existentes, sem gerar nem substituir imagens. Referência de fachada Pai & Filho identificada como referência já apresentada no site. Galeria preserva as cinco fotografias: Ótica Refletto, Inovar Imóveis, Vanderlei Pires Seguros, Studio Pilates e sinalização interna. O vídeo `assets/fachadas-trabalhos-idy.mp4` permanece com controles, reprodução inline, sem autoplay e com o mesmo poster.

Imagem de impressão do banner utiliza a fotografia já existente, apresentada com rotação CSS de 180° para permitir ler a arte na orientação correta; o arquivo original é preservado. Adesivos usam somente o recorte ilustrativo aprovado da loja, sem exibir preços da referência. Fotos de identificação não são rotuladas como exemplos de ACM ou outros materiais não confirmados.

## SEO

Um H1 e hierarquia H2/H3 sem saltos. Título, description, Open Graph e textos alternativos adequados. Canonical permanece `https://idygrafica.netlify.app/comunicacao-visual`; sitemap de 12 URLs, robots e redirects não são alterados. Conteúdo e dados estruturados WebPage, BreadcrumbList, ItemList e seis Service no HTML inicial, com descrições iguais ao texto visível. Sem avaliações, ofertas ou preços inventados. Links para Impressos, Serviços, Cortes Especiais, Portfólio e loja.

## Verificações

Workflow específico: 25 testes comerciais existentes; página local e prévia Netlify em 1440, 1024, 768, 390 e 320 px; imagens, links, WhatsApp simulado sem envio, menu móvel, âncoras, dados estruturados, robots/sitemap/canonical/redirects e preservação da galeria/vídeo. Doze comparações de pixels conferem loja, Livros Digitais, Serviços e Impressos em três larguras. Fluxo comercial da loja em seis larguras. Produção deve continuar com a versão anterior.

## Escopo e aprovação

Cinco arquivos: `comunicacao-visual.html`, `assets/comunicacao-visual.css`, `scripts/comunicacao-visual/check.mjs`, `.github/workflows/comunicacao-visual-preview.yml` e este documento. Preços, oito produtos, carrinho, WhatsApp, IA, outras páginas, imagens e configurações Netlify preservados. PR em rascunho e prévia para avaliação; sem merge nem publicação em produção até autorização expressa.
