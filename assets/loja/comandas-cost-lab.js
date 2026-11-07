import {groups,profileFields,definitions} from './comandas-cost-fields.js';
import {newProductionCostConfig,withLegacyEstimates,isCostPreviewHost} from './comandas-cost-config.js';
import {compareRequestedMargins,auditCostInputs} from './comandas-cost-audit.js';
import {purchaseReferences} from './comandas-purchase-references.js';
import {escapeHtml} from './digital-products.js';

const root=document.querySelector('#cost-lab');
let config=withLegacyEstimates(newProductionCostConfig()),job={widthCm:10,heightCm:7,paper:75,color:'preta',blocks:10};
const money=(v,digits=2)=>v===null||v===undefined?'—':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:digits}).format(v/100);
const percent=v=>v===null||v===undefined?'—':(v*100).toLocaleString('pt-BR',{maximumFractionDigits:2})+'%';
const read=path=>path.split('.').reduce((o,k)=>o?.[k],config);
const allowed=new Map(definitions.map(d=>[d[0],d]));
function field([path,label,kind]){
 const value=read(path),id='cost-'+path.replaceAll('.','-'),inputValue=value===null?'':kind==='money'?Number((value/100).toFixed(4)):kind==='percent'?value*100:value;
 const control=kind==='support'?`<select id="${id}" data-cost-path="${path}" data-cost-kind="support"><option value=""${value===null?' selected':''}>A confirmar</option><option value="yes"${value===true?' selected':''}>Sim</option><option value="no"${value===false?' selected':''}>Não</option></select>`:`<input id="${id}" data-cost-path="${path}" data-cost-kind="${kind}" type="number" min="0" step="${kind==='money'?'0.0001':kind==='integer'?'1':'0.01'}" value="${inputValue}" inputmode="decimal" placeholder="Não informado">`;
 return `<div class="field"><label for="${id}">${label}</label>${control}<span class="source" data-source-for="${path}"></span></div>`;
}
function updateSources(){
 root.querySelectorAll('[data-source-for]').forEach(el=>{
  const path=el.dataset.sourceFor,value=read(path),source=config.sources[path]||'';
  el.textContent=value===null?'Não informado':source||'Informado nesta simulação; não auditado.';
  el.classList.toggle('estimated',source.startsWith('Estimativa'));
 });
}
function render(){
 root.innerHTML=`<p class="eyebrow">PRÉVIA · ANÁLISE INTERNA · SIMULAÇÃO 2</p><h1>Comandas: preço pelos custos de produção</h1><p class="intro">Compare Xerox Color 560 e HP pigmentada, em A4 e A3. A simulação anterior foi preservada. Aqui não existe ajuste de calibração: a tabela atual serve apenas para comparar o resultado.</p><p><strong>Fórmula atual para conferência:</strong> <a href="/_previas/comandas-producao/" target="_blank" rel="noopener noreferrer">Memória por folha, bloco e pedido (nova aba) →</a></p><p><a href="/_previas/comandas-estimativa-inicial/" target="_blank" rel="noopener noreferrer">Abrir ESTIMATIVA INICIAL: orçamento específico de 50 blocos (nova aba) →</a></p><div class="notice"><strong>Sem vendas ou alteração dos preços da loja.</strong> Campo vazio significa custo não informado, não R$ 0,00. Preencha explicitamente zero apenas quando não houver custo adicional. O preço fica pendente enquanto faltar qualquer parcela necessária. Este painel da prévia não é uma área com autenticação; os dados preenchidos ficam apenas nesta sessão do navegador.</div><section class="panel"><h2>Trabalho para analisar</h2><div class="job-grid"><div class="field"><label for="lab-width">Largura (cm)</label><input id="lab-width" data-job="widthCm" type="number" min="1" max="42" step="0.01" value="${job.widthCm}"></div><div class="field"><label for="lab-height">Altura (cm)</label><input id="lab-height" data-job="heightCm" type="number" min="1" max="42" step="0.01" value="${job.heightCm}"></div><div class="field"><label for="lab-paper">Papel</label><select id="lab-paper" data-job="paper"><option value="54"${Number(job.paper)===54?' selected':''}>54 g</option><option value="75"${Number(job.paper)===75?' selected':''}>75 g</option></select></div><div class="field"><label for="lab-color">Impressão</label><select id="lab-color" data-job="color"><option value="preta"${job.color==='preta'?' selected':''}>Preta</option><option value="colorida"${job.color==='colorida'?' selected':''}>Colorida</option></select></div><div class="field"><label for="lab-blocks">Blocos</label><input id="lab-blocks" data-job="blocks" type="number" min="1" max="1000" step="1" value="${job.blocks}"></div></div><p class="help">Somente 1 via, 50 folhas por bloco. As comparações abaixo repetem o trabalho para 1, 10, 20, 50 e 100 blocos.</p></section><section class="panel"><h2>Premissas configuráveis</h2><p class="help">As referências de compra informadas e as margens de 45% e 50% estão registradas. As estimativas anteriores são carregadas e identificadas como provisórias. A HP preta por A4 usa a estimativa informada de R$ 0,02; não presumimos compatibilidade da HP com A3. Manutenção, mão de obra e serviços ausentes continuam pendentes.</p><div class="actions"><button type="button" id="legacy-estimates">Carregar estimativas anteriores</button><button class="secondary" type="button" id="reset-costs">Limpar e restaurar campos</button><button class="secondary" type="button" id="export-costs">Baixar parâmetros JSON</button></div></section><section class="panel" id="audit-panel" aria-labelledby="audit-heading"><h2 id="audit-heading">Conferência dos custos e das origens</h2><p class="help">Confirmados significa referência de compra informada por você; não houve auditoria de nota fiscal. Custos derivados de corte e demais hipóteses continuam estimados. Imposto e margem são parâmetros separados dos custos de compra.</p><div id="cost-audit"></div></section>${groups.map(g=>`<section class="panel"><h2>${g.title}</h2><div class="fields">${g.fields.map(field).join('')}</div>${g.title.startsWith('Corte')?'<p class="help">Informe materiais, terceiros e custos não incluídos na mão de obra por tempo. Não conte a mesma despesa duas vezes.</p>':''}</section>`).join('')}<section class="panel"><h2>Equipamentos e área imprimível</h2><p class="help">O modelo e a área imprimível da HP ainda precisam de confirmação. A3 permanece a confirmar; não foi presumida compatibilidade. Se o custo por clique já incluir manutenção, informe zero no campo de manutenção em vez de repetir essa despesa. O tempo por folha considera apenas o tempo ativo de trabalho do operador.</p></section><div class="equipment-grid">${['xerox','hp'].flatMap(id=>['A4','A3'].map(format=>`<section class="panel"><h3>${config.equipment[id].name} · ${format}</h3><div class="fields">${profileFields(id,format).map(field).join('')}</div></section>`)).join('')}</div><section class="panel"><h2>Como o preço é formado</h2><p class="formula">Venda = custo total ÷ (1 − imposto − margem)</p><p class="help">A margem é sobre o faturamento após os custos e o imposto. O custo inclui papel, impressão e manutenção de todas as folhas produzidas, inclusive perdas e preparação, mais mão de obra, preparação fixa, corte, cola e acabamento. A4 e A3 têm seu próprio aproveitamento e custo. Não existe interpolação de preços ou calibração nesta simulação.</p></section><div class="error" id="lab-error" role="alert" hidden></div><section aria-labelledby="results-heading"><h2 id="results-heading">Comparação dos cenários</h2><p class="help">Diferença = venda calculada − referência. A referência é sempre 10 × 7 cm, 75 g. As tabelas comparam as margens desejadas de 45% e 50%, sem liberar preço comercial; o resumo principal usa a margem editável acima.</p><div id="cost-results" class="results-grid" aria-live="polite"></div></section>`;
 updateSources();refresh();
}
function routeCard(route){
 const r=route.selected,labels={paper:'Papel',printing:'Impressão',maintenance:'Manutenção',labour:'Mão de obra',preparation:'Preparação',cutting:'Corte',glue:'Cola',finishing:'Acabamento'};
 const statusText=r.status==='unsupported'?'Formato marcado como não suportado.':r.status==='does-not-fit'?'O trabalho não cabe na área imprimível deste cenário.':r.status==='invalid'?r.errors.join(' '):r.status==='calculated'?'Simulação calculada com os custos informados. Sem preço aprovado para venda.':`Preço pendente: ${r.missing.length} campo(s) necessário(s) sem informação.`;
 const line=r.status==='calculated'?`<span class="sale">${money(r.saleCents)}</span><span>${money(r.perBlockCents)} por bloco · ${percent(r.actualMarginRate)} de margem após custo e imposto</span>`:'';
 return `<article class="panel" data-cost-route="${route.equipmentId}-${route.format}"><h3>${r.equipmentName} · ${route.format}</h3><div class="result-state ${r.status}">${escapeHtml(statusText)}${line}</div><div class="result-meta"><span>${r.totalLeaves.toLocaleString('pt-BR')} folhas de comanda</span><span>${r.layout?.perSheet??'—'} peças/folha</span><span>${r.productionSheets??'—'} folhas de produção</span></div>${r.layout?`<p class="help">Folhas úteis: ${r.goodSheets}. Perdas: ${r.wasteSheets??'—'}. Preparação: ${r.setupSheets??'—'}. Aproveitamento da área útil: ${percent(r.utilization)}.</p>`:''}<dl class="breakdown">${Object.entries(labels).map(([key,label])=>`<dt>${label}</dt><dd>${money(r.costs[key])}</dd>`).join('')}<dt>${r.status==='calculated'?'Custo total':'Subtotal conhecido (incompleto)'}</dt><dd>${money(r.status==='calculated'?r.costCents:r.knownSubtotalCents)}</dd><dt>Imposto sobre a venda</dt><dd>${money(r.taxCents)}</dd><dt>Lucro da simulação</dt><dd>${money(r.profitCents)}</dd><dt>Papel + impressão + manutenção/folha</dt><dd>${money(r.perProductionSheetCents,4)}</dd><dt>Esses custos por folha de comanda</dt><dd>${money(r.materialPerFinishedLeafCents,4)}</dd></dl>${r.missing.length?`<details class="pending"><summary>Ver campos pendentes</summary><ul>${r.missing.map(m=>`<li>${escapeHtml(m.label)}</li>`).join('')}</ul></details>`:''}${!r.comparableReference?'<p class="help">Medidas ou papel diferentes da referência: compare com essa ressalva.</p>':''}<div class="table-scroll"><table data-margin-table><caption>Margens de 45% e 50% versus referência</caption><thead><tr><th>Blocos</th><th>Custo</th><th>Venda 45%</th><th>Referência</th><th>Dif. 45%</th><th>Venda 50%</th><th>Dif. 50%</th></tr></thead><tbody>${route.marginScenarios[0].references.map((s,i)=>{const b=route.marginScenarios[1].references[i];return `<tr><td>${s.job.blocks}</td><td>${money(s.costCents)}</td><td>${money(s.saleCents)}</td><td>${money(s.referenceCents)}</td><td>${s.differenceCents>0?'+':''}${money(s.differenceCents)}</td><td>${money(b.saleCents)}</td><td>${b.differenceCents>0?'+':''}${money(b.differenceCents)}</td></tr>`;}).join('')}</tbody></table></div></article>`;
}
function auditValue(row){
 if(row.value===null||row.value===undefined)return 'Não informado';
 if(row.kind==='money')return money(row.value,6);
 if(row.kind==='percent')return percent(row.value);
 if(row.kind==='support')return row.value?'Sim':'Não';
 return String(row.value).replace('.',',');
}
function renderAudit(){
 const audit=auditCostInputs(config);
 const openState=new Map([...root.querySelectorAll('[data-audit-category]')].map(el=>[el.dataset.auditCategory,el.open]));
 const table=(rows)=>`<div class="table-scroll"><table class="audit-table"><thead><tr><th>Item</th><th>Valor</th><th>Origem / condição</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${escapeHtml(row.label)}</td><td>${escapeHtml(auditValue(row))}</td><td>${escapeHtml(row.source||'')}</td></tr>`).join('')}</tbody></table></div>`;
 root.querySelector('#cost-audit').innerHTML=[['confirmed','1. CUSTOS CONFIRMADOS',true],['estimated','2. CUSTOS ESTIMADOS',false],['pending','3. CUSTOS PENDENTES',false]].map(([key,label,open])=>`<details class="audit-group" data-audit-category="${key}" ${(openState.get(key)??open)?'open':''}><summary>${label} (${audit[key].length})</summary>${table(audit[key])}</details>`).join('')+`<details class="audit-group"><summary>Imposto, margens e condições informadas — não são custos de compra</summary>${table([...audit.rules,...audit.conditions])}</details><p class="help">Para 54 g, o custo A4/A3 é uma estimativa de desmembramento: 9 A4 ou 4 A3 por folha 66 × 96 cm, sem custo de refilo e ainda sem rendimento/perdas de corte confirmados. Os valores por folha são arredondados para cima a quatro casas em reais. O preço de compra A4 75 g não confirma o preço de uma folha A3 75 g.</p>`;
}
function refresh(){
 const error=root.querySelector('#lab-error'),results=root.querySelector('#cost-results');
 renderAudit();
 try{const rows=compareRequestedMargins(job,config);error.hidden=true;error.textContent='';results.innerHTML=rows.map(routeCard).join('');}
 catch(e){error.hidden=false;error.textContent=e.message;results.replaceChildren();}
}
function set(path,value){const keys=path.split('.');let o=config;for(const k of keys.slice(0,-1))o=o[k];o[keys.at(-1)]=value;}
function edit(e){
 const path=e.target.dataset.costPath,key=e.target.dataset.job;
 if(path&&allowed.has(path)){
  const kind=allowed.get(path)[2],v=e.target.value;
  const value=kind==='support'?(v===''?null:v==='yes'):v===''?null:Number(v.replace(',','.'))/(kind==='money'?0.01:kind==='percent'?100:1);
  if(Object.is(read(path),value))return;
  set(path,value);config.sources[path]='Informado nesta simulação; não auditado.';updateSources();refresh();
 }else if(key&&['widthCm','heightCm','paper','color','blocks'].includes(key)){if(String(job[key])===e.target.value)return;job[key]=e.target.value;refresh();}
}
if(!isCostPreviewHost(location.hostname)){
 root.innerHTML='<div class="notice"><strong>Análise disponível somente na prévia de testes.</strong> Nenhuma simulação de custos ou venda foi ativada neste domínio.</div>';
}else{
 render();root.addEventListener('input',edit);root.addEventListener('change',edit);
 root.addEventListener('click',e=>{
  if(e.target.closest('#legacy-estimates')){config=withLegacyEstimates(config);render();}
  if(e.target.closest('#reset-costs')){config=newProductionCostConfig();render();}
  if(e.target.closest('#export-costs')){
   const blob=new Blob([JSON.stringify({job,config,purchaseReferences},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='comandas-parametros-simulacao-2.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
 });
}
