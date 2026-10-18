# SEO técnico — etapa 1

Base: main 9cbb3068bcdfe31f19426658496579898694abdd, repositório institucional idygrafica/Idy-gr-fica-.
Branch: codex/seo-tecnico-etapa-1. Sem merge ou publicação.

## Escopo

Menu compartilhado nas 11 páginas, abertura/fechamento, Escape, clique externo e fechamento ao navegar ou mudar de faixa de tela. CSS isolado de navegação; nenhuma regra de hero, imagens, textos ou identidade visual da home foi copiada para outras páginas.

Cabeçalhos sem os estilos específicos da home recebem somente o encaixe dos controles no celular, para evitar que logo, IA e menu disputem o espaço. Impressões Rápidas mantém seus estilos específicos.

## URLs

Preferenciais: /, /servicos, /impressos, /impressoes-rapidas, /comunicacao-visual, /cortes-especiais, /criacao-sites, /livros-digitais, /portfolio, /contato e /sobre.

As variantes públicas foram consultadas antes da padronização. As versões sem extensão e com .html responderam HTTP 200; as versões com barra das páginas antigas redirecionaram para a URL sem extensão. Impressões Rápidas com barra também respondeu HTTP 200, com canonical sem barra.

Foram adicionadas nove canonicals e normalizados os links internos e o sitemap. Os arquivos .html continuam presentes. netlify.toml e seus redirecionamentos permanecem intactos. robots.txt já permite rastreamento e indica o sitemap, portanto permanece intacto.

## Preservação e limites

Textos comerciais, títulos, descrições, logo, mascote, Xerox, imagens, CSS visual existente e trechos de funcionamento do WhatsApp preservados. O projeto atendimento-idy não foi alterado. Não há otimização de imagens nem ampliação editorial nesta etapa.

Canonical, sitemap e links consistentes auxiliam a compreensão das URLs preferenciais pelo Google; a correção do menu beneficia a navegação. Nenhuma alteração garante indexação automática.

## Verificação

Workflow exclusivo da branch, com permissões somente de leitura e sem credenciais ou comandos Netlify. Verificações de navegação, links externos sem envio de mensagens, canonicals, sitemap/robots, comparação com a base e capturas mobile/tablet/desktop. Resultados e limitações serão registrados na PR de rascunho.
