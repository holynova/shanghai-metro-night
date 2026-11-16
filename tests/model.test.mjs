import test from 'node:test';import assert from 'node:assert/strict';import {lines,stations,serviceState,shanghaiMinute} from '../dist/network.mjs';
test('ten lines retain all stations and merge transfer nodes',()=>{assert.equal(lines[0].names.length,28);assert.equal(lines[1].names.length,31);assert.equal(stations.length,258);assert.equal(lines[2].names.length,30);assert.equal(lines[3].names.length,37);});
test('last departure has already left at cutoff; downstream remains available',()=>{assert.equal(serviceState([{first:300,last:1380}],1382),'closed');assert.equal(serviceState([{first:305,last:1385}],1382),'open');assert.equal(serviceState([{first:300,last:1380}],1380),'closed');});
test('unknown does not mean closed',()=>assert.equal(serviceState(undefined,1382),'unknown'));
test('previous service day and morning reopening',()=>{const windows=[{first:-1140,last:15},{first:300,last:1455}];assert.equal(serviceState(windows,5),'open');assert.equal(serviceState(windows,100),'closed');assert.equal(serviceState(windows,300),'open');});
test('Shanghai time is independent of device timezone',()=>assert.equal(shanghaiMinute(new Date('2026-11-16T15:02:00Z')),1382));
import {directionInfo,parseTime,dateShift} from '../dist/schedule.mjs';
test('official 1-line ordinary last train advances station by station',()=>{assert.equal(directionInfo('1',0,1,'2026-11-16',1352).state,'closed');assert.equal(directionInfo('1',1,1,'2026-11-16',1352).state,'open');});
test('Friday midnight service belongs to Thursday, Saturday midnight to Friday',()=>{assert.equal(directionInfo('1',12,1,'2026-11-20',10).state,'closed');assert.equal(directionInfo('1',12,1,'2026-11-21',10).state,'open');assert.equal(directionInfo('1',12,1,'2026-11-22',10).state,'open');assert.equal(directionInfo('1',12,1,'2026-11-23',10).state,'closed');});
test('short-working remains open but never extends beyond Guanglan Road',()=>{assert.equal(directionInfo('2',12,1,'2026-11-16',1385).state,'open');assert.equal(directionInfo('2',22,1,'2026-11-16',1385).state,'closed');});
test('extra train only enables boarding at Hongqiao stations',()=>{assert.equal(directionInfo('2',2,1,'2026-11-16',1400).extraOnly,true);assert.equal(directionInfo('2',12,1,'2026-11-16',1400).state,'closed');assert.equal(directionInfo('2',2,1,'2026-11-16',1410).state,'closed');assert.equal(directionInfo('2',3,1,'2026-11-16',1410).state,'open');});
test('early short-working begins at 04:55 but does not extend beyond railway station',()=>{assert.equal(directionInfo('1',4,1,'2026-11-16',295).state,'open');assert.equal(directionInfo('1',15,1,'2026-11-16',320).state,'closed');});
test('arrivals excluded, midnight parsed, month and year rollover correct',()=>{assert.equal(parseTime('次00:05 (到达)'),null);assert.equal(parseTime('次00:03'),1443);assert.equal(dateShift('2026-12-31',1),'2027-01-01');assert.equal(directionInfo('2',1,-1,'2026-11-16',2).state,'open');assert.equal(directionInfo('2',1,-1,'2026-11-16',3).state,'closed');});
test('all 114 boarding directions have complete official coverage',()=>{let count=0;for(const l of lines.slice(0,2))for(let i=0;i<l.names.length;i++)for(const d of [-1,1])if(i+d>=0&&i+d<l.names.length){const s=directionInfo(l.id,i,d,'2026-11-16',720);assert.equal(s.state,'open');assert.ok(s.first<s.last);count++;}assert.equal(count,114);});

