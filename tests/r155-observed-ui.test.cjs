const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=path.join(__dirname,'..');const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
for(const id of ['glObservedPanel','glObservedRun','glObservedOutput','glAId','glBId','glAShell','glBShell','glAPhysical','glBPhysical','glATime','glBTime'])test('UI element '+id,()=>assert.match(html,new RegExp('id="'+id+'"')));
test('UI module loaded after comparison module',()=>assert.ok(html.indexOf('src="./gunlance-observed-comparison.js"')<html.indexOf('src="./gunlance-observed-ui.js"')));
test('unknown physical remains incomplete',()=>{const combo=require('../gunlance-combo-observed.js');const r=combo.composeObservedCombo({evidenceId:'test',events:[{component:'shelling',damage:68},{component:'physical',damage:null}]});assert.equal(r.dps,null);assert.equal(r.totalDamage,null);assert.equal(r.knownDamage,68);});
