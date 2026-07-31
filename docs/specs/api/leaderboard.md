# leaderboard

## 概要
各種期間(直近1時間、今日、2日間)のハイスコアを取得するためのAPI。

---

## 基本情報
| 項目 | 内容 |
|---|---|
| 通信方式 | REST API |
| データ形式 | JSON(`application/json`) |
| HTTPメソッド | GET |
| エンドポイント | `/api/leaderboard` |

---

## レスポンス仕様

### 成功時

#### ボディ
各種ベストスコアのオブジェクト。

#### ステータスコード
以下のステータスコードで応答。

```
200
```

#### パラメータ
| キー | 型 | 内容 |
|---|---|---|
| `hourly_high_score` | `number` | 直近1時間以内における全プレイヤーの最高得点(整数)。 |
| `todays_high_score` | `number` | 本日中における最高得点(整数)。 |
| `two_days_high_score` | `number` | 直近2日間における最高得点(整数)。 |

#### サンプル
```json
{
  "hourly_high_score": 100,
  "todays_high_score": 200,
  "two_days_high_score": 5000
}
```

### 失敗時

#### ボディ
接続エラーや不正なリクエストがあった場合のレスポンスボディ。

#### ステータスコード
以下のステータスコードで応答。

```
400
```

#### パラメータ
| キー | 型 | 内容 |
|---|---|---|
| `message` | `string` | エラーメッセージ。 |

#### サンプル
```json
{
  "message": "Invalid subscription action."
}
```
