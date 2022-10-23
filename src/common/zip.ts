import { Stats } from 'fs';
import { join, normalize, relative } from 'path';
import { ZipFile } from 'yazl';
import {
  readdirAsync,
  safeCreateReadStream,
  safeCreateWriteStream,
  statAsync,
} from './fs';
import { StringStream } from './string-stream';
import { streamToUInt8Array } from './string-to-uint';

export type TransformAsyncCode = (code: Uint8Array) => Promise<string>;

export interface ZipArtifact {
  path: string;
  /**
   * @deprecated It will be removed in the next versions because it is not used
   */
  name: string;
  metadataPath?: string;
  type: 'file' | 'directory';
  shouldIgnore?: (fileName: string) => boolean;
  transformer?: (
    filePath: string,
    metadataPath: string,
  ) => TransformAsyncCode | undefined;
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
        const stream = safeCreateWriteStream(outputPath).once('error', reject);

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

  protected async readdirAndAddToZip(
    zipFile: ZipFile,
    rootPath: string,
    source: ZipArtifact,
    path: string,
    onErrorOnStream: (reason?: any) => void,
  ) {
    const filePaths = await readdirAsync(path).then(files =>
      files.map(file => join(path, file)),
    );

    const filePathsAndStats: [string, Stats][] = await Promise.all(
      filePaths.map(async filePath => [filePath, await statAsync(filePath)]),
    );

    await Promise.all(
      filePathsAndStats.map(async ([filePath, stat]) => {
        if (stat.isFile()) {
          if (source.shouldIgnore && source.shouldIgnore(filePath)) return;

          await this.addFileToZip(
            zipFile,
            source,
            rootPath,
            filePath,
            onErrorOnStream,
          );
        } else {
          await this.readdirAndAddToZip(
            zipFile,
            rootPath,
            source,
            filePath,
            onErrorOnStream,
          );
        }
      }),
    );
  }

  protected async addFileToZip(
    zipFile: ZipFile,
    source: ZipArtifact,
    rootPath: string,
    filePath: string,
    onErrorOnStream: (reason?: any) => void,
  ): Promise<void> {
    const metadataPath = normalize(
      source.metadataPath
        ? filePath.replace(source.path, source.metadataPath)
        : relative(rootPath, filePath),
    );

    const transformer =
      source.transformer && source.transformer(filePath, metadataPath);

    const readStream = safeCreateReadStream(filePath).once('error', err =>
      onErrorOnStream(err),
    );

    if (transformer) {
      try {
        const code = await streamToUInt8Array(readStream);
        const finalContent = await transformer(code);

        const fileContentReadable = new StringStream(finalContent);

        zipFile.addReadStream(fileContentReadable, metadataPath);
      } catch (e) {
        zipFile.addReadStream(readStream, metadataPath);
      }
    } else zipFile.addReadStream(readStream, metadataPath);
  }

  protected async handleArtifact(
    artifact: ZipArtifact,
    zipfile: ZipFile,
    rootPath: string,
    onErrorOnStream: (reason?: any) => void,
  ): Promise<void> {
    if (artifact.type === 'directory') {
      await this.readdirAndAddToZip(
        zipfile,
        rootPath,
        artifact,
        artifact.path,
        onErrorOnStream,
      );
    } else {
      await this.addFileToZip(
        zipfile,
        artifact,
        rootPath,
        artifact.path,
        onErrorOnStream,
      );
    }
  }
}
