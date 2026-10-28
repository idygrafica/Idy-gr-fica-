# IDY Resolve — abertura fotográfica para aprovação

A abertura apresenta “A impressão evoluiu. A gente também.” e a fotografia original da Xerox Color 560 como protagonista. O equipamento permanece inteiro e sem deformação. O botão “O QUE VOCÊ PRECISA IMPRIMIR?” leva à seção de atendimento que já existia na PR #18.

Uma transição única de 1,8 segundo faz uma breve referência às origens da impressão e termina na fotografia da Xerox. Não há animação de partes da máquina, folhas saindo, simulação de filmagem, vídeo, carrossel ou repetição. A preferência de movimento reduzido mostra diretamente a Xerox. O mascote oficial é mantido como apoio ao atendimento.

As simulações anteriores foram retiradas somente da abertura, junto do código que as controlava. O guia, suas três opções, sete necessidades, formulário, cópia do resumo e acesso à IA permanecem preservados. O resumo continua sendo revisado e enviado pelo próprio cliente no WhatsApp; arquivos são anexados na conversa. Não foi criada outra IA ou integração inexistente.

## Fotografias e permissões

- Xerox: `assets/xerox-color-560-home.webp`, fotografia original já aprovada, sem alteração. O repositório contém um vídeo de fachadas; não foi encontrada filmagem autêntica e autorizada da Xerox em operação.
- Prensa histórica: `assets/prensa-tipografica-referencia.jpg`, cópia sem edição de **Creation Museum printing press.jpg**, de **Acdixon**, em **CC0**. Mostra uma réplica, identificada como referência histórica, sem atribuí-la à IDY. Fonte: https://commons.wikimedia.org/wiki/File:Creation_Museum_printing_press.jpg. Licença: https://creativecommons.org/publicdomain/zero/1.0/. Original: https://upload.wikimedia.org/wikipedia/commons/c/cb/Creation_Museum_printing_press.jpg. SHA-1 do arquivo: `ddf51af231553c8ca5a6e650b46256d79e9c8a28`.
- Impressos e rótulos: `comandas-blocos-personalizados.webp` e `rotulos-etiquetas-personalizadas.webp`, fotografias já usadas no acervo do site, sem alteração.
- Publicações: `assets/publicacoes-referencia-pexels.jpg`, cópia de 600 px da fotografia Pexels **4271613**, já usada na página Livros Digitais. Aparece como referência fotográfica, não como trabalho identificado da IDY. Fonte: https://images.pexels.com/photos/4271613/pexels-photo-4271613.jpeg?auto=compress&cs=tinysrgb&w=600. Uso em site permitido por https://www.pexels.com/license/. Créditos disponíveis no bloco “Sobre as fotografias”.

Nenhuma imagem foi gerada. Não são anunciadas máquinas adicionais nem capacidades não confirmadas. Quantidade mínima, material, personalização e viabilidade continuam sujeitos ao produto e ao orçamento. Não se promete impressão unitária para todos os produtos.

## Escopo preservado

Produção: `92583ed7e5615c28aed7350897d80c4d6e297064`. Revisão anterior da PR #18: `9bfed631e12816c3bc3210bc81df91e5bd6a9944`. O teste exige igualdade do HTML a partir da seção de atendimento em relação à revisão anterior. Cabeçalho, busca, categorias, catálogo pré-renderizado com oito produtos, fotos e opções comerciais, carrinho e rodapé permanecem intactos. As onze páginas internas, sitemap, robots, canonical e redirecionamentos não mudam.

A3 mantém R$ 3,00 por face e R$ 6,00 frente e verso, sem desconto automático. Canetas DTF UV preservam a tabela aprovada; demais quantidades e itens seguem sob orçamento. Não há alteração em `atendimento-idy` ou em suas funções.

## Validação

Workflow `idy-resolve-preview.yml`: 25 testes comerciais e nove do guia, pré-renderização, verificação de fontes protegidas, Chrome local/Netlify em cinco larguras (1440, 1024, 768, 390 e 320 px), loja em seis larguras. Confere imagens, botão para IDY Resolve, links, teclado, auditoria automática axe WCAG A/AA, formulário, cópia, alternativa sem JavaScript, movimento reduzido e fim da transição sem loop.

A auditoria registra uma medição em Chrome com viewport de 390 px, CPU 4x e rede de 1,6 Mbps / 150 ms: FCP, LCP e deslocamentos de layout. É uma medição de laboratório. HTML, CSS e JS têm orçamento de tamanho e foram reduzidos com a retirada da vitrine simulada. As imagens novas ficam no próprio site; a abertura não depende de bibliotecas ou serviços externos em tempo de execução.

WhatsApp é interceptado nos testes, sem mensagem real. A IA recebe somente GET na página e no endpoint público de saúde; não se cadastram clientes, enviam anexos ou acionam atendentes.

## Publicação e material adicional

Somente a branch e a PR #18, em rascunho, com Deploy Preview no Netlify existente. A proteção noindex da prévia é intencional. Sem merge ou publicação em produção antes da aprovação.

Nenhum envio de material pelo usuário é necessário para avaliar esta proposta. Para incluir a Xerox trabalhando, será necessária uma filmagem autêntica com autorização de uso. Fotos reais de cartões, livros e outros trabalhos da IDY poderão ampliar os exemplos sem montagens.
