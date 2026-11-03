"""Read-only public audit. User-agent probes do not authenticate real crawler IPs."""
import concurrent.futures,datetime,hashlib,json,re,sys,urllib.error,urllib.request,urllib.robotparser,xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin,urlparse
ORIGIN='https://idygrafica.netlify.app'
class Document(HTMLParser):
 def __init__(self,source):
  super().__init__(convert_charrefs=True);self.title=[];self.h1=[];self.visible=[];self.links=[];self.ids=set();self.metas={};self.canonicals=[];self.resources=[];self.schemas=[];self.schema_errors=[];self.script=False;self.style=False;self.ld=False;self.buffer=[];self.in_title=False;self.in_h1=False;self.h1_buffer=[];self.feed(source)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.add(a['id'])
  if tag=='title':self.in_title=True
  if tag=='h1':self.in_h1=True;self.h1_buffer=[]
  if tag=='meta':self.metas[a.get('name')or a.get('property')or a.get('http-equiv','')]=a.get('content','')
  if tag=='link':
   if a.get('rel')=='canonical':self.canonicals.append(a.get('href'))
   if a.get('rel')=='stylesheet':self.resources.append(a.get('href'))
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag=='script':self.script=True;self.ld=a.get('type')=='application/ld+json';self.buffer=[];self.resources.extend([a['src']]if a.get('src')else[])
  if tag=='style':self.style=True
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
  if tag=='h1':self.h1.append(' '.join(self.h1_buffer).strip());self.in_h1=False
  if tag=='style':self.style=False
  if tag=='script':
   if self.ld:
    try:self.schemas.append(json.loads(''.join(self.buffer)))
    except Exception as e:self.schema_errors.append(str(e))
   self.script=False;self.ld=False
 def handle_data(self,data):
  if self.script:self.buffer.append(data);return
  if self.style:return
  if self.in_title:self.title.append(data)
  if self.in_h1:self.h1_buffer.append(data)
  self.visible.append(data)
 def summary(self):
  nodes=[n for s in self.schemas for n in s.get('@graph',[s])];text=' '.join(' '.join(self.visible).split())
  return {'title':''.join(self.title),'description':self.metas.get('description'),'canonical':self.canonicals,'metaRobots':self.metas.get('robots'),'h1':self.h1,'schemaTypes':[n.get('@type')for n in nodes],'schemaErrors':self.schema_errors,'textCharacters':len(text),'addressMentions':re.findall(r'.{0,20}(?:Travessa da Luz|Rua Umbu|Estamos online|100% online|exclusivamente online|retirada|Retirada|horário|presencial).{0,100}',text),'structuredAddresses':re.findall(r'"streetAddress"\s*:\s*"([^"]+)"',json.dumps(self.schemas,ensure_ascii=False))}
def fetch(url,agent='IDY-ReadOnly-SEO-Audit/1.0'):
 req=urllib.request.Request(url,headers={'User-Agent':agent,'Cache-Control':'no-cache'})
 try:
  with urllib.request.urlopen(req,timeout=30)as r:return {'status':r.status,'finalUrl':r.url,'headers':dict(r.headers),'body':r.read().decode('utf-8','replace')}
 except urllib.error.HTTPError as e:return {'status':e.code,'finalUrl':e.url,'headers':dict(e.headers),'body':e.read().decode('utf-8','replace')}
 except Exception as e:return {'status':None,'error':str(e),'headers':{},'body':''}
