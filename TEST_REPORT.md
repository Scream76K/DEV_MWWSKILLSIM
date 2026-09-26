# MHWilds Beta OCR Integrated r1.1.19 fix1

## UI修正
- 既存の防具・護石エディタ本体（#armorSelectors / #charmEditor）を、④スキル構成と同じワークスペース内の左ペインへ実移動。
- ③装備登録には武器UIだけを残し、防具・護石UIの重複表示を解消。
- 左ペインは頭→胴→腕→腰→脚→護石の縦1列。
- 左右ペインを独立スクロール。
- 既存のDOMノードを移動する方式のため、既存のrenderArmor/renderCharmEditorとイベントを維持。
- VERSION表示のOCR統合番号をr1.1.19へ統一。

## 静的テスト
- JavaScript `node --check`: OK
- #armorBuildWorkspace / #armorWorkspaceLeft / .skill-workspace-panel: OK
- 既存 #armorSelectors / #charmEditor / #charmLegality / #decorEditor をワークスペースへ移動する実装を確認。
- weapon UIは③装備登録側に残ることを確認。
