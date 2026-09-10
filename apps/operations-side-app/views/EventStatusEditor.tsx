import React, { useState } from 'react';

export type OperationStatus = 'operating' | 'preparing' | 'paused' | 'under-maintenance';

interface EventStatusEditorProps {
  secretId: string;
  currentStatus?: OperationStatus;
  onStatusUpdated?: (newStatus: OperationStatus) => void;
}

const STATUS_OPTIONS: { key: OperationStatus; label: string }[] = [
  { key: 'operating', label: '運営中' },
  { key: 'preparing', label: '準備中' },
  { key: 'paused', label: '休止中' },
  { key: 'under-maintenance', label: '点検中' },
];

export const EventStatusEditor: React.FC<EventStatusEditorProps> = ({
  secretId,
  currentStatus = 'operating',
  onStatusUpdated,
}) => {
  const [status, setStatus] = useState<OperationStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('https://example.com/admin/events/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret_id: secretId,
          status: status,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const label = STATUS_OPTIONS.find((s) => s.key === status)?.label;
      alert(`運営状況を「${label}」に更新しました。`);
      if (onStatusUpdated) {
        onStatusUpdated(status);
      }
    } catch (err: any) {
      console.error(err);
      if (err instanceof Error) {
        alert(`運営状況の更新に失敗しました: ${err.message}`);
      } else {
        alert('予期せぬエラーが発生しました。');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">出し物の運営状況の編集</h2>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          ステータス選択
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OperationStatus)}
          className="w-full rounded-lg border border-gray-300 p-3 text-base text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleUpdate}
        disabled={isUpdating}
        className={`w-full rounded-lg py-3 text-base font-bold text-white shadow transition ${
          isUpdating
            ? 'cursor-not-allowed bg-gray-400'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {isUpdating ? '更新中...' : '確定して送信'}
      </button>
    </div>
  );
};
