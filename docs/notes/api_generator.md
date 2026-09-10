# OASのコマンド

## バンドル
@hey-api/openapi-ts はむしろバンドルしてはいけない(参照の相対パス壊れるから)

## SDK生成
```bash
npx openapi-ts -i ./events/openapi.yml -o ../../../apps/utils/sdk/events
npx openapi-ts -i ./tickets/openapi.yml -o ../../../apps/utils/sdk/tickets
npx openapi-ts -i ./map/openapi.yml -o ../../../apps/utils/sdk/map
npx openapi-ts -i ./system/openapi.yml -o ../../../apps/utils/sdk/system
npx openapi-ts -i ./logs/openapi.yml -o ../../../apps/utils/sdk/logs
```
