'use strict';
// Register actual production modules/helpers in tests that extract an inline region.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=require('./legacy-ocr-source.cjs');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const E=require('../element-state.js'),D=require('../element-display.js');
function register(context={}){
 // Inline resolvers register their actual production APIs on the browser namespace.
 // Keep a caller-supplied window; do not synthesize calculation results.
 if(!context.window)context.window={};
 context.MHWElementState=E;context.MHWElementDisplay=D;
 const db=html.match(/^const ARTIA_ELEMENT_SOURCE_DB=(.+);$/m);
 if(!db)throw Error('ARTIA_ELEMENT_SOURCE_DB declaration not found');
 context.ARTIA_ELEMENT_SOURCE_DB=JSON.parse(db[1]);
 context.artiaSourceElement=vm.runInNewContext('('+source.functionSource(html,'artiaSourceElement')+')',context);
 for(const name of ['equipmentElementPendingReason','equipmentElementDisplay','equipmentHpElement'])if(!context[name])context[name]=vm.runInNewContext('('+source.functionSource(html,name)+')',context);
 return context;
}
function context(initial={}){return register(initial);}
module.exports={register,context};
