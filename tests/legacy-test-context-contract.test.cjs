'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {setTimeout:delay}=require('node:timers/promises');
const {createContext}=require('../tools/legacy-page-test-context.cjs');
const elementSetup=require('../tools/element-vm-test-setup.cjs');

// This tests the loader boundary, not game accuracy. Omitting required local
// scripts must break real page initialization/dependency use, not be hidden by mocks.
test('page loader initializes real local dependencies and keeps browser/network boundaries',async()=>{
 const notABrowser={fixtureOnly:true};
 const context=createContext({window:notABrowser,document:notABrowser,$:null,Date:null,JSON:null});
 assert.notEqual(context.window,notABrowser);
 assert.notEqual(context.document,notABrowser);
 assert.equal(vm.runInContext('$("compareOut")===document.getElementById("compareOut")',context),true);
 assert.equal(vm.runInContext('MHWAttackSkillResolver===calcAttackSkill',context),true);
 assert.equal(context.MHWAttackSkillResolver({'攻撃':1}).flat,3);
 const pending=context.MHWElementState.applySkill(context.MHWElementState.unknown('fire','FIXTURE_UNKNOWN'),{mult:1.2,add:60});
 assert.equal(pending.elementKnown,false);
 assert.equal(pending.element,null);
 assert.equal(context.MHIsOwnerExcludedCalculationSkill({skillId:129,name:'破壊王',level:3}),true);
 assert.equal(typeof context.MHWRealOneHitBrowserAdapter.evaluateCurrent,'function');
 await assert.rejects(context.fetch('https://offline-contract.invalid/'),/OFFLINE_TEST_FIXTURE/);
});

function fixture(tag){return {DB:{skills:[],fixtureTag:tag},build:{artia:{fixtureTag:tag}},calcState:{stats:{fixtureTag:tag}}};}
test('page loader binds supplied lexical DB build and calc state to the same App objects',()=>{
 const input=fixture('supplied'),context=createContext(input);
 for(const name of ['DB','build','calcState'])assert.equal(vm.runInContext(name,context),input[name]);
 assert.equal(vm.runInContext('App.state.db===DB&&App.state.build===build&&App.state.calc===calcState',context),true);
 vm.runInContext('DB.skills.push({name:"fixture"});build.artia.fixtureTag="updated";calcState.stats.fixtureTag="updated";',context);
 assert.equal(input.DB.skills.length,1);
 assert.equal(input.build.artia.fixtureTag,'updated');
 assert.equal(input.calcState.stats.fixtureTag,'updated');
});

test('page loader isolates globals lexical state DOM and storage between contexts',()=>{
 const first=createContext(fixture('first')),second=createContext(fixture('second'));
 vm.runInContext('DB.skills.push({name:"first only"});build.artia.fixtureTag="changed";calcState.stats.fixtureTag="changed";window.fixtureGlobal="first only";document.getElementById("compareOut").textContent="first only";localStorage.setItem("fixture","first only");',first);
 assert.equal(vm.runInContext('DB.skills.length',second),0);
 assert.equal(vm.runInContext('build.artia.fixtureTag',second),'second');
 assert.equal(vm.runInContext('calcState.stats.fixtureTag',second),'second');
 assert.equal(second.fixtureGlobal,undefined);
 assert.notEqual(second.document.getElementById('compareOut').textContent,'first only');
 assert.equal(second.localStorage.getItem('fixture'),null);
});

test('page loader closes every context after its test and cancels queued window work',async t=>{
 const fired=[];
 await t.test('schedule work in two independent page windows',()=>{
  createContext({}).setTimeout(()=>fired.push('first'),0);
  createContext({}).setTimeout(()=>fired.push('second'),0);
 });
 // The helper's afterEach has already closed both windows before this timer turn.
 await delay(20);
 assert.deepEqual(fired,[]);
});

test('element VM setup preserves caller window while real inline resolvers register there',()=>{
 const suppliedWindow={fixtureTag:'caller'},context=elementSetup.context({window:suppliedWindow});
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const start=html.indexOf('function skillLevel('),end=html.indexOf('\nclass MonsterTarget',start);
 assert.ok(start>=0&&end>start);
 vm.createContext(context);
 vm.runInContext(html.slice(start,end),context);
 assert.equal(context.window,suppliedWindow);
 assert.equal(context.window.fixtureTag,'caller');
 assert.equal(context.window.MHWAttackSkillResolver,context.calcAttackSkill);
 assert.equal(context.window.MHWAttackSkillResolver({'攻撃':1}).flat,3);
});
