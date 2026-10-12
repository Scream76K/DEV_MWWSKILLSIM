'use strict';
// Register actual production modules/helpers in tests that extract an inline region.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=require('./legacy-ocr-source.cjs');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const E=require('../element-state.js'),D=require('../element-display.js');
function register(context={}){context.MHWElementState=E;context.MHWElementDisplay=D;
 const dbStart=html.indexOf('const ARTIA_ELEMENT_SOURCE_DB='),dbEnd=html.indexOf('function artiaSourceElement',dbStart);
 context.ARTIA_ELEMENT_SOURCE_DB=vm.runInNewContext(html.slice(dbStart,dbEnd)+'ARTIA_ELEMENT_SOURCE_DB;');
 context.artiaSourceElement=vm.runInNewContext('('+source.functionSource(html,'artiaSourceElement')+')',context);
 for(const name of ['equipmentElementPendingReason','equipmentElementDisplay','equipmentHpElement'])if(!context[name])context[name]=vm.runInNewContext('('+source.functionSource(html,name)+')',context);
 return context;
}
function context(initial={}){return register(initial);}
module.exports={register,context};