import {edges,stationLines} from '../dist/network.mjs';
import {edgeInfo} from '../dist/schedule.mjs';
import {positions,mapSize,routePoints,offsetRoute,routeMidpoint} from '../dist/layout.mjs';
const ten=(from,to,date,minute)=>edgeInfo({line:'10',from,to},date,minute);
test('all 608 real directed edges have verified daytime service',()=>{assert.equal(edges.length,608);for(const e of edges){const s=edgeInfo(e,'2026-11-16',720);assert.equal(s.state,'open',JSON.stringify(e));assert.ok(s.first<s.last);assert.ok(positions[e.from]&&positions[e.to]);}});
test('branch junction has three neighbours, never connects branch to Hongqiao directly',()=>{assert.deepEqual(edges.filter(e=>e.line==='10'&&e.from==='龙溪路').map(e=>e.to).sort(),['上海动物园','水城路','龙柏新村'].sort());assert.ok(!edges.some(e=>e.from==='龙柏新村'&&e.to==='虹桥火车站'));});
test('Friday late service excludes Hangzhong branch and north of Xinjiangwancheng',()=>{assert.equal(ten('龙溪路','龙柏新村','2026-11-20',1420).state,'closed');assert.equal(ten('龙溪路','上海动物园','2026-11-20',1420).state,'open');assert.equal(ten('殷高东路','新江湾城','2026-11-20',1435).state,'open');assert.equal(ten('新江湾城','国帆路','2026-11-20',1435).state,'closed');assert.equal(ten('龙柏新村','龙溪路','2026-11-20',1435).state,'closed');});
test('10 extra boarding only at three Hongqiao stations on ordinary days',()=>{assert.equal(ten('虹桥火车站','虹桥2号航站楼','2026-11-16',1365).extraOnly,true);assert.equal(ten('虹桥1号航站楼','上海动物园','2026-11-16',1382).state,'open');assert.equal(ten('虹桥1号航站楼','上海动物园','2026-11-16',1384).state,'closed');assert.equal(ten('上海动物园','龙溪路','2026-11-16',1380).state,'closed');});
test('8 and 10 preserve Friday service on Saturday morning only where covered',()=>{const e={line:'8',from:'人民广场',to:'大世界'};assert.equal(edgeInfo(e,'2026-11-21',29).state,'open');assert.equal(edgeInfo(e,'2026-11-21',30).state,'closed');assert.equal(edgeInfo(e,'2026-11-20',10).state,'closed');assert.equal(ten('陕西南路','一大会址·新天地','2026-11-21',24).state,'open');assert.equal(ten('陕西南路','一大会址·新天地','2026-11-21',25).state,'closed');assert.equal(ten('航中路','紫藤路','2026-11-21',10).state,'closed');});
test('actual transfer nodes are shared and branch termini have one outgoing neighbour',()=>{assert.deepEqual(stationLines('人民广场').map(l=>l.id),['1','2','8']);assert.deepEqual(stationLines('四平路').map(l=>l.id),['8','10']);assert.deepEqual(stationLines('老西门').map(l=>l.id),['8','10']);for(const n of ['航中路','基隆路'])assert.equal(edges.filter(e=>e.line==='10'&&e.from===n).length,1);});

const route=(line,from,to,date,minute)=>edgeInfo({line,from,to},date,minute);
test('7 short working cannot cross Qihua boundary',()=>{
 assert.equal(route('7','上海大学','祁华路','2026-11-21',30).state,'open');
 assert.equal(route('7','上海大学','祁华路','2026-11-21',30).destination,'祁华路');
 assert.equal(route('7','祁华路','顾村公园','2026-11-21',30).state,'closed');
 assert.equal(route('7','祁华路','上海大学','2026-11-21',0).state,'closed');
 assert.equal(route('7','上海大学','南陈路','2026-11-21',0).state,'open');
});
test('9 extension ends exactly at Sheshan and Yanggao Middle Road',()=>{
 assert.equal(route('9','世纪大道','杨高中路','2026-11-21',30).state,'open');
 assert.equal(route('9','世纪大道','杨高中路','2026-11-21',56).state,'closed');
 assert.equal(route('9','杨高中路','芳甸路','2026-11-21',30).state,'closed');
 assert.equal(route('9','泗泾','佘山','2026-11-21',30).state,'open');
 assert.equal(route('9','佘山','洞泾','2026-11-21',30).state,'closed');
 assert.equal(route('9','世纪大道','杨高中路','2026-11-20',30).state,'closed');
});
test('13 extension stops at Huapeng with opposite directions independent',()=>{
 assert.equal(route('13','东明路','华鹏路','2026-11-21',30).state,'open');
 assert.equal(route('13','东明路','华鹏路','2026-11-21',30).destination,'华鹏路');
 assert.equal(route('13','华鹏路','下南路','2026-11-21',30).state,'closed');
 assert.equal(route('13','华鹏路','东明路','2026-11-20',1439).state,'open');
 assert.equal(route('13','华鹏路','东明路','2026-11-21',0).state,'closed');
 assert.equal(route('13','东明路','成山路','2026-11-21',1).state,'open');
});
test('new transfer stations share one node and all edges remain in map bounds',()=>{
 assert.deepEqual(stationLines('静安寺').map(l=>l.id),['2','7','14']);
 assert.deepEqual(stationLines('长寿路').map(l=>l.id),['7','13']);
 assert.deepEqual(stationLines('马当路').map(l=>l.id),['9','13']);
 for(const p of Object.values(positions)){assert.ok(p[0]>=0&&p[0]<=mapSize.width&&p[1]>=0&&p[1]<=mapSize.height);}
});

