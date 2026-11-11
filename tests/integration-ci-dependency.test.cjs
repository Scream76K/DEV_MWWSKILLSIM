'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'..'));
const source=fs.readFileSync(path.join(root,'.github/workflows/cb-gl-scope-regression.yml'),'utf8');
function validate(text){
 const job=text.match(/^  synthetic-boundaries:\n([\s\S]*?)(?=^  [\w-]+:|$(?![\s\S]))/m)?.[1];assert.ok(job,'synthetic job must exist');
 const steps=job.split(/^      - /m).slice(1),run=steps.findIndex(s=>s.includes('run: node tools/integration-regression/run.cjs'));
 const install=steps.findIndex(s=>/^run: npm ci --ignore-scripts$/m.test(s.replace(/^        /gm,'')));
 assert.ok(install>=0&&run>install,'locked dependencies with scripts disabled must precede runner');
 assert.ok(steps[run].includes('REPORT_FILE: ${{ runner.temp }}/integrated-boundary-report/summary.json'),'runner report must use dedicated temporary directory');
 const artifact=steps.find(s=>s.includes('uses: actions/upload-artifact@v4'));assert.ok(artifact,'failure evidence must be retained');
 assert.match(artifact,/^        if: failure\(\)$/m);
 assert.match(artifact,/^          name: integrated-boundary-failure$/m);
 const paths=artifact.split('          path: |\n')[1]?.trim().split('\n').map(s=>s.trim());
 assert.deepEqual(paths,['${{ runner.temp }}/integrated-boundary-report/summary.json','${{ runner.temp }}/integrated-boundary-report/child-*.tap','${{ runner.temp }}/integrated-boundary-report/child-*.stderr'],'only generated test report/logs may be uploaded');
 assert.ok(!/continue-on-error:|if: always\(\)/.test(job),'failure must not be weakened');
}
test('integrated CI installs locked dependencies before runner and preserves bounded failure evidence',()=>validate(source));
test('dependency contract rejects absent installation',()=>assert.throws(()=>validate(source.replace('run: npm ci --ignore-scripts','run: echo missing')),/locked dependencies/));
test('dependency contract rejects lifecycle-enabled installation',()=>assert.throws(()=>validate(source.replace('run: npm ci --ignore-scripts','run: npm ci')),/locked dependencies/));
test('evidence contract rejects broad upload or successful-only upload',()=>{assert.throws(()=>validate(source.replace('integrated-boundary-report/child-*.stderr','**/*')),/only generated/);assert.throws(()=>validate(source.replace('if: failure()','if: success()')));});
test('evidence contract rejects ignored runner failure',()=>assert.throws(()=>validate(source.replace('  synthetic-boundaries:\n','  synthetic-boundaries:\n    continue-on-error: true\n')),/must not be weakened/));
