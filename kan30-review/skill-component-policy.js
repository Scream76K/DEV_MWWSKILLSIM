/* KAN-27 approved policy; identities only, no combat coefficients. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.MHSkillComponentPolicy=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const parents=[
  {
    "name": "オメガレゾナンス",
    "sourceId": 31540,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "レゾナンスⅠ",
        "required": 2
      },
      {
        "level": 2,
        "name": "レゾナンスⅡ",
        "required": 4
      }
    ]
  },
  {
    "name": "兇爪竜の力",
    "sourceId": 918165056,
    "decision": "INCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "連撃強化Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "連撃強化Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "凍峰竜の反逆",
    "sourceId": -215826112,
    "decision": "INCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "束縛反攻Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "束縛反攻Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "千刃竜の闘志",
    "sourceId": 30992,
    "decision": "INCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "千刃の身躱しⅠ",
        "required": 2
      },
      {
        "level": 2,
        "name": "千刃の身躱しⅡ",
        "required": 4
      }
    ]
  },
  {
    "name": "夢灯の祈り",
    "sourceId": 11709,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "地の恵み【夢灯】Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "地の恵み【夢灯】Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "巨戟龍の黙示録",
    "sourceId": 5590,
    "decision": "INCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "宣戦呼応Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "宣戦呼応Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "暗器蛸の力",
    "sourceId": -1468066176,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "蛮勇の食卓Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "蛮勇の食卓Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "暗黒騎士の証",
    "sourceId": 24531,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "ダークアーツ",
        "required": 2
      },
      {
        "level": 2,
        "name": "ブラックナイト",
        "required": 4
      }
    ]
  },
  {
    "name": "泡狐竜の力",
    "sourceId": -403054144,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "泡沫の舞Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "泡沫の舞Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "波衣竜の守護",
    "sourceId": 2104075392,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "守護のヴェールⅠ",
        "required": 2
      },
      {
        "level": 2,
        "name": "守護のヴェールⅡ",
        "required": 4
      }
    ]
  },
  {
    "name": "海竜の渦雷",
    "sourceId": 16835,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "蒼雷一閃Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "蒼雷一閃Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "火竜の力",
    "sourceId": -3666104,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "灼熱化Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "灼熱化Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "煌雷竜の力",
    "sourceId": 539707072,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "雷々響鳴Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "雷々響鳴Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "獄焔蛸の反逆",
    "sourceId": 1980404096,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "恨撃Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "恨撃Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "白熾龍の脈動",
    "sourceId": -555494336,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "超回復力Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "超回復力Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "祝謡の祈り",
    "sourceId": 30815,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "地の恵み【祝謡】Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "地の恵み【祝謡】Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "花舞の祈り",
    "sourceId": -911441792,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "地の恵み【花舞】Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "地の恵み【花舞】Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "護鎖刃竜の命脈",
    "sourceId": -1432692352,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "破壊衝動Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "破壊衝動Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "踊火の祈り",
    "sourceId": 8694,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "地の恵み【踊火】Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "地の恵み【踊火】Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "鎖刃竜の飢餓",
    "sourceId": -964369920,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "加速再生Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "加速再生Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "鎧竜の守護",
    "sourceId": -418246240,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "無傷の重装Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "無傷の重装Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "闢獣の力",
    "sourceId": -62248528,
    "decision": "INCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "力自慢Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "力自慢Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "雪獅子の闘志",
    "sourceId": 741102208,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "ウォークライⅠ",
        "required": 2
      },
      {
        "level": 2,
        "name": "ウォークライⅡ",
        "required": 4
      }
    ]
  },
  {
    "name": "雷顎竜の闘志",
    "sourceId": -1768553344,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "無尽蔵Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "無尽蔵Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "黒蝕竜の力",
    "sourceId": 722735744,
    "decision": "INCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "黒蝕一体Ⅰ",
        "required": 2
      },
      {
        "level": 2,
        "name": "黒蝕一体Ⅱ",
        "required": 4
      }
    ]
  },
  {
    "name": "ヌシの憤激",
    "sourceId": 2107855744,
    "decision": "INCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "死中に活",
        "required": 3
      }
    ]
  },
  {
    "name": "ヌシの誇り",
    "sourceId": -1769550080,
    "decision": "INCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "激励",
        "required": 3
      }
    ]
  },
  {
    "name": "ヌシの魂",
    "sourceId": 1484575872,
    "decision": "INCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "根性【果敢】",
        "required": 3
      }
    ]
  },
  {
    "name": "先達の導き",
    "sourceId": -1642078720,
    "decision": "OUT_OF_SCOPE",
    "ranks": [
      {
        "level": 1,
        "name": "探索者の幸運",
        "required": 3
      }
    ]
  },
  {
    "name": "拳を極めし者",
    "sourceId": 4554,
    "decision": "INCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "殺意の波動",
        "required": 3
      }
    ]
  },
  {
    "name": "栄光の誉れ",
    "sourceId": 2237,
    "decision": "OUT_OF_SCOPE",
    "ranks": [
      {
        "level": 1,
        "name": "幸運",
        "required": 3
      }
    ]
  },
  {
    "name": "毛皮の昂揚",
    "sourceId": 1998066176,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "不屈",
        "required": 3
      }
    ]
  },
  {
    "name": "毛皮の誘惑",
    "sourceId": 583598144,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "陽動",
        "required": 3
      }
    ]
  },
  {
    "name": "甲虫の擬態",
    "sourceId": 1685697920,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "忍び歩き",
        "required": 3
      }
    ]
  },
  {
    "name": "甲虫の知らせ",
    "sourceId": 1968728576,
    "decision": "OUT_OF_SCOPE",
    "ranks": [
      {
        "level": 1,
        "name": "ハニーハンター",
        "required": 3
      }
    ]
  },
  {
    "name": "祝祭の巡り",
    "sourceId": 13941,
    "decision": "OUT_OF_SCOPE",
    "ranks": [
      {
        "level": 1,
        "name": "剥ぎ取り名人",
        "required": 3
      }
    ]
  },
  {
    "name": "護竜の守り",
    "sourceId": -2041451904,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "竜都の護り",
        "required": 3
      }
    ]
  },
  {
    "name": "護竜の脈動",
    "sourceId": -1305836672,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "竜乳活性",
        "required": 3
      }
    ]
  },
  {
    "name": "革細工の柔性",
    "sourceId": -1648695680,
    "decision": "OUT_OF_SCOPE",
    "ranks": [
      {
        "level": 1,
        "name": "採集の達人",
        "required": 3
      }
    ]
  },
  {
    "name": "革細工の滑性",
    "sourceId": 451472896,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "滑走強化",
        "required": 3
      }
    ]
  },
  {
    "name": "鱗張りの技法",
    "sourceId": 1487598336,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "乗り名人",
        "required": 3
      }
    ]
  },
  {
    "name": "鱗重ねの工夫",
    "sourceId": -1664678272,
    "decision": "EXCLUDE",
    "ranks": [
      {
        "level": 1,
        "name": "奮起",
        "required": 3
      }
    ]
  }
];
const revision='KAN27-10170-10176';
const deepFreeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(deepFreeze);Object.freeze(x);}return x;};
function identity(names=[],rankLevel=null){
 const matches=parents.filter(p=>names.includes(p.name)||p.ranks.some(r=>names.includes(r.name)));
 if(matches.length!==1)return null;
 const parent=matches[0],namedRanks=parent.ranks.filter(r=>names.includes(r.name));
 const rank=namedRanks.length===1?namedRanks[0]:parent.ranks.find(r=>r.level===rankLevel);
 if(!rank||namedRanks.length>1||(rankLevel!=null&&rank.level!==rankLevel))return null;
 return {parent,rank};
}
const adoptedComponents={
  '兇爪竜の力':['ATTACK','DURATION'], '凍峰竜の反逆':['ATTACK'],
  '千刃竜の闘志':['ATTACK','DURATION'], '巨戟龍の黙示録':['ELEMENT'],
  '闢獣の力':['ATTACK'], '黒蝕竜の力':['ATTACK','AFFINITY'],
  'ヌシの憤激':['ATTACK'], 'ヌシの誇り':['ATTACK'], 'ヌシの魂':['ATTACK'],
  '拳を極めし者':['ACTION_MODIFIER']
};
function resolve(name,component){
 const p=parents.find(x=>x.name===name);
 if(!p)return {decision:'UNRESOLVED',decisionRefs:[]};
 if(name==='海竜の渦雷')return {decision:component==='AFFINITY'?'INCLUDE':'EXCLUDE',decisionRefs:['10171']};
 if(name==='オメガレゾナンス')return {decision:'EXCLUDE',decisionRefs:['10172']};
 return {decision:p.decision==='INCLUDE'&&!adoptedComponents[name]?.includes(component)?'UNRESOLVED':p.decision==='OUT_OF_SCOPE'?'EXCLUDE':p.decision,decisionRefs:['10169','10170']};
}
return deepFreeze({revision,parents,counts:{INCLUDE:10,EXCLUDE:27,OUT_OF_SCOPE:5},identity,resolve});
});
