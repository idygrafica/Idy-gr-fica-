import {digitalProducts} from './digital-products.js';
export function renderDigitalCard(p,standard){
 const c=digitalProducts[p.id];if(!c)return null;
 // Mantém todas as opções antigas acessíveis, inclusive carrinhos já salvos.
 const legacy=standard.slice(standard.indexOf('<div class="product-configuration">'),standard.lastIndexOf('</details>'));
 return `<article class="product digital-product" data-product="${p.id}" id="produto-${p.id}">
 <figure class="showcase-photo"><img src="${c.photo}" alt="${c.name} em Porto Alegre: apresentação ilustrativa" width="1536" height="1024" loading="lazy" decoding="async"></figure>
 <div class="product-content"><h3>${c.name}</h3><p class="product-description">${c.description}</p><div class="price"><strong>Sob consulta</strong><small>Produção confirmada pela equipe antes do pedido.</small></div>
 <details class="product-details" name="idy-product-details"><summary class="view-product" aria-label="Ver produto: ${c.name}"><span>VER PRODUTO</span><span aria-hidden="true">→</span></summary>
 <noscript><p>Configure seu orçamento pelo <a href="https://wa.me/5551981687562">WhatsApp da IDY Gráfica</a>. Ative JavaScript para guardar as opções no carrinho.</p></noscript><form class="digital-form" data-digital="${p.id}"><h4>Configure sua solicitação</h4>
 ${p.id==='blocos'?`<label for="digital-format-${p.id}">Formato</label><select id="digital-format-${p.id}" name="format">${c.formats.map(f=>`<option>${f}</option>`).join('')}</select>`:'<input type="hidden" name="format" value="Simples">'}
 <label for="digital-quantity-${p.id}">Quantidade de ${p.id==='blocos'?'blocos':'pastas'}</label><select name="quantity" id="digital-quantity-${p.id}">${c.quantities.map(n=>`<option value="${n}">${n.toLocaleString('pt-BR')} ${p.id==='blocos'?'blocos':'pastas'}</option>`).join('')}</select>
 <fieldset><legend>Arte do seu produto</legend><label class="digital-choice"><input type="radio" name="artwork" value="ready" checked> Já tenho minha arte — sem custo de criação</label><label class="digital-choice"><input type="radio" name="artwork" value="create"> Preciso que a IDY crie — R$ 100,00 por arte</label></fieldset>
 <div class="artwork-reference" hidden><label for="artwork-reference-${p.id}">Nome da arte</label><input id="artwork-reference-${p.id}" name="reference" maxlength="80" value="${c.name}"><small>O mesmo nome identifica a mesma arte no pedido e cobra a criação uma única vez. Para outra arte, use outro nome.</small></div>
 <div class="digital-totals" role="status" aria-live="polite"><div><span>Valor unitário</span><strong>Sob consulta</strong></div><div><span>Subtotal do produto</span><strong>Sob consulta</strong></div><div><span>Criação da arte</span><strong data-artwork-cost>R$ 0,00</strong></div><div><span>Total final</span><strong>Sob consulta</strong></div><p data-digital-status>A produção ainda não tem preço aprovado. Solicite orçamento.</p></div>
 <p class="digital-note">${c.note}</p><p class="digital-note">Criação complexa exige orçamento específico. Envie sua arte pelo WhatsApp após o atendimento; este site não recebe arquivos automaticamente.</p>
 <button type="button" class="add-product" data-digital-add="${p.id}">Incluir na solicitação</button><button type="submit" class="digital-whatsapp">Solicitar orçamento pelo WhatsApp</button><p class="digital-note">Sem pagamento automático. O total completo depende da confirmação da produção.</p></form>
 <details class="digital-legacy"><summary>Outras opções já disponíveis · sob orçamento</summary>${legacy}</details></details></div></article>`;
}
