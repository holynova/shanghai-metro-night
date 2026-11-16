export const lines = [
{id:'1',color:'#df4856',names:'莘庄,外环路,莲花路,锦江乐园,上海南站,漕宝路,上海体育馆,徐家汇,衡山路,常熟路,陕西南路,一大会址·黄陂南路,人民广场,新闸路,汉中路,上海火车站,中山北路,延长路,上海马戏城,汶水路,彭浦新村,共康路,通河新村,呼兰路,共富新村,宝安公路,友谊西路,富锦路'.split(',')},
{id:'2',color:'#8dbd40',names:'蟠祥路·国家会计学院,国家会展中心,虹桥火车站,虹桥2号航站楼,淞虹路,北新泾,威宁路,娄山关路,中山公园,江苏路,静安寺,南京西路,人民广场,南京东路,陆家嘴,浦东南路,世纪大道,上海科技馆,世纪公园,龙阳路,张江高科,金科路,广兰路,唐镇,创新中路,华夏东路,川沙,凌空路,远东大道,海天三路,浦东1号2号航站楼'.split(',')},
{id:'8',color:'#4aa9e8',names:'沈杜公路,联航路,江月路,浦江镇,芦恒路,凌兆新村,东方体育中心,杨思,成山路,耀华路,中华艺术宫,西藏南路,陆家浜路,老西门,大世界,人民广场,曲阜路,中兴路,西藏北路,虹口足球场,曲阳路,四平路,鞍山新村,江浦路,黄兴路,延吉中路,黄兴公园,翔殷路,嫩江路,市光路'.split(',')},
{id:'10',color:'#c7a0d9',names:'虹桥火车站,虹桥2号航站楼,虹桥1号航站楼,上海动物园,龙溪路,水城路,伊犁路,宋园路,虹桥路,交通大学,上海图书馆,陕西南路,一大会址·新天地,老西门,豫园,南京东路,天潼路,四川北路,海伦路,邮电新村,四平路,同济大学,国权路,五角场,江湾体育场,三门路,殷高东路,新江湾城,国帆路,双江路,高桥西,高桥,港城路,基隆路,航中路,紫藤路,龙柏新村'.split(',')}
];
export const stations = [...new Set(lines.flatMap(l=>l.names))];
// Minutes relative to the service day's midnight; last may exceed 1440.
// Missing data must never be interpreted as service having ended.
export function serviceState(windows, minute){
 if(!windows?.length) return 'unknown';
 if(windows.some(w=>minute>=w.first && minute<w.last)) return 'open';
 return 'closed';
}
export function timeLabel(m){const n=((m%1440)+1440)%1440;return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
export function shanghaiMinute(date=new Date()) {const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);return Number(p.find(x=>x.type==='hour').value)*60+Number(p.find(x=>x.type==='minute').value);}

// Paths describe topology, not timetable row order. The branch never joins directly to Hongqiao.
for (const line of lines) line.paths = line.id === '10'
 ? [line.names.slice(0,34), [...line.names.slice(34), '龙溪路']]
 : [line.names];
export const edges = lines.flatMap(line => line.paths.flatMap(path => path.slice(0,-1).flatMap((from,i)=>[
 {line:line.id,from,to:path[i+1]}, {line:line.id,from:path[i+1],to:from}
])));
export const stationLines = name => lines.filter(l=>l.names.includes(name));
