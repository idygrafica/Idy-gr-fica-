import test from 'node:test';
import assert from 'node:assert/strict';
import {products} from '../../assets/loja/catalog.js';
import {addItem,itemDetails,restoreCart,summarize,whatsappUrl} from '../../assets/loja/cart.js';
const details=n=>itemDetails({productId:'canetas',optionId:'personalizada',quantity:n});
for(const [amount,unit,total] of [[100,520,52000],[500,400,200000],[1000,360,360000]]){
 test(`${amount} canetas DTF UV: unitário ${unit} e total ${total} centavos`,()=>{
  const d=details(amount);assert.equal(d.option.priceCents,unit);assert.equal(d.totalCents,total);assert.equal(d.option.label,'Personalização DTF UV');
  assert.equal(summarize(addItem([],'canetas','personalizada',amount)).knownTotalCents,total);
 });
}
test('somente as três quantidades exatas têm preço; não há desconto por faixas ou interpolação',()=>{
 for(const n of [1,99,101,200,499,501,999,1001,2000,100000]){const d=details(n);assert.equal(d.option.priceCents,null);assert.equal(d.totalCents,null);}
 assert.deepEqual(products.find(p=>p.id==='canetas').quantityPrices,{100:520,500:400,1000:360});
});
test('edição da quantidade recalcula e remove preço anterior ao entrar em quantidade não cadastrada',()=>{
 const cart=addItem([],'canetas','personalizada',100);
 for(const [n,total,pending] of [[500,200000,0],[101,0,1],[1000,360000,0],[1001,0,1],[100,52000,0]]){
  cart[0].quantity=n;const s=summarize(cart);assert.equal(s.knownTotalCents,total);assert.equal(s.pending,pending);
 }
});
test('acúmulo da mesma personalização aplica a quantidade final e evita preço residual',()=>{
 let cart=addItem([],'canetas','personalizada',100);cart=addItem(cart,'canetas','personalizada',400);
 assert.equal(cart.length,1);assert.equal(summarize(cart).knownTotalCents,200000);
 cart=addItem(cart,'canetas','personalizada',1);assert.equal(summarize(cart).pending,1);assert.equal(summarize(cart).knownTotalCents,0);
});
test('carrinho salvo e carrinho antigo usam a tabela atual sem aceitar preço injetado',()=>{
 const cart=restoreCart(JSON.stringify([{productId:'canetas',optionId:'personalizada',quantity:500,priceCents:1,totalCents:500}]));
 assert.equal(summarize(cart).knownTotalCents,200000);
 assert.equal(summarize(restoreCart('[{"productId":"canetas","optionId":"personalizada","quantity":1}]')).pending,1);
});
test('pedido misto separa canetas sob orçamento da A3, sem cobrar zero ou reutilizar preço de outra quantidade',()=>{
 const cart=addItem(addItem([],'a3','frente',3),'canetas','personalizada',101);const text=new URL(whatsappUrl(cart)).searchParams.get('text');
 assert.equal(summarize(cart).knownTotalCents,900);assert.equal(summarize(cart).pending,1);
 assert.match(text,/101 unidade/);assert.match(text,/Preço a confirmar/);assert.match(text,/Subtotal dos itens com preço aprovado: R\$\s9,00/);
 assert.doesNotMatch(text,/5,20|4,00|3,60/);
});
test('mensagem comercial usa quantidade, DTF UV, valor unitário e total aprovado',()=>{
 const url=new URL(whatsappUrl(addItem([],'canetas','personalizada',500)));const text=url.searchParams.get('text');
 assert.equal(url.pathname,'/5551981687562');assert.match(text,/Personalização DTF UV/);assert.match(text,/500 unidade/);assert.match(text,/Unitário: R\$\s4,00/);assert.match(text,/Total: R\$\s2\.000,00/);
});
