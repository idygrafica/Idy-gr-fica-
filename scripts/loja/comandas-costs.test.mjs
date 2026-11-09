import test from 'node:test';
import assert from 'node:assert/strict';
import {newProductionCostConfig,withLegacyEstimates,referenceTotals,isCostPreviewHost} from '../../assets/loja/comandas-cost-config.js';
import {analyzeProductionCost,compareProductionCosts} from '../../assets/loja/comandas-cost-pricing.js';
import {fictionalCosts} from './comandas-costs.fixture.mjs';
const job={widthCm:10,heightCm:7,paper:75,color:'preta',blocks:10};

test('campos vazios não viram zero nem preço de venda',()=>{
 const r=analyzeProductionCost(job,'xerox','A4',newProductionCostConfig());
 assert.equal(r.status,'incomplete');assert.equal(r.saleCents,null);assert.equal(r.costCents,null);assert.equal(r.knownSubtotalCents,null);assert.equal(r.differenceCents,null);
 assert(r.missing.some(m=>m.path==='labourHourlyCents'));assert(r.missing.some(m=>m.path.endsWith('maintenanceCents')));
});
test('referências novas prevalecem sobre estimativas e não inventam custos pendentes',()=>{
 const c=withLegacyEstimates(newProductionCostConfig());
 assert.equal(c.paperCents[75].A4,5.2);assert.equal(c.marginRate,0.45);assert(c.sources['paperCents.75.A4'].startsWith('Referência de compra'));
 assert.equal(c.labourHourlyCents,null);assert.equal(c.equipment.xerox.formats.A4.maintenanceCents,null);
 assert.equal(c.equipment.hp.formats.A4.printCents.preta,2);assert.equal(c.equipment.hp.formats.A3.supported,null);assert.equal(c.equipment.hp.formats.A3.printCents.preta,null);
 const a4=analyzeProductionCost(job,'xerox','A4',c),a3=analyzeProductionCost(job,'xerox','A3',c);
 assert.equal(a4.productionSheets,69);assert.equal(a3.productionSheets,36);
 assert.equal(a4.knownSubtotalCents,772.8);assert.equal(a3.knownSubtotalCents,792);assert.equal(a4.saleCents,null);assert.equal(a3.saleCents,null);
});
test('carregar estimativas nunca sobrescreve custos informados',()=>{
 const c=newProductionCostConfig();c.paperCents[75].A4=9;c.sources['paperCents.75.A4']='Informado pelo usuário';
 const loaded=withLegacyEstimates(c);assert.equal(loaded.paperCents[75].A4,9);assert.equal(loaded.sources['paperCents.75.A4'],'Informado pelo usuário');
});
test('preço calculado usa só custos, imposto e margem; alterar referência muda somente a diferença',()=>{
 const c=fictionalCosts(),a=analyzeProductionCost(job,'xerox','A4',c),old=referenceTotals.preta[10];
 try{
  referenceTotals.preta[10]=99999;
  const b=analyzeProductionCost(job,'xerox','A4',c);assert.equal(b.saleCents,a.saleCents);assert.equal(b.costCents,a.costCents);assert.equal(b.differenceCents,b.saleCents-99999);assert.equal(b.calibrationUsed,false);
 }finally{referenceTotals.preta[10]=old;}
});
test('folhas, perdas, impressão, manutenção e tempo são contados uma única vez',()=>{
 const r=analyzeProductionCost(job,'xerox','A4',fictionalCosts());
 assert.equal(r.layout.perSheet,8);assert.equal(r.goodSheets,63);assert.equal(r.wasteSheets,4);assert.equal(r.setupSheets,2);assert.equal(r.productionSheets,69);
 assert.equal(r.costs.paper,690);assert.equal(r.costs.printing,345);assert.equal(r.costs.maintenance,138);
 assert.equal(r.labourMinutes,15.69);assert.equal(r.costs.labour,784.5);
 assert.equal(r.costs.preparation,200);assert.equal(r.costs.cutting,200);assert.equal(r.costs.glue,100);assert.equal(r.costs.finishing,200);
 assert.equal(r.costCents,2658);assert.equal(r.saleCents,4154);assert.equal(r.perProductionSheetCents,17);
});
test('margem é sobre o faturamento após custos e imposto',()=>{
 const r=analyzeProductionCost(job,'xerox','A4',fictionalCosts());
 assert.equal(r.saleCents,Math.ceil(r.costCents/(1-0.06-0.3)-1e-8));assert.equal(r.taxCents,r.saleCents*0.06);
 assert.equal(r.profitCents,r.saleCents-r.costCents-r.taxCents);assert(r.actualMarginRate>=0.3);assert.equal(r.approvedForSale,false);
});
test('A4/A3 e Xerox/HP são cenários independentes',()=>{
 const results=compareProductionCosts(job,fictionalCosts());assert.equal(results.length,4);
 assert(results.every(r=>r.references.length===5&&r.selected.status==='calculated'));
 const get=(id,f)=>results.find(r=>r.equipmentId===id&&r.format===f).selected;
 assert.notEqual(get('xerox','A4').costCents,get('xerox','A3').costCents);assert.notEqual(get('xerox','A4').costCents,get('hp','A4').costCents);
});
test('HP sem confirmação de formato fica pendente; formato não atendido não recebe preço',()=>{
 const c=fictionalCosts();c.equipment.hp.formats.A3.supported=null;
 assert.equal(analyzeProductionCost(job,'hp','A3',c).status,'incomplete');
 c.equipment.hp.formats.A3.supported=false;
 const r=analyzeProductionCost(job,'hp','A3',c);assert.equal(r.status,'unsupported');assert.equal(r.saleCents,null);
 assert.equal(analyzeProductionCost(job,'xerox','A3',c).status,'calculated');
});
test('manutenção ausente bloqueia, zero explícito é respeitado',()=>{
 const c=fictionalCosts();c.equipment.xerox.formats.A4.maintenanceCents=null;
 assert.equal(analyzeProductionCost(job,'xerox','A4',c).saleCents,null);
 c.equipment.xerox.formats.A4.maintenanceCents=0;
 const r=analyzeProductionCost(job,'xerox','A4',c);assert.equal(r.status,'calculated');assert.equal(r.costs.maintenance,0);
});
test('custos fracionários por clique não são truncados para zero',()=>{
 const c=fictionalCosts();c.equipment.xerox.formats.A4.printCents.preta=0.5;
 const r=analyzeProductionCost(job,'xerox','A4',c);assert.equal(r.costs.printing,34.5);
});
test('custos, tempos e perdas maiores refletem no preço, sem absorção por calibração',()=>{
 const base=fictionalCosts(),baseline=analyzeProductionCost(job,'xerox','A4',base).saleCents;
 for(const edit of [c=>c.preparationCents+=100,c=>c.labourHourlyCents+=1000,c=>c.wasteRate=0.2,c=>c.marginRate=0.4,c=>c.equipment.xerox.formats.A4.maintenanceCents+=5]){
  const c=structuredClone(base);edit(c);assert(analyzeProductionCost(job,'xerox','A4',c).saleCents>baseline);
 }
});
test('troca de cor e gramatura aplica apenas o custo do perfil selecionado',()=>{
 const c=fictionalCosts();
 const a=analyzeProductionCost(job,'xerox','A4',c),b=analyzeProductionCost({...job,color:'colorida'},'xerox','A4',c),d=analyzeProductionCost({...job,paper:54},'xerox','A4',c);
 assert(b.saleCents>a.saleCents);assert(d.saleCents<a.saleCents);assert.equal(d.comparableReference,false);
});
test('medidas que não cabem e quantidades inválidas não recebem venda',()=>{
 assert.equal(analyzeProductionCost({...job,widthCm:40,heightCm:40},'xerox','A4',fictionalCosts()).status,'does-not-fit');
 assert.throws(()=>analyzeProductionCost({...job,blocks:1001},'xerox','A4',fictionalCosts()));
});
for(const blocks of [1,10,20,50,100])for(const color of ['preta','colorida'])test(`diferença da referência: ${blocks} bloco(s), ${color}`,()=>{
 const r=analyzeProductionCost({...job,blocks,color},'xerox','A4',fictionalCosts());assert.equal(r.referenceCents,referenceTotals[color][blocks]);assert.equal(r.differenceCents,r.saleCents-referenceTotals[color][blocks]);
});
test('tiragem de 7 blocos não usa interpolação ou referência fictícia',()=>{
 const r=analyzeProductionCost({...job,blocks:7},'xerox','A4',fictionalCosts());assert.equal(r.referenceCents,null);assert.equal(r.differenceCents,null);assert.equal(r.status,'calculated');
});
for(const [label,edit] of [['imposto+margem >= 100%',c=>c.marginRate=0.95],['custo negativo',c=>c.preparationCents=-1],['manutenção NaN',c=>c.equipment.xerox.formats.A4.maintenanceCents=NaN],['perdas 100%',c=>c.wasteRate=1],['fração de folha de preparação',c=>c.setupSheets=1.5],['margem elimina área útil',c=>c.equipment.xerox.formats.A4.marginCm=15]])test('configuração inválida: '+label,()=>{
 const c=fictionalCosts();edit(c);const r=analyzeProductionCost(job,'xerox','A4',c);assert.equal(r.status,'invalid');assert.equal(r.saleCents,null);
});
test('campos de análise não liberam checkout nem host de produção',()=>{
 const c=fictionalCosts();c.approvedForSale=true;assert.throws(()=>analyzeProductionCost(job,'xerox','A4',c));
 for(const host of ['idygrafica.com.br','www.idygrafica.com.br','idygrafica.netlify.app','deploy-preview-35--idygrafica.netlify.app.evil.test'])assert.equal(isCostPreviewHost(host),false);
 for(const host of ['127.0.0.1','localhost','deploy-preview-35--idygrafica.netlify.app'])assert.equal(isCostPreviewHost(host),true);
});
