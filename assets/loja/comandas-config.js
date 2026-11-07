// PROTÓTIPO: referências comerciais provisórias; não são custos internos confirmados.
// Valores monetários em centavos. Somente o imposto de 6% foi informado pelo usuário.
export const comandaConfig = {
  version:'prototipo-1', status:'provisorio', approvedForSale:false,
  copies:1, leavesPerBlock:50, maxBlocks:1000,
  taxRate:0.06,
  marginRate:0.30, // Hipótese de margem sobre a venda, a validar.
  wasteRate:0.05, setupSheets:2,
  marginCm:0.30, gutterCm:0.10,
  sheets:[
    {id:'A4',widthCm:21,heightCm:29.7,paperCents:{54:5,75:6},printCents:{preta:6,colorida:20}},
    {id:'A3',widthCm:29.7,heightCm:42,paperCents:{54:10,75:12},printCents:{preta:10,colorida:32}}
  ],
  // Todos os custos abaixo são hipóteses editáveis, não valores reais da IDY.
  preparationCents:500, cuttingSetupCents:150, cuttingPerMoveCents:2,
  cuttingStackSheets:100, glueSetupCents:100, gluePerBlockCents:20,
  finishingSetupCents:100, finishingPerBlockCents:30,
  reference:{widthCm:10,heightCm:7,paper:75,leavesPerBlock:50,
    // Foto da calibração inicial. Editar custos atuais acima NÃO recalibra a tabela
    // silenciosamente: aumentos de custo, imposto ou margem afetam a estimativa.
    costBasis:{taxRate:0.06,marginRate:0.30,wasteRate:0.05,setupSheets:2,marginCm:0.30,gutterCm:0.10,leavesPerBlock:50,
      preparationCents:500,cuttingSetupCents:150,cuttingPerMoveCents:2,cuttingStackSheets:100,
      glueSetupCents:100,gluePerBlockCents:20,finishingSetupCents:100,finishingPerBlockCents:30,
      sheets:[{id:'A4',widthCm:21,heightCm:29.7,paperCents:{54:5,75:6},printCents:{preta:6,colorida:20}},
              {id:'A3',widthCm:29.7,heightCm:42,paperCents:{54:10,75:12},printCents:{preta:10,colorida:32}}]},
    totals:{preta:{1:2000,10:9000,20:14000,50:24000,100:42000},
            colorida:{1:2500,10:11000,20:17500,50:31000,100:55000}}}
};
