'use strict';
/**
 * Beta browser acceptance probe. Execute against the checked-out repository:
 *   node tools/ui-pr3-layout-smoke.cjs
 * Requires npm ci and npx playwright install chromium.
 * This is a read-only page/layout probe: no build saves or product mutations.
 */
const path = require('node:path');
const fs = require('node:fs');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.resolve(process.env.UI_SMOKE_OUTPUT || path.join(ROOT, 'artifacts', 'ui-pr3-layout'));
const SIZES = [375,390,768,1024,1440];

async function main() {
  fs.mkdirSync(OUTPUT,{recursive:true});
  const browser = await chromium.launch({headless:true});
  const results=[];
  try {
    for(const width of SIZES){
      const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
      // Remote resources are optional for this static UI-layout audit. Keep all
      // repository-local scripts, styles and images available unchanged.
      await page.route(/^https?:\/\//,route=>route.abort('blockedbyclient'));
      const errors=[];
      page.on('pageerror',error=>errors.push(String(error.message).slice(0,240)));
      await page.goto(pathToFileURL(path.join(ROOT,'index.html')).href,{waitUntil:'domcontentloaded',timeout:30000});
      await page.locator('main.wrap > .grid').waitFor({state:'attached',timeout:15000});
      const metrics=await page.evaluate(()=>{
        const grid=document.querySelector('main.wrap > #betaWorkspaceGrid');
        const build=grid?.querySelector(':scope > #betaBuildPanel');
        const support=grid?.querySelector(':scope > #betaSupportPanel');
        const row=build?.querySelector(':scope > #armorBuildWorkspace');
        const armor=row?.querySelector(':scope > #armorWorkspaceLeft');
        const skills=row?.querySelector(':scope > #skillWorkspaceRight');
        if(!grid||!build||!support||!row||!armor||!skills)return {found:false};
        const a=build.getBoundingClientRect(),b=support.getBoundingClientRect();
        const style=getComputedStyle(grid);
        const horizontal=Math.abs(a.top-b.top)<=5 && b.left>a.left;
        const c=armor.getBoundingClientRect(),d=skills.getBoundingClientRect();
        const armorHorizontal=Math.abs(c.top-d.top)<=5 && d.left>c.left;
        const armorRatio=c.width/d.width;
        return {
          found:true,
          columns:style.gridTemplateColumns,
          build:{x:a.x,y:a.y,width:a.width,height:a.height},
          support:{x:b.x,y:b.y,width:b.width,height:b.height},
          horizontal, fullWidth:Math.abs(a.width-grid.clientWidth)<=3 && Math.abs(b.width-grid.clientWidth)<=3,
          armorHorizontal,armorRatio,
          documentWidth:document.documentElement.scrollWidth,
          viewportWidth:window.innerWidth,
          title:document.title,
          preview:document.querySelector('#developmentPreviewNotice')?.textContent?.trim()||null,
          hiddenReferencePanels:['techAuditPanel','hhReferencePanel','scorchReferencePanel','darkArtsReferencePanel'].map(id=>{const panel=document.getElementById(id);return {id,exists:Boolean(panel),hidden:Boolean(panel)&&getComputedStyle(panel.closest('section.wrap')).display==='none'};}),
          iconStyles:(()=>{
            const el=document.querySelector('#armorSelectors .equip-inline > .equip-title:first-child');
            if(!el)return null;
            const icon=getComputedStyle(el,'::before');
            return {width:icon.width,height:icon.height,display:icon.display};
          })()
        };
      });
      await page.screenshot({path:path.join(OUTPUT,'layout-'+width+'.png'),fullPage:true,timeout:20000});
      const arrangementOk=metrics.found && !metrics.horizontal && metrics.fullWidth;
      const armorArrangementOk=metrics.found && metrics.armorHorizontal;
      const ratioOk=metrics.found && Number.isFinite(metrics.armorRatio)&&Math.abs(metrics.armorRatio-1.5)<=0.07;
      const overflowOk=metrics.found && metrics.documentWidth<=width+3;
      const referencesHidden=metrics.found && metrics.hiddenReferencePanels?.every(p=>p.exists&&p.hidden);
      const verdict={width,arrangementOk,armorArrangementOk,ratioOk,overflowOk,referencesHidden,metrics,errors};
      results.push(verdict);
      await page.close();
    }
  } finally {await browser.close();}
  const output={scope:'BETA_STATIC_LAYOUT_CHROMIUM_NOT_SAFARI',time:new Date().toISOString(),results};
  fs.writeFileSync(path.join(OUTPUT,'result.json'),JSON.stringify(output,null,2)+'\n');
  for(const r of results)console.log([r.width,r.arrangementOk?'layout:OK':'layout:FAIL',r.armorArrangementOk&&r.ratioOk?'armor/skills:OK':'armor/skills:FAIL',r.overflowOk?'overflow:OK':'overflow:FAIL','armor/skills ratio='+Number(r.metrics.armorRatio).toFixed(3)].join(' '));
  if(results.some(r=>!r.arrangementOk||!r.armorArrangementOk||!r.ratioOk||!r.overflowOk||!r.referencesHidden))process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
