# KAN20 — stark（シュタルク）属性表示

対象r250 / codex/integrate-r249 / HEAD fb6d82cd525da9273af10ac6b719f330208608c5一致確認。starkは専有新規module/SVG/test/報告以外未編集。KAN18レイアウト・OCR・数値・DB・Git変更なし。

## 素材と仕様

assets/db_icons/既存報告を属性素材名で調査し、再利用できる9属性セットは特定できなかった。初回は文字指定のみで独自制作後、オーナー提供の参考画像を受領しview_imageで実視認した。**実画像の形状/色特徴を参考にした独自SVG案**であり画像切抜copy・完全再現verifiedではない。参考path: /var/folders/yd/1xd0cch51pq3n9xlmqz4q6y80000gn/T/codex-clipboard-f177a1da-b402-43c8-9aca-62c6b264762a.png、SHA256: 3c0db293961138da96a17f52cbe37da0276e4a6477f7b6ce277b51d1de12dd3c。第三者の切抜・ゲーム素材の転載なし。SVGは赤い炎/青滴/黄稲妻/cyan複数結晶/紫下向き龍印/紫3泡/黄2chevron/青ZZ/橙爆発の9形状。stunは対象外。各SVG24px viewBox・暗色台座で18-24px縮小を想定し、通常22px。色だけに依存せず形状で区別し、親のaria-labelへ日本語名と値を含める。

## 共通module契約

`window.MHWElementDisplay.render(state,{detail:false})` と `.label(key)`。内部英語キー、元state、JSON値を変更しない。入力はCALC state `{element,elementType,elementKnown,typeKnown,elementStatus,elementReason}`。

- KNOWN+有限非負number+elementKnown=true: 通常icon+値、詳細icon+日本語名+値。
- typeKnown=false/未知キー: 特定属性icon無し。「属性種別未確認」。既知値を保持。
- elementKnown=false/null/undefined/NaN/Infinity/負数/文字列/UNKNOWN: 「未算出」、accessible理由。null/空文字をNumber変換しない。
- CONFIRMED_NONE+elementKnown=true+0: icon無し。通常0、詳細無属性0。確定noneを未知値から推測しない。
- aria-label/titleの理由はescape。任意の入力typeをasset URLへ挿入しない。既知9キーだけSVG参照。imgはalt空＋aria-hidden、全体が日本語accessible nameを持つ。

## himmelへの統合案（製品編集はhimmelのみ）

本体main inline scriptより前に `<script src="./element-display.js"></script>`。summary属性gs-value、武器renderDetail属性値、renderCompareTableChunk属性セルへ共通render。比較cell関数はescするため属性行だけtrusted module HTMLをtdへ挿入し、既存compare-bestを保持。stats/row/snapshot.metadataへのstate供給はCALC共通契約を使用し、表示側でknown/noneを推測しない。

局所CSS案:

```css
.element-display{display:inline-flex;align-items:center;gap:4px;max-width:100%;flex-wrap:wrap}
.element-icon{width:22px;height:22px;flex:0 0 22px}
.element-label,.element-value{color:inherit}
```

## 回帰

先行tests/kan20-element-display.test.cjsを書き、未実装moduleに対するRED（require不可）をログ保存後に実装。9mappingとicon/HTML/accessibility、compact/detail、stun unknown、未知値を0補完しない、none0、既知0、escape、typeKnownfalse、stale number拒否にasset独立安全性/9形状distinctを加え18件が新規実行でGREEN。unit-red.log/unit-green.logを専有evidence/uiへ保存。元options不変を検査。

Browser画像・18/22/24px可読性・5幅表示はhimmel UI統合通知待ち。提供画像視認済みだが同一再現・画像verifiedとは主張しない。数値検証ではなく表示検証。統合後目視結果を追記する。

18/22/24pxの9種一覧PNG（icon-size-preview.png）を新規生成しview_image原寸確認。色以外に炎・滴・稲妻・結晶・龍印・3泡・2chevron・ZZ・burstの形状差を視認。5幅製品Browserはroot統合後の再委任待ちで、完了とはしない。

## 隔離Chromiumによる統合UI確認（2026-10-11）

対象は `/Users/scream/Projects/DEV_MWWSKILLSIM-r250` のみ。Safari/IABの既存セッションは操作せず、Playwright専用headless Chromiumを起動。変更前の `evidence/before-worktree.tar.gz` は `/private/tmp/kan19-20-ui-before` に展開して表示し、原本を上書きしていない。ローカルの製品JS/SVGを配信し、外部通信は遮断。製品index/module/SVGは検証担当から未編集。

`tools/kan19-20-ui-browser.cjs` を実行。合成武器・6通常スキル・既知9属性・未知値・未知種別・確定無属性0を与え、実製品の `renderSummary` / `renderDetail` / `renderCompareTable` を確認した。合成データによる表示検証であり、ゲーム実測数値の照合ではない。

| 幅 | ページ横幅 | 通常スキル | SVG9種 | 既知/未知/無属性 | pageerror |
|---:|---:|---|---|---|---:|
| 375 | 375 | 2列 | 読込成功 | 成功 | 0 |
| 390 | 390 | 2列 | 読込成功 | 成功 | 0 |
| 768 | 768 | 2列 | 読込成功 | 成功 | 0 |
| 1024 | 1024 | 2列 | 読込成功 | 成功 | 0 |
| 1440 | 1440 | 2列 | 読込成功 | 成功 | 0 |

- 既知9SVGの `naturalWidth/naturalHeight > 0` を確認。表示アイコンは22pxで全9種を読み込み、火はサマリー/詳細/比較の3か所で共通表示。
- サマリーは英語属性キーを表示せず、icon＋320。詳細はicon＋日本語の火＋320。比較も日本語accessible nameを保持。
- 未知値はサマリー/装備詳細/比較で「未算出」。null/0へ補完しない。未知種別は「属性種別未確認」で既知320を保持。確定無属性はiconなし0。
- 5幅でページ横はみ出しなし。通常スキルは各幅で2列を維持し、375px画像で各ブロックの名前とレベル枠を目視。比較表は局所スクロールを維持する。
- サマリー5幅と比較・スキル画像、独自9種18/22/24px一覧を目視。炎・滴・稲妻・結晶・龍印・泡・chevron・ZZ・burstの形状差を確認。提供画像との完全一致やゲーム素材としてのverifiedは主張しない。
- 768px以上のサマリーの「攻撃力」折返しはbefore画像にも存在し、今回の属性変更による退行ではない。KAN18レイアウトの修正はしていない。

証跡は `evidence/ui/browser.log`、`browser-results.json`。before/after各5幅の `before-375.png` 形式の全画面、`*-summary.png`、`*-comparison.png`、`*-skills.png` と、after各幅の `*-unknown-summary.png` を保存。結論：今回の属性共通UI・9SVGは統合可能。表示検証の未解決事項なし。実機ダメージ/素材の完全再現は本検証の対象外。
