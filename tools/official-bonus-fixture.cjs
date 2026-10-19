'use strict';
// Fixture data only: the archived MHDB plus the actual production identity boundary.
const {db}=require('./kan108-fixture.cjs');
const identity=require('../series-group-identity.js');
const copy=x=>JSON.parse(JSON.stringify(x));
function parent(id){const p=db.skills.find(p=>p.id===id);if(!p)throw Error('OFFICIAL_FIXTURE_PARENT:'+id);return copy(p);}
function effect(id,level=1,count){const p=parent(id),r=p.ranks.find(r=>r.level===level);if(!r)throw Error('OFFICIAL_FIXTURE_RANK:'+id+':'+level);const raw={name:r.name,bonusName:p.name,bonusSkillId:p.id,rankId:r.id,rankLevel:r.level,source:p.kind==='group'?'group':'series',required:r.setPiecesRequired,count:count??r.setPiecesRequired};const resolved=identity.resolveEffect(raw);if(resolved.status!=='IDENTIFIED')throw Error(resolved.reasons.join(','));return {...raw,identity:resolved.identity};}
function installDOM(w){w.__fixtureEffects=Object.fromEntries(db.skills.filter(p=>['set','group'].includes(p.kind)).flatMap(p=>p.ranks.map(r=>[p.id+':'+r.level,effect(p.id,r.level)])));w.__fixtureSkills=copy(db.skills);w.eval('DB.skills=window.__fixtureSkills;');}
async function installBrowser(page){await page.evaluate(skills=>{window.__fixtureSkills=skills;DB.skills=skills;},copy(db.skills));}
async function installTargetBrowser(page){await page.evaluate(monsters=>{DB.monsters=monsters;renderMonsters();document.getElementById('monster').value='13';renderMonsterParts();document.getElementById('monsterPart').value='2700';calcBuild();},copy(db.monsters));}
module.exports={parent,effect,installDOM,installBrowser,installTargetBrowser};
