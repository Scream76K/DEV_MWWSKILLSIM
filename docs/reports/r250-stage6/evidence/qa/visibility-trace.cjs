const fs=require('fs'),path=require('path'),Module=require('module');
const root=path.resolve(__dirname,'../../../../..');
const filename=path.join(root,'tools/power-change-display-browser.test.cjs');
const originalRead=fs.readFileSync;
if(process.env.QA_BASELINE==='1')fs.readFileSync=function(p,...args){if(path.resolve(String(p))===path.join(root,'index.html'))return originalRead.call(fs,path.join(__dirname,'baseline-index.html'),...args);return originalRead.call(fs,p,...args)};
let source=originalRead(filename,'utf8');
source=source.replace("await p.goto('https://simulator.test/');","p.on('console',m=>console.log('PAGE_TRACE '+m.text()));await p.goto('https://simulator.test/');");
source=source.replace("es=>es.map(e=>e.getBoundingClientRect().width)",`es=>{const widths=es.map(e=>e.getBoundingClientRect().width),ancestors=[];let e=es[0];while(e){const c=getComputedStyle(e),r=e.getBoundingClientRect();ancestors.push({tag:e.tagName,id:e.id,connected:e.isConnected,open:e.open,hidden:e.hidden,display:c.display,visibility:c.visibility,width:r.width,height:r.height});e=e.parentElement}console.log(JSON.stringify({kind:'measurement',liveWidths:[...document.querySelectorAll('#compareOut thead th')].map(x=>x.getBoundingClientRect().width),innerWidth,readyState:document.readyState,widths,ancestors}));return widths}`);
const mod=new Module(filename,module);mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));mod._compile(source,filename);
