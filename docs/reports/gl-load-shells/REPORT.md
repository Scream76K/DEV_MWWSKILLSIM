# GL砲弾装填Lv2限定接続（2026-10-12）

## 実装

Technique DB既存GL_SHELL_NORMAL_MEDIUM.p0ReferenceRulesへloadShellsReference（採用Lv0/2、加算0/+1）を追加し専用Handlerが参照。通常/放射/拡散の上限はLv2で7/4/3。開始残弾を自動増加せず、入力/保存値のまま評価。
通常/溜め/FBの単発、参考FB、自由コンボへ共通接続。逐次消費、不足時全体保留、FB全残弾使用を保持。スキルなしへ戻して超過残弾が残れば未算出にし、自動的に6等へ丸めない。
Lv1は今回未採用なので保留。装填速度/時間効果をP0へ混ぜない。砲術付き通常は従来限定条件、砲術付き溜め/FBは保留。未照合食事等の補正は引き続き保留。
保存JSONのキーを追加せず、武器/装備スキルを復元して容量を再計算。旧保存のgunlanceState条件を変更せず維持。不明状態を満装填で補完しない。

## 根拠・状態

公式MHDB生成元Skill.json game_id802725120 rank2「GL装填数+1」とkuroyonhon技能表の一致、ユーザーのKAN-23#10124承認を根拠。evidenceRef=KAN23_LOAD_SHELLS_LV2_20261012、PROVISIONALLY_ADOPTED/UNVERIFIED。具体的ゲーム版の実機検証完了ではない。
https://github.com/LartTyler/mhdb-wilds-data/blob/c50a1eb892f4a1ad9bb35c147801658804be2cc2/output/merged/Skill.json
https://kuroyonhon.com/mhwilds/program/skill.php

## 変更

index.html：DBルール/証拠登録、スキル渡し、UI説明。固定max6を外し、型/スキル別の上限はHandlerで判定。
gunlance-shell-reference.js：DBによる容量加算/消費/証拠返却。
tests/gl-load-shells.test.cjs：4件追加。tools/gl-load-shells-dom.test.cjs：3件追加。
tools/gl-applicability-audit-dom.test.cjs：旧Lv2一律保留前提を、同じ開始残弾なら総量不変・自動満装填なしの厳密一致へ更新。Lv1/砲術未照合の保留は維持。根拠は今回承認された容量限定仕様。
本報告とHBG_SOURCE_CHECK.md/証跡。

## 検証

修正前失敗→修正後7件合格。3タイプ、拡張容量/上限超過、単発=自由、参考FB=自由、JSON復元、スキル撤去後の保留、部分装填不変、砲術付きFB保留を確認。期待値緩和・削除・skipなし。
アイゼン独立レビューは阻害事項なし。HBG/CB/徹甲数値と539レコードの既存戦闘値は変更せず、1レコードの新容量ルールだけ追加。HBG5爆発の根拠一致と版差未確定を独立文書へ記録、砲術接続なし。

## 残課題

HBG旧2Hitと現DB5爆発のイベント/版対応は未解明。GL砲術付き溜め/FB、攻撃補正併用、未対応砲撃力は保留。Safari実機未実施：Lv2の開始装填7/4/3入力、残弾1でも1発FB、保存復元、Lv2撤去後の超過保留、狭幅説明表示を確認する。
作業場所r250、codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5。原本/main/develop/GUILD変更、Git履歴操作、公開/Jira編集なし。

## Final regression evidence

| Suite | Pass | Fail | Skip |
|---|---:|---:|---:|
| Node | 853 | 0 | 0 |
| DOM | 465 | 0 | 0 |
| Browser / integration / OCR / template | 134 | 0 | 0 |
| Total | 1452 | 0 | 0 |

Baseline 1445 + 7 new tests. The old DOM expectation that Lv2 was always pending was updated to the approved capacity-only behavior; Lv1 and unsupported artillery combinations remain pending. Logs are in evidence/.

Preservation: 1395 baseline files; missing 0. Existing changed files: index.html, gunlance-shell-reference.js, tools/gl-applicability-audit-dom.test.cjs. All 539 old records equal after removing the single new capacity rule. HEAD unchanged; origin/develop remains 3 commits ahead. No commit, push, publication or Jira operation.
