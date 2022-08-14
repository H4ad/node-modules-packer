import { Readable } from 'stream';

// credits: https://github.com/feross/string-to-stream
export class StringStream extends Readable {
  constructor(
    protected readonly str: string,
    protected readonly encoding?: 'utf8',
  ) {
    super();

    this.encoding = encoding || 'utf8';
  }

  protected ended?: boolean;

  _read() {
    if (!this.ended) {
      process.nextTick(() => {
        this.push(Buffer.from(this.str, this.encoding));
        this.push(null);
      });
      this.ended = true;
    }
  }
}
