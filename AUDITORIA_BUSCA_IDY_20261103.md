# Auditoria de visibilidade da IDY Gráfica — Google e ChatGPT

Data: 03/11/2026. Base examinada: `3e7d3a1baf70cde9d564caa93fcb7a76501110be`. Site: https://idygrafica.netlify.app/. Relatório da proposta SEO em branch separada. Após a entrega da prévia, o responsável autorizou expressamente a integração e a publicação da PR #27. A execução será registrada na PR e nos artifacts de produção.

## Resultado principal

O site já oferece uma base técnica acessível: 15 páginas no sitemap, HTML inicial com produtos e conteúdo, títulos locais em todas as páginas e nenhum bloqueio encontrado nas sondagens de acesso. Oportunidades mais claras: explicar melhor a atividade e as pequenas tiragens na abertura da loja, fortalecer ligações entre serviços e produtos, deixar inequívoco o atendimento sem balcão e corrigir posteriormente os diretórios externos com endereço antigo.

Não foi medido posicionamento real no Google nem frequência de recomendações no ChatGPT. Não há acesso conectado ao Search Console, Perfil da Empresa, logs ou WAF do Netlify. A busca exploratória desta ferramenta não trouxe páginas do domínio em consultas `site:`; isso não prova ausência de indexação. A ferramenta de abertura da busca retornou erro interno ao abrir o domínio, enquanto a auditoria HTTP conseguiu lê-lo: esse erro isolado também não comprova bloqueio ao OAI-SearchBot.

## Evidências do site publicado

| Verificação | Resultado observado |
|---|---|
| Sitemap | HTTP 200; 15 URLs canônicas, sem duplicações |
| HTML normal, Googlebot e OAI-SearchBot | 45 requisições; todas HTTP 200; conteúdo idêntico entre identificadores por página |
| robots.txt | HTTP 200; `User-agent: *` com `Allow: /`; já permite os dois buscadores |
| Indexabilidade técnica | Sem `noindex` em meta robots ou X-Robots-Tag nas 45 leituras |
| Canonical | URLs da produção presentes nas 15 páginas |
| Links internos | 341 referências auditadas; nenhum destino/fragmento quebrado encontrado |
| CSS e JavaScript diretamente referenciados no HTML | 17 recursos HTTP 200 |
| Aliases `.html` | Chegam às URLs canônicas; regras 301 preservadas no Netlify |
| URL inexistente | HTTP 404, sem redirecionamento genérico para a home |
| JSON-LD | JSON válido; WebSite, LocalBusiness, produtos, serviços e breadcrumbs já presentes em diferentes páginas |
| Páginas sem schema de página | Sobre, Contato e Portfólio não tinham essa marcação |

As sondagens enviaram os identificadores de Googlebot e OAI-SearchBot a partir do ambiente de auditoria. Não foram requisições de IPs autenticados desses robôs. Para confirmar visitas reais e eventuais bloqueios por IP, é necessário consultar logs/WAF e as faixas publicadas pelos provedores. HTTP 200, robots e canonical são condições técnicas, não confirmação de indexação ou de ranking.

O snapshot resumido está em `scripts/search-visibility/baseline-public.json`; a execução completa gera `public-audit.json` no artifact da PR. O código da auditoria é somente leitura.

## Informações confirmadas pelo responsável

- Endereço correto: **Travessa da Luz, 845 — Porto Alegre/RS**.
- Atendimento **exclusivamente online por WhatsApp e e-mail**.
- **Sem atendimento presencial de balcão**.
- Retirada dos materiais **somente após aviso e combinação com o cliente**.
- **Não divulgar horários fixos**.
- WhatsApp já usado no site: (51) 98168-7562. E-mail já usado no site: idygrafica@gmail.com.

O endereço da produção já está correto no site e no LocalBusiness. A proposta o mantém. Não foram incluídos CEP, coordenadas, horário, fundação, equipe ou outras informações não confirmadas. O widget “Estamos online!” foi proposto como “Atendimento online”, evitando sugerir disponibilidade humana em tempo real sem integração que a comprove. A indicação “WhatsApp e fone” no Contato foi ajustada para “WhatsApp”, conforme os canais confirmados. O atendimento com IA permanece separado e funcional.

## Cadastros externos com Rua Umbu, 435 — corrigir posteriormente

