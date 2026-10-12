const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const d=JSON.parse(fs.readFileSync(path.join(__dirname,'../TECHNIQUE_INDEPENDENT_SOURCE_AUDIT_r225.json'),'utf8'));
test('37件の技を保持',()=>assert.equal(d.records.length,37));
test('重複IDなし',()=>assert.equal(new Set(d.records.map(x=>x.techniqueId)).size,37));
test('自動生成報告書を資料と誤認しない',()=>assert.ok(d.searchedFiles.every(x=>/^(TECHNIQUE_DB_SPEC_|CHARGE_BLADE_|IG_|DAMAGE_PROGRESS_)/.test(x))));
test('技ごとの参照は実在するファイルと行',()=>{for(const r of d.records)for(const x of r.independentLocalMentions){const f=path.join(__dirname,'..',x.file);assert.ok(fs.existsSync(f));assert.ok(x.line>0)}});
test('原典照合なしに確定・計測要求しない',()=>assert.ok(d.records.every(x=>!x.numericalConflictResolved&&!x.needsUserDecision&&!x.needsMeasurement)));
