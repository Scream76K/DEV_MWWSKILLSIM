(function(root){'use strict';
 // Owner target IG records are adopted BODY_ONLY with no wound-destruction event; part durability is not HP.
 const ADOPTED_NO_WOUND_EVENT_IDS=new Set(["GS_CHARGED_SLASH_3", "GS_STRONG_CHARGED_SLASH_3", "GS_STRONG_WIDE_SLASH_3", "LS_RED_BLADE_I", "LS_RED_BLADE_II", "LS_RED_BLADE_III", "SNS_SIDE_SLASH", "SNS_BASH_UPPERCUT", "DB_DEMON_DANCE_I", "DB_DEMON_DANCE_II", "DB_DEMON_DANCE_III", "HAM_SIDE_SWING", "HAM_VERTICAL_II", "HAM_UPPERCUT", "LAN_MID_THRUST_I", "LAN_MID_THRUST_II", "LAN_MID_THRUST_III", "LAN_TRIPLE_THRUST", "GL_SLAM", "GL_SWEEP", "SA_SWORD_VERTICAL", "SA_SWORD_MORPH_DOUBLE", "SA_AXE_MORPH_SLASH", "IG_DIAGONAL_SLASH", "IG_ENHANCED_DIAGONAL_SLASH", "IG_TRIPLE_SIDESTEP_SLASH", "IG_TRIPLE_ADVANCING_COMBO", "IG_ENHANCED_DESCENDING_THRUST", "IG_RISING_SPIRAL_SLASH", "CB_SWORD_TO_AXE_MORPH", "CB_ELEMENT_DISCHARGE_1", "CB_ELEMENT_DISCHARGE_2", "CB_AED", "CB_FOLLOWUP_AED", "CB_SAED", "CB_SAED_AED_DERIVED", "BOW_SHOT_3", "BOW_POWER_SHOT_3", "BOW_POWER_VOLLEY_3", "HBG_NORMAL_AMMO_1", "HBG_NORMAL_AMMO_2", "HBG_NORMAL_AMMO_3", "LBG_NORMAL_AMMO_1", "LBG_NORMAL_AMMO_2", "HBG_ELEMENT_FIRST_HIT_REFERENCE", "LBG_ELEMENT_FIRST_HIT_REFERENCE", "HBG_WYVERN_AMMO", "HH_LEFT_SWING", "HH_RIGHT_SWING", "HH_FORWARD_ATTACK", "HH_SELF_IMPROVEMENT_PERFORMANCE", "HH_PERFORMANCE_BODY", "HH_PERFORMANCE_BEAT_1", "HH_PERFORMANCE_BEAT_1_JUST", "HH_PERFORMANCE_BEAT_2", "HH_PERFORMANCE_BEAT_2_JUST", "HH_ENCORE_NORMAL", "HH_ENCORE_JUST", "HH_PERFORMANCE_SHOCKWAVE", "HH_ECHO_BUBBLE_FOLLOWUP", "HH_ECHO_BUBBLE_MELODY_EVENT", "HH_MELODY_COMPLETION_FIXED_10", "reference:gl_NORMAL", "reference:gl_CHARGED"]);
 const INTERNAL_SKILL_ADOPTION=Object.freeze({
"ボマー":{requiredSkillId:37,maxLevel:3,effectDisposition:'non_damage',reason:'CURRENT_FIXED_WEAPON_HIT_INDICATOR_EXCLUDES_BOMB_ITEMS',evidenceRef:'MHDB_SKILL_37;OWNER_FIXED_INDICATOR_SCOPE'},
"にぎりめし":{requiredSkillId:158,maxLevel:1,effectDisposition:'non_damage',reason:'CURRENT_ADOPTED_WEAPON_HITS_EXCLUDE_AKUMA_SPECIAL_ACTIONS',evidenceRef:'MHDB_SKILL_158;OWNER_FIXED_INDICATOR_SCOPE'},
"回避装填":{requiredSkillId:166,maxLevel:1,effectDisposition:'non_damage',reason:'EXPLICIT_INITIAL_AMMO_AND_CONSUMPTION_ONLY_NO_AUTOMATIC_RELOAD',evidenceRef:'MHDB_SKILL_166;OWNER_FIXED_INDICATOR_SCOPE'},

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
 // Only aliases already consumed by this adapter are eligible for MHDB identity
 // validation. This table grants no effect or coefficient; existing scope gates
 // remain authoritative. Caller-provided metadata is never an adoption policy.
 const SKILL_IDENTITY_ALIASES=Object.freeze({
  'Spread/Power Shots':2,'散弾強化':2,'Critical Eye':3,'Normal Shots':6,'通常弾強化':6,
  'Rapid Morph':7,'Punishing Draw':8,'Coalescence':13,'Constitution':14,'Antivirus':18,
  'Critical Boost':22,'Charge Master':24,'Slugger':36,'KO術':36,'Dragon Attack':41,
  'Runner':43,'Artillery':47,'Fire Attack':50,'Ballistics':53,'Weakness Exploit':57,
  'Focus':60,'Offensive Guard':66,'Ambush':67,'Attack Boost':72,'Foray':75,
  'Counterstrike':81,'Critical Element':82,'Bludgeoner':85,'Heroics':87,'Water Attack':91,
  'Burst':95,'Maximum Might':99,'Critical Draw':103,'抜刀術[技]':103,'Power Prolonger':104,
  'Load Shells':109,'Defense':118,'Adrenaline Rush':120,'Ice Attack':121,'Resentment':123,
  'Thunder Attack':127,'Element Absorption':133,'Force Shot':137,'Tetrad Shot':137,
  'Everlasting':138,'First Shot':140,'Latent Power':142,'Agitator':144,'Convert Element':152,
  'Peak Performance':154,'Bladescale Loading':160,'Thunder Resistance Conversion':165,'Dark':168
 });
 const CONDITIONAL_AFFINITY_SKILLS=Object.freeze({
  '弱点特効':{id:57,max:5},'Weakness Exploit':{id:57,max:5},
  '渾身':{id:99,max:3},'Maximum Might':{id:99,max:3},
  '力の解放':{id:142,max:5},'Latent Power':{id:142,max:5}
 });
 function fail(reason){return {status:'UNAVAILABLE',reason};}
 const inputRecord=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
 const STANDARD_NORMAL_HIT_CONTRACT=Object.freeze({GS_CHARGED_SLASH_3:{damageType:'slash',source:'MACARONGAMEMO_GREAT_SWORD_VER1040'},GS_STRONG_CHARGED_SLASH_3:{damageType:'slash',damageTypeStatus:'OWNER_APPROVED_PROVISIONAL',damageTypeApprovedAt:'2026-10-25',damageTypeReason:'技名と既存大剣通常技契約に基づく暫定分類。原典のdamageType明記は未確認。',source:'MACARONGAMEMO_GREAT_SWORD_VER1040'},GS_STRONG_WIDE_SLASH_3:{damageType:'slash',damageTypeStatus:'OWNER_APPROVED_PROVISIONAL',damageTypeApprovedAt:'2026-10-25',damageTypeReason:'技名と既存大剣通常技契約に基づく暫定分類。原典のdamageType明記は未確認。',source:'MACARONGAMEMO_GREAT_SWORD_VER1021_CURRENT'},LS_RED_BLADE_I:{damageType:'slash',partModifier:1,stateRequirement:{spiritGauge:'RED'},source:'MACARONGAMEMO_LONG_SWORD_MOTION_CURRENT'},LS_RED_BLADE_II:{damageType:'slash',partModifier:1,stateRequirement:{spiritGauge:'RED'},source:'GENERIC_STANDARD_PROFILES.long-sword;index.html:partPhysHz;MACARONGAMEMO_LONG_SWORD_MOTION_CURRENT'},LS_RED_BLADE_III:{damageType:'slash',partModifier:1,stateRequirement:{spiritGauge:'RED'},source:'GENERIC_STANDARD_PROFILES.long-sword;index.html:partPhysHz;MACARONGAMEMO_LONG_SWORD_MOTION_CURRENT'},SNS_SIDE_SLASH:{damageType:'slash',partModifier:1,source:'GAME8_2025_06_30_SNS_NERF'},DB_DEMON_DANCE_I:{damageType:'slash',partModifier:1,stateRequirement:{demonMode:true},source:'KUROYONHON_DB_R50_CHECK'},SA_SWORD_VERTICAL:{damageType:'slash',partModifier:1,stateRequirement:{mode:'SWORD'},source:'MACARONGAMEMO_SWITCH_AXE_CURRENT'},SA_SWORD_MORPH_DOUBLE:{damageType:'slash',stateRequirement:{mode:'SWORD'},source:'MACARONGAMEMO_SWITCH_AXE_CURRENT;KUROYONHON_MEMO11_26'},SA_AXE_MORPH_SLASH:{damageType:'slash',stateRequirement:{mode:'AXE'},source:'MACARONGAMEMO_SWITCH_AXE_CURRENT;KUROYONHON_MEMO11_26'},IG_DIAGONAL_SLASH:{damageType:'slash',partModifier:1,source:'MACARONGAMEMO_INSECT_GLAIVE_CURRENT'},IG_ENHANCED_DIAGONAL_SLASH:{damageType:'slash',stateRequirement:{tripleExtract:true},damageTypeStatus:'OWNER_APPROVED_PROVISIONAL',damageTypeApprovedAt:'2026-10-25',damageTypeReason:'資料一致の強化けさ斬り本体2Hitを三色前提で暫定採用。原典の切断表記を保持し、猟虫成分は含めない。',source:'MACARONGAMEMO_IG_R49_SOURCE;KUROYONHON_IG_R49_CHECK'},HH_LEFT_SWING:{damageType:'blunt',partModifier:1,source:'MACARONGAMEMO_HH_MOTION'}});
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
 function resolveTarget(target,trainingRoom){
  if(!target||typeof target!=='object'||Array.isArray(target))return {reason:'REAL_SLICE:TARGET_ID_INVALID'};
   const validId=id=>(typeof id==='number'&&Number.isSafeInteger(id)&&id>0)||(typeof id==='string'&&/^[1-9][0-9]*$/.test(id)&&Number.isSafeInteger(Number(id)));
   const keys=['slash','blunt','pierce','fire','water','thunder','ice','dragon'];
   let monster,part,sourceRef,status;
   if(target.monster==='training-room'){
    if(!['training-front','training-side','training-back'].includes(target.part))return {reason:'REAL_SLICE:TARGET_PART_ID_UNRESOLVED'};
    monster=trainingRoom;
    if(!Array.isArray(monster?.parts))return {reason:'REAL_SLICE:TARGET_PARTS_UNRESOLVED'};
    const matches=monster.parts.filter(p=>p?.id===target.part);
    if(matches.length!==1)return {reason:'REAL_SLICE:TARGET_PART_ID_UNRESOLVED'};
    part=matches[0];sourceRef='index.html:trainingRoomMonster:'+target.part;status='PRODUCT_REFERENCE';
   }else{
    if(typeof target.monster==='string'&&/^[1-9][0-9]*:(?:v[1-9][0-9]*|king)$/.test(target.monster))return {reason:'REAL_SLICE:TARGET_VARIANT_HITZONE_SOURCE_NOT_ADOPTED'};
    if(!validId(target.monster)||!validId(target.part))return {reason:'REAL_SLICE:TARGET_ID_INVALID'};
    const monsters=root.__getBetaDB?.()?.monsters;
    if(!Array.isArray(monsters))return {reason:'REAL_SLICE:TARGET_DATABASE_UNAVAILABLE'};
    const matches=monsters.filter(m=>validId(m?.id)&&String(m.id)===String(target.monster));
    if(matches.length!==1)return {reason:'REAL_SLICE:TARGET_MONSTER_ID_UNRESOLVED'};
    monster=matches[0];
    if(!Array.isArray(monster.parts))return {reason:'REAL_SLICE:TARGET_PARTS_UNRESOLVED'};
    const parts=monster.parts.filter(p=>validId(p?.id)&&String(p.id)===String(target.part));
    if(parts.length!==1)return {reason:'REAL_SLICE:TARGET_PART_ID_UNRESOLVED'};
    part=parts[0];
    if(!validId(part.monster?.id)||String(part.monster.id)!==String(monster.id))return {reason:'REAL_SLICE:TARGET_PART_MONSTER_MISMATCH'};
    sourceRef='MHDB_LOADED_MONSTER:'+monster.id+':PART:'+part.id;status='SOURCE_REFERENCE_NOT_LIVE_VERIFIED';
   }
   if(!part.multipliers||keys.some(k=>typeof part.multipliers[k]!=='number'||!Number.isFinite(part.multipliers[k])||part.multipliers[k]<0||part.multipliers[k]>1))return {reason:'REAL_SLICE:TARGET_HITZONE_INVALID'};
   return {part,sourceRef,status,monsterId:String(target.monster),partId:String(target.part),sourceGameVersion:'NOT_ESTABLISHED_BY_API_IMPORT_VERSION',scope:'UNCHANGED_MHDB_BASE_PART_OR_PRODUCT_TRAINING_REFERENCE_NO_VARIANT_WOUND_OR_RAGE_REINTERPRETATION'};
 }
 function evaluateCurrentSingleHealth({weapon,stats,target,skills=[],equipmentSkillsResolved=false,conditions={},gunlanceState=null,bowState=null,hbgState=null,lightBowgunState=null,chargeBladeState=null,huntingHornState=null,insectGlaiveState=null,dualBladesState=null,longSwordState=null,lanceState=null,switchAxeState=null,techniqueDb,trainingRoom,techniqueId,techniqueIds,normalAmmoSequence=null,rapidAmmoSequence=null,retrievedAt='UNKNOWN'}={}){
  if(typeof root.damageFromParams!=='function'||!root.MHWWeaponMaxSharpness||typeof root.HimmelRealOneHitPipeline!=='function')return fail('REAL_SLICE:BROWSER_DEPENDENCIES_UNAVAILABLE');
  if(!weapon||!Number.isInteger(weapon.id)||!Number.isInteger(weapon.gameId)||typeof weapon.kind!=='string')return fail('REAL_SLICE:CURRENT_WEAPON_NOT_SUPPORTED');
  if(!Array.isArray(weapon.specials))return fail('REAL_SLICE:WEAPON_SPECIALS_UNKNOWN');
  const saDragonState=weapon.kind==='switch-axe'&&weapon.phial?.kind==='dragon'?root.MHWElementState?.fromWeaponDamage(weapon):null;
  if(weapon.kind==='switch-axe'&&weapon.phial?.kind==='dragon'&&!saDragonState?.elementKnown)return fail('REAL_SLICE:'+String(saDragonState?.elementReason||'SA_DRAGON_PHIAL_SOURCE_UNRESOLVED'));
  const elementSpecials=saDragonState?[{kind:'element',element:'dragon',damage:{...weapon.phial.damage},source:'MHDB_PHIAL_DISPLAY_SWORD_ONLY'}]:weapon.specials.filter(x=>x?.kind==='element');
  const statusSpecials=weapon.specials.filter(x=>x?.kind==='status');
  if(weapon.specials.some(x=>!['element','status'].includes(x?.kind)))return fail('REAL_SLICE:WEAPON_SPECIALS_UNSUPPORTED');
  // Equipment status buildup remains on the source record; it is not elemental HP damage.
  if(statusSpecials.length&&(statusSpecials.length!==1||elementSpecials.length))return fail('REAL_SLICE:MULTIPLE_SPECIALS_UNSUPPORTED');
  const statusState=statusSpecials.length?root.MHWElementState?.fromRecord(weapon):null;
  if(statusSpecials.length&&(!statusState||root.MHWElementState.hpElement(statusState)!==0))return fail('REAL_SLICE:WEAPON_STATUS_UNRESOLVED');
  if(elementSpecials.length>1)return fail('REAL_SLICE:MULTIPLE_ELEMENTS_UNSUPPORTED');
  if(!Array.isArray(weapon.skills))return fail('REAL_SLICE:WEAPON_SKILLS_UNKNOWN');
  if(!Array.isArray(skills)||skills.some(x=>!Array.isArray(x)||x.length!==2||typeof x[0]!=='string'||!x[0]))return fail('REAL_SLICE:BUILD_SKILL_INPUT_INVALID');
  const targetData=resolveTarget(target,trainingRoom);
  if(targetData.reason)return fail(targetData.reason);
  const part=targetData.part;
  // Newly supported targets must not inherit a stale explicit shell-fire hitzone.
  // Preserve the existing training-front reference contract and never rewrite saved inputs.
  if((target.monster!=="training-room"||target.part!=="training-front")&&weapon.kind==="gunlance"&&Number.isFinite(gunlanceState?.fireHitzone)&&Math.abs(gunlanceState.fireHitzone-part.multipliers.fire*100)>1e-9)return fail("REAL_SLICE:GL_FIRE_HITZONE_TARGET_MISMATCH");
  // UI count applies to the explicit current target; API per-contact inputs remain supported.
  const resolveContactCount=s=>{
   if(s?.contactPolicy!=='EXPLICIT_CONTACTS'||s.contactTargetPolicy!=='CURRENT_TARGET')return s;
   if(!Number.isInteger(s.contactCount)||s.contactCount<1||s.contactCount>6)throw Error('BOWGUN_ELEMENT:CONTACT_COUNT_REQUIRED_1_TO_6');
   const p=part,element=String(s.elementType||s.ammoType||'').toLowerCase();
  if(!p||!Number.isFinite(p.multipliers?.pierce)||!Number.isFinite(p.multipliers?.[element]))throw Error('BOWGUN_ELEMENT:CONTACT_TARGET_UNRESOLVED');
   return {...s,contacts:Array.from({length:s.contactCount},(_,i)=>({ordinal:i+1,targetId:target.monster,partId:target.part,range:s.range,physicalHitzone:p.multipliers.pierce*100,elementalHitzone:p.multipliers[element]*100}))};
  };
  try{if(weapon.kind==='heavy-bowgun')hbgState=resolveContactCount(hbgState);if(weapon.kind==='light-bowgun')lightBowgunState=resolveContactCount(lightBowgunState);}catch(e){return fail(e.message);}
  const skillSource=`https://wilds.mhdb.io/en/weapons/${weapon.id}`;
  const classifySkill=(entry,source)=>{
   const name=entry?.skill?.name||entry?.name;
   const level=['number','string'].includes(typeof entry?.level)?Number(entry.level):NaN;
   const invalid=reason=>({id:'unknown',name:typeof name==='string'?name:'UNKNOWN',level:Number.isFinite(level)?level:0,rank:0,source,effectDisposition:'unknown',identityError:reason,skillId:null});
   if(!inputRecord(entry)||(entry.skill!==undefined&&!inputRecord(entry.skill)))return invalid('REAL_SLICE:SKILL_RECORD_INVALID');
   if(typeof name!=='string'||!name||!['number','string'].includes(typeof entry.level)||!Number.isInteger(level)||level<1)return invalid('REAL_SLICE:SKILL_LEVEL_OR_NAME_INVALID');
   const nestedId=entry.skill&&Object.prototype.hasOwnProperty.call(entry.skill,'id'),directId=Object.prototype.hasOwnProperty.call(entry,'id');
   const inputSkillId=nestedId?entry.skill.id:directId?entry.id:null,dbSkills=root.__getBetaDB?.()?.skills||[];
   // IDs are positive safe integers or their exact decimal string forms. Do not
   // let JSON arrays, null, booleans or objects acquire identity by coercion.
   if((nestedId||directId)&&!((typeof inputSkillId==='number'&&Number.isSafeInteger(inputSkillId)&&inputSkillId>0)||(typeof inputSkillId==='string'&&/^[1-9][0-9]*$/.test(inputSkillId)&&Number.isSafeInteger(Number(inputSkillId)))))return invalid('REAL_SLICE:SKILL_ID_PRIMITIVE_INVALID');
   const aliasId=Object.prototype.hasOwnProperty.call(SKILL_IDENTITY_ALIASES,name)?SKILL_IDENTITY_ALIASES[name]:null;
   const candidates=inputSkillId!=null?dbSkills.filter(x=>String(x?.id)===String(inputSkillId)):dbSkills.filter(x=>String(x?.name||'')===String(name));
   if(candidates.length>1)return invalid('REAL_SLICE:SKILL_RECORD_AMBIGUOUS');
   const dbSkill=candidates[0]||null,aliasRecords=aliasId!==null?dbSkills.filter(x=>x?.id===aliasId):[];
   if(!dbSkill&&aliasRecords.length>1)return invalid('REAL_SLICE:SKILL_RECORD_AMBIGUOUS');
   const identitySkill=dbSkill||aliasRecords[0]||null;
   if(inputSkillId!=null&&(!dbSkill||(String(dbSkill.name)!==String(name)&&dbSkill.id!==aliasId)))return invalid('REAL_SLICE:SKILL_IDENTITY_MISMATCH');
   if(!Number.isInteger(level)||level<1)return invalid('REAL_SLICE:SKILL_LEVEL_INVALID');
   if(identitySkill&&(!Array.isArray(identitySkill.ranks)||identitySkill.ranks.filter(r=>r.level===level).length!==1))return invalid('REAL_SLICE:SKILL_LEVEL_NOT_IN_SOURCE');
   // No raw effectCategory/damageRelated/description can authorize an unknown
   // skill. Known source identity and the existing public policies decide scope.
   const skillId=dbSkill?.id??inputSkillId??null,description=dbSkill?.description||dbSkill?.descriptions?.ja||null,effectCategory=dbSkill?.effectCategory??dbSkill?.category??dbSkill?.effectType??null,damageRelated=dbSkill?.damageRelated;
   const skillKey=Number(skillId)===84?'waterResistance':Number(skillId)===181?'resistanceConversionWater':Number(skillId)===83?'chargeStrike':Number(skillId)===150?'conditionalAttack':[89,153,164,171,173,174].includes(Number(skillId))?'selfState':Number(skillId)===119?'handicraft':[39,103].includes(Number(skillId))?'explicitAffinity':[85,136].includes(Number(skillId))?'contextAttack':skillId===53?'ballistics':skillId===156?'thunderResistance':['高速変形','Rapid Morph'].includes(name)?'rapidMorph':CONDITIONAL_AFFINITY_SKILLS[name]?'conditionalAffinity':(name==='Slugger'||name==='KO術'||name==='ＫＯ術')?'slugger':(name==='Attack Boost'||name==='攻撃')?'attack':(name==='Critical Eye'||name==='見切り')?'affinity':(name==='Critical Boost'||name==='超会心')?'criticalBoost':(['砲術','Artillery','砲弾装填','Load Shells'].includes(name))?'shelling':(['通常弾・通常矢強化','通常弾強化','Normal Shots'].includes(name))?'normalUp':(['散弾・剛射強化','散弾強化','Spread/Power Shots'].includes(name))?'spreadUp':(['チャージマスター','Charge Master'].includes(name))?'chargeMaster':(['会心撃【属性】','Critical Element'].includes(name))?'criticalElement':(['刃鱗増装','Bladescale Loading'].includes(name))?'bladescaleLoading':(['ファーストショット','First Shot'].includes(name))?'firstShot':(['フォースショット','Force Shot','Tetrad Shot'].includes(name))?'forceShot':(['挑戦者','Agitator','フルチャージ','Peak Performance','逆恨み','Resentment','巧撃','Adrenaline Rush','逆襲','Counterstrike','攻勢','Foray','火事場力','Heroics','暗黒','Dark','攻めの守勢','Offensive Guard','急襲','Ambush','連撃','Burst','属性吸収','Element Absorption','災禍転福','Coalescence','不屈','Fortify','抜刀術【技】','抜刀術[技]','Critical Draw','抜刀術【力】','Punishing Draw','研鑽','Everlasting'].includes(name))?'conditionalAttack':(['集中','Focus'].includes(name))?'focus':(['属性変換','Convert Element'].includes(name))?'attributeConversion':(['耐性変換【雷】','Thunder Resistance Conversion'].includes(name))?'resistanceConversionThunder':({'火属性攻撃強化':'fire','Fire Attack':'fire','水属性攻撃強化':'water','Water Attack':'water','雷属性攻撃強化':'thunder','Thunder Attack':'thunder','氷属性攻撃強化':'ice','Ice Attack':'ice','龍属性攻撃強化':'dragon','Dragon Attack':'dragon'}[name]||'unknown');
   return {id:String(skillId??name),name,level,rank:0,source,skillId,description,effectCategory,damageRelated,skillKey};
  };
  const rawSkills=weapon.skills.map(x=>classifySkill(x,skillSource));
  const activeBonusEffects=Array.isArray(stats?.activeBonusEffects)?stats.activeBonusEffects.map(x=>({...x})):[];
  const activeBonusEffectNames=new Set(activeBonusEffects.map(x=>String(x?.name||'')).filter(Boolean));
  // Share the existing validated disposition across narrow shot-entry gates.
  // A name alone cannot approve a series activation or a mixed body/annotation effect.
  const entryGroupPlan=stats.conditionalConditionPlan?.groupPlan;
  const validatedEntryBonuses=typeof root.MHWValidatedNonDamageBonusEffects==='function'?root.MHWValidatedNonDamageBonusEffects(activeBonusEffects):[];
  const sameActivation=(x,y)=>['bonusSkillId','name','bonusName','source','rankLevel','required','count','level'].every(k=>x?.[k]===y?.[k]);
  const ownerExcludedBonus=e=>{
   if(typeof root.currentOwnerExcludedBonus!=='function'||!root.currentOwnerExcludedBonus(e)||!sourceBonusActivation({name:e.name,level:1}))return false;
   const rows=entryGroupPlan?.applied?.filter(x=>x.skillId===e.bonusSkillId)||[];
   return rows.length===1&&rows[0].policyExcluded===true&&rows[0].condition==='OWNER_EXCLUDED_CURRENT_COMPARISON'&&rows[0].attackAdd===0&&rows[0].attackMultiplier===1&&rows[0].maximumAttackMultiplier===1&&sameActivation(rows[0].excludedActivation,e);
  };
  // Normal ammunition cannot gain an element from Gog. Validate the real
  // activation and neutral plan before allowing it through the narrow entry.
  const gogNormalAmmoBonus=e=>{
   const rule=root.MHGogElementRule,rank=e?.rankLevel,rows=entryGroupPlan?.applied?.filter(x=>x.skillId===178)||[],a=rows[0],state=weapon.kind==='light-bowgun'?lightBowgunState:hbgState;
   return ['light-bowgun','heavy-bowgun'].includes(weapon.kind)&&state?.ammoType==='NORMAL'&&stats.elementKnown===true&&stats.elementType==='none'&&stats.element===0&&stats.elementComponents?.weaponBase===0&&stats.elementComponents?.normalFlat===0&&stats.elementComponents?.normalMultiplier===1&&
    e?.bonusSkillId===178&&!!rule&&[1,2].includes(rank)&&e.name===rule.names[rank]&&e.bonusName===rule.parent&&e.source==='series'&&sourceBonusActivation({name:e.name,level:1})&&activeBonusEffects.filter(x=>x.bonusSkillId===178).length===1&&rows.length===1&&sameActivation(a.gogActivation,e)&&a.rank===rank&&a.attackAdd===0&&a.attackMultiplier===1&&a.elementScope==='NO_ELEMENT_GRANT'&&a.elementMultiplier===1&&a.elementAdd===0&&a.appliesToNormal===false&&a.condition===rule.condition&&a.evidenceRef===rule.source;
  };
  const fixedEntryBonus=e=>{
   if(!entryGroupPlan||!Array.isArray(entryGroupPlan.unresolvedEffects)||entryGroupPlan.unresolvedEffects.length||activeBonusEffects.filter(x=>x.bonusSkillId===e.bonusSkillId).length!==1)return false;
   if(ownerExcludedBonus(e)||gogNormalAmmoBonus(e))return true;
   const nonDamage=entryGroupPlan.nonDamageEffects?.filter(x=>sameActivation(x,e))||[];
   if(validatedEntryBonuses.includes(e)&&nonDamage.length===1&&!(entryGroupPlan.applied||[]).some(x=>x.skillId===e.bonusSkillId||x.skill===e.name))return true;
   const policy=root.MHSkillExtraDamagePolicies?.[e.bonusSkillId],applied=(entryGroupPlan.applied||[]).filter(x=>x.skillId===e.bonusSkillId);
   return policy?.bodyEffect===false&&applied.length===1&&applied[0].annotationOnly===true&&applied[0].bodyEffect===false&&applied[0].attackAdd===0&&applied[0].attackMultiplier===1&&sameActivation(applied[0].annotationActivation,e);
  };
  const sourceBonusActivation=entry=>{
   const activations=activeBonusEffects.filter(e=>e.name===entry.name);
   if(activations.length!==1||entry.level!==1)return false;
   const e=activations[0],records=(root.__getBetaDB?.()?.skills||[]).filter(s=>s.id===e.bonusSkillId),skill=records[0];
   if(records.length!==1||!['set','group'].includes(skill.kind)||e.level!==1||e.bonusName!==skill.name||e.source!==(skill.kind==='set'?'series':'group')||!Number.isInteger(e.count)||e.count<1||(entry.skillId!=null&&Number(entry.skillId)!==skill.id))return false;
   const eligible=(skill.ranks||[]).filter(r=>Number.isInteger(r.level)&&Number.isInteger(r.setPiecesRequired)&&r.setPiecesRequired>0&&e.count>=r.setPiecesRequired).sort((a,b)=>b.setPiecesRequired-a.setPiecesRequired||b.level-a.level),rank=eligible[0];
   return !!rank&&eligible.filter(r=>r.level===rank.level).length===1&&e.rankLevel===rank.level&&e.required===rank.setPiecesRequired&&entry.name===rank.name;
  };
  if(activeBonusEffects.some(e=>!sourceBonusActivation({name:e?.name,level:1})))return fail('REAL_SLICE:BONUS_SKILL_SOURCE_MISMATCH');
  // MHDB descriptions restrict these capabilities to an equipped bow. This is
  // non-application on known non-bow weapons, not approval of status coatings.
  const coatingCapabilities={5:['爆破ビン追加','BLAST'],44:['麻痺ビン追加','PARALYSIS'],65:['減気ビン追加','EXHAUST'],79:['睡眠ビン追加','SLEEP'],116:['毒ビン追加','POISON']};
  const unusedNonBowCoating=entry=>{
   const rule=coatingCapabilities[entry.skillId];
   return !!rule&&entry.name===rule[0]&&entry.level===1&&['great-sword','long-sword','sword-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade','insect-glaive','light-bowgun','heavy-bowgun'].includes(weapon.kind);
  };
  // MHDB skill 7 explicitly targets only SA/CB morph actions.
  const nonTargetRapidMorph=entry=>Number(entry.skillId)===7&&entry.name==='高速変形'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3&&['great-sword','long-sword','sword-shield','sword-and-shield','dual-blades','hammer','hunting-horn','lance','gunlance','insect-glaive','light-bowgun','heavy-bowgun','bow'].includes(weapon.kind);
  // Explicit weapon restrictions. 136 ranged non-application: Game8 /mhwilds/673680 and GameWith /mhwilds/488378 (source-confirmed, target game version unverified). Target-technique guards remain authoritative.
  const weaponSpecificSkillScopes={23:{name:'速射強化',maxLevel:1,kinds:['light-bowgun']},69:{name:'特殊射撃強化',maxLevel:2,kinds:['light-bowgun','heavy-bowgun','bow']},83:{name:'溜打強化',maxLevel:1,kinds:['hammer']},94:{name:'貫通弾・竜の矢強化',maxLevel:1,kinds:['light-bowgun','heavy-bowgun','bow']},159:{name:'焼き砲モロコシ',maxLevel:1,kinds:['gunlance']},136:{name:'心眼',maxLevel:3,kinds:['great-sword','long-sword','sword-and-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade','insect-glaive']}};
  const nonTargetWeaponSkill=entry=>{
   const rule=weaponSpecificSkillScopes[entry.skillId],kind=weapon.kind==='sword-shield'?'sword-and-shield':weapon.kind;
   return !!rule&&entry.name===rule.name&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=rule.maxLevel&&['great-sword','long-sword','sword-and-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade','insect-glaive','light-bowgun','heavy-bowgun','bow'].includes(kind)&&!rule.kinds.includes(kind);
  };
  const fixedEntrySkill=entry=>{
   if(nonTargetWeaponSkill(entry))return true;
   if(nonTargetRapidMorph(entry))return true;
   if(unusedNonBowCoating(entry))return true;
   if(confirmedNonDamage(entry))return true;
   // Explicit OFF may pass entry checks; per-channel scope/state validation still rejects ON/unknown.
   if(Number(entry.skillId)===152&&['属性変換','Convert Element'].includes(entry.name)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3&&(conditions?.attributeConversionState?.normal===false||conditions?.attributeConversionState?.maximum===false))return true;
   const extra=annotationPolicy(entry);if(extra?.bodyEffect===false&&![71,149].includes(Number(entry.skillId)))return true;
   const utility={60:['集中',3],104:['強化持続',3],84:['水耐性',3]}[Number(entry.skillId)];
   if(utility&&entry.name===utility[0]&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=utility[1])return true;
   const activation=activeBonusEffects.filter(e=>e.name===entry.name);
   return entry.level===1&&activation.length===1&&fixedEntryBonus(activation[0]);
  };

  const canonicalSlugger=rawSkills.find(x=>x.skillKey==='slugger'&&String(x.skillId)==='36'&&Number.isInteger(x.level)&&x.level===1);
  const buildSkills=Array.isArray(skills)?skills.map(([name,level])=>{const ui=classifySkill({name,level},'index.html:calcBuild');return ui.skillKey==='slugger'&&canonicalSlugger?{...canonicalSlugger,level:ui.level,source:`${canonicalSlugger.source};index.html:calcBuild`}:ui;}):[];
  if(!Array.isArray(skills))return fail('REAL_SLICE:BUILD_SKILLS_UNKNOWN');
  for(const entries of [rawSkills,buildSkills]){
   const invalid=entries.find(x=>x.identityError);if(invalid)return fail(invalid.identityError+':'+invalid.name);
   const keys=entries.map(x=>x.skillId!=null?'id:'+String(x.skillId):Object.prototype.hasOwnProperty.call(SKILL_IDENTITY_ALIASES,x.name)?'id:'+SKILL_IDENTITY_ALIASES[x.name]:'name:'+String(x.name));
   if(new Set(keys).size!==keys.length)return fail('REAL_SLICE:SKILL_INPUT_DUPLICATE');
  }
  // The aggregate may legitimately contain the weapon's skill at a higher
  // total rank. Validate duplicates within each source, not across these views.
  const equippedSkills=[...rawSkills,...buildSkills.filter(x=>!rawSkills.some(y=>String(y.skillId)===String(x.skillId)&&y.level===x.level))];
  const excludedCalculationPolicy=x=>root.MHIsOwnerExcludedCalculationSkill?.({...x,weaponKind:weapon.kind})?root.MHOwnerCalculationExclusion:root.MHIsStandardExcludedCalculationSkill?.(x,conditions)?root.MHStandardCalculationExclusion:null;
  const excludedCalculationSkills=equippedSkills.filter(x=>excludedCalculationPolicy(x)).map(x=>({skillId:x.skillId,name:x.name,level:x.level,reason:excludedCalculationPolicy(x).reason,status:excludedCalculationPolicy(x).status}));
  for(const e of activeBonusEffects.filter(ownerExcludedBonus))excludedCalculationSkills.push({skillId:e.bonusSkillId,name:e.name,level:e.level,reason:entryGroupPlan.applied.find(x=>x.skillId===e.bonusSkillId).reason,status:'OWNER_EXCLUDED_CURRENT_COMPARISON'});
  const allSkills=equippedSkills.filter(x=>!excludedCalculationPolicy(x));
  if(allSkills.some(x=>Number(x.skillId)===133&&(!Number.isInteger(x.level)||x.level<1||x.level>3)))return fail('REAL_SLICE:ABSORPTION_LEVEL_INVALID');
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
   const unsupported=allSkills.filter(x=>!fixedEntrySkill(x)&&![69,94].includes(Number(x.skillId))&&!['attack','affinity','criticalBoost'].includes(x.skillKey)&&Number(x.skillId)!==144);
   if(unsupported.length||activeBonusEffects.some(e=>!fixedEntryBonus(e)))return fail('BOW_THOUSAND:SKILL_COMBINATION_NOT_ADOPTED:'+unsupported.map(x=>x.name).join(','));
  }
  const artilleryEntries=allSkills.filter(x=>['砲術','Artillery'].includes(x.name)),loadShellEntries=allSkills.filter(x=>['砲弾装填','Load Shells'].includes(x.name));
  const officialPhialType=weapon.kind==='charge-blade'?(weapon.phial==='impact'?'IMPACT':weapon.phial==='element'?'POWER_ELEMENT':null):null;
  if(weapon.kind==='charge-blade'&&!officialPhialType)return fail('REAL_SLICE:CB_PHIAL_TYPE_UNRESOLVED_FROM_MHDB');
  const adoptedBonusAttackName=name=>(stats.conditionalConditionPlan?.groupPlan?.applied||[]).some(e=>[10,25,34,62,70,107,115,131,150,155,161,167,170,180].includes(e.skillId)&&e.bonusSource===true&&!e.annotationOnly&&!e.elementMultiplier&&Number.isFinite(e.attackAdd)&&Number.isFinite(e.attackMultiplier)&&(e.skill===name||e.parent===name));
  const bladescaleEntries=allSkills.filter(x=>Number(x.skillId)===163||x.name==='刃鱗研装'),bladescaleRule=root.MHBladescaleFirstHitRule;
  if(bladescaleEntries.length&&(!bladescaleRule||bladescaleEntries.some(x=>Number(x.skillId)!==bladescaleRule.skillId||x.name!==bladescaleRule.name||x.level!==bladescaleRule.level)))return fail('REAL_SLICE:BLADESCALE_CONTRACT_INVALID');
  const cornpopperEntries=allSkills.filter(x=>(Number(x.skillId)===159||x.name==='焼き砲モロコシ')&&!nonTargetWeaponSkill(x)),cornpopperRule=techniqueDb?.get?.('gunlance','GL_SHELL_NORMAL_MEDIUM')?.specialSourceValues?.p0ReferenceRules?.cornpopperReference;
  if(cornpopperEntries.length&&(!cornpopperRule||weapon.kind!=='gunlance'||cornpopperEntries.some(x=>Number(x.skillId)!==cornpopperRule.skillId||x.name!==cornpopperRule.name||x.level!==cornpopperRule.level)))return fail('GL_SHELL:CORNPOPPER_CONTRACT_INVALID');
  const guardEntries=allSkills.filter(x=>Number(x.skillId)===66||['Offensive Guard','\u653b\u3081\u306e\u5b88\u52e2'].includes(x.name));
  if(weapon.kind==='gunlance'&&guardEntries.some(x=>(x.skillId!=null&&Number(x.skillId)!==66)||!['Offensive Guard','\u653b\u3081\u306e\u5b88\u52e2'].includes(x.name)||!Number.isInteger(x.level)||x.level<1||x.level>3))return fail('GL_SHELL:OFFENSIVE_GUARD_LEVEL_INVALID');
  // Pure affinity is already resolved by the common channel plan; shell Formula fixes affinity to zero.
  // Preserve the existing ID99 exception separately from the validated MHDB 57/142 candidate below.
  const shellMightEntries=allSkills.filter(x=>Number(x.skillId)===99||['渾身','Maximum Might'].includes(x.name));
  const shellMightResolved=x=>shellMightEntries.length===1&&x===shellMightEntries[0]&&Number(x.skillId)===99&&CONDITIONAL_AFFINITY_SKILLS[x.name]?.id===99&&x.skillKey==='conditionalAffinity'&&Number.isInteger(x.level)&&x.level>=1&&x.level<=CONDITIONAL_AFFINITY_SKILLS[x.name].max&&Number.isFinite(stats.affinity)&&Number.isFinite(stats.maxAffinity);
  // Component-scoped candidate: MHDB 57 is affinity only; 142 adds affinity
  // and stamina economy. Neither changes fixed shell raw/fire coefficients.
  // Cutting retains the existing per-hit WEX and normal/maximum condition plans.
  const shellAffinityOnlyResolved=x=>{
   const rule=CONDITIONAL_AFFINITY_SKILLS[x.name],id=Number(x.skillId);
   return [57,142].includes(id)&&rule?.id===id&&x.skillKey==='conditionalAffinity'&&
    Number.isInteger(x.level)&&x.level>=1&&x.level<=rule.max&&
    allSkills.filter(y=>Number(y.skillId)===id||CONDITIONAL_AFFINITY_SKILLS[y.name]?.id===id).length===1&&
    Number.isFinite(stats.affinity)&&Number.isFinite(stats.maxAffinity);
  };
  // MHDB 118/156 ranks change hunter defense/resistance, not shell raw/fire.
  // Keep conversion combinations fail-closed; their component adoption is separate.
  const shellDefensiveOnlyResolved=x=>{
   const id=Number(x.skillId),rule={118:{name:'防御',key:'unknown',max:7},156:{name:'雷耐性',key:'thunderResistance',max:3}}[id];
   if(!rule||x.name!==rule.name||x.skillKey!==rule.key||!Number.isInteger(x.level)||x.level<1||x.level>rule.max)return false;
   if(allSkills.filter(y=>Number(y.skillId)===id||y.name===rule.name).length!==1)return false;
   if(allSkills.some(y=>[165,181].includes(Number(y.skillId))||['resistanceConversionThunder','resistanceConversionWater'].includes(y.skillKey)||['耐性変換【雷】','Thunder Resistance Conversion','耐性変換【水】','Water Resistance Conversion'].includes(y.name)))return false;
   return Number.isFinite(stats.defense);
  };
  // MHDB 18/39 affect affinity after explicit frenzy or wet/bubble conditions.
  // Fixed shell raw/fire never crits. The existing body resolvers still require
  // valid states and retain all activation/unknown-state gates independently.
  const shellStateAffinityOnlyResolved=x=>{
   const id=Number(x.skillId),rule={18:{name:'無我の境地',key:'unknown'},39:{name:'濡れ刃紋',key:'explicitAffinity'}}[id];
   return !!rule&&x.name===rule.name&&x.skillKey===rule.key&&
    Number.isInteger(x.level)&&x.level>=1&&x.level<=3&&
    allSkills.filter(y=>Number(y.skillId)===id||y.name===rule.name).length===1&&
    Number.isFinite(stats.affinity)&&Number.isFinite(stats.maxAffinity);
  };
  // MHDB 89 is sliding affinity only; 153 rank I/II change hunter defense/resistance.
  // Rank display names have no DB skill ID. Admit only a single proven activation
  // already resolved by the shared self-state plan; do not open the parent alias gate.
  const shellSelfStateBonusResolved=x=>{
   const rules={'滑走強化':{id:89,parent:'革細工の滑性',source:'group',rank:1,required:3},'守護のヴェールⅠ':{id:153,parent:'波衣竜の守護',source:'series',rank:1,required:2},'守護のヴェールⅡ':{id:153,parent:'波衣竜の守護',source:'series',rank:2,required:4}},rule=rules[x.name];
   if(!rule||x.level!==1||!(x.skillId==null&&x.skillKey==='unknown'||Number(x.skillId)===rule.id&&x.skillKey==='selfState'))return false;
   const names=Object.keys(rules).filter(name=>rules[name].id===rule.id),related=y=>Number(y.skillId)===rule.id||names.includes(y.name)||y.name===rule.parent;
   if(allSkills.filter(related).length!==1)return false;
   const activations=activeBonusEffects.filter(e=>Number(e.bonusSkillId)===rule.id||names.includes(e.name)||e.bonusName===rule.parent),e=activations[0];
   if(activations.length!==1||e.bonusSkillId!==rule.id||e.name!==x.name||e.level!==1||e.bonusName!==rule.parent||e.source!==rule.source||e.rankLevel!==rule.rank||e.required!==rule.required||!Number.isInteger(e.count)||e.count<rule.required||(rule.id===153&&rule.rank===1&&e.count>=4))return false;
   if(rule.id===153&&allSkills.some(y=>[165,181].includes(Number(y.skillId))||['resistanceConversionThunder','resistanceConversionWater'].includes(y.skillKey)||['耐性変換【雷】','Thunder Resistance Conversion','耐性変換【水】','Water Resistance Conversion'].includes(y.name)))return false;
   const group=stats.conditionalConditionPlan?.groupPlan,self=stats.conditionalConditionPlan?.selfStatePlan,rows=group?.applied?.filter(a=>a.skillId===rule.id||a.skill===x.name||a.parent===rule.parent)||[],a=rows[0];
   if(!Array.isArray(group?.unresolvedEffects)||group.unresolvedEffects.length||rows.length!==1||a.skillId!==rule.id||a.skill!==x.name||a.parent!==rule.parent||a.attackAdd!==0||a.attackMultiplier!==1||a.bonusSource!==true||a.appliesToNormal!==true||a.condition!=='EXPLICIT_SELF_STATE'||a.numericOrigin!=='OWNER_APPROVED_PROVISIONAL')return false;
   if(!Array.isArray(self?.pending)||self.pending.length||!Array.isArray(self.ids)||self.ids.filter(id=>id===rule.id).length!==1||typeof root.MHWAdoptedSelfStatePlan!=='function')return false;
   // Revalidate current activation and conditions with the existing producer, not a new coefficient.
   const resolved=root.MHWAdoptedSelfStatePlan(stats,Object.fromEntries(skills),conditions);
   if(resolved.pending.length||!resolved.ids.includes(rule.id))return false;
   return ['normal','maximum'].every(ch=>{
    const actual=self[ch]?.filter(r=>r.skillId===rule.id)||[],expected=resolved[ch]?.filter(r=>r.skillId===rule.id)||[];
    return actual.length===1&&expected.length===1&&['skillId','skill','attackAdd','affinityAdd','elementAdd','source','status','scope'].every(key=>actual[0][key]===expected[0][key])&&actual[0].attackAdd===0&&actual[0].elementAdd===0;
   });
  };
  // 162 retains its adopted body affinity; skill-generated FIXED/THUNDER events
  // stay annotation-only. This permits fixed shells, never new extra-damage events.
  const shellThunderBonusRelated=x=>Number(x.skillId)===162||['海竜の渦雷','蒼雷一閃','蒼雷一閃Ⅰ','蒼雷一閃Ⅱ'].includes(x.name);
  const shellThunderBonusResolved=x=>{
   const rank={'蒼雷一閃Ⅰ':1,'蒼雷一閃Ⅱ':2}[x.name],required=rank===1?2:4,policy=root.MHSkillExtraDamagePolicies?.[162];
   if(!rank||x.level!==1||x.skillKey!=='unknown'||!(x.skillId==null||Number(x.skillId)===162)||allSkills.filter(shellThunderBonusRelated).length!==1)return false;
   if(!policy||policy.name!=='海竜の渦雷'||policy.maxLevel!==2||policy.bodyEffect!==true||!Array.isArray(policy.components)||policy.components.length!==2||policy.components[0]!=='FIXED'||policy.components[1]!=='THUNDER')return false;
   const names=['海竜の渦雷','蒼雷一閃','蒼雷一閃Ⅰ','蒼雷一閃Ⅱ'],entries=skills.filter(([name])=>names.includes(name));
   if(entries.length!==1||entries[0][0]!==x.name||entries[0][1]!==1)return false;
   const activations=activeBonusEffects.filter(e=>Number(e.bonusSkillId)===162||names.includes(e.name)||names.includes(e.bonusName)),e=activations[0];
   if(activations.length!==1||e.bonusSkillId!==162||e.name!==x.name||e.level!==1||e.bonusName!==policy.name||e.source!=='series'||e.displayType!=='series'||e.rankLevel!==rank||e.required!==required||!Number.isInteger(e.count)||e.count<required||(rank===1&&e.count>=4))return false;
   // calcSetSkills counts five armor slots, plus an optional Gogma Artia weapon.
   // This bounded path requires actual armor provenance; weapon-bonus state stays gated.
   const armorInput=stats.armorThunderResistanceInput,slots=['head','chest','arms','waist','legs'],db=root.__getBetaDB?.();
   if(typeof root.isArtia!=='function'||root.isArtia(weapon)||weapon.artiaCalculationEvidence||!Array.isArray(db?.armor)||typeof root.armorBonusSkillObjects!=='function'||typeof root.bonusSkillObjects!=='function'||typeof root.groupSetData!=='function')return false;
   if(armorInput?.status!=='ARMOR_BASE_ONLY'||!Array.isArray(armorInput.missing)||armorInput.missing.length||!Array.isArray(armorInput.rows)||armorInput.rows.length!==slots.length)return false;
   let pieceCount=0,armorBase=0;
   for(const slot of slots){
    const rows=armorInput.rows.filter(r=>r.slot===slot),r=rows[0];if(rows.length!==1||typeof r.equipped!=='boolean')return false;
    if(!r.equipped){if(r.id!=null||r.value!==0)return false;continue;}
    const records=db.armor.filter(a=>a.id===r.id),a=records[0];
    if(records.length!==1||a.kind!==slot||r.sourceUrl!=='https://wilds.mhdb.io/ja/armor/'+a.id||!Number.isFinite(r.value)||r.value!==a.resistances?.thunder)return false;
    armorBase+=r.value;
    const own=root.armorBonusSkillObjects(a,'series'),fallback=root.bonusSkillObjects(root.groupSetData(a)||a.armorSet,'series');
    if([...own,...fallback].some(b=>b.id===162&&b.name===policy.name))pieceCount++;
   }
   if(e.count!==pieceCount||armorInput.armorBase!==armorBase)return false;
   const plan=stats.conditionalConditionPlan,group=plan?.groupPlan,related=a=>Number(a.skillId)===162||names.includes(a.skill)||names.includes(a.parent);
   if(group?.status!=='SOURCE_REFERENCE'||group.scope!=='GENERIC_STANDARD_POWER_ONLY'||!Array.isArray(group.unresolvedEffects)||group.unresolvedEffects.length||!Array.isArray(group.nonDamageEffects)||group.nonDamageEffects.some(a=>Number(a.bonusSkillId)===162||names.includes(a.name)))return false;
   const validRow=a=>!!a&&Object.keys(a).length===16&&a.skillId===162&&a.skill===x.name&&a.parent===policy.name&&a.rank===rank&&a.attackAdd===0&&a.attackMultiplier===1&&a.bonusSource===true&&a.appliesToNormal===true&&a.annotationOnly===true&&a.bodyEffect===true&&a.policy==='FIXED_DAMAGE_SKILL_ANNOTATION_ONLY'&&a.condition==='EXTRA_DAMAGE_EXCLUDED_BODY_EFFECT_RETAINED'&&a.evidenceRef==='MHDB_JA_SKILLS_20261026:162'&&a.numericOrigin==='ANNOTATION_FORMULA_NOT_ADOPTED'&&Array.isArray(a.excludedComponents)&&a.excludedComponents.length===2&&a.excludedComponents.every((v,i)=>v===policy.components[i])&&['bonusSkillId','name','level','bonusName','source','displayType','rankLevel','required','count'].every(k=>a.annotationActivation?.[k]===e[k]);
   if(![group.applied,plan.applied].every(list=>Array.isArray(list)&&list.filter(related).length===1&&validRow(list.find(related))))return false;
   if(stats.affinityKnown!==true||!Number.isFinite(stats.affinity)||!Number.isFinite(stats.maxAffinity)||Math.abs(stats.affinity)>100||Math.abs(stats.maxAffinity)>100||typeof root.MHWMaxAffinityResolver!=='function')return false;
   if(!['normal','maximum'].every(ch=>plan[ch]?.affinity===stats.affinity&&plan[ch]?.maxAffinity===stats.maxAffinity))return false;
   // Revalidate the existing display-affinity producer; add no coefficient here.
   try{return stats.maxAffinity===root.MHWMaxAffinityResolver(Object.fromEntries(skills),stats.affinity,weapon,part,conditions);}catch(_){return false;}
  };
  const unresolvedShellThunderBonusNames=new Set(allSkills.filter(x=>shellThunderBonusRelated(x)&&!shellThunderBonusResolved(x)).map(x=>x.name));
  const shellingInput={shellingState:gunlanceState,loadShellsLevel:loadShellEntries.length?Math.max(...loadShellEntries.map(x=>x.level)):0,artilleryLevel:artilleryEntries.length?Math.max(...artilleryEntries.map(x=>x.level)):0,normalAttackComponents:stats.attackComponents?{weaponBase:Number(stats.attackComponents.weaponBase),normalMultiplier:1,normalFlat:0}:null,unreviewedSkills:allSkills.filter(x=>shellThunderBonusRelated(x)?!shellThunderBonusResolved(x):!shellMightResolved(x)&&!shellAffinityOnlyResolved(x)&&!shellDefensiveOnlyResolved(x)&&!shellStateAffinityOnlyResolved(x)&&!shellSelfStateBonusResolved(x)&&![85,136].includes(Number(x.skillId))&&!(cornpopperEntries.length&&Number(x.skillId)===159)&&!(bladescaleEntries.length&&Number(x.skillId)===163)&&!fixedEntrySkill(x)&&!(x.skillKey==='selfState'&&![89,153].includes(Number(x.skillId)))&&!['handicraft','ballistics','attack','affinity','criticalBoost','conditionalAttack','shelling','slugger','fire','water','thunder','ice','dragon','normalUp','spreadUp','chargeMaster','criticalElement','bladescaleLoading','firstShot','forceShot'].includes(x.skillKey)).map(x=>x.name)};
  const rapidRequested=weapon.kind==='light-bowgun'&&resolvedTechniqueIds.some(id=>['LBG_NORMAL_RAPID_1','LBG_NORMAL_RAPID_2','LBG_NORMAL_RAPID_3','LBG_NORMAL_RAPID_NATIVE_3'].includes(id)),rapidShotRule=rapidRequested?techniqueDb.get('light-bowgun',resolvedTechniqueIds.find(id=>['LBG_NORMAL_RAPID_1','LBG_NORMAL_RAPID_2','LBG_NORMAL_RAPID_3','LBG_NORMAL_RAPID_NATIVE_3'].includes(id)))?.rapidRule:null;
  const rapidEntries=allSkills.filter(x=>Number(x.skillId)===23||x.name==='速射強化');
  const rapidNonApplicableSkills=new Set(),rapidResolvedAttackSkills=new Set(),rapidHealthExcludedSkills=new Set(),rapidNonTargetBonuses=new Set();
  if(rapidRequested){
   if(!rapidShotRule||resolvedTechniqueIds.length!==1)return fail('LBG_RAPID:SINGLE_TRIGGER_REQUIRED');
   if(rapidAmmoSequence&&(rapidShotRule.hitCount!==5||rapidShotRule.consumedRounds!==1))return fail('LBG_RAPID_FIVE:ADOPTED_SINGLE_TRIGGER_RULE_REQUIRED');
   // Weapon rank and aggregated build rank may differ legitimately. Duplicate
   // rows within either source were rejected above; consume their maximum once.
   if(rapidAmmoSequence)for(const [key,id] of [['firstShot',140],['forceShot',137]]){const es=allSkills.filter(x=>x.skillKey===key||Number(x.skillId)===id);if(es.some(x=>x.skillKey!==key||Number(x.skillId)!==id||!Number.isInteger(x.level)||x.level<1||x.level>3))return fail('LBG_RAPID_FIVE:SHOT_SKILL_CONTRACT_INVALID');}
   if(rapidEntries.length>1||rapidEntries.some(x=>Number(x.skillId)!==rapidShotRule.skillId||x.name!==rapidShotRule.skillName||x.level!==rapidShotRule.skillLevel))return fail('LBG_RAPID:SKILL_CONTRACT_INVALID');
   const coexisting=[{id:6,name:'通常弾・通常矢強化',max:1},{id:53,name:'弾導強化',max:3}];
   for(const r of coexisting){const entries=allSkills.filter(x=>Number(x.skillId)===r.id||x.name===r.name);if(entries.length>1||entries.some(x=>Number(x.skillId)!==r.id||x.name!==r.name||!Number.isInteger(x.level)||x.level<1||x.level>r.max))return fail('LBG_RAPID:COEXISTING_SKILL_CONTRACT_INVALID');}
   // Standard five-round scope only: reuse resolved channel affinity/attack producers.
   // Explicit single-trigger routes retain their prior adopted skill scope.
   const rapidCommonRules=[{id:57,name:'弱点特効',max:5},{id:99,name:'渾身',max:3},{id:120,name:'巧撃',max:5},{id:95,name:'連撃',max:5},...(rapidAmmoSequence?[{id:142,name:'力の解放',max:5},{id:154,name:'フルチャージ',max:5},{id:81,name:'逆襲',max:3},{id:75,name:'攻勢',max:5}]:[])];
   const rapidPlan=stats.conditionalConditionPlan;
   const rapidPlanReady=rapidPlan&&Array.isArray(rapidPlan.pending)&&rapidPlan.pending.every(p=>rapidAmmoSequence&&p==='濡れ刃紋:CONDITIONAL_DAMAGE_FORMULA_PENDING')&&Array.isArray(entryGroupPlan?.unresolvedEffects)&&entryGroupPlan.unresolvedEffects.length===0;
   const rapidHealthBranchPending=!!rapidAmmoSequence&&Array.isArray(rapidPlan?.pending)&&rapidPlan.pending.length===1&&rapidPlan.pending[0]==='火事場力:HEROICS_FULL_HEALTH_BRANCH_REQUIRED'&&allSkills.some(x=>Number(x.skillId)===87&&Number.isInteger(x.level)&&x.level>1&&x.level<=5)&&allSkills.some(x=>Number(x.skillId)===154&&Number.isInteger(x.level)&&x.level>0&&x.level<=5)&&Array.isArray(entryGroupPlan?.unresolvedEffects)&&entryGroupPlan.unresolvedEffects.length===0;
   const rapidAttackPlanReady=rapidPlanReady||rapidHealthBranchPending;
   for(const r of rapidCommonRules){const es=allSkills.filter(x=>Number(x.skillId)===r.id||x.name===r.name);if(es.length>1||es.some(x=>Number(x.skillId)!==r.id||x.name!==r.name||!Number.isInteger(x.level)||x.level<1||x.level>r.max))return fail('LBG_RAPID:COMMON_SKILL_CONTRACT_INVALID');}
   const rapidResolvedAttackRequired=!!rapidAmmoSequence&&allSkills.some(x=>[67,87,123].includes(Number(x.skillId)));
   const rapidCommonSkill=x=>rapidAttackPlanReady&&rapidCommonRules.some(r=>(r.id!==154||!rapidResolvedAttackRequired||rapidResolvedAttackSkills.has(x))&&Number(x.skillId)===r.id&&x.name===r.name&&([57,99,142].includes(r.id)||(rapidPlan.applied||[]).filter(a=>a.skill===r.name&&a.level===x.level).length===1));
   // Reuse already adopted non-application, only for the fixed physical-only
   // normal-ammo sequence. This is not an expansion of elemental/guard effects.
   const nonApplicableRules=[{id:13,name:'災禍転福',key:'conditionalAttack'},{id:66,name:'攻めの守勢',key:'conditionalAttack'},{id:82,name:'会心撃【属性】',key:'criticalElement'},{id:133,name:'属性吸収',key:'conditionalAttack'}];
   const nonApplicableRelated=(x,r)=>Number(x.skillId)===r.id||x.name===r.name;
   if(rapidAmmoSequence)for(const r of nonApplicableRules){
    const es=allSkills.filter(x=>nonApplicableRelated(x,r));
    if(es.some(x=>Number(x.skillId)!==r.id||x.name!==r.name||x.skillKey!==r.key||!Number.isInteger(x.level)||x.level<1||x.level>3)||[rawSkills,buildSkills].some(rows=>rows.filter(x=>nonApplicableRelated(x,r)).length>1))return fail('LBG_RAPID:NON_APPLICABLE_SKILL_CONTRACT_INVALID');
   }
   const rapidSource=techniqueDb.get('light-bowgun',resolvedTechniqueIds[0]);
   const zeroElement=x=>x?.element===0&&x.elementType==='none'&&x.elementKnown===true&&x.typeKnown===true&&x.elementStatus==='CONFIRMED_NONE'&&x.elementComponents?.weaponBase===0&&x.elementComponents?.normalFlat===0&&Number.isFinite(x.elementComponents?.normalMultiplier)&&x.elementComponents.normalMultiplier>0;
   const physicalOnlyRapid=rapidAmmoSequence==='LBG_FIVE_ROUNDS_25_HITS'&&rapidAttackPlanReady&&conditions.standardEvaluation===true&&
    lightBowgunState?.ammoType==='NORMAL'&&lightBowgunState.shotMode==='RAPID'&&lightBowgunState.normalModeLevel===0&&conditions.mounted===false&&
    weapon.specials.length===0&&weapon.phial==null&&[stats,rapidPlan.normal,rapidPlan.maximum].every(zeroElement)&&
    rapidPlan.maximumElementComponents?.weaponBase===0&&rapidPlan.maximumElementComponents?.normalFlat===0&&rapidPlan.maximumElementComponents?.conditionalFlat===0&&Number.isFinite(rapidPlan.maximumElementComponents?.normalMultiplier)&&rapidPlan.maximumElementComponents.normalMultiplier>0&&
    rapidShotRule.status==='OWNER_APPROVED_PROVISIONAL'&&rapidShotRule.hitCount===5&&rapidShotRule.consumedRounds===1&&
    rapidSource?.weaponType==='light-bowgun'&&rapidSource.techniqueId===resolvedTechniqueIds[0]&&Array.isArray(rapidSource.hits)&&rapidSource.hits.length===0&&
    rapidSource.referenceKind==='light-bowgun'&&Array.isArray(rapidSource.specialComponents)&&rapidSource.specialComponents.length===1&&rapidSource.specialComponents[0]==='AMMO_PHYSICAL'&&rapidSource.phialReference==null&&rapidSource.damageStateTransition==null&&rapidSource.damageStatsState==null;
   // Re-derive adopted attack/HEALTH selection from the single canonical
   // producer. A legitimate excluded row is resolved, never stacked or dropped
   // as an unsupported skill. Only the canonical Heroics/Peak pending state may
   // reach the existing whole-route health comparator; other scopes stay gated.
   const resolvedAttackRules=[{id:67,name:'急襲',max:3},{id:87,name:'火事場力',max:5},{id:123,name:'逆恨み',max:5},{id:154,name:'フルチャージ',max:5}];
   if(rapidResolvedAttackRequired){
    for(const r of resolvedAttackRules){const es=allSkills.filter(x=>Number(x.skillId)===r.id||x.name===r.name);if(es.some(x=>Number(x.skillId)!==r.id||x.name!==r.name||x.skillKey!=='conditionalAttack'||!Number.isInteger(x.level)||x.level<1||x.level>r.max))return fail('LBG_RAPID:RESOLVED_ATTACK_IDENTITY_INVALID');}
    if(physicalOnlyRapid&&typeof root.MHWStandardPowerConditionPlan==='function'){
     const projection=p=>({status:p.status,scope:p.scope,pending:p.pending,normalPending:p.normalPending,applied:p.applied,excluded:p.excluded,attackOrder:p.attackOrder,attackComponents:p.attackComponents,normalAttack:p.normal?.attackTrue,maximumAttack:p.maximum?.attackTrue});
     const finiteTree=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finiteTree):true;
     try{
      const expected=root.MHWStandardPowerConditionPlan(stats,Object.fromEntries(skills),weapon.kind,conditions),actual=projection(rapidPlan),canonical=projection(expected);
      if(Array.isArray(actual.applied)&&Array.isArray(actual.excluded)&&Number.isFinite(actual.normalAttack)&&Number.isFinite(actual.maximumAttack)&&finiteTree(actual)&&finiteTree(canonical)&&JSON.stringify(actual)===JSON.stringify(canonical)){
       for(const x of allSkills){const rule=resolvedAttackRules.find(r=>r.id===Number(x.skillId)&&r.name===x.name);if(!rule)continue;
        const applied=actual.applied.filter(r=>r.skill===x.name&&r.level===x.level),excluded=actual.excluded.filter(r=>r.skill===x.name&&r.level===x.level);
        if(applied.length===1&&excluded.length===0)rapidResolvedAttackSkills.add(x);
        else if(applied.length===0&&excluded.length===1&&[123,154].includes(rule.id)&&excluded[0].exclusiveGroup==='HEALTH'&&actual.applied.some(r=>r.exclusiveGroup==='HEALTH'&&['逆恨み','フルチャージ'].includes(r.skill)&&r.skill!==x.name)){rapidResolvedAttackSkills.add(x);rapidHealthExcludedSkills.add(x);}
       }
      }
     }catch(_){/* No inferred fallback: the existing continuation records failure. */}
    }
   }
   if(physicalOnlyRapid)for(const r of nonApplicableRules){
    const es=allSkills.filter(x=>nonApplicableRelated(x,r));if(!es.length)continue;
    const rows=(rapidPlan.applied||[]).filter(x=>x.skill===r.name);
    const level=Math.max(...es.map(x=>x.level));
    const validPlan=r.id===13?rows.length===1&&rows[0].level===level&&rows[0].attackAdd===0&&rows[0].elementMultiplier===1&&rows[0].elementScope==='NO_TRUE_ELEMENT_HP_BONUS'&&rows[0].condition==='AILMENT_RECOVERED_BUFF_PREACTIVATED':
     r.id===133?rows.length===1&&rows[0].level===level&&rows[0].attackAdd===0&&rows[0].elementAdd===0&&rows[0].elementScope==='NO_TRUE_ELEMENT_HP_BONUS'&&rows[0].condition==='ELEMENT_ABSORPTION_MAXIMUM_ACTIVE_NO_COUNT_INPUT':rows.length===0;
    const planKeys=r.id===13?['skill','level','attackAdd','elementMultiplier','sourceElementMultiplier','elementConditionLabel','condition','durationSeconds','elementScope','evidenceRef','numericOrigin','scope']:['skill','level','attackAdd','elementAdd','condition','elementScope','evidenceRef','numericOrigin'];
    if(validPlan&&rows.every(row=>Object.keys(row).every(key=>planKeys.includes(key))))for(const x of es)rapidNonApplicableSkills.add(x);
   }
   // Narrow source-identified skills whose existing shared producers/consumers
   // already resolve the fixed standard sequence. No continuation suppression.
   const rapidAffinitySkill=x=>physicalOnlyRapid&&[
    {id:18,name:'無我の境地',key:'unknown'}, {id:39,name:'濡れ刃紋',key:'explicitAffinity'}
   ].some(r=>Number(x.skillId)===r.id&&x.name===r.name&&x.skillKey===r.key&&Number.isInteger(x.level)&&x.level>=1&&x.level<=3&&allSkills.filter(y=>Number(y.skillId)===r.id||y.name===r.name).length===1)&&
    conditions.blackEclipseState==='BEFORE'&&typeof root.MHResolveFrenzyAffinity==='function'&&typeof root.MHWMaxAffinityResolver==='function';
   const rapidOrdinaryNonTargets={2:['散弾・剛射強化',1],47:['砲術',3],69:['特殊射撃強化',2],94:['貫通弾・竜の矢強化',1],109:['砲弾装填',2]};
   if(physicalOnlyRapid)for(const x of allSkills){const r=rapidOrdinaryNonTargets[x.skillId];if(r&&x.name===r[0]&&Number.isInteger(x.level)&&x.level>=1&&x.level<=r[1])rapidNonApplicableSkills.add(x);}
   const rapidSeriesBonus=e=>{
    if(!physicalOnlyRapid||!sourceBonusActivation({name:e.name,level:1})||activeBonusEffects.filter(x=>x.bonusSkillId===e.bonusSkillId).length!==1)return false;
    const rows=entryGroupPlan.applied.filter(a=>a.skillId===e.bonusSkillId),a=rows[0];
    // Reuse the canonical producer for these two adopted set effects. The
    // fixed standard physical rapid sequence adds no extra attack events.
    if([162,167].includes(e.bonusSkillId)){
     if(!rapidPlanReady||rows.length!==1||e.source!=='series'||![1,2].includes(e.rankLevel)||typeof root.standardGroupPowerPlan!=='function')return false;
     const expected=root.standardGroupPowerPlan(stats,conditions.gutsState??'BEFORE',Object.fromEntries(skills),weapon.kind,conditions).applied.filter(x=>x.skillId===e.bonusSkillId);
     if(expected.length!==1||JSON.stringify(a)!==JSON.stringify(expected[0]))return false;
     if(e.bonusSkillId===162){
      const policy=root.MHSkillExtraDamagePolicies?.[162];
      return !!policy&&policy.bodyEffect===true&&a.annotationOnly===true&&a.bodyEffect===true&&a.attackAdd===0&&a.attackMultiplier===1&&a.condition==='EXTRA_DAMAGE_EXCLUDED_BODY_EFFECT_RETAINED'&&JSON.stringify(a.excludedComponents)===JSON.stringify(policy.components)&&stats.maxAffinity===root.MHWMaxAffinityResolver(Object.fromEntries(skills),stats.affinity,weapon,part,conditions);
     }
     if(e.rankLevel===1)return a.effectDisposition==='non_damage'&&a.condition==='NO_DIRECT_HP_EFFECT'&&a.scope==='DURATION_ONLY_EXISTING_ADRENALINE_RUSH_VALUE_UNCHANGED';
     return a.numericOrigin==='OWNER_APPROVED_PROVISIONAL'&&a.condition==='ADRENALINE_RUSH_REPEAT_EVADE_PREACTIVATED'&&a.appliesToNormal===false&&a.attackAdd===0&&a.attackMultiplier===1;
    }
    if(rows.length!==1||a.skill!==e.name||a.rank!==e.rankLevel||a.bonusSource!==true||a.appliesToNormal!==false||a.attackMultiplier!==1)return false;
    if([62,70].includes(e.bonusSkillId)){
     if(a.attackAdd!==0||a.scope!=='LBG_STANDARD_NO_CLASH_OR_OFFSET'||a.condition!==root.MHSeriesActivationFlats?.[e.bonusSkillId]?.condition)return false;
     rapidNonTargetBonuses.add(e);return true;
    }
    if(e.bonusSkillId===106){
     const rule=root.MHBlackEclipseRule,b=rapidPlan.blackEclipse;
     return !!rule&&!!b&&b.rank===e.rankLevel&&Number.isInteger(b.antivirusLevel)&&Object.hasOwn(rule.antivirusAdds,b.antivirusLevel)&&conditions.blackEclipseState==='BEFORE'&&b.normalState==='BEFORE'&&b.normalAttackAdd===0&&b.normalAffinityAdd===0&&b.maximumState==='OVERCOME'&&a.condition==='MAXIMUM_OVERCOME'&&a.attackAdd===rule.attackByRank[e.rankLevel].OVERCOME&&b.maximumAttackAdd===a.attackAdd&&b.maximumAffinityAdd===rule.overcomeAffinity+rule.antivirusAdds[b.antivirusLevel];
    }
    if(e.bonusSkillId===155){
     const rule=root.MHNamedBonusFlatRules?.group?.[e.name];
     return !!rule&&rule.skillId===155&&e.source==='group'&&e.rankLevel===1&&e.required===3&&a.parent===e.bonusName&&a.attackAdd===rule.attackAdd&&a.condition===rule.condition;
    }
    if(e.bonusSkillId===115){
     const rule=root.MHNamedBonusFlatRules?.series?.[e.name],burst=allSkills.filter(x=>Number(x.skillId)===95),level=burst.length?Math.max(...burst.map(x=>x.level)):0;
     return !!rule&&rule.parent===e.bonusName&&rule.rankLevel===e.rankLevel&&rule.required===e.required&&a.parent===e.bonusName&&a.attackAdd===(level?rule.attackAdd:0)&&a.condition===(level?rule.condition:'BURST_INACTIVE_OR_UNRESOLVED');
    }
    return false;
   };
   const rapidSeriesSkill=x=>x.level===1&&activeBonusEffects.some(e=>e.name===x.name&&rapidSeriesBonus(e));
   const rapidGutsBonus=e=>{
    if(!rapidPlanReady||Number(e.bonusSkillId)!==131||e.name!=='根性【果敢】'||e.bonusName!=='ヌシの魂'||e.source!=='group'||e.rankLevel!==1||e.level!==1||e.required!==3||!Number.isInteger(e.count)||e.count<3||activeBonusEffects.filter(a=>a.bonusSkillId===e.bonusSkillId).length!==1)return false;
    const ap=(entryGroupPlan.applied||[]).filter(a=>a.skillId===131);
    return ap.length===1&&ap[0].skill===e.name&&ap[0].parent===e.bonusName&&ap[0].rank===e.rankLevel&&ap[0].bonusSource===true&&ap[0].appliesToNormal===true&&['BEFORE','AFTER'].includes(entryGroupPlan.gutsState)&&ap[0].condition===(entryGroupPlan.gutsState==='BEFORE'?'GUTS_NOT_CONSUMED':'GUTS_CONSUMED');
   };
   const rapidGutsSkill=x=>(x.skillId==null||Number(x.skillId)===131)&&x.name==='根性【果敢】'&&x.level===1&&activeBonusEffects.some(rapidGutsBonus);
   if(allSkills.some(x=>!fixedEntrySkill(x)&&!rapidNonApplicableSkills.has(x)&&!rapidResolvedAttackSkills.has(x)&&!rapidCommonSkill(x)&&!rapidAffinitySkill(x)&&!rapidSeriesSkill(x)&&!rapidGutsSkill(x)&&!['attack','affinity','criticalBoost'].includes(x.skillKey)&&![144,23,6,53,...(rapidAmmoSequence?[137,140]:[])].includes(Number(x.skillId)))||activeBonusEffects.some(e=>!fixedEntryBonus(e)&&!rapidSeriesBonus(e)&&!rapidGutsBonus(e)))return fail('LBG_RAPID:SKILL_COMBINATION_NOT_ADOPTED');
   const s=lightBowgunState,a=weapon.ammo?.find(x=>x.kind==='normal'&&x.level===(rapidShotRule.baseAmmoLevel||1));
   if(!a||a.rapid!==true||!Number.isInteger(a.capacity)||a.capacity<1||(rapidShotRule.effectiveAmmoLevel!==3&&weapon.artiaCalculationEvidence?.capacityEvidence?.bonus>0))return fail('LBG_RAPID:WEAPON_AMMO_NOT_ADOPTED');
   if(s?.shotMode!=='RAPID'||s?.rapidReady!==true||s?.ammoType!=='NORMAL'||s?.ammoLevel!==(rapidShotRule.effectiveAmmoLevel||1)||s?.range!=='CRITICAL'||s?.contactPolicy!=='ALL_FIVE'||s?.normalModeLevel!==0||conditions.mounted===true)return fail('LBG_RAPID:START_CONDITION_REQUIRED');
   if(rapidShotRule.normalPowder==='LEVEL_PLUS_ONE'&&(s.normalPowder!==rapidShotRule.normalPowder||!['NONE','EQUIPPED'].includes(s.specialMagazine)))return fail('LBG_RAPID:PARTS_REQUIRED');
   if(!rapidAmmoSequence&&(!Number.isInteger(s.loadedRounds)||s.loadedRounds<rapidShotRule.consumedRounds||s.loadedRounds>a.capacity))return fail('LBG_RAPID:LOADED_ROUNDS_INVALID_OR_INSUFFICIENT');
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
   if(allSkills.some(x=>x.level>0&&!fixedEntrySkill(x)&&!allowed.includes(x.name)&&!resolvedAttackSkill(x)&&!unrelatedElement(x)&&!(Number(x.skillId)===86&&resolvedTechniqueIds.every(id=>Object.hasOwn(root.MHAirborneHitRule?.hitIndices||{},id)&&root.MHAirborneHitRule.hitIndices[id].length===0))&&x.skillKey!=='selfState'&&x.skillKey!=='handicraft'&&x.skillKey!=='ballistics'))return fail('HBG_WYVERN:CONDITIONAL_EFFECT_SCOPE_PENDING');
   // Unknown activated bonuses still flow to the structured unresolved effect plan.

   if(!equipmentSkillsResolved)return fail('HBG_WYVERN:EQUIPMENT_SKILLS_UNRESOLVED');
  }
  const referenceSkills=Object.fromEntries(['normalUp','spreadUp','chargeMaster','criticalElement','bladescaleLoading','firstShot','forceShot'].map(key=>[key,Math.max(...allSkills.filter(x=>x.skillKey===key).map(x=>x.level),0)]));
  if(weapon.kind==='light-bowgun'&&(referenceSkills.firstShot>0||referenceSkills.forceShot>0)&&resolvedTechniqueIds.length!==1)return fail('REAL_SLICE:LBG_SHOT_SKILL_SINGLE_SHOT_REQUIRED');
  if(!normalAmmoSequence&&!rapidAmmoSequence&&weapon.kind==='light-bowgun'&&(referenceSkills.firstShot>0||referenceSkills.forceShot>0)&&(!Number.isInteger(lightBowgunState?.shotOrdinal)||lightBowgunState.shotOrdinal<1||typeof lightBowgunState?.fullMagazine!=='boolean'))return fail('REAL_SLICE:LBG_SHOT_POSITION_PENDING');
  const referenceCriticalBoostLevel=Math.max(...allSkills.filter(x=>x.skillKey==='criticalBoost').map(x=>x.level),0),criticalElementLevel=Math.max(...allSkills.filter(x=>x.skillKey==='criticalElement').map(x=>x.level),0);
  const chargeScope=root.MHMeleeChargeMasterScope,chargeExtension=chargeScope?.weapons?.[weapon.kind];
  const gsCharge=chargeExtension?{...root.MHGreatSwordChargeMasterDB,...chargeScope,...chargeExtension,weaponType:weapon.kind}:root.MHGreatSwordChargeMasterDB;
  const gsChargeActive=(weapon.kind==='great-sword'||!!chargeExtension)&&referenceSkills.chargeMaster>0;
  if(gsChargeActive){
   const entries=allSkills.filter(x=>x.skillKey==='chargeMaster');
   if(!gsCharge||!['OWNER_APPROVED_PROVISIONAL','SOURCE_BACKED_PROVISIONAL'].includes(gsCharge.status)||entries.some(x=>Number(x.skillId)!==gsCharge.skillId||!Number.isInteger(x.level)||x.level<1||x.level>3))return fail('REAL_SLICE:GS_CHARGE_MASTER_CONTRACT_INVALID');
   if(resolvedTechniqueIds.some(id=>!(gsCharge.allowedTechniqueIds||gsCharge.techniqueIds).includes(id)))return fail('REAL_SLICE:GS_CHARGE_MASTER_TECHNIQUE_NOT_ADOPTED');
  }
  if(resolvedTechniqueIds.some(id=>['CB_SAED','CB_SAED_AED_DERIVED'].includes(id))){
   if(equipmentSkillsResolved!==true||!Array.isArray(skills))return fail('REAL_SLICE:CB_EQUIPMENT_SKILLS_UNRESOLVED');
   if(loadShellEntries.some(x=>Number(x.skillId)!==109||!Number.isInteger(x.level)||x.level<0||x.level>2))return fail('REAL_SLICE:CB_LOAD_SHELLS_ID_OR_LEVEL_INVALID');
  }
  const capacityIndependentHbgRestore=weapon.kind==='heavy-bowgun'&&resolvedTechniqueIds.length===1&&resolvedTechniqueIds[0]==='HBG_ELEMENT_FIRST_HIT_REFERENCE'&&weapon.ammo?.some(a=>root.MHBaseHbgCapacityIndependentAmmo?.(weapon,a)===true);
  if(weapon.artiaCalculationEvidence?.capacityEvidence?.bonus>0&&!capacityIndependentHbgRestore&&resolvedTechniqueIds.some(id=>!(id==='LBG_ELEMENT_FIRST_HIT_REFERENCE'&&weapon.artiaCalculationEvidence.capacityEvidence.scope==='NORMAL_AND_COMPLETED_ELEMENT_AMMO')&&! /^(HBG|LBG)_NORMAL_AMMO_[123]$/.test(id)&&!(id==='LBG_NORMAL_RAPID_3'&&rapidRequested&&rapidShotRule?.effectiveAmmoLevel===3)))return fail('REAL_SLICE:ARTIA_CAPACITY_AMMO_SCOPE_PENDING');
  const rapidRule=root.MHRapidMorphAttackRule;
  const rapidMorphEntries=allSkills.filter(x=>x.skillKey==='rapidMorph'&&!nonTargetRapidMorph(x)),rapidMorphLevel=Math.max(0,...rapidMorphEntries.map(x=>x.level));
  if(rapidMorphEntries.length&&(!['charge-blade','switch-axe'].includes(weapon.kind)||rapidMorphEntries.some(x=>Number(x.skillId)!==7||!Number.isInteger(x.level)||x.level<1||x.level>3)))return fail('REAL_SLICE:RAPID_MORPH_SCOPE_OR_LEVEL_UNRESOLVED');
  if(rapidMorphEntries.length&&(!rapidRule||rapidRule.status!=='OWNER_APPROVED_PROVISIONAL'||resolvedTechniqueIds.some(id=>weapon.kind==='charge-blade'?(!root.ChargeBladeEngine?.techniques?.[id]&&!(Object.hasOwn(root.MHSaedGuardRapidMorphRule?.predecessors||{},id)&&root.TechniqueDBEngine.get('charge-blade',id)?.phialReference?.status==='PROVISIONALLY_ADOPTED')):!['SA_SWORD_VERTICAL','SA_SWORD_RIGHT_RISING','SA_SWORD_LEFT_RISING','SA_SWORD_MORPH_DOUBLE','SA_AXE_MORPH_SLASH'].includes(id))))return fail('REAL_SLICE:RAPID_MORPH_TECHNIQUE_SCOPE_UNRESOLVED');
  let ed1Rule=root.MHCBED1ResourceRule;
  const dischargeRules=root.MHCBDischargeResourceRules,resourcePlans={};
  const hRule=root.MHCBHRouteRule;
  const hRequested=weapon.kind==='charge-blade'&&resolvedTechniqueIds.some(id=>hRule?.prefixIds.includes(id));
  if(hRequested){
   if(hRule?.status!=='OWNER_APPROVED_PROVISIONAL'||JSON.stringify(resolvedTechniqueIds)!==JSON.stringify(hRule.techniqueIds))return fail('REAL_SLICE:CB_H_EXACT_SINGLE_ROUTE_REQUIRED');
   if(chargeBladeState?.mode!=='AXE'||chargeBladeState.previousAction!=='AXE_NEUTRAL'||chargeBladeState.shieldBoosted!==true||chargeBladeState.swordBoosted!==false||typeof chargeBladeState.axeBoosted!=='boolean')return fail('REAL_SLICE:CB_H_EXPLICIT_MODE_SHIELD_SWORD_REQUIRED');
   const hPhialPair=['IMPACT','POWER_ELEMENT'].includes(officialPhialType)&&chargeBladeState.phialType===officialPhialType;
   if(!hPhialPair)return fail('REAL_SLICE:CB_H_IMPACT_ONLY');
   // KAN-66 / 2026-11-04 owner decision, isolated from PR #1 candidate:
   // POWER_ELEMENT H shield thrust is one explosion, zero consumed phials.
   // This does not approve enhanced stock or unrelated skill extensions.
   if(officialPhialType==='POWER_ELEMENT'&&(hRule.prefixConsumption!==0||root.TechniqueDBEngine?.get('charge-blade','CB_SHIELD_THRUST')?.phialReference?.hitCount!==1))return fail('REAL_SLICE:CB_POWER_H_SHIELD_OWNER_CONTRACT_MISMATCH');
   if(chargeBladeState.enhancedPhial!==false||chargeBladeState.enhancedPhials!==0)return fail('REAL_SLICE:CB_H_NORMAL_PHIAL_ONLY');
  }
  const ed1Requested=weapon.kind==='charge-blade'&&resolvedTechniqueIds.some(id=>dischargeRules?.predecessors?.[id]);
  if(ed1Requested){
   if(!ed1Rule||ed1Rule.status!=='OWNER_APPROVED'||dischargeRules?.status!=='OWNER_APPROVED')return fail('REAL_SLICE:CB_ED1_RESOURCE_CONTRACT_UNAVAILABLE');
   if(new Set(resolvedTechniqueIds).size!==resolvedTechniqueIds.length||resolvedTechniqueIds.some(id=>!dischargeRules.predecessors[id]&&!(hRequested&&hRule.prefixIds.includes(id))))return fail('REAL_SLICE:CB_DISCHARGE_SEQUENCE_SCOPE_UNCONNECTED');
   if(typeof chargeBladeState?.axeBoosted!=='boolean')return fail('REAL_SLICE:CB_ED1_NORMAL_PHIAL_EXPLICIT_AXE_REQUIRED');
   const explicitEnhanced=chargeBladeState.enhancedPhials!=null;
   if(!explicitEnhanced&&chargeBladeState.enhancedPhial!==false)return fail('REAL_SLICE:CB_ED1_ENHANCED_STOCK_REQUIRED');
   let enhanced=explicitEnhanced?chargeBladeState.enhancedPhials:0,normal=chargeBladeState.normalPhials,previous=chargeBladeState.previousAction;
   if(typeof enhanced!=='number'||!Number.isSafeInteger(enhanced*2)||enhanced<0)return fail('REAL_SLICE:CB_ED1_ENHANCED_STOCK_INVALID');
   if(typeof normal!=='number'||!Number.isSafeInteger(normal*2)||normal<0)return fail('REAL_SLICE:CB_ED1_START_STATE_UNRESOLVED');
   if(previous==='GUARD'&&chargeBladeState.shieldBoosted!==false)return fail('REAL_SLICE:CB_GUARD_AED_SHIELD_STATE_UNSUPPORTED');
   const amount=dischargeRules.baseConsumption*(chargeBladeState.axeBoosted?ed1Rule.axeBoostedConsumptionMultiplier:1);
   for(const id of resolvedTechniqueIds){
    if(hRequested&&hRule.prefixIds.includes(id)){
     const morph=id==='CB_AXE_TO_SWORD_MORPH';
     resourcePlans[id]={id:'CB_H_PREFIX_RESOURCE',status:'OWNER_APPROVED_PROVISIONAL',techniqueId:id,consumeNormalPhials:hRule.prefixConsumption,resourceKey:'normalPhials',consumedPhialKind:'NORMAL',requiredPreviousAction:previous,requiredMode:morph?'AXE':'SWORD',endMode:'SWORD',nextPreviousAction:morph?id:'SHIELD_THRUST',source:hRule.source,rapidMorphExcludedEffectIds:[]};
     previous=resourcePlans[id].nextPreviousAction;continue;
    }
    if(!dischargeRules.predecessors[id].includes(previous))return fail('REAL_SLICE:CB_DISCHARGE_PREDECESSOR_UNRESOLVED:'+id);
    if(enhanced>0&&enhanced<amount)return fail('REAL_SLICE:CB_ED1_CROSS_TYPE_DAMAGE_ALLOCATION_UNRESOLVED');
    const resourceKey=enhanced>0?'enhancedPhials':'normalPhials';
    resourcePlans[id]={...ed1Rule,techniqueId:id,consumeNormalPhials:amount,resourceKey,consumedPhialKind:enhanced>0?'ENHANCED':'NORMAL',prioritySource:dischargeRules.prioritySource,source:id==='CB_ELEMENT_DISCHARGE_1'?ed1Rule.source:dischargeRules.source,requiredPreviousAction:previous,rapidMorphExcludedEffectIds:Object.entries(dischargeRules.rapidMorphOrigins).flatMap(([tech,origins])=>origins.map(origin=>'rapid-morph-discharge:'+tech+':'+origin)),predecessorSource:dischargeRules.predecessorSource,axeBoosted:chargeBladeState.axeBoosted,...(hRequested?{requiredMode:id==='CB_AED'?'SWORD':'AXE',endMode:'AXE'}:{})};
    // Planning chooses coefficients only. L5 validates and commits actual consumption atomically.
    if(resourceKey==='enhancedPhials')enhanced=Math.max(0,enhanced-amount);else normal=Math.max(0,normal-amount);
    previous=id;
   }
  }
  if(weapon.kind==='charge-blade'&&rapidMorphLevel>1){
   const originPending=resolvedTechniqueIds.find(id=>['CB_SAED','CB_SAED_AED_DERIVED'].includes(id));
   if(originPending&&!(resolvedTechniqueIds.length===root.MHSaedGuardRapidMorphRule?.count&&Object.hasOwn(root.MHSaedGuardRapidMorphRule.predecessors,originPending)&&chargeBladeState?.previousAction===root.MHSaedGuardRapidMorphRule.predecessors[originPending]))return fail('REAL_SLICE:CB_RAPID_MORPH_ORIGIN_UNRESOLVED:'+originPending);
  }
  if(weapon.kind==='charge-blade'&&resolvedTechniqueIds.includes('CB_SWORD_TO_AXE_MORPH')){
   if(typeof chargeBladeState?.axeBoosted!=='boolean'||typeof chargeBladeState?.shieldBoosted!=='boolean')return fail('REAL_SLICE:CB_MORPH_SHIELD_AXE_STATE_REQUIRED');
   if(chargeBladeState.axeBoosted&&resolvedTechniqueIds.length!==1)return fail('REAL_SLICE:CB_MORPH_AXE_BOOST_SEQUENCE_UNCONNECTED');
  }
  const techniques={};
  const resolveReferenceState=(referenceKind,id,technique,rawState)=>{
   const state={...(rawState||{})},sourceState=technique?.specialSourceValues||{};
   if(referenceKind==='heavy-bowgun-wyvern'){
    state.range=hbgState?.range??null;state.shotOrdinal=hbgState?.shotOrdinal;state.fullMagazine=hbgState?.fullMagazine;state.magazineCapacity=hbgState?.magazineCapacity;
    if((referenceSkills.firstShot>0||referenceSkills.forceShot>0)&&state.magazineCapacity!==weapon.ammo.find(x=>x.kind==='wyvern')?.capacity)throw Error('HBG_WYVERN:SHOT_CAPACITY_MISMATCH');
   }else if(['heavy-bowgun-element','light-bowgun-element'].includes(referenceKind)){
    if(referenceKind==='light-bowgun-element')state.elementType=String(state.ammoType||'').toLowerCase();
    // MHDB ammo enum differs from the existing elemental hitzone/UI keys.
    const ammoKind={fire:'flaming',water:'water',thunder:'thunder',ice:'freeze',dragon:'dragon'}[state.elementType];
    state.weaponAmmoEntry=ammoKind?weapon.ammo?.find(x=>x.kind===ammoKind&&x.level===state.ammoLevel)||null:null;
    state.capacityIndependentBaseHbg=referenceKind==='heavy-bowgun-element'&&root.MHBaseHbgCapacityIndependentAmmo?.(weapon,state.weaponAmmoEntry)===true;
    if(state.capacityIndependentBaseHbg&&['magazineCapacity','shotOrdinal','fullMagazine','loadedRounds'].some(k=>state[k]!==undefined&&state[k]!==null))throw Error('HBG_ELEMENT:BASE_ARTIA_CAPACITY_STATE_UNRESOLVED');
    state.magazineCapacity=state.weaponAmmoEntry?.capacity??null;
    if(referenceKind==='light-bowgun-element'&&state.rapidMagazine==='EQUIPPED'){
     const rule=techniqueDb.get('light-bowgun','LBG_ELEMENT_FIRST_HIT_REFERENCE')?.specialSourceValues?.rapidElement;
     if(state.shotMode!=='RAPID'||state.fullMagazine!==true||!state.weaponAmmoEntry?.completionEvidence||rule?.rapidMagazineCapacityAdd!==1)throw Error('LBG_ELEMENT:RAPID_MAGAZINE_RELOAD_REQUIRED');
     state.magazineCapacity+=rule.rapidMagazineCapacityAdd;
     state.rapidMagazineEvidence={source:rule.source,status:rule.status,scope:'RELOADED_IN_RAPID_MODE_FULL_START',bonus:rule.rapidMagazineCapacityAdd};
    }
   }else if(referenceKind==='light-bowgun'){
    const level=Number(String(id).match(/^LBG_NORMAL_(?:AMMO|RAPID(?:_NATIVE)?)_([123])$/)?.[1]||0);
    if(!Number.isInteger(level)||level<1)return state;
    state.ammoLevel=state.ammoLevel??level;
    state.weaponAmmoEntry=Array.isArray(weapon?.ammo)?weapon.ammo.find(x=>x?.kind==='normal'&&x.level===(technique.rapidRule?.baseAmmoLevel||level))||null:null;
    state.magazineCapacity=state.weaponAmmoEntry?.capacity??null;
    if(!normalAmmoSequence&&!rapidAmmoSequence&&(referenceSkills.firstShot>0||referenceSkills.forceShot>0)&&(!Number.isInteger(state.magazineCapacity)||state.magazineCapacity<1||state.shotOrdinal>state.magazineCapacity))throw Error('REAL_SLICE:LBG_SHOT_CAPACITY_UNRESOLVED');
    state.resolutionSource=state.resolutionSource||'TECHNIQUE_DB_AMMO_LEVEL_FROM_ID';
   }else if(referenceKind==='heavy-bowgun'){
    state.ammoType=state.ammoType??null;
    state.contactPolicy=state.contactPolicy??(sourceState.hitCount===3?'ALL_THREE':null);
    const expectedLevel=Number(String(id).match(/^HBG_NORMAL_AMMO_([123])$/)?.[1]||0);
    state.weaponAmmoEntry=Array.isArray(weapon?.ammo)?weapon.ammo.find(x=>String(x?.kind||'').toLowerCase()==='normal'&&Number(x?.level)===expectedLevel)||null:null;
    state.resolutionSource=state.resolutionSource||'TECHNIQUE_DB_SPECIAL_SOURCE_VALUES';
   }
   if(!normalAmmoSequence&&weapon.artiaCalculationEvidence?.capacityEvidence?.bonus>0&&['light-bowgun','heavy-bowgun'].includes(referenceKind)){
    if(!state.weaponAmmoEntry||!Number.isInteger(state.weaponAmmoEntry.capacity))throw Error('REAL_SLICE:ARTIA_CAPACITY_BASE_AMMO_UNRESOLVED');
    state.magazineCapacity=state.weaponAmmoEntry.capacity;
    state.capacityEvidence=weapon.artiaCalculationEvidence.capacityEvidence;
   }
   return state;
  };
  const hhModel=weapon.kind==='hunting-horn'&&huntingHornState?.model===root.TechniqueDBEngine?.eventModels?.hhNormalMelody?.id?root.TechniqueDBEngine?.eventModels?.hhNormalMelody:null;
  if(weapon.kind==='hunting-horn'&&huntingHornState?.model&&!hhModel)return fail('REAL_SLICE:HH_MODEL_UNKNOWN');
  // Status/exhaust buildup is outside HP damage; only non-awakened ordinary body Hits.
  // Source: https://kuroyonhon.com/mhwilds/memo/11.php (phial effects); no proc damage model.
  const saStatusBodyOnly=weapon.kind==='switch-axe'&&switchAxeState?.awakened===false&&['poison','paralyze','exhaust'].includes(weapon.phial?.kind)&&resolvedTechniqueIds.every(id=>{const t=root.TechniqueDBEngine?.get('switch-axe',id);return t&&Array.isArray(t.hits)&&t.hits.length>0&&!t.referenceKind&&!(t.specialComponents||[]).length&&t.hits.every(h=>!h.componentSource);});
  const saAwakened=weapon.kind==='switch-axe'&&switchAxeState?.awakened===true?root.TechniqueDBEngine?.eventModels?.saAwakened:null;
  const saDragonEligible=!!(saDragonState?.elementKnown&&resolvedTechniqueIds.every(id=>{const t=root.TechniqueDBEngine?.get('switch-axe',id);return (t?.modeContract||['SWORD','AXE'].includes(t?.stateRequirement?.mode))&&Array.isArray(t.hits)&&t.hits.length>0&&!t.referenceKind&&!(t.specialComponents||[]).length;}));
  const saStatusAwakened=!!(saAwakened?.statusPhialExtension?.status==='SOURCE_CONFIRMED_PROVISIONAL'&&saAwakened.statusPhialExtension.kinds.includes(weapon.phial?.kind));
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
  // These newly reconciled charged records define the full-charge owner target only.
  // Arbitrary explicit single actions need a separate charge-state contract.
  if(weapon.kind==='insect-glaive'&&resolvedTechniqueIds.some(id=>['IG_ENHANCED_DESCENDING_THRUST','IG_RISING_SPIRAL_SLASH'].includes(id))&&JSON.stringify(resolvedTechniqueIds)!==JSON.stringify(['IG_TRIPLE_SIDESTEP_SLASH','IG_TRIPLE_ADVANCING_COMBO','IG_ENHANCED_DESCENDING_THRUST','IG_RISING_SPIRAL_SLASH']))return fail('REAL_SLICE:IG_CHARGED_TARGET_SEQUENCE_REQUIRED');
  const glTargetIds=['GL_SLAM','GL_SWEEP','GL_WYRMSTAKE_FULL_BURST','GL_MULTI_WYRMSTAKE_FULL_BURST'];
  const glTargetRequested=weapon.kind==='gunlance'&&resolvedTechniqueIds.some(id=>glTargetIds.slice(2).includes(id));
  let glTargetContext=null;
  if(glTargetRequested){
   if(JSON.stringify(resolvedTechniqueIds)!==JSON.stringify(glTargetIds))return fail('GL_TARGET:EXACT_OWNER_SEQUENCE_REQUIRED');
   const rules=techniqueDb.get('gunlance',glTargetIds[2])?.glTargetRules;
   const shellRules=techniqueDb.get('gunlance','GL_SHELL_NORMAL_MEDIUM')?.specialSourceValues?.p0ReferenceRules;
   const powerKey=gunlanceState?.shellingType+'_'+gunlanceState?.shellingPower,row=rules?.powerRows?.[powerKey];
   if(!rules||rules.status!=='OWNER_APPROVED_PROVISIONAL'||!row||!shellRules)return fail('GL_TARGET:SOURCE_POWER_PENDING');
   if(gunlanceState.stakeLoaded!==true)return fail('GL_TARGET:INITIAL_STAKE_REQUIRED');
   const mapped=root.GunlanceShellReference.resolveWeaponPower(weapon,shellRules);
   if(String(weapon.shell).toUpperCase()!==gunlanceState.shellingType||mapped!==gunlanceState.shellingPower)return fail('GL_TARGET:WEAPON_SHELL_METADATA_CONFLICT');
   const add=shellRules.loadShellsReference?.capacityAdds?.[shellingInput.loadShellsLevel],capacity=shellRules.baseCapacity[gunlanceState.shellingType]+add;
   if(!Number.isInteger(capacity)||!Number.isInteger(gunlanceState.loadedRounds)||gunlanceState.loadedRounds<1||gunlanceState.loadedRounds>capacity)return fail('GL_TARGET:INITIAL_ROUNDS_INVALID');
   glTargetContext={rules,row,capacity,input:shellingInput};
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
   if(glTargetContext&&glTargetContext.rules.actions[id]){
    const {rules,row,capacity,input}=glTargetContext,action=rules.actions[id];
    technique={...technique,specialComponents:[],calculationStatus:'READY_BODY_COMPONENT',
      hits:[...rules.body.map(h=>({...h,damageType:'slash'})),...Array.from({length:action.burstCount},()=>({mv:row.burstMv,elementModifier:rules.burstElementModifier,damageType:'slash',glComponent:'STAKE_BURST'}))],
      glModel:{...glTargetContext,action,id},glComponentContract:{status:rules.status,source:rules.source,noSharpnessMultiplier:rules.noSharpnessMultiplier}};
   }
   if(weapon.kind==='insect-glaive'&&technique){
    if(!technique.hits?.length)return fail('REAL_SLICE:IG_KINSECT_ONLY_OUT_OF_SCOPE');
    technique={...technique,specialComponents:(technique.specialComponents||[]).filter(x=>x!=='KINSECT')};
   }
   const referenceKind=weapon.kind==='heavy-bowgun'&&id==='HBG_WYVERN_AMMO'?'heavy-bowgun-wyvern':weapon.kind==='light-bowgun'&&id==='LBG_ELEMENT_FIRST_HIT_REFERENCE'?'light-bowgun-element':weapon.kind==='heavy-bowgun'&&id==='HBG_ELEMENT_FIRST_HIT_REFERENCE'?'heavy-bowgun-element':weapon.kind==='bow'&&['BOW_SHOT_3','BOW_POWER_SHOT_3','BOW_POWER_VOLLEY_3','BOW_THOUSAND_DRAGONS'].includes(id)?'bow':weapon.kind==='heavy-bowgun'&&/^HBG_NORMAL_AMMO_[123]$/.test(id)?'heavy-bowgun':weapon.kind==='light-bowgun'&&/^LBG_NORMAL_(?:AMMO_[12]|RAPID_[123]|RAPID_NATIVE_3)$/.test(id)?'light-bowgun':weapon.kind==='charge-blade'&&['CB_SAED','CB_SAED_AED_DERIVED'].includes(id)?'charge-blade-saed':weapon.kind==='hunting-horn'&&['HH_PERFORMANCE_SHOCKWAVE','HH_ECHO_BUBBLE_FOLLOWUP','HH_ECHO_BUBBLE_MELODY_EVENT','HH_MELODY_COMPLETION_FIXED_10'].includes(id)?'hunting-horn-sound':null;
   if(referenceKind){const rawState=referenceKind==='heavy-bowgun-wyvern'?{...conditions.hbgWyvernState,...conditions.combatBuffs}:referenceKind==='bow'?bowState:['heavy-bowgun','heavy-bowgun-element'].includes(referenceKind)?hbgState:['light-bowgun','light-bowgun-element'].includes(referenceKind)?lightBowgunState:referenceKind==='charge-blade-saed'?{...chargeBladeState,ammoLoadingLevel:Math.max(0,...loadShellEntries.map(x=>x.level))}:huntingHornState;technique={...technique,referenceKind,referenceInput:{state:resolveReferenceState(referenceKind,id,technique,rawState),skills:referenceKind==='heavy-bowgun-wyvern'?{firstShot:referenceSkills.firstShot,forceShot:referenceSkills.forceShot,artilleryLevel:Math.max(0,...artilleryEntries.map(x=>x.level)),fireLevel:Math.max(0,...allSkills.filter(x=>['火属性攻撃強化','Fire Attack'].includes(x.name)).map(x=>x.level))}:referenceSkills,criticalBoostLevel:referenceCriticalBoostLevel,sourceTechniqueId:id}};}
   if(!technique)return fail('REAL_SLICE:TECHNIQUE_NOT_FOUND:'+id);
   if(hhModel)technique={...technique,hhModel:{...hhModel,action:hhModel.techniques[id],input:huntingHornState,specialRecords:Object.fromEntries(['HH_PERFORMANCE_SHOCKWAVE','HH_ECHO_BUBBLE_FOLLOWUP','HH_ECHO_BUBBLE_MELODY_EVENT','HH_MELODY_COMPLETION_FIXED_10'].map(key=>[key,techniqueDb.get('hunting-horn',key)]))}};
   const normalContract=STANDARD_NORMAL_HIT_CONTRACT[id];
   if(normalContract&&!technique.referenceKind&&!Array.isArray(technique.specialComponents)){
    technique={...technique,stateRequirement:technique.stateRequirement&&Object.keys(technique.stateRequirement).length?technique.stateRequirement:(normalContract.stateRequirement||{}),hits:(technique.hits||[]).map(hit=>({...hit,damageType:hit.damageType??normalContract.damageType,partModifier:hit.partModifier??normalContract.partModifier,partModifierSource:hit.partModifierSource??normalContract.source}))};
   }
   // KAN-22: source-confirmed ordinary body HP reference, not a durability/official-version promotion.
   if(weapon.kind==='insect-glaive'&&['IG_DIAGONAL_SLASH','IG_SWEEP','IG_DOUBLE_SLASH'].includes(id)){
    if(insectGlaiveState?.extractState!=='NO_EXTRACT')return fail('REAL_SLICE:IG_REFERENCE_EXTRACT_STATE_REQUIRED');
    if(insectGlaiveState?.kinsectState!=='STOWED')return fail('REAL_SLICE:IG_REFERENCE_KINSECT_STOWED_REQUIRED');
    const raw=techniqueDb.get(techniqueKind,id);
    if(raw.numericStatus!=='SOURCE_CONFIRMED'||raw.specialComponents?.length||raw.excludedComponents?.length||Object.keys(raw.stateRequirement||{}).length||!raw.hits?.length||raw.hits.some(h=>!Number.isFinite(h.mv)||h.mv<0||!Number.isFinite(h.elementModifier)||h.elementModifier<0||h.damageStatsState!=null))return fail('REAL_SLICE:IG_REFERENCE_BODY_SOURCE_PENDING');
    technique={...technique,calculationStatus:'READY_HP_REFERENCE',adoption:{status:'EXISTING_ADOPTED_REFERENCE',scope:'KAN22_NO_EXTRACT_STOWED_BODY_HP_ONLY',verificationStatus:raw.verificationStatus,source:id==='IG_DOUBLE_SLASH'?'docs/reports/kan22-double-slash/REPORT.md':'docs/reports/kan-22/REPORT.md',sourceCalculationStatus:raw.calculationStatus,unresolvedReasons:raw.unresolvedReasons||[]},hits:raw.hits.map(h=>({...h,damageType:h.damageType??STANDARD_NORMAL_HIT_CONTRACT.IG_DIAGONAL_SLASH.damageType}))};
   }
   if(weapon.kind==='lance'&&id==='LAN_COUNTER_DOUBLE_THRUST'){
    const raw=techniqueDb.get('lance',id),rule=raw?.counterReference;
    if(resolvedTechniqueIds.length!==1)return fail('REAL_SLICE:LANCE_COUNTER_SINGLE_ACTION_REQUIRED');
    if(!rule||rule.status!=='OWNER_APPROVED_PROVISIONAL'||rule.stage!=='coefficient'||!Number.isFinite(rule.physicalMultiplier)||rule.physicalMultiplier<=0||raw.hits?.length!==2||raw.specialComponents?.length)return fail('REAL_SLICE:LANCE_COUNTER_SOURCE_PENDING');
    if(lanceState?.counter!==rule.input)return fail('REAL_SLICE:LANCE_COUNTER_EXPLICIT_CHARGE3_SUCCESS_REQUIRED');
    technique={...technique,calculationStatus:'READY_HP_REFERENCE',adoption:rule,hits:raw.hits.map(h=>({...h,damageType:rule.damageType}))};
   }
   if(weapon.kind==='insect-glaive'&&id==='IG_ENHANCED_DOUBLE_SLASH'){
    if(resolvedTechniqueIds.length!==1)return fail('REAL_SLICE:IG_ENHANCED_DOUBLE_SINGLE_ACTION_REQUIRED');
    if(insectGlaiveState?.extractState!=='TRIPLE_EXTRACT')return fail('REAL_SLICE:IG_ENHANCED_DOUBLE_TRIPLE_REQUIRED');
    if(insectGlaiveState?.kinsectState!=='STOWED')return fail('REAL_SLICE:IG_ENHANCED_DOUBLE_KINSECT_STOWED_REQUIRED');
    const raw=techniqueDb.get(techniqueKind,id);
    if(raw.numericStatus!=='SOURCE_CONFIRMED'||raw.verificationStatus!=='PARTIALLY_VERIFIED'||raw.specialComponents?.length||raw.excludedComponents?.length||raw.hits?.length!==3||raw.hits.some(h=>!Number.isFinite(h.mv)||h.mv<0||!Number.isFinite(h.elementModifier)||h.elementModifier<0||h.damageStatsState!=null))return fail('REAL_SLICE:IG_ENHANCED_DOUBLE_SOURCE_PENDING');
    technique={...technique,calculationStatus:'READY_HP_REFERENCE',stateRequirement:{tripleExtract:true},adoption:{status:'OWNER_APPROVED_PROVISIONAL',scope:'TRIPLE_EXTRACT_STOWED_SINGLE_ACTION_THREE_BODY_HITS_HP_ONLY',source:'MACARONGAMEMO_IG_R49_SOURCE;KUROYONHON_IG_R49_CHECK',sourceCalculationStatus:raw.calculationStatus,sourceCurrentVersionAudit:raw.currentVersionAudit,liveGameVerification:'PENDING'},hits:raw.hits.map(h=>({...h,damageStatsState:'TRIPLE_EXTRACT',damageType:h.damageType??STANDARD_NORMAL_HIT_CONTRACT.IG_DIAGONAL_SLASH.damageType}))};
   }
   if(id==='IG_ENHANCED_DIAGONAL_SLASH')technique={...technique,hpOnlyProvisional:'IG_ENHANCED_DIAGONAL_SLASH_20261025',stateRequirement:{tripleExtract:true}};
   if((technique.phialReference?.status==='OBSERVED'||(hRequested&&id==='CB_SHIELD_THRUST'&&technique.phialReference?.status==='OWNER_APPROVED_PROVISIONAL'))&&Number.isInteger(technique.phialReference.hitCount)){
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
   if(resolvedTechniqueIds.some(id=>!techniques[id]?.modeContract&&!techniques[id]?.stateRequirement?.mode&&!STANDARD_NORMAL_HIT_CONTRACT[id]?.stateRequirement?.mode))return fail('REAL_SLICE:SA_TECHNIQUE_MODE_UNRESOLVED');
   if(!switchAxeState||!['SWORD','AXE'].includes(switchAxeState.mode))return fail('REAL_SLICE:STATE_REQUIREMENT_UNRESOLVED:mode');
   const startMode=techniques[resolvedTechniqueIds[0]]?.modeContract?.startMode||techniques[resolvedTechniqueIds[0]]?.stateRequirement?.mode||STANDARD_NORMAL_HIT_CONTRACT[resolvedTechniqueIds[0]]?.stateRequirement?.mode;
   if(startMode!==switchAxeState.mode)return fail('REAL_SLICE:STATE_REQUIREMENT_MISMATCH:mode');
   if(typeof switchAxeState.awakened!=='boolean')return fail('REAL_SLICE:SA_AWAKENED_STATE_UNRESOLVED');
   if(!saStatusBodyOnly&&!saStatusAwakened&&!saDragonEligible&&!['power','element'].includes(weapon.phial?.kind))return fail('REAL_SLICE:SA_PHIAL_EFFECT_UNRESOLVED:'+String(weapon.phial?.kind||'missing'));
  }
  const isShellingTechnique=id=>{const r=techniques[id];return Array.isArray(r?.specialComponents)&&r.specialComponents.some(x=>String(x).includes('SHELL'));};
  const isShellingOnly=resolvedTechniqueIds.every(isShellingTechnique);
  const hasShelling=!!glTargetContext||resolvedTechniqueIds.some(isShellingTechnique);
  const isReferenceOnly=resolvedTechniqueIds.every(id=>['bow','heavy-bowgun','heavy-bowgun-element','light-bowgun-element','light-bowgun','charge-blade-saed','hunting-horn-sound','heavy-bowgun-wyvern'].includes(techniques[id]?.referenceKind));
  const hasReference=!!hhModel||resolvedTechniqueIds.some(id=>['bow','heavy-bowgun','heavy-bowgun-element','light-bowgun-element','light-bowgun','charge-blade-saed','hunting-horn-sound','heavy-bowgun-wyvern'].includes(techniques[id]?.referenceKind));
  // Validate every ordinary Hit before resolving its own hitzone. Special components do not enter this path.
  const ordinaryHitDamageType=(id,hit)=>{
   if(hit.damageType!==undefined&&hit.damageType!==null)return ['blunt','slash','pierce'].includes(hit.damageType)?hit.damageType:null;
   return STANDARD_NORMAL_HIT_CONTRACT[id]?.damageType??(['hammer','hunting-horn'].includes(weapon.kind)?'blunt':weapon.kind==='charge-blade'?'slash':null);
  };
  const physicalKeys=resolvedTechniqueIds.filter(id=>!techniques[id]?.referenceKind&&!isShellingTechnique(id)).flatMap(id=>(techniques[id]?.hits||[]).map(hit=>ordinaryHitDamageType(id,hit)));
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
   if(ownerExcludedBonus(e))return true;
   if(e.bonusSkillId===178){
    const rule=root.MHGogElementRule,rank=e.rankLevel,required=rank===1?2:4,rows=conversionGroupPlan?.applied?.filter(a=>a.skillId===178)||[],a=rows[0];
    if(!rule||![1,2].includes(rank)||e.name!==rule.names[rank]||e.bonusName!==rule.parent||e.source!=='series'||e.required!==required||!Number.isInteger(e.count)||e.count<required||(rank===1&&e.count>=4)||rows.length!==1||activeBonusEffects.filter(x=>x.bonusSkillId===178).length!==1||!a?.gogActivation)return false;
    const enabled=['fire','water','thunder','ice','dragon'].includes(elementType)&&elementValue>0;
    return ['bonusSkillId','name','bonusName','source','rankLevel','required','count'].every(k=>a.gogActivation[k]===e[k])&&a.rank===rank&&a.attackAdd===0&&a.attackMultiplier===1&&a.elementMultiplier===(enabled?rule.multipliers[rank]:1)&&a.elementAdd===(enabled?rule.displayAdds[rank]:0)&&a.condition===rule.condition&&a.appliesToNormal===false&&a.evidenceRef===rule.source;
   }
   if(validatedNonDamageBonuses.includes(e)){
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
   if([62,70].includes(e.bonusSkillId)&&conditions.standardEvaluation===true){
    const expected=root.standardGroupPowerPlan({...stats,weaponId:weapon.id},conditions.gutsState??'BEFORE',skillTotal,weapon.kind,conditions).applied.filter(a=>a.skillId===e.bonusSkillId);
    return applied.length===1&&expected.length===1&&JSON.stringify(applied[0])===JSON.stringify(expected[0]);
   }
   return applied.length===1&&applied[0].skill===e.name&&applied[0].rank===rank&&applied[0].attackAdd===rule.adds[rank]&&applied[0].attackMultiplier===1&&applied[0].appliesToNormal===false&&applied[0].condition===rule.condition&&applied[0].scope==='NORMAL_INACTIVE_MAXIMUM_PREACTIVATED';
  })&&Array.isArray(conversionGroupPlan?.unresolvedEffects)&&conversionGroupPlan.unresolvedEffects.length===0&&Array.isArray(conversionSelfPlan?.pending)&&conversionSelfPlan.pending.length===0;
  const attributeBowScope=attributeRule?.bowScope;
  const attributeBowResolved=weapon.kind==='bow'&&attributeBowScope?.status==='OWNER_APPROVED_PROVISIONAL'&&(JSON.stringify(resolvedTechniqueIds)===JSON.stringify(attributeBowScope.techniqueIds)||(resolvedTechniqueIds.length===1&&bowState?.startShot===1&&attributeBowScope.techniqueIds.includes(resolvedTechniqueIds[0])))&&resolvedTechniqueIds.every(id=>techniques[id]?.referenceKind==='bow')&&(bowState?.coating===attributeBowScope.coating||(['POWER','CLOSE_RANGE','PIERCE'].includes(bowState?.coating)&&root.MHConversionComponentScope?.scope.includes('BOW_THREE')&&resolvedTechniqueIds.every(id=>root.BowReference.hitsForState(root.TechniqueDBEngine,id,bowState).every(h=>Number.isFinite(h.elementModifier)))))&&bowState?.range===attributeBowScope.range;
  const conversionScope=root.MHConversionComponentScope;
  // Gate by the actual adopted record/component contract, not weapon-kind blanket permission.
  const componentsSupported=(allow152Mixed=false,allow165CbMixed=false)=>conversionScope?.status==='OWNER_APPROVED_PROVISIONAL'&&resolvedTechniqueIds.every(id=>{
   const t=techniques[id];if(!t)return false;
   const mixed=allow165CbMixed?root.MHThunderConversionCbMixedScope:root.MHAttributeConversionMixedScope;
   if((allow152Mixed||allow165CbMixed)&&mixed?.skillId===(allow165CbMixed?165:152)&&mixed.status==='OWNER_APPROVED_PROVISIONAL'){
    if(!allow165CbMixed&&weapon.kind==='gunlance'&&mixed.shellActions.includes(t.shellingAction))return !!t.shellingResource&&t.numericStatus==='SOURCE_CONFIRMED'&&!!t.specialSourceValues?.p0ReferenceRules;
    if(weapon.kind==='charge-blade'&&mixed.impactTechniqueIds.includes(id)&&officialPhialType==='IMPACT')return t.phialState?.phialType==='IMPACT'&&(t.phialReference?.status==='OBSERVED'||(hRequested&&id==='CB_SHIELD_THRUST'&&t.phialReference?.status==='OWNER_APPROVED_PROVISIONAL'))&&!!resourcePlans[id]&&typeof root.ChargeBladeEngine?.formulas?.IMPACT_PHIAL?.evaluate==='function'&&(t.hits||[]).every(h=>!h.componentSource||h.componentSource==='index.html:CHARGE_BLADE_TECHNIQUES.'+id+'.axeBoostHits');
   }
   if(hRequested&&id==='CB_SHIELD_THRUST'&&officialPhialType==='POWER_ELEMENT')return t.phialReference?.hitCount===1&&hRule.prefixConsumption===0&&t.phialState?.phialType==='POWER_ELEMENT'&&!!resourcePlans[id]&&(t.hits||[]).every(h=>!h.componentSource);
   if(t.glModel)return t.glModel.rules.status==='OWNER_APPROVED_PROVISIONAL'&&!!glTargetContext;
   if(t.shellingAction)return false;
   if(t.referenceKind==='bow')return attributeBowResolved;
   if(t.referenceKind==='charge-blade-saed')return conversionScope.cbTechniques.includes(id)&&officialPhialType==='POWER_ELEMENT';
   if(t.referenceKind)return false;
   if(t.hhModel)return !!hhModel&&Object.values(t.hhModel.specialRecords||{}).every(r=>conversionScope.hhEvents.includes(r.techniqueId||r.id));
   if(weapon.kind==='switch-axe')return conversionScope.saTechniques.includes(id)&&['power','element'].includes(weapon.phial?.kind);
   const cb=root.ChargeBladeEngine?.techniques?.[id];
   if(t.hits?.some(h=>h.componentSource)||cb?.phial)return conversionScope.cbTechniques.includes(id)&&(!cb?.phial||officialPhialType==='POWER_ELEMENT')&&(t.hits||[]).every(h=>!h.componentSource||h.componentSource==='index.html:CHARGE_BLADE_TECHNIQUES.'+id+'.axeBoostHits');
   return !t.specialComponents?.length;
  });
  const conversionComponentsSupported=componentsSupported(false,true);
  const attributeScopeSupported=elementType==='dragon'&&componentsSupported(true);
  let attributeScopeIssue=null;
  if(attributeConversionLevel){
   if(!attributeRule||attributeRule.status!=='OWNER_APPROVED_PROVISIONAL'||allSkills.filter(x=>x.skillKey==='attributeConversion').some(x=>Number(x.skillId)!==152||!['属性変換','Convert Element'].includes(x.name)||!Number.isInteger(x.level)||x.level<1||x.level>3))return fail('REAL_SLICE:ATTRIBUTE_CONVERSION_RULE_UNRESOLVED');
   if(!attributeScopeSupported)attributeScopeIssue='REAL_SLICE:ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTED';
   else if((attributeState?.normal===true||attributeState?.maximum===true)&&(!Number.isInteger(elementValue+attributeRule.adds[attributeConversionLevel])||root.MHWElementCapRule?.status!=='OWNER_APPROVED_PROVISIONAL'||!Number.isFinite(root.MHWElementCapRule?.flat)||!Number.isFinite(root.MHWElementCapRule?.multiplier)||(activeBonusEffects.length&&!conversionResistanceBonusesResolved)))attributeScopeIssue='REAL_SLICE:ATTRIBUTE_CONVERSION_CAP_INTERACTION_UNRESOLVED';
  }

  // R * c is exactly zero only inside the sourced coefficient domain. This
  // covers empty-equipment ordinary body/Bow fixtures with only conversion
  // and validated static physical companions (attack/affinity/critical damage),
  // not general wrong-element nonapplication or unknown-water coefficients.
  const zeroConversionKinds=['great-sword','long-sword','sword-shield','dual-blades','hammer','lance','bow'];
  // Thunder's sourced SA coefficient may multiply a proved zero, but a POWER
  // phial must not pass the generic no-phial proof. Keep this exact ordinary,
  // non-awakened mode-only route tied to the existing canonical producers.
  const zeroConversionSaBody=()=>{
   if(weapon.kind!=='switch-axe'||weapon.phial?.kind!=='power'||Object.keys(weapon.phial).some(k=>k!=='kind'))return false;
   const state=x=>x&&x.mode==='SWORD'&&x.awakened===false&&Object.keys(x).every(k=>['mode','awakened'].includes(k));
   if(!state(switchAxeState)||(conditions.switchAxeState!=null&&!state(conditions.switchAxeState))||(conditions.mode!=null&&conditions.mode!=='SWORD')||(conditions.awakened!=null&&conditions.awakened!==false))return false;
   const power=root.MHWeaponEffectDB?.switchAxe?.powerPhialSword;
   if(!power||!Object.isFrozen(power)||power.id!=='switch-axe-power-phial-physical'||power.target!=='physical'||power.stage!=='attack'||power.operation!=='multiply'||power.unit!=='dimensionless'||!Number.isFinite(power.amount)||power.amount<=0||power.source!=='https://kuroyonhon.com/mhwilds/memo/11.php'||power.status!=='PROVISIONALLY_ADOPTED'||power.condition?.type!=='always'||Object.keys(power.condition).length!==1)return false;
   const sequence=['SA_SWORD_RIGHT_RISING','SA_SWORD_LEFT_RISING','SA_SWORD_MORPH_DOUBLE','SA_AXE_MORPH_SLASH'];
   const modes=[['SWORD',['SWORD'],'SWORD'],['SWORD',['SWORD'],'SWORD'],['SWORD',['SWORD','AXE'],'AXE'],['AXE',['SWORD'],'SWORD']];
   return resolvedTechniqueIds.length===sequence.length&&resolvedTechniqueIds.every((id,i)=>{
    if(id!==sequence[i])return false;
    const raw=techniqueDb?.get?.('switch-axe',id),canonical=root.TechniqueDBEngine?.get?.('switch-axe',id),t=techniques[id],m=t?.modeContract,[start,hitModes,end]=modes[i];
    if(!raw||!canonical||!Object.isFrozen(canonical)||JSON.stringify(raw)!==JSON.stringify(canonical)||!t||t.techniqueId!==id||t.weaponType!=='switch-axe'||t.adoptionStatus!=='OWNER_APPROVED_PROVISIONAL'||t.liveGameVerification!=='PENDING')return false;
    if(t.damageStateTransition!=null||t.damageStatsState!=null||t.stateStatsByState!=null||t.hpOnlyProvisional!=null||t.referenceKind||t.phialReference||t.saAwakened||t.hhModel||t.glModel||t.resourceContract||t.phialState||t.specialSourceValues!=null)return false;
    if([t.specialComponents,t.excludedComponents].some(parts=>parts!==undefined&&(!Array.isArray(parts)||parts.length)))return false;
    if(!Array.isArray(t.hits)||t.hits.length!==hitModes.length||!t.hits.every(h=>h.damageStatsState==null&&h.stateStatsByState==null&&!h.component&&!h.componentSource&&Number.isFinite(h.mv)&&h.mv>=0&&Number.isFinite(h.elementModifier)&&h.elementModifier>=0))return false;
    const normal=STANDARD_NORMAL_HIT_CONTRACT[id],expected=normal&&!Array.isArray(raw.specialComponents)?{...raw,stateRequirement:raw.stateRequirement&&Object.keys(raw.stateRequirement).length?raw.stateRequirement:(normal.stateRequirement||{}),hits:raw.hits.map(h=>({...h,damageType:h.damageType??normal.damageType,partModifier:h.partModifier??normal.partModifier,partModifierSource:h.partModifierSource??normal.source}))}:raw;
    if(JSON.stringify(t)!==JSON.stringify(expected))return false;
    if(i<2)return m==null&&t.stateRequirement?.mode===start&&Object.keys(t.stateRequirement).length===1;
    return t.stateRequirement?.mode===start&&Object.keys(t.stateRequirement).length===1&&m?.startMode===start&&m.endMode===end&&m.status==='OWNER_APPROVED_PROVISIONAL'&&m.scope==='NON_AWAKENED_BODY_MODE_ONLY_GAUGE_UNMODELED'&&Array.isArray(m.hitModes)&&m.hitModes.length===hitModes.length&&m.hitModes.every((mode,j)=>mode===hitModes[j]);
   });
  };
  const emptyResistance=x=>x?.status==='KNOWN_LIMITED'&&x.armorBase===0&&x.total===0&&x.reason===null&&x.absorptionPlan==null&&Array.isArray(x.missing)&&x.missing.length===0&&Array.isArray(x.contributions)&&x.contributions.length===0&&Array.isArray(x.rows)&&x.rows.length===5&&['head','chest','arms','waist','legs'].every(slot=>x.rows.filter(r=>r.slot===slot&&r.equipped===false&&r.value===0&&r.id==null).length===1);
  const zeroBodyState=x=>x?.element===0&&x.elementType==='none'&&x.elementKnown===true&&x.typeKnown===true&&x.elementStatus==='CONFIRMED_NONE'&&x.elementComponents?.weaponBase===0&&Number.isFinite(x.elementComponents.normalMultiplier)&&x.elementComponents.normalMultiplier>0&&x.elementComponents.normalFlat===0&&Array.isArray(x.activeBonusEffects)&&x.activeBonusEffects.length===0;
  const zeroConversionPhysical=e=>[{id:72,names:['攻撃','Attack Boost'],key:'attack'},{id:3,names:['見切り','Critical Eye'],key:'affinity'},{id:22,names:['超会心','Critical Boost'],key:'criticalBoost'}].some(r=>Number(e.skillId)===r.id&&r.names.includes(e.name)&&e.skillKey===r.key&&Number.isInteger(e.level)&&e.level>=1&&e.level<=5);
  const isolatedZeroConversion=(skillId,names,field)=>{
   const canonical=e=>Number(e.skillId)===skillId&&names.includes(e.name)&&e.level===1;
   const plan=stats.conditionalConditionPlan,cap=root.MHWElementCapRule;
   const noAppliedEffects=rows=>Array.isArray(rows)&&rows.length===0;
   return conditions.standardEvaluation===true&&((zeroConversionKinds.includes(weapon.kind)&&weapon.phial==null)||(skillId===165&&zeroConversionSaBody()))&&weapon.specials.length===0&&rawSkills.filter(canonical).length<=1&&buildSkills.filter(canonical).length===1&&[rawSkills,buildSkills].map(rows=>rows.filter(e=>!([133,152].includes(e.skillId)&&excludedCalculationPolicy(e)))).every(rows=>new Set(rows.map(e=>Number(e.skillId))).size===rows.length&&rows.every(e=>canonical(e)||zeroConversionPhysical(e)))&&
    [stats,plan?.normal,plan?.maximum].every(x=>zeroBodyState(x)&&emptyResistance(x?.[field]))&&plan?.maximumElementComponents?.weaponBase===0&&plan.maximumElementComponents.normalFlat===0&&plan.maximumElementComponents.conditionalFlat===0&&Number.isFinite(plan.maximumElementComponents.normalMultiplier)&&plan.maximumElementComponents.normalMultiplier>0&&
    noAppliedEffects(plan.applied)&&noAppliedEffects(plan.groupPlan?.applied)&&noAppliedEffects(plan.selfStatePlan?.normal)&&noAppliedEffects(plan.selfStatePlan?.maximum)&&[conditions,stats,plan.normal,plan.maximum,bowState,dualBladesState,longSwordState,lanceState].every(x=>x?.damageStatsState==null&&x?.stateStatsByState==null)&&conditions.combatBuffs&&['meal','charm','otherBuffs'].every(k=>conditions.combatBuffs[k]===null)&&
    cap?.status==='OWNER_APPROVED_PROVISIONAL'&&Number.isFinite(cap.flat)&&Number.isFinite(cap.multiplier)&&conversionComponentsSupported&&resolvedTechniqueIds.every(id=>{const t=techniques[id];return t?.techniqueId===id&&t.damageStatsState==null&&t.damageStateTransition==null&&t.hpOnlyProvisional==null&&!t.phialReference&&!t.saAwakened&&!t.hhModel&&(!t.referenceKind||(weapon.kind==='bow'&&t.referenceKind==='bow'))&&(t.specialComponents===undefined||(Array.isArray(t.specialComponents)&&t.specialComponents.length===0))&&(weapon.kind==='bow'||(Array.isArray(t.hits)&&t.hits.length>0))&&(t.hits||[]).every(h=>h.damageStatsState==null&&!h.componentSource&&Number.isFinite(h.mv)&&h.mv>=0&&Number.isFinite(h.elementModifier)&&h.elementModifier>=0);});
  };
  const waterZeroNoop=['long-sword','bow'].includes(weapon.kind)&&root.MHWaterConversionRule?.skillId===181&&root.MHWaterConversionRule.status==='OWNER_APPROVED_PROVISIONAL'&&root.MHWaterConversionRule.coefficients?.[weapon.kind]===4&&isolatedZeroConversion(181,['耐性変換【水】'],'waterResistanceInput');
  const thunderZeroNoop=isolatedZeroConversion(165,['耐性変換【雷】','Thunder Resistance Conversion'],'thunderResistanceInput');
  const zeroConversionDiagnostic={reason:[...rawSkills,...buildSkills].some(zeroConversionPhysical)?'EMPTY_EQUIPMENT_ZERO_ADD_WITH_STATIC_PHYSICAL_SKILLS':'ISOLATED_EMPTY_EQUIPMENT_ZERO_ADD',scope:'KNOWN_COEFFICIENT_ZERO_RESISTANCE_NORMAL_AND_MAXIMUM_NO_PRODUCERS',verificationStatus:'NOT_GAME_VERIFIED'};
  const waterEntries=allSkills.filter(x=>Number(x.skillId)===181),waterRule=root.MHWaterConversionRule,waterInput=stats.waterResistanceInput;
  const standardConversion=conditions.standardEvaluation===true;
  let conversionMaximumIssue=null;
  let waterConversionAdd=0;
  if(waterEntries.length){
   if(!waterRule||waterEntries.some(x=>x.name!==waterRule.name||x.level!==waterRule.level))return fail('REAL_SLICE:WATER_CONVERSION_LEVEL_INVALID');
   const issue=(()=>{
   if(!Object.hasOwn(waterRule.coefficients,weapon.kind)||(!waterZeroNoop&&elementType!==waterRule.elementType)||resolvedTechniqueIds.some(id=>weapon.kind==='bow'?techniques[id]?.referenceKind!=='bow':!!techniques[id]?.referenceKind||techniques[id]?.hits?.some(h=>h.componentSource)))return ('REAL_SLICE:WATER_CONVERSION_SCOPE_UNSUPPORTED');
   if(waterInput?.status!=='KNOWN_LIMITED'||!Number.isInteger(waterInput.total)||waterInput.total<0)return ('REAL_SLICE:WATER_RESISTANCE_UNRESOLVED:'+String(waterInput?.reason||'missing'));
   waterConversionAdd=waterInput.total*waterRule.coefficients[weapon.kind];
   })();
   if(issue){if(!standardConversion)return fail(issue);conversionMaximumIssue=issue;waterConversionAdd=0;}
  }
  const resistanceConversionLevel=Math.max(...allSkills.filter(x=>x.skillKey==='resistanceConversionThunder').map(x=>x.level),0),resistanceInput=stats.thunderResistanceInput,thunderResistance=resistanceInput?.total,resistanceKinds={"great-sword":5,hammer:5,'hunting-horn':5,'light-bowgun':2,'heavy-bowgun':2},resistanceConversionCoefficient=resistanceKinds[weapon.kind]??4;
  const thunderAmmoScope=['heavy-bowgun','light-bowgun'].includes(weapon.kind)&&resolvedTechniqueIds.length===1&&['HBG_ELEMENT_FIRST_HIT_REFERENCE','LBG_ELEMENT_FIRST_HIT_REFERENCE'].includes(resolvedTechniqueIds[0]);
  let resistanceConversionAdd=0;
  if(resistanceConversionLevel){
   if(allSkills.filter(x=>x.skillKey==='resistanceConversionThunder').some(x=>Number(x.skillId)!==165||!['耐性変換【雷】','Thunder Resistance Conversion'].includes(x.name)||x.level!==1))return fail('REAL_SLICE:THUNDER_RESISTANCE_CONVERSION_LEVEL_UNSUPPORTED');
   const issue=(()=>{
   if(!thunderAmmoScope&&((!thunderZeroNoop&&elementType!=='thunder')||!conversionComponentsSupported))return ('REAL_SLICE:THUNDER_CONVERSION_BODY_SCOPE_UNSUPPORTED');
   if(resistanceInput?.status!=='KNOWN_LIMITED'||!Number.isInteger(thunderResistance)||thunderResistance<0)return ('REAL_SLICE:THUNDER_RESISTANCE_UNRESOLVED:'+String(resistanceInput?.reason||'missing'));
   resistanceConversionAdd=thunderAmmoScope?0:thunderResistance*resistanceConversionCoefficient;
   // The adopted common engine caps this body element after the conversion flat.
   const candidate=elementValue+resistanceConversionAdd,capRule=root.MHWElementCapRule;
   if(!Number.isInteger(candidate)||capRule?.status!=='OWNER_APPROVED_PROVISIONAL'||!Number.isFinite(capRule?.flat)||!Number.isFinite(capRule?.multiplier)||(activeBonusEffects.length&&!conversionResistanceBonusesResolved))return ('REAL_SLICE:THUNDER_CONVERSION_CAP_OR_ROUNDING_SCOPE_UNRESOLVED');
   })();
   if(issue){if(!standardConversion)return fail(issue);conversionMaximumIssue=conversionMaximumIssue||issue;resistanceConversionAdd=0;}
  }
  if(elementSpecial && (!Number.isFinite(elementRawValue)||elementRawValue<0||!elementRule||stats.element!==elementValue||stats.elementType!==elementType))return fail('REAL_SLICE:CALCULATED_ELEMENT_NOT_PROVEN');
  if(statusState){
   const calculatedStatus=root.MHWElementState.fromValue(stats.element,stats.elementType);
   if(!calculatedStatus.elementKnown||calculatedStatus.elementType!==statusState.elementType||calculatedStatus.element!==statusState.element)return fail('REAL_SLICE:CALCULATED_STATUS_NOT_PROVEN');
  }else if(!elementSpecial && (!([0,null].includes(stats.element))||stats.elementType&&!['none',''].includes(String(stats.elementType))))return fail('REAL_SLICE:ELEMENT_NOT_ZERO_OR_UNKNOWN');
  const absorptionConversionInput=waterEntries.length?waterInput:resistanceConversionLevel?resistanceInput:null;
  const legacyAbsorptionPlan=excludedCalculationSkills.some(x=>x.skillId===133)?null:absorptionConversionInput?.absorptionPlan||null;
  const staticAbsorptionRule=root.MHElementAbsorptionSource;
  // Reuse adopted maximum activation values, without simulating received-hit counts.
  // Each conversion consumes only its corresponding resistance; multiple conversions remain gated.
  if(standardConversion&&waterEntries.length&&resistanceConversionLevel)conversionMaximumIssue='REAL_SLICE:MULTIPLE_RESISTANCE_CONVERSIONS_SCOPE_UNRESOLVED';
  const staticAbsorptionValid=legacyAbsorptionPlan&&Number.isInteger(legacyAbsorptionPlan.level)&&legacyAbsorptionPlan.level>=1&&legacyAbsorptionPlan.level<=3&&['RESOLVED','UNRESOLVED'].includes(legacyAbsorptionPlan.status)&&[null,'ABSORPTION_ELEMENT_REQUIRED'].includes(legacyAbsorptionPlan.reason)&&Number.isFinite(staticAbsorptionRule?.maximumActiveResistanceAdds?.[legacyAbsorptionPlan.level]);
  const absorptionConversionPlan=standardConversion&&staticAbsorptionValid?{skillId:133,level:legacyAbsorptionPlan.level,status:'RESOLVED',reason:null,normalResistanceAdd:0,maximumResistanceAdd:staticAbsorptionRule.maximumActiveResistanceAdds[legacyAbsorptionPlan.level],resistanceElement:waterEntries.length?'water':'thunder',condition:'NORMAL_INACTIVE_MAXIMUM_ACTIVE_NO_COUNT_INPUT',sourceUrl:staticAbsorptionRule.url,adoptionStatus:'OWNER_APPROVED_PROVISIONAL',verificationStatus:'NOT_GAME_VERIFIED'}:legacyAbsorptionPlan;
  const absorptionConversionCoefficient=waterEntries.length?waterRule.coefficients[weapon.kind]:resistanceConversionCoefficient;
  // Normal input remains the equipment resistance; absorbed resistance belongs only to maximum.
  const absorptionMaximumAdd=absorptionConversionPlan?.status==='RESOLVED'?absorptionConversionPlan.maximumResistanceAdd*absorptionConversionCoefficient:0;
  const versions={game:'1.042.00.02',equipment:'mhdb-source-unknown-game-version',technique:'tech-real',effects:'effects-real'};
  const originalConditionPlan=stats.conditionalConditionPlan||null;
  const resolvedConditionPlan=(waterEntries.length||resistanceConversionLevel||attributeConversionLevel)&&originalConditionPlan?{...originalConditionPlan,pending:(originalConditionPlan.pending||[]).filter(x=>!(waterEntries.length&&x==='耐性変換【水】:CONDITIONAL_DAMAGE_FORMULA_PENDING')&&!(resistanceConversionLevel&&x==='耐性変換【雷】:CONDITIONAL_DAMAGE_FORMULA_PENDING')&&!(attributeConversionLevel&&x==='属性変換:CONDITIONAL_DAMAGE_FORMULA_PENDING'))}:originalConditionPlan;
  const bowChargeRule=root.TechniqueDBEngine.get('bow','BOW_STATE_MODIFIERS')?.specialSourceValues?.skillRules?.chargeMaster;
  const bowChargeResolved=weapon.kind==='bow'&&referenceSkills.chargeMaster>0&&bowChargeRule?.component==='ELEMENT_BASE_MULTIPLIER_BEFORE_FLATS'&&allSkills.filter(x=>x.skillKey==='chargeMaster').every(x=>Number(x.skillId)===24&&Number.isInteger(x.level)&&x.level>=1&&x.level<=3&&Object.hasOwn(bowChargeRule.multipliers,x.level))&&resolvedTechniqueIds.every(id=>techniques[id]?.referenceKind==='bow'&&bowChargeRule.techniqueIds.includes(id));
  // Non-rapid ordinary elemental shots only. Source-backed provisional non-application.
  // MHDB 24 + kuroyonhon memo/28.php (bowguns have no listed applicable motions),
  // memo/14.php and /15.php distinguish ordinary firing from charged special actions.
  // Reviewed 2026-11-05; source game version and direct ON/OFF verification remain unknown.
  const ammoCMState=weapon.kind==='light-bowgun'?lightBowgunState:hbgState;
  const ammoCMId=weapon.kind==='light-bowgun'?'LBG_ELEMENT_FIRST_HIT_REFERENCE':weapon.kind==='heavy-bowgun'?'HBG_ELEMENT_FIRST_HIT_REFERENCE':null;
  const ammoCMEntries=allSkills.filter(x=>x.skillKey==='chargeMaster');
  const ammoChargeExcluded=!!ammoCMId&&ammoCMEntries.length>0&&ammoCMEntries.every(x=>Number(x.skillId)===24&&x.name==='チャージマスター'&&Number.isInteger(x.level)&&x.level>=1&&x.level<=3)&&resolvedTechniqueIds.length===1&&resolvedTechniqueIds[0]===ammoCMId&&ammoCMState?.normalModeLevel===0&&(weapon.kind!=='light-bowgun'||ammoCMState.shotMode==='NORMAL')&&['fire','water','thunder','ice'].includes(weapon.kind==='light-bowgun'?String(ammoCMState.ammoType).toLowerCase():ammoCMState.elementType)&&[1,2].includes(ammoCMState.ammoLevel)&&ammoCMState.contactPolicy==='EXPLICIT_CONTACTS'&&Number.isInteger(ammoCMState.contactCount)&&ammoCMState.contactCount>=1&&ammoCMState.contactCount<=6&&conditions.mounted!==true;
  // MHDB skill 24 only raises charged element/status. A proved absence of both
  // on these ordinary body routes is an HP no-op, not adoption of a multiplier.
  // Do not infer this from display zero: ammo, phials and generated components
  // can carry element independently, and unknown/status inputs remain gated.
  const chargeNoElementIds={
   'long-sword':['LS_RED_BLADE_I','LS_RED_BLADE_II','LS_RED_BLADE_III'],
   'sword-shield':['SNS_DOWNWARD_SLASH','SNS_SIDE_SLASH','SNS_HORIZONTAL_SLASH','SNS_RETURN_SLASH'],
   'dual-blades':['DB_DEMON_DANCE_I','DB_DEMON_DANCE_II','DB_DEMON_DANCE_III'],
   lance:['LAN_MID_THRUST_I','LAN_MID_THRUST_II','LAN_MID_THRUST_III','LAN_TRIPLE_THRUST']
  };
  const chargeIdentity=e=>e.skillKey==='chargeMaster'||Number(e.skillId)===24||['チャージマスター','Charge Master'].includes(e.name);
  const chargeNoElementEntries=allSkills.filter(chargeIdentity);
  const knownNoElement=x=>x?.element===0&&x.elementType==='none'&&x.elementKnown===true&&x.typeKnown===true&&x.elementStatus==='CONFIRMED_NONE';
  const zeroElementComponents=(x,maximum=false)=>x?.weaponBase===0&&Number.isFinite(x.normalMultiplier)&&x.normalMultiplier>0&&x.normalFlat===0&&(!maximum||x.conditionalFlat===0);
  const noAddedElement=rows=>Array.isArray(rows)&&rows.every(x=>x&&(x.elementAdd===undefined||x.elementAdd===0)&&(x.elementMultiplier===undefined||(Number.isFinite(x.elementMultiplier)&&x.elementMultiplier>0)));
  const chargeNoElementResolved=!!chargeNoElementIds[weapon.kind]&&chargeNoElementEntries.length>0&&chargeNoElementEntries.every(x=>Number(x.skillId)===24&&['チャージマスター','Charge Master'].includes(x.name)&&Number.isInteger(x.level)&&x.level>=1&&x.level<=3)&&new Set(chargeNoElementEntries.map(x=>x.level)).size===1&&rawSkills.filter(chargeIdentity).length<=1&&buildSkills.filter(chargeIdentity).length<=1&&
   weapon.specials.length===0&&weapon.phial==null&&[conditions,dualBladesState,longSwordState,lanceState].every(x=>x?.damageStatsState==null&&x?.stateStatsByState==null)&&Array.isArray(stats.activeBonusEffects)&&stats.activeBonusEffects.length===0&&knownNoElement(stats)&&knownNoElement(resolvedConditionPlan?.normal)&&knownNoElement(resolvedConditionPlan?.maximum)&&zeroElementComponents(stats.elementComponents)&&zeroElementComponents(resolvedConditionPlan?.normal?.elementComponents)&&zeroElementComponents(resolvedConditionPlan?.maximum?.elementComponents)&&zeroElementComponents(resolvedConditionPlan?.maximumElementComponents,true)&&
   !attributeConversionLevel&&!resistanceConversionLevel&&!waterEntries.length&&!allSkills.some(x=>Number(x.skillId)===133)&&noAddedElement(resolvedConditionPlan?.applied)&&noAddedElement(resolvedConditionPlan?.groupPlan?.applied)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.normal)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.maximum)&&
   resolvedTechniqueIds.every(id=>{const t=techniques[id];return chargeNoElementIds[weapon.kind].includes(id)&&t&&t.techniqueId===id&&t.damageStateTransition==null&&t.damageStatsState==null&&t.hpOnlyProvisional==null&&!t.referenceKind&&!t.phialReference&&!t.saAwakened&&!t.hhModel&&(t.specialComponents===undefined||(Array.isArray(t.specialComponents)&&t.specialComponents.length===0))&&Array.isArray(t.hits)&&t.hits.length>0&&t.hits.every(h=>h.damageStatsState==null&&!h.componentSource&&Number.isFinite(h.mv)&&h.mv>=0&&Number.isFinite(h.elementModifier)&&h.elementModifier>=0);});
  // Separate SA contract: memo/11 distinguishes physical power phials and awakened
  // explosions; memo/28 describes CM's element/status effect, not physical damage.
  // Keep the adopted mode-only/gauge-unmodeled reference scope. No CM coefficient.
  const chargeSaSequence=['SA_SWORD_RIGHT_RISING','SA_SWORD_LEFT_RISING','SA_SWORD_MORPH_DOUBLE','SA_AXE_MORPH_SLASH'];
  const chargeSaModes=[['SWORD',['SWORD'],'SWORD'],['SWORD',['SWORD'],'SWORD'],['SWORD',['SWORD','AXE'],'AXE'],['AXE',['SWORD'],'SWORD']];
  const chargeSaState=x=>x&&x.mode==='SWORD'&&x.awakened===false&&Object.keys(x).every(k=>['mode','awakened'].includes(k));
  const chargeSaPower=weapon.kind==='switch-axe'?root.MHWeaponEffectDB?.switchAxe?.powerPhialSword:null;
  const chargeSaNoElementResolved=weapon.kind==='switch-axe'&&chargeNoElementEntries.length>0&&
   chargeNoElementEntries.every(x=>Number(x.skillId)===24&&['チャージマスター','Charge Master'].includes(x.name)&&Number.isInteger(x.level)&&x.level>=1&&x.level<=3)&&new Set(chargeNoElementEntries.map(x=>x.level)).size===1&&rawSkills.filter(chargeIdentity).length<=1&&buildSkills.filter(chargeIdentity).length<=1&&
   weapon.specials.length===0&&weapon.phial?.kind==='power'&&Object.keys(weapon.phial).every(k=>k==='kind')&&
   chargeSaPower?.target==='physical'&&chargeSaPower.stage==='attack'&&chargeSaPower.operation==='multiply'&&chargeSaPower.unit==='dimensionless'&&Number.isFinite(chargeSaPower.amount)&&chargeSaPower.amount>0&&
   chargeSaState(switchAxeState)&&(conditions.switchAxeState==null||chargeSaState(conditions.switchAxeState))&&conditions.damageStatsState==null&&conditions.stateStatsByState==null&&
   Array.isArray(stats.activeBonusEffects)&&stats.activeBonusEffects.length===0&&knownNoElement(stats)&&knownNoElement(resolvedConditionPlan?.normal)&&knownNoElement(resolvedConditionPlan?.maximum)&&zeroElementComponents(stats.elementComponents)&&zeroElementComponents(resolvedConditionPlan?.normal?.elementComponents)&&zeroElementComponents(resolvedConditionPlan?.maximum?.elementComponents)&&zeroElementComponents(resolvedConditionPlan?.maximumElementComponents,true)&&
   !attributeConversionLevel&&!resistanceConversionLevel&&!waterEntries.length&&!allSkills.some(x=>Number(x.skillId)===133)&&noAddedElement(resolvedConditionPlan?.applied)&&noAddedElement(resolvedConditionPlan?.groupPlan?.applied)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.normal)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.maximum)&&
   resolvedTechniqueIds.length===chargeSaSequence.length&&resolvedTechniqueIds.every((id,i)=>{
    const t=techniques[id],[start,hitModes,end]=chargeSaModes[i],m=t?.modeContract;
    if(id!==chargeSaSequence[i]||!t||t.techniqueId!==id||t.weaponType!=='switch-axe'||t.damageStateTransition!=null||t.damageStatsState!=null||t.hpOnlyProvisional!=null||t.referenceKind||t.phialReference||t.saAwakened||t.hhModel||t.glModel||t.resourceContract||t.phialState||t.stateStatsByState!=null||t.specialSourceValues!=null)return false;
    if([t.specialComponents,t.excludedComponents].some(parts=>parts!==undefined&&(!Array.isArray(parts)||parts.length)))return false;
    if(!Array.isArray(t.hits)||t.hits.length!==hitModes.length||!t.hits.every(h=>h.damageStatsState==null&&h.stateStatsByState==null&&!h.component&&!h.componentSource&&Number.isFinite(h.mv)&&h.mv>=0&&Number.isFinite(h.elementModifier)&&h.elementModifier>=0))return false;
    if(i<2)return m==null&&t.stateRequirement?.mode===start&&Object.keys(t.stateRequirement).every(k=>k==='mode');
    return (!t.stateRequirement||Object.keys(t.stateRequirement).length===0||(t.stateRequirement.mode===start&&Object.keys(t.stateRequirement).every(k=>k==='mode')))&&m?.startMode===start&&m.endMode===end&&m.status==='OWNER_APPROVED_PROVISIONAL'&&m.scope==='NON_AWAKENED_BODY_MODE_ONLY_GAUGE_UNMODELED'&&Object.keys(m).every(k=>['startMode','hitModes','endMode','source','status','liveGameVerification','scope'].includes(k))&&Array.isArray(m.hitModes)&&m.hitModes.length===hitModes.length&&m.hitModes.every((mode,j)=>mode===hitModes[j]);
   });
  // Bounded CB no-element HP no-op, independent of the body-only predicate above.
  // MHDB skill 24 modifies charged element/status only. memo/12.php separately
  // identifies weapon-element axe followups and raw-attack IMPACT explosions;
  // memo/28.php names charged sword positives, not the adopted R/H release route.
  // Retain the existing provisional counts/coefficients/resources: no game-version
  // promotion, POWER_ELEMENT adoption, or inference from displayed element zero.
  const cbChargeRoutes={R:['CB_ELEMENT_DISCHARGE_1','CB_ELEMENT_DISCHARGE_2','CB_AED','CB_FOLLOWUP_AED'],H:['CB_AXE_TO_SWORD_MORPH','CB_SHIELD_THRUST','CB_AED','CB_FOLLOWUP_AED']};
  const cbChargeRoute=Object.keys(cbChargeRoutes).find(key=>JSON.stringify(resolvedTechniqueIds)===JSON.stringify(cbChargeRoutes[key]));
  const cbChargeRecords={CB_AXE_TO_SWORD_MORPH:{body:1,extra:0,phial:0},CB_SHIELD_THRUST:{body:2,extra:0,phial:1},CB_ELEMENT_DISCHARGE_1:{body:1,extra:4,phial:1},CB_ELEMENT_DISCHARGE_2:{body:2,extra:8,phial:2},CB_AED:{body:1,extra:4,phial:2},CB_FOLLOWUP_AED:{body:1,extra:4,phial:3}};
  const cbChargeNoAlternate=x=>x?.damageStatsState==null&&x?.stateStatsByState==null&&x?.damageStateTransition==null&&x?.hpOnlyProvisional==null;
  const cbChargeStateValid=s=>!!s&&cbChargeNoAlternate(s)&&s.mode==='AXE'&&s.previousAction===(cbChargeRoute==='R'?'CHARGE':'AXE_NEUTRAL')&&s.phialType==='IMPACT'&&s.swordBoosted===false&&s.shieldBoosted===true&&s.axeBoosted===true&&s.enhancedPhial===false&&s.enhancedPhials===0&&s.normalPhials===5;
  const cbChargeRecordValid=(id,index)=>{
   const spec=cbChargeRecords[id],raw=techniqueDb.get('charge-blade',id),canonical=root.TechniqueDBEngine?.get('charge-blade',id),t=techniques[id],engine=root.ChargeBladeEngine?.techniques?.[id],r=t?.resourceContract;
   if(!spec||!raw||!canonical||!t||!engine||raw.techniqueId!==id||t.techniqueId!==id||JSON.stringify(raw)!==JSON.stringify(canonical))return false;
   if(![raw,t].every(x=>cbChargeNoAlternate(x)&&!x.referenceKind&&!x.hhModel&&!x.saAwakened&&(x.specialComponents===undefined||(Array.isArray(x.specialComponents)&&x.specialComponents.length===0))))return false;
   if(!Array.isArray(raw.hits)||raw.hits.length!==spec.body||!Array.isArray(t.hits)||t.hits.length!==spec.body+spec.extra)return false;
   if(!raw.hits.every((h,i)=>cbChargeNoAlternate(h)&&h.componentSource==null&&Number.isFinite(h.mv)&&h.mv>=0&&h.elementModifier===1&&h.damageType==='slash'&&JSON.stringify(h)===JSON.stringify(t.hits[i])))return false;
   const prefix=cbChargeRoute==='H'&&index<2,previous=index===0?(cbChargeRoute==='R'?'CHARGE':'AXE_NEUTRAL'):(cbChargeRoute==='H'&&index===2?'SHIELD_THRUST':resolvedTechniqueIds[index-1]);
   if(!r||r.techniqueId!==id||r.id!==(prefix?'CB_H_PREFIX_RESOURCE':'CB_ED1_NORMAL_RESOURCE')||r.status!==(prefix?'OWNER_APPROVED_PROVISIONAL':'OWNER_APPROVED')||r.consumeNormalPhials!==(prefix?0:0.5)||r.resourceKey!=='normalPhials'||r.consumedPhialKind!=='NORMAL'||r.requiredPreviousAction!==previous)return false;
   if(cbChargeRoute==='H'&&(r.requiredMode!==(index===0||index===3?'AXE':'SWORD')||r.endMode!==(prefix?'SWORD':'AXE')))return false;
   if(prefix&&(hRule.shieldPhialCount!==1||hRule.prefixConsumption!==0||r.nextPreviousAction!==(index===0?id:'SHIELD_THRUST')))return false;
   if(!prefix&&(dischargeRules.baseConsumption!==1||ed1Rule.axeBoostedConsumptionMultiplier!==0.5||r.axeBoosted!==true))return false;
   if(spec.extra){
    const e=engine.axeBoostHits;
    if(e?.count!==spec.extra||e.mv!==12||e.elementModifier!==0.2||!t.hits.slice(spec.body).every(h=>cbChargeNoAlternate(h)&&h.mv===e.mv&&h.elementModifier===e.elementModifier&&h.shieldBoostAxeBody===false&&h.componentSource==='index.html:CHARGE_BLADE_TECHNIQUES.'+id+'.axeBoostHits'&&Object.keys(h).every(key=>['mv','elementModifier','shieldBoostAxeBody','componentSource'].includes(key))))return false;
   }else if(engine.axeBoostHits!=null||t.hits.some(h=>h.componentSource!=null))return false;
   if(spec.phial){
    const p=t.phialReference,s=t.phialState;
    if(!engine.phial||p?.status!==(id==='CB_SHIELD_THRUST'?'OWNER_APPROVED_PROVISIONAL':'OBSERVED')||p.hitCount!==spec.phial||p.eventCount!==spec.phial||!Array.isArray(p.sourceRefs)||p.sourceRefs.length!==1||typeof p.sourceRefs[0]!=='string'||!p.sourceRefs[0]||JSON.stringify(p)!==JSON.stringify(canonical.phialReference)||!cbChargeStateValid(s)||s.phialTypeSource!=='MHDB:weapon.phial'||s.phialTypeValue!=='impact'||s.artilleryStatus!=='PROVISIONALLY_ADOPTED'||root.ChargeBladeEngine?.formulas?.IMPACT_PHIAL?.id!=='CB_IMPACT_PHIAL_V1042')return false;
   }else if(t.phialReference!=null||t.phialState!=null||engine.phial!=null)return false;
   return true;
  };
  const cbChargeNoElementResolved=weapon.kind==='charge-blade'&&!!cbChargeRoute&&conditions.standardEvaluation===true&&weapon.phial==='impact'&&officialPhialType==='IMPACT'&&weapon.specials.length===0&&cbChargeStateValid(chargeBladeState)&&[conditions,conditions.chargeBladeState,stats].every(cbChargeNoAlternate)&&
   chargeNoElementEntries.length>0&&chargeNoElementEntries.every(x=>Number(x.skillId)===24&&['チャージマスター','Charge Master'].includes(x.name)&&Number.isInteger(x.level)&&x.level>=1&&x.level<=3)&&new Set(chargeNoElementEntries.map(x=>x.level)).size===1&&rawSkills.filter(chargeIdentity).length<=1&&buildSkills.filter(chargeIdentity).length<=1&&
   Array.isArray(stats.activeBonusEffects)&&stats.activeBonusEffects.length===0&&knownNoElement(stats)&&knownNoElement(resolvedConditionPlan?.normal)&&knownNoElement(resolvedConditionPlan?.maximum)&&zeroElementComponents(stats.elementComponents)&&zeroElementComponents(resolvedConditionPlan?.normal?.elementComponents)&&zeroElementComponents(resolvedConditionPlan?.maximum?.elementComponents)&&zeroElementComponents(resolvedConditionPlan?.maximumElementComponents,true)&&
   !attributeConversionLevel&&!resistanceConversionLevel&&!waterEntries.length&&!allSkills.some(x=>Number(x.skillId)===133)&&noAddedElement(resolvedConditionPlan?.applied)&&noAddedElement(resolvedConditionPlan?.groupPlan?.applied)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.normal)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.maximum)&&resolvedTechniqueIds.every(cbChargeRecordValid);
  // CM nonapplication is action-based for this GL route, not zero-element based:
  // memo/10 separates fullburst/stake from held-button charged shelling; memo/28
  // applies CM to charged shelling. Intrinsic fire remains in the existing model.
  // This validates the adopted NORMAL/MEDIUM six-round producer, not game values.
  const glChargeNoAlternate=x=>x!=null&&['damageStatsState','stateStatsByState','damageStateTransition','hpOnlyProvisional','referenceKind','referenceInput','phialReference','phialState','saAwakened','hhModel','resourceContract','modeContract','shellingAction','shellingResource'].every(k=>x[k]==null);
  const glChargeEqual=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const glChargeState=x=>glChargeNoAlternate(x)&&x.shellingType==='NORMAL'&&x.shellingPower==='MEDIUM'&&x.loadedRounds===6&&x.chargedRounds===null&&x.stakeLoaded===true&&Number.isFinite(x.fireHitzone)&&x.fireHitzone>=0&&x.fireHitzone<=100&&Object.keys(x).every(k=>['shellingType','shellingPower','loadedRounds','chargedRounds','stakeLoaded','fireHitzone'].includes(k));
  const glChargeModelValid=()=>{
   const r=glTargetContext?.rules,s=techniqueDb.get('gunlance','GL_SHELL_NORMAL_MEDIUM'),canonical=root.TechniqueDBEngine?.get?.('gunlance','GL_SHELL_NORMAL_MEDIUM'),p=s?.specialSourceValues?.p0ReferenceRules;
   if(!r||r.id!=='GL_OWNER_STAKE_TARGET'||r.status!=='OWNER_APPROVED_PROVISIONAL'||r.source!=='https://kuroyonhon.com/mhwilds/memo/10.php'||r.scope!=='EXACT_FOUR_ACTION_FULL_HIT_REFERENCE;NO_TIMING;NO_GAUGE_RECHARGE'||!glChargeNoAlternate(r)||Object.keys(r).some(k=>!['id','status','source','retrievedAt','officialGameVersion','sourceVersion','liveGameVerification','approvalBasis','sourceRefs','scope','body','burstElementModifier','powerRows','stakeFullBurstMultiplier','actions','artilleryScope','noSharpnessMultiplier','cornScope','sharpnesslessComponents','assumptions'].includes(k)))return false;
   if(!glChargeEqual(r.body,[{mv:30,elementModifier:1},{mv:20,elementModifier:1}])||r.burstElementModifier!==0.5||!glChargeEqual(r.powerRows?.NORMAL_MEDIUM,{burstMv:6,explosionMv:25,explosionFire:210})||r.stakeFullBurstMultiplier?.NORMAL!==1.25||r.noSharpnessMultiplier!==1||!glChargeEqual(r.sharpnesslessComponents,['STAKE_BURST'])||!glChargeEqual(r.actions,{GL_WYRMSTAKE_FULL_BURST:{burstCount:9,explosionMultiplier:1,reload:false},GL_MULTI_WYRMSTAKE_FULL_BURST:{burstCount:15,explosionMultiplier:1.1,reload:true}}))return false;
   if(!s||!canonical||!glChargeEqual(s,canonical)||s.techniqueId!=='GL_SHELL_NORMAL_MEDIUM'||s.weaponType!=='gunlance'||s.numericStatus!=='SOURCE_CONFIRMED'||!glChargeNoAlternate(s)||!glChargeEqual(s.hits,[])||!glChargeEqual(s.specialComponents,['SHELL'])||s.excludedComponents!=null||s.specialSourceValues.unparenthesizedValue!==8||s.specialSourceValues.parenthesizedValue!==70||!p||p.sourceUrl!=='https://kuroyonhon.com/mhwilds/memo/10.php'||p.adoptionStatus!=='PROVISIONALLY_ADOPTED'||p.fireElementModifier!==1||p.baseCapacity?.NORMAL!==6||p.mhdbShellLevelToPower?.[2]!=='MEDIUM')return false;
   if(p.artilleryReference?.attackOrder!=='BASE_MULTIPLIERS_ARTILLERY_THEN_FLAT'||p.artilleryReference.attackOrderAdoption!=='OWNER_APPROVED_PROVISIONAL'||!glChargeEqual(p.artilleryReference.physicalMultipliers,[1,1.05,1.1,1.15])||!glChargeEqual(p.artilleryReference.fireDisplayAdds,[0,30,60,90])||p.artilleryReference.fireUnit!=='DISPLAY_ELEMENT'||!glChargeEqual(p.loadShellsReference?.capacityAdds,{'0':0,'1':0,'2':1})||![0,1].includes(shellingInput.loadShellsLevel)||glTargetContext.capacity!==6)return false;
   return glTargetContext.row===r.powerRows.NORMAL_MEDIUM&&glTargetContext.input===shellingInput;
  };
  const glChargeRecordValid=(id,i)=>{
   const raw=techniqueDb.get('gunlance',id),canonical=root.TechniqueDBEngine?.get?.('gunlance',id),t=techniques[id];
   if(!raw||!canonical||!t||!glChargeEqual(raw,canonical)||![raw,t].every(x=>x.techniqueId===id&&x.weaponType==='gunlance'&&glChargeNoAlternate(x)&&x.excludedComponents==null&&x.specialSourceValues==null&&(!x.stateRequirement||Object.keys(x.stateRequirement).length===0)))return false;
   if(raw.glModel!=null||raw.glComponentContract!=null)return false;
   if(i<2)return raw.glTargetRules==null&&t.glModel==null&&raw.shellingBodyResourceContract==='NO_SHELL_CONSUMPTION_BODY'&&(raw.specialComponents===undefined||glChargeEqual(raw.specialComponents,[]))&&glChargeEqual(t.hits,raw.hits)&&raw.hits?.length===1&&raw.hits.every(h=>glChargeNoAlternate(h)&&h.component==='BODY'&&h.damageType==='slash'&&h.mv===(i===0?57:40)&&h.elementModifier===(i===0?2:1.5)&&h.damageTypeSource==='https://kuroyonhon.com/mhwilds/memo/10.php'&&Object.keys(h).every(k=>['mv','elementModifier','component','damageType','damageTypeSource'].includes(k)));
   const r=glTargetContext.rules,a=r.actions[id],m=t.glModel;
   return raw.numericStatus==='PROVISIONALLY_ADOPTED'&&raw.calculationStatus==='READY_COMPONENT_MODEL'&&glChargeEqual(raw.hits,[])&&glChargeEqual(raw.specialComponents,['SHELLING','WYRMSTAKE'])&&glChargeEqual(raw.glTargetRules,r)&&t.calculationStatus==='READY_BODY_COMPONENT'&&glChargeEqual(t.specialComponents,[])&&m?.id===id&&m.rules===r&&m.row===glTargetContext.row&&m.input===shellingInput&&m.capacity===6&&m.action===a&&Object.keys(m).every(k=>['rules','row','capacity','input','action','id'].includes(k))&&glChargeEqual(t.glComponentContract,{status:r.status,source:r.source,noSharpnessMultiplier:r.noSharpnessMultiplier})&&glChargeEqual(t.hits,[...r.body.map(h=>({...h,damageType:'slash'})),...Array.from({length:a.burstCount},()=>({mv:glTargetContext.row.burstMv,elementModifier:r.burstElementModifier,damageType:'slash',glComponent:'STAKE_BURST'}))]);
  };
  const glChargeNonchargedResolved=weapon.kind==='gunlance'&&conditions.standardEvaluation===true&&conditions.mounted===false&&weapon.shell==='normal'&&weapon.shellLevel===2&&weapon.phial==null&&weapon.artiaShellEvidence==null&&weapon.specials.length===0&&glChargeState(gunlanceState)&&glChargeState(conditions.gunlanceState)&&glChargeEqual(gunlanceState,conditions.gunlanceState)&&[conditions,stats,resolvedConditionPlan?.normal,resolvedConditionPlan?.maximum].every(glChargeNoAlternate)&&
   chargeNoElementEntries.length>0&&chargeNoElementEntries.every(x=>Number(x.skillId)===24&&['チャージマスター','Charge Master'].includes(x.name)&&Number.isInteger(x.level)&&x.level>=1&&x.level<=3)&&new Set(chargeNoElementEntries.map(x=>x.level)).size===1&&rawSkills.filter(chargeIdentity).length<=1&&buildSkills.filter(chargeIdentity).length<=1&&
   [stats,resolvedConditionPlan?.normal,resolvedConditionPlan?.maximum].every(x=>Array.isArray(x?.activeBonusEffects)&&x.activeBonusEffects.length===0&&knownNoElement(x)&&zeroElementComponents(x.elementComponents))&&zeroElementComponents(resolvedConditionPlan?.maximumElementComponents,true)&&!attributeConversionLevel&&!resistanceConversionLevel&&!waterEntries.length&&!allSkills.some(x=>Number(x.skillId)===133)&&noAddedElement(resolvedConditionPlan?.applied)&&noAddedElement(resolvedConditionPlan?.groupPlan?.applied)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.normal)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.maximum)&&
   resolvedTechniqueIds.length===glTargetIds.length&&resolvedTechniqueIds.every((id,i)=>id===glTargetIds[i])&&glChargeModelValid()&&resolvedTechniqueIds.every(glChargeRecordValid);
  // Charge Master changes charged element/status, never raw attack (memo/28).
  // HH sound/echo use the weapon element, not an intrinsic element producer:
  // macarongamemo.com/entry/mhwilds-damage_calculation (HH sound formula).
  // Only the exact adopted standard SELF_IMPROVEMENT / one-echo model is proved
  // zero in every channel and event. This is not HH-wide charge nonapplication.
  const hhChargeEqual=(a,b)=>{if(typeof a==='number'||typeof b==='number')return Number.isFinite(a)&&Number.isFinite(b)&&a===b;if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(k=>Object.hasOwn(b,k)&&hhChargeEqual(a[k],b[k]));};
  const hhChargeIds=['HH_LEFT_SWING','HH_FORWARD_ATTACK','HH_SELF_IMPROVEMENT_PERFORMANCE','HH_ENCORE_JUST'];
  const hhChargeRecords={"HH_LEFT_SWING":[["evidenceRefs","hits","revision","techniqueId","techniqueName","validFromVersion","validToVersion","verificationStatus","weaponType"],{"weaponType":"hunting-horn","techniqueId":"HH_LEFT_SWING","revision":1,"verificationStatus":"VERIFIED","evidenceRefs":["MACARONGAMEMO_HH_MOTION"],"hits":[{"mv":33,"elementModifier":1,"component":"BODY"}]}],"HH_FORWARD_ATTACK":[["evidenceRefs","hits","revision","techniqueId","techniqueName","validFromVersion","validToVersion","verificationStatus","weaponType"],{"weaponType":"hunting-horn","techniqueId":"HH_FORWARD_ATTACK","revision":1,"verificationStatus":"VERIFIED","evidenceRefs":["MACARONGAMEMO_HH_MOTION"],"hits":[{"mv":32,"elementModifier":1,"component":"BODY"}]}],"HH_SELF_IMPROVEMENT_PERFORMANCE":[["calculationScope","calculationStatus","currentVersionAudit","evidenceRefs","hits","liveGameVerification","nonBlockingReasons","revision","revisionHistory","sourceAuditEvidenceRefs","specialComponents","specialTechniqueIds","techniqueId","techniqueName","unresolvedReasons","validFromVersion","validToVersion","verificationStatus","weaponType"],{"weaponType":"hunting-horn","techniqueId":"HH_SELF_IMPROVEMENT_PERFORMANCE","revision":2,"verificationStatus":"PARTIALLY_VERIFIED","calculationStatus":"READY_BODY_COMPONENT","calculationScope":"HP_BODY_ONLY","evidenceRefs":["MACARONGAMEMO_HH_MOTION"],"hits":[{"mv":35,"elementModifier":1,"component":"BODY"}],"specialTechniqueIds":["HH_PERFORMANCE_SHOCKWAVE"],"specialComponents":["PERFORMANCE_SHOCKWAVE"]}],"HH_ENCORE_JUST":[["calculationScope","calculationStatus","currentVersionAudit","evidenceRefs","hits","liveGameVerification","nonBlockingReasons","revision","revisionHistory","sourceAuditEvidenceRefs","specialComponents","specialTechniqueIds","techniqueId","techniqueName","unresolvedReasons","validFromVersion","validToVersion","verificationStatus","weaponType"],{"weaponType":"hunting-horn","techniqueId":"HH_ENCORE_JUST","revision":2,"verificationStatus":"PARTIALLY_VERIFIED","calculationStatus":"READY_BODY_COMPONENT","calculationScope":"HP_BODY_ONLY","evidenceRefs":["MACARONGAMEMO_HH_MOTION","USER_STANDARD_DECISION_2026-10-05"],"hits":[{"mv":20,"elementModifier":1,"component":"BODY"},{"mv":75,"elementModifier":1,"component":"BODY"}],"specialTechniqueIds":["HH_MELODY_COMPLETION_FIXED_10"],"specialComponents":["FIXED_MELODY_EVENT"]}],"HH_PERFORMANCE_SHOCKWAVE":[["baselineGameVersion","calculationStatus","currentVersionAudit","evidenceRefs","hits","introducedIn","numericStatus","revision","revisionHistory","sourceAuditEvidenceRefs","sourceFormula","sourceLocator","specialComponents","specialSourceValues","stateRequirement","techniqueId","techniqueName","unresolvedReasons","validFromVersion","validToVersion","verificationStatus","weaponType"],{"weaponType":"hunting-horn","techniqueId":"HH_PERFORMANCE_SHOCKWAVE","revision":2,"verificationStatus":"UNVERIFIED","numericStatus":"SOURCE_CONFIRMED","calculationStatus":"EVIDENCE_GATED","evidenceRefs":["MACARONGAMEMO_HH_R48_SOURCE"],"hits":[],"stateRequirement":{},"specialComponents":["PERFORMANCE_SHOCKWAVE"],"specialSourceValues":{"unbracketedValue":27,"elementModifier":1,"partModifier":1,"stun":5,"formulaStatus":"PENDING","physicalHitzoneScaling":false,"sharpnessScaling":false,"attackScalingBasis":"PENDING","affinityApplication":"PENDING"},"sourceFormula":{"id":"HORN_SOUND_ATTACK_AND_ELEMENT","status":"SOURCE_CONFIRMED","applicationStatus":"SOURCE_ESTIMATE_ONLY","physicalSharpnessApplied":false,"elementSharpnessApplied":false,"affinityApplied":false,"physicalHitzoneApplied":false,"elementHitzoneApplied":true,"roundingStatus":"UNROUNDED_REFERENCE_ONLY","baselineAudit":"PENDING","evidenceRefs":["KUROYONHON_HH_R56_COMPONENTS","MACARONGAMEMO_HH_R61_FORMULA"]}}],"HH_ECHO_BUBBLE_FOLLOWUP":[["calculationStatus","currentVersionAudit","evidenceRefs","hits","liveGameVerification","numericStatus","revision","revisionHistory","sourceAuditEvidenceRefs","sourceFormula","specialComponents","specialSourceValues","techniqueId","techniqueName","unresolvedReasons","validFromVersion","validToVersion","verificationStatus","weaponType"],{"weaponType":"hunting-horn","techniqueId":"HH_ECHO_BUBBLE_FOLLOWUP","revision":2,"verificationStatus":"PARTIALLY_VERIFIED","numericStatus":"SOURCE_CONFIRMED","calculationStatus":"EVIDENCE_GATED","evidenceRefs":["MACARONGAMEMO_HH_MOTION","USER_INGAME_CONFIRMATION_2026-10-05"],"hits":[],"specialComponents":["ECHO_BUBBLE_NORMAL"],"specialSourceValues":{"coefficient":5,"elementModifier":0.3,"formulaStatus":"PENDING","physicalHitzoneScaling":false,"sharpnessScaling":false,"attackScalingBasis":"PENDING","affinityApplication":"PENDING"},"sourceFormula":{"id":"HORN_SOUND_ATTACK_AND_ELEMENT","status":"SOURCE_CONFIRMED","applicationStatus":"SOURCE_ESTIMATE_ONLY","physicalSharpnessApplied":false,"elementSharpnessApplied":false,"affinityApplied":false,"physicalHitzoneApplied":false,"elementHitzoneApplied":true,"roundingStatus":"UNROUNDED_REFERENCE_ONLY","baselineAudit":"PENDING","evidenceRefs":["KUROYONHON_HH_R56_COMPONENTS","MACARONGAMEMO_HH_R61_FORMULA"]}}],"HH_ECHO_BUBBLE_MELODY_EVENT":[["baselineGameVersion","calculationStatus","currentVersionAudit","evidenceRefs","hits","introducedIn","liveGameVerification","numericStatus","revision","sourceAuditEvidenceRefs","sourceFormula","specialComponents","specialSourceValues","techniqueId","techniqueName","unresolvedReasons","validFromVersion","validToVersion","verificationStatus","weaponType"],{"weaponType":"hunting-horn","techniqueId":"HH_ECHO_BUBBLE_MELODY_EVENT","revision":1,"verificationStatus":"PARTIALLY_VERIFIED","numericStatus":"SOURCE_CONFIRMED","calculationStatus":"EVIDENCE_GATED","evidenceRefs":["KUROYONHON_HH_R56_COMPONENTS"],"hits":[],"specialComponents":["ECHO_BUBBLE_MELODY"],"specialSourceValues":{"coefficient":12,"elementModifier":0.3,"formulaStatus":"PENDING","physicalHitzoneScaling":false,"sharpnessScaling":false,"attackScalingBasis":"PENDING","affinityApplication":"PENDING"},"sourceFormula":{"id":"HORN_SOUND_ATTACK_AND_ELEMENT","status":"SOURCE_CONFIRMED","applicationStatus":"SOURCE_ESTIMATE_ONLY","physicalSharpnessApplied":false,"elementSharpnessApplied":false,"affinityApplied":false,"physicalHitzoneApplied":false,"elementHitzoneApplied":true,"roundingStatus":"UNROUNDED_REFERENCE_ONLY","baselineAudit":"PENDING","evidenceRefs":["KUROYONHON_HH_R56_COMPONENTS","MACARONGAMEMO_HH_R61_FORMULA"]}}],"HH_MELODY_COMPLETION_FIXED_10":[["baselineGameVersion","calculationStatus","currentVersionAudit","evidenceRefs","hits","introducedIn","liveGameVerification","numericStatus","revision","sourceAuditEvidenceRefs","sourceFormula","specialComponents","specialSourceValues","techniqueId","techniqueName","unresolvedReasons","validFromVersion","validToVersion","verificationStatus","weaponType"],{"weaponType":"hunting-horn","techniqueId":"HH_MELODY_COMPLETION_FIXED_10","revision":1,"verificationStatus":"PARTIALLY_VERIFIED","numericStatus":"SOURCE_CONFIRMED","calculationStatus":"EVIDENCE_GATED","evidenceRefs":["KUROYONHON_HH_R56_COMPONENTS"],"hits":[],"specialComponents":["FIXED_MELODY_EVENT"],"specialSourceValues":{"fixedDamagePerEvent":10,"attackScaling":false,"sharpnessScaling":false,"hitzoneScaling":false,"routeEventCount":null},"sourceFormula":{"id":"HORN_FIXED_EVENT","status":"SOURCE_CONFIRMED","applicationStatus":"SOURCE_ESTIMATE_ONLY","physicalSharpnessApplied":false,"elementSharpnessApplied":false,"affinityApplied":false,"physicalHitzoneApplied":false,"elementHitzoneApplied":false,"roundingStatus":"UNROUNDED_REFERENCE_ONLY","baselineAudit":"PENDING","evidenceRefs":["KUROYONHON_HH_R56_COMPONENTS","MACARONGAMEMO_HH_R61_FORMULA"]}}]};
  const hhChargeModelContract={"id":"HH_NORMAL_MELODY_PROVISIONAL","status":"OWNER_APPROVED_PROVISIONAL","verificationStatus":"UNVERIFIED","source":"https://kuroyonhon.com/mhwilds/memo/8.php","approval":"2026-10-26_OWNER_HH_EVENT_MODEL","scope":"NORMAL_MELODY_SINGLE_ATTACK_FAMILY_PREPLACED_ECHO","sourceGameVersion":"CURRENT_VERSION_UNVERIFIED","soundPerMelody":1,"fixedCountOffset":-1,"echoPerTrigger":1,"maxMelodies":3,"maxEchoBubbles":3,"bodyDamageType":"blunt","bodyPartModifier":1,"updateOrder":"AFTER_ESTABLISHMENT_DAMAGE","selfImprovementMultiplier":1.2,"selfImprovementCap":2,"attackMelodies":{"ATTACK_SMALL":[1,1.03,1.05],"ATTACK_LARGE":[1,1.05,1.1],"ATTACK_DEFENSE_SMALL":[1,1.03,1.05]},"attackMelodyCap":2,"attackMelodyAdoption":{"status":"OWNER_APPROVED_PROVISIONAL","verificationStatus":"UNVERIFIED","source":"https://macarongamemo.com/entry/mhwilds-hunting_horn-melody","orderSource":"https://kuroyonhon.com/mhwilds/memo/21.php","approval":"OWNER_SA_HH_PROVISIONAL_2026-10-26","scope":"ONE_ATTACK_FAMILY_REPLACE_RANK_MULTIPLY_BASE_BEFORE_FLAT"},"assumptions":["PERFORMANCE_SOUND_ONCE_PER_MELODY","ENCORE_FIXED_MAX_N_MINUS_ONE","ECHO_ONCE_PER_BUBBLE_PER_TRIGGER","BODY_BEFORE_MELODY_EVENTS","MELODY_DAMAGE_BEFORE_EFFECT_UPDATE"],"techniques":{"HH_LEFT_SWING":"ordinary","HH_FORWARD_ATTACK":"ordinary","HH_SELF_IMPROVEMENT_PERFORMANCE":"performance","HH_PERFORMANCE_BEAT_1":"ordinary","HH_PERFORMANCE_BEAT_1_JUST":"ordinary","HH_PERFORMANCE_BEAT_2":"ordinary","HH_PERFORMANCE_BEAT_2_JUST":"ordinary","HH_ENCORE_NORMAL":"encore","HH_ENCORE_JUST":"encore"}};
  const hhChargeStateContract={"echoState":null,"melodyState":null,"model":"HH_NORMAL_MELODY_PROVISIONAL","melodies":["SELF_IMPROVEMENT"],"echoBubbles":1,"selfImprovementLevel":0,"attackMelody":null,"attackMelodyLevel":0};
  const hhChargeFields=["weaponType","techniqueId","revision","verificationStatus","numericStatus","calculationStatus","calculationScope","evidenceRefs","hits","stateRequirement","specialTechniqueIds","specialComponents","specialSourceValues","sourceFormula"];
  const hhChargeNoAlternate=x=>x!=null&&['damageStatsState','stateStatsByState','damageStateTransition','hpOnlyProvisional','referenceKind','referenceInput','phialReference','phialState','saAwakened','glModel','resourceContract','modeContract','shellingAction','shellingResource','excludedComponents','componentSource','intrinsicElement','intrinsicStatus'].every(k=>x[k]==null)&&['jumpAttack','jumping','airborne','mounted','dismountAttack','sneakAttack','focusAttack','woundDestruction','woundEvent'].every(k=>x[k]==null||x[k]===false);
  const hhChargeRawValid=(id,r)=>{
   const contract=hhChargeRecords[id];
   return !!(r&&contract&&hhChargeEqual(Object.keys(r).sort(),contract[0])&&hhChargeEqual(Object.fromEntries(hhChargeFields.filter(k=>Object.hasOwn(r,k)).map(k=>[k,r[k]])),contract[1]));
  };
  const hhChargeRecordValid=id=>{
   const raw=techniqueDb.get('hunting-horn',id),canonical=root.TechniqueDBEngine?.get?.('hunting-horn',id),t=techniques[id];
   if(!hhChargeRawValid(id,raw)||!hhChargeRawValid(id,canonical)||!t)return false;
   const expectedHits=raw.hits.map(h=>({...h,damageType:'blunt',partModifier:1,partModifierSource:raw.evidenceRefs[0]}));
   const expected={...raw,...(id===techniqueId?{hits:expectedHits}:{}),hhModel:{...hhModel,action:hhModel.techniques[id],input:huntingHornState,specialRecords:Object.fromEntries(Object.keys(hhChargeRecords).filter(k=>!hhChargeIds.includes(k)).map(k=>[k,techniqueDb.get('hunting-horn',k)]))},...(id===techniqueId?{stateRequirement:{}}:{})};
   return hhChargeEqual(t,expected);
  };
  const hhChargeNoElementResolved=weapon.kind==='hunting-horn'&&conditions.standardEvaluation===true&&conditions.mounted===false&&weapon.phial==null&&weapon.specials.length===0&&
   hhChargeEqual(resolvedTechniqueIds,hhChargeIds)&&hhChargeEqual(hhModel,hhChargeModelContract)&&hhChargeEqual(huntingHornState,hhChargeStateContract)&&hhChargeEqual(conditions.huntingHornState,hhChargeStateContract)&&
   chargeNoElementEntries.length>0&&chargeNoElementEntries.every(x=>Number(x.skillId)===24&&['チャージマスター','Charge Master'].includes(x.name)&&Number.isInteger(x.level)&&x.level>=1&&x.level<=3)&&new Set(chargeNoElementEntries.map(x=>x.level)).size===1&&rawSkills.filter(chargeIdentity).length<=1&&buildSkills.filter(chargeIdentity).length<=1&&
   [conditions,stats,resolvedConditionPlan?.normal,resolvedConditionPlan?.maximum].every(hhChargeNoAlternate)&&
   [stats,resolvedConditionPlan?.normal,resolvedConditionPlan?.maximum].every(x=>Array.isArray(x?.activeBonusEffects)&&x.activeBonusEffects.length===0&&knownNoElement(x)&&zeroElementComponents(x.elementComponents))&&zeroElementComponents(resolvedConditionPlan?.maximumElementComponents,true)&&
   !attributeConversionLevel&&!resistanceConversionLevel&&!waterEntries.length&&!allSkills.some(x=>Number(x.skillId)===133)&&noAddedElement(resolvedConditionPlan?.applied)&&noAddedElement(resolvedConditionPlan?.groupPlan?.applied)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.normal)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.maximum)&&
   Object.keys(hhChargeRecords).every(id=>hhChargeRawValid(id,techniqueDb.get('hunting-horn',id))&&hhChargeRawValid(id,root.TechniqueDBEngine?.get?.('hunting-horn',id)))&&hhChargeIds.every(hhChargeRecordValid);
  const hhChargeEvents={HH_LEFT_SWING:['HH_ECHO_BUBBLE_FOLLOWUP'],HH_FORWARD_ATTACK:['HH_ECHO_BUBBLE_FOLLOWUP'],HH_SELF_IMPROVEMENT_PERFORMANCE:['HH_PERFORMANCE_SHOCKWAVE','HH_ECHO_BUBBLE_MELODY_EVENT'],HH_ENCORE_JUST:['HH_ECHO_BUBBLE_MELODY_EVENT']};
  // Validate the actual generated components and effect list, not only raw IDs.
  const hhChargeComponentValid=({component:c,event,build,effects})=>{
   const id=event.techniqueId,record=hhChargeRecords[id]?.[1],p=c.parameters;
   if(!record||build.element!==0||build.elementType!=='none'||!zeroElementComponents(build.equipment?.elementComponents)||!Array.isArray(effects)||effects.some(e=>(e.target==='element'||e.target==='all')&&e.stage==='element'&&!(e.operation==='multiply'&&Number.isFinite(e.amount)&&e.amount>=0)&&!(e.operation==='add'&&e.amount===0)))return false;
   const adoption={status:hhModel.status,verificationStatus:hhModel.verificationStatus,source:hhModel.source,approval:hhModel.approval,scope:hhModel.scope,updateOrder:hhModel.updateOrder};
   if(c.kind==='physical'){
    const h=record.hits[p?.hitIndex];if(!h)return false;
    const expected={id:id+':physical:'+p.hitIndex,kind:'physical',unit:'MV',source:record.evidenceRefs[0],coefficient:h.mv,parameters:{partModifier:1,partModifierStatus:'RESOLVED',partModifierSource:record.evidenceRefs[0],shieldBoostAxeBody:false,elementModifier:h.elementModifier,damageType:'blunt',hitIndex:p.hitIndex,glComponent:null,glSharpnessOverride:null,excludedEffectIds:[],saHitMode:null,resourceContract:null,stateRequirement:null,damageStateTransition:null,damageStatsState:null,adoption}};
    return hhChargeEqual(c,expected);
   }
   if(c.kind!=='reference'||!p||hhChargeEvents[id][p.hitIndex]!==p.hhRecord?.techniqueId||!hhChargeRawValid(p.hhRecord.techniqueId,p.hhRecord))return false;
   return hhChargeEqual(c,{id:id+':reference:'+p.hitIndex,kind:'reference',unit:'REFERENCE',source:p.hhRecord.evidenceRefs[0],coefficient:1,parameters:{hitIndex:p.hitIndex,referenceKind:'hunting-horn-model-event',hhRecord:p.hhRecord,hhCount:1,adoption,effectTargets:['physical','element'],effectStages:['attack','element']}});
  };
  const hhChargeResultValid=result=>{
   if(result?.metrics?.comboTotalDamage?.status!=='available')return true;
   const ids=hhChargeIds.flatMap(id=>[...hhChargeRecords[id][1].hits.flatMap((h,i)=>[id+':physical:'+i,id+':element:'+i]),...hhChargeEvents[id].map((_,i)=>id+':reference:'+i)]);
   const steps=['0:0','0:1','1:0','1:1','2:0','2:1','2:2','2:3','3:0','3:1','3:2','3:3'];
   return result.execution.status==='complete'&&hhChargeEqual(result.execution.expected,steps)&&hhChargeEqual(result.execution.executed,steps)&&hhChargeEqual(result.finalState,{huntingHorn:{selfImprovementLevel:2,attackMelodyLevel:0}})&&hhChargeEqual(result.components.map(c=>c.id),ids)&&result.components.every(c=>{
    if(c.status!=='available'||!Number.isFinite(c.value))return false;
    if(c.id.includes(':element:'))return c.value===0;
    if(!c.id.includes(':reference:'))return true;
    const index=Number(c.id.split(':').pop()),expected=hhChargeEvents[c.techniqueId]?.[index],d=c.details;
    return d?.element===0&&d.fixed===0&&d.trace?.length===1&&d.trace[0].techniqueId===expected&&d.trace[0].scenarioCount===1&&d.trace[0].element===0&&d.trace[0].fixed===0&&d.trace[0].formulaId==='HORN_SOUND_ATTACK_AND_ELEMENT';
   });
  };
  // Thunder165 is a separate zero-add proof, not HH Charge Master applicability.
  // Sourced HH coefficient 5 times known empty-equipment resistance 0 is 0.
  // Reuse only the independently bound HH producer/component/result contracts.
  // Keep the early generic conversion gate; discharge only its exact HH scope
  // issue after every source, input and both-channel producer check succeeds.
  const hhThunderEmptyRows=['head','chest','arms','waist','legs'].map(slot=>({slot,equipped:false,value:0}));
  const hhThunderResistanceValid=x=>emptyResistance(x)&&hhChargeEqual(x.rows,hhThunderEmptyRows)&&x.scope==='ARMOR_SKILLS_PLUS_EXPLICIT_GUTS_VEIL_NO_FOOD_OR_AMMO'&&x.adoptionStatus==='OWNER_APPROVED_PROVISIONAL'&&x.source==='https://kuroyonhon.com/mhwilds/program/skill.php'&&x.verificationStatus==='UNVERIFIED'&&Object.keys(x).every(k=>['status','armorBase','total','rows','missing','reason','contributions','scope','adoptionStatus','source','verificationStatus'].includes(k));
  const hhThunderStatsValid=x=>zeroBodyState(x)&&hhChargeNoAlternate(x)&&hhThunderResistanceValid(x.thunderResistanceInput)&&hhChargeEqual(x.armorThunderResistanceInput,{status:'ARMOR_BASE_ONLY',armorBase:0,total:null,rows:hhThunderEmptyRows,missing:[],reason:'SKILL_BUFF_TOTAL_AND_CONVERSION_ACTIVATION_NOT_RESOLVED'})&&
   x.attackKnown===true&&x.affinityKnown===true&&x.weaponKind==='hunting-horn'&&x.attackTrue===weapon.damage.raw&&x.attack===weapon.damage.display&&x.affinity===weapon.affinity&&x.maxAffinity===weapon.affinity&&hhChargeEqual(x.attackComponents,{weaponBase:weapon.damage.raw,normalMultiplier:1,normalFlat:0})&&hhChargeEqual(x.elementComponents,{weaponBase:0,normalMultiplier:1,normalFlat:0});
  const hhThunderEmpty=x=>Array.isArray(x)&&x.length===0;
  const hhThunderSkillRecords=weapon.kind==='hunting-horn'?(root.__getBetaDB?.()?.skills||[]).filter(x=>x.id===165||x.name==='耐性変換【雷】'):[];
  const hhThunderSkill=hhThunderSkillRecords[0];
  const hhThunderSkillValid=hhThunderSkillRecords.length===1&&hhThunderSkill.id===165&&hhThunderSkill.gameId===30201&&hhThunderSkill.name==='耐性変換【雷】'&&hhThunderSkill.kind==='weapon'&&hhChargeEqual(hhThunderSkill.ranks,[{skill:{id:165},level:1,name:null,description:'スキル効果発動',setPiecesRequired:null,id:422}]);
  const hhThunderZeroResolved=hhThunderSkillValid&&weapon.kind==='hunting-horn'&&standardConversion&&conditions.mounted===false&&weapon.phial==null&&weapon.specials.length===0&&weapon.skills.length===0&&
   resistanceConversionLevel===1&&resistanceConversionCoefficient===5&&resistanceConversionAdd===0&&absorptionConversionPlan==null&&!attributeConversionLevel&&!waterEntries.length&&
   hhChargeEqual(skills,[['耐性変換【雷】',1]])&&rawSkills.length===0&&buildSkills.length===1&&allSkills.length===1&&allSkills.every(x=>x.skillId===165&&x.id==='165'&&x.name==='耐性変換【雷】'&&x.level===1&&x.rank===0&&x.skillKey==='resistanceConversionThunder'&&x.source==='index.html:calcBuild'&&x.effectCategory===null&&x.damageRelated===undefined)&&
   hhChargeEqual(resolvedTechniqueIds,hhChargeIds)&&hhChargeEqual(hhModel,hhChargeModelContract)&&hhChargeEqual(huntingHornState,hhChargeStateContract)&&hhChargeEqual(conditions.huntingHornState,hhChargeStateContract)&&hhChargeNoAlternate(conditions)&&
   [stats,resolvedConditionPlan?.normal,resolvedConditionPlan?.maximum].every(hhThunderStatsValid)&&hhChargeEqual(resolvedConditionPlan.maximumElementComponents,{weaponBase:0,normalMultiplier:1,normalFlat:0,conditionalFlat:0})&&
   hhChargeEqual(resolvedConditionPlan.attackComponents,{weaponBase:weapon.damage.raw,normalMultiplier:1,normalFlat:0,conditionalMultiplier:1,groupMultiplier:1,conditionalFlat:0})&&
   [resolvedConditionPlan.applied,resolvedConditionPlan.groupPlan?.applied,resolvedConditionPlan.groupPlan?.unresolvedEffects,resolvedConditionPlan.groupPlan?.nonDamageEffects,resolvedConditionPlan.selfStatePlan?.normal,resolvedConditionPlan.selfStatePlan?.maximum,resolvedConditionPlan.selfStatePlan?.ids,resolvedConditionPlan.selfStatePlan?.pending].every(hhThunderEmpty)&&
   resolvedConditionPlan.groupPlan.attackMultiplier===1&&resolvedConditionPlan.groupPlan.maximumFlat===0&&resolvedConditionPlan.groupPlan.gutsState==='BEFORE'&&resolvedConditionPlan.blackEclipse===null&&resolvedConditionPlan.frenzyAffinity?.active===false&&
   conditions.absorbedElement===null&&conditions.gutsState==='BEFORE'&&hhChargeEqual(conditions.selfSkillState?.shared,{omega:'INACTIVE'})&&hhChargeEqual(conditions.combatBuffs,{meal:null,charm:null,otherBuffs:null})&&
   root.MHWElementCapRule?.status==='OWNER_APPROVED_PROVISIONAL'&&Number.isFinite(root.MHWElementCapRule.flat)&&Number.isFinite(root.MHWElementCapRule.multiplier)&&conversionComponentsSupported&&
   Object.keys(hhChargeRecords).every(id=>hhChargeRawValid(id,techniqueDb.get('hunting-horn',id))&&hhChargeRawValid(id,root.TechniqueDBEngine?.get?.('hunting-horn',id)))&&hhChargeIds.every(hhChargeRecordValid);
  if(hhThunderZeroResolved&&conversionMaximumIssue==='REAL_SLICE:THUNDER_CONVERSION_BODY_SCOPE_UNSUPPORTED')conversionMaximumIssue=null;
  let conditionPlan=(gsChargeActive||bowChargeResolved||ammoChargeExcluded||chargeNoElementResolved||chargeSaNoElementResolved||cbChargeNoElementResolved||glChargeNonchargedResolved||hhChargeNoElementResolved)&&resolvedConditionPlan?{...resolvedConditionPlan,pending:(resolvedConditionPlan.pending||[]).filter(x=>!['チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING','Charge Master:CONDITIONAL_DAMAGE_FORMULA_PENDING'].includes(x))}:resolvedConditionPlan;
  // Owner-approved 168 scenario, not Dark Arts 172 and not a dynamic HP timing model.
  const darkPeakScenario=root.MHDarkPeakScenario;
  const darkPeakScoped=conditionPlan?.excluded?.some(x=>x.reason==='DARK_BELOW_FULL_NO_HEALING_MAXIMUM')&&!healthBranchKinds(conditionPlan).required&&darkPeakScenario&&weapon.kind===darkPeakScenario.weaponKind&&resolvedTechniqueIds.length===darkPeakScenario.techniqueIds.length&&resolvedTechniqueIds.every((id,i)=>id===darkPeakScenario.techniqueIds[i]);
  if(darkPeakScoped){const pending=conditionPlan.pending.filter(x=>x!=='暗黒:DARK_STANDARD_SEQUENCE_REQUIRED');conditionPlan={...conditionPlan,pending,status:pending.length?conditionPlan.status:'READY'};}
  if(conditionPlan&&(resistanceConversionLevel||attributeConversionLevel)&&conditionPlan.pending.length===0)conditionPlan.status='READY';
  const gogPlan=conditionPlan?.groupPlan?.applied?.find(x=>x.skillId===178);
  // Reuse exact adopted producer/resource contracts; never approve arbitrary
  // componentSource hits. Element flows through body/axe hits once; IMPACT
  // phials and intrinsic GL fire retain their existing independent formulas.
  const cbGogResolved=weapon.kind==='charge-blade'&&!!cbChargeRoute&&conditions.standardEvaluation===true&&weapon.phial==='impact'&&officialPhialType==='IMPACT'&&cbChargeStateValid(chargeBladeState)&&[conditions,conditions.chargeBladeState,stats].every(cbChargeNoAlternate)&&resolvedTechniqueIds.every(cbChargeRecordValid);
  const glGogResolved=weapon.kind==='gunlance'&&conditions.standardEvaluation===true&&conditions.mounted===false&&!!glTargetContext&&glTargetContext.rules.id==='GL_OWNER_STAKE_TARGET'&&glTargetContext.rules.status==='OWNER_APPROVED_PROVISIONAL'&&glChargeEqual(glTargetContext.rules,root.TechniqueDBEngine?.get?.('gunlance',glTargetIds[2])?.glTargetRules)&&glChargeEqual(gunlanceState,conditions.gunlanceState)&&gunlanceState.chargedRounds===null&&[conditions,stats,resolvedConditionPlan?.normal,resolvedConditionPlan?.maximum].every(glChargeNoAlternate)&&resolvedTechniqueIds.length===glTargetIds.length&&resolvedTechniqueIds.every((id,i)=>id===glTargetIds[i])&&resolvedTechniqueIds.every(glChargeRecordValid);
  const gogNormalAmmoResolved=!!gogPlan&&activeBonusEffects.some(gogNormalAmmoBonus)&&resolvedTechniqueIds.every(id=>['heavy-bowgun','light-bowgun'].includes(techniques[id]?.referenceKind)&&techniques[id]?.referenceInput?.state?.ammoType==='NORMAL');
  if(gogPlan){
   const hhGogScope=root.MHGogElementRule?.hhModelScope;
   const hhGogResolved=!!hhModel&&hhModel.id===hhGogScope?.modelId&&resolvedTechniqueIds.every(id=>{
    const t=techniques[id],records=t.hhModel?.specialRecords;
    return !!records&&t.hhModel.id===hhGogScope.modelId&&Object.keys(records).length===hhGogScope.elementTechniqueIds.length+1&&[...hhGogScope.elementTechniqueIds,hhGogScope.fixedExcludedTechniqueId].every(key=>records[key]?.techniqueId===key&&records[key]?.sourceFormula?.status==='SOURCE_CONFIRMED');
   });
   const unsupported=(['light-bowgun','heavy-bowgun'].includes(weapon.kind)&&!gogNormalAmmoResolved)||(hasShelling&&!glGogResolved)||(!!hhModel&&!hhGogResolved)||resolvedTechniqueIds.some(id=>{const t=techniques[id];return t.referenceKind?!['bow','charge-blade-saed'].includes(t.referenceKind)&&!gogNormalAmmoResolved:(t.hits||[]).some(h=>h.componentSource)&&!cbGogResolved;})||(weapon.kind==='switch-axe'&&switchAxeState?.awakened===true);
   if(unsupported)conditionPlan={...conditionPlan,pending:[...(conditionPlan.pending||[]),'GOG:DEDICATED_COMPONENT_NOT_ADOPTED']};
  }
  if(thousandRequested&&(elementType!=='none'||elementRawValue!==0))return fail('BOW_THOUSAND:ELEMENT_NOT_ADOPTED');
  const bladescaleTechnique=resolvedTechniqueIds.length===1?techniques[resolvedTechniqueIds[0]]:null;
  const bladescaleEligible=bladescaleEntries.length>0&&elementType==='none'&&elementRawValue===0&&bladescaleRule.techniques[weapon.kind]?.includes(resolvedTechniqueIds[0])===true&&resolvedTechniqueIds.length===1&&!bladescaleTechnique?.referenceKind&&!hhModel&&!hasShelling&&bladescaleTechnique?.hits?.length===1&&!bladescaleTechnique.hits[0].componentSource&&!(weapon.kind==='switch-axe'&&switchAxeState?.awakened!==false);
  if(bladescaleEntries.length&&!bladescaleEligible)conditionPlan={...conditionPlan,pending:[...(conditionPlan?.pending||[]),'BLADESCALE_FIRST_HIT_SCOPE_PENDING']};
  const explicitAffinityEntries=allSkills.filter(x=>x.skillKey==='explicitAffinity');
  if(conditionPlan&&explicitAffinityEntries.length){const names=new Set(explicitAffinityEntries.flatMap(x=>Number(x.skillId)===39?['濡れ刃紋','Wet Blade Mark']:['抜刀術【技】','抜刀術[技]','Critical Draw']));const pending=conditionPlan.pending.filter(x=>!names.has(x.split(':')[0]));conditionPlan={...conditionPlan,pending,status:pending.length?conditionPlan.status:'READY'};}
  const drawEntry=explicitAffinityEntries.find(x=>Number(x.skillId)===103);
  const referenceDrawCount=(id,t)=>t.referenceKind==='charge-blade-saed'?t.hits?.length:t.referenceKind==='bow'?root.BowReference.hitsForState(root.TechniqueDBEngine,id,bowState).length:['heavy-bowgun-element','light-bowgun-element'].includes(t.referenceKind)?(t.referenceInput.state.contactPolicy==='EXPLICIT_CONTACTS'?t.referenceInput.state.contacts?.length:1):['heavy-bowgun','light-bowgun'].includes(t.referenceKind)?root.TechniqueDBEngine.get(weapon.kind,id)?.specialSourceValues?.hitCount:1;
  const referenceDrawAdds=(channel,id)=>{if(!drawEntry)return undefined;const t=techniques[id],flags=conditions.criticalDrawHits?.[channel]?.[id];if(!Array.isArray(flags)||flags.length!==referenceDrawCount(id,t)||flags.some(v=>typeof v!=='boolean'))throw Error('CRITICAL_DRAW_HIT_STATE_REQUIRED:'+id);return flags.map(on=>on?root.MHWExplicitAffinityRules.draw[drawEntry.level]:0);};
  const punishingEntry=allSkills.find(x=>Number(x.skillId)===8);
  const referencePunishingAdds=(channel,id)=>{if(!punishingEntry)return undefined;const flags=conditions.punishingDrawHits?.[channel]?.[id];if(!Array.isArray(flags)||flags.length!==referenceDrawCount(id,techniques[id])||flags.some(v=>typeof v!=='boolean'))throw Error('PUNISHING_DRAW_HIT_STATE_REQUIRED:'+id);return flags.map(on=>on?[0,3,5,7][punishingEntry.level]:0);};
  const explicitAffinityEffects=(channel)=>{
   const effects=[],rule=root.MHWExplicitAffinityRules;
   const add=(id,amount,componentIds)=>{for(const target of ['physical','element'])effects.push({id:id+(target==='element'?'-element':''),target,stage:'affinity',unit:'percent',operation:'add',amount,order:84,source:rule.source,condition:{type:'always'},...(componentIds?{componentIds:componentIds(target)}:{})});};
   for(const entry of explicitAffinityEntries){
    if(!Number.isInteger(entry.level)||entry.level<1||entry.level>3)throw Error('EXPLICIT_AFFINITY_LEVEL_INVALID');
    if(Number(entry.skillId)===39){const state=conditions.wetState?.[channel];if(typeof state?.wet!=='boolean'||typeof state?.bubble!=='boolean')throw Error('WET_BUBBLE_STATE_REQUIRED');add('wet-bubble', rapidAmmoSequence&&conditions.standardEvaluation===true&&channel==='normal'?0:(state.wet?rule.wet[entry.level]:0)+(state.bubble?rule.bubble[entry.level]:0));}
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
     for(const [i,h] of (t.hits||[]).entries())add(i,ordinaryHitDamageType(id,h));
     if(t.saAwakened)for(const [i,mode] of (t.modeContract?.hitModes||t.hits.map(()=>t.stateRequirement?.mode)).entries())if(mode==='SWORD')add(t.hits.length+i,t.saAwakened.damageType);
    }
   }
  }catch(error){return fail(String(error.message));}
  const blackEclipse=conditionPlan?.blackEclipse||null;
  const frenzyAffinity=root.MHResolveFrenzyAffinity(skillTotal,conditions.blackEclipseState,conditions.standardEvaluation===true||conditions.fixedActivationConditions===true);
  const ballisticsLevel=Math.max(0,...allSkills.filter(x=>x.skillKey==='ballistics').map(x=>x.level));
  if(!Number.isInteger(ballisticsLevel)||ballisticsLevel>3)return fail('BALLISTICS_LEVEL_INVALID');
  const criticalRangeAttackAdd=root.MHCommonSkillDamageRules.ballistics.criticalRangeAttackAdds[ballisticsLevel];
  // Wyvern range and physical-only bonus are validated by its dedicated consumer.
  const maximumElement=Number(conditionPlan?.maximum?.element);
  const provenance={sourceUrl:`https://wilds.mhdb.io/en/weapons/${weapon.id}`,sourceGameVersion:'UNKNOWN',adoptionStatus:'OWNER_APPROVED_PROVISIONAL',targetGameVersion:versions.game,retrievedAt,apiVersion:'UNKNOWN'};
  const normalizedChargeBladeState=chargeBladeState&&typeof chargeBladeState==='object'?{...chargeBladeState,shieldBoostAxeBodyMultiplier:root.ChargeBladeEngine?.shieldBoostAxeBodyMultiplier}:chargeBladeState;
  // MHDB 129 separates part durability from focused wound-destruction HP.
  // These six reconciled ordinary body records are not focus/wound events.
  // Do not promote their IDs globally: generated, special or alternate-state
  // variants still need their own adoption. Existing no-wound routes stay intact.
  // Bounded ordinary H events: memo/12 distinguishes morph/shield thrust from
  // focus/jump attacks; memo/27 excludes axe-enhancement extras from Airborne.
  // Partbreaker changes part durability and wound-destruction HP, not these
  // ordinary contacts. Reuse the existing CB producer/resource proof without
  // broadening either shared ID map or adopting any coefficient/count/version.
  const cbHOrdinaryMetadata=x=>cbChargeNoAlternate(x)&&
   ['jumpAttack','jumping','airborne','mounted','dismountAttack','sneakAttack','focusAttack','woundDestruction','woundEvent'].every(k=>x?.[k]==null||x[k]===false)&&
   ['specialComponents','excludedComponents'].every(k=>x?.[k]===undefined||(Array.isArray(x[k])&&x[k].length===0))&&
   x?.specialSourceValues==null&&!x?.glModel&&!x?.hhModel&&!x?.saAwakened&&!x?.referenceKind;
  const cbHStateKeys=['mode','swordBoosted','shieldBoosted','axeBoosted','phialType','enhancedPhial','previousAction','enhancedPhials','normalPhials'];
  const cbHOrdinaryState=s=>cbChargeStateValid(s)&&cbHOrdinaryMetadata(s)&&Object.keys(s).every(k=>cbHStateKeys.includes(k));
  const cbHBodyMvs={CB_AXE_TO_SWORD_MORPH:[30],CB_SHIELD_THRUST:[15,6],CB_AED:[68],CB_FOLLOWUP_AED:[78]};
  const cbHPhialSource='https://kuroyonhon.com/mhwilds/memo/12.php;cb1-shield-limited/approved-readout.log';
  const cbHOrdinaryRecord=(id,index)=>{
   if(!cbChargeRecordValid(id,index))return false;
   const raw=techniqueDb.get('charge-blade',id),t=techniques[id],e=root.ChargeBladeEngine.techniques[id],prefix=index<2;
   if(![raw,t,e,t.resourceContract,t.phialState,t.phialReference].every(cbHOrdinaryMetadata)||raw.weaponType!=='charge-blade'||t.weaponType!=='charge-blade')return false;
   if(raw.stateRequirement!=null&&(typeof raw.stateRequirement!=='object'||Array.isArray(raw.stateRequirement)||Object.keys(raw.stateRequirement).length))return false;
   if(!raw.hits.every((h,i)=>h.mv===cbHBodyMvs[id][i]&&Object.keys(h).every(k=>['mv','elementModifier','damageType'].includes(k)))||!t.hits.every(cbHOrdinaryMetadata))return false;
   if(!Object.keys(e).every(k=>['name','axeBoostHits','shieldBoostAxeBody','rapidMorphDamageEligible','phial'].includes(k))||e.shieldBoostAxeBody!==!prefix||e.rapidMorphDamageEligible!==(index===0))return false;
   if(e.axeBoostHits&&!Object.keys(e.axeBoostHits).every(k=>['count','mv','elementModifier'].includes(k)))return false;
   if(index){
    const p=e.phial,keys=prefix?['impactCoefficient','powerElementCoefficient','count','verification']:['impactCoefficient','powerElementCoefficient','enhancedImpactCoefficient','enhancedPowerElementCoefficient','count','verification'];
    if(!p||Object.keys(p).length!==keys.length||!Object.keys(p).every(k=>keys.includes(k))||p.impactCoefficient!==(prefix?0.05:0.16)||p.powerElementCoefficient!==(prefix?1.5:4.2)||p.count!==null||p.verification!=='TODO_COUNT'||(!prefix&&(p.enhancedImpactCoefficient!==0.2||p.enhancedPowerElementCoefficient!==6)))return false;
    const source=prefix?cbHPhialSource:'USER_VIDEO_OBSERVATION:1a11b213a0886-master_playlist.mp4;1a11b4e1a1f6-master_playlist.mp4';
    if(t.phialReference.sourceRefs[0]!==source)return false;
   }
   return true;
  };
  const cbHOrdinaryBonus=rows=>Array.isArray(rows)&&rows.length<=1&&rows.every(x=>x?.bonusSkillId===173&&[1,2].includes(x.rankLevel)&&x.name===(x.rankLevel===1?'レゾナンスⅠ':'レゾナンスⅡ')&&x.level===1&&x.required===(x.rankLevel===1?2:4)&&Number.isInteger(x.count)&&x.count>=x.required&&x.count<=5);
  const cbHOrdinaryResolved=weapon.kind==='charge-blade'&&cbChargeRoute==='H'&&conditions.standardEvaluation===true&&
   allSkills.some(x=>[129,86].includes(Number(x.skillId)))&&weapon.phial==='impact'&&officialPhialType==='IMPACT'&&weapon.specials.length===0&&
   cbHOrdinaryState(chargeBladeState)&&cbHOrdinaryState(conditions.chargeBladeState)&&
   [conditions,stats,resolvedConditionPlan?.normal,resolvedConditionPlan?.maximum].every(cbHOrdinaryMetadata)&&
   [stats,resolvedConditionPlan?.normal,resolvedConditionPlan?.maximum].every(knownNoElement)&&
   zeroElementComponents(stats.elementComponents)&&zeroElementComponents(resolvedConditionPlan?.normal?.elementComponents)&&zeroElementComponents(resolvedConditionPlan?.maximum?.elementComponents)&&zeroElementComponents(resolvedConditionPlan?.maximumElementComponents,true)&&
   cbHOrdinaryBonus(stats.activeBonusEffects)&&!attributeConversionLevel&&!resistanceConversionLevel&&!waterEntries.length&&!allSkills.some(x=>Number(x.skillId)===133)&&
   noAddedElement(resolvedConditionPlan?.applied)&&noAddedElement(resolvedConditionPlan?.groupPlan?.applied)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.normal)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.maximum)&&
   !hasShelling&&!hasReference&&!hhModel&&resolvedTechniqueIds.every(cbHOrdinaryRecord);
  // Exact ordinary ground GL events (memo/10), not jump targets (memo/27)
  // or Focus Strike wound destruction (MHDB 129). Intrinsic shell/fire is kept.
  // These existing record values identify the bounded producer only. They do
  // not adopt coefficients or expand the shared hit/no-wound ID maps.
  const glOrdinaryRecords={"GL_SLAM":[["baselineGameVersion","currentVersionAudit","damageTypeStatus","evidenceRefs","hits","numericScope","replacedRecord","revision","shellingBodyResourceContract","sourceComparisonNote","techniqueId","techniqueName","validFromVersion","validToVersion","verificationStatus","weaponType"],{"weaponType":"gunlance","techniqueId":"GL_SLAM","techniqueName":"叩きつけ","revision":2,"validFromVersion":null,"validToVersion":null,"verificationStatus":"PARTIALLY_VERIFIED","evidenceRefs":["MACARONGAMEMO_GUNLANCE_MOTION_CURRENT","https://kuroyonhon.com/mhwilds/memo/10.php"],"hits":[{"mv":57,"elementModifier":2,"component":"BODY","damageType":"slash","damageTypeSource":"https://kuroyonhon.com/mhwilds/memo/10.php"}],"damageTypeStatus":"SOURCE_CONFIRMED_NOT_LIVE_VERIFIED","baselineGameVersion":null,"numericScope":"SOURCE_BACKED_PROVISIONAL_HP","sourceComparisonNote":"Current memo10 element2 provisionally replaces legacy element1; exact game version and live damage pending.","shellingBodyResourceContract":"NO_SHELL_CONSUMPTION_BODY","currentVersionAudit":"PENDING"}],"GL_SWEEP":[["baselineGameVersion","currentVersionAudit","damageTypeStatus","evidenceRefs","hits","numericScope","replacedRecord","revision","shellingBodyResourceContract","sourceComparisonNote","techniqueId","techniqueName","validFromVersion","validToVersion","verificationStatus","weaponType"],{"weaponType":"gunlance","techniqueId":"GL_SWEEP","techniqueName":"なぎ払い","revision":2,"validFromVersion":null,"validToVersion":null,"verificationStatus":"PARTIALLY_VERIFIED","evidenceRefs":["MACARONGAMEMO_GUNLANCE_MOTION_CURRENT","https://kuroyonhon.com/mhwilds/memo/10.php"],"hits":[{"mv":40,"elementModifier":1.5,"component":"BODY","damageType":"slash","damageTypeSource":"https://kuroyonhon.com/mhwilds/memo/10.php"}],"damageTypeStatus":"SOURCE_CONFIRMED_NOT_LIVE_VERIFIED","baselineGameVersion":null,"numericScope":"SOURCE_BACKED_PROVISIONAL_HP","sourceComparisonNote":null,"shellingBodyResourceContract":"NO_SHELL_CONSUMPTION_BODY","currentVersionAudit":"PENDING"}],"GL_WYRMSTAKE_FULL_BURST":[["baselineGameVersion","calculationStatus","currentVersionAudit","evidenceRefs","glTargetRules","hits","liveGameVerification","numericStatus","replacedRecord","revision","sourceVersionNote","specialComponents","techniqueId","techniqueName","validFromVersion","validToVersion","verificationStatus","weaponType"],{"weaponType":"gunlance","techniqueId":"GL_WYRMSTAKE_FULL_BURST","techniqueName":"竜杭フルバースト","revision":2,"validFromVersion":null,"validToVersion":null,"verificationStatus":"PARTIALLY_VERIFIED","evidenceRefs":["https://kuroyonhon.com/mhwilds/memo/10.php","https://note.com/kehaar6/n/ne919a3e7c6cb","https://note.com/kehaar6/n/n1be0abdb3a0a"],"hits":[],"specialComponents":["SHELLING","WYRMSTAKE"],"numericStatus":"PROVISIONALLY_ADOPTED","calculationStatus":"READY_COMPONENT_MODEL","baselineGameVersion":null,"sourceVersionNote":"post-1.011 table; exact current game version unverified","glTargetRules":{"id":"GL_OWNER_STAKE_TARGET","status":"OWNER_APPROVED_PROVISIONAL","source":"https://kuroyonhon.com/mhwilds/memo/10.php","retrievedAt":"2026-11-04","officialGameVersion":null,"sourceVersion":"post-1.011 table; exact current game version unverified","liveGameVerification":"PENDING","approvalBasis":"KAN-17#10062;OWNER_SOURCE_BACKED_GL_COMPLETION_2026-11-04","sourceRefs":["https://kuroyonhon.com/mhwilds/memo/10.php","https://note.com/kehaar6/n/ne919a3e7c6cb","https://note.com/kehaar6/n/n1be0abdb3a0a"],"scope":"EXACT_FOUR_ACTION_FULL_HIT_REFERENCE;NO_TIMING;NO_GAUGE_RECHARGE","body":[{"mv":30,"elementModifier":1},{"mv":20,"elementModifier":1}],"burstElementModifier":0.5,"powerRows":{"NORMAL_HIGH":{"burstMv":7,"explosionMv":28,"explosionFire":230},"LONG_HIGH":{"burstMv":8,"explosionMv":42,"explosionFire":230},"NORMAL_MEDIUM":{"burstMv":6,"explosionMv":25,"explosionFire":210},"LONG_MEDIUM":{"burstMv":7,"explosionMv":37,"explosionFire":210},"WIDE_MEDIUM":{"burstMv":6,"explosionMv":25,"explosionFire":210},"WIDE_HIGH":{"burstMv":7,"explosionMv":27,"explosionFire":230}},"stakeFullBurstMultiplier":{"NORMAL":1.25,"LONG":1.1,"WIDE":1.05},"actions":{"GL_WYRMSTAKE_FULL_BURST":{"burstCount":9,"explosionMultiplier":1,"reload":false},"GL_MULTI_WYRMSTAKE_FULL_BURST":{"burstCount":15,"explosionMultiplier":1.1,"reload":true}},"artilleryScope":"FIXED_SHELL_AND_FINAL_EXPLOSION_ONLY;EXISTING_GL_ATTACK_ORDER","noSharpnessMultiplier":1,"cornScope":"NOT_ADOPTED_FOR_STAKE_TARGET","sharpnesslessComponents":["STAKE_BURST"],"assumptions":["STAKE_FB_SHELL_CORRECTION_APPLIED_TO_BOTH_STAKE_FB_ACTIONS","ALL_BODY_AND_STAKE_CONTACTS_HIT","NO_AUTO_GUARD_ACTIVATION"]},"currentVersionAudit":"PENDING","liveGameVerification":"PENDING"}],"GL_MULTI_WYRMSTAKE_FULL_BURST":[["baselineGameVersion","calculationStatus","currentVersionAudit","evidenceRefs","glTargetRules","hits","liveGameVerification","numericStatus","replacedRecord","revision","sourceVersionNote","specialComponents","techniqueId","techniqueName","validFromVersion","validToVersion","verificationStatus","weaponType"],{"weaponType":"gunlance","techniqueId":"GL_MULTI_WYRMSTAKE_FULL_BURST","techniqueName":"連装竜杭フルバースト","revision":2,"validFromVersion":null,"validToVersion":null,"verificationStatus":"PARTIALLY_VERIFIED","evidenceRefs":["https://kuroyonhon.com/mhwilds/memo/10.php","https://note.com/kehaar6/n/ne919a3e7c6cb","https://note.com/kehaar6/n/n1be0abdb3a0a"],"hits":[],"specialComponents":["SHELLING","WYRMSTAKE"],"numericStatus":"PROVISIONALLY_ADOPTED","calculationStatus":"READY_COMPONENT_MODEL","baselineGameVersion":null,"sourceVersionNote":"post-1.011 table; exact current game version unverified","glTargetRules":{"id":"GL_OWNER_STAKE_TARGET","status":"OWNER_APPROVED_PROVISIONAL","source":"https://kuroyonhon.com/mhwilds/memo/10.php","retrievedAt":"2026-11-04","officialGameVersion":null,"sourceVersion":"post-1.011 table; exact current game version unverified","liveGameVerification":"PENDING","approvalBasis":"KAN-17#10062;OWNER_SOURCE_BACKED_GL_COMPLETION_2026-11-04","sourceRefs":["https://kuroyonhon.com/mhwilds/memo/10.php","https://note.com/kehaar6/n/ne919a3e7c6cb","https://note.com/kehaar6/n/n1be0abdb3a0a"],"scope":"EXACT_FOUR_ACTION_FULL_HIT_REFERENCE;NO_TIMING;NO_GAUGE_RECHARGE","body":[{"mv":30,"elementModifier":1},{"mv":20,"elementModifier":1}],"burstElementModifier":0.5,"powerRows":{"NORMAL_HIGH":{"burstMv":7,"explosionMv":28,"explosionFire":230},"LONG_HIGH":{"burstMv":8,"explosionMv":42,"explosionFire":230},"NORMAL_MEDIUM":{"burstMv":6,"explosionMv":25,"explosionFire":210},"LONG_MEDIUM":{"burstMv":7,"explosionMv":37,"explosionFire":210},"WIDE_MEDIUM":{"burstMv":6,"explosionMv":25,"explosionFire":210},"WIDE_HIGH":{"burstMv":7,"explosionMv":27,"explosionFire":230}},"stakeFullBurstMultiplier":{"NORMAL":1.25,"LONG":1.1,"WIDE":1.05},"actions":{"GL_WYRMSTAKE_FULL_BURST":{"burstCount":9,"explosionMultiplier":1,"reload":false},"GL_MULTI_WYRMSTAKE_FULL_BURST":{"burstCount":15,"explosionMultiplier":1.1,"reload":true}},"artilleryScope":"FIXED_SHELL_AND_FINAL_EXPLOSION_ONLY;EXISTING_GL_ATTACK_ORDER","noSharpnessMultiplier":1,"cornScope":"NOT_ADOPTED_FOR_STAKE_TARGET","sharpnesslessComponents":["STAKE_BURST"],"assumptions":["STAKE_FB_SHELL_CORRECTION_APPLIED_TO_BOTH_STAKE_FB_ACTIONS","ALL_BODY_AND_STAKE_CONTACTS_HIT","NO_AUTO_GUARD_ACTIVATION"]},"currentVersionAudit":"PENDING","liveGameVerification":"PENDING"}],"GL_SHELL_NORMAL_MEDIUM":[["baselineGameVersion","calculationStatus","currentVersionAudit","evidenceRefs","hits","introducedIn","numericStatus","revision","sourceLocator","specialComponents","specialSourceValues","stateRequirement","techniqueId","techniqueName","unresolvedReasons","validFromVersion","validToVersion","verificationStatus","weaponType"],{"weaponType":"gunlance","techniqueId":"GL_SHELL_NORMAL_MEDIUM","techniqueName":"砲撃（通常／ふつう）","revision":1,"introducedIn":"r49","validFromVersion":null,"validToVersion":null,"baselineGameVersion":"1.042.00.02","numericStatus":"SOURCE_CONFIRMED","verificationStatus":"UNVERIFIED","calculationStatus":"EVIDENCE_GATED","currentVersionAudit":"PENDING","unresolvedReasons":["SPECIAL_FORMULA_AND_EVENT_COUNT_PENDING","OFFICIAL_BASELINE_VERSION_AUDIT_PENDING"],"evidenceRefs":["MACARONGAMEMO_GL_R49_SOURCE"],"sourceLocator":"砲撃のモーション値: 通常 / ふつう / 砲撃","hits":[],"stateRequirement":{"shellingType":"NORMAL","shellingPower":"MEDIUM"},"specialComponents":["SHELL"],"specialSourceValues":{"unparenthesizedValue":8,"parenthesizedValue":70,"p0ReferenceRules":{"loadShellsReference":{"capacityAdds":{"0":0,"1":0,"2":1},"supportedLevels":[0,1,2],"levelOneDisposition":"TIMING_ONLY_NO_CAPACITY_OR_HP_CHANGE","levelOneEvidenceRef":"MHDB_JA_SKILLS_20261026:109:rank1","evidenceRef":"KAN23_LOAD_SHELLS_LV2_20261012","adoptionStatus":"PROVISIONALLY_ADOPTED","verificationStatus":"UNVERIFIED","scope":"CAPACITY_ONLY_NO_AUTO_FILL_NO_TIMING","targetGameVersion":null},"cornpopperReference":{"skillId":159,"name":"焼き砲モロコシ","level":1,"supportedActions":["NORMAL","CHARGED"],"physicalMultiplier":1.35,"fireDisplayAdd":30,"fireUnit":"DISPLAY_ELEMENT","normalState":"INACTIVE","maximumState":"CONTINUOUS_COOLING","attackOrder":"BASE_MULTIPLIERS_ARTILLERY_CORNPOPPER_THEN_FLAT","adoptionStatus":"OWNER_APPROVED_PROVISIONAL","sourceVersion":"Ver1.020.02.00","evidenceRef":"https://note.com/kehaar6/n/n1be0abdb3a0a","approval":"Sentinel_b427654e40d88191a6ea7d004849a9dd","liveGameVerification":"UNVERIFIED_CURRENT_VERSION","scopeWarning":"通常未発動／最大は放熱継続。通常・溜め砲撃のみ暫定採用。フルバースト等は未採用。時間・ゲージの再現ではない。"},"artilleryReference":{"physicalMultipliers":[1,1.05,1.1,1.15],"fireDisplayAdds":[0,30,60,90],"fireUnit":"DISPLAY_ELEMENT","supportedActions":["NORMAL","CHARGED","FULL_BURST"],"actionExtensionAdoption":"OWNER_APPROVED_PROVISIONAL","actionExtensionScope":"ADOPTED_CHARGED_AND_ORDINARY_FULL_BURST_ONLY_NO_STAKE","evidenceRef":"KAN23_GAMEWITH_ARTILLERY_20260601","adoptionStatus":"PROVISIONALLY_ADOPTED","verificationStatus":"UNVERIFIED","scope":"NORMAL_CHARGED_ORDINARY_FULL_BURST_OWNER_APPROVED_ATTACK_COMPONENTS","attackOrder":"BASE_MULTIPLIERS_ARTILLERY_THEN_FLAT","attackOrderAdoption":"OWNER_APPROVED_PROVISIONAL","targetGameVersion":null},"mhdbShellLevelToPower":{"2":"MEDIUM"},"shellLevelEvidenceRef":"KAN23_MHDB_SHELL_LEVEL_20261012","adoptionStatus":"PROVISIONALLY_ADOPTED","verificationStatus":"UNVERIFIED","evidenceRef":"KAN23_SHELL_P0_SOURCE_20261011","sourceUrl":"https://kuroyonhon.com/mhwilds/memo/10.php","crosscheckUrl":"https://note.com/kehaar6/n/n03532a61038c","sourceGameVersion":"ver1.011 onwards; 1.042 live verification pending","checkedAt":"2026-10-11","supportedSourceIds":["GL_SHELL_NORMAL_MEDIUM","GL_SHELL_LONG_MEDIUM","GL_SHELL_WIDE_MEDIUM","GL_SHELL_WIDE_HIGH"],"baseCapacity":{"NORMAL":6,"LONG":3,"WIDE":2},"normalPhysicalMultiplier":1,"chargedPhysicalMultiplier":1.8,"fullBurstPhysicalMultiplier":{"NORMAL":1.4,"LONG":1.4,"WIDE":1.35},"fireElementModifier":1,"scope":"NO_ARTILLERY_NO_CAPACITY_MODIFIER_EXPLICIT_COMMON_REFERENCE","pendingReason":"砲術・装填スキル等の適用、他砲撃力の版差、武器砲撃情報との照合は未完了。集中竜杭穿ちと通常竜杭は含めない。","mhdbShellLevelToPowerByType":{"WIDE":{"3":"HIGH"},"NORMAL":{"3":"HIGH"}},"normalHighLevelEvidence":{"weaponId":329,"shellLevel":3,"power":"HIGH","sourceUrl":"https://appmedia.jp/mhwilds/78625499","scope":"MHDB normal shell level 3 corresponds to やや強い; reuse adopted NORMAL_HIGH coefficients","status":"SOURCE_CONFIRMED","liveGameVerification":"PENDING"},"highScope":{"sourceId":"GL_SHELL_WIDE_HIGH","supportedActions":["NORMAL","CHARGED"],"evidence":"MHDB weapon350 shell=wide shellLevel=3; source weapon table Alras Rook I = wide/high","adoptionStatus":"OWNER_APPROVED_PROVISIONAL"},"offensiveGuardReference":{"skillId":66,"supportedActions":["NORMAL","CHARGED","FULL_BURST"],"fullBurstPower":"MEDIUM","fullBurstAdoption":{"status":"OWNER_APPROVED_PROVISIONAL","liveGameVerification":"UNVERIFIED","scope":"Existing MEDIUM FULL_BURST only; shared resolved attack multiplier once, flat afterward, fire unchanged; no HIGH or Cornpopper FB extension","evidence":"docs/reports/r263-skill-audit/gl-guard-fb/REPORT.md"},"multiplierSource":"standardPowerConditionPlan / MHDB_JA_SKILL_66_20261007","attackOrder":"BASE_MULTIPLIERS_GUARD_ARTILLERY_CORNPOPPER_THEN_FLAT","fireAffected":false,"adoptionStatus":"OWNER_APPROVED_PROVISIONAL","evidence":"docs/reports/r263-skill-audit/gl-guard-video/READOUT.md","scope":"Observed shell damage increase; component and flat order owner adopted, not measured"}}}}]};
  const glOrdinaryEqual=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const glOrdinaryNoAlternate=x=>glChargeNoAlternate(x)&&
   ['jumpAttack','jumping','airborne','mounted','dismountAttack','sneakAttack','focusAttack','woundDestruction','woundEvent'].every(k=>x[k]==null||x[k]===false)&&
   ['intrinsicElement','intrinsicStatus','componentSource','extraEvents','generatedEvents'].every(k=>x[k]==null);
  const glOrdinaryRawValid=(id,r)=>{const c=glOrdinaryRecords[id];return !!(c&&r&&glOrdinaryEqual(Object.keys(r).sort(),c[0])&&glOrdinaryEqual(Object.fromEntries(Object.keys(r).filter(k=>k!=='replacedRecord').map(k=>[k,r[k]])),c[1]));};
  const glOrdinaryBonus=rows=>Array.isArray(rows)&&rows.length<=1&&rows.every(x=>
   Object.keys(x).every(k=>['name','level','source','displayType','bonusName','bonusSkillId','rankLevel','count','required'].includes(k))&&
   x.bonusSkillId===173&&x.bonusName==='オメガレゾナンス'&&x.source==='series'&&x.displayType==='series'&&[1,2].includes(x.rankLevel)&&x.name===(x.rankLevel===1?'レゾナンスⅠ':'レゾナンスⅡ')&&x.level===1&&x.required===(x.rankLevel===1?2:4)&&Number.isInteger(x.count)&&x.count>=x.required&&x.count<=(x.rankLevel===1?3:5));
  const glOrdinarySkill=(id,name,max)=>{
   const related=x=>Number(x.skillId)===id||x.name===name,rows=[...allSkills,...rawSkills,...buildSkills].filter(related);
   return rows.length>0&&rows.every(x=>x.skillId===id&&x.name===name&&Number.isInteger(x.level)&&x.level>=1&&x.level<=max)&&new Set(rows.map(x=>x.level)).size===1&&rawSkills.filter(related).length<=1&&buildSkills.filter(related).length<=1&&
    weapon.skills.filter(x=>Number(x?.skill?.id??x?.id)===id||(x?.skill?.name||x?.name)===name).every(x=>(x?.skill?.id??x?.id)===id&&(x?.skill?.name||x?.name)===name&&Number.isInteger(x.level)&&x.level>=1&&x.level<=max)&&
    skills.filter(x=>x?.[0]===name).every(x=>x.length===2&&Number.isInteger(x[1])&&x[1]>=1&&x[1]<=max);
  };
  const glOrdinaryRecordValid=(id,i)=>{
   const raw=techniqueDb.get('gunlance',id),t=techniques[id];
   if(!glChargeRecordValid(id,i)||!glOrdinaryRawValid(id,raw)||!glOrdinaryRawValid(id,root.TechniqueDBEngine?.get?.('gunlance',id)))return false;
   const expected=i<2?raw:{...raw,specialComponents:[],calculationStatus:'READY_BODY_COMPONENT',hits:[...glTargetContext.rules.body.map(h=>({...h,damageType:'slash'})),...Array.from({length:glTargetContext.rules.actions[id].burstCount},()=>({mv:glTargetContext.row.burstMv,elementModifier:glTargetContext.rules.burstElementModifier,damageType:'slash',glComponent:'STAKE_BURST'}))],glModel:{...glTargetContext,action:glTargetContext.rules.actions[id],id},glComponentContract:{status:glTargetContext.rules.status,source:glTargetContext.rules.source,noSharpnessMultiplier:glTargetContext.rules.noSharpnessMultiplier}};
   return glOrdinaryEqual(t,expected);
  };
  const glOrdinaryOmegaInactive=(()=>{
   const b=stats.activeBonusEffects;if(!glOrdinaryBonus(b)||conditions.selfSkillState?.shared?.omega!=='INACTIVE')return false;
   const related=x=>x.skillId===173||['オメガレゾナンス','レゾナンスⅠ','レゾナンスⅡ'].includes(x.name),rows=allSkills.filter(related);
   if(!b.length)return rows.length===0;
   const e=b[0],x=rows[0],plan=resolvedConditionPlan,self=plan?.selfStatePlan,group=plan?.groupPlan;
   if(rows.length!==1||x.name!==e.name||x.level!==1||x.skillId!=null||x.skillKey!=='unknown'||rawSkills.some(related)||buildSkills.filter(related).length!==1||!skills.filter(x=>['オメガレゾナンス','レゾナンスⅠ','レゾナンスⅡ'].includes(x[0])).every(x=>x[0]===e.name&&x[1]===1))return false;
   const armor=stats.armorThunderResistanceInput,slots=['head','chest','arms','waist','legs'],db=root.__getBetaDB?.();
   if(!Array.isArray(db?.armor)||typeof root.armorBonusSkillObjects!=='function'||typeof root.bonusSkillObjects!=='function'||typeof root.groupSetData!=='function'||armor?.status!=='ARMOR_BASE_ONLY'||!Array.isArray(armor.rows)||armor.rows.length!==5||!Array.isArray(armor.missing)||armor.missing.length)return false;
   let count=0,total=0;
   for(const slot of slots){const rows=armor.rows.filter(x=>x.slot===slot),r=rows[0];if(rows.length!==1||typeof r.equipped!=='boolean')return false;if(!r.equipped){if(r.id!=null||r.value!==0)return false;continue;}
    const records=db.armor.filter(a=>a.id===r.id),a=records[0];if(records.length!==1||a.kind!==slot||r.sourceUrl!=='https://wilds.mhdb.io/ja/armor/'+a.id||!Number.isFinite(r.value)||r.value!==a.resistances?.thunder)return false;
    total+=r.value;const own=root.armorBonusSkillObjects(a,'series'),fallback=root.bonusSkillObjects(root.groupSetData(a)||a.armorSet,'series');if([...own,...fallback].some(x=>x.id===173&&x.name==='オメガレゾナンス'))count++;
   }
   if(e.count!==count||armor.armorBase!==total)return false;
   if(!Array.isArray(self?.pending)||self.pending.length||!Array.isArray(self.ids)||self.ids.filter(id=>id===173).length!==1||typeof root.MHWAdoptedSelfStatePlan!=='function')return false;
   const resolved=root.MHWAdoptedSelfStatePlan(stats,Object.fromEntries(skills),conditions);
   if(resolved.pending.length)return false;
   const row={skillId:173,skill:'オメガレゾナンス',attackAdd:0,affinityAdd:0,elementAdd:0,source:'https://kuroyonhon.com/mhwilds/program/skill.php',status:'OWNER_APPROVED_PROVISIONAL',scope:'EXPLICIT_SELF_STATE;WEAPON_ELEMENT_ONLY;NO_TIME_INFERENCE'};
   if(!['normal','maximum'].every(ch=>glOrdinaryEqual(self[ch]?.filter(x=>x.skillId===173),[row])&&glOrdinaryEqual(resolved[ch]?.filter(x=>x.skillId===173),[row])))return false;
   const expected={skill:e.name,parent:'オメガレゾナンス',skillId:173,attackAdd:0,attackMultiplier:1,bonusSource:true,appliesToNormal:true,condition:'EXPLICIT_SELF_STATE',numericOrigin:'OWNER_APPROVED_PROVISIONAL'};
   return [plan.applied,group?.applied].every(rows=>Array.isArray(rows)&&glOrdinaryEqual(rows.filter(x=>x.skillId===173||['オメガレゾナンス','レゾナンスⅠ','レゾナンスⅡ'].includes(x.skill)||x.parent==='オメガレゾナンス'),[expected]));
  })();
  const glOrdinaryResolved=weapon.kind==='gunlance'&&conditions.standardEvaluation===true&&conditions.mounted===false&&weapon.shell==='normal'&&weapon.shellLevel===2&&weapon.phial==null&&weapon.artiaShellEvidence==null&&weapon.specials.length===0&&
   (allSkills.some(x=>[86,129].includes(Number(x.skillId)))||stats.activeBonusEffects?.some(x=>x.bonusSkillId===173))&&glChargeState(gunlanceState)&&glChargeState(conditions.gunlanceState)&&glOrdinaryEqual(gunlanceState,conditions.gunlanceState)&&
   [conditions,stats,resolvedConditionPlan?.normal,resolvedConditionPlan?.maximum].every(glOrdinaryNoAlternate)&&
   glOrdinaryBonus(stats.activeBonusEffects)&&[resolvedConditionPlan?.normal,resolvedConditionPlan?.maximum].every(x=>Array.isArray(x?.activeBonusEffects)&&x.activeBonusEffects.length===0)&&[stats,resolvedConditionPlan?.normal,resolvedConditionPlan?.maximum].every(x=>knownNoElement(x)&&zeroElementComponents(x.elementComponents))&&zeroElementComponents(resolvedConditionPlan?.maximumElementComponents,true)&&
   glOrdinaryOmegaInactive&&!attributeConversionLevel&&!resistanceConversionLevel&&!waterEntries.length&&!allSkills.some(x=>Number(x.skillId)===133)&&
   noAddedElement(resolvedConditionPlan?.applied)&&noAddedElement(resolvedConditionPlan?.groupPlan?.applied)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.normal)&&noAddedElement(resolvedConditionPlan?.selfStatePlan?.maximum)&&
   glOrdinaryEqual(resolvedTechniqueIds,glTargetIds)&&glChargeModelValid()&&glOrdinaryRawValid('GL_SHELL_NORMAL_MEDIUM',techniqueDb.get('gunlance','GL_SHELL_NORMAL_MEDIUM'))&&glOrdinaryRawValid('GL_SHELL_NORMAL_MEDIUM',root.TechniqueDBEngine?.get?.('gunlance','GL_SHELL_NORMAL_MEDIUM'))&&resolvedTechniqueIds.every(glOrdinaryRecordValid);
  const glOrdinaryAirborne=glOrdinaryResolved&&glOrdinarySkill(86,'飛燕',1),glOrdinaryPartbreaker=glOrdinaryResolved&&glOrdinarySkill(129,'破壊王',3);
  const glOrdinaryActive=glOrdinaryAirborne||glOrdinaryPartbreaker||(glOrdinaryResolved&&glOrdinaryOmegaInactive&&activeBonusEffects.length===1);
  const glOrdinaryComponentValid=({component:c,event,state,build,effects})=>{
   const id=event.techniqueId,t=techniques[id],p=c.parameters,i=p?.hitIndex,ordinal=glTargetIds.indexOf(id),source=t?.evidenceRefs?.[0];
   if(ordinal<0||!Number.isInteger(i)||!glChargeModelValid()||!glTargetIds.every(glOrdinaryRecordValid)||!glOrdinaryRawValid('GL_SHELL_NORMAL_MEDIUM',techniqueDb.get('gunlance','GL_SHELL_NORMAL_MEDIUM'))||!glOrdinaryRawValid('GL_SHELL_NORMAL_MEDIUM',root.TechniqueDBEngine?.get?.('gunlance','GL_SHELL_NORMAL_MEDIUM'))||![event,build,build.equipment].every(glOrdinaryNoAlternate)||build.element!==0||build.elementType!=='none'||!zeroElementComponents(build.equipment?.elementComponents)||!Array.isArray(effects)||effects.some(e=>(e.target==='element'||e.target==='all')&&e.stage==='element'&&!(e.operation==='multiply'&&Number.isFinite(e.amount)&&e.amount>=0)&&!(e.operation==='add'&&e.amount===0)))return false;
   const body=(kind,h,j)=>({id:id+':'+kind+':'+j,kind,unit:kind==='physical'?'MV':'ELEMENT_MODIFIER',source,coefficient:kind==='physical'?h.mv:h.elementModifier,parameters:{...(kind==='physical'?{partModifier:null,partModifierStatus:'UNRESOLVED',partModifierSource:source,shieldBoostAxeBody:false}:{elementModifier:h.elementModifier,elementSource:source}),...(kind==='physical'?{elementModifier:h.elementModifier}:{}),damageType:'slash',hitIndex:j,glComponent:h.glComponent??null,glSharpnessOverride:h.glComponent?{value:1,source:glTargetContext.rules.source}:null,excludedEffectIds:[],saHitMode:null,resourceContract:null,stateRequirement:null,damageStateTransition:null,damageStatsState:null,adoption:null}});
   let expected,step,rounds;
   if(c.kind==='shelling'){
    if(ordinal<2||![0,1].includes(i))return false;
    expected=[{id:id+':shelling:'+i,kind:'shelling',unit:'SHELLING',source:glTargetContext.rules.source,coefficient:1,parameters:{hitIndex:i,effectTargets:['physical'],effectStages:['attack'],glTarget:{component:i===0?'FULL_BURST':'FINAL_EXPLOSION',model:t.glModel},sourceTechniqueId:id}}];step=i===0?2:t.hits.length+3;rounds=i===0?6:0;
   }else{
    const h=t?.hits?.[i];if(!h||!['physical','element'].includes(c.kind))return false;
    expected=['physical','element'].map(k=>body(k,h,i));step=ordinal<2?0:i===0?1:i+3;rounds=ordinal<2||i===0?6:0;
   }
   return glOrdinaryEqual(c,expected.find(x=>x.id===c.id))&&glOrdinaryEqual(event,{type:'hit',components:expected,id:ordinal+':'+step,techniqueId:id,revision:'2'})&&glOrdinaryEqual(state,{gunlance:{loadedRounds:rounds,stakeLoaded:true}});
  };
  const glOrdinaryResultValid=r=>{
   if(r?.metrics?.comboTotalDamage?.status!=='available')return true;
   const steps=['0:0','1:0',...Array.from({length:16},(_,i)=>'2:'+i),...Array.from({length:22},(_,i)=>'3:'+i)];
   const componentIds=glTargetIds.flatMap((id,j)=>j<2?[id+':physical:0',id+':element:0']:[id+':physical:0',id+':element:0',id+':shelling:0',...techniques[id].hits.slice(1).flatMap((_,i)=>[id+':physical:'+(i+1),id+':element:'+(i+1)]),id+':shelling:1']);
   return r.execution.status==='complete'&&glOrdinaryEqual(r.execution.expected,steps)&&glOrdinaryEqual(r.execution.executed,steps)&&glOrdinaryEqual(r.finalState,{gunlance:{loadedRounds:0,stakeLoaded:false}})&&glOrdinaryEqual(r.components.map(c=>c.id),componentIds)&&r.components.every(c=>{
    if(c.status!=='available'||!Number.isFinite(c.value))return false;
    if(c.id.includes(':element:'))return c.value===0;
    if(!c.id.includes(':shelling:'))return true;
    const index=Number(c.id.split(':').pop()),d=c.details;return d?.component===(index===0?'FULL_BURST':'FINAL_EXPLOSION')&&d.count===(index===0?6:1)&&d.trace?.length===d.count&&Number.isFinite(d.element)&&d.element>=0&&d.source===glTargetContext.rules.source;
   });
  };
  const partbreakerBodyIds={
   'sword-shield':['SNS_DOWNWARD_SLASH','SNS_HORIZONTAL_SLASH','SNS_RETURN_SLASH'],
   hammer:['HAM_MIGHTY_CHARGE_UPPERCUT'],
   'switch-axe':['SA_SWORD_RIGHT_RISING','SA_SWORD_LEFT_RISING']
  };
  const partbreakerIdentity=x=>Number(x.skillId)===129||x.name==='破壊王';
  const partbreakerEntries=allSkills.filter(partbreakerIdentity);
  const partbreakerNoAlternateState=x=>x?.damageStatsState==null&&x?.stateStatsByState==null;
  const partbreakerBodyResolved=!!partbreakerBodyIds[weapon.kind]&&partbreakerEntries.length>0&&
   partbreakerEntries.every(x=>Number(x.skillId)===129&&x.name==='破壊王'&&Number.isInteger(x.level)&&x.level>=1&&x.level<=3)&&new Set(partbreakerEntries.map(x=>x.level)).size===1&&rawSkills.filter(partbreakerIdentity).length<=1&&buildSkills.filter(partbreakerIdentity).length<=1&&
   !hasShelling&&!hasReference&&!hhModel&&[conditions,conditions.switchAxeState,switchAxeState].every(partbreakerNoAlternateState)&&conditions.mounted!==true&&conditions.dismountAttack!==true&&conditions.sneakAttack!==true&&
   (weapon.kind!=='switch-axe'||switchAxeState?.awakened===false)&&
   resolvedTechniqueIds.every(id=>{
    const t=techniques[id];
    return (ADOPTED_NO_WOUND_EVENT_IDS.has(id)||partbreakerBodyIds[weapon.kind].includes(id))&&t?.techniqueId===id&&t.weaponType===techniqueKind&&partbreakerNoAlternateState(t)&&t.damageStateTransition==null&&t.hpOnlyProvisional==null&&!t.referenceKind&&!t.phialReference&&!t.saAwakened&&!t.hhModel&&
     (t.specialComponents===undefined||(Array.isArray(t.specialComponents)&&t.specialComponents.length===0))&&Array.isArray(t.hits)&&t.hits.length>0&&t.hits.every(h=>partbreakerNoAlternateState(h)&&!h.componentSource&&(h.component===undefined||h.component==='BODY')&&Number.isFinite(h.mv)&&h.mv>=0&&Number.isFinite(h.elementModifier)&&h.elementModifier>=0);
   });
  const partbreakerHEntries=[...allSkills,...rawSkills,...buildSkills].filter(partbreakerIdentity);
  const partbreakerHResolved=typeof cbHOrdinaryResolved!=='undefined'&&cbHOrdinaryResolved&&partbreakerHEntries.length>0&&partbreakerHEntries.every(x=>Number(x.skillId)===129&&x.name==='破壊王'&&Number.isInteger(x.level)&&x.level>=1&&x.level<=3)&&new Set(partbreakerHEntries.map(x=>x.level)).size===1&&rawSkills.filter(partbreakerIdentity).length<=1&&buildSkills.filter(partbreakerIdentity).length<=1;
  if(allSkills.some(x=>Number(x.skillId)===129)&&resolvedTechniqueIds.some(id=>!ADOPTED_NO_WOUND_EVENT_IDS.has(id))&&!partbreakerBodyResolved&&!partbreakerHResolved&&!(typeof glOrdinaryPartbreaker!=='undefined'&&glOrdinaryPartbreaker))return fail('REAL_SLICE:PARTBREAKER_WOUND_EVENT_SCOPE_PENDING');
  if(cornpopperEntries.length){
   const knownBody=['GL_SLAM','GL_SWEEP'];
   if(resolvedTechniqueIds.some(id=>!knownBody.includes(id)&&!['reference:gl_NORMAL','reference:gl_CHARGED','reference:gl_FULL_BURST'].includes(id)))return fail('GL_SHELL:CORNPOPPER_TECHNIQUE_NOT_ADOPTED');
   if(resolvedTechniqueIds.includes('reference:gl_FULL_BURST')&&conditionPlan){const pending=[...(conditionPlan.pending||[]),'GL_SHELL:CORNPOPPER_ACTION_NOT_ADOPTED:FULL_BURST'];conditionPlan={...conditionPlan,pending};}
  }
  // Physical MV multiplication is algebraically the same raw-physical factor,
  // including attack flat, and occurs BEFORE canonical Formula rounding. Never use post-damage here.
  const lanceCounterEffects=[];
  if(weapon.kind==='lance'&&resolvedTechniqueIds.includes('LAN_COUNTER_DOUBLE_THRUST')){
   const id='LAN_COUNTER_DOUBLE_THRUST',rule=techniqueDb.get('lance',id).counterReference;
   for(const [i] of techniques[id].hits.entries())lanceCounterEffects.push({id:'lance-charge3-counter:'+i,target:'physical',stage:rule.stage,unit:'dimensionless',operation:'multiply',amount:rule.physicalMultiplier,order:90,componentIds:[id+':physical:'+i],source:rule.source,status:rule.status,condition:{type:'always'}});
  }
  const chargeStrikeEntries=allSkills.filter(x=>Number(x.skillId)===83&&!nonTargetWeaponSkill(x)),chargeStrikeEffects=[];
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
   // memo/5.php separates this ordinary slash chain from charged/jump actions;
   // memo/27.php's Airborne motion list does not include these three records.
   // Source-supported provisional nonapplication, not a live-game observation.
   // Keep the shared hit map unchanged: a known ID alone cannot approve a
   // generated, reference, airborne or alternate-state variant of the record.
   const airborneBodyIds=['SNS_DOWNWARD_SLASH','SNS_HORIZONTAL_SLASH','SNS_RETURN_SLASH'];
   const airborneBodyIdentity=x=>Number(x.skillId)===86||x.name==='飛燕';
   const airborneBodyEntries=[...allSkills,...rawSkills,...buildSkills].filter(airborneBodyIdentity);
   const airborneOrdinaryState=x=>x?.damageStatsState==null&&x?.stateStatsByState==null&&x?.damageStateTransition==null&&x?.jumpAttack!==true&&x?.jumping!==true&&x?.airborne!==true&&x?.mounted!==true&&x?.dismountAttack!==true&&x?.sneakAttack!==true;
   const airborneEmptyComponents=x=>x===undefined||(Array.isArray(x)&&x.length===0);
   const airborneNoRequirement=x=>x==null||(typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===0);
   const airborneBodyResolved=weapon.kind==='sword-shield'&&airborneBodyEntries.length>0&&
    airborneBodyEntries.every(x=>Number(x.skillId)===86&&x.name==='飛燕'&&x.level===1)&&rawSkills.filter(airborneBodyIdentity).length<=1&&buildSkills.filter(airborneBodyIdentity).length<=1&&
    !hasShelling&&!hasReference&&!hhModel&&airborneOrdinaryState(conditions)&&
    resolvedTechniqueIds.every(id=>{
     const t=techniques[id];
     return (airborneBodyIds.includes(id)||id==='SNS_SIDE_SLASH')&&t?.techniqueId===id&&t.weaponType===techniqueKind&&airborneOrdinaryState(t)&&airborneNoRequirement(t.stateRequirement)&&airborneNoRequirement(techniqueDb.get(techniqueKind,id)?.stateRequirement)&&t.hpOnlyProvisional==null&&!t.referenceKind&&!t.phialReference&&!t.saAwakened&&!t.hhModel&&!t.glModel&&t.specialSourceValues==null&&
      airborneEmptyComponents(t.specialComponents)&&airborneEmptyComponents(t.excludedComponents)&&Array.isArray(t.hits)&&t.hits.length===1&&t.hits.every(h=>airborneOrdinaryState(h)&&!h.componentSource&&(h.component===undefined||h.component==='BODY')&&h.damageType==='slash'&&Number.isFinite(h.mv)&&h.mv>=0&&Number.isFinite(h.elementModifier)&&h.elementModifier>=0);
    });
   for(const id of resolvedTechniqueIds){
    if(!Object.hasOwn(rule.hitIndices,id)){
     const airborneHResolved=cbHOrdinaryResolved&&airborneBodyEntries.every(x=>Number(x.skillId)===86&&x.name==='飛燕'&&x.level===1)&&rawSkills.filter(airborneBodyIdentity).length<=1&&buildSkills.filter(airborneBodyIdentity).length<=1;
     if((airborneBodyResolved&&airborneBodyIds.includes(id))||(airborneHResolved&&hRule.prefixIds.includes(id))||(glOrdinaryAirborne&&glTargetIds.slice(2).includes(id)))continue;
     return fail('REAL_SLICE:AIRBORNE_HIT_SCOPE_PENDING:'+id);
    }
    for(const i of rule.hitIndices[id]){
     if(!techniques[id]?.hits?.[i])return fail('REAL_SLICE:AIRBORNE_HIT_MAPPING_INVALID:'+id);
     airborneEffects.push({id:'airborne:'+id+':'+i,target:'physical',stage:rule.stage,unit:'dimensionless',operation:'multiply',amount:rule.multiplier,order:12,componentIds:[id+':physical:'+i],source:rule.source,status:rule.status,condition:{type:'always'}});
    }
   }
  }
  const cbMindRuleFor=t=>[root.MHCbMorphMindsEyeRule,root.MHCbEd1MindsEyeRule,root.MHCbEd2MindsEyeRule,root.MHCbFollowupAedMindsEyeRule,root.MHCbAedMindsEyeRule].find(r=>r?.techniqueId===t?.techniqueId);
  // KAN-47 comment11114: only the exact adopted R/H order extends the single-Hit contract.
  const cbMindAdoptedSequence=resolvedTechniqueIds.length===1||['RELEASE_ROUTE','AED_ROUTE'].some(key=>{
   const ids=root.ChargeBladeEngine?.profiles?.[key]?.techniqueIds;
   return Array.isArray(ids)&&ids.length===resolvedTechniqueIds.length&&ids.every((id,i)=>id===resolvedTechniqueIds[i]);
  });
  const cbMindEligible=t=>{
   const cbMindRule=cbMindRuleFor(t);
   if(cbMindRule?.status!=='OWNER_APPROVED_PROVISIONAL'||weapon.kind!=='charge-blade'||!cbMindAdoptedSequence||t?.techniqueId!==cbMindRule.techniqueId||chargeBladeState?.axeBoosted!==true)return false;
   const extra=root.ChargeBladeEngine?.techniques?.[t.techniqueId]?.axeBoostHits,body=techniqueDb.get('charge-blade',t.techniqueId)?.hits;
   return !!(extra&&body&&t.hits.length===body.length+extra.count&&t.hits.slice(body.length).every(h=>h.componentSource==='index.html:CHARGE_BLADE_TECHNIQUES.'+t.techniqueId+'.axeBoostHits'&&h.mv===extra.mv&&h.elementModifier===extra.elementModifier&&h.shieldBoostAxeBody===false));
  };
  const contextAttackEntries=allSkills.filter(x=>x.skillKey==='contextAttack'&&!nonTargetWeaponSkill(x)),contextAttackEffects=[];
  if(contextAttackEntries.length){

   const rules=root.MHContextAttackSkillRules;
   for(const entry of contextAttackEntries){
    if(!Number.isInteger(entry.level)||entry.level<1||entry.level>3)return fail('REAL_SLICE:CONTEXT_ATTACK_LEVEL_INVALID');
    const rule=Number(entry.skillId)===136?rules.mindsEye:rules.bludgeoner;
    for(const id of resolvedTechniqueIds)for(const [hitIndex,hit] of techniques[id].hits.entries()){
     if(techniques[id].referenceKind||(hit.componentSource&&!cbMindEligible(techniques[id])))continue;
     const damageType=hit.componentSource?(cbMindEligible(techniques[id])?cbMindRuleFor(techniques[id]).damageType:null):ordinaryHitDamageType(id,hit);
     const originalHitzone=(part.originalMultipliers??(part.wounded===true?null:part.multipliers))?.[damageType];
     if(Number(entry.skillId)===136&&!Number.isFinite(originalHitzone))return fail('REAL_SLICE:ORIGINAL_HITZONE_UNRESOLVED');
     const active=Number(entry.skillId)===136?originalHitzone*100<=rule.originalHitzoneMaximum:rule.colorsByLevel[entry.level].includes(maxSharpness);
     if(active)contextAttackEffects.push({id:'context-attack:'+entry.skillId+':'+id+':'+hitIndex,target:'physical',stage:'attack',unit:'dimensionless',operation:'multiply',amount:rule.multipliers[entry.level],order:12,componentIds:[id+':physical:'+hitIndex],source:hit.componentSource?cbMindRuleFor(techniques[id]).source:rules.source,status:hit.componentSource?cbMindRuleFor(techniques[id]).status:rules.status,condition:{type:'always'},...(Number(entry.skillId)===136?{originalHitzone:{value:originalHitzone*100,damageType,source:target.monster==='training-room'&&target.part==='training-front'?'trainingRoomMonster:UNWOUNDED_ORIGINAL':targetData.sourceRef+':UNWOUNDED_ORIGINAL'}}:{}),sharpness:maxSharpness});
    }
   }
  }
  const saMindRule=root.MHSaFollowupMindsEyeRule;
  const saMindEligible=t=>!!(saMindRule?.status==='OWNER_APPROVED_PROVISIONAL'&&saMindRule.techniqueIds.includes(t?.techniqueId)&&t.saAwakened?.followupTechniqueId===saMindRule.followupTechniqueId);
  for(const entry of contextAttackEntries.filter(x=>Number(x.skillId)===136))for(const id of resolvedTechniqueIds){
   const t=techniques[id];if(!saMindEligible(t))continue;
   const original=(part.originalMultipliers??(part.wounded===true?null:part.multipliers))?.[saMindRule.damageType];
   if(!Number.isFinite(original))return fail('REAL_SLICE:ORIGINAL_HITZONE_UNRESOLVED');
   const rule=root.MHContextAttackSkillRules.mindsEye;
   if(original*100>rule.originalHitzoneMaximum)continue;
   for(const [i,mode] of (t.modeContract?.hitModes||t.hits.map(()=>t.stateRequirement?.mode)).entries())if(mode==='SWORD'){
    const index=t.hits.length+i;
    contextAttackEffects.push({id:'context-attack:136:sa-followup:'+id+':'+index,target:'physical',stage:'attack',unit:'dimensionless',operation:'multiply',amount:rule.multipliers[entry.level],order:12,componentIds:[id+':physical:'+index],source:saMindRule.source,status:saMindRule.status,condition:{type:'always'},originalHitzone:{value:original*100,damageType:saMindRule.damageType,source:'EXPLICIT_OR_UNWOUNDED_ORIGINAL'}});
   }
  }
  const hhMindRule=root.MHHornMindsEyeExclusion;
  const hhMindExcluded=(t,c)=>{
   const p=c.parameters,r=p?.hhRecord;
   return !!(hhModel&&hhMindRule?.status==='OWNER_APPROVED_PROVISIONAL'&&t?.hhModel?.id===hhMindRule.model&&p?.referenceKind==='hunting-horn-model-event'&&c.kind==='reference'&&hhMindRule.techniqueIds.includes(r?.techniqueId)&&JSON.stringify(t.hhModel.specialRecords[r.techniqueId])===JSON.stringify(r)&&r.sourceFormula?.status==='SOURCE_CONFIRMED'&&Number.isSafeInteger(p.hhCount)&&p.hhCount>0);
  };
  // Skill 94 names Pierce Ammo / Dragon Piercer / Thousand Dragons, not these
  // exact ordinary shots. Source-backed nonapplication; no new damage coefficient
  // or live-game verification: MHDB skill94; kuro yonhon program/skill.php.
  const pierceIdentity=x=>Number(x.skillId)===94||x.name==='貫通弾・竜の矢強化';
  const pierceEntries=allSkills.filter(pierceIdentity);
  const pierceNoAlternateState=x=>x?.damageStatsState==null&&x?.stateStatsByState==null&&x?.damageStateTransition==null;
  const pierceOrdinaryRecord=id=>{
   const t=techniqueDb.get(techniqueKind,id);
   return !!t&&t.techniqueId===id&&t.weaponType===techniqueKind&&pierceNoAlternateState(t)&&t.referenceKind==null&&t.referenceInput==null&&t.componentSource==null&&t.hpOnlyProvisional==null&&t.phialReference==null&&t.saAwakened==null&&t.hhModel==null&&
    (t.specialComponents===undefined||(Array.isArray(t.specialComponents)&&t.specialComponents.length===0))&&(t.stateRequirement===undefined||(t.stateRequirement&&typeof t.stateRequirement==='object'&&!Array.isArray(t.stateRequirement)&&Object.keys(t.stateRequirement).length===0));
  };
  const pierceBowIds=['BOW_SHOT_3','BOW_POWER_SHOT_3','BOW_POWER_VOLLEY_3'];
  const pierceBowNonTarget=weapon.kind==='bow'&&resolvedTechniqueIds.length===pierceBowIds.length&&resolvedTechniqueIds.every((id,i)=>id===pierceBowIds[i])&&
   bowState?.chargeLevel===3&&['POWER','CLOSE_RANGE'].includes(bowState.coating)&&bowState.range==='CRITICAL'&&bowState.startShot===1&&(bowState.guided==null||bowState.guided===false)&&[bowState,conditions.bowState].every(pierceNoAlternateState)&&
   resolvedTechniqueIds.every(id=>{const t=techniqueDb.get(techniqueKind,id);return pierceOrdinaryRecord(id)&&t.sourceFormula?.scope==='FIXED_BOW_STANDARD_SOURCE_REFERENCE'&&Array.isArray(t.hits)&&t.hits.length>0&&t.hits.every(h=>h.component==='ARROW'&&h.componentSource==null&&pierceNoAlternateState(h)&&Number.isFinite(h.mv)&&h.mv>=0&&Number.isFinite(h.elementModifier)&&h.elementModifier>=0);});
  const pierceAmmoState=weapon.kind==='light-bowgun'?lightBowgunState:weapon.kind==='heavy-bowgun'?hbgState:null;
  const pierceAmmoId=weapon.kind==='light-bowgun'?'LBG_ELEMENT_FIRST_HIT_REFERENCE':weapon.kind==='heavy-bowgun'?'HBG_ELEMENT_FIRST_HIT_REFERENCE':null;
  const pierceElementNonTarget=!!pierceAmmoId&&resolvedTechniqueIds.length===1&&resolvedTechniqueIds[0]===pierceAmmoId&&pierceOrdinaryRecord(pierceAmmoId)&&
   pierceAmmoState?.normalModeLevel===0&&[1,2].includes(pierceAmmoState.ammoLevel)&&pierceAmmoState.range==='CRITICAL'&&pierceAmmoState.contactPolicy==='EXPLICIT_CONTACTS'&&pierceAmmoState.contactTargetPolicy==='CURRENT_TARGET'&&pierceAmmoState.contactCount===1&&
   [pierceAmmoState,conditions[weapon.kind==='light-bowgun'?'lightBowgunState':'hbgState']].every(pierceNoAlternateState)&&
   (weapon.kind==='light-bowgun'?lightBowgunState.shotMode==='NORMAL'&&['FIRE','WATER','THUNDER','ICE'].includes(lightBowgunState.ammoType):hbgState.ammoType==='NORMAL'&&['fire','water','thunder','ice'].includes(hbgState.elementType))&&
   (()=>{const t=techniqueDb.get(techniqueKind,pierceAmmoId);return t.recordRole==='SPECIAL_REFERENCE'&&t.specialSourceValues?.status==='SOURCE_CONFIRMED'&&t.specialSourceValues.scope==='FIRST_HIT_ONLY_NOT_WHOLE_SHOT'&&Array.isArray(t.hits)&&t.hits.length===0;})();
  const pierceNonTargetResolved=weapon.skills.filter(x=>Number(x?.skill?.id??x?.id)===94||(x?.skill?.name||x?.name)==='貫通弾・竜の矢強化').every(x=>Number(x?.skill?.id??x?.id)===94&&(x?.skill?.name||x?.name)==='貫通弾・竜の矢強化'&&x.level===1)&&pierceEntries.length===1&&pierceEntries.every(x=>Number(x.skillId)===94&&x.name==='貫通弾・竜の矢強化'&&x.level===1)&&rawSkills.filter(pierceIdentity).length<=1&&buildSkills.filter(pierceIdentity).length<=1&&
   [conditions,stats,stats.conditionalConditionPlan?.normal,stats.conditionalConditionPlan?.maximum].every(pierceNoAlternateState)&&['mounted','dismountAttack','sneakAttack'].every(key=>conditions[key]==null||conditions[key]===false)&&(pierceBowNonTarget||pierceElementNonTarget);
  const equipment={...weapon,waterConversionAdd,waterResistanceInput:waterInput||null,elementCapRule:root.MHWElementCapRule,...(contextAttackEntries.length?{originalPhysicalHitzones:{...(part.originalMultipliers??part.multipliers)},originalHitzoneSource:part.originalMultipliers?'EXPLICIT_PRE_WOUND_HITZONES':target.monster==='training-room'?'TRAINING_UNWOUNDED':targetData.sourceRef+':UNWOUNDED_ORIGINAL',contextAttackScope:'ADOPTED_MELEE_BODY_ONLY'}:{}),thunderResistanceInput:resistanceInput||null,armorThunderResistanceInput:stats.armorThunderResistanceInput||null,apiId:weapon.id,sharpnessResolution,maxSharpness,maxSharpnessEvidenceRef:normalArtiaWhite?sharpnessPremise.source:provenance.sourceUrl,elementType,rapidMorphLevel,criticalBoostLevel,criticalElementLevel,criticalElementMultiplier:root.MHResolveCriticalElement(weapon.kind,criticalElementLevel),attributeConversionLevel,attributeConversionState:attributeState,resistanceConversionLevel,thunderResistance,resistanceConversionCoefficient,resistanceConversionAdd,chargeBladeState:normalizedChargeBladeState,activeBonusEffects,attackComponents:stats.attackComponents?{weaponBase:Number(stats.attackComponents.weaponBase),normalMultiplier:1,normalFlat:0}:null,elementComponents:{weaponBase:Number(elementRawValue),normalMultiplier:Number(elementRule?.mult??1),normalFlat:Number(elementRule?.add??0)},gsChargeMasterLevel:gsChargeActive?referenceSkills.chargeMaster:0,elementCalculatedValue:elementValue,maximumAffinity,normalAffinity:Number(stats.affinity),maximumElement:Number.isFinite(maximumElement)?maximumElement:null,conditionalAttackMultiplier:Number(conditionPlan?.attackComponents?.conditionalMultiplier??1),groupAttackMultiplier:Number(conditionPlan?.attackComponents?.groupMultiplier??1),conditionalAttackFlat:Number(conditionPlan?.attackComponents?.conditionalFlat??0),conditionalPlanStatus:conditionPlan?.status||'REFERENCE_ONLY',conditionalPending:Array.isArray(conditionPlan?.pending)?conditionPlan.pending:[],elementEvidence:elementSpecial?{sourceUrl:provenance.sourceUrl,raw:elementSpecial.damage.raw,display:elementRawValue,kind:'element',...(saDragonEligible?{scope:'SA_SWORD_PHIAL_ONLY',sourceField:'phial.damage.display',source:'https://kuroyonhon.com/mhwilds/memo/11.php'}:{})}:statusState?{sourceUrl:provenance.sourceUrl,kind:'status',statusType:statusState.elementType,display:statusState.element,hpElementContribution:0,scope:'STATUS_BUILDUP_EXCLUDED_FROM_HP',evidenceRef:'element-state.js:hpElement;spec/03_TECHNIQUE_AND_DAMAGE.md'}:{sourceUrl:provenance.sourceUrl,confirmedNone:true},provenance};
  const source={capture:pinned=>({versions:pinned,equipment,effects:{},techniques})};
  const bowSequenceCache=new Map();
  const pipeline=root.HimmelRealOneHitPipeline({versions,source,techniqueId,techniqueIds:resolvedTechniqueIds,weaponType:techniqueKind,
   resolveComponentIssue:({component:c,event,state,build,effects})=>{if(typeof glOrdinaryActive!=='undefined'&&glOrdinaryActive&&!glOrdinaryComponentValid({component:c,event,state,build,effects}))return 'REAL_SLICE:GL_ORDINARY_COMPONENT_CONTRACT_INVALID';if(hhThunderZeroResolved&&!hhChargeComponentValid({component:c,event,build,effects}))return 'REAL_SLICE:HH_THUNDER_COMPONENT_CONTRACT_INVALID';if(hhChargeNoElementResolved&&!hhChargeComponentValid({component:c,event,build,effects}))return 'REAL_SLICE:HH_CHARGE_COMPONENT_CONTRACT_INVALID';if(!contextAttackEntries.length)return null;const t=techniques[event.techniqueId],special=!['physical','element'].includes(c.kind)||c.parameters?.saFollowup||t?.hits?.[c.parameters?.hitIndex]?.componentSource;if(!special)return null;const activeEntries=contextAttackEntries.filter(x=>Number(x.skillId)===136||root.MHContextAttackSkillRules.bludgeoner.colorsByLevel[x.level].includes(maxSharpness));if(!activeEntries.length)return null;const onlyMindsEye=activeEntries.every(x=>Number(x.skillId)===136);if(onlyMindsEye&&['phial','shelling'].includes(c.kind))return null;if(onlyMindsEye&&hhMindExcluded(t,c))return null;if(onlyMindsEye&&['physical','element'].includes(c.kind)&&cbMindEligible(t))return null;if(onlyMindsEye&&c.parameters?.saFollowup&&['physical','element'].includes(c.kind)&&saMindEligible(t))return null;if(onlyMindsEye&&t?.referenceKind==='charge-blade-saed'&&root.MHSaedMindsEyeRule.techniqueIds.includes(event.techniqueId))return null;/* Source-confirmed, not live verified: https://a-to-monhan.com/2025/03/31/wilds-donkitukai/ . Normal GL shell only; body effects remain component-scoped and CB phial guard stays. */if(c.kind==='shelling'&&weapon.kind==='gunlance'&&c.parameters?.shellingAction==='NORMAL'&&activeEntries.every(x=>[85,136].includes(Number(x.skillId))))return null;return 'REAL_SLICE:CONTEXT_ATTACK_COMPONENT_SCOPE_PENDING:'+c.id;},
   resolveBuild:(_raw,snapshot)=>({weaponType:techniqueKind,dbVersion:versions.equipment,source:'MHDB_API_CURRENT_SELECTION',equipment:{...snapshot,ids:[`api_id:${snapshot.apiId}`,`game_id:${snapshot.gameId}`],conditionalAttackMultiplier:Number(snapshot.conditionalAttackMultiplier??1),groupAttackMultiplier:Number(snapshot.groupAttackMultiplier??1),conditionalAttackFlat:Number(snapshot.conditionalAttackFlat??0),conditionalPlanStatus:snapshot.conditionalPlanStatus||'REFERENCE_ONLY',conditionalPending:Array.isArray(snapshot.conditionalPending)?snapshot.conditionalPending:[],trueAttack:{status:'known',value:snapshot.damage.raw},displayElement:{status:'known',value:snapshot.elementEvidence.confirmedNone?0:snapshot.elementCalculatedValue},baseAffinity:{status:'known',value:snapshot.affinity},elementType:snapshot.elementType,sourceGameVersion:snapshot.provenance.sourceGameVersion},skills:{entries:allSkills},issues:[{code:'MHDB_SOURCE',apiId:snapshot.apiId,gameId:snapshot.gameId,sourceEndpoint:snapshot.provenance.sourceUrl,apiVersion:snapshot.provenance.apiVersion,retrievedAt:snapshot.provenance.retrievedAt,sourceGameVersion:snapshot.provenance.sourceGameVersion}]}),
   resolveEffects:(build,conditions,channel)=>{if(channel==='maximum'&&conversionMaximumIssue)throw Error(conversionMaximumIssue);if(!blackEclipse&&frenzyAffinity.active&&frenzyAffinity[channel==='normal'?'normalAdd':'maximumAdd']===null)throw Error('FRENZY_STATE_REQUIRED');if(channel==='maximum'&&absorptionConversionPlan?.status==='UNRESOLVED')throw Error(absorptionConversionPlan.reason);if(attributeConversionLevel&&typeof attributeState?.[channel]!=='boolean')throw Error('REAL_SLICE:ATTRIBUTE_CONVERSION_STATE_REQUIRED');if(attributeConversionLevel&&attributeState[channel]===true&&attributeScopeIssue)throw Error(attributeScopeIssue);const entries=build.skills.entries||[],effects=[...lanceCounterEffects,...chargeStrikeEffects,...airborneEffects,...contextAttackEffects.filter(e=>!(bladescaleEligible&&channel==='maximum'&&e.id.startsWith('context-attack:85:'))),...wexEffects,...explicitAffinityEffects(channel)].map(x=>({...x})),attack=entries.filter(x=>x.skillKey==='attack'),affinity=entries.filter(x=>x.skillKey==='affinity'),criticalBoost=entries.filter(x=>x.skillKey==='criticalBoost'),elementEntries=entries.filter(x=>['fire','water','thunder','ice','dragon'].includes(x.skillKey));if(channel==='normal'&&conditionPlan?.selectedHp){
 if(conditionPlan.selectedHpNormalMultiplier!==1)effects.push({id:'selected-hp-heroics-normal',target:'physical',stage:'attack',unit:'dimensionless',operation:'multiply',amount:conditionPlan.selectedHpNormalMultiplier,order:30,source:'USER_SELECTED_HP_ID87',condition:{type:'always'}});
 if(conditionPlan.selectedHpNormalFlat)effects.push({id:'selected-hp-peak-normal',target:'physical',stage:'attack',unit:'true-attack',operation:'add',amount:conditionPlan.selectedHpNormalFlat,order:50,source:'USER_SELECTED_HP_ID154',condition:{type:'always'}});
}
if(channel==='normal')for(const item of conditionPlan?.applied||[])if(item.skill==='研鑽'&&item.appliesToNormal)effects.push({id:'everlasting-normal',target:'physical',stage:'attack',unit:'true-attack',operation:'add',amount:item.attackAdd,order:50,source:item.evidenceRef,condition:{type:'always'}});const selfPending=(conditionPlan?.selfStatePlan?.pending||[]).filter(x=>x.startsWith(channel+':')||(!x.startsWith('normal:')&&!x.startsWith('maximum:')));if(selfPending.length)throw Error(selfPending.join(' / '));for(const e of conditionPlan?.selfStatePlan?.[channel]||[]){
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
if(saAwakened)effects.push({id:saAwakened.elementEffectId,elementCapBaseScaling:true,target:'element',stage:'element',unit:'dimensionless',operation:'multiply',amount:saAwakened.explosionElementMultiplier[saStatusAwakened?saAwakened.statusPhialExtension.coefficientKey:saDragonEligible?saAwakened.dragonPhialExtension.coefficientKey:weapon.phial.kind],order:25,source:saAwakened.source,status:saAwakened.status,condition:{type:'always'}});
const powerPhial=root.MHWeaponEffectDB?.switchAxe?.powerPhialSword,elementPhial=root.MHWeaponEffectDB?.switchAxe?.powerElementPhialSword;if(build.weaponType==='switch-axe'){const phialKind=build.equipment?.phial?.kind;if(phialKind==='power'){if(!powerPhial)throw Error('REAL_SLICE:SA_POWER_PHIAL_DEFINITION_UNRESOLVED');effects.push({...powerPhial,condition:{type:'state-equals',path:['switchAxe','mode'],value:'SWORD'}});}else if(phialKind==='element'){if(!elementPhial)throw Error('REAL_SLICE:SA_POWER_ELEMENT_PHIAL_DEFINITION_UNRESOLVED');if(elementPhial.status!=='OWNER_APPROVED_PROVISIONAL')throw Error('REAL_SLICE:SA_POWER_ELEMENT_PHIAL_APPROVAL_PENDING');effects.push({...elementPhial,elementCapBaseScaling:true,condition:{type:'state-equals',path:['switchAxe','mode'],value:'SWORD'}});}else if(!saStatusBodyOnly&&!saStatusAwakened&&!saDragonEligible)throw Error('REAL_SLICE:SA_PHIAL_EFFECT_UNRESOLVED:'+String(phialKind||'missing')); }if(build.equipment.gsChargeMasterLevel>0){for(const id of gsCharge.techniqueIds)effects.push({id:'gs-charge-master:'+id,target:'element',stage:'element',unit:'dimensionless',operation:'multiply',amount:gsCharge.multipliers[build.equipment.gsChargeMasterLevel],order:25,source:gsCharge.source,status:gsCharge.status,sourceVersion:gsCharge.sourceVersion,liveGameVerification:gsCharge.liveGameVerification,condition:{type:'event-equals',key:'techniqueId',value:id}});}if(attack.length){if(!root.MHWAttackSkillResolver)throw Error('REAL_SLICE:ATTACK_RULE_UNAVAILABLE');const level=Math.max(...attack.map(x=>x.level)),rule=root.MHWAttackSkillResolver({攻撃:level});if(!Number.isFinite(Number(rule.flat))||!Number.isFinite(Number(rule.mult)))throw Error('REAL_SLICE:ATTACK_RULE_INVALID');effects.push({id:'attack-boost-multiply',target:'physical',stage:'attack',unit:'dimensionless',amount:Number(rule.mult),operation:'multiply',order:10,source:'index.html:calcAttackSkill',condition:{type:'always'}},{id:'attack-boost-flat',target:'physical',stage:'attack',unit:'true-attack',amount:Number(rule.flat),operation:'add',order:40,source:'index.html:calcAttackSkill',condition:{type:'always'}});}const punishingDraw=entries.find(x=>Number(x.skillId)===8);if(punishingDraw){if(!Number.isInteger(punishingDraw.level)||punishingDraw.level<1||punishingDraw.level>3)throw Error('REAL_SLICE:PUNISHING_DRAW_LEVEL_INVALID');const map=conditions.punishingDrawHits?.[channel];if(!map||typeof map!=='object'||Array.isArray(map)||Object.keys(map).some(id=>!resolvedTechniqueIds.includes(id)))throw Error('PUNISHING_DRAW_HIT_STATE_REQUIRED');for(const id of new Set(resolvedTechniqueIds)){const t=techniques[id],flags=map[id];if(!Array.isArray(flags)||flags.length!==(t.referenceKind?referenceDrawCount(id,t):t.hits.length)||flags.some(x=>typeof x!=='boolean'))throw Error('PUNISHING_DRAW_HIT_STATE_REQUIRED:'+id);for(const [i,on] of flags.entries())if(on){if(conditions.mounted===true||conditions.dismountAttack===true||conditions.sneakAttack===true)throw Error('PUNISHING_DRAW_TRIGGER_EXCLUDED');if(t.referenceKind){if(!['bow','heavy-bowgun','light-bowgun','heavy-bowgun-element','light-bowgun-element','charge-blade-saed'].includes(t.referenceKind))throw Error('PUNISHING_DRAW_REFERENCE_MAPPING_PENDING:'+id);continue;}effects.push({id:'punishing-draw-flat:'+id+':'+i,target:'physical',stage:'attack',unit:'true-attack',amount:[0,3,5,7][punishingDraw.level],operation:'add',order:40,componentIds:[id+':physical:'+i],source:'MACARONGAMEMO_DAMAGE_UP_2025-04-16;MACARONGAMEMO_SKILLS_LIST_2025-03-08',condition:{type:'always'}});}}}if(affinity.length){if(!root.MHWAffinitySkillResolver)throw Error('REAL_SLICE:AFFINITY_RULE_UNAVAILABLE');const level=Math.max(...affinity.map(x=>x.level)),amount=Number(root.MHWAffinitySkillResolver({'見切り':level}));if(!Number.isFinite(amount))throw Error('REAL_SLICE:AFFINITY_RULE_INVALID');if(amount)effects.push({id:'critical-eye-affinity',target:'physical',stage:'affinity',unit:'percent',amount,operation:'add',order:30,source:'index.html:calcAffinityBonus',condition:{type:'always'}},{id:'critical-eye-affinity-element',target:'element',stage:'affinity',unit:'percent',amount,operation:'add',order:30,source:'index.html:calcAffinityBonus',condition:{type:'always'}});}if(criticalBoost.length){const level=Math.max(...criticalBoost.map(x=>x.level));if(!Number.isInteger(level)||level<1||level>5)throw Error('REAL_SLICE:CRITICAL_BOOST_LEVEL_UNSUPPORTED');}if(Number(build.equipment.groupAttackMultiplier??1)!==1)effects.push({id:'set-group-attack-multiply',target:'physical',stage:'attack',unit:'dimensionless',amount:Number(build.equipment.groupAttackMultiplier),operation:'multiply',order:20,source:'index.html:standardGroupPowerPlan',condition:{type:'always'}});if(channel==='maximum'&&Number(build.equipment.conditionalAttackMultiplier??1)!==1){effects.push({id:'conditional-attack-multiply',target:'physical',stage:'attack',unit:'dimensionless',amount:Number(build.equipment.conditionalAttackMultiplier),operation:'multiply',order:30,source:'index.html:standardPowerConditionPlan',condition:{type:'always'}});}if(build.equipment.attributeConversionLevel&&build.equipment.attributeConversionState?.[channel]===true){effects.push({id:'attribute-conversion-element-add',target:'element',stage:'element',unit:'display-element',amount:attributeRule.adds[build.equipment.attributeConversionLevel],operation:'add',order:60,source:attributeRule.source,status:attributeRule.status,scope:conversionScope.scope,approval:conversionScope.approval,verificationStatus:conversionScope.verificationStatus,condition:{type:'always'}});}if(channel==='maximum'&&absorptionMaximumAdd)effects.push({id:'absorption-resistance-conversion-element-add',target:'element',stage:'element',unit:'display-element',amount:absorptionMaximumAdd,operation:'add',order:60,source:absorptionConversionPlan.sourceUrl,status:absorptionConversionPlan.adoptionStatus,scope:absorptionConversionPlan.condition,condition:{type:'always'}});if((!standardConversion||channel==='maximum')&&waterEntries.length&&waterConversionAdd!==0)effects.push({id:'water-resistance-conversion-element-add',target:'element',stage:'element',unit:'display-element',amount:waterConversionAdd,operation:'add',order:60,source:waterRule.source,status:waterRule.status,scope:waterRule.scope,condition:{type:'always'}});if((!standardConversion||channel==='maximum')&&Number(build.equipment.resistanceConversionAdd??0)!==0){effects.push({id:'thunder-resistance-conversion-element-add',target:'element',stage:'element',unit:'display-element',amount:Number(build.equipment.resistanceConversionAdd),operation:'add',order:60,source:'KUROYONHON_SKILL_TABLE_THUNDER_RESISTANCE_CONVERSION_20261025',status:'OWNER_APPROVED_PROVISIONAL',scope:conversionScope.scope,approval:conversionScope.approval,verificationStatus:conversionScope.verificationStatus,condition:{type:'always'}});}if(channel==='maximum'&&Number(build.equipment.conditionalAttackFlat??0)!==0){effects.push({id:'conditional-attack-flat',target:'physical',stage:'attack',unit:'true-attack',amount:Number(build.equipment.conditionalAttackFlat),operation:'add',order:50,source:'index.html:standardPowerConditionPlan',condition:{type:'always'}});}if(elementEntries.length){for(const entry of elementEntries)if(!Number.isInteger(entry.level)||entry.level<1||entry.level>3)throw Error('REAL_SLICE:ELEMENT_SKILL_LEVEL_UNSUPPORTED');}if(channel==='maximum'&&Number.isFinite(Number(build.equipment.maximumAffinity))&&Number(build.equipment.maximumAffinity)!==Number(build.affinity))effects.push({id:'conditional-affinity-maximum',target:'physical',stage:'affinity',unit:'percent',amount:Number(build.equipment.maximumAffinity)-Number(build.equipment.normalAffinity??build.affinity),operation:'add',order:80,source:'index.html:calcMaxAffinity',condition:{type:'always'}},{id:'conditional-affinity-maximum-element',target:'element',stage:'affinity',unit:'percent',amount:Number(build.equipment.maximumAffinity)-Number(build.equipment.normalAffinity??build.affinity),operation:'add',order:80,source:'index.html:calcMaxAffinity',condition:{type:'always'}});if(channel==='maximum'&&conditionPlan?.maximumElementComponents){const base=build.equipment.elementComponents,next=conditionPlan.maximumElementComponents;const dark=conditionPlan.groupPlan?.applied?.find(x=>x.skill==='ダークアーツ'),darkMultiplier=conditionPlan.selectedHp==='FULL_HP'?1:(dark?.elementMultiplier??1);const ratio=next.normalMultiplier/base.normalMultiplier/darkMultiplier;if(darkMultiplier!==1)effects.push({id:'dark-arts-body-element-multiplier',target:'element',stage:'element',unit:'dimensionless',operation:'multiply',amount:darkMultiplier,order:30,componentIds:resolvedTechniqueIds.flatMap(id=>(techniques[id].hits||[]).flatMap((h,i)=>h.componentSource?[]:[id+':element:'+i])),source:dark.evidenceRef,status:dark.numericOrigin,scope:'ADOPTED_BODY_ONLY_NO_GENERATED_FOLLOWUP',condition:{type:'always'}});if(ratio!==1)effects.push({id:'conditional-element-multiplier',target:'element',stage:'element',unit:'dimensionless',operation:'multiply',amount:ratio,order:30,source:'index.html:standardPowerConditionPlan',condition:{type:'always'}});if(next.conditionalFlat)effects.push({id:'conditional-element-flat',flatComponent:'conditional',target:'element',stage:'element',unit:'display-element',operation:'add',amount:next.conditionalFlat,order:80,source:'index.html:standardPowerConditionPlan',condition:{type:'always'}});}else if(channel==='maximum'&&Number.isFinite(Number(build.equipment.maximumElement))&&Number(build.equipment.maximumElement)!==Number(build.element))effects.push({id:'conditional-element-maximum',flatComponent:'conditional',target:'element',stage:'element',unit:'display-element',amount:Number(build.equipment.maximumElement)-Number(build.element),operation:'add',order:80,source:'index.html:standardPowerConditionPlan',condition:{type:'always'}});for(const target of ['physical','element'])effects.push({id:'affinity-upper-cap'+(target==='element'?'-element':''),target,stage:'affinity',unit:'percent',operation:'cap',amount:100,order:100,source:'index.html:calcMaxAffinity;common critical probability upper bound',condition:{type:'always'}});const unresolved=(conditionPlan?.groupPlan?.unresolvedEffects||[]).map(x=>({...x}));if(channel==='maximum')for(const row of conditionPlan?.groupPlan?.applied||[])if(row.maximumUnresolvedReason)unresolved.push({id:'maximum-scope:'+row.skillId,reason:row.maximumUnresolvedReason,target:'all',source:'OWNER_MAXIMUM_WEAPON_SCOPE;standardGroupPowerPlan'});if(activeBonusEffects.length&&!conditionPlan?.groupPlan)unresolved.push({id:'bonus-plan',reason:'BONUS_CONDITION_PLAN_MISSING',target:'all',source:'index.html:standardPowerConditionPlan'});if(channel==='maximum')for(const reason of build.equipment.conditionalPending||[])if(!unresolved.some(x=>x.reason===reason))unresolved.push({id:'conditional:'+reason,reason,target:'all',source:'index.html:standardPowerConditionPlan'});return {effects,unresolved};},resolveSkillApplicability:entries=>entries.map(entry=>{
    if(entry.level===1&&activeBonusEffects.some(e=>e.name===entry.name&&ownerExcludedBonus(e)))return {...entry,effectDisposition:'non_damage',reason:'OWNER_EXCLUDED_CURRENT_COMPARISON',evidenceRef:'USER_DIRECTION_20261111'};
    if((glOrdinaryAirborne&&Number(entry.skillId)===86)||(glOrdinaryPartbreaker&&Number(entry.skillId)===129))return {...entry,effectDisposition:'non_damage',reason:'EXACT_GL_GROUND_NONFOCUS_HP_EVENTS;PART_DURABILITY_SEPARATE;INTRINSIC_FIRE_PRESERVED',evidenceRef:'MHDB_JA_SKILL_'+entry.skillId+';https://kuroyonhon.com/mhwilds/memo/10.php;https://kuroyonhon.com/mhwilds/memo/27.php;gunlance-shell-reference.js:calculateTargetComponent',status:'SOURCE_BACKED_PROVISIONAL',liveGameVerification:'PENDING'};
    if(hhThunderZeroResolved&&entry.skillId===165)return {...entry,effectDisposition:'resolved',reason:'CONFIRMED_ZERO_ADD_EXACT_HH_NORMAL_MELODY_ALL_COMPONENTS',evidenceRef:'https://kuroyonhon.com/mhwilds/program/skill.php;https://kuroyonhon.com/mhwilds/memo/8.php;https://macarongamemo.com/entry/mhwilds-damage_calculation',status:'SOURCE_BACKED_PROVISIONAL',liveGameVerification:'PENDING'};
    if(hhChargeNoElementResolved&&Number(entry.skillId)===24)return {...entry,effectDisposition:'non_damage',reason:'CONFIRMED_ZERO_ELEMENT_EXACT_HH_NORMAL_MELODY_ALL_COMPONENTS',evidenceRef:'MHDB_JA_SKILL_24;https://kuroyonhon.com/mhwilds/memo/28.php;https://kuroyonhon.com/mhwilds/memo/8.php;https://macarongamemo.com/entry/mhwilds-damage_calculation',status:'SOURCE_BACKED_PROVISIONAL',liveGameVerification:'PENDING'};
    if(glChargeNonchargedResolved&&Number(entry.skillId)===24)return {...entry,effectDisposition:'non_damage',reason:'NONCHARGED_EXACT_GL_FULLBURST_STAKE_CHAIN;INTRINSIC_FIRE_PRESERVED',evidenceRef:'MHDB_JA_SKILL_24;https://kuroyonhon.com/mhwilds/memo/10.php;https://kuroyonhon.com/mhwilds/memo/28.php;gunlance-shell-reference.js:calculateTargetComponent',status:'SOURCE_BACKED_PROVISIONAL',liveGameVerification:'PENDING'};
    if(chargeSaNoElementResolved&&Number(entry.skillId)===24)return {...entry,effectDisposition:'non_damage',reason:'CONFIRMED_ZERO_ELEMENT_NON_AWAKENED_POWER_PHIAL_EXACT_SA_BODY_HP_ONLY',evidenceRef:'MHDB_JA_SKILL_24;https://kuroyonhon.com/mhwilds/memo/11.php;https://kuroyonhon.com/mhwilds/memo/28.php;EXPLICIT_ZERO_ELEMENT_COMPONENTS_BOTH_CHANNELS',status:'SOURCE_BACKED_PROVISIONAL',liveGameVerification:'PENDING'};
    if(chargeNoElementResolved&&Number(entry.skillId)===24)return {...entry,effectDisposition:'non_damage',reason:'CONFIRMED_NO_ELEMENT_OR_STATUS_ADOPTED_BODY_HP_ONLY',evidenceRef:'MHDB_JA_SKILL_24;EXPLICIT_ZERO_ELEMENT_COMPONENTS_BOTH_CHANNELS'};
    if(ammoChargeExcluded&&Number(entry.skillId)===24)return {...entry,effectDisposition:'non_damage',reason:'NON_CHARGED_NON_RAPID_ELEMENT_AMMO_ONLY',evidenceRef:'MHDB_SKILL_24;kuroyonhon/memo/14,15,28;SOURCE_BACKED_PROVISIONAL_20261105'};
    if(nonTargetWeaponSkill(entry))return {...entry,effectDisposition:'non_damage',reason:Number(entry.skillId)===136?'SOURCE_CONFIRMED_RANGED_MINDS_EYE_NOT_APPLICABLE':'MHDB_WEAPON_SPECIFIC_SKILL_NOT_APPLICABLE',evidenceRef:Number(entry.skillId)===136?'https://game8.jp/mhwilds/673680;https://gamewith.jp/mhwilds/488378':'MHDB_JA_SKILLS:'+entry.skillId};
    if(weapon.kind==='light-bowgun'&&resolvedTechniqueIds.length===1&&resolvedTechniqueIds[0]==='LBG_ELEMENT_FIRST_HIT_REFERENCE'&&Number(entry.skillId)===23&&entry.level===1)return {...entry,effectDisposition:'resolved',reason:'elemental rapid skill is applied by dedicated trigger formula only',evidenceRef:'https://kuroyonhon.com/mhwilds/program/skill.php'};
    if(rapidAmmoSequence&&[137,140].includes(Number(entry.skillId)))return {...entry,effectDisposition:'resolved',reason:'fixed five consumed rounds; existing First/Force rules apply to every Hit of each eligible round',evidenceRef:'HBG_R120_SHOT_SKILL_SOURCE;spec/CURRENT_CONTRACTS.md:C03'};
    if(rapidHealthExcludedSkills.has(entry))return {...entry,effectDisposition:'resolved',reason:'CANONICAL_HEALTH_EXCLUSION_NO_SIMULTANEOUS_STACKING',evidenceRef:'index.html:standardPowerConditionPlan;STANDARD_CONDITIONAL_ATTACK_RULES',liveGameVerification:'PENDING'};
    if(rapidNonTargetBonuses.size&&[...rapidNonTargetBonuses].some(e=>e.name===entry.name))return {...entry,effectDisposition:'non_damage',reason:'LBG_STANDARD_NO_CLASH_OR_OFFSET',evidenceRef:'MHDB_JA_SKILL_'+entry.skillId};
    if([...rapidNonApplicableSkills].some(x=>x.skillId===entry.skillId&&x.name===entry.name&&x.level===entry.level))return {...entry,effectDisposition:'non_damage',reason:[2,47,69,94,109].includes(Number(entry.skillId))?'NON_TARGET_STANDARD_NORMAL_RAPID_AMMO':Number(entry.skillId)===66?'NON_GUARD_LBG_STANDARD_NORMAL_RAPID':'NO_ELEMENT_STANDARD_NORMAL_RAPID_25_PHYSICAL_HITS',evidenceRef:'index.html:standardPowerConditionPlan;bowgun-normal-reference.js:rapidHit;MHDB_JA_SKILL_'+entry.skillId,liveGameVerification:'PENDING'};
    if(rapidRequested&&Number(entry.skillId)===23)return {...entry,effectDisposition:'resolved',reason:rapidShotRule.scope,evidenceRef:rapidShotRule.skillSource};
    if(Number(entry.skillId)===163&&bladescaleEntries.length)return {...entry,effectDisposition:'resolved',reason:bladescaleRule.scope,evidenceRef:bladescaleRule.source};
    if(Number(entry.skillId)===159&&cornpopperEntries.length)return {...entry,effectDisposition:'resolved',reason:cornpopperRule.scopeWarning,evidenceRef:cornpopperRule.evidenceRef};
    // MHDB target descriptions: rapid/special/piercing ammunition are not ordinary normal shots.
    // Scope to adopted normal-ammo IDs; leave target techniques and invalid states/levels unresolved.
    const normalAmmoOnly=resolvedTechniqueIds.length>0&&resolvedTechniqueIds.every(id=>weapon.kind==='light-bowgun'?/^LBG_NORMAL_AMMO_[12]$/.test(id):weapon.kind==='heavy-bowgun'&&/^HBG_NORMAL_AMMO_[123]$/.test(id));
    const normalAmmoState=weapon.kind==='light-bowgun'?lightBowgunState:hbgState;
    if(thousandRequested&&[69,94].includes(Number(entry.skillId)))return {...entry,effectDisposition:'resolved',reason:thousandRule.scope,evidenceRef:thousandRule.skillSource};
    if(pierceNonTargetResolved&&Number(entry.skillId)===94)return {...entry,effectDisposition:'non_damage',reason:'PIERCE_NOT_APPLICABLE_TO_EXACT_ORDINARY_RANGED_ROUTE',evidenceRef:'MHDB_JA_SKILL_94;https://kuroyonhon.com/mhwilds/program/skill.php',status:'SOURCE_BACKED_NONAPPLICATION_CURRENT_GAME_UNVERIFIED'};
    // MHDB skill 69 targets special ammo / Dragon Piercer / Thousand Dragons / Tracer,
    // not the adopted ordinary shot, power shot, or power volley. Keep other routes gated.
    const ordinaryBowOnly=weapon.kind==='bow'&&resolvedTechniqueIds.length>0&&resolvedTechniqueIds.every(id=>['BOW_SHOT_3','BOW_POWER_SHOT_3','BOW_POWER_VOLLEY_3'].includes(id));
    if(ordinaryBowOnly&&Number(entry.skillId)===69&&entry.name==='特殊射撃強化'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=2)return {...entry,effectDisposition:'non_damage',reason:'SPECIAL_AMMO_NOT_APPLICABLE_TO_ADOPTED_ORDINARY_BOW_SHOTS',evidenceRef:'MHDB_JA_SKILL_69;BOW_STANDARD_SHOT3_POWER3_VOLLEY3_V1042'};
    // MHDB 69 targets special ammo, not the adopted ordinary non-rapid elemental shot.
    const ordinaryElementAmmo=resolvedTechniqueIds.length===1&&((weapon.kind==='light-bowgun'&&resolvedTechniqueIds[0]==='LBG_ELEMENT_FIRST_HIT_REFERENCE'&&lightBowgunState?.shotMode==='NORMAL')||(weapon.kind==='heavy-bowgun'&&resolvedTechniqueIds[0]==='HBG_ELEMENT_FIRST_HIT_REFERENCE'))&&normalAmmoState?.normalModeLevel===0&&[1,2].includes(normalAmmoState?.ammoLevel)&&['fire','water','thunder','ice'].includes(String(weapon.kind==='light-bowgun'?normalAmmoState?.ammoType:normalAmmoState?.elementType).toLowerCase());
    if(ordinaryElementAmmo&&Number(entry.skillId)===69&&entry.name==='特殊射撃強化'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=2)return {...entry,effectDisposition:'non_damage',reason:'SPECIAL_AMMO_NOT_APPLICABLE_TO_ADOPTED_NON_RAPID_ELEMENT_AMMO',evidenceRef:'MHDB_JA_SKILL_69_TARGET_DESCRIPTION'};
    const normalAmmoExclusion={23:{name:'速射強化',max:1},69:{name:'特殊射撃強化',max:2},94:{name:'貫通弾・竜の矢強化',max:1}}[entry.skillId];
    if(normalAmmoOnly&&normalAmmoState?.ammoType==='NORMAL'&&(weapon.kind!=='light-bowgun'||normalAmmoState.shotMode==='NORMAL')&&normalAmmoExclusion&&entry.name===normalAmmoExclusion.name&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=normalAmmoExclusion.max)return {...entry,effectDisposition:'non_damage',reason:'NOT_APPLICABLE_TO_ADOPTED_NON_RAPID_NORMAL_AMMO',evidenceRef:'MHDB_JA_SKILLS_20261026:'+entry.skillId};
    if(Number(entry.skillId)===84&&!waterEntries.length&&entry.name==='水耐性'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'non_damage',reason:'NO_DIRECT_HP_EFFECT_WITHOUT_WATER_CONVERSION;RESISTANCE_INPUT_RETAINED',evidenceRef:'MHDB_SKILL_84;OWNER_FIXED_INDICATOR_SCOPE'};
    if(Number(entry.skillId)===84&&entry.name==='水耐性'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3&&waterEntries.length&&waterInput?.status==='KNOWN_LIMITED')return {...entry,effectDisposition:'resolved',reason:'water resistance consumed once by validated conversion producer',evidenceRef:waterRule.source};if(Number(entry.skillId)===181)return {...entry,effectDisposition:'resolved',reason:waterRule.scope,evidenceRef:waterRule.source};if(Number(entry.skillId)===83)return {...entry,effectDisposition:'resolved',reason:root.MHChargeStrikeRule.scopeWarning,evidenceRef:root.MHChargeStrikeRule.source};if(Number(entry.skillId)===86)return {...entry,effectDisposition:'resolved',reason:'source-mapped physical attack stage for adopted dual-blades dance Hits only; other routes remain pending',evidenceRef:root.MHAirborneHitRule.source};if(nonTargetRapidMorph(entry))return {...entry,effectDisposition:'non_damage',reason:'RAPID_MORPH_NON_TARGET_WEAPON',evidenceRef:'MHDB_JA_SKILLS:7'};if(unusedNonBowCoating(entry))return {...entry,effectDisposition:'non_damage',reason:'BOW_ONLY_COATING_CAPABILITY_NOT_APPLICABLE',evidenceRef:'MHDB_JA_SKILLS:'+entry.skillId};const capability=coatingCapabilities[entry.skillId];if(capability&&entry.name===capability[0]&&entry.level===1&&weapon.kind==='bow'&&['NONE','POWER','CLOSE_RANGE','PIERCE'].includes(bowState?.coating))return {...entry,effectDisposition:'non_damage',reason:'UNUSED_COATING_CAPABILITY_ONLY',evidenceRef:'MHDB_JA_SKILLS_20261026:'+entry.skillId};if(entry.skillKey==='explicitAffinity')return {...entry,effectDisposition:'resolved',reason:'explicit channel state and per-Hit affinity; display maximum excluded',evidenceRef:root.MHWExplicitAffinityRules.source};if(entry.skillKey==='contextAttack')return {...entry,effectDisposition:'resolved',reason:'validated per-component attack multiplier',evidenceRef:root.MHContextAttackSkillRules.source};if(entry.skillKey==='ballistics')return {...entry,effectDisposition:'resolved',reason:'explicit reference shot physical attack only at critical range; Lv1/2 range is an input',evidenceRef:root.MHCommonSkillDamageRules.source};if(frenzyAffinity.active&&Number(entry.skillId)===18&&['無我の境地','Antivirus'].includes(entry.name)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'resolved',reason:'explicit frenzy affinity supplied once by shared normal/maximum resolver',evidenceRef:frenzyAffinity.source};const extra=annotationPolicy(entry);if(extra&&!extra.bodyEffect)return {...entry,effectDisposition:'resolved',reason:'owner-defined indicator excludes skill extra damage; annotation only',evidenceRef:'MHDB_JA_SKILLS_20261026:'+entry.skillId};const internal=INTERNAL_SKILL_ADOPTION[entry.name];if(internal){if(entry.skillId==null)throw Error('REAL_SLICE:SKILL_ID_UNRESOLVED:'+entry.name);if(internal.requiredSkillId!==undefined&&(Number(entry.skillId)!==internal.requiredSkillId||!Number.isInteger(entry.level)||entry.level<1||entry.level>internal.maxLevel))throw Error('REAL_SLICE:NON_DAMAGE_SKILL_CONTRACT_MISMATCH:'+entry.name);return {...entry,...internal,evidenceRef:`${internal.evidenceRef}:skillId=${entry.skillId}:level=${entry.level}`};}if(activeBonusEffectNames.has(String(entry.name)))return {...entry,effectDisposition:conditionPlan?.groupPlan?.unresolvedEffects?.some(x=>x.id==='bonus:'+entry.name)?'unresolved':'resolved',reason:'active series/group effect is accounted by the shared plan; unresolved entries prevent channel execution',evidenceRef:'index.html:standardGroupPowerPlan'};if(entry.damageRelated===false||['defense','utility','survival','non_damage'].includes(String(entry.effectCategory||'').toLowerCase()))return {...entry,effectDisposition:'non_damage',reason:'DB effect classification excludes direct HP damage',evidenceRef:entry.source+':skillId='+entry.skillId+':effectCategory='+entry.effectCategory};if(entry.skillKey==='slugger'&&String(entry.skillId)==='36'&&Number.isInteger(entry.level)&&entry.level===1)return {...entry,effectDisposition:'non_damage',reason:'stun accumulation only; no HP-damage modifier',evidenceRef:`MHDB skill.id=36;level=1;${entry.source}`};if(entry.skillKey==='focus'&&(String(entry.skillId)==='60'||entry.skillId==null)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'non_damage',reason:'charge/gauge timing only; no direct HP-damage modifier',evidenceRef:`MHDB skill.id=60;level=${entry.level};${entry.source}`};if((entry.name==='強化持続'||entry.name==='Power Prolonger')&&(String(entry.skillId)==='104'||entry.skillId==null)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'non_damage',reason:'enhanced-state duration only; no direct HP-damage modifier',evidenceRef:`MHDB skill.id=104;level=${entry.level};${entry.source}`};if((entry.name==='弾導強化'||entry.name==='Ballistics')&&(String(entry.skillId)==='53'||entry.skillId==null)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'non_damage',reason:'range-extension state only; explicit range input controls reference damage',evidenceRef:`MHDB skill.id=53;level=${entry.level};${entry.source}`};if(entry.skillKey==='attack'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=5)return {...entry,effectDisposition:'resolved',reason:'HP attack effect is resolved by the shared L3 effect list',evidenceRef:'index.html:calcAttackSkill'};if(entry.skillKey==='affinity'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=5)return {...entry,effectDisposition:'resolved',reason:'critical-eye affinity is resolved by the shared L3 effect list',evidenceRef:'index.html:calcAffinityBonus'};if(entry.skillKey==='rapidMorph')return {...entry,effectDisposition:'resolved',reason:'owner-approved CB/SA attack-stage rule; attribute and explosion components excluded; conditional follow-up routes remain gated',evidenceRef:rapidRule.source,status:rapidRule.status};if(entry.skillKey==='conditionalAffinity'){const rule=CONDITIONAL_AFFINITY_SKILLS[entry.name];if(!rule||Number(entry.skillId)!==rule.id||!Number.isInteger(entry.level)||entry.level<1||entry.level>rule.max)throw Error('REAL_SLICE:CONDITIONAL_AFFINITY_ID_OR_LEVEL_INVALID:'+entry.name);return {...entry,effectDisposition:'resolved',reason:'maximum-only affinity is already supplied by calcMaxAffinity to both physical and elemental L3 effects',evidenceRef:'index.html:calcMaxAffinity;MHDB:skill:'+rule.id};}if(entry.skillKey==='selfState'&&conditionPlan?.selfStatePlan?.ids.includes(Number(entry.skillId)))return {...entry,effectDisposition:'resolved',reason:'explicit self-state effects; missing conditions remain channel issues',evidenceRef:'https://kuroyonhon.com/mhwilds/program/skill.php'};if(entry.skillKey==='handicraft'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=5)return {...entry,effectDisposition:'resolved',reason:'MHDB highest attained color shared by both channels; fixed owner Artia premise preserved; ranged not applicable',evidenceRef:'https://docs.wilds.mhdb.io/#handicraft'};if(entry.skillKey==='thunderResistance'&&entry.skillId===156&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'resolved',reason:'MHDB rank contributes once to equipment thunder resistance',evidenceRef:'MHDB_SKILL_156'};if(entry.skillKey==='criticalBoost'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=5)return {...entry,effectDisposition:'resolved',reason:'critical multiplier is supplied to the canonical Formula',evidenceRef:'index.html:criticalMultiplierForState'};if(entry.skillKey==='conditionalAttack'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=5)return {...entry,effectDisposition:'resolved',reason:'conditional attack effect is resolved by the shared condition plan or explicit hit condition',evidenceRef:'index.html:standardPowerConditionPlan'};if(entry.skillKey==='attributeConversion'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'resolved',reason:'龍属性武器への明示バフ加算のみ。追撃は別イベントとして未接続',evidenceRef:'KUROYONHON_SKILL_TABLE_ATTRIBUTE_CONVERSION_20261025'};if(entry.skillKey==='resistanceConversionThunder'&&Number.isInteger(entry.level)&&entry.level===1)return {...entry,effectDisposition:'resolved',reason:'雷属性かつ有限非負の総雷耐性を明示した場合だけ属性加算',evidenceRef:'KUROYONHON_SKILL_TABLE_THUNDER_RESISTANCE_CONVERSION_20261025'};if(entry.skillKey==='shelling'&&Number.isInteger(entry.level)&&entry.level>=0&&entry.level<=3)return {...entry,effectDisposition:'resolved',reason:'shelling formula consumes the explicit artillery/load-shells state',evidenceRef:'gunlance-shell-reference.js'};if(['normalUp','spreadUp','chargeMaster','criticalElement','bladescaleLoading','firstShot','forceShot'].includes(entry.skillKey)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'resolved',reason:'dedicated ranged Formula consumes the explicit skill level and Technique DB rule',evidenceRef:({normalUp:'index.html:TECHNIQUE_DB_R113_BOW_STATE:BOW_R113_SKILL_SOURCE',spreadUp:'index.html:TECHNIQUE_DB_R113_BOW_STATE:BOW_R113_SKILL_SOURCE',chargeMaster:'index.html:TECHNIQUE_DB_R113_BOW_STATE:BOW_R113_CHARGE_SOURCE',criticalElement:'index.html:TECHNIQUE_DB_R114_BOW_STATE:BOW_R114_CRITICAL_ELEMENT_SOURCE',bladescaleLoading:'index.html:BOW_R115_BLADESCALE_SOURCE',firstShot:'index.html:BOW_R116_FIRST_SHOT_SOURCE',forceShot:'index.html:BOW_R117_FORCE_SOURCE'})[entry.skillKey]};if(['fire','water','thunder','ice','dragon'].includes(entry.skillKey)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'resolved',reason:'element value is resolved by the shared L3 effect list',evidenceRef:'index.html:calcElementSkill'};throw Error('REAL_SLICE:SKILL_EFFECT_NOT_PROVEN:'+entry.name);}),initialState:(_build,channel)=>{const state=rapidRequested?{lightBowgun:{loadedRounds:rapidAmmoSequence?5:lightBowgunState.loadedRounds}}:hhModel?{huntingHorn:{selfImprovementLevel:huntingHornState.selfImprovementLevel,attackMelodyLevel:huntingHornState.attackMelodyLevel}}:weapon.kind==='switch-axe'?{switchAxe:{mode:switchAxeState.mode}}:ed1Requested?{chargeBlade:{...(hRequested?{mode:chargeBladeState.mode}:{}),previousAction:chargeBladeState.previousAction,normalPhials:chargeBladeState.normalPhials,...(chargeBladeState.enhancedPhials!=null?{enhancedPhials:chargeBladeState.enhancedPhials}:{})}}:hasShelling?{gunlance:{loadedRounds:gunlanceState?.loadedRounds,...(glTargetContext?{stakeLoaded:gunlanceState.stakeLoaded}:{})}}:{};if(bladescaleEntries.length)state.bladescaleFirstHit=bladescaleEligible&&channel==='maximum';return state;},
   shellingFormula:hasShelling?({coefficient,parameters,build,stats,state,channel})=>{if(parameters.glTarget){try{const r=root.GunlanceShellReference.calculateTargetComponent({parameters,stats,state,channel,cornpopperActive:cornpopperEntries.length>0&&channel==='maximum',unreviewedSkills:parameters.glTarget.model.input.unreviewedSkills.filter(name=>!(typeof glOrdinaryAirborne!=='undefined'&&glOrdinaryAirborne&&name==='飛燕')&&!(typeof glOrdinaryPartbreaker!=='undefined'&&glOrdinaryPartbreaker&&name==='破壊王')&&!(typeof glOrdinaryActive!=='undefined'&&glOrdinaryActive&&glOrdinaryOmegaInactive&&activeBonusEffects.some(x=>x.name===name))&&(unresolvedShellThunderBonusNames.has(name)||!((channel==='normal'||glGogResolved)&&gogPlan&&name===gogPlan.skill)&&!adoptedBonusAttackName(name)&&!(blackEclipse&&(['黒蝕一体Ⅰ','黒蝕一体Ⅱ','無我の境地','Antivirus'].includes(name)))))},root.TechniqueDBEngine,root.MHWGenericProfileDamage);return {status:'available',value:r.total,details:r};}catch(error){return {status:'unavailable',reason:String(error?.message||error)}}}if(resolvedTechniqueIds.length!==1&&!parameters.shellingResource)return {status:'unavailable',reason:'REAL_SLICE:GL_SEQUENCE_STATE_TRANSITION_UNRESOLVED'};if(typeof root.GunlanceShellReference?.calculate!=='function'||typeof root.MHWGenericProfileDamage!=='function')return {status:'unavailable',reason:'REAL_SLICE:SHELLING_FORMULA_UNAVAILABLE'};try{const input=parameters.shellingInput||{},r=root.GunlanceShellReference.calculate({action:parameters.shellingAction,weaponShellMetadata:{type:weapon.shell,level:weapon.shellLevel},offensiveGuardLevel:guardEntries.length?Math.max(...guardEntries.map(x=>x.level)):0,offensiveGuardActive:guardEntries.length>0&&channel==='maximum',cornpopperLevel:cornpopperEntries.length?cornpopperRule.level:0,cornpopperActive:cornpopperEntries.length>0&&channel==='maximum',state:parameters.shellingResource?{...input.shellingState,loadedRounds:state?.gunlance?.loadedRounds}:input.shellingState,weaponBaseAttack:stats.attack,loadShellsLevel:input.loadShellsLevel,artilleryLevel:input.artilleryLevel,normalAttackComponents:stats.attackComponents,unreviewedSkills:input.unreviewedSkills.filter(name=>unresolvedShellThunderBonusNames.has(name)||!(channel==='normal'&&gogPlan&&name===gogPlan.skill)&&!adoptedBonusAttackName(name)&&!(blackEclipse&&(['黒蝕一体Ⅰ','黒蝕一体Ⅱ','無我の境地','Antivirus'].includes(name))))},root.TechniqueDBEngine,root.MHWGenericProfileDamage);return r&&Number.isFinite(r.total)?{status:'available',value:r.total}:{status:'unavailable',reason:'REAL_SLICE:SHELLING_RESULT_UNRESOLVED'};}catch(error){return {status:'unavailable',reason:String(error?.message||error)}}}:null,
   phialFormula:({parameters,stats,build,channel})=>{const state=parameters?.phialState;if(!state||typeof state!=='object')return {status:'unavailable',reason:'REAL_SLICE:CB_PHIAL_STATE_REQUIRED'};if(typeof state.shieldBoosted!=='boolean'||typeof state.enhancedPhial!=='boolean')return {status:'unavailable',reason:'REAL_SLICE:CB_PHIAL_STATE_INCOMPLETE'};if(!Number.isInteger(state.artilleryLevel)||state.artilleryLevel<0||state.artilleryLevel>3)return {status:'unavailable',reason:'REAL_SLICE:CB_ARTILLERY_LEVEL_UNRESOLVED'};if(!Number.isInteger(parameters.phialCount)||parameters.phialCount<1)return {status:'unavailable',reason:'REAL_SLICE:CB_PHIAL_COUNT_UNRESOLVED'};const type=state.phialType;if(type!=='IMPACT'&&type!=='POWER_ELEMENT')return {status:'unavailable',reason:'REAL_SLICE:CB_PHIAL_TYPE_REQUIRED'};const t=root.ChargeBladeEngine?.techniques?.[parameters.sourceTechniqueId],f=root.ChargeBladeEngine?.formulas,coef=typeof root.ChargeBladeEngine?.phialCoefficient==='function'?root.ChargeBladeEngine.phialCoefficient(t,type,state.enhancedPhial):null;if(!t?.phial||!f||!Number.isFinite(coef))return {status:'unavailable',reason:'REAL_SLICE:CB_PHIAL_COEFFICIENT_UNRESOLVED'};const artilleryLevel=state.artilleryLevel,attackComponents=stats.attackComponents||state.attackComponents;if(type==='IMPACT'&&artilleryLevel>0){if(!Number.isFinite(Number(state.artilleryMultiplier))||!Number.isFinite(Number(state.baseAttack)))return {status:'unavailable',reason:'REAL_SLICE:CB_ARTILLERY_MULTIPLIER_UNRESOLVED'};if(!attackComponents||!Number.isFinite(attackComponents.normalMultiplier)||!Number.isFinite(attackComponents.normalFlat))return {status:'unavailable',reason:'REAL_SLICE:CB_ARTILLERY_ATTACK_ORDER_PENDING'};}try{const elementalHitzone=state.elementalHitzone??(build?.elementType?part?.multipliers?.[build.elementType]*100:null);let value;if(type==='IMPACT'){const mult=Number(attackComponents?.normalMultiplier??1),flat=Number(attackComponents?.normalFlat??0),base=Number(attackComponents?.weaponBase??stats.attack);if(!Number.isFinite(mult)||!Number.isFinite(flat)||!Number.isFinite(base))return {status:'unavailable',reason:'REAL_SLICE:CB_ARTILLERY_ATTACK_ORDER_PENDING'};value=f.IMPACT_PHIAL.evaluate({baseAttack:base,coefficient:coef,shieldBoosted:state.shieldBoosted,artilleryMultiplier:type==='IMPACT'?Number(state.artilleryMultiplier??1):1,attackMultiplier:mult,attackFlat:flat});}else value=f.POWER_ELEMENT_PHIAL.evaluate({displayedElement:Number(stats.element),coefficient:coef,elementalHitzone,shieldBoosted:state.shieldBoosted,elementKnown:true,typeKnown:true,elementType:build?.elementType,elementStatus:build?.equipment?.elementStatus,elementReason:build?.equipment?.elementReason});const total=value*parameters.phialCount;return Number.isFinite(total)?{status:'available',value:total,...(parameters.consumption?{details:{consumption:parameters.consumption,phialType:type,enhancedPhial:state.enhancedPhial,coefficient:coef,explosionHitCount:parameters.phialCount,source:'index.html:CHARGE_BLADE_TECHNIQUES.'+parameters.sourceTechniqueId+'.phial'}}:{})}:{status:'unavailable',reason:'REAL_SLICE:CB_PHIAL_RESULT_UNRESOLVED'};}catch(error){return {status:'unavailable',reason:String(error?.message||error)}}},
   referenceFormula:hasReference?(({parameters,build,stats,channel,state:executionState})=>{const kind=parameters.referenceKind,input=parameters.referenceInput||{},state=input.state;if(kind!=='hunting-horn-model-event'&&(!state||typeof state!=='object'))return {status:'unavailable',reason:'REAL_SLICE:REFERENCE_STATE_REQUIRED'};const criticalMultiplier=1.25+[0,.03,.06,.09,.12,.15][Number(input.criticalBoostLevel)||0];try{let r;if(kind==='heavy-bowgun-wyvern'){
 if(typeof root.HBGWyvernReference?.calculate!=='function')return {status:'unavailable',reason:'HBG_WYVERN:FORMULA_UNAVAILABLE'};
 const fireHitzone=part?.multipliers?.fire;
 if(!Number.isFinite(fireHitzone))return {status:'unavailable',reason:'HBG_WYVERN:FIRE_HITZONE_UNRESOLVED'};
 const result=root.HBGWyvernReference.calculate({...state,...input.skills,fireHitzone:fireHitzone*100,ballisticsLevel,attackComponents:stats.attackComponents,unreviewedSkills:[]},root.TechniqueDBEngine);
 return {status:'available',value:result.total,details:result};
}else if(['heavy-bowgun-element','light-bowgun-element'].includes(kind)){
 if(state.contacts!==undefined&&state.contactPolicy!=='EXPLICIT_CONTACTS')return {status:'unavailable',reason:'HBG_ELEMENT:EXPLICIT_CONTACT_POLICY_REQUIRED'};
 const elementRapid=kind==='light-bowgun-element'&&state.shotMode==='RAPID';
 if(kind==='light-bowgun-element'&&(!['NORMAL','RAPID'].includes(state.shotMode)||state.range!=='CRITICAL'||!['FIRST_HIT','EXPLICIT_CONTACTS'].includes(state.contactPolicy)||state.weaponAmmoEntry?.rapid!==elementRapid))return {status:'unavailable',reason:'LBG_ELEMENT:SHOT_MODE_WEAPON_MISMATCH'};
 if(elementRapid&&(state.rapidReady!==true||!Number.isInteger(state.shotOrdinal)||state.shotOrdinal<1||state.shotOrdinal>state.magazineCapacity||state.fullMagazine!==true))return {status:'unavailable',reason:'LBG_ELEMENT:RAPID_START_REQUIRED'};
 if(elementRapid&&(input.skills.firstShot>0||input.skills.forceShot>0)&&root.TechniqueDBEngine.get('light-bowgun','LBG_ELEMENT_FIRST_HIT_REFERENCE')?.specialSourceValues?.rapidElement?.shotSkillUnit!=='ONE_CONSUMED_ROUND_PER_TRIGGER')return {status:'unavailable',reason:'LBG_ELEMENT:RAPID_SHOT_SKILL_SCOPE_PENDING'};
 if(rapidEntries.length>1||rapidEntries.some(x=>Number(x.skillId)!==23||x.level!==1))return {status:'unavailable',reason:'LBG_ELEMENT:RAPID_SKILL_INVALID'};
 if(resolvedTechniqueIds.length!==1)return {status:'unavailable',reason:'HBG_ELEMENT:SINGLE_REFERENCE_REQUIRED'};
 if(state.elementType==='dragon'&&(build.weaponType!=='heavy-bowgun'||state.ammoLevel!==1||state.range!=='CRITICAL'||state.contactPolicy!=='EXPLICIT_CONTACTS'||state.contactCount!==1))return {status:'unavailable',reason:'HBG_DRAGON:ONE_CONTACT_CRITICAL_LEVEL1_REQUIRED'};
 const capacityIndependent=state.capacityIndependentBaseHbg===true&&kind==='heavy-bowgun-element'&&root.MHBaseHbgCapacityIndependentAmmo?.(build.equipment,state.weaponAmmoEntry)===true;
 if(capacityIndependent&&(state.contactPolicy!=='EXPLICIT_CONTACTS'||state.contactCount!==1||state.range!=='CRITICAL'||(state.contacts&&state.contacts.length!==1)))return {status:'unavailable',reason:'HBG_ELEMENT:BASE_ARTIA_ONE_CONTACT_REQUIRED'};
 if(capacityIndependent&&(input.skills.firstShot>0||input.skills.forceShot>0))return {status:'unavailable',reason:'HBG_ELEMENT:BASE_ARTIA_SHOT_SKILL_CAPACITY_UNRESOLVED'};
 if((!['fire','water','thunder','ice'].includes(state.elementType)&&state.elementType!=='dragon')||!state.weaponAmmoEntry||(!capacityIndependent&&(!Number.isInteger(state.magazineCapacity)||state.magazineCapacity<1)))return {status:'unavailable',reason:'HBG_ELEMENT:WEAPON_AMMO_UNRESOLVED'};
 if(state.normalModeLevel!==0||conditions.mounted===true)return {status:'unavailable',reason:'HBG_ELEMENT:SPECIAL_MODE_UNSUPPORTED'};
 if(build.equipment.artiaCalculationEvidence?.capacityEvidence?.bonus>0&&!state.weaponAmmoEntry?.completionEvidence)return {status:'unavailable',reason:'HBG_ELEMENT:CAPACITY_RESTORE_UNSUPPORTED'};
 const ammoBladescale=allSkills.filter(x=>x.skillKey==='bladescaleLoading');
 if(ammoBladescale.some(x=>Number(x.skillId)!==160||x.level!==1)||ammoBladescale.length>1)return {status:'unavailable',reason:'HBG_ELEMENT:BLADESCALE_INPUT_INVALID'};
 const bladeRule=root.TechniqueDBEngine.get(build.weaponType,kind==='light-bowgun-element'?'LBG_ELEMENT_FIRST_HIT_REFERENCE':'HBG_ELEMENT_FIRST_HIT_REFERENCE')?.specialSourceValues?.bladescaleApplicability;
 const bladeExcluded=bladeRule?.status==='SOURCE_BACKED_PROVISIONAL'&&bladeRule.skillId===160&&bladeRule.excludedAmmo?.includes(state.weaponAmmoEntry.kind);
 if(ammoBladescale.length&&!bladeExcluded&&conditions.ammoBladescaleState?.[channel]!==false)return {status:'unavailable',reason:'HBG_ELEMENT:BLADESCALE_APPLICABILITY_UNRESOLVED'};
 const bladescaleLoading=ammoBladescale.length?{status:bladeExcluded?'INELIGIBLE_AMMO_PROVISIONAL':'EXPLICIT_OFF',requestedActive:conditions.ammoBladescaleState?.[channel]??null,physicalMultiplier:1,elementMultiplier:1,magazineEffect:'NONE',evidence:bladeRule||null}:null;
 if(allSkills.some(x=>['chargeMaster','attributeConversion','resistanceConversionThunder'].includes(x.skillKey)&&!(x.skillKey==='chargeMaster'&&ammoChargeExcluded)&&!(x.skillKey==='attributeConversion'&&attributeState?.[channel]===false)&&!(x.skillKey==='resistanceConversionThunder'&&thunderAmmoScope)))return {status:'unavailable',reason:'HBG_ELEMENT:SKILL_INTERACTION_UNSUPPORTED'};
 const unresolvedBonus=activeBonusEffects.filter(e=>!(conditionPlan?.groupPlan?.applied||[]).some(x=>x.skill===e.name)&&!(conditionPlan?.groupPlan?.nonDamageEffects||[]).some(x=>x.name===e.name));
 if(unresolvedBonus.length)return {status:'unavailable',reason:'HBG_ELEMENT:BONUS_EFFECT_UNRESOLVED'};
 if(channel==='maximum'&&(conditionPlan?.applied||[]).some(x=>(Number(x.elementAdd)||0)!==0||(x.elementMultiplier!=null&&x.elementMultiplier!==1)))return {status:'unavailable',reason:'HBG_ELEMENT:CONDITIONAL_ELEMENT_SCOPE_UNSUPPORTED'};
 const attackParts=stats.attackComponents;
 if(!attackParts||!['weaponBase','normalMultiplier','normalFlat'].every(k=>typeof attackParts[k]==='number'&&Number.isFinite(attackParts[k]))||Math.abs(attackParts.weaponBase*attackParts.normalMultiplier+attackParts.normalFlat-stats.attack)>1e-7)return {status:'unavailable',reason:'HBG_ELEMENT:ATTACK_COMPONENTS_INCONSISTENT'};
 const baseElementRule=root.MHWElementSkillResolver?.(skillTotal,state.elementType),ammoElementCondition=conditionPlan?.ammoElementCondition?.[channel];
 const rule=baseElementRule?{...baseElementRule,mult:baseElementRule.mult*(ammoElementCondition?.multiplier??1),add:baseElementRule.add+(ammoElementCondition?.flat??0)+((!standardConversion||channel==='maximum')&&thunderAmmoScope&&resistanceConversionLevel&&state.elementType==='thunder'?thunderResistance*resistanceConversionCoefficient+(channel==='maximum'?absorptionMaximumAdd:0):0)}:null,hz=part?.multipliers?.pierce,ehz=part?.multipliers?.[state.elementType];
 if(!rule||!Number.isFinite(hz)||!Number.isFinite(ehz))return {status:'unavailable',reason:'HBG_ELEMENT:INPUT_UNRESOLVED'};
 const shotRules=root.TechniqueDBEngine.get(build.weaponType,build.weaponType==='light-bowgun'?'LBG_NORMAL_REFERENCE_RULES':'HBG_NORMAL_REFERENCE_RULES')?.specialSourceValues?.shotSkills;
 const shotBonus=root.BowgunNormalReference.shotSkillBonuses({firstShot:input.skills.firstShot,forceShot:input.skills.forceShot},state,shotRules);
 const drawAdds=referenceDrawAdds(channel,parameters.sourceTechniqueId),punishingAdds=referencePunishingAdds(channel,parameters.sourceTechniqueId);
 const ammoContacts=state.contacts?.map((c,i)=>({...c,hitAttackAdd:punishingAdds?.[i]??0,resolvedAffinity:Math.min(100,Number(stats.affinity)+shotBonus.shotAffinityAdd+(drawAdds?.[i]??0)+wexFor({multipliers:{pierce:c.physicalHitzone/100},...(c.originalPhysicalHitzone!==undefined?{originalMultipliers:{pierce:c.originalPhysicalHitzone/100}}:{}),wounded:c.wounded??false},'pierce'))}));
 const ammoAffinity=Math.min(100,Number(stats.affinity)+shotBonus.shotAffinityAdd+(state.contactPolicy==='EXPLICIT_CONTACTS'?0:(drawAdds?.[0]??0)+wexFor(part,'pierce')));
 r=root.BowgunElementReference[elementRapid?'rapidTrigger':state.contactPolicy==='EXPLICIT_CONTACTS'?'contactSequence':'firstHit']({shotMode:state.shotMode,rapidUp:rapidEntries.length?1:0,contacts:ammoContacts,weaponKind:build.weaponType,elementType:state.elementType,ammoLevel:state.ammoLevel,range:state.range,attack:Number(stats.attack),shotAttackAdd:shotBonus.shotAttackAdd,hitAttackAdd:state.contactPolicy==='EXPLICIT_CONTACTS'?0:(punishingAdds?.[0]??0),criticalRangeAttackAdd,elementCriticalMultiplier:build.equipment.criticalElementMultiplier,affinity:ammoAffinity,criticalMultiplier,physicalHitzone:hz*100,elementalHitzone:ehz*100,elementMultiplier:rule.mult*shotBonus.shotElementMultiplier,elementFlat:rule.add},root.TechniqueDBEngine);
 r={...r,shotSkills:shotBonus,bladescaleLoading};
 return {status:'available',value:r.total,details:{...r,state,elementRule:rule,ammoElementCondition:conditionPlan?.ammoElementCondition??null,elementCapStatus:state.elementType==='dragon'?'OWNER_APPROVED_PROVISIONAL_CURRENT_GAME_UNVERIFIED':'OWNER_APPROVED_VER_1_04',attackInput:stats.attack,attackComponents:{...attackParts},attackScope:'RESOLVED_ATTACK_FOR_PHYSICAL_AND_ATTACK_DEPENDENT_ELEMENT;RANGE_ADD_PHYSICAL_ONLY;ELEMENT_FLAT_OUTSIDE'}};
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
}
if(rapidMorphLevel>1){
 const rule=root.MHSaedGuardRapidMorphRule;
 if(!Object.hasOwn(rule?.predecessors||{},parameters.sourceTechniqueId)||state.previousAction!==rule.predecessors[parameters.sourceTechniqueId]||resolvedTechniqueIds.length!==rule.count)return {status:'unavailable',reason:'REAL_SLICE:CB_RAPID_MORPH_ORIGIN_UNRESOLVED'};
 bodyMind={...bodyMind,bodyAttackBasis:{...stats.attackComponents},bodyAttackMultiplier:(bodyMind.bodyAttackMultiplier??1)*rule.multiplierRule.multipliers[rapidMorphLevel],bodyAttackAdoption:{...bodyMind.bodyAttackAdoption,rapidMorph:{...rule,level:rapidMorphLevel}}};
}
r=root.ChargeBladeEngine.resolveTechniqueDamage(parameters.sourceTechniqueId,{...bodyMind,bodyHitAttackAdds:referencePunishingAdds(channel,parameters.sourceTechniqueId),bodyHitAffinityAdds:referenceDrawAdds(channel,parameters.sourceTechniqueId),baseAttack:Number(stats.attack),displayedElement:Number(stats.element||0),physicalHitzone:Number(part?.multipliers?.slash||0)*100,elementalHitzone:Number(build.elementType?part?.multipliers?.[build.elementType]||0:0)*100,sharpnessPhysical:sharp.sharpnessPhysicalMultiplier,sharpnessElement:sharp.sharpnessElementMultiplier,affinity:Number(stats.affinity),criticalMultiplier,negativeCriticalMultiplier:.75,elementCriticalMultiplier:build.equipment.criticalElementMultiplier,elementType:build.elementType||build.equipment?.elementType,elementKnown:true,typeKnown:true},state);}else if(kind==='bow'&&parameters.sourceTechniqueId==='BOW_THOUSAND_DRAGONS'){
 const result=root.BowReference.thousandDragons({attack:Number(stats.attack),affinity:Number(stats.affinity),criticalMultiplier,element:Number(stats.element),specialAmmoLevel:Math.max(0,...specialAmmoEntries.map(x=>x.level)),pierceUpLevel:Math.max(0,...thousandPierceEntries.map(x=>x.level)),state,physicalHitzone:Number(part?.multipliers?.pierce)*100},root.TechniqueDBEngine);
 return {status:'available',value:result.total,details:result};
}else if(kind==='bow'){if(typeof root.BowReference?.technique!=='function')return {status:'unavailable',reason:'REAL_SLICE:BOW_REFERENCE_UNAVAILABLE'};const hz=part?.multipliers?.pierce,ehz=build.elementType?part?.multipliers?.[build.elementType]:0;if(!Number.isFinite(hz)||Number(build.element||0)>0&&!Number.isFinite(ehz))return {status:'unavailable',reason:'REAL_SLICE:RANGED_HITZONE_UNRESOLVED'};const bowSkills=input.skills||{},fixedIds=root.TechniqueDBEngine.get('bow','BOW_STATE_MODIFIERS')?.specialSourceValues?.skillRules?.bladescaleLoading?.techniqueIds;
const singleFirstShot=resolvedTechniqueIds.length===1&&state.startShot===1&&Array.isArray(fixedIds)&&fixedIds.includes(resolvedTechniqueIds[0])&&Number(bowSkills.bladescaleLoading)===0;
const sequenceRequired=Number(bowSkills.bladescaleLoading)>0||Number(bowSkills.forceShot)>0;
if(sequenceRequired&&!singleFirstShot&&(!Array.isArray(fixedIds)||resolvedTechniqueIds.length!==fixedIds.length||resolvedTechniqueIds.some((id,i)=>id!==fixedIds[i])))return {status:'unavailable',reason:'REAL_SLICE:BOW_FIXED_THREE_SHOT_ROUTE_REQUIRED'};
// Match the existing maximum-condition policy; no uptime or arbitrary-shot assumption.
const active=channel==='maximum'&&Number(bowSkills.bladescaleLoading)>0;
const hitAffinityAdds=drawEntry?Object.fromEntries(resolvedTechniqueIds.map(id=>[id,referenceDrawAdds(channel,id)])):undefined;
const hitAttackAdds=punishingEntry?Object.fromEntries(resolvedTechniqueIds.map(id=>[id,referencePunishingAdds(channel,id)])):undefined;
const options={hitAttackAdds,hitAffinityAdds,attack:Number(stats.attack)+(state.range==='CRITICAL'?criticalRangeAttackAdd:0),criticalElementMultiplier:build.equipment.criticalElementMultiplier,element:stats.element,elementBasis:stats.elementComponents??null,skills:bowSkills,bladescaleLoadingActive:active,affinity:Number(stats.affinity),criticalMultiplier,physicalHitzone:hz*100,elementalHitzone:Number(ehz||0)*100,state};
if(sequenceRequired){
 const key=JSON.stringify({channel,options});let sequence=bowSequenceCache.get(key);
 if(!sequence){sequence=singleFirstShot?root.BowReference.technique(options,root.TechniqueDBEngine,resolvedTechniqueIds[0]):root.BowReference.standard(options,root.TechniqueDBEngine,resolvedTechniqueIds);bowSequenceCache.set(key,sequence);}
 const id=parameters.sourceTechniqueId,stage=resolvedTechniqueIds.indexOf(id),trace=sequence.trace.filter(hit=>hit.techniqueId===id);
 if(stage<0||!trace.length)return {status:'unavailable',reason:'REAL_SLICE:BOW_STAGE_UNRESOLVED'};
 const value=trace.reduce((sum,hit)=>sum+hit.physical+hit.element,0);
 return Number.isFinite(value)?{status:'available',value,details:{scope:singleFirstShot?'ADOPTED_BOW_SINGLE_FIRST_SHOT':'FIXED_THREE_SHOT_SOURCE_REFERENCE',effectiveDisplayedElement:sequence.effectiveDisplayedElement,elementBasis:sequence.elementBasis,physical:trace.reduce((n,h)=>n+h.physical,0),trace,forceShotStage:sequence.forceShot.stages[stage],bladescaleStage:sequence.bladescaleLoading.stages[stage]||null,bladescaleStatus:sequence.bladescaleLoading.status}}:{status:'unavailable',reason:'REAL_SLICE:BOW_STAGE_NON_FINITE'};
}
r=root.BowReference.technique(options,root.TechniqueDBEngine,parameters.sourceTechniqueId);
}else if(['LBG_NORMAL_RAPID_1','LBG_NORMAL_RAPID_2','LBG_NORMAL_RAPID_3','LBG_NORMAL_RAPID_NATIVE_3'].includes(parameters.sourceTechniqueId)){
 // The internal five-round budget advances after all five Hits. It is not the
 // weapon magazine or a user-maintained ordinal; each channel starts afresh.
 const sequenceOrdinal=rapidAmmoSequence?6-executionState?.lightBowgun?.loadedRounds:undefined;
 r=root.BowgunNormalReference.rapidHit({techniqueId:parameters.sourceTechniqueId,state,hitIndex:parameters.hitIndex,...(rapidAmmoSequence?{sequenceOrdinal,firstShot:input.skills.firstShot,forceShot:input.skills.forceShot}:{}),normalUp:Number(input.skills?.normalUp||0),attack:Number(stats.attack)+criticalRangeAttackAdd,affinity:Math.min(100,Number(stats.affinity)+wexFor(part,'pierce')),criticalMultiplier,physicalHitzone:part?.multipliers?.pierce*100,rapidUp:rapidEntries.length?rapidShotRule.skillLevel:0},rapidAmmoSequence?techniqueDb:root.TechniqueDBEngine);
}else{if(typeof root.BowgunNormalReference?.shot!=='function')return {status:'unavailable',reason:'REAL_SLICE:BOWGUN_REFERENCE_UNAVAILABLE'};const hz=part?.multipliers?.pierce,expected=Number(String(parameters.sourceTechniqueId).match(/^(?:HBG|LBG)_NORMAL_AMMO_([0-9]+)$/)?.[1]||0);if(!Number.isFinite(hz)||!Number.isInteger(state.ammoLevel)||state.ammoLevel!==expected)return {status:'unavailable',reason:'REAL_SLICE:BOWGUN_STATE_UNRESOLVED'};if(kind==='heavy-bowgun'&&(!state.weaponAmmoEntry||String(state.weaponAmmoEntry.kind).toLowerCase()!=='normal'||Number(state.weaponAmmoEntry.level)!==expected))return {status:'unavailable',reason:'REAL_SLICE:HBG_AMMO_NOT_SUPPORTED_BY_WEAPON'};if(state.ammoType!=='NORMAL'||state.range!=='CRITICAL'||state.contactPolicy!=='ALL_THREE'||!Number.isInteger(state.normalModeLevel)||state.normalModeLevel<0||state.normalModeLevel>2)return {status:'unavailable',reason:'REAL_SLICE:BOWGUN_STATE_UNRESOLVED'};r=root.BowgunNormalReference[normalAmmoSequence===NORMAL_FIVE_SHOT?'fiveShot':normalAmmoSequence?'tenShot':'shot']({hitAttackAdds:referencePunishingAdds(channel,parameters.sourceTechniqueId),hitAffinityAdds:referenceDrawAdds(channel,parameters.sourceTechniqueId),weaponKind:kind,attack:Number(stats.attack)+(state.range==='CRITICAL'?criticalRangeAttackAdd:0),affinity:Math.min(100,Number(stats.affinity)+wexFor(part,'pierce')),criticalMultiplier,physicalHitzone:hz*100,normalUp:Number(input.skills?.normalUp||0),firstShot:Number(input.skills?.firstShot||0),forceShot:Number(input.skills?.forceShot||0),state},root.TechniqueDBEngine);}const value=Number(r?.total??r?.comparisonPower);return Number.isFinite(value)?{status:'available',value,...(kind==='charge-blade-saed'?{details:{status:r.status,verificationStatus:r.verificationStatus,dps:r.dps,components:r.components,trace:r.trace}}:['bow','heavy-bowgun','light-bowgun'].includes(kind)?{details:{state:r.state,scope:r.scope||'FIXED_BOW_STANDARD_SOURCE_REFERENCE',trace:r.trace,...(r.sequence?{sequence:r.sequence,physical:r.physical,element:r.element}:{}),...(kind==='bow'?{effectiveDisplayedElement:r.effectiveDisplayedElement,elementBasis:r.elementBasis,physical:r.physical,element:r.element}:{})}}:{})}:{status:'unavailable',reason:'REAL_SLICE:REFERENCE_RESULT_UNRESOLVED'};}catch(error){return {status:'unavailable',reason:String(error?.message||error)}}}):null,
   canonicalPhysical:{expectedGameVersion:versions.game,
    resolveElementApplicability:saDragonEligible?({state,parameters})=>{const mode=parameters?.saHitMode;if(!['SWORD','AXE'].includes(mode)||state?.switchAxe?.mode!==mode)throw Error('SA_DRAGON_HIT_MODE_UNRESOLVED');return {applies:mode==='SWORD',reason:mode==='SWORD'?'SA_DRAGON_SWORD_PHIAL':'SA_DRAGON_AXE_NO_ELEMENT',evidenceRef:'https://kuroyonhon.com/mhwilds/memo/11.php'};}:undefined,
    resolveSharpness:({build,state,parameters})=>{if(parameters?.glSharpnessOverride)return {value:parameters.glSharpnessOverride.value,gameVersion:versions.game,evidenceRef:parameters.glSharpnessOverride.source,status:'PROVISIONAL'};if(bladescaleEligible&&state?.bladescaleFirstHit===true)return {value:bladescaleRule.physicalSharpness,gameVersion:versions.game,evidenceRef:bladescaleRule.coefficientSource,sourceGameVersion:bladescaleRule.sourceVersion,status:bladescaleRule.status};const r=root.MHWWeaponMaxSharpness.resolve(build.equipment,{rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]});if(!r.options)throw Error('REAL_SLICE:SHARPNESS_UNRESOLVED');return {value:r.options.sharpnessPhysicalMultiplier,gameVersion:versions.game,evidenceRef:r.options.sharpnessEvidenceRef,sourceGameVersion:build.equipment.provenance.sourceGameVersion,status:'PROVISIONAL'};},
    resolveElementSharpness:({build,parameters})=>{if(parameters?.glSharpnessOverride)return {value:parameters.glSharpnessOverride.value,gameVersion:versions.game,evidenceRef:parameters.glSharpnessOverride.source,status:'PROVISIONAL'};const r=root.MHWWeaponMaxSharpness.resolve(build.equipment,{rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]});if(!r.options)throw Error('REAL_SLICE:ELEMENT_SHARPNESS_UNRESOLVED');return {value:r.options.sharpnessElementMultiplier,gameVersion:versions.game,evidenceRef:r.options.sharpnessEvidenceRef,sourceGameVersion:build.equipment.provenance.sourceGameVersion,status:'PROVISIONAL'};},
    resolveHitzone:({parameters}={})=>{const key=parameters?.damageType||physicalKey,value=part.multipliers?.[key];if(typeof value!=='number'||!Number.isFinite(value))throw Error('REAL_SLICE:TRAINING_HITZONE_UNRESOLVED:'+key);return {value:value*100,gameVersion:versions.game,evidenceRef:`${targetData.sourceRef}:${key}`,sourceGameVersion:target.monster==='training-room'?provenance.sourceGameVersion:targetData.sourceGameVersion,status:targetData.status};},
    resolveElementHitzone:()=>{if(!elementSpecial)return {value:0,gameVersion:versions.game,evidenceRef:`${targetData.sourceRef}:none`,sourceGameVersion:target.monster==='training-room'?provenance.sourceGameVersion:targetData.sourceGameVersion,status:targetData.status};const value=part.multipliers?.[elementType];if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1)throw Error('REAL_SLICE:ELEMENT_HITZONE_UNRESOLVED');return {value:value*100,gameVersion:versions.game,evidenceRef:`${targetData.sourceRef}:${elementType}`,sourceGameVersion:target.monster==='training-room'?provenance.sourceGameVersion:targetData.sourceGameVersion,status:targetData.status};},
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
   'lance':lanceState,
   'switch-axe':switchAxeState
  }[weapon.kind]||null;
  for(const bundle of [selectedStateBundle]){
   if(!bundle||typeof bundle!=='object')continue;
   for(const [key,value] of Object.entries(bundle))if(!Object.prototype.hasOwnProperty.call(pipelineConditions,key)&&value!==null&&value!==undefined)pipelineConditions[key]=value;
  }
  if(normalAmmoSequence){
   // Ignored magazine inputs cannot change dedicated-sequence comparison identity.
   const key=weapon.kind==='light-bowgun'?'lightBowgunState':'hbgState';
   pipelineConditions[key]={...(pipelineConditions[key]||{})};
   for(const field of ['magazineCapacity','shotOrdinal','fullMagazine','loadedRounds']){delete pipelineConditions[field];delete pipelineConditions[key][field];}
   pipelineConditions.normalAmmoSequence={id:normalAmmoSequence,shotCount:normalAmmoSequence===NORMAL_FIVE_SHOT?5:10,magazinePolicy:'IGNORED_NO_RELOAD'};
  }
  if(rapidAmmoSequence){
   Object.assign(pipelineConditions,{lightBowgunState:{...(pipelineConditions.lightBowgunState||{})},rapidAmmoSequence:{consumedRounds:5,contactCount:25,resourceModel:'FIVE_ROUND_SEQUENCE_BUDGET_NOT_WEAPON_CAPACITY'}});
   for(const field of ['magazineCapacity','shotOrdinal','fullMagazine','loadedRounds']){delete pipelineConditions[field];delete pipelineConditions.lightBowgunState[field];}
  }
  const profileStartState=conditions?.standardEvaluation===true?root.BuildComparisonEngine?.profileCatalog?.[weapon.kind]?.startState||{}:{};
  if(conditions?.standardEvaluation===true){
   for(const id of resolvedTechniqueIds){
    const record=techniqueDb?.get?.(techniqueKind,id),requirement=record?.stateRequirement||{};
    for(const [key,expected] of Object.entries(requirement))if(!Object.prototype.hasOwnProperty.call(pipelineConditions,key)&&Object.prototype.hasOwnProperty.call(profileStartState,key)&&Object.is(profileStartState[key],expected))pipelineConditions[key]=profileStartState[key];
   }
  }
  if(stateStatsByState){pipelineConditions.stateStatsByState=stateStatsByState;pipelineConditions.stateStatsSource='MACARONGAMEMO_DAMAGE_UP_2025-04-16_PROVISIONAL';}
  try{const evaluated=pipeline.evaluate({schemaVersion:'v10-min2',build:{weapon:'current-selection'},target:{id:targetData.monsterId,hitZoneKey:targetData.partId},conditions:pipelineConditions,evaluation:{mode:'combo',kind:'combo',signature:'current-selection-reference-combo',techniqueIds:rapidAmmoSequence?Array(5).fill(resolvedTechniqueIds[0]):resolvedTechniqueIds}});
   if(glOrdinaryActive&&Object.values(evaluated.channels||{}).some(r=>!glOrdinaryResultValid(r)))return fail('REAL_SLICE:GL_ORDINARY_PRODUCED_COMPONENT_CONTRACT_INVALID');
   if(hhThunderZeroResolved&&Object.values(evaluated.channels||{}).some(r=>!hhChargeResultValid(r)))return fail('REAL_SLICE:HH_THUNDER_PRODUCED_COMPONENT_CONTRACT_INVALID');
   if(hhChargeNoElementResolved&&Object.values(evaluated.channels||{}).some(r=>!hhChargeResultValid(r)))return fail('REAL_SLICE:HH_CHARGE_PRODUCED_COMPONENT_CONTRACT_INVALID');
   if(target.monster!=='training-room'||target.part!=='training-front'){const {part:sourcePart,...targetEvidence}=targetData;evaluated.targetEvidence=targetEvidence;for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,targetEvidence};}
   if(normalAmmoSequence)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,normalAmmoSequence:{id:normalAmmoSequence,shotCount:normalAmmoSequence===NORMAL_FIVE_SHOT?5:10,contactCount:normalAmmoSequence===NORMAL_FIVE_SHOT?15:30,magazinePolicy:'IGNORED_NO_RELOAD',standardAdoption:normalAmmoSequence===NORMAL_FIVE_SHOT?'OWNER_APPROVED_NONRAPID_FIVE_ROUNDS':'PENDING_LEVEL_AND_LBG_RAPID_DECISION',source:'spec/CURRENT_CONTRACTS.md:C03',liveGameVerification:'PENDING'}};
   if(rapidAmmoSequence){
    const unappliedEffects=[];
    for(const result of Object.values(evaluated.channels||{})){
     result.diagnostics={...result.diagnostics,formalStatus:unappliedEffects.length?'PARTIAL_REFERENCE':'PROVISIONAL',unappliedEffects,nonApplicableEffects:[...[...rapidNonApplicableSkills].filter(x=>[2,47,69,94,109].includes(Number(x.skillId))).map(x=>({skillId:x.skillId,name:x.name,level:x.level,reason:'NON_TARGET_STANDARD_NORMAL_RAPID_AMMO'})),...[...rapidNonTargetBonuses].map(e=>({skillId:e.bonusSkillId,name:e.name,rank:e.rankLevel,reason:'LBG_STANDARD_NO_CLASH_OR_OFFSET'}))],rapidAmmoSequence:{consumedRounds:5,triggerCount:5,contactCount:25,magazinePolicy:'IGNORED_NO_RELOAD',resourceModel:'FIVE_ROUND_SEQUENCE_BUDGET_NOT_WEAPON_CAPACITY',liveGameVerification:'PENDING'}};
     if(result.metrics?.comboTotalDamage?.status==='available')result.metrics.comboTotalDamage={...result.metrics.comboTotalDamage,completeness:unappliedEffects.length?'PARTIAL_REFERENCE':'SOURCE_REFERENCE',unappliedEffects};
    }
   }
   // Rank-I GS waves are independent fixed-dragon source components. Do not
   // run weapon-element multipliers/caps on them. Maximum is limited to FULL_HP
   // and the fixed STANDARD route; per-hit/element interactions remain guarded.
   const darkWaveBonus=weapon.kind==='great-sword'?activeBonusEffects.find(e=>e.bonusSkillId===172&&e.name==='ダークアーツ'&&e.rankLevel===1):null;
   if(darkWaveBonus)for(const [channel,result] of Object.entries(evaluated.channels||{})){
    const note={skillId:172,name:'ダークアーツ追加波',level:1,channel,component:'GS_DARK_ARTS_WAVE',includedInPower:false,liveGameVerification:'PENDING'};
    try{
     if(result.metrics?.comboTotalDamage?.status!=='available')throw Error('DARK_ARTS_WAVE:BODY_UNAVAILABLE');
     const events=[];for(const [stageIndex,id] of resolvedTechniqueIds.entries()){
      const rule=techniqueDb.get('great-sword',id)?.sourceHitRules?.darkArtsWave;
      if(!rule||typeof rule.eligible!=='boolean'||rule.status!=='SOURCE_CONFIRMED'||rule.waveTechniqueId!=='GS_DARK_ARTS_WAVE'||rule.eventCount!==(rule.eligible?1:0))throw Error('DARK_ARTS_WAVE:TECHNIQUE_RULE_UNRESOLVED');
      if(rule.eligible){if(!['GS_CHARGED_SLASH_3','GS_STRONG_CHARGED_SLASH_3'].includes(id))throw Error('DARK_ARTS_WAVE:TECHNIQUE_SCOPE_PENDING');events.push({stageIndex,techniqueId:id});}
     }
     if(!events.length){result.diagnostics={...result.diagnostics,darkArtsWave:{...note,status:'NON_TARGET_TECHNIQUE',count:0}};continue;}
     if(channel!=='normal'&&!(channel==='maximum'&&conditions.standardEvaluation===true&&conditions.selectedHp==='FULL_HP'&&conditionPlan?.selectedHp==='FULL_HP'&&resolvedTechniqueIds.length===3&&resolvedTechniqueIds.every((id,i)=>id===['GS_CHARGED_SLASH_3','GS_STRONG_CHARGED_SLASH_3','GS_STRONG_WIDE_SLASH_3'][i])))throw Error('DARK_ARTS_WAVE:MAXIMUM_BUFF_INTERACTIONS_PENDING');
     if(allSkills.some(x=>[82,136].includes(Number(x.skillId))||['暗黒','Dark','チャージマスター','Charge Master'].includes(x.name)))throw Error('DARK_ARTS_WAVE:IN_ROUTE_SKILL_INTERACTION_PENDING');
     if(contextAttackEntries.length||explicitAffinityEntries.length||wexEffects.length||allSkills.some(x=>Number(x.skillId)===8))throw Error('DARK_ARTS_WAVE:PER_HIT_BUFF_INTERACTIONS_PENDING');
     if(Number(conditions.eCrit))throw Error('DARK_ARTS_WAVE:ELEMENT_CRITICAL_PENDING');
     if(!root.DarkArtsReference?.observed)throw Error('DARK_ARTS_WAVE:REFERENCE_MODULE_UNAVAILABLE');
     const sharp=root.MHWWeaponMaxSharpness.resolve(equipment,{rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]})?.options;
     if(!sharp)throw Error('DARK_ARTS_WAVE:SHARPNESS_UNRESOLVED');
     const n=channel==='maximum'?conditionPlan.maximum:(conditionPlan?.normal||stats),dragonHitzone=conditions.dragonHz!=null&&String(conditions.dragonHz).trim()!==''?Number(conditions.dragonHz):Number(part?.multipliers?.dragon)*100;
     const wave=root.DarkArtsReference.observed({attack:Number(n.attackTrue??n.attack),affinity:channel==='maximum'?Math.min(100,maximumAffinity):Number(n.affinity),criticalMultiplier:1.25+[0,.03,.06,.09,.12,.15][criticalBoostLevel],sharpness:sharp.sharpnessPhysicalMultiplier,elementSharpness:sharp.sharpnessElementMultiplier,physicalHitzone:Number(part?.multipliers?.slash)*100,dragonHitzone,dragonAttack:Math.max(0,...allSkills.filter(x=>x.skillKey==='dragon').map(x=>x.level)),count:1},techniqueDb);
     const added=events.flatMap(event=>['physical','element'].map(type=>({id:event.techniqueId+':'+type+':dark-arts-wave:'+event.stageIndex,eventId:event.stageIndex+':0',techniqueId:event.techniqueId,componentSource:'GS_DARK_ARTS_WAVE',source:wave.evidence.url,coefficientUnit:type==='physical'?'MV':'FIXED_DRAGON_DISPLAY',damageUnit:'damage',status:'available',value:wave[type],disposition:'emitted',effectsApplied:[],details:{...wave,damageIncluded:true,elementType:'dragon',parentStage:event.stageIndex}})));
     result.components.push(...added);result.metrics.comboTotalDamage={...result.metrics.comboTotalDamage,value:result.metrics.comboTotalDamage.value+wave.total*events.length};
     result.diagnostics={...result.diagnostics,darkArtsWave:{...note,status:'SOURCE_REFERENCE',includedInPower:true,count:events.length,physical:wave.physical*events.length,element:wave.element*events.length,evidence:wave.evidence,scope:channel==='maximum'?'RANK_I_FULL_HP_STANDARD_MAXIMUM_FIXED_DRAGON_INDEPENDENT_OF_WEAPON_ELEMENT':'RANK_I_NORMAL_ONLY_FIXED_DRAGON_INDEPENDENT_OF_WEAPON_ELEMENT'}};
    }catch(error){const reason=String(error.message||error);result.diagnostics={...result.diagnostics,darkArtsWave:{...note,status:'UNAVAILABLE',reason},calculationCompleteness:'PARTIAL_SKILL_EFFECTS',ignoredSkillEffects:[...(result.diagnostics?.ignoredSkillEffects||[]),{...note,status:'IGNORED_UNSUPPORTED_EFFECT',reason,preserveAdoptedBody:true}]};}
   }
   const originalConditionKey=evaluated.conditionKey;
   if(glTargetContext)for(const result of Object.values(evaluated.channels||{})){
    result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',glTarget:{rules:glTargetContext.rules,initialRounds:gunlanceState.loadedRounds,initialStakeLoaded:gunlanceState.stakeLoaded,capacity:glTargetContext.capacity,sourcePower:gunlanceState.shellingType+'_'+gunlanceState.shellingPower}};
   }

   if(bladescaleEntries.length)for(const [channel,result] of Object.entries(evaluated.channels||{}))result.diagnostics={...result.diagnostics,bladescaleFirstHit:{...bladescaleRule,eligible:bladescaleEligible,active:bladescaleEligible&&channel==='maximum',originalSharpness:maxSharpness}};
   if(conditionPlan?.selectedHpPolicy)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,selectedHpPolicy:conditionPlan.selectedHpPolicy};
   if(gogPlan)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,gogElementAdoption:root.MHGogElementRule};
   if(cornpopperEntries.length)for(const [channel,result] of Object.entries(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',cornpopper:{...cornpopperRule,active:channel==='maximum'}};
   if(blackEclipse)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,blackEclipse,formalStatus:'PROVISIONAL'};
   const normalSkillAnnotations=[...allSkills,...equippedSkills.filter(x=>x.skillId===152&&excludedCalculationPolicy(x))].filter(x=>annotationPolicy(x)&&![71,149,162].includes(x.skillId)).map(x=>({skill:x.name,skillId:x.skillId,level:x.level,policy:'FIXED_DAMAGE_SKILL_ANNOTATION_ONLY',excludedComponents:annotationPolicy(x).components,bodyEffect:annotationPolicy(x).bodyEffect,...(annotationPolicy(x).durationMultiplier?{durationMultiplier:annotationPolicy(x).durationMultiplier}:{}),evidenceRef:'MHDB_JA_SKILLS_20261026:'+x.skillId}));
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
   const excludedConditionalBuffs=[...new Map([
    ...([...new Map(equippedSkills.filter(x=>[67,75].includes(x.skillId)&&excludedCalculationPolicy(x)).sort((a,b)=>a.level-b.level).map(x=>[x.skillId,x])).values()]).map(x=>root.ownerExcludedConditionalBuffNote(x.skillId,x.level)),
    ...activeBonusEffects.filter(x=>x.bonusSkillId===25&&ownerExcludedBonus(x)).map(x=>root.ownerExcludedConditionalBuffNote(25,x.rankLevel))
   ].filter(Boolean).map(x=>[JSON.stringify(x),x])).values()];
   const maximumActivationAssumptions=(conditionPlan?.groupPlan?.applied||[]).filter(x=>x.attackAdd>0&&x.appliesToNormal===false&&x.maximumConditionNote).map(x=>x.maximumConditionNote);
   if(maximumActivationAssumptions.length&&evaluated.channels?.maximum)evaluated.channels.maximum.diagnostics={...evaluated.channels.maximum.diagnostics,maximumActivationAssumptions};
   if(excludedConditionalBuffs.length)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,excludedConditionalBuffs};
   if(excludedCalculationSkills.length)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,excludedCalculationSkills};
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
if(ed1Requested)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,resourceContracts:resourcePlans,resourceScope:hRequested?'OWNER_PROVISIONAL_H_EXPLICIT_STATE_ZERO_PREFIX_CONSUMPTION':'ADOPTED_RELEASE_ROUTE_ENHANCED_FIRST_EXPLICIT_STOCK'};
if(weapon.kind==='charge-blade'&&chargeBladeState?.axeBoosted===true&&techniques.CB_SWORD_TO_AXE_MORPH)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',techniqueAdoption:techniques.CB_SWORD_TO_AXE_MORPH.adoption};
if(rapidMorphLevel>1)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',rapidMorphAdoption:rapidRule};
if(resolvedTechniqueIds.includes('SNS_BASH_UPPERCUT'))for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',techniqueAdoption:techniques.SNS_BASH_UPPERCUT.adoption};
if(thunderAmmoScope&&resistanceConversionLevel)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,thunderAmmoConversion:{status:'SOURCE_BACKED_PROVISIONAL',source:'https://kuroyonhon.com/mhwilds/program/skill.php',orderSource:'https://kuroyonhon.com/mhwilds/memo/25.php',input:resistanceInput,coefficient:resistanceConversionCoefficient,scope:'THUNDER_AMMO_ONLY_FLAT_AFTER_ATTACK_DEPENDENT_TERM;OTHER_ADOPTED_ELEMENTS_NO_EFFECT',liveGameVerification:'PENDING'}};
if(gsChargeActive)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',chargeMasterAdoption:gsCharge};
if(weapon.artiaCalculationEvidence)for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',artiaAdoption:weapon.artiaCalculationEvidence};
   for(const result of Object.values(evaluated.channels||{}))result.diagnostics={...result.diagnostics,armorThunderResistanceInput:equipment.armorThunderResistanceInput};
   // Report executed body-element inputs, including CM, rather than reconstructing a pre-CM value.
   const conversionElementDiagnostic=result=>{
    const values=(result.components||[]).filter(c=>c.status==='available'&&(Number.isFinite(c.details?.appliedElement)||(attributeBowResolved&&Number.isFinite(c.details?.effectiveDisplayedElement)))).map(c=>({componentId:c.id,effectiveElement:c.details.appliedElement??c.details.effectiveDisplayedElement,uncappedElement:c.details.elementComponents?.uncapped??c.details.elementBasis?.uncapped,capLimit:c.details.elementComponents?.capLimit??c.details.elementBasis?.capLimit}));
    const common=key=>result.execution?.status==='complete'&&values.length&&values.every(x=>Number.isFinite(x[key])&&x[key]===values[0][key])?values[0][key]:null;
    return {effectiveElement:common('effectiveElement'),uncappedElement:common('uncappedElement'),capLimit:common('capLimit'),componentElements:values};
   };
   if(waterEntries.length)for(const [ch,result] of Object.entries(evaluated.channels||{})){const parts=(result.components||[]).filter(c=>c.status==='available'&&(Number.isFinite(c.details?.appliedElement)||Number.isFinite(c.details?.effectiveDisplayedElement))).map(c=>({componentId:c.id,effectiveElement:c.details.appliedElement??c.details.effectiveDisplayedElement,elementBasis:c.details.elementComponents??c.details.elementBasis}));result.diagnostics={...result.diagnostics,waterResistanceConversion:{...(waterZeroNoop?{zeroResistanceNoop:zeroConversionDiagnostic}:{}),input:waterInput,add:standardConversion&&ch==='normal'?0:waterConversionAdd,absorptionResistance:absorptionConversionPlan,absorptionAdd:ch==='maximum'?(absorptionConversionPlan?.status==='UNRESOLVED'?null:absorptionMaximumAdd):0,components:parts,effectiveElement:parts.length&&parts.every(x=>x.effectiveElement===parts[0].effectiveElement)?parts[0].effectiveElement:null,source:waterRule.source,adoptionStatus:waterRule.status,verificationStatus:'UNVERIFIED',scope:waterRule.scope}};}
   if(resistanceConversionLevel)for(const [ch,result] of Object.entries(evaluated.channels||{}))result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',thunderResistanceConversion:{...((thunderZeroNoop||hhThunderZeroResolved)?{zeroResistanceNoop:{...zeroConversionDiagnostic,...(hhThunderZeroResolved?{scope:'EXACT_HH_NORMAL_MELODY_ALL_COMPONENTS_ZERO_RESISTANCE'}:{})}}:{}),mixedComponentAdoption:weapon.kind==='charge-blade'&&officialPhialType==='IMPACT'?root.MHThunderConversionCbMixedScope:null,input:resistanceInput,absorptionResistance:absorptionConversionPlan,absorptionAdd:ch==='maximum'?(absorptionConversionPlan?.status==='UNRESOLVED'?null:absorptionMaximumAdd):0,baseElement:elementValue,...conversionElementDiagnostic(result),add:standardConversion&&ch==='normal'?0:resistanceConversionAdd,source:'https://kuroyonhon.com/mhwilds/program/skill.php',eligibilitySource:'https://kuroyonhon.com/mhwilds/memo/31.php',adoptionStatus:'OWNER_APPROVED_PROVISIONAL',verificationStatus:'UNVERIFIED',scope:conversionScope.scope,componentAdoption:conversionScope}};
   if(attributeConversionLevel)for(const [ch,result] of Object.entries(evaluated.channels||{})){result.diagnostics={...result.diagnostics,formalStatus:'PROVISIONAL',referenceOnly:true,referenceScope:conversionScope.scope,attributeConversion:{...attributeRule,componentAdoption:conversionScope,active:attributeState?.[ch]??null,baseElement:elementValue,...conversionElementDiagnostic(result),excludedComponents:['FIXED_FOLLOWUP','DRAGON_FOLLOWUP']}};if(result.metrics?.comboTotalDamage)result.metrics.comboTotalDamage.scope=attributeState?.[ch]===false?'CONVERSION_INACTIVE_REFERENCE':conversionScope.scope;}
   // Additive diagnostic only: the legacy effect-scope label is not a prohibition on mixed totals.
   if(attributeConversionLevel&&root.MHAttributeConversionMixedScope){
    const adoption=root.MHAttributeConversionMixedScope;
    const excludedEffectComponents=resolvedTechniqueIds.flatMap(id=>{
     const t=techniques[id];
     if(weapon.kind==='gunlance'&&adoption.shellActions.includes(t?.shellingAction))return [{techniqueId:id,component:'SHELL_DEDICATED_FIRE',effectDisposition:'NOT_APPLICABLE',totalDisposition:'INCLUDED_WHEN_COMPONENT_VALID'}];
     if(weapon.kind==='charge-blade'&&officialPhialType==='IMPACT'&&adoption.impactTechniqueIds.includes(id))return [{techniqueId:id,component:'IMPACT_PHIAL',effectDisposition:'NOT_APPLICABLE',totalDisposition:'INCLUDED_WHEN_COMPONENT_VALID'}];
     return [];
    });
    if(excludedEffectComponents.length)for(const result of Object.values(evaluated.channels||{}))result.diagnostics.attributeConversion.mixedComponentAdoption={...adoption,legacyEffectScope:conversionScope.scope,scopeInterpretation:'WEAPON_ELEMENT_EFFECT_ONLY;EXCLUDED_EFFECT_COMPONENTS_MAY_REMAIN_IN_VALID_TOTAL',excludedEffectComponents};
   }
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
 function evaluateIndependentCBMix(input){
  const state=input.chargeBladeState,profiles=root.ChargeBladeEngine?.profiles;
  const unavailable=reason=>({status:'UNAVAILABLE',reason,scope:'CB_INDEPENDENT_R_H_SUM'});
  if(input.weapon?.kind!=='charge-blade'||state.mixMode!=='R_H_INDEPENDENT')return unavailable('REAL_SLICE:CB_MIX_MODE_INVALID');
  const rIds=profiles?.RELEASE_ROUTE?.techniqueIds,hIds=profiles?.AED_ROUTE?.techniqueIds;
  const normalized=normalizeTechniqueIds(input.techniqueIds||[]);
  if(normalized.unresolved.length)return unavailable('REAL_SLICE:TECHNIQUE_ID_UNRESOLVED:'+normalized.unresolved.join(','));
  if(!rIds||!hIds||JSON.stringify(normalized.ids)!==JSON.stringify(rIds))return unavailable('REAL_SLICE:CB_MIX_R_PROFILE_REQUIRED');
  const {mixMode,mixH,...shared}=state;
  const routeStates={R:{...shared},H:{...shared,mode:mixH?.mode??null,previousAction:mixH?.previousAction??null,normalPhials:mixH?.normalPhials??null,enhancedPhials:mixH?.enhancedPhials??null}};
  const routes={};
  for(const [key,ids] of [['R',rIds],['H',hIds]]){
   const cb=routeStates[key];
   // A missing start is never supplied from the other route's end state.
   routes[key]=cb.mode!=='AXE'?{status:'UNAVAILABLE',reason:'REAL_SLICE:CB_MIX_EXPLICIT_AXE_START_REQUIRED'}:evaluateCurrent({...input,techniqueId:ids[0],techniqueIds:[...ids],chargeBladeState:cb,conditions:{...(input.conditions||{}),chargeBladeState:cb}});
  }
  const channels={};
  for(const ch of ['normal','maximum']){
   const parts=['R','H'].map(key=>({key,result:routes[key].channels?.[ch],reason:routes[key].reason}));
   const ready=parts.every(p=>p.result?.execution?.status==='complete'&&p.result.metrics?.comboTotalDamage?.status==='available'&&Number.isFinite(p.result.metrics.comboTotalDamage.value));
   const reason=ready?null:parts.filter(p=>p.result?.execution?.status!=='complete'||p.result.metrics?.comboTotalDamage?.status!=='available'||!Number.isFinite(p.result.metrics.comboTotalDamage.value)).map(p=>p.key+':'+(p.result?.execution?.reason||p.result?.metrics?.comboTotalDamage?.reason||p.reason||'ROUTE_UNAVAILABLE')).join(';');
   const excludedCalculationSkills=[...new Map(parts.flatMap(p=>p.result?.diagnostics?.excludedCalculationSkills||[]).map(x=>[JSON.stringify([x.skillId,x.name,x.level,x.reason,x.status]),x])).values()];
   channels[ch]={execution:{status:ready?'complete':'blocked',reason},metrics:{comboTotalDamage:ready?{status:'available',value:parts.reduce((sum,p)=>sum+p.result.metrics.comboTotalDamage.value,0),scope:'INDEPENDENT_ROUTE_RAW_SUM_NO_TIME'}:{status:'unavailable',reason}},components:[],finalState:{routes:Object.fromEntries(parts.map(p=>[p.key,p.result?.finalState??null]))},diagnostics:{formalStatus:'PROVISIONAL',scope:'CB_INDEPENDENT_R_H_SUM',routeTotals:Object.fromEntries(parts.map(p=>[p.key,p.result?.metrics?.comboTotalDamage??{status:'unavailable',reason:p.reason}])),independentStarts:routeStates,timeUsed:false}};
   if(excludedCalculationSkills.length)channels[ch].diagnostics.excludedCalculationSkills=excludedCalculationSkills;
   const excludedConditionalBuffs=[...new Map(parts.flatMap(p=>p.result?.diagnostics?.excludedConditionalBuffs||[]).map(x=>[JSON.stringify(x),x])).values()];
   if(excludedConditionalBuffs.length)channels[ch].diagnostics.excludedConditionalBuffs=excludedConditionalBuffs;
   const hpPolicies=parts.map(p=>p.result?.diagnostics?.selectedHpPolicy).filter(Boolean);if(hpPolicies.length&&hpPolicies.every(x=>JSON.stringify(x)===JSON.stringify(hpPolicies[0])))channels[ch].diagnostics.selectedHpPolicy=hpPolicies[0];
   const maximumActivationAssumptions=[...new Map(parts.flatMap(p=>p.result?.diagnostics?.maximumActivationAssumptions||[]).map(x=>[JSON.stringify(x),x])).values()];
   if(maximumActivationAssumptions.length)channels[ch].diagnostics.maximumActivationAssumptions=maximumActivationAssumptions;
   const excludedSkillDamage=[...new Map(parts.flatMap(p=>p.result?.diagnostics?.excludedSkillDamage||[]).filter(x=>x.skillId===152).map(x=>[JSON.stringify(x),x])).values()];
   if(excludedSkillDamage.length)channels[ch].diagnostics.excludedSkillDamage=excludedSkillDamage;
  }
  return {status:'OK',scope:'CB_INDEPENDENT_R_H_SUM',conditionKey:JSON.stringify({target:input.target,routeStates,r:rIds,h:hIds}),channels,routes};
 }
 const NORMAL_TEN_SHOT='NORMAL_TEN_SHOT_NO_RELOAD',NORMAL_FIVE_SHOT='LBG_NORMAL_FIVE_SHOT_NO_RELOAD';
 function normalTenShotIssue(input){
  const kind=input.weapon?.kind,key=kind==='light-bowgun'?'lightBowgunState':'hbgState',state=input[key];
  if(!['heavy-bowgun','light-bowgun'].includes(kind)||!inputRecord(state))return 'BOWGUN_TEN_SHOT:EXPLICIT_WEAPON_AND_STATE_REQUIRED';
  if(state.ammoType!=='NORMAL'||!Number.isInteger(state.ammoLevel)||!(kind==='light-bowgun'?[1,2]:[1,2,3]).includes(state.ammoLevel))return 'BOWGUN_TEN_SHOT:EXPLICIT_SUPPORTED_NORMAL_LEVEL_REQUIRED';
  if(state.range!=='CRITICAL'||state.normalModeLevel!==0||(kind==='heavy-bowgun'?state.contactPolicy!=null&&state.contactPolicy!=='ALL_THREE':state.contactPolicy!=='ALL_THREE')||input.conditions?.mounted===true||(kind==='light-bowgun'?state.shotMode!=='NORMAL':state.shotMode!=null&&state.shotMode!=='NORMAL'))return 'BOWGUN_TEN_SHOT:NON_RAPID_REFERENCE_STATE_REQUIRED';
  const ids=normalizeTechniqueIds(input.techniqueIds||[],{fallback:input.techniqueId}),expected=(kind==='light-bowgun'?'LBG':'HBG')+'_NORMAL_AMMO_'+state.ammoLevel;
  if(ids.unresolved.length||ids.ids.length!==1||ids.ids[0]!==expected)return 'BOWGUN_TEN_SHOT:SINGLE_MATCHING_NORMAL_TECHNIQUE_REQUIRED';
  if(!Array.isArray(input.weapon.ammo)||input.weapon.ammo.filter(a=>a?.kind==='normal'&&a.level===state.ammoLevel).length!==1)return 'BOWGUN_TEN_SHOT:WEAPON_AMMO_SUPPORT_UNRESOLVED';
  return null;
 }
 function evaluateNormalTenShot(input={}){
  if(!inputRecord(input))return fail('REAL_SLICE:INPUT_CONTEXT_INVALID');
  return evaluateCurrent({...input,normalAmmoSequence:NORMAL_TEN_SHOT});
 }
 function evaluateNormalFiveShot(input={}){
  if(!inputRecord(input))return fail('REAL_SLICE:INPUT_CONTEXT_INVALID');
  return evaluateCurrent({...input,normalAmmoSequence:NORMAL_FIVE_SHOT});
 }
 function evaluateRapidFiveShot(input={}){
  if(!inputRecord(input))return fail('REAL_SLICE:INPUT_CONTEXT_INVALID');
  return evaluateCurrent({...input,rapidAmmoSequence:'LBG_FIVE_ROUNDS_25_HITS'});
 }
 function evaluateCurrent(input={}){
  if(!inputRecord(input))return fail('REAL_SLICE:INPUT_CONTEXT_INVALID');
  if(['weapon','stats','target'].some(key=>!inputRecord(input[key]))||(input.conditions!==undefined&&!inputRecord(input.conditions)))return fail('REAL_SLICE:INPUT_CONTEXT_INVALID');
  if(input.normalAmmoSequence!==undefined&&input.normalAmmoSequence!==null){
   if(![NORMAL_TEN_SHOT,NORMAL_FIVE_SHOT].includes(input.normalAmmoSequence))return fail('BOWGUN_TEN_SHOT:POLICY_INVALID');
   if(input.normalAmmoSequence===NORMAL_FIVE_SHOT){
    const selection=root.BowgunNormalReference?.selectStandardAmmo(input.weapon,input.lightBowgunState||{});
    if(input.weapon.kind!=='light-bowgun'||!selection||selection.reason||selection.shotMode!=='NORMAL'||selection.shotCount!==5||selection.ammoLevel!==input.lightBowgunState?.ammoLevel)return fail('LBG_NORMAL_FIVE:EXACT_NONRAPID_WEAPON_REQUIRED');
   }
   const issue=normalTenShotIssue(input);if(issue)return fail(issue);
  }
  if(input.rapidAmmoSequence!=null){
   if(input.rapidAmmoSequence!=='LBG_FIVE_ROUNDS_25_HITS'||input.normalAmmoSequence!=null||input.weapon.kind!=='light-bowgun')return fail('LBG_RAPID_FIVE:POLICY_INVALID');
   const selection=root.BowgunNormalReference?.selectStandardAmmo(input.weapon,input.lightBowgunState||{}),ids=normalizeTechniqueIds(input.techniqueIds||[],{fallback:input.techniqueId});
   if(!selection||selection.reason)return fail(selection?.reason||'LBG_RAPID_FIVE:SOURCE_UNAVAILABLE');
   if(selection.shotMode!=='RAPID')return fail('LBG_RAPID_FIVE:RAPID_WEAPON_REQUIRED');
   if(ids.ids.length!==1||ids.ids[0]!==selection.techniqueId||input.lightBowgunState?.ammoLevel!==selection.ammoLevel)return fail('LBG_RAPID_FIVE:EXACT_WEAPON_LEVEL_ROUTE_REQUIRED');
  }
  const bonuses=input.stats.activeBonusEffects;
  if(bonuses!==undefined&&(!Array.isArray(bonuses)||bonuses.some(x=>!inputRecord(x))))return fail('REAL_SLICE:BONUS_SKILL_CONTAINER_INVALID');
  if(input.skills!==undefined&&(!Array.isArray(input.skills)||input.skills.some(x=>!Array.isArray(x)||x.length!==2||typeof x[0]!=='string'||!x[0])))return fail('REAL_SLICE:BUILD_SKILL_INPUT_INVALID');
  // HP is a shared input, not a channel choice. Reconcile only a stale HP
  // context; unchanged plans still pass through all existing source guards.
  const hpPlan=input.stats.conditionalConditionPlan,hpRaw=input.conditions?.selectedHp;
  const hpLegacy=hpRaw==null||hpRaw===''||hpRaw==='UNSELECTED',hpKnown=['FULL_HP','AT_OR_BELOW_30_PERCENT'].includes(hpRaw),hpSelected=hpKnown?hpRaw:hpLegacy?'FULL_HP':null;
  const hpInvalid=!hpLegacy&&!hpKnown;
  if(hpPlan?.selectedHpPolicy&&(hpInvalid||hpPlan.selectedHp!==hpSelected)&&typeof root.MHWStandardPowerConditionPlan==='function'){
   const conditions={...(input.conditions||{}),selectedHp:hpInvalid?hpRaw:hpSelected};
   const next=root.MHWStandardPowerConditionPlan(input.stats,Object.fromEntries(input.skills||[]),input.weapon.kind,conditions);
   // Preserve unrelated pending guards instead of laundering a supplied plan.
   next.pending=[...new Set([...(next.pending||[]),...(hpPlan.pending||[]).filter(x=>x!=='DARK_ARTS:FULL_HEALTH_BRANCH_COMPARISON_PENDING'&&x!=='火事場力:HEROICS_FULL_HEALTH_BRANCH_REQUIRED')])];
   next.selectedHpPolicy={...next.selectedHpPolicy,reconciliation:hpInvalid?'INVALID_SELECTED_HP_IGNORED':'SELECTED_HP_PLAN_REBUILT',description:next.selectedHpPolicy.description+(hpInvalid?'（不正なHP指定のためHP効果を未適用）':'（現在のHP選択から計画を再構成）')};
   input={...input,conditions,stats:{...input.stats,conditionalConditionPlan:next}};
  }
  if(input.weapon?.kind==='charge-blade'&&input.chargeBladeState?.mixMode)return evaluateIndependentCBMix(input);
  const original=evaluateCurrentSingleHealth(input);
  if(!original.channels)return original;
  const plan=input.stats?.conditionalConditionPlan;if(plan?.selectedHpPolicy)return original;const {dark,heroics}=healthBranchKinds(plan);
  const totals=Object.fromEntries(input.skills||[]),peak=Number(totals['フルチャージ']||totals['Peak Performance']||0);
  if((!dark&&!heroics)||!Number.isInteger(peak)||peak<=0)return original;
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
 root.MHWRealOneHitBrowserAdapter=Object.freeze({evaluateCurrent,evaluateNormalTenShot,evaluateNormalFiveShot,evaluateRapidFiveShot,normalizeTechniqueIds,resolveTarget});
})(typeof window!=='undefined'?window:globalThis);
