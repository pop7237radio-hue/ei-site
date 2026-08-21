# NotebookLM MCP接続手順書（Gem Port Skills レビュー特典 v1.0）

> **人間のあなたへ**: このファイルを丸ごと、お使いのAI（Claude Code）に貼ってください。あるいはこのURLを貼って「この手順書に従って接続して」でも動きます。あなたの手番はブラウザでのGoogleログイン1回。所要5分ほどです。
> これができると、GPSの移植のときにAIがNotebookLMの知識の**中身まで**読めるようになります（Takeoutの控えでは名前しか写らなかった部分です）。

---

あなた（AI）に、NotebookLM MCP接続の設置をお願いします。以下の手順書に従って進めてください。

## 安全の線（最初に依頼主へそのまま伝えて、進めてよいか確認を取る）

- 使うのは非公式ツール notebooklm-mcp-cli（MITライセンス・Google公式サポート外）。仕様変更で突然動かなくなる可能性があります
- Cookie認証方式。ログイン情報はこのPC内に保存されます。共有PCでは進めないでください
- 顧客情報・医療情報・機密を含むNotebookには接続しないでください。読み取り専用で使うのが安全です
- Googleのパスワードは依頼主本人がブラウザで入力します。あなた（AI）はパスワードを尋ねない・扱わない

## STEP 1: インストール（あなたが実行）

```
python3 -m venv ~/.notebooklm-mcp/venv
~/.notebooklm-mcp/venv/bin/pip install notebooklm-mcp-cli
```

## STEP 2: ログイン（ここで必ず止まる）

次のコマンドを実行するとブラウザが開きます。

```
~/.notebooklm-mcp/venv/bin/nlm login
```

ブラウザでのGoogleログインは依頼主本人の手番です。「ブラウザでログインが終わったら教えてください」と伝えて、返事があるまで待ってください。

## STEP 3: 確認（あなたが実行）

```
~/.notebooklm-mcp/venv/bin/nlm login --check
```

「Authentication valid!」と Notebooks found の件数が出たら成功です。出なければSTEP 2からやり直してください。

## STEP 4: Claude Codeに登録（あなたが実行）

```
claude mcp add --scope user gemini-notebook-mcp ~/.notebooklm-mcp/venv/bin/notebooklm-mcp
claude mcp list
```

「✓ Connected」が出たら完成です。次に開いたセッションからNotebookの中身が読めます。

## つまずいたら

公式の `nlm setup add claude-code` は「✗ Failed to connect」になることがあります（コマンドの場所が伝わらないため）。上のフルパス登録なら通ります。

それでも詰まったら、症状と画面の表示を依頼主に伝えて止まってください。無理に別の方法を試さないでください。

## 最後に（あなたが報告する）

設置できたら「これでgem-port-skillsの移植のとき、Notebookの知識まで読めます」と依頼主に報告してください。

Codexなど別のAIをお使いの場合は、STEP 1〜3は同じで、STEP 4だけお使いのAIのMCP登録手順に読み替えてください。

---

この手順書は、同梱のAI用説明書（SETUP）§6と同じ内容の1枚抜き出しです。コマンドは開発時に実測済み（2026年8月16日・macOS）。環境により結果は変わります。

困ったときは公式LINE（購入後30日間・症状と画面の表示だけお送りください）: https://lin.ee/P5qMYBk
