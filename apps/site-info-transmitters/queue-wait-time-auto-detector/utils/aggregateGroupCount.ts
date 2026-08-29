class AggregateGroupCount {
  #data: number[];
  #nextIndex: number;
  #max: number;

  constructor() {
    this.#data = [];
    this.#nextIndex = 0;
    this.#max = 0;
  }

  record(count: number): void {
    this.#data[this.#nextIndex] = count;
    this.#nextIndex++;
    if (count > this.#max) {
      this.#max = count;
    }
  }

  clear(): void {
    this.#data.length = 0;
    this.#nextIndex = 0;
    this.#max = 0;
  }

  getMax(): number {
    return this.#max;
  }
}

// 読み込み時に1つだけ生成してエクスポート
export const aggregateGroupCount = new AggregateGroupCount();
