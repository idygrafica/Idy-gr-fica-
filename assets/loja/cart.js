import {isComandaOption,comandaFromOption,comandaOption,estimateComanda,comandaLabel} from './comandas-pricing.js';
import {digitalProductId,digitalProducts,isDigitalOption,digitalOption,normalizeArtwork,digitalPrice,artworkKey,ARTWORK_PRICE_CENTS} from './digital-products.js';
import { products } from './catalog.js';
export const CART_KEY = 'loja-idy.cart.v1';
export const money = cents => new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL'}).format(cents/100);
export function quantity(value) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1 || n > 100000) throw new Error('Informe uma quantidade inteira entre 1 e 100.000.');
  return n;
}
export function itemDetails(item) {
  const productId=isDigitalOption(item.optionId)?digitalProductId(item.productId):item.productId;
  const product = products.find(p=>p.id===productId);
  if(product?.id==='comandas'&&isComandaOption(item.optionId)){
    const job=comandaFromOption(item.optionId,item.quantity),estimate=estimateComanda(job);
    if(estimate.status!=='provisional')throw Error('Medidas de comanda exigem avaliação da equipe.');
    return {productId:product.id,optionId:comandaOption(job),quantity:job.blocks,product,option:{id:comandaOption(job),label:comandaLabel(job),priceCents:null},totalCents:null,comandaEstimate:estimate};
  }
  const digital=isDigitalOption(item.optionId);
  const option = digital?digitalOption(product?.id,item.optionId):product?.options.find(o=>o.id===item.optionId);
  if (!option) throw new Error('Produto ou opção indisponível.');
  const amount=quantity(item.quantity);
  if(digital){const artwork=normalizeArtwork(item.artwork),price=digitalPrice(product.id,item.optionId,amount);return {productId:product.id,optionId:option.id,quantity:amount,artwork,product,option:{...option,priceCents:price?.unitCents??null},totalCents:price?.totalCents??null};}
  const artwork=option.allowsArtwork?normalizeArtwork(item.artwork||{mode:'ready'}):undefined;
  const {artwork:ignoredArtwork,...fields}=item;
  if(option.quantityTotals){const total=Object.hasOwn(option.quantityTotals,amount)?option.quantityTotals[amount]:null;return {...fields,quantity:amount,...(artwork?{artwork}:{}),product,option:{...option,priceCents:total===null?null:total/amount},totalCents:total};}
  const priceCents=product.quantityPrices ? (Object.hasOwn(product.quantityPrices,amount)?product.quantityPrices[amount]:null) : option.priceCents;
  return {...fields, quantity:amount, product, option:{...option,priceCents}, totalCents:priceCents===null ? null : priceCents*amount};
}
export function restoreCart(raw) {
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    let cart=[];
    for (const item of data.slice(0,100)) {
      try { cart=addItem(cart,item.productId,item.optionId,item.quantity,item.artwork); } catch { /* Entrada inválida não vira pedido. */ }
    }
    return cart;
  } catch { return []; }
}
export function addItem(cart, productId, optionId, amount, artwork) {
  const details=itemDetails({productId,optionId,quantity:amount,artwork});
  productId=details.product.id;
  artwork=details.artwork;
  if(details.comandaEstimate)optionId=details.optionId;
  const next = cart.map(i=>({...i}));
  const item = next.find(i=>i.productId===productId && i.optionId===optionId && (!artwork?!i.artwork:(i.artwork?.mode===artwork.mode&&artworkKey(i.artwork)===artworkKey(artwork))));
  if (item){const combined=quantity(item.quantity+quantity(amount));if(details.comandaEstimate)itemDetails({...item,quantity:combined});item.quantity=combined;}
  else next.push({productId,optionId,quantity:quantity(amount),...(artwork?{artwork}: {})});
  return next;
}
export function summarize(cart) {
  const items=cart.map(itemDetails);
  const artworks=[...new Map(items.filter(i=>i.artwork?.mode==='create').map(i=>[artworkKey(i.artwork),{reference:i.artwork.reference,priceCents:ARTWORK_PRICE_CENTS}])).values()];
  const productionTotalCents=items.reduce((sum,i)=>sum+(i.totalCents??0),0),artworkTotalCents=artworks.length*ARTWORK_PRICE_CENTS;
  return {items,artworks,productionTotalCents,artworkTotalCents,knownTotalCents:productionTotalCents+artworkTotalCents,pending:items.filter(i=>i.totalCents===null).length};
}
export function whatsappUrl(cart) {
  if (!cart.length) throw new Error('Adicione um produto antes de continuar.');
  const {items,knownTotalCents,pending,artworks,artworkTotalCents}=summarize(cart);
  const lines=['Olá! Vim pela loja virtual da IDY Gráfica e gostaria de atendimento para estes itens:', ...items.map(i=>[
    `• ${i.artwork?(digitalProducts[i.product.id]?.name||i.product.name):i.product.name} — ${i.option.label}`,
    ...(i.artwork?[i.artwork.mode==='create'?`Criação solicitada: ${i.artwork.reference}.`:'Arte pronta: sem custo adicional de criação.']:[]),
    ...(i.product.id==='cartoes'?[`Especificações: ${i.product.description}.`]:[]),
    i.product.id==='cartoes'?`Quantidade: ${i.quantity*Number(i.option.id)} cartões (${i.quantity} lote(s) de ${i.option.label}).`:`Quantidade: ${i.quantity}${i.product.id==='a3'?' folha(s)':i.product.id==='pastas'?' pasta(s)':i.comandaEstimate||i.option.quantityTotals?' bloco(s)':' unidade(s)'}.`,
    ...(i.comandaEstimate?[`Total de folhas: ${i.comandaEstimate.totalLeaves}.`,`Simulação provisória: ${money(i.comandaEstimate.totalCents)} no total, ${money(i.comandaEstimate.perBlockCents)} por bloco. Não é preço de venda aprovado; confirmar com a equipe.`]:[]),
    i.totalCents===null ? 'Preço a confirmar: solicito orçamento.' : `${i.product.id==='cartoes'?'Por lote de '+i.option.label:'Unitário'}: ${money(i.option.priceCents)}. Total: ${money(i.totalCents)}.`
  ].join('\n'))];
  if(artworks.length)lines.push('Criação da arte (uma vez por arte, não por unidade):',...artworks.map(a=>`${a.reference}: ${money(a.priceCents)}.`),`Subtotal de criação: ${money(artworkTotalCents)}. Criação complexa sob orçamento.`);
  if (items.some(i=>i.totalCents!==null)||artworks.length) lines.push(`${pending?'Subtotal dos itens com preço aprovado':'Total dos itens'}: ${money(knownTotalCents)}.`);
  if (pending) lines.push('Os itens sob orçamento não estão incluídos nesse subtotal. Aguardo os valores e a confirmação da equipe.');
  if(items.some(i=>i.artwork))lines.push('Total final: '+(pending?'sob consulta; produção ainda sem preço aprovado.':money(knownTotalCents))+ ' Envio dos arquivos pelo atendimento no WhatsApp.');
  lines.push('Solicitação sem cobrança ou pagamento automático.');
  return 'https://wa.me/5551981687562?text='+encodeURIComponent(lines.join('\n\n'));
}
