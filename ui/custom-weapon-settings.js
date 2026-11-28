/* Optional inputs for the current custom route only. Existing fields supply
 * allowed choices. Only CB overrides round-trip with a saved custom combo; the old editor and presets remain
 * independent. The evaluator still owns every validity/weapon-ability check. */
(function(){
 const $=id=>document.getElementById(id);
 const field=(key,label,source,read=value=>value)=>({key,label,source,read});
 const number=value=>Number(value);
 const toggle=value=>value==='1';
 const byKind={
  'long-sword':['longSwordState',field('spiritGauge','練気ゲージ','comboLSSpiritGauge')],
  'dual-blades':['dualBladesState',field('demonMode','鬼人化','comboDBDemonMode',toggle),field('requiresDemonGauge','鬼人ゲージ','comboDBDemonGauge',toggle)],
  'hunting-horn':['huntingHornState',field('melodyState','演奏バフ','comboHHMelody')],
  'insect-glaive':['insectGlaiveState',field('extractState','エキス状態','comboIGExtract')],
  'light-bowgun':['lightBowgunState',field('ammoType','弾種','comboLBGAmmoType'),field('ammoLevel','弾Lv','comboLBGAmmoLevel',number),field('shotMode','射撃モード','comboLBGMode'),field('normalModeLevel','通常モード強化','comboLBGNormalMode',number),field('rapidMagazine','速射用弾倉','comboLBGRapidMagazine'),field('elementPowder','属性弾強化火薬','comboLBGElementPowder'),field('normalPowder','通常弾強化火薬','comboLBGNormalPowder'),field('specialMagazine','特殊弾倉','comboLBGSpecialMagazine')],
  'heavy-bowgun':['hbgState',field('elementType','弾種','powerHbgElementType',value=>value==='NORMAL'?null:value),field('ammoLevel','弾Lv','powerHbgAmmoLevel',number),field('normalModeLevel','通常モード強化','powerHbgNormalMode',number)],
  'bow':['bowState',field('coating','ビン','powerBowCoating')],
  'switch-axe':['switchAxeState',field('mode','開始モード','comboSAMode'),field('awakened','高出力状態','comboSAAwakened',toggle)],
  'charge-blade':['chargeBladeState',field('swordBoosted','剣強化','comboCBSword',toggle),field('shieldBoosted','盾強化','comboCBShield',toggle),field('axeBoosted','斧強化','comboCBAxe',toggle),field('normalPhials','通常ビン残数','comboCBNormalPhials',number),field('enhancedPhials','強化ビン残数','comboCBEnhancedPhials',number),field('enhancedPhial','ビン強化','comboCBEnhancedPhial',toggle)],
 };
 const panel=document.createElement('details');
 panel.id='customWeaponSettings';panel.className='comparison-setting-fold';panel.hidden=true;
 panel.innerHTML='<summary>武器の設定</summary><p class="small">「コンボを自分で組む」の開始条件です。標準コンボには使いません。チャージアックスの指定条件は保存ビルド比較にも引き継がれます。対応外の組み合わせは計算結果に理由を表示します。</p>';
 const groups=new Map();
 const controlId=field=>'customWeapon'+field.key[0].toUpperCase()+field.key.slice(1)+'_'+field.source;
 for(const [kind,[state,...fields]] of Object.entries(byKind)){
  const group=document.createElement('div');group.hidden=true;group.dataset.weaponKind=kind;
  for(const config of fields){
   const source=$(config.source);if(!source)continue;
   const control=source.cloneNode(true);control.id=kind==='long-sword'?'customWeaponSpiritGauge':controlId(config);
   for(const a of [...control.attributes])if(a.name.startsWith('on')||a.name==='hidden'||a.name.startsWith('aria-')||a.name==='disabled'||a.name==='name')control.removeAttribute(a.name);
   if(kind==='heavy-bowgun'&&config.key==='elementType')control.add(new Option('通常弾','NORMAL'),1);
   if(control.tagName==='SELECT'&&control.options[0]?.value==='')control.options[0].textContent='おまかせ';
   if(control.tagName==='INPUT'){control.placeholder='おまかせ';control.inputMode=config.key==='ammoLevel'?'numeric':'decimal';}
   if(kind==='heavy-bowgun'&&config.key==='ammoLevel')for(const option of [...control.options].slice(1))option.textContent='Lv'+option.value;
   control.value='';control.dataset.weaponField=config.key;
   const label=document.createElement('label');label.htmlFor=control.id;label.textContent=config.label;
   const item=document.createElement('div');item.append(label,control);group.append(item);
  }
  groups.set(kind,group);
 }
 $('comparisonOptionalConditions').append(panel);
 let active;
 function sync(kind){
  if(kind===active)return;
  active=kind;panel.hidden=!groups.has(kind);
  for(const group of groups.values())group.remove();
  const group=groups.get(kind);if(group){group.hidden=false;panel.append(group);}
  panel.open=false;
 }
 let invalidLoadedChargeBlade={};
 function chargeBladeError(invalid=invalidLoadedChargeBlade){
  const names=byKind['charge-blade'].slice(1).filter(f=>Object.hasOwn(invalid,f.key)).map(f=>f.label);
  return names.length?'保存したチャージアックスの設定値が無効です（'+names.join('、')+'）。詳細設定で指定し直してください。':undefined;
 }
 function prepare(kind,conditions,{snapshot=false}={}){
  const group=groups.get(kind);
  if(!group)return {conditions,fields:[]};
  const [state,...config]=byKind[kind],entries={},fields=[];
  const savedError=kind==='charge-blade'&&!snapshot&&chargeBladeError();
  if(savedError)return {conditions,fields,error:savedError};
  for(const f of config){
   const input=group.querySelector('[data-weapon-field="'+f.key+'"]');
   if(!input)continue;
   if(!input.validity.valid)return {conditions,fields:[],error:f.label+'を入力範囲内で指定してください。'};
   if(input.value==='')continue;
   const value=f.read(input.value);
   entries[f.key]=value;
   if(kind==='heavy-bowgun'&&f.key==='elementType')entries.ammoType=value===null?'NORMAL':'ELEMENT';
   fields.push({state,key:f.key,value,label:f.label+'：'+(input.selectedOptions?.[0]?.textContent||input.value)});
  }
  const existing=conditions[state];
  if(!fields.length||(existing!=null&&(typeof existing!=='object'||Array.isArray(existing))))return {conditions,fields:[]};
  return {conditions:{...conditions,[state]:{...existing,...entries}},fields};
 }
 function captureChargeBlade(){
  const {fields}=prepare('charge-blade',{},{snapshot:true});
  const saved={...Object.fromEntries(fields.map(({key,value})=>[key,value])),...invalidLoadedChargeBlade};
  return Object.keys(saved).length?saved:undefined;
 }
 function savedChargeBlade(saved){
  const entries={},invalid={};
  if(!saved||typeof saved!=='object'||Array.isArray(saved))return {entries,invalid};
  for(const f of byKind['charge-blade'].slice(1)){
   if(!Object.hasOwn(saved,f.key))continue;
   const value=saved[f.key];
   if(f.read===toggle){
    if(typeof value==='boolean')entries[f.key]=value;
   }else if(typeof value==='number'&&Number.isFinite(value)){
    const input=$(f.source).cloneNode();
    input.value=String(value);
    if(input.value!==''&&input.validity.valid)entries[f.key]=value;
   }
   if(!Object.hasOwn(entries,f.key))invalid[f.key]=value;
  }
  return {entries,invalid,error:chargeBladeError(invalid)};
 }
 function restoreChargeBlade(saved){
  const {entries,invalid}=savedChargeBlade(saved);
  invalidLoadedChargeBlade=invalid;
  const group=groups.get('charge-blade');
  for(const input of group?.querySelectorAll('[data-weapon-field]')||[]){
   const value=entries[input.dataset.weaponField];
   input.value=typeof value==='boolean'?(value?'1':'0'):typeof value==='number'?String(value):'';
  }
 }
 function edited(event){
  const input=event.target;
  if(input.id==='customWeaponExtractState_comboIGExtract'&&descendingEditor()){
   $('comboIGExtract').value=input.value;
   $('comboIGExtract').dispatchEvent(new Event('change',{bubbles:true}));
  }
  if(groups.get('charge-blade')?.contains(input)&&input.validity?.valid)
   delete invalidLoadedChargeBlade[input.dataset.weaponField];
  clearCurrentCustomResult();
 }
 panel.addEventListener('input',edited);
 panel.addEventListener('change',edited);
 window.MHCustomWeaponSettings=Object.freeze({sync,prepare,captureChargeBlade,restoreChargeBlade,savedChargeBlade,chargeBladeError});
 sync(comboKind());
})();
