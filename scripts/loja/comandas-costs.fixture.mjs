// Dados inteiramente fictícios para testes automatizados. NÃO são custos da IDY
// e NÃO são carregados pela página de análise ou pelo catálogo.
import {newProductionCostConfig} from '../../assets/loja/comandas-cost-config.js';
export function fictionalCosts(){
 const c=newProductionCostConfig();
 Object.assign(c,{marginRate:0.30,wasteRate:0.05,setupSheets:2,gutterCm:0.10,
  labourHourlyCents:3000,preparationMinutes:10,labourMinutesPerBlock:0.5,
  preparationCents:200,cuttingFixedCents:100,cuttingPerBlockCents:10,
  glueFixedCents:50,gluePerBlockCents:5,finishingFixedCents:100,finishingPerBlockCents:10});
 c.paperCents={54:{A4:8,A3:16},75:{A4:10,A3:20}};
 for(const [id,device] of Object.entries(c.equipment))for(const [format,p] of Object.entries(device.formats)){
  const factor=format==='A3'?2:1;
  Object.assign(p,{supported:true,marginCm:0.30,
   printCents:{preta:(id==='xerox'?5:8)*factor,colorida:(id==='xerox'?15:20)*factor},
   maintenanceCents:(id==='xerox'?2:3)*factor,operatorMinutesPerSheet:id==='xerox'?0.01:0.02});
 }
 return c;
}
