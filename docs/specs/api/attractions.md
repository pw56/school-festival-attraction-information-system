# attractions

## 概要
公開されている出し物（アトラクション）の一覧を取得するためのAPI。モバイルアプリのトップや一覧画面で利用する。

---

## 基本情報
| 項目 | 内容 |
|---|---|
| 通信方式 | REST API |
| データ形式 | JSON(`application/json`) |
| HTTPメソッド | GET |
| エンドポイント | `/api/attractions` |

---

## レスポンス仕様

### 成功時

#### ボディ
出し物の配列。各アイテムは簡易情報を含む。

#### ステータスコード
```
200
```

#### パラメータ
| キー | 型 | 内容 |
|---|---|---|
| `id` | `string` | 出し物を一意に識別するID（スラグやUUID）。 |
| `name` | `string` | 出し物名。 |
| `thumbnail_url` | `string` | サムネイル画像のURL。 |
| `short_description` | `string` | 短い概要。 |
| `wait_time` | `number` | 現在の待ち時間（分）。存在しない場合は `null`。 |
| `has_ticketing` | `boolean` | 整理券（チケット）機能の有無。 |

#### サンプル
```json
[
  {
    "id": "exciting_coaster",
    "name": "エキサイティングコースター",
    "thumbnail_url": "https://.../thumbnail.png",
    "short_description": "絶叫系のコースターです。",
    "wait_time": 30,
    "has_ticketing": true
  },
  {
    "id": "haunted_house",
    "name": "お化け屋敷",
    "thumbnail_url": "https://.../haunt.png",
    "short_description": "暗闇を進むホラー体験。",
    "wait_time": null,
    "has_ticketing": false
  }
]
```

### 失敗時

#### ステータスコード
```
400
```

#### ボディ
```json
{
  "message": "Unable to fetch attractions."
}
```
