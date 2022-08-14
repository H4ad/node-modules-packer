import { Readable } from 'stream';

export function streamToUInt8Array(stream: Readable): Promise<Uint8Array> {
  const chunks: Buffer[] = [];
  return new Promise<Uint8Array>((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('error', err => reject(err));
    stream.on('end', () => {
      const b = Buffer.concat(chunks);

      resolve(
        new Uint8Array(
          b.buffer,
          b.byteOffset,
          b.byteLength / Uint8Array.BYTES_PER_ELEMENT,
        ),
      );
    });
  });
}
