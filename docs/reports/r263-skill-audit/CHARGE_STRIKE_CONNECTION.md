# ID83 限定暫定接続

OWNER_APPROVED_PROVISIONAL: HAM_MIGHTY_CHARGE_UPPERCUT本体物理のみ1.03。属性/他採用3技不変。原典アッパー除外との対応未確認、ユーザーゲーム検証待ち。未採用技へ拡張しない。

数値正本MHChargeStrikeRuleをindexに一箇所。adapterはID/name/Lv/hammer/明示4技を検証し、対象physical:0へcoefficient multiplyを供給。共通Formulaの既存丸め前で物理1.03、attack flatや属性へは掛けない。engine/bundle変更なし。

normal: target 98.28→101.23; total 286.01→288.96
maximum: target 98.28→101.23; total 286.01→288.96

公開入口の合成雷500付きHammer387契約入力。非対象3技と属性は完全一致、通常/最大成立、保存復元channels一致。不正Lv2/未知技は非成立。保存A/Bの新規実行なし。初回schema失敗と次回丸めassert失敗はexecution記録に保持。最終終了0。

出典 https://kuroyonhon.com/mhwilds/d/dame.php / https://kuroyonhon.com/mhwilds/program/skill.php 。採用承認 Sentinel_169c741a1990819189c688e5c01d000e。ソフトウェア検証を実ゲーム実証としない。分類40完全/38部分/7欠落/6注釈/88非火力、40/85は不変。commit/pushなし。
