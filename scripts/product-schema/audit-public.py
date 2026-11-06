"""Confere somente leitura o HTML publicado das três URLs envolvidas."""
import concurrent.futures,datetime,json,re,urllib.request
from pathlib import Path
ORIGIN='https://idygrafica.com.br'
PATHS=['/','/blocos-personalizados','/pastas-digitais-simples']
def nodes(value):
 if isinstance(value,dict):
  yield value
  for child in value.values():yield from nodes(child)
 elif isinstance(value,list):
  for child in value:yield from nodes(child)
def check(path):
 req=urllib.request.Request(ORIGIN+path,headers={'Cache-Control':'no-cache','User-Agent':'IDY-ReadOnly-Product-Schema-Audit/1.0'})
 with urllib.request.urlopen(req,timeout=30) as response:
  source=response.read().decode();status=response.status
 schemas=[json.loads(raw)for raw in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',source,re.S)]
 products=[{'name':n.get('name'),'id':n.get('@id'),'offers':bool(n.get('offers')),'review':bool(n.get('review')),'aggregateRating':bool(n.get('aggregateRating'))}for schema in schemas for n in nodes(schema)if n.get('@type')=='Product']
 return {'url':ORIGIN+path,'status':status,'products':products,'incompleteProducts':sum(not(p['offers']or p['review']or p['aggregateRating'])for p in products)}
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:pages=list(pool.map(check,PATHS))
 report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pages':pages,'productionModified':False}
 output=Path('.preview/product-schema/current-public.json');output.parent.mkdir(parents=True,exist_ok=True);output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(report,ensure_ascii=False))
