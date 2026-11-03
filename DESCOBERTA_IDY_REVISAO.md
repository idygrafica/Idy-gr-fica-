# Descoberta da IDY Gráfica — revisão complementar

Auditoria pública em 03/11/2026, 23:18 UTC. Base de produção: `4114b1131c05fdfdcb449f91445bc54462cab081`, após a PR #29. Proposta em rascunho, sem publicação em produção.

## O que ainda muda nesta proposta

Uma única complementação de metadados: adicionar `sameAs: ["https://www.instagram.com/idygrafica/"]` ao `LocalBusiness` já existente na home. O responsável confirmou anteriormente que @idygrafica é o Instagram oficial. As duas páginas geradas que reutilizam esse cabeçalho recebem a mesma informação no build.

Isso relaciona o site ao perfil oficial da empresa, conforme o uso documentado de `sameAs`. É um enriquecimento opcional da identificação da empresa, não o reparo de um bloqueio de rastreamento nem uma garantia de recomendação. Não foram adicionados diretórios divergentes ao `sameAs`, avaliações, horários, CEP, coordenadas, prazos ou ofertas.

Somente `index.html`, `blocos-personalizados.html` e `pastas-digitais-simples.html` mudam em produção caso a proposta seja aprovada. Remover a nova propriedade desses arquivos resulta exatamente nos arquivos atuais. O corpo, o visual e todos os demais schemas permanecem idênticos. O gerador existente já propaga o cabeçalho da home: não foi necessário alterá-lo.

## O que já está correto — não refazer

| Verificação atual | Evidência |
|---|---|
| Abertura da loja | H1 no HTML inicial: “Gráfica em Porto Alegre com impressão digital e pequenas tiragens.” |
| Serviços e localização | Texto inicial menciona A4/A3, cartões e pastas; título e descrição já informam atividade e Porto Alegre |
| Dez produtos | Conteúdo pré-renderizado no HTML inicial; os produtos não dependem de JavaScript para serem descobertos |
| Rastreamento público | 45 leituras, 15 URLs × navegador/Googlebot/OAI-SearchBot; todas HTTP 200 |
| Conteúdo por identificador | Hash do HTML igual entre os três identificadores em cada URL |
| robots.txt | Permite explicitamente OAI-SearchBot e mantém a regra geral existente |
| Indexabilidade | Nenhum noindex encontrado nas metas ou cabeçalhos das 45 leituras |
| Títulos e descrições | 15 títulos únicos; descrições locais e uma H1 em cada página |
| Dados estruturados | JSON-LD legível nas 15 páginas; correção de Product da PR #29 preservada |
| Endereço | Travessa da Luz, 845 — Porto Alegre/RS; atendimento exclusivamente online e retirada combinada |
| Links internos | 348 referências auditadas, sem destino ou fragmento quebrado encontrado |
| Recursos de página | CSS/JS diretamente referenciados disponíveis; nenhum erro HTTP encontrado |
| URLs | Sitemap com 15 URLs canônicas; aliases .html chegam às URLs corretas; endereço inexistente retorna 404 |

Não foram reescritos títulos, descrições ou textos que já atendem ao objetivo. Canonical, sitemap, robots, dez produtos, preços, imagens, carrinho, WhatsApp, IA e demais páginas são preservados. A PR #18 e a PR #19 não foram alteradas.

## A versão antiga citada na consulta

A chamada “Mais liberdade para criar formatos diferentes” não foi encontrada nos 15 HTML atuais examinados. A home pública corresponde ao código da versão publicada, e os identificadores testados recebem o mesmo conteúdo. Não foi demonstrado que o Netlify esteja servindo uma home antiga.

Nas consultas exploratórias, a ferramenta de busca não retornou páginas do domínio e não conseguiu abrir diretamente algumas URLs, embora a leitura HTTP tenha funcionado. Essas limitações não comprovam ausência de indexação, bloqueio ao robô real ou cache antigo. Sem a URL exata do resultado citado, a data de rastreamento, o HTML rastreado e o canonical escolhido no Search Console, não é possível distinguir cache antigo, trecho de outra página ou outra origem com certeza.

Próxima conferência necessária: inspecionar a home, `/impressoes-rapidas` e `/impressos` no Search Console, comparar o HTML rastreado com o teste ao vivo e solicitar novo rastreamento quando apropriado. Não alterar URLs nem criar redirecionamentos para tentar resolver uma causa ainda não comprovada.

## Prioridades que permanecem fora do código

1. **Search Console:** confirmar a última leitura, indexação e canonical escolhido pelo Google, além de validar a correção da PR #29. A propriedade privada não está autenticada neste ambiente. Nenhuma solicitação foi enviada nesta etapa.
2. **Netlify:** conferir logs e eventuais regras de proteção para requisições reais das faixas oficiais do OAI-SearchBot e Googlebot. Trocar o User-Agent em uma sonda não autentica o robô. Não há acesso conectado a logs/WAF; nenhuma proteção foi desativada.
3. **Diretórios externos:** os resultados de busca exibiram Rua Umbu, 435 em CNPJ.biz/Econodata e Av. João Wallig, 122 em BR Firmas, em divergência com o endereço operacional confirmado. As páginas diretas de alguns diretórios não abriram nesta ferramenta; tratar essas informações como evidência dos resultados de busca, sujeita à conferência na ficha atual. O responsável deve corrigir/reivindicar a ficha própria pelo procedimento de cada plataforma, distinguindo endereço cadastral e operacional quando aplicável. Nenhum cadastro foi editado ou contatado.
4. **Referências reais:** manter o endereço do site nos perfis oficiais e obter referências legítimas de clientes, fornecedores e parceiros. Publicar somente avaliações e trabalhos autênticos; não criar depoimentos ou perfis duplicados.

Essas ações podem melhorar consistência e descoberta, mas não garantem indexação, primeiras posições ou recomendações do ChatGPT. Não foram medidos ranking, tráfego ou conversões nesta revisão.

## Verificação da proposta

- Comparação de preservação: 179 arquivos existentes inalterados; nos três HTML modificados, somente a nova propriedade `sameAs` foi acrescentada.
- Build idempotente; LocalBusiness, endereço confirmado e schemas corrigidos de Blocos/Pastas preservados.
- 100 testes comerciais existentes aprovados: 16 de carrinho/A3, 9 de canetas, 25 de produtos digitais, 32 de preços aprovados e 18 de pastas.
- Conferência visual e funcional na prévia em computador e celular registrada na PR após o deploy de prévia.
- Não foi feita nova tentativa redundante de validação oficial do Google: a última tentativa solicitou autenticação e não há sessão Google conectada.
- Prévia Netlify deve manter seu noindex automático e canonical da produção. Não remover essa proteção da prévia.

## Referências

- [OpenAI — OAI-SearchBot e faixas de IP](https://developers.openai.com/api/docs/bots).
- [Google — sameAs e identificação da empresa](https://developers.google.com/search/docs/appearance/structured-data/organization).
- [Google — recursos de IA e boas práticas de SEO](https://developers.google.com/search/docs/appearance/ai-features).
- [Google — solicitar novo rastreamento](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).
- [CNPJ.biz — ficha encontrada na busca](https://cnpj.biz/07226393000103).
- [Econodata — listagem encontrada na busca](https://www.econodata.com.br/empresas/rs-porto-alegre/impressao-de-material-de-seguranca-c-18121).
- [BR Firmas — listagem encontrada na busca](https://brfirmas.org/RS-Porto-Alegre/Gr%C3%A1ficas/page5).

**Somente prévia. Sem merge, publicação em produção ou alteração de cadastros externos.**
