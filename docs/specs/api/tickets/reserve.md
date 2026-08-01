# reserve

## 概要
指定した出し物の整理券を取得するAPI。

## 基本情報
| 項目 | 内容 |
|---|---|
| 通信方式 | REST API |
| データ形式 | JSON(`application/json`) |
| HTTPメソッド | POST |
| エンドポイント | `/api/tickets/reserve` |

## リクエスト仕様

### ボディの内容


### パラメータ
| キー | 型 | 内容 |
|---|---|---|
| `attraction_id` | `string` | 取得対象の出し物ID。 |
| `scheduled_time` | `string \| null` | （オプション）時間指定がある場合の ISO8601 形式の時刻。無ければ `null`。 |

## 成功時

### ステータスコード
以下のステータスコードで応答。
```
200
```

### ボディ
チケットのIDとメッセージ。
チケットの情報は別のAPIで取得するので、このAPIでは返さない。

サンプル
```json
{
  "ticket_id": "5f2d28d2-5d18-21e8-f32b-dafb0a67babb", // UUID
  "message": "Ticket reserved successfully."
}
```

### 失敗時
ステータスコード: `400`

ボディサンプル:
```json
{ "message": "User already has a ticket in this time slot." }
```
