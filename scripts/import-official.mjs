import fs from 'node:fs';
import {lines} from '../dist/network.mjs';
const result={source:'https://service.shmetro.com/hcskb/index.htm',retrieved:'2026-11-16',governmentCrosscheck:'https://www.shanghai.gov.cn/nw17239/20260413/d8e14c16213246eba8fac7c23b2b04af.html',lines:{}};
for(const line of lines){const tables=JSON.parse(fs.readFileSync(new URL(`../sources/line${line.id}-official.json`,import.meta.url)));const t=tables.find(t=>t[0]?.[0]==='车站'&&t.some(r=>r[0]===line.names[0]));if(!t)throw Error('Missing official table');const rows=t.slice(2).filter(r=>line.names.includes(r[0]));if(rows.length!==line.names.length)throw Error('Incomplete table');rows.forEach((r,i)=>{if(r[0]!==line.names[i])throw Error('Station order mismatch');});result.lines[line.id]=rows.map(r=>r.slice(0,line.id==='1'?8:6));}
// Only these two stops permit boarding on the official fixed extra trains.
result.extraTrains={line:'2',destination:'龙阳路',boarding:[{station:'虹桥火车站',times:['23:04','23:30']},{station:'虹桥2号航站楼',times:['23:06','23:32']}],alightingOnly:['淞虹路','威宁路','中山公园','静安寺','人民广场','世纪大道','龙阳路']};
fs.writeFileSync(new URL('../dist/official-data.mjs',import.meta.url),'// Extracted from official tables; see sources and scripts/import-official.mjs.\nexport default '+JSON.stringify(result,null,2)+';\n');console.log('Imported 28 + 31 official rows, no interpolation.');
