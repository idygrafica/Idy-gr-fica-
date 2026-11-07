// Análise interna por natureza. Não altera as configurações ou preços existentes.
import {newProductionCostConfig,withLegacyEstimates,sheetSizes,referenceTotals} from './comandas-cost-config.js';
import {normalizeComanda,sheetLayout} from './comandas-pricing.js';
export const natureQuantities=Object.freeze([1,10,20,50,100,1000]);
export function newNatureConfig(){
 const c=withLegacyEstimates(newProductionCostConfig());
 c.organizationCents=null;c.organizationMinutes=null;
 return c;
}
const ceil=v=>Math.ceil(v-1e-8);
export function analyzeNature(input,equipmentId,format,c){
 const job=normalizeComanda(input),profile=c.equipment?.[equipmentId]?.formats?.[format],sheet=sheetSizes[format];
 if(!profile||!sheet)throw Error('Equipamento ou formato inválido.');
 if(c.approvedForSale!==false)throw Error('A análise não pode ativar vendas.');
 const r={job,equipmentId,format,status:'incomplete',missing:[],errors:[],groups:{sheet:[],block:[],order:[]},groupTotals:{},knownSubtotalCents:null,costCents:null,minimumCents:null,sales:[],effectiveMargin:null,referenceCents:null,approvedForSale:false,calibrationUsed:false,totalLeaves:job.blocks*50};
 if(profile.supported===false)return {...r,status:'unsupported'};
 const addMissing=(path,label)=>{if(!r.missing.some(x=>x.path===path))r.missing.push({path,label});};
 const read=(path,label,max=1e8,integer=false)=>{
  const v=path.split('.').reduce((o,k)=>o?.[k],c);
  if(v===null||v===undefined){addMissing(path,label);return null;}
  if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max||(integer&&!Number.isSafeInteger(v))||(path.toLowerCase().includes('cents')&&Math.abs(v*100-Math.round(v*100))>1e-6)){
   r.errors.push(label+': valor inválido.');return null;
  }
  return v;
 };
 const prefix=`equipment.${equipmentId}.formats.${format}`;
 if(profile.supported!==true)addMissing(prefix+'.supported','Compatibilidade do equipamento com '+format);
 const tax=read('taxRate','Imposto',0.49),loss=read('wasteRate','Perdas',0.9999),setup=read('setupSheets','Folhas de preparação',1e5,true),gap=read('gutterCm','Espaçamento de corte',10),margin=read(prefix+'.marginCm','Margem não imprimível',20);
 r.taxRate=tax;r.wasteRate=loss;r.setupSheets=setup;
 if(gap!==null&&margin!==null){
  if(sheet.widthCm<=2*margin||sheet.heightCm<=2*margin)r.errors.push('As margens eliminam a área imprimível.');
  else{
   r.layout=sheetLayout(job.widthCm,job.heightCm,sheet,{marginCm:margin,gutterCm:gap});
   if(!r.layout.perSheet)return {...r,status:'does-not-fit'};
   r.goodSheets=Math.ceil(r.totalLeaves/r.layout.perSheet);
   if(loss!==null&&setup!==null){r.wasteSheets=ceil(r.goodSheets/(1-loss))-r.goodSheets;r.productionSheets=r.goodSheets+r.wasteSheets+setup;}
  }
 }
 const paper=read(`paperCents.${job.paper}.${format}`,'Papel por folha'),printing=read(prefix+'.printCents.'+job.color,'Impressão por folha'),maintenance=read(prefix+'.maintenanceCents','Manutenção por folha');
 const hourly=read('labourHourlyCents','Mão de obra por hora'),operator=read(prefix+'.operatorMinutesPerSheet','Tempo ativo por folha',1e4),assembly=read('labourMinutesPerBlock','Tempo de montagem por bloco',1e4),prepTime=read('preparationMinutes','Tempo de preparação',1e5),orgTime=read('organizationMinutes','Tempo de organização',1e5);
 const cut=read('cuttingPerBlockCents','Corte por bloco'),glue=read('gluePerBlockCents','Cola por bloco'),finish=read('finishingPerBlockCents','Acabamento por bloco'),prep=read('preparationCents','Preparação por pedido'),org=read('organizationCents','Organização por pedido');
 // Não deslocar parcelas antigas de corte/cola/acabamento para os custos fixos do pedido.
 // Se houver valor legado positivo, a classificação precisa ser resolvida explicitamente.
 for(const key of ['cuttingFixedCents','glueFixedCents','finishingFixedCents']){
  const v=c[key];
  if(v!==null&&v!==undefined){
   if(typeof v!=='number'||!Number.isFinite(v)||v<0)r.errors.push(key+': valor legado inválido.');
   else if(v>0)addMissing(key,'Reclassificar parcela legada '+key+' sem duplicar custos');
  }
 }
 const hourlyUnit=minutes=>hourly===null||minutes===null?null:hourly*minutes/60;
 const line=(group,label,count,unitCents,unit)=>{
  const cents=count===0?0:(count===null||count===undefined||unitCents===null?null:ceil(count*unitCents));
  r.groups[group].push({label,count:count??null,unitCents,unit,cents});
 };
 const sheetUnits=[['Papel',paper],['Impressão',printing],['Manutenção',maintenance],['Operação ativa',hourlyUnit(operator)]];
 for(const [label,unit] of sheetUnits){
  line('sheet',label+' · folhas úteis',r.goodSheets,unit,'folha');
  line('sheet','Perdas · '+label.toLowerCase(),r.wasteSheets,unit,'folha');
  line('order','Folhas de preparação · '+label.toLowerCase(),setup,unit,'folha');
 }
 line('block','Cola',job.blocks,glue,'bloco');line('block','Corte',job.blocks,cut,'bloco');
 line('block','Montagem (mão de obra)',job.blocks,hourlyUnit(assembly),'bloco');line('block','Acabamento',job.blocks,finish,'bloco');
 line('order','Preparação · materiais/serviços',1,prep,'pedido');line('order','Preparação · mão de obra',1,hourlyUnit(prepTime),'pedido');
 line('order','Organização · materiais/serviços',1,org,'pedido');line('order','Organização · mão de obra',1,hourlyUnit(orgTime),'pedido');
 for(const [key,lines] of Object.entries(r.groups))r.groupTotals[key]=lines.some(l=>l.cents===null)?null:lines.reduce((s,l)=>s+l.cents,0);
 const lines=Object.values(r.groups).flat();r.knownSubtotalCents=lines.filter(l=>l.cents!==null).reduce((s,l)=>s+l.cents,0);
 const referenceMatches=job.paper===75&&((job.widthCm===10&&job.heightCm===7)||(job.widthCm===7&&job.heightCm===10));
 if(referenceMatches)r.referenceCents=referenceTotals[job.color]?.[job.blocks]??null;
 if(r.errors.length)return {...r,status:'invalid'};
 if(r.missing.length||lines.some(l=>l.cents===null))return r;
 r.costCents=r.knownSubtotalCents;
 if(!Number.isSafeInteger(r.costCents)||r.costCents>1e12)return {...r,status:'invalid',costCents:null,errors:['Custo fora do limite.']};
 r.minimumCents=ceil(r.costCents/(1-tax));
 r.sales=[0.45,0.50].map(rate=>{const saleCents=ceil(r.costCents/(1-tax-rate)),taxCents=saleCents*tax,profitCents=saleCents-r.costCents-taxCents;return {rate,saleCents,taxCents,profitCents,actualMargin:saleCents?profitCents/saleCents:null,differenceCents:r.referenceCents===null?null:saleCents-r.referenceCents};});
 r.effectiveMargin=r.referenceCents>0?(r.referenceCents*(1-tax)-r.costCents)/r.referenceCents:null;
 r.status='calculated';return r;
}
export const compareNature=(input,id,format,config)=>natureQuantities.map(blocks=>analyzeNature({...input,blocks},id,format,config));
