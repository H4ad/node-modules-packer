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
    await new Promise<void>((resolve, reject) => {
      (async () => {
        const zipfile = new ZipFile();
        const stream = createWriteStream(outputPath).once('error', reject);

        zipfile.outputStream.pipe(stream);

        for (const artifact of zipArtifacts) {
          await this.handleArtifact(artifact, zipfile, rootPath, reject).catch(
            reject,
          );
        }

        zipfile.end();

        stream.once('error', reject).once('close', () => resolve());
      })();
    });
  }

  readdirAndAddToZip(
    zipFile: ZipFile,
    rootPath: string,
    source: ZipArtifact,
    path: string,
    onErrorOnStream: (reason?: any) => void,
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

          if (stats.isDirectory()) {
            this.readdirAndAddToZip(
              zipFile,
              rootPath,
              source,
              filePath,
              onErrorOnStream,
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
              const readStream = createReadStream(filePath).once('error', err =>
                onErrorOnStream(err),
              );

              zipFile.addReadStream(readStream, normalize(metadataPath));
            }

            pending -= 1;

            if (!pending) return callback(null);
          }
        });
      });
    });
  }

  private async handleArtifact(
    artifact: ZipArtifact,
    zipfile: ZipFile,
    rootPath: string,
    onErrorOnStream: (reason?: any) => void,
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      try {
        if (artifact.type === 'directory') {
          this.readdirAndAddToZip(
            zipfile,
            rootPath,
            artifact,
            artifact.path,
            onErrorOnStream,
            err => {
              if (err) reject(err);
              else resolve();
            },
          );
        } else {
          const metadataPath = artifact.metadataPath
            ? artifact.path.replace(artifact.path, artifact.metadataPath)
            : relative(rootPath, artifact.path);
          const readStream = createReadStream(artifact.path).once(
            'error',
            err => {
              onErrorOnStream(err);
            },
          );

          zipfile.addReadStream(readStream, normalize(metadataPath));
          resolve();
        }
      } catch (e) {
        reject(e);
      }
    });
  }
}
