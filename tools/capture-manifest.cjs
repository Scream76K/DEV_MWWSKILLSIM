'use strict';
// Evidence collection metadata only; never promotes a Technique DB value.
const weapons = [
 ['great-sword','大剣','STANDARD','溜め斬りⅢ→強溜めⅢ→強薙ぎ払いⅢ'],
 ['long-sword','太刀','STANDARD','赤刃斬りⅠ→Ⅱ→Ⅲ'],
 ['sword-and-shield','片手剣','STANDARD','斬り下ろし→横斬り→水平斬り→斬り返し'],
 ['dual-blades','双剣','STANDARD','乱舞Ⅰ→Ⅱ→Ⅲ（各Hit）'],
 ['hammer','ハンマー','STANDARD','横振り→縦振りⅡ→アッパー→渾身溜めアッパー'],
 ['hunting-horn','狩猟笛','PENDING','演奏攻撃・響音・追撃の内訳'],
 ['lance','ランス','STANDARD','中段突きⅠ→Ⅱ→Ⅲ→三段突き'],
 ['gunlance','ガンランス','PENDING','砲撃・フルバースト・竜杭砲の内訳'],
 ['switch-axe','スラッシュアックス','STANDARD','固定コンボの各Hitと状態'],
 ['charge-blade','チャージアックス','PENDING','属性解放・高出力・超高出力のビン別内訳'],
 ['insect-glaive','操虫棍','PENDING','多段Hit・猟虫追撃・エキス状態'],
 ['light-bowgun','ライトボウガン','PENDING','通常弾・速射のHitと射撃順'],
 ['heavy-bowgun','ヘビィボウガン','REFERENCE','通常弾3Hitとファースト／フォースショット'],
 ['bow','弓','STANDARD','溜め3→剛射→剛連射の矢ごとの命中']
];
const base = {gameVersion:'1.042.00.02',baseRevision:'r120',evidenceStatus:'AWAITING_INGAME',required:['装備画面・武器性能・発動スキルLv','トレーニングルームの対象部位・肉質条件','会心・距離・バフ・状態の条件','各Hitのダメージが読める映像','開始から終了までの連続映像（DPS用）']};
function manifest(){return {schemaVersion:1,...base,weaponCount:weapons.length,entries:weapons.map(([id,name,status,subject])=>({id,name,status,subject,filename:`r121_${id}_A_baseline.mp4`,control:'同一装備・同一部位・同一距離で比較',verified:false}))};}
if(require.main===module)process.stdout.write(JSON.stringify(manifest(),null,2)+'\n');
module.exports={manifest};
