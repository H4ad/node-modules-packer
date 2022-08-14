import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';
import { afterEach } from 'mocha';
import { expect } from 'chai';
import { ZipFile } from 'yazl';
import { FasterZip } from '../../../src/common/zip';
import MockFsFactory from '../../mockfs/mockfs.factory';
import { getUnzipedFilesInMap } from '../../mockfs/unzip';

describe(ZipFile.name, () => {
  beforeEach(() => {
    MockFsFactory.createMockFs();
  });

  afterEach(() => {
    MockFsFactory.resetMockFs();
  });

  describe('should zip correctly', () => {
    it('when passing folder', async () => {
      const zip = new FasterZip();

      await zip.run(MockFsFactory.DIR_PROJECT, './zip-file.zip', [
        {
          path: join(MockFsFactory.DIR_PROJECT, 'node_modules'),
          name: 'node_modules',
          type: 'directory',
        },
        {
          path: join(MockFsFactory.DIR_PROJECT, 'src'),
          name: 'src',
          type: 'directory',
        },
      ]);

      expect(fs.existsSync('zip-file.zip')).to.be.true;
    });

    it('when passing file', async () => {
      const zip = new FasterZip();

      await zip.run(MockFsFactory.DIR_PROJECT, './zip-file.zip', [
        {
          path: join(MockFsFactory.DIR_PROJECT, 'package.json'),
          name: 'test',
          type: 'file',
        },
      ]);

      expect(fs.existsSync('zip-file.zip')).to.be.true;

      const outputFilePath = join('zip-file.zip');
      const mapFiles = await getUnzipedFilesInMap(outputFilePath);

      expect(mapFiles.has('package.json')).to.be.true;
    });

    it('when pass with remapping path', async () => {
      const zip = new FasterZip();

      await zip.run(MockFsFactory.DIR_PROJECT, './zip-file.zip', [
        {
          path: path.join(MockFsFactory.DIR_PROJECT, 'package.json'),
          metadataPath: 'package-lock.json',
          name: 'test',
          type: 'file',
        },
        {
          path: path.join(MockFsFactory.DIR_PROJECT, 'src'),
          metadataPath: 'dist',
          name: 'test',
          type: 'directory',
        },
      ]);

      expect(fs.existsSync('zip-file.zip')).to.be.true;

      const outputFilePath = join('zip-file.zip');
      const mapFiles = await getUnzipedFilesInMap(outputFilePath);

      expect(mapFiles.has('package-lock.json')).to.be.true;
      expect(mapFiles.has('dist/index.js')).to.be.true;
    });

    it('when ignore file', async () => {
      const zip = new FasterZip();

      await zip.run(MockFsFactory.DIR_PROJECT, './zip-file.zip', [
        {
          path: path.join(MockFsFactory.DIR_PROJECT, 'src'),
          name: 'test',
          type: 'directory',
          shouldIgnore: () => true,
        },
      ]);

      expect(fs.existsSync('zip-file.zip')).to.be.true;

      const outputFilePath = join('zip-file.zip');
      const mapFiles = await getUnzipedFilesInMap(outputFilePath);

      expect(mapFiles.size).to.be.eq(0);
    });

    it('when dir is empty', async () => {
      const zip = new FasterZip();

      await zip.run(MockFsFactory.DIR_EMPTY, './zip-file.zip', [
        {
          path: path.join(MockFsFactory.DIR_EMPTY, 'empty'),
          name: 'test',
          type: 'directory',
        },
      ]);

      expect(fs.existsSync('zip-file.zip')).to.be.true;

      const outputFilePath = join('zip-file.zip');
      const mapFiles = await getUnzipedFilesInMap(outputFilePath);

      expect(mapFiles.size).to.be.eq(0);
    });
  });

  describe('should handle correctly errors', () => {
    it('on fsreaddir passing directory', async () => {
      const zip = new FasterZip();
      let error: Error | undefined;

      await zip
        .run(MockFsFactory.DIR_PROJECT, './output.zip', [
          {
            path: './not-exist',
            name: 'test',
            type: 'directory',
          },
        ])
        .catch(err => {
          error = err;
        });

      expect(error?.message).to.contain('ENOENT, no such file or directory');
    });

    it('on fsreaddir passing file', async () => {
      const zip = new FasterZip();
      let error: Error | undefined;

      await zip
        .run(MockFsFactory.DIR_PROJECT, './output.zip', [
          {
            path: './not-exist',
            name: 'test',
            type: 'directory',
          },
        ])
        .catch(err => {
          error = err;
        });

      expect(error?.message).to.contain('ENOENT, no such file or directory');
    });

    it('on zip artifact when pass wrong type', async () => {
      const zip = new FasterZip();
      let error: Error | undefined;

      await zip
        .run(MockFsFactory.DIR_PROJECT, './zip-file.zip', [
          {
            path: path.join(MockFsFactory.DIR_PROJECT, 'package.json'),
            name: 'test',
            type: 'directory',
          },
        ])
        .catch(err => {
          error = err;
        });

      expect(error).to.not.be.undefined;
      expect(error?.message).to.contain('ENOTDIR, not a directory');
    });

    it('when file is protected', async () => {
      const zip = new FasterZip();
      let error: Error | undefined;

      await zip
        .run(MockFsFactory.DIR_WITH_PROTECTED_FILE, './zip-file.zip', [
          {
            path: path.join(
              MockFsFactory.DIR_WITH_PROTECTED_FILE,
              'protected.js',
            ),
            name: 'test',
            type: 'file',
          },
        ])
        .catch(err => {
          error = err;
        });

      expect(error).to.not.be.undefined;
      expect(error?.message).to.contain('EACCES, permission denied');
    });

    it('when file is protected inside folder', async () => {
      const zip = new FasterZip();
      let error: Error | undefined;

      await zip
        .run(
          MockFsFactory.DIR_WITH_PROTECTED_FILE_INSIDE_FOLDER,
          './zip-file.zip',
          [
            {
              path: path.join(
                MockFsFactory.DIR_WITH_PROTECTED_FILE_INSIDE_FOLDER,
                'protected',
              ),
              name: 'test',
              type: 'directory',
            },
          ],
        )
        .catch(err => {
          error = err;
        });

      expect(error).to.not.be.undefined;
      expect(error?.message).to.contain('EACCES, permission denied');
    });

    it('when output folder is protected', async () => {
      const zip = new FasterZip();
      let error: Error | undefined;

      await zip
        .run(
          MockFsFactory.DIR_PROJECT,
          join(MockFsFactory.DIR_OUTPUT_PROTECTED, './zip-file.zip'),
          [
            {
              path: path.join(MockFsFactory.DIR_PROJECT, 'package.json'),
              name: 'test',
              type: 'file',
            },
          ],
        )
        .catch(err => {
          error = err;
        });

      expect(error).to.not.be.undefined;
      expect(error?.message).to.contain('EACCES, permission denied');
    });

    it('when passing wrong remapping', async () => {
      const zip = new FasterZip();
      let error: Error | undefined;

      await zip
        .run(MockFsFactory.DIR_PROJECT, './zip-file.zip', [
          {
            path: path.join(MockFsFactory.DIR_PROJECT, 'package.json'),
            metadataPath: '../package.json',
            name: 'test',
            type: 'file',
          },
        ])
        .catch(err => {
          error = err;
        });

      expect(error).to.not.be.undefined;
      expect(error?.message).to.contain('invalid relative path');
    });
  });
});
