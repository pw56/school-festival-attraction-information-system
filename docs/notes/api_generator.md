# OASのコマンド

## バンドル
```bash
npx @redocly/cli bundle ./events/openapi.yml -o ./bundled/events.yml
npx @redocly/cli bundle ./tickets/openapi.yml -o ./bundled/tickets.yml
npx @redocly/cli bundle ./map/openapi.yml -o ./bundled/map.yml
npx @redocly/cli bundle ./system/openapi.yml -o ./bundled/system.yml
npx @redocly/cli bundle ./logs/openapi.yml -o ./bundled/logs.yml
```

## 中間処理
人力でスキーマのファイルコピーして`$ref`のパスを書き換え

## SDK生成
```bash
npx openapi-ts -i ./bundled/events.yml -o ../../../apps/utils/sdk/events
npx openapi-ts -i ./bundled/tickets.yml -o ../../../apps/utils/sdk/tickets
npx openapi-ts -i ./bundled/map.yml -o ../../../apps/utils/sdk/map
npx openapi-ts -i ./bundled/system.yml -o ../../../apps/utils/sdk/system
npx openapi-ts -i ./bundled/logs.yml -o ../../../apps/utils/sdk/logs
```