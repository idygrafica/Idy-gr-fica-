# Etapa 2 — conteúdo comercial e SEO local

Repositório: `idygrafica/Idy-gr-fica-` (site institucional).

Base: `aa413ee9736fe1b2061e1ed58ca70b359e233ad0`, após a integração da etapa 1.

Branch: `codex/seo-conteudo-etapa-2`.

Status: proposta para revisão. Não integrar nem publicar sem autorização expressa.

## Conteúdo preparado

| Página | Alterações |
| --- | --- |
| Inicial | Substitui uma frase de planejamento por apresentação comercial e link contextual para Impressões Rápidas; revisa a descrição SEO. O banner principal permanece intacto. |
| Impressões Rápidas | Revisa título, descrição, título social e nome da página nos dados estruturados. Aprofunda as orientações sobre A3/A4, currículos, documentos, pequenas quantidades e envio do arquivo. Mantém a composição principal integralmente. |
| Serviços | Explica melhor os serviços nos cards existentes e quais informações enviar para orçamento; acrescenta um link contextual para Impressões Rápidas no parágrafo de apresentação. |
| Impressos | Revisa título, descrição e parágrafo comercial; acrescenta link contextual para currículos, documentos e pequenas tiragens em Impressões Rápidas. |
| Comunicação Visual | Inclui Porto Alegre no título e na apresentação; substitui o parágrafo repetido por orientações sobre aplicação, medidas, quantidade e arte. |
| Cortes Especiais | Orienta o envio de referência, medidas, quantidade e finalidade do material no parágrafo existente. |
| Criação de Sites | Explica quais informações sobre negócio, público e serviços ajudam a planejar o projeto. |
| Livros Digitais | Esclarece o atendimento a autores e empresas da região, a organização do conteúdo e o objetivo da publicação. Preserva o projeto publicado e seus links. |
| Contato | Explica os dados para orçamento online e a retirada de impressos somente após aviso; revisa a descrição SEO. |
| Sobre | Revisa título, descrição e apresentação com a atuação em Porto Alegre e região. |

As 11 páginas foram analisadas. Portfólio já apresenta localização e exemplos dos serviços; não foi alterado apenas para repetir palavras-chave.

Arquivos de produção modificados: `index.html`, `impressoes-rapidas.html`, `servicos.html`, `impressos.html`, `comunicacao-visual.html`, `cortes-especiais.html`, `criacao-sites.html`, `livros-digitais.html`, `contato.html` e `sobre.html`. Arquivos de apoio: este relatório e `scripts/check-seo-etapa-2.mjs`. A correção final dos banners altera também `assets/mobile-phone-reference.css`.

## Orientações ao cliente

As instruções de Impressões Rápidas recomendam PDF e conferência de legibilidade, imagens, dados de contato e ordem das páginas. O cliente informa formato A3/A4, quantidade e impressão colorida ou preto e branco. Valor e prazo são confirmados no orçamento. Pedido, orientação e orçamento são online; retirada somente após o aviso de material pronto.

Não foram acrescentados preços, prazos fixos, materiais, acabamentos, garantias de posicionamento no Google ou serviços novos.

## Preservação

- Nenhuma alteração em JavaScript, imagens, vídeos, logo, mascote ou Xerox Color 560.
- Única alteração de CSS: restringe posicionamento absoluto e padding zero à `.hero .hero-copy`, no breakpoint já existente de até 620 px. Os banners internos voltam ao fluxo normal e ao padding original de 60 px; sua altura acompanha o conteúdo, mantendo as fontes e os fundos originais.
- Cabeçalhos, menus, rodapés e widgets de WhatsApp mantidos sem alterações no código.
- Botões, mensagens preenchidas, destinos de WhatsApp, Instagram, IA e livro publicado preservados.
- Não há seções, cards, fontes, bibliotecas de produção ou arquivos de mídia novos. Os textos usam os blocos existentes e suas alturas naturais.
- URLs, canonicals, sitemap, robots.txt, redirecionamentos e correções da etapa 1 preservados.
- Nenhuma operação no repositório `atendimento-idy`.

