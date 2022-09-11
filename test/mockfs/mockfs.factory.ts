import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import mockfs from 'mock-fs';

const node_modules = () => {
  const baseNodePath = join(__dirname, '..', 'example', 'node_modules');
  const readFile = file => readFileSync(join(baseNodePath, file));

  return mockfs.directory({
    items: {
      '.package-lock.json': mockfs.file({
        content: '',
      }),
      'has-symbols': mockfs.directory({
        items: {
          'CHANGELOG.md': mockfs.file({
            content: readFile('has-symbols/CHANGELOG.md'),
          }),
          'index.js': mockfs.file({
            content: readFile('has-symbols/index.js'),
          }),
          LICENSE: mockfs.file({
            content: readFile('has-symbols/LICENSE'),
          }),
          'package.json': mockfs.file({
            content: '{}',
          }),
          'README.md': mockfs.file({
            content: readFile('has-symbols/README.md'),
          }),
          'shams.js': mockfs.file({
            content: readFile('has-symbols/shams.js'),
          }),
        },
      }),
      'has-tostringtag': mockfs.directory({
        items: {
          'CHANGELOG.md': mockfs.file({
            content: readFile('has-tostringtag/CHANGELOG.md'),
          }),
          'index.js': mockfs.file({
            content: readFile('has-tostringtag/index.js'),
          }),
          LICENSE: mockfs.file({
            content: readFile('has-tostringtag/LICENSE'),
          }),
          'package.json': mockfs.file({
            content: '{}',
          }),
          'README.md': mockfs.file({
            content: readFile('has-tostringtag/README.md'),
          }),
          'shams.js': mockfs.file({
            content: readFile('has-tostringtag/shams.js'),
          }),
        },
      }),
      'is-date-object': mockfs.directory({
        items: {
          'CHANGELOG.md': mockfs.file({
            content: '',
          }),
          'index.js': mockfs.file({
            content: '',
          }),
          LICENSE: mockfs.file({
            content: '',
          }),
          'package.json': mockfs.file({
            content: '',
          }),
          'README.md': mockfs.file({
            content: '',
          }),
        },
      }),
      'is-plain-object': mockfs.directory({
        items: {
          'is-plain-object.d.ts': mockfs.file({
            content: '',
          }),
          dist: mockfs.directory({
            items: {
              'is-plain-object.js': mockfs.file({
                content: '',
              }),
              'is-plain-object.mjs': mockfs.file({
                content: '',
              }),
            },
          }),
          LICENSE: mockfs.file({
            content: '',
          }),
          'package.json': mockfs.file({
            content: '',
          }),
          'README.md': mockfs.file({
            content: '',
          }),
        },
      }),
      'is-string': mockfs.directory({
        items: {
          'CHANGELOG.md': mockfs.file({
            content: readFile('is-string/CHANGELOG.md'),
          }),
          'index.js': mockfs.file({
            content: readFile('is-string/index.js'),
          }),
          LICENSE: mockfs.file({
            content: readFile('is-string/LICENSE'),
          }),
          'package.json': mockfs.file({
            content: '{}',
          }),
          'README.md': mockfs.file({
            content: readFile('is-string/README.md'),
          }),
        },
      }),
      'kind-of': mockfs.directory({
        items: {
          'CHANGELOG.md': mockfs.file({
            content: readFile('kind-of/CHANGELOG.md'),
          }),
          'index.js': mockfs.file({
            content: readFile('kind-of/index.js'),
          }),
          LICENSE: mockfs.file({
            content: readFile('kind-of/LICENSE'),
          }),
          'package.json': mockfs.file({
            content: '{}',
          }),
          'README.md': mockfs.file({
            content: readFile('kind-of/README.md'),
          }),
        },
      }),
      '@h4ad': mockfs.directory({
        items: {
          'serverless-adapter': mockfs.directory({
            items: {
              'README.md': mockfs.file({
                content: readFile('@h4ad/serverless-adapter/README.md'),
              }),
              lib: mockfs.directory({
                items: {
                  'index.js': mockfs.file({
                    content: readFile('@h4ad/serverless-adapter/lib/index.js'),
                  }),
                },
              }),
              LICENSE: mockfs.file({
                content: readFile('@h4ad/serverless-adapter/LICENSE'),
              }),
              'package.json': mockfs.file({
                content: '{}',
              }),
            },
          }),
        },
      }),
    },
  });
};

export default class MockFsFactory {
  static DIR_PROJECT = 'project';
  static DIR_WITH_DEPLOY_FILE = 'with_deploy_file';
  static DIR_NO_NODE_MODULES = 'no_node_modules';
  static DIR_NO_PACKAGE_LOCK_FILE = 'no_package_lock_file';
  static DIR_EMPTY = 'dir_empty';
  static DIR_WITH_PROTECTED_FILE = 'dir_with_protected_file';
  static DIR_WITH_PROTECTED_FILE_INSIDE_FOLDER =
    'dir_with_protected_file_inside_folder';
  static DIR_OUTPUT_PROTECTED = 'dir_output_protected';

