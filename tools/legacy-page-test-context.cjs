'use strict';
// These legacy tests exercise stats and saved comparison fixtures, not live-game
// correctness or successful public consumer evaluation. Load the actual page and
// its local scripts so calcBuild's production dependency graph stays intact.
const vm=require('node:vm');
const {afterEach}=require('node:test');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
const open=[];
afterEach(()=>{for(const dom of open.splice(0))dom.window.close();});
function createContext(fixture){
 const errors=[];
 const virtualConsole=new VirtualConsole();
 virtualConsole.on('jsdomError',error=>errors.push(error));
 const dom=new JSDOM(readSimulatorHtml(),{url:'https://legacy-build.test/',runScripts:'dangerously',virtualConsole,beforeParse(window){window.fetch=()=>Promise.reject(Error('OFFLINE_TEST_FIXTURE'));}});
 open.push(dom);
 if(errors.length)throw new AggregateError(errors,'Production page initialization failed');
 const context=dom.getInternalVMContext();
 for(const [name,value] of Object.entries(fixture)){
  // Keep real DOM/browser objects. Lexical app state is installed explicitly below.
  if(!['DB','build','calcState','document','window','Date','JSON','$'].includes(name))context[name]=value;
 }
 context.__legacyBuildFixture=fixture;
 for(const name of ['DB','build','calcState','lastBuildComparisonRows','lastBuildComparisonContext','lastBuildComparisonBaselineIndex']){
  if(Object.hasOwn(fixture,name))vm.runInContext(name+'=__legacyBuildFixture.'+name+';',context);
 }
 vm.runInContext('App.state.db=DB;App.state.build=build;App.state.calc=calcState;',context);
 context.document.getElementById('useWeaponCoeff').checked=false;
 delete context.__legacyBuildFixture;
 return context;
}
module.exports={createContext};
