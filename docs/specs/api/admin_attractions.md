# admin/attractions

## 概要
管理画面（運営）向けの出し物登録・設定編集用API群。profiles ディレクトリの手書き編集を避けるため、管理画面から編集可能にする。

---

## 基本情報
- 通信方式: REST API
- データ形式: JSON(`application/json`)
- パスプレフィックス: `/api/admin/attractions`

---

## 1) 出し物一覧取得
- メソッド: GET
- エンドポイント: `/api/admin/attractions`
- 説明: 管理画面で編集対象を一覧表示するためのメタ情報を返す。

成功サンプル:
```json
[
  { "id": "exciting_coaster", "name": "エキサイティングコースター", "slug": "exciting_coaster" }
]
```

---

## 2) 出し物作成
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

## 3) 出し物更新
- メソッド: PUT
- エンドポイント: `/api/admin/attractions/{id}`

リクエストボディ: 更新する設定オブジェクト。

成功時: `200` と更新済みオブジェクト。

---

## 4) 出し物削除
- メソッド: DELETE
- エンドポイント: `/api/admin/attractions/{id}`

成功時: `200` または `204`。

---

## 認可
- 管理用 API は認証・認可が必要（実装側で API トークンやセッション認証を導入すること）。
