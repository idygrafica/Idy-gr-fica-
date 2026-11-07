import test from 'node:test';
import assert from 'node:assert/strict';
import {initialEstimateReference,initialEstimate,initialEstimateTable} from '../../assets/loja/comandas-initial-estimate.js';
import {newProductionCostConfig,referenceTotals} from '../../assets/loja/comandas-cost-config.js';
import {comandaConfig} from '../../assets/loja/comandas-config.js';

test('orçamento informado soma R$48,16 em quatro parcelas estimadas',()=>{
 const r=initialEstimate(50);assert.equal(r.costCents,4816);assert.deepEqual(r.values.map(v=>v.cents),[2316,1500,500,500]);
 assert.equal(r.approvedForSale,false);assert.equal(r.calibrationUsed,false);assert.equal(r.extrapolated,false);
 assert(r.values.every(v=>!v.extrapolated&&v.source.includes('estimada')));
});
test('não presume formato, papel, cor ou equipamento do orçamento específico',()=>{
 for(const k of ['widthCm','heightCm','paper','color','equipment'])assert.equal(initialEstimateReference[k],null);
});
for(const [model,rows] of Object.entries({
 'services-held':[[10,2964,6049,6737],[20,3427,6994,7789],[50,4816,9829,10946],[100,7132,14556,16210]],
 proportional:[[10,964,1968,2191],[20,1927,3933,4380],[50,4816,9829,10946],[100,9632,19658,21891]]
}))for(const [blocks,cost,a,b] of rows)test(`${model}: ${blocks} blocos, custos e margens verificáveis`,()=>{
 const r=initialEstimate(blocks,model);assert.equal(r.costCents,cost);assert.equal(r.margins[0].saleCents,a);assert.equal(r.margins[1].saleCents,b);
 for(const m of r.margins){assert.equal(m.taxCents,m.saleCents*0.06);assert(m.actualMarginRate>=m.rate);assert.equal(m.profitCents,m.saleCents-r.costCents-m.taxCents);}
});
test('parcela mantida fora de 50 também é marcada como extrapolação, não como custo conhecido',()=>{
 const r=initialEstimate(10,'services-held');assert(r.values.every(v=>v.extrapolated));
 assert.equal(r.values.find(v=>v.key==='labourCents').cents,1500);assert(r.values.find(v=>v.key==='labourCents').source.includes('hipótese'));
});
test('arredondamento de custos e venda não reduz a parcela fracionária',()=>{
 const r=initialEstimate(10,'proportional');assert.equal(r.values[0].cents,464);assert.equal(r.costCents,964);
 assert.equal(r.margins[0].saleCents,1968);assert.equal(r.margins[1].saleCents,2191);
});
test('comparação usa as duas referências sem mudar os custos ou os preços simulados',()=>{
 const a=initialEstimate(10),old=referenceTotals.preta[10];
 assert.equal(a.margins[0].comparisons[0].referenceCents,9000);assert.equal(a.margins[0].comparisons[1].referenceCents,11000);
 assert.equal(a.margins[0].comparisons[0].differenceCents,6049-9000);
 try{referenceTotals.preta[10]=99999;const b=initialEstimate(10);assert.equal(b.costCents,a.costCents);assert.equal(b.margins[0].saleCents,a.margins[0].saleCents);assert.equal(b.margins[0].comparisons[0].differenceCents,b.margins[0].saleCents-99999);}finally{referenceTotals.preta[10]=old;}
});
test('tiragem sem referência não inventa preço comercial comparativo',()=>{
 const r=initialEstimate(7);assert(r.margins.every(m=>m.comparisons.every(c=>c.referenceCents===null&&c.differenceCents===null)));
});
test('cenário isolado não altera custos unitários, referências ou simulação anterior',()=>{
 const a=structuredClone(newProductionCostConfig()),b=structuredClone(comandaConfig);
 initialEstimateTable('services-held');initialEstimateTable('proportional');
 assert.deepEqual(newProductionCostConfig(),a);assert.deepEqual(comandaConfig,b);
 assert.equal(newProductionCostConfig().equipment.xerox.formats.A4.maintenanceCents,null);
 assert.equal(newProductionCostConfig().labourHourlyCents,null);
});
test('tabela contém somente 10, 20, 50 e 100 e as hipóteses não são limites garantidos',()=>{
 assert.deepEqual(initialEstimateTable().map(r=>r.blocks),[10,20,50,100]);
 assert(initialEstimate(10,'services-held').costCents>initialEstimate(10,'proportional').costCents);
 assert(initialEstimate(100,'services-held').costCents<initialEstimate(100,'proportional').costCents);
});
test('entradas fora do escopo são rejeitadas',()=>{
 for(const q of [0,-1,1.5,1001,NaN,Infinity,'50'])assert.throws(()=>initialEstimate(q));
 assert.throws(()=>initialEstimate(50,'inventado'));
});
