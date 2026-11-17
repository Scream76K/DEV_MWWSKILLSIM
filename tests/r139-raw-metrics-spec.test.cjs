const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const chunk=app.slice(app.indexOf('function renderCompareTableChunk('),app.indexOf('let lastBuildComparisonRows='));
test('raw normal and maximum are the main metrics',()=>{assert.match(chunk,/火力指数（計算値）/);assert.match(chunk,/最大火力指数（計算値）/);assert.match(chunk,/comparisonDisplayNumber\(value\)/);assert.doesNotMatch(chunk,/火力指数（基準100）/);});
test('raw metric reads each row, independent of baseline and legacy cached numbers',()=>{
 const {createContext}=require('../tools/legacy-page-test-context.cjs');
 const c=createContext({}),channel=value=>({execution:{status:'complete'},metrics:{comboTotalDamage:{status:'available',value}}});
 const make=(name,normal,maximum)=>({name,kind:'great-sword',power:{profileId:'fixture',normal:{comparisonPower:999},maximum:{comparisonPower:999}},oneHitPipeline:{channels:{normal:channel(normal),maximum:channel(maximum)}}});
 const rows=[make('A',123.45,234.56),make('B',246.89,345.67)];
 const metric=(html,key)=>html.match(new RegExp('<tr data-comparison-metric="'+key+'">[\\s\\S]*?</tr>'))[0];
 const a=c.renderCompareTableChunk(rows,rows,rows[0]),b=c.renderCompareTableChunk(rows,rows,rows[1]);
 for(const key of ['power-index','max-power-index']){assert.equal(metric(a,key),metric(b,key));assert.doesNotMatch(metric(a,key),/999/);}
 assert.match(metric(a,'power-index'),/123\.5/);assert.match(metric(a,'power-index'),/246\.9/);
 assert.match(metric(a,'max-power-index'),/234\.6/);assert.match(metric(a,'max-power-index'),/345\.7/);
 rows[1].oneHitPipeline.channels.maximum={execution:{status:'blocked',reason:'TEST_PENDING'},metrics:{comboTotalDamage:{status:'unavailable',reason:'TEST_PENDING'}}};
 assert.equal(c.consumerDamageMetric(rows[1],'maximum').value,null);
 assert.equal(c.consumerDamageMetric(rows[1],'normal').value,246.89);
 const blocked=c.renderCompareTableChunk(rows,rows,rows[0]);assert.doesNotMatch(metric(blocked,'max-power-index'),/345\.7|999/);
});
test('relative changes have separate rows',()=>{assert.match(chunk,/data-comparison-metric/);assert.match(chunk,/comparisonPowerChange\(r,baseline\)/);});
test('report exports raw values and separate changes',()=>{assert.match(app,/powerIndex:row\.power\?\.normal\?\.comparisonPower/);assert.match(app,/maxPowerIndex:row\.power\?\.maximum\?\.comparisonPower/);assert.match(app,/release:'r140'/);});
test('accepted spec is bundled',()=>{const spec=fs.readFileSync(path.join(__dirname,'..','spec','COMBAT_METRICS_DISPLAY.md'),'utf8');assert.match(spec,/正規化していない計算値/);});
