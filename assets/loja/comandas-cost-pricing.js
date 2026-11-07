// Sem calibração ou vínculo entre a referência e a formação do preço.
import {normalizeComanda,sheetLayout} from './comandas-pricing.js';
import {sheetSizes,referenceTotals} from './comandas-cost-config.js';

const LABELS={taxRate:'Imposto',marginRate:'Margem',wasteRate:'Perdas',setupSheets:'Folhas de preparação',gutterCm:'Espaçamento de corte',
  labourHourlyCents:'Mão de obra por hora',preparationMinutes:'Tempo de preparação',labourMinutesPerBlock:'Mão de obra por bloco',
  preparationCents:'Preparação: materiais/custos fixos',cuttingFixedCents:'Corte: custo fixo',cuttingPerBlockCents:'Corte por bloco',
  glueFixedCents:'Cola: custo fixo',gluePerBlockCents:'Cola por bloco',finishingFixedCents:'Acabamento: custo fixo',finishingPerBlockCents:'Acabamento por bloco'};
const missingValue=v=>v===null||v===undefined;
export function analyzeProductionCost(input,equipmentId,format,c){
  const job=normalizeComanda(input),equipment=c.equipment?.[equipmentId],profile=equipment?.formats?.[format],sheet=sheetSizes[format];
  if(!equipment||!profile||!sheet)throw Error('Equipamento ou formato inválido.');
  const result={job,equipmentId,equipmentName:equipment.name,format,status:'incomplete',missing:[],errors:[],costs:{},costCents:null,saleCents:null,perBlockCents:null,taxCents:null,profitCents:null,actualMarginRate:null,
    referenceCents:referenceTotals[job.color]?.[job.blocks]??null,differenceCents:null,approvedForSale:false,calibrationUsed:false,totalLeaves:job.blocks*50,
    comparableReference:job.paper===75&&((job.widthCm===10&&job.heightCm===7)||(job.widthCm===7&&job.heightCm===10)),provisionalFields:[]};
  if(c.approvedForSale!==false)throw Error('A análise interna não pode ativar vendas.');
  if(profile.supported===false)return {...result,status:'unsupported'};
  if(profile.supported!==true)result.missing.push({path:`equipment.${equipmentId}.formats.${format}.supported`,label:'Confirmar se o equipamento atende este formato'});
  function read(path,label,options={}){
    const value=path.split('.').reduce((o,k)=>o?.[k],c),name=label||LABELS[path]||path;
    if(missingValue(value)){result.missing.push({path,label:name});return null;}
    if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>(options.max??100000000)||(options.integer&&!Number.isSafeInteger(value))){result.errors.push(name+': valor inválido.');return null;}
    if(path.toLowerCase().includes('cents')&&Math.abs(value*100-Math.round(value*100))>1e-6){result.errors.push(name+': use no máximo quatro casas decimais em reais.');return null;}
    const source=c.sources?.[path]||'Informado nesta simulação; não auditado.';
    result.provisionalFields.push({path,label:name,source});return value;
  }
  const tax=read('taxRate',null,{max:0.9999}),margin=read('marginRate',null,{max:0.9999}),loss=read('wasteRate',null,{max:0.9999}),setup=read('setupSheets',null,{integer:true,max:100000}),gap=read('gutterCm',null,{max:10});
  result.taxRate=tax;result.targetMarginRate=margin;result.wasteRate=loss;
  const base=`equipment.${equipmentId}.formats.${format}`;
  const printableMargin=read(base+'.marginCm','Margem não imprimível por lado',{max:20});
  const paper=read(`paperCents.${job.paper}.${format}`,`Papel ${job.paper} g por folha ${format}`);
  const printing=read(base+'.printCents.'+job.color,`Impressão ${job.color} por face ${format}`);
  const maintenance=read(base+'.maintenanceCents',`Manutenção por folha ${format}`);
  const operator=read(base+'.operatorMinutesPerSheet','Minutos ativos de operador por folha',{max:10000});
  const hourly=read('labourHourlyCents'),prepTime=read('preparationMinutes',null,{max:100000}),blockTime=read('labourMinutesPerBlock',null,{max:10000});
  const prep=read('preparationCents'),cutFixed=read('cuttingFixedCents'),cutUnit=read('cuttingPerBlockCents'),glueFixed=read('glueFixedCents'),glueUnit=read('gluePerBlockCents'),finishFixed=read('finishingFixedCents'),finishUnit=read('finishingPerBlockCents');
  if(tax!==null&&margin!==null&&tax+margin>=1)result.errors.push('Imposto e margem devem somar menos de 100%.');
  if(printableMargin!==null&&gap!==null){
    if(sheet.widthCm<=2*printableMargin||sheet.heightCm<=2*printableMargin)result.errors.push('As margens eliminam a área imprimível.');
    else{
      result.layout=sheetLayout(job.widthCm,job.heightCm,sheet,{marginCm:printableMargin,gutterCm:gap});
      if(!result.layout.perSheet)return {...result,status:'does-not-fit'};
      result.goodSheets=Math.ceil(result.totalLeaves/result.layout.perSheet);
      result.utilization=result.layout.perSheet*job.widthCm*job.heightCm/((sheet.widthCm-2*printableMargin)*(sheet.heightCm-2*printableMargin));
      if(loss!==null&&setup!==null){
        result.productionSheets=Math.ceil(result.goodSheets/(1-loss))+setup;
        if(!Number.isSafeInteger(result.productionSheets)||result.productionSheets>10000000){result.errors.push('Quantidade de folhas de produção fora do limite.');result.productionSheets=null;}
        else {result.wasteSheets=result.productionSheets-result.goodSheets-setup;result.setupSheets=setup;}
      }
    }
  }
  // Unidades de 1/100 de centavo permitem custos unitários com quatro casas em R$.
  const units=v=>Math.round(v*100),known=(...v)=>v.every(x=>x!==null&&x!==undefined);
  const n=result.productionSheets;
  const raw={
    paper:known(n,paper)?n*units(paper):null,
    printing:known(n,printing)?n*units(printing):null,
    maintenance:known(n,maintenance)?n*units(maintenance):null,
    preparation:prep!==null?units(prep):null,
    cutting:known(cutFixed,cutUnit)?units(cutFixed)+job.blocks*units(cutUnit):null,
    glue:known(glueFixed,glueUnit)?units(glueFixed)+job.blocks*units(glueUnit):null,
    finishing:known(finishFixed,finishUnit)?units(finishFixed)+job.blocks*units(finishUnit):null
  };
  if(known(n,operator,prepTime,blockTime,hourly)){
    result.labourMinutes=prepTime+job.blocks*blockTime+n*operator;
    raw.labour=Math.ceil(units(hourly)*result.labourMinutes/60-1e-8);
  }else raw.labour=null;
  result.costs=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,v===null?null:v/100]));
  const knownCosts=Object.values(raw).filter(v=>v!==null);
  result.knownSubtotalCents=knownCosts.length?knownCosts.reduce((s,v)=>s+v,0)/100:null;
  result.perProductionSheetCents=known(paper,printing,maintenance)?paper+printing+maintenance:null;
  result.materialPerFinishedLeafCents=known(raw.paper,raw.printing,raw.maintenance)?(raw.paper+raw.printing+raw.maintenance)/100/result.totalLeaves:null;
  if(result.errors.length)return {...result,status:'invalid'};
  if(result.missing.length||Object.values(raw).some(v=>v===null))return result;
  const rawTotal=Object.values(raw).reduce((s,v)=>s+v,0);
  if(!Number.isSafeInteger(rawTotal))return {...result,status:'invalid',errors:['Custo fora do intervalo suportado.']};
  result.costCents=Math.ceil(rawTotal/100-1e-8);
  result.saleCents=Math.ceil(result.costCents/(1-tax-margin)-1e-8);
  if(!Number.isSafeInteger(result.saleCents))return {...result,status:'invalid',saleCents:null,errors:['Preço fora do intervalo suportado.']};
  result.taxCents=result.saleCents*tax;result.profitCents=result.saleCents-result.costCents-result.taxCents;
  result.actualMarginRate=result.saleCents?result.profitCents/result.saleCents:0;
  result.perBlockCents=result.saleCents/job.blocks;
  result.differenceCents=result.referenceCents===null?null:result.saleCents-result.referenceCents;
  result.status='calculated';return result;
}
export function compareProductionCosts(input,config){
  const job=normalizeComanda(input);
  return Object.keys(config.equipment).flatMap(id=>Object.keys(sheetSizes).map(format=>({equipmentId:id,format,selected:analyzeProductionCost(job,id,format,config),references:[1,10,20,50,100].map(blocks=>analyzeProductionCost({...job,blocks},id,format,config))})));
}
