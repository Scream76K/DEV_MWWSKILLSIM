const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const source=html.slice(html.indexOf('function refreshDecorationSelects(){'),html.indexOf('function armorDecorationCandidates('));
assert.ok(source.startsWith('function refreshDecorationSelects(){'));
function run(slots,initial,attrs){
 const sel={value:initial,dataset:{slot:'head0',decoKind:attrs||'armor'},innerHTML:'',closest:()=>({querySelector:()=>({textContent:'【3】'})})};
 const build={decos:{head0:initial}};
 const ctx={build,document:{querySelectorAll:()=>[sel]},allEquipSlots:()=>slots,normalizeDecorationKind:x=>x,decorationCandidates:(level,kind)=>level>=2&&kind==='armor'?[{id:'gem',name:'攻撃珠'}]:[],decorationRecommendationScore:()=>0,canonicalWeaponKind:()=>'',selectedWeapon:()=>null,esc:x=>x};
 vm.runInNewContext(source+';refreshDecorationSelects()',ctx);
 return {decos:build.decos,selected:sel.value};
}
test('valid armor slot keeps its decoration',()=>assert.equal(run([{key:'head0',kind:'armor',level:2}],'gem').decos.head0,'gem'));
test('removed armor slot cannot be revived by stale DOM label',()=>assert.equal(run([],'gem').decos.head0,undefined));
test('reduced slot level clears oversized decoration',()=>assert.equal(run([{key:'head0',kind:'armor',level:1}],'gem').decos.head0,undefined));
test('live weapon slot overrides stale armor DOM attribute',()=>assert.equal(run([{key:'head0',kind:'weapon',level:3}],'gem','armor').decos.head0,undefined));
test('live armor slot overrides stale weapon DOM attribute',()=>assert.equal(run([{key:'head0',kind:'armor',level:2}],'gem','weapon').decos.head0,'gem'));
