const cp=require('node:child_process'),path=require('node:path');
const archive=path.resolve(__dirname,'../docs/reports/beta-mhdb-crosscheck/evidence/public-mhdb-20261013.tar.gz');
const db=Object.fromEntries(['weapons','armor','charms','decorations','skills','sets','monsters'].map(k=>[k,JSON.parse(cp.execFileSync('tar',['-xOzf',archive,k+'.json'],{encoding:'utf8',maxBuffer:30e6}))]));
function seed(data){
 DB=normalizeDB(data);weaponIndexByKind=rebuildWeaponIndex(DB.weapons,false);App.data.set(DB,emptyDataState());renderMonsters();
 const w=DB.weapons.find(x=>x.id===236);weaponKind.value='great-sword';weapon.innerHTML='<option value="236">'+w.name+'</option>';weapon.value='236';App.build.setWeapon(w);
 build.armor={legs:DB.armor.find(x=>x.id===370)};build.charmCustom={skills:[],slots:[],weaponSlots:[]};build.decos={};calcBuild();applyBuildSnapshot(buildSnapshot());renderComboForWeapon();addCombo('gs_charge3');
 monster.value='training-room';renderMonsterParts();dSharp.value='1.05';dESharp.value='1';dEHZ.value='30';dCB.value='';dECrit.value='0';calcBuild();
}
module.exports={db,seed};
