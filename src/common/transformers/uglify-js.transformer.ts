import { Transform, TransformCallback } from 'stream';
import { MinifyOptions, minify } from 'terser';

export class UglifyJsTransformer extends Transform {
  constructor(
    protected readonly filePath: string,
    protected readonly uglifyOptions: MinifyOptions = {},
  ) {
    super();
  }

  protected chunks: number = 0;

  async _transform(
    chunk: Buffer,
    encoding: string,
    callback: TransformCallback,
  ): Promise<void> {
    if (this.chunks > 0) {
      return callback(
        new Error(
          'This transformer should not be called more than once. Check if you use MemoryStream before using UglifyJsTransformer',
        ),
      );
    }

    console.log(`${this.filePath}:${chunk.byteLength}`);

    const code = chunk.toString('utf-8');
    const result = await minify(code, this.uglifyOptions).catch(() => null);
    const data =
      !result || !result.code ? chunk : Buffer.from(result.code, 'utf-8');

    this.chunks++;

    this.push(data);

    callback();
  }
}
