import fs, { createReadStream, createWriteStream } from 'fs';
import { join, relative } from 'path';
import { ZipFile } from 'yazl';

export interface ZipArtifact {
  path: string;
  name: string;
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
      await new Promise<void>((resolve, reject) => {
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
          const metadataPath = relative(rootPath, artifact.path);
          const readStream = createReadStream(artifact.path);

          zipfile.addReadStream(readStream, metadataPath);
          resolve();
        }
      });
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
              const metadataPath = relative(rootPath, filePath);
              const readStream = createReadStream(filePath);

              zipFile.addReadStream(readStream, metadataPath);
            }

            pending -= 1;

            if (!pending) return callback(null);
          }
        });
      });
    });
  }
}
