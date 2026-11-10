#!/bin/bash
# No simulator code is executed before the OS isolation preflight succeeds.
set -euo pipefail
work=$(cd -- "$(dirname -- "$0")" && pwd -P)
usage() { cat <<'HELP'
使い方: bash run-isolated.sh [all-cases.cjs|個別ハーネス] [--output 新しい出力ディレクトリ]
既定は隔離確認だけ。全件は bash run-all.sh。出力先は新規作成のみ。
Linux VM内で実行し、Linux用Node 24.13以降をPATHへ設定してください。
macOSネイティブでは動作しません。隔離確認に失敗すると製品処理を実行しません。
HELP
}
mode=isolation-preflight.cjs
if [[ ${1:-} == --help || ${1:-} == -h ]]; then usage; exit 0; fi
if [[ ${1:-} != --* && $# -gt 0 ]]; then mode=$1; shift; fi
case "$mode" in isolation-preflight.cjs|gs-smoke.cjs|representative-14.cjs|skill-smoke.cjs|skill-scan.cjs|skill-conditions.cjs|skill-conditions-smoke.cjs|resistance-conditions.cjs|resistance-conditions-smoke.cjs|uncalculated-diagnostics.cjs|v8-targeted.cjs|gl-affinity.cjs|gl-affinity-smoke.cjs|skill-technique.cjs|skill-technique-smoke.cjs|charge-master.cjs|charge-master-smoke.cjs|all-cases.cjs) ;; *) echo '未対応のハーネスです。' >&2; exit 3;; esac
out=""
snapshot=""
while (( $# )); do
 case "$1" in --snapshot) [[ $# -ge 2 && -n $2 && -z $snapshot ]] || { usage >&2; exit 3; }; snapshot=$2; shift 2;; --output) [[ $# -ge 2 && -n $2 ]] || { usage >&2; exit 3; }; out=$2; shift 2;; *) usage >&2; exit 3;; esac
done
[[ $(uname -s) == Linux ]] || { echo 'Linux VM内で実行してください。macOS上では製品処理を開始しません。' >&2; exit 3; }
for command in realpath unshare mount chroot setpriv tee mktemp; do command -v "$command" >/dev/null || { echo "必要なコマンドがありません: $command" >&2; exit 3; }; done
out=$(realpath -m -- "${out:-$work/output/runs/$(date -u +%Y%m%dT%H%M%SZ)-$$}")
for protected in "$work/input" "$work/harness" "$work/dependencies"; do
 [[ $out != "$protected" && $out != "$protected/"* && "$protected/" != "$out/"* ]] || { echo '出力先は入力・テストコード・依存ファイルと分離してください。' >&2; exit 3; }
done
mkdir -p -- "$(dirname -- "$out")"
mkdir -- "$out" || { echo '出力先が既に存在します。上書きせず停止しました。新しい名前を指定してください。' >&2; exit 3; }
echo "出力先: $out"
fail_setup() { printf '実行準備失敗: %s\n製品処理は開始していません。未実行を成功扱いしません。\n' "$*" | tee "$out/日本語サマリー.txt" >&2; exit 3; }
node=$(command -v node) || fail_setup 'Linux用Node 24.13以降をPATHに設定してください。'
node=$(realpath -- "$node")
"$node" -e 'const [major,minor]=process.versions.node.split(".").map(Number); if(process.platform!=="linux" || major!==24 || minor<13)process.exit(1)' || fail_setup 'Linux用Node 24.13以降（24系）が必要です。macOS用バイナリは使用できません。'
"$node" - "$out" "$mode" "$node" <<'META'
const fs=require('node:fs'),path=require('node:path');
const [out,mode,node]=process.argv.slice(2);
fs.writeFileSync(path.join(out,'runner-start.json'),JSON.stringify({startedAt:new Date().toISOString(),mode,nodeBinary:node,nodeVersion:process.version,platform:process.platform,architecture:process.arch,outputDirectory:out,previousCloudResultsReusedAsCurrent:false,macHostValidated:false,productCodeStarted:false},null,2)+'\n');
META
input_dir="$work/input"; harness_dir="$work/harness"
if [[ -n $snapshot ]]; then
 snapshot=$(realpath -- "$snapshot") || fail_setup 'snapshotを確認できません。'
 "$node" "$work/harness/commit-snapshot.cjs" validate --snapshot "$snapshot" || fail_setup 'snapshot整合性または期待値適用条件が不一致です。'
 input_dir="$snapshot/input"; harness_dir="$snapshot/harness"
 cp -- "$harness_dir/run-provenance.json" "$out/run-provenance.json"
fi
root=$(mktemp -d /tmp/mhwilds-test-root.XXXXXXXX) || fail_setup '隔離用一時ディレクトリを作れません。'
trap 'rmdir -- "$root" 2>/dev/null || true' EXIT
host_net=$(readlink /proc/self/ns/net); host_mnt=$(readlink /proc/self/ns/mnt)
set +e
unshare --user --map-root-user --mount --net --pid --fork /bin/bash -s -- "$work" "$node" "$host_net" "$host_mnt" "$mode" "$out" "$root" "$input_dir" "$harness_dir" 2>&1 <<'INNER' | tee "$out/runner.log"
set -euo pipefail
work=$1; node=$2; host_net=$3; host_mnt=$4; mode=$5; out=$6; root=$7; input_dir=$8; harness_dir=$9
mount --make-rprivate /
mount -t tmpfs -o mode=755,nosuid,nodev,uid=0,gid=0 tmpfs "$root"
mkdir -p "$root"/{usr,runtime,dependencies,input,output,harness,reference,tmp,proc,dev}
ln -s usr/lib "$root/lib"; ln -s usr/lib64 "$root/lib64"; ln -s usr/bin "$root/bin"
mount --bind /usr "$root/usr"; mount -o remount,bind,ro "$root/usr"
touch "$root/runtime/node"; mount --bind "$node" "$root/runtime/node"; mount -o remount,bind,ro "$root/runtime/node"
for name in input dependencies harness; do
 source="$work/$name"; [[ $name != input ]] || source="$input_dir"; [[ $name != harness ]] || source="$harness_dir"
 mount --bind "$source" "$root/$name"; mount -o remount,bind,ro "$root/$name"
done
# No historical reports are exposed. Keep an empty read-only mount for the isolation probe.
mount -t tmpfs -o mode=555,nosuid,nodev,ro tmpfs "$root/reference"
mount --bind "$out" "$root/output"
mount -t tmpfs -o mode=1777,nosuid,nodev,uid=0,gid=0 tmpfs "$root/tmp"
mount -t proc -o ro,nosuid,nodev,noexec proc "$root/proc"
touch "$root/dev/null" "$root/dev/urandom"
mount --bind /dev/null "$root/dev/null"; mount --bind /dev/urandom "$root/dev/urandom"
mount -o remount,bind,ro "$root"
cd "$root"
exec chroot "$root" /usr/bin/env -i HOME=/tmp PATH=/runtime:/usr/bin NODE_PATH=/dependencies/node_modules HOST_NET_NS="$host_net" HOST_MNT_NS="$host_mnt" HARNESS_MODE="$mode" /usr/bin/setpriv --bounding-set=-all --inh-caps=-all --ambient-caps=-all --no-new-privs /usr/bin/bash -c 'set -e; /runtime/node /harness/isolation-preflight.cjs; if [ "$HARNESS_MODE" != isolation-preflight.cjs ]; then /runtime/node -e '\''require("node:fs").writeFileSync("/output/product-stage-started.json",JSON.stringify({startedAt:new Date().toISOString(),mode:process.env.HARNESS_MODE})+"\n")'\''; /runtime/node "/harness/$HARNESS_MODE"; fi'
INNER
statuses=("${PIPESTATUS[@]}")
set -e
code=${statuses[0]}; [[ ${statuses[1]} == 0 ]] || code=3
"$node" - "$out" "$code" <<'FINISH'
const fs=require('node:fs'),path=require('node:path');const [out,code]=process.argv.slice(2);
const read=n=>{try{return JSON.parse(fs.readFileSync(path.join(out,n)))}catch{return null}};
const preflight=read('isolation-preflight.json'),started=read('product-stage-started.json'),all=read('all-cases.json');
const provenance=read('run-provenance.json');
const state={...read('runner-start.json'),sourceCommit:provenance?.sourceCommit||'5f1f733fc00c770073704c699ea7c2641a8bc9fb',finishedAt:new Date().toISOString(),isolationPassed:preflight?.result==='ISOLATION_PROBE_PASS_NOT_PRODUCT_TEST',productCodeStarted:!!started,exitCode:Number(code)};
if(!state.isolationPassed||![0,2,3].includes(state.exitCode))state.exitCode=3;
if(state.mode==='all-cases.cjs'&&!all)state.exitCode=3;
fs.writeFileSync(path.join(out,'runner-status.json'),JSON.stringify(state,null,2)+'\n');
const summary=path.join(out,'日本語サマリー.txt');
if(!fs.existsSync(summary))fs.writeFileSync(summary,(!state.isolationPassed?'隔離確認に失敗。製品処理は開始していません。':state.mode==='isolation-preflight.cjs'?'隔離確認のみ完了。製品テストは未実行。':`個別実行: ${state.mode} / 終了コード ${state.exitCode}。詳細JSONとrunner.logを参照。終了0でも数値正当性の全件成功ではありません。`)+`\n出力先: ${out}\nMacホスト・Linux ARM64 VMでの実検証とは別です。\n`);
console.log(`終了コード: ${state.exitCode}\n日本語サマリー: ${summary}\nログ: ${path.join(out,'runner.log')}`);process.exitCode=state.exitCode;
FINISH
