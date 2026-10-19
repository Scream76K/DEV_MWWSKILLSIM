
'use strict';
// Load the real page and its local scripts in production order, never a wave stub.
const {JSDOM,VirtualConsole}=require('jsdom');
let dom;
function register(context){
 if(!dom)dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));}});
 dom.window.__fixtureDb=require('./kan108-fixture.cjs').db;dom.window.eval('DB=normalizeDB(window.__fixtureDb);');
 for(const name of ['darkArtsWaveForTechnique','hpEffectPolicy','MHSeriesGroupHpPolicy','MHSeriesGroupIdentity','DarkArtsReference'])context[name]=dom.window[name];
 return context;
}
function close(){if(dom){dom.window.close();dom=null;}}
module.exports={register,close};
