# attraction (個別ページ)

## 概要
特定の出し物の詳細情報を取得するためのAPI。出し物の個別ページで表示する情報（サムネイル、待ち時間、マップ、その他情報）を返す。

---

## 基本情報
| 項目 | 内容 |
|---|---|
| 通信方式 | REST API |
| データ形式 | JSON(`application/json`) |
| HTTPメソッド | GET |
| エンドポイント | `/api/attractions/{id}` |

---

## リクエスト仕様

### パスパラメータ
| キー | 型 | 内容 |
|---|---|---|
| `id` | `string` | 出し物のID（`/api/attractions` の `id` と同じ）。 |

---

## レスポンス仕様

### 成功時

#### ボディ
出し物の詳細オブジェクト。

#### ステータスコード
```
200
```

#### パラメータ
| キー | 型 | 内容 |
|---|---|---|
| `id` | `string` | 出し物ID。 |
| `name` | `string` | 出し物名。 |
| `thumbnail_url` | `string` | サムネイル画像URL。 |
| `description` | `string` | 詳細説明（HTML またはマークダウンの可能性あり）。 |
| `wait_time` | `number|null` | 現在の待ち時間（分）。無い場合は `null`。 |
| `map_image_url` | `string|null` | マップ画像のURL（ポップアップ用）。 |
| `accessibility` | `object[]` | アクセシビリティ設定の配列。各要素は `{ "label": string, "value": string }` 形式。 |
| `other_info` | `object[]` | ラベルとコンテンツの配列。各要素は `{ "label": string, "content": string }`。
| `has_ticketing` | `boolean` | 整理券機能の有無。 |

#### サンプル
```json
{
  "id": "exciting_coaster",
  "name": "エキサイティングコースター",
  "thumbnail_url": "https://.../thumbnail.png",
  "description": "強烈な振動と急降下が特徴のコースターです。",
  "wait_time": 25,
  "map_image_url": "https://.../map.png",
  "accessibility": [
    { "label": "車椅子対応", "value": "false" },
    { "label": "身長制限", "value": "120cm以上" }
  ],
  "other_info": [
    { "label": "注意事項", "content": "妊娠中の方は利用をご遠慮ください。" }
  ],
  "has_ticketing": true
}
```

### 失敗時

#### ステータスコード
```
404
```

#### ボディ
```json
{
  "message": "Attraction not found."
}
```
