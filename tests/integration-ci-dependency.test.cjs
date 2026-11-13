'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'..'));
const source=fs.readFileSync(path.join(root,'.github/workflows/cb-gl-scope-regression.yml'),'utf8');
function job(text,name){const r=text.match(new RegExp('^  '+name+':\\n([\\s\\S]*?)(?=^  [\\w-]+:|$(?![\\s\\S]))','m'));assert.ok(r,'job must exist: '+name);return r[1];}
function validate(text){
 const part=job(text,'synthetic-partitions'),agg=job(text,'synthetic-boundaries');
 assert.match(part,/partition: \[heroics, resolved-attack, remainder\]/);assert.match(part,/fail-fast: false/);
 for(const [body,run] of [[part,'run: node tools/integration-regression/ci-partition.cjs run'],[agg,'run: node tools/integration-regression/ci-partition.cjs aggregate']]){const steps=body.split(/^      - /m).slice(1),i=steps.findIndex(s=>s.includes('run: npm ci --ignore-scripts')),j=steps.findIndex(s=>s.includes(run));assert.ok(i>=0&&j>i,'locked dependencies precede runner');assert.ok(!body.includes('continue-on-error:'),'failure must not be weakened');}
 assert.match(part,/REPORT_DIR: \$\{\{ runner.temp \}\}\/integrated-partition\/\$\{\{ matrix.partition \}\}/);
 const artifact=part.split(/^      - /m).find(s=>s.includes('uses: actions/upload-artifact@v4'));assert.ok(artifact);assert.match(artifact,/if: always\(\)/);
 assert.match(artifact,/name: integrated-\$\{\{ github.run_id \}\}-\$\{\{ github.run_attempt \}\}-\$\{\{ matrix.partition \}\}/);
 assert.match(artifact,/if-no-files-found: error/);
 const paths=artifact.split('          path: |\n')[1]?.trim().split('\n').map(s=>s.trim());assert.deepEqual(paths,['contract.json','receipt.json','summary.json','child-*.tap','child-*.stderr','runner.stdout','runner.stderr'].map(f=>'${{ runner.temp }}/integrated-partition/${{ matrix.partition }}/'+f),'only generated evidence');
 assert.match(agg,/needs: \[synthetic-partitions\]/);assert.match(agg,/if: always\(\)/);assert.match(agg,/run: test "\$PARTITION_RESULT" = success/);assert.match(agg,/PARTITION_RESULT: \$\{\{ needs.synthetic-partitions.result \}\}/);
 for(const n of ['heroics','resolved-attack','remainder'])assert.ok(agg.includes('name: integrated-${{ github.run_id }}-${{ github.run_attempt }}-'+n));
 assert.match(agg,/run: node --test tools\/cb-gl-scope-regression\/freshness.test.cjs/);
}
test('CI preserves installation, coverage, artifacts, final required gate and freshness',()=>validate(source));
test('reject absent or lifecycle-enabled installation',()=>{for(const r of ['echo absent','npm ci'])assert.throws(()=>validate(source.replace('npm ci --ignore-scripts',r)));});
test('reject broad or success-only evidence',()=>{assert.throws(()=>validate(source.replace('integrated-partition/${{ matrix.partition }}/child-*.stderr','**/*')));assert.throws(()=>validate(source.replace('if: always()','if: success()')));});
test('reject weakened child failure',()=>assert.throws(()=>validate(source.replace('  synthetic-partitions:\n','  synthetic-partitions:\n    continue-on-error: true\n'))));
test('reject missing aggregate dependency or failure gate',()=>{assert.throws(()=>validate(source.replace('needs: [synthetic-partitions]','needs: []')));assert.throws(()=>validate(source.replace('test "$PARTITION_RESULT" = success','echo ignored')));});
