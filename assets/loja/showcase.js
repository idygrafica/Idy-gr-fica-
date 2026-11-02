import {digitalProducts} from './digital-products.js';
// Apresentação e filtros derivados do catálogo, sem acrescentar dados comerciais.
import {products,categories} from './catalog.js';
export const productPhotos=Object.fromEntries(products.map(p=>[p.id,{
 src:digitalProducts[p.id]?.photo||`/assets/loja/produtos/${p.id}.webp`,
 alt:`${p.name}: apresentação ilustrativa do produto`
}]));
export function papersOf(product){
 const text=[product.description,...product.options.map(o=>o.label)].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return [['sulfite',/sulfite comum/],['couche-300',/couche\s*300\s*g/],['papel-75',/(?:papel|a4)\s*75\s*g/],['supremo-250',/supremo\s*250\s*g/]].filter(([,pattern])=>pattern.test(text)).map(([id])=>id);
}
export const paperOf=product=>papersOf(product)[0]||null;
const paperLabels={'couche-300':'Couchê 300 g',sulfite:'Sulfite comum','papel-75':'Papel 75 g','supremo-250':'Supremo 250 g'};
export const paperFilters=[...new Set(products.flatMap(papersOf))].map(id=>({id,label:paperLabels[id]}));
export const normalizeSearch=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/(\d)\s*[×x]\s*(?=\d)/g,'$1x').replace(/(\d)\s+(g|cm|mm)\b/g,'$1$2').replace(/[^a-z0-9]+/g,' ').trim();
export function matchesProduct(product,{category='todos',paper='todos',query=''}={}){
 if(category!=='todos'&&product.category!==category)return false;
 if(paper!=='todos'&&!papersOf(product).includes(paper))return false;
 const text=normalizeSearch([product.name,product.description,digitalProducts[product.id]?.name||'',digitalProducts[product.id]?.description||'',...product.options.map(o=>o.label)].join(' '));
 return normalizeSearch(query).split(' ').filter(Boolean).every(term=>text.includes(term));
}
export function renderShowcaseFilters(){return `<div class="showcase-tools"><div class="showcase-filter"><label for="category-filter">Categoria</label><select id="category-filter">${categories.map(c=>`<option value="${c.id}">${c.label}</option>`).join('')}</select></div><div class="showcase-filter"><label for="paper-filter">Papel</label><select id="paper-filter"><option value="todos">Todos os papéis e materiais</option>${paperFilters.map(p=>`<option value="${p.id}">${p.label}</option>`).join('')}</select></div><p class="showcase-search-hint">Busque por produto, formato ou papel.<br><span>Filtros usam as informações cadastradas.</span></p></div>`;}
