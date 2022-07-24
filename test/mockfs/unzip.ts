import { createReadStream } from 'fs';
import unzipper from 'unzipper';

export async function getUnzipedFilesInMap(
  path: string,
): Promise<Map<string, boolean>> {
  const mapFiles = new Map();

  await new Promise<void>((resolve, reject) => {
    createReadStream(path)
      .pipe(unzipper.Parse())
      .on('entry', entry => {
        mapFiles.set(entry.path, true);
      })
      .on('finish', () => resolve())
      .on('error', reject);
  });

  return mapFiles;
}
