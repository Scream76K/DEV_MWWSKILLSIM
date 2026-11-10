'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const api=require('./commit-snapshot.cjs');
const names=new Set(['index.html','review-extra-runtime.js']);
// Regression: the snapshot scanner accepted src = while the fixed loader left
// the dependency external and jsdom never executed it. Rejection must precede execution.
test('rejects reviewed script notation the fixed loader cannot execute',()=>{
 assert.equal(typeof api.validateStaticScriptCoverage,'function');
 for(const tag of ['<script data-note=">" src="review-extra-runtime.js"></script>',"<script data-note='>' src='review-extra-runtime.js'></script>",'<script data-note="unclosed src=review-extra-runtime.js>','<script\u00a0src="review-extra-runtime.js"></script>','<script src = "review-extra-runtime.js"></script>','<script src= "review-extra-runtime.js"></script>','<script src="review-extra-runtime.js">fallback</script>','<script src=review-extra-runtime.js></script>','<script type="module" src="review-extra-runtime.js"></script>','<script src="review-extra-runtime.js" defer></script>','<script src="review-extra-runtime.js"/>']){
  assert.throws(()=>api.validateStaticScriptCoverage(tag,names,[]),/DEPENDENCY_REVIEW_REQUIRED: Unsupported static script notation/);
 }
});
test('accepted canonical script is actually consumed by the unchanged loader',()=>{
 assert.equal(typeof api.validateStaticScriptCoverage,'function');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'script-coverage-'));
 try{
  fs.mkdirSync(path.join(dir,'tools'));fs.copyFileSync(path.join(__dirname,'../input/tools/dom-test-setup.cjs'),path.join(dir,'tools/dom-test-setup.cjs'));
  fs.writeFileSync(path.join(dir,'review-extra-runtime.js'),'throw new Error("CANONICAL_SCRIPT_WAS_INLINED");');
  for(const tag of ['<script src="review-extra-runtime.js"></script>',"<script src='review-extra-runtime.js'>\n</script>",'<SCRIPT\nsrc="review-extra-runtime.js"></SCRIPT>']){
   api.validateStaticScriptCoverage(tag,names,[]);fs.writeFileSync(path.join(dir,'index.html'),tag);const loaded=require(path.join(dir,'tools/dom-test-setup.cjs')).readSimulatorHtml();
   assert.ok(loaded.includes('CANONICAL_SCRIPT_WAS_INLINED'));assert.ok(!/\bsrc=/.test(loaded));
  }
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('canonical unknown sources still fail and only explicit exclusions stay external',()=>{
 assert.equal(typeof api.validateStaticScriptCoverage,'function');
 assert.throws(()=>api.validateStaticScriptCoverage('<script src="missing.js"></script>',names,[]),/Script not covered/);
 assert.throws(()=>api.validateStaticScriptCoverage('<script src="https://example.invalid/remote.js"></script>',new Set(['https:/example.invalid/remote.js']),[]),/Script not covered/);
 api.validateStaticScriptCoverage('<script src="https://example.invalid/excluded.js"></script>',names,[{src:'https://example.invalid/excluded.js'}]);
});
