import test from 'node:test';
import assert from 'node:assert/strict';
import {products} from '../../assets/loja/catalog.js';
import {addItem,itemDetails,restoreCart,summarize,whatsappUrl,quantity,money} from '../../assets/loja/cart.js';
test('os oito produtos originais e dois novos estão cadastrados com IDs únicos',()=>{
 assert.equal(products.length,10);assert.equal(new Set(products.map(p=>p.id)).size,10);
});
test('preço fixo por folha permanece exclusivo da A3; demais opções não recebem valores inventados',()=>{
 for(const p of products)for(const o of p.options)assert.equal(o.priceCents,p.id==='a3'?(o.id==='frente'?300:600):null);
});
for (const [qty,side,total] of [[1,'frente',300],[3,'frente',900],[10,'frente',3000],[100,'frente',30000],[1,'duplex',600],[3,'duplex',1800],[10,'duplex',6000],[100,'duplex',60000]]) {
 test(`${qty} folha(s) A3 ${side}: ${total} centavos`,()=>assert.equal(summarize(addItem([],'a3',side,qty)).knownTotalCents,total));
}
test('mesma opção acumula quantidades, frente e verso permanece separado',()=>{
 let cart=addItem([],'a3','frente',2);cart=addItem(cart,'a3','frente',1);cart=addItem(cart,'a3','duplex',2);
 assert.equal(cart.length,2);assert.equal(cart[0].quantity,3);assert.equal(summarize(cart).knownTotalCents,2100);
});
test('itens sob orçamento não recebem preço fictício nem viram total fechado',()=>{
 const cart=addItem(addItem([],'a3','frente',3),'cartoes','500',1);const summary=summarize(cart);
 assert.equal(summary.knownTotalCents,900);assert.equal(summary.pending,1);assert.equal(summary.items[1].totalCents,null);
 const text=new URL(whatsappUrl(cart)).searchParams.get('text');
 assert.match(text,/Subtotal dos itens com preço aprovado/);assert.match(text,/Preço a confirmar/);assert.doesNotMatch(text,/85,00|94,00/);
});
test('carrinho guarda apenas IDs e quantidades, nunca aceita preço injetado no armazenamento',()=>{
 const cart=restoreCart(JSON.stringify([{productId:'a3',optionId:'frente',quantity:3,priceCents:1,totalCents:1}]));
 assert.deepEqual(cart,[{productId:'a3',optionId:'frente',quantity:3}]);assert.equal(summarize(cart).knownTotalCents,900);
});
test('armazenamento quebrado, opções removidas e quantidades inválidas não geram pedidos',()=>{
 for(const raw of ['broken','{}','null','1','[{"productId":"x"}]'])assert.deepEqual(restoreCart(raw),[]);
 for(const value of [0,-1,1.5,Infinity,NaN,100001,'', 'abc'])assert.throws(()=>quantity(value));
 assert.throws(()=>itemDetails({productId:'a3',optionId:'inventado',quantity:1}));
});
test('restauração consolida duplicados e preserva a quantidade válida',()=>{
 const cart=restoreCart(JSON.stringify([{productId:'a3',optionId:'frente',quantity:2},{productId:'a3',optionId:'frente',quantity:1}]));
 assert.equal(cart.length,1);assert.equal(cart[0].quantity,3);
});
test('link comercial correto, texto codificado e A3 calculada de forma determinística',()=>{
 const link=new URL(whatsappUrl(addItem([],'a3','frente',3)));assert.equal(link.origin,'https://wa.me');assert.equal(link.pathname,'/5551981687562');
 assert.match(link.searchParams.get('text'),/Total: R\$\s9,00/);assert.match(link.searchParams.get('text'),/Unitário: R\$\s3,00/);
 assert.throws(()=>whatsappUrl([]));assert.match(money(60000),/600,00/);
});
