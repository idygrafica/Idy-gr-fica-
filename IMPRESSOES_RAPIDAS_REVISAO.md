# Impressões Rápidas — revisão com referência recebida

Base preservada: `idygrafica/Idy-gr-fica-`, main `2e7212f674c0235b62c1d95c405e9547ec408d5a`.
Branch: `codex/impressoes-rapidas`. PR de rascunho #2. Sem merge e sem publicação.

## Referência visual

Referência recebida: `1000214611.jpg`. A composição utiliza HTML e CSS reais: destaque de A3 e A4; slogan; quatro diferenciais; mascote oficial e Xerox; três cartões de serviços; cinco etapas de pedido; faixa final com chamada para todos os serviços.

A referência não é usada como imagem da página nem foi recortada para construir o site. As ilustrações de papéis, currículo e canetas são elementos HTML/CSS independentes; nas canetas o logo utilizado é o arquivo original da IDY. O mascote permanece o original, na pose disponível no projeto. Nenhum logo ou mascote foi redesenhado.

Foram corrigidos os erros escritos na referência: o equipamento é identificado como **Xerox Color 560**, e o slogan é **DA PRIMEIRA FOLHA À SUA PRÓXIMA GRANDE IDEIA!**. Não é usada a palavra “NOVA” nem foi incluída a alegação de seis cores sem confirmação técnica.

Cabeçalho, rodapé, fontes e CTA azul “Orçamento com IA” seguem o site original. A referência apresenta um cabeçalho diferente; ele não foi aplicado porque a instrução pede preservar o cabeçalho atual. Os estilos da nova página são exclusivos e não modificam arquivos compartilhados.

## Arquivos originais e atendimento

- Logo: `assets/logo-idy-grafica.png`, intacto.
- Mascote: `assets/mascote-idy.png`, intacto.
- Impressora: foto de catálogo da Xerox Color 560, fonte https://www.abdofficesolutions.com/products/xerox-color-560 . Não representa uma foto da máquina da IDY.
- WhatsApp: +55 51 98168-7562, com mensagem preenchida e envio pelo aplicativo do cliente.
- E-mail: idygrafica@gmail.com, com assunto e informações iniciais preenchidos.
- Orçamento com IA: integração atual https://atendimento-idy.netlify.app . O projeto separado não foi alterado.

Atendimento exclusivamente online: envio do arquivo, orçamento, pagamento, produção e retirada somente após aviso de que está pronto. Não há promessa de prazo imediato nem valores inventados.

## Integração e preservação

Rota `/impressoes-rapidas`, acesso pelo catálogo de Serviços e sitemap. Title, description, canonical, Open Graph e dados estruturados de Service, WebPage e BreadcrumbList.

`index.html`, imagens originais, `assets/style.css`, `assets/mobile-phone-reference.css` e `assets/app.js` permanecem iguais à base. As regras específicas da rota não alteram o destino das outras páginas.

## Ajustes finais solicitados na revisão

A composição aprovada foi mantida. A etiqueta da Xerox tem espaço lateral reservado no celular para não ficar atrás do WhatsApp na captura inicial. No celular, os textos principais de leitura têm no mínimo 14px, a apresentação tem 16px e as notas de pedido têm 13px. Foram ampliados os espaçamentos entre diferenciais e etapas, a chamada principal tem altura mínima de 56px e os outros botões têm área de toque mínima de 44px.

A apresentação destaca pequenas tiragens, impressões coloridas e preto e branco, qualidade profissional com a Xerox Color 560 e atendimento personalizado. O rodapé exclusivo desta página inclui Instagram @idygrafica, com o endereço oficial https://www.instagram.com/idygrafica/ .

O CTA da IA mantém o endereço existente. A validação faz apenas GET de disponibilidade da página pública e verifica o clique abrindo o destino correto. Não inicia conversa, não envia arquivos e não altera o projeto da IA. WhatsApp e Instagram têm os destinos de abertura verificados no navegador, sem envio de mensagens ou interação com contas.

A navegação continua por Serviços, com página independente. Nenhuma alteração foi feita na página inicial ou nos arquivos compartilhados.

## Conferência final antes da publicação

Layout visual aprovado em `5bdc1e5d34e8b4f0c266393d8362a9ce412b26b9`. A conferência compara o corpo HTML e o CSS da nova página com essa versão; somente a meta description foi refinada para explicitar gráfica rápida em Porto Alegre, A3, A4 e currículos. O robots.txt continua permitindo o rastreamento e passa a indicar o sitemap.

Os quatro links de WhatsApp são clicados individualmente (chamada inicial, chamada final, rodapé e flutuante). Também são testados o CTA da IA, Instagram, CTA final de Serviços e navegação real pelo menu Serviços até a nova página, com abertura do menu no celular/tablet. Nenhuma mensagem é enviada.

A validação de SEO confere title, description, canonical, dados estruturados, sitemap, ausência de noindex, robots.txt e as regras de rota. A indexação real pelo Google só poderá ser conferida após a publicação e o rastreamento; a prévia local não está publicada nem foi enviada ao Google.

Sem merge nem publicação nesta etapa. A autorização final do responsável continua necessária.

## Testes e capturas

O workflow de prévia roda apenas na branch de trabalho e não usa credenciais nem comandos Netlify. Verifica dez larguras entre 320 e 1440 pixels, rota/TOML/sitemap, imagens, texto dentro da tela, ausência de imagem cobrindo o texto principal, WhatsApp, e-mail, CTA da IA, menu mobile/tablet, três cartões e cinco etapas. A home é comparada em bytes e capturas contra a base original.

Capturas desktop/mobile e relatório ficam no artifact `impressoes-rapidas-preview`. As regras de rota são reproduzidas em servidor local de teste; nenhum deploy foi realizado. Os resultados da composição adaptada à referência e o link da execução estão registrados na descrição da PR #2.
