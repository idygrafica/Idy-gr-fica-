// Preços em centavos. null impede cobrança e sempre gera solicitação de orçamento.
// Cadastre novos produtos/opções aqui. Só registre preços aprovados pela administração.
export const products = [
  { id:'cartoes', name:'Cartões de visita', category:'cartoes', description:'9 × 5 cm · Couchê 300 g', photo:0, options:[{id:'500',label:'500 unidades',priceCents:null},{id:'1000',label:'1.000 unidades',priceCents:null}] },
  { id:'a3', name:'Impressões A3 coloridas', category:'impressoes', description:'Papel sulfite comum · preço por folha', photo:1, options:[{id:'frente',label:'Somente frente',priceCents:300},{id:'duplex',label:'Frente e verso',priceCents:600}] },
  { id:'pastas', name:'Pastas personalizadas', category:'pastas', description:'Com bolso · impressão 4 × 0 ou 4 × 4', photo:2, options:[{id:'4x0',label:'Colorida na frente (4 × 0)',priceCents:null},{id:'4x4',label:'Colorida frente e verso (4 × 4)',priceCents:null}] },
  { id:'blocos', name:'Receituários e blocos', category:'pastas', description:'A7, A6 ou A5 · 50 folhas por bloco', photo:3, options:[{id:'a7',label:'A7 · 50 folhas',priceCents:null},{id:'a6',label:'A6 · 50 folhas',priceCents:null},{id:'a5',label:'A5 · 50 folhas',priceCents:null}] },
  { id:'comandas', name:'Comandas', category:'comandas', description:'1, 2 ou 3 vias · diversos tamanhos', photo:4, options:[{id:'1via',label:'1 via',priceCents:null},{id:'2vias',label:'2 vias',priceCents:null},{id:'3vias',label:'3 vias',priceCents:null}] },
  { id:'adesivos', name:'Adesivos e etiquetas', category:'adesivos', description:'Diversos tamanhos e materiais', photo:5, options:[{id:'personalizado',label:'Tamanho e material sob consulta',priceCents:null}] },
  { id:'brindes', name:'Brindes personalizados', category:'brindes', description:'Camisetas, canecas, agendas e muito mais', photo:6, options:[{id:'caneca',label:'Caneca',priceCents:null},{id:'camiseta',label:'Camiseta',priceCents:null},{id:'agenda',label:'Agenda',priceCents:null},{id:'outro',label:'Outro brinde',priceCents:null}] },
  { id:'canetas', name:'Canetas personalizadas', category:'brindes', description:'Personalização DTF UV · diversas cores e modelos', photo:7, defaultQuantity:100, quantityPrices:{100:520,500:400,1000:360}, options:[{id:'personalizada',label:'Personalização DTF UV',priceCents:null}] },
  { id:'blocos-personalizados', name:'Blocos personalizados', category:'pastas', description:'A4, A5 e A6 · offset 90 g · 50 folhas · colorido na frente (4×0)', photo:3, options:[{id:'digital:A5',label:'A5 · offset 90 g · 50 folhas · 4×0',priceCents:null},{id:'digital:A4',label:'A4 · offset 90 g · 50 folhas · 4×0',priceCents:null},{id:'digital:A6',label:'A6 · offset 90 g · 50 folhas · 4×0',priceCents:null}] },
  { id:'pastas-digitais-simples', name:'Pastas digitais simples', category:'pastas', description:'Impressão digital e vinco · acabamento simples, sem bolsa', photo:2, options:[{id:'digital:Simples',label:'Impressão digital e vinco · sem bolsa',priceCents:null}] }
];
export const categories = [
  {id:'todos',label:'Todos os produtos',icon:'grid'}, {id:'impressoes',label:'Impressões',icon:'printer'},
  {id:'cartoes',label:'Cartões',icon:'card'}, {id:'pastas',label:'Pastas e receituários',icon:'file'},
  {id:'comandas',label:'Comandas e blocos',icon:'list'}, {id:'adesivos',label:'Adesivos e etiquetas',icon:'tag'},
  {id:'brindes',label:'Brindes personalizados',icon:'gift'}
];
