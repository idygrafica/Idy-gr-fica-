# Loja na página inicial

Integração da loja já desenvolvida (`loja-idy`, commit local 221a4ff) no site oficial. O único arquivo preexistente substituído é `index.html`. Código e estilo da loja ficam em `assets/loja/`, sem alterar os estilos e scripts das outras páginas. Os oito produtos, pesquisa, categorias, opções e carrinho foram reaproveitados. Apenas A3 colorida em sulfite comum tem preço aprovado: R$ 3,00 por face e R$ 6,00 por folha frente e verso. Os demais produtos são solicitações de orçamento, sem preço inventado ou cobrança online.

Metadados originais da página inicial preservados (título, descrição, canonical, Open Graph e dados estruturados). robots, sitemap, regras Netlify, todas as demais páginas e imagens originais ficam idênticos. O menu institucional está disponível no rodapé da nova página inicial; todas as rotas existentes continuam acessíveis. O atendimento permanece em https://atendimento-idy.netlify.app/ e seu repositório não é alterado.

## Prévia e validação

Branch `codex/loja-na-pagina-inicial`. O workflow `loja-inicio.yml` verifica os hashes de todos os arquivos anteriores, os 16 testes de cálculo, navegação institucional e as interações da loja em Chromium. As capturas e os relatórios ficam no artefato `loja-inicio-previas-e-testes`. Nenhum teste envia mensagens reais ao WhatsApp ou inicia conversas na IA. O workflow não contém operação de deploy.

A comparação visual deve ser feita entre `assets/loja/referencia-aprovada.jpg` e as capturas, antes de integrar à main. Diferenças comerciais deliberadas: carrinho inicia vazio; preços não aprovados ficam sob orçamento; não há pagamento automático. Prévia nativa do Netlify, quando habilitada, fica vinculada à PR e não substitui a produção.

## Reversão

Versão anterior completa: `ee009bc6882ff0e81fb59237d233c417899eef2e`. Branch de segurança: `backup/inicio-antes-loja-20261025`.

Para restaurar rapidamente o código após integração, crie uma branch a partir da main, restaure `index.html` a partir da branch de segurança e integre o revert. Os arquivos novos podem permanecer sem serem carregados; páginas, rotas e imagens anteriores não foram alteradas. Para reversão imediata da publicação, republicar o deploy anterior no painel Netlify, mantendo o projeto existente.

Não integrar/publicar antes dos testes e da inspeção visual. A existência de uma branch, artefato ou URL presumida não comprova deploy. Confirmar a URL pública e o conteúdo publicado após a liberação.
