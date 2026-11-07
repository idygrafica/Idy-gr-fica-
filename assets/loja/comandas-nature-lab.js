import {newNatureConfig,analyzeNature,compareNature} from './comandas-nature-pricing.js';
import {isCostPreviewHost} from './comandas-cost-config.js';
const root=document.querySelector('#nature-lab'),config=newNatureConfig();
let job={widthCm:10,heightCm:7,paper:75,color:'preta',blocks:50},equipment='xerox',format='A4';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>v===null||v===undefined?'Pendente':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v/100);
const percent=v=>v===null||v===undefined?'Pendente':(v*100).toLocaleString('pt-BR',{maximumFractionDigits:2})+'%';
const valueAt=path=>path.split('.').reduce((o,k)=>o?.[k],config);
function field([path,label,kind='money']){
 const value=valueAt(path),id='n-'+path.replaceAll('.','-'),v=value===null||value===undefined?'':kind==='money'?Number((value/100).toFixed(4)):kind==='percent'?Number((value*100).toFixed(6)):value;
 const input=kind==='support'?`<select id="${id}" data-cost="${path}" data-kind="support">${[['','A confirmar'],['true','Sim'],['false','Não']].map(([v,t])=>`<option value="${v}"${String(value??'')===v?' selected':''}>${t}</option>`).join('')}</select>`:`<input id="${id}" data-cost="${path}" data-kind="${kind}" type="number" min="0" step="${kind==='integer'?'1':'any'}" value="${v}" placeholder="Pendente">`;
 const source=value===null||value===undefined?'Pendente — não considerado como zero.':config.sources[path]||'Valor configurado nesta análise; confirmar antes de aprovar preço.';
 return `<div class="field"><label for="${id}">${label}</label>${input}<span class="source">${esc(source)}</span></div>`;
}
function groups(){
 const p=`equipment.${equipment}.formats.${format}`;
 return [
 ['1. Custos por folha',[
  [`paperCents.${job.paper}.${format}`,`Papel ${job.paper} g por ${format} (R$)`],
  [p+'.printCents.'+job.color,`Impressão ${job.color} por ${format} (R$)`],[p+'.maintenanceCents','Manutenção por folha (R$)'],
  ['wasteRate','Perdas de produção (%)','percent'],[p+'.operatorMinutesPerSheet','Tempo ativo do operador por folha (min)','number']
 ]],
 ['2. Custos por bloco',[
  ['gluePerBlockCents','Cola por bloco (R$)'],['cuttingPerBlockCents','Corte por bloco (R$)'],
  ['labourMinutesPerBlock','Tempo de montagem por bloco (min)','number'],['finishingPerBlockCents','Acabamento por bloco (R$)']
 ]],
 ['3. Custos por pedido',[
  ['preparationCents','Preparação: materiais/serviços por pedido (R$)'],['preparationMinutes','Tempo de preparação por pedido (min)','number'],
  ['organizationCents','Organização: materiais/serviços por pedido (R$)'],['organizationMinutes','Tempo de organização por pedido (min)','number'],
  ['setupSheets','Folhas de preparação por pedido','integer']
 ]],
 ['Parâmetros de produção e mão de obra',[
  ['labourHourlyCents','Mão de obra por hora (R$)'],[p+'.supported',`Equipamento atende ${format}?`,'support'],[p+'.marginCm','Margem não imprimível por lado (cm)','number'],['gutterCm','Espaçamento de corte (cm)','number']
 ]]
 ];
}
const choice=(key,label,options,current)=>`<div class="field"><label for="job-${key}">${label}</label><select id="job-${key}" data-job="${key}">${options.map(([v,l])=>`<option value="${v}"${String(current)===String(v)?' selected':''}>${l}</option>`).join('')}</select></div>`;
function render(){
 root.innerHTML=`<p class="eyebrow">PR #35 · PRÉVIA · ANÁLISE INTERNA</p><h1>Comandas: memória de cálculo por natureza</h1><p class="intro">Custos por folha, por bloco e por pedido. Sem calibração ou transformação dos agregados do orçamento de 50 blocos em custos unitários.</p><div class="notice"><strong>Sem vendas ou alteração dos preços comerciais.</strong> Campo vazio é pendente; zero só deve ser informado quando confirmado. Os custos unitários cadastrados são carregados com suas origens, em uma cópia independente. Alterações ficam apenas nesta aba, sem gravação ou envio. Esta prévia não é uma área autenticada.</div><section class="panel"><h2>Especificações da produção</h2><div class="job-grid">${[['widthCm','Largura (cm)'],['heightCm','Altura (cm)'],['blocks','Quantidade de blocos']].map(([key,label])=>`<div class="field"><label for="job-${key}">${label}</label><input id="job-${key}" data-job="${key}" type="number" min="1" max="${key==='blocks'?1000:42}" step="${key==='blocks'?1:0.01}" value="${job[key]}"></div>`).join('')}${choice('paper','Papel',[[54,'54 g'],[75,'75 g']],job.paper)}${choice('color','Impressão',[['preta','Preta'],['colorida','Colorida']],job.color)}${choice('equipment','Equipamento',[['xerox','Xerox Color 560'],['hp','HP pigmentada']],equipment)}${choice('format','Folha de produção',[['A4','A4'],['A3','A3']],format)}</div><p class="help">1 via, 50 folhas por bloco. A HP não é presumida compatível com A3. Corte, cola e acabamento devem informar custos por bloco, sem duplicar o tempo de montagem. Se a impressão incluir manutenção, confirme e informe zero separado para manutenção.</p></section>${groups().map(([title,fields])=>`<section class="panel"><h2>${title}</h2><div class="fields">${fields.map(field).join('')}</div></section>`).join('')}<section class="panel"><h2>Como o cálculo funciona</h2><div class="formula">Folhas úteis = teto(blocos × 50 ÷ peças por folha)<br>Folhas perdidas = teto(folhas úteis ÷ (1 − perdas)) − folhas úteis<br>Folhas produzidas = úteis + perdidas + preparação<br>Custo = custos por folha + custos por bloco + custos por pedido<br>Preço mínimo sem lucro = custo ÷ 0,94<br>Venda 45% = custo ÷ 0,49 · Venda 50% = custo ÷ 0,44<br>Margem efetiva da referência = (referência × 0,94 − custo) ÷ referência</div><p class="help">Imposto de 6% sobre o faturamento. Margem sobre a venda após custos e imposto. Cada parcela de custo é arredondada para cima ao centavo, somada, e os preços são arredondados para cima ao centavo. Perdas consomem papel, impressão, manutenção e tempo ativo; folhas de preparação são discriminadas no pedido, sem duplicação. O preço mínimo depende de todos os custos necessários; não é o subtotal conhecido.</p></section><div id="nature-results" aria-live="polite"></div><section class="panel"><h2>Referências anteriores preservadas</h2><p>O orçamento específico de 50 blocos continua registrado: papel/impressão R$ 23,16, mão de obra R$ 15,00, cola/acabamento R$ 5,00 e manutenção R$ 5,00. Esses agregados não dizem quanto custa uma folha, um bloco ou um pedido; não foram distribuídos automaticamente nesta fórmula. É necessário informar o consumo e o tempo de cada operação.</p><p><a href="/_previas/comandas-estimativa-inicial/">Consultar a estimativa inicial e suas hipóteses históricas</a> · <a href="/_previas/comandas-custos/">Consultar custos unitários anteriores</a></p></section>`;
 renderResults();
}
function renderResults(){
 const target=root.querySelector('#nature-results');
 try{
  const rows=compareNature(job,equipment,format,config),r=analyzeNature(job,equipment,format,config);
  const status=x=>({incomplete:'Pendente: faltam custos/condições',invalid:'Corrigir parâmetros',unsupported:'Formato não suportado','does-not-fit':'Não cabe na folha',calculated:'Calculado com os parâmetros da prévia'}[x.status]);
  target.innerHTML=`<section class="panel"><h2>Comparação: 1 a 1.000 blocos</h2><p class="help">Tabela de referência da PR #35 para 10 × 7 cm, 75 g e 50 folhas. No site oficial, Comandas permanece sob orçamento. Não se inventa referência para 1.000 blocos nem para outras especificações. Margem efetiva é calculada somente com custo completo e referência compatível.</p><div class="table-scroll"><table data-nature-comparison><thead><tr><th>Blocos</th><th>Folhas produzidas</th><th>Custo total</th><th>Mínimo sem lucro</th><th>Venda 45%</th><th>Venda 50%</th><th>Referência ${job.color}</th><th>Margem efetiva</th><th>Situação</th></tr></thead><tbody>${rows.map(x=>`<tr data-blocks="${x.job.blocks}"><td><button type="button" data-memory="${x.job.blocks}" aria-label="Ver memória de ${x.job.blocks} blocos">${x.job.blocks}</button></td><td>${x.productionSheets??'Pendente'}</td><td>${money(x.costCents)}</td><td>${money(x.minimumCents)}</td><td>${money(x.sales[0]?.saleCents)}</td><td>${money(x.sales[1]?.saleCents)}</td><td>${x.referenceCents===null?'Sem referência':money(x.referenceCents)}</td><td>${x.referenceCents===null?'Sem referência':percent(x.effectiveMargin)}</td><td>${status(x)}</td></tr>`).join('')}</tbody></table></div></section><section class="panel" data-nature-memory><h2>Memória: ${r.job.blocks} blocos · ${format} · ${job.color}</h2><p class="result-state">${status(r)}. ${r.totalLeaves.toLocaleString('pt-BR')} folhas finais · ${r.layout?.perSheet??'—'} peças por folha · ${r.goodSheets??'—'} folhas úteis · ${r.wasteSheets??'—'} perdas · ${r.setupSheets??'—'} preparação.</p>${r.errors.length?`<p class="error">${r.errors.map(esc).join('<br>')}</p>`:''}${r.missing.length?`<details class="pending" open><summary>Informações pendentes (${r.missing.length})</summary><ul>${r.missing.map(m=>`<li>${esc(m.label)}</li>`).join('')}</ul></details>`:''}${Object.entries(r.groups).map(([key,lines])=>`<h3>${{sheet:'1. Por folha',block:'2. Por bloco',order:'3. Por pedido'}[key]}</h3><div class="table-scroll"><table data-nature-group="${key}"><thead><tr><th>Parcela</th><th>Quantidade</th><th>Custo unitário*</th><th>Total</th></tr></thead><tbody>${lines.map(l=>`<tr><td>${l.label}</td><td>${l.count??'—'} ${l.unit}(s)</td><td>${l.unitCents===null?'Pendente':'R$ '+(l.unitCents/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:6})}</td><td>${money(l.cents)}</td></tr>`).join('')}<tr><th>Total do grupo</th><td></td><td></td><td>${money(r.groupTotals[key])}</td></tr></tbody></table></div>`).join('')}<p class="help">* Custos unitários preservam até quatro casas em reais nos campos monetários; valores derivados de minutos podem ter mais casas. Não são arredondados previamente ao centavo.</p><dl class="breakdown"><dt>Subtotal das parcelas conhecidas (incompleto quando há pendências)</dt><dd data-known-subtotal>${money(r.knownSubtotalCents)}</dd><dt>Custo total de produção</dt><dd data-total-cost>${money(r.costCents)}</dd><dt>Preço mínimo sem lucro, com imposto de 6%</dt><dd>${money(r.minimumCents)}</dd>${r.sales.map(s=>`<dt>Venda com margem ${s.rate*100}%</dt><dd>${money(s.saleCents)}</dd><dt>Imposto / lucro simulado</dt><dd>${money(s.taxCents)} / ${money(s.profitCents)}</dd>`).join('')}<dt>Margem efetiva na tabela de referência</dt><dd>${r.referenceCents===null?'Sem referência':percent(r.effectiveMargin)}</dd></dl></section>`;
 }catch(e){target.innerHTML=`<p class="error" role="alert">${esc(e.message)}</p>`;}
}
if(!isCostPreviewHost(location.hostname))root.innerHTML='<p class="notice">Disponível somente na prévia de testes. Nenhuma venda foi ativada.</p>';
else{
 render();root.addEventListener('change',e=>{
  const el=e.target;
  if(el.dataset.cost){const path=el.dataset.cost,kind=el.dataset.kind;let value=el.value===''?null:kind==='support'?el.value==='true':Number(el.value)*(kind==='money'?100:kind==='percent'?0.01:1);
   if(kind==='money'&&value!==null)value=Number(value.toFixed(8));
   const keys=path.split('.');let object=config;for(const key of keys.slice(0,-1))object=object[key];object[keys.at(-1)]=value;
   config.sources[path]='Configurado nesta aba para simulação; não aprovado para venda.';el.closest('.field').querySelector('.source').textContent=value===null?'Pendente — não considerado como zero.':config.sources[path];renderResults();
  }else if(el.dataset.job){const key=el.dataset.job;if(key==='equipment')equipment=el.value;else if(key==='format')format=el.value;else job[key]=['paper','blocks','widthCm','heightCm'].includes(key)?(el.value===''?NaN:Number(el.value)):el.value;
   if(['equipment','format','paper','color'].includes(key))render();else renderResults();
  }
 });root.addEventListener('click',e=>{const button=e.target.closest('[data-memory]');if(button){job.blocks=Number(button.dataset.memory);root.querySelector('#job-blocks').value=job.blocks;renderResults();root.querySelector('[data-nature-memory]').scrollIntoView({block:'start'});}});
}
