# request73-v2 imagegen prompt set

- 実行方式: built-in `image_gen`
- use case: `stylized-concept`
- 入力参照: 最初の `gem-to-skills` だけ参照なし。残り8点は `selected/gem-to-skills.png` を画風・キャラクター同一性の参照に使用
- 画像内文字: 0。名称・説明・CTAはHTML実フォントで実装

## 抽象語の見える変換

| 依頼語 | 光 | 色 | 構図 | 質感 |
|---|---|---|---|---|
| 注文したい | 暖かい朝の拡散光、完成物に小さな金の光 | 濃紺・青・青緑を主、珊瑚と金を少量 | 困りごと→手を加える→使える道具、の一方向 | 上質なマット紙粘土とフェルト |
| また訪れたい | 全画像で同じ案内役と光を反復 | 同じ5色を固定 | 主役を毎回中央70〜80%、1枚1メッセージ | 手作り感は残しつつ、玩具に寄せない |
| アイコンみたい | 短い接地影 | 明快な輪郭差 | 4辺10%以上、64pxでも判別できる単純な塊 | 細部よりシルエットを優先 |

## 1. gem-to-skills

```text
Use case: stylized-concept
Asset type: premium homepage hero icon illustration for a Japanese AI workshop website
Primary request: several small luminous blue gemstone knowledge pieces are carefully transformed into one reusable organized toolkit of skill cards; a tiny friendly workshop assistant guides the transformation, making the scene personal and trustworthy rather than corporate
Scene/backdrop: genuinely transparent background; no room or floor rectangle; only a soft contact shadow
Subject: sapphire-blue Gem pieces on the left; a gentle transformation path with small gold sparks; a navy-and-teal toolkit with reusable rounded cards on the right; one original workshop helper with navy body, ivory face, round glasses and a small gold star pin
Style/medium: premium soft 3D paper-clay icon, slightly hand-crafted, rounded, sophisticated but cute
Composition/framing: square centered cluster, strong left-to-right story, about 78% subject fill, 10% safe margin, readable at 260px and recognizable at 64px
Lighting/mood: warm diffused morning light, gentle shadow, inviting and capable
Color palette: ivory, sapphire blue, deep navy, teal, very small coral and gold accents
Text: none
Constraints: no words, letters, numbers, logos, marks or watermark; clean silhouette; no extra characters
Avoid: emoji, stock icon, childish toy look, dark cyberpunk, neon, clutter, UI screenshot
```

## 2. miniapp-order

空欄の困りごとメモ1枚を左で受け取り、同じ案内役が右の「動くスマホミニアプリ」1台として手渡す。金色の流れで左→右をつなぐ。文字・数字・ロゴ0、実透過、4辺10%以上。

## 3. brand-atelier-mark

同じ案内役の丸眼鏡の顔、青いGem1個、金の小さなレンチ、星を一つの太い輪郭へ統合。favicon用。16pxで顔・眼鏡・Gem、32/64pxで工具と星を判別。文字・数字0、実透過。

## 4. salon-booking

左のマイク1、中央の同じ案内役1、右の美容室椅子・はさみ・空欄予約カードを金の流れでつなぐ。音声メモが予約へ整理される一方向。文字・数字0。

## 5. family-voice-check

左のマイク、中央の無文字・無数字カレンダー、右の持ち物チェックカードと通学バッグを一方向につなぐ。案内役が情報を整える。チェック記号のみ可。

## 6. learning-hint

開いた無文字教材に向かう子ども1人と、答えを教えず見守る同じ案内役1体。本から小さな金のヒント光を1つだけ出す。答え・式・文字・数字0。

## 7. school-consult

学校カード1枚を前に、穏やかな案内役が開いた手で話を聞く。空欄吹き出し1、金の小さなハート1。相談の安心を表し、文字・数字0。

## 8. record-care

案内役が小さな記録アプリ画面をレンチで確認し、横の盾で守りながら改善する。記録アプリ1、レンチ1、盾1、チェック3。文字・数字・ロゴ0。

## 9. diagnostic-tool

左の空欄質問カード3枚が、金色の矢印で右の結果メーター付き1枚アプリへ変わる。案内役が流れを案内する。文字・数字・ロゴ0。

## 共通Constraints

- 基準画像の案内役を再設計しない。アイボリー顔、丸眼鏡、濃紺体、青緑マント、金星ピン、丸い体型を維持
- soft 3D paper-clay、フェルト、マット紙、暖かい拡散光
- 正方形PNG、4辺10%以上、64pxでも意味が読める
- 文字、数字、ロゴ、透かし、署名、背景カード、額縁、余計な人物0

## 透過の修正契約

### Keep unchanged
- 被写体、個数、顔、ポーズ、色、質感、構図、光、接地影

### Change only
- 焼き込まれた灰白チェッカー、または一時マゼンタ背景 → alpha 0

### Must not change
- キャラクター同一性、意味を運ぶ物体、シルエット

### Recheck after edit
- `opaque=False`、4辺10%以上、白・濃紺・アイボリー3背景、64px、白縁・穴・欠け0

詳細prompt/QC:

- `prompt-works-icon-set.md`
- `qc/icon-cro-map-generation-log.md`
- `qc/record-diagnostic-imagegen-qc.md`
