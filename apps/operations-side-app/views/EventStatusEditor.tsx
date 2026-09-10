import React, { useState } from 'react';
import { SdkClient, OperationStatus, ApiError } from '../../utils/sdk';

interface EventStatusEditorProps {
  sdkClient: SdkClient;
  secretId: string;
  currentStatus?: OperationStatus;
  onStatusUpdated?: (newStatus: OperationStatus) => void;
}

const STATUS_OPTIONS: { key: OperationStatus; label: string }[] = [
  { key: 'operating', label: '運営中 (operating)' },
  { key: 'preparing', label: '準備中 (preparing)' },
  { key: 'paused', label: '休止中 (paused)' },
  { key: 'under-maintenance', label: '点検中 (under-maintenance)' },
];

export const EventStatusEditor: React.FC<EventStatusEditorProps> = ({
  sdkClient,
  secretId,
  currentStatus = 'operating',
  onStatusUpdated,
}) => {
  const [status, setStatus] = useState<OperationStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await sdkClient.adminEvents.updateEventStatus({
        secret_id: secretId,
        status: status,
      });

      alert(`運営状況を「${STATUS_OPTIONS.find((s) => s.key === status)?.label}」に更新しました。`);
      if (onStatusUpdated) {
        onStatusUpdated(status);
      }
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        alert(`運営状況の更新に失敗しました: ${err.message}`);
      } else {
        alert('予期せぬエラーが発生しました。');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>出し物の運営状況の編集</h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
          現在のステータス
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OperationStatus)}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '6px',
            border: '1px solid #ccc',
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleUpdate}
        disabled={isUpdating}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: isUpdating ? '#ccc' : '#228BE6',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: isUpdating ? 'not-allowed' : 'pointer',
        }}
      >
        {isUpdating ? '更新中...' : '確定して送信'}
      </button>
    </div>
  );
};
