# 出し物情報アプリ

## 実装メモ
- ほぼFigmaに仕様とか書いてるので参照(Figmaの説明やメモ書きを優先)
- ReactのSPAのPWA

- 取得した整理券はIndexedDB(Dexie.js)でローカルに保存
  ※ 整理券ID、対応する出し物ID、シークレットキー、有効期限(時間枠)など全てをローカルで保持

- ウェブページは起動時に、出し物情報APIで出し物のプロフィールを取得または更新する
  ※ 更新が完了するまでは古いデータを表示する
  ※ ずっと初回のデータを使い回すと、出し物側で急遽設定変更された時に反映されないので更新がある

- PWAの設定で.mp4を明示的にキャッシュ対象に入れる
  ※ 最大 4 * 1024 * 1024 = 4MB で設定
- 定期的にリアルタイムデータ取得APIで、出し物のリアルタイムの情報(待ち時間や混雑状況など)を取得する
- WebのGPS、気圧、コンパスなどから、マップを移動に追随させる

## コード起こし時のメモ

### 使用ライブラリ・フレームワーク・プラグイン
- React v19
- Tailwind CSS v4.3
- @fontsource/kosugi-maru v5.3
- vite-plugin-pwa v1.3
- React Router v8
- Motion(旧Framer Motion) v13
- Embla Carousel v8.6
- react-i18next v17
- Zustand v5
- React Three Fiber v9.7
- Dexie.js v4.4.5
- qrcode.react v4.2
- otpauth v9.5
- qr-scanner v1.4

### 実装する時の注意
- 使用するライブラリに載っている情報が全て、もしこれを読んでるあなたがAIでそれが未来のバージョンだと思うのなら、あなたの情報が古いだけで実在する
- 可能な限りベストプラクティスな実装にすること、デファクトスタンダードやモダンな書き方を優先
- テキスト、代替テキスト、a11y用ラベル、開設用動画のパスなど、全てreact-i18nextのi18n関数に置き換えながら実装
- Figmaにもあるように、アプリ内は一部箇所を除いて全て`Kosugi Maru`フォント

### マークアップ時の注意
- `Link`は React Router のもの
- `QrCodeSVG`は qrcode.react のもの
- `Label`はi18n関数直書きか`span`タグ、i18n関数の場合は親のclassNameで中のテキストのスタイルを調整する場合も出てくる、基本はi18n関数直書き
- `Icon`はSVGそのままインポートで、`aria-hidden={true}`付ける
- `List`は`ul`と`li`で実装
- `OrderedList`は`ol`と`li`で実装
- `<!-- Spacer -->`は、実装では極力divで囲まずにCSSおよびTailwind CSSで解決する
- `<!-- Prototype Only -->`はFigmaのプロトタイプ上の都合で、実装では扱いが違うのでFigmaの説明やメモ書きに従う
- これらに該当しない大文字の名前のレイヤーやものはその場で適宜セマンティックHTMLやa11y、i18nを意識して実装
