import test from 'node:test';
import assert from 'node:assert/strict';
import {comandaConfig} from '../../assets/loja/comandas-config.js';
import {estimateComanda,sheetLayout,normalizeComanda,comandaOption,comandaFromOption} from '../../assets/loja/comandas-pricing.js';
import {addItem,itemDetails,restoreCart,summarize,whatsappUrl} from '../../assets/loja/cart.js';
const job={widthCm:10,heightCm:7,paper:75,color:'preta',blocks:1};
for(const [color,table] of Object.entries({preta:{1:2000,10:9000,20:14000,50:24000,100:42000},colorida:{1:2500,10:11000,20:17500,50:31000,100:55000}}))for(const [blocks,total] of Object.entries(table)){
 test(`referência ${blocks} bloco(s), ${color}: ${total} centavos`,()=>{
  const q=estimateComanda({...job,color,blocks:Number(blocks)});
  assert.equal(q.totalCents,total);assert.equal(q.perBlockCents,total/Number(blocks));
  assert.equal(q.totalLeaves,50*Number(blocks));assert.equal(q.approvedForSale,false);
 });
}
test('área em m², aproveitamento e folhas inteiras de produção',()=>{
 const q=estimateComanda({...job,blocks:20});
 assert.equal(q.areaM2,0.007);assert.equal(q.plan.layout.perSheet,16);
 assert(q.plan.goodSheets*q.plan.layout.perSheet>=q.totalLeaves);
 assert((q.plan.goodSheets-1)*q.plan.layout.perSheet<q.totalLeaves);
 assert.equal(q.plan.pressSheets,q.plan.goodSheets+q.plan.wasteSheets+q.plan.setupSheets);
 assert(q.plan.areaUtilization>0&&q.plan.areaUtilization<=1);
});
test('giro de 90° preserva o resultado e o algoritmo usa faixas cortáveis',()=>{
 assert.equal(estimateComanda(job).totalCents,estimateComanda({...job,widthCm:7,heightCm:10}).totalCents);
 const c={marginCm:0,gutterCm:0},s={id:'teste',widthCm:10,heightCm:10};
 const layout=sheetLayout(6,4,s,c);
 assert.equal(layout.perSheet,3);assert.equal(layout.strips.length,2);
});
test('encaixes nunca excedem área útil, margens ou espaçamento configurados',()=>{
 for(const [w,h] of [[1,1],[7,10],[8,12],[10,10],[14,20],[20,28],[29,41]])for(const sheet of comandaConfig.sheets){
  const l=sheetLayout(w,h,sheet),span=Math.round((l.axis==='horizontal'?l.usableHeightCm:l.usableWidthCm)*100),cross=Math.round((l.axis==='horizontal'?l.usableWidthCm:l.usableHeightCm)*100),gap=10;
  const count=l.strips.reduce((s,v)=>s+v.count,0);
  assert(l.strips.reduce((s,v)=>s+v.count*v.widthUnits,0)+Math.max(0,count-1)*gap<=span);
  for(const stripe of l.strips)assert(stripe.perStrip*stripe.heightUnits+(stripe.perStrip-1)*gap<=cross);
  assert(l.perSheet*w*h<=l.usableWidthCm*l.usableHeightCm+1e-8);
 }
});
test('formatos diferentes usam custo fixo e degraus de aproveitamento, não regra de área',()=>{
 const small=estimateComanda({...job,blocks:10}),large=estimateComanda({...job,widthCm:20,heightCm:14,blocks:10});
 assert(large.totalCents>small.totalCents);assert.notEqual(large.totalCents,small.totalCents*4);
 assert(small.plan.costs.preparationCents>0&&small.plan.costs.cuttingCents>0&&small.plan.costs.glueCents>0&&small.plan.costs.finishingCents>0);
});
test('alterar custos fixos, impressão, perdas, papel e margem altera a estimativa',()=>{
 const input={...job,blocks:20},baseline=estimateComanda(input).totalCents;
 for(const modify of [c=>c.preparationCents+=1000,c=>c.gluePerBlockCents+=50,c=>c.finishingSetupCents+=500,c=>c.wasteRate=0.2,c=>c.marginRate=0.4,c=>c.sheets.forEach(s=>s.paperCents[75]+=20),c=>c.sheets.forEach(s=>s.printCents.preta+=20)]){
  const c=structuredClone(comandaConfig);modify(c);assert(estimateComanda(input,c).totalCents>baseline);
 }
});
test('imposto de 6% está incluído; margem é calculada sobre a venda',()=>{
 const q=estimateComanda(job),cost=q.plan.costCents+q.calibrationCents;
 assert.equal(q.taxRate,0.06);assert.equal(q.taxCents,q.totalCents*0.06);
 assert.equal(q.totalCents,Math.ceil(cost/(1-0.06-comandaConfig.marginRate)-1e-8));
});
test('papel 54 g e colorido permanecem provisórios, sem preço comercial',()=>{
 const q=estimateComanda({...job,paper:54,color:'colorida',blocks:13});
 assert.equal(q.status,'provisional');assert.equal(q.job.paper,54);assert.equal(q.job.color,'colorida');assert(Number.isSafeInteger(q.totalCents));
});
test('tiragens intermediárias e até 1.000 blocos são calculadas sem saltos negativos',()=>{
 for(const color of ['preta','colorida']){
  let previous=0;
  for(const blocks of [1,2,7,9,10,11,19,20,21,49,50,75,100,101,500,1000]){
   const q=estimateComanda({...job,color,blocks});assert(q.totalCents>=previous);previous=q.totalCents;
   assert.equal(q.totalLeaves,blocks*50);assert.equal(q.extrapolated,blocks>100);
  }
 }
});
test('medidas fora das folhas exigem avaliação humana, sem preço inventado',()=>{
 const q=estimateComanda({...job,widthCm:40,heightCm:40});assert.equal(q.status,'human-quote');assert.equal(q.totalCents,undefined);
});
for(const invalid of [{widthCm:0},{heightCm:43},{widthCm:NaN},{widthCm:Infinity},{widthCm:'<script>'},{widthCm:10.123},{paper:90},{color:'azul'},{blocks:0},{blocks:1001},{blocks:1.5},{blocks:''},{blocks:true}])test('entrada inválida é rejeitada: '+JSON.stringify(invalid),()=>assert.throws(()=>estimateComanda({...job,...invalid})));
test('medidas com vírgula são normalizadas; configuração persiste sem preços',()=>{
 const j=normalizeComanda({...job,widthCm:'10,5',heightCm:'7,25'}),id=comandaOption(j);
 assert.deepEqual(comandaFromOption(id,1),j);
 const cart=addItem([],'comandas',id,1);assert.deepEqual(Object.keys(cart[0]).sort(),['optionId','productId','quantity']);
 assert.deepEqual(restoreCart(JSON.stringify(cart)),cart);
});
test('solicitação provisória não altera o subtotal aprovado de um pedido misto',()=>{
 let cart=addItem([],'a3','frente',3);cart=addItem(cart,'comandas',comandaOption(job),1);
 const s=summarize(cart);assert.equal(s.knownTotalCents,900);assert.equal(s.pending,1);assert.equal(s.items[1].totalCents,null);
 const text=new URL(whatsappUrl(cart)).searchParams.get('text');
 assert.match(text,/Simulação provisória/);assert.match(text,/20,00/);assert.match(text,/1 bloco\(s\)/);assert.match(text,/Total de folhas: 50/);
 assert.match(text,/10 × 7 cm · papel 75 g · impressão preta · 1 via · 50 folhas por bloco/);
 assert.match(text,/Subtotal dos itens com preço aprovado: R\$\s9,00/);
});
test('carrinhos antigos de 1, 2 ou 3 vias continuam válidos e sob consulta',()=>{
 for(const id of ['1via','2vias','3vias']){
  const cart=addItem([],'comandas',id,2);assert.deepEqual(restoreCart(JSON.stringify(cart)),cart);assert.equal(summarize(cart).items[0].totalCents,null);
 }
});
test('configurações diferentes não se misturam; soma além de 1.000 é rejeitada sem mutar o carrinho',()=>{
 const first=comandaOption(job),other=comandaOption({...job,paper:54});
 let cart=addItem([],'comandas',first,999);cart=addItem(cart,'comandas',other,1);
 assert.equal(cart.length,2);assert.throws(()=>addItem(cart,'comandas',first,2));assert.equal(cart[0].quantity,999);
 assert.throws(()=>itemDetails({...cart[0],quantity:1001}));
});
test('estimativas e preços injetados no armazenamento são ignorados',()=>{
 const id=comandaOption(job),cart=restoreCart(JSON.stringify([{productId:'comandas',optionId:id,quantity:1,totalCents:1,priceCents:1,comandaEstimate:{totalCents:1}}]));
 const s=summarize(cart);assert.equal(s.knownTotalCents,0);assert.equal(s.items[0].totalCents,null);assert.equal(s.items[0].comandaEstimate.totalCents,2000);
 assert.deepEqual(restoreCart(JSON.stringify([{productId:'comandas',optionId:'comanda:v1:<script>',quantity:1}])),[]);
});
test('configuração de custo impossível ou ativação comercial acidental é bloqueada',()=>{
 for(const modify of [c=>c.approvedForSale=true,c=>c.marginRate=0.95,c=>c.wasteRate=1,c=>c.cuttingStackSheets=0,c=>c.preparationCents=-1,c=>c.sheets[0].paperCents[75]=-1,c=>delete c.reference.totals.preta[10]]){
  const c=structuredClone(comandaConfig);modify(c);assert.throws(()=>estimateComanda(job,c));
 }
});
