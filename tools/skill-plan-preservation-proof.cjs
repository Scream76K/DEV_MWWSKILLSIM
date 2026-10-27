const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));}}).window;
const known={name:'根性【果敢】',bonusName:'ヌシの魂',source:'group',required:3,count:3,rankLevel:1,bonusSkillId:131};
const unknown={name:'黒蝕一体Ⅱ',bonusName:'黒蝕竜の力',source:'series',required:4,count:4,rankLevel:2,bonusSkillId:106};
const st={attackTrue:100,attackComponents:{weaponBase:100,normalMultiplier:1,normalFlat:0},element:0,elementType:null,elementKnown:true,typeKnown:true,affinity:0,maxAffinity:0,activeBonusEffects:[known,unknown]};w.__st=st;
const out={base:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),indexHash:crypto.createHash('sha256').update(fs.readFileSync('index.html')).digest('hex')};
try{out.plan=JSON.parse(w.eval('JSON.stringify(standardPowerConditionPlan(window.__st,{},"great-sword",{gutsState:"BEFORE"}))'));assert.equal(out.plan.normal.attackTrue,105);assert.ok(out.plan.pending.some(x=>x.includes('黒蝕一体Ⅱ')));assert.ok(out.plan.normal.activeBonusEffects.some(x=>x.name==='黒蝕一体Ⅱ'));assert.ok(!out.plan.normal.activeBonusEffects.some(x=>x.name==='根性【果敢】'));assert.deepEqual(st.activeBonusEffects,[known,unknown]);out.pass=true;}catch(e){out.pass=false;out.error=e.stack;}
console.log(JSON.stringify(out,null,2));w.close();process.exitCode=out.pass?0:1;
