// UUIDが有効かどうかをチェックするAPIモック関数
export async function isValidSecretUuid(uuid: string): Promise<boolean> {
  // 現時点ではモックとして常に true を返します
  return true;
}
