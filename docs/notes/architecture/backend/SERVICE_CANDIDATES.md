# 採用サービス候補

- アプリのホスティング: Cloudflare Pages
- 運営側のページのホスティング: Cloudflare Pages
- 出し物一覧のような更新頻度の少ない公開API: JSONファイル(Cloudflare Pagesにファイルとしてデプロイして、キャッシュ禁止で実質API)
- 整理券の取得・認証: Cloudflare Workers + Cloudflare D1
- 整理券のIDを使った、整理券の情報の取得: JSONファイル(Cloudflare Pagesにファイルとしてデプロイして、キャッシュ禁止で実質API)
  ※ エンドポイントがUUIDなのでそもそも狙われにくい
