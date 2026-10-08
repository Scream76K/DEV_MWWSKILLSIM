# r126 — チャアク計算経路の入力検証修正

r125基準。`chargeBladeTechniqueComponents` の高速変形Lvが不正でも0〜3へ暗黙丸めされる挙動を修正。未指定はLv0、指定値は0〜3の整数のみ許可し、範囲外・小数・非数値は fail-closed。Technique DB数値・既存コンボ・UIは変更なし。新規テスト3件。実機検証とブラウザテストは未実施。
