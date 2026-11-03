// Usa a ferramenta oficial no modo CÓDIGO: o noindex da prévia permanece intacto.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(resolve('.preview-tools/package.json'));const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
await mkdir('.preview/product-schema/google',{recursive:true});const results=[];
try{
 for(const file of ['index.html','blocos-personalizados.html','pastas-digitais-simples.html']){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const result={file,method:'Google Rich Results Test — code',status:'pending'};
  try{
   await page.goto('https://search.google.com/test/rich-results?hl=en',{waitUntil:'domcontentloaded',timeout:45000});
   for(const label of ['Reject all','Accept all']){const consent=page.getByRole('button',{name:label,exact:true});if(await consent.count()&&await consent.isVisible()){await consent.click();break;}}
   const tabs=page.getByRole('tab').filter({hasText:/code/i});if(await tabs.count())await tabs.first().click();else await page.getByText(/CODE$/i).first().click();
   await page.locator('.CodeMirror').first().waitFor({timeout:20000});const source=await readFile(file,'utf8');
   await page.locator('.CodeMirror').first().evaluate((el,source)=>{if(!el.CodeMirror)throw Error('Editor oficial indisponível');el.CodeMirror.setValue(source);},source);
   await page.getByRole('button',{name:/^test code$/i}).click();
   await page.waitForURL(/\/test\/rich-results\/result/,{timeout:90000});
   await page.waitForFunction(()=>/valid items?|No items detected|Test failed|items? detected|Some items are invalid/i.test(document.body.innerText),{timeout:60000});
   result.url=page.url();result.text=await page.locator('body').innerText();result.status='completed';
   result.missingProductRequirement=/Either ['“"]?offers|Specify ['“"]?offers|Especifique.*offers/i.test(result.text);
   if(result.missingProductRequirement)result.status='product-error';else if(/Test failed|\b[1-9]\d* invalid items?/i.test(result.text))result.status='other-schema-issues';
  }catch(error){result.status='not-validated';result.error=error.message;result.url=page.url();result.text=await page.locator('body').innerText().catch(()=> '');await writeFile('.preview/product-schema/google/'+file.replace('.html','-debug.html'),await page.content()).catch(()=>{});}
  await page.screenshot({path:'.preview/product-schema/google/'+file.replace('.html','.png'),fullPage:true}).catch(()=>{});results.push(result);await page.close();
 }
}finally{await browser.close();}
await writeFile('.preview/product-schema/google/results.json',JSON.stringify({results,productionModified:false},null,2));
console.log(JSON.stringify(results.map(({file,status,url,error,missingProductRequirement})=>({file,status,url,error,missingProductRequirement}))));
if(results.some(r=>r.status!=='completed'))process.exitCode=1;
