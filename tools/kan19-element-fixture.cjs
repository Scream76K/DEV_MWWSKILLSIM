'use strict';
// Synthetic MHDB-shaped records: these tests do not verify live MHDB or game values.
function installElementFixture(type='dragon',value=0,missingArtia=false){
 clearWeaponBuckets();
 const rows=missingArtia?[{id:1139,kind:'bow',name:'亡国のクピドバイン',damage:{raw:200,display:240},affinity:-10,specials:[],slots:[3],skills:[]},{id:1140,kind:'bow',name:'亡国のクピドバイン',damage:{raw:180,display:216},affinity:15,specials:[],slots:[3],skills:[]},{id:1141,kind:'bow',name:'亡国のクピドバイン',damage:{raw:190,display:228},affinity:0,specials:[],slots:[3],skills:[]}]:[{id:99001,kind:'great-sword',name:'QA synthetic '+type,damage:{raw:200,display:960},attack:960,affinity:0,specials:[{kind:['poison','paralysis','sleep','blast'].includes(type)?'status':'element',element:type,status:type,damage:{display:value}}],slots:[],skills:[]}];
 DB.weapons=missingArtia?consolidateArtiaFixedVariantRows(rows):rows;const kind=missingArtia?'bow':'great-sword';weaponIndexByKind[kind]=DB.weapons;weaponKind.value=kind;weapon.innerHTML='<option value="'+DB.weapons[0].id+'">QA synthetic</option>';weapon.value=String(DB.weapons[0].id);App.build.setWeapon(DB.weapons[0]);
 DB.skills=[{id:1,name:'龍属性攻撃強化',maxLevel:3}];DB.decorations=[{id:207,name:'破龍・積弾珠【３】',kind:'weapon',slot:3,skills:[{name:'龍属性攻撃強化',level:3}]}];build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0],weaponSlots:[]};build.artia={production:'element',element:type,parts:['attack','attack','attack'],restores:['atk:EX','atk:III','atk:III','aff:EX','atk:EX']};build.decos=missingArtia?{w0:'207'}:{};calcBuild();
 return JSON.parse(JSON.stringify(calcState.stats));
}
module.exports={installElementFixture};
