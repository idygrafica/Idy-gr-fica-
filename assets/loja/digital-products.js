// Tabelas comerciais vazias: referências de terceiros nunca são preços de venda.
export const digitalProducts={
 'blocos-personalizados':{kind:'blocos',url:'/blocos-personalizados',name:'Blocos personalizados',description:'A4, A5 e A6 · offset 90 g · 50 folhas · colorido na frente (4×0)',quantities:[5,20,50,100],formats:['A5','A4','A6'],photo:'/assets/loja/produtos/blocos.webp',note:'Preto e branco, outro papel, quantidade de folhas ou acabamento: orçamento específico.'},
 'pastas-digitais-simples':{kind:'pastas',url:'/pastas-digitais-simples',name:'Pastas digitais simples',description:'Impressão digital e vinco · acabamento simples, sem bolsa',quantities:[100,200,500,1000],formats:['Simples'],photo:'/assets/loja/produtos/pastas-simples.webp',note:'Papel, formato, montagem e viabilidade serão confirmados no orçamento. Bolsa, recorte, laminação e verniz UV não estão incluídos.'}
};
export const approvedDigitalTotals={'blocos-personalizados':{A4:{},A5:{},A6:{}},'pastas-digitais-simples':{Simples:{}}};
export const ARTWORK_PRICE_CENTS=10000;
export const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const isDigitalOption=id=>typeof id==='string'&&id.startsWith('digital:');
// Compatibilidade com solicitações salvas na prévia anterior; os IDs originais continuam independentes.
export const digitalProductId=id=>id==='blocos'?'blocos-personalizados':id==='pastas'?'pastas-digitais-simples':id;
export function digitalOption(productId,optionId){
 const config=digitalProducts[productId],format=optionId?.slice(8);
 if(!config?.formats.includes(format))return null;
 return {id:optionId,label:config.kind==='blocos'?`${format} · offset 90 g · 50 folhas · 4×0`:'Pasta digital simples · impressão digital e vinco · sem bolsa',priceCents:null};
}
export function normalizeArtwork(artwork){
 if(!artwork||!['ready','create'].includes(artwork.mode))throw new Error('Escolha se já tem a arte ou deseja criação.');
 if(artwork.mode==='ready')return {mode:'ready'};
 const reference=String(artwork.reference||'').trim().replace(/\s+/g,' ');
 if(!reference||reference.length>80)throw new Error('Identifique a arte com um nome de até 80 caracteres.');
 return {mode:'create',reference};
}
export const artworkKey=a=>a?.mode==='create'?a.reference.normalize('NFC').toLocaleLowerCase('pt-BR'):'';
export function digitalPrice(productId,optionId,amount){
 const format=optionId.slice(8),total=approvedDigitalTotals[productId]?.[format]?.[amount];
 // Preço deve representar centavos totais da tiragem exata. Sem interpolação.
 return Number.isSafeInteger(total)&&total>0?{totalCents:total,unitCents:total/amount}:null;
}
