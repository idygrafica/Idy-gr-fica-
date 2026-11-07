import test from 'node:test';
import assert from 'node:assert/strict';
import {newNatureConfig,analyzeNature,compareNature,natureQuantities} from '../../assets/loja/comandas-nature-pricing.js';
import {newProductionCostConfig,withLegacyEstimates,referenceTotals} from '../../assets/loja/comandas-cost-config.js';
import {initialEstimateReference} from '../../assets/loja/comandas-initial-estimate.js';
const job={widthCm:20,heightCm:28,paper:75,color:'preta',blocks:1};
// Números fictícios, exclusivos dos testes. Não são carregados no painel.
function fixture(){
 const c=newNatureConfig();Object.assign(c,{wasteRate:0.10,setupSheets:2,gutterCm:0.10,labourHourlyCents:6000,preparationMinutes:2,organizationMinutes:1,labourMinutesPerBlock:0.5,preparationCents:200,organizationCents:100,cuttingPerBlockCents:10,gluePerBlockCents:5,finishingPerBlockCents:15});
 c.paperCents[75].A4=10;Object.assign(c.equipment.xerox.formats.A4,{marginCm:0.3,maintenanceCents:2,operatorMinutesPerSheet:0.1});c.equipment.xerox.formats.A4.printCents.preta=5;return c;
}
const calc=(c=fixture(),j=job)=>analyzeNature(j,'xerox','A4',c);
test('preserva todos os valores unitários anteriores e acrescenta apenas organização pendente',()=>{
 const c=newNatureConfig(),{organizationCents,organizationMinutes,...prior}=c;assert.deepEqual(prior,withLegacyEstimates(newProductionCostConfig()));assert.equal(organizationCents,null);assert.equal(organizationMinutes,null);
});
test('referência agregada dos 50 blocos não preenche custos ausentes',()=>{
 const r=calc(newNatureConfig());assert.equal(r.status,'incomplete');assert.equal(r.costCents,null);assert.equal(r.minimumCents,null);assert.equal(r.effectiveMargin,null);assert.equal(r.sales.length,0);assert.equal(initialEstimateReference.labourCents,1500);
});
test('memória manual de 1 bloco: 50 úteis, 6 perdas, 2 preparação',()=>{
 const r=calc();assert.equal(r.layout.perSheet,1);assert.equal(r.goodSheets,50);assert.equal(r.wasteSheets,6);assert.equal(r.productionSheets,58);assert.deepEqual(r.groupTotals,{sheet:1512,block:80,order:654});assert.equal(r.costCents,2246);
});
test('perdas e preparação são cobradas uma vez, com manutenção e operação',()=>{
 const r=calc();const all=Object.values(r.groups).flat();assert.equal(all.filter(l=>l.unit==='folha').reduce((s,l)=>s+l.count,0),58*4);
 assert.equal(all.filter(l=>l.label.toLowerCase().includes('manutenção')).reduce((s,l)=>s+l.cents,0),58*2);
});
test('cola, corte, montagem e acabamento multiplicam pela quantidade',()=>{
 const a=calc(),b=calc(fixture(),{...job,blocks:10});assert.equal(b.groupTotals.block,a.groupTotals.block*10);assert.equal(b.groupTotals.order,a.groupTotals.order);assert.ok(b.groupTotals.sheet>a.groupTotals.sheet*10-1e3);
 for(const l of b.groups.block)assert.equal(l.count,10);
});
test('memória manual de 10 blocos',()=>{
 const r=calc(fixture(),{...job,blocks:10});assert.equal(r.productionSheets,558);assert.equal(r.costCents,16466);
});
test('preço mínimo inclui imposto sem lucro; margens são sobre venda',()=>{
 const r=calc();assert.equal(r.minimumCents,2390);assert.deepEqual(r.sales.map(s=>s.saleCents),[4584,5105]);
 assert.ok(r.minimumCents*0.94>=r.costCents);assert.ok((r.minimumCents-1)*0.94<r.costCents);
 for(const s of r.sales){assert.ok(s.actualMargin>=s.rate);assert.ok((s.saleCents-1)*(1-.06-s.rate)<r.costCents);}
});
test('mantém seis quantidades, incluindo 1.000, sem interpolar tabela',()=>{
 const rows=compareNature(job,'xerox','A4',fixture());assert.deepEqual(rows.map(r=>r.job.blocks),[1,10,20,50,100,1000]);assert.deepEqual(natureQuantities,[1,10,20,50,100,1000]);assert.equal(rows.at(-1).referenceCents,null);
});
test('margem efetiva da tabela compatível: receita menos imposto e custo',()=>{
 const c=fixture(),r=calc(c,{...job,widthCm:10,heightCm:7,blocks:10});assert.equal(r.referenceCents,9000);assert.equal(r.effectiveMargin,(9000*.94-r.costCents)/9000);
});
test('margem efetiva pode ser negativa, sem mascarar prejuízo',()=>{
 const c=fixture();c.preparationCents=50000;assert.ok(calc(c,{...job,widthCm:10,heightCm:7}).effectiveMargin<0);
});
for(const j of [{...job,widthCm:10,heightCm:7,paper:54},{...job,widthCm:11,heightCm:7}])test('não compara tabela de especificações incompatíveis '+JSON.stringify(j),()=>{
 const c=fixture();c.paperCents[54].A4=10;const r=calc(c,j);assert.equal(r.referenceCents,null);assert.equal(r.effectiveMargin,null);
});
test('versão colorida usa seu custo e sua referência',()=>{
 const c=fixture();c.equipment.xerox.formats.A4.printCents.colorida=20;const r=calc(c,{...job,widthCm:10,heightCm:7,color:'colorida',blocks:50});assert.equal(r.referenceCents,31000);assert.equal(r.groups.sheet.find(l=>l.label==='Impressão · folhas úteis').unitCents,20);
});
test('ausência de manutenção não vira zero e bloqueia margem e preços',()=>{
 const c=fixture();c.equipment.xerox.formats.A4.maintenanceCents=null;const r=calc(c,{...job,widthCm:10,heightCm:7});assert.equal(r.costCents,null);assert.equal(r.minimumCents,null);assert.equal(r.effectiveMargin,null);assert.ok(r.missing.some(m=>m.path.endsWith('maintenanceCents')));
});
test('zero explícito é aceito; perdas zeradas não criam cobrança',()=>{
 const c=fixture();c.wasteRate=0;c.setupSheets=0;c.equipment.xerox.formats.A4.maintenanceCents=0;const r=calc(c);assert.equal(r.status,'calculated');assert.equal(r.productionSheets,50);assert.equal(r.wasteSheets,0);assert.equal(r.groups.sheet.find(l=>l.label==='Perdas · papel').cents,0);
});
test('papel conhecido de R$0,052 não é arredondado antes de multiplicar',()=>{
 const c=fixture();c.paperCents[75].A4=5.2;assert.equal(calc(c).groups.sheet.find(l=>l.label==='Papel · folhas úteis').cents,260);
});
for(const path of ['cuttingFixedCents','glueFixedCents','finishingFixedCents'])test('valor legado '+path+' é preservado e exige reclassificação',()=>{
 const c=fixture();c[path]=500;const r=calc(c);assert.equal(c[path],500);assert.ok(r.missing.some(m=>m.path===path));assert.equal(r.costCents,null);
});
test('não altera configuração, tabela de referência nem orçamento agregado',()=>{
 const c=fixture(),before=JSON.stringify(c),refs=JSON.stringify(referenceTotals),budget=JSON.stringify(initialEstimateReference);compareNature(job,'xerox','A4',c);assert.equal(JSON.stringify(c),before);assert.equal(JSON.stringify(referenceTotals),refs);assert.equal(JSON.stringify(initialEstimateReference),budget);
});
test('HP A3 continua sem compatibilidade ou impressão presumida',()=>{
 const r=analyzeNature(job,'hp','A3',newNatureConfig());assert.equal(r.status,'incomplete');assert.ok(r.missing.some(m=>m.path.endsWith('A3.supported')));assert.equal(r.costCents,null);
});
test('compara A4/A3 pelo encaixe e custos do próprio perfil',()=>{
 const c=fixture();c.paperCents[75].A3=20;c.equipment.xerox.formats.A3={...structuredClone(c.equipment.xerox.formats.A4),printCents:{preta:10,colorida:40}};const a=calc(c),b=analyzeNature(job,'xerox','A3',c);assert.ok(b.layout.perSheet>a.layout.perSheet);assert.equal(b.groups.sheet.find(l=>l.label==='Papel · folhas úteis').unitCents,20);
});
for(const [key,value] of [['wasteRate',1],['setupSheets',1.5],['gluePerBlockCents',-1],['taxRate',NaN]])test('valor inválido não libera cálculo: '+key,()=>{
 const c=fixture();c[key]=value;const r=calc(c);assert.equal(r.status,'invalid');assert.equal(r.costCents,null);assert.equal(r.sales.length,0);
});
test('fora de limites de quantidade ou formato não cabe',()=>{
 assert.throws(()=>calc(fixture(),{...job,blocks:1001}));assert.equal(calc(fixture(),{...job,widthCm:42,heightCm:42}).status,'does-not-fit');const c=fixture();c.equipment.xerox.formats.A4.supported=false;assert.equal(calc(c).status,'unsupported');
});
