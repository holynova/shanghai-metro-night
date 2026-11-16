"""Rebuild the schematic from Shanghai Metro's official SVG geometry snapshot.
Geometry is sampled in SVG space; timetable/topology stay in network.mjs.
No station is placed using geographic guesses or automatic graph layout.
"""
import json, math, heapq, subprocess
from pathlib import Path
from collections import defaultdict
ROOT=Path(__file__).resolve().parents[1]
geo=json.loads((ROOT/'sources/official-map-geometry.json').read_text())
config=json.loads((ROOT/'sources/official-map-config.json').read_text())
network=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {lines,stations,edges} from './dist/network.mjs';console.log(JSON.stringify({lines,stations,edges}))"],cwd=ROOT))
locations={}
for x in config['levels'][0]['locations']:locations.setdefault(x['title'].strip(),x)
markers={x['id']:x['point'] for x in geo['markers']}
pos={name:markers[locations[name]['id']] for name in network['stations']}

def dist(a,b):return math.hypot(a[0]-b[0],a[1]-b[1])
def simplify(pts,tolerance=1.2):
 if len(pts)<3:return pts
 a,b=pts[0],pts[-1];dx,dy=b[0]-a[0],b[1]-a[1];den=dx*dx+dy*dy
 def d(p):
  t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)) if den else 0
  return dist(p,[a[0]+t*dx,a[1]+t*dy])
 ds=[d(p) for p in pts[1:-1]];m=max(ds)
 if m<=tolerance:return [a,b]
 i=ds.index(m)+1;return simplify(pts[:i+1],tolerance)[:-1]+simplify(pts[i:],tolerance)
paths={};audit=[]
for line in network['lines']:
 segments=next(x['segments'] for x in geo['lines'] if x['id']==line['id'])
 points=[];groups=[];adj=defaultdict(dict);ends=[]
 def link(a,b):
  d=dist(points[a],points[b]);adj[a][b]=d;adj[b][a]=d
 for k,s in enumerate(segments):
  begin=len(points);points+=s['points'];groups += [k]*len(s['points']);ends += [begin,len(points)-1]
  for i in range(begin+1,len(points)):
   if dist(points[i-1],points[i])<6:link(i-1,i)
   else:ends += [i-1,i]
 # Join discontinuous drawing primitives across station symbols, without changing the route.
 for i in set(ends):
  nearest={}
  for j,p in enumerate(points):
   if groups[i]==groups[j] and abs(i-j)<3:continue
   d=dist(points[i],p)
   if d<=25 and (groups[j] not in nearest or d<nearest[groups[j]][0]):nearest[groups[j]]=(d,j)
  for d,j in nearest.values():link(i,j)
 nodes={}
 for name in line['names']:
  p=pos[name];nearest=sorted((dist(p,q),j) for j,q in enumerate(points))[:4]
  if nearest[0][0]>30:raise ValueError(f'Station too far from official line {line["id"]} {name} {nearest[0][0]}')
  n=len(points);points.append(p);groups.append(-1);nodes[name]=n
  for d,j in nearest:link(n,j)
 for e in network['edges']:
  if e['line']!=line['id']:continue
  reverse=f'{line["id"]}|{e["to"]}|{e["from"]}';key=f'{line["id"]}|{e["from"]}|{e["to"]}'
  if reverse in paths:paths[key]=list(reversed(paths[reverse]));continue
  start,end=nodes[e['from']],nodes[e['to']];q=[(0,start)];cost={start:0};prev={}
  while q:
   c,u=heapq.heappop(q)
   if u==end:break
   if c>cost[u]:continue
   for v,w in adj[u].items():
    if c+w<cost.get(v,float('inf')):cost[v]=c+w;prev[v]=u;heapq.heappush(q,(c+w,v))
  if end not in cost:raise ValueError(f'Disconnected official geometry {key}')
  ids=[end]
  while ids[-1]!=start:ids.append(prev[ids[-1]])
  pts=simplify([points[i] for i in reversed(ids)])
  paths[key]=pts
  if cost[end]>dist(pos[e['from']],pos[e['to']])*1.8:audit.append([key,round(cost[end]),round(dist(pos[e['from']],pos[e['to']]))])
# Crop the official full-network canvas to the selected lines, preserving one uniform scale.
x0=min(p[0] for p in pos.values())-130;y0=min(p[1] for p in pos.values())-80
x1=max(p[0] for p in pos.values())+190;y1=max(p[1] for p in pos.values())+110
shift=lambda p:[round(p[0]-x0,2),round(p[1]-y0,2)]
labels={}
for name,p in pos.items():
 candidates=[l for l in geo['labels'] if l['text']==('上海儿童' if name=='上海儿童医学中心' else name)]
 if not candidates:
  if name!='临平路':raise ValueError('Missing official label '+name)
  # Official SVG outlines this Chinese label instead of retaining a text node.
  labels[name]={'x':round(p[0]-x0-26,2),'y':round(p[1]-y0-16,2),'anchor':'start'}
  continue
 # Duplicated labels occur on interchange layers; use the closest official placement.
 l=min(candidates,key=lambda l:dist(p,[(l['point'][0]+l['end'][0])/2,(l['point'][1]+l['end'][1])/2]))
 labels[name]={'x':round(l['point'][0]-x0,2),'y':round(l['point'][1]-y0+18,2),'anchor':'start'}
 if name=='上海儿童医学中心':labels[name]['lines']=['上海儿童','医学中心']
# Join the official river centerline pieces in geographic order; rounded joins bridge
# the original SVG's separate bend fills without publishing its full artwork.
remaining=list(geo['river']);first=min(remaining,key=lambda r:min(r['a'][1],r['b'][1]));remaining.remove(first)
river_points=sorted([first['a'],first['b']],key=lambda p:p[1])
while remaining:
 r=min(remaining,key=lambda r:min(dist(river_points[-1],r['a']),dist(river_points[-1],r['b'])))
 a,b=r['a'],r['b']
 if dist(river_points[-1],b)<dist(river_points[-1],a):a,b=b,a
 river_points.extend([a,b]);remaining.remove(r)
river_points=[shift(p) for p in river_points]
river_d='M'+','.join(map(str,river_points[0]))
for i,p in enumerate(river_points[1:-1],1):
 a,b=river_points[i-1],river_points[i+1];da,db=dist(a,p),dist(p,b);radius=min(24,da/2,db/2)
 before=[p[j]+(a[j]-p[j])*radius/da for j in [0,1]];after=[p[j]+(b[j]-p[j])*radius/db for j in [0,1]]
 river_d+='L'+','.join(map(str,before))+'Q'+','.join(map(str,p))+' '+','.join(map(str,after))
river_d+='L'+','.join(map(str,river_points[-1]))
output={'source':'https://service.shmetro.com/yxxlt/index.htm','svgSource':config['levels'][0]['map'],'version':'D202512','retrieved':'2026-11-16','mapSize':{'width':round(x1-x0,2),'height':round(y1-y0,2)},'positions':{n:shift(p) for n,p in pos.items()},'labels':labels,'paths':{k:[shift(p) for p in pts] for k,pts in paths.items()},'riverPath':river_d,'river':[{'a':shift(r['a']),'b':shift(r['b']),'width':r['width']} for r in geo['river']]}
(ROOT/'dist/map-data.mjs').write_text('// Derived from the official schematic, not geographic coordinates. See scripts/import-map.py.\nexport default '+json.dumps(output,ensure_ascii=False,separators=(',',':'))+';\n')
print('Imported official geometry:',len(pos),'stations;',len(paths),'direction paths; size',output['mapSize']);print('Curved-route audit',audit)
