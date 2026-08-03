# 採用サービス候補

- アプリのホスティング: Cloudflare Pages
- 運営側のページのホスティング: Cloudflare Pages
- 出し物一覧のような更新頻度の少ない公開API: JSONファイル
  ※ Cloudflare Pagesにファイルとしてデプロイして、キャッシュ禁止で実質API
  ※ 運営で急遽情報の変更があり得るので、更新頻度は低くてもキャッシュ禁止
- 整理券の取得・認証: Cloudflare Workers + Cloudflare D1
  ※ D1はPagesやR2には標準で用意されていないトランザクション処理ができ、節約した場合にKVよりも書き込める回数が多いので採択
- 待機列の待ち時間: Cloudflare Workers + Cloudflare D1
  ※ KVは遅い、R2はDB機能がなく、ログのダウンロードが大変なのでD1を採択

※ Honoで開発すれば、ローカルのPCでも
  - Cloudflare Tunnels
  - Nginx
  - Node.js
  の構成で動かせる
