// Pré-renderização idempotente. Preços/opções continuam vindo só do catálogo atual.
import {readFile,writeFile} from 'node:fs/promises';
import {products} from '../../assets/loja/catalog.js';
import {renderProductCard} from '../../assets/loja/product-card.js';
import {renderShowcaseFilters} from '../../assets/loja/showcase.js';
const origin='https://idygrafica.netlify.app/';
const html=await readFile('index.html','utf8');
const marker=/<!-- idy:catalog:start -->[\s\S]*?<!-- idy:catalog:end -->/;
if(!marker.test(html))throw new Error('Marcadores do catálogo ausentes. Não sobrescrever o HTML.');
const cards=products.map(renderProductCard).join('');
// A loja é uma coleção. Não inventar ofertas, avaliações, estoque ou URLs próprias.
const schema={
 '@context':'https://schema.org',
 '@graph':[
  {'@type':'CollectionPage','@id':origin+'#webpage',url:origin,name:'Loja IDY Gráfica em Porto Alegre',inLanguage:'pt-BR',isPartOf:{'@id':origin+'#website'},mainEntity:{'@id':origin+'#catalogo'}},
  {'@type':'ItemList','@id':origin+'#catalogo',name:'Produtos da IDY Gráfica',numberOfItems:products.length,itemListElement:products.map((p,index)=>({'@type':'ListItem',position:index+1,item:{'@type':'Thing','@id':origin+'#produto-'+p.id,name:p.name,description:p.description,url:origin+'#produto-'+p.id}}))}
 ]
};
const json=JSON.stringify(schema).replace(/</g,'\\u003c');
const next=html.replace(marker,'<!-- idy:catalog:start -->'+cards+'<!-- idy:catalog:end -->').replace(/(<script type="application\/ld\+json" id="idy-catalog-schema">)[\s\S]*?(<\/script>)/,'$1'+json+'$2');
await writeFile('index.html',next.replace(/<!-- idy:filters:start -->[\s\S]*?<!-- idy:filters:end -->/,'<!-- idy:filters:start -->'+renderShowcaseFilters()+'<!-- idy:filters:end -->'));
console.log('Catálogo inicial gerado com '+products.length+' produtos, usando o mesmo componente da loja.');
