# 出し物情報アプリ

## 実装メモ
- ほぼFigmaに仕様とか書いてるので参照
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

## 使用ライブラリ・フレームワーク・プラグイン
- React 19
- vite-plugin-pwa 1.3
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