# Impressos — prévia para aprovação

Reformulação exclusiva de `/impressos`, partindo da `main` publicada `c8a070fc2d74a09846b31845a24516daf1215465` (PR #13).

## Apresentação

Fundo branco, azul predominante, detalhes verdes, letras maiores e elementos retos. Reutiliza o CSS de Livros Digitais sem alterá-lo, com complemento exclusivo `.impressos-page`. Cabeçalho, rodapé, logotipo e widget WhatsApp são idênticos aos de Serviços e Livros Digitais.

Seis blocos comerciais: impressões digitais A4/A3, cartões de visita, panfletos/folders, comandas, blocos/formulários e materiais personalizados. Orientações de orçamento cobrem material, formato, quantidade, faces, arquivo, papel e acabamento. Opções não confirmadas ficam sob consulta. Nenhum preço novo ou promessa de prazo/capacidade.

## Imagens

Somente imagens já existentes: fotografia ilustrativa de produção gráfica (identificada como ilustrativa), fotografia original da Xerox preservada inteira e sem deformação, foto de comandas do Restaurante Boa Vista e recortes exclusivamente fotográficos da referência aprovada da loja. Os recortes exibem apenas cartões, impressos coloridos, blocos e pastas, sem os preços da referência. Nenhuma nova versão da identidade ou imagem de produto é gerada.

## SEO e navegação

Um H1, seções H2 e serviços H3; textos úteis para Porto Alegre e região no HTML inicial. Título, description e Open Graph coerentes. Canonical continua `https://idygrafica.netlify.app/impressos`; sitemap, robots e redirecionamentos existentes não mudam. Dados estruturados WebPage, BreadcrumbList, ItemList e seis Service com descrições iguais ao texto visível, sem preços, avaliações ou ofertas inventadas. Links para produtos reais da loja, Impressões Rápidas, Livros Digitais, Serviços e Portfólio.

## Verificação automatizada

O workflow específico executa os 25 testes comerciais existentes, confere a nova página localmente e na prévia Netlify em 1440, 1024, 768, 390 e 320 px, imagens, WhatsApp com destino simulado e zero envios, menu móvel, links e fragmentos dos produtos, hierarquia, dados estruturados, canonical, sitemap e proteção noindex exclusiva da prévia. Compara pixels da loja, Livros Digitais e Serviços com a base em três larguras e executa a navegação/carrinho em seis larguras. Confere que a produção mantém a página anterior.

## Escopo e publicação

Somente cinco arquivos: `impressos.html`, `assets/impressos.css`, `scripts/impressos/check.mjs`, `.github/workflows/impressos-preview.yml` e este documento. Preços, oito produtos, carrinho, imagens originais, outras páginas, atendimento IA e configuração Netlify permanecem intactos. A PR deve permanecer em rascunho para revisão. Sem merge e sem publicação em produção até nova autorização.
