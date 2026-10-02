# OCR Candidate Escape / Manual Resolution — r12

Status: CANDIDATE

## Adopted behavior
- 要確認の装備候補に「どれでもない」を必ず表示する。
- 「どれでもない」選択後は、その部位に対応するMHDB装備から手動選択できる。
- 「あとで設定する」を選ぶと `resolutionStatus=unresolved` として保持し、誤候補はビルドへ反映しない。
- 候補外から手動確定した事例は `failureKnowledge.type=candidate_set_miss` として保持する。
- OCR候補を無理に確定しない。

## AI-native intent
候補集合そのものを外した失敗を高価値Failure Knowledgeとして扱い、将来のOCR候補生成・confidence・Regressionに利用する。
