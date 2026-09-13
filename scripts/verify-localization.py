"""Validate the built language variants using only Python's standard library."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from hashlib import sha256
import json,re,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
LANGS=('en','es','fr','de','it','pl')
class Node:
    def __init__(self,tag='',attrs=(),parent=None): self.tag=tag; self.attrs=dict(attrs); self.children=[]; self.parent=parent
    def text(self): return ''.join(c.text() if isinstance(c,Node) else c for c in self.children)
    def all(self,tag=None):
        return ([self] if self.tag and (tag is None or self.tag==tag) else [])+[n for c in self.children if isinstance(c,Node) for n in c.all(tag)]
    def has_ancestor(self,cls):
        node=self
        while node:
            if cls in node.attrs.get('class','').split(): return True
            node=node.parent
        return False
class Document(HTMLParser):
    void={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def __init__(self,html): super().__init__(convert_charrefs=True);self.root=Node();self.node=self.root;self.feed(html)
    def handle_starttag(self,tag,attrs):
        child=Node(tag,attrs,self.node);self.node.children.append(child)
        if tag not in self.void:self.node=child
    def handle_endtag(self,tag):
        node=self.node
        while node.parent:
            if node.tag==tag:self.node=node.parent;return
            node=node.parent
    def handle_data(self,text):self.node.children.append(text)
def norm(s):return re.sub(r'\s+',' ',s).strip()
source=json.loads((ROOT/'src/locales/en.json').read_text())
asset_sizes=json.loads((ROOT/'src/screenshot-sizes.json').read_text())
asset_sources=json.loads((ROOT/'docs/screenshot-sources-20260913.json').read_text())
assert len(asset_sizes)==len(asset_sources)==25,'Incomplete screenshot sets'
assert len({item['sha256'] for item in asset_sources})==25,'Repeated localized screenshots'
for item in asset_sources:
    assert asset_sizes[item['asset']]=={key:item[key] for key in ('width','height')},item['asset']
    assert sha256((ROOT/'dist'/item['asset'].lstrip('/')).read_bytes()).hexdigest()==item['sha256'],item['asset']
for lang in LANGS[1:]:
    assert {item['slot'] for item in asset_sources if item['locale']==lang}==set(range(1,6)),lang
for lang in LANGS:
    catalog=json.loads((ROOT/f'src/locales/{lang}.json').read_text())
    assert set(catalog)==set(source),f'{lang}: catalog key mismatch'
    assert all(isinstance(v,str) and v.strip() for v in catalog.values()),f'{lang}: empty value'
    assert all(not re.search(r'\[CC\d|__CC',v) for v in catalog.values()),f'{lang}: draft placeholder'
    for en,value in catalog.items():
        assert re.findall(r'</?\w+[^>]*>',en)==re.findall(r'</?\w+[^>]*>',value),f'{lang}: changed HTML in {en}'
        assert not (set(re.findall(r'\d+',value))-set(re.findall(r'\d+',en))),f'{lang}: introduced numeric claim in {en}'
        if 'Clarity Chat' in en: assert 'Clarity Chat' in value,f'{lang}: translated brand in {en}'
files=list((ROOT/'dist').rglob('index.html')); assert len(files)==72,len(files)
paths={('/'+str(p.relative_to(ROOT/'dist')).replace('index.html','')):p for p in files}
faq_count=0; guide_count=0
for path,file in paths.items():
    parts=path.strip('/').split('/');lang=parts[0] if parts[0] in LANGS[1:] else 'en'
    base=path[len(lang)+1:] if lang!='en' else path
    doc=Document(file.read_text()).root
    shot_prefix='/assets/screenshots/'+(lang+'/' if lang!='en' else '')
    shots=[img for img in doc.all('img') if img.attrs.get('src','').startswith('/assets/screenshots/')]
    if base=='/': assert len(shots)==6,path
    elif base.startswith('/guides/') and base!='/guides/': assert len(shots)==1,path
    for shot in shots:
        src=shot.attrs['src']
        assert re.fullmatch(re.escape(shot_prefix)+r'screenshot-[1-5]\.jpg',src),(path,src)
        expected=asset_sizes[src] if lang!='en' else {'width':631,'height':1369}
        assert {key:int(shot.attrs[key]) for key in ('width','height')}==expected,(path,src)
    if base=='/':
        assert {shot.attrs['src'] for shot in shots}=={shot_prefix+f'screenshot-{slot}.jpg' for slot in range(1,6)},path
        og_image=[m.attrs.get('content') for m in doc.all('meta') if m.attrs.get('property')=='og:image']
        assert og_image==['https://claritychat.app'+shot_prefix+'screenshot-1.jpg'],path
    assert doc.all('html')[0].attrs.get('lang')==lang,path
    alternatives={n.attrs.get('hreflang'):n.attrs.get('href') for n in doc.all('link') if n.attrs.get('hreflang')}
    assert len(alternatives)==7,path
    for code in (*LANGS,'x-default'):
        local=base if code in ('en','x-default') else '/'+code+base
        assert alternatives[code]=='https://claritychat.app'+local,(path,code)
        assert local in paths,(path,local)
    canonical=[n.attrs['href'] for n in doc.all('link') if n.attrs.get('rel')=='canonical']
    assert canonical==['https://claritychat.app'+path],path
    ids=[n.attrs['id'] for n in doc.all() if 'id' in n.attrs];assert len(ids)==len(set(ids)),f'{path}: repeated ids'
    for a in doc.all('a'):
        href=a.attrs.get('href','')
        if href.startswith('#'): assert href[1:] in ids,(path,href)
        if href.startswith('/'):
            target,_,fragment=href.partition('#');assert target in paths,(path,href)
            if fragment:
                target_html=paths[target].read_text();assert f'id="{fragment}"' in target_html,(path,href)
            if not a.has_ancestor('language-picker'):
                assert (target.startswith('/'+lang+'/') if lang!='en' else target.split('/')[1] not in LANGS[1:]),f'{path}: language lost at {href}'
    picker=[n for n in doc.all('details') if 'language-picker' in n.attrs.get('class','')];assert len(picker)==1,path
    links=picker[0].all('a');assert len(links)==6,path
    current=[a for a in links if a.attrs.get('aria-current')=='page'];assert len(current)==1 and current[0].attrs['href']==path,path
    schemas=[json.loads(n.text()) for n in doc.all('script') if n.attrs.get('type')=='application/ld+json']
    for schema in schemas:
        if schema['@type']=='SoftwareApplication': assert schema['screenshot']=='https://claritychat.app'+shot_prefix+'screenshot-1.jpg',path
        if 'inLanguage' in schema: assert schema['inLanguage']==lang,path
        if schema['@type']=='Article':
            guide_count+=1
            assert schema['mainEntityOfPage']=='https://claritychat.app'+path,path
            assert (ROOT/'dist'/urlparse(schema['image']).path.lstrip('/')).is_file(),path
        if schema['@type']=='FAQPage':
            visible=[]
            for detail in doc.all('details'):
                if detail.attrs.get('class')=='faq-item':visible.append((norm(detail.all('summary')[0].text()),norm(detail.all('p')[0].text())))
            structured=[(norm(q['name']),norm(q['acceptedAnswer']['text'])) for q in schema['mainEntity']]
            assert visible==structured,f'{path}: FAQ visible/schema mismatch'
            faq_count+=len(visible)
    if lang!='en':
        visible={norm(n.text()) for tag in ('p','h1','h2','h3','figcaption','summary') for n in doc.all(tag)}
        leaked=[s for s in source if len(s.split())>=2 and norm(s) in visible]
        assert not leaked,(path,leaked)
urls={n.text for n in ET.parse(ROOT/'dist/sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
assert urls=={'https://claritychat.app'+p for p in paths},'Sitemap mismatch'
assert guide_count==42,guide_count
print(f'Validated 72 pages, 6 complete catalogs, 30 language-matched screenshots, 42 guides, {faq_count} FAQ pairs, reciprocal language links, localized navigation and unchanged brand names.')
