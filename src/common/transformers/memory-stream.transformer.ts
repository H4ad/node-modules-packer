import { Transform } from 'stream';

export class MemoryStream extends Transform {
  constructor(private readonly desiredChunkSize: number) {
    super();

    this.memory = Buffer.alloc(0);
  }

  private memory: Buffer;

  _transform(chunk: Buffer, _: string, cb: () => void): void {
    if (
      Buffer.byteLength(this.memory) + Buffer.byteLength(chunk) >=
      this.desiredChunkSize
    ) {
      this.push(this.memory);

      this.memory = Buffer.alloc(0);
    }

    this.memory = Buffer.concat([this.memory, chunk]);

    cb();
  }

  _flush(cb: () => void): void {
    this.push(this.memory);

    cb();
  }
}
