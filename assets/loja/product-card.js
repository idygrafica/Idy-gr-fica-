import {money} from './cart.js';
import {renderDigitalCard} from './digital-card.js';
import {productPhotos} from './showcase.js';

// Uma única apresentação para o HTML inicial e para os filtros da loja.
function renderStandardCard(p){return `<article class="product" data-product="${p.id}" id="produto-${p.id}">
 <figure class="showcase-photo"><img src="${productPhotos[p.id].src}" alt="${productPhotos[p.id].alt}" width="1536" height="1024" loading="lazy" decoding="async"></figure>
 <div class="product-content"><h3>${p.name}</h3><p class="product-description">${p.description}</p>
 <div class="price">${p.quantityPrices?`<strong><small>A partir de </small>${money(Math.min(...Object.values(p.quantityPrices)))}<small>/un.</small></strong><small>— para 1.000 unidades</small>`:p.options[0].priceCents===null?'<strong>Sob orçamento</strong><small>Valor sujeito a orçamento.</small>':`<strong>${money(p.options[0].priceCents)}<small>/folha</small></strong><small>R$ 3,00 por face · sem desconto automático</small>`}</div>
 <details class="product-details" name="idy-product-details"><summary class="view-product" aria-label="Ver produto: ${p.name}"><span>VER PRODUTO</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></summary><div class="product-configuration"><p class="configuration-heading">Configure sua solicitação</p><label for="option-${p.id}">${p.quantityPrices?'Quantidade cadastrada':'Opção de impressão ou personalização'}</label><select id="option-${p.id}" class="product-option">${p.quantityPrices?Object.entries(p.quantityPrices).map(([n,price])=>`<option value="${n}">${Number(n).toLocaleString('pt-BR')} unidades · ${money(price)}/un.</option>`).join('')+'<option value="other">Outra quantidade · orçamento</option>':p.options.map(o=>`<option value="${o.id}">${o.label}${o.priceCents!==null?' · '+money(o.priceCents):''}</option>`).join('')}</select>
 <div class="product-action"><label for="qty-${p.id}">${p.id==='cartoes'?'Lotes':'Qtd.'}</label><input id="qty-${p.id}" type="number" min="1" max="100000" step="1" value="${p.defaultQuantity||1}" inputmode="numeric" aria-label="Quantidade de ${p.id==='cartoes'?'lotes de ':''}${p.name}"></div>
 <button class="add-product" data-add="${p.id}">${p.id==='a3'||p.quantityPrices?'Adicionar ao carrinho':'Solicitar orçamento'}</button><p class="configuration-note">Personalização e disponibilidade confirmadas pela equipe.</p></div></details></div></article>`;}

export function renderProductCard(p,options={}){const standard=renderStandardCard(p);return renderDigitalCard(p,standard,options.detail===true)||standard;}
