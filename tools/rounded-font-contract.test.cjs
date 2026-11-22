const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
const base=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
test('owner B font is local, with licensed regular and bold faces',()=>{
 const css=html.match(/<style id="mhw-font-system">([\s\S]*?)<\/style>/)?.[1];
 assert.ok(css,'font CSS must be declared');
 assert.match(css,/--mhw-ui-font:"M PLUS Rounded 1c"/);
 for(const [weight,name] of [[400,'regular'],[700,'bold']]){
  const url='./assets/fonts/mplus-rounded-ui-'+name+'.woff2';
  const actual=css.split('\n').find(s=>s.includes(url));
  assert.ok(actual?.includes('font-weight:'+weight+';'));
  assert.equal(fs.readFileSync(path.resolve(base,url)).subarray(0,4).toString(),'wOF2');
 }
 assert.match(fs.readFileSync(path.resolve(base,'assets/fonts/OFL-M-PLUS-Rounded-1c.txt'),'utf8'),/SIL OPEN FONT LICENSE/);
 for(const selector of ['body','button','input','select','textarea','pre','code','th','td']){
  const rule=css.match(/([^{}]+)\{font-family:var\(--mhw-ui-font\);\}/)?.[1]||'';
  assert.ok(rule.split(',').map(x=>x.trim()).includes(selector),selector);
 }
 assert.doesNotMatch(html.slice(0,html.indexOf('</head>')),/font-family:(?:-apple-system|Georgia|serif)/);
});
test('embedded OCR uses the shared family and its controls inherit without feature changes',t=>{
 const d=new JSDOM(readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));}});
 t.after(()=>d.window.close());
 const root=d.window.document.querySelector('#ocrEmbeddedHost').shadowRoot;
 assert.match(root.querySelector('style').textContent,/\.ocr-root\{font-family:var\(--mhw-ui-font\)\}/);
 assert.match(root.querySelector('style').textContent,/\.ocr-root :is\(input,select,button,textarea,output,code,pre\)\{font-family:inherit\}/);
});
