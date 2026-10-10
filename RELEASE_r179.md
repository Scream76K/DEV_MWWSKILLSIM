# r179 Technique DB / damage-engine connection readiness
- Technique DB の canonicalTechniqueId を明示照合し、既存エンジン `hits()` を読み取り専用で接続する診断を追加。
- Legacy ID を canonical と誤認しない。未確認のHit数・属性補正はfail-closed。
- 技別のHit数とブロッカーをUIに表示。実測条件・検証済みダメージ式・時間の照合が未完成なのでDPSは算出・昇格しない。
- 比較画面の既存の計算や保存機能は変更しない。
