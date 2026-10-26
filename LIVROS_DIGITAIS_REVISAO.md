# Livros Digitais: reformulação comercial para aprovação

Base: `9e20e9009c503b8e1854689e49c02521d85b048e`, versão mais recente da main ao iniciar.

A página antes destacava uma publicação digital específica, sem apresentar os três grupos de impressão editorial. Agora a apresentação separa livros, apostilas e catálogos, explica como pedir orçamento e mantém a publicação online como exemplo secundário.

- Estilo branco, azul e detalhes verdes; tipografia ampliada, elementos retos, novo CSS carregado apenas nesta página.
- Textos sem preços, prazos ou descontos inventados. Espiral, grampeamento e encadernações são preferências para consulta, expressamente sujeitas à confirmação de disponibilidade e viabilidade.
- Fotografias/ilustrações editoriais já existentes no repositório, identificadas como referências visuais; nenhuma imagem ou identidade da loja foi substituída.
- Cabeçalho, rodapé, script de navegação, telefone comercial e acesso ao atendimento com IA preservados.
- Seis informações para orçamento: material, formato, páginas, exemplares, cor e acabamento. Links diretos para o WhatsApp comercial, sem envio automático.
- Título, descrição, Open Graph e dados estruturados alinhados à impressão digital de livros, apostilas e catálogos em Porto Alegre. Canonical `/livros-digitais`, sitemap de 12 páginas, robots e redirecionamentos preservados.

## Validação

O workflow dedicado executa os 25 testes comerciais existentes, confere a lista exata de arquivos alterados, preservação dos componentes compartilhados, estrutura SEO, links e imagens. Chromium verifica a página em 1440, 1024, 768, 390 e 320 px e compara a vitrine anterior e atual em 1440, 768 e 390 px. O fluxo existente de navegação e carrinho é testado sem mensagens reais no WhatsApp.

Capturas e resultados ficam no artefato `livros-digitais-revisao`. A prévia nativa do Netlify será conferida após a abertura da PR. O `noindex` automático da prévia é esperado; a página não adiciona bloqueio à produção.

**Não fazer merge nem publicar em produção antes da aprovação visual do responsável.**
