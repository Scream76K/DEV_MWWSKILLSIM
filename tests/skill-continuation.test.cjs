const test=require('node:test'),assert=require('node:assert/strict');
const {continueSkillEffects}=require('../skill-effect-continuation.js');
const channel=value=>({execution:{status:'complete'},metrics:{comboTotalDamage:{status:'available',value}},diagnostics:{}});
const bad=reason=>({execution:{status:'blocked',reason},metrics:{comboTotalDamage:{status:'unavailable',reason}}});
const skill=id=>({skillId:id,name:'skill'+id,level:1});
test('keeps complete original channel and omits only failing source-valid skill',()=>{
 const original={status:'OK',channels:{normal:channel(99),maximum:bad('skill2')}};let calls=0;
 const result=continueSkillEffects({original,candidates:[skill(2),skill(1)],evaluate(active){calls++;return {status:'OK',channels:{normal:channel(20),maximum:active.some(s=>s.skillId===2)?bad('SKILL2_UNSUPPORTED'):channel(10+active.length)}};}});
 assert.strictEqual(result.channels.normal,original.channels.normal);assert.equal(result.channels.maximum.metrics.comboTotalDamage.value,11);
 assert.deepEqual(result.channels.maximum.diagnostics.ignoredSkillEffects.map(x=>x.skillId),[2]);assert.equal(result.channels.maximum.diagnostics.calculationCompleteness,'PARTIAL_SKILL_EFFECTS');assert.ok(calls<=7);
});
test('reconsiders skill dependency in stable source ID order without duplicate addition',()=>{
 const result=continueSkillEffects({original:{channels:{normal:bad('combined')}},candidates:[skill(3),skill(2),skill(1)],evaluate(active){const ids=active.map(x=>x.skillId);return {channels:{normal:ids.includes(3)||ids.includes(1)&&!ids.includes(2)?bad('dependency'):channel(ids.length)}};}});
 assert.equal(result.channels.normal.metrics.comboTotalDamage.value,2);assert.deepEqual(result.channels.normal.diagnostics.ignoredSkillEffects.map(x=>x.skillId),[3]);
});
test('does not synthesize a result when no-skill equipment/technique baseline is invalid',()=>{
 const original={status:'UNAVAILABLE',reason:'MISSING_TECHNIQUE'};const result=continueSkillEffects({original,candidates:[skill(1)],evaluate(){return original;}});assert.strictEqual(result,original);
});
test('recovery clears obsolete top and route reasons without leaking another channel',()=>{
 const original={status:'UNAVAILABLE',reason:'UNSUPPORTED_SKILL',routes:{R:{status:'UNAVAILABLE',reason:'OLD_R'},H:{status:'UNAVAILABLE',reason:'OLD_H'}}};
 const result=continueSkillEffects({original,candidates:[skill(1)],evaluate(active){return active.length?original:{status:'OK',channels:{normal:channel(20),maximum:bad('TECHNIQUE_REQUIRED')},routes:{R:{status:'OK',channels:{normal:channel(8),maximum:bad('TECHNIQUE_REQUIRED')}},H:{status:'OK',channels:{normal:channel(12),maximum:bad('TECHNIQUE_REQUIRED')}}}};}});
 assert.equal(result.status,'OK');assert.equal(result.reason,null);assert.equal(result.channels.normal.metrics.comboTotalDamage.value,20);
 assert.notEqual(result.channels.maximum?.metrics?.comboTotalDamage?.status,'available');
 for(const key of ['R','H']){assert.equal(result.routes[key].status,'OK');assert.equal(result.routes[key].reason,null);assert.equal(result.routes[key].channels.normal.diagnostics.calculationCompleteness,'PARTIAL_SKILL_EFFECTS');}
 assert.equal(original.reason,'UNSUPPORTED_SKILL');assert.equal(original.routes.R.reason,'OLD_R');
});
test('composite recovered maximum preserves original normal channel and route objects',()=>{
 const normal=channel(90),r=channel(40),h=channel(50),original={status:'OK',channels:{normal,maximum:bad('SKILL_UNSUPPORTED')},routes:{R:{status:'OK',channels:{normal:r,maximum:bad('S')}},H:{status:'OK',channels:{normal:h,maximum:bad('S')}}}};
 const result=continueSkillEffects({original,candidates:[skill(1)],evaluate(active){return active.length?original:{status:'OK',channels:{normal:channel(1),maximum:channel(120)},routes:{R:{status:'OK',channels:{normal:channel(1),maximum:channel(55)}},H:{status:'OK',channels:{normal:channel(0),maximum:channel(65)}}}};}});
 assert.strictEqual(result.channels.normal,normal);assert.strictEqual(result.routes.R.channels.normal,r);assert.strictEqual(result.routes.H.channels.normal,h);
 assert.equal(result.routes.R.channels.maximum.metrics.comboTotalDamage.value+result.routes.H.channels.maximum.metrics.comboTotalDamage.value,result.channels.maximum.metrics.comboTotalDamage.value);
});
const glIds=['GL_SLAM','GL_SWEEP','GL_WYRMSTAKE_FULL_BURST','GL_MULTI_WYRMSTAKE_FULL_BURST'];
const component=(id,value,reason)=>({id,eventId:'event:'+id,techniqueId:'GL_WYRMSTAKE_FULL_BURST',revision:'2',source:'fixed-source',coefficientUnit:'motion-value',damageUnit:'damage',status:reason?'unavailable':'available',value:reason?null:value,...(reason?{reason}:{})});
function partialGL(body=100){return {execution:{status:'complete',reason:null,expected:['e'],executed:['e']},issues:[],effectPlan:{effects:[{id:'body-affinity'}],unresolved:[]},finalState:{gunlance:{loadedRounds:0}},components:[component('x:physical:0',body),component('x:shelling:0',null,'GL_TARGET:UNREVIEWED_MODIFIER:蒼雷一閃Ⅰ')],metrics:{comboTotalDamage:{status:'unavailable',reason:'COMPONENT_UNAVAILABLE'}},diagnostics:{}};}
const glAccepted=()=>({...partialGL(),effectPlan:{effects:[],unresolved:[]},components:[component('x:physical:0',80),component('x:shelling:0',40)],metrics:{comboTotalDamage:{status:'available',value:120},comboDps:{status:'available',value:60}}});
test('retains proven GL162 body components and omits only unsupported shell effects',()=>{
 const {retainGLBodyComponents}=require('../skill-effect-continuation.js'),trial=partialGL(),accepted=glAccepted();
 const r=retainGLBodyComponents({trial,accepted,entry:{skillId:162,name:'蒼雷一閃Ⅰ',rankLevel:1},weaponKind:'gunlance',techniqueIds:glIds});
 assert.equal(r.metrics.comboTotalDamage.value,140);assert.strictEqual(r.components[0],trial.components[0]);assert.strictEqual(r.components[1],accepted.components[1]);assert.equal(r.metrics.comboDps.status,'unavailable');assert.equal(r.effectPlan.scope,'RETAINED_BODY_COMPONENTS_ONLY');assert.equal(r.diagnostics.componentSkillContinuation.origins.length,2);
});
test('component retention refuses branch changes, malformed source, unknown failure and identity collision',()=>{
 const {retainGLBodyComponents}=require('../skill-effect-continuation.js');
 for(const change of [x=>x.finalState.gunlance.loadedRounds=1,x=>x.execution.executed=[],x=>x.issues.push({reason:'RESOURCE_INVALID'}),x=>x.effectPlan.unresolved.push({reason:'UNKNOWN'}),x=>x.components[1].reason='SOURCE_MISSING',x=>x.components[1].eventId='different',x=>x.diagnostics.healthBranchComparison={status:'RESOLVED'},x=>x.components[0].value=Infinity]){const trial=partialGL();change(trial);assert.equal(retainGLBodyComponents({trial,accepted:glAccepted(),entry:{skillId:162,name:'蒼雷一閃Ⅰ',rankLevel:1},weaponKind:'gunlance',techniqueIds:glIds}),null);}
});
test('component retention rejects matching missing provenance or state and duplicate identities',()=>{
 const {retainGLBodyComponents}=require('../skill-effect-continuation.js');
 for(const mutate of [(a,b)=>{delete a.finalState;delete b.finalState;},(a,b)=>{delete a.components[0].source;delete b.components[0].source;},(a,b)=>{a.components.push(a.components[0]);b.components.push(b.components[0]);}]){const trial=partialGL(),accepted=glAccepted();mutate(trial,accepted);assert.equal(retainGLBodyComponents({trial,accepted,entry:{skillId:162,name:'蒼雷一閃Ⅰ',rankLevel:1},weaponKind:'gunlance',techniqueIds:glIds}),null);}
});
test('protects adopted body effects before lower-ID incompatible no-op skills',()=>{
 const body={...skill(162),preserveAdoptedBody:true},airborne=skill(86);
 const result=continueSkillEffects({original:{channels:{normal:bad('AIRBORNE_SCOPE'),maximum:bad('AIRBORNE_SCOPE')}},candidates:[airborne,body],evaluate(active){const both=active.length===2;return {status:'OK',channels:{normal:both?bad('AIRBORNE_SCOPE'):channel(active.some(s=>s.skillId===162)?140:100),maximum:both?bad('AIRBORNE_SCOPE'):channel(active.some(s=>s.skillId===162)?160:100)}};}});
 assert.equal(result.channels.maximum.metrics.comboTotalDamage.value,160);assert.deepEqual(result.channels.maximum.diagnostics.ignoredSkillEffects.map(x=>x.skillId),[86]);
});
