import test from 'node:test';
import assert from 'node:assert/strict';
import {changeRange,effectiveDate} from '../dist/timeline.mjs';
test('leaving night view preserves the following calendar day',()=>{
 assert.deepEqual(changeRange('2026-11-20',1470,false),{date:'2026-11-21',minute:30});
});
test('early morning night view uses previous base date and round trips',()=>{
 const next=changeRange('2026-11-21',30,true);
 assert.deepEqual(next,{date:'2026-11-20',minute:1470});
 assert.equal(effectiveDate(next.date,next.minute),'2026-11-21');
 assert.deepEqual(changeRange(next.date,next.minute,false),{date:'2026-11-21',minute:30});
});
test('night view moves daytime to 21:00 on the same date',()=>{
 assert.deepEqual(changeRange('2026-11-20',720,true),{date:'2026-11-20',minute:1260});
});
