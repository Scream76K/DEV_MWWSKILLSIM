const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const line=html.split('\n').find(x=>x.includes('for(const s of allEquipSlots()){const id=build.decos?.[s.key]'));
assert.ok(line,'calcBuild must validate equipped decorations');
function calculate(slot,deco){
  const script=`let build={decos:{head0:'gem'}},DB={decorations:[${JSON.stringify(deco)}]},total={};function allEquipSlots(){return [${JSON.stringify(slot)}]};function decorationCompatibleWithSlot(d,kind){return d.kind===kind};function validDecorationSlotFit(d,level){return Number.isSafeInteger(Number(d.slot))&&Number(d.slot)>0&&Number(d.slot)<=level};function addSkillEntries(t,skills){for(const [name,lv] of Object.entries(skills))t[name]=(t[name]||0)+lv};${line};total`;
  return vm.runInNewContext(script);
}
const slot={key:'head0',kind:'armor',level:2};
const deco={id:'gem',kind:'armor',slot:2,skills:{攻撃:1}};
test('matching decoration contributes skill',()=>assert.equal(calculate(slot,deco)['攻撃'],1));
test('oversized decoration does not contribute',()=>assert.equal(calculate({...slot,level:1},deco)['攻撃'],undefined));
test('weapon decoration in armor slot does not contribute',()=>assert.equal(calculate(slot,{...deco,kind:'weapon'})['攻撃'],undefined));
test('invalid decoration slot level does not contribute',()=>assert.equal(calculate(slot,{...deco,slot:'oops'})['攻撃'],undefined));
test('empty slot level does not contribute',()=>assert.equal(calculate({...slot,level:0},deco)['攻撃'],undefined));
