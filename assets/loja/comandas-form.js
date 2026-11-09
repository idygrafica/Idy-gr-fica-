import {isCostPreviewHost} from './comandas-cost-config.js';
import {estimateComanda,comandaOption} from './comandas-pricing.js';
import {renderComandaResult} from './comandas-card.js';

export function installComandaCalculator({add,getWhatsApp,notify}){
  function refresh(root){
    const fields=Object.fromEntries([...root.querySelectorAll('[data-comanda-field]')].map(e=>[e.dataset.comandaField,e.value]));
    const error=root.querySelector('[data-comanda-error]'),output=root.querySelector('[data-comanda-result]'),button=root.querySelector('[data-comanda-add]'),link=root.querySelector('[data-comanda-whatsapp]');
    try{
      const result=estimateComanda(fields);
      error.hidden=true;error.textContent='';output.innerHTML=renderComandaResult(result);
      const valid=result.status==='provisional';button.disabled=!valid;
      if(valid){link.href=getWhatsApp({optionId:comandaOption(result.job),blocks:result.job.blocks});link.setAttribute('aria-disabled','false');return result;}
      link.removeAttribute('href');link.setAttribute('aria-disabled','true');return null;
    }catch(e){
      error.textContent=e.message;error.hidden=false;output.replaceChildren();button.disabled=true;link.removeAttribute('href');link.setAttribute('aria-disabled','true');return null;
    }
  }
  document.addEventListener('input',e=>{const root=e.target.closest('[data-comanda-calculator]');if(root&&e.target.matches('[data-comanda-field]'))refresh(root);});
  document.addEventListener('change',e=>{const root=e.target.closest('[data-comanda-calculator]');if(root&&e.target.matches('[data-comanda-field]'))refresh(root);});
  document.addEventListener('click',e=>{
    const root=e.target.closest('[data-comanda-calculator]');if(!root)return;
    if(e.target.closest('[data-comanda-add]')){
      const result=refresh(root);if(!result)return;
      try{add({optionId:comandaOption(result.job),blocks:result.job.blocks});notify('Comanda adicionada para orçamento. Estimativa sujeita à confirmação.');}catch(error){notify(error.message);}
    }
    if(e.target.closest('[data-comanda-whatsapp]')&&!refresh(root))e.preventDefault();
  });
  // Catálogo e filtros recriam os cartões: recalcular os links sem duplicar listeners.
  const grid=document.querySelector('#product-grid');
  const initialize=()=>grid?.querySelectorAll('[data-comanda-calculator]').forEach(root=>{refresh(root);const link=root.querySelector('[data-comanda-cost-link]');if(link)link.hidden=!isCostPreviewHost(location.hostname);});
  if(grid)new MutationObserver(records=>{if(records.some(r=>r.target===grid))initialize();}).observe(grid,{childList:true});
  initialize();
}
