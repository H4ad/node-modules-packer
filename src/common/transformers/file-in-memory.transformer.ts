import { Transform, TransformCallback } from 'stream';

export class FileInMemoryTransformer extends Transform {
  constructor() {
    super();

    this.memory = Buffer.alloc(0);
  }

  private memory: Buffer;

  _transform(chunk: Buffer, _: string, cb: TransformCallback): void {
    this.memory = Buffer.concat([this.memory, chunk]);
    cb();
  }

  _flush(cb: TransformCallback): void {
    this.push(this.memory);
    cb();
  }
}