test('4 is a closed ring with exactly two distinct outgoing directions per station',()=>{
 const line=lines.find(l=>l.id==='4');assert.equal(line.names.length,26);
 assert.equal(edges.filter(e=>e.line==='4').length,52);
 for(const name of line.names)assert.equal(edges.filter(e=>e.line==='4'&&e.from===name).length,2);
 assert.ok(edges.some(e=>e.line==='4'&&e.from==='宜山路'&&e.to==='上海体育馆'));
});
test('4 Yishan departure uses separate official rows and is never an arrival',()=>{
 for(const to of ['虹桥路','上海体育馆']){
  assert.equal(route('4','宜山路',to,'2026-11-16',324).state,'closed');
  assert.equal(route('4','宜山路',to,'2026-11-16',325).state,'open');
  assert.equal(route('4','宜山路',to,'2026-11-16',1354).state,'open');
  assert.equal(route('4','宜山路',to,'2026-11-16',1355).state,'closed');
 }
 assert.equal(route('4','宜山路','虹桥路','2026-11-16',720).directionLabel,'内圈');
 assert.equal(route('4','宜山路','上海体育馆','2026-11-16',720).directionLabel,'外圈');
});
test('4 last services terminate at Yishan while the opposite edge closes independently',()=>{
 assert.equal(route('4','上海体育馆','宜山路','2026-11-20',1415).state,'open');
 assert.equal(route('4','上海体育馆','宜山路','2026-11-20',1416).state,'closed');
 assert.equal(route('4','虹桥路','宜山路','2026-11-20',1415).state,'open');
 assert.equal(route('4','虹桥路','延安西路','2026-11-20',1415).state,'closed');
 assert.equal(route('4','上海体育馆','宜山路','2026-11-20',1415).destination,'宜山路');
 assert.equal(route('4','虹桥路','宜山路','2026-11-21',0).state,'closed');
});
test('12 and 14 use the correct opposite table headings with no Friday extension',()=>{
 for(const date of ['2026-11-16','2026-11-20']){
  assert.equal(route('12','陕西南路','南京西路',date,1381).state,'open');
  assert.equal(route('12','陕西南路','南京西路',date,1382).state,'closed');
  assert.equal(route('12','陕西南路','嘉善路',date,1382).state,'open');
  assert.equal(route('14','静安寺','一大会址·黄陂南路',date,1377).state,'open');
  assert.equal(route('14','静安寺','一大会址·黄陂南路',date,1378).state,'closed');
  assert.equal(route('14','静安寺','武定路',date,1378).state,'open');
 }
});
test('all lines have complete service data on ordinary and extended days at all key hours',()=>{
 for(const date of ['2026-11-16','2026-11-20','2026-11-21'])for(const minute of [0,30,300,720,1350,1380,1439])for(const e of edges){
  const s=edgeInfo(e,date,minute);assert.notEqual(s.state,'unknown',JSON.stringify(e));assert.ok(Number.isFinite(s.first)&&Number.isFinite(s.last));
 }
});

test('official schematic preserves north/south and Pudong/Puxi relationships',()=>{
 assert.ok(positions['富锦路'][1]<positions['上海火车站'][1]);
 assert.ok(positions['上海火车站'][1]<positions['人民广场'][1]);
 assert.ok(positions['沈杜公路'][1]>positions['人民广场'][1]);
 assert.ok(positions['虹桥火车站'][0]<positions['中山公园'][0]);
 assert.ok(positions['世纪大道'][0]>positions['人民广场'][0]);
 assert.ok(positions['上海松江站'][0]<positions['徐家汇'][0]);
 assert.ok(positions['上海松江站'][1]>positions['徐家汇'][1]);
 assert.ok(positions['基隆路'][1]<positions['四平路'][1]);
});
test('all 608 official route paths meet their physical stations with reversible geometry',()=>{
 for(const e of edges){
  const points=routePoints(e);assert.ok(points.length>=2);
  assert.deepEqual(points[0],positions[e.from]);assert.deepEqual(points.at(-1),positions[e.to]);
  assert.deepEqual(routePoints({line:e.line,from:e.to,to:e.from}),[...points].reverse());
  for(const p of offsetRoute(points))assert.ok(p.every(Number.isFinite));
  assert.ok(Object.values(routeMidpoint(points)).every(Number.isFinite));
 }
});
test('official bends are retained instead of diagonal shortcuts between stations',()=>{
 assert.ok(routePoints({line:'4',from:'大连路',to:'杨树浦路'}).length>2);
 assert.ok(routePoints({line:'1',from:'新闸路',to:'人民广场'}).length>2);
});
