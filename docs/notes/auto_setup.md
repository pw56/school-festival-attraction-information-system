# 初期化

- ユーザー(システムを利用する運営者)はGitHubのテンプレート機能で複製する(初期設定の設定ページは、GitHub公式チュートリアルのように、READMEにテンプレート作成リンクを貼ったバッジを設置して誘導)
- イニシャルコミットで、リポジトリに含まれている`init.yml`が発火して、`.github/steps/init.md`の一部にユーザーのユーザー名とリポジトリ名を注入して、リポジトリのREADMEに上書きしてプッシュ
- `init.yml`は条件式で、イニシャルコミットでしか走らないようにするため、自滅は不要
- `auto-setup.yml`は`repository_dispatch`で設定ページからのAPIと、念のため手動の`workflow_dispatch`で発火する
- 初期設定の設定ページは作者のリポジトリでホストされる1つのサイトしか使われない(テンプレート先で作られても使われることはないので放置されても問題ない)
- 初期設定ページではGitHub、Cloudflare、Firebaseの3つの認証トークン取得する
  - GitHubのOAuthはCORS制限があるため、作者でCloudflareでホストするトークン取得専用Workerを中継してトークン取得
  - そのWorkerは独立した作者が管理するCloudflareプロジェクトで、ユーザーには関係ない
  - CloudflareのOAuth取得はPKCEを使うのでシークレットは不要、ただしCORS制限回避のためこちらも中継Workerが必要
- `auto-setup.yml`は発火したら自動でビルドを回して、送られてきた認証トークンを使って各サービスに自動デプロイ
- `auto-setup.yml`は、Cloudflare Pagesデプロイ後に返ってきたURLを、`.github/steps/after-deploy.md`のバッジに注入して、リポジトリのREADMEに上書きしてプッシュ
