# Impressões Rápidas — prévia para revisão

## Análise do projeto antes da implementação

Base: `idygrafica/Idy-gr-fica-`, main `2e7212f674c0235b62c1d95c405e9547ec408d5a`.
O site é estático, com páginas HTML na raiz, imagens em `assets/`, estilos compartilhados em `assets/style.css` e `assets/mobile-phone-reference.css` e menu/WhatsApp em `assets/app.js`. O Netlify publica a raiz. Não há framework nem instalação de dependências de produção.

Logo oficial: `assets/logo-idy-grafica.png`. Mascote oficial: `assets/mascote-idy.png`. Ambos reutilizados, sem alteração. Mantidos cabeçalho, rodapé, fontes, cores e botão azul “Orçamento com IA”, que abre a integração existente. Não foram alterados `index.html`, estilos/JavaScript globais ou o projeto `atendimento-idy`.

## Implementação

- Página HTML real em `/impressoes-rapidas`, com regra de rota específica no Netlify e URL canônica.
- CSS exclusivo da página, sem alterar os arquivos globais.
- Slogan solicitado, serviços A3/A4 coloridos e preto e branco, currículos/documentos, uma única folha, pequenas tiragens e canetas personalizadas.
- Atendimento exclusivamente online: arquivo por WhatsApp/e-mail, orçamento, pagamento e retirada somente após aviso.
- WhatsApp +55 51 98168-7562 e e-mail idygrafica@gmail.com, usando os contatos existentes. Não há disparo automático de mensagem.
- Acesso pelo catálogo/menu de Serviços (`servicos.html`) e inclusão no sitemap, sem modificar a página inicial.
- SEO com title, description, canonical, Open Graph e dados estruturados de Service, WebPage e BreadcrumbList.

## Referência e imagem da impressora: pendência de revisão visual

A imagem de layout aprovada mencionada pelo usuário não foi recebida nesta conversa nem está disponível no repositório. Esta composição é uma **prévia inicial**, montada com a identidade existente; não é possível afirmar correspondência ao gabarito aprovado.

Para demonstrar a composição com uma Xerox Color 560, a prévia utiliza uma imagem de catálogo da página de produto https://www.abdofficesolutions.com/products/xerox-color-560 . Ela é externa e ilustrativa do equipamento; não é uma foto da máquina da IDY. A imagem da referência/foto original deve ser recebida para validar ou substituir esse material antes da aprovação final.

A página usa elementos HTML/CSS e arquivos individuais do logo/mascote. Não foi transformada em uma imagem única e não foram criados substitutos da identidade visual.

## Verificação e prévia

`.github/workflows/impressoes-rapidas-preview.yml` roda apenas nesta branch. Ele não utiliza credenciais nem comandos de publicação Netlify.

As verificações cobrem 320, 360, 390, 480, 620, 768, 820, 1024, 1280 e 1440 pixels, imagens legíveis/carregadas, textos dentro da tela, ausência de sobreposição entre imagens e texto do hero, abertura do WhatsApp sem envio de mensagem, destino da IA, e-mail, navegação mobile, FAQ e acesso a partir de Serviços. A home é comparada em bytes e por captura contra a base original. O sitemap XML e a configuração TOML são validados.

As capturas desktop/mobile e o relatório ficam no artifact `impressoes-rapidas-preview`. As rotas são verificadas em servidor local de teste que reproduz as regras específicas; não foi realizado deploy de teste no Netlify. Resultados efetivos serão registrados após a execução.

Sem merge e sem publicação. A aprovação visual depende do envio do gabarito.