def main():
 output=Path(sys.argv[1]if len(sys.argv)>1 else'.preview/search-visibility/public-audit.json');output.parent.mkdir(parents=True,exist_ok=True)
 sitemap=fetch(ORIGIN+'/sitemap.xml');robots=fetch(ORIGIN+'/robots.txt');urls=[n.text for n in ET.fromstring(sitemap['body']).iter()if n.tag.endswith('loc')];policy=urllib.robotparser.RobotFileParser();policy.parse(robots['body'].splitlines());agents={'normal':'IDY-ReadOnly-SEO-Audit/1.0','Googlebot':'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)','OAI-SearchBot':'Mozilla/5.0 (compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot)'}
 jobs=[(url,name,ua)for url in urls for name,ua in agents.items()]
 def probe(job):
  url,name,ua=job;r=fetch(url,ua);doc=Document(r['body']);return(url,name,{'status':r['status'],'finalUrl':r.get('finalUrl'),'xRobotsTag':next((v for k,v in r['headers'].items()if k.lower()=='x-robots-tag'),None),'robotsAllowed':policy.can_fetch(name,url),'sourceSha256':hashlib.sha256(r['body'].encode()).hexdigest(),**doc.summary()},doc)
 probes=[];documents={}
 with concurrent.futures.ThreadPoolExecutor(max_workers=6)as pool:
  for url,name,result,doc in pool.map(probe,jobs):
   probes.append({'url':url,'agent':name,**result})
   if name=='normal':documents[url]=doc
 links=[];broken=[];unknown=set()
 for url,doc in documents.items():
  for href in doc.links:
   target=urljoin(url,href);u=urlparse(target)
   if u.netloc!=urlparse(ORIGIN).netloc:continue
   canonical=ORIGIN+(u.path or'/');links.append({'from':url,'to':target})
   if canonical in documents:
    if u.fragment and u.fragment not in documents[canonical].ids:broken.append({'from':url,'to':target,'reason':'fragmento ausente no HTML inicial'})
   elif not re.search(r'\.(?:png|jpg|jpeg|webp|pdf|mp4)$',u.path,re.I):unknown.add(canonical)
 for url in sorted(unknown):
  r=fetch(url)
  if r['status']!=200:broken.append({'to':url,'status':r['status'],'reason':'destino não acessível'})
 aliases=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=5)as pool:
  for url,r in zip(urls,pool.map(lambda u:fetch(u.rstrip('/')+'.html'if u!=ORIGIN+'/'else ORIGIN+'/index.html'),urls)):aliases.append({'url':url,'statusAfterRedirects':r['status'],'finalUrl':r.get('finalUrl')})
 resources=sorted({urljoin(url,p)for url,doc in documents.items()for p in doc.resources if p and urlparse(urljoin(url,p)).netloc==urlparse(ORIGIN).netloc});resource_results=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=5)as pool:
  for url,r in zip(resources,pool.map(fetch,resources)):resource_results.append({'url':url,'status':r['status'],'contentType':next((v for k,v in r['headers'].items()if k.lower()=='content-type'),None)})
 report={'dateUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'origin':ORIGIN,'sitemapStatus':sitemap['status'],'sitemapUrls':urls,'robotsStatus':robots['status'],'robotsText':robots['body'],'probes':probes,'internalLinks':len(links),'brokenInternalLinks':broken,'aliases':aliases,'resources':resource_results,'unknownPageStatus':fetch(ORIGIN+'/auditoria-url-inexistente-idy-20261103')['status'],'limitations':['Os user-agents foram enviados do ambiente de auditoria, sem IP autenticado dos robôs.','HTTP e robots não comprovam indexação, visitas reais dos robôs ou posicionamento.','Search Console, Perfil da Empresa e logs/WAF do Netlify não estão conectados.']};output.write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({'report':str(output),'pages':len(urls),'probes':len(probes),'statusProblems':[{'url':p['url'],'agent':p['agent'],'status':p['status']}for p in probes if p['status']!=200],'blocked':sum(not p['robotsAllowed']for p in probes),'noindex':sum('noindex'in str(p['xRobotsTag'])+str(p['metaRobots'])for p in probes),'brokenLinks':broken,'resourceProblems':[r for r in resource_results if r['status']!=200],'unknownPageStatus':report['unknownPageStatus']},ensure_ascii=False))
if __name__=='__main__':main()
