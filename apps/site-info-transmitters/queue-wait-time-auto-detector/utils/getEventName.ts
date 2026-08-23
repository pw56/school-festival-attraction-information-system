// API等から出し物名を取得する関数
export async function getEventName(uuid: string): Promise<string> {
  // 現時点ではモックとして固定値を返します
  return 'ワクワクコースター';
}
