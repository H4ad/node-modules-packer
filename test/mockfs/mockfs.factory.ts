import { resolve } from 'path';
import mockfs from 'mock-fs';

export default class MockFsFactory {
  static DIR_PROJECT = 'project';
  static DIR_NO_NODE_MODULES = 'no_node_modules';
  static DIR_NO_PACKAGE_LOCK_FILE = 'no_package_lock_file';

  static createMockFs() {
    mockfs({
      'package.json': mockfs.load(resolve(__dirname, '../../package.json')),
      'tsconfig.json': mockfs.load(resolve(__dirname, '../../tsconfig.json')),
      node_modules: mockfs.load(resolve(__dirname, '../../node_modules')),
      src: mockfs.load(resolve(__dirname, '../../src')),
      [MockFsFactory.DIR_PROJECT]: {
        'package.json': mockfs.load(
          resolve(__dirname, '../example/package.json'),
        ),
        '.gitignore': mockfs.load(resolve(__dirname, '../example/.gitignore')),
        'package-lock.json': mockfs.load(
          resolve(__dirname, '../example/package-lock.json'),
        ),
        node_modules: mockfs.load(
          resolve(__dirname, '../example/node_modules'),
        ),
        src: mockfs.load(resolve(__dirname, '../example/src')),
        dist: mockfs.load(resolve(__dirname, '../example/dist')),
      },
      [MockFsFactory.DIR_NO_NODE_MODULES]: {
        'package.json': mockfs.load(
          resolve(__dirname, '../example/package.json'),
        ),
        'package-lock.json': mockfs.load(
          resolve(__dirname, '../example/package-lock.json'),
        ),
        src: mockfs.load(resolve(__dirname, '../example/src')),
        dist: mockfs.load(resolve(__dirname, '../example/dist')),
      },
      [MockFsFactory.DIR_NO_PACKAGE_LOCK_FILE]: {
        'package.json': mockfs.load(
          resolve(__dirname, '../example/package.json'),
        ),
        node_modules: mockfs.load(
          resolve(__dirname, '../example/node_modules'),
        ),
        src: mockfs.load(resolve(__dirname, '../example/src')),
        dist: mockfs.load(resolve(__dirname, '../example/dist')),
      },
    });
  }

  static resetMockFs() {
    mockfs.restore();
  }
}
