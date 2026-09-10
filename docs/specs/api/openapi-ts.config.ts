// openapi-ts.config.ts
import { defineConfig } from '@hey-api/openapi-ts';

const dir = 'events';

export default defineConfig({
  input: `./${dir}/openapi.yml`,
  output: `../../../apps/utils/sdk/${dir}`,
  plugins: [
    '@hey-api/typescript', // 型定義の生成
    {
      name: '@hey-api/sdk',  // SDKの生成プラグイン
      operations: { strategy: 'byTags' }, // タグごとにクラス分割
      client: '@hey-api/client-fetch'
    }
  ]
});
