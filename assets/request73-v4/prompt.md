# 依頼書73-v4 imagegen prompt契約

## なぜ／何が

失敗理由: 最初の参照なし生成で生まれた紺フードのマスコットを同一性正本として残り8枚へ連鎖させたため、ユーザー正本との人物同一性が0/9になった。

改善: 9回すべてでユーザー支給の同じキャラ画像を直接参照し、同一性5核と禁止特徴を各promptへ毎回明記する。

## 共通prompt

```text
Use case: illustration-story
Asset type: friendly website illustration for a small AI app workshop
Input image: the supplied collage is the ONLY identity reference for the main guide character. Preserve his identity, clothing and friendly editorial-cartoon style. Do not copy its collage layout, text or office backgrounds.
Primary request: create a simple, universally understandable story illustration whose meaning is clear without words.
Subject identity, mandatory every time: an adult male stylized AI workshop guide with warm golden-yellow skin, very large sideways pointed ears with warm orange inner ears, short tousled brown hair fully visible, large thin round brown glasses, brown eyes and thick brown eyebrows, calm friendly smile, navy three-piece suit, white shirt, navy dotted bow tie, small round gold lapel badge on his left lapel, brown shoes. Keep all five identity cores: golden skin, large pointed ears, brown hair, round glasses, navy suit with bow tie.
Style/medium: polished 2D to 2.5D editorial cartoon, clean outlines, gentle cel shading, friendly for adults and children, high clarity at small web sizes.
Composition/framing: one reading direction from problem on the left through the guide's action in the center to a useful result on the right; make the people and key objects fill 85 to 92 percent of the long dimension; only 4 percent protective margin; no decorative empty space.
Lighting/mood: bright soft front light, short soft shadows, reassuring and practical.
Color palette: ivory, navy, pale blue, teal, warm gold skin, tiny coral accents.
Text: no text, no letters, no numbers, no logos, no watermark, no pseudo-writing. Blank calendar grids, short empty form lines, check marks, arrows and geometric icons are allowed as non-text shapes.
Constraints: request genuine transparency first. If the tool bakes a checkerboard into RGB, reject that output and use one seamless pale warm-ivory to pale-blue studio wash instead; simple large shapes; clear hands and faces; no cropping of face, ears, hands or key objects. A small white helper robot with a blue screen face may appear only as a secondary object.
Avoid: antenna, horns, dark round hood, helmet, full-head mask, white face inside a dark circular head, navy bodysuit, teal superhero cape, central chest star, two-head-tall bug or alien mascot, plush or clay 3D texture, villain colors, brand logos, UI text.
```

## 用途別の追加文

- `brand-atelier-mark`: icon, close portrait. Enlarge the guide's head, ears, round glasses, bow tie and gold lapel badge. Add one tiny white helper robot head. A single compact silhouette readable at 16, 32 and 64 pixels. No story arrow. 10 percent safe margin.
- `gem-to-skills`: left: several loose blue gem-shaped ideas; center: the guide sorts them at a small workbench; right: the same ideas become neat reusable cards inside an open navy-and-teal toolbox. One clean arrow direction, no text.
- `miniapp-order`: left: an ordinary adult user hands over one problem note; center: the guide builds at a laptop; right: the same user happily taps a finished simple phone app. Make the before-and-after human outcome obvious.
- `salon-booking`: left: a hairdresser works beside a salon chair and speaks into a microphone; center: the guide organizes the voice input; right: a large appointment calendar receives one clear check mark. Scissors and chair make the salon context obvious.
- `family-voice-check`: left: a busy parent carrying bags speaks one event into a microphone; center: the guide puts it into a calendar; right: a child backpack and a short visual checklist are ready. No written labels.
- `learning-hint`: left: a child pauses over a workbook; center: the guide offers one small hint card and points gently, never showing the answer; right: the child begins writing independently with a hopeful expression.
- `school-consult`: left: a worried parent holds a messy speech bubble; center: the guide calmly reshapes it into one clear message card; right: a teacher at a school receives it and the parent looks relieved. Speech bubbles contain no text.
- `record-care`: left: an existing phone app shows one warning symbol; center: the guide uses a small wrench and checks a record sheet; right: the same app works normally with a shield and check mark. This means small fixes and ongoing care.
- `diagnostic-tool`: left: a user answers exactly three large question cards; center: the guide organizes the three cards; right: a neutral result card and a simple gauge appear. No medical symbols, diagnosis claim, text or numbers.

## 生成・採否

- built-in imagegenを使い、1画像1call。
- 各callでキャラ正本を直接参照する。先に作った誤キャラ画像は参照しない。
- 返却原本を`original/`へ不変保存し、Web用切り抜き・背景・縮小は`selected/`と`web/`へ分離する。実alpha抽出を2回試してもチェッカー焼込RGBだったため、2026-08-15のpilot判定で全9点を淡いアイボリー〜淡い水色の無地背景へ統一した。偽透過は採用しない。
- カレンダー罫線、未記入フォームの短い横線、チェック、矢印、幾何学アイコンは実文字ではなく意味を運ぶ図形として許可する。文字に見える字形、数字、単語、ロゴは0のまま維持する。
- pilotは`gem-to-skills`。同一性5核5/5、禁止特徴0、用途意味が絵だけで通ることを確認してから残り8点へ進む。
