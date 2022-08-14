/**
 * The interface to represents options to customize running this library in headless mode.
 */
export interface HeadlessOptions {
  /**
   * The directory to pack the node modules
   *
   * @example ./
   */
  dir: string;

  /**
   * The files you want to include with the node_modules
   *
   * @example ['dist', 'index.js]
   * @default []
   */
  include?: string[];

  /**
   * The file extensions you want to exclude from node_modules,
   * this option dosn't not affect files outside node_modules.
   *
   * @example ['.json', '.d.ts']
   * @default {@link import('./extensions').defaultIgnoredFileExtensions}
   */
  ignoreFileExt?: string[];

  /**
   * By default, we append {@link import('./extensions').defaultIgnoredFileExtensions}
   * with the extensions you provide, but if you want to include some extension that is listed
   * inside {@link import('./extensions').defaultIgnoredFileExtensions}, you should enable
   * this flag.
   *
   * It's highly recommended you keep this flag disabled.
   */
  disableDefaultIgnoreFileExt?: boolean;

  /**
   * The node_modules paths you want to include inside your zip file.
   * For example, you have some dependency that was marked as dev dependency wrong,
   * so you want to include that dependency, just set: `['my-dependency']`.
   * This will be turned into `node_modules/my-dependency` and any file starting in this
   * path will be included.
   *
   * @example ['my-dependency']
   * @default []
   */
  includeNodePath?: string[];

  /**
   * This flag is oposite of {@link includeNodePath}, with this flag you can remove unwanted
   * node_module paths, like `typeorm/browser` which is included when you zip our dependencies
   * even with `npm prune --production`.
   *
   * @example ['typeorm/browser']
   * @default []
   */
  ignoreNodePath?: string[];

  /**
   * Tells if we should include production dependencies.
   *
   * @default true
   */
  prod?: boolean;

  /**
   * Tells if we should include development dependencies.
   *
   * @default false
   */
  dev?: boolean;

  /**
   * Tells if we should include peer dependencies.
   *
   * @default false
   */
  peer?: boolean;

  /**
   * Tells if we should include optional dependencies.
   *
   * @default false
   */
  optional?: boolean;

  /**
   * The output path for the zip file.
   *
   * @example ./some/path
   * @default ./
   */
  outputPath?: string;

  /**
   * The output filename for the zip.
   *
   * If you choose some name ending with .tar.gz, the library will compress with tar instead gzip.
   *
   * @example result.zip or result.tar.gz
   * @default deploy.zip
   */
  outputFile?: string;

  /**
   * Pass all .js files to uglify to reduce the file size.
   *
   * @default false
   */
  uglify?: boolean;
}