## Verificação reproduzível

```sh
node scripts/check-seo-etapa-2.mjs
```

O teste requer Node.js, Playwright e Chromium. Usa dois servidores locais, compara a correção com a versão aprovada da etapa 2 (`961bfa9d2298b24aa746f620f64967f309cea4ae`) e intercepta os destinos de WhatsApp, Instagram e IA, sem enviar mensagens ou iniciar atendimentos.

Larguras: 320, 360, 375, 390, 430, 620, 621, 768, 980, 1024 e 1440 pixels, nas 11 páginas. O teste verifica:

- HTML das 11 páginas idêntico à versão aprovada da etapa 2, preservando textos, metadados, dados estruturados, canonicals e links.
- Sitemap, robots.txt, configuração do Netlify, JavaScript e imagens sem alterações; o CSS só pode conter a mudança exata autorizada.
- Ausência de recortes de texto e botões, rolagem horizontal, sobreposição de blocos do banner, imagens quebradas e erros JavaScript.
- Abertura, fechamento, Escape, clique fora e acesso aos links do menu até 980 px, incluindo 621–980 px.
- Links contextuais por teclado; Serviços → Impressões Rápidas; todos os botões visíveis de WhatsApp, Instagram e IA, com navegação interceptada localmente.
- Cabeçalho, fontes, cores e estrutura preservados. Comparação de pixels da página inteira em todas as larguras a partir de 621 px e, nas outras oito páginas, também nas larguras menores. Pequeno ruído de rasterização é limitado a 2/255 por canal em no máximo 0,005% dos pixels.
- Banner principal da home e de Impressões Rápidas preservados em todas as larguras.

Relatório e capturas são gerados em `.preview/banners-mobile/`, fora dos arquivos a integrar. Capturas de página inteira das 11 páginas: 390, 768 e 1440 px. Capturas de antes/depois dos três banners: 320, 360, 375, 390, 430, 620, 621, 768 e 1440 px.

## Correção final autorizada dos banners

A regra mobile `.hero-copy` impunha posicionamento absoluto também aos banners internos. O conteúdo não contribuía para a altura da seção, que cortava os elementos pelo `overflow:hidden`. A regra de posicionamento foi limitada ao banner da home. Os banners internos mantêm o fundo com recorte de imagem, mas seus textos e botões passam a determinar a altura necessária.

| Página | Problema corrigido |
| --- | --- |
| Impressos | Parágrafo cortado em 320–430 px; botão Pedir orçamento cortado em 320–620 px. |
| Cortes Especiais | Título cortado em 320/360 px; parágrafo e botão cortados em 320–620 px. |
| Sobre | Parágrafo cortado em 320–430 px. |

Não foram reduzidas fontes nem trocadas imagens. O HTML e as melhorias comerciais da etapa 2 foram preservados integralmente. O relatório anterior de SEO e suas capturas permanecem como histórico; a nova matriz confirmou também que os recortes antigos foram eliminados.

Resultado final: 121 combinações aprovadas, 103 comparações de página inteira preservadas e 87 capturas (54 de banners antes/depois e 33 de páginas completas). Os casos já aprovados foram reaproveitados; somente casos incompletos por espera ou captura foram revalidados, sem outra alteração de produção. As capturas completas tiveram a pintura estabilizada antes da revisão.

Nenhuma nova dependência, fonte, imagem ou requisição de produção foi acrescentada. A verificação local de integridade e transferência não equivale a uma medição de Core Web Vitals em usuários reais.

## Controle de publicação

O commit e o título da PR usam `[skip netlify]` para impedir deploy automático da branch e Deploy Preview, conforme a documentação do Netlify. Não há mudança na configuração do site. A publicação futura deve ocorrer apenas após a revisão e autorização do responsável.

Estas melhorias ajudam a explicar os serviços e a descoberta por links internos; não garantem indexação, prazo de indexação ou posição nas buscas. Nenhuma nova solicitação de indexação é necessária nesta preparação.
