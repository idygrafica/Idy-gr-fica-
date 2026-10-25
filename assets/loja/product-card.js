import {money} from './cart.js';

// Uma única apresentação para o HTML inicial e para os filtros da loja.
export function renderProductCard(p){return `<article class="product" data-product="${p.id}" id="produto-${p.id}">
 <div class="product-photo photo-${p.photo}" role="img" aria-label="${p.name}: imagem da referência aprovada"></div>
 <div class="product-content"><h3>${p.name}</h3><p class="product-description">${p.description}</p>
 <label class="sr-only" for="option-${p.id}">${p.quantityPrices?'Quantidade':'Opção'} de ${p.name}</label><select id="option-${p.id}" class="product-option">${p.quantityPrices?Object.entries(p.quantityPrices).map(([n,price])=>`<option value="${n}">${Number(n).toLocaleString('pt-BR')} unidades · ${money(price)}/un.</option>`).join('')+'<option value="other">Outra quantidade · orçamento</option>':p.options.map(o=>`<option value="${o.id}">${o.label}${o.priceCents!==null?' · '+money(o.priceCents):''}</option>`).join('')}</select>
 <div class="price">${p.quantityPrices?`<strong><small>A partir de </small>${money(Math.min(...Object.values(p.quantityPrices)))}<small>/un.</small></strong><small>— para 1.000 unidades</small>`:p.options[0].priceCents===null?'<strong>Sob orçamento</strong><small>Valor sujeito a orçamento.</small>':`<strong>${money(p.options[0].priceCents)}<small>/folha</small></strong><small>R$ 3,00 por face · sem desconto automático</small>`}</div>
 <div class="product-action"><label for="qty-${p.id}">${p.id==='cartoes'?'Lotes':'Qtd.'}</label><input id="qty-${p.id}" type="number" min="1" max="100000" step="1" value="${p.defaultQuantity||1}" inputmode="numeric" aria-label="Quantidade de ${p.id==='cartoes'?'lotes de ':''}${p.name}"></div>
 <button class="add-product" data-add="${p.id}">${p.id==='a3'||p.quantityPrices?'Adicionar ao carrinho':'Solicitar orçamento'}</button></div></article>`;}
