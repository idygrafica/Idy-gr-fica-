# Migração das referências de SEO para idygrafica.com.br

Base: `c6869c7007cc30b6b892760aab9ac4e5fc7ad56f`. Repositório existente: `idygrafica/Idy-gr-fica-`. O endereço informado sem o hífen final retorna 404; foi usado o repositório do site já trabalhado nesta conversa.

Domínio principal solicitado: **https://idygrafica.com.br**. Proposta em branch separada, para aprovação, sem merge ou publicação em produção.

## Alterações

- As 16 URLs do sitemap usam o domínio novo, preservando caminhos e ordem.
- A diretiva Sitemap do robots.txt passa a apontar para `https://idygrafica.com.br/sitemap.xml`. As permissões de Googlebot/OAI-SearchBot permanecem iguais.
- Os 16 HTML têm canonical, Open Graph, imagens sociais, URLs e IDs dos dados estruturados migrados para o novo domínio. Os títulos e descrições existentes foram preservados.
- Os geradores de catálogo e das páginas de produtos configuráveis usam o domínio novo, evitando que um próximo build reintroduza os endereços antigos.
- As verificações ativas de SEO, as auditorias públicas e os alvos de produção dos workflows acompanham o novo domínio. As listas de hosts das verificações de publicação aceitam o domínio novo e mantêm o alias técnico conhecido do projeto Netlify.
- As URLs próprias de Deploy Preview do Netlify continuam válidas; elas não são URLs canônicas de produção.

As referências antigas em relatórios históricos, snapshots JSON e arquivos ZIP foram conservadas como evidência das versões anteriores. Elas não fornecem canonical ou sitemap para as páginas atuais. Não houve substituição indiscriminada em arquivos de outros projetos.

## Preservação

O corpo completo de cada um dos 16 HTML permanece byte a byte idêntico ao da base: layout, imagens, textos comerciais, cabeçalho, rodapé, produtos, preços, formulários e links funcionais não foram modificados. A comparação do HTML completo permite somente a troca literal do domínio nos metadados.

Todo o código em `assets/`, os dez produtos, tabelas de preços, motor de cálculo, carrinho, busca, categorias, WhatsApp e links para o atendimento com IA permanecem intactos. Não foram alteradas credenciais, DNS, configurações de conta Netlify, dados de clientes ou projetos independentes. O trabalho local ainda não publicado do destaque de apostilas na home não foi incluído nesta PR.

O arquivo netlify.toml e seus redirecionamentos de caminhos permanecem iguais. Não foram acrescentadas regras globais que poderiam redirecionar as prévias para produção. A auditoria separada registra o comportamento atual do domínio principal e dos aliases, sem alterar o painel de hospedagem.

## Verificações

- Cópia de trabalho validada contra os hashes dos 188 arquivos da base atual, antes de editar.
- 100 testes comerciais existentes aprovados localmente: carrinho/A3 (16), canetas (9), produtos digitais (25), preços aprovados (32) e pastas (18).
- Comparação de preservação de todos os arquivos existentes, com alterações limitadas a substituições de domínio e à inclusão do novo domínio nas listas de hosts de verificação.
- Sitemap com 16 URLs únicas, mesmos caminhos; um canonical por página; JSON-LD legível e sem referência antiga; permissões de robôs preservadas.
- Build idempotente: a geração não restaura o domínio antigo nem modifica o corpo comercial das páginas.
- Workflow dedicado: 16 rotas e aliases .html, sitemap, robots, canonical e loja em computador/celular, localmente e na prévia. WhatsApp interceptado sem envio real. Capturas e relatório em `dominio-seo-previa-e-testes`.
- Auditoria HTTP independente registra DNS/TLS, status, canonical e redirecionamentos do domínio público antes da aplicação da PR. O resultado atual será registrado na PR; problemas externos não são apresentados como correções já publicadas.

A revisão dos logs da PR #32 confirmou seis falhas em rotinas antigas: quatro rejeitavam o workflow de apostilas por compararem com versões anteriores, DTF rejeitava um workflow atualizado contra seu snapshot, e Serviços falhava ao instalar Playwright 1.55 no Ubuntu 26.04 de ubuntu-latest. Nesta branch de migração, essas revisões visuais históricas são direcionadas à suíte dedicada atual, que verifica os 16 corpos HTML, todos os arquivos existentes, o build, 100 testes comerciais e a loja em computador/celular. As seis rotinas continuam disponíveis para suas demais propostas; suas asserções não foram removidas. O runner de Serviços foi fixado em ubuntu-24.04, compatível com a versão de Playwright usada.

## Aprovação e publicação

Esta PR não migra ou publica o site automaticamente. A produção permanece na branch principal atual até aprovação e merge pelo responsável.

Após aprovar e publicar, conferir as 16 páginas no domínio principal e o sitemap servido, além de revisar os redirecionamentos de aliases no Netlify, se necessário. No Search Console, usar a propriedade correspondente a `idygrafica.com.br` e o sitemap novo. Não foi enviada solicitação de indexação ou alteração em cadastro externo nesta tarefa.

As verificações técnicas não garantem indexação, posição em buscas ou recomendações no ChatGPT.

## Diagnóstico de DNS e HTTPS

A auditoria somente leitura também consulta A, AAAA, CNAME, CAA e NS. No runner público, confere os certificados por endereço IPv4 com SNI e validação de certificado habilitada; se houver proxy configurado, essa etapa direta é omitida, sem contorná-lo. As falhas externas são registradas separadamente das verificações de código. DNS, domínio principal, aliases e certificados da conta Netlify não foram modificados. Os resultados atuais e a ação manual estritamente necessária são registrados na PR.
