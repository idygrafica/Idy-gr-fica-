import test from 'node:test';
import assert from 'node:assert/strict';
import {addItem,itemDetails,restoreCart,summarize,whatsappUrl} from '../../assets/loja/cart.js';

for(const [cards,cents] of [[100,2000],[500,8900],[1000,14000]]){
 test(`${cards} cartões: preço aprovado, quantidade física e especificações no WhatsApp`,()=>{
  const cart=addItem([],'cartoes',String(cards),1);
  const summary=summarize(cart);
  assert.equal(summary.knownTotalCents,cents);
  assert.equal(summary.pending,0);
  const url=new URL(whatsappUrl(cart));
  assert.equal(url.origin,'https://wa.me');
  assert.equal(url.pathname,'/5551981687562');
  const text=url.searchParams.get('text');
  assert.match(text,new RegExp(`Quantidade: ${cards} cartões`));
  assert.match(text,/9 × 5 cm · Couchê 300 g · Impressão 4×0/);
  assert.match(text,new RegExp(`Total: R\\$\\s${(cents/100).toFixed(2).replace('.',',')}`));
  assert.match(text,/1 lote\(s\)/);
 });
}
test('cartões guardados antes da atualização preservam o lote e recebem o preço aprovado atual',()=>{
 const cart=restoreCart(JSON.stringify([{productId:'cartoes',optionId:'500',quantity:1,priceCents:1}]));
 assert.deepEqual(cart,[{productId:'cartoes',optionId:'500',quantity:1}]);
 assert.equal(summarize(cart).knownTotalCents,8900);
});
test('lotes repetidos acumulam sem confundir quantidade física com preço por cartão',()=>{
 let cart=addItem([],'cartoes','100',1);
 cart=addItem(cart,'cartoes','100',1);
 assert.equal(cart.length,1);
 assert.equal(summarize(cart).knownTotalCents,4000);
 const text=new URL(whatsappUrl(cart)).searchParams.get('text');
 assert.match(text,/Quantidade: 200 cartões \(2 lote\(s\) de 100 unidades\)/);
 assert.match(text,/Por lote de 100 unidades: R\$\s20,00/);
});
test('lotes de tiragens diferentes e outros produtos mantêm opções e totais separados',()=>{
 let cart=addItem([],'cartoes','1000',1);
 cart=addItem(cart,'cartoes','500',1);
 cart=addItem(cart,'a3','frente',3);
 const summary=summarize(cart);
 assert.equal(summary.items.length,3);
 assert.equal(summary.knownTotalCents,23800);
 assert.equal(summary.items[2].totalCents,900);
});
test('não aceita tiragens inventadas nem preços enviados pelo navegador',()=>{
 assert.throws(()=>itemDetails({productId:'cartoes',optionId:'200',quantity:1}));
 const cart=restoreCart(JSON.stringify([{productId:'cartoes',optionId:'1000',quantity:1,totalCents:1,priceCents:1}]));
 assert.equal(summarize(cart).knownTotalCents,14000);
});
