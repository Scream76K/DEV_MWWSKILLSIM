# KAN-19/20 DATA監査 — heiter（ハイター）

2026-10-11 JST。対象 /Users/scream/Projects/DEV_MWWSKILLSIM-r250、codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5一致確認。作成は本報告のみ。製品・DB・tests編集0、Git/Jira変更0、元repo/GUILDアクセス0、再委任0。開始999ファイルは編集しない。全999件の最終保全ハッシュ検証はroot/QA担当であり、本担当が完了を主張しない。

## 正本の先行ライブ取得結果

取得方法: 承認付きNode fetch、公共read-only GET、認証無し、ファイル保存無し。2026-10-11 07:51 JST頃までに取得。通常sandboxの最初のENOTFOUNDをサービス停止とは断定せず、承認付きGET成功と区別。

- https://wilds.mhdb.io/ja/weapons?q=%7B%22kind%22%3A%22bow%22%7D&limit=250 HTTP200、弓87件。同名亡国のクピドバイン3件: id1139 raw攻撃200/display攻撃240/会心-10、id1140 180/216/15、id1141 190/228/0。全3件specials:[]、elementsフィールド無し。現行攻撃降順分類はattack1139/element1141/affinity1140。攻撃displayを属性displayへ転用しない。
- https://wilds.mhdb.io/ja/weapons/1141 HTTP200。個別レコードでもspecials:[]、elements不在、slots[3,3,3]。
- https://wilds.mhdb.io/ja/decorations?limit=250 HTTP200。id207 破龍・積弾珠【３】slot3/weapon、龍属性攻撃強化Lv3（説明:×1.2＋60）、フォースショットLv1。逆順id230積弾・破龍は龍Lv1/フォースLv3で別物。
- https://wilds.mhdb.io/version HTTP200、2026-04-15T01:28:18+00:00。importer更新時刻であり対象ゲーム版確認ではない。
- name条件検索はHTTP200空配列であり武器不存在の証拠にしない。

MHDBのArtia属性情報不在は確認済み0ではない。正しい基礎属性Eは未確定、独自数値補完無し。オーナー回答「テンプレ適用直後・設定変更なし」を受領。旧実装は欠損→0＋龍Lv3加算で60が成立したが、この算術一致は正しいゲーム属性値の証明ではない。

## 出典型とmodule契約

[MHDB公式API仕様](https://docs.wilds.mhdb.io/)のWeapons/WeaponSpecial/SpecialKind/WeaponStatusを今回webで照合。specialsは属性・状態異常を表す配列、kind tagged unionはelement→element、status→status、damageオブジェクトを持つ。例のparalysisはdamage.raw21/display210。raw-onlyからdisplayの独自換算を実装しない。

| 入力 | element-state.js根拠 | 今回メモリ内probe結果 |
|---|---|---|
| normal specials:[]・型選択なし | :40 | CONFIRMED_NONE、0、none |
| Artia specials:[]・dragon選択 | :20/:41 | UNKNOWN、null、typeKnown=true |
| 属性関連field全欠落 | :41 | UNKNOWN、null |
| raw-only属性 | :25/:36 | UNKNOWN、ELEMENT_DISPLAY_VALUE_MISSING |
| kind=status poison/paralysis/sleep/blast、display180 | :26/:4 | KNOWN180保持、hpElementだけ0、通常属性skillを適用しない |

これはAPI形状に対する実装契約確認であり、4statusの実ゲーム蓄積値180を採用するものではない。probeの180は合成入力。公式schema例paralysis21/210も単位構造の根拠で、他武器への代入不可。

通常の明示空配列を無属性として扱う契約はAPIの配列意味と整合。Artia例外とfield欠落unknownを維持。軽微境界: specials[]＋elements非配列という破損legacyはelements=null扱いでNONEへ到達し得る。正規MHDB形状を確認した範囲で可、破損入力全般の検証済みとは主張しない。rootへ共有済み。

## 完成値・parts・復元の境界

現行index.html（root同時編集中につき関数名を一次locator）artiaFixedRecord:802はmodule.fromRecord({artia:true})のstate保持へ移行。artiaFixedVariantStats:1666はattack/affinityを保持しつつ属性不明をnull/UNKNOWNに保つ。選択型が明示型に不一致なら保留。

normalizeTemplateArtiaProduction:7807はSALADAを含む全テンプレpartsをattack×3へ正規化する。保存SALADA_BOW_01のparts element×3とは実行時差があるが、production=element（属性激化）とelement=dragonは別字段で維持。既存完了値計算はartiaFixedVariantsを正本とし、生産parts/激化由来差分をさらに加算しない。restoreStats:1685は復元bonusだけを加算。SALADA01の復元atkEX/atkIII/atkIII/affEX/atkEXは属性復元無し。

同時編集中indexのweaponElementInfoFromRecord旧helperにraw fallback/status無視を確認しrootへ早期共有。呼出しを残す場合に新契約を外れるため最終統合で確認する。root作業途中の状態を完成版の欠陥確定とは扱わない。

## 型と映像・未確認

SALADA_BOW_01のdragonは現行テンプレ、10/2主武器5ビルド龍訂正notes、REGRESSION_GATES.txt:31の採用方針として確認。元 https://youtu.be/E5vkLlVN7gI の映像は未視認、verifiedへ昇格無し。「物理特化」から無属性を推測しない。副武器雷光珠は主武器属性根拠ではない。正しい基礎E・対象ゲーム版・元映像の所有部位が未確定。

## 実施・検証・引継ぎ

今回: cwd/branch/HEAD、module/tests仕様の読取、公式API schema web読取、メモリ内module probe。先行ライブGET結果を取得時条件付きで記録。tests runner未実行、root統合後の最終回帰未実行、ゲーム内検証未実行。module主要契約は照合上整合。最終index消費側・state保存/比較の安全性はroot/Frieren/QAで確認する。

報告統合可。基礎属性数値の確定は保留。次担当QAへ、unknownとconfirmedNone、正常status表示とHP属性寄与0を分け、旧正値fixtureと明示0の退行防止を確認するよう引継ぎ。独自ON/OFF条件・新属性数値正本・完成値への生産差分二重加算を追加しない。
