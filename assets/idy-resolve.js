// Guia local e determinístico. Não cria IA, não envia arquivos e não altera o carrinho.
export const modes=Object.freeze({arte:'Já tenho minha arte',ideia:'Tenho uma ideia',orientacao:'Quero ajuda para começar'});
export const needs=Object.freeze({
 empresa:{title:'Vou abrir uma empresa.',description:'Um primeiro contato com a sua identidade: cartões, impressos, comunicação visual e presença digital. A equipe ajuda a avaliar o que faz sentido para o seu momento.',request:'Vou abrir uma empresa e quero orientação sobre os materiais para começar.',links:[['Impressos e cartões','/impressos'],['Comunicação visual','/comunicacao-visual'],['Criação de sites','/criacao-sites']]},
 divulgar:{title:'Preciso divulgar meu negócio.',description:'Panfletos, materiais de apresentação e comunicação visual podem fazer parte da divulgação. Conte o que sua empresa faz e onde você quer apresentar sua marca.',request:'Quero divulgar meu negócio e preciso de orientação sobre os materiais.',links:[['Impressos para divulgação','/impressos'],['Banners e comunicação visual','/comunicacao-visual']]},
 documento:{title:'Quero imprimir um documento.',description:'Conte qual arquivo precisa imprimir e a quantidade aproximada. A equipe orienta o formato e as opções de impressão; você não precisa decidir tudo agora.',request:'Preciso imprimir um documento.',links:[['Impressões rápidas','/impressoes-rapidas'],['Impressões do dia a dia','/impressoes-do-dia-a-dia']]},
 personalizar:{title:'Preciso personalizar produtos.',description:'Explique qual produto você quer personalizar e como pretende usá-lo. A equipe confirma as opções de personalização e a viabilidade do material no orçamento.',request:'Quero personalizar produtos e preciso conhecer as opções disponíveis.',links:[['Personalização e soluções da IDY','/servicos#personalizacao'],['Materiais impressos','/impressos']]},
 fachada:{title:'Quero renovar minha fachada.',description:'Uma foto do local e as medidas, se você tiver, ajudam a começar. A IDY avalia a proposta de comunicação visual e confirma materiais e condições do projeto.',request:'Quero renovar a fachada da minha empresa.',links:[['Comunicação visual','/comunicacao-visual'],['Trabalhos da IDY','/portfolio']]},
 livro:{title:'Preciso imprimir um livro ou apostila.',description:'Conte o tipo de publicação, a quantidade de exemplares e o número de páginas, se souber. Formato, papel e acabamento podem ser avaliados com a equipe.',request:'Preciso imprimir um livro ou apostila e quero orientação sobre o projeto.',links:[['Livros, apostilas e catálogos','/livros-digitais'],['Impressões rápidas','/impressoes-rapidas']]},
 site:{title:'Quero criar um site para minha empresa.',description:'Conte sobre sua empresa e o que você precisa apresentar na internet. A equipe prepara uma proposta de site com páginas e recursos definidos para o seu projeto.',request:'Quero criar um site para a minha empresa.',links:[['Criação de sites','/criacao-sites']]}
});
// Cada exemplo usa o mesmo guia e serviços existentes; não é um novo sistema de IA.
export const examples=Object.freeze({
 menu:{label:'Cardápios e divulgação',need:'divulgar',href:'/impressos',request:'Quero um cardápio ou material de divulgação para o meu negócio de gastronomia. Gostaria de orientação sobre as opções.'},
 fachada:{label:'Fachadas e comunicação visual',need:'fachada',href:'/comunicacao-visual',request:'Quero renovar a fachada da minha empresa e gostaria de orientação sobre materiais e comunicação visual.'},
 livro:{label:'Livros, apostilas e catálogos',need:'livro',href:'/livros-digitais',request:'Quero imprimir um livro, apostila ou catálogo e gostaria de orientação sobre a produção.'},
 adesivo:{label:'Adesivos e rótulos',need:'personalizar',href:'/servicos#adesivos',request:'Quero adesivos ou rótulos para a minha marca. Gostaria de orientação sobre tamanho, material e aplicação.'},
 personalizado:{label:'Produtos personalizados',need:'personalizar',href:'/servicos#personalizacao',request:'Quero personalizar uma camiseta ou outro produto e consultar a técnica e a viabilidade da minha ideia.'}
});
const arts={pronta:'Tenho um arquivo pronto',ideia:'Tenho uma ideia ou referência','nao-sei':'Quero orientação sobre a arte'};
function text(value,max,label){const result=typeof value==='string'?value.replace(/\r\n/g,'\n').trim():'';if(result.length>max)throw new RangeError(label+' excedeu o limite de caracteres.');return result;}
export function buildBrief(data={}){
 const product=text(data.product,600,'Descrição');if(!product)throw new Error('Conte o que você precisa produzir.');
 if(!Object.hasOwn(modes,data.mode))throw new Error('Escolha como deseja começar.');
 if(!Object.hasOwn(arts,data.art))throw new Error('Informe sua situação com a arte.');
 if(data.need&&!Object.hasOwn(needs,data.need))throw new Error('Necessidade não reconhecida.');
 const quantity=text(data.quantity,80,'Quantidade'),size=text(data.size,100,'Medidas'),extra=text(data.extra,500,'Detalhes');
 const lines=['Olá! Vim pelo IDY Resolve.','Como começo: '+modes[data.mode]];
 if(data.need)lines.push('Objetivo: '+needs[data.need].title);
 lines.push('O que preciso: '+product);
 if(quantity)lines.push('Quantidade aproximada: '+quantity);
 if(size)lines.push('Medidas: '+size);
 lines.push('Arte: '+arts[data.art]);
 if(extra)lines.push('Mais informações: '+extra);
 lines.push('Gostaria de orientação e orçamento com a equipe.');
 return lines.join('\n');
}
export function briefUrl(data){return 'https://wa.me/5551981687562?text='+encodeURIComponent(buildBrief(data));}

