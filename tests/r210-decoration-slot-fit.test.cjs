const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function extract(name,next){const start=html.indexOf('function '+name+'(');assert.ok(start>=0);const end=html.indexOf('\nfunction '+next+'(',start);assert.ok(end>start);return html.slice(start,end);}
const fit=vm.runInNewContext(extract('validDecorationSlotFit','decorationCandidates')+'\nvalidDecorationSlotFit');
test('valid decoration fits equal or larger equipment slot',()=>{assert.equal(fit({slot:1},3),true);assert.equal(fit({slot:3},3),true);assert.equal(fit({slot:3},2),false);});
test('malformed decoration levels cannot grant skill',()=>{for(const v of [0,-1,0.5,NaN,Infinity,'invalid',null,undefined])assert.equal(fit({slot:v},3),false,String(v));});
test('malformed equipment slots cannot accept decoration',()=>{for(const v of [0,-1,1.5,NaN,Infinity,'invalid',null])assert.equal(fit({slot:1},v),false,String(v));});
test('decoration candidates use same slot validation as build calculation',()=>{assert.match(extract('decorationCandidates','sanitizeDecorationSelections'),/validDecorationSlotFit\(d,level\)/);assert.match(extract('sanitizeDecorationSelections','refreshDecorationSelects'),/!validDecorationSlotFit\(d,s.level\)/);assert.match(html,/decorationCompatibleWithSlot\(d,s.kind\)&&validDecorationSlotFit\(d,s.level\)/);});
