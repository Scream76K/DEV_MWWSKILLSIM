// Decode the production embedded script; never test escaped outer HTML as JS.
const fs=require('node:fs'),path=require('node:path');
module.exports=function(){
 const outer=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const m=outer.match(/code\.textContent=("(?:[^"\\]|\\.)*");/);
 if(!m) throw new Error('embedded OCR script not found');
 const markup=outer.match(/wrap\.innerHTML=("(?:[^"\\]|\\.)*");/);
 return JSON.parse(m[1])+'\n'+(markup?JSON.parse(markup[1]):'')+'\n'+outer;
};

module.exports.functionSource=function(src,name){
 const vm=require('node:vm');let start=src.indexOf('function '+name+'(');if(src.slice(start-6,start)==='async ')start-=6;
 if(start<0)throw Error('missing function '+name);
 for(let i=src.indexOf('{',start);i<src.length;i++)if(src[i]==='}'){
  const candidate=src.slice(start,i+1);
  try{new vm.Script('('+candidate+')');return candidate}catch(e){if(!(e instanceof SyntaxError))throw e;}
 }
 throw Error('unterminated function '+name);
};
