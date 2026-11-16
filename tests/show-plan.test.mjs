import test from 'node:test';
import assert from 'node:assert/strict';
import {buildShowPlan,nextShowStep,crossedCues} from '../dist/show-plan.mjs';
test('film preserves simultaneous opening/closing transitions and crosses midnight',()=>{
 const edges=[{line:'1',id:1},{line:'1',id:2},{line:'2',id:3}];
 const plan=buildShowPlan('2026-11-20',edges,(e,date,minute)=>{const t=minute+(date==='2026-11-21'?1440:0);return {state:(e.id===1?t>=300&&t<900:e.id===2?t>=900&&t<1500:t>=310&&t<1400)?'open':'closed'};});
 assert(plan.events.some(e=>e.minute===900));
 assert.deepEqual(plan.events.find(e=>e.minute===1500).cues,[{line:'1',kind:'closed',text:'全部方向收车'}]);
 assert.equal(plan.events.find(e=>e.minute===300).cues[0].kind,'open');
 let minute=plan.start;const visited=[];while(minute<plan.end){minute=nextShowStep(plan,minute).minute;visited.push(minute);}
 for(const event of plan.events.slice(1))assert(visited.includes(event.minute),`missed ${event.minute}`);
 assert(nextShowStep(plan,400).fast);
 assert(!nextShowStep(plan,898).fast);
 assert.equal(crossedCues(plan,299,310).length,2);
 assert.equal(crossedCues(plan,310,310).length,0);
});

test('official Friday film shows all 14 lines opening and closing, including next-day service',async()=>{
 const {edges}=await import('../dist/network.mjs');
 const plan=buildShowPlan('2026-11-20',edges);
 assert(Object.values(plan.events[0].counts).every(n=>n===0));
 const cues=plan.events.flatMap(e=>e.cues.map(c=>({...c,minute:e.minute})));
 assert.equal(cues.filter(c=>c.kind==='open').length,14);
 assert.equal(cues.filter(c=>c.kind==='closed').length,14);
 assert(cues.some(c=>c.kind==='closed'&&c.minute>1440));
 assert(Object.values(plan.events.at(-1).counts).every(n=>n===0));
 let minute=plan.start,steps=0;const visited=new Set();
 while(minute<plan.end){minute=nextShowStep(plan,minute).minute;visited.add(minute);steps++;assert(steps<1441);}
 for(const event of plan.events.slice(1))assert(visited.has(event.minute));
});
