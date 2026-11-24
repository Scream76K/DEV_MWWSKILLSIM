# 指定コンボの火力計算：レビュー仕様（2026-11-24 JST）

対象：この[ドラフト PR #4](https://github.com/Scream76K/DEV_MWWSKILLSIM/pull/4) の文書追加前のコード [`2083fec`](https://github.com/Scream76K/DEV_MWWSKILLSIM/commit/2083fec12c39c83dd0c060d008d0304346bd1be2)。比較先 `mainline` は `04cb00500b13595f714c2de2754e66c8dd22b7d9`。**本書の追加は計算コードの変更・修正の公開・マージではありません。**

## 最新の合意仕様

- **⑥ ビルド火力比較**：同一武器種・共通条件で保存ビルドを最大3件比較。通常と最大を独立計算し、合計・物理・属性を正規化せず小数1桁で表示。増減率は同一ビルドの通常から最大への変化。通常が0や未算出なら増減率を出さない。スキル由来の固定ダメージは通常・最大に共通する別欄に示し、それ自体を比較合計に混ぜない。コンボ名は結果表直上に「通常」「最大」を明記。
- **初期表示**：モンスター・部位はトレーニングルームを既定とし、その欄と「詳細設定」は別々に折りたたむ。最大火力に適用する条件スキルは詳細設定にまとめ、通常側にチェック欄を設けない。火事場は既定でOFF。
- **指定コンボ**：「コンボを自分で組む」は既定で折りたたみ、技は余計な説明を足さず、同じ技は必要な回数だけ行を追加。確定した技ID・順序で計算し、結果は通常の火力表と同じ表示形式。指定した技の代わりに標準技を実行して成功扱いにしない。標準比較と、現在の指定コンボと、保存条件からの再現は別経路として検証する。
- **開始条件**：必須の手入力を増やさない。技と武器から根拠のある初期値を決め、未入力のときだけ開始時に適用する。指定済みの値（ビンなし、射数・残数0、OFF、距離・ゲージ等）を上書きせず、後段ごとの補充もしない。旧データで未指定の条件が直前の別ビルドから漏れないこと。保存値は比較中に書き換えない。
- **ライトボウガンの標準比較**：適正距離で速射5回。武器固有の速射対応弾から通常・貫通・散弾の最高Lvを自動選択し、同Lvは通常→貫通→散弾。これは指定コンボには強制しない。
- **正確性**：通常・最大は独立し、技・武器・スキル・対象部位の条件を追跡できること。未登録技、係数の根拠不足、成立しない状態は区別して表示し、推測数値で埋めない。属性を落としたり、実際に発動するスキルを一律除外したりして見かけの成功にしない。

## 確認済み範囲と未実装の区別

| 対象 | 検証結果・注意 |
| --- | --- |
| 上記基準コード | 全14武器の代表装備、訓練場正面、既定状態で選択できる技123件を単体実行し、現在の指定コンボで通常・最大とも算出したのは24件。この条件に限定。技ID未接続の52件は初期値だけでは直らない。 |
| ローカル初期値候補（基準コードへ未反映） | 同一条件で24→40件、実際に選んだ技で両値が出る保存主表は22→37件、下段の指定通常は24→40件。標準14武器の技・数値は不変。候補の製品差分で本体テスト1,629件、最終差分の関連テスト19件合格。iPhone Safari実機・公開版は未更新。 |
| 保存比較の指定コンボ現状 | 下段「指定コンボ合計（暫定・参考）」は、**現在編集中の共通技順**を各保存装備へ適用した通常側の参考値。保存した技順ごとの再現でも、通常／最大の完全な主表でもない。ライトの標準速射結果は指定技の成功に数えない。 |
| 龍372の竜の千々矢 | 下記2ビルドでは基準・初期値候補とも未算出。属性対応とスキル処理を含む修正の受入は未完了。 |

## 最優先の再現：竜の千々矢

1. 弓の同梱テンプレート `KOTATU_BOW_01` と `SALADA_BOW_05` をそれぞれ読み込む。どちらも武器ID `1139`（亡国のクピドバイン）、表示属性 龍372、フォースショットLv1。真攻撃力は順に235、247。個人の保存データは不要。
2. トレーニングルーム／正面、**ビンなし・適正距離・1射目**を明示。まず「竜の千々矢」単体を、選択技単独と1行の指定コンボの両方から計算する。その後、別ケースで「剛射3 → 剛連射3 → 竜の千々矢」。
3. 基準コードの単体は、明示したビンなしが計算直前に貫通ビンへ変わり、両側 `BOW_THOUSAND:STATE_NOT_ADOPTED`。初期値候補はビンなしを維持するが、両側 `BOW_THOUSAND:SKILL_COMBINATION_NOT_ADOPTED`。候補の3技は両側 `BOW_THOUSAND:UNVERIFIED_MIXED_RESOURCE`。別の属性の非対応判定もあり、フォースショットだけを原因と断定しない。
4. 対照：無属性ホープボウⅠの単体は、基準コードでは明示NONEが強撃ビンに上書きされ未算出。初期値候補ではビンなしの6ヒットで通常／最大とも118.8、属性0（参考計算、実機値ではない）。

### レビューで見てほしいこと

1. 明示値→開始値→各ヒット→火力表の全経路で、同じ技ID、距離、ビン、対象と通常／最大が渡るか。現行コードでは [UIと計画](../../index.html)、[計算アダプター](../../hope-hammer-browser-adapter.js)、[弓参照式](../../bow-reference.js) を照合する。
2. 龍372双方で単体6ヒットと3技が計算され、属性肉質が正の対象で龍ダメージが消えず、物理と龍を分けて表示できるか。既知の龍肉質0と、龍肉質が取得できないケースは別の扱いになっているか。
3. 条件の成立しないフォースショットを適用しない判定と、ビン装填時など条件が成立する経路を壊さない判定が分かれているか。散弾・剛射強化は適用技だけに効かせ、根拠のないスキル除外をしない。弓の無属性対照、未採用のビン・距離、導ノ矢・騎乗状態、既存14武器の標準結果も確認する。
4. 収録データ上の無装填・導ノ矢なし候補は6ヒット、各物理モーション値25・各属性補正0.5。属性付きの経路を暫定採用するなら、対象バージョン・出典・検証状態を残し、ゲーム実機で確定済みとしない。関連資料：[くろよんほん・弓](https://kuroyonhon.com/mhwilds/memo/16.php#106)、[弓のモーション値の検証](https://macarongamemo.com/entry/mhwilds-bow-motion)。

### 単体の再現スクリプト

基準リビジョンのルートで Node.js 24 と `npm ci` を使用。下のコードをリポジトリルートの一時ファイル `review-thousand.cjs` に保存し、`node review-thousand.cjs .` を実行。オフラインの同梱データで両ボタンを通し、確定条件、通常／最大、画面表示をJSONへ出す。これは**不具合再現用**で、合格を宣言する回帰テストではない。

```javascript
const assert=require('node:assert/strict'), path=require('node:path'), fs=require('node:fs'), crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.argv[2]), cache='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json';
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
assert.equal(sha(cache),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
const pack=require(path.join(root,cache)), readHtml=require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml;
const out={hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','bow-reference.js',cache].map(k=>[k,sha(k)])),cases:[]};
for (const id of ['KOTATU_BOW_01','SALADA_BOW_05','HOPE_BOW_I']) {
 const vc=new VirtualConsole(), errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readHtml(),{url:'https://thousand-alone.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('NETWORK_DISABLED'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 try {
 const $=id=>w.document.getElementById(id), choose=(el,val)=>{el.value=val;assert.equal(el.value,val,el.id);el.dispatchEvent(new w.Event('change',{bubbles:true}));}, read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 w.__archivedDB=w.JSON.parse(JSON.stringify(pack.data));
 w.eval('DB=normalizeDB(window.__archivedDB);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();window.__renderBuildTemplateUI();');
 if(id==='HOPE_BOW_I'){
   choose($('weaponKind'),'bow');choose($('weapon'),'1');
 }else{
   choose($('buildTemplateWeaponKind'),'bow');choose($('buildTemplateSelect'),id);$('loadBuildTemplate').click();
 }
 choose($('monster'),'training-room'); choose($('monsterPart'),'training-front');
 const status=$('buildTemplateStatus').textContent;
 for(const row of [...$('combo').children]){const b=row.querySelector('button[title="削除"]')||[...row.querySelectorAll('button')].find(x=>x.textContent.includes('削除')); if(b)b.click();}
 if($('combo').querySelectorAll('.cmove').length)w.eval('App.state.combo.moves=[];restoreComboRows();');
 const picker=$('comboMovePicker'), option=[...picker.options].find(x=>x.value==='canonical:BOW_THOUSAND_DRAGONS');
 assert.ok(option?.textContent.includes('竜の千々矢'));choose(picker,option.value);$('addCombo').click();
 assert.deepEqual(read('App.state.combo.moves').map(x=>x.techniqueId),['canonical:BOW_THOUSAND_DRAGONS']);
 choose($('powerBowCoating'),'NONE');choose($('powerBowRange'),'CRITICAL'); if(!process.env.QA_NO_START)choose($('powerBowStartShot'),'1');
 const positions=read('({weapon:selectedWeapon().name,kind:selectedWeapon().kind,element:calcState.stats.element,elementType:calcState.stats.elementType,force:calcState.total["フォースショット"]||0,skills:calcState.total,moves:App.state.combo.moves.map(x=>x.techniqueId),state:{coating:powerBowCoating.value,range:powerBowRange.value}})');
 positions.planState=read("consumerEvaluationPlan('bow',[{techniqueId:'BOW_THOUSAND_DRAGONS'}],compareStep5Snapshot(),{monster:'training-room',part:'training-front'}).conditions.bowState");
 assert.equal(positions.kind,'bow');assert.equal(positions.state.coating,'NONE');assert.equal(positions.state.range,'CRITICAL');
 if(id==='HOPE_BOW_I'){assert.match(positions.weapon,/ホープボウ/);assert.ok(!positions.element);}
 else {assert.match(status,/読み込み/);assert.equal(positions.element,372);assert.equal(positions.elementType,'dragon');assert.equal(positions.force,1);}
 $('calcUserComboDamage').click();
 const ui=$('compareOut'); assert.equal(ui.dataset.resultMode,'current-custom');
 const summarize=p=>!p?.channels?p:({reason:p.reason??null,channels:Object.fromEntries(['normal','maximum'].map(c=>{const v=p.channels[c];return [c,{execution:v.execution?.status,metric:v.metrics.comboTotalDamage,components:v.components.map(c=>({technique:c.techniqueId,status:c.status,hitCount:c.details?.hitCount,value:c.value,physical:c.details?.physical,element:c.details?.elemental}))}];}))});
 const result=w.calcP0Damage('user');
 $('calcSelectedTechniqueDamage').click(); const single=w.calcP0Damage('single');
 out.cases.push({id,status,positions,current:summarize(result.pipeline),currentUI:ui.textContent.replace(/\s+/gu,' ').trim(),single:summarize(single.pipeline),singleUI:$('singleTechniqueDamageOut').textContent.replace(/\s+/gu,' ').trim(),errors});
 }finally{w.close();}
}
console.log(JSON.stringify(out,null,2));
```
