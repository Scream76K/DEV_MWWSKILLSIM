"""Independent fixed-input arithmetic, without importing or running product code."""
import json, hashlib
from pathlib import Path
from decimal import Decimal as D
HERE=Path(__file__).resolve().parent
BASE=HERE.parents[2]
DB=BASE/'input/normalized-data.json'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
db=json.loads(DB.read_text())
weapons={w['id']:w for w in db['weapons'] if w['id'] in (236,250)}
# Sources: kuroyonhon memo/28 (Charge Master), a-to-monhan 2025/02/26
# skill table (Critical Element), macarongamemo GS motion/damage pages.
# Already-adopted specification is also confirmed from the original conversation.
CM={1:D('1.15'),2:D('1.20'),3:D('1.25')}
CE={1:D('1.07'),2:D('1.14'),3:D('1.21')}
MV=D(176);EM=D('1.5');SHARP_P=D('1.05');SHARP_E=D(1)
HZ=D('0.8');EHZ=D('0.3');CRIT_P=D('1.25');TOL=D('1e-9')
expected={}
for wid,w in weapons.items():
 assert w['kind']=='great-sword'
 assert w['sharpness']['green']>0 and all(w['sharpness'][c]==0 for c in ('blue','white','purple'))
 a=D(w['damage']['raw']);p=D(w['affinity'])/100
 specials=w['specials']; e=D(specials[0]['damage']['raw']) if specials else D(0)
 if wid==250:
  assert a==100 and p==D('.05') and e==14
  assert specials[0]['element']=='fire' and specials[0]['damage']['display']==140
  assert [(s['skill']['id'],s['level']) for s in w['skills']]==[(8,1)]
 else: assert a==90 and p==0 and e==0 and w['skills']==[]
 physical=a*MV/100*SHARP_P*HZ*((1-p)+p*CRIT_P)
 element=e*EM*SHARP_E*EHZ
 for sid,coeffs in ((24,CM),(82,CE)):
  for lv in ((1,2,3) if wid==250 else (1,)):
   key=f'{"eligible" if wid==250 else "missing-prerequisites"}:{sid}:{lv}'
   factor=coeffs[lv] if sid==24 else (1-p)+p*coeffs[lv]
   after_e=element*factor
   prior={'physical':physical,'element':element,'total':physical+element}
   after={'physical':physical,'element':after_e,'total':physical+after_e}
   expected[key]={'skillId':sid,'level':lv,'weaponId':wid,'coefficient':str(coeffs[lv]),'expectedFactor':str(factor),'before':prior,'after':after,'delta':{k:after[k]-prior[k] for k in prior}}
print(json.dumps(expected,ensure_ascii=False,indent=2,default=str))
