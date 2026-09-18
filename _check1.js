
'use strict';
const $=id=>document.getElementById(id); let cvReady=false, shotImg=null, dbItems=[];
function loadImage(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{URL.revokeObjectURL(u);res(im)};im.onerror=rej;im.src=u})}
function addDB(file,name){return loadImage(file).then(im=>dbItems.push({name,im,file}))}
function matFromImage(im){const c=document.createElement('canvas');c.width=im.naturalWidth||im.width;c.height=im.naturalHeight||im.height;c.getContext('2d').drawImage(im,0,0);return cv.imread(c)}
function gray(m){const g=new cv.Mat();cv.cvtColor(m,g,cv.COLOR_RGBA2GRAY);return g}
function matchOne(scene,templ,minS,maxS,step){
  // v0.2: primary matcher is grayscale normalized correlation. Edge matching is
  // intentionally not the first gate because the real icon may be small and
  // anti-aliased; grayscale keeps the full icon pattern while tolerating scale.
  const sceneG=gray(scene), templG0=gray(templ); let best=null;
  for(let s=minS;s<=maxS+1e-9;s+=step){
    const tw=Math.max(8,Math.round(templG0.cols*s)),th=Math.max(8,Math.round(templG0.rows*s));
    if(tw>=sceneG.cols||th>=sceneG.rows)continue;
    const ts=new cv.Mat();cv.resize(templG0,ts,new cv.Size(tw,th),0,0,cv.INTER_AREA);
    const res=new cv.Mat();cv.matchTemplate(sceneG,ts,res,cv.TM_CCOEFF_NORMED);
    const mm=cv.minMaxLoc(res);
    if(!best||mm.maxVal>best.score)best={score:mm.maxVal,x:mm.maxLoc.x,y:mm.maxLoc.y,w:tw,h:th,scale:s};
    res.delete();ts.delete();
  }
  sceneG.delete();templG0.delete();return best;
}

function drawResults(scene,results){
  const c=$('view');c.width=scene.cols;c.height=scene.rows;const ctx=c.getContext('2d');ctx.drawImage(sceneToImage(scene),0,0);
  results.forEach((r,i)=>{const x=r.x,y=r.y,w=r.w,h=r.h;const db=r.dbImage;if(db){ctx.save();ctx.globalAlpha=.72;ctx.drawImage(db,x,y,w,h);ctx.restore();}ctx.lineWidth=3;ctx.strokeStyle='#00e5ff';ctx.strokeRect(x,y,w,h);ctx.fillStyle='rgba(0,229,255,.12)';ctx.fillRect(x,y,w,h);
    // DB icon is explicitly placed at the matched rectangle. Its bottom-right is the anchor.
    const ax=x+w,ay=y+h;ctx.fillStyle='#ff2d2d';ctx.beginPath();ctx.arc(ax,ay,5,0,Math.PI*2);ctx.fill();
    const oy=Math.max(0,Math.round(ay-h/2)), oh=Math.min(scene.rows-oy,Math.round(h));const ox=Math.min(scene.cols-1,Math.round(ax));const ow=Math.max(1,scene.cols-ox);
    ctx.strokeStyle='#ffd000';ctx.lineWidth=2;ctx.strokeRect(ox,oy,ow,oh);
    ctx.fillStyle='#fff';ctx.font='bold 15px sans-serif';ctx.fillText(r.name+' '+r.score.toFixed(3),x+4,Math.max(15,y-5));
    r.anchor={x:ax,y:ay};r.ocr={x:ox,y:oy,w:ow,h:oh};
  });
}
function sceneToImage(m){const c=document.createElement('canvas');c.width=m.cols;c.height=m.rows;cv.imshow(c,m);return c}
$('shot').onchange=async()=>{const f=$('shot').files?.[0];if(f){shotImg=await loadImage(f);$('shotStatus').textContent=`読み込み：${shotImg.naturalWidth}×${shotImg.naturalHeight}px`;}};
$('db').onchange=async()=>{dbItems=[];for(const f of $('db').files||[]){await addDB(f,f.name)};renderDB()};
function renderDB(){ $('dbList').innerHTML=dbItems.map(x=>`<div class="dbicon"><img src="${URL.createObjectURL(x.file)}"><span>${x.name}</span></div>`).join('') }
function bundled(){return Promise.all([['db_icons/main_weapon_sample.png','メイン武器アイコン'],['db_icons/head_armor_sample.png','頭防具アイコン'],['db_icons/chest_armor_sample.png','胴防具アイコン']].map(async([p,n])=>{const r=await fetch(p);const b=await r.blob();return addDB(new File([b],p.split('/').pop(),{type:b.type||'image/png'}),n)})).then(renderDB).catch(()=>{})}
window.Module=window.Module||{};window.Module.onRuntimeInitialized=()=>{cvReady=true;$('status').textContent='OpenCV.js準備完了。';bundled()};
$('sampleShot').onclick=async()=>{try{const r=await fetch('sample_game.png',{cache:'no-store'});if(!r.ok)throw new Error('sample_game.png HTTP '+r.status);const b=await r.blob();shotImg=await loadImage(new File([b],'sample_game.png',{type:b.type||'image/png'}));$('shotStatus').textContent=`サンプル読み込み：${shotImg.naturalWidth}×${shotImg.naturalHeight}px`;}catch(e){$('shotStatus').textContent='サンプル読み込み失敗：'+e.message;}};
$('run').onclick=async()=>{if(!cvReady){$('status').textContent='OpenCV.jsがまだ準備できていません。';return}if(!shotImg){$('status').textContent='スクショを選択してください。';return}if(!dbItems.length){$('status').textContent='DBアイコンがありません。';return}const scene=matFromImage(shotImg);const minS=Number($('smin').value),maxS=Number($('smax').value),step=Number($('sstep').value);const thr=Number($('thr').value);const results=[];const t=performance.now();for(const d of dbItems){const tm=matFromImage(d.im);const r=matchOne(scene,tm,minS,maxS,step);tm.delete();if(r&&r.score>=thr)results.push({...r,name:d.name,dbImage:d.im})}drawResults(scene,results);scene.delete();$('status').textContent=`照合完了：${results.length}/${dbItems.length}件 / ${(performance.now()-t).toFixed(0)}ms`;$('results').innerHTML=results.map(r=>`<div class="result"><b>${r.name}</b><div class="mono">score=${r.score.toFixed(3)} scale=${r.scale.toFixed(2)} x=${r.x} y=${r.y} w=${r.w} h=${r.h}\n右下角 anchor=(${r.anchor.x}, ${r.anchor.y})\nOCR帯 x=${r.ocr.x} y=${r.ocr.y} w=${r.ocr.w} h=${r.ocr.h}</div></div>`).join('')||'<div class="note">閾値以上の一致がありません。</div>'};
