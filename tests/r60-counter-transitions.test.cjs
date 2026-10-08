const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8'),c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
function render(){const els=Object.fromEntries(['techAuditKind','techAuditId','techAuditOut','techAuditSummary'].map(id=>[id,{value:'',innerHTML:'',addEventListener(event,fn){this[event]=fn;}}]));c.document={getElementById:id=>els[id]||null};vm.runInContext(s.match(/<script id="technique-audit-ui">([\s\S]*?)<\/script>/)[1],c);els.techAuditKind.value='insect-glaive';els.techAuditKind.change();els.techAuditId.value='IG_SPIRAL_CHARGE_2';els.techAuditId.change();return els.techAuditOut.innerHTML;}
test('audit UI exposes rounded counter transitions without component attribution',()=>{
 const html=render();assert.ok(html.includes('合計カウンターの推移'));assert.ok(html.includes('449 → 611'));assert.ok(html.includes('611 → 627'));assert.ok(html.includes('本体・猟虫の割り当ては未確定'));
 assert.equal(c.window.TechniqueDBEngine.audit('insect-glaive','IG_SPIRAL_CHARGE_2').calculable,false);
});
