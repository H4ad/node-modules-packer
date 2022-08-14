import { Readable } from 'stream';
import { expect } from 'chai';
import { streamToUInt8Array } from '../../../src/common/string-to-uint';

describe('streamToUInt8Array', () => {
  it('should convert correctly the readable', async () => {
    const ints = 'teste'.split('').map(c => c.charCodeAt(0));

    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const test = Readable.from([ints]);

    const uint8Array = await streamToUInt8Array(test);

    expect([...uint8Array.values()]).to.members(ints);
  });

  it('should throw error if readable got error', async () => {
    const ints = 'teste'.split('').map(c => c.charCodeAt(0));

    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const test = Readable.from([ints]);
    const fakeError = new Error('fake');

    test.once('data', () => {
      test.emit('error', fakeError);
    });

    let error: Error | null = null;

    await streamToUInt8Array(test).catch(err => {
      error = err;
    });

    expect(error!.message).to.eq(fakeError.message);
  });
});
