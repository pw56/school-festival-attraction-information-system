# 管理者向けAPI群

## 概要
管理画面（運営）向けの出し物登録・設定編集用API。

---

## 基本情報
- 通信方式: REST API
- データ形式: JSON(`application/json`)
- パスプレフィックス: `/api/admin/attractions`

---

## 1) 出し物作成(追加)
- メソッド: POST
- エンドポイント: `/api/admin/attractions`

リクエストボディ（例）:
```json
{
  "id": "new_ride",
  "name": "ニューライド",
  "settings": { }
}
```

成功時: `201 Created` と作成したリソース情報を返す。

---

## 2) 出し物更新
- メソッド: PUT
- エンドポイント: `/api/admin/attractions/{id}`

リクエストボディ: 更新する設定オブジェクト。

成功時: `200` と更新済みオブジェクト。

---

## 3) 出し物削除
- メソッド: DELETE
- エンドポイント: `/api/admin/attractions/{id}`

成功時: `200` または `204`。
