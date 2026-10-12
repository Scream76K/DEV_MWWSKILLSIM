from decimal import Decimal as D, ROUND_HALF_UP
import json
from pathlib import Path
round1=lambda x:float(x.quantize(D('.1'),rounding=ROUND_HALF_UP))
m=list(map(D,['1','1','1','1','1.02','1.04']));f=list(map(D,['0','3','5','7','8','9']))
b=D(160);k=D(5)+D(6);hz=D('.30')
rows=[]
for lv,obs in enumerate([148.8,151.2,152.8,154.4,157.8,161.1]):
 a=b*m[lv]+f[lv]+k;p=D('.8')*a+D(12);wrong=D('.8')*((b+k)*m[lv]+f[lv])+D(12)
 rows.append(dict(attackLv=lv,internalAttackCandidate=float(a),observed=obs,rawPrediction=float(p),displayPrediction=round1(p),error=round(round1(p)-obs,6),allBuffMultipliedPrediction=round1(wrong),integerAttackFirstPrediction=round1(D('.8')*int(a)+D(12))))
combo=[]
for lv,art,obs in [(0,0,148.8),(0,1,161.6),(0,2,174.4),(0,3,187.2),(5,0,161.1),(5,2,187.7)]:
 am=[D('1'),D('1.1'),D('1.2'),D('1.3')][art];p=D('.8')*(b*m[lv]*am+f[lv]+k)+D(12);wrong=D('.8')*(b*m[lv]+f[lv]+k)*am+D(12)
 combo.append(dict(attackLv=lv,artilleryLv=art,observed=obs,rawPrediction=float(p),displayPrediction=round1(p),error=round(round1(p)-obs,6),artilleryOnWholeAttack=round1(wrong)))
second=[]
for lv,fire,obs in [(0,0,38.5),(0,1,39.7),(0,2,40.6),(0,3,41.5),(3,0,39.8),(5,0,41.4)]:
 em=[D('1'),D('1'),D('1.1'),D('1.2')][fire];ef=[D(0),D(40),D(50),D(60)][fire];a=b*m[lv]+f[lv]+k;p=D('.19')*a+(D(200)*em+ef)/10*hz
 second.append(dict(attackLv=lv,fireLv=fire,observed=obs,rawPrediction=float(p),displayPrediction=round1(p),error=round(round1(p)-obs,6)))
print(json.dumps(dict(attack=rows,artillery=combo,secondHit=second),indent=2))
