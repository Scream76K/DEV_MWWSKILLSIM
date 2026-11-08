'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(process.env.PRODUCT_ROOT||path.join(__dirname,'..'),'hope-hammer-browser-adapter.js'),'utf8');
const start=source.indexOf("  const zeroConversionKinds="),end=source.indexOf('  const waterEntries=',start);assert.ok(start>0&&end>start,'actual production zero-conversion predicate required');
const predicate=source.slice(start,end),clone=x=>structuredClone(x);let assertions=0;
function fixture(element='thunder',kind='long-sword'){
 const resistance={status:'KNOWN_LIMITED',armorBase:0,total:0,reason:null,absorptionPlan:null,missing:[],contributions:[],rows:['head','chest','arms','waist','legs'].map(slot=>({slot,equipped:false,value:0,id:null}))};
 const stats={element:0,elementType:'none',elementKnown:true,typeKnown:true,elementStatus:'CONFIRMED_NONE',elementComponents:{weaponBase:0,normalMultiplier:1,normalFlat:0},activeBonusEffects:[],[element+'ResistanceInput']:resistance};
 const plan={normal:clone(stats),maximum:clone(stats),maximumElementComponents:{weaponBase:0,normalMultiplier:1,normalFlat:0,conditionalFlat:0},applied:[],groupPlan:{applied:[]},selfStatePlan:{normal:[],maximum:[]}};stats.conditionalConditionPlan=plan;
 return {weapon:{kind,specials:[],phial:null},rawSkills:[],buildSkills:[{skillId:element==='water'?181:165,name:element==='water'?'耐性変換【水】':'耐性変換【雷】',level:1}],stats,conditions:{standardEvaluation:true,combatBuffs:{meal:null,charm:null,otherBuffs:null}},root:{MHWElementCapRule:{status:'OWNER_APPROVED_PROVISIONAL',flat:1,multiplier:1},MHWaterConversionRule:{skillId:181,status:'OWNER_APPROVED_PROVISIONAL',coefficients:{'long-sword':4,bow:4}}},bowState:{},dualBladesState:{},longSwordState:{},lanceState:{},conversionComponentsSupported:true,resolvedTechniqueIds:['SYNTHETIC_BODY'],techniques:{SYNTHETIC_BODY:{techniqueId:'SYNTHETIC_BODY',...(kind==='bow'?{referenceKind:'bow'}:{}),hits:[{mv:1,elementModifier:1}]}}};
}
function check(element,mutate,expected,kind){const f=fixture(element,kind);mutate(f);assert.equal(Boolean(vm.runInNewContext(predicate+(element==='water'?'waterZeroNoop':'thunderZeroNoop'),f)),expected);assertions++;}
for(const kind of ['great-sword','long-sword','sword-shield','dual-blades','hammer','lance','bow'])check('thunder',()=>{},true,kind);
for(const kind of ['long-sword','bow'])check('water',()=>{},true,kind);
for(const element of ['thunder','water']){
 for(const mutate of [f=>f.weapon.kind='gunlance',f=>f.weapon.specials=[{}],f=>f.weapon.phial={},f=>f.conditions.standardEvaluation=false,f=>f.conditions.combatBuffs.meal='X',f=>delete f.conditions.combatBuffs,f=>f.conversionComponentsSupported=false,f=>f.buildSkills[0].level=0,f=>f.buildSkills[0].level=2,f=>f.buildSkills[0].level=.5,f=>f.buildSkills[0].name='UNKNOWN',f=>f.buildSkills[0].skillId=999,f=>f.buildSkills.push(f.buildSkills[0]),f=>f.buildSkills.push({skillId:129,name:'破壊王',level:1}),f=>f.rawSkills=[f.buildSkills[0],f.buildSkills[0]],f=>f.rawSkills=[{...f.buildSkills[0],level:2}],f=>f.root.MHWElementCapRule=null,f=>f.root.MHWElementCapRule.status='UNRESOLVED',f=>f.root.MHWElementCapRule.flat=NaN,f=>f.root.MHWElementCapRule.multiplier=NaN])check(element,mutate,false);
 for(const target of ['stats','normal','maximum']){
  const get=f=>target==='stats'?f.stats:f.stats.conditionalConditionPlan[target];
  for(const [key,value] of [['element',1],['element',NaN],['elementType','fire'],['elementKnown',false],['typeKnown',false],['elementStatus','UNKNOWN'],['activeBonusEffects',[{}]],['damageStatsState','X'],['stateStatsByState',{}]])check(element,f=>get(f)[key]=value,false);
  for(const [key,value] of [['weaponBase',1],['normalMultiplier',0],['normalMultiplier',NaN],['normalFlat',1]])check(element,f=>get(f).elementComponents[key]=value,false);
  for(const mutate of [r=>r.total=1,r=>r.total=-1,r=>r.total=.5,r=>r.total=null,r=>r.total=NaN,r=>r.armorBase=1,r=>r.reason='UNKNOWN',r=>r.status='UNRESOLVED',r=>r.absorptionPlan={},r=>r.missing=['head'],r=>r.contributions=[{}],r=>r.rows.pop(),r=>r.rows[1]=clone(r.rows[0]),r=>r.rows[0].equipped=true,r=>r.rows[0].value=1,r=>r.rows[0].id=1])check(element,f=>mutate(get(f)[element+'ResistanceInput']),false);
 }
 for(const state of ['bowState','dualBladesState','longSwordState','lanceState','conditions'])for(const key of ['damageStatsState','stateStatsByState'])check(element,f=>f[state][key]={},false);
 for(const row of ['applied','group','normal','maximum'])check(element,f=>{const p=f.stats.conditionalConditionPlan;(row==='applied'?p.applied:row==='group'?p.groupPlan.applied:p.selfStatePlan[row]).push({});},false);
 for(const [key,value] of [['weaponBase',1],['normalFlat',1],['conditionalFlat',1],['normalMultiplier',0],['normalMultiplier',NaN]])check(element,f=>f.stats.conditionalConditionPlan.maximumElementComponents[key]=value,false);
 for(const [key,value] of [['techniqueId','WRONG'],['damageStatsState','X'],['damageStateTransition',{}],['hpOnlyProvisional','X'],['phialReference',{}],['saAwakened',true],['hhModel',{}],['referenceKind','UNKNOWN'],['specialComponents',['WOUND']],['specialComponents',{}],['hits',[]]])check(element,f=>f.techniques.SYNTHETIC_BODY[key]=value,false);
 for(const [key,value] of [['damageStatsState','X'],['componentSource','GENERATED'],['mv',NaN],['mv',-1],['elementModifier',NaN],['elementModifier',-1]])check(element,f=>f.techniques.SYNTHETIC_BODY.hits[0][key]=value,false);
 check(element,f=>f.rawSkills=[f.buildSkills[0]],true);
}
for(const mutate of [f=>f.weapon.kind='great-sword',f=>f.root.MHWaterConversionRule.skillId=999,f=>f.root.MHWaterConversionRule.status='UNRESOLVED',f=>delete f.root.MHWaterConversionRule.coefficients['long-sword'],f=>f.root.MHWaterConversionRule.coefficients['long-sword']=0,f=>f.root.MHWaterConversionRule.coefficients['long-sword']=3,f=>f.root.MHWaterConversionRule.coefficients['long-sword']=NaN])check('water',mutate,false);
check('thunder',f=>f.buildSkills[0].name='Thunder Resistance Conversion',true);
console.log(JSON.stringify({status:'PASS',assertions,scope:'Actual extracted predicates with synthetic inputs; not full adapter or game accuracy verification'}));
