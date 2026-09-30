MHWilds v7.2.1 TEMPLATE ROOTFIX

今回の回帰修正:
- ビルドテンプレート反映処理で必要な武器・防具のMHDB照合関数(templateFindWeapon/templateFindArmor)が前回の護石種類撤去時に誤って削除されていた問題を復元。
- 護石の種類/name依存ロジック(templateFindCharm/templateCharmNorm)は復元していない。
- 護石は skills + slot_levels + slot_kinds + decorations のみで処理。
- テンプレートDBは19件を維持し、構造修正版として version 2.4-v15.1-charm-type-free に更新。
- 起動時に大剣テンプレートの武器・防具照合回帰テストを追加。

GitHubにはこのZIP内の index.html をアップロードしてください。
