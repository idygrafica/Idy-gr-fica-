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

Arquivos de produção modificados: `index.html`, `impressoes-rapidas.html`, `servicos.html`, `impressos.html`, `comunicacao-visual.html`, `cortes-especiais.html`, `criacao-sites.html`, `livros-digitais.html`, `contato.html` e `sobre.html`. Arquivos de apoio novos: este relatório e `scripts/check-seo-etapa-2.mjs`.

## Orientações ao cliente

As instruções de Impressões Rápidas recomendam PDF e conferência de legibilidade, imagens, dados de contato e ordem das páginas. O cliente informa formato A3/A4, quantidade e impressão colorida ou preto e branco. Valor e prazo são confirmados no orçamento. Pedido, orientação e orçamento são online; retirada somente após o aviso de material pronto.

Não foram acrescentados preços, prazos fixos, materiais, acabamentos, garantias de posicionamento no Google ou serviços novos.

## Preservação

- Nenhuma alteração em CSS, JavaScript, imagens, vídeos, logo, mascote ou Xerox Color 560.
- Cabeçalhos, menus, rodapés e widgets de WhatsApp mantidos sem alterações no código.
- Botões, mensagens preenchidas, destinos de WhatsApp, Instagram, IA e livro publicado preservados.
- Não há seções, cards, fontes, bibliotecas de produção ou arquivos de mídia novos. Os textos usam os blocos existentes e suas alturas naturais.
- URLs, canonicals, sitemap, robots.txt, redirecionamentos e correções da etapa 1 preservados.
- Nenhuma operação no repositório `atendimento-idy`.

## Verificação reproduzível

```sh
node scripts/check-seo-etapa-2.mjs
```

O teste requer Node.js, Playwright e Chromium. Usa dois servidores locais, compara a proposta com a base e intercepta os destinos de WhatsApp, Instagram e IA, sem enviar mensagens ou iniciar atendimentos.

Larguras: 320, 360, 375, 390, 430, 620, 621, 768, 980, 1024 e 1440 pixels, nas 11 páginas. Verifica estrutura, estilos, arquivos protegidos, imagens, controles, navegação por menu, links contextuais por teclado, destinos de atendimento, canonical, ausência de novos recortes e erros JavaScript. Compara o cabeçalho e os banners principais da home e de Impressões Rápidas com a base. Os relatórios distinguem eventuais condições já existentes na base.

Relatório e capturas são gerados em `.preview/seo-etapa-2/`, fora dos arquivos a integrar. As capturas de cada página modificada são feitas em 390, 768 e 1440 pixels.

Não foi acrescentado nenhum recurso de produção nem requisição a novas imagens, estilos, scripts ou fontes. O maior acréscimo entre os HTMLs é de 302 bytes, em Impressões Rápidas. Isso limita o impacto de transferência da proposta; não equivale a uma medição de Core Web Vitals em usuários reais.

A comparação identifica um recorte vertical que já existe no banner mobile de Impressos na base publicada. O teste verifica que a proposta não o agrava. Uma correção dos estilos desse banner deve ser avaliada separadamente, pois esta etapa preserva o CSS aprovado.

## Controle de publicação

O commit e o título da PR usam `[skip netlify]` para impedir deploy automático da branch e Deploy Preview, conforme a documentação do Netlify. Não há mudança na configuração do site. A publicação futura deve ocorrer apenas após a revisão e autorização do responsável.

Estas melhorias ajudam a explicar os serviços e a descoberta por links internos; não garantem indexação, prazo de indexação ou posição nas buscas. Nenhuma nova solicitação de indexação é necessária nesta preparação.
