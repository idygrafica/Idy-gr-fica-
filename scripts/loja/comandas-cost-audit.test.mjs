import test from 'node:test';
import assert from 'node:assert/strict';
import {newProductionCostConfig,withLegacyEstimates} from '../../assets/loja/comandas-cost-config.js';
import {purchaseReferences,paper75A4Cents,estimated54PaperCents,requestedMargins} from '../../assets/loja/comandas-purchase-references.js';
import {auditCostInputs,compareRequestedMargins} from '../../assets/loja/comandas-cost-audit.js';
import {fictionalCosts} from './comandas-costs.fixture.mjs';
const job={widthCm:10,heightCm:7,paper:75,color:'preta',blocks:10};
test('referência A4 75 g mantém o custo exato de R$26 por 500 folhas',()=>{
 assert.equal(purchaseReferences.paper75A4.packageCents,2600);assert.equal(purchaseReferences.paper75A4.sheets,500);
 assert.equal(paper75A4Cents,5.2);assert.equal(newProductionCostConfig().paperCents[75].A4,5.2);
});
test('papel 54 g conserva a referência da folha bruta, sem tratá-la como A4',()=>{
 const p=purchaseReferences.paper54Raw;assert.equal(p.packageCents,3441);assert.equal(p.sheets,33);assert.equal(p.widthCm,66);assert.equal(p.heightCm,96);
 assert.equal(estimated54PaperCents('A4'),11.59);assert.equal(estimated54PaperCents('A3'),26.07);
 assert(3*21<=p.widthCm&&3*29.7<=p.heightCm);assert(2*29.7<=p.widthCm&&2*42<=p.heightCm);
});
test('estimativas 54 g são derivadas e não aparecem como compras confirmadas A4/A3',()=>{
 const c=withLegacyEstimates(newProductionCostConfig()),a=auditCostInputs(c);
 assert.equal(a.confirmed.length,2);assert(a.confirmed.some(r=>r.label.includes('66 × 96')));
 for(const format of ['A4','A3']){
  const row=a.estimated.find(r=>r.path===`paperCents.54.${format}`);assert(row);assert.match(row.source,/rendimento teórico/);
 }
});
test('HP preta A4 R$0,02 é estimativa e não habilita A3',()=>{
 const c=withLegacyEstimates(newProductionCostConfig()),a=auditCostInputs(c);
 assert.equal(c.equipment.hp.formats.A4.printCents.preta,2);
 assert(a.estimated.some(r=>r.path==='equipment.hp.formats.A4.printCents.preta'));
 assert.equal(c.equipment.hp.formats.A3.supported,null);
 assert(a.pending.some(r=>r.path==='equipment.hp.formats.A3.supported'));
 assert.equal(c.equipment.hp.formats.A3.printCents.preta,null);
});
test('imposto e margens desejadas ficam separados dos custos de compra',()=>{
 const c=newProductionCostConfig(),a=auditCostInputs(c);
 assert.equal(c.taxRate,0.06);assert.equal(c.marginRate,0.45);assert.deepEqual(requestedMargins,[0.45,0.50]);
 assert(!a.confirmed.some(r=>r.label.includes('Imposto')||r.label.includes('Margem')));
 assert(a.rules.some(r=>r.label.includes('Imposto')));assert(a.rules.some(r=>r.value==='45% e 50%'));
});
test('manutenção, mão de obra, corte, cola e acabamento ficam pendentes, nunca zero automático',()=>{
 const c=withLegacyEstimates(newProductionCostConfig()),a=auditCostInputs(c);
 for(const path of ['labourHourlyCents','preparationMinutes','labourMinutesPerBlock','preparationCents','cuttingFixedCents','cuttingPerBlockCents','glueFixedCents','gluePerBlockCents','finishingFixedCents','finishingPerBlockCents','equipment.xerox.formats.A4.maintenanceCents'])assert(a.pending.some(r=>r.path===path),path);
 assert(compareRequestedMargins(job,c).every(r=>r.marginScenarios.every(m=>m.selected.saleCents===null&&m.selected.differenceCents===null)));
});
test('cenários 45% e 50% usam divisores 0,49 e 0,44 após imposto de 6%',()=>{
 const routes=compareRequestedMargins(job,fictionalCosts()),a4=routes.find(r=>r.equipmentId==='xerox'&&r.format==='A4');
 const [a,b]=a4.marginScenarios;assert.equal(a.rate,0.45);assert.equal(b.rate,0.50);
 assert.equal(a.selected.saleCents,Math.ceil(2658/0.49));assert.equal(b.selected.saleCents,Math.ceil(2658/0.44));
 assert.equal(a.selected.differenceCents,5425-9000);assert.equal(b.selected.differenceCents,6041-9000);
});
test('margens são comparadas nas cinco tiragens e nas duas cores sem mudar o custo',()=>{
 for(const color of ['preta','colorida'])for(const route of compareRequestedMargins({...job,color},fictionalCosts())){
  const [a,b]=route.marginScenarios;assert.equal(a.references.length,5);
  a.references.forEach((row,i)=>{assert.equal(row.costCents,b.references[i].costCents);assert(b.references[i].saleCents>=row.saleCents);assert.equal(row.referenceCents,b.references[i].referenceCents);});
 }
});
test('conferência não sobrescreve custos já informados nem modifica configuração por comparar',()=>{
 const c=withLegacyEstimates(newProductionCostConfig());c.equipment.hp.formats.A4.printCents.preta=3;
 assert.equal(withLegacyEstimates(c).equipment.hp.formats.A4.printCents.preta,3);
 const before=structuredClone(c);compareRequestedMargins(job,c);assert.deepEqual(c,before);
});
test('valor manual diferente da referência não vira custo de compra confirmado',()=>{
 const c=newProductionCostConfig();c.paperCents[75].A4=10;c.sources['paperCents.75.A4']='Informado nesta simulação; sem documento';
 const a=auditCostInputs(c);assert(a.estimated.some(r=>r.path==='paperCents.75.A4'&&r.value===10));assert.equal(a.confirmed[0].value,5.2);
});
