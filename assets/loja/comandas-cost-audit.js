import {definitions} from './comandas-cost-fields.js';
import {purchaseReferences,paper75A4Cents,requestedMargins} from './comandas-purchase-references.js';
import {compareProductionCosts} from './comandas-cost-pricing.js';

export function auditCostInputs(config){
  const confirmed=[
    {label:'Papel A4 75 g',value:paper75A4Cents,kind:'money',source:'Compra informada: R$ 26,00 por 500 folhas. Custo unitário exato: R$ 0,052.'},
    {label:'Papel 54 g · folha bruta 66 × 96 cm',value:purchaseReferences.paper54Raw.packageCents/purchaseReferences.paper54Raw.sheets,kind:'money',source:'Compra informada: R$ 34,41 por 33 folhas 66 × 96 cm. Valor por folha bruta, antes de refilo/perdas.'}
  ],estimated=[],pending=[],conditions=[];
  for(const [path,label,kind] of definitions){
    if(['taxRate','marginRate'].includes(path))continue;
    const value=path.split('.').reduce((o,k)=>o?.[k],config);
    const prefix=path.startsWith('equipment.')?`${config.equipment[path.split('.')[1]].name} · ${path.split('.')[3]}: `:'';
    const row={path,label:prefix+label,value,kind,source:config.sources?.[path]||'Informado nesta simulação; sem referência de compra cadastrada.'};
    if(value===null||value===undefined){row.source='Não informado. Não foi considerado como zero.';pending.push(row);continue;}
    if(kind==='support'){conditions.push(row);continue;}
    if(path==='paperCents.75.A4'&&value===paper75A4Cents&&row.source.startsWith('Referência de compra'))continue;
    estimated.push(row);
  }
  return {confirmed,estimated,pending,conditions,rules:[
    {label:'Imposto sobre o faturamento',value:config.taxRate,kind:'percent',source:config.sources.taxRate},
    {label:'Margem principal selecionada',value:config.marginRate,kind:'percent',source:config.sources.marginRate},
    {label:'Margens desejadas para comparação',value:'45% e 50%',kind:'text',source:'Solicitação do usuário. Margem é sobre o faturamento após custos e imposto; não é custo de compra.'}
  ]};
}
export function compareRequestedMargins(input,config){
  const primary=compareProductionCosts(input,config);
  const alternatives=requestedMargins.map(rate=>({rate,routes:compareProductionCosts(input,{...config,marginRate:rate,sources:{...config.sources,marginRate:`Margem desejada pelo usuário nesta comparação: ${rate*100}%.`}})}));
  return primary.map(route=>({...route,marginScenarios:alternatives.map(a=>{const other=a.routes.find(r=>r.equipmentId===route.equipmentId&&r.format===route.format);return {rate:a.rate,selected:other.selected,references:other.references};})}));
}