  static createMockFs() {
    const defaultLoadOptions = {
      lazy: true,
      recursive: true,
    };

    mockfs({
      'package.json': mockfs.load(
        resolve(__dirname, '../../package.json'),
        defaultLoadOptions,
      ),
      'tsconfig.json': mockfs.load(
        resolve(__dirname, '../../tsconfig.json'),
        defaultLoadOptions,
      ),
      node_modules: mockfs.directory({
        items: {
          '@oclif': mockfs.load(
            resolve(__dirname, '../../node_modules/@oclif'),
          ),
          cardinal: mockfs.load(
            resolve(__dirname, '../../node_modules/cardinal'),
          ),
          redeyed: mockfs.load(
            resolve(__dirname, '../../node_modules/redeyed'),
          ),
          ansicolors: mockfs.load(
            resolve(__dirname, '../../node_modules/ansicolors'),
          ),
          esbuild: mockfs.load(
            resolve(__dirname, '../../node_modules/esbuild'),
          ),
          // to make esbuild work
          'esbuild-linux-64': mockfs.load(
            resolve(__dirname, '../../node_modules/esbuild-linux-64'),
          ),
        },
      }),
      src: mockfs.load(resolve(__dirname, '../../src'), defaultLoadOptions),
      [MockFsFactory.DIR_PROJECT]: {
        'package.json': mockfs.load(
          resolve(__dirname, '../example/package.json'),
          defaultLoadOptions,
        ),
        '.gitignore': mockfs.load(
          resolve(__dirname, '../example/.gitignore'),
          defaultLoadOptions,
        ),
        'package-lock.json': mockfs.load(
          resolve(__dirname, '../example/package-lock.json'),
          defaultLoadOptions,
        ),
        node_modules: node_modules(),
        src: mockfs.load(
          resolve(__dirname, '../example/src'),
          defaultLoadOptions,
        ),
        dist: mockfs.load(
          resolve(__dirname, '../example/dist'),
          defaultLoadOptions,
        ),
      },
      [MockFsFactory.DIR_WITH_DEPLOY_FILE]: {
        'package.json': mockfs.load(
          resolve(__dirname, '../example/package.json'),
          defaultLoadOptions,
        ),
        '.gitignore': mockfs.load(
          resolve(__dirname, '../example/.gitignore'),
          defaultLoadOptions,
        ),
        'package-lock.json': mockfs.load(
          resolve(__dirname, '../example/package-lock.json'),
          defaultLoadOptions,
        ),
        'deploy.zip': mockfs.file({
          content: 'teste',
        }),
        node_modules: node_modules(),
        src: mockfs.load(
          resolve(__dirname, '../example/src'),
          defaultLoadOptions,
        ),
        dist: mockfs.load(
          resolve(__dirname, '../example/dist'),
          defaultLoadOptions,
        ),
      },
      [MockFsFactory.DIR_NO_NODE_MODULES]: {
        'package.json': mockfs.load(
          resolve(__dirname, '../example/package.json'),
          defaultLoadOptions,
        ),
        'package-lock.json': mockfs.load(
          resolve(__dirname, '../example/package-lock.json'),
          defaultLoadOptions,
        ),
        src: mockfs.load(
          resolve(__dirname, '../example/src'),
          defaultLoadOptions,
        ),
        dist: mockfs.load(
          resolve(__dirname, '../example/dist'),
          defaultLoadOptions,
        ),
      },
      [MockFsFactory.DIR_NO_PACKAGE_LOCK_FILE]: {
        'package.json': mockfs.load(
          resolve(__dirname, '../example/package.json'),
          defaultLoadOptions,
        ),
        node_modules: node_modules(),
        src: mockfs.load(
          resolve(__dirname, '../example/src'),
          defaultLoadOptions,
        ),
        dist: mockfs.load(
          resolve(__dirname, '../example/dist'),
          defaultLoadOptions,
        ),
      },
      [MockFsFactory.DIR_EMPTY]: {
        empty: mockfs.directory(),
      },
      [MockFsFactory.DIR_WITH_PROTECTED_FILE]: {
        'protected.js': mockfs.file({
          content: 'protected',
          mode: 0,
        }),
      },
      [MockFsFactory.DIR_WITH_PROTECTED_FILE_INSIDE_FOLDER]: {
        protected: mockfs.directory({
          items: {
            'protected.js': mockfs.file({
              content: 'protected',
              mode: 0,
            }),
          },
        }),
      },
      [MockFsFactory.DIR_OUTPUT_PROTECTED]: mockfs.directory({
        items: {},
        mode: 0,
      }),
    });
  }

  static resetMockFs() {
    mockfs.restore();
  }
}
