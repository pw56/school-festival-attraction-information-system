export class EveryMinuteTimer {
  #callback: (() => void) | null = null;
  #timerId: ReturnType<typeof setTimeout> | null = null;

  constructor(callback?: () => void) {
    if (callback) {
      this.#callback = callback;
    }
  }

  onTick(callback: () => void): void {
    this.#callback = callback;
  }

  start(): void {
    this.stop();
    this.#scheduleNext();
  }

  stop(): void {
    if (this.#timerId !== null) {
      clearTimeout(this.#timerId);
      this.#timerId = null;
    }
  }

  #scheduleNext(): void {
    const now = new Date();
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    this.#timerId = setTimeout(() => {
      if (this.#callback) {
        this.#callback();
      }
      this.#scheduleNext();
    }, msUntilNextMinute);
  }
}
