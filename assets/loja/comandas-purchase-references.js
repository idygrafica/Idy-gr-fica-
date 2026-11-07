// Referências de compra informadas pelo usuário, sem auditoria de nota fiscal.
export const purchaseReferences={
  paper75A4:{packageCents:2600,sheets:500,widthCm:21,heightCm:29.7},
  paper54Raw:{packageCents:3441,sheets:33,widthCm:66,heightCm:96}
};
export const paper75A4Cents=purchaseReferences.paper75A4.packageCents/purchaseReferences.paper75A4.sheets;
// Aproveitamento teórico de corte, sem comprovar perdas ou custo de refilo.
// 3 × 21 cm por 3 × 29,7 cm = 9 A4; 2 × 29,7 por 2 × 42 = 4 A3.
export const theoretical54Yield={A4:9,A3:4};
export function estimated54PaperCents(format){
  if(!Object.hasOwn(theoretical54Yield,format))throw Error('Formato de corte inválido.');
  const p=purchaseReferences.paper54Raw;
  // Arredondar para cima em 1/100 de centavo (quatro casas decimais em reais).
  return Math.ceil(p.packageCents/(p.sheets*theoretical54Yield[format])*100-1e-8)/100;
}
export const requestedMargins=[0.45,0.50];
