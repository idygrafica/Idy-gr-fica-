# Pastas personalizadas com bolsa — publicação autorizada

Base: main `2babd6fc7c77f4d3d81e853d80df6053b482fc68`. Branch `codex/precos-pastas-com-bolsa`. O usuário autorizou publicar após os testes. Backup: `backup/antes-precos-pastas-20261102`.

Adapta somente o produto existente `pastas`, agora identificado como “Pastas personalizadas com bolsa”, sem duplicação. Os dez IDs, categorias, imagens e demais preços são mantidos. O produto `pastas-digitais-simples` e sua página continuam integralmente sob consulta.

| Tiragem de pastas com bolsa | Unitário calculado | Total do produto | Com criação de um trabalho |
|---|---:|---:|---:|
| 50 unidades | R$ 8,00 | R$ 400,00 | R$ 500,00 |
| 100 unidades | R$ 6,50 | R$ 650,00 | R$ 750,00 |

Preços totais exatos, sem interpolação ou desconto por faixa. Qualquer quantidade diferente de 50 e 100 permanece sob consulta, inclusive quantidades superiores. Na consolidação do carrinho, 50+50 passam ao preço aprovado de 100 unidades, R$ 650,00. Adicionar mais uma unidade leva a produção para consulta, sem reaproveitar preço antigo.

Os valores foram cadastrados em uma opção “Pasta personalizada com bolsa · configuração padrão”, sem inventar papel, formato ou faces de impressão. As opções antigas de impressão 4×0/4×4 permanecem sob consulta, pois não foram informados preços específicos para elas. Os IDs das opções antigas e seus carrinhos continuam válidos.

Reutiliza a regra existente de criação: R$ 100,00 uma única vez por trabalho/arte identificado no pedido. O mesmo nome identifica o mesmo trabalho; para uma arte diferente, usar outro nome. O serviço não é multiplicado pela tiragem. Arte pronta não recebe custo de criação. Projetos complexos exigem orçamento específico. Arquivos seguem pelo atendimento existente, sem upload automático.

Reutiliza os controles, cálculo e carrinho existentes. O WhatsApp informa pastas, quantidade, valor unitário, produção, criação e total, com aviso de consulta em quantidades não aprovadas. Nenhuma mensagem real é enviada pelos testes.

## Preservação e verificação

- Mantém os dez produtos, dados/categorias e nove fichas fora da alteração, todos os demais preços, imagens, IA independente, WhatsApp, páginas institucionais e SEO.
- Mantém canonical, metadados gerais, sitemap, robots, URLs, cabeçalho/hero/rodapé e configuração Netlify. Só o nome e a descrição do produto atualizado refletem a oferta de pastas com bolsa.
- 82 testes comerciais existentes + 18 novos: 50/100 unidades, unitário/total, criação única, quantidades não aprovadas, consolidação, edição/restauração, preços injetados, trabalho compartilhado/diferente, mensagem do WhatsApp, pastas digitais e opções antigas sob consulta.
- Navegador em 1440/768/390/320: seleção, preço/total com e sem criação, edição e persistência, 101 unidades sob consulta, consolidação 50+50, WhatsApp interceptado, pastas digitais preservadas, foto nítida e ausência de rolagem lateral ou erros JavaScript.
- Regressões dos preços de impressões/receituários e das páginas digitais são executadas, com relatórios/capturas no artifact da PR.

Publicar somente após conferir a prévia. Depois, repetir a verificação no site oficial. Reversão: reverter o merge da PR ou recuperar o backup, preservando alterações posteriores.
