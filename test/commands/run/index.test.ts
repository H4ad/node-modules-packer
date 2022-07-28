import { existsSync } from 'fs';
import { join } from 'path';
import { expect } from '@oclif/test';
import Run from '../../../src/commands/run';
import MockFsFactory from '../../mockfs/mockfs.factory';
import { fsTest } from '../../mockfs/test';
import { getUnzipedFilesInMap } from '../../mockfs/unzip';

describe('when pack is called', () => {
  describe('with only project folder', () => {
    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', MockFsFactory.DIR_PROJECT])
      .it(
        'should generate deploy.zip with only production dependencies',
        async ctx => {
          expect(ctx.stderr).to.be.empty;

          const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
          const createdTheDeployZip = existsSync(outputFilePath);

          expect(createdTheDeployZip).to.be.eq(true);

          const mapFiles = await getUnzipedFilesInMap(outputFilePath);
          const mapFileKeys = [...mapFiles.keys()];

          expect(
            mapFileKeys.every(
              mapFile =>
                !mapFile.startsWith('node_modules/is-string') &&
                !mapFile.startsWith('node_modules/kind-of') &&
                !mapFile.startsWith('node_modules/is-plain-object'),
            ),
          ).to.be.true;
        },
      );

    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', '--dev', MockFsFactory.DIR_PROJECT])
      .it('should generate deploy.zip with dev dependencies', async ctx => {
        expect(ctx.stderr).to.be.empty;

        const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
        const createdTheDeployZip = existsSync(outputFilePath);

        expect(createdTheDeployZip).to.be.eq(true);

        const mapFiles = await getUnzipedFilesInMap(outputFilePath);
        const mapFileKeys = [...mapFiles.keys()];

        expect(
          mapFileKeys.every(
            mapFile =>
              !mapFile.startsWith('node_modules/kind-of') &&
              !mapFile.startsWith('node_modules/is-plain-object'),
          ),
        ).to.be.true;
      });

    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', '--peer', MockFsFactory.DIR_PROJECT])
      .it('should generate deploy.zip with peer dependencies', async ctx => {
        expect(ctx.stderr).to.be.empty;

        const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
        const createdTheDeployZip = existsSync(outputFilePath);

        expect(createdTheDeployZip).to.be.eq(true);

        const mapFiles = await getUnzipedFilesInMap(outputFilePath);
        const mapFileKeys = [...mapFiles.keys()];

        expect(
          mapFileKeys.every(
            mapFile => !mapFile.startsWith('node_modules/is-string'),
          ),
        ).to.be.true;
      });

    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', '--optional', MockFsFactory.DIR_PROJECT])
      .it(
        'should generate deploy.zip with optional dependencies',
        async ctx => {
          expect(ctx.stderr).to.be.empty;

          const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
          const createdTheDeployZip = existsSync(outputFilePath);

          expect(createdTheDeployZip).to.be.eq(true);

          const mapFiles = await getUnzipedFilesInMap(outputFilePath);
          const mapFileKeys = [...mapFiles.keys()];

          expect(
            mapFileKeys.every(
              mapFile =>
                !mapFile.startsWith('node_modules/is-string') &&
                !mapFile.startsWith('node_modules/is-plain-object'),
            ),
          ).to.be.true;
        },
      );
  });

  describe('with --json flag', () => {
    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', '--json', MockFsFactory.DIR_PROJECT])
      .it('should output success in json', ctx => {
        expect(ctx.stdout).to.contain('"status": "success"');
        expect(ctx.stdout).to.contain('"size":');
        expect(ctx.stdout).to.contain('"path": "');
        expect(ctx.stdout).to.contain('"file": "deploy.zip"');

        const createdTheDeployZip = existsSync(
          join(MockFsFactory.DIR_PROJECT, 'deploy.zip'),
        );

        expect(createdTheDeployZip).to.be.eq(true);
      });

    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', '--json', MockFsFactory.DIR_NO_NODE_MODULES])
      .it('should output error in json', ctx => {
        expect(ctx.stdout).to.contain('"status": "error"');
        expect(ctx.stdout).to.contain('"message": "');
        expect(ctx.stdout).to.contain('"code": "');
        expect(ctx.stdout).to.contain('"sugestions": [');
      });
  });

  describe('with --include flag', () => {
    fsTest
      .stdout()
      .stderr()
      .fsmockCommand([
        'run',
        MockFsFactory.DIR_PROJECT,
        '-i',
        './src',
        '-i',
        '.gitignore',
      ])
      .it('should generate deploy.zip with included files', async ctx => {
        expect(ctx.stderr).to.be.empty;

        const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
        const createdTheDeployZip = existsSync(outputFilePath);

        expect(createdTheDeployZip).to.be.eq(true);

        const mapFiles = await getUnzipedFilesInMap(outputFilePath);

        expect(mapFiles.has('src/index.js')).to.be.true;
        expect(mapFiles.has('.gitignore')).to.be.true;
      });

    fsTest
      .stdout()
      .stderr()
      .fsmockCommand([
        'run',
        MockFsFactory.DIR_PROJECT,
        '-i',
        'dont-exist.test',
      ])
      .catch(err => {
        expect(err.message).to.contain('ENOENT: no such file');
      })
      .it('should throw error when include file that not exist');
  });

  describe('with --ignore-file-ext flag', () => {
    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', MockFsFactory.DIR_PROJECT])
      .it('should have json files inside node_modules', async ctx => {
        expect(ctx.stderr).to.be.empty;

        const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
        const mapFiles = await getUnzipedFilesInMap(outputFilePath);

        expect(mapFiles.has('node_modules/is-date-object/package.json')).to.be
          .true;
      });

    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', MockFsFactory.DIR_PROJECT, '-e', '.json'])
      .it(
        'should generate deploy.zip without excluded extension files',
        async ctx => {
          expect(ctx.stderr).to.be.empty;

          const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
          const mapFiles = await getUnzipedFilesInMap(outputFilePath);

          expect(mapFiles.has('node_modules/is-date-object/package.json')).to
            .not.be.true;
        },
      );
  });

  describe('with --disable-default-ignore-file-ext flag', () => {
    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', MockFsFactory.DIR_PROJECT])
      .it(
        'should generate zip excluding default extensions files',
        async ctx => {
          expect(ctx.stderr).to.be.empty;

          const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
          const mapFiles = await getUnzipedFilesInMap(outputFilePath);

          expect(mapFiles.has('node_modules/is-date-object/README.md')).to.be
            .false;
        },
      );

    fsTest
      .stdout()
      .stderr()
      .fsmockCommand([
        'run',
        MockFsFactory.DIR_PROJECT,
        '--disable-default-ignore-file-ext',
      ])
      .it(
        'should generate deploy.zip without default excluded extension files',
        async ctx => {
          expect(ctx.stderr).to.be.empty;

          const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
          const mapFiles = await getUnzipedFilesInMap(outputFilePath);

          expect(mapFiles.has('node_modules/is-date-object/README.md')).to.be
            .true;
        },
      );
  });

  describe('with --include-node-path flag', () => {
    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', MockFsFactory.DIR_PROJECT])
      .it('should generate zip including without kind-of', async ctx => {
        expect(ctx.stderr).to.be.empty;

        const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
        const mapFiles = await getUnzipedFilesInMap(outputFilePath);
        const mapFileKeys = [...mapFiles.keys()];

        expect(
          mapFileKeys.every(
            mapFile => !mapFile.startsWith('node_modules/kind-of'),
          ),
        ).to.be.true;
      });

    fsTest
      .stdout()
      .stderr()
      .fsmockCommand([
        'run',
        MockFsFactory.DIR_PROJECT,
        '--include-node-path',
        'kind-of',
      ])
      .it(
        'should generate deploy.zip with kind-of dependency included',
        async ctx => {
          expect(ctx.stderr).to.be.empty;

          const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
          const mapFiles = await getUnzipedFilesInMap(outputFilePath);
          const mapFileKeys = [...mapFiles.keys()];

          expect(
            mapFileKeys.some(mapFile =>
              mapFile.startsWith('node_modules/kind-of'),
            ),
          ).to.be.true;
        },
      );
  });

  describe('with --ignore-node-path flag', () => {
    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', MockFsFactory.DIR_PROJECT])
      .it('should generate zip including has-symbols', async ctx => {
        expect(ctx.stderr).to.be.empty;

        const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
        const mapFiles = await getUnzipedFilesInMap(outputFilePath);
        const mapFileKeys = [...mapFiles.keys()];

        expect(
          mapFileKeys.some(mapFile =>
            mapFile.startsWith('node_modules/has-symbols'),
          ),
        ).to.be.true;
      });

    fsTest
      .stdout()
      .stderr()
      .fsmockCommand([
        'run',
        MockFsFactory.DIR_PROJECT,
        '--ignore-node-path',
        'has-symbols',
      ])
      .it(
        'should generate deploy.zip without default excluded node path',
        async ctx => {
          expect(ctx.stderr).to.be.empty;

          const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
          const mapFiles = await getUnzipedFilesInMap(outputFilePath);
          const mapFileKeys = [...mapFiles.keys()];

          expect(
            mapFileKeys.every(
              mapFile => !mapFile.startsWith('node_modules/has-symbols'),
            ),
          ).to.be.true;
        },
      );
  });

  describe('with --output-file flag', () => {
    fsTest
      .stdout()
      .stderr()
      .fsmockCommand([
        'run',
        '--output-file',
        'result.zip',
        MockFsFactory.DIR_PROJECT,
      ])
      .it('should generate result.zip', ctx => {
        expect(ctx.stderr).to.be.empty;

        const createdTheDeployZip = existsSync(
          join(MockFsFactory.DIR_PROJECT, 'result.zip'),
        );

        expect(createdTheDeployZip).to.be.eq(true);
      });

    fsTest
      .stdout()
      .stderr()
      .fsmockCommand([
        'run',
        '--output-file',
        'result.ts',
        MockFsFactory.DIR_PROJECT,
      ])
      .catch(err => {
        expect(err.message).to.contain('Invalid output file extension');
      })
      .it('should generate error with result.ts');
  });

  describe('with --output-path flag', () => {
    fsTest
      .stdout()
      .stderr()
      .fsmockCommand([
        'run',
        '--output-path',
        './result',
        MockFsFactory.DIR_PROJECT,
      ])
      .it('should generate deploy.zip inside result folder', ctx => {
        expect(ctx.stderr).to.be.empty;

        const createdTheDeployZip = existsSync(
          join(MockFsFactory.DIR_PROJECT, 'result/deploy.zip'),
        );

        expect(createdTheDeployZip).to.be.eq(true);
      });
  });

  describe('with --quiet flag', () => {
    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', MockFsFactory.DIR_PROJECT, '-q'])
      .it('should log nothing', ctx => {
        expect(ctx.stdout).to.be.empty;
        expect(ctx.stderr).to.be.empty;

        const outputFilePath = join(MockFsFactory.DIR_PROJECT, 'deploy.zip');
        const createdTheDeployZip = existsSync(outputFilePath);

        expect(createdTheDeployZip).to.be.eq(true);
      });
  });

  describe('with invalid lock file', () => {
    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', MockFsFactory.DIR_NO_PACKAGE_LOCK_FILE])
      .catch(err => {
        expect(err.message).to.contain('Invalid package-lock.json');
      })
      .it('should throw error if could not find package-lock.json');
  });

  describe('with invalid node modules', () => {
    fsTest
      .stdout()
      .stderr()
      .fsmockCommand(['run', MockFsFactory.DIR_NO_NODE_MODULES])
      .catch(err => {
        expect(err.message).to.contain('Invalid Node Modules');
      })
      .it('should throw error if could not find node_modules');
  });

  describe('with headless', () => {
    fsTest
      // @ts-ignore
      .stub(Run, 'run', (args: any) => args)
      .it('should generate correctly the default', async () => {
        const result = await Run.headless({
          dir: './',
        });

        expect(result).to.be.eql(['./']);
      });

    fsTest
      // @ts-ignore
      .stub(Run, 'run', (args: any) => args)
      .it('should generate correctly all flags', async () => {
        const result = await Run.headless({
          dir: './',
          include: ['dist'],
          includeNodePath: ['typeorm/browser'],
          ignoreNodePath: ['aws-sdk'],
          ignoreFileExt: ['.json'],
          disableDefaultIgnoreFileExt: true,
          prod: false,
          dev: true,
          peer: false,
          optional: false,
          outputPath: './test',
          outputFile: 'result.zip',
        });

        expect(result).to.be.eql([
          './',
          '-i',
          'dist',
          '-e',
          '.json',
          '--disable-default-ignore-file-ext',
          '--include-node-path',
          'typeorm/browser',
          '--ignore-node-path',
          'aws-sdk',
          '--no-prod',
          '--dev',
          '--no-peer',
          '--no-optional',
          '--output-path',
          './test',
          '--output-file',
          'result.zip',
        ]);
      });
  });
});
