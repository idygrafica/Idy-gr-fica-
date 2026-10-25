import {products,categories} from './catalog.js';
import {CART_KEY,money,quantity,itemDetails,restoreCart,addItem,summarize,whatsappUrl} from './cart.js';
const $=selector=>document.querySelector(selector);
const paths={
 search:'M21 21l-5-5m2-6a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
 cart:'M2 3h3l3 13h11l3-10H6m3 15h.01M19 21h.01',
 headset:'M4 13v-2a8 8 0 0 1 16 0v2M4 12H2v7h4v-7H4m16 0h2v7h-4v-7h2m0 7v2h-6',
 chat:'M20 17a10 10 0 1 0-16 0l-2 5 6-2a10 10 0 0 0 12-3Zm-12-10c-1 4 2 7 6 8l2-2-3-2-1 1-2-2 1-1-2-3-1 1',
 grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
 printer:'M6 8V2h12v6M6 17H2V8h20v9h-4M6 14h12v8H6zM17 11h1',
 card:'M2 5h20v15H2zM2 9h20M5 13h6M5 16h4',
 file:'M5 2h9l5 5v15H5zM14 2v6h5M8 12h8M8 16h8',
 list:'M5 2h14v20H5zM8 6h8M8 10h8M8 14h8M8 18h5',
 tag:'m3 3 9 1 10 10-8 8L4 12 3 3Zm5 5h.01',
 gift:'M3 8h18v4H3zM5 12v10h14V12M12 8v14m0-14C1 8 6-3 12 8Zm0 0C23 8 18-3 12 8Z',
 truck:'M1 4h13v13H1zM14 9h5l4 5v3h-9M5 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
 star:'m12 2 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1 3-7Z',
 clock:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 5v7l4 2',
 box:'m2 7 10-5 10 5v10l-10 5-10-5V7Zm0 0 10 5 10-5M12 12v10M7 4l10 5',
 trash:'M3 6h18M9 6V3h6v3M6 6l1 16h10l1-16M10 10v8M14 10v8'
};
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.grid}"/></svg>`;
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
let cart=[];
let storageAvailable=true;
try {cart=restoreCart(localStorage.getItem(CART_KEY));} catch {storageAvailable=false;}
let category='todos', query='',toastTimer;
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4200);}
function save(){try{localStorage.setItem(CART_KEY,JSON.stringify(cart));}catch{storageAvailable=false;}renderCart();if(!storageAvailable)toast('Carrinho disponível nesta página. O navegador não permitiu salvar para depois.');}
function renderCategories(){
 $('#categories').innerHTML=categories.map(c=>`<button data-category="${c.id}" aria-pressed="${category===c.id}">${icon(c.icon)}<span>${c.label}</span></button>`).join('');
}
function renderProducts(){
 const visible=products.filter(p=>(category==='todos'||p.category===category)&&normalize(p.name+' '+p.description).includes(normalize(query)));
 $('#product-grid').innerHTML=visible.map(p=>`<article class="product" data-product="${p.id}">
 <div class="product-photo photo-${p.photo}" role="img" aria-label="${p.name}: imagem da referência aprovada"></div>
 <div class="product-content"><h3>${p.name}</h3><p class="product-description">${p.description}</p>
 <label class="sr-only" for="option-${p.id}">${p.quantityPrices?'Quantidade':'Opção'} de ${p.name}</label><select id="option-${p.id}" class="product-option">${p.quantityPrices?Object.entries(p.quantityPrices).map(([n,price])=>`<option value="${n}">${Number(n).toLocaleString('pt-BR')} unidades · ${money(price)}/un.</option>`).join('')+'<option value="other">Outra quantidade · orçamento</option>':p.options.map(o=>`<option value="${o.id}">${o.label}${o.priceCents!==null?' · '+money(o.priceCents):''}</option>`).join('')}</select>
 <div class="price">${p.quantityPrices?`<strong><small>A partir de </small>${money(Math.min(...Object.values(p.quantityPrices)))}<small>/un.</small></strong><small>— para 1.000 unidades</small>`:p.options[0].priceCents===null?'<strong>Sob orçamento</strong><small>Valor sujeito a orçamento.</small>':`<strong>${money(p.options[0].priceCents)}<small>/folha</small></strong><small>R$ 3,00 por face · sem desconto automático</small>`}</div>
 <div class="product-action"><label for="qty-${p.id}">${p.id==='cartoes'?'Lotes':'Qtd.'}</label><input id="qty-${p.id}" type="number" min="1" max="100000" step="1" value="${p.defaultQuantity||1}" inputmode="numeric" aria-label="Quantidade de ${p.id==='cartoes'?'lotes de ':''}${p.name}"></div>
 <button class="add-product" data-add="${p.id}">${p.id==='a3'||p.quantityPrices?'Adicionar ao carrinho':'Solicitar orçamento'}</button></div></article>`).join('');
 $('.empty-results').hidden=visible.length>0;
 $('#search-status').textContent=query||category!=='todos'?`${visible.length} produto(s) encontrado(s)` : '';
}
function renderCart(){
 const summary=summarize(cart);
 $('#cart-title').textContent=`Meu carrinho (${cart.length})`;
 $('#cart-count').textContent=cart.length;
 $('#clear-cart').disabled=cart.length===0;
 $('#cart-items').innerHTML=summary.items.length?summary.items.map((i,n)=>`<article class="cart-item"><div class="cart-product-photo product-photo photo-${i.product.photo}" aria-hidden="true"></div><div class="cart-item-copy"><h3>${i.product.name}</h3><p>${i.option.label}</p><strong>${i.totalCents===null?'Sob orçamento':money(i.totalCents)}</strong>${i.totalCents!==null?`<small>Unitário: ${money(i.option.priceCents)}</small>`:''}<div class="quantity-control"><button data-change="${n}" data-delta="-1" ${i.quantity===1?'disabled':''} aria-label="Diminuir quantidade de ${i.product.name}">−</button><input type="number" min="1" max="100000" step="1" value="${i.quantity}" data-quantity="${n}" aria-label="Quantidade no carrinho de ${i.product.name}" inputmode="numeric"><button data-change="${n}" data-delta="1" aria-label="Aumentar quantidade de ${i.product.name}">+</button><button class="remove" data-remove="${n}" aria-label="Remover ${i.product.name}">${icon('trash')}</button></div></div></article>`).join(''):'<div class="empty-cart">'+icon('cart')+'<b>Seu carrinho está vazio</b><p>Escolha os produtos para montar sua solicitação.</p></div>';
 $('#cart-totals').innerHTML=`<div><b>${summary.pending?'Subtotal calculado':'Subtotal'}</b><strong>${money(summary.knownTotalCents)}</strong></div>${summary.pending?`<p>${summary.pending} item(ns) sob orçamento, sem valor incluído no subtotal. O total final será informado pela equipe.</p>`:''}`;
 const checkout=$('#checkout');
 if(cart.length){checkout.href=whatsappUrl(cart);checkout.setAttribute('aria-disabled','false');}else{checkout.removeAttribute('href');checkout.setAttribute('aria-disabled','true');}
}
$('#categories').addEventListener('click',e=>{const btn=e.target.closest('[data-category]');if(!btn)return;category=btn.dataset.category;renderCategories();renderProducts();});
$('.search').addEventListener('submit',e=>{e.preventDefault();query=$('#search').value.trim();renderProducts();$('#produtos').scrollIntoView({behavior:'smooth',block:'start'});});
$('#search').addEventListener('input',e=>{query=e.target.value.trim();renderProducts();});
$('.all-products').addEventListener('click',()=>{category='todos';query='';$('#search').value='';renderCategories();renderProducts();});
$('#product-grid').addEventListener('change',e=>{
 if(!e.target.matches('.product-option'))return;
 const product=products.find(p=>p.id===e.target.closest('[data-product]').dataset.product);
 if(product.quantityPrices){
  const input=$(`#qty-${product.id}`);
  if(e.target.value!=='other')input.value=e.target.value;
  else if(Object.hasOwn(product.quantityPrices,Number(input.value)))input.value='1';
  syncQuantityPrice(product);return;
 }
 const option=product.options.find(o=>o.id===e.target.value);
 if(option.priceCents!==null)e.target.closest('.product-content').querySelector('.price strong').innerHTML=money(option.priceCents)+'<small>/folha</small>';
});
function syncQuantityPrice(product){
 const amount=Number($(`#qty-${product.id}`).value),priced=Object.hasOwn(product.quantityPrices,amount);
 $(`#option-${product.id}`).value=priced?String(amount):'other';
 $(`[data-add="${product.id}"]`).textContent=priced?'Adicionar ao carrinho':'Solicitar orçamento';
}
$('#product-grid').addEventListener('input',e=>{
 if(!e.target.matches('.product-action input'))return;
 const product=products.find(p=>p.id===e.target.closest('[data-product]').dataset.product);
 if(product.quantityPrices)syncQuantityPrice(product);
});
$('#product-grid').addEventListener('click',e=>{
 const button=e.target.closest('[data-add]');if(!button)return;
 const id=button.dataset.add;const input=$(`#qty-${id}`);
 const product=products.find(p=>p.id===id);
 try{cart=addItem(cart,id,product.quantityPrices?product.options[0].id:$(`#option-${id}`).value,input.value);save();toast(`${product.name}: adicionado ao carrinho.`);}catch(error){input.focus();toast(error.message);}
});
$('#cart-items').addEventListener('click',e=>{
 const remove=e.target.closest('[data-remove]');const change=e.target.closest('[data-change]');
 if(remove){cart=cart.filter((_,n)=>n!==Number(remove.dataset.remove));save();return;}
 if(change){try{const index=Number(change.dataset.change);cart[index].quantity=quantity(cart[index].quantity+Number(change.dataset.delta));save();}catch(error){toast(error.message);}}
});
$('#cart-items').addEventListener('change',e=>{
 if(!e.target.matches('[data-quantity]'))return;
 const i=Number(e.target.dataset.quantity);
 try{cart[i].quantity=quantity(e.target.value);save();}catch(error){e.target.value=cart[i].quantity;toast(error.message);}
});
$('#clear-cart').addEventListener('click',()=>{cart=[];save();toast('Carrinho limpo.');});
$('#checkout').addEventListener('click',e=>{if(!cart.length){e.preventDefault();toast('Adicione um produto antes de continuar.');}});
function closeCart(){document.body.classList.remove('cart-open');$('.backdrop').hidden=true;$('.cart-toggle').setAttribute('aria-expanded','false');$('#cart').removeAttribute('role');$('#cart').removeAttribute('aria-modal');$('.cart-toggle').focus();}
$('.cart-toggle').addEventListener('click',()=>{
 if(matchMedia('(min-width: 1101px)').matches){$('#cart').scrollIntoView({behavior:'smooth'});$('#cart-title').tabIndex=-1;$('#cart-title').focus({preventScroll:true});return;}
 const open=!document.body.classList.contains('cart-open');if(!open){closeCart();return;}
 document.body.classList.add('cart-open');$('.backdrop').hidden=false;$('.cart-toggle').setAttribute('aria-expanded','true');$('#cart').setAttribute('role','dialog');$('#cart').setAttribute('aria-modal','true');$('.cart-close').focus();
});
$('.cart-close').addEventListener('click',closeCart);$('.backdrop').addEventListener('click',closeCart);
document.addEventListener('keydown',e=>{
 if(!document.body.classList.contains('cart-open'))return;
 if(e.key==='Escape')closeCart();
 if(e.key==='Tab'){const list=[...$('#cart').querySelectorAll('a[href],button:not(:disabled),input')].filter(el=>el.getClientRects().length);const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
matchMedia('(min-width: 1101px)').addEventListener('change',e=>{if(e.matches&&document.body.classList.contains('cart-open'))closeCart();});
window.addEventListener('storage',e=>{if(e.key===CART_KEY||e.key===null){cart=restoreCart(e.newValue);renderCart();}});
renderCategories();renderProducts();renderCart();