if(typeof document!=='undefined'){
 const root=document.querySelector('.resolve-page');
 if(root){
  const q=selector=>root.querySelector(selector),form=q('#rs-brief'),request=q('#rs-request');
  let mode='',need='',autoProduct='';
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function focusSection(element){element.focus({preventScroll:true});element.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});}
  function read(){return {mode:mode||'orientacao',need,product:q('#rs-product').value,quantity:q('#rs-quantity').value,size:q('#rs-size').value,art:q('#rs-art').value,extra:q('#rs-extra').value};}
  function refreshShare(){
   if(q('[data-rs-share]').hidden)return;
   try{const data=read();q('[data-rs-summary]').textContent=buildBrief(data);q('[data-rs-whatsapp]').href=briefUrl(data);q('[data-rs-whatsapp]').removeAttribute('aria-disabled');q('[data-rs-copy]').disabled=false;}
   catch{q('[data-rs-summary]').textContent='Descreva o pedido para preparar um novo resumo.';q('[data-rs-whatsapp]').removeAttribute('href');q('[data-rs-whatsapp]').setAttribute('aria-disabled','true');q('[data-rs-copy]').disabled=true;}
  }
  function setMode(value){mode=value;root.querySelectorAll('[data-rs-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.rsMode===value)));}
  function openRequest(value=mode||'orientacao',suggestion=''){
   setMode(value);request.hidden=false;
   if(value==='arte')q('#rs-art').value='pronta';else if(value==='ideia')q('#rs-art').value='ideia';
   const product=q('#rs-product');if(suggestion&&(!product.value.trim()||product.value===autoProduct)){product.value=suggestion;autoProduct=suggestion;}
   const content={arte:['Sua arte já está pronta. Vamos ao próximo passo.','Conte qual produto deseja fazer. Você poderá anexar o arquivo na conversa do WhatsApp.'],ideia:['Conte sua ideia. A gente ajuda com o caminho.','Explique com suas palavras. Você não precisa saber papel, formato ou acabamento para começar.'],orientacao:['Vamos descobrir uma solução para você.','Diga o que precisa resolver. As informações que ainda não souber podem ficar para depois.']}[value];
   q('#rs-request-title').textContent=content[0];q('[data-rs-request-intro]').textContent=content[1];q('[data-rs-start-status]').textContent='Preencha só o que souber; a descrição do pedido é o único campo obrigatório.';refreshShare();focusSection(q('#rs-request-title'));
  }
  q('[data-rs-controls]').hidden=false;q('[data-rs-free-start]').hidden=false;
  root.querySelectorAll('[data-rs-mode]').forEach(button=>button.addEventListener('click',()=>{
   const value=button.dataset.rsMode;if(!Object.hasOwn(modes,value))return;
   if(value==='orientacao'){setMode(value);q('[data-rs-start-status]').textContent='Escolha uma situação abaixo ou explique com suas palavras. Você não precisa conhecer o nome técnico.';focusSection(q('#rs-needs-title'));}
   else openRequest(value);
  }));
  root.querySelectorAll('[data-rs-need]').forEach(link=>{
   link.setAttribute('role','button');link.setAttribute('aria-controls','rs-need-panel');link.setAttribute('aria-expanded','false');
   link.addEventListener('keydown',event=>{if(event.key===' '){event.preventDefault();link.click();}});
   link.addEventListener('click',event=>{
    const key=link.dataset.rsNeed;if(!Object.hasOwn(needs,key))return;event.preventDefault();need=key;
    root.querySelectorAll('[data-rs-need]').forEach(item=>{const active=item===link;item.classList.toggle('is-active',active);item.setAttribute('aria-expanded',String(active));});
    const entry=needs[key];q('[data-rs-need-title]').textContent=entry.title;q('[data-rs-need-description]').textContent=entry.description;
    const links=entry.links.map(([label,href])=>{const a=document.createElement('a');a.href=href;a.textContent=label+' ↗';return a;});q('[data-rs-service-links]').replaceChildren(...links);q('[data-rs-need-panel]').hidden=false;refreshShare();focusSection(q('[data-rs-need-title]'));
   });
  });
  q('[data-rs-continue]').addEventListener('click',()=>openRequest(mode||'orientacao',need?needs[need].request:''));
  q('[data-rs-free-start]').addEventListener('click',()=>openRequest('orientacao'));
  form.addEventListener('input',refreshShare);form.addEventListener('change',refreshShare);
  form.addEventListener('submit',event=>{
   event.preventDefault();if(!form.reportValidity())return;
   try{const data=read(),url=briefUrl(data);q('[data-rs-share]').hidden=false;refreshShare();q('[data-rs-share-status]').textContent='Resumo preparado. Revise e envie a mensagem no WhatsApp. Se tiver uma arte, anexe o arquivo na conversa.';window.open(url,'_blank','noopener,noreferrer');}
   catch(error){q('[data-rs-start-status]').textContent=error.message;}
  });
  q('[data-rs-copy]').addEventListener('click',async()=>{
   try{const brief=buildBrief(read());if(!navigator.clipboard?.writeText)throw new Error('clipboard');await navigator.clipboard.writeText(brief);q('[data-rs-copy-status]').textContent='Resumo copiado. Você pode colar no atendimento existente.';}
   catch{q('[data-rs-share] details').open=true;q('[data-rs-copy-status]').textContent='Abra o resumo e selecione o texto para copiar; a cópia automática não está disponível neste navegador.';}
  });
  const cartButton=q('[data-rs-cart]');cartButton.hidden=false;cartButton.addEventListener('click',()=>q('.cart-toggle').click());
  // Vitrine progressiva: o produto continua acessível por link sem JavaScript.
  const tabs=[...root.querySelectorAll('[data-rv-tab]')],panels=[...root.querySelectorAll('[data-rv-panel]')];
  let activeExample='menu',revealFrame=0;
  function revealFacade(value){q('.rv-stage-fachada').style.setProperty('--rv-reveal',value+'%');q('#rv-facade-range').value=String(Math.round(value));}
  function animateExample(key){
   cancelAnimationFrame(revealFrame);panels.forEach(panel=>panel.classList.remove('is-transforming'));
   const panel=q('[data-rv-panel="'+key+'"]');if(!panel)return;
   if(!reduced()){void panel.offsetWidth;panel.classList.add('is-transforming');}
   if(key==='fachada'){
    if(reduced()){revealFacade(100);return;}
    revealFacade(0);let started;
    const frame=time=>{if(activeExample!==key||document.visibilityState==='hidden'){revealFacade(100);return;}started??=time;const progress=Math.min((time-started)/1100,1);revealFacade((1-Math.pow(1-progress,3))*100);if(progress<1)revealFrame=requestAnimationFrame(frame);};
    revealFrame=requestAnimationFrame(frame);
   }
   if(key==='personalizado'||key==='adesivo'){
    panel.classList.remove('is-applied');void panel.offsetWidth;
    const apply=()=>{panel.classList.add('is-applied');const control=q('[data-rv-apply="'+key+'"]');control.setAttribute('aria-pressed','true');control.firstChild.textContent=key==='personalizado'?'Ver sem estampa ':'Ver a arte ';};
    if(reduced())apply();else revealFrame=requestAnimationFrame(()=>{if(activeExample===key)apply();});
   }
  }
  function selectExample(key,{focus=false}={}){
   if(!Object.hasOwn(examples,key))return;
   activeExample=key;
   tabs.forEach(tab=>{const active=tab.dataset.rvTab===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
   panels.forEach(panel=>{panel.hidden=panel.dataset.rvPanel!==key;});
   const panel=q('[data-rv-panel="'+key+'"]');panel.querySelectorAll('img[loading="lazy"]').forEach(img=>{img.loading='eager';});
   animateExample(key);q('[data-rv-status]').textContent=examples[key].label+'. Toque no produto para iniciar um orçamento.';
   if(focus){const tab=q('[data-rv-tab="'+key+'"]');tab.focus({preventScroll:true});tab.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});}
  }
  if(tabs.length){
   q('[data-rv-tabs]').hidden=false;
   panels.forEach(panel=>{panel.removeAttribute('aria-label');panel.setAttribute('aria-labelledby','rv-tab-'+panel.dataset.rvPanel);});
   root.querySelectorAll('[data-rv-replay],[data-rv-open],[data-rv-apply],[data-rv-range-label]').forEach(control=>{control.hidden=false;});
   tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectExample(tab.dataset.rvTab));
    tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();selectExample(tabs[next].dataset.rvTab,{focus:true});});
   });
   q('[data-rv-replay]').addEventListener('click',()=>animateExample('menu'));
   q('#rv-facade-range').addEventListener('input',event=>{cancelAnimationFrame(revealFrame);revealFacade(event.target.value);});
   q('[data-rv-open]').addEventListener('click',event=>{const panel=q('[data-rv-panel="livro"]');panel.classList.remove('is-transforming');const open=panel.classList.toggle('is-open'),control=event.currentTarget;control.setAttribute('aria-pressed',String(open));control.firstChild.textContent=open?'Fechar o livro ':'Abrir o livro ';});
   root.querySelectorAll('[data-rv-apply]').forEach(control=>control.addEventListener('click',()=>{cancelAnimationFrame(revealFrame);const key=control.dataset.rvApply,applied=q('[data-rv-panel="'+key+'"]').classList.toggle('is-applied');control.setAttribute('aria-pressed',String(applied));control.firstChild.textContent=key==='personalizado'?(applied?'Ver sem estampa ':'Aplicar estampa '):(applied?'Ver a arte ':'Ver aplicação ');}));
   root.querySelectorAll('[data-rs-example]').forEach(link=>link.addEventListener('click',event=>{
    const key=link.dataset.rsExample;if(!Object.hasOwn(examples,key))return;event.preventDefault();need=examples[key].need;
    root.querySelectorAll('[data-rs-need]').forEach(item=>{item.classList.remove('is-active');item.setAttribute('aria-expanded','false');});q('[data-rs-need-panel]').hidden=true;
    openRequest('ideia',examples[key].request);
   }));
   document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){cancelAnimationFrame(revealFrame);revealFacade(100);panels.forEach(panel=>panel.classList.remove('is-transforming'));}});
   if(!reduced()&&'IntersectionObserver' in window){const visible=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){animateExample(activeExample);visible.disconnect();}},{threshold:.2});visible.observe(q('.rs-vitrine'));}
  }
  if(!reduced()&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('rs-inview');observer.unobserve(entry.target);}),{threshold:.1});root.querySelectorAll('.rs-mode,.rs-need,.rs-photo-grid figure').forEach(element=>observer.observe(element));}
 }
}
