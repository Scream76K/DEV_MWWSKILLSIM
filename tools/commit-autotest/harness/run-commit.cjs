'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {prepareSnapshot,canonicalDestination,repositoryPaths}=require('./commit-snapshot.cjs');
const root=path.resolve(__dirname,'..');
const usage=`Usage: bash run-commit.sh --repo /path/to/git-repository --commit FULL_SHA --output NEW_DIRECTORY [--mode all-cases.cjs|gs-smoke.cjs|representative-14.cjs|isolation-preflight.cjs] [--prepare-only] [--database FILE] [--converter FILE] [--dependency-contract FILE]
Uses Git objects only. No checkout, fetch, push, automatic expectation updates or historical report fallback.
Changed runtime bytes require an explicit SHA-bound reviewed dependency contract. Exit 3 means incomplete or refused.\n`;
function run(args){
 if(args.length===1&&['--help','-h'].includes(args[0])){console.log(usage);return 0;}
 const o={toolRoot:root};let output,mode='all-cases.cjs',prepareOnly=false;
 const seen=new Set();for(let i=0;i<args.length;i++){const k=args[i];if(seen.has(k))throw Error('Duplicate option '+k);seen.add(k);if(k==='--prepare-only'){prepareOnly=true;continue;}const v=args[++i];if(!v||v.startsWith('--'))throw Error('Missing option value');if(k==='--output')output=path.resolve(v);else if(k==='--mode')mode=v;else{const key={'--repo':'repo','--commit':'commit','--database':'database','--converter':'converter','--dependency-contract':'dependencyContract'}[k];if(!key)throw Error('Unknown option '+k);o[key]=v;}}
 if(!output||!o.repo||!o.commit)throw Error(usage);
 if(!['all-cases.cjs','gs-smoke.cjs','representative-14.cjs','isolation-preflight.cjs'].includes(mode))throw Error('Unsupported mode');
 const [major,minor]=process.versions.node.split('.').map(Number);if(process.platform!=='linux'||major!==24||minor<13)throw Error('Linux Node 24.13+ (24.x) required');
 output=canonicalDestination(output);
 const repo=fs.realpathSync(o.repo);for(const p of [...repositoryPaths(repo),...['input','harness','dependencies','contracts'].map(n=>path.join(root,n))])if(output===p||output.startsWith(p+path.sep)||p.startsWith(output+path.sep))throw Error('Output must be outside repository and protected inputs');
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.mkdirSync(output);
 const status={schemaVersion:1,requestedCommit:o.commit,mode,startedAt:new Date().toISOString(),productCodeExecuted:false,status:'PREPARING',exitCode:3};
 try{
 o.snapshot=path.join(output,'snapshot');const m=prepareSnapshot(o);status.sourceCommit=m.sourceCommit;status.provenance=m;delete status.provenance.gitProof;
 if(prepareOnly){status.status='SNAPSHOT_READY_NOT_PRODUCT_TEST';status.exitCode=0;}
 else{const child=spawnSync('bash',[path.join(root,'run-isolated.sh'),mode,'--snapshot',o.snapshot,'--output',path.join(output,'results')],{stdio:'inherit'});status.exitCode=[0,2,3].includes(child.status)?child.status:3;status.error=child.error?.message||null;const p=path.join(output,'results/runner-status.json');const rs=fs.existsSync(p)?JSON.parse(fs.readFileSync(p)):null;status.productCodeExecuted=rs?.productCodeStarted===true;status.isolationPassed=rs?.isolationPassed===true;status.status=status.exitCode===3?'EXECUTION_INCOMPLETE':mode==='isolation-preflight.cjs'?'ISOLATION_ONLY_NOT_PRODUCT_TEST':'EXECUTED_WITHIN_DECLARED_SCOPE';}
 }catch(e){status.error=e.message;status.status=/ORACLE_NOT_APPLICABLE/.test(e.message)?'ORACLE_NOT_APPLICABLE':'PREPARATION_REFUSED';}
 status.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(output,'commit-run.json'),JSON.stringify(status,null,2)+'\n',{flag:'wx'});
 const summary=path.join(output,'results/日本語サマリー.txt');fs.writeFileSync(path.join(output,'日本語サマリー.txt'),`検査対象SHA: ${status.sourceCommit||status.requestedCommit}\n状態: ${status.status}\n終了コード: ${status.exitCode}\n製品コード実行: ${status.productCodeExecuted?'あり':'なし'}\n${status.error||''}\n${fs.existsSync(summary)?fs.readFileSync(summary,'utf8'):'未実行を成功扱いしません。'}\n`,{flag:'wx'});
 console.log(JSON.stringify({status:status.status,exitCode:status.exitCode,sourceCommit:status.sourceCommit||null,output}));return status.exitCode;
}
try{process.exitCode=run(process.argv.slice(2))}catch(e){console.error(e.message);process.exitCode=3}
