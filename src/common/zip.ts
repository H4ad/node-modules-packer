import fs, { createReadStream, createWriteStream } from 'fs';
import { join, normalize, relative } from 'path';
import { ZipFile } from 'yazl';

export interface ZipArtifact {
  path: string;
  /**
   * @deprecated It will be removed in the next versions because it is not used
   */
  name: string;
  metadataPath?: string;
  type: 'file' | 'directory';
  shouldIgnore?: (fileName: string) => boolean;
}

export class FasterZip {
  public async run(
    rootPath: string,
    outputPath: string,
    zipArtifacts: ZipArtifact[],
  ): Promise<void> {
    const zipfile = new ZipFile();
    const stream = createWriteStream(outputPath);

    zipfile.outputStream.pipe(stream);

    for (const artifact of zipArtifacts) {
      try {
        await new Promise<void>((resolve, reject) => {
          try {
            if (artifact.type === 'directory') {
              this.readdirAndAddToZip(
                zipfile,
                rootPath,
                artifact,
                artifact.path,
                err => {
                  if (err) reject(err);
                  else resolve();
                },
              );
            } else {
              const metadataPath = artifact.metadataPath
                ? artifact.path.replace(artifact.path, artifact.metadataPath)
                : relative(rootPath, artifact.path);
              const readStream = createReadStream(artifact.path);

              zipfile.addReadStream(readStream, normalize(metadataPath));
              resolve();
            }
          } catch (e) {
            reject(e);
          }
        });
      } catch (e) {
        stream.destroy();

        throw new Error(e.message);
      }
    }

    zipfile.end();

    await new Promise<void>((resolve, reject) => {
      zipfile.outputStream.once('error', err => reject(err));

      stream.once('error', err => reject(err)).once('close', () => resolve());
    });
  }

  readdirAndAddToZip(
    zipFile: ZipFile,
    rootPath: string,
    source: ZipArtifact,
    path: string,
    callback: (err: Error | null) => void,
  ) {
    fs.readdir(path, (err, files) => {
      if (err) return callback(err);

      let pending = files.length;

      if (!pending) return callback(null);

      files.forEach(file => {
        const filePath = join(path, file);

        fs.stat(filePath, (_err, stats) => {
          if (_err) return callback(_err);

          try {
            if (stats.isDirectory()) {
              this.readdirAndAddToZip(
                zipFile,
                rootPath,
                source,
                filePath,
                __err => {
                  if (__err) return callback(__err);

                  pending -= 1;

                  if (!pending) return callback(null);
                },
              );
            } else {
              if (
                !source.shouldIgnore ||
                (source.shouldIgnore && !source.shouldIgnore(filePath))
              ) {
                const metadataPath = source.metadataPath
                  ? filePath.replace(source.path, source.metadataPath)
                  : relative(rootPath, filePath);
                const readStream = createReadStream(filePath);

                zipFile.addReadStream(readStream, normalize(metadataPath));
              }

              pending -= 1;

              if (!pending) return callback(null);
            }
          } catch (e) {
            callback(e);
          }
        });
      });
    });
  }
}
