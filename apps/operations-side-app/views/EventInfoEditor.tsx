import React, { useState } from 'react';
import { EventData } from '../App';
import { processThumbnailImage } from '../utils/imageProcessor';

interface EventInfoEditorProps {
  secretId: string;
  event: EventData;
  onUpdated: (updatedEvent: EventData) => void;
}

const EVENT_TYPES = [
  { key: 'food_and_drink', label: '飲食' },
  { key: 'vehicles', label: '乗り物' },
  { key: 'fair_stalls', label: '縁日' },
  { key: 'horror', label: 'ホラー' },
  { key: 'riddle_solving', label: '謎解き' },
  { key: 'sports', label: 'スポーツ' },
  { key: 'entertainment', label: 'エンタメ' },
  { key: 'product_sales', label: '物販' },
  { key: 'workshop', label: 'ワークショップ' },
  { key: 'exhibition', label: '展示' },
  { key: 'stage', label: 'ステージ' },
  { key: 'rest_area', label: '休憩所' },
  { key: 'information_desk', label: '案内所' },
  { key: 'restrooms', label: 'トイレ' },
  { key: 'stairs', label: '階段' },
  { key: 'elevator', label: 'エレベーター' },
  { key: 'first_aid_room', label: '救護室' },
  { key: 'parking_lot', label: '駐車場' },
  { key: 'others', label: 'その他' },
];

const ACCESSIBILITY_OPTIONS = [
  { key: 'wheelchair_accessible', label: '車椅子対応' },
  { key: 'step_free_access', label: '段差なし' },
  { key: 'accessible_restroom', label: '多機能トイレ' },
  { key: 'colorblind_friendly', label: '色弱対応' },
  { key: 'braille_pamphlet', label: '点字パンフレット・点字案内対応' },
  { key: 'audio_guide_available', label: '音声案内・音声ガイド対応' },
  { key: 'subtitled_video', label: '字幕付き動画' },
  { key: 'script_available', label: '台本の貸出対応' },
  { key: 'writing_board_available', label: '筆談ボード・筆談ツール対応' },
  { key: 'visual_instructions', label: '写真・イラスト付きの案内対応' },
  { key: 'assistant_dog_allowed', label: '補助犬同伴可' },
  { key: 'allergy_labels', label: 'アレルギー成分表示あり' },
];

export const EventInfoEditor: React.FC<EventInfoEditorProps> = ({
  secretId,
  event,
  onUpdated,
}) => {
  const [formData, setFormData] = useState<Partial<EventData>>({ ...event });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (key: keyof EventData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLocationChange = (key: 'lat' | 'lng' | 'floor', val: number) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        lat: prev.location?.lat ?? 0,
        lng: prev.location?.lng ?? 0,
        floor: prev.location?.floor ?? 1,
        [key]: val,
      },
    }));
  };

  const handleAccessibilityToggle = (key: string) => {
    const current = formData.accessibility || [];
    const next = current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key];
    setFormData((prev) => ({ ...prev, accessibility: next }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('サムネイル画像を選択してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      const processedBlob = await processThumbnailImage(selectedFile);

      const bodyFormData = new FormData();
      bodyFormData.append('secret_id', secretId);
      bodyFormData.append('thumbnail', processedBlob, 'thumbnail.webp');
      bodyFormData.append('eventData', JSON.stringify(formData));

      const res = await fetch('https://example.com/admin/events', {
        method: 'PUT',
        body: bodyFormData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const updatedData: EventData = await res.json();
      alert('出し物情報を更新しました。');
      onUpdated(updatedData);
    } catch (err: any) {
      console.error(err);
      if (err instanceof Error) {
        alert(`更新に失敗しました: ${err.message}`);
      } else {
        alert('画像の処理または更新リクエスト中にエラーが発生しました。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-800">出し物の情報の設定</h2>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">出し物名</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
          className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">説明</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">出し物の種類</label>
        <select
          value={formData.type || ''}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">
          サムネイル画像 (WebP自動変換 / 中央クロップ)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setSelectedFile(e.target.files[0]);
            }
          }}
          required
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">位置情報</label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <span className="text-xs text-gray-500">緯度</span>
            <input
              type="number"
              step="any"
              value={formData.location?.lat ?? 0}
              onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value))}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <span className="text-xs text-gray-500">経度</span>
            <input
              type="number"
              step="any"
              value={formData.location?.lng ?? 0}
              onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value))}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <span className="text-xs text-gray-500">階数</span>
            <input
              type="number"
              value={formData.location?.floor ?? 1}
              onChange={(e) => handleLocationChange('floor', parseInt(e.target.value, 10))}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">1グループの最大人数</label>
        <input
          type="number"
          min="1"
          value={formData.max_party_size || 1}
          onChange={(e) => handleInputChange('max_party_size', parseInt(e.target.value, 10))}
          className="w-32 rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">制限事項</label>
        <input
          type="text"
          value={formData.restrictions || ''}
          onChange={(e) => handleInputChange('restrictions', e.target.value)}
          className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">
          バリアフリー・アクセシビリティ
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ACCESSIBILITY_OPTIONS.map((item) => (
            <label key={item.key} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={(formData.accessibility || []).includes(item.key)}
                onChange={() => handleAccessibilityToggle(item.key)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full rounded-lg py-3 text-base font-bold text-white shadow transition ${
          isSubmitting
            ? 'cursor-not-allowed bg-gray-400'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {isSubmitting ? '処理中...' : '確定して送信'}
      </button>
    </form>
  );
};
