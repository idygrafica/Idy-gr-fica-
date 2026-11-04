# Impressão de Apostilas em Porto Alegre — prévia

Base: `f7f37913811abfc953260faa136eefbd24b4657d`. Proposta em branch separada, sem merge ou publicação em produção.

## Página e conteúdo

URL canônica proposta: `https://idygrafica.netlify.app/impressao-de-apostilas`.

O repositório atual não contém uma página exclusiva de apostilas. Existe uma seção em Livros Digitais, que permanece como apresentação geral de livros, apostilas e catálogos. A nova página aprofunda especificamente o serviço de apostilas: formatos A4/A5, papel 75 g, cores ou preto e branco, pequenas tiragens, preparação do PDF e informações para orçamento. O conteúdo foi desenvolvido a partir das informações fornecidas pelo responsável, sem copiar concorrentes.

O título é “Impressão de Apostilas em Porto Alegre | IDY Gráfica”, com H1 próprio, descrição exclusiva, Open Graph e dados estruturados WebPage, Service e BreadcrumbList. Não há Product, preço, avaliação ou oferta fictícia. As perguntas frequentes são conteúdo legível, sem prometer resultados avançados do Google.

## Identidade e imagens

A página reutiliza a navegação, o rodapé e o padrão branco, azul e verde de Livros Digitais. O CSS adicional atua apenas em `.apostilas-page`; as folhas compartilhadas não foram alteradas. A fotografia real da Xerox Color 560 já existente é reutilizada sem cortes ou deformação. Não foi criada ou utilizada imagem artificial de apostilas como se fosse trabalho da IDY. Não foram adicionados servidores de imagens externos, bibliotecas de interface ou um novo sistema de atendimento.

Não foi encontrada no acervo analisado uma fotografia de apostilas produzidas pela IDY com origem confirmada. A página funciona com a fotografia do equipamento disponível; uma foto autêntica de apostilas poderá ser considerada em outra etapa, se o responsável desejar.

## Atendimento e informações comerciais

- Botão “SOLICITAR ORÇAMENTO DE APOSTILAS”, para `https://wa.me/5551981687562`, com a mensagem exata: “Olá! Gostaria de solicitar um orçamento de impressão de apostilas na IDY Gráfica.”
- Envio de PDF pelo WhatsApp ou e-mail `idygrafica@gmail.com`; a página esclarece que não recebe anexos diretamente.
- Valores sob consulta, conforme exemplares, páginas, cores e acabamento. Não há tabela de preços nova.
- Acabamentos, viabilidade e prazo dependem de confirmação da equipe; não foram prometidas técnicas ou equipamentos adicionais.
- Travessa da Luz, 845 — Porto Alegre/RS. Atendimento exclusivamente online; retirada após aviso e combinação, sem balcão presencial.

## Descoberta e URLs

- Sitemap passa de 15 para 16 URLs, preservando todas as anteriores.
- Links descritivos acrescentados em Impressos e na seção de apostilas de Livros Digitais; links anteriores preservados.
- Link de retorno da página nova para as páginas relacionadas e para a loja. Nenhuma alteração da home.
- Alias `/impressao-de-apostilas.html` redireciona por 301 para a URL canônica, seguindo o padrão do Netlify existente.
- Robots e permissões de Googlebot/OAI-SearchBot permanecem iguais. Conteúdo completo entregue no HTML inicial.
- A prévia Netlify mantém seu noindex automático e canonical de produção; isso não deve ser removido para tentar indexar a prévia.

## Preservação e verificações

Antes da abertura da PR, os 100 testes comerciais existentes passaram: carrinho/A3 (16), canetas (9), produtos digitais (25), preços aprovados (32) e pastas (18).

A comparação com a base confirmou 179 arquivos existentes intactos. Entre os arquivos existentes, somente Impressos, Livros Digitais, sitemap e configuração de redirecionamentos recebem os acréscimos descritos. As dez fichas de produto, preços, imagens existentes, carrinho, buscas, categorias, WhatsApp e IA não são alterados.

O workflow dedicado confere preservação, build idempotente, as 16 URLs, JSON-LD, canonical, robôs, redirecionamento, links, FAQ, navegação móvel, WhatsApp interceptado sem envio e fotos em 1440, 1024, 768, 390 e 320 px, localmente e na prévia. Também confere a loja em computador/celular e a nova página sem JavaScript. Capturas e relatório ficam no artifact `apostilas-previa-e-testes`, e os resultados finais serão registrados na PR.

As rotinas antigas de outras reformulações ainda usam comparações congeladas com versões anteriores, conforme já identificado nas PRs #29 e #30. Não foram alteradas nesta proposta. O resultado do workflow dedicado deve ser distinguido desses alertas históricos; nenhuma falha funcional será ocultada.

## Publicação e Google

Esta entrega é somente uma prévia para aprovação. Não altera a produção, os projetos de atendimento ou outras PRs abertas. Após eventual autorização para publicar, será necessário conferir a URL pública e solicitar a indexação no Search Console autenticado. Os testes técnicos não confirmam indexação, aprovação oficial do Google nem posicionamento nas buscas.
