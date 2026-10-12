const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
test('r247 groups pending reasons without counting the same build multiple times',()=>{assert.match(html,/if\(!reasonCounts\[key\]\.builds\.includes\(item\.name\)\)/);assert.match(html,/buildCount:x\.builds\.length/);});
test('r247 summarizes three metric categories and orders causes',()=>{assert.match(html,/metrics:\{normal:0,maximum:0,dps:0\}/);assert.match(html,/sort\(\(a,b\)=>b\.metricCount-a\.metricCount/);});
test('r247 renders cause counts and preserves pending details in report',()=>{assert.match(html,/data-comparison-pending="r248"/);assert.match(html,/coverage\.causes\.map/);assert.match(html,/coverage:comparisonCoverageSummary/);assert.match(html,/release:'r249'/);});
