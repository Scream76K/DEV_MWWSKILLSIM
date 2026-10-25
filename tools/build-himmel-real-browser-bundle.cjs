'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const files=[
 ['v10-six-layer-foundation/core.cjs','/core.cjs'],
 ['v10-six-layer-foundation/min8/min2-contract.cjs','/min2-contract.cjs'],
 ['v10-six-layer-foundation/min8/engine.cjs','/engine.cjs'],
 ['v10-six-layer-foundation/min8/pipeline.cjs','/pipeline.cjs'],
 ['v10-six-layer-foundation/min8/immutable-provider.cjs','/immutable-provider.cjs'],
 ['v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs','/real-technique-one-hit-adapter.cjs'],
 ['v10-six-layer-foundation/min8/sourced-physical-formula.cjs','/sourced-physical-formula.cjs'],
 ['v10-six-layer-foundation/min8/real-one-hit-pipeline.cjs','/real-one-hit-pipeline.cjs']
];
const modules=files.map(([file,id])=>{
 const source=fs.readFileSync(path.join(root,file),'utf8');
 const aliases=[id];
 if(id==='/core.cjs')aliases.push('../core.cjs');
 else aliases.push('./'+path.basename(id));
 return aliases.map(alias=>`define(${JSON.stringify(alias)},function(module,exports,require){\n${source}\n});`).join('\n');
}).join('\n');
const output=`(function(root){'use strict';\nconst modules=Object.create(null),cache=Object.create(null);\nfunction define(id,factory){modules[id]=factory;}\nfunction requireModule(id){if(cache[id])return cache[id].exports;if(!modules[id])throw Error('HIMMEL_BUNDLE_MODULE_NOT_FOUND:'+id);const module={exports:{}};cache[id]=module;modules[id](module,module.exports,requireModule);return module.exports;}\n${modules}\nroot.HimmelRealOneHitPipeline=requireModule('/real-one-hit-pipeline.cjs').createRealOneHitPipeline;\n})(typeof window!=='undefined'?window:globalThis);\n`;
fs.writeFileSync(path.join(root,'himmel-real-browser-bundle.js'),output);
