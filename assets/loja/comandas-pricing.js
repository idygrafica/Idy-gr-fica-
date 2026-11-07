import {comandaConfig} from './comandas-config.js';

const units=cm=>Math.round(cm*100); // Inteiros de 0,1 mm evitam erros de encaixe.
function number(value){
  if(typeof value!=='number'&&(typeof value!=='string'||!/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())))throw Error('Informe medidas numéricas em centímetros.');
  const n=typeof value==='number'?value:Number(value.trim().replace(',','.'));
  if(!Number.isFinite(n))throw Error('Informe medidas válidas.');
  return n;
}
export function normalizeComanda(input){
  const widthCm=number(input.widthCm),heightCm=number(input.heightCm),blocks=number(input.blocks);
  if(widthCm<1||heightCm<1||widthCm>42||heightCm>42||Math.abs(widthCm*100-Math.round(widthCm*100))>1e-7||Math.abs(heightCm*100-Math.round(heightCm*100))>1e-7)throw Error('Use medidas entre 1 e 42 cm, com até duas casas decimais.');
  if(!Number.isSafeInteger(blocks)||blocks<1||blocks>1000)throw Error('Escolha de 1 a 1.000 blocos inteiros.');
  const paper=Number(input.paper),color=input.color;
  if(![54,75].includes(paper)||!['preta','colorida'].includes(color))throw Error('Escolha papel 54 g ou 75 g e impressão preta ou colorida.');
  return {widthCm,heightCm,paper,color,blocks};
}
export function validateComandaConfig(c){
  if(c.status!=='provisorio'||c.approvedForSale!==false)throw Error('Este motor é exclusivo do protótipo, sem preço de venda aprovado.');
  if(c.copies!==1||c.leavesPerBlock!==50||c.maxBlocks!==1000)throw Error('O protótipo utiliza 1 via, 50 folhas e até 1.000 blocos.');
  for(const key of ['taxRate','marginRate','wasteRate'])if(!Number.isFinite(c[key])||c[key]<0||c[key]>=1)throw Error('Percentual de custo inválido.');
  if(c.taxRate+c.marginRate>=1)throw Error('Imposto e margem devem somar menos de 100%.');
  for(const key of ['setupSheets','preparationCents','cuttingSetupCents','cuttingPerMoveCents','glueSetupCents','gluePerBlockCents','finishingSetupCents','finishingPerBlockCents'])if(!Number.isSafeInteger(c[key])||c[key]<0)throw Error('Custo ou quantidade inválida.');
  if(!Number.isSafeInteger(c.cuttingStackSheets)||c.cuttingStackSheets<1)throw Error('Capacidade de corte inválida.');
  if(!Number.isFinite(c.marginCm)||c.marginCm<0||!Number.isFinite(c.gutterCm)||c.gutterCm<0||!Array.isArray(c.sheets)||!c.sheets.length)throw Error('Configuração de folha inválida.');
  for(const s of c.sheets){
    if(!Number.isFinite(s.widthCm)||!Number.isFinite(s.heightCm)||s.widthCm<=2*c.marginCm||s.heightCm<=2*c.marginCm)throw Error('Área imprimível inválida.');
    for(const v of [s.paperCents?.[54],s.paperCents?.[75],s.printCents?.preta,s.printCents?.colorida])if(!Number.isSafeInteger(v)||v<0)throw Error('Custo de papel ou impressão inválido.');
  }
  if(c.reference.widthCm!==10||c.reference.heightCm!==7||c.reference.paper!==75||c.reference.leavesPerBlock!==50)throw Error('A referência comercial deve manter 10 × 7 cm, 75 g e 50 folhas.');
  if(!c.reference.costBasis||!Number.isFinite(c.reference.costBasis.taxRate)||!Number.isFinite(c.reference.costBasis.marginRate)||c.reference.costBasis.taxRate<0||c.reference.costBasis.marginRate<0||c.reference.costBasis.taxRate+c.reference.costBasis.marginRate>=1)throw Error('Base de calibração inválida.');
  for(const color of ['preta','colorida']){
    const table=c.reference.totals[color];
    if(!table||![1,10,20,50,100].every(q=>Number.isSafeInteger(table[q])&&table[q]>0))throw Error('Tabela de referência incompleta.');
    const rows=Object.entries(table).map(([q,t])=>[Number(q),t]).sort((a,b)=>a[0]-b[0]);
    if(rows.some(([q,t],i)=>!Number.isSafeInteger(q)||q<1||(i&&t<rows[i-1][1])))throw Error('Tabela de referência inválida.');
  }
}
const fit=(space,size,gap)=>space<0?0:Math.max(0,Math.floor((space+gap)/(size+gap)));
export function sheetLayout(widthCm,heightCm,sheet,config=comandaConfig){
  const W=units(sheet.widthCm-2*config.marginCm),H=units(sheet.heightCm-2*config.marginCm),a=units(widthCm),b=units(heightCm),gap=units(config.gutterCm);
  if(a<=0||b<=0||W<=0||H<=0)throw Error('Dimensões de encaixe inválidas.');
  let best={perSheet:0,cutMoves:0,axis:'vertical',strips:[]};
  // Duas orientações, uniformes ou combinadas em faixas com corte guilhotinado.
  for(const horizontal of [false,true]){
    const span=horizontal?H:W,cross=horizontal?W:H;
    for(const [first,second] of [[[a,b],[b,a]],[[b,a],[a,b]]]){
      for(let n=0;n<=fit(span,first[0],gap);n++){
        const used=n?n*first[0]+(n-1)*gap:0;
        const remaining=span-used-(n?gap:0);
        const m=fit(remaining,second[0],gap),r1=fit(cross,first[1],gap),r2=fit(cross,second[1],gap);
        const perSheet=n*r1+m*r2;
        const cutMoves=Math.max(0,n+m-1)+Math.max(0,r1-1)*(n?1:0)+Math.max(0,r2-1)*(m?1:0);
        if(perSheet>best.perSheet||(perSheet===best.perSheet&&cutMoves<best.cutMoves))best={perSheet,cutMoves,axis:horizontal?'horizontal':'vertical',strips:[{count:n,perStrip:r1,widthUnits:first[0],heightUnits:first[1]},{count:m,perStrip:r2,widthUnits:second[0],heightUnits:second[1]}].filter(s=>s.count&&s.perStrip)};
      }
    }
  }
  return {...best,sheetId:sheet.id,usableWidthCm:W/100,usableHeightCm:H/100};
}
function productionCost(job,c){
  const totalLeaves=job.blocks*c.leavesPerBlock;
  const plans=c.sheets.map(sheet=>{
    const layout=sheetLayout(job.widthCm,job.heightCm,sheet,c);
    if(!layout.perSheet)return null;
    const goodSheets=Math.ceil(totalLeaves/layout.perSheet);
    const pressSheets=Math.ceil(goodSheets/(1-c.wasteRate))+c.setupSheets;
    const paperCents=pressSheets*sheet.paperCents[job.paper],printingCents=pressSheets*sheet.printCents[job.color];
    const preparationCents=c.preparationCents;
    const cuttingCents=c.cuttingSetupCents+Math.ceil(pressSheets/c.cuttingStackSheets)*layout.cutMoves*c.cuttingPerMoveCents;
    const glueCents=c.glueSetupCents+job.blocks*c.gluePerBlockCents;
    const finishingCents=c.finishingSetupCents+job.blocks*c.finishingPerBlockCents;
    const costCents=paperCents+printingCents+preparationCents+cuttingCents+glueCents+finishingCents;
    return {sheetId:sheet.id,layout,goodSheets,pressSheets,wasteSheets:pressSheets-goodSheets-c.setupSheets,setupSheets:c.setupSheets,
      costCents,costs:{paperCents,printingCents,preparationCents,cuttingCents,glueCents,finishingCents},
      sheetAreaM2:sheet.widthCm*sheet.heightCm/10000,
      areaUtilization:layout.perSheet*job.widthCm*job.heightCm/((sheet.widthCm-2*c.marginCm)*(sheet.heightCm-2*c.marginCm))};
  }).filter(Boolean).sort((a,b)=>a.costCents-b.costCents||a.pressSheets-b.pressSheets);
  return plans[0]||null;
}
function referenceTotal(blocks,color,c){
  const rows=Object.entries(c.reference.totals[color]).map(([q,t])=>[Number(q),t]).sort((a,b)=>a[0]-b[0]);
  if(Object.hasOwn(c.reference.totals[color],blocks))return c.reference.totals[color][blocks];
  let index=rows.findIndex(([q])=>q>blocks);
  if(index<0)index=rows.length-1;
  const [q1,t1]=rows[index-1],[q2,t2]=rows[index];
  return t1+(t2-t1)*(blocks-q1)/(q2-q1);
}
export function estimateComanda(input,config=comandaConfig){
  validateComandaConfig(config);
  const job=normalizeComanda(input),plan=productionCost(job,config);
  if(!plan)return {status:'human-quote',job,reason:'Estas medidas não cabem na área imprimível configurada. Solicite avaliação da equipe.'};
  const referenceJob={...job,widthCm:config.reference.widthCm,heightCm:config.reference.heightCm,paper:config.reference.paper};
  const basis=config.reference.costBasis;
  const base=productionCost(referenceJob,basis);
  if(!base)throw Error('A referência não cabe nas folhas configuradas.');
  const divisor=1-config.taxRate-config.marginRate;
  const referencePrice=referenceTotal(job.blocks,job.color,config);
  // Resíduo provisório da curva comercial, sem alegar que sejam custos reais medidos.
  // Mesma tiragem: ajusta o custo físico entre o formato pedido e a referência.
  const calibrationCents=referencePrice*(1-basis.taxRate-basis.marginRate)-base.costCents;
  const calibratedCostCents=plan.costCents+calibrationCents;
  const totalCents=Math.max(1,Math.ceil(Math.max(plan.costCents,calibratedCostCents)/divisor-1e-8));
  if(!Number.isSafeInteger(totalCents))throw Error('Estimativa fora do intervalo suportado.');
  return {status:'provisional',approvedForSale:false,configVersion:config.version,job,totalCents,perBlockCents:totalCents/job.blocks,
    totalLeaves:job.blocks*config.leavesPerBlock,areaM2:job.widthCm*job.heightCm/10000,plan,
    referenceTotalCents:referencePrice,calibrationCents,taxCents:totalCents*config.taxRate,marginCents:totalCents*config.marginRate,
    extrapolated:job.blocks>100,taxRate:config.taxRate,marginRate:config.marginRate};
}
export const isComandaOption=id=>typeof id==='string'&&id.startsWith('comanda:v1:');
export function comandaOption(input){const j=normalizeComanda(input);return `comanda:v1:${units(j.widthCm)}:${units(j.heightCm)}:${j.paper}:${j.color}`;}
export function comandaFromOption(id,blocks){
  const m=/^comanda:v1:(\d{1,4}):(\d{1,4}):(54|75):(preta|colorida)$/.exec(id);
  if(!m)throw Error('Configuração de comanda inválida.');
  return normalizeComanda({widthCm:Number(m[1])/100,heightCm:Number(m[2])/100,paper:Number(m[3]),color:m[4],blocks});
}
export const comandaLabel=j=>`${j.widthCm.toLocaleString('pt-BR')} × ${j.heightCm.toLocaleString('pt-BR')} cm · papel ${j.paper} g · ${j.color==='preta'?'impressão preta':'impressão colorida'} · 1 via · 50 folhas por bloco`;
