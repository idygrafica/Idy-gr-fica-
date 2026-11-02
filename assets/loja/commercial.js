// Mesmas funções comerciais do carrinho para a apresentação das opções aprovadas.
import {products} from './catalog.js';
import {itemDetails,summarize,money} from './cart.js';
export const commercialProduct=p=>p.id==='a3'||p.id==='blocos'||p.id==='pastas';
export function commercialArtwork(card){
 if(!card?.querySelector('[data-commercial]'))return undefined;
 const product=products.find(p=>p.id===card.dataset.product),option=product.options.find(o=>o.id===card.querySelector('.product-option').value);
 if(!option.allowsArtwork)return undefined;
 const mode=card.querySelector('[data-commercial-artwork]:checked')?.value||'ready';
 return {mode,reference:card.querySelector('[data-commercial-reference]')?.value};
}
function breakdown(item){
 const i=itemDetails(item),s=summarize([item]);
 return `<div><span>Valor unitário${i.product.id==='pastas'?' por pasta':i.option.quantityTotals?' por bloco':' por folha'}</span><strong>${i.option.priceCents===null?'Sob consulta':money(i.option.priceCents)}</strong></div><div><span>Subtotal do produto</span><strong>${i.totalCents===null?'Sob consulta':money(i.totalCents)}</strong></div>${i.artwork?`<div><span>Criação da arte</span><strong>${money(s.artworkTotalCents)}</strong></div>`:''}<div><span>Total ${s.pending?'final':'da configuração'}</span><strong>${s.pending?'Sob consulta':money(s.knownTotalCents)}</strong></div>${s.pending?'<p>Quantidade ou especificação sob consulta. Não há preço de produção aprovado para esta seleção.</p>':''}${s.artworkTotalCents?'<p>A mesma arte identificada no carrinho é cobrada uma única vez. Criação complexa depende de orçamento.</p>':''}`;
}
export function renderCommercialControls(p){
 if(!commercialProduct(p))return '';
 const option=p.options[0],tiers=option.quantityTotals,folder=p.id==='pastas';
 return `<div data-commercial>${p.id==='blocos'||folder?`<div class="commercial-tiers"${tiers?'':' hidden'}><label for="tier-${p.id}">${folder?'Tiragem de pastas':'Tiragem do receituário'}</label><select id="tier-${p.id}" class="commercial-tier">${Object.entries(tiers||{}).map(([n,t])=>`<option value="${n}">${n} ${folder?'pasta(s)':'bloco(s)'} · ${money(t)} no total</option>`).join('')}<option value="other">Outra quantidade · sob consulta</option></select></div><fieldset class="commercial-artwork"${option.allowsArtwork?'':' hidden'}><legend>${folder?'Arte do trabalho':'Arte do receituário'}</legend><label class="digital-choice"><input type="radio" name="artwork-${p.id}" data-commercial-artwork value="ready" checked> Já tenho minha arte — sem custo de criação</label><label class="digital-choice"><input type="radio" name="artwork-${p.id}" data-commercial-artwork value="create"> Contratar criação — R$ 100,00 por ${folder?'trabalho':'arte'}</label><div class="commercial-reference" hidden><label for="reference-${p.id}">Nome da arte</label><input id="reference-${p.id}" maxlength="80" data-commercial-reference value="${folder?'Pasta com bolsa':'Receituário A5'}"><small>Use o mesmo nome para a mesma arte no pedido. Para outra arte, informe outro nome.</small></div><p class="digital-note">Criação complexa ou projeto especial: orçamento específico. Encaminhe o arquivo pelo atendimento no WhatsApp.</p></fieldset>`:''}<div class="digital-totals commercial-totals" role="status" aria-live="polite">${breakdown({productId:p.id,optionId:option.id,quantity:p.defaultQuantity||1,...(option.allowsArtwork?{artwork:{mode:'ready'}}:{})})}</div></div>`;
}
export function installCommercialControls(){
 const grid=document.querySelector('#product-grid');
 function update(card){
  const p=products.find(p=>p.id===card.dataset.product);if(!commercialProduct(p))return;
  const option=p.options.find(o=>o.id===card.querySelector('.product-option').value),q=Number(card.querySelector('.product-action input').value);
  const tier=card.querySelector('.commercial-tier');if(tier){tier.value=option.quantityTotals&&Object.hasOwn(option.quantityTotals,q)?String(q):'other';card.querySelector('.commercial-tiers').hidden=!option.quantityTotals;card.querySelector('.commercial-artwork').hidden=!option.allowsArtwork;}
  const artwork=card.querySelector('[data-commercial-artwork]:checked')?.value==='create';const reference=card.querySelector('.commercial-reference');if(reference)reference.hidden=!artwork;
  try{
   const item={productId:p.id,optionId:option.id,quantity:q,artwork:commercialArtwork(card)},i=itemDetails(item);
   card.querySelector('.commercial-totals').innerHTML=breakdown(item);card.querySelector('.price strong').innerHTML=i.option.priceCents===null?'Sob consulta':money(i.option.priceCents)+`<small>/${p.id==='pastas'?'pasta':option.quantityTotals?'bloco':'folha'}</small>`;
   card.querySelector('.price>small').textContent=p.id==='pastas'?'Preço da tiragem selecionada · outras quantidades sob consulta':option.quantityTotals?'50 folhas por bloco · valor da tiragem selecionada':p.id==='a3'?'Preço por folha da opção selecionada':'Especificação sob consulta';
   card.querySelector('[data-add]').textContent=i.totalCents===null?'Solicitar orçamento':'Adicionar ao carrinho';
  }catch(error){card.querySelector('.commercial-totals').textContent=error.message;}
 }
 grid.addEventListener('change',e=>{const card=e.target.closest('[data-product]');if(!card?.querySelector('[data-commercial]'))return;
  if(e.target.matches('.commercial-tier')){const input=card.querySelector('.product-action input');input.value=e.target.value==='other'?(card.dataset.product==='pastas'?'101':'2'):e.target.value;}
  update(card);
 });
 grid.addEventListener('input',e=>{if(!e.target.matches('.product-action input,[data-commercial-reference]'))return;const card=e.target.closest('[data-product]');if(card?.querySelector('[data-commercial]'))update(card);});
}
