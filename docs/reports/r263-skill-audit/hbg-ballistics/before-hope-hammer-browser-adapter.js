(function(root){'use strict';
 const ADOPTED_NO_WOUND_EVENT_IDS=new Set(["GS_CHARGED_SLASH_3", "GS_STRONG_CHARGED_SLASH_3", "GS_STRONG_WIDE_SLASH_3", "LS_RED_BLADE_I", "LS_RED_BLADE_II", "LS_RED_BLADE_III", "SNS_SIDE_SLASH", "SNS_BASH_UPPERCUT", "DB_DEMON_DANCE_I", "DB_DEMON_DANCE_II", "DB_DEMON_DANCE_III", "HAM_SIDE_SWING", "HAM_VERTICAL_II", "HAM_UPPERCUT", "LAN_MID_THRUST_I", "LAN_MID_THRUST_II", "LAN_MID_THRUST_III", "LAN_TRIPLE_THRUST", "GL_SLAM", "GL_SWEEP", "SA_SWORD_VERTICAL", "SA_SWORD_MORPH_DOUBLE", "SA_AXE_MORPH_SLASH", "IG_DIAGONAL_SLASH", "IG_ENHANCED_DIAGONAL_SLASH", "CB_SWORD_TO_AXE_MORPH", "CB_ELEMENT_DISCHARGE_1", "CB_ELEMENT_DISCHARGE_2", "CB_AED", "CB_FOLLOWUP_AED", "CB_SAED", "CB_SAED_AED_DERIVED", "BOW_SHOT_3", "BOW_POWER_SHOT_3", "BOW_POWER_VOLLEY_3", "HBG_NORMAL_AMMO_1", "HBG_NORMAL_AMMO_2", "HBG_NORMAL_AMMO_3", "LBG_NORMAL_AMMO_1", "LBG_NORMAL_AMMO_2", "HBG_ELEMENT_FIRST_HIT_REFERENCE", "LBG_ELEMENT_FIRST_HIT_REFERENCE", "HBG_WYVERN_AMMO", "HH_LEFT_SWING", "HH_RIGHT_SWING", "HH_FORWARD_ATTACK", "HH_SELF_IMPROVEMENT_PERFORMANCE", "HH_PERFORMANCE_BODY", "HH_PERFORMANCE_BEAT_1", "HH_PERFORMANCE_BEAT_1_JUST", "HH_PERFORMANCE_BEAT_2", "HH_PERFORMANCE_BEAT_2_JUST", "HH_ENCORE_NORMAL", "HH_ENCORE_JUST", "HH_PERFORMANCE_SHOCKWAVE", "HH_ECHO_BUBBLE_FOLLOWUP", "HH_ECHO_BUBBLE_MELODY_EVENT", "HH_MELODY_COMPLETION_FIXED_10", "reference:gl_NORMAL", "reference:gl_CHARGED"]);
 const INTERNAL_SKILL_ADOPTION=Object.freeze({
"破壊王":{"requiredSkillId":129,"maxLevel":3,"effectDisposition":"non_damage","reason":"adopted no-wound-destruction components: body HP unchanged; part durability effect separate, not calculated","evidenceRef":"https://kuroyonhon.com/mhwilds/program/skill.php","scope":"EXPLICIT_ADOPTED_NO_WOUND_EVENT_ONLY"},
"麻痺属性強化":{"requiredSkillId": 9, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "status accumulation only, not direct HP damage; status event damage/frequency is outside this explicit-hit indicator", "evidenceRef": "MHDB_JA_SKILLS_20261026:9", "scope": "DIRECT_HP_ONLY_STATUS_ACCUMULATION_EXCLUDED"},
"毒属性強化":{"requiredSkillId": 12, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "status accumulation only, not direct HP damage; status event damage/frequency is outside this explicit-hit indicator", "evidenceRef": "MHDB_JA_SKILLS_20261026:12", "scope": "DIRECT_HP_ONLY_STATUS_ACCUMULATION_EXCLUDED"},
"爆破属性強化":{"requiredSkillId": 40, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "status accumulation only, not direct HP damage; status event damage/frequency is outside this explicit-hit indicator", "evidenceRef": "MHDB_JA_SKILLS_20261026:40", "scope": "DIRECT_HP_ONLY_STATUS_ACCUMULATION_EXCLUDED"},
"会心撃【特殊】":{"requiredSkillId": 68, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "status accumulation only, not direct HP damage; status event damage/frequency is outside this explicit-hit indicator", "evidenceRef": "MHDB_JA_SKILLS_20261026:68", "scope": "DIRECT_HP_ONLY_STATUS_ACCUMULATION_EXCLUDED"},
"睡眠属性強化":{"requiredSkillId": 78, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "status accumulation only, not direct HP damage; status event damage/frequency is outside this explicit-hit indicator", "evidenceRef": "MHDB_JA_SKILLS_20261026:78", "scope": "DIRECT_HP_ONLY_STATUS_ACCUMULATION_EXCLUDED"},
"龍耐性":{"requiredSkillId": 1, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:1"},
"体術":{"requiredSkillId": 14, "maxLevel": 5, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:14"},
"アイテム使用強化":{"requiredSkillId": 15, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:15"},
"ガード強化":{"requiredSkillId": 16, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:16"},
"笛吹き名人":{"requiredSkillId": 29, "maxLevel": 2, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:29"},
"ランナー":{"requiredSkillId": 43, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:43"},
"属性やられ耐性":{"requiredSkillId": 49, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:49"},
"キノコ大好き":{"requiredSkillId": 52, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:52"},
"耳栓":{"requiredSkillId": 80, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:80"},
"氷耐性":{"requiredSkillId": 101, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:101"},
"回避距離ＵＰ":{"requiredSkillId": 102, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:102"},
"業物":{"requiredSkillId": 117, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:117"},
"精霊の加護":{"requiredSkillId": 122, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:122"},
"達人芸":{"requiredSkillId": 124, "maxLevel": 1, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:124"},
"火耐性":{"requiredSkillId": 125, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:125"},
"剛刃研磨":{"requiredSkillId": 134, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:134"},
"スタミナ奪取":{"requiredSkillId": 141, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:141"},
"オトモへの采配":{"requiredSkillId": 145, "maxLevel": 5, "effectDisposition": "non_damage", "reason": "explicit current weapon state: stamina, defense, duration, gathering or companion only; no hunter HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:145"},

"ＫＯ術":{"requiredSkillId": 36, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "stun accumulation only; no HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:36"},
"KO術":{"requiredSkillId": 36, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "stun accumulation only; no HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:36"},
"Slugger":{"requiredSkillId": 36, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "stun accumulation only; no HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:36"},
"にゃんにゃんぼう":{"requiredSkillId": 179, "maxLevel": 1, "effectDisposition": "non_damage", "reason": "item acquisition on critical hit; no HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:179"},
"シールドオプション":{"requiredSkillId": 169, "maxLevel": 1, "effectDisposition": "non_damage", "reason": "defense buff only; no outgoing HP coefficient", "evidenceRef": "MHDB_JA_SKILLS_20261026:169"},
  "飛び込み":{"requiredSkillId": 28, "maxLevel": 1, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:28"},
  "体力回復量ＵＰ":{"requiredSkillId": 30, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:30"},
  "回復速度":{"requiredSkillId": 31, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:31"},
  "納刀術":{"requiredSkillId": 32, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:32"},
  "風圧耐性":{"requiredSkillId": 35, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:35"},
  "クライマー":{"requiredSkillId": 42, "maxLevel": 1, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:42"},
  "緩衝":{"requiredSkillId": 45, "maxLevel": 1, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:45"},
  "耐震":{"requiredSkillId": 46, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:46"},
  "環境利用の知識":{"requiredSkillId": 48, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:48"},
  "悪臭耐性":{"requiredSkillId": 55, "maxLevel": 2, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:55"},
  "スタミナ急速回復":{"requiredSkillId": 58, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:58"},
  "ガード性能":{"requiredSkillId": 59, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:59"},
  "閃光強化":{"requiredSkillId": 61, "maxLevel": 1, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:61"},
  "水場・油泥適応":{"requiredSkillId": 63, "maxLevel": 2, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:63"},
  "睡眠耐性":{"requiredSkillId": 64, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:64"},
  "ジャンプ鉄人":{"requiredSkillId": 76, "maxLevel": 1, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:76"},
  "回避性能":{"requiredSkillId": 77, "maxLevel": 5, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:77"},
  "環境適応":{"requiredSkillId": 88, "maxLevel": 2, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:88"},
  "整備":{"requiredSkillId": 90, "maxLevel": 5, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:90"},
  "麻痺耐性":{"requiredSkillId": 92, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:92"},
  "地質学":{"requiredSkillId": 98, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:98"},
  "早食い":{"requiredSkillId": 100, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:100"},
  "気絶耐性":{"requiredSkillId": 105, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:105"},
  "ひるみ軽減":{"requiredSkillId": 108, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:108"},
  "爆破やられ耐性":{"requiredSkillId": 110, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:110"},
  "満足感":{"requiredSkillId": 111, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:111"},
  "植生学":{"requiredSkillId": 112, "maxLevel": 4, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:112"},
  "広域化":{"requiredSkillId": 113, "maxLevel": 5, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:113"},
  "昆虫標本の達人":{"requiredSkillId": 114, "maxLevel": 1, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:114"},
  "砥石使用高速化":{"requiredSkillId": 126, "maxLevel": 2, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:126"},
  "毒耐性":{"requiredSkillId": 128, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:128"},
  "威嚇":{"requiredSkillId": 130, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:130"},
  "防御力ＤＯＷＮ耐性":{"requiredSkillId": 135, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:135"},
  "ハンター生活":{"requiredSkillId": 143, "maxLevel": 1, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:143"},
  "裂傷耐性":{"requiredSkillId": 146, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:146"},
  "拘束耐性":{"requiredSkillId": 147, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:147"},
  "腹減り耐性":{"requiredSkillId": 151, "maxLevel": 3, "effectDisposition": "non_damage", "reason": "MHDB rank: no direct outgoing HP coefficient; explicit combat conditions and duration are separate", "evidenceRef": "MHDB_JA_SKILLS_20261026:151"},
  '耳栓':{requiredSkillId:80,maxLevel:3,effectDisposition:'non_damage',reason:'MHDB: roar resistance only; no outgoing HP damage modifier',evidenceRef:'MHDB_JA_SKILLS_20261025:80'},
  '精霊の加護':{requiredSkillId:122,maxLevel:3,effectDisposition:'non_damage',reason:'MHDB: reduces incoming damage only',evidenceRef:'MHDB_JA_SKILLS_20261025:122'},
  '防御':{effectDisposition:'non_damage',reason:'防御は表示用防御値だけを変更しHPダメージへ寄与しない',evidenceRef:'RELEASE_r213.md:4'},
  'Defense':{effectDisposition:'non_damage',reason:'Defense is applied to defense stats, not HP damage',evidenceRef:'RELEASE_r213.md:4'},
  'Runner':{requiredSkillId:43,maxLevel:3,effectDisposition:'non_damage',reason:'Runner changes stamina consumption, not HP damage',evidenceRef:'RELEASE_r213.md:4'},
  'Constitution':{requiredSkillId:14,maxLevel:5,effectDisposition:'non_damage',reason:'Constitution changes stamina consumption, not HP damage',evidenceRef:'RELEASE_r213.md:4'}
 });
 function annotationPolicy(entry){const p=root.MHSkillExtraDamagePolicies?.[entry.skillId];return p&&entry.name===p.name&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=p.maxLevel?p:null;}
 function confirmedNonDamage(entry){const rule=INTERNAL_SKILL_ADOPTION[entry.name];return !!rule&&rule.effectDisposition==='non_damage'&&rule.requiredSkillId!==undefined&&Number(entry.skillId)===rule.requiredSkillId&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=rule.maxLevel;}
 const CONDITIONAL_AFFINITY_SKILLS=Object.freeze({
  '弱点特効':{id:57,max:5},'Weakness Exploit':{id:57,max:5},
  '渾身':{id:99,max:3},'Maximum Might':{id:99,max:3},
  '力の解放':{id:142,max:5},'Latent Power':{id:142,max:5}
 });
 function fail(reason){return {status:'UNAVAILABLE',reason};}
 const STANDARD_NORMAL_HIT_CONTRACT=Object.freeze({GS_CHARGED_SLASH_3:{damageType:'slash',source:'MACARONGAMEMO_GREAT_SWORD_VER1040'},GS_STRONG_CHARGED_SLASH_3:{damageType:'slash',damageTypeStatus:'OWNER_APPROVED_PROVISIONAL',damageTypeApprovedAt:'2026-10-25',damageTypeReason:'技名と既存大剣通常技契約に基づく暫定分類。原典のdamageType明記は未確認。',source:'MACARONGAMEMO_GREAT_SWORD_VER1040'},GS_STRONG_WIDE_SLASH_3:{damageType:'slash',damageTypeStatus:'OWNER_APPROVED_PROVISIONAL',damageTypeApprovedAt:'2026-10-25',damageTypeReason:'技名と既存大剣通常技契約に基づく暫定分類。原典のdamageType明記は未確認。',source:'MACARONGAMEMO_GREAT_SWORD_VER1021_CURRENT'},LS_RED_BLADE_I:{damageType:'slash',partModifier:1,stateRequirement:{spiritGauge:'RED'},source:'MACARONGAMEMO_LONG_SWORD_MOTION_CURRENT'},SNS_SIDE_SLASH:{damageType:'slash',partModifier:1,source:'GAME8_2025_06_30_SNS_NERF'},DB_DEMON_DANCE_I:{damageType:'slash',partModifier:1,stateRequirement:{demonMode:true},source:'KUROYONHON_DB_R50_CHECK'},SA_SWORD_VERTICAL:{damageType:'slash',partModifier:1,stateRequirement:{mode:'SWORD'},source:'MACARONGAMEMO_SWITCH_AXE_CURRENT'},SA_SWORD_MORPH_DOUBLE:{damageType:'slash',stateRequirement:{mode:'SWORD'},source:'MACARONGAMEMO_SWITCH_AXE_CURRENT;KUROYONHON_MEMO11_26'},SA_AXE_MORPH_SLASH:{damageType:'slash',stateRequirement:{mode:'AXE'},source:'MACARONGAMEMO_SWITCH_AXE_CURRENT;KUROYONHON_MEMO11_26'},IG_DIAGONAL_SLASH:{damageType:'slash',partModifier:1,source:'MACARONGAMEMO_INSECT_GLAIVE_CURRENT'},IG_ENHANCED_DIAGONAL_SLASH:{damageType:'slash',stateRequirement:{tripleExtract:true},damageTypeStatus:'OWNER_APPROVED_PROVISIONAL',damageTypeApprovedAt:'2026-10-25',damageTypeReason:'資料一致の強化けさ斬り本体2Hitを三色前提で暫定採用。原典の切断表記を保持し、猟虫成分は含めない。',source:'MACARONGAMEMO_IG_R49_SOURCE;KUROYONHON_IG_R49_CHECK'},HH_LEFT_SWING:{damageType:'blunt',partModifier:1,source:'MACARONGAMEMO_HH_MOTION'}});
 function normalizeTechniqueIds(ids,{fallback=null}={}){
  const input=Array.isArray(ids)?ids:(fallback?[fallback]:[]),unresolved=[];
  const normalized=input.map(raw=>{
   if(raw===null||raw===undefined||String(raw).trim()==='')return null;
   const value=String(raw),id=value==='hm_side'?'HAM_SIDE_SWING':value.startsWith('canonical:')?value.slice('canonical:'.length):value;
   if(!id)unresolved.push(value);
   return id||null;
  }).filter(Boolean);
  return {ids:normalized,unresolved};
 }
 function evaluateCurrentSingleHealth({weapon,stats,target,skills=[],equipmentSkillsResolved=false,conditions={},gunlanceState=null,bowState=null,hbgState=null,lightBowgunState=null,chargeBladeState=null,huntingHornState=null,insectGlaiveState=null,dualBladesState=null,longSwordState=null,switchAxeState=null,techniqueDb,trainingRoom,techniqueId,techniqueIds,retrievedAt='UNKNOWN'}={}){
  if(typeof root.damageFromParams!=='function'||!root.MHWWeaponMaxSharpness||typeof root.HimmelRealOneHitPipeline!=='function')return fail('REAL_SLICE:BROWSER_DEPENDENCIES_UNAVAILABLE');
  if(!weapon||!Number.isInteger(weapon.id)||!Number.isInteger(weapon.gameId)||typeof weapon.kind!=='string')return fail('REAL_SLICE:CURRENT_WEAPON_NOT_SUPPORTED');
  if(!Array.isArray(weapon.specials))return fail('REAL_SLICE:WEAPON_SPECIALS_UNKNOWN');
  const elementSpecials=weapon.specials.filter(x=>x?.kind==='element');
  if(weapon.specials.some(x=>x?.kind!=='element'))return fail('REAL_SLICE:WEAPON_SPECIALS_UNSUPPORTED');
  if(elementSpecials.length>1)return fail('REAL_SLICE:MULTIPLE_ELEMENTS_UNSUPPORTED');
  if(!Array.isArray(weapon.skills))return fail('REAL_SLICE:WEAPON_SKILLS_UNKNOWN');
  // UI count applies to the explicit current target; API per-contact inputs remain supported.
  const resolveContactCount=s=>{
   if(s?.contactPolicy!=='EXPLICIT_CONTACTS'||s.contactTargetPolicy!=='CURRENT_TARGET')return s;
   if(!Number.isInteger(s.contactCount)||s.contactCount<1||s.contactCount>6)throw Error('BOWGUN_ELEMENT:CONTACT_COUNT_REQUIRED_1_TO_6');
   const p=trainingRoom?.parts?.find(p=>p.id===target?.part),element=String(s.elementType||s.ammoType||'').toLowerCase();
   if(target?.monster!=='training-room'||!p||!Number.isFinite(p.multipliers?.pierce)||!Number.isFinite(p.multipliers?.[element]))throw Error('BOWGUN_ELEMENT:CONTACT_TARGET_UNRESOLVED');
   return {...s,contacts:Array.from({length:s.contactCount},(_,i)=>({ordinal:i+1,targetId:target.monster,partId:target.part,range:s.range,physicalHitzone:p.multipliers.pierce*100,elementalHitzone:p.multipliers[element]*100}))};
  };
  try{if(weapon.kind==='heavy-bowgun')hbgState=resolveContactCount(hbgState);if(weapon.kind==='light-bowgun')lightBowgunState=resolveContactCount(lightBowgunState);}catch(e){return fail(e.message);}
  const skillSource=`https://wilds.mhdb.io/en/weapons/${weapon.id}`;
  const classifySkill=(entry,source)=>{
   const name=entry?.skill?.name||entry?.name;
   const level=Number(entry?.level);
   if(!name||!Number.isFinite(level)||level<0)return {id:String(entry?.id||'unknown'),name:name||'UNKNOWN',level:Number.isFinite(level)?level:0,rank:0,source,effectDisposition:'unknown'};
   const inputSkillId=entry?.skill?.id??entry?.id??null,dbSkills=root.__getBetaDB?.()?.skills||[],candidates=inputSkillId!=null?dbSkills.filter(x=>String(x?.id)===String(inputSkillId)):dbSkills.filter(x=>String(x?.name||'')===String(name));
   if(candidates.length>1)return {id:'unknown',name,level,rank:0,source,effectDisposition:'unknown',reason:'REAL_SLICE:SKILL_RECORD_AMBIGUOUS',skillId:null};
   const dbSkill=candidates[0]||null,skillId=dbSkill?.id??inputSkillId??null,skillRecord=entry?.skill||dbSkill||entry,description=entry?.description||entry?.skill?.description||dbSkill?.description||dbSkill?.descriptions?.ja||null,effectCategory=skillRecord?.effectCategory??skillRecord?.category??skillRecord?.effectType??null,damageRelated=skillRecord?.damageRelated;
   const skillKey=Number(skillId)===84?'waterResistance':Number(skillId)===181?'resistanceConversionWater':Number(skillId)===83?'chargeStrike':Number(skillId)===150?'conditionalAttack':[89,153,164,171,173,174].includes(Number(skillId))?'selfState':Number(skillId)===119?'handicraft':[39,103].includes(Number(skillId))?'explicitAffinity':[85,136].includes(Number(skillId))?'contextAttack':skillId===53?'ballistics':skillId===156?'thunderResistance':['高速変形','Rapid Morph'].includes(name)?'rapidMorph':CONDITIONAL_AFFINITY_SKILLS[name]?'conditionalAffinity':(name==='Slugger'||name==='KO術'||name==='ＫＯ術')?'slugger':(name==='Attack Boost'||name==='攻撃')?'attack':(name==='Critical Eye'||name==='見切り')?'affinity':(name==='Critical Boost'||name==='超会心')?'criticalBoost':(['砲術','Artillery','砲弾装填','Load Shells'].includes(name))?'shelling':(['通常弾・通常矢強化','通常弾強化','Normal Shots'].includes(name))?'normalUp':(['散弾・剛射強化','散弾強化','Spread/Power Shots'].includes(name))?'spreadUp':(['チャージマスター','Charge Master'].includes(name))?'chargeMaster':(['会心撃【属性】','Critical Element'].includes(name))?'criticalElement':(['刃鱗増装','Bladescale Loading'].includes(name))?'bladescaleLoading':(['ファーストショット','First Shot'].includes(name))?'firstShot':(['フォースショット','Force Shot','Tetrad Shot'].includes(name))?'forceShot':(['挑戦者','Agitator','フルチャージ','Peak Performance','逆恨み','Resentment','巧撃','Adrenaline Rush','逆襲','Counterstrike','攻勢','Foray','火事場力','Heroics','暗黒','Dark','攻めの守勢','Offensive Guard','急襲','Ambush','連撃','Burst','属性吸収','Element Absorption','災禍転福','Coalescence','不屈','Fortify','抜刀術【技】','抜刀術[技]','Critical Draw','抜刀術【力】','Punishing Draw','研鑽','Everlasting'].includes(name))?'conditionalAttack':(['集中','Focus'].includes(name))?'focus':(['属性変換','Convert Element'].includes(name))?'attributeConversion':(['耐性変換【雷】','Thunder Resistance Conversion'].includes(name))?'resistanceConversionThunder':({'火属性攻撃強化':'fire','Fire Attack':'fire','水属性攻撃強化':'water','Water Attack':'water','雷属性攻撃強化':'thunder','Thunder Attack':'thunder','氷属性攻撃強化':'ice','Ice Attack':'ice','龍属性攻撃強化':'dragon','Dragon Attack':'dragon'}[name]||'unknown');
   return {id:String(skillId??name),name,level,rank:0,source,skillId,description,effectCategory,damageRelated,skillKey};
  };
  const rawSkills=weapon.skills.map(x=>classifySkill(x,skillSource));
  const activeBonusEffects=Array.isArray(stats?.activeBonusEffects)?stats.activeBonusEffects.map(x=>({...x})):[];
  const activeBonusEffectNames=new Set(activeBonusEffects.map(x=>String(x?.name||'')).filter(Boolean));
  const canonicalSlugger=rawSkills.find(x=>x.skillKey==='slugger'&&String(x.skillId)==='36'&&Number.isInteger(x.level)&&x.level===1);
  const buildSkills=Array.isArray(skills)?skills.map(([name,level])=>{const ui=classifySkill({name,level},'index.html:calcBuild');return ui.skillKey==='slugger'&&canonicalSlugger?{...canonicalSlugger,level:ui.level,source:`${canonicalSlugger.source};index.html:calcBuild`}:ui;}):[];
  const allSkills=[...rawSkills,...buildSkills.filter(x=>!rawSkills.some(y=>String(y.skillId)===String(x.skillId)&&y.level===x.level))];
  if(target?.monster!=='training-room'||target?.part!=='training-front')return fail('REAL_SLICE:TRAINING_ROOM_FRONT_REQUIRED');
  const normalized=normalizeTechniqueIds(Array.isArray(techniqueIds)?techniqueIds:null,{fallback:techniqueId});
  const resolvedTechniqueIds=normalized.ids;
  if(normalized.unresolved.length)return fail('REAL_SLICE:TECHNIQUE_ID_UNRESOLVED:'+normalized.unresolved.join(','));
  if(!resolvedTechniqueIds.length)return fail('REAL_SLICE:TECHNIQUE_NOT_SELECTED');
  const techniqueKind=weapon.kind==='sword-shield'?'sword-and-shield':weapon.kind;
  const thousandRequested=weapon.kind==='bow'&&resolvedTechniqueIds.includes('BOW_THOUSAND_DRAGONS');
  const thousandRule=thousandRequested?techniqueDb?.get?.('bow','BOW_THOUSAND_DRAGONS')?.sourceFormula:null;
  const specialAmmoEntries=allSkills.filter(x=>Number(x.skillId)===69||x.name==='特殊射撃強化');
  const thousandPierceEntries=allSkills.filter(x=>Number(x.skillId)===94||x.name==='貫通弾・竜の矢強化');
  if(thousandRequested){
   if(thousandPierceEntries.some(x=>Number(x.skillId)!==thousandRule?.pierceUp?.skillId||x.name!==thousandRule.pierceUp.name||x.level!==thousandRule.pierceUp.level))return fail('BOW_THOUSAND:PIERCE_SKILL_CONTRACT_INVALID');
   if(resolvedTechniqueIds.length!==1)return fail('BOW_THOUSAND:SINGLE_SHOT_REQUIRED');
   if(thousandRule?.status!=='OWNER_APPROVED_PROVISIONAL'||specialAmmoEntries.some(x=>Number(x.skillId)!==thousandRule.skillId||x.name!==thousandRule.skillName||!Number.isInteger(x.level)||x.level<1||x.level>=thousandRule.specialAmmoMultipliers.length))return fail('BOW_THOUSAND:SKILL_CONTRACT_INVALID');
   if(bowState?.coating!=='NONE'||bowState?.range!=='CRITICAL'||bowState?.guided===true||conditions.mounted===true)return fail('BOW_THOUSAND:STATE_NOT_ADOPTED');
   const unsupported=allSkills.filter(x=>![69,94].includes(Number(x.skillId))&&!['attack','affinity','criticalBoost'].includes(x.skillKey)&&Number(x.skillId)!==144);
   if(unsupported.length||activeBonusEffects.length)return fail('BOW_THOUSAND:SKILL_COMBINATION_NOT_ADOPTED:'+unsupported.map(x=>x.name).join(','));
  }
  const artilleryEntries=allSkills.filter(x=>['砲術','Artillery'].includes(x.name)),loadShellEntries=allSkills.filter(x=>['砲弾装填','Load Shells'].includes(x.name));
  const officialPhialType=weapon.kind==='charge-blade'?(weapon.phial==='impact'?'IMPACT':weapon.phial==='element'?'POWER_ELEMENT':null):null;
  if(weapon.kind==='charge-blade'&&!officialPhialType)return fail('REAL_SLICE:CB_PHIAL_TYPE_UNRESOLVED_FROM_MHDB');
  const adoptedBonusAttackName=name=>(stats.conditionalConditionPlan?.groupPlan?.applied||[]).some(e=>[10,25,34,62,70,107,115,131,150,155,161,167,170,180].includes(e.skillId)&&e.bonusSource===true&&!e.annotationOnly&&!e.elementMultiplier&&Number.isFinite(e.attackAdd)&&Number.isFinite(e.attackMultiplier)&&(e.skill===name||e.parent===name));
  const bladescaleEntries=allSkills.filter(x=>Number(x.skillId)===163||x.name==='刃鱗研装'),bladescaleRule=root.MHBladescaleFirstHitRule;
  if(bladescaleEntries.length&&(!bladescaleRule||bladescaleEntries.some(x=>Number(x.skillId)!==bladescaleRule.skillId||x.name!==bladescaleRule.name||x.level!==bladescaleRule.level)))return fail('REAL_SLICE:BLADESCALE_CONTRACT_INVALID');
  const cornpopperEntries=allSkills.filter(x=>Number(x.skillId)===159||x.name==='焼き砲モロコシ'),cornpopperRule=techniqueDb?.get?.('gunlance','GL_SHELL_NORMAL_MEDIUM')?.specialSourceValues?.p0ReferenceRules?.cornpopperReference;
  if(cornpopperEntries.length&&(!cornpopperRule||weapon.kind!=='gunlance'||cornpopperEntries.some(x=>Number(x.skillId)!==cornpopperRule.skillId||x.name!==cornpopperRule.name||x.level!==cornpopperRule.level)))return fail('GL_SHELL:CORNPOPPER_CONTRACT_INVALID');
  const guardEntries=allSkills.filter(x=>Number(x.skillId)===66||['Offensive Guard','\u653b\u3081\u306e\u5b88\u52e2'].includes(x.name));
  if(weapon.kind==='gunlance'&&guardEntries.some(x=>(x.skillId!=null&&Number(x.skillId)!==66)||!['Offensive Guard','\u653b\u3081\u306e\u5b88\u52e2'].includes(x.name)||!Number.isInteger(x.level)||x.level<1||x.level>3))return fail('GL_SHELL:OFFENSIVE_GUARD_LEVEL_INVALID');
  const shellingInput={shellingState:gunlanceState,loadShellsLevel:loadShellEntries.length?Math.max(...loadShellEntries.map(x=>x.level)):0,artilleryLevel:artilleryEntries.length?Math.max(...artilleryEntries.map(x=>x.level)):0,normalAttackComponents:stats.attackComponents?{weaponBase:Number(stats.attackComponents.weaponBase),normalMultiplier:1,normalFlat:0}:null,unreviewedSkills:allSkills.filter(x=>![85,136].includes(Number(x.skillId))&&!(cornpopperEntries.length&&Number(x.skillId)===159)&&!(bladescaleEntries.length&&Number(x.skillId)===163)&&!confirmedNonDamage(x)&&!annotationPolicy(x)&&!['selfState','handicraft','ballistics','attack','affinity','criticalBoost','conditionalAttack','shelling','slugger','fire','water','thunder','ice','dragon','normalUp','spreadUp','chargeMaster','criticalElement','bladescaleLoading','firstShot','forceShot'].includes(x.skillKey)).map(x=>x.name)};
  const rapidRequested=weapon.kind==='light-bowgun'&&resolvedTechniqueIds.includes('LBG_NORMAL_RAPID_1'),rapidShotRule=rapidRequested?techniqueDb.get('light-bowgun','LBG_NORMAL_RAPID_1')?.rapidRule:null;
  const rapidEntries=allSkills.filter(x=>Number(x.skillId)===23||x.name==='速射強化');
  if(rapidRequested){
   if(!rapidShotRule||resolvedTechniqueIds.length!==1)return fail('LBG_RAPID:SINGLE_TRIGGER_REQUIRED');
   if(rapidEntries.length>1||rapidEntries.some(x=>Number(x.skillId)!==rapidShotRule.skillId||x.name!==rapidShotRule.skillName||x.level!==rapidShotRule.skillLevel))return fail('LBG_RAPID:SKILL_CONTRACT_INVALID');
   const coexisting=[{id:6,name:'通常弾・通常矢強化',max:1},{id:53,name:'弾導強化',max:3}];
   for(const r of coexisting){const entries=allSkills.filter(x=>Number(x.skillId)===r.id||x.name===r.name);if(entries.length>1||entries.some(x=>Number(x.skillId)!==r.id||x.name!==r.name||!Number.isInteger(x.level)||x.level<1||x.level>r.max))return fail('LBG_RAPID:COEXISTING_SKILL_CONTRACT_INVALID');}
   if(allSkills.some(x=>!['attack','affinity','criticalBoost'].includes(x.skillKey)&&![144,23,6,53].includes(Number(x.skillId)))||activeBonusEffectNames.size)return fail('LBG_RAPID:SKILL_COMBINATION_NOT_ADOPTED');
   const s=lightBowgunState,a=weapon.ammo?.find(x=>x.kind==='normal'&&x.level===1);
   if(!a||a.rapid!==true||!Number.isInteger(a.capacity)||a.capacity<1||weapon.artiaCalculationEvidence?.capacityEvidence?.bonus>0)return fail('LBG_RAPID:WEAPON_AMMO_NOT_ADOPTED');
   if(s?.shotMode!=='RAPID'||s?.rapidReady!==true||s?.ammoType!=='NORMAL'||s?.ammoLevel!==1||s?.range!=='CRITICAL'||s?.contactPolicy!=='ALL_FIVE'||s?.normalModeLevel!==0||conditions.mounted===true)return fail('LBG_RAPID:START_CONDITION_REQUIRED');
   if(!Number.isInteger(s.loadedRounds)||s.loadedRounds<rapidShotRule.consumedRounds||s.loadedRounds>a.capacity)return fail('LBG_RAPID:LOADED_ROUNDS_INVALID_OR_INSUFFICIENT');
  }
  const wyvernRequested=weapon.kind==='heavy-bowgun'&&resolvedTechniqueIds.includes('HBG_WYVERN_AMMO');
  if(wyvernRequested){
   if(resolvedTechniqueIds.length!==1)return fail('HBG_WYVERN:SEQUENCE_STOCK_TRANSITION_UNCONNECTED');
   if(!weapon.ammo?.some(a=>a.kind==='wyvern'&&Number.isInteger(a.capacity)&&a.capacity>0))return fail('HBG_WYVERN:WEAPON_AMMO_APPLICABILITY_PENDING');
   if(weapon.artiaCalculationEvidence)return fail('HBG_WYVERN:UNREVIEWED_WEAPON_OR_BONUS_EFFECT');
   const allowed=['攻撃','Attack Boost','砲術','Artillery','火属性攻撃強化','Fire Attack','見切り','Critical Eye','超会心','Critical Boost'];
   for(const x of allSkills.filter(x=>['firstShot','forceShot'].includes(x.skillKey))){if(Number(x.skillId)!==(x.skillKey==='firstShot'?140:137)||!Number.isInteger(x.level)||x.level<1||x.level>3)return fail('HBG_WYVERN:SHOT_SKILL_ID_OR_LEVEL_INVALID');allowed.push(x.name);}
   if(bladescaleEntries.length)allowed.push(bladescaleRule.name);
   const planned=stats.conditionalConditionPlan?.groupPlan?.applied||[];
   const resolvedAttackSkill=x=>[144,154,123,120,81,75,87,66,67,138].includes(x.skillId)||adoptedBonusAttackName(x.name)||planned.some(e=>e.skill===x.name&&!e.elementMultiplier&&(Number.isFinite(e.attackAdd)&&Number.isFinite(e.attackMultiplier)))||(x.skillId===18&&planned.some(e=>e.skillId===106));
   const unrelatedElement=x=>['water','thunder','ice','dragon'].includes(x.skillKey)&&Number.isInteger(x.level)&&x.level>=1&&x.level<=3;
   if(allSkills.some(x=>x.level>0&&!confirmedNonDamage(x)&&!annotationPolicy(x)&&!allowed.includes(x.name)&&!resolvedAttackSkill(x)&&!unrelatedElement(x)&&!(Number(x.skillId)===86&&resolvedTechniqueIds.every(id=>Object.hasOwn(root.MHAirborneHitRule?.hitIndices||{},id)&&root.MHAirborneHitRule.hitIndices[id].length===0))&&x.skillKey!=='selfState'&&x.skillKey!=='handicraft'&&x.skillKey!=='ballistics'))return fail('HBG_WYVERN:CONDITIONAL_EFFECT_SCOPE_PENDING');
   // Unknown activated bonuses still flow to the structured unresolved effect plan.

   if(!equipmentSkillsResolved)return fail('HBG_WYVERN:EQUIPMENT_SKILLS_UNRESOLVED');
  }
  const referenceSkills=Object.fromEntries(['normalUp','spreadUp','chargeMaster','criticalElement','bladescaleLoading','firstShot','forceShot'].map(key=>[key,Math.max(...allSkills.filter(x=>x.skillKey===key).map(x=>x.level),0)]));
  if(weapon.kind==='light-bowgun'&&(referenceSkills.firstShot>0||referenceSkills.forceShot>0)&&resolvedTechniqueIds.length!==1)return fail('REAL_SLICE:LBG_SHOT_SKILL_SINGLE_SHOT_REQUIRED');
  if(weapon.kind==='light-bowgun'&&(referenceSkills.firstShot>0||referenceSkills.forceShot>0)&&(!Number.isInteger(lightBowgunState?.shotOrdinal)||lightBowgunState.shotOrdinal<1||typeof lightBowgunState?.fullMagazine!=='boolean'))return fail('REAL_SLICE:LBG_SHOT_POSITION_PENDING');
  const referenceCriticalBoostLevel=Math.max(...allSkills.filter(x=>x.skillKey==='criticalBoost').map(x=>x.level),0),criticalElementLevel=Math.max(...allSkills.filter(x=>x.skillKey==='criticalElement').map(x=>x.level),0);
  const gsCharge=root.MHGreatSwordChargeMasterDB;
  const gsChargeActive=weapon.kind==='great-sword'&&referenceSkills.chargeMaster>0;
  if(gsChargeActive){
   const entries=allSkills.filter(x=>x.skillKey==='chargeMaster');
   if(!gsCharge||gsCharge.status!=='OWNER_APPROVED_PROVISIONAL'||entries.some(x=>Number(x.skillId)!==gsCharge.skillId||!Number.isInteger(x.level)||x.level<1||x.level>3))return fail('REAL_SLICE:GS_CHARGE_MASTER_CONTRACT_INVALID');
   if(resolvedTechniqueIds.some(id=>!gsCharge.techniqueIds.includes(id)))return fail('REAL_SLICE:GS_CHARGE_MASTER_TECHNIQUE_NOT_ADOPTED');
  }
  if(resolvedTechniqueIds.some(id=>['CB_SAED','CB_SAED_AED_DERIVED'].includes(id))){
   if(equipmentSkillsResolved!==true||!Array.isArray(skills))return fail('REAL_SLICE:CB_EQUIPMENT_SKILLS_UNRESOLVED');
   if(loadShellEntries.some(x=>Number(x.skillId)!==109||!Number.isInteger(x.level)||x.level<0||x.level>2))return fail('REAL_SLICE:CB_LOAD_SHELLS_ID_OR_LEVEL_INVALID');
  }
  if(weapon.artiaCalculationEvidence?.capacityEvidence?.bonus>0&&resolvedTechniqueIds.some(id=>! /^(HBG|LBG)_NORMAL_AMMO_[123]$/.test(id)))return fail('REAL_SLICE:ARTIA_CAPACITY_AMMO_SCOPE_PENDING');
  const rapidRule=root.MHRapidMorphAttackRule;
  const rapidMorphEntries=allSkills.filter(x=>x.skillKey==='rapidMorph'),rapidMorphLevel=Math.max(0,...rapidMorphEntries.map(x=>x.level));
  if(rapidMorphEntries.length&&(!['charge-blade','switch-axe'].includes(weapon.kind)||rapidMorphEntries.some(x=>Number(x.skillId)!==7||!Number.isInteger(x.level)||x.level<1||x.level>3)))return fail('REAL_SLICE:RAPID_MORPH_SCOPE_OR_LEVEL_UNRESOLVED');
  if(rapidMorphEntries.length&&(!rapidRule||rapidRule.status!=='OWNER_APPROVED_PROVISIONAL'||resolvedTechniqueIds.some(id=>weapon.kind==='charge-blade'?!root.ChargeBladeEngine?.techniques?.[id]:!['SA_SWORD_VERTICAL','SA_SWORD_MORPH_DOUBLE','SA_AXE_MORPH_SLASH'].includes(id))))return fail('REAL_SLICE:RAPID_MORPH_TECHNIQUE_SCOPE_UNRESOLVED');
  let ed1Rule=root.MHCBED1ResourceRule;
  const dischargeRules=root.MHCBDischargeResourceRules,resourcePlans={};
  const ed1Requested=weapon.kind==='charge-blade'&&resolvedTechniqueIds.some(id=>dischargeRules?.predecessors?.[id]);
  if(ed1Requested){
   if(!ed1Rule||ed1Rule.status!=='OWNER_APPROVED'||dischargeRules?.status!=='OWNER_APPROVED')return fail('REAL_SLICE:CB_ED1_RESOURCE_CONTRACT_UNAVAILABLE');
   if(new Set(resolvedTechniqueIds).size!==resolvedTechniqueIds.length||resolvedTechniqueIds.some(id=>!dischargeRules.predecessors[id]))return fail('REAL_SLICE:CB_DISCHARGE_SEQUENCE_SCOPE_UNCONNECTED');
   if(typeof chargeBladeState?.axeBoosted!=='boolean')return fail('REAL_SLICE:CB_ED1_NORMAL_PHIAL_EXPLICIT_AXE_REQUIRED');
   const explicitEnhanced=chargeBladeState.enhancedPhials!=null;
   if(!explicitEnhanced&&chargeBladeState.enhancedPhial!==false)return fail('REAL_SLICE:CB_ED1_ENHANCED_STOCK_REQUIRED');
   let enhanced=explicitEnhanced?chargeBladeState.enhancedPhials:0,normal=chargeBladeState.normalPhials,previous=chargeBladeState.previousAction;
   if(typeof enhanced!=='number'||!Number.isSafeInteger(enhanced*2)||enhanced<0)return fail('REAL_SLICE:CB_ED1_ENHANCED_STOCK_INVALID');
   if(typeof normal!=='number'||!Number.isSafeInteger(normal*2)||normal<0)return fail('REAL_SLICE:CB_ED1_START_STATE_UNRESOLVED');
   if(previous==='GUARD'&&chargeBladeState.shieldBoosted!==false)return fail('REAL_SLICE:CB_GUARD_AED_SHIELD_STATE_UNSUPPORTED');
   const amount=dischargeRules.baseConsumption*(chargeBladeState.axeBoosted?ed1Rule.axeBoostedConsumptionMultiplier:1);
   for(const id of resolvedTechniqueIds){
    if(!dischargeRules.predecessors[id].includes(previous))return fail('REAL_SLICE:CB_DISCHARGE_PREDECESSOR_UNRESOLVED:'+id);
    if(enhanced>0&&enhanced<amount)return fail('REAL_SLICE:CB_ED1_CROSS_TYPE_DAMAGE_ALLOCATION_UNRESOLVED');
    const resourceKey=enhanced>0?'enhancedPhials':'normalPhials';
    resourcePlans[id]={...ed1Rule,techniqueId:id,consumeNormalPhials:amount,resourceKey,consumedPhialKind:enhanced>0?'ENHANCED':'NORMAL',prioritySource:dischargeRules.prioritySource,source:id==='CB_ELEMENT_DISCHARGE_1'?ed1Rule.source:dischargeRules.source,requiredPreviousAction:previous,rapidMorphExcludedEffectIds:Object.entries(dischargeRules.rapidMorphOrigins).flatMap(([tech,origins])=>origins.map(origin=>'rapid-morph-discharge:'+tech+':'+origin)),predecessorSource:dischargeRules.predecessorSource,axeBoosted:chargeBladeState.axeBoosted};
    // Planning chooses coefficients only. L5 validates and commits actual consumption atomically.
    if(resourceKey==='enhancedPhials')enhanced=Math.max(0,enhanced-amount);else normal=Math.max(0,normal-amount);
    previous=id;
   }
  }
  if(weapon.kind==='charge-blade'&&rapidMorphLevel>1){
   const originPending=resolvedTechniqueIds.find(id=>['CB_SAED','CB_SAED_AED_DERIVED'].includes(id));
   if(originPending)return fail('REAL_SLICE:CB_RAPID_MORPH_ORIGIN_UNRESOLVED:'+originPending);
  }
  if(weapon.kind==='charge-blade'&&resolvedTechniqueIds.includes('CB_SWORD_TO_AXE_MORPH')){
   if(typeof chargeBladeState?.axeBoosted!=='boolean'||typeof chargeBladeState?.shieldBoosted!=='boolean')return fail('REAL_SLICE:CB_MORPH_SHIELD_AXE_STATE_REQUIRED');
   if(chargeBladeState.axeBoosted&&resolvedTechniqueIds.length!==1)return fail('REAL_SLICE:CB_MORPH_AXE_BOOST_SEQUENCE_UNCONNECTED');
  }
  const techniques={};
  const resolveReferenceState=(referenceKind,id,technique,rawState)=>{
   const state={...(rawState||{})},sourceState=technique?.specialSourceValues||{};
   if(referenceKind==='heavy-bowgun-wyvern'){
    state.shotOrdinal=hbgState?.shotOrdinal;state.fullMagazine=hbgState?.fullMagazine;state.magazineCapacity=hbgState?.magazineCapacity;
    if((referenceSkills.firstShot>0||referenceSkills.forceShot>0)&&state.magazineCapacity!==weapon.ammo.find(x=>x.kind==='wyvern')?.capacity)throw Error('HBG_WYVERN:SHOT_CAPACITY_MISMATCH');
   }else if(['heavy-bowgun-element','light-bowgun-element'].includes(referenceKind)){
    if(referenceKind==='light-bowgun-element')state.elementType=String(state.ammoType||'').toLowerCase();
    state.weaponAmmoEntry=weapon.ammo?.find(x=>x.kind===state.elementType&&x.level===state.ammoLevel)||null;
    state.magazineCapacity=state.weaponAmmoEntry?.capacity??null;
   }else if(referenceKind==='light-bowgun'){
    const level=Number(String(id).match(/^LBG_NORMAL_(?:AMMO|RAPID)_([12])$/)?.[1]||0);
    if(!Number.isInteger(level)||level<1)return state;
    state.ammoLevel=state.ammoLevel??level;
    state.weaponAmmoEntry=Array.isArray(weapon?.ammo)?weapon.ammo.find(x=>x?.kind==='normal'&&x.level===level)||null:null;
    state.magazineCapacity=state.weaponAmmoEntry?.capacity??null;
    if((referenceSkills.firstShot>0||referenceSkills.forceShot>0)&&(!Number.isInteger(state.magazineCapacity)||state.magazineCapacity<1||state.shotOrdinal>state.magazineCapacity))throw Error('REAL_SLICE:LBG_SHOT_CAPACITY_UNRESOLVED');
    state.resolutionSource=state.resolutionSource||'TECHNIQUE_DB_AMMO_LEVEL_FROM_ID';
   }else if(referenceKind==='heavy-bowgun'){
    state.ammoType=state.ammoType??null;
    state.contactPolicy=state.contactPolicy??(sourceState.hitCount===3?'ALL_THREE':null);
    const expectedLevel=Number(String(id).match(/^HBG_NORMAL_AMMO_([123])$/)?.[1]||0);
    state.weaponAmmoEntry=Array.isArray(weapon?.ammo)?weapon.ammo.find(x=>String(x?.kind||'').toLowerCase()==='normal'&&Number(x?.level)===expectedLevel)||null:null;
    state.resolutionSource=state.resolutionSource||'TECHNIQUE_DB_SPECIAL_SOURCE_VALUES';
   }
   if(weapon.artiaCalculationEvidence?.capacityEvidence?.bonus>0&&['light-bowgun','heavy-bowgun'].includes(referenceKind)){
    if(!state.weaponAmmoEntry||!Number.isInteger(state.weaponAmmoEntry.capacity))throw Error('REAL_SLICE:ARTIA_CAPACITY_BASE_AMMO_UNRESOLVED');
    state.magazineCapacity=state.weaponAmmoEntry.capacity;
    state.capacityEvidence=weapon.artiaCalculationEvidence.capacityEvidence;
   }
   return state;
  };
  const hhModel=weapon.kind==='hunting-horn'&&huntingHornState?.model===root.TechniqueDBEngine?.eventModels?.hhNormalMelody?.id?root.TechniqueDBEngine?.eventModels?.hhNormalMelody:null;
  if(weapon.kind==='hunting-horn'&&huntingHornState?.model&&!hhModel)return fail('REAL_SLICE:HH_MODEL_UNKNOWN');
  const saAwakened=weapon.kind==='switch-axe'&&switchAxeState?.awakened===true?root.TechniqueDBEngine?.eventModels?.saAwakened:null;
  if(weapon.kind==='switch-axe'&&switchAxeState?.awakened===true&&(!saAwakened||saAwakened.status!=='OWNER_APPROVED_PROVISIONAL'||resolvedTechniqueIds.some(id=>!saAwakened.techniqueIds.includes(id))))return fail('REAL_SLICE:SA_AWAKENED_MODEL_UNSUPPORTED');
  if(hhModel){
   if(!Array.isArray(huntingHornState.melodies)||!huntingHornState.melodies.length||huntingHornState.melodies.length>hhModel.maxMelodies||huntingHornState.melodies.some(x=>x!=='SELF_IMPROVEMENT'&&!hhModel.attackMelodies[x]))return fail('REAL_SLICE:HH_MELODY_DEFINITION_UNRESOLVED');
   if(!Number.isSafeInteger(huntingHornState.echoBubbles)||huntingHornState.echoBubbles<0||huntingHornState.echoBubbles>hhModel.maxEchoBubbles||!Number.isInteger(huntingHornState.selfImprovementLevel)||huntingHornState.selfImprovementLevel<0||huntingHornState.selfImprovementLevel>hhModel.selfImprovementCap)return fail('REAL_SLICE:HH_START_STATE_REQUIRED');
   const families=[...new Set([...huntingHornState.melodies.filter(x=>x!=='SELF_IMPROVEMENT'),...(huntingHornState.attackMelody?[huntingHornState.attackMelody]:[])])];
   if(families.length>1||families.some(x=>!hhModel.attackMelodies[x]))return fail('REAL_SLICE:HH_ATTACK_MELODY_FAMILY_CONFLICT');
   if(families.length&&(!Number.isInteger(huntingHornState.attackMelodyLevel)||huntingHornState.attackMelodyLevel<0||huntingHornState.attackMelodyLevel>hhModel.attackMelodyCap))return fail('REAL_SLICE:HH_ATTACK_MELODY_START_REQUIRED');
   huntingHornState={...huntingHornState,attackMelody:families[0]||null,attackMelodyLevel:huntingHornState.attackMelodyLevel??0};
   if(resolvedTechniqueIds.some(id=>!hhModel.techniques[id]))return fail('REAL_SLICE:HH_MODEL_TECHNIQUE_UNSUPPORTED');
   let performed=false,encored=false,previousAction=null;for(const id of resolvedTechniqueIds){const action=hhModel.techniques[id];if(action==='performance'){if(performed)return fail('REAL_SLICE:HH_MULTIPLE_PERFORMANCE_STOCK_UNRESOLVED');performed=true;}if(action==='encore'){if(!performed||encored||!(previousAction==='performance'||previousAction==='beat'))return fail('REAL_SLICE:HH_ENCORE_PREVIOUS_MELODIES_REQUIRED');encored=true;}previousAction=id.startsWith('HH_PERFORMANCE_BEAT_')?'beat':action;}
  }
  for(const id of [...new Set(resolvedTechniqueIds)]){
   let technique=techniqueDb?.get?.(techniqueKind,id);
   if(weapon.kind==='gunlance'&&String(id).startsWith('reference:gl_')){
    const action=String(id).slice('reference:gl_'.length).toUpperCase(),canonical='GL_SHELL_NORMAL_MEDIUM';
    const base=techniqueDb?.get?.(techniqueKind,canonical);
    if(!base||!Array.isArray(base.specialComponents)||!base.specialComponents.some(x=>String(x).includes('SHELL')))return fail('REAL_SLICE:SHELLING_TECHNIQUE_NOT_FOUND:'+canonical);
    technique={...base,techniqueId:id,shellingAction:action,shellingInput};
    if(['NORMAL','CHARGED'].includes(action)&&resolvedTechniqueIds.every(x=>['reference:gl_NORMAL','reference:gl_CHARGED'].includes(x)||(['GL_SLAM','GL_SWEEP'].includes(x)&&techniqueDb?.get?.(techniqueKind,x)?.shellingBodyResourceContract==='NO_SHELL_CONSUMPTION_BODY'))){
     try{technique.shellingResource={id:action==='NORMAL'?'GL_NORMAL_ROUNDS':'GL_CHARGED_ROUNDS',amount:root.GunlanceShellReference.consumedRounds(action,gunlanceState),source:'gunlance-shell-reference.js:consumedRounds'};}catch(error){return fail(String(error?.message||error));}
    }
   }
   if(weapon.kind==='insect-glaive'&&technique){
    if(!technique.hits?.length)return fail('REAL_SLICE:IG_KINSECT_ONLY_OUT_OF_SCOPE');
    technique={...technique,specialComponents:(technique.specialComponents||[]).filter(x=>x!=='KINSECT')};
   }
   const referenceKind=weapon.kind==='heavy-bowgun'&&id==='HBG_WYVERN_AMMO'?'heavy-bowgun-wyvern':weapon.kind==='light-bowgun'&&id==='LBG_ELEMENT_FIRST_HIT_REFERENCE'?'light-bowgun-element':weapon.kind==='heavy-bowgun'&&id==='HBG_ELEMENT_FIRST_HIT_REFERENCE'?'heavy-bowgun-element':weapon.kind==='bow'&&['BOW_SHOT_3','BOW_POWER_SHOT_3','BOW_POWER_VOLLEY_3','BOW_THOUSAND_DRAGONS'].includes(id)?'bow':weapon.kind==='heavy-bowgun'&&/^HBG_NORMAL_AMMO_[123]$/.test(id)?'heavy-bowgun':weapon.kind==='light-bowgun'&&/^LBG_NORMAL_(?:AMMO_[12]|RAPID_1)$/.test(id)?'light-bowgun':weapon.kind==='charge-blade'&&['CB_SAED','CB_SAED_AED_DERIVED'].includes(id)?'charge-blade-saed':weapon.kind==='hunting-horn'&&['HH_PERFORMANCE_SHOCKWAVE','HH_ECHO_BUBBLE_FOLLOWUP','HH_ECHO_BUBBLE_MELODY_EVENT','HH_MELODY_COMPLETION_FIXED_10'].includes(id)?'hunting-horn-sound':null;
   if(referenceKind){const rawState=referenceKind==='heavy-bowgun-wyvern'?{...conditions.hbgWyvernState,...conditions.combatBuffs}:referenceKind==='bow'?bowState:['heavy-bowgun','heavy-bowgun-element'].includes(referenceKind)?hbgState:['light-bowgun','light-bowgun-element'].includes(referenceKind)?lightBowgunState:referenceKind==='charge-blade-saed'?{...chargeBladeState,ammoLoadingLevel:Math.max(0,...loadShellEntries.map(x=>x.level))}:huntingHornState;technique={...technique,referenceKind,referenceInput:{state:resolveReferenceState(referenceKind,id,technique,rawState),skills:referenceKind==='heavy-bowgun-wyvern'?{firstShot:referenceSkills.firstShot,forceShot:referenceSkills.forceShot,artilleryLevel:Math.max(0,...artilleryEntries.map(x=>x.level)),fireLevel:Math.max(0,...allSkills.filter(x=>['火属性攻撃強化','Fire Attack'].includes(x.name)).map(x=>x.level))}:referenceSkills,criticalBoostLevel:referenceCriticalBoostLevel,sourceTechniqueId:id}};}
   if(!technique)return fail('REAL_SLICE:TECHNIQUE_NOT_FOUND:'+id);
   if(hhModel)technique={...technique,hhModel:{...hhModel,action:hhModel.techniques[id],input:huntingHornState,specialRecords:Object.fromEntries(['HH_PERFORMANCE_SHOCKWAVE','HH_ECHO_BUBBLE_FOLLOWUP','HH_ECHO_BUBBLE_MELODY_EVENT','HH_MELODY_COMPLETION_FIXED_10'].map(key=>[key,techniqueDb.get('hunting-horn',key)]))}};
   const normalContract=STANDARD_NORMAL_HIT_CONTRACT[id];
   if(normalContract&&!technique.referenceKind&&!Array.isArray(technique.specialComponents)){
    technique={...technique,stateRequirement:technique.stateRequirement&&Object.keys(technique.stateRequirement).length?technique.stateRequirement:(normalContract.stateRequirement||{}),hits:(technique.hits||[]).map(hit=>({...hit,damageType:hit.damageType??normalContract.damageType,partModifier:hit.partModifier??normalContract.partModifier,partModifierSource:hit.partModifierSource??normalContract.source}))};
   }
   if(id==='IG_ENHANCED_DIAGONAL_SLASH')technique={...technique,hpOnlyProvisional:'IG_ENHANCED_DIAGONAL_SLASH_20261025',stateRequirement:{tripleExtract:true}};
   if(technique.phialReference?.status==='OBSERVED'&&Number.isInteger(technique.phialReference.hitCount)){
    const axeCountPending=['CB_ELEMENT_DISCHARGE_1','CB_ELEMENT_DISCHARGE_2','CB_AED','CB_FOLLOWUP_AED'].includes(id);
    if(axeCountPending&&typeof chargeBladeState?.axeBoosted!=='boolean')return fail('REAL_SLICE:CB_AXE_BOOST_STATE_REQUIRED');
    const suppliedType=chargeBladeState?.phialType||null;
    if(suppliedType&&suppliedType!==officialPhialType)return fail('REAL_SLICE:CB_PHIAL_TYPE_MISMATCH_MHDB:'+officialPhialType+':'+suppliedType);
    const artilleryLevel=artilleryEntries.length?Math.max(...artilleryEntries.map(x=>x.level)):0;
    if(artilleryEntries.some(x=>!Number.isInteger(x.level)||x.level<0||x.level>3))return fail('REAL_SLICE:CB_ARTILLERY_LEVEL_UNRESOLVED');
    const artillery=root.ChargeBladeEngine?.evidence?.artillery;
    let artilleryMultiplier;
    if(artilleryLevel===0){
     if(artillery?.status!=='PROVISIONALLY_ADOPTED')return fail('REAL_SLICE:CB_ARTILLERY_LV0_UNRESOLVED');
     artilleryMultiplier=1;
    }else{
     const candidate=artillery?.multipliers?.[artilleryLevel];
     if(artillery?.status!=='PROVISIONALLY_ADOPTED'||!Object.prototype.hasOwnProperty.call(artillery?.multipliers||{},artilleryLevel)||typeof candidate!=='number'||!Number.isFinite(candidate)||candidate<=0)return fail('REAL_SLICE:CB_ARTILLERY_MULTIPLIER_UNRESOLVED');
     artilleryMultiplier=candidate;
    }
    const baseAttack=weapon.damage?.raw;
    if(typeof baseAttack!=='number'||!Number.isFinite(baseAttack)||baseAttack<0)return fail('REAL_SLICE:CB_BASE_ATTACK_UNRESOLVED');
    technique={...technique,phialState:{...(chargeBladeState||{}),...(resourcePlans[id]?{enhancedPhial:resourcePlans[id].consumedPhialKind==='ENHANCED'}:{}),phialType:officialPhialType,artilleryLevel,artilleryMultiplier,baseAttack,attackComponents:stats.attackComponents?{weaponBase:Number(stats.attackComponents.weaponBase),normalMultiplier:1,normalFlat:0}:null,phialTypeSource:'MHDB:weapon.phial',phialTypeValue:weapon.phial,artilleryEvidenceRefs:artillery?.evidenceRefs||[],artillerySourceVersion:artillery?.sourceVersion||'UNKNOWN',artilleryStatus:artillery?.status||'UNRESOLVED'}};
   }
   if(weapon.kind==='charge-blade'&&root.ChargeBladeEngine?.techniques?.[id]?.shieldBoostAxeBody===true)technique={...technique,shieldBoostAxeBody:true};
   if(['CB_SWORD_TO_AXE_MORPH',...Object.keys(dischargeRules.predecessors)].includes(id)&&chargeBladeState?.axeBoosted===true){
    // R72's adopted dedicated component source. No new coefficients or hit counts.
    const extra=root.ChargeBladeEngine?.techniques?.[id]?.axeBoostHits;
    if(!extra||!Number.isSafeInteger(extra.count)||extra.count<=0||!Number.isFinite(extra.mv)||extra.mv<0||!Number.isFinite(extra.elementModifier)||extra.elementModifier<0)return fail('REAL_SLICE:CB_MORPH_AXE_BOOST_SOURCE_UNRESOLVED');
    const adoption={status:'EXISTING_ADOPTED_REFERENCE',verificationStatus:'UNVERIFIED',source:'TECHNIQUE_DB_SPEC_R72.md;index.html:CHARGE_BLADE_TECHNIQUES',scope:resourcePlans[id]?'ADOPTED_RELEASE_BODY_PHIAL_AND_AXE_FOLLOWUP':'SINGLE_MORPH_BODY_AND_AXE_FOLLOWUP_NO_PHIAL',rapidMorphSource:rapidRule.source};
    technique={...technique,adoption,hits:[...technique.hits,...Array.from({length:extra.count},()=>({mv:extra.mv,elementModifier:extra.elementModifier,shieldBoostAxeBody:false,componentSource:'index.html:CHARGE_BLADE_TECHNIQUES.'+id+'.axeBoostHits'}))]};
   }
   const shelling=Array.isArray(technique.specialComponents)&&technique.specialComponents.some(x=>String(x).includes('SHELL')),reference=['bow','light-bowgun','heavy-bowgun','heavy-bowgun-element','light-bowgun-element','charge-blade-saed','hunting-horn-sound','heavy-bowgun-wyvern'].includes(technique.referenceKind);
   if(!shelling&&!reference&&(!Array.isArray(technique.hits)||!technique.hits.length))return fail('REAL_SLICE:TECHNIQUE_HITS_NOT_FOUND:'+id);
   if(resourcePlans[id])technique={...technique,resourceContract:resourcePlans[id]};
   if(saAwakened){
    const followup=techniqueDb.get('switch-axe',saAwakened.followupTechniqueId);
    if(followup?.numericStatus!=='SOURCE_CONFIRMED'||followup.hits?.length!==1)return fail('REAL_SLICE:SA_FOLLOWUP_SOURCE_UNRESOLVED');
    technique={...technique,saAwakened:{...saAwakened,followupRecord:followup},adoption:saAwakened};
   }
   techniques[id]=technique;
  }
  techniqueId=resolvedTechniqueIds[0];
  const technique=techniques[techniqueId];
  if(weapon.kind==='switch-axe'){
   if(resolvedTechniqueIds.some(id=>!techniques[id]?.modeContract&&!STANDARD_NORMAL_HIT_CONTRACT[id]?.stateRequirement?.mode))return fail('REAL_SLICE:SA_TECHNIQUE_MODE_UNRESOLVED');
   if(!switchAxeState||!['SWORD','AXE'].includes(switchAxeState.mode))return fail('REAL_SLICE:STATE_REQUIREMENT_UNRESOLVED:mode');
   const startMode=techniques[resolvedTechniqueIds[0]]?.modeContract?.startMode||STANDARD_NORMAL_HIT_CONTRACT[resolvedTechniqueIds[0]]?.stateRequirement?.mode;
   if(startMode!==switchAxeState.mode)return fail('REAL_SLICE:STATE_REQUIREMENT_MISMATCH:mode');
   if(typeof switchAxeState.awakened!=='boolean')return fail('REAL_SLICE:SA_AWAKENED_STATE_UNRESOLVED');
   if(!['power','element'].includes(weapon.phial?.kind))return fail('REAL_SLICE:SA_PHIAL_EFFECT_UNRESOLVED:'+String(weapon.phial?.kind||'missing'));
  }
  const part=trainingRoom?.parts?.find(x=>x.id==='training-front');
  const isShellingTechnique=id=>{const r=techniques[id];return Array.isArray(r?.specialComponents)&&r.specialComponents.some(x=>String(x).includes('SHELL'));};
  const isShellingOnly=resolvedTechniqueIds.every(isShellingTechnique);
  const hasShelling=resolvedTechniqueIds.some(isShellingTechnique);
  const isReferenceOnly=resolvedTechniqueIds.every(id=>['bow','heavy-bowgun','heavy-bowgun-element','light-bowgun-element','light-bowgun','charge-blade-saed','hunting-horn-sound','heavy-bowgun-wyvern'].includes(techniques[id]?.referenceKind));
  const hasReference=!!hhModel||resolvedTechniqueIds.some(id=>['bow','heavy-bowgun','heavy-bowgun-element','light-bowgun-element','light-bowgun','charge-blade-saed','hunting-horn-sound','heavy-bowgun-wyvern'].includes(techniques[id]?.referenceKind));
  // Validate every ordinary Hit before resolving its own hitzone. Special components do not enter this path.
  const physicalKeys=resolvedTechniqueIds.filter(id=>!techniques[id]?.referenceKind&&!isShellingTechnique(id)).flatMap(id=>(techniques[id]?.hits||[]).map(hit=>{
   if(hit.damageType!==undefined&&hit.damageType!==null)return ['blunt','slash','pierce'].includes(hit.damageType)?hit.damageType:null;
   return STANDARD_NORMAL_HIT_CONTRACT[id]?.damageType??(['hammer','hunting-horn'].includes(weapon.kind)?'blunt':weapon.kind==='charge-blade'?'slash':null);
  }));
  if(!isShellingOnly&&!isReferenceOnly&&(!physicalKeys.length||physicalKeys.some(x=>!x)))return fail('REAL_SLICE:DAMAGE_TYPE_UNRESOLVED');
  const physicalKey=isShellingOnly?'blunt':isReferenceOnly?'pierce':physicalKeys[0];
  if(!isShellingOnly&&!isReferenceOnly&&(!part||physicalKeys.some(key=>!Number.isFinite(part.multipliers?.[key]))))return fail('REAL_SLICE:TRAINING_HITZONE_UNRESOLVED');
  const sharpnessPremise=weapon.artiaCalculationEvidence?.sharpnessPremise;
  const normalArtiaWhite=weapon.artiaCalculationEvidence?.mutationIncluded===false&&sharpnessPremise?.source==='OWNER_2026-10-25T22:35Z_NORMAL_ARTIA_MELEE_WHITE'&&sharpnessPremise.color==='white'&&!['bow','light-bowgun','heavy-bowgun'].includes(weapon.kind);
  const handicraftLevel=Math.max(0,...allSkills.filter(x=>x.skillKey==='handicraft').map(x=>x.level));
  const ranged=['bow','light-bowgun','heavy-bowgun'].includes(weapon.kind);
  const sharpnessResolution=normalArtiaWhite?{color:sharpnessPremise.color,level:handicraftLevel,source:sharpnessPremise.source,scope:'OWNER_FIXED_MAX_COLOR'}:ranged?{color:null,scope:'RANGED_NOT_APPLICABLE'}:root.MHWWeaponMaxSharpness.fromMHDB(weapon,handicraftLevel);
  if(handicraftLevel&&sharpnessResolution.reason)return fail('REAL_SLICE:'+sharpnessResolution.reason);
  const maxSharpness=sharpnessResolution.color;
  if(!isShellingOnly&&!isReferenceOnly&&!maxSharpness)return fail('REAL_SLICE:SHARPNESS_UNRESOLVED');
  if(!weapon.damage||!Number.isFinite(weapon.damage.raw)||!Number.isFinite(weapon.affinity))return fail('REAL_SLICE:MHDB_BASE_STATS_UNKNOWN');
  const attackEntries=allSkills.filter(x=>x.skillKey==='attack');
  if(attackEntries.some(x=>!Number.isInteger(x.level)||x.level<1||x.level>5))return fail('REAL_SLICE:ATTACK_SKILL_LEVEL_UNSUPPORTED');
  const attackLevel=attackEntries.length?Math.max(...attackEntries.map(x=>x.level)):0;
  if(attackLevel&&!root.MHWAttackSkillResolver)return fail('REAL_SLICE:ATTACK_RULE_UNAVAILABLE');
  const attackRule=root.MHWAttackSkillResolver?root.MHWAttackSkillResolver({攻撃:attackLevel}):{flat:0,mult:1};
  const attackFlat=Number(attackRule.flat),attackMult=Number(attackRule.mult);
  if(!Number.isFinite(attackFlat)||!Number.isFinite(attackMult))return fail('REAL_SLICE:ATTACK_RULE_INVALID');
  const expectedAttack=weapon.damage.raw*attackMult+attackFlat;
  const affinityEntries=allSkills.filter(x=>x.skillKey==='affinity');
  if(affinityEntries.some(x=>!Number.isInteger(x.level)||x.level<1||x.level>5))return fail('REAL_SLICE:AFFINITY_SKILL_LEVEL_UNSUPPORTED');
  const affinityLevel=affinityEntries.length?Math.max(...affinityEntries.map(x=>x.level)):0;
  if(affinityLevel&&!root.MHWAffinitySkillResolver)return fail('REAL_SLICE:AFFINITY_RULE_UNAVAILABLE');
  const affinityBonus=affinityLevel?Number(root.MHWAffinitySkillResolver({'見切り':affinityLevel})):0;
  if(!Number.isFinite(affinityBonus))return fail('REAL_SLICE:AFFINITY_RULE_INVALID');
  const criticalBoostEntries=allSkills.filter(x=>x.skillKey==='criticalBoost'),criticalBoostLevel=criticalBoostEntries.length?Math.max(...criticalBoostEntries.map(x=>x.level)):0;
  if(criticalBoostEntries.some(x=>!Number.isInteger(x.level)||x.level<1||x.level>5))return fail('REAL_SLICE:CRITICAL_BOOST_LEVEL_UNSUPPORTED');
  const skillTotal=Object.fromEntries(Array.isArray(skills)?skills:[]);
  const elementSpecial=elementSpecials[0], elementType=elementSpecial?.element||'none', elementRawValue=elementSpecial?.damage?.display??0;
  const elementEntries=allSkills.filter(x=>x.skillKey===elementType),elementSkillNames={fire:'火属性攻撃強化',water:'水属性攻撃強化',thunder:'雷属性攻撃強化',ice:'氷属性攻撃強化',dragon:'龍属性攻撃強化'},elementSkillName=elementSkillNames[elementType],elementLevel=Math.max(...elementEntries.map(x=>x.level),0),elementRule=root.MHWElementSkillResolver&&elementSpecial?root.MHWElementSkillResolver(skillTotal,elementType):{add:0,mult:1},elementValue=elementSpecial?elementRawValue*(elementRule?.mult??1)+(elementRule?.add??0):0;  const attributeConversionLevel=Math.max(...allSkills.filter(x=>x.skillKey==='attributeConversion').map(x=>x.level),0),attributeRule=root.MHAttributeConversionRule,attributeState=conditions?.attributeConversionState;
  // Only adopted Guts/Veil/Omega/Black Eclipse or DB-defined series attack flats with a resolved, activation-checked plan may coexist here.
  const conversionGroupPlan=stats.conditionalConditionPlan?.groupPlan,conversionSelfPlan=stats.conditionalConditionPlan?.selfStatePlan;
  const validatedNonDamageBonuses=typeof root.MHWValidatedNonDamageBonusEffects==='function'?root.MHWValidatedNonDamageBonusEffects(activeBonusEffects):[];
  const conversionResistanceBonusesResolved=activeBonusEffects.length>0&&activeBonusEffects.every(e=>{
   if(e.bonusSkillId===178){
    const rule=root.MHGogElementRule,rank=e.rankLevel,required=rank===1?2:4,rows=conversionGroupPlan?.applied?.filter(a=>a.skillId===178)||[],a=rows[0];
    if(!rule||![1,2].includes(rank)||e.name!==rule.names[rank]||e.bonusName!==rule.parent||e.source!=='series'||e.required!==required||!Number.isInteger(e.count)||e.count<required||(rank===1&&e.count>=4)||rows.length!==1||activeBonusEffects.filter(x=>x.bonusSkillId===178).length!==1||!a?.gogActivation)return false;
    const enabled=['fire','water','thunder','ice','dragon'].includes(elementType)&&elementValue>0;
    return ['bonusSkillId','name','bonusName','source','rankLevel','required','count'].every(k=>a.gogActivation[k]===e[k])&&a.rank===rank&&a.attackAdd===0&&a.attackMultiplier===1&&a.elementMultiplier===(enabled?rule.multipliers[rank]:1)&&a.elementAdd===(enabled?rule.displayAdds[rank]:0)&&a.condition===rule.condition&&a.appliesToNormal===false&&a.evidenceRef===rule.source;
   }
   if([4,33].includes(e.bonusSkillId)){
    const rows=conversionGroupPlan?.nonDamageEffects?.filter(a=>a.bonusSkillId===e.bonusSkillId)||[];
    return validatedNonDamageBonuses.includes(e)&&activeBonusEffects.filter(a=>a.bonusSkillId===e.bonusSkillId).length===1&&rows.length===1&&['bonusSkillId','name','bonusName','source','rankLevel','required','count','level'].every(k=>rows[0][k]===e[k])&&!(conversionGroupPlan?.applied||[]).some(a=>a.skillId===e.bonusSkillId||a.skill===e.name);
   }
   if(e.bonusSkillId===172){
    const rule=root.MHDarkArtsBodySource,rows=conversionGroupPlan?.applied?.filter(a=>a.skill==='ダークアーツ')||[],a=rows[0];
    if(!rule||!rule.supportedKinds.includes(weapon.kind)||e.name!=='ダークアーツ'||e.bonusName!=='暗黒騎士の証'||e.source!=='series'||e.rankLevel!==1||e.required!==2||!Number.isInteger(e.count)||e.count<2||e.count>=4||rows.length!==1||!a?.darkArtsActivation)return false;
    return ['bonusSkillId','name','bonusName','source','rankLevel','required','count'].every(k=>a.darkArtsActivation[k]===e[k])&&a.attackAdd===0&&a.attackMultiplier===1&&a.elementMultiplier===(rule.highMultiplierKinds.includes(weapon.kind)?rule.highMultiplier:rule.otherMultiplier)&&a.condition==='RECOVERABLE_DAMAGE'&&a.exclusiveGroup==='HEALTH'&&a.appliesToNormal===false&&a.evidenceRef===rule.url&&a.numericOrigin===rule.status;
   }
   if([131,153,173].includes(e.bonusSkillId))return conversionGroupPlan?.applied?.some(a=>a.skillId===e.bonusSkillId&&a.skill===e.name);
   if([34,161,170,180,167].includes(e.bonusSkillId)&&e.rankLevel===1){
    const names=root.MHNonNumericRankOne?.[e.bonusSkillId],rows=conversionGroupPlan?.applied?.filter(a=>a.skillId===e.bonusSkillId)||[],a=rows[0];
    if(!names||e.bonusName!==names[0]||e.name!==names[1]||e.source!=='series'||e.required!==2||!Number.isInteger(e.count)||e.count<2||e.count>=4||rows.length!==1||!a?.rankOneActivation)return false;
    return ['bonusSkillId','name','bonusName','source','rankLevel','required','count'].every(k=>a.rankOneActivation[k]===e[k])&&a.skill===e.name&&a.parent===e.bonusName&&a.rank===1&&a.attackAdd===0&&a.attackMultiplier===1&&a.bonusSource===true&&a.appliesToNormal===true&&a.condition==='NO_DIRECT_HP_EFFECT'&&a.effectDisposition==='non_damage'&&a.scope===(e.bonusSkillId===167?'DURATION_ONLY_EXISTING_ADRENALINE_RUSH_VALUE_UNCHANGED':'FESTIVAL_REWARDS_ONLY')&&a.evidenceRef==='MHDB_JA_SKILLS_20261026:'+e.bonusSkillId&&a.numericOrigin==='MHDB_DESCRIPTION_NO_DAMAGE_COEFFICIENT';
   }
   if([34,161,170,180].includes(e.bonusSkillId)){
    const rows=conversionGroupPlan?.applied?.filter(a=>a.skillId===e.bonusSkillId)||[],a=rows[0];
    if(e.source!=='series'||e.rankLevel!==2||e.required!==4||!Number.isInteger(e.count)||e.count<4||rows.length!==1||!a?.festivalActivation)return false;
    return ['bonusSkillId','name','bonusName','source','rankLevel','required','count'].every(k=>a.festivalActivation[k]===e[k])&&a.skill===e.name&&a.parent===e.bonusName&&a.rank===2&&a.condition==='EXPLICIT_SHARED_FESTIVAL'&&a.appliesToNormal===true&&a.attackAdd===0&&a.maximumAttackMultiplier===1&&[0,34,161,170,180].includes(conditions.festivalId)&&a.festivalId===conditions.festivalId&&a.festivalEnabled===(conditions.festivalId===e.bonusSkillId)&&Number.isFinite(a.attackMultiplier)&&(a.festivalEnabled?a.attackMultiplier>1:a.attackMultiplier===1);
   }
   if(e.bonusSkillId===167){
    const rows=conversionGroupPlan?.applied?.filter(a=>a.skillId===167)||[],a=rows[0],rush=allSkills.filter(x=>Number(x.skillId)===120),level=rush.length?Math.max(...rush.map(x=>x.level)):0;
    if(e.source!=='series'||e.rankLevel!==2||e.required!==4||!Number.isInteger(e.count)||e.count<4||rows.length!==1||!a?.seregiosActivation||rush.some(x=>!Number.isInteger(x.level)||x.level<1||x.level>5))return false;
    return ['bonusSkillId','name','bonusName','source','rankLevel','required','count'].every(k=>a.seregiosActivation[k]===e[k])&&a.skill===e.name&&a.parent===e.bonusName&&a.rank===2&&a.condition==='ADRENALINE_RUSH_REPEAT_EVADE_PREACTIVATED'&&a.appliesToNormal===false&&a.attackAdd===0&&a.attackMultiplier===1&&a.adrenalineRushLevel===level&&a.seregiosEnabled===(level>0)&&Number.isFinite(a.maximumAttackMultiplier)&&(level>0?a.maximumAttackMultiplier>1:a.maximumAttackMultiplier===1);
   }
   if([10,155,115].includes(e.bonusSkillId)){
    const series=e.bonusSkillId===115,rule=root.MHNamedBonusFlatRules?.[series?'series':'group']?.[e.name],rows=conversionGroupPlan?.applied?.filter(a=>a.skillId===e.bonusSkillId)||[],a=rows[0],burst=allSkills.filter(x=>Number(x.skillId)===95),level=burst.length?Math.max(...burst.map(x=>x.level)):0;
    if(!rule||(!series&&rule.skillId!==e.bonusSkillId)||e.bonusName!==rule.parent||e.source!==(series?'series':'group')||e.rankLevel!==(rule.rankLevel||1)||e.required!==(rule.required||3)||!Number.isInteger(e.count)||e.count<e.required||(series&&e.rankLevel===1&&e.count>=4)||rows.length!==1||(series&&burst.some(x=>!Number.isInteger(x.level)||x.level<1||x.level>5)))return false;
    const enabled=!series||level>0;
    return a.skill===e.name&&a.parent===e.bonusName&&a.rank===e.rankLevel&&a.attackAdd===(enabled?rule.attackAdd:0)&&a.attackMultiplier===1&&a.appliesToNormal===false&&a.condition===(enabled?rule.condition:'BURST_INACTIVE_OR_UNRESOLVED');
   }
   if(e.bonusSkillId===162){
    const policy=root.MHSkillExtraDamagePolicies?.[162],rank=e.rankLevel,required=rank===1?2:4,rows=conversionGroupPlan?.applied?.filter(a=>a.skillId===162)||[],a=rows[0];
    if(!policy||policy.bodyEffect!==true||![1,2].includes(rank)||e.name!=='蒼雷一閃'+(rank===1?'Ⅰ':'Ⅱ')||e.bonusName!==policy.name||e.source!=='series'||e.required!==required||!Number.isInteger(e.count)||e.count<required||(rank===1&&e.count>=4)||e.level!==1||skillTotal[e.name]!==e.level||['海竜の渦雷','蒼雷一閃','蒼雷一閃Ⅰ','蒼雷一閃Ⅱ'].some(name=>name!==e.name&&Number(skillTotal[name]||0)!==0)||typeof root.MHWMaxAffinityResolver!=='function'||rows.length!==1||!a?.annotationActivation)return false;
    return ['bonusSkillId','name','level','bonusName','source','rankLevel','required','count'].every(k=>a.annotationActivation[k]===e[k])&&a.skill===e.name&&a.parent===e.bonusName&&a.rank===rank&&a.bodyEffect===true&&a.annotationOnly===true&&a.policy==='FIXED_DAMAGE_SKILL_ANNOTATION_ONLY'&&a.attackAdd===0&&a.attackMultiplier===1&&a.appliesToNormal===true&&Array.isArray(a.excludedComponents)&&a.excludedComponents.length===policy.components.length&&a.excludedComponents.every((x,i)=>x===policy.components[i])&&a.condition==='EXTRA_DAMAGE_EXCLUDED_BODY_EFFECT_RETAINED';
   }
   if([71,149].includes(e.bonusSkillId)){
    const policy=root.MHSkillExtraDamagePolicies?.[e.bonusSkillId],rank=e.rankLevel,required=rank===1?2:4,prefix=e.bonusSkillId===71?'灼熱化':'恨撃',rows=conversionGroupPlan?.applied?.filter(a=>a.skillId===e.bonusSkillId)||[],a=rows[0];
    if(!policy||policy.bodyEffect!==false||![1,2].includes(rank)||e.name!==prefix+(rank===1?'Ⅰ':'Ⅱ')||e.bonusName!==policy.name||e.source!=='series'||e.required!==required||!Number.isInteger(e.count)||e.count<required||(rank===1&&e.count>=4)||rows.length!==1||!a?.annotationActivation)return false;
    return ['bonusSkillId','name','bonusName','source','rankLevel','required','count'].every(k=>a.annotationActivation[k]===e[k])&&a.skill===e.name&&a.parent===e.bonusName&&a.rank===rank&&a.bodyEffect===false&&a.annotationOnly===true&&a.policy==='FIXED_DAMAGE_SKILL_ANNOTATION_ONLY'&&a.attackAdd===0&&a.attackMultiplier===1&&a.appliesToNormal===true&&Array.isArray(a.excludedComponents)&&a.excludedComponents.length===policy.components.length&&a.excludedComponents.every((x,i)=>x===policy.components[i])&&a.condition===(e.bonusSkillId===71?'NOT_INCLUDED_IN_NORMAL_OR_MAXIMUM':'EXTRA_DAMAGE_EXCLUDED_BODY_EFFECT_RETAINED');
   }
   if(e.bonusSkillId===150){
    const rule=root.MHNamedBonusFlatRules?.group?.[e.name],source=root.MHFortifySource,rows=conversionGroupPlan?.applied?.filter(a=>a.skillId===150)||[],a=rows[0],count=conditions.fortifyCount===undefined?source?.maximumDeathCount:conditions.fortifyCount;
    if(e.name!=='不屈'||!rule||!source||e.bonusName!==rule.parent||e.source!=='group'||e.rankLevel!==1||e.required!==3||!Number.isInteger(e.count)||e.count<3||rows.length!==1||!Number.isInteger(count)||count<0||count>source.maximumDeathCount||stats.conditionalConditionPlan?.pending?.some(x=>x.startsWith('不屈:')))return false;
    return a.skill===e.name&&a.parent===e.bonusName&&a.rank===1&&a.attackAdd===0&&a.attackMultiplier===1&&a.appliesToNormal===false&&a.maximumDeathCount===count&&a.maximumAttackMultiplier===source.attackMultipliers[count]&&a.stackingScope==='BASE_TIMES_MULTIPLIERS_THEN_FLATS'&&a.condition===(count===0?'NO_FAINTS':count===1?'FAINTED_ONCE_PREACTIVATED':'FAINTED_TWICE_PREACTIVATED');
   }
   if(e.bonusSkillId===106){
    const rule=root.MHBlackEclipseRule,rank=e.rankLevel,required=rank===1?2:4,b=stats.conditionalConditionPlan?.blackEclipse;
    if(!rule||![1,2].includes(rank)||e.bonusName!=='黒蝕竜の力'||e.name!=='黒蝕一体'+(rank===1?'Ⅰ':'Ⅱ')||e.source!=='series'||e.required!==required||!Number.isInteger(e.count)||e.count<required||(rank===1&&e.count>=4)||!b||b.rank!==rank||!Number.isInteger(b.antivirusLevel)||!Object.hasOwn(rule.antivirusAdds,b.antivirusLevel))return false;
    const applied=conversionGroupPlan?.applied?.filter(a=>a.skillId===106)||[],known=rule.states.includes(conditions.blackEclipseState),expectedAffinity=rule.overcomeAffinity+rule.antivirusAdds[b.antivirusLevel];
    return applied.length===1&&applied[0].skill===e.name&&applied[0].rank===rank&&applied[0].attackAdd===rule.attackByRank[rank].OVERCOME&&applied[0].condition==='MAXIMUM_OVERCOME'&&b.maximumState==='OVERCOME'&&b.maximumAttackAdd===rule.attackByRank[rank].OVERCOME&&b.maximumAffinityAdd===expectedAffinity&&(known?b.normalState===conditions.blackEclipseState&&b.normalAttackAdd===rule.attackByRank[rank][b.normalState]&&b.normalAffinityAdd===(b.normalState==='OVERCOME'?expectedAffinity:0):b.normalState===null&&b.normalAttackAdd===null&&b.normalAffinityAdd===null);
   }
   const rule=root.MHSeriesActivationFlats?.[e.bonusSkillId],rank=e.rankLevel,required=rank===1?2:4;
   if(!rule||![1,2].includes(rank)||e.bonusName!==rule.parent||e.name!==rule.prefix+(rank===1?'Ⅰ':'Ⅱ')||e.source!=='series'||e.required!==required||!Number.isInteger(e.count)||e.count<required||(rank===1&&e.count>=4))return false;
   const applied=conversionGroupPlan?.applied?.filter(a=>a.skillId===e.bonusSkillId)||[];
   return applied.length===1&&applied[0].skill===e.name&&applied[0].rank===rank&&applied[0].attackAdd===rule.adds[rank]&&applied[0].attackMultiplier===1&&applied[0].appliesToNormal===false&&applied[0].condition===rule.condition&&applied[0].scope==='NORMAL_INACTIVE_MAXIMUM_PREACTIVATED';
  })&&Array.isArray(conversionGroupPlan?.unresolvedEffects)&&conversionGroupPlan.unresolvedEffects.length===0&&Array.isArray(conversionSelfPlan?.pending)&&conversionSelfPlan.pending.length===0;
  if(attributeConversionLevel){
   if(!attributeRule||attributeRule.status!=='OWNER_APPROVED_PROVISIONAL'||!Number.isInteger(attributeConversionLevel)||attributeConversionLevel<1||attributeConversionLevel>3)return fail('REAL_SLICE:ATTRIBUTE_CONVERSION_RULE_UNRESOLVED');
   if(elementType!=='dragon'||isReferenceOnly||isShellingOnly||weapon.kind==='switch-axe'||resolvedTechniqueIds.some(id=>techniques[id]?.specialComponents?.length||root.ChargeBladeEngine?.techniques?.[id]?.phial))return fail('REAL_SLICE:ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTED');
   if((attributeState?.normal||attributeState?.maximum)&&(!Number.isInteger(elementValue+attributeRule.adds[attributeConversionLevel])||root.MHWElementCapRule?.status!=='OWNER_APPROVED_PROVISIONAL'||!Number.isFinite(root.MHWElementCapRule?.flat)||!Number.isFinite(root.MHWElementCapRule?.multiplier)||(activeBonusEffects.length&&!conversionResistanceBonusesResolved)))return fail('REAL_SLICE:ATTRIBUTE_CONVERSION_CAP_INTERACTION_UNRESOLVED');
  }

  const waterEntries=allSkills.filter(x=>Number(x.skillId)===181),waterRule=root.MHWaterConversionRule,waterInput=stats.waterResistanceInput;
  let waterConversionAdd=0;
  if(waterEntries.length){
   if(!waterRule||waterEntries.some(x=>x.name!==waterRule.name||x.level!==waterRule.level))return fail('REAL_SLICE:WATER_CONVERSION_LEVEL_INVALID');
   if(!Object.hasOwn(waterRule.coefficients,weapon.kind)||elementType!==waterRule.elementType||resolvedTechniqueIds.some(id=>weapon.kind==='bow'?techniques[id]?.referenceKind!=='bow':!!techniques[id]?.referenceKind||techniques[id]?.hits?.some(h=>h.componentSource)))return fail('REAL_SLICE:WATER_CONVERSION_SCOPE_UNSUPPORTED');
   if(waterInput?.status!=='KNOWN_LIMITED'||!Number.isInteger(waterInput.total)||waterInput.total<0)return fail('REAL_SLICE:WATER_RESISTANCE_UNRESOLVED:'+String(waterInput?.reason||'missing'));
   waterConversionAdd=waterInput.total*waterRule.coefficients[weapon.kind];
  }
  const resistanceConversionLevel=Math.max(...allSkills.filter(x=>x.skillKey==='resistanceConversionThunder').map(x=>x.level),0),resistanceInput=stats.thunderResistanceInput,thunderResistance=resistanceInput?.total,resistanceKinds={"great-sword":5,hammer:5,'hunting-horn':5,'light-bowgun':2,'heavy-bowgun':2},resistanceConversionCoefficient=resistanceKinds[weapon.kind]??4;
  let resistanceConversionAdd=0;
  if(resistanceConversionLevel){
   if(resistanceConversionLevel!==1)return fail('REAL_SLICE:THUNDER_RESISTANCE_CONVERSION_LEVEL_UNSUPPORTED');
   if(elementType!=='thunder'||isReferenceOnly||isShellingOnly||weapon.kind==='switch-axe'||resolvedTechniqueIds.some(id=>(techniques[id]?.specialComponents?.length||root.ChargeBladeEngine?.techniques?.[id]?.phial)))return fail('REAL_SLICE:THUNDER_CONVERSION_BODY_SCOPE_UNSUPPORTED');
   if(resistanceInput?.status!=='KNOWN_LIMITED')return fail('REAL_SLICE:THUNDER_RESISTANCE_UNRESOLVED:'+String(resistanceInput?.reason||'missing'));
   resistanceConversionAdd=thunderResistance*resistanceConversionCoefficient;
   // The adopted common engine caps this body element after the conversion flat.
   const candidate=elementValue+resistanceConversionAdd,capRule=root.MHWElementCapRule;
   if(!Number.isInteger(candidate)||capRule?.status!=='OWNER_APPROVED_PROVISIONAL'||!Number.isFinite(capRule?.flat)||!Number.isFinite(capRule?.multiplier)||(activeBonusEffects.length&&!conversionResistanceBonusesResolved))return fail('REAL_SLICE:THUNDER_CONVERSION_CAP_OR_ROUNDING_SCOPE_UNRESOLVED');
  }
  if(elementSpecial && (!Number.isFinite(elementRawValue)||elementRawValue<0||!elementRule||stats.element!==elementValue||stats.elementType!==elementType))return fail('REAL_SLICE:CALCULATED_ELEMENT_NOT_PROVEN');
  if(!elementSpecial && (!([0,null].includes(stats.element))||stats.elementType&&!['none',''].includes(String(stats.elementType))))return fail('REAL_SLICE:ELEMENT_NOT_ZERO_OR_UNKNOWN');
  const absorptionConversionInput=waterEntries.length?waterInput:resistanceConversionLevel?resistanceInput:null;
  const absorptionConversionPlan=absorptionConversionInput?.absorptionPlan||null;
  const absorptionConversionCoefficient=waterEntries.length?waterRule.coefficients[weapon.kind]:resistanceConversionCoefficient;
  // Normal input remains the equipment resistance; absorbed resistance belongs only to maximum.
  const absorptionMaximumAdd=absorptionConversionPlan?.status==='RESOLVED'?absorptionConversionPlan.maximumResistanceAdd*absorptionConversionCoefficient:0;
  const versions={game:'1.042.00.02',equipment:'mhdb-source-unknown-game-version',technique:'tech-real',effects:'effects-real'};
  const originalConditionPlan=stats.conditionalConditionPlan||null;
  const resolvedConditionPlan=(waterEntries.length||resistanceConversionLevel||attributeConversionLevel)&&originalConditionPlan?{...originalConditionPlan,pending:(originalConditionPlan.pending||[]).filter(x=>!(waterEntries.length&&x==='耐性変換【水】:CONDITIONAL_DAMAGE_FORMULA_PENDING')&&!(resistanceConversionLevel&&x==='耐性変換【雷】:CONDITIONAL_DAMAGE_FORMULA_PENDING')&&!(attributeConversionLevel&&x==='属性変換:CONDITIONAL_DAMAGE_FORMULA_PENDING'))}:originalConditionPlan;
  const bowChargeRule=root.TechniqueDBEngine.get('bow','BOW_STATE_MODIFIERS')?.specialSourceValues?.skillRules?.chargeMaster;
  const bowChargeResolved=weapon.kind==='bow'&&referenceSkills.chargeMaster>0&&bowChargeRule?.component==='ELEMENT_BASE_MULTIPLIER_BEFORE_FLATS'&&allSkills.filter(x=>x.skillKey==='chargeMaster').every(x=>Number(x.skillId)===24&&Number.isInteger(x.level)&&x.level>=1&&x.level<=3&&Object.hasOwn(bowChargeRule.multipliers,x.level))&&resolvedTechniqueIds.every(id=>techniques[id]?.referenceKind==='bow'&&bowChargeRule.techniqueIds.includes(id));
  let conditionPlan=(gsChargeActive||bowChargeResolved)&&resolvedConditionPlan?{...resolvedConditionPlan,pending:(resolvedConditionPlan.pending||[]).filter(x=>!['チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING','Charge Master:CONDITIONAL_DAMAGE_FORMULA_PENDING'].includes(x))}:resolvedConditionPlan;
  // Owner-approved 168 scenario, not Dark Arts 172 and not a dynamic HP timing model.
  const darkPeakScenario=root.MHDarkPeakScenario;
  const darkPeakScoped=conditionPlan?.excluded?.some(x=>x.reason==='DARK_BELOW_FULL_NO_HEALING_MAXIMUM')&&!healthBranchKinds(conditionPlan).required&&darkPeakScenario&&weapon.kind===darkPeakScenario.weaponKind&&resolvedTechniqueIds.length===darkPeakScenario.techniqueIds.length&&resolvedTechniqueIds.every((id,i)=>id===darkPeakScenario.techniqueIds[i]);
  if(darkPeakScoped){const pending=conditionPlan.pending.filter(x=>x!=='暗黒:DARK_STANDARD_SEQUENCE_REQUIRED');conditionPlan={...conditionPlan,pending,status:pending.length?conditionPlan.status:'READY'};}
  if(conditionPlan&&(resistanceConversionLevel||attributeConversionLevel)&&conditionPlan.pending.length===0)conditionPlan.status='READY';
  const gogPlan=conditionPlan?.groupPlan?.applied?.find(x=>x.skillId===178);
  if(gogPlan){
   const unsupported=['light-bowgun','heavy-bowgun'].includes(weapon.kind)||hasShelling||!!hhModel||resolvedTechniqueIds.some(id=>{const t=techniques[id];return t.referenceKind?!['bow','charge-blade-saed'].includes(t.referenceKind):(t.hits||[]).some(h=>h.componentSource);})||(weapon.kind==='switch-axe'&&switchAxeState?.awakened===true);
   if(unsupported)conditionPlan={...conditionPlan,pending:[...(conditionPlan.pending||[]),'GOG:DEDICATED_COMPONENT_NOT_ADOPTED']};
  }
  if(thousandRequested&&(elementType!=='none'||elementRawValue!==0))return fail('BOW_THOUSAND:ELEMENT_NOT_ADOPTED');
  const bladescaleTechnique=resolvedTechniqueIds.length===1?techniques[resolvedTechniqueIds[0]]:null;
  const bladescaleEligible=bladescaleEntries.length>0&&elementType==='none'&&elementRawValue===0&&bladescaleRule.techniques[weapon.kind]?.includes(resolvedTechniqueIds[0])===true&&resolvedTechniqueIds.length===1&&!bladescaleTechnique?.referenceKind&&!hhModel&&!hasShelling&&bladescaleTechnique?.hits?.length===1&&!bladescaleTechnique.hits[0].componentSource&&!(weapon.kind==='switch-axe'&&switchAxeState?.awakened!==false);
  if(bladescaleEntries.length&&!bladescaleEligible)conditionPlan={...conditionPlan,pending:[...(conditionPlan?.pending||[]),'BLADESCALE_FIRST_HIT_SCOPE_PENDING']};
  const explicitAffinityEntries=allSkills.filter(x=>x.skillKey==='explicitAffinity');
  if(conditionPlan&&explicitAffinityEntries.length){const names=new Set(explicitAffinityEntries.flatMap(x=>Number(x.skillId)===39?['濡れ刃紋','Wet Blade Mark']:['抜刀術【技】','抜刀術[技]','Critical Draw']));const pending=conditionPlan.pending.filter(x=>!names.has(x.split(':')[0]));conditionPlan={...conditionPlan,pending,status:pending.length?conditionPlan.status:'READY'};}
  const drawEntry=explicitAffinityEntries.find(x=>Number(x.skillId)===103);
  const referenceDrawCount=(id,t)=>t.referenceKind==='charge-blade-saed'?t.hits?.length:t.referenceKind==='bow'?root.TechniqueDBEngine.hits('bow',id).length:['heavy-bowgun-element','light-bowgun-element'].includes(t.referenceKind)?(t.referenceInput.state.contactPolicy==='EXPLICIT_CONTACTS'?t.referenceInput.state.contacts?.length:1):['heavy-bowgun','light-bowgun'].includes(t.referenceKind)?root.TechniqueDBEngine.get(weapon.kind,id)?.specialSourceValues?.hitCount:1;
  const referenceDrawAdds=(channel,id)=>{if(!drawEntry)return undefined;const t=techniques[id],flags=conditions.criticalDrawHits?.[channel]?.[id];if(!Array.isArray(flags)||flags.length!==referenceDrawCount(id,t)||flags.some(v=>typeof v!=='boolean'))throw Error('CRITICAL_DRAW_HIT_STATE_REQUIRED:'+id);return flags.map(on=>on?root.MHWExplicitAffinityRules.draw[drawEntry.level]:0);};
  const punishingEntry=allSkills.find(x=>Number(x.skillId)===8);
  const referencePunishingAdds=(channel,id)=>{if(!punishingEntry)return undefined;const flags=conditions.punishingDrawHits?.[channel]?.[id];if(!Array.isArray(flags)||flags.length!==referenceDrawCount(id,techniques[id])||flags.some(v=>typeof v!=='boolean'))throw Error('PUNISHING_DRAW_HIT_STATE_REQUIRED:'+id);return flags.map(on=>on?[0,3,5,7][punishingEntry.level]:0);};
  const explicitAffinityEffects=(channel)=>{
   const effects=[],rule=root.MHWExplicitAffinityRules;
   const add=(id,amount,componentIds)=>{for(const target of ['physical','element'])effects.push({id:id+(target==='element'?'-element':''),target,stage:'affinity',unit:'percent',operation:'add',amount,order:84,source:rule.source,condition:{type:'always'},...(componentIds?{componentIds:componentIds(target)}:{})});};
   for(const entry of explicitAffinityEntries){
    if(!Number.isInteger(entry.level)||entry.level<1||entry.level>3)throw Error('EXPLICIT_AFFINITY_LEVEL_INVALID');
    if(Number(entry.skillId)===39){const state=conditions.wetState?.[channel];if(typeof state?.wet!=='boolean'||typeof state?.bubble!=='boolean')throw Error('WET_BUBBLE_STATE_REQUIRED');add('wet-bubble', (state.wet?rule.wet[entry.level]:0)+(state.bubble?rule.bubble[entry.level]:0));}
    else{const map=conditions.criticalDrawHits?.[channel];if(!map||typeof map!=='object'||Array.isArray(map))throw Error('CRITICAL_DRAW_HIT_STATE_REQUIRED');
     if(Object.keys(map).some(id=>!resolvedTechniqueIds.includes(id)))throw Error('CRITICAL_DRAW_UNKNOWN_TECHNIQUE');
     for(const id of new Set(resolvedTechniqueIds)){const t=techniques[id],hits=map[id],n=t.referenceKind?referenceDrawCount(id,t):t.hits.length;if(!Array.isArray(hits)||hits.length!==n||hits.some(x=>typeof x!=='boolean'))throw Error('CRITICAL_DRAW_HIT_STATE_REQUIRED:'+id);
      for(const [i,on] of hits.entries())if(on){if(conditions.mounted===true||conditions.dismountAttack===true||conditions.sneakAttack===true)throw Error('CRITICAL_DRAW_TRIGGER_EXCLUDED');if(t.referenceKind){if(!['bow','heavy-bowgun','light-bowgun','heavy-bowgun-element','light-bowgun-element','charge-blade-saed'].includes(t.referenceKind))throw Error('CRITICAL_DRAW_REFERENCE_HIT_MAPPING_REQUIRED');continue;}add('critical-draw:'+id+':'+i,rule.draw[entry.level],target=>[id+':'+target+':'+i]);}
     }
    }
   }return effects;
  };
  let maximumAffinity=Number(stats.affinity);
  const wexLevel=Math.max(0,...allSkills.filter(x=>Number(x.skillId)===57).map(x=>x.level));
  const damageAffinitySkills={...skillTotal,'弱点特効':0,'Weakness Exploit':0,'抜刀術【技】':0,'抜刀術[技]':0,'Critical Draw':0,'濡れ刃紋':0,'Wet Blade Mark':0,'オメガレゾナンス':0,'レゾナンス':0};
  try{if(typeof root.MHWMaxAffinityResolver!=='function')throw Error('MAX_AFFINITY_RESOLVER_REQUIRED');maximumAffinity=Number(root.MHWMaxAffinityResolver(damageAffinitySkills,Number(stats.affinity),weapon,part,conditions));}catch(error){return fail(String(error.message));}
  const wexEffects=[];
  const wexFor=(targetPart,type)=>root.MHWWeaknessExploitForHit(wexLevel,targetPart,type);
  if(wexLevel)try{
   for(const id of resolvedTechniqueIds){
    const t=techniques[id];
    const add=(index,type,reference=false)=>{const amount=wexFor(part,type);for(const target of ['physical','element'])wexEffects.push({id:'weakness-hit:'+id+':'+index+(target==='element'?'-element':''),target,stage:'affinity',unit:'percent',operation:'add',amount,order:85,componentIds:[id+':'+(reference?'reference':target)+':'+index],source:root.MHWWeaknessExploitRule.source,condition:{type:'always'},damageType:type,wounded:part.wounded===true});};
    if(t.referenceKind){
     if(t.referenceKind==='bow')add(0,'pierce',true);
     else if(t.referenceKind==='charge-blade-saed')add(0,'slash',true);
     // Ammo contacts resolve their own target; noncritical special references receive no affinity effect.
    }else{
     for(const [i,h] of (t.hits||[]).entries())add(i,h.damageType||STANDARD_NORMAL_HIT_CONTRACT[id]?.damageType);
     if(t.saAwakened)for(const [i,mode] of (t.modeContract?.hitModes||t.hits.map(()=>t.stateRequirement?.mode)).entries())if(mode==='SWORD')add(t.hits.length+i,t.saAwakened.damageType);
    }
   }
  }catch(error){return fail(String(error.message));}
  const blackEclipse=conditionPlan?.blackEclipse||null;
  const frenzyAffinity=root.MHResolveFrenzyAffinity(skillTotal,conditions.blackEclipseState);
  const ballisticsLevel=Math.max(0,...allSkills.filter(x=>x.skillKey==='ballistics').map(x=>x.level));
  if(!Number.isInteger(ballisticsLevel)||ballisticsLevel>3)return fail('BALLISTICS_LEVEL_INVALID');
  const criticalRangeAttackAdd=root.MHCommonSkillDamageRules.ballistics.criticalRangeAttackAdds[ballisticsLevel];
  if(criticalRangeAttackAdd&&wyvernRequested)return fail('BALLISTICS_WYVERN_RANGE_SCOPE_UNRESOLVED');
  const maximumElement=Number(conditionPlan?.maximum?.element);
  const provenance={sourceUrl:`https://wilds.mhdb.io/en/weapons/${weapon.id}`,sourceGameVersion:'UNKNOWN',adoptionStatus:'OWNER_APPROVED_PROVISIONAL',targetGameVersion:versions.game,retrievedAt,apiVersion:'UNKNOWN'};
  const normalizedChargeBladeState=chargeBladeState&&typeof chargeBladeState==='object'?{...chargeBladeState,shieldBoostAxeBodyMultiplier:root.ChargeBladeEngine?.shieldBoostAxeBodyMultiplier}:chargeBladeState;
  if(allSkills.some(x=>Number(x.skillId)===129)&&resolvedTechniqueIds.some(id=>!ADOPTED_NO_WOUND_EVENT_IDS.has(id)))return fail('REAL_SLICE:PARTBREAKER_WOUND_EVENT_SCOPE_PENDING');
  if(cornpopperEntries.length){
   const knownBody=['GL_SLAM','GL_SWEEP'];
   if(resolvedTechniqueIds.some(id=>!knownBody.includes(id)&&!['reference:gl_NORMAL','reference:gl_CHARGED','reference:gl_FULL_BURST'].includes(id)))return fail('GL_SHELL:CORNPOPPER_TECHNIQUE_NOT_ADOPTED');
   if(resolvedTechniqueIds.includes('reference:gl_FULL_BURST')&&conditionPlan){const pending=[...(conditionPlan.pending||[]),'GL_SHELL:CORNPOPPER_ACTION_NOT_ADOPTED:FULL_BURST'];conditionPlan={...conditionPlan,pending};}
  }
  const chargeStrikeEntries=allSkills.filter(x=>Number(x.skillId)===83),chargeStrikeEffects=[];
  if(chargeStrikeEntries.length){
   const rule=root.MHChargeStrikeRule;
   if(!rule||weapon.kind!==rule.weaponKind||chargeStrikeEntries.some(x=>x.name!==rule.name||x.level!==rule.level))return fail('REAL_SLICE:CHARGE_STRIKE_CONTRACT_INVALID');
   for(const id of resolvedTechniqueIds){
    if(!Object.hasOwn(rule.hitIndices,id))return fail('REAL_SLICE:CHARGE_STRIKE_TECHNIQUE_NOT_ADOPTED:'+id);
    for(const i of rule.hitIndices[id]){
     if(!techniques[id]?.hits?.[i])return fail('REAL_SLICE:CHARGE_STRIKE_HIT_MAPPING_INVALID');
     chargeStrikeEffects.push({id:'charge-strike:'+id+':'+i,target:'physical',stage:rule.stage,unit:'dimensionless',operation:'multiply',amount:rule.multiplier,order:90,componentIds:[id+':physical:'+i],source:rule.source,status:rule.status,scopeWarning:rule.scopeWarning,liveGameVerification:rule.liveGameVerification,condition:{type:'always'}});
    }
   }
  }
  const airborneEntries=allSkills.filter(x=>Number(x.skillId)===86),airborneEffects=[];
  if(airborneEntries.length){
   const rule=root.MHAirborneHitRule;
   if(!rule||airborneEntries.some(x=>x.name!==rule.name||x.level!==rule.level))return fail('REAL_SLICE:AIRBORNE_SKILL_CONTRACT_INVALID');
   for(const id of resolvedTechniqueIds){
    if(!Object.hasOwn(rule.hitIndices,id))return fail('REAL_SLICE:AIRBORNE_HIT_SCOPE_PENDING:'+id);
    for(const i of rule.hitIndices[id]){
     if(!techniques[id]?.hits?.[i])return fail('REAL_SLICE:AIRBORNE_HIT_MAPPING_INVALID:'+id);
     airborneEffects.push({id:'airborne:'+id+':'+i,target:'physical',stage:rule.stage,unit:'dimensionless',operation:'multiply',amount:rule.multiplier,order:12,componentIds:[id+':physical:'+i],source:rule.source,status:rule.status,condition:{type:'always'}});
    }
   }
  }
  const contextAttackEntries=allSkills.filter(x=>x.skillKey==='contextAttack'),contextAttackEffects=[];
  if(contextAttackEntries.length){

   const rules=root.MHContextAttackSkillRules;
   for(const entry of contextAttackEntries){
    if(!Number.isInteger(entry.level)||entry.level<1||entry.level>3)return fail('REAL_SLICE:CONTEXT_ATTACK_LEVEL_INVALID');
    const rule=Number(entry.skillId)===136?rules.mindsEye:rules.bludgeoner;
    for(const id of resolvedTechniqueIds)for(const [hitIndex,hit] of techniques[id].hits.entries()){
     if(techniques[id].referenceKind||hit.componentSource)continue;
     const damageType=hit.damageType||STANDARD_NORMAL_HIT_CONTRACT[id]?.damageType;
     const originalHitzone=(part.originalMultipliers??(part.wounded===true?null:part.multipliers))?.[damageType];
     if(Number(entry.skillId)===136&&!Number.isFinite(originalHitzone))return fail('REAL_SLICE:ORIGINAL_HITZONE_UNRESOLVED');
     const active=Number(entry.skillId)===136?originalHitzone*100<=rule.originalHitzoneMaximum:rule.colorsByLevel[entry.level].includes(maxSharpness);
     if(active)contextAttackEffects.push({id:'context-attack:'+entry.skillId+':'+id+':'+hitIndex,target:'physical',stage:'attack',unit:'dimensionless',operation:'multiply',amount:rule.multipliers[entry.level],order:12,componentIds:[id+':physical:'+hitIndex],source:rules.source,status:rules.status,condition:{type:'always'},...(Number(entry.skillId)===136?{originalHitzone:{value:originalHitzone*100,damageType,source:'trainingRoomMonster:UNWOUNDED_ORIGINAL'}}:{}),sharpness:maxSharpness});
    }
   }
  }
  const equipment={...weapon,waterConversionAdd,waterResistanceInput:waterInput||null,elementCapRule:root.MHWElementCapRule,...(contextAttackEntries.length?{originalPhysicalHitzones:{...(part.originalMultipliers??part.multipliers)},originalHitzoneSource:part.originalMultipliers?'EXPLICIT_PRE_WOUND_HITZONES':'TRAINING_UNWOUNDED',contextAttackScope:'ADOPTED_MELEE_BODY_ONLY'}:{}),thunderResistanceInput:resistanceInput||null,armorThunderResistanceInput:stats.armorThunderResistanceInput||null,apiId:weapon.id,sharpnessResolution,maxSharpness,maxSharpnessEvidenceRef:normalArtiaWhite?sharpnessPremise.source:provenance.sourceUrl,elementType,rapidMorphLevel,criticalBoostLevel,criticalElementLevel,criticalElementMultiplier:root.MHResolveCriticalElement(weapon.kind,criticalElementLevel),attributeConversionLevel,attributeConversionState:attributeState,resistanceConversionLevel,thunderResistance,resistanceConversionCoefficient,resistanceConversionAdd,chargeBladeState:normalizedChargeBladeState,activeBonusEffects,attackComponents:stats.attackComponents?{weaponBase:Number(stats.attackComponents.weaponBase),normalMultiplier:1,normalFlat:0}:null,elementComponents:{weaponBase:Number(elementRawValue),normalMultiplier:Number(elementRule?.mult??1),normalFlat:Number(elementRule?.add??0)},gsChargeMasterLevel:gsChargeActive?referenceSkills.chargeMaster:0,elementCalculatedValue:elementValue,maximumAffinity,normalAffinity:Number(stats.affinity),maximumElement:Number.isFinite(maximumElement)?maximumElement:null,conditionalAttackMultiplier:Number(conditionPlan?.attackComponents?.conditionalMultiplier??1),groupAttackMultiplier:Number(conditionPlan?.attackComponents?.groupMultiplier??1),conditionalAttackFlat:Number(conditionPlan?.attackComponents?.conditionalFlat??0),conditionalPlanStatus:conditionPlan?.status||'REFERENCE_ONLY',conditionalPending:Array.isArray(conditionPlan?.pending)?conditionPlan.pending:[],elementEvidence:elementSpecial?{sourceUrl:provenance.sourceUrl,raw:elementSpecial.damage.raw,display:elementRawValue,kind:'element'}:{sourceUrl:provenance.sourceUrl,confirmedNone:true},provenance};
  const source={capture:pinned=>({versions:pinned,equipment,effects:{},techniques})};
  const bowSequenceCache=new Map();
  const pipeline=root.HimmelRealOneHitPipeline({versions,source,techniqueId,techniqueIds:resolvedTechniqueIds,weaponType:techniqueKind,
   resolveComponentIssue:({component:c,event})=>{if(!contextAttackEntries.length)return null;const t=techniques[event.techniqueId],special=!['physical','element'].includes(c.kind)||c.parameters?.saFollowup||t?.hits?.[c.parameters?.hitIndex]?.componentSource;if(!special)return null;const activeEntries=contextAttackEntries.filter(x=>Number(x.skillId)===136||root.MHContextAttackSkillRules.bludgeoner.colorsByLevel[x.level].includes(maxSharpness));if(!activeEntries.length)return null;const onlyMindsEye=activeEntries.every(x=>Number(x.skillId)===136);if(onlyMindsEye&&['phial','shelling'].includes(c.kind))return null;if(onlyMindsEye&&t?.referenceKind==='charge-blade-saed'&&root.MHSaedMindsEyeRule.techniqueIds.includes(event.techniqueId))return null;/* Source-confirmed, not live verified: https://a-to-monhan.com/2025/03/31/wilds-donkitukai/ . Normal GL shell only; body effects remain component-scoped and CB phial guard stays. */if(c.kind==='shelling'&&weapon.kind==='gunlance'&&c.parameters?.shellingAction==='NORMAL'&&activeEntries.every(x=>[85,136].includes(Number(x.skillId))))return null;return 'REAL_SLICE:CONTEXT_ATTACK_COMPONENT_SCOPE_PENDING:'+c.id;},
   resolveBuild:(_raw,snapshot)=>({weaponType:techniqueKind,dbVersion:versions.equipment,source:'MHDB_API_CURRENT_SELECTION',equipment:{...snapshot,ids:[`api_id:${snapshot.apiId}`,`game_id:${snapshot.gameId}`],conditionalAttackMultiplier:Number(snapshot.conditionalAttackMultiplier??1),groupAttackMultiplier:Number(snapshot.groupAttackMultiplier??1),conditionalAttackFlat:Number(snapshot.conditionalAttackFlat??0),conditionalPlanStatus:snapshot.conditionalPlanStatus||'REFERENCE_ONLY',conditionalPending:Array.isArray(snapshot.conditionalPending)?snapshot.conditionalPending:[],trueAttack:{status:'known',value:snapshot.damage.raw},displayElement:{status:'known',value:snapshot.elementEvidence.confirmedNone?0:snapshot.elementCalculatedValue},baseAffinity:{status:'known',value:snapshot.affinity},elementType:snapshot.elementType,sourceGameVersion:snapshot.provenance.sourceGameVersion},skills:{entries:allSkills},issues:[{code:'MHDB_SOURCE',apiId:snapshot.apiId,gameId:snapshot.gameId,sourceEndpoint:snapshot.provenance.sourceUrl,apiVersion:snapshot.provenance.apiVersion,retrievedAt:snapshot.provenance.retrievedAt,sourceGameVersion:snapshot.provenance.sourceGameVersion}]}),
   resolveEffects:(build,conditions,channel)=>{if(!blackEclipse&&frenzyAffinity.active&&frenzyAffinity[channel==='normal'?'normalAdd':'maximumAdd']===null)throw Error('FRENZY_STATE_REQUIRED');if(channel==='maximum'&&absorptionConversionPlan?.status==='UNRESOLVED')throw Error(absorptionConversionPlan.reason);if(attributeConversionLevel&&typeof attributeState?.[channel]!=='boolean')throw Error('REAL_SLICE:ATTRIBUTE_CONVERSION_STATE_REQUIRED');const entries=build.skills.entries||[],effects=[...chargeStrikeEffects,...airborneEffects,...contextAttackEffects.filter(e=>!(bladescaleEligible&&channel==='maximum'&&e.id.startsWith('context-attack:85:'))),...wexEffects,...explicitAffinityEffects(channel)].map(x=>({...x})),attack=entries.filter(x=>x.skillKey==='attack'),affinity=entries.filter(x=>x.skillKey==='affinity'),criticalBoost=entries.filter(x=>x.skillKey==='criticalBoost'),elementEntries=entries.filter(x=>['fire','water','thunder','ice','dragon'].includes(x.skillKey));if(channel==='normal')for(const item of conditionPlan?.applied||[])if(item.skill==='研鑽'&&item.appliesToNormal)effects.push({id:'everlasting-normal',target:'physical',stage:'attack',unit:'true-attack',operation:'add',amount:item.attackAdd,order:50,source:item.evidenceRef,condition:{type:'always'}});const selfPending=(conditionPlan?.selfStatePlan?.pending||[]).filter(x=>x.startsWith(channel+':')||(!x.startsWith('normal:')&&!x.startsWith('maximum:')));if(selfPending.length)throw Error(selfPending.join(' / '));for(const e of conditionPlan?.selfStatePlan?.[channel]||[]){
 if(e.attackAdd)effects.push({id:'self-attack:'+e.skillId,target:'physical',stage:'attack',unit:'true-attack',operation:'add',amount:e.attackAdd,order:50,source:e.source,status:e.status,condition:{type:'always'}});
 if(e.affinityAdd)for(const target of ['physical','element'])effects.push({id:'self-affinity:'+e.skillId+(target==='element'?'-element':''),target,stage:'affinity',unit:'percent',operation:'add',amount:e.affinityAdd,order:80,source:e.source,status:e.status,condition:{type:'always'}});
 if(e.elementAdd&&['fire','water','thunder','ice','dragon'].includes(elementType))effects.push({id:'self-element:'+e.skillId,target:'element',stage:'element',unit:'display-element',operation:'add',amount:e.elementAdd,order:50,source:e.source,status:e.status,condition:{type:'always'}});
 if(e.elementAdd&&['light-bowgun','heavy-bowgun'].includes(weapon.kind))throw Error('COOKING:SPECIAL_AMMO_ELEMENT_SCOPE_PENDING');
}if(!blackEclipse&&channel==='normal'&&frenzyAffinity.normalAdd)for(const target of ['physical','element'])effects.push({id:'frenzy-normal-affinity'+(target==='element'?'-element':''),target,stage:'affinity',unit:'percent',operation:'add',amount:frenzyAffinity.normalAdd,order:80,source:frenzyAffinity.source,condition:{type:'always'}});if(blackEclipse&&channel==='normal'){
 if(!blackEclipse.normalState)throw Error('BLACK_ECLIPSE_NORMAL_STATE_REQUIRED');
 if(blackEclipse.normalAttackAdd)effects.push({id:'black-eclipse-normal-attack',target:'physical',stage:'attack',unit:'true-attack',operation:'add',amount:blackEclipse.normalAttackAdd,order:50,source:blackEclipse.source,condition:{type:'always'}});
 if(blackEclipse.normalAffinityAdd)for(const target of ['physical','element'])effects.push({id:'black-eclipse-normal-affinity'+(target==='element'?'-element':''),target,stage:'affinity',unit:'percent',operation:'add',amount:blackEclipse.normalAffinityAdd,order:80,source:blackEclipse.source,condition:{type:'always'}});
} if(ed1Requested&&build.equipment.rapidMorphLevel>1)for(const [id,origins] of Object.entries(dischargeRules.rapidMorphOrigins)){
 if(!resourcePlans[id])continue;
 for(const origin of origins)effects.push({id:'rapid-morph-discharge:'+id+':'+origin,target:'physical',stage:'attack',unit:'dimensionless',operation:'multiply',amount:rapidRule.multipliers[build.equipment.rapidMorphLevel],order:10,source:rapidRule.source,status:rapidRule.status,condition:{type:'state-equals',path:['chargeBlade','previousAction'],value:origin}});
}

if(build.equipment.rapidMorphLevel>1){
 for(const id of new Set(resolvedTechniqueIds)){
  if(!rapidRule.techniqueIds.includes(id))continue;
  effects.push({id:'rapid-morph-attack:'+id,target:'physical',stage:'attack',unit:'dimensionless',operation:'multiply',amount:rapidRule.multipliers[build.equipment.rapidMorphLevel],order:10,source:rapidRule.source,status:rapidRule.status,sourceVersion:rapidRule.sourceVersion,liveGameVerification:rapidRule.liveGameVerification,condition:{type:'event-equals',key:'techniqueId',value:id}});
 }
}if(hhModel)effects.push({id:'hh-self-improvement',target:'physical',stage:'attack',unit:'dimensionless',operation:'multiply',amount:hhModel.selfImprovementMultiplier,order:10,source:hhModel.source,status:hhModel.status,condition:{type:'state-equals',path:['huntingHorn','selfImprovementLevel'],value:hhModel.selfImprovementCap}});if(hhModel&&huntingHornState.attackMelody)for(let rank=1;rank<=hhModel.attackMelodyCap;rank++)effects.push({id:'hh-attack-melody-rank:'+rank,target:'physical',stage:'attack',unit:'dimensionless',operation:'multiply',amount:hhModel.attackMelodies[huntingHornState.attackMelody][rank],order:11,source:hhModel.attackMelodyAdoption.source,status:hhModel.status,condition:{type:'state-equals',path:['huntingHorn','attackMelodyLevel'],value:rank}});
if(saAwakened)effects.push({id:saAwakened.elementEffectId,elementCapBaseScaling:true,target:'element',stage:'element',unit:'dimensionless',operation:'multiply',amount:saAwakened.explosionElementMultiplier[weapon.phial.kind],order:25,source:saAwakened.source,status:saAwakened.status,condition:{type:'always'}});
const powerPhial=root.MHWeaponEffectDB?.switchAxe?.powerPhialSword,elementPhial=root.MHWeaponEffectDB?.switchAxe?.powerElementPhialSword;if(build.weaponType==='switch-axe'){const phialKind=build.equipment?.phial?.kind;if(phialKind==='power'){if(!powerPhial)throw Error('REAL_SLICE:SA_POWER_PHIAL_DEFINITION_UNRESOLVED');effects.push({...powerPhial,condition:{type:'state-equals',path:['switchAxe','mode'],value:'SWORD'}});}else if(phialKind==='element'){if(!elementPhial)throw Error('REAL_SLICE:SA_POWER_ELEMENT_PHIAL_DEFINITION_UNRESOLVED');if(elementPhial.status!=='OWNER_APPROVED_PROVISIONAL')throw Error('REAL_SLICE:SA_POWER_ELEMENT_PHIAL_APPROVAL_PENDING');effects.push({...elementPhial,elementCapBaseScaling:true,condition:{type:'state-equals',path:['switchAxe','mode'],value:'SWORD'}});}else throw Error('REAL_SLICE:SA_PHIAL_EFFECT_UNRESOLVED:'+String(phialKind||'missing')); }if(build.equipment.gsChargeMasterLevel>0){for(const id of gsCharge.techniqueIds)effects.push({id:'gs-charge-master:'+id,target:'element',stage:'element',unit:'dimensionless',operation:'multiply',amount:gsCharge.multipliers[build.equipment.gsChargeMasterLevel],order:25,source:gsCharge.source,status:gsCharge.status,sourceVersion:gsCharge.sourceVersion,liveGameVerification:gsCharge.liveGameVerification,condition:{type:'event-equals',key:'techniqueId',value:id}});}if(attack.length){if(!root.MHWAttackSkillResolver)throw Error('REAL_SLICE:ATTACK_RULE_UNAVAILABLE');const level=Math.max(...attack.map(x=>x.level)),rule=root.MHWAttackSkillResolver({攻撃:level});if(!Number.isFinite(Number(rule.flat))||!Number.isFinite(Number(rule.mult)))throw Error('REAL_SLICE:ATTACK_RULE_INVALID');effects.push({id:'attack-boost-multiply',target:'physical',stage:'attack',unit:'dimensionless',amount:Number(rule.mult),operation:'multiply',order:10,source:'index.html:calcAttackSkill',condition:{type:'always'}},{id:'attack-boost-flat',target:'physical',stage:'attack',unit:'true-attack',amount:Number(rule.flat),operation:'add',order:40,source:'index.html:calcAttackSkill',condition:{type:'always'}});}const punishingDraw=entries.find(x=>Number(x.skillId)===8);if(punishingDraw){if(!Number.isInteger(punishingDraw.level)||punishingDraw.level<1||punishingDraw.level>3)throw Error('REAL_SLICE:PUNISHING_DRAW_LEVEL_INVALID');const map=conditions.punishingDrawHits?.[channel];if(!map||typeof map!=='object'||Array.isArray(map)||Object.keys(map).some(id=>!resolvedTechniqueIds.includes(id)))throw Error('PUNISHING_DRAW_HIT_STATE_REQUIRED');for(const id of new Set(resolvedTechniqueIds)){const t=techniques[id],flags=map[id];if(!Array.isArray(flags)||flags.length!==(t.referenceKind?referenceDrawCount(id,t):t.hits.length)||flags.some(x=>typeof x!=='boolean'))throw Error('PUNISHING_DRAW_HIT_STATE_REQUIRED:'+id);for(const [i,on] of flags.entries())if(on){if(conditions.mounted===true||conditions.dismountAttack===true||conditions.sneakAttack===true)throw Error('PUNISHING_DRAW_TRIGGER_EXCLUDED');if(t.referenceKind){if(!['bow','heavy-bowgun','light-bowgun','heavy-bowgun-element','light-bowgun-element','charge-blade-saed'].includes(t.referenceKind))throw Error('PUNISHING_DRAW_REFERENCE_MAPPING_PENDING:'+id);continue;}effects.push({id:'punishing-draw-flat:'+id+':'+i,target:'physical',stage:'attack',unit:'true-attack',amount:[0,3,5,7][punishingDraw.level],operation:'add',order:40,componentIds:[id+':physical:'+i],source:'MACARONGAMEMO_DAMAGE_UP_2025-04-16;MACARONGAMEMO_SKILLS_LIST_2025-03-08',condition:{type:'always'}});}}}if(affinity.length){if(!root.MHWAffinitySkillResolver)throw Error('REAL_SLICE:AFFINITY_RULE_UNAVAILABLE');const level=Math.max(...affinity.map(x=>x.level)),amount=Number(root.MHWAffinitySkillResolver({'見切り':level}));if(!Number.isFinite(amount))throw Error('REAL_SLICE:AFFINITY_RULE_INVALID');if(amount)effects.push({id:'critical-eye-affinity',target:'physical',stage:'affinity',unit:'percent',amount,operation:'add',order:30,source:'index.html:calcAffinityBonus',condition:{type:'always'}},{id:'critical-eye-affinity-element',target:'element',stage:'affinity',unit:'percent',amount,operation:'add',order:30,source:'index.html:calcAffinityBonus',condition:{type:'always'}});}if(criticalBoost.length){const level=Math.max(...criticalBoost.map(x=>x.level));if(!Number.isInteger(level)||level<1||level>5)throw Error('REAL_SLICE:CRITICAL_BOOST_LEVEL_UNSUPPORTED');}if(Number(build.equipment.groupAttackMultiplier??1)!==1)effects.push({id:'set-group-attack-multiply',target:'physical',stage:'attack',unit:'dimensionless',amount:Number(build.equipment.groupAttackMultiplier),operation:'multiply',order:20,source:'index.html:standardGroupPowerPlan',condition:{type:'always'}});if(channel==='maximum'&&Number(build.equipment.conditionalAttackMultiplier??1)!==1){effects.push({id:'conditional-attack-multiply',target:'physical',stage:'attack',unit:'dimensionless',amount:Number(build.equipment.conditionalAttackMultiplier),operation:'multiply',order:30,source:'index.html:standardPowerConditionPlan',condition:{type:'always'}});}if(build.equipment.attributeConversionLevel&&build.equipment.attributeConversionState?.[channel]===true){effects.push({id:'attribute-conversion-element-add',target:'element',stage:'element',unit:'display-element',amount:attributeRule.adds[build.equipment.attributeConversionLevel],operation:'add',order:60,source:attributeRule.source,status:attributeRule.status,scope:attributeRule.scope,condition:{type:'always'}});}if(channel==='maximum'&&absorptionMaximumAdd)effects.push({id:'absorption-resistance-conversion-element-add',target:'element',stage:'element',unit:'display-element',amount:absorptionMaximumAdd,operation:'add',order:60,source:absorptionConversionPlan.sourceUrl,status:absorptionConversionPlan.adoptionStatus,scope:absorptionConversionPlan.condition,condition:{type:'always'}});if(waterEntries.length&&waterConversionAdd!==0)effects.push({id:'water-resistance-conversion-element-add',target:'element',stage:'element',unit:'display-element',amount:waterConversionAdd,operation:'add',order:60,source:waterRule.source,status:waterRule.status,scope:waterRule.scope,condition:{type:'always'}});if(Number(build.equipment.resistanceConversionAdd??0)!==0){effects.push({id:'thunder-resistance-conversion-element-add',target:'element',stage:'element',unit:'display-element',amount:Number(build.equipment.resistanceConversionAdd),operation:'add',order:60,source:'KUROYONHON_SKILL_TABLE_THUNDER_RESISTANCE_CONVERSION_20261025',status:'OWNER_APPROVED_PROVISIONAL',scope:'THUNDER_WEAPON_BODY_EQUIPMENT_ONLY',verificationStatus:'UNVERIFIED',condition:{type:'always'}});}if(channel==='maximum'&&Number(build.equipment.conditionalAttackFlat??0)!==0){effects.push({id:'conditional-attack-flat',target:'physical',stage:'attack',unit:'true-attack',amount:Number(build.equipment.conditionalAttackFlat),operation:'add',order:50,source:'index.html:standardPowerConditionPlan',condition:{type:'always'}});}if(elementEntries.length){for(const entry of elementEntries)if(!Number.isInteger(entry.level)||entry.level<1||entry.level>3)throw Error('REAL_SLICE:ELEMENT_SKILL_LEVEL_UNSUPPORTED');}if(channel==='maximum'&&Number.isFinite(Number(build.equipment.maximumAffinity))&&Number(build.equipment.maximumAffinity)!==Number(build.affinity))effects.push({id:'conditional-affinity-maximum',target:'physical',stage:'affinity',unit:'percent',amount:Number(build.equipment.maximumAffinity)-Number(build.equipment.normalAffinity??build.affinity),operation:'add',order:80,source:'index.html:calcMaxAffinity',condition:{type:'always'}},{id:'conditional-affinity-maximum-element',target:'element',stage:'affinity',unit:'percent',amount:Number(build.equipment.maximumAffinity)-Number(build.equipment.normalAffinity??build.affinity),operation:'add',order:80,source:'index.html:calcMaxAffinity',condition:{type:'always'}});if(channel==='maximum'&&conditionPlan?.maximumElementComponents){const base=build.equipment.elementComponents,next=conditionPlan.maximumElementComponents;const dark=conditionPlan.groupPlan?.applied?.find(x=>x.skill==='ダークアーツ'),darkMultiplier=dark?.elementMultiplier??1;const ratio=next.normalMultiplier/base.normalMultiplier/darkMultiplier;if(darkMultiplier!==1)effects.push({id:'dark-arts-body-element-multiplier',target:'element',stage:'element',unit:'dimensionless',operation:'multiply',amount:darkMultiplier,order:30,componentIds:resolvedTechniqueIds.flatMap(id=>(techniques[id].hits||[]).flatMap((h,i)=>h.componentSource?[]:[id+':element:'+i])),source:dark.evidenceRef,status:dark.numericOrigin,scope:'ADOPTED_BODY_ONLY_NO_GENERATED_FOLLOWUP',condition:{type:'always'}});if(ratio!==1)effects.push({id:'conditional-element-multiplier',target:'element',stage:'element',unit:'dimensionless',operation:'multiply',amount:ratio,order:30,source:'index.html:standardPowerConditionPlan',condition:{type:'always'}});if(next.conditionalFlat)effects.push({id:'conditional-element-flat',flatComponent:'conditional',target:'element',stage:'element',unit:'display-element',operation:'add',amount:next.conditionalFlat,order:80,source:'index.html:standardPowerConditionPlan',condition:{type:'always'}});}else if(channel==='maximum'&&Number.isFinite(Number(build.equipment.maximumElement))&&Number(build.equipment.maximumElement)!==Number(build.element))effects.push({id:'conditional-element-maximum',flatComponent:'conditional',target:'element',stage:'element',unit:'display-element',amount:Number(build.equipment.maximumElement)-Number(build.element),operation:'add',order:80,source:'index.html:standardPowerConditionPlan',condition:{type:'always'}});for(const target of ['physical','element'])effects.push({id:'affinity-upper-cap'+(target==='element'?'-element':''),target,stage:'affinity',unit:'percent',operation:'cap',amount:100,order:100,source:'index.html:calcMaxAffinity;common critical probability upper bound',condition:{type:'always'}});const unresolved=(conditionPlan?.groupPlan?.unresolvedEffects||[]).map(x=>({...x}));if(activeBonusEffects.length&&!conditionPlan?.groupPlan)unresolved.push({id:'bonus-plan',reason:'BONUS_CONDITION_PLAN_MISSING',target:'all',source:'index.html:standardPowerConditionPlan'});if(channel==='maximum')for(const reason of build.equipment.conditionalPending||[])if(!unresolved.some(x=>x.reason===reason))unresolved.push({id:'conditional:'+reason,reason,target:'all',source:'index.html:standardPowerConditionPlan'});return {effects,unresolved};},resolveSkillApplicability:entries=>entries.map(entry=>{
    if(rapidRequested&&Number(entry.skillId)===23)return {...entry,effectDisposition:'resolved',reason:rapidShotRule.scope,evidenceRef:rapidShotRule.skillSource};
    if(Number(entry.skillId)===163&&bladescaleEntries.length)return {...entry,effectDisposition:'resolved',reason:bladescaleRule.scope,evidenceRef:bladescaleRule.source};
    if(Number(entry.skillId)===159&&cornpopperEntries.length)return {...entry,effectDisposition:'resolved',reason:cornpopperRule.scopeWarning,evidenceRef:cornpopperRule.evidenceRef};
    // MHDB target descriptions: rapid/special/piercing ammunition are not ordinary normal shots.
    // Scope to adopted normal-ammo IDs; leave target techniques and invalid states/levels unresolved.
    const normalAmmoOnly=resolvedTechniqueIds.length>0&&resolvedTechniqueIds.every(id=>weapon.kind==='light-bowgun'?/^LBG_NORMAL_AMMO_[12]$/.test(id):weapon.kind==='heavy-bowgun'&&/^HBG_NORMAL_AMMO_[123]$/.test(id));
    const normalAmmoState=weapon.kind==='light-bowgun'?lightBowgunState:hbgState;
    if(thousandRequested&&[69,94].includes(Number(entry.skillId)))return {...entry,effectDisposition:'resolved',reason:thousandRule.scope,evidenceRef:thousandRule.skillSource};
    const normalAmmoExclusion={23:{name:'速射強化',max:1},69:{name:'特殊射撃強化',max:2},94:{name:'貫通弾・竜の矢強化',max:1}}[entry.skillId];
    if(normalAmmoOnly&&normalAmmoState?.ammoType==='NORMAL'&&(weapon.kind!=='light-bowgun'||normalAmmoState.shotMode==='NORMAL')&&normalAmmoExclusion&&entry.name===normalAmmoExclusion.name&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=normalAmmoExclusion.max)return {...entry,effectDisposition:'non_damage',reason:'NOT_APPLICABLE_TO_ADOPTED_NON_RAPID_NORMAL_AMMO',evidenceRef:'MHDB_JA_SKILLS_20261026:'+entry.skillId};
    if(Number(entry.skillId)===84&&entry.name==='水耐性'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3&&waterEntries.length&&waterInput?.status==='KNOWN_LIMITED')return {...entry,effectDisposition:'resolved',reason:'water resistance consumed once by validated conversion producer',evidenceRef:waterRule.source};if(Number(entry.skillId)===181)return {...entry,effectDisposition:'resolved',reason:waterRule.scope,evidenceRef:waterRule.source};if(Number(entry.skillId)===83)return {...entry,effectDisposition:'resolved',reason:root.MHChargeStrikeRule.scopeWarning,evidenceRef:root.MHChargeStrikeRule.source};if(Number(entry.skillId)===86)return {...entry,effectDisposition:'resolved',reason:'source-mapped physical attack stage for adopted dual-blades dance Hits only; other routes remain pending',evidenceRef:root.MHAirborneHitRule.source};const capability={5:['爆破ビン追加','BLAST'],44:['麻痺ビン追加','PARALYSIS'],65:['減気ビン追加','EXHAUST'],79:['睡眠ビン追加','SLEEP'],116:['毒ビン追加','POISON']}[entry.skillId];if(capability&&entry.name===capability[0]&&entry.level===1&&weapon.kind==='bow'&&['NONE','POWER','CLOSE_RANGE'].includes(bowState?.coating))return {...entry,effectDisposition:'non_damage',reason:'UNUSED_COATING_CAPABILITY_ONLY',evidenceRef:'MHDB_JA_SKILLS_20261026:'+entry.skillId};if(entry.skillKey==='explicitAffinity')return {...entry,effectDisposition:'resolved',reason:'explicit channel state and per-Hit affinity; display maximum excluded',evidenceRef:root.MHWExplicitAffinityRules.source};if(entry.skillKey==='contextAttack')return {...entry,effectDisposition:'resolved',reason:'validated per-component attack multiplier',evidenceRef:root.MHContextAttackSkillRules.source};if(entry.skillKey==='ballistics')return {...entry,effectDisposition:'resolved',reason:'explicit reference shot physical attack only at critical range; Lv1/2 range is an input',evidenceRef:root.MHCommonSkillDamageRules.source};if(frenzyAffinity.active&&Number(entry.skillId)===18&&['無我の境地','Antivirus'].includes(entry.name)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'resolved',reason:'explicit frenzy affinity supplied once by shared normal/maximum resolver',evidenceRef:frenzyAffinity.source};const extra=annotationPolicy(entry);if(extra&&!extra.bodyEffect)return {...entry,effectDisposition:'resolved',reason:'owner-defined indicator excludes skill extra damage; annotation only',evidenceRef:'MHDB_JA_SKILLS_20261026:'+entry.skillId};const internal=INTERNAL_SKILL_ADOPTION[entry.name];if(internal){if(entry.skillId==null)throw Error('REAL_SLICE:SKILL_ID_UNRESOLVED:'+entry.name);if(internal.requiredSkillId!==undefined&&(Number(entry.skillId)!==internal.requiredSkillId||!Number.isInteger(entry.level)||entry.level<1||entry.level>internal.maxLevel))throw Error('REAL_SLICE:NON_DAMAGE_SKILL_CONTRACT_MISMATCH:'+entry.name);return {...entry,...internal,evidenceRef:`${internal.evidenceRef}:skillId=${entry.skillId}:level=${entry.level}`};}if(activeBonusEffectNames.has(String(entry.name)))return {...entry,effectDisposition:conditionPlan?.groupPlan?.unresolvedEffects?.some(x=>x.id==='bonus:'+entry.name)?'unresolved':'resolved',reason:'active series/group effect is accounted by the shared plan; unresolved entries prevent channel execution',evidenceRef:'index.html:standardGroupPowerPlan'};if(entry.damageRelated===false||['defense','utility','survival','non_damage'].includes(String(entry.effectCategory||'').toLowerCase()))return {...entry,effectDisposition:'non_damage',reason:'DB effect classification excludes direct HP damage',evidenceRef:entry.source+':skillId='+entry.skillId+':effectCategory='+entry.effectCategory};if(entry.skillKey==='slugger'&&String(entry.skillId)==='36'&&Number.isInteger(entry.level)&&entry.level===1)return {...entry,effectDisposition:'non_damage',reason:'stun accumulation only; no HP-damage modifier',evidenceRef:`MHDB skill.id=36;level=1;${entry.source}`};if(entry.skillKey==='focus'&&(String(entry.skillId)==='60'||entry.skillId==null)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'non_damage',reason:'charge/gauge timing only; no direct HP-damage modifier',evidenceRef:`MHDB skill.id=60;level=${entry.level};${entry.source}`};if((entry.name==='強化持続'||entry.name==='Power Prolonger')&&(String(entry.skillId)==='104'||entry.skillId==null)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'non_damage',reason:'enhanced-state duration only; no direct HP-damage modifier',evidenceRef:`MHDB skill.id=104;level=${entry.level};${entry.source}`};if((entry.name==='弾導強化'||entry.name==='Ballistics')&&(String(entry.skillId)==='53'||entry.skillId==null)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'non_damage',reason:'range-extension state only; explicit range input controls reference damage',evidenceRef:`MHDB skill.id=53;level=${entry.level};${entry.source}`};if(entry.skillKey==='attack'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=5)return {...entry,effectDisposition:'resolved',reason:'HP attack effect is resolved by the shared L3 effect list',evidenceRef:'index.html:calcAttackSkill'};if(entry.skillKey==='affinity'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=5)return {...entry,effectDisposition:'resolved',reason:'critical-eye affinity is resolved by the shared L3 effect list',evidenceRef:'index.html:calcAffinityBonus'};if(entry.skillKey==='rapidMorph')return {...entry,effectDisposition:'resolved',reason:'owner-approved CB/SA attack-stage rule; attribute and explosion components excluded; conditional follow-up routes remain gated',evidenceRef:rapidRule.source,status:rapidRule.status};if(entry.skillKey==='conditionalAffinity'){const rule=CONDITIONAL_AFFINITY_SKILLS[entry.name];if(!rule||Number(entry.skillId)!==rule.id||!Number.isInteger(entry.level)||entry.level<1||entry.level>rule.max)throw Error('REAL_SLICE:CONDITIONAL_AFFINITY_ID_OR_LEVEL_INVALID:'+entry.name);return {...entry,effectDisposition:'resolved',reason:'maximum-only affinity is already supplied by calcMaxAffinity to both physical and elemental L3 effects',evidenceRef:'index.html:calcMaxAffinity;MHDB:skill:'+rule.id};}if(entry.skillKey==='selfState'&&conditionPlan?.selfStatePlan?.ids.includes(Number(entry.skillId)))return {...entry,effectDisposition:'resolved',reason:'explicit self-state effects; missing conditions remain channel issues',evidenceRef:'https://kuroyonhon.com/mhwilds/program/skill.php'};if(entry.skillKey==='handicraft'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=5)return {...entry,effectDisposition:'resolved',reason:'MHDB highest attained color shared by both channels; fixed owner Artia premise preserved; ranged not applicable',evidenceRef:'https://docs.wilds.mhdb.io/#handicraft'};if(entry.skillKey==='thunderResistance'&&entry.skillId===156&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'resolved',reason:'MHDB rank contributes once to equipment thunder resistance',evidenceRef:'MHDB_SKILL_156'};if(entry.skillKey==='criticalBoost'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=5)return {...entry,effectDisposition:'resolved',reason:'critical multiplier is supplied to the canonical Formula',evidenceRef:'index.html:criticalMultiplierForState'};if(entry.skillKey==='conditionalAttack'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=5)return {...entry,effectDisposition:'resolved',reason:'conditional attack effect is resolved by the shared condition plan or explicit hit condition',evidenceRef:'index.html:standardPowerConditionPlan'};if(entry.skillKey==='attributeConversion'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'resolved',reason:'龍属性武器への明示バフ加算のみ。追撃は別イベントとして未接続',evidenceRef:'KUROYONHON_SKILL_TABLE_ATTRIBUTE_CONVERSION_20261025'};if(entry.skillKey==='resistanceConversionThunder'&&Number.isInteger(entry.level)&&entry.level===1)return {...entry,effectDisposition:'resolved',reason:'雷属性かつ有限非負の総雷耐性を明示した場合だけ属性加算',evidenceRef:'KUROYONHON_SKILL_TABLE_THUNDER_RESISTANCE_CONVERSION_20261025'};if(entry.skillKey==='shelling'&&Number.isInteger(entry.level)&&entry.level>=0&&entry.level<=3)return {...entry,effectDisposition:'resolved',reason:'shelling formula consumes the explicit artillery/load-shells state',evidenceRef:'gunlance-shell-reference.js'};if(['normalUp','spreadUp','chargeMaster','criticalElement','bladescaleLoading','firstShot','forceShot'].includes(entry.skillKey)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'resolved',reason:'dedicated ranged Formula consumes the explicit skill level and Technique DB rule',evidenceRef:({normalUp:'index.html:TECHNIQUE_DB_R113_BOW_STATE:BOW_R113_SKILL_SOURCE',spreadUp:'index.html:TECHNIQUE_DB_R113_BOW_STATE:BOW_R113_SKILL_SOURCE',chargeMaster:'index.html:TECHNIQUE_DB_R113_BOW_STATE:BOW_R113_CHARGE_SOURCE',criticalElement:'index.html:TECHNIQUE_DB_R114_BOW_STATE:BOW_R114_CRITICAL_ELEMENT_SOURCE',bladescaleLoading:'index.html:BOW_R115_BLADESCALE_SOURCE',firstShot:'index.html:BOW_R116_FIRST_SHOT_SOURCE',forceShot:'index.html:BOW_R117_FORCE_SOURCE'})[entry.skillKey]};if(['fire','water','thunder','ice','dragon'].includes(entry.skillKey)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'resolved',reason:'element value is resolved by the shared L3 effect list',evidenceRef:'index.html:calcElementSkill'};throw Error('REAL_SLICE:SKILL_EFFECT_NOT_PROVEN:'+entry.name);}),initialState:(_build,channel)=>{const state=rapidRequested?{lightBowgun:{loadedRounds:lightBowgunState.loadedRounds}}:hhModel?{huntingHorn:{selfImprovementLevel:huntingHornState.selfImprovementLevel,attackMelodyLevel:huntingHornState.attackMelodyLevel}}:weapon.kind==='switch-axe'?{switchAxe:{mode:switchAxeState.mode}}:ed1Requested?{chargeBlade:{previousAction:chargeBladeState.previousAction,normalPhials:chargeBladeState.normalPhials,...(chargeBladeState.enhancedPhials!=null?{enhancedPhials:chargeBladeState.enhancedPhials}:{})}}:hasShelling?{gunlance:{loadedRounds:gunlanceState?.loadedRounds}}:{};if(bladescaleEntries.length)state.bladescaleFirstHit=bladescaleEligible&&channel==='maximum';return state;},
   shellingFormula:hasShelling?({coefficient,parameters,build,stats,state,channel})=>{if(resolvedTechniqueIds.length!==1&&!parameters.shellingResource)return {status:'unavailable',reason:'REAL_SLICE:GL_SEQUENCE_STATE_TRANSITION_UNRESOLVED'};if(typeof root.GunlanceShellReference?.calculate!=='function'||typeof root.MHWGenericProfileDamage!=='function')return {status:'unavailable',reason:'REAL_SLICE:SHELLING_FORMULA_UNAVAILABLE'};try{const input=parameters.shellingInput||{},r=root.GunlanceShellReference.calculate({action:parameters.shellingAction,weaponShellMetadata:{type:weapon.shell,level:weapon.shellLevel},offensiveGuardLevel:guardEntries.length?Math.max(...guardEntries.map(x=>x.level)):0,offensiveGuardActive:guardEntries.length>0&&channel==='maximum',cornpopperLevel:cornpopperEntries.length?cornpopperRule.level:0,cornpopperActive:cornpopperEntries.length>0&&channel==='maximum',state:parameters.shellingResource?{...input.shellingState,loadedRounds:state?.gunlance?.loadedRounds}:input.shellingState,weaponBaseAttack:stats.attack,loadShellsLevel:input.loadShellsLevel,artilleryLevel:input.artilleryLevel,normalAttackComponents:stats.attackComponents,unreviewedSkills:input.unreviewedSkills.filter(name=>!(channel==='normal'&&gogPlan&&name===gogPlan.skill)&&!adoptedBonusAttackName(name)&&!(blackEclipse&&(['黒蝕一体Ⅰ','黒蝕一体Ⅱ','無我の境地','Antivirus'].includes(name))))},root.TechniqueDBEngine,root.MHWGenericProfileDamage);return r&&Number.isFinite(r.total)?{status:'available',value:r.total}:{status:'unavailable',reason:'REAL_SLICE:SHELLING_RESULT_UNRESOLVED'};}catch(error){return {status:'unavailable',reason:String(error?.message||error)}}}:null,
   phialFormula:({parameters,stats,build,channel})=>{const state=parameters?.phialState;if(!state||typeof state!=='object')return {status:'unavailable',reason:'REAL_SLICE:CB_PHIAL_STATE_REQUIRED'};if(typeof state.shieldBoosted!=='boolean'||typeof state.enhancedPhial!=='boolean')return {status:'unavailable',reason:'REAL_SLICE:CB_PHIAL_STATE_INCOMPLETE'};if(!Number.isInteger(state.artilleryLevel)||state.artilleryLevel<0||state.artilleryLevel>3)return {status:'unavailable',reason:'REAL_SLICE:CB_ARTILLERY_LEVEL_UNRESOLVED'};if(!Number.isInteger(parameters.phialCount)||parameters.phialCount<1)return {status:'unavailable',reason:'REAL_SLICE:CB_PHIAL_COUNT_UNRESOLVED'};const type=state.phialType;if(type!=='IMPACT'&&type!=='POWER_ELEMENT')return {status:'unavailable',reason:'REAL_SLICE:CB_PHIAL_TYPE_REQUIRED'};const t=root.ChargeBladeEngine?.techniques?.[parameters.sourceTechniqueId],f=root.ChargeBladeEngine?.formulas,coef=typeof root.ChargeBladeEngine?.phialCoefficient==='function'?root.ChargeBladeEngine.phialCoefficient(t,type,state.enhancedPhial):null;if(!t?.phial||!f||!Number.isFinite(coef))return {status:'unavailable',reason:'REAL_SLICE:CB_PHIAL_COEFFICIENT_UNRESOLVED'};const artilleryLevel=state.artilleryLevel,attackComponents=stats.attackComponents||state.attackComponents;if(type==='IMPACT'&&artilleryLevel>0){if(!Number.isFinite(Number(state.artilleryMultiplier))||!Number.isFinite(Number(state.baseAttack)))return {status:'unavailable',reason:'REAL_SLICE:CB_ARTILLERY_MULTIPLIER_UNRESOLVED'};if(!attackComponents||!Number.isFinite(attackComponents.normalMultiplier)||!Number.isFinite(attackComponents.normalFlat))return {status:'unavailable',reason:'REAL_SLICE:CB_ARTILLERY_ATTACK_ORDER_PENDING'};}try{const elementalHitzone=state.elementalHitzone??(build?.elementType?part?.multipliers?.[build.elementType]*100:null);let value;if(type==='IMPACT'){const mult=Number(attackComponents?.normalMultiplier??1),flat=Number(attackComponents?.normalFlat??0),base=Number(attackComponents?.weaponBase??stats.attack);if(!Number.isFinite(mult)||!Number.isFinite(flat)||!Number.isFinite(base))return {status:'unavailable',reason:'REAL_SLICE:CB_ARTILLERY_ATTACK_ORDER_PENDING'};value=f.IMPACT_PHIAL.evaluate({baseAttack:base,coefficient:coef,shieldBoosted:state.shieldBoosted,artilleryMultiplier:type==='IMPACT'?Number(state.artilleryMultiplier??1):1,attackMultiplier:mult,attackFlat:flat});}else value=f.POWER_ELEMENT_PHIAL.evaluate({displayedElement:Number(stats.element),coefficient:coef,elementalHitzone,shieldBoosted:state.shieldBoosted,elementKnown:true,typeKnown:true,elementType:build?.elementType,elementStatus:build?.equipment?.elementStatus,elementReason:build?.equipment?.elementReason});const total=value*parameters.phialCount;return Number.isFinite(total)?{status:'available',value:total,...(parameters.consumption?{details:{consumption:parameters.consumption,phialType:type,enhancedPhial:state.enhancedPhial,coefficient:coef,explosionHitCount:parameters.phialCount,source:'index.html:CHARGE_BLADE_TECHNIQUES.'+parameters.sourceTechniqueId+'.phial'}}:{})}:{status:'unavailable',reason:'REAL_SLICE:CB_PHIAL_RESULT_UNRESOLVED'};}catch(error){return {status:'unavailable',reason:String(error?.message||error)}}},
   referenceFormula:hasReference?(({parameters,build,stats,channel})=>{const kind=parameters.referenceKind,input=parameters.referenceInput||{},state=input.state;if(kind!=='hunting-horn-model-event'&&(!state||typeof state!=='object'))return {status:'unavailable',reason:'REAL_SLICE:REFERENCE_STATE_REQUIRED'};const criticalMultiplier=1.25+[0,.03,.06,.09,.12,.15][Number(input.criticalBoostLevel)||0];try{let r;if(kind==='heavy-bowgun-wyvern'){
 if(typeof root.HBGWyvernReference?.calculate!=='function')return {status:'unavailable',reason:'HBG_WYVERN:FORMULA_UNAVAILABLE'};
 const fireHitzone=part?.multipliers?.fire;
 if(!Number.isFinite(fireHitzone))return {status:'unavailable',reason:'HBG_WYVERN:FIRE_HITZONE_UNRESOLVED'};
 const result=root.HBGWyvernReference.calculate({...state,...input.skills,fireHitzone:fireHitzone*100,attackComponents:stats.attackComponents,unreviewedSkills:[]},root.TechniqueDBEngine);
 return {status:'available',value:result.total,details:result};
}else if(['heavy-bowgun-element','light-bowgun-element'].includes(kind)){
 if(state.contacts!==undefined&&state.contactPolicy!=='EXPLICIT_CONTACTS')return {status:'unavailable',reason:'HBG_ELEMENT:EXPLICIT_CONTACT_POLICY_REQUIRED'};
 if(kind==='light-bowgun-element'&&(state.shotMode!=='NORMAL'||state.range!=='CRITICAL'||!['FIRST_HIT','EXPLICIT_CONTACTS'].includes(state.contactPolicy)||state.weaponAmmoEntry?.rapid!==false))return {status:'unavailable',reason:'LBG_ELEMENT:NON_RAPID_CRITICAL_FIRST_HIT_REQUIRED'};
 if(resolvedTechniqueIds.length!==1)return {status:'unavailable',reason:'HBG_ELEMENT:SINGLE_REFERENCE_REQUIRED'};
 if(!['fire','water','thunder','ice'].includes(state.elementType)||!state.weaponAmmoEntry||!Number.isInteger(state.magazineCapacity)||state.magazineCapacity<1)return {status:'unavailable',reason:'HBG_ELEMENT:WEAPON_AMMO_UNRESOLVED'};
 if(state.normalModeLevel!==0||conditions.mounted===true)return {status:'unavailable',reason:'HBG_ELEMENT:SPECIAL_MODE_UNSUPPORTED'};
 if(build.equipment.artiaCalculationEvidence?.capacityEvidence?.bonus>0)return {status:'unavailable',reason:'HBG_ELEMENT:CAPACITY_RESTORE_UNSUPPORTED'};
 if(allSkills.some(x=>['chargeMaster','bladescaleLoading','attributeConversion','resistanceConversionThunder'].includes(x.skillKey)))return {status:'unavailable',reason:'HBG_ELEMENT:SKILL_INTERACTION_UNSUPPORTED'};
 const unresolvedBonus=activeBonusEffects.filter(e=>!(conditionPlan?.groupPlan?.applied||[]).some(x=>x.skill===e.name)&&!(conditionPlan?.groupPlan?.nonDamageEffects||[]).some(x=>x.name===e.name));
 if(unresolvedBonus.length)return {status:'unavailable',reason:'HBG_ELEMENT:BONUS_EFFECT_UNRESOLVED'};
 if(channel==='maximum'&&(conditionPlan?.applied||[]).some(x=>(Number(x.elementAdd)||0)!==0||(x.elementMultiplier!=null&&x.elementMultiplier!==1)))return {status:'unavailable',reason:'HBG_ELEMENT:CONDITIONAL_ELEMENT_SCOPE_UNSUPPORTED'};
 const attackParts=stats.attackComponents;
 if(!attackParts||!['weaponBase','normalMultiplier','normalFlat'].every(k=>typeof attackParts[k]==='number'&&Number.isFinite(attackParts[k]))||Math.abs(attackParts.weaponBase*attackParts.normalMultiplier+attackParts.normalFlat-stats.attack)>1e-7)return {status:'unavailable',reason:'HBG_ELEMENT:ATTACK_COMPONENTS_INCONSISTENT'};
 const baseElementRule=root.MHWElementSkillResolver?.(skillTotal,state.elementType),ammoElementCondition=conditionPlan?.ammoElementCondition?.[channel];
 const rule=baseElementRule?{...baseElementRule,mult:baseElementRule.mult*(ammoElementCondition?.multiplier??1),add:baseElementRule.add+(ammoElementCondition?.flat??0)}:null,hz=part?.multipliers?.pierce,ehz=part?.multipliers?.[state.elementType];
 if(!rule||!Number.isFinite(hz)||!Number.isFinite(ehz))return {status:'unavailable',reason:'HBG_ELEMENT:INPUT_UNRESOLVED'};
 const shotRules=root.TechniqueDBEngine.get(build.weaponType,build.weaponType==='light-bowgun'?'LBG_NORMAL_REFERENCE_RULES':'HBG_NORMAL_REFERENCE_RULES')?.specialSourceValues?.shotSkills;
 const shotBonus=root.BowgunNormalReference.shotSkillBonuses({firstShot:input.skills.firstShot,forceShot:input.skills.forceShot},state,shotRules);
 const drawAdds=referenceDrawAdds(channel,parameters.sourceTechniqueId),punishingAdds=referencePunishingAdds(channel,parameters.sourceTechniqueId);
 const ammoContacts=state.contacts?.map((c,i)=>({...c,hitAttackAdd:punishingAdds?.[i]??0,resolvedAffinity:Math.min(100,Number(stats.affinity)+shotBonus.shotAffinityAdd+(drawAdds?.[i]??0)+wexFor({multipliers:{pierce:c.physicalHitzone/100},...(c.originalPhysicalHitzone!==undefined?{originalMultipliers:{pierce:c.originalPhysicalHitzone/100}}:{}),wounded:c.wounded??false},'pierce'))}));
 const ammoAffinity=Math.min(100,Number(stats.affinity)+shotBonus.shotAffinityAdd+(state.contactPolicy==='EXPLICIT_CONTACTS'?0:(drawAdds?.[0]??0)+wexFor(part,'pierce')));
 r=root.BowgunElementReference[state.contactPolicy==='EXPLICIT_CONTACTS'?'contactSequence':'firstHit']({contacts:ammoContacts,weaponKind:build.weaponType,ammoLevel:state.ammoLevel,range:state.range,attack:Number(stats.attack),shotAttackAdd:shotBonus.shotAttackAdd,hitAttackAdd:state.contactPolicy==='EXPLICIT_CONTACTS'?0:(punishingAdds?.[0]??0),criticalRangeAttackAdd,elementCriticalMultiplier:build.equipment.criticalElementMultiplier,affinity:ammoAffinity,criticalMultiplier,physicalHitzone:hz*100,elementalHitzone:ehz*100,elementMultiplier:rule.mult*shotBonus.shotElementMultiplier,elementFlat:rule.add},root.TechniqueDBEngine);
 r={...r,shotSkills:shotBonus};
 return {status:'available',value:r.total,details:{...r,state,elementRule:rule,ammoElementCondition:conditionPlan?.ammoElementCondition??null,elementCapStatus:'OWNER_APPROVED_VER_1_04',attackInput:stats.attack,attackComponents:{...attackParts},attackScope:'RESOLVED_ATTACK_FOR_PHYSICAL_AND_ATTACK_DEPENDENT_ELEMENT;RANGE_ADD_PHYSICAL_ONLY;ELEMENT_FLAT_OUTSIDE'}};
}else if(kind==='hunting-horn-model-event'){
 const hz=build.elementType==='none'&&stats.element===0?0:part?.multipliers?.[build.elementType];
 if(!Number.isFinite(hz))return {status:'unavailable',reason:'REAL_SLICE:HH_EVENT_INPUT_UNRESOLVED'};
 try{const value=root.BuildComparisonEngine.huntingHornSpecialSourceEstimate({baseAttack:stats.attack,displayedElement:stats.element,elementalHitzone:hz*100},[{techniqueId:parameters.hhRecord.techniqueId,count:parameters.hhCount,evidenceRef:parameters.adoption.approval}]);return {status:'available',value:value.sourceEstimateTotal,details:{status:'OWNER_APPROVED_PROVISIONAL',physical:value.physical,element:value.element,fixed:value.fixed,trace:value.trace,rounding:value.rounding,scenarioCountsAdopted:true,attack:stats.attack,adoption:parameters.adoption}};}catch(error){return {status:'unavailable',reason:error.message};}
}else if(kind==='hunting-horn-sound'){if(typeof root.BuildComparisonEngine?.huntingHornSpecialSourceEstimate!=='function')return {status:'unavailable',reason:'REAL_SLICE:HH_SOURCE_ESTIMATE_UNAVAILABLE'};if(!Array.isArray(state.events)||state.events.length!==1)return {status:'unavailable',reason:'REAL_SLICE:HH_EXPLICIT_SINGLE_EVENT_REQUIRED'};const ehz=build.elementType?part?.multipliers?.[build.elementType]:0;if(!Number.isFinite(ehz))return {status:'unavailable',reason:'REAL_SLICE:HH_ELEMENT_HITZONE_UNRESOLVED'};try{r=root.BuildComparisonEngine.huntingHornSpecialSourceEstimate({baseAttack:Number(stats.attack),displayedElement:Number(stats.element||0),elementalHitzone:ehz*100},state.events);}catch(error){return {status:'unavailable',reason:String(error?.message||error)}}return {status:'unavailable',reason:'REAL_SLICE:HH_SOURCE_ESTIMATE_ONLY_FORMAL_TOTAL_EXCLUDED',details:{status:r.status,sourceEstimateTotal:r.sourceEstimateTotal,physical:r.physical,element:r.element,fixed:r.fixed,rounding:r.rounding,trace:r.trace}};}else if(kind==='charge-blade-saed'){if(resolvedTechniqueIds.length>1)return {status:'unavailable',reason:'REAL_SLICE:CB_SEQUENCE_STATE_TRANSITION_UNRESOLVED'};if(['shieldBoosted','axeBoosted','enhancedPhial'].some(k=>typeof state[k]!=='boolean'))return {status:'unavailable',reason:'REAL_SLICE:CB_SAED_STATE_REQUIRED'};if(typeof root.ChargeBladeEngine?.resolveTechniqueDamage!=='function')return {status:'unavailable',reason:'REAL_SLICE:CB_REFERENCE_UNAVAILABLE'};const sharp=root.MHWWeaponMaxSharpness.resolve(build.equipment,{rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]})?.options;if(!sharp)return {status:'unavailable',reason:'REAL_SLICE:CB_SHARPNESS_UNRESOLVED'};const mindEntry=contextAttackEntries.find(x=>Number(x.skillId)===136);let bodyMind={};if(mindEntry){
 const rule=root.MHSaedMindsEyeRule;if(!rule?.techniqueIds.includes(parameters.sourceTechniqueId))return {status:'unavailable',reason:'CB_SAED:MINDS_EYE_TECHNIQUE_NOT_ADOPTED'};
 const original=(part.originalMultipliers??(part.wounded===true?null:part.multipliers))?.slash;
 if(!Number.isFinite(original))return {status:'unavailable',reason:'CB_SAED:ORIGINAL_HITZONE_UNRESOLVED'};
 const basis=stats.attackComponents;if(!basis||!['weaponBase','normalMultiplier','normalFlat'].every(k=>typeof basis[k]==='number'&&Number.isFinite(basis[k]))||Math.abs(basis.weaponBase*basis.normalMultiplier+basis.normalFlat-stats.attack)>1e-7)return {status:'unavailable',reason:'CB_SAED:BODY_ATTACK_COMPONENTS_INCONSISTENT'};
 bodyMind={bodyAttackBasis:{...basis},bodyAttackMultiplier:original*100<=rule.multiplierRule.originalHitzoneMaximum?rule.multiplierRule.multipliers[mindEntry.level]:1,bodyAttackAdoption:{...rule,originalSlashHitzone:original*100,currentSlashHitzone:part.multipliers.slash*100}};
}r=root.ChargeBladeEngine.resolveTechniqueDamage(parameters.sourceTechniqueId,{...bodyMind,bodyHitAttackAdds:referencePunishingAdds(channel,parameters.sourceTechniqueId),bodyHitAffinityAdds:referenceDrawAdds(channel,parameters.sourceTechniqueId),baseAttack:Number(stats.attack),displayedElement:Number(stats.element||0),physicalHitzone:Number(part?.multipliers?.slash||0)*100,elementalHitzone:Number(build.elementType?part?.multipliers?.[build.elementType]||0:0)*100,sharpnessPhysical:sharp.sharpnessPhysicalMultiplier,sharpnessElement:sharp.sharpnessElementMultiplier,affinity:Number(stats.affinity),criticalMultiplier,negativeCriticalMultiplier:.75,elementCriticalMultiplier:build.equipment.criticalElementMultiplier,elementType:build.elementType||build.equipment?.elementType,elementKnown:true,typeKnown:true},state);}else if(kind==='bow'&&parameters.sourceTechniqueId==='BOW_THOUSAND_DRAGONS'){
 const result=root.BowReference.thousandDragons({attack:Number(stats.attack),affinity:Number(stats.affinity),criticalMultiplier,element:Number(stats.element),specialAmmoLevel:Math.max(0,...specialAmmoEntries.map(x=>x.level)),pierceUpLevel:Math.max(0,...thousandPierceEntries.map(x=>x.level)),state,physicalHitzone:Number(part?.multipliers?.pierce)*100},root.TechniqueDBEngine);
 return {status:'available',value:result.total,details:result};
}else if(kind==='bow'){if(typeof root.BowReference?.technique!=='function')return {status:'unavailable',reason:'REAL_SLICE:BOW_REFERENCE_UNAVAILABLE'};const hz=part?.multipliers?.pierce,ehz=build.elementType?part?.multipliers?.[build.elementType]:0;if(!Number.isFinite(hz)||Number(build.element||0)>0&&!Number.isFinite(ehz))return {status:'unavailable',reason:'REAL_SLICE:RANGED_HITZONE_UNRESOLVED'};const bowSkills=input.skills||{},fixedIds=root.TechniqueDBEngine.get('bow','BOW_STATE_MODIFIERS')?.specialSourceValues?.skillRules?.bladescaleLoading?.techniqueIds;
const sequenceRequired=Number(bowSkills.bladescaleLoading)>0||Number(bowSkills.forceShot)>0;
if(sequenceRequired&&(!Array.isArray(fixedIds)||resolvedTechniqueIds.length!==fixedIds.length||resolvedTechniqueIds.some((id,i)=>id!==fixedIds[i])))return {status:'unavailable',reason:'REAL_SLICE:BOW_FIXED_THREE_SHOT_ROUTE_REQUIRED'};
// Match the existing maximum-condition policy; no uptime or arbitrary-shot assumption.
const active=channel==='maximum'&&Number(bowSkills.bladescaleLoading)>0;
const hitAffinityAdds=drawEntry?Object.fromEntries(resolvedTechniqueIds.map(id=>[id,referenceDrawAdds(channel,id)])):undefined;
const hitAttackAdds=punishingEntry?Object.fromEntries(resolvedTechniqueIds.map(id=>[id,referencePunishingAdds(channel,id)])):undefined;
const options={hitAttackAdds,hitAffinityAdds,attack:Number(stats.attack)+(state.range==='CRITICAL'?criticalRangeAttackAdd:0),criticalElementMultiplier:build.equipment.criticalElementMultiplier,element:stats.element,elementBasis:stats.elementComponents??null,skills:bowSkills,bladescaleLoadingActive:active,affinity:Number(stats.affinity),criticalMultiplier,physicalHitzone:hz*100,elementalHitzone:Number(ehz||0)*100,state};
if(sequenceRequired){
 const key=JSON.stringify({channel,options});let sequence=bowSequenceCache.get(key);
 if(!sequence){sequence=root.BowReference.standard(options,root.TechniqueDBEngine,resolvedTechniqueIds);bowSequenceCache.set(key,sequence);}
 const id=parameters.sourceTechniqueId,stage=resolvedTechniqueIds.indexOf(id),trace=sequence.trace.filter(hit=>hit.techniqueId===id);
 if(stage<0||!trace.length)return {status:'unavailable',reason:'REAL_SLICE:BOW_STAGE_UNRESOLVED'};
 const value=trace.reduce((sum,hit)=>sum+hit.physical+hit.element,0);
 return Number.isFinite(value)?{status:'available',value,details:{scope:'FIXED_THREE_SHOT_SOURCE_REFERENCE',effectiveDisplayedElement:sequence.effectiveDisplayedElement,elementBasis:sequence.elementBasis,physical:trace.reduce((n,h)=>n+h.physical,0),trace,forceShotStage:sequence.forceShot.stages[stage],bladescaleStage:sequence.bladescaleLoading.stages[stage]||null,bladescaleStatus:sequence.bladescaleLoading.status}}:{status:'unavailable',reason:'REAL_SLICE:BOW_STAGE_NON_FINITE'};
}
r=root.BowReference.technique(options,root.TechniqueDBEngine,parameters.sourceTechniqueId);
}else if(parameters.sourceTechniqueId==='LBG_NORMAL_RAPID_1'){
 r=root.BowgunNormalReference.rapidHit({state,hitIndex:parameters.hitIndex,normalUp:Number(input.skills?.normalUp||0),attack:Number(stats.attack)+criticalRangeAttackAdd,affinity:Number(stats.affinity),criticalMultiplier,physicalHitzone:part?.multipliers?.pierce*100,rapidUp:rapidEntries.length?rapidShotRule.skillLevel:0},root.TechniqueDBEngine);
}else{if(typeof root.BowgunNormalReference?.shot!=='function')return {status:'unavailable',reason:'REAL_SLICE:BOWGUN_REFERENCE_UNAVAILABLE'};const hz=part?.multipliers?.pierce,expected=Number(String(parameters.sourceTechniqueId).match(/^(?:HBG|LBG)_NORMAL_AMMO_([0-9]+)$/)?.[1]||0);if(!Number.isFinite(hz)||!Number.isInteger(state.ammoLevel)||state.ammoLevel!==expected)return {status:'unavailable',reason:'REAL_SLICE:BOWGUN_STATE_UNRESOLVED'};if(kind==='heavy-bowgun'&&(!state.weaponAmmoEntry||String(state.weaponAmmoEntry.kind).toLowerCase()!=='normal'||Number(state.weaponAmmoEntry.level)!==expected))return {status:'unavailable',reason:'REAL_SLICE:HBG_AMMO_NOT_SUPPORTED_BY_WEAPON'};if(state.ammoType!=='NORMAL'||state.range!=='CRITICAL'||state.contactPolicy!=='ALL_THREE'||!Number.isInteger(state.normalModeLevel)||state.normalModeLevel<0||state.normalModeLevel>2)return {status:'unavailable',reason:'REAL_SLICE:BOWGUN_STATE_UNRESOLVED'};r=root.BowgunNormalReference.shot({hitAttackAdds:referencePunishingAdds(channel,parameters.sourceTechniqueId),hitAffinityAdds:referenceDrawAdds(channel,parameters.sourceTechniqueId),weaponKind:kind,attack:Number(stats.attack)+(state.range==='CRITICAL'?criticalRangeAttackAdd:0),affinity:Number(stats.affinity),criticalMultiplier,physicalHitzone:hz*100,normalUp:Number(input.skills?.normalUp||0),firstShot:Number(input.skills?.firstShot||0),forceShot:Number(input.skills?.forceShot||0),state},root.TechniqueDBEngine);}const value=Number(r?.total??r?.comparisonPower);return Number.isFinite(value)?{status:'available',value,...(kind==='charge-blade-saed'?{details:{status:r.status,verificationStatus:r.verificationStatus,dps:r.dps,components:r.components,trace:r.trace}}:['bow','heavy-bowgun','light-bowgun'].includes(kind)?{details:{state:r.state,scope:r.scope||'FIXED_BOW_STANDARD_SOURCE_REFERENCE',trace:r.trace,...(kind==='bow'?{effectiveDisplayedElement:r.effectiveDisplayedElement,elementBasis:r.elementBasis,physical:r.physical,element:r.element}:{})}}:{})}:{status:'unavailable',reason:'REAL_SLICE:REFERENCE_RESULT_UNRESOLVED'};}catch(error){return {status:'unavailable',reason:String(error?.message||error)}}}):null,
   canonicalPhysical:{expectedGameVersion:versions.game,
    resolveSharpness:({build,state})=>{if(bladescaleEligible&&state?.bladescaleFirstHit===true)return {value:bladescaleRule.physicalSharpness,gameVersion:versions.game,evidenceRef:bladescaleRule.coefficientSource,sourceGameVersion:bladescaleRule.sourceVersion,status:bladescaleRule.status};const r=root.MHWWeaponMaxSharpness.resolve(build.equipment,{rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]});if(!r.options)throw Error('REAL_SLICE:SHARPNESS_UNRESOLVED');return {value:r.options.sharpnessPhysicalMultiplier,gameVersion:versions.game,evidenceRef:r.options.sharpnessEvidenceRef,sourceGameVersion:build.equipment.provenance.sourceGameVersion,status:'PROVISIONAL'};},
    resolveElementSharpness:({build})=>{const r=root.MHWWeaponMaxSharpness.resolve(build.equipment,{rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]});if(!r.options)throw Error('REAL_SLICE:ELEMENT_SHARPNESS_UNRESOLVED');return {value:r.options.sharpnessElementMultiplier,gameVersion:versions.game,evidenceRef:r.options.sharpnessEvidenceRef,sourceGameVersion:build.equipment.provenance.sourceGameVersion,status:'PROVISIONAL'};},
    resolveHitzone:({parameters}={})=>{const key=parameters?.damageType||physicalKey,value=part.multipliers?.[key];if(typeof value!=='number'||!Number.isFinite(value))throw Error('REAL_SLICE:TRAINING_HITZONE_UNRESOLVED:'+key);return {value:value*100,gameVersion:versions.game,evidenceRef:`index.html:trainingRoomMonster:training-front:${key}`,sourceGameVersion:provenance.sourceGameVersion,status:'PRODUCT_REFERENCE'};},
    resolveElementHitzone:()=>{if(!elementSpecial)return {value:0,gameVersion:versions.game,evidenceRef:`index.html:trainingRoomMonster:training-front:none`,sourceGameVersion:provenance.sourceGameVersion,status:'PRODUCT_REFERENCE'};const value=part.multipliers?.[elementType];if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1)throw Error('REAL_SLICE:ELEMENT_HITZONE_UNRESOLVED');return {value:value*100,gameVersion:versions.game,evidenceRef:`index.html:trainingRoomMonster:training-front:${elementType}`,sourceGameVersion:provenance.sourceGameVersion,status:'PRODUCT_REFERENCE'};},
    resolvePartModifier:({parameters})=>({value:parameters.partModifier,gameVersion:versions.game,evidenceRef:parameters.partModifierSource}),
    calculate:root.damageFromParams}});
  const baseAttack=stats?.attackComponents?.weaponBase,baseElement=stats?.elementComponents?.weaponBase,baseAffinity=weapon.affinity;
  const stateStatsByState=weapon.kind==='insect-glaive'&&Number.isFinite(baseAttack)&&Number.isFinite(baseElement)&&Number.isFinite(baseAffinity)?{NO_EXTRACT:{attack:baseAttack,attackComponents:{weaponBase:baseAttack,normalMultiplier:1,normalFlat:0},element:elementValue,affinity:baseAffinity},TRIPLE_EXTRACT:{attack:baseAttack*1.15,attackComponents:{weaponBase:baseAttack,normalMultiplier:1.15,normalFlat:0},element:elementValue,affinity:baseAffinity}}:conditions?.stateStatsByState;
  const pipelineConditions={...(conditions||{})};
  const selectedStateBundle={
   'insect-glaive':insectGlaiveState,
   'hunting-horn':huntingHornState,
   'light-bowgun':lightBowgunState,
   'gunlance':gunlanceState,
   'bow':bowState,
   'heavy-bowgun':hbgState,
   'charge-blade':chargeBladeState,
   'dual-blades':dualBladesState,
   'long-sword':longSwordState,
   'switch-axe':switchAxeState
  }[weapon.kind]||null;
  for(const bundle of [selectedStateBundle]){
   if(!bundle||typeof bundle!=='object')continue;
   for(const [key,value] of Object.entries(bundle))if(!Object.prototype.hasOwnProperty.call(pipelineConditions,key)&&value!==null&&value!==undefined)pipelineConditions[key]=value;
  }
  const profileStartState=conditions?.standardEvaluation===true?root.BuildComparisonEngine?.profileCatalog?.[weapon.kind]?.startState||{}:{};
  if(conditions?.standardEvaluation===true){
   for(const id of resolvedTechniqueIds){
    const record=techniqueDb?.get?.(techniqueKind,id),requirement=record?.stateRequirement||{};
    for(const [key,expected] of Object.entries(requirement))if(!Object.prototype.hasOwnProperty.call(pipelineConditions,key)&&Object.prototype.hasOwnProperty.call(profileStartState,key)&&Object.is(profileStartState[key],expected))pipelineConditions[key]=profileStartState[key];
   }
  }
  if(stateStatsByState){pipelineConditions.stateStatsByState=stateStatsByState;pipelineConditions.stateStatsSource='MACARONGAMEMO_DAMAGE_UP_2025-04-16_PROVISIONAL';}
  try{const evaluated=pipeline.evaluate({schemaVersion:'v10-min2',build:{weapon:'current-selection'},target:{id:'training-room',hitZoneKey:'training-front'},conditions:pipelineConditions,evaluation:{mode:'combo',kind:'combo',signature:'current-selection-reference-combo',techniqueIds:resolvedTechniqueIds}});
   const originalConditionKey=evaluated.conditionKey;
   if(bladescaleEntries.length)for(const [channel,result] of Object.entries(evaluated.channels||{}))result.diagnostics={...result.diagnostics,bladescaleFirstHit:{...bladescaleRule,eligible:bladescaleEligible,active:bladescaleEligible&&channel==='maximum',originalSharpness:maxSharpness}};
   if(gogPlan)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,gogElementAdoption:root.MHGogElementRule};
   if(cornpopperEntries.length)for(const [channel,result] of Object.entries(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',cornpopper:{...cornpopperRule,active:channel==='maximum'}};
   if(blackEclipse)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,blackEclipse,formalStatus:'PROVISIONAL'};
   const normalSkillAnnotations=allSkills.filter(x=>annotationPolicy(x)&&![71,149,162].includes(x.skillId)).map(x=>({skill:x.name,skillId:x.skillId,level:x.level,policy:'FIXED_DAMAGE_SKILL_ANNOTATION_ONLY',excludedComponents:annotationPolicy(x).components,bodyEffect:annotationPolicy(x).bodyEffect,...(annotationPolicy(x).durationMultiplier?{durationMultiplier:annotationPolicy(x).durationMultiplier}:{}),evidenceRef:'MHDB_JA_SKILLS_20261026:'+x.skillId}));
   const excludedSkillDamage=[...(conditionPlan?.groupPlan?.applied||[]).filter(x=>x.annotationOnly),...normalSkillAnnotations].map(x=>{
    const note={...x,additionalDamage:{status:'unavailable',reason:'ANNOTATION_FORMULA_OR_INPUT_UNRESOLVED',includedInPower:false}};
    if(['灼熱化Ⅰ','灼熱化Ⅱ'].includes(x.skill))try{
      if(allSkills.some(s=>s.skillId===96))throw Error('WHITE_FLAME_SCORCH_ANNOTATION_INTERACTION_UNRESOLVED');
      const fireHitzone=part?.multipliers?.fire,fireAttack=Math.max(0,...allSkills.filter(s=>s.skillKey==='fire').map(s=>s.level));
      if(!Number.isFinite(fireHitzone))throw Error('FIRE_HITZONE_UNRESOLVED');
      const result=root.ScorchReference.damage({rank:'upper',level:x.skill==='灼熱化Ⅰ'?1:2,fireAttack,fireHitzone:fireHitzone*100});
      note.additionalDamage={status:'available',fixed:result.fixed,element:result.element,total:result.total,fireHitzone:result.fireHitzone,fireAttack:result.fireAttack,scope:result.scope,evidence:result.evidence,includedInPower:false};
    }catch(error){note.additionalDamage={status:'unavailable',reason:String(error?.message||error),includedInPower:false};}
    return note;
   });
   if(excludedSkillDamage.length)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,excludedSkillDamage};
   if(resolvedTechniqueIds.some(id=>['heavy-bowgun-element','light-bowgun-element'].includes(techniques[id]?.referenceKind)))for(const result of Object.values(evaluated.channels||{})){
    const contactState=weapon.kind==='light-bowgun'?lightBowgunState:hbgState;
    const sequence=contactState?.contactPolicy==='EXPLICIT_CONTACTS';
    const scope=sequence?(weapon.kind==='light-bowgun'?'LBG_EXPLICIT_CONTACT_SEQUENCE':'HBG_EXPLICIT_CONTACT_SEQUENCE'):'FIRST_HIT_ONLY_NOT_WHOLE_SHOT';
    if(sequence)evaluated.conditionKey=JSON.stringify({commonConditions:originalConditionKey,scope,contacts:contactState.contacts,elementType:contactState.elementType||contactState.ammoType,ammoLevel:contactState.ammoLevel});
    result.diagnostics={...result.diagnostics,formalStatus:sequence||weapon.kind==='light-bowgun'?'PROVISIONAL':'UNVERIFIED',referenceOnly:!sequence,referenceScope:scope,contactModel:sequence?techniques[weapon.kind==='light-bowgun'?'LBG_ELEMENT_FIRST_HIT_REFERENCE':'HBG_ELEMENT_FIRST_HIT_REFERENCE'].specialSourceValues.contactModel:null,adoption:weapon.kind==='light-bowgun'?{status:technique.adoptionStatus,approval:technique.approval,evidenceRefs:technique.evidenceRefs,liveGameVerification:technique.liveGameVerification}:undefined};
    if(sequence&&result.metrics?.comboTotalDamage)result.metrics.comboTotalDamage.scope=scope;
    if(!sequence&&result.metrics){result.metrics.firstHitReference={...result.metrics.comboTotalDamage,scope};result.metrics.comboTotalDamage={status:'unavailable',value:null,reason:scope};}
   }
   if(weapon.kind==='insect-glaive'){evaluated.conditionKey=String(evaluated.conditionKey||'')+'|IG_BODY_ONLY_KINSECT_EXCLUDED';for(const result of Object.values(evaluated.channels||{})){result.diagnostics={...result.diagnostics,calculationScope:'IG_BODY_ONLY_KINSECT_EXCLUDED',excludedComponents:[{id:'KINSECT_DAMAGE',reason:'OWNER_SCOPE_EXCLUDED'}]};if(result.metrics?.comboTotalDamage)result.metrics.comboTotalDamage.scope='IG_BODY_ONLY_KINSECT_EXCLUDED';}}
   if(hhModel)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',hhEventModel:{...hhModel,input:huntingHornState},scope:hhModel.scope};
   if(weapon.kind==='switch-axe')for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',referenceOnly:!saAwakened,referenceScope:saAwakened?saAwakened.scope:'NON_AWAKENED_BODY_PHIAL_MODIFIERS_MODE_ONLY_GAUGE_UNMODELED',awakenedModel:saAwakened,modeContracts:resolvedTechniqueIds.map(id=>({techniqueId:id,contract:techniques[id]?.modeContract||null}))};
   if(wyvernRequested)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',referenceOnly:true,referenceScope:'STANDARD_MODE_FULL_TWO_HIT_PROVISIONAL',liveGameVerification:'PENDING'};
   if(resolvedTechniqueIds.some(id=>techniques[id]?.referenceKind==='charge-blade-saed'))for(const result of Object.values(evaluated.channels||{})){
    result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',referenceOnly:true,referenceScope:'KAN21_FULL_STOCK_FULL_HIT',sourceStatusPreserved:true};
   }
if(ed1Requested)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,resourceContracts:resourcePlans,resourceScope:'ADOPTED_RELEASE_ROUTE_ENHANCED_FIRST_EXPLICIT_STOCK'};
if(weapon.kind==='charge-blade'&&chargeBladeState?.axeBoosted===true&&techniques.CB_SWORD_TO_AXE_MORPH)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',techniqueAdoption:techniques.CB_SWORD_TO_AXE_MORPH.adoption};
if(rapidMorphLevel>1)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',rapidMorphAdoption:rapidRule};
if(resolvedTechniqueIds.includes('SNS_BASH_UPPERCUT'))for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',techniqueAdoption:techniques.SNS_BASH_UPPERCUT.adoption};
if(gsChargeActive)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',chargeMasterAdoption:gsCharge};
if(weapon.artiaCalculationEvidence)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',artiaAdoption:weapon.artiaCalculationEvidence};
   for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,armorThunderResistanceInput:equipment.armorThunderResistanceInput};
   // Report executed body-element inputs, including CM, rather than reconstructing a pre-CM value.
   const conversionElementDiagnostic=result=>{
    const values=(result.components||[]).filter(c=>c.status==='available'&&Number.isFinite(c.details?.appliedElement)).map(c=>({componentId:c.id,effectiveElement:c.details.appliedElement,uncappedElement:c.details.elementComponents?.uncapped,capLimit:c.details.elementComponents?.capLimit}));
    const common=key=>result.execution?.status==='complete'&&values.length&&values.every(x=>Number.isFinite(x[key])&&x[key]===values[0][key])?values[0][key]:null;
    return {effectiveElement:common('effectiveElement'),uncappedElement:common('uncappedElement'),capLimit:common('capLimit'),componentElements:values};
   };
   if(waterEntries.length)for(const [ch,result] of Object.entries(evaluated.channels||{})){const parts=(result.components||[]).filter(c=>c.status==='available'&&(Number.isFinite(c.details?.appliedElement)||Number.isFinite(c.details?.effectiveDisplayedElement))).map(c=>({componentId:c.id,effectiveElement:c.details.appliedElement??c.details.effectiveDisplayedElement,elementBasis:c.details.elementComponents??c.details.elementBasis}));result.diagnostics={...result.diagnostics,waterResistanceConversion:{input:waterInput,add:waterConversionAdd,absorptionResistance:absorptionConversionPlan,absorptionAdd:ch==='maximum'?(absorptionConversionPlan?.status==='UNRESOLVED'?null:absorptionMaximumAdd):0,components:parts,effectiveElement:parts.length&&parts.every(x=>x.effectiveElement===parts[0].effectiveElement)?parts[0].effectiveElement:null,source:waterRule.source,adoptionStatus:waterRule.status,verificationStatus:'UNVERIFIED',scope:waterRule.scope}};}
   if(resistanceConversionLevel)for(const [ch,result] of Object.entries(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',thunderResistanceConversion:{input:resistanceInput,absorptionResistance:absorptionConversionPlan,absorptionAdd:ch==='maximum'?(absorptionConversionPlan?.status==='UNRESOLVED'?null:absorptionMaximumAdd):0,baseElement:elementValue,...conversionElementDiagnostic(result),add:resistanceConversionAdd,source:'https://kuroyonhon.com/mhwilds/program/skill.php',eligibilitySource:'https://kuroyonhon.com/mhwilds/memo/31.php',adoptionStatus:'OWNER_APPROVED_PROVISIONAL',verificationStatus:'UNVERIFIED',scope:'THUNDER_WEAPON_BODY_EQUIPMENT_ONLY_NO_FOOD_TEMPORARY_OR_AMMO'}};
   if(attributeConversionLevel)for(const [ch,result] of Object.entries(evaluated.channels||{})){result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',referenceOnly:true,referenceScope:attributeRule.scope,attributeConversion:{...attributeRule,active:attributeState?.[ch]??null,baseElement:elementValue,...conversionElementDiagnostic(result),excludedComponents:['FIXED_FOLLOWUP','DRAGON_FOLLOWUP']}};if(result.metrics?.comboTotalDamage)result.metrics.comboTotalDamage.scope='BODY_ONLY_REFERENCE';}
   if(darkPeakScoped&&evaluated.channels?.maximum)evaluated.channels.maximum.diagnostics={...evaluated.channels.maximum.diagnostics,darkPeakScenario};
   return evaluated;}catch(e){return fail(e?.message||'REAL_SLICE:EVALUATION_FAILED');}
 }
 // Shared detection for the existing health comparison and the narrower 168 scenario gate.
 function healthBranchKinds(plan){
  const dark=plan?.groupPlan?.applied?.some(x=>x.skill==='ダークアーツ');
  const heroics=plan?.applied?.some(x=>x.skill==='火事場力'&&x.attackMultiplier>1);
  return {dark,heroics,required:!!(dark||heroics)};
 }
 // Reuse the adopted whole-route health comparison; never mix component maxima.
 function evaluateCurrent(input={}){
  const original=evaluateCurrentSingleHealth(input),plan=input.stats?.conditionalConditionPlan;
  const {dark,heroics}=healthBranchKinds(plan);
  const totals=Object.fromEntries(input.skills||[]),peak=Number(totals['フルチャージ']||totals['Peak Performance']||0);
  if(!original.channels||(!dark&&!heroics)||!Number.isInteger(peak)||peak<=0)return original;
  // Do not strip 172/Heroics then reinterpret 168 as a full-health branch.
  if(plan?.excluded?.some(x=>x.reason==='DARK_BELOW_FULL_NO_HEALING_MAXIMUM')){
   original.channels.maximum.diagnostics={...original.channels.maximum.diagnostics,healthBranchComparison:{status:'PENDING',reason:'DARK168_HEALTH_COMBINATION_NOT_ADOPTED',branches:[]}};
   return original;
  }
  const run=(state,remove,removeDark)=>{
   const skills=(input.skills||[]).filter(([name])=>!remove.includes(name));
   const stats={...input.stats,activeBonusEffects:(input.stats.activeBonusEffects||[]).filter(x=>!removeDark||x.name!=='ダークアーツ')};
   stats.conditionalConditionPlan=root.MHWStandardPowerConditionPlan(stats,Object.fromEntries(skills),input.weapon.kind,input.conditions||{});
   const weapon={...input.weapon,skills:input.weapon.skills.filter(x=>!remove.includes(x.skill?.name||x.name))};
   const result=evaluateCurrentSingleHealth({...input,weapon,stats,skills});
   const maximum=result.channels?.maximum,metric=maximum?.metrics?.comboTotalDamage;
   return {state,maximum,value:metric?.status==='available'&&maximum.execution?.status==='complete'?metric.value:null};
  };
  const branches=[run('FULL_HEALTH',['逆恨み','Resentment','暗黒騎士の証','ダークアーツ','火事場力','Heroics'],true),run(heroics?'LOW_HEALTH_WITH_RECOVERABLE_DAMAGE':'RECOVERABLE_DAMAGE',['フルチャージ','Peak Performance'],false)];
  const ready=branches.every(b=>Number.isFinite(b.value)),selected=ready?(branches[1].value>branches[0].value?branches[1]:branches[0]):null;
  if(selected)original.channels.maximum=selected.maximum;
  original.channels.maximum.diagnostics={...original.channels.maximum.diagnostics,healthBranchComparison:{policy:'WHOLE_ROUTE_TOTAL_NOT_COMPONENT_MAXIMA',status:ready?'RESOLVED':'PENDING',selectedState:selected?.state??null,branches:branches.map(b=>({state:b.state,value:b.value,execution:b.maximum?.execution,effectPlan:b.maximum?.effectPlan}))}};
  return original;
 }
 root.MHWRealOneHitBrowserAdapter=Object.freeze({evaluateCurrent,normalizeTechniqueIds});
})(typeof window!=='undefined'?window:globalThis);
