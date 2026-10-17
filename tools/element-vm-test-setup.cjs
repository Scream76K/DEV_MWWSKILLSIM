'use strict';
// Register actual production modules/helpers in tests that extract an inline region.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=require('./legacy-ocr-source.cjs');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const E=require('../element-state.js'),D=require('../element-display.js');
function register(context={}, {bowProducer=false}={}){context.MHWElementState=E;
 if(bowProducer){
  // Match the page's identity-data -> identity -> producer dependency order.
  // These VM fixtures need only the real pure entry points; no DOM event stubs.
  context.MHSeriesGroupIdentityData=require('../series-group-identity-data.js');
  context.MHSeriesGroupIdentity=require('../series-group-identity.js');
  const producer=fs.readFileSync(path.join(__dirname,'../bow-adopted-power.js'),'utf8');
  for(const name of ['bowAdoptedRoute','bowAdoptedMaximumAffinity'])context[name]=vm.runInNewContext('('+source.functionSource(producer,name)+')',context);
 }
 context.MHWElementDisplay=D;
 const dbStart=html.indexOf('const ARTIA_ELEMENT_SOURCE_DB='),dbEnd=html.indexOf('function artiaSourceElement',dbStart);
 context.ARTIA_ELEMENT_SOURCE_DB=vm.runInNewContext(html.slice(dbStart,dbEnd)+'ARTIA_ELEMENT_SOURCE_DB;');
 context.artiaSourceElement=vm.runInNewContext('('+source.functionSource(html,'artiaSourceElement')+')',context);
 for(const name of ['equipmentElementPendingReason','equipmentElementDisplay','equipmentHpElement'])if(!context[name])context[name]=vm.runInNewContext('('+source.functionSource(html,name)+')',context);
 return context;
}
function context(initial={}){return register(initial);}
module.exports={register,context};
