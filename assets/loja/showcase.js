import {digitalProducts} from './digital-products.js';
// Apresentação e filtros derivados do catálogo, sem acrescentar dados comerciais.
import {products,categories} from './catalog.js';
export const productPhotos=Object.fromEntries(products.map(p=>[p.id,{
 src:digitalProducts[p.id]?.photo||`/assets/loja/produtos/${p.id}.webp`,
 alt:`${p.name}: apresentação ilustrativa do produto`
}]));
export function paperOf(product){
 const description=product.description.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/couche\s*300\s*g/.test(description))return 'couche-300';
 if(description.includes('sulfite comum'))return 'sulfite';
 return null;
}
const paperLabels={'couche-300':'Couchê 300 g',sulfite:'Sulfite comum'};
export const paperFilters=[...new Set(products.map(paperOf).filter(Boolean))].map(id=>({id,label:paperLabels[id]}));
export const normalizeSearch=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/(\d)\s*[×x]\s*(?=\d)/g,'$1x').replace(/(\d)\s+(g|cm|mm)\b/g,'$1$2').replace(/[^a-z0-9]+/g,' ').trim();
export function matchesProduct(product,{category='todos',paper='todos',query=''}={}){
 if(category!=='todos'&&product.category!==category)return false;
 if(paper!=='todos'&&paperOf(product)!==paper)return false;
 const text=normalizeSearch([product.name,product.description,digitalProducts[product.id]?.name||'',digitalProducts[product.id]?.description||'',...product.options.map(o=>o.label)].join(' '));
 return normalizeSearch(query).split(' ').filter(Boolean).every(term=>text.includes(term));
}
export function renderShowcaseFilters(){return `<div class="showcase-tools"><div class="showcase-filter"><label for="category-filter">Categoria</label><select id="category-filter">${categories.map(c=>`<option value="${c.id}">${c.label}</option>`).join('')}</select></div><div class="showcase-filter"><label for="paper-filter">Papel</label><select id="paper-filter"><option value="todos">Todos os papéis e materiais</option>${paperFilters.map(p=>`<option value="${p.id}">${p.label}</option>`).join('')}</select></div><p class="showcase-search-hint">Busque por produto, formato ou papel.<br><span>Filtros usam as informações cadastradas.</span></p></div>`;}
