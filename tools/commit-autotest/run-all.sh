#!/bin/bash
set -euo pipefail
work=$(cd -- "$(dirname -- "$0")" && pwd)
if [[ ${1:-} == --help || ${1:-} == -h ]]; then
 echo '使い方: bash run-all.sh [--output 新しい出力ディレクトリ]'
 echo '14武器・対象スキルLv・大剣期待値・保存/A-B・追加診断を隔離して一括実行します。'
 echo '終了0: 設定した検査の問題なし（ゲーム正当性保証ではない）、2: 未算出/要確認/検査失敗あり、3: 実行不成立/途中失敗。'
 exit 0
fi
exec bash "$work/run-isolated.sh" all-cases.cjs "$@"
