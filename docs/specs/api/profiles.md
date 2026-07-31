# profiles

## 概要
出し物ごとの設定プロファイル（profiles ディレクトリにある設定）の一覧と個別取得用API。管理画面やデプロイ時の確認に使用する。

---

## 基本情報
| 項目 | 内容 |
|---|---|
| 通信方式 | REST API |
| データ形式 | JSON(`application/json`) |
| HTTPメソッド | GET |
| エンドポイント | `/api/profiles` `/api/profiles/{slug}` |

---

## レスポンス仕様（一覧）

### 成功時

#### ボディ
プロファイルのメタ情報配列。

#### ステータスコード
```
200
```

#### パラメータ
| キー | 型 | 内容 |
|---|---|---|
| `slug` | `string` | プロファイル識別子（例: `exciting_coaster`）。 |
| `name` | `string` | 表示名。 |
| `thumbnail_url` | `string|null` | サムネイルがあればURL。 |

#### サンプル
```json
[
  { "slug": "exciting_coaster", "name": "エキサイティングコースター", "thumbnail_url": "https://.../thumbnail.png" }
]
```

## レスポンス仕様（個別）

### 成功時

#### ボディ
プロファイルの設定ファイル相当のオブジェクト（出し物ページのレンダリングに必要な設定一式）。

#### ステータスコード
```
200
```

#### サンプル（抜粋）
```json
{
  "slug": "exciting_coaster",
  "name": "エキサイティングコースター",
  "thumbnail_url": "https://.../thumbnail.png",
  "settings": {
    "accessibility_options": ["車椅子対応", "字幕あり"],
    "display_order": 10
  }
}
```

### 失敗時

#### ステータスコード
```
404
```

#### ボディ
```json
{ "message": "Profile not found." }
```
