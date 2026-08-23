# request73-v2 納品

- 完了時刻: 2026-08-15 12:32 JST
- 対象: `apps/ei-site/index.html`
- 状態: ローカル採用候補完成
- 外部状態: commit・push・公開・本番Rondo送信は未実施

## できたもの

imagegenで、同じ「AIミニアプリ工房」の案内役を使った9点の画像を制作した。

1. 工房マーク
2. GemからSkillsへの変換
3. 困りごとからミニアプリへの変換
4. 美容室の予約アプリ
5. 音声入力・予定・持ち物アプリ
6. そらりん学習アプリ
7. 学校相談
8. 記録アプリの小修正・見守り
9. 診断・シミュレーターツール

採用原本は `selected/`、配信用軽量版は `web/`、生成原本と不採用版は `original/` に保存した。

## サイトへの反映

- CSS製の書類図とWORKS内の絵文字を画像へ置換
- ナビに工房マークを追加
- ヒーローの主CTAを「500円クーポンを受け取る」へ具体化
- `980円 → 480円`、メール2通、売り込みメールなしを主CTA付近で明示
- ミニアプリ導線を「困りごと → 小さな道具 → LINE相談」の物語へ変更
- WORKSを「工房の道具棚」として、運用中・制作事例・準備中・公開中を維持表示
- RobloxとBrainの実物証拠画像は残し、非破壊の軽量WebPだけ追加

## 最終QC

- imagegen採用画像: 9/9 実alpha・文字/数字/ロゴ0・64px判別PASS
- 配信用imagegen画像: 10ファイル、合計214,369B
- 既存証拠画像の軽量版: 2ファイル、合計187,508B
- 実ブラウザ: 375×812 / 1440×1000
- 自動検品: 112/112 PASS
- 横はみ出し、画像読込失敗、pageerror、console.error: 0
- Rondo: PC/SPでview・CTA表示・主CTA clickをmock受信し、実本番送信0
- 独立監査: ローカルPASS、NG 0、公開を止める問題0

証跡:

- `qc/all-assets-ivory-contact-sheet.png`
- `qc/final-qc.md`
- `00_幹部room/00_司令室_Codex/reports/assets/2026-08-15_request73-v2/request73-browser-qc.json`
- `00_幹部room/00_司令室_Codex/reports/assets/2026-08-15_request73-v2/ei-site-local-375x812-request73-v2.png`
- `00_幹部room/00_司令室_Codex/reports/assets/2026-08-15_request73-v2/ei-site-local-1440x1000-request73-v2.png`

## なぜ／何が

なぜ注文と再訪につながるか: 同じ案内役が「困りごとを受け取る → 道具に変える → 相談へ案内する」物語を全区画で繰り返し、価格・実績・人柄の証拠をその直後に置いたため。

何を直したか: 汎用的なCSS図・絵文字・抽象CTAを、固有の工房キャラクター、用途別の場面画像、具体的な便益CTAへ置き換えた。

## 人間の最終判断

えいによる見た目の採用確認後、必要なら別指示でcommit・push・公開・公開後Rondo受入へ進む。
