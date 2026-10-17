'use strict';
// Register actual production modules/helpers in tests that extract an inline region.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=require('./legacy-ocr-source.cjs');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const E=require('../element-state.js'),D=require('../element-display.js');
let policySkills;
function hpPolicySkills(){
 if(!policySkills){
  const archive=path.join(__dirname,'../docs/reports/beta-mhdb-crosscheck/evidence/public-mhdb-20261013.tar.gz');
  policySkills=JSON.parse(require('node:child_process').execFileSync('tar',['-xOzf',archive,'skills.json'],{encoding:'utf8',maxBuffer:30e6}));
 }
 return policySkills;
}
function register(context={}, {bowProducer=false}={}){context.MHWElementState=E;
 if(bowProducer){
  // Match the page's identity-data -> identity -> producer dependency order.
  // These VM fixtures need only the real pure entry points; no DOM event stubs.
  context.MHSeriesGroupIdentityData=require('../series-group-identity-data.js');
  context.MHSeriesGroupIdentity=require('../series-group-identity.js');
  const producer=fs.readFileSync(path.join(__dirname,'../bow-adopted-power.js'),'utf8');
  for(const name of ['bowAdoptedRoute','bowAdoptedMaximumAffinity'])context[name]=vm.runInNewContext('('+source.functionSource(producer,name)+')',context);
 }
 // Load the real HP-policy implementation in a private lexical scope: several
 // callers subsequently extract the whole engine (including the same consts).
 // Do not replace an intentional caller DB or add a success-returning policy stub.
 const policyDb=context.DB?.skills?context.DB:{...(context.DB||{}),skills:hpPolicySkills()};
 const hpStart=html.indexOf('const RECOVERY_BONUS_HP_POLICIES='),hpEnd=html.indexOf('const STANDARD_FORTIFY_SOURCE=',hpStart);
 if(hpStart<0||hpEnd<=hpStart)throw Error('HP policy source boundary missing');
 const policyContext={DB:policyDb,MHSeriesGroupIdentity:require('../series-group-identity.js')};
 const hp=vm.runInNewContext('(()=>{'+source.functionSource(html,'techniqueDbDeepFreeze')+'\n'+html.slice(hpStart,hpEnd)+';return {hpEffectPolicy,hpEffectPolicyText};})()',policyContext);
 Object.assign(context,hp);
 context.MHWElementDisplay=D;
 const dbStart=html.indexOf('const ARTIA_ELEMENT_SOURCE_DB='),dbEnd=html.indexOf('function artiaSourceElement',dbStart);
 context.ARTIA_ELEMENT_SOURCE_DB=vm.runInNewContext(html.slice(dbStart,dbEnd)+'ARTIA_ELEMENT_SOURCE_DB;');
 context.artiaSourceElement=vm.runInNewContext('('+source.functionSource(html,'artiaSourceElement')+')',context);
 for(const name of ['equipmentElementPendingReason','equipmentElementDisplay','equipmentHpElement'])if(!context[name])context[name]=vm.runInNewContext('('+source.functionSource(html,name)+')',context);
 return context;
}
function context(initial={}){return register(initial);}
module.exports={register,context};
