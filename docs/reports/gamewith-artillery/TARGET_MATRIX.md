# GameWith対象技とTechnique ID（539件走査、2026-10-12）

根拠：https://gamewith.jp/mhwilds/486663 （2026-06-01 10:26更新、具体的検証ゲーム版記載なし）。対象技名の一致は全成分計算完成/現行VERIFIEDを意味しない。

|表の対象|Technique DB対応|成分・未確定事項|今回接続|
|---|---|---|---|
|GL砲撃|GL_SHELL_NORMAL_LOW/MEDIUM/HIGH、GL_SHELL_LONG_LOW/MEDIUM/HIGH、GL_SHELL_WIDE_LOW/MEDIUM/HIGH|物理と固定火値を分離。LONG_LOW/WIDE_LOWはMISSING。型/段階/装填を照合|MEDIUM通常砲撃、補正なし条件のみ暫定砲術|
|GL溜め砲撃|砲撃と同じGL_SHELL_*を使用、UI reference:gl_CHARGED。単独DB IDなし|物理倍率/消費弾数と火加算の技別範囲を分離|砲術あり未算出|
|GL竜撃砲|GL_WYVERN_FIRE_NORMAL_LOW/MEDIUM/HIGH、GL_WYVERN_FIRE_LONG_LOW/MEDIUM/HIGH、GL_WYVERN_FIRE_WIDE_LOW/MEDIUM/HIGH|Hit構成/ゲージ/技別成分と補正が必要。単発砲撃の式を流用しない|未接続|
|GL FB（表に独立記載なし）|GL_SHELL_*の反復成分＋p0ReferenceRules、UI reference:gl_FULL_BURST。通常FB単独IDなし|砲撃成分の対象性とFB技全体の補正/火加算を区別。砲撃掲載だけで全体適用を確定しない|砲術あり未算出|
|CB属性解放斬り|CB_ELEMENT_DISCHARGE_1、CB_ELEMENT_DISCHARGE_2|現在hitsは斬撃部分。ビン種/回数/係数/状態が別途必要。斬撃全体へ砲術を掛けない|新接続なし|
|CB突進属性解放斬り|同名・確定別名のIDなし|CB_SWORD_ADVANCING=剣突進、CB_AXE_ADVANCING_SLAM=突進叩きつけと区別。記事名称の実技対応待ち|未算出|
|CB高出力|CB_AED|本体斬撃とビン成分を区別|新接続なし|
|CB追撃高出力|CB_FOLLOWUP_AED|本体斬撃とビン成分を区別|新接続なし|
|CB超高出力|CB_SAED、CB_SAED_AED_DERIVED|2派生の本体と5ビンを分離。KAN-21強属性経路へ砲術倍率を追加しない。砲術のビン種適用は別途照合|既存KAN-21維持|
|CB超高出力ビンなし（対象を除外する比較用）|CB_SAED_NO_PHIAL|ビンなし本体に砲術を掛ける根拠なし|新接続なし|
|CB剣強化時ビン追撃|追撃成分の独立IDなし|剣本体各技へ付随する条件成分。CB_CONDENSED_ELEMENT_SLASHは高圧属性斬り本体であり、この追撃を網羅するIDではない。剣強化/ビン種/発生回数が必要|未算出|
|LBG徹甲榴弾|LBG_STICKY_AMMO_1/2/3|AMMO_PHYSICAL/FIXED_EXPLOSION/FIRE_DAMAGE。着弾/爆発/火の対象を分離、SOURCE_CONFLICT維持|新接続なし|
|HBG徹甲榴弾|HBG_STICKY_AMMO_1/2/3|同上。通常弾のHandlerへ砲術を追加しない|新接続なし|
|HBG竜撃弾|HBG_WYVERN_AMMO|物理/爆発/火のHit構成と適用順序が必要|新接続なし|
|HBG竜熱相殺弾|HBG_IGNITION_COUNTER、HBG_IGNITION_COUNTER_OFFSET|通常/相殺の条件・Hit成分を区別。表は派生間の具体的倍率範囲を明記しない|新接続なし|

同名HBG技がLBG側にもDB登録されていることは実武器での使用可否の証明ではない。対象表に載っていない弾/技を類推で対応と数えない。
CBの砲術対象を「ビン全種」と解釈しない。旧実測資料は榴弾ビンを検証しており、GameWith表はビン種の詳細条件を説明していない。既存強属性SAED値は変更しない。
