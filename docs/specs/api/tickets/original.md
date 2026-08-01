# tickets / reservations

## 概要
整理券（チケット）機能に関するAPI群。整理券の取得、キャンセル、ユーザーの予約一覧取得を提供する。管理画面は別途管理用APIを用意する想定。

---

## 共通
- データ形式: JSON(`application/json`)
- 通信方式: REST API

---

## 1) 整理券取得

### 概要
指定した出し物の整理券を取得するAPI。重複取得の禁止や時間指定、キャンセル・リカバリ機能をサポートする。

### 基本情報
| 項目 | 内容 |
|---|---|
| HTTPメソッド | POST |
| エンドポイント | `/api/tickets/reserve` |

### リクエストボディ
| キー | 型 | 内容 |
|---|---|---|
| `attraction_id` | `string` | 取得対象の出し物ID。 |
| `user_id` | `string` | 予約者を識別するID（匿名可だが重複防止のため何らかの識別子を推奨）。 |
| `scheduled_time` | `string|null` | （オプション）時間指定がある場合の ISO8601 形式の時刻。無ければ `null`。 |

#### 成功時
ステータスコード: `200`

ボディサンプル:
```json
{
  "ticket_id": "tkt_12345",
  "attraction_id": "exciting_coaster",
  "user_id": "user_abc",
  "scheduled_time": "2026-08-01T15:00:00+09:00",
  "message": "Ticket reserved successfully."
}
```

#### 失敗時
ステータスコード: `400`

ボディサンプル:
```json
{ "message": "User already has a ticket in this time slot." }
```

---

## 2) 整理券キャンセル

### 概要
取得済みの整理券をキャンセルするAPI。

### 基本情報
| 項目 | 内容 |
|---|---|
| HTTPメソッド | POST |
| エンドポイント | `/api/tickets/cancel` |

### リクエストボディ
| キー | 型 | 内容 |
|---|---|---|
| `ticket_id` | `string` | キャンセル対象の整理券ID。 |
| `user_id` | `string` | キャンセルを行うユーザーのID（照合用）。 |

#### 成功時
ステータスコード: `200`

ボディサンプル:
```json
{ "message": "Ticket cancelled successfully." }
```

#### 失敗時
ステータスコード: `400`

ボディサンプル:
```json
{ "message": "Ticket not found or user mismatch." }
```

---

## 3) ユーザーの予約一覧取得

### 概要
指定ユーザーが取得した整理券の一覧を取得する。

### 基本情報
| 項目 | 内容 |
|---|---|
| HTTPメソッド | GET |
| エンドポイント | `/api/tickets?user_id={user_id}` |

#### 成功時
ステータスコード: `200`

ボディサンプル:
```json
[
  { "ticket_id": "tkt_12345", "attraction_id": "exciting_coaster", "scheduled_time": "2026-08-01T15:00:00+09:00" }
]
```

#### 失敗時
ステータスコード: `400`

ボディサンプル:
```json
{ "message": "Unable to fetch tickets." }
```
