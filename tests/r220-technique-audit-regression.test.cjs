const {test}=require('node:test');const assert=require('node:assert/strict');const {report,kinds,engine}=require('./r220-technique-audit.cjs');
test('audit enumerates all 14 weapon types',()=>assert.deepEqual(report().map(x=>x.kind),kinds));
test('registered equals calculable plus blocked for every weapon',()=>{for(const r of report())assert.equal(r.registered,r.calculable+r.blocked,r.kind)});
test('audit never promotes source-conflicted data to calculable',()=>{for(const kind of kinds)for(const t of Object.values(engine.db[kind]))if(t.numericStatus==='SOURCE_CONFLICT')assert.throws(()=>engine.hits(kind,t.techniqueId),/FAIL_CLOSED/)});
test('audit reports evidence gaps without modifying source data',()=>{const before=JSON.stringify(engine.db);report();assert.equal(JSON.stringify(engine.db),before)});
test('blocked examples reference real records',()=>{for(const r of report())for(const ex of r.examples)assert.ok(engine.get(r.kind,ex.id))});
