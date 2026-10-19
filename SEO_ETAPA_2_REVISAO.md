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
- Correção de recortes: restringe posicionamento absoluto e padding zero à `.hero .hero-copy`, no breakpoint já existente de até 620 px. Os banners internos voltam ao fluxo normal e ao padding original de 60 px; sua altura acompanha o conteúdo, mantendo as fontes.
- Revisão visual posterior: somente em até 620 px, Cortes reutiliza a foto limpa já existente em Serviços e Sobre recebe uma camada verde-escura mais uniforme atrás do texto. Nenhum arquivo de imagem é editado; as versões a partir de 621 px e Impressos permanecem intactas.
- Cabeçalhos, menus, rodapés e widgets de WhatsApp mantidos sem alterações no código.
- Botões, mensagens preenchidas, destinos de WhatsApp, Instagram, IA e livro publicado preservados.
- Não há seções, cards, fontes, bibliotecas de produção ou arquivos de mídia novos. Os textos usam os blocos existentes e suas alturas naturais.
- URLs, canonicals, sitemap, robots.txt, redirecionamentos e correções da etapa 1 preservados.
- Nenhuma operação no repositório `atendimento-idy`.

## Verificação reproduzível

```sh
node scripts/check-seo-etapa-2.mjs
```

O teste requer Node.js, Playwright e Chromium. Usa dois servidores locais, compara a correção com a versão aprovada da etapa 2 (`8fff965106752c5293038fb89745c6809a365c1e`) e intercepta os destinos de WhatsApp, Instagram e IA, sem enviar mensagens ou iniciar atendimentos.

Larguras: 320, 360, 375, 390, 430, 620, 621, 768, 980, 1024 e 1440 pixels, nas 11 páginas. O teste verifica:

- Os dez HTMLs fora de Cortes são idênticos à versão anterior da PR. Em Cortes, somente a classe `service-hero-cortes` é acrescentada à seção existente; textos, metadados, dados estruturados, canonicals e links são preservados.
- Sitemap, robots.txt, configuração do Netlify, JavaScript e imagens sem alterações; o CSS só pode conter a mudança exata autorizada.
- Ausência de recortes de texto e botões, rolagem horizontal, sobreposição de blocos do banner, imagens quebradas e erros JavaScript.
- Abertura, fechamento, Escape, clique fora e acesso aos links do menu até 980 px, incluindo 621–980 px.
- Links contextuais por teclado; Serviços → Impressões Rápidas; todos os botões visíveis de WhatsApp, Instagram e IA, com navegação interceptada localmente.
- Cabeçalho, fontes, cores e estrutura preservados. Comparação de pixels da página inteira em todas as larguras a partir de 621 px e, nas outras nove páginas, também nas larguras menores. Pequeno ruído de rasterização é limitado a 2/255 por canal em no máximo 0,005% dos pixels.
- Banner principal da home e de Impressões Rápidas preservados em todas as larguras.

Relatório e capturas são gerados em `.preview/fundos-mobile/`, fora dos arquivos a integrar. Capturas de página inteira das 11 páginas: 390, 768 e 1440 px. Capturas de antes/depois dos dois banners: 320, 360, 375, 390, 430, 620, 621, 768 e 1440 px.

## Correção final autorizada dos banners

A regra mobile `.hero-copy` impunha posicionamento absoluto também aos banners internos. O conteúdo não contribuía para a altura da seção, que cortava os elementos pelo `overflow:hidden`. A regra de posicionamento foi limitada ao banner da home. Os banners internos mantêm o fundo com recorte de imagem, mas seus textos e botões passam a determinar a altura necessária.

| Página | Problema corrigido |
| --- | --- |
| Impressos | Parágrafo cortado em 320–430 px; botão Pedir orçamento cortado em 320–620 px. |
| Cortes Especiais | Título cortado em 320/360 px; parágrafo e botão cortados em 320–620 px. |
| Sobre | Parágrafo cortado em 320–430 px. |

Na correção de recortes não foram reduzidas fontes nem trocadas imagens. As melhorias comerciais da etapa 2 foram preservadas integralmente. O relatório anterior de SEO e suas capturas permanecem como histórico; a nova matriz confirmou também que os recortes antigos foram eliminados.

Resultado da correção anterior (commit 8fff965): 121 combinações aprovadas, 103 comparações de página inteira preservadas e 87 capturas (54 de banners antes/depois e 33 de páginas completas). Os casos já aprovados foram reaproveitados; somente casos incompletos por espera ou captura foram revalidados, sem outra alteração de produção. As capturas completas tiveram a pintura estabilizada antes da revisão.

Nenhuma nova dependência, fonte ou arquivo de imagem foi acrescentado. No mobile, Cortes passa a requisitar a fotografia limpa já existente (`cortes-especiais-maquina-card.png`, aproximadamente 985 KiB); o arquivo não foi reexportado ou comprimido nesta revisão. A verificação local não equivale a uma medição de Core Web Vitals em usuários reais.

## Revisão visual final — fundos mobile

Antes da retomada, já estavam salvos no ambiente a classe de Cortes e as regras de fundo/contraste. As quatro capturas preliminares também existiam. O trabalho foi continuado a partir desses arquivos, sem reaplicar as correções nem modificar Impressos.

- **Cortes Especiais:** o arquivo `cortes-especiais-maquina-idy.png` é uma montagem com cabeçalho, menu e textos incorporados na imagem. Em até 620 px, somente o fundo do banner passa a usar `cortes-especiais-maquina-card.png`, a fotografia limpa da máquina já usada em Serviços. A montagem original continua intacta no projeto, no desktop e na imagem da seção inferior.
- **Sobre:** mantém `fachada-idy-real.png`, inclusive a marca presente na fotografia. A camada sobre a imagem usa o mesmo verde-escuro do site, com opacidade distribuída de 96% a 86%, melhorando a separação do texto branco. Fontes, conteúdo, posições e alturas não são alterados.
- **Impressos:** nenhum arquivo ou regra visual específica alterado. A comparação com o commit 8fff965 é feita nas 11 larguras.
- **Demais páginas:** os arquivos de produção permanecem intactos; as duas novas regras têm seletores específicos e só existem dentro do breakpoint de até 620 px.

Resultado desta revisão: **121 combinações aprovadas**, **109 comparações de página inteira preservadas** e **69 capturas** (36 de banners antes/depois e 33 de páginas completas). As posições dos títulos, parágrafos e botões permaneceram iguais em todos os casos; Impressos permaneceu preservado nas 11 larguras. O rótulo inclinado da Xerox em 980 px foi revalidado com renderização consistente, sem alterar o site ou afrouxar a comparação de pixels.

A revisão visual humana continua necessária: testes de navegação e recortes não identificam um menu gravado dentro de uma fotografia. As novas capturas de antes/depois e de desktop são apresentadas para aprovação antes de qualquer publicação.

## Controle de publicação

O commit e o título da PR usam `[skip netlify]` para impedir deploy automático da branch e Deploy Preview, conforme a documentação do Netlify. Não há mudança na configuração do site. A publicação futura deve ocorrer apenas após a revisão e autorização do responsável.

Estas melhorias ajudam a explicar os serviços e a descoberta por links internos; não garantem indexação, prazo de indexação ou posição nas buscas. Nenhuma nova solicitação de indexação é necessária nesta preparação.
