// openapi-ts.config.ts
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './openapi.yml',
  output: '../../../apps/utils/sdk',
  plugins: [
    '@hey-api/typescript', // 型定義の生成
    {
      name: '@hey-api/sdk',  // SDKの生成プラグイン
      operations: { strategy: 'byTags' }, // タグごとにクラス分割
      client: '@hey-api/client-fetch',
    }
  ]
});
