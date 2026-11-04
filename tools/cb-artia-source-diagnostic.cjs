'use strict';
const fs=require('node:fs');
const paths=['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'];
const needles=['BASE_ARTIA_RESTORE_UNSUPPORTED','ARTIA_R8_RESTORE_UNSUPPORTED','ARTIA_COMPLETED_VALUES_UNRESOLVED','baseArtiaRestore','artiaRestore','restoreBonuses','restoreBonus'];
for(const path of paths){
 const src=fs.readFileSync(path,'utf8');
 for(const needle of needles){
  let at=0,count=0;
  while((at=src.indexOf(needle,at))>=0&&count++<6){
   console.log(JSON.stringify({file:path,needle,position:at,context:src.slice(Math.max(0,at-1500),Math.min(src.length,at+1700))}));
   at+=needle.length;
  }
 }
}
