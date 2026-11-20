(function(root){
  'use strict';
  const normalize=value=>String(value??'').normalize('NFKC').replace(/\s+/g,'').replace(/[･•]/g,'・');
  const parts=value=>{
    const m=normalize(value).match(/^(.+珠(?:[IVX1-5]+)?)(?:【([1-3])】|\[([1-3])\])$/u);
    return m?{name:m[1],level:Number(m[2]??m[3])}:null;
  };
  function compatible(row,kind,maxSlot){
    const level=Number(row?.slot);
    return row?.id!=null&&['weapon','armor'].includes(row.kind)&&Number.isInteger(level)&&level>=1&&level<=3&&(!kind||row.kind===kind)&&(!Number.isInteger(maxSlot)||level<=maxSlot);
  }
  function resolve({passes=[],db=[],kind=null,maxSlot=null}={}){
    const pool=db.filter(row=>compatible(row,kind,maxSlot));
    const exact=new Map();let conflicts=false;
    for(const pass of passes){
      const raw=parts(pass?.raw);
      if(!raw)continue;
      const matches=pool.filter(row=>{
        const name=parts(row.name);
        return name?.name===raw.name&&name.level===raw.level&&Number(row.slot)===raw.level;
      });
      if(matches.length!==1){conflicts=true;continue;}
      exact.set(String(matches[0].id),matches[0]);
    }
    return !conflicts&&exact.size===1?{status:'AUTO',jewel:[...exact.values()][0]}:{status:'REVIEW',jewel:null};
  }
  root.MHWDecorationOCRConfirmation=Object.freeze({resolve,compatible});
})(window);