| Plataforma e referência observada | Informação encontrada | Próxima ação do responsável |
|---|---|---|
| [CNPJ.biz — ficha IDY Gráfica](https://cnpj.biz/07226393000103) | Rua Umbu, 435, Passo da Areia, Porto Alegre | Conferir a origem cadastral e solicitar revisão pelo procedimento da plataforma; não alterar automaticamente registro legal |
| [Econodata — listagem em Porto Alegre](https://www.econodata.com.br/empresas/rs-porto-alegre/impressao-de-material-de-seguranca-c-18121) | Linha da IDY Gráfica com Rua Umbu, 435 | Revisar a ficha vinculada à empresa e pedir atualização dos dados operacionais |
| [Econodata — outra listagem da mesma base](https://www.econodata.com.br/empresas/todo-brasil/impressao-de-material-de-seguranca-c-1812100/ate-360-mil) | Repete Rua Umbu, 435 | Tratar como repetição da mesma plataforma, sem criar outro cadastro |
| [BrazilGuide — referência em lista de empresas relacionadas](https://brazilguide.net/c/roberta-coitinho-33882863000199) | A lista relacionada menciona IDY Gráfica em Rua Umbu, 435 | Referência indireta em página de outra empresa: localizar a ficha correta antes de solicitar correção; não alterar os dados dessa outra empresa |

Essas referências externas foram observadas na pesquisa de 03/11/2026 e podem estar desatualizadas. Elas não substituem a confirmação do responsável. Nenhum cadastro externo foi editado, reivindicado ou contatado. Telefones, dados pessoais e informações de empresas relacionadas não foram copiados para o site.

## Melhorias propostas na prévia

| Prioridade | Alteração | Motivo |
|---|---|---|
| Alta | Título, descrição, H1 e apresentação da home destacam gráfica em Porto Alegre, impressão digital e pequenas tiragens | A abertura atual é genérica; o cliente e os buscadores passam a entender rapidamente a especialidade e a localização |
| Alta | Informação confirmada de atendimento e retirada nos rodapés, Sobre, Contato e home | Evita interpretar o endereço como convite a atendimento de balcão e não inventa horários |
| Média | Bloco editorial curto com links para impressão digital, cartões/pastas, livros/apostilas e comunicação visual | Liga a loja às páginas institucionais com rótulos descritivos e texto útil, sem repetir tabelas de preços |
| Média | Impressos com foco em cartões e pastas; Impressões Rápidas com foco em impressão digital A4/A3 | Diferencia as intenções de busca das páginas, preservando URLs e os demais serviços oferecidos |
| Média | AboutPage, ContactPage e CollectionPage nas páginas Sobre, Contato e Portfólio | Marca a função dessas páginas e as relaciona ao negócio já existente, sem avaliações fictícias |
| Média | LocalBusiness descreve atendimento online e oferece ContactPoint com canais já existentes | Alinha dados estruturados ao texto visível e à confirmação do responsável; mantém endereço e não declara horários |
| Baixa | Regra explícita de permissão para OAI-SearchBot no robots.txt | Documenta a intenção de permitir busca; não corrige bloqueio inexistente e não muda a política atual de GPTBot |

Livros e apostilas, comunicação visual e demais páginas já têm títulos/descrições locais úteis. Foram mantidos quando não havia ganho claro em reescrevê-los; receberam somente a padronização do atendimento confirmado. Não foram criadas páginas duplicadas, novas URLs, avaliações, estrelas, testemunhos, preços, estoque, prazos garantidos ou afirmações de melhor posição.

### Títulos propostos para os três focos principais

| Página | Antes | Proposto |
|---|---|---|
| Início | IDY Gráfica em Porto Alegre — Impressões e Personalizados | Gráfica em Porto Alegre: Impressão Digital — IDY Gráfica |
| Impressos | Impressos Gráficos em Porto Alegre — IDY Gráfica | Cartões e Pastas Personalizadas em Porto Alegre — IDY Gráfica |
| Impressões Rápidas | Gráfica Rápida: Impressão A3 e A4 em Porto Alegre — IDY | Impressão Digital A4 e A3 em Porto Alegre — IDY Gráfica |

Os separadores na tabela são editoriais; o HTML usa os separadores habituais do site. Metadados Open Graph e nomes/descrições equivalentes de página no JSON-LD acompanham a mudança. Os produtos e suas especificações não foram reescritos.

## O que depende de acesso ou de uma próxima etapa

1. **Search Console:** na propriedade existente, conferir indexação das 15 URLs, canonical escolhido pelo Google, sitemap processado e motivos de exclusão; inspecionar home, Impressos, Impressões Rápidas e Livros. Arquivos atuais de verificação foram preservados. Não foi afirmado que o site já está indexado nem que está ausente.
2. **Logs/Netlify:** verificar requisições reais e bloqueios nas faixas de IP publicadas do Google e da OpenAI. Trocar só o user-agent não autentica um robô.
3. **Perfil da Empresa no Google:** antes de criar ou mudar um perfil, conferir elegibilidade para o modelo de operação real. As regras exigem contato presencial em condições elegíveis e excluem negócios apenas online. Retirada combinada, sem balcão e sem horários públicos não permite concluir automaticamente a elegibilidade. Não inventar fachada aberta, horários ou atendimento presencial para tentar aparecer no Maps; não foi feita alteração em perfil algum.
4. **Cadastros externos:** resolver as referências de Rua Umbu com os proprietários das bases, preservando a distinção entre endereço cadastral e operacional quando necessário.
5. **Qualidade e reputação reais:** manter portfólio autêntico, fotos autorizadas e informações comerciais completas; solicitar avaliações apenas de clientes reais nos canais adequados. Nenhuma avaliação foi criada nesta proposta.
6. **Medição:** acompanhar consultas, impressões, cliques, CTR e conversões de orçamento em períodos comparáveis. Não há medição de Core Web Vitals de campo nesta auditoria; avaliar desempenho com dados reais e PageSpeed antes de qualquer rodada específica de imagens, que foram preservadas.
7. **Verificações históricas:** seis workflows antigos de revisão visual usam versões congeladas de páginas e da loja, incompatíveis com alterações SEO autorizadas. Foram excluídos apenas desta branch de auditoria, que tem pipeline dedicado com os 100 testes comerciais e validação das 15 páginas. O comportamento desses workflows para outras PRs e para produção foi mantido. Não houve remoção de testes ou alteração de código comercial.
8. **Publicação autorizada:** aprovação expressa do responsável para integrar a PR #27 e publicar. As verificações de produção de produtos digitais, preços, pastas, DTF e livros reutilizam agora a proteção de fontes da base comercial `3e7d3a1`, preservando seus cenários funcionais existentes. Comparações históricas de títulos, rodapés e contagem de URLs foram alinhadas à proposta SEO aprovada e às 15 URLs atuais. O workflow de visibilidade também verifica a produção sem `noindex`, em cinco larguras. Nenhum dado comercial ou código da aplicação foi alterado nessa preparação.

## Preservação e testes da proposta

- Os dez produtos, preços/opções e HTML comercial da vitrine são idênticos à base publicada.
- Código do carrinho, catálogo, cálculos, WhatsApp, IA, formulários, imagens e arquivos existentes fora do escopo são protegidos por hash. Todas as tags de imagem das 15 páginas permanecem iguais.
- Sitemap, URLs, canonical, redirecionamentos, arquivos de verificação e política atual de GPTBot preservados.
- 100 testes de cálculo existentes, mais conferência da proposta nas 15 páginas: títulos únicos, uma H1 por página, canonical, JSON-LD válido, endereço confirmado, ausência de horários/avaliações inventados, links/fragmentos, leitura sem JavaScript e bot user-agents.
- Navegador em 1440, 1024, 768, 390 e 320: dez produtos, carrinho, criação única, consolidação, persistência, WhatsApp interceptado sem envio real, IA, links de serviços e ausência de rolagem lateral/erros JavaScript.
- Capturas de computador/celular e relatórios anexados ao workflow da PR. Prévia com `noindex` do Netlify e canonical da produção; após o deploy autorizado, a verificação de produção exige ausência de `noindex`.

## Referências técnicas consultadas

- [OpenAI — crawlers e OAI-SearchBot](https://developers.openai.com/api/docs/bots): OAI-SearchBot atende à busca; GPTBot tem finalidade/política independente. Permissão ajuda a elegibilidade, sem garantir recomendações.
- [Google — recursos de IA e sites](https://developers.google.com/search/docs/appearance/ai-features): conteúdo útil, acessível e consistente continua relevante; não há marcação especial que garanta presença nas respostas.
- [Google — classificação local](https://support.google.com/business/answer/7091?hl=pt-BR): relevância, distância e popularidade influenciam os resultados; não é possível prometer as primeiras posições.
- [Google — elegibilidade do Perfil da Empresa](https://support.google.com/business/answer/13763036?hl=en): verificar os critérios do modelo real de atendimento antes de reivindicar/criar perfil.

A proposta melhora clareza, consistência e acesso técnico. Não garante primeira posição, indexação imediata ou inclusão entre as primeiras recomendações do Google ou do ChatGPT.

## Reversão da publicação autorizada

A branch `backup/antes-seo-pr27-20261103` preserva o commit anterior de produção `3e7d3a1baf70cde9d564caa93fcb7a76501110be`. Em caso de regressão, criar um commit de reversão da integração da PR #27, preservando o histórico, e aguardar o redeploy do Netlify. Não é necessário alterar preços, recuperar arquivos manualmente ou tocar no projeto independente de IA. Cadastros externos continuam fora do escopo.
