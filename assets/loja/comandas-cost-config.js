// Segunda simulação: custo ausente é null, nunca zero implícito.
// Valores monetários em centavos; taxas como fração; tempos em minutos.
import {comandaConfig} from './comandas-config.js';
import {paper75A4Cents,estimated54PaperCents} from './comandas-purchase-references.js';
const profile=(supported)=>({supported,marginCm:null,printCents:{preta:null,colorida:null},maintenanceCents:null,operatorMinutesPerSheet:null});
export const productionCostDefaults={
  version:'custos-2',approvedForSale:false,
  taxRate:0.06,marginRate:0.45,wasteRate:null,setupSheets:null,gutterCm:null,
  paperCents:{54:{A4:null,A3:null},75:{A4:paper75A4Cents,A3:null}},
  labourHourlyCents:null,preparationMinutes:null,labourMinutesPerBlock:null,
  preparationCents:null,cuttingFixedCents:null,cuttingPerBlockCents:null,
  glueFixedCents:null,gluePerBlockCents:null,finishingFixedCents:null,finishingPerBlockCents:null,
  equipment:{
    xerox:{name:'Xerox Color 560',formats:{A4:profile(true),A3:profile(true)}},
    hp:{name:'HP pigmentada — modelo a confirmar',formats:{A4:profile(null),A3:profile(null)}}
  },
  sources:{taxRate:'Informado pelo usuário: 6%.',
    marginRate:'Margem desejada pelo usuário: 45%; comparar também 50%.',
    'paperCents.75.A4':'Referência de compra informada: R$ 26,00 por 500 folhas A4 75 g.',
    'equipment.hp.formats.A4.supported':'Referência do usuário: impressão HP pigmentada por A4.',
    'equipment.hp.formats.A4.printCents.preta':'Estimativa informada pelo usuário: R$ 0,02 por A4 na HP pigmentada.',
    'equipment.xerox.formats.A4.supported':'Formato já utilizado pelos serviços do site.',
    'equipment.xerox.formats.A3.supported':'Formato já utilizado pelos serviços do site.'}
};
productionCostDefaults.equipment.hp.formats.A4.supported=true;
productionCostDefaults.equipment.hp.formats.A4.printCents.preta=2;
export const sheetSizes={A4:{id:'A4',widthCm:21,heightCm:29.7},A3:{id:'A3',widthCm:29.7,heightCm:42}};
// Fonte única da tabela atual, usada exclusivamente para a comparação.
export const referenceTotals=structuredClone(comandaConfig.reference.totals);
export const newProductionCostConfig=()=>structuredClone(productionCostDefaults);

// Reaproveita hipóteses anteriores e deriva o 54 g da referência de compra.
// Não inventa custos pendentes de manutenção, mão de obra, HP ou serviços.
export function withLegacyEstimates(config){
  const c=structuredClone(config),values={wasteRate:0.05,setupSheets:2,gutterCm:0.10,
    'paperCents.54.A4':estimated54PaperCents('A4'),'paperCents.54.A3':estimated54PaperCents('A3'),'paperCents.75.A3':12,
    'equipment.xerox.formats.A4.marginCm':0.30,'equipment.xerox.formats.A3.marginCm':0.30,
    'equipment.xerox.formats.A4.printCents.preta':6,'equipment.xerox.formats.A4.printCents.colorida':20,
    'equipment.xerox.formats.A3.printCents.preta':10,'equipment.xerox.formats.A3.printCents.colorida':32};
  for(const [path,value] of Object.entries(values)){
    const keys=path.split('.');let object=c;for(const key of keys.slice(0,-1))object=object[key];
    if(object[keys.at(-1)]===null){object[keys.at(-1)]=value;c.sources[path]=path.startsWith('paperCents.54.')?`Estimativa derivada da compra 54 g: rendimento teórico de ${path.endsWith('A4')?9:4} folhas ${path.endsWith('A4')?'A4':'A3'} por 66 × 96 cm; sem custo de refilo, arredondada para cima a quatro casas em reais.`:'Estimativa herdada da simulação 1; não é custo confirmado.';}
  }
  return c;
}
export function isCostPreviewHost(host){return ['localhost','127.0.0.1','[::1]'].includes(host)||/^deploy-preview-\d+--idygrafica\.netlify\.app$/.test(host);}
