import { products } from './catalog.js';
export const CART_KEY = 'loja-idy.cart.v1';
export const money = cents => new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL'}).format(cents/100);
export function quantity(value) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1 || n > 100000) throw new Error('Informe uma quantidade inteira entre 1 e 100.000.');
  return n;
}
export function itemDetails(item) {
  const product = products.find(p=>p.id===item.productId);
  const option = product?.options.find(o=>o.id===item.optionId);
  if (!option) throw new Error('Produto ou opção indisponível.');
  return {...item, quantity:quantity(item.quantity), product, option, totalCents:option.priceCents===null ? null : option.priceCents*quantity(item.quantity)};
}
export function restoreCart(raw) {
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    let cart=[];
    for (const item of data.slice(0,100)) {
      try { cart=addItem(cart,item.productId,item.optionId,item.quantity); } catch { /* Entrada inválida não vira pedido. */ }
    }
    return cart;
  } catch { return []; }
}
export function addItem(cart, productId, optionId, amount) {
  itemDetails({productId,optionId,quantity:amount});
  const next = cart.map(i=>({...i}));
  const item = next.find(i=>i.productId===productId && i.optionId===optionId);
  if (item) item.quantity=quantity(item.quantity+quantity(amount));
  else next.push({productId,optionId,quantity:quantity(amount)});
  return next;
}
export function summarize(cart) {
  const items=cart.map(itemDetails);
  return { items, knownTotalCents:items.reduce((sum,i)=>sum+(i.totalCents??0),0), pending:items.filter(i=>i.totalCents===null).length };
}
export function whatsappUrl(cart) {
  if (!cart.length) throw new Error('Adicione um produto antes de continuar.');
  const {items,knownTotalCents,pending}=summarize(cart);
  const lines=['Olá! Vim pela loja virtual da IDY Gráfica e gostaria de atendimento para estes itens:', ...items.map(i=>[
    `• ${i.product.name} — ${i.option.label}`,
    `Quantidade: ${i.quantity}${i.product.id==='a3'?' folha(s)':i.product.id==='cartoes'?' lote(s)':' unidade(s)'}.`,
    i.totalCents===null ? 'Preço a confirmar: solicito orçamento.' : `Unitário: ${money(i.option.priceCents)}. Total: ${money(i.totalCents)}.`
  ].join('\n'))];
  if (items.some(i=>i.totalCents!==null)) lines.push(`${pending?'Subtotal dos itens com preço aprovado':'Total dos itens'}: ${money(knownTotalCents)}.`);
  if (pending) lines.push('Os itens sob orçamento não estão incluídos nesse subtotal. Aguardo os valores e a confirmação da equipe.');
  lines.push('Solicitação sem cobrança ou pagamento automático.');
  return 'https://wa.me/5551981687562?text='+encodeURIComponent(lines.join('\n\n'));
}
