class AggregateGroupCount {
  #data: number[];
  #max: number;

  constructor() {
    this.#data = [];
    this.#max = 0;
  }

  record(count: number): void {
    this.#data.push(count);

    // 最大値更新か確認
    if (count > this.#max) this.#max = count;
  }

  clear(): void {
    this.#data.length = 0;
    this.#max = 0;
  }

  getMax(): number {
    return this.#max;
  }
}

// 読み込み時に1つだけ生成してエクスポート
export const aggregateGroupCount = new AggregateGroupCount();
