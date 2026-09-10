// openapi-ts.config.ts
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-fetch',
  plugins: [
    '@hey-api/typescript', // 型定義の生成
    {
      name: '@hey-api/sdk',  // SDKの生成プラグイン
      asClass: true,         // クラス形式として出力
      services: 'tags-split' // tagsごとにファイルを分割してクラス化
    }
  ]
});
