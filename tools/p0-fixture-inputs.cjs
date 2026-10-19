'use strict';
const {db}=require('./kan108-fixture.cjs');
// Explicit fixture input, not a replacement damage/stat resolver. The real
// target selector and snapshot capture consume the same selected part.
const targetScript=`DB.skills=window.__p0FixtureSkills;DB.monsters=[{id:'p0-target',name:'Explicit fixture target',kind:'large',parts:[{id:'p0-part',name:'Explicit fixture part',multipliers:{slash:.45,blunt:.45,pierce:.45,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='p0-target';renderMonsterParts();monsterPart.value='p0-part';powerBowStartShot.value='3';powerBowRange.value='CRITICAL';calcBuild();`;
function install(w){w.__p0FixtureSkills=JSON.parse(JSON.stringify(db.skills));w.eval(targetScript);}
async function installBrowser(p){await p.evaluate(skills=>{window.__p0FixtureSkills=skills;},db.skills);await p.evaluate(targetScript);}
module.exports={install,installBrowser};
