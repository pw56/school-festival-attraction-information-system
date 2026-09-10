import React, { useState } from 'react';
import { SdkClient, Event, ApiError } from '../sdk';
import { processThumbnailImage } from '../utils/imageProcessor';

interface EventInfoEditorProps {
  sdkClient: SdkClient;
  secretId: string;
  event: Event;
  onUpdated: (updatedEvent: Event) => void;
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
  sdkClient,
  secretId,
  event,
  onUpdated,
}) => {
  const [formData, setFormData] = useState<Partial<Event>>({ ...event });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    key: keyof Event,
    value: any
  ) => {
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
    const next = current.includes(key as any)
      ? current.filter((item) => item !== key)
      : [...current, key as any];
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
      // 1. サムネイル画像の中央クロップ・リサイズ・WebP(50%)変換
      const processedBlob = await processThumbnailImage(selectedFile);

      // 2. updateEvent API コール
      const response = await sdkClient.adminEvents.updateEvent({
        secret_id: secretId,
        thumbnail_data: processedBlob,
        eventData: formData,
      });

      alert('出し物情報を更新しました。');
      onUpdated(response.data);
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        alert(`更新に失敗しました: ${err.message}`);
      } else {
        alert('画像の処理または更新リクエスト中にエラーが発生しました。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>出し物の情報の設定</h2>

      <div style={styles.field}>
        <label style={styles.label}>出し物名</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>説明</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          style={styles.textarea}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>出し物の種類 (Type)</label>
        <select
          value={formData.type || ''}
          onChange={(e) => handleInputChange('type', e.target.value)}
          style={styles.select}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>サムネイル画像 (自動WebP変換・中央クロップ)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setSelectedFile(e.target.files[0]);
            }
          }}
          required
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>位置情報</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div>
            緯度:
            <input
              type="number"
              step="any"
              value={formData.location?.lat ?? 0}
              onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value))}
              style={styles.inputNum}
            />
          </div>
          <div>
            経度:
            <input
              type="number"
              step="any"
              value={formData.location?.lng ?? 0}
              onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value))}
              style={styles.inputNum}
            />
          </div>
          <div>
            階数:
            <input
              type="number"
              value={formData.location?.floor ?? 1}
              onChange={(e) => handleLocationChange('floor', parseInt(e.target.value, 10))}
              style={styles.inputNum}
            />
          </div>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>1グループの最大人数</label>
        <input
          type="number"
          min="1"
          value={formData.max_party_size || 1}
          onChange={(e) => handleInputChange('max_party_size', parseInt(e.target.value, 10))}
          style={styles.inputNum}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>制限事項 (Restrictions)</label>
        <input
          type="text"
          value={formData.restrictions || ''}
          onChange={(e) => handleInputChange('restrictions', e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>バリアフリー・アクセシビリティ</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {ACCESSIBILITY_OPTIONS.map((item) => (
            <label key={item.key} style={{ fontSize: '14px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={(formData.accessibility || []).includes(item.key as any)}
                onChange={() => handleAccessibilityToggle(item.key)}
              />
              {' ' + item.label}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          ...styles.submitBtn,
          backgroundColor: isSubmitting ? '#ccc' : '#228BE6',
        }}
      >
        {isSubmitting ? '処理中...' : '更新'}
      </button>
    </form>
  );
};

const styles: Record<string, React.CSSProperties> = {
  form: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  input: {
    padding: '8px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  textarea: {
    padding: '8px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  select: {
    padding: '8px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  inputNum: {
    padding: '6px',
    fontSize: '14px',
    width: '100px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginLeft: '4px',
  },
  submitBtn: {
    marginTop: '12px',
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};
