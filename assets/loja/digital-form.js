import {digitalPrice,normalizeArtwork,ARTWORK_PRICE_CENTS} from './digital-products.js';
import {money} from './cart.js';
export function installDigitalForms({add,getCheckout,notify}){
 const grid=document.querySelector('#product-grid');
 function selection(form){const data=new FormData(form);return {id:form.dataset.digital,optionId:'digital:'+data.get('format'),quantity:Number(data.get('quantity')),artwork:normalizeArtwork({mode:data.get('artwork'),reference:data.get('reference')})};}
 function refresh(form){
  const mode=form.elements.artwork.value,create=mode==='create';form.querySelector('.artwork-reference').hidden=!create;form.elements.reference.required=create;
  const price=digitalPrice(form.dataset.digital,'digital:'+form.elements.format.value,Number(form.elements.quantity.value));
  const values=form.querySelectorAll('.digital-totals strong');values[0].textContent=price?money(price.unitCents):'Sob consulta';values[1].textContent=price?money(price.totalCents):'Sob consulta';values[2].textContent=money(create?ARTWORK_PRICE_CENTS:0);values[3].textContent=price?money(price.totalCents+(create?ARTWORK_PRICE_CENTS:0)):'Sob consulta';
  form.querySelector('[data-digital-status]').textContent=price?'Valores desta configuração. Uma arte com o mesmo nome já no pedido é cobrada apenas uma vez.':'A produção ainda não tem preço aprovado. O valor de criação não é o total do produto.';
  form.querySelector('[data-digital-add]').textContent=price?'Adicionar ao carrinho':'Incluir na solicitação';
 }
 grid.addEventListener('change',e=>{const f=e.target.closest('.digital-form');if(f)refresh(f);});
 function submit(form,openWhatsApp){
  if(!form.reportValidity())return;
  try{const v=selection(form);add(v);if(openWhatsApp)window.open(getCheckout(),'_blank','noopener,noreferrer');else notify('Configuração incluída no carrinho. Produção sob consulta; criação cobrada uma vez por arte.');}catch(error){notify(error.message);}
 }
 grid.addEventListener('click',e=>{const b=e.target.closest('[data-digital-add]');if(b)submit(b.closest('form'),false);});
 grid.addEventListener('submit',e=>{const form=e.target.closest('.digital-form');if(!form)return;e.preventDefault();submit(form,true);});
}
