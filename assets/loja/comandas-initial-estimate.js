import {referenceTotals} from './comandas-cost-config.js';

// Orçamento específico informado pelo usuário. Não altera custos por folha,
// custos/hora ou parâmetros das outras simulações e não é tabela de venda.
export const initialEstimateReference=Object.freeze({blocks:50,status:'estimativa-inicial',
  paperPrintingCents:2316,labourCents:1500,glueFinishingCents:500,maintenanceCents:500,
  taxRate:0.06,margins:Object.freeze([0.45,0.50]),
  widthCm:null,heightCm:null,paper:null,color:null,equipment:null});
export const initialEstimateModels=Object.freeze({
  'services-held':{name:'Somente papel/impressão proporcional',description:'Papel/impressão acompanha a quantidade. Mão de obra, cola/acabamento e manutenção mantêm os valores do trabalho de 50 blocos. Isso é uma hipótese de extrapolação, não custo fixo comprovado.'},
  proportional:{name:'Todas as parcelas proporcionais',description:'As quatro parcelas variam na razão quantidade ÷ 50. É uma hipótese linear exploratória; não comprova que tempo, perdas, preparação ou manutenção variem dessa forma.'}
});
export function initialEstimate(blocks,model='services-held'){
  if(!Number.isSafeInteger(blocks)||blocks<1||blocks>1000)throw Error('Use de 1 a 1.000 blocos inteiros.');
  if(!Object.hasOwn(initialEstimateModels,model))throw Error('Hipótese de extrapolação inválida.');
  const base=initialEstimateReference,ratio=blocks/base.blocks;
  const values=[['paperPrintingCents','Papel e impressão'],['labourCents','Mão de obra'],['glueFinishingCents','Cola e acabamento'],['maintenanceCents','Reserva de manutenção']].map(([key,label])=>{
    const proportional=model==='proportional'||key==='paperPrintingCents';
    const cents=proportional?Math.ceil(base[key]*blocks/base.blocks-1e-8):base[key];
    return {key,label,cents,referenceCents:base[key],source:blocks===base.blocks?'Referência estimada informada para 50 blocos':proportional?'Extrapolado proporcionalmente à quantidade':'Extrapolado: valor mantido por trabalho, por hipótese',extrapolated:blocks!==base.blocks,method:proportional?'proportional':'held'};
  });
  const costCents=values.reduce((sum,v)=>sum+v.cents,0);
  const margins=base.margins.map(rate=>{
    const saleCents=Math.ceil(costCents/(1-base.taxRate-rate)-1e-8),taxCents=saleCents*base.taxRate,profitCents=saleCents-costCents-taxCents;
    return {rate,saleCents,perBlockCents:saleCents/blocks,taxCents,profitCents,actualMarginRate:profitCents/saleCents,
      comparisons:['preta','colorida'].map(color=>({color,referenceCents:referenceTotals[color][blocks]??null,differenceCents:referenceTotals[color][blocks]===undefined?null:saleCents-referenceTotals[color][blocks]}))};
  });
  return {blocks,model,ratio,values,costCents,margins,extrapolated:blocks!==base.blocks,approvedForSale:false,
    status:'estimativa-inicial',referenceBlocks:50,scope:'Somente o serviço específico do orçamento de referência; quatro parcelas agregadas.',calibrationUsed:false};
}
export const initialEstimateTable=model=>[10,20,50,100].map(blocks=>initialEstimate(blocks,model));
